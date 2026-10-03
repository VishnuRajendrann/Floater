import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type PreferencesV1,
  type ThemePreference,
  type WindowBoundsPreference,
} from "../../storage/preferencesStore";
import {
  applyAlwaysOnTop,
  readNativeAlwaysOnTop,
} from "../../integrations/tauri/windowPrefs";
import { applyThemeToDocument, listenForSystemTheme } from "./themeUtils";

type PreferencesContextValue = {
  preferences: PreferencesV1;
  /** Reflects the native window after a successful apply (not just localStorage). */
  alwaysOnTopEnabled: boolean;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
  setAlwaysOnTop: (enabled: boolean) => void;
  setWindowBounds: (window: WindowBoundsPreference) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

async function syncNativeAlwaysOnTop(desired: boolean): Promise<boolean> {
  await applyAlwaysOnTop(desired);
  const actual = await readNativeAlwaysOnTop();
  return actual ?? desired;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesV1>(() =>
    loadPreferences(),
  );
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const nativeRestoreRef = useRef(false);

  const scheduleSave = useCallback((next: PreferencesV1) => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      savePreferences(next);
      saveTimerRef.current = null;
    }, 100);
  }, []);

  const updatePreferences = useCallback(
    (updater: (prev: PreferencesV1) => PreferencesV1) => {
      setPreferences((prev) => {
        const next = updater(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

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
  }, []);

  useEffect(() => {
    applyThemeToDocument(preferences.theme);
    if (preferences.theme !== "system") {
      return;
    }
    return listenForSystemTheme(() => applyThemeToDocument("system"));
  }, [preferences.theme]);

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

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const setVolume = useCallback(
    (volume: number) => {
      const clamped = Math.min(100, Math.max(0, volume));
      updatePreferences((prev) => ({
        ...prev,
        volume: clamped,
        muted: false,
      }));
    },
    [updatePreferences],
  );

  const setMuted = useCallback(
    (muted: boolean) => {
      updatePreferences((prev) => ({ ...prev, muted }));
    },
    [updatePreferences],
  );

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      updatePreferences((prev) => ({ ...prev, theme }));
    },
    [updatePreferences],
  );

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

  const setWindowBounds = useCallback(
    (window: WindowBoundsPreference) => {
      updatePreferences((prev) => ({ ...prev, window }));
    },
    [updatePreferences],
  );

  const value = useMemo(
    () => ({
      preferences,
      alwaysOnTopEnabled,
      setVolume,
      setMuted,
      setTheme,
      setAlwaysOnTop,
      setWindowBounds,
    }),
    [
      preferences,
      alwaysOnTopEnabled,
      setVolume,
      setMuted,
      setTheme,
      setAlwaysOnTop,
      setWindowBounds,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}

export function getPreferencesOrDefaults(): PreferencesV1 {
  return loadPreferences() ?? DEFAULT_PREFERENCES;
}
