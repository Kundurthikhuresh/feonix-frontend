"use client";

import { Check, Sparkles, MessageSquare, Headphones, TrendingUp, Radio } from 'lucide-react';

export default function DualModeSection() {
  return (
    <section className="dual-mode-3d-section" id="duo">
      <div className="dual-mode-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Radio size={14} className="pill-icon text-violet" />
            <span>PARALLEL AI ENGINE</span>
          </div>
          <h2 className="section-title">
            Two Specialized Modes. <br />
            <span className="gradient-text-cyan">One Unified Platform.</span>
          </h2>
          <p className="section-subtitle">
            Feonix AI operates as a dual-layer system: guiding you live during high-stakes calls, then providing rigorous post-session analytics and coaching.
          </p>
        </div>

        {/* Dual Cards Grid */}
        <div className="dual-mode-cards-grid">
          {/* 1. Copilot Mode Card */}
          <div className="dual-mode-card copilot-card">
            <div className="card-ambient-glow cyan" />
            <div className="dual-card-inner">
              <div className="dual-card-header">
                <div className="mode-badge-live">
                  <span className="live-dot" />
                  <span>REAL-TIME HUD</span>
                </div>
                <h3 className="mode-title">AI Copilot Mode</h3>
                <p className="mode-desc">
                  Runs silently in the background during your technical calls. Transcribes incoming questions and projects concise, structured answer cues directly on your stealth HUD overlay.
                </p>
              </div>

              <ul className="mode-feature-list">
                <li>
                  <div className="check-icon-circle"><Check size={14} /></div>
                  <span>Teleprompter-scale readable typography designed for quick glances</span>
                </li>
                <li>
                  <div className="check-icon-circle"><Check size={14} /></div>
                  <span>Automatic Voice-Activated triggers with WebM chunk streaming</span>
                </li>
                <li>
                  <div className="check-icon-circle"><Check size={14} /></div>
                  <span>Manual prompt question overrides & customizable agent personas</span>
                </li>
              </ul>

              <div className="mode-preview-frame">
                <img
                  src="/copilot_mode_preview.jpg"
                  alt="AI Copilot Mode HUD Interface Preview"
                  className="mode-screenshot"
                  loading="lazy"
                />
                <div className="preview-glass-reflection" />
              </div>
            </div>
          </div>

          {/* 2. Coach Mode Card */}
          <div className="dual-mode-card coach-card">
            <div className="card-ambient-glow violet" />
            <div className="dual-card-inner">
              <div className="dual-card-header">
                <div className="mode-badge-analysis">
                  <TrendingUp size={13} />
                  <span>POST-SESSION COACH</span>
                </div>
                <h3 className="mode-title">AI Coach Mode</h3>
                <p className="mode-desc">
                  Evaluates your mock interviews and real calls afterwards. Delivers in-depth structural feedback on answer organization, technical accuracy, pace, and topic mastery.
                </p>
              </div>

              <ul className="mode-feature-list">
                <li>
                  <div className="check-icon-circle"><Check size={14} /></div>
                  <span>Comprehensive structural feedback & STAR method rating breakdown</span>
                </li>
                <li>
                  <div className="check-icon-circle"><Check size={14} /></div>
                  <span>Interactive Post-Session AI Review Chat to drill deeper on weak points</span>
                </li>
                <li>
                  <div className="check-icon-circle"><Check size={14} /></div>
                  <span>Full timestamped session transcripts & chronological response maps</span>
                </li>
              </ul>

              <div className="mode-preview-frame">
                <img
                  src="/coach_mode_preview.jpg"
                  alt="AI Coach Mode Report Preview"
                  className="mode-screenshot"
                  loading="lazy"
                />
                <div className="preview-glass-reflection" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
