import { describe, expect, it } from "vitest";
import { formatPlaybackQuality } from "./youtubePlaybackOptions";

describe("formatPlaybackQuality", () => {
  it("maps known YouTube quality levels", () => {
    expect(formatPlaybackQuality("hd720")).toBe("720p");
    expect(formatPlaybackQuality("auto")).toBe("Auto");
  });
});
