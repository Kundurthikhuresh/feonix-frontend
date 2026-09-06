export default function ChatPanel({
  open, onClose, customPromptText, onChangePromptText, screenshots, onRemoveScreenshotAt, onSubmit, onQuickPrompt,
}) {
  if (!open) return null;
  const hasScreenshots = screenshots && screenshots.length > 0;
  return (
    <div className="pk-prompt-hub">
      <div className="pk-hub-head">
        <span>✦ Custom Prompt</span>
        <button className="pk-icon-btn" onClick={onClose} type="button">✕</button>
      </div>
      {hasScreenshots && (
        // A screenshot attached via paste/capture only ever showed up as a
        // one-word placeholder-text change ("Add extra instructions…") —
        // easy to miss entirely, which read as "pasting doesn't work" even
        // though the data really was attached. Actual thumbnails are
        // unambiguous proof of what's riding along with the next question,
        // and — now that more than one can be attached at once — of exactly
        // which ones, with a way to drop just one before asking.
        <div className="pk-hub-preview-row">
          {screenshots.map((src, index) => (
            <div className="pk-hub-preview" key={index}>
              <img src={src} alt={`Attached screenshot ${index + 1}`} />
              {onRemoveScreenshotAt && (
                <button className="pk-hub-preview-remove" onClick={() => onRemoveScreenshotAt(index)} type="button" title="Remove this screenshot">✕</button>
              )}
            </div>
          ))}
          <span className="pk-hub-preview-label">
            📸 {screenshots.length > 1 ? `${screenshots.length} screenshots attached` : 'Screenshot attached'}
          </span>
        </div>
      )}
      <form onSubmit={onSubmit} className="pk-hub-form">
        <input
          value={customPromptText}
          onChange={(e) => onChangePromptText(e.target.value)}
          placeholder={hasScreenshots ? 'Add extra instructions…' : 'Ask any interview question or coding prompt…'}
          className="pk-hub-input"
          autoFocus
        />
        <button className="pk-hub-send" type="submit">Solve →</button>
      </form>
      <div className="pk-hub-pills">
        <button className="pk-hub-pill" onClick={() => onQuickPrompt('STAR Method', 'star')} type="button">⭐ STAR</button>
        <button className="pk-hub-pill" onClick={() => onQuickPrompt('Code + Big-O', 'code')} type="button">💻 Code</button>
        <button className="pk-hub-pill" onClick={() => onQuickPrompt('3 concise bullets', 'teleprompter')} type="button">💡 Bullets</button>
        <button className="pk-hub-pill" onClick={() => onQuickPrompt('Multiple Choice answer', 'quiz')} type="button">📝 Quiz</button>
      </div>
    </div>
  );
}
