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
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = mediaRecorder;

      let chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        chunks = [];
        if (onChunkAvailable) {
          await onChunkAvailable(blob);
        }
      };

      mediaRecorder.start();
      
      cycleTimerRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          mediaRecorder.start();
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
