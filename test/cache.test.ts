import { describe, expect, test } from "bun:test";
import app from "~/index";

const ICON_CACHE_CONTROL = "public, max-age=31536000, immutable";
const ERROR_CACHE_CONTROL = "public, max-age=300";

describe("Cache headers on icon responses", () => {
  test.each(["svg", "png", "jpg", "jpeg", "webp"])(
    "sets a long-lived immutable cache header for .%s",
    async (ext) => {
      const res = await app.request(`/lucide/activity.${ext}?size=48`);
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe(ICON_CACHE_CONTROL);
    },
  );

  test("keeps the cache header when size, fill and background are combined", async () => {
    const res = await app.request(
      "/lucide/activity.svg?size=64&fill=ff0000&background=00ff00",
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe(ICON_CACHE_CONTROL);
  });

  test("sets the cache header for every icon set", async () => {
    for (const path of [
      "/lucide/activity.svg",
      "/tabler/home.svg",
      "/remix/home.svg",
      "/phosphor/house.svg",
    ]) {
      const res = await app.request(path);
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe(ICON_CACHE_CONTROL);
    }
  });

  test("icon responses remain publicly cacheable for cross-origin use", async () => {
    const res = await app.request("/lucide/activity.svg");
    expect(res.headers.get("cache-control")).toContain("public");
  });
});

describe("Cache headers on error responses", () => {
  test("caches validation errors briefly", async () => {
    const res = await app.request("/lucide/activity.bmp");
    expect(res.status).toBe(400);
    expect(res.headers.get("cache-control")).toBe(ERROR_CACHE_CONTROL);
  });

  test("caches unknown icon errors briefly", async () => {
    const res = await app.request("/lucide/definitely-missing.svg");
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe(ERROR_CACHE_CONTROL);
  });

  test("caches unknown route errors briefly", async () => {
    const res = await app.request("/not-a-route");
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe(ERROR_CACHE_CONTROL);
  });
});
