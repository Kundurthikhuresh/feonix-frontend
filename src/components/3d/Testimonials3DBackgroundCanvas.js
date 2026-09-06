"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Testimonials3DBackgroundCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 700;

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
      console.warn('WebGL not supported for Testimonials3DBackgroundCanvas', e);
      return;
    }

    // 3. Cyber Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5ff, 3, 40);
    cyanLight.position.set(10, 10, 5);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 3, 40);
    purpleLight.position.set(-10, -10, 5);
    scene.add(purpleLight);

    const group = new THREE.Group();
    scene.add(group);

    // 4. Luminous 3D Wireframe Polyhedrons (Pushed into background depth z < -4)
    const geometryList = [
      new THREE.IcosahedronGeometry(0.5, 1),
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.TetrahedronGeometry(0.65, 0),
      new THREE.SphereGeometry(0.4, 16, 16)
    ];

    const colors = [0x00f5ff, 0x8b5cf6, 0x38bdf8, 0xa855f7, 0x10b981];
    const nodes = [];

    for (let i = 0; i < 35; i++) {
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
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 20;
      const z = -4 - Math.random() * 12; // Farther back so it doesn't clip into cards

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.008,
        rotSpeedY: (Math.random() - 0.5) * 0.008,
        initialY: y,
        floatSpeed: 0.6 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2
      };

      group.add(mesh);
      nodes.push(mesh);
    }

    // 5. Connect Synaptic Lines between background nodes
    const maxConnections = 60;
    const lineCoords = new Float32Array(maxConnections * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lineCoords, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(linesMesh);

    // 6. Background Starfield Constellation Points
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
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // 7. Mouse Parallax Tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      targetRotY = (x / (window.innerWidth / 2)) * 0.2;
      targetRotX = (y / (window.innerHeight / 2)) * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 700;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Parallax damping
      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.y += 0.0008;

      // Animate 3D Nodes
      nodes.forEach((node) => {
        node.rotation.x += node.userData.rotSpeedX;
        node.rotation.y += node.userData.rotSpeedY;
        node.position.y = node.userData.initialY + Math.sin(elapsed * node.userData.floatSpeed + node.userData.phase) * 0.25;
      });

      // Update Lines
      const linePositions = lineGeo.attributes.position.array;
      let lineIndex = 0;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (lineIndex >= maxConnections * 6) break;

          const dist = nodes[i].position.distanceTo(nodes[j].position);
          if (dist < 6.5) {
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
      lineGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
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
  );
}
