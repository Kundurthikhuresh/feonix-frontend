import React from 'react';

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
  handleCreateSession,
  setShowCreateSheet,
}) {
  const trialsExhausted = Number.isFinite(Number(trialsLeft)) && Number(trialsLeft) <= 0;

  return (
    <div className="sheet">
      <form className="sheet-card" onSubmit={handleCreateSession}>
        <h2>Create session</h2>

        {trialsExhausted && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div>
              <div style={{ color: '#F87171', fontWeight: '600', fontSize: '13px' }}>
                All 5 Free Trial Credits Completed
              </div>
              <div style={{ color: '#D1D5DB', fontSize: '12px', marginTop: '2px' }}>
                Purchase credits to continue creating and running interview sessions.
              </div>
            </div>
            <a
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                color: '#FFFFFF',
                fontWeight: '600',
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Buy Credits →
            </a>
          </div>
        )}

        <div className="field">
          <label>How to run this session</label>
          <div className="billing-choice">
            <button
              type="button"
              className={`bill-opt ${billingChoice === 'trial' ? 'is-current' : ''}`}
              onClick={() => { if (trialsExhausted) return; setBillingChoice('trial'); }}
              disabled={trialsExhausted}
              title={trialsExhausted ? 'All 5 free trial sessions have been used' : undefined}
            >
              <span className="bill-title">
                Free Trial {!trialsExhausted && <span className="bill-tag">Rec</span>}
              </span>
              <span className="bill-line">
                {trialsExhausted ? '0 free trials left' : '5 minutes limit'}
              </span>
            </button>
            <button
              type="button"
              className={`bill-opt ${billingChoice === 'paid' ? 'is-current' : ''}`}
              onClick={() => setBillingChoice('paid')}
            >
              <span className="bill-title">Use Credits</span>
              <span className="bill-line">{creditsLeft ? `${creditsLeft} credits remaining` : 'No duration limit'}</span>
            </button>
          </div>
        </div>

        <div className="field">
          <label>Session type</label>
          <div className="segmented">
            <button
              type="button"
              className={`seg ${sessionType === 'interview' ? 'is-current' : ''}`}
              onClick={() => setSessionType('interview')}
            >
              Interview
            </button>
            <button
              type="button"
              className={`seg ${sessionType === 'call' ? 'is-current' : ''}`}
              onClick={() => setSessionType('call')}
            >
              Regular call
            </button>
          </div>
        </div>

        {sessionType === 'interview' ? (
          <>
            <div className="field">
              <label htmlFor="newCompany">Company</label>
              <input
                id="newCompany"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="Anchor Mission Critical"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="newRole">Role</label>
              <input
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Lead Electrical Engineer"
              />
            </div>
            <div className="field">
              <label htmlFor="newJd">Job description</label>
              <textarea
                id="newJd"
                value={newJd}
                onChange={(e) => setNewJd(e.target.value)}
                rows="4"
                placeholder="Paste the listing details here..."
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
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Q4 Planning Session"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="newDesc">Description</label>
              <textarea
                id="newDesc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows="4"
                placeholder="What the call is about..."
              />
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="newContext">Context &amp; instructions</label>
          <textarea
            id="newContext"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
            rows="3"
            placeholder="Answer style details..."
          />
        </div>

        <div className="field-pair">
          <div className="field">
            <label htmlFor="newLanguage">Answer language</label>
            <select
              id="newLanguage"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="mode-select"
            >
              {catalogue?.languages?.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="newAgent">AI Agent</label>
            <select
              id="newAgent"
              value={newAgent}
              onChange={(e) => setNewAgent(e.target.value)}
              className="mode-select"
            >
              {catalogue?.agents?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-pair" style={{ marginTop: '8px' }}>
          <div className="field">
            <label className="toggle">
              <input
                type="checkbox"
                checked={newAuto}
                onChange={(e) => setNewAuto(e.target.checked)}
              />
              <span>Auto answer questions</span>
            </label>
          </div>
          <div className="field">
            <label className="toggle">
              <input
                type="checkbox"
                checked={newSaveTranscript}
                onChange={(e) => setNewSaveTranscript(e.target.checked)}
              />
              <span>Save session transcript</span>
            </label>
          </div>
        </div>

        <div className="doc-actions">
          <button className="btn" type="submit">Create session</button>
          <button className="btn-link" onClick={() => setShowCreateSheet(false)} type="button">
            Cancel
          </button>
        </div>
        {createMsg && (
          <div className="msg" style={{ marginTop: '12px' }}>
            <div>{createMsg}</div>
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
      </form>
    </div>
  );
}
