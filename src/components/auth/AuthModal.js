import React from 'react';

export default function AuthModal({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authSignupCode,
  setAuthSignupCode,
  authLoading,
  authMsg,
  setAuthMsg,
  handleAuthSubmit,
  setShowAuthModal,
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div id="authView">
      <div className="auth-card">
        <button
          type="button"
          className="auth-close-btn"
          onClick={() => setShowAuthModal(false)}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="wordmark">FeonixAI</div>
        <h1>{authMode === 'register' ? 'Create your account' : 'Sign in'}</h1>
        <p className="lede">
          {authMode === 'register'
            ? 'The first account on this server becomes the owner.'
            : 'Your answers, your quota, your key.'}
        </p>

        <form onSubmit={handleAuthSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
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
            {authMode === 'register' && <div className="note">At least 10 characters.</div>}
          </div>

          {authMode === 'register' && (
            <div className="field">
              <label htmlFor="signupCode">Signup code</label>
              <input
                id="signupCode"
                type="text"
                value={authSignupCode}
                onChange={(e) => setAuthSignupCode(e.target.value)}
              />
              <div className="note">Leave blank for the first account on this server.</div>
            </div>
          )}

          <button className="btn btn-wide" type="submit" disabled={authLoading}>
            {authMode === 'register' ? 'Create account' : 'Sign in'}
          </button>
          {authMsg.text && (
            <div className={`msg ${authMsg.type === 'err' ? 'msg-err' : 'msg-ok'}`}>
              {authMsg.text}
            </div>
          )}
        </form>

        <div className="auth-switch">
          <span>{authMode === 'register' ? 'Already have an account?' : 'No account yet?'} </span>
          <button
            className="btn-link"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setAuthMsg({ text: '', type: '' });
            }}
            type="button"
          >
            {authMode === 'register' ? 'Sign in' : 'Create one'}
          </button>
        </div>
      </div>
    </div>
  );
}
