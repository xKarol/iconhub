import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { isHttpError } from "http-errors";
import { formatError } from "~/lib/errors";

export const errorHandler: ErrorHandler = (err, c) => {
  const status = isHttpError(err)
    ? (err.statusCode as ContentfulStatusCode)
    : 500;

  return c.json(
    {
      status,
      message: formatError(err),
      ...(process.env.NODE_ENV !== "production" && {
        stack: err?.stack,
      }),
    },
    status,
  );
};
