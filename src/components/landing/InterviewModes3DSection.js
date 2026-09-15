"use client";

import { useState, useEffect } from 'react';
import { Code2, Server, Terminal, Users, UserCheck, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

const MODES = [
  {
    id: 'coding',
    title: 'Coding Interview',
    tag: 'ROUND 01',
    icon: Code2,
    color: '#00f5ff',
    steps: ['Understand Problem', 'Approach & Data Structures', 'Time & Space Complexity', 'Code Implementation', 'Edge Case Analysis', 'Optimization']
  },
  {
    id: 'system-design',
    title: 'System Design',
    tag: 'ROUND 02',
    icon: Server,
    color: '#8b5cf6',
    steps: ['Clarify Functional Requirements', 'High-Level Architecture', 'Database & Schema Selection', 'Scaling & Sharding Strategy', 'Reliability & Failover', 'Trade-offs Analysis']
  },
  {
    id: 'tech',
    title: 'Technical Deep-Dive',
    tag: 'ROUND 03',
    icon: Terminal,
    color: '#10b981',
    steps: ['Domain Concepts', 'Memory & Thread Concurrency', 'OS Primitives', 'Network Protocols', 'Framework Internals', 'Performance Bottlenecks']
  },
  {
    id: 'behavioral',
    title: 'Behavioral Round',
    tag: 'ROUND 04',
    icon: Users,
    color: '#ec4899',
    steps: ['Situation (Context)', 'Task (Challenge)', 'Action (Leadership)', 'Result (Quantified Outcome)', 'Key Learnings', 'Follow-up Questions']
  },
  {
    id: 'hr',
    title: 'HR Screening',
    tag: 'ROUND 05',
    icon: UserCheck,
    color: '#f59e0b',
    steps: ['Background Story', 'Career Motivation', 'Compensation Expectation', 'Team Culture Fit', 'Company Values', 'Notice Period']
  },
  {
    id: 'manager',
    title: 'Managerial Round',
    tag: 'ROUND 06',
    icon: Briefcase,
    color: '#38bdf8',
    steps: ['Project Ownership', 'Conflict Resolution', 'Cross-Functional Sync', 'Mentorship Impact', 'Strategic Roadmap', 'Product Execution']
  }
];

export default function InterviewModes3DSection() {
  const [activeHoverIndex, setActiveHoverIndex] = useState(1); // default System Design
  const [selectedMode, setSelectedMode] = useState(MODES[1]);
  const [isUserHovering, setIsUserHovering] = useState(false);

  // Auto-cycles the hover effect across cards every two seconds (card by card)
  useEffect(() => {
    if (isUserHovering) return;

    const interval = setInterval(() => {
      setActiveHoverIndex((prev) => {
        const next = (prev + 1) % MODES.length;
        setSelectedMode(MODES[next]);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isUserHovering]);

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

        {/* 6 Mode Selector Cards Grid with Enlarged Cards & 2s Auto-Hover Cycle */}
        <div
          onMouseEnter={() => setIsUserHovering(true)}
          onMouseLeave={() => setIsUserHovering(false)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '20px',
            marginBottom: '44px'
          }}
        >
          {MODES.map((mode, idx) => {
            const Icon = mode.icon;
            const isHoveredOrActive = activeHoverIndex === idx;

            return (
              <div
                key={mode.id}
                onClick={() => {
                  setActiveHoverIndex(idx);
                  setSelectedMode(mode);
                }}
                onMouseEnter={() => {
                  setIsUserHovering(true);
                  setActiveHoverIndex(idx);
                  setSelectedMode(mode);
                }}
                style={{
                  position: 'relative',
                  padding: '28px 24px',
                  minHeight: '175px',
                  borderRadius: '20px',
                  background: isHoveredOrActive
                    ? `linear-gradient(150deg, rgba(20, 29, 52, 0.98) 0%, ${mode.color}25 100%)`
                    : 'rgba(10, 14, 26, 0.75)',
                  border: `2px solid ${isHoveredOrActive ? mode.color : 'rgba(255, 255, 255, 0.1)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isHoveredOrActive
                    ? `0 20px 42px ${mode.color}45, 0 0 26px ${mode.color}25, inset 0 1px 0 rgba(255,255,255,0.15)`
                    : 'none',
                  transform: isHoveredOrActive ? 'translateY(-10px) scale(1.035)' : 'translateY(0) scale(1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden'
                }}
              >
                {/* Top Row: Icon + Monospace Round Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: isHoveredOrActive ? `${mode.color}30` : `${mode.color}15`,
                      border: `1.5px solid ${isHoveredOrActive ? mode.color : `${mode.color}40`}`,
                      color: mode.color,
                      display: 'grid',
                      placeItems: 'center',
                      transition: 'all 0.35s ease',
                      boxShadow: isHoveredOrActive ? `0 0 20px ${mode.color}60` : 'none'
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      letterSpacing: '0.08em',
                      color: isHoveredOrActive ? mode.color : '#64748b',
                      background: isHoveredOrActive ? `${mode.color}18` : 'rgba(255, 255, 255, 0.04)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: `1px solid ${isHoveredOrActive ? `${mode.color}40` : 'transparent'}`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {mode.tag}
                  </span>
                </div>

                {/* Card Title */}
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: isHoveredOrActive ? '#ffffff' : '#e2e8f0',
                      margin: '18px 0 0 0',
                      lineHeight: '1.3',
                      letterSpacing: '-0.01em',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {mode.title}
                  </h3>
                </div>

                {/* Bottom Active Glow Bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: isHoveredOrActive ? mode.color : 'transparent',
                    boxShadow: isHoveredOrActive ? `0 0 14px ${mode.color}` : 'none',
                    transition: 'all 0.35s ease'
                  }}
                />
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
