"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AIOrbCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    // 2. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for AIOrbCanvas', e);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5ff, 5, 20);
    cyanLight.position.set(4, 4, 4);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 5, 20);
    purpleLight.position.set(-4, -4, 4);
    scene.add(purpleLight);

    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 4. Glowing Plasma Core Sphere
    const coreGeo = new THREE.SphereGeometry(1.6, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x050c1e,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    orbGroup.add(coreMesh);

    // 5. Outer Energy Halo / Wireframe Mesh
    const haloGeo = new THREE.IcosahedronGeometry(2.1, 3);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    orbGroup.add(haloMesh);

    // 6. Orbiting Aurora Particle Ring
    const ringParticleCount = 200;
    const ringPositions = new Float32Array(ringParticleCount * 3);
    const ringColors = new Float32Array(ringParticleCount * 3);

    for (let i = 0; i < ringParticleCount; i++) {
      const angle = (i / ringParticleCount) * Math.PI * 2;
      const radius = 2.6 + (Math.random() - 0.5) * 0.4;
      ringPositions[i * 3] = Math.cos(angle) * radius;
      ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.35;
      ringPositions[i * 3 + 2] = Math.sin(angle) * radius;

      const isCyan = i % 2 === 0;
      ringColors[i * 3] = isCyan ? 0.0 : 0.6;
      ringColors[i * 3 + 1] = isCyan ? 0.96 : 0.35;
      ringColors[i * 3 + 2] = isCyan ? 1.0 : 0.96;
    }

    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    ringGeo.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));

    const ringMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleRing = new THREE.Points(ringGeo, ringMat);
    particleRing.rotation.x = Math.PI / 4;
    particleRing.rotation.z = Math.PI / 8;
    orbGroup.add(particleRing);

    // 7. Mouse Follow Damping
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotY = (x / (rect.width / 2)) * 0.3;
      targetRotX = -(y / (rect.height / 2)) * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Mouse Lerp
      orbGroup.rotation.x += (targetRotX - orbGroup.rotation.x) * 0.05;
      orbGroup.rotation.y += (targetRotY - orbGroup.rotation.y) * 0.05;

      // Pulse and breathing wave
      const pulse = 1.6 + Math.sin(t * 2.2) * 0.08;
      coreMesh.scale.set(pulse / 1.6, pulse / 1.6, pulse / 1.6);

      haloMesh.rotation.y = t * 0.12;
      haloMesh.rotation.x = t * 0.08;

      particleRing.rotation.y = t * 0.2;

      // Bobbing
      orbGroup.position.y = Math.sin(t * 1.4) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Memory Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      coreGeo.dispose();
      coreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ai-orb-canvas-wrapper"
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
      }}
    />
  );
}
