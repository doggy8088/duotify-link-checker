# 圖示生成提示詞

2026-10-04 使用內建 imagegen 工具，未使用 CLI/API fallback。每個方向各呼叫一次生成工具，再對第 1、2 版修正透明區域；第 2 版最終改用完全不透明的綠色背景。

<!-- prettier-ignore -->
* * *

## 01-cobalt-link：藍底白鏈結

```text
Use case: logo-brand
Asset type: production Chrome extension icon for Duotify Link Checker, square bitmap master.
Primary request: design an original, highly recognizable icon communicating website link checking, optimized for a 16-pixel browser toolbar.
Style/medium: extremely clean flat vector-like raster logo, broad geometric shapes, crisp edges, optically centered.
Composition/framing: ONE icon only, filling almost the entire square with about 5% outer safe margin. Large simple symbol; substantial negative spaces that survive reduction to 16 pixels.
Text: no text, no letters, no numbers.
Constraints: genuine alpha transparency outside the icon silhouette; no checkerboard baked into the image. No gradients, shadows, glow, texture, 3D, mockups, frame, surrounding UI, labels, sheet of variants, watermark, or extra decoration. Each important stroke must be at least 10% of canvas width.
Scene/backdrop: a solid saturated cobalt-blue rounded square tile, with genuinely transparent corners outside the tile.
Subject: two large, chunky WHITE interlocking rounded chain links on a rising diagonal, with one prominent vivid GREEN check mark clearly integrated across the lower-right part of the link silhouette. Link holes must be wide and open. Check mark must be unmistakable, with a short left arm and a long rising right arm. The check is not enclosed in a circle or a badge.
Color palette: cobalt blue and vivid green from the existing blue/green identity, plus white for high contrast. White chain links dominate the tile; a clean blue separation keeps the green tick legible.
Constraints: balanced minimal composition, only the tile, links and check; no tiny gaps or thin outlines.
```

<!-- prettier-ignore -->
* * *

## 02-green-link：綠底鏈結

```text
Use case: logo-brand
Asset type: production Chrome extension icon for Duotify Link Checker, square bitmap master.
Primary request: design an original, highly recognizable icon communicating website link checking, optimized for a 16-pixel browser toolbar.
Style/medium: extremely clean flat vector-like raster logo, broad geometric shapes, crisp edges, optically centered.
Composition/framing: ONE icon only, filling almost the entire square with about 5% outer safe margin. Large simple symbol; substantial negative spaces that survive reduction to 16 pixels.
Text: no text, no letters, no numbers.
Constraints: genuine alpha transparency outside the icon silhouette; no checkerboard baked into the image. No gradients, shadows, glow, texture, 3D, mockups, frame, surrounding UI, labels, sheet of variants, watermark, or extra decoration. Each important stroke must be at least 10% of canvas width.
Scene/backdrop: a solid vivid-green rounded square tile with genuinely transparent corners outside the tile.
Subject: one large bold NAVY chain-link symbol built from two interlocking rounded oblong loops on a rising diagonal. A large WHITE check mark replaces the lower-right connecting stroke, so chain and check read as a single intentional logo. The mark is centered, geometrically simple, with huge holes and broad navy strokes. The white check has a short left arm and a long rising right arm and is clearly separated from the navy loops.
Color palette: vivid green and deep navy from the existing identity, plus white for the checking gesture. Strong navy/green and white/navy contrast.
Constraints: only tile and chain/check emblem; avoid a separate check badge, delicate geometry, or intricate weaving.
```

<!-- prettier-ignore -->
* * *

## 03-open-link-check：透明底鏈結勾號

```text
Use case: logo-brand
Asset type: production Chrome extension icon for Duotify Link Checker, square bitmap master.
Primary request: design an original, highly recognizable icon communicating website link checking, optimized for a 16-pixel browser toolbar.
Style/medium: extremely clean flat vector-like raster logo, broad geometric shapes, crisp edges, optically centered.
Composition/framing: ONE icon only, filling almost the entire square with about 5% outer safe margin. Large simple symbol; substantial negative spaces that survive reduction to 16 pixels.
Text: no text, no letters, no numbers.
Constraints: genuine alpha transparency outside the icon silhouette; no checkerboard baked into the image. No gradients, shadows, glow, texture, 3D, mockups, frame, surrounding UI, labels, sheet of variants, watermark, or extra decoration. Each important stroke must be at least 10% of canvas width.
Scene/backdrop: genuinely transparent background throughout, no tile, no circular container.
Subject: an oversized vivid COBALT-BLUE geometric open chain-link loop on a rising diagonal, fused with a vivid GREEN check mark. One bold rounded oblong link creates a large open negative-space center, while its lower-right segment transforms into a broad green check, with a clearly visible short left arm and long rising right arm. The two colors touch cleanly with no hairline separators. It must unmistakably suggest both a web link and a check mark as ONE bold compact silhouette.
Color palette: vivid cobalt blue and vivid green, brighter than the old deep-navy outline to stand out on dark and light toolbars.
Constraints: symbol occupies about 90% of the canvas, no backing tile, no badge, no border, no extra second small icon; extremely simple and legible at favicon scale.
```

<!-- prettier-ignore -->
* * *

## 04-unified-link-check：深藍底一體化鏈結勾號

```text
Use case: logo-brand
Asset type: production Chrome extension icon for Duotify Link Checker, square bitmap master.
Primary request: design an original, highly recognizable icon communicating website link checking, optimized for a 16-pixel browser toolbar.
Style/medium: extremely clean flat vector-like raster logo, broad geometric shapes, crisp edges, optically centered.
Composition/framing: ONE icon only, filling almost the entire square with about 5% outer safe margin. Large simple symbol; substantial negative spaces that survive reduction to 16 pixels.
Text: no text, no letters, no numbers.
Constraints: genuine alpha transparency outside the icon silhouette; no checkerboard baked into the image. No gradients, shadows, glow, texture, 3D, mockups, frame, surrounding UI, labels, sheet of variants, watermark, or extra decoration. Each important stroke must be at least 10% of canvas width.
Scene/backdrop: a solid deep-navy rounded square tile, with genuinely transparent corners outside the tile.
Subject: ONE extra-bold vivid-GREEN chain/check hybrid emblem. A single rounded oblong chain link rises diagonally; the open lower-right side is completed by a large check-mark gesture, creating a single unified green silhouette. The large open negative-space hole remains navy. The check has a short down-right arm and a long up-right arm, clearly visible as a check rather than an arrow. Prefer the minimum possible number of edges and broad uninterrupted strokes. Mark fills about 76% of the tile. No second symbol and no badge.
Color palette: only deep navy and vivid green from the existing identity, giving exceptionally high contrast and a distinctive simple silhouette.
Constraints: must read immediately as link plus check at 16 pixels; no tiny gaps, no skinny line work, no extra symbols.
```

<!-- prettier-ignore -->
* * *

## 第 1、2 版的透明區域修正

### 01-cobalt-link

```text
Use case: precise-object-edit
Asset type: Chrome extension icon with transparent outer corners.
Input images: Image 1 is the edit target.
Primary request: Repair ONLY the incorrectly transparent holes / smoky stains in the cobalt-blue rounded square backing tile. Make the ENTIRE interior of the rounded square perfectly opaque and uniform solid cobalt blue, including the empty upper-left region. Preserve the exact existing white interlocking chain links and vivid green check, their size, position, geometry and colors.
Constraints: retain genuine alpha transparency ONLY outside the rounded-square outer silhouette. Absolutely no transparent pixels, stains, cloudiness, texture, gradients or shadows inside the tile. Keep all white and green logo strokes unchanged. No text, no new objects, no mockup.
```

### 02-green-link

```text
Use case: precise-object-edit
Asset type: Chrome extension icon with transparent outer corners.
Input images: Image 1 is the edit target.
Primary request: Repair ONLY the large incorrectly transparent holes / smoky stains in the vivid-green rounded-square backing tile, especially the empty upper-left and lower-right regions. Make the ENTIRE interior of the rounded square perfectly opaque and uniform vivid green. Preserve the exact existing navy interlocking chain links and white check mark, their size, position, geometry and colors.
Constraints: retain genuine alpha transparency ONLY outside the rounded-square outer silhouette. Absolutely no transparent pixels, stains, cloudiness, texture, gradients or shadows inside the tile. Keep all navy and white logo strokes unchanged. No text, no new objects, no mockup.
```

第 1 版修正後保留透明外角。第 2 版的透明缺口仍存在，因此未採用該次修正輸出，改用下列提示詞生成最終版本。

```text
Use case: logo-brand
Asset type: NEW Chrome extension icon for Duotify Link Checker, square bitmap master.
Input images: Image 1 is a DESIGN REFERENCE ONLY for the navy chain and white check geometry; create a new image.
Primary request: create a clean, minimal icon with a fully opaque flat vivid-green background filling the ENTIRE square edge to edge. On top of it, place two bold navy interlocking rounded chain links on a rising diagonal and a large white check mark across the center, matching the reference emblem geometry. The empty upper-left and lower-right areas must be filled with exactly the same uniform vivid green as the rest of the backdrop.
Style/medium: flat geometric vector-like raster icon, large wide strokes, generous open link holes, legible at 16 pixels.
Scene/backdrop: 100% opaque, full-bleed uniform vivid-green square. No transparency anywhere, no rounded-square backing container, no border, no missing regions.
Color palette: vivid green, deep navy and white only, matching the existing blue/green identity.
Constraints: ONE icon, no text, no letters, no shadows, no gradients, no texture, no stains, no glow, no 3D, no mockup, no watermark. Preserve clear navy links and a white short-left-arm/long-right-arm check.
```

<!-- prettier-ignore -->
* * *

## 商店宣傳圖更新

```text
Use case: precise-object-edit
Asset type: Chrome Web Store small promotional tile for Duotify Link Checker, landscape 11:7.
Input images: Image 1 is the existing promotional tile and the edit target. Image 2 is the NEW approved extension icon, a deep-navy rounded square containing a vivid-green open chain link and check mark; use it as the exact replacement logo reference.
Primary request: Replace ONLY the old large central navy two-chain-link/green-tick logo in Image 1 with the new navy rounded-square icon from Image 2. Center the entire new icon as the single main subject, approximately 65% of the image height. Preserve the pale mint-green background, subtle surrounding small link motifs and sparse dots, and the clean uncluttered composition of Image 1. Reproduce the exact silhouette, rounded-square backing, vivid-green chain and check geometry of Image 2 without redesigning it.
Constraints: opaque background throughout, no alpha; no text, no letters, no watermark, no additional central icons, no device mockup. Preserve landscape 11:7 composition and existing background palette.
```
