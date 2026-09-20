/* =============================================================
   TRACE A SIGNATURE

     node tools/tracesig.js img/signature.png [--write]

   Turns a scanned signature into the single centreline <path> the
   assent ceremony draws. Prints the path; --write splices it into
   SIG_PATH in js/papers.js.

   CENTRELINE, NOT OUTLINE. potrace and friends produce a filled
   outline — the shape of the ink, two contours per stroke. That is
   the wrong thing here: css/terminal.css animates the signature with
   stroke-dashoffset, which needs a line to run along, not a region
   to fill. So this thins the ink to a one-pixel skeleton first
   (Zhang-Suen), walks the skeleton into polylines, simplifies them
   (Ramer-Douglas-Peucker), and emits one path.

   NO IMAGE LIBRARY. There is no PNG decoder in Node and this repo
   has one devDependency. Chromium is already present for the
   headless checks, so decoding happens in a canvas there and the
   result comes back through --dump-dom. Same reason the rest of the
   tooling shells out rather than taking packages.
   ============================================================= */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = path.join(__dirname, "..");

const CHROME = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
  process.env.CHROME
].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch { return false; } });

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const src = args.find(a => !a.startsWith("--")) || "img/signature.png";

if (!CHROME) { console.error("No Chromium found; cannot decode the image."); process.exit(1); }
if (!fs.existsSync(path.join(root, src))) {
  console.error(`Not found: ${src}\n\nPut the signature there and run again:\n` +
                `  node tools/tracesig.js ${src} --write`);
  process.exit(1);
}

/* The tracing runs in the browser, where the pixels are. */
const TRACE = `
const W = 228;                 // target width; the height follows the cropped ink

function thin(g, w, h) {                     // Zhang-Suen, in place
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : g[y * w + x];
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const kill = [];
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        if (!at(x, y)) continue;
        const p = [at(x,y-1),at(x+1,y-1),at(x+1,y),at(x+1,y+1),
                   at(x,y+1),at(x-1,y+1),at(x-1,y),at(x-1,y-1)];
        const B = p.reduce((a, b) => a + b, 0);
        if (B < 2 || B > 6) continue;
        let A = 0;
        for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) A++;
        if (A !== 1) continue;
        if (step === 0) {
          if (p[0] * p[2] * p[4]) continue;
          if (p[2] * p[4] * p[6]) continue;
        } else {
          if (p[0] * p[2] * p[6]) continue;
          if (p[0] * p[4] * p[6]) continue;
        }
        kill.push(y * w + x);
      }
      if (kill.length) { changed = true; kill.forEach(i => g[i] = 0); }
    }
  }
}

/* Walk the skeleton into polylines, starting from endpoints so strokes
   run end to end rather than breaking in the middle. */
function polylines(g, w, h) {
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : g[y * w + x];
  const N = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  const deg = (x, y) => N.reduce((n, d) => n + at(x + d[0], y + d[1]), 0);
  const used = new Uint8Array(w * h);
  const out = [];

  const walk = (sx, sy) => {
    const line = [[sx, sy]];
    used[sy * w + sx] = 1;
    let x = sx, y = sy, moved = true;
    while (moved) {
      moved = false;
      for (const d of N) {
        const nx = x + d[0], ny = y + d[1];
        if (at(nx, ny) && !used[ny * w + nx]) {
          used[ny * w + nx] = 1; line.push([nx, ny]); x = nx; y = ny; moved = true; break;
        }
      }
    }
    /* Keep short fragments. A skeleton breaks into pieces at every
       self-intersection, and a signature is mostly self-intersection;
       dropping them leaves visible gaps in the drawn stroke. */
    if (line.length > 2) out.push(line);
  };

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (at(x, y) && !used[y * w + x] && deg(x, y) === 1) walk(x, y);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (at(x, y) && !used[y * w + x]) walk(x, y);          // closed loops
  return out;
}

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  let idx = 0, max = 0;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
}

/* A HAND IS SMOOTH AND A SKELETON IS NOT. Thinning leaves a staircase along
   every stroke, and the Catmull-Rom fit faithfully turns that staircase into
   visible wobble — the signature read as scratchy rather than written. So the
   simplified points are relaxed toward their neighbours before fitting. Two
   things matter: the endpoints are held, so strokes still begin and end where
   they were traced; and it runs AFTER the RDP, so the points being smoothed
   are the ones the curve actually passes through. A subpath of fewer than four
   points (a dot, a crossed t) has no interior to move and is left alone. */
const SMOOTH_ITERS = 4, SMOOTH_W = 0.5, TENSION = 0.7;
function smooth(pts) {
  let p = pts.map(q => q.slice());
  for (let it = 0; it < SMOOTH_ITERS; it++) {
    const n = p.length; if (n < 4) break;
    const np = p.map(q => q.slice());
    for (let i = 1; i < n - 1; i++) {
      np[i][0] = (1 - SMOOTH_W) * p[i][0] + SMOOTH_W * (p[i-1][0] + p[i+1][0]) / 2;
      np[i][1] = (1 - SMOOTH_W) * p[i][1] + SMOOTH_W * (p[i-1][1] + p[i+1][1]) / 2;
    }
    p = np;
  }
  return p;
}

/* Smooth a polyline into a cubic chain (Catmull-Rom), so the drawn stroke
   reads as a hand rather than as a chain of line segments. */
function toBezier(p) {
  if (p.length < 2) return "";
  const q = [p[0]].concat(p, [p[p.length - 1]]);
  let d = "M" + p[0][0].toFixed(1) + " " + p[0][1].toFixed(1);
  for (let i = 1; i < q.length - 2; i++) {
    const c1 = [q[i][0] + (q[i+1][0] - q[i-1][0]) * TENSION / 6,
                q[i][1] + (q[i+1][1] - q[i-1][1]) * TENSION / 6];
    const c2 = [q[i+1][0] - (q[i+2][0] - q[i][0]) * TENSION / 6,
                q[i+1][1] - (q[i+2][1] - q[i][1]) * TENSION / 6];
    d += "C" + c1[0].toFixed(1) + " " + c1[1].toFixed(1) + "," +
                c2[0].toFixed(1) + " " + c2[1].toFixed(1) + "," +
                q[i+1][0].toFixed(1) + " " + q[i+1][1].toFixed(1);
  }
  return d;
}

/* Threshold on luminance, and treat transparent pixels as paper — a PNG
   exported with a clear background is the common case and would otherwise
   read as solid ink. */
function grab(canvas, w, h) {
  const px = canvas.getContext("2d").getImageData(0, 0, w, h).data;
  const g = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const a = px[i*4+3];
    const l = (px[i*4] * 0.299 + px[i*4+1] * 0.587 + px[i*4+2] * 0.114);
    g[i] = (a > 40 && l < 128) ? 1 : 0;
  }
  return g;
}

function run(img) {
  /* Work at a fixed width so thinning behaves consistently regardless of
     what resolution the signature was scanned at. */
  const TW = 900, TH = Math.max(1, Math.round(img.height * TW / img.width));
  const c = document.createElement("canvas");
  c.width = TW; c.height = TH;
  const cx = c.getContext("2d");
  cx.fillStyle = "#fff"; cx.fillRect(0, 0, TW, TH);
  cx.drawImage(img, 0, 0, TW, TH);
  let g = grab(c, TW, TH);
  const ink = g.reduce((n, v) => n + v, 0);

  /* CROP TO THE INK. A scan is mostly margin, and the margin is what the
     trace used to carry: the whole image scaled to 228 wide, so the hand
     sat small inside a viewBox that was mostly empty and the CSS had to
     guess a height. The bounding box is found here and the image is
     redrawn from that region at the working width, so the signature fills
     the box it is given and the viewBox it reports is the ink's own. */
  let x0 = TW, y0 = TH, x1 = -1, y1 = -1;
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    if (!g[y * TW + x]) continue;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < x0 || y1 < y0) return { error: "no ink found" };
  const PAD = 8;                                /* working px, so edges breathe */
  x0 = Math.max(0, x0 - PAD); y0 = Math.max(0, y0 - PAD);
  x1 = Math.min(TW - 1, x1 + PAD); y1 = Math.min(TH - 1, y1 + PAD);

  const back = img.width / TW;                  /* working px -> source px */
  const CW = x1 - x0 + 1, CH = y1 - y0 + 1;
  const SW = 900, SH = Math.max(1, Math.round(CH * SW / CW));
  const c2 = document.createElement("canvas");
  c2.width = SW; c2.height = SH;
  const cx2 = c2.getContext("2d");
  cx2.fillStyle = "#fff"; cx2.fillRect(0, 0, SW, SH);
  cx2.drawImage(img, x0 * back, y0 * back, CW * back, CH * back, 0, 0, SW, SH);
  g = grab(c2, SW, SH);

  thin(g, SW, SH);
  let lines = polylines(g, SW, SH);

  /* JOINED WHERE THEY TOUCH, NOT ACROSS THE PAGE.

     Thinning breaks the ink at every crossing, so a real signature comes
     out as dozens of fragments — this scan gives eighty-one. Drawn in
     sequence they read as fragments appearing wherever the sort points
     next, which is the complaint: the signature does not get signed, it
     arrives.

     So fragments are CHAINED: walk to the nearest unused endpoint and
     continue from there, reversing a fragment when its far end is closer.
     A join is made ONLY when the endpoints are within JOIN of each other.
     At a crossing they are; across the drawing they are not, and an
     unbounded greedy chain drew long diagonals straight through the name,
     which is worse than the fragments were. What survives is a handful of
     continuous strokes a pen could have made, drawn in the order a hand
     moves. Endpoints only, so a long baseline does not swallow the loops
     sitting on it. */
  const JOIN = 30;                    /* working px; a stroke is ~12 thick */
  const JOIN2 = JOIN * JOIN;
  function dist2(a, b) {
    const dx = a[0] - b[0], dy = a[1] - b[1];
    return dx * dx + dy * dy;
  }
  const chains = [];
  {
    const used = new Array(lines.length).fill(false);
    let cur = null, end = null;
    for (;;) {
      let ni = -1, nd = JOIN2, rev = false;
      if (cur) lines.forEach((l, i) => {
        if (used[i]) return;
        const d0 = dist2(end, l[0]), d1 = dist2(end, l[l.length - 1]);
        if (d0 < nd) { nd = d0; ni = i; rev = false; }
        if (d1 < nd) { nd = d1; ni = i; rev = true; }
      });
      if (ni < 0) {
        if (cur) { chains.push(cur); cur = null; end = null; }
        let bi = -1, bx = Infinity, brev = false;
        lines.forEach((l, i) => {
          if (used[i]) return;
          if (l[0][0] < bx) { bx = l[0][0]; bi = i; brev = false; }
          if (l[l.length - 1][0] < bx) { bx = l[l.length - 1][0]; bi = i; brev = true; }
        });
        if (bi < 0) break;
        used[bi] = true;
        cur = (brev ? lines[bi].slice().reverse() : lines[bi].slice());
        end = cur[cur.length - 1];
        continue;
      }
      used[ni] = true;
      const l = rev ? lines[ni].slice().reverse() : lines[ni].slice();
      l.forEach(p => cur.push(p));    /* the join is <= JOIN long, and unseen */
      end = l[l.length - 1];
    }
    if (cur) chains.push(cur);
  }

  const sx = W / SW;                           // uniform, so nothing distorts
  const H = Math.round(SH * sx);
  const d = chains.map(c => toBezier(smooth(rdp(c, 0.9).map(p => [p[0] * sx, p[1] * sx])))).join(" ");

  return { d: d, w: W, h: H,
           strokes: chains.length, inkPx: ink, src: SW + "x" + SH };
}

const img = new Image();
img.onload = () => {
  let r;
  try { r = run(img); } catch (e) { r = { error: e.message }; }
  document.getElementById("out").textContent = JSON.stringify(r);
};
img.onerror = () => { document.getElementById("out").textContent = '{"error":"image failed to load"}'; };
img.src = document.getElementById("src").src;
`;

const b64 = fs.readFileSync(path.join(root, src)).toString("base64");
const ext = path.extname(src).slice(1).toLowerCase();
const mime = ext === "jpg" ? "jpeg" : ext;
const tmp = path.join(require("os").tmpdir(), "tracesig-" + process.pid + ".html");
fs.writeFileSync(tmp, `<html><body><img id="src" src="data:image/${mime};base64,${b64}">` +
  `<pre id="out"></pre><script>${TRACE}</script></body></html>`);

/* stdio, not `2>/dev/null`: that redirection is a Unix shell's, and on
   Windows cmd it fails the whole call with "cannot find the path". */
const dom = cp.execSync(
  `"${CHROME}" --headless --disable-gpu --no-sandbox --virtual-time-budget=20000 ` +
  `--dump-dom "${tmp}"`,
  { maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
fs.unlinkSync(tmp);

const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
if (!m) { console.error("Chromium returned nothing usable."); process.exit(1); }
const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
if (r.error) { console.error("Trace failed: " + r.error); process.exit(1); }

console.log("TRACE " + src);
console.log("=".repeat(46));
console.log(`  source            ${r.src}`);
console.log(`  ink pixels        ${r.inkPx.toLocaleString()}`);
console.log(`  strokes found     ${r.strokes}`);
console.log(`  path length       ${r.d.length} chars`);
console.log(`  viewBox           0 0 ${r.w} ${r.h}`);
if (r.strokes === 0) {
  console.error("\n  No strokes. Is the ink dark on a light background?");
  process.exit(1);
}
if (r.strokes > 24)
  console.log("\n  NOTE: many separate strokes. If the scan is speckled, clean it up\n" +
              "        first — every fleck becomes a subpath the ceremony draws.");

if (!WRITE) {
  console.log("\n" + r.d.slice(0, 300) + (r.d.length > 300 ? " ..." : ""));
  console.log("\n  Re-run with --write to splice this into js/papers.js");
} else {
  const p = path.join(root, "js/papers.js");
  let s = fs.readFileSync(p, "utf8");
  let start = s.indexOf("  const SIG_BOX =");
  if (start < 0) start = s.indexOf("  const SIG_PATH =");
  const end = s.indexOf('";', start) + 2;
  if (start < 0) { console.error("SIG_PATH not found in js/papers.js"); process.exit(1); }
  const wrap = [];
  for (let i = 0; i < r.d.length; i += 90) wrap.push(r.d.slice(i, i + 90));
  const js =
    "  /* Traced from " + src + " by tools/tracesig.js, cropped to the ink and\n" +
    "     smoothed. ONE <path> of many subpaths; js/setpiece.js splits it into\n" +
    "     one path per stroke so the introduction can write it left to right.\n" +
    "     Regenerate rather than editing by hand. */\n" +
    "  const SIG_BOX = { w: " + r.w + ", h: " + r.h + " };\n" +
    "  const SIG_PATH =\n" +
    wrap.map((l, i) => '    "' + l + '"' + (i < wrap.length - 1 ? " +" : ";")).join("\n");
  fs.writeFileSync(p, s.slice(0, start) + js + s.slice(end));
  console.log("\n  written to js/papers.js");
  console.log(`  SIG_BOX carries the viewBox (0 0 ${r.w} ${r.h}); the set piece and`);
  console.log("  the ceremony read it, so nothing is retyped in the CSS.");
}
