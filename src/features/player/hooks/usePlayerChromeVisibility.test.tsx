/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayerChromeVisibility } from "./usePlayerChromeVisibility";

const togglePlayerWindowSize = vi.fn();
const setWindowDecorations = vi.fn();
const ensureWindowVisible = vi.fn();

vi.mock("../../../integrations/tauri/windowPrefs", () => ({
  togglePlayerWindowSize: () => togglePlayerWindowSize(),
  reapplyPlayerWindowSize: () => Promise.resolve(),
  setWindowDecorations: (...args: unknown[]) => setWindowDecorations(...args),
  ensureWindowVisible: () => ensureWindowVisible(),
}));

function ToggleProbe() {
  const chrome = usePlayerChromeVisibility();
  return (
    <button type="button" onClick={chrome.toggleControls}>
      {chrome.controlsVisible ? "Hide window and playback controls" : "Show window and playback controls"}
    </button>
  );
}

describe("usePlayerChromeVisibility", () => {
  beforeEach(() => {
    togglePlayerWindowSize.mockReset();
    setWindowDecorations.mockReset();
    ensureWindowVisible.mockReset();
    togglePlayerWindowSize.mockResolvedValue(undefined);
    setWindowDecorations.mockResolvedValue(undefined);
    ensureWindowVisible.mockResolvedValue(undefined);
  });

  it("returns the window to its opening size when the controls toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<ToggleProbe />);

    await user.click(screen.getByRole("button", { name: "Show window and playback controls" }));

    expect(togglePlayerWindowSize).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Hide window and playback controls" })).toBeTruthy();
  });
});
