import React, { useRef, useEffect } from 'react';

export default function TranscriptTicker({
  listening,
  transcriptChips = [],
  cueLine = '',
  lastHeard = '',
  onDragStart,
  nativeDrag = false,
}) {
  const scrollRef = useRef(null);

  // Every question asked so far, oldest first. The strip scrolls to the end,
  // so the newest is on the right and earlier ones move off to the left.
  const questions = (transcriptChips || [])
    .filter((c) => c && (typeof c === 'string' || c.isQuestion !== false))
    .map((c) => (typeof c === 'string' ? c : c.text))
    .filter(Boolean);

  const idleText = listening ? 'Listening to conversation…' : 'Microphone paused. Click mic to listen.';
  // While listening, the words being heard right now follow the questions, so
  // it is obvious whether speech is being picked up; skipped when they are
  // just the latest question again.
  const latest = questions[questions.length - 1] || '';
  const heard = listening && lastHeard && lastHeard.trim() !== latest.trim() ? lastHeard : '';
  const hasContent = questions.length > 0 || heard;

  // Auto-scroll to the end of the text stream when new words arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [questions.length, latest, heard]);

  return (
    <div
      className="fe-transcript-pill"
      // Desktop app: a native OS drag region (nothing in this pill is clickable).
      onMouseDown={nativeDrag ? undefined : onDragStart}
      style={nativeDrag ? { WebkitAppRegion: 'drag', cursor: 'move' } : undefined}
      title="Live conversation transcript stream (click & drag to move)"
    >
      <div className={`fe-equalizer ${listening ? 'fe-equalizer-active' : ''}`} title={listening ? 'Audio active' : 'Audio muted'}>
        <span className="fe-eq-bar fe-eq-bar-1" />
        <span className="fe-eq-bar fe-eq-bar-2" />
        <span className="fe-eq-bar fe-eq-bar-3" />
      </div>

      <div className={`fe-ticker-scroll ${hasContent ? '' : 'fe-ticker-idle'}`} ref={scrollRef}>
        {hasContent ? (
          <span className="fe-ticker-text">
            {questions.map((q, i) => (
              <span
                key={`${i}-${q.slice(0, 24)}`}
                className={i === questions.length - 1 && !heard ? 'fe-ticker-q fe-ticker-q-latest' : 'fe-ticker-q'}
              >
                {q}
              </span>
            ))}
            {heard && <span className="fe-ticker-q fe-ticker-heard">Heard: “{heard}”</span>}
          </span>
        ) : (
          <span className="fe-ticker-text">{cueLine || idleText}</span>
        )}
      </div>
    </div>
  );
}
