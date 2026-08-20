import { Hono } from "hono";
import httpErrors from "http-errors";
import mime from "mime/lite";
import { z } from "zod";
import { getFolders } from "~/lib/fs";
import { iconExists, readIcon } from "~/lib/icons";
import { zValidator } from "~/middlewares/zod-validator";

const supportedIconSets = await getFolders("./icons");
const extensionSchema = z.enum(["svg"]);
const paramsSchema = z.object({
  set: z
    .string()
    .nonempty()
    .refine((set) => supportedIconSets.includes(set), "Unsupported icon set"),
  name: z
    .string()
    .nonempty()
    .transform((val) => {
      const [name, ext] = val.split(".");
      return { name, ext };
    })
    .refine(
      ({ ext }) => extensionSchema.safeParse(ext).success,
      `Unsupported file extension. Expected: ${extensionSchema.options.map((ext) => `.${ext}`).join(", ")}`,
    )
    .transform(({ name, ext }) => {
      return [name, ext] as const;
    }),
});

export const iconsRoute = new Hono().get(
  "/:set/:name",
  zValidator("param", paramsSchema),
  (c) => {
    const {
      set,
      name: [name, ext],
    } = c.req.valid("param");

    if (!iconExists(set, name, ext)) {
      throw new httpErrors.NotFound(`Unknown icon: ${set}/${name}.${ext}`);
    }

    const svg = readIcon(set, name, ext);
    if (!svg) {
      throw new httpErrors.InternalServerError("Failed to read icon file");
    }

    const contentType = mime.getType(ext);

    if (!contentType) {
      throw new httpErrors.InternalServerError(
        `Failed to get content type for extension: ${ext}`,
      );
    }

    return c.body(svg, 200, { "Content-Type": contentType });
  },
);
