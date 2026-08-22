import colorString from "color-string";

export const SIZE_MIN = 1;
export const SIZE_MAX = 128;
export const SIZE_DEFAULT = 24;

export function isSupportedColor(value: string): boolean {
  const parsed = colorString.get(value);
  if (parsed?.model !== "rgb" || parsed.value[3] !== 1) {
    return false;
  }

  return (
    /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ||
    /^rgb\(/i.test(value) ||
    /^[a-z]+$/i.test(value)
  );
}
