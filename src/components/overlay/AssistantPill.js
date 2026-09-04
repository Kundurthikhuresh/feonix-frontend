import { forwardRef } from 'react';

const STATUS = {
  processing: { label: 'Processing', dotClass: 'pk-mini-pill-dot-processing' },
  listening: { label: 'Listening', dotClass: 'pk-mini-pill-dot-listening' },
  ready: { label: 'Ready', dotClass: 'pk-mini-pill-dot-ready' },
};

// The minimized state: a small status pill, equally visible to anyone who
// can see the screen — including a screen share. No "hidden from X"
// framing; it's a normal minimize, same as any other app's tray-minimized
// window would look if it left something on screen at all.
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
      title="Click to open Feonix AI · Ctrl+Shift+Space"
    >
      <span className={`pk-mini-pill-dot ${dotClass}`} />
      <span className="pk-mini-pill-label">Feonix AI · {label}</span>
    </div>
  );
});

export default AssistantPill;
