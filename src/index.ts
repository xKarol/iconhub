import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import httpErrors from "http-errors";
import { errorHandler } from "~/middlewares/error-handler";
import { iconsRoute } from "~/routes/icons";

const app = new Hono()
  .use("*", logger())
  .use("*", cors())
  .use("*", secureHeaders())
  .route("/", iconsRoute)
  .notFound(() => {
    throw httpErrors.NotFound("Route not found");
  })
  .onError(errorHandler);

export default app;
