import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  addRecentVideo,
  clearRecentVideos,
  loadRecentVideos,
  MAX_RECENT_VIDEOS,
} from "./recentVideosStore";

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

describe("recentVideosStore", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    clearRecentVideos();
  });

  it("dedupes and moves to top", () => {
    addRecentVideo({ videoId: "a", url: "https://www.youtube.com/watch?v=a" });
    addRecentVideo({ videoId: "b", url: "https://www.youtube.com/watch?v=b" });
    addRecentVideo({ videoId: "a", url: "https://www.youtube.com/watch?v=a" });
    const items = loadRecentVideos();
    expect(items).toHaveLength(2);
    expect(items[0]?.videoId).toBe("a");
  });

  it("caps history size", () => {
    for (let i = 0; i < MAX_RECENT_VIDEOS + 5; i += 1) {
      addRecentVideo({
        videoId: `id${i}`,
        url: `https://www.youtube.com/watch?v=id${i}`,
      });
    }
    expect(loadRecentVideos()).toHaveLength(MAX_RECENT_VIDEOS);
  });
});
