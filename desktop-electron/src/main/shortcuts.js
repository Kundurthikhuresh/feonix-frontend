const { globalShortcut } = require('electron');
const { getOverlayWindow, getMainWindow, bringToFront } = require('./window');
const { syncPrivateMode } = require('./privateMode');

// Tracks what's actually registered (not just what settings say) so
// unregisterAll only ever touches accelerators this module itself owns, and
// so re-registering after a settings change cleanly replaces the old ones
// instead of ever double-registering the same combo.
const registered = {
  toggle: null,
  hide: null,
  screenshot: null,
  listenToggle: null,
  answer: null,
};

function sendToOverlay(channel) {
  const win = getOverlayWindow();
  if (win && !win.isDestroyed()) win.webContents.send(channel);
}

function handleShortcutHide(settingsStore) {
  const overlayWin = getOverlayWindow();
  const mainWin = getMainWindow();

  const overlayLive = overlayWin && !overlayWin.isDestroyed();
  const mainLive = mainWin && !mainWin.isDestroyed();

  const isOverlayVisible = overlayLive && overlayWin.isVisible() && !overlayWin.isMinimized();
  const isMainVisible = mainLive && mainWin.isVisible() && !mainWin.isMinimized();

  // If ANY window is currently visible, hide it!
  if (isOverlayVisible || isMainVisible) {
    if (isOverlayVisible) {
      overlayWin.hide();
      try { overlayWin.webContents.send('feonix:shortcut-hide', { visible: false }); } catch { }
    }
    if (isMainVisible) {
      mainWin.hide();
      try { mainWin.webContents.send('feonix:shortcut-hide', { visible: false }); } catch { }
    }
    return;
  }

  // Neither is visible: open/restore the active window (overlay takes precedence if created)
  const targetWin = overlayLive ? overlayWin : (mainLive ? mainWin : null);
  if (targetWin) {
    const alwaysOnTop = settingsStore ? Boolean(settingsStore.get('alwaysOnTop')) : true;
    if (targetWin.isMinimized()) targetWin.restore();
    targetWin.show();
    bringToFront(targetWin, alwaysOnTop);
    try {
      targetWin.focus();
      targetWin.webContents.focus();
    } catch { }
    syncPrivateMode(settingsStore, { win: targetWin });
    try {
      targetWin.webContents.send('feonix:shortcut-hide', { visible: true });
    } catch { }
  }
}

function handleShortcutToggle(settingsStore) {
  const overlayWin = getOverlayWindow();
  const mainWin = getMainWindow();
  const win = (overlayWin && !overlayWin.isDestroyed()) ? overlayWin : (mainWin && !mainWin.isDestroyed() ? mainWin : null);
  if (win) {
    const alwaysOnTop = settingsStore ? Boolean(settingsStore.get('alwaysOnTop')) : true;
    if (win.isMinimized()) win.restore();
    win.show();
    bringToFront(win, alwaysOnTop);
    syncPrivateMode(settingsStore, { win });
    try { win.webContents.send('feonix:shortcut-toggle'); } catch { }
  }
}

function unregisterShortcuts() {
  for (const key of Object.keys(registered)) {
    if (registered[key]) {
      globalShortcut.unregister(registered[key]);
      registered[key] = null;
    }
  }
}

/**
 * (Re)registers every global accelerator from the settings store. Global
 * because minimized/hidden explicitly mean the overlay window may not have
 * OS focus — a renderer-level keydown listener (used for the rest of the
 * HUD's shortcuts, which only make sense while it's focused) can't catch a
 * key press while some other app is focused, which is the whole point of
 * "restore the assistant from anywhere," and equally the point of being
 * able to snap a screenshot, toggle the mic, or ask for an answer while
 * some other window (the meeting call, the IDE) has focus instead.
 */
function registerShortcuts(settingsStore) {
  unregisterShortcuts();

  const bindings = [
    ['toggle', settingsStore.get('shortcutToggle'), 'feonix:shortcut-toggle'],
    ['hide', settingsStore.get('shortcutHide'), 'feonix:shortcut-hide'],
    ['screenshot', settingsStore.get('shortcutScreenshot'), 'feonix:shortcut-screenshot'],
    ['listenToggle', settingsStore.get('shortcutListenToggle'), 'feonix:shortcut-listen-toggle'],
    ['answer', settingsStore.get('shortcutAnswer'), 'feonix:shortcut-answer'],
  ];

  for (const [key, accelerator, channel] of bindings) {
    if (!accelerator) continue;
    try {
      const handler = (key === 'hide')
        ? () => handleShortcutHide(settingsStore)
        : (key === 'toggle')
          ? () => handleShortcutToggle(settingsStore)
          : () => sendToOverlay(channel);

      if (globalShortcut.register(accelerator, handler)) {
        registered[key] = accelerator;
      }
    } catch { /* malformed accelerator or already claimed by the OS — leave unregistered */ }
  }
}

module.exports = { registerShortcuts, unregisterShortcuts };
