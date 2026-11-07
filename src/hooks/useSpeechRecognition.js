import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getListenChannels, createChunkedRecorder, stopStreamTracks, transcribeChunk,
  isSilenceHallucination, deduplicateRepeatedPhrases, looksLikeQuestion,
} from '../services/speechService';
import { createUtteranceAssembler, createQuestionDeduper } from '../lib/questionDetector';
import { createOrderedResults } from '../lib/orderedResults';
import { createLiveTranscriber, getSttMode, liveReconnectDelay } from '../services/liveTranscriber';
import { markCaptureStarted, traceQuestion } from '../lib/latencyTrace';

// Transcript label sent to the answer API. "Candidate:" is what the backend's
// "already said" logic keys on, so the local mic must use exactly that.
const SPEAKER_LABELS = { interviewer: 'Interviewer', you: 'Candidate', unknown: 'Speaker' };
const MAX_CONVERSATION_LINES = 40;
// A speaker's transcript line is saved after this long without new words.
const TRANSCRIPT_LINE_IDLE_MS = 4000;
// Scripts that are never English (the backend's NON_LATIN_SCRIPT_REGEX plus
// Japanese/CJK extras). ऀ-෿ is every Indian script: Bengali was
// missing, so misheard audio could show up, or be asked, in Bengali.
const NON_ENGLISH_SCRIPT = /[֐-׿؀-ۿݐ-ݿऀ-෿฀-๿Ѐ-ӿ぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ가-힯]/;
// Chunks are 1.8s but a transcription can take longer; allow two in flight per
// channel instead of dropping audio, and apply results in recorded order. Kept
// at 2 so two channels plus two answer streams fit the browser's 6-connection
// per-origin limit — beyond it, uploads silently queue behind answer streams.
const MAX_IN_FLIGHT_PER_CHANNEL = 2;
// Turn-taking. A chunk ends after half a second of quiet, which is shorter
// than a normal thinking pause mid-question, so the first half of a question
// ("Tell me about… your last project") used to be answered on its own. Text
// is now held until the speaker has really finished: a question ending in "?"
// goes as soon as they are not talking; anything else waits TURN_END_MS more
// for them to continue. MAX_HOLD_MS stops a noisy mic holding forever.
const TURN_END_MS = 550;
// Live transcription ends a stretch of speech after only 250 ms of quiet (see
// liveTranscriber.js), so text that is not yet a finished question waits this
// long for the speaker to go on; the voice detector is checked again before
// it is answered. A question ending in "?" is answered without this wait.
const LIVE_TURN_END_MS = 400;
// A question ending in "?" is answered once the speaker has been quiet this
// long. A short thinking pause mid-question also ends a stretch of speech,
// and the transcriber can punctuate that fragment as a question ("What is the
// difference?" before "...between let and const"); if they go on talking
// within this time, the fragment is joined with the rest instead.
const LIVE_QUESTION_QUIET_MS = 450;
const TURN_RECHECK_MS = 250;
const MAX_HOLD_MS = 6000;

// Both sides' questions are answered. From the candidate's own mic only real
// questions count — their statements are usually them speaking an answer.
function onlyQuestionsFrom(speaker, questions) {
  return speaker === 'you' ? questions.filter((q) => looksLikeQuestion(q)) : questions;
}

function newChannelState(applyInOrder) {
  return {
    assembler: createUtteranceAssembler(),
    ordered: createOrderedResults(applyInOrder),
    inFlight: 0,
    recorder: null,
    turnTimer: null,
    heldSince: 0,
    // Timings of the latest finished live turn (see lib/latencyTrace).
    lastTurnTiming: null,
    liveFailures: 0,
    reconnectTimer: null,
  };
}

function clearTurnTimer(st) {
  if (st.turnTimer) clearTimeout(st.turnTimer);
  st.turnTimer = null;
}

function clearChannelTimers(st) {
  clearTurnTimer(st);
  if (st.reconnectTimer) clearTimeout(st.reconnectTimer);
  st.reconnectTimer = null;
}

let questionSeq = 0;

/**
 * Listens on mic and/or meeting audio, transcribes each source separately in
 * rolling chunks, and keeps a speaker-labelled conversation log. Calls
 * onQuestionDetected(text) when the interviewer (or an unattributed single
 * source) asks something; the candidate's own speech is context only.
 */
export function useSpeechRecognition({ sessionId, source = 'both', language = 'en', onQuestionDetected, onToast } = {}) {
  const [listening, setListening] = useState(false);
  const [elapsedText, setElapsedText] = useState('00:00');
  const [transcriptChips, setTranscriptChips] = useState([]);
  // Most recent words actually transcribed (question or not), so the user can
  // see at a glance whether their voice is being picked up at all.
  const [lastHeard, setLastHeard] = useState('');
  const [captureWarning, setCaptureWarning] = useState('');
  const [transcriptionError, setTranscriptionError] = useState('');

  const channelsRef = useRef([]);
  const channelsSourceRef = useRef(null);
  const recordersRef = useRef([]);
  const channelStateRef = useRef(new Map());
  const conversationRef = useRef([]);
  const startingRef = useRef(false);
  const recordingRef = useRef(false);
  const elapsedTimerRef = useRef(null);
  const elapsedSecsRef = useRef(0);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const languageRef = useRef(language);
  languageRef.current = language;
  const onQuestionDetectedRef = useRef(onQuestionDetected);
  onQuestionDetectedRef.current = onQuestionDetected;
  const consecutiveFailuresRef = useRef(0);
  // 'live' (words stream in while people talk) or 'clips', from the backend's STT_MODE.
  const sttModeRef = useRef('clips');

  const applyResultRef = useRef(() => {});
  const deduperRef = useRef(null);
  if (!deduperRef.current) deduperRef.current = createQuestionDeduper();
  const nativeRecRef = useRef(null);
  const isRecognitionActiveRef = useRef(false);
  const restartNativeTimerRef = useRef(null);

  const toast = useCallback((msg) => { if (onToast) onToast(msg); }, [onToast]);

  const stateFor = (speaker) => {
    let st = channelStateRef.current.get(speaker);
    if (!st) {
      st = newChannelState((result) => applyResultRef.current(speaker, result));
      channelStateRef.current.set(speaker, st);
    }
    return st;
  };

  /* The conversation is saved to the session as it happens, so its review
   * afterwards has a transcript (the copilot used to keep it only in memory,
   * and every session showed "No transcript was recorded"). Consecutive
   * pieces from one speaker are joined into one line; a line is sent when the
   * other side speaks, after a few quiet seconds, or when listening stops.
   * Lines go out one at a time, in order. */
  const transcriptSaveRef = useRef({ pending: null, timer: null, chain: Promise.resolve() });

  const flushTranscriptLine = useCallback(() => {
    const q = transcriptSaveRef.current;
    if (q.timer) clearTimeout(q.timer);
    q.timer = null;
    const line = q.pending;
    q.pending = null;
    const sid = sessionIdRef.current;
    if (!line || !line.text.trim() || !sid || sid === 'default') return;
    q.chain = q.chain.then(() => fetch(`/api/sessions/${encodeURIComponent(sid)}/transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: line.text.trim().slice(0, 5000),
        speaker: line.speaker === 'unknown' ? undefined : line.speaker,
        is_question: line.isQuestion,
      }),
      keepalive: true,
    }).catch((err) => console.warn('[copilot] transcript line not saved', err && err.message)));
  }, []);

  const saveTranscriptText = useCallback((speaker, text) => {
    const q = transcriptSaveRef.current;
    if (q.pending && q.pending.speaker !== speaker) flushTranscriptLine();
    if (q.pending) q.pending.text = `${q.pending.text} ${text}`;
    else q.pending = { speaker, text, isQuestion: false };
    if (/\?\s*["')\]]?\s*$/.test(text)) q.pending.isQuestion = true;
    if (q.timer) clearTimeout(q.timer);
    q.timer = setTimeout(flushTranscriptLine, TRANSCRIPT_LINE_IDLE_MS);
  }, [flushTranscriptLine]);

  // Closing the copilot window still sends what is waiting.
  useEffect(() => {
    const onHide = () => flushTranscriptLine();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      flushTranscriptLine();
    };
  }, [flushTranscriptLine]);

  const appendConversation = useCallback((speaker, text) => {
    saveTranscriptText(speaker, text);
    setLastHeard(text.slice(-160));
    const log = conversationRef.current;
    const last = log[log.length - 1];
    if (last && last.speaker === speaker) {
      last.text = `${last.text} ${text}`.slice(-600);
    } else {
      log.push({ speaker, text });
      if (log.length > MAX_CONVERSATION_LINES) log.splice(0, log.length - MAX_CONVERSATION_LINES);
    }
  }, [saveTranscriptText]);

  const getConversationTranscript = useCallback(() => (
    conversationRef.current.map((l) => `${SPEAKER_LABELS[l.speaker] || 'Speaker'}: ${l.text}`).join('\n')
  ), []);

  // Each distinct question gets its own id and is handed on once; a repeat of
  // one already answered in the last 30s is skipped (its answer is on screen).
  const dispatchQuestions = useCallback((questions, speaker) => {
    for (const q of questions) {
      if (deduperRef.current.isDuplicate(q)) {
        console.info('[copilot] question skipped as repeat', { session: sessionIdRef.current, speaker, chars: q.length });
        continue;
      }
      deduperRef.current.remember(q);
      questionSeq += 1;
      const questionId = `q-${Date.now()}-${questionSeq}`;
      console.info('[copilot] question detected', { session: sessionIdRef.current, questionId, speaker, chars: q.length });
      traceQuestion(q, stateFor(speaker).lastTurnTiming);
      setTranscriptChips((prevChips) => [...prevChips.slice(-25), { text: q, isQuestion: true, speaker, id: questionId }]);
      if (onQuestionDetectedRef.current) onQuestionDetectedRef.current(q, { questionId, speaker });
    }
  }, []);

  // The speaker has gone quiet (silent/empty chunk): whatever is still held in
  // their buffer is now complete.
  const flushPendingQuestion = useCallback((speaker) => {
    const st = stateFor(speaker);
    clearTurnTimer(st);
    st.heldSince = 0;
    dispatchQuestions(onlyQuestionsFrom(speaker, st.assembler.flush()), speaker);
  }, [dispatchQuestions]);

  // Still talking: voice in the chunk being recorded now, or audio already
  // sent that has not come back yet (it may hold the rest of the question).
  const isStillSpeaking = (st) => Boolean((st.recorder && st.recorder.isSpeaking()) || st.inFlight > 0);

  // Answers what is held once the speaker has finished their turn.
  const scheduleTurnEnd = useCallback((speaker, delay) => {
    const st = stateFor(speaker);
    clearTurnTimer(st);
    if (!st.heldSince) st.heldSince = Date.now();
    st.turnTimer = setTimeout(function check() {
      st.turnTimer = null;
      if (!recordingRef.current) return;
      if (isStillSpeaking(st) && Date.now() - st.heldSince < MAX_HOLD_MS) {
        st.turnTimer = setTimeout(check, TURN_RECHECK_MS);
        return;
      }
      flushPendingQuestion(speaker);
    }, delay);
  }, [flushPendingQuestion]);

  const processSpeechText = useCallback((rawText, isFinal, speaker, record = isFinal) => {
    if (!rawText || typeof rawText !== 'string') return;
    // English only: text in another script is mis-recognised audio.
    {
      if (NON_ENGLISH_SCRIPT.test(rawText)) {
        return;
      }
      if (rawText.startsWith('¿') || rawText.startsWith('¡')) {
        return;
      }
    }

    const cleanText = deduplicateRepeatedPhrases(rawText);
    if (!cleanText || cleanText.length < 2 || isSilenceHallucination(cleanText)) return;

    if (record) appendConversation(speaker, cleanText);

    // Only a finished turn is answered, so a half-question is never sent on
    // its own: the text is held while the speaker is still talking, and a
    // statement-style question waits a moment in case more follows.
    // Filtering of greetings/filler happens per sentence in the assembler, so
    // "Hi, how are you?" still yields its question.
    const st = stateFor(speaker);
    clearTurnTimer(st);
    const endsWithQuestion = /\?\s*["')\]]?\s*$/.test(cleanText);
    const speaking = isStillSpeaking(st);
    const live = Boolean(st.recorder && st.recorder.isLive);
    const quietMs = live && st.recorder.quietMs ? st.recorder.quietMs() : Infinity;
    const tooSoon = quietMs < LIVE_QUESTION_QUIET_MS;
    const hold = speaking || !isFinal || !endsWithQuestion || tooSoon;
    const questions = st.assembler.add(cleanText, isFinal, { hold });
    if (hold) {
      let turnEnd = live ? LIVE_TURN_END_MS : TURN_END_MS;
      if (speaking) turnEnd = TURN_RECHECK_MS;
      else if (endsWithQuestion && tooSoon) turnEnd = LIVE_QUESTION_QUIET_MS - quietMs;
      if (st.assembler.pending()) scheduleTurnEnd(speaker, turnEnd);
      return;
    }
    st.heldSince = 0;
    dispatchQuestions(onlyQuestionsFrom(speaker, questions), speaker);
  }, [appendConversation, dispatchQuestions, scheduleTurnEnd]);

  // The browser recogniser only hears the default mic. With meeting audio on
  // its own channel that mic is the candidate, so it is only used as the fast
  // question path when the mic is the sole (unattributed) source.
  const startNativeRecognizer = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (nativeRecRef.current) {
        try {
          nativeRecRef.current.onend = null;
          nativeRecRef.current.abort();
        } catch {}
        nativeRecRef.current = null;
      }

      const nativeRec = new SpeechRec();
      nativeRec.continuous = true;
      nativeRec.interimResults = true;
      nativeRec.lang = 'en-US';
      nativeRec.maxAlternatives = 1;

      // Only final results: interim guesses are partial sentences, and acting
      // on them answered half-questions.
      nativeRec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const transcript = res[0] && res[0].transcript ? res[0].transcript.trim() : '';
          if (transcript && res.isFinal) {
            // Not added to the conversation log: the chunked transcription of
            // the same mic audio is the record, this is only the fast trigger.
            processSpeechText(transcript, true, 'unknown', false);
          }
        }
      };

      nativeRec.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('[Native Speech Recognition Error]:', e.error);
        }
      };

      nativeRec.onend = () => {
        if (recordingRef.current && isRecognitionActiveRef.current) {
          if (restartNativeTimerRef.current) clearTimeout(restartNativeTimerRef.current);
          restartNativeTimerRef.current = setTimeout(() => {
            if (recordingRef.current && isRecognitionActiveRef.current) {
              startNativeRecognizer();
            }
          }, 150);
        }
      };

      nativeRec.start();
      nativeRecRef.current = nativeRec;
    } catch (e) {
      console.warn('Native speech recognition init failed, relying on chunked transcription:', e);
    }
  }, [processSpeechText]);

  const applyResult = useCallback((speaker, result) => {
    if (result.timing) stateFor(speaker).lastTurnTiming = result.timing;
    if (result.text) {
      processSpeechText(result.text, result.endOfUtterance, speaker, true);
    } else if (result.endOfUtterance) {
      flushPendingQuestion(speaker);
    }
  }, [flushPendingQuestion, processSpeechText]);

  applyResultRef.current = (speaker, result) => {
    if (recordingRef.current) applyResult(speaker, result);
  };

  const makeChunkHandler = useCallback((speaker) => async (blob, { hadSpeech = true, endOfUtterance = true } = {}) => {
    const st = stateFor(speaker);
    const seq = st.ordered.reserve();

    if (!hadSpeech || st.inFlight >= MAX_IN_FLIGHT_PER_CHANNEL) {
      if (hadSpeech) console.warn('[copilot] transcription backlog; chunk skipped', { speaker });
      // A silent chunk means the speaker has stopped: complete what they said.
      st.ordered.fill(seq, { text: '', endOfUtterance: !hadSpeech || endOfUtterance });
      return;
    }

    st.inFlight += 1;
    const activeSession = sessionIdRef.current || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('session') : null) || 'default';
    let text = '';
    try {
      const data = await transcribeChunk(blob, activeSession);
      consecutiveFailuresRef.current = 0;
      setTranscriptionError('');
      text = (data && data.text && data.text.trim()) || '';
    } catch (err) {
      console.warn('Transcription chunk upload failed (will retry on the next chunk):', err);
      if (err.status === 429) {
        toast(`⚠️ ${(err.data && err.data.message) || 'Quota limit reached.'}`);
      } else {
        consecutiveFailuresRef.current += 1;
        if (consecutiveFailuresRef.current >= 3) {
          setTranscriptionError('Audio recognition is reconnecting…');
          toast('⚠️ Transcription is reconnecting — check connection.');
        }
      }
    } finally {
      st.inFlight -= 1;
    }
    // Always filled, even on failure — an unfilled slot would stall every later chunk.
    // A chunk with no words means the speaker stopped, even if the voice
    // detector never heard a pause (constant background noise): treat it as
    // the end of the utterance so a held question is answered, not stranded.
    st.ordered.fill(seq, { text, endOfUtterance: text ? endOfUtterance : true });
  }, [toast]);

  /* Live mode: one streaming transcriber per channel. Each committed turn
   * takes its place in the channel's ordered results, like a clip does, so
   * question detection and turn-taking work the same in both modes. A lost
   * connection is reopened a few times (turns already committed are settled
   * with no text, so nothing is answered twice); after that, or for a failure
   * reconnecting cannot fix, the channel carries on with clips. */
  const makeLiveListener = useCallback(function createListener(stream, speaker) {
    const replace = (current, next) => {
      const i = recordersRef.current.indexOf(current);
      if (i < 0) return false;
      recordersRef.current[i] = next;
      stateFor(speaker).recorder = next;
      next.start();
      return true;
    };

    const live = createLiveTranscriber(stream, {
      sessionId: sessionIdRef.current,
      speaker,
      // In an English session, live words in another script are
      // mis-recognition: they are not shown.
      onInterim: (words) => {
        if (NON_ENGLISH_SCRIPT.test(words)) return;
        setLastHeard(words.slice(-160));
      },
      // A question answered from its live words whose final transcript reads
      // differently: the final goes through question detection as well (the
      // duplicate check skips it if it is the same question after all).
      onRevision: (text, timing) => {
        console.info('[copilot] live words revised by final transcript', { speaker, chars: text.length });
        applyResultRef.current(speaker, { text: text.trim(), endOfUtterance: true, timing });
      },
      onReady: () => {
        const st = stateFor(speaker);
        if (st.liveFailures > 0) {
          console.info('[copilot] live transcription reconnected', { speaker, attempts: st.liveFailures });
          setTranscriptionError('');
        }
        st.liveFailures = 0;
      },
      onTurn: () => {
        const st = stateFor(speaker);
        const seq = st.ordered.reserve();
        st.inFlight += 1;
        let done = false;
        return (text, timing) => {
          if (done) return;
          done = true;
          st.inFlight -= 1;
          st.ordered.fill(seq, { text: (text || '').trim(), endOfUtterance: true, timing });
        };
      },
      onFailure: (err) => {
        if (!recordingRef.current || !recordersRef.current.includes(live)) return;
        const st = stateFor(speaker);
        const code = (err && err.code) || '';
        const delay = liveReconnectDelay(code, st.liveFailures);
        if (delay !== null) {
          st.liveFailures += 1;
          console.warn('[copilot] live transcription lost, reconnecting', { speaker, code, attempt: st.liveFailures, delayMs: delay });
          setTranscriptionError('Live transcription reconnecting…');
          if (st.reconnectTimer) clearTimeout(st.reconnectTimer);
          st.reconnectTimer = setTimeout(() => {
            st.reconnectTimer = null;
            if (!recordingRef.current) return;
            replace(live, createListener(stream, speaker));
          }, delay);
          return;
        }
        console.warn('[copilot] live transcription unavailable, using clips', { speaker, code, reason: err && err.message });
        setTranscriptionError('');
        if (code === 'quota_exhausted') {
          toast(`⚠️ ${err.message}`);
          return;
        }
        toast('⚠️ Live transcription unavailable — switched to standard transcription.');
        replace(live, createChunkedRecorder(stream, { onChunk: makeChunkHandler(speaker) }));
      },
    });
    return live;
  }, [makeChunkHandler, toast]);

  // Stops listening but keeps the audio sources open (see pauseRecording).
  const stopListeners = useCallback(() => {
    flushTranscriptLine();
    recordersRef.current.forEach((r) => { try { r.stop(); } catch {} });
    recordersRef.current = [];
    isRecognitionActiveRef.current = false;
    if (restartNativeTimerRef.current) {
      clearTimeout(restartNativeTimerRef.current);
      restartNativeTimerRef.current = null;
    }
    if (nativeRecRef.current) {
      try {
        nativeRecRef.current.onend = null;
        nativeRecRef.current.abort();
      } catch {}
      nativeRecRef.current = null;
    }
    channelStateRef.current.forEach((st) => clearChannelTimers(st));
    channelStateRef.current = new Map();
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, [flushTranscriptLine]);

  // Stops listening and closes the microphone and meeting-audio capture.
  const releaseAll = useCallback(() => {
    stopListeners();
    channelsRef.current.forEach((c) => stopStreamTracks(c.stream));
    channelsRef.current = [];
    channelsSourceRef.current = null;
  }, [stopListeners]);

  // Records from already-open channels: a fresh recorder per channel, the
  // elapsed clock, and the browser recogniser when the mic is the only source.
  const beginListening = useCallback((channels, { resetClock = true } = {}) => {
    if (resetClock) {
      elapsedSecsRef.current = 0;
      setElapsedText('00:00');
    }
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      elapsedSecsRef.current += 1;
      const m = Math.floor(elapsedSecsRef.current / 60);
      const s = elapsedSecsRef.current % 60;
      setElapsedText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    recordingRef.current = true;
    setListening(true);
    recordersRef.current = channels.map(({ stream, speaker }) => {
      const recorder = sttModeRef.current === 'live'
        ? makeLiveListener(stream, speaker)
        : createChunkedRecorder(stream, { onChunk: makeChunkHandler(speaker) });
      stateFor(speaker).recorder = recorder;
      recorder.start();
      return recorder;
    });
    markCaptureStarted(channels.map(({ speaker }) => `${speaker}:${sttModeRef.current}`));

    if (channels.length === 1 && channels[0].speaker === 'unknown') {
      isRecognitionActiveRef.current = true;
      startNativeRecognizer();
    }
  }, [makeChunkHandler, makeLiveListener, startNativeRecognizer]);

  const rawTracksOf = (channels) => channels.flatMap(({ stream }) => (
    (stream._rawStreams || [stream]).flatMap((raw) => raw.getAudioTracks())
  ));

  const startRecording = useCallback(async (overrideSource) => {
    if (startingRef.current || recordingRef.current) return;
    startingRef.current = true;
    if (!sessionIdRef.current) {
      if (typeof window !== 'undefined') {
        try {
          const urlSession = new URLSearchParams(window.location.search).get('session');
          if (urlSession) sessionIdRef.current = urlSession;
        } catch {}
      }
      if (!sessionIdRef.current) sessionIdRef.current = 'default';
    }
    try {
      releaseAll();
      consecutiveFailuresRef.current = 0;

      const wantedSource = overrideSource || source;
      const { channels, warning } = await getListenChannels(wantedSource);
      channelsRef.current = channels;
      channelsSourceRef.current = wantedSource;
      setCaptureWarning(warning || '');
      setTranscriptionError('');
      if (warning) toast(`⚠️ ${warning}`);

      channels.forEach(({ stream, speaker }) => {
        (stream._rawStreams || [stream]).forEach((raw) => raw.getAudioTracks().forEach((track) => {
          track.addEventListener('ended', () => {
            if (!recordingRef.current) return;
            const what = speaker === 'interviewer' ? 'Meeting audio sharing stopped' : 'Microphone disconnected';
            toast(`⚠️ ${what} — click the mic twice to reconnect.`);
            setCaptureWarning(`${what}.`);
          });
        }));
      });
      sttModeRef.current = await getSttMode();
      beginListening(channels);
    } catch (err) {
      if (err.code === 'NO_AUDIO_SHARED') {
        toast('⚠️ No audio was shared — tick "Share tab audio" in the picker, or switch to Microphone.');
      } else if (err.code === 'TAB_AUDIO_UNAVAILABLE') {
        toast(`⚠️ ${err.message} Switch to Microphone in Copilot settings.`);
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast('⚠️ Microphone access blocked — check Windows Settings > Privacy & security > Microphone.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast('⚠️ No microphone found — check one is connected and enabled in Windows sound settings.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast('⚠️ Microphone is in use by another app — close it and try again.');
      } else {
        console.error('Audio stream access failed:', err);
        toast(`⚠️ Audio access failed: ${err.message || err.name || 'unknown error'}`);
      }
      recordingRef.current = false;
      releaseAll();
      setListening(false);
      setCaptureWarning('');
    } finally {
      startingRef.current = false;
    }
  }, [source, toast, releaseAll, beginListening]);

  // Full stop: closes the microphone and meeting-audio capture. Used when the
  // session ends or the copilot is left.
  const stopRecording = useCallback(async () => {
    recordingRef.current = false;
    startingRef.current = false;
    setListening(false);
    setCaptureWarning('');
    setTranscriptionError('');
    releaseAll();
  }, [releaseAll]);

  /* The mic button pauses and resumes; it does not close the audio sources.
   * Closing them and opening them again on unmute is what broke listening:
   * Windows often hands back a silent stream for a second capture of the
   * computer's sound, and a browser asks for the tab again. Kept open, resume
   * is instant. While paused the tracks are switched off, so nothing is heard
   * or sent. */
  const pauseRecording = useCallback(() => {
    recordingRef.current = false;
    setListening(false);
    stopListeners();
    rawTracksOf(channelsRef.current).forEach((t) => { t.enabled = false; });
  }, [stopListeners]);

  const resumeRecording = useCallback(async () => {
    const channels = channelsRef.current;
    const tracks = rawTracksOf(channels);
    const usable = channels.length > 0
      && channelsSourceRef.current === source
      && tracks.length > 0
      && tracks.every((t) => t.readyState === 'live')
      && channels.every(({ stream }) => !stream._audioCtx || stream._audioCtx.state !== 'closed');
    if (!usable) {
      releaseAll();
      return startRecording();
    }
    tracks.forEach((t) => { t.enabled = true; });
    await Promise.all(channels.map(({ stream }) => (
      stream._audioCtx && stream._audioCtx.state === 'suspended'
        ? stream._audioCtx.resume().catch(() => {}) : null
    )));
    setTranscriptionError('');
    beginListening(channels, { resetClock: false });
  }, [source, releaseAll, startRecording, beginListening]);

  const toggleListening = useCallback(() => {
    if (startingRef.current) return undefined;
    if (recordingRef.current) return pauseRecording();
    return resumeRecording();
  }, [pauseRecording, resumeRecording]);

  return {
    listening,
    elapsedText,
    transcriptChips,
    lastHeard,
    captureWarning,
    transcriptionError,
    setTranscriptChips,
    getConversationTranscript,
    startRecording,
    stopRecording,
    toggleListening,
  };
}
