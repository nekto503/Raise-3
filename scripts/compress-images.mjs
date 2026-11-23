import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/images-src";
const DST = "public/images";

const jobs = [
  { name: "drone", w: 1344 },
  { name: "growth", w: 1344 },
  { name: "mars", w: 1344 },
  { name: "wedding", w: 1344 },
  { name: "food", w: 1344 },
];

async function main() {
  await mkdir(DST, { recursive: true });
  for (const j of jobs) {
    await sharp(`${SRC}/${j.name}.png`)
      .resize({ width: j.w })
      .webp({ quality: 78 })
      .toFile(`${DST}/${j.name}.webp`);
    console.log(`ok ${j.name}.webp`);
  }
  // gallery jpegs as a fallback for the <img> tags (also lighter than png)
  for (const j of jobs) {
    await sharp(`${SRC}/${j.name}.png`)
      .resize({ width: j.w })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(`${DST}/${j.name}.jpg`);
    console.log(`ok ${j.name}.jpg`);
  }
  // OG cover: center crop 1200x630
  await sharp(`${SRC}/og.png`)
    .resize({ width: 1344, height: 706, fit: "cover" })
    .extract({ left: 72, top: 0, width: 1200, height: 630 })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(`${DST}/og.jpg`);
  console.log("ok og.jpg (1200x630)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
