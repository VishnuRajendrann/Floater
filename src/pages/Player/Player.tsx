import { useRef } from "react";
import { useApp } from "../../app/providers/AppProvider";
import { usePlayer } from "../../state/player/playerContext";
import { usePlayerKeyboardShortcuts } from "../../features/player/hooks/usePlayerKeyboardShortcuts";
import { ControlBar } from "../../features/player/components/ControlBar";
import { PlayerErrorPanel } from "../../features/player/components/PlayerErrorPanel";
import { PlayerLoadingOverlay } from "../../features/player/components/PlayerLoadingOverlay";
import { YoutubePlayerHost } from "../../features/player/components/YoutubePlayerHost";
import styles from "./Player.module.css";

export function Player() {
  const { goHome } = useApp();
  const { dispatch, state } = usePlayer();
  const shellRef = useRef<HTMLDivElement>(null);

  usePlayerKeyboardShortcuts(state.loadPhase === "ready");

  const handleNewUrl = () => {
    dispatch({ type: "RESET" });
    goHome();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Floater</span>
        <button type="button" className={styles.linkButton} onClick={handleNewUrl}>
          New URL
        </button>
      </header>

      <div ref={shellRef} id="player-shell" className={styles.shell}>
        <div className={styles.videoArea}>
          <YoutubePlayerHost />
          <PlayerLoadingOverlay />
          <PlayerErrorPanel onRetryHome={handleNewUrl} />
        </div>
        <ControlBar shellRef={shellRef} />
      </div>
    </div>
  );
}
