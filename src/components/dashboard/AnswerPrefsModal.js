import React, { useEffect, useMemo, useRef, useState } from 'react';

/* "Answer preferences" window, opened from Create session → Answer
 * Preferences → Configure. Format, Length and Tone shape every answer in the
 * session: Save turns them into one line of the session's instructions
 * (the "context" every answer is written with). The preview on the right
 * shows a sample answer in the chosen shape. */

export const PREF_OPTIONS = {
  format: [
    { id: 'script', label: 'Script', hint: 'Natural sentences you can read out as they are.', rule: 'Write the answer as natural spoken sentences, no bullet points.' },
    { id: 'bullets', label: 'Bullets', hint: 'Only the key points, quick to scan.', rule: 'Write the answer as short bullet points.' },
    { id: 'script_bullets', label: 'Script + bullets', hint: 'A spoken opening, then the key points.', rule: 'Start with one or two spoken sentences, then give the key points as short bullets.' },
  ],
  length: [
    { id: 'short', label: 'Short', hint: 'Just the key points, about 2–3 sentences.', rule: 'Keep it short: 2-3 sentences.' },
    { id: 'balanced', label: 'Balanced', hint: 'The main answer with helpful context, about 4–5 sentences.', rule: 'Keep it balanced: about 4-5 sentences.' },
    { id: 'detailed', label: 'Detailed', hint: 'A fuller explanation with more detail, about 6–8 sentences.', rule: 'Give a detailed answer: about 6-8 sentences.' },
  ],
  tone: [
    { id: 'simple', label: 'Simple', hint: 'Plain, everyday words with no jargon.', rule: 'Use simple, everyday words and avoid jargon.' },
    { id: 'formal', label: 'Formal', hint: 'Polished, professional wording.', rule: 'Use precise, polished, professional wording.' },
  ],
};

export const DEFAULT_PREFS = { format: 'script_bullets', length: 'balanced', tone: 'simple' };
const STORAGE_KEY = 'feonix.answerPrefs';
export const PREF_LINE_PREFIX = 'Answer preference:';

function optionOf(kind, id) {
  return PREF_OPTIONS[kind].find((o) => o.id === id) || PREF_OPTIONS[kind][0];
}

/* The one instructions line that carries the preferences. */
export function prefsLine(prefs) {
  return `${PREF_LINE_PREFIX} ${optionOf('format', prefs.format).rule} ${optionOf('length', prefs.length).rule} ${optionOf('tone', prefs.tone).rule}`;
}

export function loadDefaultPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.format && saved.length && saved.tone) {
      const tone = saved.tone === 'professional' || saved.tone === 'confident' ? 'formal' : saved.tone;
      return { ...DEFAULT_PREFS, ...saved, tone };
    }
  } catch { /* none saved */ }
  return { ...DEFAULT_PREFS };
}

/* Sample answers for the preview: an opening per tone, then key points. */
const SAMPLES = {
  behavioral: {
    label: 'Behavioral',
    question: 'Tell me about a time you worked under a tight deadline.',
    opening: {
      simple: 'In my last project we had to ship a new checkout page in one week instead of three.',
      formal: 'In my previous role, our team was asked to deliver a redesigned checkout flow within one week rather than the planned three.',
    },
    points: [
      'I split the work into small daily goals so everyone knew what to finish each day.',
      'I built the most important screens first and left the nice-to-have parts for later.',
      'I checked in with the designer every morning, so we fixed problems early.',
      'We tested on real phones each evening instead of waiting until the end.',
    ],
    closing: 'We launched on time, and the page cut checkout drop-offs by about 15 percent.',
  },
  technical: {
    label: 'Technical knowledge',
    question: 'What is the virtual DOM in React?',
    opening: {
      simple: 'The virtual DOM is a light copy of the page that React keeps in memory.',
      formal: 'The virtual DOM is an in-memory representation of the UI that React uses to minimise direct DOM updates.',
    },
    points: [
      'When state changes, React builds a new virtual tree for the component.',
      'It compares the new tree with the old one; this step is called diffing.',
      'Only the parts that actually changed are updated in the real DOM.',
      'This avoids slow full-page updates and keeps the app responsive.',
    ],
    closing: 'So the developer just describes the UI, and React works out the smallest set of changes.',
  },
  coding: {
    label: 'Coding (algorithm problems)',
    question: 'How would you find duplicate numbers in an array?',
    opening: {
      simple: 'I would go through the array once and remember the numbers I have already seen.',
      formal: 'The most efficient approach is a single pass using a hash set to track values already encountered.',
    },
    points: [
      'Create an empty set called seen and an empty list for duplicates.',
      'For each number, if it is already in seen, add it to the duplicates list.',
      'Otherwise, add the number to seen and move on.',
      'This takes O(n) time and O(n) extra space, better than comparing every pair.',
    ],
    closing: 'If memory is tight, I could sort the array first and compare neighbours instead.',
  },
  experience: {
    label: 'Experience check',
    question: 'Have you worked with REST APIs before?',
    opening: {
      simple: 'Yes, I have used REST APIs in almost every project for the last three years.',
      formal: 'Yes, I have designed and consumed REST APIs extensively over the past three years.',
    },
    points: [
      'In my current job I connect our React dashboard to about twenty backend endpoints.',
      'I handle loading states, errors and retries so the screen never breaks.',
      'I also built two small Node.js APIs for internal tools.',
      'I test the calls with Postman and write tests for the main ones.',
    ],
    closing: 'So I am comfortable both using APIs and building simple ones.',
  },
  howdoyou: {
    label: 'How-do-you',
    question: 'How do you make sure your code is good quality?',
    opening: {
      simple: 'I keep my code small, clear and tested before anyone else sees it.',
      formal: 'I ensure code quality through clear structure, automated testing and peer review.',
    },
    points: [
      'I write small functions with clear names, so the code explains itself.',
      'I add unit tests for the main logic before I open a pull request.',
      'I ask a teammate to review every change and I review theirs too.',
      'Linting and formatting run automatically, so style is never a debate.',
    ],
    closing: 'This way bugs are caught early and the code stays easy to change.',
  },
  situational: {
    label: 'Situational',
    question: 'What would you do if you found a serious bug just before a release?',
    opening: {
      simple: 'I would tell the team straight away and check how serious the bug really is.',
      formal: 'I would immediately escalate the issue to the team and assess its impact on users.',
    },
    points: [
      'First I would reproduce the bug and see which users it affects.',
      'If it is serious, I would suggest delaying the release or turning that feature off.',
      'Then I would fix it, add a test so it cannot come back, and re-test the release.',
      'I would keep the manager updated so there are no surprises.',
    ],
    closing: 'A short delay is always better than shipping something broken to customers.',
  },
  systemdesign: {
    label: 'System design',
    question: 'How would you design a URL shortener?',
    opening: {
      simple: 'I would store each long link with a short code and redirect people who open the code.',
      formal: 'I would design a service that maps short, unique codes to original URLs and serves fast redirects.',
    },
    points: [
      'An API creates a short code, for example from a counter encoded in base 62.',
      'The code and long URL are saved in a database with the code as the key.',
      'Popular links are kept in a cache like Redis so redirects are very fast.',
      'A load balancer spreads traffic across several servers for high availability.',
    ],
    closing: 'I would also add analytics and link expiry once the basic flow works.',
  },
  general: {
    label: 'Tell me about yourself',
    question: 'Tell me about yourself.',
    opening: {
      simple: 'I am a frontend developer with three years of experience building web apps in React.',
      formal: 'I am a frontend engineer with three years of experience delivering production web applications using React and TypeScript.',
    },
    points: [
      'At my current company I own the customer dashboard used by thousands of people daily.',
      'I care about performance; I recently cut our page load time by 40 percent.',
      'I enjoy working closely with designers and backend developers.',
      'I am now looking for a role where I can grow into larger product decisions.',
    ],
    closing: 'That is why this position interests me: it matches what I do best and where I want to grow.',
  },
};

/* Splits a script paragraph into sentences, so it can appear one at a time. */
function sentencesOf(text) {
  return String(text).match(/[^.!?]+[.!?]+(\s|$)/g)?.map((t) => t.trim()) || [String(text)];
}

/* The sample answer as a list of lines, in the order they appear. */
function previewLines(type, prefs) {
  const sample = SAMPLES[type] || SAMPLES.behavioral;
  const count = prefs.length === 'short' ? 2 : prefs.length === 'detailed' ? 4 : 3;
  const points = sample.points.slice(0, count);
  const opening = sample.opening[prefs.tone] || sample.opening.simple;
  const closing = prefs.length !== 'short' ? sample.closing : '';
  const lines = [{ kind: 'q', text: sample.question }];
  if (prefs.format === 'script') {
    [opening, ...points, closing].filter(Boolean)
      .flatMap(sentencesOf)
      .forEach((t) => lines.push({ kind: 'sentence', text: t }));
  } else if (prefs.format === 'bullets') {
    [opening, ...points, closing].filter(Boolean).forEach((t) => lines.push({ kind: 'li', text: t }));
  } else {
    lines.push({ kind: 'p', text: opening });
    points.forEach((t) => lines.push({ kind: 'li', text: t }));
    if (closing) lines.push({ kind: 'p', text: closing });
  }
  return lines;
}

const LINE_MS = 650;

/* Plays the sample answer like a short video: the question, then one line
 * after another, the way answers stream in during a live call. Starts again
 * whenever the choices or the question type change. */
const QUESTION_TYPE_ORDER = [
  'behavioral', 'coding', 'experience', 'howdoyou', 'situational', 'systemdesign', 'technical', 'general',
];

/* The Question Type list: the chosen type has a ✓. */
function QuestionTypePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);
  const current = SAMPLES[value] || SAMPLES.behavioral;
  return (
    <div className="cs-picker ap-qtype" ref={boxRef}>
      <button
        id="ap-qtype"
        type="button"
        className={`cs-picker-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="cs-picker-value">{current.label}</span>
        <svg className="cs-picker-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="cs-picker-menu ap-qtype-menu" role="listbox">
          {QUESTION_TYPE_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={id === value}
              className="cs-picker-opt"
              onClick={() => { onChange(id); setOpen(false); }}
            >
              <span className="cs-picker-name">{SAMPLES[id].label}</span>
              {id === value && <span className="cs-picker-tick">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SamplePreview({ type, prefs }) {
  const lines = useMemo(() => previewLines(type, prefs), [type, prefs.format, prefs.length, prefs.tone]);
  const [shown, setShown] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    const reduced = typeof window !== 'undefined'
      && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setShown(lines.length); return undefined; }
    setShown(1);
    let n = 1;
    const timer = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= lines.length) clearInterval(timer);
    }, LINE_MS);
    return () => clearInterval(timer);
  }, [lines]);

  // Keep the newest line in view in a long answer.
  useEffect(() => {
    const box = boxRef.current && boxRef.current.closest('.ap-preview');
    if (box) box.scrollTop = box.scrollHeight;
  }, [shown]);

  const visible = lines.slice(0, shown);
  const playing = shown < lines.length;

  // Group consecutive lines: sentences flow in one paragraph, bullets in one list.
  const blocks = [];
  visible.forEach((line, i) => {
    const last = blocks[blocks.length - 1];
    if ((line.kind === 'li' || line.kind === 'sentence') && last && last.kind === line.kind) last.items.push({ ...line, i });
    else blocks.push({ kind: line.kind, items: [{ ...line, i }] });
  });

  return (
    <div className="ap-preview-body" ref={boxRef}>
      {blocks.map((b) => {
        const key = `${b.kind}-${b.items[0].i}`;
        if (b.kind === 'q') return <blockquote key={key} className="ap-preview-q ap-line">{b.items[0].text}</blockquote>;
        if (b.kind === 'li') {
          return <ul key={key}>{b.items.map((it) => <li key={it.i} className="ap-line">{it.text}</li>)}</ul>;
        }
        if (b.kind === 'sentence') {
          return <p key={key}>{b.items.map((it) => <span key={it.i} className="ap-line ap-line-inline">{it.text} </span>)}</p>;
        }
        return <p key={key} className="ap-line">{b.items[0].text}</p>;
      })}
      {playing && <span className="ap-caret" aria-hidden="true" />}
    </div>
  );
}

const ICONS = {
  format: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  length: <><path d="M12 14l4-4" /><path d="M3.3 19a9 9 0 1 1 17.4 0" /></>,
  tone: <><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3z" /><path d="M3 19a2 2 0 0 0 2 2h1v-6H3z" /></>,
};
const TITLES = { format: 'Format', length: 'Length', tone: 'Tone' };
const QUESTIONS = {
  format: { title: 'How should answers be laid out?', sub: 'Pick the layout that is easiest to read during a call.' },
  length: { title: 'How long should answers be?', sub: 'Shorter answers show up faster during a live call.' },
  tone: { title: 'How should answers sound?', sub: 'Choose the tone used for your answers.' },
};

export default function AnswerPrefsModal({ initial, onSave, onClose }) {
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...(initial || {}) }));
  // The setting whose own page is open (null = the list), and the choice
  // being considered there; the preview shows it before Select.
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const shown = editing ? { ...prefs, [editing]: draft } : prefs;
  const openSetting = (kind) => { setEditing(kind); setDraft(prefs[kind]); };
  const closeSetting = () => { setEditing(null); setDraft(null); };
  const selectSetting = () => {
    setPrefs((p) => ({ ...p, [editing]: draft }));
    closeSetting();
  };
  const [questionType, setQuestionType] = useState('behavioral');
  const [savedDefault, setSavedDefault] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (editing) closeSetting();
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, editing]);

  const setDefault = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* not saved */ }
    setSavedDefault(true);
    setTimeout(() => setSavedDefault(false), 1800);
  };

  return (
    <div className="ap-overlay" onMouseDown={onClose}>
      <div className="ap-card" role="dialog" aria-modal="true" aria-labelledby="ap-title" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ap-left">
          {!editing ? (
            <>
              <h3 id="ap-title">Answer preferences</h3>
              <p className="ap-lede">Pick a preference to change how answers are shaped for this session.</p>

              <div className="ap-list">
                {['format', 'length', 'tone'].map((kind) => (
                  <div key={kind} className="ap-item">
                    <button type="button" className="ap-row" onClick={() => openSetting(kind)}>
                      <span className="ap-row-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[kind]}</svg>
                      </span>
                      <span className="ap-row-text">
                        <span className="ap-row-title">{TITLES[kind]}</span>
                        <span className="ap-row-sub">{optionOf(kind, prefs[kind]).label}</span>
                      </span>
                      <svg className="ap-row-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="ap-buttons">
                <button type="button" className="btn-ghost-cs" onClick={setDefault}>
                  {savedDefault ? 'Saved as default ✓' : 'Set default'}
                </button>
                <button type="button" className="btn" onClick={() => onSave(prefs)}>
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 id="ap-title">{QUESTIONS[editing].title}</h3>
              <p className="ap-lede">{QUESTIONS[editing].sub}</p>

              <div className="ap-choices" role="radiogroup" aria-labelledby="ap-title">
                {PREF_OPTIONS[editing].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={draft === o.id}
                    className={`ap-choice ${draft === o.id ? 'is-on' : ''}`}
                    onClick={() => setDraft(o.id)}
                  >
                    <span className="ap-radio" aria-hidden="true" />
                    <span>
                      <span className="ap-option-label">{o.label}</span>
                      <span className="ap-option-hint">{o.hint}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="ap-buttons">
                <button type="button" className="btn-ghost-cs" onClick={closeSetting}>
                  Back
                </button>
                <button type="button" className="btn" onClick={selectSetting}>
                  Select
                </button>
              </div>
            </>
          )}
        </div>

        <div className="ap-right">
          <button type="button" className="cs-close" onClick={onClose} aria-label="Close">✕</button>
          <label className="ap-label" htmlFor="ap-qtype">Question Type</label>
          <QuestionTypePicker value={questionType} onChange={setQuestionType} />
          <div className="ap-label">Answer Preview</div>
          <div className="ap-preview">
            <SamplePreview type={questionType} prefs={shown} />
          </div>
        </div>
      </div>
    </div>
  );
}
