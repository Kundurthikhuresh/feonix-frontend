"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  Shield,
  TrendingUp,
  KeyRound,
  User,
  ArrowUpRight,
  Check
} from 'lucide-react';

export default function AuthModal({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authSignupCode,
  setAuthSignupCode,
  authLoading,
  authMsg,
  setAuthMsg,
  handleAuthSubmit,
  setShowAuthModal,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [useOtp, setUseOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // 3D Parallax Tilt State for Center Card
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 8;
    const rotateX = -((y - yc) / yc) * 8;
    setTiltX(rotateX);
    setTiltY(rotateY);

    const px = Math.round((x / rect.width) * 100);
    const py = Math.round((y / rect.height) * 100);
    setGlarePos({ x: px, y: py });
  };

  const handleMouseLeave = () => {
    setTiltX(0);
    setTiltY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  const handleSocialClick = (provider) => {
    setAuthMsg({
      text: `${provider} authentication initialized. Connecting securely…`,
      type: 'ok',
    });
    // In production, triggers OAuth flow
  };

  return (
    <div id="authView" className="auth-page-fullview">
      {/* Dynamic Cosmic Space Background Layers */}
      <div className="auth-bg-ambient-stars" />
      <div className="auth-bg-glow auth-glow-cyan" />
      <div className="auth-bg-glow auth-glow-violet" />
      <div className="auth-grid-overlay" />

      {/* Top Navbar Header */}
      <header className="auth-top-header">
        <div className="auth-brand-lockup">
          <div className="brand-logo-icon">
            <span className="brand-letter">F</span>
            <div className="brand-logo-glow" />
          </div>
          <div className="brand-text-wrapper">
            <span className="brand-title">FEONIX<span className="brand-ai">AI</span></span>
            <span className="brand-badge-v3">3D v3.0</span>
          </div>
        </div>

        <button
          type="button"
          className="auth-back-home-btn"
          onClick={() => setShowAuthModal(false)}
        >
          <ArrowUpRight size={16} className="back-arrow-icon" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main 3-Part Panoramic Content Container */}
      <main className="auth-panoramic-container">
        {/* ============================================================
            1. LEFT COLUMN: Marketing & Value Proposition Section
            ============================================================ */}
        <section className="auth-left-marketing-col" aria-label="Product Benefits">
          {/* Eyebrow Label */}
          <div className="auth-eyebrow-row">
            <span className="auth-eyebrow-text">AI INTERVIEW ASSISTANT</span>
            <span className="auth-eyebrow-line" />
          </div>

          {/* Headline */}
          <h1 className="auth-marketing-headline">
            Your Next <br />
            Opportunity <br />
            <span className="auth-headline-gradient">Starts Here</span>
          </h1>

          {/* Subtitle */}
          <p className="auth-marketing-lead">
            Sign in to access your personalized interview practice, real-time feedback, and AI-powered career tools.
          </p>

          {/* Feature Highlights */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-box box-violet">
                <Zap size={18} className="text-violet" />
              </div>
              <div className="auth-feature-text">
                <h3 className="auth-feature-title">AI-Powered Interviews</h3>
                <p className="auth-feature-desc">Practice with real-time feedback</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box box-cyan">
                <Shield size={18} className="text-cyan" />
              </div>
              <div className="auth-feature-text">
                <h3 className="auth-feature-title">Secure &amp; Private</h3>
                <p className="auth-feature-desc">Your data stays protected</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box box-blue">
                <TrendingUp size={18} className="text-sky" />
              </div>
              <div className="auth-feature-text">
                <h3 className="auth-feature-title">Better Opportunities</h3>
                <p className="auth-feature-desc">Get hired faster</p>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="auth-quote-tagline">
            “Preparation today, success tomorrow.”
          </div>
        </section>

        {/* ============================================================
            2. CENTER COLUMN: Glassmorphic Sign-In / Register Card
            ============================================================ */}
        <section className="auth-center-card-col">
          <div
            ref={cardRef}
            className="auth-signin-card-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              transition: tiltX === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          >
            {/* Multi-layer Neon Gradient Border Halo */}
            <div className="auth-neon-border-halo" />
            <div className="auth-card-neon-glow" />

            {/* Inner Glass Card */}
            <div className="auth-glass-card-body">
              {/* Dynamic Mouse Glare */}
              <div
                className="auth-glare-layer"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 245, 255, 0.16), transparent 60%)`,
                }}
              />

              {/* Card Header */}
              <div className="auth-card-header">
                <div>
                  <h2 className="auth-card-title">
                    {authMode === 'register' ? 'Create Account' : authMode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
                  </h2>
                  <p className="auth-card-subtitle">
                    {authMode === 'register'
                      ? 'Get started with Feonix AI today'
                      : authMode === 'forgot'
                      ? 'Enter your email to receive recovery instructions'
                      : 'Sign in to your Feonix AI account'}
                  </p>
                </div>

                {/* 3D Neural Core Icon/Badge in Top Right */}
                <div className="auth-neural-badge" title="Feonix 3.0 Neural Core">
                  <div className="neural-swirl-ring" />
                  <Sparkles size={13} className="text-cyan neural-icon" />
                  <span className="neural-version">v3.0</span>
                </div>
              </div>

              {/* Segmented Tab Switcher (Sign In vs Create Account) */}
              {authMode !== 'forgot' && (
                <div className="auth-segmented-tabs">
                  <button
                    type="button"
                    className={`auth-segment-tab ${authMode === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthMode('login');
                      setUseOtp(false);
                      setAuthMsg({ text: '', type: '' });
                    }}
                  >
                    <User size={14} />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    className={`auth-segment-tab ${authMode === 'register' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthMode('register');
                      setUseOtp(false);
                      setAuthMsg({ text: '', type: '' });
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Create Account</span>
                  </button>
                </div>
              )}

              {/* Form Component */}
              <form onSubmit={handleAuthSubmit} className="auth-inputs-form">
                {/* Email Address Field */}
                <div className="auth-field-group">
                  <label htmlFor="auth-email-input" className="auth-field-label">
                    Email Address
                  </label>
                  <div className="auth-input-container">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="auth-email-input"
                      type="email"
                      placeholder="name@company.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      autoComplete="username"
                      className="auth-text-input"
                    />
                  </div>
                </div>

                {/* OTP Mode Code Input */}
                {useOtp && authMode === 'login' ? (
                  <div className="auth-field-group">
                    <div className="auth-field-label-row">
                      <label htmlFor="auth-otp-input" className="auth-field-label">
                        One-Time Passcode (OTP)
                      </label>
                    </div>
                    <div className="auth-input-container">
                      <KeyRound size={16} className="auth-input-icon" />
                      <input
                        id="auth-otp-input"
                        type="text"
                        placeholder="Enter 6-digit OTP code"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value);
                          setAuthPassword(e.target.value);
                        }}
                        required
                        className="auth-text-input"
                      />
                    </div>
                  </div>
                ) : (
                  /* Standard Password Field */
                  authMode !== 'forgot' && (
                    <div className="auth-field-group">
                      <div className="auth-field-label-row">
                        <label htmlFor="auth-password-input" className="auth-field-label">
                          Password
                        </label>
                        {authMode === 'login' && (
                          <button
                            type="button"
                            className="auth-forgot-link"
                            onClick={() => {
                              setAuthMode('forgot');
                              setAuthMsg({ text: '', type: '' });
                            }}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="auth-input-container">
                        <Lock size={16} className="auth-input-icon" />
                        <input
                          id="auth-password-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          required
                          autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                          className="auth-text-input"
                        />
                        <button
                          type="button"
                          className="auth-eye-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Optional Invite Code for Registration */}
                {authMode === 'register' && (
                  <div className="auth-field-group">
                    <label htmlFor="auth-invite-code" className="auth-field-label">
                      Invite Code (Optional)
                    </label>
                    <div className="auth-input-container">
                      <Zap size={16} className="auth-input-icon" />
                      <input
                        id="auth-invite-code"
                        type="text"
                        placeholder="e.g. FEONIX-VIP"
                        value={authSignupCode}
                        onChange={(e) => setAuthSignupCode(e.target.value)}
                        className="auth-text-input"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Form Options (Remember Me & OTP Link) */}
                {authMode === 'login' && (
                  <div className="auth-options-row">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="auth-real-checkbox"
                      />
                      <span className="auth-custom-checkbox">
                        {rememberMe && <Check size={12} className="check-icon" />}
                      </span>
                      <span className="checkbox-text">Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="auth-otp-toggle-btn"
                      onClick={() => {
                        setUseOtp(!useOtp);
                        setAuthMsg({ text: '', type: '' });
                      }}
                    >
                      {useOtp ? 'Use password instead' : 'Use OTP instead'}
                    </button>
                  </div>
                )}

                {/* Primary CTA Submit Button */}
                <button
                  type="submit"
                  className="auth-main-submit-btn"
                  disabled={authLoading}
                >
                  <div className="submit-btn-glow-shimmer" />
                  {authLoading ? (
                    <span className="submit-loading-state">
                      <span className="submit-spinner" />
                      <span>Authenticating…</span>
                    </span>
                  ) : (
                    <span className="submit-label-state">
                      <span>
                        {authMode === 'register'
                          ? 'Create Account →'
                          : authMode === 'forgot'
                          ? 'Send Reset Link →'
                          : 'Sign in to Feonix →'}
                      </span>
                    </span>
                  )}
                </button>

                {/* Feedback Message Alert */}
                {authMsg.text && (
                  <div className={`auth-feedback-alert ${authMsg.type === 'err' ? 'alert-error' : 'alert-success'}`}>
                    <span className="alert-dot" />
                    <span>{authMsg.text}</span>
                  </div>
                )}
              </form>

              {/* Social Login Options */}
              {authMode !== 'forgot' && (
                <div className="auth-social-block">
                  <div className="auth-divider-row">
                    <span className="divider-line" />
                    <span className="divider-text">Or continue with</span>
                    <span className="divider-line" />
                  </div>

                  <div className="auth-social-btn-grid">
                    {/* Google Button */}
                    <button
                      type="button"
                      className="auth-social-btn"
                      onClick={() => handleSocialClick('Google')}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    {/* Apple Button */}
                    <button
                      type="button"
                      className="auth-social-btn"
                      onClick={() => handleSocialClick('Apple')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3-.95.04-2.09.63-2.77 1.42-.59.68-1.12 1.8-0.98 2.88 1.05.08 2.12-.51 2.77-1.3z" />
                      </svg>
                      <span>Apple</span>
                    </button>

                    {/* Microsoft Button */}
                    <button
                      type="button"
                      className="auth-social-btn"
                      onClick={() => handleSocialClick('Microsoft')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                      </svg>
                      <span>Microsoft</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Switch Link */}
              <div className="auth-footer-switch-prompt">
                {authMode === 'forgot' ? (
                  <button
                    type="button"
                    className="auth-switch-text-btn"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthMsg({ text: '', type: '' });
                    }}
                  >
                    ← Back to Sign In
                  </button>
                ) : (
                  <>
                    <span className="switch-prompt-text">
                      {authMode === 'register' ? 'Already have an account?' : 'New to Feonix AI?'}
                    </span>
                    <button
                      type="button"
                      className="auth-switch-text-btn"
                      onClick={() => {
                        setAuthMode(authMode === 'login' ? 'register' : 'login');
                        setAuthMsg({ text: '', type: '' });
                      }}
                    >
                      {authMode === 'register' ? 'Sign In' : 'Create an account'}
                    </button>
                  </>
                )}
              </div>

              {/* Security Badge */}
              <div className="auth-card-security-badge">
                <ShieldCheck size={13} className="text-cyan" />
                <span>256-bit encrypted · Sandbox privacy isolated</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            3. RIGHT COLUMN: Futuristic AI Robot & Holograms Stage
            ============================================================ */}
        <section className="auth-right-robot-col" aria-label="Feonix AI Robot Assistant">
          <div className="auth-robot-stage-wrap">
            {/* Holographic Float Panel 1 (Top Left) */}
            <div className="auth-holo-card holo-card-left">
              <TrendingUp size={15} className="text-cyan holo-icon" />
              <div className="holo-content">
                <span className="holo-line">PRACTICE</span>
                <span className="holo-line">IMPROVE</span>
                <span className="holo-line highlight-cyan">GET HIRED</span>
              </div>
            </div>

            {/* Holographic Float Panel 2 (Top Right) */}
            <div className="auth-holo-card holo-card-right">
              <Sparkles size={15} className="text-violet holo-icon" />
              <div className="holo-content">
                <span className="holo-line highlight-violet">AI</span>
                <span className="holo-line">YOUR CAREER</span>
                <span className="holo-line">COPILOT</span>
              </div>
            </div>

            {/* Glowing Speech Bubble */}
            <div className="auth-speech-bubble-neon">
              <div className="speech-text-wrap">
                <span className="speech-title">Good interviews</span>
                <span className="speech-body">create</span>
                <span className="speech-highlight">great futures!</span>
              </div>
              <Sparkles size={14} className="speech-sparkle" />
              <div className="speech-bubble-tail" />
            </div>

            {/* AI Robot Main Visual Avatar */}
            <div className="auth-robot-visual-card">
              <Image
                src="/ai_robot_avatar_speaking.jpg"
                alt="Feonix 3D AI Robot Assistant"
                width={500}
                height={500}
                priority
                unoptimized={true}
                className="auth-robot-img"
                onError={(e) => { e.currentTarget.src = '/images/ai_robot_avatar_speaking.jpg'; }}
              />
            </div>

            {/* Futuristic Hologram Pedestal / Laser Light Rings */}
            <div className="auth-pedestal-platform">
              <div className="pedestal-outer-glow-ring" />
              <div className="pedestal-cylinder-base" />
              <div className="pedestal-hologram-beam" />
            </div>

            {/* Bottom-Right Brand Mission Tagline */}
            <div className="auth-bottom-mission-badge">
              <span className="mission-text">LAND · LEARN · GROW</span>
              <span className="mission-neon-line" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
