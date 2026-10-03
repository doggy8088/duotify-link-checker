import { test, expect, chromium } from "@playwright/test";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { startFixture } from "../fixture-server.mjs";
let fixture, context, worker, extensionId, profile;
const extensionPath = path.resolve("dist");
test.beforeAll(async () => {
  fixture = await startFixture();
  profile = await mkdtemp(path.join(tmpdir(), "duotify-e2e-"));
  context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: !process.env.HEADED,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    viewport: { width: 1280, height: 800 },
  });
  worker =
    context.serviceWorkers()[0] ||
    (await context.waitForEvent("serviceworker"));
  extensionId = new URL(worker.url()).host;
});
test.afterAll(async () => {
  await context?.close();
  await fixture?.close();
  if (profile) await rm(profile, { recursive: true, force: true });
});
test.afterEach(async () => {
  for (const page of context.pages()) await page.close();
});
async function pageAt(route = "/") {
  const page = await context.newPage();
  await page.goto(fixture.origin + route);
  return page;
}
async function command(page, type, extra = {}) {
  return await worker.evaluate(
    async ({ url, type, extra }) => {
      const tabs = await chrome.tabs.query({});
      const tab = tabs.find((tab) => tab.url === url);
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["highlight.css"],
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      return await chrome.tabs.sendMessage(tab.id, { type, ...extra });
    },
    { url: page.url(), type, extra },
  );
}
async function scan(page, mode = "all") {
  expect(await command(page, "DLC_START", { mode })).toEqual({ ok: true });
  await expect(page.locator(".progress-text")).toContainText("Completed");
}
const rowFor = (page, value) =>
  page
    .locator("tbody tr")
    .filter({ has: page.locator("td:nth-child(5)", { hasText: value }) });

test("full scan: HTTP, MIME, CSS, media, fragments, special URLs, duplicates and privacy", async () => {
  const page = await pageAt();
  fixture.requests.length = 0;
  await scan(page);
  await expect(rowFor(page, "/missing").first()).toContainText("Invalid");
  await expect(rowFor(page, "/bad-image")).toContainText("expected image/*");
  await expect(rowFor(page, "/mime-fallback")).toContainText("Valid");
  await expect(rowFor(page, "/fallback")).toContainText("HEAD 405 → GET 200");
  await expect(rowFor(page, "/redirect")).toContainText("Valid");
  await expect(rowFor(page, "/restricted")).toContainText("Skipped");
  await expect(rowFor(page, "/limited")).toContainText("Skipped");
  await expect(rowFor(page, "#not-found")).toContainText("Invalid");
  await expect(rowFor(page, "#ok")).toContainText("Valid");
  await expect(rowFor(page, "mailto:")).toContainText("Skipped");
  await expect(rowFor(page, "javascript:").locator("a")).toHaveCount(0);
  await expect(rowFor(page, "data:image")).toContainText("Valid");
  await expect(rowFor(page, "/media")).toHaveCount(2);
  await expect(page.locator("tbody")).toContainText(
    "CSS ::before background-image",
  );
  await expect(page.locator("tbody")).not.toContainText("/hidden");
  await expect(page.locator("tbody")).not.toContainText("/transparent");
  await expect(page.locator("#css")).toHaveAttribute(
    "data-duotify-link-check-status",
    "invalid",
  );
  expect(
    fixture.requests.filter((r) => r.path === "/ok" && r.method === "HEAD"),
  ).toHaveLength(3); // same-origin dedup + external origin + redirect target
  expect(fixture.requests.filter((r) => r.path === "/limited")).toHaveLength(1);
  const probes = fixture.requests.filter((r) => r.destination === "empty");
  expect(probes.length).toBeGreaterThan(10);
  expect(probes.every((r) => !r.cookie && !r.referer)).toBe(true);
  await mkdir("docs/assets", { recursive: true });
  await page.screenshot({ path: "docs/assets/screenshot-report.png" });
});
test("filters preserve dialog size, CSV exports, close/reopen and clear restore page", async () => {
  const page = await pageAt();
  await scan(page);
  const before = await page.locator("dialog").boundingBox();
  await page.locator('[data-filter="invalid"]').click();
  await expect(page.locator("tbody tr:visible")).toHaveCount(4);
  expect(await page.locator("dialog").boundingBox()).toEqual(before);
  await page.screenshot({ path: "docs/assets/screenshot-invalid.png" });
  for (const filter of ["valid", "skipped", "checked", "total"]) {
    await page.locator(`[data-filter="${filter}"]`).click();
    await expect(page.locator(`[data-filter="${filter}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("duotify-link-checker.csv");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toContain("expected image/*");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await command(page, "DLC_SHOW");
  await expect(page.locator("dialog")).toBeVisible();
  await command(page, "DLC_CLEAR");
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(page.locator("[data-duotify-link-check-status]")).toHaveCount(0);
});
test("external mode includes only other origins; repeat injection does not duplicate the report", async () => {
  const page = await pageAt();
  await scan(page, "external");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("127.0.0.1");
  await scan(page, "external");
  await expect(page.locator("dialog")).toHaveCount(1);
});
test("empty pages finish without errors", async () => {
  const page = await pageAt("/empty");
  await scan(page);
  await expect(page.locator(".progress-text")).toHaveText("Completed 0 / 0");
  await expect(page.locator(".empty")).toBeVisible();
});
test("cancels in-flight work, prevents parallel scans and allows another run", async () => {
  const page = await pageAt("/cancel");
  await command(page, "DLC_START", { mode: "all" });
  await expect(page.locator("dialog")).toBeVisible();
  expect((await command(page, "DLC_START", { mode: "all" })).ok).toBe(false);
  expect((await command(page, "DLC_CLEAR")).ok).toBe(false);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".progress-text")).toHaveText("Cancelled 1 / 1");
  await expect(page.locator("tbody")).toContainText("Skipped");
  await scan(page, "external");
});
test("handles many resources with deduplicated network requests", async () => {
  const page = await pageAt("/large");
  fixture.requests.length = 0;
  await scan(page);
  await expect(page.locator("tbody tr")).toHaveCount(400);
  expect(fixture.requests.filter((r) => r.method === "HEAD")).toHaveLength(1);
});
test("popup renders controls and reports protected pages clearly", async () => {
  const protectedPage = await context.newPage();
  await protectedPage.goto("chrome://version/");
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator("#status")).toContainText(
    "This page cannot be checked",
  );
  await expect(popup.locator("#all")).toBeDisabled();
});
test("popup controls invoke a real scan on an active web tab", async () => {
  const page = await pageAt("/empty");
  const popup = await context.newPage();
  await page.bringToFront();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator("#all")).toBeEnabled();
  await popup.locator("#all").click();
  await expect(page.locator(".progress-text")).toHaveText("Completed 0 / 0");
});
test("narrow viewport keeps report controls reachable", async () => {
  const page = await pageAt();
  await page.setViewportSize({ width: 390, height: 700 });
  await scan(page);
  const bounds = await page.locator("dialog").boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(390);
  await expect(
    page.getByRole("button", { name: "Export CSV" }),
  ).toBeInViewport();
});

test("network failures and credential-bearing URLs remain uncertain", async () => {
  const page = await pageAt("/empty");
  await page.evaluate(() => {
    for (const url of [
      "http://127.0.0.1:1/unreachable",
      "https://user:password@example.com/",
    ]) {
      const link = document.createElement("a");
      link.href = url;
      link.textContent = "Check target";
      document.body.append(link);
    }
  });
  await scan(page);
  await expect(page.locator('tbody tr[data-status="skipped"]')).toHaveCount(2);
  await expect(page.locator("tbody")).toContainText("Network error");
  await expect(page.locator("tbody")).toContainText(
    "without embedded credentials",
  );
});

test("another scan wakes a stopped service worker", async () => {
  const page = await pageAt();
  await scan(page);
  const controls = await context.newPage();
  await controls.goto(`chrome-extension://${extensionId}/popup.html`);
  const cdp = await context.newCDPSession(page);
  await cdp.send("ServiceWorker.enable");
  await cdp.send("ServiceWorker.stopAllWorkers");
  await controls.evaluate(async (url) => {
    const tabs = await chrome.tabs.query({});
    const tab = tabs.find((tab) => tab.url === url);
    await chrome.tabs.sendMessage(tab.id, {
      type: "DLC_START",
      mode: "external",
    });
  }, page.url());
  await expect(page.locator(".progress-text")).toContainText("Completed 1 / 1");
  await expect(page.locator('tbody tr[data-status="valid"]')).toHaveCount(1);
  await cdp.detach();
});
