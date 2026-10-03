import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addRecentVideo,
  clearRecentVideos,
  loadRecentVideos,
  updateRecentVideoTitle,
  type RecentVideoEntry,
} from "../../storage/recentVideosStore";
import { fetchVideoTitle } from "../../integrations/youtube/fetchVideoTitle";

type RecentVideosContextValue = {
  items: RecentVideoEntry[];
  recordVideo: (videoId: string, url: string) => void;
  clearHistory: () => void;
};

const RecentVideosContext = createContext<RecentVideosContextValue | null>(null);

export function RecentVideosProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecentVideoEntry[]>(() => loadRecentVideos());

  const recordVideo = useCallback((videoId: string, url: string) => {
    const next = addRecentVideo({ videoId, url });
    setItems(next);
    void fetchVideoTitle(url).then((title) => {
      if (!title) {
        return;
      }
      setItems(updateRecentVideoTitle(videoId, title));
    });
  }, []);

  const clearHistory = useCallback(() => {
    clearRecentVideos();
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({ items, recordVideo, clearHistory }),
    [items, recordVideo, clearHistory],
  );

  return (
    <RecentVideosContext.Provider value={value}>
      {children}
    </RecentVideosContext.Provider>
  );
}

export function useRecentVideos(): RecentVideosContextValue {
  const ctx = useContext(RecentVideosContext);
  if (!ctx) {
    throw new Error("useRecentVideos must be used within RecentVideosProvider");
  }
  return ctx;
}
