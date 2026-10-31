// Pure question-detection rules shared by the live copilot (useSpeechRecognition)
// and the tests. No React, no browser APIs.
import {
  looksLikeQuestion, NON_QUESTION_PLEASANTRIES, OUTRO_OR_GREETING_ANYWHERE, isSilenceHallucination,
  TECHNICAL_INTERVIEW_TOPICS,
} from '../services/speechService.js';

// An utterance that stops on one of these words is an unfinished question.
// Prepositions are left out on purpose: "What did you work on?" is complete.
export const DANGLING_END = /\b(is|are|was|were|the|a|an|and|or|between|what|how|why|which|explain|describe|than|because|if|um|uh)[\s.,…-]*$/i;

// Where a question starts when something else was said first in the same
// breath ("We will leave it. Keep it. What is virtual DOM?").
const QUESTION_START = /\b(what|what's|whats|how|why|when|where|who|which|can you|could you|would you|will you|do you|did you|have you|are you|is there|explain|describe|tell me|tell us|walk me through|define|compare|difference between|write|implement|design)\b/i;

const MAX_PREFIX_WORDS = 8;

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Drops chatter in front of the question, unless that lead-in names the topic
// ("In React, what is a hook?") — then it is part of the question.
function trimToQuestionStart(sentence) {
  const m = sentence.match(QUESTION_START);
  if (!m || m.index === 0) return sentence;
  const prefix = sentence.slice(0, m.index);
  if (TECHNICAL_INTERVIEW_TOPICS.test(prefix)) return sentence;
  if (prefix.split(/\s+/).filter(Boolean).length > MAX_PREFIX_WORDS) return sentence;
  return capitalise(sentence.slice(m.index).trim());
}

// Short conversational replies that carry no question or topic.
const FILLER_START = /^(ok(ay)?|alright|all right|right|sure|yes|yeah|yep|yup|no|nope|hmm+|um+|uh+|well|so|fine|great|good|nice|cool|perfect|excellent|awesome|got it|i see|understood|thanks?|thank you|that'?s (it|all|enough|fine|great|good|right|correct|true|perfect)|let'?s (start|begin|go|get started|continue)|(good|best of) luck|welcome( to)?|sounds good|no worries|exactly|absolutely|of course|correct|wow|oh|keep it|leave it|let it be|hold on|wait|never mind|forget it|one (sec|second|minute|moment)|give me a (sec|second|minute|moment)|just a (sec|second|minute|moment))\b/i;
const MAX_FILLER_WORDS = 6;

// Talking about oneself ("I worked on…", "We use…") is usually the candidate
// saying their own answer out loud, not something to answer.
const FIRST_PERSON_START = /^(i|i'm|im|i've|i'd|i'll|we|we're|we've|we'll|my|our|me)\b/i;

// A prompt aimed at the candidate without a question word: "Your final year
// project…", "The difference between…", "Something about…", "Next question, …".
const PROMPT_START = /^(your|the difference|difference between|something about|anything about|a bit about|next question|next one|now,?\s|tell\b|share\b|talk about|give (me|us)\b)/i;

/**
 * Only something actually asked is answered: a "?", a question or request word
 * ("what", "explain", "tell me"), a coding task, a technical topic, or a prompt
 * aimed at the candidate. Any other statement is left alone: misheard
 * background speech ("This will be a support. Let's go.", "It's fantastic.")
 * was being answered as if it were a question.
 */
function isAnswerable(q) {
  if (!q) return false;
  const words = q.split(/\s+/).filter(Boolean).length;
  if (words < 2) return false;
  if (isSilenceHallucination(q) || NON_QUESTION_PLEASANTRIES.test(q) || OUTRO_OR_GREETING_ANYWHERE.test(q)) return false;
  if (looksLikeQuestion(q)) return true;
  if (words < 3) return false;
  if (FIRST_PERSON_START.test(q)) return false;
  if (words <= MAX_FILLER_WORDS && FILLER_START.test(q)) return false;
  return TECHNICAL_INTERVIEW_TOPICS.test(q) || PROMPT_START.test(q);
}

/**
 * Every distinct question in one finished utterance, in order, with lead-in
 * chatter removed. Two questions asked in one breath come back as two.
 */
export function extractQuestions(utterance) {
  const text = String(utterance || '').replace(/\s+/g, ' ').trim();
  if (!text) return [];

  const sentences = text.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
  const found = [];
  for (const sentence of sentences) {
    const q = trimToQuestionStart(sentence);
    if (isAnswerable(q)) found.push(q);
  }
  if (found.length) return found;

  // Unpunctuated speech: treat the whole utterance as one candidate.
  const whole = trimToQuestionStart(text);
  return isAnswerable(whole) ? [whole] : [];
}

// `loose` (only for a repeat within a few seconds) also treats one question
// containing the other as the same — the transcript of one utterance growing.
// Beyond that window a containment match blocked genuinely new questions that
// merely start the same way.
export function isSameQuestion(q1, q2, loose = false) {
  if (!q1 || !q2) return false;
  const n1 = q1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n2 = q2.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n1 === n2) return true;

  if (loose && n1.length > 8 && n2.length > 8) {
    if (n1.includes(n2) || n2.includes(n1)) return true;
  }

  const w1 = q1.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 1);
  const w2 = q2.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 1);
  if (w1.length === 0 || w2.length === 0) return false;

  const set1 = new Set(w1);
  const set2 = new Set(w2);
  let shared = 0;
  for (const w of set1) {
    if (set2.has(w)) shared++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union > 0 && shared / union >= (loose ? 0.70 : 0.85);
}

export const REPEAT_WINDOW_MS = 30000;
const LOOSE_WINDOW_MS = 4000;

/**
 * Remembers recently answered questions so a repeat of the same question (an
 * echo, or the interviewer restating it) is answered once. Compared against
 * every question in the window, not only the last, so two interleaved
 * questions cannot each be answered twice.
 */
export function createQuestionDeduper(now = () => Date.now()) {
  const recent = [];
  return {
    isDuplicate(q) {
      const t = now();
      while (recent.length && t - recent[0].at > REPEAT_WINDOW_MS) recent.shift();
      return recent.some((r) => isSameQuestion(q, r.text, t - r.at < LOOSE_WINDOW_MS));
    },
    remember(q) {
      recent.push({ text: q, at: now() });
    },
    reset() {
      recent.length = 0;
    },
  };
}

/**
 * Per-speaker utterance assembly. `add(text, isFinal)` returns the questions
 * that are now complete; `flush()` is called when the speaker goes quiet.
 *
 *   - mid-utterance text (a long-speech cut) just accumulates
 *   - a finished utterance ending on a dangling word waits for the rest
 *   - otherwise the utterance is complete and its questions are returned
 */
export function createUtteranceAssembler() {
  let rolling = '';

  const join = (prev, next) => {
    if (!prev) return next;
    const prevWords = prev.split(/\s+/);
    const currWords = next.split(/\s+/);
    for (let k = Math.min(prevWords.length, currWords.length, 5); k > 0; k--) {
      const tail = prevWords.slice(-k).join(' ').toLowerCase().replace(/[^a-z0-9]/g, '');
      const head = currWords.slice(0, k).join(' ').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (tail === head) return `${prev} ${currWords.slice(k).join(' ')}`.trim();
    }
    return `${prev} ${next}`.trim();
  };

  return {
    // `hold`: the speaker has not finished their turn yet (still talking, or
    // only just paused), so the text is kept and joined with what follows.
    add(text, isFinal, { hold = false } = {}) {
      const clean = String(text || '').trim();
      if (!clean) return [];
      let combined = join(rolling.trim(), clean);
      if (combined.length > 600) combined = combined.slice(-600).replace(/^\S*\s+/, '');
      rolling = combined;
      if (hold) return [];

      const endsWithQuestionMark = /\?\s*["')\]]?\s*$/.test(clean);
      // A length-capped cut (noisy room, no pause heard) that already ends a
      // sentence is complete enough to answer now rather than one chunk later.
      const endsSentence = /[.?!]\s*["')\]]?\s*$/.test(clean);
      if (!isFinal && !endsSentence) return [];
      if (!endsWithQuestionMark && DANGLING_END.test(combined)) return [];

      rolling = '';
      return extractQuestions(combined);
    },
    flush() {
      const pending = rolling.trim();
      rolling = '';
      if (!pending) return [];
      const longEnough = pending.split(/\s+/).filter(Boolean).length >= 5;
      if (!longEnough && DANGLING_END.test(pending)) return [];
      return extractQuestions(pending);
    },
    pending() {
      return rolling;
    },
  };
}
