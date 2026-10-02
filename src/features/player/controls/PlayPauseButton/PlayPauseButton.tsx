import { usePlayer } from "../../../../state/player/playerContext";
import { YT_PLAYER_STATE } from "../../../../integrations/youtube/types";
import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import styles from "./PlayPauseButton.module.css";

type Props = { disabled?: boolean };

export function PlayPauseButton({ disabled }: Props) {
  const { state } = usePlayer();
  const commands = usePlayerCommands();
  const playing = state.ytState === YT_PLAYER_STATE.PLAYING;

  return (
    <button
      type="button"
      className={styles.button}
      disabled={disabled}
      aria-label={playing ? "Pause" : "Play"}
      onClick={() => (playing ? commands.pause() : commands.play())}
    >
      {playing ? "❚❚" : "▶"}
    </button>
  );
}
