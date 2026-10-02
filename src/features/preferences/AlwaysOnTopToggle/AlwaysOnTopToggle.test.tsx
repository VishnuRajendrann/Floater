/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "../../../state/preferences/preferencesContext";
import { AlwaysOnTopToggle } from "./AlwaysOnTopToggle";

const applyAlwaysOnTop = vi.fn();
const readNativeAlwaysOnTop = vi.fn();

vi.mock("../../../integrations/tauri/windowPrefs", () => ({
  applyAlwaysOnTop: (...args: unknown[]) => applyAlwaysOnTop(...args),
  readNativeAlwaysOnTop: (...args: unknown[]) => readNativeAlwaysOnTop(...args),
  AlwaysOnTopError: class AlwaysOnTopError extends Error {
    override name = "AlwaysOnTopError";
  },
}));

describe("AlwaysOnTopToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    applyAlwaysOnTop.mockReset();
    readNativeAlwaysOnTop.mockReset();
    applyAlwaysOnTop.mockResolvedValue(undefined);
    readNativeAlwaysOnTop.mockResolvedValue(false);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });
  });

  it("starts off and toggles only after native enable succeeds", async () => {
    readNativeAlwaysOnTop.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <AlwaysOnTopToggle />
      </PreferencesProvider>,
    );

    const button = screen.getByRole("button", { name: "Always on top" });
    await waitFor(() => {
      expect(button.getAttribute("aria-pressed")).toBe("false");
    });

    await user.click(button);

    await waitFor(() => {
      expect(button.getAttribute("aria-pressed")).toBe("true");
    });
    expect(button.textContent).toBe("Always on Top ✓");
    expect(applyAlwaysOnTop).toHaveBeenCalledWith(true);
  });
});
