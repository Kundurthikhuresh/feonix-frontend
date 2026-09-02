"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InterviewPrepPage() {
  const [resumes, setResumes] = useState([]);
  const [jdDocs, setJdDocs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJd, setSelectedJd] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [categories, setCategories] = useState(['technical', 'behavioral', 'hr']);

  const [session, setSession] = useState(null);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/documents?kind=resume').then(r => r.json()),
      fetch('/api/documents?kind=job_description').then(r => r.json()),
    ]).then(([rd, jd]) => {
      setResumes(rd.documents || []);
      setJdDocs(jd.documents || []);
      if (rd.documents?.[0]) setSelectedResume(rd.documents[0].id);
    }).catch(() => {});
  }, []);

  async function handleGenerateSession() {
    setLoading(true);
    setError('');
    setSession(null);
    setEvaluation(null);
    setUserAnswer('');
    try {
      const res = await fetch('/api/interview-prep/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: selectedResume,
          job_id: selectedJd,
          job_role: jobRole,
          categories,
          questions_per_category: 3,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        setActiveQIndex(0);
      } else {
        setError(data.message || 'Failed to generate questions');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluateAnswer() {
    if (!userAnswer.trim()) return;
    setEvaluating(true);
    setEvaluation(null);
    const q = session.questions[activeQIndex];
    try {
      const res = await fetch('/api/interview-prep/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          question_id: q.id,
          question: q.question,
          answer: userAnswer,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvaluation(data.evaluation);
      } else {
        setError(data.message || 'Evaluation failed');
      }
    } catch {
      setError('Network error during evaluation');
    } finally {
      setEvaluating(false);
    }
  }

  function toggleCategory(cat) {
    if (categories.includes(cat)) {
      if (categories.length > 1) setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  }

  const activeQ = session?.questions?.[activeQIndex];

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
        <h1 style={s.title}>🎤 AI Interview Preparation</h1>
        <p style={s.subtitle}>Generate tailored interview questions based on your background and practice with instant AI feedback & scoring</p>

        {!session ? (
          /* Setup Form */
          <div style={s.setupPanel}>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>1. Select Resume</label>
                <select style={s.select} value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                  <option value="">-- Optional Resume --</option>
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>2. Select Target Job Description</label>
                <select style={s.select} value={selectedJd} onChange={e => setSelectedJd(e.target.value)}>
                  <option value="">-- Optional Job Description --</option>
                  {jdDocs.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
                </select>
              </div>

              <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                <label style={s.label}>3. Target Role Title</label>
                <input style={s.input} type="text" placeholder="e.g. Senior Full Stack Engineer, Product Manager" value={jobRole} onChange={e => setJobRole(e.target.value)} />
              </div>

              <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                <label style={s.label}>4. Question Categories</label>
                <div style={s.catChips}>
                  {[
                    { id: 'hr', label: '👤 HR & Behavioral' },
                    { id: 'technical', label: '💻 Technical & Architecture' },
                    { id: 'behavioral', label: '🧠 STAR Method Behavioral' },
                    { id: 'scenario', label: '⚡ Real-World Scenarios' },
                    { id: 'resume_based', label: '📄 Resume Specific' },
                  ].map(c => (
                    <button
                      key={c.id}
                      style={{ ...s.catChip, ...(categories.includes(c.id) ? s.catChipActive : {}) }}
                      onClick={() => toggleCategory(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <div style={s.errorMsg}>{error}</div>}

            <button style={s.startBtn} onClick={handleGenerateSession} disabled={loading}>
              {loading ? '⏳ Generating Questions...' : '🚀 Start Practice Session'}
            </button>
          </div>
        ) : (
          /* Mock Interview Workspace */
          <div style={s.workspace}>
            {/* Header / Nav */}
            <div style={s.wsHeader}>
              <div>
                <span style={s.badge}>Question {activeQIndex + 1} of {session.questions.length}</span>
                <span style={s.catTag}>{activeQ?.category?.replace('_', ' ')}</span>
                <span style={s.diffTag}>{activeQ?.difficulty}</span>
              </div>
              <button style={s.resetBtn} onClick={() => setSession(null)}>New Session</button>
            </div>

            {/* Question Card */}
            <div style={s.qCard}>
              <h2 style={s.qText}>{activeQ?.question}</h2>
              {activeQ?.hint && <div style={s.qHint}>💡 <strong>Hint:</strong> {activeQ.hint}</div>}
            </div>

            {/* Answer Input */}
            <div style={s.answerSection}>
              <label style={s.label}>Your Answer</label>
              <textarea
                style={s.textarea}
                placeholder="Type or paste your response here (or speak your answer)..."
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                rows={6}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{userAnswer.split(/\s+/).filter(Boolean).length} words</span>
                <button style={s.evalBtn} onClick={handleEvaluateAnswer} disabled={evaluating || !userAnswer.trim()}>
                  {evaluating ? '⏳ AI Evaluating...' : '✨ Submit & Score Answer'}
                </button>
              </div>
            </div>

            {/* Evaluation Results */}
            {evaluation && (
              <div style={s.evalCard}>
                <div style={s.evalHeader}>
                  <div>
                    <span style={s.gradeBadge(evaluation.overall_score)}>{evaluation.grade}</span>
                    <span style={s.overallScore}>{evaluation.overall_score}/100</span>
                  </div>
                </div>

                <div style={s.scoreBreakdown}>
                  {Object.entries(evaluation.scores || {}).map(([metric, score]) => (
                    <div key={metric} style={s.scoreMetric}>
                      <div style={s.metricLabel}>{metric.replace('_', ' ')}</div>
                      <div style={s.metricVal}>{score}/10</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16 }}>
                  <h4 style={s.subHead}>Feedback</h4>
                  <p style={s.feedbackText}>{evaluation.feedback}</p>
                </div>

                {evaluation.ideal_answer && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={s.subHead}>Suggested Ideal Answer</h4>
                    <div style={s.idealBox}>{evaluation.ideal_answer}</div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            <div style={s.pagination}>
              <button
                style={s.pageBtn}
                disabled={activeQIndex === 0}
                onClick={() => {
                  setActiveQIndex(activeQIndex - 1);
                  setUserAnswer('');
                  setEvaluation(null);
                }}
              >
                ← Previous Question
              </button>
              <button
                style={s.pageBtn}
                disabled={activeQIndex === session.questions.length - 1}
                onClick={() => {
                  setActiveQIndex(activeQIndex + 1);
                  setUserAnswer('');
                  setEvaluation(null);
                }}
              >
                Next Question →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc', padding: '0 0 60px' },
  container: { maxWidth: 920, margin: '0 auto', padding: '32px 24px' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 28, fontWeight: 800, margin: '12px 0 4px' },
  subtitle: { color: '#64748b', fontSize: 14.5, margin: '0 0 24px' },
  setupPanel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { marginBottom: 4 },
  label: { display: 'block', fontSize: 12.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  select: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' },
  catChips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  catChip: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '6px 14px', color: '#94a3b8', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' },
  catChipActive: { background: 'rgba(0,245,255,0.12)', borderColor: 'rgba(0,245,255,0.3)', color: '#00f5ff' },
  errorMsg: { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, marginTop: 12 },
  startBtn: { width: '100%', marginTop: 24, background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 10, padding: '14px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  workspace: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' },
  wsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { fontSize: 12, fontWeight: 800, color: '#00f5ff', background: 'rgba(0,245,255,0.1)', padding: '4px 10px', borderRadius: 6, marginRight: 8 },
  catTag: { fontSize: 12, color: '#94a3b8', textTransform: 'capitalize', marginRight: 8 },
  diffTag: { fontSize: 11, color: '#a855f7', textTransform: 'uppercase', fontWeight: 700 },
  resetBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
  qCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 20 },
  qText: { fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: '0 0 10px', lineHeight: 1.5 },
  qHint: { fontSize: 13, color: '#94a3b8', background: 'rgba(245,158,11,0.08)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.15)' },
  answerSection: { marginBottom: 20 },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px', color: '#f1f5f9', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  evalBtn: { background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' },
  evalCard: { background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '20px', marginBottom: 20 },
  evalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  gradeBadge: (score) => ({
    fontSize: 14, fontWeight: 800, padding: '4px 12px', borderRadius: 20, marginRight: 10,
    background: score >= 80 ? 'rgba(16,185,129,0.2)' : score >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
    color: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171',
  }),
  overallScore: { fontSize: 20, fontWeight: 800, color: '#f8fafc' },
  scoreBreakdown: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 },
  scoreMetric: { background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8, textAlign: 'center' },
  metricLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' },
  metricVal: { fontSize: 14, fontWeight: 700, color: '#00f5ff', marginTop: 2 },
  subHead: { fontSize: 13, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', marginBottom: 6 },
  feedbackText: { color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, margin: 0 },
  idealBox: { color: '#94a3b8', fontSize: 13.5, lineHeight: 1.6, fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 8 },
  pagination: { display: 'flex', justifyContent: 'space-between' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
};
