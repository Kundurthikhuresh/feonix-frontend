// The topbar-right cluster: drag handle, expand/collapse, minimize-to-pill,
// close (fully hide), the Settings trigger, and End Interview. The actual
// Settings panel lives in AssistantSettings.js, mounted at the shell level
// by overlay/page.js (position:absolute against the HUD shell, not this
// narrow button cluster).
export default function InterviewControls({
  onDragHandleMouseDown,
  isExpanded, onToggleExpand,
  onMinimize,
  onClose,
  onToggleSettings,
  onEndSession,
}) {
  return (
    <div className="pk-topbar-right">
      <button
        className="pk-icon-btn pk-drag-handle"
        onMouseDown={onDragHandleMouseDown}
        title="Click & Drag to move HUD window anywhere"
        type="button"
        style={{ cursor: 'grab' }}
      >
        ⊹
      </button>
      <button className="pk-icon-btn" onClick={onToggleExpand} title="Expand / Collapse answer card" type="button">⤢</button>
      <button className="pk-icon-btn" onClick={onMinimize} title="Minimize to pill (Ctrl+Shift+Space)" type="button">─</button>
      <button className="pk-icon-btn" onClick={onClose} title="Hide completely (Ctrl+Shift+H)" type="button">✕</button>
      <button className="pk-icon-btn" onClick={onToggleSettings} title="Settings" type="button">⋮</button>
      <button className="pk-end-btn" onClick={onEndSession} type="button" title="End interview session (⌘⇧Q)">
        End<kbd>⌘⇧Q</kbd>
      </button>
    </div>
  );
}
