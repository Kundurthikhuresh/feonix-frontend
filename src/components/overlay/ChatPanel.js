export default function ChatPanel({
  open, onClose, customPromptText, onChangePromptText, screenshotData, onSubmit, onQuickPrompt,
}) {
  if (!open) return null;
  return (
    <div className="pk-prompt-hub">
      <div className="pk-hub-head">
        <span>✦ Custom Prompt</span>
        <button className="pk-icon-btn" onClick={onClose} type="button">✕</button>
      </div>
      <form onSubmit={onSubmit} className="pk-hub-form">
        <input
          value={customPromptText}
          onChange={(e) => onChangePromptText(e.target.value)}
          placeholder={screenshotData ? 'Add extra instructions…' : 'Ask any interview question or coding prompt…'}
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
