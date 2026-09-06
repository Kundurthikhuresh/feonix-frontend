"use client";

import { useState } from 'react';
import { Code2, Server, Terminal, Users, UserCheck, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

const MODES = [
  {
    id: 'coding',
    title: 'Coding Interview',
    icon: Code2,
    color: '#00f5ff',
    steps: ['Understand Problem', 'Approach & Data Structures', 'Time & Space Complexity', 'Code Implementation', 'Edge Case Analysis', 'Optimization']
  },
  {
    id: 'system-design',
    title: 'System Design',
    icon: Server,
    color: '#8b5cf6',
    steps: ['Clarify Functional Requirements', 'High-Level Architecture', 'Database & Schema Selection', 'Scaling & Sharding Strategy', 'Reliability & Failover', 'Trade-offs Analysis']
  },
  {
    id: 'tech',
    title: 'Technical Deep-Dive',
    icon: Terminal,
    color: '#10b981',
    steps: ['Domain Concepts', 'Memory & Thread Concurrency', 'OS Primitives', 'Network Protocols', 'Framework Internals', 'Performance Bottlenecks']
  },
  {
    id: 'behavioral',
    title: 'Behavioral Round',
    icon: Users,
    color: '#ec4899',
    steps: ['Situation (Context)', 'Task (Challenge)', 'Action (Leadership)', 'Result (Quantified Outcome)', 'Key Learnings', 'Follow-up Questions']
  },
  {
    id: 'hr',
    title: 'HR Screening',
    icon: UserCheck,
    color: '#f59e0b',
    steps: ['Background Story', 'Career Motivation', 'Compensation Expectation', 'Team Culture Fit', 'Company Values', 'Notice Period']
  },
  {
    id: 'manager',
    title: 'Managerial Round',
    icon: Briefcase,
    color: '#38bdf8',
    steps: ['Project Ownership', 'Conflict Resolution', 'Cross-Functional Sync', 'Mentorship Impact', 'Strategic Roadmap', 'Product Execution']
  }
];

export default function InterviewModes3DSection() {
  const [selectedMode, setSelectedMode] = useState(MODES[1]); // default System Design

  return (
    <section className="interview-modes-3d-section" style={{ position: 'relative', padding: '100px 24px', background: '#050814', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c084fc',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <Sparkles size={14} />
            <span>SPECIALIZED SOLUTION ENGINES</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Interactive <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interview Mode</span> Selector
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '660px', margin: '0 auto', lineHeight: '1.6' }}>
            Select your interview round type to adapt Feonix AI's RAG prompt structure and teleprompter formatting.
          </p>
        </div>

        {/* 6 Mode Selector Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode.id === mode.id;

            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode)}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 26, 0.75)',
                  border: `1.5px solid ${isSelected ? mode.color : 'rgba(255, 255, 255, 0.1)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isSelected ? `0 10px 30px ${mode.color}35` : 'none',
                  transform: isSelected ? 'translateY(-4px)' : 'none'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${mode.color}20`, border: `1px solid ${mode.color}50`, color: mode.color, display: 'grid', placeItems: 'center', marginBottom: '12px' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  {mode.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Dynamic Mode Answer Structure Breakdown Card */}
        <div
          style={{
            background: 'rgba(10, 14, 26, 0.9)',
            border: `1.5px solid ${selectedMode.color}50`,
            borderRadius: '24px',
            padding: '32px',
            backdropFilter: 'blur(24px)',
            boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 35px ${selectedMode.color}20`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '800', color: selectedMode.color, background: `${selectedMode.color}20`, padding: '4px 12px', borderRadius: '6px' }}>
              ACTIVE MODE: {selectedMode.title.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {selectedMode.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '800', color: selectedMode.color }}>
                  0{idx + 1}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
