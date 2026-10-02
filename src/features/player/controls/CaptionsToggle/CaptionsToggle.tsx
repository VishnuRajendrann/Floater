import { useState } from "react";
import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import { IconCaptions } from "../PlayerIcons";
import styles from "./CaptionsToggle.module.css";

type Props = { disabled?: boolean };

export function CaptionsToggle({ disabled }: Props) {
  const commands = usePlayerCommands();
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      type="button"
      className={`${styles.button} ${enabled ? styles.active : ""}`}
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
    </button>
  );
}
