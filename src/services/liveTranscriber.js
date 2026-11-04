/**
 * Live speech-to-text for one voice channel (the candidate's mic, or the
 * interviewer's meeting audio): words come back while the person is still
 * talking, instead of after each pause.
 *
 * Audio is converted to 16-bit PCM at 24 kHz and streamed to the backend
 * relay (feonix-backend/src/liveStt.js), but only while someone is speaking,
 * plus a short lead-in so the first word is not clipped. Silence is never
 * sent, which keeps the per-minute cost down. When the voice detector hears
 * the speaker stop, the turn is committed and its final text arrives a
 * moment later.
 *
 * Same shape as createChunkedRecorder: start(), stop(), isSpeaking().
 */

const SAMPLE_RATE = 24000;
const FRAME_SAMPLES = 2400; // 100 ms
const LEAD_IN_FRAMES = 3; // 300 ms sent from before the voice was detected
/* A stretch of speech is committed after this much quiet, so its transcript
 * comes back soon after the speaker stops. This is short on purpose: a
 * thinking pause mid-question also ends a stretch, and the caller joins the
 * stretches back together (useSpeechRecognition holds text that is not yet a
 * finished question until the speaker has really stopped). Measured: 600 ms
 * here put 650 ms of waiting before every answer. */
const END_SILENCE_MS = 250;
/* A turn whose live words end in "?" is a finished question: its live words
 * are handed on at once instead of waiting for the final transcript (which
 * took 0.5-1.1 s more). If the final then reads differently, it is handed on
 * as a revision. */
const MIN_EARLY_WORDS = 3;
const MIN_TURN_MS = 400;
// A long answer is cut into turns so its text keeps arriving.
const MAX_TURN_MS = 15000;
// A committed turn whose text never comes back is given up on after this.
// On a slow connection OpenAI took up to 3.5 s just to confirm a turn, and at
// 6 s questions were given up on while their text was still coming.
const FINAL_TIMEOUT_MS = 10000;
// Audio buffered while the connection opens, at most.
const MAX_QUEUED_FRAMES = 50;
// Diagnostics: a level summary per channel this often, and a warning when a
// channel has heard nothing at all this long after it started (wrong output
// device, muted call, or audio not shared). Silence later on is normal: the
// other person is simply not talking.
const LEVEL_REPORT_MS = 10000;
const DEAD_AUDIO_WARN_MS = 20000;
const DEAD_AUDIO_RMS = 0.0005;

// RMS level (0-1) of one frame of 16-bit PCM.
function frameLevel(buf) {
  const samples = new Int16Array(buf);
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
  return samples.length ? Math.sqrt(sum / samples.length) / 32768 : 0;
}

let configPromise = null;

// A dropped live connection is reopened up to three times, waiting this long
// before each try, before the channel falls back to clips. These failures
// cannot be fixed by reconnecting and fall back at once.
const RECONNECT_DELAYS_MS = [500, 1500, 4000];
const FATAL_CODES = new Set([
  'live_off', 'session_ended', 'quota_exhausted', 'unauthenticated', 'too_many_channels',
  'http_401', 'http_403', 'http_409', 'http_410',
]);

/* How long to wait before reconnecting after a failure with this code, given
 * the failures since the connection last worked; null means do not retry. */
export function liveReconnectDelay(code, failures) {
  if (FATAL_CODES.has(code) || failures >= RECONNECT_DELAYS_MS.length) return null;
  return RECONNECT_DELAYS_MS[failures];
}

/* 'live' or 'clips', from the backend's STT_MODE. Asked once per page; a
 * failed check means clips. */
export function getSttMode() {
  if (!configPromise) {
    configPromise = fetch('/api/live-stt/config')
      .then((r) => (r.ok ? r.json() : { mode: 'clips' }))
      .then((d) => (d && d.mode === 'live' ? 'live' : 'clips'))
      .catch(() => 'clips');
  }
  return configPromise;
}

/* The relay runs on the API server, which the page's /api proxy cannot
 * forward a WebSocket to. NEXT_PUBLIC_LIVE_STT_URL names it in production;
 * otherwise it is this host on port 4000. */
function relayUrl() {
  if (process.env.NEXT_PUBLIC_LIVE_STT_URL) return process.env.NEXT_PUBLIC_LIVE_STT_URL;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.hostname}:4000/api/live-stt`;
}

// Runs on the audio thread: resamples to 24 kHz and posts 100 ms frames of
// 16-bit PCM.
const WORKLET_SOURCE = `
class PcmFramer extends AudioWorkletProcessor {
  constructor() {
    super();
    this.step = sampleRate / ${SAMPLE_RATE};
    this.pos = 0;
    this.frame = new Int16Array(${FRAME_SAMPLES});
    this.n = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    while (this.pos < ch.length) {
      const i = Math.floor(this.pos);
      const f = this.pos - i;
      const a = ch[i];
      const b = i + 1 < ch.length ? ch[i + 1] : ch[i];
      let s = a + (b - a) * f;
      s = s > 1 ? 1 : s < -1 ? -1 : s;
      this.frame[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.frame.length) {
        this.port.postMessage(this.frame.buffer, [this.frame.buffer]);
        this.frame = new Int16Array(${FRAME_SAMPLES});
        this.n = 0;
      }
      this.pos += this.step;
    }
    this.pos -= ch.length;
    return true;
  }
}
registerProcessor('pcm-framer', PcmFramer);
`;

async function openPcmTap(stream, onFrame) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
  const url = URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'application/javascript' }));
  try {
    await ctx.audioWorklet.addModule(url);
  } finally {
    URL.revokeObjectURL(url);
  }
  const source = ctx.createMediaStreamSource(stream);
  const framer = new AudioWorkletNode(ctx, 'pcm-framer');
  // The graph must reach the output to be processed; muted so nothing plays.
  const mute = ctx.createGain();
  mute.gain.value = 0;
  source.connect(framer);
  framer.connect(mute);
  mute.connect(ctx.destination);
  framer.port.onmessage = (e) => onFrame(e.data);
  return () => {
    framer.port.onmessage = null;
    try { source.disconnect(); framer.disconnect(); mute.disconnect(); } catch {}
    ctx.close().catch(() => {});
  };
}

/**
 * onTurn() is called when a turn is committed and returns a function that
 * receives that turn's final text (empty if nothing was understood) and its
 * timings, so the caller can keep turns in order. onInterim(text) gets the
 * words heard so far in the current turn. onReady() means the connection is
 * up and audio is flowing. onFailure(err) means the connection could not be
 * made or was lost; err.code says why, and the caller decides whether to
 * reconnect or fall back to clips.
 *
 * A turn whose live words end in "?" is handed on from those words as soon
 * as it is committed and they are in (timing.early), without waiting for its
 * final transcript; if the final then reads differently, onRevision(text,
 * timing) gets the final.
 *
 * Timings (performance.now()): speechStartAt, lastVoiceAt, commitAt,
 * firstDeltaAt, finalAt.
 */
export function createLiveTranscriber(stream, {
  sessionId, speaker, onTurn, onInterim, onReady, onFailure, onRevision,
} = {}) {
  const hasVad = Boolean(stream && typeof stream.hasVoiceActivity === 'function');
  let ws = null;
  let closeTap = null;
  let stopped = false;
  let failed = false;
  let opened = false;

  const leadIn = [];
  const queued = [];
  let inTurn = false;
  let turnStartedAt = 0;
  let lastVoiceAt = 0;

  // Level diagnostics (see LEVEL_REPORT_MS).
  let stats = null;
  let startedAt = 0;
  let heardSound = false;
  let deadWarned = false;

  // Committed turns waiting for their text, oldest first.
  const pending = [];
  const interim = new Map(); // item_id → words so far
  // Timings of the turn being spoken now; handed to its entry on commit.
  let turnTiming = null;
  // The live words of an item when they already form a finished question;
  // otherwise ''. A turn is tied to its item only by the relay's "committed"
  // event (they arrive in commit order): guessing it from the words led late
  // words of one turn to be taken as the next turn's.
  const finishedQuestion = (itemId) => {
    const words = (itemId && interim.get(itemId) || '').trim();
    if (!/\?\s*["')\]]?$/.test(words)) return '';
    return words.split(/\s+/).length >= MIN_EARLY_WORDS ? words : '';
  };

  // Hands a committed turn on from its live words, before its final.
  const deliverEarly = (entry, words) => {
    entry.early = words;
    entry.timing.finalAt = performance.now();
    entry.timing.early = true;
    entry.deliver(words, { ...entry.timing });
  };

  const fail = (err) => {
    if (failed || stopped) return;
    failed = true;
    pending.splice(0).forEach((p) => { clearTimeout(p.timer); p.deliver('', p.timing); });
    interim.clear();
    teardown();
    if (onFailure) onFailure(err);
  };

  const sendFrame = (buf) => {
    if (ws && ws.readyState === WebSocket.OPEN && opened) ws.send(buf);
    else if (queued.length < MAX_QUEUED_FRAMES) queued.push(buf);
  };

  const commit = () => {
    const deliver = onTurn ? onTurn() : () => {};
    const timing = { ...(turnTiming || {}), lastVoiceAt, commitAt: performance.now() };
    turnTiming = null;
    const entry = { itemId: undefined, deliver, timer: null, timing, early: '' };
    entry.timer = setTimeout(() => {
      const i = pending.indexOf(entry);
      if (i >= 0) pending.splice(i, 1);
      if (entry.itemId) interim.delete(entry.itemId);
      if (entry.early) return;
      console.warn('[live-stt] final transcript timed out', { speaker });
      deliver('', timing);
    }, FINAL_TIMEOUT_MS);
    pending.push(entry);
    if (ws && ws.readyState === WebSocket.OPEN && opened) ws.send(JSON.stringify({ type: 'commit' }));
    else queued.push(JSON.stringify({ type: 'commit' }));
  };

  const settle = (itemId, text) => {
    const i = pending.findIndex((p) => p.itemId === itemId);
    if (i < 0) return;
    const [entry] = pending.splice(i, 1);
    clearTimeout(entry.timer);
    interim.delete(itemId);
    if (entry.early) {
      // Already answered from the live words; the final only matters if it
      // says something different.
      if (text && onRevision && differs(entry.early, text)) {
        onRevision(text, { ...entry.timing, finalAt: performance.now(), early: false, revised: true });
      }
      return;
    }
    entry.timing.finalAt = performance.now();
    entry.deliver(text || '', entry.timing);
  };

  const reportLevels = (now, level, voice, sent) => {
    if (!stats) stats = { since: now, frames: 0, voiceFrames: 0, sum: 0, peak: 0, sent: 0 };
    stats.frames += 1;
    stats.sum += level;
    stats.peak = Math.max(stats.peak, level);
    if (voice) stats.voiceFrames += 1;
    if (sent) stats.sent += 1;
    if (!startedAt) startedAt = now;
    if (level > DEAD_AUDIO_RMS) heardSound = true;
    if (!heardSound && !deadWarned && now - startedAt >= DEAD_AUDIO_WARN_MS) {
      deadWarned = true;
      console.warn(`[audio] ${speaker}: no sound at all in the first ${Math.round(DEAD_AUDIO_WARN_MS / 1000)}s`
        + (speaker === 'interviewer'
          ? " — check the call is playing through this computer's default output device and is not muted"
          : ' — check the microphone is connected and not muted'));
    }
    if (now - stats.since >= LEVEL_REPORT_MS) {
      console.info(`[audio] ${speaker} level`, {
        seconds: Math.round((now - stats.since) / 100) / 10,
        frames: stats.frames,
        voiceFrames: stats.voiceFrames,
        avgRms: Number((stats.sum / stats.frames).toFixed(4)),
        peakRms: Number(stats.peak.toFixed(4)),
        framesSent: stats.sent,
        connected: Boolean(ws && ws.readyState === WebSocket.OPEN && opened),
      });
      stats = null;
    }
  };

  const onFrame = (buf) => {
    if (stopped || failed) return;
    const now = performance.now();
    const voice = hasVad ? stream.hasVoiceActivity() : true;
    reportLevels(now, frameLevel(buf), voice, inTurn || voice);
    if (voice) lastVoiceAt = now;

    if (!inTurn) {
      leadIn.push(buf);
      if (leadIn.length > LEAD_IN_FRAMES) leadIn.shift();
      if (!voice) return;
      inTurn = true;
      turnStartedAt = now;
      turnTiming = { speechStartAt: now };
      leadIn.splice(0).forEach(sendFrame);
      return;
    }

    sendFrame(buf);
    const turnMs = now - turnStartedAt;
    if (now - lastVoiceAt >= END_SILENCE_MS && turnMs >= MIN_TURN_MS) {
      inTurn = false;
      commit();
    } else if (turnMs >= MAX_TURN_MS) {
      turnStartedAt = now;
      commit();
      turnTiming = { speechStartAt: now };
    }
  };

  // Words differ in more than punctuation, case, or one word.
  function differs(a, b) {
    const words = (t) => t.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean);
    const wa = words(a);
    const wb = words(b);
    const left = [...wb];
    let unmatched = 0;
    wa.forEach((w) => {
      const i = left.indexOf(w);
      if (i >= 0) left.splice(i, 1); else unmatched += 1;
    });
    return unmatched + left.length > 2;
  }

  const onMessage = (event) => {
    let msg;
    try { msg = JSON.parse(event.data); } catch { return; }
    if (msg.type === 'ready') {
      opened = true;
      if (ws) queued.splice(0).forEach((m) => ws.send(m));
      if (onReady) onReady();
    } else if (msg.type === 'committed') {
      const entry = pending.find((p) => p.itemId === undefined);
      if (!entry) return;
      if (msg.item_id) {
        entry.itemId = msg.item_id;
        // Its live words may already be a finished question.
        const question = finishedQuestion(msg.item_id);
        if (question) deliverEarly(entry, question);
      }
      else {
        // The relay dropped a turn too short to transcribe.
        pending.splice(pending.indexOf(entry), 1);
        clearTimeout(entry.timer);
        entry.deliver('', entry.timing);
      }
    } else if (msg.type === 'delta') {
      if (!interim.has(msg.item_id)) {
        // First words of a turn: the one being spoken, or else the oldest
        // committed turn still waiting for its text.
        const owner = turnTiming && !turnTiming.firstDeltaAt
          ? turnTiming
          : (pending.find((p) => !p.timing.firstDeltaAt) || {}).timing;
        if (owner) owner.firstDeltaAt = performance.now();
      }
      const words = (interim.get(msg.item_id) || '') + msg.text;
      interim.set(msg.item_id, words);
      if (onInterim) onInterim(words.trim());
      // The last words of a question usually arrive just after the turn was
      // committed, still well before its final transcript.
      const waiting = pending.find((p) => p.itemId === msg.item_id && !p.early);
      const question = waiting && finishedQuestion(msg.item_id);
      if (question) deliverEarly(waiting, question);
    } else if (msg.type === 'final') {
      settle(msg.item_id, msg.text);
    } else if (msg.type === 'error') {
      console.warn('[live-stt]', speaker, msg.code, msg.message);
      if (msg.code !== 'upstream_error') fail(Object.assign(new Error(msg.message), { code: msg.code }));
    }
  };

  const connect = async () => {
    const res = await fetch('/api/live-stt/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, speaker }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw Object.assign(new Error(data.message || 'Live transcription is not available.'), {
        status: res.status, code: data.error || `http_${res.status}`,
      });
    }
    const { ticket } = await res.json();
    if (stopped) return;
    ws = new WebSocket(`${relayUrl()}?ticket=${encodeURIComponent(ticket)}`);
    ws.binaryType = 'arraybuffer';
    ws.onmessage = onMessage;
    ws.onerror = () => fail(Object.assign(new Error('Live transcription connection failed.'), { code: 'connection_failed' }));
    ws.onclose = (event) => {
      if (!stopped) fail(Object.assign(new Error('Live transcription connection closed.'), { code: (event && event.reason) || 'connection_closed' }));
    };
  };

  function teardown() {
    if (closeTap) { closeTap(); closeTap = null; }
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      const socket = ws;
      ws = null;
      // Let the last turn's text arrive before closing.
      const close = () => { try { socket.close(); } catch {} };
      if (pending.length && socket.readyState === WebSocket.OPEN) setTimeout(close, 2500);
      else close();
    }
  }

  return {
    isLive: true,
    isSpeaking() {
      return !stopped && inTurn;
    },
    // How long the speaker has been quiet (0 while they are talking).
    quietMs() {
      return inTurn ? 0 : performance.now() - lastVoiceAt;
    },
    start() {
      stopped = false;
      failed = false;
      opened = false;
      inTurn = false;
      turnTiming = null;
      Promise.all([
        connect(),
        openPcmTap(stream, onFrame).then((close) => {
          if (stopped) close();
          else closeTap = close;
        }),
      ]).catch(fail);
    },
    stop() {
      // Finish the turn in progress so its words are not lost.
      if (inTurn && !failed) {
        inTurn = false;
        commit();
      }
      stopped = true;
      teardown();
    },
  };
}
