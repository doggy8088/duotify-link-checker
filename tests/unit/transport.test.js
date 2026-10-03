import { it, expect, vi, afterEach } from "vitest";
import { createTransport } from "../../src/content/transport.js";
afterEach(() => vi.useRealTimers());
function mockRuntime() {
  const port = {
    onMessage: { addListener: vi.fn() },
    onDisconnect: { addListener: vi.fn() },
    postMessage: vi.fn(),
    disconnect: vi.fn(),
  };
  return { port, runtime: { connect: vi.fn(() => port) } };
}
it("multiplexes requests and ignores unknown replies", async () => {
  const { runtime, port } = mockRuntime();
  const client = createTransport(runtime);
  const first = client.check("https://x/a", "link");
  const second = client.check("https://x/b", "image");
  const reply = port.onMessage.addListener.mock.calls[0][0];
  reply({ id: 999 });
  reply({ id: 2, result: { status: "invalid" } });
  reply({ id: 1, result: { status: "valid" } });
  expect(await first).toEqual({ status: "valid" });
  expect(await second).toEqual({ status: "invalid" });
  expect(runtime.connect).toHaveBeenCalledOnce();
  client.close();
});
it("settles cancellation and refuses later work", async () => {
  const { runtime, port } = mockRuntime();
  const client = createTransport(runtime);
  const request = client.check("https://x", "link");
  client.close();
  expect(await request).toMatchObject({ note: "Cancelled" });
  expect(await client.check("https://x", "link")).toMatchObject({
    note: "Cancelled",
  });
  port.onDisconnect.addListener.mock.calls[0][0]();
});
it("settles unexpected disconnection and reconnects", async () => {
  const { runtime, port } = mockRuntime();
  const client = createTransport(runtime);
  const request = client.check("https://x", "link");
  port.onDisconnect.addListener.mock.calls[0][0]();
  expect((await request).note).toContain("interrupted");
  const next = client.check("https://x", "link");
  client.close();
  await next;
  expect(runtime.connect).toHaveBeenCalledTimes(2);
});
it("bounds waits for missing responses", async () => {
  vi.useFakeTimers();
  const { runtime } = mockRuntime();
  const client = createTransport(runtime);
  const request = client.check("https://x", "link");
  await vi.advanceTimersByTimeAsync(27001);
  expect((await request).note).toContain("timed out");
  client.close();
});
it.each(["connect", "postMessage"])("handles %s errors", async (operation) => {
  const { runtime, port } = mockRuntime();
  (operation === "connect"
    ? runtime.connect
    : port.postMessage
  ).mockImplementation(() => {
    throw new Error();
  });
  const client = createTransport(runtime);
  expect((await client.check("https://x", "link")).note).toContain(
    "unavailable",
  );
  client.close();
});
