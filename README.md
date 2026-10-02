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
| `npm run icons` | Regenerate `src-tauri/icons/` from `public/assets/icons/icon.svg` |

## Branches

- **`main`** — stable releases
- **`develop`** — integration branch; feature work branches off `develop`

## YouTube / Premium

Floater uses the official [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference). It does **not** bypass ads, DRM, or authentication.

- Premium ad-free playback is **not guaranteed** in Phase 1 (no sign-in flow).
- Some videos cannot be embedded (owner restriction).

See [`docs/phase1/youtube-webview-spike.md`](docs/phase1/youtube-webview-spike.md) for WebView2 Referer/origin notes.

## Assets

- **Sources (commit these):** [`public/assets/`](public/assets/) — icons, future images/fonts
- **Generated (local only):** `src-tauri/icons/` — run `npm run icons`; see [`docs/static-assets.md`](docs/static-assets.md)

See [`docs/folder-structure.md`](docs/folder-structure.md) for the full project layout.

## Keyboard (player)

- **Space** — play / pause
- **F** — fullscreen
- **M** — mute
- **← / →** — seek ±5s

## Status

Phase 1 MVP — desktop shell, URL input, embed player, custom controls.
