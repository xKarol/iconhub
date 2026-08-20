import { PhotonImage } from "@cf-wasm/photon";
import { Resvg } from "@cf-wasm/resvg";

export type ImageExtension = "png" | "jpg" | "jpeg" | "webp";

export async function convertSvg(
  svg: string,
  format: ImageExtension,
): Promise<Uint8Array> {
  const resvg = await Resvg.async(svg, {
    fitTo: { mode: "original" },
    font: { loadSystemFonts: false },
  });
  const rendered = resvg.render();
  const pngData = rendered.asPng();
  resvg.free();

  if (format === "png") {
    return pngData;
  }

  const photon = PhotonImage.new_from_byteslice(pngData);
  try {
    const fmt = format === "jpg" ? "jpeg" : format;
    const width = photon.get_width();
    const height = photon.get_height();

    if (fmt === "jpeg") {
      const raw = photon.get_raw_pixels();
      const flat = flattenAlphaOnWhite(raw);
      const flatPhoton = new PhotonImage(flat, width, height);
      try {
        return flatPhoton.get_bytes_jpeg(80);
      } finally {
        flatPhoton.free();
      }
    }

    return photon.get_bytes_webp();
  } finally {
    photon.free();
  }
}

function flattenAlphaOnWhite(rgba: Uint8Array): Uint8Array {
  const out = new Uint8Array(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const a = rgba[i + 3] / 255;
    out[i] = Math.round(rgba[i] * a + 255 * (1 - a));
    out[i + 1] = Math.round(rgba[i + 1] * a + 255 * (1 - a));
    out[i + 2] = Math.round(rgba[i + 2] * a + 255 * (1 - a));
    out[i + 3] = 255;
  }
  return out;
}
