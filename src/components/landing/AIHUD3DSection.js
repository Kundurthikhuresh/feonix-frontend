"use client";

import { useState, useEffect } from 'react';
import { Shield, Zap, Activity, Radio, Cpu, Layers, Terminal, Sparkles } from 'lucide-react';

const TELEMETRY_PANELS = [
  { id: 'q', title: 'Current Question', val: '"Can you explain process vs thread in Linux?"', color: '#00f5ff' },
  { id: 'stt', title: 'Live Speech Transcript', val: 'Audio stream loopback captured via WASAPI', color: '#38bdf8' },
  { id: 'voice', title: 'Voice Activity', val: 'Interviewer Speaking (48kHz Stereo)', color: '#10b981' },
  { id: 'proc', title: 'AI Processing', val: 'Multi-threaded RAG Pipeline (<95ms)', color: '#8b5cf6' },
  { id: 'ctx', title: 'Context Retrieved', val: 'Meta Resume + OS Concepts v10', color: '#f59e0b' },
  { id: 'gen', title: 'Answer Generated', val: '4 STAR Bullets Streamed to Teleprompter', color: '#ec4899' },
  { id: 'struct', title: 'Response Structure', val: 'Definition -> Heap/Stack -> IPC Trade-offs', color: '#a855f7' },
];

export default function AIHUD3DSection() {
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePanel((prev) => (prev + 1) % TELEMETRY_PANELS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="ai-hud-3d-section" style={{ position: 'relative', padding: '68px 24px 72px 24px', background: '#040711', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
            <Shield size={14} />
            <span>HOLOGRAPHIC STEALTH HUD</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Intelligence When <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>You Need It</span>.
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '660px', margin: '0 auto', lineHeight: '1.6' }}>
            A lightweight, transparent HUD overlay that stays invisible on screen share while delivering real-time answer cues.
          </p>
        </div>

        {/* 3D Holographic HUD Stage */}
        <div
          style={{
            background: 'rgba(10, 14, 26, 0.92)',
            border: '1.5px solid rgba(0, 245, 255, 0.4)',
            borderRadius: '28px',
            padding: '32px',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 45px rgba(0, 245, 255, 0.2)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {TELEMETRY_PANELS.map((panel, i) => {
              const isActive = activePanel === i;
              return (
                <div
                  key={panel.id}
                  onClick={() => setActivePanel(i)}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 26, 0.75)',
                    border: `1.5px solid ${isActive ? panel.color : 'rgba(255, 255, 255, 0.1)'}`,
                    backdropFilter: 'blur(20px)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? `0 0 25px ${panel.color}40` : 'none'
                  }}
                >
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: panel.color, marginBottom: '6px' }}>
                    {panel.title.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff', lineHeight: '1.4' }}>
                    {panel.val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
