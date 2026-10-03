# Static assets (Vite `public/`)

Files here are copied into the web build unchanged.

```
public/
  assets/
    icons/          # Brand / favicon source (icon.png)
  README.md
```

## Generated vs source

| Location | What it is |
|----------|------------|
| `public/assets/icons/` | **You edit these** — minimal source artwork |
| `src-tauri/icons/` | **Generated** — run `npm run icons` (gitignored except README) |

See [`docs/static-assets.md`](../docs/static-assets.md) for why Tauri creates many PNG files.
