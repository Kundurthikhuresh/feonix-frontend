"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { postJSON } from '../lib/api';
import { formatTimeSeconds } from '../lib/utils';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

// Component Imports
import AuthModal from '../components/auth/AuthModal';
import Sidebar from '../components/dashboard/Sidebar';
import SessionsPane from '../components/dashboard/SessionsPane';
import LibraryPane from '../components/dashboard/LibraryPane';
import CreateSessionModal from '../components/dashboard/CreateSessionModal';
import AdminPane from '../components/dashboard/AdminPane';
import CopilotAppView from '../components/copilot/CopilotAppView';
import ReviewSessionView from '../components/review/ReviewSessionView';

// 3D & Futuristic Landing Components
import ParticleBackground from '../components/3d/ParticleBackground';
import Navbar3D from '../components/landing/Navbar3D';
import Hero3DSection from '../components/landing/Hero3DSection';
import Stats3DSection from '../components/landing/Stats3DSection';
import Features3DSection from '../components/landing/Features3DSection';
import AIShowcase3DSection from '../components/landing/AIShowcase3DSection';
import InteractiveSimulator3D from '../components/landing/InteractiveSimulator3D';
import DualModeSection from '../components/landing/DualModeSection';
import HowItWorks3DSection from '../components/landing/HowItWorks3DSection';
import Pricing3DSection from '../components/landing/Pricing3DSection';
import FAQ3DSection from '../components/landing/FAQ3DSection';
import CTA3DSection from '../components/landing/CTA3DSection';
import Footer3D from '../components/landing/Footer3D';
import FloatingAskAI from '../components/landing/FloatingAskAI';
import DemoVideo90sModal from '../components/landing/DemoVideo90sModal';
import Integrations3DSection from '../components/landing/Integrations3DSection';
import Security3DSection from '../components/landing/Security3DSection';
import Testimonials3DSection from '../components/landing/Testimonials3DSection';
import VideoShowcase3DSection from '../components/landing/VideoShowcase3DSection';

// New 3D Extension Sections
import CareerIntelligence3DSection from '../components/landing/CareerIntelligence3DSection';
import ResumePipeline3DSection from '../components/landing/ResumePipeline3DSection';
import InterviewCopilot3DSection from '../components/landing/InterviewCopilot3DSection';
import AIProcessing3DSection from '../components/landing/AIProcessing3DSection';
import KnowledgeGraph3DSection from '../components/landing/KnowledgeGraph3DSection';
import InterviewModes3DSection from '../components/landing/InterviewModes3DSection';
import AIHUD3DSection from '../components/landing/AIHUD3DSection';
import CareerReadiness3DSection from '../components/landing/CareerReadiness3DSection';
import BeforeAfter3DSection from '../components/landing/BeforeAfter3DSection';
import FeonixEcosystem3DSection from '../components/landing/FeonixEcosystem3DSection';
import AskFeonix3DSection from '../components/landing/AskFeonix3DSection';
import CareerJourney3DSection from '../components/landing/CareerJourney3DSection';
import ProductShowcase3DSection from '../components/landing/ProductShowcase3DSection';

import dynamic from 'next/dynamic';

const AIAssistantModal = dynamic(() => import('../components/assistant/AIAssistantModal'), {
  ssr: false,
});

const SIM_SAMPLES = [
  {
    id: 1,
    label: "Can you explain process vs thread?",
    question: "Can you explain the difference between a process and a thread?",
    answer: {
      kind: "System Design",
      content: "<strong>Process:</strong> An independent executing program instance with its own private virtual memory space (stack, heap). Heavyweight, higher overhead for context switching.<br/><br/><strong>Thread:</strong> A path of execution within a process. Multiple threads share process resources. Lightweight, fast data sharing, but concurrency issues can arise.",
      confidence: "98%",
      source: "OS Concepts v10"
    }
  },
  {
    id: 2,
    label: "How does JS event loop work?",
    question: "How does the event loop work in JavaScript?",
    answer: {
      kind: "JavaScript Runtime",
      content: "<strong>Event Loop:</strong> A continuous monitoring loop that coordinates asynchronous callback execution.<br/><br/><strong>Execution Flow:</strong><br/>1. Runs synchronous call stack items.<br/>2. Resolves all Microtasks (Promises) first.<br/>3. Polls and processes Macrotasks (timeouts, intervals, I/O events) from Callback Queue.",
      confidence: "96%",
      source: "V8 Core Architecture"
    }
  },
  {
    id: 3,
    label: "Why is Virtual DOM fast in React?",
    question: "What is the Virtual DOM and why is it fast?",
    answer: {
      kind: "React Framework",
      content: "<strong>Virtual DOM:</strong> A lightweight JavaScript tree mapping the real DOM.<br/><br/><strong>Diffing & Batching:</strong> React computes the difference between old and new state (diffing) and batches real DOM updates (reconciliation) in a single reflow/repaint to bypass expensive browser layout engines.",
      confidence: "95%",
      source: "React Docs v19"
    }
  }
];

export default function Page() {
  const router = useRouter();

  // Navigation & Page State
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const v = new URLSearchParams(window.location.search).get('view');
      if (v === 'app' || v === 'review') return v;
    }
    return 'landing';
  }); // 'landing', 'dash', 'app', 'review'
  const [authChecked, setAuthChecked] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showDemoVideoModal, setShowDemoVideoModal] = useState(false);

  // Interactive Simulator State
  const [simState, setSimState] = useState('idle'); // 'idle', 'transcribing', 'thinking', 'answering'
  const [simActiveId, setSimActiveId] = useState(null);
  const [simQuestion, setSimQuestion] = useState('');
  const [simAnswer, setSimAnswer] = useState(null);
  const [simInput, setSimInput] = useState('');

  // 3D Tilt States
  const [simTiltX, setSimTiltX] = useState(0);
  const [simTiltY, setSimTiltY] = useState(0);
  const simContainerRef = useRef(null);

  const handleSimMouseMove = (e) => {
    if (!simContainerRef.current) return;
    const rect = simContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 15; // max 15 degrees tilt
    const rotateX = -((y - yc) / yc) * 15;
    setSimTiltX(rotateX);
    setSimTiltY(rotateY);
  };

  const handleSimMouseLeave = () => {
    setSimTiltX(0);
    setSimTiltY(0);
  };

  const userRef = useRef(null);
  const currentViewRef = useRef(currentView);

  useEffect(() => {
    userRef.current = user;
    currentViewRef.current = currentView;
  }, [user, currentView]);

  // React Strict Mode double-invokes the mount effect in dev (mount, clean
  // up, mount again), which fires checkUserSession() twice concurrently.
  // Both do the same fetch → enterSession → changeView('app') chain, and
  // without a guard whichever one happens to resolve LAST wins — including
  // the throwaway first run, which could land back on the logged-out
  // landing page after the second (real) run had already shown the
  // dashboard/copilot. Every state-changing step below checks this against
  // the id it started with, and bails out silently if a newer run has
  // since started.
  const bootRunIdRef = useRef(0);

  const changeView = (nextView, replace = false) => {
    setCurrentView(nextView);
    if (typeof window !== 'undefined') {
      const url = nextView === 'landing' ? '/' : `/?view=${nextView}`;
      if (replace) {
        window.history.replaceState({ view: nextView }, '', url);
      } else {
        window.history.pushState({ view: nextView }, '', url);
      }
    }
  };

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSignupCode, setAuthSignupCode] = useState('');
  const [authMsg, setAuthMsg] = useState({ text: '', type: '' });
  const [authLoading, setAuthLoading] = useState(false);

  // Quota & Catalogue States
  const [catalogue, setCatalogue] = useState(null);
  const [account, setAccount] = useState(null);
  const [creditsLeft, setCreditsLeft] = useState('—');
  const [usedCredits, setUsedCredits] = useState('—');
  const [trialsLeft, setTrialsLeft] = useState('—');

  // Dashboard Panel State
  const [activePane, setActivePane] = useState('sessions'); // 'sessions', 'resumes', 'documents', 'admin'
  const [sessions, setSessions] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [sessionSearch, setSessionSearch] = useState('');
  const [libSearch, setLibSearch] = useState('');
  const [libMsg, setLibMsg] = useState('');
  const [themeMode, setThemeMode] = useState('dark');

  // New Session Creation Form State
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [billingChoice, setBillingChoice] = useState('trial'); // 'trial', 'paid'

  // Opening the sheet always defaulted to 'trial' regardless of whether any
  // were left — someone who'd already used all 5 would see "Free Trial"
  // pre-selected, hit "Create session", and only then learn (from a plain
  // inline error at the bottom of the form) that they needed to pick "Use
  // Credits" instead. Steer the default to whatever's actually usable
  // instead of letting the submit fail first.
  useEffect(() => {
    if (showCreateSheet && Number.isFinite(Number(trialsLeft)) && Number(trialsLeft) <= 0) {
      setBillingChoice('paid');
    }
  }, [showCreateSheet, trialsLeft]);
  const [sessionType, setSessionType] = useState('interview'); // 'interview', 'call'
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newJd, setNewJd] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAgent, setNewAgent] = useState('');
  const [newAuto, setNewAuto] = useState(true);
  const [newSaveTranscript, setNewSaveTranscript] = useState(true);
  const [createMsg, setCreateMsg] = useState('');

  // Live Copilot App States
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedText, setElapsedText] = useState('00:00');
  const [tallyState, setTallyState] = useState('idle'); // 'idle', 'listening', 'answering'
  const [tallyLabel, setTallyLabel] = useState('Idle');
  const [listenSource, setListenSource] = useState('tab'); // 'tab', 'mic'
  const [liveAnswer, setLiveAnswer] = useState('');
  const [liveCueLine, setLiveCueLine] = useState('');
  const [liveQType, setLiveQType] = useState('');
  const [liveTranscripts, setLiveTranscripts] = useState([]);
  const [manualQuestion, setManualQuestion] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Post Session Review States
  const [reviewPane, setReviewPane] = useState('notes'); // 'notes', 'transcript', 'ask', 'details'
  const [reviewSessionId, setReviewSessionId] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [reviewMessages, setReviewMessages] = useState([]);
  const [reviewAskInput, setReviewAskInput] = useState('');

  // Admin Panel States
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAdminUserSheet, setShowAdminUserSheet] = useState(false);
  const [showAdminAccountSheet, setShowAdminAccountSheet] = useState(false);
  const [adminUserEmail, setAdminUserEmail] = useState('');
  const [adminUserPassword, setAdminUserPassword] = useState('');
  const [adminUserMsg, setAdminUserMsg] = useState('');
  const [selectedAdminUserId, setSelectedAdminUserId] = useState(null);
  const [selectedAdminUserEmail, setSelectedAdminUserEmail] = useState('');
  const [adminUserCredits, setAdminUserCredits] = useState('—');
  const [adminUserUsed, setAdminUserUsed] = useState('—');
  const [adminUserTrials, setAdminUserTrials] = useState('—');
  const [creditHistory, setCreditHistory] = useState([]);
  const [trialHistory, setTrialHistory] = useState([]);
  const [aaAction, setAaAction] = useState('grant');
  const [aaAmount, setAaAmount] = useState('');
  const [aaReason, setAaReason] = useState('');
  const [aaMsg, setAaMsg] = useState('');

  // Password Reset Modal (Admin)
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [pwTargetUserId, setPwTargetUserId] = useState(null);
  const [pwTargetEmail, setPwTargetEmail] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Landing Page Countdown Timer State
  const [promoTime, setPromoTime] = useState({ h: '11', m: '19', s: '36' });

  // ----------------------------------------------------
  // Audio Recorder Hook Integration
  // ----------------------------------------------------
  const handleChunkAvailable = async (blob) => {
    if (!activeSession) return;
    const formData = new FormData();
    formData.append('audio', blob, 'chunk.webm');

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/audio`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.transcripts) {
          setLiveTranscripts(data.transcripts);
        }
        if (data.answers && data.answers.length > 0) {
          const latestAnswer = data.answers[data.answers.length - 1];
          setLiveAnswer(latestAnswer.answer);
          setLiveCueLine(latestAnswer.question);
          setLiveQType(latestAnswer.kind || 'Interview Question');
        }
      }
    } catch (err) {
      console.error('Audio chunk post failed:', err);
    }
  };

  const { listening, startRecording, stopRecording } = useAudioRecorder(handleChunkAvailable);

  // ----------------------------------------------------
  // Interactive Simulator Logic
  // ----------------------------------------------------
  const runSimulation = (id, questionText, answerObj) => {
    if (simState === 'transcribing' || simState === 'thinking') return;

    setSimActiveId(id);
    setSimState('transcribing');
    setSimQuestion('');
    setSimAnswer(null);

    let currentIdx = 0;
    const typeInterval = setInterval(() => {
      if (currentIdx < questionText.length) {
        setSimQuestion(prev => prev + questionText.charAt(currentIdx));
        currentIdx++;
      } else {
        clearInterval(typeInterval);
        setSimState('thinking');

        setTimeout(() => {
          setSimState('answering');
          setSimAnswer(answerObj);
        }, 1200);
      }
    }, 30);
  };

  const handleSimCustomSubmit = (e) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const customQ = simInput;
    const customAns = {
      kind: "AI Assistant",
      content: `<strong>Custom Response:</strong> "${customQ}" analyzed successfully.<br/><br/>The AI Copilot evaluates this topic by indexing your CV and active documents to generate precise context-aware answers in real-time.`,
      confidence: "94%",
      source: "Local Sandbox Agent"
    };

    setSimInput('');
    runSimulation('custom', customQ, customAns);
  };

  // ----------------------------------------------------
  // Mount / Initial Boot Logic
  // ----------------------------------------------------
  useEffect(() => {
    // Dark is this site's actual design — every surface (hero, HUD, auth)
    // is built and hand-tuned against it. Light mode exists as an opt-in for
    // the dashboard, not a default: following the OS's light preference here
    // used to silently switch first-time visitors into it, which breaks the
    // landing page (its hero text is hardcoded white for a dark backdrop,
    // so light mode leaves it unreadable). Only an explicit prior toggle
    // should ever start the site in light mode.
    const storedTheme = localStorage.getItem('feonix-theme');
    const activeTheme = storedTheme === 'light' ? 'light' : 'dark';
    setThemeMode(activeTheme);
    document.documentElement.dataset.theme = activeTheme;

    const navEntries = typeof window !== 'undefined' && typeof performance !== 'undefined'
      ? performance.getEntriesByType?.('navigation')
      : null;
    const isReload = (navEntries && navEntries[0] && navEntries[0].type === 'reload')
      || (typeof window !== 'undefined' && window.performance?.navigation?.type === 1);

    const initialView = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('view') : null;

    // "Go to sign in" after a password reset (and anywhere else that wants
    // to land straight on the login form, e.g. an expired-session redirect)
    // used to just push to '/' — landing on the plain marketing page, not
    // actually on sign-in, requiring a further click to find and open it.
    // ?auth=login opens it immediately instead.
    const initialAuth = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('auth') : null;
    if (initialAuth === 'login' || initialAuth === 'register') {
      setAuthMode(initialAuth);
      setShowAuthModal(true);
    }

    if (isReload) {
      if (typeof window !== 'undefined') {
        window.history.replaceState({ view: 'landing' }, '', '/');
      }
      setCurrentView('landing');
    } else if (initialView && initialView !== 'dash') {
      window.history.replaceState({ view: initialView }, '');
      setCurrentView(initialView);
    } else if (typeof window !== 'undefined') {
      if (!window.history.state || !window.history.state.view || window.history.state.view === 'dash') {
        window.history.replaceState({ view: 'landing' }, '', '/');
      }
    }

    const handlePopState = (e) => {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const queryView = urlParams ? urlParams.get('view') : null;

      if (e.state && e.state.view) {
        if (e.state.view === 'dash' && !userRef.current) {
          setCurrentView('landing');
          setShowAuthModal(true);
          setAuthMode('login');
          return;
        }
        setCurrentView(e.state.view);
      } else if (queryView === 'dash') {
        if (!userRef.current) {
          setCurrentView('landing');
          setShowAuthModal(true);
          setAuthMode('login');
          return;
        }
        setCurrentView('dash');
      } else if (queryView === 'app') {
        setCurrentView('app');
      } else if (queryView === 'review') {
        setCurrentView('review');
      } else {
        // Navigating back to root '/' or clicking browser back arrow from dashboard redirects to landing page
        setCurrentView('landing');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    const runId = ++bootRunIdRef.current;
    const bootAbort = new AbortController();
    checkUserSession(runId, bootAbort.signal);

    let count = 11 * 3600 + 19 * 60 + 36;
    const bannerTimer = setInterval(() => {
      if (count <= 0) {
        clearInterval(bannerTimer);
        return;
      }
      count--;
      const hours = Math.floor(count / 3600);
      const minutes = Math.floor((count % 3600) / 60);
      const seconds = count % 60;
      setPromoTime({
        h: String(hours).padStart(2, '0'),
        m: String(minutes).padStart(2, '0'),
        s: String(seconds).padStart(2, '0'),
      });
    }, 1000);

    return () => {
      // Strict Mode's dev double-invoke (mount, cleanup, mount again) was
      // letting the first mount's ENTIRE boot fetch burst — auth check,
      // catalogue, account, sessions list, documents, the session lookup,
      // and the /start POST — run all the way to completion pointlessly,
      // since a runId check only discards its RESULTS afterward. Doubling
      // that many concurrent requests on the dev backend in the same
      // instant was enough to make the second (real) run's own /start call
      // occasionally hang. Aborting the first run's fetches outright, not
      // just ignoring what they return, is what actually fixes that.
      bootAbort.abort();
      clearInterval(bannerTimer);
      stopRecording();
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, []);

  // In Electron: if the desktop app is currently showing the dashboard when a
  // handoff link arrives, immediately route to the Start Interview screen (/session-type)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.feonix && typeof window.feonix.onHandoff === 'function') {
      window.feonix.onHandoff((handoff) => {
        if (handoff) {
          const sParam = handoff.session ? `&session=${encodeURIComponent(handoff.session)}` : '';
          const tParam = handoff.token ? `token=${encodeURIComponent(handoff.token)}` : '';
          const q = tParam ? `?${tParam}${sParam}` : (sParam ? `?${sParam.slice(1)}` : '');
          window.location.href = `/session-type${q}`;
        }
      });
    }
  }, []);

  const checkUserSession = async (runId, signal) => {
    // True once a newer mount effect (Strict Mode's dev double-invoke, or a
    // genuine remount) has superseded this call — every point below that
    // changes user-visible state checks this first, so a slow/throwaway run
    // can't clobber a faster/real one that already finished. The abort
    // signal (cancelled from the effect's cleanup) is what stops a stale
    // run from actually sending its requests in the first place — the
    // runId check alone only discarded results afterward, which still let
    // a full duplicate burst of fetches (auth check, catalogue, account,
    // sessions, documents, session lookup, /start) hit the dev backend
    // alongside the real run's own, and that doubled load was enough to
    // occasionally make the real run's /start call hang.
    const stale = () => runId !== bootRunIdRef.current;
    try {
      // The very first request of a page load is also the one most likely
      // to land during a backend restart (dev auto-reload, or the frontend
      // simply coming up before the backend has finished booting) — the
      // proxy already retries once internally, but a miss here used to
      // render the logged-out landing page for an actual logged-in user
      // rather than the dashboard, until a manual reload happened to land
      // outside that window. A couple of quick retries absorb it instead.
      let res = await fetch('/api/auth/me', { signal });
      for (let attempt = 1; attempt < 3 && !res.ok; attempt++) {
        const body = await res.json().catch(() => ({}));
        if (res.status !== 503 || body.error !== 'server_unavailable') break;
        await new Promise((resolve) => setTimeout(resolve, 500));
        res = await fetch('/api/auth/me', { signal });
      }
      if (stale()) return;
      if (res.ok) {
        const data = await res.json();
        if (stale()) return;
        setUser(data.user);
        setAuthChecked(true);

        // Account/session/document data is needed by every authenticated
        // view this function can land on below — including "Back to
        // Dashboard" round-tripping through the ?session= branch, which
        // used to return before any of this ever ran, leaving credits
        // stuck at their placeholder '—' until an actual page reload hit
        // the other branch. Loading it once here, before branching, means
        // every landing spot has real data from the start.
        setActivePane('sessions');
        loadCatalogue();
        loadAccount();
        loadSessions();
        loadDocuments();

        // If user lands on /launch?session=X (e.g. from an old link), load that session
        // directly into the browser copilot instead of showing the desktop launcher page.
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get('session');
          const requestedView = urlParams.get('view');

          if (requestedView === 'dash') {
            if (stale()) return;
            try {
              if (window.history.length <= 1 || !window.history.state || window.history.state.view !== 'dash') {
                window.history.replaceState({ view: 'landing' }, '', '/');
                window.history.pushState({ view: 'dash' }, '', '/?view=dash');
              }
            } catch { }
            setCurrentView('dash');
            return;
          }

          if (sessionId) {
            try {
              const sRes = await fetch(`/api/sessions/${sessionId}`, { signal });
              if (stale()) return;
              if (sRes.ok) {
                const sData = await sRes.json();
                if (stale()) return;
                enterSession(sData.session, runId, signal);
                return;
              }
            } catch { /* fall through to dash */ }
          }

          const navEntries = typeof performance !== 'undefined' ? performance.getEntriesByType?.('navigation') : null;
          const isReload = (navEntries && navEntries[0] && navEntries[0].type === 'reload')
            || (window.performance?.navigation?.type === 1);

          if (isReload) {
            if (stale()) return;
            changeView('landing', true);
            return;
          }
        }

        if (stale()) return;
        // Default to landing page on website reload / fresh visit
        changeView('landing', true);
        return;
      }
    } catch {
      // ignore — treat as logged out (also catches the abort from a
      // superseded run, which is expected and not a real error)
    }
    if (stale()) return;
    setUser(null);
    changeView('landing', true);
    setAuthChecked(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'dash') {
        setShowAuthModal(true);
        setAuthMode('login');
      }
    }
  };

  const enterApp = async (loggedInUser, replaceHistory = false) => {
    setUser(loggedInUser);
    changeView('dash', replaceHistory);
    setActivePane('sessions');

    // Load lists
    loadCatalogue();
    loadAccount();
    loadSessions();
    loadDocuments();
  };

  // Toggle Theme Mode
  const toggleTheme = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('feonix-theme', nextTheme);
  };

  // ----------------------------------------------------
  // API Fetch Tasks
  // ----------------------------------------------------
  const loadCatalogue = async () => {
    try {
      const res = await fetch('/api/answer/catalogue');
      if (res.ok) {
        const data = await res.json();
        setCatalogue(data);
        if (data.languages && data.languages.length > 0) {
          setNewLanguage(data.languages[0]);
        }
        if (data.agents && data.agents.length > 0) {
          const rec = data.agents.find(a => a.recommended) || data.agents[0];
          setNewAgent(rec.id);
        }
      }
    } catch (err) {
      console.error('Error fetching catalogue:', err);
    }
  };

  const loadAccount = async () => {
    try {
      const res = await fetch('/api/sessions/account');
      if (res.ok) {
        const data = await res.json();
        const acc = data.account || {};
        setAccount(acc);
        setCreditsLeft(acc.credits !== undefined && acc.credits !== null ? Number(acc.credits).toFixed(1) : '0.0');
        setUsedCredits(acc.credits_used !== undefined && acc.credits_used !== null ? Number(acc.credits_used).toFixed(1) : '0.0');
        setTrialsLeft(acc.trials_remaining !== undefined && acc.trials_remaining !== null ? acc.trials_remaining : 0);
      }
    } catch (err) {
      console.error('Error loading account:', err);
    }
  };

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        const docs = data.documents || [];
        setResumes(docs.filter((d) => d.kind === 'resume'));
        setDocuments(docs.filter((d) => d.kind !== 'resume'));
      }
    } catch (err) {
      console.error('Error loading docs:', err);
    }
  };

  const handleUploadDocument = async (file, kind) => {
    if (!file) return;
    setLibMsg('Uploading…');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);
      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLibMsg(data.message || 'Upload failed.');
        return;
      }
      setLibMsg('');
      loadDocuments();
    } catch (err) {
      setLibMsg('Upload failed.');
    }
  };

  const handleActivateDocument = async (id) => {
    try {
      const res = await fetch(`/api/documents/${id}/activate`, { method: 'POST' });
      if (res.ok) loadDocuments();
    } catch (err) {
      console.error('Error activating document:', err);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        loadSessions();
        loadAccount();
        return;
      }
      const data = await res.json().catch(() => ({}));
      window.alert(data.message || 'Could not delete this session. Please try again.');
    } catch (err) {
      console.error('Error deleting session:', err);
      window.alert('Connection error — could not delete this session.');
    }
  };

  const loadAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    }
  };

  // Sync pane switching to admin data loaders
  useEffect(() => {
    if (activePane === 'admin' && user?.role === 'owner') {
      loadAdminUsers();
    }
  }, [activePane]);

  // ----------------------------------------------------
  // Auth Controls
  // ----------------------------------------------------
  // 'server_unavailable' only ever means the proxy briefly couldn't reach
  // the backend (e.g. it's mid-restart) — not that the account/credentials
  // are actually invalid. A few silent retries here means a real user never
  // sees this as an error at all — the "Working…" state just runs a little
  // longer.
  //
  // The 1.3s-per-attempt budget this used to have was tuned for a generic
  // "proxy blip," not for what this backend actually does on a cold start:
  // its own MongoDB Atlas connection on this machine can legitimately take
  // up to ~15s (see db.js's CONNECT_TIMEOUT_MS) before it answers anything,
  // auth included. Logging in within seconds of a backend restart was
  // burning through all 3 attempts (≈4.4s total) before Mongo had even
  // finished connecting, and surfacing "Request timed out" for something
  // that would have succeeded a few seconds later. 4 attempts at 4s each
  // comfortably covers that window (worst case ≈17s) while still failing
  // with a clear error if the backend is genuinely down, not just slow.
  const postJSONWithRetry = async (path, body, attempts = 5, delayMs = 600) => {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const result = await postJSON(path, body, { timeoutMs: 15000 });
      const isTransient = !result.ok && (
        result.status === 0 ||
        (result.status === 503 && result.data?.error === 'server_unavailable')
      );
      if (!isTransient || attempt === attempts) return result;
      if (attempt >= 2) {
        setAuthMsg({ text: 'Initializing secure connection…', type: '' });
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMsg({ text: authMode === 'register' ? 'Creating account…' : 'Signing in…', type: '' });

    if (authMode === 'forgot') {
      const { ok, data } = await postJSONWithRetry('/api/auth/forgot-password', { email: authEmail });
      setAuthLoading(false);
      setAuthMsg({
        text: ok ? data.message : (data.message || data.error || 'Something went wrong.'),
        type: ok ? 'ok' : 'err',
      });
      return;
    }

    const body = { email: authEmail, password: authPassword };
    if (authMode === 'register' && authSignupCode) {
      body.signup_code = authSignupCode;
    }

    const { ok, data } = await postJSONWithRetry('/api/auth/' + authMode, body);
    setAuthLoading(false);

    if (!ok) {
      setAuthMsg({ text: data.message || data.error || 'Something went wrong.', type: 'err' });
      return;
    }

    setAuthPassword('');
    setShowAuthModal(false);
    enterApp(data.user);
  };

  const handleLogout = async () => {
    await stopRecording();
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    changeView('landing');
    setAuthEmail('');
    setAuthPassword('');
  };

  // ----------------------------------------------------
  // Session Picking & Live Assistant Logic
  // ----------------------------------------------------
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setCreateMsg('Creating…');

    const body = {
      company: sessionType === 'interview' ? newCompany : newTitle,
      role: sessionType === 'interview' ? newRole : '',
      job_description: sessionType === 'interview' ? newJd : newDesc,
      instructions: newContext,
      language: newLanguage,
      agent_id: newAgent,
      auto_answer: newAuto,
      save_transcript: newSaveTranscript,
      billing: billingChoice,
    };

    // A plain postJSON() call here had only a 4s timeout and no retry, so
    // the same transient slowness that postJSONWithRetry already absorbs
    // for login (a request landing right after a backend/DB restart) showed
    // up here as "Could not reach the server." instead of just creating the
    // session a couple seconds later.
    const { ok, data } = await postJSONWithRetry('/api/sessions', body);
    if (!ok) {
      setCreateMsg(data.message || 'Could not create session.');
      return;
    }

    setShowCreateSheet(false);
    setCreateMsg('');
    if (data?.session) {
      setSessions((prev) => [data.session, ...prev.filter((s) => s.id !== data.session.id)]);
    }
    await loadSessions();
    await loadAccount();
  };

  const handleStartSession = async (session) => {
    try {
      const res = await fetch(`/api/sessions/${session.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing: session.billing_kind }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSessions((prev) =>
            prev.map((s) => (s.id === session.id ? { ...s, ...data.session } : s))
          );
        }
      }
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const enterSession = async (session, runId, signal) => {
    let currentSession = session;
    if (session.status === 'ready') {
      try {
        const res = await fetch(`/api/sessions/${session.id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billing: session.billing_kind }),
          signal,
        });
        if (res.ok) {
          const data = await res.json();
          currentSession = data.session;
        }
      } catch (err) {
        console.error('Failed to start session:', err);
      }
    }

    // Called from checkUserSession's boot chain — if a newer mount effect
    // has since started (Strict Mode's dev double-invoke), this run is the
    // throwaway one and must not clobber whatever the newer run already set.
    if (runId !== undefined && runId !== bootRunIdRef.current) return;

    setActiveSession(currentSession);
    changeView('app');
    setLiveAnswer('');
    setLiveCueLine('');
    setLiveQType('');
    setLiveTranscripts([]);
    setElapsedSeconds(0);
    setElapsedText('00:00');
  };

  // Live Timer control
  useEffect(() => {
    let timer;
    if (listening) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          setElapsedText(formatTimeSeconds(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [listening]);

  const toggleListening = async () => {
    if (listening) {
      await stopRecording();
      setTallyState('idle');
      setTallyLabel('Idle');
    } else {
      try {
        await startRecording();
        setTallyState('listening');
        setTallyLabel('Listening');
      } catch {
        setTallyState('idle');
        setTallyLabel('Failed to get mic');
      }
    }
  };

  const handleManualAskSubmit = async (e) => {
    e.preventDefault();
    if (!manualQuestion.trim()) return;

    setTallyState('answering');
    setTallyLabel('Answering…');

    const { ok, data } = await postJSON(`/api/sessions/${activeSession.id}/questions`, { question: manualQuestion });
    setTallyState('listening');
    setTallyLabel('Listening');
    setManualQuestion('');

    if (ok && data.answer) {
      setLiveAnswer(data.answer);
      setLiveCueLine(data.question);
      setLiveQType(data.kind || 'Direct Question');

      const tRes = await fetch(`/api/sessions/${activeSession.id}/transcript`);
      if (tRes.ok) {
        const tData = await tRes.json();
        setLiveTranscripts(tData.transcripts || []);
      }
    }
  };

  const handleEndSession = async () => {
    await stopRecording();
    if (activeSession) {
      await fetch(`/api/sessions/${activeSession.id}/end`, { method: 'POST' });
    }
    loadSessions();
    loadAccount(); // ending a session settles its billing — credits just changed
    changeView('dash');
    setActiveSession(null);
  };

  // ----------------------------------------------------
  // Session Review Panel Logic
  // ----------------------------------------------------
  const handleOpenReview = async (sessionId) => {
    changeView('review');
    setReviewPane('notes');
    setReviewSessionId(sessionId);
    setReviewMessages([]);
    setReviewAskInput('');

    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setReviewData(data.session);
      }
    } catch (err) {
      console.error('Failed to load session review details:', err);
    }
  };

  const handleReviewAskSubmit = async (e, suggestionKey = null, suggestionLabel = null) => {
    if (e) e.preventDefault();
    const queryText = suggestionLabel || reviewAskInput;
    if (!queryText.trim() && !suggestionKey) return;

    const userMsg = { role: 'user', content: queryText };
    setReviewMessages(prev => [...prev, userMsg]);
    setReviewAskInput('');

    const body = suggestionKey ? { suggestion: suggestionKey } : { question: queryText };
    const { ok, data } = await postJSON(`/api/sessions/${reviewSessionId}/ask`, body);
    if (ok && data.answer) {
      setReviewMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } else {
      setReviewMessages(prev => [...prev, { role: 'assistant', content: 'Could not fetch a response.' }]);
    }
  };

  // ----------------------------------------------------
  // Admin Operations (Credits and Passwords)
  // ----------------------------------------------------
  const openAdminAccount = async (userId, email) => {
    setSelectedAdminUserId(userId);
    setSelectedAdminUserEmail(email);
    setAaMsg('');

    try {
      const res = await fetch(`/api/admin/users/${userId}/account`);
      if (res.ok) {
        const data = await res.json();
        setAdminUserCredits(data.credits_remaining !== null ? Number(data.credits_remaining).toFixed(1) : '—');
        setAdminUserUsed(data.credits_used !== null ? Number(data.credits_used).toFixed(1) : '—');
        setAdminUserTrials(data.trials_remaining !== null ? data.trials_remaining : '—');
        setCreditHistory(data.ledger_transactions || []);
        setTrialHistory(data.trial_transactions || []);
        setShowAdminAccountSheet(true);
      }
    } catch {
      setAaMsg('Could not fetch user details.');
    }
  };

  const handleApplyBalanceAdjustment = async () => {
    if (!aaAmount || isNaN(aaAmount)) {
      setAaMsg('Enter a valid amount.');
      return;
    }
    const amountVal = Number(aaAmount);
    if (aaAction !== 'grant' && !aaReason.trim()) {
      setAaMsg('Reason is required for refunds/adjustments.');
      return;
    }

    const { ok, data } = await postJSON(`/api/admin/users/${selectedAdminUserId}/credits`, {
      action: aaAction,
      amount: amountVal,
      reason: aaReason || null
    });

    if (!ok) {
      setAaMsg(data.message || 'Could not adjust balance.');
      return;
    }

    setAaAmount('');
    setAaReason('');
    setAaMsg('');
    openAdminAccount(selectedAdminUserId, selectedAdminUserEmail);
    loadAdminUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAdminUserMsg('Creating…');

    const { ok, data } = await postJSON('/api/admin/users', { email: adminUserEmail, password: adminUserPassword });
    if (!ok) {
      setAdminUserMsg(data.message || 'Could not create user.');
      return;
    }

    setShowAdminUserSheet(false);
    setAdminUserEmail('');
    setAdminUserPassword('');
    setAdminUserMsg('');
    loadAdminUsers();
  };

  const openPasswordReset = (userId, email) => {
    setPwTargetUserId(userId);
    setPwTargetEmail(email);
    setPwNew('');
    setPwConfirm('');
    setPwMsg('');
    setShowPasswordSheet(true);
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) {
      setPwMsg('Passwords do not match.');
      return;
    }
    setPwMsg('Saving…');

    try {
      const res = await fetch(`/api/admin/users/${pwTargetUserId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwNew }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwMsg(data.message || 'Could not reset password.');
        return;
      }
      setPwMsg('Success! Password updated.');
      setTimeout(() => setShowPasswordSheet(false), 1500);
    } catch {
      setPwMsg('Connection error.');
    }
  };

  // ----------------------------------------------------
  // Rendering Views
  // ----------------------------------------------------

  // 1. Futuristic 3D Marketing Landing Page View
  if (currentView === 'landing') {
    return (
      <div id="landingView" className="landing-3d-root">
        {/* Dynamic 3D Particle Starfield & Neural Field */}
        <ParticleBackground />

        <div className="landing-3d-content">
          {/* Glassmorphism Navbar with Theme Switcher */}
          <Navbar3D
            user={user}
            themeMode={themeMode}
            toggleTheme={toggleTheme}
            onLoginClick={() => {
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('login');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
            onSignupClick={() => {
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
          />

          {/* Hero Section with Interactive 3D AI Core Canvas */}
          <Hero3DSection
            onGetStarted={() => {
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
            onExplore={() => {
              setShowAssistantModal(true);
            }}
            onWatchDemo={() => {
              setShowDemoVideoModal(true);
            }}
          />

          {/* 3D Holographic Statistics Counter Cards */}
          <Stats3DSection />

          {/* Futuristic 3D Interactive Features with Mouse Tilt Physics */}
          <Features3DSection />

          {/* NEW 1 — AI Career Intelligence */}
          <CareerIntelligence3DSection />

          {/* 3-Step Futuristic Workflow Timeline */}
          <HowItWorks3DSection />

          {/* NEW 2 — Resume to Interview Pipeline */}
          <ResumePipeline3DSection />

          {/* Parallel AI Duo Mode (Copilot + Coach) */}
          <DualModeSection />

          {/* NEW 3 — Real-Time Interview Copilot */}
          <InterviewCopilot3DSection
            onSimulate={() => {
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
          />

          {/* Interactive 3D Neural Network AI Core Showcase */}
          <AIShowcase3DSection />

          {/* Real-time Interactive 3D Copilot Teleprompter Simulator */}
          <InteractiveSimulator3D />

          {/* NEW 4 — AI Processing Pipeline */}
          <AIProcessing3DSection />

          {/* Interactive 3D Integrations & Ecosystem Matrix */}
          <Integrations3DSection />

          {/* NEW 5 — Technical Knowledge Graph */}
          <KnowledgeGraph3DSection />

          {/* NEW 6 — Interview Modes */}
          <InterviewModes3DSection />

          {/* NEW 7 — AI HUD */}
          <AIHUD3DSection />

          {/* Enterprise Security Quantum Vault 3D Section */}
          <Security3DSection />

          {/* NEW 8 — Career Readiness */}
          <CareerReadiness3DSection />

          {/* Candidate Testimonials 3D Carousel */}
          <Testimonials3DSection themeMode={themeMode} />

          {/* NEW 9 — Before vs After Feonix */}
          <BeforeAfter3DSection />

          {/* Live Video Showcase & Demo Section */}
          <VideoShowcase3DSection
            onWatchDemo={() => {
              setShowDemoVideoModal(true);
            }}
          />

          {/* NEW 10 — Feonix AI Ecosystem */}
          <FeonixEcosystem3DSection />

          {/* NEW 11 — Ask Feonix Interactive Demo */}
          <AskFeonix3DSection />

          {/* NEW 12 — Career Journey */}
          <CareerJourney3DSection />

          {/* Futuristic 3D Glassmorphism Pricing Tier Cards */}
          <Pricing3DSection
            onSelectPlan={(plan) => {
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
          />

          {/* Knowledge Base & FAQ Accordion */}
          <FAQ3DSection />

          {/* NEW 13 — Final Product Showcase */}
          <ProductShowcase3DSection
            onGetStarted={() => {
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
            onExplore={() => {
              setShowAssistantModal(true);
            }}
          />

          {/* High-Impact 3D AI Energy Orb CTA Section */}
          <CTA3DSection
            onStartBuilding={() => {
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
          />

          {/* Futuristic Glassmorphic Footer */}
          <Footer3D />



          {/* 3D AI Voice Assistant Modal */}
          <AIAssistantModal
            isOpen={showAssistantModal}
            onClose={() => setShowAssistantModal(false)}
          />

          {/* 90-Second Feature Demo Video Modal */}
          <DemoVideo90sModal
            isOpen={showDemoVideoModal}
            onClose={() => setShowDemoVideoModal(false)}
            onGetStarted={() => {
              setShowDemoVideoModal(false);
              if (user) {
                enterApp(user);
              } else {
                setAuthMode('register');
                setAuthMsg({ text: '', type: '' });
                setShowAuthModal(true);
              }
            }}
          />
        </div>

        {/* Auth Modal Overlay */}
        {showAuthModal && (
          <AuthModal
            authMode={authMode}
            setAuthMode={setAuthMode}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authSignupCode={authSignupCode}
            setAuthSignupCode={setAuthSignupCode}
            authLoading={authLoading}
            authMsg={authMsg}
            setAuthMsg={setAuthMsg}
            handleAuthSubmit={handleAuthSubmit}
            setShowAuthModal={setShowAuthModal}
          />
        )}
      </div>
    );
  }

  // 2. Dashboard Page View
  if (currentView === 'dash') {
    if (!user) {
      return null;
    }
    return (
      <div id="dashView">
        <Sidebar
          user={user}
          activePane={activePane}
          setActivePane={setActivePane}
          themeMode={themeMode}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          trialsLeft={trialsLeft}
          creditsLeft={creditsLeft}
          onGoLanding={() => changeView('landing')}
        />

        {activePane === 'sessions' && (
          <SessionsPane
            sessions={sessions}
            sessionFilter={sessionFilter}
            setSessionFilter={setSessionFilter}
            sessionSearch={sessionSearch}
            setSessionSearch={setSessionSearch}
            creditsLeft={creditsLeft}
            usedCredits={usedCredits}
            trialsLeft={trialsLeft}
            setShowCreateSheet={setShowCreateSheet}
            handleOpenReview={handleOpenReview}
            handleDeleteSession={handleDeleteSession}
            onStartSession={handleStartSession}
          />
        )}

        {(activePane === 'resumes' || activePane === 'documents') && (
          <LibraryPane
            activePane={activePane}
            resumes={resumes}
            documents={documents}
            libSearch={libSearch}
            setLibSearch={setLibSearch}
            libMsg={libMsg}
            handleUploadDocument={handleUploadDocument}
            handleActivateDocument={handleActivateDocument}
            handleDeleteDocument={handleDeleteDocument}
          />
        )}

        {activePane === 'admin' && (
          <AdminPane
            adminUsers={adminUsers}
            setShowAdminUserSheet={setShowAdminUserSheet}
            openAdminAccount={openAdminAccount}
            openPasswordReset={openPasswordReset}
            showAdminUserSheet={showAdminUserSheet}
            adminUserEmail={adminUserEmail}
            setAdminUserEmail={setAdminUserEmail}
            adminUserPassword={adminUserPassword}
            setAdminUserPassword={setAdminUserPassword}
            adminUserMsg={adminUserMsg}
            handleCreateUser={handleCreateUser}
            showAdminAccountSheet={showAdminAccountSheet}
            setShowAdminAccountSheet={setShowAdminAccountSheet}
            selectedAdminUserEmail={selectedAdminUserEmail}
            adminUserCredits={adminUserCredits}
            adminUserUsed={adminUserUsed}
            adminUserTrials={adminUserTrials}
            aaAction={aaAction}
            setAaAction={setAaAction}
            aaAmount={aaAmount}
            setAaAmount={setAaAmount}
            aaReason={aaReason}
            setAaReason={setAaReason}
            aaMsg={aaMsg}
            handleApplyBalanceAdjustment={handleApplyBalanceAdjustment}
            creditHistory={creditHistory}
            trialHistory={trialHistory}
            showPasswordSheet={showPasswordSheet}
            setShowPasswordSheet={setShowPasswordSheet}
            pwTargetEmail={pwTargetEmail}
            pwNew={pwNew}
            setPwNew={setPwNew}
            pwConfirm={pwConfirm}
            setPwConfirm={setPwConfirm}
            pwMsg={pwMsg}
            handlePasswordResetSubmit={handlePasswordResetSubmit}
          />
        )}

        {/* Sheet: Create Session */}
        {showCreateSheet && (
          <CreateSessionModal
            catalogue={catalogue}
            trialsLeft={trialsLeft}
            creditsLeft={creditsLeft}
            billingChoice={billingChoice}
            setBillingChoice={setBillingChoice}
            sessionType={sessionType}
            setSessionType={setSessionType}
            newCompany={newCompany}
            setNewCompany={setNewCompany}
            newRole={newRole}
            setNewRole={setNewRole}
            newJd={newJd}
            setNewJd={setNewJd}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newDesc={newDesc}
            setNewDesc={setNewDesc}
            newContext={newContext}
            setNewContext={setNewContext}
            newLanguage={newLanguage}
            setNewLanguage={setNewLanguage}
            newAgent={newAgent}
            setNewAgent={setNewAgent}
            newAuto={newAuto}
            setNewAuto={setNewAuto}
            newSaveTranscript={newSaveTranscript}
            setNewSaveTranscript={setNewSaveTranscript}
            createMsg={createMsg}
            handleCreateSession={handleCreateSession}
            setShowCreateSheet={setShowCreateSheet}
          />
        )}
      </div>
    );
  }

  // 3. Live Copilot App View
  if (currentView === 'app') {
    return (
      <CopilotAppView
        activeSession={activeSession}
        listening={listening}
        toggleListening={toggleListening}
        elapsedText={elapsedText}
        tallyState={tallyState}
        tallyLabel={tallyLabel}
        listenSource={listenSource}
        setListenSource={setListenSource}
        newAuto={newAuto}
        setNewAuto={setNewAuto}
        liveCueLine={liveCueLine}
        liveQType={liveQType}
        liveAnswer={liveAnswer}
        liveTranscripts={liveTranscripts}
        setLiveTranscripts={setLiveTranscripts}
        manualQuestion={manualQuestion}
        setManualQuestion={setManualQuestion}
        handleManualAskSubmit={handleManualAskSubmit}
        handleEndSession={handleEndSession}
        setCurrentView={changeView}
        stopListening={stopRecording}
      />
    );
  }

  // 4. Post Call Review View
  if (currentView === 'review') {
    return (
      <ReviewSessionView
        reviewPane={reviewPane}
        setReviewPane={setReviewPane}
        reviewData={reviewData}
        reviewMessages={reviewMessages}
        reviewAskInput={reviewAskInput}
        setReviewAskInput={setReviewAskInput}
        handleReviewAskSubmit={handleReviewAskSubmit}
        setCurrentView={changeView}
      />
    );
  }

  return null;
}
