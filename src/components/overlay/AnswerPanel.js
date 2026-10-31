import { useEffect, useRef, useState } from 'react';
import { isSilenceHallucination, NON_QUESTION_PLEASANTRIES, OUTRO_OR_GREETING_ANYWHERE } from '../../services/speechService';

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
  visible, messages = [], answersHistory = [], currentAnswerIndex = 0,
  isExpanded, elapsedText, hasError,
  onPrevious, onNext, onClear, onToggleExpand,
  onCopyMessage, onThumbUp, onThumbDown,
  onRegenerate, onShorten, onExpand, onRetry,
}) {
  const containerRef = useRef(null);
  const isNearTopRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  // Full-size view of an attached screenshot. Rendered in-page rather than
  // via window.open() — the Electron main process's setWindowOpenHandler
  // (desktop-electron/src/main/window.js) denies opening a new window for
  // anything that isn't a trusted same-origin URL, and a data: URL doesn't
  // qualify, so window.open() on a screenshot silently did nothing inside
  // the overlay. An in-page lightbox needs no window-opening permission at
  // all and works identically in Electron or a plain browser tab.
  const [zoomedImage, setZoomedImage] = useState(null);
  // Which message's Copy button was just clicked, so that one button (and
  // only that one — several messages can each have their own copy button
  // visible at once) briefly shows a checkmark instead of its normal label.
  const [copiedId, setCopiedId] = useState(null);
  const copiedTimeoutRef = useRef(null);

  const handleCopyClick = (id, content, isHtml) => {
    onCopyMessage && onCopyMessage(content, isHtml);
    setCopiedId(id);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopiedId(null), 1400);
  };

  useEffect(() => () => {
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
  }, []);

  const isNearTop = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollTop < 60;
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const nearTop = isNearTop();
    isNearTopRef.current = nearTop;
    setShowJumpToLatest(!nearTop);
  };

  // 1. Convert live messages from current session into chronological live turns
  const liveTurns = [];
  if (messages && messages.length > 0) {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') {
        const userMsg = messages[i];
        const qText = userMsg.content || '';
        // Strictly filter out silence artifacts, greetings, and YouTube outro phrases
        if (
          isSilenceHallucination(qText) ||
          NON_QUESTION_PLEASANTRIES.test(qText) ||
          OUTRO_OR_GREETING_ANYWHERE.test(qText)
        ) {
          if (i + 1 < messages.length && messages[i + 1].role === 'assistant') {
            i++; // skip corresponding assistant placeholder
          }
          continue;
        }
        let assistantMsg = null;
        if (i + 1 < messages.length && messages[i + 1].role === 'assistant') {
          assistantMsg = messages[i + 1];
          i++; // pair consumed
        }
        liveTurns.push({
          id: userMsg.id || `turn-${liveTurns.length}`,
          questionId: userMsg.id,
          answerId: assistantMsg?.id || `ans-${userMsg.id}`,
          question: userMsg.content || '',
          images: userMsg.images || [],
          answerHtml: assistantMsg?.html || '',
          isStreaming: Boolean(assistantMsg?.streaming),
          isError: Boolean(assistantMsg?.error || (i >= messages.length - 1 && hasError)),
          timestamp: userMsg.createdAt ? new Date(userMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (elapsedText || 'Live'),
        });
      } else if (messages[i].role === 'assistant') {
        const assistantMsg = messages[i];
        liveTurns.push({
          id: assistantMsg.id || `turn-${liveTurns.length}`,
          questionId: null,
          answerId: assistantMsg.id,
          question: '',
          images: [],
          answerHtml: assistantMsg.html || '',
          isStreaming: Boolean(assistantMsg.streaming),
          isError: Boolean(assistantMsg.error),
          timestamp: assistantMsg.createdAt ? new Date(assistantMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (elapsedText || 'Live'),
        });
      }
    }
  }

  // Enrich any live turn that hasn't received HTML yet with matched answer from answersHistory if available
  if (answersHistory && answersHistory.length > 0) {
    liveTurns.forEach((turn) => {
      if (!turn.answerHtml && turn.question) {
        const qNorm = turn.question.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = answersHistory.find((a) => (a.question || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') === qNorm);
        if (match && match.answerHtml) {
          turn.answerHtml = match.answerHtml;
          turn.isStreaming = false;
        }
      }
    });
  }

  // 2. Load historical turns from answersHistory (avoiding duplicates with live turns)
  const liveQuestionNorms = new Set(
    liveTurns
      .map((t) => (t.question || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(Boolean)
  );

  const historyTurnsOldestFirst = [];
  if (answersHistory && answersHistory.length > 0) {
    const historyOnly = answersHistory.filter((item) => {
      const qText = item.question || '';
      if (
        isSilenceHallucination(qText) ||
        NON_QUESTION_PLEASANTRIES.test(qText) ||
        OUTRO_OR_GREETING_ANYWHERE.test(qText)
      ) {
        return false;
      }
      const qNorm = (item.question || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return !qNorm || !liveQuestionNorms.has(qNorm);
    });

    const reversed = [...historyOnly].reverse();
    reversed.forEach((item, idx) => {
      historyTurnsOldestFirst.push({
        id: item.id || `hist-${idx}`,
        questionId: `hist-q-${item.id || idx}`,
        answerId: `hist-a-${item.id || idx}`,
        question: item.question || '',
        images: [],
        answerHtml: item.answerHtml || '',
        isStreaming: false,
        isError: false,
        timestamp: item.timestamp || '',
      });
    });
  }

  // 3. Chronological list of all questions (oldest to newest)
  const chronologicalTurns = [...historyTurnsOldestFirst, ...liveTurns];
  chronologicalTurns.forEach((turn, idx) => {
    turn.qNumber = idx + 1;
  });

  // 4. Reverse for feed: Recently asked questions at the TOP, previous questions below
  const turns = [...chronologicalTurns].reverse();

  // Runs on every new message or history update — auto-anchors at top (scrollTop = 0)
  // unless user intentionally scrolled down to read older history
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      if (el) {
        if (isNearTopRef.current) {
          el.scrollTop = 0;
        } else if (turns.length > 1) {
          setShowJumpToLatest(true);
        }
      }
    });
  }, [messages, answersHistory, turns.length]);

  const jumpToLatest = () => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
    isNearTopRef.current = true;
    setShowJumpToLatest(false);
  };

  // Per-code-block Copy button via event delegation
  const handleConversationClick = (e) => {
    const btn = e.target.closest('.parakeet-code-copy-btn');
    if (!btn) return;
    const code = btn.closest('.parakeet-code-wrapper')?.querySelector('code');
    const text = code ? code.textContent : '';
    if (!text) return;
    navigator.clipboard?.writeText(text);
    const original = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.textContent = original; }, 1400);
  };

  if (!visible) return null;

  return (
    <div className="pk-answer-card-wrap">
      <div
        className={`pk-answer-card pk-conversation pk-answer-reference ${isExpanded ? 'pk-expanded' : ''}`}
        style={{ maxHeight: isExpanded ? 'calc(100vh - 210px)' : '460px' }}
        ref={containerRef}
        onScroll={handleScroll}
        onClick={handleConversationClick}
      >
        <div className="pk-answer-toolbar">
          <div className="pk-answer-history-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600 }}>
              {turns.length > 0 ? `Q&A History (${turns.length} ${turns.length === 1 ? 'question' : 'questions'})` : 'Q&A Feed'}
            </span>
            {turns.length > 1 && (
              <span style={{ fontSize: '10px', color: '#71717a' }}>↓ Scroll down for previous answers</span>
            )}
          </div>
          <div className="pk-answer-toolbar-actions">
            {onClear && (
              <button
                type="button"
                className="pk-answer-clear-btn"
                onClick={onClear}
                title="Clear all questions and answers (Backspace)"
                aria-label="Clear all questions and answers"
              >
                Clear <kbd>⌫</kbd>
              </button>
            )}
            <button type="button" onClick={onToggleExpand} title={isExpanded ? 'Restore panel size' : 'Expand panel'} aria-label={isExpanded ? 'Restore panel size' : 'Expand panel'}>
              {isExpanded ? '↙' : '↗'}
            </button>
          </div>
        </div>

        {turns.length === 0 ? (
          <div className="pk-placeholder">
            ✨ <strong>FeonixAI Copilot Ready</strong>
            <br />
            <span>Start speaking, capture a coding problem, or type a question below to begin.</span>
          </div>
        ) : (
          turns.map((turn, index) => {
            const isLatestTurn = index === 0;
            const qNum = turn.qNumber || (turns.length - index);
            return (
              <div
                className={`pk-answer-turn ${turn.isStreaming ? 'pk-answer-turn-active' : ''}`}
                key={turn.id || index}
                id={`turn-${turn.id || index}`}
              >
                {/* User Question Block */}
                {turn.question && (
                  <div className="pk-reference-question">
                    <span className={`pk-turn-badge ${isLatestTurn ? 'pk-turn-badge-latest' : ''}`}>
                      Q{qNum}{isLatestTurn ? ' • Latest' : ''}
                    </span>
                    <span className="pk-reference-icon">💬</span>
                    <strong>Question:</strong>
                    <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{turn.question}</span>
                    <button
                      className="pk-reference-copy"
                      type="button"
                      title="Copy question"
                      onClick={() => handleCopyClick(`q-${turn.id || index}`, turn.question)}
                    >
                      {copiedId === `q-${turn.id || index}` ? '✓' : '⧉'}
                    </button>
                  </div>
                )}

                {/* Attached Screenshot Thumbnails */}
                {turn.images?.length > 0 && (
                  <div className="pk-msg-screenshots" style={{ marginTop: '8px' }}>
                    {turn.images.map((src, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={src}
                        alt={`Attached screenshot ${imgIdx + 1}`}
                        className="pk-msg-screenshot-thumb"
                        onClick={() => setZoomedImage(src)}
                        title="Click to view full size"
                      />
                    ))}
                  </div>
                )}

                {/* AI Answer Block */}
                <div className="pk-reference-answer">
                  <div className="pk-reference-answer-title">
                    <span>⭐</span>
                    <strong>Answer:</strong>
                  </div>

                  {turn.isStreaming && !turn.answerHtml && (
                    <div className="pk-thinking">
                      <span className="pk-thinking-pulse" />
                      <span className="pk-thinking-text">Crafting optimal answer…</span>
                    </div>
                  )}

                  {turn.isStreaming && turn.answerHtml && (
                    <div className="pk-thinking-live-badge">
                      <span className="pk-btn-spinner" />
                      <span>Streaming live answer…</span>
                    </div>
                  )}

                  {turn.isError && !turn.answerHtml && (
                    <div className="pk-answer-error">
                      <span>Unable to fetch answer. Please try again.</span>
                      {isLatestTurn && (
                        <button className="pk-thumb pk-thumb-retry" onClick={onRetry} type="button">
                          ↻ Retry
                        </button>
                      )}
                    </div>
                  )}

                  {!turn.isStreaming && !turn.answerHtml && !turn.isError && (
                    <div className="pk-thinking">
                      <span className="pk-thinking-pulse" />
                      <span className="pk-thinking-text">Crafting optimal answer…</span>
                    </div>
                  )}

                  {turn.answerHtml && (
                    <div
                      className="pk-answer-body"
                      dangerouslySetInnerHTML={{ __html: turn.answerHtml }}
                    />
                  )}

                  {turn.isError && isLatestTurn && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={onRetry}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#fca5a5',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        ↻ Retry Question
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Footer for this Turn */}
                {turn.answerHtml && !turn.isStreaming && (
                  <div className="pk-reference-footer">
                    <span>Answer {qNum} · {turn.timestamp || elapsedText || 'Session'}</span>
                    <div className="pk-reference-actions">
                      <button
                        type="button"
                        title="Copy answer"
                        onClick={() => handleCopyClick(`a-${turn.id || index}`, turn.answerHtml, true)}
                      >
                        {copiedId === `a-${turn.id || index}` ? '✓' : '⧉'}
                      </button>
                      <button type="button" title="Good answer" onClick={onThumbUp}>👍</button>
                      <button type="button" title="Needs improvement" onClick={onThumbDown}>👎</button>
                      {isLatestTurn && (
                        <>
                          <button type="button" title="Shorten answer" onClick={onShorten}>⇲</button>
                          <button type="button" title="Deepen answer" onClick={onExpand}>⇱</button>
                          <button type="button" title="Regenerate answer" onClick={onRegenerate}>↻</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showJumpToLatest && (
        <button className="pk-jump-latest" type="button" onClick={jumpToLatest} title="Jump to recently asked question at the top">
          ↑ Jump to latest ({`Q${turns[0]?.qNumber || turns.length}`})
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
