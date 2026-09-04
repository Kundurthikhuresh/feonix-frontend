"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useInViewport } from '../../hooks/useInViewport';

const PLATFORM_NODES = [
  { id: 'codesignal', label: 'CodeSignal', color: 0x00f5ff, radius: 3.4 },
  { id: 'leetcode', label: 'LeetCode Live', color: 0xf59e0b, radius: 3.8 },
  { id: 'hackerrank', label: 'HackerRank', color: 0x10b981, radius: 3.2 },
  { id: 'zoom', label: 'Zoom Video', color: 0x2d8cff, radius: 3.6 },
  { id: 'meet', label: 'Google Meet', color: 0x00897b, radius: 3.9 },
  { id: 'teams', label: 'MS Teams', color: 0x6264a7, radius: 3.3 },
  { id: 'bytebytego', label: 'System Design', color: 0xa855f7, radius: 3.7 },
  { id: 'slack', label: 'Slack & ATS', color: 0xe01e5a, radius: 3.5 },
];

export default function Integrations3DCanvas({ activeIntegrationId = 'codesignal', onSelectIntegration }) {
  const containerRef = useRef(null);
  const activeIdRef = useRef(activeIntegrationId);
  const inView = useInViewport(containerRef);

  useEffect(() => {
    activeIdRef.current = activeIntegrationId;
  }, [activeIntegrationId]);

  useEffect(() => {
    if (!containerRef.current || !inView) return;
    const container = containerRef.current;
    let width = container.clientWidth || 700;
    let height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 8.5);
    camera.lookAt(0, 0, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported', e);
      return;
    }

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5ff, 4, 25);
    cyanLight.position.set(5, 6, 6);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 4, 25);
    purpleLight.position.set(-5, -5, 5);
    scene.add(purpleLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 3, 18);
    emeraldLight.position.set(0, 5, -4);
    scene.add(emeraldLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 3. Central Glowing Quantum Reactor Core
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Wireframe Outer Layer
    const wireGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    rootGroup.add(wireMesh);

    // 4. Dual Orbital Gyroscope Rings
    const ring1Geo = new THREE.TorusGeometry(1.6, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    rootGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.1, 0.018, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 6;
    rootGroup.add(ring2);

    // 5. Platform Node Spheres & Laser Beams
    const nodeMeshes = [];
    const nodeData = [];

    PLATFORM_NODES.forEach((node, i) => {
      const angle = (i / PLATFORM_NODES.length) * Math.PI * 2;
      const group = new THREE.Group();

      // Node Sphere
      const sphereGeo = new THREE.SphereGeometry(0.24, 24, 24);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.5,
        shininess: 90,
        transparent: true,
        opacity: 0.95,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphere);

      // Glowing Ring Halo around node
      const haloGeo = new THREE.RingGeometry(0.32, 0.4, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(camera.position);
      group.add(halo);

      // Initial Position
      const x = Math.cos(angle) * node.radius;
      const z = Math.sin(angle) * node.radius;
      const y = Math.sin(i * 0.8) * 0.6;
      group.position.set(x, y, z);
      rootGroup.add(group);

      // Energy Laser Line connecting to Core
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(points);
      const beamMat = new THREE.LineBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.25,
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      rootGroup.add(beam);

      nodeMeshes.push(sphere);
      nodeData.push({
        id: node.id,
        group,
        sphere,
        sphereMat,
        beam,
        beamGeo,
        beamMat,
        baseAngle: angle,
        radius: node.radius,
      });
    });

    // 6. Background 3D Grid Matrix Floor
    const grid = new THREE.GridHelper(30, 40, 0x00f5ff, 0x1e293b);
    grid.position.y = -2.6;
    grid.rotation.x = Math.PI * 0.04;
    rootGroup.add(grid);

    // 7. Floating Quantum Particles Vortex
    const pCount = 160;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    rootGroup.add(particles);

    // 8. Mouse Interaction Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredIdx = -1;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = () => {
      if (hoveredIdx >= 0 && onSelectIntegration) {
        onSelectIntegration(PLATFORM_NODES[hoveredIdx].id);
      }
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('click', handleClick);

    // 9. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Core spin & pulse
      coreMesh.rotation.y = t * 0.35;
      coreMesh.rotation.x = Math.sin(t * 0.2) * 0.15;
      wireMesh.rotation.y = -t * 0.25;

      const pulse = 1 + Math.sin(t * 3) * 0.06;
      coreMesh.scale.setScalar(pulse);

      // Gyroscope rings rotation
      ring1.rotation.z = t * 0.4;
      ring1.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.15;

      ring2.rotation.z = -t * 0.3;
      ring2.rotation.y = Math.PI / 6 + Math.cos(t * 0.4) * 0.15;

      // Orbit platform nodes
      nodeData.forEach((node, i) => {
        const angle = node.baseAngle + t * 0.15 + i * 0.02;
        const x = Math.cos(angle) * node.radius;
        const z = Math.sin(angle) * node.radius;
        const y = Math.sin(t * 0.8 + i) * 0.5;

        node.group.position.set(x, y, z);

        // Update energy beam line positions
        const beamPos = node.beamGeo.attributes.position;
        if (beamPos) {
          beamPos.setXYZ(1, x, y, z);
          beamPos.needsUpdate = true;
        }

        // Active node highlight
        const isSelected = activeIdRef.current === node.id;
        if (isSelected) {
          node.sphereMat.emissiveIntensity = 1.0;
          node.sphere.scale.setScalar(1.4);
          node.beamMat.opacity = 0.8;
        } else if (i !== hoveredIdx) {
          node.sphereMat.emissiveIntensity = 0.45;
          node.sphere.scale.setScalar(1.0);
          node.beamMat.opacity = 0.25;
        }
      });

      // Raycaster hover detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hitIdx = nodeMeshes.indexOf(intersects[0].object);
        if (hitIdx !== hoveredIdx) {
          hoveredIdx = hitIdx;
          container.style.cursor = 'pointer';
          nodeData[hitIdx].sphereMat.emissiveIntensity = 1.0;
          nodeData[hitIdx].sphere.scale.setScalar(1.45);
          nodeData[hitIdx].beamMat.opacity = 0.9;
        }
      } else {
        if (hoveredIdx >= 0) {
          container.style.cursor = 'grab';
          hoveredIdx = -1;
        }
      }

      // Parallax Mouse Tilt
      rootGroup.rotation.y = Math.sin(t * 0.1) * 0.15 + mouse.x * 0.2;
      rootGroup.rotation.x = Math.cos(t * 0.1) * 0.08 - mouse.y * 0.15;

      // Particle Vortex Orbit
      particles.rotation.y = t * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Handler
    const handleResize = () => {
      width = container.clientWidth || 700;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [onSelectIntegration, inView]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 480,
        position: 'relative',
        cursor: 'grab'
      }}
    />
  );
}


