"use client";

import { useState, useRef } from 'react';
import { Play, Send, Activity, Sparkles, CheckCircle2, Terminal } from 'lucide-react';

const SIM_SAMPLES = [
  {
    id: 1,
    label: "Process vs Thread?",
    question: "Can you explain the difference between a process and a thread?",
    answer: {
      kind: "System Architecture",
      content: "<strong>Process:</strong> An independent executing program instance with its own private virtual memory space (stack, heap). Heavyweight, higher overhead for context switching.<br/><br/><strong>Thread:</strong> A path of execution within a process. Multiple threads share process resources. Lightweight, fast data sharing, but concurrency synchronization is required.",
      confidence: "98%",
      source: "OS Concepts & Kernel Architecture"
    }
  },
  {
    id: 2,
    label: "JS Event Loop?",
    question: "How does the event loop work in JavaScript?",
    answer: {
      kind: "JavaScript Runtime",
      content: "<strong>Event Loop:</strong> A continuous monitoring loop that coordinates asynchronous callback execution.<br/><br/><strong>Execution Flow:</strong><br/>1. Runs synchronous call stack frames.<br/>2. Resolves all Microtasks (Promises, queueMicrotask) completely.<br/>3. Polls and processes Macrotasks (timeouts, intervals, I/O events) from Callback Queue.",
      confidence: "96%",
      source: "V8 Core Architecture"
    }
  },
  {
    id: 3,
    label: "Virtual DOM Diffing?",
    question: "What is the Virtual DOM and why is it fast?",
    answer: {
      kind: "React Framework",
      content: "<strong>Virtual DOM:</strong> A lightweight JavaScript object tree mapping the real DOM nodes.<br/><br/><strong>Diffing & Batching:</strong> React computes the difference between old and new state (diffing algorithm) and batches real DOM updates (reconciliation) in a single reflow/repaint to bypass expensive browser layout engines.",
      confidence: "95%",
      source: "React Fiber Architecture"
    }
  }
];

export default function InteractiveSimulator3D() {
  const [simState, setSimState] = useState('idle'); // 'idle', 'transcribing', 'thinking', 'answering'
  const [simActiveId, setSimActiveId] = useState(null);
  const [simQuestion, setSimQuestion] = useState('');
  const [simAnswer, setSimAnswer] = useState(null);
  const [simInput, setSimInput] = useState('');

  // 3D Tilt Physics
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 8; // subtle 8 deg tilt
    const rotateX = -((y - yc) / yc) * 8;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const runSimulation = (id, questionText, answerObj) => {
    if (simState === 'transcribing' || simState === 'thinking') return;

    setSimActiveId(id);
    setSimState('transcribing');
    setSimQuestion('');
    setSimAnswer(null);

    let currentIdx = 0;
    const typeInterval = setInterval(() => {
      if (currentIdx < questionText.length) {
        setSimQuestion((prev) => prev + questionText.charAt(currentIdx));
        currentIdx++;
      } else {
        clearInterval(typeInterval);
        setSimState('thinking');

        setTimeout(() => {
          setSimState('answering');
          setSimAnswer(answerObj);
        }, 900);
      }
    }, 25);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const customQ = simInput;
    const customAns = {
      kind: "Real-Time AI Assistant",
      content: `<strong>Custom Response:</strong> "${customQ}" analyzed successfully.<br/><br/>The AI Copilot evaluates this topic by indexing your CV and active documents to generate precise context-aware answers in real-time.`,
      confidence: "94%",
      source: "Local Sandbox Agent"
    };

    setSimInput('');
    runSimulation('custom', customQ, customAns);
  };

  return (
    <section className="sim-3d-section" id="copilot">
      <div className="sim-3d-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Terminal size={14} className="pill-icon text-cyan" />
            <span>LIVE INTERACTIVE SIMULATOR</span>
          </div>
          <h2 className="section-title">
            Test the <span className="gradient-text-cyan">HUD Teleprompter</span> Live
          </h2>
          <p className="section-subtitle">
            Experience the sub-second voice chunk decoding and instant teleprompter HUD card generation. Click a question below or test with your own prompt.
          </p>
        </div>

        {/* 3D Interactive Simulator Glass Box */}
        <div
          ref={containerRef}
          className="sim-3d-glass-box"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {/* Left Column: Interactive Controls */}
          <div className="sim-left-panel">
            <div className="sim-panel-header">
              <span className="sim-badge">INTERACTIVE CONTROLS</span>
              <h3>Select a Live Cue</h3>
              <p>Simulate an interviewer asking a question in real-time:</p>
            </div>

            <div className="sim-sample-buttons">
              {SIM_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  className={`sim-sample-btn ${simActiveId === sample.id ? 'is-active' : ''}`}
                  onClick={() => runSimulation(sample.id, sample.question, sample.answer)}
                  disabled={simState === 'transcribing' || simState === 'thinking'}
                  type="button"
                >
                  <span className="btn-label">{sample.label}</span>
                  <Play size={14} className="btn-play-icon" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form className="sim-custom-form" onSubmit={handleCustomSubmit}>
              <input
                type="text"
                className="sim-custom-input"
                placeholder="Or type any custom interview question…"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                disabled={simState === 'transcribing' || simState === 'thinking'}
              />
              <button
                type="submit"
                className="sim-custom-submit-btn"
                disabled={simState === 'transcribing' || simState === 'thinking'}
                aria-label="Submit Question"
              >
                <Send size={15} />
              </button>
            </form>

            {/* Simulated Voice Waveform Indicator */}
            <div className={`sim-wave-status-bar ${simState === 'transcribing' ? 'is-streaming' : ''}`}>
              <div className="sim-equalizer-bars">
                <span className="eq-bar eq-1" />
                <span className="eq-bar eq-2" />
                <span className="eq-bar eq-3" />
                <span className="eq-bar eq-4" />
                <span className="eq-bar eq-5" />
              </div>
              <span className="sim-status-label">
                {simState === 'transcribing' && 'Transcribing Voice Chunk Stream…'}
                {simState === 'thinking' && 'AI Model Generating Contextual Answer…'}
                {simState === 'answering' && 'HUD Answer Synced & Displayed!'}
                {simState === 'idle' && 'Audio Stream Standby — Click a question above'}
              </span>
            </div>
          </div>

          {/* Right Column: Holographic Teleprompter HUD Simulation */}
          <div className="sim-right-hud-panel">
            {/* Tally Bar */}
            <div className="hud-status-bar">
              <div className="hud-tally-indicator">
                <span className={`hud-tally-dot ${simState === 'transcribing' ? 'transcribing' : simState === 'answering' ? 'ready' : ''}`} />
                <span className="hud-tally-text">
                  {simState === 'idle' && 'STATUS: STANDBY'}
                  {simState === 'transcribing' && 'STATUS: LISTENING & TRANSCRIBING'}
                  {simState === 'thinking' && 'STATUS: RAG SYNTHESIS'}
                  {simState === 'answering' && 'STATUS: HUD TELEPROMPTER READY'}
                </span>
              </div>
              <span className="hud-latency-pill">PING: 14MS</span>
            </div>

            {/* Live Question Cue Box */}
            <div className={`hud-cue-box ${simQuestion ? 'has-content' : 'is-empty'}`}>
              <div className="hud-box-tag">LIVE DETECTED CUE</div>
              <p className="hud-cue-text">
                {simQuestion ? `"${simQuestion}"` : 'Listening for interviewer voice cues…'}
              </p>
            </div>

            {/* Real-time Answer Card */}
            <div className="hud-answer-card">
              {simState === 'thinking' && (
                <div className="hud-thinking-state">
                  <div className="hud-spinner" />
                  <span className="thinking-text">Synthesizing Answer Card via RAG Context…</span>
                </div>
              )}

              {simState === 'answering' && simAnswer && (
                <div className="hud-answer-content animate-fade-in">
                  <div className="hud-answer-badge">
                    <Sparkles size={13} />
                    <span>{simAnswer.kind.toUpperCase()}</span>
                  </div>
                  <div
                    className="hud-answer-body"
                    dangerouslySetInnerHTML={{ __html: simAnswer.content }}
                  />
                  <div className="hud-answer-meta-row">
                    <span className="meta-confidence">
                      <CheckCircle2 size={13} className="text-emerald" />
                      Confidence: <strong>{simAnswer.confidence}</strong>
                    </span>
                    <span className="meta-source">Source: {simAnswer.source}</span>
                  </div>
                </div>
              )}

              {(simState === 'idle' || simState === 'transcribing') && (
                <div className="hud-placeholder-state">
                  <Terminal size={32} className="placeholder-icon" />
                  <p>The teleprompter answer card will instantly populate here in low-latency formatted teleprompter scale.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
