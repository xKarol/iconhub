import colorString from "color-string";

export const SIZE_MIN = 1;
export const SIZE_MAX = 128;
export const SIZE_DEFAULT = 24;

/**
 * A given URL always renders the same bytes: the icon, the requested size and
 * every color are all part of the path and the query string, which Workers
 * Caching includes in the cache key. Icons can therefore be cached for a year
 * and treated as immutable by browsers.
 */
export const ICON_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Errors are cached briefly so repeated typos do not hit the Worker forever. */
export const ERROR_CACHE_CONTROL = "public, max-age=300";

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
  if (normalized.toLowerCase() === "transparent") {
    return true;
  }

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
