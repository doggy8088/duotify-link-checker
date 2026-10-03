import css from "./report.css";
import { HOST_ID } from "./collector.js";
import { getScope } from "./resources.js";
import { yieldToPage } from "../core/pool.js";
import { toCsv } from "../core/csv.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export async function createReport(records, mode, cancel) {
  document.getElementById(HOST_ID)?.remove();
  const host = el("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });
  const style = el("style");
  style.textContent = css;
  const dialog = el("dialog");
  dialog.setAttribute("aria-labelledby", "dlc-title");
  const heading = el("h1", "", "Duotify Link Checker");
  heading.id = "dlc-title";
  const subtitle = el(
    "p",
    "",
    `${mode === "external" ? "External resources only" : "All visible resources"} · ${location.hostname}`,
  );
  const title = el("div");
  title.append(heading, subtitle);
  const actions = el("div", "actions");
  const stop = el("button", "", "Cancel");
  stop.addEventListener("click", cancel);
  const download = el("button", "", "Export CSV");
  download.addEventListener("click", () => {
    const url = URL.createObjectURL(
      new Blob([toCsv(records)], { type: "text/csv;charset=utf-8" }),
    );
    const link = el("a");
    link.href = url;
    link.download = "duotify-link-checker.csv";
    shadow.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const close = el("button", "", "Close");
  close.addEventListener("click", () => dialog.close());
  actions.append(stop, download, close);
  const header = el("header");
  header.append(title, actions);
  const summary = el("div", "summary");
  const cards = {};
  let filter = "total";
  for (const key of ["total", "valid", "invalid", "skipped", "checked"]) {
    const button = el("button", "card", key[0].toUpperCase() + key.slice(1));
    button.dataset.filter = key;
    button.setAttribute("aria-pressed", String(key === filter));
    const value = el(
      "strong",
      "",
      key === "total" ? String(records.length) : "0",
    );
    button.append(value);
    summary.append(button);
    cards[key] = { button, value };
    button.addEventListener("click", () => {
      filter = key;
      applyFilter();
      wrap.scrollTop = 0;
    });
  }
  const progressWrap = el("div", "progress");
  const progressText = el(
    "div",
    "progress-text",
    `Preparing ${records.length} resources…`,
  );
  progressText.setAttribute("role", "status");
  const progress = el("progress");
  progress.max = records.length || 1;
  progress.value = 0;
  progress.setAttribute("aria-label", "Resources checked");
  progressWrap.append(progressText, progress);
  const toolbar = el("div", "toolbar");
  const count = el("span");
  toolbar.append(
    count,
    el(
      "span",
      "legend",
      "Green: valid · Red: invalid · Amber: skipped · Blue: checking",
    ),
  );
  const wrap = el("div", "table-wrap");
  const table = el("table");
  const thead = el("thead");
  const headerRow = el("tr");
  for (const name of ["Type", "Status", "HTTP", "Scope", "URL", "Note"]) {
    const th = el("th", "", name);
    th.scope = "col";
    headerRow.append(th);
  }
  thead.append(headerRow);
  const tbody = el("tbody");
  table.append(thead, tbody);
  const empty = el("div", "empty", "No results match the selected filter.");
  wrap.append(table, empty);
  dialog.append(header, summary, progressWrap, toolbar, wrap);
  shadow.append(style, dialog);
  document.documentElement.append(host);
  dialog.showModal();
  const rows = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const row = el("tr");
    row.dataset.status = "checking";
    const status = el("span", "badge checking", "Checking");
    const statusCell = el("td");
    statusCell.append(status);
    const http = el("td");
    const urlCell = el("td");
    const url = el(/^https?:/i.test(record.url) ? "a" : "span", "", record.url);
    if (url.tagName === "A") {
      url.href = record.url;
      url.target = "_blank";
      url.rel = "noopener noreferrer";
    }
    urlCell.append(url);
    const note = el("td", "", record.source);
    row.append(
      el("td", "", record.typeLabel),
      statusCell,
      http,
      el("td", "", getScope(record.url)),
      urlCell,
      note,
    );
    tbody.append(row);
    rows.push({ row, status, http, note });
    if (i % 100 === 99) await yieldToPage();
  }
  function matches(status) {
    return (
      filter === "total" ||
      (filter === "checked" ? status !== "checking" : status === filter)
    );
  }
  const totals = { checking: records.length, valid: 0, invalid: 0, skipped: 0 };
  function updateCount() {
    const visible =
      filter === "total"
        ? records.length
        : filter === "checked"
          ? records.length - totals.checking
          : totals[filter];
    count.textContent = `Filter: ${filter} · Showing ${visible} of ${records.length}`;
    empty.hidden = visible !== 0;
  }
  function applyFilter() {
    rows.forEach(({ row }) => {
      row.hidden = !matches(row.dataset.status);
    });
    Object.entries(cards).forEach(([key, { button }]) =>
      button.setAttribute("aria-pressed", String(key === filter)),
    );
    updateCount();
  }
  applyFilter();
  return {
    show() {
      if (!dialog.open) dialog.showModal();
    },
    remove() {
      dialog.close();
      host.remove();
    },
    updateRow(index, result) {
      const item = rows[index];
      totals[item.row.dataset.status]--;
      totals[result.status]++;
      item.row.dataset.status = result.status;
      item.row.hidden = !matches(result.status);
      item.status.className = `badge ${result.status}`;
      item.status.textContent =
        result.status[0].toUpperCase() + result.status.slice(1);
      item.http.textContent = String(result.httpStatus || "");
      item.note.textContent = [records[index].source, result.note]
        .filter(Boolean)
        .join("; ");
    },
    updateProgress(done, counts, cancelled = false) {
      for (const key of ["valid", "invalid", "skipped"])
        cards[key].value.textContent = String(counts[key]);
      cards.checked.value.textContent = String(done);
      progress.value = records.length ? done : 1;
      const completed = done === records.length;
      progressText.textContent = `${cancelled ? "Cancelled" : completed ? "Completed" : "Checking"} ${done} / ${records.length}`;
      stop.disabled = completed || cancelled;
      updateCount();
    },
  };
}
