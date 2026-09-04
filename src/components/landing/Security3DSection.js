"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ShieldCheck, Lock, EyeOff, Cpu, Terminal, CheckCircle2, Zap } from 'lucide-react';

const SecurityShieldCanvas = dynamic(() => import('../3d/SecurityShieldCanvas'), {
  ssr: false,
  loading: () => <div className="security-canvas-placeholder" />
});

const SECURITY_PILLARS = [
  {
    icon: EyeOff,
    title: 'Zero Audio & Video Retention',
    description: 'Audio streams and screen pixels are processed transiently in memory and immediately discarded. No recording is ever stored on external cloud servers.',
    badge: 'Privacy Guaranteed'
  },
  {
    icon: Lock,
    title: 'Military-Grade Encryption',
    description: 'All network payloads are locked with AES-256-GCM and TLS 1.3 end-to-end encryption with ephemeral session keys.',
    badge: 'AES-256 / TLS 1.3'
  },
  {
    icon: Terminal,
    title: 'Air-Gapped Desktop Mode',
    description: 'Run lightweight local LLMs directly inside our Electron app. Perfect for strict enterprise non-disclosure agreements.',
    badge: '100% Offline Compatible'
  },
  {
    icon: Cpu,
    title: 'Isolated Execution Sandbox',
    description: 'Per-user sandboxing guarantees complete data segregation. Your personal resumes and knowledge base documents are accessible only by your session.',
    badge: 'SOC 2 Type II Certified'
  }
];

export default function Security3DSection() {
  const [pulseCount, setPulseCount] = useState(0);
  const [testingStatus, setTestingStatus] = useState(null);

  const handleTestShield = () => {
    setPulseCount((prev) => prev + 1);
    setTestingStatus('DEFLECTION PULSE ACTIVE • 100% BLOCKED');
    setTimeout(() => {
      setTestingStatus(null);
    }, 2500);
  };

  return (
    <section className="security-3d-section">
      <div className="security-glow-bg" />

      <div className="security-container">
        {/* Header */}
        <div className="security-header">
          <div className="security-pill-badge">
            <ShieldCheck size={14} />
            <span>ENTERPRISE PRIVACY & QUANTUM VAULT</span>
          </div>
          <h2 className="security-main-heading">
            100% Private, Zero Retention, Indestructible Security
          </h2>
          <p className="security-sub-heading">
            Your interviews and confidential discussions are your private advantage. We enforce strict mathematical privacy guarantees so you can perform with total confidence.
          </p>
        </div>

        {/* 3D Shield Canvas & Stress Test Area */}
        <div className="security-grid">
          {/* Left 3D Canvas Box */}
          <div className="security-canvas-box">
            <div className="security-canvas-badge">
              <Lock size={14} />
              <span>Interactive Quantum Vault Shield</span>
            </div>

            <div className="security-canvas-wrapper">
              <SecurityShieldCanvas pulseCount={pulseCount} />
            </div>

            {/* Shield Stress Test Control */}
            <div className="security-control-row">
              <div>
                <div className="security-status-label">Shield Integrity Status</div>
                <div className="security-status-val">
                  <CheckCircle2 size={16} />
                  Quantum Cryptographic Shield Active
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestShield}
                className="security-test-btn"
              >
                <Zap size={14} />
                Test Shield Deflection
              </button>
            </div>

            {testingStatus && (
              <div className="security-status-banner">
                {testingStatus}
              </div>
            )}
          </div>

          {/* Right Security Pillars List */}
          <div className="security-pillars-grid">
            {SECURITY_PILLARS.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div key={idx} className="security-pillar-card">
                  <div className="pillar-icon-box">
                    <IconComp size={20} />
                  </div>
                  <div className="pillar-badge">{pillar.badge}</div>
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-desc">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
