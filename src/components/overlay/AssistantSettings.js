import { useState, useEffect } from 'react';

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
const SIZE_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
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
}) {
  const [desktopAvailable, setDesktopAvailable] = useState(false);

  useEffect(() => {
    setDesktopAvailable(Boolean(window.feonix && typeof window.feonix.setSetting === 'function'));
  }, []);

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
    <div className="pk-settings-menu pk-assistant-settings">
      <div className="pk-settings-title">Assistant Settings</div>

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

      <div className="pk-set-divider" />

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
  );
}
