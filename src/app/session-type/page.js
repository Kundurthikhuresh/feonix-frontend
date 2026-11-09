"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './session-type.css';

// The earlier "Start Interview Session" screen (Full Session / Free Session
// cards): hidden, code kept. The Connect Call Session screen replaces it.
const SHOW_SESSION_TYPE_CARDS = false;

// Audio source choices (the desktop app's own setting).
const AUDIO_SOURCE_OPTIONS = [
  { id: 'both', label: 'System audio + mic' },
  { id: 'mic', label: 'Microphone only' },
  { id: 'tab', label: 'Browser tab audio' },
];

/* A hand-off link works once. The same one can arrive twice (the desktop app's
 * pending hand-off and its hand-off event, or this page starting twice in
 * development), and the second redeem was refused as "already used" and its
 * error replaced the session that had just opened. Each token is redeemed
 * once; a repeat gets the first result. */
const redeemRequests = new Map();
function redeemOnce(token) {
  if (!redeemRequests.has(token)) {
    redeemRequests.set(token, fetch('/api/sessions/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async (res) => ({ ok: res.ok, data: await res.json().catch(() => ({})) }))
      .catch((err) => {
        // Not reached the server: a later try may redeem it.
        redeemRequests.delete(token);
        throw err;
      }));
  }
  return redeemRequests.get(token);
}

function SessionTypeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State mapping to session-type.js
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [redeemed, setRedeemed] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [autoAnswer, setAutoAnswer] = useState(true);
  const [creditsText, setCreditsText] = useState('— Credits');
  const [credits, setCredits] = useState(0);

  const handleBuyCredits = () => {
    if (typeof window !== 'undefined' && window.feonix && typeof window.feonix.openExternal === 'function') {
      window.feonix.openExternal('http://localhost:3000/pricing');
      return;
    }
    window.open('/pricing', '_blank');
  };
  const [balanceTitle, setBalanceTitle] = useState('');
  // Free trials left (null until the balance has loaded).
  const [trialsLeft, setTrialsLeft] = useState(null);
  // The ✕ button asks "Do you want to quit this session?" before closing.
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false, busy: false });
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [audioSource, setAudioSource] = useState('both');
  const [openTip, setOpenTip] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'connect'
  const [selectedPlan, setSelectedPlan] = useState('free'); // 'free' | 'full'
  const [infoModal, setInfoModal] = useState(null); // 'zoom' | 'privacy' | null

  const handleSelectFree = () => {
    setSelectedPlan('free');
    setStep('connect');
  };

  const handleSelectPaid = () => {
    if (credits > 0 || isUnlimited) {
      setSelectedPlan('full');
      setStep('connect');
    } else {
      handleBuyCredits();
    }
  };

  // In the desktop app the window is transparent: only the card shows, with
  // no dark backdrop around it. A normal browser tab keeps the backdrop.
  useEffect(() => {
    if (!window.feonix) return undefined;
    document.documentElement.classList.add('st-desktop');
    return () => document.documentElement.classList.remove('st-desktop');
  }, []);

  // Initialize and load configurations
  useEffect(() => {
    // Auto-answer persistence
    const storedAuto = localStorage.getItem('feonix.autoAnswer');
    const autoOn = storedAuto === null ? true : storedAuto === '1';
    setAutoAnswer(autoOn);

    if (window.feonix && typeof window.feonix.getSettings === 'function') {
      window.feonix.getSettings().then((s) => {
        if (s && typeof s.stealthMode === 'boolean') {
          setIsPrivate(s.stealthMode);
        }
        if (s && AUDIO_SOURCE_OPTIONS.some((o) => o.id === s.audioSource)) {
          setAudioSource(s.audioSource);
        }
      }).catch(() => { });
    }

    // If an overlay was left open from a previous run, close it so it never floats before Start Interview
    if (window.feonix && typeof window.feonix.closeOverlay === 'function') {
      window.feonix.closeOverlay();
    }

    if (window.feonix && typeof window.feonix.resize === 'function') {
      window.feonix.resize(460, 680);
    }

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
      // The desktop app always loads a fresh /session-type?token=… page for a
      // new launch link, and sends the same link as a message just before
      // that page arrives. The message lands on THIS (outgoing) page: using
      // the link here spent it and the sign-in was cut off by the page
      // change, so the new page found it "already used" and stayed signed
      // out. A link for another page is therefore left to that page.
      window.feonix.onHandoff(async (data) => {
        if (data && data.token && data.token !== token) return;
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
          active = await fetchActiveSession();
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
      const { ok, data } = await redeemOnce(handoff.token);

      if (!ok) {
        if (handoff.session) {
          setSessionId(Number(handoff.session));
          const loaded = await loadSession(Number(handoff.session));
          if (loaded) {
            setRedeemed(true);
            showBalance();
            say('');
            setButtonsDisabled(false);
            return true;
          }
        }

        const me = await fetch('/api/auth/me');
        if (me.ok) {
          const meData = await me.json();
          showBalance(meData.user);
          const active = await fetchActiveSession();
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
      // The sign-in reply already carries the session, so Connect is usable
      // straight away; the balance fills in behind it.
      if (data.session) setSession(data.session);
      if (data.account) applyAccount(data.account);
      setButtonsDisabled(false);
      showBalance(data.user);
      if (sId && !data.session) loadSession(sId);
      return true;
    } catch (err) {
      console.error('Redemption error:', err);
      say('Connection error. Retrying…', true);
      setButtonsDisabled(false);
      return false;
    }
  };

  const showBalance = async (user, attempt = 1) => {
    try {
      const res = await fetch('/api/sessions/account');
      if (res.ok) {
        const data = await res.json();
        applyAccount(data.account || {});
        return;
      }
    } catch { }
    // Not loaded (slow or dropped connection): try again shortly.
    if (attempt < 4) {
      setTimeout(() => showBalance(user, attempt + 1), 1500 * attempt);
    }
  };

  // Shows the balance: free trials (the Free session badge) and the pill.
  const applyAccount = (acc) => {
    const trialsRemaining = Math.max(0, Math.floor(Number(acc.trials_remaining) || 0));
    setTrialsLeft(trialsRemaining);
    if (acc.unlimited) {
      setIsUnlimited(true);
      setCreditsText(trialsRemaining > 0
        ? `Unlimited · ${trialsRemaining} ${trialsRemaining === 1 ? 'Trial' : 'Trials'}`
        : 'Unlimited');
      setBalanceTitle(`Unlimited plan · Free trials left: ${trialsRemaining}`);
      return;
    }
    setIsUnlimited(false);
    // Free trials and bought credits are different things, so each is
    // shown under its own name.
    const credits = Math.max(0, Number(acc.credits) || 0);
    setCredits(credits);
    const trials = Math.max(0, Math.floor(Number(acc.trials_remaining) || 0));
    const creditsLabel = `${Number.isInteger(credits) ? credits : credits.toFixed(1)} ${credits === 1 ? 'Credit' : 'Credits'}`;
    // Both always shown, e.g. "0 Credits · 4 Free Trials".
    setCreditsText(`${creditsLabel} · ${trials} Free ${trials === 1 ? 'Trial' : 'Trials'}`);
    const used = Math.max(0, Math.floor(Number(acc.trials_used) || 0));
    setBalanceTitle(`Credits: ${creditsLabel.split(' ')[0]} · Free trials left: ${trials} · Free trials used: ${used}`);
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

  // Only sessions the user created on the dashboard are used: none is ever
  // created here.
  const fetchActiveSession = async () => {
    try {
      const listRes = await fetch('/api/sessions');
      if (!listRes.ok) return null;
      const list = await listRes.json();
      const sessions = list.sessions || [];
      return sessions.find((s) => s.status === 'active')
        || sessions.find((s) => s.status === 'ready')
        || null;
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
        const activeSession = await fetchActiveSession();
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
          } catch { }
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
        // In a standard browser (e.g. Chrome): ONLY launch when user clicks "Start Interview"
        say('Launching live copilot overlay…', false, true);
        window.location.href = `/overlay?session=${encodeURIComponent(activeId)}&plan=${encodeURIComponent(plan || 'full')}&auto=${autoAnswer ? '1' : '0'}&start=open`;
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      setButtonsDisabled(false);
      say('Could not start the session. Try again.', true);
    }
  };

  const togglePrivate = () => {
    const nextPrivate = !isPrivate;
    setIsPrivate(nextPrivate);
    if (window.feonix && typeof window.feonix.setStealthMode === 'function') {
      window.feonix.setStealthMode(nextPrivate);
    }
    triggerToast(nextPrivate ? '✓ Private Mode Enabled' : '✓ Private Mode Disabled');
  };

  // Connect: starts the session the way it was set up on the dashboard
  // (free trial, credits or unlimited).
  const sessionPlan = (session && (session.billing_kind === 'trial' || session.plan === 'free')) ? 'free' : 'full';
  const planLine = isUnlimited && sessionPlan === 'full'
    ? 'Unlimited plan'
    : sessionPlan === 'free'
      ? 'Free trial · 10 minutes'
      : 'Uses credits · 1 credit = 1 hour';

  const changeAudioSource = (value) => {
    setAudioSource(value);
    if (window.feonix && typeof window.feonix.setSetting === 'function') {
      Promise.resolve(window.feonix.setSetting('audioSource', value)).catch(() => {});
    }
  };

  const openExternal = (url) => {
    try { window.open(url, '_blank', 'noopener'); } catch { /* not opened */ }
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

  useEffect(() => {
    if (!confirmQuit) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setConfirmQuit(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmQuit]);

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
            <div className="brand-badge">
              <div className="brand-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#10b981" />
                  <path d="M2 17L12 22L22 17" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="brand-name">Feonix <span className="brand-pill">AI</span></span>
            </div>

            <div className="tool-actions">
              <button
                className="buy-credits-btn"
                onClick={handleBuyCredits}
                title="Purchase credits or upgrade plan"
                type="button"
              >
                <span className="coin-icon">🪙</span>
                <span>Buy credits</span>
              </button>

              <button
                className="tool-ctrl-btn"
                onClick={handleMinimizeWindow}
                title="Resize"
                type="button"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="10" y1="14" x2="3" y2="21" />
                </svg>
              </button>

              <button
                className="tool-ctrl-btn"
                title="Drag window"
                type="button"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 9 2 12 5 15" />
                  <polyline points="9 5 12 2 15 5" />
                  <polyline points="15 19 12 22 9 19" />
                  <polyline points="19 9 22 12 19 15" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                </svg>
              </button>

              <button
                className="tool-ctrl-btn"
                onClick={() => setSettingsOpen((prev) => !prev)}
                title="Settings"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              <button
                className="red-close-btn"
                onClick={() => setConfirmQuit(true)}
                title="Close"
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          {confirmQuit && (
            <div
              onClick={() => setConfirmQuit(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '16px', background: 'rgba(0, 0, 0, 0.45)',
                WebkitAppRegion: 'no-drag',
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quit-session-title"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%', maxWidth: '320px', padding: '22px', borderRadius: '14px',
                  background: '#ffffff', color: '#1f1f1f', border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)', textAlign: 'center',
                }}
              >
                <h3 id="quit-session-title" style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700 }}>
                  Quit session
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b' }}>
                  Do you want to quit this session?
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setConfirmQuit(false)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                      fontWeight: 500, background: '#f1f5f9', color: '#1f1f1f',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmQuit(false); handleCloseWindow(); }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                      fontWeight: 600, background: '#b93838', color: '#fff', border: 'none',
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Modal for How / Watch */}
          {infoModal && (
            <div
              onClick={() => setInfoModal(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '16px', background: 'rgba(0, 0, 0, 0.45)',
                WebkitAppRegion: 'no-drag',
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%', maxWidth: '340px', padding: '22px', borderRadius: '14px',
                  background: '#ffffff', color: '#1f1f1f', border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)', textAlign: 'left',
                }}
              >
                {infoModal === 'zoom' ? (
                  <>
                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                      Zoom Stealth Capture
                    </h3>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      To keep Feonix teleprompter 100% invisible when sharing your screen in Zoom:
                    </p>
                    <ol style={{ margin: '0 0 18px', paddingLeft: '20px', fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>
                      <li>Open Zoom <strong>Settings → Share Screen</strong>.</li>
                      <li>Click <strong>Advanced</strong> at the bottom.</li>
                      <li>Enable <strong>&ldquo;Use advanced capture with window filtering&rdquo;</strong>.</li>
                    </ol>
                  </>
                ) : (
                  <>
                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                      Privacy &amp; Window Protection
                    </h3>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      Feonix utilizes OS-level display affinity (<code>WDA_EXCLUDEFROMCAPTURE</code> on Windows and native window filtering on macOS).
                    </p>
                    <p style={{ margin: '0 0 18px', fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                      Test by sharing your screen on a quick test call or local screen recorder before your real technical interview.
                    </p>
                  </>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={() => setInfoModal(null)}
                  style={{
                    width: '100%', padding: '9px 0', borderRadius: '8px', cursor: 'pointer', fontSize: '13.5px',
                    fontWeight: 600, background: '#111827', color: '#ffffff', border: 'none',
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="body">
            {step === 'select' ? (
              <>
                <h1 className="session-view-title">Start your session</h1>

                <div className="session-cards-container">
                  {/* Card 1: Free session */}
                  <div className="session-choice-card">
                    <div className="card-center-icon">🎁</div>
                    <h2 className="card-main-title">Free session</h2>
                    <div className="card-duration-line">10 min · Free</div>
                    {/* Free trials left, as a badge under the title (shown once the
                        real number has loaded). */}
                    {trialsLeft === null ? (
                      <span className="card-trials-pill is-loading">Checking free trials…</span>
                    ) : (
                      <span className={`card-trials-pill ${trialsLeft > 0 ? '' : 'is-empty'}`}>
                        {trialsLeft > 0
                          ? `${trialsLeft} free ${trialsLeft === 1 ? 'trial' : 'trials'} left`
                          : 'No free trials left'}
                      </span>
                    )}
                    <button
                      className="btn-start-free"
                      onClick={handleSelectFree}
                      disabled={buttonsDisabled}
                      type="button"
                    >
                      Start free
                    </button>
                  </div>

                  {/* Card 2: Paid session */}
                  <div className="session-choice-card">
                    <div className="card-center-icon">🪙</div>
                    <h2 className="card-main-title">Paid session</h2>
                    <div className="card-duration-line">
                      {isUnlimited ? 'Unlimited · No credits needed' : '30 min · 0.5 credit'}
                    </div>
                    <p className="card-notice-text">
                      Auto-extends by 30 minutes when the timer reaches 0. End within 5 minutes of starting or extending and that credit comes back.
                    </p>
                    <button
                      className="btn-start-paid"
                      onClick={handleSelectPaid}
                      disabled={buttonsDisabled}
                      type="button"
                    >
                      {(credits > 0 || isUnlimited) ? 'Start paid' : 'Buy Credits'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="connect-step-view">
                <h1 className="connect-view-title">Connect Call Session</h1>
                <p className="connect-view-sub">
                  Your session is ready. Connect to start transcribing.
                </p>

                <div className="audio-source-row">
                  <span className="audio-source-label">Audio source</span>
                  <div className="audio-select-wrapper">
                    <select
                      className="audio-source-select"
                      value={audioSource}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAudioSource(val);
                        if (window.feonix && typeof window.feonix.setAudioSource === 'function') {
                          window.feonix.setAudioSource(val);
                        }
                      }}
                    >
                      <option value="both">System audio</option>
                      <option value="mic">Microphone only</option>
                      <option value="tab">Browser tab audio</option>
                    </select>
                    <svg className="audio-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* White Info Card with 3 Tip Rows */}
                <div className="connect-tips-card">
                  {/* Row 1 */}
                  <div className="connect-tip-row">
                    <div className="connect-tip-left">
                      <span className="connect-tip-icon tip-warn">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </span>
                      <span className="connect-tip-text">
                        On Zoom, update it and turn on advanced capture with window filtering.
                      </span>
                    </div>
                    <button
                      className="connect-tip-link"
                      type="button"
                      onClick={() => setInfoModal('zoom')}
                    >
                      How
                    </button>
                  </div>

                  {/* Row 2 */}
                  <div className="connect-tip-row">
                    <div className="connect-tip-left">
                      <span className="connect-tip-icon tip-shield">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 12 11 14 15 10" />
                        </svg>
                      </span>
                      <span className="connect-tip-text">
                        Update your OS and call app, and test privacy before a real call.
                      </span>
                    </div>
                    <button
                      className="connect-tip-link"
                      type="button"
                      onClick={() => setInfoModal('privacy')}
                    >
                      Watch
                    </button>
                  </div>

                  {/* Row 3 */}
                  <div className="connect-tip-row">
                    <div className="connect-tip-left">
                      <span className="connect-tip-icon tip-play">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </span>
                      <span className="connect-tip-text">
                        No call to test on? Share a mock video on YouTube.
                      </span>
                    </div>
                    <button
                      className="connect-tip-link"
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.feonix && typeof window.feonix.openExternal === 'function') {
                          window.feonix.openExternal('https://www.youtube.com/results?search_query=technical+mock+interview');
                        } else {
                          window.open('https://www.youtube.com/results?search_query=technical+mock+interview', '_blank');
                        }
                      }}
                    >
                      Open
                    </button>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="connect-action-bar">
                  <button
                    className="btn-connect-back"
                    type="button"
                    onClick={() => setStep('select')}
                    disabled={buttonsDisabled}
                  >
                    Back
                  </button>

                  <button
                    className="btn-connect-go"
                    type="button"
                    onClick={() => handleStart(selectedPlan)}
                    disabled={buttonsDisabled}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                      <polyline points="16 9 12 5 8 9" />
                      <line x1="12" y1="5" x2="12" y2="17" />
                    </svg>
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            )}

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
            <div className="setting-item">
              <span className="setting-label">Privacy Shield</span>
              <button className={`priv-toggle ${isPrivate ? 'is-on' : 'is-off'}`} onClick={togglePrivate} type="button">
                {isPrivate ? 'PRIV ON' : 'PRIV OFF'}
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="toast-popup">
              {toastMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SessionTypePage() {
  return (
    <Suspense fallback={<div className="session-picker-container" style={{ background: 'transparent', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <SessionTypeContent />
    </Suspense>
  );
}
