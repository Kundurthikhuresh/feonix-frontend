import React from 'react';

const MicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

/* Decorative audio bars for the header; fixed heights so it renders the same
 * on the server and in the browser. */
const WAVE = [14, 30, 52, 24, 70, 40, 88, 56, 34, 76, 48, 92, 60, 28, 66, 44, 80, 36, 58, 22, 46, 18];

export default function MockInterviewPane({
  trialsLeft,
  creditsLeft,
  unlimitedPlan,
  onCreateMock,
}) {
  const trials = Number(trialsLeft);
  const credits = Number(creditsLeft);
  const canStart = Boolean(unlimitedPlan) || trials > 0 || credits >= 0.5;

  return (
    <main className="dash mock-pane">
      <section className="mock-hero">
        <div className="mock-hero-text">
          <h1>Mock interview</h1>
          <p className="mock-lede">
            Rehearse with FeonixAI before the real call. Answer out loud while the
            copilot drafts beside you, exactly as it will on the day.
          </p>
          <p className="mock-length">
            <strong>{unlimitedPlan ? 'Unlimited' : '10'}</strong> {unlimitedPlan ? 'practice' : 'minutes on a free trial · 30 minutes per 0.5 credit'}
          </p>
          <p className="mock-cost">
            <span className="mock-cost-dot" aria-hidden="true" />
            {unlimitedPlan ? (
              <span>Included in your {unlimitedPlan.replace('Unlimited · ', '')} plan.</span>
            ) : canStart ? (
              <span>
                Uses <strong>1 free trial</strong> or <strong>0.5 credit</strong>. You have{' '}
                {Number.isFinite(trials) ? trials : '—'} {trials === 1 ? 'trial' : 'trials'} and{' '}
                {Number.isFinite(credits) ? credits : '—'} credits left.
              </span>
            ) : (
              <span>
                Uses 1 free trial or 0.5 credit. You are out; <a href="/pricing">top up</a> to start one.
              </span>
            )}
          </p>
        </div>
        <div className="mock-wave" aria-hidden="true">
          {WAVE.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
        </div>
      </section>

      <section className="mock-card">
        <span className="mock-card-icon"><MicIcon /></span>
        <div className="mock-card-text">
          <h2>Custom mock interview</h2>
          <p>Name the company and paste the job description. The practice round is built from it, so you can rehearse any role.</p>
        </div>
        <button className="btn mock-card-btn" type="button" onClick={() => onCreateMock(null)} disabled={!canStart}>
          Create mock interview
        </button>
      </section>

    </main>
  );
}
