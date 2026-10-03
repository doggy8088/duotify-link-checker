import { it, expect } from "vitest";
import { runPool, yieldToPage } from "../../src/core/pool.js";
import { toCsv } from "../../src/core/csv.js";
it("limits concurrency and visits each item exactly once", async () => {
  let active = 0,
    peak = 0;
  const seen = [];
  await runPool(
    Array.from({ length: 23 }, (_, i) => i),
    async (item, index) => {
      active++;
      peak = Math.max(peak, active);
      await yieldToPage();
      seen.push([item, index]);
      active--;
    },
    3,
  );
  expect(peak).toBe(3);
  expect(seen).toHaveLength(23);
  expect(new Set(seen.map((v) => v[0])).size).toBe(23);
  expect(seen.every(([item, index]) => item === index)).toBe(true);
});
it("supports empty pools and rejects invalid concurrency", async () => {
  await runPool([], () => {
    throw new Error();
  });
  await expect(runPool([], () => {}, 0)).rejects.toThrow("Invalid concurrency");
});
it("propagates worker failure", async () =>
  await expect(
    runPool([1], () => {
      throw new Error("failure");
    }),
  ).rejects.toThrow("failure"));
it("exports Unicode, CSV quoting, blank results and formula-safe cells", () => {
  const csv = toCsv([
    {
      type: "link",
      url: "https://example.com/保哥",
      source: "=1+1",
      result: { status: "valid", httpStatus: 200, note: 'a,"b"\nc' },
    },
    { type: "image", url: " +SUM(1)", source: "@x" },
  ]);
  expect(csv.startsWith("\uFEFF")).toBe(true);
  expect(csv).toContain('"\'=1+1"');
  expect(csv).toContain('"\' +SUM(1)"');
  expect(csv).toContain('"\'@x"');
  expect(csv).toContain('"a,""b""\nc"');
  expect(csv).toContain("checking");
  expect(csv).toContain("保哥");
});
