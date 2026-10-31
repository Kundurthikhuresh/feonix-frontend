"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Zap,
  Activity,
  Mic,
  Camera,
  MessageSquare,
  Maximize2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Move,
  Code2,
  Check,
  Shield,
  Layers,
  Radio,
  EyeOff,
  Terminal,
} from 'lucide-react';
import Hero3DVisual from './Hero3DVisual';

const SCENARIOS = [
  {
    id: 'rate_limiter',
    tabLabel: 'System Design · Rate Limiter',
    icon: Layers,
    interviewerName: 'Sarah Chen',
    interviewerRole: 'Staff Infrastructure Lead @ Stripe',
    interviewerAvatar: 'SC',
    interviewerColor: '#38bdf8',
    question: 'How would you design a distributed rate limiter for a public API that handles 100,000 QPS across multi-region edge gateways?',
    tokens: ['How would you', 'design a distributed', 'rate limiter for a', 'public API at 100k QPS?'],
    highlightWord: 'public API at 100k QPS?',
    latency: '0.88s',
    confidence: '99.4%',
    time: '14:22',
    strategyHeadline: 'Sliding Window Counter + Token Bucket per API Key in Redis Cluster',
    talkingPoints: [
      {
        label: 'Algorithm Selection',
        desc: 'Token Bucket per API key. Refills at rate R tokens/sec up to burst capacity B. Atomically decremented via Lua script to prevent race conditions across parallel requests.',
      },
      {
        label: 'Distributed Architecture',
        desc: 'Redis Cluster sharded by hash(tenant_id). In-memory local cache at Envoy / Cloudflare Edge Gateway absorbs 80% read bursts without hitting centralized Redis.',
      },
      {
        label: 'Standard HTTP Headers',
        desc: 'Automatically emits X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After on HTTP 429 Too Many Requests.',
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
  redis.call('EXPIRE', key, 1) -- 1-second rolling window
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
    question: 'Can you implement an LRU (Least Recently Used) Cache with strict O(1) time complexity for both get and put operations?',
    tokens: ['Can you', 'implement an', 'LRU cache with', 'strict O(1) complexity?'],
    highlightWord: 'strict O(1) complexity?',
    latency: '0.92s',
    confidence: '99.8%',
    time: '26:40',
    strategyHeadline: 'Doubly Linked List for O(1) node ordering + Hash Map for O(1) key lookups',
    talkingPoints: [
      {
        label: 'Data Structure Choice',
        desc: 'Doubly Linked List maintains access recency (Head = Most Recent, Tail = Least Recent). Hash Map stores key -> Node pointer for instant O(1) node retrieval.',
      },
      {
        label: 'Eviction Logic',
        desc: 'When capacity reaches max on put(), remove the node immediately before the tail sentinel and purge its key from the hash map in O(1).',
      },
      {
        label: 'Recency Update',
        desc: 'On any get() or overwrite put(), detach node from its current position and splice directly behind the head sentinel in O(1) pointer updates.',
      },
    ],
    codeSnippet: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map(); // Preserves insertion order
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val); // Move to most recently used
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.cap) {
      this.map.delete(this.map.keys().next().value); // Evict LRU
    }
    this.map.set(key, value);
  }
}`,
  },
  {
    id: 'outage_star',
    tabLabel: 'STAR Behavioral · Outage',
    icon: Zap,
    interviewerName: 'Marcus Vance',
    interviewerRole: 'Director of Engineering @ Netflix',
    interviewerAvatar: 'MV',
    interviewerColor: '#10b981',
    question: 'Tell me about a high-severity production outage where you had to lead technical incident resolution under intense pressure.',
    tokens: ['Tell me about', 'a critical', 'production outage and', 'how you led resolution?'],
    highlightWord: 'how you led resolution?',
    latency: '1.04s',
    confidence: '98.9%',
    time: '38:15',
    strategyHeadline: 'Payment connection pool starvation during Black Friday traffic surge',
    talkingPoints: [
      {
        label: 'Situation & Task',
        desc: 'Payment processing dropped 42% of checkout attempts during peak Black Friday surge due to database connection exhaustion. Led 6-engineer war room with a 15-minute recovery SLA.',
      },
      {
        label: 'Action Taken',
        desc: 'Isolated unclosed database connections in a newly deployed analytics hook via Datadog traces. Triggered an instant zero-downtime rollback and scaled connection pool from 60 to 240.',
      },
      {
        label: 'Quantified Result',
        desc: 'Full 99.99% payment processing restored in 11 minutes. Added automated connection leak linters and circuit breaker thresholds preventing future cascade failures.',
      },
    ],
    codeSnippet: null,
  },
  {
    id: 'db_sharding',
    tabLabel: 'Architecture · DB Sharding',
    icon: Radio,
    interviewerName: 'Elena Rostova',
    interviewerRole: 'Principal Systems Architect @ Uber',
    interviewerAvatar: 'ER',
    interviewerColor: '#06b6d4',
    question: 'How would you scale a transactional PostgreSQL database beyond single-node write limits to support 500 million users?',
    tokens: ['How would you', 'scale transactional DB writes', 'beyond single-node limits', 'for 500M users?'],
    highlightWord: 'for 500M users?',
    latency: '0.95s',
    confidence: '99.1%',
    time: '45:10',
    strategyHeadline: 'Consistent Hashing Sharding Key + Read Replicas + Citus / Vitess Middleware',
    talkingPoints: [
      {
        label: 'Sharding Strategy',
        desc: 'Partition tables by tenant_id / user_id using Consistent Hashing on virtual rings to minimize data movement during node additions.',
      },
      {
        label: 'Cross-Shard Operations',
        desc: 'Avoid multi-shard distributed transactions. Denormalize user-centric query paths; use asynchronous event outbox patterns (Kafka) for cross-service eventual consistency.',
      },
      {
        label: 'Read/Write Splitting',
        desc: 'Direct transactional writes to primary shards while routing analytical and dashboard reads through asynchronous read replicas with warm caches.',
      },
    ],
    codeSnippet: null,
  },
];

export default function PremiumHeroSection({ onSignupClick, onWatchDemo }) {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [activeView, setActiveView] = useState('talking_points'); // 'talking_points' | 'code'
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            ================================================================ */}
        <div style={{ maxWidth: '1060px', margin: '0 auto', textAlign: 'left', position: 'relative' }}>
          
          {/* Subtle Floating 3D AI Assistant Core Badge */}
          <div
            style={{
              position: 'absolute',
              top: '-42px',
              right: '24px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(12, 17, 28, 0.92)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '999px',
              padding: '6px 14px 6px 8px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.15)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ width: '28px', height: '28px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hero3DVisual size={32} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                Feonix Neural Core
              </span>
              <span style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
                Streaming Whisper-1 • {activeScenario.latency}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Zoom Video Active
                </span>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '3px 8px', borderRadius: '4px' }}>
                  WDA_EXCLUDEFROMCAPTURE
                </span>
              </div>
            </div>

            {/* Video Call Backdrop with Floating Parakeet HUD */}
            <div
              style={{
                position: 'relative',
                padding: '24px 24px 28px 24px',
                background: 'radial-gradient(ellipse 90% 70% at 50% 20%, rgba(16, 24, 40, 0.98), rgba(6, 9, 15, 0.99))',
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Subtle background meeting grid texture */}
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
                  THE UNIFIED FEONIX AI STEALTH TELEPROMPTER WIDGET
                  ============================================================ */}
              <div
                style={{
                  width: '100%',
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* 1. Top HUD Control Capsule */}
                <div
                  style={{
                    background: 'rgba(20, 27, 44, 0.95)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '3px 9px', borderRadius: '999px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.4s infinite' }} />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', letterSpacing: '0.04em' }}>LIVE SESSION ACTIVE</span>
                    </div>

                    <div style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${activeScenario.interviewerColor}22`, border: `1px solid ${activeScenario.interviewerColor}60`, display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800, color: activeScenario.interviewerColor }}>
                        {activeScenario.interviewerAvatar}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                          {activeScenario.interviewerName}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                          {activeScenario.interviewerRole}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Action Hotkeys */}
                    <button
                      type="button"
                      style={{
                        background: 'rgba(6, 182, 212, 0.2)',
                        border: '1px solid rgba(6, 182, 212, 0.5)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'default',
                      }}
                    >
                      <span>Answer</span>
                      <kbd style={{ fontFamily: 'sans-serif', fontSize: '10px', background: 'rgba(255, 255, 255, 0.12)', padding: '1px 4px', borderRadius: '3px', color: '#ffffff' }}>⌘↵</kbd>
                    </button>

                    <button
                      type="button"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'default',
                      }}
                    >
                      <span>Screenshot</span>
                      <kbd style={{ fontFamily: 'sans-serif', fontSize: '10px', background: 'rgba(255, 255, 255, 0.08)', padding: '1px 4px', borderRadius: '3px' }}>⌘⇧↵</kbd>
                    </button>

                    <button
                      type="button"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'default',
                      }}
                    >
                      <span>Chat</span>
                      <kbd style={{ fontFamily: 'sans-serif', fontSize: '10px', background: 'rgba(255, 255, 255, 0.08)', padding: '1px 4px', borderRadius: '3px' }}>⌘⇧D</kbd>
                    </button>

                    <div style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.12)', margin: '0 2px' }} />

                    <button
                      type="button"
                      style={{
                        background: '#dc2626',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'default',
                      }}
                    >
                      End
                    </button>
                  </div>
                </div>

                {/* 2. Transcription Token Stream Bar */}
                <div
                  style={{
                    background: 'rgba(18, 24, 38, 0.92)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      INTERVIEWER SPEECH:
                    </span>

                    {activeScenario.tokens.map((token, i) => {
                      const isHigh = token === activeScenario.highlightWord;
                      return (
                        <span
                          key={i}
                          style={{
                            background: isHigh ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                            border: `1px solid ${isHigh ? 'rgba(34, 197, 94, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: isHigh ? '#4ade80' : '#e2e8f0',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: isHigh ? 700 : 500,
                          }}
                        >
                          {token}
                        </span>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '10.5px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      ● Question Detected ({activeScenario.confidence})
                    </span>
                  </div>
                </div>

                {/* 3. Main Glass Teleprompter Answer Card */}
                <div
                  style={{
                    background: 'rgba(16, 22, 36, 0.96)',
                    backdropFilter: 'blur(28px)',
                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Card Sub-Header Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveView('talking_points')}
                        style={{
                          background: activeView === 'talking_points' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${activeView === 'talking_points' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: activeView === 'talking_points' ? '#38bdf8' : '#94a3b8',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span>STAR Talking Points</span>
                      </button>

                      {activeScenario.codeSnippet && (
                        <button
                          type="button"
                          onClick={() => setActiveView('code')}
                          style={{
                            background: activeView === 'code' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${activeView === 'code' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: activeView === 'code' ? '#38bdf8' : '#94a3b8',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Code2 size={13} />
                          <span>Runnable Code</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={handleCopy}
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600 }}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Answer Strategy Callout */}
                  <div
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#f59e0b', flexShrink: 0 }}>⭐</span>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '6px' }}>
                        Executive Summary:
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>
                        {activeScenario.strategyHeadline}
                      </span>
                    </div>
                  </div>

                  {/* View: Structured Talking Points vs Code Solution */}
                  {activeView === 'talking_points' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeScenario.talkingPoints.map((pt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', lineHeight: 1.6 }}>
                          <span style={{ color: '#06b6d4', fontWeight: 800, marginTop: '2px' }}>•</span>
                          <div>
                            <strong style={{ color: '#f8fafc', fontWeight: 700 }}>{pt.label}: </strong>
                            <span style={{ color: '#cbd5e1' }}>{pt.desc}</span>
                            {i === activeScenario.talkingPoints.length - 1 && (
                              <span style={{ display: 'inline-block', width: '2px', height: '14px', background: '#38bdf8', verticalAlign: 'middle', marginLeft: '3px', animation: 'blink 1s infinite' }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#070b13', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#38bdf8', overflowX: 'auto' }}>
                      <pre style={{ margin: 0 }}>{activeScenario.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Teleprompter Footer Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', fontSize: '11.5px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span>Answer Latency: <strong style={{ color: '#10b981' }}>{activeScenario.latency}</strong></span>
                      <span>•</span>
                      <span>STAR Certified</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <ThumbsUp size={13} style={{ cursor: 'pointer', color: '#94a3b8' }} />
                        <ThumbsDown size={13} style={{ cursor: 'pointer', color: '#94a3b8' }} />
                      </div>
                      <span style={{ color: '#94a3b8' }}>·</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>100% Invisible to Zoom Screen Share</span>
                    </div>
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
                      onClick={() => {
                        setActiveScenario(sc);
                        setActiveView('talking_points');
                      }}
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

              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span>Click any scenario to test live teleprompter responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
