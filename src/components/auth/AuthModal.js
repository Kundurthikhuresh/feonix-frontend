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
  Bot,
  KeyRound,
  Zap,
  X,
  CheckCircle2
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

  // 3D Parallax Tilt State
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
    const rotateY = ((x - xc) / xc) * 10; // max 10 deg
    const rotateX = -((y - yc) / yc) * 10;
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

  const handleQuickDemoFill = () => {
    setAuthEmail('demo@feonix.ai');
    setAuthPassword('DemoUser2026!');
    setAuthMsg({ text: 'Demo credentials populated. Click Sign In to continue!', type: 'ok' });
  };

  return (
    <div id="authView" className="auth-3d-overlay" onClick={() => setShowAuthModal(false)}>
      {/* Background Ambient Glowing Light Orbs */}
      <div className="auth-ambient-orb orb-cyan" />
      <div className="auth-ambient-orb orb-violet" />
      <div className="auth-mesh-grid-backdrop" />

      {/* 360-Degree Neon Flowing Border & Halo Wrapper */}
      <div
        ref={cardRef}
        className="auth-card-outer-glow-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1, 1, 1)`,
          transition: tiltX === 0 ? 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        }}
      >
        {/* Main 3D Glassmorphic Card */}
        <div className="auth-card auth-card-3d">
          {/* Full-Card Animated Fluid Aurora Glow */}
          <div className="auth-inner-aurora-glow" />

          {/* Dynamic Holographic Glare Layer */}
          <div
            className="auth-glare-effect"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 245, 255, 0.2), transparent 65%)`,
            }}
          />

        {/* Animated Cybernetic Conic Border */}
        <div className="auth-3d-glow-border" />

        {/* Floating Close Button */}
        <button
          type="button"
          className="auth-close-btn"
          onClick={() => setShowAuthModal(false)}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Header with 3D Avatar & Live Status */}
        <div className="auth-card-top-header">
          <div className="auth-avatar-mini-halo">
            <Image
              src="/ai_robot_avatar_speaking.jpg"
              alt="Feonix AI 3.0"
              width={42}
              height={42}
              className="auth-avatar-mini-img"
              priority
              unoptimized={true}
              onError={(e) => { e.currentTarget.src = '/images/ai_robot_avatar_speaking.jpg'; }}
            />
            <span className="auth-mini-live-dot" />
          </div>
          <div className="auth-header-meta">
            <span className="auth-brand-chip">
              <Sparkles size={11} className="text-cyan" />
              <span>FEONIX AI 3.0 NEURAL GATE</span>
            </span>
            <span className="auth-header-caption">Secure Technical Interview Copilot</span>
          </div>
        </div>

        {/* Interactive Tab Switcher Pill */}
        {authMode !== 'forgot' && (
          <div className="auth-tab-pill-bar">
            <button
              type="button"
              className={`auth-tab-pill ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setAuthMsg({ text: '', type: '' });
              }}
            >
              <KeyRound size={13} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab-pill ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
              }}
            >
              <Sparkles size={13} />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="auth-headline-block">
          <h1 className="auth-title">
            {authMode === 'register' ? 'Create Account' : authMode === 'forgot' ? 'Reset Password' : 'Sign in to Feonix'}
          </h1>
          <p className="auth-sub-lede">
            {authMode === 'register'
              ? 'Unlock real-time 3D voice copilot & live teleprompter HUD.'
              : authMode === 'forgot'
              ? "Enter your account email to receive an instant recovery link."
              : 'Enter your credentials to access your live interview sessions.'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="auth-form-animated">
          {/* Email Field */}
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-input-label">
              <span>EMAIL ADDRESS</span>
            </label>
            <div className="auth-input-field-wrap">
              <Mail size={16} className="auth-field-leading-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                autoComplete="username"
                className="auth-input-modern"
              />
            </div>
          </div>

          {/* Password Field */}
          {authMode !== 'forgot' && (
            <div className="auth-input-group">
              <div className="auth-label-split">
                <label htmlFor="password" className="auth-input-label">
                  <span>PASSWORD</span>
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
              <div className="auth-input-field-wrap">
                <Lock size={16} className="auth-field-leading-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  className="auth-input-modern"
                />
                <button
                  type="button"
                  className="auth-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {authMode === 'register' && (
                <div className="auth-input-helper">
                  <CheckCircle2 size={12} className="text-cyan" />
                  <span>Must be at least 8 characters with numbers & symbols</span>
                </div>
              )}
            </div>
          )}

          {/* Signup Code (Optional for registration) */}
          {authMode === 'register' && (
            <div className="auth-input-group">
              <label htmlFor="signupCode" className="auth-input-label">
                <span>INVITE CODE (OPTIONAL)</span>
              </label>
              <div className="auth-input-field-wrap">
                <Zap size={16} className="auth-field-leading-icon" />
                <input
                  id="signupCode"
                  type="text"
                  placeholder="e.g. VIP-2026"
                  value={authSignupCode}
                  onChange={(e) => setAuthSignupCode(e.target.value)}
                  className="auth-input-modern"
                />
              </div>
            </div>
          )}

          {/* Quick 1-Click Demo Fill Pill */}
          {authMode === 'login' && (
            <div className="auth-quick-demo-wrapper">
              <button
                type="button"
                className="auth-quick-demo-btn"
                onClick={handleQuickDemoFill}
                title="Fill demo credentials instantly"
              >
                <Zap size={13} className="demo-zap-icon" />
                <span>Quick Demo Fill (1-Click)</span>
              </button>
            </div>
          )}

          {/* Primary Action Button with Glow Sweep */}
          <button
            className="auth-btn-primary-glow"
            type="submit"
            disabled={authLoading}
          >
            <div className="btn-sweep-shine" />
            {authLoading ? (
              <span className="auth-btn-loader">
                <span className="btn-spinner" />
                <span>Authenticating…</span>
              </span>
            ) : (
              <span className="auth-btn-label">
                <span>
                  {authMode === 'register'
                    ? 'Create Account & Launch'
                    : authMode === 'forgot'
                    ? 'Send Reset Link'
                    : 'Sign in to Feonix'}
                </span>
                <ArrowRight size={16} className="auth-arrow-icon" />
              </span>
            )}
          </button>

          {/* Feedback Message */}
          {authMsg.text && (
            <div className={`auth-alert-message ${authMsg.type === 'err' ? 'is-err' : 'is-ok'}`}>
              <span className="alert-dot" />
              <span>{authMsg.text}</span>
            </div>
          )}
        </form>

        {/* Switch Mode Footer */}
        <div className="auth-card-footer">
          {authMode === 'forgot' ? (
            <button
              className="auth-bottom-switch-link"
              onClick={() => {
                setAuthMode('login');
                setAuthMsg({ text: '', type: '' });
              }}
              type="button"
            >
              ← Back to Sign In
            </button>
          ) : (
            <div className="auth-footer-prompt">
              <span>{authMode === 'register' ? 'Already have an account?' : 'New to Feonix AI?'}</span>
              <button
                className="auth-bottom-switch-link highlight"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthMsg({ text: '', type: '' });
                }}
                type="button"
              >
                {authMode === 'register' ? 'Sign In' : 'Create an account'}
              </button>
            </div>
          )}

          {/* Privacy & Trust Badge */}
          <div className="auth-trust-badge">
            <ShieldCheck size={13} className="text-emerald" />
            <span>256-bit encrypted · Sandbox privacy isolated</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
