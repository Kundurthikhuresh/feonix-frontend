"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Formal, polished, and executive' },
  { id: 'confident', label: 'Confident', desc: 'Boldly highlights key achievements' },
  { id: 'concise', label: 'Concise', desc: 'Direct and under 200 words' },
  { id: 'friendly', label: 'Friendly', desc: 'Warm and approachable tone' },
];

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState([]);
  const [jdDocs, setJdDocs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJd, setSelectedJd] = useState('');
  const [jdText, setJdText] = useState('');
  const [jdMode, setJdMode] = useState('paste');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tone, setTone] = useState('professional');

  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [savedLetters, setSavedLetters] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/documents?kind=resume').then(r => r.json()),
      fetch('/api/documents?kind=job_description').then(r => r.json()),
      fetch('/api/cover-letter').then(r => r.json()),
    ]).then(([rd, jd, cl]) => {
      setResumes(rd.documents || []);
      setJdDocs(jd.documents || []);
      setSavedLetters(cl.cover_letters || []);
      if (rd.documents?.[0]) setSelectedResume(rd.documents[0].id);
    }).catch(() => {});
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    setCoverLetter('');
    setCopied(false);

    try {
      const res = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: selectedResume,
          job_id: jdMode === 'document' ? selectedJd : undefined,
          jd_text: jdMode === 'paste' ? jdText : undefined,
          company,
          job_title: jobTitle,
          tone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Failed to generate cover letter');
        setGenerating(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.text) {
                text += parsed.text;
                setCoverLetter(text);
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      // Refresh saved letters list
      const savedRes = await fetch('/api/cover-letter');
      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedLetters(data.cover_letters || []);
      }
    } catch {
      setError('Connection interrupted during stream');
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${(company || 'Company').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  async function loadSavedLetter(id) {
    const res = await fetch(`/api/cover-letter/${id}`);
    if (res.ok) {
      const data = await res.json();
      setCoverLetter(data.cover_letter?.content || '');
      setCompany(data.cover_letter?.company || '');
      setJobTitle(data.cover_letter?.job_title || '');
    }
  }

  const canGenerate = selectedResume && (jdMode === 'document' ? selectedJd : jdText.length >= 20);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
        <h1 style={s.title}>✉️ AI Cover Letter Generator</h1>
        <p style={s.subtitle}>Generate personalized, compelling cover letters powered by your resume and target job</p>

        <div style={s.grid}>
          {/* Controls Form */}
          <div style={s.formPanel}>
            <div style={s.field}>
              <label style={s.label}>1. Select Resume *</label>
              <select style={s.select} value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                <option value="">-- Choose Resume --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.filename} {r.is_active ? '(Primary)' : ''}</option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={s.label}>2. Target Job *</label>
                <div style={s.modeTabs}>
                  <button style={{ ...s.modeTab, ...(jdMode === 'paste' ? s.modeTabActive : {}) }} onClick={() => setJdMode('paste')}>Paste</button>
                  <button style={{ ...s.modeTab, ...(jdMode === 'document' ? s.modeTabActive : {}) }} onClick={() => setJdMode('document')}>Saved</button>
                </div>
              </div>
              {jdMode === 'paste' ? (
                <textarea style={s.textarea} placeholder="Paste job description..." value={jdText} onChange={e => setJdText(e.target.value)} rows={5} />
              ) : (
                <select style={s.select} value={selectedJd} onChange={e => setSelectedJd(e.target.value)}>
                  <option value="">-- Choose Saved Job --</option>
                  {jdDocs.map(d => (
                    <option key={d.id} value={d.id}>{d.filename}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={s.field}>
                <label style={s.label}>Company Name</label>
                <input style={s.input} type="text" placeholder="e.g. Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Job Title</label>
                <input style={s.input} type="text" placeholder="e.g. Staff Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Select Tone</label>
              <div style={s.toneGrid}>
                {TONES.map(t => (
                  <div
                    key={t.id}
                    style={{ ...s.toneCard, ...(tone === t.id ? s.toneCardActive : {}) }}
                    onClick={() => setTone(t.id)}
                  >
                    <div style={s.toneLabel}>{t.label}</div>
                    <div style={s.toneDesc}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={s.errorMsg}>{error}</div>}

            <button style={s.generateBtn} onClick={handleGenerate} disabled={generating || !canGenerate}>
              {generating ? '✨ Generating Letter...' : '✉️ Generate Cover Letter'}
            </button>

            {savedLetters.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={s.historyTitle}>Saved Letters</h4>
                <div style={s.historyList}>
                  {savedLetters.slice(0, 5).map(l => (
                    <div key={l.id} style={s.historyItem} onClick={() => loadSavedLetter(l.id)}>
                      <span>{l.job_title || 'Cover Letter'} {l.company ? `@ ${l.company}` : ''}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{l.created_at?.slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result Output */}
          <div style={s.outputPanel}>
            <div style={s.outputHeader}>
              <h3 style={s.outputTitle}>Generated Cover Letter</h3>
              {coverLetter && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.iconBtn} onClick={handleCopy}>
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button style={s.iconBtn} onClick={handleDownload}>
                    ⬇️ Download
                  </button>
                </div>
              )}
            </div>

            {coverLetter ? (
              <textarea
                style={s.letterOutput}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={22}
              />
            ) : (
              <div style={s.placeholderState}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
                <p>Configure your options on the left and click "Generate Cover Letter"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc', padding: '0 0 60px' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 28, fontWeight: 800, margin: '12px 0 4px' },
  subtitle: { color: '#64748b', fontSize: 14.5, margin: '0 0 24px' },
  grid: { display: 'grid', gridTemplateColumns: '460px 1fr', gap: 24 },
  formPanel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 12.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  select: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  modeTabs: { display: 'flex', gap: 4 },
  modeTab: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 10px', color: '#94a3b8', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  modeTabActive: { background: 'rgba(0,245,255,0.1)', borderColor: 'rgba(0,245,255,0.3)', color: '#00f5ff' },
  toneGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  toneCard: { padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' },
  toneCardActive: { borderColor: 'rgba(0,245,255,0.4)', background: 'rgba(0,245,255,0.08)' },
  toneLabel: { fontSize: 13, fontWeight: 700, color: '#f1f5f9' },
  toneDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  errorMsg: { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, marginBottom: 14 },
  generateBtn: { width: '100%', background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  historyTitle: { fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 },
  historyList: { display: 'flex', flexDirection: 'column', gap: 6 },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, fontSize: 12.5, color: '#cbd5e1', cursor: 'pointer' },
  outputPanel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column' },
  outputHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  outputTitle: { fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  iconBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '6px 14px', color: '#67e8f9', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  letterOutput: { flex: 1, width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '18px', color: '#f1f5f9', fontSize: 14, lineHeight: 1.7, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
  placeholderState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center', padding: '40px' },
};
