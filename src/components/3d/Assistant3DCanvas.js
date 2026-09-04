"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useInViewport } from '../../hooks/useInViewport';

/**
 * Assistant3DCanvas:
 * Interactive 3D WebGL Avatar & Visualizer for Feonix AI.
 * 
 * Props:
 * - state: 'idle' | 'thinking' | 'speaking' | 'listening'
 * - speechEnergy: 0.0 to 1.0 (driven by speech synthesis / microphone)
 * - visualMode: 'avatar' | 'orb' | 'matrix'
 */
export default function Assistant3DCanvas({
  state = 'idle',
  speechEnergy = 0,
  visualMode = 'avatar',
}) {
  const containerRef = useRef(null);
  const stateRef = useRef(state);
  const speechEnergyRef = useRef(speechEnergy);
  const visualModeRef = useRef(visualMode);
  const inView = useInViewport(containerRef);

  // Keep refs in sync for the animation loop
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    speechEnergyRef.current = speechEnergy;
  }, [speechEnergy]);

  useEffect(() => {
    visualModeRef.current = visualMode;
  }, [visualMode]);

  useEffect(() => {
    if (!containerRef.current || !inView) return;
    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // 2. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed for Assistant3DCanvas', e);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00f5ff, 4, 15);
    cyanPointLight.position.set(3, 3, 4);
    scene.add(cyanPointLight);

    const purplePointLight = new THREE.PointLight(0xa855f7, 4, 15);
    purplePointLight.position.set(-3, -3, 4);
    scene.add(purplePointLight);

    const mouthPointLight = new THREE.PointLight(0x00ffff, 2, 8);
    mouthPointLight.position.set(0, -0.6, 2);
    scene.add(mouthPointLight);

    // 4. Main Avatar Group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // --------------------------------------------------------------------------
    // MODEL 1: HOLO-ANDROID AVATAR (Futuristic Cyber Head & Visor)
    // --------------------------------------------------------------------------
    const holoHeadGroup = new THREE.Group();
    avatarGroup.add(holoHeadGroup);

    // Cranial Head Outer Geometry
    const headGeo = new THREE.SphereGeometry(1.2, 32, 28);
    // Deform sphere slightly into an elongated sleek stylized head
    const posAttr = headGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Elongate vertically and taper chin
      if (y < 0) {
        posAttr.setX(i, x * (1 + y * 0.25));
        posAttr.setZ(i, z * (1 + y * 0.2));
      }
    }
    headGeo.computeVertexNormals();

    const headMat = new THREE.MeshStandardMaterial({
      color: 0x060f22,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.2,
      roughness: 0.15,
      metalness: 0.9,
      wireframe: false,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    holoHeadGroup.add(headMesh);

    // Outer Wireframe Hologram Halo for Head
    const headWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const headWireMesh = new THREE.Mesh(headGeo, headWireMat);
    headWireMesh.scale.set(1.05, 1.05, 1.05);
    holoHeadGroup.add(headWireMesh);

    // Optical Visor (Holographic Eyes)
    const visorGeo = new THREE.TorusGeometry(0.85, 0.12, 16, 40, Math.PI * 0.85);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.rotation.x = Math.PI / 2;
    visorMesh.rotation.z = -Math.PI * 0.42;
    visorMesh.position.set(0, 0.18, 0.7);
    holoHeadGroup.add(visorMesh);

    // Audio-Reactive Mouth Resonance Nodes (Array of holographic frequency bars)
    const mouthBars = [];
    const barCount = 7;
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.65, 0.95);

    for (let i = 0; i < barCount; i++) {
      const barGeo = new THREE.BoxGeometry(0.06, 0.2, 0.04);
      const barMat = new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        emissive: 0x00f5ff,
        emissiveIntensity: 1.2,
        roughness: 0.2,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.x = (i - (barCount - 1) / 2) * 0.11;
      mouthBars.push(bar);
      mouthGroup.add(bar);
    }
    holoHeadGroup.add(mouthGroup);

    // --------------------------------------------------------------------------
    // MODEL 2: QUANTUM NEURAL ORB
    // --------------------------------------------------------------------------
    const orbGroup = new THREE.Group();
    avatarGroup.add(orbGroup);

    const orbCoreGeo = new THREE.SphereGeometry(1.35, 48, 48);
    const orbCoreMat = new THREE.MeshStandardMaterial({
      color: 0x050c1e,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.8,
    });
    const orbCoreMesh = new THREE.Mesh(orbCoreGeo, orbCoreMat);
    orbGroup.add(orbCoreMesh);

    const orbLatticeGeo = new THREE.IcosahedronGeometry(1.8, 2);
    const orbLatticeMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const orbLatticeMesh = new THREE.Mesh(orbLatticeGeo, orbLatticeMat);
    orbGroup.add(orbLatticeMesh);

    // --------------------------------------------------------------------------
    // MODEL 3: FREQUENCY MATRIX (Grid of floating pulsating cubes)
    // --------------------------------------------------------------------------
    const matrixGroup = new THREE.Group();
    avatarGroup.add(matrixGroup);

    const matrixNodes = [];
    const matrixCount = 18;
    for (let i = 0; i < matrixCount; i++) {
      const mGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const mMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00f5ff : 0xa855f7,
        emissive: i % 2 === 0 ? 0x00f5ff : 0xa855f7,
        emissiveIntensity: 0.8,
      });
      const node = new THREE.Mesh(mGeo, mMat);
      const angle = (i / matrixCount) * Math.PI * 2;
      const radius = 1.6;
      node.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1.5,
        Math.sin(angle) * radius
      );
      matrixNodes.push(node);
      matrixGroup.add(node);
    }

    // --------------------------------------------------------------------------
    // SHARED: Orbiting Data Halo Rings & Expanding Acoustic Waves
    // --------------------------------------------------------------------------
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    avatarGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    avatarGroup.add(ring2);

    // Expanding Acoustic Soundwave Rings (Active while speaking)
    const waveRings = [];
    const waveCount = 3;
    for (let i = 0; i < waveCount; i++) {
      const wGeo = new THREE.RingGeometry(0.8, 0.86, 48);
      const wMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const waveMesh = new THREE.Mesh(wGeo, wMat);
      waveMesh.position.z = 0.5;
      waveRings.push({
        mesh: waveMesh,
        phase: (i / waveCount) * Math.PI * 2,
      });
      avatarGroup.add(waveMesh);
    }

    // Ambient floating particles around the assistant
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 5;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      const isCyan = Math.random() > 0.4;
      particleColors[i * 3] = isCyan ? 0.0 : 0.65;
      particleColors[i * 3 + 1] = isCyan ? 0.96 : 0.33;
      particleColors[i * 3 + 2] = 1.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interactive Mouse Following
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotY = (x / (rect.width / 2)) * 0.45;
      targetRotX = -(y / (rect.height / 2)) * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Resize Observer / Window Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentEnergy = speechEnergyRef.current;
      const currentMode = visualModeRef.current;

      // Visibility toggling according to visualMode
      holoHeadGroup.visible = currentMode === 'avatar';
      orbGroup.visible = currentMode === 'orb';
      matrixGroup.visible = currentMode === 'matrix';

      // Mouse Smooth Damping
      avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.08;
      avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.08;

      // Base floating bobbing
      avatarGroup.position.y = Math.sin(t * 1.8) * 0.08;

      // --------------------------------------------------------------------------
      // STATE: THINKING
      // --------------------------------------------------------------------------
      if (currentState === 'thinking') {
        ring1.rotation.z = t * 3.5;
        ring2.rotation.z = -t * 3.0;
        ring1Mat.color.setHex(0xffaa00);
        ring2Mat.color.setHex(0xff00aa);
        visorMat.emissiveIntensity = 2.2 + Math.sin(t * 12) * 0.8;
        headMat.emissiveIntensity = 0.5 + Math.sin(t * 8) * 0.3;
        mouthPointLight.intensity = 1.0;
      }
      // --------------------------------------------------------------------------
      // STATE: SPEAKING
      // --------------------------------------------------------------------------
      else if (currentState === 'speaking') {
        ring1.rotation.z = t * 1.6;
        ring2.rotation.z = -t * 1.4;
        ring1Mat.color.setHex(0x00f5ff);
        ring2Mat.color.setHex(0xa855f7);

        // Mouth bars bounce vigorously according to speechEnergy
        mouthBars.forEach((bar, idx) => {
          const centerDist = Math.abs(idx - (barCount - 1) / 2);
          const factor = 1 - centerDist * 0.2;
          const osc = Math.sin(t * 22 + idx * 0.9) * 0.5 + 0.5;
          const scaleY = Math.max(0.2, (currentEnergy * 2.8 * factor + osc * 0.6));
          bar.scale.set(1, scaleY, 1);
        });

        // Visor & Core glow surges with speech audio
        visorMat.emissiveIntensity = 1.8 + currentEnergy * 2.0;
        headMat.emissiveIntensity = 0.25 + currentEnergy * 0.5;
        mouthPointLight.intensity = 1.5 + currentEnergy * 4;

        // Propagate expanding acoustic shockwave rings
        waveRings.forEach((w) => {
          w.phase += 0.06;
          const r = 1.0 + (w.phase % (Math.PI * 2)) * 0.6;
          w.mesh.scale.set(r, r, 1);
          const opacity = Math.max(0, 0.8 - (r - 1.0) / 2.5) * (0.3 + currentEnergy * 0.7);
          w.mesh.material.opacity = opacity;
        });
      }
      // --------------------------------------------------------------------------
      // STATE: LISTENING (Microphone Active)
      // --------------------------------------------------------------------------
      else if (currentState === 'listening') {
        ring1.rotation.z = t * 1.2;
        ring2.rotation.z = -t * 1.0;
        ring1Mat.color.setHex(0x10b981); // Emerald Green
        ring2Mat.color.setHex(0x00f5ff);
        visorMat.emissive.setHex(0x10b981);
        visorMat.emissiveIntensity = 2.0 + Math.sin(t * 6) * 0.6;
        mouthBars.forEach((bar) => {
          bar.scale.set(1, 0.4, 1);
        });
        waveRings.forEach((w) => (w.mesh.material.opacity = 0));
      }
      // --------------------------------------------------------------------------
      // STATE: IDLE
      // --------------------------------------------------------------------------
      else {
        ring1.rotation.z = t * 0.5;
        ring2.rotation.z = -t * 0.4;
        ring1Mat.color.setHex(0x00f5ff);
        ring2Mat.color.setHex(0xa855f7);
        visorMat.emissive.setHex(0x00ffff);
        visorMat.emissiveIntensity = 1.2 + Math.sin(t * 2) * 0.3;
        headMat.emissiveIntensity = 0.2;
        mouthPointLight.intensity = 1.0;

        mouthBars.forEach((bar, idx) => {
          const idleWave = Math.sin(t * 3 + idx * 0.5) * 0.2 + 0.3;
          bar.scale.set(1, idleWave, 1);
        });

        waveRings.forEach((w) => {
          w.mesh.material.opacity = 0;
        });
      }

      // Model-specific continuous rotations
      if (currentMode === 'orb') {
        orbLatticeMesh.rotation.y = t * 0.25;
        orbLatticeMesh.rotation.x = t * 0.15;
        const pulse = 1.0 + (currentState === 'speaking' ? currentEnergy * 0.2 : Math.sin(t * 2) * 0.05);
        orbCoreMesh.scale.set(pulse, pulse, pulse);
      } else if (currentMode === 'matrix') {
        matrixNodes.forEach((node, i) => {
          node.rotation.x = t + i;
          node.rotation.y = t * 0.8 + i;
          if (currentState === 'speaking') {
            node.scale.set(1 + currentEnergy * 0.6, 1 + currentEnergy * 0.6, 1 + currentEnergy * 0.6);
          } else {
            node.scale.set(1, 1, 1);
          }
        });
      }

      // Slowly rotate particle field
      particles.rotation.y = t * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      headGeo.dispose();
      headMat.dispose();
      headWireMat.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      orbCoreGeo.dispose();
      orbCoreMat.dispose();
      orbLatticeGeo.dispose();
      orbLatticeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [inView]);

  return (
    <div
      ref={containerRef}
      className="assistant-3d-canvas-wrapper"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    />
  );
}
