"use client";

import { useState } from 'react';
import { Mic, Radio, Database, Brain, Sparkles, LayoutList } from 'lucide-react';

const STAGES = [
  { id: 1, title: 'Voice Input', icon: Mic, desc: 'Loopback system audio stream capture', color: '#00f5ff' },
  { id: 2, title: 'Speech Recognition', icon: Radio, desc: 'Deepgram / Whisper streaming STT', color: '#38bdf8' },
  { id: 3, title: 'Context Engine', icon: Database, desc: 'Active session resume & JD index', color: '#8b5cf6' },
  { id: 4, title: 'Knowledge Retrieval', icon: Sparkles, desc: 'Vector RAG similarity lookup', color: '#ec4899' },
  { id: 5, title: 'AI Reasoning', icon: Brain, desc: 'LLM STAR & code synthesis engine', color: '#f59e0b' },
  { id: 6, title: 'Structured Answer', icon: LayoutList, desc: 'Sub-100ms teleprompter HUD stream', color: '#10b981' },
];

export default function AIProcessing3DSection() {
  const [activeStage, setActiveStage] = useState(2);

  return (
    <section className="ai-processing-3d-section" style={{ position: 'relative', padding: '68px 24px 72px 24px', background: '#040711', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Section Header */}
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
            <Brain size={14} />
            <span>AI PROCESSING PIPELINE</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            From Question to <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligent Answer</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Inside Feonix AI's multi-threaded neural engine — processing loopback audio streams into structured teleprompter STAR bullet points in under 95ms.
          </p>
        </div>

        {/* 6-Stage 3D Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {STAGES.map((st, i) => {
            const Icon = st.icon;
            const isActive = activeStage === i;

            return (
              <div
                key={st.id}
                onClick={() => setActiveStage(i)}
                style={{
                  padding: '26px',
                  borderRadius: '20px',
                  background: isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 26, 0.78)',
                  border: `1.5px solid ${isActive ? st.color : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 20px 40px rgba(0,0,0,0.8), 0 0 30px ${st.color}35` : '0 10px 25px rgba(0,0,0,0.4)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: `${st.color}20`,
                      border: `1px solid ${st.color}50`,
                      color: st.color,
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: st.color, fontWeight: '800', background: `${st.color}15`, padding: '3px 8px', borderRadius: '6px' }}>
                    STAGE 0{st.id}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px' }}>
                  {st.title}
                </h3>

                <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0, lineHeight: '1.55' }}>
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
