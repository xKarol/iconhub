import { describe, expect, test } from "bun:test";
import { getColorAttribute, isSupportedColor } from "~/constants";

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

  test("accepts the transparent keyword", () => {
    expect(isSupportedColor("transparent")).toBe(true);
  });

  test("accepts the transparent keyword in mixed case", () => {
    expect(isSupportedColor("Transparent")).toBe(true);
  });

  test("rejects other colors with a zero alpha channel", () => {
    expect(isSupportedColor("rgba(255, 0, 0, 0)")).toBe(false);
  });
});

describe("getColorAttribute", () => {
  test("returns stroke for stroke-based icon sets", () => {
    expect(getColorAttribute("lucide")).toBe("stroke");
    expect(getColorAttribute("tabler")).toBe("stroke");
  });

  test("returns fill for fill-based icon sets", () => {
    expect(getColorAttribute("remix")).toBe("fill");
    expect(getColorAttribute("phosphor")).toBe("fill");
  });

  test("falls back to stroke for unknown icon sets", () => {
    expect(getColorAttribute("unknown")).toBe("stroke");
  });
});
