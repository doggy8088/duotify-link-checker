import { parseUrl } from "./resources.js";

export function classifySpecialUrl(record) {
  const { url, element, type } = record;

  if (!url) {
    return {
      status: "invalid",

      httpStatus: "",

      note: "Empty URL",
    };
  }

  const parsed = parseUrl(url);

  if (!parsed) {
    return {
      status: "invalid",

      httpStatus: "",

      note: "Malformed URL",
    };
  }

  /*
   * data: / blob:
   */
  if (parsed.protocol === "data:" || parsed.protocol === "blob:") {
    if (type === "image") {
      /*
       * CSS 的 data/blob 圖片沒有 HTTP 標頭，也沒有 IMG 的載入狀態。
       * 不可用所屬元素的 naturalWidth 判斷另一張圖片，故明確標示跳過。
       */
      if (record.cssImage) {
        return {
          status: "skipped",
          httpStatus: "",
          note: `${parsed.protocol.slice(0, -1)} CSS image; no HTTP Content-Type to validate`,
        };
      }

      const ok = element.complete && element.naturalWidth > 0;

      return {
        status: ok ? "valid" : "invalid",

        httpStatus: "",

        note:
          `${parsed.protocol.slice(0, -1)} resource; ` +
          "checked by DOM load state",
      };
    }

    if (type === "video" || type === "audio") {
      const ok =
        !element.error && element.readyState > HTMLMediaElement.HAVE_NOTHING;

      return {
        status: ok ? "valid" : "invalid",

        httpStatus: "",

        note:
          `${parsed.protocol.slice(0, -1)} resource; ` +
          "checked by media state",
      };
    }

    return {
      status: "skipped",

      httpStatus: "",

      note: `${parsed.protocol.slice(0, -1)} URL ` + "is not an HTTP resource",
    };
  }

  if (parsed.protocol === "javascript:") {
    return {
      status: "skipped",

      httpStatus: "",

      note: "javascript: URL skipped",
    };
  }

  if (["mailto:", "tel:", "sms:"].includes(parsed.protocol)) {
    return {
      status: "skipped",

      httpStatus: "",

      note:
        `${parsed.protocol.slice(0, -1)} URL ` +
        "cannot be validated using HTTP",
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      status: "skipped",

      httpStatus: "",

      note: `Unsupported protocol: ${parsed.protocol}`,
    };
  }

  /*
   * 頁內 SVG mask 的 url(#id) 引用 DOM，並非另外下載圖片。
   * 不應重新請求 HTML 頁面，再因 text/html 誤報為無效圖片。
   * 外部 SVG 遮罩仍走正常 HTTP 與 image/* 驗證。
   */
  if (
    record.cssImage &&
    record.source.endsWith("mask-image") &&
    parsed.origin === location.origin &&
    parsed.pathname === location.pathname &&
    parsed.search === location.search &&
    parsed.hash
  ) {
    return {
      status: "skipped",
      httpStatus: "",
      note: "In-page CSS mask reference; no separate HTTP image response",
    };
  }

  /*
   * In-page fragment
   */
  if (
    type === "link" &&
    parsed.origin === location.origin &&
    parsed.pathname === location.pathname &&
    parsed.search === location.search &&
    (parsed.hash || parsed.href.endsWith("#"))
  ) {
    let fragment;

    try {
      fragment = decodeURIComponent(parsed.hash.slice(1));
    } catch {
      fragment = parsed.hash.slice(1);
    }

    if (!fragment) {
      return {
        status: "valid",

        httpStatus: "",

        note: "Page-top fragment",
      };
    }

    const target =
      document.getElementById(fragment) ||
      document.getElementsByName(fragment)[0];

    return {
      status: target ? "valid" : "invalid",

      httpStatus: "",

      note: target
        ? "In-page fragment target found"
        : "In-page fragment target not found",
    };
  }

  return null;
}

/*
 * ============================================================
 * Browser-like request headers
 * ============================================================
 */
