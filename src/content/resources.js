// Adapted from LinkChecker.user.js 1.1.0 by Will 保哥 (MIT).
export function isVisible(element) {
  if (!(element instanceof Element) || !element.isConnected) {
    return false;
  }

  if (typeof element.checkVisibility === "function") {
    try {
      if (
        !element.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true,
        })
      ) {
        return false;
      }
    } catch {
      // Fall back to manual checks.
    }
  }

  const style = getComputedStyle(element);

  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  ) {
    return false;
  }

  return Array.from(element.getClientRects()).some(
    (rect) => rect.width > 0 && rect.height > 0,
  );
}

/*
 * ============================================================
 * URL helpers
 * ============================================================
 */

export function absoluteUrl(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, document.baseURI).href;
  } catch {
    return value;
  }
}

export function parseUrl(value) {
  try {
    return new URL(value, document.baseURI);
  } catch {
    return null;
  }
}

export function isExternalUrl(url) {
  const parsed = parseUrl(url);

  if (!parsed) {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  return parsed.origin !== location.origin;
}

export function getScope(url) {
  return isExternalUrl(url) ? "external" : "internal";
}

export function shouldIncludeRecord(record, mode) {
  if (mode === "all") {
    return true;
  }

  if (mode === "external") {
    return isExternalUrl(record.url);
  }

  return false;
}

/*
 * ============================================================
 * Collect visible resources
 * ============================================================
 */

export function extractCssImageUrls(value) {
  /*
   * 從計算後樣式讀取 url()，讓外部樣式表的相對網址由瀏覽器解析。
   * 不依副檔名判斷圖片；多層背景與 image-set() 中的 URL 都須檢查。
   * 引號中的括號與 CSS 跳脫字元屬於網址內容，不能直接以右括號切割。
   */
  const urls = new Set();
  const pattern =
    /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\burl\(\s*(?:"((?:\\[\s\S]|[^"\\])*)"|'((?:\\[\s\S]|[^'\\])*)'|((?:\\[\s\S]|[^)\\])*))\s*\)/gi;

  for (const match of (value || "").matchAll(pattern)) {
    // content 的純文字可能包含 url(...)；獨立字串不是圖片來源。
    if (
      match[1] === undefined &&
      match[2] === undefined &&
      match[3] === undefined
    ) {
      continue;
    }

    const escaped = match[1] ?? match[2] ?? match[3].trim();
    const url = escaped.replace(
      /\\(?:([0-9a-f]{1,6})[\t\n\f\r ]?|\r\n|[\n\r\f]|([\s\S]))/gi,
      (escape, hex, character) => {
        if (!hex) {
          return character || "";
        }

        const code = parseInt(hex, 16);
        return code === 0 ||
          code > 0x10ffff ||
          (code >= 0xd800 && code <= 0xdfff)
          ? "\uFFFD"
          : String.fromCodePoint(code);
      },
    );

    if (url) {
      urls.add(absoluteUrl(url));
    }
  }

  return urls;
}

export function collectCssImages(element, add) {
  const properties = [
    "background-image",
    "border-image-source",
    "list-style-image",
    "mask-image",
    "-webkit-mask-image",
    "content",
  ];

  /*
   * 計算後樣式涵蓋行內 CSS 與樣式表，無須讀取可能受跨來源限制的 cssRules。
   * 偽元素沒有獨立 DOM 節點，報表與框線使用其所屬元素，並保留來源名稱。
   * 同一圖片的標準與 WebKit 屬性別名只建立一筆，避免重複列入統計。
   */
  for (const pseudo of ["", "::before", "::after"]) {
    const style = getComputedStyle(element, pseudo || null);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0 ||
      (pseudo && (style.content === "none" || style.content === "normal"))
    ) {
      continue;
    }

    const seen = new Set();

    for (const property of properties) {
      // list-style-image 會繼承，但只有 list-item 本身繪製項目符號。
      if (
        property === "list-style-image" &&
        !style.display.split(" ").includes("list-item")
      ) {
        continue;
      }

      for (const url of extractCssImageUrls(style.getPropertyValue(property))) {
        if (seen.has(url)) {
          continue;
        }

        seen.add(url);
        add({
          element,
          type: "image",
          typeLabel: "Image",
          url,
          source: `CSS ${pseudo ? `${pseudo} ` : ""}${property}`,
          cssImage: true,
        });
      }
    }
  }
}
