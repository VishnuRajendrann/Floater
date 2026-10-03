import { usePlayerMeta } from "../../../state/player/playerContext";

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
