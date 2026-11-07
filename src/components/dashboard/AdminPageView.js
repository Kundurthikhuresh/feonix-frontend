'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { postJSON } from '../../lib/api';
import AdminPane from './AdminPane';
import AuthModal from '../auth/AuthModal';

export default function AdminPageView() {
  const routeParams = useParams();
  const rawSection = routeParams?.section;
  const initialSection = Array.isArray(rawSection) ? rawSection[0] : (rawSection || null);

  const [user, setUser] = useState(null);
  // True until the sign-in check has answered. Until then a short loading
  // screen shows instead of the sign-in form, so a refresh (Ctrl+F5) of a
  // signed-in admin no longer flashes the Admin Sign In page first.
  const [checkingSession, setCheckingSession] = useState(true);

  const [themeMode, setThemeMode] = useState('dark');

  // Auth Modal State for Admin Login
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authAdminCode, setAuthAdminCode] = useState('');
  const [authMsg, setAuthMsg] = useState({ text: '', type: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Initialize theme and verify session
  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('feonix-theme') : null;
    const activeTheme = storedTheme === 'light' ? 'light' : 'dark';
    setThemeMode(activeTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = activeTheme;
    }

    // The admin saved by the last successful check opens the panel at once;
    // the check below then confirms it (or signs out a stale one).
    let cachedAdmin = null;
    try {
      const raw = localStorage.getItem('feonix_dash_cache');
      const cached = raw ? JSON.parse(raw) : null;
      if (cached?.user && (cached.user.is_admin || cached.user.role === 'owner')) cachedAdmin = cached.user;
    } catch {}

    // If already authenticated as admin and hitting /admin directly, forward to /admin/dashboard
    if (cachedAdmin && typeof window !== 'undefined' && window.location.pathname === '/admin') {
      window.location.replace('/admin/dashboard');
      return;
    }
    if (cachedAdmin) setUser(cachedAdmin);

    checkAdminSession().finally(() => setCheckingSession(false));
  }, []);

  const checkAdminSession = async () => {
    try {
      const controller = new AbortController();
      // A slow server (seen: 2.8 s) is waited for; the loading screen shows meanwhile.
      const timer = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('/api/auth/me', { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.is_admin || data.user.role === 'owner')) {
          setUser(data.user);
          try {
            localStorage.setItem('feonix_dash_cache', JSON.stringify({ user: data.user }));
          } catch {}
          if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
            window.location.replace('/admin/dashboard');
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser((prev) => (prev?.is_admin || prev?.role === 'owner' ? prev : null));
    }
  };

  const toggleTheme = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = nextTheme;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('feonix-theme', nextTheme);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { }
    try {
      localStorage.removeItem('feonix_dash_cache');
    } catch {}
    setUser(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthMsg({ text: 'Signed out successfully.', type: 'ok' });
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
  };

  const handleAuthSubmit = async (e) => {
    e?.preventDefault?.();
    setAuthLoading(true);
    setAuthMsg({ text: authMode === 'forgot' ? 'Sending reset link…' : 'Verifying administrator credentials…', type: '' });

    if (authMode === 'forgot' && !authEmail.trim()) {
      setAuthLoading(false);
      setAuthMsg({ text: 'Please enter your email.', type: 'err' });
      return;
    }

    if (authMode !== 'forgot' && (!authEmail.trim() || !authPassword)) {
      setAuthLoading(false);
      setAuthMsg({ text: 'Please enter both email and password.', type: 'err' });
      return;
    }

    if (authMode === 'forgot') {
      const { ok, data } = await postJSON('/api/auth/forgot-password', { email: authEmail.trim() });
      setAuthLoading(false);
      if (ok) {
        setAuthMsg({ text: data?.message || 'Password reset link sent to your email.', type: 'ok' });
      } else {
        setAuthMsg({ text: data?.error || 'Failed to send reset email.', type: 'err' });
      }
      return;
    }

    const { ok, data } = await postJSON('/api/auth/login', {
      email: authEmail.trim(),
      password: authPassword,
      role: 'admin',
    });

    setAuthLoading(false);

    if (!ok) {
      setAuthMsg({
        text: data?.error || data?.message || 'Invalid administrator email or password.',
        type: 'err',
      });
      return;
    }

    const loggedInUser = data?.user;
    if (!loggedInUser || (!loggedInUser.is_admin && loggedInUser.role !== 'owner')) {
      setAuthMsg({
        text: 'Access Denied: This account does not possess administrator privileges.',
        type: 'err',
      });
      return;
    }

    // Success: Admin logged in
    setUser(loggedInUser);
    try {
      localStorage.setItem('feonix_dash_cache', JSON.stringify({ user: loggedInUser }));
    } catch {}
    setAuthPassword('');
    setAuthMsg({ text: '', type: '' });

    // Redirect admin to /admin/dashboard
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/dashboard';
    }
  };

  // If authenticated as admin, render AdminPane
  if (user && (user.is_admin || user.role === 'owner')) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ad-bg, #0b0f17)' }}>
        <AdminPane
          user={user}
          themeMode={themeMode}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          onExitAdmin={() => {
            window.location.href = '/';
          }}
          initialSection={initialSection}
        />
      </div>
    );
  }

  // Still asking the server who is signed in: neither the panel nor the
  // sign-in form yet.
  if (checkingSession) {
    // Just the page background (no message or spinner) for the moment the
    // check takes.
    return <div style={{ minHeight: '100vh', background: '#07090e' }} />;
  }

  // Not signed in as an admin: the Admin Sign In page.
  return (
    <div style={{ minHeight: '100vh', background: '#07090e' }}>
      <AuthModal
        authMode={authMode}
        setAuthMode={setAuthMode}
        authRole="admin"
        setAuthRole={(role) => {
          if (role === 'user') {
            window.location.href = '/?auth=login';
          }
        }}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authSignupCode=""
        setAuthSignupCode={() => {}}
        authAdminCode={authAdminCode}
        setAuthAdminCode={setAuthAdminCode}
        authLoading={authLoading}
        authMsg={authMsg}
        setAuthMsg={setAuthMsg}
        handleAuthSubmit={handleAuthSubmit}
        setShowAuthModal={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}

