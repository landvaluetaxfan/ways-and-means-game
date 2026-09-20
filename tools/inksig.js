/* =============================================================
   TURN A SCANNED SIGNATURE INTO THE IMAGE THE TERMINAL DRAWS

     node tools/inksig.js img/signature.png img/signature-ink.png

   Crops the scan to its ink, drops the paper (transparent behind it) and
   bakes the ink to the page's colour, so the game can lay the author's
   actual hand on the rule with no path in between. The reveal is a
   left-to-right clip — css/terminal.css .sig-armed/.sig-draw — which is
   why nothing here has to be a vector: a clip cannot fragment.

   NO IMAGE LIBRARY, the same as tools/laycheck.js. There is no PNG codec
   in Node and this repo has one devDependency, so the pixel work happens
   in the Chromium that is already present for the checks and comes back
   through --dump-dom as a data URL. Set CHROME if it is not on PATH.

   THE SOURCE STAYS THE SOURCE. img/signature.png is the scan as it
   arrived; this tool never writes it, so a bad crop is one command away
   from being redone. js/papers.js SIG_IMG declares the display size, and
   the printed height here is what belongs there.
   ============================================================= */
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os");
const root = path.join(__dirname, "..");

const CHROME = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
  process.env.CHROME
].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch { return false; } });

const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const src = args[0] || "img/signature.png";
const out = args[1] || "img/signature-ink.png";
const DISPLAY_W = 228;                    /* matches SIG_IMG.w in js/papers.js */
const INK = [0x1b, 0x1d, 0x19];           /* var(--ink) */

if (!CHROME) {
  console.error("No Chromium found. Set CHROME=/path/to/chrome and run again.");
  process.exit(1);
}
if (!fs.existsSync(path.join(root, src))) {
  console.error(`Not found: ${src}\n\nPut the scan there and run again.`);
  process.exit(1);
}

/* Runs in the browser, where the pixels are. */
const PIXELS = `
function go() {
  const img = document.getElementById("src");
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const cx = c.getContext("2d");
  cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, W, H).data;

  /* The ink is dark and opaque; a transparent export counts as paper. */
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const l = px[i] * 0.299 + px[i+1] * 0.587 + px[i+2] * 0.114;
    if (px[i+3] > 40 && l < 128) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (x1 < x0) { document.getElementById("out").textContent = JSON.stringify({ error: "no ink found" }); return; }
  const PAD = 10;                       /* source px, so edges breathe */
  x0 = Math.max(0, x0 - PAD); y0 = Math.max(0, y0 - PAD);
  x1 = Math.min(W - 1, x1 + PAD); y1 = Math.min(H - 1, y1 + PAD);
  const CW = x1 - x0 + 1, CH = y1 - y0 + 1;

  /* Alpha is the ink's darkness, so anti-aliased edges survive the bake. */
  const c2 = document.createElement("canvas");
  c2.width = CW; c2.height = CH;
  const cx2 = c2.getContext("2d");
  const out = cx2.createImageData(CW, CH);
  const R = ${INK[0]}, G = ${INK[1]}, B = ${INK[2]};
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    const s = ((y + y0) * W + (x + x0)) * 4, d = (y * CW + x) * 4;
    const a = px[s+3];
    const l = px[s] * 0.299 + px[s+1] * 0.587 + px[s+2] * 0.114;
    out.data[d] = R; out.data[d+1] = G; out.data[d+2] = B;
    out.data[d+3] = a > 40 ? Math.max(0, 255 - l) : 0;
  }
  cx2.putImageData(out, 0, 0);
  document.getElementById("out").textContent =
    JSON.stringify({ w: CW, h: CH, url: c2.toDataURL("image/png") });
}
`;

const b64 = fs.readFileSync(path.join(root, src)).toString("base64");
const tmp = path.join(os.tmpdir(), "inksig-" + process.pid + ".html");
fs.writeFileSync(tmp,
  `<html><body><img id="src" src="data:image/png;base64,${b64}" onload="go()">` +
  `<pre id="out"></pre><script>${PIXELS}</script></body></html>`);

/* stdio, not `2>/dev/null`: that redirection is a Unix shell's, and on
   Windows cmd it fails the whole call with "cannot find the path". */
const dom = cp.execSync(
  `"${CHROME}" --headless --disable-gpu --no-sandbox --virtual-time-budget=20000 ` +
  `--dump-dom "${tmp}"`,
  { maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
fs.unlinkSync(tmp);

const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
if (!m) { console.error("Chromium returned nothing usable."); process.exit(1); }
const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
if (r.error) { console.error("Ink pass failed: " + r.error); process.exit(1); }

const png = Buffer.from(r.url.split(",")[1], "base64");
fs.writeFileSync(path.join(root, out), png);

const h = Math.round(DISPLAY_W * r.h / r.w);
console.log("INK SIGNATURE");
console.log("=".repeat(46));
console.log(`  source        ${src}`);
console.log(`  cropped       ${r.w}x${r.h}`);
console.log(`  written       ${out} (${png.length.toLocaleString()} bytes)`);
console.log(`\n  display ${DISPLAY_W}px wide, ${h}px tall — SIG_IMG in js/papers.js`);
console.log(`  is { w: ${DISPLAY_W}, h: ${h} }. Update it if that is not the number there.`);
