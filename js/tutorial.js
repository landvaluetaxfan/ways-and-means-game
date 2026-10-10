/* =============================================================
   THE TUTORIAL (design/77). A card beside one part of the interface, with the rest dimmed and the pointer
   blocked outside it, saying what one mechanic is, what changes it and what to do.

   A STEP is content: `setup.tutorial[]` in the campaign, each { id, when, onTab, region, title, body, voice, bill }.
     when    the usual conditions (`Engine.matches`), e.g. { seen:["a1_order_paper"] }
     onTab   the tab it points at (sit, gov, cham, econ ...); the step waits on any other
     region a NAME in REGIONS below. Content never writes a selector, so a pass over the interface that moves
             a panel is one line here and not a rewrite of the steps
   voice   an optional character id; the card then shows their name. Without one the game speaks plainly.
     bill    optional bill id selected by a Sitting lesson link; selection never advances or votes on it.

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
    "owed":             { tab: "sit",  sel: ':is(#sit-today [data-obligation="owed"], #sit-docket .dk.owed)' },
    "order-paper-time": { tab: "gov",  sel: "#gov-time" },
    "treasury-vacancy": { tab: "gov",  sel: "#gov-vacancies" },
    "orders":           { tab: "gov",  sel: "#gov-available" },
    "order-paper":      { tab: "cham", sel: "#cham-bills" },
    "estimates-clauses":{ tab: "cham", sel: ".clsec" },
    "whip":             { tab: "cham", sel: "#cham-whip" },
    "divide":           { tab: "cham", sel: "#btn-divide" },
    "account":          { tab: "econ", sel: "#p-acct" },
    "money-calls":      { tab: "econ", sel: "#econ-calls" }
  };

  let layer = null, card = null, shown = null, queued = false, returnTo = null, dismissedNow = {}, requested = null;
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


  /* Review is independent of automatic teaching. Previously read explanations stay available. */
  function eligible() {
    const st = typeof UI !== "undefined" && UI.state && UI.state();
    if (!st || (st.flags && st.flags.sandbox)) return [];
    return steps().filter(s => s.when ? Engine.matches(st, s.when) :
      !!(REGIONS[s.region] && document.querySelector("#s-" + REGIONS[s.region].tab + " " + REGIONS[s.region].sel)));
  }
  const met = () => String(O().tutorialMet || "").split(",").filter(Boolean);
  function available() {
    const st = typeof UI !== "undefined" && UI.state && UI.state();
    if (!st || (st.flags && st.flags.sandbox)) return [];
    const known = new Set(taught().concat(met(), eligible().map(s => s.id)));
    return steps().filter(s => known.has(s.id));
  }
  function rememberIntroductions() {
    if (silent() || !$("#shell.on")) return;
    const old = met(), all = [...new Set(old.concat(eligible().map(s => s.id)))];
    if (all.length !== old.length && typeof Shell !== "undefined" && Shell.setOpt)
      Shell.setOpt("tutorialMet", all.join(","));
  }
  function markTabs() {
    const st = typeof UI !== "undefined" && UI.state && UI.state(), shell = $("#shell");
    const active = !silent() && mode() !== "off" && shell && shell.classList.contains("on") && st &&
      !(st.flags && st.flags.sandbox) && !$("#shell.opening") && !Engine.checkEnd(st, UI.content()).over;
    const done = taught();
    const pending = active ? eligible().filter(s => !done.includes(s.id) && !dismissedNow[s.id]) : [];
    document.querySelectorAll(".tab[data-t]").forEach(tab => {
      const needed = pending.some(s => s.onTab === tab.dataset.t), badge = tab.querySelector(".tut-tab-hint");
      if (needed && !badge) {
        const hint = document.createElement("span"); hint.className = "tut-tab-hint";
        hint.textContent = "?"; hint.setAttribute("role", "img");
        hint.setAttribute("aria-label", "Tutorial lesson available"); hint.title = "Tutorial lesson available";
        tab.appendChild(hint);
      } else if (!needed && badge) badge.remove();
    });
    sittingLessons(pending);
  }

  /* A route from the Sitting to an explanation, never to an action. Bill selection is view state. */
  function open(id) {
    const s = eligible().find(s => s.id === id);
    if (!s || silent() || mode() === "off" || Engine.checkEnd(UI.state(), UI.content()).over) return false;
    requested = id;
    UI.openTab(s.onTab);
    if (s.bill && UI.state().bills[s.bill]) Focus.activate("cham-bills", s.bill);
    refresh();
    return !!(shown && shown.id === id);
  }
  function sittingLessons(pending) {
    let root = $("#sit-tutorial");
    if (!pending.length) { if (root) root.remove(); return; }
    const anchor = $("#sit-matters"); if (!anchor) return;
    const signature = JSON.stringify(pending.map(s => [s.id, s.title, s.onTab]));
    if (root && root.dataset.lessons === signature) return;
    if (!root) {
      root = document.createElement("section"); root.id = "sit-tutorial";
      root.setAttribute("aria-label", "Tutorial"); anchor.after(root);
      root.addEventListener("click", e => {
        const button = e.target.closest("[data-tut-open]");
        if (button) open(button.dataset.tutOpen);
      });
    }
    root.dataset.lessons = signature; root.replaceChildren();
    const heading = document.createElement("h3"); heading.className = "rulehead"; heading.textContent = "Tutorial";
    root.appendChild(heading);
    const add = (s, parent) => {
      const button = document.createElement("button"); button.className = "tut-lesson-link"; button.dataset.tutOpen = s.id;
      const tab = $('.tab[data-t="' + s.onTab + '"]');
      button.textContent = Engine.text(s.title, UI.content()) + " · " + (tab ? tab.childNodes[0].textContent.trim() : s.onTab);
      parent.appendChild(button);
    };
    add(pending[0], root);
    if (pending.length > 1) {
      const details = document.createElement("details"), summary = document.createElement("summary");
      summary.textContent = "Other lessons"; details.appendChild(summary);
      pending.slice(1).forEach(s => add(s, details)); root.appendChild(details);
    }
  }

  /* the step that should be showing now, and the element it lights */
  function pick() {
    if (silent() || mode() === "off") return null;
    const shell = $("#shell"); if (!shell || !shell.classList.contains("on")) return null;
    if (document.querySelector(".dlg-back, #tb-optpanel.on, #shell.opening, #gov-docs:not([hidden])")) return null;
    if (typeof UI === "undefined" || !UI.state) return null;
    const st = UI.state(); if (!st || (st.flags && st.flags.sandbox) || Engine.checkEnd(st, UI.content()).over) return null;
    const done = taught(), tab = activeTab();
    const ordered = steps().slice().sort((a, b) => Number(b.id === requested) - Number(a.id === requested));
    for (const s of ordered) {
      if (done.indexOf(s.id) >= 0 || dismissedNow[s.id]) continue;
      if (s.onTab && s.onTab !== tab) continue;
      if (s.when && !Engine.matches(st, s.when)) continue;
      if (s.bill && Focus.selected("cham-bills") !== s.bill) continue;
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
      '<div class="tut-who"></div><h3 id="tut-title"></h3><p class="tut-body" tabindex="0"></p>' +
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
      else if (e.key === "Tab") {               /* the lit region and the lesson are both live */
        const selector = 'a[href],button,input,select,textarea,[tabindex]';
        const usable = el => {
          if (el.tabIndex < 0 || el.matches(":disabled") || el.closest("[hidden],[inert]")) return false;
          const style = getComputedStyle(el), box = el.getBoundingClientRect();
          return style.visibility !== "hidden" && style.visibility !== "collapse" && box.width > 0 && box.height > 0;
        };
        const region = shown.el;
        const targets = region && document.contains(region)
          ? [region, ...region.querySelectorAll(selector)].filter(el => el.matches(selector) && usable(el)) : [];
        const f = targets.concat([...card.querySelectorAll(selector)].filter(usable));
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        const next = i < 0 ? (e.shiftKey ? f.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length;
        e.preventDefault(); f[next].focus();
        if (region && document.contains(region)) place(region);
      }
    }, true);
  }

  function place(el) {
    const pad = 6, vw = Math.min(innerWidth, document.documentElement.clientWidth),
      vh = Math.min(innerHeight, document.documentElement.clientHeight);
    const focused = document.activeElement;
    const anchor = focused && el.contains(focused) ? focused : el;
    const b = anchor.getBoundingClientRect(), regionBox = el.getBoundingClientRect();
    const x0 = Math.max(0, Math.min(vw, b.left - pad)), y0 = Math.max(0, Math.min(vh, b.top - pad));
    const x1 = Math.max(0, Math.min(vw, b.right + pad)), y1 = Math.max(0, Math.min(vh, b.bottom + pad));
    const set = (n, l, t, w, h) => { const s = layer.querySelector(n).style; s.left = l + "px"; s.top = t + "px"; s.width = Math.max(0, w) + "px"; s.height = Math.max(0, h) + "px"; };
    /* Keep the whole region live even when positioning beside its focused control. */
    const hx0 = Math.max(0, Math.min(vw, regionBox.left - pad)), hy0 = Math.max(0, Math.min(vh, regionBox.top - pad));
    const hx1 = Math.max(0, Math.min(vw, regionBox.right + pad)), hy1 = Math.max(0, Math.min(vh, regionBox.bottom + pad));
    set('[data-b="t"]', 0, 0, vw, hy0);
    set('[data-b="b"]', 0, hy1, vw, vh - hy1);
    set('[data-b="l"]', 0, hy0, hx0, hy1 - hy0);
    set('[data-b="r"]', hx1, hy0, vw - hx1, hy1 - hy0);
    set(".tut-hole", hx0, hy0, hx1 - hx0, hy1 - hy0);
    /* the card: right of the region if it fits, else left, else below, else above; never off the screen */
    const cw = Math.max(1, Math.min(340, vw - 24)), gap = 14;
    card.style.width = cw + "px";                 /* measure after wrapping to the current viewport */
    card.style.maxHeight = Math.max(1, vh - 16) + "px";
    let ch = card.offsetHeight || 170;
    let l, t;
    if (vw - x1 >= cw + gap + 8) { l = x1 + gap; t = y0; }
    else if (x0 >= cw + gap + 8) { l = x0 - gap - cw; t = y0; }
    else {
      const below = vh - y1 - gap - 8, above = y0 - gap - 8;
      const room = Math.max(below, above);
      /* Prefer a shorter, scrollable explanation to covering the control being taught. */
      if (room >= 120) { card.style.maxHeight = room + "px"; ch = card.offsetHeight || ch; }
      l = x0; t = below >= ch || below >= above ? y1 + gap : y0 - gap - ch;
    }
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
      if (p.el.scrollIntoView) p.el.scrollIntoView({ block: "nearest", inline: "nearest" });
      place(p.el);
      const ok = card.querySelector('[data-tut="ok"]'); if (ok) ok.focus({ preventScroll: true });
    } else {
      shown.el = p.el;
      const b = p.el.getBoundingClientRect();
      if ((b.bottom <= 0 || b.top >= innerHeight) && p.el.scrollIntoView)
        p.el.scrollIntoView({ block: "nearest", inline: "nearest" });
      place(p.el);
    }
  }
  function hide() {
    if (!layer || !shown) return;
    layer.classList.remove("on"); shown = null;
    if (returnTo && document.contains(returnTo)) { try { returnTo.focus(); } catch (e) { /* gone */ } }
    returnTo = null;
  }

  function refresh() {
    queued = false;
    rememberIntroductions();
    markTabs();
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
    const id = shown.id; dismissedNow[id] = true; requested = null;
    const t = taught(); if (t.indexOf(id) < 0) { t.push(id); setTaught(t); }
    hide(); schedule();
  }
  function skip() { if (typeof Shell !== "undefined" && Shell.setOpt) Shell.setOpt("tutorial", "off"); hide(); }

  /* from Options: back on, and every lesson to be given again (one id, or all) */
  function replay(id) {
    dismissedNow = {}; requested = null;
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

  return { refresh, replay, open, steps, available, REGIONS, shown: () => shown, taught, dismiss, skip, pick };
})();
if (typeof module !== "undefined") module.exports = Tutorial;
