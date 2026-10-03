import http from "node:http";
import { fileURLToPath } from "node:url";
const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRz8AAAAASUVORK5CYII=",
  "base64",
);
export async function startFixture(port = 0) {
  const requests = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    requests.push({
      path: url.pathname,
      method: req.method,
      cookie: req.headers.cookie,
      referer: req.headers.referer,
      destination: req.headers["sec-fetch-dest"],
    });
    res.setHeader("Cache-Control", "no-store");
    const actualPort = server.address().port;
    if (url.pathname === "/slow") {
      const timer = setTimeout(() => res.end("slow"), 20000);
      res.on("close", () => clearTimeout(timer));
      return;
    }
    if (url.pathname === "/redirect") {
      res.writeHead(302, { Location: "/ok" });
      res.end();
      return;
    }
    if (url.pathname === "/missing" || url.pathname === "/missing.png") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    if (url.pathname === "/restricted") {
      res.writeHead(403);
      res.end("Restricted");
      return;
    }
    if (url.pathname === "/limited") {
      res.writeHead(429);
      res.end("Too many requests");
      return;
    }
    if (url.pathname === "/fallback" && req.method === "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }
    if (url.pathname === "/image.png" || url.pathname === "/mime-fallback") {
      if (url.pathname !== "/mime-fallback" || req.method !== "HEAD")
        res.setHeader("Content-Type", "image/png");
      res.end(pixel);
      return;
    }
    if (url.pathname === "/bad-image") {
      res.setHeader("Content-Type", "text/html");
      res.end("<p>Login required</p>");
      return;
    }
    if (url.pathname === "/media") {
      res.setHeader("Content-Type", "video/mp4");
      res.end("fixture");
      return;
    }
    if (url.pathname === "/empty") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        "<!doctype html><title>Empty fixture</title><h1>No resources here</h1>",
      );
      return;
    }
    if (url.pathname === "/cancel") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        '<!doctype html><title>Cancellation fixture</title><a href="/slow">Slow resource</a>',
      );
      return;
    }
    if (url.pathname === "/large") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        "<!doctype html><title>Large fixture</title>" +
          Array.from(
            { length: 400 },
            (_, i) => `<a style="display:block" href="/ok#${i}">Link ${i}</a>`,
          ).join(""),
      );
      return;
    }
    if (url.pathname !== "/") {
      res.setHeader("Content-Type", "text/html");
      res.end("OK");
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Set-Cookie", "fixture=secret; SameSite=Lax");
    res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Duotify Link Checker · Test site</title><style>
    body{font:16px system-ui,sans-serif;max-width:1040px;margin:42px auto;color:#172c2a;background:#eef4f0} h1{font-size:38px;margin-bottom:10px}p{color:#516559} .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}section{padding:25px;background:white;border:1px solid #cddbd2;border-radius:9px}a{display:block;margin:12px 0;color:#176344}img{width:46px;height:46px;margin:8px}.css{width:70px;height:55px;background-image:url('/image.png'),url('/missing.png');background-size:cover}.pseudo::before{content:'';display:block;width:35px;height:35px;background:url('/image.png')}.hide{display:none}.transparent{opacity:0}video{width:160px;height:50px}audio{width:190px;height:40px}</style></head><body>
    <p>DUOTIFY / QUALITY CHECK</p><h1>A healthier page starts here.</h1><p>A local test site with healthy, broken and restricted resources.</p>
    <div class="grid"><section><h2>Website links</h2><a id="ok" href="/ok">Healthy page</a><a href="/ok">Duplicate healthy page</a><a id="broken" href="/missing">Missing page</a><a href="/redirect">Redirected page</a><a href="/fallback">GET fallback</a><a href="/restricted">Restricted page</a><a href="/limited">Rate limited</a><a id="external" href="http://127.0.0.1:${actualPort}/ok">External origin</a></section>
    <section><h2>Images & styles</h2><img alt="Valid image" src="/image.png"><img alt="Wrong MIME" src="/bad-image"><img alt="GET image fallback" src="/mime-fallback"><img alt="Inline image" src="data:image/png;base64,${pixel.toString("base64")}"><div id="css" class="css"></div><div class="pseudo">Pseudo-element image</div></section>
    <section><h2>Media & anchors</h2><video controls preload="none" src="/media"></video><audio controls preload="none"><source src="/media"></audio><a href="#ok">Existing fragment</a><a href="#not-found">Missing fragment</a><a href="mailto:example@example.com">Email link</a><a href="javascript:void(0)">Script link</a><a href="data:text/plain,hello">Data link</a></section></div>
    <div class="hide"><a href="/hidden">Hidden link</a></div><div class="transparent"><a href="/transparent">Transparent parent</a></div></body></html>`);
  });
  await new Promise((resolve) => server.listen(port, "0.0.0.0", resolve));
  return {
    server,
    requests,
    origin: `http://localhost:${server.address().port}`,
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const fixture = await startFixture(Number(process.env.PORT || 4173));
  console.log(`Fixture: ${fixture.origin}`);
}
