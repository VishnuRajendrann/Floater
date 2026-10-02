# Privacy

Floater is local-first. It does not include analytics, telemetry, or cloud sync.

## Stored on your device

- **Preferences** (`floater.preferences.v1` in browser storage): volume, mute, theme, optional window size/position.
- **Recent videos** (`floater.recentVideos.v1`): video IDs, URLs, optional titles, and timestamps.

You can clear recent history from the home screen, or use **Reset local data** to remove both preferences and history. Storage is per origin: browser dev uses port 5173, and the installed app uses port 17352 when that port is free. Uninstalling the app removes local data for the installed web origin.

## Network

When you load a video, Floater uses the official YouTube IFrame Player and may contact YouTube/Google services under their terms. Optional title lookup uses YouTube’s public oEmbed endpoint for URLs you open.

Floater does not upload your history or preferences to a Floater-operated server.
