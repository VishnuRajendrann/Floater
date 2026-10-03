import {
  usePlayerDispatch,
  usePlayerMeta,
} from "../../../state/player/playerContext";
import { usePlayerCommands } from "../context/PlayerCommandsContext";

type Props = { disabled?: boolean };

export function VolumeSlider({ disabled }: Props) {
  const { volume, muted } = usePlayerMeta();
  const dispatch = usePlayerDispatch();
  const commands = usePlayerCommands();

  return (
    <input
      className="control-bar-range volumeControl w-20 max-[720px]:hidden"
      type="range"
      min={0}
      max={100}
      value={muted ? 0 : volume}
      disabled={disabled}
      aria-label="Volume"
      onChange={(event) => {
        const nextVolume = Number(event.target.value);
        commands.setVolume(nextVolume);
        dispatch({ type: "SET_VOLUME", volume: nextVolume });
      }}
    />
  );
}
