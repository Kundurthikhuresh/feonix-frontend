export default function RecordingIndicator({ listening, elapsedText, onToggle }) {
  return (
    <button
      className={`pk-rec-btn ${listening ? 'pk-rec-active' : ''}`}
      onClick={onToggle}
      type="button"
      title={listening ? 'Stop Recording' : 'Start Recording audio — captures interviewer questions live'}
    >
      <span className={`pk-rec-dot ${listening ? 'pk-rec-dot-live' : ''}`} />
      <span className="pk-rec-label">
        {listening ? `Recording  ${elapsedText}` : 'Start Recording'}
      </span>
    </button>
  );
}
