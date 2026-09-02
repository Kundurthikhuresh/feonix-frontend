"use client";

import dynamic from 'next/dynamic';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const AIOrbCanvas = dynamic(() => import('../3d/AIOrbCanvas'), {
  ssr: false,
  loading: () => <div className="orb-fallback-ambient" />,
});

export default function CTA3DSection({ onStartBuilding }) {
  return (
    <section className="cta-3d-section">
      <div className="cta-3d-container">
        {/* Background 3D AI Orb WebGL Canvas */}
        <AIOrbCanvas />

        {/* Dynamic Foreground Content */}
        <div className="cta-3d-content-card">
          <div className="cta-badge-pill">
            <Sparkles size={14} className="text-cyan" />
            <span>JOIN THOUSANDS OF ENGINEERS</span>
          </div>

          <h2 className="cta-main-heading">
            Ready to Build with <span className="gradient-text-cyan">Feonix AI?</span>
          </h2>

          <p className="cta-main-description">
            Experience the next generation of intelligent applications with Feonix AI. Transform your interview preparation and live meeting confidence today.
          </p>

          <div className="cta-action-buttons">
            <button
              className="cta-primary-btn"
              onClick={onStartBuilding}
              type="button"
            >
              <span>Start Building Free</span>
              <ArrowRight size={17} />
              <div className="btn-glow-shimmer" />
            </button>
          </div>

          <div className="cta-guarantees-row">
            <div className="guarantee-item">
              <ShieldCheck size={16} className="text-emerald" />
              <span>No credit card required to start</span>
            </div>
            <div className="guarantee-item">
              <span className="dot cyan" />
              <span>Instant setup in under 2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
