import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app from "~/index";

const client = testClient(app);

describe("Unknown routes", () => {
  test("returns 404 for unmatched single-segment path", async () => {
    const res: Response = await (client as any).foo.$get();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe(404);
    expect(body.message).toBe("Route not found");
  });

  test("returns 404 for unmatched multi-segment path", async () => {
    const res: Response = await (client as any).foo.bar.baz.$get();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe(404);
    expect(body.message).toBe("Route not found");
  });
});
