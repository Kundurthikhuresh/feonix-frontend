"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Star, TrendingUp, Award, Building2, CheckCircle, Sparkles } from 'lucide-react';

const Testimonials3DBackgroundCanvas = dynamic(
  () => import('../3d/Testimonials3DBackgroundCanvas'),
  { ssr: false }
);

const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: 'Alexandre R.',
    role: 'Senior Staff Software Engineer',
    company: 'Meta (FAANG)',
    category: 'engineer',
    rating: 5,
    salaryBump: '+$95,000 / yr',
    offerText: 'L6 Staff Engineer Offer',
    quote: 'During my System Design round, the interviewer threw a surprise multi-region consistency edge case. Feonix AI instantly cued the exact vector clock & DynamoDB quorum formulas on my teleprompter. Passed with top marks!',
    accent: '#00f5ff'
  },
  {
    id: 2,
    name: 'Priya K.',
    role: 'Principal System Architect',
    company: 'Stripe',
    category: 'architect',
    rating: 5,
    salaryBump: '+$110,000 / yr',
    offerText: 'Principal Architect Offer',
    quote: 'The 60ms latency is insane. I didn’t have to look away or break eye contact once. The automated code syntax inspector helped me solve 2 hard DP problems in 35 minutes.',
    accent: '#8b5cf6'
  },
  {
    id: 3,
    name: 'Marcus V.',
    role: 'Lead AI Engineer',
    company: 'OpenAI Ecosystem Partner',
    category: 'engineer',
    rating: 5,
    salaryBump: '+$85,000 / yr',
    offerText: 'AI Tech Lead Offer',
    quote: 'Feonix AI Dual Mode (Copilot + Coach) gave me real-time feedback during mock runs and live execution during actual calls. It transformed my confidence overnight.',
    accent: '#10b981'
  },
  {
    id: 4,
    name: 'Elena T.',
    role: 'Group Product Manager',
    company: 'Google',
    category: 'pm',
    rating: 5,
    salaryBump: '+$75,000 / yr',
    offerText: 'L6 Product Lead Offer',
    quote: 'Product Execution interviews require crisp STAR-framework metrics. Feonix AI retrieved specific metrics from my uploaded resume library seamlessly.',
    accent: '#ec4899'
  },
  {
    id: 5,
    name: 'David L.',
    role: 'Infrastructure Architect',
    company: 'Netflix',
    category: 'architect',
    rating: 5,
    salaryBump: '+$105,000 / yr',
    offerText: 'Senior Infra Architect',
    quote: 'The vision code solver extracted complex concurrency diagrams from screen snaps in under a second. Highly recommended for senior technical roles!',
    accent: '#3b82f6'
  },
  {
    id: 6,
    name: 'Sarah M.',
    role: 'Staff Product Manager',
    company: 'Apple',
    category: 'pm',
    rating: 5,
    salaryBump: '+$80,000 / yr',
    offerText: 'Staff PM Offer',
    quote: 'The AI Voice Coach analyzed my speaking pace and filler words after every mock interview. I entered my actual interviews completely composed and prepared.',
    accent: '#f59e0b'
  }
];

export default function Testimonials3DSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [tiltState, setTiltState] = useState({});

  const filteredTestimonials = TESTIMONIALS_DATA.filter(
    (t) => activeCategory === 'all' || t.category === activeCategory
  );

  const handleMouseMove = (id, e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 12;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTiltState((prev) => ({
      ...prev,
      [id]: { rotX, rotY, glareX, glareY, active: true }
    }));
  };

  const handleMouseLeave = (id) => {
    setTiltState((prev) => ({
      ...prev,
      [id]: { rotX: 0, rotY: 0, glareX: 50, glareY: 50, active: false }
    }));
  };

  return (
    <section className="testimonials-3d-section" style={{ position: 'relative', overflow: 'hidden', padding: '96px 24px', background: '#050814' }}>
      
      {/* 3D WebGL Background Canvas Component */}
      <Testimonials3DBackgroundCanvas />

      {/* Radiant Glow Atmosphere */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(0, 245, 255, 0.06) 45%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      <div className="testimonials-container" style={{ position: 'relative', zIndex: 5, maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div className="testimonials-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#c084fc',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
            }}
          >
            <Award size={14} />
            <span>VERIFIED SUCCESS & COMPENSATION IMPACT</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            12,000+ Engineers & Tech Leaders Hired
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
            See how candidates leveraged Feonix AI to ace high-stakes technical interviews at FAANG and top-tier tech companies with an average compensation increase of +$85,000+.
          </p>
        </div>

        {/* Global Impact Summary Badges */}
        <div className="testimonials-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          <div
            style={{
              background: 'rgba(13, 18, 33, 0.92)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>+$85,000</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Average Compensation Boost</div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(13, 18, 33, 0.92)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(0, 245, 255, 0.18)', border: '1px solid rgba(0, 245, 255, 0.4)', color: '#00f5ff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>98.4%</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Interview Stage Pass Rate</div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(13, 18, 33, 0.92)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>12,450+</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>FAANG & Unicorn Offers</div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '48px' }}>
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'engineer', label: 'Senior Engineers' },
            { id: 'architect', label: 'System Architects' },
            { id: 'pm', label: 'Product Managers' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: '800',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: activeCategory === cat.id ? 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)' : 'rgba(15, 23, 42, 0.85)',
                color: activeCategory === cat.id ? '#ffffff' : '#94a3b8',
                border: activeCategory === cat.id ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeCategory === cat.id ? '0 0 25px rgba(0, 245, 255, 0.4)' : 'none'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* High-Contrast Crystal-Clear 3D Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '28px',
            perspective: '1200px'
          }}
        >
          {filteredTestimonials.map((t) => {
            const tilt = tiltState[t.id] || { rotX: 0, rotY: 0, glareX: 50, glareY: 50, active: false };
            return (
              <div
                key={t.id}
                onMouseMove={(e) => handleMouseMove(t.id, e)}
                onMouseLeave={() => handleMouseLeave(t.id)}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) translateZ(${tilt.active ? 14 : 0}px)`,
                  transition: tilt.active ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  borderRadius: '20px',
                  background: tilt.active
                    ? 'rgba(15, 23, 42, 0.96)'
                    : 'rgba(12, 17, 32, 0.92)',
                  border: `1.5px solid ${tilt.active ? t.accent : 'rgba(255, 255, 255, 0.14)'}`,
                  boxShadow: tilt.active
                    ? `0 24px 50px rgba(0,0,0,0.9), 0 0 35px ${t.accent}40`
                    : '0 12px 35px rgba(0,0,0,0.6)',
                  padding: '26px',
                  backdropFilter: 'blur(24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                {/* 3D Light Specular Glare */}
                {tilt.active && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.15) 0%, transparent 65%)`,
                      pointerEvents: 'none',
                      zIndex: 10,
                      borderRadius: '20px'
                    }}
                  />
                )}

                <div>
                  {/* Top Rating & High-Contrast Salary Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', transform: 'translateZ(24px)' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="#f59e0b" style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' }} />
                      ))}
                    </div>

                    <span
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        fontWeight: '800',
                        color: t.accent,
                        background: `${t.accent}20`,
                        border: `1.5px solid ${t.accent}60`,
                        padding: '4px 12px',
                        borderRadius: '8px',
                        letterSpacing: '0.04em',
                        boxShadow: `0 0 12px ${t.accent}25`
                      }}
                    >
                      {t.salaryBump}
                    </span>
                  </div>

                  {/* High-Contrast Crystal-Clear Quote Text */}
                  <p
                    style={{
                      fontSize: '14.5px',
                      color: '#f1f5f9',
                      lineHeight: '1.65',
                      margin: '0 0 24px',
                      fontWeight: '500',
                      letterSpacing: '-0.01em',
                      transform: 'translateZ(18px)'
                    }}
                  >
                    "{t.quote}"
                  </p>
                </div>

                {/* Footer Candidate Info & Offer Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'translateZ(26px)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#ffffff', marginBottom: '2px' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={13} style={{ color: t.accent }} />
                      <span>{t.company}</span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      color: '#ffffff',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t.offerText}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
