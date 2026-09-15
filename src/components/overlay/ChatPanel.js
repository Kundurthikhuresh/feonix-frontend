// Persistent compose bar — always rendered at the bottom of the copilot
// (never toggled away, per the ChatGPT-style requirement that the input
// stays available even while the user is reading older messages). `open`
// now only controls the optional quick-prompt pills drawer above it; the
// screenshot preview row and the textarea+Send row are always visible.
export default function ChatPanel({
  open, onClose, customPromptText, onChangePromptText, screenshots, onRemoveScreenshotAt,
  onSubmit, onKeyDown, onQuickPrompt, inputRef, thinking,
}) {
  const hasScreenshots = screenshots && screenshots.length > 0;
  const canSend = (customPromptText.trim().length > 0 || hasScreenshots) && !thinking;

  return (
    <div className="pk-prompt-hub">
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

      {open && (
        <div className="pk-hub-pills">
          <button className="pk-hub-pill" onClick={() => onQuickPrompt('STAR Method', 'star')} type="button">⭐ STAR</button>
          <button className="pk-hub-pill" onClick={() => onQuickPrompt('Code + Big-O', 'code')} type="button">💻 Code</button>
          <button className="pk-hub-pill" onClick={() => onQuickPrompt('3 concise bullets', 'teleprompter')} type="button">💡 Bullets</button>
          <button className="pk-hub-pill" onClick={() => onQuickPrompt('Multiple Choice answer', 'quiz')} type="button">📝 Quiz</button>
          {onClose && (
            <button className="pk-hub-pill pk-hub-pill-close" onClick={onClose} type="button" title="Hide quick prompts">✕</button>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="pk-chat-compose">
        <textarea
          ref={inputRef}
          value={customPromptText}
          onChange={(e) => onChangePromptText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={hasScreenshots ? 'Add extra instructions… (Enter to send, Shift+Enter for a new line)' : 'Ask any interview question or coding prompt… (Enter to send, Shift+Enter for a new line)'}
          className="pk-chat-textarea"
          rows={1}
        />
        <button className="pk-hub-send" type="submit" disabled={!canSend}>
          {thinking ? '…' : 'Send →'}
        </button>
      </form>
    </div>
  );
}
