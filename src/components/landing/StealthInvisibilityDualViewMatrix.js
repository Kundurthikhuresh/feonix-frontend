"use client";

import React, { useState } from 'react';
import {
  EyeOff,
  Eye,
  Shield,
  ShieldCheck,
  Lock,
  MoveHorizontal,
  Sliders,
  CheckCircle2,
  Cpu,
  Radio,
  Sparkles,
  Command,
  Monitor
} from 'lucide-react';

export default function StealthInvisibilityDualViewMatrix() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  return (
    <section className="prod-section" id="stealth-matrix">
      {/* Section Header */}
      <div className="prod-section-header">
        <div className="prod-badge emerald">
          <EyeOff size={14} />
          <span>Screen-Share Anti-Detection Proof</span>
        </div>
        <h2 className="prod-title">
          100% Invisible to <span className="prod-title-gradient">Zoom, Meet & Teams</span>
        </h2>
        <p className="prod-desc">
          Drag the interactive comparison slider below to inspect what interviewers see versus your real-time floating AI teleprompter view.
        </p>
      </div>

      {/* Quick View Switcher Buttons */}
      <div className="studio-tabs">
        <button
          onClick={() => setSliderPos(0)}
          className={`studio-tab-btn ${sliderPos === 0 ? 'active' : ''}`}
        >
          <EyeOff size={16} />
          <span>Interviewer View (0% Overlay)</span>
        </button>

        <button
          onClick={() => setSliderPos(50)}
          className={`studio-tab-btn ${sliderPos === 50 ? 'active' : ''}`}
        >
          <MoveHorizontal size={16} />
          <span>Split Dual Comparison (50/50)</span>
        </button>

        <button
          onClick={() => setSliderPos(100)}
          className={`studio-tab-btn ${sliderPos === 100 ? 'active' : ''}`}
        >
          <Eye size={16} />
          <span>Candidate Screen (With Live HUD)</span>
        </button>
      </div>

      {/* Main Interactive Dual-View Comparison Slider */}
      <div className="stealth-slider-card">
        <div
          className="stealth-compare-viewport"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
        >
          {/* Base Layer: What The Interviewer Sees (100% Clean) */}
          <div className="compare-layer-interviewer">
            <img
              src="/images/online_assessment_desk.jpg"
              alt="What Interviewer Sees on Screen Share"
              className="compare-media-img"
            />
            <div className="compare-label-pill left">
              <span>Interviewer View · Completely Invisible</span>
            </div>
          </div>

          {/* Top Clipped Layer: What You See (Candidate View with HUD) */}
          <div
            className="compare-layer-candidate"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src="/images/feonix_stealth_hud_preview.jpg"
              alt="What You See: Transparent Floating Teleprompter HUD"
              className="compare-media-img"
              style={{
                width: '100%',
                maxWidth: 'none',
                minWidth: '100%'
              }}
            />
            <div className="compare-label-pill right">
              <span>Candidate View · Real-Time Teleprompter HUD</span>
            </div>
          </div>

          {/* Interactive Divider Line with Draggable Handle */}
          <div
            className="compare-slider-divider"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="compare-slider-handle">
              <MoveHorizontal size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Stealth Anti-Detection Architecture */}
      <div className="stealth-pillars-grid">
        <div className="stealth-pillar-card">
          <div className="stealth-pillar-icon">
            <ShieldCheck size={22} />
          </div>
          <div className="stealth-pillar-title">Hardware Compositor Exclusion</div>
          <div className="stealth-pillar-desc">
            Directly invokes OS-level <code>WDA_EXCLUDEFROMCAPTURE</code> on Windows and <code>NSWindowSharingNone</code> on macOS. Screen recording encoders physically bypass the overlay window.
          </div>
        </div>

        <div className="stealth-pillar-card">
          <div className="stealth-pillar-icon">
            <Radio size={22} />
          </div>
          <div className="stealth-pillar-title">Kernel Loopback Audio</div>
          <div className="stealth-pillar-desc">
            Captures interviewer voices through Windows WASAPI and macOS CoreAudio speaker loopback. Zero browser extensions required and zero software drivers injected.
          </div>
        </div>

        <div className="stealth-pillar-card">
          <div className="stealth-pillar-icon">
            <Cpu size={22} />
          </div>
          <div className="stealth-pillar-title">Ephemeral Memory Processing</div>
          <div className="stealth-pillar-desc">
            Audio chunks and AI inference stream ephemerally in RAM. Audio is never stored or recorded to disk, preserving 100% corporate NDA compliance.
          </div>
        </div>

        <div className="stealth-pillar-card">
          <div className="stealth-pillar-icon">
            <Command size={22} />
          </div>
          <div className="stealth-pillar-title">Emergency Vanish Hotkey</div>
          <div className="stealth-pillar-desc">
            Press <strong>Ctrl + Shift + H</strong> (or Cmd+Shift+H) anytime to instantly hide and unhide the overlay dock in under 1 millisecond.
          </div>
        </div>
      </div>
    </section>
  );
}

