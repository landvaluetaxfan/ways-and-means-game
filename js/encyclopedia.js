/* =============================================================
   CONCORDANCE — generator and renderer.

   Hand-written articles live in content/encyclopedia.js. Everything
   else is GENERATED from the content that already exists, so a new
   party or station gets an article for free and no number in here
   can ever disagree with the game.

   Nothing in this file is game logic. It reads state; it never
   writes it.
   ============================================================= */

const Concordance = (function () {
  "use strict";

  let C, st, history = [];

  /* ---------- inline syntax: **emphasis** and [[id]] or [[id|shown text]] ---------- */
  /* ONE ESCAPE HELPER at module scope. It lived inside `renderHits`, so the
     article footer could not reach it. */
  const esc0 = t => String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function links(text) {
    return String(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                       .replace(/\*([^*]+)\*/g, "<em>$1</em>")
                       /* `[a-z0-9_-]`, because a term may contain a hyphen: the
                          glossary has write-off, and the old class stopped at the
                          hyphen and linked the first half of the word to an
                          article that does not exist — a red link in the game and
                          a broken reference in the checker, from the same fault. */
                       .replace(/\[\[([a-z0-9_-]+)(?:\|([^\]]+))?\]\]/gi, (m, id, label) => {
      const a = byId[id];
      return a
        ? `<a class="cx-link" tabindex="0" data-go="${id}">${label || a.title}</a>`
        : `<a class="cx-link cx-red" tabindex="0" data-go="${id}" title="This article does not exist.">${label || id}</a>`;
    });
  }

  function paras(text) {
    return String(text).split(/\n\n+/).map(p => `<p>${links(p)}</p>`).join("");
  }

  /* =============================================================
     THE REGISTER, WHICH IS WIKIPEDIA'S AND NOT A CAPTION'S.

     The hand-written articles had it and the generated ones did not, and
     that split is the whole of what "the Concordance does not read like an
     encyclopedia" meant. The Perigee Charter opens "The Perigee Charter is
     the founding document of the Circumterrestrial Commonwealth"; the party
     article opened "A party of the House of Delegates holding 82 of 280
     seats" -- a sentence with no subject in it, which is a caption under a
     photograph and not a lede.

     Four rules, applied by these four helpers everywhere:

     1. THE FIRST SENTENCE NAMES THE SUBJECT IN BOLD AND SAYS WHAT IT IS.
        `**X** is a Y.` Wikipedia does this without exception and it is the
        single most recognisable thing about the register.
     2. A VOLATILE FIGURE CARRIES ITS DATE. "Party discipline is recorded at
        62" is a fact about one sitting printed as though it were permanent.
     3. A VALUE IS RENDERED IN WORDS. js/schema.js holds the poles for
        exactly this reason and CLAUDE.md says so: "strongly public"
        and not "-0.75".
     4. AN ARTICLE ENDS IN ITS CATEGORIES, because a reference work says
        what kind of thing it has just described.
     ============================================================= */

  /* 1. THE LEDE. `rest` continues the sentence, so a caller writes the
     predicate and never the subject -- which is what stops a generator
     quietly going back to captions. */
  function lede(title, rest) {
    return `**${title}** ${rest}`;
  }

  /* 2. AS OF WHEN. Everything the engine can move gets this, and nothing
     that content froze does: a station's form is not "as of" anything. */
  function asOf(sentence) {
    return `As of sitting ${st.sitting}, ${sentence}`;
  }

  /* 3. A POSITION IN WORDS. Shared, because the party article had the only
        copy and the bill article printed raw numbers.

        It also COUNTS the axes rather than naming a number. The old line
        read "the four axes of Commonwealth politics" and then listed five,
        because the conversion from four categorical axes to five signed
        ones moved the data and left the prose. A sentence that states its
        own arity is a sentence that goes stale. */
  function axisProse(axes) {
    const poles = (typeof SCHEMA !== "undefined" && SCHEMA.vocab && SCHEMA.vocab.axes)
      ? SCHEMA.vocab.axes : {};
    const said = Object.keys(axes || {})
      .filter(k => axes[k] != null)
      .map(k => {
        const v = axes[k];
        if (typeof v !== "number") return k + ": " + v;
        const pl = poles[k];
        if (!pl) return k + ": " + v;
        const m = Math.abs(v);
        if (m < 0.15) return k + ": the centre";
        return k + ": " + (m >= 0.7 ? "strongly " : m >= 0.35 ? "" : "mildly ") +
               (v < 0 ? pl.low : pl.high);
      });
    return { count: said.length, line: said.join(" \u00b7 ") };
  }

  /* 4. WHAT KIND OF THING THIS IS. Wikipedia's categories, drawn from what
     the article already knows rather than typed a second time. */
  function categoriesOf(a) {
    const cats = [a.category];
    if (a.generated) cats.push("Articles maintained from Bureau returns");
    else cats.push("Articles maintained by contributors");
    if (a.edited && a.edited.attested === false) cats.push("Unattested articles");
    return cats.filter(Boolean);
  }

  /* A SECTION MAY WAIT FOR THE WORLD. The Concordance is supposed to be a
     live reference work and its hand-written articles were frozen text, so
     an article could not gain a paragraph when the thing it describes
     happened. A section carrying `when` is drawn only once the engine says
     that condition holds -- the same condition vocabulary events are gated
     on, evaluated by the same `Engine.matches`, so content authors one
     grammar and not two. */
  function liveSections(sections) {
    return (sections || []).filter(sec => {
      if (!sec.when) return true;
      try { return Engine.matches(st, sec.when); } catch (e) { return false; }
    });
  }

  /* ---------- offices, read from the content the game runs on ----------

     A person's `role` is a title somebody typed; the truth of who holds
     what is in the cabinet, in the parties and on the member. Derive the
     offices from those, so a recast in content cannot leave the
     Concordance describing a post the game does not recognise. */
  function officesOf(ch) {
    const out = [], seen = {};
    const add = (kind, label, title) => {
      if (!label || seen[label]) return;
      seen[label] = true;
      out.push({ kind: kind, label: label, title: title || label });
    };
    if (ch.id === st.pm) add("Government", "Prime Minister");
    (C.cabinet || []).forEach(p => {
      if (p.holder === ch.id) add("Ministry", p.name, p.title || "Minister for " + p.name);
    });
    if (ch.office === "opposition") add("House", "Leader of the Opposition");
    if (ch.office === "whip") add("House", "Chief Whip");
    if (ch.office === "shadow" && ch.role) add("House", ch.role);
    (C.parties || []).forEach(p => { if (p.leader === ch.id) add("Party", "Leader, " + p.name); });
    return out;
  }

  /* The one office that defines the person: a ministry or a House office
     first, then a party leadership, then nothing. */
  function mainOffice(offices) {
    return offices.find(o => o.kind === "Government" || o.kind === "Ministry" ||
                             o.kind === "House") || null;
  }

  /* How an office reads in prose, and in a wikibox row. */
  function officeLine(o) {
    return o.kind === "Ministry" ? "Holds the " + o.label + " portfolio."
         : o.kind === "Party" ? "Leads the party."
         : "Serves as " + o.label + ".";
  }

  /* ---------- generated articles ---------- */

  function partyArticle(p) {
    const seats = st.parties[p.id].seats;
    const total = Engine.partyTotal(st, p.id);
    const inGov = st.coalition.includes(p.id);
    const cs = st.confidenceSupply.includes(p.id);
    /* SIGNED AXES, AND NO LIST OF THEM. This named the old four and tested
       `p.axes[k] ?`, so after the conversion it printed nothing at all for
       every party — the names were gone and zero is falsy. It reads whatever
       dimensions the party declares, and says which end rather than the
       number: "public" and not "-0.75". The poles come from SCHEMA, which
       index.html loads for exactly this. */
    const ax = axisProse(p.axes);
    const axisLine = ax.line || "no settled position";

    /* The leader is a character id on the party, and the office is read
       from the same cabinet the game runs on — so the article can say
       whether the leader holds a portfolio, and never guesses. */
    const leader = p.leader && C.characterById ? C.characterById[p.leader] : null;
    const leadOffice = leader ? mainOffice(officesOf(leader)) : null;

    const currents = C.currents.filter(c => c.party === p.id);
    const sections = [
      /* THE AXES ARE COUNTED, NOT NAMED. "the four axes" was written when
         there were four and survived the conversion to five. */
      { h: "Position", body:
        (ax.count
          ? `The party's recorded position on the ${ax.count} axes of Commonwealth ` +
            `politics is ${axisLine}.`
          : "The party has no position recorded on any axis of Commonwealth politics.") },
      { h: "Representation", body:
        `${total} seats: ${seats.district} district, ${seats.list} list, ${seats.functional} functional. ` +
        (seats.district === 0 && seats.list > 0
          ? "The party holds no geographic constituency at all, a fact its opponents raise and it does not much dispute."
          : seats.functional > seats.district
          ? "The party holds more functional than district seats and does not contest most constituencies."
          : "") }
    ];
    if (leader) sections.push({ h: "Leadership", body:
      `Led by [[person_${leader.id}|${leader.name}]]. ` +
      (leadOffice ? officeLine(leadOffice) : "Holds no ministerial office.") });
    if (inGov) sections.push({ h: "In government", body:
      asOf(`the party sits in the governing coalition, and its discipline is ` +
           `recorded at ${st.parties[p.id].loyalty}.`) });
    else if (cs) sections.push({ h: "Confidence and supply", body:
      asOf(`the party sustains the government without holding office, and its ` +
           `discipline is recorded at ${st.parties[p.id].loyalty}.`) });
    if (currents.length) sections.push({ h: "Currents", body:
      `The party recognises ${currents.length} internal current` +
      (currents.length === 1 ? "" : "s") + ". " +
      asOf(currents.map(c =>
        `${c.name} numbers ${st.currents[c.id].members} members at a discipline of ` +
        `${st.currents[c.id].loyalty}`).join("; ") + ".") });

    return {
      id: p.id, title: p.name, category: "Parties", generated: true,
      banners: st.parties[p.id].loyalty < 25 && (inGov || cs) ? ["contested"] : [],
      edited: { by: "Concordance seat index", attested: true, note: "updated each division" },
      /* A LEDE, NOT A CAPTION. This read "A party of the House of Delegates
         holding 82 of 280 seats" -- a sentence with no subject in it. */
      summary: lede(p.name,
        `is a political party of the [[parliament|House of Delegates]]. ` +
        (p.aliases ? `It is known in the press as the ${p.aliases[0]}. ` : "") +
        asOf(`it holds ${total} of the ${Engine.chamberTotal(st)} seats in the ` +
             `chamber and ${inGov ? "sits in the governing coalition"
                          : cs ? "sustains the government on confidence and supply"
                               : "sits in opposition"}.`)),
      sections,
      infobox: { title: p.name, logo: p.logo || null, rows: [
        ["Leader", leader ? `[[person_${leader.id}|${leader.name}]]` : "None"],
        ["Leader's office", leader ? (leadOffice ? leadOffice.label : "No portfolio") : "\u2014"],
        ["Seats", String(total)],
        ["District", String(seats.district)],
        ["List", String(seats.list)],
        ["Functional", String(seats.functional)],
        ["Status", inGov ? "Coalition" : cs ? "Confidence and supply" : "Opposition"]
      ]},
      see: leader ? ["person_" + leader.id] : []
    };
  }

  function stationArticle(s0) {
    const s = st.stations[s0.id];
    const sections = [
      { h: "Representation", body:
        `Returns ${s.seats} members across ${(C.constituencies||[]).filter(k=>k.station===s.id).length} ` +
        `constituencies. ` +
        (s.type === "bundled"
          ? `The seat bundles ${s.settlements} settlements, which share a delegation and very little else.`
          : s.type === "external"
          ? "An external constituency. Returns late, and knows it."
          : "") },
      { h: "Closure", body:
        `Closure ratio ${s.closure.toFixed(2)}. ` +
        (s.closure < 0.4
          ? "Below the threshold at which a station can survive an interruption of federal consumables for a season."
          : s.closure > 0.8
          ? "High enough that the station's obligations to the union are a matter of choice rather than necessity."
          : "Within the band where the union holds.") +
        `\n\n${s.dependency}` },
      { h: "Grievance", body: s.grievance },
      { h: "Suspended population", body:
        `${s.suspended.toLocaleString()} residents are held in [[suspension]], counted for ` +
        `[[apportionment|apportionment]] and unable to vote. Attestation stands at ` +
        `${(s.attested * 100).toFixed(1)} per cent of the adult roll.` }
    ];
    return {
      id: s.id, title: s.name, category: "Stations", generated: true,
      banners: s.closure < 0.35 ? ["contested"] : [],
      edited: { by: "Census Bureau returns", attested: true, note: "" },
      summary: lede(s.name,
        `is an orbital habitat of the ${s.band} band of the Circumterrestrial ` +
        `Commonwealth. It has a population of ${s.population.toLocaleString()} and ` +
        `returns ${s.seats} member${s.seats === 1 ? "" : "s"} to the ` +
        `[[parliament|House of Delegates]].`),
      sections,
      infobox: { title: s.name, rows: [
        ["Band", s.band], ["Population", s.population.toLocaleString()],
        ["Seats", String(s.seats)],
        ["Constituencies", String((C.constituencies||[]).filter(k=>k.station===s.id).length)],
        ["Closure", s.closure.toFixed(2)],
        ["Suspended", s.suspended.toLocaleString()],
        ["Attested", (s.attested * 100).toFixed(1) + "%"]
      ]},
      see: ["suspension"]
    };
  }

  /* A SEAT, AND THE PERSON WHO HOLDS IT (design/26 #87). There were articles
     for fifty-four characters and thirty stations and NOTHING for the 141
     constituencies, so a member could be found by name in the Concordance and
     the place they sat for could not be found at all. Generated from the
     constituency's own record, which has carried a description, a tendency and
     an electorate since the roll was written and had no reader. */
  function constituencyArticle(k) {
    const s0 = (C.stations || []).find(x => x.id === k.station);
    const s = st.stations[k.station] || {};
    const party = Object.keys(k.held || {}).sort((a, b) =>
      (k.held[b] || 0) - (k.held[a] || 0))[0] || null;
    const pName = id => {
      const p = (C.parties || []).find(x => x.id === id);
      return p ? p.name : String(id).replace(/_/g, " ");
    };
    const sections = [];
    if (k.description) sections.push({ h: "The seat", body: k.description });
    if (k.tendency) sections.push({ h: "How it votes", body: k.tendency });
    sections.push({ h: "Returns", body:
      `Magnitude ${k.magnitude}, on a roll of ${(k.electorate || 0).toLocaleString()}. ` +
      (k.at_large ? "Elected at large: the whole station is the constituency. " : "") +
      (party ? `Held by [[${party}|${pName(party)}]]. ` : "") +
      `The recorded material interests are ${(k.material_interest || [])
        .map(x => String(x).replace(/_/g, " ")).join(", ") || "none recorded"}.` });
    return {
      id: k.id, title: k.name + (k.at_large ? " (at large)" : ""),
      category: "Constituencies", generated: true,
      banners: [], edited: { by: "Census Bureau returns", attested: true, note: k.parent || "" },
      summary: lede(k.name,
        `is an electoral district of ${s0 ? `[[${s0.id}|${s0.name}]]` : "the Commonwealth"}. ` +
        `It returns ${k.magnitude} member${k.magnitude === 1 ? "" : "s"} to the ` +
        `[[parliament|House of Delegates]]` +
        `${k.member ? `, and is held by ${k.member}` : ""}.`),
      sections,
      infobox: { title: k.name, rows: [
        ["Station", s0 ? s0.name : k.station],
        ["Band", k.band || ""],
        ["Magnitude", String(k.magnitude)],
        ["Electorate", (k.electorate || 0).toLocaleString()],
        ["Member", k.member || "\u2014"],
        ["Held by", party ? pName(party) : "\u2014"]
      ]},
      see: [k.station, party].filter(Boolean)
    };
  }

  /* AN ANCHOR, from the world data: where it stands, whose soil that is, and
     which station depends on it. Every number is read from content. */
  function anchorArticle(a) {
    const st0 = (C.stations || []).find(x => x.id === a.station);
    const hostState = ((C.world || {}).states || {})[a.host] || {};
    const rows = [["Site", a.site], ["Host", a.host]];
    if (a.formal) rows.push(["Instrument", a.formal]);
    if (st0) rows.push(["Serves", st0.name]);
    rows.push(["Held by", a.mine ? (a.leased ? "the Commonwealth, leased" : "the Commonwealth") : "a foreign power"]);
    return {
      id: "anchor_" + a.id, title: a.tether, category: "Anchors", generated: true,
      banners: [], edited: { by: "Committee on Trade and the Anchors", attested: true, note: "" },
      summary: lede(a.tether,
        `is an orbital elevator with its base at ${a.site}, on the territory of ` +
        `${a.host}. ` + (st0 ? `It serves [[${st0.id}|${st0.name}]]. ` : "") +
        (a.mine ? "Its concession is held by the Commonwealth."
                : "Its concession is held by a foreign power.")),
      sections: [
        { h: "The base", body: `A tether's base must be equatorial, stable and able to give a ` +
          `corridor, which is why the dozen are where they are and not wherever the traffic is. ` +
          `This one stands at ${a.site}.` },
        hostState.note ? { h: "The host", body: hostState.note } : null,
        (a.mine ? { h: "The concession", body: "Held by the Commonwealth" +
          (a.leased ? ", on a lease rather than a grant, which is why it is the one the " +
            "Commonwealth holds outright." : ".") } : null)
      ].filter(Boolean),
      infobox: { title: a.tether, rows: rows },
      see: [a.station, a.host].filter(Boolean)
    };
  }

  /* A FOREIGN BODY: the Works, and anything else that is outside the
     Commonwealth and on the campaign's table. */
  function foreignBodyArticle(b) {
    return {
      id: "body_" + b.id, title: b.name, category: "The Earth", generated: true,
      banners: ["contested"], edited: { by: "multiple", attested: true, note: "the charter is not public" },
      summary: lede(b.name,
        `is a body outside the jurisdiction of the Circumterrestrial ` +
        `Commonwealth.`) + (b.note ? " " + b.note : ""),
      sections: [
        { h: "The charter", body: b.charter || "" },
        { h: "The operator", body: `Operated by [[actor_${b.operator}|${b.operator}]].` },
        b.grievance ? { h: "Grievance", body: b.grievance } : null,
        { h: "The numbers", body: `Population ${(b.population || 0).toLocaleString()}, ` +
          `workforce ${(b.workforce || 0).toLocaleString()}, closure ${(b.closure || 0).toFixed(2)}, ` +
          `${(b.suspended || 0).toLocaleString()} suspended. It returns no members and is not in the ` +
          `apportionment, because it is not a station of the Commonwealth.` }
      ].filter(Boolean),
      infobox: { title: b.short || b.name, rows: [
        ["Population", (b.population || 0).toLocaleString()],
        ["Workforce", (b.workforce || 0).toLocaleString()],
        ["Closure", (b.closure || 0).toFixed(2)],
        ["Suspended", (b.suspended || 0).toLocaleString()],
        ["Operator", b.operator]
      ]},
      see: ["actor_" + b.operator].concat(b.interests || [])
    };
  }

  /* A POWER OUTSIDE THE COMMONWEALTH. It is an actor in the engine, so its
     standing and appetite are live; the article is generated from them. */
  function foreignActorArticle(a) {
    return {
      id: "actor_" + a.id, title: a.name, category: "The Earth", generated: true,
      banners: [], edited: { by: "Foreign Office", attested: true, note: "as of the last dispatch" },
      summary: lede(a.name,
        `is a power outside the Circumterrestrial Commonwealth` +
        (a.lag ? `, whose business reaches the chamber ${a.lag} sitting` +
                 `${a.lag === 1 ? "" : "s"} after it is sent` : "") + `.`) +
        (a.note ? " " + a.note : ""),
      sections: [
        a.asks ? { h: "What it wants", body: a.asks } : null,
        { h: "Delay", body: a.lag
          ? `Eleven sittings of lag would be extreme and this is ${a.lag}. Everything the ` +
            `Commonwealth hears from it is ${a.lag} sitting${a.lag === 1 ? "" : "s"} old, which is ` +
            `the organising fact of the relationship.`
          : `Its news is nearly current.` }
      ].filter(Boolean),
      infobox: { title: a.name, rows: [
        ["Kind", a.kind], ["Delay", (a.lag || 0) + " sittings"]
      ]},
      see: ["commonwealth"]
    };
  }

  function billArticle(b) {    const bs = st.bills[b.id], d = Engine.division(st, C, b.id);
    const sections = [{ h: "Provisions", body: b.summary }];
    if (b.effectNote) sections.push({ h: "Estimated effect", body: b.effectNote });
    sections.push({ h: "Division forecast", body:
      `Among elected members, ${d.popular.aye} of ${d.popular.total} against a requirement of ` +
      `${d.popular.need}. ` +
      (b.dualMajority
        ? `Among functional members, ${d.functional.aye} of ${d.functional.total} against a ` +
          `requirement of ${d.functional.need}. The measure is subject to the ` +
          `[[dual_majority|dual test]] and must carry separately on both benches.`
        : "The measure requires a simple majority of the House of Delegates.") +
      `\n\nOn present numbers the bill ${d.carries ? "carries" : "fails"}.` });
    return {
      id: "bill_" + b.id, title: b.title, category: "Legislation", generated: true,
      banners: bs.dead ? [] : ["contested"],
      edited: { by: "Order paper", attested: true, note: b.ref },
      summary: lede(b.title,
        `is a bill before the [[parliament|House of Delegates]]` +
        (b.owner && C.partyById[b.owner] ? `, brought by the ` +
          `[[${b.owner}|${C.partyById[b.owner].name}]]` : "") + `. ` +
        asOf(`it stands at ${String(bs.stage).replace(/_/g, " ")}` +
             `${bs.dead ? " and has fallen" : ""}.`)),
      sections,
      infobox: { title: b.ref, rows: [
        ["Stage", String(bs.stage).replace(/_/g, " ")],
        ["Test", b.dualMajority ? "Dual majority" : "Simple majority"],
        ["Elected bench", d.popular.aye + " / " + d.popular.need],
        ["Functional bench", b.dualMajority ? d.functional.aye + " / " + d.functional.need : "n/a"],
        ["Forecast", d.carries ? "Carries" : "Fails"]
      ]},
      see: b.dualMajority ? ["dual_majority", "functional_constituency"] : []
    };
  }

  function termArticle(g) {
    return {
      id: "term_" + g.term.toLowerCase().replace(/\s+/g, "_"),
      title: g.term.charAt(0).toUpperCase() + g.term.slice(1),
      category: "Definitions", generated: true, banners: ["stub"],
      edited: { by: "unattributed", attested: true, note: "" },
      summary: lede(g.term, `is a term of Commonwealth politics. ` + g.gloss),
      sections: g.handle ? [{ h: "", body: g.handle }] : [],
      see: []
    };
  }

  function personArticle(ch) {
    const offices = officesOf(ch);
    const isPM = ch.id === st.pm;
    const party = ch.party ? C.partyById[ch.party] : null;
    const fc = ch.functional && C.functionalById ? C.functionalById[ch.functional] : null;

    /* THE LEDE FOLLOWS THE OFFICE, NOT A TYPED TITLE. A minister is
       described by the post the cabinet says they hold, so a recast
       cannot leave the article calling a minister a backbencher. */
    /* A LEDE, AND A SENTENCE. This built a fragment -- "Prime Minister;
       Leader, Party of Socialists and Democrats. Sits for First Spin." --
       with no subject and no verb in it. Wikipedia's form is "X is a Y who
       has served as Z", and it is worth the few extra words because it is
       the thing that makes a page read as an encyclopedia entry. */
    const lead = mainOffice(offices);
    const partyOffice = offices.find(o => o.kind === "Party");
    const seatPhrase = fc ? `the ${fc.name} functional constituency`
                     : ch.seat ? ch.seat : null;
    let summary = lede(ch.name, "is a Commonwealth politician");
    if (party) summary += ` of the [[${party.id}|${party.name}]]`;
    if (seatPhrase) summary += `, sitting for ${seatPhrase}`;
    summary += ".";
    if (lead) summary += ` ${asOf(`they serve as ${lead.title}.`)}`;
    else if (partyOffice) summary += ` ${asOf(`they are ${partyOffice.label}.`)}`;
    else summary += " They hold no ministerial office.";

    const sections = [];
    /* `ch.note` IS NOT PRINTED, and that is the point of this pass. The
       character notes are the AUTHOR'S design notes -- "Liabilities, not
       buffs. Her record is the thing that can be dug up", "This is the
       sharpest tool in the game", "which nobody has yet told him" -- and
       they were being printed verbatim into an in-world encyclopedia as
       the article's first paragraph. An encyclopedia does not know it is
       in a game, and it never addresses the reader. What an automatically
       maintained article can honestly say is what the registry knows, so
       that is what it says now, and it stays true through a reshuffle
       because every word of it is derived. */
    if (offices.length > 1) sections.push({ h: "Offices", body:
      `They hold ${offices.length} recorded offices: ` +
      offices.map(o => o.label).join("; ") + "." });
    if (isPM) sections.push({ h: "Government", body:
      asOf(`the government they lead commands ${Engine.confidence(st)} of ` +
           `${Engine.chamberTotal(st)} seats, against a majority of ` +
           `${Engine.majority(st)}.`) });

    const rows = [];
    if (party) rows.push(["Party", party.name]);
    if (fc) rows.push(["Constituency", fc.name + " (functional)"]);
    else if (ch.seat) rows.push(["Seat", ch.seat]);
    if (offices.length) {
      rows.push(["", "Offices held", "head"]);
      offices.forEach(o => rows.push([o.kind, o.label]));
    }

    return {
      id: "person_" + ch.id, title: ch.name, category: "Persons", generated: true,
      banners: isPM ? ["contested"] : [],
      edited: { by: "multiple", attested: true, note: isPM ? "elevated sourcing requirements apply" : "" },
      summary: summary,
      sections: sections,
      infobox: rows.length ? { title: ch.name, rows: rows } : null,
      see: ch.party ? [ch.party] : []
    };
  }

  /* ---------- assembly ---------- */

  let all = [], byId = {};

  function build() {
    const hand = ENCYCLOPEDIA.articles.map(a => Object.assign({ generated: false }, a));
    const handIds = new Set(hand.map(a => a.id));
    const gen = [];
    C.parties.forEach(p => { if (!handIds.has(p.id)) gen.push(partyArticle(p)); });
    C.stations.forEach(s => { if (!handIds.has(s.id)) gen.push(stationArticle(s)); });
    (C.constituencies || []).forEach(k => {
      if (!handIds.has(k.id)) gen.push(constituencyArticle(k));
    });
    /* A BILL THAT HAS NOT BEEN INTRODUCED HAS NO ARTICLE.

       This generated one for every bill in content unconditionally, so the
       four that open in `drafting` -- the Almanac Works (Annexation) Bill
       among them -- had a full page in the Concordance from the first
       sitting, complete with a division forecast, for a measure nobody had
       laid before the House. The page even said so and contradicted itself
       doing it: "A measure before the House of Delegates. Stage: drafting."

       `drafting` is the engine's own word for not introduced (it is
       STAGE_ORDER[0]: it cannot be given a day and prorogation does not
       kill it), so it is the right line to draw. The Concordance is an
       in-world reference work and it can only know what the world knows.
       Everything past first reading keeps its article, including a bill
       that died -- that one existed.

       This is the general shape of the fault the author named: content is
       authored for the whole campaign and the reference surfaces read the
       whole of content, so anything staged for later shows up at sitting
       one. The gate belongs on the surface rather than in the content,
       because the content is right -- the bill SHOULD be there, in
       drafting, waiting for `f1_dilemma` to set it down. */
    C.bills.forEach(b => {
      const bs = st.bills[b.id];
      if (!bs || bs.stage === "drafting") return;
      if (!handIds.has("bill_" + b.id)) gen.push(billArticle(b));
    });
    C.characters.forEach(c => { if (!handIds.has("person_" + c.id)) gen.push(personArticle(c)); });
    (C.glossary || []).forEach(g => {
      const id = "term_" + g.term.toLowerCase().replace(/\s+/g, "_");
      if (!handIds.has(id) && !handIds.has(g.term.toLowerCase())) gen.push(termArticle(g));
    });
    /* THE WORLD (design/29). The anchors, the states and the foreign bodies
       are content now, so they get articles like everything else — generated,
       so no number in an article can disagree with the game. The four Earth
       powers and Cordell also answer to their actor id, which is how the
       foreign panel links to them. */
    const W = C.world || {};
    (W.anchors || []).forEach(a => {
      if (!handIds.has("anchor_" + a.id)) gen.push(anchorArticle(a));
    });
    (W.foreign || []).forEach(b => {
      if (!handIds.has("body_" + b.id)) gen.push(foreignBodyArticle(b));
    });
    (C.actors || []).filter(a => a.foreign).forEach(a => {
      if (!handIds.has("actor_" + a.id)) gen.push(foreignActorArticle(a));
    });
    all = hand.concat(gen);
    byId = all.reduce((m, a) => (m[a.id] = a, m), {});
    /* alias hand-written ids that generated ones also answer to */
    all.forEach(a => { if (a.id.startsWith("term_")) byId[a.id.slice(5)] = byId[a.id.slice(5)] || a; });
  }

  /* ---------- render ---------- */

  function render(state, content, articleId, push) {
    st = state; C = content; build();
    const a = byId[articleId] || byId.perigee_charter || all[0];
    if (push && history[history.length - 1] !== a.id) history.push(a.id);
    if (!history.length) history.push(a.id);
    const b = document.getElementById("cx-back");
    if (b) b.disabled = history.length < 2;
    drawNav(a);
    drawArticle(a);
  }

  /* WHICH CATEGORIES ARE OPEN. The nav listed every article in every
     category at once — around two hundred and forty links in a 186px
     column, so finding anything meant scrolling past nine categories you
     were not looking for. The categories collapse now, and the one holding
     the article you are reading opens itself.

     `null` means "not yet decided", which is how the FIRST render knows to
     open the current article's category without that counting as a choice
     the reader made. After that the set is theirs. */
  let openCats = null;

  /* THE CATEGORIES THAT START CLOSED, and it is a decision rather than a
     rule about size — though size is how you can tell. The hand-written
     categories run to five articles each and are what the Concordance is
     FOR: they explain the institutions, the franchise and the law. The
     generated ones are a catalogue. Measured:

         Constituencies  141      Institutions             5
         Persons          54      Economy                  4
         Stations         35      Personhood               3
         Definitions      27      Elections                2
         The Earth        15      Constitutional theory    1
         Parties          12      History                  1

     So everything an author wrote is open on arrival — about twenty-eight
     links — and the six catalogues are a heading you open when you want a
     particular seat or a particular person. Listing all two hundred and
     eighty at once is what the collapse was added to stop.

     Parties is a catalogue by construction and open anyway: twelve of them,
     and which party is which is the thing a reader of this game looks up
     most. */
  const CLOSED = new Set(["Constituencies", "Persons", "Stations",
                          "Definitions", "The Earth", "Anchors"]);

  function toggleCat(k) {
    if (!openCats) openCats = new Set();
    if (openCats.has(k)) openCats.delete(k); else openCats.add(k);
    return true;
  }

  function drawNav(current) {
    const cats = {};
    all.forEach(a => (cats[a.category] ||= []).push(a));
    const order = ["Institutions", "Constitutional theory", "Elections", "Legislation",
                   "Economy", "Personhood", "History", "Parties", "Stations",
                   "Constituencies", "The Earth", "Anchors", "Persons", "Definitions"];
    const keys = Object.keys(cats).sort((x, y) => {
      const ix = order.indexOf(x), iy = order.indexOf(y);
      return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
    });
    /* Follow the reader: navigating into a collapsed category opens it, so a
       cross-reference from the Chamber tab never lands on a nav that does not
       show where you are. */
    if (!openCats) openCats = new Set(keys.filter(k => !CLOSED.has(k)));
    if (current && current.category) openCats.add(current.category);

    document.getElementById("cx-nav").innerHTML = keys.map(k => {
      const open = openCats.has(k), n = cats[k].length;
      return `<div class="cx-navcat${open ? " open" : ""}" tabindex="0" data-cxcat="${k.replace(/"/g, "&quot;")}">` +
        `<span class="cx-cat-car" aria-hidden="true">${open ? "\u2212" : "+"}</span>` +
        `${k}<span class="cx-cat-n">${n}</span></div>` +
        (open ? cats[k].sort((p, q) => p.title.localeCompare(q.title)).map(a =>
          `<a class="cx-navlink${a.id === current.id ? " on" : ""}" tabindex="0" data-go="${a.id}">${a.title}` +
          (a.generated ? "" : " <em>&sect;</em>") + `</a>`).join("") : "");
    }).join("");
  }

  function drawArticle(a) {
    const banners = (a.banners || []).map(b => {
      const def = ENCYCLOPEDIA.banners[b]; if (!def) return "";
      return `<div class="cx-banner cx-${def.cls}">${def.text}</div>`;
    }).join("");

    const info = a.infobox ? `<aside class="cx-infobox">` +
      (a.infobox.flag ? `<img class="cx-flag" src="img/logos/${a.infobox.flag}" alt="">` : "") +
      (a.infobox.logo ? `<img class="cx-logo" src="img/logos/${a.infobox.logo}" alt="">` : "") +
      `<h4>${a.infobox.title}</h4><table>` +
      a.infobox.rows.map(r => r[2] === "head"
        ? `<tr class="cx-infohead"><th colspan="2">${r[1]}</th></tr>`
        : `<tr><th>${r[0]}</th><td>${links(r[1])}</td></tr>`).join("") +
      `</table></aside>` : "";

    /* RESOLVED ONCE. A section gated on `when` must be filtered before
       either the contents list or the body is built, or the two disagree
       about what the article contains and the contents list points at a
       heading that is not there. */
    const secs = liveSections(a.sections);
    const toc = secs.filter(s => s.h).length > 1
      ? `<nav class="cx-toc"><b>Contents</b><ol>` +
        secs.filter(s => s.h).map((s, i) => `<li><a tabindex="0" data-anchor="cx-s${i}">${s.h}</a></li>`).join("") +
        `</ol></nav>` : "";

    const body = secs.map((s, i) =>
      (s.h ? `<h3 id="cx-s${i}">${s.h}</h3>` : "") + paras(s.body)).join("");

    const see = (a.see || []).filter(id => byId[id]);
    const seeAlso = see.length
      ? `<h3>See also</h3><ul class="cx-see">${see.map(id =>
          `<li><a class="cx-link" tabindex="0" data-go="${id}">${byId[id].title}</a></li>`).join("")}</ul>` : "";

    const ed = a.edited || {};
    const foot = `<div class="cx-foot">` +
      `Last edited by <b>${ed.by || "unattributed"}</b> ` +
      `<span class="cx-att ${ed.attested === false ? "n" : "y"}">${ed.attested === false ? "UNATTESTED" : "ATTESTED"}</span>` +
      (ed.note ? ` &middot; ${ed.note}` : "") +
      `<br>${a.generated ? "This article is maintained automatically from Bureau returns." : "This article is maintained by contributors."}</div>` +
      /* CATEGORIES. Wikipedia closes every article with what kind of thing
         it has just described, and the Concordance closed with nothing.
         Derived from what the article already knows, so nothing is typed
         twice and a recategorised article cannot leave a stale footer. */
      `<div class="cx-cats"><b>Categories</b>` +
      categoriesOf(a).map(c => `<span>${esc0(c)}</span>`).join("") + `</div>`;

    document.getElementById("cx-article").innerHTML =
      `<h2 class="cx-title">${a.title}</h2>` +
      `<div class="cx-from">From the ${ENCYCLOPEDIA.meta.title}, ${ENCYCLOPEDIA.meta.tagline}</div>` +
      banners + info +
      `<div class="cx-lede">${paras(a.summary)}</div>` +
      toc + body + seeAlso + `<div style="clear:both"></div>` + foot;

    bind();
  }

  function bind() {
    /* [data-go] IS NOT BOUND HERE. It used to be, and js/ui.js also had a
       delegated capture listener for the same links, so one click ran the
       whole render twice - measured with a calibrated MutationObserver:
       two wholesale replacements of #cx-nav per click. Navigation belongs
       to the delegated handler in ui.js, which is also what the keyboard
       reaches through Focus. One path. */
    document.querySelectorAll("#cx-body [data-anchor]").forEach(n =>
      n.addEventListener("click", () => {
        const t = document.getElementById(n.dataset.anchor);
        if (t) t.scrollIntoView({ block: "start", behavior: "smooth" });
      }));
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return null;
    const hit = all.find(a => a.title.toLowerCase() === q)
             || all.find(a => a.title.toLowerCase().startsWith(q))
             || all.find(a => a.title.toLowerCase().includes(q))
             || all.find(a => (a.summary || "").toLowerCase().includes(q));
    return hit ? hit.id : null;
  }

  /* EVERY MATCH, NOT THE BEST ONE (design/26 #87). The search returned a
     single article — the first whose title matched — so a player looking for
     "Concord" got the bill, or the seat, or neither, and had no way to ask
     which. It returns every match now, ranked by how it matched, and the
     screen shows the list. The list is written into the article pane so the
     delegated [data-go] handler that every other cross-reference uses opens
     the one that was meant. */
  function hits(q) {
    q = String(q || "").trim().toLowerCase();
    if (!q) return [];
    const rank = a => {
      const t = a.title.toLowerCase(), s = (a.summary || "").toLowerCase();
      if (t === q) return 0;
      if (t.startsWith(q)) return 1;
      if (t.includes(q)) return 2;
      if (s.includes(q)) return 3;
      return 4;
    };
    return all.map(a => ({ a: a, r: rank(a) }))
      .filter(x => x.r < 4)
      .sort((x, y) => x.r - y.r || x.a.title.localeCompare(y.a.title))
      .slice(0, 40).map(x => x.a);
  }

  /* THE RESULTS GO WHERE AN ARTICLE GOES, which is `#cx-article` and NOT
     `#cx-body`. `#cx-article` is `#cx-body`'s only child, so writing the
     list into the body DESTROYED the element every article render targets:
     `drawArticle` then set `.innerHTML` on null and threw, and the
     Concordance became a one-way trip. Measured after one search: the nav
     links, the search hits themselves and the BACK BUTTON were all dead,
     because all three end at the same `goCx`.

     It read as working from outside, which is how it survived. `drawNav`
     runs before `drawArticle` in `render`, so the nav redrew and the
     highlight moved -- the interface said it had navigated and the page
     under it never changed. A search is a page like any other; it belongs
     in the container that holds pages. */
  function renderHits(list, q) {
    document.getElementById("cx-article").innerHTML =
      `<h2 class="cx-title">Search</h2>` +
      `<p class="cx-lead">${list.length} article${list.length === 1 ? "" : "s"} ` +
      `matching <b>${esc0(q)}</b>.</p>` +
      `<ul class="cx-hits">` + list.map(a =>
        `<li><a class="cx-link" tabindex="0" data-go="${esc0(a.id)}">${esc0(a.title)}</a>` +
        `<span class="cx-hitsc">${esc0(a.category)}${a.generated ? "" : " &middot; written"}</span></li>`
      ).join("") + `</ul>`;
  }

  function back() {
    if (history.length < 2) return null;
    history.pop();
    return history[history.length - 1];
  }

  /* WHAT HAS AN ARTICLE. js/ui.js has called this since the day it stopped
     keeping its own whitelist of parties, stations and hand-written pages --
     and it was never written here, so the guard it is called behind
     (`Concordance.knows ? Concordance.knows(id) : false`) answered false for
     everything and EVERY [data-go] outside the Concordance tab did nothing.
     A party name on the Chamber tab, a station on the orbit table, a
     constituency in the roll: all inert, which is the exact fault the
     comment there says the attribute exists to fix. A truthy guard around a
     function that does not exist is how it stayed quiet.

     It answers off `byId`, so it is the same list the nav draws from and a
     link it offers can never land on a page that is not there -- including
     the bills gated out above. */
  function knows(id) {
    if (!id || !st || !C) return false;
    build();
    return !!byId[id];
  }

  return { render, search, hits, renderHits, back, toggleCat, knows };
})();
