"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  isPrivacyModeEnabled,
  setPrivacyModeEnabled,
  clearLocalSessionData,
} from '../../lib/privacy';

function StatusRow({ label, value, good }) {
  return (
    <div style={styles.statusRow}>
      <span style={styles.statusLabel}>{label}</span>
      <span style={{ ...styles.statusValue, color: good === undefined ? '#f8fafc' : good ? '#34d399' : '#f87171' }}>
        {value}
      </span>
    </div>
  );
}

function ConfirmModal({ title, body, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div style={styles.modalBackdrop} onClick={onCancel}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>{title}</h3>
        <p style={styles.modalBody}>{body}</p>
        <div style={styles.modalActions}>
          <button style={styles.btnSecondary} onClick={onCancel} type="button">Cancel</button>
          <button
            style={danger ? styles.btnDanger : styles.btnPrimary}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [security, setSecurity] = useState(null);
  const [isDesktopShell, setIsDesktopShell] = useState(false);
  const [confirming, setConfirming] = useState(null); // 'logs' | 'session' | null
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const loadSecurityStatus = useCallback(async () => {
    if (typeof window === 'undefined' || !window.feonix || typeof window.feonix.getSecurityStatus !== 'function') {
      setIsDesktopShell(false);
      setSecurity(null);
      return;
    }
    setIsDesktopShell(true);
    try {
      const status = await window.feonix.getSecurityStatus();
      setSecurity(status);
    } catch {
      setSecurity(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) { router.replace('/'); return; }
      const { user: u } = await res.json();
      setUser(u);
      setLoading(false);
    })();
    setPrivacyMode(isPrivacyModeEnabled());
    loadSecurityStatus();
  }, [router, loadSecurityStatus]);

  const handleTogglePrivacyMode = () => {
    const next = !privacyMode;
    setPrivacyMode(next);
    setPrivacyModeEnabled(next);
    setMsg({
      text: next
        ? 'Privacy Mode is on — credential-shaped values are redacted from the console.'
        : 'Privacy Mode is off.',
      type: 'ok',
    });
  };

  const handleClearLogs = async () => {
    setConfirming(null);
    setBusy(true);
    try {
      const ok = window.feonix && typeof window.feonix.clearAppLogs === 'function'
        ? await window.feonix.clearAppLogs()
        : false;
      setMsg({ text: ok ? 'Application logs cleared.' : 'Could not clear logs.', type: ok ? 'ok' : 'err' });
      await loadSecurityStatus();
    } finally {
      setBusy(false);
    }
  };

  const handleClearSessionData = async () => {
    setConfirming(null);
    setBusy(true);
    try {
      await clearLocalSessionData();
      setMsg({ text: 'Local session data cleared. Signing you out…', type: 'ok' });
      await fetch('/api/auth/logout', { method: 'POST' });
      setTimeout(() => router.replace('/'), 900);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCenter}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', marginTop: 12 }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/?view=dash" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 style={styles.pageTitle}>Privacy &amp; Security</h1>
            <p style={styles.pageSubtitle}>{user?.email}</p>
          </div>
        </div>

        {msg.text && (
          <div style={{ ...styles.banner, ...(msg.type === 'err' ? styles.bannerErr : styles.bannerOk) }}>
            {msg.text}
          </div>
        )}

        {/* Privacy Mode */}
        <section style={styles.card}>
          <div style={styles.cardHeadRow}>
            <div>
              <h2 style={styles.cardTitle}>Privacy Mode</h2>
              <p style={styles.cardDesc}>
                Redacts credential-shaped values (API keys, tokens, connection strings) out of anything
                logged to the browser console while this is on. It does not — and cannot — hide this
                app&apos;s window content from screen-sharing or recording software. Whatever you choose to
                share with Zoom, Teams, Meet, or an OS screen recorder is exactly what appears in it.
              </p>
            </div>
            <button
              style={{ ...styles.toggle, ...(privacyMode ? styles.toggleOn : {}) }}
              onClick={handleTogglePrivacyMode}
              type="button"
              aria-pressed={privacyMode}
            >
              <span style={{ ...styles.toggleKnob, ...(privacyMode ? styles.toggleKnobOn : {}) }} />
            </button>
          </div>
          <div style={styles.inlineStatus}>
            <span style={{ ...styles.dot, background: privacyMode ? '#34d399' : '#64748b' }} />
            Privacy Mode: <strong style={{ marginLeft: 4 }}>{privacyMode ? 'ON' : 'OFF'}</strong>
          </div>
        </section>

        {/* API credentials */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>API Credentials</h2>
          <p style={styles.cardDesc}>
            This app never holds a real API key, database credential, or session secret on your device.
            Every AI request is made server-side, using a key that stays on the backend — the browser (or
            this desktop shell) only ever sees the answer text that comes back.
          </p>
          <StatusRow label="OpenAI API key" value="Not present on this device (server-side only)" good />
          <StatusRow label="Database credentials" value="Not present on this device (server-side only)" good />
          <StatusRow label="Session token" value="HttpOnly cookie — inaccessible to page scripts" good />
        </section>

        {/* Security status */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Security Status</h2>
          {isDesktopShell && security ? (
            <>
              <StatusRow label="Context Isolation" value={security.contextIsolation ? 'Enabled' : 'Disabled'} good={security.contextIsolation} />
              <StatusRow label="Sandboxed Renderer" value={security.sandbox ? 'Enabled' : 'Disabled'} good={security.sandbox} />
              <StatusRow label="Node Integration" value={security.nodeIntegration ? 'Enabled (unsafe)' : 'Disabled'} good={!security.nodeIntegration} />
              <StatusRow label="DevTools" value={security.devToolsEnabled ? 'Enabled (development build)' : 'Disabled'} good={!security.devToolsEnabled} />
              <StatusRow label="Content Protection" value="Disabled — window is always capturable, by design" good={!security.contentProtection} />
              <StatusRow label="App Version" value={`${security.appVersion} (Electron ${security.electronVersion})`} />
              <StatusRow label="Application Log Size" value={`${(security.logFileBytes / 1024).toFixed(1)} KB`} />
            </>
          ) : (
            <p style={styles.cardDesc}>
              You&apos;re using the browser version — Electron-level security status (sandboxing, content
              protection) only applies to the FeonixAI desktop app.
            </p>
          )}
          <div style={styles.note}>
            Screen-capture detection: Electron/Chromium expose no reliable, cross-platform API to detect
            whether this window is currently being captured by another application (Zoom, Teams, OBS,
            etc.), so this app does not claim to show that status — a fabricated indicator would be worse
            than none.
          </div>
        </section>

        {/* Danger zone */}
        <section style={{ ...styles.card, ...styles.dangerCard }}>
          <h2 style={styles.cardTitle}>Clear Data</h2>
          <p style={styles.cardDesc}>Both actions are immediate and cannot be undone.</p>

          <div style={styles.dangerRow}>
            <div>
              <div style={styles.dangerLabel}>Clear local session data</div>
              <div style={styles.dangerSub}>Wipes local/session storage, cookies, and cached data, then signs you out.</div>
            </div>
            <button style={styles.btnDanger} onClick={() => setConfirming('session')} type="button" disabled={busy}>
              Clear &amp; Sign Out
            </button>
          </div>

          <div style={styles.dangerRow}>
            <div>
              <div style={styles.dangerLabel}>Clear application logs</div>
              <div style={styles.dangerSub}>
                {isDesktopShell ? 'Erases the desktop app\'s local log file.' : 'Only available in the FeonixAI desktop app.'}
              </div>
            </div>
            <button
              style={styles.btnDanger}
              onClick={() => setConfirming('logs')}
              type="button"
              disabled={busy || !isDesktopShell}
            >
              Clear Logs
            </button>
          </div>
        </section>
      </div>

      {confirming === 'session' && (
        <ConfirmModal
          title="Clear local session data?"
          body="This clears local/session storage and cookies for this app and signs you out immediately. You'll need to sign in again."
          confirmLabel="Clear & Sign Out"
          danger
          onConfirm={handleClearSessionData}
          onCancel={() => setConfirming(null)}
        />
      )}
      {confirming === 'logs' && (
        <ConfirmModal
          title="Clear application logs?"
          body="This permanently erases the desktop app's local log file. This cannot be undone."
          confirmLabel="Clear Logs"
          danger
          onConfirm={handleClearLogs}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0b0f', padding: '0 0 60px' },
  container: { maxWidth: 860, margin: '0 auto', padding: '0 24px' },
  loadingCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(0,245,255,0.15)', borderTop: '3px solid #00f5ff', animation: 'spin 0.8s linear infinite' },
  header: { display: 'flex', alignItems: 'center', gap: 16, padding: '32px 0 24px', flexWrap: 'wrap' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 },
  pageTitle: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: 0 },
  pageSubtitle: { color: '#64748b', fontSize: 14, margin: '4px 0 0' },

  banner: { padding: '10px 16px', borderRadius: 10, fontSize: 13.5, marginBottom: 20, border: '1px solid' },
  bannerOk: { background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)', color: '#34d399' },
  bannerErr: { background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' },

  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 20 },
  cardHeadRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' },
  cardDesc: { color: '#94a3b8', fontSize: 13.5, lineHeight: 1.6, margin: 0 },

  inlineStatus: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13, color: '#cbd5e1' },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },

  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13.5 },
  statusLabel: { color: '#94a3b8' },
  statusValue: { fontWeight: 600, textAlign: 'right' },

  note: { marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontSize: 12.5, color: '#64748b', lineHeight: 1.6 },

  toggle: { width: 46, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' },
  toggleOn: { background: 'rgba(0,245,255,0.35)', borderColor: 'rgba(0,245,255,0.5)' },
  toggleKnob: { position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: '50%', background: '#f8fafc', transition: 'transform 0.2s' },
  toggleKnobOn: { transform: 'translateX(20px)' },

  dangerCard: { borderColor: 'rgba(248,113,113,0.2)' },
  dangerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.06)' },
  dangerLabel: { color: '#f8fafc', fontSize: 14, fontWeight: 600 },
  dangerSub: { color: '#64748b', fontSize: 12.5, marginTop: 2 },

  btnPrimary: { padding: '9px 18px', borderRadius: 8, border: 0, background: '#00f5ff', color: '#0a0b0f', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  btnSecondary: { padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#cbd5e1', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  btnDanger: { padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' },

  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalCard: { background: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' },
  modalTitle: { color: '#f8fafc', fontSize: 17, fontWeight: 700, margin: '0 0 10px' },
  modalBody: { color: '#94a3b8', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 20px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10 },
};
