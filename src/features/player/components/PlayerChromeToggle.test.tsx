/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlayerChromeToggle } from "./PlayerChromeToggle";

describe("PlayerChromeToggle", () => {
  it("toggles via click and reflects active state", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <PlayerChromeToggle
        visible
        active={false}
        onToggle={onToggle}
        onPointerEnter={() => {}}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Show window and playback controls",
    });
    expect(button.getAttribute("aria-pressed")).toBe("false");

    await user.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <PlayerChromeToggle
        visible
        active
        onToggle={onToggle}
        onPointerEnter={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Hide window and playback controls" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
