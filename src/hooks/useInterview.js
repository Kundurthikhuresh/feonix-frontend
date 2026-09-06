import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useAnswerStreaming } from './useAnswerStreaming';

/**
 * The interview domain, composed from speech capture + answer streaming:
 * loads/starts/ends the session, runs the countdown, tracks credits, and
 * wires "a question was heard" to "generate an answer" when Auto Answer is
 * on. Presentational, per-panel UI state (drag position, settings panel
 * open/close, the chat compose box) stays in the page/components that own
 * that UI — this hook only owns what the interview itself needs to run.
 */
export function useInterview({ querySessionId, plan, queryAuto, screenshots = [], answerStyle = 'star' }) {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [autoAnswer, setAutoAnswer] = useState(queryAuto);
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

  // Deliberately not useCallback: it needs speech.transcriptChips and session
  // as they are at call time, not as they were whenever some unrelated
  // dependency last changed. Recreated every render, same as the rest of
  // this hook's handlers below (and same as the original overlay page) — a
  // few closures per render is not a cost worth memoizing around here.
  const askQuestion = (question, opts = {}) => {
    const { images = [], style = 'star', transcript } = opts;
    return answering.generateAnswer(question, {
      images,
      style,
      transcript: transcript !== undefined ? transcript : speech.transcriptChips.map((c) => c.text).join('\n'),
      sessionId: session ? session.id : querySessionId,
      language: session ? (session.language || 'en') : 'en',
    });
  };

  const speech = useSpeechRecognition({
    sessionId: session ? session.id : querySessionId,
    source: 'mic',
    onQuestionDetected: (text) => {
      // screenshots/answerStyle come in as plain params, captured by this
      // closure fresh on every render (useSpeechRecognition re-syncs its
      // internal callback ref every render regardless) — so an auto-answer
      // triggered mid-render always uses whatever's currently attached/
      // selected, exactly like the manual "Answer" button does.
      if (autoAnswerRef.current) askQuestion(text, { images: screenshots, style: answerStyle });
    },
    onToast: triggerToast,
  });

  const updateCreditsDisplay = useCallback((s) => {
    if (!s) return;
    if (s.billing_kind === 'unlimited') {
      setCreditsText('Unlimited');
    } else if (s.billing_kind === 'trial') {
      setCreditsText('Trial Active');
    } else {
      setCreditsText(`${Number(s.credits_balance || 0).toFixed(1)} Credits`);
    }
  }, []);

  const loadSessionDetails = useCallback(async () => {
    const fallbackSession = (id) => ({
      id: id || 'default-session',
      status: 'active',
      plan: 'full',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
    });

    try {
      if (!querySessionId) {
        setSession(fallbackSession('dev-session'));
        return;
      }
      const res = await fetch('/api/sessions/' + querySessionId);
      if (!res.ok) {
        setSession(fallbackSession(querySessionId));
        return;
      }
      const { session: s } = await res.json();

      let isExpired = false;
      if (s.expires_at) {
        const expMs = new Date(String(s.expires_at).replace(' ', 'T') + 'Z').getTime();
        if (Number.isFinite(expMs) && expMs <= Date.now()) {
          isExpired = true;
        }
      }

      let activeSession = s;
      if (s.status === 'ready' || s.status === 'ended' || isExpired || !s.expires_at) {
        const billing = s.billing_kind || (plan === 'free' ? 'trial' : 'paid');
        try {
          const startRes = await fetch(`/api/sessions/${s.id}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billing, plan }),
          });
          const startData = await startRes.json().catch(() => ({}));
          if (startRes.ok && startData.session) {
            activeSession = startData.session;
          } else if (s.status === 'ended' || isExpired) {
            sessionEndedRef.current = true;
            setRemainingText('Ended');
            triggerToast('⚠️ Session ended — visit dashboard to renew or start a new session');
          }
        } catch { /* keep current session */ }
      }

      setSession(activeSession);
      updateCreditsDisplay(activeSession);

      if (queryAuto) {
        setAutoAnswer(true);
      }
    } catch (err) {
      console.warn('Fallback session activated:', err);
      setSession(fallbackSession(querySessionId));
    }
    // speech.startRecording is stable across renders (useCallback in
    // useSpeechRecognition); only re-run this loader when the query params
    // that actually identify the session change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySessionId, plan, queryAuto, updateCreditsDisplay, triggerToast]);

  const handleEndSession = useCallback(async () => {
    if (sessionEndedRef.current) return;
    sessionEndedRef.current = true;
    setShowWarningModal(false);
    try {
      await speech.stopRecording();
    } catch (err) {
      // A MediaRecorder in an unexpected state (or a revoked mic
      // permission) throwing here used to abort the entire function before
      // it ever reached the /end call or window.feonix.quit() below —
      // silently stranding sessionEndedRef at true, so every later click on
      // End became a permanent no-op with no visible error. Ending the
      // session and quitting the app must not depend on the mic having
      // stopped cleanly.
      console.error('Failed to stop recording during end-session:', err);
    }
    try {
      const res = await fetch(`/api/sessions/${querySessionId}/end`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const settlement = data.settlement;
        if (settlement) {
          const totalSecs = Math.round((settlement.minutes || 0) * 60);
          const m = Math.floor(totalSecs / 60);
          const s = totalSecs % 60;
          const durationText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          const costText = settlement.kind === 'unlimited'
            ? 'Unlimited plan'
            : `${Number(settlement.credits || 0).toFixed(2)} Credits used`;
          triggerToast(`Session ended — ${durationText} · ${costText}`);
        }
      }
    } catch (err) {
      console.error('End session failed:', err);
    }

    if (typeof window !== 'undefined') {
      if (window.feonix && typeof window.feonix.quit === 'function') {
        window.feonix.quit();
        return;
      }
      if (window.feonix && typeof window.feonix.back === 'function') {
        window.feonix.back();
        return;
      }
      window.close();
      setTimeout(() => {
        if (!window.closed) window.location.href = '/?view=dash';
      }, 350);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySessionId, triggerToast]);

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
        if (!sessionEndedRef.current) handleEndSession();
        return false;
      }
      const totalSecs = Math.floor(remainingMs / 1000);
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      setRemainingText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      if (!warned && remainingMs <= 60000) {
        warned = true;
        setShowWarningModal(true);
        triggerToast('⚠️ 1 minute remaining');
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
