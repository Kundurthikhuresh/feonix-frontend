"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechAssistant() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0); // 0.8, 1.0, 1.2
  const [selectedVoiceGender, setSelectedVoiceGender] = useState('female'); // 'female' | 'male' | 'synth'
  const [availableVoices, setAvailableVoices] = useState([]);
  const [speechEnergy, setSpeechEnergy] = useState(0); // 0 to 1 for 3D mouth/wave sync
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const energyIntervalRef = useRef(null);

  // Initialize SpeechSynthesis and load high-quality human voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (energyIntervalRef.current) {
        clearInterval(energyIntervalRef.current);
      }
    };
  }, []);

  // Choose the most natural, human-sounding voice available
  const getBestVoice = useCallback((gender) => {
    if (!availableVoices.length) return null;

    // Preference rankings for human-like natural voices
    const femaleKeywords = [
      'natural', 'aria', 'jenny', 'samantha', 'victoria', 'karen', 'zira', 'female', 'google us english'
    ];
    const maleKeywords = [
      'natural', 'guy', 'david', 'george', 'daniel', 'alex', 'male', 'google uk english male'
    ];

    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;

    // 1. Try finding an exact match with high quality natural voice
    for (const kw of keywords) {
      const match = availableVoices.find(v => 
        v.lang.startsWith('en') && v.name.toLowerCase().includes(kw)
      );
      if (match) return match;
    }

    // 2. Any English voice
    const anyEnglish = availableVoices.find(v => v.lang.startsWith('en'));
    return anyEnglish || availableVoices[0];
  }, [availableVoices]);

  // Start animated mouth & wave energy oscillation while speaking
  const startSpeechEnergyAnimation = useCallback(() => {
    if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);

    let phase = 0;
    energyIntervalRef.current = setInterval(() => {
      phase += 0.25;
      // Synthesize realistic speech prosody oscillation with varying amplitudes
      const base = Math.sin(phase) * 0.4 + 0.5;
      const jitter = (Math.random() - 0.5) * 0.3;
      const energy = Math.max(0.15, Math.min(1.0, base + jitter));
      setSpeechEnergy(energy);
    }, 60);
  }, []);

  const stopSpeechEnergyAnimation = useCallback(() => {
    if (energyIntervalRef.current) {
      clearInterval(energyIntervalRef.current);
      energyIntervalRef.current = null;
    }
    setSpeechEnergy(0);
  }, []);

  // Stop / Cancel Speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    currentUtteranceRef.current = null;
    setIsSpeaking(false);
    stopSpeechEnergyAnimation();
  }, [stopSpeechEnergyAnimation]);

  // Speak Text naturally
  const speak = useCallback((text, onBoundary = null, onEnd = null) => {
    if (!text || typeof window === 'undefined') return;

    if (isMuted) {
      // If muted, simulate speaking lifecycle briefly without audio
      setIsSpeaking(true);
      startSpeechEnergyAnimation();
      setTimeout(() => {
        setIsSpeaking(false);
        stopSpeechEnergyAnimation();
        if (onEnd) onEnd();
      }, Math.min(text.length * 40, 2500));
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported on this browser.');
      return;
    }

    // Clean markdown symbols for cleaner, natural pronunciation
    const cleanText = text
      .replace(/[*_#`~>]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Cancel any active utterance
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtteranceRef.current = utterance;

    const voice = getBestVoice(selectedVoiceGender);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    }

    utterance.rate = speechRate;
    // Slight pitch adjustment for warmth & clarity
    utterance.pitch = selectedVoiceGender === 'female' ? 1.05 : 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      startSpeechEnergyAnimation();
    };

    utterance.onboundary = (event) => {
      // Word boundary event — trigger energetic pulse
      setSpeechEnergy((prev) => Math.min(1.0, prev + 0.35));
      if (onBoundary) onBoundary(event);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      stopSpeechEnergyAnimation();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      setIsSpeaking(false);
      stopSpeechEnergyAnimation();
      if (onEnd) onEnd();
    };

    synthRef.current.speak(utterance);
  }, [isMuted, selectedVoiceGender, speechRate, getBestVoice, startSpeechEnergyAnimation, stopSpeechEnergyAnimation]);

  // Speech Recognition (Microphone Input)
  const startListening = useCallback((onResultCallback) => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop speaking if currently speaking
    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (event.results[0].isFinal && onResultCallback) {
          onResultCallback(currentText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('Could not access microphone.');
    }
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isSpeaking,
    isListening,
    isMuted,
    setIsMuted,
    speechRate,
    setSpeechRate,
    selectedVoiceGender,
    setSelectedVoiceGender,
    speechEnergy,
    transcript,
    speechError,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  };
}
