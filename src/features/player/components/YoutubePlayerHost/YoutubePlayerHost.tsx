import { useApp } from "../../../../app/providers/AppProvider";
import { useYoutubePlayer } from "../../hooks/useYoutubePlayer";
import styles from "./YoutubePlayerHost.module.css";

export function YoutubePlayerHost() {
  const { videoId } = useApp();
  const mountRef = useYoutubePlayer(videoId);

  return (
    <div
      ref={mountRef}
      className={styles.host}
      aria-label="YouTube video player"
    />
  );
}
