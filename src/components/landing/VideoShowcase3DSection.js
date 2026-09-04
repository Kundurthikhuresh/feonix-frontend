"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Video, Sparkles, CheckCircle2, Zap } from 'lucide-react';

const VIDEO_DEMOS = [
  {
    id: 'teleprompter',
    title: 'Real-Time AI Teleprompter & Live Audio Copilot',
    badge: 'LIVE DEMO',
    duration: '01:45',
    desc: 'Watch FeonixAI capture interviewer questions via system audio and stream instant, structured STAR bullet points to your stealth HUD in under 150ms.',
    features: ['< 150ms Ultra-low Latency', 'STAR & Code Solution Modes', 'Stealth Teleprompter HUD'],
    color: '#00f5ff',
    codeSnippet: [
      '// 1. Audio Stream Captured via System Loopback',
      'const stream = await feonix.captureSystemAudio();',
      '// 2. Question Extracted & Classified',
      'const question = "Can you explain process vs thread?";',
      '// 3. Teleprompter Bullets Streamed to Stealth HUD',
      'feonix.streamAnswer(question, { mode: "teleprompter" });'
    ],
    hudQuestion: 'Can you explain the difference between a process and a thread?',
    hudBullets: [
      'Process: Independent memory space with private stack & heap',
      'Thread: Lightweight execution path within a parent process',
      'Process context switching is heavyweight; thread is lightweight',
      'Threads share memory; processes require IPC (Inter-Process Comm)'
    ]
  },
  {
    id: 'vision-solver',
    title: 'Stealth Screenshot & Code Problem Solver',
    badge: 'VISION AI DEMO',
    duration: '02:10',
    desc: 'Snap any coding problem or system architecture diagram with Ctrl+V or screen capture. FeonixAI extracts code logic and generates complete, runnable solutions.',
    features: ['Ctrl + V Instant Screen Snap', 'Multi-Language Code Solver', 'Zero-Lag Vision Processing'],
    color: '#8b5cf6',
    codeSnippet: [
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
    features: ['Full Session Audio Transcripts', 'Filler Word & Tone Analytics', 'Custom Mock Interview Coach'],
    color: '#10b981',
    codeSnippet: [
      '// Post-Interview Performance Analysis Report',
      'const metrics = await feonix.analyzeSession(sessionId);',
      'console.log(metrics);',
      '// Output: { wpm: 135, fillerWords: 2, clarity: "98%" }'
    ],
    hudQuestion: 'Session Summary & Verbal Clarity Analysis',
    hudBullets: [
      'Speaking Pace: 135 words/min (Optimal interview rhythm)',
      'Filler Words: 2 "um" detected across 15 min session (98% clarity)',
      'Technical Depth: Strong coverage of system scalability & data structures',
      'Overall Confidence Rating: 9.6 / 10'
    ]
  },
];

export default function VideoShowcase3DSection() {
  const [activeVideo, setActiveVideo] = useState(VIDEO_DEMOS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simTime, setSimTime] = useState(12);
  const [activeBulletIndex, setActiveBulletIndex] = useState(0);
  const canvasRef = useRef(null);

  // Playback timer & simulated video progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime((prev) => (prev >= 105 ? 0 : prev + 1));
      setActiveBulletIndex((prev) => (prev + 1) % activeVideo.hudBullets.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, activeVideo]);

  // Animated Audio Waveform & Canvas Video Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0b0f19');
      grad.addColorStop(1, '#05070d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines Simulation
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Audio Waveform Animation
      if (isPlaying) {
        ctx.beginPath();
        ctx.strokeStyle = activeVideo.color;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = activeVideo.color;

        const cy = canvas.height * 0.78;
        for (let x = 0; x < canvas.width; x += 4) {
          const y = cy + Math.sin(x * 0.02 + frame * 0.08) * 18 * Math.cos(x * 0.01 + frame * 0.04);
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
    <section className="video-showcase-3d-section" style={{ position: 'relative', padding: '90px 24px', background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.7) 0%, rgba(8,11,18,0.98) 100%)' }}>
      <div className="video-showcase-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div className="video-section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', color: '#00f5ff', fontSize: '12px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <Video size={14} />
            <span>PROJECT VIDEO DEMONSTRATIONS</span>
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#f8fafc', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Live <span style={{ background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FeonixAI</span> Project Demonstration
          </h2>
          <p style={{ fontSize: '16.5px', color: '#94a3b8', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Watch real-time live demonstrations of our undetectable AI teleprompter, vision code solver, and automated interview coach.
          </p>
        </div>

        {/* Featured Live Video Player Stage */}
        <div style={{ position: 'relative', background: 'rgba(15, 23, 42, 0.9)', border: `1.5px solid ${activeVideo.color}50`, borderRadius: '24px', padding: '24px', backdropFilter: 'blur(24px)', boxShadow: `0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px ${activeVideo.color}20`, marginBottom: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '32px', alignItems: 'center' }}>
            
            {/* Animated Project Video Screen Box */}
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#070a12', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px rgba(0,0,0,0.8)' }}>
              
              {/* HTML5 Canvas Background Renderer */}
              <canvas
                ref={canvasRef}
                width={720}
                height={405}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Live Project Video Stage Overlay */}
              <div style={{ position: 'relative', zIndex: 10, padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                {/* Video Stage Top Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.5)', padding: '4px 10px', borderRadius: '999px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.05em' }}>
                      {isPlaying ? 'PLAYING LIVE DEMO' : 'VIDEO PAUSED'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#00f5ff', background: 'rgba(0,245,255,0.12)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(0,245,255,0.35)' }}>
                    <Zap size={12} />
                    <span>HUD SPEED: 120ms</span>
                  </div>
                </div>

                {/* Animated IDE Code Editor Display */}
                <div style={{ background: 'rgba(10, 14, 26, 0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                  {activeVideo.codeSnippet.slice(0, 3).map((line, i) => (
                    <div key={i} style={{ color: line.startsWith('//') ? '#64748b' : '#38bdf8' }}>{line}</div>
                  ))}
                </div>

                {/* Stealth Teleprompter Stream Overlay */}
                <div style={{ background: 'rgba(13, 17, 26, 0.95)', border: `1px solid ${activeVideo.color}70`, borderRadius: '12px', padding: '14px', boxShadow: `0 10px 30px rgba(0,0,0,0.8)` }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: activeVideo.color, letterSpacing: '0.08em', marginBottom: '8px' }}>
                    ⚡ FEONIX AI STEALTH COPILOT
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff', marginBottom: '10px', padding: '4px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                    Q: "{activeVideo.hudQuestion}"
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeVideo.hudBullets.map((bullet, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: i === activeBulletIndex ? activeVideo.color : '#cbd5e1', fontWeight: i === activeBulletIndex ? '700' : '500', transition: 'color 0.2s ease' }}>
                        <span style={{ color: activeVideo.color }}>•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Video Controls Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(10,14,26,0.85)', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ border: 0, background: activeVideo.color, color: '#0a0e1a', borderRadius: '50%', width: '30px', height: '30px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                  </button>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: '#ffffff', fontWeight: '700' }}>
                    {formatSeconds(simTime)} / {activeVideo.duration}
                  </span>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${(simTime / 105) * 100}%`, height: '100%', background: activeVideo.color, transition: 'width 0.3s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: activeVideo.color, background: `${activeVideo.color}20`, padding: '2px 8px', borderRadius: '4px' }}>
                    1080p 60fps HD
                  </span>
                </div>

              </div>
            </div>

            {/* Video Details & Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: `${activeVideo.color}20`, border: `1px solid ${activeVideo.color}50`, color: activeVideo.color, fontSize: '11px', fontWeight: '800', width: 'fit-content' }}>
                <Sparkles size={12} />
                <span>{activeVideo.badge}</span>
              </div>

              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0, lineHeight: '1.3' }}>
                {activeVideo.title}
              </h3>

              <p style={{ fontSize: '14.5px', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
                {activeVideo.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {activeVideo.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '600', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} style={{ color: activeVideo.color }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Video Selector Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {VIDEO_DEMOS.map((video) => {
            const isActive = activeVideo.id === video.id;
            return (
              <div
                key={video.id}
                onClick={() => {
                  setActiveVideo(video);
                  setIsPlaying(true);
                }}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: isActive ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1.5px solid ${isActive ? video.color : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 10px 30px ${video.color}20` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: video.color, background: `${video.color}15`, padding: '3px 8px', borderRadius: '6px' }}>
                    {video.badge}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                    {video.duration}
                  </span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>
                  {video.title}
                </h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                  {video.desc.slice(0, 85)}...
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
