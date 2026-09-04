"use client";

import { Sparkles, Bot, Radio } from 'lucide-react';

export default function FloatingAskAI({ onClick }) {
  return (
    <button
      className="floating-ask-ai-3d-btn"
      onClick={onClick}
      type="button"
      aria-label="Open 3D AI Assistant"
      title="Chat with Feonix 3D Voice Assistant"
    >
      <div className="ask-icon-wrapper">
        <Bot size={17} className="ask-bot-icon" />
      </div>
      <span className="ask-label">Ask Feonix 3D AI</span>
      <span className="ask-voice-tag">
        <Radio size={11} className="ping-icon" />
        <span>VOICE</span>
      </span>
      <span className="ask-radar-ping" />
    </button>
  );
}
