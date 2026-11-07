"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import PremiumNavbar from './PremiumNavbar';
import PremiumHeroSection from './PremiumHeroSection';
import Stats3DSection from './Stats3DSection';
import InteractiveNeuralPipelineStudio from './InteractiveNeuralPipelineStudio';
import DualModeSection from './DualModeSection';
import InteractiveLiveCodeProblemSolver from './InteractiveLiveCodeProblemSolver';
import InteractiveProductShowcase from './InteractiveProductShowcase';
import StealthInvisibilityDualViewMatrix from './StealthInvisibilityDualViewMatrix';
import VideoShowcase3DSection from './VideoShowcase3DSection';

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
import './ProductionLandingSections.css';

// "Live FeonixAI Project Demonstration" section: hidden, not removed.
const SHOW_VIDEO_SHOWCASE = false;
// "100% Private, Zero Retention, Indestructible Security" section: hidden, not removed.
const SHOW_SECURITY_VAULT = false;

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

      {/* A. Sticky Navigation Bar */}
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

        {/* D. Production Section 1: Interactive Neural Pipeline Studio */}
        <InteractiveNeuralPipelineStudio
          onGetStarted={onSignupClick}
        />

        {/* E. Dual-Mode 3D Live Video Demonstration Stage */}
        <DualModeSection />

        {/* F. Production Section 2: Real-Time Algorithm & Architecture Problem Solver */}
        <InteractiveLiveCodeProblemSolver
          onGetStarted={onSignupClick}
        />

        {/* G. Interactive Product Showcase (3D Perspective Interface with 6 Real Capabilities) */}
        <InteractiveProductShowcase
          onGetStarted={onSignupClick}
        />

        {/* H. Production Section 3: Stealth Invisibility Dual-View Comparison Matrix */}
        <StealthInvisibilityDualViewMatrix />

        {/* I. Live 4K Video Demonstration Stage with 3 Selectable Scenarios.
            Hidden for now (code kept): set SHOW_VIDEO_SHOWCASE to true to show it again. */}
        {SHOW_VIDEO_SHOWCASE && (
          <VideoShowcase3DSection
            onWatchDemo={onWatchDemo || onSignupClick}
          />
        )}

        {/* J. How It Works (4-Step Workflow) */}
        <HowItWorksSection />

        {/* K. Feature Showcase Grid (9 Capabilities with Authentic Images + 3D Speech Wave Engine) */}
        <FeatureShowcaseGrid />

        {/* L. Interactive 3D Ecosystem & Platform Integrations Matrix */}
        <Integrations3DSection />

        {/* M. Enterprise Security Quantum Vault 3D Section.
            Hidden for now (code kept): set SHOW_SECURITY_VAULT to true to show it again. */}
        {SHOW_SECURITY_VAULT && <Security3DSection />}

        {/* N. Desktop Platform Experience & Screen-Share Stealth */}
        <DesktopExperienceSection />

        {/* O. Pricing Section (Preserving existing ParakeetPricingView & Verified Business Rules) */}
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

        {/* P. Candidate Testimonials with 3D Tilt Cards */}
        <Testimonials3DSection themeMode={themeMode} />

        {/* Q. Frequently Asked Questions */}
        <FAQAccordion />

        {/* R. Final Conversion CTA Banner */}
        <FinalCTASection
          onSignupClick={onSignupClick}
        />
      </main>

      {/* Complete SaaS Footer */}
      <PremiumFooter />
    </div>
  );
}
