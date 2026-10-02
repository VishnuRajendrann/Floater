import { useRef } from "react";
import { YT_PLAYER_STATE } from "../../integrations/youtube/types";
import { useApp } from "../../app/providers/AppProvider";
import {
  useControlBarAutoHide,
  useIsPlayerPaused,
} from "../../features/player/hooks/useControlBarAutoHide";
import { usePlayerKeyboardShortcuts } from "../../features/player/hooks/usePlayerKeyboardShortcuts";
import { ControlBar } from "../../features/player/components/ControlBar";
import { KeyboardHelp } from "../../features/player/components/KeyboardHelp";
import { PlayerErrorPanel } from "../../features/player/components/PlayerErrorPanel";
import { PlayerLoadingOverlay } from "../../features/player/components/PlayerLoadingOverlay";
import { YoutubePlayerHost } from "../../features/player/components/YoutubePlayerHost";
import { usePlayerDispatch, usePlayerMeta } from "../../state/player/playerContext";
import styles from "./Player.module.css";

export function Player() {
  const { goHome } = useApp();
  const { loadPhase, ytState } = usePlayerMeta();
  const dispatch = usePlayerDispatch();
  const shellRef = useRef<HTMLDivElement>(null);
  const paused = useIsPlayerPaused(ytState);
  const ready = loadPhase === "ready";

  const autoHide = useControlBarAutoHide({
    shellRef,
    paused: paused || ytState === YT_PLAYER_STATE.UNSTARTED,
    enabled: ready,
  });

  usePlayerKeyboardShortcuts({
    enabled: ready,
    onActivity: autoHide.onShortcutActivity,
  });

  const handleNewUrl = () => {
    dispatch({ type: "RESET" });
    goHome();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Floater</span>
        <div className={styles.headerActions}>
          <KeyboardHelp />
          <button type="button" className={styles.linkButton} onClick={handleNewUrl}>
            New URL
          </button>
        </div>
      </header>

      <div ref={shellRef} id="player-shell" className={styles.shell}>
        <div className={styles.videoArea}>
          <YoutubePlayerHost />
          <PlayerLoadingOverlay />
          <PlayerErrorPanel onNewUrl={handleNewUrl} />
        </div>
        <ControlBar
          shellRef={shellRef}
          visible={autoHide.visible}
          onPointerEnter={autoHide.onBarPointerEnter}
          onPointerLeave={autoHide.onBarPointerLeave}
          onPointerDown={autoHide.onBarPointerDown}
          onPointerUp={autoHide.onBarPointerUp}
        />
      </div>
    </div>
  );
}
