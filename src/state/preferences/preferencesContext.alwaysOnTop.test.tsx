/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PREFERENCES_STORAGE_KEY } from "../../storage/preferencesStore";
import { PreferencesProvider, usePreferences } from "./preferencesContext";

const applyAlwaysOnTop = vi.fn();
const readNativeAlwaysOnTop = vi.fn();

vi.mock("../../integrations/tauri/windowPrefs", () => ({
  applyAlwaysOnTop: (...args: unknown[]) => applyAlwaysOnTop(...args),
  readNativeAlwaysOnTop: (...args: unknown[]) => readNativeAlwaysOnTop(...args),
  AlwaysOnTopError: class AlwaysOnTopError extends Error {
    override name = "AlwaysOnTopError";
  },
}));

function AlwaysOnTopProbe() {
  const { alwaysOnTopEnabled, setAlwaysOnTop } = usePreferences();
  return (
    <div>
      <span data-testid="enabled">{String(alwaysOnTopEnabled)}</span>
      <button type="button" onClick={() => setAlwaysOnTop(true)}>
        Enable
      </button>
      <button type="button" onClick={() => setAlwaysOnTop(false)}>
        Disable
      </button>
    </div>
  );
}

describe("PreferencesProvider always on top", () => {
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

  afterEach(() => {
    cleanup();
  });

  it("restores native state on startup when preference is true", async () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ version: 1, alwaysOnTop: true }),
    );
    readNativeAlwaysOnTop.mockResolvedValueOnce(true);

    render(
      <PreferencesProvider>
        <AlwaysOnTopProbe />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("true");
    });
    expect(applyAlwaysOnTop).toHaveBeenCalledWith(true);
  });

  it("persists preference only after native enable succeeds", async () => {
    readNativeAlwaysOnTop.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const user = userEvent.setup();

    render(
      <PreferencesProvider>
        <AlwaysOnTopProbe />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(applyAlwaysOnTop).toHaveBeenCalledWith(false);
    });

    await user.click(screen.getByRole("button", { name: "Enable" }));

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("true");
    });

    await waitFor(() => {
      const saved = JSON.parse(
        localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}",
      ) as { alwaysOnTop?: boolean };
      expect(saved.alwaysOnTop).toBe(true);
    });
  });

  it("does not persist or show enabled when native enable fails", async () => {
    readNativeAlwaysOnTop.mockResolvedValue(false);
    applyAlwaysOnTop.mockImplementation(async (enabled: boolean) => {
      if (enabled) {
        throw new Error("denied");
      }
    });
    const user = userEvent.setup();

    render(
      <PreferencesProvider>
        <AlwaysOnTopProbe />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(applyAlwaysOnTop).toHaveBeenCalledWith(false);
    });

    await user.click(screen.getByRole("button", { name: "Enable" }));

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("false");
    });

    const saved = JSON.parse(
      localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}",
    ) as { alwaysOnTop?: boolean };
    expect(saved.alwaysOnTop).not.toBe(true);
  });

  it("persists disable after native disable succeeds", async () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ version: 1, alwaysOnTop: true }),
    );
    readNativeAlwaysOnTop
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);
    const user = userEvent.setup();

    render(
      <PreferencesProvider>
        <AlwaysOnTopProbe />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("true");
    });

    await user.click(screen.getByRole("button", { name: "Disable" }));

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("false");
    });

    await waitFor(() => {
      const saved = JSON.parse(
        localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}",
      ) as { alwaysOnTop?: boolean };
      expect(saved.alwaysOnTop).toBe(false);
    });
  });
});
