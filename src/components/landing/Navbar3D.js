"use client";

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Sun, Moon, Menu, X } from 'lucide-react';

export default function Navbar3D({
  user,
  themeMode,
  toggleTheme,
  onLoginClick,
  onAdminClick,
  onDashboardClick,
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
          <a href="#video-demos" className="nav-item-link">Demos</a>
          <a href="#dual-engine" className="nav-item-link">Dual Engine</a>
          <a href="#career-suite" className="nav-item-link">Career Suite</a>
          <a href="#comparison" className="nav-item-link">Compare</a>
          <a href="#simulator" className="nav-item-link">Simulator</a>
          <a href="#pricing" className="nav-item-link">Pricing</a>
          <a href="#faq" className="nav-item-link">FAQ</a>
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
            {themeMode === 'light' ? <Moon size={21} /> : <Sun size={21} />}
          </button>

          {/* Always display Login only */}
          <button
            className="navbar-btn-ghost"
            onClick={() => onLoginClick && onLoginClick('admin')}
            type="button"
            style={{
              fontSize: '14px',
              padding: '8px 18px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Login
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
            <a href="#video-demos" onClick={() => setMobileMenuOpen(false)}>Demos</a>
            <a href="#dual-engine" onClick={() => setMobileMenuOpen(false)}>Dual Engine</a>
            <a href="#career-suite" onClick={() => setMobileMenuOpen(false)}>Career Suite</a>
            <a href="#comparison" onClick={() => setMobileMenuOpen(false)}>Compare</a>
            <a href="#simulator" onClick={() => setMobileMenuOpen(false)}>Simulator</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          </nav>
          <div className="mobile-nav-actions">
            <button
              className="btn-mobile-login"
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginClick && onLoginClick('admin');
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
