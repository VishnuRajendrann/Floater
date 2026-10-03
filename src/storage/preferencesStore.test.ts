import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  PREFERENCES_STORAGE_KEY,
} from "./preferencesStore";

type MemoryStorage = Storage & { store: Record<string, string> };

function createMemoryStorage(): MemoryStorage {
  const store: Record<string, string> = {};
  return {
    store,
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
  };
}

describe("preferencesStore", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  it("returns defaults when storage is empty", () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("clamps invalid volume", () => {
    savePreferences({ ...DEFAULT_PREFERENCES, volume: 999 });
    expect(loadPreferences().volume).toBe(100);
  });

  it("resets on invalid version", () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("ignores malformed JSON", () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, "{not json");
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("defaults always on top to off", () => {
    expect(loadPreferences().alwaysOnTop).toBe(false);
  });

  it("persists always on top", () => {
    savePreferences({ ...DEFAULT_PREFERENCES, alwaysOnTop: true });
    expect(loadPreferences().alwaysOnTop).toBe(true);
  });

  it("treats a missing always on top field as off", () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ version: 1, volume: 40, muted: true, theme: "dark" }),
    );
    expect(loadPreferences().alwaysOnTop).toBe(false);
  });

  it("clamps saved window size to allowed minimums", () => {
    savePreferences({
      ...DEFAULT_PREFERENCES,
      window: { width: 50, height: 40 },
    });
    expect(loadPreferences().window).toEqual({
      width: 200,
      height: 100,
    });
  });
});
