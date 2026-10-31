import React, { useState, useEffect, useRef } from 'react';
import { formatWhen } from '../../lib/utils';
import './ReviewSessionModal.css';

export default function ReviewSessionView({
  reviewPane,
  setReviewPane,
  reviewData,
  setReviewData,
  reviewSessionId,
  reviewMessages,
  reviewAskInput,
  setReviewAskInput,
  handleReviewAskSubmit,
  setCurrentView,
  clearReviewMessages,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const menuRef = useRef(null);

  const defaultSuggestions = [
    { key: 'email', label: 'Follow-up email' },
    { key: 'grade', label: 'Grade the call' },
    { key: 'vibe', label: 'How was the vibe?' }
  ];

  useEffect(() => {
    if (reviewPane === 'ask') {
      fetch('/api/sessions/suggestions')
        .then(res => res.json())
        .then(data => {
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          }
        })
        .catch(err => console.error('Error fetching suggestions:', err));
    }
  }, [reviewPane]);

  // Close three-dots menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const sessionId = reviewData?.id || reviewSessionId;

  // Auto-generate notes if not present
  useEffect(() => {
    if (reviewPane === 'notes' && sessionId && !reviewData?.notes && !loadingNotes) {
      handleGenerateNotes(false);
    }
  }, [reviewPane, sessionId, reviewData?.notes]);

  const handleGenerateNotes = async (regenerate = false) => {
    if (!sessionId) return;
    setLoadingNotes(true);
    setNotesError('');
    try {
      const res = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate }),
      });
      const data = await res.json();
      if (res.ok && data.notes) {
        if (setReviewData) {
          setReviewData(prev => (prev ? { ...prev, notes: data.notes } : prev));
        }
      } else {
        setNotesError(data.message || data.error || 'Failed to generate AI notes.');
      }
    } catch (err) {
      setNotesError('Connection error while generating notes.');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleClearNotes = async () => {
    if (!sessionId) return;
    if (!window.confirm('Are you sure you want to clear these AI notes?')) return;
    try {
      await fetch(`/api/sessions/${sessionId}/notes`, { method: 'DELETE' });
      if (setReviewData) {
        setReviewData(prev => (prev ? { ...prev, notes: null } : prev));
      }
    } catch (err) {
      console.error('Failed to clear notes:', err);
    }
  };

  const handleCopyTranscript = () => {
    const transcriptText = (reviewData?.transcripts || [])
      .map(t => `${t.speaker || (t.is_question ? 'Interviewer' : 'Candidate')}: ${t.text}`)
      .join('\n\n');
    
    if (!transcriptText) {
      setCopyNotice('No transcript available');
      setTimeout(() => setCopyNotice(''), 2000);
      setShowMenu(false);
      return;
    }

    navigator.clipboard?.writeText(transcriptText);
    setCopyNotice('Copied transcript!');
    setTimeout(() => setCopyNotice(''), 2200);
    setShowMenu(false);
  };

  const handleExportTxt = () => {
    const lines = (reviewData?.transcripts || [])
      .map(t => `[${t.speaker || (t.is_question ? 'Interviewer' : 'Candidate')}]\n${t.text}\n`)
      .join('\n');
    const blob = new Blob([lines || 'No transcript'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(reviewData?.company || 'session').toLowerCase()}-transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // Parse notes text into structured sections: Summary and Questions
  const parseNotes = (notesStr) => {
    let summary = '';
    const questions = [];

    if (notesStr && typeof notesStr === 'string') {
      const sumMatch = notesStr.match(/\[SUMMARY\]([\s\S]*?)(?=\[QUESTIONS\]|$)/i);
      const mdSumMatch = notesStr.match(/##\s*Summary([\s\S]*?)(?=##\s*Questions|$)/i);
      if (sumMatch) {
        summary = sumMatch[1].trim();
      } else if (mdSumMatch) {
        summary = mdSumMatch[1].trim();
      } else {
        const paragraphs = notesStr.split(/\n\s*\n/);
        summary = paragraphs[0]?.trim() || '';
      }

      const qMatch = notesStr.match(/\[QUESTIONS\]([\s\S]*)$/i);
      const mdQMatch = notesStr.match(/##\s*Questions([\s\S]*)$/i);
      const qBlock = qMatch ? qMatch[1].trim() : mdQMatch ? mdQMatch[1].trim() : '';

      if (qBlock) {
        const lines = qBlock.split('\n');
        let currentQ = null;

        for (let rawLine of lines) {
          const line = rawLine.trim();
          if (!line) continue;

          const isBulletQ = (line.startsWith('•') || line.startsWith('*')) && !line.toLowerCase().includes('interviewee:');
          const isQPrefix = /^Q[:.]\s*/i.test(line);
          const isDashQ = /^-\s+/i.test(line) && !line.toLowerCase().includes('interviewee:');
          const isNumberedQ = /^\d+[\).]\s*/.test(line);

          if (isQPrefix || isBulletQ || isDashQ || isNumberedQ) {
            const cleanQ = line
              .replace(/^[•*\-]\s*/, '')
              .replace(/^Q[:.]\s*/i, '')
              .replace(/^\d+[\).]\s*/, '')
              .replace(/^\*\*(.*?)\*\*$/, '$1')
              .trim();

            currentQ = { question: cleanQ, answers: [] };
            questions.push(currentQ);
          } else if (currentQ) {
            const cleanAns = line
              .replace(/^[•*\-]\s*/, '')
              .replace(/^A[:.]\s*/i, '')
              .replace(/^interviewee[:.]?\s*/i, '')
              .trim();

            if (cleanAns) {
              currentQ.answers.push(cleanAns);
            }
          }
        }
      }
    }

    if (questions.length === 0) {
      if (reviewData?.answers && reviewData.answers.length > 0) {
        reviewData.answers.forEach(a => {
          if (a.question) {
            questions.push({
              question: a.question,
              answers: a.reply ? [a.reply] : [],
            });
          }
        });
      } else if (reviewData?.transcripts && reviewData.transcripts.length > 0) {
        let currQ = null;
        reviewData.transcripts.forEach(t => {
          if (t.is_question) {
            currQ = { question: t.text, answers: [] };
            questions.push(currQ);
          } else if (currQ && t.text) {
            currQ.answers.push(t.text);
          }
        });
      }
    }

    return { summary, questions };
  };

  const parsed = parseNotes(reviewData?.notes);
  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  const companyDisplay = reviewData?.company || reviewData?.title || 'Session';
  const roleDisplay = reviewData?.role || '';

  return (
    <div
      className="review-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setCurrentView('dash');
        }
      }}
    >
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Left Column / Sidebar */}
        <aside className="review-modal-sidebar">
          <div className="review-sidebar-header">
            <h2 className="review-company-title">{companyDisplay}</h2>
            {roleDisplay ? <p className="review-role-title">{roleDisplay}</p> : null}
          </div>

          <nav className="review-sidebar-nav">
            <button
              className={`review-nav-item ${reviewPane === 'notes' ? 'is-active' : ''}`}
              onClick={() => setReviewPane('notes')}
              type="button"
            >
              <span className="review-nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <span>AI notes</span>
            </button>

            <button
              className={`review-nav-item ${reviewPane === 'transcript' ? 'is-active' : ''}`}
              onClick={() => setReviewPane('transcript')}
              type="button"
            >
              <span className="review-nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
              <span>Transcript</span>
            </button>

            <button
              className={`review-nav-item ${reviewPane === 'ask' ? 'is-active' : ''}`}
              onClick={() => setReviewPane('ask')}
              type="button"
            >
              <span className="review-nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M7.757 7.757L5.636 5.636m12.728 0l-2.121 2.121M7.757 16.243l-2.121 2.121"/>
                </svg>
              </span>
              <span>Ask AI</span>
            </button>

            <button
              className={`review-nav-item ${reviewPane === 'details' ? 'is-active' : ''}`}
              onClick={() => setReviewPane('details')}
              type="button"
            >
              <span className="review-nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
              <span>Call details</span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="review-sidebar-footer">
            <button
              type="button"
              className="review-rate-link"
              onClick={() => alert('Thank you for rating Feonix AI on Google!')}
            >
              <svg className="review-rate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <span>Rate us on Google</span>
            </button>
          </div>
        </aside>

        {/* Right Content Column */}
        <main className="review-modal-main">
          <header className="review-main-header">
            <h3 className="review-main-title">
              {reviewPane === 'notes'
                ? 'AI notes'
                : reviewPane === 'transcript'
                ? 'Transcript'
                : reviewPane === 'ask'
                ? 'Ask AI'
                : 'Call details'}
            </h3>

            <div className="review-main-actions" ref={menuRef}>
              {copyNotice && (
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500', marginRight: '4px' }}>
                  {copyNotice}
                </span>
              )}

              {reviewPane === 'ask' && (
                <button
                  type="button"
                  className="review-clear-pill-btn"
                  onClick={() => clearReviewMessages && clearReviewMessages()}
                  disabled={reviewMessages.length === 0}
                  title="Clear chat"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 20H7L3 16l10-10 7 7-3.5 3.5"></path>
                    <path d="M6.5 13.5l4 4"></path>
                  </svg>
                  <span>Clear chat</span>
                </button>
              )}

              {reviewPane === 'notes' && (
                <>
                  {reviewData?.notes && (
                    <button
                      type="button"
                      className="review-clear-pill-btn"
                      onClick={handleClearNotes}
                      title="Clear notes"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span>Clear notes</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="review-clear-pill-btn"
                    onClick={() => handleGenerateNotes(true)}
                    disabled={loadingNotes}
                    title={reviewData?.notes ? "Regenerate notes" : "Generate notes"}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loadingNotes ? 'animate-spin' : ''}>
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    <span>{loadingNotes ? 'Analyzing…' : reviewData?.notes ? 'Regenerate' : 'Generate notes'}</span>
                  </button>
                </>
              )}

              {/* Three dots ⋮ menu */}
              <button
                type="button"
                className="review-icon-btn"
                onClick={() => setShowMenu(prev => !prev)}
                title="Options"
              >
                ⋮
              </button>

              {showMenu && (
                <div className="review-dropdown-menu">
                  <button type="button" className="review-dropdown-item" onClick={handleCopyTranscript}>
                    📋 Copy transcript
                  </button>
                  <button type="button" className="review-dropdown-item" onClick={handleExportTxt}>
                    📥 Export as .txt
                  </button>
                  {reviewMessages.length > 0 && (
                    <button type="button" className="review-dropdown-item" onClick={() => { clearReviewMessages?.(); setShowMenu(false); }}>
                      🗑️ Clear chat history
                    </button>
                  )}
                </div>
              )}

              {/* ✕ Close Button */}
              <button
                type="button"
                className="review-icon-btn"
                onClick={() => setCurrentView('dash')}
                title="Close"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Pane 1: Ask AI */}
          {reviewPane === 'ask' && (
            <div className="ask-ai-layout">
              {reviewMessages.length === 0 ? (
                <div className="ask-ai-empty-center">
                  <div className="ask-ai-empty-prompt">
                    <strong>Start the chat by asking a question about the call transcript.</strong>
                    You can start with these suggestions.
                  </div>

                  <div className="ask-ai-suggestions-row">
                    {activeSuggestions.map((s) => (
                      <button
                        key={s.key}
                        className="ask-ai-suggestion-chip"
                        type="button"
                        onClick={() => handleReviewAskSubmit(null, s.key, s.label)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ask-ai-messages-scroll">
                  {reviewMessages.map((m, idx) => (
                    <div key={idx} className={`ask-ai-msg-row ${m.role === 'user' ? 'is-user' : 'is-ai'}`}>
                      <div className={m.role === 'user' ? 'ask-ai-user-bubble' : 'ask-ai-assistant-bubble'}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form className="ask-ai-compose-bar" onSubmit={handleReviewAskSubmit}>
                <input
                  className="ask-ai-input-field"
                  value={reviewAskInput}
                  onChange={(e) => setReviewAskInput(e.target.value)}
                  placeholder="Type your question here..."
                  autoComplete="off"
                />
                <button
                  className="ask-ai-submit-btn"
                  type="submit"
                  disabled={!reviewAskInput || !reviewAskInput.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Pane 2: AI Notes */}
          {reviewPane === 'notes' && (
            <div className="notes-pane-scroll">
              <section className="notes-card">
                <div className="notes-card-header">
                  <span className="notes-icon-tag">ⓘ</span>
                  <h4 className="notes-card-title">Details</h4>
                </div>
                <ul className="notes-meta-list">
                  <li>
                    <span className="notes-meta-dot">•</span>
                    <span><strong>Company:</strong> {companyDisplay}</span>
                  </li>
                  <li>
                    <span className="notes-meta-dot">•</span>
                    <span><strong>Position:</strong> {roleDisplay}</span>
                  </li>
                </ul>
              </section>

              <section className="notes-card">
                <div className="notes-card-header">
                  <span className="notes-icon-tag sparkle">✦</span>
                  <h4 className="notes-card-title">Summary</h4>
                </div>
                {loadingNotes && !parsed.summary ? (
                  <div className="notes-empty-box">
                    <div className="loading-spinner" />
                    <span>Analyzing interview and generating comprehensive summary…</span>
                  </div>
                ) : parsed.summary ? (
                  <p className="notes-body-text">{parsed.summary}</p>
                ) : (
                  <div className="notes-empty-box">
                    <p>No summary generated yet.</p>
                    <button
                      type="button"
                      className="notes-action-btn"
                      onClick={() => handleGenerateNotes(false)}
                      disabled={loadingNotes}
                    >
                      ✨ Generate AI Summary
                    </button>
                  </div>
                )}
              </section>

              <section className="notes-card">
                <div className="notes-card-header">
                  <span className="notes-icon-tag question">❓</span>
                  <h4 className="notes-card-title">Questions</h4>
                </div>
                {loadingNotes && parsed.questions.length === 0 ? (
                  <div className="notes-empty-box">
                    <div className="loading-spinner" />
                    <span>Extracting questions and interviewee responses…</span>
                  </div>
                ) : parsed.questions.length > 0 ? (
                  <div>
                    {parsed.questions.map((qItem, qIdx) => (
                      <div key={qIdx} className="notes-question-item">
                        <div className="notes-q-title">• {qItem.question}</div>
                        {qItem.answers && qItem.answers.length > 0 && (
                          <div className="notes-ans-block">
                            <span className="notes-ans-label">interviewee:</span>
                            {qItem.answers.join(' ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="notes-empty-box">
                    <p>No questions extracted yet for this session.</p>
                    <button
                      type="button"
                      className="notes-action-btn"
                      onClick={() => handleGenerateNotes(false)}
                      disabled={loadingNotes}
                    >
                      Extract Questions with AI
                    </button>
                  </div>
                )}
              </section>

              {notesError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', borderRadius: '10px', fontSize: '13px' }}>
                  {notesError}
                </div>
              )}
            </div>
          )}

          {/* Pane 3: Transcript */}
          {reviewPane === 'transcript' && (
            <div className="transcript-pane-scroll">
              {reviewData?.transcripts && reviewData.transcripts.length > 0 ? (
                reviewData.transcripts.map((t, idx) => (
                  <div
                    key={idx}
                    className="transcript-bubble"
                    data-kind={t.is_question ? 'question' : 'speech'}
                  >
                    <div className="transcript-speaker-badge">
                      {t.speaker || (t.is_question ? 'Interviewer' : 'Candidate')}
                    </div>
                    <p className="transcript-body-text">{t.text}</p>
                  </div>
                ))
              ) : (
                <div className="notes-empty-box">
                  <p>No transcript was recorded for this session.</p>
                </div>
              )}
            </div>
          )}

          {/* Pane 4: Call Details */}
          {reviewPane === 'details' && (
            <div className="details-pane-scroll">
              <div className="detail-card-row">
                <span className="detail-card-label">Company</span>
                <span className="detail-card-value">{companyDisplay}</span>
              </div>
              <div className="detail-card-row">
                <span className="detail-card-label">Role</span>
                <span className="detail-card-value">{roleDisplay}</span>
              </div>
              <div className="detail-card-row">
                <span className="detail-card-label">Status</span>
                <span className="detail-card-value">{reviewData?.status || 'Ended'}</span>
              </div>
              <div className="detail-card-row">
                <span className="detail-card-label">Created at</span>
                <span className="detail-card-value">{formatWhen(reviewData?.created_at) || 'Recently'}</span>
              </div>
              {reviewData?.id && (
                <div className="detail-card-row">
                  <span className="detail-card-label">Session ID</span>
                  <span className="detail-card-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {reviewData.id}
                  </span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
