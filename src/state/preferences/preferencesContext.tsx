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
import { applyThemeToDocument, listenForSystemTheme } from "./themeUtils";

type PreferencesContextValue = {
  preferences: PreferencesV1;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
  setWindowBounds: (window: WindowBoundsPreference) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesV1>(() =>
    loadPreferences(),
  );
  const saveTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    applyThemeToDocument(preferences.theme);
    if (preferences.theme !== "system") {
      return;
    }
    return listenForSystemTheme(() => applyThemeToDocument("system"));
  }, [preferences.theme]);

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

  const setWindowBounds = useCallback(
    (window: WindowBoundsPreference) => {
      updatePreferences((prev) => ({ ...prev, window }));
    },
    [updatePreferences],
  );

  const value = useMemo(
    () => ({
      preferences,
      setVolume,
      setMuted,
      setTheme,
      setWindowBounds,
    }),
    [preferences, setVolume, setMuted, setTheme, setWindowBounds],
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
