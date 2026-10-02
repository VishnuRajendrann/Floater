# Phase 3 security notes

## Capabilities

[`src-tauri/capabilities/default.json`](../src-tauri/capabilities/default.json) grants only the window and event permissions Floater uses to remember size and position:

- listen / unlisten (resize events)
- inner size, scale factor, outer position
- set size, set position

There is no filesystem, shell, dialog, or process permission. Floater defines no custom Tauri commands.

Release builds add a runtime capability that allows the main window to load `http://localhost:{port}` (default **17352**) so the YouTube embed has an HTTP origin. That capability is scoped to that URL and the `main` window.

## Content Security Policy

Defined in [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json). Scripts and frames are limited to YouTube/Google hosts required by the IFrame Player API. `connect-src` includes the stable localhost origin used in release.

## Navigation

The URL field does not navigate the webview. Input is parsed by [`parseYoutubeUrl`](../src/integrations/youtube/parseYoutubeUrl.ts) and only an 11-character video id is passed to the official player. Non-YouTube hosts, non-HTTP(S) URLs, and inputs longer than 2048 characters are rejected.

## Storage

Preferences and recent videos live in `localStorage` for the current origin. No passwords, cookies, or tokens are stored. **Reset local data** on the home screen clears both keys.
