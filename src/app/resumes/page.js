"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const STATUS_COLORS = {
  Excellent: '#10b981',
  Good: '#3b82f6',
  Satisfactory: '#f59e0b',
  'Needs Improvement': '#f97316',
  Poor: '#ef4444',
};

function ScoreRing({ score, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={size < 70 ? 12 : 17} fontWeight="800" fill={color}>
        {score}
      </text>
    </svg>
  );
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    setLoading(true);
    const res = await fetch('/api/documents?kind=resume');
    if (res.ok) {
      const { documents } = await res.json();
      setResumes(documents);
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'resume');
      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        await loadResumes();
        setMsg(`✓ "${data.document.filename}" uploaded — analyzing…`);
        setUploading(false);
        const analyzed = await handleAnalyze(data.document);
        if (analyzed) setMsg(`✓ "${data.document.filename}" uploaded and analyzed`);
      } else {
        setMsg(data.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleAnalyze(doc) {
    setAnalyzingId(doc.id);
    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: doc.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalyses(prev => ({ ...prev, [doc.id]: data.analysis }));
        setSelectedResume(doc);
        setSelectedAnalysis(data.analysis);
        return true;
      } else if (res.status === 429) {
        setMsg(`⚠ ${data.message} — Upgrade to Pro for more analyses.`);
      } else {
        setMsg(data.message || 'Analysis failed. Please try again.');
      }
      return false;
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleSetPrimary(doc) {
    await fetch(`/api/documents/${doc.id}/activate`, { method: 'POST' });
    await loadResumes();
  }

  async function handleDelete(doc) {
    if (!confirm(`Delete "${doc.filename}"?`)) return;
    await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
    await loadResumes();
    if (selectedResume?.id === doc.id) { setSelectedResume(null); setSelectedAnalysis(null); }
  }

  return (
    <div style={s.page}>
      <div style={s.layout}>
        {/* LEFT: Resume List */}
        <div style={s.leftPanel}>
          <div style={s.panelHeader}>
            <div>
              <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
              <h1 style={s.panelTitle}>Resume Library</h1>
              <p style={s.panelSub}>{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
            </div>
            <button style={s.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? '⏳ Uploading...' : '+ Upload Resume'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} onChange={handleUpload} />
          </div>

          {msg && <div style={s.msgBanner}>{msg}</div>}

          {loading ? (
            <div style={s.center}>Loading...</div>
          ) : resumes.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📄</div>
              <div style={s.emptyTitle}>No resumes yet</div>
              <div style={s.emptySub}>Upload a PDF or DOCX to get started</div>
            </div>
          ) : (
            <div style={s.resumeList}>
              {resumes.map((doc) => {
                const analysis = analyses[doc.id];
                const score = analysis?.ats_score;
                const isActive = doc.is_active === 1;
                const isSelected = selectedResume?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    style={{ ...s.resumeCard, ...(isSelected ? s.resumeCardActive : {}), ...(isActive ? s.resumeCardPrimary : {}) }}
                    onClick={() => { setSelectedResume(doc); setSelectedAnalysis(analyses[doc.id] || null); }}
                  >
                    <div style={s.resumeCardLeft}>
                      {score !== undefined ? (
                        <ScoreRing score={score} size={52} />
                      ) : (
                        <div style={s.docIcon}>📄</div>
                      )}
                      <div>
                        <div style={s.resumeFilename}>{doc.filename}</div>
                        <div style={s.resumeMeta}>
                          {isActive && <span style={s.primaryBadge}>Primary</span>}
                          {doc.chars ? `${(doc.chars / 1000).toFixed(1)}k chars · ` : ''}
                          {doc.created_at?.slice(0, 10)}
                          {score !== undefined && <span style={s.scoreBadge(score)}> · ATS {score}/100</span>}
                        </div>
                      </div>
                    </div>
                    <div style={s.resumeCardActions} onClick={e => e.stopPropagation()}>
                      <button
                        style={s.actionBtn('cyan')}
                        onClick={() => handleAnalyze(doc)}
                        disabled={analyzingId === doc.id}
                      >
                        {analyzingId === doc.id ? '⏳' : '🔍 Analyze'}
                      </button>
                      {!isActive && (
                        <button style={s.actionBtn('gray')} onClick={() => handleSetPrimary(doc)}>★ Set Primary</button>
                      )}
                      <button style={s.actionBtn('red')} onClick={() => handleDelete(doc)}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Analysis Panel */}
        <div style={s.rightPanel}>
          {!selectedAnalysis ? (
            <div style={s.noAnalysisState}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>AI Resume Analyzer</div>
              <div style={{ color: '#64748b', fontSize: 14, maxWidth: 280, textAlign: 'center', lineHeight: 1.6 }}>
                Select a resume and click "Analyze" to get your ATS score, section scores, extracted skills, and personalized improvement recommendations.
              </div>
              {resumes.length > 0 && (
                <button
                  style={{ ...s.analyzeHintBtn, marginTop: 20 }}
                  onClick={() => handleAnalyze(resumes[0])}
                  disabled={analyzingId === resumes[0]?.id}
                >
                  {analyzingId ? '⏳ Analyzing...' : `🔍 Analyze "${resumes[0]?.filename}"`}
                </button>
              )}
            </div>
          ) : (
            <AnalysisView analysis={selectedAnalysis} resumeName={selectedResume?.filename} />
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisView({ analysis, resumeName }) {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = ['overview', 'sections', 'problems', 'skills'];

  return (
    <div style={s.analysisView}>
      <div style={s.analysisHeader}>
        <div>
          <div style={s.analysisTitle}>{resumeName}</div>
          <div style={s.analysisSub}>AI Analysis Results</div>
        </div>
        <ScoreRing score={analysis.ats_score} size={80} />
      </div>

      <p style={s.analysisSummary}>{analysis.summary}</p>

      <div style={s.tabs}>
        {tabs.map(tab => (
          <button key={tab} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <h3 style={s.sectionHead}>Strengths</h3>
          <ul style={s.list}>
            {(analysis.strengths || []).map((s, i) => <li key={i} style={s.listItem}>✓ {s}</li>)}
          </ul>
          <h3 style={s.sectionHead}>Top Recommendations</h3>
          <ol style={s.list}>
            {(analysis.recommendations || []).map((r, i) => <li key={i} style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>→ {r}</li>)}
          </ol>
        </div>
      )}

      {activeTab === 'sections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(analysis.section_scores || {}).map(([section, score]) => {
            const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
            return (
              <div key={section} style={s.sectionRow}>
                <span style={s.sectionName}>{section.replace(/_/g, ' ')}</span>
                <div style={s.progressTrack}>
                  <div style={{ ...s.progressFill, width: `${score}%`, background: color }} />
                </div>
                <span style={{ color, fontWeight: 700, fontSize: 14, minWidth: 36, textAlign: 'right' }}>{score}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'problems' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(analysis.problems || []).map((p, i) => (
            <div key={i} style={s.problemCard(p.severity)}>
              <div style={s.problemHeader}>
                <span style={s.severityBadge(p.severity)}>{p.severity}</span>
                <span style={s.problemCategory}>{p.category}</span>
              </div>
              <p style={s.problemIssue}>{p.issue}</p>
              {p.current && (
                <div>
                  <div style={s.beforeLabel}>Before:</div>
                  <div style={s.beforeText}>{p.current}</div>
                </div>
              )}
              {p.improved && (
                <div style={{ marginTop: 8 }}>
                  <div style={s.afterLabel}>✓ Improved:</div>
                  <div style={s.afterText}>{p.improved}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div>
          <h3 style={s.sectionHead}>Skills</h3>
          <div style={s.tagCloud}>
            {(analysis.extracted?.skills || []).map((sk, i) => (
              <span key={i} style={s.tag('cyan')}>{sk}</span>
            ))}
          </div>
          <h3 style={s.sectionHead}>Technologies</h3>
          <div style={s.tagCloud}>
            {(analysis.extracted?.technologies || []).map((t, i) => (
              <span key={i} style={s.tag('purple')}>{t}</span>
            ))}
          </div>
          {analysis.extracted?.job_titles?.length > 0 && (
            <>
              <h3 style={s.sectionHead}>Past Roles</h3>
              <div style={s.tagCloud}>
                {analysis.extracted.job_titles.map((t, i) => (
                  <span key={i} style={s.tag('gray')}>{t}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc' },
  layout: { display: 'flex', minHeight: '100vh' },
  leftPanel: { width: 420, minWidth: 320, borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '28px 20px', overflowY: 'auto' },
  rightPanel: { flex: 1, padding: '28px 28px', overflowY: 'auto' },
  panelHeader: { marginBottom: 20 },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 },
  panelTitle: { fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#f8fafc' },
  panelSub: { fontSize: 13, color: '#64748b', margin: 0 },
  uploadBtn: { marginTop: 12, background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 9, padding: '9px 18px', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' },
  msgBanner: { padding: '10px 14px', borderRadius: 9, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)', color: '#67e8f9', fontSize: 13, marginBottom: 14 },
  center: { textAlign: 'center', padding: '40px 0', color: '#64748b' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontWeight: 700, color: '#f1f5f9', fontSize: 16 },
  emptySub: { color: '#64748b', fontSize: 13 },
  resumeList: { display: 'flex', flexDirection: 'column', gap: 10 },
  resumeCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' },
  resumeCardActive: { borderColor: 'rgba(0,245,255,0.35)', background: 'rgba(0,245,255,0.05)' },
  resumeCardPrimary: { borderLeftWidth: 3, borderLeftColor: '#10b981' },
  resumeCardLeft: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  docIcon: { fontSize: 28, width: 52, textAlign: 'center' },
  resumeFilename: { fontSize: 13.5, fontWeight: 700, color: '#f1f5f9', wordBreak: 'break-all' },
  resumeMeta: { fontSize: 12, color: '#64748b', marginTop: 3 },
  primaryBadge: { background: 'rgba(16,185,129,0.2)', color: '#34d399', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 9999, marginRight: 5 },
  scoreBadge: (score) => ({ color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444', fontWeight: 700 }),
  resumeCardActions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  actionBtn: (color) => ({
    background: color === 'cyan' ? 'rgba(0,245,255,0.1)' : color === 'red' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${color === 'cyan' ? 'rgba(0,245,255,0.3)' : color === 'red' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 700,
    color: color === 'cyan' ? '#67e8f9' : color === 'red' ? '#f87171' : '#94a3b8',
    cursor: 'pointer',
  }),
  noAnalysisState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', textAlign: 'center', color: '#64748b' },
  analyzeHintBtn: { background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,245,255,0.05))', border: '1px solid rgba(0,245,255,0.3)', borderRadius: 10, padding: '11px 22px', color: '#00f5ff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  analysisView: { maxWidth: 680 },
  analysisHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  analysisTitle: { fontSize: 18, fontWeight: 800, color: '#f8fafc' },
  analysisSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  analysisSummary: { color: '#94a3b8', fontSize: 14.5, lineHeight: 1.7, marginBottom: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' },
  tabs: { display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 },
  tab: { background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, padding: '6px 14px', cursor: 'pointer', borderRadius: 8, transition: 'all 0.15s' },
  tabActive: { background: 'rgba(0,245,255,0.1)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)' },
  sectionHead: { fontSize: 13.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, marginTop: 18 },
  list: { paddingLeft: 0, listStyle: 'none', margin: 0 },
  listItem: { color: '#94a3b8', fontSize: 14, marginBottom: 7, lineHeight: 1.5 },
  sectionRow: { display: 'flex', alignItems: 'center', gap: 12 },
  sectionName: { fontSize: 13.5, color: '#94a3b8', textTransform: 'capitalize', width: 160, flexShrink: 0 },
  progressTrack: { flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, transition: 'width 0.5s ease' },
  problemCard: (sev) => ({
    padding: '14px 16px',
    borderRadius: 12,
    background: sev === 'high' ? 'rgba(239,68,68,0.06)' : sev === 'medium' ? 'rgba(245,158,11,0.06)' : 'rgba(100,116,139,0.08)',
    border: `1px solid ${sev === 'high' ? 'rgba(239,68,68,0.2)' : sev === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.15)'}`,
  }),
  problemHeader: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 },
  severityBadge: (sev) => ({
    fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 9999, textTransform: 'uppercase',
    background: sev === 'high' ? 'rgba(239,68,68,0.2)' : sev === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)',
    color: sev === 'high' ? '#f87171' : sev === 'medium' ? '#fbbf24' : '#94a3b8',
  }),
  problemCategory: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  problemIssue: { fontSize: 14, color: '#f1f5f9', fontWeight: 600, margin: '0 0 8px' },
  beforeLabel: { fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 },
  beforeText: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 },
  afterLabel: { fontSize: 11, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 },
  afterText: { fontSize: 13, color: '#d1fae5', padding: '6px 10px', background: 'rgba(16,185,129,0.08)', borderRadius: 6 },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  tag: (color) => ({
    fontSize: 12.5, fontWeight: 600, padding: '4px 11px', borderRadius: 9999,
    background: color === 'cyan' ? 'rgba(0,245,255,0.1)' : color === 'purple' ? 'rgba(168,85,247,0.1)' : 'rgba(100,116,139,0.12)',
    color: color === 'cyan' ? '#67e8f9' : color === 'purple' ? '#c084fc' : '#94a3b8',
    border: `1px solid ${color === 'cyan' ? 'rgba(0,245,255,0.2)' : color === 'purple' ? 'rgba(168,85,247,0.2)' : 'rgba(100,116,139,0.2)'}`,
  }),
};
