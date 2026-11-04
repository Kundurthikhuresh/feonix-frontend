// Private Mode → window capture protection. Electron is replaced by a stand-in
// whose windows record every setContentProtection call; the settings store is
// the real one, writing to a temporary folder.
// Run: node --test tests/privateMode.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

const openWindows = [];
class FakeWindow {
  constructor() {
    this.calls = [];
    this.destroyed = false;
    this.webContents = { isDestroyed: () => false, invalidate() {} };
    openWindows.push(this);
  }
  isDestroyed() { return this.destroyed; }
  setContentProtection(on) { this.calls.push(on); }
  getBounds() { return { x: 0, y: 0, width: 800, height: 600 }; }
  setBounds() {}
}
FakeWindow.getAllWindows = () => openWindows.filter((w) => !w.destroyed);

const realLoad = Module._load;
Module._load = function load(request, ...rest) {
  if (request === 'electron') return { BrowserWindow: FakeWindow };
  return realLoad.call(this, request, ...rest);
};

const { isPrivateMode, syncPrivateMode, setPrivateMode } = require('../src/main/privateMode');
const SettingsStore = require('../src/main/settingsStore');

const StoreClass = SettingsStore.SettingsStore || SettingsStore;
function newStore(dir) {
  return new StoreClass(dir || fs.mkdtempSync(path.join(os.tmpdir(), 'feonix-pm-')));
}
const last = (w) => w.calls[w.calls.length - 1];

test('a setting that was never saved is OFF: windows are capturable', () => {
  const store = newStore();
  const w = new FakeWindow();
  assert.equal(isPrivateMode(store), false);
  syncPrivateMode(store, { win: w, force: true });
  assert.equal(last(w), false);
});

test('ON protects every open window, OFF unprotects them, with no restart', () => {
  const store = newStore();
  const overlay = new FakeWindow();
  const main = new FakeWindow();
  assert.equal(setPrivateMode(store, true), true);
  assert.equal(last(overlay), true);
  assert.equal(last(main), true);
  assert.equal(setPrivateMode(store, false), false);
  assert.equal(last(overlay), false);
  assert.equal(last(main), false);
});

test('switching many times always ends in the last chosen state', () => {
  const store = newStore();
  const w = new FakeWindow();
  for (const on of [true, false, true, true, false, false, true, false]) {
    setPrivateMode(store, on);
    assert.equal(last(w), on);
    assert.equal(isPrivateMode(store), on);
  }
});

test('periodic re-checks (screen-share detection) never turn Private Mode on and never re-apply needlessly', () => {
  const store = newStore();
  const w = new FakeWindow();
  setPrivateMode(store, false);
  const before = w.calls.length;
  for (let i = 0; i < 20; i++) syncPrivateMode(store);
  assert.equal(w.calls.length, before, 'no repeated calls while nothing changed');
  assert.equal(last(w), false);
});

test('a window opened later (hide/show, re-created overlay) gets the current state', () => {
  const store = newStore();
  setPrivateMode(store, true);
  const reopened = new FakeWindow();
  syncPrivateMode(store, { win: reopened });
  assert.equal(last(reopened), true);
  setPrivateMode(store, false);
  syncPrivateMode(store, { win: reopened }); // e.g. the show handler
  assert.equal(last(reopened), false);
});

test('destroyed windows are skipped without errors', () => {
  const store = newStore();
  const gone = new FakeWindow();
  gone.destroyed = true;
  assert.doesNotThrow(() => setPrivateMode(store, true));
  assert.equal(gone.calls.length, 0);
});

test('the saved state survives an app restart', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feonix-pm-'));
  setPrivateMode(newStore(dir), true);
  assert.equal(isPrivateMode(newStore(dir)), true);
  setPrivateMode(newStore(dir), false);
  assert.equal(isPrivateMode(newStore(dir)), false);
});

test('only an explicit true counts as ON', () => {
  for (const value of [false, undefined, null, 0, 'false', '']) {
    const store = { get: () => value };
    assert.equal(isPrivateMode(store), false, `value ${JSON.stringify(value)}`);
  }
  assert.equal(isPrivateMode({ get: () => true }), true);
});
