/* =============================================================
   UI — rendering only. No game rules live here.
   Reads state, writes DOM, calls Engine for anything decided.
   ============================================================= */

const UI = (function () {
  "use strict";

  let st, C, currentEvent = null, lastResult = null, cxCurrent = "perigee_charter";
  /* The seat whose detail row is open in the orbit list, and the station it
     was opened under. A station change resets the open row to the selected
     seat; the player can close it by clicking it again. */
  let consOpen = null, consOpenAt = null;
  /* WHICH PARTY IN THE COMPOSITION TABLE IS SHOWING ITS CURRENTS. A view
     preference for the session, not world state, so it lives here and not in
     the save. One at a time: the panel has room for one, and a table with
     every party opened is the tall column this was meant to fix. */
  let compOpen = null;
  /* The functional tier opens in place the same way a seat does. One id,
     because only one row can be open and the alternative is a column of
     detail rows with no relationship to what is above them. */
  let funcOpen = null;
  /* And an instrument opens in place. One id, for the same reason. */
  let siOpen = null;
  /* WHILE THE COUNT RUNS, the chamber screen presents the bill AS IT WAS
     when the division was called. The engine resolves the division on the
     click (a division is skippable, so the arithmetic must be final before
     the presentation), but the ORDER PAPER, the bill panel and the whip
     must not paint the result before the tellers read it: that is the
     spoiler. Renderers read the bill through bsOf(); the state itself is
     untouched. */
  let countFreeze = null;
  const bsOf = id => (countFreeze && countFreeze.id === id)
    ? Object.assign({}, st.bills[id], countFreeze) : st.bills[id];

  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const sw = col => `<i class="swatch" style="background:${col}"></i>`;
  /* The party mark in the lists and panels: the colour block. The logo is
     reserved for the places with room for it, the constituency dossier and
     the Concordance, through logoMark(). */
  /* AND IT SAYS WHOSE IT IS. Twelve parties is more colours than anyone
     memorises, and the order paper's owner column is a swatch with no
     name beside it at all. The card is data rather than a keyed token, so
     it carries the live seat count and where the party stands. */
  /* A PARTY HOVER IS A WIKIPEDIA HOVER, NOT A RESTATEMENT.

     It used to say the party's name and where it sat, which is a caption
     for a colour rather than an explanation of a party: a reader already
     looking at "Freehold Party 17" learned nothing from a card that said
     Freehold Party, 17 seats. It now carries the party's own note — what
     it is FOR, which is the only thing the screen never says — its logo,
     and a hand-off to its Concordance article.

     The tip is on the NAME as well as the swatch (see pname). A four-pixel
     square is a hard target and the wrong one; the name is what a reader
     reaches for. */
  function partyTip(id) {
    const p = C && C.partyById && C.partyById[id];
    if (!p) return "";
    return ` data-tip-title="${esc(p.name)}"` +
           ` data-tip-body="${esc(partyLine(id))}"` +
           /* img/logos, not img/parties — the first version pointed at a
              directory that does not exist, the onerror removed the node,
              and the card simply had no picture with nothing to say so. */
           (p.logo ? ` data-tip-img="img/logos/${esc(p.logo)}"` : "") +
           ` data-tip-go="${esc(p.id)}"`;
  }

  const mark = id => {
    const p = C && C.partyById && C.partyById[id];
    if (!p) return sw(pc(id));
    return `<i class="swatch" style="background:${pc(id)}"${partyTip(id)}></i>`;
  };

  /* The party's name, annotated. Use this wherever a name is printed for a
     reader rather than packed into a table cell that already has a tip. */
  const pname = (id, text) =>
    `<a class="pnm" tabindex="0" data-go="${esc(id)}"${partyTip(id)}>` +
    `${esc(text != null ? text : pn(id))}</a>`;
  function partyLine(id) {
    const seats = Engine.partyTotal(st, id);
    const loy = (st.parties[id] || {}).loyalty;
    const role = id === st.playerParty ? "The Prime Minister's party."
      : st.coalition.indexOf(id) >= 0 ? "In the coalition."
      : st.confidenceSupply.indexOf(id) >= 0 ? "Confidence and supply."
      : "Opposition.";
    const p = (C.partyById || {})[id] || {};
    /* The note first: what the party is for is the thing a reader cannot
       get off the screen, and the seat count is the thing they already
       have. Standing after, as the annotation. */
    return (p.note ? p.note + " " : "") +
      role + " " + seats + " seat" + (seats === 1 ? "" : "s") +
      (id !== st.playerParty && loy != null ? ", loyalty " + loy + "." : ".");
  }
  const logoMark = (id, cls) => {
    const p = C.partyById[id];
    const file = p && (p.wordmark || p.logo);
    if (!file) return sw(pc(id));
    return `<img class="dith plogo${cls ? " " + cls : ""}" src="img/logos/${file}" alt=""` +
      ` onerror="this.replaceWith(Object.assign(document.createElement('i'),` +
      `{className:'swatch',style:'background:${p.colour}'}))">`;
  };
  const pc = id => (C.partyById[id] || {}).colour || "var(--chrome-dk)";
  const pn = id => (C.partyById[id] || {}).name || id;
  const ps = id => (C.partyById[id] || {}).short || id;

  /* Office badges. An office is a one-word mark on the seat table, not a job
     title — `role` carries the title. The key belongs to content; the label
     and the class are presentation's, which is why this map lives here and not
     in the engine. The Speaker is not in it: the Chair is a property of the
     seat (`speaker:true`), because it belongs to the House, not the person. */
  const OFFICE = {
    pm:         ["PM", "pm"],
    deputy:     ["Deputy PM", "dep"],
    minister:   ["Minister", "min"],
    opposition: ["Opposition Leader", "opp"],
    shadow:     ["Shadow", "shadow"],
    leader:     ["Leader", "leader"],
    whip:       ["Whip", "whip"]
  };

  /* Autosave. Shell owns slots; if it is not loaded (the editor, a test
     harness) this is a no-op rather than an error. */
  const saved = () => { if (typeof Shell !== "undefined") Shell.autosave(); };

  let wired = false;

  /* ---------- the terminal's own scrollbar ----------

     Firefox cannot bevel a scrollbar, and on some systems its bar is an
     overlay that runs under the rightmost column. On an engine with no
     ::-webkit-scrollbar to style, the panels that scroll get a drawn bar in
     the terminal's own chrome: the native one is hidden and the track takes
     a column of its own, so nothing is ever covered. Engines that can bevel
     keep their native bar, which already matches. The track only lifts when
     the body actually overflows. */
  function decorateScrollers(root, force) {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    root = root || document;
    let bevel = false;
    try { bevel = !!(window.CSS && CSS.supports && CSS.supports("selector(::-webkit-scrollbar)")); }
    catch (e) { bevel = false; }
    /* FORCED, the element gets the drawn bar on any engine. The division
       list in the caption is the one scroller that is built after boot and
       inside a control the terminal does not otherwise wrap, so it asked for
       the drawn bar by name rather than inheriting the engine's own. */
    if (bevel && !force) return;
    /* A MARKER CLASS, NOT A LIST OF PANELS.

       This named two orbit panels by selector, so every scrolling body
       added afterwards silently got the OS bar while orbit had a drawn
       one — the hardcoded-list fault this repo has been bitten by twice
       already. Anything that scrolls inside the terminal's chrome now
       says `.scrolls` in the markup and gets the drawn bar for free. */
    const sel = force ? ".scrolls.forcebar" : ".scrolls";
    root.querySelectorAll(sel).forEach(box => {
      if (box._sb) return;
      box._sb = true;
      const wrap = document.createElement("div");
      wrap.className = "sbwrap";
      box.parentNode.insertBefore(wrap, box);
      wrap.appendChild(box);
      const track = document.createElement("div");
      track.className = "sbar";
      const thumb = document.createElement("i");
      thumb.className = "sbar-thumb";
      track.appendChild(thumb);
      wrap.appendChild(track);
      const sync = () => {
        const over = box.scrollHeight - box.clientHeight;
        if (over <= 1) { track.style.display = "none"; return; }
        track.style.display = "";
        const th = Math.max(26, Math.round(box.clientHeight * box.clientHeight / box.scrollHeight));
        thumb.style.height = th + "px";
        thumb.style.top = Math.round((box.scrollTop / over) * (box.clientHeight - th)) + "px";
      };
      box.addEventListener("scroll", sync, { passive: true });
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(sync);
        ro.observe(box);
        if (box.firstElementChild) ro.observe(box.firstElementChild);
      }
      thumb.addEventListener("pointerdown", e => {
        e.preventDefault();
        const y0 = e.clientY, top0 = box.scrollTop;
        const range = box.scrollHeight - box.clientHeight;
        const travel = box.clientHeight - thumb.offsetHeight;
        const move = ev => { box.scrollTop = top0 + (ev.clientY - y0) * range / (travel || 1); };
        const up = () => {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
        };
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", up);
      });
      sync();
    });
  }

  function boot(state, content) {
    st = state; C = content;
    currentEvent = null; lastResult = null;
    /* Shell re-boots on every load, and both of these are EDGE triggers
       against the previous state. Carrying them across a load would fire
       a cadence for a session the player never sat through, or swallow
       the knell for a government that has already fallen. */
    lastSession = null; fallen = false; lastSigBand = null; ended = null;
    if (wired) { drawAll(); reveal(); return; }   /* Shell re-boots on every load */
    wired = true;
    document.querySelectorAll(".tab").forEach(t =>
      t.addEventListener("click", () => openTab(t.dataset.t)));

    /* THE TERMINAL'S OWN CLICK, delegated once.

       Every control in the game is a real button or a row with a click
       handler, so one listener at the document gives all of them a voice
       and keeps the audio bus out of every render function. Registered on
       pointerdown rather than click so the sound lands with the press, and
       in the capture phase so a handler that stops propagation is still
       audible. A disabled control answers differently, which is the only
       feedback a disabled control can give. */
    document.addEventListener("pointerdown", e => {
      const t = e.target.closest && e.target.closest(
        "button, [data-station], [data-bill], [data-doc], [data-go]");
      if (!t) return;
      cue(t.disabled ? "deny" : t.classList.contains("tab") ? "tab" : "click");
    }, true);
    /* Saving, loading and starting a game belong to Shell now — they are
       session concerns, not rendering ones, and they live in the topbar. */

    /* THE THREE TABLES WHOSE ROWS ARE CONTROLS. A region is the container,
       how to find its rows, what identifies one, and what activating it
       does. Focus owns the selection and the keyboard from here; this
       file keeps the knowledge of what a bill or a station is, which is
       the only reason the fallbacks are functions and not strings. */
    Focus.region("cham-bills", {
      rows: "tr[data-bill]",
      key: tr => tr.dataset.bill,
      fallback: () => (C.bills[0] || {}).id,
      /* The whole panel, not just the detail. drawBill renders #bill-detail
         alone, so activating from it left the list's own highlight on the
         previous row - which is how the hardcoded one went unnoticed for so
         long. The renderer owns .sel; the way to move it is to re-render. */
      /* drawStatus too: the ambient line names the open bill, so a
         selection that does not refresh it leaves the status bar
         describing the bill you just navigated away from. */
      /* And the Chamber, which is coloured for whatever the order paper
         has picked. One selection, two views: leaving the House drawn for
         the previous measure is the same bug as the stale highlight. */
      /* Choosing a measure IS naming it to the House, so it re-arms the
         plan. Without this, one press of "show the House at rest" left
         every later selection drawing an uncoloured chamber and hiding
         the whip, with the order paper insisting a bill was open. */
      activate: () => { chamberBare = false; drawChamber(); drawStatus(); }
    });
    /* The party list is a region like the order paper: its rows are
       controls, it carries .sel, and the selection has to survive a
       re-render by KEY rather than by index. */
    Focus.region("party-table", {
      rows: "tr[data-party]",
      key: tr => tr.dataset.party,
      fallback: () => ((C.parties || [])[0] || {}).id,
      activate: () => drawParties()
    });
    Focus.region("orbit-table", {
      rows: "tr[data-station]",
      key: tr => tr.dataset.station,
      fallback: () => (C.stations[0] || {}).id,
      activate: id => pickStation(id)
    });
    /* The seat list is a region too: it selects, and the dossier beside the
       schematic shows the one highlighted. A key left over from another
       station falls back to the first seat of this one. */
    Focus.region("cons-table", {
      rows: "tr[data-cons]",
      key: tr => tr.dataset.cons,
      fallback: () => {
        const sid = Focus.selected("orbit-table");
        const mine = (C.constituencies || []).filter(k => k.station === sid);
        return (mine[0] || {}).id;
      },
      activate: id => pickConstituency(id)
    });
    /* The functional tier is a region too. It uses the seat list's own
       pattern — a row that opens under itself — rather than the hover card it
       used to carry: a card cannot be read with a keyboard, cannot stay open
       while you compare two seats, and put the tier's whole information
       budget in a mechanism the player has to discover. */
    Focus.region("func-table", {
      rows: "tr[data-func]",
      key: tr => tr.dataset.func,
      fallback: () => ((C.functional || [])[0] || {}).id,
      activate: id => pickFunctional(id)
    });
    Focus.wire();
    /* Both capture their own skip listeners; both are no-ops without a
       document. Neither is ever called from a draw function. */
    if (typeof Stream !== "undefined") Stream.wire();
    if (typeof Wait !== "undefined") Wait.wire();
    if (typeof Tips !== "undefined") Tips.wire();
    decorateScrollers();

    /* THE CONCORDANCE, in one function instead of four copies of it.
       Every way of getting to an article - a link in the body, a link in
       the nav, the search box, the back button - ends here, and the
       article takes focus afterwards so a keyboard reader lands at the
       top of what they just opened rather than at the top of the page. */
    const goCx = (id, push) => {
      if (!id) return;
      cxCurrent = id;
      Focus.around(() => Concordance.render(st, C, cxCurrent, push));
      $("#cx-body").scrollTop = 0;      /* after the restore, deliberately */
      const a = $("#cx-article"); if (a) a.focus({ preventScroll: true });
    };
    const goSearch = () => {
      const q = $("#cx-q").value;
      const found = Concordance.hits(q);
      if (found.length === 1) goCx(found[0].id, true);
      else if (found.length) Concordance.renderHits(found, q);
      else $("#cx-q").select();
    };
    $("#cx-goto").addEventListener("click", goSearch);
    $("#cx-q").addEventListener("keydown", e => { if (e.key === "Enter") goSearch(); });
    /* Capture, because the article this is on is about to be replaced. */
    document.getElementById("cx-body").addEventListener("click", e => {
      const g = e.target.closest("[data-go]");
      if (g) goCx(g.dataset.go, true);
    }, true);
    /* A CROSS-REFERENCE FROM ANYWHERE ELSE IN THE GAME. Both handlers
       above are scoped inside the Concordance, so a [data-go] anywhere
       else — a party name on the Chamber tab, say — had no handler at all
       and did nothing at all. It switches to the Concordance and opens the
       article, which is what the attribute has always promised.

       Scoped OUT of #cx-body and #cx-nav so it cannot double-fire with
       them: two listeners for one action is the trap CLAUDE.md records
       from the last time [data-go] was bound twice. */
    /* ASK THE CONCORDANCE, DO NOT KEEP A LIST. This whitelisted parties,
       stations and hand-written articles, so a cross-reference to anything the
       Concordance GENERATES — a constituency, an anchor, a foreign actor, a
       foreign body — fell through and did nothing, which is the fault the
       attribute exists to fix. `Concordance.knows` is the one source of truth
       for what has an article, and every generated id is in it. */
    const cxKnows = id =>
      typeof Concordance !== "undefined" && Concordance.knows
        ? Concordance.knows(id) : false;
    document.addEventListener("click", e => {
      const g = e.target.closest && e.target.closest("[data-go]");
      if (!g || g.closest("#cx-body") || g.closest("#cx-nav")) return;
      if (!cxKnows(g.dataset.go)) return;
      e.preventDefault();
      const tab = document.querySelector('.tab[data-t="cx"]');
      if (tab) tab.click();
      goCx(g.dataset.go, true);
    });
    /* And by keyboard, since these are focusable. */
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const g = e.target.closest && e.target.closest("[data-go]");
      if (!g || g.closest("#cx-body") || g.closest("#cx-nav")) return;
      if (!cxKnows(g.dataset.go)) return;
      e.preventDefault(); g.click();
    });

    $("#cx-back").addEventListener("click", () => goCx(Concordance.back(), false));
    /* ONE listener for the whole nav, extended rather than joined by a
       second: the category headers collapse the list, and binding them
       separately is how [data-go] came to fire twice. */
    document.getElementById("cx-nav").addEventListener("click", e => {
      const cat = e.target.closest("[data-cxcat]");
      if (cat) {
        Concordance.toggleCat(cat.dataset.cxcat);
        cue("click");
        Concordance.render(st, C, cxCurrent, false);
        return;
      }
      const g = e.target.closest("[data-go]");
      if (g) goCx(g.dataset.go, true);
    });
    /* and by keyboard, since the headers are focusable */
    document.getElementById("cx-nav").addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const cat = e.target.closest("[data-cxcat]");
      if (!cat) return;
      e.preventDefault(); cat.click();
    });

    drawAll();
    reveal();     /* AFTER drawAll, and outside it. Once per event. */
  }

  /* EVERY REDRAW GOES THROUGH Focus.around. This is the one place that
     needs to know it: twenty-five containers are about to be replaced,
     and whatever the player had hold of has to be given back afterwards.
     Nested redraws - a bill detail inside a government redraw - are
     absorbed by the wrapper's own depth count, so the capture happens
     once on the outside and not four times. */
  function drawAll() {
    Focus.around(() => {
      /* A tip is positioned in viewport coordinates against a node that is
         about to be replaced. Take it down first. */
      if (typeof Tips !== "undefined") Tips.hide();
      drawTitle(); drawPrices(); drawReceipts(); drawEconomy(); drawEconomyReal(); drawParties(); drawExport(); drawGovernment(); drawSitting(); drawChamber(); drawFunctional(); drawOrbit(); drawLog(); drawSandbox(); drawStatus();
      if (typeof Concordance !== "undefined") Concordance.render(st, C, cxCurrent, false);
      if (typeof Papers !== "undefined") Papers.render(st, C);
      /* The globe only redraws when it is the screen the player is on: it is
         the one expensive drawing in the game and a hidden tab does not need
         it. Switching to it draws it. */
      if (screen === "world") drawWorld();
      /* the annotated nodes are all new, so explain mode has to be put
         back onto them */
      if (typeof Tips !== "undefined") Tips.remark();
    });
    /* The same-screen flash runs after the redraw, never before it. */
    if (pendingMoves) {
      flashChanged(pendingMoves.before, pendingMoves.after);
      pendingMoves = null;
    }
    /* A redraw is also the end of any frozen presentation. The count's own
       steps repaint the plan directly and never call drawAll, so in play
       the freeze lives exactly from the click to the declaration; if a
       redraw happens anyway, the freeze goes with it rather than leaving
       the bill stuck presenting the pre-division state. */
    countFreeze = null;
  }

  /* ---------- title / status ---------- */
  function drawTitle() {
    /* HOW LONG IS LEFT, WHERE THE CLOCK ALREADY IS. design/19: a player who
       asks "how long until the House rises" should be able to answer by
       looking. It was answerable on one panel of one tab; the topbar is on
       every tab and already carries the sitting, so the count belongs beside
       it. Order-paper time is the currency that cannot be topped up (bible
       7.7) and this is the only place that says how much of it is left. */
    const rise = st.sessionEnds != null
      ? " / RISES IN " + Math.max(0, st.sessionEnds - st.sitting + 1) : "";
    $("#tb-sys").textContent = `SESS ${st.session} / SITTING ${String(st.sitting).padStart(3, "0")} / ${st.date}${rise}`;
  }
  function drawStatus() {
    const conf = Engine.confidence(st), maj = Engine.majority(st);
    $("#sb-conf").textContent = `CONFIDENCE ${conf}/${Engine.chamberTotal(st)}`;
    $("#sb-margin").textContent = `MARGIN ${conf - maj >= 0 ? "+" : ""}${conf - maj}`;
    $("#sb-thermal").textContent = `THERMAL ${st.scalars.thermal_margin}%`;
    $("#sb-chapter").textContent = `CHAPTER ${st.chapter}`;
    /* THE CLOCK, ON EVERY SCREEN (design/26 #88). The session's end is the one
       deadline that governs everything else on the board — order-paper time
       refills when the House rises, business not carried falls, and every
       undertaking due "before the House rises" comes due at once — and it was
       only ever visible on the calendar, on one tab, halfway down a column.
       It is a chip in the status bar now, and it turns red inside three. */
    const rise = $("#sb-rise");
    if (rise) {
      if (st.sessionEnds == null) { rise.textContent = ""; }
      else {
        const left = st.sessionEnds - st.sitting;
        rise.textContent = left <= 0 ? "RISE TODAY" : `RISE IN ${left}`;
        rise.style.color = left <= 3 ? "var(--alert)" : "";
      }
    }
    /* ORDER-PAPER TIME AS MARKS, NOT A FRACTION (design/19 §5.1). "4 of 6" is
       a number; six marks with two dark is a quantity the eye has before it
       reads. The tooltip still says what the marks mean. */
    const sUsed = st.slots.used, sTot = st.slots.total;
    $("#sb-slots").innerHTML = "SLOTS" + Array.from({ length: sTot }, (_, i) =>
      `<i class="sbpip${i < sUsed ? " spent" : ""}"></i>`).join("");
    $("#sb-slots").classList.toggle("none", sUsed >= sTot);
    $("#sb-sig").textContent = `SIGNATURES ${st.signatures || 0}/9`;
    $("#sb-sig").style.color = (st.signatures || 0) >= 7 ? "var(--alert)" : "";
    /* OUTSTANDING UNDERTAKINGS. Absent when there are none, rather than
       showing a zero: this is the thing that makes rising cost
       something, and a permanent "OWED 0" is furniture. */
    const owedN = Engine.outstanding(st);
    const ow = $("#sb-owed");
    if (ow) {
      ow.textContent = owedN.length ? "OWED " + owedN.length : "";
      ow.style.display = owedN.length ? "" : "none";
      ow.style.color = owedN.some(u => u.by - st.sitting <= 1) ? "var(--alert)" : "";
    }
    const loss = Engine.checkLoss(st, C);
    $("#sb-state").textContent = loss.lost ? "GOVERNMENT FALLEN: " + loss.reason.toUpperCase() : "READY";
    $("#sb-state").style.color = loss.lost ? "var(--alert)" : "";
    setStatus(ambient(), "ambient");
  }

  /* ---------- the status line ----------

     One line, three sources, in a fixed priority. Deciding the priority
     once, here, is the point of the whole thing: without it every feature
     that wants to say something writes over whatever the last one said.

       1  transient   what the player just did. Wins, briefly.
       2  referral    D.3 contextual referral - the section of the induction
                      pack that covers what is on screen. NOTHING WRITES
                      THIS YET. Part D has never been built, so the slot is
                      a hook and not a feature: it exists so that when the
                      induction pack lands it has a defined place in the
                      priority, rather than a fight with the ambient line.
       3  ambient     what the terminal is looking at.

     setStatus is the only writer of #sb-msg, and each level has exactly one
     owner: transient is written by the handlers for player actions, ambient
     by drawStatus, referral by nobody. Two writers on one level is how a
     status bar turns into a race. */
  const STATUS = { transient: "", referral: "", ambient: "" };
  let statusTimer = null, screen = "sit";

  /* THE ONE PLACE A TAB IS OPENED. The click handler calls it, the shell
     calls it when a government opens, and nothing else reaches into .tab
     or .screen — two ways to open a tab is the [data-go] trap wearing
     different clothes. Keyboard and programmatic moves go through the
     button (`el.click()`), which lands here.

     BOOT IS DELIBERATELY NOT A CALLER. `UI.boot` is re-entered for an
     ordinary redraw as well as for a new game, so resetting the tab there
     would yank the player's screen on every state change — and would drop
     the ? mode's tab stops, which are marked on the VISIBLE screen only.
     tools/uxtest.js asserts that, and caught exactly this. */
  function openTab(name) {
    document.querySelectorAll(".tab").forEach(o =>
      o.setAttribute("aria-selected", o.dataset.t === name ? "true" : "false"));
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
    const pane = $("#s-" + name); if (pane) pane.classList.add("on");
    const vp = $("#viewport"); if (vp) vp.scrollTop = 0;
    screen = name;
    setStatus(ambient(), "ambient");
    /* The globe is drawn lazily: it is the one expensive thing on the
       screen and there is no reason to build it before the tab is opened. */
    if (screen === "world") drawWorld();
  }

  function setStatus(text, level) {
    const k = level === "transient" || level === "referral" ? level : "ambient";
    STATUS[k] = text || "";
    if (k === "transient") {
      clearTimeout(statusTimer);
      /* setTimeout is absent in no browser, but a headless harness may run
         without a live timer queue; the line simply stays up if so. */
      if (typeof setTimeout === "function")
        statusTimer = setTimeout(() => { STATUS.transient = ""; paintStatus(); }, 4500);
    }
    paintStatus();
  }

  function paintStatus() {
    const m = $("#sb-msg");
    if (!m) return;
    m.textContent = STATUS.transient || STATUS.referral || STATUS.ambient;
    m.classList.toggle("live", !!STATUS.transient);
  }

  /* what the current screen is for, plus the one live legislative fact that
     screen is about. Derived, never stored. */
  const SCREEN_NOTE = {
    sit:  "One decision, then the House rises",
    gov:  "Coalition, order paper and the whip",
    cham: "280 seats \u00b7 a bill needs 141, and a dual bill needs 21 of the functional 40",
    orb:  "Thirty-four habitats by altitude band and closure",
    pap:  "Instruments in force, and the register of what has been done",
    cx:   "Public reference \u00b7 attestation is a political act",
    log:  "Every decision this government has taken",
    sbx:  "Testing controls \u00b7 sandbox only"
  };

  function ambient() {
    const note = SCREEN_NOTE[screen] || "";
    if (screen !== "gov" && screen !== "cham") return note;
    const id = Focus.selected("cham-bills");
    const b = (C.bills || []).find(x => x.id === id);
    if (!b) return note;
    return b.title + " \u2014 " + (b.test === "supply" ? "supply: the elected benches vote money"
      : b.dualMajority ? "dual test applies" : "simple majority");
  }

  /* ---------- cues ----------
     The ONLY place in this file that names the audio bus, apart from one
     delegated listener in boot(). Audio follows actions and outcomes; see
     the header of js/audio.js for why a draw function may never reach here. */
  function cue(name) { if (typeof Sound !== "undefined") Sound.play(name); }
  /* The adaptive bed, driven from the same places as the cues: a bill carries
     and the drums enter; the government falls and the bed thins out. */
  function score(name) { if (typeof Music !== "undefined" && Music[name]) Music[name](); }

  /* Called after anything that moved the game on. A government falls once,
     so the knell is edge-triggered rather than drawn from the current state
     - which is also why this cannot live in drawStatus. */
  let fallen = false, lastSession = null, lastSigBand = null, ended = null;
  function afterAction() {
    /* THE SIGNATURES AGAINST HER. Nine is a ballot and seven is the band
       the topbar turns red at — the most dramatic thing that can happen
       short of losing, and the score did not notice it at all. Edge
       triggered on the way UP only: it is news when it gets worse, and
       silence when a signature is withdrawn. */
    const sigs = st.signatures || 0;
    const band = sigs >= 9 ? 2 : sigs >= 7 ? 1 : 0;
    if (lastSigBand === null) lastSigBand = band;
    else if (band > lastSigBand) { lastSigBand = band; score("threat"); }
    else if (band < lastSigBand) lastSigBand = band;

    /* PROROGATION IS THE ONE CADENCE IN THE SCORE, and nothing clicks it:
       the session turns over inside Engine.advance() as sittings pass. So
       it is edge-triggered off the state here, the same way the knell is,
       because both are things that HAPPEN TO the player rather than
       things the player does. */
    if (lastSession === null) lastSession = st.session;
    else if (st.session !== lastSession) { lastSession = st.session; score("prorogue"); }

    const loss = Engine.checkLoss(st, C);
    if (loss.lost && !fallen) {
      fallen = true;
      cue("knell");
      score("sombre");
      setStatus("The government has fallen \u2014 " + loss.reason, "transient");
      /* The session log outlives every save, so a government is recorded
         as it ends rather than when the player next reaches the menu.
         Shell owns the storage; this file owns knowing that it ended. */
      if (typeof Shell !== "undefined" && Shell.record) {
        Shell.record({ sitting: st.sitting, chapter: st.chapter,
                       date: st.date, end: loss.reason });
      }
    } else if (!loss.lost) fallen = false;

    /* THE RUN'S ENDING SURFACE. checkEnd is the one place that answers
       "is this over, and how", and nothing called it, so a settlement or
       an election arrived without ever being told to the player. Called
       here, it also writes st.settledAs, which is what the `settled`
       condition reads when chapter four's trigger fires. Each ending is
       shown once; the terminal then stays open so the record can be read,
       which is the placeholder the brief asked for, not the final screen. */
    const end = Engine.checkEnd(st, C);
    if (end.kind !== "loss" && ended !== end.kind) {
      ended = end.kind;
      if (end.kind === "settlement" && end.settlement) {
        /* A terminal settlement knells and sombres; a non-terminal one
           resolves the crisis and the run goes on, so it scores like a
           moment, not an ending. */
        if (end.over) { score("sombre"); cue("knell"); }
        else score("moment");
        setStatus("Settled: " + end.settlement.name, "transient");
        if (typeof Dialog !== "undefined") Dialog.alert(
          end.settlement.closing || end.settlement.summary || "",
          { title: end.settlement.name, yes: "Acknowledge" });
        if (typeof Shell !== "undefined" && Shell.record)
          Shell.record({ sitting: st.sitting, chapter: st.chapter,
                         date: st.date, end: "settled \u2014 " + end.settlement.name });
      } else if (end.kind === "election" && end.over) {
        setStatus("The Commonwealth has voted. The campaign is over.", "transient");
        if (typeof Shell !== "undefined" && Shell.record)
          Shell.record({ sitting: st.sitting, chapter: st.chapter,
                         date: st.date, end: "election" });
      }
      /* WHAT THIS GOVERNMENT IS REMEMBERED FOR. Evaluated once, on the ending,
         against the finished state — an achievement is a fact about a run and
         the arithmetic is part of the fact, which is why the state goes across
         and not a sentence. The board is on the menu; this only says, once,
         what was earned. */
      earnedNow = awardNow(end);
      if (earnedNow.length) {
        const names = earnedNow.map(a => a.name).join(" \u00b7 ");
        setStatus((earnedNow.some(a => a.tier === "canon") ? "WAYS AND MEANS \u00b7 " : "") +
                  "Remembered: " + names, "transient");
      }
    }
  }

  /* Evaluate the achievements against the finished run, and hand the state
     itself across so the supercanon can read the arithmetic and not only the
     ending. Returns the freshly earned entries. */
  let earnedNow = [];
  function awardNow(end) {
    if (typeof Shell === "undefined" || !Shell.award) return [];
    const d = st.dissolved || {};
    const was = d.was || 0, held = d.held || 0;
    const facts = {
      end: end.kind,
      reason: end.reason || null,
      resolved: st.resolvedAs || null,
      settled: st.settledAs || null,
      seats: held || was ? { was: was, held: held } : null,
      was: was, held: was ? held - was : 0,
      flags: st.flags || {},
      log: (st.log || []).map(x => x.text || "")
    };
    /* The election is the ending here, so `seats:"held"` means the government
       came back larger than it went in. A run that ended before an election
       has no arithmetic and cannot earn the supercanon, which is correct: the
       canon result is an election result. */
    facts.held = Math.max(0, held - was);
    facts.was = was;
    return Shell.award(facts);
  }

  /* ---------- scarcity prices ----------
     Four index numbers and their histories. Not a market to play; a readout
     of what your legislation did to the cost of existing. */

  const PRICE_META = [
    { k:"thermal",   label:"Thermal quota", unit:"per MW-year rejected" },
    { k:"substrate", label:"Substrate rent", unit:"per mind-year, standard clock" },
    { k:"volume",    label:"Volume",         unit:"per pressurised m³, annual" },
    { k:"transit",   label:"Transit",        unit:"per tonne to the ring" }
  ];

  function spark(hist, w, h) {
    if (!hist || hist.length < 2) return "";
    const lo = Math.min(...hist), hi = Math.max(...hist), span = (hi - lo) || 1;
    const pts = hist.map((v, i) =>
      `${(i / (hist.length - 1) * w).toFixed(1)},${(h - (v - lo) / span * h).toFixed(1)}`).join(" ");
    const last = hist[hist.length - 1], first = hist[0];
    const col = last > first ? "var(--alert)" : last < first ? "var(--ok)" : "var(--rule)";
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="sparkline">` +
      `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.2"/></svg>`;
  }

  /* ---------- the transcript ----------
     THE OTHER HALF OF tools/playtest.js, pointed at the player instead of at
     the balance. It is the same idea: a run that ends and leaves nothing
     behind is a run nobody can learn from.

     PLAIN TEXT, IN A BOX THEY CAN SELECT. There is no clipboard worth
     relying on from file:// and no server to post to, so the record is
     written where a tester can select it and paste it into wherever they
     are reporting. The download is a Blob, which does work from file://,
     and is a convenience rather than the mechanism.

     IT READS STATE AND WRITES NONE. */
  /* The date, if the engine will give one. It is the one line here whose
     call signature is worth being careful about: guessing at it is what
     took the whole renderer down the first time, and a renderer that throws
     takes every renderer after it with it. */
  function dateLine() {
    try {
      const d = Engine.dateOfSitting(st, C, st.sitting);
      return typeof d === "string" ? d : (d && d.text) || String(d || "\u2014");
    } catch (e) { return "\u2014"; }
  }

  function transcript() {
    const L = [];
    const rule = (s) => { L.push(""); L.push(s); L.push("-".repeat(s.length)); };
    const d = st.dissolved || {};

    L.push("WAYS AND MEANS — PLAYTEST TRANSCRIPT");
    L.push("=".repeat(58));
    L.push("sitting      " + st.sitting + " of the session, chapter " + st.chapter);
    L.push("date         " + dateLine());

    rule("WHERE IT STANDS");
    L.push("confidence        " + Engine.confidence(st) + " of " + Engine.majority(st) + " needed");
    ["party_loyalty","public_standing","consumables","thermal_margin",
     "legitimacy","friction"].forEach(k =>
      L.push(k.padEnd(18) + (st.scalars[k] == null ? "—" : st.scalars[k])));
    L.push("solvency          " + (st.scalars.solvency || 0).toLocaleString() + " MW-years");
    try {
      const r = Engine.receipts(st);
      L.push("receipts          " + r.total.toLocaleString() + " a sitting");
    } catch (e) {}

    rule("THE PRICES");
    Object.keys(st.prices || {}).forEach(k =>
      L.push(("  " + k).padEnd(18) + st.prices[k]));

    rule("MEASURES");
    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id]; if (!bs) return;
      L.push("  " + String(b.ref || b.id).padEnd(12) + String(bs.stage).padEnd(16) +
             (bs.dead ? "dead" : "") + "  " + b.title);
    });

    const owed = Engine.outstanding(st) || [];
    rule("UNDERTAKINGS OUTSTANDING (" + owed.length + ")");
    if (!owed.length) L.push("  none");
    owed.forEach(o => L.push("  by sitting " + o.by + "   " + o.text));

    rule("WHAT WAS DECIDED");
    (st.log || []).forEach(l =>
      L.push("  sitting " + String(l.sitting == null ? "?" : l.sitting).padStart(3) +
             "   " + (l.text || "")));

    if (st.settledAs) { rule("THE SESSION SETTLED"); L.push("  " + st.settledAs); }
    if (d.at) { rule("DISSOLUTION"); L.push("  at sitting " + d.at); }

    rule("NOTES FROM THE TESTER");
    L.push("  (what was confusing, what you wanted to do and could not,");
    L.push("   where you stopped reading)");
    L.push("");
    return L.join("\n");
  }

  function drawExport() {
    const box = $("#log-export"); if (!box) return;
    if (box.dataset.built === String(st.sitting) && box.querySelector("textarea")) return;
    box.dataset.built = String(st.sitting);
    box.innerHTML =
      `<div class="note">The run so far, as plain text. Select it and paste it ` +
      `into your report, or take the file.</div>` +
      `<div class="expbtns"><button class="btn" id="exp-sel">Select all</button>` +
      `<button class="btn" id="exp-dl">Download</button></div>` +
      `<textarea id="exp-text" readonly spellcheck="false"></textarea>`;
    const ta = $("#exp-text");
    ta.value = transcript();
    const sel = $("#exp-sel"), dl = $("#exp-dl");
    if (sel) sel.addEventListener("click", () => {
      ta.focus(); ta.select();
      setStatus("The transcript is selected — copy it", "transient");
    });
    if (dl) dl.addEventListener("click", () => {
      try {
        const blob = new Blob([ta.value], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ways-and-means-sitting-" + st.sitting + ".txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        setStatus("Transcript written", "transient");
      } catch (e) { setStatus("This browser would not write the file — select and copy instead", "transient"); }
    });
  }

  /* ---------- the economy ----------
     A PROTOTYPE, AND DELIBERATELY NOT A MODEL. §7.6 is explicit: shallow
     simulation, deep consequence, and the test is whether the player can
     hold the whole state in their head and still be surprised. So there is
     no debt here, no credit rating and no inflation number — the four
     scarcity prices ARE the inflation, per good, and a second way of saying
     that is how .sel came to mean four things.

     What earns the screen is that the budget now has two sides. It shows
     what the state holds, what it takes every sitting, what it has committed
     to spend, and the arithmetic between them; the prices and the LAW that
     sets them, because §7.9 says they are legislative outputs and not a
     market; and the population all of it is levied from. */
  /* WHICH FIGURE IS TAKEN APART at the foot of the economy tab. A view
     preference for the session, so it lives here and not in the save. */
  let chartOn = "solvency";
  /* WHICH TIMESCALE THE CHART IS ON. "session" is the engine's own
     per-sitting curve — about fifteen weeks at four sitting days a week, so
     the right resolution for a price and far too short to show anything
     structural. "record" is the annual series content authors in
     setup.history, 2280 to 2287, whose last point IS the opening value, so
     switching between them reads as one story at two magnifications rather
     than two stories. */
  let chartScale = "session";

  /* THE SERIES BEHIND A FIGURE. Everything charted here is already kept —
     the prices keep sixty sittings of history and the state keeps its own —
     so nothing is stored for the chart's sake. A figure with no history
     charts as the one reading it has, which is honest: a bar is a bar. */
  /* THE YEARS BEFORE THE GAME. Content owns them; this reads them and never
     writes them. A measure with no authored past says so rather than drawing
     a flat line, which would be a claim about history rather than an absence
     of one. */
  function recordSeries(key) {
    const H = (C.setup && C.setup.history) || {};
    /* INFLATION IS DERIVED HERE TOO, the same way Engine.inflation derives
       the live one and the session chart derives its curve: the mean relative
       change of the scarce goods against their own first reading. It said
       "no annual record" before, which was true of the stored data and wrong
       as an answer — the record is in the four price series and this is the
       reading of them. Derived, never stored, which is the rule this project
       learned from apportionment_ratio.

       Over 2280 to 2287 it comes to about +24%: thermal +41, substrate +28,
       volume +18, transit +9. That is the cost of existing in this
       Commonwealth, and it is the reason every one of the four prices is an
       argument. */
    if (key === "inflation") {
      const ks = ["thermal", "substrate", "volume", "transit"].filter(k => (H[k] || []).length);
      if (!ks.length) return { label: "Cost of existing", unit: "%", pts: [],
                               record: true, none: "No annual price record is kept." };
      const n = Math.min.apply(null, ks.map(k => H[k].length));
      const pts = [];
      for (let i = 0; i < n; i++) {
        let sum = 0, c = 0;
        ks.forEach(k => {
          const base = H[k][0];
          if (!base) return;
          sum += (H[k][i] - base) / base; c++;
        });
        pts.push(c ? Math.round(sum / c * 1000) / 10 : 0);
      }
      return { label: "Cost of existing", unit: "%", pts: pts, signed: true,
               record: true, from: H.from, to: H.to };
    }
    const a = H[key];
    const meta = PRICE_META.find(m => m.k === key);
    const label = key === "participation" ? "Adults in paid work"
                : key === "trade" ? "Trade balance"
                : key === "solvency" ? "The reserve"
                : key === "inflation" ? "Cost of existing"
                : (meta || {}).label || key;
    const unit = key === "participation" ? "per cent"
               : key === "solvency" ? "MW-years" : "index";
    if (!a || !a.length) return { label: label, unit: unit, pts: [], record: true,
                                  none: "No annual record is kept for this." };
    /* THE LIVE VALUE IS THE LAST POINT, not the authored one, once play has
       moved it: the record runs to the opening and the present continues it,
       so the curve stays one line. */
    const pts = a.slice();
    const live = key === "solvency" ? (st.scalars || {}).solvency
               : key === "participation" || key === "trade"
                 ? ((st.economy || {})[key])
               : (st.prices || {})[key];
    if (typeof live === "number") pts[pts.length - 1] = live;
    return { label: label, unit: unit, pts: pts, record: true,
             from: H.from, to: H.to };
  }

  function chartSeries(key) {
    if (chartScale === "record") return recordSeries(key);
    if (key === "inflation") {
      /* derived per sitting from the price histories, the same way
         Engine.inflation derives the live one: one source, read backwards. */
      const ks = Object.keys(st.priceHistory || {});
      if (!ks.length) return { label: "Cost of existing", unit: "%", pts: [] };
      const n = Math.min.apply(null, ks.map(k => (st.priceHistory[k] || []).length));
      const pts = [];
      for (let i = 0; i < n; i++) {
        let sum = 0, c = 0;
        ks.forEach(k => {
          const h = st.priceHistory[k], base = h[0] || 100;
          if (!base) return;
          sum += (h[i] - base) / base; c++;
        });
        pts.push(c ? Math.round(sum / c * 1000) / 10 : 0);
      }
      return { label: "Cost of existing", unit: "%", pts: pts, signed: true };
    }
    /* §7.10. Both keep a curve on the same sixty-sitting window as the
       prices, so they plot through the same machinery; `private` is authored
       and never drifts, so it has no curve and is not offered. */
    if (st.economyHistory && st.economyHistory[key])
      return { label: key === "participation" ? "Adults in paid work" : "Trade balance",
               unit: key === "participation" ? "per cent" : "index",
               pts: st.economyHistory[key].slice() };
    if (st.priceHistory && st.priceHistory[key])
      return { label: (PRICE_META.find(m => m.k === key) || {}).label || key,
               unit: "index", pts: st.priceHistory[key].slice() };
    if (key === "solvency")
      return { label: "The reserve", unit: "MW-years",
               pts: (st.solvencyHistory || [st.scalars.solvency || 0]).slice() };
    return { label: key, unit: "", pts: [st.scalars[key] || 0] };
  }

  /* THE TWO TIMESCALES, as a control rather than a setting: a reader looking
     at thermal wants both questions — what has it done this fortnight, and
     what has it done since 2280 — and neither answer is a default the other
     can be derived from. */
  function chartScaleHTML() {
    const b = (k, t, sub) =>
      `<button class="chv rad${chartScale === k ? " on" : ""}" data-cscale="${k}">` +
      `${t}<em>${sub}</em></button>`;
    return `<div class="cscale">` +
      b("session", "This session", "sitting by sitting") +
      b("record", "The record", "2280\u20132287") +
      `</div>`;
  }
  function wireChartScale(box) {
    box.querySelectorAll("[data-cscale]").forEach(btn =>
      btn.addEventListener("click", () => {
        if (chartScale === btn.dataset.cscale) return;
        chartScale = btn.dataset.cscale;
        cue("click");
        drawChart();
      }));
  }

  function drawChart() {
    const box = $("#chart-body"); if (!box) return;
    const s = chartSeries(chartOn);
    const hdr = $("#chart-hdr"), sub = $("#chart-sub");
    if (hdr) hdr.textContent = s.label;
    if (sub) sub.textContent = s.record
      ? (s.pts.length ? s.from + " to " + s.to + " \u00b7 " + s.unit
                      : "no annual record \u00b7 " + s.unit)
      : s.pts.length > 1
        ? s.pts.length + " sittings \u00b7 " + s.unit
        : "one reading so far \u00b7 " + s.unit;

    /* A MEASURE WITH NO PAST SAYS SO. Drawing a flat line for one would be a
       claim about history rather than the absence of a record. */
    if (s.record && !s.pts.length) {
      box.innerHTML = `<div class="chartwrap"><div class="note">${esc(s.none)}</div></div>` +
        chartScaleHTML();
      wireChartScale(box);
      return;
    }

    const pts = s.pts.slice(-60);
    const now = pts.length ? pts[pts.length - 1] : 0;
    const lo = Math.min.apply(null, pts.concat(s.signed ? [0] : []));
    const hi = Math.max.apply(null, pts.concat(s.signed ? [0] : []));
    const span = (hi - lo) || 1;
    box.innerHTML =
      `<div class="chartwrap"><div class="cnum">` +
        `<div class="chartnow">${s.unit === "%" ? (now >= 0 ? "+" : "") + now.toFixed(1) + "%"
                                                : Math.round(now).toLocaleString()}` +
        `<small> now</small></div>` +
        `<div class="note">low ${s.unit === "%" ? lo.toFixed(1) : Math.round(lo).toLocaleString()}` +
        ` \u00b7 high ${s.unit === "%" ? hi.toFixed(1) : Math.round(hi).toLocaleString()}</div>` +
      `</div><div class="cplot">` +
        `<div class="bigchart">` + pts.map((v, i) => {
          const pc = Math.max(2, Math.round((v - lo) / span * 100));
          /* NO title ATTRIBUTE. A native tooltip is the one kind this
             interface does not use, and sixty annotated bars would also be
             sixty tab stops in ? mode. The chart is a SHAPE; the numbers
             that matter are printed beside it, which is the right division
             of labour between a figure and a reading of it. */
          return `<i class="bar${i === pts.length - 1 ? " hi" : ""}" ` +
            `style="height:${pc}%" aria-hidden="true"></i>`;
        }).join("") + `</div>` +
        `<div class="chartaxis"><span>${
            s.record ? String(s.to - pts.length + 1)
            : pts.length > 1 ? "sitting " + Math.max(1, st.sitting - pts.length + 1) : ""}</span>` +
          `<span>${s.record ? String(s.to)
            : pts.length > 1 ? "sitting " + st.sitting : ""}</span></div>` +
      `</div></div>` + chartScaleHTML();
    wireChartScale(box);
  }

  function drawEconomy() {
    const box = $("#econ-treasury");
    if (box) {
      const r = Engine.receipts(st);
      const solv = st.scalars.solvency || 0;
      /* What the appropriation's settled clauses come to, from the engine's
         own costing — not a second sum that can drift from it. */
      let spend = 0;
      try { spend = (Engine.clauseCost(st, C, "appropriation") || {}).total || 0; }
      catch (e) { spend = 0; }
      const runway = r.total > 0 ? Math.floor(solv / Math.max(1, r.total)) : null;
      const row = (lab, val, sub, cls, pick) =>
        `<div class="prow${pick ? " pick" + (chartOn === pick ? " on" : "") : ""}"` +
        (pick ? ` data-chart="${esc(pick)}"` : "") +
        `><div class="plab">${esc(lab)}${sub ? `<em>${esc(sub)}</em>` : ""}</div>` +
        `<div class="pval ${cls || ""}">${val}</div></div>`;
      const debt = Engine.debtOf ? Engine.debtOf(st) : 0;
      const svc = Engine.debtService ? Engine.debtService(st) : 0;
      const infl = Engine.inflation ? Engine.inflation(st) : 0;
      box.innerHTML =
        row("Held", solv.toLocaleString(), "the quota the state has", "", "solvency") +
        row("Receipts", "+" + r.total.toLocaleString(), "every sitting", "down") +
        (debt
          ? row("Owed to Earth", debt.toLocaleString(),
                "at " + Engine.debtRate(st) + " per cent", "up") +
            row("Debt service", "\u2212" + svc.toLocaleString(), "every sitting", "up")
          : row("Owed to Earth", "none", "nothing is pledged off-world")) +
        row("Net a sitting", (r.total - svc >= 0 ? "+" : "\u2212") +
              Math.abs(r.total - svc).toLocaleString(),
            "receipts less what the debt costs", r.total - svc < 0 ? "up" : "down") +
        row("Cost of existing", (infl >= 0 ? "+" : "") + infl.toFixed(1) + "%",
            "the four prices against where they opened",
            infl > 5 ? "up" : infl < -5 ? "down" : "", "inflation") +
        (spend ? row("The appropriation", spend.toLocaleString(),
                     "what the settled clauses cost", spend > solv ? "up" : "") : "") +
        `<div class="note">` +
        (spend > solv
          ? `The budget as it stands costs more than the Commonwealth holds. ` +
            `It cannot be carried without either the reserve it does not have ` +
            `or a rate it has not set.`
          : `At the present rates the state takes ${r.total.toLocaleString()} a ` +
            `sitting. A government that stops taking it does not default; it ` +
            `sheds people.`) + `</div>` +
        (runway != null ? `<div class="note">Nothing coming in, and what is held ` +
          `would cover ${runway} sitting${runway === 1 ? "" : "s"} of the same spending.</div>` : "");
    }

    /* THE PRICES ARE LEGISLATION. §7.9, and the tick reads exactly these. */
    const law = $("#econ-law");
    if (law) {
      const L = st.law || {};
      const WORD = {
        thermal_release: { tight:"held tight", steady:"as last session", open:"released" },
        capital_works:   { none:"deferred", ring:"the ring band", some:"the ring band", outer:"the outer stations" },
        transit_subsidy: { none:"unsubsidised", anchors:"the anchor states", all:"every station" }
      };
      const rows = [
        ["Thermal quota released", "thermal_release", "sets the thermal price"],
        ["Capital works",          "capital_works",   "sets the volume price"],
        ["Transit subsidy",        "transit_subsidy", "sets the transit price"]
      ].map(([lab, k, why]) =>
        `<div class="prow"><div class="plab">${esc(lab)}<em>${esc(why)}</em></div>` +
        `<div class="pval">${esc((WORD[k] || {})[L[k]] || String(L[k] == null ? "—" : L[k]))}</div></div>`
      ).join("");
      const pub = L.substrate_public_share;
      law.innerHTML = rows +
        `<div class="prow"><div class="plab">Substrate publicly held<em>sets the substrate price</em></div>` +
        `<div class="pval">${pub == null ? "—" : Math.round(pub * 100) + "%"}</div></div>` +
        `<div class="note">None of these is a market. Every one is a line of the ` +
        `appropriation, which is why a price here can be argued with.</div>`;
    }

    /* WHAT THE UNDERWRITERS SAY. The engine finds which readings apply and
       content supplies every word, so the advice is in the prose file. */
    const ob = $("#econ-outlook");
    if (ob && Engine.outlook) {
      const found = Engine.outlook(st, C) || [];
      ob.innerHTML = found.length
        ? found.map(f => `<div class="note ulook">${esc(f.text)}</div>`).join("")
        : `<div class="note">Nothing they would put in writing.</div>`;
    }

    drawChart();

    /* ONE LISTENER FOR THE WHOLE TAB, bound after the rows are drawn. The
       rows are in two different panels and both are rebuilt on every draw,
       so binding per panel would be two handlers for one action — the
       [data-go] trap. */
    document.querySelectorAll("#s-econ [data-chart]").forEach(el =>
      el.addEventListener("click", () => {
        chartOn = el.dataset.chart;
        cue("click");
        drawPrices(); drawEconomy();
      }));

    /* WHAT PEOPLE DO. content/labour.js, which nothing in the interface has
       ever read — it existed to be canon and to be argued with, and the
       player could not see a line of it. */
    const lt = $("#econ-labour");
    if (lt && typeof LABOUR !== "undefined") {
      const T = LABOUR.totals || {};
      const hdr = $("#econ-lab-hdr");
      if (hdr) hdr.textContent =
        (T.employed ? (T.employed / 1e6).toFixed(2) + "M in work" : "what people do") +
        (T.participation ? " · " + Math.round(T.participation * 100) + "% participation" : "");
      const cats = (LABOUR.categories || []).slice()
        .sort((a, b) => (b.share || 0) - (a.share || 0));
      lt.innerHTML =
        `<thead><tr><th>What people do</th><th class="n">Share</th>` +
        `<th class="n" data-tip-title="Embodied" data-tip-body="The proportion of ` +
        `this work done by people in bodies rather than as emulations. A body is ` +
        `an economic asset, not a class marker.">Embodied</th>` +
        `<th class="n">Licensed</th></tr></thead><tbody>` +
        cats.map(c => `<tr><td>${esc(c.name)}</td>` +
          `<td class="n">${(c.share || 0).toFixed(1)}%</td>` +
          `<td class="n">${c.embodied == null ? "—" : Math.round(c.embodied * 100) + "%"}</td>` +
          `<td class="n">${c.licensed ? (c.licensed / 1000).toFixed(0) + "k" : "—"}</td></tr>`).join("") +
        `</tbody>`;
    }
  }

  /* ---------- the parties ----------
     A PARTY IS NOT A COLOUR. Twelve of them exist in content and the only
     place any of it was legible was a tint in the seating plan and a row in
     the coalition table — so the government's own currents lived on the
     Government tab, the opposition's nowhere at all, and who actually sits
     for a party could not be asked.

     Everything here is derived. Seats come from Engine, which counts the
     live roll rather than the frozen numbers in content (a by-election has
     to show up); offices come from the cabinet, the way js/encyclopedia.js
     already derives them, so a reshuffle reaches this screen without anybody
     editing it. Nothing is stored. */
  function partySel() {
    const list = C.parties || [];
    const want = Focus.selected("party-table");
    return list.find(p => p.id === want) || list[0] || null;
  }

  /* The office a member holds, from the cabinet and the party leaderships —
     not from a typed role, which drifts the moment anybody is moved. */
  function officeOfMember(id) {
    const post = (C.cabinet || []).find(m => m.holder === id);
    if (post) return post.title || post.name;
    const led = (C.parties || []).find(p => p.leader === id);
    if (led) return "Leader, " + (led.name || led.id);
    const ch = (C.characters || []).find(c => c.id === id);
    return (ch && ch.role) || "";
  }

  function drawParties() {
    const tbl = $("#party-table"); if (!tbl) return;
    const list = C.parties || [];
    const sel = partySel();
    const count = $("#party-count");
    if (count) count.textContent = list.length + " in the House";

    /* GROUPED BY THEIR RELATION TO THE GOVERNMENT, not listed flat.

       The author's note: this tab was originally meant to be "party" — a
       place to manage INTERPARTY AFFAIRS — and a flat alphabetical twelve
       made it a browser instead. The engine has always known the three
       relations and priced them differently: `whippable()` will move a
       coalition bench on ordinary business, moves a confidence-and-supply
       bench on supply and confidence only, and answers anyone else with
       "outside the coalition; this is lobbying, not whipping". That
       distinction is the subject of the tab, so the list says it first.

       The counts in each heading are seats, not parties: what a reader wants
       from this column is the arithmetic of their own support. */
    const inGov = st.coalition.slice();
    const inCS  = st.confidenceSupply.filter(id => !inGov.includes(id));
    const relOf = id => inGov.includes(id) ? "gov" : inCS.includes(id) ? "cs" : "opp";
    const GROUPS = [
      { k: "gov", head: "In government",
        note: "movable on ordinary business, at the ledger's price" },
      { k: "cs",  head: "Confidence and supply",
        note: "held on confidence and supply; free on everything else" },
      { k: "opp", head: "Outside the government",
        note: "cannot be whipped \u2014 persuasion, not the ledger" }
    ];
    const seatsIn = k => list.filter(p => relOf(p.id) === k)
      .reduce((n, p) => n + Engine.partyTotal(st, p.id), 0);

    tbl.innerHTML = `<thead><tr><th></th><th>Party</th><th class="n">Seats</th>` +
      `<th class="n" data-tip="loyalty">Loy</th>` +
      /* THE KEYED TIP, not a second copy of its words. js/tips.js already
         explains `ledger` — "positive means they owe you, negative means you
         owe them, nothing here decays" — and an inline body here said the
         same thing in different words, which is two explanations that can
         drift apart. It also left the key anchored to nothing once the
         Government tab's ledger table went, which uxtest catches. */
      `<th class="n" data-tip="ledger">Cr</th></tr></thead><tbody>` +
      GROUPS.map(g => {
        const rows = list.filter(p => relOf(p.id) === g.k);
        if (!rows.length) return "";
        /* The GOV and C&S flags used to be drawn per row on the Chamber's
           roster; the grouping says the same thing once, so the headings
           take the explanations those flags carried. */
        const relTip = g.k === "gov" ? ' data-tip="gov"'
                     : g.k === "cs" ? ' data-tip="cs"' : "";
        return `<tr class="prel"><td colspan="5">` +
          `<b${relTip}>${g.head}</b> <em>${seatsIn(g.k)} seats \u00b7 ${g.note}</em></td></tr>` +
          rows.map(p => {
            const seats = Engine.partyTotal(st, p.id);
            const loy = (st.loyalty && st.loyalty[p.id] != null) ? st.loyalty[p.id] : p.loyalty;
            const cr = st.capital[p.id] || 0;
            const own = p.id === st.playerParty;
            /* THE LEDGER IS FOR PARTNERS. `whippable()` returns
               `currency: own ? "loyalty" : "capital"`, so the player's own
               bench is never bought with credit and an outside party cannot
               be bought at all. A number in either row would be a number
               that does nothing. */
            const crCell = (g.k === "opp" || own) ? "&mdash;"
              : `<span class="${cr < 0 ? "warn" : ""}">${cr > 0 ? "+" + cr : cr}</span>`;
            return `<tr data-party="${p.id}"${sel && sel.id === p.id ? ' class="sel"' : ""}>` +
              `<td><i class="pdot" style="background:${p.colour}"></i></td>` +
              `<td><b>${esc(p.short || p.id)}</b> ${esc(p.name)}` +
              (own ? ` <span class="pown">yours</span>` : "") + `</td>` +
              `<td class="n">${seats}</td>` +
              `<td class="n">${loy == null ? "&mdash;" : loy}</td>` +
              `<td class="n">${crCell}</td></tr>`;
          }).join("");
      }).join("") + `</tbody>`;

    tbl.querySelectorAll("[data-party]").forEach(tr =>
      tr.addEventListener("click", () => {
        Focus.seed("party-table", tr.dataset.party); cue("click"); drawParties();
      }));

    if (!sel) return;
    const hdr = $("#party-hdr"), sub = $("#party-sub");
    if (hdr) hdr.textContent = sel.name;
    if (sub) sub.textContent = (sel.short || "") + " · " + (sel.kind || "");

    /* the detail: who leads it, what it holds, what it believes */
    const leader = (C.characters || []).find(c => c.id === sel.leader);
    const pop = Engine.partyPopular(st, sel.id), fun = Engine.partyFunctional(st, sel.id);
    /* `.filter(k => ax[k])` WAS A BUG THE MOMENT THE AXES BECAME SIGNED:
       zero is the centre of an axis and a position content took on purpose,
       and a truthiness test threw it away. Association of Engineers and
       Systems is economic 0 — neither public nor private, which is the
       whole of what that party is — and the row vanished. `!= null`. */
    const ax = sel.axes || {};
    const axRows = Object.keys(ax).filter(k => ax[k] != null)
      .map(k => `<div class="prow"><div class="plab">${esc(k)}</div>` +
                `<div class="pval axpos">${esc(axisAt(k, ax[k]))}</div></div>`).join("");
    /* WHAT THE RELATIONSHIP CONSISTS OF, above who they are.

       This panel opened on the leader and the seat count — true of a party
       whether or not you have anything to do with it. On a tab about
       interparty affairs the first thing wanted is the standing: which of
       the three relations this is, what they are owed, how far their
       loyalty has left to fall, and who you would have to talk to. All of
       it is read off state the engine already keeps; nothing new is
       stored. */
    const rel = relOf(sel.id);
    const cr = st.capital[sel.id] || 0;
    /* The player's own party, for the distance readout below. */
    const own = C.partyById[st.playerParty];
    const selLoy = (st.loyalty && st.loyalty[sel.id] != null) ? st.loyalty[sel.id] : sel.loyalty;
    /* WHAT THIS RELATION IS, in the terms the engine prices it in.
       Four cases, not three: the player's own bench is inside the coalition
       but is the one whipped with party loyalty rather than the ledger, and
       calling it "a partner" was wrong in the way that matters. */
    let RELSAY;
    if (sel.id === st.playerParty) {
      RELSAY = ["Your own party",
        "Your own bench, and the only one moved with party loyalty rather than " +
        "the ledger. What you spend here is what a leadership challenge is " +
        "counted in."];
    } else if (rel === "gov") {
      RELSAY = ["In government",
        "A partner. Their bench can be moved on ordinary business, and the " +
        "ledger is what it costs."];
    } else if (rel === "cs") {
      RELSAY = ["Confidence and supply",
        "Not a partner. They have undertaken to carry confidence and supply and " +
        "are free on everything else, so there is nothing to whip on ordinary " +
        "business at any price."];
    } else {
      RELSAY = ["Outside the government",
        "No arrangement. Their bench cannot be whipped \u2014 what moves it is the " +
        "measure itself, or something offered outside this ledger."];
    }

    const leaderRel = leader && st.characters[leader.id]
      ? st.characters[leader.id].relationship : null;
    const standing =
      `<div class="rulehead">Standing <em>${RELSAY[0]}</em></div>` +
      `<div class="note">${RELSAY[1]}</div>` +
      `<div class="prow"><div class="plab">Loyalty</div><div class="pval` +
        `${selLoy != null && selLoy < 35 ? " warn" : ""}">${selLoy == null ? "\u2014" : selLoy}` +
        `${selLoy != null && selLoy < 35 ? " \u00b7 thin" : ""}</div></div>` +
      /* Same reason as the column: no ledger row where there is no ledger.
         Outside parties have no arrangement and the player's own bench is
         charged in loyalty, which is the row above. */
      (rel === "opp" || sel.id === st.playerParty ? "" :
        `<div class="prow"><div class="plab">The ledger</div><div class="pval` +
        `${cr < 0 ? " warn" : ""}">${cr > 0 ? "+" + cr + " owed to them" :
           cr < 0 ? cr + " \u00b7 overdrawn" : "nothing either way"}</div></div>`) +
      /* WHAT HAPPENS IF THEY GO, which is the interparty fact this tab was
         missing. The margin is one, so the answer is the same for every
         partner and that is the point: the Congregational Democratic
         Alliance's eighteen and the Independents' six are equally fatal, and
         a reader who has only seen the seat counts would not guess it. For a
         party outside the government the same arithmetic runs the other way
         — what they would add, and whether it would matter. */
      (() => {
        const seats = Engine.partyTotal(st, sel.id);
        const conf = Engine.confidence(st), maj = Engine.majority(st);
        if (rel === "opp") {
          const after = conf + seats;
          return `<div class="prow"><div class="plab">If they joined` +
            `<em>${seats} seat${seats === 1 ? "" : "s"}</em></div>` +
            `<div class="pval">${after} of ${Engine.chamberTotal(st)}` +
            `${conf >= maj ? ", a margin of " + (after - maj) : after >= maj
              ? ", and the government holds" : ", still short"}</div></div>`;
        }
        if (sel.id === st.playerParty) return "";
        const after = conf - seats;
        const falls = after < maj;
        return `<div class="prow"><div class="plab">If they walked` +
          `<em>${seats} seat${seats === 1 ? "" : "s"} out</em></div>` +
          `<div class="pval${falls ? " warn" : ""}">${after} against ${maj}` +
          `${falls ? " \u00b7 the government falls" : " \u00b7 it holds"}</div></div>`;
      })() +
      /* THE LEADER IS NOT REPEATED HERE. The Leader section follows
         immediately below with the name and the office; a row saying it
         again two lines up is the restated idea PROSE_REGISTER.md names.
         What this block adds is the NUMBER — where you stand with them —
         and only where that is somebody other than yourself. */
      /* HOW FAR APART YOU ACTUALLY ARE (bible §8.1).

         This tab could say a partner was in the coalition, what it was owed
         and that its loyalty was thin. It could not say WHY — the axes were
         categorical strings and "restrictionist" against "restrictionist"
         was a match or it was not, so there was no distance to report.

         There is now, and it is the engine's own cosine rather than a second
         scoring: the same number `inferStance` uses to decide how a bench
         votes. So the Congregational Democratic Alliance at loyalty 23 stops
         being a mystery — it sits 0.55 from you on personhood, which is the
         argument this parliament is about, and no amount of order-paper time
         will buy that. */
      (sel.id !== st.playerParty && own && Object.keys(sel.axes || {}).length
        ? (() => {
            const a = Engine.axisAgreement(sel.axes, own.axes);
            const say = a >= 0.6 ? "close to you"
                      : a >= 0.25 ? "broadly with you"
                      : a > -0.25 ? "neither with you nor against"
                      : a > -0.6 ? "some way from you"
                      : "at the other end of the argument";
            const worst = axisPairs(sel.axes, own.axes)
              .sort((x, y) => x.agree - y.agree)[0];
            /* AND WHAT THEY WILL NOT CARRY, which is the more useful half.

               Measuring distance from the player's own party was the first
               version and it answered the wrong question: the Congregational
               Democratic Alliance scores 0.78 against the governing party —
               both left, both restrictionist, both mildly closurist — so the
               readout said "close to you" about the partner whose loyalty is
               23 and whose ledger is overdrawn. Their quarrel is not with the
               party, it is with the BILL: they sit at -0.9 on personhood and
               the divergence bill sits at +0.9.

               So the panel also names the measure now before the House that
               this bench is furthest from. That is the thing a whip's office
               would tell you, and it is actionable: it is the vote you will
               have to buy, or move, or lose. */
            const live = (C.bills || []).filter(b => {
              const sb = st.bills[b.id];
              return sb && !sb.dead && sb.stage && sb.stage !== "drafting" &&
                     b.axes && Object.keys(b.axes).length;
            }).map(b => ({ b: b, a: Engine.axisAgreement(sel.axes, b.axes) }))
              .sort((x, y) => x.a - y.a)[0];
            const liveRow = live && live.a < -0.15
              ? `<div class="prow"><div class="plab">Will not carry` +
                `<em>${esc(live.b.title)}</em></div>` +
                `<div class="pval warn">${live.a <= -0.6 ? "flatly" : "against"}</div></div>`
              : live && live.a > 0.25
              ? `<div class="prow"><div class="plab">With you on` +
                `<em>${esc(live.b.title)}</em></div>` +
                `<div class="pval">${live.a >= 0.6 ? "firmly" : "broadly"}</div></div>`
              : "";
            return `<div class="prow"><div class="plab">Distance from you` +
              (worst && worst.agree < -0.05
                ? `<em>furthest apart on ${esc(worst.axis)}</em>` : "") +
              `</div><div class="pval${a < -0.25 ? " warn" : ""}">${say}</div></div>` +
              liveRow;
          })()
        : "") +
      (leaderRel != null && sel.id !== st.playerParty
        ? `<div class="prow"><div class="plab">Where you stand with ` +
          `${esc((leader.name || "").replace(/^(Rt\. Hon\.|Hon\.)\s*/, ""))}</div>` +
          `<div class="pval${leaderRel < 30 ? " warn" : ""}">${leaderRel}</div></div>` : "");

    const det = $("#party-detail");
    if (det) det.innerHTML = standing +
      (leader ? `<div class="rulehead">Leader</div><div class="note"><b>${esc(leader.name)}</b>` +
        ` — ${esc(officeOfMember(leader.id))}${leader.seat ? " · sits for " + esc(leader.seat) : ""}.</div>`
        : `<div class="rulehead">Leader</div><div class="note">None. The independents are not a party and do not choose one.</div>`) +
      `<div class="rulehead">Seats <em>${pop + fun}</em></div>` +
      `<div class="note">${pop} popular · ${fun} functional. ` +
      `Content declares ${(sel.seats && (sel.seats.district + sel.seats.list + sel.seats.functional)) || 0} at the opening; ` +
      `this is the live roll.</div>` +
      (axRows ? `<div class="rulehead">Where it stands</div>${axRows}` : "") +
      (sel.note ? `<div class="rulehead">In a sentence</div><div class="note">${esc(sel.note)}</div>` : "");

    /* WHO THEY VOTE WITH — the interparty panel, and the one thing on this
       tab whose subject is not a single party.

       The engine has been able to score any two parties against each other
       since the axes became signed, and nothing read it: agreement was only
       ever computed party-against-BILL and party-against-YOU. The full
       twelve-by-twelve is the interparty picture, and some of it is
       surprising in a way a seat count never shows — the New Progressive
       Party and the Uplift Alliance agree at 0.96 and one of them is outside
       the government; the Association of Engineers and the Alliance of
       Business agree at 0.95 and are a bloc in everything but name; Home
       Rule and the Single Tax Party are at -0.98, which is as opposed as two
       parties in this House get.

       Engine.axisAgreement, not a second scoring, for the same reason the
       distance readout uses it: a number here that disagreed with a division
       would be unfalsifiable. */
    const withTbl = $("#party-with");
    if (withTbl) {
      const mine = sel.axes || {};
      const rows = (C.parties || [])
        .filter(p => p.id !== sel.id && Object.keys(p.axes || {}).length)
        .map(p => ({ p: p, a: Engine.axisAgreement(mine, p.axes) }))
        .sort((x, y) => y.a - x.a);
      const hdr = $("#party-with-hdr");
      if (hdr) hdr.textContent = Object.keys(mine).length
        ? rows.length + " others, by agreement with " + (sel.short || sel.id)
        : (sel.short || sel.id) + " declares no position";
      if (!Object.keys(mine).length) {
        /* The Independents are not a party and hold no position, so there is
           nothing to rank them against — which is the entry that says the
           most, and is said rather than left as an empty table. */
        withTbl.innerHTML = `<tbody><tr><td class="note">` +
          `The Independents declare no axes, so there is no party line to ` +
          `compare. Each of the six votes on their own, and the Currents ` +
          `panel below is where they are.</td></tr></tbody>`;
      } else {
        const say = a => a >= 0.7 ? "with them" : a >= 0.3 ? "broadly with"
                      : a > -0.3 ? "neither" : a > -0.7 ? "against" : "opposed";
        withTbl.innerHTML =
          `<thead><tr><th></th><th>Party</th><th class="n" data-tip="seats">Seats</th>` +
          `<th class="n">Agree</th><th></th></tr></thead><tbody>` +
          rows.map(r => {
            const g = relOf(r.p.id);
            const cls = r.a >= 0.7 ? "good" : r.a <= -0.7 ? "warn" : "";
            return `<tr data-party="${r.p.id}">` +
              `<td><i class="pdot" style="background:${r.p.colour}"></i></td>` +
              `<td><b>${esc(r.p.short || r.p.id)}</b>` +
              (g === "gov" ? ` <span class="flag" data-tip="gov">GOV</span>`
               : g === "cs" ? ` <span class="flag" data-tip="cs">C&amp;S</span>` : "") +
              `</td><td class="n">${Engine.partyTotal(st, r.p.id)}</td>` +
              `<td class="n ${cls}">${r.a >= 0 ? "+" : ""}${r.a.toFixed(2)}</td>` +
              `<td class="pwsay">${say(r.a)}</td></tr>`;
          }).join("") + `</tbody>`;
      }
      withTbl.querySelectorAll("[data-party]").forEach(tr =>
        tr.addEventListener("click", () => {
          Focus.seed("party-table", tr.dataset.party); cue("click"); drawParties();
        }));
    }

    /* THE PARTY OUTSIDE PARLIAMENT. Who runs it between elections, what is
       affiliated to it, and where it exists on the ground. No mechanic hangs
       off any of it — it is somewhere to look, like the Concordance — and
       the shapes differ because the parties do: a confederal party has a
       convenor, a professional association has a registrar, and the
       independents have nothing, which is the entry that says the most. */
    const org = (C.partyOrg || {})[sel.id] || {};
    const orgBox = $("#party-org");
    if (orgBox) {
      const offs = org.officers || [], bods = org.bodies || [], brs = org.branches || [];
      if (!offs.length && !bods.length && !brs.length) {
        orgBox.innerHTML = `<div class="note">No office, no agent and no branch. ` +
          `${esc(sel.name)} is a label on a ballot and not an organisation.</div>`;
      } else {
        const stName = id => {
          const s0 = (C.stations || []).find(x => x.id === id);
          return s0 ? s0.name : id;
        };
        orgBox.innerHTML =
          (offs.length ? `<div class="rulehead">Officers</div>` + offs.map(o =>
            `<div class="orgrow"><b>${esc(o.name)}</b><span class="orgk">${esc(o.role)}</span>` +
            `<div class="note">${esc(o.note)}</div></div>`).join("") : "") +
          (bods.length ? `<div class="rulehead">Affiliated</div>` + bods.map(b =>
            `<div class="orgrow"><b>${esc(b.name)}</b><span class="orgk">${esc(b.kind)}</span>` +
            `<div class="note">${esc(b.note)}</div></div>`).join("") : "") +
          (brs.length
            ? `<div class="rulehead">On the ground <em>${brs.length}</em></div>` + brs.map(br =>
                `<div class="orgrow"><b>${esc(stName(br.station))}</b>` +
                `<div class="note">${esc(br.note)}</div></div>`).join("")
            : `<div class="rulehead">On the ground</div><div class="note">Nowhere. ` +
              `${esc(sel.name)} keeps no branch, because it has no members to keep one for.</div>`);
      }
    }

    /* the currents */
    const curs = (C.currents || []).filter(c => c.party === sel.id);
    const ch = $("#party-cur-hdr");
    if (ch) ch.textContent = curs.length ? curs.length + " inside the party"
                                         : "none declared";
    const ct = $("#party-currents");
    if (ct) ct.innerHTML = !curs.length
      ? `<tbody><tr><td class="note">No current is declared for this party. A party ` +
        `with no internal current is a bloc that votes.</td></tr></tbody>`
      : `<thead><tr><th>Current</th><th class="n" data-tip="mps">Members</th>` +
        `<th class="n" data-tip="loyalty">Loyalty</th></tr></thead><tbody>` +
        curs.map(cu => {
          const loy = (st.loyalty && st.loyalty[cu.id] != null) ? st.loyalty[cu.id] : cu.loyalty;
          return `<tr><td>${esc(cu.name)}</td><td class="n">${cu.members}</td>` +
            `<td class="n ${loy < 35 ? "warn" : ""}">${loy}</td></tr>`;
        }).join("") + `</tbody>`;

    /* THE MEMBERS — ALL OF THEM, not just the cast.

       This listed C.characters filtered by party, which is the fifty-odd
       people the story names and not the party's bench: the Liberals showed
       nineteen against forty-seven seats. Engine.benchRoll seats the whole
       House the way a division does — a named member per district seat, the
       slate filled from the name pools for the list tier, and the functional
       register — so this is every member, and the same member carries the
       same name here as in a roll call. */
    const bench = (Engine.benchRoll(st, C) || {})[sel.id] || { popular: [], functional: [] };
    const all = bench.popular.concat(bench.functional);
    const mh = $("#party-mp-hdr");
    if (mh) mh.textContent = all.length + " member" + (all.length === 1 ? "" : "s") +
      (bench.functional.length
        ? " · " + bench.popular.length + " popular, " + bench.functional.length + " functional"
        : "");

    /* Payroll first, then the benches, which is the order the House itself
       is read in — same rank as the roll call's. */
    const RANK = { district: 1, functional: 2, list: 3 };
    const GLYPH = { district: "●", list: "□", functional: "▲" };
    const sorted = all.slice().sort((a, b) =>
      (a.payroll ? 0 : 1) - (b.payroll ? 0 : 1) ||
      (RANK[a.tier] || 9) - (RANK[b.tier] || 9) ||
      String(a.seat || "").localeCompare(String(b.seat || "")) ||
      String(a.name || "").localeCompare(String(b.name || "")));

    const byName = {};
    (C.characters || []).forEach(c => { byName[c.name] = c; });
    const mt = $("#party-mps");
    if (mt) mt.innerHTML = !sorted.length
      ? `<tbody><tr><td class="note">This party holds no seat in the present House.</td></tr></tbody>`
      : `<thead><tr><th class="tg" data-tip-title="Tier" data-tip-body="` +
        `Round for a district member, square for the list, triangle for a ` +
        `functional constituency.">&nbsp;</th><th>Member</th><th>Seat</th>` +
        `<th>Office</th></tr></thead><tbody>` +
        sorted.map(m => {
          const ch = byName[m.name];
          const office = ch ? officeOfMember(ch.id) : "";
          return `<tr${m.placeholder ? ' class="ph"' : ""}>` +
            `<td class="tg">${GLYPH[m.tier] || ""}</td>` +
            `<td>${esc(m.name)}</td>` +
            `<td>${esc(m.seat || "list")}</td>` +
            `<td>${esc(office || "Backbench")}</td></tr>`;
        }).join("") + `</tbody>`;
  }

  /* ---------- ways and means ----------
     WHERE THE MONEY COMES FROM, base by base. The state had no income at
     all until the tick learned to collect one, and a revenue nobody can see
     is the same bug from the other side: the player is owed the arithmetic
     and not the answer (\u00a77.6), so this prints the rate, the base it is
     charged on and what each one yields, and lets them add up.

     IT IS A PANEL AND NOT A TAB, deliberately. Debt, credit ratings and an
     inflation number would each be a second way of saying something the
     state already says \u2014 the four prices ARE the inflation, per good \u2014 and
     \u00a77.6 draws the line at a model the player cannot hold in their head.

     The engine hands back a table; nothing is recomputed here, because two
     places that compute one number is how apportionment_ratio drifted. */
  function drawReceipts() {
    const box = $("#gov-receipts"); if (!box) return;
    const r = Engine.receipts(st);
    const RATE = { none: "not levied", low: "reduced",
                   standard: "standing rate", high: "raised" };
    box.innerHTML = r.rows.map(row =>
      `<div class="prow wmrow">
        <div class="plab">${esc(row.name)}<em>${esc(RATE[row.rate] || row.rate)}</em></div>
        <div class="pval">${row.yield.toLocaleString()}</div>
      </div>`).join("") +
      `<div class="prow wmtot">
        <div class="plab">Total receipts<em>every sitting</em></div>
        <div class="pval">${r.total.toLocaleString()}</div>
      </div>`;
  }

  /* The bands' own words. Content names them; this only capitalises. */
  const BAND_WORD = { ring: "Ring", middle: "Middle", low: "Low",
                      far: "Far", external: "External" };
  function bandName(b) {
    return BAND_WORD[b] || String(b).replace(/_/g, " ");
  }

  /* THE PRODUCTIVE ECONOMY (bible §7.10).

     The Economy tab had the Treasury (a stock), ways and means (a flow), the
     four prices and the law that sets them — the cost of EXISTING, four
     times over — and no measure of whether the economy works. This is the
     other half: what the Commonwealth makes, sells and employs.

     Each row says what the number MEANS as well as what it is, because
     "trade 97" is not a fact a reader can use and "a small deficit, and
     widening" is. The author asked for exactly that: descriptions that
     translate the numbers.

     participation and trade are pickable into the big chart like the
     prices. `private` is not: it is authored and never drifts, so it has no
     history to draw and a flat line would be a lie about what it is. */
  function drawEconomyReal() {
    const box = $("#econ-real"); if (!box) return;
    const E = st.economy;
    if (!E) { box.innerHTML = `<div class="note">No productive economy in this save.</div>`; return; }

    const pctSay = v =>
      v >= 52 ? "high participation; almost every adult who can work does"
      : v >= 45 ? "high for this economy, and rising against the founders' assumption"
      : v >= 41 ? "the historic band, a little above the opening"
      : v >= 37 ? "the historic band: most adults do not hold paid work"
      : "low, and the instance-hours are doing the work instead";
    const trSay = v =>
      v >= 130 ? "a large surplus; compute is paying for everything else"
      : v >= 108 ? "a working surplus, sold mostly in substrate-hours"
      : v >= 96  ? "close to balance"
      : v >= 80  ? "a deficit, covered out of the reserve"
      : "a deficit the reserve cannot cover indefinitely";
    const prSay = v =>
      v >= 0.8 ? "mostly private, and the consortiums are most of that"
      : v >= 0.65 ? "mixed, tilted private; the eleven seat-holding firms are outside this figure"
      : v >= 0.45 ? "genuinely mixed"
      : "mostly public; the utilities are held by the union";

    const trend = k => {
      const h = (st.economyHistory || {})[k] || [];
      if (h.length < 4) return "";
      const d = h[h.length - 1] - h[Math.max(0, h.length - 9)];
      return Math.abs(d) < 0.4 ? ", and steady"
           : d > 0 ? ", and rising" : ", and falling";
    };

    const row = (key, label, unit, val, say, pickable) =>
      `<div class="prow${pickable ? " pick" + (chartOn === key ? " on" : "") : ""}"` +
      `${pickable ? ` data-chart="${key}"` : ""}>` +
      `<div class="plab">${label}<em>${say}</em></div>` +
      (pickable ? spark(((st.economyHistory || {})[key] || [val]).slice(-40), 76, 18) : `<div></div>`) +
      `<div class="pval">${val}<span>${unit}</span></div></div>`;

    box.innerHTML =
      row("participation", "In paid work", "%", E.participation.toFixed(1),
          pctSay(E.participation) + trend("participation"), true) +
      row("trade", "Trade balance", "idx", E.trade.toFixed(0),
          trSay(E.trade) + trend("trade"), true) +
      row("private", "In private hands", "%", Math.round(E.private * 100),
          prSay(E.private), false) +
      `<div class="note" style="margin-top:4px">The prices are the cost of existing. ` +
      `These are what the Commonwealth makes, sells and employs. Participation answers ` +
      `to the divergence threshold: a shorter one turns instance-hours into counted jobs.</div>`;
  }

  function drawPrices() {
    const box = $("#gov-prices"); if (!box) return;
    /* THE PRICES ARE PICKABLE TOO, so "show me thermal properly" is one
       click from the row that mentions it rather than a control elsewhere. */
    box.innerHTML = PRICE_META.map(m => {
      const v = st.prices[m.k], h = st.priceHistory[m.k] || [v];
      const base = h[0], chg = v - base;
      const cls = chg > 2 ? "up" : chg < -2 ? "down" : "";
      return `<div class="prow pick${chartOn === m.k ? " on" : ""}" data-chart="${m.k}">
        <div class="plab" data-tip="scarcity">${m.label}<em>${m.unit}</em></div>
        ${spark(h.slice(-40), 76, 18)}
        <div class="pval ${cls}">${v.toFixed(0)}<span>${chg >= 0 ? "+" : ""}${chg.toFixed(0)}</span></div>
      </div>`;
    }).join("") +
    `<div class="note" style="margin-top:4px">Index, 100 at the opening of the series. ` +
    `Every one of these is set by legislation rather than by a market.</div>`;
  }

  /* ---------- government ---------- */
  /* ---------- foreign ----------

     THE SAME INSTRUMENT ON A DIFFERENT AXIS (design/11 §5). The orbital
     chart orders the stations by ALTITUDE; this orders the powers by DELAY,
     because a foreign fact is never current. Nearest first, and every
     standing is stamped with how long ago it was heard rather than printed
     as a live figure, which is the whole mechanic: the anxiety is not that
     you do not know what Mars thinks, it is that you know what Mars thought
     eleven sittings ago. */
  function foreignHTML() {
    const actors = (C.actors || []).filter(a => a.foreign)
      .sort((a, b) => (a.lag || 0) - (b.lag || 0));
    if (!actors.length)
      return `<div class="note">No power outside the Commonwealth is in play this campaign.</div>`;
    const rows = actors.map(a => {
      /* WHAT WE HEARD, NOT WHAT IS TRUE. This printed the live standing with
         "11 sittings behind" beside it, which was the interface asserting a
         mechanic the engine did not have. reportedActor() returns the figure
         as of when it was sent, and the label now says which sitting that
         was — a date rather than a vague delay, because the whole point of
         design/11 is that the staleness is exact and knowable. */
      const rep = Engine.reportedActor(st, a.id);
      const v = rep.standing == null ? a.standing : rep.standing;
      const cls = v >= 60 ? "good" : v <= 30 ? "bad" : "";
      const lag = rep.lag || 0;
      const asOf = !lag ? "as it happens"
        : rep.lastHeard <= 0 ? "as of the opening"
        : "as of sitting " + rep.lastHeard;
      return `<div class="fgn">` +
        `<div class="fgn-h"><b>${cxlink("actor_" + a.id, a.name)}</b><span class="sm2">${esc(a.kind)}</span>` +
        `<span class="fgn-lag"${lag ? ` data-tip-title="A foreign fact is never current"` +
          ` data-tip-body="This is what the ${esc(a.name)} reported, and it took ` +
          `${lag} sitting${lag === 1 ? "" : "s"} to reach the Commonwealth. What they think now is not knowable."` : ""
        }>${esc(asOf)}</span></div>` +
        `<div class="fgn-b"><span class="meter ${cls}"><i style="width:${
          Math.max(0, Math.min(100, v))}%"></i></span><output>${v}</output></div>` +
        `<div class="note">Wants: ${esc(a.asks || "something unstated")}.</div></div>`;
    }).join("");
    /* IN FLIGHT. A dispatch reaches the Commonwealth on a named sitting, and
       the ones the player has not yet read are the ones that matter. */
    const flight = (st.queue || []).filter(q => /^fa_/.test(q.eventId || ""));
    const flying = flight.length
      ? `<div class="rulehead">In flight</div>` + flight.map(q =>
          `<div class="cn"><b>${esc(q.label || "A dispatch")}</b><i>arrives sitting ` +
          `${q.dueSitting}${q.dueSitting > st.sitting
            ? " · " + (q.dueSitting - st.sitting) + " away" : " · today"}</i></div>`).join("")
      : "";
    return rows + flying +
      `<div class="rulehead">The foreign price</div>` +
      `<div class="note">Transit <b>${Math.round(st.prices.transit)}</b>. The fare the ` +
      `stations pay for a launch window, set by schedules that are not the ` +
      `Commonwealth's.</div>`;
  }

  function drawGovernment() {
    drawInitiatives();
    const conf = Engine.confidence(st), maj = Engine.majority(st);
    $("#gov-coalition-hdr").textContent = `${conf}/${Engine.chamberTotal(st)}`;

    /* THE PARTNER ROSTER USED TO BE DRAWN HERE and is not any more. It was
       party/seats/loyalty for the coalition and the confidence-and-supply
       benches — which the Composition table on this same tab already draws
       for all twelve with the partners marked `govrow`, and which the Party
       tab now draws with the ledger and the relation beside it. One roster,
       three drawings, and this was the thinnest of them. The margin below is
       what Chamber uniquely needs. */
    /* THE MARGIN IS THE GAME, SO IT IS DRAWN AND NOT NARRATED.

       confidence() below majority() is the first line of checkLoss: this
       is the number the government dies on. It was a sentence in a note
       under a table, which reads as a footnote, and a player scanning the
       screen for how much trouble they are in had to stop and parse a
       clause. It is the same bar a division uses, with the same threshold
       mark, because it is the same question asked of a different set. */
    const tot = Engine.chamberTotal(st), over = conf - maj;
    $("#gov-margin").innerHTML =
      `<div class="dm"><b>Confidence</b><div class="dmbar"` +
        tipAttr("The working majority",
          "Every seat the government can call on against the " + maj + " it needs. " +
          (over > 0 ? "You can lose " + over + " before the government falls."
           : over === 0 ? "Confidence carries on the exact number. One defection ends it."
           : "You are " + (-over) + " short. The government falls at the next test.")) +
        `><i class="yes" style="width:${Math.min(100, conf / tot * 100)}%;` +
          `background:${over >= 0 ? "var(--ok)" : "var(--alert)"}"></i>` +
        `<span class="thr" style="left:${maj / tot * 100}%"></span>` +
        `<span class="lbl">${conf} / ${tot} &middot; need ${maj}</span></div></div>` +
      `<div class="note">${over === 0
        ? "Working majority of nil. Confidence carries on the exact number."
        : over > 0 ? `Working majority of ${over}.`
        : `Short by ${-over}. The government does not command the House.`}</div>`;

    /* THE OWN-PARTY CURRENTS PANEL IS GONE, and this is why rather than a
        deletion nobody can explain later.

        It came over from the Government tab when the coalition arithmetic
        moved to the Chamber. Then the composition table learned to open a
        party row onto that party's currents — which includes the player's
        own party — and the Chamber was left showing the same four rows
        twice, one panel above the other, on the same screen. One of them
        had to go, and the survivor is the one that works for all twelve
        parties instead of one.

        Nothing else in the interface draws into #gov-currents, so the
        renderer goes with the panel rather than being left to write into a
        node that is not there. */



    /* THE LINE THAT MATTERS IS DRAWN ON THE BAR.

       Two of these five end the game — checkLoss() falls the government
       at party_loyalty <= the leadership-challenge threshold and at
       thermal_margin <= 0 — and the bars said so only by turning amber at
       a number this renderer had made up. A player could not tell a bad
       reading from a fatal one, and the amber could disagree with the
       engine the moment content moved the threshold.

       So the fatal line is READ FROM THE ENGINE'S OWN CONSTANTS and drawn
       as a tick, the same threshold mark a division bar uses, and the
       warning band is derived from it rather than typed beside it. The
       three with no fatal line keep a soft one and say that they have. */
    const fatal = {
      party_loyalty: (C.setup.thresholds || {}).leadershipChallenge,
      thermal_margin: 0
    };
    /* WHICH METERS, AND WHICH WAY IS BAD: content's list (setup.meters), so
       a campaign shows the numbers it is about. The fatal lines are read
       from the engine's own constants. */
    const defs = (C.setup && C.setup.meters) || [
      { k: "party_loyalty", label: "Party loyalty", soft: 25 },
      { k: "public_standing", label: "Public standing", soft: 20 },
      { k: "consumables", label: "Consumables", soft: 25 },
      { k: "thermal_margin", label: "Thermal margin", soft: 12 },
      { k: "solvency", label: "Sovereign solvency", soft: 15 },
      { k: "legitimacy", label: "Legitimacy", soft: 30 },
      { k: "friction", label: "Diplomatic friction", soft: 35, invert: true }
    ];
    $("#gov-meters").innerHTML = defs.map(m => {
      const k = m.k, lab = m.label, soft = m.soft, inv = m.invert;
      const v = st.scalars[k] == null ? 0 : st.scalars[k], f = fatal[k];
      /* A DENOMINATED METER IS STILL A BAR. `solvency` is a quantity with no
         ceiling, so its bar is drawn against the meter's own `max` (a
         hundred thousand MW-years, the same full-scale the old index had)
         and the number is printed exactly beneath it. `soft` and `good` stay
         in the meter's own unit. */
      const max = m.max || 100;
      const pc = Math.max(0, Math.min(100, (v / max) * 100));
      const good = m.good != null ? m.good : max * 0.65;
      const cls = inv
        ? (v >= soft ? "warn" : v <= max * 0.25 ? "good" : "")
        : (f != null && v <= f + 10) || v <= soft ? "warn" : v >= good ? "good" : "";
      const tick = f == null ? "" :
        `<span class="thr" style="left:${Math.max(0, Math.min(100, (f / max) * 100))}%"` +
        tipAttr(lab + " \u2014 the line",
          f <= 0 ? "At nought the stations go dark and the government falls. There is no undo."
                 : "At " + f + " or below the party removes you. There is no undo.") +
        `></span>`;
      /* THE COUNTRY IS NOT ONE PLACE. `public_standing` is the
         electorate-weighted mean of the bands, so the row that shows it
         shows its own parts underneath: a government can be liked in the
         ring and finished in the low band and the national figure will say
         it is doing fine. The strip is not a second number — it is the
         first one, at the resolution the election reads it at. */
      const strip = (k === "public_standing" && st.standing)
        ? `<div class="bandstrip">` + Engine.bandsOf(C).map(b => {
            const n = st.standing[b];
            const far = n - v;
            return `<span class="bs${far <= -6 ? " low" : far >= 6 ? " high" : ""}"` +
              tipAttr(bandName(b) + " band",
                "The government's standing where these seats are: " + n +
                ", against " + v + " nationally. The election reads this, " +
                "not the average.") +
              `><i>${esc(bandName(b))}</i><b>${n}</b></span>`;
          }).join("") + `</div>`
        : "";
      return `<div class="meterrow" data-key="${k}"><label data-tip="${k}">${lab}</label>` +
        `<div class="meter ${cls}"><i style="width:${pc}%"></i>${tick}</div>` +
        `<output>${v}</output></div>` + strip;
    }).join("");

    /* THE LEDGER TABLE MOVED TO THE PARTY TAB. It was partner/ledger/loyalty
       and a note explaining the sign; the Party tab draws the same account
       for all twelve parties, grouped by relation, beside what each bench can
       be moved on — which is the context that makes a credit balance mean
       something. The note travelled with it. A per-partner credit account is
       interparty affairs; this tab is the executive. */

    const left = st.slots.total - st.slots.used;
    const gcap = (C.setup && C.setup.grantsPerSitting) || 2;
    const gtoday = st.grantsToday || 0;
    /* TWO REFUSALS, BOTH SAID OUT LOUD: no time left this session, and the
       day's business already done. The order paper hears so many measures a
       day, exactly as the House divides so many times. */
    const grantRefusal = !left ? "no order-paper time left this session"
      : gtoday >= gcap ? "the House has taken " + gcap + " measures today" : null;
    const hdr = $("#gov-slots-hdr");
    if (hdr) hdr.textContent = left + " of " + st.slots.total + " left this session" +
      (gtoday ? " \u00b7 " + gtoday + " of " + gcap + " today" : "");
    $("#gov-slots").innerHTML =
      `<div class="slotbar">${Array.from({length: st.slots.total}, (_, i) =>
        `<i class="${i < st.slots.used ? "spent" : ""}"></i>`).join("")}</div>` +
      `<div class="note" style="margin-top:4px">A slot is order-paper time: spend one and a measure moves one
       stage closer to its vote. The session holds ${st.slots.total} and they refill when the House rises; the
       House takes ${gcap} measure${gcap === 1 ? "" : "s"} a sitting, and no more. Give a slot to a partner's bill
       and the partner owes you for it. Give it to your own and only your programme advances.</div>` +
      `<table><tbody>${C.bills.filter(b => !st.bills[b.id].dead).map(b =>
        `<tr><td>${b.owner ? mark(b.owner)
            : `<i class="swatch" style="background:var(--chrome-dk)" data-tip-title="No sponsor"` +
              ` data-tip-body="A measure the government did not bring forward."></i>`}${b.title.replace(/ Bill$/, "")}` +
        `${b.priority ? " <span class='flag' data-tip='priority'>PRIORITY</span>" : ""}</td>` +
        `<td class="n">${b.owner && b.owner !== st.playerParty ? "+" + (b.priority ? 3 : 2) : "&mdash;"}</td>` +
        `<td class="n"><button class="btn slotbtn" data-slot="${b.id}"${grantRefusal ? " disabled" : ""}` +
          priceTip("Give time to " + b.title, { slots: 1,
            note: b.owner && b.owner !== st.playerParty
              ? "Moves it a stage and puts " + ps(b.owner) + " +" + (b.priority ? 3 : 2) +
                " in your debt."
              : "Moves it a stage. Your own bill buys you no debt." },
            grantRefusal) + `>${grantLabel(b.id)}</button></td></tr>`
      ).join("")}</tbody></table>`;
    /* THE ORDER PAPER CARRIES UNDERTAKINGS TOO. An order paper lists the
       business, and a promise the government has made is business. This
       is the other end of the docket on the Sitting screen: the item
       appears there when you promise and disappears from both when you
       keep it — by doing the thing, on this screen, with the button that
       already exists. There is deliberately no control here that marks
       one done. */
    const owed = Engine.outstanding(st);
    const ob = $("#gov-owed");
    if (ob) ob.innerHTML = owed.length
      ? owed.map(u => {
          /* A ROW THAT SAYS WHERE IT IS KEPT AND TAKES YOU THERE. An
             undertaking is discharged on another screen — an order to
             sign, a bill to carry — and a promise the player cannot act
             on is a promise they will break by accident. */
          const w = Engine.undertakingWhere(C, u);
          const due = u.by - st.sitting <= 0 ? "due this sitting"
                    : "by sitting " + u.by;
          return `<button class="dk owed goto${u.by - st.sitting <= 1 ? " late" : ""}"` +
            ` data-goto="${w.tab}" data-open="${esc(w.focus || "")}"><b>${esc(u.text)}</b>` +
            `<i>${esc(due)} \u00b7 ${esc(w.how)}</i></button>`;
        }).join("")
      : `<div class="note">The government has given no undertakings.</div>`;
    if (ob) ob.querySelectorAll("[data-goto]").forEach(b =>
      b.addEventListener("click", () => openTarget(b)));

    $("#gov-slots").querySelectorAll(".slotbtn").forEach(btn =>
      btn.addEventListener("click", () => {
        const b = C.bills.find(x => x.id === btn.dataset.slot);
        acted(() => Engine.grantSlot(st, C, btn.dataset.slot));
        cue("stamp");
        setStatus("Order paper time granted to " + (b ? b.title : btn.dataset.slot) +
                  " \u00b7 " + (st.slots.total - st.slots.used) + " of " +
                  st.slots.total + " slots left", "transient");
        drawAll(); afterAction();
      }));

    /* ---- instruments: the fast, deniable tool ---- */
    $("#gov-si").innerHTML = (C.instruments || []).map(si => {
      const s = st.instruments[si.id];
      const chk = Engine.canMake(st, C, si.id);
      const window = s.inForce && s.prayerCloses != null ? (s.prayerCloses - st.sitting) : null;
      let status, cls = "";
      if (s.revoked) { status = "revoked"; cls = "bad"; }
      else if (s.inForce) { status = window > 0 ? "in force · prayable " + window : "in force"; cls = "good"; }
      else if (s.awaitingApproval) { status = "awaiting approval"; }
      else status = si.procedure === "affirmative" ? "affirmative" : "negative";
      const open = siOpen === si.id;
      /* AN ORDER THAT KEEPS A PROMISE SAYS SO. The carve-out promise is
         discharged by signing one order, and a player reading a table of
         thirteen orders should not have to know which. */
      const keeps = Engine.outstanding(st).filter(u =>
        (u.discharge || {}).si === si.id);
      const row = `<tr data-si="${si.id}" class="${s.inForce ? "inforce" : ""}${open ? " open" : ""}">
        <td><i class="caret${open ? " open" : ""}"></i>${si.title.replace(/ Order 2287$/, "")}` +
          (keeps.length ? ` <span class="flag" data-tip-title="Keeps a promise" ` +
            `data-tip-body="${esc(keeps.map(u => u.text).join("  \u00b7  "))}. ` +
            `Signing it here discharges the undertaking.">PROMISE</span>` : "") +
          `<div class="note">${si.number} &middot; ${si.author.replace(/_/g,' ')}</div></td>
        <td class="n"><span class="flag ${cls}" data-tip="${s.inForce ? "prayer" : "instrument"}">${status}</span></td>
        <td class="n">${s.made ? "" :
          `<button class="btn sibtn" data-make="${si.id}"${chk.ok ? "" : " disabled"}` +
            priceTip("Make " + si.number,
                     { free: "Costs no order-paper time. That is the point of an order: " +
                             "it is in force at once, and prayable." },
                     chk.ok ? null : chk.reason) + `>Make</button>`}
          ${s.inForce && window > 0 ? `<button class="btn sibtn" data-pray="${si.id}">Pray</button>` : ""}
          ${s.inForce && si.revocable ? `<button class="btn sibtn" data-revoke="${si.id}">Revoke</button>` : ""}</td>
      </tr>`;
      if (!open) return row;
      /* WHAT THE ORDER DOES, and what it does to the benches. `summary` and
         `effect_note` have been in the data since the ladder was written and
         no surface ever read them — the row carries a title, a number and a
         status and nothing else. This is the surface: the row opens onto its
         own description, the way a seat and a functional constituency do. */
      return row + `<tr class="si-d"><td colspan="3">
        <p>${esc(si.summary || "")}</p>
        ${si.effect_note ? `<p class="note">${esc(si.effect_note)}</p>` : ""}
        <p class="note">${si.procedure === "affirmative"
          ? "Affirmative: the House must approve it before it takes effect."
          : "Negative: in force on being made, and prayable against for " +
            (si.prayer_window || 6) + " sittings."}${si.revocable
          ? " It may be revoked by a further order." : ""}</p>
      </td></tr>`;
    }).join("");
    /* A row opens onto its own description. The Make and Pray controls live
       inside the row, so a click on one must not also toggle the detail. */
    $("#gov-si").querySelectorAll("tr[data-si]").forEach(tr =>
      tr.addEventListener("click", e => {
        if (e.target.closest("button")) return;
        siOpen = siOpen === tr.dataset.si ? null : tr.dataset.si;
        drawGovernment();
      }));
    $("#gov-si").querySelectorAll("[data-make]").forEach(b => b.addEventListener("click", () => {
      const si = (C.instruments || []).find(x => x.id === b.dataset.make);
      const r = acted(() => Engine.makeInstrument(st, C, b.dataset.make));
      if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); Dialog.alert(r.reason, { title: "Order refused" }); }
      else {
        cue("stamp"); score("order");
        setStatus((si ? si.number : b.dataset.make) + " made \u2014 in force at once, and prayable",
                  "transient");
      }
      drawAll(); afterAction();
    }));
    $("#gov-si").querySelectorAll("[data-pray]").forEach(b => b.addEventListener("click", () => {
      const f = Engine.prayerForecast(st, C, b.dataset.pray);
      Dialog.confirm(
        `Forecast ${f.aye} of ${f.total}, needs ${f.need}.\n\n` +
        (f.carries ? "The prayer would carry and the order would be annulled." :
                     "The prayer would be defeated and the order would stand."),
        { title: "Pray against this order?", yes: "Pray", danger: true },
        ok => {
          if (!ok) return;
          acted(() => Engine.prayAgainst(st, C, b.dataset.pray));
          cue(f.carries ? "aye" : "nay");
          /* A CARRIED PRAYER ANNULS THE GOVERNMENT'S OWN ORDER, so it
             fired the triumphant swell for the player losing something.
             Carried, the order goes out of force and the score walks the
             figure back down; defeated, the order merely stands, which is
             the status quo and gets a single hit. */
          score(f.carries ? "revoke" : "undertake");
          setStatus("Prayer against " + b.dataset.pray.replace(/_/g, " ") +
                    (f.carries ? " carried \u2014 the order is annulled"
                               : " defeated \u2014 the order stands"), "transient");
          drawAll(); afterAction();
        });
    }));
    /* ---- the government revokes its own order ---- */
    /* THE OTHER DOOR, AND THE ONLY ONE THE GOVERNMENT HOLDS. A revocable order
       can be taken out of force by the minister who made it, without a division
       and without the House. `revokeInstrument` has been able to do it since
       the instrument landed; nothing offered it, so an order was a one-way
       door and the only route out was the opposition's prayer. */
    $("#gov-si").querySelectorAll("[data-revoke]").forEach(b =>
      b.addEventListener("click", () => {
        const si = (C.instruments || []).find(x => x.id === b.dataset.revoke);
        Dialog.confirm(
          "Revoke " + (si ? si.number + " \u2014 " + si.title : b.dataset.revoke) + "?\n\n" +
          "It goes out of force at once and whatever it did is undone. The benches " +
          "that asked for it will notice, and nothing stops the government making " +
          "it again later.",
          { title: "Revoke the order?", yes: "Revoke", danger: true },
          okd => {
            if (!okd) return;
            const r = acted(() => Engine.revokeInstrument(st, C, b.dataset.revoke));
            if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); return; }
            cue("stamp"); score("revoke");
            setStatus((si ? si.number : b.dataset.revoke) +
                      " revoked \u2014 out of force, and the record says so", "transient");
            drawAll(); afterAction();
          });
      }));

    /* ---- cabinet ---- */
    /* The Prime Minister chairs it, so she heads the list — but she is not a
       post: a post has an author for instruments and can fall vacant, and she
       is neither appointable nor dismissable by the player. */
    const pmCh = C.characterById[C.setup.pm];
    const pmRow = pmCh ? `<tr class="pmrow"><td>Prime Minister</td>` +
      `<td>${bare(pmCh.name)}</td>` +
      `<td class="n">${mark(pmCh.party)}</td></tr>` : "";
    $("#gov-cabinet").innerHTML = pmRow + (C.cabinet || []).map(p => {
      const s = st.cabinet[p.id];
      const ch = s.holder ? C.characterById[s.holder] : null;
      /* THE DISMISSAL. A minister the player can move, which is what makes
         an appointment a bet rather than a menu: the seat bought a faction's
         loyalty, and taking it back costs the relationship that came with
         it. The engine says whether it can be done and why not, so the
         refusal is the engine's sentence and not a second opinion. */
      const gate = Engine.canReshuffle ? Engine.canReshuffle(st, C, p.id) : { ok: false };
      const sack = s.holder
        ? `<button class="btn tiny sack" data-sack="${p.id}"${gate.ok ? "" : " disabled"}` +
          priceTip("Dismiss " + (ch ? bare(ch.name) : p.name),
            { slots: 1, note: "They go to the back benches and do not forgive it. " +
              "Their current reads it as an attack on them." },
            gate.ok ? null : gate.reason) + `>Dismiss</button>`
        : "";
      return `<tr class="${s.holder ? "" : "vacant"}">
        <td>${p.name}${p.senior ? " <span class='flag' data-tip='senior'>SENIOR</span>" : ""}</td>
        <td>${s.holder ? (ch ? bare(ch.name) : s.holder.replace(/_/g," "))
                       : "<span class='flag bad' data-tip='vacant'>VACANT</span>"}</td>
        <td class="n">${s.party ? mark(s.party) : ""}</td>
        <td class="n">${sack}</td></tr>`;
    }).join("");

    $("#gov-cabinet").querySelectorAll("[data-sack]").forEach(btn =>
      btn.addEventListener("click", () => {
        const pid = btn.dataset.sack;
        const post = (C.cabinet || []).find(x => x.id === pid) || {};
        const s = st.cabinet[pid];
        const ch = s && s.holder ? C.characterById[s.holder] : null;
        Dialog.confirm(
          "Dismiss " + (ch ? bare(ch.name) : "the minister") + " from " +
          (post.name || pid) + "? It costs a slot of order-paper time, and " +
          "they will not forgive it.",
          { title: "Reshuffle", ok: "Dismiss" },
          (yes) => {
            if (!yes) return;
            acted(() => Engine.reshuffle(st, C, pid));
            cue("stamp");
            setStatus((ch ? bare(ch.name) : "The minister") + " has been dismissed from " +
                      (post.name || pid), "transient");
            drawAll(); afterAction();
          });
      }));

    /* ---- the appointment ----

       A vacancy the player fills, once. It is not a menu: each name
       carries what appointing them costs, and the cost is paid the
       moment it is made. Leaving it empty is also a decision — a post
       with no holder cannot make a statutory instrument. */
    const vac = Engine.vacancies(st, C);
    const vbox = $("#gov-appoint");
    if (vbox) {
      if (!vac.length) { vbox.innerHTML = ""; vbox.hidden = true; }
      else {
        vbox.hidden = false;
        vbox.innerHTML = vac.map(pid => {
          const post = (C.cabinet || []).find(p => p.id === pid);
          return `<div class="rulehead">${esc(post.title || post.name)} &mdash; vacant</div>` +
            (post.vacatedBy === C.setup.pm
              ? `<div class="note">The post you held until last week. Your first
                   appointment is your own replacement, and it cannot be taken back.</div>`
              : "") +
            Engine.candidates(st, C, pid).map(c => {
              const ch = C.characterById[c.holder];
              const cl = Engine.describe(st, C, c.effects).filter(x => x.text);
              return `<div class="cand">
                <div class="cand-h"><b>${esc(ch ? ch.name : c.holder)}</b>
                  ${c.party ? mark(c.party) : ""}</div>
                <div class="note">${esc(c.note || "")}</div>
                <ul class="ch-eff">${cl.map(x =>
                  `<li class="t-${x.tone}"><i>${x.tone === "good" ? "+" : x.tone === "bad" ? "\u2212" : "\u00b7"}</i>${esc(x.text)}</li>`
                ).join("")}</ul>
                <button class="btn commit grave" data-appoint="${esc(pid)}"
                  data-cand="${c.index}">Appoint ${esc(ch ? bare(ch.name) : c.holder)}</button>
              </div>`;
            }).join("");
        }).join("");

        vbox.querySelectorAll("[data-appoint]").forEach(b => b.addEventListener("click", () => {
          const pid = b.dataset.appoint, ci = +b.dataset.cand;
          const c = Engine.candidates(st, C, pid)[ci];
          const ch = c && C.characterById[c.holder];
          Dialog.confirm(
            (ch ? ch.name : c.holder) + " takes the post. An appointment cannot be undone.",
            { title: "Appoint?", yes: "Appoint", danger: true },
            ok => {
              if (!ok) return;
              const snap = Engine.snapshot(st);
              /* Filling a post makes that ministry's orders makeable, which
                 is a change on Papers and was never reported. */
              const r = acted(() => Engine.fillPost(st, C, pid, ci));
              if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); return; }
              const moved = Engine.changes(snap, Engine.snapshot(st), C);
              cue("stamp"); score("undertake");
              setStatus("Appointed " + (ch ? ch.name : r.holder) +
                        (moved.length ? " \u00b7 " + moved.length + " indicator" +
                         (moved.length === 1 ? "" : "s") + " moved" : ""), "transient");
              saved(); drawAll(); afterAction();
            });
        }));
      }
    }

    $("#gov-pres").innerHTML =
      `<div class="kv"><dt>Incumbent</dt><dd>${C.characterById.tenaya.name.replace("President ", "")}</dd>` +
      `<dt>Relations</dt><dd>${st.president.relationship}</dd></div>` +
      `<div class="rulehead">Reserve powers</div>` +
      `<table><tbody>${st.president.powers.map(p =>
        `<tr><td style="text-transform:capitalize">${p}</td><td class="n"><span class="flag ${st.president.relationship < 35 ? "bad" : ""}" data-tip="live">${st.president.relationship < 35 ? "LIVE" : "DORMANT"}</span></td></tr>`
      ).join("")}</tbody></table>`;

    /* A VERTICAL FEED HOLDS MORE THAN A STRIP DID, and the column scrolls,
       so the wire shows the session's traffic rather than its tail. */
    $("#gov-wire").innerHTML = st.wire.length
      ? st.wire.slice(0, 16).map(w => `<div class="post"><div class="meta">SITTING ${w.sitting}</div><p>${w.text}</p></div>`).join("")
      : `<div class="pbody"><div class="note">No traffic this session.</div></div>`;
  }

  /* THE FOUR AXES, and the words for them. A bill and a party are both
     described on these, which is what makes "why" derivable rather than
     written: the reason a bench votes a way IS its position against the
     bill's, and the engine already computes that distance for the division. */
  /* THE AXES ARE SIGNED NOW, so agreement is a DEGREE and not a yes or no.

     This read `paxes[a] === baxes[a]` against categorical strings, which
     made a party one step off the bill and a party at the opposite pole
     the same picture. With numbers in -1..+1 the reason a bench is where
     it is has a size, and the short form gets a third mark for the middle:

         eco+ sov+ per−        with on economic and sovereignty, against
                              on personhood
         tra·                 declared a position and it is the centre

     NO LIST HERE EITHER. There were two hardcoded axis maps in this file
     and the engine deliberately has none; the codes are the first three
     letters of whatever dimensions the party and the bill both declare,
     so adding one to content reaches this drawing with no edit. The pole
     NAMES come from SCHEMA, which index.html now loads — one copy of
     "public/private", in the file CLAUDE.md calls the content vocabulary. */
  const axisCode = a => a.slice(0, 3);
  const axisPoles = a => {
    const v = (typeof SCHEMA !== "undefined" && SCHEMA.vocab && SCHEMA.vocab.axes)
      ? SCHEMA.vocab.axes[a] : null;
    return v && v.low ? v : null;
  };
  /* Where one position sits on its own axis, in words: "public" rather than
     "-0.75". The centre is named as the centre, because a party that has
     taken the middle has taken a position and content said so. */
  function axisAt(a, v) {
    if (typeof v !== "number") return String(v);
    const p = axisPoles(a);
    if (!p) return v.toFixed(2);
    const end = v < 0 ? p.low : p.high, m = Math.abs(v);
    if (m < 0.15) return "the centre";
    return (m >= 0.7 ? "strongly " : m >= 0.35 ? "" : "mildly ") + end;
  }

  /* The shared dimensions and how far apart the two are on each, using the
     engine's own scoring so a tooltip cannot disagree with a division. */
  function axisPairs(paxes, baxes) {
    const out = [];
    Object.keys(paxes || {}).forEach(a => {
      const pa = paxes[a], ba = (baxes || {})[a];
      if (pa == null || ba == null) return;
      /* pa * ba, which is the TERM the engine's cosine sums, so a per-axis
         mark can never contradict the overall score. Positive means the two
         lean the same way and the magnitude is how much both of them care;
         near zero means one of them is at the centre. `1 - |pa - ba|` was
         here first and is biased positive, which would have drawn "+" on
         axes the division counted against. */
      const agree = (typeof pa === "number" && typeof ba === "number")
        ? pa * ba
        : (pa === ba ? 1 : -1);
      out.push({ axis: a, agree: agree });
    });
    return out;
  }

  /* WHY A PARTY IS WHERE IT IS, read off the axes it and the bill share. A
     party with no settled position on an axis the bill moves says nothing
     about it, rather than being given a reason content did not. */
  function axisWhy(paxes, baxes) {
    return axisPairs(paxes, baxes).map(x =>
      axisCode(x.axis) +
      (x.agree >= 0.1 ? "+" : x.agree <= -0.1 ? "\u2212" : "\u00b7")).join(" ");
  }

  /* The same thing said in words, for the hover card. */
  function axisWhyLong(paxes, baxes) {
    const ps = axisPairs(paxes, baxes);
    if (!ps.length) return "No position on the axes this bill moves.";
    const G = { with: [], broadly: [], middle: [], against: [], opposite: [] };
    ps.forEach(x => G[x.agree >= 0.45 ? "with" : x.agree >= 0.1 ? "broadly"
                     : x.agree > -0.1 ? "middle"
                     : x.agree > -0.45 ? "against" : "opposite"].push(x.axis));
    const list = a => a.length > 1
      ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0];
    const say = [];
    if (G.with.length)     say.push("with it on " + list(G.with));
    if (G.broadly.length)  say.push("broadly with it on " + list(G.broadly));
    if (G.middle.length)   say.push("close to the middle on " + list(G.middle));
    if (G.against.length)  say.push("against it on " + list(G.against));
    if (G.opposite.length) say.push("at the opposite end on " + list(G.opposite));
    const t = say.join("; ");
    return t.charAt(0).toUpperCase() + t.slice(1) + ".";
  }

  /* WHAT THE BILL DOES, in the engine's own reading of its own effects.
     Engine.describe() is the same function the choice labels use, so a bill
     cannot claim an effect it does not have — the words are read off onPass
     rather than written beside it. */
  function billDoesHTML(b) {
    /* MATERIAL EFFECTS ONLY. A wire headline and a flag are bookkeeping: a
       bill that "puts it on the wire" has changed nothing in the world, and a
       list headed "what it does" cannot say that. */
    const KEEP = ["law","station","move","price","seats","functional","coalition","relationship"];
    const material = (b.onPass || []).map(e => {
      const o = {};
      KEEP.forEach(k => { if (e[k] != null) o[k] = e[k]; });
      return o;
    }).filter(e => Object.keys(e).length);
    const lines = Engine.describe(st, C, material);
    if (!lines.length) return "";
    return `<div class="rulehead">What it does</div>
      <ul class="does">${lines.map(l =>
        `<li class="${esc(l.tone || "")}">${esc(l.text)}</li>`).join("")}</ul>`;
  }

  /* THE RULE THE MEASURE RUNS UNDER, said before the division rather than
     discovered in it. Three rules and no more: supply, the dual test, and
     the ordinary majority. A supply bill is the one that cannot be stopped
     and can be held, which is the whole of T18 and the reason the forty
     appear in a money division at all. */
  function billRuleHTML(b) {
    if (b.test === "supply")
      return `<div class="rulehead">The rule</div><div class="note">` +
        `A money bill. The elected benches vote money, so it needs a majority of ` +
        `the 240 and nothing else: a budget touches every subject there is, so the ` +
        `domain test is not applied to it. The functional forty divide and are ` +
        `recorded. They cannot stop it, and a bench that votes it down holds it ` +
        `for three sittings — paid in the one currency that cannot be topped up.</div>`;
    if (b.dualMajority)
      return `<div class="rulehead">The rule</div><div class="note">` +
        `The dual test applies. It must carry separately among the 240 elected ` +
        `members and among the functional forty, and a functional constituency ` +
        `whose subject the measure touches may object to it. A bill can carry ` +
        `the House and fail the bench.</div>`;
    return `<div class="rulehead">The rule</div><div class="note">` +
      `A simple majority of the 240 elected members. The functional forty do not ` +
      `divide on it.</div>`;
  }

  /* WHICH WAY IT MOVES THE ARGUMENT. A bill is positioned on the same four
     axes as the parties are, and those axes are what the fight is about -
     so this is the measure's direction in the terms the rest of the game
     argues in, read off its own stance rather than written beside it. */
  const AXIS_DIR = {
    ownership:   { public:"toward public ownership", private:"toward private ownership" },
    personhood:  { expansionist:"toward the expansion of personhood",
                   restrictionist:"toward restriction" },
    sovereignty: { federal:"toward the federation", station:"toward the stations" },
    closure:     { integrationist:"toward integration", closurist:"toward closure" }
  };
  function billAxesHTML(b) {
    const a = b.axes || {};
    const moves = Object.keys(AXIS_DIR).filter(k => a[k] && AXIS_DIR[k][a[k]])
      .map(k => AXIS_DIR[k][a[k]]);
    if (!moves.length) return "";
    return `<div class="note"><b>Moves the argument</b> ${moves.join("; ")}.</div>`;
  }

  /* WHO IS FOR IT, AND WHY. The stance is content; the reason is the axis
     reading above, so the table can never disagree with the division the
     dividers will actually run. A party with no seats on either bench is not
     in the House and is not listed. */
  function billWhoHTML(b) {
    const rows = C.parties.map(p => {
      if (!Engine.partyTotal(st, p.id)) return null;
      const s = (b.stances || {})[p.id];
      const read = s === "for" ? "for"
        : s === "against" ? "against"
        : s === "abstain" ? "abstains"
        : s && s.free ? "a free vote"
        : s && s.forPct != null ? `splits, ~${Math.round(s.forPct * 100)}% for`
        : s && s.for != null ? `${s.for} for`
        : s && (s.popular != null || s.functional != null) ? "split by bench"
        : null;
      const why = axisWhy(p.axes, b.axes);
      return `<tr><td>${mark(p.id)}${esc(ps(p.id))}</td>` +
        `<td class="st${s === "for" ? " yea" : s === "against" ? " nay" : ""}">` +
          `${read ? esc(read) : "inferred"}</td>` +
        `<td class="wy" data-tip="billwhy" data-tip-title="${esc(p.name)}"` +
          ` data-tip-body="${esc(axisWhyLong(p.axes, b.axes))}">${esc(why)}</td></tr>`;
    }).filter(Boolean).join("");
    if (!rows) return "";
    return `<div class="rulehead">Who is for it, and why</div>
      <table class="billwhy"><tbody>${rows}</tbody></table>
      <div class="note wykey">own / per / sov / clo \u2014 with it <b>+</b>, against it <b>\u2212</b>.
        Hover a row for the long form.</div>`;
  }

  /* THE DIVISION LIST — every member, by name, after the fact.

     The roll call shows the House dividing and it cannot do this: two
     hundred and eighty names go past in about fourteen seconds, which is
     twenty a second, and nobody reads that. Trying to make the animation
     legible was the wrong fix, because the animation is for the SHAPE —
     the bench moving, the count climbing against the threshold. The names
     belong where a parliament actually puts them: in a list published
     afterwards, read at your own pace.

     Hansard's own form, and folded, because it is a record and not a
     readout — a player consults it when they want to know who, and the
     rest of the time it is one line saying a division happened. */
  const dvlOpen = {};      /* which division lists the player has open */
  /* HOW THE LIST IS ORDERED. Party is the roll's own order and the default;
     by vote is the shape of the result, which is the other thing a player
     opens a division to see. The choice is the player's and it holds for
     every list, so the record reads the same way wherever it is opened. */
  let dvlSort = "party";

  function divisionList(id, inCaption) {
    const bs = bsOf(id);
    if (!bs || !bs.lastDivision) return "";
    const rc = Engine.rollCall(st, C, id, bs.lastDivision);
    const parties = (rc.parties || []).filter(p =>
      (p.popular.length + p.functional.length) > 0);
    if (!parties.length) return "";

    /* EVERY MEMBER, WITH THE PARTY THAT RETURNED THEM. The roll groups by
       party and carries the party on the group; the vote order needs it on
       the member, or the benches vanish from the one view that is about
       how the House divided. */
    const house = [];
    parties.forEach(p => p.popular.concat(p.functional).forEach(m =>
      house.push(Object.assign({}, m, { party: p.party }))));

    const head = (label, sub) =>
      `<div class="lroll-h"><b>${label}</b><span>${sub}</span></div>`;

    let body;
    if (dvlSort === "vote") {
      const TITLE = { aye: "Ayes", nay: "Noes",
                      abstain: "Abstentions", absent: "No vote recorded" };
      body = ["aye", "nay", "abstain", "absent"].map(v => {
        const members = house.filter(m => m.vote === v);
        if (!members.length) return "";
        return `<div class="dvl-p">` +
          head(TITLE[v], members.length + (members.length === 1 ? " member" : " members")) +
          `<div class="lroll-g">${rollChips(members)}</div></div>`;
      }).join("");
    } else {
      /* THE ROLL CALL, KEPT. The count filed the House in by party and showed
         every member a chip; the record is the SAME PAGE with the same chips,
         party by party, read at leisure — the vote is the chip's colour and
         the tally is at the head of the bench. It used to re-sort the House
         into Ayes and Noes and print the names as a run of text, so the one
         screen that showed you the division was the one screen you could not
         read it on: the names ran off the edge, and the chips' hover — the
         constituency, the register reference, the list seat — was gone. */
      body = parties.map(p => {
        const all = p.popular.concat(p.functional);
        const cnt = v => all.filter(m => m.vote === v).length;
        const parts = [];
        ["aye", "nay", "abstain", "absent"].forEach(v => {
          const n = cnt(v);
          if (n) parts.push(n + " " + (v === "absent" ? "away" : v));
        });
        return `<div class="dvl-p">` +
          head(esc(pn(p.party)), esc(parts.join(" \u00b7 "))) +
          `<div class="lroll-g">${rollChips(all)}</div></div>`;
      }).join("");
    }

    /* THE ORDER IS A CONTROL, not a setting buried elsewhere: it changes what
       the page in front of the player says and it is the only thing on the
       page that does. Two radios, the same construction the chamber's view
       controls use. */
    const sortCtl = `<div class="dvl-sort" role="radiogroup" aria-label="Order of the division list">` +
      `<span class="dvl-sort-l">Order</span>` +
      `<button class="chv rad${dvlSort === "party" ? " on" : ""}" role="radio" ` +
        `aria-checked="${dvlSort === "party"}" data-dvlsort="party">By party</button>` +
      `<button class="chv rad${dvlSort === "vote" ? " on" : ""}" role="radio" ` +
        `aria-checked="${dvlSort === "vote"}" data-dvlsort="vote">By vote</button>` +
      `</div>`;

    const d = bs.lastDivision;
    const total = house.length;
    /* IT STAYS OPEN. The first attempt marked it open only on the render
       that followed the division, so the next redraw — and a redraw
       happens for any reason at all — replaced the node without the
       attribute and the list vanished after a flash. Never seen again,
       which is what was reported.

       The open state is remembered per division instead, defaulting to
       open for the one just run, and the player's own toggle wins from
       then on. Keyed by bill and sitting, so a later division on the same
       bill opens fresh rather than inheriting the last one's state. */
    /* CLOSED BY DEFAULT, ALWAYS. The names are read in the caption at the
       end of the division now, which is where a player wants them; this
       is the copy they come back to, and a record you come back to should
       be waiting quietly rather than already unrolled. The player's own
       toggle is remembered per bill and sitting. */
    const key = id + ":" + d.at;
    if (dvlOpen[key] === undefined) dvlOpen[key] = false;
    /* In the caption it is the point of the screen, so it is open and it
       does not touch the remembered state of the copy in the column. */
    const open = inCaption ? true : dvlOpen[key];
    /* THE CAPTION'S COPY WEARS ITS OWN BAR. It is the one division list with
       a bounded height and its own overflow, and it is built after boot, so
       it asks for the terminal's drawn scrollbar by name (`.forcebar`) and
       is decorated when it is inserted. */
    return `<details class="dvl${inCaption ? " incap" : ""}"` +
      `${inCaption ? "" : ` data-dvl="${esc(key)}"`}` +
      `${open ? " open" : ""}><summary><b>Division list</b>` +
      `<span>sitting ${d.at} &middot; ${d.carries ? "carried" : "not carried"} ` +
      `&middot; ${total} members</span></summary>` +
      `<div class="dvl-b${inCaption ? " scrolls forcebar" : ""}">` + sortCtl + body +
      `<p class="dvl-f">Party by party, as the roll was called. Green is an
       aye, red a no, amber an abstention and a dashed edge means the member
       did not vote; hover a name for the seat it was cast for.</p></div></details>`;
  }

  /* The order radios, wired wherever the list was just inserted. `rerender`
     is the caller's own way of drawing the list again — the caption redraws
     its own node, the whip panel redraws the chamber. */
  function wireDvl(root, rerender) {
    if (!root) return;
    root.querySelectorAll("[data-dvlsort]").forEach(b =>
      b.addEventListener("click", () => {
        if (dvlSort === b.dataset.dvlsort) return;
        dvlSort = b.dataset.dvlsort;
        cue("click");
        rerender();
      }));
  }

  /* A BILL'S OWN RECORD (design/26 #84). Every advance, every division, every
     referral and its date, newest first. Folded, because it is a record rather
     than a readout and the dossier already says where the bill is; open, it is
     the page that answers "what has this measure actually been through". */
  function billHistoryHTML(bs) {
    const h = (bs && bs.history) || [];
    if (!h.length) return "";
    return `<details class="bhist"><summary><b>History</b>` +
      `<span>${h.length} entr${h.length === 1 ? "y" : "ies"}</span></summary>` +
      `<div class="bhist-b"><table><tbody>${h.map(x =>
        `<tr class="k-${esc(x.kind || "")}"><td class="n">s${x.sitting}</td>` +
        `<td>${esc(x.text)}</td></tr>`).join("")}</tbody></table></div></details>`;
  }

  /* AMENDMENTS (design/25 §7). A bill declares its own in content; the
     government moves one at COMMITTEE. Moving it spends order-paper time,
     applies its effects at once and goes on the bill's own record. The panel
     names the reason a move is refused rather than hiding the options, and a
     moved amendment stays on the page wearing its flag. */
  function amendmentsHTML(b, bs) {
    const all = b.amendments || [];
    if (!all.length) return "";
    const chk = Engine.canAmend(st, C, b.id);
    const taken = bs.amendments || [];
    const rows = all.map(a => {
      const done = taken.some(x => x.id === a.id);
      const can = chk.ok && !done;
      return `<div class="amd${done ? " done" : ""}">` +
        `<div class="amd-h"><b>${esc(a.label)}</b>` +
        (done ? ` <span class="flag good">MOVED</span>` : "") + `</div>` +
        (a.note ? `<div class="note">${esc(a.note)}</div>` : "") +
        (done ? "" : `<button class="btn amdbtn" data-amend="${esc(a.id)}" ` +
          `data-bill="${esc(b.id)}"${can ? "" : " disabled"}` +
          tipAttr("Move the amendment", can
            ? "Spends one order-paper slot and applies at once. The bill keeps " +
              "its own record of it, and the benches move as its effects say."
            : chk.reason) + `>Move</button>`) +
        `</div>`;
    }).join("");
    return `<div class="rulehead">Amendments <em>moved at committee</em></div>` +
      (chk.ok ? "" : `<div class="note">${esc(chk.reason)}.</div>`) + rows;
  }

  function drawBill(id) {
    const b = C.billById[id], bs = bsOf(id), dchk = Engine.canDivide(st, C, id);
    /* The forecast is the REPORTED division, not the exact one (design/08 §7),
       and so is every other number the player is shown about it — the bars
       here, the seats on the Chamber plan, the breakdown beside them. The
       true count is reached only where a MECHANIC needs it: what a seat
       costs to whip, and the division itself. */
    const rep = forecast(id);
    const det = $("#bill-detail");
    $("#bill-hdr").textContent = b.title;
    $("#bill-ref").textContent = b.ref;
    det.innerHTML =
      /* WHAT IT DOES LEADS, AND GETS THE ROOM. The opinions are real and stay,
         but they are a column beside the substance rather than the substance:
         the summary, the effect and the engine's reading of the effects are
         what the player is deciding about. */
      `<div class="billbody">` +
        `<div class="billmain">` +
          `<div class="note">${b.summary}</div>` +
          /* WHERE IT IS, IN FULL. The order paper carries the one-line bar;
             here is the ladder itself, the same renderer the register uses, so
             the two can never tell the player different stories about a bill. */
          (typeof Papers !== "undefined" && Papers.stageTrack
            ? `<div class="rulehead">Where it is</div>` + Papers.stageTrack(b, bs)
            : "") +
          (b.effectNote ? `<div class="rulehead">Effect</div><div class="note">${b.effectNote}</div>` : "") +
          billAxesHTML(b) +
          billDoesHTML(b) +
          billRuleHTML(b) +
          amendmentsHTML(b, bs) +
          /* NOT THE FORECAST. It is drawn under the plan, a hand's width to
             the right on the same screen, where it doubles as the legend for
             the seat colouring. Two copies of one number is not emphasis. */
          `<div class="note" style="margin-top:5px">${
            rep.carries ? "<b>Carries</b> as the benches stand." :
            (b.dualMajority && rep.popular.carries && !rep.functional.carries
              ? "<b>Carries on the popular benches and fails on the functional.</b> The dual test applies: bills touching life-support integrity and charter amendments must carry separately among functional members."
              : "<b>Fails</b> as the benches stand.")}</div>` +
        `</div>` +
        `<div class="billside">` + billWhoHTML(b) + `</div>` +
      `</div>` +
      whipLine(id) +
      dayLine(id, dchk) +
      `<div class="btnrow">
         <button class="btn" id="btn-divide"${bs.dead ? " disabled" : ""}` +
           priceTip("Move to a division",
                    Object.assign({ slots: 1 }, Engine.whipCost(st, C, id)),
                    bs.dead ? "the bill is dead" : dchk.ok ? null : dchk.reason) + `>Move to a division</button>
       </div>` +
      daySetterHTML(id, bs) +
      billHistoryHTML(bs);

    /* THE DAY OF A DIVISION IS HERS (design/18 §4). The engine has been able
       to set and move the day since the day it landed — `setDivision` writes
       `bs.dividesOn`, the calendar and the docket carry it, and `canDivide`
       refuses to divide before it. No screen ever called it, so the date was
       the engine's own `sitting + 2` and the most consequential piece of
       timing a government controls was not a decision. Name it early and you
       divide on the whips you have; name it late and the other side has the
       time too. */
    function daySetterHTML(billId, bs) {
      if (bs.dead || bs.stage === "drafting" || bs.stage === "assented") return "";
      if (st.sessionEnds == null) return "";
      const last = st.sessionEnds;
      const first = st.sitting + 1;
      if (first > last) return "";
      let btns = "";
      for (let d = first; d <= last; d++)
        btns += `<button class="daybtn${bs.dividesOn === d ? " on" : ""}"` +
          ` data-day="${d}" data-bill="${esc(billId)}"` +
          tipAttr("Sitting " + d, bs.dividesOn === d
            ? "The division is set for this sitting. Naming another moves it."
            : "Set the division down for sitting " + d + ". The House divides " +
              "on its day, and not before.") + `>${d}</button>`;
      return `<div class="dayset"><span class="dayset-l">` +
        (bs.dividesOn != null ? "Division set for sitting " + bs.dividesOn + ". Move it"
                              : "Set the day") +
        `</span><span class="dayset-b">${btns}</span>` +
        `<span class="dayset-h">the House rises at sitting ${last}</span></div>`;
    }

    /* A division that has been SET happens on its day. The button says
       when rather than going quiet: a control that is merely dead tells
       the player nothing about why. The reason itself is on the card the
       template already built, never a native title (js/tips.js). */
    const dbtn = $("#btn-divide");
    if (dbtn && !dchk.ok) {
      /* Every refusal says what it is on the face of the control. A
         disabled button with its old label on it reads as broken. */
      dbtn.disabled = true;
      if (dchk.on != null) dbtn.textContent = "Division set for sitting " + dchk.on;
      /* A division is House time (design/18 §3), so no time is a reason
         to refuse — and a refusal the player cannot see is a bug report. */
      else if (dchk.noTime) dbtn.textContent = "No order-paper time left";
      else if (dchk.unread) dbtn.textContent = "Not yet read a second time";
      else if (dchk.full)   dbtn.textContent = "The House has finished for today";
    }
    $("#btn-divide").addEventListener("click", () => {
      if (!Engine.canDivide(st, C, id).ok) { cue("deny"); return; }
      /* the drums come in while the division is being read out */
      score("tension");
      /* THE DIVISION RESOLVES HERE, ON THE CLICK, BEFORE ANYTHING IS
         SHOWN. Engine.divide pays the whips, moves the stage, logs it and
         puts the bill in front of the President; the dialog that follows
         reads out numbers that are already final. That is deliberate and
         it is what makes the whole thing safe to skip: there is no state
         left inside the animation to lose. Presentation only - the
         arithmetic is untouched. */
      /* A DIVISION IS AN ACTION AND IT REPORTS ITSELF LIKE ONE. Every
         other mutating action goes through acted(), which is what raises
         the cross-tab notice — so settling a lobby on the division opened
         undertakings that appeared on the Government tab with nothing
         saying they had. The promises are the price of the bench and the
         player should be told they are now owed. §12.13. */
      const beforeDiv = structure(st);
      countFreeze = { id, stage: st.bills[id].stage, dead: st.bills[id].dead,
                      dividesOn: st.bills[id].dividesOn,
                      lastDivision: st.bills[id].lastDivision };
      const out = Engine.divide(st, C, id) || {};
      const r = out.result || {};
      countDivision(r.rows, out).then(() => {
        countFreeze = null;
        /* THE RESULT IS SHOWN WHEN THE COUNT IS READ, not before: the
           card, the redraw and the flash all wait for the declaration,
           so nothing on the screen gives the division away while the
           lobbies are still filling. */
        reportMoves(beforeDiv, structure(st));
        /* A dual bill can carry the House and still fall, which is the
           whole argument of the game, so the line names BOTH tests and not
           just the verdict. Assent is a third gate again: carrying sends it
           to the President, who may refer it rather than sign. */
        const tally = (r.popular ? " \u00b7 popular " + r.popular.aye + "/" + r.popular.need : "") +
          (b.dualMajority && r.functional
            ? " \u00b7 functional " + r.functional.aye + "/" + r.functional.need : "");
        setStatus(b.title + " \u2014 " +
                  (!r.carries ? "not carried"
                    : out.assent && out.assent.referred ? "carried, and referred for review"
                    : "carried") + tally, "transient");
        drawAll(); afterAction();
      });
    });

    /* The day picker. Naming a day is an action like any other, so it goes
       through acted() and reports itself on the status line. */
    det.querySelectorAll(".daybtn").forEach(btn =>
      btn.addEventListener("click", () => {
        if (btn.classList.contains("on")) return;
        const day = +btn.dataset.day;
        const r = acted(() => Engine.setDivision(st, C, btn.dataset.bill, day));
        if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); return; }
        cue("click");
        const away = day - st.sitting;
        setStatus(b.title + " set down for sitting " + day + " \u00b7 " + away +
                  " sitting" + (away === 1 ? "" : "s") + " away", "transient");
        drawAll(); afterAction();
      }));

    /* Moving an amendment: an action, so it goes through acted(). */
    det.querySelectorAll(".amdbtn").forEach(btn =>
      btn.addEventListener("click", () => {
        const r = acted(() => Engine.amendBill(st, C, btn.dataset.bill, btn.dataset.amend));
        if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); return; }
        cue("stamp"); score("undertake");
        setStatus("Amendment moved: " + (r.amendment.label || btn.dataset.amend) +
                  " \u2014 applied at once", "transient");
        drawAll(); afterAction();
      }));
  }

  /* THE BUTTON NAMES THE DESTINATION.

     It said "Grant", which is a verb with no object: a new player can
     press it repeatedly without ever learning that it moves a bill one
     stage along a ladder, that the ladder is what the division gate reads,
     or that a measure at drafting is two grants and a division away — a
     third of a session's time. A control that states its outcome cannot be
     spammed by accident, which is a cheaper fix than any animation. */
  function grantLabel(billId) {
    const bs = bsOf(billId);
    const i = Engine.STAGE_ORDER.indexOf(bs.stage);
    const next = bs.stage === "blocked" ? "second_reading"
               : i >= 0 && i < Engine.STAGE_ORDER.length - 1 ? Engine.STAGE_ORDER[i + 1]
               : null;
    return next ? `Grant &rarr; ${esc(next.replace(/_/g, " "))}` : "Grant";
  }

  /* ---------- PRICE, AND REFUSAL ----------

     Every control that spends says what it spends and what it leaves.
     Every control that refuses says why. One mechanism, because they are
     the same sentence in two moods: this costs two slots and you have
     four; this costs two slots and you have one.

     Before this you learned the price by paying it, and a disabled
     button said nothing at all — canDivide has returned a reason since
     design/18 and only the divide button used it, through a native
     title=, which js/tips.js forbids in as many words: slow, unstyled,
     invisible to a keyboard, and it cannot say two things at once. Three
     call sites were quietly ignoring that. They do not now.

     Returns an ATTRIBUTE STRING, so it drops into the template literal a
     control is already built from and no renderer has to grow a branch. */
  function tipAttr(title, body) {
    return body ? ` data-tip-title="${esc(title)}" data-tip-body="${esc(body)}"` : "";
  }
  function slotWord(n) { return n + " slot" + (n === 1 ? "" : "s"); }
  function priceTip(what, spend, refusal) {
    const bits = [];
    const s = spend || {};
    if (s.slots) {
      const left = st.slots.total - st.slots.used;
      bits.push(slotWord(s.slots) + " of order-paper time. " +
        (s.slots > left ? left + " left this session \u2014 not enough."
                        : left + " left, " + (left - s.slots) + " after."));
    }
    Object.keys(s.capital || {}).forEach(pid => {
      const n = s.capital[pid], have = st.capital[pid] || 0;
      bits.push("Capital with " + ps(pid) + " \u2212" + n + (s.per || "") +
        " (" + (have >= 0 ? "+" : "") + have + " now" +
        (s.per ? ")." : ", " + (have - n > 0 ? "+" : "") + (have - n) + " after" +
                       (have - n < 0 ? ", overdrawn" : "") + ")."));
    });
    if (s.loyalty) bits.push("Own-party loyalty \u2212" + s.loyalty + (s.per || "") + ".");
    if (s.free && !bits.length) bits.push(s.free);
    if (s.note) bits.push(s.note);
    if (refusal) bits.push("Refused: " + refusal + ".");
    return tipAttr(what, bits.join(" "));
  }

  /* ---------- what the player is shown about a division ----------

     ONE function, so the bars, the seating plan and the breakdown cannot
     drift apart. Every one of them is the whips' estimate; the true count
     is reached only by Engine.division, and only where a mechanic needs
     it (what a seat costs to whip, and the division itself). */
  function forecast(billId) {
    return Engine.reported ? Engine.reported(st, C, billId)
                           : Engine.division(st, C, billId);
  }

  /* HOW THE HOUSE WENT, OR HOW IT IS EXPECTED TO GO. Up to the division these
     are the same thing — an estimate — and after it they are not. The engine
     records the result on the bill the moment it runs, so the plan can show
     the House that actually voted rather than the one the whips guessed at. */
  const houseVoted = id => !!(bsOf(id) && bsOf(id).lastDivision);
  const houseRead  = id => (bsOf(id) && bsOf(id).lastDivision) || forecast(id);

  /* THE HOUSE, BY PARTY — composition and forecast in one table.

     These were two panels, 745px of a 818px column between them, and the
     second one's "of" columns WERE the first one: seats per party per
     tier, printed twice, one of them behind a hidden panel. Composition
     is what the House is made of; the forecast is what it is expected to
     do with the measure in hand. They are the same rows.

     So the table is always the composition, and naming a measure adds two
     columns and the currents under their party. Short party codes, one
     line each: the swatch carries the full name, the seat count and where
     the party stands on a card, which is what that change bought.  */
  function benchTableHTML(d) {
    const armed = !!d;
    /* ABSTENTION AND ABSENCE, WHERE THE COUNT IS.

       The engine has counted three ways since 14 September and four since
       pairing landed on the 15th, and this table still rendered two: a
       party that abstained was indistinguishable from a party that voted
       against, which is the difference between declining to take a side
       and taking one.

       The column is CONDITIONAL, because most divisions have neither and a
       permanently empty column is a worse lie than a missing one — it says
       nobody ever abstains. It appears the moment anybody does. */
    const off = (r) => (r.popularAbstain || 0) + (r.popularAbsent || 0) +
                       (r.functionalAbstain || 0) + (r.functionalAbsent || 0);
    const anyOff = armed && d.rows.some(r => off(r) > 0);
    const seatsOf = id => st.parties[id].seats;
    const cell = (aye, whipped) => whipped
      ? (aye - whipped) + `<span class="wh">+${whipped}</span>`
      : aye;
    let h = `<thead><tr><th>Party</th>` +
      `<th class="n" data-tip="district">D</th><th class="n" data-tip="list">L</th>` +
      `<th class="n" data-tip="functional">F</th><th class="n" data-tip="seats">Tot</th>` +
      (armed ? `<th class="n" data-tip="popular">Aye</th>` +
               `<th class="n" data-tip="functional">F&#8239;aye</th>` : "") +
      (anyOff ? `<th class="n" data-tip-title="Not voting" ` +
        `data-tip-body="Abstentions and absences together. An abstention is a ` +
        `stated position: the member is present and declines. An absence is a ` +
        `pair \u2014 two members on opposite sides who agree not to vote, so ` +
        `neither side loses by it.">Not&#8239;v.</th>` : "") +
      `</tr></thead><tbody>`;
    const govIds = st.coalition.concat(st.confidenceSupply);
    C.parties.forEach(p => {
      const sq = seatsOf(p.id), r = armed && d.rows.find(x => x.party === p.id);
      const mine = (C.currents || []).filter(cu => cu.party === p.id);
      const open = compOpen === p.id && mine.length;
      h += `<tr class="${govIds.includes(p.id) ? "govrow " : ""}` +
        `${mine.length ? "compable" : ""}${open ? " compopen" : ""}"` +
        `${mine.length ? ` data-comp="${p.id}"` : ""}>` +
        /* THE FULL NAME. There is room for it in this column — eleven rows of
           short numbers — and a composition table is the one place the reader
           wants to know which party, not which three letters. */
        `<td class="pn">${mark(p.id)}${pname(p.id)}` +
        (mine.length ? `<span class="compcar" aria-hidden="true">${open ? "−" : "+"}</span>` : "") +
        `</td>` +
        `<td class="n">${sq.district}</td><td class="n">${sq.list}</td>` +
        `<td class="n">${sq.functional}</td>` +
        `<td class="n"><b>${Engine.partyTotal(st, p.id)}</b></td>` +
        (armed ? `<td class="n">${r ? cell(r.popularAye, r.popularWhipped) : "&mdash;"}</td>` +
                 `<td class="n">${r ? cell(r.functionalAye, r.functionalWhipped) : "&mdash;"}</td>` : "") +
        (anyOff ? `<td class="n${r && off(r) ? " offv" : ""}">` +
          `${r && off(r) ? off(r) : "&mdash;"}</td>` : "") +
        `</tr>`;
      /* THE CURRENTS, UNDER THE PARTY THEY BELONG TO. The author asked for
         the individual parties to open rather than the whole table to
         collapse — which is right: a composition table nobody can see is
         not shorter, it is gone. The same construction as the
         constituency dossier inside #cons-table: a detail ROW, not a
         second panel. */
      if (open) {
        const cols = 5 + (armed ? 2 : 0) + (anyOff ? 1 : 0);
        h += `<tr class="compdet"><td colspan="${cols}">` +
          `<div class="cdet">` + mine.map(cu => {
            const loy = (st.loyalty && st.loyalty[cu.id] != null) ? st.loyalty[cu.id] : cu.loyalty;
            return `<div class="cdrow"><b>${esc(cu.name)}</b>` +
              `<span class="cdn" data-tip="mps">${cu.members} member${cu.members === 1 ? "" : "s"}</span>` +
              `<span class="cdl${loy < 35 ? " warn" : ""}">loyalty ${loy}</span></div>`;
          }).join("") + `</div></td></tr>`;
      }
      if (armed && r && r.benches) h += r.benches.map(b =>
        `<tr class="bench"><td>${esc(b.name)}</td><td class="n"></td><td class="n"></td>` +
        `<td class="n"></td><td class="n">${b.popularSeats + b.functionalSeats}</td>` +
        `<td class="n">${b.popularAye == null ? "&mdash;" : b.popularAye}</td>` +
        `<td class="n">${b.functionalAye == null ? "&mdash;" : b.functionalAye}</td>` +
        (anyOff ? `<td class="n"></td>` : "") + `</tr>`).join("");
    });
    return h + `</tbody>`;
  }

  /* Click a block to commit up to it; click the last committed block again
     to release it. `after` is what to redraw, because the same control now
     lives on a tab that draws more than the bill detail. */
  /* Which folded sections the player left open. A preference for the
     session and not world state, so it lives here and not in the save
     (CLAUDE.md: player preferences are not somebody else's save). */
  const whipOpen = { pair: false, lobby: false };

  function wireWhipbars(root, billId, after) {
    /* AN ACCORDION, BECAUSE THE PANEL HAS ROOM FOR ONE. With both folds
       open the lobbying table ran past the panel floor and took the
       clear button with it — a control the player could see and not
       reach. Opening one closes the other, which is also the honest
       shape: they are two answers to the same question and a player is
       making one of them at a time. */
    root.querySelectorAll("details.foldsec").forEach(dt => {
      dt.addEventListener("toggle", () => {
        whipOpen[dt.dataset.fold] = dt.open;
        if (!dt.open) return;
        root.querySelectorAll("details.foldsec").forEach(o => {
          if (o === dt || !o.open) return;
          o.open = false; whipOpen[o.dataset.fold] = false;
        });
      });
    });
    /* [data-wp], NOT every .whipbar. The lobby bars reuse the control and
       so match the bare class too, which meant every click on a lobbying
       bar ALSO ran the whip handler with an undefined party — setWhip on
       nobody, then a second redraw that dropped the fold the player had
       just opened. Reusing a control is right; binding by its appearance
       rather than by what it controls is the same trap this repo has hit
       with .sel, .ticker and .sbar. Bind to the data, not the class. */
    root.querySelectorAll(".whipbar[data-wp]").forEach(bar => {
      const wp = bar.dataset.wp, wt = bar.dataset.wt;
      [...bar.querySelectorAll("i")].forEach((cell, i) =>
        cell.addEventListener("click", () => {
          const cur = ((st.whips[billId] || {})[wp] || {})[wt] || 0;
          Engine.setWhip(st, C, billId, wp, wt, i + 1 === cur ? i : i + 1);
          after();
        }));
    });
    root.querySelectorAll(".cl-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        const r = Engine.setClause(st, C, billId, btn.dataset.cl, btn.dataset.lv);
        if (!r.ok) setStatus(r.reason, "transient");
        after();
      });
    });
    const clr = root.querySelector("#btn-clearwhip");
    if (clr) clr.addEventListener("click", () => { Engine.clearWhips(st, billId); after(); });
    root.querySelectorAll(".whipbar[data-lb]").forEach(bar => {
      const lb = bar.dataset.lb;
      [...bar.querySelectorAll("i")].forEach((cell, i) =>
        cell.addEventListener("click", () => {
          const cur = ((st.lobby || {})[billId] || {})[lb] || 0;
          Engine.setLobby(st, C, billId, lb, i + 1 === cur ? i : i + 1);
          after();
        }));
    });
    const cll = root.querySelector("#btn-clearlobby");
    if (cll) cll.addEventListener("click", () => { Engine.clearLobby(st, billId); after(); });
  }

  /* THE DAY'S BUSINESS, AND WHAT IT WOULD TAKE.

     Order-paper time is two limits now and the player has to be able to
     see both: how much the House will hear today, and how far this
     measure still is from a division. A bill at drafting needs two
     grants and then the division itself — half a session's time — which
     is the fact that makes granting a step rather than a favour. */
  function dayLine(billId, chk) {
    const cap = (C.setup && C.setup.divisionsPerSitting) || 2;
    const left = Math.max(0, cap - (st.divisionsToday || 0));
    const bs = bsOf(billId);
    const i = Engine.STAGE_ORDER.indexOf(bs.stage);
    const need = Engine.STAGE_ORDER.indexOf("second_reading");
    const away = i < 0 ? 1 : Math.max(0, need - i);
    const pips = Array.from({ length: cap }, (_, n) =>
      `<s class="${n < cap - left ? "spent" : ""}"></s>`).join("");
    return `<div class="note dayline">` +
      `<span class="pips" ` +
      tipAttr("The day's business",
        "The House divides at most " + cap + (cap === 1 ? " time" : " times") + " a sitting. " +
        (left ? left + " left today." : "None left today; the rest keeps until tomorrow.")) +
      `>${pips}</span> ` +
      (left ? left + " of " + cap + " divisions left today" : "no divisions left today") +
      (away ? ` &middot; this measure wants <b>${away}</b> more ` +
              `${away === 1 ? "reading" : "readings"} before the House can divide on it` : "") +
      `</div>`;
  }

  /* On the Government tab the whip is a READOUT: what has been committed
     and what it will cost. The control that commits it is on the Chamber
     tab, next to the members it moves, and there is only one of it. */
  function whipLine(billId) {
    if (bsOf(billId).dead) return "";
    const cost = Engine.whipCost(st, C, billId);
    if (!cost.seats) return `<div class="note">No members whipped. ` +
      `The whip is below the plan, and the seats it buys fill as you commit them.</div>`;
    const capLines = Object.keys(cost.capital).map(p =>
      `${(C.partyById[p] || {}).short || p} &minus;${cost.capital[p]}`).join(" &middot; ");
    return `<div class="whipcost">Whipped: <b>${cost.seats}</b> seats. ` +
      (capLines ? "Capital " + capLines + ". " : "") +
      (cost.loyalty ? `Own party loyalty &minus;${cost.loyalty}. ` : "") +
      `Charged when the division is called.</div>`;
  }

  /* ---------- the whip ----------
     What you can move depends on how far the bill sits from the party's own
     position, which is what keeps the four axes load-bearing. What it costs
     comes out of the ledger, and overdrawing costs loyalty. */
  /* The factions under their party in the division breakdown. Only present
     where the engine actually derived the count from them — a stated
     forecast belongs to the whips who wrote it, not to the currents, and
     the engine returns no benches in that case. Each column sums to the
     party row above it. */
  function benchRowsHTML(r) {
    if (!r.benches) return "";
    const cell = (aye, seats) => aye == null
      ? `<td class="n">&mdash;</td><td class="n">${seats}</td>`
      : `<td class="n">${aye}</td><td class="n">${seats}</td>`;
    return r.benches.map(b =>
      `<tr class="bench"><td>${esc(b.name)}</td>` +
      cell(b.popularAye, b.popularSeats) +
      cell(b.functionalAye, b.functionalSeats) + `</tr>`).join("");
  }

  function whipPanel(billId, b, d) {
    if (bsOf(billId).dead) return "";
    const partners = [st.playerParty].concat(
      st.coalition.concat(st.confidenceSupply).filter(p => p !== st.playerParty));
    const tiers = b.dualMajority ? ["popular", "functional"] : ["popular"];
    const w = st.whips[billId] || {};

    let rows = "";
    partners.forEach(pid => {
      tiers.forEach(tier => {
        const cap = Engine.whippable(st, C, billId, pid, tier);
        const cur = (w[pid] || {})[tier] || 0;
        if (!cap.max && !cur) return;
        rows += `<tr><td>${mark(pid)}${(C.partyById[pid] || {}).short || pid}</td>` +
          `<td>${tier === "functional" ? "func" : "elected"}</td>` +
          `<td class="n">${cur} / ${cap.max}</td>` +
          `<td class="n">${cap.costPerSeat}&thinsp;${cap.currency === "loyalty" ? "loy" : "cap"}</td>` +
          `<td class="mv"><div class="whipbar" data-wp="${pid}" data-wt="${tier}"` +
            priceTip("Whip " + ps(pid) + (tier === "functional" ? ", functional bench" : ""),
              { capital: cap.currency === "loyalty" ? {} : { [pid]: cap.costPerSeat },
                loyalty: cap.currency === "loyalty" ? cap.costPerSeat : 0,
                per: " a seat",
                note: "Up to " + cap.max + ". Nothing is charged until the division is called." },
              cap.max ? null : (cap.reason || "no headroom on this bench")) +
            ` data-whipped="${cur} of ${cap.max}">` +
            Array.from({ length: cap.max }, (_, i) =>
              `<i${i < cur ? ' class="on"' : ""}></i>`).join("") +
          `</div></td></tr>`;
      });
    });

    if (!rows) return `<div class="note">No headroom. Every member of the coalition who can be brought to this ` +
      `measure is already voting for it. ${b.dualMajority && !d.functional.carries
        ? "The functional bench cannot be whipped. The government holds " +
          d.rows.reduce((n, r) => n + (st.coalition.includes(r.party) ? r.functionalSeats : 0), 0) +
          " of " + d.functional.total + " and needs " + d.functional.need + ". This is not a whipping problem."
        : ""}</div>`;

    const cost = Engine.whipCost(st, C, billId);
    const capLines = Object.keys(cost.capital).map(p => {
      const after = (st.capital[p] || 0) - cost.capital[p];
      return `${(C.partyById[p] || {}).short || p} &minus;${cost.capital[p]}` +
             `<span class="${after < 0 ? "od" : ""}"> (${after > 0 ? "+" : ""}${after})</span>`;
    }).join(" &middot; ");

    return `<table class="whiptab"><thead><tr><th>Party</th><th>Bench</th><th class="n">Seats</th>` +
      `<th class="n" data-tip="whip">Rate</th><th data-tip="whip">Move</th></tr></thead><tbody>${rows}</tbody></table>` +
      (cost.seats
        ? `<div class="whipcost">Plan: <b>${cost.seats}</b> seats. ` +
          (capLines ? "Capital " + capLines + ". " : "") +
          (cost.loyalty ? `Own party loyalty &minus;${cost.loyalty}. ` : "") +
          `Charged when the division is called.` +
          `<button class="btn ed-x" id="btn-clearwhip">clear</button></div>`
        : `<div class="note">Drag to commit members. Nothing is charged until you divide.</div>`) +
      pairPanel(billId, b, d) +
      signaturePanel(billId);
  }

  /* THE NAMES ON THE PAPER (design/26 #11). A ballot needs twelve signatures
     and content could supply five; the paper is a member-level thing now. The
     panel offers the members closest to signing, one at a time, and says what
     each of them costs. It appears only once content has opened the paper, so
     a government whose benches are content is never shown a trap. */
  function signaturePanel(billId) {
    if (!st.flags.paper_opened) return "";
    const list = Engine.signableMembers(st, C).slice(0, 8);
    if (!list.length) return "";
    const have = st.signatures || 0;
    const need = (C.setup.thresholds && C.setup.thresholds.ballot) || 12;
    return `<details class="foldsec sigfold"${have >= need - 2 ? " open" : ""}>` +
      `<summary><b>The paper</b><span>${have} of ${need} names</span></summary>` +
      `<div class="note">A signature is a member who has decided the party would ` +
      `be better run by somebody else. At ${need} the caucus divides, and the ` +
      `division is the party's own arithmetic, not the House's. A minister will ` +
      `not sign to your face; the members below will.</div>` +
      list.map(m => `<div class="sigrow"><span class="sig-n">${esc(bare(m.name))}` +
        `<i>${esc(m.current ? currentName(m.current) : "no current")}</i></span>` +
        `<span class="sig-w">${m.will >= 55 ? "inclined" : m.will >= 35 ? "may" : "will not"}</span>` +
        `<button class="btn sigbtn" data-sign="${esc(m.id)}"` +
        tipAttr("Ask " + bare(m.name),
          "Adding a name to the paper. It is a member lost and a step toward " +
          "the ballot that removes you; ask too many and the paper is the story.") +
        `>Ask</button></div>`).join("") +
      `</details>`;
  }
  function currentName(id) {
    const c = (C.currents || []).find(x => x.id === id);
    return c ? c.name : String(id).replace(/_/g, " ");
  }

  function pairPanel(billId, b, d) {
    const plan = st.pairs[billId] || {};
    const anyPlan = Object.keys(plan).some(k => plan[k]);
    if (!st.flags.pair_offered && !anyPlan) return "";
    let rows = "";
    C.parties.map(p => p.id).filter(id => id !== st.playerParty).forEach(pid => {
      const cap = Engine.pairable(st, C, billId, pid);
      const cur = plan[pid] || 0;
      if (!cap.max && !cur) return;
      rows += `<div class="pairrow"><span class="pair-p">${mark(pid)}${esc(ps(pid))}</span>` +
        `<button class="btn ed-x pair-b" data-pair="${esc(pid)}" data-pn="${cur - 1}">&minus;</button>` +
        `<b>${cur}</b>/<span>${cap.max}</span>` +
        `<button class="btn ed-x pair-b" data-pair="${esc(pid)}" data-pn="${cur + 1}">+</button></div>`;
    });
    if (!rows) return "";
    return `<details class="foldsec pairfold"${anyPlan ? " open" : ""}>` +
      `<summary><b>Pairing</b><span>${anyPlan ? "agreed" : "offered"}</span></summary>` +
      `<div class="note">A pair sends one of yours and one of theirs home together. It costs ` +
      `you an aye and costs them a nay, and the bar does not move for either, so it is never ` +
      `arithmetic and only ever a courtesy. What it buys is the other side's goodwill.</div>` +
      rows + `</details>`;
  }

  /* ---------- lobbying ----------

     Third panel, same shape as the whip and the pair, because it is the
     same kind of bargaining before the same division. What differs is the
     price card, and it differs on purpose: the whip's says what you will
     SPEND and this one says what you will PROMISE. Per design/24 A2 that
     is the whole point of the mechanic, so the card names the ask in the
     body's own words rather than showing a number. */
  function lobbyPanel(billId, b, d) {
    /* Shown wherever a functional bench can answer for the measure —
       the whole tier on a dual bill, or the constituencies that own its
       subject on any other. Gating on dualMajority alone hid the control
       on the five bills where it is the only reply to an objection. */
    if (bsOf(billId).dead) return "";
    if (!b.dualMajority && !((b.touches || []).length)) return "";
    const plan = (st.lobby || {})[billId] || {};
    let rows = "";
    (C.actors || []).forEach(a => {
      const cap = Engine.lobbyable(st, C, billId, a.id);
      const cur = plan[a.id] || 0;
      if (!cap.max && !cur) return;
      const live = (st.actors || {})[a.id] || {};
      rows += `<tr><td>${esc(a.name)} <span class="sm2">${esc(a.kind)}</span></td>` +
        `<td class="n">${live.standing}</td>` +
        `<td class="n">${cur} / ${cap.max}</td>` +
        `<td class="mv"><div class="whipbar" data-lb="${a.id}"` +
          priceTip("Ask " + a.name,
            { note: "They want: " + (a.asks || "something unstated") + ". " +
                    "Settling this does not spend a number \u2014 it opens an " +
                    "undertaking, due before the House rises, and breaking it " +
                    "is answered like any other broken promise. What they will " +
                    "deliver rises with their standing." },
            cap.max ? null : (cap.reason || "nothing to deliver")) +
          ` data-whipped="${cur} of ${cap.max}">` +
          Array.from({ length: Math.min(cap.max, 12) }, (_, i) =>
            `<i${i < cur ? ' class="on"' : ""}></i>`).join("") +
        `</div></td></tr>`;
    });
    if (!rows) return "";

    const cost = Engine.lobbyCost(st, C, billId);
    return `<table class="whiptab"><thead><tr><th>Body</th>` +
      `<th class="n">Standing</th><th class="n">Seats</th><th>Ask</th></tr></thead>` +
      `<tbody>${rows}</tbody></table>` +
      (cost.seats
        ? `<div class="whipcost">Asking for <b>${cost.seats}</b> functional seats. ` +
          `You would owe: ` +
          cost.promises.map(p => esc(p.text)).join("; ") + `. ` +
          `<button class="btn ed-x" id="btn-clearlobby">clear</button></div>`
        : `<div class="note">The functional benches have no whips and are not ` +
          `yours to move. Somebody else can move them, and will want something ` +
          `for it \u2014 not money, a promise.</div>`);
  }

  /* WHY IT FELL, WHEN THE REASON IS NOT THE ARITHMETIC.

     A measure can carry the House, carry the whole functional tier, and
     still fall because two members of Attestation and Registry own the
     subject and object to it. That happens in the opening state of this
     game. A player who loses a division to a rule they cannot see on the
     screen has been cheated, so the objection is named, the bench that
     made it is named, and the two ways out are stated: square the bench,
     or carry three-fifths of those voting and override it. */
  function domainNote(d) {
    /* SUPPLY: heard and not obeyed. The objection changes no outcome, so
       if it were not printed the forty would appear not to have voted at
       all — and the delay it buys would arrive on the calendar with no
       stated cause. */
    const sp = d.supply;
    if (sp && sp.applies) {
      if (!sp.objects)
        return `<div class="dmn ok"><b>Supply.</b> The elected benches vote money. ` +
          `The functional benches divided ${sp.total - sp.nay}\u2013${sp.nay} and ` +
          `did not object.</div>`;
      return `<div class="dmn bad"><b>Supply, objected to.</b> The functional ` +
        `benches divided ${sp.total - sp.nay}\u2013${sp.nay} against. They cannot ` +
        `stop it: the elected benches vote money. They can hold it, and they have ` +
        `— <b>${sp.delay} sittings</b> before it takes effect. The Act will be ` +
        `signed and inert, and these are the members who have to deliver it.</div>`;
    }
    const dm = d.domain;
    if (!dm || !dm.applies) return "";
    const who = dm.constituencies
      .map(c => `${esc(c.name)} <i>${c.aye}\u2013${c.nay}${
        c.abstain ? " (" + c.abstain + " abs)" : ""}</i>`).join(", ");
    if (!dm.objects)
      return `<div class="dmn ok"><b>Consented</b> by the benches that own the ` +
        `subject: ${who}. They need not carry it, only decline to block it.</div>`;
    return `<div class="dmn bad"><b>Objected to</b> by the benches that own the ` +
      `subject: ${who} \u2014 ${dm.against} of ${dm.seats} against, ` +
      `${dm.blockAt} enough to block. ` +
      (dm.override.ok
        ? `The House overrides: ${dm.override.have} of ${dm.override.of} voting.`
        : `To carry it anyway the House must return ${dm.override.need} of the ` +
          `${dm.override.of} voting and has ${dm.override.have}. ` +
          `Otherwise square the bench.`) + `</div>`;
  }

  /* ---------- the clauses of a bill the government fills in ----------
     design/13: a budget is a bill, not a screen. So this is not a fiscal
     panel — it is the blanks in a measure, drawn as clauses, in the
     column where the measure already is. The ceiling is the whole of the
     model: a level the Treasury cannot fund is refused at the point of
     choosing and the refusal names the shortfall, because that is where
     the player can still trade one line against another. */
  function clausePanel(id) {
    const cls = Engine.clausesOf(C, id);
    if (!cls.length || bsOf(id).dead) return "";
    const plan = Engine.clausePlan(st, C, id);
    const cost = Engine.clauseCost(st, C, id);
    const rows = cls.map(cl => {
      const now = plan[cl.id] || {};
      const opts = (cl.levels || []).map(lv => {
        const on = lv.id === now.id;
        const probe = on ? null : Engine.clauseCost(st, C, id);
        const would = cost.total - (now.cost || 0) + (lv.cost || 0);
        const bad = !on && would > cost.solvency;
        return `<button class="btn cl-opt${on ? " on" : ""}${bad ? " over" : ""}"` +
          ` data-cl="${esc(cl.id)}" data-lv="${esc(lv.id)}"` +
          ` data-tip-title="${esc(lv.label)}"` +
          ` data-tip-body="${esc((lv.note || "") + " Costs " + (lv.cost || 0) + "." +
             (bad ? " The Treasury is short by " + (would - cost.solvency) + "." : ""))}"` +
          `>${esc(lv.label)}<i>${lv.cost || 0}</i></button>`;
      }).join("");
      return `<div class="cl-row"><b data-tip-title="${esc(cl.name)}" ` +
        `data-tip-body="${esc(cl.note || "")}">${esc(cl.name)}</b>` +
        `<div class="cl-opts">${opts}</div></div>`;
    }).join("");
    return `<div class="clsec"><h4>The estimates</h4>${rows}` +
      `<div class="whipcost">Allocated <b>${cost.total}</b> of ` +
      `${cost.solvency} the Treasury holds. A line the Treasury cannot ` +
      `fund is refused; trade one against another.</div></div>`;
  }

  function benchBar(label, r) {
    const pct = Math.min(100, r.aye / r.total * 100);
    return `<div class="dm"><b>${label}</b><div class="dmbar">` +
      `<i class="yes" style="width:${pct}%;background:${r.carries ? "var(--ok)" : "var(--alert)"}"></i>` +
      `<span class="thr" style="left:${r.need / r.total * 100}%"></span>` +
      `<span class="lbl">${r.aye} / ${r.total} &middot; need ${r.need}</span></div></div>`;
  }

  /* ---------------------------------------------------------------
     THE DIVISION IS THE PLAN VOTING.

     It used to be a modal table of numbers floating over the one screen in
     the game that has a picture of the House on it — covering up the thing
     the Chamber tab exists to show, at the only moment it matters. Now the
     plan fills in party by party as the Clerk calls them: a called party's
     ayes light, the rest hold their colour and no fill, and the verdict lands
     under a House that shows what happened.

     Nothing is charged or decided here. Engine.divide() has already run, so
     this is the reading-out of a result that is already final — which is what
     makes it safe to look away from, and impossible to desynchronise. The
     Waits are the ones every other reading-out uses, so a key skips it and the
     stall works; what changed is that the panel is a caption under the plan
     rather than a modal over it. */
  /* THE CHIP MARKUP, as a pure function of the members, so that it can be
     asserted without standing up a division and racing the caption's
     teardown. Same precedent as Motion.__plan: the presentation logic worth
     testing is the part that turns data into markup, and it should not need
     a dialog to be alive to be checked. */
  /* THE ORDER THE HOUSE IS CALLED IN, AND HOW LONG EACH BENCH TAKES.

     Pure, and beside rollChips for the same reason: the two things worth
     asserting about a division's pacing are the order and the durations,
     and neither should need a live caption to check.

     Ascending by size, and the running tallies so the caller does not have
     to keep them. Both are corrections to the first build, which called the
     largest bench first — deciding the divergence bill at bench six of
     twelve and leaving six benches of anticlimax — and gave every bench the
     same 760ms whether two members were walking or sixty-eight. */
  function rollPlan(parties) {
    let aye = 0, nay = 0;
    return (parties || [])
      .filter(p => p.popular.length + p.functional.length > 0)
      .sort((a, b) => (a.popular.length + a.functional.length) -
                      (b.popular.length + b.functional.length))
      .map(p => {
        const seats = p.popular.length + p.functional.length;
        aye += p.popular.filter(m => m.vote === "aye").length;
        /* Abstentions and absences are neither bar: a member who declined
           is not a noe, and the bars must never sum past the House. */
        nay += p.popular.filter(m => m.vote === "nay").length;
        return Object.assign({}, p, { seats: seats, ayesTo: aye, naysTo: nay,
                 /* SLOWER, AND ON PURPOSE. When the names had to be legible this
           was a losing fight — 280 of them is twenty a second at any
           length worth sitting through — and the answer was to move the
           naming to the division list, not to hurry the House.

           Shortening it as well was my error: a division is the slowest
           thing a parliament does deliberately, and the weight is the
           point. So the benches take longer than they ever have, and the
           time is still proportional to how many members are walking:
           a bench of two goes in under a second, the PSD's
           eighty-two takes nearly three. */
        ms: Math.max(520, Math.min(2900, 620 + seats * 38)) });
      });
  }

  function rollChips(all) {
    /* MEMBERS FILE IN, THEY DO NOT APPEAR. A whole bench arriving on one
       frame reads as a table being printed; one arriving a few milliseconds
       after the last reads as people walking through a door, which is what
       a division is. The stagger is spread across the party's step so a
       bench of sixty and a bench of four both finish on time. */
    const step = Math.min(26, 640 / Math.max(1, all.length));
    return all.map((m, i) => {
      const d = ` style="animation-delay:${Math.round(i * step)}ms"`;
      /* THE PARTY IS NAMED WHEN THE CHIP IS READ OUT OF ITS BENCH. Grouped by
         vote the chips no longer sit under a party heading, so the tip is the
         only place the party survives — and a member's party is half of who
         they are in a division. */
      const who0 = m.party ? pn(m.party) + ". " : "";
      /* A LIST SEAT IS NAMED, and the name is a placeholder. The tip says
         so, and says what the seat is, because the mandate really is the
         party's even though the member is a person. */
      if (m.tier === "list")
        return `<i class="lchip list ${m.vote}"${d} ` +
          `data-tip-title="${esc(m.name || "List seat")}" ` +
          `data-tip-body="${esc(who0)}List seat ${m.listIndex || ""}. A closed list is the ` +
          `party's: the member sits and votes, but the mandate belongs to the ` +
          `slate and not to a place. Voted ${m.vote === "absent" ? "not at all" : m.vote}.">` +
          `${esc(String(m.name || "").split(/\s+/).pop())}</i>`;
      const who = String(m.name || "").replace(/^(Rt\. Hon\.|Hon\.)\s+/, "");
      const last = who.replace(/\s+MP$/, "").split(/\s+/).pop();
      const where = m.tier === "functional"
        ? (m.ref ? m.ref + " \u00b7 " + m.seat : m.seat) : m.seat;
      return `<i class="lchip ${m.vote}${m.payroll ? " pay" : ""}"${d} ` +
        `data-tip-title="${esc(who)}" ` +
        `data-tip-body="${esc(who0 + (where || ""))}. ` +
        `${m.office ? "Payroll vote \u2014 a minister who votes against the line has resigned. " : ""}` +
        `Voted ${m.vote === "absent" ? "not at all" : m.vote}.">${esc(last)}</i>`;
    }).join("");
  }

  function countDivision(rows, out) {
    const order = (rows || []).filter(r => r.popularSeats + r.functionalSeats > 0);
    const r0 = out.result || {};
    if (!order.length || typeof Wait === "undefined") return Promise.resolve();
    const b = C.billById[r0.bill] || {};
    const dual = !!r0.dual;
    const P = r0.popular, F = r0.functional;
    const noes = P.total - P.aye;

    /* WHAT THE WHIPS SAID. design/08 §7 gives the forecast an error and the
       count is exact, so the two are usually different — the one piece of
       genuine surprise a division has, and the plan should show it. */
    const f = forecast(r0.bill) || {};
    const fAye = (f.popular || {}).aye;
    const showForecast = fAye != null && fAye !== P.aye;

    /* TELLER'S NOTES. A division is not read out party by party — that is the
       forecast's shape and not a count's. Two remarks is what a count has, and
       they name the exceptions: a bench that went with the other side. */
    const govIds = st.coalition.concat(st.confidenceSupply);
    const notes = [];
    const crosser = order.filter(r => !govIds.includes(r.party) && r.popularAye > 0)
      .sort((a, c) => c.popularAye - a.popularAye)[0];
    const rebel = order.filter(r => govIds.includes(r.party) &&
        r.popularSeats - r.popularAye > 0)
      .sort((a, c) => (c.popularSeats - c.popularAye) - (a.popularSeats - a.popularAye))[0];
    if (crosser) notes.push(pn(crosser.party) + " goes with the government, " +
      crosser.popularAye + " of " + crosser.popularSeats);
    if (rebel) notes.push(pn(rebel.party) + " does not, " +
      (rebel.popularSeats - rebel.popularAye) + " against its own side");

    /* THE COUNT SWITCHES THE PLAN TO THE VIEW THAT SHOWS A VOTE, and puts it
       back afterwards because it is the player's setting and not ours. A dual
       bill keeps its bench, because the bench is half the question. */
    const was = { colour: chamberColour, group: chamberGroup, fold: chamberFold };
    let ayeEl = null, noeEl = null, ayeN = null, noeN = null, vEl = null;
    /* BOTH BARS RUN. The noes were painted at their final value on the
       first frame and never moved again, which gave the whole nay total
       away before a member had voted and left the ayes crawling along
       beside a bar that was already full. Now each bench moves whichever
       side it went to, so the two grow against each other and the
       threshold mark is a thing being approached rather than a decoration.
       Called with no second argument it paints the finished division,
       which is what the declaration wants. */
    const paint = (ayes, noesSoFar) => {
      if (!ayeEl) return;
      const n = noesSoFar == null ? noes : noesSoFar;
      ayeEl.style.width = (ayes / P.total * 100) + "%";
      noeEl.style.width = (n / P.total * 100) + "%";
      ayeN.textContent = ayes + " / " + P.need + " to carry";
      noeN.textContent = String(n);
    };

    /* THE SHAPE OF A COUNT, NOT A METRONOME. The bell; the doors; a fast start
       as the lobbies fill and a slow finish as the ayes close on the number;
       the tellers conferring; then the declaration. */
    const steps = [
      { label: "The House divides", ms: 900, run: () => {
          chamberColour = "vote"; chamberGroup = true; chamberFold = !dual;
          chamberCount = { rows: order, ayes: 0 };
          drawChamber(); paint(0, 0); cue("knell");
        },
        stall: { flag: "division_stalled",
                 label: "The Clerk is recounting the functional bench", ms: 1400 } },
      { label: "The doors are shut", ms: 620,
        run: () => setStatus("The doors are shut \u00b7 the lobbies are filling", "transient") }
    ];

    /* THE LOBBIES FILL, PARTY BY PARTY, WITH NAMES IN THEM.

       This is deliberately placed BEFORE the count and not inside it.
       The note above is right that a division is not read out party by
       party — that is the forecast's shape, and the tellers' declaration
       below keeps the count's. But the lobbies genuinely do fill one
       bench at a time, and that is the half of a division a player has
       never been shown: not the arithmetic, the members walking.

       So the roll call is the filling and the declaration is the count,
       and the two do not compete for the same moment. */
    /* THE SAME DIVISION, NOT A SECOND ONE. r0 is the result that was already
       resolved on the click — passing it in is what makes the roll call and
       the declaration provably the same event, and keeps the guarantee that a
       division resolves identically whether its dialog is watched or skipped. */
    const rc = Engine.rollCall(st, C, r0.bill, r0);
    /* THE COUNT IS THE ROLL CALL, not a second account of it.

       The first build ran the two as separate phases: nine seconds of
       members voting with the Ayes counter sitting at zero, then five
       seconds of a bar filling in to report what the player had just
       watched happen. Two sequential accounts of one event, the second
       of which could tell them nothing. That — and not the duration,
       which was already twenty seconds — is what read as unreal.

       So the running total climbs bench by bench as the House is called,
       the seat plan lights with it, and the tellers at the end confirm a
       number the player has watched arrive rather than announcing one
       they were kept from. This is the electronic-roll-call division
       rather than the lobby one, which is the right choice here because
       the roll call already names every member: a lobby division works
       precisely because you CANNOT see how each member voted, and having
       shown that, pretending to count afterwards is the incoherence.

       A BENCH OF SIXTY-EIGHT AND A BENCH OF TWO TOOK THE SAME 760ms.
       That was the other unreality, and the cheaper one to fix: the time
       is now proportional to how many members are walking.

       CALLED SMALLEST FIRST. Largest-first decided the divergence bill at
       bench six of twelve and left six benches of anticlimax after the
       result was already certain. Working up the roll keeps the count
       live against the threshold mark until near the end, which is what
       the mark is drawn for. */
    const benches = rollPlan(rc.parties);
    const rollEl = () => document.getElementById("dv-roll");
    benches.forEach(p => {
      const all = p.popular.concat(p.functional);
      const cnt = v => all.filter(m => m.vote === v).length;
      const to = p.ayesTo, toNay = p.naysTo;
      steps.push({
        label: pn(p.party) + " divides",
        ms: p.ms,
        run: () => {
          const el = rollEl();
          if (el) {
            const parts = [];
            ["aye", "nay", "abstain", "absent"].forEach(v => {
              const n = cnt(v); if (n) parts.push(n + " " + (v === "absent" ? "away" : v));
            });
            el.className = "lroll arrive";
            el.innerHTML =
              `<div class="lroll-h"><b>${esc(pn(p.party))}</b>` +
              `<span>${esc(parts.join(" \u00b7 "))}</span></div>` +
              `<div class="lroll-g">` + rollChips(all) + `</div>`;
            if (typeof Tips !== "undefined" && Tips.within) Tips.within("#dv-roll ");
          }
          /* the total moves with the bench that moved it */
          chamberCount = { rows: order, ayes: to };
          drawChamber(); paint(to, toNay); cue("click");
        }
      });
    });

    /* The tellers are the last word and no longer the first account.
       One beat to settle on the number the House has just produced. */
    steps.push({ label: "The tellers take the numbers", ms: 900,
      run: () => { chamberCount = { rows: order, ayes: P.aye };
                   drawChamber(); paint(P.aye); } });

    notes.forEach(n => steps.push({ label: n, ms: 900,
      run: () => setStatus("A teller's note \u00b7 " + n, "transient") }));
    steps.push({ label: "The tellers confer", ms: 1100,
      run: () => setStatus("The tellers confer with the Clerk", "transient") });
    steps.push({
      label: r0.carries ? "The Ayes have it" : "The Noes have it",
      ms: 1800,
      run: () => {
        /* THE DECLARATION IS WHERE THE FREEZE ENDS. The vote has
           concluded: the tellers are reading the result, so the order
           paper, the bill and the plan may show it now — the spoiler
           rule is about the count, not the reading-out. */
        countFreeze = null;
        chamberCount = null;
        chamberColour = was.colour; chamberGroup = was.group; chamberFold = was.fold;
        drawChamber(); paint(P.aye);
        cue(r0.carries ? "aye" : "nay");
        score(r0.carries ? "moment" : "defeat");
        /* THE VERDICT, as a thing you cannot miss. A declaration read out in
           the same voice as the count is a sentence you have to parse; a
           carried division and a lost one should not look alike from across
           the room. */
        if (vEl) {
          vEl.className = "lverdict " + (r0.carries ? "ok" : "bad");
          vEl.innerHTML = (r0.carries ? "Carried" : "Not carried") +
            `<i>The Ayes to the right: ${P.aye}. The Noes to the left: ${noes}. ` +
            (r0.carries ? "The Ayes have it." : "The Noes have it.") + `</i>`;
        }
        /* AND THE LIST IS PUBLISHED, at the end and not before. It used to
           go up in the bill panel the moment the division began, which is
           the one moment it cannot be read and also gives the result away
           before the House has been called. A division list is published
           AFTER a division; that is what makes it a record. The caption is
           holding by now, so there is as long as the player likes to read
           it. */
        const lst = document.getElementById("dv-list");
        if (lst) {
          const render = () => {
            lst.innerHTML = divisionList(r0.bill, true);
            wireDvl(lst, render);
            decorateScrollers(lst, true);
            if (typeof Tips !== "undefined" && Tips.within) Tips.within("#dv-list ");
          };
          render();
        }
        /* SAID THE WAY IT IS SAID. */
        setStatus("The Ayes to the right: " + P.aye + ". The Noes to the left: " +
          noes + ". " + (r0.carries ? "The Ayes have it." : "The Noes have it."),
          "transient");
      }
    });

    return Wait.run({
      title: "Division",
      sub: b.title || "",
      bare: true,
      /* THE CAPTION STAYS until the player sends it away. A division is the
         one reading-out worth reading twice, and the number is the whole
         point of the screen. */
      hold: true,
      /* The button is the only way out: a stray key took the reading away
         mid-sentence, and this is the one caption worth reading twice. */
      buttonOnly: true,
      stalled: fl => !!(st.flags && st.flags[fl]),
      steps: steps,
      mount: el => {
        el.innerHTML =
          `<div class="lobbyl">` +
            `<div class="lrow ayes"><b>Ayes</b><div class="lbar"><i id="dv-aye"></i>` +
              `<span class="thr" style="left:${(P.need / P.total * 100).toFixed(1)}%"></span>` +
              (showForecast
                ? `<span class="fc" style="left:${(fAye / P.total * 100).toFixed(1)}%"></span>`
                : "") +
            `</div><span class="ln" id="dv-ayen">0 / ${P.need} to carry</span></div>` +
            `<div class="lrow noes"><b>Noes</b><div class="lbar"><i id="dv-noe"></i></div>` +
              `<span class="ln" id="dv-noen">0</span></div>` +
          `</div>` +
          (dual ? `<div class="note">The functional bench is counted separately: ` +
            `${F.aye} of ${F.total}, needing ${F.need}.</div>` : "") +
          `<div class="lroll" id="dv-roll"></div>` +
          `<div class="lverdict" id="dv-verdict"></div>` +
          `<div id="dv-list"></div>`;
        ayeEl = el.querySelector("#dv-aye"); noeEl = el.querySelector("#dv-noe");
        ayeN = el.querySelector("#dv-ayen"); noeN = el.querySelector("#dv-noen");
        vEl = el.querySelector("#dv-verdict");
        /* THE FIRST FRAME IS A ZERO. The template carries the final noes
           count, so between mounting and the first step's paint the noes
           column reported a number the House had not reached — and with a
           large nay it read as a finished count before the door had shut.
           Both bars and both numbers are set to their starting values
           here, so the strip opens at nothing and earns its number. */
        if (ayeEl) ayeEl.style.width = "0%";
        if (noeEl) noeEl.style.width = "0%";
        if (ayeN) ayeN.textContent = "0 / " + P.need + " to carry";
        if (noeN) noeN.textContent = "0";
      }
    });
  }

  /* ---------- glossary annotation ----------
     First use of a term in a given event gets a dotted underline and a
     one-line gloss with its familiar handle. Opt-in, not a wall of text,
     and diegetic: government software has footnotes. */

  /* Wrap the first occurrence of each glossary term in a gloss span.

     Only text outside tags is eligible. Matching inside a tag inserts a
     <span> into an attribute value and destroys the markup, which is exactly
     what happened: several glosses are written using other glossary terms
     ("instance" is defined as "A fork that is still legally the same person
     as its root"), so annotating `fork` tore open the span already wrapped
     around `instance` and dumped the raw attributes into the prose.

     After each insertion the segments are re-split, so a term can never land
     inside markup added moments earlier by another term. */
  function annotate(html) {
    const terms = (C.glossary || []).filter(g => !g.assumed)
      .sort((a, b) => b.term.length - a.term.length);
    const done = new Set();
    let parts = html.split(/(<[^>]*>)/);

    terms.forEach(g => {
      if (done.has(g.term)) return;
      const re = new RegExp("\\b(" + g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b", "i");
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].charAt(0) === "<" || !re.test(parts[i])) continue;
        /* ONE TOOLTIP SYSTEM. A glossary term used to open an inline
           .glbox on CLICK, inserted after the word, which shoved the
           paragraph around and behaved like nothing else in the game.
           js/tips.js already draws a floating card on hover and on
           focus, hides on Escape and on scroll, and is deliberately
           neither focusable nor clickable — so a term simply carries the
           attributes that card reads and the second system is gone. */
        parts[i] = parts[i].replace(re, m =>
          /* NO PERMANENT tabindex. Every other annotation enters the tab
             order only in explain mode, on the visible screen — that is
             what `?` is for — and a glossary term is an annotated
             readout like any other. Permanently tabbable prose puts
             dozens of stops between a keyboard user and the decision. */
          `<span class="gl" data-tip="term:${esc(g.term)}"` +
          ` data-tip-title="${esc(g.term)}" data-tip-body="${esc(g.gloss)}"` +
          (g.handle ? ` data-tip-go="${esc(g.handle)}"` : "") + `>${m}</span>`);
        done.add(g.term);
        parts = parts.join("").split(/(<[^>]*>)/);
        break;
      }
    });
    return parts.join("");
  }
  /* Attribute-safe. & must go first or it double-escapes the entities below. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* A name is stored with its formal title. A table does not repeat the title —
     every row is a member — but the Concordance keeps it, because that is the
     one place a member sits beside the President, the press and the civilian. */
  function bare(n) {
    return String(n == null ? "" : n).replace(/^Rt\. Hon\. /, "").replace(/ MP$/, "");
  }

  /* bindGlossary is gone. A glossary term is a [data-tip] now and
     js/tips.js does the rest — see annotate(). Calls to it were removed
     with it; if one comes back, the term will still work and the extra
     call will not. */

  /* ---------- images ----------

     THE SLOT IS FILLED WHETHER OR NOT THE FILE EXISTS. js/artifacts.js
     has said for a long time that a slot is a reserved box and an empty
     one is an invisible box of the declared size — but these two helpers
     predate it and did the opposite: they returned "" with no character
     and DELETED THEMSELVES on a 404. Six characters declare a portrait
     and one file exists, so five decisions in six drew the box, its
     bevel and its REGISTRY caption, and then removed the node. Every
     choice rebuilds the reading block, so that happened on every
     decision. That is the flicker.

     The placeholder is a CSS background on the <img>, so it is painted
     before the network is consulted and stays put behind a slow load, a
     failed load and a missing file alike. `onerror` clears the src to
     reveal it rather than removing anything, and nothing in the layout
     ever moves. */

  /* A 1x1 transparent GIF. Removing the src was not enough: Chromium
     keeps painting its broken-image marker over an <img> whose load has
     failed, so the placeholder came up with a torn-page icon in the
     corner of it. Pointing the element at an image that exists and is
     nothing leaves the CSS background alone to do the work. onerror is
     cleared first so a failure here cannot loop. */
  const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  const NOIMG = `onerror="this.onerror=null;this.src='${BLANK}'"`;

  function portrait(ch) {
    const src = ch && ch.portrait ? `img/portraits/${ch.portrait}` : "";
    return `<div class="portrait">` +
      `<img class="dith" src="${src || BLANK}" alt="${ch ? esc(ch.name) : "No registry photograph"}" ` +
      NOIMG + `>` +
      `<div class="cap">REGISTRY</div></div>`;
  }

  function plate(img) {
    if (!img || !img.src) return "";
    return `<div class="plate-img">` +
      `<img class="dith" src="img/events/${esc(img.src)}" alt="${esc(img.caption || "")}" ` +
      NOIMG + `>` +
      `<div class="cap"><span>${img.caption || ""}</span><em>${img.credit || ""}</em></div></div>`;
  }

  /* ---------- text arriving ----------

     STREAMING IS AN ACTION, NOT A RENDER. drawSitting() always puts the
     finished text on the page, complete and silent; these two functions
     are called by the handlers for choosing, rising and arriving, and by
     boot() once for the decision you open on. Nothing reachable from
     drawAll() can get here, which is what keeps js/audio.js's hard rule
     true - a tab switch would otherwise retype the paragraph, with sound,
     every time you looked away and back.

     `shown` is session memory, not save state: it describes what this
     player has watched arrive, not anything about the world. */
  const shown = Object.create(null);

  function revealNode(el, block) {
    if (typeof Stream === "undefined" || !el) return;
    Stream.reveal(el, block);
  }
  function reveal() {
    const e = currentEvent;
    if (!e || shown[e.id]) return;
    shown[e.id] = true;
    revealNode($("#sitting-prose"), e);
  }

  /* ---------- sitting ---------- */
  /* ---------- sitting ----------

     A CHOICE IS A ROW THAT EXPANDS, NOT A BUTTON THAT FIRES.

     It used to be a button carrying a whole sentence, which put four
     things on the label at once: what you are doing, what it costs, who
     it upsets, and whether it commits you to anything. The row moves
     three of those inside, where the player asks for them.

     WHAT IT DOES IS DERIVED, NEVER WRITTEN. Engine.describe() reads the
     effects themselves, so the description cannot drift from the effect
     and lie. Direction and who, never the number (bible 7.6): an exact
     figure turns a decision into an optimisation.

     NO CUE AND NO REVEAL FROM IN HERE. Drawing a row is not a user
     action; expanding one is. Every Sound.play in this section sits in
     a listener, which is what tools/uitest.js checks for. */

  /* which row is open, so it survives the redraw that every decision
     causes. Keyed by event so a new event opens closed. */
  let openRow = { event: null, i: -1 };
  /* the measured diff of the last decision, held for the outcome block */
  let lastChanges = null;

  /* ---------- what moved somewhere else ----------

     A decision on this screen can put an item on the order paper, fill
     a post, move a bill or make an order — all of which live on other
     tabs, none of which the player has any reason to look at. This
     names the change and points at the tab that now holds it.

     STRUCTURAL CHANGES ONLY. The indicators are already reported, in
     the outcome ledger, where the player is looking; repeating them
     here would be noise and would train them to dismiss the card. What
     goes here is a thing that has MOVED SCREENS. */
  function structure(st) {
    const bills = {};
    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id];
      if (bs) bills[b.id] = bs.stage + (bs.dead ? "/dead" : "") +
                            (bs.dividesOn == null ? "" : "@" + bs.dividesOn);
    });
    const si = {};
    (C.instruments || []).forEach(i => {
      const x = st.instruments[i.id];
      if (x) si[i.id] = (x.made ? "made" : "") + (x.inForce ? "+force" : "") +
                        (x.revoked ? "+revoked" : "");
    });
    const posts = {};
    (C.cabinet || []).forEach(p => { posts[p.id] = (st.cabinet[p.id] || {}).holder || ""; });
    /* THE LEDGER AND THE CALENDAR were the two destinations this was blind
       to, and they are the two most acted upon. Capital moves whenever a
       partner is paid or put in debt, and a DATED thing — a division set,
       a prayer window, an initiative answering — lands on a day the player
       is not looking at. Four different actions put something on the
       calendar and not one of them said so. */
    const capital = {};
    Object.keys(st.capital || {}).forEach(k => capital[k] = st.capital[k]);
    const dated = Engine.deadlines(st, C)
      .map(d => d.kind + "@" + d.sitting + ":" + (d.text || "")).join("|");
    /* The numbers the same-screen flash reads: what the player can watch
       move on this screen, not only what moved to another one. */
    const scalars = Object.assign({}, st.scalars);
    const loyalty = {};
    Object.keys(st.parties).forEach(k => loyalty[k] = st.parties[k].loyalty);
    return { owed: (st.undertakings || []).map(u => u.id + ":" + u.state).join("|"),
             owedOpen: Engine.outstanding(st).length,
             bills: bills, si: si, posts: posts, capital: capital, dated: dated,
             datedList: Engine.deadlines(st, C),
             slots: st.slots.total - st.slots.used,
             scalars: scalars, loyalty: loyalty, sig: st.signatures || 0 };
  }

  /* EVERY ACTION REPORTS WHAT IT MOVED SOMEWHERE ELSE.

     reportMoves() and the card it fires have existed since motion.js was
     written, and exactly ONE action called them: taking a decision on the
     Sitting screen. Granting time, making an order, praying against one,
     appointing a minister and setting a division all change something on
     a tab the player is not looking at, and all of them said nothing.

     `acted` wraps the action instead of asking each handler to remember —
     a handler that forgets is the bug this replaces, and there is now one
     place to forget it rather than nine. */
  /* EVERY DECISION TAKES A BEAT, AND IT IS NOT OPTIONAL.

     The hourglass used to be eight hand-placed Wait.brief() calls, which
     meant it was on the eight actions somebody remembered and off the
     ninth the day it was written. It belongs here instead, because this
     is already the choke point every mutating action goes through, so an
     action added next year gets the beat without anybody deciding to
     give it one.

     It is not decoration. A state change the player did not watch happen
     is a state change they have to go and find, and the beat is what
     makes the link between the click and the consequence perceptible at
     all. So the LENGTH FOLLOWS THE CONSEQUENCE: nothing moved is a tap,
     one report is a beat, two is longer. An action that changed the
     world should not feel like an action that did not.

     Wait.brief clamps to 80-600ms itself, and body.no-motion is handled
     inside it, so a player who turned motion off still gets the state
     and never the theatre. */
  function acted(fn) {
    const before = structure(st);
    const out = fn();
    const moved = reportMoves(before, structure(st)) || 0;
    if (typeof Wait !== "undefined") Wait.brief(200 + moved * 160);
    return out;
  }

  /* ---------- the same-screen flash ----------

     The movecard names what moved to ANOTHER tab. This marks what moved on
     the one the player is standing on: the meter, the ledger line, the
     loyalty figure, the order-paper marks. It runs at the end of drawAll,
     never before it, because a pulse applied to a node the redraw is about
     to replace is a pulse nobody saw. Killed with every other animation
     under no-motion, like the card. */
  let pendingMoves = null;

  function flash(el) {
    if (!el) return;
    el.classList.remove("hit");
    void el.offsetWidth;                       /* restart the keyframe */
    el.classList.add("hit");
    clearTimeout(el.__hitT);
    el.__hitT = setTimeout(() => el.classList.remove("hit"), 900);
  }

  function flashChanged(before, after) {
    const gov = screen === "gov", sit = screen === "sit",
          party = screen === "party";
    if (before.slots !== after.slots) {
      flash($("#sb-slots"));
      if (gov) { flash($("#gov-slots .slotbar")); flash($("#gov-slots-hdr")); }
    }
    /* THE LEDGER AND THE LOYALTIES ARE ON THE PARTY TAB NOW, so the pulse
       follows them. And the loyalty one had been dead for some time before
       that: `#gov-coalition` moved to the CHAMBER when the coalition
       arithmetic did, keeping its `gov-` prefix, and this gate still read
       `screen === "gov"` — so a loyalty change pulsed a row on a screen the
       player was never on when the gate allowed it. An id that outlives the
       tab it was named for is how that hides. */
    Object.keys(after.capital || {}).forEach(pid => {
      if ((before.capital || {})[pid] === after.capital[pid]) return;
      if (party) flash($('#party-table tr[data-party="' + pid + '"]'));
    });
    Object.keys(after.loyalty || {}).forEach(pid => {
      if ((before.loyalty || {})[pid] === after.loyalty[pid]) return;
      if (party) flash($('#party-table tr[data-party="' + pid + '"]'));
    });
    Object.keys(after.scalars || {}).forEach(k => {
      if ((before.scalars || {})[k] === after.scalars[k]) return;
      /* ONE PANEL, ON THE SITTING SCREEN. There were two — the Government
         tab's and a mirror here — so this pulsed whichever the player was
         looking at, and the mirror needed a tick's delay because a
         MutationObserver filled it after the redraw. Neither is true now. */
      if (sit) flash($('#gov-meters .meterrow[data-key="' + k + '"]'));
    });
    if ((before.sig || 0) !== (after.sig || 0)) flash($("#sb-sig"));
  }

  function reportMoves(before, after) {
    pendingMoves = { before, after };
    if (typeof Motion === "undefined") return;
    const notes = [];

    if (after.owedOpen > before.owedOpen) {
      const u = Engine.outstanding(st)[Engine.outstanding(st).length - 1];
      notes.push({ tab: "gov", where: "Undertakings",
                   text: "An undertaking has been entered.",
                   detail: u ? u.text : null });
    } else if (after.owedOpen < before.owedOpen && before.owed !== after.owed) {
      /* NAME IT. "An undertaking has been discharged" tells the player a
         thing they cannot act on and cannot check; the card should say
         which promise was kept, because that is the news. */
      const was = {};
      (before.owed || "").split("|").filter(Boolean).forEach(x => {
        const p = x.split(":"); was[p[0]] = p[1];
      });
      const kept = (after.owed || "").split("|").filter(Boolean)
        .map(x => x.split(":"))
        .filter(p => was[p[0]] === "open" && p[1] !== "open")
        .map(p => (st.undertakings || []).find(u => u.id === p[0]))
        .filter(Boolean)[0];
      notes.push({ tab: "gov", where: "Undertakings",
                   text: kept ? "Promise kept: " + kept.text
                              : "An undertaking has been discharged.",
                   detail: kept ? "Discharged on the screen it was kept on." : null });
    }

    Object.keys(after.bills).forEach(id => {
      if (before.bills[id] === after.bills[id]) return;
      const b = (C.bills || []).find(x => x.id === id);
      const bs = st.bills[id];
      notes.push({ tab: "cham", where: "Order paper",
                   text: (b ? b.title : id) +
                         (bs.dead ? " has fallen." : " has moved."),
                   detail: bs.dead ? null : String(bs.stage).replace(/_/g, " ") });
    });

    Object.keys(after.si).forEach(id => {
      if (before.si[id] === after.si[id]) return;
      const i = (C.instruments || []).find(x => x.id === id);
      notes.push({ tab: "gov", where: "Government",
                   text: (i ? i.number : id) + " is in force.",
                   detail: i ? i.title : null });
    });

    Object.keys(after.posts).forEach(id => {
      if (before.posts[id] === after.posts[id]) return;
      const p = (C.cabinet || []).find(x => x.id === id);
      const ch = C.characterById[after.posts[id]];
      notes.push({ tab: "gov", where: "Cabinet",
                   text: after.posts[id]
                     ? (p ? p.title || p.name : id) + " is filled."
                     : (p ? p.title || p.name : id) + " stands vacant.",
                   detail: ch ? ch.name : null });
    });

    Object.keys(after.capital).forEach(pid => {
      const d = after.capital[pid] - (before.capital[pid] || 0);
      if (!d) return;
      notes.push({ tab: "gov", where: "Coalition ledger",
                   text: ps(pid) + (d > 0 ? " owes you " + d + " more."
                                          : " is owed " + (-d) + " more."),
                   detail: "Now " + (after.capital[pid] > 0 ? "+" : "") + after.capital[pid] + "." });
    });

    /* A DATED THING LANDS ON A DAY THE PLAYER IS NOT LOOKING AT — but only
       report the ones nothing else here covers, or one fact gets two cards.
       An undertaking is already an `owed` deadline and has its own note
       above; a division set is in `bills`; a prayer window is in `si`.
       What is left is `expected`: a commission reporting, a dispatch due,
       an initiative answering — a fact the queue is holding for a day, and
       the one dated thing nothing announced. */
    if (before.dated !== after.dated) {
      const was = new Set((before.datedList || []).map(d => d.kind + "@" + d.sitting + ":" + (d.text || "")));
      const now = (after.datedList || [])
        .filter(d => d.kind === "expected")
        .filter(d => !was.has(d.kind + "@" + d.sitting + ":" + (d.text || "")));
      now.slice(0, 1).forEach(d => notes.push({
        tab: "sit", where: "The calendar",
        text: d.text || "Something is down for a day.",
        detail: d.away === 0 ? "Today." : d.away === 1 ? "Tomorrow."
              : "In " + d.away + " sittings." }));
    }

    /* THE CONSEQUENCE THE PLAYER CAN SEE LEADS. A card under the tab they
       are standing on says "this changed where you are looking"; a card for
       another tab is a pointer, and pointers go second. Two is still the
       cap: five is a wall. */
    notes.sort((a, b) => (a.tab === screen ? 0 : 1) - (b.tab === screen ? 0 : 1));
    notes.slice(0, 2).forEach(n => Motion.notify(n));
    /* How much moved, so the beat can be as long as the consequence. */
    return notes.length;
  }

  const TONE_MARK = { good: "+", bad: "−", grave: "!", owed: "¤", plain: "·" };

  /* The commit button says the ACT. The terminal does not ask whether
     you are sure; you either do the thing or you do not. Content may
     name it with `act`; otherwise it is read off the effects. */
  function actLabel(c) {
    if (c.act) return c.act;
    const eff = [].concat(c.effects || []);
    if (eff.some(e => e.undertake)) return "Give the undertaking";
    if (eff.some(e => e.coalition && e.coalition.remove)) return "Break the coalition";
    if (eff.some(e => e.election)) return "Dissolve parliament";
    if (eff.some(e => e.law)) return "Change the law";
    if (eff.some(e => e.si)) return "Sign the order";
    return "Decide";
  }

  /* CABINET REACTION, derived from the cabinet's own party membership.
     Not invented prose: a choice that costs a party is a choice its
     ministers feel, and they are named with their office because that
     is the fact the player needs. A richer mapping - which ministry
     owns which brief - wants a `brief` field on content/cabinet.js and
     is left for the content pass. */
  function cabinetView(effects) {
    /* WHO SPEAKS, in two passes.

       FIRST BY BRIEF. A minister owns subjects — content/cabinet.js says
       which — and a choice that moves one of them is a choice in their
       department. That is the strong signal and it is why the field
       exists: the Minister for Substrate and Thermal should answer on
       substrate because it is hers, not because her party happens to be
       in the coalition.

       THEN BY PARTY, for whatever the briefs do not cover, because a
       choice that costs a party is still a choice its ministers feel.
       Currents fold up to their parent or the half of the caucus most
       likely to be upset stays invisible.

       Never exactly one voice: a lone adviser reads as the game telling
       you the answer. Two who disagree is a decision; two who agree is
       information of a stronger kind. */
    const owner = id => {
      const cur = (C.currents || []).find(x => x.id === id);
      return cur ? cur.party : id;
    };
    const subjects = new Set(), moved = {};
    const add = (k, v) => { const o = owner(k); moved[o] = (moved[o] || 0) + v; };
    [].concat(effects || []).forEach(e => Object.keys(e).forEach(k => {
      if (k === "move") Object.keys(e.move).forEach(key => {
        const dot = key.indexOf("."), ns = dot < 0 ? "scalar" : key.slice(0, dot);
        const id = dot < 0 ? key : key.slice(dot + 1);
        if (ns === "loyalty" || ns === "capital") add(id, e.move[key]);
        else subjects.add(ns === "scalar" ? id : ns + "." + id);
      });
      if (k === "law") Object.keys(e.law).forEach(x => subjects.add(x));
      if (k === "station") Object.keys(e.station).forEach(sid =>
        Object.keys(e.station[sid]).forEach(f => subjects.add(f)));
    }));

    const rows = [], seen = new Set();
    const push = (post, holder, forIt, why) => {
      if (seen.has(post.id)) return;
      seen.add(post.id);
      const who = C.characterById[holder];
      rows.push({ name: who ? who.name : holder, office: post.title || post.name,
                  for: forIt, why: why });
    };

    (C.cabinet || []).forEach(post => {
      const p = st.cabinet[post.id];
      if (!p || !p.holder) return;
      const hit = (post.brief || []).some(b => subjects.has(b));
      if (!hit) return;
      /* Whether they are for it is not derivable from the subject alone,
         so the brief decides that they SPEAK and their party decides
         which way. A minister whose party is untouched is neutral, and
         a neutral voice on their own brief is still worth hearing. */
      const party = p.party || post.party;
      push(post, p.holder, (moved[party] || 0) >= 0, "brief");
    });

    (C.cabinet || []).forEach(post => {
      const p = st.cabinet[post.id];
      if (!p || !p.holder) return;
      const party = p.party || post.party;
      if (moved[party] == null || moved[party] === 0) return;
      push(post, p.holder, moved[party] > 0, "party");
    });

    const byBrief = rows.filter(r => r.why === "brief");
    const yes = rows.filter(r => r.for), no = rows.filter(r => !r.for);

    /* A brief holder always gets a seat at the table if anyone does. */
    if (byBrief.length && yes.length && no.length) {
      const a = byBrief[0];
      const other = (a.for ? no : yes)[0];
      if (other) return [a, other];
    }
    if (yes.length && no.length) return [yes[0], no[0]];

    /* THE "NEVER EXACTLY ONE" RULE IS ABOUT PARTY-DERIVED ADVICE, where a
       lone voice is arbitrary and reads as the game telling you the
       answer. A minister answering on their OWN DEPARTMENT is not that:
       it is the department reporting, and suppressing it means a
       decision purely about substrate hears from nobody at all — which
       is what the first version of this did. */
    if (byBrief.length === 1 && rows.length === 1) return byBrief;
    if (rows.length >= 2) return rows.slice(0, 2);
    return [];
  }

  function choiceRow(e, c, i, open) {
    const cl = Engine.describe(st, C, c.effects);
    const owed = cl.filter(x => x.owed);
    const grave = Engine.grave(st, C, c);
    const cab = cabinetView(c.effects);
    const strip = [
      c.cost && c.cost.slot ? `<span class="cm cost">costs order-paper time</span>` : "",
      owed.length ? `<span class="cm owed">commits you</span>` : "",
      grave && !owed.length && !(c.cost && c.cost.slot)
        ? `<span class="cm grave">significant</span>` : ""
    ].join("");
    /* WHAT IT DOES, WHILE IT IS STILL SHUT. A list of four decisions where
       three say only their own name is a list you have to open four times
       and hold in your head. The first two effects sit under the label, so
       the trade is legible before the row is expanded; the row still opens
       onto the full reading. */
    const peek = cl.filter(x => !x.owed).slice(0, 2).map(x => x.text).join(" \u00b7 ");

    return `<div class="ch${open ? " open" : ""}" data-ch="${i}">
      <button class="ch-head" data-expand="${i}" aria-expanded="${open}">
        <span class="ch-arrow">${open ? "▾" : "▸"}</span>
        <span class="ch-head-txt">
          <span class="ch-label">${esc(c.label)}</span>
          ${peek ? `<span class="ch-peek">${esc(peek)}</span>` : ""}
        </span>
        ${strip ? `<span class="ch-strip">${strip}</span>` : ""}
      </button>
      ${open ? `<div class="ch-body">
        ${c.note ? `<p class="ch-note">${esc(c.note)}</p>` : ""}
        <div class="ch-sec"><h4>What this does</h4>
          ${cl.filter(x => !x.owed).length
            ? `<ul class="ch-eff">${cl.filter(x => !x.owed).map(x =>
                `<li class="t-${x.tone}"><i>${TONE_MARK[x.tone] || "·"}</i>${esc(x.text)}</li>`
              ).join("")}</ul>`
            /* A choice can be entirely a position taken: nothing moves and
               the House hears you say it. An empty panel reads as broken,
               so it says so rather than showing nothing. */
            : `<div class="note">Nothing that moves a number. What changes is
                 what you have said, and who heard it.</div>`}
        </div>
        ${owed.length ? `<div class="ch-sec owed"><h4>You would be undertaking</h4>
          ${owed.map(x => `<div class="ch-owe">${esc(x.text)}</div>`).join("")}
          <div class="note">It goes on the order paper. Keep it there and it stands
            against you.</div></div>` : ""}
        ${cab.length ? `<div class="ch-sec"><h4>The cabinet</h4>
          ${cab.map(r => `<div class="ch-cab ${r.for ? "for" : "against"}">
            <b>${esc(r.name)}</b> <em>${esc(r.office)}</em>
            <span>${r.for ? "for" : "against"}</span></div>`).join("")}</div>` : ""}
        <div class="ch-commit">
          <button class="btn commit${grave ? " grave" : ""}" data-i="${i}">${esc(actLabel(c))}</button>
        </div>
      </div>` : ""}
    </div>`;
  }

  /* THE DOCKET. What is before the House, which is how a decision taken
     here reaches the screen that carries it out: promising something
     puts an item here, and keeping it takes the item away. */
  /* ---------------------------------------------------------------
     WHAT THE GOVERNMENT WILL DO.

     Everything else on this screen answers something. This is the one
     panel where the prime minister starts it, and the shape of the
     control carries the argument: she picks the thing, and then she
     picks HOW IT IS DONE, and the second choice is the one that
     matters. A word in the corridor comes back next sitting and is
     worth what a corridor is worth.

     The order-paper cost is drawn as pips rather than written as a
     fraction, because "4 of 6" is a number and six marks with two
     struck through is a quantity. It is the same time a bill wants, so
     the competition is visible in the place the spending happens.
     --------------------------------------------------------------- */
  let initOpen = null;

  function slotPips(used, total, need) {
    let out = "";
    for (let i = 0; i < total; i++)
      out += `<s class="${i < used ? "spent" : i < used + (need || 0) ? "want" : ""}"></s>`;
    return `<span class="pips">${out}</span>`;
  }

  function initHTML() {
    const list = Engine.initiatives(st, C);
    if (!list.length) return `<div class="note">Nothing the government can set in motion.</div>`;
    const left = st.slots.total - st.slots.used;
    return list.map(i => {
      const open = initOpen === i.id;
      const head = `<button class="ini-h" data-ini="${i.id}"${i.ok ? "" : " disabled"}` +
        priceTip(i.title, { slots: i.cost }, i.ok ? null : i.reason) + `>
          <b>${esc(i.title)}</b>
          <i>${i.ok ? slotPips(st.slots.used, st.slots.total, i.cost) +
                      " " + i.cost + " slot" + (i.cost === 1 ? "" : "s")
                    : esc(i.reason)}</i>
        </button>`;
      if (!open) return `<div class="ini">${head}</div>`;
      const tempo = (i.tempo || []).map((t, n) => {
        const cost = i.cost + (t.cost || 0);
        const can = cost <= left;
        return `<button class="ini-t" data-take="${i.id}" data-tempo="${n}"${can ? "" : " disabled"}` +
          priceTip(i.title + " \u2014 " + t.label, { slots: cost },
                   can ? null : "not enough order-paper time left this session") + `>
            <b>${esc(t.label)}</b>
            <i>answers in ${t.after} sitting${t.after === 1 ? "" : "s"} \u00b7 ${cost} slot${cost === 1 ? "" : "s"}${can ? "" : " \u00b7 not enough time"}</i>
          </button>`;
      }).join("");
      return `<div class="ini open">${head}
        <div class="ini-b"><p>${esc(i.note)}</p>${tempo}</div></div>`;
    }).join("");
  }

  function drawInitiatives() {
    const el = $("#gov-init"); if (!el) return;
    el.innerHTML = initHTML();
    const hdr = $("#gov-init-hdr");
    if (hdr) hdr.textContent = (st.slots.total - st.slots.used) + " of " +
                               st.slots.total + " slots left this session";
    el.querySelectorAll("[data-ini]").forEach(b =>
      b.addEventListener("click", () => {
        initOpen = initOpen === b.dataset.ini ? null : b.dataset.ini;
        drawInitiatives();
      }));
    el.querySelectorAll("[data-take]").forEach(b =>
      b.addEventListener("click", () => {
        const i = (C.initiatives || []).find(x => x.id === b.dataset.take) || {};
        const t = (i.tempo || [])[+b.dataset.tempo] || {};
        Dialog.confirm(i.title + " \u2014 " + (t.label || "") + "?",
          { title: "Set it in motion", yes: "Do it" },
          okd => {
            if (!okd) return;
            /* An initiative answers on a named sitting — a dated thing on a
               tab the player is not on. */
            const r = acted(() => Engine.take(st, C, b.dataset.take, +b.dataset.tempo));
            if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); return; }
            cue("stamp"); score("undertake");
            initOpen = null;
            setStatus(i.title + " \u2014 an answer in " + r.after +
                      " sitting" + (r.after === 1 ? "" : "s"), "transient");
            drawAll(); saved(); afterAction();
          });
      }));
  }

  /* ---------------------------------------------------------------
     THE ORDER OF THE DAY.

     The sitting screen could have listed what was AVAILABLE — six bills
     can advance, five orders can be made — and that is equally true on
     day one and day forty, so it is a menu rather than business. A day
     only has a shape if something is ASKED of it.

     This lists obligations, in the order of a prime minister's day: the
     House first, then the government's own business, then the papers.
     Each row says where it is answered and takes the player there, so
     the tabs stop being places you might look and become places the day
     sends you. And every item CLEARS when it is dealt with — a mark
     that never goes out teaches a player to stop reading it.
     --------------------------------------------------------------- */
  const TABNAME = { sit: "Sitting", gov: "Government", cham: "Chamber", orb: "Orbit" };
  const WHENWORD = { overdue: "overdue", now: "today", soon: "soon" };

  /* A ROW THAT NAMES A THING AS WELL AS A SCREEN. An undertaking is kept by
     an ORDER and a bill is carried by a MEASURE, so the row opens the tab
     and then the thing itself: the player lands on the instrument with its
     Make button in front of them, rather than on a page of thirteen orders
     and having to find the one the promise is about. */
  function openTarget(btn) {
    const tab = btn.dataset.goto &&
      document.querySelector('.tab[data-t="' + btn.dataset.goto + '"]');
    if (tab) tab.click();
    const spec = btn.dataset.open;
    if (!spec) return;
    const c = spec.indexOf(":");
    const kind = spec.slice(0, c), id = spec.slice(c + 1);
    if (kind === "si") {
      siOpen = id;
      drawAll();
      const row = document.querySelector('#gov-si tr[data-si="' + id + '"]');
      if (row) {
        if (row.scrollIntoView) row.scrollIntoView({ block: "center" });
        /* THE ROW IS THE ANSWER, SO IT PULSES. Landing on the instruments
           with thirteen orders and no mark on the one that matters reads as
           a dead link; the row the player was sent to says it was the row.
           And if the promise needs the order to be LAID first, the status
           line says so — the row opens onto its Make button either way. */
        flash(row);
        const si = (C.instruments || []).find(x => x.id === id);
        const s = st.instruments[id];
        if (si && s && !s.made)
          setStatus("This promise is kept by " + (si.number || si.id) +
            ". Press Make to lay it.", "transient");
      }
    } else if (kind === "bill" && typeof Focus !== "undefined") {
      Focus.activate("cham-bills", id);
    }
  }

  function todayHTML() {
    const t = Engine.today(st, C, !!currentEvent || !!Engine.nextEvent(
      /* on a COPY: nextEvent takes the queue apart as it reads it */
      JSON.parse(Engine.save(st)), C));
    if (!t.items.length)
      return `<div class="note">Nothing is asked of you today. The House may rise.</div>`;
    return t.items.map(i => {
      const away = i.away == null ? ""
        : i.away < 0 ? Math.abs(i.away) + " sittings late"
        : i.away === 0 ? "today"
        : i.away === 1 ? "next sitting" : "in " + i.away + " sittings";
      return `<button class="tdo ${i.when}${i.required ? " req" : ""}" data-goto="${i.tab}" data-open="${esc(i.focus || "")}">
        <b>${esc(i.text)}</b>
        <i>${esc(TABNAME[i.tab] || i.tab)}${away ? " \u00b7 " + esc(away) : ""}${
          i.how ? " \u00b7 " + esc(i.how) : ""}</i>
      </button>`;
    }).join("");
  }

  function drawToday() {
    const el = $("#sit-today"); if (!el) return;
    const t = Engine.today(st, C, !!currentEvent || !!Engine.nextEvent(
      JSON.parse(Engine.save(st)), C));
    el.innerHTML = todayHTML();
    const sum = $("#today-sum");
    if (sum) sum.textContent = t.items.length
      ? t.items.length + (t.items.length === 1 ? " thing asked" : " things asked")
      : "nothing asked";
    el.querySelectorAll("[data-goto]").forEach(b =>
      b.addEventListener("click", () => openTarget(b)));
    /* THE TAB STRIP CARRIES THE SAME TRUTH. A tab with something asked of
       it wears a mark, and it goes out when the thing is done — which is
       only possible because today() reports obligations and not what
       happens to be available. */
    document.querySelectorAll(".tab").forEach(tab => {
      const mine = t.items.filter(i => i.tab === tab.dataset.t);
      const asked = mine.length > 0 && tab.dataset.t !== "sit";
      tab.classList.toggle("asked", asked);
      const old = tab.querySelector(".tab-n");
      if (old) old.remove();
      if (!asked) return;
      /* The count is a REAL element rather than a ::after, so that it can
         carry the project's own hover card — a pseudo-element cannot. Hovering
         it says WHAT is asked, in the same words the order of the day uses, so
         the number stops being an unexplained red box. */
      const n = document.createElement("span");
      n.className = "tab-n";
      n.setAttribute("data-tip", "tab-asked");
      n.setAttribute("data-tip-title",
        (TABNAME[tab.dataset.t] || tab.textContent.trim()) + ": " +
        mine.length + (mine.length === 1 ? " thing asked" : " things asked"));
      n.setAttribute("data-tip-body", mine.map(i =>
        i.text + (i.when === "overdue" ? " (overdue)"
                : i.when === "now" ? " (today)" : "")).join("   \u00b7   "));
      n.textContent = mine.length;
      tab.appendChild(n);
    });
    /* and the rise button says what leaving now would leave behind */
    const rb = $("#btn-advance");
    if (rb) {
      const left = t.items.filter(i => i.when !== "soon" && !i.required).length;
      rb.textContent = left
        ? "Rise \u2014 " + left + " unanswered"
        : "Rise until the next sitting";
      rb.classList.toggle("warn", left > 0);
    }
  }

  /* ---------------------------------------------------------------
     THE PARLIAMENTARY CALENDAR.

     Pacing was a number in a sentence — "4 sittings left of session 4" —
     and a number in a sentence is something you read, not something you
     feel. A month grid is something you feel: you can see how much time
     is left, that the House does not sit every day, and exactly which
     square the division falls on.

     It reads Engine.calendar(), which reads Engine.deadlines(), which is
     the same source the docket uses. A deadline that appeared on one and
     not the other is how a player learns to trust neither.
     --------------------------------------------------------------- */
  const DOW = ["S", "M", "T", "W", "T", "F", "S"];
  const MARKNAME = { division: "Division", owed: "Promised", rises: "The House rises",
                     prayer: "Prayer window closes", expected: "Expected" };
  const SITDAYS = "four";
  let calMonth = 0;                    /* months from the current sitting */

  /* "Thursday 14 April" — the card names the day, because a player
     reading a date wants the weekday as much as the number. */
  function dayLabel(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString("en-GB",
      { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  }

  function calendarHTML() {
    const cal = Engine.calendar(st, C, calMonth);
    if (!cal || !cal.days.length) return "";
    let cells = "";
    /* the blanks before the first, so the columns line up with the week */
    for (let i = 0; i < cal.days[0].dow; i++) cells += '<i class="pad"></i>';
    cal.days.forEach(d => {
      const cls = ["cd"];
      if (!d.sits) cls.push("dark");
      if (d.past) cls.push("past");
      if (d.today) cls.push("now");
      /* THE DAY CARRIES ITS MOST IMPORTANT MARK AS A COLOUR. A row of dots
         four pixels across said "something" and nothing more, and the kind
         was only in the hover card, so a month could not be read at a
         glance, which is the only reason a calendar is on the screen. The
         dominant mark (a division beats a promise beats a prayer) now tints
         the day's edge, and the dots say how many. */
      const PRIORITY = { division: 0, rises: 1, owed: 2, prayer: 3, expected: 4 };
      const dom = d.marks.slice().sort((a, b) =>
        (PRIORITY[a.kind] == null ? 9 : PRIORITY[a.kind]) -
        (PRIORITY[b.kind] == null ? 9 : PRIORITY[b.kind]))[0];
      if (dom) cls.push("top-" + dom.kind);
      /* ONE MARK PER THING, NOT ONE FLAG PER DAY. A single corner flag
         said "something happens here" and lost both the count and, when
         two kinds landed together, the colour — the classes stacked and
         the last one won. A row of pips says how many and which. */
      const pips = d.marks.slice(0, 4).map(m =>
        `<s class="p-${m.kind}"></s>`).join("") +
        (d.marks.length > 4 ? '<s class="p-more"></s>' : "");

      /* AND THE PROJECT'S OWN HOVER CARD, not the browser's. This was a
         native title= — slow, unstyled, and a second tooltip system in a
         build that spent a commit removing one. */
      const title = d.sitting != null ? "Sitting " + d.sitting : "The House does not sit";
      /* THE CARD LEADS WITH THE THING, IN WORDS, ONE PER LINE. It was a run
         of "Name: text — Name: text" joined by dashes, which is a sentence
         you parse rather than a thing you read. Each mark gets its own
         sentence and its own line, and the kind is named first so the
         colour of the dot has a word to match it to. */
      const body = d.marks.length
        ? d.marks.map(m => MARKNAME[m.kind] + ". " + m.text).join("\n")
        : (d.sitting != null ? "Nothing is down for this day."
                             : "The House sits " + SITDAYS + " days in seven. This is not one of them.");
      /* data-tip draws the card for a pointer; aria-label is what a screen
         reader gets, and it has to carry the same sentence. Swapping the
         native title= for the project's own card quietly dropped the
         second one, which the checks caught. */
      const said = title + ", " + dayLabel(d.date) + ". " + body.replace(/\n/g, " ");
      /* A DAY IS A DOOR WHEN SOMETHING ON IT CAN BE DONE. The next-three list
         below already navigates; the grid is where the player actually reads
         the month, so a day carrying a division or a prayer window should go
         there too. Several marks can land on one day, so it follows the same
         PRIORITY the tint does — the dominant ACTIONABLE mark wins, and a day
         whose only marks are the rise or a thing merely expected stays inert
         and stays an <i>, because it is not a control. */
      const door = d.marks.slice().filter(m => m.tab).sort((a, b) =>
        (PRIORITY[a.kind] == null ? 9 : PRIORITY[a.kind]) -
        (PRIORITY[b.kind] == null ? 9 : PRIORITY[b.kind]))[0];
      const tag = door ? "button" : "i";
      cells += `<${tag} class="${cls.join(" ")}${door ? " goto" : ""}"` +
               ` aria-label="${esc(said + (door ? ". " + door.how : ""))}"` +
               (door ? ` data-goto="${esc(door.tab)}" data-open="${esc(door.focus || "")}"` : "") +
               ` data-tip-title="${esc(title)} \u00b7 ${esc(dayLabel(d.date))}"` +
               /* The card stays ONE LINE PER MARK — uxtest counts pips against
                  the lines in this body, and a "how" line broke that
                  invariant. The destination rides the aria-label and the
                  hover affordance instead, which is what the docket does. */
               ` data-tip-body="${esc(body)}">` +
               `<b>${d.dom}</b>` +
               (d.sitting != null ? `<u>${d.sitting}</u>` : "") +
               (pips ? `<span class="pips">${pips}</span>` : "") + `</${tag}>`;
    });
    const next = Engine.deadlines(st, C).filter(x => x.away >= 0).slice(0, 3);
    return `<div class="calhead">
        <button class="calnav" data-cal="-1" aria-label="Previous month">&lsaquo;</button>
        <span>${esc(cal.label)}</span>
        <button class="calnav" data-cal="1" aria-label="Next month">&rsaquo;</button>
      </div>
      <div class="calgrid">${DOW.map(d => '<em>' + d + '</em>').join("")}${cells}</div>
      <div class="calkey">
        <span><s class="p-division"></s>division</span>
        <span><s class="p-owed"></s>promised</span>
        <span><s class="p-prayer"></s>prayer</span>
        <span><s class="p-expected"></s>expected</span>
        <span><s class="p-rises"></s>rises</span>
      </div>` +
      /* THE NEXT THREE DEADLINES ARE NOW DOORS. They were inert text on the
         one screen that knows when things are due and cannot do any of them —
         every mark pointed at another tab and the player had to go and find
         it. The docket has carried `data-goto`/`data-open` since it was
         built; this is the same pattern on the same shared openTarget(), not
         a second way of navigating. A mark with no `tab` (the rise, a thing
         merely expected) stays inert, because it is a statement and there is
         nothing to go and do about it. */
      (next.length ? '<div class="calnext">' + next.map(m =>
        /* A REAL BUTTON, not a div wearing role="button" — uxtest calls that
           an improvised control and it is right to. An inert mark stays a
           div, because it is not a control at all. */
        `<${m.tab ? "button" : "div"} class="cn ${m.kind}` +
        `${m.away <= 2 ? " late" : ""}${m.tab ? " goto" : ""}"` +
        (m.tab ? ` data-goto="${esc(m.tab)}" data-open="${esc(m.focus || "")}"` : "") +
        `><b>${esc(m.text)}</b>` +
        `<i>${m.away === 0 ? "today" : m.away === 1 ? "next sitting"
            : "in " + m.away + " sittings"} \u00b7 ${m.date}${
            m.how ? " \u00b7 " + esc(m.how) : ""}</i></${m.tab ? "button" : "div"}>`).join("") + "</div>"
       : "");
  }

  function drawCalendar() {
    const el = $("#sit-cal"); if (!el) return;
    el.innerHTML = calendarHTML();
    const ss = $("#cal-sess"); if (ss) ss.textContent = st.session;
    /* One listener, and a real <button> brings its own keyboard. */
    el.querySelectorAll("[data-goto]").forEach(b =>
      b.addEventListener("click", () => openTarget(b)));
    el.querySelectorAll("[data-cal]").forEach(b =>
      b.addEventListener("click", () => {
        calMonth += +b.dataset.cal;
        /* never wander: two months either side of where the House is */
        calMonth = Math.max(-2, Math.min(2, calMonth));
        drawCalendar();
      }));
  }

  function docketHTML() {
    const owed = Engine.outstanding(st);
    const bill = (C.bills || []).find(b => st.bills[b.id] && !st.bills[b.id].dead &&
      st.bills[b.id].stage !== "assented");
    const rows = [];
    if (bill) rows.push(`<div class="dk bill goto" data-goto="cham"><b>${esc(bill.title)}</b>
      <i>${esc(String(st.bills[bill.id].stage).replace(/_/g, " "))} · Chamber — give it time on the order paper</i></div>`);
    owed.forEach(u => {
      const due = u.by - st.sitting;
      const w = Engine.undertakingWhere(C, u);
      rows.push(`<div class="dk owed goto${due <= 1 ? " late" : ""}" data-goto="${w.tab}" data-open="${esc(w.focus || "")}"><b>${esc(u.text)}</b>
        <i>${due <= 0 ? "due this sitting" : "by sitting " + u.by}${
          u.owed_to ? " · " + esc(partyName(u.owed_to)) : ""} · ${esc(w.how)}</i></div>`);
    });
    /* A DIVISION HAS A DAY, and the day is business. */
    (C.bills || []).forEach(b => {
      const bs = bsOf(b.id);
      if (!bs || bs.dead || bs.dividesOn == null) return;
      const away = bs.dividesOn - st.sitting;
      rows.push(`<div class="dk div goto${away <= 0 ? " late" : ""}" data-goto="cham">
        <b>Division: ${esc(b.title)}</b>
        <i>${away <= 0 ? "today" : "sitting " + bs.dividesOn +
            " · " + away + " sitting" + (away === 1 ? "" : "s") + " away"} · Chamber</i></div>`);
    });
    (C.instruments || []).forEach(si => {
      const x = st.instruments[si.id];
      if (x && x.inForce && x.prayerCloses != null && x.prayerCloses > st.sitting)
        rows.push(`<div class="dk pray goto" data-goto="gov"><b>${esc(si.number)}</b>
          <i>prayable for ${x.prayerCloses - st.sitting} more · Papers</i></div>`);
    });
    /* A POST THE GOVERNMENT HAS NOT FILLED IS BUSINESS. The appointment
       lives on the Government screen, but a player who never opens it
       would never learn there was one — and the docket is where this
       game says what is outstanding. */
    Engine.vacancies(st, C).forEach(pid => {
      const post = (C.cabinet || []).find(p => p.id === pid);
      /* `.post`, not `.owed`. An undertaking is a promise the government
         made; a vacancy is a hole in it. They look alike and they are not
         the same business, and sharing the class made the docket's own
         check count one as the other. */
      rows.push(`<div class="dk post goto" data-goto="gov"><b>${esc(post ? post.title || post.name : pid)}
        stands vacant</b><i>no holder · the department cannot make an order · Government</i></div>`);
    });

    /* THE SESSION'S END IS ALWAYS ON THE PAPER. It is the cheapest
       possible source of pressure and it needs no mechanic of its own:
       everything above it has to happen before it. */
    if (st.sessionEnds != null) {
      const left = st.sessionEnds - st.sitting + 1;
      rows.push(`<div class="dk rises${left <= 3 ? " late" : ""}">
        <b>The House rises</b><i>sitting ${st.sessionEnds} · ${left} sitting${
          left === 1 ? "" : "s"} left of session ${st.session}</i></div>`);
    }
    return rows.length ? rows.join("")
      : `<div class="note">Nothing before the House but the sitting itself.</div>`;
  }
  function partyName(id) {
    const p = (C.parties || []).find(x => x.id === id) ||
              (C.characters || []).find(x => x.id === id);
    return p ? p.name : String(id).replace(/_/g, " ");
  }

  /* THE ORDER PAPER. A quiet sitting is still a sitting: the House keeps
     meeting whether or not the player is the story. Nothing here is a control,
     nothing moves a number, and nothing is gated on being read. It is the room
     being a room, and it is what stops a quiet sitting reading as a gap in the
     build — which is exactly how the empty version read (design/17 §2.2). */
  function orderPaperHTML(list) {
    if (!list || !list.length) return "";
    return `<div class="op"><div class="ophead">Order paper` +
      `<em>${list.length} taken</em></div>` +
      list.map(b => `<div class="opline ${esc(b.kind || "")}">${esc(b.text)}</div>`).join("") +
      `</div>`;
  }

  /* THE END OF THE RUN, AS A PAGE. The record of what the government did, the
     answer the country gave it, and nothing to press: a run that has ended
     must not offer a control that advances it. */
  /* ---------- the world ----------

     The globe, and the foreign panel beside it. Foreign affairs lived on the
     Government tab, where four panels had to share a column; it belongs with
     the ground the anchors stand on, which is what the foreign layer has been
     about since the fiction first asserted that the lifeline is in somebody
     else's hands. The toggle at the head is a projection change and not a
     second renderer (js/world.js), so the 2D map is the same drawing in a
     different geometry. */
  function drawWorld() {
    const map = $("#w-map"), side = $("#w-side");
    if (!map) return;
    map.innerHTML = `<div class="w-head">` +
      `<button class="chv rad${World.mode() === "globe" ? " on" : ""}" data-wmode="globe">Globe</button>` +
      `<button class="chv rad${World.mode() === "map" ? " on" : ""}" data-wmode="map">Map</button>` +
      `<button class="chv${World.view.auto ? " on" : ""}" data-wspin="1">${World.view.auto ? "Spinning" : "Still"}</button>` +
      /* ZOOM, which the projection has always supported and nothing drove. */
      `<span class="w-zoom">` +
        `<button class="chv" data-wzoom="out"${World.canZoom(1 / 1.15) ? "" : " disabled"}>\u2212</button>` +
        `<b>${World.zoom().toFixed(1)}\u00d7</b>` +
        `<button class="chv" data-wzoom="in"${World.canZoom(1.15) ? "" : " disabled"}>+</button>` +
      `</span>` +
      `<span class="w-hint">Drag to turn it. Click an anchor or a country. Wheel to zoom.</span>` +
      `</div><div class="w-canvas" id="w-canvas">` + World.render() + `</div>`;
    map.querySelectorAll("[data-wzoom]").forEach(b => b.addEventListener("click", () => {
      World.zoomBy(b.dataset.wzoom === "in" ? 1.15 : 1 / 1.15);
      cue("click"); drawWorld();
    }));
    map.querySelectorAll("[data-wmode]").forEach(b => b.addEventListener("click", () => {
      if (World.mode() === b.dataset.wmode) return;
      World.toggle(); cue("click"); drawWorld();
    }));
    map.querySelectorAll("[data-wspin]").forEach(b => b.addEventListener("click", () => {
      World.auto(); cue("click"); drawWorld();
    }));
    /* THE SELECTION REDRAWS THE WINDOW, NOT THE WHOLE SCREEN. `onChange` used
       to rebuild the canvas as well, which destroyed the node the click was on
       and lost its handler — the reason clicking a country did nothing. The
       canvas only needs repainting when the geographic SELECTION shows on the
       map (a lit country, an annexed body); the window needs redrawing every
       time. So: repaint the canvas in place, then the window. */
    World.onSelect(() => {
      const c = $("#w-canvas");
      if (c) c.innerHTML = World.render();
      const sd = $("#w-side");
      if (sd) {
        sd.innerHTML = worldSideHTML();
        sd.querySelectorAll("[data-goto]").forEach(b =>
          b.addEventListener("click", () => openTarget(b)));
      }
      worldSelHead();
    });
    World.wire($("#w-canvas"), () => {
      const c = $("#w-canvas");
      if (c) c.innerHTML = World.render();
    });

    if (side) side.innerHTML = worldSideHTML();
    const act = $("#w-actors");
    if (act) {
      act.innerHTML = worldActorsHTML();
      act.querySelectorAll("[data-goto]").forEach(b =>
        b.addEventListener("click", () => openTarget(b)));
    }
    worldSelHead();
    side && side.querySelectorAll("[data-goto]").forEach(b =>
      b.addEventListener("click", () => openTarget(b)));
    /* The anchor panel's link back to its host. */
    side && side.querySelectorAll("[data-wiso]").forEach(b =>
      b.addEventListener("click", () => {
        World.select(b.dataset.wiso); cue("click"); drawWorld();
      }));
  }

  /* The selection panel says what it is showing, so a column of prose is
     never unlabelled. */
  function worldSelHead() {
    const hdr = $("#w-sel-hdr"), sub = $("#w-sel-sub");
    if (!hdr) return;
    const anc = World.selectedAnchor();
    const body = World.selectedBody(), sel = World.selected();
    if (anc) {
      const a = (WORLD.anchors || []).find(x => x.id === anc);
      hdr.textContent = a ? (a.tether || a.id) : "The anchor";
      sub.textContent = a && a.mine ? (a.leased ? "leased" : "held") : "foreign";
    }
    else if (body) { hdr.textContent = "The body";  sub.textContent = "beyond the Earth"; }
    else if (sel)  { hdr.textContent = countryName(sel);
                     sub.textContent = "anchor host and sovereign"; }
    else           { hdr.textContent = "What is selected"; sub.textContent = "click an anchor"; }
  }

  /* WHAT A COUNTRY IS, when you click it. The column is the window: the
     state's own summary from content, the anchors on its territory with which
     are held and which are foreign, the modelled actor's standing and ask, and
     what the Commonwealth buys from it if it buys anything. A country with no
     content and no anchor says so plainly rather than showing an empty frame,
     which is the difference between a map and a gazetteer. */
  /* RELEVANT ACTORS, not "countries".

     The author's correction, and it is the right shape: Kenya, the European
     Union, Cordell and the Chryse Basin and Nili Republic do not MATTER until
     the campaign's central event — the station question — makes them matter.
     A panel headed "Countries" that opens on four governments with standing
     bars tells the player those four are the game before the game has said so.

     So the column is the RELEVANT ACTORS: whoever the current chapter and the
     crisis have actually put in play. Before the station issue is raised, that
     is the Commonwealth's own institutions and its neighbours in the roster;
     once it is raised, the four powers come in with it, in the order the
     campaign introduces them. Content decides what is relevant — the flag
     `station_issue` is the gate — and the panel reads it. */
  function foreignOpen() {
    return !!(st.flags && st.flags.station_issue);
  }

  /* AN ANCHOR'S OWN PAGE. It used to have none: clicking a tether selected
     its host and the window showed the country, so the twelve things the
     globe exists to draw were the one subject it could not display. */
  function worldAnchorHTML(id) {
    const a = (WORLD.anchors || []).find(x => x.id === id);
    if (!a) return `<div class="note">No such anchor.</div>`;
    const held = a.mine ? (a.leased ? "Leased by the Commonwealth"
                                    : "Held by the Commonwealth")
                        : "Not the Commonwealth's";
    let h = `<div class="w-c-h"><b>${esc(a.tether || a.id)}</b>` +
      `<span class="w-c-iso">${esc(a.iso || "")}</span></div>`;
    if (a.formal) h += `<div class="note">${esc(a.formal)}</div>`;
    h += `<div class="prow"><div class="plab">Standing</div>` +
      `<div class="pval axpos">${held}</div></div>` +
      `<div class="prow"><div class="plab">Site</div>` +
      `<div class="pval axpos">${esc(a.site || "\u2014")}</div></div>`;
    if (a.station) h += `<div class="prow"><div class="plab">Serves</div>` +
      `<div class="pval axpos">${esc(stationName(a.station))}</div></div>`;
    /* THE HOST IS A LINK BACK, because the anchor beating the country to the
       click is only reasonable if the country is still one step away. */
    if (a.iso) h += `<div class="rulehead">Whose soil</div>` +
      `<div class="fgn"><div class="fgn-h">` +
      `<b><button class="lnk" data-wiso="${esc(a.iso)}">${esc(countryName(a.iso))}</button></b>` +
      `</div>` + (((WORLD.states || {})[a.iso] || {}).note
        ? `<div class="note">${esc((WORLD.states[a.iso] || {}).note)}</div>` : "") +
      `</div>`;
    return h;
  }

  function worldSideHTML() {
    const anc = World.selectedAnchor();
    if (anc) return worldAnchorHTML(anc);
    const body = World.selectedBody();
    if (body) return worldBodyHTML(body);
    const sel = World.selected();
    const cName = sel ? countryName(sel) : "";
    let h = "";
    if (!sel) {
      h = `<div class="note">Every anchor in the dozen stands on somebody else's
        soil. Click one for what the Commonwealth depends on it for.</div>`;
    } else {
      const s = (WORLD.states || {})[sel] || {};
      /* `a.iso` AND NOT `a.host`, the same fault as in js/world.js and missed
         here when that one was fixed: host is "Brazil" and a selection is
         "BRA", so this filter found nothing and the Anchors section has never
         appeared on any country — on a tab whose whole subject is that the
         anchors stand on somebody else's soil. */
      const here = (WORLD.anchors || []).filter(a => a.iso === sel);
      h = `<div class="w-c-h"><b>${esc(cName)}</b><span class="w-c-iso">${esc(sel)}</span></div>`;
      if (s.note) h += `<div class="note">${esc(s.note)}</div>`;
      if (here.length) {
        h += `<div class="rulehead">Anchors <em>${here.length}</em></div>` + here.map(a =>
          `<div class="fgn"><div class="fgn-h"><b>${cxlink("anchor_" + a.id, a.tether)}</b>` +
          `<span class="fgn-lag">${a.mine ? (a.leased ? "leased" : "held") : "foreign"}</span></div>` +
          `<div class="note">${esc(a.site)}${a.formal ? " &middot; " + esc(a.formal) : ""}` +
          `${a.station ? " &middot; serves the " + esc(stationName(a.station)) : ""}</div></div>`).join("");
      }
      /* NO HEADING WHERE THERE IS NOTHING UNDER IT. This printed an Anchors
         section reading "None" for every state that has none, which is most
         of them — a heading and three lines of prose to say that a country
         is not relevant, on every country that is not relevant. */
      if (s.actor) {
        const a = (C.actors || []).find(x => x.id === s.actor);
        const live = (st.actors || {})[s.actor] || {};
        if (a) h += `<div class="rulehead">The relationship</div>` +
          `<div class="note">${esc(a.name)} &mdash; standing ${live.standing == null ? a.standing : live.standing}, ` +
          `${a.lag ? a.lag + " sitting" + (a.lag === 1 ? "" : "s") + " behind" : "nearly current"}. ` +
          `Wants: ${esc(a.asks || "something unstated")}.</div>`;
      }
      if (s.markets) h += `<div class="rulehead">What it sells</div><div class="note">${esc(s.markets)}</div>`;
    }
    return h;
  }

  /* THE ACTORS, in a panel of their own. This was a fold at the foot of the
     selection panel, which made the campaign's whole cast a footnote to
     whatever country had last been clicked — and `worldSideHTML` returns
     early for a selected BODY, so selecting the Moon hid the powers
     entirely.

     Still gated: the four powers are not presented as the game before the
     story has introduced them, and until then the panel says what it is
     waiting for rather than standing empty. */
  function worldActorsHTML() {
    /* IT SAYS THE PANEL IS EMPTY AND NOT WHY. The old line named the
       station question as the trigger, which spoils a turn the campaign has
       not taken yet AND assumes this campaign: the gate is a flag, and
       another campaign will raise it for another reason entirely. An empty
       panel should say it is empty, which is all the player needs. */
    if (!foreignOpen())
      return `<div class="note">No power outside the Commonwealth is before the ` +
        `government at present. They appear here when one is.</div>`;
    return foreignHTML();
  }
  function countryName(iso) {
    const f = (typeof WORLD_COUNTRIES !== "undefined" ? WORLD_COUNTRIES : [])
      .find(c => c.i === iso);
    return f ? f.n : iso;
  }

  /* A LINK INTO THE CONCORDANCE, from the world panel. The encyclopedia
     already draws `[[id]]` links and every screen reaches it through the
     delegated [data-go] handler, so this is the same markup the articles use
     — one linker, so a name in the panel and a name in an article open the
     same page. */
  function cxlink(id, label) {
    return `<a class="cx-link" tabindex="0" data-go="${esc(id)}">${esc(label)}</a>`;
  }

  /* THE WORKS, when its mark is clicked: the thing the campaign is about. It is
     not a station of the Commonwealth and the window says so, because a player
     who thinks it is a member will misread every argument about it. */
  function worldBodyHTML(id) {
    const b = Engine.foreignBody(C, id);
    if (!b) return `<div class="note">No such body.</div>`;
    const home = Engine.isAnnexed(st, C, id);
    const a = (C.actors || []).find(x => x.id === b.operator);
    const live = (st.actors || {})[b.operator] || {};
    return `<div class="w-c-h"><b>${esc(b.name)}</b><span class="w-c-iso">${home ? "annexed" : "outside"}</span></div>` +
      `<div class="note">${cxlink("body_" + b.id, "Concordance")} &middot; ` +
        `operated by ${cxlink("actor_" + (b.operator || ""), a ? a.name : b.operator)}</div>` +
      (b.note ? `<div class="note">${esc(b.note)}</div>` : "") +
      `<div class="ostats">` +
        `<span><b>${(b.population || 0).toLocaleString()}</b><i>population</i></span>` +
        `<span><b>${(b.workforce || 0).toLocaleString()}</b><i>workforce</i></span>` +
        `<span data-tip="closure"><b>${(b.closure || 0).toFixed(2)}</b><i>closure</i></span>` +
        `<span><b>${(b.suspended || 0).toLocaleString()}</b><i>suspended</i></span>` +
      `</div>` +
      `<div class="rulehead">The charter</div><div class="note">${esc(b.charter || "")}</div>` +
      `<div class="rulehead">The operator</div><div class="note">` +
        `${esc(a ? a.name : b.operator)}` +
        `${a ? " &mdash; standing " + (live.standing == null ? a.standing : live.standing) +
          (a.lag ? ", " + a.lag + " sitting" + (a.lag === 1 ? "" : "s") + " behind" : "") : ""}. ` +
        `Wants: ${esc((a && a.asks) || "the charter honoured")}.</div>` +
      (b.grievance ? `<div class="rulehead">Grievance</div><div class="note">${esc(b.grievance)}</div>` : "") +
      `<div class="rulehead">Interests</div><div class="note">${esc((b.interests || []).join("  \u00b7  "))}</div>`;
  }
  function stationName(id) {
    const s = (C.stations || []).find(x => x.id === id);
    return s ? s.name : id;
  }

  function settlementName(id) {
    const s = (C.settlements || []).find(x => x.id === id);
    return s ? s.name : String(id).replace(/_/g, " ");
  }
  /* THE LAST BOARD, AS A SET PIECE (design/31's third use).

     The frame was built for three things — the long-form event, the
     introduction, and the last page after the count — and only two of them
     used it. The board was a panel among panels, which is the wrong shape
     for the one page in a run that is a RECORD rather than a control: it is
     read once, it offers exactly one way forward, and there is nothing
     underneath it to do.

     THE MOOD IS RETURNED AND NOT CUED, like every other set piece, because
     sound comes from user actions and engine effects and never from a draw.
     The caller cues it on the action that ended the run. */
  function endMood(end) {
    if (end.kind === "loss") return "grave";
    if (end.kind === "election" && end.result) {
      const r = end.result;
      if ((r.held || 0) > (r.was || 0)) return "triumph";
      if ((r.held || 0) < (r.was || 0)) return "sombre";
      return "moment";
    }
    if (end.kind === "settlement" && end.settlement)
      return end.settlement.terminal === false ? "sombre" : "moment";
    return "moment";
  }

  function endPiece(end) {
    const seatLine = map => Object.keys(map || {}).sort((a, b) => map[b] - map[a])
      .map(id => ps(id) + " " + map[id]).join(" · ");
    const secs = [];
    let title;

    if (end.kind === "election" && end.result) {
      const r = end.result, was = r.was || 0, held = r.held || 0;
      title = "The Commonwealth has voted";
      secs.push({ kind: "lede", body:
        "The government went to the country with " + was + " seat" + (was === 1 ? "" : "s") +
        " and came back with " + held + ". " +
        (held > was ? "It gained." : held < was ? "It lost." : "It held where it stood.") });
      secs.push({ kind: "document", head: "The House it returns",
                  body: seatLine(r.after), source: "Return of the writs" });
    } else if (end.kind === "settlement" && end.settlement) {
      title = end.settlement.name;
      secs.push({ kind: "lede", body: end.settlement.closing ||
                                      end.settlement.summary || "" });
    } else {
      title = "The government has fallen";
      secs.push({ kind: "lede", body: end.reason
        ? "It lost the House: " + end.reason + "."
        : "It lost the House." });
    }

    if (st.settledAs)
      secs.push({ kind: "body", head: "What the session settled",
                  body: settlementName(st.settledAs) + "." });
    if (st.resolvedAs)
      secs.push({ kind: "body", head: "How the crisis resolved",
                  body: settlementName(st.resolvedAs) + "." });

    /* WHAT THE GOVERNMENT DID TO THE COUNTRY, which is the thing a player
       wants at the end and which no board has ever printed: where it was
       liked and where it was not, band by band. */
    if (st.standing && Engine.bandsOf) {
      const bands = Engine.bandsOf(C);
      if (bands.length) secs.push({ kind: "document", head: "Where it stood, at the end",
        body: bands.map(b => bandName(b) + " " + st.standing[b]).join(" · "),
        source: "Standing by band, against " + st.scalars.public_standing + " nationally" });
    }

    /* AND WHAT IT WILL BE REMEMBERED FOR. Appointments to a licensing board
       are the one act this government takes that an opposition runs an
       election on, so they are named here whether or not anybody noticed at
       the time. */
    if (Engine.boardsTotal && Engine.boardsTotal(st) > 0)
      secs.push({ kind: "body", head: "On the record",
        body: "This government made " + Engine.boardsTotal(st) +
              " appointment" + (Engine.boardsTotal(st) === 1 ? "" : "s") +
              " to licensing boards, changing who was entitled to vote in " +
              "the constituencies concerned." });

    secs.push({ kind: "body", head: "The record",
      body: st.log.length + " entries, sitting " + st.sitting + ", session " + st.session +
            ". Every decision is on the Record tab, where it can be read and taken " +
            "away, and nothing here can be taken back." });

    return { title: title, sections: secs, mood: endMood(end) };
  }

  function endBoardHTML(end) {
    const seatsOf = map => Object.keys(map || {}).sort((a, b) => map[b] - map[a])
      .map(id => `${mark(id)}${esc(ps(id))} ${map[id]}`).join(" &middot; ");
    let head, body = "";
    if (end.kind === "election" && end.result) {
      const r = end.result, was = r.was || 0, held = r.held || 0;
      head = "The Commonwealth has voted";
      body =
        `<div class="rulehead">The answer</div><div class="note">` +
          `The government went to the country with <b>${was}</b> seat${was === 1 ? "" : "s"} and ` +
          `came back with <b>${held}</b>. ` +
          (held > was ? "It gained." : held < was ? "It lost." : "It held where it stood.") +
        `</div>` +
        `<div class="rulehead">The House it returns</div><div class="note">${seatsOf(r.after)}</div>` +
        (st.settledAs ? `<div class="rulehead">What the session settled</div>` +
          `<div class="note">${esc(settlementName(st.settledAs))}.</div>` : "") +
        (st.resolvedAs ? `<div class="rulehead">How the crisis resolved</div>` +
          `<div class="note">${esc(settlementName(st.resolvedAs))}.</div>` : "");
    } else if (end.kind === "settlement" && end.settlement) {
      head = end.settlement.name;
      body = `<div class="note">${esc(end.settlement.closing || end.settlement.summary || "")}</div>`;
    } else {
      head = "The government has fallen";
      body = `<div class="note">${esc(end.reason || "It lost the House.")}</div>`;
    }
    return `<div class="endboard"><h3>The end of the session</h3>` +
      `<div class="rulehead">${esc(head)}</div>` + body +
      `<div class="rulehead">The record</div><div class="note">` +
        `${st.log.length} entries, sitting ${st.sitting}, session ${st.session}. ` +
        `Every decision is on the Record tab, and nothing here can be taken back.</div></div>`;
  }

  function drawSitting() {
    const dk = $("#sit-docket");
    if (dk) {
      dk.innerHTML = docketHTML();
      dk.querySelectorAll("[data-goto]").forEach(b =>
        b.addEventListener("click", () => openTarget(b)));
    }
    drawCalendar();
    drawToday();

    const box = $("#sitting-body");

    /* THE GOVERNMENT INTRODUCES ITSELF, IN THE TERMINAL (design/31 §5).

       This was a menu screen between choosing a government and choosing a
       slot, which made it a thing you got through before the game rather
       than the game's first beat. It belongs here: the same set-piece page,
       in the sitting panel, with the wire and the calendar and the docket
       around it — so the first thing a player reads is already inside the
       chrome they are about to govern from.

       It deliberately does NOT take the screen. Everywhere else a set piece
       collapses the columns either side, because a turn the world takes
       should; an introduction is the opposite, and is better for being
       surrounded by the instrument panel it is teaching you to read. */
    if (!(st.flags || {})._introRead) {
      const adm = (C.administrations || []).find(a => a.id === st.admin);
      if (adm && adm.intro && typeof SetPiece !== "undefined") {
        box.innerHTML = SetPiece.html({ setpiece: adm.intro },
                                      { go: "Take office" }).html;
        /* ARMED WITH THE PAGE, WRITTEN ON THE CLICK. `armed` is false where
           the path cannot be measured (jsdom, a browser without
           getTotalLength); then there is no stroke to wait for, so the click
           leaves at once — which is also what a headless walk needs. */
        const armed = SetPiece.arm ? SetPiece.arm(box) : false;
        const go = box.querySelector("[data-sp-go]");
        if (go) go.addEventListener("click", () => {
          /* THE HAND MOVES ON THE CLICK, not on the draw. The signature was
             armed (invisible) with the page; taking office is what writes
             it. It holds a beat so it is seen, then the terminal writes the
             next screen in. */
          const wrote = armed && SetPiece.write ? SetPiece.write(box) : false;
          cue("stamp");
          const leave = () => {
            const swap = () => {
              st.flags._introRead = true;
              /* Leaving fades the anthem out and the bed back in. Cued
                 HERE, on the action, because drawing makes no sound. */
              if (typeof Music !== "undefined" && Music.anthem) {
                try { Music.anthem(null); } catch (e) {}
              }
              saved(); drawAll(); reveal();
            };
            /* The dither is for the player who watched the stroke; a
               no-motion player, or a machine that could not arm the
               signature at all, arrives without the theatre. */
            if (wrote && !still && typeof Motion !== "undefined")
              Motion.dissolve(swap, null, 520);
            else swap();
          };
          const still = typeof Motion !== "undefined" && Motion.reduced && Motion.reduced();
          /* THE PAUSE IS THE THEATRE, NOT THE STROKE. The hand crosses the
             page fast enough that nobody reads it as a wipe; what the moment
             needs is the finished name sitting there for a second or two
             before the terminal dissolves it. */
          if (still || !wrote) leave();
          else setTimeout(leave, wrote + 1600);
        });
        return;
      }
    }

    const loss = Engine.checkLoss(st, C);
    if (loss.lost) {
      box.innerHTML = `<div class="waiting"><b>The government has fallen.</b><br>` +
        `Reason: ${loss.reason}. Sitting ${st.sitting}.</div>`;
      return;
    }
    /* THE RUN IS OVER, AND THIS IS THE LAST PAGE. checkEnd already knew it
       and nothing drew it, so a finished run kept advancing into empty
       sittings with the Rise button still live. The board comes BEFORE the
       event draw: a run that has ended has no business offering a decision. */
    const ending = Engine.checkEnd(st, C);
    if (ending.over) {
      /* THE FRAME, WHERE THERE IS ONE. SetPiece is optional everywhere else
         it is used and is optional here too: a build without it still gets
         the board, which is the same facts in a panel. */
      const sitEnd = $("#s-sit");
      if (typeof SetPiece !== "undefined" && SetPiece.html) {
        box.innerHTML = SetPiece.html({ setpiece: endPiece(ending) }).html;
        if (sitEnd) sitEnd.classList.add("setpiece");
      } else {
        box.innerHTML = endBoardHTML(ending);
        if (sitEnd) sitEnd.classList.remove("setpiece");
      }
      return;
    }
    if (!currentEvent) currentEvent = Engine.nextEvent(st, C);
    /* A SET PIECE TAKES THE SCREEN (design/31). The class collapses the
       columns either side; the prose becomes the page and the decision rows
       below it are untouched, so there is still exactly one way to commit an
       act. Toggled on every draw rather than only when one opens, because a
       screen that got stuck wearing it would hide the whole tab. */
    const sit = $("#s-sit");
    if (sit) sit.classList.toggle("setpiece",
      typeof SetPiece !== "undefined" && SetPiece.is(currentEvent));
    if (!currentEvent) {
      /* A QUIET SITTING IS NOT THE SAME AS AN EMPTY GAME, and the screen
         used to say the same sentence for both. A player met "nothing
         demands a decision this sitting", pressed Rise, met it again,
         and pressed Rise thirty times before anything happened —
         reading it as a missing placeholder rather than as the state of
         the world, which is a fair reading of it.

         So: look ahead. If something is coming, offer to sit through to
         it in one act and say what happened on the way. If nothing is
         coming at all, say THAT, plainly, because a game that has run
         out of content should admit it rather than let the player keep
         clicking. */
      const ahead = lookAhead();
      /* THE ORDER PAPER PRINTS FIRST. The day has a page whether or not it
         has a decision on it, and printing one is the difference between a
         quiet sitting and an empty screen. */
      box.innerHTML =
        orderPaperHTML(Engine.business(st, C, 3)) +
        `<div class="note">${ahead.n === 0
          ? "There is no further business before the House. Nothing in the order " +
            "paper will call for a decision, however long the session runs."
          : "Nothing on the order paper demands a decision this sitting."}</div>` +
        (ahead.n > 0
          ? `<div class="btnrow">
               <button class="btn" id="btn-advance">Rise until the next sitting</button>
               ${ahead.n > 1 ? `<button class="btn" id="btn-until">Sit until there is business
                 <i>${ahead.n} sittings</i></button>` : ""}
             </div>`
          : `<div class="btnrow"><button class="btn" id="btn-advance">Rise until the next sitting</button></div>`);
      $("#btn-advance").addEventListener("click", rise);
      const until = $("#btn-until");
      if (until) until.addEventListener("click", () => {
        const from = st.sitting;
        /* Capped, and it stops the moment anything arrives. The cap is
           the same number lookAhead scans, so the button never promises
           a distance it will not go. */
        for (let i = 0; i < LOOKAHEAD && !Engine.nextEvent(st, C); i++) Engine.advance(st, C);
        currentEvent = null; lastResult = null;
        cue("stamp");
        if (typeof Wait !== "undefined") Wait.brief(520);
        setStatus("The House sat " + (st.sitting - from) + " times without a division · sitting " +
                  st.sitting, "transient");
        drawAll(); saved(); afterAction(); reveal();
      });
      return;
    }
    const e = currentEvent;
    if (openRow.event !== e.id) openRow = { event: e.id, i: -1 };
    const spk = e.speaker ? C.characterById[e.speaker] : null;
    $("#sitting-hdr").textContent = e.title;

    /* TWO BLOCKS: what you are reading, and what you are deciding.
       The reading block is ONE element so the portrait's float still
       wraps the prose inside it — a flex column would otherwise make
       the portrait and the text siblings and the float would wrap
       nothing. The decision block is pushed to the foot of the panel by
       margin-top:auto, so a short event leaves its space between the
       two rather than below everything, which reads as a margin
       instead of as an unfinished panel. */
    /* A SET PIECE REPLACES THE READING BLOCK, not the decision. The prose
       becomes a page of sections that takes the screen; the decision rows
       below are drawn by drawDecision() exactly as they always are, so there
       is still one way to commit an act and the derived reading of what a
       choice does is not rebuilt anywhere. The mood is NOT cued here —
       drawing makes no sound; the handler that opened the sitting does it. */
    if (typeof SetPiece !== "undefined" && SetPiece.is(e)) {
      box.innerHTML = SetPiece.html(e, {}).html +
        `<div class="sit-decide" id="sit-decide"></div>`;
      drawDecision();
      return;
    }
    box.innerHTML =
      `<div class="sit-read">` +
        plate(e.image) +
        portrait(spk) +
        (spk ? `<div class="rulehead">${spk.name} &mdash; ${spk.role}</div>` : "") +
        `<div class="prose" id="sitting-prose">${annotate(e.body.split(/\n\n/).map(p => `<p>${p.replace(/\n/g, " ")}</p>`).join(""))}</div>` +
        `<div style="clear:both"></div>` +
      `</div>` +
      `<div class="sit-decide" id="sit-decide"></div>`;

    drawDecision();
  }

  /* THE DECISION BLOCK, DRAWN ON ITS OWN.

     Expanding a row used to redraw the whole sitting body, which
     destroyed and rebuilt the speaker's <img>. Measured: the node was
     replaced and the replacement reported complete:false, so for a frame
     the portrait was its empty box — the flicker. Only this block is
     rewritten now, so the picture above it is never touched. */
  function drawDecision() {
    const foot = $("#sit-decide");
    if (!foot || !currentEvent) return;
    const e = currentEvent;

    if (lastResult) {
      /* WHAT ACTUALLY MOVED, measured across the act rather than read off
         the effects. A value that clamped does not appear, which is the
         point: the outcome tells the truth about the state and the
         expanded choice told you the intention. */
      const moved = lastChanges || [];
      foot.innerHTML =
        `<div class="decl"><b>Outcome</b><br><span id="sitting-outcome">${lastResult}</span></div>` +
        (moved.length
          ? `<div class="ch-sec outcome-moved"><h4>What moved</h4>
               <table class="movetab"><tbody>${moved.map(m =>
                 `<tr class="t-${m.tone}"><td>${esc(m.label)}</td>
                    <td class="n">${m.from}</td>
                    <td class="n arrow">&rarr;</td>
                    <td class="n to">${m.to}</td>
                    <td class="n d">${m.delta > 0 ? "+" : ""}${m.delta}</td></tr>`
               ).join("")}</tbody></table></div>`
          : `<div class="note">Nothing on the board moved.</div>`) +
        `<div class="btnrow"><button class="btn" id="btn-advance">Rise until the next sitting</button></div>`;
      $("#btn-advance").addEventListener("click", rise);
      return;
    }

    const open = Engine.openChoices(st, C, e);
    foot.innerHTML = `<div class="rulehead">Decision</div><div class="choices">` +
      open.map(x => choiceRow(e, x.choice, x.index, openRow.i === x.index)).join("") +
      `</div>`;

    /* Expanding is a user action, so it may cue. Drawing is not. */
    foot.querySelectorAll("[data-expand]").forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.expand;
      openRow = { event: e.id, i: openRow.i === i ? -1 : i };
      cue("click");
      drawDecision();
      const n = $(`[data-expand="${openRow.i >= 0 ? openRow.i : i}"]`);
      if (n) n.focus({ preventScroll: true });
    }));

    foot.querySelectorAll(".commit").forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.i, ch = e.choices[i];
      const owes = [].concat(ch.effects || []).some(x => x.undertake);
      const before = Engine.snapshot(st), beforeStruct = structure(st);
      lastResult = Engine.choose(st, C, e, i) || "Noted.";
      lastChanges = Engine.changes(before, Engine.snapshot(st), C);
      /* THE FIGURE, AND THE HOURGLASS. Both scale with what was done:
         an undertaking hangs unresolved and takes longer to file. */
      cue(owes ? "undertake" : "decide");
      /* An undertaking is a promise and not an outcome, so the score
         notes it and carries on: one hit, no key change, no jump. */
      if (owes) score("undertake");
      if (typeof Wait !== "undefined") Wait.brief(owes ? 480 : 280);
      setStatus(e.title + ": " + lastResult.replace(/\s+/g, " ").slice(0, 120), "transient");
      saved();
      drawAll(); afterAction();
      reportMoves(beforeStruct, structure(st));
      revealNode($("#sitting-outcome"), e);
    }));
  }

  /* HOW FAR AWAY THE NEXT DECISION IS, without taking it.

     Engine.nextEvent MUTATES — it pulls a due event off the queue — so
     this looks ahead on a COPY of the state and never on the live one.
     A read that quietly consumed the next event would be a very hard
     bug to find. */
  const LOOKAHEAD = 40;
  function lookAhead() {
    let probe;
    try { probe = Engine.load(Engine.save(st), C); }
    catch (e) { return { n: 1 }; }
    for (let i = 1; i <= LOOKAHEAD; i++) {
      Engine.advance(probe, C);
      if (Engine.nextEvent(probe, C)) return { n: i };
      if (Engine.checkLoss(probe, C).lost) return { n: i };
    }
    return { n: 0 };
  }

  function rise() {
    Engine.advance(st, C); currentEvent = null; lastResult = null;
    lastChanges = null;
    openRow = { event: null, i: -1 };
    setStatus("The House rises · sitting " + st.sitting, "transient");
    if (typeof Wait !== "undefined") Wait.brief(200);
    drawAll(); saved(); afterAction(); reveal();
  }

  /* ---------- chamber ---------- */

  /* WESTMINSTER, NOT A HEMICYCLE (bible 12.7, revised).

     A semicircle renders parliament as a spectrum, which is exactly the wrong
     reading of this chamber: confidence is binary and the whip panel next door
     spends capital moving whole benches across a floor. Facing benches make
     "who is in government" the first thing the diagram says.

     Three bodies, because there are three:
       government   coalition plus confidence-and-supply, above the floor
       opposition   everyone else, below it
       the bench    every functional member, crosswise at the Bar

     Functional members sit apart whatever party badge they wear, because under
     dual majority they are a separate electorate that must carry a measure
     separately. Seating them with their party would hide the one fact the
     player most needs: that a government majority is not a majority.

     Glyph shape still carries tier (12.2's split visual language):
     circle district, square list, triangle functional. */
  /* ---------- GOVERNMENT AND CHAMBER: WHICH TAB HOLDS WHAT ----------

     The rule that settles it: A READOUT MAY APPEAR ON MORE THAN ONE TAB.
     A CONTROL APPEARS ON EXACTLY ONE. A scoreboard belongs wherever you
     are standing; a lever in two rooms is two levers that disagree.

     So the forecast BARS are on both — the minister steering a bill wants
     to know whether it passes without leaving the room — and the whip and
     the party breakdown, which are how you WORK the numbers, are here,
     beside the benches they move. Government is what you command:
     coalition, currents, ledger, cabinet, undertakings, order-paper time,
     the programme. Chamber is who you must convince.

     There is ONE selection. The order paper picks the measure; the House
     is coloured for whatever the order paper has picked. `chamberBare`
     is not a second choice of bill, only a request to see the House at
     rest, and naming a measure here names it there. */
  let chamberBare = false;
  /* HOW THE HOUSE IS DRAWN, in two parts that are not the same kind of thing.

     THE COLOUR IS A CHOICE. A seat is coloured by the party that holds it or
     by the vote it is giving, and not both, so the two exclude each other.

     THE ARRANGEMENT IS A SET. Regrouping the ayes, and folding the functional
     bench into the two sides, are independent facts about the drawing, and
     either can hold with the other. Combining them is the point: fold the
     bench in AND group the ayes is the view a whip wants for a simple
     measure.

     The interface says which is which — a segmented control for the choice, a
     row of toggles for the set — because two controls that look alike and
     behave differently is the bug, not the feature. */
  let chamberColour = "party";     /* party | vote */
  let chamberGroup = false;        /* ayes contiguous within each aisle */
  let chamberFold = false;         /* the functional bench joins the aisles */
  /* WHILE A DIVISION IS BEING READ. Parties named so far fill their ayes; the
     ones not yet called hold their party colour and no fill. Null the rest of
     the time, which is nearly all of it. */
  let chamberCount = null;
  /* WHETHER THE HOUSE MOVES WHEN IT DIVIDES. An option rather than a constant,
     because the gather is a taste: if it turns out to be wrong, the count
     still works without it and no code has to change. Default on. */
  const chamberMotion = () => (typeof Shell === "undefined" || !Shell.opt)
    ? true : Shell.opt("chamberMotion") !== false;
  const CHCOLOURS = [["party", "by party"], ["vote", "by vote"]];
  const CHTOGGLES = [["group", "ayes together"], ["fold", "bench folded in"]];
  const chamberBill = () => chamberBare ? null : Focus.selected("cham-bills");

  function drawChamberPicker() {
    const el = $("#cham-pick"); if (!el) return;
    const cur = chamberBill();
    const b = cur ? C.billById[cur] : null;
    /* ONE LINE, TWO STATES. This was a wrapping grid of one button per
       measure — seven buttons over four lines, a second order paper
       above the first. The order paper beside it does the choosing now,
       so all this has to say is what the House is currently drawn for
       and how to put it back at rest. */
    el.innerHTML = `<div class="chpick">` + (b
      ? `<b>Showing</b><span class="chnow">${esc(b.title)}` +
        `${b.dualMajority ? ' <i class="dual">dual</i>' : ""}` +
        `${bsOf(cur).dead ? ' <i class="dual">fallen</i>' : ""}</span>` +
        `<button class="chp" data-cb="">show the House at rest</button>`
      : `<b>Showing</b><span class="chnow">the House as it sits</span>` +
        `<i class="chhint">choose a measure on the order paper to colour the benches</i>`) +
      `</div>` +
      /* The controls are offered only when there is a vote to show. At rest
         every seat is the same state and every option would draw one picture.

         TWO KINDS, MARKED AS TWO KINDS. The colour is a radio group and the
         two buttons are joined into one segmented control, which is what "pick
         one" looks like. The arrangement is a pair of toggles, each with its
         own box, which is what "any of these" looks like. */
      (b ? `<div class="chviews">` +
        `<span class="chgrp radios" role="radiogroup" aria-label="Colour the benches">` +
        CHCOLOURS.map(([v, lab]) =>
          `<button class="chv rad${chamberColour === v ? " on" : ""}" data-colour="${v}"` +
          ` role="radio" aria-checked="${chamberColour === v ? "true" : "false"}">${lab}</button>`
        ).join("") + `</span>` +
        `<span class="chgrp toggles" role="group" aria-label="Arrange the benches">` +
        CHTOGGLES.map(([k, lab]) => {
          const on = k === "group" ? chamberGroup : chamberFold;
          return `<button class="chv tog${on ? " on" : ""}" data-toggle="${k}"` +
            ` aria-pressed="${on ? "true" : "false"}"><i class="box"></i>${lab}</button>`;
        }).join("") + `</span>` + `</div>` : "");
    const off = el.querySelector("[data-cb]");
    if (off) off.addEventListener("click", () => {
      chamberBare = true; cue("click"); drawChamber();
    });
    el.querySelectorAll("[data-colour]").forEach(btn => btn.addEventListener("click", () => {
      chamberColour = btn.dataset.colour; cue("click"); drawChamber();
    }));
    el.querySelectorAll("[data-toggle]").forEach(btn => btn.addEventListener("click", () => {
      if (btn.dataset.toggle === "group") chamberGroup = !chamberGroup;
      else chamberFold = !chamberFold;
      cue("click"); drawChamber();
    }));
  }

  /* The two majorities the measure must clear, under the plan that shows
     why. A dual bill can carry the popular benches and fall on the
     functional forty, and 4.6.7 says both are on screen throughout.

     The numbers are the REPORTED ones, the same estimate the Government
     tab prints (design/08 §7). Colouring the seats from the true count
     would have handed the player the exact division by counting marks. */
  function drawChamberForecast() {
    const el = $("#cham-forecast"); if (!el) return;
    const id = chamberBill();
    if (!id) {
      el.innerHTML = `<div class="note">Naming a measure colours the benches by how they are expected to go, ` +
        `and puts the whip beside them.</div>`;
      return;
    }
    const b = C.billById[id], d = houseRead(id), voted = houseVoted(id);
    el.innerHTML =
      benchBar(voted ? "Popular \u00b7 as voted" : "Popular", d.popular) +
      (b.dualMajority ? benchBar(voted ? "Functional \u00b7 as voted" : "Functional", d.functional) : "") +
      domainNote(d) +
      `<div class="note">${b.dualMajority
        ? (d.carries ? "Carries both tests."
           : d.popular.carries ? "<b>Carries the House and fails the functional bench.</b>"
           : "Fails.")
        : (d.popular.carries ? "Carries." : "Fails.")} ` +
        /* ONE LINE. Three sentences of standing explanation sat under every
           forecast: what a filled seat means, what a half-filled one means,
           that the count is by party, and who the estimate came from. None
           of it changes between bills, so it is a tip on the readout it
           explains rather than a paragraph reprinted under each one. */
        (voted
          ? `<i class="prov" data-tip-title="As the House voted" ` +
            `data-tip-body="Sitting ${bsOf(id).lastDivision.at}. Filled seats are ` +
            `ayes; the rest are noes or absentees.">voted &middot; sitting ` +
            `${bsOf(id).lastDivision.at}</i>`
          : `<i class="prov" data-tip-title="An estimate, not a count" ` +
            `data-tip-body="Filled seats are expected ayes, half-filled ones the whip ` +
            `has bought, and the count is by party rather than by member. ` +
            `${esc(d.prov || "")}.">estimate</i>`) + `</div>`;
  }

  /* The whip, where the members it moves are on screen. It reads the TRUE
     count, not the reported one: what a seat costs is a mechanical fact
     the whips' office knows exactly, even when its forecast is a guess. */
  function drawChamberWhip() {
    const panel = $("#p-whip"), el = $("#cham-whip"); if (!el) return;
    const id = chamberBill();
    if (panel) panel.hidden = !id;
    if (!id) { el.innerHTML = ""; return; }
    const b = C.billById[id], d = Engine.division(st, C, id);
    /* THREE CONTROLS, ONE PANEL, AND ONLY ONE OF THEM OPEN.

       The whip, the pair and the lobby are the same bargaining before the
       same division, which is why they share a panel and a control. But
       three tables stacked needed 557px in a 386px box, so two of them
       were below a scrollbar and the panel read as broken.

       The whip stays open because it is the one a player uses every
       division. The other two fold, and their summaries carry the count
       so a folded section still says whether anything is planned in it —
       a disclosure that hides whether it has contents is a worse trap
       than the overflow it fixed. Open state is remembered per section
       for the session, because a player who lobbies once will lobby
       again. */
    /* THE DIVISION LIST BELONGS IN THE MIDDLE, under the House it
       describes, not in the left column beside the bill's text. It is a
       record of what the chamber did and the chamber is here. */
    const dvl = divisionList(id);
    const cls = clausePanel(id);
    const lob = lobbyPanel(id, b, d);
    const fold = (key, title, sub, inner) => inner
      ? `<details class="foldsec" data-fold="${key}"${whipOpen[key] ? " open" : ""}>` +
        `<summary><b>${title}</b><span>${sub}</span></summary>${inner}</details>`
      : "";
    const lobN = Engine.lobbyCost(st, C, id).seats;
    const html = cls + whipPanel(id, b, d) +
      /* PAIRING IS NOT IN THE PANEL. The engine keeps it, and so do its
         assertions, because the mechanic is correct and the arithmetic
         behind it is one of the better things the chamber does. But under
         an absolute-majority rule a pair costs the government an aye and
         costs the other side a nay the threshold never counted, so there
         is presently no reason for a player to use one — a control nobody
         should press was taking a row of the tightest column on the
         screen. It comes back when content gives a reason to pair: a
         courtesy that buys standing, or a member who asks. */
      fold("lobby", "Outside the chamber",
           lobN ? lobN + " seats asked for" : "nothing asked", lob) +
      dvl;
    /* whipPanel says nothing about a fallen measure, and an empty panel
       is a frame around a hole — but a measure that has DIVIDED is not a
       hole: it has a record, and the record is the reason to keep the
       panel. So the test is the whole contents and not the whip alone. */
    if (panel) panel.hidden = !html;
    if (!html) { el.innerHTML = ""; return; }
    const hdr = $("#cham-whip-hdr");
    if (hdr) hdr.textContent = b.title;
    el.innerHTML = html;
    wireWhipbars(el, id, () => { drawChamber(); drawBill(id); drawStatus(); });
    /* The pairing steppers. A pair is an action, so it goes through acted(). */
    el.querySelectorAll(".pair-b").forEach(btn => btn.addEventListener("click", () => {      const n = Math.max(0, +btn.dataset.pn);
      const r = acted(() => Engine.setPairs(st, C, id, btn.dataset.pair, n));
      if (!r.ok) { cue("deny"); setStatus(r.reason || "cannot pair", "transient"); return; }
      cue("click");
      setStatus(n ? "Paired " + n + " with " + ps(btn.dataset.pair) + " on this division"
                  : "Pair withdrawn from " + ps(btn.dataset.pair), "transient");
      drawChamber(); drawBill(id); drawStatus();
    }));

    /* Asking a member to sign the paper. An action, and a member lost. */
    el.querySelectorAll("[data-sign]").forEach(btn => btn.addEventListener("click", () => {
      const r = acted(() => Engine.collectSignature(st, C, btn.dataset.sign));
      if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); return; }
      cue("stamp");
      setStatus(bare(r.member.name) + " has signed the paper \u00b7 " +
                r.signatures + " names", "transient");
      drawAll(); afterAction();
    }));
    /* The record's own order control, redrawing the chamber it sits in. */
    wireDvl(el, () => { drawChamber(); drawBill(id); });
  }

  /* One table, drawn from whichever state the House is in. */
  function drawBenchTable() {
    const el = $("#comp-table"), hdr = $("#comp-hdr");
    if (!el) return;
    const id = chamberBill();
    if (hdr) hdr.textContent = id ? "by tier, and how they are expected to go" : "by tier";
    el.innerHTML = benchTableHTML(id ? forecast(id) : null);
    /* A player action, so it may make a sound. Clicking the open party
       again closes it. */
    el.querySelectorAll("[data-comp]").forEach(tr =>
      tr.addEventListener("click", () => {
        compOpen = compOpen === tr.dataset.comp ? null : tr.dataset.comp;
        cue("click"); drawBenchTable();
      }));
  }

  /* THE ORDER PAPER IS THE PICKER.

     It was on the Government tab with a second row of buttons over here
     naming the same measures, which is two lists for one selection. The
     legislature's business belongs with the legislature: what is before
     the House, what stage it is at, how it is expected to go, and the
     instrument for changing that, all on one screen. The Government tab
     keeps the executive — the coalition, the ledger, the cabinet, the
     programme and what it costs. */
  /* THE STATE OF A BILL, in one word, so the stage column and anything else
     that colours a bill agree on what colour it is. `passed` and `dead` reuse
     the Papers register's own terminal colours — good and bad — and two more
     are named for the states a register does not rank: a bill still in
     drafting has not been introduced, and a blocked bill is on the book and
     going nowhere. */
  function billState(bs) {
    if (bs.dead || bs.stage === "withdrawn" || bs.stage === "defeated" ||
        bs.stage === "struck" || bs.stage === "fallen" || bs.stage === "referred")
      return "dead";
    if (bs.stage === "blocked")  return "blocked";
    if (bs.stage === "drafting") return "drafting";
    if (bs.stage === "assent" || bs.stage === "assented" || bs.stage === "awaiting_assent")
      return "passed";
    return "live";
  }

  /* THE STAGE BAR. One segment per stage of the ladder, filled to where the
     bill has got to. It is a BAR and not seven loose marks, because a bar
     reads as a quantity before it is counted; and it is COLOURED BY STATE and
     not by progress, so a dead bill is red however far it got and a passed one
     is green the whole way along. The division rung is a wider segment, so the
     one stage that matters is findable without a legend. Same source as the
     Papers register's track: Engine.STAGE_ORDER, never a copy. */
  function stageBar(bs, state) {
    const order = Engine.STAGE_ORDER || [];
    const at = bs.stage === "assented" ? order.length - 1 : order.indexOf(bs.stage);
    return `<span class="stagepips ${state}" aria-hidden="true">` + order.map((sg, i) => {
      const cls = i < at ? "done" : i === at ? "here" : "todo";
      return `<i class="${cls}${sg === Engine.DIVIDES_AT ? " dv" : ""}"></i>`;
    }).join("") + `</span>`;
  }

  function drawOrderPaper() {
    /* WHICH BILL IS OPEN. This used to be the string "divergence", hard
       coded, so the order paper marked the same row for the whole of a
       game however many other bills you opened. The renderer asks the
       selection store, and the store asks content for its default. */
    const sel = Focus.selected("cham-bills");
    let bh = "<thead><tr><th>Bill</th><th data-tip='stage'>Stage</th>" +
      "<th class='n' data-tip='popular'>Pop.</th><th class='n' data-tip='functional'>Func.</th>" +
      "<th data-tip='dual'>Test</th></tr></thead><tbody>";
    C.bills.forEach(b => {
      const bs = bsOf(b.id);
      /* The estimate, like every other forecast the player is shown. This
         printed the TRUE count in the game's most-read table, two panels
         above bars that were carefully reporting a guess. */
      const d = forecast(b.id);
      const state = billState(bs);
      const dead = state === "dead";
      /* CAN THE HOUSE ACT ON IT TODAY — not merely "is it at a stage". The
         engine already answers this for the button; the row borrows the
         answer rather than guessing at one, so the mark and the control can
         never disagree. */
      const ready = !dead && Engine.canDivide(st, C, b.id).ok;
      bh += `<tr class="${b.id === sel ? "sel" : ""} st-${state}${ready ? " ready" : ""}"` +
        ` data-bill="${b.id}" style="cursor:pointer">` +
        `<td>${b.title.replace(/ Bill$/, "")}</td>` +
        `<td class="stage"><span class="stname ${state}">${bs.stage.replace(/_/g, " ")}</span>` +
          (dead ? "" : stageBar(bs, state)) +
          (ready ? ` <span class="rdy" data-tip="stage">ready</span>` : "") + `</td>` +
        /* A STRUCK ROW LOSES ITS FORECAST (§12.13). A measure that has
           fallen cannot be divided on again, so a count for it is a number
           that can never come true — worse than no number at all. A carried
           one keeps its figures: that is the division that actually
           happened and it is the record. */
        `<td class="n">${dead ? "&mdash;" : d.popular.aye}</td>` +
        `<td class="n">${dead || !b.dualMajority ? "&mdash;" : d.functional.aye}</td>` +
        `<td><span class="flag ${b.dualMajority ? "bad" : ""}" data-tip="${b.dualMajority ? "dual" : "simple"}">` +
        `${b.dualMajority ? "DUAL" : "SIMPLE"}</span></td></tr>`;
    });
    $("#cham-bills").innerHTML = bh + "</tbody>";
    /* ONE activation path. A click and an Enter both land in
       Focus.activate, which sets the selection, redraws, and leaves
       focus on the row it just opened. */
    $("#cham-bills").querySelectorAll("tr[data-bill]").forEach(tr =>
      tr.addEventListener("click", () => Focus.activate("cham-bills", tr.dataset.bill)));

    drawBill(sel);
  }


  function drawChamber() {
    drawOrderPaper();
    drawChamberPicker();
    const govIds = st.coalition.concat(st.confidenceSupply);

    /* Largest party nearest the floor, so the front bench reads as the
       despatch box rather than as an arbitrary content order. */
    const bySize = ids => ids.slice().sort((a, b) =>
      Engine.partyTotal(st, b) - Engine.partyTotal(st, a));

    /* ---------------------------------------------------------------
       THE CHAMBER AS THE WHIP'S MAP.

       The plan was a diagram: here is the House, in party colours, and
       nothing to do with it. Naming a bill turns it into an instrument —
       every seat recolours to how that party's bench is expected to go,
       and the two majorities the measure has to clear are drawn under it.

       Aye keeps the party's full colour; the rest of the bench keeps the
       colour and loses the fill. So a player reads party AND vote in one
       look: the Liberals gave us a third of their bench is a shape, not
       a number in a table.

       WHICH member votes which way is not modelled and this does not
       pretend otherwise — the engine returns a count per party per tier,
       so the first n seats of each block are filled. The block is honest;
       the individual seat is a convenience of drawing. */
    const shown = chamberBill();
    /* WHILE A DIVISION IS BEING READ the plan is drawn from the running count
       and not from the bill: the seats of a party that has been called fill,
       and a party still to come does not. */
    const counting = !!chamberCount;
    const fc = counting ? { rows: chamberCount.rows }
             : shown ? houseRead(shown) : null;
    /* A VOTED BILL HAS NO HALF-FILL. The half-filled seat means "the whip
       bought this one", which is a fact about a plan. Once the division has
       run there is no plan, only a vote, and the plan's marks would be a lie
       about members who have already been through the lobby. */
    const voted = counting || (shown ? houseVoted(shown) : false);
    /* THE COUNT IS A SWEEP, NOT A LIST. A division is counted by LOBBY, so
       during one the plan lights aye-seats from the front as the lobby fills —
       what it shows is a quantity climbing, which is what the tellers are
       counting. The budget is spent as the seats are drawn, so the sweep runs
       in the order the benches are. Per-party detail is the analysis
       afterwards, and the plan gives it once the House has voted. */
    let ayeBudget = counting ? chamberCount.ayes : Infinity;
    const spend = want => {
      const n = Math.max(0, Math.min(want, ayeBudget));
      ayeBudget -= n;
      return n;
    };
    const rowOf = id => fc && fc.rows.find(r => r.party === id);
    /* AND THE SEATS THE WHIP BOUGHT ARE NOT THE SEATS YOU HAD. A whipped
       member is an aye, so it filled like any other and committing three
       members changed a number in a table and nothing on the plan. They
       are the LAST ayes of their party's block and they are drawn at half
       fill: solid is a bench that was always yours, half is one you are
       paying for, empty is one you have not got. The whole point of the
       whip living on this tab is watching the benches change as you buy
       them. Opacity rather than a stroke, for the reason under glyph(). */
    const gov = [], opp = [], cross = [];
    /* A STABLE KEY PER SEAT. The seats are drawn as keyed nodes so a division
       can move them, and a key that changed when the benches were re-sorted
       would make every seat a new node and the whole House a jump cut. The
       seats are built in a fixed order, so a counter is a stable name. */
    let seq = 0;
    const popular = (id, into) => {
      const s = st.parties[id].seats, col = C.partyById[id].colour;
      const r = rowOf(id);
      /* DURING A DIVISION the ayes come off a budget spent front to back, so
         the bench lights as a lobby filling rather than as a party reporting. */
      let aye = r ? (counting ? spend(r.popularAye) : r.popularAye)
                  : (counting ? 0 : null);
      const whip = voted || !r ? 0 : Math.min(r.popularWhipped || 0, r.popularAye);
      const put = t => { const on = aye == null || aye-- > 0;
                         into.push({ c: col, t: t, p: id, k: "s" + (seq++),
                                     aye: aye == null ? null : on,
                                     wh: on && aye != null && aye < whip }); };
      for (let i = 0; i < s.district; i++) put("d");
      for (let i = 0; i < s.list; i++)     put("l");
    };
    const allIds = C.parties.map(p => p.id);
    /* A party's functional seats, wherever they are going. */
    const functional = (id, into) => {
      const s = st.parties[id].seats, col = C.partyById[id].colour;
      const r = rowOf(id);
      let aye = r ? (counting ? spend(r.functionalAye) : r.functionalAye)
                  : (counting ? 0 : null);
      const whip = voted || !r ? 0 : Math.min(r.functionalWhipped || 0, r.functionalAye);
      for (let i = 0; i < s.functional; i++) {
        const on = aye == null || aye-- > 0;
        into.push({ c: col, t: "f", p: id, k: "s" + (seq++),
                    aye: aye == null ? null : on,
                    wh: on && aye != null && aye < whip });
      }
    };
    /* FOLDED IN, A PARTY'S FUNCTIONAL SEATS STAND BESIDE IT. The Bar is a block
       at the end because the dual test makes the functional tier a separate
       question; folding the bench in says it is not one, and the seats then
       belong INSIDE the party's block — stacked at the end of the aisle they
       read as one more party nobody has heard of, which is the opposite of
       what folding them in is for. */
    bySize(allIds.filter(id => govIds.includes(id))).forEach(id => {
      popular(id, gov);
      if (chamberFold) functional(id, gov);
    });
    bySize(allIds.filter(id => !govIds.includes(id))).forEach(id => {
      popular(id, opp);
      if (chamberFold) functional(id, opp);
    });
    if (!chamberFold) bySize(allIds).forEach(id => functional(id, cross));

    /* No outline. A stroke on a 3px mark is a third of its area, so 280 of
       them read as a grey mesh with colour trapped inside it. Bare fills
       let the benches read as blocks of party at a glance, which is the
       only thing this diagram is for. */
    /* THE SEATS ARE KEYED, NOT REBUILT. Everything else on this panel can be
       replaced wholesale on every draw; the seats cannot, because a division
       MOVES them and a node that is destroyed and recreated cannot move. Each
       seat carries a stable key — its bench, its party and its place in that
       bench — so the same seat is the same node from one draw to the next, and
       only its transform changes. */
    const GLYPH = {
      d: '<circle class="sg" cx="0" cy="0" r="3.4"/>',
      l: '<rect class="sg" x="-3" y="-3" width="6" height="6"/>',
      f: '<path class="sg" d="M0 -3.8L3.6 2.7L-3.6 2.7Z"/>'
    };
    /* A RING, CARRIED BY EVERY SEAT AND SHOWN ONLY WHEN THE WHIP HAS BOUGHT IT.
       The half-fill it replaces read as a nay, because a nay is also a seat
       that has lost some of its colour: half and faint are the same signal.
       A ring is a different signal — the seat keeps ALL its party colour and
       wears a mark saying the government is paying for it. */
    function paintSeats(list) {
      const g = document.getElementById("chamber-seats");
      if (!g) return;
      const seen = Object.create(null);
      list.forEach(s => {
        seen[s.k] = 1;
        let el = g.querySelector('[data-k="' + s.k + '"]');
        if (!el) {
          el = document.createElementNS("http://www.w3.org/2000/svg", "g");
          el.setAttribute("data-k", s.k);
          el.innerHTML = '<circle class="ring" cx="0" cy="0" r="5.2"/>' +
                         (GLYPH[s.t] || GLYPH.d);
          g.appendChild(el);
        }
        el.setAttribute("transform",
          "translate(" + s.x.toFixed(1) + "," + s.y.toFixed(1) + ")");
        const st = s.aye === false ? " no" : s.wh ? " wh" : "";
        el.setAttribute("class", "seat" + st);
        const sg = el.querySelector(".sg");
        sg.setAttribute("class", "sg" + st);
        sg.setAttribute("fill", s.c);
      });
      [].slice.call(g.children).forEach(el => {
        if (!seen[el.getAttribute("data-k")]) el.remove();
      });
    }

    /* PARTIES STACK HORIZONTALLY. Seats fill column by column, five deep,
       so a party occupies a contiguous block of columns and you read the
       chamber left to right as party, party, party — which is how the
       benches actually work. Filling row-major instead made each party a
       horizontal band and stacked the parties vertically, which reads as a
       bar chart lying on its side rather than as a chamber. */
    const ROWS = 5, CW = 9, RH = 10;
    /* The crossbench at the Bar runs crosswise to the benches: five columns
       wide and as many rows as forty functional seats need. It carries its
       own metrics, because its label is centred on the columns rather than
       on the chamber, and a shared constant would drift the two apart. */
    const XCOLS = 5, XCW = 11, XRH = 10.5;
    const cols = n => Math.ceil(n / ROWS);

    /* THE WIDTH NOTHING MAY DRAW OUTSIDE OF. The viewBox is sized to the
       widest arrangement the House can hold, and the widest a single bench
       can be is the WHOLE HOUSE: on a division every aye stands in one lobby
       and every noe in the other, and a measure the opposition agrees with
       puts nearly 280 seats in one block. Reserving only the party blocks
       covered the ordinary view and let the division draw past the right
       edge of the box, which is the aisle running off the screen. The lobbies
       are WRAPPED to these columns instead (gatherRows), so nothing is ever
       laid outside the reservation, and the reservation is read from the
       ENGINE's totals, which do not move when the view folds. */
    const govPop = govIds.reduce((n, id) =>
      n + ((st.parties[id] || { seats: {} }).seats.district || 0) +
          ((st.parties[id] || { seats: {} }).seats.list || 0), 0);
    const oppPop = Engine.popularTotal(st) - govPop;
    const reservedCols = cols(Math.max(govPop, oppPop) +
                              Engine.functionalTotal(st));
    /* The rows a lobby needs for its seats to fit the reserved columns. */
    const gatherRows = n => Math.max(ROWS, Math.ceil(n / reservedCols));

    /* The bench at the Bar sits crosswise, so it fills the other way. */
    function crossbench(seats, x0, yTop) {
      let out = "";
      seats.forEach((s, i) => {
        out += glyph(x0 + (i % XCOLS) * XCW, yTop + Math.floor(i / XCOLS) * XRH, s);
      });
      return out;
    }

    /* THE CHAIR. One constituency in content carries `speaker:true`; the
       member for it takes the Chair. The glyph is the same district circle
       as everyone else's, in the colour of whichever party holds that seat
       on the roll — impartial in the House, partisan on the map, which is
       the true state of affairs. Drawing it as a piece of furniture said
       the chamber contained a chair; drawing it as a member says the
       chamber contains a member who is not on either bench.

       The seat is moved out of its bench rather than added, so the plan
       still shows 280 marks for 280 seats. */
    const govN = gov.length, oppN = opp.length, crossN = cross.length;
    const spkSeat = (C.constituencies || []).find(k => k.speaker);
    let chair = null, chairParty = null, chairName = spkSeat ? spkSeat.member : null;
    if (spkSeat) {
      const held = Engine.seatsFor(st, spkSeat.id).held;
      chairParty = Object.keys(held).sort((a, b) => held[b] - held[a])[0] || null;
      const ch = (C.characters || []).find(c => c.seat === spkSeat.name);
      if (ch) chairName = ch.name;
      const take = arr => {
        const i = arr.findIndex(g => g.p === chairParty && g.t === "d");
        return i >= 0 ? arr.splice(i, 1)[0] : null;
      };
      chair = take(gov) || take(opp);
    }

    /* THE VIEW, applied last and in two independent parts. Grouping reorders
       each aisle; colouring repaints it; neither knows about the other, and
       the fold happened above when the seats were dealt. The Chair is out of
       the array before any of them, so no view can move it. */
    const sortByVote = arr => arr.slice().sort((a, b) =>
      (b.aye === true ? 1 : 0) - (a.aye === true ? 1 : 0));
    const paint = arr => chamberColour === "vote"
      ? arr.map(s => Object.assign({}, s,
          { c: s.aye === false ? "var(--alert)" : "var(--ok)" }))
      : arr;
    const viewed = arr => paint(chamberGroup ? sortByVote(arr) : arr);
    const govV = viewed(gov), oppV = viewed(opp), crossV = viewed(cross);

    /* Everything is derived from the seat counts, so the diagram tightens
       when a party crosses the floor rather than leaving a hole. */
    const govCols = Math.max(1, cols(gov.length));
    const oppCols = Math.max(1, cols(opp.length));
    /* THE FLOOR WIDENS ONLY FOR THE GATHER. When the House divides, the ayes
       stand in one aisle and the noes in the other, so it must be wide enough
       for the larger of those — wider than either party block, and sizing it
       that way the whole time shrank the ordinary House to two-thirds of the
       panel. So the ordinary view keeps its own width and the floor widens for
       the division, which is a change you are meant to notice. */
    const partyW  = Math.max(govCols, oppCols) * CW;
    const ayesN = gov.concat(opp, cross).filter(s => s.aye !== false).length;
    const noesN = gov.length + opp.length + cross.length - ayesN;
    /* THE FLOOR WIDENS FOR THE GATHER, and only to the reservation. The
       lobbies are wrapped to the reserved columns, so the division needs
       exactly that width on the floor and never more. */
    const standing = counting && chamberMotion();
    const ayesRows = standing ? gatherRows(ayesN) : ROWS;
    const noesRows = standing ? gatherRows(noesN) : ROWS;
    const gatherW = reservedCols * CW;
    const benchW = standing ? gatherW : partyW;
    const crossRows = Math.max(1, Math.ceil(cross.length / XCOLS));

    const X0 = 66;                                    // clear of the Chair
    /* THE FLOOR IS EMPTY. There was a table of the House with the mace on
       it and two dashed sword lines, and none of it carried information:
       the diagram already says who is in government by which side of the
       gap they sit on. The gap is now narrow enough to read as facing
       benches rather than as two unrelated blocks. */
    const GAP = 17;                                   // floor to front bench
    const FLOOR = 24 + (ROWS - 1) * RH + GAP;   // headroom for the label
    const govFront = FLOOR - GAP, oppFront = FLOOR + GAP;
    const govTop = govFront - (ROWS - 1) * RH;
    const oppBot = oppFront + (ROWS - 1) * RH;

    const CX = X0 + benchW / 2 - CW / 2;              // bench centre

    /* THE BAR IS DRAWN ONLY WHEN SOMETHING IS AT IT. AISLES puts the
       functional seats into the two aisles, so the block would be a column of
       empty space with "THE BENCH" written over it. */
    const hasBar = cross.length > 0;
    const crossX = X0 + benchW + (hasBar ? 30 : 0);
    const crossTop = FLOOR - ((crossRows - 1) * XRH) / 2;
    const crossBot = crossTop + (crossRows - 1) * XRH;
    /* The label is centred on the COLUMNS, not on crossX: the first column's
       centre is crossX, so the middle of five columns is two spacings along.
       Centring on crossX put both labels a column-width right of the bench. */
    const crossCX = crossX + ((XCOLS - 1) * XCW) / 2;

    /* THE VIEWBOX IS THE SAME SIZE WHETHER THE BAR IS DRAWN OR NOT.

       It used to be `hasBar ? … : …`, and an inline svg with a viewBox and
       no width fills its container — so folding the functional bench into
       the aisles shrank the coordinate space inside a box that stayed put,
       and every seat in the House got BIGGER. Folding is a change of
       arrangement and it should not be a change of scale: a player who
       folds the bench to compare two readings had the whole diagram jump
       size underneath them.

       So the space is reserved either way. It costs a strip of empty
       coordinate on the right when the bar is empty, which nobody can see,
       and it buys a diagram that does not move. */
    const barW = XCOLS * XCW + 14 + 30;
    /* And the benches are reserved at their WIDEST ARRANGEMENT, not their
       current one. Reserving the Bar alone was not enough: folding moves
       the functional seats into the aisles, so the two sides grow by what
       the Bar lost and the box got wider instead of narrower. Both states
       are measured here and the larger wins, so the coordinate space is
       identical either way and the seats never change size. Layout still
       uses benchW — only the viewBox uses the reservation, which is why
       the benches stay where they are and the slack falls on the right. */
    /* The reservation (reservedCols) is read from the ENGINE's totals at the
       top of this function, where the base metrics are declared, because the
       lobby wrap needs it before the layout is built. */
    /* AND THE DIVISION DOES NOT WIDEN THE BOX EITHER. benchW swells to
       gatherW while the count runs so the ayes can regroup, and feeding that
       into the viewBox took it from 471 to 660 mid-division — every seat in
       the House shrinking by a third at the exact moment the player is
       watching it. The reservation already covers every column a lobby can
       need, because the lobbies are wrapped to it (gatherRows), so the
       layout may swell and the box does not. */
    const W = X0 + reservedCols * CW + Math.max(barW, 22);
    /* Same for the height: the Bar's rows are reserved whether or not the
       Bar is occupied, so folding never reflows the chamber vertically
       either. Forty functional seats over five columns is the tallest the
       crossbench can be, and that is the height held. */
    const maxCrossRows = Math.max(1, Math.ceil(Engine.functionalTotal(st) / XCOLS));
    const reservedBot = FLOOR + ((maxCrossRows - 1) * XRH) / 2;
    /* THE STANDING HOUSE IS TALLER, NOT WIDER. Wrapping the lobbies to the
       reserved columns lifts the ayes into the headroom, so the drawing is
       shifted down by however much the top block rises above its label. The
       seat scale does not change (the box is width-driven) and the panel
       scrolls, so a division costs height and never a jump in size. */
    const standingTop = standing ? govFront - (ayesRows - 1) * RH : govTop;
    const standingBot = standing ? oppFront + (noesRows - 1) * RH : oppBot;
    const topShift = Math.max(0, 14 - standingTop);
    const H = topShift + Math.max(standingBot + 26, reservedBot + 26) + 8;
    /* An inline <svg> with a viewBox and no width defaults to the width of
       its container, so shrinking the coordinate space only magnified the
       drawing. Sizing it at 1:1 is what actually makes it smaller; the CSS
       lets it scale down again on a narrow screen and no further. */
    const svg = document.getElementById("chamber").ownerSVGElement ||
                document.getElementById("chamber").parentNode;
    svg.setAttribute("viewBox", `0 0 ${Math.round(W)} ${Math.round(H)}`);
    /* 1.35, not 1: at true 1:1 a 9px label is 9px and the whole House is
       450px wide in a 1280px panel, which reads as an afterthought rather
       than as the diagram the tab is named for. */
    /* NO WIDTH ATTRIBUTE. The plan used to be drawn at a fixed 1.35x and
       the column capped to match, which was the right answer while the
       Chamber was three narrow panels and the plan was the smallest
       thing on it. Now the House is the subject of the screen: the
       viewBox carries the aspect and the stylesheet gives it the column,
       so it grows with the window instead of sitting at 539px in the
       middle of it. Height follows from the ratio. */
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.aspectRatio = Math.round(W) + " / " + Math.round(H);

    const label = (x, y, t, cls) =>
      `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle" class="chlab${cls ? " " + cls : ""}">${t}</text>`;

    /* WHERE EVERY SEAT STANDS. In the ordinary view a seat stands in its
       party's block. During a division it stands where the vote puts it —
       every aye in the government aisle and every noe in the opposition aisle
       — which is what "the ayes have it" means when you can see the room
       instead of reading the number. Same keys, different coordinates: the
       whole move is one transform, and the stylesheet does the travelling. */
    const all = govV.concat(oppV, crossV);
    /* A bench is laid column by column, `rows` deep. The ordinary view uses
       ROWS; a standing lobby uses however many rows its seats need to fit
       the reserved columns (ayesRows/noesRows), so the ayes are never laid
       outside the box. */
    const layBench = (arr, front, dir, rows) => arr.forEach((s, i) => {
      s.x = X0 + Math.floor(i / rows) * CW;
      s.y = front + dir * (i % rows) * RH;
    });
    const layBar = arr => arr.forEach((s, i) => {
      s.x = crossX + (i % XCOLS) * XCW;
      s.y = crossTop + Math.floor(i / XCOLS) * XRH;
    });
    if (standing) {
      layBench(all.filter(s => s.aye !== false), govFront, -1, ayesRows);
      layBench(all.filter(s => s.aye === false), oppFront, +1, noesRows);
    } else {
      layBench(govV, govFront, -1, ROWS);
      layBench(oppV, oppFront, +1, ROWS);
      layBar(crossV);
    }
    if (chair) { chair.x = 30; chair.y = FLOOR; }

    /* THE STANDING HOUSE IS SHIFTED DOWN so its labels stay in the box; the
       shift is zero in the ordinary view, so nothing there moves. */
    $("#chamber").innerHTML =
      '<g' + (topShift ? ' transform="translate(0,' + topShift.toFixed(1) + ')"' : '') + '>' +
      '<g id="chamber-seats"></g>' +
      label(30, FLOOR + 17, "SPEAKER") +
      label(CX, standingTop - 12, "GOVERNMENT") +
      label(CX, standingBot + 22, "OPPOSITION") +
      (hasBar ? label(crossCX, crossTop - 14, "THE BENCH") : "") +
      (hasBar ? label(crossCX, crossBot + 22, "functional tier", "sub") : "") +
      '</g>';
    paintSeats(chair ? all.concat([chair]) : all);
    const seatLine = (n, of) => `${n}<span class="of">/${of}</span>`;
    /* AISLES puts the functional forty into the aisles, so a popular
       denominator would read "169/240" and mean nothing. In that view the
       two sides are measured against the whole House. */
    const sideOf = chamberFold
      ? Engine.popularTotal(st) + Engine.functionalTotal(st)
      : Engine.popularTotal(st);
    /* ONE LINE. It was two: five labelled spans at full width wrapped, and
       the second line was the Speaker and their seat — a standing fact that
       does not change and did not earn a row of a column this tight. The
       words are abbreviated because they are annotated, and the seat moves
       into the tip with them. */
    $("#chamber-tally").innerHTML =
      `<span class="ct gov" data-tip="government">Gov ${seatLine(govN, sideOf)}</span>` +
      `<span class="ct opp" data-tip="opposition">Opp ${seatLine(oppN, sideOf)}</span>` +
      (crossN ? `<span class="ct cross" data-tip="functional">Func ${crossN}</span>` : "") +
      `<span class="ct" data-tip="majority">Maj ${Engine.majority(st)}</span>` +
      (chairName ? `<span class="ct" data-tip="speaker">Chair ` +
                   `${chairParty ? mark(chairParty) : ""}${esc(bare(chairName))}</span>` : "");

    /* The legend names the two kinds of support — a partner in government and
       a party that only sustains it — while the diagram keeps both on the
       government side of the floor, which is where confidence and supply sits. */
    drawChamberForecast();
    drawChamberWhip();
    drawBenchTable();
    $("#chamber-legend").innerHTML = C.parties.map(p => {
      const tag = st.coalition.includes(p.id) ? ' <i class="ingov">GOV</i>'
                : st.confidenceSupply.includes(p.id) ? ' <i class="ingov">C&amp;S</i>' : "";
      /* The name carries the card too, because a reader reaches for the
         name and not for a four-pixel square. */
      return `<span>${mark(p.id)}${pname(p.id, p.name)} ` +
             `${Engine.partyTotal(st, p.id)}${tag}</span>`;
    }).join("");
  }

  /* ---------- orbit ---------- */
  /* Three levels - band, station, constituency - and three panels, one per
     level. The schematic places a station in its band; the list names every
     station at once and never scrolls; the seat table gives the selected
     station's constituencies with the member who sits for each. An earlier
     pass folded the third level into the second as a dropdown, which meant
     the panel headed "Stations" was sometimes a list of constituencies and
     the one thing that never varies - the roster of thirty-four - moved
     every time you clicked. */
  function drawOrbit() {
    /* No hardcoded content id here: the engine names no station and neither
       should the renderer. */
    const selId = Focus.selected("orbit-table");
    $("#orbit-chart").innerHTML = OrbitChart.render(st, C, selId);
    $("#orbit-key").innerHTML = OrbitChart.key();
    /* The schematic's chips select a station without stealing focus: the
       player clicked a chip, not a row, and dragging their place into a
       table they were not looking at is not help. */
    $("#orbit-chart").querySelectorAll("[data-station]").forEach(n =>
      n.addEventListener("click", () => Focus.set("orbit-table", n.dataset.station)));

    const seats = C.stations.reduce((n, s0) => n + s0.seats, 0);
    $("#orbit-count").textContent = `${C.stations.length} \u00b7 ${seats} seats`;

    $("#orbit-table").innerHTML =
      "<thead><tr><th>Station</th><th class='n'>Seats</th></tr></thead><tbody>" +
      C.stations.map(s0 => {
        const s = st.stations[s0.id];
        return `<tr data-station="${s.id}"${s.id === selId ? ' class="sel"' : ""}` +
          ` style="cursor:pointer">` +
          `<td><b>${esc(s.name)}</b><i class="sub">${esc(s.band)}</i></td>` +
          `<td class="n">${s.seats}</td></tr>`;
      }).join("") + "</tbody>";
    $("#orbit-table").querySelectorAll("tr[data-station]").forEach(tr =>
      tr.addEventListener("click", () => Focus.activate("orbit-table", tr.dataset.station)));

    drawStation(selId);
    drawSeats(selId);
  }

  /* The seat list's activate. A player action: it may make a sound and write
      the status line. Clicking the open seat again closes its detail row. */
  function pickConstituency(id) {
    consOpen = (consOpen === id) ? null : id;
    drawSeats(Focus.selected("orbit-table"));
    const k = C.constituencyById[id];
    if (k) setStatus(k.name + " \u00b7 " + k.band + " band \u00b7 " +
                     k.electorate.toLocaleString() + " electors", "transient");
  }

  /* The functional tier's activate, the same shape: open the row, or close
     it if it is the one already open. */
  function pickFunctional(id) {
    funcOpen = (funcOpen === id) ? null : id;
    drawFunctional();
    const f = (C.functional || []).find(x => x.id === id);
    if (f) setStatus(f.name + " \u00b7 " + f.seats + (f.seats === 1 ? " seat" : " seats") +
                     " \u00b7 " + f.electorate.toLocaleString() + " electors", "transient");
  }


  /* The orbit region's activate. A player action, not a redraw: it may
     make a sound and it may write the status line. drawOrbit(), which it
     calls, may do neither. */
  function pickStation(id) {
    drawOrbit();
    const s = st.stations[id];
    if (s) setStatus(s.name + " \u00b7 " + s.band + " band \u00b7 " + s.seats +
                     (s.seats === 1 ? " seat" : " seats"), "transient");
  }

  /* population-weighted mean of a station's constituency ratios */
  function stationRatio(sid) {
    const ap = Engine.apportionment(C);
    const mine = (C.constituencies || []).filter(k => k.station === sid);
    if (!mine.length) return 1;
    const seats = mine.reduce((n, k) => n + k.magnitude, 0);
    return mine.reduce((n, k) => n + ap[k.id] * k.magnitude, 0) / seats;
  }

  /* The station dossier. The seats live in their own panel, which is also
     what stops this one changing height with the seat count. */
  function drawStation(id) {
    const s = st.stations[id];
    const d = $("#station-detail");
    $("#station-hdr").textContent = s.name;
    /* innerHTML rather than textContent so the form and the band can each
       carry their own explanation; both are encoded in the schematic next
       door and neither is obvious from the word. */
    $("#station-sub").innerHTML =
      esc(s.type === "bundled" ? `bundled, ${s.settlements} settlements` : s.type) +
      ` \u00b7 <span data-tip="form">${esc(s.form)}</span>` +
      ` \u00b7 <span data-tip="band">${esc(s.band)} band</span>`;
    const r = stationRatio(s.id);
    /* A stat strip rather than eight rows of label over value. The same
       figures, a quarter of the height, and the ones that carry an argument
       (closure, apportionment) get the emphasis. */
    d.innerHTML =
      (s.description ? `<div class="rulehead">Description</div>` +
        `<div class="note">${esc(s.description)}</div>` : "") +
      `<div class="ostats">
        <span><b>${s.population.toLocaleString()}</b><i>population</i></span>
        <span><b>${s.seats}</b><i>seats</i></span>
        <span data-tip="closure"><b>${s.closure.toFixed(2)}</b><i>closure</i></span>
        <span><b>${r.toFixed(2)}</b><i>${r > 1.15 ? "over-represented" :
            r < 0.85 ? "under-represented" : "near parity"}</i></span>
        <span><b>${s.suspended.toLocaleString()}</b><i>suspended, non-voting</i></span>
        <span><b>${(s.attested * 100).toFixed(1)}%</b><i>attested</i></span>
      </div>
      ${s.composition ? `<div class="compbar">${["biological","emulation","uplift","synthetic"].map(k =>
        s.composition[k] ? `<i class="c-${k}" style="width:${s.composition[k]*100}%"` +
          ` data-tip-title="${esc(k.charAt(0).toUpperCase() + k.slice(1))}"` +
          ` data-tip-body="${(s.composition[k]*100).toFixed(0)}% of this station's population."></i>` : ""
      ).join("")}</div>
      <div class="note">biological ${(s.composition.biological*100).toFixed(0)}% &middot;
        emulation ${(s.composition.emulation*100).toFixed(0)}% &middot;
        uplift ${(s.composition.uplift*100).toFixed(0)}% &middot;
        synthetic ${(s.composition.synthetic*100).toFixed(0)}%</div>` : ""}
      <div class="rulehead">Material interest</div><div class="note">${esc(s.material_interest.join(" \u00b7 "))}</div>
      ${(() => { const g = Engine.stationGovernment(st, C, s.id);
        return g ? `<div class="rulehead">Government <em>${esc(g.who)}</em></div>` +
          `<div class="note">${esc(g.line)}</div>` : ""; })()}
      <div class="rulehead">Dependency</div><div class="note">${esc(s.dependency)}</div>
      <div class="rulehead">Grievance</div><div class="note">${esc(s.grievance)}</div>`;
  }

  /* Every constituency a station returns, with the member who sits for it
     and who holds it NOW.

     Holders come from st.roll, not from the authored `held` in content.
     Content is the state of the map at the opening of play; the roll is
     what by-elections, floor-crossings and the general election have made
     of it since, and it is the only thing the chamber arithmetic reads.
     Showing the authored value would quietly contradict the chamber the
     moment a member crossed the floor.

     The member comes from the roster where a roster character sits for the
     seat, and otherwise from the seat's own `member`. A backbencher's name
     is not a character: it is the difference between "Coldwater One, CU"
     and somebody losing their job.

     A vacant seat is shown as vacant rather than omitted. The chamber stays
     280 and the majority stays 141, so an empty seat is a vote the
     government does not have, and the map should say so. */
  function drawSeats(sid) {
    const s = st.stations[sid];
    const mine = (C.constituencies || []).filter(k => k.station === sid);
    $("#cons-hdr").textContent = s.name;
    $("#cons-sub").textContent = mine.length
      ? `${mine.length} ${mine.length === 1 ? "seat" : "seats"} \u00b7 first past the post`
      : "no district seat";
    if (!mine.length) {
      $("#cons-table").innerHTML = `<tbody><tr><td class="note">` +
        `No constituency returns this station directly. Its electors vote in ` +
        `the list tier, and in the functional tier where they hold a licence.` +
        `</td></tr></tbody>`;
      return;
    }
    const ap = Engine.apportionment(C);
    /* The highlighted seat, validated against this station: a key left over
       from another station falls back to the first seat here. */
    const stored = Focus.selected("cons-table");
    const selCons = mine.some(k => k.id === stored) ? stored : mine[0].id;
    Focus.seed("cons-table", selCons);
    /* A NEW STATION OPENS CLOSED. This used to expand the selected seat
       automatically, which meant every visit to the orbit tab put a
       dossier on screen for a constituency the player had not chosen —
       the list is the subject and the dossier is what you ask for. The
       selection still moves with the station; only the expansion waits. */
    if (consOpenAt !== sid) { consOpenAt = sid; consOpen = null; }
    const openId = mine.some(k => k.id === consOpen) ? consOpen : null;
    $("#cons-table").innerHTML =
      "<thead><tr><th>Constituency and member</th><th class='n'>Electors</th>" +
      "<th class='n' data-tip='ratio'>Ratio</th><th class='held' data-tip='held'>Held</th>" +
      "</tr></thead><tbody>" +
      mine.map(k => {
        const r = Engine.seatsFor(st, k.id);
        const held = Object.keys(r.held).sort((a, b) => r.held[b] - r.held[a]);
        const ch = (C.characters || []).find(c => c.seat === k.name);
        /* The Chair first — it is the seat's office — then the member's. */
        const off = !r.vacant && ch && OFFICE[ch.office];
        const badge = k.speaker
          ? ` <i class="chair">Speaker</i>`
          : off ? ` <i class="office o-${off[1]}">${off[0]}</i>` : "";
        /* A station returning one constituency returns the whole station, so
           the seat is at-large. The tag says so without the name doing it. */
        const whole = k.at_large ? ` <i class="atlarge">At-large</i>` : "";
        const nv = k.nonVoting ? ` <i class="nonvote">Non-voting</i>` : "";
        const open = k.id === openId;
        const row = `<tr data-cons="${k.id}"${k.id === selCons ? ' class="sel"' : ""}` +
          ` style="cursor:pointer"><td><i class="caret${open ? " open" : ""}"></i>` +
          `<b>${esc(k.name)}</b>${badge}${whole}${nv}` +
          `<i class="mp">${r.vacant
            ? `<span class="hn vac">vacant</span>`
            : esc(ch ? bare(ch.name) : (k.member ? bare(k.member) : "\u2014"))}` +
            `${!r.vacant && ch && ch.role ? ` <span class="det">\u00b7 ${esc(ch.role)}</span>` : ""}</i></td>` +
          `<td class="n">${k.electorate.toLocaleString()}</td>` +
          `<td class="n">${ap[k.id] != null ? ap[k.id].toFixed(2) : "&mdash;"}</td>` +
          `<td class="held">${held.map(pid => `${sw(pc(pid))}<i class="hs">${esc(ps(pid))}</i>`).join(" ")}</td></tr>`;
        return row + (open
          ? `<tr class="consdet"><td colspan="4">${constituencyDetail(k)}</td></tr>` : "");
      }).join("") + "</tbody>";
    $("#cons-table").querySelectorAll("tr[data-cons]").forEach(tr =>
      tr.addEventListener("click", () => Focus.activate("cons-table", tr.dataset.cons)));
  }

  /* The detail that used to sit in its own panel, now expanded under the row
     it belongs to. It reads the same state the row does. */
  function constituencyDetail(k) {
    const r = Engine.seatsFor(st, k.id);
    const held = Object.keys(r.held).sort((a, b) => r.held[b] - r.held[a]);
    const ch = (C.characters || []).find(c => c.seat === k.name);
    const ap = Engine.apportionment(C);
    return `<div class="ostats">
        <span><b>${k.electorate.toLocaleString()}</b><i>electors</i></span>
        <span><b>${ap[k.id] != null ? ap[k.id].toFixed(2) : "&mdash;"}</b><i>apportionment ratio</i></span>
        <span><b>${k.nonVoting ? "0" : k.magnitude}</b><i>voting ${k.magnitude === 1 ? "seat" : "seats"}</i></span>
      </div>` +
      (k.nonVoting ? `<div class="rulehead">Status</div>` +
        `<div class="note">A territory delegate: may speak, may not vote. The seat is outside the district tier, the chamber arithmetic and every division.</div>` : "") +
      (k.description ? `<div class="rulehead">Description</div>` +
        `<div class="note">${esc(k.description)}</div>` : "") +
      (k.tendency ? `<div class="rulehead">Voting and tendencies</div>` +
        `<div class="note">${esc(k.tendency)}</div>` : "") +
      `<div class="rulehead">Member</div>
      <div class="note">${r.vacant ? `<span class="hn vac">vacant</span>`
        : esc(bare(ch ? ch.name : (k.member || "\u2014"))) +
          (ch && ch.role ? ` \u00b7 ${esc(ch.role)}` : "")}</div>
      <div class="rulehead">Held by</div>
      <div class="note">${held.length
        ? held.map(pid => `${logoMark(pid, "lg")}${esc(pn(pid))} ${r.held[pid]}`).join(", ")
        : "&mdash;"}</div>
      <div class="rulehead">Material interest</div>
      <div class="note">${(k.material_interest || []).map(x => esc(x)).join(" \u00b7 ")}</div>`;
  }

  /* The functional tier in full. Every seat here is held by a named party,
     so unlike the district list this one is complete. */
  function drawFunctional() {
    const F = C.functional || [];
    if (!F.length || !$("#func-table")) return;
    const FR = { licensure:"licence", corporate:"companies", union_bloc:"union bloc", residual:"residual" };
    /* Holdings come from the functional roll, never the authored `held`: the
       roll is what instruments and elections move, and it is the only thing the
       division arithmetic reads. The authored value is the fallback. */
    const heldOf = f => (st.functional && st.functional[f.id] ? st.functional[f.id].held : f.held) || {};
    /* The members of a functional constituency. Districts name everyone with a
       `member` string; here it is `members`, and a character who sits for the
       constituency replaces the member of the same name, so the styled name and
       the office come through. */
    const membersOf = f => {
      const chars = (C.characters || []).filter(c => c.functional === f.id);
      return (f.members || []).map(m => {
        const ch = chars.find(c => c.name.replace(/ MP$/, "") === m.name);
        return { r: m.ref || null, n: bare(ch ? ch.name : m.name), p: m.party,
                 o: officeText(ch) };
      });
    };
    /* The full office, not the badge. The member table has room for it now
       that the ref and party columns are tight, so a minister is spelled out
       and a backbencher shows nothing. */
    const officeText = ch => {
      if (!ch) return null;
      if (ch.id === st.pm) return "Prime Minister";
      const post = (C.cabinet || []).find(p => p.holder === ch.id);
      if (post) return post.title || post.name;
      return ch.role || (ch.office && OFFICE[ch.office] ? OFFICE[ch.office][0] : null);
    };
    /* WHAT THE GOVERNMENT HAS DONE TO THIS ELECTORATE, and what it may
       still do. Reads the engine for both the count and the refusal, so the
       reason a button is disabled is the engine's sentence. */
    function boardControl(f) {
      if (!Engine.canPackBoard) return "";
      const moved = Engine.boardsMoved(st, f.id);
      const gate = Engine.canPackBoard(st, C, f.id);
      const done = moved
        ? `<div class="note boardnote"><b>${moved}</b> appointment${moved === 1 ? "" : "s"} ` +
          `already made to this board by this government. It is on the record.</div>`
        : "";
      return done +
        `<div class="boardbtns"><button class="btn tiny board" data-board="${esc(f.id)}"` +
        (gate.ok ? "" : " disabled") +
        priceTip("Appoint to the " + (f.gatekeeper.board || "board"),
          { slots: 1, note: "One seat on this roll changes hands. Costs legitimacy, " +
            "and every appointment is counted for as long as the government lasts." },
          gate.ok ? null : gate.reason) +
        `>Appoint to the board</button></div>`;
    }

    /* THE DETAIL, under the row it belongs to. Everything the hover card used
       to carry, plus the two things a card could not: the roll spelled out,
       and the members. It reads the same live roll the row does. */
    const detailHTML = f => {
      const h = heldOf(f);
      const held = Object.keys(h).sort((a, b) => h[b] - h[a]);
      const mem = membersOf(f);
      const roll = (f.electors || []).map(e =>
        esc(e.body) + " " + e.count.toLocaleString()).join(" \u00b7 ");
      return `<div class="ostats">
          <span><b>${f.seats}</b><i>${f.seats === 1 ? "seat" : "seats"}</i></span>
          <span><b>${f.electorate.toLocaleString()}</b><i>electors</i></span>
          <span><b>${esc(FR[f.franchise] || f.franchise)}</b><i>franchise</i></span>
        </div>` +
        (f.description ? `<div class="rulehead">Description</div>
          <div class="note">${esc(f.description)}</div>` : "") +
        (roll ? `<div class="rulehead">On the roll</div><div class="note">${roll}</div>` : "") +
        (f.note_franchise || f.note ? `<div class="rulehead">How it is won</div>
          <div class="note">${esc(f.note_franchise || f.note)}</div>` : "") +
        (f.gatekeeper ? `<div class="rulehead">Gatekeeper</div>
          <div class="note">${esc(f.gatekeeper.board || "none")}` +
          (f.gatekeeper.appointed_by && f.gatekeeper.appointed_by !== "none"
            ? `, appointed by the ${esc(f.gatekeeper.appointed_by)}` : "") + `.</div>` +
          /* THE APPOINTMENT ITSELF (§4.6.4). The panel has named the board
             and who appoints it since it was written; the government could
             not do the thing the sentence says it does. Every appointment
             already made is printed beside the control, because this is the
             one power whose whole weight is that it is remembered. */
          boardControl(f) : "") +
        (f.excluded ? `<div class="rulehead">Excluded from the roll</div>
          <div class="note">${esc(f.excluded.body)}, ${f.excluded.count.toLocaleString()}. ` +
          esc(f.excluded.note || "") + `</div>` : "") +
        (mem.length ? `<div class="rulehead">Members</div>
          <table class="fmem"><tbody>${mem.map(m =>
            `<tr><td class="r">${esc(m.r || "")}</td>` +
            `<td>${m.p ? `${mark(m.p)}<i class="hs">${esc(ps(m.p))}</i>` : ""}</td>` +
            `<td>${esc(m.n)}${m.o ? ` <i class="office">${esc(m.o)}</i>` : ""}</td></tr>`).join("")}` +
          `</tbody></table>` : "") +
        `<div class="rulehead">Held by</div>
        <div class="note">${held.length
          ? held.map(pid => `${logoMark(pid, "lg")}${esc(pn(pid))} ${h[pid]}`).join(", ")
          : "&mdash;"}</div>` +
        ((f.interest || []).length ? `<div class="rulehead">Material interest</div>
          <div class="note">${f.interest.map(esc).join(" \u00b7 ")}</div>` : "");
    };
    const open = funcOpen && F.some(f => f.id === funcOpen) ? funcOpen : null;
    $("#func-table").innerHTML =
      "<thead><tr><th>Constituency</th><th class='n' data-tip='functional'>Seats</th>" +
      "<th data-tip='held'>Held by</th></tr></thead><tbody>" +
      F.map(f => {
        const h = heldOf(f);
        const held = Object.keys(h).sort((a, b) => h[b] - h[a]);
        const isOpen = f.id === open;
        const row = `<tr data-func="${f.id}"${isOpen ? ' class="sel"' : ""} style="cursor:pointer">` +
          `<td><i class="caret${isOpen ? " open" : ""}"></i><b>${esc(f.name)}</b></td>` +
          `<td class="n">${f.seats}</td><td class="hcell">${held.length
            /* THE ACRONYM WITH THE COUNT. Three letters and a number is what a
               whip actually writes down, and this column is wide enough for
               it — the marks alone were a colour the player had to decode. */
            ? held.map(pid => `${mark(pid)}<i class="hs">${esc(ps(pid))}</i>` +
                ` <span class="hn">${h[pid]}</span>`).join("  ")
            : "&mdash;"}</td></tr>`;
        return row + (isOpen
          ? `<tr class="funcdet"><td colspan="3">${detailHTML(f)}</td></tr>` : "");
      }).join("") + "</tbody>";
    $("#func-table").querySelectorAll("tr[data-func]").forEach(tr =>
      tr.addEventListener("click", () => Focus.activate("func-table", tr.dataset.func)));

    /* THE APPOINTMENT. stopPropagation, because the button lives inside the
       expanded row and the row's own click would fold it shut under the
       player's hand. */
    $("#func-table").querySelectorAll("[data-board]").forEach(btn =>
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const fid = btn.dataset.board;
        const f = (C.functional || []).find(x => x.id === fid) || {};
        Dialog.confirm(
          "Appoint to the " + ((f.gatekeeper && f.gatekeeper.board) || "board") +
          "? One seat on the " + (f.name || fid) + " roll will change hands. " +
          "It costs a slot and some legitimacy, and every appointment this " +
          "government makes is counted for as long as it lasts.",
          { title: "Appointments to a licensing board", ok: "Appoint" },
          (yes) => {
            if (!yes) return;
            const r = acted(() => Engine.packBoard(st, C, fid));
            cue("stamp");
            setStatus(r && r.ok
              ? "One seat on the " + (f.name || fid) + " roll changes hands"
              : "The appointment was refused: " + ((r && r.reason) || "no reason given"),
              "transient");
            drawAll(); afterAction();
          });
      }));

    const seats = F.reduce((n, f) => n + f.seats, 0);
    const licensed = F.filter(f => f.franchise !== "residual")
                      .reduce((n, f) => n + f.electorate, 0);
    const resid = F.filter(f => f.franchise === "residual")
                   .reduce((n, f) => n + f.electorate, 0);
    /* The two words the table used to anchor on every row now anchor
       once, here, where the sentence is actually about them. IT STANDS DOWN
       WHEN A ROW IS OPEN: the detail is longer than the note and the note is
       not what the reader is on, so leaving it there pushed the thing they
       opened off the bottom of the column. Hidden, not removed — it is also
       where `electors` and `franchise` are anchored, and a tip nobody carries
       is a tip nobody can reach. */
    const fn = $("#func-note");
    if (fn) {
      fn.innerHTML =
        `${seats} seats. <b>${licensed.toLocaleString()}</b> <span data-tip="electors">electors</span> ` +
        `hold a functional <span data-tip="franchise">franchise</span> across ` +
        `${F.length - 1} licensed constituencies; ` +
        `<b>${resid.toLocaleString()}</b> sit in the residual constituency and return ` +
        `${F.filter(f => f.franchise === "residual").reduce((n, f) => n + f.seats, 0)}. ` +
        `A measure touching life-support integrity or the Charter must carry here separately.`;
      fn.hidden = !!open;
      if (fn.parentNode) fn.parentNode.hidden = !!open;   /* the pbody holding it */
    }
  }

  /* ---------- log ---------- */
  function drawLog() {
    $("#log-body").innerHTML = st.log.length
      ? "<tbody>" + st.log.slice(0, 40).map(l => `<tr><td class="n">${l.sitting}</td><td>${l.text}</td></tr>`).join("") + "</tbody>"
      : "<tbody><tr><td>No decisions recorded.</td></tr></tbody>";
  }

  /* ---------- the Sandbox tab (T26) ----------
     Shown only under the Sandbox government (js/shell.js sets
     `st.flags.sandbox`) or once the test console has opened
     (`test_mode`), or on the opening solvency only the sandbox has. The
     controls are `CONTENT.sandbox`, the same list the queued test_console
     event presses, so a control added to content appears here with no js
     change. Nothing on this screen carries a `data-tip`: it lives in a
     hidden .screen on every other government, and an annotated node in a
     hidden screen is exactly the leak tools/uxtest.js checks for. */
  function inSandbox() {
    if (st.flags && (st.flags.sandbox || st.flags.test_mode)) return true;
    return !!(st.scalars && st.scalars.solvency > 900000);
  }

  function drawSandbox() {
    const tab = document.getElementById("tab-sbx");
    const body = $("#sbx-body");
    const on = inSandbox();
    if (tab) tab.hidden = !on;
    if (!body) return;
    if (!on) { body.innerHTML = ""; return; }
    const controls = (C.sandbox || []).filter(c => !c.close);
    const meters = ["party_loyalty", "public_standing", "consumables",
                    "thermal_margin", "solvency", "legitimacy", "friction"];
    const flags = Object.keys(st.flags || {}).filter(f => st.flags[f]).sort();
    let h = `<div class="note">These controls set state directly. They are not a ` +
      `scene and they never appear outside the Sandbox government. Each button ` +
      `applies at once, and every tab redraws after it.</div>`;
    h += `<div class="sbxbtns">` + controls.map(c =>
      `<button class="btn sbxbtn" data-sbx="${esc(c.id)}"><b>${esc(c.label)}</b>` +
      (c.note ? `<i>${esc(c.note)}</i>` : "") + `</button>`).join("") + `</div>`;
    h += `<h3>Indicators</h3><div class="kv">` + meters.map(k =>
      `<b>${esc(k.replace(/_/g, " "))}</b><span>${esc(String(st.scalars[k]))}</span>`).join("") + `</div>`;
    h += `<h3>Flags set</h3>` + (flags.length
      ? `<div class="sbxflags">` + flags.map(f => `<span class="flag">${esc(f)}</span>`).join("") + `</div>`
      : `<div class="note">None.</div>`);
    h += `<div class="note">Chapter ${st.chapter} \u00b7 sitting ${st.sitting} \u00b7 ` +
      `${st.slots.total - st.slots.used} of ${st.slots.total} order-paper slots left.</div>`;
    body.innerHTML = h;
    body.querySelectorAll("[data-sbx]").forEach(b =>
      b.addEventListener("click", () => {
        const c = (C.sandbox || []).find(x => x.id === b.dataset.sbx);
        if (!c) return;
        acted(() => Engine.apply(st, C, c.effects));
        cue("stamp");
        setStatus("Sandbox: " + c.label, "transient");
        drawAll(); saved(); afterAction();
      }));
  }

  /* setStatus is exported so that Shell and, later, the induction pack can
     write the line without reaching into #sb-msg themselves. */
  /* redraw is exported for the checks only. It is drawAll under another
     name, and it makes no sound — which is itself asserted, so exporting
     it cannot become a way to smuggle a cue into a renderer. */
  return { boot, openTab, state: () => st, annotate, setStatus, redraw: drawAll,
           __test: { cabinetView, structure, reportMoves, rollChips, rollPlan } };
})();

