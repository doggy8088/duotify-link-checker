import { readFile, writeFile } from "node:fs/promises";
const version = process.argv[2];
if (
  !/^\d+\.\d+\.\d+$/.test(version || "") ||
  version.split(".").some((n) => Number(n) > 65535)
) {
  throw new Error(
    "Use a three-part Chrome version: npm run version:set -- 1.0.1",
  );
}
for (const file of [
  "package.json",
  "public/manifest.json",
  "package-lock.json",
]) {
  const data = JSON.parse(await readFile(file, "utf8"));
  data.version = version;
  if (data.packages?.[""]) data.packages[""].version = version;
  await writeFile(file, JSON.stringify(data, null, 2) + "\n");
}
