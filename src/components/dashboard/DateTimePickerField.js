import React, { useEffect, useRef, useState } from 'react';

/**
 * Date field with its own calendar, so it can carry a Done button inside (the
 * browser's picker cannot). Only a day is picked; the value keeps the
 * datetime-local format "YYYY-MM-DDTHH:mm" (or '' for none), with the time of
 * day from `time` — "00:00" for a start, "23:59" for an expiry.
 */
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');

function parse(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(value || ''));
  if (!m) return null;
  return { y: Number(m[1]), mo: Number(m[2]) - 1, d: Number(m[3]), h: Number(m[4]), mi: Number(m[5]) };
}
const format = (p) => `${p.y}-${pad(p.mo + 1)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
const nowParts = () => { const n = new Date(); return { y: n.getFullYear(), mo: n.getMonth(), d: n.getDate(), h: n.getHours(), mi: n.getMinutes() }; };

export default function DateTimePickerField({ value, onChange, placeholder = 'dd-mm-yyyy', time = '00:00' }) {
  const [fixedH, fixedMi] = String(time).split(':').map((n) => Number(n) || 0);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [view, setView] = useState(() => { const p = parse(value) || nowParts(); return { y: p.y, mo: p.mo }; });
  const rootRef = useRef(null);

  const current = parse(value);
  const shown = current ? `${pad(current.d)}-${pad(current.mo + 1)}-${current.y}` : '';

  const openPicker = () => {
    const p = current || { ...nowParts(), h: 0, mi: 0 };
    setDraft(current ? { ...current } : null);
    setView({ y: p.y, mo: p.mo });
    setOpen(true);
  };

  // Clicking outside closes it without changing the value.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const moveMonth = (delta) => setView((v) => {
    const m = v.mo + delta;
    return { y: v.y + Math.floor(m / 12), mo: ((m % 12) + 12) % 12 };
  });

  const firstWeekday = new Date(view.y, view.mo, 1).getDay();
  const daysInMonth = new Date(view.y, view.mo + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const today = nowParts();
  const pickDay = (d) => setDraft({ y: view.y, mo: view.mo, d, h: fixedH, mi: fixedMi });

  const done = () => { if (draft) onChange(format(draft)); setOpen(false); };
  const clear = () => { onChange(''); setDraft(null); setOpen(false); };
  const goToday = () => { const n = nowParts(); setDraft({ ...n, h: fixedH, mi: fixedMi }); setView({ y: n.y, mo: n.mo }); };

  return (
    <div className="dtp-root" ref={rootRef}>
      <button type="button" className="admin-input-styled dtp-display" onClick={() => (open ? setOpen(false) : openPicker())}>
        <span className={shown ? 'dtp-value' : 'dtp-placeholder'}>{shown || placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div className="dtp-pop" role="dialog" aria-label="Choose a date">
          <div className="dtp-head">
            <button type="button" className="dtp-nav" onClick={() => moveMonth(-1)} aria-label="Previous month">‹</button>
            <span className="dtp-title">{MONTHS[view.mo]} {view.y}</span>
            <button type="button" className="dtp-nav" onClick={() => moveMonth(1)} aria-label="Next month">›</button>
          </div>

          <div className="dtp-grid">
            {WEEKDAYS.map((w) => <span key={w} className="dtp-weekday">{w}</span>)}
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const selected = draft && draft.y === view.y && draft.mo === view.mo && draft.d === d;
              const isToday = today.y === view.y && today.mo === view.mo && today.d === d;
              return (
                <button
                  key={d}
                  type="button"
                  className={`dtp-day ${selected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                  onClick={() => pickDay(d)}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="dtp-foot">
            <button type="button" className="dtp-link" onClick={clear}>Clear</button>
            <button type="button" className="dtp-link" onClick={goToday}>Today</button>
            <button type="button" className="dtp-done" onClick={done} disabled={!draft}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
