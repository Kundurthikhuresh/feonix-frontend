"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, Send, Activity, Sparkles, CheckCircle2, Terminal, Mic, Shield, RefreshCw, Copy, ThumbsUp, ThumbsDown, Move, MoreVertical, Maximize2, ArrowLeft, ArrowRight, Video } from 'lucide-react';
import dynamic from 'next/dynamic';

const Hero3DCanvas = dynamic(() => import('../3d/Hero3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="sim-solar-loader">
      <div className="fallback-orb-pulse" />
    </div>
  ),
});

const DEMO_SAMPLES = [
  {
    id: 'manager-disagreement',
    label: "Disagreement with manager",
    question: "Walk me through a time you disagreed with your manager.",
    answer: {
      headline: "Frame it as a disagreement about evidence, not about authority.",
      bullets: [
        "Situation: We planned a complete architecture rewrite that I evaluated as premature for our scale.",
        "Action: I put together a two-week technical spike measuring actual DB bottleneck metrics.",
        "Result: The benchmark data showed it was an unindexed query layer, so we fixed that instead and saved 3 months."
      ],
      time: "12:11",
      chips: ["Walk me through", "a time you", "disagreed with your", "manager."]
    }
  },
  {
    id: 'process-thread',
    label: "Process vs Thread in OS Architecture",
    question: "Can you explain the difference between a process and a thread?",
    answer: {
      headline: "Processes have isolated memory spaces; threads share memory within the same process.",
      bullets: [
        "Situation: OS-level isolation vs lightweight execution concurrency tradeoffs.",
        "Action: Contrast heavy IPC overhead (~1–10 µs context switch) with shared heap thread execution.",
        "Result: Emphasize synchronization primitives (mutex, semaphore) required to prevent race conditions."
      ],
      time: "10:45",
      chips: ["Can you explain", "the difference", "between a process", "and a thread?"]
    }
  },
  {
    id: 'js-event-loop',
    label: "JavaScript Event Loop & Microtasks",
    question: "How does the event loop work in JavaScript under the hood?",
    answer: {
      headline: "Single-threaded non-blocking runtime via Call Stack, Microtask, and Macrotask queues.",
      bullets: [
        "Situation: Explaining V8 asynchronous event loop execution precedence.",
        "Action: Detail Call Stack execution -> Microtask queue (Promises) full drain -> Macrotasks (setTimeout).",
        "Result: Explain why Promise.resolve().then() executes before setTimeout(fn, 0)."
      ],
      time: "09:30",
      chips: ["How does the", "event loop work", "in JavaScript", "under the hood?"]
    }
  },
  {
    id: 'system-design-rate-limiter',
    label: "System Design: API Rate Limiter",
    question: "How would you design a distributed API Rate Limiter?",
    answer: {
      headline: "Use Redis Token Bucket or Sliding Window Log with atomic Lua scripts.",
      bullets: [
        "Situation: Protecting microservices from DDoS and client API quota exhaustion.",
        "Action: Implement Sliding Window Counter in Redis cluster using INCR and EXPIRE commands.",
        "Result: Achieved < 2ms latency overhead with multi-region synchronization."
      ],
      time: "14:22",
      chips: ["How would you", "design a distributed", "API Rate Limiter", "for high traffic?"]
    }
  }
];

export default function InteractiveSimulator3D() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Video-like auto-stream mode
  const [simState, setSimState] = useState('answering'); // 'transcribing', 'thinking', 'answering'
  const [currentQuestion, setCurrentQuestion] = useState(DEMO_SAMPLES[0].question);
  const [currentAnswer, setCurrentAnswer] = useState(DEMO_SAMPLES[0].answer);
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // 3D Tilt Physics
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const sectionRef = useRef(null);

  // Auto-scroll / Video Loop Stream Engine
  useEffect(() => {
    if (!isPlaying) return;

    const sample = DEMO_SAMPLES[sampleIndex];
    setSimState('transcribing');
    setCurrentQuestion(sample.question);
    setCurrentAnswer(sample.answer);

    // Step 1: Transcribing voice stream (1.2s)
    const timer1 = setTimeout(() => {
      setSimState('thinking');

      // Step 2: RAG Context Thinking (0.8s)
      const timer2 = setTimeout(() => {
        setSimState('answering');

        // Step 3: Hold answer card visible (5.5s), then advance to next question
        const timer3 = setTimeout(() => {
          setSampleIndex((prev) => (prev + 1) % DEMO_SAMPLES.length);
        }, 5500);

        return () => clearTimeout(timer3);
      }, 800);

      return () => clearTimeout(timer2);
    }, 1200);

    return () => clearTimeout(timer1);
  }, [sampleIndex, isPlaying]);

  // Scroll detection trigger (auto-resumes or plays when in viewport)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsPlaying(true);
          }
        });
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 4;
    const rotateX = -((y - yc) / yc) * 4;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSelectSample = (index) => {
    setIsPlaying(false);
    setSampleIndex(index);
    const sample = DEMO_SAMPLES[index];
    setSimState('transcribing');
    setCurrentQuestion(sample.question);
    setCurrentAnswer(sample.answer);
    setFeedback(null);

    setTimeout(() => {
      setSimState('thinking');
      setTimeout(() => {
        setSimState('answering');
      }, 700);
    }, 900);
  };

  const handleNext = () => {
    handleSelectSample((sampleIndex + 1) % DEMO_SAMPLES.length);
  };

  const handlePrev = () => {
    handleSelectSample((sampleIndex - 1 + DEMO_SAMPLES.length) % DEMO_SAMPLES.length);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    setIsPlaying(false);
    const qText = customInput;
    const customAns = {
      headline: "Feonix AI contextualized answer synthesized in real-time.",
      bullets: [
        "Situation: Ingested CV, project documentation, and role requirements for context.",
        "Action: Vector RAG matching retrieved precise STAR format key points.",
        `Result: Populated teleprompter HUD card for "${qText.slice(0, 40)}${qText.length > 40 ? '...' : ''}" under 1.2s.`
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: qText.split(' ').slice(0, 5)
    };

    setCustomInput('');
    setSimState('transcribing');
    setCurrentQuestion(qText);
    setCurrentAnswer(customAns);
    setFeedback(null);

    setTimeout(() => {
      setSimState('thinking');
      setTimeout(() => {
        setSimState('answering');
      }, 700);
    }, 900);
  };

  const handleCopy = () => {
    if (!currentAnswer) return;
    const textToCopy = `Question: ${currentQuestion}\nAnswer: ${currentAnswer.headline}\n${currentAnswer.bullets.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="sim-3d-section" id="copilot" ref={sectionRef}>
      <div className="sim-3d-container">
        
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Video size={14} className="pill-icon text-cyan" />
            <span>LIVE DEMO STREAM · SCROLL & WATCH</span>
          </div>
          <h2 className="section-title">
            Watch the <span className="gradient-text-cyan">HUD Teleprompter</span> Generate Live Answers
          </h2>
          <p className="section-subtitle">
            As you scroll, watch Feonix AI decode voice stream chunks and populate STAR teleprompter cards in sub-seconds.
          </p>
        </div>

        {/* 2-Column Side-by-Side Grid: Left = HUD Teleprompter Showcase, Right = 3D Neural Orbital Core */}
        <div className="sim-dual-side-grid">
          
          {/* LEFT SIDE: HUD Teleprompter Showcase Box */}
          <div
            ref={containerRef}
            className="hud-showcase-window standalone-hud-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: tilt.x === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          >
            {/* Live Video Meeting Background Image */}
            <div className="hud-video-bg-layer">
              <Image
                src="/copilot_live_preview.jpg"
                alt="Feonix AI Live Copilot Meeting Preview"
                fill
                sizes="(max-width: 1200px) 100vw, 600px"
                priority
                unoptimized={true}
                className="hud-video-bg-img"
                onError={(e) => { e.currentTarget.src = '/images/copilot_live_preview.jpg'; }}
              />
              <div className="hud-video-bg-overlay" />
            </div>

            {/* Floating HUD Teleprompter Overlay Widget */}
            <div className="hud-floating-overlay-widget standalone-widget">
              
              {/* Row 1: Top Toolbar */}
              <div className="hud-widget-toolbar">
                <div className="hud-tb-left">
                  <span className="hud-mic-record-indicator">
                    <span className="record-red-dot" />
                    <Mic size={14} className="mic-icon" />
                  </span>
                  
                  <div className="hud-tb-pills">
                    <button className="hud-action-pill active" type="button">
                      <span>Answer</span>
                      <kbd>⌘↵</kbd>
                    </button>
                    <button className="hud-action-pill" type="button">
                      <span>Screenshot</span>
                      <kbd>⇧⌘↵</kbd>
                    </button>
                    <button className="hud-action-pill" type="button">
                      <span>Chat</span>
                      <kbd>⌘⇧C</kbd>
                    </button>
                  </div>
                </div>

                <div className="hud-tb-right">
                  <span className="hud-tb-icon-btn" title="Drag / Move"><Move size={14} /></span>
                  <span className="hud-tb-icon-btn" title="Options"><MoreVertical size={14} /></span>
                  <button className="hud-end-session-btn" type="button">End</button>
                </div>
              </div>

              {/* Row 2: Live Transcript & Voice Audio Equalizer Bar */}
              <div className="hud-widget-transcript-strip">
                <div className="hud-eq-animated">
                  <span className="eq-bar bar-1" />
                  <span className="eq-bar bar-2" />
                  <span className="eq-bar bar-3" />
                  <span className="eq-bar bar-4" />
                </div>

                <div className="hud-chip-stream">
                  {simState === 'transcribing' ? (
                    <span className="transcribing-label">Listening to interviewer audio stream...</span>
                  ) : (
                    currentAnswer?.chips?.map((chip, idx) => (
                      <span key={idx} className="hud-word-chip animate-fade-in">{chip}</span>
                    ))
                  )}
                </div>

                <div className="hud-strip-controls">
                  <button className="hud-strip-clear-btn" type="button">
                    Clear <kbd>⌘⇧⌫</kbd>
                  </button>
                  <span className="hud-expand-icon"><Maximize2 size={13} /></span>
                </div>
              </div>

              {/* Row 3: Teleprompter Answer Card Box */}
              <div className="hud-widget-teleprompter-card">
                
                {/* Teleprompter Card Toolbar Navigation */}
                <div className="hud-card-nav-bar">
                  <div className="nav-arrows">
                    <button className="nav-arrow-btn" type="button" onClick={handlePrev} title="Previous Question"><ArrowLeft size={13} /></button>
                    <button className="nav-arrow-btn" type="button" onClick={handleNext} title="Next Question"><ArrowRight size={13} /></button>
                    <span className="nav-card-counter">{sampleIndex + 1} / {DEMO_SAMPLES.length}</span>
                  </div>
                  <div className="nav-actions">
                    <button className="hud-card-clear-btn" type="button">
                      Clear <kbd>⌘C</kbd>
                    </button>
                    <button className="hud-card-expand-btn" type="button">
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>

                {/* State: Thinking / Synthesizing */}
                {simState === 'thinking' && (
                  <div className="hud-thinking-box">
                    <RefreshCw size={22} className="animate-spin text-cyan" />
                    <span>Synthesizing RAG Context & STAR Answer...</span>
                  </div>
                )}

                {/* State: Transcribing */}
                {simState === 'transcribing' && (
                  <div className="hud-transcribing-box">
                    <div className="pulse-dots">
                      <span className="p-dot d1" />
                      <span className="p-dot d2" />
                      <span className="p-dot d3" />
                    </div>
                    <span>Decoding speech audio chunks in sub-second pipeline...</span>
                  </div>
                )}

                {/* State: Answering / Teleprompter Display */}
                {simState === 'answering' && currentAnswer && (
                  <div className="hud-qa-content animate-fade-in">
                    {/* Question Row */}
                    <div className="hud-q-row">
                      <div className="q-text">
                        <span className="q-icon">💬</span>
                        <span className="q-label">Question:</span>
                        <span className="q-body">{currentQuestion}</span>
                      </div>
                      <button className="q-copy-btn" onClick={handleCopy} title="Copy Answer">
                        <Copy size={13} />
                        {copied && <span className="copied-tooltip">Copied!</span>}
                      </button>
                    </div>

                    {/* Answer Headline */}
                    <div className="hud-a-headline-row">
                      <span className="star-icon">⭐</span>
                      <span className="a-label">Answer:</span>
                      <span className="a-headline">{currentAnswer.headline}</span>
                    </div>

                    {/* STAR Bullets */}
                    <div className="hud-a-bullets-list">
                      {currentAnswer.bullets?.map((b, i) => (
                        <div key={i} className="bullet-item">
                          <span className="bullet-dot">•</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer: Timestamp & Feedback */}
                    <div className="hud-card-footer">
                      <span className="footer-timestamp">Answer · {currentAnswer.time}</span>
                      <div className="footer-thumbs">
                        <button
                          type="button"
                          className={`thumb-btn ${feedback === 'like' ? 'active' : ''}`}
                          onClick={() => setFeedback('like')}
                        >
                          <ThumbsUp size={13} />
                        </button>
                        <button
                          type="button"
                          className={`thumb-btn ${feedback === 'dislike' ? 'active' : ''}`}
                          onClick={() => setFeedback('dislike')}
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* RIGHT SIDE: 3D Neural Orbital Core Canvas Stage */}
          <div className="sim-solar-3d-stage sim-solar-side">
            <div className="sim-solar-label">
              <span className="solar-live-dot" />
              <span>3D Neural Orbital Core — Live</span>
            </div>
            <Hero3DCanvas />
          </div>

        </div>

      </div>
    </section>
  );
}
