"use client";

import React from 'react';
import Image from 'next/image';
import {
  Zap,
  Mic,
  Activity,
  Camera,
  FileText,
  Code2,
  Briefcase,
  Check,
  Cpu,
  Target,
  BarChart3,
} from 'lucide-react';
import AIProcessingVisual from './AIProcessingVisual';

const FEATURES = [
  {
    id: 'copilot',
    title: 'Live Interview Copilot',
    description:
      'Floating stealth teleprompter providing live answers, architecture frameworks, and system design trade-offs directly during technical and executive rounds.',
    icon: Zap,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    image: '/copilot_live_preview.jpg',
    imageAlt: 'Live In-Call Stealth HUD Teleprompter Preview',
    points: ['100% Screen-share invisible', 'Dual audio channel transcription', 'Sub-1.2s answer delivery'],
  },
  {
    id: 'coach',
    title: 'AI Mock Interview Coach',
    description:
      'Practice verbally before real interviews. An intelligent conversational interviewer asks probing follow-ups, analyzes speech cadence, and flags filler words.',
    icon: Mic,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    image: '/ai_robot_avatar_speaking.jpg',
    imageAlt: 'AI Conversational Mock Interviewer Coach Avatar',
    points: ['Realistic spoken technical follow-ups', 'STAR methodology evaluation', 'Filler word & pacing detector'],
  },
  {
    id: 'speech_3d',
    title: 'Real-Time Speech-to-Text',
    description:
      'Low-latency dual-stream audio processor that captures interviewer audio and candidate microphone concurrently with high technical domain accuracy.',
    icon: Activity,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    is3DVisual: true, // Embeds the 3D neural audio canvas
    points: ['Zero local or remote audio recording storage', 'Custom technical vocabulary tuning', 'Instant question boundary detection'],
  },
  {
    id: 'screenshot',
    title: 'Screenshot Intelligence',
    description:
      'Instantly extract code problems, complex architecture diagrams, or assessment questions from any screen region using global customizable hotkeys.',
    icon: Camera,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    image: '/online_assessment_desk.jpg',
    imageAlt: 'Online Assessment OCR Problem Extractor',
    points: ['CoderPad, HackerRank & LeetCode OCR', 'System design flowchart parsing', 'Instant algorithmic edge-case extraction'],
  },
  {
    id: 'resume',
    title: 'Resume Intelligence',
    description:
      'Every answer is dynamically calibrated to your uploaded resume and target job requirements, making your responses authentic, specific, and convincing.',
    icon: FileText,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    image: '/images/feonix_ai_career_suite.jpg',
    imageAlt: 'Resume Vector Intelligence and Past Project Alignment',
    points: ['Connects questions to past projects', 'Job description gap analysis', 'Recruiter keyword alignment'],
  },
  {
    id: 'coding',
    title: 'Live Coding Assistance',
    description:
      'Generate syntax-highlighted, optimal code solutions with time and space complexity explanations across all primary software engineering languages.',
    icon: Code2,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    image: '/coding_copilot_laptop_demo.jpg',
    imageAlt: 'Live IDE Coding Copilot & Algorithm Solver',
    points: ['Python, JS/TS, Go, Java, C++, SQL', 'O(1) & O(N) optimized data structures', 'Edge-case test condition breakdowns'],
  },
  {
    id: 'career_suite',
    title: 'End-to-End Career Suite',
    description:
      'Complete career readiness pipeline with an automated ATS resume builder, tailored cover letter generation, and unified application pipeline tracking.',
    icon: Briefcase,
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.12)',
    image: '/remote_assist_dashboard.jpg',
    imageAlt: 'Career Suite Application Lifecycle Dashboard',
    points: ['ATS score verification algorithms', 'Role-matched cover letter drafter', 'Integrated interview lifecycle pipeline'],
  },
  {
    id: 'job_analyzer',
    title: 'Job Description & Gap Matcher',
    description:
      'Analyze target job descriptions against your experience to identify missing competencies, high-priority keywords, and custom talking points.',
    icon: Target,
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    image: '/system_design_interview_laptop.jpg',
    imageAlt: 'Job Description Skill Gap Matrix Analysis',
    points: ['Automated JD keyword extraction', 'Skill gap mitigation strategies', 'Recruiter scoring rubric alignment'],
  },
  {
    id: 'call_analytics',
    title: 'Speech Cadence & Call Analytics',
    description:
      'Review complete post-session verbatim transcripts, measure speaking speed (WPM), count filler words ("um", "like"), and grade delivery clarity.',
    icon: BarChart3,
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
    image: '/coach_mode_preview.jpg',
    imageAlt: 'Post-Call Speech Cadence and WPM Analytics',
    points: ['Searchable verbatim call transcripts', 'WPM speech pacing & filler tracker', 'Objective STAR performance scorecard'],
  },
];

export default function FeatureShowcaseGrid() {
  return (
    <section id="features" style={{ padding: '76px 0 68px 0', position: 'relative' }}>
      <div className="px-container">
        <div className="px-section-header">
          <div className="px-section-tag">
            <Cpu size={13} />
            <span>Core Capabilities</span>
          </div>
          <h2 className="px-section-title">
            Engineered for High-Stakes <br />
            <span className="px-section-title-highlight">Technical Mastery</span>
          </h2>
          <p className="px-section-desc">
            Nine interconnected intelligence systems purpose-built to give software engineers, engineering managers, and technical architects absolute confidence.
          </p>
        </div>

        <div className="px-features-grid">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="px-feature-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div
                      className="px-feature-icon-box"
                      style={{ background: feat.bgColor, color: feat.color, marginBottom: 0 }}
                    >
                      <Icon size={22} />
                    </div>
                    {feat.is3DVisual ? (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 8px', borderRadius: '4px' }}>
                        3D Stream
                      </span>
                    ) : (
                      <span className="px-feature-badge-pill" style={{ fontSize: '10.5px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                        Active Engine
                      </span>
                    )}
                  </div>

                  <h3 className="px-feature-title">
                    {feat.title}
                  </h3>
                  <p className="px-feature-desc">
                    {feat.description}
                  </p>

                  {/* 3D Visual in the Speech Engine Feature */}
                  {feat.is3DVisual && (
                    <div style={{ margin: '0 0 16px 0', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <AIProcessingVisual height={130} />
                    </div>
                  )}

                  {/* High Quality Feature Preview Image for other cards */}
                  {!feat.is3DVisual && feat.image && (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '130px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: '#070a12',
                      }}
                    >
                      <Image
                        src={feat.image}
                        alt={feat.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 360px"
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          filter: 'brightness(0.92) contrast(1.05)',
                          transition: 'transform 0.4s ease',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, transparent 40%, rgba(7, 10, 18, 0.75) 100%)',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  )}
                </div>

                <ul className="px-feature-points" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {feat.points.map((pt, idx) => (
                    <li key={idx} className="px-feature-point">
                      <Check size={14} style={{ color: feat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '12.5px' }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
