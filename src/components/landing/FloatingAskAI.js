"use client";

import { Sparkles, MessageSquare } from 'lucide-react';

export default function FloatingAskAI({ onClick }) {
  return (
    <button
      className="floating-ask-ai-3d-btn"
      onClick={onClick}
      type="button"
      aria-label="Ask AI Helper"
    >
      <div className="ask-icon-wrapper">
        <Sparkles size={16} className="ask-sparkle" />
      </div>
      <span className="ask-label">Ask Feonix AI</span>
      <span className="ask-radar-ping" />
    </button>
  );
}
