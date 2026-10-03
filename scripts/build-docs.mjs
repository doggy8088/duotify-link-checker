import { readFile, writeFile } from "node:fs/promises";
import { format } from "prettier";
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const policy = await readFile("docs/privacy-policy.md", "utf8");
const content = policy
  .trim()
  .split(/\n\s*\n/)
  .map((block) => {
    const text = escape(block).replace(
      /\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,
      '<a href="$2">$1</a>',
    );
    if (text.startsWith("# ")) return `<h1>${text.slice(2)}</h1>`;
    if (text.startsWith("## ")) return `<h2>${text.slice(3)}</h2>`;
    if (text === "---") return "<hr>";
    return `<p>${text}</p>`;
  })
  .join("\n");
const shell = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{max-width:800px;margin:48px auto;padding:0 24px;font:17px/1.7 system-ui,sans-serif;color:#19352b;background:#fafcfb}h1{line-height:1.2}h2{margin-top:2em;font-size:1.25em}a{color:#126846}img{max-width:100%;height:auto}nav{margin-bottom:32px;font-size:14px}</style></head><body><nav><a href="./">Duotify Link Checker</a> · <a href="https://github.com/doggy8088/duotify-link-checker">Source &amp; support</a></nav><main>${body}</main><footer><p>Copyright © 2026 Will 保哥 · MIT</p></footer></body></html>\n`;
await writeFile(
  "docs/privacy-policy.html",
  await format(shell("Privacy Policy — Duotify Link Checker", content), {
    parser: "html",
  }),
);
await writeFile(
  "docs/index.html",
  await format(
    shell(
      "Duotify Link Checker",
      `<h1>Duotify Link Checker</h1><p>Check visible links, images, CSS images, video and audio. Filter broken resources directly on the page.</p><p><a href="https://github.com/doggy8088/duotify-link-checker/releases">Download</a> · <a href="https://github.com/doggy8088/duotify-link-checker/tree/main/docs">開發文件 / Documentation</a> · <a href="privacy-policy.html">Privacy policy</a></p><img src="assets/screenshot-report.png" width="1280" height="800" alt="The extension's filterable resource report">`,
    ),
    { parser: "html" },
  ),
);
await writeFile("docs/.nojekyll", "");
