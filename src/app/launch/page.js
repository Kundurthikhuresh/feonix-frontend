"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MAC_UNBLOCK_COMMAND = 'sudo xattr -cr /Applications/FeonixAI.app';

function LaunchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [sessionName, setSessionName] = useState('');
  const [title, setTitle] = useState('Open FeonixAI Desktop');
  const [lede, setLede] = useState('Click "Open in desktop app" below to open this session in the FeonixAI desktop app.');
  const autoLaunchedRef = useRef(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [alwaysAllow, setAlwaysAllow] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState('https://www.feonix-ai.com');
  const [siteHost, setSiteHost] = useState('www.feonix-ai.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSiteOrigin(window.location.origin);
      const host = window.location.host;
      setSiteHost(host.startsWith('www.') ? host : (window.location.hostname === 'localhost' ? host : 'www.' + host));
    }
  }, []);

  // The one-time launch link is fetched ahead of time (on load, and again
  // after each use), so clicking Open opens the app at once instead of
  // waiting for the server. Links last 90 s on the server; one older than
  // 60 s is fetched again.
  const linkRef = useRef(null); // { promise, at }
  const fetchLaunchLink = () => fetch(`/api/sessions/${sessionId}/handoff`, { method: 'POST' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (data && (data.deep_link || data.deepLink
      || (data.token ? `feonixai://launch?token=${data.token}&session=${sessionId}` : null))) || null)
    .catch(() => null);
  const prefetchLaunchLink = () => {
    if (!sessionId) return;
    const cur = linkRef.current;
    if (cur && Date.now() - cur.at < 60000) return;
    linkRef.current = { promise: fetchLaunchLink(), at: Date.now() };
  };
  const takeLaunchLink = async () => {
    const cur = linkRef.current;
    linkRef.current = null;
    const fresh = cur && Date.now() - cur.at < 60000 ? await cur.promise : null;
    return fresh || fetchLaunchLink();
  };

  const askToOpen = () => {
    if (!sessionId) { router.replace('/'); return; }
    prefetchLaunchLink();
    setShowPrompt(true);
  };
  const confirmOpen = () => {
    setShowPrompt(false);
    handleOpenDesktopApp();
  };
  const tryRef = useRef(0);
  const [pulsing, setPulsing] = useState(false);
  const [showFallback, setShowFallback] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isMacOS, setIsMacOS] = useState(false);
  const [launching, setLaunching] = useState(false);
  // The Mac app is not notarized by Apple yet, so macOS reports it as
  // "damaged" until the download's quarantine mark is removed. Shown after
  // a Mac download, with the one command that does it.
  const [showMacHelp, setShowMacHelp] = useState(false);
  const [macCmdCopied, setMacCmdCopied] = useState(false);

  const handleOpenDesktopApp = async () => {
    if (!sessionId) {
      router.replace('/');
      return;
    }
    setMsg({ text: '', type: '' });
    setLaunching(true);
    setPulsing(true);
    tryRef.current += 1;
    const thisTry = tryRef.current;

    let deepLink = null;
    try {
      deepLink = await takeLaunchLink();
    } catch (err) {
      console.warn('Launch handoff note:', err);
    }
    // Ready the next link in case this try is cancelled.
    setTimeout(prefetchLaunchLink, 0);

    if (deepLink) {
      let leftPage = false;
      const markLeft = () => { leftPage = true; };
      const markHidden = () => { if (document.hidden) leftPage = true; };
      window.addEventListener('blur', markLeft);
      document.addEventListener('visibilitychange', markHidden);

      try {
        window.location.href = deepLink;
      } catch { }
      setTitle('Opening FeonixAI Desktop…');
      setLede('Click "Open FeonixAI" in the dialog shown by your browser. If you don\'t see the dialog, click "Open in desktop app" below.');
      setLaunching(false);

      const token = (deepLink.match(/[?&]token=([^&]+)/) || [])[1] || '';
      const opened = await waitForDesktopApp(token, () => leftPage);
      window.removeEventListener('blur', markLeft);
      document.removeEventListener('visibilitychange', markHidden);
      if (thisTry !== tryRef.current) return;

      setLaunching(false);
      setPulsing(false);
      if (opened) {
        setTitle('Continue in FeonixAI Desktop');
        setLede('Your session is open in the FeonixAI desktop app.');
        setMsg({ text: '', type: '' });
      } else {
        setTitle('FeonixAI Desktop is not installed');
        setLede('The desktop app did not open on this computer.');
        setMsg({
          text: 'Please download our FeonixAI setup below and install it on your system, then click "Open desktop app" again.',
          type: 'err',
        });
      }
      return;
    }

    window.location.href = `/session-type?session=${encodeURIComponent(sessionId)}`;
  };

  const waitForDesktopApp = async (token, pageLeft) => {
    const started = Date.now();
    const NO_APP_MS = 3500;
    const MAX_WAIT_MS = 25000;
    let sawLeave = false;
    while (Date.now() - started < MAX_WAIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (pageLeft()) sawLeave = true;
      if (token) {
        try {
          const res = await fetch(
            `/api/sessions/${encodeURIComponent(sessionId)}/handoff-status?token=${encodeURIComponent(token)}`,
            { cache: 'no-store' }
          );
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data.used) return true;
            if (data.expired) return false;
          }
        } catch { }
      } else if (sawLeave) {
        return true;
      }
      if (!sawLeave && Date.now() - started >= NO_APP_MS) return false;
    }
    return false;
  };

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

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

      // The "Open ?" prompt is shown only when the user clicks
      // "Open in desktop app" (askToOpen), never by itself on load. The
      // launch link is readied now, so that click is instant.
      prefetchLaunchLink();
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
    setShowMacHelp(true);
    window.location.href = '/api/download/mac';
  };

  const copyMacCommand = () => {
    const done = () => { setMacCmdCopied(true); setTimeout(() => setMacCmdCopied(false), 2000); };
    try {
      navigator.clipboard.writeText(MAC_UNBLOCK_COMMAND).then(done, () => {});
    } catch { /* clipboard unavailable: the command stays selectable */ }
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
      {showPrompt && (
        <div className="open-prompt-layer" onMouseDown={() => setShowPrompt(false)}>
          <div
            className="open-prompt"
            role="dialog"
            aria-modal="true"
            aria-labelledby="open-prompt-title"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowPrompt(false); }}
          >
            <h2 id="open-prompt-title">Open ?</h2>
            <p>
              {siteOrigin} wants to open this application.
            </p>
            <label className="open-prompt-checkbox">
              <input
                type="checkbox"
                checked={alwaysAllow}
                onChange={(e) => setAlwaysAllow(e.target.checked)}
              />
              <span>Always allow {siteHost} to open links of this type in the associated app</span>
            </label>
            <div className="open-prompt-buttons">
              <button type="button" className="open-prompt-open" onClick={confirmOpen} autoFocus>
                Open
              </button>
              <button type="button" className="open-prompt-cancel" onClick={() => setShowPrompt(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="launch-card launch-card-v2">
        <div className="launch-brand-lockup">
          <div className="launch-brand-logo">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#10b981" />
              <path d="M2 17L12 22L22 17" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="launch-brand-name">Feonix <span className="launch-brand-pill">AI</span></span>
        </div>

        <p className="lede" id="lede">
          Click &quot;Open FeonixAI&quot; in the dialog shown by your browser. If you don&apos;t see the dialog, click &quot;Open in desktop app&quot; below.
        </p>

        <button className="launch-btn launch-btn-wide" onClick={askToOpen} disabled={launching} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <polyline points="9 9 12 12 15 9" />
          </svg>
          <span>{launching ? 'Opening…' : 'Open in desktop app'}</span>
        </button>

        {msg.text && msg.type === 'err' && (
          <div className="launch-msg launch-msg-err" style={{ marginBottom: '20px', textAlign: 'center', fontWeight: '500' }}>
            {msg.text}
          </div>
        )}

        {showFallback && (
          <div className="launch-get-app">
            <h2>Don&apos;t have the desktop app yet?</h2>
            <p>Download it to run FeonixAI privately during your calls.</p>
            <button
              className="launch-download-btn"
              onClick={isMacOS ? handleDownloadMac : handleDownloadWin}
              type="button"
            >
              {isMacOS ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.5 2.1-3.7 2.2-3.8-1.2-1.7-3-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.2zM13.9 5.1c.7-.9 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5l7.5-1v7H3zM11.5 4.4L21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.4z" /></svg>
              )}
              <span>{isMacOS ? 'Download for macOS' : 'Download for Windows'}</span>
            </button>
            <div className="launch-platform-note">
              Need it for{' '}
              <button className="launch-link" onClick={isMacOS ? handleDownloadWin : handleDownloadMac} type="button">
                {isMacOS ? 'Windows' : 'macOS'}
              </button>
              ?
            </div>

            {showMacHelp && (
              <div className="launch-mac-help" role="note">
                <h3>Opening FeonixAI on a Mac</h3>
                <p>If macOS says <em>&ldquo;FeonixAI is damaged and can&apos;t be opened&rdquo;</em>, click <strong>Cancel</strong> (not Move to Bin), then:</p>
                <ol>
                  <li>Open the downloaded file and drag <strong>FeonixAI</strong> into <strong>Applications</strong>.</li>
                  <li>Open <strong>Terminal</strong> (press <kbd>⌘</kbd> + <kbd>Space</kbd>, type <em>Terminal</em>, press Return).</li>
                  <li>
                    Paste this command, press Return, and enter your Mac password if asked:
                    <div className="launch-mac-cmd">
                      <code>{MAC_UNBLOCK_COMMAND}</code>
                      <button type="button" onClick={copyMacCommand}>{macCmdCopied ? 'Copied' : 'Copy'}</button>
                    </div>
                  </li>
                  <li>Open <strong>FeonixAI</strong> from Applications and allow Microphone and Screen Recording.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <button className="launch-back-link" onClick={handleBackToDashboard} type="button">
          <span>← Back to dashboard</span>
        </button>
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
