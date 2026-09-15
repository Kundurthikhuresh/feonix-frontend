"use client";

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Brain, CheckCircle2, Loader2, Zap } from 'lucide-react';
import * as THREE from 'three';

const QUESTIONS = [
  {
    q: 'Explain Kubernetes container orchestration',
    a: 'Kubernetes manages containerized workloads via Control Plane (API Server, ETCD, Scheduler) and Worker Nodes (Kubelet, Kube-Proxy). It automates horizontal pod autoscaling, rolling deployments, and self-healing.'
  },
  {
    q: 'Design a URL Shortener system',
    a: '1. Core DB: Key-Value store (Redis + DynamoDB). 2. Hash Algorithm: Base62 encoding on auto-incrementing ID. 3. Redirect: 301 Permanent vs 302 Temporary. 4. Cache: LRU cache for top 20% viral links.'
  },
  {
    q: 'Explain My Resume STAR impact metrics',
    a: 'Indexed 4 core engineering achievements: Reduced API latency by 42% via Redis caching, scaled database throughput to 100k QPS, led 5-person microservices migration, and maintained 99.99% uptime.'
  },
  {
    q: 'How should I answer a behavioral disagreement question?',
    a: 'Use STAR: 1. Situation: Disagreed on DB rewrite vs indexing. 2. Task: Needed empirical proof. 3. Action: Ran 2-week performance benchmark spike. 4. Result: Saved 3 months dev time by indexing.'
  },
  {
    q: 'Explain TwoSum hash map solution complexity',
    a: 'HashMap stores target - nums[i] complement. Lookup is O(1) average time complexity. Overall single-pass solution achieves O(n) time complexity and O(n) space complexity.'
  }
];

export default function AskFeonix3DSection() {
  const [activeQ, setActiveQ] = useState(QUESTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const containerRef = useRef(null);

  // Three.js 3D Background Canvas Effect
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 750;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    // 2. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for AskFeonix3DSection background canvas', e);
      return;
    }

    // 3. Cyber Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5ff, 4, 45);
    cyanLight.position.set(12, 12, 6);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 4, 45);
    purpleLight.position.set(-12, -12, 6);
    scene.add(purpleLight);

    const group = new THREE.Group();
    scene.add(group);

    // 4. Luminous 3D Wireframe Rings (Quantum Core Elements)
    const ringGeo1 = new THREE.TorusGeometry(6, 0.08, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.position.set(0, 0, -6);
    ringMesh1.rotation.x = Math.PI / 3;
    group.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(8.5, 0.06, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.position.set(0, 0, -8);
    ringMesh2.rotation.y = Math.PI / 4;
    group.add(ringMesh2);

    // 5. Floating 3D Wireframe Geometries (Floating Knowledge Nodes)
    const geometryList = [
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.OctahedronGeometry(0.65, 0),
      new THREE.TetrahedronGeometry(0.7, 0),
      new THREE.DodecahedronGeometry(0.5, 0),
      new THREE.SphereGeometry(0.4, 16, 16)
    ];

    const colors = [0x00f5ff, 0x8b5cf6, 0x38bdf8, 0xa855f7, 0x10b981];
    const nodes = [];

    for (let i = 0; i < 40; i++) {
      const geo = geometryList[i % geometryList.length];
      const color = colors[i % colors.length];

      const mat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geo, mat);
      const x = (Math.random() - 0.5) * 34;
      const y = (Math.random() - 0.5) * 22;
      const z = -4 - Math.random() * 14; // Positioned behind cards in z-depth

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.009,
        rotSpeedY: (Math.random() - 0.5) * 0.009,
        initialY: y,
        floatSpeed: 0.5 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2
      };

      group.add(mesh);
      nodes.push(mesh);
    }

    // 6. Connecting Dynamic Synaptic Lines
    const maxConnections = 70;
    const lineCoords = new Float32Array(maxConnections * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lineCoords, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(linesMesh);

    // 7. Background Starfield Constellation Particles
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 48;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 32;
      particlePos[i * 3 + 2] = -3 - Math.random() * 22;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // 8. Mouse Parallax Movement
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      targetRotY = (x / (window.innerWidth / 2)) * 0.22;
      targetRotX = (y / (window.innerHeight / 2)) * 0.18;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !renderer) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 750;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Render Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Parallax damping
      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.y += 0.001;

      // Rotate background torus rings
      ringMesh1.rotation.z = elapsed * 0.15;
      ringMesh1.rotation.x = Math.PI / 3 + Math.sin(elapsed * 0.2) * 0.1;
      ringMesh2.rotation.z = -elapsed * 0.12;

      // Animate 3D Nodes
      nodes.forEach((node) => {
        node.rotation.x += node.userData.rotSpeedX;
        node.rotation.y += node.userData.rotSpeedY;
        node.position.y = node.userData.initialY + Math.sin(elapsed * node.userData.floatSpeed + node.userData.phase) * 0.3;
      });

      // Update Lines
      const linePositions = lineGeo.attributes.position.array;
      let lineIndex = 0;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (lineIndex >= maxConnections * 6) break;

          const dist = nodes[i].position.distanceTo(nodes[j].position);
          if (dist < 6.8) {
            linePositions[lineIndex++] = nodes[i].position.x;
            linePositions[lineIndex++] = nodes[i].position.y;
            linePositions[lineIndex++] = nodes[i].position.z;

            linePositions[lineIndex++] = nodes[j].position.x;
            linePositions[lineIndex++] = nodes[j].position.y;
            linePositions[lineIndex++] = nodes[j].position.z;
          }
        }
      }

      lineGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometryList.forEach((g) => g.dispose());
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer?.dispose();
    };
  }, []);

  const handleSelect = (item) => {
    setIsProcessing(true);
    setActiveQ(item);
    setTimeout(() => {
      setIsProcessing(false);
    }, 600);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const item = {
      q: customInput,
      a: `Feonix AI ingested "${customInput}" and synthesized a structured STAR answer using your resume context in under 95ms.`
    };
    setCustomInput('');
    handleSelect(item);
  };

  return (
    <section
      className="ask-feonix-3d-section"
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
          opacity: 0.9
        }}
      />

      {/* Ambient Gradient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.12) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(0,0,0,0) 80%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

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
            <span>INTERACTIVE DEMO</span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Ask <span style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Feonix</span> Anything
          </h2>

          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '660px', margin: '0 auto', lineHeight: '1.6' }}>
            Test the live AI reasoning engine with sample technical and behavioral prompts.
          </p>
        </div>

        {/* Question Selector Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
          {QUESTIONS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px 18px',
                borderRadius: '9999px',
                background: activeQ.q === item.q ? 'rgba(0, 245, 255, 0.18)' : 'rgba(15, 23, 42, 0.85)',
                border: `1.5px solid ${activeQ.q === item.q ? '#00f5ff' : 'rgba(255, 255, 255, 0.14)'}`,
                color: activeQ.q === item.q ? '#00f5ff' : '#94a3b8',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                boxShadow: activeQ.q === item.q ? '0 0 20px rgba(0, 245, 255, 0.25)' : '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                if (activeQ.q !== item.q) {
                  e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.5)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeQ.q !== item.q) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              {item.q}
            </button>
          ))}
        </div>

        {/* Live Answer Stage Box */}
        <div
          style={{
            background: 'rgba(10, 14, 26, 0.94)',
            border: '1.5px solid rgba(0, 245, 255, 0.45)',
            borderRadius: '24px',
            padding: '32px',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 45px rgba(0, 245, 255, 0.2)',
            maxWidth: '850px',
            margin: '0 auto'
          }}
        >
          {/* Question Title */}
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={18} style={{ color: '#00f5ff' }} />
            <span>Q: "{activeQ.q}"</span>
          </div>

          {/* Answer Output */}
          <div style={{ background: 'rgba(7, 10, 18, 0.92)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '20px', minHeight: '100px' }}>
            {isProcessing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00f5ff', fontSize: '14px', fontWeight: '700' }}>
                <Loader2 size={18} className="animate-spin" />
                <span>Feonix AI Vector RAG Synthesizing Answer...</span>
              </div>
            ) : (
              <div style={{ fontSize: '14.5px', color: '#cbd5e1', lineHeight: '1.65', fontWeight: '500' }}>
                {activeQ.a}
              </div>
            )}
          </div>

          {/* Custom Question Form Input */}
          <form onSubmit={handleCustomSubmit} style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ask a custom interview or coding question..."
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 245, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.3)';
              }}
            >
              <Send size={15} />
              <span>Ask AI</span>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
