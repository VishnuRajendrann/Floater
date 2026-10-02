import { AppProvider } from "./providers/AppProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { PlayerCommandsProvider } from "../features/player/context/PlayerCommandsContext";
import { PlayerProvider } from "../state/player/playerContext";

export default function App() {
  return (
    <AppProvider>
      <PlayerProvider>
        <PlayerCommandsProvider>
          <AppRoutes />
        </PlayerCommandsProvider>
      </PlayerProvider>
    </AppProvider>
  );
}
