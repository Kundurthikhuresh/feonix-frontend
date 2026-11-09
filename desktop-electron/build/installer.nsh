; Extra steps for the Windows installer (included by electron-builder).

; The app registers the feonixai:// link for the current user when it runs
; (app.setAsDefaultProtocolClient). Remove it on uninstall, so that after
; uninstalling, "Open desktop app" on the website correctly reports that the
; app is not installed instead of pointing at a deleted program.
!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\feonixai"
!macroend
