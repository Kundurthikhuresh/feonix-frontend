"use client";

import { useState, useEffect, useRef } from 'react';
import { Brain, FileText, Code2, Briefcase, FolderGit2, Sparkles, History, BookOpen } from 'lucide-react';

const CARDS = [
  { id: 'resume', label: 'Resume', icon: FileText, desc: 'Ingested PDF & LaTeX work history', color: '#00f5ff' },
  { id: 'skills', label: 'Skills', icon: Code2, desc: 'Verified tech stack & proficiencies', color: '#8b5cf6' },
  { id: 'exp', label: 'Experience', icon: Briefcase, desc: 'Impact metrics & STAR achievements', color: '#10b981' },
  { id: 'projects', label: 'Projects', icon: FolderGit2, desc: 'System architecture & code repos', color: '#38bdf8' },
  { id: 'jd', label: 'Job Description', icon: Sparkles, desc: 'Role requirements & domain keywords', color: '#ec4899' },
  { id: 'history', label: 'Interview History', icon: History, desc: 'Past session transcripts & feedback', color: '#f59e0b' },
  { id: 'knowledge', label: 'Technical Knowledge', icon: BookOpen, desc: 'Deep OS, RAG & system design docs', color: '#a855f7' },
];

export default function CareerIntelligence3DSection() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    setParallax({ x, y });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  // 3D Orbital Canvas & Particle Synapse Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    let width = (canvas.width = canvas.parentElement.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement.clientHeight || 550);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 1000;
      height = canvas.height = canvas.parentElement.clientHeight || 550;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Central AI Brain Core Pulse
      const orbRadius = 45 + Math.sin(frame * 0.05) * 4;
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, orbRadius * 2);
      grad.addColorStop(0, '#00f5ff');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting Particle Beams to 7 Points
      CARDS.forEach((_, i) => {
        const angle = (i / CARDS.length) * Math.PI * 2 + frame * 0.008;
        const rx = width * 0.36;
        const ry = height * 0.32;
        const px = cx + Math.cos(angle) * rx;
        const py = cy + Math.sin(angle) * ry;

        // Beam Line from AI Core to Node
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = i === hoveredCard ? 'rgba(0, 245, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = i === hoveredCard ? 2 : 1;
        ctx.stroke();

        // Pulsing Data Packets moving from Core to Cards
        const packetProgress = (frame * 0.02 + i * 0.15) % 1;
        const packetX = cx + (px - cx) * packetProgress;
        const packetY = cy + (py - cy) * packetProgress;

        ctx.beginPath();
        ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00f5ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f5ff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hoveredCard]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="career-intelligence-section"
      style={{
        position: 'relative',
        padding: '100px 24px',
        background: '#040711',
        overflow: 'hidden'
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'rgba(0, 245, 255, 0.1)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              color: '#00f5ff',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <Brain size={14} />
            <span>NEURAL CONTEXT ENGINE</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            One AI. Your Entire <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Career Context</span>.
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Feonix AI unifies your resume, code repositories, system design notes, and target job descriptions into a single 3D neural memory core.
          </p>
        </div>

        {/* 3D Orbiting Stage Container */}
        <div
          style={{
            position: 'relative',
            height: '560px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `perspective(1000px) rotateX(${-parallax.y * 0.4}deg) rotateY(${parallax.x * 0.4}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* HTML5 Orbital Synapse Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Central 3D AI Core Orb */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #00f5ff, #8b5cf6 70%, #040711)',
              boxShadow: '0 0 60px rgba(0, 245, 255, 0.6), inset 0 0 20px #ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              textAlign: 'center',
              padding: '12px'
            }}
          >
            <Brain size={36} style={{ filter: 'drop-shadow(0 0 10px #ffffff)' }} />
            <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.08em', marginTop: '4px' }}>FEONIX CORE</span>
          </div>

          {/* Orbiting Floating 3D Cards Grid */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
            {CARDS.map((card, i) => {
              const total = CARDS.length;
              const angle = (i / total) * Math.PI * 2;
              const radiusX = 42; // percentage
              const radiusY = 36; // percentage

              // Rounded rather than left at full float precision: Math.cos/sin
              // can differ in their last bit or two between Node's V8 (SSR)
              // and the browser's (hydration), which otherwise shows up as a
              // hydration mismatch once that raw value is baked into a style
              // string. A handful of decimals is more precision than a
              // percentage position needs anyway.
              const posX = Number((50 + Math.cos(angle) * radiusX).toFixed(4));
              const posY = Number((50 + Math.sin(angle) * radiusY).toFixed(4));

              const isHovered = hoveredCard === i;
              const Icon = card.icon;

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: 'absolute',
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: `translate(-50%, -50%) translateZ(${isHovered ? 40 : 0}px) scale(${isHovered ? 1.08 : 1})`,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    width: '210px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: isHovered ? 'rgba(15, 23, 42, 0.96)' : 'rgba(10, 14, 26, 0.85)',
                    border: `1.5px solid ${isHovered ? card.color : 'rgba(255, 255, 255, 0.12)'}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: isHovered
                      ? `0 20px 40px rgba(0,0,0,0.8), 0 0 30px ${card.color}40`
                      : '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: `${card.color}20`,
                        border: `1px solid ${card.color}50`,
                        color: card.color,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                      {card.label}
                    </span>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
