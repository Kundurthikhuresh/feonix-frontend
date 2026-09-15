"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function HeroAssistant3DStage({ onOpenAssistant }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  // Smooth 3D Parallax Mouse Tilt Physics
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 8;
    const rotateX = -((y - yc) / yc) * 8;
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
      {/* 3D Robot Pedestal Wrapper */}
      <div
        className="hero-robot-pedestal-wrapper"
        onClick={onOpenAssistant}
        title="Click to interact with Feonix 3D AI Assistant"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
        }}
      >
        {/* Soft Ambient Pedestal Energy Glow */}
        <div className="hero-pedestal-glow" />

        {/* Main 3D Robot & Hologram Visual */}
        <div className="hero-robot-pedestal-card">
          <Image
            src="/hero_robot_pedestal.png"
            alt="Feonix 3D AI Assistant Robot on Holographic Energy Stage"
            width={600}
            height={600}
            priority
            unoptimized={true}
            className="hero-robot-pedestal-img"
            onError={(e) => { e.currentTarget.src = '/ai_robot_avatar_speaking.jpg'; }}
          />
        </div>
      </div>
    </div>
  );
}
