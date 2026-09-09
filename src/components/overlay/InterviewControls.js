// Parakeet AI TopBar Right Cluster: Auto-Answer, Timer, Stealth status,
// drag handle, expand/collapse, minimize-to-pill, settings, and End Interview.
export default function InterviewControls({
  onDragHandleMouseDown,
  isExpanded,
  onToggleExpand,
  onMinimize,
  stealthMode = true,
  onToggleStealth,
  onToggleHide,
  settingsOpen,
  onToggleSettings,
  onEndSession,
  remainingText,
}) {
  const isUrgent = remainingText && (remainingText.startsWith('00:') || remainingText.startsWith('01:'));
  const isStealthOn = stealthMode !== false;

  return (
    <div className="pk-topbar-right">
      {/* Session Timer Pill */}
      {remainingText && (
        <span
          className={`pk-timer-pill ${isUrgent ? 'pk-timer-urgent' : ''}`}
          title="Time remaining in this session"
        >
          ⏱ {remainingText}
        </span>
      )}

      {/* Hide Copilot Button */}
      <button
        className="pk-hide-btn pk-stealth-active"
        onClick={onToggleHide}
        title="Hide Copilot (Press Ctrl+Shift+H to show again)"
        type="button"
      >
        <span className="pk-stealth-dot pk-dot-green" />
        <span>Hide</span>
      </button>

      {/* Controls */}
      <button
        className="pk-icon-btn pk-drag-handle"
        onMouseDown={onDragHandleMouseDown}
        title="Click & Drag to reposition HUD"
        type="button"
        style={{ cursor: 'grab' }}
      >
        ⊹
      </button>

      <button
        className="pk-icon-btn"
        onClick={onToggleExpand}
        title={isExpanded ? 'Collapse answer card' : 'Expand answer card'}
        type="button"
      >
        ⤢
      </button>

      <button
        className="pk-icon-btn"
        onClick={onMinimize}
        title="Minimize to floating pill (Ctrl+Shift+Space)"
        type="button"
      >
        ─
      </button>

      <button
        className={`pk-icon-btn ${settingsOpen ? 'pk-action-active' : ''}`}
        onClick={onToggleSettings}
        title={settingsOpen ? 'Close settings menu' : 'Session History & Settings (⋮)'}
        data-menu-trigger="settings"
        type="button"
      >
        ⋮
      </button>

      <button
        className="pk-end-btn"
        onClick={onEndSession}
        type="button"
        title="End interview session (⌘⇧Q)"
      >
        End<kbd>⌘⇧Q</kbd>
      </button>
    </div>
  );
}

