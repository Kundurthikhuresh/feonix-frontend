// Row 2 of the HUD: the live transcript strip. Doubles as the microphone /
// listening indicator (the little waveform bars vs. a paused glyph) and as
// where a detected question gets picked up from if you'd rather tap it than
// wait for auto-answer.
export default function QuestionPanel({
  listening, transcriptChips, chipsContainerRef, onChipClick, onClear, onDragStart,
}) {
  return (
    <div className="pk-strip" onMouseDown={onDragStart}>
      <div className="pk-strip-wave" title={listening ? 'Listening…' : 'Not listening'}>
        {listening ? (
          <><i /><i /><i /></>
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
            title="Click to solve"
          >
            {chip.text}
          </span>
        ))}
        {transcriptChips.length === 0 && (
          <span className="pk-chip pk-chip-idle">Waiting for conversation transcript…</span>
        )}
      </div>

      <button className="pk-strip-clear" onClick={onClear} type="button" title="Clear transcript">
        Clear <kbd>⌘⇧⌫</kbd>
      </button>
    </div>
  );
}
