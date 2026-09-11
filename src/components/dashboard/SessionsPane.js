import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatWhen } from '../../lib/utils';

function parseTimestamp(val) {
  if (!val) return NaN;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  const iso = str.includes('T') && str.endsWith('Z') ? str : str.replace(' ', 'T') + 'Z';
  return Date.parse(iso);
}

function getSessionRemainingInfo(s, currentNow) {
  if (s.status === 'ended') {
    return { isEnded: true };
  }
  if (s.expires_at) {
    const expMs = parseTimestamp(s.expires_at);
    if (Number.isFinite(expMs) && currentNow >= expMs) {
      return { isEnded: true };
    }
  }
  if (s.started_at) {
    const startMs = parseTimestamp(s.started_at);
    const limitMin = (s.billing_kind === 'trial' || s.plan === 'free') ? 10 : 15;
    if (Number.isFinite(startMs) && currentNow >= startMs + limitMin * 60 * 1000) {
      return { isEnded: true };
    }
  }
  return { isEnded: false };
}

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
  onStartSession,
}) {
  const router = useRouter();
  const goToLaunch = (id) => router.push(`/launch?session=${id}`);

  const [now, setNow] = useState(Date.now());
  const [startingSessionId, setStartingSessionId] = useState(null);
  const [startedSessionIds, setStartedSessionIds] = useState(() => new Set());

  const handleStartOrResume = async (s) => {
    const isEnded = getSessionRemainingInfo(s, now).isEnded;
    if (isEnded) return;

    const isFirstTime =
      (s.status === 'ready' && !s.started_at && (!s.tokens_used || s.tokens_used === 0)) &&
      !startedSessionIds.has(s.id);

    if (isFirstTime) {
      setStartingSessionId(s.id);
      setStartedSessionIds((prev) => new Set(prev).add(s.id));
      try {
        if (onStartSession) {
          await onStartSession(s);
        } else {
          await fetch(`/api/sessions/${s.id}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billing: s.billing_kind }),
          });
        }
      } catch (err) {
        console.error('Failed to start session:', err);
      } finally {
        setStartingSessionId(null);
        goToLaunch(s.id);
      }
    } else {
      goToLaunch(s.id);
    }
  };

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // When a session passes the 15-minute mark, automatically sync with backend to settle it
  useEffect(() => {
    sessions.forEach((s) => {
      if (s.status !== 'ended') {
        const { isEnded } = getSessionRemainingInfo(s, now);
        if (isEnded) {
          fetch(`/api/sessions/${s.id}/end`, { method: 'POST' }).catch(() => { });
        }
      }
    });
  }, [now, sessions]);

  const filteredSessions = sessions.filter((s) => {
    const { isEnded } = getSessionRemainingInfo(s, now);
    if (sessionFilter === 'ended' && !isEnded) return false;
    if (sessionFilter === 'active' && (isEnded || s.status === 'ready')) return false;
    if (sessionFilter === 'ready' && (isEnded || s.status !== 'ready')) return false;
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
        {filteredSessions.map((s) => {
          const { isEnded } = getSessionRemainingInfo(s, now);
          const isFirstTime =
            !isEnded &&
            (s.status === 'ready' && !s.started_at && (!s.tokens_used || s.tokens_used === 0)) &&
            !startedSessionIds.has(s.id);

          return (
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
                  <div className="status" data-status={isEnded ? 'ended' : (isFirstTime ? 'ready' : 'active')}>
                    <span className="status-dot" data-status={isEnded ? 'ended' : (isFirstTime ? 'ready' : 'active')}></span>
                    {isEnded
                      ? 'Ended'
                      : isFirstTime
                        ? 'Ready to start'
                        : 'In progress'}
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

                  {isEnded ? (
                    <button
                      className="btn btn-small btn-quiet"
                      onClick={() => handleOpenReview(s.id)}
                      type="button"
                    >
                      View transcript
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-small btn-quiet"
                        onClick={() => handleOpenReview(s.id)}
                        type="button"
                      >
                        Transcript
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleStartOrResume(s)}
                        disabled={startingSessionId === s.id}
                        type="button"
                      >
                        {startingSessionId === s.id
                          ? 'Starting…'
                          : isFirstTime
                            ? 'Start session'
                            : 'Resume'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredSessions.length === 0 && (
          <div className="dash-empty">No sessions found in this category.</div>
        )}
      </div>
    </main>
  );
}
