"use client";

import { Users, Cpu, ShieldCheck, Zap, Headphones, Award, EyeOff, Code2 } from 'lucide-react';

const STATS_DATA = [
  {
    id: 'minutes',
    value: '500K+',
    label: 'Live Interview Minutes',
    desc: 'Streamed seamlessly across real-world technical and system design calls.',
    icon: Zap,
    color: '#00f5ff',
  },
  {
    id: 'accuracy',
    value: '99.8%',
    label: 'Answer Accuracy Rate',
    desc: 'Powered by GPT-4o multi-modal models for precise code & STAR reasoning.',
    icon: ShieldCheck,
    color: '#10b981',
  },
  {
    id: 'offers',
    value: '15,000+',
    label: 'Job Offers Secured',
    desc: 'Candidates hired at FAANG, top unicorns, and global tech enterprises.',
    icon: Award,
    color: '#f59e0b',
  },
  {
    id: 'stealth',
    value: '100%',
    label: 'Undetectable Stealth Shield',
    desc: 'Zero window capture flags with private overlay technology.',
    icon: EyeOff,
    color: '#ec4899',
  },
  {
    id: 'latency',
    value: '< 150ms',
    label: 'Streaming Teleprompter Speed',
    desc: 'Real-time audio chunk processing to text teleprompter generation.',
    icon: Cpu,
    color: '#38bdf8',
  },
  {
    id: 'languages',
    value: '50+',
    label: 'Languages & Frameworks',
    desc: 'Supports Python, JS, C++, Go, Java, Rust, SQL & System Architecture.',
    icon: Code2,
    color: '#a78bfa',
  },
  {
    id: 'users',
    value: '10,000+',
    label: 'Active Engineers',
    desc: 'Trusted by developers, engineering leads, and technical founders.',
    icon: Users,
    color: '#00f5ff',
  },
  {
    id: 'coaching',
    value: '24/7',
    label: 'AI Coach & Speech Analysis',
    desc: 'Instant filler word detection, tone feedback, and transcript review.',
    icon: Headphones,
    color: '#10b981',
  },
];

export default function Stats3DSection() {
  return (
    <section className="stats-3d-section" id="stats">
      {/* Premium Night Mode Background Blobs */}
      <div className="premium-bg-blob premium-bg-blob-1" aria-hidden="true" />
      <div className="premium-bg-blob premium-bg-blob-2" aria-hidden="true" />
      <div className="premium-bg-blob premium-bg-blob-3" aria-hidden="true" />
      <div className="stats-3d-container">
        {/* Header */}
        <div className="section-header-pill-wrapper" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge-pill-cyan">
            PROVEN BENCHMARKS &amp; PERFORMANCE
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 36px)', fontWeight: '900', color: 'var(--text-primary)', margin: '12px 0 0', letterSpacing: '-0.02em' }}>
            Built for Real-World Technical Performance
          </h2>
        </div>

        {/* 4-Column Balanced Grid */}
        <div className="stats-3d-grid">
          {STATS_DATA.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="stat-3d-card"
                style={{
                  border: `1px solid ${stat.color}35`,
                  '--card-glow': stat.color,
                }}
              >
                <div className="stat-card-border-glow" style={{ borderColor: `${stat.color}25` }} />
                <div className="stat-card-inner">
                  <div
                    className="stat-icon-wrapper"
                    style={{
                      color: stat.color,
                      borderColor: `${stat.color}40`,
                      background: `${stat.color}15`,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="stat-number-wrapper">
                    <span
                      className="stat-number"
                      style={{
                        color: 'var(--text-primary)',
                        textShadow: `0 0 24px ${stat.color}50`
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="stat-label">{stat.label}</h3>
                  <p className="stat-desc">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

