import sharp from "sharp";

export type ImageExtension = "png" | "jpg" | "jpeg" | "webp" | "avif";

export async function convertSvg(
  svg: string,
  format: ImageExtension,
): Promise<Buffer> {
  const img = sharp(Buffer.from(svg));
  const fmt = format === "jpg" ? "jpeg" : format;

  switch (fmt) {
    case "png":
      return img.png({ quality: 100 }).toBuffer();
    case "jpeg":
      return img.jpeg({ quality: 80 }).toBuffer();
    case "webp":
      return img.webp({ quality: 80 }).toBuffer();
    case "avif":
      return img.avif({ quality: 65 }).toBuffer();
  }
}
