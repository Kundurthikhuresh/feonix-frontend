"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useInViewport } from '../../hooks/useInViewport';

export default function SecurityShieldCanvas({ pulseCount = 0 }) {
  const containerRef = useRef(null);
  const pulseRef = useRef(pulseCount);
  const inView = useInViewport(containerRef);

  useEffect(() => {
    pulseRef.current = pulseCount;
  }, [pulseCount]);

  useEffect(() => {
    if (!containerRef.current || !inView) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 6);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for SecurityShieldCanvas', e);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x10b981, 4, 20);
    pointLight1.position.set(3, 4, 5);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x00f5ff, 3, 20);
    pointLight2.position.set(-3, -2, 4);
    scene.add(pointLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Main shield - wireframe octahedron
    const shieldGeo = new THREE.OctahedronGeometry(1.6, 1);
    const shieldMat = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    rootGroup.add(shieldMesh);

    // Inner icosahedron core
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7,
      shininess: 100,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Core wireframe overlay
    const coreWireGeo = new THREE.IcosahedronGeometry(0.65, 1);
    const coreWireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const coreWire = new THREE.Mesh(coreWireGeo, coreWireMat);
    rootGroup.add(coreWire);

    // Rotating cipher rings
    const createRing = (innerR, outerR, color, opacity) => {
      const geo = new THREE.RingGeometry(innerR, outerR, 48);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      });
      return new THREE.Mesh(geo, mat);
    };

    const ring1 = createRing(1.8, 1.92, 0x10b981, 0.2);
    ring1.rotation.x = Math.PI / 2;
    rootGroup.add(ring1);

    const ring2 = createRing(2.1, 2.2, 0x00f5ff, 0.15);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    rootGroup.add(ring2);

    const ring3 = createRing(2.4, 2.48, 0x8b5cf6, 0.1);
    ring3.rotation.x = Math.PI / 4;
    ring3.rotation.y = Math.PI / 3;
    rootGroup.add(ring3);

    // Shield vertex particles
    const shieldVertices = shieldGeo.attributes.position;
    const vertexCount = shieldVertices.count;
    const vertexPositions = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i++) {
      vertexPositions[i * 3] = shieldVertices.getX(i) * 1.0;
      vertexPositions[i * 3 + 1] = shieldVertices.getY(i) * 1.0;
      vertexPositions[i * 3 + 2] = shieldVertices.getZ(i) * 1.0;
    }
    const vpGeo = new THREE.BufferGeometry();
    vpGeo.setAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
    const vpMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const vertexPoints = new THREE.Points(vpGeo, vpMat);
    rootGroup.add(vertexPoints);

    // Pulse shockwave rings (for interactive pulse)
    const pulseRings = [];
    const createPulseRing = () => {
      const geo = new THREE.RingGeometry(0.1, 0.2, 48);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      rootGroup.add(mesh);
      return { mesh, geo, mat, active: false, scale: 1, life: 0 };
    };

    for (let i = 0; i < 5; i++) {
      pulseRings.push(createPulseRing());
    }

    let lastPulseCount = pulseRef.current;
    let pulseIndex = 0;

    // Floating data particles
    const particleCount = 80;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 10;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(pGeo, pMat);
    rootGroup.add(particles);

    // Animation
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Rotate shield
      shieldMesh.rotation.y = t * 0.2;
      shieldMesh.rotation.x = Math.sin(t * 0.15) * 0.1;
      vertexPoints.rotation.y = t * 0.2;
      vertexPoints.rotation.x = Math.sin(t * 0.15) * 0.1;

      // Core rotation
      coreMesh.rotation.y = -t * 0.3;
      coreMesh.rotation.z = t * 0.1;
      coreWire.rotation.y = t * 0.15;
      coreWire.rotation.x = -t * 0.1;

      // Core pulse
      const cp = 1 + Math.sin(t * 1.5) * 0.08;
      coreMesh.scale.setScalar(cp);

      // Rings rotation
      ring1.rotation.z = t * 0.15;
      ring2.rotation.y = -t * 0.1;
      ring2.rotation.z = Math.PI / 4 + t * 0.05;
      ring3.rotation.x = Math.PI / 4 + t * 0.08;
      ring3.rotation.z = -t * 0.12;

      // Shield breathing
      const breathe = 1 + Math.sin(t * 0.8) * 0.03;
      shieldMesh.scale.setScalar(breathe);

      // Pulse shockwave check
      if (pulseRef.current > lastPulseCount) {
        const ring = pulseRings[pulseIndex % pulseRings.length];
        ring.active = true;
        ring.scale = 0.3;
        ring.life = 0;
        ring.mesh.visible = true;
        ring.mat.opacity = 0.7;
        ring.mesh.scale.setScalar(0.3);
        ring.mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          0
        );
        pulseIndex++;
        lastPulseCount = pulseRef.current;
      }

      // Animate pulse rings
      pulseRings.forEach((ring) => {
        if (ring.active) {
          ring.life += 0.02;
          ring.scale += 0.06;
          ring.mat.opacity = Math.max(0, 0.7 - ring.life * 0.7);
          ring.mesh.scale.setScalar(ring.scale);
          if (ring.life >= 1) {
            ring.active = false;
            ring.mesh.visible = false;
          }
        }
      });

      // Slow root sway
      rootGroup.rotation.y = Math.sin(t * 0.06) * 0.12;

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
      style={{ width: '100%', height: '100%', minHeight: 400, position: 'relative' }}
    />
  );
}
