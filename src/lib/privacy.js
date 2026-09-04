// Privacy Mode: a transparent, opt-in guard against sensitive values landing
// somewhere they shouldn't — the browser console, an error overlay, a log
// line — during ordinary use of the app. It has nothing to do with, and
// cannot, hide the app's content from screen-sharing or recording software;
// whatever you share is exactly what a viewer sees. See the Privacy &
// Security settings page for the full explanation shown to users.

const STORAGE_KEY = 'feonix.privacyMode';

export function isPrivacyModeEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPrivacyModeEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  } catch { /* storage blocked — the toggle just won't persist */ }
  window.dispatchEvent(new CustomEvent('feonix:privacy-mode-change', { detail: { enabled } }));
}

/**
 * Masks a secret-shaped string down to a few leading/trailing characters —
 * "sk-proj-abc123...wxyz" -> "sk-*************wxyz". Used wherever a value
 * that looks like a credential might ever be rendered, even though today
 * nothing in this app puts a real API key in front of the renderer (see the
 * Security section of the settings page for why).
 */
export function maskSecret(value, visibleTail = 4) {
  const str = String(value ?? '');
  if (str.length <= visibleTail + 3) return '*'.repeat(str.length);
  const head = str.slice(0, Math.min(3, str.length - visibleTail));
  const tail = str.slice(-visibleTail);
  const stars = '*'.repeat(Math.max(4, str.length - head.length - tail.length));
  return `${head}${stars}${tail}`;
}

// Shapes worth redacting out of anything Privacy Mode intercepts before it
// reaches the console — mirrors backend/src/mailer.js-adjacent patterns kept
// in sync conceptually with desktop-electron/src/logger.js's REDACT_PATTERNS.
const SENSITIVE_PATTERNS = [
  /sk-[A-Za-z0-9_-]{10,}/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  /\bBearer\s+[A-Za-z0-9._-]{10,}/gi,
  /(mongodb(?:\+srv)?:\/\/)[^@]+@/gi,
];

const SENSITIVE_KEY_RE = /(password|passwd|token|secret|api[_-]?key|client[_-]?secret|authorization)/i;

function redactString(text) {
  let out = text;
  for (const pattern of SENSITIVE_PATTERNS) out = out.replace(pattern, '[redacted]');
  return out;
}

/** Deep-redacts an object's values for any key that looks credential-shaped. */
export function redactSensitive(value, seen = new WeakSet()) {
  if (typeof value === 'string') return redactString(value);
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[circular]';
  seen.add(value);

  if (Array.isArray(value)) return value.map((v) => redactSensitive(v, seen));

  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = SENSITIVE_KEY_RE.test(key) ? '[redacted]' : redactSensitive(val, seen);
  }
  return out;
}

let consoleGuardInstalled = false;
const originalConsole = {};

function guardArg(arg) {
  if (typeof arg === 'string') return redactString(arg);
  if (arg && typeof arg === 'object') return redactSensitive(arg);
  return arg;
}

/**
 * Wraps console.log/warn/error/info/debug so that, while Privacy Mode is on,
 * anything credential-shaped is redacted before it reaches DevTools. Safe to
 * call more than once — only installs itself the first time.
 */
export function installConsoleRedaction() {
  if (consoleGuardInstalled || typeof window === 'undefined') return;
  consoleGuardInstalled = true;

  ['log', 'warn', 'error', 'info', 'debug'].forEach((level) => {
    originalConsole[level] = console[level].bind(console);
    console[level] = (...args) => {
      if (isPrivacyModeEnabled()) {
        originalConsole[level](...args.map(guardArg));
      } else {
        originalConsole[level](...args);
      }
    };
  });
}

/** Clears everything this origin can reach client-side: storage + Electron's session, if present. */
export async function clearLocalSessionData() {
  const results = { localStorage: false, sessionStorage: false, cookies: false, electronSession: false };

  try {
    window.localStorage.clear();
    results.localStorage = true;
  } catch { /* blocked */ }

  try {
    window.sessionStorage.clear();
    results.sessionStorage = true;
  } catch { /* blocked */ }

  try {
    // Only clears cookies this page can see (non-HttpOnly) — the session
    // cookie itself is HttpOnly by design and is cleared server-side by
    // /api/auth/logout instead.
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0].trim();
      if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    results.cookies = true;
  } catch { /* blocked */ }

  if (typeof window !== 'undefined' && window.feonix && typeof window.feonix.clearSessionData === 'function') {
    results.electronSession = await window.feonix.clearSessionData();
  }

  return results;
}
