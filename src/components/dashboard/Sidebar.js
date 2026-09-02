import React from 'react';
import Link from 'next/link';

export default function Sidebar({ user, activePane, setActivePane, themeMode, toggleTheme, handleLogout, trialsLeft, creditsLeft }) {
  const displayTrials = trialsLeft !== undefined && trialsLeft !== null ? trialsLeft : '—';
  const displayCredits = creditsLeft !== undefined && creditsLeft !== null ? creditsLeft : '—';
  const progressPercent = typeof trialsLeft === 'number' ? Math.min(100, trialsLeft * 20) : 100;

  return (
    <aside className="nav">
      <div className="brand">
        <span className="brand-mark">F</span>
        <span className="brand-name">FeonixAI</span>
      </div>

      <div className="nav-group">
        <h2>Workspace</h2>
        <button
          className={`nav-item ${activePane === 'sessions' ? 'is-current' : ''}`}
          onClick={() => setActivePane('sessions')}
          type="button"
        >
          Call sessions
        </button>
        <button
          className={`nav-item ${activePane === 'resumes' ? 'is-current' : ''}`}
          onClick={() => setActivePane('resumes')}
          type="button"
        >
          CVs &amp; resumes
        </button>
        <button
          className={`nav-item ${activePane === 'documents' ? 'is-current' : ''}`}
          onClick={() => setActivePane('documents')}
          type="button"
        >
          Documents
        </button>
        {user?.role === 'owner' && (
          <button
            className={`nav-item ${activePane === 'admin' ? 'is-current' : ''}`}
            onClick={() => setActivePane('admin')}
            type="button"
          >
            Admin
          </button>
        )}
      </div>

      <div className="nav-group">
        <h2>Career Platform</h2>
        <Link className="nav-item" href="/profile">My Profile</Link>
        <Link className="nav-item" href="/resumes">Resume Library</Link>
        <Link className="nav-item" href="/resume-builder">Resume Builder</Link>
        <Link className="nav-item" href="/job-analyzer">Job Analyzer</Link>
        <Link className="nav-item" href="/job-match">Job Match</Link>
        <Link className="nav-item" href="/cover-letter">Cover Letters</Link>
        <Link className="nav-item" href="/interview-prep">Interview Prep</Link>
        <Link className="nav-item" href="/applications">Applications</Link>
        <Link className="nav-item" href="/pricing">Plans & Pricing</Link>
      </div>

      <div className="nav-foot">
        <div className="quota-card">
          <div className="quota-card-head">
            <span>{displayTrials} free {Number(displayTrials) === 1 ? 'trial' : 'trials'}</span>
            <span className="quota-card-sub">{displayCredits} credits left</span>
          </div>
          <div className="meter">
            <div className="meter-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="quota-card-note">Managed by Admin.</div>
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
