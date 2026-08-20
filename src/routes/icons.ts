import { Hono } from "hono";
import httpErrors from "http-errors";
import mime from "mime/lite";
import { z } from "zod";
import { iconSets } from "~/generated/sets";
import { convertSvg, type ImageExtension } from "~/lib/convert";
import { zValidator } from "~/middlewares/zod-validator";

const extensionSchema = z.enum(["svg", "png", "jpg", "jpeg", "webp", "avif"]);
const paramsSchema = z.object({
  set: z
    .string()
    .nonempty()
    .refine(
      (set) => (iconSets as readonly string[]).includes(set),
      "Unsupported icon set",
    ),
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
  async (c) => {
    const {
      set,
      name: [name, ext],
    } = c.req.valid("param");

    const svgFile = Bun.file(`./icons/${set}/${name}.svg`);
    if (!(await svgFile.exists())) {
      throw new httpErrors.NotFound(`Unknown icon: ${set}/${name}`);
    }

    const contentType = mime.getType(ext);
    if (!contentType) {
      throw new httpErrors.InternalServerError(
        `Failed to get content type for extension: ${ext}`,
      );
    }

    if (ext === "svg") {
      return c.body(await svgFile.text(), 200, { "Content-Type": contentType });
    }

    const svg = await svgFile.text();
    const buffer = await convertSvg(svg, ext as ImageExtension);
    return c.body(new Uint8Array(buffer), 200, { "Content-Type": contentType });
  },
);
