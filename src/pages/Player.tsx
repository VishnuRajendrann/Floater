import { useEffect, useRef, type RefObject } from "react";
import { useApp } from "../app/AppShell";
import { ControlBar } from "../features/player/ControlBar";
import {
  KeyboardHelp,
  PlayerChromeToggle,
  PlayerErrorPanel,
  PlayerLoadingOverlay,
  PlayerWindowDragBand,
  YoutubePlayerHost,
} from "../features/player/playerChrome";
import {
  useImmersiveVideoPointer,
  usePlayerChromeVisibility,
  usePlayerKeyboardShortcuts,
} from "../features/player/playerHooks";
import { AlwaysOnTopToggle } from "../features/preferences/PreferencesToggles";
import { usePlayerDispatch, usePlayerMeta } from "../state/player/playerContext";
import { cn } from "../shared/ui";

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
          Floater
        </span>
        <div className="tauri-no-drag relative flex items-center gap-[var(--space-sm)]">
          <AlwaysOnTopToggle />
          <KeyboardHelp />
          <button
            type="button"
            className="border-0 bg-transparent px-[var(--space-sm)] py-[var(--space-xs)] text-accent hover:text-accent-hover"
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
