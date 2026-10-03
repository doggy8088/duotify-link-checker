import sharp from "sharp";
import { mkdir } from "node:fs/promises";
await mkdir("public/icons", { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await sharp("docs/assets/icon-source.png")
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
}
await sharp("docs/assets/promo-source.png")
  .resize(440, 280)
  .removeAlpha()
  .png()
  .toFile("docs/assets/promo-440x280.png");
console.log(
  "Generated four icon sizes and the 440×280 promotional tile from imagegen masters.",
);
