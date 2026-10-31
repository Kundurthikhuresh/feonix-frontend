import { isSilenceHallucination, NON_QUESTION_PLEASANTRIES, OUTRO_OR_GREETING_ANYWHERE } from '../../services/speechService';

export default function QuestionPanel({
  listening, transcriptChips, captureWarning, transcriptionError, chipsContainerRef, onChipClick, onClear, onDragStart,
  isAnswering, cueLine, thinking,
}) {
  const activeFetching = Boolean(isAnswering || thinking);

  return (
    <div className="pk-strip" onMouseDown={onDragStart}>
      <div className="pk-strip-wave" title={listening ? (activeFetching ? 'AI is fetching answer for detected question…' : 'Listening to interviewer audio…') : 'Microphone paused'}>
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
        {listening && captureWarning && (
          <span className="pk-chip pk-chip-warning" role="status">⚠ {captureWarning}</span>
        )}
        {listening && transcriptionError && !/timed?\s*out/i.test(transcriptionError) && (
          <span className="pk-chip pk-chip-warning" role="alert">⚠ {transcriptionError}</span>
        )}
        {activeFetching && cueLine && !isSilenceHallucination(cueLine) && !NON_QUESTION_PLEASANTRIES.test(cueLine) && !OUTRO_OR_GREETING_ANYWHERE.test(cueLine) && (
          <span className="pk-chip pk-chip-fetching" title={`AI is answering: ${cueLine}`}>
            <span className="pk-btn-spinner" />
            <span className="pk-chip-badge" style={{ background: '#22c55e', color: '#052e16' }}>Answering</span>
            <span className="pk-chip-text">{cueLine.length > 60 ? `${cueLine.slice(0, 57)}…` : cueLine}</span>
          </span>
        )}

        {(() => {
          const questionChips = transcriptChips.filter((chip) =>
            chip.isQuestion &&
            !isSilenceHallucination(chip.text) &&
            !NON_QUESTION_PLEASANTRIES.test(chip.text) &&
            !OUTRO_OR_GREETING_ANYWHERE.test(chip.text)
          );
          return (
            <>
              {questionChips.map((chip, idx) => {
                const isThisChipBeingAnswered = activeFetching && (chip.text === cueLine || idx === questionChips.length - 1);
                return (
                  <span
                    key={idx}
                    className={`pk-chip pk-chip-q ${isThisChipBeingAnswered ? 'pk-chip-answering-active' : ''}`}
                    onClick={() => onChipClick(chip)}
                    title={isThisChipBeingAnswered ? 'Currently generating answer…' : 'Click to generate answer (⌘↵)'}
                  >
                    <span className="pk-chip-badge">{isThisChipBeingAnswered ? '⚡ Live' : 'Question'}</span>
                    <span className="pk-chip-text">{chip.text}</span>
                    <span className={`pk-chip-solve ${isThisChipBeingAnswered ? 'pk-chip-solving' : ''}`}>
                      {isThisChipBeingAnswered ? '⚡ Fetching…' : '✨ Solve'}
                    </span>
                  </span>
                );
              })}

              {questionChips.length === 0 && !activeFetching && (
                <span className="pk-chip pk-chip-idle">
                  {listening
                    ? 'Listening for interview question… For calls on headphones, select Tab / System audio in Settings.'
                    : 'Microphone paused — click Start Recording to begin'}
                </span>
              )}

              {questionChips.length === 0 && activeFetching && !cueLine && (
                <span className="pk-chip pk-chip-fetching">
                  <span className="pk-btn-spinner" />
                  <span>Fetching answer for question…</span>
                </span>
              )}
            </>
          );
        })()}
      </div>

      <button className="pk-strip-clear" onClick={onClear} type="button" title="Clear conversation transcript">
        Clear <kbd>⌘⇧⌫</kbd>
      </button>
    </div>
  );
}

