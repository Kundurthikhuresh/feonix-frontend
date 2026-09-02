"use client";

import { UploadCloud, Sliders, PlayCircle, Sparkles, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Connect & Ingest Context',
    description: 'Upload your CVs, resumes, project docs, or paste a specific job description to set the AI knowledge vector base.',
    icon: UploadCloud,
    accent: '#00f5ff',
  },
  {
    step: '02',
    title: 'Configure Guidelines & Agent',
    description: 'Select your target programming language, specialized AI model persona (GPT-4o), and trigger audio source (Tab or Mic).',
    icon: Sliders,
    accent: '#8b5cf6',
  },
  {
    step: '03',
    title: 'Automate Real-Time Cues',
    description: 'Speak and listen naturally. Feonix AI instantly parses voice cues and streams teleprompter answers in sub-second latency.',
    icon: PlayCircle,
    accent: '#10b981',
  },
];

export default function HowItWorks3DSection() {
  return (
    <section className="how-it-works-3d-section" id="how-it-works">
      <div className="how-it-works-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Sparkles size={14} className="pill-icon text-cyan" />
            <span>3-STEP WORKFLOW</span>
          </div>
          <h2 className="section-title">
            How It <span className="gradient-text-cyan">Works</span>
          </h2>
          <p className="section-subtitle">
            Get set up and start utilizing your personal AI Copilot in less than 2 minutes.
          </p>
        </div>

        {/* 3D Steps Timeline with Connecting Laser Beam */}
        <div className="steps-3d-timeline">
          <div className="timeline-connecting-beam" />

          <div className="steps-3d-grid">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="step-3d-card">
                  <div className="step-card-glow" style={{ background: `radial-gradient(circle at center, ${step.accent}20 0%, transparent 70%)` }} />
                  <div className="step-card-inner">
                    <div className="step-top-row">
                      <div className="step-number-badge" style={{ borderColor: `${step.accent}50`, color: step.accent }}>
                        <span className="step-num-text">{step.step}</span>
                        <div className="step-pulse-ring" style={{ borderColor: `${step.accent}30` }} />
                      </div>
                      <div className="step-icon-box" style={{ color: step.accent, background: `${step.accent}15` }}>
                        <Icon size={22} />
                      </div>
                    </div>

                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>

                    <div className="step-indicator-bar" style={{ background: `linear-gradient(90deg, ${step.accent}, transparent)` }} />
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
