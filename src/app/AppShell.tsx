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
import { RecentVideosProvider, useRecentVideos } from "../features/home/homeScreen";
import { PlayerCommandsProvider } from "../features/player/PlayerCommandsContext";
import { applyAlwaysOnTop, ensureWindowVisible, restoreWindowBounds, watchWindowBounds } from "../integrations/tauri/windowPrefs";
import { Home } from "../pages/Home";
import { Player } from "../pages/Player";
import { canonicalWatchUrl } from "../storage/recentVideosStore";
import { loadPreferences } from "../storage/preferencesStore";
import { PlayerProvider } from "../state/player/playerContext";
import { PreferencesProvider, usePreferences } from "../state/preferences/preferencesContext";

export type AppScreen = "home" | "player";

type AppContextValue = {
  screen: AppScreen;
  videoId: string | null;
  loadVideo: (videoId: string, url?: string) => void;
  goHome: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function AppProvider({ children }: { children: ReactNode }) {
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

function useWindowPersistence() {
  const { setWindowBounds } = usePreferences();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }
    restoredRef.current = true;
    const prefs = loadPreferences();
    void (async () => {
      await ensureWindowVisible();
      try {
        await restoreWindowBounds(prefs.window);
      } catch {
        // Window restore is best-effort; invalid bounds should not crash the app.
      }
      await ensureWindowVisible();
    })();
  }, []);

  useEffect(() => {
    return watchWindowBounds(setWindowBounds);
  }, [setWindowBounds]);
}

function useAlwaysOnTopSync() {
  const { alwaysOnTopEnabled } = usePreferences();

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!alwaysOnTopEnabled) {
        return;
      }
      void applyAlwaysOnTop(true).catch(() => {
        // Fullscreen transitions can briefly reject window ops; dev logs in windowPrefs.
      });
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [alwaysOnTopEnabled]);
}

function WindowPersistence() {
  useWindowPersistence();
  return null;
}

function AlwaysOnTopSync() {
  useAlwaysOnTopSync();
  return null;
}

function AppRoutes() {
  const { screen } = useApp();
  return (
    <div className="floater-screen flex min-h-0 flex-1 flex-col">
      {screen === "player" ? <Player /> : <Home />}
    </div>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <RecentVideosProvider>
        <AppProvider>
          <PlayerProvider>
            <PlayerCommandsProvider>
              <WindowPersistence />
              <AlwaysOnTopSync />
              <AppRoutes />
            </PlayerCommandsProvider>
          </PlayerProvider>
        </AppProvider>
      </RecentVideosProvider>
    </PreferencesProvider>
  );
}
