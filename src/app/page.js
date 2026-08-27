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
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dash', 'app', 'review'
  const [authChecked, setAuthChecked] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
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
    const rotateY = ((x - xc) / xc) * 6; // max 6 degrees tilt
    const rotateX = -((y - yc) / yc) * 6;
    setSimTiltX(rotateX);
    setSimTiltY(rotateY);
  };

  const handleSimMouseLeave = () => {
    setSimTiltX(0);
    setSimTiltY(0);
  };
  
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const changeView = (nextView, replace = false) => {
    setCurrentView(nextView);
    if (typeof window !== 'undefined') {
      const state = window.history.state;
      if (replace) {
        window.history.replaceState({ view: nextView }, '');
      } else if (!state || state.view !== nextView) {
        window.history.pushState({ view: nextView }, '');
      }
    }
  };
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register'
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
    const storedTheme = localStorage.getItem('feonix-theme');
    const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const activeTheme = storedTheme || systemTheme;
    setThemeMode(activeTheme);
    document.documentElement.dataset.theme = activeTheme;

    if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState({ view: 'landing' }, '');
    }

    const handlePopState = (e) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
      } else {
        setCurrentView('landing');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    checkUserSession();

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
      clearInterval(bannerTimer);
      stopRecording();
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, []);

  const checkUserSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthChecked(true);

        // If user lands on /launch?session=X (e.g. from an old link), load that session
        // directly into the browser copilot instead of showing the desktop launcher page.
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get('session');
          if (sessionId) {
            try {
              const sRes = await fetch(`/api/sessions/${sessionId}`);
              if (sRes.ok) {
                const sData = await sRes.json();
                enterSession(sData.session);
                return;
              }
            } catch { /* fall through to dash */ }
          }
        }

        // Check if we should switch to dashboard view (if URL param view=dash or history state view=dash)
        let shouldGoToDash = false;
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('view') === 'dash') {
            shouldGoToDash = true;
          } else if (window.history.state && window.history.state.view === 'dash') {
            shouldGoToDash = true;
          }
        }

        if (shouldGoToDash) {
          changeView('dash', true);
        } else {
          changeView('landing', true);
        }
        setActivePane('sessions');
        loadCatalogue();
        loadAccount();
        loadSessions();
        loadDocuments();
        return;
      }
    } catch {
      // ignore — treat as logged out
    }
    changeView('landing', true);
    setAuthChecked(true);
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
      const res = await fetch('/api/catalogue');
      if (res.ok) {
        const data = await res.json();
        setCatalogue(data);
        if (data.languages && data.languages.length > 0) {
          setNewLanguage(data.languages[0].code);
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
      const res = await fetch('/api/auth/account');
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        setCreditsLeft(data.credits_remaining !== null ? Number(data.credits_remaining).toFixed(1) : '0.0');
        setUsedCredits(data.credits_used !== null ? Number(data.credits_used).toFixed(1) : '0.0');
        setTrialsLeft(data.trials_remaining !== null ? data.trials_remaining : 0);
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
      }
    } catch (err) {
      console.error('Error deleting session:', err);
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
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMsg({ text: 'Working…', type: '' });

    const body = { email: authEmail, password: authPassword };
    if (authMode === 'register' && authSignupCode) {
      body.signup_code = authSignupCode;
    }

    const { ok, data } = await postJSON('/api/auth/' + authMode, body);
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

    const { ok, data } = await postJSON('/api/sessions', body);
    if (!ok) {
      setCreateMsg(data.message || 'Could not create session.');
      return;
    }

    setShowCreateSheet(false);
    setCreateMsg('');
    loadSessions();
    loadAccount();

    // Redirect to launch interstitial (handles desktop deep-link or browser fallback)
    router.push(`/launch?session=${encodeURIComponent(data.session.id)}`);
  };

  const enterSession = async (session) => {
    let currentSession = session;
    if (session.status === 'ready') {
      try {
        const res = await fetch(`/api/sessions/${session.id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billing: session.billing_kind }),
        });
        if (res.ok) {
          const data = await res.json();
          currentSession = data.session;
        }
      } catch (err) {
        console.error('Failed to start session:', err);
      }
    }

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

  const handleReviewAskSubmit = async (e) => {
    e.preventDefault();
    if (!reviewAskInput.trim()) return;

    const userMsg = { role: 'user', content: reviewAskInput };
    setReviewMessages(prev => [...prev, userMsg]);
    const promptText = reviewAskInput;
    setReviewAskInput('');

    const { ok, data } = await postJSON(`/api/sessions/${reviewSessionId}/chat`, { prompt: promptText });
    if (ok && data.response) {
      setReviewMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
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

  // 0. Boot Gate — avoid flashing the logged-out landing page while the
  // session check from a fresh mount (e.g. navigating back from another
  // route) is still in flight.
  if (currentView === 'landing' && !authChecked) {
    return <div style={{ minHeight: '100vh', background: '#0b0f14' }} />;
  }

  // 1. Marketing Landing Page View
  if (currentView === 'landing') {
    return (
      <div id="landingView">
        {/* Navbar */}
        <header className="landing-header">
          <div className="landing-nav-container">
            <div className="landing-brand">
              <span className="landing-brand-mark">F</span>
              <span className="landing-brand-name">FEONIX AI<span className="tm">™</span></span>
            </div>
            <nav className="landing-nav">
              <a href="#copilot" className="nav-link">Interview Copilot</a>
              <a href="#coder" className="nav-link">Coding Assistant</a>
              <a href="#desktop" className="nav-link">Desktop App</a>
              <a href="#duo" className="nav-link">Duo <span className="nav-link-sub">(Remote Assist)</span></a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </nav>
            <div className="landing-actions">
              <button
                className="landing-theme-toggle"
                onClick={toggleTheme}
                title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                type="button"
              >
                {themeMode === 'light' ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </button>
              <button
                className="landing-btn-login"
                onClick={() => {
                  if (user) {
                    enterApp(user);
                  } else {
                    setAuthMode('login');
                    setAuthMsg({ text: '', type: '' });
                    setShowAuthModal(true);
                  }
                }}
                type="button"
              >
                {user ? 'Dashboard' : 'Login'}
              </button>
              <button
                className="landing-btn-signup"
                onClick={() => {
                  setAuthMode('register');
                  setAuthMsg({ text: '', type: '' });
                  setShowAuthModal(true);
                }}
                type="button"
              >
                Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-glow-1"></div>
          <div className="hero-glow-2"></div>
          
          <div className="hero-grid-split">
            <div className="hero-content-left">
              <h1 className="hero-title">
                Interview & Meeting<br />
                <span className="gradient-text">AI Copilot</span>
              </h1>
              <p className="hero-subtitle">
                Trusted by 869,852+ users. An innovative dual-layer AI Copilot system that provides AI Copilot and AI Coach running in parallel.
              </p>
              <div className="hero-cta-group">
                <button
                  className="hero-btn-primary"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthMsg({ text: '', type: '' });
                    setShowAuthModal(true);
                  }}
                  type="button"
                >
                  Start For Free <span className="arrow">→</span>
                </button>
                <span className="hero-btn-subtext">Free to start · No credit card required</span>
              </div>
            </div>

            <div className="hero-content-right">
              <div className="hero-3d-graphic-container">
                <div className="hero-3d-graphic">
                  {/* Laser Connectors */}
                  <div className="graphic-laser"></div>
                  <div className="graphic-laser-2"></div>

                  {/* Top Layer: HUD */}
                  <div className="graphic-layer layer-top">
                    <div className="layer-title">Output: Glass HUD Card</div>
                    <div className="layer-item-box" style={{ background: 'rgba(133, 57, 83, 0.15)', borderColor: '#853953' }}>
                      <span className="tally-dot active-answering"></span>
                      <strong style={{ color: '#fff' }}>Cue: Process vs Thread</strong>
                    </div>
                  </div>

                  {/* Middle Layer: Voice Transcription */}
                  <div className="graphic-layer layer-middle">
                    <div className="layer-title">Process: Live Transcription</div>
                    <div className="layer-item-box">
                      <div className="sim-voice-wave wave-active">
                        <span className="wave-bar"></span>
                        <span className="wave-bar"></span>
                        <span className="wave-bar"></span>
                      </div>
                      <span style={{ color: '#cbd5e1' }}>Streaming chunks...</span>
                    </div>
                  </div>

                  {/* Bottom Layer: Uploads */}
                  <div className="graphic-layer layer-bottom">
                    <div className="layer-title">Input: Context Guidelines</div>
                    <div className="layer-item-box">
                      <span>📄 resume_backend.pdf</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Simulator Section */}
        <section className="sim-section">
          <div
            className="sim-container"
            onMouseMove={handleSimMouseMove}
            onMouseLeave={handleSimMouseLeave}
            ref={simContainerRef}
            style={{
              transform: `perspective(1000px) rotateX(${simTiltX}deg) rotateY(${simTiltY}deg)`,
              transition: simTiltX === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
          >
            {/* Left Column: Interactive Controls */}
            <div className="sim-controls">
              <h3>Try Copilot in Real-Time</h3>
              <p>Experience the low-latency transcribing and answer HUD before signing up. Select a question below or enter a custom prompt.</p>
              
              <div className="sim-btn-list">
                {SIM_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    className={`sim-btn-item ${simActiveId === sample.id ? 'active' : ''}`}
                    onClick={() => runSimulation(sample.id, sample.question, sample.answer)}
                    type="button"
                  >
                    <span>{sample.label}</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                ))}
              </div>

              <form className="sim-input-box" onSubmit={handleSimCustomSubmit}>
                <input
                  type="text"
                  className="sim-input"
                  placeholder="Type any custom question..."
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  disabled={simState === 'transcribing' || simState === 'thinking'}
                />
                <button
                  type="submit"
                  className="sim-input-submit"
                  disabled={simState === 'transcribing' || simState === 'thinking'}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>

              <div className={`sim-voice-wave ${simState === 'transcribing' ? 'wave-active' : ''}`}>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600', marginLeft: '8px' }}>
                  {simState === 'transcribing' && "Simulating Voice Input..."}
                  {simState === 'thinking' && "AI is thinking..."}
                  {simState === 'answering' && "HUD Answer Sync Complete!"}
                  {simState === 'idle' && "Microphone Stream Idle"}
                </span>
              </div>
            </div>

            {/* Right Column: Live HUD UI Mockup */}
            <div className="sim-hud">
              <div className="hud-tally-bar">
                <span className={`tally-dot ${simState === 'transcribing' || simState === 'thinking' ? 'active-tally' : simState === 'answering' ? 'active-answering' : ''}`}></span>
                <span>
                  {simState === 'idle' && "TALLY: STANDBY"}
                  {simState === 'transcribing' && "TALLY: TRANSCRIBING"}
                  {simState === 'thinking' && "TALLY: THINKING"}
                  {simState === 'answering' && "TALLY: HUD READY"}
                </span>
              </div>

              {simQuestion ? (
                <div className="hud-question-box">
                  <div className="hud-question-label">Live Cue Line</div>
                  <div className="hud-question-text">"{simQuestion}"</div>
                </div>
              ) : (
                <div className="hud-question-box" style={{ opacity: 0.15 }}>
                  <div className="hud-question-label">Live Cue Line</div>
                  <div className="hud-question-text" style={{ fontStyle: 'italic' }}>Listening for question...</div>
                </div>
              )}

              {simState === 'thinking' && (
                <div className="hud-answer-box" style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ color: '#ff7a18', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                    GENERATING REAL-TIME ANSWER CARD...
                  </div>
                </div>
              )}

              {simState === 'answering' && simAnswer && (
                <div className="hud-answer-box">
                  <div>
                    <div className="mock-tag">{simAnswer.kind.toUpperCase()}</div>
                    <div
                      className="hud-answer-text"
                      dangerouslySetInnerHTML={{ __html: simAnswer.content }}
                    />
                  </div>
                  <div className="hud-answer-footer">
                    <span>Confidence: {simAnswer.confidence}</span>
                    <span>Source: {simAnswer.source}</span>
                  </div>
                </div>
              )}

              {(simState === 'idle' || simState === 'transcribing') && (
                <div className="hud-answer-box" style={{ opacity: 0.15 }}>
                  <div className="hud-placeholder">
                    Select a question on the left to simulate the real-time teleprompter answer card generation.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Logo Cloud Section */}
        <section className="logo-cloud">
          <p>Trusted by elite software engineers worldwide</p>
          <div className="logo-grid">
            <span className="logo-item">Google</span>
            <span className="logo-item">Microsoft</span>
            <span className="logo-item">Meta</span>
            <span className="logo-item">Amazon</span>
            <span className="logo-item">Apple</span>
            <span className="logo-item">Netflix</span>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section" id="features">
          <h2 className="section-title">Engineered for Technical Interaction</h2>
          <p className="section-subtitle">
            FeonixAI runs dynamically in the background to analyze conversation cues, provide code suggestions, and supply real-time facts.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Ultra-Low Latency</h3>
              <p>Detects and transcribes voice cues in real-time (under 1.5 seconds) using optimized local chunk streaming handlers.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3>Context-Aware HUD</h3>
              <p>AI answers dynamically sync with your uploaded resumes, CVs, and custom session guidelines for personalized prompt alignment.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <h3>Multi-Modal Assistant</h3>
              <p>Get instant access to structural code templates, algorithmic steps, system designs, or standard behavioral scenarios on the fly.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Privacy-First Sandbox</h3>
              <p>Secure end-to-end sandbox operations. Your voice recordings and transcripts are private and stored locally on your own profile.</p>
            </div>
          </div>
        </section>

        {/* Dual Mode Section */}
        <section className="dual-mode-section" id="copilot">
          <div className="dual-mode-container">
            <div className="mode-box copilot">
              <div className="mode-badge">Real-Time</div>
              <h3>AI Copilot Mode</h3>
              <p>Runs silently in the background during your technical calls. It transcribes questions and displays concise answer cues instantly on your HUD.</p>
              <ul className="mode-features">
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Teleprompter-scale readable fonts</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Automatic voice-activated trigger</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Manual prompt question overrides</span>
                </li>
              </ul>
            </div>

            <div className="mode-box coach">
              <div className="mode-badge">Analysis</div>
              <h3>AI Coach Mode</h3>
              <p>Evaluates your mock sessions and real calls afterwards. Provides detailed reports on response structure, speed, and content coverage.</p>
              <ul className="mode-features">
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Detailed structural performance feedback</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Interactive review chat interface</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Saved transcripts and response maps</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section" id="desktop">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get set up and start utilizing your personal AI helper in less than 2 minutes.</p>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Configure Guidelines</h3>
              <p>Upload your resumes, documents, or paste a specific job description to set the AI knowledge context.</p>
            </div>
            
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Launch the Copilot</h3>
              <p>Create a session, select the AI agent, and trigger the live voice/mic listening toggle on the workspace.</p>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Get Real-Time Cues</h3>
              <p>Speak naturally. The Copilot will analyze questions and display styled answers on the glassmorphic HUD panel.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section" id="faq">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Got questions? We've got answers.</p>
          <div className="faq-list">
            <div className={`faq-item ${activeFaq === 0 ? 'is-open' : ''}`}>
              <button className="faq-trigger" onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)} type="button">
                <h3>How fast are the real-time AI answer suggestions?</h3>
                <svg className="faq-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="faq-content">
                <p>Typically under 1.5 seconds! Our optimized backend pipelines process incoming audio chunks concurrently, converting voice cues into structured prompts immediately.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 1 ? 'is-open' : ''}`}>
              <button className="faq-trigger" onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)} type="button">
                <h3>Is my interview data secure and private?</h3>
                <svg className="faq-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="faq-content">
                <p>Yes, absolutely. All sessions are sandbox-protected. Your audio files and transcripts are isolated, private to your account profile, and can be permanently deleted at any time.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 2 ? 'is-open' : ''}`}>
              <button className="faq-trigger" onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)} type="button">
                <h3>Can I customize the AI response guidelines?</h3>
                <svg className="faq-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="faq-content">
                <p>Yes. You can upload custom resumes, CVs, and specific guidelines, or even paste entire job descriptions. The AI will cross-reference this information to match the context during your calls.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 3 ? 'is-open' : ''}`}>
              <button className="faq-trigger" onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)} type="button">
                <h3>Does it support multiple programming languages?</h3>
                <svg className="faq-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="faq-content">
                <p>Yes, it parses coding questions and displays syntax-highlighted solutions for JavaScript, Python, C++, Java, Go, Rust, and more.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-container">
            <div className="footer-brand-col">
              <div className="landing-brand">
                <span className="landing-brand-mark">F</span>
                <span className="landing-brand-name">FEONIX AI</span>
              </div>
              <p>High-stakes meeting and technical interview assistance powered by dual-layer real-time AI.</p>
            </div>
            
            <div className="footer-col">
              <h4>Product</h4>
              <ul className="footer-links">
                <li><a href="#copilot">AI Copilot</a></li>
                <li><a href="#coder">Coding Assistant</a></li>
                <li><a href="#desktop">Desktop App</a></li>
                <li><a href="#pricing">Pricing Plans</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#support">Get Support</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Feonix AI. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </footer>

        {/* Floating Ask AI Button */}
        <button
          className="floating-ask-ai"
          onClick={() => {
            setAuthMode('login');
            setAuthMsg({ text: '', type: '' });
            setShowAuthModal(true);
          }}
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Ask AI</span>
          <span className="ask-ping"></span>
        </button>

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
    return (
      <div id="dashView">
        <Sidebar
          user={user}
          activePane={activePane}
          setActivePane={setActivePane}
          themeMode={themeMode}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
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
