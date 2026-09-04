"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { useInterview } from '../../hooks/useInterview';
import TopBar from '../../components/overlay/TopBar';
import QuestionPanel from '../../components/overlay/QuestionPanel';
import AnswerPanel from '../../components/overlay/AnswerPanel';
import ChatPanel from '../../components/overlay/ChatPanel';
import AssistantSettings from '../../components/overlay/AssistantSettings';
import AssistantPill from '../../components/overlay/AssistantPill';
import { readFileAsDataUrl, captureScreenSnapshot } from '../../services/screenshotService';
import { htmlToPlainText } from '../../lib/answerFormatter';
import './overlay.css';

// Mirrors desktop-electron/src/main/settingsStore.js's DEFAULT_SETTINGS so
// the panel shows correct-looking toggle states immediately, before the
// (near-instant, but still async) window.feonix.getSettings() round trip
// resolves and overwrites these with whatever's actually persisted.
const DEFAULT_SETTINGS = {
  shortcutToggle: 'CommandOrControl+Shift+Space',
  shortcutHide: 'CommandOrControl+Shift+H',
  startMinimized: false,
  alwaysOnTop: true,
  launchAtStartup: false,
  showTrayIcon: true,
  opacity: 92,
  assistantSize: 'normal',
  rememberPosition: true,
  voiceEnabled: true,
};

const SIZE_PX = { compact: 720, normal: 900, large: 1080 };

function OverlayContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'full';
  const querySessionId = searchParams.get('session');
  const queryAuto = searchParams.get('auto') === '1';
  const queryStart = searchParams.get('start'); // 'minimized' | 'open' | null

  // Chat compose box / screenshot attachment. Kept here rather than inside
  // useInterview because it's UI state for "what to ask next", not part of
  // the interview's own lifecycle — but useInterview needs to see the
  // current values too, for auto-answer, so they're passed in below.
  const [screenshotData, setScreenshotData] = useState(null);
  const [screenshotMenuOpen, setScreenshotMenuOpen] = useState(false);
  const [promptHubOpen, setPromptHubOpen] = useState(false);
  const [answerStyle, setAnswerStyle] = useState('star'); // 'star' | 'code' | 'teleprompter' | 'quiz'
  const [customPromptText, setCustomPromptText] = useState('');
  const fileInputRef = useRef(null);

  const interview = useInterview({ querySessionId, plan, queryAuto, screenshotData, answerStyle });
  const {
    session, autoAnswer, toggleAutoAnswer,
    showWarningModal, setShowWarningModal,
    toastMsg, showToast, triggerToast,
    speech, answering, askQuestion,
    handleEndSession,
  } = interview;
  const { listening, elapsedText, transcriptChips, setTranscriptChips, toggleListening } = speech;
  const { thinking, answerHtml, cueLine, showAnswerCard, clearAnswer } = answering;

  // Visibility: 'open' (full HUD) | 'minimized' (small status pill) |
  // 'hidden' (nothing rendered at all). Every state is equally visible to
  // anyone who can see the screen, including a screen share — there is no
  // state that's shown to the user but not to whatever they're sharing.
  //
  // Persisted across reloads/relaunches, not just held in memory: without
  // this, hiding the assistant only lasted until the next page load (dev
  // HMR, a window recreated by Electron, reopening the app) — it would pop
  // back open on its own instead of staying exactly how the user left it
  // until they explicitly bring it back via the shortcut, tray, or pill.
  //
  // The initial value has to be the same deterministic default the server
  // rendered (queryStart-based, never localStorage) — reading localStorage
  // in a useState initializer runs during SSR too, where it doesn't exist,
  // so the server and the first client render would disagree and React
  // would throw a hydration mismatch. The saved value is applied a moment
  // later instead, from an effect that only ever runs in the browser —
  // same pattern already used below for the saved drag position.
  const [visibility, setVisibility] = useState(queryStart === 'minimized' ? 'minimized' : 'open');

  // Every "Start Interview" click sends a fresh, authoritative `start=` (see
  // ipc.js's feonix:start-session, which computes it from the current
  // startMinimized setting) — but createOverlayWindow REUSES the same
  // BrowserWindow across clicks rather than making a new one, so this same
  // effect runs on every click, not just a genuine reload. Restoring from
  // localStorage there meant hiding/minimizing once — even weeks ago, even
  // via a stray ESC — silently stuck every future "Start Interview" launch
  // in that same state, since the window never actually re-rendered
  // anything a user would recognize as "it opened." queryStart being
  // present at all means this page load came from that authoritative
  // main-process decision, so it wins outright; localStorage only gets a
  // say when there's no such signal (e.g. the bare browser-fallback route).
  useEffect(() => {
    if (queryStart) return;
    try {
      const saved = localStorage.getItem('feonix.overlayVisibility');
      if (saved === 'open' || saved === 'minimized' || saved === 'hidden') setVisibility(saved);
    } catch { /* storage blocked */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem('feonix.overlayVisibility', visibility); } catch { /* storage blocked */ }
  }, [visibility]);

  // Assistant Settings — desktop-owned values (shortcuts, tray, startup,
  // always-on-top) live entirely in the Electron main process; these four
  // affect this page's own rendering/behavior, so they're the single
  // source of truth here and just mirrored to the main process for
  // persistence via window.feonix.setSetting.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardSize = { width: 880, height: 520 };

  useEffect(() => {
    if (window.feonix && typeof window.feonix.getSettings === 'function') {
      window.feonix.getSettings().then((s) => {
        setSettings((prev) => ({ ...prev, ...s }));
      }).catch(() => {});
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (window.feonix && typeof window.feonix.setSetting === 'function') {
      window.feonix.setSetting(key, value)
        .then((updated) => setSettings((prev) => ({ ...prev, ...updated })))
        .catch(() => {});
    }
  };

  // Refs
  const chipsContainerRef = useRef(null);
  const shellRef = useRef(null);
  const pillRef = useRef(null);

  // Drag-to-move state
  const [dragPos, setDragPos] = useState({ x: null, y: null }); // null = use CSS default
  const dragRef = useRef({ dragging: false, hasMoved: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const lastPosRef = useRef({ x: null, y: null });

  // Keyboard shortcuts. The topbar buttons already display kbd hints (⌘↵,
  // ⌘⇧↵, ⌘⇧⌫) that were purely decorative before. This wires them up.
  //
  // Kept as an "up-to-date ref" pattern: a no-deps effect below refreshes
  // shortcutHandlersRef with this render's closures on every render, while
  // the single 'keydown' listener is registered once and reads from that ref
  // at call time — so shortcuts always act on current state without tearing
  // down and re-registering a global listener on every keystroke of state
  // change.
  const shortcutHandlersRef = useRef({});
  useEffect(() => {
    shortcutHandlersRef.current = {
      onAnswer: () => {
        if (cueLine) {
          askQuestion(cueLine, { image: screenshotData, style: answerStyle });
        } else {
          setPromptHubOpen(true);
          triggerToast('💡 Type a question in Chat to generate an answer');
        }
      },
      onScreenshotMenu: () => setScreenshotMenuOpen((prev) => !prev),
      onChat: () => setPromptHubOpen((prev) => !prev),
      onClearAnswer: () => clearAnswer(),
      onEndSession: () => handleEndSession(),
    };
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC minimizes the open panel — never fires while typing (an input's
      // own ESC behavior, e.g. clearing a field, should win).
      if (e.key === 'Escape') {
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          setVisibility((prev) => (prev === 'open' ? 'minimized' : prev));
        }
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const handlers = shortcutHandlersRef.current;
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handlers.onScreenshotMenu();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handlers.onAnswer();
      } else if (e.shiftKey && e.key === 'Backspace') {
        e.preventDefault();
        handlers.onChat();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlers.onClearAnswer();
      } else if (e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
        e.preventDefault();
        handlers.onEndSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global shortcut + tray commands, pushed from the Electron main process
  // (see desktop-electron/src/main/{shortcuts,tray}.js) — these work even
  // when this window doesn't have OS focus, unlike the renderer-level
  // shortcuts above. No-ops entirely outside Electron (window.feonix absent).
  useEffect(() => {
    if (!window.feonix) return undefined;
    const unsubs = [];

    if (window.feonix.onShortcutToggle) {
      unsubs.push(window.feonix.onShortcutToggle(() => {
        setVisibility((prev) => (prev === 'open' ? 'minimized' : 'open'));
      }));
    }
    if (window.feonix.onShortcutHide) {
      unsubs.push(window.feonix.onShortcutHide(() => {
        setVisibility((prev) => (prev === 'hidden' ? 'open' : 'hidden'));
      }));
    }
    if (window.feonix.onTrayShow) {
      unsubs.push(window.feonix.onTrayShow(() => setVisibility('open')));
    }
    if (window.feonix.onTrayMinimize) {
      unsubs.push(window.feonix.onTrayMinimize(() => setVisibility('minimized')));
    }
    if (window.feonix.onTrayToggleListening) {
      unsubs.push(window.feonix.onTrayToggleListening(() => toggleListening()));
    }
    if (window.feonix.onTrayOpenSettings) {
      unsubs.push(window.feonix.onTrayOpenSettings(() => {
        setVisibility('open');
        setSettingsOpen(true);
      }));
    }

    return () => unsubs.forEach((off) => off && off());
  }, [toggleListening]);

  // Keeps the tray's Start/Stop Listening label accurate no matter where
  // recording was actually toggled from (the panel button or the tray itself).
  useEffect(() => {
    if (window.feonix && typeof window.feonix.setListeningState === 'function') {
      window.feonix.setListeningState(listening);
    }
  }, [listening]);

  // Restore wherever the user last dragged the HUD — unless the user turned
  // "Remember position" off, in which case it always opens centered.
  useEffect(() => {
    if (!settings.rememberPosition) return;
    try {
      const saved = JSON.parse(localStorage.getItem('feonix.overlayPos') || 'null');
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        setDragPos({
          x: Math.max(0, Math.min(window.innerWidth - 150, saved.x)),
          y: Math.max(0, Math.min(window.innerHeight - 30, saved.y)),
        });
      }
    } catch { /* storage fallback */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll transcript chips to the latest transcribed chunk
  useEffect(() => {
    if (chipsContainerRef.current) {
      chipsContainerRef.current.scrollTo({
        left: chipsContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [transcriptChips]);

  // Drag-to-move: listen to global mousemove/mouseup
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }

      const newX = dragRef.current.originX + dx;
      const newY = dragRef.current.originY + dy;

      const activeEl = visibility === 'minimized' ? pillRef.current : shellRef.current;
      const w = activeEl ? activeEl.offsetWidth : (visibility === 'minimized' ? 200 : 900);

      const clampedX = Math.max(0, Math.min(window.innerWidth - Math.min(w, 150), newX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - 30, newY));

      lastPosRef.current = { x: clampedX, y: clampedY };
      setDragPos({ x: clampedX, y: clampedY });
    };

    const onUp = () => {
      if (dragRef.current.dragging) {
        dragRef.current.dragging = false;
        document.body.style.cursor = '';
        if (settings.rememberPosition) {
          try {
            if (Number.isFinite(lastPosRef.current.x)) {
              localStorage.setItem('feonix.overlayPos', JSON.stringify(lastPosRef.current));
            }
          } catch { /* storage blocked */ }
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [visibility, settings.rememberPosition]);

  const handleDragStart = (e) => {
    const isDragHandle = Boolean(e.target.closest('.pk-drag-handle') || e.target.closest('.pk-drag-rail'));
    const isPill = Boolean(e.target.closest('.pk-mini-pill'));

    if (!isDragHandle && !isPill) {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('.pk-dropdown')) {
        return;
      }
    }

    const activeEl = isPill ? pillRef.current : shellRef.current;
    if (!activeEl) return;
    const rect = activeEl.getBoundingClientRect();

    dragRef.current = {
      dragging: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    e.preventDefault();
  };

  const handlePillClick = () => {
    if (!dragRef.current.hasMoved) setVisibility('open');
  };

  // Global Ctrl+V Screenshot Paste Listener
  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || window.clipboardData)?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          readFileAsDataUrl(blob).then((dataUrl) => {
            setScreenshotData(dataUrl);
            setPromptHubOpen(true);
            triggerToast('📸 Screenshot pasted from clipboard');
          });
          e.preventDefault();
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [triggerToast]);

  // Sync window size with the Electron overlay window for whichever
  // visibility state is current — a full HUD needs room for content, the
  // pill needs almost none, and hidden needs nothing on screen at all.
  useEffect(() => {
    if (!(window.feonix && typeof window.feonix.resize === 'function')) return;
    if (visibility === 'hidden') {
      window.feonix.resize(100, 100); // main process clamps to a 100px floor
    } else if (visibility === 'minimized') {
      window.feonix.resize(220, 44);
    } else if (visibility === 'open') {
      if (cueLine) {
        const height = (isExpanded ? 640 : cardSize.height) + 160;
        const width = isExpanded ? 1100 : Math.max(cardSize.width, 880);
        window.feonix.resize(width, height);
      } else {
        window.feonix.resize(880, 160);
      }
    }
  }, [visibility, cueLine, isExpanded]);

  const handleToggleListening = () => {
    if (!settings.voiceEnabled) {
      triggerToast('🎙 Voice input is disabled in Settings');
      return;
    }
    toggleListening();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setScreenshotData(dataUrl);
      setPromptHubOpen(true);
      setScreenshotMenuOpen(false);
      triggerToast('📸 Screenshot loaded — ready to solve');
    } catch (err) {
      console.error('File read failed:', err);
    }
    e.target.value = '';
  };

  const handleCaptureScreen = async () => {
    setScreenshotMenuOpen(false);
    try {
      const dataUrl = await captureScreenSnapshot();
      setScreenshotData(dataUrl);
      setPromptHubOpen(true);
      triggerToast('🖥️ Screen captured — ready to solve');
    } catch (err) {
      if (err.code === 'NOT_SUPPORTED' || err.name === 'NotSupportedError') {
        triggerToast('ℹ️ Screen snap not supported in this browser — opening file picker');
        fileInputRef.current?.click();
      } else {
        console.warn('Screen capture note:', err.message);
        triggerToast('⚠️ Screen capture cancelled');
      }
    }
  };

  const handleAnswerClick = () => {
    if (cueLine) {
      askQuestion(cueLine, { image: screenshotData, style: answerStyle });
    } else {
      setPromptHubOpen(true);
      triggerToast('💡 Type a question in Chat to generate an answer');
    }
  };

  const handleChipClick = (chip) => {
    askQuestion(chip.text, { image: screenshotData, style: answerStyle });
  };

  const handleCustomPromptSubmit = (e) => {
    e.preventDefault();
    if (!customPromptText.trim() && !screenshotData) return;
    const prompt = customPromptText.trim() || 'Analyze the question and provide the solution.';
    setTranscriptChips((prev) => [...prev, { text: prompt, isQuestion: true }]);
    askQuestion(prompt, { image: screenshotData, style: answerStyle });
    setCustomPromptText('');
  };

  const handleQuickPromptClick = (presetText, style) => {
    setAnswerStyle(style);
    const fullPrompt = customPromptText.trim() ? `${customPromptText.trim()} (${presetText})` : presetText;
    setTranscriptChips((prev) => [...prev, { text: fullPrompt, isQuestion: true }]);
    askQuestion(fullPrompt, { image: screenshotData, style });
  };

  const handleSolveScreenshotNow = () => {
    setScreenshotMenuOpen(false);
    setPromptHubOpen(false);
    askQuestion(cueLine || 'Analyze this screenshot and provide a solution', { image: screenshotData, style: answerStyle });
  };

  const handleCopyResponse = () => {
    const text = htmlToPlainText(answerHtml);
    if (text) navigator.clipboard?.writeText(text);
    triggerToast(text ? '⧉ Response copied' : 'Nothing to copy yet');
  };

  const pillStatus = thinking ? 'processing' : listening ? 'listening' : 'ready';

  return (
    <div className="overlay-page-shell" style={{ opacity: settings.opacity / 100, pointerEvents: 'none' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />

      {visibility === 'minimized' && (
        <AssistantPill
          ref={pillRef}
          status={pillStatus}
          dragPos={dragPos}
          dragging={dragRef.current?.dragging}
          onDragStart={handleDragStart}
          onOpen={handlePillClick}
        />
      )}

      {visibility === 'open' && (
        <div
          ref={shellRef}
          className="pk-shell"
          style={dragPos.x !== null ? {
            position: 'fixed',
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
            bottom: 'unset',
            transform: 'none',
            pointerEvents: 'all',
            width: `${SIZE_PX[settings.assistantSize] || SIZE_PX.normal}px`,
            maxWidth: '98vw',
            zIndex: 9999,
          } : {
            pointerEvents: 'all',
            width: '100%',
            maxWidth: `${SIZE_PX[settings.assistantSize] || SIZE_PX.normal}px`,
          }}
        >
          <TopBar
            onDragStart={handleDragStart}
            dragging={dragRef.current?.dragging}
            listening={listening}
            elapsedText={elapsedText}
            onToggleListening={handleToggleListening}
            thinking={thinking}
            onAnswerClick={handleAnswerClick}
            screenshotData={screenshotData}
            screenshotMenuOpen={screenshotMenuOpen}
            onToggleScreenshotMenu={() => setScreenshotMenuOpen((prev) => !prev)}
            onUploadClick={() => { fileInputRef.current?.click(); setScreenshotMenuOpen(false); }}
            onCaptureScreen={handleCaptureScreen}
            onSolveScreenshotNow={handleSolveScreenshotNow}
            onRemoveScreenshot={() => { setScreenshotData(null); setScreenshotMenuOpen(false); }}
            promptHubOpen={promptHubOpen}
            onToggleChat={() => setPromptHubOpen((prev) => !prev)}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
            onMinimize={() => setVisibility('minimized')}
            onClose={() => setVisibility('hidden')}
            onToggleSettings={() => setSettingsOpen((prev) => !prev)}
            onEndSession={handleEndSession}
          />

          <QuestionPanel
            listening={listening}
            transcriptChips={transcriptChips}
            chipsContainerRef={chipsContainerRef}
            onChipClick={handleChipClick}
            onClear={() => setTranscriptChips([])}
            onDragStart={handleDragStart}
          />

          <AnswerPanel
            visible={showAnswerCard}
            cueLine={cueLine}
            answerHtml={answerHtml}
            thinking={thinking}
            isExpanded={isExpanded}
            elapsedText={elapsedText}
            onClear={clearAnswer}
            onCopyQuestion={() => navigator.clipboard?.writeText(cueLine)}
            onCopyResponse={handleCopyResponse}
            onThumbUp={() => triggerToast('👍 Saved')}
            onThumbDown={() => triggerToast('👎 Noted')}
          />

          <ChatPanel
            open={promptHubOpen}
            onClose={() => setPromptHubOpen(false)}
            customPromptText={customPromptText}
            onChangePromptText={setCustomPromptText}
            screenshotData={screenshotData}
            onSubmit={handleCustomPromptSubmit}
            onQuickPrompt={handleQuickPromptClick}
          />

          <AssistantSettings
            open={settingsOpen}
            settings={settings}
            onChange={updateSetting}
            autoAnswer={autoAnswer}
            onToggleAutoAnswer={toggleAutoAnswer}
            onClose={() => setSettingsOpen(false)}
          />
        </div>
      )}

      {showToast && <div className="pk-toast">{toastMsg}</div>}

      {showWarningModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Time Almost Up</h3>
            <p>Less than a minute remains. Session ends automatically.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowWarningModal(false)} type="button">Dismiss</button>
              <button className="btn-danger" onClick={handleEndSession} type="button">End Now</button>
            </div>
          </div>
        </div>
      )}
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
