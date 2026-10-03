import { useApp } from "../providers/AppProvider";
import { Home } from "../../pages/Home";
import { Player } from "../../pages/Player";

export function AppRoutes() {
  const { screen } = useApp();
  return (
    <div className="floater-screen flex min-h-0 flex-1 flex-col">
      {screen === "player" ? <Player /> : <Home />}
    </div>
  );
}
