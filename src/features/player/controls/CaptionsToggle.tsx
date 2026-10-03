import { useState } from "react";
import { usePlayerCommands } from "../context/PlayerCommandsContext";
import { PlayerControlButton } from "../../../shared/ui/PlayerControlButton";
import { IconCaptions } from "./PlayerIcons";

type Props = { disabled?: boolean };

export function CaptionsToggle({ disabled }: Props) {
  const commands = usePlayerCommands();
  const [enabled, setEnabled] = useState(false);

  return (
    <PlayerControlButton
      active={enabled}
      disabled={disabled}
      aria-label={enabled ? "Turn off captions" : "Turn on captions"}
      aria-pressed={enabled}
      title={enabled ? "Captions on" : "Captions off"}
      onClick={() => {
        const next = commands.toggleCaptions();
        setEnabled(next);
      }}
    >
      <IconCaptions />
    </PlayerControlButton>
  );
}
