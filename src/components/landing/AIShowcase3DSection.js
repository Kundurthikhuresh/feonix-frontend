"use client";

import dynamic from 'next/dynamic';
import { Cpu, Network, Workflow, CheckCircle2 } from 'lucide-react';


const NeuralNetworkCanvas = dynamic(() => import('../3d/NeuralNetworkCanvas'), {
  ssr: false,
  loading: () => (
    <div className="neural-fallback-loading">
      <div className="neural-spin-ring" />
      <span>Loading Neural Mesh Visualization…</span>
    </div>
  ),
});

const SHOWCASE_NODES = [
  {
    title: 'AI Models (Multi-LLM)',
    desc: 'Powered by GPT-4o & specialized coding agents optimized for technical problem-solving.',
    color: '#8b5cf6',
  },
  {
    title: 'Automation & Cues',
    desc: 'Autonomous Voice Activity Detection (VAD) automatically identifies interview cues.',
    color: '#00f5ff',
  },
  {
    title: 'Analytics & Telemetry',
    desc: 'Deep post-call telemetry measuring speech pace, question coverage, and clarity metrics.',
    color: '#38bdf8',
  },
  {
    title: 'Prediction Engine',
    desc: 'Anticipates follow-up interview questions and pre-warms relevant system design diagrams.',
    color: '#a855f7',
  },
  {
    title: 'Adaptive Intelligence',
    desc: 'Dynamically parses uploaded resumes and CVs to personalize every suggested response.',
    color: '#10b981',
  },
];

export default function AIShowcase3DSection() {
  return (
    <section className="ai-showcase-3d-section" id="showcase">
      {/* Background ambient lighting */}
      <div className="showcase-ambient-glow" />

      <div className="ai-showcase-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Network size={14} className="pill-icon text-cyan" />
            <span>INTERACTIVE NEURAL NETWORK</span>
          </div>
          <h2 className="section-title">
            The Intelligent <span className="gradient-text-cyan">3D AI Core</span>
          </h2>
          <p className="section-subtitle">
            An interconnected multi-agent topology that maps voice signals, semantic context, and real-time knowledge graphs simultaneously in 3D space.
          </p>
        </div>

        {/* 3D Visualization Main Stage */}
        <div className="showcase-visualization-wrapper">
          <div className="neural-canvas-frame">
            <NeuralNetworkCanvas />
          </div>

          {/* Connected Capabilities Grid */}
          <div className="showcase-nodes-grid">
            {SHOWCASE_NODES.map((node, i) => (
              <div key={i} className="showcase-node-pill">
                <div className="node-indicator" style={{ background: node.color, boxShadow: `0 0 12px ${node.color}` }} />
                <div className="node-info">
                  <h4 className="node-title" style={{ color: node.color }}>{node.title}</h4>
                  <p className="node-desc">{node.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>



      </div>
    </section>
  );
}
