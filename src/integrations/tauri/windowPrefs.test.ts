import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AlwaysOnTopError,
  applyAlwaysOnTop,
  readNativeAlwaysOnTop,
} from "./windowPrefs";

const { setAlwaysOnTop, isAlwaysOnTop, setSize, logicalSize } = vi.hoisted(() => {
  const logicalSize = { width: 1100, height: 720 };
  const setSize = vi.fn(async (size: { width: number; height: number }) => {
    logicalSize.width = size.width;
    logicalSize.height = size.height;
  });
  const setAlwaysOnTop = vi.fn();
  const isAlwaysOnTop = vi.fn();
  return { setAlwaysOnTop, isAlwaysOnTop, setSize, logicalSize };
});

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: vi.fn(() => true),
}));

vi.mock("@tauri-apps/api/window", () => ({
  LogicalSize: class LogicalSize {
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
  },
  getCurrentWindow: () => ({
    setAlwaysOnTop,
    isAlwaysOnTop,
    setSize,
    innerSize: async () => ({ width: logicalSize.width, height: logicalSize.height }),
    scaleFactor: async () => 1,
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

describe("togglePlayerWindowSize", () => {
  beforeEach(() => {
    logicalSize.width = 1100;
    logicalSize.height = 720;
    setSize.mockClear();
  });

  it("snaps to the default size, then restores the resized size", async () => {
    vi.resetModules();
    const prefs = await import("./windowPrefs");

    await prefs.togglePlayerWindowSize();
    expect(setSize).toHaveBeenLastCalledWith(expect.objectContaining({ width: 512, height: 382 }));

    await prefs.togglePlayerWindowSize();
    expect(setSize).toHaveBeenLastCalledWith(expect.objectContaining({ width: 1100, height: 720 }));
  });
});

