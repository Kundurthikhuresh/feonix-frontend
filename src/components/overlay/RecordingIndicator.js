export default function RecordingIndicator({ listening, elapsedText, onToggle, thinking, isAnswering }) {
  return (
    <button
      className={`pk-rec-btn ${listening ? 'pk-rec-active' : ''}`}
      onClick={onToggle}
      type="button"
      title={listening ? 'Copilot Audio Recording is Active — Capturing interviewer & mic (Click to Pause)' : 'Click to Start Copilot Audio Recording'}
    >
      <span className={`pk-rec-dot ${listening ? 'pk-rec-dot-live' : ''}`} />
      <span className="pk-rec-label">
        {listening ? (
          <>
            <span>Copilot Recording</span>
            {elapsedText ? <span className="pk-rec-elapsed">{elapsedText}</span> : null}
          </>
        ) : (
          <span>🎙️ Start Recording</span>
        )}
      </span>
    </button>
  );
}
