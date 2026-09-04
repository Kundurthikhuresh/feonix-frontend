export default function ScreenshotButton({
  screenshotData, menuOpen, onToggleMenu, onUploadClick, onCaptureScreen, onSolveNow, onRemove,
}) {
  return (
    <div className="pk-relative">
      <button
        className={`pk-action-btn ${screenshotData ? 'pk-action-active' : ''}`}
        onClick={onToggleMenu}
        type="button"
        title="Attach a screenshot to solve visual/coding questions"
      >
        <span>{screenshotData ? '📸 Screenshot ✓' : '📸 Screenshot'}</span>
        <kbd>⌘⇧↵</kbd>
      </button>
      {menuOpen && (
        <div className="pk-dropdown">
          <button className="pk-drop-item" onClick={onUploadClick} type="button">
            📁 Upload Image (.png / .jpg)
          </button>
          <button className="pk-drop-item" onClick={onCaptureScreen} type="button">
            🖥 Snap Screen / Window
          </button>
          {screenshotData && <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
            <button className="pk-drop-item" onClick={onSolveNow} type="button" style={{ color: '#30d158' }}>
              ⚡ Solve Screenshot Now
            </button>
            <button className="pk-drop-item pk-drop-danger" onClick={onRemove} type="button">
              ✕ Remove Screenshot
            </button>
          </>}
          <div className="pk-drop-hint">💡 Ctrl+V to paste directly</div>
        </div>
      )}
    </div>
  );
}
