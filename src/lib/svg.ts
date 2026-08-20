export function injectSvgSize(svg: string, size: number): string {
  return svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s+(width|height)="[^"]*"/g, "");
    return `<svg${cleaned} width="${size}" height="${size}">`;
  });
}
