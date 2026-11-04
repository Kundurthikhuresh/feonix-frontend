/**
 * Latency trace for the live copilot: how long each stage took, from the
 * interviewer finishing a question to the answer's first words on screen.
 *
 * Timestamps come from performance.now() (one clock for every stage). Each
 * spoken turn's timings are handed over with its transcript; when that turn
 * becomes a question they are kept under the question text until its answer
 * starts, then one "[latency]" line is logged per answer. Only timings and
 * lengths are logged, never what was said.
 */

const MAX_PENDING = 20;
const pending = new Map(); // question text → timings of the turn it came from

const ms = (from, to) => (Number.isFinite(from) && Number.isFinite(to) ? Math.round(to - from) : null);

export function markCaptureStarted(channels) {
  console.info('[latency] audio capture started', { channels, at: Math.round(performance.now()) });
}

/** Called when a question is handed on for answering. */
export function traceQuestion(question, turn) {
  pending.set(question, { ...(turn || {}), questionAt: performance.now() });
  while (pending.size > MAX_PENDING) pending.delete(pending.keys().next().value);
}

/** The timings recorded for a question, if it came from speech (once). */
export function takeQuestionTrace(question) {
  const trace = pending.get(question) || null;
  pending.delete(question);
  return trace;
}

/**
 * Logs every stage of one answer and names the slowest one. `answer` holds
 * requestAt, firstTokenAt and doneAt (performance.now()).
 */
export function reportAnswerLatency(trace, answer, extra = {}) {
  if (!trace) return;
  const stages = {
    // Speaking → first live words back from the transcriber.
    speechToFirstWords: ms(trace.speechStartAt, trace.firstDeltaAt),
    // Speaker stopped → voice detector closed the turn (silence wait).
    silenceWait: ms(trace.lastVoiceAt, trace.commitAt),
    // Turn closed → final transcript received.
    finalTranscript: ms(trace.commitAt, trace.finalAt),
    // Final transcript → recognised as a finished question.
    questionDetection: ms(trace.finalAt, trace.questionAt),
    // Question → answer request sent (waiting for a free stream).
    answerQueue: ms(trace.questionAt, answer.requestAt),
    // Request → first answer token (network + GPT-4o).
    firstToken: ms(answer.requestAt, answer.firstTokenAt),
    // First token → answer complete.
    answerStream: ms(answer.firstTokenAt, answer.doneAt),
  };
  const timed = ['silenceWait', 'finalTranscript', 'questionDetection', 'answerQueue', 'firstToken']
    .filter((k) => stages[k] !== null);
  const slowest = timed.reduce((a, b) => (stages[b] > stages[a] ? b : a), timed[0] || null);
  console.info('[latency] answer', {
    ...extra,
    // The headline number: interviewer stopped talking → first answer words.
    endOfSpeechToFirstToken: ms(trace.lastVoiceAt, answer.firstTokenAt),
    ...stages,
    slowest,
  });
}
