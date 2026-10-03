import { usePlayerMeta } from "../../../state/player/playerContext";
import { usePlayerCommands } from "../context/PlayerCommandsContext";
import { PlayerControlButton } from "../../../shared/ui/PlayerControlButton";
import { IconMuted, IconVolume } from "./PlayerIcons";

type Props = { disabled?: boolean };

export function MuteButton({ disabled }: Props) {
  const { muted } = usePlayerMeta();
  const commands = usePlayerCommands();

  return (
    <PlayerControlButton
      active={muted}
      disabled={disabled}
      aria-label={muted ? "Unmute" : "Mute"}
      aria-pressed={muted}
      title={muted ? "Unmute (M)" : "Mute (M)"}
      onClick={() => commands.toggleMute()}
    >
      {muted ? <IconMuted /> : <IconVolume />}
    </PlayerControlButton>
  );
}
