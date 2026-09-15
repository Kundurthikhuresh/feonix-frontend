"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Video, Sparkles, CheckCircle2, Zap, ShieldAlert, Cpu, Terminal, ArrowRight } from 'lucide-react';

const VIDEO_DEMOS = [
  {
    id: 'teleprompter',
    title: 'Real-Time AI Teleprompter & Live Audio Copilot',
    badge: 'LIVE AUDIO DEMO',
    duration: '01:45',
    desc: 'Watch FeonixAI capture interviewer questions via system audio and stream instant, structured STAR bullet points to your stealth HUD in under 118ms.',
    features: ['< 118ms Ultra-low Audio Latency', 'STAR & System Design Solution Modes', 'Invisible Stealth Teleprompter HUD'],
    color: '#00f5ff',
    glowClass: 'pulseGlowCyan',
    codeSnippet: [
      '// 1. System Loopback Audio Capture Enabled',
      'const audioStream = await feonix.captureSystemAudio();',
      '// 2. Transcribing & Classifying Interviewer Question',
      'const question = "Can you explain process vs thread?";',
      '// 3. Streaming STAR Bullets to Stealth Teleprompter HUD',
      'feonix.streamAnswer(question, { mode: "stealth-hud", latencyTarget: "118ms" });'
    ],
    hudQuestion: 'Can you explain the difference between a process and a thread?',
    hudBullets: [
      'Process: Independent memory space with private stack & heap',
      'Thread: Lightweight execution path within a parent process',
      'Context Switching: Process switching is heavy; thread switching is fast',
      'Concurrency Control: Threads share memory; processes require IPC'
    ]
  },
  {
    id: 'vision-solver',
    title: 'Stealth Screenshot & Code Problem Solver',
    badge: 'VISION AI DEMO',
    duration: '02:10',
    desc: 'Snap any coding problem or system architecture diagram with Ctrl+V or screen capture. FeonixAI extracts code logic and generates complete, runnable solutions.',
    features: ['Ctrl + V Instant Screen Snap', 'Multi-Language Algorithm Solver', 'Zero-Lag OCR Vision Engine'],
    color: '#8b5cf6',
    glowClass: 'pulseGlowPurple',
    codeSnippet: [
      '// Vision AI Snap Processing Activated',
      'function twoSum(nums, target) {',
      '  const map = new Map();',
      '  for (let i = 0; i < nums.length; i++) {',
      '    const comp = target - nums[i];',
      '    if (map.has(comp)) return [map.get(comp), i];',
      '    map.set(nums[i], i);',
      '  }',
      '}'
    ],
    hudQuestion: 'Solve twoSum(nums, target) in O(n) time complexity using HashMap.',
    hudBullets: [
      'Initialize an empty HashMap storing num -> index mapping',
      'Calculate complement = target - nums[i] on each iteration',
      'Lookup complement in O(1) time complexity',
      'Returns optimal [index1, index2] in single pass O(n)'
    ]
  },
  {
    id: 'coaching-analytics',
    title: 'Post-Interview Analytics & AI Voice Coach',
    badge: 'AI COACHING DEMO',
    duration: '01:30',
    desc: 'Review full session transcripts, speaking pace metrics, filler word detection, and personalized AI feedback after every interview call.',
    features: ['Full Session Audio Transcripts', 'Filler Word & Pace Analytics', 'Personalized AI Mock Interview Coach'],
    color: '#10b981',
    glowClass: 'pulseGlowGreen',
    codeSnippet: [
      '// Post-Interview Audio Analysis Report',
      'const metrics = await feonix.analyzeSession(sessionId);',
      'console.log(metrics);',
      '// Output: { wpm: 135, fillerWords: 2, clarity: "98.4%" }'
    ],
    hudQuestion: 'Session Performance Summary & Voice Analytics',
    hudBullets: [
      'Speaking Pace: 135 words/min (Optimal interview rhythm)',
      'Filler Words: 2 "um" detected across 15 min session (98.4% clarity)',
      'Technical Depth: Strong coverage of system scalability & data structures',
      'Overall Interview Confidence Score: 9.8 / 10'
    ]
  },
];

export default function VideoShowcase3DSection({ onWatchDemo }) {
  const [activeVideo, setActiveVideo] = useState(VIDEO_DEMOS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simTime, setSimTime] = useState(14);
  const [activeBulletIndex, setActiveBulletIndex] = useState(0);
  const canvasRef = useRef(null);

  // Playback timer & simulated video progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime((prev) => (prev >= 105 ? 0 : prev + 1));
      setActiveBulletIndex((prev) => (prev + 1) % activeVideo.hudBullets.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlaying, activeVideo]);

  // High-Tech Cyber Canvas Background Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep obsidian space gradient background
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      grad.addColorStop(0, '#0c1222');
      grad.addColorStop(0.7, '#070a12');
      grad.addColorStop(1, '#03050a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Futuristic Matrix Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Animated Frequency Spectrum Waveform & Radar Target
      if (isPlaying) {
        // Glowing Radar Scan Ring
        const cx = canvas.width * 0.82;
        const cy = canvas.height * 0.22;
        ctx.beginPath();
        ctx.arc(cx, cy, 35 + Math.sin(frame * 0.05) * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `${activeVideo.color}30`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.strokeStyle = activeVideo.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Audio Frequency Equalizer Spectrum Bars (Bottom Right)
        const barWidth = 4;
        const barGap = 3;
        const startX = canvas.width - 120;
        const startY = canvas.height - 30;

        for (let i = 0; i < 16; i++) {
          const h = 8 + Math.abs(Math.sin(frame * 0.1 + i * 0.4)) * 26;
          ctx.fillStyle = activeVideo.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = activeVideo.color;
          ctx.fillRect(startX + i * (barWidth + barGap), startY - h, barWidth, h);
        }
        ctx.shadowBlur = 0;

        // Smooth Oscilloscope Waveform Line across Canvas
        ctx.beginPath();
        ctx.strokeStyle = activeVideo.color;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = activeVideo.color;

        const waveY = canvas.height * 0.84;
        for (let x = 0; x < canvas.width * 0.7; x += 3) {
          const y = waveY + Math.sin(x * 0.025 + frame * 0.07) * 14 * Math.cos(x * 0.01 + frame * 0.03);
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
  }, [isPlaying, activeVideo]);

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <section
      id="video-demos"
      className="video-showcase-3d-section"
      style={{
        position: 'relative',
        padding: '68px 24px 72px 24px',
        background: 'radial-gradient(ellipse at center, rgba(13,20,38,0.95) 0%, rgba(6,9,16,1) 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '650px',
          height: '400px',
          background: `radial-gradient(circle, ${activeVideo.color}18 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          transition: 'background 0.5s ease'
        }}
      />

      <div className="video-showcase-container" style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        
        {/* Section Header */}
        <div className="video-section-header" style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'rgba(0, 245, 255, 0.08)',
              border: '1px solid rgba(0, 245, 255, 0.25)',
              color: '#00f5ff',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.15)'
            }}
          >
            <Video size={14} />
            <span>⚡ ULTRA-FAST AI TELEPROMPTER DEMOS</span>
          </div>

          <h2
            style={{
              fontSize: '42px',
              fontWeight: '900',
              color: '#f8fafc',
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}
          >
            Live <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FeonixAI</span> Project Demonstration
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Watch real-time live demonstrations of our undetectable AI teleprompter, vision code solver, and automated interview coach.
          </p>

          {/* Quick Trigger Button for Full 4K Walkthrough */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={onWatchDemo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(139,92,246,0.15) 100%)',
                border: '1.5px solid rgba(0, 245, 255, 0.4)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 0 25px rgba(0, 245, 255, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 245, 255, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 245, 255, 0.25)';
              }}
            >
              <Play size={15} fill="#00f5ff" style={{ color: '#00f5ff' }} />
              <span>Watch Full 90-Sec 4K Walkthrough Video</span>
              <ArrowRight size={15} style={{ color: '#00f5ff' }} />
            </button>
          </div>
        </div>

        {/* Featured 4K Video Player Stage */}
        <div
          className="video-showcase-glass-stage"
          style={{
            padding: '28px',
            border: `1.5px solid ${activeVideo.color}60`,
            boxShadow: `0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px ${activeVideo.color}25`,
            marginBottom: '44px'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '36px', alignItems: 'center' }}>
            
            {/* Animated Project Video Stage Frame */}
            <div
              style={{
                position: 'relative',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.14)',
                background: '#070a12',
                aspectRatio: '16/9',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
              }}
            >
              {/* HTML5 Canvas Background Visualizer */}
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Stealth Teleprompter HUD Interface Layer */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  padding: '18px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                {/* Stage Top Bar Status Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '5px 12px',
                      borderRadius: '999px'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 12px #ef4444',
                        animation: isPlaying ? 'liveStatusBlink 1.2s ease infinite' : 'none'
                      }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.06em' }}>
                      {isPlaying ? '● LIVE DEMO STREAMING' : 'PAUSED'}
                    </span>
                  </div>

                  {/* Equalizer Visualizer & Latency Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isPlaying && (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '18px', color: activeVideo.color }}>
                        <div className="equalizer-bar-animated" />
                        <div className="equalizer-bar-animated" />
                        <div className="equalizer-bar-animated" />
                        <div className="equalizer-bar-animated" />
                        <div className="equalizer-bar-animated" />
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: activeVideo.color,
                        background: 'rgba(10, 14, 26, 0.85)',
                        backdropFilter: 'blur(10px)',
                        padding: '5px 12px',
                        borderRadius: '999px',
                        border: `1px solid ${activeVideo.color}40`
                      }}
                    >
                      <Zap size={13} />
                      <span>HUD LATENCY: 118ms</span>
                    </div>
                  </div>
                </div>

                {/* Simulated High-Tech Code Snippet Box */}
                <div
                  style={{
                    background: 'rgba(10, 14, 26, 0.88)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    color: '#94a3b8',
                    lineHeight: '1.5',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                >
                  {activeVideo.codeSnippet.slice(0, 3).map((line, i) => (
                    <div key={i} style={{ color: line.startsWith('//') ? '#64748b' : activeVideo.color }}>
                      {line}
                    </div>
                  ))}
                </div>

                {/* Stealth Teleprompter Real-Time Bullet Overlay Window */}
                <div
                  style={{
                    background: 'rgba(13, 17, 26, 0.94)',
                    border: `1.5px solid ${activeVideo.color}70`,
                    borderRadius: '14px',
                    padding: '16px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: `0 12px 35px rgba(0,0,0,0.85), 0 0 25px ${activeVideo.color}20`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: activeVideo.color, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={13} />
                      <span>FEONIX AI STEALTH TELEPROMPTER</span>
                    </div>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                      RAG CONFIDENCE 99.2%
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '10px',
                      padding: '6px 10px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${activeVideo.color}`
                    }}
                  >
                    Q: "{activeVideo.hudQuestion}"
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeVideo.hudBullets.map((bullet, i) => {
                      const isCurrent = i === activeBulletIndex;
                      return (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '12.5px',
                            color: isCurrent ? '#ffffff' : '#94a3b8',
                            fontWeight: isCurrent ? '700' : '500',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: isCurrent ? `${activeVideo.color}20` : 'transparent',
                            border: isCurrent ? `1px solid ${activeVideo.color}40` : '1px solid transparent',
                            transition: 'all 0.25s ease'
                          }}
                        >
                          <span style={{ color: activeVideo.color, fontWeight: '800', flexShrink: 0 }}>▶</span>
                          <span style={{ lineHeight: '1.4' }}>{bullet}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>



              </div>
            </div>

            {/* Featured Video Details & Highlight Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: `${activeVideo.color}18`,
                  border: `1.5px solid ${activeVideo.color}50`,
                  color: activeVideo.color,
                  fontSize: '11.5px',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  width: 'fit-content',
                  boxShadow: `0 0 15px ${activeVideo.color}20`
                }}
              >
                <Sparkles size={14} />
                <span>{activeVideo.badge}</span>
              </div>

              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: 0, lineHeight: '1.25', letterSpacing: '-0.01em' }}>
                {activeVideo.title}
              </h3>

              <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, lineHeight: '1.65' }}>
                {activeVideo.desc}
              </p>

              {/* Key Highlights Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                {activeVideo.features.map((feat, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <CheckCircle2 size={18} style={{ color: activeVideo.color, flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Direct Demo Trigger Action Button */}
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={onWatchDemo}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${activeVideo.color} 0%, #8b5cf6 100%)`,
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: `0 0 30px ${activeVideo.color}40`,
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 0 40px ${activeVideo.color}70`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = `0 0 30px ${activeVideo.color}40`;
                  }}
                >
                  <Play size={16} fill="#ffffff" />
                  <span>Launch 90-Sec 4K Walkthrough Video</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Video Demo Selector Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {VIDEO_DEMOS.map((video) => {
            const isActive = activeVideo.id === video.id;
            return (
              <div
                key={video.id}
                className="video-card-item"
                onClick={() => {
                  setActiveVideo(video);
                  setIsPlaying(true);
                }}
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  background: isActive
                    ? 'rgba(15, 23, 42, 0.95)'
                    : 'rgba(10, 14, 26, 0.65)',
                  border: `1.5px solid ${isActive ? video.color : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isActive
                    ? `0 16px 40px rgba(0,0,0,0.8), 0 0 30px ${video.color}25`
                    : '0 8px 24px rgba(0,0,0,0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Active Indicator Top Accent Bar */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${video.color}, #ffffff)`
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: video.color,
                      background: `${video.color}18`,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${video.color}35`
                    }}
                  >
                    {video.badge}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isActive && (
                      <span style={{ fontSize: '10px', fontWeight: '800', color: video.color }}>
                        PLAYING
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', fontFamily: 'monospace' }}>
                      {video.duration}
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 10px', lineHeight: '1.3' }}>
                  {video.title}
                </h4>

                <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0, lineHeight: '1.55' }}>
                  {video.desc}
                </p>

                {/* Animated Equalizer Visualizer preview inside active card */}
                {isActive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', color: video.color }}>
                      <div className="equalizer-bar-animated" />
                      <div className="equalizer-bar-animated" />
                      <div className="equalizer-bar-animated" />
                    </div>
                    <span style={{ fontSize: '11.5px', color: video.color, fontWeight: '700' }}>
                      Active Live Stage Demo
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
