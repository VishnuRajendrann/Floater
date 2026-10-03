import { useEffect, useRef, type RefObject } from "react";
import { useApp } from "../app/providers/AppProvider";
import { useImmersiveVideoPointer } from "../features/player/hooks/useImmersiveVideoPointer";
import { usePlayerKeyboardShortcuts } from "../features/player/hooks/usePlayerKeyboardShortcuts";
import { usePlayerChromeVisibility } from "../features/player/hooks/usePlayerChromeVisibility";
import { ControlBar } from "../features/player/components/ControlBar";
import { AlwaysOnTopToggle } from "../features/preferences/AlwaysOnTopToggle";
import { KeyboardHelp } from "../features/player/components/KeyboardHelp";
import { PlayerChromeToggle } from "../features/player/components/PlayerChromeToggle";
import { PlayerWindowDragBand } from "../features/player/components/PlayerWindowDragBand";
import { PlayerErrorPanel } from "../features/player/components/PlayerErrorPanel";
import { PlayerLoadingOverlay } from "../features/player/components/PlayerLoadingOverlay";
import { YoutubePlayerHost } from "../features/player/components/YoutubePlayerHost";
import { usePlayerDispatch, usePlayerMeta } from "../state/player/playerContext";
import { cn } from "../shared/lib/cn";

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
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden bg-bg",
        !chrome.controlsVisible && "bg-black",
      )}
    >
      <header
        className={cn(
          "player-header-transition relative z-10 flex max-h-16 shrink-0 items-center justify-between overflow-hidden border-b border-border px-[var(--space-lg)] py-[var(--space-md)] transition-[opacity,max-height,padding] duration-200 ease-out",
          !chrome.controlsVisible &&
            "pointer-events-none max-h-0 border-b-0 py-0 opacity-0",
        )}
        aria-hidden={!chrome.controlsVisible}
      >
        <span
          className="font-semibold tracking-tight"
          data-tauri-drag-region={chrome.controlsVisible ? true : undefined}
        >
          Fl<span className="text-accent">o</span>ater
        </span>
        <div className="tauri-no-drag relative flex items-center gap-[var(--space-sm)]">
          <AlwaysOnTopToggle />
          <KeyboardHelp />
          <button
            type="button"
            className="ui-filled px-[var(--space-sm)] py-[var(--space-xs)] text-sm"
            onClick={handleNewUrl}
          >
            New URL
          </button>
        </div>
      </header>

      <div
        ref={shellRef}
        id="player-shell"
        className="flex min-h-0 flex-1 flex-col bg-black fullscreen:bg-black"
        onPointerEnter={chrome.onShellPointerEnter}
        onPointerLeave={chrome.onShellPointerLeave}
      >
        <div
          ref={videoAreaRef}
          className="relative min-h-0 w-full flex-1 overflow-hidden bg-black fullscreen:flex-1"
        >
          <YoutubePlayerHost />
          <PlayerLoadingOverlay />
          <PlayerErrorPanel onNewUrl={handleNewUrl} />
          {!chrome.controlsVisible ? (
            <div
              className="tauri-no-drag absolute inset-0 z-[12] cursor-pointer touch-none bg-transparent"
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
        <ControlBar shellRef={shellRef} visible={chrome.controlsVisible && ready} />
      </div>
    </div>
  );
}
