"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function HeroAssistant3DStage({ onOpenAssistant }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  // 3D Parallax Mouse Tilt Physics
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 12;
    const rotateX = -((y - yc) / yc) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      className="hero-assistant-3d-stage"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Robot AI Assistant (Clean, No Switcher) */}
      <div
        className="hero-robot-wrapper"
        onClick={onOpenAssistant}
        title="Click to chat with Feonix 3D Voice Assistant"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`,
        }}
      >
        {/* Floating Energy Portal Ring */}
        <div className="hero-robot-energy-portal" />
        <div className="hero-robot-ambient-glow" />

        {/* Main 3D Robot Visual */}
        <div className="hero-robot-card">
          <Image
            src="/ai_robot_avatar_speaking.jpg"
            alt="Feonix 3D AI Assistant Robot Speaking"
            width={600}
            height={600}
            priority
            unoptimized={true}
            className="hero-robot-img"
            onError={(e) => { e.currentTarget.src = '/images/ai_robot_avatar_speaking.jpg'; }}
          />
        </div>
      </div>
    </div>
  );
}
