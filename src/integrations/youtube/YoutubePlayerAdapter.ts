import { getEmbedOrigin } from "./getEmbedOrigin";
import type { AdapterEvents, YoutubePlayerInstance } from "./types";

export class YoutubePlayerAdapter {
  private player: YoutubePlayerInstance | null = null;
  private captionsEnabled = false;

  constructor(
    private mount: HTMLElement,
    private events: AdapterEvents,
  ) {}

  create(videoId: string): void {
    this.destroyPlayer();

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
        cc_load_policy: 0,
        iv_load_policy: 3,
        disablekb: 1,
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

  prepareCaptionsModule(): void {
    this.player?.loadModule?.("captions");
  }

  areCaptionsEnabled(): boolean {
    return this.captionsEnabled;
  }

  setCaptionsEnabled(enabled: boolean): boolean {
    const player = this.player;
    this.captionsEnabled = enabled;
    if (!player?.setOption) {
      return this.captionsEnabled;
    }
    if (enabled) {
      player.loadModule?.("captions");
      player.setOption("captions", "track", {
        languageCode: "en",
        kind: "captions",
      });
      return true;
    }
    player.setOption("captions", "track", {});
    player.unloadModule?.("captions");
    return false;
  }

  toggleCaptions(): boolean {
    return this.setCaptionsEnabled(!this.captionsEnabled);
  }

  getPlaybackRate(): number {
    return this.player?.getPlaybackRate?.() ?? 1;
  }

  setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate?.(rate);
  }

  getAvailablePlaybackRates(): number[] {
    return this.player?.getAvailablePlaybackRates?.() ?? [1];
  }

  getPlaybackQuality(): string {
    return this.player?.getPlaybackQuality?.() ?? "auto";
  }

  setPlaybackQuality(quality: string): void {
    this.player?.setPlaybackQuality?.(quality);
  }

  getAvailableQualityLevels(): string[] {
    return this.player?.getAvailableQualityLevels?.() ?? [];
  }

  private destroyPlayer(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }

  destroy(): void {
    this.captionsEnabled = false;
    this.destroyPlayer();
  }
}
