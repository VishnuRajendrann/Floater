import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AlwaysOnTopError,
  applyAlwaysOnTop,
  readNativeAlwaysOnTop,
} from "./windowPrefs";

const setAlwaysOnTop = vi.fn();
const isAlwaysOnTop = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: vi.fn(() => true),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    setAlwaysOnTop,
    isAlwaysOnTop,
  }),
}));

describe("applyAlwaysOnTop", () => {
  beforeEach(() => {
    setAlwaysOnTop.mockReset();
    isAlwaysOnTop.mockReset();
  });

  it("throws AlwaysOnTopError when the native call fails", async () => {
    setAlwaysOnTop.mockRejectedValue(new Error("denied"));

    await expect(applyAlwaysOnTop(true)).rejects.toBeInstanceOf(AlwaysOnTopError);
    expect(setAlwaysOnTop).toHaveBeenCalledWith(true);
  });

  it("resolves when the native call succeeds", async () => {
    setAlwaysOnTop.mockResolvedValue(undefined);

    await expect(applyAlwaysOnTop(false)).resolves.toBeUndefined();
    expect(setAlwaysOnTop).toHaveBeenCalledWith(false);
  });
});

describe("readNativeAlwaysOnTop", () => {
  beforeEach(() => {
    isAlwaysOnTop.mockReset();
  });

  it("returns the native flag when available", async () => {
    isAlwaysOnTop.mockResolvedValue(true);
    await expect(readNativeAlwaysOnTop()).resolves.toBe(true);
  });

  it("returns null when the native query fails", async () => {
    isAlwaysOnTop.mockRejectedValue(new Error("denied"));
    await expect(readNativeAlwaysOnTop()).resolves.toBeNull();
  });
});
