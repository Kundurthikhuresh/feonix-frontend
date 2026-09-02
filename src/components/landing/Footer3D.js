"use client";

import { Sparkles } from 'lucide-react';

export default function Footer3D() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-3d-wrapper">
      <div className="footer-3d-top-border" />

      <div className="footer-3d-container">
        <div className="footer-columns-grid">
          {/* Brand Column */}
          <div className="footer-brand-column">
            <div className="footer-brand-logo">
              <div className="footer-brand-mark">F</div>
              <span className="footer-brand-title">FEONIX<span className="text-cyan">AI</span></span>
            </div>
            <p className="footer-brand-tagline">
              High-stakes meeting and technical interview copilot powered by dual-layer low-latency real-time AI.
            </p>
            <div className="footer-social-links">
              <a href="https://x.com" target="_blank" rel="noreferrer" className="social-link-icon" aria-label="Twitter">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link-icon" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link-icon" aria-label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 0 0-1.64 1.64 1.64 1.64 0 0 0 1.64 1.64 1.64 1.64 0 0 0 1.64-1.64 1.64 1.64 0 0 0-1.64-1.64z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-nav-list">
              <li><a href="#copilot">Real-Time Simulator</a></li>
              <li><a href="#features">3D Copilot Features</a></li>
              <li><a href="#showcase">Neural AI Core</a></li>
              <li><a href="#duo">AI Coach Mode</a></li>
              <li><a href="#pricing">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Solutions</h4>
            <ul className="footer-nav-list">
              <li><a href="#features">Coding Rounds</a></li>
              <li><a href="#features">System Design</a></li>
              <li><a href="#duo">Behavioral Questions</a></li>
              <li><a href="#desktop">Desktop Stealth HUD</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-nav-list">
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#copilot">Interactive Demo</a></li>
              <li><a href="#privacy">Privacy & Security</a></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-nav-list">
              <li><a href="#about">About Us</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#cookies">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © {currentYear} Feonix AI. All rights reserved. Built for technical excellence.
          </p>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Policy</a>
            <span className="dot-sep">·</span>
            <a href="#terms">Terms of Service</a>
            <span className="dot-sep">·</span>
            <a href="#security">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
