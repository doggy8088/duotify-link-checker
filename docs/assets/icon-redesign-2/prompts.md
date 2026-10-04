# 第二輪圖示生成提示詞

2026-10-04 使用內建 imagegen 工具，四個方向各呼叫一次，未使用 CLI/API fallback。圖示原始檔保存在本目錄，第二輪曾採用第 1 版黑白字母標誌，後由第三輪第 3 版焦點掃描取代。第 1、2、4 版為不透明背景，第 3 版保留生成檔的 alpha。

<!-- prettier-ignore -->
* * *

## 01-swiss-monogram：黑白字母標誌

```text
Use case: logo-brand
Asset type: original production browser-extension icon for Duotify Link Checker, a tool that checks website links.
Primary request: completely fresh icon design with a distinctive identity, readable at 16 and 32 pixels.
Composition/framing: square canvas, ONE icon, centered and filling most of the canvas, about 6% safe margin. Broad uninterrupted shapes and generous internal openings; no tiny decorative detail. Treat small-size legibility as a hard design constraint.
Constraints: no surrounding UI, presentation board, mockup, multiple icons, watermark, captions, or extra objects. Do not copy existing logos.
Scene/backdrop: fully opaque warm-white square, edge to edge, absolutely uniform.
Subject: a custom uppercase letter D for Duotify. Make one huge black geometric D with an unusually bold vertical stem and a generous open counter. Integrate a large rising check-mark-shaped negative-space cut into the lower part of the D; it should feel structurally part of the letter, not a separate badge. The D must remain easy to recognize.
Style/medium: strict Swiss typographic identity, black-and-white editorial minimalism, architectural geometry, precise optical balance. Flat, no effects.
Color palette: only near-black and warm white; no blue, no green.
Text (verbatim): "D" — only this one custom letter, no other lettering.
Constraints: chunky shapes with broad cuts that survive a 16-pixel rendering; no chain-link symbol, rounded blue tile, gradient, shadow, texture, 3D or extra tick outside the letter.
```

<!-- prettier-ignore -->
* * *

## 02-pixel-inspector：復古像素檢查鏡

```text
Use case: logo-brand
Asset type: original production browser-extension icon for Duotify Link Checker, a tool that checks website links.
Primary request: completely fresh icon design with a distinctive identity, readable at 16 and 32 pixels.
Composition/framing: square canvas, ONE icon, centered and filling most of the canvas, about 6% safe margin. Broad uninterrupted shapes and generous internal openings; no tiny decorative detail. Treat small-size legibility as a hard design constraint.
Constraints: no surrounding UI, presentation board, mockup, multiple icons, watermark, captions, or extra objects. Do not copy existing logos.
Scene/backdrop: fully opaque charcoal square, edge to edge.
Subject: one bold amber pixel-art magnifying glass, with a large square-stepped lens and a short diagonal block handle. Inside the lens, one large cream-white stepped check mark occupies the open center. The lens and handle are the only amber object. The checking gesture must remain clear at 16 pixels.
Style/medium: authentic carefully designed 16×16 pixel art, early computer utility aesthetic, exact square pixel blocks, strong stair-step contours, zero smooth curves. Enlarge this native pixel design without smoothing.
Color palette: amber, charcoal, and a small amount of cream-white, like a classic terminal display; flat solid colors.
Text: no text, no letters, no numbers.
Constraints: deliberate coarse pixel geometry, not a smooth vector icon with a pixel texture. No CRT scanlines, glow, noise, tiny buttons, chain links, 3D, gradients or decorative sparks. Keep a compact recognizable magnifier silhouette.
```

<!-- prettier-ignore -->
* * *

## 03-sculpted-link：金屬立體鏈結

```text
Use case: stylized-concept
Asset type: original production browser-extension icon for Duotify Link Checker, a tool that checks website links.
Primary request: completely fresh icon design with a distinctive identity, readable at 16 and 32 pixels.
Composition/framing: square canvas, ONE icon, centered and filling most of the canvas, about 6% safe margin. Broad uninterrupted shapes and generous internal openings; no tiny decorative detail. Treat small-size legibility as a hard design constraint.
Constraints: no surrounding UI, presentation board, mockup, multiple icons, watermark, captions, or extra objects. Do not copy existing logos.
Scene/backdrop: genuinely transparent background outside the object, with no backing tile and no ground plane.
Subject: exactly TWO oversized chunky interlocking oblong chain links, one brushed warm copper and one satin pearl-white metal. Their openings are extremely generous and the overlap is simple, so the link relationship is immediately readable at thumbnail size. Compact diagonal arrangement with one link rising slightly behind the other.
Style/medium: sculptural premium industrial-object icon, restrained 3D, softly bevelled thick forms, satin surfaces, subtle realistic studio shading. Strong clean silhouette rather than intricate photorealism.
Lighting/mood: broad soft light, bright readable front faces, simple controlled highlights, no dramatic dark spots.
Materials/textures: warm copper and pearl-white satin metal; avoid tiny texture and mirror reflections.
Text: no text or letters.
Constraints: actual alpha transparency, no cast shadow outside the object, no green check mark, no badge, no blue backing tile, no perspective scene, no stand, no extra links. Icon only; material shading must not obscure the silhouette.
```

<!-- prettier-ignore -->
* * *

## 04-brush-link：粗筆觸鏈結勾號

```text
Use case: logo-brand
Asset type: original production browser-extension icon for Duotify Link Checker, a tool that checks website links.
Primary request: completely fresh icon design with a distinctive identity, readable at 16 and 32 pixels.
Composition/framing: square canvas, ONE icon, centered and filling most of the canvas, about 6% safe margin. Broad uninterrupted shapes and generous internal openings; no tiny decorative detail. Treat small-size legibility as a hard design constraint.
Constraints: no surrounding UI, presentation board, mockup, multiple icons, watermark, captions, or extra objects. Do not copy existing logos.
Scene/backdrop: fully opaque warm vermilion square, edge to edge, flat and uniform.
Subject: one large off-white hand-brushed continuous mark suggesting a horizontal open chain link whose final upward stroke becomes a check mark. Use a confident broad ink-like stroke, an asymmetrical hand-made gesture and one large open internal space. The final check gesture has a short downstroke and a longer rising arm. One connected emblem only.
Style/medium: expressive Japanese-inspired brush-signature logo, bold modern print identity, broad tapered strokes and slightly organic edges, controlled rather than messy. Flat two-color graphic, not a painting scene.
Color palette: warm vermilion background and off-white brush mark only; no navy, no blue, no green.
Text: no words, no letterforms, no calligraphy characters.
Constraints: enough brush character to distinguish it from geometric vector logos, but NO delicate bristles, splatter, paper grain, tiny gaps, rough distress, extra decorative strokes, gradients, shadow or 3D. Recognition must come from the bold silhouette, not fine texture.
```

<!-- prettier-ignore -->
* * *

## 第 1 版商店宣傳圖

```text
Use case: logo-brand
Asset type: Chrome Web Store promotional tile for Duotify Link Checker, landscape 11:7 aspect ratio.
Input images: Image 1 is the approved NEW black-and-white custom D/check monogram. It is an exact logo reference, not an edit target.
Primary request: create a restrained Swiss graphic identity promotional tile around this exact custom D/check monogram. Place one large black monogram in the center of a fully opaque, uniform warm-white landscape field, with the monogram about 72% of the image height. Reproduce the letter's exact heavy vertical stem, curved outer right edge, generous counter and integrated checking gesture from Image 1 without redesigning it.
Style/medium: flat typographic identity, minimal editorial composition, confident black/white contrast, precise balance.
Color palette: black and warm-white only, matching the reference.
Constraints: only the monogram and background. No words, no other letters, no captions, no blue, no green, no chain decorations, no dots, no gradients, no texture, no shadows, no 3D, no mockup, no watermark. Fully opaque image, no alpha.
```
