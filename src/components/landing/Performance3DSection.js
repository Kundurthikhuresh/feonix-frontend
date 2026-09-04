"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Gauge, Play, Activity, Clock, Zap, Cpu, Server, CheckCircle2, Database } from 'lucide-react';

const LatencyWaveformCanvas = dynamic(() => import('../3d/LatencyWaveformCanvas'), {
  ssr: false,
  loading: () => <div className="performance-canvas-placeholder" />
});

const BENCHMARK_SAMPLES = [
  {
    title: 'Distributed Raft Consensus',
    query: 'Explain how leader election and log replication work in Raft consensus.',
    sttMs: 24,
    ragMs: 22,
    llmMs: 39,
    totalMs: 85
  },
  {
    title: 'Dynamic Programming (LRU Cache)',
    query: 'How to implement LRU cache with O(1) get and put time complexity in C++?',
    sttMs: 28,
    ragMs: 25,
    llmMs: 41,
    totalMs: 94
  },
  {
    title: 'System Design (Kafka vs RabbitMQ)',
    query: 'Compare message queue persistence and partitioned log architecture in Kafka.',
    sttMs: 26,
    ragMs: 21,
    llmMs: 38,
    totalMs: 85
  }
];

export default function Performance3DSection() {
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  const sample = BENCHMARK_SAMPLES[activeSampleIdx];

  const handleRunBenchmark = () => {
    setIsRunningBenchmark(true);
    setBenchmarkResult(null);

    setTimeout(() => {
      setIsRunningBenchmark(false);
      setBenchmarkResult({
        stt: sample.sttMs,
        rag: sample.ragMs,
        llm: sample.llmMs,
        total: sample.totalMs
      });
    }, 1800);
  };

  return (
    <section className="performance-3d-section">
      <div className="performance-glow-bg" />

      <div className="performance-container">
        {/* Header */}
        <div className="performance-header">
          <div className="performance-pill-badge">
            <Gauge size={14} />
            <span>ULTRA-LOW LATENCY TELEPROMPTER ARCHITECTURE</span>
          </div>
          <h2 className="performance-main-heading">
            Sub-100ms Response Speed. Zero Awkward Pauses.
          </h2>
          <p className="performance-sub-heading">
            While generic AI tools take 1.5 to 3 seconds to generate answers, Feonix AI uses localized audio streaming & parallel neural decoders to output answers in under 95ms.
          </p>
        </div>

        {/* Speed Comparison Banner */}
        <div className="performance-comparison-card">
          <div className="comparison-grid">
            {/* Feonix AI Metric */}
            <div className="feonix-speed-box">
              <div className="speed-box-top">
                <span className="speed-title-cyan">
                  <Zap size={16} />
                  Feonix AI Teleprompter Engine
                </span>
                <span className="speed-tag-cyan">ULTRA FAST</span>
              </div>
              <div className="speed-number-cyan">85 - 95 ms</div>
              <div className="speed-bar-track">
                <div className="speed-bar-fill-cyan" />
              </div>
              <p className="speed-desc">
                Instant visual response as interviewer speaks — continuous stream.
              </p>
            </div>

            {/* Competitor Metric */}
            <div className="competitor-speed-box">
              <div className="speed-box-top">
                <span className="speed-title-rose">
                  <Clock size={16} />
                  Generic Competitor LLMs
                </span>
                <span className="speed-tag-rose">HIGH LATENCY</span>
              </div>
              <div className="speed-number-rose">1,850 ms+</div>
              <div className="speed-bar-track">
                <div className="speed-bar-fill-rose" />
              </div>
              <p className="speed-desc">
                2+ second latency forces noticeable pauses during live interviews.
              </p>
            </div>
          </div>
        </div>

        {/* 3D Waveform Canvas + Benchmark Interactive Panel */}
        <div className="performance-main-grid">
          {/* Left Column: 3D Waveform Ribbon Canvas */}
          <div className="performance-waveform-box">
            <div className="waveform-box-top">
              <div className="waveform-badge">
                <Activity size={14} />
                <span>Real-Time 3D Audio Frequency Waveform</span>
              </div>
              <span className="sampling-text">Sampling: 48kHz Stereo</span>
            </div>

            <div className="performance-canvas-wrapper">
              <LatencyWaveformCanvas isBenchmarkRunning={isRunningBenchmark} />
            </div>

            <div className="waveform-box-footer">
              <span>Dynamic Audio Stream Decoders</span>
              <span>Zero Context Dropping</span>
            </div>
          </div>

          {/* Right Column: Benchmark Controls */}
          <div className="performance-benchmark-card">
            <h3 className="benchmark-card-title">
              <Cpu size={20} />
              Live Benchmark Simulator
            </h3>

            {/* Sample Question Picker */}
            <div className="benchmark-picker-wrap">
              <label className="picker-label">Select Test Prompt</label>
              {BENCHMARK_SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveSampleIdx(idx);
                    setBenchmarkResult(null);
                  }}
                  className={`prompt-chip-btn ${activeSampleIdx === idx ? 'active' : ''}`}
                >
                  <div className="prompt-chip-title">{s.title}</div>
                  <div className="prompt-chip-query">{s.query}</div>
                </button>
              ))}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleRunBenchmark}
              disabled={isRunningBenchmark}
              className="benchmark-run-btn"
            >
              {isRunningBenchmark ? (
                <>
                  <Activity size={16} className="spin-icon" />
                  <span>Executing Neural Benchmark...</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-icon" />
                  <span>Run Real-Time Speed Test</span>
                </>
              )}
            </button>

            {/* Benchmark Results Display */}
            {benchmarkResult && (
              <div className="benchmark-results-box">
                <div className="result-row">
                  <span className="result-label">
                    <Server size={14} /> Speech-to-Text Stream
                  </span>
                  <span className="result-val cyan">{benchmarkResult.stt} ms</span>
                </div>
                <div className="result-row">
                  <span className="result-label">
                    <Database size={14} /> Vector RAG Search
                  </span>
                  <span className="result-val purple">{benchmarkResult.rag} ms</span>
                </div>
                <div className="result-row">
                  <span className="result-label">
                    <Zap size={14} /> Neural LLM Synthesis
                  </span>
                  <span className="result-val emerald">{benchmarkResult.llm} ms</span>
                </div>
                <div className="result-total-row">
                  <span className="total-label">
                    <CheckCircle2 size={16} /> Total Latency
                  </span>
                  <span className="total-val">{benchmarkResult.total} ms</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
