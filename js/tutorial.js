/* =============================================================
   THE TUTORIAL (design/77). A card beside one part of the interface, with the rest dimmed and the pointer
   blocked outside it, saying what one mechanic is, what changes it and what to do.

   A STEP is content: `setup.tutorial[]` in the campaign, each { id, when, onTab, region, title, body, voice }.
     when    the usual conditions (`Engine.matches`), e.g. { seen:["a1_order_paper"] }
     onTab   the tab it points at (sit, gov, cham, econ ...); the step waits on any other
     region a NAME in REGIONS below. Content never writes a selector, so a pass over the interface that moves
             a panel is one line here and not a rewrite of the steps
     voice   an optional character id; the card then shows their name. Without one the game speaks plainly.

   WHAT IT KNOWS. It reads the state and the content, writes nothing to the save, and keeps what has been taught
   in the player's own options (`Shell.opts.taught`), beside the preference (`Shell.opts.tutorial`, "on" or
   "off"): a fact about the person at the terminal, so a second game does not teach again. It never touches the
   simulation, so determinism and the playtest are unaffected. It watches the shell for any change and
   re-measures (a MutationObserver on #shell, resize and scroll), so no render in ui.js has to call it. If a
   step's region is not on screen it waits. One card at a time, the first eligible step in list order.

   OFF IN THE HARNESSES: `window.__NO_TUTORIAL` (set by the checks that are not testing it) keeps it silent.
   ============================================================= */
const Tutorial = (function () {
  "use strict";

  /* name -> the tab it lives on and the selector of the element to light. The panel, not a control in it,
     where the lesson is about the panel. */
  const REGIONS = {
    "calendar":         { tab: "sit",  sel: "#sit-cal" },
    "order-paper-time": { tab: "gov",  sel: "#gov-time" },
    "treasury-vacancy": { tab: "gov",  sel: "#gov-vacancies" },
    "orders":           { tab: "gov",  sel: "#gov-available" },
    "order-paper":      { tab: "cham", sel: "#cham-bills" },
    "estimates-clauses":{ tab: "cham", sel: ".clsec" },
    "whip":             { tab: "cham", sel: "#cham-whip" },
    "divide":           { tab: "cham", sel: "#btn-divide" },
    "account":          { tab: "econ", sel: "#p-acct" }
  };

  let layer = null, card = null, shown = null, queued = false, returnTo = null, dismissedNow = {};
  const $ = s => document.querySelector(s);
  const O = () => (typeof Shell !== "undefined" && Shell.options) || {};
  const mode = () => O().tutorial === "off" ? "off" : "on";
  const taught = () => String(O().taught || "").split(",").filter(Boolean);
  const silent = () => !!window.__NO_TUTORIAL;

  function steps() {
    const C = typeof UI !== "undefined" && UI.content && UI.content();
    return (C && C.setup && C.setup.tutorial) || [];
  }
  function activeTab() { const s = document.querySelector(".screen.on"); return s ? s.id.replace(/^s-/, "") : null; }
  function resolve(name) {
    const r = REGIONS[name]; if (!r) return null;
    const el = document.querySelector("#s-" + r.tab + " " + r.sel) || null;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0 ? el : null;
  }

  /* the step that should be showing now, and the element it lights */
  function pick() {
    if (silent() || mode() === "off") return null;
    const shell = $("#shell"); if (!shell || !shell.classList.contains("on")) return null;
    if (document.querySelector(".dlg-back")) return null;               /* a dialog is up */
    if (typeof UI === "undefined" || !UI.state) return null;
    const st = UI.state(); if (!st || (st.flags && st.flags.sandbox)) return null;
    const done = taught(), tab = activeTab();
    for (const s of steps()) {
      if (done.indexOf(s.id) >= 0 || dismissedNow[s.id]) continue;
      if (s.onTab && s.onTab !== tab) continue;
      if (s.when && !Engine.matches(st, s.when)) continue;
      const el = resolve(s.region);
      if (el) return { step: s, el };
    }
    return null;
  }

  function build() {
    layer = document.createElement("div");
    layer.id = "tut"; layer.setAttribute("aria-live", "polite");
    layer.innerHTML = '<div class="tut-block" data-b="t"></div><div class="tut-block" data-b="l"></div>' +
      '<div class="tut-block" data-b="r"></div><div class="tut-block" data-b="b"></div><div class="tut-hole"></div>' +
      '<div class="tut-card" role="dialog" aria-modal="false" aria-labelledby="tut-title" tabindex="-1">' +
      '<div class="tut-who"></div><h3 id="tut-title"></h3><p class="tut-body"></p>' +
      '<div class="tut-btns"><button class="mbtn sm" data-tut="ok">Got it</button>' +
      '<button class="tut-skip" data-tut="skip">Skip the tutorial</button></div></div>';
    document.body.appendChild(layer);
    card = layer.querySelector(".tut-card");
    layer.addEventListener("click", e => {
      const b = e.target.closest && e.target.closest("[data-tut]"); if (!b) return;
      if (b.dataset.tut === "ok") dismiss(); else skip();
    });
    document.addEventListener("keydown", e => {
      if (!shown) return;
      if (e.key === "Escape") { e.preventDefault(); dismiss(); }
      else if (e.key === "Tab") {                                       /* focus stays on the card */
        const f = [...card.querySelectorAll("button")];
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    }, true);
  }

  function place(el) {
    const pad = 6, vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    const b = el.getBoundingClientRect();
    const x0 = Math.max(0, b.left - pad), y0 = Math.max(0, b.top - pad);
    const x1 = Math.min(vw, b.right + pad), y1 = Math.min(vh, b.bottom + pad);
    const set = (n, l, t, w, h) => { const s = layer.querySelector(n).style; s.left = l + "px"; s.top = t + "px"; s.width = Math.max(0, w) + "px"; s.height = Math.max(0, h) + "px"; };
    set('[data-b="t"]', 0, 0, vw, y0);
    set('[data-b="b"]', 0, y1, vw, vh - y1);
    set('[data-b="l"]', 0, y0, x0, y1 - y0);
    set('[data-b="r"]', x1, y0, vw - x1, y1 - y0);
    set(".tut-hole", x0, y0, x1 - x0, y1 - y0);
    /* the card: right of the region if it fits, else left, else below, else above; never off the screen */
    const cw = Math.min(340, vw - 24), ch = card.offsetHeight || 170, gap = 14;
    let l, t;
    if (vw - x1 >= cw + gap + 8) { l = x1 + gap; t = y0; }
    else if (x0 >= cw + gap + 8) { l = x0 - gap - cw; t = y0; }
    else if (vh - y1 >= ch + gap) { l = x0; t = y1 + gap; }
    else { l = x0; t = Math.max(8, y0 - gap - ch); }
    l = Math.max(8, Math.min(vw - cw - 8, l)); t = Math.max(8, Math.min(vh - ch - 8, t));
    card.style.width = cw + "px"; card.style.left = l + "px"; card.style.top = t + "px";
  }

  function show(p) {
    if (!layer) build();
    const s = p.step, C = UI.content();
    if (!shown || shown.id !== s.id) {
      returnTo = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
      const who = s.voice && C.characterById && C.characterById[s.voice];
      card.querySelector(".tut-who").textContent = who ? who.name + (who.role ? ", " + who.role : "") : "";
      card.querySelector("h3").textContent = Engine.text(s.title,C);
      card.querySelector(".tut-body").textContent = Engine.text(s.body,C);
      layer.classList.add("on");
      shown = { id: s.id, el: p.el };
      place(p.el);
      const ok = card.querySelector('[data-tut="ok"]'); if (ok) ok.focus();
    } else { shown.el = p.el; place(p.el); }
  }
  function hide() {
    if (!layer || !shown) return;
    layer.classList.remove("on"); shown = null;
    if (returnTo && document.contains(returnTo)) { try { returnTo.focus(); } catch (e) { /* gone */ } }
    returnTo = null;
  }

  function refresh() {
    queued = false;
    const p = pick();
    if (p) show(p); else hide();
  }
  function schedule() {
    if (queued) return; queued = true;
    (window.requestAnimationFrame || (f => setTimeout(f, 0)))(refresh);
  }

  function setTaught(list) { if (typeof Shell !== "undefined" && Shell.setOpt) Shell.setOpt("taught", list.join(",")); }
  function dismiss() {
    if (!shown) return;
    const id = shown.id; dismissedNow[id] = true;
    const t = taught(); if (t.indexOf(id) < 0) { t.push(id); setTaught(t); }
    hide(); schedule();
  }
  function skip() { if (typeof Shell !== "undefined" && Shell.setOpt) Shell.setOpt("tutorial", "off"); hide(); }

  /* from Options: back on, and every lesson to be given again (one id, or all) */
  function replay(id) {
    dismissedNow = {};
    setTaught(id ? taught().filter(x => x !== id) : []);
    if (typeof Shell !== "undefined" && Shell.setOpt) Shell.setOpt("tutorial", "on");
    schedule();
  }

  function wire() {
    const shell = $("#shell"); if (!shell || shell.__tut) return;
    shell.__tut = true;
    new MutationObserver(schedule).observe(shell, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-selected", "hidden"] });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire); else wire();
  }

  return { refresh, replay, steps, REGIONS, shown: () => shown, taught, dismiss, skip, pick };
})();
if (typeof module !== "undefined") module.exports = Tutorial;
