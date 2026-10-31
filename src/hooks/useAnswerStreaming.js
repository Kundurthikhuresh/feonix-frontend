import { useState, useRef, useCallback, useEffect } from 'react';
import { streamAnswer } from '../services/aiService';
import { formatParakeetAnswer, formatStreamingAnswer, isCodingQuestion } from '../lib/answerFormatter';
import { deduplicateRepeatedPhrases } from '../services/speechService';
import { sanitizeHTML } from '../lib/sanitize';
import { createAnswerSlots } from '../lib/answerSlots';

const MAX_CONCURRENT_ANSWERS = 2;

const QTYPE_LABELS = {
  code: '⚡ Code Solution',
  teleprompter: '💡 Teleprompter Hints',
  quiz: '📝 Multiple Choice Answer',
  star: '⭐ STAR Method Response',
};

/**
 * Owns one streamed answer at a time: kicks off the SSE request, reveals it
 * with the same typewriter cadence the HUD has always used, and — because
 * the fully-tagged [TYPE]/[POINTS]/[ANSWER] text isn't safe to re-parse on
 * every partial chunk (that's what caused the tag-flicker bug) — only shows
 * anything once [ANSWER] itself has fully streamed in, formatting the final
 * polished bullets+prose layout once the whole response is in hand.
 */
export function useAnswerStreaming() {
  const [thinking, setThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [answerHtml, setAnswerHtml] = useState('');
  // Raw model text of the answer on screen, so the answer card can lay out
  // just the spoken answer instead of re-parsing pre-rendered HTML.
  const [answerText, setAnswerText] = useState('');
  const [qtype, setQtype] = useState('');
  const [cueLine, setCueLine] = useState('');
  const [showAnswerCard, setShowAnswerCard] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [answersHistory, setAnswersHistory] = useState([]);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);
  // The ChatGPT-style conversation: every turn appends a user message and an
  // assistant message here and neither is ever removed or overwritten by a
  // later turn — this is what the persistent chat view renders from. The
  // single-slot state above (cueLine/answerHtml/hasError/...) is kept exactly
  // as it was for the components that already depend on it (Regenerate/
  // Shorten/Expand, the Answers history tab) and always mirrors the latest
  // turn, same as before.
  const [messages, setMessages] = useState([]);

  const activeControllersRef = useRef(new Map());
  const activeIntervalsRef = useRef(new Map());
  const activeCountRef = useRef(0);
  // Remembers exactly what produced the answer on screen, so Regenerate/
  // Shorten/Expand/Retry can re-run the same call with only `action` swapped
  // out, instead of the caller having to re-thread question/images/style.
  const lastCallRef = useRef(null);
  // Monotonic counter for message ids — Date.now() alone can collide when a
  // user+assistant pair is created in the same millisecond.
  const messageSeqRef = useRef(0);
  const nextMessageId = () => {
    messageSeqRef.current += 1;
    return `m-${Date.now()}-${messageSeqRef.current}`;
  };
  // Ids of the most recent turn, so Regenerate/Shorten/Expand/Retry (all of
  // which redo the same question, never ask a new one) can update that turn
  // in place instead of appending a confusing duplicate question bubble.
  const lastUserMessageIdRef = useRef(null);
  const lastAssistantMessageIdRef = useRef(null);

  // Every question is answered in full; at most MAX_CONCURRENT_ANSWERS stream
  // at once and the rest wait their turn (see createAnswerSlots).
  const slotsRef = useRef(null);
  if (!slotsRef.current) slotsRef.current = createAnswerSlots(MAX_CONCURRENT_ANSWERS);

  useEffect(() => () => {
    activeControllersRef.current.forEach((c) => {
      try { c.abort(); } catch {}
    });
    activeControllersRef.current.clear();
    activeIntervalsRef.current.forEach((t) => {
      try { clearInterval(t); } catch {}
    });
    activeIntervalsRef.current.clear();
  }, []);

  const clearAnswer = useCallback(() => {
    activeControllersRef.current.forEach((c) => {
      try { c.abort(); } catch {}
    });
    activeControllersRef.current.clear();
    activeIntervalsRef.current.forEach((t) => {
      try { clearInterval(t); } catch {}
    });
    activeIntervalsRef.current.clear();
    activeCountRef.current = 0;
    setThinking(false);
    setIsStreaming(false);
    setAnswerHtml('');
    setAnswerText('');
    setCueLine('');
    setMessages([]);
    setAnswersHistory([]);
    lastUserMessageIdRef.current = null;
    lastAssistantMessageIdRef.current = null;
  }, []);

  const generateAnswer = useCallback(async (rawQuestion, opts = {}) => {
    const question = deduplicateRepeatedPhrases(rawQuestion) || rawQuestion;
    const { images = [], style = 'star', transcript = '', sessionId = null, language = 'en', action = 'answer', replaceLast = false } = opts;
    const isCode = isCodingQuestion(question) || style === 'code';
    const effectiveStyle = isCode && style !== 'teleprompter' && style !== 'quiz' ? 'code' : style;
    lastCallRef.current = { question, opts: { ...opts, style: effectiveStyle } };

    setShowAnswerCard(true);

    // A brand-new question appends a fresh turn to the conversation — never
    // replaces what's already there. Regenerate/Shorten/Expand/Retry redo
    // the same question rather than asking a new one, so those instead
    // reset the existing last turn's assistant message in place; otherwise
    // clicking "Shorten" would show the question a second time.
    const turnCreatedAt = new Date().toISOString();
    let userMessageId;
    let assistantMessageId;
    if (replaceLast && lastAssistantMessageIdRef.current) {
      userMessageId = lastUserMessageIdRef.current;
      assistantMessageId = lastAssistantMessageIdRef.current;
      const prevCtrl = activeControllersRef.current.get(assistantMessageId);
      if (prevCtrl) {
        try { prevCtrl.abort(); } catch {}
        activeControllersRef.current.delete(assistantMessageId);
      }
      const prevInt = activeIntervalsRef.current.get(assistantMessageId);
      if (prevInt) {
        clearInterval(prevInt);
        activeIntervalsRef.current.delete(assistantMessageId);
      }
      setMessages((prev) => prev.map((m) => (
        m.id === assistantMessageId
          ? { ...m, content: '', html: '', streaming: true, error: false }
          : m
      )));
    } else {
      userMessageId = nextMessageId();
      assistantMessageId = nextMessageId();
      lastUserMessageIdRef.current = userMessageId;
      lastAssistantMessageIdRef.current = assistantMessageId;
      setMessages((prev) => [
        ...prev,
        // `images` is kept on the message itself — once the compose area
        // clears after sending, this is the only remaining record of what
        // was actually attached to this question, so the conversation can
        // still show it later even though the live "staged" copy is gone.
        { id: userMessageId, role: 'user', content: question, images, createdAt: turnCreatedAt },
        { id: assistantMessageId, role: 'assistant', content: '', html: '', createdAt: turnCreatedAt, streaming: true, error: false },
      ]);
    }

    const controller = new AbortController();
    activeControllersRef.current.set(assistantMessageId, controller);
    activeCountRef.current += 1;

    setThinking(true);
    setIsStreaming(true);
    setHasError(false);
    setAnswerHtml('');
    setAnswerText('');
    setCueLine(question);
    setQtype(isCode ? '⚡ Code Solution' : (QTYPE_LABELS[effectiveStyle] || '💡 Direct Answer'));

    const patchAssistantMessage = (patch) => {
      setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, ...patch } : m)));
    };

    let textAccumulator = '';
    let typedCharIndex = 0;
    let isStreamActive = true;

    // ChatGPT-Style Smooth Character Generation:
    // Characters stream in dynamically and smoothly without lag or chunk jumps.
    const localInterval = setInterval(() => {
      if (typedCharIndex >= textAccumulator.length) {
        if (!isStreamActive) {
          clearInterval(localInterval);
          activeIntervalsRef.current.delete(assistantMessageId);
        }
        return;
      }

      typedCharIndex = textAccumulator.length;
      const preview = formatStreamingAnswer(textAccumulator);
      if (preview !== null) {
        const safePreview = sanitizeHTML(preview);
        patchAssistantMessage({ html: safePreview, streaming: true });
        if (lastAssistantMessageIdRef.current === assistantMessageId) {
          setAnswerHtml(safePreview);
          setAnswerText(textAccumulator);
          setThinking(false);
        }
      }
    }, 16);
    activeIntervalsRef.current.set(assistantMessageId, localInterval);

    const t0 = performance.now();
    let tFirstToken = null;
    const slots = slotsRef.current;
    console.info('[copilot] answer queued', { answerId: assistantMessageId, running: slots.running, waiting: slots.waiting });
    try {
      const gotSlot = await slots.acquire(controller.signal);
      const queuedMs = Math.round(performance.now() - t0);
      if (!gotSlot) {
        const abortErr = new Error('Answer cancelled before it started.');
        abortErr.name = 'AbortError';
        throw abortErr;
      }
      try {
      await streamAnswer({
        question,
        images,
        answerStyle: effectiveStyle,
        transcript,
        sessionId,
        language,
        action,
        signal: controller.signal,
        onToken: (_chunk, full) => {
          if (tFirstToken === null) tFirstToken = performance.now();
          textAccumulator = full;
          if (full && full.trim().length > 0) {
            typedCharIndex = full.length;
            const preview = formatStreamingAnswer(full);
            if (preview !== null) {
              const safePreview = sanitizeHTML(preview);
              patchAssistantMessage({ html: safePreview, streaming: true });
              if (lastAssistantMessageIdRef.current === assistantMessageId) {
                setAnswerHtml(safePreview);
                setAnswerText(full);
                setThinking(false);
              }
            }
          }
        },
      });
      } finally {
        slots.release();
      }
      console.info('[copilot] answer done', {
        answerId: assistantMessageId,
        queuedMs,
        firstTokenMs: tFirstToken === null ? null : Math.round(tFirstToken - t0),
        totalMs: Math.round(performance.now() - t0),
        chars: textAccumulator.length,
      });

      isStreamActive = false;

      // Let the character streamer catch up smoothly to whatever finished streaming in
      await new Promise((resolve) => {
        const checkDone = setInterval(() => {
          if (typedCharIndex >= textAccumulator.length) {
            clearInterval(checkDone);
            resolve();
          }
        }, 16);
      });

      clearInterval(localInterval);
      activeIntervalsRef.current.delete(assistantMessageId);
      activeControllersRef.current.delete(assistantMessageId);
      activeCountRef.current = Math.max(0, activeCountRef.current - 1);

      const finalHtml = sanitizeHTML(formatParakeetAnswer(textAccumulator));
      patchAssistantMessage({ html: finalHtml, content: textAccumulator, streaming: false, error: false });

      if (lastAssistantMessageIdRef.current === assistantMessageId) {
        setAnswerHtml(finalHtml);
        setAnswerText(textAccumulator);
        setThinking(false);
        setIsStreaming(activeCountRef.current > 0);
        setQtype(isCode ? '⚡ Code Solution' : 'Final Solution');
      }

      // Keep record in answers history for instant retrieval
      const newEntry = {
        id: Date.now(),
        question,
        answerHtml: finalHtml,
        answerText: textAccumulator,
        style: effectiveStyle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAnswersHistory((prev) => {
        const filtered = prev.filter((item) => item.question !== question);
        return [newEntry, ...filtered].slice(0, 100);
      });
      setCurrentAnswerIndex(0);

      return { ok: true };
    } catch (err) {
      clearInterval(localInterval);
      activeIntervalsRef.current.delete(assistantMessageId);
      activeControllersRef.current.delete(assistantMessageId);
      activeCountRef.current = Math.max(0, activeCountRef.current - 1);

      if (lastAssistantMessageIdRef.current === assistantMessageId) {
        setIsStreaming(activeCountRef.current > 0);
        setThinking(false);
      }

      if (err.name === 'AbortError') {
        // Finalize this message with whatever partial answer it had rather than leaving it stuck
        const partialHtml = textAccumulator ? sanitizeHTML(formatParakeetAnswer(textAccumulator)) : '';
        patchAssistantMessage({ html: partialHtml, content: textAccumulator, streaming: false });
        if (textAccumulator) {
          const newEntry = {
            id: Date.now(),
            question,
            answerHtml: partialHtml,
            answerText: textAccumulator,
            style: effectiveStyle,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setAnswersHistory((prev) => {
            const filtered = prev.filter((item) => item.question !== question);
            return [newEntry, ...filtered].slice(0, 100);
          });
        }
        return { ok: true, aborted: true };
      }
      console.error('[copilot] answer failed', { answerId: assistantMessageId, status: err.status || null, message: err.message });
      setHasError(true);
      setQtype('Error');
      const isRequestError = Boolean(err.status);
      const rawMsg = err.message || '';
      const isFetchFailed = /fetch failed|econnrefused|failed to fetch/i.test(rawMsg);
      const message = isFetchFailed
        ? 'Backend service connection was temporarily interrupted. The dev server may be reloading.'
        : (isRequestError || err.isStreamError ? (rawMsg || 'Could not fetch answer.') : 'Could not reach the answer service. Check your connection.');
      const title = isFetchFailed ? '⚠️ Connection Interrupted' : (isRequestError ? '⚠️ Answer Request Error' : '⚠️ Connection Error');
      const errorHtml = `<div style="color: #f87171; padding: 12px; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; background: rgba(239,68,68,0.1); margin-top: 8px;"><strong>${title}</strong><br/><span style="margin-top: 4px; display: inline-block;">${message}</span></div>`;
      if (lastAssistantMessageIdRef.current === assistantMessageId) {
        setAnswerHtml(errorHtml);
        setAnswerText('');
      }
      patchAssistantMessage({ html: errorHtml, streaming: false, error: true });
      return { ok: false, message };
    }
  }, []);

  const selectHistoryAnswer = useCallback((indexOrId) => {
    setAnswersHistory((currentHistory) => {
      let target = null;
      let idx = -1;
      if (typeof indexOrId === 'number') {
        idx = indexOrId;
        target = currentHistory[indexOrId];
      } else {
        idx = currentHistory.findIndex((a) => a.id === indexOrId);
        target = currentHistory[idx];
      }
      if (target) {
        setCueLine(target.question);
        setAnswerHtml(target.answerHtml);
        setAnswerText(target.answerText || '');
        setCurrentAnswerIndex(idx);
        setShowAnswerCard(true);
      }
      return currentHistory;
    });
  }, []);

  const prevAnswer = useCallback(() => {
    if (currentAnswerIndex < answersHistory.length - 1) {
      const nextIdx = currentAnswerIndex + 1;
      const target = answersHistory[nextIdx];
      if (target) {
        setCueLine(target.question);
        setAnswerHtml(target.answerHtml);
        setAnswerText(target.answerText || '');
        setCurrentAnswerIndex(nextIdx);
        setShowAnswerCard(true);
      }
    }
  }, [currentAnswerIndex, answersHistory]);

  const nextAnswer = useCallback(() => {
    if (currentAnswerIndex > 0) {
      const prevIdx = currentAnswerIndex - 1;
      const target = answersHistory[prevIdx];
      if (target) {
        setCueLine(target.question);
        setAnswerHtml(target.answerHtml);
        setAnswerText(target.answerText || '');
        setCurrentAnswerIndex(prevIdx);
        setShowAnswerCard(true);
      }
    }
  }, [currentAnswerIndex, answersHistory]);

  // Re-runs the call that produced the answer on screen, optionally with a
  // different `action` (shorten/deepen/answer) — the shared path behind
  // Regenerate, Shorten, Expand and the error card's Retry button.
  const rerun = useCallback((overrides = {}) => {
    const last = lastCallRef.current;
    if (!last) return undefined;
    return generateAnswer(last.question, { ...last.opts, ...overrides, replaceLast: true });
  }, [generateAnswer]);

  return {
    thinking,
    isStreaming,
    isAnswering: Boolean(thinking || isStreaming),
    answerHtml,
    answerText,
    setAnswerHtml,
    qtype,
    cueLine,
    setCueLine,
    showAnswerCard,
    setShowAnswerCard,
    hasError,
    answersHistory,
    setAnswersHistory,
    currentAnswerIndex,
    selectHistoryAnswer,
    prevAnswer,
    nextAnswer,
    generateAnswer,
    rerun,
    clearAnswer,
    messages,
  };
}
