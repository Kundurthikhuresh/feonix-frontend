import React from 'react';

export default function Sidebar({ user, activePane, setActivePane, themeMode, toggleTheme, handleLogout, trialsLeft, creditsLeft, onGoLanding }) {
  const numTrials = typeof trialsLeft === 'number' ? trialsLeft : (Number.isFinite(Number(trialsLeft)) ? Number(trialsLeft) : null);
  const displayTrials = numTrials !== null ? `${numTrials}` : '—';
  const displayCredits = creditsLeft !== undefined && creditsLeft !== null ? creditsLeft : '—';
  const progressPercent = numTrials !== null ? Math.min(100, Math.max(0, numTrials * 20)) : 100;

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

      {/* Career Platform & Account navigation sections hidden as requested */}

      <div className="nav-foot">
        <div className="quota-card">
          <div className="quota-card-head">
            <span>{displayTrials} {numTrials === 1 ? 'free trial' : 'free trials'}</span>
            <span className="quota-card-sub">{displayCredits} credits left</span>
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
          <button className="btn-link" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
