# Changelog

## 1.0.1

- Always on Top toggle using the native Tauri window flag, persisted with other local preferences.
- The setting is restored on launch and reapplied after leaving fullscreen.
- Fix: grant window IPC (including `setAlwaysOnTop`) on the release localhost origin so the native flag is actually applied on Windows; UI and persistence now follow successful native calls.

## 1.0.0

- Desktop YouTube player using the official IFrame Player API.
- Custom controls, keyboard shortcuts, auto-hiding control bar, and retry for transient failures.
- Local preferences (volume, mute, theme) and recent videos.
- Release builds serve the UI from a stable localhost port so YouTube receives a normal HTTP origin.
- Tightened Tauri window permissions and URL validation.
- Windows NSIS installer.

Premium or ad-free playback is not guaranteed. Floater does not sign in to YouTube and does not block ads.
