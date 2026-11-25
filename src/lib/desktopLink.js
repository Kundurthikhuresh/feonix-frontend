/* Desktop link: lets the desktop app, opened directly from the Start menu,
 * sign in as the account that is signed in on the website, instead of the
 * account it saved on an earlier run.
 *
 * Browser side: a random key kept in localStorage. The server is told which
 * account is signed in here (on every sign-in) and forgets it on sign-out.
 * The key reaches the desktop app inside a hand-off (Start session / Open
 * desktop app), and the app keeps it under its own name.
 * Desktop side: on a direct open, claim the key: the server signs the app in
 * as the browser's current account. See linkRouter in backend handoff.js. */

const BROWSER_KEY = 'feonix.browserLinkKey';
const DESKTOP_KEY = 'feonix.desktopLinkKey';

const isDesktop = () => typeof window !== 'undefined' && Boolean(window.feonix);

function randomKey() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let s = '';
  bytes.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The browser's key (created on first use). Null inside the desktop app. */
export function getBrowserLinkKey() {
  if (typeof window === 'undefined' || isDesktop()) return null;
  try {
    let key = localStorage.getItem(BROWSER_KEY);
    if (!key) {
      key = randomKey();
      localStorage.setItem(BROWSER_KEY, key);
    }
    return key;
  } catch {
    return null;
  }
}

/** Browser, signed in: this key now names the signed-in account. */
export function registerDesktopLink() {
  const key = getBrowserLinkKey();
  if (!key) return;
  fetch('/api/desktop-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  }).catch(() => { });
}

/** Browser, signing out: must be sent before the logout request. */
export function unregisterDesktopLink() {
  const key = getBrowserLinkKey();
  if (!key) return Promise.resolve();
  return fetch('/api/desktop-link', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
    keepalive: true,
  }).catch(() => { });
}

/** Desktop app: keep the key a hand-off brought. */
export function saveDesktopLinkKey(key) {
  if (!isDesktop() || !key) return;
  try { localStorage.setItem(DESKTOP_KEY, key); } catch { }
}

/** Desktop app, opened directly: sign in as the browser's current account.
 * Resolves true if the claim succeeded (the app is now that account). */
export async function claimDesktopLink() {
  if (!isDesktop()) return false;
  let key = null;
  try { key = localStorage.getItem(DESKTOP_KEY); } catch { }
  if (!key) return false;
  try {
    const res = await fetch('/api/desktop-link/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}
