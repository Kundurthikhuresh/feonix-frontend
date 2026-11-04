const test = require('node:test');
const assert = require('node:assert/strict');

// Mock window objects
function makeMockWin(initialVisible = true) {
  let visible = initialVisible;
  let minimized = false;
  let destroyed = false;
  const messages = [];

  return {
    isVisible: () => visible && !destroyed,
    isMinimized: () => minimized,
    isDestroyed: () => destroyed,
    hide: () => { visible = false; },
    show: () => { visible = true; },
    restore: () => { minimized = false; },
    focus: () => {},
    setAlwaysOnTop: () => {},
    destroy: () => { destroyed = true; },
    webContents: {
      focus: () => {},
      send: (channel, data) => messages.push({ channel, data }),
    },
    _getMessages: () => messages,
  };
}

test('handleShortcutHide hides mainWindow when visible, and restores when hidden', () => {
  let overlayWin = null;
  let mainWin = makeMockWin(true);

  function handleShortcutHide(settingsStore) {
    const overlayLive = overlayWin && !overlayWin.isDestroyed();
    const mainLive = mainWin && !mainWin.isDestroyed();

    const isOverlayVisible = overlayLive && overlayWin.isVisible() && !overlayWin.isMinimized();
    const isMainVisible = mainLive && mainWin.isVisible() && !mainWin.isMinimized();

    if (isOverlayVisible || isMainVisible) {
      if (isOverlayVisible) {
        overlayWin.hide();
        overlayWin.webContents.send('feonix:shortcut-hide', { visible: false });
      }
      if (isMainVisible) {
        mainWin.hide();
        mainWin.webContents.send('feonix:shortcut-hide', { visible: false });
      }
      return;
    }

    const targetWin = overlayLive ? overlayWin : (mainLive ? mainWin : null);
    if (targetWin) {
      if (targetWin.isMinimized()) targetWin.restore();
      targetWin.show();
      targetWin.webContents.send('feonix:shortcut-hide', { visible: true });
    }
  }

  // 1. Initially visible -> Press Ctrl+Shift+H -> Should hide!
  assert.equal(mainWin.isVisible(), true);
  handleShortcutHide();
  assert.equal(mainWin.isVisible(), false, 'mainWindow should be hidden');

  // 2. Currently hidden -> Press Ctrl+Shift+H again -> Should show!
  handleShortcutHide();
  assert.equal(mainWin.isVisible(), true, 'mainWindow should be restored');

  // 3. Press again -> Should hide!
  handleShortcutHide();
  assert.equal(mainWin.isVisible(), false, 'mainWindow should be hidden again');
});

test('handleShortcutHide hides overlayWindow when visible, and restores when hidden', () => {
  let overlayWin = makeMockWin(true);
  let mainWin = makeMockWin(false);

  function handleShortcutHide(settingsStore) {
    const overlayLive = overlayWin && !overlayWin.isDestroyed();
    const mainLive = mainWin && !mainWin.isDestroyed();

    const isOverlayVisible = overlayLive && overlayWin.isVisible() && !overlayWin.isMinimized();
    const isMainVisible = mainLive && mainWin.isVisible() && !mainWin.isMinimized();

    if (isOverlayVisible || isMainVisible) {
      if (isOverlayVisible) {
        overlayWin.hide();
        overlayWin.webContents.send('feonix:shortcut-hide', { visible: false });
      }
      if (isMainVisible) {
        mainWin.hide();
        mainWin.webContents.send('feonix:shortcut-hide', { visible: false });
      }
      return;
    }

    const targetWin = overlayLive ? overlayWin : (mainLive ? mainWin : null);
    if (targetWin) {
      if (targetWin.isMinimized()) targetWin.restore();
      targetWin.show();
      targetWin.webContents.send('feonix:shortcut-hide', { visible: true });
    }
  }

  // 1. Overlay visible -> Press Ctrl+Shift+H -> Should hide!
  assert.equal(overlayWin.isVisible(), true);
  handleShortcutHide();
  assert.equal(overlayWin.isVisible(), false, 'overlayWindow should be hidden');

  // 2. Hidden -> Press Ctrl+Shift+H again -> Should restore!
  handleShortcutHide();
  assert.equal(overlayWin.isVisible(), true, 'overlayWindow should be restored');
});

