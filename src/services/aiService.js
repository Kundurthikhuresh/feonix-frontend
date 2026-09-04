// Streams an AI answer from the backend over SSE. Pure networking — no React
// state here, so useAnswerStreaming stays focused on the reveal/typewriter
// logic and this stays testable on its own (and reusable anywhere else that
// wants a streamed answer without the overlay HUD's presentation on top).

function parseSseFrame(frame) {
  let name = 'message';
  let data = '';
  for (const line of frame.split('\n')) {
    if (line.startsWith('event: ')) name = line.slice(7).trim();
    else if (line.startsWith('data: ')) data += line.slice(6);
  }
  if (!data) return null;
  try {
    return { name, payload: JSON.parse(data) };
  } catch {
    return null;
  }
}

/**
 * Opens the SSE stream and calls onToken(text) for every token as it arrives.
 * Resolves with the full concatenated answer once the stream ends, or throws
 * if the request itself failed (before any token arrived) — a mid-stream
 * error instead reaches the caller via onError, since the reader already
 * committed to returning whatever text it got.
 */
export async function streamAnswer({
  question, image, answerStyle, transcript, sessionId, language, signal, onToken, onError,
}) {
  const res = await fetch('/api/answer', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question, image, answerStyle, transcript,
      session_id: sessionId, language: language || 'en',
    }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const err = new Error(errJson.message || errJson.error || 'Could not fetch answer.');
    err.status = res.status;
    err.data = errJson;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split('\n\n');
    buffer = frames.pop();

    for (const frame of frames) {
      const parsed = parseSseFrame(frame);
      if (!parsed) continue;
      if (parsed.name === 'token' && parsed.payload.text) {
        fullText += parsed.payload.text;
        if (onToken) onToken(parsed.payload.text, fullText);
      } else if (parsed.name === 'error') {
        if (onError) onError(parsed.payload.message || 'Stream error.');
      }
    }
  }

  return fullText;
}
