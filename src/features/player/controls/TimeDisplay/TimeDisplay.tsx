import { usePlayerProgress } from "../../../../state/player/playerContext";
import { formatTime } from "../../../../utils/formatTime";
import styles from "./TimeDisplay.module.css";

export function TimeDisplay() {
  const { currentTime, duration } = usePlayerProgress();
  return (
    <span className={styles.time}>
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  );
}
