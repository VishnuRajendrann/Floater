import { describe, expect, it } from "vitest";
import { isRetryableError } from "../types/errors";

describe("isRetryableError", () => {
  it("allows retry for api failures", () => {
    expect(isRetryableError("API_LOAD_FAILED")).toBe(true);
  });

  it("disallows retry for embed restrictions", () => {
    expect(isRetryableError("EMBED_NOT_ALLOWED")).toBe(false);
  });
});
