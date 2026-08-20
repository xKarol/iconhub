import { describe, expect, test } from "bun:test";
import app from "~/index";

describe("Unknown routes", () => {
  test("returns 404 for unmatched single-segment path", async () => {
    const res = await app.request("/foo");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe(404);
    expect(body.message).toBe("Route not found");
  });

  test("returns 404 for unmatched multi-segment path", async () => {
    const res = await app.request("/foo/bar/baz");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe(404);
    expect(body.message).toBe("Route not found");
  });
});

describe("Size query parameter", () => {
  test("SVG returns with default size (24) when no size param", async () => {
    const res = await app.request("/lucide/activity.svg");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('width="24"');
    expect(body).toContain('height="24"');
  });

  test("SVG returns with custom size when size param provided", async () => {
    const res = await app.request("/lucide/activity.svg?size=64");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('width="64"');
    expect(body).toContain('height="64"');
  });

  test("rejects size below minimum with 400", async () => {
    const res = await app.request("/lucide/activity.svg?size=0");
    expect(res.status).toBe(400);
  });

  test("rejects size above maximum with 400", async () => {
    const res = await app.request("/lucide/activity.svg?size=129");
    expect(res.status).toBe(400);
  });

  test("rejects non-integer size with 400", async () => {
    const res = await app.request("/lucide/activity.svg?size=24.5");
    expect(res.status).toBe(400);
  });

  test("PNG with custom size returns image", async () => {
    const res = await app.request("/lucide/activity.png?size=32");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });
});
