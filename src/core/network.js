export const RESOURCE_TYPES = ["link", "image", "video", "audio"];

export function normalizeRequest(message) {
  if (!message || !RESOURCE_TYPES.includes(message.resourceType))
    throw new Error("Invalid resource type");
  if (typeof message.url !== "string" || message.url.length > 65536)
    throw new Error("Invalid URL");
  const url = new URL(message.url);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "Only HTTP(S) URLs without embedded credentials can be checked",
    );
  }
  url.hash = "";
  return { url: url.href, type: message.resourceType };
}

export function acceptHeader(type) {
  return {
    image: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    video: "video/webm,video/ogg,video/*;q=0.9,*/*;q=0.8",
    audio: "audio/ogg,audio/*;q=0.9,*/*;q=0.8",
    link: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  }[type];
}

export function isImageContentType(value) {
  return /^image\/[a-z0-9][a-z0-9!#$&^_.+-]*$/.test(value || "");
}

export function successful(type, response) {
  return (
    response.status >= 200 &&
    response.status < 300 &&
    (type !== "image" || isImageContentType(response.contentType))
  );
}

export async function probe(
  url,
  type,
  method,
  { fetchImpl = fetch, signal, timeout = 12000 } = {},
) {
  const deadline = AbortSignal.timeout(timeout);
  const combined = signal ? AbortSignal.any([signal, deadline]) : deadline;
  try {
    const response = await fetchImpl(url, {
      method,
      signal: combined,
      redirect: "follow",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      headers: { Accept: acceptHeader(type) },
    });
    const result = {
      method,
      status: response.status,
      statusText: response.statusText,
      contentType: (response.headers.get("content-type") || "")
        .split(";", 1)[0]
        .trim()
        .toLowerCase(),
      finalUrl: response.url || url,
    };
    // Do not download a large image/video body when GET is needed for its headers.
    try {
      await response.body?.cancel();
    } catch {
      /* Headers already received. */
    }
    return result;
  } catch {
    return {
      method,
      status: 0,
      contentType: "",
      finalUrl: url,
      statusText: signal?.aborted
        ? "Cancelled"
        : deadline.aborted
          ? "Timeout"
          : "Network error",
    };
  }
}

function describe(type, response) {
  const summary = `${response.method} ${response.status || response.statusText || "failed"}`;
  return type === "image" && response.status
    ? `${summary} (Content-Type: ${response.contentType || "missing"}${isImageContentType(response.contentType) ? "" : "; expected image/*"})`
    : summary;
}

export async function checkHttp(url, type, options = {}) {
  const head = await probe(url, type, "HEAD", options);
  let final = head;
  let note = describe(type, head);
  if (
    !successful(type, head) &&
    head.status !== 429 &&
    !options.signal?.aborted
  ) {
    final = await probe(url, type, "GET", options);
    note += ` → ${describe(type, final)}`;
  }
  let status = "invalid";
  if (successful(type, final)) status = "valid";
  else if ([0, 401, 403, 429].includes(final.status)) status = "skipped";
  if ([401, 403].includes(final.status)) note += " (access restricted)";
  if (final.status === 429) note += " (too many requests)";
  if (final.finalUrl !== url) note += ` → ${final.finalUrl}`;
  return { status, httpStatus: final.status || "", note };
}
