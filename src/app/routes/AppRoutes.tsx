import { useApp } from "../providers/AppProvider";
import { Home } from "../../pages/Home";
import { Player } from "../../pages/Player";

export function AppRoutes() {
  const { screen } = useApp();
  return screen === "player" ? <Player /> : <Home />;
}
