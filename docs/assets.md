# 圖示與商店截圖

圖示使用內建 imagegen 工具生成（非 CLI/API fallback），2026-10-04。未使用既有商標或第三方圖形。

原始透明 PNG：[assets/icon-source.png](assets/icon-source.png)。保留 alpha，使用 Sharp 等比例縮小，產生 `public/icons/icon-16.png`、`icon-32.png`、`icon-48.png`、`icon-128.png`。執行 `npm run icons` 可重建；manifest 參照各自對應的實際尺寸。

## 完整生成提示詞

```text
Use case: logo-brand
Asset type: Chrome extension icon for Duotify Link Checker
Primary request: Create one distinctive, polished icon combining two interlocking chain links with a clear check mark, communicating checked website links.
Style/medium: crisp flat vector-like raster logo, bold geometric silhouette, minimal detail, professional developer tool.
Composition/framing: one centered standalone mark, balanced square composition with generous safe margins; readable at 16 pixels.
Scene/backdrop: genuinely transparent background.
Color palette: deep navy chain links and vivid green check mark, strong contrast.
Text: no text or letters.
Constraints: no mockup, no shadows, no gradients, no border, no watermark, no extra objects; actual alpha transparency.
```

## 宣傳圖

依[官方圖片規格](https://developer.chrome.com/docs/webstore/images)，提供必需的 440×280 小型宣傳圖：`assets/promo-440x280.png`（RGB，無 alpha）。原始檔為 `assets/promo-source.png`，同樣使用內建 imagegen，以已生成圖示為參考；`npm run icons` 可由原圖重建輸出尺寸。

```text
Use case: logo-brand
Asset type: Chrome Web Store small promotional tile for Duotify Link Checker, landscape 11:7 aspect ratio.
Input images: Image 1 is the existing extension logo and must retain its navy interlocking chain links and green check mark silhouette.
Primary request: Compose a clean professional promotional graphic around this exact logo. Center the large logo on an opaque pale mint-green background, surrounded by very subtle small website-link line motifs with ample negative space. Keep the dark navy links and vivid green check unmistakable. Flat graphic style, clear at 440 by 280 pixels.
Constraints: no text, no letters, no extra logos, no watermark, no device mockup. Opaque background.
```

## 截圖檔案

- `assets/screenshot-report.png`：完整結果報表，1280×800。
- `assets/screenshot-invalid.png`：Invalid 篩選結果，1280×800。

由真實擴充功能 E2E 測試在本機 fixture 擷取。`npm run test:e2e` 會重新產生。UI 改版後需檢查並提交新截圖，再更新商店素材。localhost 隨機連接埠可能隨測試改變；這不影響功能。
