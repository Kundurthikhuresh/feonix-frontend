"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobAnalyzerPage() {
  const [mode, setMode] = useState('paste'); // 'paste' or 'document'
  const [jdText, setJdText] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/documents?kind=job_description')
      .then(r => r.json())
      .then(d => setDocuments(d.documents || []))
      .catch(() => {});
  }, []);

  async function handleAnalyze() {
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const body = mode === 'document' && selectedDocId
        ? { document_id: selectedDocId }
        : { text: jdText };

      const res = await fetch('/api/job/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
        <h1 style={s.title}>🔍 Job Description Analyzer</h1>
        <p style={s.subtitle}>Paste a job description to extract key requirements, skills, and ATS keywords</p>

        {/* Input Section */}
        <div style={s.inputSection}>
          <div style={s.modeTabs}>
            <button style={{ ...s.modeTab, ...(mode === 'paste' ? s.modeTabActive : {}) }} onClick={() => setMode('paste')}>Paste Text</button>
            <button style={{ ...s.modeTab, ...(mode === 'document' ? s.modeTabActive : {}) }} onClick={() => setMode('document')}>Saved Documents</button>
          </div>

          {mode === 'paste' ? (
            <textarea
              style={s.textarea}
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              rows={10}
            />
          ) : (
            <div style={s.docList}>
              {documents.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 14 }}>No saved job descriptions. Upload one via the Documents section.</p>
              ) : documents.map(doc => (
                <div
                  key={doc.id}
                  style={{ ...s.docItem, ...(selectedDocId === doc.id ? s.docItemActive : {}) }}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <div style={s.docName}>{doc.filename}</div>
                  <div style={s.docMeta}>{doc.chars ? `${(doc.chars/1000).toFixed(1)}k chars` : ''} · {doc.created_at?.slice(0,10)}</div>
                </div>
              ))}
            </div>
          )}

          {error && <div style={s.errorMsg}>{error}</div>}

          <button
            style={s.analyzeBtn}
            onClick={handleAnalyze}
            disabled={loading || (mode === 'paste' ? jdText.length < 50 : !selectedDocId)}
          >
            {loading ? '⏳ Analyzing...' : '🔍 Analyze Job Description'}
          </button>
        </div>

        {/* Results */}
        {analysis && <AnalysisResults analysis={analysis} />}
      </div>
    </div>
  );
}

function AnalysisResults({ analysis }) {
  return (
    <div style={s.results}>
      {/* Header Card */}
      <div style={s.resultHeader}>
        <div>
          <h2 style={s.resultTitle}>{analysis.job_title || 'Unknown Role'}</h2>
          <div style={s.resultMeta}>
            {analysis.company && <span style={s.metaChip}>🏢 {analysis.company}</span>}
            {analysis.location && <span style={s.metaChip}>📍 {analysis.location}</span>}
            {analysis.employment_type && <span style={s.metaChip}>📋 {analysis.employment_type}</span>}
            {analysis.experience_required && <span style={s.metaChip}>📅 {analysis.experience_required}</span>}
            {analysis.salary_range && <span style={s.metaChip}>💰 {analysis.salary_range}</span>}
          </div>
        </div>
      </div>

      {analysis.summary && <p style={s.summaryText}>{analysis.summary}</p>}

      {/* Skills Grid */}
      <div style={s.twoCol}>
        <div style={s.resultCard}>
          <h3 style={s.cardTitle}>Required Skills</h3>
          <div style={s.tagCloud}>
            {(analysis.required_skills || []).map((sk, i) => (
              <span key={i} style={s.tag('red')}>{sk}</span>
            ))}
          </div>
        </div>
        <div style={s.resultCard}>
          <h3 style={s.cardTitle}>Preferred Skills</h3>
          <div style={s.tagCloud}>
            {(analysis.preferred_skills || []).map((sk, i) => (
              <span key={i} style={s.tag('blue')}>{sk}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div style={s.resultCard}>
        <h3 style={s.cardTitle}>Technologies</h3>
        <div style={s.tagCloud}>
          {(analysis.technologies || []).map((t, i) => (
            <span key={i} style={s.tag('purple')}>{t}</span>
          ))}
        </div>
      </div>

      {/* ATS Keywords */}
      <div style={s.resultCard}>
        <h3 style={s.cardTitle}>🎯 ATS Keywords</h3>
        <p style={s.cardSub}>Include these keywords in your resume to improve ATS match rate</p>
        <div style={s.tagCloud}>
          {(analysis.keywords || []).map((k, i) => (
            <span key={i} style={s.tag('cyan')}>{k}</span>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      {(analysis.responsibilities || []).length > 0 && (
        <div style={s.resultCard}>
          <h3 style={s.cardTitle}>Key Responsibilities</h3>
          <ul style={s.respList}>
            {analysis.responsibilities.map((r, i) => (
              <li key={i} style={s.respItem}>→ {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Education */}
      {analysis.education_required && (
        <div style={s.resultCard}>
          <h3 style={s.cardTitle}>Education Required</h3>
          <p style={{ color: '#cbd5e1', fontSize: 14 }}>{analysis.education_required}</p>
        </div>
      )}

      {/* CTA */}
      <div style={s.ctaRow}>
        <Link href="/job-match" style={s.ctaBtn}>🎯 Match with Resume →</Link>
        <Link href="/cover-letter" style={s.ctaBtnAlt}>✉️ Generate Cover Letter →</Link>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc', padding: '0 0 60px' },
  container: { maxWidth: 820, margin: '0 auto', padding: '32px 24px' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 28, fontWeight: 800, margin: '12px 0 4px' },
  subtitle: { color: '#64748b', fontSize: 14.5, margin: '0 0 24px' },
  inputSection: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' },
  modeTabs: { display: 'flex', gap: 8, marginBottom: 16 },
  modeTab: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 16px', color: '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  modeTabActive: { background: 'rgba(0,245,255,0.1)', borderColor: 'rgba(0,245,255,0.3)', color: '#00f5ff' },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px', color: '#f1f5f9', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  docList: { display: 'flex', flexDirection: 'column', gap: 8 },
  docItem: { padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' },
  docItemActive: { borderColor: 'rgba(0,245,255,0.4)', background: 'rgba(0,245,255,0.06)' },
  docName: { fontSize: 14, fontWeight: 700, color: '#f1f5f9' },
  docMeta: { fontSize: 12, color: '#64748b', marginTop: 3 },
  errorMsg: { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, marginTop: 12 },
  analyzeBtn: { marginTop: 16, background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', width: '100%' },
  results: { marginTop: 28 },
  resultHeader: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' },
  resultTitle: { fontSize: 22, fontWeight: 800, margin: 0, color: '#f8fafc' },
  resultMeta: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metaChip: { fontSize: 12.5, fontWeight: 600, padding: '4px 12px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' },
  summaryText: { color: '#94a3b8', fontSize: 14.5, lineHeight: 1.7, marginTop: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 },
  resultCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', marginTop: 16 },
  cardTitle: { fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  cardSub: { fontSize: 12.5, color: '#64748b', margin: '-6px 0 12px' },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  tag: (color) => ({
    fontSize: 12.5, fontWeight: 600, padding: '4px 11px', borderRadius: 9999,
    background: color === 'cyan' ? 'rgba(0,245,255,0.1)' : color === 'purple' ? 'rgba(168,85,247,0.1)' : color === 'red' ? 'rgba(239,68,68,0.08)' : color === 'blue' ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.12)',
    color: color === 'cyan' ? '#67e8f9' : color === 'purple' ? '#c084fc' : color === 'red' ? '#f87171' : color === 'blue' ? '#93c5fd' : '#94a3b8',
    border: `1px solid ${color === 'cyan' ? 'rgba(0,245,255,0.2)' : color === 'purple' ? 'rgba(168,85,247,0.2)' : color === 'red' ? 'rgba(239,68,68,0.15)' : color === 'blue' ? 'rgba(59,130,246,0.2)' : 'rgba(100,116,139,0.2)'}`,
  }),
  respList: { listStyle: 'none', padding: 0, margin: 0 },
  respItem: { color: '#94a3b8', fontSize: 14, marginBottom: 8, lineHeight: 1.6 },
  ctaRow: { display: 'flex', gap: 12, marginTop: 24 },
  ctaBtn: { flex: 1, textAlign: 'center', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', fontWeight: 800, fontSize: 15, textDecoration: 'none' },
  ctaBtnAlt: { flex: 1, textAlign: 'center', padding: '14px', borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', fontWeight: 800, fontSize: 15, textDecoration: 'none' },
};
