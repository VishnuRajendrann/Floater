# Floater

Free, desktop YouTube video player — lightweight focused viewing via supported YouTube embed playback.

## Requirements

- Node.js 20+ (22 recommended)
- Rust stable + Cargo ([rustup](https://rustup.rs/))
- **Visual Studio Build Tools** with the **Desktop development with C++** workload (provides `link.exe` for Rust on Windows)
- WebView2 (Windows 10/11)

## Development

```bash
npm install
npm run tauri:dev
```

Paste a YouTube URL on the home screen to open the player.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite only (browser at http://localhost:5173) |
| `npm run tauri:dev` | Regenerate icons + desktop app + Vite |
| `npm run build` | Production frontend bundle |
| `npm run tauri:build` | Regenerate icons + Windows installer |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run icons` | Regenerate `src-tauri/icons/` from `public/assets/icons/icon.png` |

## Branches

- **`main`** — stable releases
- **`develop`** — integration branch; feature work branches off `develop`

## Install

Build a Windows installer:

```bash
npm run tauri:build
```

The NSIS setup is written under `src-tauri/target/release/bundle/nsis/`. Installing it is the release check. Development (`npm run tauri:dev`) and the browser (`npm run dev` on port 5173) do not use the production localhost origin (`http://localhost:17352`).

**Always on Top** is a desktop-only toggle (Home and the player header). It uses the native window and has no effect in the browser.

## YouTube / Premium

Floater uses the official [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference). It does **not** bypass ads, DRM, or authentication.

- Premium or ad-free playback is **not guaranteed**. Floater does not sign you in.
- Some videos cannot be embedded (owner restriction).

See [`docs/phase1/youtube-webview-spike.md`](docs/phase1/youtube-webview-spike.md) and [`docs/phase3/release-qa.md`](docs/phase3/release-qa.md).

## Privacy

See [`docs/privacy.md`](docs/privacy.md). Preferences and recent videos stay on this device. Use **Reset local data** on the home screen to clear them.

Release storage is tied to `http://localhost:17352`. Browser dev storage on port 5173 is separate. If port 17352 is already taken, Floater picks another port and local data will not match the usual origin.

## Status

**v1.0.1** — Windows desktop player. See [`CHANGELOG.md`](CHANGELOG.md).

## Assets

- **Sources (commit these):** [`public/assets/`](public/assets/) — icons, future images/fonts
- **Generated (local only):** `src-tauri/icons/` — run `npm run icons`; see [`docs/static-assets.md`](docs/static-assets.md)

See [`docs/folder-structure.md`](docs/folder-structure.md) for the full project layout.

## Keyboard (player)

Shortcuts are disabled while typing in text fields.

- **Space** — play / pause
- **F** — fullscreen (player area)
- **M** — mute / unmute
- **← / →** — seek ±5s

Use **Shortcuts** on the player screen for the full list.
