import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../app/AppShell";
import { resetIframeApiLoadState } from "../../integrations/youtube/youtubeRuntime";
import { PLAYER_SHORTCUT_LABELS } from "../../keyboard/playerShortcuts";
import { cn, PopoverPanel } from "../../shared/ui";
import { usePlayerDispatch, usePlayerMeta } from "../../state/player/playerContext";
import {
  errorCategoryHeadline,
  isRetryableError,
} from "../../types/errors";
import { useYoutubePlayer } from "./playerHooks";

type ChromeToggleProps = {
  visible: boolean;
  active: boolean;
  onToggle: () => void;
  onPointerEnter: () => void;
};

export function PlayerChromeToggle({
  visible,
  active,
  onToggle,
  onPointerEnter,
}: ChromeToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "tauri-no-drag absolute top-[var(--space-sm)] right-[var(--space-sm)] z-30 flex h-9 w-9 items-center justify-center rounded-md border border-white/35 bg-black/55 p-0 text-white transition-[opacity,background] duration-200 ease-out hover:bg-black/75 motion-reduce:transition-none",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        active && "border-accent bg-black/80",
      )}
      aria-label={
        active
          ? "Hide window and playback controls"
          : "Show window and playback controls"
      }
      aria-pressed={active}
      title={active ? "Hide controls" : "Show controls"}
      onClick={onToggle}
      onPointerEnter={onPointerEnter}
    >
      <svg
        className="h-[1.1rem] w-[1.1rem]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      </svg>
    </button>
  );
}

const MAX_RETRIES = 3;

type ErrorPanelProps = {
  onNewUrl: () => void;
};

export function PlayerErrorPanel({ onNewUrl }: ErrorPanelProps) {
  const { loadPhase, error } = usePlayerMeta();
  const dispatch = usePlayerDispatch();
  const panelRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (loadPhase === "error" && error) {
      panelRef.current?.focus();
    }
  }, [loadPhase, error]);

  if (loadPhase !== "error" || !error) {
    return null;
  }

  const retryExhausted = retryCount >= MAX_RETRIES;
  const canRetry = isRetryableError(error.code) && !retryExhausted;

  const handleRetry = () => {
    if (!canRetry) {
      return;
    }
    setRetryCount((count) => count + 1);
    resetIframeApiLoadState();
    dispatch({ type: "RETRY" });
  };

  return (
    <div
      ref={panelRef}
      className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-[var(--space-md)] bg-black/75 p-[var(--space-lg)] text-center text-white"
      role="alert"
      tabIndex={-1}
    >
      <h2 className="m-0 text-lg font-semibold">
        {errorCategoryHeadline(error.code)}
      </h2>
      <p className="m-0 max-w-sm leading-normal text-white/90">{error.message}</p>
      {retryExhausted ? (
        <p className="m-0 text-sm text-white/75">
          Still having trouble. Try another video or check your connection.
        </p>
      ) : null}
      {import.meta.env.DEV && error.debug ? (
        <details className="text-left text-xs text-white/65">
          <summary>Details</summary>
          <p>{error.debug}</p>
        </details>
      ) : null}
      <div className="flex flex-wrap justify-center gap-[var(--space-sm)]">
        {canRetry ? (
          <button
            type="button"
            className="rounded-md border-0 bg-accent px-4 py-2 font-semibold text-white"
            onClick={handleRetry}
          >
            Retry
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-md border border-white/35 bg-transparent px-4 py-2 text-white"
          onClick={onNewUrl}
        >
          New URL
        </button>
      </div>
    </div>
  );
}

type Anchor = { top: number; right: number };

export function KeyboardHelp() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const close = () => setOpen(false);

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setAnchor({
      top: rect.bottom + 4,
      right: Math.max(8, window.innerWidth - rect.right),
    });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="border-0 bg-transparent px-[var(--space-sm)] py-[var(--space-xs)] text-sm text-accent"
        aria-expanded={open}
        onClick={toggle}
      >
        Shortcuts
      </button>
      {open && anchor
        ? createPortal(
            <PopoverPanel
              className="fixed z-[80] min-w-56 rounded-md border border-border bg-surface-elevated p-[var(--space-md)] shadow-[0_8px_24px_rgb(0_0_0/0.35)]"
              closeClassName="w-full rounded-md border-0 bg-surface px-1.5 py-1.5 text-text"
              label="Keyboard shortcuts"
              onClose={close}
              style={{ top: anchor.top, right: anchor.right }}
            >
              <ul className="m-0 mb-[var(--space-sm)] grid list-none gap-[var(--space-sm)] p-0">
                {PLAYER_SHORTCUT_LABELS.map((item) => (
                  <li
                    key={item.keys}
                    className="flex items-center justify-between gap-[var(--space-md)] text-sm"
                  >
                    <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-[inherit]">
                      {item.keys}
                    </kbd>
                    <span>{item.description}</span>
                  </li>
                ))}
              </ul>
            </PopoverPanel>,
            document.body,
          )
        : null}
    </>
  );
}

export function PlayerLoadingOverlay() {
  const { loadPhase } = usePlayerMeta();
  const visible = loadPhase === "loadingApi" || loadPhase === "loadingPlayer";

  if (!visible) {
    return null;
  }

  const message =
    loadPhase === "loadingApi" ? "Connecting to YouTube…" : "Preparing video…";

  return (
    <div
      className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-[var(--space-md)] bg-black/55 text-white"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/25 border-t-white"
        aria-hidden
      />
      <p className="m-0 text-sm">{message}</p>
    </div>
  );
}

export function PlayerWindowDragBand() {
  return (
    <div
      className="tauri-drag absolute top-0 right-0 left-0 z-[15] h-5 cursor-grab active:cursor-grabbing"
      aria-hidden
      data-tauri-drag-region
    />
  );
}

export function YoutubePlayerHost() {
  const { videoId } = useApp();
  const mountRef = useYoutubePlayer(videoId);

  return (
    <div
      ref={mountRef}
      className="youtube-player-host"
      aria-label="YouTube video player"
    />
  );
}
