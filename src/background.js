import { checkHttp, normalizeRequest } from "./core/network.js";

// A port owns only transient in-flight work. No scan state depends on worker lifetime.
// Disconnecting (cancel, tab navigation, or close) aborts all its current fetches.
chrome.runtime.onConnect.addListener((port) => {
  if (
    port.name !== "duotify-check" ||
    port.sender?.id !== chrome.runtime.id ||
    !port.sender?.tab ||
    port.sender.frameId !== 0 ||
    !/^https?:/.test(port.sender.url || "")
  ) {
    port.disconnect();
    return;
  }
  const controller = new AbortController();
  let active = 0;
  port.onDisconnect.addListener(() => controller.abort());
  port.onMessage.addListener(async (message) => {
    if (!Number.isSafeInteger(message?.id)) return;
    if (active >= 8) {
      port.postMessage({
        id: message.id,
        result: {
          status: "skipped",
          httpStatus: "",
          note: "Too many concurrent checks",
        },
      });
      return;
    }
    active++;
    try {
      const request = normalizeRequest(message);
      const result = await checkHttp(request.url, request.type, {
        signal: controller.signal,
      });
      if (!controller.signal.aborted)
        port.postMessage({ id: message.id, result });
    } catch (error) {
      if (!controller.signal.aborted) {
        try {
          port.postMessage({
            id: message.id,
            result: { status: "skipped", httpStatus: "", note: error.message },
          });
        } catch {
          /* The tab may have closed. */
        }
      }
    } finally {
      active--;
    }
  });
});
