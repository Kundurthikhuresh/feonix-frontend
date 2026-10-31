import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatWhen } from '../../lib/utils';
import './AdminDashboard.css';
import AdminPromotionsSection from './AdminPromotionsSection';
import AdminAuditLogsSection from './AdminAuditLogsSection';

export const SECTION_TO_ROUTE = {
  dashboard: 'dashboard',
  users: 'users',
  sessions: 'call-sessions',
  ai_usage: 'ai-usage',
  documents: 'resumes',
  credits: 'credits',
  subscriptions: 'subscriptions',
  promotions: 'promotions',
  audit_logs: 'audit-logs',
  settings: 'settings',
};

export const ROUTE_TO_SECTION = {
  dashboard: 'dashboard',
  users: 'users',
  sessions: 'sessions',
  'call-sessions': 'sessions',
  'ai-usage': 'ai_usage',
  ai_usage: 'ai_usage',
  resumes: 'documents',
  documents: 'documents',
  credits: 'credits',
  'credits-trials': 'credits',
  subscriptions: 'subscriptions',
  promotions: 'promotions',
  'audit-logs': 'audit_logs',
  audit_logs: 'audit_logs',
  settings: 'settings',
};

export default function AdminPane({
  user,
  onExitAdmin,
  themeMode,
  toggleTheme,
  handleLogout,
  initialSection,
}) {
  const getInitialSection = () => {
    if (initialSection && ROUTE_TO_SECTION[initialSection.toLowerCase()]) {
      return ROUTE_TO_SECTION[initialSection.toLowerCase()];
    }
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts[0] === 'admin' && parts[1]) {
        const mapped = ROUTE_TO_SECTION[parts[1].toLowerCase()];
        if (mapped) return mapped;
      }
    }
    return 'dashboard';
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);

  const navigateSection = (sectionKey, updateHistory = true) => {
    navigateSection(sectionKey);
    if (updateHistory && typeof window !== 'undefined') {
      const slug = SECTION_TO_ROUTE[sectionKey] || sectionKey;
      const targetPath = slug === 'dashboard' ? '/admin/dashboard' : `/admin/${slug}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ section: sectionKey }, '', targetPath);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;
    const parts = currentPath.split('/').filter(Boolean);
    if (parts[0] === 'admin') {
      if (!parts[1]) {
        window.history.replaceState({ section: 'dashboard' }, '', '/admin/dashboard');
      } else {
        const mapped = ROUTE_TO_SECTION[parts[1].toLowerCase()];
        if (mapped && mapped !== activeSection) {
          navigateSection(mapped);
        }
      }
    }

    const handlePopState = () => {
      const p = window.location.pathname.split('/').filter(Boolean);
      if (p[0] === 'admin') {
        const targetSlug = p[1] ? p[1].toLowerCase() : 'dashboard';
        const mapped = ROUTE_TO_SECTION[targetSlug] || 'dashboard';
        navigateSection(mapped);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [dateRange, setDateRange] = useState('30d');
  const [dateRangeLabel, setDateRangeLabel] = useState('Last 30 Days');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const topUserMenuRef = useRef(null);
  const datePickerRef = useRef(null);

  // Overview / Dashboard state
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Users state
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ total: 0, pages: 1 });

  // User Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createQuota, setCreateQuota] = useState('100000');
  const [createMsg, setCreateMsg] = useState({ text: '', type: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAction, setBalanceAction] = useState('grant');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [balanceMsg, setBalanceMsg] = useState({ text: '', type: '' });
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [showPwModal, setShowPwModal] = useState(false);
  const [pwTargetUser, setPwTargetUser] = useState(null);
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Sessions state
  const [sessionsList, setSessionsList] = useState([]);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('all');
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPagination, setSessionPagination] = useState({ total: 0, pages: 1 });
  const [loadingSessions, setLoadingSessions] = useState(false);

  // AI Usage state
  const [aiUsageData, setAiUsageData] = useState(null);
  const [loadingAiUsage, setLoadingAiUsage] = useState(false);

  // Transcriptions state
  const [transcriptionsData, setTranscriptionsData] = useState(null);
  const [loadingTranscriptions, setLoadingTranscriptions] = useState(false);

  // Documents state
  const [documentsList, setDocumentsList] = useState([]);
  const [docKindFilter, setDocKindFilter] = useState('all');
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Credits & Trials ledger state
  const [ledgerTxs, setLedgerTxs] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Subscriptions state
  const [subscriptionsData, setSubscriptionsData] = useState(null);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Settings state
  const [settingsData, setSettingsData] = useState(null);
  const [settingTrials, setSettingTrials] = useState('5');
  const [settingQuota, setSettingQuota] = useState('100000');
  const [settingsMsg, setSettingsMsg] = useState({ text: '', type: '' });
  const [savingSettings, setSavingSettings] = useState(false);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (topUserMenuRef.current && !topUserMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch overview data
  const loadOverview = async (range = dateRange) => {
    setLoadingOverview(true);
    try {
      const res = await fetch(`/api/admin/overview?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    loadOverview(dateRange);
    const interval = setInterval(() => {
      loadOverview(dateRange);
    }, 15000);
    return () => clearInterval(interval);
  }, [dateRange]);

  // Fetch users list
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({
        search: userSearch,
        status: userStatusFilter,
        page: String(userPage),
        limit: '25',
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
        setUserPagination(data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'users') {
      loadUsers();
    }
  }, [activeSection, userSearch, userStatusFilter, userPage]);

  // Fetch sessions list
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const params = new URLSearchParams({
        search: sessionSearch,
        status: sessionStatusFilter,
        page: String(sessionPage),
        limit: '25',
      });
      const res = await fetch(`/api/admin/sessions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSessionsList(data.sessions || []);
        setSessionPagination(data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'sessions') {
      loadSessions();
    }
  }, [activeSection, sessionSearch, sessionStatusFilter, sessionPage]);

  // Fetch AI usage
  const loadAiUsage = async () => {
    setLoadingAiUsage(true);
    try {
      const res = await fetch('/api/admin/ai-usage');
      if (res.ok) {
        const data = await res.json();
        setAiUsageData(data);
      }
    } catch (err) {
      console.error('Failed to load AI usage:', err);
    } finally {
      setLoadingAiUsage(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'ai_usage') {
      loadAiUsage();
    }
  }, [activeSection]);

  // Fetch Transcriptions
  const loadTranscriptions = async () => {
    setLoadingTranscriptions(true);
    try {
      const res = await fetch('/api/admin/transcriptions');
      if (res.ok) {
        const data = await res.json();
        setTranscriptionsData(data);
      }
    } catch (err) {
      console.error('Failed to load transcriptions:', err);
    } finally {
      setLoadingTranscriptions(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'transcriptions') {
      loadTranscriptions();
    }
  }, [activeSection]);

  // Fetch Documents
  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const res = await fetch(`/api/admin/documents?kind=${docKindFilter}`);
      if (res.ok) {
        const data = await res.json();
        setDocumentsList(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'documents') {
      loadDocuments();
    }
  }, [activeSection, docKindFilter]);

  // Fetch Credits & Trials
  const loadCreditsTrials = async () => {
    setLoadingLedger(true);
    try {
      const res = await fetch('/api/admin/credits-trials');
      if (res.ok) {
        const data = await res.json();
        setLedgerTxs(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load credits & trials:', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'credits') {
      loadCreditsTrials();
    }
  }, [activeSection]);

  // Fetch Subscriptions
  const loadSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      const res = await fetch('/api/admin/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubscriptionsData(data);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'subscriptions') {
      loadSubscriptions();
    }
  }, [activeSection]);

  // Fetch Audit Logs
  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'audit_logs') {
      loadAuditLogs();
    }
  }, [activeSection]);

  // Fetch Settings
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettingsData(data);
        setSettingTrials(String(data.default_free_trials || 5));
        setSettingQuota(String(data.default_token_quota || 100000));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    if (activeSection === 'settings') {
      loadSettings();
    }
  }, [activeSection]);

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          token_quota: Number(createQuota),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg({ text: 'Customer account created successfully!', type: 'ok' });
        setCreateEmail('');
        setCreatePassword('');
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateMsg({ text: '', type: '' });
          loadUsers();
          loadOverview();
        }, 1200);
      } else {
        setCreateMsg({ text: data.message || data.error || 'Failed to create user.', type: 'err' });
      }
    } catch (err) {
      setCreateMsg({ text: 'Connection error.', type: 'err' });
    } finally {
      setCreateLoading(false);
    }
  };

  // Toggle User Status (Suspend/Activate)
  const handleToggleUserStatus = async (targetUser) => {
    const isSuspending = !targetUser.disabled;
    const confirmText = isSuspending
      ? `Are you sure you want to suspend account for ${targetUser.email}?`
      : `Activate account for ${targetUser.email}?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: isSuspending }),
      });
      if (res.ok) {
        loadUsers();
        loadOverview();
      } else {
        const d = await res.json();
        alert(d.message || 'Operation failed');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  // Balance Adjustment Handler
  const handleApplyBalance = async (e) => {
    e.preventDefault();
    if (!balanceAmount || isNaN(balanceAmount)) {
      setBalanceMsg({ text: 'Enter a valid numeric amount', type: 'err' });
      return;
    }
    setBalanceLoading(true);
    setBalanceMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: balanceAction,
          amount: Number(balanceAmount),
          reason: balanceReason || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBalanceMsg({ text: 'Balance updated successfully!', type: 'ok' });
        setTimeout(() => {
          setShowBalanceModal(false);
          setBalanceMsg({ text: '', type: '' });
          setBalanceAmount('');
          setBalanceReason('');
          loadUsers();
          loadOverview();
        }, 1100);
      } else {
        setBalanceMsg({ text: data.message || 'Balance update failed', type: 'err' });
      }
    } catch (err) {
      setBalanceMsg({ text: 'Connection error', type: 'err' });
    } finally {
      setBalanceLoading(false);
    }
  };

  // Password Reset Handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (pwNew.length < 6) {
      setPwMsg({ text: 'Password must be at least 6 characters', type: 'err' });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ text: 'Passwords do not match', type: 'err' });
      return;
    }
    setPwLoading(true);
    setPwMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/admin/users/${pwTargetUser.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ text: 'Password reset successfully!', type: 'ok' });
        setTimeout(() => {
          setShowPwModal(false);
          setPwMsg({ text: '', type: '' });
          setPwNew('');
          setPwConfirm('');
        }, 1100);
      } else {
        setPwMsg({ text: data.message || 'Password reset failed', type: 'err' });
      }
    } catch (err) {
      setPwMsg({ text: 'Connection error', type: 'err' });
    } finally {
      setPwLoading(false);
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_free_trials: settingTrials,
        }),
      });
      if (res.ok) {
        setSettingsMsg({ text: 'Platform settings saved successfully!', type: 'ok' });
        loadSettings();
      } else {
        setSettingsMsg({ text: 'Failed to update settings', type: 'err' });
      }
    } catch (err) {
      setSettingsMsg({ text: 'Connection error', type: 'err' });
    } finally {
      setSavingSettings(false);
    }
  };

  const formatUserPlan = (u) => {
    if (u.role === 'owner' && (!u.plan || u.plan === 'free')) {
      return { name: 'Owner', badge: 'owner' };
    }
    const raw = (u.plan || 'free').toLowerCase();
    switch (raw) {
      case 'pro':
        return { name: 'Pro Plan', badge: 'inprogress' };
      case 'premium':
        return { name: 'Premium Plan', badge: 'completed' };
      case 'sub_weekly':
        return { name: 'Weekly Unlimited', badge: 'completed' };
      case 'sub_monthly':
        return { name: 'Monthly Unlimited', badge: 'completed' };
      case 'sub_yearly':
        return { name: 'Yearly Unlimited', badge: 'completed' };
      case 'pack_1':
        return { name: '1 Credit Pack', badge: 'inprogress' };
      case 'pack_3':
        return { name: '3 Credits Pack', badge: 'inprogress' };
      case 'pack_9':
        return { name: '15 Credits Pack', badge: 'inprogress' };
      case 'enterprise':
        return { name: 'Enterprise', badge: 'completed' };
      case 'owner':
        return { name: 'Owner', badge: 'owner' };
      case 'free':
        return { name: 'Free Trial', badge: 'member' };
      default:
        return {
          name: raw.replace(/^sub_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          badge: 'inprogress',
        };
    }
  };

  // Export current table as CSV
  const handleExportCsv = () => {
    let rows = [];
    let filename = `feonixai-${activeSection}-export.csv`;

    if (activeSection === 'users') {
      rows = adminUsers.map((u) => ({
        ID: u.id,
        Email: u.email,
        Plan: formatUserPlan(u).name,
        Status: u.disabled ? 'Suspended' : 'Active',
        Credits: typeof u.credits_remaining === 'number' ? u.credits_remaining.toFixed(1) : '0.0',
        Trials: u.trials_remaining ?? 0,
        Sessions: u.sessions_count ?? 0,
        CreatedAt: u.created_at,
      }));
    } else if (activeSection === 'sessions') {
      rows = sessionsList.map((s) => ({
        SessionID: s.sessionId,
        Company: s.company,
        Role: s.role,
        Status: s.status,
        Duration: s.duration,
        User: s.user_email,
        Answers: s.answers_count,
        CreatedAt: s.created_at,
      }));
    } else {
      // Default overview export
      rows = (overview?.recent_sessions || []).map((s) => ({
        SessionID: s.sessionId,
        Company: s.company,
        Duration: s.duration,
        Status: s.status,
        User: s.user,
        Date: s.date,
      }));
    }

    if (!rows.length) {
      alert('No data available to export');
      return;
    }

    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [headers, ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Safe credit and session counters
  // Real figures only. These used to fall back to invented numbers (15 users,
  // 123 sessions, 2,716 transcriptions…) whenever the overview had not loaded,
  // which looked like real data.
  const totalUsersCount = overview?.kpis?.total_users ?? 0;
  const totalSessionsCount = overview?.kpis?.total_sessions ?? 0;
  const totalTranscriptionsCount = overview?.kpis?.total_transcriptions ?? 0;
  const creditsConsumedCount = overview?.kpis?.credits_consumed ?? 0;
  const creditAllocationPct = overview?.kpis?.credit_allocation_percentage ?? 0;
  const rangeLabel = { '7d': 'last 7 days', '30d': 'last 30 days', this_month: 'this month', all: 'all time' }[dateRange] || 'selected period';
  const newInPeriod = (n, noun) => (n > 0 ? `+${n.toLocaleString()} new ${noun}` : `No new ${noun}`);

  // Donut chart angles
  const donutCompletedPct = overview?.session_outcomes?.completed_pct ?? 0;
  const donutInProgPct = overview?.session_outcomes?.in_progress_pct ?? 0;
  const donutFailedPct = overview?.session_outcomes?.failed_pct ?? 0;
  const donutTotal = overview?.session_outcomes?.total ?? totalSessionsCount;

  // Bar chart values
  const usageBars = overview?.ai_usage_trend || [];

  const maxBarVal = Math.max(...usageBars.map((b) => b.total), 100);


  return (
    <div className="admin-shell">
      {/* 1. Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand" onClick={() => navigateSection('dashboard')}>
          <div className="admin-brand-icon">F</div>
          <span className="admin-brand-text">FeonixAI</span>
        </div>

        <nav className="admin-sidebar-menu">
          <button
            className={`admin-menu-link ${activeSection === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => navigateSection('dashboard')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
            </span>
            <span>Dashboard</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'users' ? 'is-active' : ''}`}
            onClick={() => navigateSection('users')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            <span>Users</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'sessions' ? 'is-active' : ''}`}
            onClick={() => navigateSection('sessions')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            <span>Call Sessions</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'ai_usage' ? 'is-active' : ''}`}
            onClick={() => navigateSection('ai_usage')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <span>AI Usage</span>
          </button>


          <button
            className={`admin-menu-link ${activeSection === 'documents' ? 'is-active' : ''}`}
            onClick={() => navigateSection('documents')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </span>
            <span>Resumes</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'credits' ? 'is-active' : ''}`}
            onClick={() => navigateSection('credits')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1"></path>
                <path d="M12 6v2m0 8v2"></path>
              </svg>
            </span>
            <span>Credits &amp; Trials</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'subscriptions' ? 'is-active' : ''}`}
            onClick={() => navigateSection('subscriptions')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </span>
            <span>Subscriptions</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'promotions' ? 'is-active' : ''}`}
            onClick={() => navigateSection('promotions')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
                <path d="M9 9h.01"></path>
                <path d="M15 15h.01"></path>
                <path d="m15 9-6 6"></path>
              </svg>
            </span>
            <span>Promotions</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'audit_logs' ? 'is-active' : ''}`}
            onClick={() => navigateSection('audit_logs')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </span>
            <span>Audit Logs</span>
          </button>

          <button
            className={`admin-menu-link ${activeSection === 'settings' ? 'is-active' : ''}`}
            onClick={() => navigateSection('settings')}
            type="button"
          >
            <span className="admin-menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Platform usage card */}
        <div className="admin-usage-card">
          <div className="admin-usage-title">
            <span>Platform usage</span>
          </div>
          <div className="admin-usage-bar">
            <div className="admin-usage-fill" style={{ width: `${Math.min(100, creditAllocationPct)}%` }}></div>
          </div>
          <p className="admin-usage-note">
            <strong>{(overview?.kpis?.credits_remaining ?? 0).toLocaleString()}</strong> credits remaining across all users
          </p>
        </div>

      </aside>

      {/* 2. Main Content Area */}
      <main className="admin-body">
        {/* Top Header Bar */}
        <header className="admin-top-bar">
          <div className="admin-title-wrap">
            <h1>
              {activeSection === 'dashboard'
                ? 'Welcome back, Admin'
                : activeSection === 'users'
                ? 'User Management'
                : activeSection === 'sessions'
                ? 'Platform Call Sessions'
                : activeSection === 'ai_usage'
                ? 'AI & Token Usage'
                : activeSection === 'transcriptions'
                ? 'Transcriptions'
                : activeSection === 'documents'
                ? 'Resumes'
                : activeSection === 'credits'
                ? 'Credits & Trial Ledger'
                : activeSection === 'subscriptions'
                ? 'Subscriptions & Billing'
                : activeSection === 'promotions'
                ? 'Promotions & Special Offers'
                : activeSection === 'audit_logs'
                ? 'Administrative Audit Logs'
                : 'Platform Settings'}
            </h1>
            <p className="admin-subtitle">
              {activeSection === 'dashboard'
                ? 'Feonix AI platform overview'
                : 'Monitor, manage and configure the Feonix AI platform'}
            </p>
          </div>

          <div className="admin-header-controls">
            {/* Date range picker */}
            <div style={{ position: 'relative' }} ref={datePickerRef}>
              <button
                type="button"
                className="admin-date-picker-btn"
                onClick={() => setShowDatePicker((prev) => !prev)}
              >
                <span>📅</span>
                <span>{dateRangeLabel}</span>
                <span style={{ fontSize: '10px', color: 'var(--ad-text-dim)' }}>▼</span>
              </button>

              {showDatePicker && (
                <div className="admin-user-popover" style={{ top: 'calc(100% + 6px)', bottom: 'auto', width: '160px' }}>
                  <button
                    type="button"
                    className="admin-popover-item"
                    onClick={() => {
                      setDateRange('7d');
                      setDateRangeLabel('Last 7 Days');
                      setShowDatePicker(false);
                    }}
                  >
                    Last 7 Days
                  </button>
                  <button
                    type="button"
                    className="admin-popover-item"
                    onClick={() => {
                      setDateRange('30d');
                      setDateRangeLabel('Last 30 Days');
                      setShowDatePicker(false);
                    }}
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    className="admin-popover-item"
                    onClick={() => {
                      setDateRange('this_month');
                      setDateRangeLabel('This Month');
                      setShowDatePicker(false);
                    }}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    className="admin-popover-item"
                    onClick={() => {
                      setDateRange('all');
                      setDateRangeLabel('All Time');
                      setShowDatePicker(false);
                    }}
                  >
                    All Time
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="admin-pill-btn"
              onClick={() => {
                if (activeSection === 'dashboard') {
                  loadOverview();
                } else if (activeSection === 'users') {
                  loadUsers();
                } else if (activeSection === 'sessions') {
                  loadSessions();
                }
              }}
              title="Refresh Data"
            >
              <span>⚡</span> Filter
            </button>

            <button
              type="button"
              className="admin-pill-btn"
              onClick={handleExportCsv}
              title="Export active table as CSV"
            >
              <span>📥</span> Export
            </button>

            <div style={{ position: 'relative' }} ref={topUserMenuRef}>
              <button
                type="button"
                className="admin-pill-btn"
                onClick={() => setShowUserDropdown((prev) => !prev)}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#7c3aed',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {(user?.email?.[0] || 'A').toUpperCase()}
                </div>
                <span>Admin</span>
                <span style={{ fontSize: '10px' }}>▼</span>
              </button>

              {showUserDropdown && (
                <div
                  className="admin-user-popover"
                  style={{
                    top: 'calc(100% + 6px)',
                    bottom: 'auto',
                    left: 'auto',
                    right: 0,
                    width: '210px',
                  }}
                >
                  <button
                    type="button"
                    className="admin-popover-item"
                    onClick={() => {
                      setShowUserDropdown(false);
                      toggleTheme();
                    }}
                  >
                    <span>🌓</span> {themeMode === 'light' ? 'Dark mode' : 'Light mode'}
                  </button>
                  <button
                    type="button"
                    className="admin-popover-item"
                    onClick={() => {
                      setShowUserDropdown(false);
                      handleLogout();
                    }}
                    style={{ color: 'var(--ad-red)' }}
                  >
                    <span>🚪</span> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================================================================
            SECTION 1: DASHBOARD
            ================================================================ */}
        {activeSection === 'dashboard' && (
          <>
            {/* Row 1: 4 Primary KPI Summary Cards */}
            <section className="admin-kpi-grid">
              {/* Card 1: Total users */}
              <div className="admin-kpi-card">
                <div className="admin-kpi-top">
                  <div className="admin-kpi-icon-wrap users">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <button type="button" className="admin-kpi-dots-btn" onClick={() => navigateSection('users')}>⋮</button>
                </div>
                <span className="admin-kpi-label">Total users</span>
                <div className="admin-kpi-value">{totalUsersCount.toLocaleString()}</div>
                <div className="admin-kpi-trend">
                  <span>{newInPeriod(overview?.kpis?.new_users_period ?? 0, 'users')}</span>
                  <span style={{ color: 'var(--ad-text-muted)' }}>{rangeLabel}</span>
                </div>
              </div>

              {/* Card 2: AI sessions */}
              <div className="admin-kpi-card">
                <div className="admin-kpi-top">
                  <div className="admin-kpi-icon-wrap sessions">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <button type="button" className="admin-kpi-dots-btn" onClick={() => navigateSection('sessions')}>⋮</button>
                </div>
                <span className="admin-kpi-label">AI sessions</span>
                <div className="admin-kpi-value">{totalSessionsCount.toLocaleString()}</div>
                <div className="admin-kpi-trend">
                  <span>{newInPeriod(overview?.kpis?.new_sessions_period ?? 0, 'sessions')}</span>
                  <span style={{ color: 'var(--ad-text-muted)' }}>{rangeLabel}</span>
                </div>
              </div>

              {/* Card 4: Credits consumed */}
              <div className="admin-kpi-card">
                <div className="admin-kpi-top">
                  <div className="admin-kpi-icon-wrap credits">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"></circle>
                      <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1"></path>
                    </svg>
                  </div>
                  <button type="button" className="admin-kpi-dots-btn" onClick={() => navigateSection('credits')}>⋮</button>
                </div>
                <span className="admin-kpi-label">Credits consumed</span>
                <div className="admin-kpi-value">{creditsConsumedCount.toLocaleString()}</div>
                <div className="admin-kpi-progress-bar">
                  <div className="admin-kpi-progress-fill" style={{ width: `${Math.min(100, creditAllocationPct)}%` }}></div>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)' }}>
                  {creditAllocationPct}% of all credits granted
                </div>
              </div>
            </section>

            {/* Row 2: 3 Analytics & Charts Cards */}
            <section className="admin-charts-grid">
              {/* Card A: Session Outcomes (Donut) */}
              <div className="admin-chart-card">
                <div className="admin-chart-header">
                  <h3 className="admin-chart-title">Session outcomes</h3>
                  <button type="button" className="admin-kpi-dots-btn" onClick={() => navigateSection('sessions')}>⋮</button>
                </div>

                <div className="admin-donut-wrapper">
                  <div className="admin-donut-graphic">
                    <svg viewBox="0 0 100 100" width="140" height="140">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--ad-border)" strokeWidth="11" />
                      {/* Completed arc (purple) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="11"
                        strokeDasharray={`${donutCompletedPct * 2.38} 238`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      {/* In Progress arc (cyan) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="11"
                        strokeDasharray={`${donutInProgPct * 2.38} 238`}
                        strokeDashoffset={`-${donutCompletedPct * 2.38}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      {/* Failed arc (orange) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="11"
                        strokeDasharray={`${donutFailedPct * 2.38} 238`}
                        strokeDashoffset={`-${(donutCompletedPct + donutInProgPct) * 2.38}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>

                    <div className="admin-donut-center">
                      <div className="admin-donut-center-num">{donutTotal.toLocaleString()}</div>
                      <div className="admin-donut-center-sub">Total sessions</div>
                    </div>
                  </div>

                  <div className="admin-donut-legend">
                    <div className="admin-legend-item">
                      <div className="admin-legend-left">
                        <span className="admin-legend-dot completed"></span>
                        <span className="admin-legend-name">Completed</span>
                      </div>
                      <div className="admin-legend-right">
                        <span className="admin-legend-pct">{donutCompletedPct}%</span>
                        <span className="admin-legend-count">{Math.round((donutCompletedPct / 100) * donutTotal)}</span>
                      </div>
                    </div>

                    <div className="admin-legend-item">
                      <div className="admin-legend-left">
                        <span className="admin-legend-dot inprogress"></span>
                        <span className="admin-legend-name">In progress</span>
                      </div>
                      <div className="admin-legend-right">
                        <span className="admin-legend-pct">{donutInProgPct}%</span>
                        <span className="admin-legend-count">{Math.round((donutInProgPct / 100) * donutTotal)}</span>
                      </div>
                    </div>

                    <div className="admin-legend-item">
                      <div className="admin-legend-left">
                        <span className="admin-legend-dot failed"></span>
                        <span className="admin-legend-name">Failed</span>
                      </div>
                      <div className="admin-legend-right">
                        <span className="admin-legend-pct">{donutFailedPct}%</span>
                        <span className="admin-legend-count">{Math.round((donutFailedPct / 100) * donutTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card B: AI Usage Over Time (Stacked Bars) */}
              <div className="admin-chart-card">
                <div className="admin-chart-header">
                  <h3 className="admin-chart-title">AI usage over time</h3>
                  <button type="button" className="admin-kpi-dots-btn" onClick={() => navigateSection('ai_usage')}>⋮</button>
                </div>

                <div className="admin-bar-chart-container">
                  <div className="admin-bar-chart-bars">
                    {usageBars.map((bar, idx) => {
                      const ansHeight = (bar.answers / maxBarVal) * 120;
                      const transHeight = (bar.transcriptions / maxBarVal) * 120;
                      const screenHeight = (bar.screenshots / maxBarVal) * 120;

                      return (
                        <div key={idx} className="admin-bar-col" title={`${bar.label}: ${bar.total} total requests`}>
                          <div className="admin-bar-stack">
                            <div className="admin-stack-segment answers" style={{ height: `${Math.max(4, ansHeight)}px` }}></div>
                            <div className="admin-stack-segment transcriptions" style={{ height: `${Math.max(3, transHeight)}px` }}></div>
                            <div className="admin-stack-segment screenshots" style={{ height: `${Math.max(2, screenHeight)}px` }}></div>
                          </div>
                          <div className="admin-bar-label">
                            {idx % 4 === 0 || idx === usageBars.length - 1 ? bar.label : (bar.day || bar.label.split(' ')[1] || bar.label)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="admin-bar-legend">
                    <span className="admin-bar-legend-chip">
                      <span className="admin-legend-dot completed"></span> Answers
                    </span>
                    <span className="admin-bar-legend-chip">
                      <span className="admin-legend-dot" style={{ background: '#ec4899' }}></span> Transcriptions
                    </span>
                    <span className="admin-bar-legend-chip">
                      <span className="admin-legend-dot inprogress"></span> Screenshots
                    </span>
                  </div>
                </div>
              </div>


            </section>

            {/* Row 3: 2 Recent Activity Tables */}
            <section className="admin-tables-grid">
              {/* Table 1: Recent user activity */}
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h3 className="admin-chart-title">Recent user activity</h3>
                  <button type="button" className="admin-table-view-all" onClick={() => navigateSection('audit_logs')}>
                    View all →
                  </button>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Activity</th>
                        <th>Credits</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(overview?.recent_user_activity || []).map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="admin-table-user-cell">
                              <div className={`admin-user-circle c${(idx % 4) + 1}`}>
                                {(item.user?.[0] || 'U').toUpperCase()}
                              </div>
                              <span className="admin-user-email-text">{item.user}</span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-activity-cell">
                              <span>
                                {item.type === 'answer' ? '✨' : item.type === 'session' ? '📞' : '📄'}
                              </span>
                              <span>{item.activity}</span>
                            </div>
                          </td>
                          <td>{item.credits ?? '—'}</td>
                          <td>
                            <span className="admin-badge completed">{item.status}</span>
                          </td>
                          <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>
                            {formatWhen(item.timestamp)}
                          </td>
                        </tr>
                      ))}
                      {(!overview?.recent_user_activity || overview.recent_user_activity.length === 0) && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                            No recent customer activity recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Recent sessions */}
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h3 className="admin-chart-title">Recent sessions</h3>
                  <button type="button" className="admin-table-view-all" onClick={() => navigateSection('sessions')}>
                    View all →
                  </button>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Session ID</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>User</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(overview?.recent_sessions || []).map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.sessionId}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <span>📞</span> {s.type}
                            </span>
                          </td>
                          <td>{s.duration}</td>
                          <td>
                            <span className={`admin-badge ${s.status === 'Completed' ? 'completed' : s.status === 'Failed' ? 'failed' : 'inprogress'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td>
                            <span className="admin-user-email-text">{s.user}</span>
                          </td>
                          <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>
                            {formatWhen(s.date)}
                          </td>
                        </tr>
                      ))}
                      {(!overview?.recent_sessions || overview.recent_sessions.length === 0) && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                            No call sessions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ================================================================
            SECTION 2: USERS (Customer Management)
            ================================================================ */}
        {activeSection === 'users' && (
          <div className="admin-management-card">
            <div className="admin-filter-bar">
              <div className="admin-search-field">
                <span>🔍</span>
                <input
                  placeholder="Search customers by email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="admin-filter-pills">
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${userStatusFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setUserStatusFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${userStatusFilter === 'active' ? 'is-active' : ''}`}
                  onClick={() => setUserStatusFilter('active')}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${userStatusFilter === 'suspended' ? 'is-active' : ''}`}
                  onClick={() => setUserStatusFilter('suspended')}
                >
                  Suspended
                </button>
              </div>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                + Create User
              </button>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Plans</th>
                    <th>Status</th>
                    <th>Credits</th>
                    <th>Trials</th>
                    <th>Sessions</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => {
                    const safeCredits = typeof u.credits_remaining === 'number' && !isNaN(u.credits_remaining)
                      ? u.credits_remaining.toFixed(1)
                      : typeof u.account?.credits === 'number' && !isNaN(u.account?.credits)
                      ? u.account.credits.toFixed(1)
                      : '0.0';

                    const safeTrials = typeof u.trials_remaining === 'number'
                      ? u.trials_remaining
                      : u.account?.trials_remaining ?? 0;

                    const planInfo = formatUserPlan(u);

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-table-user-cell">
                            <div className="admin-user-circle">
                              {(u.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <span className="admin-user-email-text" style={{ maxWidth: '220px' }}>
                              {u.email}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge ${planInfo.badge}`}>
                            {planInfo.name}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${u.disabled ? 'suspended' : 'completed'}`}>
                            {u.disabled ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{safeCredits}</td>
                        <td>{safeTrials}</td>
                        <td>{u.sessions_count ?? 0}</td>
                        <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>
                          {formatWhen(u.created_at)}
                        </td>
                        <td>
                          <div className="admin-action-btn-group">
                            <button
                              type="button"
                              className="admin-sm-btn"
                              onClick={() => {
                                setSelectedUser(u);
                                setShowBalanceModal(true);
                              }}
                            >
                              Edit Balance
                            </button>
                            <button
                              type="button"
                              className="admin-sm-btn"
                              onClick={() => {
                                setPwTargetUser(u);
                                setShowPwModal(true);
                              }}
                            >
                              Reset PW
                            </button>
                            {u.role !== 'owner' && (
                              <button
                                type="button"
                                className={`admin-sm-btn ${u.disabled ? '' : 'danger'}`}
                                onClick={() => handleToggleUserStatus(u)}
                              >
                                {u.disabled ? 'Activate' : 'Suspend'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--ad-text-muted)' }}>
                        {loadingUsers ? 'Loading customer accounts…' : 'No customer accounts found matching criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
              <span>Showing {adminUsers.length} of {userPagination.total} customers</span>
              <div className="admin-page-nav">
                <button
                  type="button"
                  className="admin-sm-btn"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>Page {userPage} of {userPagination.pages}</span>
                <button
                  type="button"
                  className="admin-sm-btn"
                  disabled={userPage >= userPagination.pages}
                  onClick={() => setUserPage((p) => Math.min(userPagination.pages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            SECTION 3: CALL SESSIONS
            ================================================================ */}
        {activeSection === 'sessions' && (
          <div className="admin-management-card">
            <div className="admin-filter-bar">
              <div className="admin-search-field">
                <span>🔍</span>
                <input
                  placeholder="Search sessions by company or role..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                />
              </div>

              <div className="admin-filter-pills">
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${sessionStatusFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setSessionStatusFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${sessionStatusFilter === 'ended' ? 'is-active' : ''}`}
                  onClick={() => setSessionStatusFilter('ended')}
                >
                  Completed
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${sessionStatusFilter === 'active' ? 'is-active' : ''}`}
                  onClick={() => setSessionStatusFilter('active')}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${sessionStatusFilter === 'ready' ? 'is-active' : ''}`}
                  onClick={() => setSessionStatusFilter('ready')}
                >
                  Ready
                </button>
              </div>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Answers</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsList.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.sessionId}</td>
                      <td>
                        <span className="admin-user-email-text">{s.user_email}</span>
                      </td>
                      <td><strong>{s.company}</strong></td>
                      <td>{s.role}</td>
                      <td>
                        <span className="admin-badge member">{s.mode}</span>
                      </td>
                      <td>{s.duration}</td>
                      <td>
                        <span className={`admin-badge ${s.status === 'ended' ? 'completed' : s.status === 'ready' ? 'pending' : 'inprogress'}`}>
                          {s.status === 'ended' ? 'Completed' : s.status === 'ready' ? 'Ready' : 'In progress'}
                        </span>
                      </td>
                      <td>{s.answers_count}</td>
                      <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>
                        {formatWhen(s.created_at)}
                      </td>
                    </tr>
                  ))}
                  {sessionsList.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--ad-text-muted)' }}>
                        {loadingSessions ? 'Loading call sessions…' : 'No call sessions found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span>Showing {sessionsList.length} of {sessionPagination.total} sessions</span>
              <div className="admin-page-nav">
                <button
                  type="button"
                  className="admin-sm-btn"
                  disabled={sessionPage <= 1}
                  onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>Page {sessionPage} of {sessionPagination.pages}</span>
                <button
                  type="button"
                  className="admin-sm-btn"
                  disabled={sessionPage >= sessionPagination.pages}
                  onClick={() => setSessionPage((p) => Math.min(sessionPagination.pages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            SECTION 4: AI USAGE
            ================================================================ */}
        {activeSection === 'ai_usage' && (
          <div className="admin-management-card">
            <h3 className="admin-chart-title">AI Model &amp; Token Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', margin: '8px 0 16px 0' }}>
              {(aiUsageData?.models || [])
                .filter((m) => m.model !== 'whisper-1' && m.model !== 'gpt-4o-mini-transcribe')
                .map((m, idx) => (
                  <div key={idx} style={{ padding: '16px', border: '1px solid var(--ad-border)', borderRadius: '12px', background: 'var(--ad-bg)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--ad-text-muted)', textTransform: 'uppercase' }}>Model</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0 10px 0' }}>{m.model}</div>
                    <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>Requests:</strong> {m.requests.toLocaleString()}</div>
                      <div><strong>Prompt Tokens:</strong> {m.prompt_tokens.toLocaleString()}</div>
                      <div><strong>Output Tokens:</strong> {m.output_tokens.toLocaleString()}</div>
                      <div style={{ color: 'var(--ad-purple)', fontWeight: 600 }}>
                        Total: {m.total_tokens.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <h4 style={{ margin: '14px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>Recent AI Requests</h4>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Model</th>
                    <th>Prompt Tokens</th>
                    <th>Output Tokens</th>
                    <th>Total Tokens</th>
                    <th>Session ID</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(aiUsageData?.usage || [])
                    .filter((u) => u.model !== 'whisper-1' && u.model !== 'gpt-4o-mini-transcribe')
                    .map((u, idx) => (
                      <tr key={idx}>
                        <td><span className="admin-user-email-text">{u.user_email}</span></td>
                        <td><span className="admin-badge member">{u.model}</span></td>
                        <td>{u.prompt_tokens}</td>
                        <td>{u.output_tokens}</td>
                        <td><strong>{u.total_tokens}</strong></td>
                        <td>{u.session_id ? `FS-${u.session_id}` : 'Direct'}</td>
                        <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>{formatWhen(u.created_at)}</td>
                      </tr>
                    ))}
                  {(!aiUsageData?.usage || aiUsageData.usage.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                        No AI token events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================
            SECTION 5: TRANSCRIPTIONS
            ================================================================ */}
        {activeSection === 'transcriptions' && (
          <div className="admin-management-card">
            <h3 className="admin-chart-title">Speech-to-Text Transcriptions</h3>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Turn ID</th>
                    <th>Session</th>
                    <th>Speaker</th>
                    <th>Question?</th>
                    <th>Transcript Snippet</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(transcriptionsData?.transcriptions || []).map((t, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace' }}>#{t.id}</td>
                      <td><strong>{t.company}</strong></td>
                      <td>
                        <span className="admin-badge member">{t.speaker}</span>
                      </td>
                      <td>{t.is_question ? 'Yes' : 'No'}</td>
                      <td style={{ maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.text}
                      </td>
                      <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>{formatWhen(t.created_at)}</td>
                    </tr>
                  ))}
                  {(!transcriptionsData?.transcriptions || transcriptionsData.transcriptions.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                        No transcript turns captured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================
            SECTION 6: DOCUMENTS & RESUMES
            ================================================================ */}
        {activeSection === 'documents' && (
          <div className="admin-management-card">
            <div className="admin-filter-bar">
              <h3 className="admin-chart-title">Customer Resumes</h3>
              <div className="admin-filter-pills">
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${docKindFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setDocKindFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${docKindFilter === 'resume' ? 'is-active' : ''}`}
                  onClick={() => setDocKindFilter('resume')}
                >
                  Resumes
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill-btn ${docKindFilter === 'job_description' ? 'is-active' : ''}`}
                  onClick={() => setDocKindFilter('job_description')}
                >
                  Job Descriptions
                </button>
              </div>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Kind</th>
                    <th>Filename</th>
                    <th>Active</th>
                    <th>Characters</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {documentsList.map((d) => (
                    <tr key={d.id}>
                      <td><span className="admin-user-email-text">{d.user_email}</span></td>
                      <td>
                        <span className="admin-badge member">{d.kind}</span>
                      </td>
                      <td><strong>{d.filename}</strong></td>
                      <td>
                        <span className={`admin-badge ${d.is_active ? 'completed' : 'member'}`}>
                          {d.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{d.chars.toLocaleString()} chars</td>
                      <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>{formatWhen(d.created_at)}</td>
                    </tr>
                  ))}
                  {documentsList.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                        No customer documents uploaded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================
            SECTION 7: CREDITS & TRIALS LEDGER
            ================================================================ */}
        {activeSection === 'credits' && (
          <div className="admin-management-card">
            <h3 className="admin-chart-title">Credits &amp; Trial Ledger Transactions</h3>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Ledger</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Customer</th>
                    <th>Reason / Details</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerTxs.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <span className={`admin-badge ${tx.ledger === 'Credits' ? 'owner' : 'inprogress'}`}>
                          {tx.ledger}
                        </span>
                      </td>
                      <td><strong>{tx.type}</strong></td>
                      <td style={{ fontWeight: 700, color: tx.amount < 0 ? 'var(--ad-red)' : 'var(--ad-green)' }}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                      <td><span className="admin-user-email-text">{tx.user_email}</span></td>
                      <td>{tx.reason}</td>
                      <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>{formatWhen(tx.created_at)}</td>
                    </tr>
                  ))}
                  {ledgerTxs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                        No ledger transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================
            SECTION 8: SUBSCRIPTIONS & BILLING
            ================================================================ */}
        {activeSection === 'subscriptions' && (
          <div className="admin-management-card">
            <h3 className="admin-chart-title">Subscription Plans &amp; Gateway</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', margin: '8px 0 18px 0' }}>
              {(subscriptionsData?.plans || []).map((p, idx) => (
                <div key={idx} style={{ padding: '20px', border: '1px solid var(--ad-border)', borderRadius: '14px', background: 'var(--ad-bg)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ad-purple)' }}>{p.name}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 12px 0' }}>
                    {p.price === 0 ? 'Free' : `₹${p.price}`}
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--ad-text)' }}>
                    <div><strong>Session limit:</strong> {p.sessions} sessions</div>
                    <div><strong>Active customers:</strong> {p.active_users}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', background: 'var(--ad-purple-light)', border: '1px solid var(--ad-purple-border)', borderRadius: '12px' }}>
              <strong>Razorpay Gateway Status: </strong>
              <span>
                {subscriptionsData?.razorpay_configured ? '✅ Active and Configured' : '⚠️ Pending Configuration (Set RAZORPAY_KEY_ID in .env)'}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================
            SECTION: PROMOTIONS & OFFERS (ParakeetAI-Style)
            ================================================================ */}
        {activeSection === 'promotions' && <AdminPromotionsSection />}

        {/* ================================================================
            SECTION 9: AUDIT LOGS & FINANCIAL ANALYTICS
            ================================================================ */}
        {activeSection === 'audit_logs' && <AdminAuditLogsSection />}

        {/* ================================================================
            SECTION 10: SETTINGS
            ================================================================ */}
        {activeSection === 'settings' && (
          <div className="admin-management-card">
            <h3 className="admin-chart-title">Platform Configuration &amp; Single-Admin Security</h3>

            <div style={{ maxWidth: '480px', margin: '8px 0 16px 0' }}>
              <div style={{ padding: '16px', border: '1px solid var(--ad-border)', borderRadius: '12px', background: 'var(--ad-bg)' }}>
                <div style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>Designated Administrator</div>
                <div style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0', color: 'var(--ad-purple)' }}>
                  {settingsData?.admin_email || 'kundurthikhuresh64@gmail.com'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ad-green)' }}>
                  🔒 Verified Single-Admin Authorization Enforced
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '480px' }}>
              <div className="admin-field-group">
                <label>Default Free Trials (on customer registration)</label>
                <input
                  className="admin-input-styled"
                  type="number"
                  min="1"
                  max="100"
                  value={settingTrials}
                  onChange={(e) => setSettingTrials(e.target.value)}
                />
              </div>


              {settingsMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: settingsMsg.type === 'ok' ? 'var(--ad-green-light)' : 'var(--ad-red-light)', color: settingsMsg.type === 'ok' ? 'var(--ad-green)' : 'var(--ad-red)' }}>
                  {settingsMsg.text}
                </div>
              )}

              <button type="submit" className="admin-btn-primary" disabled={savingSettings} style={{ width: 'fit-content' }}>
                {savingSettings ? 'Saving…' : 'Save Platform Settings'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ================================================================
          MODAL: CREATE CUSTOMER USER
          ================================================================ */}
      {showCreateModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Create Customer Account</h3>
              <button type="button" className="admin-close-x" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-field-group">
                <label>Email Address</label>
                <input
                  className="admin-input-styled"
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                />
              </div>

              <div className="admin-field-group">
                <label>Password</label>
                <input
                  className="admin-input-styled"
                  type="text"
                  required
                  placeholder="Min 6 characters"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                />
              </div>


              {createMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: createMsg.type === 'ok' ? 'var(--ad-green-light)' : 'var(--ad-red-light)', color: createMsg.type === 'ok' ? 'var(--ad-green)' : 'var(--ad-red)' }}>
                  {createMsg.text}
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="admin-sm-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creating…' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: EDIT BALANCE
          ================================================================ */}
      {showBalanceModal && selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setShowBalanceModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Edit Balance — {selectedUser.email}</h3>
              <button type="button" className="admin-close-x" onClick={() => setShowBalanceModal(false)}>✕</button>
            </div>

            <form onSubmit={handleApplyBalance} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-field-group">
                <label>Action</label>
                <select
                  className="admin-input-styled"
                  value={balanceAction}
                  onChange={(e) => setBalanceAction(e.target.value)}
                >
                  <option value="grant">Grant Credits (+)</option>
                  <option value="refund">Refund Credits (+)</option>
                  <option value="adjust">Adjust Balance (+/-)</option>
                </select>
              </div>

              <div className="admin-field-group">
                <label>Amount (Credits)</label>
                <input
                  className="admin-input-styled"
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 5"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                />
              </div>

              <div className="admin-field-group">
                <label>Reason (Audit log)</label>
                <input
                  className="admin-input-styled"
                  type="text"
                  placeholder="Optional justification"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                />
              </div>

              {balanceMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: balanceMsg.type === 'ok' ? 'var(--ad-green-light)' : 'var(--ad-red-light)', color: balanceMsg.type === 'ok' ? 'var(--ad-green)' : 'var(--ad-red)' }}>
                  {balanceMsg.text}
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="admin-sm-btn" onClick={() => setShowBalanceModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={balanceLoading}>
                  {balanceLoading ? 'Applying…' : 'Apply Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: RESET PASSWORD
          ================================================================ */}
      {showPwModal && pwTargetUser && (
        <div className="admin-modal-backdrop" onClick={() => setShowPwModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Reset Password — {pwTargetUser.email}</h3>
              <button type="button" className="admin-close-x" onClick={() => setShowPwModal(false)}>✕</button>
            </div>

            <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-field-group">
                <label>New Password</label>
                <input
                  className="admin-input-styled"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                />
              </div>

              <div className="admin-field-group">
                <label>Confirm Password</label>
                <input
                  className="admin-input-styled"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                />
              </div>

              {pwMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: pwMsg.type === 'ok' ? 'var(--ad-green-light)' : 'var(--ad-red-light)', color: pwMsg.type === 'ok' ? 'var(--ad-green)' : 'var(--ad-red)' }}>
                  {pwMsg.text}
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="admin-sm-btn" onClick={() => setShowPwModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={pwLoading}>
                  {pwLoading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
