"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useInViewport } from '../../hooks/useInViewport';

export default function LatencyWaveformCanvas({ isBenchmarkRunning = false }) {
  const containerRef = useRef(null);
  const benchRef = useRef(isBenchmarkRunning);
  const inView = useInViewport(containerRef);

  useEffect(() => {
    benchRef.current = isBenchmarkRunning;
  }, [isBenchmarkRunning]);

  useEffect(() => {
    if (!containerRef.current || !inView) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 0, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported for LatencyWaveformCanvas', e);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x00f5ff, 3, 20);
    pointLight1.position.set(4, 5, 6);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 20);
    pointLight2.position.set(-4, -2, 5);
    scene.add(pointLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 3D Waveform ribbon
    const ribbonSegments = 128;
    const ribbonWidth = 8;
    const ribbonDepth = 4;
    const ribbonVertices = [];
    const ribbonColors = [];

    for (let i = 0; i <= ribbonSegments; i++) {
      for (let j = 0; j <= 1; j++) {
        const x = (i / ribbonSegments - 0.5) * ribbonWidth;
        const z = (j - 0.5) * ribbonDepth;
        ribbonVertices.push(x, 0, z);
        // Gradient from cyan to magenta
        const t = i / ribbonSegments;
        ribbonColors.push(
          t < 0.5 ? 0 : (t - 0.5) * 2,   // R
          1 - t * 0.5,                       // G
          1                                   // B
        );
      }
    }

    const ribbonIndices = [];
    for (let i = 0; i < ribbonSegments; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      ribbonIndices.push(a, c, b);
      ribbonIndices.push(b, c, d);
    }

    const ribbonGeo = new THREE.BufferGeometry();
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ribbonVertices), 3));
    ribbonGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(ribbonColors), 3));
    ribbonGeo.setIndex(ribbonIndices);
    ribbonGeo.computeVertexNormals();

    const ribbonMat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      shininess: 60,
      emissive: 0x001122,
      emissiveIntensity: 0.3,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.y = -0.5;
    rootGroup.add(ribbonMesh);

    // Wireframe overlay
    const wireGeo = ribbonGeo.clone();
    const wireMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.1,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.position.y = -0.5;
    rootGroup.add(wireMesh);

    // Grid floor
    const gridGeo = new THREE.PlaneGeometry(10, 6, 20, 12);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -2;
    rootGroup.add(gridMesh);

    // Data point particles along the waveform
    const dataCount = 80;
    const dataPositions = new Float32Array(dataCount * 3);
    for (let i = 0; i < dataCount; i++) {
      dataPositions[i * 3] = (Math.random() - 0.5) * ribbonWidth;
      dataPositions[i * 3 + 1] = Math.random() * 2 - 1;
      dataPositions[i * 3 + 2] = (Math.random() - 0.5) * ribbonDepth;
    }
    const dataGeo = new THREE.BufferGeometry();
    dataGeo.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3));
    const dataMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const dataPoints = new THREE.Points(dataGeo, dataMat);
    dataPoints.position.y = -0.5;
    rootGroup.add(dataPoints);

    // Benchmark indicator bars
    const barCount = 8;
    const bars = [];
    for (let i = 0; i < barCount; i++) {
      const barGeo = new THREE.BoxGeometry(0.15, 1, 0.15);
      const barMat = new THREE.MeshPhongMaterial({
        color: i < barCount / 2 ? 0x00f5ff : 0x8b5cf6,
        emissive: i < barCount / 2 ? 0x00f5ff : 0x8b5cf6,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.6,
      });
      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.position.set(
        (i - barCount / 2 + 0.5) * 0.6,
        -1.5,
        -ribbonDepth / 2 - 0.5
      );
      barMesh.scale.y = 0.1;
      rootGroup.add(barMesh);
      bars.push({ mesh: barMesh, target: 0.1, current: 0.1 });
    }

    // Animation
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Animate ribbon waveform
      const positions = ribbonGeo.attributes.position.array;
      const speed = benchRef.current ? 4 : 1.5;
      const amplitude = benchRef.current ? 1.2 : 0.6;

      for (let i = 0; i <= ribbonSegments; i++) {
        for (let j = 0; j <= 1; j++) {
          const idx = (i * 2 + j) * 3 + 1; // y component
          const x = (i / ribbonSegments - 0.5) * ribbonWidth;
          const z = (j - 0.5) * ribbonDepth;

          positions[idx] =
            Math.sin(x * 1.5 + t * speed) * amplitude * 0.4 +
            Math.cos(z * 2 + t * speed * 0.7) * amplitude * 0.3 +
            Math.sin(x * 3 + z * 2 + t * speed * 1.3) * amplitude * 0.2;
        }
      }
      ribbonGeo.attributes.position.needsUpdate = true;
      ribbonGeo.computeVertexNormals();

      // Also update wireframe
      const wirePositions = wireGeo.attributes.position.array;
      for (let i = 0; i < positions.length; i++) {
        wirePositions[i] = positions[i];
      }
      wireGeo.attributes.position.needsUpdate = true;

      // Data particles float
      const dPos = dataGeo.attributes.position.array;
      for (let i = 0; i < dataCount; i++) {
        dPos[i * 3 + 1] = Math.sin(t * 2 + i * 0.5) * 0.5 + (benchRef.current ? 0.3 : 0);
      }
      dataGeo.attributes.position.needsUpdate = true;

      // Benchmark bars animation
      if (benchRef.current) {
        bars.forEach((bar, i) => {
          bar.target = 0.3 + Math.abs(Math.sin(t * 3 + i * 0.8)) * 1.5;
        });
      } else {
        bars.forEach((bar) => {
          bar.target = 0.1 + Math.sin(t * 0.5) * 0.05;
        });
      }
      bars.forEach((bar) => {
        bar.current += (bar.target - bar.current) * 0.08;
        bar.mesh.scale.y = bar.current;
        bar.mesh.position.y = -2 + bar.current * 0.5;
      });

      // Slow root sway
      rootGroup.rotation.y = Math.sin(t * 0.08) * 0.12;

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
      style={{ width: '100%', height: '100%', minHeight: 350, position: 'relative' }}
    />
  );
}
