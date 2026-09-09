import { useState, useRef, useCallback } from 'react';
import {
  getListenStream, createChunkedRecorder, stopStreamTracks, transcribeChunk, looksLikeQuestion,
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

  const toast = useCallback((msg) => { if (onToast) onToast(msg); }, [onToast]);

  const uploadAudioChunk = useCallback(async (blob) => {
    if (!sessionIdRef.current) return;
    try {
      const data = await transcribeChunk(blob, sessionIdRef.current);
      if (data.text) {
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

        const isQuestion = looksLikeQuestion(data.text);
        setTranscriptChips((prev) => [...prev, { text: data.text, isQuestion }]);
        if (isQuestion && onQuestionDetectedRef.current) onQuestionDetectedRef.current(data.text);
      }
    } catch (err) {
      // Not fatal — this chunk is simply dropped and recording carries on;
      // the next chunk fires in 3.5s regardless. console.warn rather than
      // console.error deliberately, since Next's dev overlay treats a
      // console.error carrying an Error object as a crash-looking "Console
      // Error" banner, which is misleading for something already handled.
      console.warn('Transcription chunk upload failed (will retry on the next chunk):', err);
      if (err.status === 429) toast(`⚠️ ${(err.data && err.data.message) || 'Quota limit reached.'}`);
    }
  }, [toast]);

  const startRecording = useCallback(async (overrideSource) => {
    if (!sessionIdRef.current) {
      // Recording would otherwise "work" — the timer runs, the recorder
      // fires — while every chunk is silently dropped, because
      // uploadAudioChunk refuses to send audio without a loaded session.
      toast('⚠️ Session did not load — go back and reopen this session.');
      return;
    }
    try {
      const stream = await getListenStream(overrideSource || source);
      streamRef.current = stream;
      setListening(true);
      elapsedSecsRef.current = 0;
      setElapsedText('00:00');

      elapsedTimerRef.current = setInterval(() => {
        elapsedSecsRef.current += 1;
        const m = Math.floor(elapsedSecsRef.current / 60);
        const s = elapsedSecsRef.current % 60;
        setElapsedText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }, 1000);

      // Question detection can't happen before a chunk finishes recording —
      // shortening this is the one lever that actually reduces that floor,
      // trading some transcription accuracy for it: a shorter chunk is more
      // likely to cut a question in half (the interviewer's sentence spans
      // two chunks, so neither one alone reads as a complete question to
      // looksLikeQuestion). 2.5s keeps most short interview questions intact
      // in one chunk while cutting a full second off the old 3.5s floor.
      const recorder = createChunkedRecorder(stream, { intervalMs: 2500, onChunk: uploadAudioChunk });
      recorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      // getUserMedia's DOMException.name says exactly what happened — the
      // old catch-all ("Audio access not supported or cancelled") collapsed
      // "you clicked Block", "no mic exists", and "another app is holding
      // the mic open" into one message with no way to tell which applied,
      // even though each needs a completely different fix.
      if (err.code === 'NO_AUDIO_SHARED') {
        toast('⚠️ No audio was shared — tick "Share tab audio" in the picker, or switch to Microphone.');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast('⚠️ Microphone blocked — click the 🔒/🎤 icon in the address bar and allow it, then try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast('⚠️ No microphone found — check one is connected and enabled in Windows sound settings.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast('⚠️ Microphone is in use by another app — close it and try again.');
      } else {
        console.error('Audio stream access failed:', err);
        toast(`⚠️ Audio access failed: ${err.message || err.name || 'unknown error'}`);
      }
      setListening(false);
      clearInterval(elapsedTimerRef.current);
    }
  }, [source, toast, uploadAudioChunk]);

  const stopRecording = useCallback(async () => {
    setListening(false);
    clearInterval(elapsedTimerRef.current);
    if (recorderRef.current) recorderRef.current.stop();
    stopStreamTracks(streamRef.current);
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

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
