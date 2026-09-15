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
    <section className="stats-3d-section" style={{ position: 'relative', padding: '80px 24px', background: 'rgba(8, 11, 18, 0.8)' }}>
      <div className="stats-3d-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#00f5ff', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(0, 245, 255, 0.1)', padding: '4px 14px', borderRadius: '999px', border: '1px solid rgba(0, 245, 255, 0.25)' }}>
            PROVEN BENCHMARKS & PERFORMANCE
          </span>
          <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#f8fafc', margin: '12px 0 0' }}>
            Built for Real-World Technical Performance
          </h2>
        </div>

        <div className="stats-3d-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {STATS_DATA.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="stat-3d-card" style={{ background: 'rgba(15, 23, 42, 0.65)', border: `1px solid ${stat.color}30`, borderRadius: '18px', padding: '24px', transition: 'all 0.25s ease', boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>
                <div className="stat-card-inner">
                  <div className="stat-icon-wrapper" style={{ width: '42px', height: '42px', borderRadius: '12px', color: stat.color, border: `1px solid ${stat.color}40`, background: `${stat.color}15`, display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
                    <Icon size={22} />
                  </div>
                  <div className="stat-number-wrapper" style={{ marginBottom: '8px' }}>
                    <span className="stat-number" style={{ fontSize: '32px', fontWeight: '900', textShadow: `0 0 24px ${stat.color}60`, fontFamily: 'var(--mono)' }}>
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="stat-label" style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px' }}>{stat.label}</h3>
                  <p className="stat-desc" style={{ fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
