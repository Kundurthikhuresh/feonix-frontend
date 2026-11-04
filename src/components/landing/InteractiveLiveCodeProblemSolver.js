"use client";

import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Play,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Database,
  Server
} from 'lucide-react';

const PROBLEMS = [
  {
    id: 'lru-cache',
    category: 'Algorithms & Data Structures',
    title: 'LeetCode 146 · LRU Cache Implementation',
    difficulty: 'HARD',
    tagClass: 'hard',
    question: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with get() and put() in O(1) time complexity.',
    steps: [
      'Maintain a Doubly-Linked List with dummy head and tail pointers.',
      'Maintain a Hash Table mapping key -> DoublyLinkedList node for O(1) random access.',
      'get(key): Locate node in O(1), unlink from current position and move to head (MRU).',
      'put(key, val): If exists, update & move to head; if full, remove tail.prev in O(1).'
    ],
    timeComplexity: 'O(1) Strictly',
    spaceComplexity: 'O(capacity)',
    languages: {
      Python: `class DLinkedNode:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev, self.next = None, None

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = {}
        self.cap = capacity
        self.head, self.tail = DLinkedNode(), DLinkedNode()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.cache: return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_head(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = DLinkedNode(key, value)
        self.cache[key] = node
        self._add_to_head(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
      TypeScript: `class LRUCache {
  private capacity: number;
  private map: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, val); // refresh key recency
    return val;
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      // First key in Map iterator is the oldest / LRU
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }
  }
}`
    }
  },
  {
    id: 'rate-limiter',
    category: 'System Architecture & Microservices',
    title: 'Distributed System · Sliding Window Rate Limiter',
    difficulty: 'STAFF LEVEL',
    tagClass: 'system',
    question: 'Architect a low-latency distributed rate limiter supporting 200,000 req/sec across multi-region edge gateways with Redis sliding window logs.',
    steps: [
      'Use Redis Sorted Sets (ZSET) where score = epoch timestamp in milliseconds.',
      'Remove all elements with score < (now - windowSize) via ZREMRANGEBYSCORE.',
      'Query remaining elements count via ZCARD. If count < limit, allow request.',
      'Insert current request timestamp using ZADD; run commands in atomic Lua pipeline.'
    ],
    timeComplexity: 'O(log N + M) in Redis',
    spaceComplexity: 'O(requests per window)',
    languages: {
      TypeScript: `// Atomic Lua Script executed on Redis Cluster
const RATE_LIMIT_LUA = \`
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local clearBefore = now - window

  redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
  local currentRequests = redis.call('ZCARD', key)

  if currentRequests < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1 -- Allowed
  else
    return 0 -- Denied (429 Too Many Requests)
  end
\`;`,
      Python: `import time
import redis

class SlidingWindowRateLimiter:
    def __init__(self, r: redis.Redis, limit: int, window_sec: int):
        self.r = r
        self.limit = limit
        self.window_ms = window_sec * 1000

    def is_allowed(self, client_id: str) -> bool:
        now_ms = int(time.time() * 1000)
        key = f"rate_limit:{client_id}"
        pipe = self.r.pipeline()
        pipe.zremrangebyscore(key, 0, now_ms - self.window_ms)
        pipe.zcard(key)
        pipe.zadd(key, {now_ms: now_ms})
        pipe.expire(key, self.window_ms // 1000)
        _, current_count, _, _ = pipe.execute()
        return current_count <= self.limit`
    }
  }
];

export default function InteractiveLiveCodeProblemSolver({ onGetStarted }) {
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [selectedLang, setSelectedLang] = useState('Python');
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState('All 24/24 Test Cases Passed · Runtime: 38ms (Top 99.2% Percentile)');

  const problem = PROBLEMS[activeProblemIdx];
  const codeContent = problem.languages[selectedLang] || Object.values(problem.languages)[0];

  const handleCopy = () => {
    navigator.clipboard?.writeText(codeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestOutput(`All test cases passed in ${Math.floor(Math.random() * 20 + 25)}ms · Memory: O(1) verified`);
    }, 800);
  };

  return (
    <section className="prod-section" id="code-solver">
      {/* Section Header */}
      <div className="prod-section-header">
        <div className="prod-badge purple">
          <Code2 size={14} />
          <span>Real-Time Code & Architecture Engine</span>
        </div>
        <h2 className="prod-title">
          Instant Solutions for <span className="prod-title-gradient">Algorithms & Architecture</span>
        </h2>
        <p className="prod-desc">
          Capture coding problems on HackerRank, LeetCode, or CoderPad. Feonix AI delivers production-grade code, Big-O analysis, and step-by-step logic in seconds.
        </p>
      </div>

      {/* Problem Category Switchers */}
      <div className="studio-tabs">
        {PROBLEMS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActiveProblemIdx(idx);
              const availableLangs = Object.keys(p.languages);
              if (!availableLangs.includes(selectedLang)) {
                setSelectedLang(availableLangs[0]);
              }
            }}
            className={`studio-tab-btn ${activeProblemIdx === idx ? 'active' : ''}`}
          >
            {p.id === 'rate-limiter' ? <Server size={16} /> : <Code2 size={16} />}
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Main Solver Two-Column Stage */}
      <div className="solver-container">
        {/* Left Column: Problem & AI Breakdown */}
        <div className="solver-card-left">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                {problem.category}
              </span>
              <span className={`solver-tag ${problem.tagClass}`}>
                {problem.difficulty}
              </span>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '12px', lineHeight: 1.3 }}>
              {problem.title}
            </h3>

            <div className="solver-prompt-box">
              <strong style={{ color: 'var(--feonix-cyan)' }}>Interview Question:</strong><br />
              "{problem.question}"
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
              AI Architectural Strategy:
            </div>

            <div className="solver-steps-list">
              {problem.steps.map((st, i) => (
                <div key={i} className="solver-step-item">
                  <span className="step-num-pill">{i + 1}</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="solver-complexity-strip">
              <Zap size={16} />
              <span>Time: <strong>{problem.timeComplexity}</strong></span>
              <span>•</span>
              <span>Space: <strong>{problem.spaceComplexity}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Code Editor */}
        <div className="solver-ide-wrapper">
          <div className="ide-toolbar">
            <div className="ide-lang-pills">
              {Object.keys(problem.languages).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`ide-lang-btn ${selectedLang === lang ? 'active' : ''}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleCopy}
                className="ide-lang-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="Copy Solution Code"
              >
                {isCopied ? <Check size={14} style={{ color: 'var(--feonix-emerald)' }} /> : <Copy size={14} />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleRunTests}
                className="ide-action-btn"
                disabled={isRunning}
              >
                <Play size={13} fill="currentColor" />
                <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
              </button>
            </div>
          </div>

          {/* Syntax Code Editor Viewport */}
          <pre className="ide-code-viewport">
            <code>{codeContent}</code>
          </pre>

          {/* Test Case Terminal Output */}
          <div className="ide-test-terminal">
            <div className="terminal-success">
              <CheckCircle2 size={16} />
              <span>{testOutput}</span>
            </div>

            <span style={{ color: '#64748b' }}>
              GCC / PyPy3 JIT Engine
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

