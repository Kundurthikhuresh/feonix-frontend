"use client";

import { useState, useEffect } from 'react';
import { Mic, Volume2, Sparkles, CheckCircle2, Server, Play, Zap, Shield, Cpu, Code2, PlayCircle } from 'lucide-react';

const ARCH_NODES = ['API Gateway', 'Message Queue', 'Worker Services', 'Redis', 'Kafka', 'WebSocket'];
const ANSWER_STEPS = [
  '1. Clarify requirements & scale metrics',
  '2. High-level system architecture design',
  '3. Horizontal scaling & queue partitioning',
  '4. Reliability, retry queues & idempotency',
  '5. Trade-offs & multi-region latency analysis'
];

export default function InterviewCopilot3DSection({ onSimulate }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimStep((prev) => (prev >= ANSWER_STEPS.length - 1 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <section className="interview-copilot-3d-section" style={{ position: 'relative', padding: '68px 24px 72px 24px', background: '#050814', overflow: 'hidden' }}>
      
      {/* Radiant Glow Atmosphere */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '750px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.12) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'rgba(0, 245, 255, 0.1)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              color: '#00f5ff',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <Sparkles size={14} />
            <span>REAL-TIME INTERVIEW COPILOT</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Live Holographic <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interview Stage</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Experience instant system architecture breakdown and structured bullet responses streamed to your stealth HUD while you speak.
          </p>

          {/* Simulate Interview Trigger Button */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 26px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(0, 245, 255, 0.4)',
                transition: 'all 0.25s ease'
              }}
            >
              <PlayCircle size={16} />
              <span>{isSimulating ? 'Pause Live Simulation' : 'Simulate Interview Stage'}</span>
            </button>
          </div>
        </div>

        {/* Futuristic 3D Interview Stage Environment */}
        <div
          style={{
            background: 'rgba(10, 14, 26, 0.92)',
            border: '1.5px solid rgba(0, 245, 255, 0.35)',
            borderRadius: '28px',
            padding: '32px',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 45px rgba(0, 245, 255, 0.15)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '32px', alignItems: 'center' }}>
            
            {/* Left Box: Futuristic Interviewer Video Call Stage & Real-Time Audio Feed */}
            <div
              style={{
                background: 'linear-gradient(165deg, rgba(13, 18, 36, 0.95) 0%, rgba(7, 10, 20, 0.98) 100%)',
                border: '1.5px solid rgba(0, 245, 255, 0.25)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Ultra-Realistic HD Interviewer Video Stage */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '220px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(0, 245, 255, 0.3)',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 245, 255, 0.15)',
                  background: '#0a0e1a'
                }}
              >
                {/* Background Image: Speaking AI Interviewer Avatar */}
                <img
                  src="/ai_robot_avatar_speaking.jpg"
                  alt="Interviewer Video Feed"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 25%',
                    filter: 'brightness(0.92) contrast(1.08)'
                  }}
                />

                {/* Cyber Scanline & Vignette Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(5, 8, 20, 0.55) 0%, rgba(5, 8, 20, 0.1) 40%, rgba(5, 8, 20, 0.85) 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Top Video Status HUD Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 2
                  }}
                >
                  {/* Live Recording Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(10px)',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 10px #ef4444',
                        display: 'inline-block'
                      }}
                    />
                    <span style={{ fontSize: '10.5px', fontFamily: 'monospace', fontWeight: '800', color: '#ffffff', letterSpacing: '0.04em' }}>
                      REC 00:14
                    </span>
                  </div>

                  {/* Quality & Network Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        fontWeight: '800',
                        color: '#00f5ff',
                        background: 'rgba(0, 245, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 245, 255, 0.3)'
                      }}
                    >
                      1080P • 60FPS
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.15)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      🟢 14ms
                    </span>
                  </div>
                </div>

                {/* Real-Time Audio Frequency Equalizer Bars */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '48px',
                    left: '16px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '3px',
                    height: '24px',
                    zIndex: 2
                  }}
                >
                  {[14, 22, 18, 24, 12, 20, 16, 22].map((height, i) => (
                    <div
                      key={i}
                      style={{
                        width: '3.5px',
                        height: isSimulating ? `${Math.max(6, (height + (i % 3) * 4) % 24)}px` : `${height}px`,
                        borderRadius: '2px',
                        background: 'linear-gradient(180deg, #00f5ff 0%, #8b5cf6 100%)',
                        boxShadow: '0 0 8px rgba(0, 245, 255, 0.6)',
                        transition: 'height 0.2s ease'
                      }}
                    />
                  ))}
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#00f5ff', fontWeight: '800', marginLeft: '6px' }}>
                    VOICE DETECTED
                  </span>
                </div>

                {/* Bottom Video Nameplate Bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(6, 10, 22, 0.85)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 2
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>
                      Alex Rivera <span style={{ color: '#00f5ff', fontSize: '11px', fontWeight: '700' }}>• Lead Interviewer</span>
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                      Staff Systems Architect @ Cloud Scale
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#00f5ff',
                      background: 'rgba(0, 245, 255, 0.12)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 245, 255, 0.25)'
                    }}
                  >
                    <Volume2 size={13} />
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: '800' }}>
                      SPEAKING
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-Time Whisper AI Speech-To-Text Transcription Card */}
              <div
                style={{
                  background: 'rgba(10, 15, 30, 0.9)',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 245, 255, 0.15)'
                }}
              >
                {/* Transcript Meta Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#00f5ff',
                        boxShadow: '0 0 8px #00f5ff',
                        display: 'inline-block'
                      }}
                    />
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#00f5ff', letterSpacing: '0.06em' }}>
                      LIVE TRANSCRIPTION (WHISPER v3)
                    </span>
                  </div>

                  <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                    99.6% CONFIDENCE
                  </span>
                </div>

                {/* Question Body with Highlighted System Entities */}
                <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#f8fafc', lineHeight: '1.55' }}>
                  &ldquo;How would you design a{' '}
                  <span
                    style={{
                      color: '#00f5ff',
                      background: 'rgba(0, 245, 255, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 245, 255, 0.35)',
                      fontWeight: '800'
                    }}
                  >
                    scalable notification system
                  </span>{' '}
                  handling{' '}
                  <span
                    style={{
                      color: '#c084fc',
                      background: 'rgba(139, 92, 246, 0.18)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      fontWeight: '800'
                    }}
                  >
                    100M+ events / sec
                  </span>{' '}
                  with zero message loss and multi-region failover?&rdquo;
                </div>

                {/* Architectural Keyword Pill Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    ⚡ High-Throughput Pub/Sub
                  </span>
                  <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    🛡️ Idempotent Processing
                  </span>
                  <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    ⏱️ 4-5 Min Response
                  </span>
                </div>
              </div>
            </div>

            {/* Right Box: Stealth Copilot RAG Output Cards & Architecture Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Architecture Nodes Chips */}
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#94a3b8', marginBottom: '10px', letterSpacing: '0.08em' }}>
                  ⚡ FEONIX AI SUGGESTED ARCHITECTURE
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ARCH_NODES.map((node, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: 'rgba(0, 245, 255, 0.1)',
                        border: '1px solid rgba(0, 245, 255, 0.3)',
                        color: '#00f5ff',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Server size={12} />
                      <span>{node}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured STAR Response Steps */}
              <div style={{ background: 'rgba(7, 10, 18, 0.9)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '16px', padding: '18px' }}>
                <div style={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '800', color: '#c084fc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={13} />
                  <span>STRUCTURED TELEPROMPTER ANSWER STEPS</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ANSWER_STEPS.map((step, idx) => {
                    const isCurrent = isSimulating && idx === simStep;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px',
                          color: isCurrent ? '#ffffff' : '#94a3b8',
                          fontWeight: isCurrent ? '800' : '500',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: isCurrent ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                          border: isCurrent ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <CheckCircle2 size={15} style={{ color: isCurrent ? '#00f5ff' : '#64748b' }} />
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
