"use client";

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  Radio,
  Sliders,
  Play,
  Square,
  Cpu,
  Layers,
  Activity,
  Bot
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSpeechAssistant } from '../../hooks/useSpeechAssistant';

const Assistant3DCanvas = dynamic(() => import('../3d/Assistant3DCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00f5ff', fontSize: '12px' }}>
      <span>Initializing 3D Neural Core...</span>
    </div>
  ),
});

const QUICK_PROMPTS = [
  {
    title: "Live Interview Copilot",
    query: "How does Feonix AI Copilot assist during live technical interviews?",
  },
  {
    title: "Process vs Thread",
    query: "Can you explain the difference between a process and a thread with trade-offs?",
  },
  {
    title: "STAR Framework",
    query: "How do I use the STAR method to ace behavioral interview questions?",
  },
  {
    title: "JS Event Loop",
    query: "Explain how the JavaScript Event Loop handles Microtasks vs Macrotasks.",
  },
  {
    title: "System Design Framework",
    query: "What is the recommended 4-step framework for answering System Design questions?",
  },
];

export default function AIAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I am **Feonix Assistant**, your real-time 3D AI Copilot. I'm here to help you ace your technical interviews, master system design, optimize your answers, and guide you through Feonix 3.0. You can type to me or click the microphone to speak like a human!",
      time: 'Just now',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [visualMode, setVisualMode] = useState('robot'); // 'robot' | 'avatar' | 'orb'
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeSpeechCaption, setActiveSpeechCaption] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hook for natural human voice synthesis and microphone input
  const {
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
  } = useSpeechAssistant();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Synchronize microphone transcription to input field
  useEffect(() => {
    if (transcript) {
      setInputVal(transcript);
    }
  }, [transcript]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen, stopSpeaking, stopListening]);

  // Determine current 3D Assistant State
  const assistantState = isListening
    ? 'listening'
    : isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : 'idle';

  // Client-side fallback intelligence in case of network disconnect
  const getClientAnswer = (q) => {
    const query = q.toLowerCase();
    if (query.includes('feonix') || query.includes('copilot') || query.includes('interview')) {
      return "Feonix AI is your real-time 3D AI Copilot designed for high-stakes interviews. It processes voice chunks in under 1.5 seconds, presents stealth on-screen hints during live meetings, and protects all sensitive candidate data in an encrypted privacy sandbox. We also provide AI resume tuning and an automated mock simulator.";
    }
    if (query.includes('process') && query.includes('thread')) {
      return "A process is an independent program execution environment with dedicated virtual memory (stack and heap). A thread is an execution unit inside a process. Threads within the same process share heap memory, allowing ultra-fast communication, but requiring synchronization to prevent race conditions.";
    }
    if (query.includes('star') || query.includes('behavioral')) {
      return "The STAR method stands for Situation, Task, Action, and Result. When speaking to interviewers, spend 10% on the Situation and Task, 70% detailing YOUR specific Actions and technical decisions, and 20% highlighting concrete, quantifiable Results.";
    }
    if (query.includes('event loop') || query.includes('javascript')) {
      return "The JavaScript Event Loop coordinates asynchronous execution on a single thread. When the synchronous Call Stack empties, the loop executes all Microtasks (Promises, queueMicrotask) before moving to the next Macrotask in line (setTimeout, intervals, or DOM events).";
    }
    if (query.includes('system design') || query.includes('architecture')) {
      return "In System Design, follow four core steps: 1. Clarify functional requirements and SLAs (read vs write scale). 2. Back-of-the-envelope capacity estimates. 3. High-level architecture (Load Balancer, API Gateway, Cache layer, DB). 4. Deep-dive into data partitions, replication, and failover.";
    }
    return `Great question! In software engineering interviews, the key is to communicate your mental model clearly, state your assumptions up front, and analyze algorithmic or architectural trade-offs. How can we dive deeper into "${q}"?`;
  };

  // Handle Submitting a Message
  const handleSend = async (queryText) => {
    const text = (queryText || inputVal).trim();
    if (!text || isThinking) return;

    // Stop listening if mic was on
    if (isListening) {
      stopListening();
    }

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsThinking(true);
    stopSpeaking();

    try {
      // 1. Try fetching from backend assistant endpoint
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-5),
        }),
      }).catch(() => null);

      let answerText = '';
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        answerText = data.answer || getClientAnswer(text);
      } else {
        answerText = getClientAnswer(text);
      }

      setIsThinking(false);

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: answerText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setActiveSpeechCaption(answerText.slice(0, 100) + '...');

      // Speak response with natural human voice!
      speak(answerText, null, () => {
        setActiveSpeechCaption('');
      });
    } catch (err) {
      console.error('Assistant error:', err);
      setIsThinking(false);
      const fallback = getClientAnswer(text);
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: fallback,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      speak(fallback);
    }
  };

  // Toggle Microphone
  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((finalTranscript) => {
        if (finalTranscript) {
          handleSend(finalTranscript);
        }
      });
    }
  };

  // Replay a message with speech synthesis
  const handleReplayVoice = (text) => {
    stopSpeaking();
    setActiveSpeechCaption(text.slice(0, 100) + '...');
    speak(text, null, () => {
      setActiveSpeechCaption('');
    });
  };

  // Copy text to clipboard
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset conversation
  const handleReset = () => {
    stopSpeaking();
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: "Memory refreshed! What technical interview topic, system design problem, or Feonix AI question would you like to explore?",
        time: 'Just now',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="assistant-modal-backdrop" onClick={onClose}>
      <div
        className={`assistant-modal-container ${isExpanded ? 'expanded' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR / CONTROLS */}
        <header className="assistant-header">
          <div className="assistant-header-left">
            <div className="assistant-badge-glow">
              <Sparkles size={16} className="sparkle-spin" />
            </div>
            <div>
              <div className="assistant-title-row">
                <span className="assistant-name">Feonix 3D Copilot</span>
                <span className={`status-pill ${assistantState}`}>
                  <span className="status-dot" />
                  {assistantState === 'idle' && 'READY'}
                  {assistantState === 'listening' && 'LISTENING'}
                  {assistantState === 'thinking' && 'PROCESSING'}
                  {assistantState === 'speaking' && 'SPEAKING'}
                </span>
              </div>
              <p className="assistant-sublabel">Sentient 3D Interview & Career Assistant</p>
            </div>
          </div>

          <div className="assistant-header-actions">
            {/* Visual 3D Mode Selector */}
            <div className="mode-toggle-group" title="Select 3D Avatar Style">
              <button
                className={`mode-btn ${visualMode === 'robot' ? 'active' : ''}`}
                onClick={() => setVisualMode('robot')}
                type="button"
              >
                <Bot size={13} />
                <span>3D Robot</span>
              </button>
              <button
                className={`mode-btn ${visualMode === 'avatar' ? 'active' : ''}`}
                onClick={() => setVisualMode('avatar')}
                type="button"
              >
                <Sparkles size={13} />
                <span>Holo</span>
              </button>
              <button
                className={`mode-btn ${visualMode === 'orb' ? 'active' : ''}`}
                onClick={() => setVisualMode('orb')}
                type="button"
              >
                <Layers size={13} />
                <span>Orb</span>
              </button>
            </div>

            {/* Voice Gender Switcher */}
            <div className="voice-gender-select" title="Voice Demeanor">
              <button
                className={`gender-btn ${selectedVoiceGender === 'female' ? 'active' : ''}`}
                onClick={() => setSelectedVoiceGender('female')}
                type="button"
              >
                Aria
              </button>
              <button
                className={`gender-btn ${selectedVoiceGender === 'male' ? 'active' : ''}`}
                onClick={() => setSelectedVoiceGender('male')}
                type="button"
              >
                Atlas
              </button>
            </div>

            {/* Mute Voice Toggle */}
            <button
              className={`icon-tool-btn ${isMuted ? 'muted' : ''}`}
              onClick={() => {
                if (!isMuted) stopSpeaking();
                setIsMuted(!isMuted);
              }}
              title={isMuted ? 'Unmute Human Voice' : 'Mute Human Voice'}
              type="button"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Speech Rate Cycle */}
            <button
              className="speed-pill-btn"
              onClick={() => {
                const nextRate = speechRate === 1.0 ? 1.2 : speechRate === 1.2 ? 0.8 : 1.0;
                setSpeechRate(nextRate);
              }}
              title="Adjust Speaking Speed"
              type="button"
            >
              {speechRate}x
            </button>

            {/* Expand / Minimize */}
            <button
              className="icon-tool-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore Size' : 'Maximize Window'}
              type="button"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close */}
            <button
              className="icon-tool-btn close-btn"
              onClick={onClose}
              title="Close Assistant"
              type="button"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* 3D VISUAL STAGE & LIVE FREQUENCY BARS */}
        <section className="assistant-3d-stage">
          <div className="stage-canvas-container">
            {visualMode === 'robot' ? (
              <div className="modal-robot-stage-wrap">
                <div className={`modal-robot-avatar-halo ${assistantState}`}>
                  <Image
                    src="/ai_robot_avatar_speaking.jpg"
                    alt="3D AI Assistant Robot"
                    width={170}
                    height={170}
                    priority
                    className="modal-robot-avatar-img"
                  />
                  {/* Real-time speech ripple ring */}
                  {isSpeaking && (
                    <div
                      className="robot-speaking-wave-ring"
                      style={{ transform: `scale(${1.0 + speechEnergy * 0.4})` }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <Assistant3DCanvas
                state={assistantState}
                speechEnergy={speechEnergy}
                visualMode={visualMode}
              />
            )}

            {/* Dynamic Real-time Audio Frequency Visualizer Waves */}
            <div className="stage-audio-visualizer">
              {[...Array(16)].map((_, i) => {
                const centerDist = Math.abs(i - 7.5);
                const maxH = 26 - centerDist * 1.5;
                const height = isSpeaking
                  ? Math.max(4, Math.min(maxH, speechEnergy * maxH * (1.2 + Math.sin(i + Date.now() * 0.01) * 0.4)))
                  : isListening
                  ? Math.max(3, 14 * Math.sin(i * 0.8 + Date.now() * 0.005))
                  : 3;
                return (
                  <span
                    key={i}
                    className={`visualizer-bar ${isSpeaking ? 'active' : ''}`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>

            {/* Speech Subtitle Badge when Speaking */}
            {isSpeaking && (
              <div className="speech-caption-badge">
                <span className="caption-pulse" />
                <span className="caption-text">Speaking naturally...</span>
                <button
                  className="stop-speech-mini-btn"
                  onClick={stopSpeaking}
                  title="Stop Audio"
                  type="button"
                >
                  <Square size={11} /> Stop
                </button>
              </div>
            )}
          </div>{/* end stage-canvas-container */}
        </section>

        {/* CONVERSATION HISTORY */}
        <div className="assistant-chat-stream">
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble-row ${m.role}`}>
              {m.role === 'assistant' && (
                <div className="bubble-avatar-assistant">
                  <Sparkles size={14} />
                </div>
              )}
              <div className="bubble-content-wrap">
                <div className="bubble-meta">
                  <span className="bubble-author">
                    {m.role === 'assistant' ? 'Feonix AI' : 'You'}
                  </span>
                  <span className="bubble-time">{m.time}</span>
                </div>
                <div className="bubble-text">
                  {m.content}
                </div>
                {m.role === 'assistant' && (
                  <div className="bubble-actions">
                    <button
                      className="bubble-action-btn"
                      onClick={() => handleReplayVoice(m.content)}
                      title="Speak this response aloud"
                      type="button"
                    >
                      <Volume2 size={13} />
                      <span>Replay Voice</span>
                    </button>
                    <button
                      className="bubble-action-btn"
                      onClick={() => handleCopy(m.id, m.content)}
                      title="Copy response"
                      type="button"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking Skeleton */}
          {isThinking && (
            <div className="chat-bubble-row assistant">
              <div className="bubble-avatar-assistant">
                <Sparkles size={14} className="sparkle-spin" />
              </div>
              <div className="bubble-content-wrap thinking">
                <div className="thinking-indicator">
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-label">Feonix is analyzing & formulating speech...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK PROMPT SUGGESTION CHIPS */}
        <div className="assistant-quick-prompts">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              className="quick-chip-btn"
              onClick={() => handleSend(p.query)}
              type="button"
            >
              <Sparkles size={11} className="text-cyan-400" />
              <span>{p.title}</span>
            </button>
          ))}
          <button
            className="quick-chip-btn reset-chip"
            onClick={handleReset}
            title="Reset conversation"
            type="button"
          >
            <RotateCcw size={11} />
            <span>Clear</span>
          </button>
        </div>

        {/* INPUT & MICROPHONE TOOLBAR */}
        <footer className="assistant-input-tray">
          {speechError && (
            <div className="speech-error-banner">
              <span>{speechError}</span>
            </div>
          )}

          <form
            className="input-form-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            {/* Microphone Button */}
            <button
              className={`mic-trigger-btn ${isListening ? 'listening-active' : ''}`}
              onClick={handleToggleMic}
              title={isListening ? 'Stop Listening' : 'Speak to Feonix with your microphone'}
              type="button"
            >
              {isListening ? (
                <>
                  <span className="mic-ripple" />
                  <MicOff size={18} />
                </>
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              className="assistant-text-field"
              placeholder={
                isListening
                  ? 'Listening to you speak...'
                  : 'Ask Feonix anything, or speak with the mic...'
              }
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isThinking}
            />

            {/* Send Button */}
            <button
              type="submit"
              className="send-trigger-btn"
              disabled={!inputVal.trim() || isThinking}
              title="Send question"
            >
              <Send size={16} />
            </button>
          </form>

          <div className="assistant-footer-caption">
            <span>Powered by Feonix Neural 3D Engine • Human Voice Synthesis • End-to-End Encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
