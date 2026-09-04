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
export function useSpeechRecognition({ sessionId, source = 'tab', onQuestionDetected, onToast } = {}) {
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
  const onQuestionDetectedRef = useRef(onQuestionDetected);
  onQuestionDetectedRef.current = onQuestionDetected;

  const toast = useCallback((msg) => { if (onToast) onToast(msg); }, [onToast]);

  const uploadAudioChunk = useCallback(async (blob) => {
    if (!sessionIdRef.current) return;
    try {
      const data = await transcribeChunk(blob, sessionIdRef.current);
      if (data.text) {
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

      const recorder = createChunkedRecorder(stream, { intervalMs: 3500, onChunk: uploadAudioChunk });
      recorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      if (err.code === 'NO_AUDIO_SHARED') {
        toast('⚠️ No audio was shared — tick "Share tab audio" in the picker, or switch to Microphone.');
      } else {
        console.error('Audio stream access failed:', err);
        toast('⚠️ Audio access not supported or cancelled');
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
