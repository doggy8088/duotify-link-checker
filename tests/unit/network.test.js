import { describe, it, expect, vi } from "vitest";
import {
  normalizeRequest,
  acceptHeader,
  isImageContentType,
  successful,
  probe,
  checkHttp,
} from "../../src/core/network.js";

const response = (
  status,
  contentType = "text/html",
  url = "https://example.com/test",
) => ({
  status,
  statusText: "",
  url,
  headers: new Headers(
    contentType === null ? {} : { "Content-Type": contentType },
  ),
  body: { cancel: vi.fn() },
});
describe("request boundary", () => {
  it("normalizes fragments and URL casing", () =>
    expect(
      normalizeRequest({
        url: "https://EXAMPLE.com/test#a",
        resourceType: "link",
      }),
    ).toEqual({ url: "https://example.com/test", type: "link" }));
  it.each([
    undefined,
    {},
    { url: 5, resourceType: "link" },
    { url: "https://x", resourceType: "iframe" },
    { url: "x".repeat(65537), resourceType: "link" },
    { url: "not a url", resourceType: "link" },
    ...[
      "file:///tmp/a",
      "javascript:alert(1)",
      "data:text/plain,x",
      "ftp://example.com/a",
      "https://user:pass@example.com",
    ].map((url) => ({ url, resourceType: "link" })),
  ])("rejects invalid input %j", (message) =>
    expect(() => normalizeRequest(message)).toThrow(),
  );
  it.each(["image", "video", "audio", "link"])(
    "sets an Accept header for %s",
    (type) => expect(acceptHeader(type)).toContain("*/*;q=0.8"),
  );
});
describe("MIME validation", () => {
  it.each([
    "image/png",
    "image/svg+xml",
    "image/vnd.microsoft.icon",
    "image/avif",
  ])("accepts %s", (value) => expect(isImageContentType(value)).toBe(true));
  it.each([
    "image/*",
    "image/",
    "text/html",
    "",
    null,
    "IMAGE/PNG",
    "image/png; charset=x",
  ])("rejects %s", (value) => expect(isImageContentType(value)).toBe(false));
  it.each([200, 204, 206, 299])(
    "accepts successful non-image status %d",
    (status) => expect(successful("link", { status })).toBe(true),
  );
  it.each([0, 199, 300, 304, 400, 404, 500])(
    "rejects non-final/error status %d",
    (status) => expect(successful("link", { status })).toBe(false),
  );
});
describe("HTTP probes", () => {
  it("reads headers, normalizes MIME, cancels body and omits credentials/referrer", async () => {
    const res = response(200, "IMAGE/PNG; charset=UTF-8");
    const fetchImpl = vi.fn(async () => res);
    expect(await probe(res.url, "image", "GET", { fetchImpl })).toMatchObject({
      status: 200,
      contentType: "image/png",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      res.url,
      expect.objectContaining({
        method: "GET",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        redirect: "follow",
        cache: "no-store",
      }),
    );
    expect(res.body.cancel).toHaveBeenCalledOnce();
  });
  it("handles missing MIME and URL and absent response body", async () => {
    const res = response(204, null, "");
    res.body = null;
    expect(
      await probe("https://example.com/a", "link", "HEAD", {
        fetchImpl: async () => res,
      }),
    ).toMatchObject({ contentType: "", finalUrl: "https://example.com/a" });
  });
  it("does not lose headers if cancelling body rejects", async () => {
    const res = response(200);
    res.body.cancel = async () => {
      throw new Error("closed");
    };
    expect(
      (await probe(res.url, "link", "GET", { fetchImpl: async () => res }))
        .status,
    ).toBe(200);
  });
  it("handles network failure", async () =>
    expect(
      await probe("https://x", "link", "HEAD", {
        fetchImpl: async () => {
          throw new Error("offline");
        },
      }),
    ).toMatchObject({ status: 0, statusText: "Network error" }));
  it("reports timeout", async () => {
    const fetchImpl = (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(signal.reason)),
      );
    expect(
      await probe("https://x", "link", "GET", { fetchImpl, timeout: 5 }),
    ).toMatchObject({ status: 0, statusText: "Timeout" });
  });
  it("reports cancellation", async () => {
    const signal = AbortSignal.abort();
    expect(
      await probe("https://x", "link", "GET", {
        signal,
        fetchImpl: async () => {
          throw signal.reason;
        },
      }),
    ).toMatchObject({ statusText: "Cancelled" });
  });
});
describe("HEAD and GET decision matrix", () => {
  it.each([
    ["link", 200, "text/html", null, null, "valid", 1],
    ["image", 200, "image/png", null, null, "valid", 1],
    ["link", 405, "text/html", 200, "text/html", "valid", 2],
    ["image", 200, null, 200, "image/png", "valid", 2],
    ["image", 200, "text/html", 200, "text/html", "invalid", 2],
    ["image", 200, "image/*", 200, null, "invalid", 2],
    ["link", 404, "text/html", 404, "text/html", "invalid", 2],
    ["video", 500, null, 206, "video/mp4", "valid", 2],
    ["audio", 500, null, 200, "audio/mpeg", "valid", 2],
    ["link", 429, null, null, null, "skipped", 1],
    ["link", 404, null, 429, null, "skipped", 2],
    ["link", 403, null, 403, null, "skipped", 2],
    ["link", 401, null, 401, null, "skipped", 2],
    ["link", 503, null, 503, null, "invalid", 2],
  ])(
    "%s: HEAD %s (%s) → GET %s (%s) = %s",
    async (type, head, hm, get, gm, status, calls) => {
      const fetchImpl = vi
        .fn()
        .mockResolvedValueOnce(response(head, hm))
        .mockResolvedValueOnce(response(get, gm));
      expect(
        (await checkHttp("https://example.com/test", type, { fetchImpl }))
          .status,
      ).toBe(status);
      expect(fetchImpl).toHaveBeenCalledTimes(calls);
    },
  );
  it("records redirects", async () =>
    expect(
      (
        await checkHttp("https://example.com/old", "link", {
          fetchImpl: async () => response(200),
        })
      ).note,
    ).toContain("→ https://example.com/test"));
  it("network failures remain uncertain", async () =>
    expect(
      await checkHttp("https://x", "link", {
        fetchImpl: async () => {
          throw new Error();
        },
      }),
    ).toMatchObject({ status: "skipped", httpStatus: "" }));
  it("does not retry a cancelled request", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error();
    });
    await checkHttp("https://x", "link", {
      fetchImpl,
      signal: AbortSignal.abort(),
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
