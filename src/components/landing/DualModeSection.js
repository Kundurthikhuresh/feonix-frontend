"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Check, Sparkles, TrendingUp, Radio, Zap } from 'lucide-react';

export default function DualModeSection() {
  // No control to pause the demo anymore (the controls bar was removed) —
  // it just always plays, so this is read but never set.
  const [isPlaying] = useState(true);
  const canvasRef = useRef(null);

  // Audio Waveform & Canvas Video Background Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid Lines Simulation
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 35) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 35) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Audio Waveform Line Animation
      if (isPlaying) {
        ctx.beginPath();
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00f5ff';

        const cy = canvas.height * 0.82;
        for (let x = 0; x < canvas.width; x += 4) {
          const y = cy + Math.sin(x * 0.02 + frame * 0.08) * 16 * Math.cos(x * 0.01 + frame * 0.04);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <section className="dual-mode-3d-section" id="duo" style={{ position: 'relative', padding: '90px 24px', background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.7) 0%, rgba(8,11,18,0.98) 100%)' }}>
      <div className="dual-showcase-container" style={{ maxWidth: '1520px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '48px', alignItems: 'center' }}>
        
        {/* LEFT SIDE: Generated Live Video Demonstration Stage */}
        <div className="dual-showcase-left">
          <div style={{ width: '100%', position: 'relative', background: 'rgba(15, 23, 42, 0.95)', border: '1.5px solid rgba(0, 245, 255, 0.4)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(24px)', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 245, 255, 0.15)' }}>
            
            {/* Animated Project Video Screen Box */}
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#070a12', aspectRatio: '16/10', display: 'flex', flexDirection: 'column' }}>
              
              {/* Generated Live Video Background Image */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
                <Image
                  src="/copilot_live_preview.jpg"
                  alt="Feonix AI Live Copilot Demo Preview"
                  fill
                  sizes="(max-width: 1200px) 100vw, 600px"
                  priority
                  unoptimized={true}
                  style={{ objectFit: 'cover', opacity: 1.0, filter: 'saturate(115%) contrast(105%)' }}
                  onError={(e) => { e.currentTarget.src = '/images/copilot_live_preview.jpg'; }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,10,18,0.2) 0%, rgba(7,10,18,0.65) 100%)' }} />
              </div>

              {/* HTML5 Canvas Waveform Overlay */}
              <canvas
                ref={canvasRef}
                width={640}
                height={400}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2, pointerEvents: 'none' }}
              />

              {/* Video Stage Content Overlay */}
              <div style={{ position: 'relative', zIndex: 10, padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                {/* Top Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.35)', border: '1px solid rgba(239,68,68,0.6)', padding: '4px 12px', borderRadius: '999px', backdropFilter: 'blur(10px)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.05em' }}>
                      {isPlaying ? 'PLAYING LIVE DEMO' : 'DEMO PAUSED'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#00f5ff', background: 'rgba(0,245,255,0.2)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(0,245,255,0.5)', backdropFilter: 'blur(10px)' }}>
                    <Zap size={12} />
                    <span>HUD SPEED: 120ms</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Relevant Text & Dual Mode Modules */}
        <div className="dual-showcase-right">
          <div className="section-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', color: '#00f5ff', fontSize: '12px', fontWeight: '800', marginBottom: '16px' }}>
            <Radio size={14} className="pill-icon text-cyan" />
            <span>PARALLEL AI ENGINE</span>
          </div>

          <h2 className="dual-showcase-title" style={{ fontSize: '36px', fontWeight: '900', color: '#f8fafc', margin: '0 0 16px', lineHeight: '1.2' }}>
            Two Specialized Modes. <br />
            <span className="gradient-text-cyan" style={{ background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One Autonomous Companion.</span>
          </h2>

          <p className="dual-showcase-subtitle" style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
            Feonix AI operates as a synchronized dual-layer platform: whispering real-time answer cues live during high-stakes calls, then delivering comprehensive coaching analytics and mock drill sessions afterwards.
          </p>

          {/* Dual Mode Highlight Cards Stack */}
          <div className="dual-mode-highlights-stack" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Mode 1: Copilot Mode */}
            <div className="dual-highlight-card copilot" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '16px', padding: '30px' }}>
              <div className="highlight-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div className="mode-badge-live" style={{ background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', color: '#00f5ff' }}>
                  <span>REAL-TIME HUD</span>
                </div>
                <h3 className="highlight-title" style={{ fontSize: '21px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>AI Copilot Mode</h3>
              </div>
              <p className="highlight-desc" style={{ fontSize: '14.5px', color: '#94a3b8', margin: '0 0 14px' }}>
                Runs silently in the background during technical calls. Transcribes interviewer questions and streams structured STAR answer cues directly to your stealth desktop overlay.
              </p>
              <ul className="highlight-bullets" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                  <Check size={14} style={{ color: '#00f5ff' }} />
                  <span>Teleprompter-scale typography designed for quick glances</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                  <Check size={14} style={{ color: '#00f5ff' }} />
                  <span>100% invisible to screen-shares (Zoom, Teams, Google Meet)</span>
                </li>
              </ul>
            </div>

            {/* Mode 2: Coach Mode */}
            <div className="dual-highlight-card coach" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px', padding: '30px' }}>
              <div className="highlight-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div className="mode-badge-analysis" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', color: '#a78bfa' }}>
                  <span>POST-SESSION COACH</span>
                </div>
                <h3 className="highlight-title" style={{ fontSize: '21px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>AI Coach Mode</h3>
              </div>
              <p className="highlight-desc" style={{ fontSize: '14.5px', color: '#94a3b8', margin: '0 0 14px' }}>
                Evaluates your mock interviews and real calls afterwards. Delivers in-depth structural feedback on answer organization, technical accuracy, pace, and topic mastery.
              </p>
              <ul className="highlight-bullets" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                  <Check size={14} style={{ color: '#a78bfa' }} />
                  <span>Detailed scorecard breakdown with STAR method rating</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                  <Check size={14} style={{ color: '#a78bfa' }} />
                  <span>Interactive Post-Session AI Review Chat to drill deeper on weak points</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
