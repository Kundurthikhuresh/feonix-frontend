"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMsg({ text: 'This reset link is missing its token.', type: 'err' });
      return;
    }
    if (password !== confirm) {
      setMsg({ text: 'Passwords do not match.', type: 'err' });
      return;
    }

    setLoading(true);
    setMsg({ text: 'Working…', type: '' });

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok) {
        setMsg({ text: data.message || data.error || 'Something went wrong.', type: 'err' });
        return;
      }

      setDone(true);
      setMsg({ text: data.message || 'Password updated. You can now sign in.', type: 'ok' });
    } catch {
      setLoading(false);
      setMsg({ text: 'Connection error.', type: 'err' });
    }
  };

  return (
    <div className="auth-3d-overlay">
      <div className="auth-ambient-orb orb-cyan" />
      <div className="auth-ambient-orb orb-violet" />

      <div className="auth-card auth-card-3d">
        <div className="auth-brand-badge">
          <span className="badge-pulse-dot" />
          <span className="wordmark">FEONIX AI 3.0</span>
        </div>

        <h1 className="auth-title">Set a new password</h1>
        <p className="lede">
          {done ? 'All set.' : 'Choose a new password for your account.'}
        </p>

        {!done && (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="password">NEW PASSWORD</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="auth-input-3d"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="note">At least 10 characters.</div>
            </div>

            <div className="field">
              <label htmlFor="confirm">CONFIRM PASSWORD</label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="auth-input-3d"
              />
            </div>

            <button className="btn btn-wide btn-3d-primary" type="submit" disabled={loading}>
              {loading ? <span className="btn-loading-spin">Saving…</span> : <span>Reset password</span>}
            </button>

            {msg.text && (
              <div className={`msg ${msg.type === 'err' ? 'msg-err' : 'msg-ok'}`}>
                {msg.text}
              </div>
            )}
          </form>
        )}

        {done && (
          <>
            <div className="msg msg-ok">{msg.text}</div>
            <button
              className="btn btn-wide btn-3d-primary"
              type="button"
              style={{ marginTop: 16 }}
              onClick={() => router.push('/')}
            >
              Go to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
