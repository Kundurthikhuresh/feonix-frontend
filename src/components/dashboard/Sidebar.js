import React, { useState, useEffect } from 'react';

export default function Sidebar({ user, activePane, setActivePane, themeMode, toggleTheme, handleLogout, trialsLeft, creditsLeft, onGoLanding, unlimitedPlan }) {
  const numTrials = typeof trialsLeft === 'number' ? trialsLeft : (Number.isFinite(Number(trialsLeft)) ? Number(trialsLeft) : null);
  const displayTrials = numTrials !== null ? `${numTrials}` : '—';
  const displayCredits = creditsLeft !== undefined && creditsLeft !== null ? creditsLeft : '—';
  const progressPercent = numTrials !== null ? Math.min(100, Math.max(0, numTrials * 20)) : 100;

  // "Log out" first asks "Do you want to log out?" — Yes signs out, No (or
  // Esc, or a click outside the box) keeps the user on the dashboard.
  const [confirmLogout, setConfirmLogout] = useState(false);
  useEffect(() => {
    if (!confirmLogout) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setConfirmLogout(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmLogout]);

  return (
    <aside className="nav">
      <div className="brand" onClick={onGoLanding} style={{ cursor: 'pointer' }} title="Back to Landing Page">
        <span className="brand-mark">F</span>
        <span className="brand-name">FeonixAI</span>
      </div>

      <div className="nav-group">
        <h2>Workspace</h2>
        <button
          className={`nav-item ${activePane === 'sessions' ? 'is-current' : ''}`}
          onClick={() => {
            setActivePane('sessions');
            if (typeof window !== 'undefined') {
              window.history.pushState({ pane: 'sessions' }, '', '/dashboard');
            }
          }}
          type="button"
        >
          Call sessions
        </button>
        <button
          className={`nav-item ${activePane === 'resumes' ? 'is-current' : ''}`}
          onClick={() => {
            setActivePane('resumes');
            if (typeof window !== 'undefined') {
              window.history.pushState({ pane: 'resumes' }, '', '/dashboard/resumes');
            }
          }}
          type="button"
        >
          CVs &amp; resumes
        </button>
        <button
          className={`nav-item ${activePane === 'documents' ? 'is-current' : ''}`}
          onClick={() => {
            setActivePane('documents');
            if (typeof window !== 'undefined') {
              window.history.pushState({ pane: 'documents' }, '', '/dashboard/documents');
            }
          }}
          type="button"
        >
          Documents
        </button>
        {(user?.is_admin || user?.role === 'owner') && (
          <button
            className={`nav-item ${activePane === 'admin' ? 'is-current' : ''}`}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/admin/dashboard';
              }
            }}
            type="button"
          >
            Admin Panel
          </button>
        )}
      </div>

      <div className="nav-group">
        <h2>Prepare</h2>
        <button
          className={`nav-item ${activePane === 'mock' ? 'is-current' : ''}`}
          onClick={() => {
            setActivePane('mock');
            if (typeof window !== 'undefined') {
              window.history.pushState({ pane: 'mock' }, '', '/dashboard/mock');
            }
          }}
          type="button"
        >
          Mock interview
        </button>
      </div>

      {/* Career Platform & Account navigation sections hidden as requested */}

      <div className="nav-foot">
        <div className="quota-card">
          <div className="quota-card-head">
            <span>{displayTrials} {numTrials === 1 ? 'free trial' : 'free trials'}</span>
            <span className="quota-card-sub">
              {unlimitedPlan
                ? (Number(creditsLeft) > 0 ? `${unlimitedPlan} + ${displayCredits} credits` : unlimitedPlan)
                : `${displayCredits} credits left`}
            </span>
          </div>
          <div className="meter">
            <div className="meter-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          {numTrials === 0 ? (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>All 5 free trials used</span>
              <a href="/pricing" style={{ color: '#c084fc', textDecoration: 'underline', fontWeight: 600 }}>Buy Credits</a>
            </div>
          ) : (
            <div style={{ marginTop: '6px', textAlign: 'right' }}>
              <a href="/pricing" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>+ Buy Credits</a>
            </div>
          )}
        </div>
        <div className="nav-user">
          <span className="nav-avatar">{(user?.email?.[0] || '?').toUpperCase()}</span>
          <span className="nav-user-text">
            <strong>{user?.email}</strong>
            <span>{user?.role === 'owner' ? 'Owner' : 'Member'}</span>
          </span>
        </div>
        <div className="nav-foot-row">
          <button className="btn-link" onClick={toggleTheme} type="button">
            {themeMode === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button className="btn-link" onClick={() => setConfirmLogout(true)} type="button">
            Log out
          </button>
        </div>
      </div>

      {confirmLogout && (
        <div
          onClick={() => setConfirmLogout(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '16px', background: 'rgba(0, 0, 0, 0.55)',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '340px', padding: '24px', borderRadius: '14px',
              background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--line)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)', textAlign: 'center',
            }}
          >
            <h3 id="logout-confirm-title" style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
              Log out
            </h3>
            <p style={{ margin: '0 0 22px', fontSize: '14px', opacity: 0.8 }}>
              Do you want to log out?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmLogout(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                  fontWeight: 600, background: 'transparent', color: 'var(--paper)', border: '1px solid var(--line)',
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => { setConfirmLogout(false); handleLogout(); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                  fontWeight: 600, background: 'var(--alert)', color: '#fff', border: '1px solid var(--alert)',
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
