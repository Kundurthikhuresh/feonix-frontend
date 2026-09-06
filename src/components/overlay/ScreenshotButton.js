export default function ScreenshotButton({
  screenshots, menuOpen, onToggleMenu, onUploadClick, onCaptureScreen, onSolveNow, onRemove,
}) {
  const count = screenshots ? screenshots.length : 0;
  return (
    <div className="pk-relative">
      <button
        className={`pk-action-btn ${count > 0 ? 'pk-action-active' : ''}`}
        onClick={onToggleMenu}
        type="button"
        title="Attach one or more screenshots to solve visual/coding questions"
      >
        <span>{count > 0 ? `📸 Screenshot ✓ (${count})` : '📸 Screenshot'}</span>
        <kbd>⌘⇧↵</kbd>
      </button>
      {menuOpen && (
        <div className="pk-dropdown">
          <button className="pk-drop-item" onClick={onUploadClick} type="button">
            📁 Upload Images (.png / .jpg)
          </button>
          <button className="pk-drop-item" onClick={onCaptureScreen} type="button">
            🖥 Snap Screen / Window
          </button>
          {count > 0 && <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
            <button className="pk-drop-item" onClick={onSolveNow} type="button" style={{ color: '#30d158' }}>
              ⚡ Solve {count > 1 ? `${count} Screenshots` : 'Screenshot'} Now
            </button>
            <button className="pk-drop-item pk-drop-danger" onClick={onRemove} type="button">
              ✕ Remove {count > 1 ? 'All Screenshots' : 'Screenshot'}
            </button>
          </>}
          <div className="pk-drop-hint">💡 Ctrl+V to paste directly — select multiple files to attach several at once</div>
        </div>
      )}
    </div>
  );
}
