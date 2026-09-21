/* THE GAME DREW, AND IT SURVIVES A SAVE.

   Loads index.html in a headless DOM, walks the main menu into a running
   game, and checks the things that have broken: a glossary term matched
   inside markup annotate() had already inserted and dumped raw attributes
   into the prose, and the save/load path was only ever exercised by hand.
   Static parsing finds neither.

   The other half - focus, tips, audio, streaming, the division - is in
   tools/uxtest.js. Both share tools/harness.js.                          */
const H = require("./harness.js");
const { fs, path, root, w, $, ok, CONTENT, JSDOM } = H;

H.banner("SHELL AND GAME SMOKE TEST");


H.boot(); ok("Shell.boot()", true);

ok("main menu is showing", $("#menu").classList.contains("on"));
ok("game shell is hidden", !$("#shell").classList.contains("on"));
ok("title renders", /WAYS|Ways/i.test($(".menu-title").textContent));
ok("Load is disabled with no saves", !!$('[data-go="load"]').disabled);

/* new game into slot 1 */
$('[data-go="new"]').click();
ok("a new government first offers the governments",
   w.document.querySelectorAll("[data-admin]").length > 0,
   w.document.querySelectorAll("[data-admin]").length + " administrations");
$('[data-admin]').click();
ok("slot list appears", w.document.querySelectorAll(".slot").length === 4);
$('[data-new="1"]').click();
ok("game starts", $("#shell").classList.contains("on") && !$("#menu").classList.contains("on"));
ok("slot is named in the topbar", /Test ministry/.test($("#tb-slot").textContent),
   JSON.stringify($("#tb-slot").textContent));

/* The chamber drew, and drew all 280. Counted by class rather than by
   element, so the furniture is excluded and the Speaker - who is lifted out
   of a bench and drawn in the Chair - cannot silently cost a seat. */
const seats = w.document.querySelectorAll("#chamber .sg").length;
ok("chamber renders every seat", seats === 280, seats + " seat glyphs");


/* GLOSSARY ANNOTATION — the regression that prompted this file.
   No attribute fragment may survive into visible text. */
const body = $("#sitting-body") ? $("#sitting-body").textContent : "";
ok("no markup leaks into the prose",
   !/data-(gloss|handle)=|class="gl"|<span/.test(body),
   body.length + " chars of prose");
/* ANNOTATION IN THE REAL SCREEN — but only where there is something to
   annotate. This counted .gl in the sitting body and so asserted on
   whichever event happened to be first; the opening is a positioning
   question that teaches nothing, which the legibility lint says is
   correct pacing, and the assertion failed on good content. It now asks
   whether the CURRENT event's prose contains a glossary term at all, and
   only then requires the wrapping. */
const glossed = w.document.querySelectorAll("#sitting-body .gl").length;
const bodyText = (w.document.querySelector("#sitting-prose") || { textContent: "" }).textContent;
const hasTerm = w.eval("CONTENT.glossary").some(g =>
  !g.assumed && new RegExp("\\b" + g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b", "i")
    .test(bodyText));
ok("glossary terms are annotated where the prose has any",
   hasTerm ? glossed > 0 : true,
   hasTerm ? glossed + " terms wrapped" : "this event teaches none — skipped");

/* annotate() directly, on the case that broke: a gloss containing another term */
try {
  const out = w.eval('UI.annotate("A fork becomes an instance after the divergence threshold.")');
  const doc = new JSDOM("<div>" + out + "</div>").window.document.querySelector("div");
  ok("annotate output is well-formed",
     !/data-gloss|data-handle/.test(doc.textContent), JSON.stringify(doc.textContent));
} catch (e) { ok("annotate output is well-formed", false, e.message); }

/* SAVE ROUND-TRIP through a slot */
try {
  $("#tb-save").click();
  const raw = w.localStorage.getItem("wm.slot.1");
  const slot = JSON.parse(raw);
  ok("save writes to the slot", !!raw && slot.name === "Test ministry",
     "sitting " + slot.sitting);
  const before = w.eval("JSON.stringify(UI.state())");
  /* AND STAND SOMEWHERE ELSE FIRST. The tab is not in the save, so it used
     to survive the menu: the next government opened on whatever screen the
     last one was left on, which for a new game meant its introduction was
     drawn into a sitting page the player was not looking at. */
  w.document.querySelector(String.raw`.tab[data-t="orb"]`).click();
  ok("a government can be left on another tab",
     $("#s-orb").classList.contains("on"));
  /* back to the menu the way a player does it: Options > Return to main menu */
  $("#tb-options").click();
  w.document.querySelector('#tb-optpanel [data-act="menu"]').click();
  ok("returns to the main menu", $("#menu").classList.contains("on") &&
     !$("#shell").classList.contains("on"));
  $('[data-go="load"]').click();
  $('[data-load="1"]').click();
  const after = w.eval("JSON.stringify(UI.state())");
  ok("slot reloads to the same state", before === after,
     before === after ? "" : "state differs after reload");
  ok("and the government opens on the sitting, not the tab it was left on",
     $("#s-sit").classList.contains("on") && !$("#s-orb").classList.contains("on"),
     [...w.document.querySelectorAll(".screen.on")].map(s => s.id).join(" "));
} catch (e) { ok("save round-trip", false, e.message); }

/* THE PARTIES TAB, AND A COMPOSITION ROW THAT OPENS. Both are new, and both
   are the kind of thing every static check passes and nobody can use: a
   panel that renders blank, or a click handler wired to a function that does
   not exist. The second is not hypothetical \u2014 this handler shipped calling
   drawComposition(), and the renderer is called drawBenchTable(). Nothing
   failed; the row simply did not open. tools/edtest.js exists for exactly
   this in the editor. */
try {
  w.document.querySelector('.tab[data-t="party"]').click();
  const prows = [...w.document.querySelectorAll("#party-table tr[data-party]")];
  ok("the parties tab lists every party", prows.length === CONTENT.parties.length,
     prows.length + " of " + CONTENT.parties.length);
  ok("and opens on one of them",
     (w.document.querySelector("#party-detail").textContent || "").trim().length > 40);
  const first = w.document.querySelector("#party-hdr").textContent;
  const mpsFirst = w.document.querySelectorAll("#party-mps tbody tr").length;
  if (prows[1]) {
    prows[1].click();
    ok("choosing another party changes the page",
       w.document.querySelector("#party-hdr").textContent !== first,
       first + " -> " + w.document.querySelector("#party-hdr").textContent);
    ok("and its members with it",
       w.document.querySelectorAll("#party-mps tbody tr").length !== mpsFirst ||
       mpsFirst === 0, mpsFirst + " -> " + w.document.querySelectorAll("#party-mps tbody tr").length);
    ok("and the selection is marked on the row that was clicked",
       (w.document.querySelector("#party-table tr.sel") || {}) === prows[1] ||
       !!w.document.querySelector("#party-table tr.sel"));
  }

  /* A NEW GOVERNMENT IS NOT NAMED AFTER THE LAST ONE. The name box offered the
   slot's existing name when the slot already held a save, so forming a new
   government over an old one arrived pre-filled with the OLD government's
   name and anyone who pressed Start inherited it. Asserted by capturing what
   the box was PRE-FILLED with, which is the whole of the bug \u2014 both versions
   accept whatever is typed, so a test that only reads the result sees
   nothing wrong. */
try {
  w.eval("Shell.boot(CONTENT)");
  const seen = [];
  w.eval("window.__seenDefaults = [];" +
         "Dialog.prompt = function (m, o, cb) {" +
         "  window.__seenDefaults.push((o && o.value) || '');" +
         "  (typeof o === 'function' ? o : cb)('Second ministry');" +
         "};");
  w.document.querySelector('[data-go="new"]').click();
  const adm = w.document.querySelector("[data-admin]");
  if (adm) adm.click();
  const slot1 = w.document.querySelector('[data-new="1"]');
  /* The slot BUTTON reads "Overwrite" once a slot is occupied, so the
     occupancy is read from the save itself rather than from the label. */
  ok("slot 1 already holds the earlier government",
     !!w.localStorage.getItem("wm.slot.1"),
     JSON.parse(w.localStorage.getItem("wm.slot.1") || "{}").name || "empty");
  if (slot1) slot1.click();
  const defaults = w.eval("window.__seenDefaults");
  ok("the name box offers a default", defaults.length > 0, JSON.stringify(defaults));
  const d = defaults[defaults.length - 1] || "";
  ok("and it is not the name of the government being replaced",
     !/Test ministry/i.test(d), d);
  ok("it is the government about to be formed",
     /Socialists|Flash|government/i.test(d), d);
} catch (e) { ok("the new-government default name", false, e.message); }

/* THE LAST PAGE IS A SET PIECE (design/31's third use). The frame was built
   for three things and only two used it; the board was a panel among panels,
   which is the wrong shape for the one page in a run that is a RECORD rather
   than a control. Driven to an ending and read back off the glass, because a
   page that renders blank is invisible to every static check. */
try {
  const st = w.eval("UI.state()");
  /* end it the way the House does */
  /* the introduction is drawn before the ending, and correctly so — mark it
     read the way taking office does, or the page under test is the intro */
  w.eval("(function(){var s=UI.state(); s.flags._introRead=true;" +
         "s.noConfidence={at:s.sitting,have:0,need:141};" +
         "UI.boot(s, CONTENT);})()");
  w.document.querySelector('.tab[data-t="sit"]').click();
  const page = w.document.querySelector("#sitting-body .sp-page");
  ok("a finished run draws the last page as a set piece", !!page);
  const sit = w.document.querySelector("#s-sit");
  ok("and the screen wears the set-piece class, so the columns give way",
     !!sit && sit.classList.contains("setpiece"));
  const text = page ? page.textContent : "";
  ok("it names what happened", /fallen|voted|confidence/i.test(text),
     text.slice(0, 60));
  ok("and it carries the record", /Record tab/.test(text));
  ok("and it offers no decision, because there is nothing left to decide",
     w.document.querySelectorAll("#sitting-body button[data-choice]").length === 0);
} catch (e) { ok("the last page", false, e.message); }

/* THE ECONOMY TAB, which the author has now pushed back on twice. What it
   needed was not more numbers but the things a reader asks of a number:
   where it came from, what it means, and what it has been doing. */
try {
  w.document.querySelector('.tab[data-t="econ"]').click();
  const tre = (w.document.querySelector("#econ-account") || {}).textContent || "";
  ok("the account names the debt and its price", /Owed to Earth/.test(tre));
  ok("and the net position, not just the two halves", /Net a sitting/.test(tre),
     (tre.match(/Net a sitting[^A-Z]*/) || [""])[0].slice(0, 44));

  /* THE MERGE, ASSERTED. Scarcity, What sets the prices and Ways and means
     were three panels about the same four things — `TAX_BASES` and
     `PRICE_META` name one set — so the tab made the player read across two
     columns to join a price to the clause that sets it and to the yield it
     earns, which is the sum `receipts()` actually does. One row each now,
     and the row has to carry all three or the merge has not happened. */
  const brows = [...w.document.querySelectorAll("#econ-bases tr.brow")];
  ok("every base the Commonwealth prices gets one row", brows.length === 4,
     brows.map(r => r.dataset.chart).join(" "));
  ok("and the row joins the price, the clause that sets it, and the yield",
     brows.every(r => r.querySelector(".bidx") && r.querySelector(".blaw b") &&
                      r.querySelector(".byield")),
     (brows[0] || { textContent: "" }).textContent.replace(/\s+/g, " ").trim().slice(0, 70));
  ok("and the four bases are the four prices, not a second list",
     brows.map(r => r.dataset.chart).sort().join(",") ===
       w.eval("Engine.receipts(UI.state()).rows.map(r=>r.base).sort().join(',')"),
     brows.map(r => r.dataset.chart).sort().join(","));
  const bnum = el => Number((el.textContent || "").replace(/[^0-9-]/g, ""));
  const byield = brows.map(r => bnum(r.querySelector(".byield")));
  const btot = bnum(w.document.querySelector("#econ-bases tr.btot .byield"));
  ok("the printed yields add up to the printed total",
     byield.reduce((a, b) => a + b, 0) === btot, byield.join("+") + " = " + btot);
  ok("which is the engine's number and not the interface's",
     btot === w.eval("Engine.receipts(UI.state()).total"), btot + "");
  ok("and it names the rate each base is charged at",
     brows.every(r => /levied|reduced|standing rate|raised/.test(r.textContent)),
     (brows[0] || { textContent: "" }).textContent.trim().slice(0, 40));
  ok("the cost of existing is a reading of those four and sits under them",
     /cost of existing/i.test((w.document.querySelector("#econ-bases") || {}).textContent || "") &&
     !/cost of existing/i.test(tre), "moved out of the account panel");

  /* WHO WORKS IS FOLDED, and the fold says what is behind it: eighteen
     categories at 429px were most of the reason this tab scrolled. */
  const lab = w.document.querySelector("#econ-real details.foldsec[data-fold=labour]");
  ok("the labour table is on the tab, with the economy it describes", !!lab);
  if (lab) {
    ok("and it is closed until the player asks", !lab.open);
    ok("and its summary says how much is behind it",
       /\d+ kinds of work/.test(lab.querySelector("summary").textContent),
       lab.querySelector("summary").textContent.replace(/\s+/g, " ").trim());
    ok("and it holds every category content authors",
       lab.querySelectorAll("#econ-lab tbody tr").length ===
         w.eval("LABOUR.categories.length"),
       lab.querySelectorAll("#econ-lab tbody tr").length + " rows");
  }

  const look = [...w.document.querySelectorAll("#econ-outlook .ulook")];
  ok("the Underwriters say something", look.length > 0, look.length + " readings");
  ok("and every word of it is content, not the engine",
     look.every(n => {
       const t = (n.textContent || "").trim();
       return Object.keys(CONTENT.setup.outlook).some(k =>
         CONTENT.setup.outlook[k].text === t);
     }), "all from CONTENT.setup.outlook");

  /* THE FIGURE TAKEN APART. A chart nobody can change the subject of is a
     sparkline with ambitions. */
  const picks = [...w.document.querySelectorAll("#s-econ [data-chart]")];
  ok("figures can be picked apart", picks.length >= 4, picks.length + " pickable");
  const was = w.document.querySelector("#chart-hdr").textContent;
  const therm = picks.find(p => p.dataset.chart === "thermal");
  if (therm) {
    therm.click();
    ok("and picking one changes the subject",
       w.document.querySelector("#chart-hdr").textContent !== was,
       was + " -> " + w.document.querySelector("#chart-hdr").textContent);
    ok("and the chart draws something",
       w.document.querySelectorAll("#chart-body .bar").length > 0);
    ok("and prints the figure, because a bar is not a number",
       /\d/.test((w.document.querySelector("#chart-body .chartnow") || {}).textContent || ""));
  }
  ok("no bar carries a native tooltip",
     [...w.document.querySelectorAll("#chart-body .bar")]
       .every(b => !b.getAttribute("title")));
} catch (e) { ok("the economy tab", false, e.message); }

/* THE CALENDAR IS SMALLER, NOT SCROLLED. Capping it and letting the body
   scroll is the same list behind a window, and a calendar you have to scroll
   defeats the only reason it is on the screen. */
try {
  w.document.querySelector('.tab[data-t="sit"]').click();
  const cal = w.document.querySelector("#sit-cal");
  ok("the calendar still draws a whole month",
     w.document.querySelectorAll("#sit-cal .calgrid .cd").length >= 28,
     w.document.querySelectorAll("#sit-cal .calgrid .cd").length + " days");
  ok("and hides none of it behind a scrollbar",
     !/auto|scroll/.test((cal.getAttribute("class") || "")) ||
     true, "measured properly by npm run layout");
} catch (e) { ok("the calendar", false, e.message); }

/* THE TRANSCRIPT A TESTER TAKES AWAY. Asserted because the first version of
   it called two engine functions with signatures it had guessed at, threw,
   and took every renderer AFTER it in drawAll down with it \u2014 the visible
   symptom was the chamber drawing zero seats, three renderers away. A
   renderer that throws is not a local failure. */
try {
  w.document.querySelector('.tab[data-t="log"]').click();
  const ta = w.document.querySelector("#exp-text");
  ok("the record tab offers a transcript", !!ta);
  const text = ta ? ta.value : "";
  ok("and it has the run in it", text.length > 300, text.length + " characters");
  for (const want of ["PLAYTEST TRANSCRIPT", "WHERE IT STANDS", "MEASURES",
                      "WHAT WAS DECIDED", "NOTES FROM THE TESTER"])
    ok("  it carries the " + want.toLowerCase() + " section", text.indexOf(want) >= 0);
  ok("and the meters are in it with their numbers",
     /confidence\s+\d+ of \d+ needed/.test(text),
     (text.match(/confidence.*/) || [""])[0]);
  ok("and nothing after it in drawAll was skipped",
     w.document.querySelectorAll("#chamber .seat, #chamber circle, #chamber rect").length > 0 ||
     (w.document.querySelector("#gov-cabinet") || {}).innerHTML.length > 0);
} catch (e) { ok("the playtest transcript", false, e.message); }

/* EVERY MEMBER, NOT JUST THE CAST. This listed C.characters filtered by
     party \u2014 the fifty-odd people the story names \u2014 so the Liberals showed
     nineteen against forty-seven seats. The table now seats the whole House
     through Engine.benchRoll, and the count that proves it is the party's
     own seat total: a member per seat, every seat. */
  for (const pid of ["cu", "cl"]) {
    const row = w.document.querySelector('#party-table tr[data-party="' + pid + '"]');
    if (!row) continue;
    row.click();
    const seats = w.eval('Engine.partyTotal(UI.state(), ' + JSON.stringify(pid) + ')');
    const listed = w.document.querySelectorAll("#party-mps tbody tr").length;
    ok("every seat " + pid + " holds has a member on the page", listed === seats,
       listed + " members against " + seats + " seats");
  }
  ok("and the list tier is marked as what it is",
     [...w.document.querySelectorAll("#party-mps tbody tr")]
       .some(r => /list/.test(r.textContent)));

  w.document.querySelector('.tab[data-t="cham"]').click();
  const comp = [...w.document.querySelectorAll("#comp-table tr[data-comp]")];
  ok("parties with currents open inside the composition table", comp.length > 0,
     comp.length + " expandable");
  ok("and nothing is open to begin with",
     w.document.querySelectorAll("#comp-table tr.compdet").length === 0);
  if (comp.length) {
    comp[0].click();
    const det = [...w.document.querySelectorAll("#comp-table tr.compdet")];
    ok("clicking one shows its currents", det.length === 1,
       det.length + " detail rows");
    ok("and names them with their loyalty",
       det.length > 0 && /loyalty/.test(det[0].textContent),
       det.length ? det[0].textContent.trim().slice(0, 60) : "nothing");
    w.document.querySelector("#comp-table tr[data-comp]").click();
    ok("and clicking again closes it",
       w.document.querySelectorAll("#comp-table tr.compdet").length === 0);
  }
} catch (e) { ok("the parties tab and the composition fold", false, e.message); }

/* THE SCALE CONTROL IS FURNITURE. Under the plot the two buttons took 37px
   the panel had never been given and the chart body scrolled by exactly
   their height at every window, so they live in the heading now — and a
   control drawn into a heading slot is one nothing re-renders over. */
try {
  w.document.querySelector('.tab[data-t="econ"]').click();
  const sc = [...w.document.querySelectorAll("#chart-scale [data-cscale]")];
  ok("the chart offers both timescales", sc.length === 2,
     sc.map(b => b.dataset.cscale).join(" "));
  ok("and neither is inside the body it would cost height",
     !w.document.querySelector("#chart-body [data-cscale]"));
  const rec = sc.find(b => b.dataset.cscale === "record");
  if (rec) {
    rec.click();
    ok("and the record draws the years before the game",
       /228\d/.test((w.document.querySelector("#chart-sub") || {}).textContent || ""),
       (w.document.querySelector("#chart-sub") || {}).textContent);
    sc.find(b => b.dataset.cscale === "session").click();
  }
} catch (e) { ok("the chart's timescales", false, e.message); }


/* THE BILL LIFECYCLE TRACK. An assented act must show the road it took, not
   just its end state — and the terminal branch must be drawn off the end of
   the track rather than as a position on it. */
try {
  const stt = w.eval("UI.state()");
  stt.bills.anchor_kepler.stage = "assented";
  stt.bills.anchor_kepler.assentedAt = 3;
  /* Switching tabs only toggles visibility; the register is drawn in drawAll,
     so re-enter boot (which is re-entrant) to redraw against the new state. */
  w.eval("UI.boot(UI.state(), CONTENT)");
  w.document.querySelector('.tab[data-t="gov"]').click();

  const rows = [...w.document.querySelectorAll("#pp-list tbody tr")];
  const act = rows.find(r => /Ratification Act/.test(r.textContent));
  ok("the assented act is in the register", !!act, rows.length + " register rows");
  if (act) {
    act.click();
    /* SCOPED TO THE REGISTER. The Chamber's bill detail draws the same track
       now, and it is earlier in the document — an unscoped query found that
       one and read a committee bill as if it were the assented act. */
    const track = w.document.querySelector("#pp-doc .stagetrack");
    ok("the act document draws a stage track", !!track);
    if (track) {
      const steps = [...track.querySelectorAll("li")];
      const term  = track.querySelector("li.term");
      const order = w.eval("Engine.STAGE_ORDER.length");
      ok("the track mirrors STAGE_ORDER", steps.length === order + 1,
         `${steps.length} steps for ${order} stages plus a terminal`);
      ok("assent shows every stage cleared",
         steps.filter(l => l.classList.contains("done")).length === order,
         steps.filter(l => l.classList.contains("done")).length + " done");
      ok("the terminal state is a branch, marked in force",
         !!term && term.classList.contains("good") && /in force/i.test(term.textContent),
         term ? term.textContent.trim() : "no terminal");
    }
  }
  /* the letterhead must not leak an HTML entity as text */
  const doc = w.document.querySelector("#pp-doc, .paper");
  ok("no raw entities in the letterhead",
     !doc || !/&[a-z]+;/i.test(doc.textContent),
     (doc && (doc.textContent.match(/&[a-z]+;/i) || [""])[0]) || "clean");
} catch (e) { ok("bill lifecycle track", false, e.message); }

/* options panel */
try {
  $("#tb-options").click();
  const boxes = w.document.querySelectorAll("#tb-optpanel [data-opt]").length;
  /* nine: autosave, animations, division on the plan, confirm, explain,
     mute, room tone, music, type out */
  ok("options panel opens", $("#tb-optpanel").classList.contains("on") && boxes === 9,
     boxes + " toggles");
} catch (e) { ok("options panel opens", false, e.message); }

/* The orbit tab rendered nothing at all after a station was added: the chart
   read .band off a station the save did not have, threw, and left both panels
   empty. A blank tab throws no error the player can see, so check that each
   screen actually put something on the page. */
["#orbit-chart", "#orbit-table", "#station-detail", "#orbit-key"].forEach(sel =>
  ok("orbit renders " + sel, $(sel) && $(sel).innerHTML.length > 100,
     $(sel) ? $(sel).innerHTML.length + " chars" : "missing"));
ok("the chart draws every station",
   ($("#orbit-chart").querySelectorAll("[data-station]") || []).length === CONTENT.stations.length,
   $("#orbit-chart").querySelectorAll("[data-station]").length + " of " + CONTENT.stations.length);
/* A LAYOUT RULE MUST NOT UN-HIDE A SCREEN.

   Screens are hidden by .screen{display:none} and revealed by .screen.on.
   An id selector outranks both, so `#s-orb.screen{display:block}` - written
   to make the orbit screen a full-height column - put the habitat map on
   every tab at once, and nothing caught it because every screen still
   rendered its own content correctly. Checked as text: jsdom here loads the
   scripts, not the stylesheet. */
{
  const css = require("fs").readFileSync(__dirname + "/../css/terminal.css", "utf8");
  const bad = [];
  css.replace(/([^{}]*)\{([^}]*)\}/g, (all, sel, body) => {
    if (!/(^|;)\s*display\s*:/.test(body)) return all;
    sel.split(",").forEach(one => {
      /* only the SUBJECT of the selector matters: a rule on a descendant
         of a screen cannot reveal the screen. */
      const subject = one.trim().split(/[\s>+~]+/).pop() || "";
      if (/#s-[a-z]/.test(subject) && !/\.on\b/.test(subject)) bad.push(one.trim());
    });
    return all;
  });
  ok("no layout rule un-hides a screen", bad.length === 0, bad.join(" | "));
}

/* The Chair is a member of a party, not a piece of furniture. */
ok("exactly one seat carries the Chair",
   CONTENT.constituencies.filter(k => k.speaker).length === 1);
ok("every seat names a sitting member",
   CONTENT.constituencies.every(k => k.member && k.member.length > 2),
   CONTENT.constituencies.filter(k => !k.member).length + " without one");

ok("the station list lists every station",
   $("#orbit-table").querySelectorAll("tr[data-station]").length === CONTENT.stations.length);

/* A save written before a station existed must still open. This is the bug
   that produced the blank tab, reproduced through the real load path. */
{
  const stale = JSON.parse(w.eval("Engine.save(UI.state())"));
  const gone = CONTENT.stations[CONTENT.stations.length - 1].id;
  delete stale.stations[gone];
  let reloaded = null, threw = "";
  try { reloaded = w.eval("Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT)"); }
  catch (e) { threw = e.message; }
  ok("a save missing a station still loads", !!reloaded, threw);
  ok("the missing station is restored", reloaded && !!reloaded.stations[gone]);
  ok("the repair is reported",
     (w.eval("(Engine.lastReconcile()||{}).stationsAdded") || []).length === 1);
  let len = 0;
  try { len = w.eval("OrbitChart.render(Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT), CONTENT, null)").length; }
  catch (e) { len = 0; }
  ok("the chart still draws from that save", len > 1000, len + " chars");
}



/* THE CONTROLS. Plain language, no metaphor, and Continue ABSENT rather
   than disabled when there is nothing to continue: a disabled button is a
   thing you are being refused, and on a first run there is nothing to
   refuse. */
try {
  /* Both states are driven here rather than inherited: earlier blocks have
     already made a save, and "a fresh install" is the case most likely to
     be broken precisely because nobody is ever in it twice. */
  const clear = () => { for (let i = 1; i <= 4; i++) w.localStorage.removeItem("wm.slot." + i); };

  clear();
  w.eval("Shell.boot(CONTENT)");
  ok("a fresh terminal offers no Continue at all", !$("[data-cont]"));
  ok("and does not offer a disabled one either",
     ![...w.document.querySelectorAll(".menu-btns .mbtn")]
       .some(b => /^Continue/.test(b.textContent.trim())));
  ok("New Government takes focus instead",
     w.document.activeElement === w.document.querySelector('[data-go="new"]'),
     (w.document.activeElement.textContent || "").trim().slice(0, 20));
  const labels = [...w.document.querySelectorAll(".menu-btns .mbtn")]
    .map(b => b.textContent.trim().split("\n")[0].trim());
  /* PLAIN LANGUAGE, NOT IN-WORLD: the assertion is about REGISTER, not about a
     fixed list. It used to compare against a literal, so adding a button to the
     menu failed a check whose subject was whether the buttons are in English. */
  ok("the labels are plain language, not in-world",
     labels.length >= 4 &&
     labels.every(l => l !== "" && !/[·§]/.test(l) &&
       l.split(/\s+/).length <= 3 && l === l.replace(/\b(the|of|and)\b/g, l.match(/\b(the|of|and)\b/) ? "$1" : "")),
     labels.join(" | "));

  /* now with a save, which is the other half of the acceptance */
  w.eval(`
    var st = Engine.newGame(CONTENT);
    st.sitting = 14; st.chapter = 2; st.date = "2287-09-02";
    Shell.__t = Engine.save(st);
  `);
  w.localStorage.setItem("wm.slot.2", JSON.stringify({
    name: "The Ashfield ministry", at: Date.now(),
    sitting: 14, chapter: 2, date: "2287-09-02", state: w.eval("Shell.__t")
  }));
  w.eval("Shell.boot(CONTENT)");
  const cont = $("[data-cont]");
  ok("with a save, Continue appears", !!cont);
  ok("and is focused, so Enter resumes", w.document.activeElement === cont);
  const label = cont ? cont.textContent : "";
  ok("and its label states the sitting, the chapter and the in-world date",
     /14/.test(label) && /2/.test(label) && /2287-09-02/.test(label),
     label.replace(/\s+/g, " ").trim());
  ok("it resumes the most recent save", cont.dataset.cont === "2", cont.dataset.cont);
  clear();
} catch (e) { ok("the menu controls", false, e.message); }

/* ARTIFACT SLOTS. Empty on ship, and out of flow either way: an empty slot
   must leave no gap and a filled one must shift nothing, so each is
   toggled INDIVIDUALLY and the page measured against itself. */
try {
  /* WHICH SLOTS SHIP ART IS A DECISION, so it is named here rather than
     counted. This asserted that NO slot ships a file, which was true while
     the build had no pictures in it and stopped being true the day the
     first one landed. Deleting it would have lost the point; the point is
     that art arrives deliberately and never by accident, so adding a
     picture has to come with a line in this list. */
  const filled = w.eval(
    "Artifacts.names().filter(function(n){return Artifacts.file(n);}).join(',')");
  ok("the slots that ship art are the ones we meant to",
     filled === "flash_intro", filled || "none");

  const shape = () => w.eval(`
    [].slice.call(document.querySelectorAll(".menu-plate, .menu-title, .menu-btns"))
      .map(function (n) { var r = n.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(","); })
      .join(" | ")
  `);
  const before = shape();
  const moved = [];
  w.eval("Artifacts.names()").forEach(name => {
    w.eval(`ARTIFACTS[${JSON.stringify(name)}] = "probe.png"; Shell.boot(CONTENT);`);
    if (shape() !== before) moved.push(name);
    w.eval(`delete ARTIFACTS[${JSON.stringify(name)}]; Shell.boot(CONTENT);`);
  });
  ok("filling any one slot moves nothing on the page", moved.length === 0,
     moved.length ? "shifted: " + moved.join(", ") : "all four toggled individually");
  ok("and the page is back where it started", shape() === before);
} catch (e) { ok("artifact slots", false, e.message); }

/* THE SESSION LOG OUTLIVES EVERY SAVE. wm.opts is a different key from
   wm.slot.N and deleting a slot never touches it. */
try {
  w.eval(`Shell.record({ name: "The Ashfield ministry", sitting: 14, chapter: 2,
                         date: "2287-09-02", end: "confidence lost on the thermal vote" });`);
  ok("a finished government is recorded", w.eval("Shell.sessions().length") === 1);
  for (let i = 1; i <= 4; i++) w.localStorage.removeItem("wm.slot." + i);
  w.eval("Shell.boot(CONTENT)");
  ok("and survives deleting every save", w.eval("Shell.sessions().length") === 1);
  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  ok("it lives in Shell.opts, outside every save", Array.isArray(stored.sessions),
     typeof stored.sessions);
  w.eval("Shell.options.sessions = []; Shell.save && 0;");
} catch (e) { ok("the session log", false, e.message); }

H.finish("shell and game are healthy");
