"use client";

import { useState } from 'react';
import { Cpu, FileText, Mic, Code2, Server, Target, BarChart3, Award, Database, Activity } from 'lucide-react';

const MODULES = [
  { id: 'resume', title: 'Resume Intelligence', icon: FileText, desc: 'Vector RAG indexing & STAR metric parsing', color: '#00f5ff' },
  { id: 'copilot', title: 'Interview Copilot', icon: Mic, desc: 'Sub-100ms stealth HUD answer stream', color: '#8b5cf6' },
  { id: 'code', title: 'Coding Assistant', icon: Code2, desc: 'OCR screenshot & algorithm solver', color: '#10b981' },
  { id: 'sd', title: 'System Design', icon: Server, desc: 'Distributed architecture & capacity formulas', color: '#38bdf8' },
  { id: 'job', title: 'Job Matching', icon: Target, desc: 'JD keyword gap & alignment analysis', color: '#ec4899' },
  { id: 'analytics', title: 'Career Analytics', icon: BarChart3, desc: 'Speaking pace & filler word detection', color: '#f59e0b' },
  { id: 'practice', title: 'AI Practice Stage', icon: Award, desc: 'Custom mock interviews with voice coach', color: '#a855f7' },
  { id: 'kb', title: 'Knowledge Base', icon: Database, desc: 'Deep OS & CS architecture docs', color: '#00f5ff' },
  { id: 'perf', title: 'Performance Metrics', icon: Activity, desc: 'Latency benchmarks & telemetry', color: '#10b981' },
];

export default function FeonixEcosystem3DSection() {
  const [activeModule, setActiveModule] = useState(MODULES[0]);

  return (
    <section className="feonix-ecosystem-3d-section" style={{ position: 'relative', padding: '100px 24px', background: 'radial-gradient(ellipse at center, rgba(13,20,38,0.95) 0%, rgba(4,7,17,1) 100%)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Header */}
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
            <Cpu size={14} />
            <span>UNIFIED PLATFORM ECOSYSTEM</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            The Feonix AI <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ecosystem</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '660px', margin: '0 auto', lineHeight: '1.6' }}>
            A modular suite of specialized AI copilot engines designed to power every stage of your technical interview journey.
          </p>
        </div>

        {/* 9 Modules Orbital Grid Stage */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule.id === mod.id;

            return (
              <div
                key={mod.id}
                onMouseEnter={() => setActiveModule(mod)}
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  background: isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 26, 0.78)',
                  border: `1.5px solid ${isActive ? mod.color : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 20px 40px rgba(0,0,0,0.85), 0 0 30px ${mod.color}35` : '0 8px 24px rgba(0,0,0,0.4)',
                  transform: isActive ? 'translateY(-6px) scale(1.02)' : 'none'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${mod.color}20`, border: `1px solid ${mod.color}50`, color: mod.color, display: 'grid', placeItems: 'center', marginBottom: '14px' }}>
                  <Icon size={20} />
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px' }}>
                  {mod.title}
                </h3>

                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
