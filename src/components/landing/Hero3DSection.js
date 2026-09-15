"use client";

import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';
import HeroAssistant3DStage from './HeroAssistant3DStage';

export default function Hero3DSection({ onGetStarted, onExplore, onWatchDemo }) {
  return (
    <section className="hero-3d-section" id="hero">
      {/* Dynamic Background Light Rays & Glows */}
      <div className="hero-ambient-glow hero-glow-cyan" />
      <div className="hero-ambient-glow hero-glow-violet" />
      <div className="hero-grid-overlay" />

      <div className="hero-3d-container">
        {/* Left Column: Hero Content & CTAs */}
        <div className="hero-left-column">
          {/* Top Announcement Pill */}
          <div className="hero-pill-badge">
            <span className="pill-pulse-dot" />
            <Sparkles size={14} className="pill-icon" />
            <span className="pill-text">Feonix 3.0 Real-Time Neural Assistant</span>
            <span className="pill-tag">NEW</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="hero-main-title">
            Land Your Dream Job with <br />
            <span className="hero-gradient-text">Feonix AI</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-main-subtitle">
            Analyze. Improve. Apply. Get Hired. An intelligent career companion designed to build stronger resumes, match top jobs, and deliver real-time interview teleprompter cues.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-button-group">
            <button
              className="hero-btn-primary"
              onClick={onGetStarted}
              type="button"
            >
              <span>Get Started</span>
              <ArrowRight size={17} className="btn-arrow" />
              <div className="btn-shine-sweep" />
            </button>
          </div>

          {/* Value Badges */}
          <div className="hero-badges-row">
            <div className="hero-badge-item">
              <ShieldCheck size={16} className="badge-icon text-cyan" />
              <span>Sandbox Privacy Isolation</span>
            </div>
            <div className="hero-badge-item">
              <Zap size={16} className="badge-icon text-violet" />
              <span>&lt; 1.5s Voice Cues</span>
            </div>
            <div className="hero-badge-item">
              <Activity size={16} className="badge-icon text-emerald" />
              <span>99.9% Uptime SLA</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D AI Robot Assistant Stage */}
        <div className="hero-right-column">
          <HeroAssistant3DStage onOpenAssistant={onExplore} />
        </div>
      </div>
    </section>
  );
}
