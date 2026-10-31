"use client";

import React from 'react';
import { Settings, Shield, Zap, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Configure Your Role & Context',
    description:
      'Upload your CV or past technical projects and paste the target job description. The AI personalizes all talking points so answers match your genuine experience.',
    icon: Settings,
    badge: '30 Seconds',
  },
  {
    step: '02',
    title: 'Launch Stealth Desktop Overlay',
    description:
      'Start the floating teleprompter alongside Zoom, Microsoft Teams, Google Meet, or CoderPad. Hardware-level compositor flags keep the HUD completely invisible to others.',
    icon: Shield,
    badge: '100% Invisible',
  },
  {
    step: '03',
    title: 'Receive Real-Time Guidance',
    description:
      'As the interviewer speaks or presents a problem, Feonix AI transcribes questions and streams structured STAR points, architecture trade-offs, and code solutions in under 1.2s.',
    icon: Zap,
    badge: '<1.2s Latency',
  },
  {
    step: '04',
    title: 'Review Performance & Insights',
    description:
      'After the interview, review complete transcripts, identify areas where you rushed, examine AI mock feedback, and sharpen your delivery for the final offer round.',
    icon: BarChart3,
    badge: 'Detailed Scorecard',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '72px 0' }}>
      <div className="px-container">
        <div className="px-section-header">
          <div className="px-section-tag">
            <span>Workflow</span>
          </div>
          <h2 className="px-section-title">
            How Feonix AI Works in Practice
          </h2>
          <p className="px-section-desc">
            From setup to post-interview debrief, a smooth and completely invisible four-step workflow built for high-stakes technical conversations.
          </p>
        </div>

        <div className="px-how-grid">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="px-step-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div className="px-step-number">{s.step}</div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--px-cyan)', background: 'var(--px-cyan-glow)', padding: '3px 8px', borderRadius: '4px' }}>
                    {s.badge}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ color: '#38bdf8' }}>
                    <Icon size={18} />
                  </div>
                  <h3 className="px-step-title">{s.title}</h3>
                </div>
                <p className="px-step-desc">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

