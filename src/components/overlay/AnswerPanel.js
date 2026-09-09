// Parakeet AI Answer Panel:
// Features 3 answer modes (STAR Method, Technical Code, Teleprompter),
// live streaming answer rendering, question highlight, and quick refinement actions.
export default function AnswerPanel({
  visible, cueLine, answerHtml, thinking, isExpanded, elapsedText, hasError,
  onCopyQuestion, onCopyResponse, onThumbUp, onThumbDown,
  onRegenerate, onShorten, onExpand, onRetry,
}) {
  if (!visible) return null;

  return (
    <>
      <div
        className={`pk-answer-card ${isExpanded ? 'pk-expanded' : ''}`}
        style={{ maxHeight: isExpanded ? '70vh' : '360px' }}
      >
        {thinking && (
          <div className="pk-thinking">
            <span className="pk-thinking-pulse" />
            <span className="pk-thinking-text">Crafting optimal answer…</span>
          </div>
        )}

        {cueLine && (
          <div className="pk-question-line">
            <span className="pk-ql-icon">💬</span>
            <span className="pk-ql-badge">Question</span>
            <span className="pk-ql-text">{cueLine}</span>
            <button className="pk-copy-btn" title="Copy Question" type="button" onClick={onCopyQuestion}>⧉</button>
          </div>
        )}

        <div
          className="pk-answer-body"
          dangerouslySetInnerHTML={{
            __html: answerHtml || (thinking ? '' : (
              '<div class="pk-placeholder">✨ <strong>FeonixAI Copilot Ready</strong><br/><span>Start speaking or capture a coding problem to generate live answers.</span></div>'
            ))
          }}
        />

        {answerHtml && !thinking && (
          <div className="pk-answer-foot">
            <span className="pk-foot-label">
              <span className="pk-foot-dot" />
              Answer ready · {elapsedText || 'Live'}
            </span>
            <div className="pk-foot-actions">
              {hasError ? (
                <button className="pk-thumb pk-thumb-retry" onClick={onRetry} type="button" title="Retry">↻ Retry</button>
              ) : (
                <>
                  <button className="pk-thumb" onClick={onShorten} type="button" title="Make answer shorter and punchier">⇲ Shorten</button>
                  <button className="pk-thumb" onClick={onExpand} type="button" title="Expand with more technical depth">⇱ Deepen</button>
                  <button className="pk-thumb" onClick={onRegenerate} type="button" title="Generate alternative answer">↻ Regenerate</button>
                  <button className="pk-thumb" onClick={onCopyResponse} type="button" title="Copy Response to clipboard">⧉ Copy</button>
                  <button className="pk-thumb" onClick={onThumbUp} type="button" title="Good answer">👍</button>
                  <button className="pk-thumb" onClick={onThumbDown} type="button" title="Needs improvement">👎</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

