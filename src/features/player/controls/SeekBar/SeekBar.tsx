import { usePlayer } from "../../../../state/player/playerContext";
import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import styles from "./SeekBar.module.css";

type Props = { disabled?: boolean };

export function SeekBar({ disabled }: Props) {
  const { state, dispatch } = usePlayer();
  const commands = usePlayerCommands();
  const max = Math.max(state.duration, 0);

  return (
    <input
      className={styles.seek}
      type="range"
      min={0}
      max={max}
      step={0.1}
      value={Math.min(state.currentTime, max)}
      disabled={disabled || max <= 0}
      aria-label="Seek"
      onPointerDown={() => dispatch({ type: "SEEK_START" })}
      onChange={(event) => {
        const value = Number(event.target.value);
        commands.seekTo(value);
        dispatch({ type: "SEEK_END", currentTime: value });
      }}
    />
  );
}
