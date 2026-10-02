import { AppProvider } from "./providers/AppProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { PlayerCommandsProvider } from "../features/player/context/PlayerCommandsContext";
import { useWindowPersistence } from "../features/preferences/useWindowPersistence";
import { RecentVideosProvider } from "../features/recent-videos/recentVideosContext";
import { PlayerProvider } from "../state/player/playerContext";
import { PreferencesProvider } from "../state/preferences/preferencesContext";

function WindowPersistence() {
  useWindowPersistence();
  return null;
}

export default function App() {
  return (
    <PreferencesProvider>
      <RecentVideosProvider>
        <AppProvider>
          <PlayerProvider>
            <PlayerCommandsProvider>
              <WindowPersistence />
              <AppRoutes />
            </PlayerCommandsProvider>
          </PlayerProvider>
        </AppProvider>
      </RecentVideosProvider>
    </PreferencesProvider>
  );
}
