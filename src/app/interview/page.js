"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'hr', label: 'HR' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'scenario', label: 'Scenario' },
  { value: 'resume_based', label: 'Resume-based' },
];

const GRADE_COLORS = {
  Excellent: '#10b981',
  Good: '#3b82f6',
  Satisfactory: '#f59e0b',
  'Needs Improvement': '#f97316',
  Poor: '#ef4444',
};

export default function InterviewPrepPage() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [categories, setCategories] = useState(['hr', 'technical', 'behavioral']);
  const [perCategory, setPerCategory] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [session, setSession] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const [pastSessions, setPastSessions] = useState([]);

  useEffect(() => {
    fetch('/api/documents?kind=resume').then(async (res) => {
      if (res.ok) {
        const { documents } = await res.json();
        setResumes(documents);
        if (documents.length > 0) setResumeId(String(documents[0].id));
      }
    });
    loadPastSessions();
  }, []);

  async function loadPastSessions() {
    const res = await fetch('/api/interview-prep/sessions');
    if (res.ok) {
      const { sessions } = await res.json();
      setPastSessions(sessions);
    }
  }

  function toggleCategory(cat) {
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (categories.length === 0) { setError('Pick at least one category.'); return; }
    setError('');
    setGenerating(true);
    setSession(null);
    setQIndex(0);
    setAnswer('');
    setEvaluation(null);

    try {
      const res = await fetch('/api/interview-prep/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: resumeId ? Number(resumeId) : null,
          jd_text: jdText.trim() || undefined,
          job_role: jobRole.trim(),
          categories,
          questions_per_category: perCategory,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        loadPastSessions();
      } else {
        setError(data.message || 'Could not generate questions.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (!answer.trim()) return;
    const q = session.questions[qIndex];
    setEvaluating(true);
    setEvaluation(null);
    try {
      const res = await fetch('/api/interview-prep/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          question_id: q.id,
          question: q.question,
          answer: answer.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvaluation(data.evaluation);
      } else {
        setError(data.message || 'Could not evaluate the answer.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setEvaluating(false);
    }
  }

  function nextQuestion() {
    setQIndex((i) => i + 1);
    setAnswer('');
    setEvaluation(null);
  }

  const currentQ = session?.questions?.[qIndex];
  const isDone = session && qIndex >= session.questions.length;

  return (
    <div style={s.page}>
      <div style={s.layout}>
        <div style={s.leftPanel}>
          <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
          <h1 style={s.title}>AI Interview Prep</h1>
          <p style={s.sub}>Mock questions and live feedback, based on your resume and target role.</p>

          <form onSubmit={handleGenerate} style={s.form}>
            <label style={s.label}>Resume (optional)</label>
            <select style={s.select} value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
              <option value="">— None —</option>
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.filename}</option>)}
            </select>

            <label style={s.label}>Target role</label>
            <input style={s.input} value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Frontend Engineer" />

            <label style={s.label}>Job description (optional)</label>
            <textarea style={s.textarea} rows={4} value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste a job description for more targeted questions..." />

            <label style={s.label}>Categories</label>
            <div style={s.catRow}>
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  style={{ ...s.catChip, ...(categories.includes(c.value) ? s.catChipActive : {}) }}
                  onClick={() => toggleCategory(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <label style={s.label}>Questions per category</label>
            <input
              type="number" min={1} max={5} style={s.input}
              value={perCategory}
              onChange={(e) => setPerCategory(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
            />

            {error && <div style={s.errorBanner}>{error}</div>}

            <button type="submit" style={s.generateBtn} disabled={generating}>
              {generating ? '⏳ Generating…' : '🎤 Generate Questions'}
            </button>
          </form>

          <h3 style={s.savedHead}>Past sessions</h3>
          {pastSessions.length === 0 ? (
            <div style={s.mutedCenter}>None yet.</div>
          ) : (
            <div style={s.savedList}>
              {pastSessions.map((sess) => (
                <div key={sess.id} style={s.savedItem}>
                  <div>
                    <div style={s.savedTitle}>{sess.job_role || 'Interview prep'}</div>
                    <div style={s.savedSub}>{sess.answer_count}/{sess.question_count} answered · {sess.created_at?.slice(0, 10)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.rightPanel}>
          {!session ? (
            <div style={s.emptyOutput}>
              <div style={{ fontSize: 44 }}>🎙️</div>
              <div style={s.emptyOutputTitle}>Ready when you are</div>
              <div style={s.emptyOutputSub}>Set up your mock interview on the left and questions will appear here, one at a time.</div>
            </div>
          ) : isDone ? (
            <div style={s.emptyOutput}>
              <div style={{ fontSize: 44 }}>✅</div>
              <div style={s.emptyOutputTitle}>Session complete</div>
              <div style={s.emptyOutputSub}>You answered all {session.questions.length} questions. Generate a new set to keep practicing.</div>
            </div>
          ) : (
            <div style={s.qaCard}>
              <div style={s.qaProgress}>Question {qIndex + 1} of {session.questions.length}</div>
              <div style={s.qaMeta}>
                <span style={s.catBadge}>{currentQ.category?.replace(/_/g, ' ')}</span>
                <span style={s.diffBadge}>{currentQ.difficulty}</span>
              </div>
              <div style={s.qaQuestion}>{currentQ.question}</div>
              {currentQ.hint && <div style={s.qaHint}>💡 {currentQ.hint}</div>}

              {!evaluation ? (
                <form onSubmit={handleSubmitAnswer} style={{ marginTop: 16 }}>
                  <textarea
                    style={s.answerBox}
                    rows={7}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer as you'd say it out loud..."
                  />
                  <button type="submit" style={s.generateBtn} disabled={evaluating || !answer.trim()}>
                    {evaluating ? '⏳ Evaluating…' : 'Submit Answer'}
                  </button>
                </form>
              ) : (
                <div style={s.evalCard}>
                  <div style={s.evalHead}>
                    <span style={{ ...s.gradeBadge, background: `${GRADE_COLORS[evaluation.grade] || '#64748b'}22`, color: GRADE_COLORS[evaluation.grade] || '#94a3b8' }}>
                      {evaluation.grade}
                    </span>
                    <span style={s.overallScore}>{evaluation.overall_score}/100</span>
                  </div>

                  <div style={s.scoreGrid}>
                    {Object.entries(evaluation.scores || {}).map(([k, v]) => (
                      <div key={k} style={s.scoreRow}>
                        <span style={s.scoreLabel}>{k.replace(/_/g, ' ')}</span>
                        <div style={s.scoreTrack}>
                          <div style={{ ...s.scoreFill, width: `${v * 10}%` }} />
                        </div>
                        <span style={s.scoreNum}>{v}/10</span>
                      </div>
                    ))}
                  </div>

                  <p style={s.evalFeedback}>{evaluation.feedback}</p>

                  {evaluation.strengths?.length > 0 && (
                    <>
                      <div style={s.evalSectionHead}>Strengths</div>
                      <ul style={s.evalList}>{evaluation.strengths.map((x, i) => <li key={i}>✓ {x}</li>)}</ul>
                    </>
                  )}
                  {evaluation.improvements?.length > 0 && (
                    <>
                      <div style={s.evalSectionHead}>To improve</div>
                      <ul style={s.evalList}>{evaluation.improvements.map((x, i) => <li key={i}>→ {x}</li>)}</ul>
                    </>
                  )}
                  {evaluation.ideal_answer && (
                    <>
                      <div style={s.evalSectionHead}>What a great answer covers</div>
                      <div style={s.idealAnswer}>{evaluation.ideal_answer}</div>
                    </>
                  )}

                  <button style={{ ...s.generateBtn, marginTop: 16 }} onClick={nextQuestion}>
                    {qIndex + 1 < session.questions.length ? 'Next Question →' : 'Finish'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc' },
  layout: { display: 'flex', minHeight: '100vh' },
  leftPanel: { width: 440, minWidth: 340, borderRight: '1px solid rgba(255,255,255,0.07)', padding: '28px 22px', overflowY: 'auto' },
  rightPanel: { flex: 1, padding: '28px', overflowY: 'auto', display: 'flex' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 22, fontWeight: 800, margin: '10px 0 4px' },
  sub: { fontSize: 13, color: '#64748b', margin: '0 0 20px' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 },
  select: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: 8, padding: '9px 10px', fontSize: 13.5 },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: 8, padding: '9px 10px', fontSize: 13.5, width: '100%' },
  textarea: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: 8, padding: '10px', fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical' },
  catRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  catChip: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 999, padding: '6px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' },
  catChipActive: { background: 'rgba(0,245,255,0.12)', borderColor: 'rgba(0,245,255,0.4)', color: '#00f5ff' },
  errorBanner: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '8px 12px', borderRadius: 8, fontSize: 12.5 },
  generateBtn: { marginTop: 6, background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 9, padding: '11px 18px', fontWeight: 800, fontSize: 14, cursor: 'pointer' },
  savedHead: { fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 26, marginBottom: 10 },
  mutedCenter: { color: '#64748b', fontSize: 13, padding: '10px 0' },
  savedList: { display: 'flex', flexDirection: 'column', gap: 6 },
  savedItem: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '9px 12px' },
  savedTitle: { fontSize: 13, fontWeight: 700, color: '#f1f5f9' },
  savedSub: { fontSize: 11.5, color: '#64748b', marginTop: 2 },
  emptyOutput: { margin: 'auto', textAlign: 'center', color: '#64748b', maxWidth: 320 },
  emptyOutputTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginTop: 12 },
  emptyOutputSub: { fontSize: 13, marginTop: 6, lineHeight: 1.6 },
  qaCard: { width: '100%', maxWidth: 680, margin: '0 auto' },
  qaProgress: { fontSize: 12, fontWeight: 700, color: '#00f5ff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 },
  qaMeta: { display: 'flex', gap: 8, marginBottom: 12 },
  catBadge: { fontSize: 11, fontWeight: 700, textTransform: 'capitalize', background: 'rgba(0,245,255,0.1)', color: '#67e8f9', borderRadius: 999, padding: '3px 10px' },
  diffBadge: { fontSize: 11, fontWeight: 700, textTransform: 'capitalize', background: 'rgba(168,85,247,0.1)', color: '#c084fc', borderRadius: 999, padding: '3px 10px' },
  qaQuestion: { fontSize: 19, fontWeight: 700, color: '#f8fafc', lineHeight: 1.5, marginBottom: 8 },
  qaHint: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' },
  answerBox: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: 10, padding: '12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10 },
  evalCard: { marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' },
  evalHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  gradeBadge: { fontSize: 13, fontWeight: 800, borderRadius: 999, padding: '5px 14px' },
  overallScore: { fontSize: 20, fontWeight: 800, color: '#f8fafc' },
  scoreGrid: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  scoreRow: { display: 'flex', alignItems: 'center', gap: 10 },
  scoreLabel: { fontSize: 12.5, color: '#94a3b8', textTransform: 'capitalize', width: 120, flexShrink: 0 },
  scoreTrack: { flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' },
  scoreFill: { height: '100%', background: '#00f5ff', borderRadius: 999 },
  scoreNum: { fontSize: 12, fontWeight: 700, color: '#f1f5f9', minWidth: 34, textAlign: 'right' },
  evalFeedback: { fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 12 },
  evalSectionHead: { fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 12, marginBottom: 6 },
  evalList: { paddingLeft: 18, margin: 0, color: '#cbd5e1', fontSize: 13.5, lineHeight: 1.7 },
  idealAnswer: { fontSize: 13.5, color: '#d1fae5', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.6 },
};
