import { usePlayerMeta } from "../../../../state/player/playerContext";
import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import { IconMuted, IconVolume } from "../PlayerIcons";
import { cn } from "../../../../lib/cn";

type Props = { disabled?: boolean };

export function MuteButton({ disabled }: Props) {
  const { muted } = usePlayerMeta();
  const commands = usePlayerCommands();

  return (
    <button
      type="button"
      className={cn("player-control-btn", muted && "player-control-btn-active")}
      disabled={disabled}
      aria-label={muted ? "Unmute" : "Mute"}
      aria-pressed={muted}
      title={muted ? "Unmute (M)" : "Mute (M)"}
      onClick={() => commands.toggleMute()}
    >
      {muted ? <IconMuted /> : <IconVolume />}
    </button>
  );
}
