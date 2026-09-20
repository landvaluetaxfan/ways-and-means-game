/* =============================================================
   PAPERS — the register.

   Government is where you DECIDE: order paper, forecasts, the whip,
   the ledger. Papers is where you READ what you did. Splitting them
   this way keeps the whip panel next to the ledger it spends, which
   §12.1 requires, while giving the in-world artifacts a surface of
   their own.

   §12.2's split visual language lives here. The terminal chrome is
   government-issue plain; a signed act is beautiful, because a state
   printing office has a two-hundred-year-old house style.

   THE VISUAL ASYMMETRY IS THE TEACHING DEVICE. An act that needed
   more than a simple majority gets the signature drawn, once, and
   cannot be undone. An instrument gets a made stamp: dated, numbered,
   no ceremony — and it can be revoked. The player learns which acts
   are permanent by which ones are ceremonious.
   ============================================================= */

const Papers = (function () {
  "use strict";

  let st, C, drawn = {}, onChange = null;

  /* THE REGISTER'S SELECTION LIVES IN Focus, not here. It used to be a
     closure variable, which worked and was also the third of four
     different places the game kept "which row is chosen" - see the
     header of js/focus.js. One store, so a re-render can put the player
     back where they were. */
  Focus.region("pp-list", {
    rows: "tr[data-doc]",
    key: tr => tr.dataset.doc,
    activate: () => render(st, C)
  });
  /* THE BENCH (design/30). An actor, so no new state shape and no new verb:
     its standing is its disposition toward the government, moved by whether
     references are answered and rulings complied with. A case is a queued
     event with a label, so the calendar already carries it and this panel
     reads the same queue. */
  function tribunalHTML() {
    const a = (C.actors || []).find(x => x.id === "tribunal");
    if (!a) return `<div class="note">No bench sits in this campaign.</div>`;
    const live = (st.actors || {}).tribunal || {};
    const v = live.standing == null ? a.standing : live.standing;
    const cls = v >= 65 ? "good" : v <= 35 ? "bad" : "";
    const cases = (st.queue || []).filter(q => /^tr_/.test(q.eventId || ""));
    const flight = cases.length
      ? cases.map(q => `<div class="cn"><b>${esc(q.label || "A case")}</b><i>sitting ` +
          `${q.dueSitting}${q.dueSitting > st.sitting
            ? " · " + (q.dueSitting - st.sitting) + " away" : " · today"}</i></div>`).join("")
      : `<div class="note">Nothing is before the bench.</div>`;
    return `<div class="fgn"><div class="fgn-h"><b>Disposition</b>` +
      `<span class="fgn-lag">${v >= 55 ? "reads the government generously"
        : "reads it narrowly"}</span></div>` +
      `<div class="fgn-b"><span class="meter ${cls}"><i style="width:${
        Math.max(0, Math.min(100, v))}%"></i></span><output>${v}</output></div>` +
      `<div class="note">Wants: ${esc(a.asks || "a reference answered")}.</div></div>` +
      `<div class="rulehead">Before the bench</div>` + flight;
  }

  const chosen = () => Focus.selected("pp-list");

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- what is in the register ---------- */

  function items() {
    const out = [];

    C.bills.forEach(b => {
      const bs = st.bills[b.id];
      if (["assented", "struck", "referred", "awaiting_assent", "defeated"].includes(bs.stage))
        out.push({
          kind: "act", id: "act_" + b.id, bill: b, state: bs,
          title: b.title.replace(/ Bill$/, " Act"),
          ref: b.ref, at: bs.assentedAt || bs.carriedAt || 0,
          status: bs.stage
        });
    });

    (C.instruments || []).forEach(si => {
      const s = st.instruments[si.id];
      if (!s.made) return;
      out.push({
        kind: "instrument", id: si.id, si: si, state: s,
        title: si.title, ref: si.number, at: s.madeAt || 0,
        status: s.revoked ? "revoked" : s.inForce ? "in force" : "made"
      });
    });

    (C.minutes || []).forEach(m => {
      if (m.when && !Engine.matches(st, m.when)) return;
      out.push({ kind: "minute", id: m.id, minute: m, title: m.subject,
                 ref: m.file, at: m.sitting || 0, status: "minute" });
    });

    return out.sort((a, b) => b.at - a.at);
  }

  /* ---------- documents ---------- */

  const crest = `<svg class="crest" width="46" height="52" viewBox="0 0 46 52" aria-hidden="true">
    <circle cx="23" cy="23" r="12" fill="none" stroke="#17140e" stroke-width="1.2"/>
    <ellipse cx="23" cy="23" rx="21" ry="8" fill="none" stroke="#17140e" stroke-width="1.2"/>
    <ellipse cx="23" cy="23" rx="21" ry="8" fill="none" stroke="#17140e" stroke-width="1.2" transform="rotate(58 23 23)"/>
    <circle cx="23" cy="23" r="3.4" fill="#17140e"/>
    <path d="M6 45 h34" stroke="#17140e" stroke-width="1.2"/>
    <path d="M9 49 h28" stroke="#17140e" stroke-width="0.8"/></svg>`;

  function head(office, sub, file, right) {
    return `<div class="letterhead">${crest}<div class="lh-txt">
        <h3>${esc(office)}</h3><p>${esc(sub)}</p></div></div>
      <div class="filebar"><span>${esc(file)}</span>
        <span>SESSION ${st.session} &middot; SITTING ${st.sitting}</span>
        <span>${esc(right)}</span></div>`;
  }

  /* THE PRIME MINISTER'S HAND. It is the author's scan, cropped to its ink
     and baked to the page's colour by tools/inksig.js — the file is
     img/signature-ink.png. The reveal is a left-to-right clip
     (css/terminal.css .sig-armed/.sig-draw, bible 12.10), which needs no
     path, so nothing about the drawing can fragment it. SIG_IMG is the one
     place its size is declared; js/setpiece.js reads it, so the
     introduction's hand and the ceremony's are the same hand at the same
     size. Replace the scan with tools/inksig.js, never by hand. */
  const SIG_IMG = { src: "img/signature-ink.png", w: 228, h: 131 };


  /* THE HAND, AT ITS OWN SIZE. The wrapper is the clipper: it is the size
     of the drawing, and the clip opens from its left edge. */
  function sigIMG() {
    return `<span class="sigimg" style="width:${SIG_IMG.w}px;height:${SIG_IMG.h}px">` +
      `<img src="${SIG_IMG.src}" alt=""></span>`;
  }

  /* WHERE A BILL GOES. The register used to show the end state and nothing
     else, so "assented" arrived without the road that led to it and an act in
     force looked the same as one that had merely survived a division.

     The track is the engine's own STAGE_ORDER, not a copy: if a stage is added
     there this renders it without being touched. Terminal states are not
     positions on the track — struck, referred, defeated and withdrawn are ways
     of leaving it — so they are drawn as a branch off the end. */
  const STAGE_LABEL = {
    drafting:"Drafting", first_reading:"First reading", second_reading:"Second reading",
    committee:"Committee", report:"Report", third_reading:"Third reading",
    assent:"Assent", blocked:"Blocked"
  };
  const TERMINAL = {
    struck:    { label:"Struck on review", cls:"bad",  note:"Removed from the statute book. It cannot be revived; it must be brought again as a new bill." },
    defeated:  { label:"Defeated",         cls:"bad",  note:"Lost on division. The slot is spent." },
    withdrawn: { label:"Withdrawn",        cls:"bad",  note:"Pulled before division." },
    referred:  { label:"Referred",         cls:"warn", note:"With the constitutional court. It returns, struck or intact." },
    assented:  { label:"In force",         cls:"good", note:"Law. Its effects are live and stay live until amended or repealed by another act." }
  };

  function stageTrack(b, bs) {
    const order = (typeof Engine !== "undefined" && Engine.STAGE_ORDER) || [];
    const term = TERMINAL[bs.stage];
    /* How far it got: an assented act cleared the whole track. */
    const reached = bs.stage === "assented" ? order.length
                  : bs.stage === "awaiting_assent" ? order.indexOf("assent")
                  : order.indexOf(bs.stage) >= 0 ? order.indexOf(bs.stage)
                  : order.length - 1;

    const steps = order.map((sg, i) => {
      const state = i < reached ? "done" : i === reached ? "here" : "todo";
      return `<li class="${state}"><i></i><span>${STAGE_LABEL[sg] || sg}` +
             `${sg === Engine.DIVIDES_AT ? '<em>division</em>' : ""}</span></li>`;
    }).join("");

    return `<div class="track">
        <ol class="stagetrack">${steps}
          ${term ? `<li class="term ${term.cls}"><i></i><span>${term.label}</span></li>` : ""}
        </ol>
        ${term ? `<div class="trknote ${term.cls}">${term.note}</div>` : ""}
        ${bs.stage === "assented" && bs.assentedAt != null
          ? `<div class="trknote">Assented at sitting ${bs.assentedAt}. It sits in this register
             permanently; the Concordance carries what it changed.</div>` : ""}
      </div>`;
  }

  function actDoc(it) {
    const b = it.bill, bs = it.state;
    const assented = bs.stage === "assented";
    const struck = bs.stage === "struck";
    const referred = bs.stage === "referred";
    const pm = C.characterById[st.pm];

    let banner = "";
    if (referred) banner = `<div class="classif">Referred for constitutional review &mdash; ` +
      `returns sitting ${bs.returnsAt}</div>`;
    else if (struck) banner = `<div class="classif">Struck on review</div>`;
    else if (bs.stage === "defeated") banner = `<div class="classif">Defeated on division</div>`;
    else if (assented) banner = `<div class="classif" style="border-color:#3d5c33;color:#3d5c33">` +
      `Assented &mdash; in force</div>`;

    const body = `<h5>${esc(b.title)}</h5>
      <p>${esc(b.summary)}</p>
      ${b.effectNote ? `<p><i>${esc(b.effectNote)}</i></p>` : ""}
      <p>Test on division: <b>${b.dualMajority ? "dual majority" : "simple majority"}</b>.
      ${b.dualMajority ? "A measure touching life-support integrity or amending the Charter must " +
        "carry separately among functional and elected members." : ""}</p>`;

    /* The ceremony. Reserved for acts that needed more than a simple majority,
       drawn once, never repeated. */
    const ceremonial = assented && b.dualMajority;
    const already = drawn[it.id];
    const sig = ceremonial ? `<div class="sigblock">
        <div class="sigline"><div class="rule" style="height:${SIG_IMG.h}px">
          ${sigIMG()}</div>
          <div class="cap">${esc(pm ? pm.name.replace(/^Rt\. Hon\. /, "") : "The Prime Minister")}
            &middot; Prime Minister</div></div>
        <div class="stamp">Entered in registry<small>${esc(b.ref)} &middot; SITTING ${bs.assentedAt}</small></div>
      </div>` : assented ? `<div class="sigblock"><div class="sigline"><div class="cap">
          Assented without ceremony &mdash; simple majority</div></div>
        <div class="madestamp">Entered in registry<small>${esc(b.ref)} &middot; SITTING ${bs.assentedAt}</small></div>
      </div>` : "";

    return { html: `<div class="paper${ceremonial && !already ? " sig-armed" : ""}${ceremonial && already ? " sig-done" : ""}">
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth \u00b7 Anselm Ring",
             "FILE " + b.ref, "11 APR 2287")}
      ${banner}${stageTrack(b, bs)}${body}${sig}</div>`, ceremonial: ceremonial && !already };
  }

  /* A minute is signed and served. Signing is the decision — the distribution
     list is served the moment the pen leaves the paper, and who was on it
     becomes a fact about the world. */
  function minuteSignable(m) {
    return !st.signedMinutes || !st.signedMinutes[m.id];
  }

  function instrumentDoc(it) {
    const si = it.si, s = it.state;
    const post = (C.cabinetById || {})[si.author];
    const window = s.inForce && s.prayerCloses != null ? s.prayerCloses - st.sitting : null;
    const banner = s.revoked
      ? `<div class="classif">Revoked</div>`
      : `<div class="classif" style="border-color:#8a6d22;color:#8a6d22">` +
        `${si.procedure === "affirmative" ? "Affirmative" : "Negative"} procedure` +
        (window > 0 ? ` &mdash; prayable for ${window} more sittings` : "") + `</div>`;
    return { html: `<div class="paper">
      ${head("Office of the Minister for " + (post ? post.name : si.author.replace(/_/g, " ")),
             "Made under the Allocation Act and the Representation Act",
             si.number, "SITTING " + s.madeAt)}
      ${banner}
      <h5>${esc(si.title)}</h5>
      <p>${esc(si.summary)}</p>
      ${si.effect_note ? `<p><i>${esc(si.effect_note)}</i></p>` : ""}
      <p>${si.procedure === "affirmative"
        ? "This instrument requires the approval of the House before taking effect."
        : "This instrument took effect on being made. It stands unless the House prays " +
          "against it within " + (si.prayer_window || 6) + " sittings. A prayer requires a " +
          "simple majority of elected members only."}
      ${si.revocable ? " It may be revoked by a further instrument." : ""}</p>
      <div class="sigblock">
        <div class="sigline"><div class="rule" style="height:${SIG_IMG.h}px">
          ${sigIMG()}</div>
          <div class="cap">${esc(minister(si.author))} &middot; ${esc(postName(si.author))}</div></div>
        <div class="madestamp">Made<small>${esc(si.number)} &middot; SITTING ${s.madeAt}</small></div>
      </div></div>`, ceremonial: false, drawSig: true };
  }

  function minister(postId) {
    const p = st.cabinet[postId];
    if (!p || !p.holder) return "vacant";
    const ch = C.characterById[p.holder];
    return ch ? ch.name.replace(/^Rt\. Hon\. /, "") : p.holder.replace(/_/g, " ");
  }
  function postName(postId) {
    const p = (C.cabinetById || {})[postId];
    return p ? "Minister for " + p.name : postId.replace(/_/g, " ");
  }

  function minuteDoc(it) {
    const m = it.minute;
    const signed = st.signedMinutes && st.signedMinutes[m.id];
    const line = (label, v) => `<div class="row"><span>${label}</span><span>${v}</span></div>`;
    return { html: `<div class="paper">
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth \u00b7 Anselm Ring",
             "FILE " + m.file, "SITTING " + (m.sitting || st.sitting))}
      <div class="classif">${esc(m.classification || "Restricted: ministerial")}</div>
      <div class="distrib">
        ${line("FROM", esc(m.from))}
        ${line("TO", esc(m.to))}
        ${m.copy ? line("COPY", m.copy.map(esc).join(" &middot; ")) : ""}
        ${m.struck ? line("", m.struck.map(s => `<s>${esc(s)}</s>`).join(" &middot; ") +
            ` <i style="font-family:var(--f-ui);font-size:9px;letter-spacing:.06em">struck at drafting</i>`) : ""}
        ${m.notCopied ? line("NOT COPIED", m.notCopied.map(esc).join(" &middot; ")) : ""}
      </div>
      <h5>${esc(m.subject)}</h5>
      ${m.body.split(/\n\n+/).map(p => p.trim().startsWith("1.")
        ? `<ol>${p.split(/\n(?=\d+\.)/).map(x => `<li>${esc(x.replace(/^\d+\.\s*/, ""))}</li>`).join("")}</ol>`
        : `<p>${esc(p)}</p>`).join("")}
      <div class="sigblock">
        <div class="sigline"><div class="rule" style="height:${SIG_IMG.h}px">
          ${signed ? sigIMG() : ""}</div>
          <div class="cap">${esc(m.signedBy || "The Prime Minister")}</div></div>
        ${signed
          ? `<div class="madestamp">Served<small>${esc(m.file)} &middot; SITTING ${signed}</small></div>`
          : `<button class="btn signbtn" data-sign="${m.id}">Sign and serve</button>`}
      </div>
    </div>`, ceremonial: false, drawSig: !!signed };
  }

  /* ---------- render ---------- */

  function render(state, content) {
    st = state; C = content;
    const list = items();
    /* The register grows and shrinks with the state: an instrument that
       is revoked takes its row with it. If the chosen document is gone,
       choose the first one - seeded rather than set, because we are
       already inside the render it would otherwise trigger. */
    let sel = chosen();
    if (!list.some(i => i.id === sel)) {
      sel = list.length ? list[0].id : null;
      Focus.seed("pp-list", sel);
    }

    document.getElementById("pp-list").innerHTML = list.length ? list.map(i =>
      `<tr class="${i.id === sel ? "sel" : ""}" data-doc="${i.id}">
        <td>${esc(i.title)}<div class="note">${esc(i.ref)}</div></td>
        <td class="n"><span class="flag ${i.status === "assented" || i.status === "in force" ? "good"
          : ["struck", "revoked", "defeated"].includes(i.status) ? "bad" : ""}"
          data-tip="${i.kind === "minute" ? "minute" : i.kind === "instrument" ? "instrument" : "register"}"
          >${i.status}</span></td>
      </tr>`).join("")
      : `<tr><td class="note">The register is empty. Divisions and instruments appear here.</td></tr>`;

    document.getElementById("pp-list").querySelectorAll("[data-doc]").forEach(n =>
      n.addEventListener("click", () => Focus.activate("pp-list", n.dataset.doc)));

    /* THE BENCH (design/30). The orders are judged here, so the bench sits
       beside them: its disposition toward the government, the cases before it
       with the sitting each is due, and nothing to press. It is not elected and
       cannot be whipped, which is the whole reason it earns a panel. */
    const trib = document.getElementById("pp-tribunal");
    if (trib) trib.innerHTML = tribunalHTML();

    const it = list.find(i => i.id === sel);
    const box = document.getElementById("pp-doc");
    if (!it) { box.innerHTML = `<div class="pbody"><div class="note">Nothing selected.</div></div>`; return; }

    const doc = it.kind === "act" ? actDoc(it)
              : it.kind === "instrument" ? instrumentDoc(it) : minuteDoc(it);
    box.innerHTML = doc.html;

    box.querySelectorAll("[data-sign]").forEach(btn => btn.addEventListener("click", () => {
      st.signedMinutes = st.signedMinutes || {};
      st.signedMinutes[btn.dataset.sign] = st.sitting;
      const m = (C.minutes || []).find(x => x.id === btn.dataset.sign);
      if (m) {
        st.log.unshift({ sitting: st.sitting, text: "Minute signed and served: " + m.subject });
        if (m.onSign) Engine.apply(st, C, m.onSign);
      }
      delete drawn[btn.dataset.sign];
      if (onChange) onChange(); else render(st, C);
    }));

    /* Draw any signature on this document that has not been drawn before.
       The hand is the player's own, so it fires on the act rather than on
       arriving at the page. The clip needs no geometry, so the only
       condition is that there is a hand on the page to reveal. */
    if (doc.ceremonial || doc.drawSig) {
      const paper = box.querySelector(".paper");
      const wrap = box.querySelector(".sigimg");
      if (wrap && paper) {
        if (drawn[it.id]) paper.classList.add("sig-done");
        else {
          paper.classList.add("sig-armed");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            paper.classList.add("sig-draw");
            drawn[it.id] = true;
          }));
        }
      }
    }
  }

  function reset() { drawn = {}; Focus.seed("pp-list", null); }
  function onUpdate(fn) { onChange = fn; }

  /* SIG_IMG is exported so the set piece ends an introduction with the SAME
     hand that signs every Act — one scan, one size, drawn by two ceremonies
     as a clip reveal. */
  return { render, reset, onUpdate, stageTrack, SIG_IMG };
})();
