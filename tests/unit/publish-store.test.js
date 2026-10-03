// @vitest-environment node
import { it, expect, vi } from "vitest";
import { publishStore } from "../../scripts/publish-store.mjs";
const env = {
  CWS_PUBLISHER_ID: "publisher-1",
  CWS_EXTENSION_ID: "a".repeat(32),
  CWS_CLIENT_ID: "id",
  CWS_CLIENT_SECRET: "secret",
  CWS_REFRESH_TOKEN: "refresh",
};
function setup(results) {
  const fetchImpl = vi.fn();
  for (const result of results)
    fetchImpl.mockResolvedValueOnce({ ok: true, json: async () => result });
  return {
    env,
    fetchImpl,
    sleep: vi.fn(),
    read: async (file) =>
      file.endsWith(".json") ? '{"version":"1.0.0"}' : new Uint8Array([1, 2]),
  };
}
it("uploads verified ZIP and publishes after async processing", async () => {
  const options = setup([
    { access_token: "token" },
    { uploadState: "IN_PROGRESS" },
    { lastAsyncUploadState: "SUCCEEDED" },
    { state: "PENDING_REVIEW" },
  ]);
  expect(await publishStore(options)).toEqual({
    version: "1.0.0",
    state: "PENDING_REVIEW",
  });
  expect(options.fetchImpl.mock.calls[1][0]).toContain(
    "/upload/v2/publishers/",
  );
  expect(options.fetchImpl.mock.calls[3][1].body).toContain(
    '"skipReview":false',
  );
});
it("accepts a synchronous upload", async () => {
  expect(
    (
      await publishStore(
        setup([
          { access_token: "token" },
          { uploadState: "SUCCEEDED", crxVersion: "1.0.0" },
          { state: "PENDING_REVIEW" },
        ]),
      )
    ).state,
  ).toBe("PENDING_REVIEW");
});
it.each(["FAILED", "NOT_FOUND", undefined])(
  "does not publish upload state %s",
  async (state) => {
    const options = setup([{ access_token: "token" }, { uploadState: state }]);
    await expect(publishStore(options)).rejects.toThrow(
      "Upload did not succeed",
    );
    expect(options.fetchImpl).toHaveBeenCalledTimes(2);
  },
);
it("bounds upload polling", async () => {
  const options = setup([
    { access_token: "token" },
    { uploadState: "UPLOAD_IN_PROGRESS" },
    ...Array(30).fill({ lastAsyncUploadState: "IN_PROGRESS" }),
  ]);
  await expect(publishStore(options)).rejects.toThrow("Upload did not succeed");
  expect(options.sleep).toHaveBeenCalledTimes(30);
});
it.each(Object.keys(env))("requires %s", async (key) => {
  await expect(
    publishStore({ ...setup([]), env: { ...env, [key]: "" } }),
  ).rejects.toThrow(`Missing ${key}`);
});
it("rejects malformed identifiers", async () =>
  await expect(
    publishStore({ ...setup([]), env: { ...env, CWS_EXTENSION_ID: "../bad" } }),
  ).rejects.toThrow("Invalid"));
it("does not echo authentication response bodies on errors", async () => {
  const options = setup([]);
  options.fetchImpl.mockResolvedValue({ ok: false, status: 401 });
  await expect(publishStore(options)).rejects.toThrow("HTTP 401");
});
it("requires an access token", async () =>
  await expect(publishStore(setup([{}]))).rejects.toThrow("access token"));
it("checks the uploaded version", async () =>
  await expect(
    publishStore(
      setup([
        { access_token: "token" },
        { uploadState: "SUCCEEDED", crxVersion: "2.0.0" },
      ]),
    ),
  ).rejects.toThrow("version mismatch"));
it("requires a publish state", async () =>
  await expect(
    publishStore(
      setup([{ access_token: "token" }, { uploadState: "SUCCEEDED" }, {}]),
    ),
  ).rejects.toThrow("submission state"));
