import React from 'react';

export default function FloatingChatBar({
  open,
  onClose,
  customPromptText,
  onChangePromptText,
  onSubmit,
  onKeyDown,
  inputRef,
  thinking,
  screenshots = [],
  onRemoveScreenshotAt,
}) {
  if (!open) return null;

  return (
    <div className="fe-floating-chat-wrap">
      <form
        className="fe-floating-chat-bar"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit && onSubmit();
        }}
      >
        <span className="fe-chat-icon">💬</span>

        <input
          ref={inputRef}
          type="text"
          value={customPromptText}
          onChange={(e) => onChangePromptText && onChangePromptText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type question or prompt to generate AI answer…"
          className="fe-chat-input"
          autoFocus
        />

        {screenshots.length > 0 && (
          <div className="fe-chat-screenshots">
            {screenshots.map((s, idx) => (
              <div key={idx} className="fe-screenshot-tag">
                <span>📸 Screen {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveScreenshotAt && onRemoveScreenshotAt(idx)}
                  className="fe-screenshot-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="fe-chat-send-btn"
          disabled={thinking || (!customPromptText.trim() && screenshots.length === 0)}
        >
          {thinking ? 'Asking…' : 'Ask ↵'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="fe-chat-close-btn"
          title="Close chat input (Esc)"
        >
          ✕
        </button>
      </form>
    </div>
  );
}
