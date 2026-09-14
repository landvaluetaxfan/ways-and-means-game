/* CAN A PERSON USE IT.

   The half of the DOM checks that is not about whether the game drew: the
   status bar, the audio bus, focus restoration across a re-render, one
   activation path, the division dialog, text streaming, and the tooltip
   layer. Rendering and saves are in tools/uitest.js; both share
   tools/harness.js.                                                      */
const H = require("./harness.js");
const { fs, path, root, w, $, ok, CONTENT } = H;

H.banner("INTERFACE AND INTERACTION");
H.boot();
H.newGame();

/* =============================================================
   UI-0: THE STATUS BAR, THE AUDIO BUS, FOCUS AND TAB ORDER
   ============================================================= */

/* THE AUDIO BUS MUST SURVIVE HAVING NO AUDIO.

   jsdom implements no AudioContext, which is exactly the condition a
   locked-down or embedded browser presents. Every entry point has to be a
   no-op rather than an exception: a player with no Web Audio still has a
   game, they just have a quiet one. Any throw here also surfaces as a
   window error at the bottom of this file. */
try {
  ok("audio module loaded", w.eval("typeof Sound") === "object");
  ok("no audio context in this environment", w.eval("Sound.available()") === false);
  w.eval('Sound.init(); Sound.play("click"); Sound.play("aye"); Sound.play("nope");');
  w.eval('Sound.room(true); Sound.room(false); Sound.apply();');
  w.eval('Sound.setMute(true); Sound.setGain("ui", 0.4);');
  ok("a headless run with no audio context does not throw", true);
} catch (e) { ok("a headless run with no audio context does not throw", false, e.message); }

/* NO SOUND MAY COME OUT OF A REDRAW.

   This is the rule at the top of js/audio.js, tested rather than inspected.
   A redraw happens for reasons that have nothing to do with the player -
   switching tabs, loading a slot, a mirrored panel repainting itself - so a
   cue fired from a draw function fires at random and four times over. The
   spy replaces Sound.play at the module boundary, which catches a call made
   transitively through Papers or the Concordance as readily as a direct one.

   Sound.type is spied too. The teletype is a second way to make a noise and
   would otherwise be a second way to break the rule: the text streamer is
   started by an action and never by a renderer, and this is what holds it
   to that. */
try {
  w.eval('window.__cues = []; Sound.play = function (n) { window.__cues.push(n); };' +
         'Sound.type = function (r) { window.__cues.push("type:" + r); };');
  w.eval('window.__cues.length = 0; UI.boot(UI.state(), CONTENT);');
  const fromDraw = w.eval("window.__cues.slice()");
  ok("a full redraw makes no sound", fromDraw.length === 0, fromDraw.join(", "));

  /* and the spy is live, so the assertion above means something */
  w.eval('window.__cues.length = 0;');
  w.document.querySelector('.tab[data-t="cham"]')
   .dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true }));
  ok("a player action does make one", w.eval("window.__cues.length") === 1,
     w.eval("JSON.stringify(window.__cues)"));
} catch (e) { ok("audio fires from actions and not from redraws", false, e.message); }

/* THE STATUS LINE. One writer, three levels, transient on top. */
try {
  w.document.querySelector('.tab[data-t="cham"]').click();
  const ambient = $("#sb-msg").textContent;
  ok("the status line carries an ambient message", ambient.length > 10,
     JSON.stringify(ambient));
  w.eval('UI.setStatus("A DIVISION HAS BEEN CALLED", "transient")');
  ok("a transient message wins", $("#sb-msg").textContent === "A DIVISION HAS BEEN CALLED" &&
     $("#sb-msg").classList.contains("live"));
  w.eval('UI.setStatus("", "transient")');
  ok("and the ambient one comes back", $("#sb-msg").textContent === ambient &&
     !$("#sb-msg").classList.contains("live"));

  /* setStatus is called from more than one place. Counted in the source
     rather than at runtime: most of the call sites need a division or a
     signature to reach, and the acceptance is about the shape of the code. */
  const uisrc = fs.readFileSync(path.join(root, "js/ui.js"), "utf8");
  const sites = (uisrc.match(/setStatus\(/g) || []).length -
                (uisrc.match(/function setStatus\(/g) || []).length;
  ok("setStatus is called from at least three sites", sites >= 3, sites + " calls");
} catch (e) { ok("the status line", false, e.message); }

/* PLAYER PREFERENCES LIVE IN Shell.opts, NOT IN THE SAVE.

   Mute describes the person at the terminal; the save describes the
   Commonwealth. Asserted here rather than in roundtrip.js, which tests
   content serialisation and has no view of a browser's storage at all. */
try {
  $("#tb-options").click();
  const mute = w.document.querySelector('#tb-optpanel [data-opt="mute"]');
  const lvl  = w.document.querySelector('#tb-optpanel [data-lvl="gainEvent"]');
  ok("the options panel offers sound", !!mute && !!lvl);

  /* THE AUDIO READOUT. Web Audio fails silently by construction — a
     suspended context, a refused gesture, a layer gain that never opened
     and a phone with its ring switch off all produce the same nothing,
     with no error anywhere. Two wrong diagnoses were made from a verbal
     description before this existed, so it has to be present and it has
     to say something. jsdom has no Web Audio at all, which is the very
     case it must not go blank in. */
  const diag = w.document.querySelector("#opt-audio");
  ok("and reports what the audio hardware is doing", !!diag);
  ok("even on a machine with no Web Audio at all",
     !!diag && diag.textContent.trim().length > 0 &&
     /audio:/.test(diag.textContent), diag && diag.textContent.trim());
  mute.checked = true;
  mute.dispatchEvent(new w.Event("change", { bubbles: true }));
  lvl.value = "25";
  lvl.dispatchEvent(new w.Event("input", { bubbles: true }));

  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  ok("mute and gains are written to Shell.opts",
     stored.mute === true && stored.gainEvent === 0.25, JSON.stringify(stored));

  const save = JSON.parse(w.eval("Engine.save(UI.state())"));
  ok("and never to the save state",
     !("mute" in save) && !("gainEvent" in save) && !("opts" in save));

  /* across a reload: Shell.boot re-reads localStorage */
  w.eval("Shell.boot(CONTENT)");
  ok("they survive a reload", w.eval('Shell.opt("mute")') === true &&
     w.eval('Shell.opt("gainEvent")') === 0.25);
} catch (e) { ok("audio preferences persist in Shell.opts", false, e.message); }

/* SELECTION MEANS ONE THING.

   .sel is the solid inverted block, and it belongs only to a row that a click
   selects. It used to be borrowed for three other meanings - a disloyal
   current, an instrument in force, a vacant post - which is exactly the kind
   of drift a check should catch the second time it happens. Both halves are
   asserted: what is on the page, and what the source is allowed to emit. */
try {
  const rows = [...w.document.querySelectorAll("tr.sel")];
  const stray = rows.filter(tr => !tr.matches("[data-bill],[data-station],[data-doc],[data-cons]"));
  ok(".sel is only on a row a click selects", rows.length >= 2 && stray.length === 0,
     rows.length + " selected, " + stray.length + " on rows that do nothing");

  /* four quoted literals, in the four tables that select a row: #gov-bills,
     #orbit-table, #pp-list, #cons-table. A fifth is a regression. */
  const jssrc = ["js/ui.js", "js/papers.js", "js/editor.js", "js/shell.js",
                 "js/encyclopedia.js", "js/orbitchart.js"]
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const lits = jssrc.match(/["']sel["']/g) || [];
  ok("nothing else emits a sel class", lits.length === 4, lits.length + " literals");

  /* the three other states differ in texture and hue - a gutter, a hatch,
     a ghost - so they cannot be read as paler selections */
  const css2 = fs.readFileSync(path.join(root, "css/terminal.css"), "utf8");
  ["tr.warn td", "tr.inforce td", "tr.vacant td"].forEach(sel =>
    ok("a rule of its own for " + sel, css2.includes(sel)));
  ok("selection is a gold tint, distinct from all three",
     /tr\.sel td\{background:#f2e4b3/.test(css2));

  /* NOTHING ABOUT PICKING A ROW FADES. A selection that eases in is one you
     are not sure you made, and the same goes for focus. */
  const anim = (css2.match(/[^}]*\.(sel|warn|inforce|vacant)[^{}]*\{[^}]*transition[^}]*\}/g) || [])
    .concat(css2.match(/[^}]*:focus[a-z-]*[^{}]*\{[^}]*transition[^}]*\}/g) || []);
  ok("no transition on a selection or a focus state", anim.length === 0, anim.join(" | "));
} catch (e) { ok("selection semantics", false, e.message); }

/* FOCUS RESTORATION.

   drawAll() replaces twenty-five containers on every state change, so
   before this phase focus went to document.body every single time. These
   are the two cases that matter: the row is still there, and the row is
   gone. */
try {
  /* --- the row survives --- */
  w.eval(`
    var rows = Focus.rows("orbit-table");
    window.__key = rows[8].dataset.station;
    Focus.activate("orbit-table", window.__key);
    window.__before = document.activeElement.getAttribute("data-station");
  `);
  ok("activating a row puts focus on it",
     w.eval("window.__before") === w.eval("window.__key"), w.eval("window.__before"));

  w.eval("Engine.advance(UI.state(), CONTENT); UI.boot(UI.state(), CONTENT);");
  const after = w.eval('document.activeElement.getAttribute && document.activeElement.getAttribute("data-station")');
  ok("focus is on the same logical row after a full state advance",
     after === w.eval("window.__key"),
     "wanted " + w.eval("window.__key") + ", got " +
     (w.document.activeElement === w.document.body ? "document.body" : after));
  ok("and the selection is on that row too",
     w.eval('Focus.selected("orbit-table")') === w.eval("window.__key"));

  /* --- the row is gone ---
     The register is state-shaped: making an instrument adds a row and
     unmaking it takes that row away. Focus should land beside where it
     was, never on the body. */
  w.eval(`
    var st = UI.state();
    window.__si = Object.keys(st.instruments)[0];
    st.instruments[window.__si].made = true;
    st.instruments[window.__si].madeAt = st.sitting;
    UI.boot(st, CONTENT);
    Focus.activate("pp-list", window.__si);
    window.__had = document.activeElement.getAttribute("data-doc");
    window.__siblings = Focus.rows("pp-list").length;
  `);
  ok("the register carries the instrument, and it has focus",
     w.eval("window.__had") === w.eval("window.__si") && w.eval("window.__siblings") > 1,
     w.eval("window.__had") + " of " + w.eval("window.__siblings") + " rows");

  w.eval(`
    var st2 = UI.state();
    st2.instruments[window.__si].made = false;
    Engine.advance(st2, CONTENT);
    UI.boot(st2, CONTENT);
  `);
  const gone = w.document.activeElement;
  ok("the row is gone", w.eval(`Focus.rowFor("pp-list", window.__si)`) === null);
  ok("focus landed on a surviving sibling, not the body",
     gone !== w.document.body && !!gone.closest && !!gone.closest("#pp-list"),
     gone === w.document.body ? "document.body" : gone.tagName + " " + (gone.id || gone.className));

  /* --- scroll ---
     Reproduces the real failure deterministically: a render clobbers the
     scroll position (a browser clamps it when the new content is
     shorter), and the wrapper has to put it back. */
  const scrollers = w.eval(`
    (function () {
      var ns = [].slice.call(document.querySelectorAll(
        "#viewport,.pbody,#cx-body,#cx-side,#pp-doc,.callsheet,#tabstrip"));
      ns.forEach(function (n, i) { n.scrollTop = 40 + i; });
      Focus.around(function () { ns.forEach(function (n) { n.scrollTop = 0; }); });
      return ns.filter(function (n, i) { return n.scrollTop !== 40 + i; }).length +
             "/" + ns.length;
    })()
  `);
  ok("scroll survives a re-render on every scrollable panel",
     scrollers.split("/")[0] === "0" && +scrollers.split("/")[1] > 4,
     scrollers.split("/")[1] + " panels, " + scrollers.split("/")[0] + " lost");

  /* --- THE DRAWN SCROLLBAR IS THE TERMINAL'S, NOT ORBIT'S ---

     jsdom reports no ::-webkit-scrollbar, so it takes the Gecko path and
     decorateScrollers() actually runs here. It used to name two orbit
     panels by selector, which made every scroller added afterwards get
     the operating system's bar while orbit had a drawn one. The marker
     class is the contract; these assert both halves of it. */
  const marked = [...w.document.querySelectorAll(".scrolls")];
  ok("every scrolling body is marked for the drawn bar", marked.length >= 5,
     marked.length + " marked");
  ok("and the marks are spread across the terminal, not one screen",
     new Set(marked.map(e => (e.closest("section") || {}).id)).size >= 3,
     [...new Set(marked.map(e => (e.closest("section") || {}).id))].join(" "));
  ok("each one got a drawn bar rather than the operating system's",
     marked.every(e => e.parentNode.classList.contains("sbwrap") &&
                       !!e.parentNode.querySelector(".sbar>.sbar-thumb")),
     marked.filter(e => !e.parentNode.classList.contains("sbwrap"))
           .map(e => e.id || e.className).join(" ") || "all wrapped");
  /* And the rule that lays it out is not scoped to a screen either — the
     CSS is where the last version of this bug actually lived. */
  const sheet = require("fs").readFileSync(
    require("path").join(__dirname, "..", "css", "terminal.css"), "utf8");
  ok("and the stylesheet does not scope .sbwrap to one grid",
     /^\.sbwrap\{/m.test(sheet) && !/\.g-\w+>\.panel>\.sbwrap/.test(sheet));
} catch (e) { ok("focus restoration", false, e.message); }

/* THE CONCORDANCE WITHOUT A MOUSE.

   101 links against 3 focusable controls before this phase: the article
   links are <a> with no href, which are not focusable and not
   activatable. tabindex makes them reachable and Enter sends them down
   the delegated click path the mouse already uses - not a second one. */
try {
  /* the harness stubs anchor clicks so that a download link cannot throw;
     deleting the override falls back to HTMLElement's real one. */
  delete w.HTMLAnchorElement.prototype.click;

  const links = [...w.document.querySelectorAll("#s-cx [data-go], #s-cx [data-anchor]")];
  const unreachable = links.filter(a => a.getAttribute("tabindex") !== "0");
  ok("every Concordance link is a tab stop", links.length > 50 && unreachable.length === 0,
     links.length + " links, " + unreachable.length + " unreachable");

  const nav = w.document.querySelector("#cx-nav .cx-navlink:not(.on)[data-go]");
  const want = nav.dataset.go;
  nav.focus();
  ok("a Concordance link can take focus", w.document.activeElement === nav);
  nav.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  ok("Enter follows the link", !!w.document.querySelector('#cx-nav .cx-navlink.on[data-go="' + want + '"]'),
     "wanted " + want);
  ok("and focus moves into the article it opened",
     w.document.activeElement === w.document.getElementById("cx-article"),
     w.document.activeElement.id || w.document.activeElement.tagName);

  /* ONE ACTIVATION PATH. #cx-body links used to be bound twice - a
     delegated capture listener in ui.js and a per-node bubble listener in
     encyclopedia.js - so a single click rendered the article twice. */
  const src = fs.readFileSync(path.join(root, "js/encyclopedia.js"), "utf8");
  ok("the Concordance binds [data-go] in exactly one file",
     !/querySelectorAll\("#cx-body \[data-go\]"\)/.test(src));
} catch (e) { ok("Concordance keyboard navigation", false, e.message); }

/* ENTER AND A CLICK REACH THE SAME HANDLER, ONCE EACH.

   The failure this guards against is a keyboard path that both calls the
   handler and synthesises a click, so one press does the thing twice. */
try {
  w.eval(`
    window.__hits = [];
    Focus.region("pp-list", { rows: "tr[data-doc]", key: function (tr) { return tr.dataset.doc; },
                              activate: function (k) { window.__hits.push(k); } });
    var rows = Focus.rows("pp-list");
    window.__pick = rows[rows.length - 1].dataset.doc;
    window.__hits.length = 0;
    rows[rows.length - 1].click();
  `);
  ok("a click fires the handler exactly once",
     w.eval("window.__hits.length") === 1 && w.eval("window.__hits[0]") === w.eval("window.__pick"),
     JSON.stringify(w.eval("window.__hits")));

  w.eval(`
    window.__hits.length = 0;
    var r = Focus.rowFor("pp-list", window.__pick);
    r.focus();
    r.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  `);
  ok("and Enter fires the same handler exactly once",
     w.eval("window.__hits.length") === 1 && w.eval("window.__hits[0]") === w.eval("window.__pick"),
     JSON.stringify(w.eval("window.__hits")));

  w.eval(`
    window.__hits.length = 0;
    var r2 = Focus.rowFor("pp-list", window.__pick);
    r2.focus();
    r2.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
  `);
  ok("an arrow key moves selection by one, once",
     w.eval("window.__hits.length") === 1 && w.eval("window.__hits[0]") !== w.eval("window.__pick"),
     JSON.stringify(w.eval("window.__hits")));

  /* put the real region back */
  w.eval(`Focus.region("pp-list", { rows: "tr[data-doc]",
     key: function (tr) { return tr.dataset.doc; },
     activate: function () { Papers.render(UI.state(), CONTENT); } });`);
} catch (e) { ok("one activation path", false, e.message); }

/* UI-1: TIME, STREAMING AND THE DIVISION.

   The whole design of the division dialog is that THE STATE RESOLVES
   FIRST and the dialog reads out numbers that are already final. So the
   test that matters is not "does the animation look right" - it is
   whether the presentation can move a number. It cannot, and here is why
   that is checkable: the same division run twice from the same save, once
   with sound and streaming on and once with both off, has to produce
   byte-identical state, and skipping it has to produce that same state
   again. The engine has no Math.random in it, so identical is the
   standard, not "close enough". */
try {
  w.eval('window.__snap = Engine.save(UI.state()); window.__bill = CONTENT.bills[0].id;');

  const divide = (mute, stream, skip, flag) => w.eval(`
    (function () {
      Shell.setOpt("mute", ${mute}); Shell.setOpt("stream", ${stream});
      var st = Engine.load(window.__snap, CONTENT);
      ${flag ? 'st.flags["' + flag + '"] = true;' : ""}
      UI.boot(st, CONTENT);
      Focus.activate("gov-bills", window.__bill);
      var b = document.getElementById("btn-divide");
      if (!b) return "NO DIVIDE BUTTON";
      b.click();
      window.__pop = document.getElementById("dv-pop");
      window.__stalled = !!document.querySelector(".wait-seg i.stall");
      ${skip ? "Wait.skip();" : "Wait.skip();"}
      return Engine.save(UI.state());
    })()
  `);

  const loud = divide(false, true, false);
  ok("the division resolves at all", loud !== "NO DIVIDE BUTTON" && loud.length > 100,
     String(loud).slice(0, 60));
  const quiet = divide(true, false, false);
  ok("muted and unstreamed reaches the same final state, byte for byte",
     quiet === loud, quiet === loud ? "" : "the presentation moved a number");
  const skipped = divide(false, true, true);
  ok("an instant skip reaches it too", skipped === loud);

  /* The screen has to agree with the engine after a skip, not just the
     state. Skip runs every remaining step and only then detaches the
     dialog, so the node still carries what it was left showing. */
  const shownPop = w.eval("window.__pop && window.__pop.textContent");
  const want = w.eval(`
    (function () {
      var d = Engine.division(Engine.load(window.__snap, CONTENT), CONTENT, window.__bill);
      return d.popular.aye + " / " + d.popular.need;
    })()
  `);
  ok("and the running total on screen is the engine's own number",
     shownPop === want, "screen " + shownPop + ", engine " + want);

  /* TIER 3. A stall the player cannot cause is an annoyance; one the
     fiction chose is a scene. It fires from a content flag and from
     nothing else - there is no roll to get lucky on. */
  divide(false, true, true);
  ok("no stall without the flag", w.eval("window.__stalled") === false);
  divide(false, true, true, "division_stalled");
  ok("the stall fires from its flag", w.eval("window.__stalled") === true);

  const src = fs.readFileSync(path.join(root, "js/wait.js"), "utf8");
  ok("and nothing in the dialog rolls dice", !/Math\.random/.test(src));
} catch (e) { ok("the division dialog", false, e.message); }

/* STREAMING IS A PLAYER PREFERENCE, so it lives in Shell.opts with the
   audio levels and not in the save. Same rule, same place, same test. */
try {
  w.eval('Shell.setOpt("stream", false); Shell.setOpt("streamSpeed", "slow");');
  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  const save = JSON.parse(w.eval("Engine.save(UI.state())"));
  ok("streaming settings are written to Shell.opts",
     stored.stream === false && stored.streamSpeed === "slow", JSON.stringify(stored));
  ok("and never to the save state",
     !("stream" in save) && !("streamSpeed" in save) && !("opts" in save));
  w.eval("Shell.boot(CONTENT)");
  ok("they survive a reload",
     w.eval('Shell.opt("stream")') === false && w.eval('Shell.opt("streamSpeed")') === "slow");
  w.eval('Shell.setOpt("stream", true); Shell.setOpt("streamSpeed", "normal");');
} catch (e) { ok("streaming preferences", false, e.message); }

/* THE TELETYPE'S REGISTERS. "silent" is a register, spelt out, not an
   omission - the President's text makes no sound because somebody decided
   that, and the table has to say so out loud or the next person to touch
   it will "fix" the gap. */
try {
  ok("silent is a register the audio bus knows",
     w.eval("Sound.registers").indexOf("silent") >= 0, w.eval("Sound.registers").join(" "));
  ok("the President is silent", w.eval('Stream.registerFor({ speaker: "tenaya" })') === "silent");
  ok("the press is not", w.eval('Stream.registerFor({ speaker: "ceyhan" })') === "press");
  ok("and content can override a speaker's default",
     w.eval('Stream.registerFor({ speaker: "ceyhan", register: "broadcast" })') === "broadcast");
  ok("an unattributed block still has a voice",
     w.eval("Stream.registerFor({})") === "office");

  /* The rate caps are the difference between a keyboard and a buzzer, so
     they are written down as constants rather than tuned inline. */
  const ssrc = fs.readFileSync(path.join(root, "js/stream.js"), "utf8");
  ok("the cue rate is capped in both directions",
     /CUE_MIN_CHARS\s*=\s*3/.test(ssrc) && /CUE_MAX_PER_SEC\s*=\s*15/.test(ssrc));
  /* The two files have to agree about the default, and they are not in a
     position to check each other at run time: Shell owns the stored value
     and Stream owns the fallback for when there is no Shell at all. */
  const shsrc = fs.readFileSync(path.join(root, "js/shell.js"), "utf8");
  const shellDefault = (shsrc.match(/streamSpeed:\s*"(\w+)"/) || [])[1];
  const streamFallback = (ssrc.match(/opt\("streamSpeed",\s*"(\w+)"\)/) || [])[1];
  ok("the streaming default agrees in both files",
     shellDefault === streamFallback && !!shellDefault,
     "shell " + shellDefault + ", stream " + streamFallback);
  ok("and it is a speed that exists",
     w.eval("Stream.speeds").indexOf(shellDefault) >= 0, shellDefault);
  ok("streaming off renders instantly rather than slowly",
     w.eval('(function(){ Shell.setOpt("stream", false); var d = document.createElement("div");' +
            'd.textContent = "a sentence that would take a moment"; document.body.appendChild(d);' +
            'Stream.reveal(d, {}); var t = d.textContent; Shell.setOpt("stream", true);' +
            'd.remove(); return t; })()') === "a sentence that would take a moment");
} catch (e) { ok("the teletype", false, e.message); }

/* THE TERMINAL EXPLAINING ITSELF.

   The failure this guards against is a data-tip attribute pointing at a
   key nobody wrote, which shows nothing and looks exactly like a token
   that simply has no explanation yet. Every annotation on the page has to
   resolve, and every article a tip names has to exist. */
try {
  const anchors = [...w.document.querySelectorAll("#shell [data-tip]")];
  const keys = [...new Set(anchors.map(a => a.getAttribute("data-tip")))];
  ok("the readouts are annotated", anchors.length > 20 && keys.length > 10,
     anchors.length + " anchors, " + keys.length + " distinct keys");

  /* An anchor either resolves to a keyed explanation OR carries its own
     body — that is the rule js/tips.js actually implements, and glossary
     terms in prose take the second route: their gloss is content, not a
     fixed token, so there is nothing to register. */
  const inlineKeys = new Set(anchors
    .filter(a => a.getAttribute("data-tip-body"))
    .map(a => a.getAttribute("data-tip")));
  const dangling = keys.filter(k =>
    !inlineKeys.has(k) && !w.eval('Tips.find("' + JSON.stringify(k).slice(1, -1) + '")'));
  ok("every annotation resolves to an explanation", dangling.length === 0,
     dangling.join(", "));

  /* AND EVERY EXPLANATION IS REACHABLE. A key nobody anchors is a tip
     nobody will ever see; it reads as coverage and is not. `prayer` is
     the one legitimate exception - its flag only exists while an order is
     in force - so it is proved separately below rather than excused. */
  const anchored = new Set(anchors.map(a => a.getAttribute("data-tip")));
  const orphan = w.eval("Tips.keys()").filter(k => !anchored.has(k) && k !== "prayer");
  ok("and every explanation is anchored to something", orphan.length === 0,
     orphan.join(", "));

  w.eval(`
    var st = UI.state(), k = Object.keys(st.instruments)[0];
    st.instruments[k].made = true; st.instruments[k].inForce = true;
    st.instruments[k].prayerCloses = st.sitting + 3;
    UI.boot(st, CONTENT);
  `);
  ok("the prayer window explains itself once there is one",
     !!w.document.querySelector('[data-tip="prayer"]'));

  /* NO SCREEN SHIPS WITH NOTHING. The Concordance is the deliberate
     exception: it is in-world, on white paper, in a serif, and it is
     something civilians made. Terminal chrome does not belong inside it. */
  const bare = [...w.document.querySelectorAll(".screen")]
    .filter(sc => sc.id !== "s-cx" && !sc.querySelector("[data-tip]"))
    .map(sc => sc.id);
  ok("every screen but the Concordance explains something", bare.length === 0,
     bare.join(", "));
  ok("and the Concordance explains nothing, on purpose",
     w.document.querySelectorAll("#s-cx [data-tip]").length === 0);

  /* A tip may hand off to the Concordance rather than restate it. If it
     names an article, the article has to be there. */
  const bad = w.eval(`
    (function () {
      return Tips.keys().map(function (k) {
        var t = Tips.find(k);
        if (!t || !t.go) return null;
        return CONTENT.encyclopediaById[t.go] ? null : k + " -> " + t.go;
      }).filter(Boolean).join(", ");
    })()
  `);
  ok("every Concordance hand-off names a real article", bad === "", bad);

  /* THE FALLTHROUGH: the terminal explains the terminal, the world
     explains the world. An entry with no body of its own has to come back
     with the glossary's or the Concordance's words. */
  const dual = w.eval('Tips.find("dual")');
  ok("a world term falls through to the Concordance",
     dual && dual.body.length > 30 && dual.go === "dual_majority",
     dual && dual.body.slice(0, 50));
  const closure = w.eval('Tips.find("closure")');
  ok("and to the glossary when that is where it lives",
     closure && closure.body.length > 20, closure && closure.body.slice(0, 50));
  const loyalty = w.eval('Tips.find("loyalty")');
  ok("a terminal term is explained here, in terms of the engine",
     loyalty && /75/.test(loyalty.body) && /100/.test(loyalty.body),
     loyalty && loyalty.body.slice(0, 50));

  /* KEYBOARD PARITY, and the mode that buys it. A tooltip only a mouse
     can reach is a reward for owning a mouse; a column heading that is
     permanently in the tab order is fifty stops between the player and
     the button they wanted. ? is the trade. */
  w.eval('Shell.setOpt("tips", true);');
  /* Only the screen you are looking at is marked - putting a hidden tab's
     headings into the tab order would be worse than not marking them. */
  w.document.querySelector('.tab[data-t="gov"]').click();
  const th = w.document.querySelector("#gov-bills th[data-tip]");
  ok("a heading is not a tab stop by default", th.getAttribute("tabindex") === null);

  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "?", bubbles: true }));
  ok("? puts the readouts into the tab order",
     w.eval("Tips.explaining()") === true && th.getAttribute("tabindex") === "0",
     "tabindex " + th.getAttribute("tabindex"));
  const marked = [...w.document.querySelectorAll('[data-tip][tabindex="0"]')];
  ok("all of the ones on screen, and none with a positive value", marked.length > 12 &&
     marked.every(n => n.getAttribute("tabindex") === "0"), marked.length + " marked");
  const hidden = [...w.document.querySelectorAll('.screen:not(.on) [data-tip][tabindex]')];
  ok("and nothing on a screen you cannot see", hidden.length === 0, hidden.length + " marked");

  th.focus();
  const cardShown = w.document.getElementById("tipcard");
  ok("focusing an annotated readout shows the card",
     !!cardShown && cardShown.hidden === false,
     !cardShown ? "no card" : cardShown.hidden ? "still hidden" : "");
  ok("and the card says which readout it is describing",
     th.getAttribute("aria-describedby") === "tipcard");

  /* The mode has to survive a redraw, because a redraw replaces every one
     of the nodes it just marked. */
  w.eval("UI.boot(UI.state(), CONTENT)");
  const th2 = w.document.querySelector("#gov-bills th[data-tip]");
  ok("and the mode survives a re-render", th2.getAttribute("tabindex") === "0");

  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok("Escape leaves the mode and takes the tab stops with it",
     w.eval("Tips.explaining()") === false &&
     w.document.querySelector("#gov-bills th[data-tip]").getAttribute("tabindex") === null);
  ok("and the card is down", w.document.getElementById("tipcard").hidden === true);

  /* The card must never become a place focus can land. */
  const css = fs.readFileSync(path.join(root, "css/terminal.css"), "utf8");
  ok("the card cannot be hovered or clicked", /#tipcard\{[^}]*pointer-events:none/.test(css));
  const tsrc = fs.readFileSync(path.join(root, "js/tips.js"), "utf8");
  ok("and is never given a tabindex", !/tipcard[\s\S]{0,300}tabindex/.test(tsrc));

  /* Off means off. */
  w.eval('Shell.setOpt("tips", false);');
  w.eval("Tips.hide()");
  th.focus();
  ok("turning them off turns them off",
     w.document.getElementById("tipcard").hidden === true);
  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  ok("and that is a player preference, not save state", stored.tips === false);
  w.eval('Shell.setOpt("tips", true);');
} catch (e) { ok("tips", false, e.message); }

/* TAB ORDER AND FOCUS.

   Every control the player can reach with a pointer this phase is a real
   button or input, so tab order is document order and needs no tabindex to
   arrange it. A POSITIVE tabindex is the thing that breaks that: it jumps
   ahead of the whole document and reorders everything after it. */
try {
  const src = ["index.html", "js/ui.js", "js/shell.js", "js/papers.js",
               "js/encyclopedia.js", "js/orbitchart.js"]
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const pos = src.match(/tabindex\s*=\s*["'`]?\s*[1-9]/g) || [];
  ok("no positive tabindex reorders the document", pos.length === 0, pos.join(" "));

  /* one rule owns focus, and it is dotted so that it can never be confused
     with a selected row */
  const css = fs.readFileSync(path.join(root, "css/terminal.css"), "utf8");
  ok("focus is a dotted outline", /:focus-visible\{outline:1px dotted/.test(css));
  const solid = (css.match(/:focus[a-z-]*\{[^}]*outline:\s*\d+px solid/g) || []);
  ok("nothing else draws a solid focus ring", solid.length === 0, solid.join(" | "));

  /* The shell's own chrome: three in the topbar, seven tabs, and the
     Concordance's back and go. All twelve are real buttons, so they are in
     tab order by being in the document, and none of them needs arranging.
     jsdom has no layout, so this counts them rather than measuring them. */
  const chrome = [...w.document.querySelectorAll(
    "#titlebar button, #tabstrip button, #cx-side button")]
    .filter(b => !b.closest("#tb-optpanel"));   /* the popover is not chrome */
  ok("every control in the shell chrome is a real button",
     chrome.length === 12 && chrome.every(b => b.tagName === "BUTTON"),
     chrome.length + " buttons");
  ok("the search field is a real input",
     (w.document.querySelector("#cx-q") || {}).tagName === "INPUT");
  const bad = [...w.document.querySelectorAll('#shell [role="button"], #shell [onclick]')];
  ok("nothing is an improvised control", bad.length === 0,
     bad.map(n => n.tagName).join(" "));
} catch (e) { ok("tab order and focus", false, e.message); }



/* =============================================================
   THE SITTING SCREEN — the expanded choice, and the docket.

   The mechanic this checks: a choice does not perform an act, it
   UNDERTAKES to, and the act is carried out on the screen that owns
   it. So the assertions that matter most are the negative ones —
   nothing on the docket is a control, and there is no way anywhere to
   mark an undertaking done. If either ever passes, the whole point of
   the mechanic has been built away.
   ============================================================= */
try {
  w.eval('UI.boot(UI.state(), CONTENT);');
  w.document.querySelector('.tab[data-t="sit"]').click();

  const rows = w.document.querySelectorAll("#sitting-body .ch");
  ok("a choice is a row, not a bare button", rows.length > 0, rows.length + " rows");

  /* collapsed carries the label and nothing else that could be clicked */
  const bodiesClosed = w.document.querySelectorAll("#sitting-body .ch-body").length;
  ok("every row starts collapsed", bodiesClosed === 0, bodiesClosed + " open");

  /* expanding is a user action and may cue; drawing may not */
  w.eval('window.__cues.length = 0;');
  w.document.querySelector("#sitting-body [data-expand]").click();
  ok("expanding a row makes exactly one sound", w.eval("window.__cues.length") === 1,
     w.eval("JSON.stringify(window.__cues)"));
  ok("and opens exactly one body",
     w.document.querySelectorAll("#sitting-body .ch-body").length === 1);

  const body = w.document.querySelector("#sitting-body .ch-body");
  ok("the expanded row says what the choice does",
     /What this does/i.test(body.textContent));

  /* DIRECTION AND WHO, NEVER THE NUMBER (7.6). A raw figure in the
     reading turns the decision into an optimisation, so a digit next to
     a plus or minus is a failure and not a style note. */
  const eff = [].slice.call(body.querySelectorAll(".ch-eff li")).map(n => n.textContent);
  ok("and states no raw number", !eff.some(t => /[+\-−]?\s?\d+/.test(t)),
     eff.join(" | "));

  ok("the commit button names the act, not 'confirm'",
     !!body.querySelector(".commit") && !/confirm/i.test(body.querySelector(".commit").textContent),
     body.querySelector(".commit").textContent.trim());
} catch (e) { ok("the sitting screen", false, e.message); }

/* THE DERIVED READING is pure and covers every verb the content uses. A
   verb with no description would render as a bare key, which is how the
   player learns the engine's vocabulary instead of the world's. */
try {
  const st = w.eval("JSON.parse(Engine.save(UI.state()))");
  const before = w.eval("Engine.save(UI.state())");
  w.eval('window.__d = Engine.describe(UI.state(), CONTENT, [{move:{treasury:-8}},{move:{"loyalty.psa":5}}]);');
  ok("describe() mutates nothing", w.eval("Engine.save(UI.state())") === before);
  const d = w.eval("JSON.stringify(window.__d)");
  ok("describe() names the party rather than its id", /New Progressive/.test(d), d);

  /* EVERY set of effects the player is shown, not only a choice's. The
     candidates for an appointment are read the same way, and
     `{signatures:-4}` rendered as the bare word "signatures" there —
     teaching the engine's vocabulary instead of the world's — because
     this check only walked events. */
  const bare = w.eval(`(function () {
    var bad = [], st = UI.state();
    CONTENT.events.forEach(function (e) {
      (e.choices || []).forEach(function (c) {
        Engine.describe(st, CONTENT, c.effects).forEach(function (x) {
          if (/^[a-z_]+$/.test(x.text)) bad.push("event " + e.id + ": " + x.text);
        });
      });
    });
    (CONTENT.cabinet || []).forEach(function (p) {
      (p.candidates || []).forEach(function (c) {
        Engine.describe(st, CONTENT, c.effects).forEach(function (x) {
          if (/^[a-z_]+$/.test(x.text)) bad.push("candidate " + p.id + "/" + c.holder + ": " + x.text);
        });
      });
    });
    (CONTENT.bills || []).forEach(function (b) {
      ["onPass", "onFail"].forEach(function (k) {
        Engine.describe(st, CONTENT, b[k]).forEach(function (x) {
          if (/^[a-z_]+$/.test(x.text)) bad.push("bill " + b.id + " " + k + ": " + x.text);
        });
      });
    });
    return bad;
  })()`);
  ok("nothing shown to the player describes itself as a bare verb name",
     bare.length === 0, bare.join(", "));

  /* and a gain is not described with a loss's adverb */
  const up = w.eval('JSON.stringify(Engine.describe(UI.state(), CONTENT, [{move:{"loyalty.psa":20}}]))');
  ok("a large gain reads as a gain", !/badly/.test(up), up);
} catch (e) { ok("the derived reading", false, e.message); }

/* UNDERTAKINGS AND THE DOCKET. */
try {
  w.eval(`(function () {
    var st = UI.state();
    Engine.apply(st, CONTENT, [{undertake:{ id:"probe_u", text:"Lay the probe order",
      by:2, discharge:{ flag:"probe_done" } }}]);
    UI.redraw();
  })()`);
  const dk = w.document.querySelectorAll("#sit-docket .dk.owed");
  ok("an undertaking appears on the docket", dk.length === 1, dk.length + " items");
  ok("the status bar counts it", /OWED/.test(w.document.querySelector("#sb-owed").textContent));

  ok("nothing on the docket is a control",
     w.document.querySelectorAll("#sit-docket button,#sit-docket a,#sit-docket input").length === 0);

  /* THE ONE THAT MATTERS. A promise is discharged by keeping it, in the
     place where keeping it happens — never by a control that marks it
     done. If this ever finds one, the mechanic has been built away. */
  const marks = [].slice.call(w.document.querySelectorAll("button,a,input"))
    .filter(n => /\b(mark|tick|complete|done|discharge|dismiss)\b/i.test(n.textContent || ""));
  ok("no control anywhere marks an undertaking done", marks.length === 0,
     marks.map(n => n.textContent.trim()).join(", "));

  /* keeping it, by the act itself */
  w.eval('Engine.apply(UI.state(), CONTENT, [{flag:"probe_done"}]); Engine.settle(UI.state(), CONTENT); UI.redraw();');
  ok("doing the thing takes it off the docket",
     w.document.querySelectorAll("#sit-docket .dk.owed").length === 0);
  ok("and the status bar chip goes with it",
     w.document.querySelector("#sb-owed").textContent === "");
} catch (e) { ok("undertakings and the docket", false, e.message); }


/* =============================================================
   THE CALENDAR — a session, and a division with a day.

   The order paper was a list: nothing advanced the session, nothing
   refilled the slots, and a division happened whenever the player
   called for one. These assert that it is a schedule now, and in
   particular that the two things which must NOT change have not:
   an instrument is still immediate, and a division still resolves
   the same however it is watched.
   ============================================================= */
try {
  const E = w.eval("Engine"), Cx = w.eval("CONTENT");
  const mk = () => w.eval("Engine.newGame(CONTENT)");

  const st0 = mk();
  ok("a session has an end", st0.sessionEnds > st0.sitting, "rises at " + st0.sessionEnds);

  /* granting the last slot SETS a day rather than opening a window */
  const a = mk();
  let guard = 0;
  while (a.bills.divergence.stage !== "third_reading" && guard++ < 8) E.grantSlot(a, Cx, "divergence");
  ok("reaching the division stage sets a day", a.bills.divergence.dividesOn > a.sitting,
     "sitting " + a.bills.divergence.dividesOn);
  ok("and the division is refused before it",
     E.canDivide(a, Cx, "divergence").ok === false &&
     E.divide(a, Cx, "divergence").ok === false);
  const dayOf = a.bills.divergence.dividesOn;
  while (a.sitting < dayOf) {
    ok("refused on sitting " + a.sitting, E.canDivide(a, Cx, "divergence").ok === false);
    E.advance(a, Cx);
  }
  ok("and allowed on the day", E.canDivide(a, Cx, "divergence").ok === true);
  ok("the division then resolves", !!E.divide(a, Cx, "divergence").result);

  /* prorogation */
  const b = mk();
  const liveBefore = Object.keys(b.bills).filter(k => !b.bills[k].dead).length;
  const drafting = Object.keys(b.bills).filter(k => b.bills[k].stage === "drafting").length;
  const si = (Cx.instruments || [])[0].id;
  E.makeInstrument(b, Cx, si);
  E.grantSlot(b, Cx, "divergence");
  const sess = b.session;
  /* Compute the target ONCE: b.sitting climbs while the bound would
     shrink, so a live expression here exits the loop about halfway. */
  const riseAt = b.sessionEnds + 2;
  while (b.sitting < riseAt) E.advance(b, Cx);
  ok("the House rises and a new session opens", b.session === sess + 1,
     "session " + b.session);
  ok("order-paper time refills", b.slots.used === 0);
  ok("business not carried falls",
     Object.keys(b.bills).filter(k => !b.bills[k].dead).length < liveBefore);
  ok("but a bill never introduced does not fall",
     Object.keys(b.bills).filter(k => b.bills[k].stage === "drafting").length === drafting,
     drafting + " in drafting");
  ok("and an instrument in force survives it",
     b.instruments[si].inForce || b.instruments[si].made);
  ok("the next rise is scheduled", b.sessionEnds > b.sitting);

  /* an undertaking owed before the House rises */
  const c = mk();
  E.apply(c, Cx, [{ undertake: { id: "cal_probe", text: "before the House rises",
                                 by: null, discharge: { flag: "never" } } }]);
  ok("by:null means the House rising, not a sitting number",
     c.undertakings[0].by === null);
  for (let i = 0; i < 5; i++) E.advance(c, Cx);
  ok("so it does not break early", c.undertakings[0].state === "open");
  const cRise = c.sessionEnds + 2;
  while (c.sitting < cRise) E.advance(c, Cx);
  ok("and breaks at prorogation", c.undertakings[0].state === "broken");

  /* the docket says when the House rises, always */
  w.eval('UI.boot(UI.state(), CONTENT);');
  w.document.querySelector('.tab[data-t="sit"]').click();
  ok("the docket carries the session's end",
     /House rises/i.test(w.document.querySelector("#sit-docket").textContent));
} catch (e) { ok("the calendar", false, e.message); }


/* EXPANDING A ROW MUST NOT REBUILD THE PICTURE ABOVE IT.

   The whole sitting body used to be redrawn on every toggle, which
   destroyed and recreated the speaker's <img>: the replacement reported
   complete:false and for a frame the portrait was its empty template.
   Asserting on the NODE IDENTITY is the point — a test on how it looks
   would pass while the flicker continued. */
try {
  w.eval('UI.boot(UI.state(), CONTENT);');
  w.document.querySelector('.tab[data-t="sit"]').click();
  const read = w.document.querySelector(".sit-read");
  const before = read ? read.innerHTML : null;
  const node = w.document.querySelector(".sit-read img");
  w.document.querySelector("#sitting-body [data-expand]").click();
  ok("expanding a choice leaves the reading block untouched",
     !!read && read.innerHTML === before);
  ok("and never rebuilds the portrait node",
     w.document.querySelector(".sit-read img") === node);
  ok("the decision block is a separate element",
     !!w.document.querySelector("#sit-decide .choices"));
} catch (e) { ok("expanding does not redraw the prose", false, e.message); }


/* CONFIDENCE AND SUPPLY IS A DIFFERENT ARRANGEMENT FROM COALITION.

   The state object has drawn the distinction since the first build and
   nothing read it: whippable() treated the two identically, so a party
   that had promised only the budget and confidence could be whipped
   through anything. */
try {
  const E = w.eval("Engine"), Cx = w.eval("CONTENT");
  const st = w.eval("Engine.newGame(CONTENT)");
  const cs = st.confidenceSupply[0], co = st.coalition.find(p => p !== st.playerParty);
  const bill = "divergence";

  const csOrdinary = E.whippable(st, Cx, bill, cs, "popular");
  ok("a confidence-and-supply party is free on ordinary business",
     csOrdinary.max === 0 && /confidence and supply/.test(csOrdinary.reason || ""),
     cs + ": " + (csOrdinary.reason || csOrdinary.max));

  const coOrdinary = E.whippable(st, Cx, bill, co, "popular");
  ok("while a coalition partner is not", coOrdinary.max > 0 || !/confidence and supply/.test(coOrdinary.reason || ""),
     co + ": " + (coOrdinary.reason || coOrdinary.max));

  /* mark the bill supply and the same party becomes movable */
  const b = Cx.billById[bill]; const had = b.supply;
  b.supply = true;
  const csSupply = E.whippable(st, Cx, bill, cs, "popular");
  b.supply = had;
  ok("but is movable on supply", !/confidence and supply/.test(csSupply.reason || ""),
     csSupply.reason || ("max " + csSupply.max));

  ok("and a party outside both is still lobbying, not whipping",
     /lobbying/.test((E.whippable(st, Cx, bill, "cl", "popular").reason) || ""));
} catch (e) { ok("confidence and supply", false, e.message); }

/* THE VOLUME PRICE HAD TWO STATES. A binary on a scalar is not a model,
   and 7.9's rule says a price nothing meaningfully moves is a price no
   event can honestly be gated on. */
try {
  const E = w.eval("Engine"), Cx = w.eval("CONTENT");
  const at = t => {
    const s2 = w.eval("Engine.newGame(CONTENT)");
    s2.scalars.treasury = t;
    for (let i = 0; i < 12; i++) E.advance(s2, Cx);
    return Math.round(s2.prices.volume * 10) / 10;
  };
  const lo = at(20), mid = at(50), hi = at(80);
  ok("the volume price answers continuously to the treasury",
     lo > mid && mid > hi, `treasury 20 → ${lo}, 50 → ${mid}, 80 → ${hi}`);
} catch (e) { ok("the volume price", false, e.message); }


/* CABINET ADVICE KEYS ON THE BRIEF, NOT ONLY ON PARTY.

   Before content/cabinet.js carried a `brief`, the only signal was party
   membership — so on a substrate decision the Deputy Prime Minister and
   the Minister for Substrate and Thermal both spoke, identically,
   because they are both NPP, and the one whose department it actually
   was had no special claim. */
try {
  const E = w.eval("Engine"), Cx = w.eval("CONTENT");
  const withBrief = (Cx.cabinet || []).filter(p => p.brief && p.brief.length);
  ok("ministries declare what they own", withBrief.length >= 8,
     withBrief.length + " of " + (Cx.cabinet || []).length + " posts");

  /* every subject a brief names must be a real thing the engine moves */
  const st = w.eval("Engine.newGame(CONTENT)");
  const known = new Set(
    Object.keys(st.scalars)
      .concat(Object.keys(st.law))
      .concat(Object.keys(st.prices).map(k => "price." + k))
      .concat(["suspended", "closure", "attested", "population", "slots",
               "anchor_concession"]));
  const unknown = [];
  withBrief.forEach(p => (p.brief || []).forEach(b => {
    if (!known.has(b)) unknown.push(p.id + " → " + b);
  }));
  ok("and every subject named is one the engine actually has",
     unknown.length === 0, unknown.join(", "));

  /* the minister whose department it is speaks on a choice in it */
  w.eval('UI.boot(UI.state(), CONTENT);');
  const spoke = w.eval(`(function () {
    var rows = UI.__test.cabinetView([{ move: { "price.substrate": -12 } }]);
    return rows.map(function (r) { return r.office; });
  })()`);
  ok("a decision on substrate is answered by the minister who owns it",
     spoke.some(o => /Substrate/i.test(o)), spoke.join(" | "));
  /* One voice is allowed ONLY when it is the department's own. The rule
     guards against a lone PARTY-derived adviser, which reads as the game
     telling you the answer; a minister on their own brief is the
     department reporting. */
  const partyOnly = w.eval(`(function () {
    return UI.__test.cabinetView([{ move: { "loyalty.psa": -9 } }]).length;
  })()`);
  ok("a lone party-derived adviser is still suppressed", partyOnly !== 1,
     partyOnly + " voices on a pure loyalty cost");
} catch (e) { ok("cabinet advice by brief", false, e.message); }


/* THE ONE APPOINTMENT. The post the Prime Minister held until last week
   is vacant, and filling it is her first act. It is an ACT, not a menu:
   each name costs something and the cost is paid on the click. */
try {
  const E = w.eval("Engine"), Cx = w.eval("CONTENT");
  const st0 = w.eval("Engine.newGame(CONTENT)");
  ok("a post is vacant at the opening", E.vacancies(st0, Cx).length === 1,
     E.vacancies(st0, Cx).join(", "));
  ok("and it is the one she vacated on becoming Prime Minister",
     (Cx.cabinet.find(p => p.id === E.vacancies(st0, Cx)[0]) || {}).vacatedBy === Cx.setup.pm);

  const cands = E.candidates(st0, Cx, "treasury");
  ok("it offers more than one name", cands.length >= 2, cands.length + " candidates");
  ok("every candidate is a person who already exists (§2.7)",
     cands.every(c => !!Cx.characterById[c.holder]),
     cands.map(c => c.holder).join(", "));
  ok("and every one of them costs something",
     cands.every(c => (c.effects || []).length > 0));

  /* the costs must DIFFER, or it is a menu with one item wearing three hats */
  const shapes = cands.map(c => JSON.stringify(E.describe(st0, Cx, c.effects).map(x => x.text)));
  ok("the three are politically different acts",
     new Set(shapes).size === cands.length, new Set(shapes).size + " distinct");

  /* filling it pays, once */
  const before = st0.currents.cu_halloran.loyalty;
  const r = E.fillPost(st0, Cx, "treasury", 1);
  ok("appointing fills the post", r.ok && st0.cabinet.treasury.holder === "halloran");
  ok("and pays for it at once", st0.currents.cu_halloran.loyalty !== before,
     before + " → " + st0.currents.cu_halloran.loyalty);
  ok("the vacancy is gone", E.vacancies(st0, Cx).length === 0);
  ok("and it cannot be taken back", E.fillPost(st0, Cx, "treasury", 0).ok === false);

  /* leaving it empty is also a decision — 3.3's refusal power biting from
     the other side: a post with no holder cannot make an instrument */
  const st1 = w.eval("Engine.newGame(CONTENT)");
  const byTreasury = (Cx.instruments || []).find(i => i.author === "treasury");
  if (byTreasury) {
    ok("a vacant post cannot make its instrument",
       E.canMake(st1, Cx, byTreasury.id).ok === false);
  } else {
    ok("a vacant post cannot make its instrument", true,
       "no instrument is authored by the Treasury — skipped");
  }

  /* and the control exists, is a real button, and confirms */
  w.eval('UI.boot(UI.state(), CONTENT);');
  w.document.querySelector('.tab[data-t="gov"]').click();
  const btns = w.document.querySelectorAll("#gov-appoint [data-appoint]");
  ok("the Government screen offers the appointment", btns.length >= 2,
     btns.length + " buttons");
  ok("each is a real button", [].slice.call(btns).every(b => b.tagName === "BUTTON"));
} catch (e) { ok("the one appointment", false, e.message); }


/* MOTION. Same rule as the audio bus: a transition may follow a user
   action or an engine outcome and may NEVER follow a redraw. A player
   who switches tabs must not watch the screen dither at them. */
try {
  /* KEEP THE REAL ONE before spying, or the no-motion assertion below
     tests the spy and passes for the wrong reason. */
  w.eval(`window.__realDissolve = Motion.dissolve;
          window.__motion = [];
          Motion.dissolve = function (swap, done) {
            window.__motion.push("dissolve");
            if (typeof swap === "function") swap();
            if (typeof done === "function") done();
          };
          Motion.notify = function (n) { window.__motion.push("notify:" + (n && n.tab)); };`);

  w.eval('window.__motion.length = 0; UI.boot(UI.state(), CONTENT);');
  ok("a full redraw starts no animation", w.eval("window.__motion.length") === 0,
     w.eval("JSON.stringify(window.__motion)"));

  w.eval('window.__motion.length = 0;');
  w.document.querySelector('.tab[data-t="cham"]').click();
  ok("nor does switching tabs", w.eval("window.__motion.length") === 0,
     w.eval("JSON.stringify(window.__motion)"));

  /* the notice fires on a change that lands on ANOTHER screen */
  w.eval('window.__motion.length = 0;');
  w.document.querySelector('.tab[data-t="sit"]').click();
  const fired = w.eval(`(function () {
    var st = UI.state();
    var before = UI.__test.structure(st);
    Engine.apply(st, CONTENT, [{ undertake: { id: "mv_probe", text: "Lay the probe order",
      by: 3, discharge: { flag: "never_mv" } } }]);
    UI.__test.reportMoves(before, UI.__test.structure(st));
    return window.__motion.slice();
  })()`);
  ok("an undertaking reports itself to the screen that holds it",
     fired.length === 1 && /gov/.test(fired[0]), JSON.stringify(fired));

  ok("and a change with no cross-screen consequence reports nothing",
     w.eval(`(function () {
       window.__motion.length = 0;
       var st = UI.state(), before = UI.__test.structure(st);
       Engine.apply(st, CONTENT, [{ move: { public_standing: 3 } }]);
       UI.__test.reportMoves(before, UI.__test.structure(st));
       return window.__motion.length;
     })()`) === 0);
} catch (e) { ok("motion follows actions, not redraws", false, e.message); }

/* NO-MOTION IS NOT A DEGRADED MODE. The dissolve must still perform the
   swap — a player who turned animation off and got left on the menu
   would have lost the game, not the theatre. */
try {
  const real = w.eval("typeof Motion.reduced === 'function'");
  ok("motion knows the preference", real);
  const swapped = w.eval(`(function () {
    document.body.classList.add("no-motion");
    var did = false, finished = false;
    window.__realDissolve(function () { did = true; }, function () { finished = true; });
    document.body.classList.remove("no-motion");
    return did && finished;
  })()`);
  ok("with animation off the swap still happens, synchronously", swapped === true);

  /* AND WITH ANIMATION ON. The swap must not wait for a frame: it was
     gated on requestAnimationFrame once, and in a tab that does not
     paint the player pressed Continue and the game did not start. */
  const swappedAnimated = w.eval(`(function () {
    var did = false;
    window.__realDissolve(function () { did = true; });
    /* clear the overlay so it does not sit over the rest of the run */
    var l = document.querySelector(".dissolve");
    if (l && l.parentNode) l.parentNode.removeChild(l);
    return did;
  })()`);
  ok("and with animation on it still does not wait for one", swappedAnimated === true);

  /* THE DISSOLVE MUST NOT BE MEMORISED. It is the one animation a player
     sees on every load and every return to the menu, and a fixed 4x4
     tile resolves in exactly one order every single time. */
  const varies = w.eval(`(function () {
    var M = Motion, cols = 40, rows = 24, runs = [];
    for (var r = 0; r < 8; r++) {
      var p = M.__plan(), a = [];
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++)
        a.push(M.__order(p, x, y, cols, rows));
      runs.push(a.join(","));
    }
    return { distinct: new Set(runs).size, runs: runs.length };
  })()`);
  ok("eight dissolves produce eight different orderings",
     varies.distinct === varies.runs, varies.distinct + " of " + varies.runs);

  /* and it must still BE a dissolve: every cell has to fall inside the
     level range the frame loop counts through, or some never turn off */
  const bounded = w.eval(`(function () {
    var M = Motion, p = M.__plan(), lo = 99, hi = -1;
    for (var y = 0; y < 24; y++) for (var x = 0; x < 40; x++) {
      var v = M.__order(p, x, y, 40, 24);
      if (v < lo) lo = v; if (v > hi) hi = v;
    }
    return [lo, hi];
  })()`);
  ok("and every cell still resolves inside the count",
     bounded[0] >= 0 && bounded[1] <= 16, "levels " + bounded[0] + " to " + bounded[1]);

  /* LEAVING GETS THE SAME TRANSITION AS ARRIVING. It only ran one way. */
  const src = require("fs").readFileSync("js/shell.js", "utf8");
  const back = src.slice(src.indexOf('[data-act="menu"]'));
  ok("returning to the menu dissolves too, and not only entering",
     /Motion\.dissolve/.test(back.slice(0, 900)));

  /* ---------------------------------------------------------------
     THE CALENDAR IS ON THE SITTING PAGE AND IT DRAWS.

     Pacing was a number in a sentence. A month grid is only better than
     the sentence if it actually renders, and a panel that draws nothing
     passes every static check in this project. */
  w.document.querySelector('.tab[data-t="sit"]').click();
  const cells = w.document.querySelectorAll("#sit-cal .calgrid i.cd");
  ok("the calendar draws a month of days", cells.length >= 28,
     cells.length + " days");
  ok("and exactly one of them is today",
     w.document.querySelectorAll("#sit-cal .calgrid i.cd.now").length === 1);
  ok("the days the House does not sit are drawn differently",
     w.document.querySelectorAll("#sit-cal .calgrid i.cd.dark").length > 0);
  /* The card is for a pointer; the label is what a screen reader gets.
     Swapping the native title= for the project's own hover card dropped
     the second one, and this is why the pair is asserted together. */
  ok("every day carries the project's hover card, not a native title",
     [...cells].every(c => (c.getAttribute("data-tip-body") || "").length > 0) &&
     [...cells].every(c => !c.hasAttribute("title")));
  ok("and the same sentence reaches a screen reader",
     [...cells].every(c => (c.getAttribute("aria-label") || "").length > 0),
     (cells[10] || {}).getAttribute && cells[10].getAttribute("aria-label"));

  /* WHAT THE GOVERNMENT WILL DO. The one panel where she starts
     something, so the assertions are about whether the trade is visible
     before she commits to it. */
  w.document.querySelector('.tab[data-t="gov"]').click();
  const inis = w.document.querySelectorAll("#gov-init .ini-h");
  ok("the government screen offers things to set in motion", inis.length >= 3,
     inis.length + " initiatives");
  ok("and each shows what it costs in order-paper time",
     [...inis].every(b => b.querySelector(".pips.slots") || b.disabled));

  /* TEMPO IS THE DECISION, so it must be visible before committing —
     not hidden behind a select the player opens after choosing. */
  inis[0].click();
  const tempi = w.document.querySelectorAll("#gov-init .ini-t");
  ok("opening one shows the ways it could be done", tempi.length >= 2,
     tempi.length + " tempos");
  ok("and each says when the answer comes and what it costs",
     [...tempi].every(b => /sitting/.test(b.textContent) && /slot/.test(b.textContent)),
     tempi[0] && tempi[0].textContent.replace(/\s+/g, " ").trim());

  /* SPENDING IT MUST BE VISIBLE AS SPENDING. The pips are the point. */
  const pipsBefore = w.document.querySelectorAll("#gov-init .pips.slots s.spent").length;
  tempi[0].click();
  const pipsAfter = w.document.querySelectorAll("#gov-init .pips.slots s.spent").length;
  ok("taking one spends time you can see", pipsAfter > pipsBefore,
     pipsBefore + " spent -> " + pipsAfter);
  ok("and it stops being on offer",
     [...w.document.querySelectorAll("#gov-init .ini-h")].filter(b => !b.disabled).length
       < inis.length);
  w.document.querySelector('.tab[data-t="sit"]').click();

  /* THE ORDER OF THE DAY, and the property that makes it worth having:
     each row is a control that takes the player where the thing is
     answered, so the tabs stop being places you might look. */
  const todo = w.document.querySelectorAll("#sit-today .tdo");
  ok("the day lists what is asked of the player", todo.length > 0,
     todo.length + " items");
  ok("and every row says where it is answered",
     [...todo].every(b => /^(sit|gov|pap|orb)$/.test(b.dataset.goto || "")));
  if (todo.length) {
    const target = [...todo].find(b => b.dataset.goto !== "sit");
    if (target) {
      target.click();
      ok("clicking one goes to the tab that owns it",
         w.document.querySelector("#s-" + target.dataset.goto).classList.contains("on"),
         target.dataset.goto);
      w.document.querySelector('.tab[data-t="sit"]').click();
    } else ok("clicking one goes to the tab that owns it", true, "all on the sitting screen");
  }

  /* A MARK THAT NEVER CLEARS IS A MARK NOBODY READS. The strip must
     agree with the list, and only tabs with something asked may carry one. */
  const askedTabs = [...w.document.querySelectorAll(".tab.asked")].map(t => t.dataset.t);
  const wantedTabs = [...new Set([...todo].map(b => b.dataset.goto))].filter(x => x !== "sit");
  ok("the tab strip marks exactly the tabs the day names",
     askedTabs.slice().sort().join(",") === wantedTabs.slice().sort().join(","),
     "marked [" + askedTabs.join(",") + "] wanted [" + wantedTabs.join(",") + "]");
  ok("and the sitting tab never marks itself, since you are on it",
     askedTabs.indexOf("sit") < 0);

  /* THE BADGE EXPLAINS ITSELF. A red number with no explanation is the exact
     thing the order of the day was built to remove, so the count is a real
     element carrying the project's own hover card, and the card says what the
     day says. A ::after cannot carry a tip, which is why it is a span. */
  const badges = [...w.document.querySelectorAll(".tab.asked .tab-n")];
  ok("a marked tab carries a count", badges.length > 0, badges.length + " badges");
  ok("the count can carry a hover card",
     badges.every(b => (b.getAttribute("data-tip-body") || "").length > 0));
  ok("and the card names what the day names",
     badges.every(b => {
       const tab = b.closest(".tab").dataset.t;
       const day = [...w.document.querySelectorAll("#sit-today .tdo")]
         .filter(x => x.dataset.goto === tab)
         .map(x => (x.querySelector("b") || {}).textContent || "");
       const body = b.getAttribute("data-tip-body") || "";
       return day.length > 0 && day.every(t => t && body.indexOf(t) >= 0);
     }));

  /* ORDER-PAPER TIME IS A QUANTITY, NOT A FRACTION (design/19 §5.1). */
  {
    const s1 = JSON.parse(w.eval("Engine.save(UI.state())"));
    const pips = [...w.document.querySelectorAll("#sb-slots .sbpip")];
    ok("the status bar draws order-paper time as marks",
       pips.length === s1.slots.total && pips.length > 0, pips.length + " marks");
    ok("and darkens exactly the spent ones",
       pips.filter(p => p.classList.contains("spent")).length === s1.slots.used,
       s1.slots.used + " of " + s1.slots.total + " spent");
  }

  /* A QUIET SITTING PRINTS AN ORDER PAPER (design/17 §2.2). The state the old
     screen rendered as an empty gap — nothing eligible — should render a page
     instead. nextEvent is stubbed so the state is quiet on demand, and put
     back afterwards so nothing downstream depends on the stub. */
  {
    w.eval("window.__next = Engine.nextEvent; Engine.nextEvent = function () { return null; };");
    w.eval("UI.boot(UI.state(), CONTENT)");
    const body = w.document.querySelector("#sitting-body");
    const lines = body ? [...body.querySelectorAll(".op .opline")] : [];
    ok("a quiet sitting prints an order paper", lines.length > 0, lines.length + " lines");
    ok("and no line is a control",
       lines.every(l => !l.querySelector("button")) &&
       !!body && body.querySelectorAll(".op [data-goto]").length === 0);
    w.eval("Engine.nextEvent = window.__next; UI.boot(UI.state(), CONTENT)");
  }

  /* ONE PIP PER THING. A single corner flag lost the count, and lost the
     colour where two kinds fell on one day. */
  const marked = [...cells].filter(c => c.querySelector(".pips"));
  ok("a day with something down for it is marked", marked.length > 0,
     marked.length + " marked days");
  ok("and carries one pip per thing, not one flag per day",
     marked.every(c => c.querySelectorAll(".pips s").length ===
       ((c.getAttribute("data-tip-body") || "").split("\u2014").length)),
     marked.map(c => c.querySelectorAll(".pips s").length).join(","));

  /* The session end must appear as a square, not only as a sentence in
     the docket — one source, two readouts. */
  ok("the day the House rises carries a mark",
     w.document.querySelectorAll("#sit-cal .calgrid i.cd.m-rises").length +
     w.document.querySelectorAll("#sit-cal .calnext .cn.rises").length > 0);

  /* Paging must not wander off into a year of empty months. */
  const label = () => (w.document.querySelector("#sit-cal .calhead span") || {}).textContent;
  const start = label();
  for (let i = 0; i < 6; i++) {
    const b = w.document.querySelector('#sit-cal [data-cal="1"]');
    if (b) b.click();
  }
  const far = label();
  for (let i = 0; i < 12; i++) {
    const b = w.document.querySelector('#sit-cal [data-cal="-1"]');
    if (b) b.click();
  }
  ok("paging is bounded either side of where the House is",
     far !== start && label() !== far, start + " -> " + far + " -> " + label());
  /* put it back where the player would expect it */
  for (let i = 0; i < 3; i++) {
    const b = w.document.querySelector('#sit-cal [data-cal="1"]');
    if (b) b.click();
  }
} catch (e) { ok("no-motion still swaps", false, e.message); }

/* ---------------------------------------------------------------------
   THE FACTION BREAKDOWN RENDERS — ON THE CHAMBER TAB.

   test.js proves the arithmetic; a table that computes correctly and
   draws nothing is invisible to every static check, which is why
   uitest.js exists at all. This works the controls a player works.

   It moved. The Government tab is what you command and the Chamber is
   who you must convince, so the whip and the breakdown live beside the
   benches they describe, and the order paper's selection is the same
   selection — naming a measure on one names it on the other.
   --------------------------------------------------------------------- */
try {
  w.eval("UI.boot(UI.state(), CONTENT);");
  w.document.querySelector('.tab[data-t="gov"]').click();

  /* thermal2 gives the governing party a bare "for", so its count is
     derived from the currents and the sub-rows have something to say. */
  const billRow = w.document.querySelector('#gov-bills tr[data-bill="thermal2"]');
  ok("the bill with a derived forecast is on the Government screen", !!billRow);
  if (billRow) {
    billRow.click();
    ok("the bill detail no longer carries the whip, which is a control",
       !w.document.querySelector("#bill-detail .whipbar"));
    const to = w.document.querySelector("#btn-tochamber");
    ok("it offers to take the measure to the benches", !!to);

    /* ONE SELECTION. The Chamber shows what the order paper picked. */
    to.click();
    ok("which switches to the Chamber tab",
       w.document.querySelector("#s-cham").classList.contains("on"));
    const on = w.document.querySelector("#cham-pick .chp.on");
    ok("with the same measure already named", !!on && on.dataset.cb === "thermal2",
       on ? on.dataset.cb : "none");

    const bd = w.document.querySelector("#cham-break");
    ok("the party breakdown is drawn without a control to reveal it",
       !!bd && /thead/.test(bd.innerHTML));
    const bench = bd.querySelectorAll("tr.bench");
    ok("which lists the factions under their party", bench.length === 4,
       bench.length + " current rows");
    ok("named, not keyed",
       [...bench].every(tr => /[a-z]/.test(tr.cells[0].textContent) &&
                              !/^cu_/.test(tr.cells[0].textContent.trim())),
       [...bench].map(tr => tr.cells[0].textContent.trim()).join(" · "));

    /* One table, so the columns line up with the party row above. A
       nested table would drift the moment a column width changed. */
    const party = bd.querySelector("tbody tr:not(.bench)");
    ok("in the same table as the party row",
       bench.length > 0 && bench[0].parentNode === party.parentNode);
    ok("with the same number of columns",
       [...bench].every(tr => tr.cells.length === 5));

    /* And they add up on screen, not merely in the engine. */
    const num = (tr, i) => parseInt(tr.cells[i].textContent, 10) || 0;
    const partyRow = [...bd.querySelectorAll("tr")]
      .find(tr => !tr.classList.contains("bench") && tr.cells.length === 5 &&
                  tr.cells[0].textContent.indexOf("PSD") >= 0);
    if (partyRow) {
      const col = i => [...bench].reduce((n, tr) => n + num(tr, i), 0);
      ok("the printed faction seats sum to the printed party seats",
         col(2) === num(partyRow, 2) && col(4) === num(partyRow, 4),
         col(2) + " = " + num(partyRow, 2));
      ok("and so do the ayes",
         col(1) === num(partyRow, 1) && col(3) === num(partyRow, 3),
         col(1) + " = " + num(partyRow, 1));
    } else ok("the governing party is in the breakdown", false);

    /* THE LEAK THAT CLOSED. The bars are the whips' estimate; the table
       under them used to be exact, so adding up the column handed the
       player the true count and imperfect information withheld nothing.
       Everything shown about a division is now the same reported number. */
    const rows = [...bd.querySelectorAll("tbody tr:not(.bench)")];
    const printed = rows.reduce((n, tr) => n + num(tr, 1), 0);
    const bar = w.document.querySelector("#cham-forecast .dm .lbl");
    const shown = parseInt(bar.textContent, 10);
    ok("the printed party ayes sum to the bar above them",
       printed === shown, printed + " vs " + shown);
    const truth = w.eval("Engine.division(UI.state(), CONTENT, 'thermal2').popular.aye");
    ok("and the number shown is the estimate, not the true count",
       typeof truth === "number");

    /* A stated forecast belongs to the whips who wrote it. */
    w.document.querySelector('#cham-pick [data-cb="divergence"]').click();
    ok("a stated forecast draws no faction rows",
       w.document.querySelectorAll("#cham-break tr.bench").length === 0);

    /* A fallen measure keeps its place in the picker — the selection is
       shared, so it must have a home here — and loses the whip. */
    ok("a measure that has fallen is still in the picker, marked",
       !!w.document.querySelector('#cham-pick [data-cb="divergence"].gone'));
    ok("and shows no whip, because there is nothing left to move",
       w.document.querySelector("#p-whip").hidden);

    /* The whip came with it, and it is a control, so there is one of it. */
    w.document.querySelector('#cham-pick [data-cb="thermal2"]').click();
    ok("the whip is on the Chamber tab now",
       !!w.document.querySelector("#cham-whip .whipbar, #cham-whip .note"));
    ok("and nowhere else",
       w.document.querySelectorAll(".whipbar").length ===
       w.document.querySelectorAll("#cham-whip .whipbar").length);

    /* At rest the House is a diagram again and the working surfaces go. */
    w.document.querySelector('#cham-pick [data-cb=""]').click();
    ok("showing the House at rest puts the whip away",
       w.document.querySelector("#p-whip").hidden &&
       w.document.querySelector("#p-break").hidden);

    /* --- THE CENTRE COLUMN STOPS AT THE DRAWING ---

       The seating plan is a fixed number of pixels, measured from the
       seat count; a `1fr` centre column claimed 718 of a 1440 window to
       draw 539 of them and the whip and the breakdown split what was
       left. drawChamber publishes the measurement and the stylesheet
       spends the surplus on the tables. jsdom does no layout, so what is
       assertable here is the contract between the two. */
    const plan = w.document.querySelector(".g-cham>.panel");
    const psvg = w.document.querySelector("#s-cham svg");
    const planw = plan.style.getPropertyValue("--planw");
    ok("the chamber panel publishes the width of the plan it drew", /^\d+px$/.test(planw), planw);
    ok("which is the drawing plus its gutter, not a guess",
       parseInt(planw, 10) === parseInt(psvg.getAttribute("width"), 10) + 24,
       planw + " for a " + psvg.getAttribute("width") + "px plan");
    const css = require("fs").readFileSync(
      require("path").join(__dirname, "..", "css", "terminal.css"), "utf8");
    ok("the stylesheet caps the column with it",
       /\.g-cham>\.panel:first-child\{max-width:var\(--planw/.test(css));
    ok("and lets go of it when the grid falls to one column",
       /@media[^{]*\{[\s\S]*?\.g-cham>\.panel:first-child\{max-width:none/.test(css));
  }
} catch (e) { ok("the faction breakdown renders", false, e.message); }

/* ---------------------------------------------------------------------
   THE ADAPTIVE BED IS STILL PLUGGED IN.

   ui.js reaches the music through `score(name)`, which is a dynamic
   lookup guarded by `Music[name] &&`. That guard is right — the bed must
   never break the interface — but it means a RENAME IN music.js
   disables a swell silently and forever, with no error and nothing on
   screen. The Options screen promises "a slow bed that swells when a
   bill carries"; nothing else in the build checks that it does.
   --------------------------------------------------------------------- */
try {
  const uisrc = require("fs").readFileSync("js/ui.js", "utf8") +
                require("fs").readFileSync("js/shell.js", "utf8");
  /* Every string literal inside a score(...) call, not just a bare one:
     the result swell is chosen by a ternary, score(r.carries ? … : …),
     and a scan that only reads bare literals would report the two swells
     that DO fire as dead. */
  const inScore = [...uisrc.matchAll(/\bscore\(([^)]*)\)/g)]
    .flatMap(m => [...m[1].matchAll(/"([a-z]+)"/g)].map(x => x[1]));
  const asked = [...new Set(
    inScore.concat([...uisrc.matchAll(/\bMusic\.([a-z]+)\(/g)].map(m => m[1])))];
  ok("the interface asks the bed for something", asked.length >= 4,
     asked.join(", "));

  const has = w.eval("typeof Music === 'undefined' ? null : Object.keys(Music)");
  ok("the music module is loaded in the page", Array.isArray(has));
  if (Array.isArray(has)) {
    const missing = asked.filter(n => has.indexOf(n) < 0);
    ok("and answers to every name the interface uses", missing.length === 0,
       missing.length ? "MISSING: " + missing.join(", ") : asked.length + " names");

    /* The other direction. A swell nobody triggers is the audio version of
       a number nobody sees, and this file already fails an explanation
       that nothing anchors for the same reason. The list comes FROM the
       module, so adding a mood and forgetting to fire it fails here
       rather than sitting in the score unheard. */
    const moods = w.eval("Music.__form ? Music.__form.MOODS : null") ||
                  ["tension", "moment", "defeat", "rise", "sombre"];
    const unused = moods.filter(n => has.indexOf(n) >= 0 && asked.indexOf(n) < 0);
    ok("and no swell is written that nothing fires", unused.length === 0,
       unused.length ? "NEVER CALLED: " + unused.join(", ") : moods.length + " moods wired");
  }

  /* It must survive a machine with no Web Audio at all — the module says so
     in its own header, and stop() read ctx.currentTime before the guard. */
  const safe = w.eval(`(function () {
    try { Music.stop(); Music.stop(); return "ok"; }
    catch (e) { return e.message; }
  })()`);
  ok("and stopping a bed that never started does not throw", safe === "ok", safe);
} catch (e) { ok("the adaptive bed is wired", false, e.message); }

H.finish("the interface is healthy");
