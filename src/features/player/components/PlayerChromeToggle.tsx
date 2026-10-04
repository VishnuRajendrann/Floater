import { cn } from "../../../shared/lib/cn";

type Props = {
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
}: Props) {
  return (
    <button
      type="button"
      className={cn(
        "ui-filled tauri-no-drag absolute top-[var(--space-sm)] right-[var(--space-sm)] z-30 flex h-9 w-9 items-center justify-center p-0 transition-[opacity,background] duration-200 ease-out motion-reduce:transition-none",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        active && "ring-2 ring-white",
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
