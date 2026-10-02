import { describe, expect, it } from "vitest";
import { parseYoutubeUrl } from "./parseYoutubeUrl";

describe("parseYoutubeUrl", () => {
  it("parses watch URLs", () => {
    const result = parseYoutubeUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(result).toEqual({ ok: true, videoId: "dQw4w9WgXcQ" });
  });

  it("parses youtu.be URLs", () => {
    const result = parseYoutubeUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(result).toEqual({ ok: true, videoId: "dQw4w9WgXcQ" });
  });

  it("parses embed URLs", () => {
    const result = parseYoutubeUrl(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
    expect(result).toEqual({ ok: true, videoId: "dQw4w9WgXcQ" });
  });

  it("parses shorts URLs", () => {
    const result = parseYoutubeUrl(
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    );
    expect(result).toEqual({ ok: true, videoId: "dQw4w9WgXcQ" });
  });

  it("rejects empty input", () => {
    expect(parseYoutubeUrl("   ").ok).toBe(false);
  });

  it("rejects non-YouTube hosts", () => {
    const result = parseYoutubeUrl("https://example.com/watch?v=dQw4w9WgXcQ");
    expect(result).toEqual({ ok: false, code: "UNSUPPORTED_HOST" });
  });

  it("rejects invalid video IDs", () => {
    const result = parseYoutubeUrl("https://youtu.be/too-short");
    expect(result).toEqual({ ok: false, code: "INVALID_VIDEO_ID" });
  });
});
