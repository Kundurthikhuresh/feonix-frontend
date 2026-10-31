"use client";

import React from 'react';
import { Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function FinalCTASection({ onSignupClick }) {
  return (
    <section style={{ padding: '20px 0 60px 0' }}>
      <div className="px-container">
        <div className="px-final-cta-banner">
          <div className="px-final-cta-badge-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
            <Zap size={14} />
            <span>Launch Your Next Interview Loop</span>
          </div>

          <h2 className="px-final-cta-heading" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 auto 16px auto', maxWidth: '760px' }}>
            Stop Freezing in Technical Rounds. <br />
            <span className="px-section-title-highlight">Walk in with Complete Confidence.</span>
          </h2>

          <p className="px-final-cta-desc" style={{ fontSize: 'clamp(15px, 1.8vw, 17px)', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Join software engineers, staff architects, and leaders who rely on Feonix AI for real-time live assistance and voice mock drill sessions.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              onClick={onSignupClick}
              className="px-btn px-btn-primary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              <Sparkles size={16} style={{ color: '#06b6d4' }} />
              <span>Start Free Trial · 5 Sessions</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="px-final-cta-trust" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '12.5px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              5 Free Sessions (10 min each)
            </span>
            <span>•</span>
            <span>No Credit Card Required</span>
            <span>•</span>
            <span>100% Screen-Share Invisible</span>
          </div>
        </div>
      </div>
    </section>
  );
}

