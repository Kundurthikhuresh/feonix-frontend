import React, { useRef, useState } from 'react';
import { sanitizeHTML } from '../../lib/sanitize';
import { formatParakeetAnswer, formatSpokenAnswer } from '../../lib/answerFormatter';

// Fallback for when the async Clipboard API is unavailable or refused.
function copyWithTextarea(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

// The code blocks' Copy buttons are plain HTML inside the answer, so their
// clicks are handled here by delegation.
async function handleCodeCopyClick(e) {
  const btn = e.target.closest('.parakeet-code-copy-btn');
  if (!btn) return;
  e.preventDefault();
  const code = btn.closest('.parakeet-code-wrapper')?.querySelector('code');
  const text = code ? code.textContent : '';
  if (!text) return;
  let ok = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      ok = true;
    }
  } catch { ok = false; }
  if (!ok) ok = copyWithTextarea(text);
  const original = btn.dataset.label || btn.textContent;
  btn.dataset.label = original;
  btn.textContent = ok ? '✓ Copied' : 'Copy failed';
  setTimeout(() => { btn.textContent = original; }, 1400);
}

export default function AnswerCard({
  visible = true,
  answer = '',
  answerText = '',
  thinking = false,
  isStreaming = false,
  hasError = false,
  timestamp = '',
  canPrev = false,
  canNext = false,
  onPrevious,
  onNext,
  onClear,
  onMinimize,
  onToggleExpand,
  isExpanded = false,
  onDragStart,
  // Asks for a concrete example of the answer on screen (code for code topics).
  onExample,
  // Card size in px: { width, bodyHeight, fixedHeight }. fixedHeight means the
  // user picked the height, so the body keeps it even for a short answer.
  size = null,
  // Called with { width, bodyHeight } while the user drags an edge, and once
  // more with `done: true` on release. Double-clicking an edge resets.
  onResize,
  onResetSize,
  // Maximize / Minimize buttons: one step bigger / smaller per click.
  // canGrow / canShrink are false once the card is at its largest / smallest.
  onMaximizeSize,
  onMinimizeSize,
  canGrow = true,
  canShrink = true,
}) {
  const [feedback, setFeedback] = useState(null);
  const cardRef = useRef(null);
  const bodyRef = useRef(null);

  if (!visible || (!answer && !answerText && !thinking && !hasError)) return null;

  // Plain spoken-answer paragraphs when the raw text is available; the old
  // bullet layout only as a fallback.
  const spokenHtml = answerText ? formatSpokenAnswer(answerText) : '';
  const bodyHtml = spokenHtml || formatParakeetAnswer(answer);

  // Format current or given timestamp
  const displayTime = timestamp || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const canResize = Boolean(onResize) && !isExpanded;

  // Screen coordinates, not client ones: the native window is resized (and
  // moved) under the cursor while dragging, which shifts client coordinates.
  // The card is centred and its bottom stays put, so a side edge changes the
  // width by twice the cursor movement and the top edge grows it upward.
  const startResize = (dir) => (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const card = cardRef.current;
    const body = bodyRef.current;
    if (!card || !body) return;
    const handle = e.currentTarget;
    try { handle.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    const start = {
      x: e.screenX,
      y: e.screenY,
      width: card.getBoundingClientRect().width,
      bodyHeight: body.getBoundingClientRect().height,
    };
    let frame = 0;
    let latest = null;
    const compute = (ev) => {
      const dx = ev.screenX - start.x;
      const dy = ev.screenY - start.y;
      let width = start.width;
      let bodyHeight = start.bodyHeight;
      if (dir.includes('e')) width = start.width + dx * 2;
      if (dir.includes('w')) width = start.width - dx * 2;
      if (dir.includes('n')) bodyHeight = start.bodyHeight - dy;
      return { width, bodyHeight };
    };
    const onMove = (ev) => {
      latest = compute(ev);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (latest) onResize(latest);
      });
    };
    const onUp = (ev) => {
      if (frame) cancelAnimationFrame(frame);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      try { handle.releasePointerCapture(ev.pointerId); } catch { /* already released */ }
      onResize({ ...compute(ev), done: true });
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };

  const cardStyle = !isExpanded && size ? { width: `${size.width}px`, maxWidth: '100%' } : undefined;
  const bodyStyle = !isExpanded && size
    ? (size.fixedHeight
      ? { height: `${size.bodyHeight}px`, maxHeight: 'none' }
      : { maxHeight: `${size.bodyHeight}px` })
    : undefined;

  const handle = (dir) => (
    <div
      key={dir}
      className={`fe-resize-handle fe-resize-${dir}`}
      onPointerDown={startResize(dir)}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onResetSize && onResetSize();
      }}
      title="Drag to resize · double-click to reset"
    />
  );

  return (
    <div
      ref={cardRef}
      className={`fe-answer-card ${isExpanded ? 'fe-card-expanded' : ''} ${canResize ? 'fe-card-resizable' : ''}`}
      style={cardStyle}
      onMouseDown={onDragStart}
    >
      {canResize && ['n', 'e', 'w', 'ne', 'nw'].map(handle)}
      {/* Top Header of Answer Window */}
      <div className="fe-card-head" onMouseDown={onDragStart}>
        <div className="fe-head-left">
          <button
            type="button"
            className="fe-nav-kbd-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious && onPrevious();
            }}
            disabled={!canPrev}
            title="Previous answer (⌘←)"
          >
            ⌘←
          </button>
          <button
            type="button"
            className="fe-nav-kbd-btn"
            onClick={(e) => {
              e.stopPropagation();
              onNext && onNext();
            }}
            disabled={!canNext}
            title="Next answer (⌘→)"
          >
            ⌘→
          </button>
        </div>

        <div className="fe-head-right">
          {canResize && onMinimizeSize && (
            <button
              type="button"
              className="fe-head-icon-btn fe-size-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMinimizeSize();
              }}
              disabled={!canShrink}
              title="Minimize: make the answer window one step smaller"
              aria-label="Make the answer window smaller"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
          {canResize && onMaximizeSize && (
            <button
              type="button"
              className="fe-head-icon-btn fe-size-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMaximizeSize();
              }}
              disabled={!canGrow}
              title="Maximize: make the answer window one step bigger"
              aria-label="Make the answer window bigger"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              </svg>
            </button>
          )}
          <button
            type="button"
            className="fe-clear-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClear && onClear();
            }}
            title="Clear answer (⌘⌫)"
          >
            <span>Clear</span>
            <kbd className="fe-kbd-badge">⌘⌫</kbd>
          </button>

          <button
            type="button"
            className="fe-head-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize && onMinimize();
            }}
            title="Close answer window"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="19" x2="5" y2="5"></line>
              <polyline points="19 11 19 19 11 19"></polyline>
            </svg>
          </button>

          <button
            type="button"
            className="fe-head-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand && onToggleExpand();
            }}
            title={isExpanded ? 'Restore size (🗗)' : 'Expand window (↗)'}
          >
            {isExpanded ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Body of Answer Window */}
      <div
        ref={bodyRef}
        className="fe-card-body"
        style={bodyStyle}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleCodeCopyClick}
      >
        {thinking && !answer && !spokenHtml ? (
          <div className="fe-answer-fetching">
            <div className="fe-spinner" />
            <span>Fetching answer for detected question…</span>
          </div>
        ) : hasError ? (
          answer ? (
            // `answer` carries the specific error (status/message) built by useAnswerStreaming.
            <div className="fe-answer-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(answer) }} />
          ) : (
            <div className="fe-answer-error">
              <span>Unable to retrieve answer. Please try again.</span>
            </div>
          )
        ) : (
          <div
            className="fe-answer-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(bodyHtml) }}
          />
        )}
      </div>

      {/* Bottom Footer Line */}
      <div className="fe-card-foot" onMouseDown={onDragStart}>
        <span className="fe-foot-timestamp">Answer · {displayTime}</span>
        <div className="fe-foot-feedback" onMouseDown={(e) => e.stopPropagation()}>
          {onExample && !thinking && !isStreaming && !hasError && (answer || answerText) && (
            <button
              type="button"
              className="fe-example-btn"
              onClick={onExample}
              title="Show a real example of this answer (code for coding questions)"
            >
              Example
            </button>
          )}
          <button
            type="button"
            className={`fe-thumb-btn ${feedback === 'up' ? 'fe-thumb-active' : ''}`}
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            title="Good answer"
          >
            👍
          </button>
          <button
            type="button"
            className={`fe-thumb-btn ${feedback === 'down' ? 'fe-thumb-active' : ''}`}
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            title="Needs improvement"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}
