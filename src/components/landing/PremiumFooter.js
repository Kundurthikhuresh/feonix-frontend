"use client";

import React from 'react';
import { ShieldCheck, Lock, Globe, Mail } from 'lucide-react';

export default function PremiumFooter() {
  return (
    <footer className="px-footer">
      <div className="px-container">
        <div className="px-footer-grid">
          {/* Col 1: Brand & Status */}
          <div className="px-footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div className="px-brand-icon">F</div>
              <div className="px-brand-name">
                FEONIX<span>AI</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--px-text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0', maxWidth: '320px' }}>
              The undetectable, real-time AI interview copilot and career intelligence suite. Helping software engineers, architects, and engineering managers land top-tier offers with unshakeable confidence.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--px-radius-full)', fontSize: '12px', color: '#34d399', marginBottom: '16px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span>All Systems Operational · 99.98% Uptime</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--px-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: '#10b981' }} />
                <span>100% Screen-Share Invisible</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} style={{ color: '#10b981' }} />
                <span>Zero Audio Storage Guarantee</span>
              </div>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="px-footer-col-title">Platform</h4>
            <ul className="px-footer-links">
              <li><a href="#product" className="px-footer-link">Live Interview Copilot</a></li>
              <li><a href="#product" className="px-footer-link">AI Mock Practice Coach</a></li>
              <li><a href="#product" className="px-footer-link">Speech-to-Text Engine</a></li>
              <li><a href="#product" className="px-footer-link">Screenshot Intelligence</a></li>
              <li><a href="#features" className="px-footer-link">Resume Intelligence</a></li>
              <li><a href="#features" className="px-footer-link">ATS Resume Builder</a></li>
            </ul>
          </div>

          {/* Col 3: Compatibility */}
          <div>
            <h4 className="px-footer-col-title">Compatibility</h4>
            <ul className="px-footer-links">
              <li><a href="#security" className="px-footer-link">Zoom Video Meeting</a></li>
              <li><a href="#security" className="px-footer-link">Microsoft Teams Desktop</a></li>
              <li><a href="#security" className="px-footer-link">Google Meet Screen-Share</a></li>
              <li><a href="#security" className="px-footer-link">Webex by Cisco</a></li>
              <li><a href="#security" className="px-footer-link">CoderPad & HackerRank</a></li>
              <li><a href="#security" className="px-footer-link">LeetCode & CodeSignal</a></li>
            </ul>
          </div>

          {/* Col 4: Guides */}
          <div>
            <h4 className="px-footer-col-title">Resources</h4>
            <ul className="px-footer-links">
              <li><a href="#how-it-works" className="px-footer-link">How It Works</a></li>
              <li><a href="#security" className="px-footer-link">Hardware Exclusion</a></li>
              <li><a href="#testimonials" className="px-footer-link">Candidate Stories</a></li>
              <li><a href="#faq" className="px-footer-link">Technical FAQs</a></li>
              <li><a href="mailto:support@feonixai.com" className="px-footer-link"><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} /> Contact Support</a></li>
            </ul>
          </div>

          {/* Col 5: Pricing & Trust */}
          <div>
            <h4 className="px-footer-col-title">Pricing & Trust</h4>
            <ul className="px-footer-links">
              <li><a href="#pricing" className="px-footer-link">5 Free Trial Sessions</a></li>
              <li><a href="#pricing" className="px-footer-link">1-Session Credit Pack ($19)</a></li>
              <li><a href="#pricing" className="px-footer-link">3-Session Credit Pack ($29.50)</a></li>
              <li><a href="#pricing" className="px-footer-link">Weekly Unlimited ($39)</a></li>
              <li><a href="#pricing" className="px-footer-link">Monthly Unlimited ($74.95)</a></li>
              <li><a href="#security" className="px-footer-link">Privacy & Security Whitepaper</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="px-footer-bottom">
          <div>
            © {new Date().getFullYear()} Feonix AI Inc. All rights reserved. Built for technical candidates worldwide.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Globe size={13} style={{ color: '#38bdf8' }} />
              <span>Global Multi-Region Edge</span>
            </span>
            <span>•</span>
            <span>Sub-1.2s Latency</span>
            <span>•</span>
            <span>TLS 1.3 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

