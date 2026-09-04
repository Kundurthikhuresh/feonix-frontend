// Bounded so a stuck backend fails fast instead of leaving the caller's
// "Authenticating…" spinner hanging with nothing to show for it — plain
// fetch() has no default timeout, so a connection the backend accepted but
// never answered would otherwise hang until the browser gives up on its own,
// which is well past what a login should ever take.
const DEFAULT_TIMEOUT_MS = 4000;

export async function postJSON(path, body, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, status: 0, data: { error: 'timeout', message: 'Request timed out.' } };
    }
    return { ok: false, status: 0, data: { error: 'network_error', message: 'Could not reach the server.' } };
  } finally {
    clearTimeout(timer);
  }
}
