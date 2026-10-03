# Floater folder structure

Layered layout: **app shell → pages → features → shared / integrations / state**.

```
Floater/
├── docs/
├── public/assets/icons/       # Source logo PNG only
├── scripts/                   # prune-windows-icons.mjs
├── src/
│   ├── app/                   # Shell, providers, routes
│   ├── pages/                 # Home.tsx, Player.tsx
│   ├── features/
│   │   ├── home/              # URL form, recent videos
│   │   ├── player/
│   │   │   ├── components/    # Shell UI (flat .tsx files)
│   │   │   ├── controls/      # Playback controls (flat .tsx files)
│   │   │   ├── context/
│   │   │   └── hooks/
│   │   └── preferences/
│   ├── shared/
│   │   ├── lib/cn.ts
│   │   └── ui/                # PlayerControlButton, PopoverPanel
│   ├── integrations/          # YouTube IFrame API, Tauri window
│   ├── storage/
│   ├── keyboard/
│   ├── state/
│   ├── styles/                # Tailwind entry + design tokens
│   ├── types/
│   ├── utils/
│   └── main.tsx
└── src-tauri/                 # Windows desktop shell
```

## Conventions

| Rule | Detail |
|------|--------|
| **Pages** | Compose features; keep logic in hooks. |
| **Features** | One folder per product area. UI files are flat `.tsx` modules, not a folder plus barrel per component. |
| **Shared** | Reused class helpers and small UI primitives. Features may import `shared`; `shared` does not import features. |
| **Integrations** | Only layer that talks to `window.YT` or Tauri window APIs. |
| **State** | Reducers and providers grouped by domain. |
| **Styling** | Tailwind utilities. Global tokens stay in `styles/tokens.css`. YouTube iframe sizing stays unlayered in `styles/global.css`. |
| **Desktop icons** | Windows NSIS only. See `docs/static-assets.md`. |

## Import direction

`pages` → `features` → `shared` / `integrations` / `state` / `utils` / `types`

Import the concrete file (`./PlayPauseButton`), not a re-export `index.ts`.

Do not import pages or features from `integrations`, `shared`, or `utils`.
