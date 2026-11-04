"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Mic,
  Radio,
  Database,
  Cpu,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  Play,
  RotateCcw,
  Layers,
  Code2,
  Sliders,
  Server
} from 'lucide-react';

const SIMULATION_QUESTIONS = [
  {
    id: 'system-design',
    category: 'System Architecture',
    label: 'Distributed Rate Limiter',
    question: 'How would you architect a distributed rate limiter handling 250,000 requests/sec with Redis sliding window?',
    latency: '88ms',
    confidence: '99.6%',
    candidateContext: 'Resume match: 4 yrs Distributed Infrastructure, Redis Clusters & Kafka',
    nodes: [
      { name: 'WASAPI Loopback', type: 'Audio In', desc: '48kHz Stereo Capture', latency: '12ms' },
      { name: 'Neural Whisper Engine', type: 'STT', desc: 'Real-time Phoneme Stream', latency: '28ms' },
      { name: 'Vector RAG Index', type: 'Context', desc: 'Resume & System Patterns', latency: '18ms' },
      { name: 'STAR Synthesis Core', type: 'AI LLM', desc: 'Algorithmic Optimization', latency: '30ms' }
    ],
    answerHeadline: 'Use Redis Sorted Sets (ZSET) with sliding window logs executed atomically via Lua scripts.',
    bulletPoints: [
      { label: 'Atomic Execution', text: 'ZREMRANGEBYSCORE + ZCARD + ZADD bundled in an atomic Redis Lua script to eliminate race conditions.' },
      { label: 'Memory Efficiency', text: 'Auto-expire keys using sliding TTL window; partition user buckets across 16 Redis cluster shards.' },
      { label: 'Edge Fallback', text: 'Local in-memory token bucket in Envoy / Cloudflare Workers if Redis cluster connection drops.' }
    ],
    codeSnippet: `// Atomic Lua Sliding Window on Redis Cluster
local key = KEYS[1]; local now = tonumber(ARGV[1]); local window = tonumber(ARGV[2]); local limit = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local current = redis.call('ZCARD', key)
if current < limit then
  redis.call('ZADD', key, now, now)
  redis.call('EXPIRE', key, math.ceil(window / 1000))
  return 1 -- Request Allowed
end
return 0 -- 429 Too Many Requests`
  },
  {
    id: 'algorithms',
    category: 'Data Structures & Algorithms',
    label: 'LRU Cache in O(1)',
    question: 'Implement an LRU Cache with get() and put() running strictly in O(1) time complexity.',
    latency: '74ms',
    confidence: '99.8%',
    candidateContext: 'Resume match: Core Data Structures, Low-Level Memory Management',
    nodes: [
      { name: 'WASAPI Loopback', type: 'Audio In', desc: 'Interviewer Voice Capture', latency: '10ms' },
      { name: 'Neural Whisper Engine', type: 'STT', desc: 'Phonetic Transcription', latency: '24ms' },
      { name: 'Vector RAG Index', type: 'Context', desc: 'LeetCode & Complexity Bank', latency: '15ms' },
      { name: 'STAR Synthesis Core', type: 'AI LLM', desc: 'Clean Syntax & O(1) Proof', latency: '25ms' }
    ],
    answerHeadline: 'Pair a Hash Table with a Doubly-Linked List containing dummy head and tail sentinel nodes.',
    bulletPoints: [
      { label: 'Data Topology', text: 'HashMap stores Key -> Node pointer for O(1) lookup. Doubly-linked list maintains exact recency ordering.' },
      { label: 'get(key) Method', text: 'Fetch node in O(1). If found, unlink node and move to head (Most Recently Used).' },
      { label: 'put(key, val)', text: 'If exists, update value and shift to head. If capacity exceeded, evict tail.prev node in O(1).' }
    ],
    codeSnippet: `class LRUCache:
    def __init__(self, capacity: int):
        self.cap, self.map = capacity, {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def get(self, key: int) -> int:
        if key not in self.map: return -1
        node = self.map[key]
        self._remove(node); self._add_head(node)
        return node.val`
  },
  {
    id: 'behavioral',
    category: 'Executive Behavioral',
    label: 'High-Stakes Crisis STAR',
    question: 'Tell me about a critical production outage where you disagreed with leadership on the resolution.',
    latency: '95ms',
    confidence: '99.2%',
    candidateContext: 'Resume match: P0 Incident Commander, 99.99% Uptime Engineering',
    nodes: [
      { name: 'WASAPI Loopback', type: 'Audio In', desc: 'Interviewer Voice Capture', latency: '12ms' },
      { name: 'Neural Whisper Engine', type: 'STT', desc: 'Speech Turn Detection', latency: '29ms' },
      { name: 'Vector RAG Index', type: 'Context', desc: 'Candidate Resume Stories', latency: '22ms' },
      { name: 'STAR Synthesis Core', type: 'AI LLM', desc: 'Situation/Task/Action/Result', latency: '32ms' }
    ],
    answerHeadline: 'Frame resolution as empirical benchmark evidence rather than hierarchical opinion.',
    bulletPoints: [
      { label: 'Situation (S)', text: 'P0 database lock-up during peak Black Friday traffic threatening 2.8M checkout transactions.' },
      { label: 'Action (A)', text: 'Resisted premature full rollback; authored targeted pg_terminate_backend script and added missing composite index.' },
      { label: 'Result (R)', text: 'Restored service in 3.5 minutes; documented post-mortem that eliminated recurring connection stalls.' }
    ],
    codeSnippet: `// STAR Outage Metrics Matrix
Situation: P0 connection saturation (35,000 queued threads)
Resolution Time: 3.5 minutes (vs 45 min estimated rollback)
Impact: 100% data integrity preserved, 0 transactions lost`
  }
];

export default function InteractiveNeuralPipelineStudio({ onGetStarted }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeStage, setActiveStage] = useState(3); // 0 to 3
  const [isSimulating, setIsSimulating] = useState(true);
  const [simProgress, setSimProgress] = useState(100);

  const selected = SIMULATION_QUESTIONS[selectedIdx];

  // Auto pipeline flow animation
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleSelectQuestion = (idx) => {
    setSelectedIdx(idx);
    setActiveStage(0);
    setSimProgress(0);
    setTimeout(() => {
      setActiveStage(1);
      setTimeout(() => {
        setActiveStage(2);
        setTimeout(() => {
          setActiveStage(3);
          setSimProgress(100);
        }, 400);
      }, 400);
    }, 400);
  };

  return (
    <section className="prod-section" id="neural-pipeline">
      {/* Section Header */}
      <div className="prod-section-header">
        <div className="prod-badge">
          <Brain size={14} />
          <span>Interactive Neural Pipeline</span>
        </div>
        <h2 className="prod-title">
          Watch AI Turn Speech Into <span className="prod-title-gradient">STAR Solutions</span> in &lt;100ms
        </h2>
        <p className="prod-desc">
          Click any real-world technical question below to watch Feonix AI capture system audio, retrieve your exact resume experience, and stream interview-winning talking points to your stealth HUD.
        </p>
      </div>

      {/* Interactive Question Pill Selectors */}
      <div className="studio-tabs">
        {SIMULATION_QUESTIONS.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => handleSelectQuestion(idx)}
            className={`studio-tab-btn ${selectedIdx === idx ? 'active' : ''}`}
          >
            {q.id === 'system-design' && <Server size={15} />}
            {q.id === 'algorithms' && <Code2 size={15} />}
            {q.id === 'behavioral' && <Activity size={15} />}
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Main Animated Pipeline Architecture Stage */}
      <div
        style={{
          borderRadius: '24px',
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0, 245, 255, 0.08), transparent 70%), #080c16',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          padding: '36px 32px',
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.8), 0 0 45px rgba(0, 245, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Ambient Laser Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f5ff, #8b5cf6, transparent)',
            animation: 'laserScan 6s linear infinite'
          }}
        />

        {/* 4 Interactive Node Pipeline Conduits */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '36px',
            position: 'relative'
          }}
        >
          {selected.nodes.map((node, i) => {
            const isActive = activeStage === i;
            const isCompleted = activeStage > i;

            return (
              <div
                key={i}
                style={{
                  borderRadius: '16px',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0, 245, 255, 0.14), rgba(139, 92, 246, 0.12))'
                    : 'rgba(12, 17, 28, 0.65)',
                  border: isActive
                    ? '1px solid rgba(0, 245, 255, 0.55)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '20px',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 0 28px rgba(0, 245, 255, 0.22)' : 'none',
                  transform: isActive ? 'translateY(-3px)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(0, 245, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#00f5ff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800
                    }}
                  >
                    0{i + 1}
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isActive ? 'var(--feonix-emerald)' : '#64748b',
                      background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {node.latency}
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                  {node.name}
                </div>

                <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                  {node.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Question & Teleprompter Execution Terminal */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.35fr',
            gap: '24px',
            alignItems: 'stretch'
          }}
        >
          {/* Left: Spoken Question & Resume RAG Context */}
          <div
            style={{
              borderRadius: '18px',
              background: 'rgba(10, 14, 24, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--feonix-cyan)', textTransform: 'uppercase' }}>
                  <Radio size={14} className="rec-pulse-dot" />
                  <span>Interviewer Spoken Query</span>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--feonix-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                  {selected.latency} Turnaround
                </span>
              </div>

              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.45,
                  marginBottom: '20px'
                }}
              >
                "{selected.question}"
              </div>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  ⚡ Vector RAG Context Retreived
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                  {selected.candidateContext}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Confidence: <strong style={{ color: 'var(--feonix-emerald)' }}>{selected.confidence}</strong>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--feonix-emerald)' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>WDA Invisibility Active</span>
              </div>
            </div>
          </div>

          {/* Right: Live Floating Teleprompter HUD Output */}
          <div
            style={{
              borderRadius: '18px',
              background: 'rgba(12, 17, 30, 0.95)',
              border: '1px solid rgba(0, 245, 255, 0.35)',
              padding: '24px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 245, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                    FEONIX AI TELEPROMPTER HUD
                  </span>
                </div>

                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Ctrl + Shift + H to Hide
                </span>
              </div>

              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#38bdf8', marginBottom: '14px', lineHeight: 1.4 }}>
                {selected.answerHeadline}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {selected.bulletPoints.map((bp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#f1f5f9', lineHeight: 1.45 }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--feonix-emerald)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--feonix-cyan)' }}>{bp.label}:</strong>{' '}
                      <span>{bp.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Code / Telemetry Drawer */}
            <div
              style={{
                background: '#060911',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '12px 14px',
                fontFamily: 'monospace',
                fontSize: '11.5px',
                color: '#94a3b8',
                maxHeight: '120px',
                overflowY: 'auto'
              }}
            >
              <pre style={{ margin: 0 }}>
                <code>{selected.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

