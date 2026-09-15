"use client";

import { useState, useEffect, useRef } from 'react';
import { XCircle, CheckCircle2, Sparkles, MoveHorizontal, AlertTriangle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

const WITHOUT_FEONIX = [
  { title: 'Scattered Notes & Blanking Out', desc: 'Searching loose sheets or browser tabs during live technical calls.' },
  { title: 'Generic AI Lacking Context', desc: 'Out-of-the-box LLMs give long, non-specific answers without resume data.' },
  { title: 'Slow & Stressful Preparation', desc: 'Spending weeks manually compiling system design & algorithm flashcards.' },
  { title: 'Forgotten STAR Impact Metrics', desc: 'Struggling to remember exact percentage metrics under high pressure.' },
  { title: 'Zero Real-Time Guidance', desc: 'No live audio teleprompter cues or post-interview performance analytics.' }
];

const WITH_FEONIX = [
  { title: 'Sub-100ms Stealth Teleprompter', desc: 'Invisible HUD overlay streams instant STAR bullet points in real-time.' },
  { title: 'Resume & JD Vector Match', desc: 'RAG engine synthesizes custom answers tailored to your exact experience.' },
  { title: 'Instant 1-Click AI Prep', desc: 'Automated question banks and solution blueprints built in under 10 seconds.' },
  { title: 'Architectural & Code Cues', desc: 'Live system design diagrams, algorithm complexity & code snippet helpers.' },
  { title: 'AI Voice Coach & Transcripts', desc: 'Full audio transcript analysis, filler word detection & score analytics.' }
];

export default function BeforeAfter3DSection() {
  const [sliderPos, setSliderPos] = useState(50); // percentage
  const containerRef = useRef(null);

  // Three.js 3D Background Canvas Effect
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 750;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for BeforeAfter3DSection background canvas', e);
      return;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5ff, 4, 45);
    cyanLight.position.set(12, 12, 6);
    scene.add(cyanLight);

    const redLight = new THREE.PointLight(0xef4444, 3, 45);
    redLight.position.set(-12, -12, 6);
    scene.add(redLight);

    const group = new THREE.Group();
    scene.add(group);

    // Floating Wireframe Polyhedra
    const geometryList = [
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.OctahedronGeometry(0.65, 0),
      new THREE.TetrahedronGeometry(0.7, 0),
      new THREE.BoxGeometry(0.6, 0.6, 0.6)
    ];

    const colors = [0x00f5ff, 0xef4444, 0x8b5cf6, 0x10b981];
    const nodes = [];

    for (let i = 0; i < 36; i++) {
      const geo = geometryList[i % geometryList.length];
      const color = colors[i % colors.length];

      const mat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geo, mat);
      const x = (Math.random() - 0.5) * 34;
      const y = (Math.random() - 0.5) * 22;
      const z = -4 - Math.random() * 14;

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.008,
        rotSpeedY: (Math.random() - 0.5) * 0.008,
        initialY: y,
        floatSpeed: 0.5 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2
      };

      group.add(mesh);
      nodes.push(mesh);
    }

    // Background Particles
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 45;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      particlePos[i * 3 + 2] = -3 - Math.random() * 20;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Mouse Parallax
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMoveWindow = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      targetRotY = (x / (window.innerWidth / 2)) * 0.2;
      targetRotX = (y / (window.innerHeight / 2)) * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMoveWindow, { passive: true });

    const handleResize = () => {
      if (!container || !renderer) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 750;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.y += 0.0008;

      nodes.forEach((node) => {
        node.rotation.x += node.userData.rotSpeedX;
        node.rotation.y += node.userData.rotSpeedY;
        node.position.y = node.userData.initialY + Math.sin(elapsed * node.userData.floatSpeed + node.userData.phase) * 0.25;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMoveWindow);
      window.removeEventListener('resize', handleResize);

      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometryList.forEach((g) => g.dispose());
      particleGeo.dispose();
      particleMat.dispose();
      renderer?.dispose();
    };
  }, []);

  const handleMouseMoveSlider = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(10, Math.min(90, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  return (
    <section
      className="before-after-3d-section"
      style={{
        position: 'relative',
        padding: '100px 24px',
        background: 'radial-gradient(ellipse at center, rgba(13, 20, 38, 0.95) 0%, rgba(6, 9, 16, 1) 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Three.js Interactive 3D Background Canvas */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.85
        }}
      />

      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '650px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, rgba(239, 68, 68, 0.08) 50%, rgba(0,0,0,0) 80%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)'
            }}
          >
            <Sparkles size={14} />
            <span>THE FEONIX ADVANTAGE</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Before vs After <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Feonix AI</span>
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '660px', margin: '0 auto', lineHeight: '1.6' }}>
            Drag the interactive comparison divider to see how Feonix AI transforms interview performance.
          </p>
        </div>

        {/* Draggable Interactive Split Comparison Box */}
        <div
          onMouseMove={handleMouseMoveSlider}
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1.5px solid rgba(0, 245, 255, 0.35)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.9), 0 0 40px rgba(0, 245, 255, 0.15)',
            cursor: 'ew-resize',
            userSelect: 'none',
            minHeight: '480px',
            background: 'rgba(8, 12, 22, 0.95)',
            backdropFilter: 'blur(30px)'
          }}
        >
          {/* BASE CONTAINER: Grid Split showing WITHOUT FEONIX on Right & WITH FEONIX on Left */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              width: '100%',
              minHeight: '480px'
            }}
          >
            {/* LEFT side placeholder (underlay) */}
            <div style={{ padding: '36px' }} />

            {/* RIGHT SIDE: WITHOUT FEONIX AI PANEL (Fully Populated on the Right Side) */}
            <div
              style={{
                padding: '36px',
                background: 'rgba(239, 68, 68, 0.04)',
                borderLeft: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.08em',
                  marginBottom: '24px',
                  width: 'fit-content'
                }}
              >
                <AlertTriangle size={15} />
                <span>WITHOUT FEONIX AI</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {WITHOUT_FEONIX.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.18)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '14.5px', color: '#f8fafc', fontWeight: '700', marginBottom: '4px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.45' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OVERLAY CONTAINER: Clipped to slider position, rendering WITH FEONIX AI on Left */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${sliderPos}%`,
              overflow: 'hidden',
              background: 'rgba(10, 15, 30, 0.98)',
              borderRight: '2px solid #00f5ff',
              boxShadow: '12px 0 35px rgba(0, 245, 255, 0.45)',
              transition: 'width 0.04s ease-out'
            }}
          >
            <div
              style={{
                width: '1240px', // Matches outer container max width for perfect overlay alignment
                maxWidth: '100%',
                padding: '36px',
                boxSizing: 'border-box',
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(0, 245, 255, 0.15)',
                  border: '1px solid rgba(0, 245, 255, 0.4)',
                  color: '#00f5ff',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.08em',
                  marginBottom: '24px',
                  width: 'fit-content',
                  boxShadow: '0 0 15px rgba(0, 245, 255, 0.2)'
                }}
              >
                <Zap size={15} />
                <span>WITH FEONIX AI COPILOT</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px' }}>
                {WITH_FEONIX.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: 'rgba(0, 245, 255, 0.08)',
                      border: '1px solid rgba(0, 245, 255, 0.25)',
                      boxShadow: '0 4px 14px rgba(0, 245, 255, 0.08)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <CheckCircle2 size={20} style={{ color: '#00f5ff', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '14.5px', color: '#ffffff', fontWeight: '800', marginBottom: '4px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.45' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slider Handle Divider Knob */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPos}%`,
              transform: 'translate(-50%, -50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 25px #00f5ff, 0 0 40px rgba(139, 92, 246, 0.5)',
              zIndex: 25,
              cursor: 'ew-resize'
            }}
          >
            <MoveHorizontal size={20} />
          </div>
        </div>

        {/* Side-by-Side Mobile / Grid Summary Cards below */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '36px' }}>
          
          {/* Left Summary Card */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(0, 245, 255, 0.06)',
              border: '1.5px solid rgba(0, 245, 255, 0.3)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00f5ff', fontWeight: '800', fontSize: '16px', marginBottom: '8px' }}>
              <ShieldCheck size={20} />
              <span>10x Interview Confidence & Success Rate</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
              Feonix AI users record a 94% offer conversion rate with real-time stealth teleprompter cues and instant STAR answer synthesis.
            </p>
          </div>

          {/* Right Summary Card */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1.5px solid rgba(239, 68, 68, 0.25)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontWeight: '800', fontSize: '16px', marginBottom: '8px' }}>
              <AlertTriangle size={20} />
              <span>Eliminate Blanking Out & Stress</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
              Never stumble over complex system architecture, algorithm complexities, or STAR metrics during high-stakes tech calls.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
