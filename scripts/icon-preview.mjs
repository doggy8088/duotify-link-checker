import sharp from "sharp";

const packs = {
  1: {
    directory: "docs/assets/icon-variants",
    title: "Duotify Link Checker：第一輪設計",
    variants: [
      "01-cobalt-link",
      "02-green-link",
      "03-open-link-check",
      "04-unified-link-check",
    ],
    labels: [
      "01 / 藍底白鏈結",
      "02 / 綠底鏈結",
      "03 / 透明底鏈結",
      "04 / 第一輪採用",
    ],
  },
  2: {
    directory: "docs/assets/icon-redesign-2",
    title: "Duotify Link Checker：第二輪四種風格",
    variants: [
      "01-swiss-monogram",
      "02-pixel-inspector",
      "03-sculpted-link",
      "04-brush-link",
    ],
    labels: [
      "01 / 黑白字母標誌，曾採用",
      "02 / 復古像素檢查鏡",
      "03 / 金屬立體鏈結",
      "04 / 粗筆觸鏈結勾號",
    ],
  },
  3: {
    directory: "docs/assets/icon-redesign-3",
    title: "Duotify Link Checker：第三輪設計，第 3 版已採用",
    variants: [
      "01-modular-link",
      "02-origami-link",
      "03-focus-scan",
      "04-glass-link",
    ],
    labels: [
      "01 / 幾何拼接",
      "02 / 折紙鏈結",
      "03 / 焦點掃描，已採用",
      "04 / 玻璃鏈結",
    ],
  },
};
const pack = packs[process.argv[2] ?? "1"];
if (!pack) throw new Error("用法：node scripts/icon-preview.mjs [1|2|3]");
const { directory, title, variants, labels } = pack;
const width = 1120;
const height = 710;
let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#eef1f5"/><text x="24" y="34" font-family="Arial, PingFang TC, sans-serif" font-size="22" fill="#14213d">${title}</text>`;
const overlays = [];

for (let i = 0; i < variants.length; i++) {
  const x = 20 + i * 275;
  svg += `<text x="${x}" y="72" font-family="Arial, PingFang TC, sans-serif" font-size="18" fill="#14213d">${labels[i]}</text>`;
  for (let j = 0; j < 2; j++) {
    const y = 88 + j * 290;
    const bg = j === 0 ? "#ffffff" : "#202124";
    const fg = j === 0 ? "#14213d" : "#f1f3f4";
    svg += `<rect x="${x}" y="${y}" width="255" height="270" rx="10" fill="${bg}"/><text x="${x + 12}" y="${y + 24}" font-family="Arial, PingFang TC, sans-serif" font-size="14" fill="${fg}">${j === 0 ? "淺色背景" : "深色背景"}</text>`;
    const source = `${directory}/${variants[i]}.png`;
    overlays.push({
      input: await sharp(source).resize(128, 128).png().toBuffer(),
      left: x + 16,
      top: y + 44,
    });
    const small = await sharp(source).resize(16, 16).png().toBuffer();
    overlays.push({
      input: await sharp(small)
        .resize(96, 96, { kernel: "nearest" })
        .png()
        .toBuffer(),
      left: x + 150,
      top: y + 55,
    });
    svg += `<text x="${x + 16}" y="${y + 191}" font-family="Arial, PingFang TC, sans-serif" font-size="12" fill="${fg}">128 px</text><text x="${x + 150}" y="${y + 170}" font-family="Arial, PingFang TC, sans-serif" font-size="12" fill="${fg}">16 px × 6</text>`;
    overlays.push({ input: small, left: x + 20, top: y + 215 });
    overlays.push({
      input: await sharp(source).resize(32, 32).png().toBuffer(),
      left: x + 88,
      top: y + 208,
    });
    overlays.push({
      input: await sharp(source).resize(48, 48).png().toBuffer(),
      left: x + 167,
      top: y + 200,
    });
    svg += `<text x="${x + 15}" y="${y + 257}" font-family="Arial, PingFang TC, sans-serif" font-size="12" fill="${fg}">16 px</text><text x="${x + 85}" y="${y + 257}" font-family="Arial, PingFang TC, sans-serif" font-size="12" fill="${fg}">32 px</text><text x="${x + 165}" y="${y + 257}" font-family="Arial, PingFang TC, sans-serif" font-size="12" fill="${fg}">48 px</text>`;
  }
}

svg +=
  '<text x="24" y="696" font-family="Arial, PingFang TC, sans-serif" font-size="13" fill="#425166">16、32、48 像素為實際尺寸；六倍放大使用 nearest-neighbor，檢查縮小後的輪廓。</text></svg>';
await sharp(Buffer.from(svg))
  .composite(overlays)
  .png()
  .toFile(`${directory}/comparison.png`);
