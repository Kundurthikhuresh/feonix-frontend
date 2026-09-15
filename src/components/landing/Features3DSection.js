"use client";

import { useState, useRef } from 'react';
import { Zap, FileText, Code2, Lock, Layers, Monitor } from 'lucide-react';

const FEATURES = [
  {
    id: 'latency',
    title: 'Ultra-Low Latency Streaming',
    description: 'Detects and transcribes voice cues in real-time under 1.5 seconds using optimized WebM chunk streaming and concurrent pipeline execution.',
    icon: Zap,
    tag: 'REAL-TIME',
    accent: '#00f5ff',
  },
  {
    id: 'rag',
    title: 'Context-Aware RAG Engine',
    description: 'AI answers dynamically sync with your uploaded resumes, CVs, and specific job guidelines for instant personalized prompt alignment.',
    icon: FileText,
    tag: 'INTELLIGENCE',
    accent: '#8b5cf6',
  },
  {
    id: 'coding',
    title: 'Multi-Modal Coding Assistant',
    description: 'Get instant structural code templates, algorithmic steps, system designs, or standard behavioral STAR scenarios on the fly.',
    icon: Code2,
    tag: 'MULTI-MODAL',
    accent: '#38bdf8',
  },
  {
    id: 'privacy',
    title: 'Privacy-First Sandbox',
    description: 'Zero prompt sharing. Secure end-to-end sandbox operations ensure your voice recordings, transcripts, and documents stay private.',
    icon: Lock,
    tag: 'SECURITY',
    accent: '#10b981',
  },
  {
    id: 'dual',
    title: 'Dual-Layer Architecture',
    description: 'Real-time Copilot HUD during your active call, paired with an intelligent post-call Coach report for deep performance analysis.',
    icon: Layers,
    tag: 'DUAL-CORE',
    accent: '#a855f7',
  },
  {
    id: 'desktop',
    title: 'Desktop App & Browser HUD',
    description: 'Seamless OS integration for Windows and macOS with stealth overlay windows, or run directly in your browser with zero install.',
    icon: Monitor,
    tag: 'FLEXIBILITY',
    accent: '#ec4899',
  },
];

function TiltCard3D({ feature }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 12; // Max 12deg tilt
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY, isHovered: true });
    setMousePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, isHovered: false });
  };

  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      className="feature-3d-card-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${tilt.isHovered ? '8px' : '0px'})`,
        transition: tilt.isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="feature-3d-card-inner"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.08) 0%, var(--space-bg-card) 60%)`,
          borderColor: tilt.isHovered ? `${feature.accent}70` : 'rgba(255, 255, 255, 0.1)',
          boxShadow: tilt.isHovered
            ? `0 16px 36px -12px rgba(0, 0, 0, 0.8), 0 0 28px -4px ${feature.accent}30`
            : '0 8px 24px -10px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Dynamic Glow Spotlight */}
        <div
          className="card-spotlight"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${feature.accent}25 0%, transparent 65%)`,
            opacity: tilt.isHovered ? 1 : 0,
          }}
        />

        <div className="card-top-row">
          <div
            className="feature-icon-badge"
            style={{
              color: feature.accent,
              background: `${feature.accent}18`,
              borderColor: `${feature.accent}45`,
              boxShadow: tilt.isHovered ? `0 0 16px ${feature.accent}50` : 'none',
            }}
          >
            <Icon size={22} />
          </div>
          <span className="feature-tag" style={{ color: feature.accent, borderColor: `${feature.accent}35` }}>
            {feature.tag}
          </span>
        </div>

        <h3 className="feature-card-title">{feature.title}</h3>
        <p className="feature-card-description">{feature.description}</p>

        <div className="card-bottom-accent-line" style={{ background: `linear-gradient(90deg, ${feature.accent}, transparent)` }} />
      </div>
    </div>
  );
}

export default function Features3DSection() {
  return (
    <section className="features-3d-section" id="features">
      <div className="features-3d-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <span className="pill-dot" />
            <span>CORE ARCHITECTURE</span>
          </div>
          <h2 className="section-title">
            Engineered for <span className="gradient-text-cyan">Technical Precision</span>
          </h2>
          <p className="section-subtitle">
            Feonix AI runs silently in the background, listening to real-time conversation cues and streaming instant teleprompter answers with zero disruption.
          </p>
        </div>

        {/* 3D Features Grid */}
        <div className="features-3d-grid">
          {FEATURES.map((feature) => (
            <TiltCard3D key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
