import { safeParseJson } from "./storageUtils";

export const RECENT_VIDEOS_STORAGE_KEY = "floater.recentVideos.v1";
export const MAX_RECENT_VIDEOS = 20;

export type RecentVideoEntry = {
  videoId: string;
  url: string;
  addedAt: number;
  title?: string;
};

export type RecentVideosV1 = {
  version: 1;
  items: RecentVideoEntry[];
};

export function canonicalWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function normalizeEntry(raw: unknown): RecentVideoEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const entry = raw as Partial<RecentVideoEntry>;
  if (typeof entry.videoId !== "string" || entry.videoId.length === 0) {
    return null;
  }
  const url =
    typeof entry.url === "string" && entry.url.length > 0
      ? entry.url
      : canonicalWatchUrl(entry.videoId);
  return {
    videoId: entry.videoId,
    url,
    addedAt: typeof entry.addedAt === "number" ? entry.addedAt : Date.now(),
    ...(typeof entry.title === "string" && entry.title.length > 0
      ? { title: entry.title }
      : {}),
  };
}

export function loadRecentVideos(): RecentVideoEntry[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  const parsed = safeParseJson<RecentVideosV1>(
    localStorage.getItem(RECENT_VIDEOS_STORAGE_KEY),
  );
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.items)) {
    return [];
  }
  return parsed.items
    .map(normalizeEntry)
    .filter((entry): entry is RecentVideoEntry => entry !== null);
}

function persist(items: RecentVideoEntry[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  const payload: RecentVideosV1 = { version: 1, items };
  localStorage.setItem(RECENT_VIDEOS_STORAGE_KEY, JSON.stringify(payload));
}

export function addRecentVideo(entry: Omit<RecentVideoEntry, "addedAt"> & { addedAt?: number }): RecentVideoEntry[] {
  const nextEntry: RecentVideoEntry = {
    videoId: entry.videoId,
    url: entry.url,
    addedAt: entry.addedAt ?? Date.now(),
    ...(entry.title ? { title: entry.title } : {}),
  };
  const withoutDup = loadRecentVideos().filter((item) => item.videoId !== nextEntry.videoId);
  const items = [nextEntry, ...withoutDup].slice(0, MAX_RECENT_VIDEOS);
  persist(items);
  return items;
}

export function clearRecentVideos(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(RECENT_VIDEOS_STORAGE_KEY);
}

export function updateRecentVideoTitle(videoId: string, title: string): RecentVideoEntry[] {
  const items = loadRecentVideos().map((item) =>
    item.videoId === videoId ? { ...item, title } : item,
  );
  persist(items);
  return items;
}
