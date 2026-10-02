# YouTube WebView2 / Referer spike (Phase 1)

## Goal

Confirm Floater can load and control the YouTube IFrame Player inside Tauri 2 on Windows with a compliant HTTP(S) origin and Referer behavior.

## Environment

- **App identifier:** `com.vishnurajendrann.floater` ([`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json))
- **Referrer policy:** `strict-origin-when-cross-origin` in [`index.html`](../index.html)
- **Player `origin` param:** `window.location.origin` via [`getEmbedOrigin()`](../src/integrations/youtube/getEmbedOrigin.ts)

## Expected origins

| Mode | Page origin | Notes |
|------|-------------|--------|
| `npm run dev` (browser) | `http://localhost:5173` | Baseline |
| `npm run tauri dev` | `http://localhost:5173` | Vite dev URL from Tauri config |
| `npm run tauri build` (release) | `http://localhost:{port}` | **Production uses [`tauri-plugin-localhost`](https://v2.tauri.app/plugin/localhost/)** so the webview is not stuck on `tauri://localhost`, which triggers YouTube **Error 153** (missing HTTP Referer) per [IFrame API docs](https://developers.google.com/youtube/iframe_api_reference) and [Tauri #14422](https://github.com/tauri-apps/tauri/issues/14422). |

## Implementation choice

Floater registers `tauri-plugin-localhost` in [`src-tauri/src/lib.rs`](../src-tauri/src/lib.rs):

- **Dev:** default Tauri + Vite (`devUrl`)
- **Release:** navigate the main window to `http://localhost:{pickedPort}` and add a scoped `CapabilityBuilder::remote` entry

This is a supported, compliant approach (HTTP origin + Referer) — not stream extraction or client modification.

## Manual verification matrix

Run after `npm run tauri dev` and after installing a release build:

1. Load `https://www.youtube.com/watch?v=jNQXAC9IVRw` (public embed-friendly video)
2. Confirm player reaches **ready** (no Error 153 overlay)
3. Exercise play, pause, seek, volume, mute, fullscreen
4. Load a second URL via **New URL** without restarting the app

## Error 153 diagnosis

If Error 153 appears:

1. Log `window.location.origin` in the player screen (dev-only)
2. Confirm `playerVars.origin` matches that origin exactly
3. Confirm release build uses localhost plugin navigation (not `tauri://` alone)
4. Review [Required Minimum Functionality — Referer](https://developers.google.com/youtube/terms/required-minimum-functionality)

## Premium / ads

Phase 1 does **not** implement sign-in. Premium benefits apply only if YouTube recognizes a legitimate session in the embed context. Floater does not block or manipulate ads.

## Spike status

- [ ] Verified in `tauri dev` on Windows
- [ ] Verified in release build on Windows

_Check these boxes during manual QA on the target machine._
