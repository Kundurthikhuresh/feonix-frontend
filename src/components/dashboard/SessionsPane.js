import React from 'react';
import { useRouter } from 'next/navigation';
import { formatWhen } from '../../lib/utils';

export default function SessionsPane({
  sessions,
  sessionFilter,
  setSessionFilter,
  sessionSearch,
  setSessionSearch,
  creditsLeft,
  usedCredits,
  trialsLeft,
  setShowCreateSheet,
  handleOpenReview,
  handleDeleteSession,
}) {
  const router = useRouter();
  const goToLaunch = (id) => router.push(`/launch?session=${id}`);

  const filteredSessions = sessions.filter((s) => {
    if (sessionFilter !== 'all' && s.status !== sessionFilter) return false;
    if (sessionSearch.trim()) {
      const query = sessionSearch.toLowerCase();
      const matchCo = (s.company || '').toLowerCase().includes(query);
      const matchRo = (s.role || '').toLowerCase().includes(query);
      return matchCo || matchRo;
    }
    return true;
  });

  return (
    <main className="dash">
      <header className="dash-head">
        <div>
          <h1>Call sessions</h1>
          <p className="lede">Prepare for a call, then review it afterwards.</p>
        </div>
        <button className="btn" onClick={() => setShowCreateSheet(true)} type="button">
          New session
        </button>
      </header>

      <div className="account-strip">
        <div className="acct">
          <span className="acct-label">Available</span>
          <span className="acct-value">{creditsLeft}</span>
          <span className="acct-sub">credits remaining</span>
        </div>
        <div className="acct">
          <span className="acct-label">Used</span>
          <span className="acct-value">{usedCredits}</span>
          <span className="acct-sub">credits consumed</span>
        </div>
        <div className="acct">
          <span className="acct-label">Free trials</span>
          <span className="acct-value">{trialsLeft}</span>
          <span className="acct-sub">trials remaining</span>
        </div>
      </div>

      <div className="dash-tabs">
        <button className={`tab ${sessionFilter === 'all' ? 'is-current' : ''}`} onClick={() => setSessionFilter('all')} type="button">All</button>
        <button className={`tab ${sessionFilter === 'ready' ? 'is-current' : ''}`} onClick={() => setSessionFilter('ready')} type="button">Ready</button>
        <button className={`tab ${sessionFilter === 'active' ? 'is-current' : ''}`} onClick={() => setSessionFilter('active')} type="button">Active</button>
        <button className={`tab ${sessionFilter === 'ended' ? 'is-current' : ''}`} onClick={() => setSessionFilter('ended')} type="button">Ended</button>
        <span className="dash-count">{filteredSessions.length} sessions</span>
      </div>

      <input
        className="dash-search"
        placeholder="Search by company or role"
        value={sessionSearch}
        onChange={(e) => setSessionSearch(e.target.value)}
        autoComplete="off"
      />

      <div className="session-grid">
        {filteredSessions.map((s) => (
          <div key={s.id} className="session-card">
            <div className="when">{formatWhen(s.created_at)}</div>
            <h3>{s.company || 'Unnamed Call'}</h3>
            <p className="role">{s.role || '—'}</p>

            {/* Chips: billing + mode + answer + line counts */}
            <div className="chips">
              {s.billing_kind === 'trial' && <span className="chip">FREE TRIAL</span>}
              <span className="chip">{(s.mode || 'interview').toUpperCase()}</span>
              <span className="chip">{s.answer_count ?? 0} ANSWERS</span>
              <span className="chip">{s.line_count ?? 0} LINES</span>
            </div>

            {/* Footer: status left, buttons right */}
            <div className="session-card-foot">
              <div className="sc-status-group">
                <div className="status" data-status={s.status}>
                  <span className="status-dot" data-status={s.status}></span>
                  {s.status === 'ready'
                    ? 'Ready to start'
                    : s.status === 'active'
                      ? 'In progress'
                      : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </div>
                <span className="sc-usage">
                  {s.tokens_used ? `${s.tokens_used} tokens` : 'No usage yet'}
                </span>
              </div>

              <div className="sc-actions">
                <button
                  className="btn btn-small btn-quiet"
                  style={{ color: 'var(--alert)' }}
                  onClick={() => handleDeleteSession(s.id)}
                  type="button"
                >
                  Delete
                </button>

                {s.status !== 'ended' && (
                  <button
                    className="btn btn-small btn-quiet"
                    onClick={() => handleOpenReview(s.id)}
                    type="button"
                  >
                    Transcript
                  </button>
                )}

                {/* Primary action: View transcript / Resume / Start session */}
                {s.status === 'ended' ? (
                  <button
                    className="btn btn-small btn-quiet"
                    onClick={() => handleOpenReview(s.id)}
                    type="button"
                  >
                    View transcript
                  </button>
                ) : s.status === 'active' ? (
                  <button
                    className="btn btn-small"
                    onClick={() => goToLaunch(s.id)}
                    type="button"
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    className="btn btn-small"
                    onClick={() => goToLaunch(s.id)}
                    type="button"
                  >
                    Start session
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredSessions.length === 0 && (
          <div className="dash-empty">No sessions found in this category.</div>
        )}
      </div>
    </main>
  );
}
