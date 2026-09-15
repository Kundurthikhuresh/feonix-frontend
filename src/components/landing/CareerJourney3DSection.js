"use client";

import { useState } from 'react';
import { Upload, Cpu, ShieldAlert, Award, PlayCircle, Mic, TrendingUp, CheckCircle2 } from 'lucide-react';

const JOURNEY_MILESTONES = [
  { step: 1, title: 'Upload Resume', icon: Upload, desc: 'Ingest career history & STAR metrics', color: '#00f5ff' },
  { step: 2, title: 'Analyze Skills', icon: Cpu, desc: 'Vectorize tech stack & role fit', color: '#8b5cf6' },
  { step: 3, title: 'Identify Gaps', icon: ShieldAlert, desc: 'Detect missing JD keywords', color: '#38bdf8' },
  { step: 4, title: 'Practice', icon: Award, desc: 'AI Voice Coach mock runs', color: '#f59e0b' },
  { step: 5, title: 'Simulate Interview', icon: PlayCircle, desc: '3D interactive stage dry run', color: '#ec4899' },
  { step: 6, title: 'Real-Time Copilot', icon: Mic, desc: 'Sub-100ms stealth HUD during live calls', color: '#10b981' },
  { step: 7, title: 'Improve', icon: TrendingUp, desc: 'Review transcript & pace analytics', color: '#a855f7' },
  { step: 8, title: 'Get Ready', icon: CheckCircle2, desc: 'Land top-tier FAANG offer', color: '#00f5ff' },
];

export default function CareerJourney3DSection() {
  const [activeIdx, setActiveIdx] = useState(5);

  return (
    <section className="career-journey-3d-section" style={{ position: 'relative', padding: '68px 24px 72px 24px', background: '#040711', overflow: 'hidden' }}>
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
            <TrendingUp size={14} />
            <span>CAREER TIMELINE</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Your Complete <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Career Journey</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '660px', margin: '0 auto', lineHeight: '1.6' }}>
            From initial resume parsing to live stealth copilot execution and offer negotiation.
          </p>
        </div>

        {/* 8 Step Timeline Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {JOURNEY_MILESTONES.map((m, i) => {
            const Icon = m.icon;
            const isActive = activeIdx === i;

            return (
              <div
                key={m.step}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  background: isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 26, 0.78)',
                  border: `1.5px solid ${isActive ? m.color : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 16px 35px rgba(0,0,0,0.8), 0 0 25px ${m.color}35` : '0 8px 20px rgba(0,0,0,0.4)',
                  transform: isActive ? 'translateY(-4px)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${m.color}20`, border: `1px solid ${m.color}50`, color: m.color, display: 'grid', placeItems: 'center' }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: m.color }}>
                    STEP 0{m.step}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px' }}>
                  {m.title}
                </h3>

                <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, lineHeight: '1.45' }}>
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
