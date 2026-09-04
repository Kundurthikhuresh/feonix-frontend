"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Star, TrendingUp, Award, Building2, CheckCircle, Sparkles } from 'lucide-react';

const TestimonialAvatarCanvas = dynamic(() => import('../3d/TestimonialAvatarCanvas'), {
  ssr: false,
  loading: () => <div className="testimonials-canvas-placeholder" />
});

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
    quote: 'During my System Design round, the interviewer threw a surprise multi-region consistency edge case. Feonix AI instantly cued the exact vector clock & DynamoDB quorum formulas on my teleprompter. Passed with top marks!'
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
    quote: 'The 60ms latency is insane. I didn’t have to look away or break eye contact once. The automated code syntax inspector helped me solve 2 hard DP problems in 35 minutes.'
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
    quote: 'Feonix AI Dual Mode (Copilot + Coach) gave me real-time feedback during mock runs and live execution during actual calls. It transformed my confidence overnight.'
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
    quote: 'Product Execution interviews require crisp STAR-framework metrics. Feonix AI retrieved specific metrics from my uploaded resume library seamlessly.'
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
    const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 10;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
    setTiltState((prev) => ({ ...prev, [id]: { rotX, rotY } }));
  };

  const handleMouseLeave = (id) => {
    setTiltState((prev) => ({ ...prev, [id]: { rotX: 0, rotY: 0 } }));
  };

  return (
    <section className="testimonials-3d-section">
      <div className="testimonials-glow-bg" />

      <div className="testimonials-container">
        {/* Header */}
        <div className="testimonials-header">
          <div className="testimonials-pill-badge">
            <Award size={14} />
            <span>VERIFIED SUCCESS & COMPENSATION IMPACT</span>
          </div>
          <h2 className="testimonials-main-heading">
            12,000+ Engineers & Tech Leaders Hired
          </h2>
          <p className="testimonials-sub-heading">
            See how candidates leveraged Feonix AI to ace high-stakes technical interviews at FAANG and top-tier tech companies with an average compensation increase of +$85,000+.
          </p>
        </div>

        {/* Global Impact Summary Badges */}
        <div className="testimonials-summary-grid">
          <div className="summary-metric-card">
            <div className="metric-icon-box purple">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="metric-big-num">+$85,000</div>
              <div className="metric-sub-label">Average Compensation Boost</div>
            </div>
          </div>

          <div className="summary-metric-card">
            <div className="metric-icon-box cyan">
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="metric-big-num">98.4%</div>
              <div className="metric-sub-label">Interview Stage Pass Rate</div>
            </div>
          </div>

          <div className="summary-metric-card">
            <div className="metric-icon-box emerald">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="metric-big-num">12,450+</div>
              <div className="metric-sub-label">FAANG & Unicorn Offers</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="testimonials-tabs-wrap">
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'engineer', label: 'Senior Engineers' },
            { id: 'architect', label: 'System Architects' },
            { id: 'pm', label: 'Product Managers' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`testimonials-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Testimonials 3D Grid + Hologram Side Component */}
        <div className="testimonials-main-grid">
          {/* 3D Hologram Avatar Display */}
          <div className="testimonials-hologram-box">
            <div className="testimonials-canvas-wrapper">
              <TestimonialAvatarCanvas />
            </div>
            <div className="hologram-title">Holographic Feedback Core</div>
            <p className="hologram-desc">
              Real-time telemetry and outcome metrics submitted by verified Feonix AI candidates.
            </p>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="testimonials-cards-grid">
            {filteredTestimonials.map((t) => {
              const tilt = tiltState[t.id] || { rotX: 0, rotY: 0 };
              return (
                <div
                  key={t.id}
                  onMouseMove={(e) => handleMouseMove(t.id, e)}
                  onMouseLeave={() => handleMouseLeave(t.id)}
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg)`,
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="testimonial-card-3d"
                >
                  <div>
                    <div className="testimonial-card-top">
                      <div className="rating-stars">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} size={15} className="star-filled" />
                        ))}
                      </div>
                      <span className="salary-bump-badge">{t.salaryBump}</span>
                    </div>

                    <p className="testimonial-quote">"{t.quote}"</p>
                  </div>

                  <div className="testimonial-card-footer">
                    <div>
                      <div className="candidate-name">{t.name}</div>
                      <div className="candidate-company">
                        <Building2 size={12} />
                        {t.company}
                      </div>
                    </div>
                    <span className="offer-tag">{t.offerText}</span>
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
