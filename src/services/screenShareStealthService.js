/**
 * Screen Share Stealth & Invisibility Service
 *
 * Provides real-time detection, anti-capture protection, and auto-hide management
 * for the FeonixAI Copilot HUD across 11 major meeting and sharing platforms:
 * 1. WhatsApp — screen sharing
 * 2. Discord — screen/application sharing
 * 3. Cisco Webex — screen/application sharing
 * 4. Jitsi Meet — screen/window/tab sharing
 * 5. Slack Huddles — screen/window sharing
 * 6. Loom — screen/window/tab sharing
 * 7. GoTo Meeting — screen/application sharing
 * 8. Whereby — screen/window/tab sharing
 * 9. Google Meet — screen/window/tab sharing
 * 10. Zoom — screen/application sharing
 * 11. Microsoft Teams — screen/application sharing
 */

export const SCREEN_SHARE_PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'screen',
    shareType: 'screen sharing',
    badge: 'End-to-End Encrypted',
    color: '#25d366',
    description: 'Stealth teleprompter HUD hidden from WhatsApp desktop & web screen shares.',
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'screen/application',
    shareType: 'screen/application sharing',
    badge: 'Go Live Bypass',
    color: '#5865f2',
    description: 'Anti-capture protection prevents copilot overlay from showing in Discord streams & application windows.',
  },
  {
    id: 'webex',
    name: 'Cisco Webex',
    category: 'screen/application',
    shareType: 'screen/application sharing',
    badge: 'Enterprise Guard',
    color: '#00bceb',
    description: 'Zero-visibility stealth protection for Webex meetings and presentation sharing.',
  },
  {
    id: 'jitsi',
    name: 'Jitsi Meet',
    category: 'screen/window/tab',
    shareType: 'screen/window/tab sharing',
    badge: 'WebRTC Air-Gap',
    color: '#1774fd',
    description: 'Invisible to Jitsi Meet screen, application window, and tab sharing feeds.',
  },
  {
    id: 'slackhuddles',
    name: 'Slack Huddles',
    category: 'screen/window',
    shareType: 'screen/window sharing',
    badge: 'Huddle Shield',
    color: '#ecb22e',
    description: 'Complete overlay invisibility during Slack Huddles screen and window sharing.',
  },
  {
    id: 'loom',
    name: 'Loom',
    category: 'screen/window/tab',
    shareType: 'screen/window/tab sharing',
    badge: 'Recorder Bypass',
    color: '#625df5',
    description: 'Excludes copilot HUD from Loom tab recordings, full desktop captures, and async video messages.',
  },
  {
    id: 'gotomeeting',
    name: 'GoTo Meeting',
    category: 'screen/application',
    shareType: 'screen/application sharing',
    badge: 'Enterprise Shield',
    color: '#ff7a00',
    description: 'Hardware-level display affinity masks the copilot from GoTo Meeting screenshares.',
  },
  {
    id: 'whereby',
    name: 'Whereby',
    category: 'screen/window/tab',
    shareType: 'screen/window/tab sharing',
    badge: 'Browser Room Guard',
    color: '#ff6b6b',
    description: 'Invisible to Whereby video rooms during full screen, window, or browser tab shares.',
  },
  {
    id: 'meet',
    name: 'Google Meet',
    category: 'screen/window/tab',
    shareType: 'screen/window/tab sharing',
    badge: 'Chrome Native Sync',
    color: '#00897b',
    description: '100% invisible to Google Meet tab, window, and entire screen presentations.',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'screen/application',
    shareType: 'screen/application sharing',
    badge: 'Direct Hook Stealth',
    color: '#2d8cff',
    description: 'Excludes copilot from Zoom meeting window captures and full screen shares.',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'screen/application',
    shareType: 'screen/application sharing',
    badge: 'Enterprise Verified',
    color: '#6264a7',
    description: 'Seamless invisibility during MS Teams corporate meetings, live presentations, and recording sessions.',
  },
];

/**
 * Initializes screen share stealth event listener.
 * If running inside the desktop Electron shell, connects to window.feonix bridge.
 * Returns an unsubscribe callback.
 */
export function subscribeToScreenShareEvents(onStateChange) {
  if (typeof window === 'undefined') return () => { };

  if (window.feonix && typeof window.feonix.onScreenShareStateChange === 'function') {
    return window.feonix.onScreenShareStateChange((data) => {
      if (typeof onStateChange === 'function') {
        onStateChange(data);
      }
    });
  }

  return () => { };
}

/**
 * Returns supported platforms list.
 */
export function getSupportedScreenSharePlatforms() {
  return SCREEN_SHARE_PLATFORMS;
}
