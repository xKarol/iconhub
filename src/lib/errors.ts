import { isHttpError } from "http-errors";
import { fromError, isZodErrorLike } from "zod-validation-error";

export function formatError(error: unknown): string {
  if (isZodErrorLike(error)) {
    return fromError(error).toString();
  }

  if (isHttpError(error) || error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error occurred";
}
