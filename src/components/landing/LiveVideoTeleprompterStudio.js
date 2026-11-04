"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Video,
  Sparkles,
  ShieldCheck,
  Zap,
  Mic,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Monitor,
  Sliders,
  EyeOff
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'meet-sysdesign',
    tabName: 'Google Meet · System Design',
    platform: 'Google Meet Enterprise',
    interviewer: 'David Vance',
    interviewerRole: 'Principal Architect @ Stripe',
    callDuration: '00:30',
    videoPoster: '/images/feonix_live_floating_hud_call.jpg',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    phases: [
      {
        start: 0,
        end: 5,
        type: 'intro',
        transcript: 'Thanks for joining today. Let\'s dive straight into distributed caching at high scale...',
        showAnswer: false
      },
      {
        start: 5,
        end: 14,
        type: 'question',
        transcript: 'How would you design a distributed cache with LRU eviction across 50 nodes and prevent cache stampedes?',
        showAnswer: false
      },
      {
        start: 14,
        end: 30,
        type: 'answer',
        transcript: 'How would you design a distributed cache with LRU eviction across 50 nodes and prevent cache stampedes?',
        showAnswer: true,
        bullets: [
          { label: 'Partitioning', text: 'Consistent hashing ring with 150 virtual nodes per physical host to eliminate hot spots.' },
          { label: 'Eviction', text: 'Local doubly-linked list + O(1) hash table combined with probabilistic sample eviction.' },
          { label: 'Stampede Guard', text: 'Mutex lease locks (XADD / Redlock) ensuring single-flight DB hydration during miss spikes.' },
          { label: 'Consistency', text: 'Eventual consistency via async gossip protocol, falling back to Raft for metadata sync.' }
        ]
      }
    ],
    audioLatency: '112ms',
    accuracy: '99.4%'
  },
  {
    id: 'hackerrank-algo',
    tabName: 'HackerRank · Live Coding',
    platform: 'HackerRank Assessment Call',
    interviewer: 'Maya Lin',
    interviewerRole: 'Staff Engineering Lead @ Meta',
    callDuration: '00:30',
    videoPoster: '/images/feonix_coding_floating_hud_ide.jpg',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    phases: [
      {
        start: 0,
        end: 5,
        type: 'intro',
        transcript: 'Welcome Maya. In this round, we want to look at strict algorithmic efficiency...',
        showAnswer: false
      },
      {
        start: 5,
        end: 13,
        type: 'question',
        transcript: 'Implement an LRU Cache with get() and put() running strictly in O(1) time complexity.',
        showAnswer: false
      },
      {
        start: 13,
        end: 30,
        type: 'answer',
        transcript: 'Implement an LRU Cache with get() and put() running strictly in O(1) time complexity.',
        showAnswer: true,
        bullets: [
          { label: 'Data Structure', text: 'Combine a HashMap (Key -> Node pointer) with a Doubly-Linked List (Head/Tail dummy nodes).' },
          { label: 'get(key) Logic', text: 'Lookup node in O(1). If present, unlink from current position and move to head (MRU).' },
          { label: 'put(key, val)', text: 'If exists, update & move to head. If full, evict tail.prev node in O(1).' },
          { label: 'Edge Handling', text: 'Thread-safety with read-write mutex lock; capacity=0 rejection; null pointer defense.' }
        ]
      }
    ],
    audioLatency: '98ms',
    accuracy: '99.8%'
  },
  {
    id: 'bar-raiser-exec',
    tabName: 'Bar Raiser · Behavioral STAR',
    platform: 'Zoom Enterprise Video',
    interviewer: 'Elena Rostova',
    interviewerRole: 'VP of Engineering @ AWS',
    callDuration: '00:30',
    videoPoster: '/images/remote_assist_dashboard.jpg',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    phases: [
      {
        start: 0,
        end: 5,
        type: 'intro',
        transcript: 'Let\'s talk about how you manage crisis situations with engineering stakeholders...',
        showAnswer: false
      },
      {
        start: 5,
        end: 14,
        type: 'question',
        transcript: 'Tell me about a critical production outage where you disagreed with leadership on the resolution.',
        showAnswer: false
      },
      {
        start: 14,
        end: 30,
        type: 'answer',
        transcript: 'Tell me about a critical production outage where you disagreed with leadership on the resolution.',
        showAnswer: true,
        bullets: [
          { label: 'Situation (S)', text: 'P0 outage affecting 4.2M users due to cascading database connection pool exhaustion.' },
          { label: 'Task (T)', text: 'Leadership proposed an immediate rollback, risking 40 mins of critical data inconsistency.' },
          { label: 'Action (A)', text: 'I isolated the rogue query in pgbouncer, applied circuit breaker rate-limiting, and scaled replicas.' },
          { label: 'Result (R)', text: 'Restored service in 4.5 minutes with zero data loss; authored post-mortem adopted company-wide.' }
        ]
      }
    ],
    audioLatency: '124ms',
    accuracy: '99.1%'
  }
];

export default function LiveVideoTeleprompterStudio({ onGetStarted }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(6); // Current playback seconds (0 - 30)
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dockPosition, setDockPosition] = useState('bottom-right'); // 'bottom-right' or 'top-center'

  const videoRef = useRef(null);
  const stageRef = useRef(null);

  const scenario = SCENARIOS[activeTab];
  const maxDuration = 30;

  // Active playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(100 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= maxDuration) return 0;
        return parseFloat(next.toFixed(1));
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Sync with HTML5 video if available
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, activeTab]);

  // Find active phase
  const currentPhase = scenario.phases.find(
    (p) => currentTime >= p.start && currentTime < p.end
  ) || scenario.phases[scenario.phases.length - 1];

  const formatSecs = (sec) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPct = (currentTime / maxDuration) * 100;

  return (
    <section className="prod-section" id="live-studio">
      {/* Section Header */}
      <div className="prod-section-header">
        <div className="prod-badge">
          <Sparkles size={14} />
          <span>Interactive 4K Teleprompter Studio</span>
        </div>
        <h2 className="prod-title">
          Live Video Interviews with <span className="prod-title-gradient">Zero Anxiety</span>
        </h2>
        <p className="prod-desc">
          Watch Feonix AI listen to interviewer audio in real-time, generate structured STAR talking points in under 120ms, and display them on your hardware-invisible floating HUD.
        </p>
      </div>

      {/* Scenario Selector Pills */}
      <div className="studio-tabs">
        {SCENARIOS.map((sc, idx) => (
          <button
            key={sc.id}
            onClick={() => {
              setActiveTab(idx);
              setCurrentTime(0);
              setIsPlaying(true);
            }}
            className={`studio-tab-btn ${activeTab === idx ? 'active' : ''}`}
          >
            <Video size={16} />
            <span>{sc.tabName}</span>
          </button>
        ))}
      </div>

      {/* Main 4K Video Stage Card */}
      <div
        ref={stageRef}
        className={`video-stage-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`}
        style={isFullscreen ? {
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          borderRadius: 0,
          maxWidth: '100vw',
          maxHeight: '100vh',
          background: '#040711'
        } : {}}
      >
        {/* Stage Top Bar */}
        <div className="video-topbar">
          <div className="video-window-dots">
            <span className="video-dot red" />
            <span className="video-dot yellow" />
            <span className="video-dot green" />
            <span style={{ marginLeft: '10px', fontWeight: 600, color: '#f1f5f9' }}>
              {scenario.platform}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="video-meta-badge">
              <span className={`rec-pulse-dot ${isPlaying ? '' : 'paused'}`} />
              <span>{isPlaying ? 'RECORDING' : 'PAUSED'} · {formatSecs(currentTime)} / 00:30</span>
            </div>

            <div className="video-meta-badge" style={{ color: 'var(--feonix-emerald)', background: 'rgba(16, 185, 129, 0.12)' }}>
              <ShieldCheck size={14} />
              <span>WDA_EXCLUDEFROMCAPTURE</span>
            </div>
          </div>
        </div>

        {/* Video Viewport Stage */}
        <div className="video-viewport" style={{ position: 'relative' }}>
          {/* Background Video Stream */}
          <video
            ref={videoRef}
            src={scenario.videoSrc}
            poster={scenario.videoPoster}
            playsInline
            autoPlay
            loop
            muted={isMuted}
            className="video-backdrop-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isPlaying ? 'contrast(1.08) brightness(0.85)' : 'contrast(1) brightness(0.65)'
            }}
          />

          {/* Vignette Overlay */}
          <div className="video-overlay-vignette" />

          {/* Big Center Play Overlay Button when Paused */}
          {!isPlaying && (
            <div
              onClick={() => setIsPlaying(true)}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: 'rgba(4, 7, 16, 0.55)',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                zIndex: 25
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 35px rgba(0, 245, 255, 0.7)'
                }}
              >
                <Play size={32} style={{ marginLeft: '4px' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.05em' }}>
                CLICK TO RESUME VIDEO
              </span>
            </div>
          )}

          {/* Interviewer Call Badge (Top Left of Call) */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '9999px',
              background: 'rgba(10, 15, 26, 0.78)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              zIndex: 15
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {scenario.interviewer.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                {scenario.interviewer}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {scenario.interviewerRole}
              </div>
            </div>

            {/* Audio equalizers when speaking */}
            <div className="audio-equalizer" style={{ marginLeft: '6px' }}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="audio-bar"
                  style={{
                    animationDuration: `${0.4 + i * 0.12}s`,
                    height: isPlaying && currentTime < 14 ? undefined : '5px'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Live Subtitle Stream Bar (Typing during video call) */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              maxWidth: '560px',
              padding: '12px 18px',
              borderRadius: '12px',
              background: 'rgba(6, 10, 20, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              zIndex: 15,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--feonix-cyan)', textTransform: 'uppercase', marginBottom: '4px' }}>
              <Mic size={12} />
              <span>Live Speech Capture · WASAPI Loopback</span>
            </div>
            <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: 500, lineHeight: 1.45 }}>
              "{currentPhase.transcript}"
            </div>
          </div>

          {/* REAL FEONIX AI FLOATING TELEPROMPTER HUD (Floating Top Right / Docked cleanly) */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '460px',
              maxWidth: 'calc(100% - 40px)',
              borderRadius: '16px',
              background: 'rgba(8, 12, 22, 0.92)',
              border: '1px solid rgba(0, 245, 255, 0.4)',
              backdropFilter: 'blur(28px)',
              padding: '16px 18px',
              boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 245, 255, 0.2)',
              zIndex: 20,
              animation: 'floatHUD 4s ease-in-out infinite alternate',
              transition: 'all 0.3s ease'
            }}
          >
            {/* HUD Dock Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                  FEONIX AI STEALTH COPILOT
                </span>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: 'var(--feonix-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                <Zap size={11} />
                <span>{scenario.audioLatency}</span>
              </div>
            </div>

            {/* Question State */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', lineHeight: 1.4 }}>
              {currentTime < 14 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                  <div className="rec-pulse-dot" style={{ background: 'var(--feonix-cyan)' }} />
                  <span>Listening to interviewer voice stream...</span>
                </div>
              ) : (
                `Q: "${scenario.spokenQuestion}"`
              )}
            </div>

            {/* Answer Bullets (Revealed when currentTime >= 14) */}
            {currentPhase.showAnswer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {scenario.phases[2].bullets?.map((b, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#f1f5f9', lineHeight: 1.45 }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--feonix-emerald)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--feonix-cyan)' }}>{b.label}:</strong>{' '}
                      <span>{b.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px 12px', background: 'rgba(0, 0, 0, 0.35)', borderRadius: '8px', border: '1px dashed rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Awaiting complete utterance...
                </div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                  STAR bullets will populate automatically at 00:14
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Bottom Control Bar */}
        <div className="video-player-controls">
          <div className="video-ctrl-group">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="video-play-round"
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="video-ctrl-btn"
              title="Restart Video"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="video-ctrl-btn"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
              {formatSecs(currentTime)} / 00:30
            </span>
          </div>

          {/* Interactive Clickable & Scrubbable Progress Bar */}
          <div
            className="video-progress-bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newSec = (clickX / rect.width) * maxDuration;
              setCurrentTime(parseFloat(newSec.toFixed(1)));
            }}
            title="Click to seek anywhere in video"
          >
            <div className="video-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="video-ctrl-group">
            {/* Speed Selector */}
            <button
              onClick={() => {
                const speeds = [1, 1.25, 1.5, 2];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setPlaybackSpeed(speeds[nextIdx]);
              }}
              className="video-ctrl-btn"
              style={{ fontSize: '12px', fontWeight: 700 }}
              title="Change Video Speed"
            >
              {playbackSpeed}x
            </button>

            {/* Resolution Badge */}
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '4px' }}>
              4K 60FPS
            </span>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="video-ctrl-btn"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              onClick={() => {
                if (onGetStarted) onGetStarted();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                color: '#000000',
                fontSize: '12.5px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 18px rgba(0, 245, 255, 0.4)'
              }}
            >
              <span>Try Live Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Production Performance Metrics Strip */}
      <div className="video-stats-strip">
        <div className="video-stat-card">
          <div className="video-stat-icon">
            <Zap size={22} />
          </div>
          <div>
            <div className="video-stat-val">&lt; 118ms</div>
            <div className="video-stat-lbl">Real-Time Speech Processing</div>
          </div>
        </div>

        <div className="video-stat-card">
          <div className="video-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="video-stat-val">100% Invisible</div>
            <div className="video-stat-lbl">Compositor Screen-Share Stealth</div>
          </div>
        </div>

        <div className="video-stat-card">
          <div className="video-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="video-stat-val">99.4% Accurate</div>
            <div className="video-stat-lbl">Verified on FAANG Question Banks</div>
          </div>
        </div>

        <div className="video-stat-card">
          <div className="video-stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="video-stat-val">5 Free Sessions</div>
            <div className="video-stat-lbl">Instant Setup · No Credit Card</div>
          </div>
        </div>
      </div>
    </section>
  );
}
