import { useEffect } from "react";
import { applyAlwaysOnTop } from "../../integrations/tauri/windowPrefs";
import { usePreferences } from "../../state/preferences/preferencesContext";

/** Re-applies the native always-on-top flag after fullscreen changes. */
export function useAlwaysOnTopSync() {
  const { alwaysOnTopEnabled } = usePreferences();

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!alwaysOnTopEnabled) {
        return;
      }
      void applyAlwaysOnTop(true).catch(() => {
        // Fullscreen transitions can briefly reject window ops; dev logs in windowPrefs.
      });
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [alwaysOnTopEnabled]);
}
