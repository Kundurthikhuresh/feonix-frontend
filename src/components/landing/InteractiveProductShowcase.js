"use client";

import React, { useState, useRef } from 'react';
import {
  Zap,
  Mic,
  Code2,
  Camera,
  MessageSquare,
  FileText,
  CheckCircle2,
  ChevronRight,
  Shield,
  Layers,
  Terminal,
  Activity,
  Copy,
  Check,
} from 'lucide-react';

const CAPABILITIES = [
  {
    id: 'copilot',
    label: 'Interview Copilot',
    icon: Zap,
    tag: 'Live In-Call Teleprompter',
    title: 'Undetectable Real-Time Interview Copilot',
    description:
      'Floats seamlessly over Zoom, Microsoft Teams, Google Meet, or browser tabs. Detects spoken questions in sub-seconds and streams structured STAR talking points directly on screen.',
    bullets: [
      '100% Screen-Share Invisible: Native window exclusion prevents interviewer visibility',
      'Under 1.2s Latency: Real-time Whisper transcription and low-latency streaming responses',
      'Dual-Audio Capture: Listens to incoming interviewer audio and candidate microphone simultaneously',
    ],
  },
  {
    id: 'transcription',
    label: 'Live Transcription',
    icon: Mic,
    tag: 'Speech-to-Text Engine',
    title: 'Streaming Word-by-Word Audio Transcription',
    description:
      'Continuous real-time speech token recognition tracks fast conversational cadences, technical jargon, acronyms, and complex interview prompts without dropped words.',
    bullets: [
      'Token-level audio streaming recognizes microservice and architecture terminology',
      'Automatic question boundary detection flags incoming questions instantly',
      'Zero audio storage: Processed ephemerally in RAM with 100% user privacy',
    ],
  },
  {
    id: 'answers',
    label: 'AI-Generated Answers',
    icon: Code2,
    tag: 'STAR & Code Intelligence',
    title: 'Structured STAR Framework & Runnable Code',
    description:
      'Generates succinct, executive-ready talking points for behavioral questions or optimal syntax-highlighted solutions for live coding challenges.',
    bullets: [
      'STAR Matrix: Formats Situation, Task, Action, and Quantified Result automatically',
      'Optimal Big-O Algorithms: Generates clean solutions with time & space complexity analysis',
      'Multi-Language Support: Python, JavaScript, TypeScript, Go, Java, C++, and SQL',
    ],
  },
  {
    id: 'screenshot',
    label: 'Screenshot Analysis',
    icon: Camera,
    tag: 'Visual Vision OCR',
    title: 'One-Click Screenshot & Diagram Analysis',
    description:
      'Press a hotkey to instantly capture CoderPad code, LeetCode problem descriptions, system design flowcharts, or architecture diagrams for instant analysis.',
    bullets: [
      'Captures specified screen regions with hotkey (⌘⇧↵ / Ctrl+Shift+Enter)',
      'Parses algorithmic edge cases, system architecture bottlenecks, and database schemas',
      'Feeds visual context directly into your live answer pipeline',
    ],
  },
  {
    id: 'chat',
    label: 'In-Session AI Chat',
    icon: MessageSquare,
    tag: 'Silent Backchannel',
    title: 'Silent In-Call Private AI Querying',
    description:
      'Need a quick clarification during a discussion? Type discreet follow-up prompts into the floating chat bar without breaking eye contact or leaving the meeting window.',
    bullets: [
      'Floating micro-input widget stays focused above all presentation software',
      'Instant syntax lookup, formula verification, or tradeoff comparisons',
      'Configurable hotkeys allow seamless toggling and dragging across monitors',
    ],
  },
  {
    id: 'resume',
    label: 'Resume Intelligence',
    icon: FileText,
    tag: 'Contextual Alignment',
    title: 'Answers Tailored to Your Real Career History',
    description:
      'Upload your CV and paste the target job description. Feonix AI anchors every generated response in your genuine past projects, tech stacks, and career accomplishments.',
    bullets: [
      'Maps questions to relevant projects and achievements from your uploaded resume',
      'Prevents robotic generic answers by embedding authentic personal experience',
      'Highlights target job keywords to maximize interviewer scorecards',
    ],
  },
];

export default function InteractiveProductShowcase({ onGetStarted }) {
  const [activeTab, setActiveTab] = useState(CAPABILITIES[0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Render authentic interactive UI mockups for each capability (Zero mobile phones!)
  const renderInteractiveMockup = () => {
    switch (activeTab.id) {
      case 'copilot':
        return (
          <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#080c14', fontFamily: 'ui-sans-serif, system-ui' }}>
            {/* Top HUD Capsule */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(20, 27, 45, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 14px', borderRadius: '999px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>LIVE COPILOT</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px' }}>Answer ⌘↵</span>
                <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>Shot ⌘⇧↵</span>
              </div>
            </div>

            {/* Transcription Stream Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Transcribing:</span>
              <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0' }}>How would you</span>
              <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0' }}>design a rate</span>
              <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>limiter for a public API?</span>
            </div>

            {/* Answer Teleprompter Window */}
            <div style={{ flexGrow: 1, background: 'rgba(13, 19, 33, 0.95)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>★ High-Throughput Token Bucket Architecture</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong style={{ color: '#ffffff' }}>Storage Engine:</strong> Distributed Redis cluster using atomic Lua script increments to eliminate race conditions.</li>
                <li><strong style={{ color: '#ffffff' }}>Refill Mechanism:</strong> Replenishes tokens at rate R/sec up to burst capacity B per tenant API key.</li>
                <li><strong style={{ color: '#ffffff' }}>HTTP Headers:</strong> Emits X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After automatically.</li>
              </ul>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px', color: '#64748b' }}>
                <span>Latency: 0.9s • 100% Invisible to Zoom/Teams</span>
                <span style={{ color: '#22c55e' }}>● Verified Architecture</span>
              </div>
            </div>
          </div>
        );

      case 'transcription':
        return (
          <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#080c14' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} />
              <span>DUAL-CHANNEL AUDIO INGESTION</span>
            </div>
            {/* Audio Channel 1: Interviewer */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Channel 1: Interviewer (Zoom/Teams Audio Loop)</span>
                <span style={{ color: '#22c55e' }}>48kHz PCM</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc', fontWeight: 500 }}>
                "Can you walk me through how you handled cache stampedes in your distributed payment system?"
              </p>
            </div>
            {/* Audio Channel 2: Candidate */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Channel 2: Candidate Microphone</span>
                <span style={{ color: '#38bdf8' }}>Active (Whisper-1)</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc', fontWeight: 500 }}>
                "We implemented probabilistic early expiration with the XFetch algorithm combined with distributed mutex locks..."
              </p>
            </div>
            {/* Processing Telemetry */}
            <div style={{ marginTop: 'auto', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '11.5px', color: '#38bdf8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Question Detected: Yes (Confidence 99.4%)</span>
              <span>Memory Only (Zero Audio Stored)</span>
            </div>
          </div>
        );

      case 'answers':
        return (
          <div style={{ width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#060a12', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>// Solution: O(1) LRU Cache (JS / TypeScript)</span>
              <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>Optimal Big-O</span>
            </div>
            <pre style={{ margin: 0, fontSize: '11.5px', color: '#e2e8f0', lineHeight: 1.5, overflowX: 'auto', flexGrow: 1 }}>
              <span style={{ color: '#f43f5e' }}>class</span> <span style={{ color: '#38bdf8' }}>LRUCache</span> {'{\n'}
              {'  '}<span style={{ color: '#f43f5e' }}>constructor</span>(capacity) {'{\n'}
              {'    '}<span style={{ color: '#f43f5e' }}>this</span>.capacity = capacity;{'\n'}
              {'    '}<span style={{ color: '#f43f5e' }}>this</span>.map = <span style={{ color: '#f43f5e' }}>new</span> <span style={{ color: '#38bdf8' }}>Map</span>(); <span style={{ color: '#64748b' }}>// Preserves insertion order</span>{'\n'}
              {'  }\n'}
              {'  '}<span style={{ color: '#38bdf8' }}>get</span>(key) {'{\n'}
              {'    '}<span style={{ color: '#f43f5e' }}>if</span> (!<span style={{ color: '#f43f5e' }}>this</span>.map.has(key)) <span style={{ color: '#f43f5e' }}>return</span> -1;{'\n'}
              {'    '}<span style={{ color: '#f43f5e' }}>const</span> val = <span style={{ color: '#f43f5e' }}>this</span>.map.get(key);{'\n'}
              {'    '}<span style={{ color: '#f43f5e' }}>this</span>.map.delete(key);{'\n'}
              {'    '}<span style={{ color: '#f43f5e' }}>this</span>.map.set(key, val); <span style={{ color: '#64748b' }}>// Move to head</span>{'\n'}
              {'    '}<span style={{ color: '#f43f5e' }}>return</span> val;{'\n'}
              {'  }\n}'}
            </pre>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
              <span>Time: <strong>O(1) Get / Put</strong></span>
              <span>Space: <strong>O(Capacity)</strong></span>
            </div>
          </div>
        );

      case 'screenshot':
        return (
          <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#080c14' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={14} />
                <span>VISION OCR SCANNER (⌘⇧↵)</span>
              </span>
              <span style={{ fontSize: '11px', color: '#10b981' }}>CoderPad Screen Region Parsed</span>
            </div>
            <div style={{ border: '1px dashed rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '14px', background: 'rgba(245, 158, 11, 0.04)' }}>
              <div style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Detected Problem Statement:</div>
              <div style={{ fontSize: '12.5px', color: '#f8fafc', lineHeight: 1.5 }}>
                "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram."
              </div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>Identified Optimal Strategy:</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                • Monotonic Increasing Stack storing indices.<br />
                • Time: O(N) single pass vs O(N²) brute-force.<br />
                • Space: O(N) stack bounded by array length.
              </div>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#080c14' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} />
              <span>SILENT IN-CALL BACKCHANNEL</span>
            </div>
            {/* User prompt */}
            <div style={{ alignSelf: 'flex-end', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '10px 10px 2px 10px', padding: '8px 14px', fontSize: '12px', color: '#f8fafc', maxWidth: '85%' }}>
              Quickly compare Optimistic Rollups vs ZK-Rollups in terms of withdrawal delays.
            </div>
            {/* AI Assistant response */}
            <div style={{ alignSelf: 'flex-start', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px 10px 10px 2px', padding: '10px 14px', fontSize: '12px', color: '#cbd5e1', maxWidth: '92%', lineHeight: 1.5 }}>
              • <strong style={{ color: '#ffffff' }}>Optimistic:</strong> 7-day challenge period required for fraud proofs before final withdrawal.<br />
              • <strong style={{ color: '#ffffff' }}>ZK-Rollups:</strong> Instant cryptographic validity proofs allow immediate withdrawals without waiting.
            </div>
            {/* Micro input bar */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value="Type private follow-up prompt... (⌘⇧D)"
                style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '8px 12px', fontSize: '11.5px', color: '#64748b' }}
              />
            </div>
          </div>
        );

      case 'resume':
        return (
          <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#080c14' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              <span>RESUME CONTEXT PERSONALIZATION</span>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Uploaded Profile Context:</div>
              <div style={{ fontSize: '12.5px', color: '#f8fafc', fontWeight: 600 }}>Senior Backend Engineer (Kafka, Go, ClickHouse, AWS)</div>
            </div>
            <div style={{ background: 'rgba(236, 72, 153, 0.06)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#ec4899', fontWeight: 700, marginBottom: '6px' }}>Personalized Talking Point Generation:</div>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                "In my previous role at FinTech Corp, I led the migration of our transaction ingestion pipeline to Apache Kafka, cutting 99th-percentile latency from 450ms to 42ms while processing 12,000 events/sec."
              </p>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} />
              <span>100% Aligned to Target Senior Staff Role Description</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="product" className="px-showcase-section">
      <div className="px-container">
        <div className="px-section-header">
          <div className="px-section-tag">
            <Layers size={13} />
            <span>Product Showcase</span>
          </div>
          <h2 className="px-section-title">
            The Complete Live Interview <br />
            <span className="px-section-title-highlight">Intelligence Architecture</span>
          </h2>
          <p className="px-section-desc">
            Explore the authentic Feonix AI capabilities engineered specifically for technical candidates, systems architects, and engineering leaders.
          </p>
        </div>

        {/* 6 Capability Switcher Tabs */}
        <div className="px-tabs-nav">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            const isActive = activeTab.id === cap.id;
            return (
              <button
                key={cap.id}
                onClick={() => setActiveTab(cap)}
                className={`px-tab-btn ${isActive ? 'is-active' : ''}`}
                type="button"
              >
                <Icon size={15} style={{ color: isActive ? '#38bdf8' : 'inherit' }} />
                <span>{cap.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Floating Perspective Showcase Frame */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
            transition: 'perspective 0.3s ease',
          }}
        >
          <div
            className="px-showcase-display"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.15s ease-out, box-shadow 0.25s ease',
              minHeight: '480px',
            }}
          >
            {/* Interactive Pure UI Mockup Half (ZERO mobile phones!) */}
            <div className="px-showcase-media" style={{ background: '#080c14', padding: 0 }}>
              {renderInteractiveMockup()}
            </div>

            {/* Description & Bullets Half */}
            <div className="px-showcase-content">
              <span className="px-capability-tag">{activeTab.tag}</span>
              <h3 className="px-showcase-h3">{activeTab.title}</h3>
              <p className="px-showcase-desc">{activeTab.description}</p>

              <ul className="px-bullets-list">
                {activeTab.bullets.map((b, idx) => (
                  <li key={idx} className="px-bullet-item">
                    <CheckCircle2 size={16} className="px-bullet-icon" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  onClick={onGetStarted}
                  className="px-btn px-btn-primary"
                  style={{ fontSize: '13.5px' }}
                >
                  <span>Experience {activeTab.label}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
