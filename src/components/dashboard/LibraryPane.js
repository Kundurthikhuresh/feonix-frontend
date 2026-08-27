import React from 'react';
import { formatWhen } from '../../lib/utils';

export default function LibraryPane({
  activePane,
  resumes,
  documents,
  libSearch,
  setLibSearch,
  libMsg,
  handleUploadDocument,
  handleActivateDocument,
  handleDeleteDocument,
}) {
  const isResumes = activePane === 'resumes';
  const uploadKind = isResumes ? 'resume' : 'job_description';
  const filteredDocs = (isResumes ? resumes : documents).filter((d) => {
    if (libSearch.trim()) {
      return (d.filename || '').toLowerCase().includes(libSearch.toLowerCase());
    }
    return true;
  });

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    handleUploadDocument(file, uploadKind);
    e.target.value = '';
  };

  return (
    <main className="dash">
      <header className="dash-head">
        <div>
          <h1>{isResumes ? 'CVs & resumes' : 'Documents'}</h1>
          <p className="lede">View uploads used to contextualize AI responses.</p>
        </div>
        <label className="btn file-btn">
          {isResumes ? 'Upload resume' : 'Upload document'}
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={onFileChange}
          />
        </label>
      </header>

      <input
        className="dash-search"
        placeholder="Search by name"
        value={libSearch}
        onChange={(e) => setLibSearch(e.target.value)}
        autoComplete="off"
      />

      {libMsg && <p className="msg">{libMsg}</p>}

      <div className="session-grid">
        {filteredDocs.map((d) => (
          <div key={d.id} className="doc-card" data-active={d.is_active ? 'true' : 'false'}>
            <div className="when">{formatWhen(d.created_at)}</div>
            <h3>{d.filename}</h3>
            <div className="chips">
              <span className="chip">{d.chars} chars</span>
              {d.is_active && <span className="chip chip-active">Active</span>}
            </div>
            <div className="doc-card-foot">
              {!d.is_active && (
                <button className="btn-link" onClick={() => handleActivateDocument(d.id)} type="button">
                  Set active
                </button>
              )}
              <button
                className="btn-link"
                style={{ color: 'var(--alert)' }}
                onClick={() => handleDeleteDocument(d.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="dash-empty">No files uploaded yet.</div>
        )}
      </div>
    </main>
  );
}
