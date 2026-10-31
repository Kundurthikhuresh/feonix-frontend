import dns from 'node:dns';
import fs from 'node:fs';
import nodePath from 'node:path';
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

// Development-only record of answer requests (status/latency/error, no
// content) so a failed answer can be traced from a file.
const PROXY_DEBUG_LOG = nodePath.join(process.cwd(), 'logs', 'proxy-debug.log');
function proxyDebug(line) {
  if (process.env.NODE_ENV === 'production') return;
  try {
    fs.mkdirSync(nodePath.dirname(PROXY_DEBUG_LOG), { recursive: true });
    fs.appendFileSync(PROXY_DEBUG_LOG, `${new Date().toISOString()} ${line}\n`);
  } catch { /* never let diagnostics break the proxy */ }
}

const RAW_BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:4000';
const PRIMARY_BACKEND = RAW_BACKEND.replace(/\/+$/, '');
const FALLBACK_BACKEND = PRIMARY_BACKEND.includes('127.0.0.1')
  ? PRIMARY_BACKEND.replace('127.0.0.1', 'localhost')
  : 'http://127.0.0.1:4000';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function proxy(req, context) {
  const proxyStartedAt = Date.now();
  let isStreamReq = false;
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
        lowerKey === 'keep-alive' ||
        lowerKey === 'expect' // undici's fetch refuses to forward it
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

const isStream = pathStr.startsWith('/api/answer') && !pathStr.startsWith('/api/answer/warm');
    isStreamReq = isStream;
    const isTranscribe = pathStr.startsWith('/api/transcribe');
    const isAiHeavy =
      isStream ||
      isTranscribe ||
      pathStr.startsWith('/api/vision') ||
      pathStr.startsWith('/api/assistant') ||
      pathStr.startsWith('/api/resume-ai') ||
      pathStr.startsWith('/api/interview-prep') ||
      pathStr.startsWith('/api/cover-letter') ||
      pathStr.includes('/questions') ||
      pathStr.includes('/ask') ||
      pathStr.includes('/generate');
    const upstreamTimeoutMs = isStream ? 300000 : (isAiHeavy ? 90000 : 30000);

    const init = {
      method: req.method,
      headers,
      redirect: 'manual',
      body: bodyBuffer ? Buffer.from(bodyBuffer) : null,
    };

    let upstream = null;
    const isIdempotent = req.method === 'GET' || req.method === 'HEAD';
    // Only safe/idempotent reads, stream answers and transcription chunks should retry
    // upstream on transient fetch errors (e.g. ECONNRESET or reload).
    const maxRetries = isStream ? 3 : (isTranscribe ? 3 : 4);
    const targets = [
      PRIMARY_BACKEND,
      FALLBACK_BACKEND,
      'http://127.0.0.1:4000',
      'http://localhost:4000',
    ].filter((val, idx, self) => self.indexOf(val) === idx);

    // A refused connection never reached the backend, so retrying it is safe for
    // any method; this rides out the ~2s gap while `node --watch` restarts.
    const refusedDeadline = Date.now() + 10000;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const targetUrl = `${targets[attempt % targets.length]}${pathStr}`;
      try {
        upstream = await fetch(targetUrl, {
          ...init,
          body: bodyBuffer ? Buffer.from(bodyBuffer) : null,
          signal: AbortSignal.timeout(upstreamTimeoutMs),
        });
        break;
      } catch (fetchErr) {
        const refused = fetchErr?.cause?.code === 'ECONNREFUSED';
        if (refused && Date.now() < refusedDeadline) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          attempt -= 1;
          continue;
        }
        if (attempt === maxRetries - 1) {
          throw fetchErr;
        }
        const backoffMs = 350 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    if (isStream) proxyDebug(`answer upstream status=${upstream.status} headersMs=${Date.now() - proxyStartedAt}`);

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
if (isStreamReq) proxyDebug(`answer proxy error after ${Date.now() - proxyStartedAt}ms: ${err && (err.cause?.code || err.message)}`);
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
