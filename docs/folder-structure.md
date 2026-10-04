# Floater folder structure

Layered layout: **app shell → pages → features → shared / integrations / state**.

Production logic (TypeScript under `src/`, excluding tests, plus `src-tauri` Rust) stays at **40 files or fewer**. Do not add a new module for a helper under 15 lines; put it in the file that uses it. `src/vite-env.d.ts` and the Tauri/Vite entry files are the exceptions.

```
Floater/
├── docs/
├── public/assets/icons/       # Source logo PNG only
├── scripts/                   # prune-windows-icons.mjs
├── src/
│   ├── app/AppShell.tsx       # Providers, routes, window persistence
│   ├── pages/                 # Home.tsx, Player.tsx
│   ├── features/
│   │   ├── home/homeScreen.tsx
│   │   ├── player/            # Hooks, controls, chrome, commands
│   │   └── preferences/PreferencesToggles.tsx
│   ├── shared/ui.tsx          # cn, control button, popover
│   ├── integrations/
│   │   ├── youtube/           # youtubeCore.ts, youtubeRuntime.ts
│   │   └── tauri/windowPrefs.ts
│   ├── storage/
│   ├── keyboard/playerShortcuts.ts
│   ├── state/
│   ├── styles/                # Tailwind entry + design tokens
│   ├── types/errors.ts
│   └── main.tsx
└── src-tauri/                 # Windows desktop shell
```

## Conventions

| Rule | Detail |
|------|--------|
| **Pages** | Compose features. Shared screen state lives in `app/AppShell.tsx`. |
| **Features** | One folder per product area. Related UI and hooks share a module instead of one file per control. |
| **Shared** | `shared/ui.ts` holds class helpers and small UI primitives. Features may import `shared`; `shared` does not import features. |
| **Integrations** | Only layer that talks to `window.YT` or Tauri window APIs. YouTube parsing and types are `youtubeCore.ts`; the iframe API and adapter are `youtubeRuntime.ts`. |
| **State** | Reducers and providers live in the same domain file. |
| **Styling** | Tailwind utilities. Global tokens stay in `styles/tokens.css`. YouTube iframe sizing stays unlayered in `styles/global.css`. |
| **Desktop icons** | Windows NSIS only. See `docs/static-assets.md`. |

## Import direction

`pages` → `features` → `shared` / `integrations` / `state` / `types`

Import the concrete file, not a re-export `index.ts`.

Do not import pages or features from `integrations` or `shared`.
