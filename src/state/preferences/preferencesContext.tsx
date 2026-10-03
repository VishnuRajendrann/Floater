import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  type PreferencesV1,
  type ThemePreference,
  type WindowBoundsPreference,
} from "../../storage/preferencesStore";
import { applyThemeToDocument, listenForSystemTheme } from "./themeUtils";
import { useAlwaysOnTopPreference } from "./useAlwaysOnTopPreference";
import { useDebouncedPreferencesSave } from "./useDebouncedPreferencesSave";

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

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesV1>(() =>
    loadPreferences(),
  );
  const updatePreferences = useDebouncedPreferencesSave(setPreferences);
  const { alwaysOnTopEnabled, setAlwaysOnTop } = useAlwaysOnTopPreference({
    setPreferences,
    updatePreferences,
  });

  useEffect(() => {
    applyThemeToDocument(preferences.theme);
    if (preferences.theme !== "system") {
      return;
    }
    return listenForSystemTheme(() => applyThemeToDocument("system"));
  }, [preferences.theme]);

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
