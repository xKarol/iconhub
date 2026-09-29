import { Hono } from "hono";
import httpErrors from "http-errors";
import mime from "mime/lite";
import { z } from "zod";
import {
  getColorAttribute,
  ICON_CACHE_CONTROL,
  isSupportedColor,
  normalizeColor,
  SIZE_DEFAULT,
  SIZE_MAX,
  SIZE_MIN,
} from "~/constants";
import { iconSets } from "~/generated/sets";
import { convertSvg, type ImageExtension } from "~/lib/convert";
import { injectSvgBackground, injectSvgColor, injectSvgSize } from "~/lib/svg";
import { zValidator } from "~/middlewares/zod-validator";

const extensionSchema = z.enum(["svg", "png", "jpg", "jpeg", "webp"]);
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

const colorSchema = z
  .string()
  .refine(
    isSupportedColor,
    "Unsupported color. Expected hex (#rgb or #rrggbb), rgb() without alpha, or a CSS named color",
  )
  .transform(normalizeColor);

const querySchema = z
  .object({
    size: z.preprocess(
      (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.coerce
        .number()
        .int("Size must be an integer")
        .min(SIZE_MIN, `Size must be at least ${SIZE_MIN}`)
        .max(SIZE_MAX, `Size must be at most ${SIZE_MAX}`)
        .optional(),
    ),
    fill: colorSchema.optional(),
    background: colorSchema.optional(),
  })
  .optional();

type Bindings = {
  ASSETS?: {
    fetch: typeof fetch;
  };
};

export const iconsRoute = new Hono<{
  Bindings: Bindings;
}>().get(
  "/:set/:name",
  zValidator("param", paramsSchema),
  zValidator("query", querySchema),
  async (c) => {
    const {
      set,
      name: [name, ext],
    } = c.req.valid("param");
    const { size, fill, background } = c.req.valid("query") ?? {};

    let svg: string;
    if (c.env?.ASSETS) {
      const res = await c.env.ASSETS.fetch(
        new URL(`/${set}/${name}.svg`, c.req.url),
      );
      if (!res.ok) {
        throw new httpErrors.NotFound(`Unknown icon: ${set}/${name}`);
      }
      svg = await res.text();
    } else {
      const svgFile = Bun.file(`./icons/${set}/${name}.svg`);
      if (!(await svgFile.exists())) {
        throw new httpErrors.NotFound(`Unknown icon: ${set}/${name}`);
      }
      svg = await svgFile.text();
    }

    const contentType = mime.getType(ext);
    if (!contentType) {
      throw new httpErrors.InternalServerError(
        `Failed to get content type for extension: ${ext}`,
      );
    }

    let outputSvg = injectSvgSize(svg, size ?? SIZE_DEFAULT);
    if (background) {
      outputSvg = injectSvgBackground(outputSvg, background);
    }
    if (fill) {
      outputSvg = injectSvgColor(outputSvg, fill, getColorAttribute(set));
    }

    if (ext === "svg") {
      return c.body(outputSvg, 200, {
        "Content-Type": contentType,
        "Cache-Control": ICON_CACHE_CONTROL,
      });
    }

    const image = await convertSvg(outputSvg, ext as ImageExtension);
    return new Response(image.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": ICON_CACHE_CONTROL,
      },
    });
  },
);
