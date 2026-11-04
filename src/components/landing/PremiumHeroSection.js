"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Mic,
  Monitor,
  Check,
  Layers,
  Code2,
  Radio,
  MessageSquare,
  Zap,
  ShieldCheck,
  ArrowRight,
  Server,
  Activity,
  Sliders,
  Video
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'system_design',
    tabLabel: 'System Design · Stripe',
    icon: Server,
    platform: 'Google Meet Enterprise',
    interviewerName: 'David Vance',
    interviewerRole: 'Principal Architect @ Stripe',
    interviewerAvatar: 'DV',
    interviewerColor: '#38bdf8',
    question: 'How would you architect a distributed cache with LRU eviction across 50 nodes and prevent cache stampedes?',
    latency: '88ms',
    confidence: '99.6%',
    strategyHeadline: 'Consistent Hashing + Probabilistic Early Expiration (XFetch) with Redis Cluster',
    talkingPoints: [
      {
        label: 'Partitioning Strategy',
        desc: 'Consistent hashing ring with 150 virtual nodes per physical host to eliminate hot spots.',
      },
      {
        label: 'Eviction Architecture',
        desc: 'Local doubly-linked list + O(1) hash table combined with probabilistic sample eviction.',
      },
      {
        label: 'Stampede Guard',
        desc: 'Mutex lease locks (XADD / Redlock) ensuring single-flight DB hydration during miss spikes.',
      },
      {
        label: 'Consistency SLA',
        desc: 'Eventual consistency via async gossip protocol, falling back to Raft for metadata sync.',
      },
    ],
    resumeMatch: 'Matched: 4 yrs Distributed Infrastructure, Redis Clusters & High-Scale Caching',
    codeSnippet: `// Mutex Lease Lock to prevent thundering herd
local lock = redis.call('SET', 'lock:'..key, token, 'NX', 'PX', 5000)
if lock then
  local val = db.fetch(key)
  redis.call('SET', key, val, 'EX', 3600)
  return val
end`,
  },
  {
    id: 'live_coding',
    tabLabel: 'Live Coding · Meta',
    icon: Code2,
    platform: 'HackerRank Live Assessment',
    interviewerName: 'Maya Lin',
    interviewerRole: 'Staff Engineering Lead @ Meta',
    interviewerAvatar: 'ML',
    interviewerColor: '#a855f7',
    question: 'Implement an LRU Cache with get() and put() running strictly in O(1) time complexity.',
    latency: '74ms',
    confidence: '99.8%',
    strategyHeadline: 'Doubly-Linked List with Hash Map & Sentinel Dummy Nodes',
    talkingPoints: [
      {
        label: 'Data Structure',
        desc: 'HashMap stores Key -> Node pointer for O(1) random lookup. Doubly-linked list tracks recency.',
      },
      {
        label: 'get(key) Logic',
        desc: 'Lookup in O(1). If present, unlink node from current position and move to head (MRU).',
      },
      {
        label: 'put(key, val)',
        desc: 'If exists, update & move to head. If full, evict tail.prev node in O(1) time complexity.',
      },
      {
        label: 'Edge Defense',
        desc: 'Thread-safety with read-write mutex lock; capacity=0 rejection; null pointer defense.',
      },
    ],
    resumeMatch: 'Matched: Core Algorithms, Low-Level Memory Optimization & Concurrent Systems',
    codeSnippet: `class LRUCache:
    def __init__(self, capacity: int):
        self.cap, self.map = capacity, {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head`,
  },
  {
    id: 'behavioral_star',
    tabLabel: 'Behavioral STAR · Amazon',
    icon: MessageSquare,
    platform: 'Zoom Enterprise Video',
    interviewerName: 'Sarah Chen',
    interviewerRole: 'Bar Raiser & Staff Lead @ Amazon',
    interviewerAvatar: 'SC',
    interviewerColor: '#10b981',
    question: 'Walk me through a critical technical disagreement with your manager on architecture.',
    latency: '92ms',
    confidence: '99.4%',
    strategyHeadline: 'Frame disagreement on empirical benchmark metrics, not authority.',
    talkingPoints: [
      {
        label: 'Situation (S)',
        desc: 'Team planned a complete language rewrite that I evaluated as premature for current traffic.',
      },
      {
        label: 'Task (T)',
        desc: 'Deliver 10x throughput scaling without derailing our quarterly product roadmap deliverables.',
      },
      {
        label: 'Action (A)',
        desc: 'Ran automated profiling; proved bottleneck was missing composite index, not runtime speed.',
      },
      {
        label: 'Result (R)',
        desc: 'Saved 3 months of refactoring engineering time and shipped 2 weeks ahead of target.',
      },
    ],
    resumeMatch: 'Matched: Incident Commander, 99.99% Production Reliability & Leadership Loop',
    codeSnippet: `// Impact Matrix:
- Refactoring time saved: 12 engineering weeks
- Throughput improvement: 8.4x increase
- Zero regressions across 4.2M active user accounts`,
  },
];

const COMPATIBLE_PLATFORMS = [
  'Zoom Video Meetings',
  'Google Meet Enterprise',
  'Microsoft Teams',
  'HackerRank Live',
  'CoderPad Live Interviews',
  'LeetCode Assessment',
  'CodeSignal Coding Rounds',
];

export default function PremiumHeroSection({ onSignupClick, onWatchDemo }) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(12); // playback seconds 0 to 30
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeScenario = SCENARIOS[activeScenarioIdx];
  const maxDuration = 30;

  // Video simulation playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(100 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= maxDuration) return 0;
        return parseFloat(next.toFixed(1));
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const formatSecs = (sec) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPct = (currentTime / maxDuration) * 100;
  const isAnswerVisible = currentTime >= 8;

  return (
    <section id="hero" className="px-hero" style={{ padding: '48px 0 64px 0', position: 'relative' }}>
      <div className="px-container">
        {/* Top Feature Pill Badge with Emerald Pulse */}
        <div className="px-hero-pill" style={{ marginBottom: '18px' }}>
          <span className="px-hero-pulse" />
          <span>Hardware-Invisible AI Teleprompter for Live Technical Interviews</span>
        </div>

        {/* Value Proposition Headline */}
        <h1 className="px-hero-headline" style={{ marginBottom: '18px', maxWidth: '880px' }}>
          Get the right answer <br />
          <span className="px-section-title-gradient">while you're still talking</span>
        </h1>

        {/* Subheadline */}
        <p className="px-hero-subheadline" style={{ marginBottom: '28px', maxWidth: '720px' }}>
          The undetectable AI copilot for Zoom, Google Meet & Teams. Automatically captures interviewer questions, injects your real resume context, and streams STAR answers & code logic directly to your stealth overlay in under 1.2s.
        </p>

        {/* CTA Group */}
        <div className="px-hero-cta-group" style={{ marginBottom: '24px' }}>
          <button
            onClick={onSignupClick}
            className="px-btn px-btn-primary"
            style={{
              padding: '14px 32px',
              fontSize: '15px',
              borderRadius: '9999px',
              fontWeight: 800,
              background: '#ffffff',
              color: '#040711',
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} style={{ color: '#06b6d4' }} />
            <span>Start Free Trial · 5 Sessions</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={onWatchDemo}
            className="px-btn px-btn-secondary"
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              borderRadius: '9999px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Play size={14} style={{ fill: '#38bdf8', color: '#38bdf8' }} />
            <span>Watch 90s Live Demo</span>
          </button>
        </div>

        {/* Capability Trust Strip */}
        <div className="px-trust-strip" style={{ marginBottom: '36px', gap: '20px' }}>
          <div className="px-trust-item">
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
            <span>100% Invisible to Zoom, Teams & Meet</span>
          </div>
          <div className="px-trust-item">
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <span>5 Free Sessions (10 min each)</span>
          </div>
          <div className="px-trust-item">
            <Zap size={16} style={{ color: '#00f5ff' }} />
            <span>Sub-118ms Streaming Latency</span>
          </div>
          <div className="px-trust-item">
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <span>STAR Behavioral & Optimal Code Engine</span>
          </div>
        </div>

        {/* ================================================================
            CINEMATIC INTERACTIVE VIDEO PLAYER COCKPIT (Hero Centerpiece)
            ================================================================ */}
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            textAlign: 'left',
            position: 'relative'
          }}
        >
          {/* Main Video Player Container */}
          <div
            style={{
              background: '#080c16',
              borderRadius: '20px',
              border: '1px solid rgba(0, 245, 255, 0.25)',
              boxShadow: '0 30px 90px -10px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 245, 255, 0.18)',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Video Player Topbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                background: 'rgba(11, 16, 28, 0.98)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 600 }}>
                  LIVE INTERVIEW VIDEO STREAM · {activeScenario.platform}
                </span>
              </div>

              {/* Scenario Switchers inside Video Titlebar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {SCENARIOS.map((sc, i) => {
                  const Icon = sc.icon;
                  const isActive = activeScenarioIdx === i;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setActiveScenarioIdx(i);
                        setCurrentTime(0);
                        setIsPlaying(true);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isActive ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: isActive ? '1px solid rgba(0, 245, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#00f5ff' : '#94a3b8'
                      }}
                    >
                      <Icon size={12} />
                      <span>{sc.tabLabel}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#f87171' }}>
                  <span className={`rec-pulse-dot ${isPlaying ? '' : 'paused'}`} />
                  <span>{isPlaying ? 'LIVE 4K' : 'PAUSED'}</span>
                </div>

                <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  WDA Excluded
                </span>
              </div>
            </div>

            {/* Split Video Stage: Live Interview Audio on Left + Stealth Teleprompter on Right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.35fr',
                background: 'radial-gradient(ellipse 90% 70% at 50% 10%, rgba(14, 20, 36, 0.95), rgba(6, 9, 15, 0.98))',
                minHeight: '430px',
                alignItems: 'stretch',
                position: 'relative'
              }}
            >
              {/* Frosted Pause Overlay when Video is Paused */}
              {!isPlaying && (
                <div
                  onClick={() => setIsPlaying(true)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(4, 7, 16, 0.65)',
                    backdropFilter: 'blur(6px)',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 35px rgba(0, 245, 255, 0.7)',
                      marginBottom: '10px'
                    }}
                  >
                    <Play size={28} style={{ marginLeft: '3px' }} />
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }}>
                    CLICK TO RESUME VIDEO SIMULATION
                  </span>
                </div>
              )}

              {/* Left Column: Interviewer Video Call & Audio Stream */}
              <div
                style={{
                  padding: '24px',
                  borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'rgba(8, 12, 22, 0.45)'
                }}
              >
                <div>
                  {/* Interviewer Profile Card */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${activeScenario.interviewerColor}, #818cf8)`,
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 0 16px ${activeScenario.interviewerColor}40`
                        }}
                      >
                        {activeScenario.interviewerAvatar}
                      </div>

                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                          {activeScenario.interviewerName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          {activeScenario.interviewerRole}
                        </div>
                      </div>
                    </div>

                    {/* Live Equalizer Animation */}
                    <div className="audio-equalizer" style={{ height: '18px' }}>
                      {[...Array(6)].map((_, i) => (
                        <span
                          key={i}
                          className="audio-bar"
                          style={{
                            animationDuration: `${0.5 + i * 0.15}s`,
                            height: isPlaying ? undefined : '5px'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Captured Question Box */}
                  <div
                    style={{
                      background: 'rgba(5, 8, 15, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--feonix-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      <Mic size={12} />
                      <span>Live Speech Recognition · 48kHz Stereo</span>
                    </div>

                    <div style={{ fontSize: '14.5px', color: '#f1f5f9', fontWeight: 600, lineHeight: 1.45 }}>
                      "{activeScenario.question}"
                    </div>
                  </div>

                  {/* Vector RAG Context Card */}
                  <div
                    style={{
                      background: 'rgba(0, 245, 255, 0.04)',
                      border: '1px solid rgba(0, 245, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#00f5ff', textTransform: 'uppercase', marginBottom: '3px' }}>
                      ⚡ Candidate Vector Context
                    </div>
                    <div>{activeScenario.resumeMatch}</div>
                  </div>
                </div>

                {/* Left Bottom Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Latency: <strong style={{ color: 'var(--feonix-emerald)' }}>{activeScenario.latency}</strong>
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Confidence: <strong style={{ color: 'var(--feonix-cyan)' }}>{activeScenario.confidence}</strong>
                  </span>
                </div>
              </div>

              {/* Right Column: Stealth Teleprompter HUD Stream */}
              <div
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'rgba(12, 17, 30, 0.65)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Floating Teleprompter Dock Header */}
                  <div
                    style={{
                      background: 'rgba(20, 26, 40, 0.92)',
                      border: '1px solid rgba(0, 245, 255, 0.3)',
                      borderRadius: '10px',
                      padding: '7px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>
                        FEONIX AI TELEPROMPTER DOCK
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      <span>Answer ⌘↩</span>
                      <span>·</span>
                      <span>Screenshot ⇧⌘↩</span>
                      <span>·</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>59:01</span>
                    </div>
                  </div>

                  {/* Strategy Headline */}
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#38bdf8', marginBottom: '14px', lineHeight: 1.4 }}>
                    {activeScenario.strategyHeadline}
                  </div>

                  {/* Talking Points List */}
                  {isAnswerVisible ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '16px' }}>
                      {activeScenario.talkingPoints.map((pt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#f1f5f9', lineHeight: 1.45 }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--feonix-emerald)', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong style={{ color: 'var(--feonix-cyan)' }}>{pt.label}:</strong>{' '}
                            <span>{pt.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '24px 16px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', border: '1px dashed rgba(255, 255, 255, 0.1)', textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Listening to interviewer voice stream...
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: 600 }}>
                        STAR points will stream in automatically at 00:08
                      </div>
                    </div>
                  )}
                </div>

                {/* Code / Implementation Drawer */}
                <div
                  style={{
                    background: '#050811',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '10px 14px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#94a3b8',
                    maxHeight: '105px',
                    overflowY: 'auto'
                  }}
                >
                  <pre style={{ margin: 0 }}>
                    <code>{activeScenario.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Video Player Control Bar */}
            <div className="video-player-controls" style={{ background: 'rgba(10, 15, 26, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 20px' }}>
              <div className="video-ctrl-group">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="video-play-round"
                  style={{ width: '34px', height: '34px' }}
                  title={isPlaying ? 'Pause Video' : 'Play Video'}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                </button>

                <button
                  onClick={() => {
                    setCurrentTime(0);
                    setIsPlaying(true);
                  }}
                  className="video-ctrl-btn"
                  title="Restart Video Simulation"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="video-ctrl-btn"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                <span style={{ fontSize: '12.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {formatSecs(currentTime)} / 00:30
                </span>
              </div>

              {/* Interactive Scrubbable Progress Timeline */}
              <div
                className="video-progress-bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newSec = (clickX / rect.width) * maxDuration;
                  setCurrentTime(parseFloat(newSec.toFixed(1)));
                }}
                title="Click anywhere to seek video"
              >
                <div className="video-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="video-ctrl-group">
                {/* Speed Multiplier */}
                <button
                  onClick={() => {
                    const speeds = [1, 1.25, 1.5, 2];
                    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                    setPlaybackSpeed(next);
                  }}
                  className="video-ctrl-btn"
                  style={{ fontSize: '11.5px', fontWeight: 700 }}
                  title="Video Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                  4K 60FPS
                </span>

                <button
                  onClick={() => {
                    if (onSignupClick) onSignupClick();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(0, 245, 255, 0.35)'
                  }}
                >
                  <span>Try Free</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Compatible Platform Badges Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '28px',
              flexWrap: 'wrap',
              opacity: 0.85
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seamless Compatibility:
            </span>
            {COMPATIBLE_PLATFORMS.map((plat) => (
              <span
                key={plat}
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}
              >
                {plat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
