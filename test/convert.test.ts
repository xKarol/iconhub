import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app from "~/index";

const client = testClient(app);

describe("Content-Type headers", () => {
  const cases = [
    { ext: "png", expected: "image/png" },
    { ext: "webp", expected: "image/webp" },
    { ext: "jpeg", expected: "image/jpeg" },
    { ext: "jpg", expected: "image/jpeg" },
  ];

  for (const { ext, expected } of cases) {
    test(`${ext} -> ${expected}`, async () => {
      const res: Response = await client[":set"][":name"].$get({
        param: { set: "lucide", name: `activity.${ext}` },
      });
      const ct = res.headers.get("content-type");
      expect(ct).toContain(expected);
    });
  }
});
