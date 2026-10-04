# 圖示與商店截圖

2026-10-04 使用內建 imagegen 工具製作第三輪四種不同風格，未使用 CLI/API fallback。[第三輪設計記錄](assets/icon-redesign-3/README.md)與[完整提示詞](assets/icon-redesign-3/prompts.md)保存在專案內。

**正式圖示採用使用者選定的第三輪第 3 版：焦點掃描。** 黑色背景搭配青色對焦括角與中央白色勾號。套用時直接沿用選定原圖，未重新生成標誌；圖示與宣傳素材使用相同造型。小尺寸輪廓可在下方比較圖檢視，未進行使用者辨識率測試。

<!-- prettier-ignore -->
* * *

## 第三輪四種風格

| 版本 | 風格                                 | 原始素材                                                          |
| ---- | ------------------------------------ | ----------------------------------------------------------------- |
| 1    | 幾何拼接，藍色與橘色模組             | [01-modular-link.png](assets/icon-redesign-3/01-modular-link.png) |
| 2    | 折紙鏈結，藍綠色與黃色折疊紙帶       | [02-origami-link.png](assets/icon-redesign-3/02-origami-link.png) |
| 3    | 焦點掃描，青色括角與白色勾號；已採用 | [03-focus-scan.png](assets/icon-redesign-3/03-focus-scan.png)     |
| 4    | 玻璃鏈結，紫色玻璃交扣鏈環           | [04-glass-link.png](assets/icon-redesign-3/04-glass-link.png)     |

![第三輪四種風格在淺色與深色背景上的尺寸比較，第 3 版已採用](assets/icon-redesign-3/comparison.png)

比較圖中的 16、32、48 像素圖示維持實際尺寸；16 像素的六倍放大使用 nearest-neighbor，方便檢查縮小後的像素輪廓。執行 `node scripts/icon-preview.mjs 3` 可重建。

第一輪素材保留在 [assets/icon-variants/](assets/icon-variants/prompts.md)，[第二輪設計記錄](assets/icon-redesign-2/README.md)保留黑白字母、像素、金屬與筆觸四種方向。第一輪第 4 版及第二輪第 1 版均為歷史採用版本，已由使用者選定的焦點掃描圖示取代。執行 `node scripts/icon-preview.mjs 1` 或 `2` 可重建各輪比較圖。

<!-- prettier-ignore -->
* * *

## 正式圖示

原始 PNG：[assets/icon-source.png](assets/icon-source.png)，與第三輪第 3 版素材逐位元組相同。原圖為 1254×1254 不透明 RGB，黑色背景、青色括角與白色勾號；使用 Sharp 等比例縮小，產生 `public/icons/icon-16.png`、`icon-32.png`、`icon-48.png`、`icon-128.png`。正式圖示統一輸出 RGBA；RGB 原稿加入不透明 alpha，已有 alpha 的原稿則保留其透明資訊。

`npm run icons` 可重建正式圖示與宣傳圖。manifest 的工具列及擴充功能清單參照各自對應的實際尺寸；彈出視窗與 README 也使用這組素材。尺寸與使用方式依 [Chrome 官方圖示文件](https://developer.chrome.com/docs/extensions/reference/manifest/icons)及 [action 圖示文件](https://developer.chrome.com/docs/extensions/reference/api/action)確認。

<!-- prettier-ignore -->
* * *

## 宣傳圖

商店宣傳圖直接沿用焦點掃描原圖，等比例置中於黑色橫式畫布。`npm run icons` 先產生 1760×1120 的 [assets/promo-source.png](assets/promo-source.png)，再縮小為 [assets/promo-440x280.png](assets/promo-440x280.png)，兩者均為 RGB、無 alpha。此流程只縮放與補邊，不裁切、拉伸或重新生成標誌。圖示原始生成提示詞保存在[第三輪 prompts.md](assets/icon-redesign-3/prompts.md)。

<!-- prettier-ignore -->
* * *

## 截圖檔案

- `assets/screenshot-report.png`：完整結果報表，1280×800。
- `assets/screenshot-invalid.png`：Invalid 篩選結果，1280×800。

由真實擴充功能 E2E 測試在本機 fixture 擷取。`npm run test:e2e` 會重新產生。這次圖示變更不影響報表內容；若更新含舊圖示的彈出視窗或工具列截圖，應重新擷取。localhost 隨機連接埠可能隨測試改變。
