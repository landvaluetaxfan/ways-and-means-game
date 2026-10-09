/* =============================================================
   LAYOUT, MEASURED.

     node tools/laycheck.js                  every viewport shape below
     node tools/laycheck.js --size 1366x768  one shape
     node tools/laycheck.js --all            every finding, not the worst ten

   LESSONS.md keeps a list of CSS traps and every one of them ends with the
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

if (!CHROME && !process.argv.includes("--prepare")) {
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
const TABS = ["sit", "gov", "cham", "party", "rel", "econ", "orb", "world", "cx"];

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

  /* Grid overflow misses empty tracks and implicit columns: both can fit
     inside the viewport while leaving the working panels needlessly narrow.
     Inspect resolved browser tracks and the actual in-flow boxes instead. */
  function measureGridLayout(tab) {
    if (tab !== "gov" && tab !== "orb") return [];
    var grid = document.querySelector("#s-" + tab + ".on > .grid");
    if (!grid) return [];
    var cs = getComputedStyle(grid), rect = grid.getBoundingClientRect();
    var tracks = cs.gridTemplateColumns.match(/[0-9.]+px/g) || [];
    var children = [].slice.call(grid.children).filter(function (el) {
      var style = getComputedStyle(el), box = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" &&
        style.position !== "absolute" && style.position !== "fixed" &&
        box.width > 0 && box.height > 0;
    });
    var collapsed = matchMedia("(max-width:1080px)").matches, detail = "";
    if (tab === "gov" && !collapsed && tracks.length > children.length)
      detail = tracks.length + " resolved columns for " + children.length +
        " visible in-flow columns; unused tracks leave the department cards narrow";
    if (tab === "orb" && collapsed) {
      var misplaced = children.filter(function (el) {
        var box = el.getBoundingClientRect();
        return Math.abs(box.left - rect.left) > TOL || Math.abs(box.width - rect.width) > TOL;
      });
      if (tracks.length !== 1 || misplaced.length)
        detail = tracks.length + " resolved columns after the single-column collapse; " +
          misplaced.length + " panels do not share the grid's left edge and full width";
    }
    return detail ? [{ tab: tab, el: name(grid), kind: "LAYOUT", by: 0,
      at: where(grid), detail: detail }] : [];
  }

  /* Economy's content must fit, not merely disappear inside scrollboxes.
     These faults reproduce the cramped Bank, tiny labels and capped plot. */
  function measureEconomy(tab) {
    if (tab !== "econ") return [];
    var faults = [], scope = document.querySelector("#s-econ");
    function fault(el, detail) {
      faults.push({ tab: tab, el: name(el), kind: "LAYOUT", by: 0, at: where(el), detail: detail });
    }
    if (innerWidth <= 1080) {
      var grid = scope.querySelector(".g-econ"), gr = grid.getBoundingClientRect();
      [].slice.call(grid.children).forEach(function (p) {
        var r = p.getBoundingClientRect();
        if (Math.abs(r.left - gr.left) > TOL || Math.abs(r.width - gr.width) > TOL)
          fault(p, "Economy panel does not occupy the full collapsed column");
      });
    }
    [].slice.call(scope.querySelectorAll(".panel .pbody")).forEach(function (b) {
      if (b.scrollHeight > b.clientHeight + TOL && getComputedStyle(b).overflowY !== "visible")
        fault(b, "Economy content still scrolls inside a panel");
    });
    var sublabel = scope.querySelector("#econ-bank .plab em"), background = sublabel;
    while (background.parentElement && getComputedStyle(background).backgroundColor === "rgba(0, 0, 0, 0)")
      background = background.parentElement;
    function luminance(color) {
      var rgb = color.match(/[0-9.]+/g).slice(0, 3).map(function (v) {
        var c = Number(v) / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    }
    var fg = luminance(getComputedStyle(sublabel).color), bg = luminance(getComputedStyle(background).backgroundColor);
    if ((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05) < 4.5)
      fault(sublabel, "Economy sub-label contrast is below 4.5:1");
    [].slice.call(scope.querySelectorAll(".chart-tick, .chart-tag")).forEach(function (label) {
      var surface = label;
      while (surface.parentElement && getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)")
        surface = surface.parentElement;
      var f = luminance(getComputedStyle(label).color), b = luminance(getComputedStyle(surface).backgroundColor);
      if ((Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05) < 4.5)
        fault(label, "Economy chart label contrast is below 4.5:1");
    });
    if (innerWidth >= 1900) {
      var label = scope.querySelector(".plab em");
      if (parseFloat(getComputedStyle(label).fontSize) < 11.5)
        fault(label, "Economy sub-label remains below 11.5px on a wide window");
      var rows = {};
      [].slice.call(scope.querySelectorAll(".panel")).forEach(function (p) {
        var r = p.getBoundingClientRect(), key = Math.round(r.top);
        (rows[key] || (rows[key] = [])).push(r.height);
      });
      Object.keys(rows).forEach(function (key) {
        var hs = rows[key];
        if (Math.max.apply(null, hs) - Math.min.apply(null, hs) > 65)
          fault(scope, "Economy row leaves more than 65px below a shorter panel");
      });
    }
    var plot = scope.querySelector(".bigchart"), bars = plot && plot.querySelectorAll(".bar");
    if (bars && bars.length >= 8) {
      var used = bars[bars.length - 1].getBoundingClientRect().right - bars[0].getBoundingClientRect().left;
      if (used < plot.clientWidth * 0.8) fault(plot, "Economy chart occupies less than 80% of its plot width");
    }
    var line = plot && plot.querySelector("polyline");
    if (line && line.getAttribute("points").trim().split(/\\s+/).length >= 8 &&
        line.getBoundingClientRect().width < plot.clientWidth * 0.8)
      fault(plot, "Economy session line occupies less than 80% of its plot width");
    return faults;
  }

  function measure(tab) {
    return measureIn(document.querySelector(".screen.on"), tab).concat(measureGridLayout(tab), measureEconomy(tab));
  }
`;

/* Runs inside the page. Boots the shell into a running game exactly as
   tools/harness.js does, then measures each tab in turn. */
const PROBE = `
(function () {
  ${argv.includes("--wrapped") ? 'var layoutSupports=CSS.supports.bind(CSS);CSS.supports=function(q){return q==="selector(::-webkit-scrollbar)"?false:layoutSupports.apply(CSS,arguments);};' : ''}
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
    window.__NO_TUTORIAL = true;      /* the card is measured on its own, below */
    Shell.boot(CONTENT);
    Shell.setOpt("govDepartments", {});
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
    if (tabs[t] === "econ") {
      /* The opening annual record cannot expose a squeezed session line. */
      var economyState = UI.state(), oldReserveHistory = economyState.solvencyHistory, oldSitting = economyState.sitting;
      var reserveBase = oldReserveHistory && oldReserveHistory.length ? oldReserveHistory[0] : economyState.scalars.solvency;
      economyState.solvencyHistory = Array.from({length:61}, function (_, i) { return reserveBase + (i - 30) * 100; });
      economyState.sitting = 61;
      document.querySelector('#econ-account [data-chart="solvency"]').click();
      document.querySelector('#chart-scale [data-cscale="session"]').click();
      drawn.push("econ: session");
      found = found.concat(measure("econ"));
      economyState.solvencyHistory = oldReserveHistory; economyState.sitting = oldSitting;
      document.querySelector('#chart-scale [data-cscale="record"]').click();
    }
    if (tabs[t] === "gov") {
      /* Reaching the last minister must scroll the roster, never lift the
         desk's toolbar or headings out of view. Also run with --wrapped:
         the custom scrollbar changes ancestry, not just its appearance. */
      var cabinetRows = document.querySelectorAll('#gov-roster [data-select-post]');
      if (innerWidth > 1080 && cabinetRows.length)
        cabinetRows[cabinetRows.length - 1].scrollIntoView({block:"nearest"});
      ['s-gov','gov-si','gov-side','gov-main','gov-file-pane'].forEach(function(id) {
        var frame = document.getElementById(id);
        if (frame.scrollTop > 1 || frame.scrollHeight > frame.clientHeight + 2)
          found.push({tab:"gov-scroll",el:"#" + id,kind:"LAYOUT",by:frame.scrollHeight-frame.clientHeight,
            detail:"The desk frame scrolls; only its roster, business and file bodies should scroll."});
        frame.scrollTop = 0;
      });
      document.getElementById('gov-roster').scrollTop = 0;
      /* Inspect real departmental work in the shared workspace. */
      document.querySelector('[data-select-post=""]').click();
      var work = document.querySelector('#gov-cabinet [data-post=""] [data-ini]');
      if (work) work.click();
      if (work && innerWidth > 640) {
        var readableFile = document.querySelector('#gov-file-body').getBoundingClientRect();
        var closeFile = document.querySelector('#gov-inspector [data-gov-close]').getBoundingClientRect();
        if (closeFile.right > readableFile.right + 2)
          found.push({tab:"gov-file-controls",el:"[data-gov-close]",kind:"LAYOUT",by:closeFile.right-readableFile.right,
            detail:"Close file is detached from the readable work file."});
      }
      var businessRect = document.querySelector('#gov-main').getBoundingClientRect();
      var fileRect = document.querySelector('#gov-file-pane').getBoundingClientRect();
      if (innerWidth > 640 && fileRect.left < businessRect.right - 1)
        found.push({tab:"gov-desk",el:"#gov-file-pane",kind:"LAYOUT",by:1,
          detail:"The work file is not beside the business list."});
      UI.state().undertakings.push({ id:"layout_undertaking", state:"open",
        text:"Layout fixture undertaking", by:UI.state().sitting + 2, discharge:{} });
      UI.redraw();
      found = found.concat(measure("gov-expanded"));
      var offices = Array.from(document.querySelectorAll('#gov-roster [data-select-post]')).map(function(b) { return b.dataset.selectPost; });
      offices.forEach(function(id) {
        var selector = document.querySelector('#gov-roster [data-select-post="' + id + '"]');
        selector.scrollIntoView({block:"nearest"}); selector.click();
        var heading = document.querySelector('#gov-workspace-title').getBoundingClientRect();
        if (heading.top < 0 || heading.bottom > innerHeight)
          found.push({tab:"gov-office:" + (id || "pm"),el:"#gov-workspace-title",kind:"LAYOUT",by:1,
            detail:"Selecting a minister leaves the workspace heading outside the viewport."});
        var scope = document.querySelector('#gov-cabinet [data-post="' + id + '"]');
        var inspect = scope.querySelector('[data-ini], [data-inspect]') || scope.querySelector('[data-gov-post-file]');
        if (inspect) {
          inspect.click();
          var file = document.querySelector('#gov-inspector');
          var fileHeading = document.querySelector('#gov-file-title').getBoundingClientRect();
          if (file.hidden || fileHeading.top < 0 || fileHeading.bottom > innerHeight)
            found.push({tab:"gov-office:" + (id || "pm"),el:"#gov-file-title",kind:"LAYOUT",by:1,
              detail:"Opening a power leaves its work file outside the visible viewport."});
        }
        found = found.concat(measure("gov-office:" + (id || "pm")));
      });
      UI.state().undertakings.pop();
      document.querySelector('[data-gov-all]').click();
      var overviewWork = document.querySelector('#gov-business [data-ini]');
      if (overviewWork) {
        overviewWork.click();
        var overviewHeading = document.querySelector('#gov-file-title').getBoundingClientRect();
        if (document.querySelector('#gov-inspector').hidden || overviewHeading.top < 0 || overviewHeading.bottom > innerHeight)
          found.push({tab:"gov-overview-file",el:"#gov-file-title",kind:"LAYOUT",by:1,
            detail:"The overview work file is not visible after its title is clicked."});
      }
      document.querySelector('[data-gov-all]').click();
      /* Work and people grow independently. Queue actual initiative
         answers, then vacate their owners; stretch authored labels and
         explanations without adding invented progress or engine rules. */
      var govSave = Engine.save(UI.state()), govContent = UI.content();
      var savedTitles = [], savedNames = [];
      (govContent.initiatives || []).slice(0, 3).forEach(function(i) {
        savedTitles.push([i, i.title, i.note]);
        i.title += " — a long departmental commission with several competing instructions";
        i.note = (i.note + " ").repeat(4);
        UI.state().flags["init_" + i.id] = true;
        if (i.event) UI.state().queue.push({ eventId:i.event, dueSitting:UI.state().sitting + 3 });
      });
      (govContent.cabinet || []).slice(0, 2).forEach(function(p) {
        savedNames.push([p, p.name]);
        p.name += " and the administration of long departmental responsibilities";
        UI.state().cabinet[p.id].holder = null;
      });
      var awaiting = (govContent.instruments || []).filter(function(i) { return i.procedure === "affirmative"; })[0];
      if (awaiting) Object.assign(UI.state().instruments[awaiting.id], { made:true, inForce:false, awaitingApproval:true });
      UI.redraw();
      document.querySelectorAll("[data-gov-record]").forEach(function(button) {
        button.click();
        found = found.concat(measure("gov-record:" + button.dataset.govRecord));
      });
      document.querySelector('[data-gov-return]').click();
      var running = document.querySelector('#gov-business [data-running]');
      if (running) running.click();
      UI.redraw();
      found = found.concat(measure("gov-business-stress"));
      savedTitles.forEach(function(x) { x[0].title=x[1]; x[0].note=x[2]; });
      savedNames.forEach(function(x) { x[0].name=x[1]; });
      UI.boot(Engine.load(govSave, govContent), govContent);
    }
  }

  /* AND THE SANDBOX (design/47), which only a bench draws: open one on the
     same campaign, measure its tab with the first event read out, then the
     Sitting screen with that event put up the way the tab puts it up. */
  try {
    Shell.sandbox(null);
    var sbx = document.querySelector('.tab[data-t="sbx"]');
    if (sbx && !sbx.hidden) {
      sbx.click();
      drawn.push("sbx" + (document.querySelector("#s-sbx.on") ? "" : " (NOT DRAWN)"));
      found = found.concat(measure("sbx"));
      var show = document.querySelector("#sbx-event [data-sbxshow]");
      if (show) { show.click(); found = found.concat(measure("sit")); }
      /* AND AN EVENT'S PAGE (design/49), which takes the screen: one with
         written sections, and one drawn from its body under a speaker's
         byline, each with its dateline */
      var C0 = UI.content(), pages = (C0.events || []).filter(function (e) { return Engine.isEvent(e); });
      var written = pages.filter(function (e) { return e.setpiece.sections; })[0];
      var spoken = pages.filter(function (e) { return e.setpiece === true && e.speaker; })[0];
      [written, spoken].forEach(function (e) {
        if (!e) return;
        UI.sandboxShow(e.id);
        drawn.push("sit: event " + e.id + (document.querySelector("#s-sit.setpiece .sp-page") ? "" : " (NOT DRAWN)"));
        found = found.concat(measure("sit"));
      });
    } else drawn.push("sbx (NOT DRAWN)");
  } catch (e) { drawn.push("sbx (NOT DRAWN: " + (e && e.message) + ")"); }

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

  /* THE TUTORIAL CARD (js/tutorial.js), in the real browser: it lies wholly inside the window, clears the part it lights,
     and shows all its text. jsdom has no layout, so this is the only place that can say so. */
  try {
    window.__NO_TUTORIAL = false;
    Shell.setOpt("tutorial", "on"); Shell.setOpt("taught", "");
    UI.state().seen.a1_treasury = 1; delete UI.state().flags.sandbox;   /* the probe plays on the bench, which never teaches */
    UI.openTab("gov"); Tutorial.refresh();
    var tc = document.querySelector("#tut.on .tut-card"), th = document.querySelector("#tut .tut-hole");
    drawn.push("tutorial card" + (tc ? "" : " (NOT DRAWN)"));
    if (tc && th) {
      var cr = tc.getBoundingClientRect(), hr = th.getBoundingClientRect(), W = innerWidth, H = innerHeight;
      if (cr.left < 0 || cr.top < 0 || cr.right > W + 1 || cr.bottom > H + 1)
        found.push({ tab: "tutorial", el: "#tut .tut-card", kind: "LAYOUT", by: 1, detail: "The card is not wholly inside the window." });
      if (cr.left < hr.right - 1 && cr.right > hr.left + 1 && cr.top < hr.bottom - 1 && cr.bottom > hr.top + 1)
        found.push({ tab: "tutorial", el: "#tut .tut-card", kind: "LAYOUT", by: 1, detail: "The card covers the part it lights." });
      if (tc.scrollHeight > tc.clientHeight + 2)
        found.push({ tab: "tutorial", el: "#tut .tut-card", kind: "CLIPPED", by: tc.scrollHeight - tc.clientHeight, detail: "The card clips its own text." });
      var ok = tc.querySelector("[data-tut=ok]").getBoundingClientRect();
      if (ok.width < 20 || ok.bottom > H) found.push({ tab: "tutorial", el: "[data-tut=ok]", kind: "LAYOUT", by: 1, detail: "Got it is out of reach." });
    }
    /* A long explanation at doubled reading size must retain its controls and readable scroll range. */
    if (tc) {
      var text = tc.querySelector(".tut-body"), savedText = text.textContent;
      text.textContent = Array(9).join(savedText + " "); text.style.fontSize = "26px";
      Tutorial.refresh();
      var enlarged = tc.getBoundingClientRect(), footer = tc.querySelector(".tut-btns").getBoundingClientRect();
      if (enlarged.left < 0 || enlarged.top < 0 || enlarged.right > innerWidth + 1 || enlarged.bottom > innerHeight + 1)
        found.push({ tab: "tutorial enlarged", el: ".tut-card", kind: "LAYOUT", by: 1, detail: "Enlarged tutorial escapes the viewport." });
      var lit = document.querySelector(".tut-hole").getBoundingClientRect();
      if (enlarged.left < lit.right && enlarged.right > lit.left && enlarged.top < lit.bottom && enlarged.bottom > lit.top)
        found.push({ tab: "tutorial enlarged", el: ".tut-card", kind: "LAYOUT", by: 1, detail: "Enlarged tutorial covers the highlighted region." });
      if (footer.bottom > innerHeight + 1 || footer.top < 0)
        found.push({ tab: "tutorial enlarged", el: ".tut-btns", kind: "LAYOUT", by: 1, detail: "Enlarged tutorial dismissal buttons are out of reach." });
      if (text.scrollHeight > text.clientHeight + 2) {
        text.scrollTop = text.scrollHeight;
        if (!/auto|scroll/.test(getComputedStyle(text).overflowY) || text.scrollTop < 1)
          found.push({ tab: "tutorial enlarged", el: ".tut-body", kind: "LAYOUT", by: 1, detail: "Enlarged tutorial text cannot be scrolled." });
      }
      /* A region below the visible window must not pull the card below it. */
      var litElement = Tutorial.shown().el, savedTransform = litElement.style.transform;
      litElement.style.transform = "translateY(" + innerHeight + "px)"; Tutorial.refresh();
      var offscreenCard = tc.getBoundingClientRect();
      if (offscreenCard.bottom > innerHeight + 1 || offscreenCard.top < 0)
        found.push({ tab: "tutorial enlarged", el: ".tut-card", kind: "LAYOUT", by: 1, detail: "Off-screen target pulls the tutorial outside the window." });
      litElement.style.transform = savedTransform; Tutorial.refresh();
      drawn.push("tutorial enlarged");
      text.textContent = savedText; text.style.fontSize = ""; Tutorial.refresh();
    }
    Tutorial.dismiss(); window.__NO_TUTORIAL = true;
  } catch (e) { found.push({ tab: "tutorial", el: "#tut", kind: "LAYOUT", by: 1, detail: "tutorial probe: " + (e && e.message) }); }

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

function probeHTML(page) {
  return fs.readFileSync(path.join(root, page), "utf8")
    .replace(/<script>[\s\S]*?<\/script>\s*<\/body>/,
      '<pre id="laycheck-out"></pre><script>' +
      (page === "editor.html" ? EDITOR_PROBE : PROBE) + "</script></body>");
}

/* The same probe can run in an attached browser when the installed
   browser does not support --dump-dom. Serve these pages locally, inspect
   #laycheck-out at each viewport, then remove the two generated files. */
if (argv.includes("--prepare")) {
  for (const page of ["index.html", "editor.html"]) {
    const target = path.join(root, "_laycheck-" + page);
    fs.writeFileSync(target, probeHTML(page));
    console.log(target);
  }
  process.exit(0);
}

function run(width, height, page) {
  /* The temp page lives in the repo root so index.html's relative
     <script src> paths resolve exactly as they do for a player. */
  const tmp = path.join(root, "_laycheck." + process.pid + ".html");
  fs.writeFileSync(tmp, probeHTML(page || "index.html"));
  let dom = "";
  try {
    dom = cp.execSync(
      `"${CHROME}" --headless --disable-gpu --no-sandbox --hide-scrollbars ` +
      `--allow-file-access-from-files --virtual-time-budget=20000 ` +
      `--window-size=${width},${height} --dump-dom "${tmp}"`,
      /* Chromium's chatter is discarded through stdio, not through a
         `2>/dev/null` in the command: that redirection is a shell token, and
         on Windows cmd reads /dev/null as a path and fails the whole run. */
      { maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).toString();
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
    if (h.kind === "LAYOUT") {
      console.log(`    GRID [${h.tab}] ${h.el}\n         ${h.detail}`);
      continue;
    }
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
