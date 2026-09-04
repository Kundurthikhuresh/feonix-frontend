"use client";

import { Check, Sparkles, ArrowRight, Zap, Shield, Crown } from 'lucide-react';

export default function Pricing3DSection({ onSelectPlan }) {
  return (
    <section className="pricing-3d-section" id="pricing">
      <div className="pricing-3d-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Zap size={14} className="pill-icon text-cyan" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="section-title">
            Flexible Plans for <span className="gradient-text-cyan">Every Engineer</span>
          </h2>
          <p className="section-subtitle">
            Prepare for your next high-impact career move with flexible, usage-based credits and zero hidden fees.
          </p>
        </div>

        {/* Pricing Cards Grid (All 3 Cards Equal Size) */}
        <div className="pricing-3d-grid">
          {/* 1. Free Trial Card */}
          <div className="pricing-3d-card">
            <div className="pricing-card-inner">
              <div className="pricing-badge-slot">
                <div className="pricing-card-badge-plain">STARTER TIER</div>
              </div>
              <h3 className="plan-name">Free Trial</h3>
              <p className="plan-desc">Perfect for testing Feonix AI before your live technical rounds.</p>

              <div className="price-tag-wrapper">
                <span className="currency">$</span>
                <span className="price-val">0</span>
                <span className="price-period">/ forever</span>
              </div>

              <div className="plan-divider" />

              <ul className="plan-features-list">
                <li>
                  <div className="plan-check-icon"><Check size={14} /></div>
                  <span>10-minute trial session limit</span>
                </li>
                <li>
                  <div className="plan-check-icon"><Check size={14} /></div>
                  <span>Standard AI model (GPT-4o mini)</span>
                </li>
                <li>
                  <div className="plan-check-icon"><Check size={14} /></div>
                  <span>Upload up to 1 Resume / JD context</span>
                </li>
                <li>
                  <div className="plan-check-icon"><Check size={14} /></div>
                  <span>Standard teleprompter web HUD</span>
                </li>
                <li>
                  <div className="plan-check-icon"><Check size={14} /></div>
                  <span>Community Discord & sandbox support</span>
                </li>
              </ul>

              <button
                className="pricing-btn-ghost"
                onClick={() => onSelectPlan('trial')}
                type="button"
              >
                <span>Sign Up Free</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* 2. Pro Plan Card (Featured) */}
          <div className="pricing-3d-card is-featured">
            <div className="featured-ambient-glow" />
            <div className="pricing-card-inner">
              <div className="pricing-badge-slot">
                <div className="pricing-card-badge-featured">
                  <Sparkles size={12} />
                  <span>MOST POPULAR</span>
                </div>
              </div>
              <h3 className="plan-name text-cyan">Pro Copilot</h3>
              <p className="plan-desc">Engineered for active candidates undergoing intensive interview loops.</p>

              <div className="price-tag-wrapper">
                <span className="currency">$</span>
                <span className="price-val gradient-text-cyan">19</span>
                <span className="price-period">/ 100 credits</span>
              </div>

              <div className="plan-divider featured" />

              <ul className="plan-features-list">
                <li>
                  <div className="plan-check-icon text-cyan"><Check size={14} /></div>
                  <span><strong>Unlimited</strong> session durations per credit</span>
                </li>
                <li>
                  <div className="plan-check-icon text-cyan"><Check size={14} /></div>
                  <span><strong>Advanced GPT-4o</strong> supercharged technical models</span>
                </li>
                <li>
                  <div className="plan-check-icon text-cyan"><Check size={14} /></div>
                  <span><strong>Unlimited</strong> Resume, CV & JD document embeddings</span>
                </li>
                <li>
                  <div className="plan-check-icon text-cyan"><Check size={14} /></div>
                  <span><strong>Interactive AI Coach</strong> post-call review chat & scorecard</span>
                </li>
                <li>
                  <div className="plan-check-icon text-cyan"><Check size={14} /></div>
                  <span>Desktop App native stealth HUD overlay access</span>
                </li>
              </ul>

              <button
                className="pricing-btn-featured"
                onClick={() => onSelectPlan('pro')}
                type="button"
              >
                <span>Get Started Now</span>
                <ArrowRight size={16} />
                <div className="btn-glow-shimmer" />
              </button>
            </div>
          </div>

          {/* 3. Elite Copilot Plan Card */}
          <div className="pricing-3d-card is-elite">
            <div className="elite-ambient-glow" />
            <div className="pricing-card-inner">
              <div className="pricing-badge-slot">
                <div className="pricing-card-badge-elite">
                  <Crown size={12} />
                  <span>ELITE TIER</span>
                </div>
              </div>
              <h3 className="plan-name text-violet">Elite Copilot</h3>
              <p className="plan-desc">For senior & staff engineers aiming for top-tier FAANG/tier-1 offers.</p>

              <div className="price-tag-wrapper">
                <span className="currency">$</span>
                <span className="price-val gradient-text-violet">49</span>
                <span className="price-period">/ 300 credits</span>
              </div>

              <div className="plan-divider elite" />

              <ul className="plan-features-list">
                <li>
                  <div className="plan-check-icon text-violet"><Check size={14} /></div>
                  <span><strong>Everything in Pro</strong> + 300 Priority Credits</span>
                </li>
                <li>
                  <div className="plan-check-icon text-violet"><Check size={14} /></div>
                  <span><strong>Ultra Low-Latency</strong> fine-tuned GPT-4o pipeline</span>
                </li>
                <li>
                  <div className="plan-check-icon text-violet"><Check size={14} /></div>
                  <span><strong>System Design & Coding</strong> live architecture cues</span>
                </li>
                <li>
                  <div className="plan-check-icon text-violet"><Check size={14} /></div>
                  <span><strong>1-on-1 AI Mock Interviews</strong> with voice coaching</span>
                </li>
                <li>
                  <div className="plan-check-icon text-violet"><Check size={14} /></div>
                  <span>Multi-monitor stealth HUD + 24/7 VIP SLA</span>
                </li>
              </ul>

              <button
                className="pricing-btn-elite"
                onClick={() => onSelectPlan('enterprise')}
                type="button"
              >
                <span>Get Elite Access</span>
                <ArrowRight size={16} />
                <div className="btn-glow-shimmer" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
