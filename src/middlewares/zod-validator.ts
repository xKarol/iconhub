import { zValidator as zv } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import httpErrors from "http-errors";
import type * as z from "zod";

export const zValidator = <
  T extends z.ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result) => {
    if (!result.success) {
      throw new httpErrors.BadRequest(result.error.message);
    }
  });
