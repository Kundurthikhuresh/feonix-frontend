// Microphone / tab-audio capture and chunked transcription. Pure browser-API
// wrappers — no React here, so useSpeechRecognition can stay focused on state
// and this stays testable/reusable on its own.

// A trailing "?" is the strongest signal, but Whisper frequently drops it —
// especially mid-sentence, since a 3.5s recording chunk often cuts off
// before the interviewer finishes speaking. Interrogative openers catch the
// rest without waiting on punctuation that may never arrive.
const QUESTION_STARTERS = /^(what|why|how|when|where|who|whom|whose|which|can|could|would|will|shall|should|do|does|did|is|are|was|were|have|has|had|tell me|walk me through|explain|describe|elaborate on)\b/i;

export function looksLikeQuestion(text) {
  const t = String(text || '').trim();
  if (!t) return false;
  if (t.endsWith('?')) return true;
  return QUESTION_STARTERS.test(t);
}

const AUDIO_CONSTRAINTS = {
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
};

/**
 * Grabs an audio stream to listen on. 'tab' tries shared tab/window/screen
 * audio first (what a real interview call actually needs — the interviewer's
 * voice, not the candidate's mic) and falls back to the microphone if the
 * user's browser/OS can't do display audio capture at all.
 *
 * Throws NO_AUDIO_SHARED if the user picked a share target but didn't tick
 * "Share audio" — Chrome grants that request anyway with a video-only
 * stream, which would otherwise silently transcribe nothing.
 */
export async function getListenStream(source) {
  if (source === 'tab' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch {
      return navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
    }
    if (stream.getAudioTracks().length === 0) {
      stream.getTracks().forEach((track) => track.stop());
      const err = new Error('No audio was shared.');
      err.code = 'NO_AUDIO_SHARED';
      throw err;
    }
    return stream;
  }
  return navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
}

function pickSupportedMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', ''];
  if (typeof MediaRecorder === 'undefined') return '';
  for (const type of candidates) {
    if (!type || MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

/**
 * A MediaRecorder that re-starts itself every `intervalMs` instead of
 * recording one continuous stream — Whisper transcribes a short chunk far
 * faster and more accurately than it would a growing multi-minute file, and
 * chunking is what lets a question get answered while the interviewer is
 * still mid-call instead of only after they stop talking.
 */
export function createChunkedRecorder(stream, { intervalMs = 3500, onChunk } = {}) {
  const mimeType = pickSupportedMimeType();
  let recorder;
  try {
    recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  } catch (err) {
    recorder = new MediaRecorder(stream);
  }

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0 && onChunk) onChunk(e.data);
  };

  let cycleTimer = null;

  return {
    start() {
      recorder.start();
      cycleTimer = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          recorder.start();
        }
      }, intervalMs);
    },
    stop() {
      if (cycleTimer) clearInterval(cycleTimer);
      cycleTimer = null;
      if (recorder.state !== 'inactive') recorder.stop();
    },
  };
}

export function stopStreamTracks(stream) {
  if (stream) stream.getTracks().forEach((track) => track.stop());
}

/**
 * Uploads one recorded chunk for transcription. Throws on a non-OK response.
 *
 * A chunk goes out every 3.5s during a live session, so this is by far the
 * most frequent call in the app — it's the one most likely to land in the
 * few-hundred-ms window while the backend's dev auto-reload is mid-restart
 * (a plain "server_unavailable" 503, not a real failure). A couple of quick
 * retries absorb that instead of losing the chunk and surfacing a scary
 * error for something that resolves itself within a second.
 */
export async function transcribeChunk(blob, sessionId, attempts = 3, delayMs = 500) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': blob.type || 'audio/webm',
        'X-Filename': 'chunk.webm',
        'X-Session-Id': String(sessionId),
      },
      body: blob,
    });
    if (res.ok) return res.json().catch(() => ({}));

    const data = await res.json().catch(() => ({}));
    const isTransient = res.status === 503 && data.error === 'server_unavailable';
    lastErr = Object.assign(new Error(data.message || 'Transcription failed.'), { status: res.status, data });
    if (!isTransient || attempt === attempts) throw lastErr;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw lastErr;
}
