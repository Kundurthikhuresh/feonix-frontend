"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatParakeetAnswer } from '../../lib/answerFormatter';
import './overlay.css';

function OverlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query Params
  const plan = searchParams.get('plan') || 'full';
  const querySessionId = searchParams.get('session');
  const queryAuto = searchParams.get('auto') === '1';

  // State mapping to overlay.js
  const [session, setSession] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [autoAnswer, setAutoAnswer] = useState(queryAuto);
  const [thinking, setThinking] = useState(false);
  const [answerHtml, setAnswerHtml] = useState('');
  const [answerMeta, setAnswerMeta] = useState('');
  const [cueLine, setCueLine] = useState('');
  const [qtype, setQtype] = useState('');
  const [transcriptChips, setTranscriptChips] = useState([]);
  const [elapsedText, setElapsedText] = useState('00:00');
  const [remainingText, setRemainingText] = useState('');
  const [listening, setListening] = useState(false);
  const [creditsText, setCreditsText] = useState('— Credits');
  
  // Modals & Panels
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [opacity, setOpacity] = useState(92); // 92%
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Custom Size controls (browser mode drag resizing)
  const [cardSize, setCardSize] = useState({ width: 880, height: 420 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [listenSource, setListenSource] = useState('tab'); // 'tab', 'mic'
  const [manualInput, setManualInput] = useState('');
  
  // Refs
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const cycleTimerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const answerAbortRef = useRef(null);
  const elapsedSecsRef = useRef(0);
  const sessionEndedRef = useRef(false);
  const cyclingRef = useRef(false);
  const chipsContainerRef = useRef(null);

  // Auto-scroll transcript chips to the latest transcribed chunk
  useEffect(() => {
    if (chipsContainerRef.current) {
      chipsContainerRef.current.scrollTo({
        left: chipsContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [transcriptChips]);

  // Sync window size with Desktop Overlay whenever content appears or expands
  useEffect(() => {
    if (window.feonix && typeof window.feonix.resize === 'function') {
      if (cueLine) {
        const height = (isExpanded ? 640 : cardSize.height) + 160;
        const width = isExpanded ? 1100 : Math.max(cardSize.width, 880);
        window.feonix.resize(width, height);
      } else {
        window.feonix.resize(880, 160);
      }
    }
  }, [cueLine, cardSize.height, cardSize.width, isExpanded]);

  useEffect(() => {
    if (!querySessionId) {
      router.replace('/');
      return;
    }
    loadSessionDetails();

    // Check Tauri hook callbacks
    if (window.feonix) {
      window.feonix.onStateChange((data) => {
        if (data.isPrivate !== undefined) setIsPrivate(data.isPrivate);
        if (data.autoAnswer !== undefined) setAutoAnswer(data.autoAnswer);
      });
    }

    return () => {
      stopRecording();
      clearInterval(elapsedTimerRef.current);
    };
  }, [querySessionId]);

  // Counts down to session.expires_at, warns at the 60s mark, and auto-ends
  // the session the moment the entitlement runs out (the server rejects
  // /answer once expired, but the client should end gracefully rather than
  // wait for that 409).
  useEffect(() => {
    if (!session || !session.expires_at) {
      setRemainingText('');
      return;
    }
    const expiresAtMs = new Date(session.expires_at.replace(' ', 'T') + 'Z').getTime();
    if (!Number.isFinite(expiresAtMs)) return;

    let warned = false;
    const tick = () => {
      const remainingMs = expiresAtMs - Date.now();
      if (remainingMs <= 0) {
        setRemainingText('00:00');
        clearInterval(iv);
        if (!sessionEndedRef.current) handleEndSession();
        return;
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
    };

    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [session && session.expires_at]);

  const loadSessionDetails = async () => {
    try {
      const res = await fetch('/api/sessions/' + querySessionId);
      if (!res.ok) return;
      const { session: s } = await res.json();

      if (s.status === 'ended') {
        sessionEndedRef.current = true;
        router.replace('/?view=dash');
        return;
      }

      let activeSession = s;
      if (s.status === 'ready') {
        const billing = s.billing_kind || (plan === 'free' ? 'trial' : 'paid');
        try {
          const startRes = await fetch(`/api/sessions/${s.id}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billing }),
          });
          const startData = await startRes.json().catch(() => ({}));
          if (startRes.ok) {
            activeSession = startData.session;
          } else {
            triggerToast(startData.message || 'Could not start session');
          }
        } catch (err) {
          console.error('Failed to start session:', err);
        }
      }

      setSession(activeSession);
      fetchAccountBalance();
    } catch (err) {
      console.error('Failed to load session details:', err);
    }
  };

  const fetchAccountBalance = async () => {
    try {
      const res = await fetch('/api/sessions/account');
      if (res.ok) {
        const data = await res.json();
        const account = data.account || {};
        setCreditsText(account.unlimited ? 'Unlimited' : `${Number(account.credits || 0).toFixed(1)} Credits`);
      }
    } catch {}
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  // Recording Logic
  const handleToggleListening = async () => {
    if (listening) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    setListening(true);
    elapsedSecsRef.current = 0;
    setElapsedText('00:00');

    elapsedTimerRef.current = setInterval(() => {
      elapsedSecsRef.current += 1;
      const m = Math.floor(elapsedSecsRef.current / 60);
      const s = elapsedSecsRef.current % 60;
      setElapsedText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = mediaRecorder;
      cyclingRef.current = true;

      let chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      // stop() is asynchronous — the recorder isn't actually idle until this
      // event fires, so restarting must happen here, not right after calling
      // stop(). Calling start() before that teardown finishes is what threw
      // "Failed to execute 'start' on 'MediaRecorder'" (NotSupportedError).
      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          chunks = [];
          uploadAudioChunk(blob);
        }
        if (cyclingRef.current && recorderRef.current === mediaRecorder) {
          mediaRecorder.start();
        }
      };

      mediaRecorder.start();
      cycleTimerRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 2500);

    } catch (err) {
      console.error('Audio stream access failed:', err);
      setListening(false);
      clearInterval(elapsedTimerRef.current);
      triggerToast('⚠️ Microphone access denied');
    }
  };

  const stopRecording = async () => {
    setListening(false);
    cyclingRef.current = false;
    clearInterval(elapsedTimerRef.current);

    if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
    recorderRef.current = null;
  };

  const uploadAudioChunk = async (blob) => {
    if (!session) return;
    const headers = {
      'Content-Type': blob.type || 'audio/webm',
      'X-Filename': 'chunk.webm',
      'X-Session-Id': String(session.id),
    };

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers,
        body: blob,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          const isQ = data.text.trim().endsWith('?');
          setTranscriptChips(prev => [...prev, { text: data.text, isQuestion: isQ }]);
          
          if (isQ && autoAnswer) {
            handleGenerateAnswer(data.text);
          }
        }
      }
    } catch (err) {
      console.error('Transcription chunk upload failed:', err);
    }
  };

  const handleGenerateAnswer = async (question) => {
    if (!session) return;
    if (answerAbortRef.current) answerAbortRef.current.abort();
    answerAbortRef.current = new AbortController();

    setThinking(true);
    setAnswerHtml('');
    setCueLine(question);
    setQtype('Generating Answer…');

    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        signal: answerAbortRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          transcript: transcriptChips.map(c => c.text).join('\n'),
          session_id: session.id,
          language: session.language || 'en',
        }),
      });

      if (!res.ok) {
        setThinking(false);
        setQtype('Error');
        setAnswerHtml('Could not fetch answer.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let textAccumulator = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop();

        for (const frame of frames) {
          let name = 'message';
          let data = '';
          for (const line of frame.split('\n')) {
            if (line.startsWith('event: ')) name = line.slice(7).trim();
            else if (line.startsWith('data: ')) data += line.slice(6);
          }
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            if (name === 'token' && parsed.text) {
              textAccumulator += parsed.text;
              setAnswerHtml(formatParakeetAnswer(textAccumulator));
            } else if (name === 'error') {
              setAnswerHtml('<div class="parakeet-error">Stream error: ' + (parsed.message || '') + '</div>');
            }
          } catch {}
        }
      }
      setThinking(false);
      setQtype('Final Answer');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Answer fetch failed:', err);
        setThinking(false);
        setQtype('Failed');
      }
    }
  };

  const formatMarkdown = (text) => {
    return formatParakeetAnswer(text);
  };

  const handleManualInputSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setTranscriptChips(prev => [...prev, { text: manualInput, isQuestion: true }]);
    handleGenerateAnswer(manualInput);
    setManualInput('');
  };

  const handleEndSession = async () => {
    if (sessionEndedRef.current) return;
    sessionEndedRef.current = true;
    setShowWarningModal(false);
    await stopRecording();
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
      console.error('Failed to end session:', err);
    } finally {
      if (window.feonix && typeof window.feonix.quit === 'function') {
        window.feonix.quit();
      } else if (window.feonix && typeof window.feonix.minimize === 'function') {
        window.feonix.minimize();
      } else {
        // Browsers only allow a script to close a tab it opened itself via
        // window.open() — a normally-navigated tab like this one silently
        // ignores window.close(). Try anyway, then fall back to the
        // dashboard if the tab is still alive a moment later.
        window.close();
        setTimeout(() => router.replace('/?view=dash'), 300);
      }
    }
  };

  const handleBackToDashboard = async () => {
    try {
      await stopRecording();
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
    clearInterval(elapsedTimerRef.current);
    if (window.feonix && typeof window.feonix.back === 'function') {
      window.feonix.back();
    } else {
      router.push('/?view=dash');
    }
  };

  const handleTogglePrivate = () => {
    const nextVal = !isPrivate;
    setIsPrivate(nextVal);
    if (window.feonix && typeof window.feonix.setPrivate === 'function') {
      window.feonix.setPrivate(nextVal);
    }
    triggerToast(nextVal ? 'Private Shield On' : 'Private Shield Off');
  };

  const handleToggleAuto = () => {
    const nextVal = !autoAnswer;
    setAutoAnswer(nextVal);
    triggerToast(nextVal ? 'Automatic Answering On' : 'Automatic Answering Off');
  };

  const handleResizeDrag = (e, direction) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = cardSize.width;
    const startHeight = cardSize.height;

    const doDrag = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) newWidth = startWidth + deltaX;
      if (direction.includes('w')) newWidth = startWidth - deltaX;
      if (direction.includes('s')) newHeight = startHeight + deltaY;
      if (direction.includes('n')) newHeight = startHeight - deltaY;

      // Limit minimum boundaries
      newWidth = Math.max(420, Math.min(newWidth, 1500));
      newHeight = Math.max(220, Math.min(newHeight, 900));

      setCardSize({ width: newWidth, height: newHeight });

      if (window.feonix && typeof window.feonix.resize === 'function') {
        window.feonix.resize(newWidth, newHeight + 140);
      }
    };

    const stopDrag = () => {
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  };

  return (
    <div className="overlay-page-shell" style={{ opacity: `${opacity}%` }}>
      <div className="stack">
        {/* Floating Answer Card */}
        {cueLine && (
          <div
            id="answerCard"
            className={`card ${isExpanded ? 'is-expanded' : ''}`}
            style={{
              width: `${cardSize.width}px`,
              height: isExpanded ? '640px' : `${cardSize.height}px`,
              maxHeight: 'calc(100vh - 130px)',
            }}
          >
            {/* Resize Handles */}
            <div className="rs rs-n" onMouseDown={(e) => handleResizeDrag(e, 'n')}></div>
            <div className="rs rs-s" onMouseDown={(e) => handleResizeDrag(e, 's')}></div>
            <div className="rs rs-e" onMouseDown={(e) => handleResizeDrag(e, 'e')}></div>
            <div className="rs rs-w" onMouseDown={(e) => handleResizeDrag(e, 'w')}></div>
            <div className="rs rs-se" onMouseDown={(e) => handleResizeDrag(e, 'se')}></div>

            <div className="card-head">
              <div className="nav-group">
                <span className="meeting-badge">{qtype || 'Live Copilot'}</span>
              </div>
              <div className="head-actions">
                <button className="ctl round" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Collapse" : "Expand"} type="button">⤢</button>
              </div>
            </div>

            <div className="card-body">
              {thinking && (
                <div className="thinking">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              )}
              <div className="answer" dangerouslySetInnerHTML={{ __html: answerHtml }} />
            </div>

            <div className="card-foot">
              <span>FeonixAI HUD</span>
              <div className="rate-group">
                <button className="rate" onClick={() => triggerToast('👍 Thank you')} type="button">👍</button>
                <button className="rate" onClick={() => triggerToast('👎 Noted')} type="button">👎</button>
              </div>
            </div>
          </div>
        )}

        {/* Transcript Strip */}
        <div id="strip" className="strip">
          <div className="wave">
            {listening ? (
              <>
                <i></i><i></i><i></i>
              </>
            ) : (
              <span style={{ fontSize: '10px' }}>⏸</span>
            )}
          </div>
          <div
            className="chips"
            ref={chipsContainerRef}
            onWheel={(e) => {
              if (e.deltaY) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {transcriptChips.map((chip, idx) => (
              <span
                key={idx}
                className={`chip ${chip.isQuestion ? 'chip-question' : 'chip-idle'}`}
                onClick={() => {
                  if (chip.isQuestion || chip.text.length > 5) {
                    handleGenerateAnswer(chip.text);
                  }
                }}
                title={chip.isQuestion ? 'Click to generate AI answer' : ''}
              >
                {chip.text}
              </span>
            ))}
            {transcriptChips.length === 0 && (
              <span className="chip-idle">Waiting for conversation transcript...</span>
            )}
          </div>
        </div>

        {/* Main Control Bar */}
        <div id="mainToolbar" className="bar">
          <button
            className="ctl round back-btn"
            onClick={handleBackToDashboard}
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
            type="button"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>

          <button className="src" onClick={handleToggleListening} type="button">
            <span className="status-dot" style={{ backgroundColor: listening ? '#18C37D' : '#E5484D' }}></span>
            <span>{listening ? `Listening ${elapsedText}` : 'Start Recording'}</span>
          </button>

          <div className="spacer"></div>

          {remainingText && <div className="usage">{remainingText} left</div>}

          <div className="actions">
            <button className="ctl" onClick={() => setSettingsOpen(!settingsOpen)} type="button">Settings</button>
            <button className="ctl" onClick={() => setEmergencyOpen(!emergencyOpen)} type="button">HUD Opts</button>
            <button className="timer" onClick={handleEndSession} type="button">End Session</button>
          </div>

          <div className="usage">{creditsText}</div>
        </div>

        {/* Emergency Dropdown Menu */}
        {emergencyOpen && (
          <div className="emergency-menu">
            <div className="menu-header">HUD Controls</div>
            <button className="menu-item" onClick={handleToggleAuto} type="button">
              <span>Auto Answer</span>
              <span className="pm-state">{autoAnswer ? 'ON' : 'OFF'}</span>
            </button>
            <button className="menu-item" onClick={handleTogglePrivate} type="button">
              <span>Private Shield</span>
              <span className="pm-state">{isPrivate ? 'ON' : 'OFF'}</span>
            </button>
            <div className="menu-divider"></div>
            <div className="menu-slider">
              <label>Opacity</label>
              <input type="range" min="30" max="100" value={opacity} onChange={(e) => setOpacity(e.target.value)} />
              <span>{opacity}%</span>
            </div>
            <div className="menu-divider"></div>
            <button className="menu-item danger" onClick={() => setEmergencyOpen(false)} type="button">Close Panel</button>
          </div>
        )}

        {/* Settings Drawer Card */}
        {settingsOpen && (
          <div className="settings-card">
            <div className="settings-head">
              <h3>Overlay Settings</h3>
              <button className="ctl" onClick={() => setSettingsOpen(false)} type="button">✕</button>
            </div>
            <form onSubmit={handleManualInputSubmit} className="chatbar" style={{ position: 'relative', border: 0, padding: 0, boxShadow: 'none' }}>
              <input value={manualInput} onChange={(e) => setManualInput(e.target.value)} placeholder="Type manual question here..." />
              <button className="act" type="submit">Ask HUD</button>
            </form>
          </div>
        )}

        {/* Session-Expiring Warning Modal */}
        {showWarningModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Time Almost Up</h3>
              <p>Less than a minute remains on this session. It will end automatically when the time runs out.</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowWarningModal(false)} type="button">Dismiss</button>
                <button className="btn-danger" onClick={handleEndSession} type="button">End Now</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Alert */}
        {showToast && (
          <div className="toast-container">
            <div className="toast">{toastMsg}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading overlay...</div>}>
      <OverlayContent />
    </Suspense>
  );
}
