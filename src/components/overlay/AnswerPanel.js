import { useEffect, useRef, useState } from 'react';

// How close to the bottom (in px of unscrolled content) still counts as
// "at the bottom" for auto-scroll purposes — matches how most chat UIs
// treat "basically caught up" rather than requiring an exact 0.
const NEAR_BOTTOM_PX = 80;

/**
 * ChatGPT-style Answer Panel:
 * Renders every question/answer turn in order, growing downward and never
 * dropping earlier turns. Auto-scrolls to the newest message only when the
 * user was already near the bottom (so it never yanks them off something
 * they're reading), and offers a "Jump to latest" button the rest of the
 * time. The per-answer actions (Shorten/Deepen/Regenerate/Retry) only make
 * sense against the most recent turn — that's the only one rerun() knows
 * how to redo — so they stay attached to the last assistant message; every
 * message gets its own Copy button regardless of age.
 */
export default function AnswerPanel({
  visible, messages = [], isExpanded, elapsedText, hasError,
  onCopyMessage, onThumbUp, onThumbDown,
  onRegenerate, onShorten, onExpand, onRetry,
}) {
  const containerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  // Full-size view of an attached screenshot. Rendered in-page rather than
  // via window.open() — the Electron main process's setWindowOpenHandler
  // (desktop-electron/src/main/window.js) denies opening a new window for
  // anything that isn't a trusted same-origin URL, and a data: URL doesn't
  // qualify, so window.open() on a screenshot silently did nothing inside
  // the overlay. An in-page lightbox needs no window-opening permission at
  // all and works identically in Electron or a plain browser tab.
  const [zoomedImage, setZoomedImage] = useState(null);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  };

  const handleScroll = () => {
    const near = isNearBottom();
    isNearBottomRef.current = near;
    setShowJumpToLatest(!near && messages.length > 0);
  };

  // Runs on every new message AND on every in-place streaming update to the
  // latest one (both replace the `messages` array reference) — auto-scroll
  // only follows along if the user hadn't scrolled away to read something
  // earlier, otherwise their scroll position is left exactly where it was.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isNearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    } else if (messages.length > 0) {
      setShowJumpToLatest(true);
    }
  }, [messages]);

  const jumpToLatest = () => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    isNearBottomRef.current = true;
    setShowJumpToLatest(false);
  };

  if (!visible) return null;

  let lastAssistantId = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantId = messages[i].id;
      break;
    }
  }

  return (
    <div className="pk-answer-card-wrap">
      <div
        className={`pk-answer-card pk-conversation ${isExpanded ? 'pk-expanded' : ''}`}
        style={{ maxHeight: isExpanded ? '78vh' : '440px' }}
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="pk-placeholder">
            ✨ <strong>FeonixAI Copilot Ready</strong>
            <br />
            <span>Start speaking, capture a coding problem, or type a question below to begin.</span>
          </div>
        ) : (
          messages.map((m) => (
            m.role === 'user' ? (
              <div className="pk-user-turn" key={m.id}>
                {m.images && m.images.length > 0 && (
                  <div className="pk-msg-screenshots">
                    {m.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Attached screenshot ${i + 1}`}
                        className="pk-msg-screenshot-thumb"
                        onClick={() => setZoomedImage(src)}
                        title="Click to view full size"
                      />
                    ))}
                  </div>
                )}
                <div className="pk-question-line">
                  <span className="pk-ql-icon">💬</span>
                  <span className="pk-ql-badge">You</span>
                  <span className="pk-ql-text pk-ql-multiline">{m.content}</span>
                  <button
                    className="pk-copy-btn"
                    title="Copy question"
                    type="button"
                    onClick={() => onCopyMessage && onCopyMessage(m.content)}
                  >
                    ⧉
                  </button>
                </div>
              </div>
            ) : (
              <div className="pk-msg-assistant" key={m.id}>
                {m.streaming && !m.html && (
                  <div className="pk-thinking">
                    <span className="pk-thinking-pulse" />
                    <span className="pk-thinking-text">Crafting optimal answer…</span>
                  </div>
                )}
                {m.html && (
                  <div className="pk-answer-body" dangerouslySetInnerHTML={{ __html: m.html }} />
                )}
                {m.html && (
                  m.id === lastAssistantId ? (
                    !m.streaming && (
                      <div className="pk-answer-foot">
                        <span className="pk-foot-label">
                          <span className="pk-foot-dot" />
                          Answer ready · {elapsedText || 'Live'}
                        </span>
                        <div className="pk-foot-actions">
                          {hasError || m.error ? (
                            <button className="pk-thumb pk-thumb-retry" onClick={onRetry} type="button" title="Retry">↻ Retry</button>
                          ) : (
                            <>
                              <button className="pk-thumb" onClick={onShorten} type="button" title="Make answer shorter and punchier">⇲ Shorten</button>
                              <button className="pk-thumb" onClick={onExpand} type="button" title="Expand with more technical depth">⇱ Deepen</button>
                              <button className="pk-thumb" onClick={onRegenerate} type="button" title="Generate alternative answer">↻ Regenerate</button>
                              <button className="pk-thumb" onClick={() => onCopyMessage && onCopyMessage(m.html, true)} type="button" title="Copy response to clipboard">⧉ Copy</button>
                              <button className="pk-thumb" onClick={onThumbUp} type="button" title="Good answer">👍</button>
                              <button className="pk-thumb" onClick={onThumbDown} type="button" title="Needs improvement">👎</button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="pk-answer-foot pk-answer-foot-minor">
                      <button
                        className="pk-thumb"
                        type="button"
                        title="Copy response to clipboard"
                        onClick={() => onCopyMessage && onCopyMessage(m.html, true)}
                      >
                        ⧉ Copy
                      </button>
                    </div>
                  )
                )}
              </div>
            )
          ))
        )}
      </div>

      {showJumpToLatest && (
        <button className="pk-jump-latest" type="button" onClick={jumpToLatest}>
          ↓ Jump to latest
        </button>
      )}

      {zoomedImage && (
        <div className="pk-image-lightbox" onClick={() => setZoomedImage(null)}>
          <button
            className="pk-image-lightbox-close"
            type="button"
            title="Close"
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
          >
            ✕
          </button>
          <img
            src={zoomedImage}
            alt="Screenshot, full size"
            className="pk-image-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
