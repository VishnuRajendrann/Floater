# Always on Top — manual QA (v1.0.1)

Run this on an **installed** Windows build (`npm run tauri:build`), not only in the browser. The browser can change the saved preference, but it cannot keep a native window above other apps.

If Always on Top still fails after an update, open DevTools in a debug build (`npm run tauri:dev`) and look for `[Floater] Native always-on-top failed` — that indicates a Tauri permission or IPC error, not a YouTube issue.

1. Launch Floater.
2. Enable Always on Top. The control should read `Always on Top ✓`.
3. Open Chrome.
4. Click Chrome.
5. Confirm Floater remains above Chrome.
6. Open VS Code.
7. Click VS Code.
8. Confirm Floater remains above VS Code.
9. Move and resize Floater.
10. Confirm it remains on top.
11. Disable Always on Top. The control should read `Always on Top`.
12. Click another application.
13. Confirm Floater now behaves like a normal window and can be covered.
14. Re-enable Always on Top.
15. Close Floater.
16. Reopen Floater.
17. Confirm the preference persisted (`Always on Top ✓`).
18. Enter and leave fullscreen. Playback controls should still work, and Always on Top should still be on after leaving fullscreen.
19. Play a YouTube video and use play, pause, seek, volume, mute, and keyboard shortcuts.

Minimize and close should still work while Always on Top is enabled.
