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

  /* HOW LONG THE REVEAL TAKES, in milliseconds.

     FAST, ON PURPOSE. This was 2100ms, which gave the eye long enough to
     work out that a left-to-right clip is all it is. A real hand crosses a
     page in about half a second, and at that speed the reveal reads as a
     signature rather than as a wipe. The theatre is not in the stroke; it is
     in the pause AFTER it, which is why the caller holds the finished name
     for the best part of two seconds before the page dissolves.

     ONE NUMBER, AND THE STYLESHEET READS IT. The duration used to be
     written twice — here, and again as `2.1s` in two CSS rules — with a
     comment asking the next person to keep them in step. That is the
     apportionment_ratio mistake: two copies of one fact, which drift.
     arm() now writes it onto the element as --sig-ms and the CSS
     transitions against that, so there is one place to change it. */
  const WRITE_MS = 520;

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
      /* THE SAME HAND THAT SIGNS THE ACTS. Papers exports SIG_IMG — the
         one scan, at the one size — so the first time a player meets that
         signature it is a name at the end of an introduction, and every
         time after it is a Prime Minister consenting to a law. If Papers
         is not loaded the block still draws its rule and caption, because
         a missing signature must read as a blank line and not as a broken
         page. */
      /* THE HAND IS THE SCAN ITSELF, cropped to its ink and baked to the
         page's colour by tools/inksig.js, and revealed by a left-to-right
         clip. A clip needs no path, so it cannot suffer the fragmentation
         a centreline trace brings, and the hand stays exactly the author's.
         Papers owns the one size, so the ceremony and the introduction
         cannot drift apart. */
      const img = (typeof Papers !== "undefined" && Papers.SIG_IMG) ||
        { src: "img/signature-ink.png", w: 228, h: 131 };
      return `<div class="sp-sec sp-signature"><div class="sigline">` +
        `<div class="rule" style="height:${img.h}px">` +
        `<span class="sigimg" style="width:${img.w}px;height:${img.h}px">` +
        `<img src="${img.src}" alt=""></span>` +
        `</div>` +
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
  /* ARM WITHOUT WRITING. The clip starts closed, so the hand is INVISIBLE
     and waiting. Returns the reveal time in ms, or 0 where there is no
     layout to animate (jsdom, a headless walk) — the caller then leaves at
     once rather than holding a page nothing is drawing on. */
  function arm(root) {
    if (!root || typeof root.querySelector !== "function") return 0;
    const box = root.querySelector(".sp-signature");
    const wrap = box && box.querySelector(".sigimg");
    if (!box || !wrap) return 0;
    const r = wrap.getBoundingClientRect ? wrap.getBoundingClientRect() : null;
    if (!r || !r.width) return 0;               /* not on the glass: nothing to reveal */
    box.style.setProperty("--sig-ms", WRITE_MS + "ms");
    box.classList.add("sig-armed");
    return WRITE_MS;
  }

  /* THE PEN MOVES. A signature armed by arm() is revealed now, over the
     CSS clip transition, which is the one place the duration lives. */
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
