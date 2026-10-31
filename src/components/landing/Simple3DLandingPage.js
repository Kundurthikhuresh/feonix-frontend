"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import PremiumNavbar from './PremiumNavbar';
import PremiumHeroSection from './PremiumHeroSection';
import Stats3DSection from './Stats3DSection';
import DualModeSection from './DualModeSection';
import VideoShowcase3DSection from './VideoShowcase3DSection';
import InteractiveProductShowcase from './InteractiveProductShowcase';
import HowItWorksSection from './HowItWorksSection';
import FeatureShowcaseGrid from './FeatureShowcaseGrid';
import Integrations3DSection from './Integrations3DSection';
import Security3DSection from './Security3DSection';
import DesktopExperienceSection from './DesktopExperienceSection';
import Testimonials3DSection from './Testimonials3DSection';
import FAQAccordion from './FAQAccordion';
import FinalCTASection from './FinalCTASection';
import PremiumFooter from './PremiumFooter';
import ParakeetPricingView from '../pricing/ParakeetPricingView';
import './PremiumLanding.css';

// Dynamic import of 3D WebGL Particle Background to avoid SSR issues
const ParticleBackground = dynamic(() => import('../3d/ParticleBackground'), {
  ssr: false,
});

export default function Simple3DLandingPage({
  user,
  themeMode,
  toggleTheme,
  onLoginClick,
  onSignupClick,
  onGetStarted,
  onSelectPlan,
  onWatchDemo,
}) {
  return (
    <div className="px-landing-root" data-theme={themeMode} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* 1. 3D WebGL Interactive Particle Constellation Background */}
      <ParticleBackground />

      {/* Ambient Radial Gradients & Subtle Grid Overlay */}
      <div className="px-bg-ambient" aria-hidden="true" />
      <div className="px-bg-grid" aria-hidden="true" />

      {/* Top Announcement Bar */}
      <div className="px-top-announcement">
        <span>🎉 Special Launch: <strong>5 Free Trial Sessions</strong> Included (10 min each) • 100% Screen-Share Invisible Teleprompter</span>
        <a href="#pricing">Explore Plans &rarr;</a>
      </div>

      {/* A. Sticky Navigation Bar (Displays ONLY the Login Button) */}
      <PremiumNavbar
        user={user}
        themeMode={themeMode}
        toggleTheme={toggleTheme}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onDashboardClick={onGetStarted}
      />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* B. Hero Section with 3D AI Assistant Core & Unified Teleprompter Preview */}
        <PremiumHeroSection
          onSignupClick={onSignupClick}
          onWatchDemo={onWatchDemo || onSignupClick}
        />

        {/* C. 3D Key Performance & Live Session Statistics */}
        <Stats3DSection />

        {/* D. Dual-Mode 3D Live Video Demonstration Stage */}
        <DualModeSection />

        {/* E. Interactive Product Showcase (3D Perspective Interface with 6 Real Capabilities) */}
        <InteractiveProductShowcase
          onGetStarted={onSignupClick}
        />

        {/* F. Live 4K Video Demonstration Stage with 3 Selectable Scenarios */}
        <VideoShowcase3DSection
          onWatchDemo={onWatchDemo || onSignupClick}
        />

        {/* G. How It Works (4-Step Workflow) */}
        <HowItWorksSection />

        {/* H. Feature Showcase Grid (9 Capabilities with Authentic Images + 3D Speech Wave Engine) */}
        <FeatureShowcaseGrid />

        {/* I. Interactive 3D Ecosystem & Platform Integrations Matrix */}
        <Integrations3DSection />

        {/* J. Enterprise Security Quantum Vault 3D Section */}
        <Security3DSection />

        {/* K. Desktop Platform Experience & Screen-Share Stealth */}
        <DesktopExperienceSection />

        {/* L. Pricing Section (Preserving existing ParakeetPricingView & Verified Business Rules) */}
        <section id="pricing" style={{ padding: '76px 0 44px 0' }}>
          <div className="px-container">
            <div className="px-section-header">
              <div className="px-section-tag">
                <span>Transparent Pricing</span>
              </div>
              <h2 className="px-section-title">
                Pay As You Go or Go Unlimited
              </h2>
              <p className="px-section-desc">
                Every newly created account includes <strong>5 free trial sessions (10 minutes each)</strong> with zero card required. Purchase one-time credit packs (1 credit = 1 hour access) or subscribe to unlimited weekly and monthly passes.
              </p>
            </div>

            <ParakeetPricingView
              onSelectPlan={onSelectPlan}
              onSignupClick={onSignupClick}
              user={user}
            />
          </div>
        </section>

        {/* M. Candidate Testimonials with 3D Tilt Cards */}
        <Testimonials3DSection />

        {/* N. Frequently Asked Questions */}
        <FAQAccordion />

        {/* O. Final Conversion CTA Banner */}
        <FinalCTASection
          onSignupClick={onSignupClick}
        />
      </main>

      {/* Complete SaaS Footer */}
      <PremiumFooter />
    </div>
  );
}
