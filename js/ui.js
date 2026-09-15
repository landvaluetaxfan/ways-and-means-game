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
  /* The functional tier opens in place the same way a seat does. One id,
     because only one row can be open and the alternative is a column of
     detail rows with no relationship to what is above them. */
  let funcOpen = null;

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
  const mark = id => {
    const p = C && C.partyById && C.partyById[id];
    if (!p) return sw(pc(id));
    return `<i class="swatch" style="background:${pc(id)}"` +
      ` data-tip-title="${esc(p.name)}" data-tip-body="${esc(partyLine(id))}"></i>`;
  };
  function partyLine(id) {
    const seats = Engine.partyTotal(st, id);
    const loy = (st.parties[id] || {}).loyalty;
    const role = id === st.playerParty ? "The Prime Minister's party."
      : st.coalition.indexOf(id) >= 0 ? "In the coalition."
      : st.confidenceSupply.indexOf(id) >= 0 ? "Confidence and supply."
      : "Opposition.";
    return role + " " + seats + " seat" + (seats === 1 ? "" : "s") +
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
  function decorateScrollers() {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    let bevel = false;
    try { bevel = !!(window.CSS && CSS.supports && CSS.supports("selector(::-webkit-scrollbar)")); }
    catch (e) { bevel = false; }
    if (bevel) return;
    /* A MARKER CLASS, NOT A LIST OF PANELS.

       This named two orbit panels by selector, so every scrolling body
       added afterwards silently got the OS bar while orbit had a drawn
       one — the hardcoded-list fault this repo has been bitten by twice
       already. Anything that scrolls inside the terminal's chrome now
       says `.scrolls` in the markup and gets the drawn bar for free. */
    document.querySelectorAll(".scrolls").forEach(box => {
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
    lastSession = null; fallen = false; lastSigBand = null;
    if (wired) { drawAll(); reveal(); return; }   /* Shell re-boots on every load */
    wired = true;
    document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(o => o.setAttribute("aria-selected", "false"));
      t.setAttribute("aria-selected", "true");
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
      $("#s-" + t.dataset.t).classList.add("on");
      $("#viewport").scrollTop = 0;
      screen = t.dataset.t;
      setStatus(ambient(), "ambient");
    }));

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
      const hit = Concordance.search($("#cx-q").value);
      if (hit) goCx(hit, true); else $("#cx-q").select();
    };
    $("#cx-goto").addEventListener("click", goSearch);
    $("#cx-q").addEventListener("keydown", e => { if (e.key === "Enter") goSearch(); });
    /* Capture, because the article this is on is about to be replaced. */
    document.getElementById("cx-body").addEventListener("click", e => {
      const g = e.target.closest("[data-go]");
      if (g) goCx(g.dataset.go, true);
    }, true);
    $("#cx-back").addEventListener("click", () => goCx(Concordance.back(), false));
    document.getElementById("cx-nav").addEventListener("click", e => {
      const g = e.target.closest("[data-go]");
      if (g) goCx(g.dataset.go, true);
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
      drawTitle(); drawPrices(); drawGovernment(); drawSitting(); drawChamber(); drawFunctional(); drawOrbit(); drawLog(); drawStatus();
      if (typeof Concordance !== "undefined") Concordance.render(st, C, cxCurrent, false);
      if (typeof Papers !== "undefined") Papers.render(st, C);
      /* the annotated nodes are all new, so explain mode has to be put
         back onto them */
      if (typeof Tips !== "undefined") Tips.remark();
    });
  }

  /* ---------- title / status ---------- */
  function drawTitle() {
    $("#tb-sys").textContent = `SESS ${st.session} / SITTING ${String(st.sitting).padStart(3, "0")} / ${st.date}`;
  }
  function drawStatus() {
    const conf = Engine.confidence(st), maj = Engine.majority(st);
    $("#sb-conf").textContent = `CONFIDENCE ${conf}/${Engine.chamberTotal(st)}`;
    $("#sb-margin").textContent = `MARGIN ${conf - maj >= 0 ? "+" : ""}${conf - maj}`;
    $("#sb-thermal").textContent = `THERMAL ${st.scalars.thermal_margin}%`;
    $("#sb-chapter").textContent = `CHAPTER ${st.chapter}`;
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
    log:  "Every decision this government has taken"
  };

  function ambient() {
    const note = SCREEN_NOTE[screen] || "";
    if (screen !== "gov" && screen !== "cham") return note;
    const id = Focus.selected("cham-bills");
    const b = (C.bills || []).find(x => x.id === id);
    if (!b) return note;
    return b.title + " \u2014 " + (b.dualMajority ? "dual test applies" : "simple majority");
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
  let fallen = false, lastSession = null, lastSigBand = null;
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

  function drawPrices() {
    const box = $("#gov-prices"); if (!box) return;
    box.innerHTML = PRICE_META.map(m => {
      const v = st.prices[m.k], h = st.priceHistory[m.k] || [v];
      const base = h[0], chg = v - base;
      const cls = chg > 2 ? "up" : chg < -2 ? "down" : "";
      return `<div class="prow">
        <div class="plab" data-tip="scarcity">${m.label}<em>${m.unit}</em></div>
        ${spark(h.slice(-40), 76, 18)}
        <div class="pval ${cls}">${v.toFixed(0)}<span>${chg >= 0 ? "+" : ""}${chg.toFixed(0)}</span></div>
      </div>`;
    }).join("") +
    `<div class="note" style="margin-top:4px">Index, 100 at the opening of the series. ` +
    `Every one of these is set by legislation rather than by a market.</div>`;
  }

  /* ---------- government ---------- */
  function drawGovernment() {
    drawInitiatives();
    const conf = Engine.confidence(st), maj = Engine.majority(st);
    $("#gov-coalition-hdr").textContent = `${conf}/${Engine.chamberTotal(st)}`;

    let h = "<thead><tr><th>Party</th><th class='n' data-tip='seats'>Seats</th>" +
      "<th class='n' data-tip='loyalty'>Loy</th></tr></thead><tbody>";
    /* Every coalition partner is governing, not just the Prime Minister's
       party — the player's own row is still the one with no loyalty figure. */
    st.coalition.forEach(id => {
      h += `<tr><td>${mark(id)}${pn(id)} <span class="flag" data-tip="gov">GOV</span></td>` +
           `<td class="n">${Engine.partyTotal(st, id)}</td><td class="n">${id === st.playerParty ? "&mdash;" : st.parties[id].loyalty}</td></tr>`;
    });
    st.confidenceSupply.forEach(id => {
      h += `<tr><td>${mark(id)}${pn(id)} <span class="flag" data-tip="cs">C&amp;S</span></td>` +
           `<td class="n">${Engine.partyTotal(st, id)}</td><td class="n">${st.parties[id].loyalty}</td></tr>`;
    });
    h += "</tbody>";
    $("#gov-coalition").innerHTML = h;
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

    let ch = "<thead><tr><th>Current</th><th class='n' data-tip='mps'>MPs</th>" +
      "<th class='n' data-tip='loyalty'>Loy</th></tr></thead><tbody>";
    C.currents.filter(c => c.party === st.playerParty).forEach(c => {
      const s = st.currents[c.id];
      ch += `<tr class="${s.loyalty < 20 ? "warn" : ""}"><td>${c.name}</td><td class="n">${s.members}</td><td class="n">${s.loyalty}</td></tr>`;
    });
    $("#gov-currents").innerHTML = ch + "</tbody>";



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
    const meters = [
      ["Party loyalty", "party_loyalty", 25], ["Public standing", "public_standing", 20],
      ["Consumables", "consumables", 25], ["Thermal margin", "thermal_margin", 12],
      ["Treasury", "treasury", 15]
    ];
    $("#gov-meters").innerHTML = meters.map(([lab, k, soft]) => {
      const v = st.scalars[k], f = fatal[k];
      const cls = (f != null && v <= f + 10) || v <= soft ? "warn" : v >= 65 ? "good" : "";
      const tick = f == null ? "" :
        `<span class="thr" style="left:${Math.max(0, f)}%"` +
        tipAttr(lab + " \u2014 the line",
          f <= 0 ? "At nought the stations go dark and the government falls. There is no undo."
                 : "At " + f + " or below the party removes you. There is no undo.") +
        `></span>`;
      return `<div class="meterrow"><label data-tip="${k}">${lab}</label>` +
        `<div class="meter ${cls}"><i style="width:${v}%"></i>${tick}</div>` +
        `<output>${v}</output></div>`;
    }).join("");

    /* the ledger: signed, permanent, and shown exactly */
    const partners = st.coalition.concat(st.confidenceSupply).filter(p => p !== st.playerParty);
    $("#gov-ledger").innerHTML =
      "<thead><tr><th>Partner</th><th class='n' data-tip='ledger'>Ledger</th>" +
      "<th class='n' data-tip='loyalty'>Loy</th></tr></thead><tbody>" +
      partners.map(id => {
        const c = st.capital[id] || 0;
        const cls = c > 0 ? "good" : c < 0 ? "bad" : "";
        return `<tr><td>${mark(id)}${pn(id)}</td>` +
          `<td class="n"><span class="flag ${cls}" data-tip="ledger">${c > 0 ? "+" : ""}${c}</span></td>` +
          `<td class="n">${st.parties[id].loyalty}</td></tr>`;
      }).join("") + "</tbody>";
    $("#gov-ledger-note").innerHTML =
      "Positive means they owe you. Negative means you owe them. Nothing here decays.";

    const left = st.slots.total - st.slots.used;
    $("#gov-slots").innerHTML =
      `<div class="slotbar">${Array.from({length: st.slots.total}, (_, i) =>
        `<i class="${i < st.slots.used ? "spent" : ""}"></i>`).join("")}</div>` +
      `<div class="note" style="margin-top:4px">${left} of ${st.slots.total} slots left this session. ` +
      `Giving a partner's bill time puts them in your debt. Giving your own advances nothing but your programme.</div>` +
      `<table><tbody>${C.bills.filter(b => !st.bills[b.id].dead).map(b =>
        `<tr><td>${b.owner ? mark(b.owner)
            : `<i class="swatch" style="background:var(--chrome-dk)" data-tip-title="No sponsor"` +
              ` data-tip-body="A measure the government did not bring forward."></i>`}${b.title.replace(/ Bill$/, "")}` +
        `${b.priority ? " <span class='flag' data-tip='priority'>PRIORITY</span>" : ""}</td>` +
        `<td class="n">${b.owner && b.owner !== st.playerParty ? "+" + (b.priority ? 3 : 2) : "&mdash;"}</td>` +
        `<td class="n"><button class="btn slotbtn" data-slot="${b.id}"${left ? "" : " disabled"}` +
          priceTip("Give time to " + b.title, { slots: 1,
            note: b.owner && b.owner !== st.playerParty
              ? "Moves it a stage and puts " + ps(b.owner) + " +" + (b.priority ? 3 : 2) +
                " in your debt."
              : "Moves it a stage. Your own bill buys you no debt." },
            left ? null : "no order-paper time left this session") + `>${grantLabel(b.id)}</button></td></tr>`
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
      ? owed.map(u => `<div class="dk owed${u.by - st.sitting <= 1 ? " late" : ""}">` +
          `<b>${esc(u.text)}</b><i>${u.by - st.sitting <= 0 ? "due this sitting"
            : "by sitting " + u.by}</i></div>`).join("")
      : `<div class="note">The government has given no undertakings.</div>`;

    $("#gov-slots").querySelectorAll(".slotbtn").forEach(btn =>
      btn.addEventListener("click", () => {
        const b = C.bills.find(x => x.id === btn.dataset.slot);
        acted(() => Engine.grantSlot(st, C, btn.dataset.slot));
        cue("stamp"); if (typeof Wait !== "undefined") Wait.brief(240);
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
      return `<tr data-si="${si.id}" class="${s.inForce ? "inforce" : ""}">
        <td>${si.title.replace(/ Order 2287$/, "")}<div class="note">${si.number} &middot; ${si.author.replace(/_/g,' ')}</div></td>
        <td class="n"><span class="flag ${cls}" data-tip="${s.inForce ? "prayer" : "instrument"}">${status}</span></td>
        <td class="n">${s.made ? "" :
          `<button class="btn sibtn" data-make="${si.id}"${chk.ok ? "" : " disabled"}` +
            priceTip("Make " + si.number,
                     { free: "Costs no order-paper time. That is the point of an order: " +
                             "it is in force at once, and prayable." },
                     chk.ok ? null : chk.reason) + `>Make</button>`}
          ${s.inForce && window > 0 ? `<button class="btn sibtn" data-pray="${si.id}">Pray</button>` : ""}</td>
      </tr>`;
    }).join("");
    $("#gov-si").querySelectorAll("[data-make]").forEach(b => b.addEventListener("click", () => {
      const si = (C.instruments || []).find(x => x.id === b.dataset.make);
      const r = acted(() => Engine.makeInstrument(st, C, b.dataset.make));
      if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); Dialog.alert(r.reason, { title: "Order refused" }); }
      else {
        cue("stamp"); score("order");
        if (typeof Wait !== "undefined") Wait.brief(320);
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
          cue(f.carries ? "aye" : "nay"); if (typeof Wait !== "undefined") Wait.brief(320);
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
      return `<tr class="${s.holder ? "" : "vacant"}">
        <td>${p.name}${p.senior ? " <span class='flag' data-tip='senior'>SENIOR</span>" : ""}</td>
        <td>${s.holder ? (ch ? bare(ch.name) : s.holder.replace(/_/g," "))
                       : "<span class='flag bad' data-tip='vacant'>VACANT</span>"}</td>
        <td class="n">${s.party ? mark(s.party) : ""}</td></tr>`;
    }).join("");

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
              if (typeof Wait !== "undefined") Wait.brief(420);
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

    $("#gov-wire").innerHTML = st.wire.length
      ? st.wire.slice(0, 8).map(w => `<div class="post"><div class="meta">SITTING ${w.sitting}</div><p>${w.text}</p></div>`).join("")
      : `<div class="pbody"><div class="note">No traffic this session.</div></div>`;
  }

  /* THE FOUR AXES, and the words for them. A bill and a party are both
     described on these, which is what makes "why" derivable rather than
     written: the reason a bench votes a way IS its position against the
     bill's, and the engine already computes that distance for the division. */
  const AXIS_NAME = { ownership:"ownership", personhood:"personhood",
                      sovereignty:"sovereignty", closure:"closure" };

  /* WHY A PARTY IS WHERE IT IS, read off the axes it and the bill share. A
     party with no settled position on an axis the bill moves says nothing
     about it, rather than being given a reason content did not. */
  function axisWhy(paxes, baxes) {
    const same = [], diff = [];
    Object.keys(AXIS_NAME).forEach(a => {
      if (!baxes || baxes[a] == null || !paxes || paxes[a] == null) return;
      (paxes[a] === baxes[a] ? same : diff).push(AXIS_NAME[a]);
    });
    if (!same.length && !diff.length) return "";
    if (diff.length && !same.length) return "against it on " + diff.join(" and ");
    if (same.length && !diff.length) return "with it on " + same.join(" and ");
    return "with it on " + same.join(" and ") + ", against on " + diff.join(" and ");
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

  /* WHICH WAY IT MOVES THE ARGUMENT. A bill is positioned on the same four
     axes as the parties are, and those axes are what the fight is about —
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
      const why = axisWhy(p.axes, b.axes) || (s == null ? "No stated position." : "");
      return `<tr><td>${mark(p.id)}${esc(ps(p.id))}</td>` +
        `<td class="st${s === "for" ? " yea" : s === "against" ? " nay" : ""}">` +
          `${read ? esc(read) : "inferred"}</td>` +
        `<td class="wy">${esc(why)}</td></tr>`;
    }).filter(Boolean).join("");
    if (!rows) return "";
    return `<div class="rulehead">Who is for it, and why</div>
      <table class="billwhy"><tbody>${rows}</tbody></table>`;
  }

  function drawBill(id) {
    const b = C.billById[id], bs = st.bills[id], dchk = Engine.canDivide(st, C, id);
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
       </div>`;

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
      const out = Engine.divide(st, C, id) || {};
      const r = out.result || {};
      countDivision(r.rows, out).then(() => {
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
  }

  /* THE BUTTON NAMES THE DESTINATION.

     It said "Grant", which is a verb with no object: a new player can
     press it repeatedly without ever learning that it moves a bill one
     stage along a ladder, that the ladder is what the division gate reads,
     or that a measure at drafting is two grants and a division away — a
     third of a session's time. A control that states its outcome cannot be
     spammed by accident, which is a cheaper fix than any animation. */
  function grantLabel(billId) {
    const bs = st.bills[billId];
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
  const houseVoted = id => !!(st.bills[id] && st.bills[id].lastDivision);
  const houseRead  = id => (st.bills[id] && st.bills[id].lastDivision) || forecast(id);

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
    const seatsOf = id => st.parties[id].seats;
    const cell = (aye, whipped) => whipped
      ? (aye - whipped) + `<span class="wh">+${whipped}</span>`
      : aye;
    let h = `<thead><tr><th>Party</th>` +
      `<th class="n" data-tip="district">D</th><th class="n" data-tip="list">L</th>` +
      `<th class="n" data-tip="functional">F</th><th class="n" data-tip="seats">Tot</th>` +
      (armed ? `<th class="n" data-tip="popular">Aye</th>` +
               `<th class="n" data-tip="functional">F&#8239;aye</th>` : "") +
      `</tr></thead><tbody>`;
    const govIds = st.coalition.concat(st.confidenceSupply);
    C.parties.forEach(p => {
      const sq = seatsOf(p.id), r = armed && d.rows.find(x => x.party === p.id);
      h += `<tr${govIds.includes(p.id) ? ' class="govrow"' : ""}>` +
        `<td>${mark(p.id)}${ps(p.id)}</td>` +
        `<td class="n">${sq.district}</td><td class="n">${sq.list}</td>` +
        `<td class="n">${sq.functional}</td>` +
        `<td class="n"><b>${Engine.partyTotal(st, p.id)}</b></td>` +
        (armed ? `<td class="n">${r ? cell(r.popularAye, r.popularWhipped) : "&mdash;"}</td>` +
                 `<td class="n">${r ? cell(r.functionalAye, r.functionalWhipped) : "&mdash;"}</td>` : "") +
        `</tr>`;
      if (armed && r && r.benches) h += r.benches.map(b =>
        `<tr class="bench"><td>${esc(b.name)}</td><td class="n"></td><td class="n"></td>` +
        `<td class="n"></td><td class="n">${b.popularSeats + b.functionalSeats}</td>` +
        `<td class="n">${b.popularAye == null ? "&mdash;" : b.popularAye}</td>` +
        `<td class="n">${b.functionalAye == null ? "&mdash;" : b.functionalAye}</td></tr>`).join("");
    });
    return h + `</tbody>`;
  }

  /* Click a block to commit up to it; click the last committed block again
     to release it. `after` is what to redraw, because the same control now
     lives on a tab that draws more than the bill detail. */
  function wireWhipbars(root, billId, after) {
    root.querySelectorAll(".whipbar").forEach(bar => {
      const wp = bar.dataset.wp, wt = bar.dataset.wt;
      [...bar.querySelectorAll("i")].forEach((cell, i) =>
        cell.addEventListener("click", () => {
          const cur = ((st.whips[billId] || {})[wp] || {})[wt] || 0;
          Engine.setWhip(st, C, billId, wp, wt, i + 1 === cur ? i : i + 1);
          after();
        }));
    });
    const clr = root.querySelector("#btn-clearwhip");
    if (clr) clr.addEventListener("click", () => { Engine.clearWhips(st, billId); after(); });
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
    const bs = st.bills[billId];
    const i = Engine.STAGE_ORDER.indexOf(bs.stage);
    const need = Engine.STAGE_ORDER.indexOf("second_reading");
    const away = i < 0 ? 1 : Math.max(0, need - i);
    const pips = Array.from({ length: cap }, (_, n) =>
      `<s class="${n < cap - left ? "spent" : ""}"></s>`).join("");
    return `<div class="note dayline">` +
      `<span class="pips slots" ` +
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
    if (st.bills[billId].dead) return "";
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
    if (st.bills[billId].dead) return "";
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
        : `<div class="note">Drag to commit members. Nothing is charged until you divide.</div>`);
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
    const paint = ayes => {
      if (!ayeEl) return;
      ayeEl.style.width = (ayes / P.total * 100) + "%";
      noeEl.style.width = (noes / P.total * 100) + "%";
      ayeN.textContent = ayes + " / " + P.need + " to carry";
      noeN.textContent = String(noes);
    };

    /* THE SHAPE OF A COUNT, NOT A METRONOME. The bell; the doors; a fast start
       as the lobbies fill and a slow finish as the ayes close on the number;
       the tellers conferring; then the declaration. */
    const steps = [
      { label: "The House divides", ms: 900, run: () => {
          chamberColour = "vote"; chamberGroup = true; chamberFold = !dual;
          chamberCount = { rows: order, ayes: 0 };
          drawChamber(); paint(0); cue("knell");
        },
        stall: { flag: "division_stalled",
                 label: "The Clerk is recounting the functional bench", ms: 1400 } },
      { label: "The doors are shut", ms: 620,
        run: () => setStatus("The doors are shut \u00b7 the lobbies are filling", "transient") }
    ];
    [0.42, 0.68, 0.85, 0.94, 0.985, 1].forEach((fr, i) => {
      const to = Math.round(P.aye * fr);
      steps.push({
        label: "The ayes are counted",
        ms: i < 3 ? 260 : 480 + i * 220,
        run: () => {
          chamberCount = { rows: order, ayes: to };
          drawChamber(); paint(to); cue("click");
        }
      });
    });
    notes.forEach(n => steps.push({ label: n, ms: 900,
      run: () => setStatus("A teller's note \u00b7 " + n, "transient") }));
    steps.push({ label: "The tellers confer", ms: 1100,
      run: () => setStatus("The tellers confer with the Clerk", "transient") });
    steps.push({
      label: r0.carries ? "The Ayes have it" : "The Noes have it",
      ms: 1800,
      run: () => {
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
              `<span class="ln" id="dv-noen">${noes}</span></div>` +
          `</div>` +
          (dual ? `<div class="note">The functional bench is counted separately: ` +
            `${F.aye} of ${F.total}, needing ${F.need}.</div>` : "") +
          `<div class="lverdict" id="dv-verdict"></div>`;
        ayeEl = el.querySelector("#dv-aye"); noeEl = el.querySelector("#dv-noe");
        ayeN = el.querySelector("#dv-ayen"); noeN = el.querySelector("#dv-noen");
        vEl = el.querySelector("#dv-verdict");
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
    return { owed: (st.undertakings || []).map(u => u.id + ":" + u.state).join("|"),
             owedOpen: Engine.outstanding(st).length,
             bills: bills, si: si, posts: posts, capital: capital, dated: dated,
             datedList: Engine.deadlines(st, C),
             slots: st.slots.total - st.slots.used };
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
  function acted(fn) {
    const before = structure(st);
    const out = fn();
    reportMoves(before, structure(st));
    return out;
  }

  function reportMoves(before, after) {
    if (typeof Motion === "undefined") return;
    const notes = [];

    if (after.owedOpen > before.owedOpen) {
      const u = Engine.outstanding(st)[Engine.outstanding(st).length - 1];
      notes.push({ tab: "gov", where: "Undertakings",
                   text: "An undertaking has been entered.",
                   detail: u ? u.text : null });
    } else if (after.owedOpen < before.owedOpen && before.owed !== after.owed) {
      notes.push({ tab: "gov", where: "Undertakings",
                   text: "An undertaking has been discharged." });
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
      notes.push({ tab: "pap", where: "Papers",
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

    /* Two is a report; five is a wall. Anything past the first two is
       on the screen it belongs to anyway. */
    notes.slice(0, 2).forEach(n => Motion.notify(n));
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

    return `<div class="ch${open ? " open" : ""}" data-ch="${i}">
      <button class="ch-head" data-expand="${i}" aria-expanded="${open}">
        <span class="ch-arrow">${open ? "▾" : "▸"}</span>
        <span class="ch-label">${esc(c.label)}</span>
        ${strip ? `<span class="ch-strip">${strip}</span>` : ""}
      </button>
      ${open ? `<div class="ch-body">
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
    return `<span class="pips slots">${out}</span>`;
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
            if (typeof Wait !== "undefined") Wait.brief(420);
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
  const TABNAME = { sit: "Sitting", gov: "Government", pap: "Papers", orb: "Orbit" };
  const WHENWORD = { overdue: "overdue", now: "today", soon: "soon" };

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
      return `<button class="tdo ${i.when}${i.required ? " req" : ""}" data-goto="${i.tab}">
        <b>${esc(i.text)}</b>
        <i>${esc(TABNAME[i.tab] || i.tab)}${away ? " \u00b7 " + esc(away) : ""}</i>
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
      b.addEventListener("click", () => {
        const tab = document.querySelector('.tab[data-t="' + b.dataset.goto + '"]');
        if (tab) tab.click();
      }));
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
      d.marks.forEach(m => cls.push("m-" + m.kind));
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
      const body = d.marks.length
        ? d.marks.map(m => MARKNAME[m.kind] + ": " + m.text).join(" \u2014 ")
        : (d.sitting != null ? "Nothing is down for this day."
                             : "The House sits " + SITDAYS + " days in seven.");
      /* data-tip draws the card for a pointer; aria-label is what a screen
         reader gets, and it has to carry the same sentence. Swapping the
         native title= for the project's own card quietly dropped the
         second one, which the checks caught. */
      const said = title + ", " + dayLabel(d.date) + ". " + body;
      cells += `<i class="${cls.join(" ")}" aria-label="${esc(said)}"` +
               ` data-tip-title="${esc(title)} \u00b7 ${esc(dayLabel(d.date))}"` +
               ` data-tip-body="${esc(body)}">` +
               `<b>${d.dom}</b>` +
               (d.sitting != null ? `<u>${d.sitting}</u>` : "") +
               (pips ? `<span class="pips">${pips}</span>` : "") + `</i>`;
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
      (next.length ? '<div class="calnext">' + next.map(m =>
        `<div class="cn ${m.kind}${m.away <= 2 ? " late" : ""}"><b>${esc(m.text)}</b>` +
        `<i>${m.away === 0 ? "today" : m.away === 1 ? "next sitting"
            : "in " + m.away + " sittings"} \u00b7 ${m.date}</i></div>`).join("") + "</div>"
       : "");
  }

  function drawCalendar() {
    const el = $("#sit-cal"); if (!el) return;
    el.innerHTML = calendarHTML();
    const ss = $("#cal-sess"); if (ss) ss.textContent = st.session;
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
    if (bill) rows.push(`<div class="dk bill"><b>${esc(bill.title)}</b>
      <i>${esc(String(st.bills[bill.id].stage).replace(/_/g, " "))}</i></div>`);
    owed.forEach(u => {
      const due = u.by - st.sitting;
      rows.push(`<div class="dk owed${due <= 1 ? " late" : ""}"><b>${esc(u.text)}</b>
        <i>${due <= 0 ? "due this sitting" : "by sitting " + u.by}${
          u.owed_to ? " · " + esc(partyName(u.owed_to)) : ""}</i></div>`);
    });
    /* A DIVISION HAS A DAY, and the day is business. */
    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id];
      if (!bs || bs.dead || bs.dividesOn == null) return;
      const away = bs.dividesOn - st.sitting;
      rows.push(`<div class="dk div${away <= 0 ? " late" : ""}">
        <b>Division: ${esc(b.title)}</b>
        <i>${away <= 0 ? "today" : "sitting " + bs.dividesOn +
            " · " + away + " sitting" + (away === 1 ? "" : "s") + " away"}</i></div>`);
    });
    (C.instruments || []).forEach(si => {
      const x = st.instruments[si.id];
      if (x && x.inForce && x.prayerCloses != null && x.prayerCloses > st.sitting)
        rows.push(`<div class="dk pray"><b>${esc(si.number)}</b>
          <i>prayable for ${x.prayerCloses - st.sitting} more</i></div>`);
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
      rows.push(`<div class="dk post"><b>${esc(post ? post.title || post.name : pid)}
        stands vacant</b><i>no holder · the department cannot make an order</i></div>`);
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

  function drawSitting() {
    const dk = $("#sit-docket");
    if (dk) dk.innerHTML = docketHTML();
    drawCalendar();
    drawToday();

    const box = $("#sitting-body");
    const loss = Engine.checkLoss(st, C);
    if (loss.lost) {
      box.innerHTML = `<div class="waiting"><b>The government has fallen.</b><br>` +
        `Reason: ${loss.reason}. Sitting ${st.sitting}.</div>`;
      return;
    }
    if (!currentEvent) currentEvent = Engine.nextEvent(st, C);
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
        `${st.bills[cur].dead ? ' <i class="dual">fallen</i>' : ""}</span>` +
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
      `<div class="note">${b.dualMajority
        ? (d.carries ? "Carries both tests."
           : d.popular.carries ? "<b>Carries the House and fails the functional bench.</b>"
           : "Fails.")
        : (d.popular.carries ? "Carries." : "Fails.")} ` +
        (voted
          ? `As the House voted at sitting ${st.bills[id].lastDivision.at}: filled seats are ayes, ` +
            `the rest are noes or absentees.`
          : `Filled seats are expected ayes, half-filled ones the whip has bought; ` +
            `the count is by party, not by member. ${esc(d.prov || "")}.`) + `</div>`;
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
    const html = whipPanel(id, b, d);
    /* whipPanel says nothing about a fallen measure, and an empty panel
       is a frame around a hole. */
    if (panel) panel.hidden = !html;
    if (!html) { el.innerHTML = ""; return; }
    const hdr = $("#cham-whip-hdr");
    if (hdr) hdr.textContent = b.title;
    el.innerHTML = html;
    wireWhipbars(el, id, () => { drawChamber(); drawBill(id); drawStatus(); });
  }

  /* One table, drawn from whichever state the House is in. */
  function drawBenchTable() {
    const el = $("#comp-table"), hdr = $("#comp-hdr");
    if (!el) return;
    const id = chamberBill();
    if (hdr) hdr.textContent = id ? "by tier, and how they are expected to go" : "by tier";
    el.innerHTML = benchTableHTML(id ? forecast(id) : null);
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
    return `<span class="sbar ${state}" aria-hidden="true">` + order.map((sg, i) => {
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
      const bs = st.bills[b.id];
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
        `<td class="n">${d.popular.aye}</td><td class="n">${b.dualMajority ? d.functional.aye : "&mdash;"}</td>` +
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
    const popular = (id, into) => {
      const s = st.parties[id].seats, col = C.partyById[id].colour;
      const r = rowOf(id);
      /* DURING A DIVISION the ayes come off a budget spent front to back, so
         the bench lights as a lobby filling rather than as a party reporting. */
      let aye = r ? (counting ? spend(r.popularAye) : r.popularAye)
                  : (counting ? 0 : null);
      const whip = voted || !r ? 0 : Math.min(r.popularWhipped || 0, r.popularAye);
      const put = t => { const on = aye == null || aye-- > 0;
                         into.push({ c: col, t: t, p: id, aye: aye == null ? null : on,
                                     wh: on && aye != null && aye < whip }); };
      for (let i = 0; i < s.district; i++) put("d");
      for (let i = 0; i < s.list; i++)     put("l");
    };
    const allIds = C.parties.map(p => p.id);
    bySize(allIds.filter(id => govIds.includes(id))).forEach(id => popular(id, gov));
    bySize(allIds.filter(id => !govIds.includes(id))).forEach(id => popular(id, opp));
    bySize(allIds).forEach(id => {
      const s = st.parties[id].seats, col = C.partyById[id].colour;
      const r = rowOf(id);
      let aye = r ? (counting ? spend(r.functionalAye) : r.functionalAye)
                  : (counting ? 0 : null);
      const whip = voted || !r ? 0 : Math.min(r.functionalWhipped || 0, r.functionalAye);
      /* AISLES FOLDS THE BENCH IN. The functional forty sit at the Bar in
         their own block because the dual test makes them a separate
         question. For a simple measure they are only votes, and a bench of
         their own says otherwise — so they join the side their party is on
         and the Bar goes away. */
      const into = chamberFold
        ? (govIds.includes(id) ? gov : opp) : cross;
      for (let i = 0; i < s.functional; i++) {
        const on = aye == null || aye-- > 0;
        into.push({ c: col, t: "f", p: id, aye: aye == null ? null : on,
                     wh: on && aye != null && aye < whip });
      }
    });

    /* No outline. A stroke on a 3px mark is a third of its area, so 280 of
       them read as a grey mesh with colour trapped inside it. Bare fills
       let the benches read as blocks of party at a glance, which is the
       only thing this diagram is for. */
    const glyph = (x, y, s) => {
      /* a seat that is not voting aye keeps its party and loses its fill */
      const st_ = ` class="sg${s.aye === false ? " no" : s.wh ? " wh" : ""}" fill="${s.c}"`;
      if (s.t === "d") return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4"${st_}/>`;
      if (s.t === "l") return `<rect x="${(x-3).toFixed(1)}" y="${(y-3).toFixed(1)}" width="6" height="6"${st_}/>`;
      return `<path d="M${x.toFixed(1)} ${(y-3.8).toFixed(1)}L${(x+3.6).toFixed(1)} ${(y+2.7).toFixed(1)}` +
             `L${(x-3.6).toFixed(1)} ${(y+2.7).toFixed(1)}Z"${st_}/>`;
    };

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

    function bench(seats, x0, yFront, dir) {
      let out = "";
      seats.forEach((s, i) => {
        const c = Math.floor(i / ROWS), r = i % ROWS;
        out += glyph(x0 + c * CW, yFront + dir * r * RH, s);
      });
      return out;
    }

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
    const benchW = Math.max(govCols, oppCols) * CW;
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

    const W = hasBar ? crossX + XCOLS * XCW + 14 : X0 + benchW + 22;
    const H = Math.max(oppBot + 26, hasBar ? crossBot + 26 : 0) + 8;
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

    $("#chamber").innerHTML =
      /* the Chair holds the end, one member and not a piece of furniture */
      (chair ? glyph(30, FLOOR, chair) : "") +
      label(30, FLOOR + 17, "SPEAKER") +
      bench(govV, X0, govFront, -1) +
      bench(oppV, X0, oppFront, +1) +
      (hasBar ? crossbench(crossV, crossX, crossTop) : "") +
      label(CX, govTop - 12, "GOVERNMENT") +
      label(CX, oppBot + 22, "OPPOSITION") +
      (hasBar ? label(crossCX, crossTop - 14, "THE BENCH") : "") +
      (hasBar ? label(crossCX, crossBot + 22, "functional tier", "sub") : "");

    const seatLine = (n, of) => `${n}<span class="of">/${of}</span>`;
    /* AISLES puts the functional forty into the aisles, so a popular
       denominator would read "169/240" and mean nothing. In that view the
       two sides are measured against the whole House. */
    const sideOf = chamberFold
      ? Engine.popularTotal(st) + Engine.functionalTotal(st)
      : Engine.popularTotal(st);
    $("#chamber-tally").innerHTML =
      `<span class="ct gov" data-tip="government">Government ${seatLine(govN, sideOf)}</span>` +
      `<span class="ct opp" data-tip="opposition">Opposition ${seatLine(oppN, sideOf)}</span>` +
      (crossN ? `<span class="ct cross" data-tip="functional">Functional ${crossN}</span>` : "") +
      `<span class="ct" data-tip="majority">Majority ${Engine.majority(st)}</span>` +
      (chairName ? `<span class="ct" data-tip="speaker">Speaker ${chairParty ? mark(chairParty) : ""}` +
                   `${esc(bare(chairName))}<i class="of"> ${esc(spkSeat.name)}</i></span>` : "");

    /* The legend names the two kinds of support — a partner in government and
       a party that only sustains it — while the diagram keeps both on the
       government side of the floor, which is where confidence and supply sits. */
    drawChamberForecast();
    drawChamberWhip();
    drawBenchTable();
    $("#chamber-legend").innerHTML = C.parties.map(p => {
      const tag = st.coalition.includes(p.id) ? ' <i class="ingov">GOV</i>'
                : st.confidenceSupply.includes(p.id) ? ' <i class="ingov">C&amp;S</i>' : "";
      return `<span>${mark(p.id)}${p.name} ${Engine.partyTotal(st, p.id)}${tag}</span>`;
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
    /* A new station opens on its selected seat; the player may then close it. */
    if (consOpenAt !== sid) { consOpenAt = sid; consOpen = selCons; }
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
            ? `, appointed by the ${esc(f.gatekeeper.appointed_by)}` : "") + `.</div>` : "") +
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
            ? held.map(pid => `${mark(pid)}<span class="hn">${h[pid]}</span>`).join(" ")
            : "&mdash;"}</td></tr>`;
        return row + (isOpen
          ? `<tr class="funcdet"><td colspan="3">${detailHTML(f)}</td></tr>` : "");
      }).join("") + "</tbody>";
    $("#func-table").querySelectorAll("tr[data-func]").forEach(tr =>
      tr.addEventListener("click", () => Focus.activate("func-table", tr.dataset.func)));

    const seats = F.reduce((n, f) => n + f.seats, 0);
    const licensed = F.filter(f => f.franchise !== "residual")
                      .reduce((n, f) => n + f.electorate, 0);
    const resid = F.filter(f => f.franchise === "residual")
                   .reduce((n, f) => n + f.electorate, 0);
    /* The two words the table used to anchor on every row now anchor
       once, here, where the sentence is actually about them. */
    $("#func-note").innerHTML =
      `${seats} seats. <b>${licensed.toLocaleString()}</b> <span data-tip="electors">electors</span> ` +
      `hold a functional <span data-tip="franchise">franchise</span> across ` +
      `${F.length - 1} licensed constituencies; ` +
      `<b>${resid.toLocaleString()}</b> sit in the residual constituency and return ` +
      `${F.filter(f => f.franchise === "residual").reduce((n, f) => n + f.seats, 0)}. ` +
      `A measure touching life-support integrity or the Charter must carry here separately.`;
  }

  /* ---------- log ---------- */
  function drawLog() {
    $("#log-body").innerHTML = st.log.length
      ? "<tbody>" + st.log.slice(0, 40).map(l => `<tr><td class="n">${l.sitting}</td><td>${l.text}</td></tr>`).join("") + "</tbody>"
      : "<tbody><tr><td>No decisions recorded.</td></tr></tbody>";
  }

  /* setStatus is exported so that Shell and, later, the induction pack can
     write the line without reaching into #sb-msg themselves. */
  /* redraw is exported for the checks only. It is drawAll under another
     name, and it makes no sound — which is itself asserted, so exporting
     it cannot become a way to smuggle a cue into a renderer. */
  return { boot, state: () => st, annotate, setStatus, redraw: drawAll,
           __test: { cabinetView, structure, reportMoves } };
})();
