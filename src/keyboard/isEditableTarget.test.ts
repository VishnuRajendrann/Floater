/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { isEditableTarget } from "./isEditableTarget";

describe("isEditableTarget", () => {
  it("detects input elements", () => {
    const input = document.createElement("input");
    expect(isEditableTarget(input)).toBe(true);
  });

  it("ignores buttons", () => {
    const button = document.createElement("button");
    expect(isEditableTarget(button)).toBe(false);
  });
});
