"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const NODES_DATA = [
  { id: 'core', label: 'AI CORE ENGINE', x: 0, y: 0, z: 0, size: 0.5, color: 0x00f5ff, primary: true },
  { id: 'models', label: 'AI Models (GPT-4o)', x: 2.8, y: 1.4, z: 0.5, size: 0.28, color: 0x8b5cf6 },
  { id: 'automation', label: 'Automation & Cues', x: -2.7, y: 1.6, z: -0.4, size: 0.28, color: 0x00f5ff },
  { id: 'analytics', label: 'Analytics & Telemetry', x: 3.0, y: -1.2, z: -0.8, size: 0.28, color: 0x38bdf8 },
  { id: 'prediction', label: 'Predictive Synthesis', x: -2.5, y: -1.5, z: 0.7, size: 0.28, color: 0xa855f7 },
  { id: 'intelligence', label: 'Adaptive Intelligence', x: 0.2, y: 2.6, z: -1.0, size: 0.28, color: 0x00f5ff },
  { id: 'rag', label: 'Dynamic RAG Context', x: -0.3, y: -2.5, z: 1.0, size: 0.28, color: 0x38bdf8 },
  { id: 'latency', label: 'Ultra-Low Latency (<1.5s)', x: 1.8, y: 2.3, z: 1.2, size: 0.24, color: 0x10b981 },
  { id: 'voice', label: 'Multi-Modal Voice Decoders', x: -1.9, y: 0.2, z: 2.0, size: 0.24, color: 0xec4899 },
  { id: 'privacy', label: 'Sandbox Isolation', x: 2.2, y: -0.4, z: 2.1, size: 0.24, color: 0x00f5ff },
];

export default function NeuralNetworkCanvas() {
  const containerRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9.5);

    // 2. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for NeuralNetworkCanvas', e);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f5ff, 4, 25);
    pointLight1.position.set(4, 5, 6);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 4, 25);
    pointLight2.position.set(-4, -5, 5);
    scene.add(pointLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 4. Create Neural Nodes
    const nodeMeshes = [];
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);

    NODES_DATA.forEach((node) => {
      const mat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: node.primary ? 0.9 : 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.set(node.size, node.size, node.size);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = node;
      rootGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Add a faint wireframe glow envelope around each node
      const glowGeo = new THREE.IcosahedronGeometry(node.size * 1.5, 1);
      const glowMat = new THREE.MeshBasicMaterial({
        color: node.color,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(node.x, node.y, node.z);
      rootGroup.add(glowMesh);
    });

    // 5. Connect Synaptic Lines between Core and Peripheral Nodes, and between neighbors
    const lineCoords = [];
    const coreNode = NODES_DATA[0];

    for (let i = 1; i < NODES_DATA.length; i++) {
      // Connect to Core
      lineCoords.push(coreNode.x, coreNode.y, coreNode.z);
      lineCoords.push(NODES_DATA[i].x, NODES_DATA[i].y, NODES_DATA[i].z);

      // Connect to next neighboring node for network mesh effect
      const nextIdx = i === NODES_DATA.length - 1 ? 1 : i + 1;
      lineCoords.push(NODES_DATA[i].x, NODES_DATA[i].y, NODES_DATA[i].z);
      lineCoords.push(NODES_DATA[nextIdx].x, NODES_DATA[nextIdx].y, NODES_DATA[nextIdx].z);
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));

    const linesMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(linesGeo, linesMat);
    rootGroup.add(lines);

    // 6. Data Packets (Pulsing glowing dots flowing along synapses)
    const packetCount = 24;
    const packetPositions = new Float32Array(packetCount * 3);
    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
    const packetMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const packets = new THREE.Points(packetGeo, packetMat);
    rootGroup.add(packets);

    // Track packet progress
    const packetData = Array.from({ length: packetCount }, (_, idx) => {
      const targetNodeIdx = (idx % (NODES_DATA.length - 1)) + 1;
      return {
        target: NODES_DATA[targetNodeIdx],
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.008,
      };
    });

    // 7. Mouse Rotation & Parallax
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotY = (x / (rect.width / 2)) * 0.4;
      targetRotX = -(y / (rect.height / 2)) * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 800;
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

      // Parallax damping
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.05;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.05;

      // Base slow ambient spin
      rootGroup.rotation.y += 0.002;

      // Core pulse
      const coreScale = 0.5 + Math.sin(t * 3) * 0.04;
      nodeMeshes[0].scale.set(coreScale, coreScale, coreScale);

      // Animate Data Packets along lines
      const positions = packetGeo.attributes.position.array;
      packetData.forEach((p, i) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        positions[i * 3] = coreNode.x + (p.target.x - coreNode.x) * p.progress;
        positions[i * 3 + 1] = coreNode.y + (p.target.y - coreNode.y) * p.progress;
        positions[i * 3 + 2] = coreNode.z + (p.target.z - coreNode.z) * p.progress;
      });
      packetGeo.attributes.position.needsUpdate = true;

      // Floating gentle bobbing
      rootGroup.position.y = Math.sin(t * 1.5) * 0.1;

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

      sphereGeo.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      packetGeo.dispose();
      packetMat.dispose();
      nodeMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="neural-network-canvas-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '460px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* HUD Telemetry Overlay on Top of Canvas */}
      <div className="neural-hud-tags" aria-hidden="true">
        <div className="neural-hud-badge top-left">
          <span className="dot pulse"></span>
          <span>NEURAL TOPOLOGY: ACTIVE</span>
        </div>
        <div className="neural-hud-badge top-right">
          <span>LATENCY: 1.2 MS · BANDWIDTH: OPTIMAL</span>
        </div>
      </div>
    </div>
  );
}
