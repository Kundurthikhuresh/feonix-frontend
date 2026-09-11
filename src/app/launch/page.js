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
    try {
      const res = await fetch(`/api/sessions/${sessionId}/handoff`, { method: 'POST' });
      if (res.ok) {
        const { deep_link: deepLink } = await res.json();
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = deepLink;
          document.body.appendChild(iframe);
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch { }
          }, 1000);
        } catch { }
      }
    } catch {
      // Continue to session-type even if handoff network had an issue
    }

    // When clicking "Open desktop app", redirect to Start Interview screen
    window.location.href = `/session-type?session=${encodeURIComponent(sessionId)}`;
  };

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
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

      const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');
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
      setSessionName(session.company + (session.role ? ' · ' + session.role : ''));
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
            onClick={() => { window.location.href = '/?view=dash'; }}
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
