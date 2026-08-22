import colorString from "color-string";

export const SIZE_MIN = 1;
export const SIZE_MAX = 128;
export const SIZE_DEFAULT = 24;

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
