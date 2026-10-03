import { usePlayerProgress } from "../../../../state/player/playerContext";
import { formatTime } from "../../../../utils/formatTime";

export function TimeDisplay() {
  const { currentTime, duration } = usePlayerProgress();
  return (
    <span className="min-w-[6.5rem] text-xs whitespace-nowrap text-text-muted">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  );
}
