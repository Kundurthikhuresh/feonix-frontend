"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LaunchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [sessionName, setSessionName] = useState('');
  const [title, setTitle] = useState('Open FeonixAI Desktop');
  const [lede, setLede] = useState('Click "Open desktop app" to launch your interview session:');
  const [pulsing, setPulsing] = useState(false);
  const [showFallback, setShowFallback] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isMacOS, setIsMacOS] = useState(false);
  const [launching, setLaunching] = useState(false);

  const handleOpenDesktopApp = async () => {
    if (!sessionId) {
      router.replace('/');
      return;
    }
    setMsg({ text: '', type: '' });
    setLaunching(true);
    setPulsing(true);

    let deepLink = null;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/handoff`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        deepLink = data?.deep_link || data?.deepLink || (data?.token ? `feonixai://launch?token=${data.token}&session=${sessionId}` : null);
      }
    } catch (err) {
      console.warn('Launch handoff note:', err);
    }

    if (deepLink) {
      // Opened as a normal navigation: Safari ignores an app link (feonixai://)
      // in a hidden iframe, so on macOS the desktop app never opened. The page
      // stays where it is; the browser hands the link to the app.
      try {
        window.location.href = deepLink;
      } catch { }
      // The desktop app opens its own Start Interview window, so this tab
      // stays here: opening the same screen in the browser too showed two
      // Start Interview windows at once.
      setLaunching(false);
      setPulsing(false);
      setTitle('Continue in FeonixAI Desktop');
      setLede('Your session is opening in the desktop app. If nothing opened, download the app below or run the session in this browser.');
      return;
    }

    // No desktop hand-off could be made: run the session in this browser.
    window.location.href = `/session-type?session=${encodeURIComponent(sessionId)}`;
  };

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    // If already inside the desktop app, go directly to Start Interview without delay
    if (typeof window !== 'undefined' && window.feonix) {
      window.location.href = `/session-type?session=${encodeURIComponent(sessionId)}`;
      return;
    }

    checkAuthAndLoad();
  }, [sessionId]);

  const checkAuthAndLoad = async () => {
    try {
      let res = await fetch('/api/auth/me');
      for (let attempt = 1; attempt < 3 && !res.ok; attempt++) {
        const body = await res.json().catch(() => ({}));
        if (res.status !== 503 || body.error !== 'server_unavailable') break;
        await new Promise((resolve) => setTimeout(resolve, 500));
        res = await fetch('/api/auth/me');
      }
      if (!res.ok) {
        router.replace('/');
        return;
      }

      await loadSession();

      const isMac = typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh|Mac OS X/.test(navigator.userAgent));
      setIsMacOS(isMac);
    } catch {
      router.replace('/');
    }
  };

  const loadSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) return;
      const { session } = await res.json();
      if (session) {
        setSessionName(session.company + (session.role ? ' · ' + session.role : ''));
      }
    } catch (err) {
      console.error('Failed to load session details:', err);
    }
  };

  const handleDownloadMac = () => {
    window.location.href = '/api/download/mac';
  };

  const handleDownloadWin = () => {
    window.location.href = '/api/download/win';
  };

  const handleStayInBrowser = () => {
    if (!sessionId) {
      router.replace('/');
      return;
    }
    window.location.href = `/session-type?session=${encodeURIComponent(sessionId)}`;
  };

  const handleBackToDashboard = () => {
    if (typeof window !== 'undefined' && window.feonix && typeof window.feonix.goToDashboard === 'function') {
      window.feonix.goToDashboard();
      return;
    }
    if (typeof window !== 'undefined' && window.feonix && typeof window.feonix.back === 'function') {
      window.feonix.back();
      return;
    }
    window.location.href = '/?view=dash';
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

        <button className="launch-btn" onClick={handleOpenDesktopApp} disabled={launching} type="button">
          {launching ? 'Opening…' : 'Open desktop app'}
        </button>

        {msg.text && msg.type === 'err' && (
          <div 
            className="launch-msg launch-msg-err"
            style={{ marginBottom: '24px', textAlign: 'center', fontWeight: '500' }}
          >
            {msg.text}
          </div>
        )}

        {showFallback && (
          <div className="launch-fallback" id="fallback">
            <button
              className="launch-btn"
              onClick={handleDownloadWin}
              type="button"
            >
              Download for Windows
            </button>
            <button
              className="launch-btn"
              onClick={handleDownloadMac}
              type="button"
              style={{ marginBottom: '20px' }}
            >
              Download for macOS
            </button>

            <div className="launch-platform-note">
              Or,{' '}
              <button className="launch-link" onClick={handleStayInBrowser} type="button">
                run this session in the browser
              </button>{' '}
              instead.
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleBackToDashboard}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              // Theme colours (--paper is the page's text colour), so it reads
              // on the light page as well as the dark one; it was white-on-white.
              background: 'color-mix(in srgb, var(--paper) 5%, transparent)',
              border: '1px solid color-mix(in srgb, var(--paper) 28%, transparent)',
              borderRadius: '999px',
              padding: '6px 14px',
              color: 'color-mix(in srgb, var(--paper) 80%, transparent)',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--paper)';
              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--paper) 50%, transparent)';
              e.currentTarget.style.background = 'color-mix(in srgb, var(--paper) 10%, transparent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'color-mix(in srgb, var(--paper) 80%, transparent)';
              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--paper) 28%, transparent)';
              e.currentTarget.style.background = 'color-mix(in srgb, var(--paper) 5%, transparent)';
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
