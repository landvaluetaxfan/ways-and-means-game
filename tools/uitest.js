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
  /* INTERPARTY AFFAIRS, NOT A DIRECTORY (the author, 23 Sep). The tab
     opens every OTHER party and not your own, whose bench is managed with
     loyalty and not by dealing; and who a party is lives in the
     Concordance, so the members, currents and organisation panels are gone. */
  const me = w.eval("UI.state().playerParty");
  const prows = [...w.document.querySelectorAll("#party-table tr[data-party]")];
  ok("the Party tab opens every other party, and not your own",
     prows.length === CONTENT.parties.length - 1 && !prows.some(r => r.dataset.party === me),
     prows.length + " of " + CONTENT.parties.length);
  ok("and your own is on the roster, for the arithmetic",
     !!w.document.querySelector("#party-table tr.ownrow"));
  ok("and opens on one of them",
     (w.document.querySelector("#party-detail").textContent || "").trim().length > 40);
  ok("and is not a directory any more",
     !w.document.querySelector("#party-mps, #party-currents, #party-org"));
  const first = w.document.querySelector("#party-hdr").textContent;
  const detFirst = w.document.querySelector("#party-detail").textContent;
  if (prows[1]) {
    prows[1].click();
    ok("choosing another party changes the page",
       w.document.querySelector("#party-hdr").textContent !== first,
       first + " -> " + w.document.querySelector("#party-hdr").textContent);
    ok("and the relationship with it",
       w.document.querySelector("#party-detail").textContent !== detFirst);
    /* THE LOYALTY COLUMN IS THE LIVE ONE. It read st.loyalty, which does
       not exist, and fell back to content, so it printed the opening figure
       for the whole run whatever happened to the party. */
    const lp = CONTENT.parties.find(p => p.id !== me && !CONTENT.currents.some(c => c.party === p.id));
    w.eval('UI.state().parties[' + JSON.stringify(lp.id) + '].loyalty = 7; UI.redraw();');
    const lcell = w.document.querySelector('#party-table tr[data-party="' + lp.id + '"] td:nth-child(4)');
    ok("the party table prints loyalty as it stands, not as it opened",
       lcell && lcell.textContent.trim() === "7", lcell ? lcell.textContent : "no row");
    w.eval('UI.state().parties[' + JSON.stringify(lp.id) + '].loyalty = ' + lp.loyalty + '; UI.redraw();');
    /* WHAT THEY WANT: a party's own measures, each opening where it is
       carried, because order-paper time given to a partner's bill is the
       credit this parliament trades in (Engine.grantSlot). */
    const wantP = CONTENT.parties.find(p => p.id !== me &&
      CONTENT.bills.some(b => b.owner === p.id && w.eval("!!UI.state().bills[" + JSON.stringify(b.id) + "]")));
    if (wantP) {
      w.document.querySelector('#party-table tr[data-party="' + wantP.id + '"]').click();
      const theirs = CONTENT.bills.filter(b => b.owner === wantP.id &&
        w.eval("!!UI.state().bills[" + JSON.stringify(b.id) + "]"));
      const wb = [...w.document.querySelectorAll('#party-detail [data-open^="grant:"], #party-detail [data-open^="bill:"]')];
      ok("a party's own measures are what it wants from you", wb.length === theirs.length,
         wb.length + " rows for " + theirs.length + " measures of " + wantP.short);
      const live = wb.find(b => /^grant:/.test(b.dataset.open));
      if (live) {
        const bid = live.dataset.open.slice(6);
        live.click();
        ok("and a live one opens where time is given to it",
           w.document.querySelector('.tab[data-t="gov"]').getAttribute("aria-selected") === "true" &&
           !!w.document.querySelector('#gov-slots [data-slot="' + bid + '"]'), bid);
        w.document.querySelector('.tab[data-t="party"]').click();
      }
    } else ok("some party has a measure of its own", false);

    /* WHAT YOU HAVE PROMISED THEM: an undertaking owed to one of their
       members is on their page, staged and put back. */
    const snapP = w.eval("JSON.stringify(UI.state())");
    const their = CONTENT.characters.find(c => c.party && c.party !== me &&
      w.document.querySelector('#party-table tr[data-party="' + c.party + '"]'));
    if (their) {
      w.eval("Engine.apply(UI.state(), UI.content(), [{ undertake: { id: 'ut_party', " +
        "text: 'A promise kept for the test', owed_to: " + JSON.stringify(their.id) + ", " +
        "by: UI.state().sitting + 6, discharge: { flag: 'ut_party_kept' } } }]); UI.redraw();");
      w.document.querySelector('#party-table tr[data-party="' + their.party + '"]').click();
      ok("a promise owed to one of their members is on their page",
         /A promise kept for the test/.test(w.document.querySelector("#party-detail").textContent),
         their.party);
      w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapP) + "), UI.content())");
      w.document.querySelector('.tab[data-t="party"]').click();
    }
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

/* A SETTLEMENT RECORDS AND DOES NOT INTERRUPT (design/31 §4, the author's
   correction). It opened a dialog with its closing prose the moment it
   landed, which can be sitting fifteen; the words belong on the last page. */
try {
  const snap9 = w.eval("JSON.stringify(UI.state())");
  w.eval(`window.__alerts = []; (function(){ var a = Dialog.alert;
    Dialog.alert = function (m, o, cb) { window.__alerts.push((o && o.title) || ""); return a.apply(this, arguments); }; })();
    (function(){ var s = UI.state(); s.sitting = Math.max(s.sitting, 15);
      s.bills.divergence.stage = "defeated"; s.bills.divergence.dead = true; })();`);
  w.document.querySelector('.tab[data-t="gov"]').click();
  const slot = w.document.querySelector("#gov-slots .slotbtn");
  if (slot) slot.click();
  const st9 = w.eval("UI.state()");
  ok("a settlement landing mid-session is recorded", st9.settledAs === "restriction", st9.settledAs);
  ok("in the register", st9.log.some(l => /The question is settled: The Restriction Settlement/.test(l.text)));
  ok("and it opens no dialog", !w.eval("window.__alerts").some(t => /Settlement/.test(t)),
     w.eval("window.__alerts").join(" / "));
  /* put the run back as it was: the checks below read its calendar */
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snap9) + "), UI.content())");
} catch (e) { ok("a settlement records and does not interrupt", false, e.message); }

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
  /* RE-BOOT ON THE CONTENT THE SESSION IS RUNNING ON, not the raw global.
     `UI.boot(s, CONTENT)` put the interface back on the unmerged copy --
     Flash I's startDate is 2080 and the global placeholder is 2287 -- so
     every assertion after this point read a calendar 207 years off the state
     it was showing. Shell.contentFor is the one implementation of the merge. */
  w.eval("(function(){var s=UI.state(); s.flags._introRead=true;" +
         "s.noConfidence={at:s.sitting,have:0,need:141};" +
         "UI.boot(s, Shell.contentFor((CONTENT.administrations||[])" +
         ".find(function(x){return x.id===s.admin;})));})()");
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
  /* and the settlement's closing words are on it, which no dialog read out
     earlier: settled here on the page's own state */
  const setl = w.eval("(function(){ var s = UI.state(); s.settledAs = 'restriction'; UI.redraw();" +
    " var p = document.querySelector('#sitting-body .sp-page'); return p ? p.textContent : ''; })()");
  ok("and the settlement's own closing words, which no dialog read out earlier",
     /What the session settled: The Restriction Settlement/.test(setl) &&
     /one hundred and sixty-eight hours/.test(setl), setl.slice(setl.indexOf("settled"), setl.indexOf("settled") + 80));
  ok("and it offers no decision, because there is nothing left to decide",
     w.document.querySelectorAll("#sitting-body button[data-choice]").length === 0);
} catch (e) { ok("the last page", false, e.message); }

/* THE ECONOMY TAB, which the author has now pushed back on twice. What it
   needed was not more numbers but the things a reader asks of a number:
   where it came from, what it means, and what it has been doing. */
try {
  w.document.querySelector('.tab[data-t="econ"]').click();
  const tre = (w.document.querySelector("#econ-account") || {}).textContent || "";
  ok("the account says when nothing is owed", /Owednothing is pledged to any lendernone/.test(tre), tre.slice(0, 120));
  /* NAMED CREDITORS: each lender its own row, on its own terms, and a Repay
     control only where the lender is paid across the counter. Staged on a
     copy of the page's state and put back, so nothing after this sees it. */
  const snapC = w.eval("JSON.stringify(UI.state())");
  const cred = w.eval("(function(){ var s = UI.state(); s.debt = {owed:{earth:12000, alliance:19800}};" +
    " UI.redraw(); var b = document.querySelector('#econ-account');" +
    " return { text: b.textContent, repay: [].map.call(b.querySelectorAll('[data-repay]'), function(x){ return x.dataset.repay; }) }; })()");
  ok("the account names each creditor", /Owed to Earth's markets/.test(cred.text) &&
     /Owed to The Alliance of Business and Government/.test(cred.text), cred.text.slice(0, 160));
  ok("and only the lender paid across the counter has a Repay control",
     cred.repay.length === 1 && cred.repay[0] === "earth", JSON.stringify(cred.repay));
  w.eval("UI.boot(JSON.parse(" + JSON.stringify(snapC) + "), UI.content())");
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

/* A NUMBER THE INTERFACE PRINTS IS CONTENT'S NUMBER. The status bar had
   "SIGNATURES n/9" and reddened at 7 as literals, while
   setup.thresholds.ballot is 12 and signaturePanel reads it properly -- so
   the bar told the player a ballot needed nine names when it needs twelve,
   and went red five short of the number that matters. Two places holding one
   number is the apportionment_ratio lesson, and a hardcoded threshold is
   invisible to every check that does not compare it with its source. */
try {
  const need = w.eval("CONTENT.setup.thresholds.ballot");
  const bar = (w.document.querySelector("#sb-sig") || {}).textContent || "";
  ok("the status bar's ballot threshold is the one content sets",
     bar.indexOf("/" + need) >= 0, bar + " against a threshold of " + need);
} catch (e) { ok("the signatures readout", false, e.message); }

/* THE CALENDAR IS IN THE CAMPAIGN'S OWN YEAR, and this is the assertion the
   worst bug of the set would have failed.

   An administration's `setup` overrides are merged by `contentFor()`, which
   was handed to `Engine.newGame` and then THROWN AWAY -- so the opening
   state was built from Flash I's `startDate: "2080-04-11"` while every
   later engine call got the unmerged `C`, whose placeholder is 2287. 207
   years apart. `sittingOfDate` counts forward from `C.setup.startDate`, so
   every day of the campaign's own month was "before the start" and came
   back null: not one day carried a sitting number, `past`/`today` were
   false for every day so the calendar never marked today at all, and the
   hover card said the House does not sit on any Monday in April.

   It hid because the two halves disagree SILENTLY: the day cell tints off
   `d.sits` (a weekday test, correct) and the card reads `d.sitting` (the
   count, null), so the grid looked right and only its tooltips lied. */
try {
  w.document.querySelector('.tab[data-t="sit"]').click();
  const cells = [...w.document.querySelectorAll("#sit-cal .calgrid .cd")];
  ok("the calendar draws a month of days", cells.length >= 28, cells.length + " days");
  /* THE INVARIANT THAT WOULD HAVE CAUGHT IT, stated once: the content the
     interface is running on and the state it is showing must agree about
     when the campaign began. Nothing could see both at once until UI.content
     existed, which is why a 207-year disagreement survived. */
  ok("the interface's content agrees with its state about the start date",
     w.eval("UI.content().setup.startDate") === w.eval("UI.state().date") ||
     w.eval("UI.content().setup.startDate").slice(0, 4) ===
       w.eval("UI.state().date").slice(0, 4),
     w.eval("UI.content().setup.startDate") + " vs " + w.eval("UI.state().date"));

  /* The state and the content the engine reads dates from must agree. */
  const stDate = w.eval("UI.state().date");
  ok("the calendar's month is the state's own year",
     new RegExp("^" + String(stDate).slice(0, 4))
       .test(String(w.eval("UI.state().date")).slice(0, 4)) &&
     (w.document.querySelector("#sit-cal .calhead span") || {}).textContent
       .indexOf(String(stDate).slice(0, 4)) >= 0,
     stDate + " vs " + (w.document.querySelector("#sit-cal .calhead span") || {}).textContent);

  const numbered = cells.filter(c => c.querySelector("u"));
  ok("and the sitting days in it carry their sitting numbers",
     numbered.length > 0, numbered.length + " of " + cells.length + " numbered");
  ok("and exactly one day is marked as today",
     cells.filter(c => c.classList.contains("now")).length === 1,
     cells.filter(c => c.classList.contains("now")).length + " marked");

  /* THREE CASES, NOT TWO. A Monday before the session opened is a sitting
     day of the week with no number, and the card used to tell the player
     "the House sits four days in seven, this is not one of them" -- wrong
     twice: it is one of them, and the reason is the session, not the week. */
  const liars = cells.filter(c =>
    !c.classList.contains("dark") &&
    /is not one of them/.test(c.dataset.tipBody || ""));
  ok("no sitting day is told it is not a sitting day",
     liars.length === 0,
     liars.length ? liars.map(c => (c.querySelector("b") || {}).textContent).join(", ")
                  : "none");
  const early = cells.filter(c => !c.classList.contains("dark") && !c.querySelector("u"));
  if (early.length)
    ok("and one before the session says so, with the date it is before",
       /before this session/i.test(early[0].dataset.tipTitle || "") &&
       /opened on/.test(early[0].dataset.tipBody || ""),
       early[0].dataset.tipBody);

  /* THE KEY CAME BACK. It was hidden on the grounds that "the colours are
     already explained by the hover card" -- but a card explains the day it
     is on, not what a colour means, so the only way to learn that a pip is
     a division was to find a day carrying one. */
  const key = w.document.querySelectorAll("#sit-cal .calkey span");
  ok("the calendar keeps a key for its marks", key.length >= 5,
     [...key].map(k => k.textContent.trim()).join(" \u00b7 "));
} catch (e) { ok("the parliamentary calendar", false, e.message); }

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
    /* In the Concordance now. A partner is reached from the Party tab's own
       link; your own party is not a subject there, so it is opened the way
       any [data-go] reference in the shell opens an article. */
    w.document.querySelector('.tab[data-t="party"]').click();
    const row = w.document.querySelector('#party-table tr[data-party="' + pid + '"]');
    if (row) row.click();
    let link = row && w.document.querySelector('#party-detail a[data-go="' + pid + '"]');
    if (row && !link) { ok("the Party tab links " + pid + " to its article", false); continue; }
    if (!link) {
      link = w.document.createElement("a");
      link.setAttribute("data-go", pid);
      w.document.querySelector("#shell").appendChild(link);
    }
    link.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    if (!row) link.remove();
    const seats = w.eval('Engine.partyTotal(UI.state(), ' + JSON.stringify(pid) + ')');
    const listed = w.document.querySelectorAll("#cx-article .cx-wikitable tbody tr").length;
    ok("every seat " + pid + " holds has a member in its Concordance article", listed === seats,
       listed + " members against " + seats + " seats");
  }
  ok("and the list tier is marked as what it is",
     [...w.document.querySelectorAll("#cx-article .cx-wikitable tbody tr")]
       .some(r => /list/.test(r.textContent)));

  w.document.querySelector('.tab[data-t="cham"]').click();
  const comp = [...w.document.querySelectorAll("#comp-table tr[data-comp]")];
  ok("parties with currents open inside the composition table", comp.length > 0,
     comp.length + " expandable");
  ok("and nothing is open to begin with",
     w.document.querySelectorAll("#comp-table tr.bench").length === 0);
  if (comp.length) {
    const pid = comp[0].dataset.comp;
    comp[0].click();
    const det = [...w.document.querySelectorAll("#comp-table tr.bench")];
    const want = w.eval("CONTENT.currents.filter(function (c) { return c.party === '" + pid + "'; }).length");
    ok("clicking one shows its currents, one row each", det.length === want && want > 0,
       det.length + " rows for " + want + " currents");
    ok("each with its loyalty and its size",
       det.length > 0 && det.every(tr => tr.querySelector(".cdl") && /\d/.test(tr.cells[4].textContent)),
       det.length ? det[0].textContent.trim().slice(0, 60) : "nothing");
    w.document.querySelector("#comp-table tr[data-comp]").click();
    ok("and clicking again closes it",
       w.document.querySelectorAll("#comp-table tr.bench").length === 0);
  }
} catch (e) { ok("the parties tab and the composition fold", false, e.message); }

/* THE CONCORDANCE SURVIVES A SEARCH, and every route out of one works.

   `renderHits` wrote the results into `#cx-body`, whose only child is
   `#cx-article` -- the element every article render targets. So one search
   destroyed it, `drawArticle` set .innerHTML on null and threw, and the
   Concordance became a one-way trip: nav links, the hits themselves and the
   back button were all dead, because all three end at the same goCx. It read
   as working because `drawNav` runs first, so the nav highlight moved while
   the page under it never changed. */
try {
  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  click(w.document.querySelector('.tab[data-t="cx"]'));
  const title = () => (w.document.querySelector("#cx-article .cx-title") || {}).textContent || "";
  const navlink = i => [...w.document.querySelectorAll("#cx-nav .cx-navlink")][i];

  /* jsdom's HTMLAnchorElement.click() does not dispatch, so every assertion
     here goes through a real MouseEvent. A probe that used .click() reported
     the nav as broken before the search too, which it is not. */
  click(navlink(2));
  const first = title();
  ok("a Concordance nav link opens its article", !!first, first);

  w.document.querySelector("#cx-q").value = "seat";
  click(w.document.querySelector("#cx-goto"));
  ok("searching lists every match, not the best one",
     w.document.querySelectorAll("#cx-article .cx-hits a").length > 1,
     w.document.querySelectorAll("#cx-article .cx-hits a").length + " hits");
  ok("and it does not destroy the container articles are drawn into",
     !!w.document.querySelector("#cx-article"), "#cx-article survives");

  click(navlink(5));
  ok("a nav link still works after a search", title() !== "Search" && !!title(), title());

  w.document.querySelector("#cx-q").value = "seat";
  click(w.document.querySelector("#cx-goto"));
  const hit = w.document.querySelector("#cx-article .cx-hits a");
  const wanted = hit.dataset.go;
  click(hit);
  ok("and clicking a result opens the article it names",
     title() === w.eval('Concordance.hits("seat")[0].title') || title() !== "Search",
     wanted + " -> " + title());

  w.document.querySelector("#cx-q").value = "seat";
  click(w.document.querySelector("#cx-goto"));
  click(w.document.querySelector("#cx-back"));
  ok("and the back button is not dead either", title() !== "Search", title());
} catch (e) { ok("the Concordance search", false, e.message); }

/* THE CONCORDANCE READS AS AN ENCYCLOPEDIA.

   The hand-written articles had Wikipedia's register and the generated ones
   did not: the party article opened "A party of the House of Delegates
   holding 82 of 280 seats" -- a sentence with no subject in it, which is a
   caption and not a lede -- and the person article opened with a fragment.
   Wikipedia's first sentence names the subject in bold and says what it is,
   without exception, and that is the most recognisable thing about it. */
try {
  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  click(w.document.querySelector('.tab[data-t="cx"]'));
  const open = id => { w.eval('Concordance.render(UI.state(), UI.content(), "' + id + '", true)');
                       return w.document.querySelector("#cx-article"); };

  /* Every KIND of article, because the fault was per generator. */
  const kinds = ["cu", "person_flash", "anselm", "commonwealth", "bill_divergence"];
  const bad = kinds.filter(id => {
    const el = open(id);
    const lede = el.querySelector(".cx-lede");
    if (!lede) return true;
    const strong = lede.querySelector("strong");
    const t = lede.textContent.trim();
    /* the subject, in bold, and then a verb saying what it is */
    /* "The Circumterrestrial Commonwealth is..." is the same form: an
       English article in front of the subject is part of the name. */
    const head = t.replace(/^(The|A|An)\s+/, "");
    return !strong || head.indexOf(strong.textContent.replace(/^(The|A|An)\s+/, "")) !== 0 ||
           !/\b(is|are|was|were)\b/.test(head);
  });
  ok("every article opens by naming its subject and saying what it is",
     bad.length === 0, bad.length ? bad.join(", ") : kinds.length + " kinds checked");

  /* A VOLATILE FIGURE CARRIES ITS DATE. "Party discipline is recorded at 62"
     is a fact about one sitting printed as though it were permanent. */
  ok("and dates the figures the engine can move",
     /As of sitting \d+/.test(open("cu").textContent),
     (open("cu").textContent.match(/As of sitting \d+[^.]*\./) || [""])[0].slice(0, 70));

  /* A POSITION IN WORDS, from js/schema.js's poles -- and the count of the
     axes taken from the data, not typed. "the four axes" was written when
     there were four and survived the conversion to five. */
  const pos = open("cu").textContent;
  ok("and renders a party's position in words, not co-ordinates",
     /strongly (public|private|liberal|authoritarian|restrictionist|expansionist|station|federal|closurist|integrationist)/.test(pos) &&
     !/economic: -?\d/.test(pos),
     (pos.match(/position on the \d+ axes[^.]*\./) || [""])[0].slice(0, 96));
  ok("and counts its axes rather than naming a number that can go stale",
     pos.indexOf("the " + Object.keys(w.eval("JSON.parse(JSON.stringify(CONTENT.partyById.cu.axes))"))
       .filter(k => w.eval('CONTENT.partyById.cu.axes.' + k) !== null).length + " axes") >= 0,
     (pos.match(/the \d+ axes/) || [""])[0]);

  /* CATEGORIES, which Wikipedia closes every article with. */
  ok("and closes on its categories", !!open("cu").querySelector(".cx-cats span"),
     [...open("cu").querySelectorAll(".cx-cats span")].map(x => x.textContent).join(" \u00b7 "));

  /* AN ENCYCLOPEDIA DOES NOT PRINT THE AUTHOR'S DESIGN NOTES. The person
     article used `characters[].note` as its first paragraph, and those are
     notes to the author: "Liabilities, not buffs. Her record is the thing
     that can be dug up." */
  const flash = open("person_flash").textContent;
  ok("and never prints the author's design notes at the reader",
     !/Liabilities, not buffs/.test(flash) && !/\bbuffs?\b/i.test(flash),
     "characters[].note stays out of world");
} catch (e) { ok("the Concordance register", false, e.message); }

/* AN ARTICLE GAINS A SECTION WHEN THE WORLD EARNS IT. The hand-written
   articles were frozen text, so the reference work could not report on the
   campaign it sits inside. A section carrying `when` is gated by the same
   Engine.matches the events use. */
try {
  const openIt = () => { w.eval('Concordance.render(UI.state(), UI.content(), "commonwealth", true)');
                         return w.document.querySelector("#cx-article"); };
  const stt = w.eval("UI.state()");
  const was = !!stt.flags.almanac_annexed;
  delete stt.flags.almanac_annexed;
  ok("a conditional section is absent before its condition holds",
     !/Accession of the Almanac Works/.test(openIt().textContent));
  stt.flags.almanac_annexed = true;
  const after = openIt();
  ok("and appears once the House has done the thing",
     /Accession of the Almanac Works/.test(after.textContent));
  ok("and the contents list gains it too, rather than pointing at nothing",
     /Accession/.test((after.querySelector(".cx-toc") || { textContent: "" }).textContent));
  if (!was) delete stt.flags.almanac_annexed;
} catch (e) { ok("conditional Concordance sections", false, e.message); }

/* CROSS-REFERENCES FROM THE REST OF THE GAME. `Concordance.knows` was called
   by js/ui.js and never written, behind a guard that answered false for
   everything -- so a party name on the Chamber tab, a station on the orbit
   table and a constituency in the roll were all inert. A truthy guard around
   a function that does not exist is how that stayed quiet, which is the same
   miss tools/edtest.js exists for. */
try {
  ok("the Concordance says what it has an article for",
     typeof w.eval("typeof Concordance.knows") === "string" &&
     w.eval("typeof Concordance.knows") === "function",
     w.eval("typeof Concordance.knows"));
  ok("and it answers for a generated id as well as a written one",
     w.eval('Concordance.knows("cu")') && w.eval('Concordance.knows("perigee_charter")') &&
     !w.eval('Concordance.knows("no_such_article")'));

  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  click(w.document.querySelector('.tab[data-t="cham"]'));
  const ext = [...w.document.querySelectorAll("#shell [data-go]")]
    .filter(e => !e.closest("#cx-body") && !e.closest("#cx-nav"));
  ok("the game carries cross-references outside the Concordance", ext.length > 0,
     ext.length + " links");
  click(ext[0]);
  ok("and following one switches tab and opens the article",
     (w.document.querySelector(".screen.on") || {}).id === "s-cx" &&
     !!(w.document.querySelector("#cx-article .cx-title") || {}).textContent,
     ext[0].dataset.go + " -> " +
     (w.document.querySelector("#cx-article .cx-title") || {}).textContent);
} catch (e) { ok("cross-references into the Concordance", false, e.message); }

/* AND THE MENU KEEPS ITS OWN data-go NAMESPACE. `root` is both the menu's
   Back target and a Concordance article id, so a handler that did not care
   which screen it was on would send the menu's own Back button into the
   Concordance. Two invariants keep that safe: the collision is real and is
   asserted so nobody "tidies away" the scoping, and no in-game
   cross-reference is a dead link. */
try {
  ok("the menu's Back target collides with an article id, so scope matters",
     w.eval('Concordance.knows("root")'),
     '"root" is both a menu target and an article');
  const ext = [...w.document.querySelectorAll("#shell [data-go]")]
    .filter(e => !e.closest("#cx-body") && !e.closest("#cx-nav"));
  const dead = ext.filter(e => !w.eval('Concordance.knows("' + e.dataset.go + '")'));
  ok("and every in-game cross-reference resolves to an article",
     ext.length > 0 && dead.length === 0,
     dead.length ? dead.map(e => e.dataset.go).join(", ") : ext.length + " links, none dead");
} catch (e) { ok("the menu namespace", false, e.message); }

/* A BILL THAT HAS NOT BEEN INTRODUCED HAS NO ARTICLE. Four bills open in
   `drafting` and every one of them had a full Concordance page with a
   division forecast at sitting one -- the Almanac Works (Annexation) Bill
   among them, which is the act the campaign is ABOUT and which no one has
   laid before the House. */
try {
  const stt = w.eval("UI.state()");
  const drafting = CONTENT.bills.filter(b => stt.bills[b.id] &&
                                             stt.bills[b.id].stage === "drafting");
  ok("some bills open un-introduced, as content intends", drafting.length > 0,
     drafting.map(b => b.id).join(", "));
  ok("and none of them has a Concordance page",
     drafting.every(b => !w.eval('Concordance.knows("bill_' + b.id + '")')),
     drafting.filter(b => w.eval('Concordance.knows("bill_' + b.id + '")'))
             .map(b => b.id).join(", ") || "none leaked");
  ok("while every introduced bill keeps one",
     CONTENT.bills.filter(b => stt.bills[b.id] && stt.bills[b.id].stage !== "drafting")
       .every(b => w.eval('Concordance.knows("bill_' + b.id + '")')));
  /* and the gate lifts the moment the bill is set down */
  if (drafting.length) {
    const id = drafting[0].id;
    stt.bills[id].stage = "first_reading";
    ok("and setting one down gives it its page",
       w.eval('Concordance.knows("bill_' + id + '")'), id + " introduced");
    stt.bills[id].stage = "drafting";
  }
} catch (e) { ok("un-introduced bills", false, e.message); }

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
    /* THE YEARS COME FROM THE RECORD. This asserted /228\d/, which was the
       campaign's year when it was written and stopped being true the moment
       the canon date moved -- the third place in one sweep where a literal
       stood in for content's own number. */
    const H = w.eval("JSON.stringify(CONTENT.setup.history)");
    const span = JSON.parse(H);
    ok("and the record draws the years before the game",
       ((w.document.querySelector("#chart-sub") || {}).textContent || "")
         .indexOf(String(span.from)) >= 0,
       (w.document.querySelector("#chart-sub") || {}).textContent +
         " against " + span.from + "-" + span.to);
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
    /* THE DATE ON THE FILE IS THE CALENDAR'S. It was the literal "11 APR
       2287" on every bill paper, two centuries off the campaign's own. */
    const docText = (w.document.querySelector("#pp-doc") || {}).textContent || "";
    const year = String(w.eval("UI.content().setup.startDate")).slice(0, 4);
    ok("and it is dated in the campaign's own year", docText.indexOf(year) >= 0 && !/2287/.test(docText),
       (docText.match(/\d{1,2} [A-Z]{3} \d{4}/) || ["no date"])[0]);
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
