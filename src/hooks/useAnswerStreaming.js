import { useState, useRef, useCallback, useEffect } from 'react';
import { streamAnswer } from '../services/aiService';
import { formatParakeetAnswer, formatStreamingAnswer, isCodingQuestion } from '../lib/answerFormatter';
import { deduplicateRepeatedPhrases } from '../services/speechService';
import { sanitizeHTML } from '../lib/sanitize';

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
  const [answerHtml, setAnswerHtml] = useState('');
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

  const answerAbortRef = useRef(null);
  const typewriterIntervalRef = useRef(null);
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

  useEffect(() => () => {
    if (answerAbortRef.current) answerAbortRef.current.abort();
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
  }, []);

  const clearAnswer = useCallback(() => {
    setAnswerHtml('');
    setCueLine('');
    setMessages([]);
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
    if (answerAbortRef.current) answerAbortRef.current.abort();
    const controller = new AbortController();
    answerAbortRef.current = controller;

    setThinking(true);
    setHasError(false);
    setAnswerHtml('');
    setCueLine(question);
    setQtype(isCode ? '⚡ Code Solution' : (QTYPE_LABELS[effectiveStyle] || '💡 Direct Answer'));

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
    const patchAssistantMessage = (patch) => {
      setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, ...patch } : m)));
    };

    let textAccumulator = '';
    let typedCharIndex = 0;

    // Reveals whatever has arrived since the last tick — the 14ms interval
    // is purely a render-rate cap (one state update per tick instead of one
    // per SSE token, which would re-render far more often than the screen
    // can even paint), not an artificial reading-speed throttle. This used
    // to cap the reveal at 4 chars/14ms (~285 chars/s) "so a fast network
    // burst doesn't dump the whole answer on screen at once" — but that's a
    // deliberate slowdown competing directly with wanting the answer fast,
    // and for a few-hundred-character answer it alone added a couple of
    // seconds after the network had already delivered everything.
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    typewriterIntervalRef.current = setInterval(() => {
      if (typedCharIndex >= textAccumulator.length) return;
      typedCharIndex = textAccumulator.length;
      const preview = formatStreamingAnswer(textAccumulator.slice(0, typedCharIndex));
      if (preview !== null) {
        const safePreview = sanitizeHTML(preview);
        setAnswerHtml(safePreview);
        setThinking(false);
        patchAssistantMessage({ html: safePreview, streaming: true });
      }
    }, 14);

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
          textAccumulator = full;
          if (full && full.trim().length > 0) {
            setThinking(false);
          }
        },
        onError: (message) => {
          const errHtml = `<div class="parakeet-error">Stream error: ${message}</div>`;
          setAnswerHtml(errHtml);
          patchAssistantMessage({ html: errHtml, streaming: false, error: true });
        },
      });

      // Let the typewriter catch up to whatever finished streaming in before
      // handing off to the final formatted render.
      await new Promise((resolve) => {
        const checkDone = setInterval(() => {
          if (typedCharIndex >= textAccumulator.length) {
            clearInterval(checkDone);
            resolve();
          }
        }, 20);
      });

      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }

      const finalHtml = sanitizeHTML(formatParakeetAnswer(textAccumulator));
      setAnswerHtml(finalHtml);
      setThinking(false);
      setQtype(isCode ? '⚡ Code Solution' : 'Final Solution');
      patchAssistantMessage({ html: finalHtml, content: textAccumulator, streaming: false });

      // Keep record in answers history for instant retrieval
      const newEntry = {
        id: Date.now(),
        question,
        answerHtml: finalHtml,
        style: effectiveStyle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAnswersHistory((prev) => {
        const filtered = prev.filter((item) => item.question !== question);
        return [newEntry, ...filtered].slice(0, 30);
      });
      setCurrentAnswerIndex(0);

      return { ok: true };
    } catch (err) {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
      if (err.name === 'AbortError') {
        // Superseded by a newer question (a fresh call aborts whatever was
        // still streaming) — finalize this message with whatever partial
        // answer it had rather than leaving it stuck on "thinking" forever
        // in the conversation list.
        const partialHtml = textAccumulator ? sanitizeHTML(formatParakeetAnswer(textAccumulator)) : '';
        patchAssistantMessage({ html: partialHtml, content: textAccumulator, streaming: false });
        return { ok: true, aborted: true };
      }
      console.error('Answer fetch failed:', err);
      setThinking(false);
      setHasError(true);
      setQtype('Error');
      const isRequestError = Boolean(err.status);
      const message = isRequestError ? (err.message || 'Could not fetch answer.') : 'Could not reach the answer service. Check your connection and try again.';
      const title = isRequestError ? '⚠️ Answer Request Error' : '⚠️ Connection Error';
      const errorHtml = `<div style="color: #f87171; padding: 12px; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; background: rgba(239,68,68,0.1); margin-top: 8px;"><strong>${title}</strong><br/><span style="margin-top: 4px; display: inline-block;">${message}</span></div>`;
      setAnswerHtml(errorHtml);
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
    answerHtml,
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
