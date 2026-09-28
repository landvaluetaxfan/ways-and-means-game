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
        exactly this reason and LESSONS.md says so: "strongly public"
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
    return `As of ${today()}, ${sentence}`;
  }
  /* THE CONCORDANCE COUNTS IN DATES (design/55). A reader in 2080 has a
     calendar, not a sitting number. */
  function dayOf(sitting) { return longDate(Engine.dateOfSitting(C, sitting)); }
  function today() { return dayOf(st.sitting); }

  /* 3. A POSITION IN WORDS. Shared, because the party article had the only
        copy and the bill article printed raw numbers.

        It also COUNTS the axes rather than naming a number. The old line
        read "the four axes of Commonwealth politics" and then listed five,
        because the conversion from four categorical axes to five signed
        ones moved the data and left the prose. A sentence that states its
        own arity is a sentence that goes stale. */
  /* 3a. A POSITION AS POLICY (design/45). This printed the pole's own
     word, "closurist", which PROSE.md calls the shorthand leaking
     out; it says what the party supports and opposes now, in SCHEMA's
     `says`, grouped by how strongly. `null` is no position and is left out;
     a position near zero is the centre, and is said as such. */
  function andList(xs) {
    return xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
  }
  function policyProse(axes, who) {
    const A = (typeof SCHEMA !== "undefined" && SCHEMA.vocab && SCHEMA.vocab.axes) ? SCHEMA.vocab.axes : {};
    const bands = { strong: [], plain: [], mild: [] }, centre = [];
    let count = 0;
    Object.keys(axes || {}).forEach(k => {
      const v = axes[k], a = A[k];
      if (v == null || typeof v !== "number" || !a || !a.says) return;
      count++;
      const m = Math.abs(v);
      if (m < 0.15) { centre.push(a.topic || k); return; }
      const end = v < 0 ? "low" : "high";
      bands[m >= 0.7 ? "strong" : m >= 0.35 ? "plain" : "mild"]
        .push({ verb: (a.verb && a.verb[end]) || "supports", obj: a.says[end] });
    });
    const ADV = { strong: "strongly ", plain: "", mild: "mildly " }, clauses = [];
    ["strong", "plain", "mild"].forEach(b => ["supports", "opposes"].forEach(vb => {
      const objs = bands[b].filter(x => x.verb === vb).map(x => x.obj);
      if (objs.length) clauses.push(ADV[b] + vb + " " + andList(objs));
    }));
    let text = clauses.length ? who + " " + (clauses.length < 3 ? andList(clauses)
      : clauses.slice(0, -1).join(", ") + ", and " + clauses[clauses.length - 1]) + "." : "";
    if (centre.length) text += (text ? " It" : who) + " takes the centre on " + andList(centre) + ".";
    return { count: count, text: text };
  }

  /* 3b. WHAT A LOYALTY MEANS. A figure carries its scale (design/45): out of
     100, and the share of a bench that votes with the party on a whipped
     vote, from the engine's one formula. */
  /* READ AS 2080 WOULD (design/55): small counts in words, a party with its
     article, and a current's loyalty as the press would describe it rather
     than as a meter out of 100. */
  const NUM = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
               "ten", "eleven", "twelve"];
  function count(n, one, many) {
    return (n <= 12 ? NUM[n] : n.toLocaleString()) + " " + (n === 1 ? one : (many || one + "s"));
  }
  /* "The Liberal Party", "Home Rule": a name built on a common noun takes
     the article, a name that is itself a slogan does not */
  function theName(name) {
    return /^The /.test(name) || !/\b(Party|Alliance|Association|Independents|Union|League|Front|Movement)\b/.test(name)
      ? name : "The " + name;
  }
  function currentMood(l) {
    return l >= 70 ? "loyal to the leadership" : l >= 50 ? "mostly loyal to the leadership"
         : l >= 30 ? "restive" : "openly at odds with the leadership";
  }
  function loyaltyText(l) {
    const holds = Engine.holdsOnWhip ? Math.round(Engine.holdsOnWhip(l) * 100) : null;
    return `${l} of 100` + (holds != null ? `: on a whipped vote about ${holds} of every 100 of its members vote with the party` : "");
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
  /* HISTORY AND STATE (design/55). `since` is history: drawn from the day
     its condition first held and ever after, dated by the engine's record,
     and `{date}` in its prose is that day. `while` (or the older `when`) is
     state: drawn only while its condition holds. Neither is standing text,
     which is true on the opening day and needs no mark. */
  function sinceOf(cond) { return cond && Engine.since ? Engine.since(st, C, cond) : null; }
  function holds(cond) {
    if (!cond) return true;
    try { return Engine.matches(st, cond); } catch (e) { return false; }
  }
  function liveSections(sections) {
    return (sections || []).filter(Boolean).filter(sec =>
      sec.since ? sinceOf(sec.since) != null : holds(sec.while || sec.when)
    ).map(sec => {
      if (!sec.since) return sec;
      const dated = sinceOf(sec.since);
      return Object.assign({}, sec, { dated: dated,
        body: String(sec.body || "").replace(/\{date\}/g, dayOf(dated)) });
    });
  }
  /* a banner is an id, or {id, since} or {id, while}: an article is marked
     contested once there is a dispute, not from the opening */
  function liveBanners(banners) {
    return (banners || []).filter(b => typeof b === "string" ||
      (b && (b.since ? sinceOf(b.since) != null : holds(b.while || b.when))))
      .map(b => typeof b === "string" ? b : b.id);
  }
  /* WHAT CHANGED, AND WHEN: the article's revision record. The day the
     article appeared, if it did not exist at the opening, and each history
     section, in order. The opening's own text is not a revision. */
  const OPENING = 1;
  function revisionsOf(a) {
    const revs = [];
    if (a.appeared > OPENING) revs.push({ sitting: a.appeared, what: "article created" });
    liveSections(a.sections).forEach(s0 => {
      if (s0.dated > OPENING) revs.push({ sitting: s0.dated, what: s0.h || "the lead" });
    });
    return revs.sort((x, y) => x.sitting - y.sitting);
  }
  /* WHAT HAPPENED TO IT IN THIS PARLIAMENT (design/55): the engine's
     chronicle, the log entries `about` this party or person, oldest first,
     each dated. History, so it counts as a revision on the day of the
     latest entry. */
  function chronicleOf(id) {
    const es = (st.log || []).filter(e => e.cx && (e.about || []).indexOf(id) >= 0).reverse();
    if (!es.length) return null;
    return { h: "In this Parliament", dated: es[es.length - 1].sitting,
             body: es.map(e => `On ${dayOf(e.sitting)} ${e.cx}.`).join(" ") };
  }
  function unread(a) {
    return a.revised > OPENING && a.revised > ((st.cxRead || {})[a.id] || 0);
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
      /* who holds it NOW: the save's cabinet, since a minister can be
         dismissed or resign; content's holder is only who held it at the
         opening */
      const live = st.cabinet && st.cabinet[p.id] ? st.cabinet[p.id].holder : p.holder;
      if (live === ch.id) add("Ministry", p.name, p.title || "Minister for " + p.name);
    });
    if (ch.office === "opposition") add("House", "Leader of the Opposition");
    if (ch.office === "whip") add("House", "Chief Whip");
    if (ch.office === "shadow" && ch.role) add("House", ch.role);
    /* a junior minister (the Financial Secretary) holds office without a
       cabinet post, and said "no ministerial office" until design/45 */
    if (ch.office === "minister" && ch.role && !out.some(o => o.title === ch.role))
      add("Government", ch.role);
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
    const pol = policyProse(p.axes, "The party");

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
        (pol.count ? pol.text : "The party has no recorded position on the questions that divide the House.") },
      { h: "Representation", body:
        (() => {
          const kinds = [["district", seats.district], ["list", seats.list], ["functional", seats.functional]]
            .filter(x => x[1] > 0).map(x => `${x[1]} ${x[0]}`);
          return total ? `It holds ${count(total, "seat")}: ${andList(kinds)}. ` : "It holds no seats. ";
        })() +
        (seats.district === 0 && seats.list > 0
          ? "The party holds no geographic constituency at all, a fact its opponents raise and it does not much dispute."
          : seats.functional > seats.district
          ? "The party holds more functional than district seats and does not contest most constituencies."
          : "") }
    ];
    if (leader) sections.push({ h: "Leadership", body:
      `Led by [[person_${leader.id}|${leader.name}]]. ` +
      (leadOffice ? officeLine(leadOffice) : "Holds no ministerial office.") });
    /* LOYALTY, WITH ITS SCALE AND WHAT IT DOES (design/45). This said "its
       discipline is recorded at 48": a figure with no scale, under a second
       name for what every screen calls loyalty. */
    /* and since design/55 without the meter: what it does on a whipped vote */
    const holds = Engine.holdsOnWhip ? Math.round(Engine.holdsOnWhip(st.parties[p.id].loyalty) * 100) : null;
    const loyal = holds != null ? `On a whipped vote about ${holds} of every 100 of its members vote with the party.` : "";
    if (inGov) sections.push({ h: "In government", body:
      `The party is a member of the governing coalition and holds office in the Cabinet. ` + loyal });
    else if (cs) sections.push({ h: "Confidence and supply", body:
      `The party sustains the government on votes of confidence and on the budget, ` +
      `without holding office. ` + loyal });
    else sections.push({ h: "In opposition", body: `The party sits in opposition. ` + loyal });
    /* A current's name is a position ("Hard Left") or a seat ("Homestead
       A"), neither of which takes a verb as a subject, so each paragraph
       leads with the name and its figures and then says what it is. A
       current has no article of its own (the author, 23 Sep); this is
       where it is described, in content's own words. */
    if (currents.length) sections.push({ h: "Currents", body:
      `The party recognises ${count(currents.length, "internal current")}. ` +
      asOf("they stand as follows.") + "\n\n" +
      (Engine.currentSeats(st, C, p.id) || []).map(c => {
        const d = (currents.find(x => x.id === c.id) || {}).description;
        return `**${c.name}** (${count(c.seats, "member")}, ${currentMood(c.loyalty)}).` +
               (d ? " " + d : "");
      }).join("\n\n") });

    /* THE PARTY OUTSIDE PARLIAMENT, moved here from the Party tab, which is
       about the government's dealings with the other parties and not a
       directory of each (the author, 23 Sep). No mechanic hangs off any of
       it; it is somewhere to look, and this is where things are looked up. */
    const org = (C.partyOrg || {})[p.id] || {};
    const offs = org.officers || [], bods = org.bodies || [], brs = org.branches || [];
    if (offs.length || bods.length) sections.push({ h: "Organisation", body:
      offs.map(o => `**${o.name}**, ${o.role.charAt(0).toLowerCase() + o.role.slice(1)}. ${o.note}`)
        .concat(bods.map(b => `**${b.name}** (${b.kind}, affiliated). ${b.note}`)).join("\n\n") });
    if (brs.length) sections.push({ h: "Branches", body:
      `The party keeps ${brs.length} branch${brs.length === 1 ? "" : "es"}.\n\n` +
      brs.map(br => {
        const s0 = (C.stations || []).find(x => x.id === br.station);
        return `**${s0 ? `[[${s0.id}|${s0.name}]]` : br.station}**. ${br.note}`;
      }).join("\n\n") });

    /* EVERY MEMBER, NOT JUST THE CAST, the way the Party tab listed them:
       Engine.benchRoll seats the whole House as a division does, so the
       same member carries the same name here as in a roll call. */
    const bench = (rollOf() || {})[p.id] || { popular: [], functional: [] };
    const all = bench.popular.concat(bench.functional);
    if (all.length) {
      const RANK = { district: 1, functional: 2, list: 3 };
      const TIER = { district: "district", list: "list", functional: "functional" };
      const named = {};
      (C.characters || []).forEach(c => { named[c.name] = c; });
      const rows = all.slice().sort((a, b) =>
        (RANK[a.tier] || 9) - (RANK[b.tier] || 9) ||
        String(a.seat || "").localeCompare(String(b.seat || "")) ||
        String(a.name || "").localeCompare(String(b.name || "")))
        .map(m => {
          const ch = named[m.name];
          const off = ch ? mainOffice(officesOf(ch)) : null;
          return [ch ? `[[person_${ch.id}|${m.name}]]` : m.name,
                  m.seat || "\u2014", TIER[m.tier] || m.tier || "", off ? off.label : ""];
        });
      sections.push({ h: "Members", body:
        asOf(`the party has ${all.length} member${all.length === 1 ? "" : "s"} in ` +
             `[[parliament|Parliament]].`),
        table: { head: ["Member", "Seat", "Tier", "Office"], rows: rows } });
    }
    const hist = chronicleOf(p.id);
    if (hist) sections.push(hist);

    return {
      id: p.id, title: p.name, category: "Parties", generated: true,
      banners: st.parties[p.id].loyalty < 25 && (inGov || cs) ? ["contested"] : [],
      edited: { by: "Concordance seat index", attested: true, note: "updated each division" },
      /* A LEDE, NOT A CAPTION. This read "A party of the House of Delegates
         holding 82 of 280 seats" -- a sentence with no subject in it. */
      summary: lede(theName(p.name),
        `is a political party in [[parliament|Parliament]]. ` +
        /* the party's own note says what it is and who it speaks for */
        (p.note ? p.note + " " : "") +
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
    const nDistricts = (C.constituencies || []).filter(k => k.station === s.id).length;
    /* in the Bureau's own words: a closure ratio is a fact a reader of 2080
       knows how to read (the Commonwealth article defines it) */
    const sections = [
      { h: "Self-sufficiency", body:
        `Its [[closure|closure ratio]] is ${s.closure.toFixed(2)}: it can sustain ` +
        `${Math.round(s.closure * 100)} per cent of its material cycle without imports. ` +
        (s.closure < 0.4
          ? "That is below the level at which a station can survive a season without federal consumables."
          : s.closure > 0.8
          ? "That is high enough to make its membership of the union a matter of choice."
          : "That is within the range in which membership of the union is a necessity.") },
      { h: "Profile", body:
        (s.dependency ? `**Principal dependency.** ${s.dependency}` : "") +
        (s.grievance ? `\n\n**Principal grievance.** ${s.grievance}` : "") },
      { h: "Suspended population", body:
        `${s.suspended.toLocaleString()} residents are held in [[suspension|suspension]], counted for ` +
        `[[apportionment|apportionment]] and unable to vote. ` +
        `${Math.round(s.attested * 100)} per cent of its adults are attested.` }
    ];
    return {
      id: s.id, title: s.name, category: "Stations", generated: true,
      banners: s.closure < 0.35 ? ["contested"] : [],
      edited: { by: "Census Bureau returns", attested: true, note: "" },
      summary: lede(s.name,
        `is an orbital habitat of the Circumterrestrial Commonwealth, in its ${s.band} band, ` +
        `with ${s.population.toLocaleString()} residents. It returns ` +
        `${count(s.seats, "member")} to [[parliament|Parliament]]` +
        (s.type === "external" ? " as an external constituency" : nDistricts > 1 ? ` from ${count(nDistricts, "district")}` : "") +
        "." + (s.type === "bundled" ? ` Its seat joins ${count(s.settlements || 0, "settlement")}, which share a delegation and little else.` : "")),
      sections,
      infobox: { title: s.name, rows: [
        ["Altitude band", s.band], ["Population", s.population.toLocaleString()],
        ["Members", String(s.seats)],
        ["Districts", String(nDistricts)],
        ["Closure ratio", s.closure.toFixed(2)],
        ["In suspension", s.suspended.toLocaleString()],
        ["Attested", Math.round(s.attested * 100) + "%"]
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
    if (k.description) sections.push({ h: "The seat", body: Engine.seatText(C, k, k.description) });
    if (k.tendency) sections.push({ h: "How it votes", body: Engine.seatText(C, k, k.tendency) });
    /* the roll, the member and the interests are in the lead, the infobox
       and "How it votes"; a closing line of returns said them a third time */
    if (k.at_large) sections.push({ h: "Election", body:
      "The district is elected at large: the whole station is one constituency." });
    /* WHO HOLDS IT is the engine's answer (`seatMember`), the one the seat's
       own prose is filled from. `k.member` is the backbencher the roll was
       drafted with, and where a roster character sits for the seat it names
       somebody who is not in the world: thirty-seven articles said so in
       their lede and infobox while the prose under them named the
       character (design/45). */
    const holder = (C.characters || []).find(c => c.seat === k.name);
    const member = Engine.seatMember(C, k);
    return {
      id: k.id, title: k.name + (k.at_large ? " (at large)" : ""),
      category: "Constituencies", generated: true,
      banners: [], edited: { by: "Census Bureau returns", attested: true, note: "" },
      summary: lede(k.name,
        `is an electoral district of ${s0 ? `[[${s0.id}|${s0.name}]]` : "the Commonwealth"}. ` +
        `It returns ${count(k.magnitude, "member")} to ` +
        `[[parliament|Parliament]]` +
        `${member ? `, and is held by ${holder ? `[[person_${holder.id}|${member}]]` : member}` : ""}.`),
      sections,
      infobox: { title: k.name, rows: [
        ["Station", s0 ? s0.name : k.station],
        ["Altitude band", k.band || ""],
        ["Members", String(k.magnitude)],
        ["Electorate", (k.electorate || 0).toLocaleString()],
        ["Member", member || "\u2014"],
        ["Held by", party ? pName(party) : "\u2014"]
      ]},
      see: [k.station, party].filter(Boolean)
    };
  }

  /* AN ANCHOR, from the world data: where it stands, whose soil that is, and
     which station depends on it. Every number is read from content. */
  function anchorArticle(a) {
    const st0 = (C.stations || []).find(x => x.id === a.station);
    /* BY CODE, NOT BY NAME. The states are keyed "KEN" and this looked up
       "Kenya", so "The host" section never appeared on any anchor's page: the
       same fault the globe had, found again on 24 Sep. */
    const hostState = ((C.world || {}).states || {})[a.iso] || {};
    /* A foreign body names the anchor it hangs from (the Almanac Works, on
       the International), so the anchor can say what it serves. */
    const bodies = ((C.world || {}).foreign || []).filter(b => b.anchor === a.id);
    const served = (st0 ? [`[[${st0.id}|${st0.name}]]`] : [])
      .concat(bodies.map(b => `[[body_${b.id}|${b.name}]]`));
    const rows = [["Site", a.site], ["Host", a.host]];
    if (a.formal) rows.push(["Instrument", a.formal]);
    if (st0 || bodies.length) rows.push(["Serves", (st0 ? [st0.name] : []).concat(bodies.map(b => b.short || b.name)).join(", ")]);
    rows.push(["Held by", a.mine ? (a.leased ? "the Commonwealth, leased" : "the Commonwealth") : "a foreign power"]);
    return {
      id: "anchor_" + a.id, title: a.tether, category: "Anchors", generated: true,
      banners: [], edited: { by: "Committee on Trade and the Anchors", attested: true, note: "" },
      summary: lede(a.tether,
        `is an orbital elevator with its base at ${a.site}, on the territory of ` +
        `${a.host}. ` + (served.length ? `It serves ${served.join(" and ")}. ` : "") +
        (a.mine ? "Its concession is held by the Commonwealth."
                : "Its concession is held by a foreign power.")),
      sections: [
        { h: "The base", body: `A tether's base has to be close to the equator, on stable ground, ` +
          `with room for a climber corridor. This one stands at ${a.site}.` },
        hostState.note ? { h: "The host", body: hostState.note } : null,
        (a.mine ? { h: "The concession", body: a.leased
          ? "Held by the Commonwealth on a lease from the host state, and operated by the Commonwealth."
          : "Held by the Commonwealth." } : null)
      ].filter(Boolean),
      infobox: { title: a.tether, rows: rows },
      see: [a.station, a.host].filter(Boolean)
    };
  }

  /* A LENDER (24 Sep). The standing lenders are content with terms --
     `setup.lenders.<id>.terms` -- and each is a document the Commonwealth
     signed, so each has an article: what it is, who is in it and for how
     much, how its rate is built, and what is drawn and at what rate NOW,
     from the engine, so the page cannot disagree with the account. Only a
     lender with `terms` is written up: the Alliance's facility is a
     campaign's, and exists only once its story makes it. */
  function lenderArticle(id, L) {
    const T = L.terms || {};
    const title = T.title || L.facility || L.name || id;
    const parties = L.parties || [];
    const lead = parties[0];
    const num = n => Number(n).toLocaleString();
    /* in the lender's own money: Earth's banks lend in US dollars */
    const cur = n => Engine.money ? Engine.money(C, n, L.currency) : num(n);
    const pc = r => Number(r).toFixed(2);
    const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight",
                   "nine", "ten", "eleven", "twelve"];
    const nWord = n => words[n] || String(n);
    const owed = Engine.debtOf(st, id);
    const rate = Engine.debtRate(st, C, id);
    const room = Engine.lenderCap(st, C, id);
    const r = L.rate || {};
    const up = t => t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
    const rows = [["Type", up(T.type || T.kind)],
                  ["Borrower", "The Circumterrestrial Commonwealth"],
                  [parties.length === 1 ? "Lender" : "Lenders", String(parties.length)],
                  lead ? ["Lead", lead.name] : null,
                  T.registrar ? ["Registrar", up(T.registrar)] : null,
                  L.currency ? ["Currency", L.currency] : null,
                  ["Amount", cur(L.cap)],
                  ["Drawn", cur(owed)],
                  ["Rate", pc(rate) + " per cent"],
                  T.signed ? ["Signed", T.signed] : null,
                  T.maturity ? ["Maturity", T.maturity] : null].filter(x => x && x[1]);
    const pricing = (r.fixed != null)
      ? { h: "Pricing", body: `The rate is fixed at ${pc(r.fixed)} per cent.` }
      : { h: "Pricing", body:
          (T.reference && T.margin
            ? `Interest is charged at the reference rate, ${T.reference}, plus a margin of ${T.margin}. `
            : "") +
          (r.policy ? `The rate is ${pc(r.base || 0)} per cent over the Reserve Bank's ` +
                      `cash rate, and each step below adds to it while its condition holds.`
                    : `The rate is ${pc(r.base == null ? 4 : r.base)} per cent at its lowest, and each ` +
                      `step below adds to it while its condition holds.`),
          /* THE STEPS IN FORCE, not the whole grid (design/55): a step
             that has not happened is the future, and the agreement's own
             description of its grid is `terms.grid` */
          table: { head: ["In force", "Added"],
                   rows: (r.steps || []).filter(x => holds(x.when)).map(x => [x.label ? x.label.charAt(0).toUpperCase() + x.label.slice(1) : "", "+" + pc(x.add || 0)]) } };
    if (T.grid) pricing.body += " " + T.grid;
    return {
      id: "lender_" + id, title: title, category: "Economy", generated: true,
      banners: [], edited: { by: "the Treasury", attested: true, note: "" },
      summary: lede(title, (T.plural ? "are " : "is ") + (T.kind || "a loan to the Commonwealth") +
        (parties.length
          ? `, with commitments of ${cur(L.cap)} from ${nWord(parties.length)} ` +
            `${parties.length === 1 ? "lender" : "lenders"}` +
            (lead ? ` led by ${lead.prose || lead.name}` : "")
          : `, up to ${cur(L.cap)}`) + "." +
        (T.summary ? " " + T.summary : "")),
      sections: [
        { h: "Use", body: asOf((owed ? `${cur(owed)} is outstanding`
                                     : "nothing is outstanding") +
            `, and the rate is ${pc(rate)} per cent.`) +
            (room.cap < L.cap ? ` Drawing is limited: ${room.why}.` : "") },
        parties.length ? { h: T.partiesHead || "The lenders", body: "",
          table: { head: ["Lender", "Seat", "Role", "Commitment"],
                   rows: parties.map(p => [p.name, p.seat || "", p.role || "", cur(p.commitment || 0)]) } } : null,
        pricing
      ].concat(liveSections(T.sections)).filter(Boolean),
      infobox: { title: title, rows: rows },
      see: T.see || []
    };
  }

  /* A FOREIGN BODY: the Works, and anything else that is outside the
     Commonwealth and on the campaign's table. */
  function foreignBodyArticle(b) {
    /* THE OPERATOR BY ITS ACTOR'S ID. `b.operator` is a name ("Cordell") and
       the actor's id is `metanationals`, so the link and the see-also both
       pointed at an article that does not exist. */
    const op = (C.actors || []).find(x => x.name === b.operator || x.id === b.operator);
    const opLink = op ? `[[actor_${op.id}|${b.operator}]]` : b.operator;
    const anc = ((C.world || {}).anchors || []).find(x => x.id === b.anchor);
    /* AN OPERATOR CAN LEAVE (design/55): `abandoned` is the condition under
       which it has, and the infobox stops naming it from that day */
    const gone = b.abandoned ? sinceOf(b.abandoned) : null;
    const n = x => (x || 0).toLocaleString();
    return {
      id: "body_" + b.id, title: b.name, category: "The Earth", generated: true,
      banners: b.banners || [], edited: { by: "multiple", attested: true, note: "the charter is not public" },
      summary: boldLead(b.name, b.note, "is a body outside the jurisdiction of the Circumterrestrial Commonwealth."),
      sections: [
        { h: "Charter and operator", body: (b.charter ? b.charter + " " : "") +
          (gone != null ? `It was operated by ${opLink} until ${dayOf(gone)}.` : `It is operated by ${opLink}.`) +
          (anc ? ` It is served by [[anchor_${anc.id}|${anc.tether}]], whose base is at ${anc.site}.` : "") },
        { h: "Population", body: `It has ${n(b.population)} residents, ${n(b.workforce)} of them employed` +
          (b.suspended ? `, and ${n(b.suspended)} emulated minds held in suspension in its data store` : "") +
          `. It returns no members to [[parliament|Parliament]], because it is not a station of the Commonwealth.` }
      ].concat(liveSections(b.cx)),
      infobox: { title: b.short || b.name, rows: [
        ["Residents", n(b.population)],
        ["Employed", n(b.workforce)],
        ["In suspension", n(b.suspended)],
        ["Operator", gone != null ? `None since ${dayOf(gone)}` : b.operator]
      ].concat(b.site ? [["Site", b.site]] : [])},
      see: (op ? ["actor_" + op.id] : []).concat(anc ? ["anchor_" + anc.id] : [], b.interests || [])
    };
  }

  /* A LEAD FROM CONTENT'S OWN SENTENCE. Content writes a foreign entry's
     `note` as the article's lead, beginning with the subject; the name is
     set in bold there rather than stated twice. */
  function boldLead(name, note, fallback) {
    const t = String(note || "");
    /* the full name, or its first part: "The Bellamy Almanac Works, Brant &
       Vane" is "The Bellamy Almanac Works" in its own lead */
    const bare = String(name).replace(/^the /i, "");
    for (const n of [bare, bare.split(",")[0]]) {
      const m = t.match(new RegExp("^(The )?" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      if (m) return `**${m[0]}**` + t.slice(m[0].length);
    }
    return lede(name, fallback) + (t ? " " + t : "");
  }

  /* HOW LONG ITS NEWS TAKES, in days (design/55). The engine counts a
     foreign power's lag in sittings; a reader counts days, from the
     calendar the House sits on. */
  function daysOfLag(lag) {
    const a = Engine.dateOfSitting(C, st.sitting), b = Engine.dateOfSitting(C, st.sitting + lag);
    if (!a || !b) return null;
    return Math.max(1, Math.round((Date.parse(b) - Date.parse(a)) / 86400000));
  }

  /* A POWER OUTSIDE THE COMMONWEALTH. Its lead is content's `note`, true on
     the opening day; what happens to it later is content's `cx` sections,
     history and state (design/55). */
  function foreignActorArticle(a) {
    const days = a.lag ? daysOfLag(a.lag) : null;
    const news = days == null ? "Its decisions are known in the Commonwealth within a day."
      : `Its decisions are generally known in the Commonwealth about ${days} day${days === 1 ? "" : "s"} ` +
        `after they are taken.`;
    const kind = { state: "State", metanational: "Company" }[a.kind] || a.kind;
    return {
      id: "actor_" + a.id, title: a.name, category: "The Earth", generated: true,
      banners: a.banners || [], edited: { by: "the Foreign Office", attested: true, note: "from the last dispatch" },
      summary: boldLead(a.name, a.note, "is a power outside the Circumterrestrial Commonwealth."),
      sections: liveSections(a.cx).concat([{ h: "News", body: news }]),
      infobox: { title: a.name, rows: [
        ["Kind", kind], ["News arrives", days == null ? "within a day" : `after about ${days} day${days === 1 ? "" : "s"}`]
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
        : "The measure requires a simple majority of Parliament.") +
      `\n\nOn present numbers the bill ${d.carries ? "carries" : "fails"}.` });
    return {
      id: "bill_" + b.id, title: b.title, category: "Legislation", generated: true,
      banners: bs.dead ? [] : ["contested"],
      edited: { by: "Order paper", attested: true, note: b.ref },
      summary: lede(b.title,
        `is a bill before the [[parliament|Parliament]]` +
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

  /* A TERM IS DEFINED, NOT GLOSSED (design/45). The article was the
     tooltip's one line after "is a term of Commonwealth politics", then the
     Earth analogy the tooltip uses ("Voter ID, for a world where copies are
     cheap") as an untitled paragraph, under a stub banner. A term with an
     authored `article` gets a definition: what it is, how it works, where it
     matters. The analogy stays the tooltip's. */
  function termArticle(g) {
    const title = g.term.charAt(0).toUpperCase() + g.term.slice(1);
    return {
      id: "term_" + g.term.toLowerCase().replace(/\s+/g, "_"),
      title: title,
      category: "Definitions", generated: true, banners: g.article ? [] : ["stub"],
      edited: { by: "unattributed", attested: true, note: "" },
      /* a definition may bold its own subject, as "A **fork** is ...",
         which reads as English where "**Fork** is" does not */
      summary: g.article ? (/\*\*/.test(g.article) ? g.article : lede(title, g.article))
                         : lede(title, `is a term of Commonwealth politics. ` + g.gloss),
      sections: [],
      see: g.see || []
    };
  }

  /* PRONOUNS ARE CONTENT'S. A character with none set is "they", which is
     never wrong; `pronouns` is set only where the author's own prose says
     "she" or "he" of the person. */
  function pronounsOf(ch) {
    const p = String(ch.pronouns || "they").toLowerCase();
    if (p.indexOf("she") === 0) return { sub: "she", poss: "her", s: "s", are: "is" };
    if (p.indexOf("he") === 0) return { sub: "he", poss: "his", s: "s", are: "is" };
    return { sub: "they", poss: "their", s: "", are: "are" };
  }
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  /* what kind of person, in the glossary's words, for the few the lede
     should say it of; a biological member is the Commonwealth's default */
  const KIND = { emulation: "an [[term_emulation|emulation]], a person running as software without a body",
                 uplift: "an uplift", synthetic: "a synthetic person" };

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
    const P = pronounsOf(ch);
    /* the seat links its own article, and a functional seat its franchise */
    const k = ch.seat ? (C.constituencies || []).find(x => x.name === ch.seat) : null;
    const seatPhrase = fc ? `the ${fc.name} [[functional_constituency|functional constituency]]`
                     : k ? `[[${k.id}|${ch.seat}]]` : ch.seat ? ch.seat : null;
    /* A PERSON WITHOUT A SEAT IS DESCRIBED BY WHAT THEY ARE: the President,
       the Governor, an editor. `descriptor` is content's; a member of the
       House is a politician of a party sitting for a seat. */
    const politician = !!seatPhrase;
    let summary = lede(ch.name, politician ? "is a Commonwealth politician"
                                : "is " + (ch.descriptor || "a figure in Commonwealth public life"));
    if (politician && party) summary += ` of the [[${party.id}|${party.name}]]`;
    if (seatPhrase) summary += `, sitting for ${seatPhrase}`;
    summary += ".";
    if (KIND[ch.category]) summary += ` ${cap(P.sub)} ${P.are} ${KIND[ch.category]}.`;
    if (lead) summary += ` ${asOf(`${P.sub} serve${P.s} as ${lead.title}.`)}`;
    else if (partyOffice) summary += ` ${asOf(`${P.sub} ${P.are} ${partyOffice.label}.`)}`;
    else if (politician) summary += ` ${cap(P.sub)} hold${P.s} no ministerial office.`;

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
    /* A CAREER, where content has written one (`bio`, design/45): facts a
       registry cannot derive, in the Concordance's register. The design
       note stays unprinted. */
    if (ch.bio) sections.push({ h: "Career", body: ch.bio });
    /* the current within the party, in its own words */
    const cur = ch.current ? (C.currents || []).find(x => x.id === ch.current) : null;
    if (cur && party) sections.push({ h: "In the party", body:
      `${cap(P.sub)} belong${P.s} to the ${cur.name}, one of the currents of the ` +
      `[[${party.id}|${party.name}]]. ` + (cur.description || "") });
    if (offices.length > 1) sections.push({ h: "Offices", body:
      `${cap(P.sub)} hold${P.s} ${offices.length} offices: ` +
      andList(offices.map(o => o.label)) + "." });
    if (isPM) sections.push({ h: "Government", body:
      asOf(`the government ${P.sub} lead${P.s} commands ${Engine.confidence(st)} of ` +
           `${Engine.chamberTotal(st)} seats, against a majority of ` +
           `${Engine.majority(st)}.`) });

    const hist = chronicleOf(ch.id);
    if (hist) sections.push(hist);

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
      /* A FACE, EVERY TIME. A person's article carries their portrait when
         the registry has one and the placeholder when it does not, so the
         page reads as a person rather than as a table with a name on it.
         The file is named, not checked: whether it exists is the browser's
         question, and the img falls back on its own. */
      infobox: { title: ch.name, portrait: ch.portrait || null, rows: rows },
      see: ch.party ? [ch.party] : []
    };
  }

  /* ---------- assembly ---------- */

  let all = [], byId = {};

  /* The whole House seated once per build and not once per party. */
  let roll = null;
  function rollOf() {
    if (!roll && Engine.benchRoll) roll = Engine.benchRoll(st, C);
    return roll;
  }

  /* THE FORUMS (design/43). A forum is always written up, since the
     Commonwealth sits in it from the first day; a resolution only once it
     has been tabled, by the rule that keeps a bill in drafting out of the
     Concordance: the reference work can only know what the world knows. A
     member's standing is a number the terminal prints and the Concordance
     says in words. */
  function longDate(iso) {
    if (!iso) return "";
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB",
      { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  function disposition(n) {
    return n >= 70 ? "friendly" : n >= 58 ? "well disposed" : n > 42 ? "indifferent"
         : n > 30 ? "cool" : "hostile";
  }
  const capital = t => { t = String(t || ""); return t.charAt(0).toUpperCase() + t.slice(1); };
  function sponsorName(f, r, mid) {
    const m = (f.members || []).find(x => x.id === r.sponsor);
    if (!m) return r.sponsor;
    if (m.self) return "the Commonwealth";
    return mid ? String(m.name).replace(/^The /, "the ") : m.name;
  }
  function forumArticle(f) {
    const fs = (st.forums || {})[f.id] || {};
    const seats = (f.members || []).reduce((n, m) => n + (m.votes || 1), 0);
    const res = (C.resolutions || []).filter(r => r.forum === f.id &&
      ((st.resolutions || {})[r.id] || {}).status && st.resolutions[r.id].status !== "draft");
    const two = (C.resolutions || []).some(r => r.forum === f.id && (r.majority || 0) > 0.5);
    const STATUS = { tabled: "on the agenda", adopted: "adopted", rejected: "rejected", withdrawn: "withdrawn" };
    return {
      id: "forum_" + f.id, title: f.name, category: "The Earth", generated: true,
      banners: [], edited: { by: "the Commonwealth's mission", attested: true, note: "" },
      summary: lede(f.name, f.summary || `is a forum of ${seats.toLocaleString()} seats in which the Commonwealth holds one.`),
      sections: [
        { h: "Procedure", body:
          `A resolution carries by a majority of the members present and voting, and ` +
          `abstentions are not counted.` + (two ? " An important question needs two thirds." : "") +
          (fs.next ? " " + asOf(`it next sits on ${longDate(fs.next)}.`) : "") },
        { h: "Members", body: asOf("the members' disposition toward the Commonwealth is as below. " +
            "A bloc votes on a common line, and not every member of it keeps to the line."),
          table: { head: ["Member", "Seats", "Disposition"],
                   rows: (f.members || []).map(m => [capital(m.name), String(m.votes || 1),
                     m.self ? "\u2014" : disposition(Engine.memberStanding(st, C, f, m))]) } },
        res.length ? { h: "Resolutions concerning the Commonwealth", body: "",
          table: { head: ["Resolution", "Sponsor", "Status"],
                   rows: res.map(r => [`[[resolution_${r.id}|${r.title}]]`, capital(sponsorName(f, r)),
                     STATUS[st.resolutions[r.id].status] || st.resolutions[r.id].status]) } } : null
      ].filter(Boolean),
      infobox: { title: f.short || f.name, rows: [["Seats", seats.toLocaleString()],
        ["The Commonwealth", "a full member"],
        fs.next ? ["Next sitting", longDate(fs.next)] : null].filter(Boolean) },
      see: (f.see || []).slice()
    };
  }
  function resolutionArticle(r, f) {
    const rs = (st.resolutions || {})[r.id] || {};
    const d = rs.decided;
    const need = r.majority || f.majority || 0.5;
    const fs = (st.forums || {})[f.id] || {};
    const at = `[[forum_${f.id}|${f.short || f.name}]]`;
    const how = d ? `, and was ${rs.status} on ${longDate(d.date)} by ${d.yes} votes to ${d.no}, ` +
                    `with ${d.abstain} abstaining`
      : rs.status === "tabled" ? `, and is to be voted on ${longDate(fs.next)}`
      : rs.status === "withdrawn" ? ", and was withdrawn before it was voted on" : "";
    const nameOf = id => capital(((f.members || []).find(m => m.id === id) || {}).name || id);
    const vote = x => [[x.yes, "for"], [x.no, "against"], [x.abstain, "abstaining"]]
      .filter(p => p[0]).map(p => (x.yes + x.no + x.abstain === 1 ? "" : p[0] + " ") + p[1]).join(", ");
    return {
      id: "resolution_" + r.id, title: r.title, category: "The Earth", generated: true,
      banners: [], edited: { by: "the Commonwealth's mission", attested: true, note: "" },
      summary: lede(r.title, `is a resolution put to the ${at} by ${sponsorName(f, r, true)}${how}.` +
        (r.summary ? " " + r.summary : "")),
      sections: [
        { h: "Majority", body: need > 0.5
          ? "It is an important question, and needs two thirds of the members present and voting."
          : "It needs a majority of the members present and voting." },
        d ? { h: "The vote", body: "",
          table: { head: ["Member", "Vote"], rows: d.rows.map(x => [nameOf(x.id), vote(x)]) } } : null
      ].filter(Boolean),
      infobox: { title: "Resolution", rows: [["Forum", f.short || f.name],
        ["Sponsor", capital(sponsorName(f, r))],
        ["Status", capital(rs.status)],
        d ? ["Result", `${d.yes} to ${d.no}, ${d.abstain} abstaining`] : null].filter(Boolean) },
      see: ["forum_" + f.id]
    };
  }

  function build() {
    roll = null;
    /* an article, or a person, the world does not know of yet is not there */
    const hand = ENCYCLOPEDIA.articles.filter(a => !a.since || sinceOf(a.since) != null)
      .map(a => Object.assign({ generated: false, appeared: sinceOf(a.since) }, a));
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
    C.characters.forEach(c => {
      if (c.since && sinceOf(c.since) == null) return;
      if (!handIds.has("person_" + c.id))
        gen.push(Object.assign(personArticle(c), { appeared: sinceOf(c.since) }));
    });
    const LEND = (C.setup && C.setup.lenders) || {};
    Object.keys(LEND).filter(k => LEND[k].terms).forEach(k => {
      if (!handIds.has("lender_" + k)) gen.push(lenderArticle(k, LEND[k]));
    });
    (C.glossary || []).forEach(g => {
      const id = "term_" + g.term.toLowerCase().replace(/\s+/g, "_");
      /* a term with a full hand-written article under its own name
         ("dual_majority") is that article; a thin second page would only
         split the reader between two */
      const u = g.term.toLowerCase().replace(/\s+/g, "_");
      if (!handIds.has(id) && !handIds.has(g.term.toLowerCase()) && !handIds.has(u)) gen.push(termArticle(g));
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
    (C.forums || []).forEach(f => {
      if (!handIds.has("forum_" + f.id)) gen.push(forumArticle(f));
      (C.resolutions || []).filter(r => r.forum === f.id).forEach(r => {
        const rs = (st.resolutions || {})[r.id];
        if (!rs || rs.status === "draft") return;
        if (!handIds.has("resolution_" + r.id)) gen.push(resolutionArticle(r, f));
      });
    });
    all = hand.concat(gen);
    all.forEach(a => {
      a.revisions = revisionsOf(a);
      a.revised = a.revisions.length ? a.revisions[a.revisions.length - 1].sitting : OPENING;
    });
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
      /* REVISED SINCE YOU LAST READ IT (design/55), on the article and on
         its category, since most categories start closed */
      const fresh = cats[k].some(unread);
      return `<div class="cx-navcat${open ? " open" : ""}${fresh ? " cx-unread" : ""}" tabindex="0" data-cxcat="${k.replace(/"/g, "&quot;")}">` +
        `<span class="cx-cat-car" aria-hidden="true">${open ? "\u2212" : "+"}</span>` +
        `${k}<span class="cx-cat-n">${n}</span></div>` +
        (open ? cats[k].sort((p, q) => p.title.localeCompare(q.title)).map(a =>
          `<a class="cx-navlink${a.id === current.id ? " on" : ""}${unread(a) ? " cx-unread" : ""}" tabindex="0" data-go="${a.id}">${a.title}` +
          (a.generated ? "" : " <em>&sect;</em>") + `</a>`).join("") : "");
    }).join("");
  }

  function drawArticle(a) {
    const banners = liveBanners(a.banners).map(b => {
      const def = ENCYCLOPEDIA.banners[b]; if (!def) return "";
      return `<div class="cx-banner cx-${def.cls}">${def.text}</div>`;
    }).join("");

    const info = a.infobox ? `<aside class="cx-infobox">` +
      (a.infobox.portrait !== undefined
        ? `<img class="cx-portrait" src="img/portraits/${esc0(a.infobox.portrait || "placeholder.png")}"` +
          ` alt="" onerror="this.onerror=null;this.src='img/portraits/placeholder.png'">` : "") +
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

    /* A SECTION MAY CARRY A TABLE after its prose, drawn as a wikitable:
       `table: {head: [...], rows: [[...], ...]}`, every cell through the
       same link syntax as a paragraph. A party's members are a list of
       eighty names, which prose cannot carry and a table can. */
    const table = t => t && t.rows && t.rows.length
      ? `<table class="cx-wikitable"><thead><tr>${(t.head || []).map(h => `<th>${h}</th>`).join("")}` +
        `</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${links(String(c))}</td>`).join("")}</tr>`).join("")}` +
        `</tbody></table>` : "";
    /* a section revised since the reader last opened the article arrives
       highlighted, once (design/55) */
    const lastRead = (st.cxRead || {})[a.id] || 0;
    const body = secs.map((s, i) =>
      `<section class="cx-sec${s.dated > OPENING && s.dated > lastRead ? " cx-new" : ""}">` +
      (s.h ? `<h3 id="cx-s${i}">${s.h}</h3>` : "") + (s.body ? paras(s.body) : "") +
      table(s.table) + `</section>`).join("");

    const see = (a.see || []).filter(id => byId[id]);
    const seeAlso = see.length
      ? `<h3>See also</h3><ul class="cx-see">${see.map(id =>
          `<li><a class="cx-link" tabindex="0" data-go="${id}">${byId[id].title}</a></li>`).join("")}</ul>` : "";

    const ed = a.edited || {};
    const foot = `<div class="cx-foot">` +
      `Last edited by <b>${ed.by || "unattributed"}</b> ` +
      `<span class="cx-att ${ed.attested === false ? "n" : "y"}">${ed.attested === false ? "UNATTESTED" : "ATTESTED"}</span>` +
      (ed.note ? ` &middot; ${ed.note}` : "") +
      `<br>${a.generated ? "This article is maintained automatically from Bureau returns." : "This article is maintained by contributors."}` +
      ((a.revisions || []).length
        ? `<br>Revised ${a.revisions.map(r => `${dayOf(r.sitting)}: ${esc0(r.what)}`).join("; ")}.` : "") +
      `</div>` +
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

    /* read now: the marks come off at the next draw of the navigation */
    if (!st.cxRead) st.cxRead = {};
    st.cxRead[a.id] = st.sitting;
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
