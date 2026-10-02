import { useEffect, useRef, type RefObject } from "react";
import { useApp } from "../../app/providers/AppProvider";
import { useImmersiveVideoPointer } from "../../features/player/hooks/useImmersiveVideoPointer";
import { usePlayerKeyboardShortcuts } from "../../features/player/hooks/usePlayerKeyboardShortcuts";
import { usePlayerChromeVisibility } from "../../features/player/hooks/usePlayerChromeVisibility";
import { ControlBar } from "../../features/player/components/ControlBar";
import { AlwaysOnTopToggle } from "../../features/preferences/AlwaysOnTopToggle";
import { KeyboardHelp } from "../../features/player/components/KeyboardHelp";
import { PlayerChromeToggle } from "../../features/player/components/PlayerChromeToggle";
import { PlayerWindowDragBand } from "../../features/player/components/PlayerWindowDragBand";
import { PlayerErrorPanel } from "../../features/player/components/PlayerErrorPanel";
import { PlayerLoadingOverlay } from "../../features/player/components/PlayerLoadingOverlay";
import { YoutubePlayerHost } from "../../features/player/components/YoutubePlayerHost";
import { usePlayerDispatch, usePlayerMeta } from "../../state/player/playerContext";
import styles from "./Player.module.css";

function useVideoAreaAspect(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      if (height > 0) {
        element.style.setProperty("--player-ar", String(width / height));
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}

export function Player() {
  const { goHome } = useApp();
  const { loadPhase } = usePlayerMeta();
  const dispatch = usePlayerDispatch();
  const shellRef = useRef<HTMLDivElement>(null);
  const videoAreaRef = useRef<HTMLDivElement>(null);
  const ready = loadPhase === "ready";
  const chrome = usePlayerChromeVisibility();
  const immersivePointer = useImmersiveVideoPointer({
    enabled: !chrome.controlsVisible && ready,
  });

  useVideoAreaAspect(videoAreaRef);
  usePlayerKeyboardShortcuts({ enabled: ready });

  const handleNewUrl = () => {
    dispatch({ type: "RESET" });
    goHome();
  };

  return (
    <div
      className={`${styles.page} ${chrome.controlsVisible ? "" : styles.pageImmersive}`}
    >
      <header
        className={`${styles.header} ${chrome.controlsVisible ? "" : styles.headerHidden}`}
        aria-hidden={!chrome.controlsVisible}
      >
        <span
          className={styles.brand}
          data-tauri-drag-region={chrome.controlsVisible ? true : undefined}
        >
          Floater
        </span>
        <div className={styles.headerActions}>
          <AlwaysOnTopToggle />
          <KeyboardHelp />
          <button type="button" className={styles.linkButton} onClick={handleNewUrl}>
            New URL
          </button>
        </div>
      </header>

      <div
        ref={shellRef}
        id="player-shell"
        className={styles.shell}
        onPointerEnter={chrome.onShellPointerEnter}
        onPointerLeave={chrome.onShellPointerLeave}
      >
        <div
          ref={videoAreaRef}
          className={styles.videoArea}
        >
          <YoutubePlayerHost />
          <PlayerLoadingOverlay />
          <PlayerErrorPanel onNewUrl={handleNewUrl} />
          {!chrome.controlsVisible ? (
            <div
              className={styles.immersiveShield}
              aria-hidden
              data-testid="player-immersive-shield"
              onPointerDown={immersivePointer.onShieldPointerDown}
              onPointerMove={immersivePointer.onShieldPointerMove}
              onPointerUp={immersivePointer.onShieldPointerUp}
              onPointerCancel={immersivePointer.onShieldPointerCancel}
            />
          ) : null}
          {!chrome.controlsVisible ? <PlayerWindowDragBand /> : null}
          <PlayerChromeToggle
            visible={chrome.revealerVisible || chrome.controlsVisible}
            active={chrome.controlsVisible}
            onToggle={chrome.toggleControls}
            onPointerEnter={chrome.onRevealerPointerEnter}
          />
        </div>
        <ControlBar
          shellRef={shellRef}
          visible={chrome.controlsVisible && ready}
          onPointerEnter={() => {}}
          onPointerLeave={() => {}}
          onPointerDown={() => {}}
          onPointerUp={() => {}}
        />
      </div>
    </div>
  );
}
