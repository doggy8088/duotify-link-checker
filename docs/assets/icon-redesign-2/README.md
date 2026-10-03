# 第二輪圖示設計

這輪使用內建 imagegen 分別生成四種視覺語言，從字形、像素造型、立體材質與筆觸建立差異。每版原始尺寸均為 1254×1254 PNG。

**採用第 1 版黑白 D 字母標誌。** 以 D 對應 Duotify 名稱，以字形中的勾號表達檢查；粗輪廓在 16 像素下仍能辨認，32 像素以上的勾號意涵較明顯。此結論來自本次視覺比較，未進行使用者辨識率測試。

<!-- prettier-ignore -->
* * *

| 版本 | 風格           | 識別線索                           | 原始素材                                         |
| ---- | -------------- | ---------------------------------- | ------------------------------------------------ |
| 1    | 黑白字母標誌   | D 輪廓與融入字形的勾號；已採用     | [01-swiss-monogram.png](01-swiss-monogram.png)   |
| 2    | 復古像素檢查鏡 | 階梯輪廓的檢查鏡與白色勾號         | [02-pixel-inspector.png](02-pixel-inspector.png) |
| 3    | 金屬立體鏈結   | 銅色與珍珠白金屬環、立體交扣       | [03-sculpted-link.png](03-sculpted-link.png)     |
| 4    | 粗筆觸鏈結勾號 | 朱紅背景、米白粗筆觸與橫向鏈結勾號 | [04-brush-link.png](04-brush-link.png)           |

![第二輪四種風格與小尺寸比較](comparison.png)

16、32、48 像素圖示以實際尺寸顯示；16 像素的六倍放大使用 nearest-neighbor。第 3 版的金屬材質細節會隨縮小減少，檢查重點是鏈結輪廓。第 2 版是像素風格的生成圖，實際縮小仍使用正式圖示相同的 Sharp 流程。

<!-- prettier-ignore -->
* * *

在專案根目錄執行 `node scripts/icon-preview.mjs 2` 重建本輪比較圖；`node scripts/icon-preview.mjs 1` 可重建第一輪。

[完整提示詞](prompts.md)包括四版原始生成提示詞與第 1 版宣傳圖提示詞。正式圖示使用 [../icon-source.png](../icon-source.png)，各尺寸由 `npm run icons` 重建。
