"use client";

import { useState, useEffect } from 'react';
import { FileText, Cpu, Zap, Target, Award, Mic, ArrowRight } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, title: 'Resume Upload', icon: FileText, desc: 'Parse PDF/Docx structure', color: '#00f5ff' },
  { id: 2, title: 'AI Analysis', icon: Cpu, desc: 'Vectorize career history', color: '#8b5cf6' },
  { id: 3, title: 'Skill Extraction', icon: Zap, desc: 'Index tech stack & STAR metrics', color: '#38bdf8' },
  { id: 4, title: 'Job Matching', icon: Target, desc: 'Align with JD requirements', color: '#ec4899' },
  { id: 5, title: 'Interview Prep', icon: Award, desc: 'Generate custom question bank', color: '#f59e0b' },
  { id: 6, title: 'Real-Time Copilot', icon: Mic, desc: 'Sub-100ms stealth HUD cues', color: '#10b981' },
];

export default function ResumePipeline3DSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="resume-pipeline-section" style={{ position: 'relative', padding: '68px 24px 72px 24px', background: 'radial-gradient(ellipse at center, rgba(13,20,38,0.9) 0%, rgba(4,7,17,1) 100%)', overflow: 'hidden' }}>
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
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c084fc',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <Cpu size={14} />
            <span>INTELLIGENCE PIPELINE</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            From Resume to <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real-Time Interview</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '660px', margin: '0 auto', lineHeight: '1.6' }}>
            Turn your career information into personalized interview intelligence with automated vector indexing and live telemetry synthesis.
          </p>
        </div>

        {/* 3D Pipeline Horizontal Flow */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            position: 'relative'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                onMouseEnter={() => setActiveStep(idx)}
                style={{
                  position: 'relative',
                  padding: '24px 18px',
                  borderRadius: '20px',
                  background: isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 26, 0.75)',
                  border: `1.5px solid ${isActive ? step.color : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  boxShadow: isActive ? `0 16px 35px rgba(0,0,0,0.8), 0 0 25px ${step.color}45` : '0 8px 20px rgba(0,0,0,0.4)',
                  transform: isActive ? 'translateY(-6px) scale(1.03)' : 'none'
                }}
              >
                {/* Connecting Step Arrow Line */}
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '-14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      color: isActive ? step.color : 'rgba(255, 255, 255, 0.25)',
                      opacity: isActive ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ArrowRight size={18} />
                  </div>
                )}

                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: isActive ? `${step.color}30` : `${step.color}15`,
                    border: `1px solid ${isActive ? step.color : `${step.color}40`}`,
                    color: step.color,
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '16px',
                    boxShadow: isActive ? `0 0 18px ${step.color}50` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon size={22} />
                </div>

                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: step.color, fontWeight: '800', marginBottom: '6px' }}>
                  STEP 0{step.id}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px' }}>
                  {step.title}
                </h3>

                <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, lineHeight: '1.45' }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
