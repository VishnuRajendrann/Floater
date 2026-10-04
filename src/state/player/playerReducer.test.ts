import { describe, expect, it } from "vitest";
import { createAppError } from "../../types/errors";
import { initialPlayerState, playerReducer } from "./playerContext";

describe("playerReducer", () => {
  it("loads a video", () => {
    const next = playerReducer(initialPlayerState, {
      type: "LOAD_STARTED",
      videoId: "dQw4w9WgXcQ",
    });
    expect(next.loadPhase).toBe("loadingApi");
    expect(next.videoId).toBe("dQw4w9WgXcQ");
  });

  it("marks ready and stores duration", () => {
    const loading = playerReducer(initialPlayerState, {
      type: "LOAD_STARTED",
      videoId: "dQw4w9WgXcQ",
    });
    const ready = playerReducer(loading, {
      type: "PLAYER_READY",
      duration: 120,
      volume: 80,
      muted: false,
    });
    expect(ready.loadPhase).toBe("ready");
    expect(ready.duration).toBe(120);
  });

  it("stores player errors", () => {
    const error = createAppError("VIDEO_NOT_FOUND");
    const next = playerReducer(initialPlayerState, {
      type: "PLAYER_ERROR",
      error,
    });
    expect(next.loadPhase).toBe("error");
    expect(next.error?.code).toBe("VIDEO_NOT_FOUND");
  });

  it("retries while keeping video id", () => {
    const errored = playerReducer(
      { ...initialPlayerState, videoId: "abc", loadGeneration: 2, loadPhase: "error" },
      { type: "RETRY" },
    );
    expect(errored.loadPhase).toBe("loadingApi");
    expect(errored.videoId).toBe("abc");
    expect(errored.loadGeneration).toBe(3);
  });
});
