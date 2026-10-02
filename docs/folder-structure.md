# Floater folder structure

This repo follows a layered layout: **app shell → pages → features → integrations → state**.

```
Floater/
├── docs/                      # Project documentation
│   └── phase1/
├── public/                    # Static assets (Vite, copied to dist/)
│   └── assets/
│       └── icons/             # Source SVG (favicon + npm run icons)
├── src/
│   ├── app/                   # Application shell
│   │   ├── App.tsx
│   │   ├── providers/         # App-wide React context
│   │   └── routes/            # Top-level screen routing
│   ├── pages/                 # Full-screen views (Home, Player)
│   ├── features/              # User-facing feature modules
│   │   ├── player/
│   │   │   ├── components/    # Each component in its own folder (+ .module.css)
│   │   │   ├── controls/      # One folder per control (+ CSS + index.ts)
│   │   │   ├── context/       # Player command bridge (adapter → UI)
│   │   │   └── hooks/         # Player effects (YouTube lifecycle, shortcuts)
│   │   └── url-input/
│   ├── integrations/          # External systems (YouTube IFrame API)
│   │   └── youtube/
│   ├── storage/               # Versioned localStorage helpers
│   ├── keyboard/              # Shortcut registry + input guards
│   ├── state/
│   │   ├── player/
│   │   └── preferences/
│   ├── styles/                # Global CSS + design tokens
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Pure helpers (no React)
│   ├── main.tsx
│   └── vite-env.d.ts
└── src-tauri/                 # Desktop shell (Rust)
    ├── capabilities/
    ├── icons/                 # Generated desktop icons (`npm run icons`)
    └── src/
```

## Conventions

| Rule | Detail |
|------|--------|
| **Pages** | Compose features; minimal logic. |
| **Features** | One folder per product area; **each UI component lives in its own folder** with co-located CSS (`Component/Component.tsx`, `Component.module.css`, `index.ts`). |
| **Integrations** | Only layer that talks to `window.YT` / external APIs. |
| **State** | Reducers and providers grouped by domain (`state/player/`). |
| **Public assets** | Under `public/assets/` by type (`icons/`, `images/`, …). Do not commit Tauri-generated rasters. |
| **Desktop icons** | Generated under `src-tauri/icons/` (gitignored); see `docs/static-assets.md`. |

## Import direction

`pages` → `features` → `integrations` / `state` / `utils` / `types`

Avoid importing pages or features from `integrations` or `utils`.

### Example (player control)

```
features/player/controls/SeekBar/
  SeekBar.tsx
  SeekBar.module.css
  index.ts          # re-exports SeekBar
```
