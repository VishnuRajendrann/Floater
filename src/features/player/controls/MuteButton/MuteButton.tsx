import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import styles from "./MuteButton.module.css";

type Props = { disabled?: boolean };

export function MuteButton({ disabled }: Props) {
  const commands = usePlayerCommands();

  return (
    <button
      type="button"
      className={styles.button}
      disabled={disabled}
      aria-label="Mute"
      onClick={() => commands.toggleMute()}
    >
      M
    </button>
  );
}
