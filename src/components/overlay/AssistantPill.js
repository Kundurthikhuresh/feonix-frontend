import { forwardRef } from 'react';

const STATUS = {
  processing: { label: 'Crafting…', dotClass: 'pk-mini-pill-dot-processing' },
  listening: { label: 'Listening…', dotClass: 'pk-mini-pill-dot-listening' },
  ready: { label: 'Ready', dotClass: 'pk-mini-pill-dot-ready' },
  error: { label: 'Error', dotClass: 'pk-mini-pill-dot-error' },
};

// Parakeet AI Minimized Floating Status Pill:
// Compact, top-docked glass capsule with live status indicator and one-click expand.
const AssistantPill = forwardRef(function AssistantPill(
  { status = 'ready', dragPos, dragging, onDragStart, onOpen }, ref
) {
  const { label, dotClass } = STATUS[status] || STATUS.ready;

  return (
    <div
      ref={ref}
      className="pk-mini-pill"
      onMouseDown={onDragStart}
      onClick={onOpen}
      style={dragPos && dragPos.x !== null ? {
        position: 'fixed',
        left: `${dragPos.x}px`,
        top: `${dragPos.y}px`,
        transform: 'none',
        margin: 0,
        cursor: dragging ? 'grabbing' : 'grab',
      } : { cursor: 'grab' }}
      title="Click to open Copilot HUD (Ctrl+Shift+Space)"
    >
      <span className="pk-mini-pill-sparkle">✨</span>
      <span className={`pk-mini-pill-dot ${dotClass}`} />
      <span className="pk-mini-pill-label">{label}</span>
      <span className="pk-mini-pill-expand" title="Expand">⤢</span>
    </div>
  );
});

export default AssistantPill;

