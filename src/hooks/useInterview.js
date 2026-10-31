import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useAnswerStreaming } from './useAnswerStreaming';
import { formatParakeetAnswer } from '../lib/answerFormatter';
import { sanitizeHTML } from '../lib/sanitize';
import { warmAnswer } from '../services/aiService';
import { isSilenceHallucination, NON_QUESTION_PLEASANTRIES, OUTRO_OR_GREETING_ANYWHERE } from '../services/speechService';

/**
 * The interview domain, composed from speech capture + answer streaming:
 * loads/starts/ends the session, runs the countdown, tracks credits, and
 * wires "a question was heard" to "generate an answer" when Auto Answer is
 * on. Presentational, per-panel UI state (drag position, settings panel
 * open/close, the chat compose box) stays in the page/components that own
 * that UI — this hook only owns what the interview itself needs to run.
 */
export function useInterview({ querySessionId, plan, queryAuto = true, screenshots = [], answerStyle = 'star', audioSource = 'both', onScreenshotsConsumed }) {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [autoAnswer, setAutoAnswer] = useState(queryAuto !== false);
  const [remainingText, setRemainingText] = useState('');
  const [creditsText, setCreditsText] = useState('— Credits');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const sessionEndedRef = useRef(false);
  const autoAnswerRef = useRef(autoAnswer);
  autoAnswerRef.current = autoAnswer;

  const triggerToast = useCallback((msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  }, []);

  const answering = useAnswerStreaming();

  // Warm the backend as soon as the copilot opens, so the first question is
  // answered as fast as the later ones. Repeated while it stays open: OpenAI
  // drops its cached prompt after a few idle minutes.
  useEffect(() => {
    warmAnswer(querySessionId || null);
    const timer = setInterval(() => warmAnswer(querySessionId || null), 4 * 60 * 1000);
    return () => clearInterval(timer);
  }, [querySessionId]);

  // Deliberately not useCallback: it needs speech.transcriptChips and session
  // as they are at call time, not as they were whenever some unrelated
  // dependency last changed. Recreated every render, same as the rest of
  // this hook's handlers below (and same as the original overlay page) — a
  // few closures per render is not a cost worth memoizing around here.
  const askQuestion = (question, opts = {}) => {
    const { images = [], style = 'star', transcript, action = 'answer' } = opts;
    // A screenshot is a one-shot attachment to the question it rode in
    // with — every caller of askQuestion (typed chat, quick prompts, the
    // Answer button, a chip click, the global shortcut, and live
    // auto-answer) reads whatever's currently staged and sends it here, so
    // this is the one place that can reliably clear it afterward for all of
    // them at once. Without this it silently kept attaching to every
    // question asked afterward until the user noticed and removed it by hand.
    if (images.length > 0 && onScreenshotsConsumed) {
      onScreenshotsConsumed();
    }
    return answering.generateAnswer(question, {
      images,
      style,
      action,
      transcript: transcript !== undefined
        ? transcript
        : (speech.getConversationTranscript() || speech.transcriptChips.map((c) => c.text).join('\n')),
      sessionId: session ? session.id : querySessionId,
      language: session ? (session.language || 'en') : 'en',
    });
  };

  const speech = useSpeechRecognition({
    sessionId: session ? session.id : querySessionId,
    source: audioSource,
    language: session ? (session.language || 'en') : 'en',
    onQuestionDetected: (text) => {
      if (
        !text ||
        isSilenceHallucination(text) ||
        NON_QUESTION_PLEASANTRIES.test(text) ||
        OUTRO_OR_GREETING_ANYWHERE.test(text)
      ) {
        return;
      }
      answering.setCueLine(text);
      if (autoAnswerRef.current !== false) {
        askQuestion(text, { images: screenshots, style: answerStyle });
      } else {
        triggerToast(`🎙️ Question detected: "${text.slice(0, 45)}…" — Click ✨ Answer`);
      }
    },
    onToast: triggerToast,
  });

  const updateCreditsDisplay = useCallback(async (s) => {
    if (!s) return;
    try {
      const res = await fetch('/api/sessions/account');
      if (res.ok) {
        const data = await res.json();
        const acc = data.account || {};
        if (s.billing_kind === 'unlimited') {
          setCreditsText('Unlimited');
        } else if (s.billing_kind === 'trial' || plan === 'free') {
          setCreditsText(`Trial (${acc.trials_remaining ?? 0} Left)`);
        } else {
          setCreditsText(`${Number(acc.credits || 0).toFixed(1)} Credits`);
        }
        return;
      }
    } catch {}
    if (s.billing_kind === 'unlimited') {
      setCreditsText('Unlimited');
    } else if (s.billing_kind === 'trial' || plan === 'free') {
      setCreditsText('Trial Active');
    } else {
      setCreditsText(`${Number(s.credits_balance || 0).toFixed(1)} Credits`);
    }
  }, [plan]);

  const loadSessionDetails = useCallback(async () => {
    const fallbackSession = (id) => ({
      id: id || 'default-session',
      status: 'active',
      plan: 'full',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
    });

    try {
      if (!querySessionId) {
        setSession(fallbackSession('dev-session'));
        answering.clearAnswer();
        answering.setAnswersHistory([]);
        speech.setTranscriptChips([]);
        return;
      }
      const res = await fetch('/api/sessions/' + querySessionId);
      if (!res.ok) {
        triggerToast('⚠️ Could not load full session context — continuing with limited info.');
        setSession(fallbackSession(querySessionId));
        answering.clearAnswer();
        answering.setAnswersHistory([]);
        speech.setTranscriptChips([]);
        return;
      }
      const { session: s, transcript: sessionTranscript, answers: sessionAnswers } = await res.json();

      let isExpired = false;
      if (s.expires_at) {
        const expMs = new Date(String(s.expires_at).replace(' ', 'T') + 'Z').getTime();
        if (Number.isFinite(expMs) && expMs <= Date.now()) {
          isExpired = true;
        }
      }

      let activeSession = s;
      // The first copilot open also goes through /start even when the website
      // already started the session: the server then restarts the clock so
      // the countdown begins at the full 10:00 instead of 9:4x.
      const firstOpen = s.status === 'active' && !s.copilot_opened_at && !isExpired;
      if (firstOpen || s.status === 'ready' || s.status === 'ended' || isExpired || !s.expires_at) {
        const billing = s.billing_kind || (plan === 'free' ? 'trial' : 'paid');
        try {
          const startRes = await fetch(`/api/sessions/${s.id}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billing, plan, copilot_open: true }),
          });
          const startData = await startRes.json().catch(() => ({}));
          if (startRes.ok && startData.session) {
            activeSession = startData.session;
          } else if (s.status === 'ended' && isExpired) {
            sessionEndedRef.current = true;
            setRemainingText('Ended');
            triggerToast('⚠️ Session ended — visit dashboard to renew or start a new session');
          }
        } catch { /* keep current session */ }
      }

      setSession(activeSession);
      updateCreditsDisplay(activeSession);
      if (activeSession.billing_kind === 'trial' || plan === 'free') {
        triggerToast('Free trial active (10-minute limit). 1 trial consumed.');
      }

      if (queryAuto !== false) {
        setAutoAnswer(true);
      }

      // Reset live answer state when loading session
      answering.clearAnswer();

      // Preload previous answers ONLY for this specific session
      if (Array.isArray(sessionAnswers) && sessionAnswers.length > 0) {
        const formatted = sessionAnswers.map((a) => ({
          id: a.id,
          question: a.question,
          answerHtml: sanitizeHTML(formatParakeetAnswer(a.reply)),
          answerText: a.reply || '',
          style: a.mode || 'star',
          timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        }));
        answering.setAnswersHistory(formatted);
      } else {
        answering.setAnswersHistory([]);
      }

      // Preload transcript chips ONLY for this specific session
      if (Array.isArray(sessionTranscript) && sessionTranscript.length > 0) {
        speech.setTranscriptChips(sessionTranscript.map((t) => ({
          id: t.id,
          text: t.text,
          isQuestion: Boolean(t.is_question),
        })));
      } else {
        speech.setTranscriptChips([]);
      }
    } catch (err) {
      console.warn('Fallback session activated:', err);
      triggerToast('⚠️ Could not load full session context — continuing with limited info.');
      setSession(fallbackSession(querySessionId));
      answering.clearAnswer();
      answering.setAnswersHistory([]);
      speech.setTranscriptChips([]);
    }
    // speech.startRecording is stable across renders (useCallback in
    // useSpeechRecognition); only re-run this loader when the query params
    // that actually identify the session change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySessionId, plan, queryAuto, updateCreditsDisplay, triggerToast]);

  const handleEndSession = useCallback(() => {
    setShowWarningModal(false);

    // Stop mic fire-and-forget
    try {
      if (speech && typeof speech.stopRecording === 'function') {
        speech.stopRecording().catch(() => {});
      }
    } catch {}

    // Post session end fire-and-forget
    if (querySessionId) {
      try {
        fetch(`/api/sessions/${querySessionId}/end`, { method: 'POST' }).catch(() => {});
      } catch {}
    }

    // Immediately close/quit without delay
    if (typeof window !== 'undefined') {
      if (window.feonix && typeof window.feonix.quit === 'function') {
        window.feonix.quit();
        return;
      }
      if (window.feonix && typeof window.feonix.closeOverlay === 'function') {
        window.feonix.closeOverlay();
        return;
      }
      if (window.feonix && typeof window.feonix.back === 'function') {
        window.feonix.back();
        return;
      }
      try { window.close(); } catch {}
      window.location.href = '/?view=dash';
    }
  }, [querySessionId, speech]);

  const handleBackToDashboard = useCallback(async () => {
    if (speech.listening) await speech.stopRecording();
    if (typeof window !== 'undefined') {
      if (window.feonix && typeof window.feonix.goToDashboard === 'function') {
        window.feonix.goToDashboard();
        return;
      }
      if (window.feonix && typeof window.feonix.back === 'function') {
        try { window.open('/?view=dash', '_blank'); } catch { /* popup blocked */ }
        window.feonix.back();
        return;
      }
      window.location.href = '/?view=dash';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening]);

  const toggleAutoAnswer = useCallback(() => {
    setAutoAnswer((prev) => {
      const next = !prev;
      triggerToast(next ? '⚡ Auto Answer: ON' : '⏸️ Auto Answer: OFF');
      if (window.feonix && typeof window.feonix.setAutoAnswer === 'function') {
        window.feonix.setAutoAnswer(next);
      }
      return next;
    });
  }, [triggerToast]);

  // Redirect if this window was opened without a session, and load it once.
  useEffect(() => {
    if (!querySessionId) {
      router.replace('/');
      return;
    }
    loadSessionDetails();
    return () => {
      speech.stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySessionId]);

  // Countdown to session expiry; ends the session automatically at zero.
  useEffect(() => {
    if (!session || !session.expires_at) {
      setRemainingText('');
      return;
    }
    const expiresAtMs = new Date(session.expires_at.replace(' ', 'T') + 'Z').getTime();
    if (!Number.isFinite(expiresAtMs)) return;

    // If session was already expired before mount, mark ended but do not abruptly terminate
    if (expiresAtMs <= Date.now()) {
      setRemainingText('00:00');
      sessionEndedRef.current = true;
      return;
    }

    let warned = false;
    let iv = null;
    const tick = () => {
      const remainingMs = expiresAtMs - Date.now();
      if (remainingMs <= 0) {
        setRemainingText('00:00');
        if (iv) clearInterval(iv);
        if (!sessionEndedRef.current) {
          const isTrial = session?.billing_kind === 'trial' || plan === 'free';
          if (isTrial) {
            triggerToast('Free trial expired (10-minute limit reached). Session ended.');
          } else {
            triggerToast('Paid session duration limit reached. Session ended.');
          }
          handleEndSession();
        }
        return false;
      }
      const totalSecs = Math.floor(remainingMs / 1000);
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      setRemainingText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      if (!warned && remainingMs <= 60000) {
        warned = true;
        setShowWarningModal(true);
        const isTrial = session?.billing_kind === 'trial' || plan === 'free';
        triggerToast(isTrial ? '⚠️ 1 minute remaining in this free trial' : '⚠️ 1 minute remaining in this session');
      }
      return true;
    };

    if (tick()) iv = setInterval(tick, 1000);
    return () => { if (iv) clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session && session.expires_at]);

  return {
    session,
    autoAnswer,
    toggleAutoAnswer,
    remainingText,
    creditsText,
    showWarningModal,
    setShowWarningModal,
    toastMsg,
    showToast,
    triggerToast,
    speech,
    answering,
    askQuestion,
    handleEndSession,
    handleBackToDashboard,
  };
}
