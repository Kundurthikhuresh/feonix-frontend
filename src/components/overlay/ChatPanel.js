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

      <div className="pk-hub-status-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px 6px', fontSize: '11px', color: '#a1a1aa' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#00f5ff', fontWeight: 600 }}>👑 Owner Persona:</span>
          <span>90% Human Thinking · 10% AI Precision (Senior Engineer Voice)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          <span>Dual Audio (Mic + Interviewer)</span>
        </span>
      </div>

      {open && (
        <div className="pk-hub-pills">
          <button className="pk-hub-pill" onClick={() => onQuickPrompt('STAR Method (Owner Voice)', 'star')} type="button">⭐ STAR Story</button>
          <button className="pk-hub-pill" onClick={() => onQuickPrompt('Code + Big-O Walkthrough', 'code')} type="button">💻 Code + Big-O</button>
          <button className="pk-hub-pill" onClick={() => onQuickPrompt('Detailed Speaking Beats', 'teleprompter')} type="button">💡 Speaking Beats</button>
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
          placeholder={hasScreenshots ? 'Add extra instructions… (Enter to send, Shift+Enter for a new line)' : 'Ask any interview or coding question (Answers as Owner with "I used", "I did", "I work")...'}
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
