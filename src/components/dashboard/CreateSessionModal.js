import React, { useState, useRef, useEffect } from 'react';
import AnswerPrefsModal, { PREF_OPTIONS, PREF_LINE_PREFIX, prefsLine, loadDefaultPrefs } from './AnswerPrefsModal';

/* The session's instructions with the answer-preference line replaced. */
function withPrefsLine(text, prefs) {
  const kept = String(text || '').split('\n').filter((l) => !l.trim().startsWith(PREF_LINE_PREFIX));
  while (kept.length && !kept[kept.length - 1].trim()) kept.pop();
  return [...kept, prefsLine(prefs)].join('\n').replace(/^\n+/, '');
}

function prefsSummary(prefs) {
  const label = (kind) => (PREF_OPTIONS[kind].find((o) => o.id === prefs[kind]) || PREF_OPTIONS[kind][0]).label;
  return `${label('format')} · ${label('length')} · ${label('tone')}`;
}

/* "AI instructions → Add": the user's own notes for the AI, edited in a
 * window. The answer-preference line (from Configure) is kept apart, so it
 * is neither shown here nor removed by Clear. */
function ownInstructions(text) {
  return String(text || '').split('\n').filter((l) => !l.trim().startsWith(PREF_LINE_PREFIX)).join('\n').trim();
}

function withOwnInstructions(text, own) {
  const prefLines = String(text || '').split('\n').filter((l) => l.trim().startsWith(PREF_LINE_PREFIX));
  return [String(own || '').trim(), ...prefLines].filter(Boolean).join('\n');
}

function InstructionsModal({ initial, onSave, onClose }) {
  const [draft, setDraft] = useState(initial);
  const changed = draft.trim() !== String(initial || '').trim();
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="ap-overlay" onMouseDown={onClose}>
      <div className="ai-card" role="dialog" aria-modal="true" aria-labelledby="ai-title" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="cs-close" onClick={onClose} aria-label="Close">✕</button>
        <h3 id="ai-title">Add AI instructions</h3>
        <p className="ap-lede">Add notes the AI should use during this session, such as company details, things to mention, or how you like answers.</p>
        <label className="ai-label" htmlFor="newContext">Context</label>
        <textarea
          id="newContext"
          className="ai-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows="9"
          autoFocus
          placeholder="e.g. Mention my 3 years of React experience; the company builds payment apps; keep answers under 5 lines."
        />
        <div className="ai-buttons">
          <button type="button" className="btn-ghost-cs" onClick={() => setDraft('')} disabled={!draft}>
            Clear
          </button>
          <button type="button" className="btn" onClick={() => onSave(draft)} disabled={!changed}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* Small inline icons for the Preferences rows. */
const RowIcon = ({ d }) => (
  <svg className="cs-row-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

/* "Mock presets": ready-made practice interviews. Picking one fills in the
 * Company, Role and Job description fields. */
const MOCK_PRESETS = [
  {
    label: 'Frontend Developer',
    company: 'Mock Interview',
    role: 'Frontend Developer',
    jd: 'Frontend Developer building responsive web apps with React, JavaScript/TypeScript, HTML and CSS. Works with REST APIs, state management, performance optimisation, accessibility and testing. Collaborates with designers and backend engineers.',
  },
  {
    label: 'Backend Developer',
    company: 'Mock Interview',
    role: 'Backend Developer',
    jd: 'Backend Developer designing and building APIs and services with Node.js or Java, SQL and NoSQL databases, caching and message queues. Focus on scalability, security, clean code, testing and cloud deployment.',
  },
  {
    label: 'Full Stack Developer',
    company: 'Mock Interview',
    role: 'Full Stack Developer',
    jd: 'Full Stack Developer working across React frontends and Node.js backends, databases and cloud deployment. Owns features end to end, writes tests, and works in an agile team.',
  },
  {
    label: 'Data Analyst',
    company: 'Mock Interview',
    role: 'Data Analyst',
    jd: 'Data Analyst using SQL, Excel and Python to clean, analyse and visualise data, build dashboards (Power BI / Tableau), and turn findings into clear business recommendations.',
  },
  {
    label: 'HR / Behavioural round',
    company: 'Mock Interview',
    role: 'HR Round',
    jd: 'HR and behavioural interview: tell me about yourself, strengths and weaknesses, teamwork, handling conflict, career goals, why this company, and salary expectations. Answers should follow the STAR method.',
  },
  {
    label: 'System Design round',
    company: 'Mock Interview',
    role: 'Senior Software Engineer',
    jd: 'System design interview: design scalable systems (e.g. URL shortener, chat app, news feed), covering requirements, APIs, data model, caching, load balancing, databases, consistency and trade-offs.',
  },
];

/* The CV / Resume and Documents chooser: a list with "None", each uploaded
 * file (✓ on the one in use, long names wrap instead of being cut off), and
 * "+ Upload …" at the bottom, which uploads a new file and selects it. */
function DocPicker({ id, label, items, kind, uploadLabel, onSelect, onSelectNone, onUpload }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const fileRef = useRef(null);
  const selected = items.find((d) => d.is_active && !d.uploading);
  const uploading = items.find((d) => d.uploading);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pickFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !onUpload) return;
    const saved = await onUpload(file, kind);
    // The new file becomes the one this session uses.
    if (saved && !saved.is_active && onSelect) onSelect(saved.id);
  };

  const current = uploading
    ? `Uploading ${uploading.filename}…`
    : (selected ? selected.filename : 'None');

  return (
    <div className="field cs-picker" ref={boxRef}>
      <label htmlFor={id}>{label}</label>
      <button
        id={id}
        type="button"
        className={`cs-picker-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title={current}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="cs-picker-value">{current}</span>
        <svg className="cs-picker-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {open && (
        <div className="cs-picker-menu" role="listbox">
          <button
            type="button"
            className="cs-picker-opt"
            role="option"
            aria-selected={!selected}
            onClick={() => { setOpen(false); if (selected && onSelectNone) onSelectNone(kind); }}
          >
            <span className="cs-picker-name">None</span>
            {!selected && !uploading && <span className="cs-picker-tick">✓</span>}
          </button>
          {items.filter((d) => !d.uploading).map((d) => (
            <button
              key={d.id}
              type="button"
              className="cs-picker-opt"
              role="option"
              aria-selected={Boolean(d.is_active)}
              onClick={() => { setOpen(false); if (!d.is_active && onSelect) onSelect(d.id); }}
            >
              <span className="cs-picker-name">{d.filename}</span>
              {d.is_active ? <span className="cs-picker-tick">✓</span> : null}
            </button>
          ))}
          <div className="cs-picker-sep" />
          <button
            type="button"
            className="cs-picker-opt cs-picker-upload"
            onClick={() => { setOpen(false); if (fileRef.current) fileRef.current.click(); }}
          >
            <span aria-hidden="true">＋</span>
            <span>{uploadLabel}</span>
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        style={{ display: 'none' }}
        onChange={pickFile}
      />
    </div>
  );
}

// Session time the credits buy: 1 credit = 60 minutes (feonix-backend/src/credits.js).
function creditTime(credits) {
  const total = Math.floor(Number(credits) * 60);
  if (!Number.isFinite(total) || total <= 0) return '0 min';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} ${h === 1 ? 'hour' : 'hours'}`;
}

export default function CreateSessionModal({
  catalogue,
  trialsLeft,
  creditsLeft,
  billingChoice,
  setBillingChoice,
  sessionType,
  setSessionType,
  newCompany,
  setNewCompany,
  newRole,
  setNewRole,
  newJd,
  setNewJd,
  newTitle,
  setNewTitle,
  newDesc,
  setNewDesc,
  newContext,
  setNewContext,
  newLanguage,
  setNewLanguage,
  newAgent,
  setNewAgent,
  newAuto,
  setNewAuto,
  newSaveTranscript,
  setNewSaveTranscript,
  createMsg,
  isCreating = false,
  handleCreateSession,
  setShowCreateSheet,
  // CV / Resume and Documents choosers: the uploaded files, and the call
  // that makes one of them the file the copilot uses.
  resumes = [],
  documents = [],
  onActivateDocument,
  onUploadDocument,
  onSelectNoDocument,
}) {
  const trialsExhausted = Number.isFinite(Number(trialsLeft)) && Number(trialsLeft) <= 0;
  // Two steps, as in the left-hand list: 1 Details, 2 Preferences.
  const [step, setStep] = useState(1);
  const [stepMsg, setStepMsg] = useState('');

  const detailsComplete = sessionType === 'mock'
    ? true
    : sessionType === 'interview'
      ? String(newCompany || '').trim() !== ''
      : String(newTitle || '').trim() !== '';
  const goNext = () => {
    if (!detailsComplete) {
      setStepMsg(sessionType === 'interview' ? 'Enter the company name to continue.' : 'Enter the call title to continue.');
      return;
    }
    setStepMsg('');
    setStep(2);
  };

  // Enter in a Details field moves on to Preferences instead of creating
  // the session before the preferences have been seen.
  const onSubmit = (e) => {
    if (step === 1) {
      e.preventDefault();
      goNext();
      return;
    }
    handleCreateSession(e);
  };

  const close = () => { if (!isCreating) setShowCreateSheet(false); };

  // Preferences step: the Answer preferences window, and the choices made in
  // it (also restored from "Set default" when this window opens).
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [answerPrefs, setAnswerPrefs] = useState(null);
  useEffect(() => {
    let hasDefault = false;
    try { hasDefault = Boolean(localStorage.getItem('feonix.answerPrefs')); } catch { /* none */ }
    if (!hasDefault) return;
    const prefs = loadDefaultPrefs();
    setAnswerPrefs(prefs);
    if (!String(newContext || '').includes(PREF_LINE_PREFIX)) setNewContext(withPrefsLine(newContext, prefs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const saveAnswerPrefs = (prefs) => {
    setAnswerPrefs(prefs);
    setNewContext(withPrefsLine(newContext, prefs));
    setPrefsOpen(false);
  };
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const ownText = ownInstructions(newContext);

  // "Mock presets" list (left side).
  const [presetsOpen, setPresetsOpen] = useState(false);
  const presetsRef = useRef(null);
  useEffect(() => {
    if (!presetsOpen) return undefined;
    const onDown = (e) => { if (presetsRef.current && !presetsRef.current.contains(e.target)) setPresetsOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setPresetsOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [presetsOpen]);
  const applyPreset = (preset) => {
    setSessionType('mock');
    setNewCompany(preset.company);
    setNewRole(preset.role);
    setNewJd(preset.jd);
    setStepMsg('');
    setStep(1);
    setPresetsOpen(false);
  };
  // "View tutorial": the How It Works section of the website, in a new tab.
  const openTutorial = () => {
    if (typeof window !== 'undefined') window.open('/#how-it-works', '_blank', 'noopener');
  };

  return (
    <div className="sheet">
      <form className="sheet-card cs-wizard" onSubmit={onSubmit}>
        {/* Left: title and the two steps */}
        <aside className="cs-side">
          <h2>Create session</h2>
          <p className="cs-side-lede">Enter the details &amp; select what you need for this call.</p>
          <ol className="cs-steps">
            <li className={step === 1 ? 'is-current' : 'is-done'}>
              <button type="button" onClick={() => setStep(1)} disabled={isCreating}>
                <span className="cs-step-num">{step > 1 ? '✓' : '1'}</span>
                <span>Details</span>
              </button>
            </li>
            <li className={step === 2 ? 'is-current' : ''}>
              <button type="button" onClick={goNext} disabled={isCreating}>
                <span className="cs-step-num">2</span>
                <span>Preferences</span>
              </button>
            </li>
          </ol>

          <div className="cs-side-actions" ref={presetsRef}>
            {presetsOpen && (
              <div className="cs-picker-menu cs-presets-menu" role="listbox">
                {MOCK_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="cs-picker-opt"
                    onClick={() => applyPreset(preset)}
                  >
                    <span className="cs-picker-name">{preset.label}</span>
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="cs-side-btn" onClick={openTutorial}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2" /><polygon points="22 8 16 12 22 16 22 8" /></svg>
              <span>View tutorial</span>
            </button>
            <button
              type="button"
              className={`cs-side-btn ${presetsOpen ? 'is-open' : ''}`}
              onClick={() => setPresetsOpen((v) => !v)}
              disabled={isCreating}
              aria-haspopup="listbox"
              aria-expanded={presetsOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              <span>Mock presets</span>
            </button>
          </div>
        </aside>

        {/* Right: the current step's fields */}
        <div className="cs-main">
          <button type="button" className="cs-close" onClick={close} aria-label="Close" disabled={isCreating}>✕</button>

        {step === 1 && (
        <>
        <div className="field">
          <label>Session type</label>
          <div className="segmented cs-type-tabs">
            <button
              type="button"
              className={`seg ${sessionType === 'interview' ? 'is-current' : ''}`}
              onClick={() => { setSessionType('interview'); setStepMsg(''); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
              Interview
            </button>
            <button
              type="button"
              className={`seg ${sessionType === 'call' ? 'is-current' : ''}`}
              onClick={() => { setSessionType('call'); setStepMsg(''); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
              Regular
            </button>
            <button
              type="button"
              className={`seg ${sessionType === 'mock' ? 'is-current' : ''}`}
              onClick={() => { setSessionType('mock'); setStepMsg(''); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M12 8V4" /><circle cx="12" cy="3" r="1" /><circle cx="8.5" cy="14" r="1" /><circle cx="15.5" cy="14" r="1" /></svg>
              Mock
            </button>
          </div>
        </div>

        {sessionType !== 'call' ? (
          <>
            <div className="field">
              <label htmlFor="newCompany">Company</label>
              <input
                id="newCompany"
                value={newCompany}
                onChange={(e) => { setNewCompany(e.target.value); setStepMsg(''); }}
                placeholder="Enter company name"
              />
            </div>
            <div className="field">
              <label htmlFor="newRole">Role</label>
              <input
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div className="field">
              <label htmlFor="newJd">Job description</label>
              <textarea
                id="newJd"
                value={newJd}
                onChange={(e) => setNewJd(e.target.value)}
                rows="5"
                placeholder="Enter job description"
              />
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="newTitle">Call title</label>
              <input
                id="newTitle"
                value={newTitle}
                onChange={(e) => { setNewTitle(e.target.value); setStepMsg(''); }}
                placeholder="Q4 Planning Session"
              />
            </div>
            <div className="field">
              <label htmlFor="newDesc">Description</label>
              <textarea
                id="newDesc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows="5"
                placeholder="What the call is about..."
              />
            </div>
          </>
        )}

        <div className="cs-context-label">Context</div>
        <div className="field-pair">
          <DocPicker
            id="csResume"
            label="CV / Resume"
            items={resumes}
            kind="resume"
            uploadLabel="Upload a resume"
            onSelect={onActivateDocument}
            onSelectNone={onSelectNoDocument}
            onUpload={onUploadDocument}
          />
          <DocPicker
            id="csDocs"
            label="Documents"
            items={documents}
            kind="job_description"
            uploadLabel="Upload a document"
            onSelect={onActivateDocument}
            onSelectNone={onSelectNoDocument}
            onUpload={onUploadDocument}
          />
        </div>

        {stepMsg && <div className="msg" style={{ marginTop: '4px' }}>{stepMsg}</div>}

        <div className="cs-actions">
          <button className="btn-ghost-cs" onClick={close} type="button" disabled={isCreating}>
            Cancel
          </button>
          <button className="btn" type="button" onClick={goNext}>
            Next
          </button>
        </div>
        </>
        )}

        {step === 2 && (
        <>
        <div className="cs-group-label">Session</div>

        <div className="cs-row">
          <RowIcon d={<><path d="M4 5h7" /><path d="M7.5 3v2" /><path d="M5 9c1.5 3 4 5 6.5 6" /><path d="M10 5c-.5 4-3 7.5-6 9" /><path d="M13 21l4-9 4 9" /><path d="M14.5 17.5h5" /></>} />
          <div className="cs-row-text">
            <div className="cs-row-title">Select language</div>
            <div className="cs-row-sub">Answer language</div>
          </div>
          <select
            id="newLanguage"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            className="mode-select cs-row-control"
          >
            {catalogue?.languages?.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="cs-row">
          <RowIcon d={<><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" /></>} />
          <div className="cs-row-text">
            <div className="cs-row-title">Select model</div>
            <div className="cs-row-sub">Speed and accuracy</div>
          </div>
          <select
            id="newAgent"
            value={newAgent}
            onChange={(e) => setNewAgent(e.target.value)}
            className="mode-select cs-row-control"
          >
            {catalogue?.agents?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.recommended ? `${a.label} (Recommended)` : a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="cs-row">
          <RowIcon d={<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>} />
          <div className="cs-row-text">
            <div className="cs-row-title">Run with</div>
            <div className="cs-row-sub">
              {billingChoice === 'trial'
                ? '10-minute free trial session'
                : (creditsLeft ? `${creditsLeft} credits left · ${creditTime(creditsLeft)}` : '1 credit = 1 hour')}
            </div>
          </div>
          <select
            value={billingChoice}
            onChange={(e) => setBillingChoice(e.target.value)}
            className="mode-select cs-row-control"
          >
            <option value="trial" disabled={trialsExhausted}>
              {trialsExhausted
                ? 'Free trial (0 left)'
                : Number.isFinite(Number(trialsLeft))
                  ? `Free trial (${Number(trialsLeft)} left)`
                  : 'Free trial'}
            </option>
            <option value="paid">Credits</option>
          </select>
        </div>

        <div className="cs-row">
          <RowIcon d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" /></>} />
          <div className="cs-row-text">
            <div className="cs-row-title">Answer Preferences</div>
            <div className="cs-row-sub">{answerPrefs ? prefsSummary(answerPrefs) : 'Answer style and format'}</div>
          </div>
          <button type="button" className={`cs-row-btn is-dark ${prefsOpen ? 'is-open' : ''}`} onClick={() => setPrefsOpen((v) => !v)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            <span>Configure</span>
          </button>
        </div>
        <div className="cs-row">
          <RowIcon d={<><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>} />
          <div className="cs-row-text">
            <div className="cs-row-title">AI instructions</div>
            <div className="cs-row-sub cs-row-sub-clip" title={ownText || undefined}>
              {ownText || 'Additional guidance'}
            </div>
          </div>
          <button type="button" className="cs-row-btn" onClick={() => setInstructionsOpen(true)}>
            <span aria-hidden="true">{ownText ? '✎' : '+'}</span>
            <span>{ownText ? 'Edit' : 'Add'}</span>
          </button>
        </div>
        <div className="cs-group-label is-later">Extra</div>

        <div className="cs-row">
          <RowIcon d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />} />
          <div className="cs-row-text">
            <div className="cs-row-title">Auto Answer</div>
            <div className="cs-row-sub">Answers questions automatically</div>
          </div>
          <label className="cs-switch">
            <input type="checkbox" checked={newAuto} onChange={(e) => setNewAuto(e.target.checked)} />
            <span className="cs-switch-track" aria-hidden="true" />
            <span className="cs-sr-only">Auto Answer</span>
          </label>
        </div>

        <div className="cs-row">
          <RowIcon d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>} />
          <div className="cs-row-text">
            <div className="cs-row-title">Save transcript</div>
            <div className="cs-row-sub">Consent may be required</div>
          </div>
          <label className="cs-switch">
            <input type="checkbox" checked={newSaveTranscript} onChange={(e) => setNewSaveTranscript(e.target.checked)} />
            <span className="cs-switch-track" aria-hidden="true" />
            <span className="cs-sr-only">Save transcript</span>
          </label>
        </div>

        <div className="cs-actions">
          <button className="btn-ghost-cs" onClick={() => setStep(1)} type="button" disabled={isCreating}>
            Back
          </button>
          <button className="btn" type="submit" disabled={isCreating}>
            {isCreating
              ? 'Creating…'
              : sessionType === 'mock'
                ? 'Create mock session'
                : sessionType === 'interview' ? 'Create interview session' : 'Create session'}
          </button>
        </div>
        {createMsg && (
          <div className="msg" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isCreating && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderTopColor: '#06B6D4',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              )}
              <span>{createMsg}</span>
            </div>
            {(createMsg.includes('Payment is required') || createMsg.includes('credits') || createMsg.includes('free trial')) && (
              <div style={{ marginTop: '8px' }}>
                <a
                  href="/pricing"
                  className="btn btn-small"
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  Buy Credits Now →
                </a>
              </div>
            )}
          </div>
        )}
        </>
        )}
        </div>
      </form>
      {instructionsOpen && (
        <InstructionsModal
          initial={ownText}
          onSave={(own) => { setNewContext(withOwnInstructions(newContext, own)); setInstructionsOpen(false); }}
          onClose={() => setInstructionsOpen(false)}
        />
      )}
      {prefsOpen && (
        <AnswerPrefsModal
          initial={answerPrefs || loadDefaultPrefs()}
          onSave={saveAnswerPrefs}
          onClose={() => setPrefsOpen(false)}
        />
      )}
    </div>
  );
}
