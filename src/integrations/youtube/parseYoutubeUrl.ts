import { isAllowedYoutubeHost } from "../../utils/youtubeHosts";

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
