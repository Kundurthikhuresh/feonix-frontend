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
import { readFileAsDataUrl, downscaleDataUrl, captureScreenSnapshot } from '../../services/screenshotService';
import { htmlToPlainText } from '../../lib/answerFormatter';
import './overlay.css';

// Mirrors desktop-electron/src/main/settingsStore.js's DEFAULT_SETTINGS so
// the panel shows correct-looking toggle states immediately, before the
// (near-instant, but still async) window.feonix.getSettings() round trip
// resolves and overwrites these with whatever's actually persisted.
const DEFAULT_SETTINGS = {
  shortcutToggle: 'CommandOrControl+Shift+Space',
  shortcutHide: 'CommandOrControl+Shift+H',
  shortcutScreenshot: 'CommandOrControl+Shift+S',
  shortcutListenToggle: 'CommandOrControl+Shift+P',
  shortcutAnswer: 'CommandOrControl+Shift+G',
  startMinimized: false,
  alwaysOnTop: true,
  launchAtStartup: false,
  showTrayIcon: true,
  opacity: 92,
  assistantSize: 'normal',
  rememberPosition: true,
  voiceEnabled: true,
  stealthMode: true,
  autoHideOnShare: false,
  audioSource: 'mic',
};

const SIZE_PX = { compact: 880, normal: 980, large: 1200 };

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
  // An array rather than a single value — "upload a number of screenshots"
  // (multi-select in the file picker, or attaching one after another via
  // paste/capture) needs to accumulate, not replace, what's already staged
  // for the next question.
  const [screenshots, setScreenshots] = useState([]);
  const [screenshotMenuOpen, setScreenshotMenuOpen] = useState(false);
  const [promptHubOpen, setPromptHubOpen] = useState(false);
  const [answerStyle, setAnswerStyle] = useState('star'); // 'star' | 'code' | 'teleprompter' | 'quiz'
  const [customPromptText, setCustomPromptText] = useState('');
  const fileInputRef = useRef(null);

  // Mirrors backend/src/answer.js's MAX_IMAGES — trimming here gives an
  // immediate toast instead of silently losing the extras only once the
  // request reaches the server.
  const MAX_SCREENSHOTS = 8;
  const addScreenshots = (dataUrls) => {
    setScreenshots((prev) => {
      const next = [...prev, ...dataUrls];
      if (next.length > MAX_SCREENSHOTS) {
        triggerToast(`⚠️ Only the first ${MAX_SCREENSHOTS} screenshots are kept per question`);
      }
      return next.slice(0, MAX_SCREENSHOTS);
    });
  };

  // Declared here (ahead of its more natural home further down, next to
  // settingsOpen/isExpanded) only because useInterview below needs
  // settings.audioSource at call time — moving just this one up avoids
  // reordering the rest of the settings-related state.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const interview = useInterview({
    querySessionId, plan, queryAuto, screenshots, answerStyle, audioSource: settings.audioSource,
  });
  const {
    session, autoAnswer, toggleAutoAnswer,
    remainingText,
    showWarningModal, setShowWarningModal,
    toastMsg, showToast, triggerToast,
    speech, answering, askQuestion,
    handleEndSession,
  } = interview;
  const { listening, elapsedText, transcriptChips, setTranscriptChips, toggleListening } = speech;
  const {
    thinking, answerHtml, cueLine, showAnswerCard, clearAnswer, hasError, rerun,
    answersHistory, currentAnswerIndex, selectHistoryAnswer, prevAnswer, nextAnswer,
  } = answering;

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
  // persistence via window.feonix.setSetting. (settings/setSettings itself
  // is declared above, ahead of useInterview.)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardSize = { width: 980, height: 500 };

  useEffect(() => {
    if (window.feonix && typeof window.feonix.getSettings === 'function') {
      window.feonix.getSettings().then((s) => {
        setSettings((prev) => ({ ...prev, ...s }));
      }).catch(() => { });
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (window.feonix && typeof window.feonix.setSetting === 'function') {
      window.feonix.setSetting(key, value)
        .then((updated) => setSettings((prev) => ({ ...prev, ...updated })))
        .catch(() => { });
    }
  };

  const handleToggleStealth = () => {
    const nextVal = settings.stealthMode === false;
    updateSetting('stealthMode', nextVal);
    setVisibility('open');
    if (window.feonix && typeof window.feonix.show === 'function') {
      window.feonix.show();
    }
    if (window.feonix && typeof window.feonix.bringToFront === 'function') {
      window.feonix.bringToFront();
    }
  };

  const handleToggleHide = () => {
    setVisibility((prev) => {
      if (prev === 'hidden') {
        if (window.feonix && typeof window.feonix.show === 'function') {
          window.feonix.show();
        }
        if (window.feonix && typeof window.feonix.bringToFront === 'function') {
          window.feonix.bringToFront();
        }
        return 'open';
      } else {
        if (window.feonix && typeof window.feonix.hide === 'function') {
          window.feonix.hide();
        }
        return 'hidden';
      }
    });
  };

  const handleEndClick = () => {
    try {
      handleEndSession();
    } catch { }
    if (typeof window !== 'undefined') {
      if (window.feonix && typeof window.feonix.quit === 'function') {
        window.feonix.quit();
        return;
      }
      if (window.feonix && typeof window.feonix.closeOverlay === 'function') {
        window.feonix.closeOverlay();
        return;
      }
      window.location.href = '/?view=dash';
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
          askQuestion(cueLine, { images: screenshots, style: answerStyle });
        } else {
          setPromptHubOpen(true);
          triggerToast('💡 Type a question in Chat to generate an answer');
        }
      },
      onScreenshotMenu: () => setScreenshotMenuOpen((prev) => !prev),
      onChat: () => setPromptHubOpen((prev) => !prev),
      onClearAnswer: () => clearAnswer(),
      onEndSession: () => handleEndSession(),
      onScreenshotCapture: () => handleCaptureScreen(),
      onToggleListening: () => handleToggleListening(),
      onToggleHide: () => handleToggleHide(),
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

      // Page-focused fallback for Hide/Restore, alongside the Electron-only
      // global versions below: a plain browser tab can never register a
      // true OS-wide hotkey (no browser allows a tab to claim one), but it
      // can absolutely still listen while it has focus — and this listener
      // stays live even when visibility is 'hidden' (nothing rendered isn't
      // the same as unmounted), so this is a real way back once you're
      // actually looking at this tab again, not just an Electron feature.
      if (e.shiftKey && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault();
        const handler = shortcutHandlersRef.current.onToggleHide;
        if (handler) handler();
        return;
      }
      if (e.shiftKey && e.key === ' ') {
        e.preventDefault();
        setVisibility((prev) => (prev === 'open' ? 'minimized' : 'open'));
        return;
      }

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
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
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
        setVisibility((prev) => {
          if (prev === 'hidden' || prev === 'minimized') {
            if (window.feonix && typeof window.feonix.bringToFront === 'function') {
              window.feonix.bringToFront();
            }
            return 'open';
          }
          return 'minimized';
        });
      }));
    }
    if (window.feonix.onShortcutHide) {
      unsubs.push(window.feonix.onShortcutHide((data) => {
        if (data && typeof data.visible === 'boolean') {
          setVisibility(data.visible ? 'open' : 'hidden');
          if (data.visible) {
            if (typeof window.feonix.show === 'function') window.feonix.show();
            if (typeof window.feonix.bringToFront === 'function') window.feonix.bringToFront();
          }
        } else {
          // If no boolean payload was sent, cleanly toggle visibility
          const handler = shortcutHandlersRef.current.onToggleHide;
          if (handler) handler();
        }
      }));
    }
    if (window.feonix.onShortcutScreenshot) {
      unsubs.push(window.feonix.onShortcutScreenshot(() => {
        setVisibility('open');
        shortcutHandlersRef.current.onScreenshotCapture();
      }));
    }
    if (window.feonix.onShortcutListenToggle) {
      unsubs.push(window.feonix.onShortcutListenToggle(() => {
        shortcutHandlersRef.current.onToggleListening();
      }));
    }
    if (window.feonix.onShortcutAnswer) {
      unsubs.push(window.feonix.onShortcutAnswer(() => {
        setVisibility('open');
        shortcutHandlersRef.current.onAnswer();
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
    if (window.feonix.onScreenShareStateChange) {
      unsubs.push(window.feonix.onScreenShareStateChange((data) => {
        if (data && data.active) {
          const names = (data.platforms || []).map((p) => p.name).join(', ') || 'Screen Sharing';
          setVisibility('open');
          triggerToast(`🛡️ ${names} detected — copilot hidden from opposite person and always visible to you`);
        }
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

      // In the real desktop app, this HUD IS the OS window — a tightly
      // content-sized, frameless BrowserWindow has essentially no extra
      // viewport for CSS repositioning to move content *within*, so the
      // drag gesture below (still the same mousedown/move/up tracking) used
      // to just shift content a few px inside a window barely bigger than
      // the content, looking like it wasn't dragging at all. Moving the
      // actual window by the per-frame pixel delta is what "drag it
      // anywhere on the screen" requires. The browser-tab fallback (no
      // window.feonix) keeps the original CSS-position behavior, since
      // there there's no separate OS window to move.
      if (window.feonix && typeof window.feonix.moveBy === 'function') {
        if (e.movementX || e.movementY) window.feonix.moveBy(e.movementX, e.movementY);
        return;
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

  // Global Ctrl+V Screenshot Paste Listener — a clipboard can carry more
  // than one image (e.g. copying several files at once from Explorer), so
  // every image item gets attached, not just the first.
  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || window.clipboardData)?.items;
      if (!items) return;
      const imageItems = Array.from(items).filter((item) => item.type.indexOf('image') !== -1);
      if (imageItems.length === 0) return;
      e.preventDefault();
      Promise.all(
        imageItems.map((item) => readFileAsDataUrl(item.getAsFile()).then(downscaleDataUrl))
      ).then((dataUrls) => {
        addScreenshots(dataUrls);
        setPromptHubOpen(true);
        triggerToast(dataUrls.length > 1 ? `📸 ${dataUrls.length} screenshots pasted from clipboard` : '📸 Screenshot pasted from clipboard');
      });
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [triggerToast]);

  // Sync window size with the Electron overlay window for whichever
  // visibility state is current — a full HUD needs room for content, the
  // pill needs almost none, and hidden needs nothing on screen at all.
  useEffect(() => {
    if (!window.feonix) return;
    if (visibility === 'hidden') {
      if (typeof window.feonix.hide === 'function') {
        window.feonix.hide();
      } else if (typeof window.feonix.resize === 'function') {
        window.feonix.resize(100, 100);
      }
    } else if (visibility === 'minimized') {
      if (typeof window.feonix.show === 'function') window.feonix.show();
      if (typeof window.feonix.resize === 'function') window.feonix.resize(220, 44);
    } else if (visibility === 'open') {
      if (typeof window.feonix.show === 'function') window.feonix.show();
      if (typeof window.feonix.resize === 'function') {
        const targetWidth = Math.max(SIZE_PX[settings.assistantSize] || 980, isExpanded ? 1120 : 980);
        if (settingsOpen) {
          window.feonix.resize(targetWidth, 540);
        } else if (promptHubOpen) {
          window.feonix.resize(targetWidth, 420);
        } else if (cueLine || answerHtml || thinking || (answersHistory && answersHistory.length > 0)) {
          const height = (isExpanded ? 640 : cardSize.height) + 140;
          window.feonix.resize(targetWidth, height);
        } else {
          window.feonix.resize(targetWidth, 260);
        }
      }
    }
  }, [visibility, cueLine, answerHtml, thinking, answersHistory, isExpanded, settings.assistantSize, settingsOpen, promptHubOpen]);

  const handleToggleListening = () => {
    if (!settings.voiceEnabled) {
      triggerToast('🎙 Voice input is disabled in Settings');
      return;
    }
    toggleListening();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const dataUrls = await Promise.all(
        files.map((file) => readFileAsDataUrl(file).then(downscaleDataUrl))
      );
      addScreenshots(dataUrls);
      setPromptHubOpen(true);
      setScreenshotMenuOpen(false);
      triggerToast(dataUrls.length > 1 ? `📸 ${dataUrls.length} screenshots loaded — ready to solve` : '📸 Screenshot loaded — ready to solve');
    } catch (err) {
      console.error('File read failed:', err);
    }
    e.target.value = '';
  };

  const handleCaptureScreen = async () => {
    setScreenshotMenuOpen(false);
    const visibilityBeforeCapture = visibility;
    try {
      const dataUrl = await captureScreenSnapshot({
        // This is a one-shot, local capture the user just triggered
        // themselves to feed to the AI — not a live broadcast to anyone
        // else. Hiding the HUD for the instant the frame is grabbed keeps
        // its own buttons/chrome out of that image (the same way a native
        // OS screenshot tool excludes its own toolbar), then it's restored
        // right after. This never touches, and has no effect on, a
        // separate live screen share to an interviewer over Zoom/Meet/
        // Teams — that visibility question is answered elsewhere and is
        // deliberately not something this touches.
        onBeforeFrame: () => { setVisibility('hidden'); },
      });
      addScreenshots([dataUrl]);
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
    } finally {
      setVisibility(visibilityBeforeCapture);
    }
  };

  const handleAnswerClick = () => {
    if (cueLine) {
      askQuestion(cueLine, { images: screenshots, style: answerStyle });
    } else if (screenshots.length > 0) {
      askQuestion('Analyze the attached screenshot and provide the complete solution.', { images: screenshots, style: answerStyle });
    } else {
      setPromptHubOpen(true);
      triggerToast('💡 Type a question in Chat to generate an answer');
    }
  };

  const handleChipClick = (chip) => {
    askQuestion(chip.text, { images: screenshots, style: answerStyle });
  };

  const handleCustomPromptSubmit = (e) => {
    e.preventDefault();
    if (!customPromptText.trim() && screenshots.length === 0) return;
    const prompt = customPromptText.trim() || 'Analyze the question and provide the solution.';
    setPromptHubOpen(false);
    setTranscriptChips((prev) => [...prev, { text: prompt, isQuestion: true }]);
    askQuestion(prompt, { images: screenshots, style: answerStyle });
    setCustomPromptText('');
  };

  const handleQuickPromptClick = (presetText, style) => {
    setAnswerStyle(style);
    const fullPrompt = customPromptText.trim() ? `${customPromptText.trim()} (${presetText})` : presetText;
    setPromptHubOpen(false);
    setTranscriptChips((prev) => [...prev, { text: fullPrompt, isQuestion: true }]);
    askQuestion(fullPrompt, { images: screenshots, style });
  };

  const handleSolveScreenshotNow = () => {
    setScreenshotMenuOpen(false);
    setPromptHubOpen(false);
    askQuestion(cueLine || 'Analyze this screenshot and provide a solution', { images: screenshots, style: answerStyle });
  };

  const handleCopyResponse = () => {
    const text = htmlToPlainText(answerHtml);
    if (text) navigator.clipboard?.writeText(text);
    triggerToast(text ? '⧉ Response copied' : 'Nothing to copy yet');
  };

  const pillStatus = hasError ? 'error' : thinking ? 'processing' : listening ? 'listening' : 'ready';

  return (
    <div className="overlay-page-shell" style={{ opacity: settings.opacity / 100, pointerEvents: 'none' }}>
      <input
        type="file"
        multiple
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
            screenshots={screenshots}
            screenshotMenuOpen={screenshotMenuOpen}
            onToggleScreenshotMenu={() => setScreenshotMenuOpen((prev) => !prev)}
            onUploadClick={() => { fileInputRef.current?.click(); setScreenshotMenuOpen(false); }}
            onCaptureScreen={handleCaptureScreen}
            onSolveScreenshotNow={handleSolveScreenshotNow}
            onRemoveScreenshot={() => { setScreenshots([]); setScreenshotMenuOpen(false); }}
            promptHubOpen={promptHubOpen}
            onToggleChat={() => setPromptHubOpen((prev) => !prev)}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
            onMinimize={() => setVisibility('minimized')}
            stealthMode={settings.stealthMode}
            onToggleStealth={handleToggleStealth}
            onToggleHide={handleToggleHide}
            settingsOpen={settingsOpen}
            onToggleSettings={() => setSettingsOpen((prev) => !prev)}
            onEndSession={handleEndClick}
            remainingText={remainingText}
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
            hasError={hasError}
            onCopyQuestion={() => navigator.clipboard?.writeText(cueLine)}
            onCopyResponse={handleCopyResponse}
            onThumbUp={() => triggerToast('👍 Saved')}
            onThumbDown={() => triggerToast('👎 Noted')}
            onRegenerate={() => rerun({ action: 'answer', style: answerStyle })}
            onShorten={() => rerun({ action: 'shorten', style: answerStyle })}
            onExpand={() => rerun({ action: 'deepen', style: answerStyle })}
            onRetry={() => rerun({ style: answerStyle })}
          />

          <ChatPanel
            open={promptHubOpen}
            onClose={() => setPromptHubOpen(false)}
            customPromptText={customPromptText}
            onChangePromptText={setCustomPromptText}
            screenshots={screenshots}
            onRemoveScreenshotAt={(index) => setScreenshots((prev) => prev.filter((_, i) => i !== index))}
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
            answersHistory={answersHistory}
            onSelectAnswer={(idx) => {
              selectHistoryAnswer(idx);
              setSettingsOpen(false);
            }}
            onOpenChat={() => setPromptHubOpen(true)}
          />
        </div>
      )}

      {/* "Hide" is supposed to make the assistant completely disappear until
          the shortcut/pill brings it back — these two used to render
          regardless of visibility, so a toast or the 1-minute warning modal
          would pop back up on screen on their own while "hidden", which
          defeats the point of hiding it. Gate both the same way the pill/
          shell above already are. */}
      {visibility !== 'hidden' && showToast && <div className="pk-toast">{toastMsg}</div>}

      {visibility !== 'hidden' && showWarningModal && (
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

      {/* Browser-fallback restore hint: in Electron, the OS global shortcut restores the native window. In a browser tab, this subtle button lets you unhide if needed. */}
      {visibility === 'hidden' && (typeof window !== 'undefined' && !window.feonix) && (
        <div
          onClick={handleToggleHide}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            pointerEvents: 'all',
            background: 'rgba(20, 20, 24, 0.95)',
            border: '1px solid rgba(48, 209, 88, 0.5)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#30d158',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          title="Click or press Ctrl+Shift+H to restore Copilot"
        >
          <span className="pk-stealth-dot pk-dot-green" />
          <span>Copilot Hidden (Ctrl+Shift+H to Show)</span>
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

