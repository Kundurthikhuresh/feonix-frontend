"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Sparkles, CheckCircle2, ChevronRight, ArrowRight, Shield, Zap, FileText, Check, Award, Upload, Briefcase, MessageSquare, CreditCard } from 'lucide-react';

const DEMO_SCENES = [
  {
    id: 1,
    time: '0:00 - 0:07',
    secStart: 0,
    secEnd: 7,
    title: 'Introduction',
    headline: 'Land Your Dream Job With AI',
    subheading: 'Analyze. Improve. Apply. Get Hired.',
    voiceOver: 'Meet Feonix AI — your intelligent career companion designed to help you build a stronger resume and find better job opportunities.',
    color: '#00f5ff'
  },
  {
    id: 2,
    time: '0:07 - 0:13',
    secStart: 7,
    secEnd: 13,
    title: 'Create Account',
    headline: 'Create Your Account',
    subheading: 'Instant access to your personalized AI career workspace.',
    voiceOver: 'Create your account and access your personalized AI career dashboard.',
    color: '#8b5cf6'
  },
  {
    id: 3,
    time: '0:13 - 0:20',
    secStart: 13,
    secEnd: 20,
    title: 'Dashboard Overview',
    headline: 'Personalized AI Dashboard',
    subheading: 'Real-time resume score, job matches, and active recommendations.',
    voiceOver: 'Your dashboard gives you a complete overview of your resume performance, job matches and AI recommendations.',
    color: '#38bdf8'
  },
  {
    id: 4,
    time: '0:20 - 0:28',
    secStart: 20,
    secEnd: 28,
    title: 'Upload Resume',
    headline: 'Upload Your Resume',
    subheading: 'Drag & drop your existing PDF or DOCX file for analysis.',
    voiceOver: 'Simply upload your existing resume and let Feonix AI analyze it.',
    color: '#ec4899'
  },
  {
    id: 5,
    time: '0:28 - 0:36',
    secStart: 28,
    secEnd: 36,
    title: 'AI Resume Analysis',
    headline: 'Multi-Layer AI Scanning',
    subheading: 'Extracting experience, evaluating ATS keywords and skill alignment.',
    voiceOver: 'Our AI analyzes your experience, skills, keywords and ATS compatibility to identify areas that can be improved.',
    color: '#10b981'
  },
  {
    id: 6,
    time: '0:36 - 0:43',
    secStart: 36,
    secEnd: 43,
    title: 'Resume Score',
    headline: 'Instant AI Scorecard',
    subheading: 'Your Resume Score: 85 / 100 with detailed category breakdowns.',
    voiceOver: 'You instantly receive an AI-powered resume score with detailed insights into your strengths and weaknesses.',
    color: '#f59e0b'
  },
  {
    id: 7,
    time: '0:43 - 0:50',
    secStart: 43,
    secEnd: 50,
    title: 'AI Recommendations',
    headline: 'Actionable Suggestions',
    subheading: 'Targeted recommendations to strengthen professional impact.',
    voiceOver: 'Feonix AI then provides actionable recommendations to make your resume more relevant and impactful.',
    color: '#00f5ff'
  },
  {
    id: 8,
    time: '0:50 - 0:58',
    secStart: 50,
    secEnd: 58,
    title: 'Optimized Resume',
    headline: 'Job-Ready Transformation',
    subheading: 'Enhanced summary, stronger bullet points, and clean formatting.',
    voiceOver: 'With AI-powered optimization, you can transform your resume into a stronger, job-ready version.',
    color: '#10b981'
  },
  {
    id: 9,
    time: '0:58 - 1:06',
    secStart: 58,
    secEnd: 66,
    title: 'Job Matching',
    headline: 'Smart Job Matching',
    subheading: 'Matches your skills directly with high-probability opportunities.',
    voiceOver: 'Feonix AI matches your skills and experience with relevant job opportunities.',
    color: '#8b5cf6'
  },
  {
    id: 10,
    time: '1:06 - 1:14',
    secStart: 66,
    secEnd: 74,
    title: 'Interview Preparation',
    headline: 'AI Interview Practice',
    subheading: 'Mock interviews, HR questions, and live technical Q&A drills.',
    voiceOver: 'Prepare for interviews with AI-powered mock interviews, HR questions and technical practice.',
    color: '#00f5ff'
  },
  {
    id: 11,
    time: '1:14 - 1:21',
    secStart: 74,
    secEnd: 81,
    title: 'AI Cover Letter',
    headline: 'Tailored Cover Letters',
    subheading: 'Personalized letters generated specifically for target companies.',
    voiceOver: 'Generate personalized cover letters tailored to the job and company in seconds.',
    color: '#ec4899'
  },
  {
    id: 12,
    time: '1:21 - 1:27',
    secStart: 81,
    secEnd: 87,
    title: 'Pricing & Upgrade',
    headline: 'Choose Your Plan',
    subheading: 'Unlock advanced AI models with seamless Stripe checkout.',
    voiceOver: 'Choose the plan that fits your career goals and unlock more powerful AI features.',
    color: '#f59e0b'
  },
  {
    id: 13,
    time: '1:27 - 1:30',
    secStart: 87,
    secEnd: 90,
    title: 'Final Brand Shot',
    headline: 'Feonix AI — Your AI Career Companion',
    subheading: 'Analyze. Improve. Apply. Get Hired.',
    voiceOver: 'Feonix AI — your AI career companion. Analyze, improve, apply and get closer to your dream job.',
    color: '#00f5ff'
  }
];

export default function DemoVideo90sModal({ isOpen, onClose, onGetStarted }) {
  const [currentSec, setCurrentSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSpeech, setAudioSpeech] = useState(true);

  // Derive active scene
  const activeScene = DEMO_SCENES.find(
    (s) => currentSec >= s.secStart && currentSec < s.secEnd
  ) || DEMO_SCENES[DEMO_SCENES.length - 1];

  // Automated 90-second timeline timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSec((prev) => {
        if (prev >= 90) {
          setIsPlaying(false);
          return 90;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  // Speech synthesis for realistic product voiceover
  useEffect(() => {
    if (!isOpen || !isPlaying || isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeScene.voiceOver);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch { }
  }, [activeScene.id, isOpen, isPlaying, isMuted]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(5, 7, 13, 0.95)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      <div style={{ position: 'relative', width: '100%', maxWidth: '1100px', background: '#0a0e1a', border: '1.5px solid rgba(0, 245, 255, 0.3)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(0, 245, 255, 0.15)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Top Bar */}
        <div style={{ padding: '14px 24px', background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #00f5ff, #0891b2)', display: 'grid', placeItems: 'center', fontWeight: '900', color: '#0a0e1a', fontSize: '14px' }}>F</div>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.04em' }}>FEONIX AI — 90-SECOND FEATURE DEMO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: '#00f5ff', background: 'rgba(0,245,255,0.12)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(0,245,255,0.3)' }}>
              SCENE {activeScene.id} / 13
            </span>
            <button onClick={onClose} style={{ border: 0, background: 'rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main 16:9 Video Simulation Stage */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#05070d', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px' }}>
          
          {/* Animated Background Particle Grid */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 50% 50%, rgba(0,245,255,0.4) 0%, transparent 60%)', pointerEvents: 'none' }} />

          {/* Scene 1: Intro */}
          {activeScene.id === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '20px', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)', display: 'grid', placeItems: 'center', fontSize: '36px', fontWeight: '900', color: '#0a0e1a', boxShadow: '0 0 40px rgba(0,245,255,0.5)' }}>F</div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', margin: 0 }}>Land Your Dream Job With AI</h1>
              <p style={{ fontSize: '20px', color: '#00f5ff', margin: 0, fontWeight: '700' }}>Analyze. Improve. Apply. Get Hired.</p>
              <button style={{ marginTop: '10px', background: 'linear-gradient(135deg, #00f5ff, #0891b2)', border: 0, color: '#0a0e1a', padding: '12px 28px', borderRadius: '10px', fontWeight: '800', fontSize: '15px' }}>Get Started →</button>
            </div>
          )}

          {/* Scene 2: Create Account */}
          {activeScene.id === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div style={{ width: '400px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '20px', color: '#f8fafc', margin: 0, fontWeight: '800' }}>Create Your Account</h3>
                <input readOnly value="Alex Mercer" style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px', borderRadius: '8px' }} />
                <input readOnly value="alex.mercer@tech.com" style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px', borderRadius: '8px' }} />
                <input readOnly value="••••••••••••" style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px', borderRadius: '8px' }} />
                <button style={{ background: '#8b5cf6', color: '#fff', border: 0, padding: '12px', borderRadius: '8px', fontWeight: '800' }}>Create Account →</button>
              </div>
            </div>
          )}

          {/* Scene 3: Dashboard */}
          {activeScene.id === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'center', height: '100%' }}>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '38px', fontWeight: '900', color: '#00f5ff' }}>85 / 100</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>Resume Score</div>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '38px', fontWeight: '900', color: '#a78bfa' }}>24</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>Jobs Matched</div>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '38px', fontWeight: '900', color: '#34d399' }}>8</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>AI Suggestions</div>
              </div>
            </div>
          )}

          {/* Scene 4: Upload Resume */}
          {activeScene.id === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ width: '480px', height: '220px', border: '2px dashed rgba(236,72,153,0.5)', borderRadius: '20px', background: 'rgba(236,72,153,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <Upload size={40} style={{ color: '#ec4899' }} />
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>Upload Your Resume</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Supported formats: PDF / DOCX</div>
              </div>
            </div>
          )}

          {/* Scene 5: AI Resume Analysis */}
          {activeScene.id === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>Analyzing Resume... 100%</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '360px' }}>
                <div style={{ color: '#34d399', fontSize: '14px' }}>✓ Extracting information</div>
                <div style={{ color: '#34d399', fontSize: '14px' }}>✓ Analyzing experience</div>
                <div style={{ color: '#34d399', fontSize: '14px' }}>✓ Checking keywords</div>
                <div style={{ color: '#34d399', fontSize: '14px' }}>✓ Evaluating skills & ATS compatibility</div>
              </div>
            </div>
          )}

          {/* Scene 6: Resume Score */}
          {activeScene.id === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div style={{ fontSize: '56px', fontWeight: '900', color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>85 / 100</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>AI-Powered Resume Scorecard</div>
            </div>
          )}

          {/* Scene 7: AI Suggestions */}
          {activeScene.id === 7 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', height: '100%' }}>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '12px', padding: '16px', color: '#00f5ff' }}>💡 Add measurable achievements</div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '12px', padding: '16px', color: '#00f5ff' }}>💡 Improve your professional summary</div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '12px', padding: '16px', color: '#00f5ff' }}>💡 Add relevant ATS keywords</div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '12px', padding: '16px', color: '#00f5ff' }}>💡 Strengthen skills section</div>
            </div>
          )}

          {/* Scene 8: Optimized Resume */}
          {activeScene.id === 8 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>Optimized Resume Ready</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '8px' }}>Preview</button>
                <button style={{ background: '#10b981', color: '#0a0e1a', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: '800' }}>Download PDF</button>
              </div>
            </div>
          )}

          {/* Scene 9: Job Matching */}
          {activeScene.id === 9 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', height: '100%' }}>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontWeight: '700' }}>Full Stack Developer — TechNova</span>
                <span style={{ color: '#a78bfa', fontWeight: '900' }}>92% Match</span>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontWeight: '700' }}>Frontend Developer — Veloce</span>
                <span style={{ color: '#a78bfa', fontWeight: '900' }}>88% Match</span>
              </div>
            </div>
          )}

          {/* Scene 10: Interview Prep */}
          {activeScene.id === 10 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div style={{ fontSize: '20px', color: '#00f5ff', fontWeight: '800' }}>AI Mock Interview — "Tell me about yourself"</div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(0,245,255,0.3)', padding: '16px', borderRadius: '12px', width: '500px', color: '#e2e8f0' }}>
                AI Feedback: Excellent structure using STAR method. High confidence and clear technical delivery.
              </div>
            </div>
          )}

          {/* Scene 11: Cover Letter */}
          {activeScene.id === 11 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div style={{ fontSize: '20px', color: '#ec4899', fontWeight: '800' }}>Personalized Cover Letter Generated</div>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(236,72,153,0.3)', padding: '16px', borderRadius: '12px', width: '500px', color: '#e2e8f0', fontSize: '13px' }}>
                Dear Hiring Manager at TechNova Solutions, I am writing to express my strong interest in the Full Stack Developer position...
              </div>
            </div>
          )}

          {/* Scene 12: Pricing */}
          {activeScene.id === 12 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', height: '100%' }}>
              <div style={{ background: 'rgba(15,23,42,0.85)', border: '2px solid #f59e0b', borderRadius: '16px', padding: '24px', textAlign: 'center', width: '220px' }}>
                <div style={{ color: '#f59e0b', fontWeight: '900', fontSize: '20px' }}>PRO PLAN</div>
                <div style={{ color: '#fff', fontSize: '28px', fontWeight: '900', margin: '10px 0' }}>$19/mo</div>
                <button style={{ background: '#f59e0b', color: '#0a0e1a', border: 0, padding: '10px', borderRadius: '8px', fontWeight: '800', width: '100%' }}>Upgrade Now</button>
              </div>
            </div>
          )}

          {/* Scene 13: Final Brand Shot */}
          {activeScene.id === 13 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)', display: 'grid', placeItems: 'center', fontSize: '40px', fontWeight: '900', color: '#0a0e1a' }}>F</div>
              <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#ffffff', margin: 0 }}>Feonix AI</h1>
              <p style={{ fontSize: '20px', color: '#00f5ff', margin: 0, fontWeight: '800' }}>Your AI Career Companion</p>
              <button onClick={() => { onClose(); onGetStarted(); }} style={{ background: 'linear-gradient(135deg, #00f5ff, #0891b2)', border: 0, color: '#0a0e1a', padding: '14px 32px', borderRadius: '12px', fontWeight: '800', fontSize: '16px' }}>Start Your Career Journey →</button>
            </div>
          )}

          {/* Bottom Captions Overlay */}
          <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', background: 'rgba(10, 14, 26, 0.9)', border: '1px solid rgba(0, 245, 255, 0.3)', padding: '12px 18px', borderRadius: '12px', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={18} style={{ color: activeScene.color, flexShrink: 0 }} />
            <div style={{ fontSize: '13.5px', color: '#f1f5f9', fontWeight: '600', lineHeight: '1.5' }}>
              {activeScene.voiceOver}
            </div>
          </div>

        </div>

        {/* Video Scrubber & Playback Controls */}
        <div style={{ padding: '16px 24px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Timeline Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{ border: 0, background: '#00f5ff', color: '#0a0e1a', borderRadius: '50%', width: '36px', height: '36px', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            <span style={{ fontSize: '13px', fontFamily: 'var(--mono)', color: '#ffffff', fontWeight: '700', flexShrink: 0 }}>
              00:{String(currentSec).padStart(2, '0')} / 01:30
            </span>

            {/* Interactive Timeline Track */}
            <input
              type="range"
              min="0"
              max="90"
              value={currentSec}
              onChange={(e) => setCurrentSec(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#00f5ff', cursor: 'pointer' }}
            />

            <button onClick={() => setIsMuted(!isMuted)} style={{ border: 0, background: 'rgba(255,255,255,0.08)', color: '#ffffff', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <button onClick={() => { setCurrentSec(0); setIsPlaying(true); }} style={{ border: 0, background: 'rgba(255,255,255,0.08)', color: '#ffffff', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
              <RotateCcw size={18} />
            </button>
          </div>

          {/* 13 Scene Navigation Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {DEMO_SCENES.map((scene) => {
              const isActive = activeScene.id === scene.id;
              return (
                <button
                  key={scene.id}
                  onClick={() => {
                    setCurrentSec(scene.secStart);
                    setIsPlaying(true);
                  }}
                  style={{
                    border: 0,
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: isActive ? scene.color : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#0a0e1a' : '#94a3b8',
                    transition: 'all 0.15s ease'
                  }}
                >
                  S{scene.id}. {scene.title}
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
