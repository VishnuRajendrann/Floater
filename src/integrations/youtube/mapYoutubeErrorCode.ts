import { createAppError, type AppError } from "../../types/errors";
import type { ParseFailureCode } from "./parseYoutubeUrl";

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
