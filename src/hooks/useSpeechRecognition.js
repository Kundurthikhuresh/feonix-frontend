import { useState, useRef, useCallback } from 'react';
import {
  getListenStream, createChunkedRecorder, stopStreamTracks, transcribeChunk, looksLikeQuestion,
  isSilenceHallucination, deduplicateRepeatedPhrases,
} from '../services/speechService';

/**
 * Listens on tab/mic audio, transcribes it in rolling 3.5s chunks, and keeps
 * a running transcript. Calls onQuestionDetected(text) whenever a chunk looks
 * like a question — the caller decides what to do with that (auto-answer is
 * a policy choice that belongs to useInterview, not to speech capture itself).
 */
export function useSpeechRecognition({ sessionId, source = 'mic', language = 'en', onQuestionDetected, onToast } = {}) {
  const [listening, setListening] = useState(false);
  const [elapsedText, setElapsedText] = useState('00:00');
  const [transcriptChips, setTranscriptChips] = useState([]);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const elapsedSecsRef = useRef(0);
  // Read at call time, not at hook-setup time — sessionId can arrive after a
  // session finishes loading, well after this hook first mounts.
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const languageRef = useRef(language);
  languageRef.current = language;
  const onQuestionDetectedRef = useRef(onQuestionDetected);
  onQuestionDetectedRef.current = onQuestionDetected;
  // Counts consecutive chunk-upload failures so a real outage surfaces once,
  // instead of either staying silent forever or toasting every 1.6s.
  const consecutiveFailuresRef = useRef(0);

  const toast = useCallback((msg) => { if (onToast) onToast(msg); }, [onToast]);

  const uploadAudioChunk = useCallback(async (blob) => {
    if (!sessionIdRef.current) return;
    try {
      const data = await transcribeChunk(blob, sessionIdRef.current);
      consecutiveFailuresRef.current = 0;
      if (data.text) {
        if (isSilenceHallucination(data.text)) {
          return;
        }

        const lang = String(languageRef.current || 'en').toLowerCase();
        if (lang === 'en' || lang === 'english') {
          // Reject foreign script noise hallucinations (Japanese, Chinese, Korean, Cyrillic, Arabic) in English sessions
          if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff]/.test(data.text)) {
            return;
          }
          if (data.text.startsWith('¿') || data.text.startsWith('¡')) {
            return;
          }
        }

        const cleanText = deduplicateRepeatedPhrases(data.text);
        if (!cleanText || cleanText.length < 2 || isSilenceHallucination(cleanText)) return;

        const isQuestion = looksLikeQuestion(cleanText);

        // Deduplicate consecutive identical/redundant chips
        setTranscriptChips((prev) => {
          const last = prev[prev.length - 1];
          if (last) {
            const lastNorm = last.text.toLowerCase().replace(/[^a-z0-9]/g, '');
            const currNorm = cleanText.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (lastNorm === currNorm || (currNorm.length > 5 && lastNorm.includes(currNorm))) {
              return prev;
            }
          }
          return [...prev, { text: cleanText, isQuestion }];
        });

        if (isQuestion && onQuestionDetectedRef.current) onQuestionDetectedRef.current(cleanText);
      }
    } catch (err) {
      // Not fatal — this chunk is simply dropped and recording carries on;
      // the next chunk fires in 3.5s regardless. console.warn rather than
      // console.error deliberately, since Next's dev overlay treats a
      // console.error carrying an Error object as a crash-looking "Console
      // Error" banner, which is misleading for something already handled.
      console.warn('Transcription chunk upload failed (will retry on the next chunk):', err);
      if (err.status === 429) {
        toast(`⚠️ ${(err.data && err.data.message) || 'Quota limit reached.'}`);
      } else {
        consecutiveFailuresRef.current += 1;
        // ~5s of back-to-back failures at the 1.6s chunk interval — a real
        // outage, not one dropped chunk — surfaced once rather than repeated
        // every 1.6s while it persists.
        if (consecutiveFailuresRef.current === 3) {
          toast('⚠️ Transcription is failing — check your connection.');
        }
      }
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    setListening(false);
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    if (recorderRef.current) {
      try { recorderRef.current.stop(); } catch {}
    }
    stopStreamTracks(streamRef.current);
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const startRecording = useCallback(async (overrideSource) => {
    try {
      // Clean up any stale recorder or tracks before acquiring a new one
      await stopRecording();

      const stream = await getListenStream(overrideSource || source);
      streamRef.current = stream;

      // Handle microphone track ending externally (e.g. unplugged or OS muted)
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.onended = () => {
          stopRecording();
          toast('⚠️ Microphone stream disconnected.');
        };
      }

      setListening(true);
      elapsedSecsRef.current = 0;
      setElapsedText('00:00');

      elapsedTimerRef.current = setInterval(() => {
        elapsedSecsRef.current += 1;
        const m = Math.floor(elapsedSecsRef.current / 60);
        const s = elapsedSecsRef.current % 60;
        setElapsedText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }, 1000);

      // Question detection can't happen before a chunk finishes recording
      const recorder = createChunkedRecorder(stream, { intervalMs: 1600, onChunk: uploadAudioChunk });
      recorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      if (err.code === 'NO_AUDIO_SHARED') {
        toast('⚠️ No audio was shared — tick "Share tab audio" in the picker, or switch to Microphone.');
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
      setListening(false);
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
    }
  }, [source, stopRecording, toast, uploadAudioChunk]);

  const toggleListening = useCallback(() => {
    if (listening) stopRecording();
    else startRecording();
  }, [listening, startRecording, stopRecording]);

  return {
    listening,
    elapsedText,
    transcriptChips,
    setTranscriptChips,
    startRecording,
    stopRecording,
    toggleListening,
  };
}
