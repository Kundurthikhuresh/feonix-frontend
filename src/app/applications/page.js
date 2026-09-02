"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUSES = [
  { id: 'saved', label: 'Saved', color: '#94a3b8' },
  { id: 'applied', label: 'Applied', color: '#3b82f6' },
  { id: 'screening', label: 'Screening', color: '#06b6d4' },
  { id: 'interview', label: 'Interview', color: '#a855f7' },
  { id: 'technical', label: 'Technical', color: '#ec4899' },
  { id: 'hr_round', label: 'HR Round', color: '#8b5cf6' },
  { id: 'offer', label: 'Offer 🎉', color: '#10b981' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444' },
];

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    job_title: '',
    job_url: '',
    location: '',
    salary_range: '',
    status: 'saved',
    notes: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [search, statusFilter]);

  async function loadApplications() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (statusFilter !== 'all') q.set('status', statusFilter);

      const [resApps, resSum] = await Promise.all([
        fetch(`/api/applications?${q.toString()}`).then(r => r.json()),
        fetch('/api/applications/stats/summary').then(r => r.json()),
      ]);

      setApps(resApps.applications || []);
      setSummary(resSum.summary || {});
    } catch {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveApp(e) {
    e.preventDefault();
    try {
      const url = editingApp ? `/api/applications/${editingApp.id}` : '/api/applications';
      const method = editingApp ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingApp(null);
        setFormData({ company: '', job_title: '', job_url: '', location: '', salary_range: '', status: 'saved', notes: '' });
        loadApplications();
      }
    } catch {
      // Ignore save error
    }
  }

  async function handleDeleteApp(id) {
    if (!confirm('Delete this application record?')) return;
    await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    loadApplications();
  }

  function openEditModal(app) {
    setEditingApp(app);
    setFormData({
      company: app.company || '',
      job_title: app.job_title || '',
      job_url: app.job_url || '',
      location: app.location || '',
      salary_range: app.salary_range || '',
      status: app.status || 'saved',
      notes: app.notes || '',
    });
    setShowModal(true);
  }

  function openNewModal() {
    setEditingApp(null);
    setFormData({ company: '', job_title: '', job_url: '', location: '', salary_range: '', status: 'saved', notes: '' });
    setShowModal(true);
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
            <h1 style={s.title}>📋 Job Application Tracker</h1>
            <p style={s.subtitle}>Track and manage your job search pipeline in real-time</p>
          </div>
          <button style={s.addBtn} onClick={openNewModal}>+ Add Application</button>
        </div>

        {/* Filters & Controls */}
        <div style={s.controls}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Search company, title, or notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div style={s.viewToggle}>
            <button style={{ ...s.toggleBtn, ...(viewMode === 'kanban' ? s.toggleActive : {}) }} onClick={() => setViewMode('kanban')}>Kanban</button>
            <button style={{ ...s.toggleBtn, ...(viewMode === 'table' ? s.toggleActive : {}) }} onClick={() => setViewMode('table')}>Table</button>
          </div>
        </div>

        {/* Summary Counter Bar */}
        <div style={s.summaryBar}>
          {STATUSES.map(st => (
            <div key={st.id} style={s.summaryItem}>
              <span style={{ fontSize: 11, color: st.color, fontWeight: 700 }}>{st.label}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{summary[st.id] || 0}</span>
            </div>
          ))}
        </div>

        {/* Content View */}
        {loading ? (
          <div style={s.center}>Loading applications...</div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board */
          <div style={s.kanbanBoard}>
            {STATUSES.map(st => {
              const columnApps = apps.filter(a => a.status === st.id);
              return (
                <div key={st.id} style={s.kanbanCol}>
                  <div style={{ ...s.colHeader, borderTopColor: st.color }}>
                    <span>{st.label}</span>
                    <span style={s.colCount}>{columnApps.length}</span>
                  </div>
                  <div style={s.colCards}>
                    {columnApps.map(app => (
                      <div key={app.id} style={s.card} onClick={() => openEditModal(app)}>
                        <div style={s.cardCompany}>{app.company}</div>
                        <div style={s.cardTitle}>{app.job_title}</div>
                        {app.location && <div style={s.cardMeta}>📍 {app.location}</div>}
                        {app.salary_range && <div style={s.cardMeta}>💰 {app.salary_range}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Company</th>
                  <th style={s.th}>Job Title</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Salary</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => {
                  const st = STATUSES.find(s => s.id === app.status);
                  return (
                    <tr key={app.id} style={s.tr}>
                      <td style={s.tdStrong}>{app.company}</td>
                      <td style={s.td}>{app.job_title}</td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, color: st?.color, borderColor: st?.color }}>{st?.label}</span>
                      </td>
                      <td style={s.td}>{app.location || '—'}</td>
                      <td style={s.td}>{app.salary_range || '—'}</td>
                      <td style={s.td}>
                        <button style={s.iconBtn} onClick={() => openEditModal(app)}>✏️</button>
                        <button style={s.iconBtn} onClick={() => handleDeleteApp(app.id)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h2 style={s.modalTitle}>{editingApp ? 'Edit Application' : 'New Application'}</h2>
              <form onSubmit={handleSaveApp}>
                <div style={s.modalGrid}>
                  <div style={s.field}>
                    <label style={s.label}>Company *</label>
                    <input style={s.input} required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Job Title *</label>
                    <input style={s.input} required value={formData.job_title} onChange={e => setFormData({ ...formData, job_title: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Status</label>
                    <select style={s.select} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      {STATUSES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Location</label>
                    <input style={s.input} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Salary Range</label>
                    <input style={s.input} value={formData.salary_range} onChange={e => setFormData({ ...formData, salary_range: e.target.value })} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Job URL</label>
                    <input style={s.input} value={formData.job_url} onChange={e => setFormData({ ...formData, job_url: e.target.value })} />
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Notes</label>
                  <textarea style={s.textarea} rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <div style={s.modalActions}>
                  <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" style={s.saveBtn}>Save Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc', padding: '0 0 60px' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 28, fontWeight: 800, margin: '8px 0 4px' },
  subtitle: { color: '#64748b', fontSize: 14.5, margin: 0 },
  addBtn: { background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer' },
  controls: { display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 20 },
  searchInput: { flex: 1, maxWith: 400, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' },
  viewToggle: { display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 8 },
  toggleBtn: { background: 'none', border: 'none', color: '#94a3b8', padding: '6px 14px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: 'pointer' },
  toggleActive: { background: 'rgba(0,245,255,0.12)', color: '#00f5ff' },
  summaryBar: { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, marginBottom: 24 },
  summaryItem: { flex: 1, minWidth: 100, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  center: { textAlign: 'center', padding: '60px 0', color: '#64748b' },
  kanbanBoard: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12, overflowX: 'auto' },
  kanbanCol: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, minWidth: 140 },
  colHeader: { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderTop: '3px solid #94a3b8', fontSize: 12, fontWeight: 700, color: '#f1f5f9' },
  colCount: { background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 10, fontSize: 11 },
  colCards: { padding: 8, display: 'flex', flexDirection: 'column', gap: 8 },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px', cursor: 'pointer' },
  cardCompany: { fontSize: 13, fontWeight: 800, color: '#00f5ff' },
  cardTitle: { fontSize: 12, color: '#cbd5e1', marginTop: 2 },
  cardMeta: { fontSize: 11, color: '#64748b', marginTop: 4 },
  tableWrap: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAling: 'left' },
  th: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '12px 16px', fontSize: 13.5, color: '#cbd5e1' },
  tdStrong: { padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' },
  statusBadge: { padding: '3px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, border: '1px solid' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginRight: 6 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px', width: '100%', maxWidth: 540 },
  modalTitle: { fontSize: 18, fontWeight: 800, margin: '0 0 18px', color: '#f8fafc' },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' },
  saveBtn: { background: '#00f5ff', color: '#0a0b0f', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' },
};
