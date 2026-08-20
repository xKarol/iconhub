import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ICONS_DIR = "icons";

export function iconExists(set: string, name: string, ext: string): boolean {
  const iconPath = join(ICONS_DIR, set, `${name}.${ext}`);
  return existsSync(iconPath);
}

export function readIcon(
  set: string,
  name: string,
  ext: string,
): string | null {
  const iconPath = join(ICONS_DIR, set, `${name}.${ext}`);
  try {
    return readFileSync(iconPath, "utf-8");
  } catch {
    return null;
  }
}
