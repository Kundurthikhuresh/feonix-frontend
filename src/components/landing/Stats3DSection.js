"use client";

import { Users, Cpu, ShieldCheck, Zap, Headphones } from 'lucide-react';

const STATS_DATA = [
  {
    id: 'users',
    value: '10K+',
    label: 'Active Users & Sessions',
    desc: 'Empowering engineers across top tech companies worldwide.',
    icon: Users,
    color: '#00f5ff',
  },
  {
    id: 'solutions',
    value: '50+',
    label: 'AI Solutions & Models',
    desc: 'Multi-modal models tailored for coding, design & system logic.',
    icon: Cpu,
    color: '#8b5cf6',
  },
  {
    id: 'reliability',
    value: '99.9%',
    label: 'Reliability & Uptime',
    desc: 'Ultra-resilient real-time audio chunk processing architecture.',
    icon: ShieldCheck,
    color: '#10b981',
  },
  {
    id: 'latency',
    value: '< 1.5s',
    label: 'Streaming Latency',
    desc: 'Lightning fast audio-to-teleprompter answer generation.',
    icon: Zap,
    color: '#38bdf8',
  },
  {
    id: 'support',
    value: '24/7',
    label: 'AI Support & Coach',
    desc: 'Instant post-session analysis, feedback and review chat.',
    icon: Headphones,
    color: '#ec4899',
  },
];

export default function Stats3DSection() {
  return (
    <section className="stats-3d-section">
      <div className="stats-3d-container">
        <div className="stats-3d-grid">
          {STATS_DATA.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="stat-3d-card">
                <div className="stat-card-border-glow" />
                <div className="stat-card-inner">
                  <div className="stat-icon-wrapper" style={{ color: stat.color, borderColor: `${stat.color}40`, background: `${stat.color}15` }}>
                    <Icon size={20} />
                  </div>
                  <div className="stat-number-wrapper">
                    <span className="stat-number" style={{ textShadow: `0 0 24px ${stat.color}60` }}>
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
