"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sun, Moon, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

// The sun/moon theme button in the navbar.
const SHOW_THEME_TOGGLE = false;

export default function PremiumNavbar({
  user,
  themeMode,
  toggleTheme,
  onLoginClick,
  onSignupClick,
  onDashboardClick,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Clicking a link takes the page to that section and hides the navbar;
  // scrolling up brings it back.
  const [hidden, setHidden] = useState(false);
  const jumpingRef = useRef(false);
  const settleTimerRef = useRef(null);

  // The page's own move to the clicked section also fires scroll events;
  // those are ignored until it has settled (no scroll for 250 ms).
  const settleJump = () => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      jumpingRef.current = false;
      settleTimerRef.current = null;
    }, 250);
  };

  const hideForJump = () => {
    setMobileOpen(false);
    setHidden(true);
    jumpingRef.current = true;
    settleJump();
  };

  const lastYRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    // Scrolling up shows the navbar; scrolling down hides it, so it never
    // sits over the content being read. Near the very top it always shows.
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const delta = y - lastYRef.current;
      lastYRef.current = y;
      if (jumpingRef.current) { settleJump(); return; }
      if (y < 80) setHidden(false);
      else if (delta < -2) setHidden(false);
      else if (delta > 2) { setHidden(true); setMobileOpen(false); }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className={`px-navbar ${scrolled ? 'is-scrolled' : ''} ${hidden ? 'is-hidden' : ''}`}>
        <div className="px-navbar-container">
          {/* Brand */}
          <a href="#hero" className="px-brand" aria-label="Feonix AI Home">
            <div className="px-brand-icon">F</div>
            <div className="px-brand-name">
              FEONIX<span>AI</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="px-nav-links" aria-label="Main Navigation">
            <a href="#product" onClick={hideForJump} className="px-nav-link">Product</a>
            <a href="#how-it-works" onClick={hideForJump} className="px-nav-link">How It Works</a>
            <a href="#features" onClick={hideForJump} className="px-nav-link">Features</a>
            <a href="#pricing" onClick={hideForJump} className="px-nav-link">Pricing</a>
            <a href="#security" onClick={hideForJump} className="px-nav-link">Security</a>
            <a href="#faq" onClick={hideForJump} className="px-nav-link">FAQ</a>
          </nav>

          {/* Right Action Group */}
          <div className="px-nav-actions">
            {/* Theme toggle (sun/moon icon): hidden, code kept — set SHOW_THEME_TOGGLE to true to show it again. */}
            {SHOW_THEME_TOGGLE && (
              <button
                onClick={toggleTheme}
                className="px-btn px-btn-ghost"
                style={{ padding: '8px', borderRadius: '8px' }}
                title={themeMode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                aria-label="Toggle color theme"
              >
                {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            )}

            {/* Always display Login only */}
            <button
              onClick={() => onLoginClick && onLoginClick('user')}
              className="px-btn px-btn-primary"
              style={{
                fontSize: '14px',
                padding: '8px 20px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Login
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="px-mobile-menu-btn"
              aria-label="Open mobile navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          background: 'rgba(7, 9, 14, 0.98)',
          borderBottom: '1px solid var(--px-border)',
          padding: '24px',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backdropFilter: 'blur(16px)'
        }}>
          <a href="#product" onClick={hideForJump} className="px-nav-link" style={{ fontSize: '15px' }}>Product</a>
          <a href="#how-it-works" onClick={hideForJump} className="px-nav-link" style={{ fontSize: '15px' }}>How It Works</a>
          <a href="#features" onClick={hideForJump} className="px-nav-link" style={{ fontSize: '15px' }}>Features</a>
          <a href="#pricing" onClick={hideForJump} className="px-nav-link" style={{ fontSize: '15px' }}>Pricing</a>
          <a href="#security" onClick={hideForJump} className="px-nav-link" style={{ fontSize: '15px' }}>Security</a>
          <a href="#faq" onClick={hideForJump} className="px-nav-link" style={{ fontSize: '15px' }}>FAQ</a>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--px-border)' }}>
            <button
              onClick={() => {
                setMobileOpen(false);
                onLoginClick && onLoginClick('user');
              }}
              className="px-btn px-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </>
  );
}

