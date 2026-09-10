const PRIMARY_BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:4000';
const FALLBACK_BACKEND = PRIMARY_BACKEND.includes('127.0.0.1')
  ? PRIMARY_BACKEND.replace('127.0.0.1', 'localhost')
  : 'http://127.0.0.1:4000';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function proxy(req, context) {
  try {
    const { path } = await context.params;
    const search = req.nextUrl.search || '';
    const pathStr = `/api/${path.join('/')}${search}`;

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'host' || lowerKey === 'connection' || lowerKey === 'content-length') return;
      headers.set(key, value);
    });

    let bodyBuffer = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch (err) {
        // Request might not have a body
      }
    }

    // Answer streams (SSE) legitimately run long; anything else — auth
    // included — has no business taking more than a few seconds against a
    // healthy backend. Without a bound here a backend that accepted the
    // connection but then stalled (e.g. mid-restart) left this fetch hanging
    // for up to maxDuration, which is what turned a login into a spinner
    // that never resolved instead of a fast retry or a fast, clear error.
    const isStream = pathStr.startsWith('/api/answer');
    const upstreamTimeoutMs = isStream ? 60000 : 15000;

    const init = {
      method: req.method,
      headers,
      redirect: 'manual',
      body: bodyBuffer,
    };

    let upstream = null;
    const maxRetries = isStream ? 1 : 4;
    const targets = PRIMARY_BACKEND !== FALLBACK_BACKEND
      ? [PRIMARY_BACKEND, FALLBACK_BACKEND]
      : [PRIMARY_BACKEND];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const targetUrl = `${targets[attempt % targets.length]}${pathStr}`;
      try {
        upstream = await fetch(targetUrl, {
          ...init,
          signal: AbortSignal.timeout(upstreamTimeoutMs),
        });
        break;
      } catch (fetchErr) {
        if (attempt === maxRetries - 1) {
          throw fetchErr;
        }
        const backoffMs = 250 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    const outHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey === 'transfer-encoding' ||
        lowerKey === 'set-cookie' ||
        lowerKey === 'content-length' ||
        lowerKey === 'content-encoding'
      ) {
        return;
      }
      outHeaders.append(key, value);
    });

    // Preserve multiple Set-Cookie headers accurately
    if (typeof upstream.headers.getSetCookie === 'function') {
      const cookies = upstream.headers.getSetCookie();
      cookies.forEach((cookie) => {
        outHeaders.append('set-cookie', cookie);
      });
    } else {
      const singleCookie = upstream.headers.get('set-cookie');
      if (singleCookie) outHeaders.append('set-cookie', singleCookie);
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const responseData = await upstream.json().catch(() => ({}));
      return new Response(JSON.stringify(responseData), {
        status: upstream.status,
        headers: outHeaders,
      });
    }

    const nullBodyStatus = [101, 204, 205, 304].includes(upstream.status);
    const responseBuffer = nullBodyStatus ? null : await upstream.arrayBuffer().catch(() => null);
    return new Response(responseBuffer, {
      status: upstream.status,
      headers: outHeaders,
    });
  } catch (err) {
    console.error('PROXY ERROR:', err);
    return new Response(JSON.stringify({
      error: 'server_unavailable',
      message: 'Authentication service is initializing. Please try again in a moment.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
