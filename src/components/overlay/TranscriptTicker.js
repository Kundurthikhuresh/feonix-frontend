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

  // Derive streaming text from chips or cueLine
  const recentTexts = transcriptChips && transcriptChips.length > 0
    ? transcriptChips.slice(-6).map((c) => (typeof c === 'string' ? c : c.text)).filter(Boolean)
    : [];

  const idleText = listening ? 'Listening to conversation…' : 'Microphone paused. Click mic to listen.';
  // While listening, the latest words actually heard win over older question
  // chips, so it is obvious whether speech is being picked up right now.
  const heard = listening && lastHeard ? `Heard: “${lastHeard}”` : '';
  const displayText = heard
    || (recentTexts.length > 0 ? recentTexts.join('    ') : (cueLine || idleText));

  // Auto-scroll to the end of the text stream when new words arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [displayText]);

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

      <div className="fe-ticker-scroll" ref={scrollRef}>
        <span className="fe-ticker-text">
          {displayText}
        </span>
      </div>
    </div>
  );
}
