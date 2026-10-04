import type { RefObject } from "react";
import { cn } from "../../shared/ui";
import { usePlayerMeta } from "../../state/player/playerContext";
import {
  CaptionsToggle,
  FullscreenButton,
  MuteButton,
  PlayPauseButton,
  SeekBar,
  TimeDisplay,
  VolumeSlider,
} from "./playerControls";
import { PlayerSettingsMenu } from "./PlayerSettingsMenu";

type Props = {
  shellRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
};

export function ControlBar({ shellRef, visible }: Props) {
  const { loadPhase } = usePlayerMeta();
  const disabled = loadPhase !== "ready";

  return (
    <div
      className={cn(
        "tauri-no-drag relative z-[25] flex min-h-[var(--control-bar-height)] shrink-0 flex-wrap items-center gap-[var(--space-sm)] border-t border-white/10 bg-gradient-to-t from-black/85 to-black/55 px-[var(--space-md)] transition-opacity duration-200 ease-out",
        !visible &&
          "pointer-events-none h-0 min-h-0 overflow-hidden border-t-0 p-0 opacity-0",
      )}
    >
      <PlayPauseButton disabled={disabled} />
      <TimeDisplay />
      <SeekBar disabled={disabled} />
      <VolumeSlider disabled={disabled} />
      <MuteButton disabled={disabled} />
      <CaptionsToggle disabled={disabled} />
      <PlayerSettingsMenu disabled={disabled} />
      <FullscreenButton shellRef={shellRef} disabled={disabled} />
    </div>
  );
}
