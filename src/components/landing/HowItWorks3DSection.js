"use client";

import React from 'react';
import {
  UploadCloud,
  Radio,
  Terminal,
  Code2,
  Cpu,
  Brain,
  Layers,
  Bot,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

// ROW 1 CARDS (Moving Right ➔)
const ROW_1_CARDS = [
  {
    step: '01',
    tag: 'VECTOR EMBEDDINGS',
    title: 'Connect & Ingest Context',
    description: 'Upload your CVs, resumes, project repos, or paste a specific job description to set your AI knowledge base.',
    icon: UploadCloud,
    accent: '#00f5ff',
  },
  {
    step: '02',
    tag: '< 500MS STREAMING',
    title: 'Real-Time Voice Decoding',
    description: 'Captures interviewer audio streams in 500ms chunks with sub-second acoustic speech-to-text processing.',
    icon: Radio,
    accent: '#8b5cf6',
  },
  {
    step: '03',
    tag: 'HUD TELEPROMPTER',
    title: 'Instant Question Teleprompter',
    description: 'Detects questions live and delivers concise, bullet-point answers directly onto your desktop stealth overlay.',
    icon: Terminal,
    accent: '#10b981',
  },
  {
    step: '04',
    tag: 'LEETCODE & ALGORITHMS',
    title: 'Code & Complexity Copilot',
    description: 'Generates optimal time & space complexity (O(n)), edge-case tests, and clean syntax in Python, JS, C++, Go.',
    icon: Code2,
    accent: '#f59e0b',
  },
  {
    step: '05',
    tag: 'SYSTEM ARCHITECTURE',
    title: 'Live System Design Cues',
    description: 'Live microservice topologies, distributed caching strategies (Redis), and database sharding architectures.',
    icon: Cpu,
    accent: '#ec4899',
  },
];

// ROW 2 CARDS (Moving Left ⬅)
const ROW_2_CARDS = [
  {
    step: '06',
    tag: 'HYBRID ROUTING',
    title: 'Multi-Model Orchestration',
    description: 'Dynamic low-latency routing across GPT-4o, Claude 3.5 Sonnet, and fine-tuned local reasoning engines.',
    icon: Brain,
    accent: '#00f5ff',
  },
  {
    step: '07',
    tag: 'STEALTH SHIELD',
    title: 'Stealth Multi-Monitor HUD',
    description: 'Completely invisible to screen-shares (Zoom, Teams, Google Meet) with customizable opacity & emergency hotkeys.',
    icon: Layers,
    accent: '#8b5cf6',
  },
  {
    step: '08',
    tag: '3D VOICE AVATAR',
    title: 'Interactive 3D Mock Coach',
    description: 'Animated 3D companion robot conducting realistic STAR behavioral and technical mock rounds with voice playback.',
    icon: Bot,
    accent: '#10b981',
  },
  {
    step: '09',
    tag: 'AI SCORECARD',
    title: 'Post-Interview Analytics',
    description: 'Automated post-call scorecard analyzing speaking pace, technical accuracy, filler words, and confidence ratings.',
    icon: BarChart3,
    accent: '#f59e0b',
  },
  {
    step: '10',
    tag: 'ZERO RETENTION',
    title: 'Sandbox Privacy Isolation',
    description: 'Enterprise-grade zero data retention ensures your interview audio and documents are never used for public training.',
    icon: ShieldCheck,
    accent: '#ec4899',
  },
];

function MarqueeCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="workflow-marquee-card">
      <div
        className="workflow-card-glow"
        style={{ background: `radial-gradient(circle at 20% 20%, ${item.accent}18 0%, transparent 70%)` }}
      />
      <div className="workflow-card-inner">
        {/* Top row: step number + icon */}
        <div className="workflow-card-top">
          <div className="workflow-step-pill" style={{ borderColor: `${item.accent}40`, color: item.accent }}>
            <span>{item.step}</span>
          </div>
          <span className="workflow-card-tag" style={{ color: item.accent, background: `${item.accent}14`, borderColor: `${item.accent}30` }}>
            {item.tag}
          </span>
          <div className="workflow-icon-box" style={{ color: item.accent, background: `${item.accent}18` }}>
            <Icon size={18} />
          </div>
        </div>

        {/* Title & description */}
        <h3 className="workflow-card-title">{item.title}</h3>
        <p className="workflow-card-desc">{item.description}</p>

        {/* Glowing bottom accent line */}
        <div
          className="workflow-card-bar"
          style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }}
        />
      </div>
    </div>
  );
}

export default function HowItWorks3DSection() {
  return (
    <section className="how-it-works-3d-section" id="how-it-works">
      <div className="how-it-works-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Zap size={14} className="pill-icon text-cyan" />
            <span>FULL ARCHITECTURE & PIPELINE</span>
          </div>
          <h2 className="section-title">
            How Feonix AI <span className="gradient-text-cyan">Works</span>
          </h2>
          <p className="section-subtitle">
            <strong className="text-cyan">Real-Time AI Voice Streaming</strong> ➔ <strong className="text-violet">Sub-Second RAG Synthesis</strong> ➔ <strong className="text-cyan">Stealth Desktop HUD Teleprompter</strong>
          </p>
        </div>

        {/* Dual Animated Infinite Marquee Rows */}
        <div className="workflow-marquee-wrapper">
          {/* Edge Blur Fade Masks */}
          <div className="workflow-marquee-fade-left" />
          <div className="workflow-marquee-fade-right" />

          {/* ROW 1: ANIMATES TO THE RIGHT ➔ */}
          <div className="workflow-marquee-track-container" title="Row 1: Moving Right (Hover to Pause)">
            <div className="workflow-marquee-row row-move-right">
              {/* Duplicate array for seamless infinite marquee loop */}
              {[...ROW_1_CARDS, ...ROW_1_CARDS, ...ROW_1_CARDS].map((item, idx) => (
                <MarqueeCard key={`row1-${idx}`} item={item} />
              ))}
            </div>
          </div>

          {/* ROW 2: ANIMATES TO THE LEFT ⬅ */}
          <div className="workflow-marquee-track-container" title="Row 2: Moving Left (Hover to Pause)">
            <div className="workflow-marquee-row row-move-left">
              {/* Duplicate array for seamless infinite marquee loop */}
              {[...ROW_2_CARDS, ...ROW_2_CARDS, ...ROW_2_CARDS].map((item, idx) => (
                <MarqueeCard key={`row2-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
