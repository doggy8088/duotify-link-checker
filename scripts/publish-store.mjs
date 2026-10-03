import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function publishStore({
  env = process.env,
  fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  read = readFile,
} = {}) {
  const required = [
    "CWS_PUBLISHER_ID",
    "CWS_EXTENSION_ID",
    "CWS_CLIENT_ID",
    "CWS_CLIENT_SECRET",
    "CWS_REFRESH_TOKEN",
  ];
  for (const key of required) if (!env[key]) throw new Error(`Missing ${key}`);
  if (
    !/^[a-zA-Z0-9_-]+$/.test(env.CWS_PUBLISHER_ID) ||
    !/^[a-p]{32}$/.test(env.CWS_EXTENSION_ID)
  )
    throw new Error("Invalid Chrome Web Store identifiers");
  const manifest = JSON.parse(await read("dist/manifest.json", "utf8"));
  const zip = await read(
    `artifacts/duotify-link-checker-v${manifest.version}.zip`,
  );
  async function request(url, options) {
    const res = await fetchImpl(url, {
      ...options,
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok)
      throw new Error(
        `Chrome Web Store request failed (HTTP ${res.status}); review the dashboard and credentials`,
      );
    return await res.json();
  }
  const auth = await request("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: env.CWS_CLIENT_ID,
      client_secret: env.CWS_CLIENT_SECRET,
      refresh_token: env.CWS_REFRESH_TOKEN,
    }),
  });
  if (!auth.access_token)
    throw new Error("OAuth did not return an access token");
  const headers = { Authorization: `Bearer ${auth.access_token}` };
  const name = `publishers/${env.CWS_PUBLISHER_ID}/items/${env.CWS_EXTENSION_ID}`;
  const base = `https://chromewebstore.googleapis.com/v2/${name}`;
  const upload = await request(
    `https://chromewebstore.googleapis.com/upload/v2/${name}:upload`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/zip" },
      body: zip,
    },
  );
  let state = upload.uploadState;
  const inProgress = (value) =>
    ["IN_PROGRESS", "UPLOAD_IN_PROGRESS"].includes(value);
  for (let attempt = 0; inProgress(state) && attempt < 30; attempt++) {
    await sleep(2000);
    const status = await request(`${base}:fetchStatus`, { headers });
    state = status.lastAsyncUploadState;
  }
  if (state !== "SUCCEEDED")
    throw new Error(`Upload did not succeed: ${state || "unknown state"}`);
  if (upload.crxVersion && upload.crxVersion !== manifest.version)
    throw new Error("Uploaded version mismatch");
  const result = await request(`${base}:publish`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      publishType: "DEFAULT_PUBLISH",
      skipReview: false,
      blockOnWarnings: true,
    }),
  });
  if (!result.state)
    throw new Error("Publish response did not include a submission state");
  return { version: manifest.version, state: result.state };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await publishStore();
    console.log(
      `Chrome Web Store ${result.version}: ${result.state}. Availability is subject to Google review.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
