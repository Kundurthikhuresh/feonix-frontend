// The generated answer, revealed progressively as it streams (see
// useAnswerStreaming) — question line, then bullets, then the full spoken
// explanation, replacing whatever the previous answer was.
export default function AnswerPanel({
  visible, cueLine, answerHtml, thinking, isExpanded, elapsedText,
  onClear, onCopyQuestion, onCopyResponse, onThumbUp, onThumbDown,
}) {
  if (!visible) return null;

  return (
    <>
      {(cueLine || answerHtml) && (
        <div className="pk-nav-bar">
          <button className="pk-nav-arrow" onClick={onClear} title="Previous" type="button">⌘←</button>
          <button className="pk-nav-arrow" title="Next" type="button">⌘→</button>
          <div className="pk-spacer" />
          <button className="pk-strip-clear" onClick={onClear} type="button">
            Clear Answer <kbd>⌘⌫</kbd>
          </button>
        </div>
      )}

      <div
        className={`pk-answer-card ${isExpanded ? 'pk-expanded' : ''}`}
        style={{ maxHeight: isExpanded ? '70vh' : '340px' }}
      >
        {thinking && (
          <div className="pk-thinking">
            <span /><span /><span />
          </div>
        )}

        {cueLine && (
          <div className="pk-question-line">
            <span className="pk-ql-icon">💬</span>
            <strong>Question:</strong>
            <span className="pk-ql-text">{cueLine}</span>
            <button className="pk-copy-btn" title="Copy" type="button" onClick={onCopyQuestion}>⧉</button>
          </div>
        )}

        <div
          className="pk-answer-body"
          dangerouslySetInnerHTML={{
            __html: answerHtml || (thinking ? '' : (
              '<div class="pk-placeholder">💡 <strong>FeonixAI Copilot Ready</strong><br/><span>Start recording or type a question in Chat to generate instant AI answers.</span></div>'
            ))
          }}
        />

        {answerHtml && !thinking && (
          <div className="pk-answer-foot">
            <span className="pk-foot-label">Answer · {elapsedText}</span>
            <div className="pk-foot-actions">
              <button className="pk-thumb" onClick={onCopyResponse} type="button" title="Copy Response">⧉ Copy</button>
              <button className="pk-thumb" onClick={onThumbUp} type="button" title="Helpful">👍</button>
              <button className="pk-thumb" onClick={onThumbDown} type="button" title="Not helpful">👎</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
