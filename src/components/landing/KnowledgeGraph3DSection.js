"use client";

import { useState, useEffect, useRef } from 'react';
import { Network, Cpu, Database, Cloud, Shield, Code, Server, Layers, GitBranch, Terminal } from 'lucide-react';

const NODES = [
  { id: 'sd', label: 'System Design', icon: Server, color: '#00f5ff' },
  { id: 'db', label: 'Databases', icon: Database, color: '#8b5cf6' },
  { id: 'api', label: 'APIs & Microservices', icon: Network, color: '#10b981' },
  { id: 'cloud', label: 'Cloud Architecture', icon: Cloud, color: '#38bdf8' },
  { id: 'devops', label: 'DevOps & CI/CD', icon: GitBranch, color: '#f59e0b' },
  { id: 'sec', label: 'Security & Auth', icon: Shield, color: '#ec4899' },
  { id: 'algo', label: 'Algorithms & DP', icon: Code, color: '#a855f7' },
  { id: 'ds', label: 'Data Structures', icon: Layers, color: '#00f5ff' },
  { id: 'lang', label: 'Programming Runtimes', icon: Terminal, color: '#38bdf8' },
  { id: 'dist', label: 'Distributed Systems', icon: Cpu, color: '#10b981' },
];

export default function KnowledgeGraph3DSection() {
  const [activeNode, setActiveNode] = useState(null);
  const canvasRef = useRef(null);

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

      // Draw connecting lines from center to nodes
      NODES.forEach((_, i) => {
        const angle = (i / NODES.length) * Math.PI * 2 + frame * 0.005;
        const rx = width * 0.38;
        const ry = height * 0.34;
        const nx = cx + Math.cos(angle) * rx;
        const ny = cy + Math.sin(angle) * ry;

        const isHighlighted = activeNode === i;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = isHighlighted ? '#00f5ff' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isHighlighted ? 2.5 : 1;
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeNode]);

  return (
    <section className="knowledge-graph-3d-section" style={{ position: 'relative', padding: '68px 24px 72px 24px', background: 'radial-gradient(ellipse at center, rgba(13,20,38,0.95) 0%, rgba(4,7,17,1) 100%)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
            <Network size={14} />
            <span>KNOWLEDGE SYNAPSE GRAPH</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Technical <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Knowledge Graph</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Hover any domain node to inspect synaptic relationships across computer science, system design, and algorithms.
          </p>
        </div>

        {/* 3D Graph Container Stage */}
        <div style={{ position: 'relative', height: '560px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
          />

          {/* Central AI Node */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #00f5ff 0%, #8b5cf6 70%, #040711)',
              boxShadow: '0 0 50px rgba(0, 245, 255, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Cpu size={36} />
            <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '0.08em', marginTop: '6px' }}>FEONIX AI</span>
          </div>

          {/* Floating Graph Nodes */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
            {NODES.map((node, i) => {
              const angle = (i / NODES.length) * Math.PI * 2;
              // Rounded rather than left at full float precision: Math.cos/sin
              // can differ in their last bit or two between Node's V8 and the
              // browser's, even for the same input — with the raw value baked
              // straight into the style string, that shows up as a hydration
              // mismatch ("16.0212862362522%" server vs "16.0213%" client).
              // A handful of decimals is more precision than a percentage
              // position needs anyway, and gives both renders an identical string.
              const posX = Number((50 + Math.cos(angle) * 42).toFixed(4));
              const posY = Number((50 + Math.sin(angle) * 38).toFixed(4));
              const isHovered = activeNode === i;
              const Icon = node.icon;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setActiveNode(i)}
                  onMouseLeave={() => setActiveNode(null)}
                  style={{
                    position: 'absolute',
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: `translate(-50%, -50%) scale(${isHovered ? 1.1 : 1})`,
                    transition: 'all 0.3s ease',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: isHovered ? 'rgba(15, 23, 42, 0.96)' : 'rgba(10, 14, 26, 0.85)',
                    border: `1.5px solid ${isHovered ? node.color : 'rgba(255, 255, 255, 0.12)'}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: isHovered ? `0 0 30px ${node.color}50` : '0 8px 20px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Icon size={18} style={{ color: node.color }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', whiteSpace: 'nowrap' }}>
                    {node.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
