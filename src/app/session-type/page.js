"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './session-type.css';

function SessionTypeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State mapping to session-type.js
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [redeemed, setRedeemed] = useState(false);
  const [autoAnswer, setAutoAnswer] = useState(true);
  const [creditsText, setCreditsText] = useState('— Credits');
  const [message, setMessage] = useState({ text: '', isError: false, busy: false });
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  // Initialize and load configurations
  useEffect(() => {
    // Auto-answer persistence
    const storedAuto = localStorage.getItem('feonix.autoAnswer');
    const autoOn = storedAuto === null ? true : storedAuto === '1';
    setAutoAnswer(autoOn);

    // Initial boot sequence
    bootSequence(autoOn);
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 2200);
    return () => clearTimeout(t);
  };

  const say = (text, isError = false, busy = false) => {
    setMessage({ text, isError, busy });
  };

  const bootSequence = async (currAuto) => {
    setButtonsDisabled(true);

    const token = searchParams.get('token');
    const urlSession = searchParams.get('session');

    if (window.feonix) {
      window.feonix.onHandoff(async (data) => {
        await handleRedeem(data, currAuto);
      });
      const pending = await window.feonix.pendingHandoff();
      if (pending) {
        await handleRedeem(pending, currAuto);
        return;
      }
    }

    // Direct Browser handoff or validation flow
    if (token) {
      await handleRedeem({ token, session: urlSession }, currAuto);
    } else {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          say('Sign in on the dashboard first.', true);
          setButtonsDisabled(true);
          return;
        }
        const meData = await meRes.json();
        showBalance(meData.user);

        let active = null;
        if (urlSession) {
          active = await loadSession(urlSession);
        }
        if (!active) {
          active = await fetchActiveOrCreateSession();
        }

        if (!active) {
          say('Create a session on the dashboard first.', true);
          setButtonsDisabled(true);
          return;
        }
        setSessionId(active.id);
        setRedeemed(true);
        say('');
        setButtonsDisabled(false);
      } catch (err) {
        console.error('Boot error:', err);
        say('Could not connect to the server.', true);
      }
    }
  };

  const handleRedeem = async (handoff, currAuto) => {
    if (redeemed) return true;
    say('Connecting…', false, true);

    try {
      const res = await fetch('/api/sessions/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: handoff.token }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (handoff.session) {
          setSessionId(Number(handoff.session));
          const loaded = await loadSession(Number(handoff.session));
          if (loaded) {
            setRedeemed(true);
            say('');
            setButtonsDisabled(false);
            return true;
          }
        }

        const me = await fetch('/api/auth/me');
        if (me.ok) {
          const meData = await me.json();
          showBalance(meData.user);
          const active = await fetchActiveOrCreateSession();
          if (active) {
            setSessionId(active.id);
            setRedeemed(true);
            await loadSession(active.id);
            say('');
            setButtonsDisabled(false);
            return true;
          }
        }

        say(data.message || 'That launch link was not valid.', true);
        setButtonsDisabled(true);
        return false;
      }

      setRedeemed(true);
      const sId = data.session_id || Number(handoff.session) || null;
      setSessionId(sId);
      say('');
      showBalance(data.user);
      if (sId) await loadSession(sId);
      setButtonsDisabled(false);
      return true;
    } catch (err) {
      console.error('Redemption error:', err);
      say('Connection error. Retrying…', true);
      setButtonsDisabled(false);
      return false;
    }
  };

  const showBalance = async (user) => {
    try {
      const res = await fetch('/api/sessions/account');
      if (res.ok) {
        const data = await res.json();
        const acc = data.account || {};
        const creds = acc.credits !== undefined ? acc.credits : 5;
        setCreditsText(`${creds} ${creds === 1 ? 'Credit' : 'Credits'}`);
        return;
      }
    } catch { }
    setCreditsText('5 Credits');
  };

  const loadSession = async (id) => {
    if (!id) return null;
    try {
      const res = await fetch('/api/sessions/' + id);
      if (!res.ok) return null;
      const { session } = await res.json();
      setSession(session);
      return session;
    } catch {
      return null;
    }
  };

  const fetchActiveOrCreateSession = async () => {
    try {
      const listRes = await fetch('/api/sessions');
      if (!listRes.ok) return null;
      const list = await listRes.json();
      const sessions = list.sessions || [];
      const active = sessions.find((s) => s.status === 'active')
        || sessions.find((s) => s.status === 'ready')
        || sessions[0];
      if (active) return active;

      const madeRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: 'Interview Session', role: '', mode: 'interview' }),
      });
      if (!madeRes.ok) return null;
      const madeData = await madeRes.json().catch(() => ({}));
      return madeData.session || null;
    } catch {
      return null;
    }
  };

  const handleStart = async (plan) => {
    setButtonsDisabled(true);
    say('Starting session…', false, true);

    try {
      let activeId = sessionId;
      if (!activeId) {
        const activeSession = await fetchActiveOrCreateSession();
        if (activeSession) {
          activeId = activeSession.id;
          setSessionId(activeId);
          await loadSession(activeId);
        }
      }

      if (!activeId) {
        say('No session found. Create one on dashboard.', true);
        setButtonsDisabled(false);
        return;
      }

      // Activate/start the session via backend so expires_at is set fresh from NOW
      const billing = plan === 'free' ? 'trial' : 'paid';
      let startRes = await fetch(`/api/sessions/${activeId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing, plan }),
      });
      let startData = await startRes.json().catch(() => ({}));
      if (!startRes.ok) {
        // Auto-recover: if session expired or missing, auto-create a new active session
        if (startRes.status === 410 || startRes.status === 404 || startData.error === 'session_expired') {
          try {
            const newRes = await fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ company: 'General Interview', role: 'Candidate' }),
            });
            if (newRes.ok) {
              const newSessionData = await newRes.json();
              activeId = newSessionData.session?.id || newSessionData.id;
              setSessionId(activeId);
              startRes = await fetch(`/api/sessions/${activeId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billing, plan }),
              });
              startData = await startRes.json().catch(() => ({}));
            }
          } catch {}
        }

        if (!startRes.ok) {
          say(startData.message || 'Could not start session. Please check your credits.', true);
          setButtonsDisabled(false);
          return;
        }
      }

      if (window.feonix && typeof window.feonix.startSession === 'function') {
        await window.feonix.startSession({ plan, sessionId: activeId, auto: autoAnswer });
        if (typeof window.feonix.hideMainWindow === 'function') {
          window.feonix.hideMainWindow();
        }
      } else {
        // In a standard browser (e.g. Chrome): launch the live copilot overlay (second image)
        say('Launching live copilot overlay…', false, true);
        // start=open is load-bearing, not decorative: overlay/page.js only
        // trusts localStorage's remembered visibility when this param is
        // absent (so a genuinely reopened/reloaded overlay can stay hidden
        // across a reload if the user left it that way). Omitting it here
        // meant a fresh "Start Interview" click inherited whatever hidden/
        // minimized state a previous overlay session had left behind —
        // usually rendering nothing at all, a blank page with no error.
        window.location.href = `/overlay?session=${encodeURIComponent(activeId)}&plan=${encodeURIComponent(plan || 'full')}&auto=${autoAnswer ? '1' : '0'}&start=open`;
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      setButtonsDisabled(false);
      say('Could not start the session. Try again.', true);
    }
  };

  const handleToggleAutoAnswer = () => {
    const nextAuto = !autoAnswer;
    setAutoAnswer(nextAuto);
    localStorage.setItem('feonix.autoAnswer', nextAuto ? '1' : '0');
  };

  const handleCloseWindow = () => {
    if (window.feonix && typeof window.feonix.back === 'function') {
      window.feonix.back();
    } else {
      window.location.href = '/?view=dash';
    }
  };

  const handleMinimizeWindow = () => {
    if (window.feonix && typeof window.feonix.minimize === 'function') {
      window.feonix.minimize();
    }
  };

  const handleGoBack = () => {
    if (window.feonix && typeof window.feonix.back === 'function') {
      window.feonix.back();
    } else {
      window.location.href = '/?view=dash';
    }
  };

  return (
    <div className="session-picker-container">
      <div className="shell">
        <div className="window">
          {/* Top Toolbar */}
          <div className="toolbar">
            <div className="traffic-lights">
              <button className="traffic-btn traffic-close" onClick={handleCloseWindow} title="Close" type="button"></button>
              <button className="traffic-btn traffic-min" onClick={handleMinimizeWindow} title="Minimize" type="button"></button>
              <button className="traffic-btn traffic-max" title="Maximize" type="button"></button>
            </div>

            <div className="brand-badge">
              <div className="brand-logo">⚡</div>
              <span>FeonixAI</span>
            </div>

            <div className="credits-pill">
              <span className="credits-dot"></span>
              <span>{creditsText}</span>
            </div>

            <div className="tool-actions">
              <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings" type="button">⚙</button>
            </div>
          </div>

          {/* Body Content */}
          <div className="body">
            <div className="header">
              <h1>Start Interview Session</h1>
              <p>Choose your session type to launch the live copilot overlay.</p>
              {session && (
                <div className="session-title">
                  {session.company} {session.role && `· ${session.role}`}
                </div>
              )}
            </div>

            <div className="cards-stack">
              {/* Option 1: Start Interview */}
              <div className="option-card">
                <div className="card-top">
                  <h3>Start Interview Session</h3>
                  <span className="tag green">1 credit</span>
                </div>
                <p className="card-desc">
                  Live stealth copilot with real-time question capture, STAR answer generation, and code problem solver.
                </p>
                <button className="btn-primary" onClick={() => handleStart('full')} disabled={buttonsDisabled} type="button">
                  ▶ Start Interview
                </button>
              </div>

              {/* Option 2: Free Session */}
              <div className="option-card">
                <div className="card-top">
                  <h3>Free Session</h3>
                  <span className="tag">Free</span>
                </div>
                <p className="card-desc">
                  Trial session. Great for testing your setup before a real interview.
                </p>
                <button className="btn-secondary" onClick={() => handleStart('free')} disabled={buttonsDisabled} type="button">
                  Start Free Session
                </button>
              </div>
            </div>

            <div className="footer-back">
              <button
                className="btn-secondary"
                onClick={handleGoBack}
                type="button"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back to Dashboard</span>
              </button>
            </div>

            <div className={`msg-banner ${message.isError ? 'err' : ''}`}>
              {message.busy && <span className="spinner"></span>}
              {message.text}
            </div>
          </div>

          {/* Sliding Drawer Panel */}
          <div className={`settings-panel ${settingsOpen ? 'open' : ''}`}>
            <div className="settings-head">
              <h2>Settings</h2>
              <button className="icon-btn" onClick={() => setSettingsOpen(false)} type="button">✕</button>
            </div>
            <div className="setting-item">
              <span className="setting-label">Automatic Answering</span>
              <button className={`priv-toggle ${autoAnswer ? 'is-on' : 'is-off'}`} onClick={handleToggleAutoAnswer} type="button">
                {autoAnswer ? 'Auto: ON' : 'Auto: OFF'}
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          <div className={`toast ${showToast ? 'show' : ''}`}>
            {toastMsg}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionTypePage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading session options...</div>}>
      <SessionTypeContent />
    </Suspense>
  );
}
