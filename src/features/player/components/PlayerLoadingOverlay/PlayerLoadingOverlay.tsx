import { usePlayerMeta } from "../../../../state/player/playerContext";
import styles from "./PlayerLoadingOverlay.module.css";

export function PlayerLoadingOverlay() {
  const { loadPhase } = usePlayerMeta();
  const visible =
    loadPhase === "loadingApi" || loadPhase === "loadingPlayer";

  if (!visible) {
    return null;
  }

  const message =
    loadPhase === "loadingApi"
      ? "Connecting to YouTube…"
      : "Preparing video…";

  return (
    <div className={styles.overlay} aria-live="polite">
      <div className={styles.spinner} />
      <p>{message}</p>
    </div>
  );
}
