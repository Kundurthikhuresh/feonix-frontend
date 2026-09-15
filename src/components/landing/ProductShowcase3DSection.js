"use client";

import { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, FileText, Mic, Code2, BarChart3, Terminal } from 'lucide-react';

const FLOATING_CHIPS = [
  { label: 'Resume Intelligence', icon: FileText, color: '#00f5ff' },
  { label: 'Interview Copilot', icon: Mic, color: '#8b5cf6' },
  { label: 'AI Answer Synthesis', icon: Sparkles, color: '#10b981' },
  { label: 'Coding Problem Solver', icon: Code2, color: '#ec4899' },
  { label: 'Career Analytics', icon: BarChart3, color: '#f59e0b' },
];

export default function ProductShowcase3DSection({ onGetStarted, onExplore }) {
  return (
    <section className="product-showcase-3d-section" style={{ position: 'relative', padding: '72px 24px 76px 24px', background: 'radial-gradient(ellipse at center, rgba(13,20,38,0.98) 0%, rgba(4,7,17,1) 100%)', overflow: 'hidden' }}>
      
      {/* Radiant Glow Atmosphere */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '850px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />

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
            <Sparkles size={14} />
            <span>THE NEXT-GEN AI SUITE</span>
          </div>

          <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.15' }}>
            Meet Your <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Career Copilot</span>
          </h2>

          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto 36px', lineHeight: '1.6' }}>
            Prepare smarter. Think faster. Perform with confidence in every technical interview.
          </p>

          {/* Floating Feature Modules */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
            {FLOATING_CHIPS.map((chip, i) => {
              const Icon = chip.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: `1px solid ${chip.color}50`,
                    color: chip.color,
                    fontSize: '13px',
                    fontWeight: '700',
                    boxShadow: `0 0 15px ${chip.color}25`
                  }}
                >
                  <Icon size={14} />
                  <span style={{ color: '#ffffff' }}>{chip.label}</span>
                </div>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={onGetStarted}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 36px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 35px rgba(0, 245, 255, 0.45)',
                transition: 'all 0.25s ease'
              }}
            >
              <span>Start Using Feonix AI</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onExplore}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 32px',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              <Terminal size={18} style={{ color: '#00f5ff' }} />
              <span>Explore the Platform</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
