const BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));

  try {
    const backendRes = await fetch(`${BACKEND}/api/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });

    const data = await backendRes.json().catch(() => ({}));
    return new Response(JSON.stringify(data), {
      status: backendRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'backend_unreachable', message: 'Could not reach the Feonix AI server. Please try again.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
