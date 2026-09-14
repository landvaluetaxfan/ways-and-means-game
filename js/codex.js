/* =============================================================
   ENCYCLOPEDIA RENDERER
   -------------------------------------------------------------
   Builds the article set at runtime: hand-written entries from
   content/encyclopedia.js, plus generated ones for every party,
   station, character, bill and glossary term.

   Generated articles read LIVE STATE, so seat counts and division
   forecasts in the encyclopedia are always current and can never
   contradict the game.
   ============================================================= */

const Codex = (function () {
  "use strict";

  let st, C, current = null, history = [];

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- article assembly ---------- */

  function build() {
    const arts = {};
    const put = a => { if (!arts[a.id]) arts[a.id] = a; };

    // hand-written first: they win over generated versions
    (C.encyclopedia.articles || []).forEach(a => put(Object.assign({ written: true }, a)));

    C.parties.forEach(p => put(genParty(p)));
    C.stations.forEach(s => put(genStation(s)));
    C.characters.forEach(c => put(genCharacter(c)));
    C.bills.forEach(b => put(genBill(b)));
    (C.glossary || []).filter(g => !g.assumed).forEach(g => put(genTerm(g)));

    return arts;
  }

  function genParty(p) {
    const s = st.parties[p.id].seats;
    const tot = Engine.partyTotal(st, p.id);
    const inGov = st.coalition.includes(p.id);
    const cs = st.confidenceSupply.includes(p.id);
    const axisLine = ["ownership", "personhood", "sovereignty", "closure"]
      .map(k => p.axes[k] ? `${k}: ${p.axes[k]}` : null).filter(Boolean).join(" · ");
    const currents = C.currents.filter(c => c.party === p.id);
    return {
      id: p.id, title: p.name, category: "Parties", generated: true,
      infobox: { rows: [
        ["Seats", `${tot} of ${Engine.chamberTotal(st)}`],
        ["District", s.district], ["List", s.list], ["Functional", s.functional],
        ["Status", inGov ? "In government" : cs ? "Confidence and supply" : "Opposition"],
        ...(p.aliases ? [["Also called", p.aliases.join(", ")]] : [])
      ]},
      summary: p.note,
      sections: [
        { h: "Position", body: axisLine || "The party has no settled position on the four axes, " +
          "which its opponents describe as opportunism and its members as breadth." },
        { h: "Representation", body:
          `The party holds ${s.district} district seats, ${s.list} list seats and ` +
          `${s.functional} functional seats. ` +
          (s.district === 0 && s.list > 0
            ? "It contests no constituency successfully and exists entirely on the list tier, " +
              "a fact its opponents raise frequently."
            : s.functional > s.district
            ? "It holds more functional seats than district seats, and cannot be removed from " +
              "the chamber by any ordinary election."
            : "Its strength is in the districts, which gives its members local bases and " +
              "opinions of their own.") },
        ...(currents.length ? [{ h: "Internal currents", body:
          currents.map(c => `${c.name} (${st.currents[c.id].members} members)`).join(". ") + "." }] : [])
      ],
      see: currents.length ? [] : []
    };
  }

  function genStation(s0) {
    const s = st.stations[s0.id];
    const over = s.apportionment_ratio > 1;
    return {
      id: s.id, title: s.name, category: "Habitats", generated: true,
      infobox: { rows: [
        ["Band", s.band], ["Type", s.type === "bundled" ? `bundled, ${s.settlements} settlements` : s.type],
        ["Population", s.population.toLocaleString()], ["Seats", s.seats],
        ["Apportionment", s.apportionment_ratio.toFixed(2)],
        ["Closure", s.closure.toFixed(2)],
        ["Suspended", s.suspended.toLocaleString()],
        ["Attested", (s.attested * 100).toFixed(1) + "%"]
      ]},
      summary: `A habitat of the ${s.band} band, returning ${s.seats} member${s.seats === 1 ? "" : "s"} ` +
               `to the House of Delegates.`,
      sections: [
        { h: "Representation", body:
          `Its apportionment ratio of ${s.apportionment_ratio.toFixed(2)} means it is ` +
          `${over ? "over" : "under"}represented relative to population. ` +
          (over ? "Redistricting proposals are unpopular here for reasons its members do not state plainly."
                : "Its members raise redistricting at every opportunity.") },
        { h: "Closure", body:
          `Closure stands at ${s.closure.toFixed(2)}. ` +
          (s.closure < 0.4 ? "The habitat cannot sustain its material cycle without imports and would " +
            "fail within weeks of an interruption. Federal investment raising this figure would also, " +
            "in time, fund its capacity to leave."
           : s.closure > 0.8 ? "It is close to self-sufficient and can credibly discuss its own terms."
           : "It is dependent but not desperate, which is the most common condition in the Commonwealth.") },
        { h: "Dependency", body: s.dependency },
        { h: "Grievance", body: s.grievance }
      ],
      see: []
    };
  }

  function genCharacter(c0) {
    const c = st.characters[c0.id];
    const rel = c.relationship;
    return {
      id: c0.id, title: c0.name, category: "Persons", generated: true,
      portrait: c0.portrait,
      infobox: { rows: [
        ["Office", c0.role],
        ...(c0.party ? [["Party", (C.partyById[c0.party] || {}).name || c0.party]] : []),
        ...(c0.seat ? [["Seat", c0.seat]] : [])
      ]},
      summary: c0.note,
      sections: [
        { h: "Relations with the government", body:
          rel >= 70 ? "Cordial, and remarked upon."
          : rel >= 40 ? "Correct, without warmth."
          : rel >= 20 ? "Cold. Both offices describe the relationship as professional."
          : "Openly poor. Neither office has troubled to deny it." }
      ],
      see: c0.party ? [c0.party] : []
    };
  }

  function genBill(b) {
    const bs = st.bills[b.id], d = Engine.division(st, C, b.id);
    return {
      id: "bill_" + b.id, title: b.title, category: "Legislation", generated: true,
      banners: b.dualMajority ? ["contested"] : [],
      infobox: { rows: [
        ["Reference", b.ref], ["Stage", bs.dead ? "Withdrawn" : bs.stage.replace(/_/g, " ")],
        ["Test", b.dualMajority ? "Dual majority" : "Simple majority"],
        ["Popular", `${d.popular.aye} / ${d.popular.total} (need ${d.popular.need})`],
        ...(b.dualMajority ? [["Functional", `${d.functional.aye} / ${d.functional.total} (need ${d.functional.need})`]] : [])
      ]},
      summary: b.summary,
      sections: [
        ...(b.effectNote ? [{ h: "Effect", body: b.effectNote }] : []),
        { h: "Prospects", body:
          d.carries ? "On present numbers the measure carries."
          : b.dualMajority && d.popular.carries
            ? "On present numbers the measure carries among elected members and fails among " +
              "functional ones. It is therefore lost, and the arithmetic that loses it cannot be " +
              "altered by any general election."
            : "On present numbers the measure fails." }
      ],
      see: b.dualMajority ? ["dual_majority", "functional_constituency"] : []
    };
  }

  function genTerm(g) {
    return {
      id: "term_" + g.term.toLowerCase().replace(/\s+/g, "_"),
      title: g.term.charAt(0).toUpperCase() + g.term.slice(1),
      category: "Terms", generated: true,
      summary: g.gloss,
      sections: g.handle ? [{ h: "In plainer terms", body: g.handle }] : [],
      see: []
    };
  }

  /* ---------- linking ---------- */

  function linkify(html, arts, selfId) {
    const targets = Object.values(arts)
      .map(a => ({ id: a.id, title: a.title }))
      .filter(t => t.id !== selfId)
      .sort((a, b) => b.title.length - a.title.length);
    const done = new Set();
    targets.forEach(t => {
      if (done.has(t.id)) return;
      const re = new RegExp("(?<![\\w>])(" + t.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![\\w<])", "i");
      if (!re.test(html)) return;
      html = html.replace(re, m => `<a class="wl" data-go="${t.id}">${m}</a>`);
      done.add(t.id);
    });
    return html;
  }

  /* ---------- render ---------- */

  function render(id) {
    const arts = build();
    current = arts[id] ? id : "perigee_charter";
    const a = arts[current];
    const E = C.encyclopedia;

    // index
    const cats = {};
    Object.values(arts).forEach(x => (cats[x.category] ||= []).push(x));
    const order = ["Institutions", "Constitutional theory", "Elections", "Legislation",
                   "Parties", "Persons", "Habitats", "Personhood", "History", "Terms"];
    const catKeys = Object.keys(cats).sort((x, y) => {
      const i = order.indexOf(x), j = order.indexOf(y);
      return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
    });
    document.getElementById("codex-index").innerHTML = catKeys.map(k =>
      `<div class="wcat">${esc(k)}</div>` +
      cats[k].sort((p, q) => p.title.localeCompare(q.title)).map(x =>
        `<a class="wl wnav${x.id === current ? " on" : ""}" data-go="${x.id}">${esc(x.title)}</a>`
      ).join("")).join("");

    // article
    const banners = (a.banners || []).map(b => {
      const B = E.banners[b]; if (!B) return "";
      return `<div class="wbanner ${B.cls}">${esc(B.text)}</div>`;
    }).join("");

    const infobox = a.infobox ? `<aside class="winfo">` +
      `<div class="winfo-h">${esc(a.title)}</div>` +
      (a.portrait ? `<div class="winfo-img"><img class="dith" src="img/portraits/${a.portrait}" alt=""
         onerror="this.closest('.winfo-img').remove()"></div>` : "") +
      `<table>${a.infobox.rows.map(([k, v]) =>
        `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table></aside>` : "";

    const secs = (a.sections || []).filter(s => s.body).map(s =>
      (s.h ? `<h3>${esc(s.h)}</h3>` : "") +
      s.body.split(/\n\n/).map(p => `<p>${esc(p)}</p>`).join("")).join("");

    const toc = (a.sections || []).filter(s => s.h).length > 1
      ? `<nav class="wtoc"><b>Contents</b><ol>` +
        a.sections.filter(s => s.h).map(s => `<li>${esc(s.h)}</li>`).join("") + `</ol></nav>` : "";

    const see = (a.see || []).filter(x => arts[x]).length
      ? `<h3>See also</h3><ul class="wsee">` +
        a.see.filter(x => arts[x]).map(x => `<li><a class="wl" data-go="${x}">${esc(arts[x].title)}</a></li>`).join("") +
        `</ul>` : "";

    const ed = a.edited || {};
    const foot = `<div class="wfoot">` +
      `<div>Category: <a class="wl" data-go="${current}">${esc(a.category)}</a></div>` +
      `<div>Last edited sitting ${st.sitting}${ed.by ? " by " + esc(ed.by) : ""}` +
      (ed.attested === false ? ` <span class="watt n">unattested</span>` :
       ed.attested === true ? ` <span class="watt y">attested</span>` : "") +
      (ed.note ? ` &middot; ${esc(ed.note)}` : "") + `</div>` +
      (a.generated ? `<div class="wgen">Assembled from Registry records. Figures update automatically.</div>` : "") +
      `</div>`;

    const bodyHtml = linkify(secs + see, arts, current);

    document.getElementById("codex-article").innerHTML =
      `<h1>${esc(a.title)}</h1>` +
      `<div class="wsub">From the ${esc(E.meta.title)}, ${esc(E.meta.tagline)}</div>` +
      banners + infobox +
      `<p class="wlede">${esc(a.summary || "")}</p>` +
      toc + bodyHtml + foot;

    document.querySelectorAll("#s-codex .wl").forEach(n =>
      n.addEventListener("click", () => { history.push(current); render(n.dataset.go); }));
    document.getElementById("codex-back").disabled = !history.length;
    document.getElementById("codex-scroll").scrollTop = 0;
  }

  function search(q) {
    const arts = build();
    q = q.trim().toLowerCase();
    if (!q) { render(current); return; }
    const hits = Object.values(arts).filter(a =>
      a.title.toLowerCase().includes(q) || (a.summary || "").toLowerCase().includes(q));
    document.getElementById("codex-article").innerHTML =
      `<h1>Search</h1><div class="wsub">${hits.length} article${hits.length === 1 ? "" : "s"} matching “${esc(q)}”</div>` +
      (hits.length ? `<ul class="wsee">` + hits.map(a =>
        `<li><a class="wl" data-go="${a.id}">${esc(a.title)}</a>: <span class="note">${esc(a.summary || "")}</span></li>`
      ).join("") + `</ul>` : `<p>Nothing found. The Concordance is incomplete on many subjects, some of them deliberately.</p>`);
    document.querySelectorAll("#codex-article .wl").forEach(n =>
      n.addEventListener("click", () => { history.push(current); render(n.dataset.go); }));
  }

  function boot(state, content) {
    st = state; C = content;
    document.getElementById("codex-search").addEventListener("input", e => search(e.target.value));
    document.getElementById("codex-back").addEventListener("click", () => {
      if (history.length) render(history.pop());
    });
    render("perigee_charter");
  }

  return { boot, render: id => render(id), refresh: () => render(current || "perigee_charter") };
})();
