import React, { useEffect, useRef, useState } from 'react';

// Inline so the menu renders correctly even if a stale stylesheet is cached
// (the class names are kept for the hover state in overlay.css).
const SHOT_WRAP_STYLE = { position: 'relative', display: 'inline-flex' };
const SHOT_MENU_STYLE = {
  position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
  minWidth: 180, background: 'rgba(26, 26, 31, 0.98)', border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12, boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)', padding: 6,
  display: 'flex', flexDirection: 'column', gap: 2, zIndex: 99999,
};
const SHOT_ITEM_STYLE = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px',
  border: 'none', borderRadius: 8, background: 'transparent', color: '#e7e7ea',
  fontSize: 13.5, fontWeight: 500, textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap',
  fontFamily: 'inherit',
};

export default function FloatingDock({
  onDragStart,
  listening,
  onToggleListening,
  thinking,
  isAnswering,
  onAnswer,
  onCaptureScreen,
  chatOpen,
  onToggleChat,
  onMinimize,
  popoverOpen,
  onTogglePopover,
  trialsText = '0 trials left',
  elapsedText = '2:31',
  stealthMode = false,
  onToggleStealth,
  nativeDrag = false,
  onUploadImage,
  timerUnlimited = true,
}) {
  const activeAnswering = Boolean(thinking || isAnswering);
  const [shotMenuOpen, setShotMenuOpen] = useState(false);
  const shotMenuRef = useRef(null);

  useEffect(() => {
    if (!shotMenuOpen) return undefined;
    const close = (e) => { if (shotMenuRef.current && !shotMenuRef.current.contains(e.target)) setShotMenuOpen(false); };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [shotMenuOpen]);

  return (
    <div className="fe-dock-bar">
      {/* 1. Screen Share / Monitor Toggle Button with Red Dot */}
      <button
        type="button"
        className="fe-dock-icon-btn fe-dock-screen-btn"
        onClick={onToggleStealth}
        title={stealthMode ? 'Private Mode Active (Protected)' : 'Screen Share Active (Click to toggle protection)'}
      >
        <span className="fe-status-dot fe-dot-red" />
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </button>

      {/* 2. Microphone Toggle Button with Green Dot */}
      <button
        type="button"
        className={`fe-dock-icon-btn fe-dock-mic-btn ${listening ? 'fe-mic-active' : ''}`}
        onClick={onToggleListening}
        title={listening ? 'Listening Active (Click to Mute)' : 'Microphone Muted (Click to Listen)'}
      >
        <span className={`fe-status-dot ${listening ? 'fe-dot-green' : 'fe-dot-muted'}`} />
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      </button>

      {/* 3. "Answer" Action Button */}
      <button
        type="button"
        className={`fe-dock-pill-btn fe-dock-btn-answer ${activeAnswering ? 'fe-btn-loading' : ''}`}
        onClick={onAnswer}
        title="Generate AI Answer (⌘↵)"
      >
        {activeAnswering ? (
          <>
            <span className="fe-spinner-small" />
            <span>Fetching…</span>
          </>
        ) : (
          <>
            <span>Answer</span>
            <kbd className="fe-kbd-badge">⌘↵</kbd>
          </>
        )}
      </button>

      {/* 4. "Screenshot" — capture the screen or upload an image; either is answered straight away */}
      <div className="fe-shot-wrap" ref={shotMenuRef} style={SHOT_WRAP_STYLE}>
        <button
          type="button"
          className={`fe-dock-pill-btn fe-dock-btn-screenshot ${shotMenuOpen ? 'fe-btn-active' : ''}`}
          onClick={() => setShotMenuOpen((v) => !v)}
          title="Capture the screen or upload an image to solve (⇧⌘↵ captures directly)"
        >
          <span>Screenshot</span>
          <kbd className="fe-kbd-badge">⇧⌘↵</kbd>
        </button>
        {shotMenuOpen && (
          <div className="fe-shot-menu" style={SHOT_MENU_STYLE} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="fe-shot-item" style={SHOT_ITEM_STYLE} onClick={() => { setShotMenuOpen(false); onCaptureScreen && onCaptureScreen(); }}>
              <span aria-hidden="true">🖥️</span><span>Capture screen</span>
            </button>
            <button type="button" className="fe-shot-item" style={SHOT_ITEM_STYLE} onClick={() => { setShotMenuOpen(false); onUploadImage && onUploadImage(); }}>
              <span aria-hidden="true">🖼️</span><span>Upload image</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. "Chat" Action Button */}
      <button
        type="button"
        className={`fe-dock-pill-btn fe-dock-btn-chat ${chatOpen ? 'fe-btn-active' : ''}`}
        onClick={onToggleChat}
        title="Open Chat Input (⌘K)"
      >
        <span>Chat</span>
        <kbd className="fe-kbd-badge">⌘K</kbd>
      </button>

      {/* 6. Drag Handle (4-way arrow icon) */}
      {/* Desktop app: a native OS drag region, so Windows itself moves the
          window — exact cursor tracking at any display scaling, and the drop
          always lands where the mouse is released. */}
      <div
        className="fe-dock-drag-handle"
        onMouseDown={nativeDrag ? undefined : onDragStart}
        style={nativeDrag ? { WebkitAppRegion: 'drag', cursor: 'move' } : undefined}
        title="Click and drag to move Copilot anywhere on screen"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 9 2 12 5 15"></polyline>
          <polyline points="9 5 12 2 15 5"></polyline>
          <polyline points="15 19 12 22 9 19"></polyline>
          <polyline points="19 9 22 12 19 15"></polyline>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <line x1="12" y1="2" x2="12" y2="22"></line>
        </svg>
      </div>

      {/* 7. Minimize Button (diagonal collapse arrow) */}
      <button
        type="button"
        className="fe-dock-icon-btn fe-dock-minimize-btn"
        onClick={onMinimize}
        title="Minimize Copilot to Floating Status Pill"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="19" x2="5" y2="5"></line>
          <polyline points="19 11 19 19 11 19"></polyline>
        </svg>
      </button>

      {/* 8. More Options Button (three dots) - With yellow circle ring when open! */}
      <button
        type="button"
        className={`fe-dock-icon-btn fe-dock-more-btn ${popoverOpen ? 'fe-dock-more-active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePopover && onTogglePopover();
        }}
        title="Quick Settings & Options (⋮)"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"></circle>
          <circle cx="12" cy="12" r="2"></circle>
          <circle cx="12" cy="19" r="2"></circle>
        </svg>
      </button>

      {/* 9. Usage / Trials Badge */}
      <div className="fe-dock-trials-badge" title="Remaining free trials / session credits">
        <span>{trialsText}</span>
      </div>

      {/* 10. Glowing Red Session Timer Pill */}
      <div className="fe-dock-timer-pill" title={timerUnlimited ? 'Session time (unlimited plan)' : 'Session time remaining'}>
        {timerUnlimited && <span className="fe-timer-infinity">∞</span>}
        <span className="fe-timer-time">{elapsedText || '00:00'}</span>
      </div>
    </div>
  );
}
