/* =============================================================
   TIPS — what the abbreviations mean.

   THE PROBLEM: every screen in this game is dense with tokens that
   carry a real rule and explain nothing. LOY. DUAL. A ledger reading
   +2. "committee". "prayable 4". 128 / 240 · need 121. A player who
   does not already know the system is reading a spreadsheet in a
   language nobody taught them, and the glossary does not help because
   it annotates WORDS IN THE FICTION and these are not that.

   THE DIVISION OF LABOUR, which is the only interesting decision here:

     the Concordance and the glossary explain THE WORLD. They are
     content, they are in-world, and they are written by whoever writes
     the fiction. This file explains THE TERMINAL - what a column is,
     what a number does, which rule reads it - and that text has to
     match the engine exactly, so it lives beside the code that must
     stay in step with it and not in content/.

     Where the world already has the answer, this file DEFERS: an entry
     with no body of its own falls through to the glossary, and then to
     the Concordance article of the same id. Nothing here restates
     canon, and nothing here invents any (bible 2.7 - the glossary is a
     frozen list and this file adds nothing to it).

   THE CONCORDANCE IS NOT ANNOTATED, AND THAT IS THE POINT. It is
   deliberately not government chrome - serif, white paper, generous
   leading, something civilians made - and putting terminal tooltips
   inside it would collapse a separation the whole screen is built on.
   It is also the place tips send you, so annotating it would be the
   terminal explaining the thing it just referred you to. tools/uxtest.js
   asserts that every OTHER screen carries annotations and that this one
   carries none.

   NEVER A NATIVE title="". A native tooltip is slow, unstyled,
   invisible to a keyboard, and cannot say two things at once.

   NO SOUND. Tips are triggered by a pointer moving, which is not a
   decision, and a terminal that chirps whenever the mouse crosses a
   table header is a terminal you turn off.
   ============================================================= */
const Tips = (function () {
  "use strict";

  const HOVER_DELAY = 320;   /* long enough not to flash on the way past */

  /* body: the terminal's own explanation.
     go:   a Concordance article to name, when the world has more to say.
     Entries with no body fall through to the glossary and the Concordance. */
  const TIPS = {
    /* ---- the status bar, left to right ---- */
    state: { title: "Government status",
      body: "READY while you are in office. You lose office if confidence falls " +
            "below a majority, or if the House passes a no-confidence motion. " +
            "There is no undo." },
    chapter: { title: "Chapter",
      body: "The act of the story you are in. Chapters control which events can " +
            "fire. They do not advance on a timer." },
    rise: { title: "The House rises",
      body: "The sittings left before the House rises. A session is sat in " +
            "periods: at a recess order-paper time refills and nothing else ends. " +
            "When the last period rises the session ends with it, business not " +
            "carried falls, and every undertaking due before the House rises " +
            "comes due at once. It is the deadline everything else on the board " +
            "is measured against." },
    globe: { title: "The Earth",
      body: "Every anchor in the dozen stands on somebody else's soil. The globe " +
            "turns and can be dragged; the map is the same drawing in a different " +
            "projection. The gold anchors are the Commonwealth's four, the plain " +
            "ones belong to other states, and a station is orbital, so it is not " +
            "drawn at a point on the ground." },
    actors: { title: "Relevant actors",
      body: "Whoever the state of the campaign has actually put in play. The four " +
            "powers outside the Commonwealth are not relevant until the station " +
            "question is raised, and the panel says so until then. Before that, " +
            "clicking a country on the globe shows what the Commonwealth depends " +
            "on it for — anchors, standing, and what it sells." },
    tribunal: { title: "The Tribunal",
      body: "The bench that hears what the orders do. It is not elected and " +
            "cannot be whipped, so the numbers in the House do not reach it. Its " +
            "disposition is how generously it reads the government's orders, and " +
            "that moves on whether a reference is answered, a case is defended " +
            "and a ruling is complied with. A case before it is due on a named " +
            "sitting, and it can strike an order, read it narrowly, or uphold it." },
    slots: { title: "Order paper time",
      body: "One slot moves one bill one stage closer to its division, and the " +
            "session holds only a few. Give a slot to a partner's bill and you " +
            "earn capital with that partner; spend one on your own and only your " +
            "programme advances. Slots refill when the House rises for a recess. " +
            "A hollow mark is time a crisis measure brought with " +
            "it: only that measure can spend it, and it goes when the House rises." },
    signatures: { title: "Signatures",
      body: "Names Czarnecki has collected, against the number that forces a " +
            "leadership ballot, which the bar prints beside them. Your own conduct " +
            "adds to this count: packing one licensing " +
            "board adds two names, and packing a second adds three." },
    confidence: { title: "Confidence",
      body: "Seats held by your coalition, plus any party supplying confidence. " +
            "This is measured against all 280 seats, and it keeps you in office. " +
            "It is not the same as the votes on a particular bill." },
    margin: { title: "Margin",
      body: "Confidence minus the majority of 141. At zero, one defection loses " +
            "you the chamber." },

    /* ---- the chamber ---- */
    seats: { title: "Seats",
      body: "280 seats in all. 140 come from districts, 100 from party lists, " +
            "and 40 from functional constituencies. The three tiers run " +
            "separately and do not make up for each other." },
    loyalty: { title: "Loyalty",
      body: "How much of a party's promised vote actually turns up. At loyalty " +
            "0 a party delivers 75 per cent of its seats; at 100 it delivers all " +
            "of them. A party at 40 delivers 85 of every 100 seats it promised. " +
            "Whipping buys back the gap.", go: "parliament" },
    mps: { title: "Members",
      body: "The number of the party's members in this current. A party's currents add up to its total seats." },
    popular: { title: "The popular benches",
      body: "The 240 members returned by districts and lists together. A bill " +
            "needs a simple majority of them." },
    functional: { title: "The functional benches", go: "functional_constituency" },
    dual: { title: "Dual majority", go: "dual_majority" },
    simple: { title: "Simple majority",
      body: "Carried on the popular benches alone. The functional forty still " +
            "vote, and their votes count in the same total. They are not tested " +
            "separately." },
    stage: { title: "Stage",
      body: "Drafting, first reading, second reading, committee, report, third " +
            "reading, assent. A bill divides at third reading. Each order-paper " +
            "slot moves a bill one stage." },
    whip: { title: "The whip",
      body: "Committing members costs capital with a partner, and loyalty with " +
            "your own party. The rate depends on how far the bill is from that " +
            "party's position. Nothing is charged until you divide, so you can " +
            "revise or clear the plan." },

    district: { title: "District seats",
      body: "140 seats, first past the post, one constituency at a time. The " +
            "roll of who holds each seat is the only record. Totals are counted " +
            "from it, never stored beside it." },
    list: { title: "List seats",
      body: "100 seats allocated from closed party lists by D'Hondt. A party " +
            "needs 4 per cent of the national vote to qualify. A party below " +
            "that still keeps its list seats if it won a district, or if it " +
            "represents one station or one category of legal person. The divisor " +
            "and the threshold are both set by law, so a bill can change them.",
      go: "parliament" },
    government: { title: "The government benches",
      body: "Seats held by the parties in your coalition. Confidence-and-supply " +
            "parties sit on the opposition side but still count toward your " +
            "confidence." },
    opposition: { title: "The opposition benches",
      body: "Everyone not in the coalition. They are not one bloc and do not " +
            "vote together." },
    majority: { title: "Majority",
      body: "141 of 280. Half the chamber plus one. It is recalculated, so it " +
            "follows the chamber if the number of seats changes." },
    speaker: { title: "The Chair",
      body: "Elected from among the members, and still counted in their party's " +
            "total. The Chair holds a seat but does not vote with the others." },
    benches: { title: "Facing benches",
      body: "The House drawn as two facing sides: the government and its supporters on one, everyone else on the other. Confidence is counted by which side a member sits on. The whip can move a whole bench from one side to the other." },

    /* ---- the functional tier ---- */
    franchise: { title: "Franchise",
      body: "How a functional constituency enrols its electors: by trade " +
            "licence, by company, by union bloc, or residually. The residual " +
            "constituency is everyone in no recognised sector. It returns one " +
            "seat.", go: "functional_constituency" },
    electors: { title: "Electorate",
      body: "The number of enrolled electors: the people entitled to vote for this seat. The district roll and the functional roll are counted separately." },

    currents: { title: "Currents",
      body: "The organised factions inside a party. The triangle opens a party's " +
            "row to list its currents, with the number of members in each and " +
            "their loyalty to the party leadership. The party's loyalty is the " +
            "average of its currents', weighted by size. In a division each " +
            "current is counted separately, and one whose loyalty has fallen " +
            "well below the party's is the most likely to vote against the whip. " +
            "A party with no organised currents opens to a single bench." },

    underwriters: { title: "The Underwriters",
      body: "Circumterrestrial Underwriters, the insurers who price the risk of failure on every station. Because they insure everything, they keep the most accurate figures in the Commonwealth. What they say about the government's accounts appears here." },

    waysmeans: { title: "Ways and means",
      body: "What the state takes in a year on each of the four bases it " +
            "taxes. The appropriation sets the rate; the price is what the " +
            "rate is charged on, and the yield grows and shrinks with the " +
            "economy. At the standing rates the budget runs a small deficit, " +
            "so a government that cuts a rate is borrowing to do it." },

    /* ---- the Reserve Bank (design/39 option C) ---- */
    reservebank: { title: "The Reserve Bank",
      body: "Sets the cash rate at a meeting every six weeks, by a rule it " +
            "publishes, to hold inflation to the target the Treasurer's remit " +
            "sets. The government cannot move the rate except by an order the " +
            "House approves, and every meeting under one costs the Bank " +
            "credibility." },
    inflation: { title: "Inflation",
      body: "How fast prices rise, per cent a year. Underlying inflation " +
            "follows what people expect and how hard output presses on " +
            "capacity; the headline adds what a change in the four scarcity " +
            "prices or the dollar is still passing on, which moves the price " +
            "level once and then fades. The Bank's rule reads the underlying " +
            "figure. The public pays the headline, and well over the target it " +
            "costs the government standing every week." },
    rate: { title: "The cash rate",
      body: "The Reserve Bank's rate. The rule under it is the neutral real " +
            "rate, plus underlying inflation, plus half its miss from the target, plus " +
            "half the output gap. A higher rate cools demand, lifts the dollar " +
            "and raises what the Treasury pays at home." },
    dollar: { title: "The dollar",
      body: "US dollars per Commonwealth dollar. It rises with the rate gap " +
            "over Earth and a believed Bank, and falls with the quarrel, the " +
            "debt and the deficit. A weaker dollar makes imports dearer and " +
            "the Standby Facility, which is owed in US dollars, heavier." },
    growth: { title: "Growth",
      body: "Real output over the last quarter, at a yearly rate, as a " +
            "statistics office prints it. Capacity is set by the " +
            "radiators and the labour force: under a thermal margin of 15 " +
            "every point costs output, and more people in paid work adds it." },
    credibility: { title: "Credibility",
      body: "Whether the market believes the Bank will hold inflation to the " +
            "target. Believed, expectations stay on the target; doubted, they " +
            "follow prices, and every point of inflation costs more to take " +
            "out. Directions and advances spend it." },
    posture_cautious: { title: "Cautious",
      body: "The careful answer: it goes least far, commits least, and is " +
            "usually worth least. The choices are listed cautious first." },
    posture_measured: { title: "Measured",
      body: "The middle answer: it does something, and keeps something back." },
    posture_bold: { title: "Bold",
      body: "The answer that goes furthest: the most to gain, and the most " +
            "that can go wrong, now or later." },
    economyvote: { title: "The public",
      body: "What the economy is doing to the government's standing, a year. " +
            "Headline inflation more than a point over the target costs, output " +
            "under capacity costs, and a steady economy is worth a little. It " +
            "reaches every band, and it lasts as long as the economy does." },
    balance: { title: "The balance",
      body: "Receipts less spending less interest, a year. A deficit is paid " +
            "from the reserve, and when the reserve is empty, in Treasury bills " +
            "at the weekly tender." },
    debt: { title: "Debt",
      body: "Everything the Commonwealth owes, in dollars at today's rate, " +
            "against a year's output. The share is what lenders read." },

    repay: { title: "Repay",
      body: "Pays this lender everything owed, from the reserve, and costs " +
            "no order-paper time: the Treasury settles a debt, the House " +
            "does not. It can only be done in full, and only while the " +
            "reserve holds the sum. A lender whose own terms say how it is " +
            "repaid has no control here." },

    /* ---- the orbit ---- */
    schematic: { title: "The habitat schematic",
      body: "A diagram of the Commonwealth's stations. Height is the altitude band, shape the kind of habitat, size the population, and tint the closure ratio. The mark below each station is its leading party. Positions show the band only." },
    form: { title: "Habitat form",
      body: "What the station physically is: a ring, a cylinder, or a cluster " +
            "of settlements. It has no mechanical effect. It explains a lot " +
            "about who lives there." },

    wire: { title: "The wire",
      body: "Headlines, newest first. Every item is pushed by an effect, so " +
            "everything here follows from something you did." },

    /* ---- papers and the record ---- */
    register: { title: "The register",
      body: "Acts, orders and minutes, in the order they were made. An act has " +
            "been through a division and cannot be undone. An order can still " +
            "be revoked." },
    minute: { title: "Minute",
      body: "An instruction from your office, signed and served. It is not law " +
            "and it binds nobody outside the building." },
    log: { title: "The record",
      body: "Every decision this government has taken, newest first. Each entry is written when the decision is made." },

    /* ---- the coalition ---- */
    ledger: { title: "Capital",
      body: "A running account with each partner. Positive means they owe you. " +
            "Negative means you owe them. Nothing here decays or is forgiven. " +
            "Overdrawing costs that partner loyalty at twice the rate." },
    gov: { title: "In government",
      body: "This party holds ministries and is bound by collective " +
            "responsibility." },
    cs: { title: "Confidence and supply",
      body: "A party outside the government that has agreed to support it on votes of confidence and on the budget. It counts toward the government's confidence. On other measures it votes as it chooses." },
    senior: { title: "Senior post",
      body: "Life Support is the senior ministry. Its minister can be summoned " +
            "by the engineering authority. In every other brief, the minister " +
            "does the summoning." },
    vacant: { title: "Vacant",
      body: "No minister holds this post, so it cannot make instruments. " +
            "Appoint one to change that.",
      go: "cabinet" },
    live: { title: "Reserve power",
      body: "Held by the President and available now. Dissolution, formation, " +
            "referral and appointments are constitutional powers. They do not " +
            "need the House's agreement.", go: "perigee_charter" },
    foreign: { title: "Foreign affairs",
      body: "Powers outside the Commonwealth, ordered by delay: the nearer the " +
            "row, the fresher the news. A foreign fact is never current, so each " +
            "standing is what it was when it was last heard, and a dispatch from " +
            "one of them arrives on a named sitting. Their standing decides what " +
            "they will do for you, and the transit price is theirs to set." },

    /* ---- instruments ---- */
    instrument: { title: "Statutory instrument",
      body: "A statutory instrument: an order a minister makes under an Act, without a vote in the House. A negative order takes effect when it is made and stays in force unless the House prays against it. An affirmative order takes effect once the House approves it. The minister who made an order can revoke it." },
    prayer: { title: "Praying against",
      body: "The House's only way to challenge an order already in force. It " +
            "expires. The number is the sittings left. After that the order " +
            "stands permanently." },
    priority: { title: "Priority bill",
      body: "Its owner values the time more, so granting it a slot earns an " +
            "extra point of capital." },

    /* ---- indicators and scarcity ---- */
    party_loyalty: { title: "Party loyalty",
      body: "Your own party's loyalty: the loyalty of the currents inside it, " +
            "averaged by how many members each has. Whipping your own members " +
            "is paid for from it, and the cost falls on every current." },
    public_standing: { title: "Public standing",
      body: "How the government is seen outside the chamber. It does not vote. " +
            "It decides what the wire prints." },
    consumables: { title: "Consumables",
      body: "Food, water and everything else a habitat consumes. When it is " +
            "low, stations go short." },
    thermal_margin: { title: "Thermal margin",
      body: "Waste-heat headroom across the ring. Everything a habitat does " +
            "produces heat, and heat is the hardest thing to get rid of in " +
            "vacuum. When this reaches zero, people die.",
      go: "the_permanent_emergency" },
    solvency: { title: "Sovereign solvency",
      body: "The reserve: the Treasury's dollars at the Reserve Bank, which " +
            "every payment comes out of. When it runs out the Treasury tenders " +
            "bills, and when the tender is full the government must beg, " +
            "borrow or cut." },
    legitimacy: { title: "Legitimacy",
      body: "Whether the House and the stations still believe the government. " +
            "Low legitimacy is strikes, walkouts and a no-confidence motion " +
            "waiting for its moment." },
    friction: { title: "Diplomatic friction",
      body: "How far Earth's governments and banks are against you. High " +
            "friction means sanctions, frozen accounts and dearer imports; " +
            "it is the one meter that is bad when it rises." },
    scarcity: { title: "Scarcity index",
      body: "The price index of one of the four scarce goods. Each starts at 100 and is set by legislation, chiefly the appropriation. A higher thermal price makes it harder for poor stations to keep their people running." },

    /* ---- the orbit ---- */
    ratio: { title: "Apportionment ratio",
      body: "Electors per seat, divided by the Commonwealth average. Above 1, the seat's electors are under-represented; below 1, they are over-represented. It is calculated from the roll each time it is shown." },
    held: { title: "Held by",
      body: "The party that holds this seat now. For district seats, the roll " +
            "is the only record of who holds what." },
    band: { title: "Altitude band",
      body: "The station's altitude band: low, middle or ring. The chart places low-orbit stations at the bottom and the ring at the top. Stations in the same band usually share an economy and a politics." },
    closure: { title: "Closure" }   /* the glossary has this one */
  };

  let card = null, anchor = null, timer = null, wired = false, explaining = false;

  function opt() {
    if (typeof Shell === "undefined" || !Shell.opt) return true;
    const v = Shell.opt("tips");
    return v === undefined ? true : v;
  }

  /* THE FALLTHROUGH. Terminal first, then the world's own words. */
  function find(key) {
    const t = TIPS[key] || {};
    let body = t.body, title = t.title, go = t.go || null;
    const C = typeof CONTENT !== "undefined" ? CONTENT : null;

    if (!body && C && C.glossaryByTerm) {
      const g = C.glossaryByTerm[(key || "").replace(/_/g, " ")];
      if (g) { body = g.gloss; title = title || g.term; }
    }
    if (!body && C && C.encyclopediaById && C.encyclopediaById[key]) {
      const a = C.encyclopediaById[key];
      body = String(a.summary || "").replace(/<[^>]*>/g, "");
      title = title || a.title;
      go = go || key;
    }
    if (!body && go && C && C.encyclopediaById && C.encyclopediaById[go]) {
      body = String(C.encyclopediaById[go].summary || "").replace(/<[^>]*>/g, "");
      title = title || C.encyclopediaById[go].title;
    }
    if (!body) return null;
    return { title: title || key, body: body, go: go };
  }

  function build() {
    if (card) return card;
    card = document.createElement("div");
    card.id = "tipcard";
    card.setAttribute("role", "tooltip");
    /* Deliberately not focusable and not clickable. A tooltip you can tab
       into is a trap; the Concordance tab is where you go to read more. */
    card.hidden = true;
    document.body.appendChild(card);
    return card;
  }

  function parseMembers(s) {
    if (!s) return null;
    try { const a = JSON.parse(s); return Array.isArray(a) && a.length ? a : null; }
    catch (e) { return null; }
  }

  /* A tabled list of the people a data-driven card names: the party mark and
     short name in one column, the member in the other. */
  function membersTable(list) {
    if (!list || !list.length) return "";
    const C = typeof CONTENT !== "undefined" ? CONTENT : null;
    const rows = list.map(m => {
      const p = C && C.partyById ? C.partyById[m.p] : null;
      const sw = p ? '<i class="swatch" style="background:' + esc(p.colour) + '"></i>' : "";
      const off = m.o ? ' <i class="office">' + esc(m.o) + "</i>" : "";
      return "<tr><td>" + esc(m.r || "") + "</td><td>" + sw +
             esc(p ? p.short : (m.p || "")) + "</td><td>" + esc(m.n) + off + "</td></tr>";
    }).join("");
    return '<table class="tipmem"><tbody>' + rows + '</tbody></table>';
  }

  /* WHERE THE CARD HANDS OFF. The Concordance generates articles for
     parties, stations and persons as well as carrying authored ones, and
     this only ever looked in the AUTHORED map — so a party tip could name
     a target and then decline to mention it, because the party's own
     article is generated. It resolves a generated subject from its own
     roster now, which is what turns a party hover into a hand-off rather
     than a dead end. */
  function goLine(go) {
    if (!go || typeof CONTENT === "undefined") return "";
    const subj = (CONTENT.encyclopediaById || {})[go] ||
                 (CONTENT.partyById || {})[go] ||
                 (CONTENT.stationById || {})[go];
    if (!subj) return "";
    /* A LINK, NOT A LABEL. It said "Concordance · Freehold Party" in
       italic and did nothing, which is worse than silence: it names a
       place and declines to take you there. data-go is the Concordance's
       own navigation attribute, so this rides the handler every other
       cross-reference in the game uses. */
    return '<a class="cx-link tip-go" tabindex="0" data-go="' + esc(go) + '">' +
           esc(subj.title || subj.name) + ' in the Concordance</a>';
  }

  /* An optional picture. Parties have a logo; a hover that shows the thing
     it names beats another line of prose about it. Never required, and a
     missing file removes itself rather than leaving a broken box. */
  function imgLine(src) {
    if (!src) return "";
    return '<img class="tip-img" src="' + esc(src) + '" alt="" ' +
      'onerror="this.onerror=null;this.remove()">';
  }

  function show(el) {
    /* NOTHING ON THE MAIN MENU. The standing board reuses the game's
       panels and inherits their annotations with them, but the board is a
       display and not a dashboard: an explanation attached to a readout
       nobody can act on is noise. Enforced here rather than by remembering
       to strip data-tip in the renderer, which is a thing somebody will
       forget. */
    if (el.closest("#menu")) return;
    /* An element may carry its own one-off body, for content that is data
       rather than a fixed token - a functional constituency's roll, seats and
       members, say. The keyed map stays the fallback. */
    const inline = el.getAttribute("data-tip-body");
    const t = inline
      ? { title: el.getAttribute("data-tip-title") || "", body: inline,
          go: el.getAttribute("data-tip-go") || null,
          img: el.getAttribute("data-tip-img") || null,
          members: parseMembers(el.getAttribute("data-tip-members")) }
      : find(el.getAttribute("data-tip"));
    if (!t) return;
    const c = build();
    c.innerHTML =
      imgLine(t.img) +
      '<b>' + esc(t.title) + '</b>' +
      goLine(t.go) +
      '<span>' + esc(t.body) + '</span>' +
      membersTable(t.members);
    /* A member table carries a full office title in its last column, so the
       card is allowed to run wider than a one-line explanation needs. The
       cap only lifts; a short card still sizes to its content. */
    c.classList.toggle("wide", !!t.members);
    c.hidden = false;
    anchor = el;
    el.setAttribute("aria-describedby", "tipcard");
    place(el, c);
  }

  /* Below and left-aligned, flipped or pulled back when that would put it
     off the screen. No library, no arrow: an arrow on a 200px card in a
     16px-tall row points at four things at once. */
  function place(el, c) {
    const r = el.getBoundingClientRect();
    const w = c.offsetWidth, h = c.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    let x = r.left, y = r.bottom + 4;
    if (y + h > vh - 4) y = Math.max(4, r.top - h - 4);
    if (x + w > vw - 4) x = Math.max(4, vw - w - 4);
    c.style.left = Math.round(x) + "px";
    c.style.top = Math.round(y) + "px";
  }

  function hide() {
    clearTimeout(timer);
    if (anchor) anchor.removeAttribute("aria-describedby");
    anchor = null;
    if (card) card.hidden = true;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------- explain mode ----------

     A tip only a mouse can reach is not an explanation, it is a reward
     for owning a mouse. But a table header that is permanently in the tab
     order is fifty new tab stops between the player and the button they
     wanted, so the readouts cannot simply be focusable all the time.

     Pressing ? puts them in the tab order and takes them out again. It is
     a mode, it is announced in the options panel, and Escape leaves it.
     Never a positive tabindex - 0 means "in document order", which is
     exactly where a column heading belongs. */
  /* AN ANNOTATION IS EITHER KEYED OR INLINE, AND BOTH ARE ANNOTATIONS.

     show() has read a one-off data-tip-body since the functional roll
     needed one, but every selector that DECIDES whether to call show()
     asked for data-tip alone — so an element carrying only the inline
     card was invisible to hover, to focus and to `?`, and its card could
     never appear at all. Anything written with data-tip-title and no key
     beside it was dead on the page and looked completely fine in the
     markup, which is why several were: a calendar day, the party marks,
     every price and refusal card, the chamber picker, the orbit chips.

     One constant, used by all four call sites. An inline card carries its
     own title and body and needs no key; there is nothing for a key to
     add and nothing to fall through to. */
  const SEL = "[data-tip],[data-tip-body]";
  /* A comma splits the WHOLE selector list, so "#statusbar " + SEL reads
     as "#statusbar [data-tip]" OR "[data-tip-body]" anywhere in the
     document — which marked eleven rows on a screen nobody was looking
     at. A prefix has to be distributed across the list, not glued to the
     front of it. The existing check caught this on the first run. */
  const within = pre => SEL.split(",").map(s => pre + " " + s).join(",");

  function marks() {
    const screen = document.querySelector(".screen.on") || document;
    return [].slice.call(screen.querySelectorAll(SEL))
      .concat([].slice.call(document.querySelectorAll(within("#statusbar"))));
  }
  function explain(on) {
    if (typeof document === "undefined") return;
    explaining = !!on;
    document.body.classList.toggle("explaining", explaining);
    marks().forEach(n => {
      if (explaining) n.setAttribute("tabindex", "0");
      else n.removeAttribute("tabindex");
    });
    if (!explaining) hide();
  }
  /* Called after a redraw, which has just replaced every annotated node
     with a fresh one that has no tabindex on it. */
  function remark() { if (explaining) explain(true); }

  function wire() {
    if (wired || typeof document === "undefined") return;
    wired = true;

    document.addEventListener("pointerover", e => {
      if (!opt()) return;
      const el = e.target.closest && e.target.closest(SEL);
      if (!el || el === anchor) return;
      hide();
      /* A DELAY ON HOVER AND NONE ON FOCUS. A pointer crosses six table
         headers on the way to a button and meant none of them; a keyboard
         has already committed to the thing it is on. */
      timer = setTimeout(() => show(el), HOVER_DELAY);
    });
    document.addEventListener("pointerout", e => {
      const el = e.target.closest && e.target.closest(SEL);
      if (el && el === anchor) hide();
      else if (el) clearTimeout(timer);
    });
    document.addEventListener("focusin", e => {
      if (!opt()) return;
      const el = e.target.closest && e.target.closest(SEL);
      hide();
      if (el) show(el);
    });
    document.addEventListener("focusout", hide);
    /* Anything that moves the page or commits an action takes the card
       with it: it is positioned in viewport coordinates and would
       otherwise be left pointing at nothing. */
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { if (explaining) explain(false); else hide(); return; }
      /* not while typing into the Concordance search box */
      if (e.key === "?" && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || "")) {
        e.preventDefault();
        explain(!explaining);
      }
    });
    document.addEventListener("pointerdown", hide, true);
    window.addEventListener("scroll", hide, true);
  }

  /* SEL is exported because it is a RULE, not an implementation detail:
     "the Concordance carries no terminal annotations" is only checkable
     against this module's own idea of what an annotation is. The check
     used to spell the selector out itself and went quietly out of date
     the moment inline cards became annotations too. */
  /* TIPS IS EXPORTED SO THE PROSE FILE CAN REACH IT. Every other sentence a
     player reads lives in content/ and goes through tools/prose.js; these
     lived in a closure, so the one body of text the author most wanted to
     rewrite was the one body they could not open. It is read-only from the
     outside — nothing assigns to it — and the prose tool edits the SOURCE. */
  return { wire, hide, find, explain, remark, SEL, TIPS,
           explaining: () => explaining,
           keys: () => Object.keys(TIPS) };
})();
