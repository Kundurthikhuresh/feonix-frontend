"use client";

import React, { useEffect, useRef } from 'react';

/**
 * 3D AI Processing Visualization (Neural audio wave / latency engine)
 * Lightweight Canvas 2D projection simulating real-time audio chunk processing.
 */
export default function AIProcessingVisual({ width = 360, height = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    let t = 0;
    const numLines = 14;

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        t += 0.03;

        // Draw 3D undulating audio mesh
        for (let i = 0; i < numLines; i++) {
          const z = (i / numLines) * 1.5; // depth
          const yBase = height * 0.45 + (i - numLines / 2) * 6;
          const alpha = 0.15 + (i / numLines) * 0.55;

          ctx.beginPath();
          ctx.strokeStyle = i % 2 === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = 1.2;

          for (let x = 0; x <= width; x += 8) {
            const normX = x / width;
            const wave1 = Math.sin(normX * 6 + t + i * 0.4) * 16;
            const wave2 = Math.cos(normX * 12 - t * 1.5) * 8;
            const envelope = Math.sin(normX * Math.PI); // tapering edges
            const y = yBase + (wave1 + wave2) * envelope * (1 - z * 0.3);

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }

        // Processing latency marker
        const markerX = ((Math.sin(t * 0.8) + 1) / 2) * (width - 40) + 20;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(markerX, height * 0.48, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('STREAMING 1.1s', 12, height - 12);
        ctx.fillStyle = '#10b981';
        ctx.fillText('● 128-bit CHUNK', width - 100, height - 12);
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [width, height]);

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, overflow: 'hidden', borderRadius: '12px', background: 'rgba(5, 8, 14, 0.9)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden="true"
      />
    </div>
  );
}

