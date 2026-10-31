import React from 'react';
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
}) {
  if (!visible || (!answer && !answerText && !thinking && !hasError)) return null;

  // Plain spoken-answer paragraphs when the raw text is available; the old
  // bullet layout only as a fallback.
  const spokenHtml = answerText ? formatSpokenAnswer(answerText) : '';
  const bodyHtml = spokenHtml || formatParakeetAnswer(answer);

  // Format current or given timestamp
  const displayTime = timestamp || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  return (
    <div
      className={`fe-answer-card ${isExpanded ? 'fe-card-expanded' : ''}`}
      onMouseDown={onDragStart}
    >
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
        className="fe-card-body"
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
      </div>
    </div>
  );
}
