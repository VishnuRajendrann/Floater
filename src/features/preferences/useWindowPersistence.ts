import { useEffect, useRef } from "react";
import { loadPreferences } from "../../storage/preferencesStore";
import { usePreferences } from "../../state/preferences/preferencesContext";
import {
  applyDefaultWindowSize,
  ensureWindowVisible,
  restoreWindowPosition,
  watchWindowBounds,
} from "../../integrations/tauri/windowPrefs";

export function useWindowPersistence() {
  const { setWindowBounds } = usePreferences();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }
    restoredRef.current = true;
    const prefs = loadPreferences();
    void (async () => {
      await ensureWindowVisible();
      try {
        await applyDefaultWindowSize();
        await restoreWindowPosition(prefs.window);
      } catch {
        // Window restore is best-effort; invalid bounds should not crash the app.
      }
      await ensureWindowVisible();
    })();
  }, []);

  useEffect(() => {
    return watchWindowBounds(setWindowBounds);
  }, [setWindowBounds]);
}

