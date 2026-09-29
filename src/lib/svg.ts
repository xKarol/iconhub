import type { ColorAttribute } from "~/constants";

export function injectSvgSize(svg: string, size: number): string {
  return svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s+(width|height)="[^"]*"/g, "");
    return `<svg${cleaned} width="${size}" height="${size}">`;
  });
}

export function injectSvgColor(
  svg: string,
  color: string,
  attribute: ColorAttribute,
): string {
  return svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs.replace(
      new RegExp(`\\s+${attribute}="[^"]*"`, "g"),
      "",
    );
    return `<svg${cleaned} ${attribute}="${color}">`;
  });
}

export function injectSvgBackground(svg: string, background: string): string {
  return svg.replace(
    /(<svg\b[^>]*>)/,
    `$1<rect width="100%" height="100%" fill="${background}" stroke="none"/>`,
  );
}
