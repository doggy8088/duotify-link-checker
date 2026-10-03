import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import {
  absoluteUrl,
  parseUrl,
  isExternalUrl,
  getScope,
  shouldIncludeRecord,
  extractCssImageUrls,
  collectCssImages,
  isVisible,
} from "../../src/content/resources.js";
import { classifySpecialUrl } from "../../src/content/special.js";
import { applyElementStatus, clearMarks } from "../../src/content/highlight.js";

beforeEach(() => {
  document.body.innerHTML = "";
});
afterEach(() => vi.restoreAllMocks());
describe("URLs and CSS parsing", () => {
  it("resolves relative and empty URLs", () => {
    expect(absoluteUrl("/a")).toBe("https://example.com/a");
    expect(absoluteUrl("")).toBe("");
  });
  it("handles malformed URLs", () => {
    expect(absoluteUrl("http://[")).toBe("http://[");
    expect(parseUrl("http://[")).toBeNull();
    expect(isExternalUrl("http://[")).toBe(false);
  });
  it.each([
    ["/a", false],
    ["https://other.example/a", true],
    ["http://example.com", true],
    ["https://example.com:444", true],
    ["mailto:x@y", false],
  ])("compares origins for %s", (url, external) => {
    expect(isExternalUrl(url)).toBe(external);
    expect(getScope(url)).toBe(external ? "external" : "internal");
    expect(shouldIncludeRecord({ url }, "external")).toBe(external);
  });
  it("rejects unknown scan modes", () => {
    expect(shouldIncludeRecord({ url: "/a" }, "all")).toBe(true);
    expect(shouldIncludeRecord({ url: "/a" }, "unknown")).toBe(false);
  });
  it.each([
    ["none", []],
    ["", []],
    [null, []],
    ['url("/a.png")', ["/a.png"]],
    ["url(/a.png),url(/a.png)", ["/a.png"]],
    ["url('/a(2).png'), url(/b.png)", ["/a(2).png", "/b.png"]],
    ["image-set(url(/a.png) 1x, url(/b.png) 2x)", ["/a.png", "/b.png"]],
    ['"literal url(/fake.png)"', []],
    ["url(/a\\).png)", ["/a).png"]],
    ["url(/a\\20 b.png)", ["/a%20b.png"]],
    ["url(/\\000000.png)", ["/�.png"]],
    ["url(/\\D800.png)", ["/�.png"]],
    ["url(/\\110000.png)", ["/�.png"]],
    ['url("/a\\\nb.png")', ["/ab.png"]],
  ])("extracts CSS URLs %s", (value, expected) =>
    expect([...extractCssImageUrls(value)]).toEqual(
      expected.map((v) => absoluteUrl(v)),
    ),
  );
  it("deduplicates aliases, skips inherited lists and nonexistent pseudo elements", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
      (_element, pseudo) => ({
        display: "block",
        visibility: "visible",
        opacity: "1",
        content: pseudo ? "none" : "normal",
        getPropertyValue: (key) =>
          ["mask-image", "-webkit-mask-image", "list-style-image"].includes(key)
            ? "url(/a.svg)"
            : "none",
      }),
    );
    const add = vi.fn();
    collectCssImages(document.body, add);
    expect(add).toHaveBeenCalledOnce();
    expect(add.mock.calls[0][0].source).toBe("CSS mask-image");
  });
  it("collects list markers and visible pseudo elements", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
      (_element, pseudo) => ({
        display: "list-item",
        visibility: "visible",
        opacity: "1",
        content: '""',
        getPropertyValue: (key) =>
          key === "list-style-image"
            ? `url(/${pseudo ? "pseudo" : "list"}.png)`
            : "none",
      }),
    );
    const add = vi.fn();
    collectCssImages(document.body, add);
    expect(add).toHaveBeenCalledTimes(3);
  });
  it("skips hidden CSS styles", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      display: "none",
    });
    const add = vi.fn();
    collectCssImages(document.body, add);
    expect(add).not.toHaveBeenCalled();
  });
});
describe("visibility", () => {
  it("ignores non-elements and detached elements", () => {
    expect(isVisible(null)).toBe(false);
    expect(isVisible(document.createElement("a"))).toBe(false);
  });
  it.each(["display:none", "visibility:hidden", "opacity:0", ""])(
    "handles %s with no visible box",
    (style) => {
      document.body.innerHTML = `<a style="${style}">a</a>`;
      expect(isVisible(document.querySelector("a"))).toBe(false);
    },
  );
  it("accepts a rendered box and falls back when checkVisibility throws", () => {
    const a = document.createElement("a");
    document.body.append(a);
    a.checkVisibility = () => {
      throw new Error();
    };
    a.getClientRects = () => [{ width: 10, height: 10 }];
    expect(isVisible(a)).toBe(true);
    a.checkVisibility = () => false;
    expect(isVisible(a)).toBe(false);
  });
});
const record = (url, type = "link", extra = {}) => ({
  url,
  type,
  element: document.createElement(type === "image" ? "img" : "a"),
  ...extra,
});
describe("special resources", () => {
  it("recognizes the page-top fragment without an HTTP request", () => {
    expect(
      classifySpecialUrl(record("https://example.com/page?x=1#")),
    ).toMatchObject({ status: "valid", note: "Page-top fragment" });
  });
  it.each([
    ["", "invalid"],
    ["http://[", "invalid"],
    ["javascript:alert(1)", "skipped"],
    ["mailto:x@y", "skipped"],
    ["tel:123", "skipped"],
    ["sms:123", "skipped"],
    ["ftp://x/a", "skipped"],
    ["data:text/plain,a", "skipped"],
    ["blob:https://x/id", "skipped"],
  ])("%s → %s", (url, status) =>
    expect(classifySpecialUrl(record(url)).status).toBe(status),
  );
  it("leaves HTTP URLs to the network", () =>
    expect(classifySpecialUrl(record("https://other.example/a"))).toBeNull());
  it.each(["data:image/png,a", "blob:https://example.com/id"])(
    "checks image load state for %s",
    (url) => {
      expect(
        classifySpecialUrl(
          record(url, "image", {
            element: { complete: true, naturalWidth: 20 },
          }),
        ).status,
      ).toBe("valid");
      expect(
        classifySpecialUrl(
          record(url, "image", { element: { complete: false } }),
        ).status,
      ).toBe("invalid");
      expect(
        classifySpecialUrl(record(url, "image", { cssImage: true })).status,
      ).toBe("skipped");
    },
  );
  it.each(["video", "audio"])("checks local %s state", (type) => {
    expect(
      classifySpecialUrl(
        record("blob:https://example.com/id", type, {
          element: { readyState: 2, error: null },
        }),
      ).status,
    ).toBe("valid");
    expect(
      classifySpecialUrl(
        record("blob:https://example.com/id", type, {
          element: { readyState: 0, error: {} },
        }),
      ).status,
    ).toBe("invalid");
  });
  it("finds id, named and encoded fragment targets", () => {
    document.body.innerHTML =
      '<div id="測試"></div><a name="legacy"></a><div id="%bad"></div>';
    for (const hash of ["%E6%B8%AC%E8%A9%A6", "legacy", "%bad"])
      expect(
        classifySpecialUrl(record(`https://example.com/page?x=1#${hash}`))
          .status,
      ).toBe("valid");
    expect(
      classifySpecialUrl(record("https://example.com/page?x=1#missing")).status,
    ).toBe("invalid");
  });
  it("skips local SVG masks while checking external SVG masks", () => {
    expect(
      classifySpecialUrl(
        record("https://example.com/page?x=1#mask", "image", {
          cssImage: true,
          source: "CSS mask-image",
        }),
      ).status,
    ).toBe("skipped");
    expect(
      classifySpecialUrl(
        record("https://other.example/a.svg#mask", "image", {
          cssImage: true,
          source: "CSS mask-image",
        }),
      ),
    ).toBeNull();
  });
});
describe("highlights", () => {
  it("retains the highest severity independent of completion order and clears marks", () => {
    const element = document.createElement("div");
    document.body.append(element);
    const a = { element, type: "link" },
      b = { element, type: "image" };
    applyElementStatus(a, "invalid");
    applyElementStatus(b, "valid");
    expect(element.dataset.duotifyLinkCheckStatus).toBe("invalid");
    expect(element.dataset.duotifyLinkCheckType).toBe("link");
    clearMarks();
    expect(element.attributes.length).toBe(0);
    applyElementStatus(b, "checking");
    applyElementStatus(a, "skipped");
    expect(element.dataset.duotifyLinkCheckStatus).toBe("checking");
  });
});
