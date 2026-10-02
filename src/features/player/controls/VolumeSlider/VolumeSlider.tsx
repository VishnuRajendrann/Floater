import { usePlayer } from "../../../../state/player/playerContext";
import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import styles from "./VolumeSlider.module.css";

type Props = { disabled?: boolean };

export function VolumeSlider({ disabled }: Props) {
  const { state, dispatch } = usePlayer();
  const commands = usePlayerCommands();

  return (
    <input
      className={styles.volume}
      type="range"
      min={0}
      max={100}
      value={state.muted ? 0 : state.volume}
      disabled={disabled}
      aria-label="Volume"
      onChange={(event) => {
        const volume = Number(event.target.value);
        commands.setVolume(volume);
        dispatch({ type: "SET_VOLUME", volume });
      }}
    />
  );
}
