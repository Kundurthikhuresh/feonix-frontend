import { useState, useRef, useCallback, useEffect } from 'react';
import { streamAnswer } from '../services/aiService';
import { formatParakeetAnswer, formatStreamingAnswer } from '../lib/answerFormatter';

const QTYPE_LABELS = {
  code: '⚡ Code Solution',
  teleprompter: '💡 Teleprompter Hints',
  quiz: '📝 Multiple Choice Answer',
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

  const answerAbortRef = useRef(null);
  const typewriterIntervalRef = useRef(null);

  useEffect(() => () => {
    if (answerAbortRef.current) answerAbortRef.current.abort();
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
  }, []);

  const clearAnswer = useCallback(() => {
    setAnswerHtml('');
    setCueLine('');
  }, []);

  const generateAnswer = useCallback(async (question, opts = {}) => {
    const { images = [], style = 'star', transcript = '', sessionId = null, language = 'en' } = opts;

    setShowAnswerCard(true);
    if (answerAbortRef.current) answerAbortRef.current.abort();
    const controller = new AbortController();
    answerAbortRef.current = controller;

    setThinking(true);
    setAnswerHtml('');
    setCueLine(question);
    setQtype(QTYPE_LABELS[style] || '⭐ STAR Method Response');

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
        setAnswerHtml(preview);
        setThinking(false);
      }
    }, 14);

    try {
      await streamAnswer({
        question,
        images,
        answerStyle: style,
        transcript,
        sessionId,
        language,
        signal: controller.signal,
        onToken: (_chunk, full) => { textAccumulator = full; },
        onError: (message) => {
          setAnswerHtml(`<div class="parakeet-error">Stream error: ${message}</div>`);
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

      setAnswerHtml(formatParakeetAnswer(textAccumulator));
      setThinking(false);
      setQtype('Final Solution');
      return { ok: true };
    } catch (err) {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
      if (err.name === 'AbortError') {
        return { ok: true, aborted: true };
      }
      console.error('Answer fetch failed:', err);
      setThinking(false);
      setQtype('Error');
      const isRequestError = Boolean(err.status);
      const message = isRequestError ? (err.message || 'Could not fetch answer.') : 'Could not reach the answer service. Check your connection and try again.';
      const title = isRequestError ? '⚠️ Answer Request Error' : '⚠️ Connection Error';
      setAnswerHtml(
        `<div style="color: #f87171; padding: 12px; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; background: rgba(239,68,68,0.1); margin-top: 8px;"><strong>${title}</strong><br/><span style="margin-top: 4px; display: inline-block;">${message}</span></div>`
      );
      return { ok: false, message };
    }
  }, []);

  return {
    thinking,
    answerHtml,
    setAnswerHtml,
    qtype,
    cueLine,
    setCueLine,
    showAnswerCard,
    setShowAnswerCard,
    generateAnswer,
    clearAnswer,
  };
}
