/* =============================================================
   MOTION — the transitions, and the notice that something moved
   somewhere else.

   THE HARD RULE, AND IT IS THE AUDIO BUS'S RULE:

     Motion is triggered by USER ACTIONS and ENGINE OUTCOMES only.
     No animation may originate from drawAll(), or from any draw*
     function, directly or transitively.

   A redraw happens for reasons that have nothing to do with the
   player — switching tabs, loading a slot, a mirrored panel
   repainting, a test harness re-entering UI.boot(). A transition
   fired from a draw function is a transition that fires four times
   in a row while the player is reading. tools/uxtest.js proves the
   rule by spying on this module across a full redraw.

   WHAT THE STANDARD IS. Not fades. This interface is a government
   terminal that draws things rather than a film that cuts between
   them, so a transition is the SCREEN BEING WRITTEN: an ordered
   dither, cell by cell, in the Bayer sequence the image pipeline
   already uses (bible 12.11). It reads as machine output because it
   is the same ordering the machine uses everywhere else.

   NO-MOTION IS NOT A DEGRADED MODE. `body.no-motion` already kills
   every CSS animation with `animation:none !important`, so every
   entry point here checks the preference FIRST and takes the
   instant path — the same state, arrived at without the theatre.
   A player who turns animation off must never lose information,
   which is why the cross-tab notice still appears; it just appears
   rather than arrives.

   NOTHING HERE MAY THROW. It runs in jsdom with no layout, in
   browsers that refuse requestAnimationFrame in a background tab,
   and inside a test harness that calls boot() repeatedly.
   ============================================================= */
const Motion = (function () {
  "use strict";

  /* Ordered 4x4 Bayer matrix — the same sequence tools/dither.sh uses,
     which is why the dissolve looks like the game's own images rather
     than like a video transition. Values are the ORDER a cell turns on. */
  const BAYER = [
     0,  8,  2, 10,
    12,  4, 14,  6,
     3, 11,  1,  9,
    15,  7, 13,  5
  ];

  const GRID = 4;                 /* cells per Bayer tile */
  const CELL = 22;                /* px per cell, before the tile repeats */
  const STEPS = 16;               /* Bayer levels */

  function reduced() {
    if (typeof document === "undefined") return true;
    if (document.body && document.body.classList.contains("no-motion")) return true;
    try {
      return !!(window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) { return false; }
  }

  const raf = (typeof requestAnimationFrame === "function")
    ? requestAnimationFrame
    : function (f) { return setTimeout(f, 16); };

  /* ---------- the dissolve ----------

     THE SWAP HAPPENS FIRST AND NEVER WAITS FOR A FRAME.

     The first version covered the screen, swapped at the halfway point
     of the animation, and uncovered. It looked better and it was
     wrong: the state change was gated on a requestAnimationFrame
     callback, so in any situation where frames do not run — a
     backgrounded tab, a throttling browser, a test harness that does
     not pump the loop — the player pressed Continue and the game did
     not start. The headless checks caught it by never booting.

     So: swap synchronously, then draw the new screen in. The terminal
     writes the screen it is arriving at rather than erasing the one it
     is leaving, which is also the more honest reading of the machine.

     And the overlay is removed by a timeout as well as by the last
     frame, because a layer that outlives its animation is a layer over
     the whole game. */
  function dissolve(swap, done, ms) {
    swap = typeof swap === "function" ? swap : function () {};
    done = typeof done === "function" ? done : function () {};
    if (typeof document === "undefined") { swap(); done(); return; }

    /* ALWAYS, before anything else. */
    try { swap(); } catch (e) { /* the caller's problem, not the layer's */ }
    if (reduced()) { done(); return; }

    let layer = null;
    const clean = function () {
      if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
      layer = null;
    };

    try {
      layer = document.createElement("div");
      layer.className = "dissolve";
      layer.setAttribute("aria-hidden", "true");
      const w = window.innerWidth || 1200, h = window.innerHeight || 800;
      const cols = Math.ceil(w / CELL), rows = Math.ceil(h / CELL);
      let html = "";
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++)
          html += '<i class="on" data-s="' + BAYER[(y % GRID) * GRID + (x % GRID)] + '"></i>';
      layer.style.gridTemplateColumns = "repeat(" + cols + ", " + CELL + "px)";
      layer.style.gridAutoRows = CELL + "px";
      layer.innerHTML = html;
      document.body.appendChild(layer);
      const cells = [].slice.call(layer.querySelectorAll("i"));

      const total = ms || 420;
      const start = (typeof performance !== "undefined" && performance.now)
        ? performance.now() : Date.now();

      /* the guarantee: whatever the frame loop does, the screen clears */
      const bail = setTimeout(function () { clean(); done(); }, total + 400);

      const frame = function (now) {
        if (!layer) return;
        const t = Math.min(1, ((now || Date.now()) - start) / total);
        const level = Math.round(t * STEPS);
        for (let i = 0; i < cells.length; i++) {
          const on = (+cells[i].dataset.s) >= level;
          if (on !== (cells[i].className === "on"))
            cells[i].className = on ? "on" : "";
        }
        if (t < 1) { raf(frame); return; }
        clearTimeout(bail);
        clean();
        done();
      };
      raf(frame);
    } catch (e) {
      clean();
      done();
    }
  }

  /* ---------- the notice ----------

     A decision on one screen changes something on another, and the
     player is given no reason to look. This is that reason: a small
     card by the tab that now holds the change, saying what it is.

     IT IS INFORMATION AND NOT DECORATION, so it appears under
     no-motion too — instantly, and it stays a beat longer, because a
     player who has turned animation off is more likely to be reading
     than watching.

     It never carries a control. A card you can act on is a second
     place to do the thing, and the whole discipline of the docket is
     that there is one place. */
  const QUEUE = [];
  let showing = false;

  function notify(item) {
    if (typeof document === "undefined" || !item) return;
    QUEUE.push(item);
    if (!showing) next();
  }

  function next() {
    const item = QUEUE.shift();
    if (!item) { showing = false; return; }
    showing = true;

    let card;
    try {
      card = document.createElement("div");
      card.className = "movecard";
      card.setAttribute("role", "status");
      card.innerHTML =
        '<div class="mc-h">' + esc(item.where || "elsewhere") + "</div>" +
        '<div class="mc-b">' + esc(item.text || "") + "</div>" +
        (item.detail ? '<div class="mc-d">' + esc(item.detail) + "</div>" : "");

      /* Anchored under the tab it concerns, so the card points at where
         the change is rather than floating in a corner. */
      const tab = item.tab && document.querySelector('.tab[data-t="' + item.tab + '"]');
      if (tab && tab.getBoundingClientRect) {
        const r = tab.getBoundingClientRect();
        card.style.left = Math.max(6, Math.round(r.left)) + "px";
        card.style.top = Math.round(r.bottom + 4) + "px";
        if (!card.className.match(/anchored/)) card.className += " anchored";
      }
      document.body.appendChild(card);
      if (tab) tab.classList.add("tab-moved");

      const still = reduced();
      if (!still) raf(function () { card.classList.add("in"); });
      else card.classList.add("in");

      const hold = still ? 2600 : 2100;
      setTimeout(function () {
        card.classList.remove("in");
        if (tab) tab.classList.remove("tab-moved");
        setTimeout(function () {
          if (card.parentNode) card.parentNode.removeChild(card);
          next();
        }, still ? 0 : 220);
      }, hold);
    } catch (e) {
      if (card && card.parentNode) card.parentNode.removeChild(card);
      showing = false;
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* For the checks: is anything on screen right now. */
  function busy() {
    return typeof document !== "undefined" &&
      !!document.querySelector(".dissolve, .movecard");
  }

  return { dissolve: dissolve, notify: notify, reduced: reduced, busy: busy };
})();

if (typeof module !== "undefined") module.exports = Motion;
