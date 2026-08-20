import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app from "~/index";

const client = testClient(app);

type ZodErrorBody = {
  success: false;
  error: { name: string; message: string };
};

describe("GET /:set/:name.svg", () => {
  test("returns SVG with correct content type", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "activity.svg" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    const body = await res.text();
    expect(body).toContain("<svg");
  });

  test("returns 400 for unknown set", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "unknown", name: "icon.svg" },
    });
    expect(res.status).toBe(400);
  });

  test("returns 404 for unknown icon within set", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "nonexistent-icon.svg" },
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe(404);
    expect(typeof body.message).toBe("string");
  });
});

describe("Extension validation", () => {
  test("rejects non-svg extensions with 400", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "activity.png" },
    });
    expect(res.status).toBe(400);
  });
});

describe("Zod validation error format", () => {
  test("validation error has success=false and ZodError structure", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "unknown", name: "icon.svg" },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ZodErrorBody;
    expect(body.success).toBe(false);
    expect(body.error).toHaveProperty("name", "ZodError");
    expect(body.error).toHaveProperty("message");
  });

  test("validation errors are JSON", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "activity.png" },
    });
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});

describe("Error handler response format (404)", () => {
  test("404 error has status and message fields", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "nonexistent.svg" },
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe(404);
    expect(typeof body.message).toBe("string");
  });

  test("404 includes stack trace in non-production", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "nonexistent.svg" },
    });
    const body = await res.json();
    expect(typeof body.stack).toBe("string");
  });

  test("error response content-type is application/json", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "nonexistent.svg" },
    });
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});

describe("Error message content", () => {
  test("400 for unknown set mentions unsupported icon set", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "badset", name: "icon.svg" },
    });
    const body = (await res.json()) as ZodErrorBody;
    expect(body.error.message).toContain("Unsupported icon set");
  });

  test("404 for missing icon mentions the requested icon", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "ghost-icon.svg" },
    });
    const body = await res.json();
    expect(body.message).toContain("ghost-icon");
  });

  test("400 for unsupported extension mentions expected extensions", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "activity.webp" },
    });
    const body = (await res.json()) as ZodErrorBody;
    expect(body.error.message).toContain(".svg");
  });
});

describe("Malformed request parameters", () => {
  test("rejects name without extension", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "activity" },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ZodErrorBody;
    expect(body.success).toBe(false);
  });

  test("rejects name with multiple dots", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "my.icon.svg" },
    });
    expect(res.status).toBe(400);
  });

  test("rejects name with uppercase extension", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "activity.SVG" },
    });
    expect(res.status).toBe(400);
  });
});

describe("Error handler integration", () => {
  test("all error responses are valid JSON", async () => {
    const errorCases = [
      { set: "unknown", name: "icon.svg" },
      { set: "lucide", name: "nonexistent.svg" },
      { set: "lucide", name: "activity.png" },
    ];

    for (const params of errorCases) {
      const res: Response = await client[":set"][":name"].$get({
        param: params,
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
      const contentType = res.headers.get("content-type");
      expect(contentType).toContain("application/json");
    }
  });

  test("error status matches HTTP status code for route errors", async () => {
    const res: Response = await client[":set"][":name"].$get({
      param: { set: "lucide", name: "nonexistent.svg" },
    });
    const body = await res.json();
    expect(body.status).toBe(res.status);
  });
});
