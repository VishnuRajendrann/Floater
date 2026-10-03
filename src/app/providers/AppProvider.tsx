import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { canonicalWatchUrl } from "../../storage/recentVideosStore";
import { useRecentVideos } from "../../features/home/recentVideosContext";

export type AppScreen = "home" | "player";

type AppContextValue = {
  screen: AppScreen;
  videoId: string | null;
  loadVideo: (videoId: string, url?: string) => void;
  goHome: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [videoId, setVideoId] = useState<string | null>(null);
  const { recordVideo } = useRecentVideos();

  const loadVideo = useCallback(
    (id: string, url?: string) => {
      const resolvedUrl = url ?? canonicalWatchUrl(id);
      recordVideo(id, resolvedUrl);
      setVideoId(id);
      setScreen("player");
    },
    [recordVideo],
  );

  const goHome = useCallback(() => {
    setScreen("home");
    setVideoId(null);
  }, []);

  const value = useMemo(
    () => ({ screen, videoId, loadVideo, goHome }),
    [screen, videoId, loadVideo, goHome],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
