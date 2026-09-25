/* =============================================================
   LAYOUT, MEASURED.

     node tools/laycheck.js                  every viewport shape below
     node tools/laycheck.js --size 1366x768  one shape
     node tools/laycheck.js --all            every finding, not the worst ten

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
   tools/inksig.js, boots the game the way tools/harness.js does, walks
   every tab, and measures. No new dependency: the browser is invoked exactly
   as inksig invokes it, results come back through --dump-dom in a <pre>.

   IT IS NOT IN `npm run check`, on purpose. The ten checks there are fast,
   deterministic and need nothing but node and jsdom; this one needs a
   browser binary that a CI runner may not have, and a check that silently
   skips half the time reads as coverage and is not. Run it when you touch
   the stylesheet or a panel, and before a playtest build.

   WHAT COUNTS AS A FAULT. Two things, both unambiguous:

     MENU      the main menu's printed band has taken more than 28% of a
               short screen, or the plate's content is being drawn on top
               of it. The menu is measured before the boot, because after
               the boot it is gone — which is why it went unmeasured for as
               long as this tool existed.
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

/* THE SHAPES, NOT THE WIDTHS. This measured three widths at one height, and
   the height was always 900 — so the 900px and 700px breakpoints in the
   stylesheet had never been measured at all, and the VERTICAL axis had never
   been varied once.

   Height is the axis that actually bites, and it bites for a reason nobody
   would notice from the inside: the interface is developed on a 27-inch
   1440p panel, where there are 1,440 vertical pixels. A common laptop has
   768. Every screen here is height:100% with its own internal scrollers, so
   it SHOULD degrade — and "should" is the word this repo has been burned by
   twice. A panel that fits at 900 and clips at 768 is invisible to the
   author and invisible to the check.

   So: real shapes, including the ones people actually have. 2560x1440 is the
   author's monitor; 1366x768 is the commonest laptop panel in the world;
   820x1180 is a tablet held upright, which is the only portrait case and the
   one that exercises the single-column collapse.

     node tools/laycheck.js                  every shape below
     node tools/laycheck.js --size 1366x768  one of them
     node tools/laycheck.js --width 1000     one width, at 900 as before */
const VIEWPORTS = [
  [2560, 1440],   /* the author's monitor */
  [1600, 1200],   /* wide and tall */
  [1440, 900],    /* the common laptop above the fold */
  [1366, 768],    /* the commonest laptop panel there is */
  [1280, 800],    /* small laptop */
  [1024, 640],    /* below the 1080 collapse, and short with it */
  [820, 1180]     /* a tablet upright: the portrait case */
];

const sArg = argv.indexOf("--size");
const wArg = argv.indexOf("--width");
const SHAPES =
  sArg >= 0 ? [String(argv[sArg + 1]).split("x").map(Number)]
: wArg >= 0 ? [[Number(argv[wArg + 1]), 900]]
: VIEWPORTS;

/* The tabs, in the order the interface presents them. */
const TABS = ["sit", "gov", "cham", "econ", "party", "rel", "orb", "world", "cx", "log"];

/* WHAT A FAULT IS, shared by the two probes below: the game's and the
   editor's. Runs inside the page; a template literal, so no back-ticks. */
const HELPERS = `
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
    /* PRUNE THE SUBTREE, not just the node. This skipped an out-of-flow child
       and then went on checking ITS children, which are just as out of flow:
       the signature is an <img> inside an absolutely positioned span, so the
       image was reported as escaping a box it was never in, at every viewport
       at once. An element positioned out of flow takes its whole subtree with
       it, so the walk has to stop there rather than step over one node. */
    var stack = [], kids = el.children;
    for (var n = 0; n < kids.length; n++) stack.push(kids[n]);
    while (stack.length) {
      var kid = stack.pop();
      var pos = getComputedStyle(kid).position;
      if (pos === "absolute" || pos === "fixed") continue;   /* and its subtree */
      var k = kid.getBoundingClientRect();
      if (k.width || k.height) {
        if ((axis === "y" ? k.bottom : k.right) > edge + TOL)
          return name(kid) + (kid.textContent || "").trim()
                   .replace(/\\s+/g, " ").slice(0, 30).replace(/^/, ' "') + '"';
      }
      for (var m = 0; m < kid.children.length; m++) stack.push(kid.children[m]);
    }
    return null;
  }
  /* EVERY ELEMENT UNDER ONE ROOT: the game's screen that is on, or the
     editor's viewport. */
  function measureIn(screen, tab) {
    var hits = [];
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

  function measure(tab) { return measureIn(document.querySelector(".screen.on"), tab); }
`;

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

  /* THE MENU IS A SCREEN TOO, and this walked straight past it into a game
     for as long as it existed. It cost the main menu two faults nobody could
     see from a 1440p desktop: a printed band that grew from 12% of the glass
     to 34% as the screen shrank, and menu buttons running underneath it on
     the commonest laptop panel there is. Measured here, before the boot,
     because after it the menu is gone. */
  var menu = null;
  try {
    Shell.boot(CONTENT);
    menu = (function () {
      var out = [];
      var band = document.querySelector(".menu-footer");
      var plate = document.querySelector(".menu-plate");
      var vh = document.documentElement.clientHeight;
      if (!band || !plate) return out;
      var br = band.getBoundingClientRect();

      /* A BAND THAT GROWS AS THE GLASS SHRINKS. It is furniture, not content,
         so a third of a short screen is a fault however correct its CSS. */
      if (br.height > vh * 0.28)
        out.push({ what: "the printed band", detail: Math.round(br.height) +
                   "px is " + Math.round(br.height / vh * 100) + "% of a " + vh + "px screen" });

      /* AND IT MUST NOT BE PAINTED OVER. The plate is z-index 2 and the band
         is not, so a plate that cannot fit draws straight through it. Check
         the plate's real content rather than the plate box, which carries
         padding the band may legitimately sit inside. */
      var kids = plate.querySelectorAll(".menu-title, .menu-tagline, .menu-btns, .menu-warn, .menu-text");
      for (var i = 0; i < kids.length; i++) {
        var kr = kids[i].getBoundingClientRect();
        if (!kr.height) continue;
        if (kr.bottom > br.top + 1)
          out.push({ what: "." + (kids[i].className.split(" ")[0] || "?"),
                     detail: "ends at y=" + Math.round(kr.bottom) +
                             ", under a band that starts at y=" + Math.round(br.top) });
      }
      return out;
    })();
  } catch (e) { return done({ error: "menu: " + (e && e.message) }); }

  try {
    document.querySelector('[data-go="new"]').click();
    var adm = document.querySelector("[data-admin]");
    if (adm) adm.click();
    /* The introduction stands between the government and the slots. */
    var spGo = document.querySelector("[data-sp-go]");
    if (spGo) spGo.click();
    document.querySelector('[data-new="1"]').click();
  } catch (e) { return done({ error: "boot: " + (e && e.message) }); }

${HELPERS}
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

  /* WHICH FONT DID WE ACTUALLY MEASURE WITH.

     Every measurement in this file is a width, and a width is a font. For
     some time this runner had no Liberation Sans Narrow installed, so --f-ui
     fell through Narrow, Arial Narrow, Arial and Helvetica to the generic and
     landed on full-width Liberation Sans: the terminal's own face, the one
     carrying every label and table column, was being measured 21.9% WIDER
     than the author sees it (2562.7 against 2101.7 for a fixed test string).

     Passing stayed sound, because measuring wide and finding no overflow
     implies none when narrow. But a runner that silently measures a
     different typeface than the player reads is reporting on a different
     interface, and nothing said so. So each run now names the face it
     resolved for the three stacks that matter and flags a fallback.

     The width is the identity: a family name cannot be read back off a
     computed style, so the probe measures a fixed string in the stack and in
     each candidate, and reports the candidate it matches. */
  function faceOf(stack) {
    var probe = document.createElement("span");
    probe.style.cssText = "position:absolute;left:-9999px;top:0;white-space:pre;" +
                          "font-size:100px;font-family:" + stack;
    probe.textContent = "The quick brown fox jumps over the lazy dog 0123456789";
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.parentNode.removeChild(probe);
    return Math.round(w * 10) / 10;
  }
  /* RESOLVE THE WAY CSS DOES: walk the declaration in ORDER and take the
     first family the browser says it has. Two earlier attempts got this
     wrong and both were instructive. Matching by width picked whichever
     candidate in MY list happened to tie first, so --f-data resolved to
     DejaVu Sans Mono and was then reported as having fallen back FROM
     DejaVu Sans Mono. And widths collide: a family the box lacks measures
     as the document default, which is Liberation Serif here, so an absent
     "Arial Narrow" tied with a present "Liberation Serif" and won.

     Declaration order needs no width at all for the identity. The width is
     reported beside it because it is the number every finding below is
     made of, and because two stacks resolving to the same width is worth
     being able to see. */
  function families(decl) {
    return decl.split(",").map(function (x) {
      return x.trim().replace(/^["']|["']$/g, "");
    }).filter(Boolean);
  }
  var GENERIC = { "sans-serif":1, "serif":1, "monospace":1, "cursive":1,
                  "fantasy":1, "system-ui":1 };
  /* PRESENCE, THE ONLY WAY THAT ACTUALLY WORKS HERE. document.fonts.check
     was the obvious tool and it is the wrong one: in this Chromium it
     answered true for Segoe UI, Georgia and Bodoni MT, none of which the box
     has, because it reports whether the text can be RENDERED — and with
     fallback, it always can. So the report cheerfully named Georgia as the
     face it had measured with.

     The two-generic trick is the reliable one. Measure the family with
     monospace behind it and again with serif behind it. Absent, it follows
     the fallback and the two widths differ; present, the family wins both
     times and they match. The generics differ from each other by
     construction, so no family fools both.

     (No back-ticks in this comment, and none anywhere else inside PROBE:
     the whole probe is a template literal, so one would end it. That is
     the same trap as the \s that once ate every letter s in here.) */
  function have(f) {
    if (GENERIC[f]) return true;
    return Math.abs(faceOf('"' + f + '", monospace') -
                    faceOf('"' + f + '", serif')) < 0.5;
  }
  var fonts = {};
  var STACKS = ["--f-ui", "--f-read", "--f-sans", "--f-data", "--f-doc", "--f-disp"];
  var rootCS = getComputedStyle(document.documentElement);
  for (var si = 0; si < STACKS.length; si++) {
    var decl = rootCS.getPropertyValue(STACKS[si]).trim();
    if (!decl) { fonts[STACKS[si]] = { declared: "(not defined)" }; continue; }
    var fam = families(decl), face = null, skipped = [];
    for (var fi = 0; fi < fam.length; fi++) {
      if (have(fam[fi])) { face = fam[fi]; break; }
      skipped.push(fam[fi]);
    }
    fonts[STACKS[si]] = {
      width: faceOf(decl),
      face: face || "(none of " + fam.length + ")",
      skipped: skipped,
      fellBack: skipped.length > 0 || GENERIC[face] === 1
    };
  }

  done({ hits: found, tabs: drawn, pageX: pageX, vw: de.clientWidth, menu: menu,
         fonts: fonts });
})();
`;

/* THE EDITOR, MEASURED (25 Sep). It drew an empty grey page in every
   browser for as long as the main menu has existed: css/terminal.css hides
   #shell until it is shown, the game shows it and the editor never did, and
   every check of the editor runs in jsdom, which applies no stylesheet. So
   this boots editor.html, asks first whether it draws at all, then walks
   its tabs, opening each tab's first entry, and measures the same two
   faults. Desktop shapes only: it is an authoring tool. */
const EDITOR_MIN_WIDTH = 1280;
const EDITOR_PROBE = `
(function () {
  var out = document.getElementById("laycheck-out");
  function done(o) { out.textContent = JSON.stringify(o); }
  try {
    Dialog.confirm = function (m, o, cb) { (typeof o === "function" ? o : cb)(false); };
    Dialog.prompt  = function (m, o, cb) { (typeof o === "function" ? o : cb)(null); };
    Dialog.alert   = function (m, o, cb) { var f = typeof o === "function" ? o : cb; if (f) f(); };
    try { localStorage.clear(); } catch (e) {}
    Editor.boot();
  } catch (e) { return done({ error: "editor boot: " + (e && e.message) }); }
  ${HELPERS}
  var shell = document.getElementById("shell");
  var sr = shell ? shell.getBoundingClientRect() : { width: 0, height: 0 };
  var drawsAt = shell ? getComputedStyle(shell).display : "none";
  if (!shell || drawsAt === "none" || sr.height < 100 || sr.width < 100)
    return done({ blank: "the editor draws nothing: #shell is " + drawsAt + ", " +
                         Math.round(sr.width) + "x" + Math.round(sr.height) });
  var found = [], drawn = [], btns = document.querySelectorAll(".tab[data-t]");
  for (var t = 0; t < btns.length; t++) {
    var id = btns[t].getAttribute("data-t");
    try { btns[t].click(); } catch (e) { drawn.push(id + " (NOT DRAWN)"); continue; }
    drawn.push(id);
    found = found.concat(measureIn(document.getElementById("viewport"), id));
  }
  var de = document.documentElement;
  done({ hits: found, tabs: drawn, pageX: de.scrollWidth - de.clientWidth });
})();
`;

function run(width, height, page) {
  /* The temp page lives in the repo root so index.html's relative
     <script src> paths resolve exactly as they do for a player. */
  const editor = page === "editor.html";
  const tmp = path.join(root, "_laycheck." + process.pid + ".html");
  const html = fs.readFileSync(path.join(root, page || "index.html"), "utf8")
    .replace(/<script>[\s\S]*?<\/script>\s*<\/body>/,
             '<pre id="laycheck-out"></pre><script>' + (editor ? EDITOR_PROBE : PROBE) + "</script></body>");
  fs.writeFileSync(tmp, html);
  let dom = "";
  try {
    dom = cp.execSync(
      `"${CHROME}" --headless --disable-gpu --no-sandbox --hide-scrollbars ` +
      `--allow-file-access-from-files --virtual-time-budget=20000 ` +
      `--window-size=${width},${height} --dump-dom "${tmp}" 2>/dev/null`,
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
let saidFonts = false;
for (const [width, height] of SHAPES) {
  const r = run(width, height);

  /* NAME THE FACES BEFORE THE NUMBERS, once. Every finding below is a width
     and every width is a font, so a reader has to know which one. A stack
     that fell back is not a failure — the runner may simply not have the
     font a player has — but it is reported, because it means these numbers
     describe a different typeface than the author is looking at. */
  if (!saidFonts && r.fonts) {
    saidFonts = true;
    console.log("\n  measured with");
    let fellBack = 0;
    for (const k of Object.keys(r.fonts)) {
      const f = r.fonts[k];
      if (f.declared) { console.log("    " + k.padEnd(9) + " " + f.declared); continue; }
      const note = f.skipped && f.skipped.length
        ? "   <- no " + f.skipped.join(", ") : "";
      console.log("    " + k.padEnd(9) + " " + String(f.face).padEnd(24) +
                  String(f.width).padStart(8) + note);
      if (f.fellBack) fellBack++;
    }
    if (fellBack) console.log("    " + fellBack +
      " stack(s) fell back: these widths are not what a player with the named font sees");
  }

  console.log("\n  " + width + "x" + height);
  if (r.error) { console.log("    FAIL " + r.error); fail++; continue; }

  if (r.pageX > 2) { console.log(`    FAIL the page scrolls sideways by ${r.pageX}px`); fail++; }
  const missing = (r.tabs || []).filter(t => /NOT DRAWN/.test(t));
  if (missing.length) { console.log("    FAIL tabs that drew nothing: " + missing.join(", ")); fail++; }

  for (const m of (r.menu || [])) {
    console.log("    MENU " + m.what + "  " + m.detail);
    fail++;
  }

  report(r, `the menu, then ${(r.tabs || []).length} tabs`);
  if (width >= EDITOR_MIN_WIDTH) {
    const e = run(width, height, "editor.html");
    if (e.error) { console.log("    FAIL editor: " + e.error); fail++; }
    else if (e.blank) { console.log("    FAIL " + e.blank); fail++; }
    else {
      if (e.pageX > 2) { console.log(`    FAIL the editor scrolls sideways by ${e.pageX}px`); fail++; }
      report(e, `the editor, ${(e.tabs || []).length} tabs`);
    }
  }
}

function report(r, what) {
  const hits = (r.hits || []).sort((a, b) => b.by - a.by);
  if (!hits.length) { console.log(`    ok   ${what}, nothing clipped, nothing escapes its frame`); return; }

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
