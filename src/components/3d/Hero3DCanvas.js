"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3DCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    // 2. Renderer with High Performance & Alpha
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for Hero3DCanvas', e);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f5ff, 4, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 4, 20);
    pointLight2.position.set(-5, -4, 4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x38bdf8, 3, 15);
    pointLight3.position.set(0, 6, -2);
    scene.add(pointLight3);

    // Root Group for Mouse Parallax
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 4. Central Glowing AI Nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // 5. Geodesic Wireframe Shell
    const shellGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const shellWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const shell = new THREE.Mesh(shellGeo, shellWireMat);
    coreGroup.add(shell);

    // Shell Nodes (Vertex Points)
    const shellPos = shellGeo.attributes.position;
    const nodeCount = shellPos.count;
    const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const nodeGroup = new THREE.Group();
    for (let i = 0; i < nodeCount; i += 3) {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(shellPos.getX(i), shellPos.getY(i), shellPos.getZ(i));
      nodeGroup.add(nodeMesh);
    }
    coreGroup.add(nodeGroup);

    // 6. Dual Orbital Gyroscope Rings
    const ring1Geo = new THREE.TorusGeometry(2.35, 0.022, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.85, 0.018, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    coreGroup.add(ring2);

    // Orbiting Satellite Beads on Rings
    const beadGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const bead1Mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x00f5ff, emissiveIntensity: 1.5 });
    const bead1 = new THREE.Mesh(beadGeo, bead1Mat);
    const bead2 = new THREE.Mesh(beadGeo, bead1Mat);
    coreGroup.add(bead1);
    coreGroup.add(bead2);

    // 7. Surrounding Quantum Data Particles
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 1.8;

      const sinPhi = Math.sin(phi);
      particlePositions[i * 3] = r * sinPhi * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const isCyan = Math.random() > 0.4;
      particleColors[i * 3] = isCyan ? 0.0 : 0.55;
      particleColors[i * 3 + 1] = isCyan ? 0.96 : 0.36;
      particleColors[i * 3 + 2] = isCyan ? 1.0 : 0.96;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const quantumParticles = new THREE.Points(particlesGeo, particlesMat);
    coreGroup.add(quantumParticles);

    // 8. Mouse Interaction & Tilt Lerping
    let targetRotX = 0;
    let targetRotY = 0;
    let isHovered = false;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotY = (x / (rect.width / 2)) * 0.45;
      targetRotX = -(y / (rect.height / 2)) * 0.45;
    };

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => {
      isHovered = false;
      targetRotX = 0;
      targetRotY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 540;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const speedMult = isHovered ? 1.4 : 1.0;

      // Inertial Parallax Damping
      coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * 0.06;
      coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * 0.06;

      // Ambient Core Spin
      shell.rotation.y = t * 0.15 * speedMult;
      shell.rotation.x = t * 0.08 * speedMult;
      nodeGroup.rotation.y = shell.rotation.y;
      nodeGroup.rotation.x = shell.rotation.x;

      // Nucleus Breathing / Pulsation
      const pulse = 1 + Math.sin(t * 2.8) * 0.06;
      nucleus.scale.set(pulse, pulse, pulse);
      nucleus.rotation.y = -t * 0.25;

      // Gyroscope Rings Rotation
      ring1.rotation.z = t * 0.35 * speedMult;
      ring1.rotation.x = Math.PI / 3 + Math.sin(t * 0.6) * 0.15;

      ring2.rotation.z = -t * 0.28 * speedMult;
      ring2.rotation.y = Math.PI / 6 + Math.cos(t * 0.5) * 0.15;

      // Orbiting Beads Position Calculation
      const r1Angle = t * 1.2 * speedMult;
      bead1.position.set(
        Math.cos(r1Angle) * 2.35,
        Math.sin(r1Angle) * 2.35 * Math.cos(Math.PI / 3),
        Math.sin(r1Angle) * 2.35 * Math.sin(Math.PI / 3)
      );

      const r2Angle = -t * 0.9 * speedMult;
      bead2.position.set(
        Math.cos(r2Angle) * 2.85,
        Math.sin(r2Angle) * 2.85 * Math.cos(-Math.PI / 4),
        Math.sin(r2Angle) * 2.85 * Math.sin(-Math.PI / 4)
      );

      // Particle Swarm Orbit
      quantumParticles.rotation.y = t * 0.06;
      quantumParticles.rotation.z = t * 0.04;

      // Floating Bob
      coreGroup.position.y = Math.sin(t * 1.2) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Memory Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);

      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      nucleusGeo.dispose();
      nucleusMat.dispose();
      shellGeo.dispose();
      shellWireMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      beadGeo.dispose();
      bead1Mat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-3d-canvas-wrapper"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'grab',
      }}
    />
  );
}
