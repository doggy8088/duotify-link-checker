// @vitest-environment node
import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
it("declares a complete, consistent Manifest V3 extension and correctly-sized icons", async () => {
  const manifest = JSON.parse(await readFile("public/manifest.json", "utf8"));
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  expect(manifest.manifest_version).toBe(3);
  expect(manifest.version).toBe(pkg.version);
  expect(manifest.name).toBe("Duotify Link Checker");
  expect(manifest.description.length).toBeLessThanOrEqual(132);
  expect(manifest.permissions).toEqual(["activeTab", "scripting"]);
  expect(manifest.content_scripts).toBeUndefined();
  for (const [size, file] of Object.entries(manifest.icons)) {
    const image = await sharp(`public/${file}`).metadata();
    expect(image.width).toBe(Number(size));
    expect(image.height).toBe(Number(size));
    expect(image.hasAlpha).toBe(true);
  }
  const html = await readFile("src/popup/popup.html", "utf8");
  expect(html).not.toMatch(/\son\w+=/);
  expect(html).not.toMatch(/<script[^>]*>\s*[^<\s]/);
  expect(await readFile("LICENSE", "utf8")).toContain(
    "Copyright © 2026 Will 保哥",
  );
});
