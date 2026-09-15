"use client";

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar3D({
  user,
  themeMode,
  toggleTheme,
  onLoginClick,
  onSignupClick,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      // Hide on the way down, reveal on the way up — but never hide before
      // the page has actually scrolled past the header's own height, or a
      // small bounce/overscroll right at the top would flicker it away.
      const scrolledDown = y > lastScrollY.current;
      if (scrolledDown && y > 120) {
        setHidden(true);
        setMobileMenuOpen(false);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar-3d-header ${scrolled ? 'is-scrolled' : ''} ${hidden ? 'is-hidden' : ''}`}>
      <div className="navbar-3d-container">
        {/* Brand Logo */}
        <a href="#hero" className="navbar-brand">
          <div className="brand-logo-icon">
            <span className="brand-letter">F</span>
            <div className="brand-logo-glow" />
          </div>
          <div className="brand-text-wrapper">
            <span className="brand-title">FEONIX<span className="brand-ai">AI</span></span>
            <span className="brand-badge-v3">3D v3.0</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="navbar-desktop-nav" aria-label="Main Navigation">
          <a href="#hero" className="nav-item-link">Home</a>
          <a href="#copilot" className="nav-item-link">Simulator</a>
          <a href="#features" className="nav-item-link">Features</a>
          <a href="#showcase" className="nav-item-link">3D Neural Core</a>
          <a href="#duo" className="nav-item-link">Solutions</a>
          <a href="#how-it-works" className="nav-item-link">How It Works</a>
          <a href="#pricing" className="nav-item-link">Pricing</a>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions-group">
          {/* Theme Mode Toggle */}
          <button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            type="button"
            aria-label="Toggle Theme"
          >
            {themeMode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Login / Dashboard Button */}
          <button
            className="navbar-btn-ghost"
            onClick={onLoginClick}
            type="button"
          >
            {user ? 'Dashboard' : 'Login'}
          </button>

          {/* Get Started CTA */}
          <button
            className="navbar-btn-primary"
            onClick={onSignupClick}
            type="button"
          >
            <span>{user ? 'Open Workspace' : 'Get Started'}</span>
            <ArrowRight size={15} className="btn-arrow-icon" />
            <div className="btn-glow-shimmer" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <nav className="mobile-nav-links">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#copilot" onClick={() => setMobileMenuOpen(false)}>Copilot Simulator</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)}>3D Neural Core</a>
            <a href="#duo" onClick={() => setMobileMenuOpen(false)}>Dual Copilot Solutions</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          </nav>
          <div className="mobile-nav-actions">
            <button
              className="btn-mobile-login"
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginClick();
              }}
            >
              {user ? 'Go to Dashboard' : 'Login'}
            </button>
            <button
              className="btn-mobile-signup"
              onClick={() => {
                setMobileMenuOpen(false);
                onSignupClick();
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
