"use client";

import { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Shield, 
  Zap, 
  Star, 
  BarChart3, 
  User, 
  Globe, 
  ArrowUpRight, 
  ChevronRight 
} from 'lucide-react';
import HeroAssistant3DStage from './HeroAssistant3DStage';

export default function Hero3DSection({ onGetStarted, onExplore, onWatchDemo }) {
  const [activePanel, setActivePanel] = useState(null);

  const featurePanels = [
    {
      id: 'practice',
      icon: <BarChart3 size={18} />,
      tag: 'PRACTICE',
      title: 'IMPROVE',
      sub: 'GET HIRED',
    },
    {
      id: 'copilot',
      icon: <Star size={18} />,
      tag: 'AI',
      title: 'YOUR CAREER',
      sub: 'COPILOT',
    },
    {
      id: 'feedback',
      icon: <User size={18} />,
      tag: 'REAL-TIME',
      title: 'FEEDBACK',
      sub: '',
    },
    {
      id: 'jobs',
      icon: <Globe size={18} />,
      tag: 'TOP JOB',
      title: 'MATCHING',
      sub: '',
    },
  ];

  return (
    <section className="hero-3d-section hero-cyber-command-center" id="hero">
      {/* Clean Ambient Atmospheric Glows */}
      <div className="hero-ambient-glow hero-glow-cyan" />
      <div className="hero-ambient-glow hero-glow-violet" />
      <div className="hero-grid-overlay" />

      <div className="hero-panoramic-container">
        {/* Left Column: Messaging, CTA, Trust & Social Proof */}
        <div className="hero-left-column">
          {/* Announcement Pill */}
          <div className="hero-pill-badge">
            <span className="pill-star-icon">★</span>
            <span className="pill-text">Feonix 3.0 Real-Time Neural Assistant</span>
            <span className="pill-tag">NEW</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="hero-main-title">
            Land Your <br />
            Dream Job with <br />
            <span className="hero-cyan-word">Feonix</span> <span className="hero-purple-word">AI</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-main-subtitle">
            Analyze. Improve. Apply. Get Hired. An intelligent career companion designed to build stronger resumes, match top jobs, and deliver real-time interview teleprompter cues.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="hero-cta-button-group">
            <button
              className="hero-btn-primary"
              onClick={onGetStarted}
              type="button"
            >
              <span>Get Started</span>
              <ArrowRight size={16} className="btn-arrow" />
              <div className="btn-shine-sweep" />
            </button>

            <button
              className="hero-btn-watch-demo"
              onClick={onWatchDemo || onExplore}
              type="button"
            >
              <div className="demo-play-circle">
                <Play size={12} fill="#ffffff" className="demo-play-icon" />
              </div>
              <div className="demo-text-wrap">
                <span className="demo-title">Watch Demo</span>
                <span className="demo-subtitle">See how it works</span>
              </div>
            </button>
          </div>

          {/* Trust Indicators: 3 Glass Cards */}
          <div className="hero-trust-cards-row">
            <div className="hero-trust-card">
              <div className="trust-card-icon-wrap cyan">
                <Shield size={18} />
              </div>
              <div className="trust-card-text">
                <span className="trust-card-label">Sandbox Privacy</span>
                <span className="trust-card-sub">Isolation</span>
              </div>
            </div>

            <div className="hero-trust-card">
              <div className="trust-card-icon-wrap blue">
                <Zap size={18} />
              </div>
              <div className="trust-card-text">
                <span className="trust-card-label">&lt; 1.5s</span>
                <span className="trust-card-sub">Voice Cues</span>
              </div>
            </div>

            <div className="hero-trust-card">
              <div className="trust-card-icon-wrap star">
                <Star size={18} />
              </div>
              <div className="trust-card-text">
                <span className="trust-card-label">99.9%</span>
                <span className="trust-card-sub">Uptime SLA</span>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="hero-social-proof-bar">
            <div className="social-proof-avatars">
              <span className="avatar-circle av1">👨🏻</span>
              <span className="avatar-circle av2">👩🏼</span>
              <span className="avatar-circle av3">👨🏽</span>
              <span className="avatar-circle av4">👩🏻</span>
            </div>
            <span className="social-proof-text">Trusted by 50,000+ job seekers</span>
            <span className="social-proof-divider">|</span>
            <div className="social-proof-rating">
              <span className="stars">★★★★★</span>
              <span className="rating-score">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Center-Right Showcase: 3D Robot Pedestal + Floating Feature Panels */}
        <div className="hero-showcase-stage-column">
          {/* Interactive 3D Robot Pedestal Stage */}
          <div className="hero-robot-center-wrap">
            <HeroAssistant3DStage onOpenAssistant={onExplore} />
          </div>

          {/* Right Floating Feature Cards */}
          <div className="hero-right-feature-panels">
            {featurePanels.map((panel, idx) => (
              <div
                key={panel.id}
                className={`hero-hologram-feature-card ${activePanel === idx ? 'is-active' : ''}`}
                onMouseEnter={() => setActivePanel(idx)}
                onMouseLeave={() => setActivePanel(null)}
              >
                <div className="feature-card-icon-box">
                  {panel.icon}
                </div>
                <div className="feature-card-text-col">
                  <span className="feature-card-tag">{panel.tag}</span>
                  <span className="feature-card-title">{panel.title}</span>
                  {panel.sub && <span className="feature-card-sub">{panel.sub}</span>}
                </div>
              </div>
            ))}

            {/* Bottom Accent Capsule Card */}
            <div className="hero-hologram-accent-card">
              <div className="accent-card-row">
                <div className="accent-text-group">
                  <span className="accent-sub">A SMARTER</span>
                  <span className="accent-main">YOU</span>
                </div>
                <ArrowUpRight size={14} className="accent-arrow" />
              </div>
              <div className="accent-card-row">
                <div className="accent-text-group">
                  <span className="accent-sub">A BRIGHTER</span>
                  <span className="accent-main">TOMORROW</span>
                </div>
                <ChevronRight size={14} className="accent-chevron" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Telemetry Indicator */}
      <div className="hero-bottom-telemetry">
        <span className="telemetry-label">LAND · LEARN · GROW</span>
        <div className="telemetry-progress-track">
          <div className="telemetry-progress-fill" />
        </div>
      </div>
    </section>
  );
}
