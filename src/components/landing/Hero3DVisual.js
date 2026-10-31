"use client";

import React, { useEffect, useRef } from 'react';

/**
 * High-performance, lightweight 3D AI Assistant Core Visualization.
 * Uses vanilla 2D Canvas with mathematical 3D perspective projection.
 * Zero heavy libraries, zero memory leaks, automatically pauses offscreen.
 */
export default function Hero3DVisual({ size = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let isVisible = true;

    // Intersection Observer to prevent CPU usage when scrolled past
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    // Spherical point cloud coordinates
    const numPoints = 64;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      const r = size * 0.38;
      points.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, size, size);
        const centerX = size / 2;
        const centerY = size / 2;
        const fov = 220;

        angleX += 0.008;
        angleY += 0.012;

        const sinX = Math.sin(angleX);
        const cosX = Math.cos(angleX);
        const sinY = Math.sin(angleY);
        const cosY = Math.cos(angleY);

        // Core ambient glow
        const radGlow = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, size * 0.42);
        radGlow.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
        radGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.15)');
        radGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, size, size);

        // Project and draw points
        for (let i = 0; i < numPoints; i++) {
          const p = points[i];

          // Rotate Y
          let x1 = p.x * cosY - p.z * sinY;
          let z1 = p.z * cosY + p.x * sinY;

          // Rotate X
          let y2 = p.y * cosX - z1 * sinX;
          let z2 = z1 * cosX + p.y * sinX;

          // Perspective projection
          const scale = fov / (fov + z2 + 80);
          const projX = centerX + x1 * scale;
          const projY = centerY + y2 * scale;
          const alpha = Math.max(0.15, Math.min(0.9, (z2 + size * 0.4) / (size * 0.8)));

          ctx.beginPath();
          ctx.arc(projX, projY, Math.max(1, 2.2 * scale), 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(139, 92, 246, ${alpha})`;
          ctx.fill();
        }

        // Concentric orbit rings
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, size * 0.44, size * 0.16, angleY * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'block',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}

