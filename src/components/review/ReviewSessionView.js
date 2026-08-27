import React from 'react';
import { formatWhen } from '../../lib/utils';

export default function ReviewSessionView({
  reviewPane,
  setReviewPane,
  reviewData,
  reviewMessages,
  reviewAskInput,
  setReviewAskInput,
  handleReviewAskSubmit,
  setCurrentView,
}) {
  return (
    <div id="reviewView">
      <aside className="review-rail">
        <div>
          <h2>Session Review</h2>
          <p className="review-role">
            {reviewData?.company} {reviewData?.role && `· ${reviewData.role}`}
          </p>
        </div>
        <nav className="review-nav">
          <button
            className={`review-tab ${reviewPane === 'notes' ? 'is-current' : ''}`}
            onClick={() => setReviewPane('notes')}
            type="button"
          >
            AI notes
          </button>
          <button
            className={`review-tab ${reviewPane === 'transcript' ? 'is-current' : ''}`}
            onClick={() => setReviewPane('transcript')}
            type="button"
          >
            Transcript
          </button>
          <button
            className={`review-tab ${reviewPane === 'ask' ? 'is-current' : ''}`}
            onClick={() => setReviewPane('ask')}
            type="button"
          >
            Ask AI
          </button>
          <button
            className={`review-tab ${reviewPane === 'details' ? 'is-current' : ''}`}
            onClick={() => setReviewPane('details')}
            type="button"
          >
            Call details
          </button>
        </nav>
        <button className="btn btn-quiet" onClick={() => setCurrentView('dash')} type="button">
          Back to sessions
        </button>
      </aside>

      <main className="review-main">
        <header className="review-head">
          <h3>
            {reviewPane === 'notes'
              ? 'AI Notes'
              : reviewPane === 'transcript'
              ? 'Transcript'
              : reviewPane === 'ask'
              ? 'Ask AI Coach'
              : 'Session Details'}
          </h3>
        </header>

        <div className="review-body">
          {reviewPane === 'notes' && (
            <div className="notes-section">
              <h4>Summary</h4>
              <p className="notes-summary">
                {reviewData?.notes || 'No AI summary generated for this session.'}
              </p>
            </div>
          )}

          {reviewPane === 'transcript' && (
            <div className="review-transcript">
              {reviewData?.transcripts?.map((t, idx) => (
                <div key={idx} className="turn" data-kind={t.is_question ? 'question' : 'speech'}>
                  <div className="turn-label">
                    {t.speaker || (t.is_question ? 'Interviewer' : 'Speaker')}
                  </div>
                  <div className="turn-text">{t.text}</div>
                </div>
              ))}
              {(!reviewData?.transcripts || reviewData.transcripts.length === 0) && (
                <p>No transcript was recorded for this session.</p>
              )}
            </div>
          )}

          {reviewPane === 'ask' && (
            <div className="ask-chat-container">
              <div className="ask-thread" style={{ overflowY: 'auto', maxHeight: '350px' }}>
                {reviewMessages.map((m, idx) => (
                  <div key={idx} className="ask-turn">
                    <div className={m.role === 'user' ? 'you' : 'reply'}>
                      <strong>{m.role === 'user' ? 'You:' : 'AI Coach:'}</strong>
                      <p>{m.content}</p>
                    </div>
                  </div>
                ))}
                {reviewMessages.length === 0 && (
                  <p className="notes-summary">
                    Ask questions about your performance, topics discussed, or follow-ups.
                  </p>
                )}
              </div>
              <form className="ask-form" onSubmit={handleReviewAskSubmit}>
                <input
                  value={reviewAskInput}
                  onChange={(e) => setReviewAskInput(e.target.value)}
                  placeholder="How did I do on explaining Process vs Thread?"
                  autoComplete="off"
                />
                <button className="btn" type="submit">
                  Ask Coach
                </button>
              </form>
            </div>
          )}

          {reviewPane === 'details' && (
            <div className="detail-group">
              <h4>Information</h4>
              <dl className="detail-row">
                <dt>Company</dt>
                <dd>{reviewData?.company}</dd>
              </dl>
              {reviewData?.role && (
                <dl className="detail-row">
                  <dt>Role</dt>
                  <dd>{reviewData?.role}</dd>
                </dl>
              )}
              <dl className="detail-row">
                <dt>Status</dt>
                <dd>{reviewData?.status}</dd>
              </dl>
              <dl className="detail-row">
                <dt>Created at</dt>
                <dd>{formatWhen(reviewData?.created_at)}</dd>
              </dl>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
