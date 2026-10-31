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
 * Fire-and-forget: asks the backend to load this session's data and open its
 * OpenAI connection now, so the first question is as fast as the later ones.
 */
export function warmAnswer(sessionId) {
  return fetch('/api/answer/warm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  }).catch(() => {});
}

/**
 * Opens the SSE stream and calls onToken(text) for every token as it arrives.
 * Resolves with the full concatenated answer once the stream ends, or throws
 * if the request or the stream itself failed. Treating an SSE error as
 * success would let the caller overwrite its visible error with a blank or
 * partial answer.
 */
export async function streamAnswer({
  question, images, answerStyle, transcript, sessionId, language, action, signal, onToken, onError,
}) {
  const timeoutController = new AbortController();
  const timeoutTimer = setTimeout(() => {
    timeoutController.abort(new Error('Answer generation took too long. Please try again.'));
  }, 60000);

  const onAbort = () => timeoutController.abort();
  if (signal) signal.addEventListener('abort', onAbort, { once: true });

  let receivedText = false;
  const attemptOnce = async () => {
    let res = null;
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        res = await fetch('/api/answer', {
          method: 'POST',
          signal: timeoutController.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question, images, answerStyle, transcript, action,
            session_id: sessionId, language: language || 'en',
          }),
        });

        // Transient backend restarting or brief 503 — retry once
        if (!res.ok && (res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break;
      } catch (networkErr) {
        if (attempt < maxAttempts && !timeoutController.signal.aborted && (!signal || !signal.aborted)) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        throw networkErr;
      }
    }

    if (!res || !res.ok) {
      const errJson = res ? await res.json().catch(() => ({})) : {};
      const err = new Error(errJson.message || errJson.error || 'Could not fetch answer.');
      err.status = res ? res.status : 503;
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
        receivedText = true;
        if (onToken) onToken(parsed.payload.text, fullText);
      } else if (parsed.name === 'error') {
        const err = new Error(parsed.payload.message || 'The answer stream stopped unexpectedly.');
        err.isStreamError = true;
        throw err;
      }
    }
  }

    if (!fullText.trim()) {
      const err = new Error('The answer service returned an empty response. Please try again.');
      err.isStreamError = true;
      throw err;
    }

    return fullText;
  };

  try {
    // A stream that breaks before its first word (the backend restarting, a
    // dropped connection) is asked once more instead of showing "Could not
    // reach the answer service". Once text has appeared it is never repeated,
    // and a refusal from the server (4xx) is never retried.
    for (let round = 1; ; round++) {
      try {
        return await attemptOnce();
      } catch (err) {
        const stopped = timeoutController.signal.aborted || (signal && signal.aborted);
        const refused = err.status && err.status < 500;
        if (round >= 2 || stopped || refused || receivedText) throw err;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
  } finally {
    clearTimeout(timeoutTimer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}
