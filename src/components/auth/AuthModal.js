"use client";

import React, { useState, useRef } from 'react';

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

  // 3D Tilt State
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
    const rotateY = ((x - xc) / xc) * 12; // max 12deg
    const rotateX = -((y - yc) / yc) * 12;
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

  return (
    <div id="authView" className="auth-3d-overlay" onClick={() => setShowAuthModal(false)}>
      {/* Dynamic Background Ambient Light Orbs */}
      <div className="auth-ambient-orb orb-cyan" />
      <div className="auth-ambient-orb orb-violet" />

      {/* 3D Tilt Container */}
      <div
        ref={cardRef}
        className="auth-card auth-card-3d"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1, 1, 1)`,
          transition: tiltX === 0 ? 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        }}
      >
        {/* Dynamic Holographic Glare Layer */}
        <div
          className="auth-glare-effect"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 245, 255, 0.15), transparent 70%)`,
          }}
        />

        {/* Floating Neon Border Glow */}
        <div className="auth-3d-glow-border" />

        {/* Close Button */}
        <button
          type="button"
          className="auth-close-btn"
          onClick={() => setShowAuthModal(false)}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Top 3D AI Icon Badge */}
        <div className="auth-brand-badge">
          <span className="badge-pulse-dot" />
          <span className="wordmark">FEONIX AI 3.0</span>
        </div>

        {/* Title */}
        <h1 className="auth-title">
          {authMode === 'register' ? 'Create Account' : authMode === 'forgot' ? 'Reset password' : 'Sign in'}
        </h1>
        <p className="lede">
          {authMode === 'register'
            ? 'Access all 3D AI features & career tools.'
            : authMode === 'forgot'
              ? "Enter your email and we'll send you a reset link."
              : 'Your answers, your quota, your key.'}
        </p>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit}>
          <div className="field">
            <label htmlFor="email">EMAIL</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
              autoComplete="username"
              className="auth-input-3d"
            />
          </div>

          {authMode !== 'forgot' && (
          <div className="field">
            <label htmlFor="password">PASSWORD</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                className="auth-input-3d"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {authMode === 'register' && <div className="note">At least 10 characters.</div>}
            {authMode === 'login' && (
              <div className="forgot-password-row">
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setAuthMode('forgot');
                    setAuthMsg({ text: '', type: '' });
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
          )}

          {authMode === 'register' && (
            <div className="field">
              <label htmlFor="signupCode">SIGNUP CODE</label>
              <input
                id="signupCode"
                type="text"
                placeholder="Optional invite code"
                value={authSignupCode}
                onChange={(e) => setAuthSignupCode(e.target.value)}
                className="auth-input-3d"
              />
              <div className="note">Leave blank for open registration.</div>
            </div>
          )}

          <button className="btn btn-wide btn-3d-primary" type="submit" disabled={authLoading}>
            {authLoading ? (
              <span className="btn-loading-spin">
                {authMode === 'forgot' ? 'Sending…' : 'Authenticating…'}
              </span>
            ) : (
              <span>
                {authMode === 'register' ? 'Create Account' : authMode === 'forgot' ? 'Send Reset Link' : 'Sign in'}
              </span>
            )}
          </button>

          {authMsg.text && (
            <div className={`msg ${authMsg.type === 'err' ? 'msg-err' : 'msg-ok'}`}>
              {authMsg.text}
            </div>
          )}
        </form>

        {/* Switch Mode Footer */}
        <div className="auth-switch">
          {authMode === 'forgot' ? (
            <button
              className="btn-link auth-switch-link"
              onClick={() => {
                setAuthMode('login');
                setAuthMsg({ text: '', type: '' });
              }}
              type="button"
            >
              Back to sign in
            </button>
          ) : (
            <>
              <span>{authMode === 'register' ? 'Already have an account?' : 'No account yet?'} </span>
              <button
                className="btn-link auth-switch-link"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthMsg({ text: '', type: '' });
                }}
                type="button"
              >
                {authMode === 'register' ? 'Sign in' : 'Create one'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
