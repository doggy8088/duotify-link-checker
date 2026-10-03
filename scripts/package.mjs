import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { zipSync } from "fflate";
import { createHash } from "node:crypto";
const manifest = JSON.parse(await readFile("dist/manifest.json", "utf8"));
const entries = {};
async function walk(dir, prefix = "") {
  for (const item of (await readdir(dir, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    if (item.isDirectory())
      await walk(`${dir}/${item.name}`, `${prefix}${item.name}/`);
    else
      entries[prefix + item.name] = [
        new Uint8Array(await readFile(`${dir}/${item.name}`)),
        { mtime: new Date("2020-01-01T00:00:00Z") },
      ];
  }
}
await walk("dist");
const zip = zipSync(entries, { level: 9 });
await mkdir("artifacts", { recursive: true });
const name = `duotify-link-checker-v${manifest.version}.zip`;
await writeFile(`artifacts/${name}`, zip);
await writeFile(
  `artifacts/${name}.sha256`,
  `${createHash("sha256").update(zip).digest("hex")}  ${name}\n`,
);
console.log(`Packaged artifacts/${name} (${zip.length} bytes)`);
