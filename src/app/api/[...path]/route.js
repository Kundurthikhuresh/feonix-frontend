const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function proxy(req, context) {
  try {
    const { path } = await context.params;
    const search = req.nextUrl.search || '';
    const url = `${BACKEND}/api/${path.join('/')}${search}`;

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key === 'host' || key === 'connection') return;
      headers.set(key, value);
    });

    const init = {
      method: req.method,
      headers,
      redirect: 'manual',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        init.body = await req.arrayBuffer();
      } catch (err) {
        // Request might not have a body
      }
    }

    const upstream = await fetch(url, init);
    const outHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (key === 'transfer-encoding') return;
      outHeaders.append(key, value);
    });

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
      error: 'proxy_error',
      message: err.message,
      stack: err.stack
    }), {
      status: 500,
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
