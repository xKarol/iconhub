export function injectSvgSize(svg: string, size: number): string {
  return svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s+(width|height)="[^"]*"/g, "");
    return `<svg${cleaned} width="${size}" height="${size}">`;
  });
}

export function injectSvgStroke(svg: string, stroke: string): string {
  return svg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s+stroke="[^"]*"/g, "");
    return `<svg${cleaned} stroke="${stroke}">`;
  });
}
