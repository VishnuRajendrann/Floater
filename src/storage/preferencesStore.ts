import { clampNumber, safeParseJson } from "./storageUtils";

export const PREFERENCES_STORAGE_KEY = "floater.preferences.v1";

export type ThemePreference = "dark" | "light" | "system";

export type WindowBoundsPreference = {
  width: number;
  height: number;
  x?: number;
  y?: number;
};

export type PreferencesV1 = {
  version: 1;
  volume: number;
  muted: boolean;
  theme: ThemePreference;
  window?: WindowBoundsPreference;
};

export const DEFAULT_PREFERENCES: PreferencesV1 = {
  version: 1,
  volume: 100,
  muted: false,
  theme: "system",
};

function normalizePreferences(raw: unknown): PreferencesV1 {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFERENCES };
  }
  const data = raw as Partial<PreferencesV1>;
  const window =
    data.window &&
    typeof data.window.width === "number" &&
    typeof data.window.height === "number"
      ? {
          width: clampNumber(data.window.width, 640, 4096, 960),
          height: clampNumber(data.window.height, 480, 4096, 640),
          ...(typeof data.window.x === "number" ? { x: data.window.x } : {}),
          ...(typeof data.window.y === "number" ? { y: data.window.y } : {}),
        }
      : undefined;

  const theme =
    data.theme === "dark" || data.theme === "light" || data.theme === "system"
      ? data.theme
      : DEFAULT_PREFERENCES.theme;

  return {
    version: 1,
    volume: clampNumber(data.volume, 0, 100, DEFAULT_PREFERENCES.volume),
    muted: typeof data.muted === "boolean" ? data.muted : DEFAULT_PREFERENCES.muted,
    theme,
    ...(window ? { window } : {}),
  };
}

export function loadPreferences(): PreferencesV1 {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_PREFERENCES };
  }
  const parsed = safeParseJson<{ version?: number }>(
    localStorage.getItem(PREFERENCES_STORAGE_KEY),
  );
  if (!parsed || parsed.version !== 1) {
    return { ...DEFAULT_PREFERENCES };
  }
  return normalizePreferences(parsed);
}

export function savePreferences(prefs: PreferencesV1): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
}
