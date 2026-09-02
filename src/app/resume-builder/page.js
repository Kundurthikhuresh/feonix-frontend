"use client";

import { useState } from 'react';
import Link from 'next/link';

const INITIAL_RESUME = {
  personal: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 555 123 4567',
    location: 'San Francisco, CA',
    title: 'Senior Full Stack Engineer',
    summary: 'Driven software engineer with 5+ years of experience designing scalable web applications and cloud architectures.',
  },
  experience: [
    {
      company: 'TechCorp',
      role: 'Senior Software Engineer',
      duration: '2021 - Present',
      bullets: 'Designed and deployed microservices architecture using Node.js and AWS, reducing API response latency by 35%.\nLed a cross-functional team of 6 engineers to build real-time streaming feature.',
    },
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'MongoDB', 'Docker', 'GraphQL'],
  education: [
    { school: 'University of California, Berkeley', degree: 'B.S. Computer Science', year: '2017 - 2021' },
  ],
};

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState(INITIAL_RESUME);
  const [activeTab, setActiveTab] = useState('personal');
  const [aiLoading, setAiLoading] = useState(false);

  async function handleAiImprove(field, text) {
    setAiLoading(true);
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Improve this resume text for ATS compatibility and executive impact. Return ONLY the improved text without quotes or commentary:\n\n${text}`,
        }),
      });
      if (res.ok) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.content) result += parsed.content;
              } catch {}
            }
          }
        }
        if (result) {
          if (field === 'summary') setResume(r => ({ ...r, personal: { ...r.personal, summary: result } }));
        }
      }
    } catch {}
    finally { setAiLoading(false); }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/?view=dash" style={s.backLink}>← Dashboard</Link>
          <h1 style={s.title}>🛠 AI Resume Builder</h1>
        </div>
        <button style={s.printBtn} onClick={handlePrint}>🖨 Export PDF</button>
      </div>

      <div style={s.workspace}>
        {/* Left Editor */}
        <div style={s.editor}>
          <div style={s.tabs}>
            {['personal', 'experience', 'skills', 'education'].map(t => (
              <button key={t} style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }} onClick={() => setActiveTab(t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === 'personal' && (
            <div style={s.section}>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input style={s.input} value={resume.personal.fullName} onChange={e => setResume({ ...resume, personal: { ...resume.personal, fullName: e.target.value } })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Title</label>
                  <input style={s.input} value={resume.personal.title} onChange={e => setResume({ ...resume, personal: { ...resume.personal, title: e.target.value } })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email</label>
                  <input style={s.input} value={resume.personal.email} onChange={e => setResume({ ...resume, personal: { ...resume.personal, email: e.target.value } })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Location</label>
                  <input style={s.input} value={resume.personal.location} onChange={e => setResume({ ...resume, personal: { ...resume.personal, location: e.target.value } })} />
                </div>
              </div>

              <div style={{ ...s.field, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={s.label}>Professional Summary</label>
                  <button style={s.aiBtn} disabled={aiLoading} onClick={() => handleAiImprove('summary', resume.personal.summary)}>
                    {aiLoading ? '⏳ AI Improving...' : '✨ AI Polish Summary'}
                  </button>
                </div>
                <textarea style={s.textarea} rows={4} value={resume.personal.summary} onChange={e => setResume({ ...resume, personal: { ...resume.personal, summary: e.target.value } })} />
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div style={s.section}>
              {resume.experience.map((exp, idx) => (
                <div key={idx} style={s.cardItem}>
                  <div style={s.grid2}>
                    <input style={s.input} placeholder="Company" value={exp.company} onChange={e => {
                      const newExp = [...resume.experience];
                      newExp[idx].company = e.target.value;
                      setResume({ ...resume, experience: newExp });
                    }} />
                    <input style={s.input} placeholder="Role" value={exp.role} onChange={e => {
                      const newExp = [...resume.experience];
                      newExp[idx].role = e.target.value;
                      setResume({ ...resume, experience: newExp });
                    }} />
                  </div>
                  <textarea style={{ ...s.textarea, marginTop: 8 }} rows={3} placeholder="Bullet points..." value={exp.bullets} onChange={e => {
                    const newExp = [...resume.experience];
                    newExp[idx].bullets = e.target.value;
                    setResume({ ...resume, experience: newExp });
                  }} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div style={s.section}>
              <label style={s.label}>Skills (comma separated)</label>
              <input style={s.input} value={resume.skills.join(', ')} onChange={e => setResume({ ...resume, skills: e.target.value.split(',').map(s => s.trim()) })} />
            </div>
          )}

          {activeTab === 'education' && (
            <div style={s.section}>
              {resume.education.map((edu, idx) => (
                <div key={idx} style={s.cardItem}>
                  <input style={s.input} placeholder="School" value={edu.school} onChange={e => {
                    const newEdu = [...resume.education];
                    newEdu[idx].school = e.target.value;
                    setResume({ ...resume, education: newEdu });
                  }} />
                  <input style={{ ...s.input, marginTop: 6 }} placeholder="Degree" value={edu.degree} onChange={e => {
                    const newEdu = [...resume.education];
                    newEdu[idx].degree = e.target.value;
                    setResume({ ...resume, education: newEdu });
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Preview */}
        <div style={s.preview}>
          <div style={s.previewPaper} className="printable-resume">
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{resume.personal.fullName}</h1>
            <p style={{ color: '#00f5ff', fontWeight: 700, margin: '2px 0 8px' }}>{resume.personal.title}</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>{resume.personal.email} • {resume.personal.location} • {resume.personal.phone}</p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '14px 0' }} />

            <h3 style={s.previewHead}>Summary</h3>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{resume.personal.summary}</p>

            <h3 style={s.previewHead}>Experience</h3>
            {resume.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13.5 }}>
                  <span>{exp.role} @ {exp.company}</span>
                  <span style={{ color: '#64748b' }}>{exp.duration}</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#94a3b8', whiteSpace: 'pre-line', marginTop: 4 }}>{exp.bullets}</p>
              </div>
            ))}

            <h3 style={s.previewHead}>Skills</h3>
            <p style={{ fontSize: 13, color: '#cbd5e1' }}>{resume.skills.join(' • ')}</p>

            <h3 style={s.previewHead}>Education</h3>
            {resume.education.map((edu, i) => (
              <div key={i} style={{ fontSize: 13, color: '#cbd5e1' }}>
                <strong>{edu.school}</strong> - {edu.degree} ({edu.year})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0a0b0f', color: '#f8fafc' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#12141c' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  title: { fontSize: 20, fontWeight: 800, margin: 0 },
  printBtn: { background: 'linear-gradient(135deg, #00f5ff, #0891b2)', color: '#0a0b0f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer' },
  workspace: { display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 65px)' },
  editor: { padding: 24, borderRight: '1px solid rgba(255,255,255,0.07)', overflowY: 'auto' },
  tabs: { display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 },
  tab: { background: 'none', border: 'none', color: '#64748b', fontSize: 12, fontWeight: 700, padding: '6px 12px', cursor: 'pointer', borderRadius: 6 },
  tabActive: { background: 'rgba(0,245,255,0.1)', color: '#00f5ff' },
  section: { display: 'flex', flexDirection: 'column', gap: 12 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
  textarea: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  aiBtn: { background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  cardItem: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 },
  preview: { padding: 32, background: '#050608', overflowY: 'auto', display: 'flex', justifyContent: 'center' },
  previewPaper: { background: '#0f1118', border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 595, padding: 36, borderRadius: 12 },
  previewHead: { fontSize: 13, fontWeight: 800, color: '#00f5ff', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,245,255,0.2)', paddingBottom: 4, marginTop: 18, marginBottom: 8 },
};
