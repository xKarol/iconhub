import colorString from "color-string";

export const SIZE_MIN = 1;
export const SIZE_MAX = 128;
export const SIZE_DEFAULT = 24;

export type ColorAttribute = "fill" | "stroke";

export const SET_COLOR_ATTRIBUTES = {
  lucide: "stroke",
  remix: "fill",
  tabler: "stroke",
  phosphor: "fill",
} as const satisfies Record<string, ColorAttribute>;

export function getColorAttribute(set: string): ColorAttribute {
  return (
    SET_COLOR_ATTRIBUTES[set as keyof typeof SET_COLOR_ATTRIBUTES] ?? "stroke"
  );
}

export function normalizeColor(value: string): string {
  if (/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    return `#${value}`;
  }

  return value;
}

export function isSupportedColor(value: string): boolean {
  const normalized = normalizeColor(value);
  const parsed = colorString.get(normalized);
  if (parsed?.model !== "rgb" || parsed.value[3] !== 1) {
    return false;
  }

  return (
    /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized) ||
    /^rgb\(/i.test(normalized) ||
    /^[a-z]+$/i.test(normalized)
  );
}
