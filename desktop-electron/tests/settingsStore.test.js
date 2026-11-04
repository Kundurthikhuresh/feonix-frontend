// Settings file upgrade: a file from an older build that saved 'mic' as its
// default must listen to both sides after updating; a choice made in this
// build is kept. Real SettingsStore, temporary folders.
// Run: node --test tests/settingsStore.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { SettingsStore } = require('../src/main/settingsStore');

function folderWith(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feonix-settings-'));
  if (contents) fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify(contents));
  return dir;
}
const saved = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8'));

test("an older build's saved 'mic' default becomes 'both' (interviewer audio is captured)", () => {
  const dir = folderWith({ audioSource: 'mic', stealthMode: false, opacity: 100 });
  const store = new SettingsStore(dir);
  assert.equal(store.get('audioSource'), 'both');
  assert.equal(saved(dir).audioSource, 'both', 'written back so it happens once');
  assert.equal(saved(dir).settingsVersion, 2);
  assert.equal(store.get('opacity'), 100, 'other settings untouched');
});

test("'Microphone only' chosen in this build is kept", () => {
  const dir = folderWith(null);
  new SettingsStore(dir).set('audioSource', 'mic');
  assert.equal(new SettingsStore(dir).get('audioSource'), 'mic');
});

test("an older build's 'tab' choice is kept", () => {
  const dir = folderWith({ audioSource: 'tab' });
  assert.equal(new SettingsStore(dir).get('audioSource'), 'tab');
});

test('a new install listens to both sides', () => {
  assert.equal(new SettingsStore(folderWith(null)).get('audioSource'), 'both');
});

test('the version marker is not handed to the copilot page as a setting', () => {
  const dir = folderWith({ audioSource: 'mic' });
  assert.equal('settingsVersion' in new SettingsStore(dir).getAll(), false);
});
