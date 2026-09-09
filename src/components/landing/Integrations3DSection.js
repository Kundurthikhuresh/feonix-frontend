"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Video, Code2, Database, MessageSquare, ShieldCheck, Zap, Layers, Cpu, ArrowRight, Play, CheckCircle2, Terminal, Sparkles } from 'lucide-react';

const Integrations3DCanvas = dynamic(() => import('../3d/Integrations3DCanvas'), {
  ssr: false,
  loading: () => <div className="integrations-canvas-placeholder" />
});

const INTEGRATIONS_DATA = {
  codesignal: {
    name: 'CodeSignal Algorithmic Copilot',
    category: 'coding',
    icon: Code2,
    latency: '65 ms',
    mode: 'OCR Screen Parser + AST Engine',
    status: 'Algorithmic Copilot Active',
    codeHeader: 'FEONIX AI // CODESIGNAL OPTIMAL SOLVER',
    codeSnippet: [
      '# Problem: Optimal Two Sum with O(N) Hash Map',
      'def solve_two_sum(nums: list[int], target: int) -> list[int]:',
      '    seen = {} # O(1) Hash Map lookup',
      '    for i, num in enumerate(nums):',
      '        diff = target - num',
      '        if diff in seen:',
      '            return [seen[diff], i]',
      '        seen[num] = i',
      '    return [] # Optimal O(N) Time | O(N) Space'
    ],
    description: 'Real-time algorithm problem scanning with automatic edge case verification and complexity analysis.',
    highlights: ['Instant problem statement extraction', 'Time & Space complexity breakdown', 'AST Code syntax highlighting']
  },
  leetcode: {
    name: 'LeetCode Pattern Recognition Engine',
    category: 'coding',
    icon: Code2,
    latency: '68 ms',
    mode: 'Visual Code Inspector',
    status: 'Optimal Pattern Generator',
    codeHeader: 'FEONIX AI // LEETCODE PATTERN ENGINE',
    codeSnippet: [
      '// Dynamic Programming: Longest Increasing Subsequence',
      'function lengthOfLIS(nums) {',
      '  const dp = new Array(nums.length).fill(1);',
      '  for (let i = 0; i < nums.length; i++) {',
      '    for (let j = 0; j < i; j++) {',
      '      if (nums[i] > nums[j]) dp[i] = Math.max(dp[i], dp[j] + 1);',
      '    }',
      '  }',
      '  return Math.max(...dp); // Verified 100% Pass Rate',
      '}'
    ],
    description: 'Recognizes classic algorithmic patterns instantly and presents structured breakdown with test cases.',
    highlights: ['Pattern recognition engine (DP, Trees, Graphs)', 'Step-by-step intuition cues', 'Clean code templates']
  },
  hackerrank: {
    name: 'HackerRank Multi-Language Engine',
    category: 'coding',
    icon: Code2,
    latency: '70 ms',
    mode: 'Multi-Language AST Target',
    status: 'Live Solution Generator',
    codeHeader: 'FEONIX AI // C++ SHORT PATH GENERATOR',
    codeSnippet: [
      '// C++ Optimal Graph Traversal (Dijkstra Shortest Path)',
      'priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;',
      'dist[src] = 0; pq.push({0, src});',
      'while(!pq.empty()) {',
      '    auto [d, u] = pq.top(); pq.pop();',
      '    if(d > dist[u]) continue;',
      '    for(auto& [v, w] : adj[u]) {',
      '        if(dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }',
      '    }',
      '}'
    ],
    description: 'Generates modular, production-ready code blocks tailored to interview constraints in Python, C++, Java, JS, Rust, Go.',
    highlights: ['Multi-language target support', 'Optimal data structure selector', 'Dry run step guide']
  },
  zoom: {
    name: 'Zoom Stealth Meeting HUD',
    category: 'video',
    icon: Video,
    latency: '78 ms',
    mode: 'Audio Feed + Stealth Overlay',
    status: 'Zero-Lag Native Hook',
    codeHeader: 'FEONIX AI // ZOOM STEALTH HUD [SPEECH RECOGNITION]',
    codeSnippet: [
      '[AUDIO TAP] Live 48kHz stereo stream connected',
      '[INTERVIEWER] "How do you ensure zero data loss in Kafka?"',
      '-------------------------------------------------------',
      '[AI HUD CUE] "Mention min.insync.replicas=2, acks=all,',
      ' and idempotent producer configuration for exact-once',
      ' delivery guarantees across multi-AZ clusters."',
    ],
    description: 'Direct system audio tap with transparent HUD overlay floating over Zoom meeting windows.',
    highlights: ['Multi-speaker diarization', 'Stealth teleprompter mode', 'System tray integration']
  },
  meet: {
    name: 'Google Meet Speech Assistant',
    category: 'video',
    icon: Video,
    latency: '82 ms',
    mode: 'Tab Capture / Desktop Air-Gap',
    status: 'Native Chrome Sync',
    codeHeader: 'FEONIX AI // GOOGLE MEET SPEECH ASSISTANT',
    codeSnippet: [
      '[CHROME EXTENSION] Tab isolated audio buffer active',
      '[QUESTION DETECTED] "Describe a time you handled an outage."',
      '-------------------------------------------------------',
      '[STAR METHOD ANSWER]:',
      'S: Black Friday traffic spike (50k RPS)',
      'T: Prevent API gateway memory exhaustion',
      'A: Introduced sliding window rate-limiter in Redis',
      'R: Restored latency <45ms; 0 dropped checkouts'
    ],
    description: 'Instant web audio streaming directly from Chrome/Edge sessions with auto question boundary detection.',
    highlights: ['Tab-isolated capture', 'Chrome extension bypass', 'Real-time transcript stream']
  },
  teams: {
    name: 'Microsoft Teams Enterprise Hook',
    category: 'video',
    icon: Video,
    latency: '88 ms',
    mode: 'System Virtual Mic & Speaker',
    status: 'Enterprise Certified',
    codeHeader: 'FEONIX AI // MS TEAMS VIRTUAL AUDIO ENGINE',
    codeSnippet: [
      '[ENTERPRISE HOOK] Low-latency direct sound tap active',
      '[SPEAKER DIARIZATION] Candidate & Interviewer isolated',
      '-------------------------------------------------------',
      '[LIVE COPILOT] Real-time architectural query breakdown',
      '[PROMPT CUE] "Highlight OAuth 2.0 PKCE flow & JWT refresh token rotation."'
    ],
    description: 'Seamless integration with Teams enterprise desktop app and web portal.',
    highlights: ['Low-latency virtual audio route', 'Dark HUD contrast', 'Whisper-quiet cues']
  },
  whatsapp: {
    name: 'WhatsApp Screen Sharing Stealth HUD',
    category: 'video',
    icon: Video,
    latency: '72 ms',
    mode: 'Screen Share Guard / Anti-Capture',
    status: 'End-to-End Stealth Active',
    codeHeader: 'FEONIX AI // WHATSAPP SCREEN SHARING STEALTH HUD',
    codeSnippet: [
      '[MEDIA STREAM DETECTED] WhatsApp live screen share active',
      '[OS DISPLAY AFFINITY] WDA_EXCLUDEFROMCAPTURE enforced',
      '-------------------------------------------------------',
      '[STATUS] Copilot HUD invisible to remote WhatsApp viewer',
      '[REAL-TIME CUE] Whisper prompts streamed without capture leak'
    ],
    description: 'Stealth teleprompter HUD floating over WhatsApp desktop & web calls with zero visibility on shared screen streams.',
    highlights: ['100% invisible on WhatsApp screen sharing', 'Zero-lag audio transcript', 'Emergency hotkey hide']
  },
  discord: {
    name: 'Discord Screen & Application Sharing',
    category: 'video',
    icon: Video,
    latency: '75 ms',
    mode: 'Go Live / Window Stream Bypass',
    status: 'Stream Guard Active',
    codeHeader: 'FEONIX AI // DISCORD GO LIVE SCREEN STEALTH',
    codeSnippet: [
      '[DISCORD HOOK] Go Live stream session detected',
      '[DISPLAY AFFINITY] Window capture bypass verified',
      '-------------------------------------------------------',
      '[AI HUD ACTIVE] Code solution overlay visible to candidate only',
      '[TELEMETRY] 0% frame bleed into Discord application capture'
    ],
    description: 'Anti-capture protection prevents copilot overlay from displaying in Discord Go Live streams and screen shares.',
    highlights: ['Discord Go Live invisibility', 'Application-share mask', 'Sub-80ms question solver']
  },
  webex: {
    name: 'Cisco Webex Enterprise Screen Stealth',
    category: 'video',
    icon: Video,
    latency: '80 ms',
    mode: 'Enterprise Meeting & App Share Hook',
    status: 'Enterprise Shield Active',
    codeHeader: 'FEONIX AI // CISCO WEBEX SCREEN PROTECTION',
    codeSnippet: [
      '[CISCO WEBEX] Enterprise meeting session connected',
      '[CAPTURE SHIELD] Application share exclusion enabled',
      '-------------------------------------------------------',
      '[QUESTION CAPTURED] "Explain distributed transactions with 2PC."',
      '[STAR PROMPT] "Cover Prepare, Commit phase, and single point failure of coordinator."'
    ],
    description: 'Seamless stealth protection during Cisco Webex presentations, application sharing, and corporate interviews.',
    highlights: ['Enterprise application share bypass', 'Anti-recording display mask', 'Whisper audio sync']
  },
  jitsi: {
    name: 'Jitsi Meet Screen/Window/Tab Guard',
    category: 'video',
    icon: Video,
    latency: '76 ms',
    mode: 'WebRTC Screen & Tab Air-Gap',
    status: 'Open WebRTC Sync',
    codeHeader: 'FEONIX AI // JITSI MEET TAB & SCREEN SHIELD',
    codeSnippet: [
      '[JITSI WEBRTC] Screen / Tab display stream initiated',
      '[STEALTH FILTER] Exclusion layer active on display buffer',
      '-------------------------------------------------------',
      '[AI HUD PROMPT] "Break down Paxos vs Raft consensus differences."',
      '[HUD STATUS] 100% hidden from Jitsi conference feed'
    ],
    description: 'Automatic stealth protection across Jitsi Meet screen, window, and browser tab presentations.',
    highlights: ['Tab & window share protection', 'Open-source WebRTC support', 'Sub-80ms response speed']
  },
  slackhuddles: {
    name: 'Slack Huddles Screen & Window Sharing',
    category: 'video',
    icon: Video,
    latency: '84 ms',
    mode: 'Huddle Direct Audio & Screen Mask',
    status: 'Huddle Shield Active',
    codeHeader: 'FEONIX AI // SLACK HUDDLE SCREEN INVISIBILITY',
    codeSnippet: [
      '[SLACK HUDDLE] Interactive screen sharing started',
      '[AFFINITY MASK] Copilot HUD excluded from screen stream',
      '-------------------------------------------------------',
      '[LIVE PROMPT] "Emphasize event-driven CQRS with event sourcing."',
      '[STEALTH AUDIT] Overlay omitted from Slack desktop capture'
    ],
    description: 'Complete overlay invisibility during Slack Huddles live screen and application window sharing sessions.',
    highlights: ['Slack Huddle stealth HUD', 'Live audio sync', 'Background hotkey toggle']
  },
  loom: {
    name: 'Loom Video & Screen Recorder Bypass',
    category: 'video',
    icon: Video,
    latency: '79 ms',
    mode: 'Screen / Tab Video Recorder Air-Gap',
    status: 'Recorder Mask Active',
    codeHeader: 'FEONIX AI // LOOM SCREEN & WINDOW RECORDER BYPASS',
    codeSnippet: [
      '[LOOM DETECTED] Desktop / Tab recording session started',
      '[HARDWARE SHIELD] Excluded from video stream render target',
      '-------------------------------------------------------',
      '[AI ASSIST] Code architecture cues presented on screen',
      '[RECORDER CHECK] Output MP4 video contains zero HUD artifacts'
    ],
    description: 'Excludes copilot HUD from Loom async recordings, browser tab captures, and full desktop video recording.',
    highlights: ['Loom video recorder bypass', 'Tab & window exclusion', 'Clean presentation recording']
  },
  gotomeeting: {
    name: 'GoTo Meeting Screen/Application Shield',
    category: 'video',
    icon: Video,
    latency: '85 ms',
    mode: 'Direct Display Hook & App Share Mask',
    status: 'Enterprise Shield Active',
    codeHeader: 'FEONIX AI // GOTO MEETING SCREEN APPLICATION SHIELD',
    codeSnippet: [
      '[GOTO MEETING] Screen / application presentation live',
      '[CAPTURE SHIELD] WDA_EXCLUDEFROMCAPTURE confirmed',
      '-------------------------------------------------------',
      '[QUESTION DETECTED] "How do you handle schema migrations with zero downtime?"',
      '[AI ANSWER HUD] "Mention Expand and Contract pattern with dual writes."'
    ],
    description: 'Hardware-level display affinity masks the copilot HUD from GoTo Meeting screenshares and presenter broadcasts.',
    highlights: ['GoTo Meeting anti-capture', 'Presenter view protection', 'Ultra-low latency RAG']
  },
  whereby: {
    name: 'Whereby Browser Room Screen Shield',
    category: 'video',
    icon: Video,
    latency: '74 ms',
    mode: 'Browser Room Screen & Window Guard',
    status: 'Zero-Lag Room Sync',
    codeHeader: 'FEONIX AI // WHEREBY BROWSER ROOM SCREEN SHIELD',
    codeSnippet: [
      '[WHEREBY ROOM] Screen / window share active in room',
      '[DISPLAY AFFINITY] Overlay excluded from captured stream',
      '-------------------------------------------------------',
      '[AI HUD STREAM] Real-time answers display for candidate eyes only',
      '[STREAM STATUS] 0 frame leaks to Whereby conference attendees'
    ],
    description: 'Invisible to Whereby video rooms during full screen, window, or individual browser tab screen shares.',
    highlights: ['Whereby room stealth', 'Zero-install browser protection', 'Instant hotkey hide']
  },
  bytebytego: {
    name: 'System Design Docs & Architecture RAG',
    category: 'docs',
    icon: Database,
    latency: '92 ms',
    mode: 'Distributed Systems RAG',
    status: 'Vector DB Knowledge Base',
    codeHeader: 'FEONIX AI // DISTRIBUTED ARCHITECTURE GRAPH',
    codeSnippet: [
      'Architecture: Global Distributed URL Shortener',
      '-------------------------------------------------------',
      '1. API Gateway -> Rate Limiter (Token Bucket)',
      '2. Cache Layer -> Redis Cluster (LRU Eviction 100GB)',
      '3. DB Layer -> Cassandra (Consistent Hashing Sharding)',
      '4. Key Gen Service -> Base62 Counter pre-allocation',
      '5. Capacity: 1B URLs | Read:Write = 10:1 (100k QPS)'
    ],
    description: 'Queries high-level system architecture patterns (Kafka, Redis, Sharding, Load Balancers, CAP theorem).',
    highlights: ['High-availability trade-off tables', 'Capacity estimation formulas', 'Diagram walkthrough steps']
  },
  slack: {
    name: 'Slack Workflows & ATS Integration',
    category: 'messaging',
    icon: MessageSquare,
    latency: '110 ms',
    mode: 'Asynchronous Briefings',
    status: 'Post-Call Export Active',
    codeHeader: 'FEONIX AI // AUTOMATED CANDIDATE EVALUATION SCORECARD',
    codeSnippet: [
      '[AUTOMATED INTERVIEW EVALUATION]',
      'Candidate: Technical Interview Performance',
      '- Algorithmic Problem Solving: 10/10',
      '- System Architecture Depth: 9.5/10',
      '- Technical Communication: 10/10',
      '[STATUS] Scorecard & Slack payload generated successfully'
    ],
    description: 'Automated post-interview notes, performance scorecards, and key Q&A transcript export to Slack channels.',
    highlights: ['Automated candidate scorecards', 'Action item extraction', 'Secure TLS payload delivery']
  }
};

export default function Integrations3DSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedId, setSelectedId] = useState('codesignal');
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedData = INTEGRATIONS_DATA[selectedId] || INTEGRATIONS_DATA.codesignal;
  const SelectedIcon = selectedData.icon;

  const filteredKeys = Object.keys(INTEGRATIONS_DATA).filter((key) => {
    if (activeTab === 'all') return true;
    return INTEGRATIONS_DATA[key].category === activeTab;
  });

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1800);
  };

  return (
    <section className="integrations-3d-section">
      <div className="integrations-glow-bg" />

      <div className="integrations-container">
        {/* Section Header */}
        <div className="integrations-header">
          <div className="integrations-pill-badge">
            <Layers size={14} className="pulse-icon" />
            <span>3D ECOSYSTEM COMPATIBILITY MATRIX</span>
          </div>
          <h2 className="integrations-main-heading">
            Works Everywhere You Interview & Code
          </h2>
          <p className="integrations-sub-heading">
            Feonix AI connects seamlessly across all major video conferencing suites, live coding platforms, and knowledge systems with zero setup friction.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="integrations-tabs-wrap">
          {[
            { id: 'all', label: 'All Integrations' },
            { id: 'coding', label: 'Coding Platforms' },
            { id: 'video', label: 'Video Conferencing' },
            { id: 'docs', label: 'Knowledge & Architecture' },
            { id: 'messaging', label: 'Workflows & ATS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`integrations-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Grid: Interactive 3D Showcase Box + Platform Inspector */}
        <div className="integrations-grid">
          
          {/* Left Column: Ultra-Glassmorphic HUD Showcase with 3D WebGL Canvas */}
          <div className="integrations-showcase-card">
            
            {/* Top Showcase Status Header */}
            <div className="showcase-top-bar">
              <div className="showcase-badge-cyan">
                <Sparkles size={14} />
                <span>3D REAL-TIME COPILOT HUD</span>
              </div>
              <div className="showcase-ping-wrap">
                <span className="showcase-ping-dot" />
                <span className="showcase-ping-text">{selectedData.mode}</span>
              </div>
            </div>

            {/* 3D WebGL Canvas Backdrop + Superimposed Crystal Clear Glass HUD */}
            <div className="showcase-canvas-container">
              <Integrations3DCanvas
                activeIntegrationId={selectedId}
                onSelectIntegration={(id) => setSelectedId(id)}
              />

              {/* Superimposed Native Glass HUD Terminal Overlay */}
              <div className="showcase-hud-overlay">
                
                {/* Mac Glass Terminal Bar */}
                <div className="hud-terminal-header">
                  <div className="hud-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <div className="hud-title-wrap">
                    <Terminal size={14} className="hud-title-icon" />
                    <span className="hud-title-text">{selectedData.codeHeader}</span>
                  </div>
                  <div className="hud-latency-chip">
                    <Cpu size={12} />
                    <span>{selectedData.latency}</span>
                  </div>
                </div>

                {/* Animated Code / Speech Stream Display */}
                <div className={`hud-terminal-body ${isSimulating ? 'simulating' : ''}`}>
                  {selectedData.codeSnippet.map((line, idx) => {
                    let lineColor = '#e2e8f0';
                    if (line.startsWith('#') || line.startsWith('//') || line.startsWith('[')) lineColor = '#10b981';
                    else if (line.includes('def ') || line.includes('function ') || line.includes('return') || line.includes('for ')) lineColor = '#a855f7';
                    else if (line.includes('"') || line.includes("'")) lineColor = '#f59e0b';

                    return (
                      <div key={idx} className="hud-code-line">
                        <span className="hud-line-num">{(idx + 1).toString().padStart(2, '0')}</span>
                        <span className="hud-line-text" style={{ color: lineColor }}>{line}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Live Audio Equalizer & Action Bar */}
                <div className="hud-terminal-footer">
                  <div className="hud-eq-wrap">
                    <div className="hud-eq-label">AUDIO SPECTRUM</div>
                    <div className="hud-eq-bars">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                        <span key={b} className={`eq-bar eq-bar-${b}`} />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulate}
                    className="hud-simulate-btn"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>{isSimulating ? 'Scanning Solution...' : 'Simulate Scanning'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Interactive Platform Dock */}
            <div className="integrations-chips-wrap">
              {filteredKeys.map((key) => {
                const item = INTEGRATIONS_DATA[key];
                const isSelected = selectedId === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedId(key)}
                    className={`integrations-chip-btn ${isSelected ? 'active' : ''}`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Platform Capabilities Inspector Card */}
          <div className="integrations-inspector-card">
            <div className="inspector-header">
              <div className="inspector-icon-box">
                <SelectedIcon size={24} />
              </div>
              <div>
                <h3 className="inspector-title">{selectedData.name}</h3>
                <span className="inspector-status-badge">{selectedData.status}</span>
              </div>
            </div>

            <p className="inspector-desc">{selectedData.description}</p>

            {/* Metrics Box */}
            <div className="inspector-metrics-grid">
              <div className="metric-box">
                <div className="metric-label"><Cpu size={14} /> Average Latency</div>
                <div className="metric-value-cyan">{selectedData.latency}</div>
              </div>
              <div className="metric-box">
                <div className="metric-label"><ShieldCheck size={14} /> Mode</div>
                <div className="metric-value-emerald">{selectedData.mode}</div>
              </div>
            </div>

            {/* Highlights */}
            <div className="inspector-highlights">
              <div className="highlights-title">Key Capabilities</div>
              {selectedData.highlights.map((h, i) => (
                <div key={i} className="highlight-item">
                  <CheckCircle2 size={16} className="highlight-check-icon" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <button type="button" className="inspector-cta-btn" onClick={handleSimulate}>
              <span>Test {selectedData.name} Integration</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

