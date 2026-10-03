import { collectVisibleResources } from "./collector.js";
import { classifySpecialUrl } from "./special.js";
import { applyElementStatus, clearMarks } from "./highlight.js";
import { createReport } from "./report.js";
import { createTransport } from "./transport.js";
import { runPool, yieldToPage } from "../core/pool.js";

// Injection can happen on every popup open; listeners and state must remain unique.
if (!globalThis.__duotifyLinkChecker) {
  globalThis.__duotifyLinkChecker = true;
  let running = false;
  let ui;
  let cancel = () => {};
  let lastError = "";
  async function scan(mode) {
    const controller = new AbortController();
    const transport = createTransport();
    cancel = () => {
      controller.abort();
      transport.close();
    };
    try {
      ui?.remove();
      ui = undefined;
      clearMarks();
      lastError = "";
      const records = await collectVisibleResources(mode, controller.signal);
      ui = await createReport(records, mode, cancel);
      const counts = { valid: 0, invalid: 0, skipped: 0 };
      const cache = new Map();
      for (let i = 0; i < records.length; i++) {
        applyElementStatus(records[i], "checking");
        if (i % 100 === 99) await yieldToPage();
      }
      let done = 0;
      ui.updateProgress(done, counts);
      await runPool(records, async (record, index) => {
        let result;
        if (controller.signal.aborted)
          result = { status: "skipped", httpStatus: "", note: "Cancelled" };
        else {
          result = classifySpecialUrl(record);
          if (!result) {
            const url = new URL(record.url);
            url.hash = "";
            const key = `${record.type}\n${url.href}`;
            if (!cache.has(key))
              cache.set(key, transport.check(url.href, record.type));
            result = await cache.get(key);
          }
        }
        record.result = result;
        counts[result.status]++;
        done++;
        applyElementStatus(record, result.status);
        ui.updateRow(index, result);
        ui.updateProgress(done, counts, controller.signal.aborted);
        if (done % 50 === 0) await yieldToPage();
      });
    } catch (error) {
      lastError = `Check failed: ${error.message}`;
    } finally {
      transport.close();
      running = false;
    }
  }
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message.type === "DLC_STATUS")
      respond({ running, hasReport: Boolean(ui), error: lastError });
    else if (
      message.type === "DLC_START" &&
      ["all", "external"].includes(message.mode)
    ) {
      if (running) {
        ui?.show();
        respond({ ok: false, error: "A check is already running." });
        return;
      }
      running = true;
      void scan(message.mode);
      respond({ ok: true });
    } else if (message.type === "DLC_SHOW") {
      ui?.show();
      respond({ ok: true });
    } else if (message.type === "DLC_CANCEL") {
      cancel();
      respond({ ok: true });
    } else if (message.type === "DLC_CLEAR") {
      if (running) {
        respond({
          ok: false,
          error: "Cancel the current check before clearing.",
        });
        return;
      }
      ui?.remove();
      ui = undefined;
      clearMarks();
      respond({ ok: true });
    }
  });
}
