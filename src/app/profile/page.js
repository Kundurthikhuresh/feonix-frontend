"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FIELD_CONFIGS = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
  { key: 'title', label: 'Professional Title', type: 'text', placeholder: 'Senior Software Engineer' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 000 0000' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'San Francisco, CA' },
  { key: 'bio', label: 'Bio / Summary', type: 'textarea', placeholder: 'Brief professional summary...' },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/you' },
  { key: 'github', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/you' },
  { key: 'portfolio', label: 'Portfolio URL', type: 'url', placeholder: 'https://yoursite.com' },
  { key: 'years_experience', label: 'Years of Experience', type: 'number', placeholder: '5' },
];

const PLAN_COLORS = {
  free: { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.35)', text: '#94a3b8', label: 'Free' },
  pro: { bg: 'rgba(0,245,255,0.12)', border: 'rgba(0,245,255,0.4)', text: '#00f5ff', label: 'Pro' },
  premium: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.45)', text: '#a855f7', label: 'Premium' },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [preferredRoles, setPreferredRoles] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { router.replace('/'); return; }
    const { user: u } = await res.json();
    setUser(u);
    await loadProfile();
  }

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const { profile: p } = await res.json();
        setProfile(p);
        setForm(p);
        setPreferredRoles((p.preferred_roles || []).join(', '));
        setSkills((p.skills || []).join(', '));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const body = { ...form };
      body.preferred_roles = preferredRoles.split(',').map(s => s.trim()).filter(Boolean);
      body.skills = skills.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setMsg({ text: '✓ Profile saved successfully', type: 'ok' });
      } else {
        setMsg({ text: data.message || 'Failed to save profile', type: 'err' });
      }
    } catch {
      setMsg({ text: 'Network error', type: 'err' });
    } finally {
      setSaving(false);
    }
  }

  const plan = profile.plan || 'free';
  const planStyle = PLAN_COLORS[plan] || PLAN_COLORS.free;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCenter}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', marginTop: 12 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Link href="/?view=dash" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </Link>
          <div>
            <h1 style={styles.pageTitle}>My Profile</h1>
            <p style={styles.pageSubtitle}>Manage your professional information</p>
          </div>
          <div style={{ ...styles.planBadge, background: planStyle.bg, border: `1px solid ${planStyle.border}`, color: planStyle.text }}>
            <span style={{ ...styles.planDot, background: planStyle.text }} />
            {planStyle.label} Plan
          </div>
        </div>

        {/* Avatar + email row */}
        <div style={styles.avatarRow}>
          <div style={styles.avatar}>
            {(form.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={styles.avatarName}>{form.name || 'Your Name'}</div>
            <div style={styles.avatarEmail}>{user?.email}</div>
            <div style={styles.avatarTitle}>{form.title || 'Add your professional title →'}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.grid}>
            {FIELD_CONFIGS.map((field) => (
              <div
                key={field.key}
                style={{ ...styles.fieldGroup, ...(field.type === 'textarea' ? styles.fullWidth : {}) }}
              >
                <label style={styles.label}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    style={styles.textarea}
                    placeholder={field.placeholder}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <input
                    style={styles.input}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Skills (comma-separated)</label>
              <input
                style={styles.input}
                type="text"
                placeholder="React, Node.js, Python, AWS..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Preferred Job Roles (comma-separated)</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Software Engineer, Full Stack Developer..."
                value={preferredRoles}
                onChange={(e) => setPreferredRoles(e.target.value)}
              />
            </div>
          </div>

          {msg.text && (
            <div style={{ ...styles.msg, ...(msg.type === 'ok' ? styles.msgOk : styles.msgErr) }}>
              {msg.text}
            </div>
          )}

          <div style={styles.formFooter}>
            <button type="submit" style={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <Link href="/pricing" style={styles.upgradeLink}>
              {plan === 'free' ? '⚡ Upgrade to Pro →' : '⚙ Manage Subscription →'}
            </Link>
          </div>
        </form>

        {/* Quick Nav to Career Tools */}
        <div style={styles.toolsSection}>
          <h2 style={styles.toolsTitle}>Career Tools</h2>
          <div style={styles.toolsGrid}>
            {[
              { href: '/resumes', icon: '📄', label: 'Resume Library', desc: 'Analyze & manage resumes' },
              { href: '/job-analyzer', icon: '🔍', label: 'Job Analyzer', desc: 'Parse job descriptions' },
              { href: '/job-match', icon: '🎯', label: 'Job Match', desc: 'Resume ↔ JD match score' },
              { href: '/cover-letter', icon: '✉️', label: 'Cover Letter', desc: 'AI-generated letters' },
              { href: '/interview-prep', icon: '🎤', label: 'Interview Prep', desc: 'Practice & get scored' },
              { href: '/applications', icon: '📋', label: 'Applications', desc: 'Track job applications' },
            ].map((tool) => (
              <Link key={tool.href} href={tool.href} style={styles.toolCard}>
                <span style={styles.toolIcon}>{tool.icon}</span>
                <div>
                  <div style={styles.toolLabel}>{tool.label}</div>
                  <div style={styles.toolDesc}>{tool.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0b0f', padding: '0 0 60px' },
  container: { maxWidth: 860, margin: '0 auto', padding: '0 24px' },
  loadingCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(0,245,255,0.15)', borderTop: '3px solid #00f5ff', animation: 'spin 0.8s linear infinite' },
  header: { display: 'flex', alignItems: 'center', gap: 16, padding: '32px 0 24px', flexWrap: 'wrap' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13.5, fontWeight: 600, transition: 'color 0.15s' },
  pageTitle: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: 0, flex: 1 },
  pageSubtitle: { color: '#64748b', fontSize: 14, margin: '4px 0 0' },
  planBadge: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' },
  planDot: { width: 6, height: 6, borderRadius: '50%' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, marginBottom: 28 },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,245,255,0.3), rgba(168,85,247,0.3))', border: '2px solid rgba(0,245,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#00f5ff', flexShrink: 0 },
  avatarName: { fontSize: 18, fontWeight: 700, color: '#f8fafc' },
  avatarEmail: { fontSize: 13.5, color: '#64748b', margin: '3px 0' },
  avatarTitle: { fontSize: 13, color: '#94a3b8' },
  form: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px 28px 24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' },
  fullWidth: { gridColumn: '1 / -1' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 12.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14.5, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14.5, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  msg: { padding: '12px 16px', borderRadius: 10, fontSize: 14, marginTop: 16, fontWeight: 600 },
  msgOk: { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' },
  msgErr: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' },
  formFooter: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, flexWrap: 'wrap' },
  saveBtn: { background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 10, padding: '11px 28px', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', transition: 'opacity 0.15s' },
  upgradeLink: { color: '#a855f7', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' },
  toolsSection: { marginTop: 32 },
  toolsTitle: { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 },
  toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  toolCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.15s ease', cursor: 'pointer' },
  toolIcon: { fontSize: 22, flexShrink: 0 },
  toolLabel: { fontSize: 13.5, fontWeight: 700, color: '#f1f5f9' },
  toolDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
};
