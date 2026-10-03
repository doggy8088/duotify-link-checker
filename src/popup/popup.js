const $ = (id) => document.getElementById(id);
let tabId;
function error(message) {
  $("status").textContent = message;
  $("status").className = "error";
}
async function send(type, extra = {}) {
  const response = await chrome.tabs.sendMessage(tabId, { type, ...extra });
  if (response?.ok === false) throw new Error(response.error);
  return response;
}
async function refresh() {
  const state = await send("DLC_STATUS");
  $("all").disabled = $("external").disabled = state.running;
  $("show").disabled = !state.hasReport;
  $("clear").disabled = state.running || !state.hasReport;
  $("cancel").hidden = !state.running;
  $("status").className = state.error ? "error" : "";
  $("status").textContent =
    state.error ||
    (state.running
      ? "A check is running. You can close this popup."
      : "Ready. Results appear directly on the page.");
}
for (const mode of ["all", "external"])
  $(mode).addEventListener("click", async () => {
    $("all").disabled = $("external").disabled = true;
    try {
      await send("DLC_START", { mode });
      window.close();
    } catch (reason) {
      error(reason.message);
    }
  });
for (const name of ["show", "clear", "cancel"])
  $(name).addEventListener("click", async () => {
    try {
      await send(`DLC_${name.toUpperCase()}`);
      if (name === "show") window.close();
      else await refresh();
    } catch (reason) {
      error(reason.message);
    }
  });
try {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active page");
  tabId = tab.id;
  try {
    await refresh();
  } catch {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["highlight.css"],
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
    await refresh();
  }
} catch {
  error(
    "This page cannot be checked. Open a regular HTTP or HTTPS webpage. Chrome pages and the Web Store are protected.",
  );
}
