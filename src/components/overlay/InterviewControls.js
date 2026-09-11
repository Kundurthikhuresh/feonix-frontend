// Parakeet AI TopBar Right Cluster: Auto-Answer, Timer, Stealth/Private status,
// drag handle, expand/collapse, minimize-to-pill, settings, and End Interview.
export default function InterviewControls({
  onDragHandleMouseDown,
  isExpanded,
  onToggleExpand,
  onMinimize,
  stealthMode = true,
  onToggleStealth,
  onSetStealth,
  onToggleHide,
  settingsOpen,
  onToggleSettings,
  onEndSession,
  remainingText,
}) {
  const isUrgent = remainingText && (remainingText.startsWith('00:') || remainingText.startsWith('01:'));
  const isStealthOn = stealthMode !== false;

  const handleSetMode = (turnOn) => {
    if (typeof onSetStealth === 'function') {
      onSetStealth(turnOn);
    } else if (typeof onToggleStealth === 'function') {
      if ((turnOn && !isStealthOn) || (!turnOn && isStealthOn)) {
        onToggleStealth();
      }
    }
  };

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

      {/* Single Private Mode button with On and Off buttons inside */}
      <div
        className={`pk-private-capsule ${isStealthOn ? 'pk-capsule-on' : 'pk-capsule-off'}`}
        title={`Private Mode: ${isStealthOn ? 'ON (Visible ONLY to user / hidden from interviewer)' : 'OFF (Visible to BOTH sides)'}`}
      >
        <span
          className="pk-capsule-label"
          onClick={() => handleSetMode(!isStealthOn)}
          style={{ cursor: 'pointer' }}
          title={isStealthOn ? 'Private Mode ON — visible only to user (Click to toggle)' : 'Private Mode OFF — visible to both sides (Click to toggle)'}
        >
          <span className={`pk-stealth-dot ${isStealthOn ? 'pk-dot-green' : ''}`} />
          <span>Private Mode</span>
        </span>

        <div className="pk-capsule-toggle">
          <button
            type="button"
            className={`pk-capsule-btn ${isStealthOn ? 'pk-capsule-btn-on-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSetMode(true);
            }}
            title="Private Mode ON: Visible ONLY to user (hidden from opposite person / interviewer on screen share)"
          >
            On
          </button>
          <button
            type="button"
            className={`pk-capsule-btn ${!isStealthOn ? 'pk-capsule-btn-off-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSetMode(false);
            }}
            title="Private Mode OFF: Visible to BOTH sides (interviewer / opposite person and user)"
          >
            Off
          </button>
        </div>
      </div>

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
        End
      </button>
    </div>
  );
}
