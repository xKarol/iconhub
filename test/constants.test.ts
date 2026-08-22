import { describe, expect, test } from "bun:test";
import { isSupportedColor } from "~/constants";

describe("isSupportedColor", () => {
  test("accepts CSS rgb percentages", () => {
    expect(isSupportedColor("rgb(100% 0% 0%)")).toBe(true);
  });

  test("rejects hex colors with an alpha channel", () => {
    expect(isSupportedColor("#ff000080")).toBe(false);
  });

  test("rejects four-digit hex colors", () => {
    expect(isSupportedColor("#f008")).toBe(false);
  });
});
