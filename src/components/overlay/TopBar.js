import RecordingIndicator from './RecordingIndicator';
import ScreenshotButton from './ScreenshotButton';
import InterviewControls from './InterviewControls';

// Row 1 of the HUD, plus the drag rail above it. The buttons here fill
// nearly the entire width, which is exactly why the drag rail exists — see
// its comment in overlay.css.
export default function TopBar({
  onDragStart, dragging,
  listening, elapsedText, onToggleListening,
  thinking, onAnswerClick,
  screenshotData, screenshotMenuOpen, onToggleScreenshotMenu, onUploadClick, onCaptureScreen, onSolveScreenshotNow, onRemoveScreenshot,
  promptHubOpen, onToggleChat,
  isExpanded, onToggleExpand,
  onMinimize, onClose,
  onToggleSettings,
  onEndSession,
}) {
  return (
    <>
      <div className="pk-drag-rail" onMouseDown={onDragStart} title="Click & drag to move the HUD anywhere on screen">
        <span className="pk-drag-rail-grip" />
      </div>

      <div className="pk-topbar" onMouseDown={onDragStart} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
        <div className="pk-topbar-left">
          <RecordingIndicator listening={listening} elapsedText={elapsedText} onToggle={onToggleListening} />

          <button
            className={`pk-action-btn pk-action-primary ${thinking ? 'pk-btn-loading' : ''}`}
            onClick={onAnswerClick}
            type="button"
            title="Generate AI answer for the detected question"
          >
            {thinking ? (
              <><span className="pk-btn-spinner" /> <span>Generating…</span></>
            ) : (
              <><span>Answer</span><kbd>⌘↵</kbd></>
            )}
          </button>

          <ScreenshotButton
            screenshotData={screenshotData}
            menuOpen={screenshotMenuOpen}
            onToggleMenu={onToggleScreenshotMenu}
            onUploadClick={onUploadClick}
            onCaptureScreen={onCaptureScreen}
            onSolveNow={onSolveScreenshotNow}
            onRemove={onRemoveScreenshot}
          />

          <button
            className={`pk-action-btn ${promptHubOpen ? 'pk-action-active' : ''}`}
            onClick={onToggleChat}
            type="button"
            title="Type a custom question or prompt to generate AI answer"
          >
            <span>Chat</span>
            <kbd>⌘⇧⌫</kbd>
          </button>
        </div>

        <InterviewControls
          onDragHandleMouseDown={onDragStart}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onMinimize={onMinimize}
          onClose={onClose}
          onToggleSettings={onToggleSettings}
          onEndSession={onEndSession}
        />
      </div>
    </>
  );
}
