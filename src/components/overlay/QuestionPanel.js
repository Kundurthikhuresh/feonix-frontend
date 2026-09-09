// Parakeet AI Row 2: Live Transcript Strip
// Shows real-time speech waveform, detected question chips with one-click solve, and clear trigger.
export default function QuestionPanel({
  listening, transcriptChips, chipsContainerRef, onChipClick, onClear, onDragStart,
}) {
  return (
    <div className="pk-strip" onMouseDown={onDragStart}>
      <div className="pk-strip-wave" title={listening ? 'Listening to interviewer audio…' : 'Microphone paused'}>
        {listening ? (
          <><i /><i /><i /><i /></>
        ) : (
          <span className="pk-strip-pause">▐▐</span>
        )}
      </div>

      <div
        className="pk-chips"
        ref={chipsContainerRef}
        onWheel={(e) => { if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY; }}
      >
        {transcriptChips.map((chip, idx) => (
          <span
            key={idx}
            className={`pk-chip ${chip.isQuestion ? 'pk-chip-q' : ''}`}
            onClick={() => onChipClick(chip)}
            title={chip.isQuestion ? "Click to generate answer (⌘↵)" : chip.text}
          >
            {chip.isQuestion && <span className="pk-chip-badge">Question</span>}
            <span className="pk-chip-text">{chip.text}</span>
            {chip.isQuestion && <span className="pk-chip-solve">✨ Solve</span>}
          </span>
        ))}
        {transcriptChips.length === 0 && (
          <span className="pk-chip pk-chip-idle">Listening for interview question…</span>
        )}
      </div>

      <button className="pk-strip-clear" onClick={onClear} type="button" title="Clear conversation transcript">
        Clear <kbd>⌘⇧⌫</kbd>
      </button>
    </div>
  );
}

