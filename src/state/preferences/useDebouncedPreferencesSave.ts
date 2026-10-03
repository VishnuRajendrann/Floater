import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { savePreferences, type PreferencesV1 } from "../../storage/preferencesStore";

const SAVE_DELAY_MS = 100;

export function useDebouncedPreferencesSave(
  setPreferences: Dispatch<SetStateAction<PreferencesV1>>,
) {
  const saveTimerRef = useRef<number | null>(null);

  const scheduleSave = useCallback((next: PreferencesV1) => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      savePreferences(next);
      saveTimerRef.current = null;
    }, SAVE_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return useCallback(
    (updater: (prev: PreferencesV1) => PreferencesV1) => {
      setPreferences((prev) => {
        const next = updater(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave, setPreferences],
  );
}
