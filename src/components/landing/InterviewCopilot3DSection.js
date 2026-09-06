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
    <section className="interview-copilot-3d-section" style={{ position: 'relative', padding: '100px 24px', background: '#050814', overflow: 'hidden' }}>
      
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
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
            
            {/* Left Box: Interviewer Avatar & Live Audio Stream */}
            <div
              style={{
                background: 'rgba(7, 10, 18, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Interviewer Video Avatar Placeholder */}
              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '14px', background: 'radial-gradient(circle, #1e293b, #0f172a)', border: '1px solid rgba(0,245,255,0.2)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: '900', color: '#ffffff', boxShadow: '0 0 25px rgba(0,245,255,0.4)' }}>
                  FA
                </div>

                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '8px', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff' }}>INTERVIEWER (SYSTEM ARCHITECT)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00f5ff' }}>
                    <Volume2 size={13} />
                    <span style={{ fontSize: '10px', fontFamily: 'monospace' }}>LIVE</span>
                  </div>
                </div>
              </div>

              {/* Interviewer Question Prompt */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(0, 245, 255, 0.3)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#00f5ff', marginBottom: '6px' }}>
                  INTERVIEWER QUESTION:
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', lineHeight: '1.4' }}>
                  "How would you design a scalable notification system?"
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
