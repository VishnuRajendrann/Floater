import { useApp } from "../../../app/providers/AppProvider";
import { useYoutubePlayer } from "../hooks/useYoutubePlayer";

export function YoutubePlayerHost() {
  const { videoId } = useApp();
  const mountRef = useYoutubePlayer(videoId);

  return (
    <div
      ref={mountRef}
      className="youtube-player-host"
      aria-label="YouTube video player"
    />
  );
}
