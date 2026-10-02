import { usePlayerMeta } from "../../../../state/player/playerContext";
import { YT_PLAYER_STATE } from "../../../../integrations/youtube/types";
import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import { IconPause, IconPlay } from "../PlayerIcons";
import styles from "./PlayPauseButton.module.css";

type Props = { disabled?: boolean };

export function PlayPauseButton({ disabled }: Props) {
  const { ytState } = usePlayerMeta();
  const commands = usePlayerCommands();
  const playing = ytState === YT_PLAYER_STATE.PLAYING;

  return (
    <button
      type="button"
      className={styles.button}
      disabled={disabled}
      aria-label={playing ? "Pause" : "Play"}
      title={playing ? "Pause (Space)" : "Play (Space)"}
      onClick={() => (playing ? commands.pause() : commands.play())}
    >
      {playing ? <IconPause /> : <IconPlay />}
    </button>
  );
}
