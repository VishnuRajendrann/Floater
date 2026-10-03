import {
  usePlayerDispatch,
  usePlayerProgress,
} from "../../../state/player/playerContext";
import { usePlayerCommands } from "../context/PlayerCommandsContext";

type Props = { disabled?: boolean };

export function SeekBar({ disabled }: Props) {
  const { currentTime, duration, isSeeking } = usePlayerProgress();
  const dispatch = usePlayerDispatch();
  const commands = usePlayerCommands();
  const max = Math.max(duration, 0);

  return (
    <input
      className="control-bar-range min-w-16 flex-1"
      type="range"
      min={0}
      max={max}
      step={0.1}
      value={Math.min(currentTime, max)}
      disabled={disabled || max <= 0}
      aria-label="Seek"
      aria-valuetext={`${Math.floor(currentTime)} seconds`}
      onPointerDown={() => dispatch({ type: "SEEK_START" })}
      onChange={(event) => {
        const value = Number(event.target.value);
        commands.seekTo(value);
        dispatch({ type: "SEEK_END", currentTime: value });
      }}
      onPointerUp={() => {
        if (isSeeking) {
          dispatch({ type: "SEEK_END", currentTime });
        }
      }}
    />
  );
}
