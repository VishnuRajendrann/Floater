/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import { PreferencesProvider } from "../../state/preferences/preferencesContext";

describe("ThemeToggle", () => {
  beforeEach(() => {
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
  it("applies an explicit theme on the document", async () => {
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <ThemeToggle />
      </PreferencesProvider>,
    );

    await user.selectOptions(screen.getByLabelText("Theme preference"), "dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
