"use client";

import React, { useState, useEffect, useRef } from 'react';

// The last reports fetched, kept while the page is open, so coming back to
// Audit Logs shows them at once while fresh numbers load in the background.
let lastAnalytics = null;
let lastEvents = null;

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const EVENT_CATEGORIES = [
  { value: 'ALL', label: 'All Events' },
  { value: 'SESSION', label: 'Copilot Sessions' },
  { value: 'TRIAL', label: 'Free Trials' },
  { value: 'CREDIT', label: 'Paid Credits' },
  { value: 'PAYMENT', label: 'Payments & Redemptions' },
  { value: 'ADMIN', label: 'Admin Activities' },
];

export default function AdminAuditLogsSection() {
  // Tabs: 'ledger' (User-level audit) | 'events' (Detailed security event logs)
  const [activeTab, setActiveTab] = useState('ledger');

  // Filter & Date Range State
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // User-Level Ledger State
  const [analytics, setAnalytics] = useState(lastAnalytics);
  const [loadingAnalytics, setLoadingAnalytics] = useState(!lastAnalytics);
  const searchMounted = useRef(false);
  const eventSearchMounted = useRef(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('net_profit_loss');
  const [sortOrder, setSortOrder] = useState('desc');
  const [ledgerPage, setLedgerPage] = useState(1);

  // Granular Event Logs State
  const [eventsData, setEventsData] = useState(lastEvents);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventCategory, setEventCategory] = useState('ALL');
  const [eventOutcome, setEventOutcome] = useState('ALL');
  const [eventSearch, setEventSearch] = useState('');
  const [eventsPage, setEventsPage] = useState(1);
  const [expandedEventId, setExpandedEventId] = useState(null);

  // User Events Modal
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [userSpecificEvents, setUserSpecificEvents] = useState([]);
  const [loadingUserEvents, setLoadingUserEvents] = useState(false);

  // Load Analytics Data
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const params = new URLSearchParams({
        range: dateRange,
        page: String(ledgerPage),
        limit: '25',
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchEmail,
        status: statusFilter,
      });

      if (dateRange === 'custom') {
        if (customStart) params.append('start_date', customStart);
        if (customEnd) params.append('end_date', customEnd);
      }

      const res = await fetch(`/api/admin/audit-analytics?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        lastAnalytics = d;
        setAnalytics(d);
      } else {
        console.error('Failed to fetch audit analytics:', res.statusText);
      }
    } catch (err) {
      console.error('Error fetching audit analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load Event Logs
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const params = new URLSearchParams({
        page: String(eventsPage),
        limit: '50',
        category: eventCategory,
        outcome: eventOutcome,
        user_email: eventSearch,
      });

      const res = await fetch(`/api/admin/audit-events?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        lastEvents = d;
        setEventsData(d);
      } else {
        console.error('Failed to fetch audit events:', res.statusText);
      }
    } catch (err) {
      console.error('Error fetching audit events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load User Specific Events for Modal
  const openUserEventsModal = async (user) => {
    setSelectedUserModal(user);
    setLoadingUserEvents(true);
    try {
      const res = await fetch(`/api/admin/audit-events?user_email=${encodeURIComponent(user.email)}&limit=100`);
      if (res.ok) {
        const d = await res.json();
        setUserSpecificEvents(d.events || []);
      }
    } catch (err) {
      console.error('Error fetching user events:', err);
    } finally {
      setLoadingUserEvents(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, customStart, customEnd, sortBy, sortOrder, statusFilter, ledgerPage]);

  // Debounced email search for ledger (not on first open: the load above
  // already covers that, and a second identical request only slowed it)
  useEffect(() => {
    if (!searchMounted.current) { searchMounted.current = true; return; }
    const timer = setTimeout(() => {
      setLedgerPage(1);
      loadAnalytics();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchEmail]);

  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab, eventCategory, eventOutcome, eventsPage]);

  // Debounced email search for events
  useEffect(() => {
    if (!eventSearchMounted.current) { eventSearchMounted.current = true; return; }
    if (activeTab === 'events') {
      const timer = setTimeout(() => {
        setEventsPage(1);
        loadEvents();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [eventSearch]);

  const handleSort = (colKey) => {
    if (sortBy === colKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(colKey);
      setSortOrder('desc');
    }
    setLedgerPage(1);
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatWhen = (dt) => {
    if (!dt) return 'Never';
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return String(dt);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dt);
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!analytics?.users || analytics.users.length === 0) {
      alert('No ledger records to export.');
      return;
    }

    const headers = [
      'Email',
      'Role',
      'Status',
      'Purchased Credits Remaining',
      'Trial Sessions Remaining',
      'Total Sessions',
      'Paid Amount (INR)',
      'AI Provider Cost (INR)',
      'Net Profit Loss (INR)',
      'Total Tokens',
      'Last Session',
      'Created At',
    ];

    const rows = analytics.users.map((u) => [
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      u.credits_remaining,
      u.trials_remaining,
      u.total_sessions,
      u.paid_amount,
      u.ai_provider_cost,
      u.net_profit_loss,
      u.total_tokens,
      `"${u.last_session || 'Never'}"`,
      `"${u.created_at || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `feonixai_audit_ledger_${dateRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = analytics?.summary || {
    total_revenue: 0,
    original_cost: 0,
    profit: 0,
    loss: 0,
    net_earnings: 0,
    margin_pct: 0,
    total_transactions: 0,
    total_sessions: 0,
    total_tokens: 0,
    cost_available: false,
  };

  const users = analytics?.users || [];
  const pagination = analytics?.pagination || { total: 0, page: 1, limit: 25, pages: 1 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ================================================================
          1. AUDIT CONTROLS & DATE-RANGE SELECTOR
          ================================================================ */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ad-text)' }}>
            Audit Timeframe:
          </span>
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setLedgerPage(1);
            }}
            className="admin-input-styled"
            style={{ width: '150px', height: '36px', fontSize: '12.5px' }}
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {dateRange === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="admin-input-styled"
                style={{ height: '36px', width: '135px', fontSize: '12px' }}
                title="Start Date"
              />
              <span style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="admin-input-styled"
                style={{ height: '36px', width: '135px', fontSize: '12px' }}
                title="End Date"
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              if (activeTab === 'ledger') loadAnalytics();
              else loadEvents();
            }}
            className="admin-sm-btn"
            style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh Live Data from Backend"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Live Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="admin-sm-btn"
            style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Download CSV Ledger"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ================================================================
          2. TOP SUMMARY CARDS (5 FINANCIAL KPIS)
          ================================================================ */}
      <section className="admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {/* CARD 1: Total Revenue */}
        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="admin-kpi-top">
            <div
              className="admin-kpi-icon-wrap"
              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span
              className="admin-badge"
              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '11px' }}
            >
              Verified
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: '#10b981', fontSize: '24px' }}>
            {formatCurrency(summary.total_revenue)}
          </div>
          <div className="admin-kpi-label">Total Revenue</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)', marginTop: '4px' }}>
            {summary.total_transactions} payment transaction{summary.total_transactions === 1 ? '' : 's'}
          </div>
        </div>

        {/* CARD 2: Original Cost (Estimated AI Provider Costs) */}
        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="admin-kpi-top">
            <div
              className="admin-kpi-icon-wrap"
              style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <span
              className="admin-badge"
              style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '11px' }}
              title="Calculated from real OpenAI token usage across GPT-4o, GPT-4o-mini & Whisper"
            >
              Estimate
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: '#f59e0b', fontSize: '24px' }}>
            {summary.cost_available ? formatCurrency(summary.original_cost) : 'Not available'}
          </div>
          <div className="admin-kpi-label">Original Cost (AI Provider)</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)', marginTop: '4px' }}>
            {summary.total_tokens > 0
              ? `${(summary.total_tokens / 1000).toFixed(1)}k tokens used`
              : 'No token usage recorded'}
          </div>
        </div>

        {/* CARD 3: Profit */}
        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #059669' }}>
          <div className="admin-kpi-top">
            <div
              className="admin-kpi-icon-wrap"
              style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#059669' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span
              className="admin-badge"
              style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#059669', fontSize: '11px' }}
            >
              {summary.margin_pct}% Margin
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: '#059669', fontSize: '24px' }}>
            {formatCurrency(summary.profit)}
          </div>
          <div className="admin-kpi-label">Gross Profit</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)', marginTop: '4px' }}>
            Revenue minus AI provider costs
          </div>
        </div>

        {/* CARD 4: Loss */}
        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="admin-kpi-top">
            <div
              className="admin-kpi-icon-wrap"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
            <span
              className="admin-badge"
              style={{
                background: summary.loss > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: summary.loss > 0 ? '#ef4444' : '#94a3b8',
                fontSize: '11px',
              }}
            >
              {summary.loss > 0 ? 'Deficit' : 'No Deficit'}
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: summary.loss > 0 ? '#ef4444' : 'var(--ad-text)', fontSize: '24px' }}>
            {formatCurrency(summary.loss)}
          </div>
          <div className="admin-kpi-label">Recorded Loss</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)', marginTop: '4px' }}>
            {summary.loss > 0 ? 'Costs exceeding revenue' : 'Zero unrecovered expenses'}
          </div>
        </div>

        {/* CARD 5: Net Earnings */}
        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="admin-kpi-top">
            <div
              className="admin-kpi-icon-wrap"
              style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span
              className="admin-badge"
              style={{
                background: summary.net_earnings >= 0 ? 'rgba(139, 92, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: summary.net_earnings >= 0 ? '#8b5cf6' : '#ef4444',
                fontSize: '11px',
              }}
            >
              Net Balance
            </span>
          </div>
          <div
            className="admin-kpi-value"
            style={{
              color: summary.net_earnings >= 0 ? '#8b5cf6' : '#ef4444',
              fontSize: '24px',
            }}
          >
            {summary.net_earnings >= 0 ? '+' : ''}
            {formatCurrency(summary.net_earnings)}
          </div>
          <div className="admin-kpi-label">Net Earnings</div>
          <div style={{ fontSize: '11.5px', color: 'var(--ad-text-muted)', marginTop: '4px' }}>
            {summary.total_sessions} interview session{summary.total_sessions === 1 ? '' : 's'} logged
          </div>
        </div>
      </section>

      {/* ================================================================
          3. NAVIGATION TABS (User Financial Ledger vs System Event Logs)
          ================================================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--ad-border)',
          paddingBottom: '12px',
        }}
      >
        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--ad-radius-md)',
            border: activeTab === 'ledger' ? '1px solid var(--ad-purple)' : '1px solid transparent',
            background: activeTab === 'ledger' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
            color: activeTab === 'ledger' ? '#c4b5fd' : 'var(--ad-text-muted)',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          User-Level Financial & Cost Audit Table
        </button>

        <button
          onClick={() => setActiveTab('events')}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--ad-radius-md)',
            border: activeTab === 'events' ? '1px solid var(--ad-purple)' : '1px solid transparent',
            background: activeTab === 'events' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
            color: activeTab === 'events' ? '#c4b5fd' : 'var(--ad-text-muted)',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          System & Security Audit Event Stream
        </button>
      </div>

      {/* ================================================================
          TAB 1: USER-LEVEL AUDIT TABLE
          ================================================================ */}
      {activeTab === 'ledger' && (
        <div className="admin-management-card" style={{ padding: '22px' }}>
          {/* Table Filters Toolbar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              {/* Search by Email */}
              <div style={{ position: 'relative', width: '280px' }}>
                <input
                  type="text"
                  placeholder="Search user email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="admin-input-styled"
                  style={{ paddingLeft: '34px', height: '38px', fontSize: '13px' }}
                />
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ position: 'absolute', left: '11px', top: '12px', color: 'var(--ad-text-muted)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setLedgerPage(1);
                }}
                className="admin-input-styled"
                style={{ width: '170px', height: '38px', fontSize: '13px' }}
              >
                <option value="all">All User Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="paid">Paid Plans / Subscribers</option>
                <option value="free">Free / Trial Users</option>
              </select>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--ad-text-muted)' }}>
              Showing {users.length} of {pagination.total} customer accounts
            </div>
          </div>

          {/* Horizontally Scrollable Data Table */}
          <div className="admin-table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="admin-data-table" style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort('email')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Sort by Email"
                  >
                    Email {sortBy === 'email' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Status {sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('credits_remaining')}
                    style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                    title="1 credit = 1 hour Copilot access"
                  >
                    Purchased Credits {sortBy === 'credits_remaining' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('trials_remaining')}
                    style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                    title="10-minute free sessions"
                  >
                    Free Trials {sortBy === 'trials_remaining' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('total_sessions')}
                    style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                  >
                    Sessions {sortBy === 'total_sessions' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('paid_amount')}
                    style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                  >
                    Paid Amount {sortBy === 'paid_amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('ai_provider_cost')}
                    style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                    title="Underlying token costs (OpenAI rates)"
                  >
                    AI Provider Cost {sortBy === 'ai_provider_cost' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('net_profit_loss')}
                    style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                  >
                    Net Profit / Loss {sortBy === 'net_profit_loss' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('last_session')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Last Session {sortBy === 'last_session' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th style={{ textAlign: 'center' }}>Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingAnalytics && !analytics ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-muted)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ animation: 'spin 1s linear infinite' }}
                        >
                          <line x1="12" y1="2" x2="12" y2="6" />
                          <line x1="12" y1="18" x2="12" y2="22" />
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                          <line x1="2" y1="12" x2="6" y2="12" />
                          <line x1="18" y1="12" x2="22" y2="12" />
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                        </svg>
                        Loading financial audit ledger...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-muted)' }}>
                      No matching user accounts found for the current search or filter.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isProfit = u.net_profit_loss > 0;
                    const isLoss = u.net_profit_loss < 0;

                    return (
                      <tr key={u.id}>
                        {/* Email & Role Badge */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--ad-text)', fontSize: '13.5px' }}>
                              {u.email}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  textTransform: 'uppercase',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  background: u.role === 'owner' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                                  color: u.role === 'owner' ? '#c4b5fd' : '#94a3b8',
                                  fontWeight: 600,
                                }}
                              >
                                {u.role}
                              </span>
                              {u.plan && u.plan !== 'free' && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                    fontWeight: 600,
                                  }}
                                >
                                  {u.plan.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          {u.status === 'active' ? (
                            <span className="admin-badge active" style={{ fontSize: '11.5px' }}>● Active</span>
                          ) : (
                            <span className="admin-badge failed" style={{ fontSize: '11.5px' }}>✕ Suspended</span>
                          )}
                        </td>

                        {/* Purchased Credits */}
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: u.credits_remaining > 0 ? '#10b981' : 'var(--ad-text-muted)',
                              fontSize: '13px',
                            }}
                          >
                            {u.credits_remaining.toFixed(1)} hrs
                          </span>
                        </td>

                        {/* Free Trials */}
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: u.trials_remaining > 0 ? '#38bdf8' : 'var(--ad-text-muted)',
                              fontSize: '13px',
                            }}
                          >
                            {u.trials_remaining} trials
                          </span>
                        </td>

                        {/* Total Sessions */}
                        <td style={{ textAlign: 'right', color: 'var(--ad-text)', fontSize: '13px' }}>
                          {u.total_sessions}
                        </td>

                        {/* Paid Amount */}
                        <td style={{ textAlign: 'right', fontWeight: 600, color: u.paid_amount > 0 ? '#10b981' : 'var(--ad-text-muted)', fontSize: '13px' }}>
                          {formatCurrency(u.paid_amount)}
                        </td>

                        {/* AI Provider Cost */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: 600, color: u.ai_provider_cost > 0 ? '#f59e0b' : 'var(--ad-text-muted)', fontSize: '13px' }}>
                              {u.ai_provider_cost > 0 ? formatCurrency(u.ai_provider_cost) : '₹0.00'}
                            </span>
                            {u.total_tokens > 0 && (
                              <span style={{ fontSize: '10.5px', color: 'var(--ad-text-muted)' }}>
                                {(u.total_tokens / 1000).toFixed(1)}k tok
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Net Profit / Loss */}
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: isProfit
                                ? 'rgba(16, 185, 129, 0.15)'
                                : isLoss
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(148, 163, 184, 0.1)',
                              color: isProfit ? '#10b981' : isLoss ? '#ef4444' : 'var(--ad-text-muted)',
                            }}
                          >
                            {isProfit ? '+' : ''}
                            {formatCurrency(u.net_profit_loss)}
                          </span>
                        </td>

                        {/* Last Session */}
                        <td style={{ color: 'var(--ad-text-muted)', fontSize: '12px' }}>
                          {formatWhen(u.last_session)}
                        </td>

                        {/* Audit Action Button */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => openUserEventsModal(u)}
                            className="admin-sm-btn"
                            style={{
                              fontSize: '11.5px',
                              padding: '4px 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Inspect full audit trail for this user"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Trail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Ledger Pagination */}
          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} users total)
              </span>
              <div className="admin-page-nav">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                  className="admin-sm-btn"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setLedgerPage((p) => Math.min(pagination.pages, p + 1))}
                  className="admin-sm-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          TAB 2: GRANULAR AUDIT EVENT STREAM
          ================================================================ */}
      {activeTab === 'events' && (
        <div className="admin-management-card" style={{ padding: '22px' }}>
          {/* Events Filter Toolbar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              {/* Category Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {EVENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setEventCategory(cat.value);
                      setEventsPage(1);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--ad-radius-sm)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: eventCategory === cat.value ? '1px solid var(--ad-purple)' : '1px solid var(--ad-border)',
                      background: eventCategory === cat.value ? 'rgba(124, 58, 237, 0.2)' : 'var(--ad-card)',
                      color: eventCategory === cat.value ? '#c4b5fd' : 'var(--ad-text)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* User Email Filter */}
              <input
                type="text"
                placeholder="Filter by user email..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="admin-input-styled"
                style={{ width: '220px', height: '34px', fontSize: '12.5px' }}
              />

              {/* Outcome Filter */}
              <select
                value={eventOutcome}
                onChange={(e) => {
                  setEventOutcome(e.target.value);
                  setEventsPage(1);
                }}
                className="admin-input-styled"
                style={{ width: '130px', height: '34px', fontSize: '12.5px' }}
              >
                <option value="ALL">All Outcomes</option>
                <option value="success">Success Only</option>
                <option value="warning">Warnings</option>
                <option value="danger">Failures</option>
                <option value="info">Informational</option>
              </select>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--ad-text-muted)' }}>
              Showing {eventsData?.events?.length || 0} events
            </div>
          </div>

          {/* Events Table */}
          <div className="admin-table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="admin-data-table" style={{ width: '100%', minWidth: '940px' }}>
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Timestamp</th>
                  <th style={{ width: '150px' }}>Event Category</th>
                  <th style={{ width: '180px' }}>Affected User</th>
                  <th style={{ width: '140px' }}>Actor</th>
                  <th>Description</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Outcome</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents && !eventsData ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-muted)' }}>
                      Loading audit event stream...
                    </td>
                  </tr>
                ) : !eventsData?.events || eventsData.events.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-muted)' }}>
                      No audit events found for this filter criteria.
                    </td>
                  </tr>
                ) : (
                  eventsData.events.map((evt) => {
                    const isExpanded = expandedEventId === evt.id;

                    const getCategoryColor = (cat) => {
                      switch (cat) {
                        case 'ADMIN':
                          return { bg: 'rgba(124, 58, 237, 0.15)', text: '#c4b5fd' };
                        case 'SESSION':
                          return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' };
                        case 'PAYMENT':
                        case 'PROMOTION':
                          return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
                        case 'CREDIT':
                        case 'TRIAL':
                          return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
                        default:
                          return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' };
                      }
                    };

                    const catStyle = getCategoryColor(evt.category);

                    return (
                      <React.Fragment key={evt.id}>
                        <tr>
                          {/* Timestamp */}
                          <td style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>
                            {formatWhen(evt.timestamp)}
                          </td>

                          {/* Category Badge */}
                          <td>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 7px',
                                borderRadius: '4px',
                                background: catStyle.bg,
                                color: catStyle.text,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {evt.event_type}
                            </span>
                          </td>

                          {/* Affected User */}
                          <td style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ad-text)' }}>
                            {evt.user_email || '—'}
                          </td>

                          {/* Actor */}
                          <td style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>
                            {evt.actor || 'System'}
                          </td>

                          {/* Description */}
                          <td style={{ fontSize: '13px', color: 'var(--ad-text)' }}>
                            {evt.description}
                          </td>

                          {/* Outcome */}
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`admin-badge ${evt.outcome === 'success' ? 'completed' : evt.outcome === 'danger' ? 'failed' : 'inprogress'}`}
                              style={{ fontSize: '11px', textTransform: 'capitalize' }}
                            >
                              {evt.outcome}
                            </span>
                          </td>

                          {/* Expand Details Button */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                              className="admin-sm-btn"
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              {isExpanded ? 'Hide' : 'JSON'}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable JSON details row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="7" style={{ background: 'rgba(15, 23, 42, 0.35)', padding: '12px 18px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ad-text-muted)' }}>
                                  Tamper-Evident Audit Record #{evt.id} Details:
                                </span>
                                <pre
                                  style={{
                                    margin: 0,
                                    fontSize: '11.5px',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                    color: '#c4b5fd',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    overflowX: 'auto',
                                  }}
                                >
                                  {JSON.stringify(evt.details || {}, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Events Pagination */}
          {eventsData?.pagination?.pages > 1 && (
            <div className="admin-pagination">
              <span>
                Page {eventsData.pagination.page} of {eventsData.pagination.pages} ({eventsData.pagination.total} events)
              </span>
              <div className="admin-page-nav">
                <button
                  disabled={eventsData.pagination.page <= 1}
                  onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                  className="admin-sm-btn"
                >
                  Previous
                </button>
                <button
                  disabled={eventsData.pagination.page >= eventsData.pagination.pages}
                  onClick={() => setEventsPage((p) => Math.min(eventsData.pagination.pages, p + 1))}
                  className="admin-sm-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          USER SPECIFIC AUDIT TRAIL MODAL
          ================================================================ */}
      {selectedUserModal && (
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUserModal(null);
          }}
        >
          <div
            className="admin-modal-card"
            style={{ width: '850px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div className="admin-modal-head">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ad-text)' }}>
                  User Audit Ledger: {selectedUserModal.email}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--ad-text-muted)' }}>
                  User ID #{selectedUserModal.id} • Registered {formatWhen(selectedUserModal.created_at)}
                </span>
              </div>
              <button onClick={() => setSelectedUserModal(null)} className="admin-close-x">
                ✕
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '8px',
                border: '1px solid var(--ad-border)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--ad-text-muted)' }}>Purchased Credits:</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                  {selectedUserModal.credits_remaining} hrs
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--ad-text-muted)' }}>Free Trials Left:</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>
                  {selectedUserModal.trials_remaining} / 5
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--ad-text-muted)' }}>Total Paid:</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                  {formatCurrency(selectedUserModal.paid_amount)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--ad-text-muted)' }}>AI Provider Cost:</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>
                  {formatCurrency(selectedUserModal.ai_provider_cost)}
                </div>
              </div>
            </div>

            {/* Activity Stream for this user */}
            <div style={{ marginTop: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--ad-text)' }}>
                Granular Historical Event Trail ({userSpecificEvents.length} recorded events)
              </h4>

              {loadingUserEvents ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                  Loading user event history...
                </div>
              ) : userSpecificEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-muted)' }}>
                  No historical event trails recorded yet for this user.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userSpecificEvents.map((evt) => (
                    <div
                      key={evt.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--ad-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(124, 58, 237, 0.2)',
                              color: '#c4b5fd',
                            }}
                          >
                            {evt.event_type}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--ad-text)', fontWeight: 500 }}>
                            {evt.description}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--ad-text-muted)' }}>
                          Actor: {evt.actor} • {formatWhen(evt.timestamp)}
                        </span>
                      </div>
                      <span
                        className={`admin-badge ${evt.outcome === 'success' ? 'completed' : 'inprogress'}`}
                        style={{ fontSize: '11px' }}
                      >
                        {evt.outcome}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-modal-actions">
              <button onClick={() => setSelectedUserModal(null)} className="admin-sm-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

