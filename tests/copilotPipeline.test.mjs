// Copilot question → answer pipeline, end to end with mocked transcription and
// AI calls. Uses the real modules the live hooks are built on, wired the same
// way useSpeechRecognition / useAnswerStreaming wire them. Real microphone and
// meeting-audio capture are NOT exercised here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractQuestions, createUtteranceAssembler, createQuestionDeduper,
} from '../src/lib/questionDetector.js';
import { createAnswerSlots } from '../src/lib/answerSlots.js';
import { createOrderedResults } from '../src/lib/orderedResults.js';
import { createVoiceDetector, looksLikeQuestion } from '../src/services/speechService.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makePipeline({ answer = async (q) => `answer to: ${q}`, maxConcurrent = 2 } = {}) {
  let clock = 0;
  const deduper = createQuestionDeduper(() => clock);
  const slots = createAnswerSlots(maxConcurrent);
  const cards = [];
  const channels = new Map();
  let peakRunning = 0;
  const answering = [];

  const ask = (question, speaker) => {
    const card = { id: `q${cards.length + 1}`, question, speaker, answer: null, status: 'queued' };
    cards.push(card);
    const run = (async () => {
      await slots.acquire();
      peakRunning = Math.max(peakRunning, slots.running);
      card.status = 'generating';
      try {
        card.answer = await answer(question);
        card.status = 'ready';
      } catch (err) {
        card.status = 'error';
        card.error = err.message;
      } finally {
        slots.release();
      }
    })();
    answering.push(run);
  };

  const dispatch = (questions, speaker) => {
    for (const q of questions) {
      if (deduper.isDuplicate(q)) continue;
      deduper.remember(q);
      ask(q, speaker);
    }
  };

  const channel = (speaker) => {
    if (!channels.has(speaker)) {
      const assembler = createUtteranceAssembler();
      // Same rule as useSpeechRecognition: the candidate's mic only triggers on real questions.
      const only = (qs) => (speaker === 'you' ? qs.filter((q) => looksLikeQuestion(q)) : qs);
      const ordered = createOrderedResults((r) => {
        if (r.text) dispatch(only(assembler.add(r.text, r.endOfUtterance)), speaker);
        else if (r.endOfUtterance) dispatch(only(assembler.flush()), speaker);
      });
      channels.set(speaker, { assembler, ordered });
    }
    return channels.get(speaker);
  };

  return {
    cards,
    // One audio chunk; `transcription` may be a value or a (possibly rejecting) promise.
    async chunk(speaker, transcription, { endOfUtterance = true } = {}) {
      const { ordered } = channel(speaker);
      const seq = ordered.reserve();
      let text = '';
      try { text = (await transcription) || ''; } catch { text = ''; }
      ordered.fill(seq, { text, endOfUtterance: text ? endOfUtterance : true });
    },
    silence(speaker) {
      const { ordered } = channel(speaker);
      ordered.fill(ordered.reserve(), { text: '', endOfUtterance: true });
    },
    advance(ms) { clock += ms; },
    restartRecording() { channels.clear(); },
    async settle() { await Promise.all(answering); },
    get peakRunning() { return peakRunning; },
  };
}

const TWENTY_FIVE = [
  'What is React?', 'What is a hook in React?', 'What is Python?', 'What is software testing?',
  'Explain the virtual DOM.', 'What is the difference between class and functional components?',
  'What is C language?', 'What did you work on in your last project?', 'How does garbage collection work in Java?',
  'What is a REST API?', 'Explain the CAP theorem.', 'What is Docker used for?', 'How do you handle state in Redux?',
  'What is a closure in JavaScript?', 'Describe how indexing speeds up SQL queries.', 'What is polymorphism?',
  'How would you design a URL shortener?', 'What is event bubbling?', 'Why would you choose MongoDB over PostgreSQL?',
  'What is a race condition?', 'Explain microservices architecture.', 'What is TypeScript?',
  'How does HTTPS keep data secure?', 'What is Kubernetes?', 'Tell me about a time you fixed a production bug.',
];

test('1. one question gets one answer', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is React?');
  await p.settle();
  assert.equal(p.cards.length, 1);
  assert.equal(p.cards[0].answer, 'answer to: What is React?');
});

test('2. 25 sequential distinct questions each get their own answer', async () => {
  const p = makePipeline();
  for (const q of TWENTY_FIVE) {
    await p.chunk('interviewer', q);
    p.advance(6000);
  }
  await p.settle();
  assert.equal(p.cards.length, 25);
  p.cards.forEach((c, i) => {
    assert.equal(c.question, TWENTY_FIVE[i]);
    assert.equal(c.answer, `answer to: ${TWENTY_FIVE[i]}`);
  });
});

test('3. long session: 200 questions, no count limit, history kept', async () => {
  const p = makePipeline();
  for (let i = 0; i < 200; i++) {
    await p.chunk('interviewer', `${TWENTY_FIVE[i % 25].replace(/[.?]$/, '')} in scenario ${i}?`);
    p.advance(5000);
  }
  await p.settle();
  assert.equal(p.cards.length, 200);
  assert.ok(p.cards.every((c) => c.status === 'ready'));
});

test('4. two questions in one turn become two answers; lead-in chatter is dropped', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'We will leave it. Keep it, I did it. What is virtual DOM? And how does reconciliation work?');
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['What is virtual DOM?', 'How does reconciliation work?']);
});

test('5. follow-up question after an answer is answered', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is React?');
  p.advance(8000);
  await p.chunk('interviewer', 'Why would you choose it over Angular?');
  await p.settle();
  assert.equal(p.cards.length, 2);
  assert.equal(p.cards[1].question, 'Why would you choose it over Angular?');
});

test('6. partial (mid-utterance) text waits for the final part; one question, not two', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'Can you walk me through how you designed the caching layer', { endOfUtterance: false });
  assert.equal(p.cards.length, 0);
  await p.chunk('interviewer', 'for the payments service');
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['Can you walk me through how you designed the caching layer for the payments service']);
});

test('6b. a pause mid-question is joined, never answered as a fragment', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is');
  await p.chunk('interviewer', 'component in React?');
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['What is component in React?']);
});

test('6c. a length-capped chunk that already ends a sentence is answered without waiting', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'Okay, next one. What is the difference between let and const?', { endOfUtterance: false });
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['What is the difference between let and const?']);
});

test('6d. noisy room: a length-capped question is answered once the next chunk has no words', async () => {
  const p = makePipeline();
  // The voice detector never hears a pause, so every chunk is a 5s cut (not end-of-utterance).
  await p.chunk('interviewer', 'what is the virtual DOM in React', { endOfUtterance: false });
  assert.equal(p.cards.length, 0);
  await p.chunk('interviewer', '', { endOfUtterance: false });
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['what is the virtual DOM in React']);
});

test('voice detector ignores steady background noise but still hears speech over it', () => {
  const isVoice = createVoiceDetector();
  const noisy = [];
  for (let i = 0; i < 60; i++) noisy.push(isVoice(35 + (i % 3)));      // fan/hiss at ~35, ~5s
  assert.equal(noisy.slice(-20).some(Boolean), false, 'steady noise must not count as speech');
  assert.equal(isVoice(70), true, 'speech well above the noise floor is voice');
  for (let i = 0; i < 6; i++) isVoice(36);                                // pause back to the floor
  assert.equal(isVoice(36), false, 'speech ending is detected even in a noisy room');
});

test('voice detector: quiet room, normal speech, and the floor is not dragged up by talking', () => {
  const isVoice = createVoiceDetector();
  for (let i = 0; i < 10; i++) isVoice(5);
  const talking = [];
  for (let i = 0; i < 75; i++) talking.push(isVoice(40));                // 6s of continuous speech
  assert.ok(talking.every(Boolean), 'continuous speech stays voice');
  assert.equal(isVoice(5), false);
});

test('7. duplicate transcription events produce one answer', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is a closure in JavaScript?');
  p.advance(1500);
  await p.chunk('interviewer', 'What is a closure in JavaScript?');
  await p.settle();
  assert.equal(p.cards.length, 1);
});

test('7b. questions that start the same way are not treated as duplicates', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is React?'); p.advance(9000);
  await p.chunk('interviewer', 'What is React Native?'); p.advance(9000);
  await p.chunk('interviewer', 'What is component in React?');
  await p.settle();
  assert.equal(p.cards.length, 3);
});

test('8. a failed transcription does not stop later chunks', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', Promise.reject(new Error('network down')));
  await p.chunk('interviewer', 'What is Docker used for?');
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['What is Docker used for?']);
});

test('8b. out-of-order transcriptions are applied in recorded order', async () => {
  const p = makePipeline();
  const slow = sleep(30).then(() => 'Can you explain how');
  const fast = Promise.resolve('indexing works in SQL?');
  await Promise.all([
    p.chunk('interviewer', slow, { endOfUtterance: false }),
    p.chunk('interviewer', fast),
  ]);
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['Can you explain how indexing works in SQL?']);
});

test('9. a failed answer does not stop the next question', async () => {
  let n = 0;
  const p = makePipeline({ answer: async (q) => { n += 1; if (n === 1) throw new Error('upstream'); return `ok: ${q}`; } });
  await p.chunk('interviewer', 'What is Kubernetes?'); p.advance(6000);
  await p.chunk('interviewer', 'What is TypeScript?');
  await p.settle();
  assert.equal(p.cards[0].status, 'error');
  assert.equal(p.cards[1].status, 'ready');
  assert.equal(p.cards[1].answer, 'ok: What is TypeScript?');
});

test('10. slow answers do not block detection; every question is still answered, max 2 at once', async () => {
  const p = makePipeline({ answer: async (q) => { await sleep(40); return `ok: ${q}`; } });
  for (const q of TWENTY_FIVE.slice(0, 6)) { await p.chunk('interviewer', q); p.advance(3000); }
  // All six were detected immediately even though answers are still streaming.
  assert.equal(p.cards.length, 6);
  assert.ok(p.cards.filter((c) => c.status === 'queued').length >= 3);
  await p.settle();
  assert.ok(p.cards.every((c) => c.status === 'ready'));
  assert.equal(p.peakRunning, 2);
});

test('11. audio interruption (silence) then recovery keeps detecting', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is Python?');
  for (let i = 0; i < 20; i++) p.silence('interviewer');
  p.advance(60000);
  await p.chunk('interviewer', 'What is a race condition?');
  await p.settle();
  assert.equal(p.cards.length, 2);
});

test('12. answers stay mapped to their own question when they finish out of order', async () => {
  const delays = { 'What is React?': 50, 'What is Python?': 5 };
  const p = makePipeline({ answer: async (q) => { await sleep(delays[q] || 1); return `ok: ${q}`; } });
  await p.chunk('interviewer', 'What is React?'); p.advance(5000);
  await p.chunk('interviewer', 'What is Python?');
  await p.settle();
  for (const c of p.cards) assert.equal(c.answer, `ok: ${c.question}`);
});

test('13/14. history survives stop and restart; new questions after restart are answered', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is React?');
  p.restartRecording();
  p.advance(5000);
  await p.chunk('interviewer', 'What is Python?');
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['What is React?', 'What is Python?']);
});

test('15. a repeat right after reconnecting is not answered twice', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'What is event bubbling?');
  p.restartRecording();
  p.advance(2000);
  await p.chunk('interviewer', 'What is event bubbling?');
  await p.settle();
  assert.equal(p.cards.length, 1);
});

test("questions from the candidate's side are answered, their statements are not", async () => {
  const p = makePipeline();
  await p.chunk('you', 'What is React? I used it for three years.');
  await p.chunk('you', 'I worked on the payments dashboard last year.');
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['What is React?']);
});

test('small-talk questions from either side are answered', async () => {
  const p = makePipeline();
  await p.chunk('interviewer', 'Hi, how are you?'); p.advance(5000);
  await p.chunk('interviewer', "What's up?"); p.advance(5000);
  await p.chunk('you', 'Can you hear me now?'); p.advance(5000);
  await p.chunk('interviewer', 'Good morning, how is it going?');
  await p.settle();
  assert.deepEqual(p.cards.map((c) => c.question), ['How are you?', "What's up?", 'Can you hear me now?', 'How is it going?']);
});

test('statements, sign-offs and prompt echoes are not answered', () => {
  for (const s of [
    'I worked on React for two years.', 'We use Kafka for events.', 'Thank you.', 'Hi there.',
    'Context: ### Technical software engineering interview dialogue.', 'Have a good day.',
  ]) assert.deepEqual(extractQuestions(s), [], s);
});

test('requests phrased without a question word are answered', () => {
  for (const s of [
    'Example code for useState hook.', 'Code for reversing a linked list.', 'Syntax of a for loop in Python.',
    'Different types of hooks in React.', 'Types of joins in SQL.', 'Advantages of microservices.',
    'Show me how to center a div.', 'Program to check a palindrome.',
  ]) assert.equal(extractQuestions(s).length, 1, s);
});

test('any request for information is answered, however it is worded', () => {
  for (const s of [
    'React component lifecycle and its phases.', 'The difference between SQL and NoSQL databases.',
    'Your final year project and the tech stack behind it.', 'Garbage collection in Java.',
    'Microservices versus monolith for a startup.', 'Tell the interviewer about REST APIs',
    'Something about your experience with Docker.', 'Next question, closures in JavaScript.',
  ]) assert.equal(extractQuestions(s).length, 1, s);
});

test('everyday remarks from the session are still ignored', () => {
  for (const s of ['Okay, I\'m ready.', 'Good luck.', 'I have to go, sir.', 'That\'s enough.', 'That\'s it.', 'Well...', 'Day-to-day.']) {
    assert.deepEqual(extractQuestions(s), [], s);
  }
});

test('topic lead-in is kept as part of the question', () => {
  assert.deepEqual(extractQuestions('In React, what is a hook?'), ['In React, what is a hook?']);
  assert.deepEqual(extractQuestions('Component in React.'), ['Component in React.']);
});

test('a question split by a thinking pause is answered once, as a whole', () => {
  const assembler = createUtteranceAssembler();
  // First half arrives while the speaker is still talking: held, not answered.
  assert.deepEqual(assembler.add('Can you tell me about', true, { hold: true }), []);
  assert.deepEqual(assembler.add('your last project and the challenges you faced?', true, { hold: true }), []);
  // Speaker finished their turn: the whole question comes out together.
  const questions = assembler.flush();
  assert.equal(questions.length, 1);
  assert.match(questions[0], /tell me about your last project and the challenges/i);
});

test('without a hold, a finished question is answered at once', () => {
  const assembler = createUtteranceAssembler();
  const questions = assembler.add('What is the virtual DOM in React?', true);
  assert.equal(questions.length, 1);
});

test('misheard statements from the call are not answered', () => {
  for (const s of [
    'This will be a support. Let\'s go.', 'It\'s fantastic.', 'That\'s 250 to me.',
    'Cannot even be able to laugh...', 'This is one of the most', 'Hossain Riad',
    'door opening door closing door opening', 'Let\'s take a listen.',
  ]) assert.deepEqual(extractQuestions(s), [], s);
});
