const { BrowserWindow } = require('electron');

/**
 * Private Mode: the one place that decides whether FeonixAI windows are
 * excluded from screen capture.
 *
 *   ON  → setContentProtection(true): screenshots and screen sharing that use
 *         the normal Windows capture APIs show nothing where the window is.
 *   OFF → setContentProtection(false): the window is captured like any other.
 *
 * On Windows, Electron applies this with SetWindowDisplayAffinity:
 * WDA_EXCLUDEFROMCAPTURE when on (Windows 10 version 2004 and later; older
 * builds fall back to WDA_MONITOR, which shows the window as black instead of
 * leaving it out) and WDA_NONE when off. It covers captures made through the
 * desktop duplication / Graphics Capture APIs (Zoom, Teams, Meet in Chrome or
 * Edge, the Snipping Tool, this app's own screenshot). It cannot stop a
 * camera, a capture card, or software that reads the screen another way.
 *
 * Only an explicit true counts as on: a setting that was never saved is off,
 * matching the default in settingsStore.js.
 */

// Last state applied to each window, so periodic re-checks (screen-share
// detection) do not re-apply it and repaint the window for nothing.
const applied = new WeakMap();

function isPrivateMode(settingsStore) {
  return Boolean(settingsStore && settingsStore.get('stealthMode') === true);
}

function protect(win, enabled, force, logger) {
  if (!win || win.isDestroyed()) return;
  if (!force && applied.get(win) === enabled) return;
  try {
    win.setContentProtection(enabled);
    applied.set(win, enabled);
    // Windows does not always redraw a layered (transparent) window when its
    // display affinity changes, so a capture could keep showing the old state
    // until something else repaints/re-evaluates it. Shifting bounds by 1px
    // and immediately restoring forces DWM (Desktop Window Manager) to apply
    // the new display affinity (WDA_NONE vs WDA_EXCLUDEFROMCAPTURE).
    if (process.platform === 'win32') {
      try {
        if (typeof win.isMinimized === 'function' ? !win.isMinimized() : true) {
          const b = win.getBounds();
          if (b && typeof b.width === 'number') {
            win.setBounds({ ...b, width: b.width + 1 });
            win.setBounds(b);
          }
        }
      } catch { }
      if (win.webContents && !win.webContents.isDestroyed()) {
        try { win.webContents.invalidate(); } catch { }
      }
    }
  } catch (err) {
    if (logger) logger.warn('setContentProtection failed:', err.message);
  }
}

/**
 * Applies the saved Private Mode to one window (`win`) or to every open
 * window. `force` re-applies even if nothing changed: used when the user
 * toggles the setting. Returns the state applied.
 */
function syncPrivateMode(settingsStore, { win = null, force = false, logger = null } = {}) {
  const enabled = isPrivateMode(settingsStore);
  const windows = win ? [win] : BrowserWindow.getAllWindows();
  windows.forEach((w) => protect(w, enabled, force, logger));
  return enabled;
}

/** Saves Private Mode and applies it to every window immediately. */
function setPrivateMode(settingsStore, enabled, logger = null) {
  settingsStore.set('stealthMode', enabled === true);
  const on = syncPrivateMode(settingsStore, { force: true, logger });
  if (logger) logger.info(`Private Mode ${on ? 'ON' : 'OFF'}: setContentProtection(${on}) on all windows`);
  return on;
}

module.exports = { isPrivateMode, syncPrivateMode, setPrivateMode };
