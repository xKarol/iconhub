import { describe, expect, test } from "bun:test";
import { injectSvgBackground, injectSvgColor, injectSvgSize } from "~/lib/svg";

describe("injectSvgBackground", () => {
  test("inserts a background rectangle before SVG content", () => {
    const svg = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';
    expect(injectSvgBackground(svg, "red")).toBe(
      '<svg viewBox="0 0 24 24"><rect width="100%" height="100%" fill="red" stroke="none"/><path d="M0 0"/></svg>',
    );
  });
});

describe("injectSvgColor", () => {
  test("adds stroke attribute when missing", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(injectSvgColor(svg, "red", "stroke")).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" stroke="red"></svg>',
    );
  });

  test("adds fill attribute when missing", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(injectSvgColor(svg, "red", "fill")).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="red"></svg>',
    );
  });

  test("replaces existing stroke attribute on root element", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" stroke="#000000"></svg>';
    expect(injectSvgColor(svg, "#ff0000", "stroke")).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" stroke="#ff0000"></svg>',
    );
  });

  test("replaces existing fill attribute on root element", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"></svg>';
    expect(injectSvgColor(svg, "#ff0000", "fill")).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000"></svg>',
    );
  });

  test("keeps other root attributes intact", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="2"></svg>';
    const result = injectSvgColor(svg, "blue", "stroke");
    expect(result).toContain('stroke-width="2"');
    expect(result).toContain('stroke="blue"');
  });

  test("does not modify color attributes on child elements", () => {
    const svg = '<svg><path d="M0 0" stroke="green" fill="yellow"/></svg>';
    const result = injectSvgColor(svg, "red", "fill");
    expect(result).toContain('<svg fill="red">');
    expect(result).toContain('stroke="green"');
    expect(result).toContain('fill="yellow"');
  });
});

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
