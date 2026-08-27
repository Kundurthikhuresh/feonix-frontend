import React from 'react';
import { formatWhen } from '../../lib/utils';

export default function AdminPane({
  adminUsers,
  setShowAdminUserSheet,
  openAdminAccount,
  openPasswordReset,
  showAdminUserSheet,
  adminUserEmail,
  setAdminUserEmail,
  adminUserPassword,
  setAdminUserPassword,
  adminUserMsg,
  handleCreateUser,
  showAdminAccountSheet,
  setShowAdminAccountSheet,
  selectedAdminUserEmail,
  adminUserCredits,
  adminUserUsed,
  adminUserTrials,
  aaAction,
  setAaAction,
  aaAmount,
  setAaAmount,
  aaReason,
  setAaReason,
  aaMsg,
  handleApplyBalanceAdjustment,
  creditHistory,
  trialHistory,
  showPasswordSheet,
  setShowPasswordSheet,
  pwTargetEmail,
  pwNew,
  setPwNew,
  pwConfirm,
  setPwConfirm,
  pwMsg,
  handlePasswordResetSubmit,
}) {
  return (
    <main className="dash">
      <header className="dash-head">
        <div>
          <h1>Admin</h1>
          <p className="lede">Accounts, credits and usage.</p>
        </div>
        <button className="btn" onClick={() => setShowAdminUserSheet(true)} type="button">
          Create user
        </button>
      </header>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Credits</th>
              <th>Trials</th>
              <th>Sessions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role === 'owner' ? 'Owner' : 'Member'}</td>
                <td className="num">
                  {u.credits_remaining !== null ? Number(u.credits_remaining).toFixed(1) : '0.0'}
                </td>
                <td className="num">{u.trials_remaining}</td>
                <td className="num">{u.sessions_count}</td>
                <td className="row-actions">
                  <button
                    className="btn btn-small btn-quiet"
                    onClick={() => openAdminAccount(u.id, u.email)}
                    type="button"
                  >
                    Edit Balance
                  </button>
                  <button
                    className="btn btn-small btn-quiet"
                    onClick={() => openPasswordReset(u.id, u.email)}
                    type="button"
                  >
                    Reset PW
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer Sheet: Create User */}
      {showAdminUserSheet && (
        <div className="sheet">
          <form className="sheet-card" onSubmit={handleCreateUser}>
            <h2>Create user</h2>
            <div className="field">
              <label htmlFor="auEmail">Email</label>
              <input
                id="auEmail"
                type="email"
                value={adminUserEmail}
                onChange={(e) => setAdminUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="auPassword">Temporary password</label>
              <input
                id="auPassword"
                type="text"
                value={adminUserPassword}
                onChange={(e) => setAdminUserPassword(e.target.value)}
                required
              />
            </div>
            <div className="doc-actions">
              <button className="btn" type="submit">Create user</button>
              <button className="btn-link" onClick={() => setShowAdminUserSheet(false)} type="button">
                Cancel
              </button>
            </div>
            {adminUserMsg && <div className="msg">{adminUserMsg}</div>}
          </form>
        </div>
      )}

      {/* Drawer Sheet: Edit User Balance */}
      {showAdminAccountSheet && (
        <div className="sheet">
          <div className="sheet-card sheet-wide">
            <div className="detail-head">
              <div>
                <h2>Account</h2>
                <div className="detail-sub">{selectedAdminUserEmail}</div>
              </div>
              <button className="btn-link" onClick={() => setShowAdminAccountSheet(false)} type="button">
                Close
              </button>
            </div>

            <div className="account-strip">
              <div className="acct">
                <span className="acct-label">Credits Left</span>
                <span className="acct-value">{adminUserCredits}</span>
              </div>
              <div className="acct">
                <span className="acct-label">Used Credits</span>
                <span className="acct-value">{adminUserUsed}</span>
              </div>
              <div className="acct">
                <span className="acct-label">Trials Left</span>
                <span className="acct-value">{adminUserTrials}</span>
              </div>
            </div>

            <div className="field">
              <label>Adjust balance</label>
              <div className="credit-form">
                <select value={aaAction} onChange={(e) => setAaAction(e.target.value)} className="mode-select">
                  <option value="grant">Grant</option>
                  <option value="refund">Refund</option>
                  <option value="adjust">Adjustment</option>
                </select>
                <input
                  type="number"
                  step="0.5"
                  value={aaAmount}
                  onChange={(e) => setAaAmount(e.target.value)}
                  placeholder="0.5"
                />
                <input
                  type="text"
                  value={aaReason}
                  onChange={(e) => setAaReason(e.target.value)}
                  placeholder="Reason description"
                />
                <button className="btn btn-small" onClick={handleApplyBalanceAdjustment} type="button">
                  Apply
                </button>
              </div>
              {aaMsg && <div className="note err">{aaMsg}</div>}
            </div>

            <h3 className="ledger-head">Credit history</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Session</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.map((t, idx) => (
                    <tr key={idx}>
                      <td>{formatWhen(t.created_at)}</td>
                      <td>{t.type}</td>
                      <td className={`num ${t.amount >= 0 ? 'tx-amt pos' : 'tx-amt neg'}`}>
                        {t.amount >= 0 ? `+${t.amount}` : t.amount}
                      </td>
                      <td>{t.session_id ? `#${t.session_id}` : '—'}</td>
                      <td>{t.reason || '—'}</td>
                    </tr>
                  ))}
                  {creditHistory.length === 0 && (
                    <tr>
                      <td colSpan="5">No history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Sheet: Reset Password Modal */}
      {showPasswordSheet && (
        <div className="sheet">
          <form className="sheet-card" onSubmit={handlePasswordResetSubmit}>
            <h2>Reset password</h2>
            <p className="lede">{pwTargetEmail}</p>
            <div className="field">
              <label htmlFor="pwNew">New password</label>
              <input
                id="pwNew"
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                required
                minLength="10"
              />
            </div>
            <div className="field">
              <label htmlFor="pwConfirm">Confirm password</label>
              <input
                id="pwConfirm"
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                required
                minLength="10"
              />
            </div>
            <div className="doc-actions">
              <button className="btn" type="submit">Reset password</button>
              <button className="btn-link" onClick={() => setShowPasswordSheet(false)} type="button">
                Cancel
              </button>
            </div>
            {pwMsg && <div className="msg">{pwMsg}</div>}
          </form>
        </div>
      )}
    </main>
  );
}
