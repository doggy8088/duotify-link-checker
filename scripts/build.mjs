import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const manifest = JSON.parse(await readFile("public/manifest.json", "utf8"));
if (pkg.version !== manifest.version)
  throw new Error("package.json and manifest versions must match");
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
for (const [entry, outfile, format] of [
  ["src/background.js", "background.js", "esm"],
  ["src/content/index.js", "content.js", "iife"],
  ["src/popup/popup.js", "popup.js", "esm"],
]) {
  await build({
    entryPoints: [entry],
    outfile: `dist/${outfile}`,
    bundle: true,
    format,
    target: "chrome120",
    loader: { ".css": "text" },
    legalComments: "none",
  });
}
await cp("src/popup/popup.html", "dist/popup.html");
await cp("src/popup/popup.css", "dist/popup.css");
await cp("src/content/highlight.css", "dist/highlight.css");
await cp("LICENSE", "dist/LICENSE");
await writeFile("dist/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`Built ${manifest.name} ${manifest.version} in dist/`);
