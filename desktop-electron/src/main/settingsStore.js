// Persistent assistant settings — a plain JSON file under userData, same
// synchronous-fs pattern as ../logger.js. Small enough that pulling in a
// dependency (electron-store) for it isn't worth the added surface.
const fs = require('fs');
const path = require('path');

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
  stealthMode: false,
  autoHideOnShare: false,
  audioSource: 'both',
};

// Saved with the settings. Files without it come from builds before 2: those
// offered only 'mic' and 'tab' and saved 'mic' as the default, which then kept
// newer builds from ever capturing the interviewer's (system) audio.
const SETTINGS_VERSION = 2;

const ASSISTANT_SIZES = ['compact', 'normal', 'large', 'xlarge'];
const AUDIO_SOURCES = ['both', 'mic', 'tab'];

// A handful of safe presets rather than free-form key capture — the
// renderer only ever offers these, and the main process re-validates
// against the same list before ever calling globalShortcut.register, so a
// compromised renderer can't smuggle in an accelerator string that isn't
// actually one of these.
const SHORTCUT_PRESETS = [
  'CommandOrControl+Shift+Space',
  'CommandOrControl+Shift+A',
  'CommandOrControl+Shift+F',
  'CommandOrControl+Alt+Space',
];
const HIDE_SHORTCUT_PRESETS = [
  'CommandOrControl+Shift+H',
  'CommandOrControl+Shift+X',
  'CommandOrControl+Alt+H',
];
const SCREENSHOT_SHORTCUT_PRESETS = [
  'CommandOrControl+Shift+S',
  'CommandOrControl+Shift+C',
  'CommandOrControl+Alt+S',
];
const LISTEN_TOGGLE_SHORTCUT_PRESETS = [
  'CommandOrControl+Shift+P',
  'CommandOrControl+Shift+L',
  'CommandOrControl+Alt+P',
];
const ANSWER_SHORTCUT_PRESETS = [
  'CommandOrControl+Shift+G',
  'CommandOrControl+Shift+Enter',
  'CommandOrControl+Alt+G',
];

// Keys a renderer is allowed to touch at all. Settings feed OS-level APIs
// (globalShortcut accelerators, login items) — accepting arbitrary keys or
// values from feonix:set-setting would let a compromised page smuggle
// something into that path, so every value is re-derived here rather than
// trusted as given.
const ALLOWED_KEYS = new Set(Object.keys(DEFAULT_SETTINGS));

function clampOpacity(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.opacity;
  return Math.max(30, Math.min(100, Math.round(n)));
}

function sanitize(key, value) {
  switch (key) {
    case 'shortcutToggle':
      return SHORTCUT_PRESETS.includes(value) ? value : DEFAULT_SETTINGS.shortcutToggle;
    case 'shortcutHide':
      return HIDE_SHORTCUT_PRESETS.includes(value) ? value : DEFAULT_SETTINGS.shortcutHide;
    case 'shortcutScreenshot':
      return SCREENSHOT_SHORTCUT_PRESETS.includes(value) ? value : DEFAULT_SETTINGS.shortcutScreenshot;
    case 'shortcutListenToggle':
      return LISTEN_TOGGLE_SHORTCUT_PRESETS.includes(value) ? value : DEFAULT_SETTINGS.shortcutListenToggle;
    case 'shortcutAnswer':
      return ANSWER_SHORTCUT_PRESETS.includes(value) ? value : DEFAULT_SETTINGS.shortcutAnswer;
    case 'opacity':
      return clampOpacity(value);
    case 'assistantSize':
      return ASSISTANT_SIZES.includes(value) ? value : DEFAULT_SETTINGS.assistantSize;
    case 'audioSource':
      return AUDIO_SOURCES.includes(value) ? value : DEFAULT_SETTINGS.audioSource;
    case 'startMinimized':
    case 'alwaysOnTop':
    case 'launchAtStartup':
    case 'showTrayIcon':
    case 'rememberPosition':
    case 'voiceEnabled':
    case 'stealthMode':
    case 'autoHideOnShare':
      return Boolean(value);
    default:
      return value;
  }
}

class SettingsStore {
  constructor(userDataDir) {
    this.file = path.join(userDataDir, 'settings.json');
    const { values, version } = this._readFromDisk();
    this.data = { ...DEFAULT_SETTINGS, ...values };
    // One-time upgrade of a settings file from an older build: its 'mic' was
    // that build's default, not a choice, so listen to both sides. A user who
    // picks "Microphone only" now keeps it (the file then carries a version).
    if (version !== null && version < SETTINGS_VERSION && this.data.audioSource === 'mic') {
      this.data.audioSource = 'both';
      this._writeToDisk();
    }
  }

  // values: the saved settings that are still valid; version: the saved
  // SETTINGS_VERSION (1 for files from before it existed), or null if there
  // is no settings file yet.
  _readFromDisk() {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      const values = {};
      for (const key of ALLOWED_KEYS) {
        if (key in parsed) values[key] = sanitize(key, parsed[key]);
      }
      const version = Number.isInteger(parsed.settingsVersion) ? parsed.settingsVersion : 1;
      return { values, version };
    } catch {
      return { values: {}, version: null };
    }
  }

  _writeToDisk() {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.writeFileSync(this.file, JSON.stringify({ ...this.data, settingsVersion: SETTINGS_VERSION }, null, 2));
    } catch { /* disk full / permissions — settings just won't persist this run */ }
  }

  getAll() {
    return { ...this.data };
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    if (!ALLOWED_KEYS.has(key)) return this.getAll();
    this.data[key] = sanitize(key, value);
    this._writeToDisk();
    return this.getAll();
  }
}

module.exports = {
  SettingsStore,
  DEFAULT_SETTINGS,
  ASSISTANT_SIZES,
  SHORTCUT_PRESETS,
  HIDE_SHORTCUT_PRESETS,
  SCREENSHOT_SHORTCUT_PRESETS,
  LISTEN_TOGGLE_SHORTCUT_PRESETS,
  ANSWER_SHORTCUT_PRESETS,
};
