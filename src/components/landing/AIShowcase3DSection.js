"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Video,
  ShieldCheck,
  Zap,
  Volume2,
  Mic,
  Activity,
  CheckCircle2
} from 'lucide-react';

const CAROUSEL_MODULES = [
  {
    id: 'remote-assist',
    tag: 'DUO MODE · REMOTE ASSIST',
    title: 'Remote Assist Live Screen',
    subtitle: 'Mentor & AI Co-Pilot Stream',
    description: 'Candidate in a 3-monitor live Zoom screen: remote mentor watches interviewer questions live and provides sub-second whisper guidance with AI.',
    image: '/remote_assist_dashboard.jpg',
    accent: '#8b5cf6',
    platform: 'Zoom Live Multi-Screen',
    interviewerName: 'Emily Chen (VP of Eng)',
    question: 'How do you handle distributed transactions and state consistency across microservices?',
    aiAnswer: 'Deploy the Saga Pattern with an Orchestrator, idempotent APIs, and 2-Phase Commit rollback compensation.',
    starPoints: [
      'Orchestrator Saga: Emits state events and manages compensation rollbacks.',
      'Idempotency Keys: Redis deduplication cache prevents double-execution.',
      'CDC Pipeline: Debezium + Kafka ensures at-least-once outbox delivery.'
    ]
  },
  {
    id: 'copilot',
    tag: 'REAL-TIME HUD · COPILOT',
    title: 'Interview Copilot Live Screen',
    subtitle: 'Sub-Second STAR Teleprompter',
    description: 'Candidate attending a live Microsoft Teams interview: Feonix AI stealth HUD listens to voice audio and streams STAR answers directly onto the laptop.',
    image: '/online_assessment_desk.jpg',
    accent: '#00f5ff',
    platform: 'MS Teams Technical Round',
    interviewerName: 'Sarah Jenkins (Staff SWE)',
    question: 'Walk me through how you resolved a high-concurrency Redis cache miss bottleneck.',
    aiAnswer: 'Implemented Singleflight mutex locking and probabilistic early expiration (XFetch) to slash P99 latency by 89%.',
    starPoints: [
      'Singleflight Mutex: 1 DB query per cache miss; 50k concurrent requests wait.',
      'Probabilistic TTL: Background workers refresh key before expiration.',
      'Result: P99 latency dropped from 420ms to 45ms under 50,000 QPS load.'
    ]
  },
  {
    id: 'coding-assistant',
    tag: 'ALGORITHMS · OA COPILOT',
    title: 'Live Pair Programming Screen',
    subtitle: 'LeetCode, CodeSignal & HackerRank',
    description: 'Candidate coding in a live HackerRank technical round: AI holographic overlay breaks down algorithm complexity and streams optimal code patterns.',
    image: '/coding_copilot_laptop_demo.jpg',
    accent: '#38bdf8',
    platform: 'HackerRank Live Pair Coding',
    interviewerName: 'Alex Rivera (Principal Engineer)',
    question: 'Can you optimize Two Sum II to run in linear O(N) time with strictly O(1) space?',
    aiAnswer: 'Use a Two-Pointer technique starting from indices 0 and N-1 on the pre-sorted array.',
    starPoints: [
      'Two Pointers: while(left < right) calculate current sum = arr[left] + arr[right].',
      'Adjustment: If sum > target decrement right; if sum < target increment left.',
      'Complexity: Strict O(N) linear time, O(1) constant auxiliary space.'
    ]
  },
  {
    id: 'system-design',
    tag: 'ARCHITECTURE · INFRA',
    title: 'System Design Architecture Screen',
    subtitle: 'High Availability & Sharding',
    description: 'Candidate presenting cloud microservice topologies on laptop: AI teleprompter streams database sharding and consistent hashing architecture.',
    image: '/system_design_interview_laptop.jpg',
    accent: '#10b981',
    platform: 'AWS System Design Round',
    interviewerName: 'David Zhao (Cloud Architect)',
    question: 'Explain your database partitioning and consistent hashing strategy for 100,000 QPS.',
    aiAnswer: 'Partition keys with MurmurHash3 virtual nodes across 16 shards with Multi-AZ read replicas.',
    starPoints: [
      'Consistent Hashing: 256 virtual nodes per shard prevent hot-key skewing.',
      'Read Replicas: Read-heavy traffic distributed across 3 Availability Zones.',
      'Write Resilience: Multi-master Active-Active clustering with conflict resolution.'
    ]
  }
];

export default function AIShowcase3DSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [stage, setStage] = useState('question'); // 'question' | 'ai_answering'
  const [typedQuestion, setTypedQuestion] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [videoTimerSec, setVideoTimerSec] = useState(1);

  const activeModule = CAROUSEL_MODULES[activeIdx];

  // Auto-Scroll Carousel Engine: moves to next interview video every 3 seconds
  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % CAROUSEL_MODULES.length);
    }, 3000);
    return () => clearInterval(carouselTimer);
  }, []);

  // 6-8s Simulated Video Lifecycle per Active Interview Card
  useEffect(() => {
    setStage('question');
    setTypedQuestion('');
    setTypedAnswer('');
    setVideoTimerSec(1);

    const questionText = activeModule.question;
    const answerText = activeModule.aiAnswer;

    // Timer counter: 01s -> 08s
    const clockTimer = setInterval(() => {
      setVideoTimerSec((prev) => (prev < 8 ? prev + 1 : 1));
    }, 1000);

    // Fast typewriter for live question speech
    let qIdx = 0;
    const qInterval = setInterval(() => {
      if (qIdx <= questionText.length) {
        setTypedQuestion(questionText.slice(0, qIdx));
        qIdx++;
      } else {
        clearInterval(qInterval);
        setStage('ai_answering');

        // Fast typewriter for live candidate teleprompter answer
        let aIdx = 0;
        const aInterval = setInterval(() => {
          if (aIdx <= answerText.length) {
            setTypedAnswer(answerText.slice(0, aIdx));
            aIdx++;
          } else {
            clearInterval(aInterval);
          }
        }, 15);
      }
    }, 18);

    return () => {
      clearInterval(clockTimer);
      clearInterval(qInterval);
    };
  }, [activeIdx]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + CAROUSEL_MODULES.length) % CAROUSEL_MODULES.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % CAROUSEL_MODULES.length);
  };

  const getCardStyle = (index) => {
    const total = CAROUSEL_MODULES.length;
    let diff = (index - activeIdx + total) % total;
    if (diff > total / 2) diff -= total;

    if (diff === 0) {
      return {
        transform: 'translate3d(0, 0, 0) scale(1)',
        opacity: 1,
        zIndex: 30,
        pointerEvents: 'auto',
        filter: 'brightness(1)',
      };
    } else if (diff === -1 || (diff === total - 1 && activeIdx === 0)) {
      return {
        transform: 'translate3d(-52%, 0, -180px) rotateY(20deg) scale(0.84)',
        opacity: 0.5,
        zIndex: 10,
        pointerEvents: 'auto',
        filter: 'brightness(0.7) blur(0.5px)',
      };
    } else if (diff === 1 || (diff === -(total - 1) && activeIdx === total - 1)) {
      return {
        transform: 'translate3d(52%, 0, -180px) rotateY(-20deg) scale(0.84)',
        opacity: 0.5,
        zIndex: 10,
        pointerEvents: 'auto',
        filter: 'brightness(0.7) blur(0.5px)',
      };
    } else {
      return {
        transform: 'translate3d(0, 0, -400px) scale(0.65)',
        opacity: 0,
        zIndex: 1,
        pointerEvents: 'none',
      };
    }
  };

  return (
    <section className="ai-showcase-3d-section" id="showcase">
      {/* Background ambient lighting */}
      <div className="showcase-ambient-glow" />

      <div className="ai-showcase-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <Video size={14} className="pill-icon text-cyan" />
            <span>LIVE INTERVIEW CONDUCTING VIDEO · SCROLLS EVERY 3s</span>
          </div>
          <h2 className="section-title">
            The Intelligent <span className="gradient-text-cyan">3D AI Core</span>
          </h2>
          <p className="section-subtitle">
            Watch live technical interview video sessions: interviewer asking questions in real-time, candidate attending, and Feonix AI generating sub-second STAR answers.
          </p>
        </div>

        {/* 3D Perspective Full-Bleed Video Carousel Stage */}
        <div className="lockedin-3d-carousel-stage">
          {/* Left Arrow Controls */}
          <button className="carousel-nav-btn nav-left" onClick={handlePrev} type="button" title="Previous Video">
            <ChevronLeft size={24} />
          </button>

          {/* Cards Track Container */}
          <div className="carousel-3d-cards-wrapper">
            {CAROUSEL_MODULES.map((item, idx) => {
              const isCenter = idx === activeIdx;
              const cardStyle = getCardStyle(idx);

              return (
                <div
                  key={item.id}
                  className={`carousel-3d-card-item ${isCenter ? 'is-active-center' : ''}`}
                  style={cardStyle}
                  onClick={() => setActiveIdx(idx)}
                >
                  <div
                    className="card-glass-body card-fullbleed-body"
                    style={{ borderColor: isCenter ? item.accent : 'rgba(255, 255, 255, 0.15)' }}
                  >
                    {/* Top Right Expand Icon */}
                    <div className="card-top-status-bar">
                      <div className="card-top-action-right">
                        <div className="action-circle">
                          <ExternalLink size={14} />
                        </div>
                      </div>
                    </div>

                    {/* Full-Bleed Crystal Clear Interview Stream Canvas */}
                    <div className="card-fullbleed-viewport">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={960}
                        height={600}
                        priority={idx === 0 || idx === 1}
                        unoptimized={true}
                        className="card-fullbleed-img"
                        onError={(e) => { e.currentTarget.src = `/images${item.image}`; }}
                      />
                    </div>

                    {/* Sleek Bottom Caption Info Layer */}
                    <div className="card-bottom-info-overlay">
                      <div className="card-caption-left">
                        <div className="card-category-pill" style={{ borderColor: `${item.accent}60`, color: item.accent }}>
                          <span className="cat-dot" style={{ background: item.accent }} />
                          <span>{item.tag}</span>
                        </div>
                        <h3 className="card-main-title">{item.title}</h3>
                        <p className="card-main-desc">{item.description}</p>
                      </div>

                      <div className="card-caption-right">
                        <span className="stealth-indicator-tag">
                          <ShieldCheck size={14} className="text-green" />
                          <span>STEALTH HUD ACTIVE</span>
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Controls */}
          <button className="carousel-nav-btn nav-right" onClick={handleNext} type="button" title="Next Video">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="carousel-dots-pagination">
          {CAROUSEL_MODULES.map((mod, idx) => (
            <button
              key={mod.id}
              className={`pagination-dot ${activeIdx === idx ? 'active' : ''}`}
              style={{
                background: activeIdx === idx ? mod.accent : 'rgba(255, 255, 255, 0.2)',
                boxShadow: activeIdx === idx ? `0 0 12px ${mod.accent}` : 'none',
              }}
              onClick={() => setActiveIdx(idx)}
              type="button"
            />
          ))}
        </div>

      </div>
    </section>
  );
}
