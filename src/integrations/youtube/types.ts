export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type YoutubePlayerState =
  (typeof YT_PLAYER_STATE)[keyof typeof YT_PLAYER_STATE];

export type YoutubePlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getPlaybackRate?: () => number;
  setPlaybackRate?: (rate: number) => void;
  getAvailablePlaybackRates?: () => number[];
  getPlaybackQuality?: () => string;
  setPlaybackQuality?: (quality: string) => void;
  getAvailableQualityLevels?: () => string[];
  loadModule?: (moduleName: string) => void;
  unloadModule?: (moduleName: string) => void;
  getOption?: (module: string, option: string) => unknown;
  setOption?: (module: string, option: string, value: unknown) => void;
  destroy: () => void;
};

export type YoutubePlayerConstructor = new (
  element: HTMLElement | string,
  options: YoutubePlayerOptions,
) => YoutubePlayerInstance;

export type YoutubePlayerOptions = {
  videoId?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: { target: YoutubePlayerInstance }) => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
};

export type YoutubeIframeApi = {
  Player: YoutubePlayerConstructor;
};

declare global {
  interface Window {
    YT?: YoutubeIframeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type AdapterEvents = {
  onReady: () => void;
  onStateChange: (state: number) => void;
  onError: (code: number) => void;
};
