"use client";

import React from 'react';
import {
  EyeOff,
  Video,
  CheckCircle2,
} from 'lucide-react';

const SUPPORTED_APPS = [
  'Zoom Video Meetings',
  'Microsoft Teams',
  'Google Meet',
  'Webex by Cisco',
  'CoderPad Live',
  'HackerRank Assessment',
  'LeetCode Live Interviews',
  'CodeSignal Coding Sessions',
];

export default function DesktopExperienceSection() {
  return (
    <section id="security" style={{ padding: '60px 0' }}>
      <div className="px-container">
        {/* Desktop Strip Banner */}
        <div className="px-desktop-strip">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '10px' }}>
              <EyeOff size={15} />
              <span>Patented Hardware Compositor Exclusion</span>
            </div>
            <h3 className="px-desktop-heading" style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 14px 0', lineHeight: 1.25 }}>
              100% Invisible to Screen-Sharing & Recording
            </h3>
            <p className="px-desktop-desc" style={{ fontSize: '14.5px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              When sharing your full desktop or application window on Zoom, Teams, or Meet, interviewers see only your code editor or browser tab. Feonix AI uses native desktop display affinity flags to completely exclude the teleprompter overlay from video encoders.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="px-desktop-bullet" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span><strong>No Window Bleed:</strong> Zero ghost pixels or recording capture on macOS & Windows.</span>
              </div>
              <div className="px-desktop-bullet" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span><strong>Zero Audio Recording Storage:</strong> Processed ephemerally in RAM; never saved to disk or used for training.</span>
              </div>
              <div className="px-desktop-bullet" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span><strong>TLS 1.3 Transport Security:</strong> 256-bit encrypted streaming API tunnel directly to your inference instance.</span>
              </div>
            </div>
          </div>

          <div>
            <div className="px-desktop-subheading" style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
              Seamless Compatibility Across Platforms
            </div>
            <div className="px-platform-pills">
              {SUPPORTED_APPS.map((app) => (
                <div key={app} className="px-platform-pill">
                  <Video size={13} style={{ color: '#38bdf8' }} />
                  <span>{app}</span>
                </div>
              ))}
            </div>

            {/* Architecture Code Snippet Callout */}
            <div style={{ marginTop: '22px', background: 'rgba(5, 8, 14, 0.92)', border: '1px solid var(--px-border)', borderRadius: '10px', padding: '14px 18px', fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>
              <div style={{ color: '#10b981', marginBottom: '4px' }}>// Verified Desktop Compositor Flag</div>
              <div style={{ color: '#f8fafc', fontWeight: 700 }}>SetWindowDisplayAffinity(hWnd, WDA_EXCLUDEFROMCAPTURE);</div>
              <div style={{ color: '#64748b', marginTop: '4px' }}>// Result: Excluded from screen capture pipelines</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
