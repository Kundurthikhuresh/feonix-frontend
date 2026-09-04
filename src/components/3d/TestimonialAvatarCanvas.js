"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useInViewport } from '../../hooks/useInViewport';

export default function TestimonialAvatarCanvas() {
  const containerRef = useRef(null);
  const inView = useInViewport(containerRef);

  useEffect(() => {
    if (!containerRef.current || !inView) return;

    const container = containerRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for TestimonialAvatarCanvas', e);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f5ff, 3, 15);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 15);
    pointLight2.position.set(-2, -1, 3);
    scene.add(pointLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // AI Orb - main sphere
    const orbGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const orbMat = new THREE.MeshPhongMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.85,
      shininess: 120,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    rootGroup.add(orbMesh);

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.5,
      shininess: 100,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    rootGroup.add(innerMesh);

    // Halo rings
    const createHaloRing = (innerR, outerR, color, opacity, rotX, rotY) => {
      const geo = new THREE.RingGeometry(innerR, outerR, 48);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = rotX;
      mesh.rotation.y = rotY;
      return mesh;
    };

    const halo1 = createHaloRing(0.85, 0.95, 0x00f5ff, 0.25, Math.PI / 2, 0);
    rootGroup.add(halo1);

    const halo2 = createHaloRing(1.05, 1.12, 0x8b5cf6, 0.15, Math.PI / 3, Math.PI / 6);
    rootGroup.add(halo2);

    const halo3 = createHaloRing(1.2, 1.26, 0x00f5ff, 0.1, Math.PI / 4, -Math.PI / 4);
    rootGroup.add(halo3);

    // Particle trail
    const trailCount = 60;
    const trailPositions = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      const angle = (i / trailCount) * Math.PI * 4;
      const r = 1.0 + (i / trailCount) * 0.8;
      trailPositions[i * 3] = Math.cos(angle) * r;
      trailPositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      trailPositions[i * 3 + 2] = Math.sin(angle) * r;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    rootGroup.add(trailPoints);

    // Animation
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Orb pulse
      const pulse = 1 + Math.sin(t * 2) * 0.06;
      orbMesh.scale.setScalar(pulse);
      innerMesh.scale.setScalar(pulse * 0.95);

      // Orb glow cycle
      orbMat.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.15;

      // Slow rotation
      orbMesh.rotation.y = t * 0.4;
      innerMesh.rotation.y = -t * 0.3;
      innerMesh.rotation.x = t * 0.1;

      // Halo rings rotation
      halo1.rotation.z = t * 0.2;
      halo2.rotation.y = Math.PI / 6 + t * 0.15;
      halo2.rotation.z = -t * 0.1;
      halo3.rotation.x = Math.PI / 4 + t * 0.08;
      halo3.rotation.z = t * 0.12;

      // Trail orbit
      trailPoints.rotation.y = t * 0.15;
      trailPoints.rotation.x = Math.sin(t * 0.3) * 0.1;

      // Root float
      rootGroup.position.y = Math.sin(t * 0.8) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [inView]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 180, position: 'relative' }}
    />
  );
}
