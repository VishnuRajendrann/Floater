import { getEmbedOrigin } from "./getEmbedOrigin";
import type { AdapterEvents, YoutubePlayerInstance } from "./types";

export class YoutubePlayerAdapter {
  private player: YoutubePlayerInstance | null = null;

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
    const track = this.player?.getOption?.("captions", "track");
    if (!track || typeof track !== "object") {
      return false;
    }
    return Object.keys(track as object).length > 0;
  }

  toggleCaptions(): boolean {
    this.prepareCaptionsModule();
    const player = this.player;
    if (!player?.setOption) {
      return false;
    }
    if (this.areCaptionsEnabled()) {
      player.setOption("captions", "track", {});
      return false;
    }
    player.setOption("captions", "track", {
      languageCode: "en",
      kind: "captions",
    });
    return true;
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
    this.destroyPlayer();
  }
}
