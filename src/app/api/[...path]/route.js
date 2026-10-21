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
      if (
        lowerKey === 'host' ||
        lowerKey === 'connection' ||
        lowerKey === 'content-length' ||
        lowerKey === 'transfer-encoding' ||
        lowerKey === 'keep-alive'
      ) return;
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
    // healthy backend. AI question generations (e.g. /questions, /ask)
    // require reasonable headroom so slower LLM calls don't timeout at 30s.
    const isStream = pathStr.startsWith('/api/answer');
    const isAiGeneration = pathStr.includes('/questions') || pathStr.includes('/ask') || pathStr.includes('/generate') || pathStr.includes('/vision');
    const upstreamTimeoutMs = isStream ? 300000 : (isAiGeneration ? 90000 : 30000);

    const init = {
      method: req.method,
      headers,
      redirect: 'manual',
      body: bodyBuffer,
    };

    let upstream = null;
    const isIdempotent = req.method === 'GET' || req.method === 'HEAD';
    // Only safe/idempotent reads should retry upstream on transient fetch errors.
    // Retrying state-mutating requests (POST, PUT, DELETE) across targets can cause
    // duplicate side-effects (such as duplicate session creation or credit deductions).
    const maxRetries = (isStream || !isIdempotent) ? 1 : 4;
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
        lowerKey === 'content-encoding' ||
        lowerKey === 'connection' ||
        lowerKey === 'keep-alive' ||
        lowerKey === 'proxy-connection' ||
        lowerKey === 'upgrade'
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

    if (isStream || contentType.includes('text/event-stream')) {
      outHeaders.set('content-type', 'text/event-stream; charset=utf-8');
      outHeaders.set('cache-control', 'no-cache, no-transform');
      outHeaders.set('x-accel-buffering', 'no');
      return new Response(upstream.body, {
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
    console.error('PROXY ERROR:', err.message, err.cause, err.stack);
    return new Response(JSON.stringify({
      error: 'server_unavailable',
      message: err.message || 'Service is initializing. Please try again in a moment.',
      cause: String(err.cause?.message || err.cause || '')
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
