"use client";

import { useState } from 'react';
import { Target, Award, Sparkles, TrendingUp, ShieldAlert } from 'lucide-react';

const METRICS = [
  { id: 'resume', label: 'Resume Strength', val: 92, color: '#00f5ff' },
  { id: 'tech', label: 'Technical Skills', val: 85, color: '#8b5cf6' },
  { id: 'comm', label: 'Communication', val: 81, color: '#10b981' },
  { id: 'sd', label: 'System Design', val: 88, color: '#38bdf8' },
  { id: 'ps', label: 'Problem Solving', val: 90, color: '#ec4899' },
  { id: 'jm', label: 'Job Match Score', val: 94, color: '#f59e0b' },
];

export default function CareerReadiness3DSection() {
  const [hoveredMetric, setHoveredMetric] = useState(null);

  return (
    <section className="career-readiness-3d-section" style={{ position: 'relative', padding: '68px 24px 72px 24px', background: 'radial-gradient(ellipse at center, rgba(13,20,38,0.95) 0%, rgba(4,7,17,1) 100%)', overflow: 'hidden' }}>
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
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <Target size={14} />
            <span>AI CAREER READINESS SCORE</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Interactive 3D <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #00f5ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Readiness Matrix</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Simulated career readiness score mapping technical depth, STAR communication, and JD alignment.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '10px' }}>
            <ShieldAlert size={13} />
            <span>* DEMO / EXAMPLE ANALYTICS MODEL</span>
          </div>
        </div>

        {/* 3D Circular Score Stage */}
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '40px', alignItems: 'center' }}>
          
          {/* Left Circular Ring Display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), rgba(10, 14, 26, 0.9))',
                border: '3px solid #10b981',
                boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '64px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace', lineHeight: 1 }}>
                87
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#34d399', letterSpacing: '0.1em', marginTop: '6px' }}>
                CAREER READINESS
              </span>
            </div>
          </div>

          {/* Right Metrics Progress Bar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {METRICS.map((m, i) => {
              const isHovered = hoveredMetric === i;
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHoveredMetric(i)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: isHovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 26, 0.78)',
                    border: `1.5px solid ${isHovered ? m.color : 'rgba(255, 255, 255, 0.1)'}`,
                    transition: 'all 0.25s ease',
                    boxShadow: isHovered ? `0 0 25px ${m.color}35` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>{m.label}</span>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '800', color: m.color }}>{m.val}%</span>
                  </div>

                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${m.val}%`, height: '100%', background: m.color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
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
