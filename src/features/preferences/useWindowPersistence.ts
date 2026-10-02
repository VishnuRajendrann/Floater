import { useEffect, useRef } from "react";
import { loadPreferences } from "../../storage/preferencesStore";
import { usePreferences } from "../../state/preferences/preferencesContext";
import {
  restoreWindowBounds,
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
    void restoreWindowBounds(loadPreferences().window).catch(() => {
      // Window restore is best-effort; invalid bounds should not crash the app.
    });
  }, []);

  useEffect(() => {
    return watchWindowBounds(setWindowBounds);
  }, [setWindowBounds]);
}
