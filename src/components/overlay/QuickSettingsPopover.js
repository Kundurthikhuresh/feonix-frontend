import React, { useLayoutEffect, useRef, useState } from 'react';

const GAP_PX = 14;
const EDGE_PX = 8;

export default function QuickSettingsPopover({
  open,
  onClose,
  privateMode = false,
  onTogglePrivateMode,
  answerMode = 'AUTO', // 'AUTO' | 'MANUAL'
  onToggleAnswerMode,
  opacity = 100,
  onOpacityChange,
  onResetPosition,
  onOpenSettings,
  onEndSession,
  onQuit,
}) {
  const menuRef = useRef(null);
  const [placement, setPlacement] = useState({ below: false, maxHeight: null });

  // Opens upward by default, but the desktop window cannot grow above the top
  // of the screen — with the copilot docked near the top the menu was cut off
  // at the window edge. Open toward whichever side has room, and scroll if
  // neither side fits it. Re-measured when the window is resized.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const measure = () => {
      const menu = menuRef.current;
      const anchor = menu && menu.parentElement;
      if (!menu || !anchor) return;
      const a = anchor.getBoundingClientRect();
      const needed = menu.scrollHeight + GAP_PX + EDGE_PX;
      const above = a.top;
      const below = window.innerHeight - a.bottom;
      const openBelow = needed > above && below > above;
      const room = (openBelow ? below : above) - GAP_PX - EDGE_PX;
      setPlacement({ below: openBelow, maxHeight: menu.scrollHeight > room ? Math.max(120, room) : null });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className={`fe-popover-menu ${placement.below ? 'fe-popover-below' : ''}`}
      style={placement.maxHeight ? { maxHeight: placement.maxHeight, overflowY: 'auto' } : undefined}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="fe-popover-header">FEONIXAI</div>

      <div className="fe-popover-row" onClick={onTogglePrivateMode} style={{ cursor: 'pointer' }}>
        <span className="fe-popover-label">Private Mode</span>
        <button
          type="button"
          className={`fe-toggle-pill ${privateMode ? 'fe-toggle-on' : 'fe-toggle-off'}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePrivateMode && onTogglePrivateMode();
          }}
          title="Toggle Private Mode (hides overlay from screen share)"
        >
          {privateMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="fe-popover-row" onClick={onToggleAnswerMode} style={{ cursor: 'pointer' }}>
        <span className="fe-popover-label">Answer Mode</span>
        <button
          type="button"
          className={`fe-mode-badge ${answerMode === 'AUTO' ? 'fe-mode-auto' : 'fe-mode-manual'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleAnswerMode && onToggleAnswerMode();
          }}
          title="Click to toggle Auto / Manual Answer Mode"
        >
          {answerMode}
        </button>
      </div>

      <div className="fe-popover-row fe-popover-opacity-row">
        <span className="fe-popover-label">Opacity</span>
        <div className="fe-opacity-slider-wrap">
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={opacity}
            onChange={(e) => onOpacityChange && onOpacityChange(Number(e.target.value))}
            className="fe-opacity-slider"
          />
          <span className="fe-opacity-val">{opacity}%</span>
        </div>
      </div>

      <button
        type="button"
        className="fe-popover-action"
        onClick={() => {
          onResetPosition && onResetPosition();
          onClose && onClose();
        }}
      >
        <span>Reset Overlay Position</span>
      </button>

      <button
        type="button"
        className="fe-popover-action"
        onClick={() => {
          onOpenSettings && onOpenSettings();
          onClose && onClose();
        }}
      >
        <span>Settings</span>
      </button>

      <div className="fe-popover-divider" />

      <button
        type="button"
        className="fe-popover-action fe-popover-danger"
        onClick={() => {
          onEndSession && onEndSession();
          onClose && onClose();
        }}
      >
        <span>End Session</span>
      </button>

      <button
        type="button"
        className="fe-popover-action fe-popover-danger fe-popover-quit"
        onClick={() => {
          onQuit && onQuit();
        }}
      >
        <span>Quit FeonixAI</span>
        <kbd className="fe-quit-kbd">⌘Q</kbd>
      </button>
    </div>
  );
}
