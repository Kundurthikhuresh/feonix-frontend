"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

function ScoreRing({ score, size = 100, label }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`} transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={size < 70 ? 14 : 22} fontWeight="800" fill={color}>{score}%</text>
      </svg>
      {label && <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>}
    </div>
  );
}

export default function JobMatchPage() {
  const [resumes, setResumes] = useState([]);
  const [jdDocs, setJdDocs] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedJd, setSelectedJd] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdMode, setJdMode] = useState('paste');
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/documents?kind=resume').then(r => r.json()),
      fetch('/api/documents?kind=job_description').then(r => r.json()),
    ]).then(([rd, jd]) => {
      setResumes(rd.documents || []);
      setJdDocs(jd.documents || []);
    }).catch(() => {});
  }, []);

  async function handleMatch() {
    if (!selectedResume) {
      setError('Select a resume first.');
      return;
    }
    if (jdMode === 'document' && !selectedJd) {
      setError('Select a saved job description, or switch to "Paste".');
      return;
    }
    if (jdMode === 'paste' && !jdText.trim()) {
      setError('Add a job description or role — a few words is enough, but there must be something to match against.');
      return;
    }

    setLoading(true);
    setError('');
    setMatch(null);
    try {
      const body = { resume_id: selectedResume };
      if (jdMode === 'document' && selectedJd) body.job_id = selectedJd;
      else body.jd_text = jdText;

      const res = await fetch('/api/job/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) setMatch(data.match);
      else setError(data.message || 'Matching failed');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  return (
    <div style={st.page}>
      <div style={st.container}>
        <Link href="/?view=dash" style={st.backLink}>← Dashboard</Link>
        <h1 style={st.title}>🎯 Resume ↔ Job Match</h1>
        <p style={st.subtitle}>See how well your resume matches a job description</p>

        <div style={st.inputGrid}>
          {/* Resume selector */}
          <div style={st.inputCard}>
            <h3 style={st.inputCardTitle}>📄 Select Resume</h3>
            <div style={st.docList}>
              {resumes.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 13 }}>No resumes uploaded. <Link href="/resumes" style={{ color: '#00f5ff' }}>Upload one →</Link></p>
              ) : resumes.map(doc => (
                <div key={doc.id} style={{ ...st.docItem, ...(selectedResume === doc.id ? st.docItemActive : {}) }}
                  onClick={() => setSelectedResume(doc.id)}>
                  <div style={st.docName}>{doc.filename}</div>
                  <div style={st.docMeta}>{doc.is_active ? '★ Primary · ' : ''}{doc.created_at?.slice(0,10)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* JD selector */}
          <div style={st.inputCard}>
            <h3 style={st.inputCardTitle}>📋 Job Description</h3>
            <div style={st.modeTabs}>
              <button style={{ ...st.modeTab, ...(jdMode === 'paste' ? st.modeTabActive : {}) }} onClick={() => setJdMode('paste')}>Paste</button>
              <button style={{ ...st.modeTab, ...(jdMode === 'document' ? st.modeTabActive : {}) }} onClick={() => setJdMode('document')}>Saved</button>
            </div>
            {jdMode === 'paste' ? (
              <textarea style={st.textarea} placeholder="Paste the job description, or just a role title, for a better match..." value={jdText} onChange={e => setJdText(e.target.value)} rows={8} />
            ) : (
              <div style={st.docList}>
                {jdDocs.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No saved JDs.</p>
                ) : jdDocs.map(doc => (
                  <div key={doc.id} style={{ ...st.docItem, ...(selectedJd === doc.id ? st.docItemActive : {}) }}
                    onClick={() => setSelectedJd(doc.id)}>
                    <div style={st.docName}>{doc.filename}</div>
                    <div style={st.docMeta}>{doc.created_at?.slice(0,10)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <div style={st.errorMsg}>{error}</div>}

        <button
          style={{ ...st.matchBtn, ...(loading ? st.matchBtnDisabled : {}) }}
          onClick={handleMatch}
          disabled={loading}
        >
          {loading ? '⏳ Matching...' : '🎯 Run Match Analysis'}
        </button>

        {/* Results */}
        {match && (
          <div style={st.results}>
            {/* Score rings */}
            <div style={st.scoreGrid}>
              <ScoreRing score={match.overall_match} size={110} label="Overall" />
              <ScoreRing score={match.skills_match} size={80} label="Skills" />
              <ScoreRing score={match.experience_match} size={80} label="Experience" />
              <ScoreRing score={match.keywords_match} size={80} label="Keywords" />
              <ScoreRing score={match.education_match} size={80} label="Education" />
            </div>

            <p style={st.summaryText}>{match.summary}</p>

            <div style={st.twoCol}>
              {/* Matched skills */}
              <div style={st.resultCard}>
                <h3 style={st.cardTitle}>✅ Matched Skills</h3>
                <div style={st.tagCloud}>
                  {(match.matched_skills || []).map((sk, i) => <span key={i} style={st.tag('green')}>{sk}</span>)}
                </div>
              </div>
              {/* Missing skills */}
              <div style={st.resultCard}>
                <h3 style={st.cardTitle}>❌ Missing Skills</h3>
                <div style={st.tagCloud}>
                  {(match.missing_skills || []).map((sk, i) => <span key={i} style={st.tag('red')}>{sk}</span>)}
                </div>
              </div>
            </div>

            <div style={st.twoCol}>
              <div style={st.resultCard}>
                <h3 style={st.cardTitle}>✅ Matched Keywords</h3>
                <div style={st.tagCloud}>
                  {(match.matched_keywords || []).map((k, i) => <span key={i} style={st.tag('cyan')}>{k}</span>)}
                </div>
              </div>
              <div style={st.resultCard}>
                <h3 style={st.cardTitle}>❌ Missing Keywords</h3>
                <div style={st.tagCloud}>
                  {(match.missing_keywords || []).map((k, i) => <span key={i} style={st.tag('orange')}>{k}</span>)}
                </div>
              </div>
            </div>

            {/* Improvement tips */}
            {(match.improvement_tips || []).length > 0 && (
              <div style={st.resultCard}>
                <h3 style={st.cardTitle}>💡 Improvement Tips</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {match.improvement_tips.map((tip, i) => (
                    <div key={i} style={st.tipCard(tip.priority)}>
                      <span style={st.tipPriority(tip.priority)}>{tip.priority}</span>
                      <div style={st.tipText}>{tip.tip}</div>
                      {tip.example && <div style={st.tipExample}>💡 {tip.example}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={st.ctaRow}>
              <Link href="/cover-letter" style={st.ctaBtn}>✉️ Generate Cover Letter →</Link>
              <Link href="/interview" style={st.ctaBtnAlt}>🎤 Prepare for Interview →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const st = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc', padding: '0 0 60px' },
  container: { maxWidth: 900, margin: '0 auto', padding: '32px 24px' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 28, fontWeight: 800, margin: '12px 0 4px' },
  subtitle: { color: '#64748b', fontSize: 14.5, margin: '0 0 24px' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  inputCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px' },
  inputCardTitle: { fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '0 0 12px' },
  modeTabs: { display: 'flex', gap: 6, marginBottom: 12 },
  modeTab: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 14px', color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  modeTabActive: { background: 'rgba(0,245,255,0.1)', borderColor: 'rgba(0,245,255,0.3)', color: '#00f5ff' },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  docList: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' },
  docItem: { padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' },
  docItemActive: { borderColor: 'rgba(0,245,255,0.4)', background: 'rgba(0,245,255,0.06)' },
  docName: { fontSize: 13, fontWeight: 700, color: '#f1f5f9' },
  docMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  errorMsg: { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, marginTop: 12 },
  matchBtn: { marginTop: 20, background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 10, padding: '14px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', width: '100%' },
  matchBtnDisabled: { opacity: 0.55, cursor: 'not-allowed' },
  results: { marginTop: 32 },
  scoreGrid: { display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', padding: '24px 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 },
  summaryText: { color: '#94a3b8', fontSize: 14.5, lineHeight: 1.7, marginTop: 16, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 },
  resultCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', marginTop: 14 },
  cardTitle: { fontSize: 13, fontWeight: 800, color: '#f1f5f9', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: (color) => ({
    fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 9999,
    background: color === 'green' ? 'rgba(16,185,129,0.1)' : color === 'red' ? 'rgba(239,68,68,0.08)' : color === 'cyan' ? 'rgba(0,245,255,0.1)' : color === 'orange' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.12)',
    color: color === 'green' ? '#34d399' : color === 'red' ? '#f87171' : color === 'cyan' ? '#67e8f9' : color === 'orange' ? '#fbbf24' : '#94a3b8',
    border: `1px solid ${color === 'green' ? 'rgba(16,185,129,0.2)' : color === 'red' ? 'rgba(239,68,68,0.15)' : color === 'cyan' ? 'rgba(0,245,255,0.2)' : color === 'orange' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)'}`,
  }),
  tipCard: (priority) => ({
    padding: '12px 14px', borderRadius: 10,
    background: priority === 'high' ? 'rgba(239,68,68,0.06)' : priority === 'medium' ? 'rgba(245,158,11,0.06)' : 'rgba(100,116,139,0.06)',
    border: `1px solid ${priority === 'high' ? 'rgba(239,68,68,0.15)' : priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.12)'}`,
  }),
  tipPriority: (p) => ({
    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999, textTransform: 'uppercase',
    background: p === 'high' ? 'rgba(239,68,68,0.2)' : p === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)',
    color: p === 'high' ? '#f87171' : p === 'medium' ? '#fbbf24' : '#94a3b8',
  }),
  tipText: { color: '#f1f5f9', fontSize: 14, fontWeight: 600, marginTop: 8 },
  tipExample: { color: '#94a3b8', fontSize: 13, marginTop: 6, fontStyle: 'italic' },
  ctaRow: { display: 'flex', gap: 12, marginTop: 24 },
  ctaBtn: { flex: 1, textAlign: 'center', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', fontWeight: 800, fontSize: 15, textDecoration: 'none' },
  ctaBtnAlt: { flex: 1, textAlign: 'center', padding: '14px', borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', fontWeight: 800, fontSize: 15, textDecoration: 'none' },
};
