/* =============================================================
   BUILD — one playable file.

   Inlines every script, stylesheet and image into a single HTML
   document. The result opens from a double-click, works offline,
   and is what a release ships.

   This is not a bundler and must not become one. It reads the
   <script src> and <link rel=stylesheet> tags out of index.html
   in the order the browser would, and splices the file contents
   in. No transform, no minification, no module graph — if that is
   ever needed, the no-build-step rule has been lost and something
   has gone wrong upstream.
   ============================================================= */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = path.join(__dirname, ".."), out = path.join(root, "dist");
/* --release: the page a player gets. It leaves out the world's untagged story
   (tools/storystrip.js), which only the engine's tests play on, and stamps the
   commit and the date into the page (window.PLAYTEST). */
const RELEASE = process.argv.includes("--release");
const { strip } = require("./storystrip.js");
const stripped = {};

const rd = p => fs.readFileSync(path.join(root, p), "utf8");
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
               ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp" };

function dataURI(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  const mime = MIME[path.extname(rel).toLowerCase()];
  if (!mime) return null;
  return `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;
}

let html = rd("index.html");
const inlined = { css: 0, js: 0, img: 0, missing: [] };

/* Images in real markup. This must run BEFORE scripts are inlined: once
   ui.js is in the document, its template literals contain things that
   look exactly like <img src="img/logos/${p.logo}">. */
html = html.replace(/(<img[^>]*\ssrc=)["']([^"']+)["']/g, (m, pre, src) => {
  const uri = dataURI(src);
  if (!uri) { inlined.missing.push(src); return m; }
  inlined.img++;
  return `${pre}"${uri}"`;
});

/* stylesheets */
html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g, (m, href) => {
  if (/^https?:/.test(href)) return m;
  if (!fs.existsSync(path.join(root, href))) { inlined.missing.push(href); return m; }
  inlined.css++;
  return `<style>\n/* ${href} */\n${rd(href)}\n</style>`;
});

/* DEV-ONLY SCRIPTS ARE LEFT OUT OF A RELEASE. The parked story (design/80) is
   written for later acts and kept for the tests; its script tags carry
   `data-dev`, and the page a player gets does not load them. This removes
   whole tags and changes nothing else. */
html = html.replace(/<script data-dev src=["'][^"']+["']><\/script>\n?/g, "");

/* scripts, in document order */
html = html.replace(/<script src=["']([^"']+)["']><\/script>/g, (m, src) => {
  if (/^https?:/.test(src)) return m;
  if (!fs.existsSync(path.join(root, src))) { inlined.missing.push(src); return m; }
  inlined.js++;
  let code = rd(src);
  if (RELEASE && /^content\/[^/]+\.js$/.test(src)) {
    const r = strip(code);
    try { new (require("vm").Script)(r.src, { filename: src }); }
    catch (e) { console.log("FAIL: " + src + " does not parse after the strip: " + e.message); process.exit(1); }
    code = r.src;
    Object.keys(r.gone).forEach(k => { stripped[k] = (stripped[k] || 0) + r.gone[k]; });
  }
  return `<script>\n/* ${src} */\n${code}\n</script>`;
});

/* images the UI builds at run time: img/logos/x.png and img/portraits/x.png.
   The page has no server, so a bare path would 404 in a single file. Ship a
   lookup the UI can consult, and let the existing onerror fallbacks handle
   anything not present. */
const assets = {};
["img/logos", "img/portraits", "img/events", "img/menu", "img/artifacts", "img/plays"].forEach(dir => {
  const d = path.join(root, dir);
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d).forEach(f => {
    const rel = dir + "/" + f, uri = dataURI(rel);
    if (uri) { assets[rel] = uri; inlined.img++; }
  });
});
/* The PM's hand, which lives at the img root because it is paper rather
   than an artifact slot. The set piece draws it at run time, so it reaches
   the page through the same lookup as the logos. */
["img/signature-ink.png"].forEach(rel => {
  const uri = dataURI(rel);
  if (uri) { assets[rel] = uri; inlined.img++; }
});

/* Resolve any src that points into img/ through the table, before the
   browser tries to fetch it. Runs first, so every later script sees it. */
const shim = `<script>
/* build: inlined assets. Single-file builds have no server to fetch from. */
window.__ASSETS = ${JSON.stringify(assets)};
(function () {
  const fix = el => {
    const s = el.getAttribute && el.getAttribute("src");
    if (s && window.__ASSETS[s]) el.setAttribute("src", window.__ASSETS[s]);
  };
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    if (n.tagName === "IMG") fix(n);
    if (n.querySelectorAll) n.querySelectorAll("img").forEach(fix);
  }))).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>`;
html = html.replace("</head>", shim + "\n</head>");

/* The slice is a literal switch in the spliced file. Content can later
   replace the temporary sitting condition with its own play.sliceEnd. */
if (process.argv.includes("--slice")) {
  const build = cp.execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const playtest = { campaign: "flash_i", build, endsAt: { minSitting: 4 } };
  html = html.replace("</head>", `<script>window.PLAYTEST = ${JSON.stringify(playtest)};</script>\n</head>`);
}

const stamp = new Date().toISOString().slice(0, 10);
const version = JSON.parse(rd("package.json")).version;
if (RELEASE) {
  let commit = "unknown";
  try { commit = cp.execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); } catch (e) { /* not a checkout */ }
  /* The playtest frame (js/shell.js, `slice()`): one campaign, no Sandbox, other
     campaigns' saves hidden, the build on the menu and in the transcript's report.
     No `endsAt`: the act's own curtain ends the run. */
  html = html.replace("</head>", `<script>window.PLAYTEST = ${JSON.stringify({ campaign: "flash_i", build: `${commit}, ${stamp}`, version })};</script>\n</head>`);
}
html = html.replace("</title>", ` — v${version}</title>`);
html = `<!-- Ways & Means v${version}, built ${stamp}. Single file: open it in a browser. -->\n` + html;

fs.mkdirSync(out, { recursive: true });
const file = path.join(out, "ways-and-means.html");
fs.writeFileSync(file, html);

const kb = (fs.statSync(file).size / 1024).toFixed(0);
console.log("BUILD");
console.log("=".repeat(46));
console.log(`  stylesheets inlined  ${inlined.css}`);
console.log(`  scripts inlined      ${inlined.js}`);
console.log(`  images inlined       ${inlined.img}`);
if (RELEASE) console.log("  world story removed  " + (Object.keys(stripped).map(k => k.toLowerCase() + " " + stripped[k]).join(", ") || "none"));
if (inlined.missing.length) {
  console.log("  MISSING:");
  [...new Set(inlined.missing)].forEach(m => console.log("    " + m));
}
if (/<script src=|rel=["']stylesheet["']/.test(html.replace(shim, ""))) {
  console.log("\n  FAIL: the output still references external files");
  process.exit(1);
}
console.log(`\n  dist/ways-and-means.html  ${kb} KB`);
console.log("  open it in a browser; no server needed");
