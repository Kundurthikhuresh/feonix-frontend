// Live transcription channel (src/services/liveTranscriber.js) with the
// browser parts replaced: audio frames are pushed by the test, the WebSocket
// and ticket request are fakes, and time is a test clock. The real OpenAI
// connection is exercised separately (see the final report), not here.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createLiveTranscriber, liveReconnectDelay } from '../src/services/liveTranscriber.js';
import { traceQuestion, takeQuestionTrace, reportAnswerLatency } from '../src/lib/latencyTrace.js';

let clock = 0;
performance.now = () => clock;

const sockets = [];
const framers = [];
let ticketResponse = { ok: true, status: 200, body: { ticket: 't' } };

class FakeSocket {
  static OPEN = 1;
  constructor(url) {
    this.url = url;
    this.readyState = 1;
    this.sent = [];
    sockets.push(this);
  }
  send(m) { this.sent.push(m); }
  close() { this.readyState = 3; }
  // Server → browser message.
  emit(msg) { this.onmessage({ data: JSON.stringify(msg) }); }
  commits() { return this.sent.filter((m) => typeof m === 'string' && JSON.parse(m).type === 'commit').length; }
  audioFrames() { return this.sent.filter((m) => typeof m !== 'string').length; }
}
globalThis.WebSocket = FakeSocket;
globalThis.AudioWorkletNode = class {
  constructor() { this.port = { onmessage: null }; framers.push(this); }
  connect() {}
  disconnect() {}
};
globalThis.window = {
  location: { protocol: 'http:', hostname: 'localhost' },
  AudioContext: class {
    constructor() { this.state = 'running'; this.audioWorklet = { addModule: async () => {} }; this.destination = {}; }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createGain() { return { gain: {}, connect() {}, disconnect() {} }; }
    close() { return Promise.resolve(); }
  },
};
globalThis.fetch = async () => ({
  ok: ticketResponse.ok,
  status: ticketResponse.status,
  json: async () => ticketResponse.body,
});

const settle = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  clock = 1000;
  sockets.length = 0;
  framers.length = 0;
  ticketResponse = { ok: true, status: 200, body: { ticket: 't' } };
});

// Opens a channel and returns helpers to push 100 ms frames of voice/silence.
async function openChannel(handlers = {}) {
  let voice = false;
  const stream = { hasVoiceActivity: () => voice };
  const turns = [];
  const failures = [];
  let ready = 0;
  const live = createLiveTranscriber(stream, {
    sessionId: 1,
    speaker: 'interviewer',
    onTurn: () => {
      const turn = { text: null, timing: null };
      turns.push(turn);
      return (text, timing) => { turn.text = text; turn.timing = timing; };
    },
    onReady: () => { ready += 1; },
    onFailure: (err) => failures.push(err),
    ...handlers,
  });
  live.start();
  await settle();
  await settle();
  const ws = sockets[sockets.length - 1];
  ws.emit({ type: 'ready' });
  const frame = (isVoice) => {
    voice = isVoice;
    clock += 100;
    framers[framers.length - 1].port.onmessage({ data: new ArrayBuffer(4800) });
  };
  return { live, ws, turns, failures, frame, ready: () => ready };
}

test('a spoken turn is committed after 250 ms of quiet and gets its text with every timing', async () => {
  const ch = await openChannel();
  assert.equal(ch.ready(), 1);
  for (let i = 0; i < 5; i++) ch.frame(false); // room tone before speech
  for (let i = 0; i < 20; i++) {
    ch.frame(true);
    if (i === 8) ch.ws.emit({ type: 'delta', item_id: 'i1', text: 'Can you' }); // words while talking
  }
  for (let i = 0; i < 2; i++) ch.frame(false);
  assert.equal(ch.ws.commits(), 0, 'still within the silence wait');
  ch.frame(false);
  assert.equal(ch.ws.commits(), 1, 'committed once the quiet reached 250 ms');
  assert.equal(ch.turns.length, 1);

  ch.ws.emit({ type: 'committed', item_id: 'i1' });
  clock += 700;
  ch.ws.emit({ type: 'final', item_id: 'i1', text: 'Can you design a rate limiter?' });
  const { text, timing } = ch.turns[0];
  assert.equal(text, 'Can you design a rate limiter?');
  assert.ok(timing.speechStartAt < timing.firstDeltaAt, 'first words arrived during speech');
  assert.ok(timing.firstDeltaAt < timing.lastVoiceAt);
  assert.equal(timing.commitAt - timing.lastVoiceAt, 300);
  assert.equal(timing.finalAt - timing.commitAt, 700);
});

test('silence is not sent: only speech plus a 300 ms lead-in and the silence wait', async () => {
  const ch = await openChannel();
  for (let i = 0; i < 30; i++) ch.frame(false);
  assert.equal(ch.ws.audioFrames(), 0, 'nothing sent while nobody talks');
  for (let i = 0; i < 10; i++) ch.frame(true);
  for (let i = 0; i < 3; i++) ch.frame(false);
  // 3 lead-in frames (the last of them is where speech was detected),
  // the 9 further voice frames, and the 3 quiet frames of the silence wait.
  assert.equal(ch.ws.audioFrames(), 3 + 9 + 3);
  for (let i = 0; i < 30; i++) ch.frame(false);
  assert.equal(ch.ws.audioFrames(), 3 + 9 + 3, 'nothing more after the turn ended');
});

test('two questions in a row are two turns, delivered in order', async () => {
  const ch = await openChannel();
  for (const id of ['a', 'b']) {
    for (let i = 0; i < 8; i++) ch.frame(true);
    for (let i = 0; i < 6; i++) ch.frame(false);
    ch.ws.emit({ type: 'committed', item_id: id });
  }
  assert.equal(ch.turns.length, 2);
  ch.ws.emit({ type: 'final', item_id: 'b', text: 'second' });
  ch.ws.emit({ type: 'final', item_id: 'a', text: 'first' });
  assert.deepEqual(ch.turns.map((t) => t.text), ['first', 'second']);
});

test('a turn too short to transcribe is settled empty instead of waiting', async () => {
  const ch = await openChannel();
  for (let i = 0; i < 5; i++) ch.frame(true);
  for (let i = 0; i < 6; i++) ch.frame(false);
  ch.ws.emit({ type: 'committed', item_id: null });
  assert.equal(ch.turns[0].text, '');
});

test('a lost connection settles waiting turns empty (never answered twice) and reports why', async () => {
  const ch = await openChannel();
  for (let i = 0; i < 8; i++) ch.frame(true);
  for (let i = 0; i < 6; i++) ch.frame(false);
  ch.ws.emit({ type: 'committed', item_id: 'x' });
  ch.ws.onclose({ reason: '' });
  assert.equal(ch.turns[0].text, '');
  assert.equal(ch.failures.length, 1);
  assert.equal(ch.failures[0].code, 'connection_closed');
  ch.ws.emit({ type: 'final', item_id: 'x', text: 'late text' });
  assert.equal(ch.turns[0].text, '', 'a late final after the failure is ignored');
});

test('an upstream hiccup is not fatal; a quota stop is', async () => {
  const ch = await openChannel();
  ch.ws.emit({ type: 'error', code: 'upstream_error', message: 'x' });
  assert.equal(ch.failures.length, 0);
  ch.ws.emit({ type: 'error', code: 'quota_exhausted', message: 'Monthly limit' });
  assert.equal(ch.failures[0].code, 'quota_exhausted');
});

test('a refused ticket reports the server reason (session ended → no reconnect)', async () => {
  ticketResponse = { ok: false, status: 410, body: { error: 'session_ended', message: 'This session has ended.' } };
  const failures = [];
  const live = createLiveTranscriber({ hasVoiceActivity: () => false }, { speaker: 'you', onFailure: (e) => failures.push(e) });
  live.start();
  await settle();
  await settle();
  assert.equal(failures[0].code, 'session_ended');
  assert.equal(liveReconnectDelay(failures[0].code, 0), null);
});

test('stopping mid-sentence commits the words already spoken', async () => {
  const ch = await openChannel();
  for (let i = 0; i < 8; i++) ch.frame(true);
  ch.live.stop();
  assert.equal(ch.ws.commits(), 1);
  assert.equal(ch.turns.length, 1);
});

test('reconnect rule: three tries with growing waits, then clips; fatal codes never retry', () => {
  assert.equal(liveReconnectDelay('connection_closed', 0), 500);
  assert.equal(liveReconnectDelay('upstream_unavailable', 1), 1500);
  assert.equal(liveReconnectDelay('connection_failed', 2), 4000);
  assert.equal(liveReconnectDelay('connection_failed', 3), null);
  for (const code of ['quota_exhausted', 'session_ended', 'live_off', 'http_401', 'too_many_channels']) {
    assert.equal(liveReconnectDelay(code, 0), null, code);
  }
});

test('latency report: every stage, the headline number and the slowest stage', () => {
  const logged = [];
  const info = console.info;
  console.info = (...args) => logged.push(args);
  try {
    clock = 5000;
    traceQuestion('Q?', { speechStartAt: 1000, firstDeltaAt: 1400, lastVoiceAt: 4000, commitAt: 4600, finalAt: 4900 });
    const trace = takeQuestionTrace('Q?');
    assert.equal(takeQuestionTrace('Q?'), null, 'taken once');
    reportAnswerLatency(trace, { requestAt: 5010, firstTokenAt: 6200, doneAt: 9000 });
  } finally {
    console.info = info;
  }
  const [, r] = logged[0];
  assert.equal(r.speechToFirstWords, 400);
  assert.equal(r.silenceWait, 600);
  assert.equal(r.finalTranscript, 300);
  assert.equal(r.questionDetection, 100);
  assert.equal(r.answerQueue, 10);
  assert.equal(r.firstToken, 1190);
  assert.equal(r.endOfSpeechToFirstToken, 2200);
  assert.equal(r.slowest, 'firstToken');
});

test('a question whose live words end in "?" is answered from those words once committed, without waiting for its final', async () => {
  const revisions = [];
  const ch = await openChannel({ onRevision: (text) => revisions.push(text) });
  for (let i = 0; i < 10; i++) {
    ch.frame(true);
    if (i === 3) ch.ws.emit({ type: 'delta', item_id: 'q1', text: 'What is a' });
    if (i === 9) ch.ws.emit({ type: 'delta', item_id: 'q1', text: ' closure?' });
  }
  ch.frame(false); ch.frame(false);
  assert.equal(ch.ws.commits(), 0, 'not before 250 ms of quiet');
  ch.frame(false);
  assert.equal(ch.ws.commits(), 1, 'committed once the quiet reached 250 ms');
  assert.equal(ch.turns[0].text, null, 'not before the relay confirms which item it is');
  ch.ws.emit({ type: 'committed', item_id: 'q1' });
  assert.equal(ch.turns[0].text, 'What is a closure?', 'handed on without waiting for the final');
  assert.equal(ch.turns[0].timing.early, true);
  assert.equal(ch.turns[0].timing.commitAt - ch.turns[0].timing.lastVoiceAt, 300);
  ch.ws.emit({ type: 'final', item_id: 'q1', text: 'What is a closure?' });
  assert.deepEqual(revisions, [], 'same final: nothing more');
});

test('a final that reads differently from the early words is handed on as a revision', async () => {
  const revisions = [];
  const ch = await openChannel({ onRevision: (text, timing) => revisions.push({ text, timing }) });
  for (let i = 0; i < 8; i++) {
    ch.frame(true);
    if (i === 6) ch.ws.emit({ type: 'delta', item_id: 'q2', text: 'Can you explain react hooks?' });
  }
  for (let i = 0; i < 3; i++) ch.frame(false);
  ch.ws.emit({ type: 'committed', item_id: 'q2' });
  assert.equal(ch.turns[0].text, 'Can you explain react hooks?');
  ch.ws.emit({ type: 'final', item_id: 'q2', text: 'Can you explain React hooks and the rules for using them?' });
  assert.equal(revisions.length, 1);
  assert.equal(revisions[0].timing.revised, true);
});

test('a statement-style question waits for its final transcript', async () => {
  const ch = await openChannel();
  for (let i = 0; i < 8; i++) {
    ch.frame(true);
    if (i === 5) ch.ws.emit({ type: 'delta', item_id: 's1', text: 'Tell me about yourself.' });
  }
  for (let i = 0; i < 2; i++) ch.frame(false);
  assert.equal(ch.ws.commits(), 0);
  ch.frame(false);
  assert.equal(ch.ws.commits(), 1);
  assert.equal(ch.turns[0].text, null, 'waits for the final');
  ch.ws.emit({ type: 'committed', item_id: 's1' });
  ch.ws.emit({ type: 'final', item_id: 's1', text: 'Tell me about yourself.' });
  assert.equal(ch.turns[0].text, 'Tell me about yourself.');
  assert.ok(!ch.turns[0].timing.early);
});

test("late words of the previous turn are not taken as the new turn's question", async () => {
  const ch = await openChannel();
  for (let i = 0; i < 6; i++) {
    ch.frame(true);
    if (i === 2) ch.ws.emit({ type: 'delta', item_id: 'old', text: 'So I worked on' });
  }
  for (let i = 0; i < 6; i++) ch.frame(false); // first turn committed (no "?")
  for (let i = 0; i < 6; i++) {
    ch.frame(true);
    if (i === 1) ch.ws.emit({ type: 'delta', item_id: 'old', text: ' payments, right?' }); // late, previous turn
  }
  for (let i = 0; i < 3; i++) ch.frame(false);
  assert.equal(ch.ws.commits(), 2);
  assert.equal(ch.turns.length, 2);
  assert.equal(ch.turns[1].text, null, 'the old turn\'s "?" is not taken as the new turn\'s question');
});

test('when the "?" arrives just after the commit, the question is handed on then, before its final', async () => {
  const ch = await openChannel();
  for (let i = 0; i < 8; i++) {
    ch.frame(true);
    if (i === 4) ch.ws.emit({ type: 'delta', item_id: 'q3', text: 'How do you scale a' });
  }
  for (let i = 0; i < 3; i++) ch.frame(false); // no "?" yet: committed after 250 ms of quiet
  assert.equal(ch.ws.commits(), 1);
  assert.equal(ch.turns[0].text, null);
  ch.ws.emit({ type: 'committed', item_id: 'q3' });
  clock += 150;
  ch.ws.emit({ type: 'delta', item_id: 'q3', text: ' database?' });
  assert.equal(ch.turns[0].text, 'How do you scale a database?', 'handed on from the live words');
  assert.equal(ch.turns[0].timing.finalAt - ch.turns[0].timing.commitAt, 150);
  clock += 600;
  ch.ws.emit({ type: 'final', item_id: 'q3', text: 'How do you scale a database?' });
  assert.equal(ch.turns.length, 1);
});

test("late words of one turn arriving during the next are never taken as the next turn's", async () => {
  const ch = await openChannel();
  for (let i = 0; i < 6; i++) ch.frame(true);
  for (let i = 0; i < 3; i++) ch.frame(false); // turn A committed, not yet confirmed
  for (let i = 0; i < 6; i++) {
    ch.frame(true);
    if (i === 1) ch.ws.emit({ type: 'delta', item_id: 'A', text: 'What is the difference?' }); // A's words, late
  }
  for (let i = 0; i < 3; i++) ch.frame(false); // turn B committed
  ch.ws.emit({ type: 'committed', item_id: 'A' });
  ch.ws.emit({ type: 'committed', item_id: 'B' });
  assert.equal(ch.turns[0].text, 'What is the difference?', 'A gets its own words');
  assert.equal(ch.turns[1].text, null, 'B waits for its own words');
  ch.ws.emit({ type: 'final', item_id: 'B', text: 'between let and const in JavaScript' });
  assert.equal(ch.turns[1].text, 'between let and const in JavaScript');
});
