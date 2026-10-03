# Phase 3 release QA

Complete this on an **installed** Windows build (`npm run tauri:build`), not only in the browser.

Browser `npm run dev` uses `http://localhost:5173` and does not exercise window persistence or the release localhost origin.

## Install

- [ ] NSIS installer runs
- [ ] Floater appears in the Start menu
- [ ] Uninstall removes the app
- [ ] Reinstall launches

## Playback (release gate)

- [ ] Home loads
- [ ] A public YouTube URL plays (`https://www.youtube.com/watch?v=jNQXAC9IVRw`)
- [ ] No Error 153 and no blank player
- [ ] DevTools origin is `http://localhost:17352` on two launches (if that port was free)
- [ ] Play, pause, seek, volume, mute, fullscreen
- [ ] Keyboard shortcuts work and do not fire in the URL field
- [ ] Control bar auto-hides while playing and stays while paused
- [ ] Theme, volume, and recent videos survive a restart
- [ ] Window size is restored
- [ ] Embed-restricted videos show an error without a retry loop
- [ ] Retry is offered for connection failures and stops after three attempts
- [ ] Reset local data clears history and preferences

## Offline

- [ ] With no network, Home still opens
- [ ] Loading a video fails with a connection message and a retry action
- [ ] After the network returns, retry or a new URL can play

## Security smoke

- [ ] Pasting `https://example.com` does not leave the app
- [ ] Pasting `javascript:` does not execute script
