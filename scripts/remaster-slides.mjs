/**
 * Remaster the six deck slides into true 16:9 frames — full-bleed.
 *
 * The source artwork is ultra-wide (2.4–3.3:1). The first pass composed each
 * slide contain-fit over a blurred pad, which left soft bands above/below the
 * artwork. This pass instead cover-crops: scale to full height and trim the
 * sides, so the frame is edge-to-edge artwork with no bands, then a gentle
 * lanczos + sharpen + contrast lift keeps text crisp.
 */
import sharp from "sharp";
import { readdirSync } from "node:fs";

const SRC = "upload";
const DST = "public/images/slides";

const W = 2048;
const H = 1152; // 16:9

const files = readdirSync(SRC)
  .filter((f) => f.endsWith(".jpg"))
  .sort((a, b) => a.localeCompare(b, "ru"));

async function remaster(file, index) {
  const src = `${SRC}/${file}`;

  // full-bleed: cover-crop from the centre (keeps the full height, trims sides)
  const out = await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .sharpen({ sigma: 1.05, m1: 0.6, m2: 2.2 })
    .linear(1.05, -6)
    .toColorspace("srgb")
    .webp({ quality: 90 })
    .toFile(`${DST}/s${index + 1}.webp`);

  const meta = await sharp(`${DST}/s${index + 1}.webp`).metadata();
  console.log(`ok s${index + 1}.webp ${meta.width}x${meta.height} (${(out.size / 1024).toFixed(0)} KB) <- ${file}`);
}

async function main() {
  if (files.length !== 6) throw new Error(`expected 6 slides, found ${files.length}: ${files.join(", ")}`);
  for (let i = 0; i < files.length; i++) {
    await remaster(files[i], i);
  }
  console.log("done: 6 slides remastered to 2048x1152 (16:9 full-bleed)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
