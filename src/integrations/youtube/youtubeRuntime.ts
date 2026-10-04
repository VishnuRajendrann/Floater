import { getEmbedOrigin, type AdapterEvents, type YoutubePlayerInstance } from "./youtubeCore";

const SCRIPT_ID = "floater-youtube-iframe-api";
const LOAD_TIMEOUT_MS = 15_000;

let loadPromise: Promise<void> | null = null;

function waitForYoutubeApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.YT?.Player) {
        resolve();
        return;
      }
      if (Date.now() - started > LOAD_TIMEOUT_MS) {
        reject(new Error("YouTube IFrame API load timeout"));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

export function loadIframeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      waitForYoutubeApi().then(resolve).catch(reject);
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load YouTube IFrame API script"));
    };

    document.body.appendChild(script);

    window.setTimeout(() => {
      if (!window.YT?.Player) {
        loadPromise = null;
        reject(new Error("YouTube IFrame API load timeout"));
      }
    }, LOAD_TIMEOUT_MS);
  });

  return loadPromise;
}

/** Allows a failed load attempt to be retried (e.g. after network error). */
export function resetIframeApiLoadState(): void {
  loadPromise = null;
}

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

export async function fetchVideoTitle(url: string): Promise<string | null> {
  try {
    const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { title?: string };
    return typeof data.title === "string" && data.title.length > 0
      ? data.title
      : null;
  } catch {
    return null;
  }
}
