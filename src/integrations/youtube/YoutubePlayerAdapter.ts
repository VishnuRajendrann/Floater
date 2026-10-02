import { getEmbedOrigin } from "./getEmbedOrigin";
import type { AdapterEvents, YoutubePlayerInstance } from "./types";

export class YoutubePlayerAdapter {
  private player: YoutubePlayerInstance | null = null;

  constructor(
    private mount: HTMLElement,
    private events: AdapterEvents,
  ) {}

  create(videoId: string): void {
    this.destroy();

    if (!window.YT?.Player) {
      throw new Error("YouTube IFrame API is not loaded");
    }

    this.player = new window.YT.Player(this.mount, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        enablejsapi: 1,
        origin: getEmbedOrigin(),
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        controls: 0,
        fs: 0,
        autoplay: 0,
      },
      events: {
        onReady: () => this.events.onReady(),
        onStateChange: (event) => this.events.onStateChange(event.data),
        onError: (event) => this.events.onError(event.data),
      },
    });
  }

  play(): void {
    this.player?.playVideo();
  }

  pause(): void {
    this.player?.pauseVideo();
  }

  seekTo(seconds: number, allowSeekAhead = true): void {
    this.player?.seekTo(seconds, allowSeekAhead);
  }

  setVolume(volume: number): void {
    this.player?.setVolume(Math.max(0, Math.min(100, volume)));
  }

  mute(): void {
    this.player?.mute();
  }

  unmute(): void {
    this.player?.unMute();
  }

  isMuted(): boolean {
    return this.player?.isMuted() ?? false;
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  getDuration(): number {
    return this.player?.getDuration() ?? 0;
  }

  getPlayerState(): number {
    return this.player?.getPlayerState() ?? -1;
  }

  destroy(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}
