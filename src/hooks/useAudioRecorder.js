import { useState, useRef, useEffect, useCallback } from 'react';

export function useAudioRecorder(onChunkAvailable) {
  const [listening, setListening] = useState(false);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const cycleTimerRef = useRef(null);

  const stopRecording = useCallback(async () => {
    setListening(false);

    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setListening(true);
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      const makeRecorder = () => {
        let rec;
        try {
          rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        } catch {
          rec = new MediaRecorder(stream);
        }
        rec.ondataavailable = async (e) => {
          if (e.data && e.data.size > 0 && onChunkAvailable) {
            await onChunkAvailable(e.data);
          }
        };
        return rec;
      };

      let active = makeRecorder();
      recorderRef.current = active;
      active.start();

      cycleTimerRef.current = setInterval(() => {
        try {
          const next = makeRecorder();
          next.start();
          const prev = active;
          active = next;
          recorderRef.current = next;
          if (prev && prev.state === 'recording') {
            prev.stop();
          }
        } catch (e) {
          console.warn('Recorder tick warning:', e);
        }
      }, 2500);

    } catch (err) {
      console.error('Audio recorder failed:', err);
      setListening(false);
      throw err;
    }
  }, [onChunkAvailable]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    listening,
    startRecording,
    stopRecording,
  };
}
