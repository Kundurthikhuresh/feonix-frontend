"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Mic,
  Monitor,
  Move,
  Minimize2,
  Maximize2,
  MoreVertical,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Code2,
  Radio,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Delete,
  Zap,
} from 'lucide-react';
import Hero3DVisual from './Hero3DVisual';

const SCENARIOS = [
  {
    id: 'disagree_manager',
    tabLabel: 'Behavioral · Disagree with Manager',
    icon: MessageSquare,
    interviewerName: 'Sarah Chen',
    interviewerRole: 'Staff Infrastructure Lead @ Stripe',
    interviewerAvatar: 'SC',
    interviewerColor: '#38bdf8',
    question: 'Walk me through a time you disagreed with your manager.',
    tokens: ['Walk me through', 'a time you', 'disagreed with your', 'manager.'],
    highlightWord: 'manager.',
    latency: '0.88s',
    confidence: '99.4%',
    time: '18:08',
    strategyHeadline: 'Frame it as a disagreement about evidence, not about authority.',
    talkingPoints: [
      {
        label: 'Situation',
        desc: 'we planned a rewrite I thought was premature.',
      },
      {
        label: 'Action',
        desc: 'I put together a benchmark demonstrating the bottleneck was an unindexed query, not the language runtime.',
      },
      {
        label: 'Result',
        desc: 'Saved 3 months of engineering refactoring and shipped the critical feature 2 weeks ahead of schedule.',
      },
    ],
    codeSnippet: null,
  },
  {
    id: 'rate_limiter',
    tabLabel: 'System Design · Rate Limiter',
    icon: Layers,
    interviewerName: 'Alex Morgan',
    interviewerRole: 'Principal Architect @ Amazon',
    interviewerAvatar: 'AM',
    interviewerColor: '#06b6d4',
    question: 'How would you design a distributed rate limiter for a public API at 100k QPS?',
    tokens: ['How would you', 'design a distributed', 'rate limiter for a', 'public API at 100k QPS?'],
    highlightWord: 'public API at 100k QPS?',
    latency: '0.92s',
    confidence: '99.6%',
    time: '24:15',
    strategyHeadline: 'Sliding Window Counter + Token Bucket per API Key in Redis Cluster',
    talkingPoints: [
      {
        label: 'Algorithm Selection',
        desc: 'Token Bucket per API key. Refills at rate R tokens/sec up to burst capacity B via atomic Lua script.',
      },
      {
        label: 'Distributed Architecture',
        desc: 'Redis Cluster sharded by hash(tenant_id) with local memory edge cache at Envoy gateways.',
      },
      {
        label: 'Standard HTTP Headers',
        desc: 'Emits X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After on HTTP 429 Too Many Requests.',
      },
    ],
    codeSnippet: `-- Atomic Token Bucket Decr in Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local current = tonumber(redis.call('get', key) or "0")

if current + 1 > limit then
  return 0 -- Rejected (HTTP 429)
end

redis.call('INCRBY', key, 1)
if current == 0 then
  redis.call('EXPIRE', key, 1)
end
return 1 -- Allowed`,
  },
  {
    id: 'lru_cache',
    tabLabel: 'Live Coding · O(1) LRU Cache',
    icon: Code2,
    interviewerName: 'David Zhang',
    interviewerRole: 'Senior SWE Interviewer @ Google',
    interviewerAvatar: 'DZ',
    interviewerColor: '#a855f7',
    question: 'Can you implement an LRU cache with strict O(1) complexity?',
    tokens: ['Can you', 'implement an', 'LRU cache with', 'strict O(1) complexity?'],
    highlightWord: 'strict O(1) complexity?',
    latency: '0.85s',
    confidence: '99.8%',
    time: '29:40',
    strategyHeadline: 'Doubly Linked List for O(1) node ordering + Hash Map for O(1) key lookups',
    talkingPoints: [
      {
        label: 'Data Structure Choice',
        desc: 'Doubly Linked List maintains recency order. Hash Map stores key -> Node pointer for instant retrieval.',
      },
      {
        label: 'Eviction Logic',
        desc: 'When capacity reaches max on put(), remove node before tail sentinel and purge its key from hash map.',
      },
      {
        label: 'Recency Update',
        desc: 'On get() or overwrite put(), splice node directly behind head sentinel in O(1) pointer updates.',
      },
    ],
    codeSnippet: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.cap) {
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(key, value);
  }
}`,
  },
];

export default function PremiumHeroSection({ onSignupClick, onWatchDemo }) {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [copied, setCopied] = useState(false);

  // Typewriter and streaming animation states
  // Phases: 'transcribing' | 'detected' | 'streaming_answer' | 'completed'
  const [phase, setPhase] = useState('transcribing');
  const [visibleTokenCount, setVisibleTokenCount] = useState(1);
  const [activePointIndex, setActivePointIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const timerRef = useRef(null);

  // Restart live video sequence
  const restartSimulation = (scenario = activeScenario) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveScenario(scenario);
    setPhase('transcribing');
    setVisibleTokenCount(1);
    setActivePointIndex(0);
    setTypedChars(0);
    setIsPlaying(true);
  };

  // Instant fast-forward to full answer
  const handleInstantAnswer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisibleTokenCount(activeScenario.tokens.length);
    setActivePointIndex(activeScenario.talkingPoints.length);
    setPhase('completed');
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Video-like streaming sequence loop
  useEffect(() => {
    if (!isPlaying) return;

    if (phase === 'transcribing') {
      if (visibleTokenCount < activeScenario.tokens.length) {
        timerRef.current = setTimeout(() => {
          setVisibleTokenCount((prev) => prev + 1);
        }, 500);
      } else {
        // Question fully captured
        timerRef.current = setTimeout(() => {
          setPhase('detected');
        }, 300);
      }
    } else if (phase === 'detected') {
      // Question Detected pill lights up, trigger answer streaming
      timerRef.current = setTimeout(() => {
        setPhase('streaming_answer');
        setActivePointIndex(0);
        setTypedChars(0);
      }, 600);
    } else if (phase === 'streaming_answer') {
      const currentPoint = activeScenario.talkingPoints[activePointIndex];
      if (currentPoint) {
        const fullText = `${currentPoint.label}: ${currentPoint.desc}`;
        if (typedChars < fullText.length) {
          // Type characters smoothly
          timerRef.current = setTimeout(() => {
            setTypedChars((prev) => Math.min(prev + 3, fullText.length));
          }, 28);
        } else {
          // Current point finished typing, move to next point
          timerRef.current = setTimeout(() => {
            setActivePointIndex((prev) => prev + 1);
            setTypedChars(0);
          }, 350);
        }
      } else {
        // All points completed
        setPhase('completed');
      }
    } else if (phase === 'completed') {
      // Loop after 10s of display
      timerRef.current = setTimeout(() => {
        restartSimulation();
      }, 10000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, visibleTokenCount, activePointIndex, typedChars, isPlaying, activeScenario]);

  return (
    <section id="hero" className="px-hero" style={{ padding: '64px 0 84px 0', position: 'relative' }}>
      <div className="px-container">
        {/* Top Feature Pill */}
        <div className="px-hero-pill">
          <span className="px-hero-pulse" />
          <span>The Undetectable Real-Time AI Copilot for Live Interviews</span>
        </div>

        {/* Value Proposition Headline */}
        <h1 className="px-hero-headline">
          Get the right answer <br />
          <span className="px-section-title-gradient">while you're still talking</span>
        </h1>

        {/* Concise Description */}
        <p className="px-hero-subheadline">
          Through technical rounds, system design architectures, live coding pads, and leadership loops where freezing up isn't an option. An invisible desktop teleprompter that transcribes questions and streams answers in under 1.2s.
        </p>

        {/* CTA Group */}
        <div className="px-hero-cta-group">
          <button
            onClick={onSignupClick}
            className="px-btn px-btn-primary"
            style={{ padding: '14px 30px', fontSize: '15px', borderRadius: '12px' }}
          >
            <Sparkles size={16} style={{ color: '#06b6d4' }} />
            <span>Start Free Trial · 5 Sessions</span>
          </button>

          <button
            onClick={onWatchDemo}
            className="px-btn px-btn-secondary"
            style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '12px' }}
          >
            <Play size={15} style={{ fill: '#38bdf8', color: '#38bdf8' }} />
            <span>Watch 90s Live Demo</span>
          </button>
        </div>

        {/* Verified Capability Trust Indicators */}
        <div className="px-trust-strip" style={{ marginBottom: '36px' }}>
          <div className="px-trust-item">
            <CheckCircle2 size={15} style={{ color: '#10b981' }} />
            <span>100% Invisible to Zoom, Teams & Meet</span>
          </div>
          <div className="px-trust-item">
            <CheckCircle2 size={15} style={{ color: '#10b981' }} />
            <span>5 Free Trial Sessions (10 min each)</span>
          </div>
          <div className="px-trust-item">
            <CheckCircle2 size={15} style={{ color: '#10b981' }} />
            <span>Sub-1.2s Streaming Latency</span>
          </div>
          <div className="px-trust-item">
            <CheckCircle2 size={15} style={{ color: '#10b981' }} />
            <span>STAR Behavioral & Optimal Code Engine</span>
          </div>
        </div>

        {/* ================================================================
            AUTHENTIC DESKTOP INTERVIEW ENVIRONMENT & STEALTH TELEPROMPTER
            (Matches Image 1 Exact Layout, HUD Capsules & Streaming Behavior)
            ================================================================ */}
        <div style={{ maxWidth: '1060px', margin: '0 auto', textAlign: 'left', position: 'relative' }}>
          
          {/* Floating 3D AI Neural Core Badge */}
          <div
            style={{
              position: 'absolute',
              top: '-42px',
              right: '24px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(18, 20, 26, 0.95)',
              border: `1px solid ${phase === 'detected' || phase === 'streaming_answer' ? '#38bdf8' : 'rgba(255, 255, 255, 0.14)'}`,
              borderRadius: '999px',
              padding: '6px 14px 6px 8px',
              boxShadow: phase === 'streaming_answer'
                ? '0 10px 30px rgba(6, 182, 212, 0.35), 0 0 20px rgba(56, 189, 248, 0.35)'
                : '0 10px 30px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ width: '28px', height: '28px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hero3DVisual size={32} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: phase === 'streaming_answer' ? '#38bdf8' : '#10b981',
                    boxShadow: phase === 'streaming_answer' ? '0 0 10px #38bdf8' : '0 0 8px #10b981',
                    animation: phase === 'streaming_answer' ? 'pulse 0.8s infinite' : 'none',
                  }}
                />
                Feonix Neural Core
              </span>
              <span style={{ fontSize: '9.5px', color: phase === 'streaming_answer' ? '#38bdf8' : '#94a3b8', fontFamily: 'monospace' }}>
                {phase === 'transcribing' && 'Streaming Whisper-1 • 0.88s'}
                {phase === 'detected' && 'Question Detected • Synthesizing'}
                {phase === 'streaming_answer' && `Generating answer in ${activeScenario.latency}...`}
                {phase === 'completed' && `Streaming Whisper-1 • ${activeScenario.latency}`}
              </span>
            </div>
          </div>

          {/* Desktop Application Window Shell */}
          <div
            style={{
              background: '#090d16',
              borderRadius: '22px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 30px 90px -10px rgba(0, 0, 0, 0.9), 0 0 60px -15px rgba(6, 182, 212, 0.18)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* macOS Window Title Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 20px',
                background: 'rgba(13, 18, 30, 0.98)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)' }} />
                <span style={{ marginLeft: '12px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 600 }}>
                  Feonix AI Teleprompter Daemon (macOS / Windows Excluded)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => restartSimulation()}
                  title="Replay Video Simulation"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Replay Live Demo</span>
                </button>

                <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Zoom Video Active
                </span>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '3px 8px', borderRadius: '4px' }}>
                  WDA_EXCLUDEFROMCAPTURE
                </span>
              </div>
            </div>

            {/* Video Call Backdrop with Floating Parakeet HUD (Exact replica of Image 1) */}
            <div
              style={{
                position: 'relative',
                padding: '24px 24px 28px 24px',
                background: 'radial-gradient(ellipse 90% 70% at 50% 20%, rgba(16, 24, 40, 0.98), rgba(6, 9, 15, 0.99))',
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* Meeting grid subtle texture */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                  pointerEvents: 'none',
                }}
              />

              {/* ============================================================
                  1. TOP FLOATING TOOLBAR CAPSULE (Exact Image 1 layout)
                  ============================================================ */}
              <div
                style={{
                  background: 'rgba(34, 37, 44, 0.96)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Left controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Screen Share Exclusion Indicator */}
                  <div
                    title="Screen Share Stealth Exclusion Active"
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#cbd5e1',
                    }}
                  >
                    <Monitor size={15} />
                    <span style={{ position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                  </div>

                  {/* Microphone Active Indicator */}
                  <div
                    title="Microphone Streaming"
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#cbd5e1',
                    }}
                  >
                    <Mic size={15} />
                    <span style={{ position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                  </div>

                  {/* Answer ⌘⏎ Button */}
                  <button
                    type="button"
                    onClick={handleInstantAnswer}
                    title="Generate Answer Instantly"
                    style={{
                      background: phase === 'detected' || phase === 'streaming_answer'
                        ? 'rgba(56, 189, 248, 0.25)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${phase === 'detected' ? '#38bdf8' : 'rgba(255, 255, 255, 0.16)'}`,
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: phase === 'detected' ? '0 0 14px rgba(56, 189, 248, 0.5)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>Answer</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>⌘↵</span>
                  </button>

                  {/* Screenshot ⌘⇧⏎ Button */}
                  <button
                    type="button"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#e2e8f0',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'default',
                    }}
                  >
                    <span>Screenshot</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>⌘⇧↵</span>
                  </button>

                  {/* Chat ⌘⇧D Button */}
                  <button
                    type="button"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#e2e8f0',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'default',
                    }}
                  >
                    <span>Chat</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>⌘⇧D</span>
                  </button>
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#94a3b8', cursor: 'grab' }}>
                    <Move size={14} />
                  </div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                    <Minimize2 size={14} />
                  </div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                    <MoreVertical size={14} />
                  </div>

                  <button
                    type="button"
                    onClick={() => restartSimulation()}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    End
                  </button>
                </div>
              </div>

              {/* ============================================================
                  2. TRANSCRIPTION SPEECH STREAM BAR (Exact Image 1 layout)
                  ============================================================ */}
              <div
                style={{
                  background: 'rgba(34, 37, 44, 0.96)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  minHeight: '46px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Audio wave & Token Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Bouncing Audio Waveform Equalizer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0 4px' }}>
                    <span style={{ width: '3px', height: '14px', background: '#22c55e', borderRadius: '2px', animation: phase === 'transcribing' ? 'wavePulse 0.6s infinite ease-in-out' : 'none' }} />
                    <span style={{ width: '3px', height: '20px', background: '#22c55e', borderRadius: '2px', animation: phase === 'transcribing' ? 'wavePulse 0.8s infinite ease-in-out 0.15s' : 'none' }} />
                    <span style={{ width: '3px', height: '12px', background: '#22c55e', borderRadius: '2px', animation: phase === 'transcribing' ? 'wavePulse 0.7s infinite ease-in-out 0.3s' : 'none' }} />
                  </div>

                  {/* Speech Tokens appearing in real time */}
                  {activeScenario.tokens.slice(0, visibleTokenCount).map((tok, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#f8fafc',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        animation: 'fadeIn 0.25s ease-out',
                      }}
                    >
                      {tok}
                    </span>
                  ))}

                  {phase === 'transcribing' && visibleTokenCount < activeScenario.tokens.length && (
                    <span style={{ width: '6px', height: '14px', background: '#38bdf8', borderRadius: '1px', animation: 'blink 0.8s infinite' }} />
                  )}
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => restartSimulation()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#cbd5e1',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Clear</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>⌘⇧⌫</span>
                  </button>

                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                    <Maximize2 size={13} />
                  </div>
                </div>
              </div>

              {/* ============================================================
                  3. MAIN TELEPROMPTER FLOATING ANSWER WINDOW (Exact Image 1 layout)
                  ============================================================ */}
              <div
                style={{
                  background: 'rgba(28, 31, 38, 0.98)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.85)',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Header bar: Navigation Arrows & Clear */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <ChevronLeft size={13} />
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>⌘←</span>
                    </button>
                    <button
                      type="button"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>⌘→</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => restartSimulation()}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#cbd5e1',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Clear</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>⌘⌫</span>
                    </button>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'grid', placeItems: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                      <Maximize2 size={13} />
                    </div>
                  </div>
                </div>

                {/* Question line with copy icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '14.5px', color: '#f8fafc', lineHeight: 1.5 }}>
                    <span style={{ fontSize: '15px' }}>💬</span>
                    <div>
                      <strong style={{ color: '#ffffff', fontWeight: 700 }}>Question: </strong>
                      <span>{activeScenario.question}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy Answer"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copied ? '#10b981' : '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Answer Summary Callout (⭐ Answer: ...) */}
                {(phase === 'streaming_answer' || phase === 'completed' || phase === 'detected') && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      fontSize: '14.5px',
                      color: '#ffffff',
                      lineHeight: 1.5,
                      animation: 'fadeIn 0.3s ease-out',
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#f59e0b' }}>⭐</span>
                    <div>
                      <strong style={{ color: '#ffffff', fontWeight: 700 }}>Answer: </strong>
                      <span>{activeScenario.strategyHeadline}</span>
                    </div>
                  </div>
                )}

                {/* STAR Structured Points streaming letter-by-letter / line-by-line */}
                {(phase === 'streaming_answer' || phase === 'completed') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    {activeScenario.talkingPoints.map((point, index) => {
                      if (index > activePointIndex) return null;

                      const isCurrentlyTyping = index === activePointIndex && phase === 'streaming_answer';
                      const fullLine = `${point.label}: ${point.desc}`;
                      const displayedLine = isCurrentlyTyping
                        ? fullLine.slice(0, typedChars)
                        : fullLine;

                      return (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '13.5px',
                            color: '#e2e8f0',
                            lineHeight: 1.6,
                            animation: 'fadeIn 0.25s ease-out',
                          }}
                        >
                          <span style={{ color: '#cbd5e1', fontWeight: 800 }}>•</span>
                          <div>
                            <span>{displayedLine}</span>
                            {isCurrentlyTyping && (
                              <span style={{ width: '2px', height: '14px', background: '#38bdf8', display: 'inline-block', verticalAlign: 'middle', marginLeft: '3px', animation: 'blink 0.8s infinite' }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bottom Footer Info: Answer · 18:08 👍 👎 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', marginTop: 'auto', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Answer</span>
                    <span>·</span>
                    <span>{activeScenario.time}</span>
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '6px' }}>
                      <ThumbsUp size={13} style={{ cursor: 'pointer', color: '#94a3b8' }} />
                      <ThumbsDown size={13} style={{ cursor: 'pointer', color: '#94a3b8' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>● 100% Invisible to Zoom Screen Share</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Scenario Selector Bar */}
            <div
              style={{
                background: 'rgba(10, 14, 24, 0.98)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '6px' }}>
                  Select Live Scenario:
                </span>
                {SCENARIOS.map((sc) => {
                  const isSelected = activeScenario.id === sc.id;
                  const Icon = sc.icon;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => restartSimulation(sc)}
                      type="button"
                      style={{
                        background: isSelected ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: isSelected ? '#38bdf8' : '#94a3b8',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icon size={13} style={{ color: isSelected ? '#38bdf8' : '#64748b' }} />
                      <span>{sc.tabLabel}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span>Simulating real-time question detection & typewriter answer streaming</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
