import React from 'react';
import { sanitizeHTML } from '../../lib/sanitize';
import { formatParakeetAnswer } from '../../lib/answerFormatter';

export default function CopilotAppView({
  activeSession,
  listening,
  toggleListening,
  elapsedText,
  tallyState,
  tallyLabel,
  listenSource,
  setListenSource,
  newAuto,
  setNewAuto,
  liveCueLine,
  liveQType,
  liveAnswer,
  liveTranscripts,
  setLiveTranscripts,
  manualQuestion,
  setManualQuestion,
  handleManualAskSubmit,
  handleEndSession,
  setCurrentView,
  stopListening,
}) {
  return (
    <div id="appView">
      <aside className="rail">
        <div style={{ marginBottom: '14px' }}>
          <button
            className="btn-quiet"
            onClick={() => {
              stopListening();
              setCurrentView('dash');
            }}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              justifyContent: 'center',
              padding: '6px 10px',
              fontSize: '12.5px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="rail-section">
          <h2>Session</h2>
          <div className="rail-session">
            <strong className="co">{activeSession?.company}</strong>
            <span className="ro">{activeSession?.role}</span>
          </div>
          <div className="tally" data-state={tallyState}>
            <span className="tally-dot"></span>
            <span>{tallyLabel}</span>
          </div>
          <div className="elapsed">{elapsedText}</div>
        </div>

        <div className="rail-section">
          <h2>Listen to</h2>
          <div className="source-choice">
            <label>
              <input
                type="radio"
                name="source"
                value="tab"
                checked={listenSource === 'tab'}
                onChange={() => setListenSource('tab')}
              />
              <span>
                Meeting audio <span className="sub">Shares call tab interviewer.</span>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="source"
                value="mic"
                checked={listenSource === 'mic'}
                onChange={() => setListenSource('mic')}
              />
              <span>
                Microphone <span className="sub">Hears the local room.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="rail-section">
          <h2>Answering</h2>
          <label className="toggle">
            <input
              type="checkbox"
              checked={newAuto}
              onChange={(e) => setNewAuto(e.target.checked)}
            />
            <span>Answering automatically</span>
          </label>
        </div>

        <div className="rail-foot">
          <button className="btn" onClick={toggleListening} type="button">
            {listening ? 'Stop listening' : 'Start listening'}
          </button>
          <button className="btn btn-quiet" onClick={handleEndSession} type="button">
            End session
          </button>
          <button
            className="btn-link"
            onClick={() => {
              stopListening();
              setCurrentView('dash');
            }}
            type="button"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      <main className="stage">
        <section className="answer-pane">
          {liveCueLine ? (
            <>
              <div className="cue-line">{liveCueLine}</div>
              <div className="qtype">{liveQType}</div>
              <div
                className="answer"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(formatParakeetAnswer(liveAnswer)) }}
              />
            </>
          ) : (
            <div className="empty-state">
              <strong>Nothing to answer yet.</strong>
              Start listening to capture the question, or type it manually in the input bar below.
            </div>
          )}
        </section>

        <section className="transcript">
          <div className="transcript-head">
            <span>Transcript</span>
            <button className="btn-link" onClick={() => setLiveTranscripts([])} type="button">
              Clear
            </button>
          </div>
          <div className="transcript-body">
            {liveTranscripts.map((t, idx) => (
              <div key={idx} className="turn" data-kind={t.is_question ? 'question' : 'speech'}>
                <div className="turn-label">
                  {t.speaker || (t.is_question ? 'Interviewer' : 'Speaker')}
                </div>
                <div className="turn-text">{t.text}</div>
              </div>
            ))}
          </div>
          <form className="ask-bar" onSubmit={handleManualAskSubmit}>
            <input
              value={manualQuestion}
              onChange={(e) => setManualQuestion(e.target.value)}
              placeholder="Type the question you were just asked"
              autoComplete="off"
            />
            <button className="btn" type="submit">
              Answer
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
