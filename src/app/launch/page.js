"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LaunchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [sessionName, setSessionName] = useState('');
  const [title, setTitle] = useState('Opening FeonixAI');
  const [lede, setLede] = useState('Your desktop app should launch in a moment.');
  const [pulsing, setPulsing] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isMacOS, setIsMacOS] = useState(true);
  // A rapid repeat click on "Open desktop app" while one attempt is already
  // in flight would mint a second one-time handoff token and re-fire the
  // deep link — the token is single-use, so whichever redemption loses the
  // race would fail with "link already used" for no reason the user caused.
  const [launching, setLaunching] = useState(false);
  
  let gaveUp = false;

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    checkAuthAndLaunch();
  }, [sessionId]);

  const checkAuthAndLaunch = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.replace('/');
        return;
      }

      await loadSession();

      const isMac = navigator.userAgent.includes('Mac');
      setIsMacOS(isMac);

      if (isMac) {
        launchDesktop();
      } else {
        showNoDesktopApp();
      }
    } catch {
      router.replace('/');
    }
  };

  const loadSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) return;
      const { session } = await res.json();
      setSessionName(session.company + (session.role ? ' · ' + session.role : ''));
    } catch (err) {
      console.error('Failed to load session details:', err);
    }
  };

  const launchDesktop = async () => {
    if (launching) return;
    setLaunching(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch(`/api/sessions/${sessionId}/handoff`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg({ text: data.message || 'Could not prepare the handoff.', type: 'err' });
        setLaunching(false);
        return;
      }
      const { deep_link: deepLink } = await res.json();

      // Trigger OS deep-link
      window.location.href = deepLink;
      watchForLaunch();
    } catch (err) {
      setMsg({ text: 'Error initiating handoff.', type: 'err' });
      setLaunching(false);
    }
  };

  const watchForLaunch = () => {
    gaveUp = false;
    setTitle('Opening FeonixAI');
    setLede('Your desktop app should launch in a moment.');
    setPulsing(true);
    setShowFallback(false);

    const cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };

    const launched = () => {
      gaveUp = true;
      cleanup();
      setPulsing(false);
      setTitle('Session running in FeonixAI');
      setLede('Returning you to the dashboard…');
      setShowFallback(false);

      setTimeout(() => {
        window.close();
        router.replace('/?view=dash');
      }, 900);
    };

    // A blur/hide right after triggering the deep link is ambiguous: it's
    // exactly what the desktop app taking over focus looks like, but it's
    // ALSO exactly what Windows/Chrome's own "Open FeonixAI?" permission
    // prompt looks like — that dialog steals focus the instant it appears,
    // whether or not the user goes on to actually allow it. Treating that
    // as success used to fire the redirect back to the dashboard 900ms
    // later even when the user hit Cancel and nothing ever opened, which is
    // exactly what looks like "the window closed by itself" from here.
    // Confirming the tab is STILL hidden a beat later filters that out.
    const confirmLaunch = () => {
      if (gaveUp) return;
      setTimeout(() => {
        if (gaveUp) return;
        if (document.hidden) {
          launched();
        } else {
          // Focus came right back — the dialog was dismissed/cancelled, or
          // nothing actually opened. Let the timeout fallback below handle
          // it instead of quietly stranding the user on a moved-on tab.
          cleanup();
        }
      }, 700);
    };

    const handleVisibility = () => { if (document.hidden) confirmLaunch(); };
    const handleBlur = () => confirmLaunch();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);

    // Timeout fallback if it never actually launched — the desktop app
    // isn't installed/registered (or the prompt was cancelled), so start
    // the interview in the browser instead of stranding the user on a dead
    // "did not open" screen.
    setTimeout(() => {
      if (gaveUp) return;
      cleanup();
      gaveUp = true;
      handleStayInBrowser();
    }, 3500);
  };

  const showNoDesktopApp = () => {
    // On Windows: show the interstitial page immediately so they can launch or download
    setPulsing(false);
    setTitle('Open in FeonixAI');
    setLede('Start your session in the desktop app, or download the installer below.');
    setShowFallback(true);
  };

  const handleRetry = () => {
    // Call deep-link handoff for both macOS and Windows
    launchDesktop();
  };

  const handleDownloadMac = () => {
    window.location.href = '/api/download/mac';
  };

  const handleDownloadWin = () => {
    window.location.href = '/api/download/win';
  };

  const handleStayInBrowser = () => {
    router.replace(`/?session=${encodeURIComponent(sessionId || '')}`);
  };

  return (
    <div className="launch">
      <div className="launch-card">
        <div className={`launch-mark ${pulsing ? 'pulse' : ''}`} id="mark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </div>

        <h1 id="title">{title}</h1>
        <p className="lede" id="lede">{lede}</p>
        <div className="session-name" id="sessionName">{sessionName}</div>

        <button className="launch-btn" onClick={handleRetry} disabled={launching} type="button">
          {launching ? 'Opening…' : 'Open desktop app'}
        </button>

        {showFallback && (
          <div className="launch-fallback" id="fallback">
            <h2>Don&apos;t have the desktop app yet?</h2>
            <p>Install it once, then this page opens it automatically every time.</p>
            
            <button className="launch-btn" onClick={handleDownloadWin} type="button">Download for Windows</button>
            <button className="launch-btn" onClick={handleDownloadMac} type="button" style={{ marginBottom: '20px' }}>Download for macOS</button>
            
            <div className="launch-platform-note">
              Or,{' '}
              <button className="launch-link" onClick={handleStayInBrowser} type="button">
                run this session in the browser
              </button>{' '}
              instead.
            </div>
          </div>
        )}

        {msg.text && (
          <div className={`launch-msg ${msg.type === 'err' ? 'launch-msg-err' : 'launch-msg-ok'}`}>
            {msg.text}
          </div>
        )}

        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => router.replace('/?view=dash')}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              padding: '6px 14px',
              color: '#A1A7B3',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#A1A7B3';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading launcher...</div>}>
      <LaunchContent />
    </Suspense>
  );
}
