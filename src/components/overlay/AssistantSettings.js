import { useState, useEffect, useRef } from 'react';
import { htmlToPlainText } from '../../lib/answerFormatter';

// Presets, not free-form key capture — must match desktop-electron's
// settingsStore.js exactly, since the main process re-validates against its
// own copy of this list before ever calling globalShortcut.register and
// silently falls back to the default for anything else.
const SHORTCUT_TOGGLE_OPTIONS = [
  { value: 'CommandOrControl+Shift+Space', label: 'Ctrl+Shift+Space' },
  { value: 'CommandOrControl+Shift+A', label: 'Ctrl+Shift+A' },
  { value: 'CommandOrControl+Shift+F', label: 'Ctrl+Shift+F' },
  { value: 'CommandOrControl+Alt+Space', label: 'Ctrl+Alt+Space' },
];
const SHORTCUT_HIDE_OPTIONS = [
  { value: 'CommandOrControl+Shift+H', label: 'Ctrl+Shift+H' },
  { value: 'CommandOrControl+Shift+X', label: 'Ctrl+Shift+X' },
  { value: 'CommandOrControl+Alt+H', label: 'Ctrl+Alt+H' },
];
const SHORTCUT_SCREENSHOT_OPTIONS = [
  { value: 'CommandOrControl+Shift+S', label: 'Ctrl+Shift+S' },
  { value: 'CommandOrControl+Shift+C', label: 'Ctrl+Shift+C' },
  { value: 'CommandOrControl+Alt+S', label: 'Ctrl+Alt+S' },
];
const SHORTCUT_LISTEN_TOGGLE_OPTIONS = [
  { value: 'CommandOrControl+Shift+P', label: 'Ctrl+Shift+P' },
  { value: 'CommandOrControl+Shift+L', label: 'Ctrl+Shift+L' },
  { value: 'CommandOrControl+Alt+P', label: 'Ctrl+Alt+P' },
];
const SHORTCUT_ANSWER_OPTIONS = [
  { value: 'CommandOrControl+Shift+G', label: 'Ctrl+Shift+G' },
  { value: 'CommandOrControl+Shift+Enter', label: 'Ctrl+Shift+Enter' },
  { value: 'CommandOrControl+Alt+G', label: 'Ctrl+Alt+G' },
];
const SIZE_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
];
const AUDIO_SOURCE_OPTIONS = [
  { value: 'mic', label: 'Microphone' },
  { value: 'tab', label: 'Tab / System audio (for video calls)' },
];

/**
 * Purely presentational — `settings` and `onChange` are the single source
 * of truth, owned by overlay/page.js (which mirrors changes to the Electron
 * main process). Desktop-only fields (shortcuts, tray, startup,
 * always-on-top) are disabled when window.feonix isn't present, since
 * there's nowhere for them to take effect in a plain browser tab.
 */
export default function AssistantSettings({
  open, settings, onChange, autoAnswer, onToggleAutoAnswer, onClose,
  answersHistory = [], onSelectAnswer, onOpenChat,
}) {
  const [desktopAvailable, setDesktopAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState(answersHistory.length > 0 ? 'answers' : 'settings');
  const menuRef = useRef(null);

  useEffect(() => {
    setDesktopAvailable(Boolean(window.feonix && typeof window.feonix.setSetting === 'function'));
  }, []);

  // Listen for outside click and Escape key to close cleanly
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (e.target.closest('[data-menu-trigger="settings"]')) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Default to answers tab if answers exist
  useEffect(() => {
    if (answersHistory.length > 0 && activeTab === 'settings') {
      // keep current preference
    }
  }, [answersHistory.length]);

  if (!open) return null;

  const toggleRow = (key, label, opts = {}) => (
    <button
      className="pk-set-item"
      onClick={() => onChange(key, !settings[key])}
      type="button"
      disabled={opts.desktopOnly && !desktopAvailable}
    >
      <span>{label}</span>
      <span className={`pk-toggle ${settings[key] ? 'pk-on' : ''}`}>{settings[key] ? 'ON' : 'OFF'}</span>
    </button>
  );

  return (
    <div ref={menuRef} className="pk-settings-menu pk-assistant-settings">
      {/* Header with Tab Navigation and Close Button */}
      <div className="pk-menu-header">
        <div className="pk-menu-tabs">
          <button
            type="button"
            className={`pk-menu-tab ${activeTab === 'answers' ? 'pk-tab-active' : ''}`}
            onClick={() => setActiveTab('answers')}
          >
            📋 Answers {answersHistory.length > 0 ? `(${answersHistory.length})` : ''}
          </button>
          <button
            type="button"
            className={`pk-menu-tab ${activeTab === 'settings' ? 'pk-tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>
        <button
          type="button"
          className="pk-menu-close-btn"
          onClick={onClose}
          title="Close panel (or click ⋮ again)"
        >
          ✕
        </button>
      </div>

      <div className="pk-menu-body">
        {activeTab === 'answers' ? (
          <div className="pk-answers-tab">
            {answersHistory.length === 0 ? (
              <div className="pk-history-empty">
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                <strong>No answers recorded yet</strong>
                <p>Questions detected while recording or typed in Chat will appear here instantly.</p>
                {onOpenChat && (
                  <button
                    type="button"
                    className="pk-action-btn pk-action-primary"
                    style={{ marginTop: '12px', alignSelf: 'center' }}
                    onClick={() => { onClose(); onOpenChat(); }}
                  >
                    💬 Ask a Question in Chat
                  </button>
                )}
              </div>
            ) : (
              <div className="pk-history-list">
                {answersHistory.map((item, idx) => (
                  <div key={item.id || idx} className="pk-history-card">
                    <div className="pk-history-card-head">
                      <span className="pk-history-badge">#{answersHistory.length - idx}</span>
                      <span className="pk-history-time">{item.timestamp || 'Recent'}</span>
                      {item.style && <span className="pk-history-style">{item.style.toUpperCase()}</span>}
                    </div>
                    <div className="pk-history-q-text">
                      <strong>Q:</strong> {item.question}
                    </div>
                    {item.answerHtml && (
                      <div className="pk-history-a-snippet">
                        {htmlToPlainText(item.answerHtml).slice(0, 160)}
                      </div>
                    )}
                    <button
                      type="button"
                      className="pk-history-view-btn"
                      onClick={() => {
                        if (onSelectAnswer) onSelectAnswer(idx);
                        onClose();
                      }}
                    >
                      View Solution in HUD →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="pk-settings-tab">
            {!desktopAvailable && (
              <div className="pk-drop-hint" style={{ marginBottom: 6 }}>
                Shortcut, tray and startup settings need the Feonix AI desktop app —
                only appearance settings apply in a browser tab.
              </div>
            )}

            <button className="pk-set-item" onClick={onToggleAutoAnswer} type="button">
              <span>Auto Answer</span>
              <span className={`pk-toggle ${autoAnswer ? 'pk-on' : ''}`}>{autoAnswer ? 'ON' : 'OFF'}</span>
            </button>
            {toggleRow('voiceEnabled', 'Voice input')}
      <div className="pk-set-select-row">
        <label>Listen from</label>
        <select
          value={settings.audioSource || 'mic'}
          onChange={(e) => onChange('audioSource', e.target.value)}
        >
          {AUDIO_SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {settings.audioSource !== 'tab' && (
        <div className="pk-drop-hint" style={{ marginBottom: 6 }}>
          On a video call through speakers (not headphones), the mic can pick up echo-cancelled-out
          audio and miss the interviewer's voice. If detection feels unreliable, switch this to
          "Tab / System audio" and share the call's tab/window when prompted.
        </div>
      )}

      <div className="pk-set-divider" />

      <div className="pk-set-select-row">
        <label>Toggle shortcut</label>
        <select
          disabled={!desktopAvailable}
          value={settings.shortcutToggle || SHORTCUT_TOGGLE_OPTIONS[0].value}
          onChange={(e) => onChange('shortcutToggle', e.target.value)}
        >
          {SHORTCUT_TOGGLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="pk-set-select-row">
        <label>Hide shortcut</label>
        <select
          disabled={!desktopAvailable}
          value={settings.shortcutHide || SHORTCUT_HIDE_OPTIONS[0].value}
          onChange={(e) => onChange('shortcutHide', e.target.value)}
        >
          {SHORTCUT_HIDE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="pk-set-select-row">
        <label>Screenshot shortcut</label>
        <select
          disabled={!desktopAvailable}
          value={settings.shortcutScreenshot || SHORTCUT_SCREENSHOT_OPTIONS[0].value}
          onChange={(e) => onChange('shortcutScreenshot', e.target.value)}
        >
          {SHORTCUT_SCREENSHOT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="pk-set-select-row">
        <label>Pause/resume listening</label>
        <select
          disabled={!desktopAvailable}
          value={settings.shortcutListenToggle || SHORTCUT_LISTEN_TOGGLE_OPTIONS[0].value}
          onChange={(e) => onChange('shortcutListenToggle', e.target.value)}
        >
          {SHORTCUT_LISTEN_TOGGLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="pk-set-select-row">
        <label>Generate answer</label>
        <select
          disabled={!desktopAvailable}
          value={settings.shortcutAnswer || SHORTCUT_ANSWER_OPTIONS[0].value}
          onChange={(e) => onChange('shortcutAnswer', e.target.value)}
        >
          {SHORTCUT_ANSWER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="pk-set-divider" />

      {toggleRow('stealthMode', '🛡️ Screen share stealth (invisible to Zoom, Meet, Teams, WhatsApp, Discord, Webex, Jitsi, Slack, Loom, GoTo, Whereby)', { desktopOnly: true })}
      {toggleRow('autoHideOnShare', 'Auto-hide HUD when screen sharing is detected', { desktopOnly: true })}
      {toggleRow('startMinimized', 'Start minimized', { desktopOnly: true })}
      {toggleRow('alwaysOnTop', 'Always on top', { desktopOnly: true })}
      {toggleRow('launchAtStartup', 'Launch at Windows startup', { desktopOnly: true })}
      {toggleRow('showTrayIcon', 'Show system tray icon', { desktopOnly: true })}
      {toggleRow('rememberPosition', 'Remember position')}

      <div className="pk-set-divider" />

      <div className="pk-set-select-row">
        <label>Assistant size</label>
        <select value={settings.assistantSize} onChange={(e) => onChange('assistantSize', e.target.value)}>
          {SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="pk-set-slider">
        <label>Opacity</label>
        <input
          type="range" min="30" max="100" value={settings.opacity}
          onChange={(e) => onChange('opacity', Number(e.target.value))}
        />
        <span>{settings.opacity}%</span>
      </div>

      <div className="pk-set-divider" />
      <button className="pk-set-item pk-set-danger" onClick={onClose} type="button">Close Panel</button>
          </div>
        )}
      </div>
    </div>
  );
}
