import { it, expect, vi, afterEach } from "vitest";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function setup(
  sender = {
    id: "extension",
    tab: { id: 1 },
    frameId: 0,
    url: "https://example.com/",
  },
) {
  let connect;
  vi.stubGlobal("chrome", {
    runtime: {
      id: "extension",
      onConnect: {
        addListener: (fn) => {
          connect = fn;
        },
      },
    },
  });
  vi.resetModules();
  await import("../../src/background.js");
  const port = {
    name: "duotify-check",
    sender,
    disconnect: vi.fn(),
    postMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
    onDisconnect: { addListener: vi.fn() },
  };
  connect(port);
  return port;
}
it.each([
  {},
  { id: "other" },
  { id: "extension" },
  { id: "extension", tab: {}, frameId: 2, url: "https://x" },
  { id: "extension", tab: {}, frameId: 0, url: "chrome://settings" },
])("rejects untrusted or unsupported port sender %j", async (sender) =>
  expect((await setup(sender)).disconnect).toHaveBeenCalledOnce(),
);
it("validates messages before sending any request", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const port = await setup();
  const onMessage = port.onMessage.addListener.mock.calls[0][0];
  await onMessage({ id: "invalid" });
  expect(port.postMessage).not.toHaveBeenCalled();
  await onMessage({ id: 1, url: "file:///a", resourceType: "link" });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(port.postMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 1,
      result: expect.objectContaining({ status: "skipped" }),
    }),
  );
});
it("returns real HTTP results", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      url: "https://x/",
    })),
  );
  const port = await setup();
  await port.onMessage.addListener.mock.calls[0][0]({
    id: 2,
    url: "https://x/",
    resourceType: "link",
  });
  expect(port.postMessage).toHaveBeenCalledWith({
    id: 2,
    result: expect.objectContaining({ status: "valid" }),
  });
});
it("limits requests to eight and aborts them when disconnected", async () => {
  const signals = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((_url, { signal }) => {
      signals.push(signal);
      return new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(signal.reason)),
      );
    }),
  );
  const port = await setup();
  const onMessage = port.onMessage.addListener.mock.calls[0][0];
  const promises = Array.from({ length: 9 }, (_, id) =>
    onMessage({ id, url: "https://x", resourceType: "link" }),
  );
  expect(signals).toHaveLength(8);
  expect(port.postMessage.mock.calls[0][0].result.note).toContain("concurrent");
  port.onDisconnect.addListener.mock.calls[0][0]();
  await Promise.all(promises);
  expect(signals.every((signal) => signal.aborted)).toBe(true);
});
