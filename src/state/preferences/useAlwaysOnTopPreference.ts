import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  loadPreferences,
  savePreferences,
  type PreferencesV1,
} from "../../storage/preferencesStore";
import {
  applyAlwaysOnTop,
  readNativeAlwaysOnTop,
} from "../../integrations/tauri/windowPrefs";

async function syncNativeAlwaysOnTop(desired: boolean): Promise<boolean> {
  await applyAlwaysOnTop(desired);
  const actual = await readNativeAlwaysOnTop();
  return actual ?? desired;
}

type Options = {
  setPreferences: Dispatch<SetStateAction<PreferencesV1>>;
  updatePreferences: (updater: (prev: PreferencesV1) => PreferencesV1) => void;
};

export function useAlwaysOnTopPreference({
  setPreferences,
  updatePreferences,
}: Options) {
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState(false);
  const nativeRestoreRef = useRef(false);

  const persistAlwaysOnTopPreference = useCallback(
    (enabled: boolean) => {
      updatePreferences((prev) => ({ ...prev, alwaysOnTop: enabled }));
    },
    [updatePreferences],
  );

  const clearPersistedAlwaysOnTop = useCallback(() => {
    setPreferences((prev) => {
      if (!prev.alwaysOnTop) {
        return prev;
      }
      const next = { ...prev, alwaysOnTop: false };
      savePreferences(next);
      return next;
    });
  }, [setPreferences]);

  useEffect(() => {
    if (nativeRestoreRef.current) {
      return;
    }
    nativeRestoreRef.current = true;

    const desired = loadPreferences().alwaysOnTop;
    void (async () => {
      try {
        const active = await syncNativeAlwaysOnTop(desired);
        setAlwaysOnTopEnabled(active);
        if (desired && !active) {
          clearPersistedAlwaysOnTop();
        }
      } catch {
        setAlwaysOnTopEnabled(false);
        if (desired) {
          clearPersistedAlwaysOnTop();
        }
      }
    })();
  }, [clearPersistedAlwaysOnTop]);

  const setAlwaysOnTop = useCallback(
    (enabled: boolean) => {
      void (async () => {
        try {
          const active = await syncNativeAlwaysOnTop(enabled);
          setAlwaysOnTopEnabled(active);
          if (active === enabled) {
            persistAlwaysOnTopPreference(enabled);
          } else if (enabled) {
            setAlwaysOnTopEnabled(false);
          }
        } catch {
          const actual = await readNativeAlwaysOnTop();
          setAlwaysOnTopEnabled(actual ?? false);
        }
      })();
    },
    [persistAlwaysOnTopPreference],
  );

  return { alwaysOnTopEnabled, setAlwaysOnTop };
}
