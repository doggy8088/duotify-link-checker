export function createTransport(runtime = chrome.runtime) {
  let port;
  let nextId = 0;
  let stopped = false;
  const pending = new Map();
  function settleAll(note) {
    for (const { resolve, timer } of pending.values()) {
      clearTimeout(timer);
      resolve({ status: "skipped", httpStatus: "", note });
    }
    pending.clear();
  }
  function connect() {
    port = runtime.connect({ name: "duotify-check" });
    port.onMessage.addListener((message) => {
      const item = pending.get(message.id);
      if (!item) return;
      clearTimeout(item.timer);
      pending.delete(message.id);
      item.resolve(message.result);
    });
    port.onDisconnect.addListener(() => {
      // Reading lastError acknowledges Chrome's disconnected-port error.
      void runtime.lastError;
      port = undefined;
      settleAll(
        stopped
          ? "Cancelled"
          : "Background connection interrupted; run the check again",
      );
    });
  }
  return {
    check(url, resourceType) {
      if (stopped)
        return Promise.resolve({
          status: "skipped",
          httpStatus: "",
          note: "Cancelled",
        });
      return new Promise((resolve) => {
        const id = ++nextId;
        try {
          if (!port) connect();
          const timer = setTimeout(() => {
            pending.delete(id);
            resolve({
              status: "skipped",
              httpStatus: "",
              note: "Background response timed out",
            });
          }, 27000);
          pending.set(id, { resolve, timer });
          port.postMessage({ id, url, resourceType });
        } catch {
          const item = pending.get(id);
          if (item) clearTimeout(item.timer);
          pending.delete(id);
          resolve({
            status: "skipped",
            httpStatus: "",
            note: "Extension unavailable; reload this page",
          });
        }
      });
    },
    close() {
      stopped = true;
      settleAll("Cancelled");
      port?.disconnect();
      port = undefined;
    },
  };
}
