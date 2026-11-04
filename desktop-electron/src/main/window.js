const { BrowserWindow, app, shell, screen } = require('electron');
const path = require('path');
const { syncPrivateMode } = require('./privateMode');

// Point this at your deployed web app before building a real release —
// defaults to the local dev server for testing against `npm run dev`.
const WEB_URL = (process.env.FEONIX_WEB_URL || 'http://localhost:3000').replace(/\/+$/, '');

// DevTools are a debugging feature, not something a shipped build should
// expose — they're a direct window into whatever the renderer is holding in
// memory. Available in dev (`npm start`) and disabled in every packaged build.
const DEV_TOOLS_ALLOWED = app ? !app.isPackaged : true;

let mainWindow = null;
let overlayWindow = null;

// Same origin check the web app itself would enforce, applied at the shell
// level: a compromised or misbehaving page inside one of our windows should
// not be able to navigate itself (or spawn a new window) to an arbitrary
// origin. Deep-link handoffs and 'go to dashboard' already go through
// loadURL() from the main process, not renderer-initiated navigation, so
// this doesn't restrict anything the app actually does.
function isTrustedUrl(url) {
  try {
    return new URL(url).origin === new URL(WEB_URL).origin;
  } catch {
    return false;
  }
}

// Windows' foreground-lock: a window created/focused in response to a
// background event (a deep link, a second-instance IPC) usually doesn't
// actually get raised above whatever the user was just clicked into —
// win.focus() returns normally but the browser tab stays on top, which is
// exactly what made the desktop handoff look like it silently did nothing.
// Toggling always-on-top forces the OS to place it above everything else
// regardless of the foreground-lock, which is the standard workaround for
// this on Windows; turning it back off immediately afterward leaves the
// window in a normal (non-pinned) state once it's actually in front.
function bringToFront(win, keepAlwaysOnTop = false) {
  if (!win || win.isDestroyed()) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.setAlwaysOnTop(true);
  win.focus();
  if (!keepAlwaysOnTop) {
    win.setAlwaysOnTop(false);
  }
}

function hardenWindow(win) {
  win.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedUrl(url)) event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrustedUrl(url)) return { action: 'allow' };
    if (/^https?:\/\//i.test(url)) shell.openExternal(url).catch(() => { });
    return { action: 'deny' };
  });
  if (!DEV_TOOLS_ALLOWED) {
    win.webContents.on('devtools-opened', () => win.webContents.closeDevTools());
  }
}

/* The main window is transparent: the start page draws only its card
 * (440px wide plus a 16px margin each side for its shadow), so the window is
 * sized to that card and nothing around it is visible. Tall enough that the
 * card does not need to scroll, within the screen. */
function mainWindowSize() {
  const width = 472;
  let height = 800;
  try {
    height = Math.min(height, screen.getPrimaryDisplay().workAreaSize.height - 40);
  } catch { }
  return { width, height: Math.max(520, height) };
}

function createMainWindow(routePath, settingsStore) {
  const size = mainWindowSize();
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      if (routePath.startsWith('/session-type')) {
        mainWindow.setSize(size.width, size.height);
        mainWindow.center();
      }
    } catch { }
    mainWindow.loadURL(`${WEB_URL}${routePath}`);
    bringToFront(mainWindow);
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    minWidth: 400,
    minHeight: 520,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: DEV_TOOLS_ALLOWED,
    },
  });

  hardenWindow(mainWindow);
  syncPrivateMode(settingsStore, { win: mainWindow, force: true });
  mainWindow.loadURL(`${WEB_URL}${routePath}`);
  bringToFront(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function createOverlayWindow(routePath, settingsStore) {
  const alwaysOnTop = settingsStore ? Boolean(settingsStore.get('alwaysOnTop')) : true;

  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.loadURL(`${WEB_URL}${routePath}`);
    bringToFront(overlayWindow, alwaysOnTop);
    syncPrivateMode(settingsStore, { win: overlayWindow });
    return overlayWindow;
  }

  overlayWindow = new BrowserWindow({
    // 640 was narrower than the topbar's button row actually needs (Start
    // Recording + Answer + Screenshot + Chat on the left, drag/expand/
    // minimize/Hide/settings/End on the right) — it fit only by clipping
    // whichever button ran past the edge, End Interview most often, since
    // .pk-shell clips overflow rather than shrinking it.
    width: 900,
    height: 640,
    minWidth: 400,
    minHeight: 180,
    frame: false,
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
    trafficLightPosition: process.platform === 'darwin' ? { x: -100, y: -100 } : undefined,
    transparent: true,
    alwaysOnTop,
    // Not user-resizable (a transparent window has no resize edges anyway):
    // with it on, dragging the native drag area to a screen edge let Windows
    // snap/maximize the window, and the bottom-anchored HUD jumped to the
    // bottom of the screen. setBounds() still resizes it programmatically.
    resizable: false,
    skipTaskbar: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: DEV_TOOLS_ALLOWED,
      backgroundThrottling: false,
    },
  });

  hardenWindow(overlayWindow);
  // Only the copilot's own Expand button may maximize this window.
  overlayWindow.on('maximize', () => {
    if (!overlayWindow.feonixAllowMaximize) overlayWindow.unmaximize();
  });
  overlayWindow.on('unmaximize', () => {
    overlayWindow.feonixAllowMaximize = false;
  });
  if (alwaysOnTop) {
    if (process.platform === 'darwin') {
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      overlayWindow.setAlwaysOnTop(true);
    }
  }

  // Screen Share Invisibility (Anti-capture OS protection):
  // Automatically hides the copilot overlay from:
  // 1. WhatsApp (screen sharing)
  // 2. Discord (screen/application sharing)
  // 3. Cisco Webex (screen/application sharing)
  // 4. Jitsi Meet (screen/window/tab sharing)
  // 5. Slack Huddles (screen/window sharing)
  // 6. Loom (screen/window/tab sharing)
  // 7. GoTo Meeting (screen/application sharing)
  // 8. Whereby (screen/window/tab sharing)
  // 9. Google Meet, 10. Zoom, 11. Microsoft Teams, OBS, and OS screen recorders.
  syncPrivateMode(settingsStore, { win: overlayWindow, force: true });

  overlayWindow.webContents.on('did-fail-load', (_e, errorCode, errorDescription, validatedURL) => {
    console.error('overlay failed to load:', errorCode, errorDescription, validatedURL);
  });
  // bringToFront's win.focus() below fires immediately after loadURL(), i.e.
  // before the page (and its Ctrl+V paste listener) actually exists yet.
  // That's enough to visually raise the window, but keyboard focus doesn't
  // reliably stick to a still-loading page — most noticeable right after
  // using an external screenshot tool, whose own window can still hold OS
  // input focus until something explicitly re-claims it. Re-asserting focus
  // once the page has actually finished loading closes that gap; this
  // listener stays registered for the window's life, so it also re-fires on
  // every reused-window navigation below, not just this first creation.
  overlayWindow.webContents.on('did-finish-load', () => {
    // Re-read rather than close over `alwaysOnTop` — this listener stays
    // attached across reused-window navigations, where the setting may have
    // changed since this window was first created.
    const currentAlwaysOnTop = settingsStore ? Boolean(settingsStore.get('alwaysOnTop')) : alwaysOnTop;
    bringToFront(overlayWindow, currentAlwaysOnTop);
    syncPrivateMode(settingsStore, { win: overlayWindow });
    overlayWindow.webContents.focus();
  });
  overlayWindow.loadURL(`${WEB_URL}${routePath}`);
  bringToFront(overlayWindow, alwaysOnTop);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

module.exports = {
  WEB_URL,
  DEV_TOOLS_ALLOWED,
  hardenWindow,
  isTrustedUrl,
  bringToFront,
  createMainWindow,
  createOverlayWindow,
  getMainWindow: () => mainWindow,
  getOverlayWindow: () => overlayWindow,
};
