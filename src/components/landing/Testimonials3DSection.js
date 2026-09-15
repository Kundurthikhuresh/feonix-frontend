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

export default function Testimonials3DSection({ themeMode = 'dark' }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [tiltState, setTiltState] = useState({});
  const isLight = themeMode === 'light';

  const filteredTestimonials = TESTIMONIALS_DATA.filter(
    (t) => activeCategory === 'all' || t.category === activeCategory
  );

  const handleMouseMove = (id, e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 10;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
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
    <section 
      className={`testimonials-3d-section ${isLight ? 'theme-light' : 'theme-dark'}`}
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        padding: '76px 24px 84px 24px', 
        background: isLight 
          ? 'linear-gradient(180deg, #f8faff 0%, #eef4ff 35%, #f4f0ff 70%, #f8faff 100%)' 
          : 'radial-gradient(ellipse at 50% 20%, #0e0a2a 0%, #060818 50%, #03040c 100%)',
        transition: 'background 0.4s ease'
      }}
    >
      {/* -------------------------------------------------------------
          BACKGROUND LAYER: DARK MODE (Futuristic Nighttime Space Scene)
          ------------------------------------------------------------- */}
      {!isLight && (
        <div className="testimonials-bg-dark-scene" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {/* Left Glowing Celestial Crescent Moon/Planet */}
          <div 
            className="dark-planet-left"
            style={{
              position: 'absolute',
              top: '10%',
              left: '-80px',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #2e1065 0%, #0f172a 60%, #020617 100%)',
              boxShadow: 'inset -22px -22px 60px rgba(0, 0, 0, 0.95), 0 0 60px rgba(168, 85, 247, 0.45), 0 0 120px rgba(0, 245, 255, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.3))'
            }}
          >
            {/* Glowing Atmosphere Crescent Ring */}
            <div 
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.55) 0%, rgba(168, 85, 247, 0.4) 40%, transparent 70%)',
                filter: 'blur(6px)',
                zIndex: -1
              }}
            />
          </div>

          {/* Right Glowing Celestial Planet */}
          <div 
            className="dark-planet-right"
            style={{
              position: 'absolute',
              top: '22%',
              right: '-110px',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #0c4a6e 0%, #082f49 40%, #020617 100%)',
              boxShadow: 'inset -25px -25px 70px rgba(0, 0, 0, 0.95), 0 0 70px rgba(0, 245, 255, 0.5), 0 0 140px rgba(56, 189, 248, 0.25)',
              border: '1px solid rgba(0, 245, 255, 0.35)'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '50%',
                background: 'linear-gradient(225deg, rgba(0, 245, 255, 0.6) 0%, rgba(56, 189, 248, 0.35) 45%, transparent 70%)',
                filter: 'blur(8px)',
                zIndex: -1
              }}
            />
          </div>

          {/* Distant Small Blue Moon (Top Right) */}
          <div 
            style={{
              position: 'absolute',
              top: '14%',
              right: '18%',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #0284c7 0%, #0f172a 70%, #020617 100%)',
              boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.9), 0 0 25px rgba(0, 245, 255, 0.4)',
              opacity: 0.85
            }}
          />

          {/* Distant Micro Moon (Left Center) */}
          <div 
            style={{
              position: 'absolute',
              top: '40%',
              left: '18%',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #38bdf8, #0f172a)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)',
              opacity: 0.75
            }}
          />

          {/* Subtle Glowing Light Arcs */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45 }}>
            <path 
              d="M -100,500 Q 400,200 900,450 T 1800,300" 
              fill="none" 
              stroke="url(#darkArcGradCyan)" 
              strokeWidth="1.5" 
              filter="blur(1px)" 
            />
            <path 
              d="M 200,600 Q 800,300 1400,550 T 2100,400" 
              fill="none" 
              stroke="url(#darkArcGradPurple)" 
              strokeWidth="1.5" 
              filter="blur(1px)" 
            />
            <defs>
              <linearGradient id="darkArcGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f5ff" stopOpacity="0" />
                <stop offset="50%" stopColor="#00f5ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="darkArcGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Soft Central Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '900px',
              height: '500px',
              background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, rgba(0, 245, 255, 0.08) 45%, transparent 70%)',
              filter: 'blur(90px)',
              pointerEvents: 'none'
            }}
          />

          {/* Subtle Grid Lines Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
              pointerEvents: 'none'
            }}
          />

          {/* 3D WebGL Background Canvas for Nodes & Synapses */}
          <Testimonials3DBackgroundCanvas />
        </div>
      )}

      {/* -------------------------------------------------------------
          BACKGROUND LAYER: LIGHT MODE (Futuristic Light SaaS Scene)
          ------------------------------------------------------------- */}
      {isLight && (
        <div className="testimonials-bg-light-scene" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {/* Left Floating Soft Pastel Orbs */}
          <div 
            style={{
              position: 'absolute',
              top: '12%',
              left: '-40px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(199, 210, 254, 0.55) 0%, rgba(224, 231, 255, 0.25) 60%, transparent 80%)',
              filter: 'blur(30px)'
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: '38%',
              left: '8%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(216, 180, 254, 0.45) 0%, rgba(243, 232, 255, 0.15) 70%, transparent 90%)',
              filter: 'blur(16px)'
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: '20%',
              left: '18%',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(165, 243, 252, 0.8) 0%, rgba(207, 250, 254, 0.3) 100%)',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.25)'
            }}
          />

          {/* Right Flowing Translucent Light Waves / Ribbon Curves */}
          <svg style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', opacity: 0.65 }}>
            <path 
              d="M 100,-50 C 300,150 200,450 550,600 L 700,-50 Z" 
              fill="url(#lightWaveLavender)" 
              filter="blur(25px)" 
            />
            <path 
              d="M 250,50 C 450,250 350,550 700,750 L 800,50 Z" 
              fill="url(#lightWaveCyan)" 
              filter="blur(30px)" 
            />
            <defs>
              <linearGradient id="lightWaveLavender" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="lightWaveCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Right Floating Soft Spheres */}
          <div 
            style={{
              position: 'absolute',
              top: '28%',
              right: '12%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #93c5fd 0%, #e0e7ff 70%, transparent 100%)',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.15)',
              opacity: 0.8
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: '55%',
              right: '22%',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #67e8f9 0%, #cffafe 80%, transparent 100%)',
              boxShadow: '0 6px 20px rgba(6, 182, 212, 0.2)',
              opacity: 0.75
            }}
          />

          {/* Subtle Grid Lines Overlay (Light Mode) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.035) 1px, transparent 1px)',
              backgroundSize: '54px 54px',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN CONTENT CONTAINER (Exact Layout & Typography Preserved)
          ------------------------------------------------------------- */}
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
              background: isLight ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.15)',
              border: isLight ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(139, 92, 246, 0.35)',
              color: isLight ? '#7c3aed' : '#c084fc',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              boxShadow: isLight ? '0 2px 10px rgba(139, 92, 246, 0.1)' : '0 0 20px rgba(139, 92, 246, 0.2)'
            }}
          >
            <Award size={14} />
            <span>VERIFIED SUCCESS & COMPENSATION IMPACT</span>
          </div>

          <h2 
            style={{ 
              fontSize: 'clamp(34px, 4vw, 44px)', 
              fontWeight: '900', 
              color: isLight ? '#0f172a' : '#ffffff', 
              letterSpacing: '-0.02em', 
              margin: '0 0 16px', 
              lineHeight: '1.2',
              transition: 'color 0.3s ease'
            }}
          >
            12,000+ Engineers & Tech Leaders Hired
          </h2>

          <p 
            style={{ 
              fontSize: '17px', 
              color: isLight ? '#64748b' : '#94a3b8', 
              maxWidth: '720px', 
              margin: '0 auto', 
              lineHeight: '1.6',
              transition: 'color 0.3s ease'
            }}
          >
            See how candidates leveraged Feonix AI to ace high-stakes technical interviews at FAANG and top-tier tech companies with an average compensation increase of +$85,000+.
          </p>
        </div>

        {/* Global Impact Summary Badges */}
        <div className="testimonials-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          <div
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(13, 18, 33, 0.92)',
              borderRadius: '20px',
              padding: '24px',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              backdropFilter: 'blur(20px)',
              boxShadow: isLight ? '0 10px 30px rgba(99, 102, 241, 0.07)' : '0 10px 30px rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: isLight ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(168, 85, 247, 0.4)', color: isLight ? '#9333ea' : '#c084fc', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>+$85,000</div>
              <div style={{ fontSize: '13px', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>Average Compensation Boost</div>
            </div>
          </div>

          <div
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(13, 18, 33, 0.92)',
              borderRadius: '20px',
              padding: '24px',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              backdropFilter: 'blur(20px)',
              boxShadow: isLight ? '0 10px 30px rgba(99, 102, 241, 0.07)' : '0 10px 30px rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: isLight ? 'rgba(6, 182, 212, 0.12)' : 'rgba(0, 245, 255, 0.18)', border: '1px solid rgba(0, 245, 255, 0.4)', color: isLight ? '#0891b2' : '#00f5ff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>98.4%</div>
              <div style={{ fontSize: '13px', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>Interview Stage Pass Rate</div>
            </div>
          </div>

          <div
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(13, 18, 33, 0.92)',
              borderRadius: '20px',
              padding: '24px',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              backdropFilter: 'blur(20px)',
              boxShadow: isLight ? '0 10px 30px rgba(99, 102, 241, 0.07)' : '0 10px 30px rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.4)', color: isLight ? '#059669' : '#10b981', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>12,450+</div>
              <div style={{ fontSize: '13px', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>FAANG & Unicorn Offers</div>
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
                background: activeCategory === cat.id 
                  ? 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)' 
                  : (isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.85)'),
                color: activeCategory === cat.id 
                  ? '#ffffff' 
                  : (isLight ? '#475569' : '#94a3b8'),
                border: activeCategory === cat.id 
                  ? 'none' 
                  : (isLight ? '1px solid rgba(203, 213, 225, 0.8)' : '1px solid rgba(255, 255, 255, 0.12)'),
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeCategory === cat.id 
                  ? '0 0 25px rgba(0, 245, 255, 0.4)' 
                  : (isLight ? '0 2px 8px rgba(99, 102, 241, 0.05)' : 'none')
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
                  background: isLight 
                    ? (tilt.active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.94)')
                    : (tilt.active ? 'rgba(15, 23, 42, 0.96)' : 'rgba(12, 17, 32, 0.92)'),
                  border: isLight
                    ? `1.5px solid ${tilt.active ? t.accent : 'rgba(226, 232, 240, 0.9)'}`
                    : `1.5px solid ${tilt.active ? t.accent : 'rgba(255, 255, 255, 0.14)'}`,
                  boxShadow: isLight
                    ? (tilt.active ? `0 20px 40px rgba(99, 102, 241, 0.15), 0 0 25px ${t.accent}30` : '0 10px 30px rgba(99, 102, 241, 0.06)')
                    : (tilt.active ? `0 24px 50px rgba(0,0,0,0.9), 0 0 35px ${t.accent}40` : '0 12px 35px rgba(0,0,0,0.6)'),
                  padding: '26px',
                  backdropFilter: 'blur(24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                {/* 3D Light Specular Glare */}
                {tilt.active && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,${isLight ? '0.25' : '0.15'}) 0%, transparent 65%)`,
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
                        background: `${t.accent}18`,
                        border: `1.5px solid ${t.accent}60`,
                        padding: '4px 12px',
                        borderRadius: '8px',
                        letterSpacing: '0.04em',
                        boxShadow: `0 0 12px ${t.accent}20`
                      }}
                    >
                      {t.salaryBump}
                    </span>
                  </div>

                  {/* High-Contrast Crystal-Clear Quote Text */}
                  <p
                    style={{
                      fontSize: '14.5px',
                      color: isLight ? '#1e293b' : '#f1f5f9',
                      lineHeight: '1.65',
                      margin: '0 0 24px',
                      fontWeight: '500',
                      letterSpacing: '-0.01em',
                      transform: 'translateZ(18px)',
                      transition: 'color 0.3s ease'
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
                    borderTop: isLight ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transform: 'translateZ(26px)',
                    transition: 'border-color 0.3s ease'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15.5px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', marginBottom: '2px', transition: 'color 0.3s ease' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s ease' }}>
                      <Building2 size={13} style={{ color: t.accent }} />
                      <span>{t.company}</span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      color: isLight ? '#475569' : '#ffffff',
                      background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                      border: isLight ? '1px solid rgba(203, 213, 225, 0.8)' : '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease'
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
