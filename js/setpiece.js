/* =============================================================
   THE SET PIECE — the page that takes the screen.

   design/31. A Hearts of Iron event box, a Campaign Trail result screen and
   a character select are the same object wearing three hats:

     a full-bleed page that takes the screen, carries an image and a score,
     scrolls if it must, is built of SECTIONS rather than a paragraph, and
     offers exactly one way forward.

   Nothing else in this interface works like that, and that is the point.
   Every other surface is a panel in a grid, reads at a glance, and is one of
   several things competing for the eye. This one is the game stopping to be
   READ. So it is built once and used three times: the long-form event, the
   last board after the count, and the introduction to the government you are
   about to be.

   RARELY, AND THE RARITY IS THE FEATURE. A set piece says "this is the thing
   the session is about". If chapter two has six of them it has none. One per
   chapter is the budget.

   IT IS A RENDERING DECISION AND NOTHING ELSE. A set piece is a field on an
   ordinary event, with the same `when`, the same `choices` and the same
   effects, selected by the same pool. js/engine.js knows nothing about it and
   gains no verb for it.

   THIS MODULE MAKES NO SOUND. The mood is RETURNED, never cued, because sound
   comes from user actions and engine effects only — never from a draw. The
   caller cues it on the action that opened the page. That rule is in
   CLAUDE.md and tools/uxtest.js asserts it.
   ============================================================= */
const SetPiece = (function () {
  "use strict";

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* THE KINDS CARRY TYPOGRAPHY, NOT MEANING. An author picks a kind because
     of how the passage should READ; the section's own heading says what it
     means. Keeping it closed is what stops it going the way `.sel` went, when
     one class came to mean four things — so a kind nobody recognises falls
     back to plain body rather than inventing a style. */
  const KINDS = ["epigraph", "lede", "body", "voices", "document", "signature"];

  function section(sec) {
    const kind = KINDS.indexOf(sec.kind) >= 0 ? sec.kind : "body";
    const head = sec.head
      ? `<h3 class="sp-head">${esc(sec.head)}</h3>` : "";

    if (kind === "epigraph") {
      /* Centred, and the attribution is part of it: an epigraph without a
         source is a slogan. */
      return `<blockquote class="sp-sec sp-epigraph">` +
        `<p>${esc(sec.body)}</p>` +
        (sec.source ? `<cite>${esc(sec.source)}</cite>` : "") +
        `</blockquote>`;
    }

    if (kind === "document") {
      /* An in-world paper: the document face, ruled, with what it is. */
      return `<div class="sp-sec sp-document">${head}` +
        para(sec.body) +
        (sec.source ? `<div class="sp-source">${esc(sec.source)}</div>` : "") +
        `</div>`;
    }

    if (kind === "voices") {
      /* What is being said, set ragged and quoted. `body` may be an array,
         because voices are plural and a paragraph of them is a summary. */
      const lines = [].concat(sec.body || []);
      return `<div class="sp-sec sp-voices">${head}` +
        lines.map(l => typeof l === "string"
          ? `<p>${esc(l)}</p>`
          : `<p>${esc(l.said)}<span class="sp-who">${esc(l.who || "")}</span></p>`
        ).join("") + `</div>`;
    }

    if (kind === "signature") {
      /* THE SAME HAND THAT SIGNS THE ACTS. Papers exports the one traced
         SIG_PATH, so the first time a player meets that signature it is a
         name at the end of an introduction, and every time after it is a
         Prime Minister consenting to a law. One stroke, two ceremonies.
         If Papers is not loaded the block still draws its rule and caption,
         because a missing signature must read as a blank line and not as a
         broken page. */
      const d = (typeof Papers !== "undefined" && Papers.SIG_PATH) || "";
      /* ONE <path> PER STROKE, so the signature can be WRITTEN. A single
         path of forty-five subpaths animated by one dash offset reveals
         whole strokes at a time — each letter fading in — because every
         subpath is far shorter than the global dash length. Split, each
         stroke draws over its own length, and arm() staggers them in the
         order they were traced, which is left to right. */
      const strokes = d ? d.split(/(?=M)/) : [];
      const svg = strokes.length
        ? `<svg width="228" height="63" viewBox="0 0 228 63" aria-hidden="true">` +
          strokes.map(p => `<path class="sigpath" d="${p}"/>`).join("") + `</svg>`
        : "";
      return `<div class="sp-sec sp-signature"><div class="sigline">` +
        `<div class="rule">` + svg + `</div>` +
        `<div class="cap">${esc(sec.head || "")}</div>` +
        `</div></div>`;
    }

    /* lede and body: the difference is size, which the class carries. */
    return `<div class="sp-sec sp-${kind}">${head}${para(sec.body)}</div>`;
  }

  /* A blank line is a paragraph break, the way it is everywhere else content
     is authored here. */
  function para(body) {
    return String(body == null ? "" : body).split(/\n\s*\n/)
      .map(p => `<p>${esc(p.trim())}</p>`).filter(p => p !== "<p></p>").join("");
  }

  /* Does this event want the whole screen? */
  function is(ev) { return !!(ev && ev.setpiece && (ev.setpiece.sections || []).length); }

  /* Returns the page and the mood it wants. The CALLER cues the mood, on the
     action that opened the page — see the note at the top. */
  function html(ev, opts) {
    const sp = (ev && ev.setpiece) || {};
    const o = opts || {};

    /* THE ART SLOT RENDERS EMPTY AND THAT IS DELIBERATE. content/artifacts.js
       reserves the box either way, so a set piece ships before its picture
       does and filling the slot later moves nothing on the screen. */
    let art = "";
    if (sp.art && typeof Artifacts !== "undefined" && Artifacts.render) {
      try { art = `<div class="sp-art">${Artifacts.render(sp.art)}</div>`; }
      catch (e) { art = ""; }
    }

    const title = sp.title || ev.title || "";
    const body =
      `<div class="sp-page">` +
        (title ? `<h2 class="sp-title">${esc(title)}</h2>` : "") +
        art +
        `<div class="sp-sections">` +
          (sp.sections || []).map(section).join("") +
        `</div>` +
      `</div>`;

    /* THE CHOICES STAY WHERE THEY ARE, and that is deliberate. A set piece
       replaces the PROSE, not the decision: the ordinary rows below it carry
       the derived reading of what a choice does, the undertaking it would
       create and the cabinet's reaction, and rebuilding any of that here
       would be a second way to commit an act. Two listeners for one action
       is the trap CLAUDE.md records from [data-go].

       `opts.go` is for the two uses that have no engine choices behind them
       — the introduction and the last board — where one button is the whole
       of the interaction. */
    const foot = o.go
      ? `<div class="sp-choices"><button class="sp-go" data-sp-go="1">` +
        `${esc(o.go)}</button></div>`
      : "";

    return { html: `<div class="sp-scroll">${body}</div>${foot}`,
             mood: sp.mood || null };
  }

  /* AND IT WRITES ITSELF. The assent ceremony has drawn its signature with a
     stroke-dashoffset sweep since it was built; the introduction ended on a
     signature that simply appeared, which is the thing the author objected to
     in the first place.

     Same machinery, because there is only one right way to do it: measure the
     path at run time with getTotalLength (the length is geometry and cannot be
     known from the file), hand it to CSS as --len, and let the existing
     .sig-armed / .sig-draw rules do the rest. The double rAF is not
     superstition — the armed state has to be painted before the transition is
     allowed to start, or the browser coalesces both into one frame and the
     signature appears instantly, which is the bug wearing a different hat.

     Called by whoever rendered the page, because it follows an action. It is
     motion and not sound, so the no-cue-in-a-renderer rule does not apply —
     but `body.no-motion` and prefers-reduced-motion both already switch the
     transition off in CSS, so a player who asked for stillness gets it. */
  /* HOW LONG THE WHOLE SIGNATURE TAKES, in milliseconds. Slow on purpose:
     a signature that arrives in a blink is a logo, not a hand. */
  const WRITE_MS = 4800;

  /* ARM WITHOUT WRITING. Every stroke is measured and set to its own full
     dash offset, so the signature is INVISIBLE and waiting; the stroke's
     share of the total sets how long it draws and when it starts, so the
     pen moves at a constant speed and the strokes run back to back in
     trace order. Returns the total writing time in ms, or 0 where the
     path cannot be measured (jsdom, a browser without getTotalLength). */
  function arm(root) {
    if (!root || typeof root.querySelector !== "function") return 0;
    const box = root.querySelector(".sp-signature");
    if (!box) return 0;
    const paths = [].slice.call(box.querySelectorAll(".sigpath"));
    if (!paths.length) return 0;
    const lens = paths.map(p => {
      try { return p.getTotalLength ? p.getTotalLength() : 0; } catch (e) { return 0; }
    });
    const total = lens.reduce((a, b) => a + b, 0);
    if (!total) return 0;
    let cum = 0;
    paths.forEach((p, i) => {
      p.style.setProperty("--len", lens[i]);
      p.style.setProperty("--dur", (lens[i] / total * WRITE_MS / 1000).toFixed(3) + "s");
      p.style.setProperty("--delay", (cum / total * WRITE_MS / 1000).toFixed(3) + "s");
      cum += lens[i];
    });
    box.classList.add("sig-armed");
    return WRITE_MS;
  }

  /* THE PEN MOVES. A signature armed by arm() is written now, over the
     per-stroke CSS transitions, which is the one place the timings live. */
  function write(root) {
    const box = root && typeof root.querySelector === "function"
      ? root.querySelector(".sp-signature") : null;
    if (!box) return 0;
    box.classList.remove("sig-armed");
    box.classList.add("sig-draw");
    return WRITE_MS;
  }

  function sign(root) {
    if (!arm(root)) return false;
    const go = () => write(root);
    if (typeof requestAnimationFrame !== "function") { go(); return true; }
    requestAnimationFrame(() => requestAnimationFrame(go));
    return true;
  }

  return { is, html, KINDS, sign, arm, write, WRITE_MS };
})();

if (typeof module !== "undefined") module.exports = SetPiece;
