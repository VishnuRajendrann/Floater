import { createAppError, type AppError } from "../../types/errors";

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

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

function isAllowedYoutubeHost(hostname: string): boolean {
  return YOUTUBE_HOSTS.has(hostname.toLowerCase());
}

export type ParseFailureCode =
  | "EMPTY"
  | "INVALID_URL"
  | "UNSUPPORTED_HOST"
  | "MISSING_VIDEO_ID"
  | "INVALID_VIDEO_ID";

export type ParseSuccess = { ok: true; videoId: string };
export type ParseFailure = { ok: false; code: ParseFailureCode };
export type ParseResult = ParseSuccess | ParseFailure;

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
export const MAX_URL_INPUT_LENGTH = 2048;

function isValidVideoId(id: string): boolean {
  return VIDEO_ID_PATTERN.test(id);
}

function normalizeRawUrlInput(raw: string): string {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  if (value.startsWith("<") && value.endsWith(">")) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function extractFromPath(pathname: string, segment: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const index = parts.indexOf(segment);
  if (index === -1 || index + 1 >= parts.length) {
    return null;
  }
  return parts[index + 1] ?? null;
}

export function parseYoutubeUrl(raw: string): ParseResult {
  const input = normalizeRawUrlInput(raw);
  if (!input) {
    return { ok: false, code: "EMPTY" };
  }
  if (input.length > MAX_URL_INPUT_LENGTH) {
    return { ok: false, code: "INVALID_URL" };
  }

  let url: URL;
  try {
    url = new URL(input.includes("://") ? input : `https://${input}`);
  } catch {
    return { ok: false, code: "INVALID_URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, code: "INVALID_URL" };
  }

  if (!isAllowedYoutubeHost(url.hostname)) {
    return { ok: false, code: "UNSUPPORTED_HOST" };
  }

  let videoId: string | null = null;

  if (url.hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (url.pathname.startsWith("/watch")) {
    videoId = url.searchParams.get("v");
  } else if (url.pathname.startsWith("/embed/")) {
    videoId = extractFromPath(url.pathname, "embed");
  } else if (url.pathname.startsWith("/shorts/")) {
    videoId = extractFromPath(url.pathname, "shorts");
  } else if (url.pathname.startsWith("/v/")) {
    videoId = extractFromPath(url.pathname, "v");
  } else {
    return { ok: false, code: "UNSUPPORTED_HOST" };
  }

  if (!videoId) {
    return { ok: false, code: "MISSING_VIDEO_ID" };
  }

  videoId = videoId.split("&")[0] ?? videoId;

  if (!isValidVideoId(videoId)) {
    return { ok: false, code: "INVALID_VIDEO_ID" };
  }

  return { ok: true, videoId };
}

export function mapYoutubeErrorCode(code: number): AppError {
  switch (code) {
    case 2:
      return createAppError("INVALID_PARAMETER", `YT:${code}`);
    case 5:
      return createAppError("HTML5_ERROR", `YT:${code}`);
    case 100:
      return createAppError("VIDEO_NOT_FOUND", `YT:${code}`);
    case 101:
    case 150:
      return createAppError("EMBED_NOT_ALLOWED", `YT:${code}`);
    case 153:
      return createAppError("REFERRER_CONFIG", `YT:${code}`);
    default:
      return createAppError("UNKNOWN", `YT:${code}`);
  }
}

export function parseFailureToAppError(code: ParseFailureCode): AppError {
  const map = {
    EMPTY: "EMPTY_INPUT",
    INVALID_URL: "INVALID_URL",
    UNSUPPORTED_HOST: "UNSUPPORTED_HOST",
    MISSING_VIDEO_ID: "MISSING_VIDEO_ID",
    INVALID_VIDEO_ID: "INVALID_VIDEO_ID",
  } as const;
  return createAppError(map[code]);
}

const QUALITY_LABELS: Record<string, string> = {
  tiny: "144p",
  small: "240p",
  medium: "360p",
  large: "480p",
  hd720: "720p",
  hd1080: "1080p",
  highres: "1440p+",
  auto: "Auto",
};

export function formatPlaybackQuality(quality: string): string {
  return QUALITY_LABELS[quality] ?? quality;
}

export const DEFAULT_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function getEmbedOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:5173";
}
