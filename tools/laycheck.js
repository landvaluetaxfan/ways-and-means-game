/* =============================================================
   LAYOUT, MEASURED.

     node tools/laycheck.js                 the three widths below
     node tools/laycheck.js --width 1000    one width
     node tools/laycheck.js --all           every finding, not the worst ten

   CLAUDE.md keeps a list of CSS traps and every one of them ends with the
   same sentence: found by measuring rather than reading. A screen that is
   present in the DOM, correct in the stylesheet and invisible on the glass
   is the defining bug of this interface — the menu ticker pushed one screen
   right by an inherited `padding-left:100%`, the habitat map drawn on every
   tab at once, the aisle running off the box. None of them is visible to a
   static check, and none is visible to jsdom either: jsdom has no layout, so
   `npm run ui` and `npm run ux` can prove a panel EXISTS and never that it
   FITS.

   So this drives the real Chromium that is already on the box for
   tools/tracesig.js, boots the game the way tools/harness.js does, walks
   every tab, and measures. No new dependency: the browser is invoked exactly
   as tracesig invokes it, results come back through --dump-dom in a <pre>.

   IT IS NOT IN `npm run check`, on purpose. The ten checks there are fast,
   deterministic and need nothing but node and jsdom; this one needs a
   browser binary that a CI runner may not have, and a check that silently
   skips half the time reads as coverage and is not. Run it when you touch
   the stylesheet or a panel, and before a playtest build.

   WHAT COUNTS AS A FAULT. Two things, both unambiguous:

     CLIPPED   the element clips its overflow and there is overflow, so
               content the player is meant to read is simply not on the
               glass. Always a bug.
     ESCAPES   the element draws a border and its content extends past it,
               so text crosses its own frame. This is the lobbying fold
               hanging through the floor of its panel.

   Elements that scroll are not faults: `auto` and `scroll` mean the author
   said so. Overflow with no border and no clipping is not reported either —
   that is ordinary flow, and reporting it buries the two that matter.
   ============================================================= */

const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = path.join(__dirname, "..");

const CHROME = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
  process.env.CHROME
].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch { return false; } });

if (!CHROME) {
  console.log("SKIP: no Chromium found. Set CHROME=/path/to/chrome to measure layout.");
  process.exit(0);
}

const argv = process.argv.slice(2);
const ALL = argv.includes("--all");
const wArg = argv.indexOf("--width");
const WIDTHS = wArg >= 0 ? [Number(argv[wArg + 1])] : [1000, 1280, 1600];

/* The tabs, in the order the interface presents them. */
const TABS = ["sit", "gov", "cham", "pap", "orb", "world", "cx", "log"];

/* Runs inside the page. Boots the shell into a running game exactly as
   tools/harness.js does, then measures each tab in turn. */
const PROBE = `
(function () {
  var out = document.getElementById("laycheck-out");
  function done(o) { out.textContent = JSON.stringify(o); }

  /* The terminal draws its own dialogs, so answer them through Dialog's
     callbacks — the same override the jsdom harness installs. */
  try {
    Dialog.confirm = function (m, o, cb) { (typeof o === "function" ? o : cb)(true); };
    Dialog.prompt  = function (m, o, cb) { (typeof o === "function" ? o : cb)("Test ministry"); };
    Dialog.alert   = function (m, o, cb) { var f = typeof o === "function" ? o : cb; if (f) f(); };
  } catch (e) {}

  try {
    Shell.boot(CONTENT);
    document.querySelector('[data-go="new"]').click();
    var adm = document.querySelector("[data-admin]");
    if (adm) adm.click();
    /* The introduction stands between the government and the slots. */
    var spGo = document.querySelector("[data-sp-go]");
    if (spGo) spGo.click();
    document.querySelector('[data-new="1"]').click();
  } catch (e) { return done({ error: "boot: " + (e && e.message) }); }

  function name(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    var c = (el.getAttribute("class") || "").trim().split(/\\s+/).filter(Boolean);
    if (c.length) s += "." + c.slice(0, 3).join(".");
    return s;
  }

  /* A selector is not enough to FIND the thing: three boxes on the Government
     tab all report as div.panel. So carry the panel's own heading, and the
     position among its siblings, which together name it on the glass. */
  function where(el) {
    var head = el.querySelector("h1,h2,h3,.rulehead,.phead,b,legend");
    var label = head ? head.textContent.trim().replace(/\\s+/g, " ").slice(0, 40) : "";
    var sibs = el.parentNode ? [].slice.call(el.parentNode.children) : [];
    var nth = sibs.indexOf(el) + 1;
    var par = el.parentNode && el.parentNode.nodeType === 1 ? name(el.parentNode) : "";
    return { label: label, nth: nth + "/" + sibs.length, parent: par };
  }

  /* A border on any edge means the element draws a frame content must stay
     inside. Without one, overflow is just flow and is not a fault. */
  function framed(cs) {
    return parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0 ||
           parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderRightWidth) > 0;
  }

  var TOL = 2;                       /* sub-pixel rounding is not a defect */

  /* DECORATION THAT OVERHANGS ON PURPOSE IS NOT A FAULT. scrollHeight counts
     absolutely positioned descendants, and this interface deliberately hangs
     things proud of their box: the dual-majority threshold tick is drawn at
     top:-2px;bottom:-2px with a triangle above that, so every .dmbar reported
     as escaping its border by 3px. It is doing exactly what it was written to
     do.

     So a flagged element is confirmed by looking for IN-FLOW content past the
     content box. Out-of-flow children (absolute, fixed) are the author saying
     "put this where I said"; static and relative children past the edge are
     the bug. A check that cries wolf gets switched off, which costs more than
     the fault it was reporting. */
  function realOverflow(el, cs, axis) {
    var r = el.getBoundingClientRect();
    var edge = axis === "y"
      ? r.top  + parseFloat(cs.borderTopWidth)  + el.clientHeight
      : r.left + parseFloat(cs.borderLeftWidth) + el.clientWidth;
    var kids = el.querySelectorAll("*");
    for (var i = 0; i < kids.length; i++) {
      var pos = getComputedStyle(kids[i]).position;
      if (pos === "absolute" || pos === "fixed") continue;
      var k = kids[i].getBoundingClientRect();
      if (!k.width && !k.height) continue;
      if ((axis === "y" ? k.bottom : k.right) > edge + TOL)
        return name(kids[i]) + (kids[i].textContent || "").trim()
                 .replace(/\s+/g, " ").slice(0, 30).replace(/^/, ' "') + '"';
    }
    return null;
  }
  function measure(tab) {
    var hits = [], screen = document.querySelector(".screen.on");
    if (!screen) return hits;
    var els = screen.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (!el.clientHeight && !el.clientWidth) continue;

      var oy = cs.overflowY, ox = cs.overflowX;
      var scrollsY = oy === "auto" || oy === "scroll";
      var scrollsX = ox === "auto" || ox === "scroll";
      var clipsY   = oy === "hidden" || oy === "clip";
      var clipsX   = ox === "hidden" || ox === "clip";
      var dy = el.scrollHeight - el.clientHeight;
      var dx = el.scrollWidth  - el.clientWidth;
      var fr = framed(cs), culprit = null;

      /* A CLOSED FOLD IS NOT A CLIPPED PANEL. A box collapsed to nothing on
         the measured axis is holding its content back ON PURPOSE, which is
         what a folded panel is, so it is only a fault if the box is drawn at
         all. The guard is per AXIS: an element can be a real box across and
         collapsed down, and testing the element as a whole reported every
         closed fold in the interface as a bug. */
      if (dy > TOL && !scrollsY && (clipsY || fr) && el.clientHeight > 0 &&
          (culprit = realOverflow(el, cs, "y")))
        hits.push({ tab: tab, el: name(el), axis: "y", by: dy, at: where(el),
                    kind: clipsY ? "CLIPPED" : "ESCAPES", box: el.clientHeight, by_what: culprit });
      if (dx > TOL && !scrollsX && (clipsX || fr) && el.clientWidth > 0 &&
          (culprit = realOverflow(el, cs, "x")))
        hits.push({ tab: tab, el: name(el), axis: "x", by: dx, at: where(el),
                    kind: clipsX ? "CLIPPED" : "ESCAPES", box: el.clientWidth, by_what: culprit });
    }
    return hits;
  }

  var found = [], tabs = ${JSON.stringify(TABS)}, drawn = [];
  for (var t = 0; t < tabs.length; t++) {
    var btn = document.querySelector('.tab[data-t="' + tabs[t] + '"]');
    if (!btn) continue;
    try { btn.click(); } catch (e) { continue; }
    var on = document.querySelector(".screen.on");
    drawn.push(tabs[t] + (on ? "" : " (NOT DRAWN)"));
    found = found.concat(measure(tabs[t]));
  }

  /* The page itself must not scroll sideways. */
  var de = document.documentElement;
  var pageX = de.scrollWidth - de.clientWidth;

  done({ hits: found, tabs: drawn, pageX: pageX, vw: de.clientWidth });
})();
`;

function run(width) {
  /* The temp page lives in the repo root so index.html's relative
     <script src> paths resolve exactly as they do for a player. */
  const tmp = path.join(root, "_laycheck." + process.pid + ".html");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8")
    .replace(/<script>[\s\S]*?<\/script>\s*<\/body>/,
             '<pre id="laycheck-out"></pre><script>' + PROBE + "</script></body>");
  fs.writeFileSync(tmp, html);
  let dom = "";
  try {
    dom = cp.execSync(
      `"${CHROME}" --headless --disable-gpu --no-sandbox --hide-scrollbars ` +
      `--allow-file-access-from-files --virtual-time-budget=20000 ` +
      `--window-size=${width},900 --dump-dom "${tmp}" 2>/dev/null`,
      { maxBuffer: 64 * 1024 * 1024 }).toString();
  } finally { try { fs.unlinkSync(tmp); } catch {} }

  const m = dom.match(/<pre id="laycheck-out">([\s\S]*?)<\/pre>/);
  if (!m) return { error: "Chromium returned nothing usable" };
  try {
    return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")
                          .replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
  } catch (e) { return { error: "unparseable: " + m[1].slice(0, 200) }; }
}

console.log("LAYOUT CHECK");
console.log("=".repeat(62));

let fail = 0;
for (const width of WIDTHS) {
  const r = run(width);
  console.log("\n  " + width + "px");
  if (r.error) { console.log("    FAIL " + r.error); fail++; continue; }

  if (r.pageX > 2) { console.log(`    FAIL the page scrolls sideways by ${r.pageX}px`); fail++; }
  const missing = (r.tabs || []).filter(t => /NOT DRAWN/.test(t));
  if (missing.length) { console.log("    FAIL tabs that drew nothing: " + missing.join(", ")); fail++; }

  const hits = (r.hits || []).sort((a, b) => b.by - a.by);
  if (!hits.length) { console.log(`    ok   ${(r.tabs || []).length} tabs, nothing clipped, nothing escapes its frame`); continue; }

  fail += hits.length;
  const show = ALL ? hits : hits.slice(0, 10);
  for (const h of show) {
    const at = h.at || {};
    console.log(`    ${h.kind === "CLIPPED" ? "CLIP" : "OVER"} [${h.tab}] ${h.el}` +
                (at.label ? `  "${at.label}"` : "") +
                `\n         ${h.by}px past a ${h.box}px box on ${h.axis}` +
                ` (${h.kind === "CLIPPED" ? "clipped — the player never sees it" : "drawn outside its own border"})` +
                `\n         child ${at.nth} of ${at.parent}` +
                (h.by_what ? `\n         overflowed by ${h.by_what}` : ""));
  }
  if (!ALL && hits.length > show.length)
    console.log(`    ... and ${hits.length - show.length} more (--all)`);
}

console.log("");
if (fail) {
  console.log(fail + " LAYOUT FINDING" + (fail === 1 ? "" : "S"));
  process.exit(1);
}
console.log("layout is healthy");
