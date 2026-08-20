import { describe, expect, test } from "bun:test";
import { injectSvgSize } from "~/lib/svg";

describe("injectSvgSize", () => {
  test("sets width and height on SVG without existing dimensions", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(injectSvgSize(svg, 48)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"></svg>',
    );
  });

  test("replaces existing width and height", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"></svg>';
    expect(injectSvgSize(svg, 32)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>',
    );
  });

  test("removes only width, keeps other attributes", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24"></svg>';
    const result = injectSvgSize(svg, 24);
    expect(result).toContain('width="24"');
    expect(result).toContain('height="24"');
    expect(result).toContain('viewBox="0 0 24 24"');
    expect(result).not.toContain('width="16"');
  });

  test("does not replace stroke-width", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="2"></svg>';
    const result = injectSvgSize(svg, 24);
    expect(result).toContain('stroke-width="2"');
    expect(result).toContain('width="24"');
  });

  test("handles SVG with no attributes", () => {
    const svg = "<svg></svg>";
    const result = injectSvgSize(svg, 16);
    expect(result).toBe('<svg width="16" height="16"></svg>');
  });

  test("handles size of 1 (minimum)", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(injectSvgSize(svg, 1)).toContain('width="1"');
  });

  test("handles size of 128 (maximum)", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(injectSvgSize(svg, 128)).toContain('width="128"');
  });
});
