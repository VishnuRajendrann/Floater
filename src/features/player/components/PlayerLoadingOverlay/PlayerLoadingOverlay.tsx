import { usePlayer } from "../../../../state/player/playerContext";
import styles from "./PlayerLoadingOverlay.module.css";

export function PlayerLoadingOverlay() {
  const { state } = usePlayer();
  const visible =
    state.loadPhase === "loadingApi" || state.loadPhase === "loadingPlayer";

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.overlay} aria-live="polite">
      <div className={styles.spinner} />
      <p>Loading player…</p>
    </div>
  );
}
