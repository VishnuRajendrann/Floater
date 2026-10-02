# Phase 2 manual QA

Run in **`npm run tauri:dev`** and again on an **installed release build** after `npm run tauri:build`.

## Player

- [ ] Play / pause (button + Space)
- [ ] Seek bar and arrow keys (±5s)
- [ ] Volume slider persists after restart
- [ ] Mute icon reflects state; M key works
- [ ] Fullscreen (button + F) on player shell
- [ ] Control bar auto-hides after idle; stays visible when paused
- [ ] Control bar stays visible while dragging seek/volume

## Keyboard

- [ ] Space / F / M / arrows on player
- [ ] Shortcuts do not fire while typing in URL field
- [ ] Shortcuts work when control bar is hidden

## Home

- [ ] Invalid URL shows clear message
- [ ] Recent list adds entries, dedupes, reopens video
- [ ] Clear history works
- [ ] Theme toggle persists (dark / light / system)

## Errors

- [ ] Embed-restricted video shows appropriate message (no retry)
- [ ] Retry works for transient failures (max 3)
- [ ] New URL from error panel works

## Window

- [ ] Resize within min dimensions; controls usable
- [ ] Window size restored after restart (Tauri)

## Release-only

- [ ] `window.location.origin` stable across two launches (default `http://localhost:17352`)
- [ ] YouTube plays; no Error 153
- [ ] Phase 2 prefs/recents persist in release
