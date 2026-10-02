export type AppErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_URL"
  | "UNSUPPORTED_HOST"
  | "MISSING_VIDEO_ID"
  | "INVALID_VIDEO_ID"
  | "API_LOAD_FAILED"
  | "PLAYER_INIT_FAILED"
  | "VIDEO_NOT_FOUND"
  | "EMBED_NOT_ALLOWED"
  | "INVALID_PARAMETER"
  | "HTML5_ERROR"
  | "REFERRER_CONFIG"
  | "UNKNOWN";

export type AppError = {
  code: AppErrorCode;
  message: string;
  debug?: string;
};

export const USER_MESSAGES: Record<AppErrorCode, string> = {
  EMPTY_INPUT: "Enter a YouTube URL.",
  INVALID_URL: "That doesn't look like a valid URL.",
  UNSUPPORTED_HOST: "Only YouTube links are supported.",
  MISSING_VIDEO_ID: "Couldn't find a video ID in that link.",
  INVALID_VIDEO_ID: "That video ID isn't valid.",
  API_LOAD_FAILED:
    "Couldn't load the YouTube player. Check your connection and try again.",
  PLAYER_INIT_FAILED: "Couldn't start the player. Try again.",
  VIDEO_NOT_FOUND: "This video isn't available.",
  EMBED_NOT_ALLOWED: "This video can't be played inside Floater.",
  INVALID_PARAMETER: "This video link isn't valid.",
  HTML5_ERROR: "Playback failed in the embedded player.",
  REFERRER_CONFIG:
    "Player configuration error (Referer). See docs/phase1/youtube-webview-spike.md.",
  UNKNOWN: "Something went wrong. Try another video.",
};

export function createAppError(
  code: AppErrorCode,
  debug?: string,
): AppError {
  return {
    code,
    message: USER_MESSAGES[code],
    ...(debug ? { debug } : {}),
  };
}

const RETRYABLE_CODES: ReadonlySet<AppErrorCode> = new Set([
  "API_LOAD_FAILED",
  "PLAYER_INIT_FAILED",
  "HTML5_ERROR",
  "UNKNOWN",
]);

export function isRetryableError(code: AppErrorCode): boolean {
  return RETRYABLE_CODES.has(code);
}

export function errorCategoryHeadline(code: AppErrorCode): string {
  switch (code) {
    case "EMPTY_INPUT":
    case "INVALID_URL":
    case "UNSUPPORTED_HOST":
    case "MISSING_VIDEO_ID":
    case "INVALID_VIDEO_ID":
    case "INVALID_PARAMETER":
      return "Check the link";
    case "VIDEO_NOT_FOUND":
      return "Video unavailable";
    case "EMBED_NOT_ALLOWED":
      return "Cannot play here";
    case "API_LOAD_FAILED":
    case "HTML5_ERROR":
      return "Connection problem";
    case "REFERRER_CONFIG":
      return "Player configuration";
    case "PLAYER_INIT_FAILED":
      return "Player failed to start";
    default:
      return "Something went wrong";
  }
}
