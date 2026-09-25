/* =============================================================
   ENGINE
   -------------------------------------------------------------
   This file contains NO content. It names no event, no party,
   no station, no character. Everything it operates on comes from
   the files in /content.

   If you find yourself editing this file to add content, stop:
   the thing you want is almost certainly a new entry in a content
   file, or — rarely — a new verb in EFFECTS / CONDITIONS below.
   ============================================================= */

const Engine = (function () {
  "use strict";

  const STATE_VERSION = 30;  // 3 prices, 4 cabinet+instruments, 5 the district roll, 6 content reconciliation, 7 the functional roll, 8 undertakings, 9 the seed, 10 the calendar, 11 the day's business, 12 pairing, 13 actors and lobbying, 14 the parliament ends, 15 trends, 16 the campaign meters, 17 the day's order-paper business, 18 pressure by default, 19 the denominated treasury, 20 what the Commonwealth has heard, 26 the productive economy, 27 reserved order-paper time, 28 sitting periods, 29 named creditors, 30 campaigns

  /* ---------------------------------------------------------
     1. STATE
     --------------------------------------------------------- */

  function newGame(C, seed) {
    const st = {
      version: STATE_VERSION,
      sitting: 1,
      chapter: 1,
      /* The session is content's number (bible §11.1: Session 4), and a
         session is sat in PERIODS with a recess between them (§1.8). */
      session: C.setup.session || 1,
      period: 1,
      date: dateOfSitting(C, 1),   /* the first day the House actually sits */
      inGovernment: true,
      pm: C.setup.pm,
      playerParty: C.setup.playerParty,

      scalars: Object.assign({}, C.setup.scalars),
      law: Object.assign({}, C.setup.law),
      /* STANDING BY BAND. Every band of the roll opens where the national
         figure opens: the government is equally liked everywhere until it
         does something. */
      standing: (function () {
        const s = {}, open = (C.setup.scalars || {}).public_standing;
        bandsOf(C).forEach(b => { s[b] = open == null ? 50 : open; });
        return s;
      })(),

      parties: {},
      currents: {},
      stations: {},
      characters: {},
      bills: {},

      coalition: C.setup.coalition.slice(),
      confidenceSupply: C.setup.confidenceSupply.slice(),

      /* Signed ledger, one entry per partner. Positive means they owe you;
         negative means you owe them. Debts are never forgiven and never decay
         — a coalition remembers. */
      capital: {},

      /* Time on the order paper is the scarce good that generates capital.
         A session has a finite number of slots and every one you give a
         partner is one you do not get. */
      slots: { total: C.setup.slotsPerSession || 6, used: 0, reserved: {} },

      /* THE DAY'S BUSINESS. Order-paper time was a session budget and
         nothing more: six slots, twenty-four sittings, and every one of
         them available on the first day — so a player could take the
         whole session's business before lunch and then sit through
         twenty-three empty sittings. A budget caps how much you do. It
         does not pace anything, which is what §7.7 says this currency is
         for. This is the clock half: how much of it the House will hear
         in one day. Reset by advance(), never carried. */
      divisionsToday: 0,
      /* The same for order-paper time: how many measures the House takes
         a day, so six session slots are a budget spent over the session
         rather than a lump sum spent on the first morning. */
      grantsToday: 0,
      /* PRESSURE BY DEFAULT: whether the government used a lever this
         sitting (a grant, a division, an order, an initiative), and how
         many sittings in a row it has not. A government that only answers
         the decisions put in front of it drifts; content declares the
         grace and the drag. Reset by advance(), never carried. */
      actedThisSitting: false,
      idleSittings: 0,

      /* A leadership ballot needs setup.thresholds.ballot names (twelve). Things the
         player does add to the counter; §3.5's second loss condition reads it. */
      signatures: 0,

      /* Cabinet. A post with no holder cannot make an instrument, which is the
         interlock that turns the appointment fight and the board fight into the
         same fight. */
      cabinet: {},

      /* Statutory instruments: made, in force, prayed against, revoked. */
      instruments: {},

      /* Planned whipping, per bill. Not spent until the division is called,
         so it can be revised or cleared. */
      whips: {},

      /* TRENDS — a micro-decision alters the RATE, not the total (Flash I:
         decreasing water recycling funding should not crash anything today;
         it should lean on the margin, a little, every sitting, until
         somebody notices). tick() applies each trend to its scalar once per
         sitting; content sets and reverses them through
         {move:{"trend.key":n}}. */
      trends: {},

      /* PAIRING — a Westminster courtesy this chamber's arithmetic does
         not support, which is exactly why it is here.

         Two members on opposite sides agree that neither will vote. At
         Westminster that is neutral, because a majority there is a
         majority of those VOTING. Here a majority is a majority of the
         MEMBERS — 121 of 240, 21 of 40 (§4.6.1) — so the opposition gives
         up a nay that was never counted and the government gives up an
         aye that was. A pair costs the government one and the opposition
         nothing.

         Nobody has revisited the maths. The courtesy was inherited with
         the rest of the procedure and the whips who understand it do not
         volunteer that they do, which makes granting pairs a generous-
         feeling habit that quietly costs a government its margin — a
         dated novelty in the §2.1 sense, and the same kind of fossil as
         the vestigial Secretary-General title in §3.9.

         {billId: {partyId: n}}. Planned, revisable, and settled when the
         division is called, exactly like the whips. */
      pairs: {},
      /* Which session this parliament opened in, so its length is counted
         from here rather than from the campaign's absolute session number
         (the opening state is session 4 of an older parliament). */
      parliamentOpenedAt: C.setup.session,

      /* ACTORS — the bodies that are not in the chamber and not the state.
         Bible §10.10 gives metanationals "near party-tier power" and until
         now a consortium that could withhold a shipment had less
         representation in state than a backbencher. Seeded from content and
         backfilled by reconcile(), exactly as parties and stations are.

         `standing` is what they think of the government. It is NOT a purse:
         the player does not spend it down to zero and top it up. Lobbying
         costs standing because asking for a favour costs goodwill, and the
         body that has run out of goodwill simply stops taking the call. */
      actors: {},
      /* What the Commonwealth has HEARD about each foreign body, as opposed
         to what is true. See reportedActor(). */
      foreign: {},

      /* LOBBYING — {billId: {actorId: seats}}. Parallel to st.whips in every
         respect: planned, revisable, and NOT CHARGED UNTIL THE DIVISION IS
         CALLED. The difference is what it costs. A whip spends capital or
         loyalty, which are things you have. A lobby spends a PROMISE, which
         is a thing you will owe — so settling one creates an undertaking
         with a deadline rather than moving a number. */
      lobby: {},
      /* What the government has written into the blanks of a bill that
         has any. See clausesOf. */
      clauses: {},

      /* PRICES — index numbers, 100 at the founding of the current series.
         Not a market simulation and deliberately not equities: there is no
         point pricing shares in an economy where goods are nearly free. These
         are the four things that are actually scarce, and every one of them is
         a legislative output rather than a market outcome. A thermal
         budget moves the quota price; the quota price decides whether a
         poor station can afford to keep its people running.

         This is the causal chain the player is meant to watch:
         decision -> price -> station conditions -> event. */
      /* The scarce goods are content too, for the same reason. §7.3 names
         four; a Commonwealth that came to price a fifth should not need
         the engine recompiled to do it. */
      prices: pricesOf(C), priceHistory: historyOf(C),

      /* THE PRODUCTIVE ECONOMY (bible §7.10).

         The four prices are the cost of existing. These are the other half:
         what the Commonwealth makes, sells and employs. Without them it is
         a closed system with a static labour market, which is not a modern
         economy however finely metered.

           participation  per cent of adults in paid work
           trade          balance index, 100 level, above is surplus
           private        share of the economy in private hands, EXCLUDING
                          the eleven consortiums whose control carries a
                          parliamentary vote and which therefore never
                          float (§7.5.1). There is a real equity market; it
                          just cannot touch the firms that hold seats.

         The opening figures come from content, like the prices and for the
         same reason: a Commonwealth that came to meter a fifth thing should
         not need the engine recompiled to do it. */
      economy: economyOf(C),
      economyHistory: economyHistoryOf(C),

      president: Object.assign({}, C.setup.president),

      flags: {},

      /* UNDERTAKINGS — what the government has said it will do.
         A choice does not perform an act; it undertakes to. The act is
         then carried out on the screen that owns it, and settle() below
         notices. There is deliberately no verb for "mark it done": a
         promise is discharged by keeping it. See design/02. */
      undertakings: [],   // [{id, text, owed_to, by, discharge, onBreach, state}]

      /* THE SEED. Selection is deterministic GIVEN THE SAVE: the cursor
         lives here and every draw advances it, so a save always replays
         identically to itself while two games differ. That is the
         property 1.5 actually protects — testable balance and a
         reproducible bug report — and it survives intact.

         newGame defaults it rather than reading the clock, because
         test.js asserts newGame is pure and repeatable. Shell passes a
         real one when a player starts a game. */
      seed: (seed == null ? 20287 : (seed >>> 0)) || 1,

      /* THE CALENDAR. The House RISES at the end of every sitting period,
         and that is what makes the order paper a schedule rather than a
         list: order-paper time refills here. Most rises are a recess; the
         last of a session also ends the session — business not carried
         falls and what was owed "before the House rises" comes due — and
         the last of a parliament dissolves it. Was `sessionEnds`, which
         stopped being true the day a session gained periods. */
      risesAt: periodLength(C),

      queue: [],      // [{eventId, dueSitting}]
      seen: {},       // eventId -> times fired
      wire: [],       // [{sitting, text}]
      log: []         // [{sitting, text}]
    };

    C.parties.forEach(p => st.parties[p.id] = {
      id: p.id, loyalty: p.loyalty == null ? 100 : p.loyalty,
      seats: Object.assign({}, p.seats)
    });
    C.currents.forEach(c => st.currents[c.id] = { id: c.id, loyalty: c.loyalty, members: c.members });
    C.stations.forEach(s => st.stations[s.id] = JSON.parse(JSON.stringify(s)));
    C.characters.forEach(c => st.characters[c.id] = { id: c.id, relationship: c.relationship == null ? 50 : c.relationship, alive: true });
    C.bills.forEach(b => st.bills[b.id] = { id: b.id, stage: b.stage, dead: false, amendments: [] });
    (C.cabinet || []).forEach(p => st.cabinet[p.id] = {
      id: p.id, holder: p.holder || null, party: p.party || null });
    (C.instruments || []).forEach(i => st.instruments[i.id] = {
      id: i.id, made: false, inForce: false, revoked: false,
      madeAt: null, prayerCloses: null, effectApplied: false });
    st.coalition.concat(st.confidenceSupply).forEach(p => {
      if (p !== st.playerParty) st.capital[p] = (C.setup.capital || {})[p] || 0;
    });

    seedRoll(st, C);
    seedFunctional(st, C);
    seedActors(st, C);
    /* WHICH CAMPAIGN, AND HOW IT OPENS (design/36 §3). A campaign's view of
       the content (`CONTENT.forCampaign`) names itself and carries its
       opening: ordinary effects, applied once, here, after the world is
       seeded and before anything is read. That is how a campaign opens on
       the last one's canon ending (bible §1.8) without anybody writing a
       second setup file: a flag, a debt, a coalition, a vacated post, in
       the vocabulary events already use. The log it writes is the
       opening's, so it is cleared. */
    st.campaign = C.campaign || null;
    if (C.opening && C.opening.length) {
      apply(st, C, C.opening);
      st.log = [];
      st.wire = [];
    }
    /* the party figures and the government's meter are the currents' */
    syncLoyalty(st, C);
    return st;
  }

  /* Save migration. Add a case per version bump; never delete one. */
  function migrate(st) {
    if (!st.version) st.version = 1;
    if (st.chapter == null) st.chapter = 1;   // saves from before chapters existed

    /* ASCENDING, one block per bump, each stamping only its own version.
       Descending order silently skips every earlier block: a v1 save hits
       `< 4`, is stamped 4, and never gets prices, capital, slots or whips,
       so the first division throws. Keep these in order and never delete one. */
    if (st.version < 2) {                     // capital, slots and whipping
      st.capital = st.capital || {};
      st.coalition.concat(st.confidenceSupply).forEach(p => {
        if (p !== st.playerParty && st.capital[p] == null) st.capital[p] = 0;
      });
      st.slots = st.slots || { total: 6, used: 0 };
      st.whips = st.whips || {};
      st.version = 2;
    }
    if (st.version < 3) {                     // scarcity prices
      /* No content here: migrate() takes only the save, by design — an old
         file is brought forward on its own terms and reconcile() adds
         anything content has declared since. So the defaults, not C. */
      st.prices = st.prices || pricesOf(null);
      st.priceHistory = st.priceHistory || historyOf(null);
      st.version = 3;
    }
    if (st.version < 4) {                     // cabinet and instruments
      st.cabinet = st.cabinet || {};
      st.instruments = st.instruments || {};
      if (st.signatures == null) st.signatures = 0;
      st.version = 4;
    }
    if (st.version < 5) {                     // the district roll
      /* Saves from before the roll existed carry only a district count per
         party. There is no way to recover which constituency each seat was,
         so the roll is reseeded from content and the count is whatever the
         roll says. A pre-roll save therefore returns to the authored map,
         which is the only honest reconstruction available. */
      st.rollReseeded = true;
      st.electionsHeld = st.electionsHeld || 0;
      st.version = 5;
    }
    if (st.version < 6) {                     // content reconciliation
      /* Nothing to add here: the work is reconcile(), which load() runs on
         every save regardless of version. The bump exists so a v5 save is
         seen to have passed through it. */
      st.version = 6;
    }
    if (st.version < 7) {                     // the functional roll
      /* Saves from before the roll carry only a party functional total. There
         is no way to recover which constituency each seat was, so the roll is
         reseeded from content on load and the total is whatever the roll says
         — the same honest reconstruction as the district roll in v5. */
      st.functionalReseeded = true;
      st.version = 7;
    }

    if (st.version < 8) {                     // undertakings
      st.undertakings = st.undertakings || [];
      st.version = 8;
    }
    if (st.version < 9) {                     // the seed
      if (!st.seed) st.seed = 20287;
      st.version = 9;
    }
    if (st.version < 10) {                    // the calendar
      /* An older save is mid-session by definition, so it is given a full
         session from where it stands rather than being prorogued on load. */
      if (st.risesAt == null) st.risesAt = st.sitting + 24;
      st.version = 10;
    }
    if (st.version < 11) {                    // the day's business
      if (st.divisionsToday == null) st.divisionsToday = 0;
      st.version = 11;
    }
    if (st.version < 12) {                    // pairing
      if (!st.pairs) st.pairs = {};
      st.version = 12;
    }
    if (st.version < 13) {                    // actors and lobbying
      /* Left empty on purpose: reconcile() backfills every actor from
         content on the next load, which is the same path a station added
         after a save was written already takes. Seeding here would put the
         roster in two places and let them drift. */
      if (!st.actors) st.actors = {};
      if (!st.lobby) st.lobby = {};
      if (!st.clauses) st.clauses = {};
      st.version = 13;
    }
    if (st.version < 14) {                    // the parliament has a length
      if (st.parliamentOpenedAt == null) st.parliamentOpenedAt = st.session;
      st.version = 14;
    }
    if (st.version < 15) {                    // trends (Flash I)
      st.trends = st.trends || {};
      st.version = 15;
    }
    if (st.version < 16) {                    // the campaign meters (Flash I)
      /* `treasury` became `solvency`, and legitimacy and friction were
         added. Carry the value across under the new name; reconcile()
         fills any meter a save has never seen. */
      st.scalars = st.scalars || {};
      if (st.scalars.solvency == null && st.scalars.treasury != null)
        st.scalars.solvency = st.scalars.treasury;
      delete st.scalars.treasury;
      st.version = 16;
    }
    if (st.version < 17) {                    // the day's order-paper business
      if (st.grantsToday == null) st.grantsToday = 0;
      st.version = 17;
    }
    if (st.version < 18) {                    // pressure by default
      if (st.actedThisSitting == null) st.actedThisSitting = false;
      if (st.idleSittings == null) st.idleSittings = 0;
      st.version = 18;
    }
    if (st.version < 19) {                    // the denominated treasury
      /* `solvency` was an index of "capacity to act" on a nought-to-a-hundred
         scale; it is now the quota the state holds, in the MW-year rejected
         (bible 7.5.3, design/28 phase 4). One index point is a thousand
         MW-years, so an old save's 52 becomes 52,000 and every ratio in it
         is preserved exactly. A save that came through v16 has `solvency`
         and a save older still has `treasury`; both are indices, so both
         scale. The trend, if one is running, is a rate and scales too. */
      st.scalars = st.scalars || {};
      if (st.scalars.solvency != null) st.scalars.solvency *= 1000;
      st.trends = st.trends || {};
      if (st.trends.solvency != null) st.trends.solvency *= 1000;
      st.version = 19;
    }
    if (st.version < 20) {                    // what the Commonwealth has heard
      /* Left empty on purpose, like v13's actors: reconcile() prefills every
         trail from content on the next load, and seeding here would put the
         roster in two places and let them drift. */
      if (!st.foreign) st.foreign = {};
      st.version = 20;
    }
    if (st.version < 21) {                    // when an event last fired
      /* Recurring events need to know WHEN, and st.seen only counts. An
         empty table is correct for an old save: nothing has recurred yet,
         and the first sitting after the load sets it. */
      if (!st.lastFired) st.lastFired = {};
      st.version = 21;
    }
    if (st.version < 22) {                    // the confidence motion
      /* Left empty deliberately, like v13's actors and v20's foreign trails.
         `st.motion` and `st.noConfidence` are read as `st.x && ...`
         everywhere, so ABSENT is the correct value for a save written before
         any motion existed. Seeding them would be inventing a motion that
         was never tabled. */
      st.version = 22;
    }
    if (st.version < 23) {                    // standing, by band
      /* Left to reconcile(), which runs on every load and seeds each band
         from the national figure the save is already carrying. Seeding here
         as well would put the roster in two places and let them drift —
         the same reason v13's actors and v20's foreign trails are empty. */
      if (!st.standing) st.standing = {};
      st.version = 23;
    }
    if (st.version < 24) {                    // the licensing boards
      /* An empty table is the truth for a save written before the power
         existed: no board has been appointed to, because none could be. */
      if (!st.boards) st.boards = {};
      st.version = 24;
    }
    if (st.version < 25) {                    // the Earth debt
      /* Nought is the truth for a save written before the power to borrow
         existed: nothing was owed, because nothing could be. */
      if (!st.debt) st.debt = { principal: 0 };
      /* And the reserve starts keeping its own curve. An empty list is the
         truth: the save has a solvency but no record of how it got there. */
      if (!st.solvencyHistory) st.solvencyHistory = [];
      st.version = 25;
    }
    if (st.version < 26) {                    // the productive economy
      /* A save written before §7.10 has no productive economy at all, so it
         gets the opening figures from content rather than a guess — the same
         answer reconcile() gives a save with a hole in st.stations. The
         history starts as one point, because one point is the truth: the
         save has an economy and no record of how it got there. */
      /* economyOf(null) and not economyOf(C), because migrate() is handed a
         save and not the content — the same reason the v3 block two hundred
         lines up says pricesOf(null). Aligning to whatever content actually
         opens with is reconcile()'s job, and it runs on every load. */
      if (!st.economy) st.economy = economyOf(null);
      if (!st.economyHistory) st.economyHistory =
        { participation: [st.economy.participation], trade: [st.economy.trade] };
      st.version = 26;
    }
    if (st.version < 27) {                    // reserved order-paper time
      /* Time a measure brings with it is held apart from the session's own
         (see reserveSlots). A save from before has none reserved, which is
         the truth: the crisis time it was granted went into the general
         pool, and that save keeps the larger pool it was given. */
      if (st.slots && !st.slots.reserved) st.slots.reserved = {};
      st.version = 27;
    }
    if (st.version < 28) {                    // sitting periods
      /* The next rise was `sessionEnds`. And a save written while a run was
         three SESSIONS carries the later ones in its session number: they
         were periods of one session all along, so the count moves across. */
      if (st.risesAt == null && st.sessionEnds != null) st.risesAt = st.sessionEnds;
      delete st.sessionEnds;
      if (st.period == null) {
        const opened = st.parliamentOpenedAt != null ? st.parliamentOpenedAt : st.session;
        st.period = Math.max(1, st.session - opened + 1);
        st.session = opened;
      }
      st.version = 28;
    }
    if (st.version < 29) {                    // named creditors
      /* One principal, owed to Earth, becomes a table keyed by lender. The
         only lender there was is Earth's markets, so the figure moves across
         whole. */
      const was = (st.debt && st.debt.principal) || 0;
      st.debt = { owed: (st.debt && st.debt.owed) || {} };
      if (was) st.debt.owed.earth = (st.debt.owed.earth || 0) + was;
      st.version = 29;
    }
    if (st.version < 30) {                    // campaigns
      /* A save from before campaigns played the only one there was;
         reconcile() names it from the content it is loaded with. */
      if (st.campaign === undefined) st.campaign = null;
      st.version = 30;
    }
    return st;
  }

  /* Bring a save's content-derived tables into line with content as it now
     is. A save freezes a copy of the station roster and the district roll at
     the moment it was written; content keeps moving. Adding a station left
     older saves with a hole in st.stations, and the orbital chart read .band
     off undefined and rendered nothing at all — a blank tab, no error the
     player could see.

     The split is between what the save OWNS and what content owns:

       content owns identity — name, band, type, form, settlements, seats.
         A renamed or resized station must show its current name and return
         its current number of members, or the chamber arithmetic disagrees
         with the map. No content effect writes any of these.

       the save owns simulation — closure, suspended, attested and anything
         else play has moved. Those are taken from the save wherever the save
         has them, and from content only when it does not.

     Stations content has dropped are dropped. Constituencies content has
     added enter the roll on their authored holder; ones it has dropped leave
     it. Everything else about the roll is the save's, because who sits for a
     seat is exactly what play decides. */
  let lastReconcile = null;
  const STATION_IDENTITY = ["name", "band", "type", "form", "seats", "settlements",
                            "material_interest", "dependency", "grievance"];

  function reconcile(st, C) {
    if (!C) return st;
    const notes = { stationsAdded: [], stationsDropped: [], seatsAdded: [], seatsDropped: [],
                    partiesAdded: [], currentsAdded: [], cabinetAdded: [], cabinetRepaired: [],
                    functionalAdded: [], functionalDropped: [], instrumentsAdded: [],
                    billsAdded: [], charactersAdded: [],
                    actorsAdded: [], actorsDropped: [] };

    /* An actor added to content after a save was written appears at its
       content standing; one removed from content goes. Same contract as
       stations: content owns identity, the save owns simulation. */
    seedActors(st, C, notes);

    /* THE SCALARS CONTENT DECLARES. Content owns the ROSTER (which meters
       exist); the save owns each meter's value, because every one of them
       is play. A meter added to content since a save was written must
       appear at its opening value — without this the meters panel renders
       `width:undefined%` and the readout says "undefined", which is how
       Flash I's three new meters arrived on every save written before
       them. */
    st.scalars = st.scalars || {};
    /* LAW IS CONTENT-OWNED TOO, and was not backfilled. Adding a law key
       left every existing save holding `undefined` for it, exactly as adding
       a station once left a hole in st.stations — and a law key the tick does
       arithmetic on would have carried that undefined into solvency as NaN.
       Same rule as the scalars below: content owns the key, the save owns
       whatever the government has since done to it. */
    /* A BAND ADDED TO THE ROLL NEEDS A NUMBER, the way a new station needed
       an entry in st.stations. Missing means the save predates it, and the
       honest value is the national figure it has been carrying all along. */
    st.standing = st.standing || {};
    bandsOf(C).forEach(b => {
      if (st.standing[b] == null)
        st.standing[b] = st.scalars.public_standing == null ? 50 : st.scalars.public_standing;
    });
    syncStanding(st, C);

    Object.keys(C.setup.law || {}).forEach(k => {
      if (st.law[k] === undefined) st.law[k] = C.setup.law[k];
    });
    Object.keys(C.setup.scalars || {}).forEach(k => {
      if (st.scalars[k] == null) st.scalars[k] = C.setup.scalars[k];
    });

    /* THE PRODUCTIVE ECONOMY, same rule as the scalars and the law above:
       content owns which measures exist and what they open at, the save
       owns where they have got to. A save from before §7.10 arrives here
       with the engine's defaults from migrate() — which has no content to
       read — and a content opening figure it never saw; a save from before
       a measure was ADDED arrives with a hole. Both are the same fix, and
       it is the reason reconcile runs on every load. */
    st.economy = st.economy || {};
    st.economyHistory = st.economyHistory || {};
    Object.keys(economyOf(C)).forEach(k => {
      if (st.economy[k] == null) st.economy[k] = economyOf(C)[k];
      /* `private` is authored, never drifted, so it keeps no curve. */
      if (k !== "private" && !st.economyHistory[k])
        st.economyHistory[k] = [st.economy[k]];
    });

    st.stations = st.stations || {};
    C.stations.forEach(s0 => {
      const was = st.stations[s0.id];
      if (!was) { st.stations[s0.id] = JSON.parse(JSON.stringify(s0)); notes.stationsAdded.push(s0.id); return; }
      const now = JSON.parse(JSON.stringify(s0));
      Object.keys(now).forEach(f => {
        if (STATION_IDENTITY.indexOf(f) >= 0) return;      // content wins
        if (was[f] !== undefined) now[f] = was[f];         // the save wins
      });
      st.stations[s0.id] = now;
    });
    Object.keys(st.stations).forEach(id => {
      if (!C.stationById[id]) { delete st.stations[id]; notes.stationsDropped.push(id); }
    });

    /* Parties and currents the save has never seen. Content owns identity, so a
       content party the save lacks is seeded whole; syncRoll() below then
       refreshes its district count from the roll. Without this, a save written
       before a party existed leaves st.parties[id] undefined, and the chamber,
       the orbit chart and the Concordance - all of which iterate C.parties and
       read the save - throw and leave blank panels. */
    st.parties = st.parties || {};
    C.parties.forEach(p0 => {
      if (st.parties[p0.id]) return;
      st.parties[p0.id] = {
        id: p0.id, loyalty: p0.loyalty == null ? 100 : p0.loyalty,
        seats: Object.assign({}, p0.seats)
      };
      notes.partiesAdded.push(p0.id);
    });
    st.currents = st.currents || {};
    (C.currents || []).forEach(c0 => {
      if (st.currents[c0.id]) return;
      st.currents[c0.id] = { id: c0.id, loyalty: c0.loyalty, members: c0.members };
      notes.currentsAdded.push(c0.id);
    });

    /* Cabinet. Content owns the post; the save owns who holds it, because
       appointments, refusals and resignations are play. But a holder id content
       no longer names is a recast, not a decision — repair it to content's
       holder, or the panel prints a raw id like "onyema". Posts content has
       added are seeded whole, so a save written before a ministry existed still
       opens and the panel does not read undefined. */
    st.cabinet = st.cabinet || {};
    (C.cabinet || []).forEach(p0 => {
      const was = st.cabinet[p0.id];
      if (!was) {
        st.cabinet[p0.id] = { id: p0.id, holder: p0.holder || null, party: p0.party || null };
        notes.cabinetAdded.push(p0.id);
        return;
      }
      if (was.holder && !C.characterById[was.holder]) {
        was.holder = p0.holder || null;
        was.party = p0.party || null;
        notes.cabinetRepaired.push(p0.id);
      }
    });

    if (st.roll) {
      (C.constituencies || []).forEach(k => {
        if (st.roll[k.id]) {
          /* keep the flag in step with content, in case it was added later */
          if (k.nonVoting) st.roll[k.id].nonVoting = true;
          else delete st.roll[k.id].nonVoting;
          return;
        }
        st.roll[k.id] = { held: Object.assign({}, k.held), vacant: 0 };
        if (k.nonVoting) st.roll[k.id].nonVoting = true;
        notes.seatsAdded.push(k.id);
      });
      Object.keys(st.roll).forEach(cid => {
        if (!C.constituencyById[cid]) { delete st.roll[cid]; notes.seatsDropped.push(cid); }
      });
      syncRoll(st, C);
    }

    /* The functional roll, on the same terms: content owns the opening
       holdings, the save owns what play has moved, and a constituency content
       has added is seeded from its authored holder. The party total is then
       derived by syncFunctional(), so the panel and the divisions agree. */
    st.functional = st.functional || {};
    (C.functional || []).forEach(f0 => {
      if (st.functional[f0.id]) return;
      st.functional[f0.id] = { held: Object.assign({}, f0.held || {}) };
      notes.functionalAdded.push(f0.id);
    });
    Object.keys(st.functional).forEach(fid => {
      if (!C.functionalById || !C.functionalById[fid]) {
        delete st.functional[fid]; notes.functionalDropped.push(fid);
      }
    });
    syncFunctional(st, C);

    /* INSTRUMENTS, BILLS AND CHARACTERS THE SAVE HAS NEVER SEEN. The same rule
       as parties above, and the same failure: content added after a save was
       written leaves st.instruments[id] undefined, the order paper and the
       instruments panel read it, and the render throws and leaves blank panels.
       This is what bit a save written before the escalation ladder. Content owns
       identity; the save owns what play has done to it, so a new one is seeded
       in its opening state and an existing one is left exactly as it is. */
    st.instruments = st.instruments || {};
    (C.instruments || []).forEach(i0 => {
      if (st.instruments[i0.id]) return;
      st.instruments[i0.id] = {
        id: i0.id, made: false, inForce: false, revoked: false,
        madeAt: null, prayerCloses: null, effectApplied: false };
      notes.instrumentsAdded.push(i0.id);
    });
    st.bills = st.bills || {};
    (C.bills || []).forEach(b0 => {
      if (st.bills[b0.id]) return;
      st.bills[b0.id] = { id: b0.id, stage: b0.stage, dead: false, amendments: [] };
      notes.billsAdded.push(b0.id);
    });
    st.characters = st.characters || {};
    (C.characters || []).forEach(ch0 => {
      if (st.characters[ch0.id]) return;
      st.characters[ch0.id] = { id: ch0.id,
        relationship: ch0.relationship == null ? 50 : ch0.relationship, alive: true };
      notes.charactersAdded.push(ch0.id);
    });

    /* Notes live on the module, not on the state. Anything written onto st
       here would be saved, reloaded and compared, and a save would stop
       round-tripping to an identical state — which tools/uitest.js checks
       and which is the whole basis of the roundtrip test. */
    lastReconcile = notes;
    /* a save from before campaigns is the campaign it is loaded as */
    if (st.campaign == null && C.campaign) st.campaign = C.campaign;
    /* and on every load, so a save written before the loyalties were linked
       reads its meter off its currents like a new game does */
    syncLoyalty(st, C);
    return st;
  }

  /* ---------------------------------------------------------
     1b. THE DISTRICT ROLL — who sits for which constituency

     Every district seat lives here, in one place, and every district
     total in the game is DERIVED from it. Storing a party's district
     count alongside the roll is the apportionment_ratio mistake in
     CLAUDE.md: two numbers for one fact, drifting quietly apart. The
     count on st.parties[id].seats.district is a projection refreshed
     by syncRoll() after every change, and test.js asserts the two
     agree in both directions.

     A seat moves in exactly four ways, which is the whole point:
       vacateSeat   a member dies, resigns or is disqualified
       byElection   the vacancy is filled, on current opinion
       crossFloor   a member changes party without an election
       generalElection  everything is returned at once

     Vacancies are real. The chamber stays 280 seats and the majority
     stays 141, so an empty seat is a vote you do not have.
     --------------------------------------------------------- */

  /* ONE BACKFILL, CALLED FROM BOTH ENDS. Seeding in newGame and backfilling
     in reconcile from two copies of the same loop is how a new game and a
     reloaded one come to disagree — which they did, and the save round-trip
     check caught it on the first run: newGame left the roster empty, load
     filled it, and the two states differed by seven actors. */
  function seedActors(st, C, notes) {
    st.actors = st.actors || {};
    (C.actors || []).forEach(a => {
      if (st.actors[a.id]) return;
      st.actors[a.id] = { standing: a.standing == null ? 50 : a.standing,
                          patience: a.patience == null ? 50 : a.patience,
                          lastAct: null };
      if (notes) notes.actorsAdded.push(a.id);
    });
    /* THE TRAIL IS PREFILLED, so the opening reading is the opening standing
       rather than a live number that quietly goes stale over the first
       eleven sittings. Backfilled here for the same reason stations are:
       a save written before this existed has no trail, and a body added to
       content after it was written has none either. */
    st.foreign = st.foreign || {};
    (C.actors || []).forEach(a => {
      const live = st.actors[a.id]; if (!live) return;
      const lag = a.lag || 0;
      const f = st.foreign[a.id] || (st.foreign[a.id] = { trail: [] });
      f.lag = lag;
      if (!f.trail.length)
        for (let i = 0; i <= lag; i++) f.trail.push(live.standing);
    });
    Object.keys(st.foreign).forEach(id => {
      if (!st.actors[id]) delete st.foreign[id];
    });
    Object.keys(st.actors).forEach(id => {
      if ((C.actorById || {})[id]) return;
      delete st.actors[id];
      if (notes) notes.actorsDropped.push(id);
    });
    st.lobby = st.lobby || {};
    st.clauses = st.clauses || {};
    return st;
  }

  function seedRoll(st, C) {
    st.roll = {};
    (C.constituencies || []).forEach(k => {
      st.roll[k.id] = { held: Object.assign({}, k.held || {}), vacant: 0 };
      if (k.nonVoting) st.roll[k.id].nonVoting = true;
    });
    syncRoll(st, C);
  }

  /* Refresh the derived district counts. The only writer. A non-voting seat
     (the capital territory) lives in the roll so it has a holder and shows
     in the panels, but it is never counted: it is not part of the tier, the
     chamber or a division. */
  function syncRoll(st, C) {
    Object.keys(st.parties).forEach(id => { st.parties[id].seats.district = 0; });
    Object.keys(st.roll).forEach(cid => {
      if (st.roll[cid].nonVoting) return;
      const h = st.roll[cid].held;
      Object.keys(h).forEach(pid => {
        if (st.parties[pid]) st.parties[pid].seats.district += h[pid];
      });
    });
    return st;
  }

  /* ---------------------------------------------------------
     1c. THE FUNCTIONAL ROLL — who holds which functional seat

     The same rule as the district roll: every functional seat lives in
     one place and every functional total is DERIVED from it. The count
     on st.parties[id].seats.functional is a projection refreshed by
     syncFunctional() and never written directly. A functional seat
     moves by the `functional` effect, which names the constituency, so
     the panel, the tooltips and the divisions can never disagree about
     who holds what.
     --------------------------------------------------------- */

  function seedFunctional(st, C) {
    st.functional = {};
    (C.functional || []).forEach(f => {
      st.functional[f.id] = { held: Object.assign({}, f.held || {}) };
    });
    syncFunctional(st, C);
  }

  /* Refresh the derived functional counts. The only writer. */
  function syncFunctional(st, C) {
    Object.keys(st.parties).forEach(id => { st.parties[id].seats.functional = 0; });
    Object.keys(st.functional || {}).forEach(fid => {
      const h = st.functional[fid].held;
      Object.keys(h).forEach(pid => {
        if (st.parties[pid]) st.parties[pid].seats.functional += h[pid];
      });
    });
    return st;
  }

  function partyDistrict(st, id) {
    return Object.keys(st.roll || {}).reduce(
      (n, cid) => st.roll[cid].nonVoting ? n : n + (st.roll[cid].held[id] || 0), 0);
  }
  function vacantSeats(st) {
    return Object.keys(st.roll || {}).reduce(
      (n, cid) => st.roll[cid].nonVoting ? n : n + st.roll[cid].vacant, 0);
  }
  function seatsFor(st, cid) { return st.roll[cid] || { held: {}, vacant: 0 }; }

  function vacateSeat(st, C, cid, party, why) {
    const r = st.roll[cid];
    if (!r || !r.held[party]) return { ok: false, reason: "no such seat" };
    r.held[party] -= 1;
    if (!r.held[party]) delete r.held[party];
    r.vacant += 1;
    syncRoll(st, C);
    const k = C.constituencyById[cid];
    st.log.unshift({ sitting: st.sitting,
      text: `Seat vacated: ${k ? k.name : cid} (${party})${why ? ", " + why : ""}` });
    return { ok: true };
  }

  function crossFloor(st, C, cid, from, to, n) {
    n = n || 1;
    const r = st.roll[cid];
    if (!r || (r.held[from] || 0) < n) return { ok: false, reason: "seats not held" };
    if (!st.parties[to]) return { ok: false, reason: "no such party" };
    r.held[from] -= n;
    if (!r.held[from]) delete r.held[from];
    r.held[to] = (r.held[to] || 0) + n;
    syncRoll(st, C);
    const k = C.constituencyById[cid];
    st.log.unshift({ sitting: st.sitting,
      text: `Crossed the floor: ${n} seat${n === 1 ? "" : "s"} for ` +
            `${k ? k.name : cid}, ${from} to ${to}` });
    return { ok: true, seats: n };
  }

  /* ---- votes ----------------------------------------------------

     THE ELECTION IS A VOTE, NOT A SEAT COUNT WITH A MOOD (design/38 §1).
     A seat's share was 0.68 for its holder and 0.32 times a national figure
     for everybody else, so no swing any meter could produce took a single
     district, and across the whole standing meter the PSD moved from 78
     seats to 93. A district now has a NOTIONAL RESULT, the last election's
     vote there, derived once from content:

       - each party's list vote at the last election (`parties[].vote`,
         per cent), which is its strength anywhere;
       - raised where it is strong locally, by the share of the station's
         and the band's seats it held, and lowered where it held none;
       - and the holder ahead of the runner-up by a margin that grows with
         how completely it held the station and the band around the seat.
         A party that held every seat on its station is safe; one that
         holds a seat on a station the others share is marginal.

     Nothing here names a station, a party or a band: every number is read
     off the opening roll, and `setup.election` holds the constants. A
     constituency may carry `notional` (its own shares, per cent) to replace
     the derivation, which is where an author puts a real result. */
  const NOTIONAL = new WeakMap();
  function electionConst(C) {
    const E = (C && C.setup && C.setup.election) || {};
    return { swing: E.swing == null ? 0.35 : E.swing,
             localFloor: E.localFloor == null ? 0.4 : E.localFloor,
             localLift: E.localLift == null ? 2.0 : E.localLift,
             marginMin: E.marginMin == null ? 0.005 : E.marginMin,
             marginSpan: E.marginSpan == null ? 0.35 : E.marginSpan,
             marginShape: E.marginShape == null ? 1.6 : E.marginShape,
             functional: E.functional || {} };
  }
  /* The last election's list vote, as shares of every vote cast. A party
     with no `vote` is derived from its list seats, so a world that has not
     written one still works; whatever the parties do not account for went
     to lists that won nothing. */
  function lastVote(C) {
    const out = {};
    const written = C.parties.some(p => p.vote != null);
    if (written) C.parties.forEach(p => out[p.id] = (p.vote || 0) / 100);
    else {
      const tot = C.parties.reduce((n, p) => n + ((p.seats && p.seats.list) || 0), 0) || 1;
      C.parties.forEach(p => out[p.id] = ((p.seats && p.seats.list) || 0) / tot * 0.97);
    }
    return out;
  }
  function notionalAll(C) {
    let m = NOTIONAL.get(C);
    if (m) return m;
    m = {};
    const K = electionConst(C), vote = lastVote(C);
    const seats = (C.constituencies || []).filter(k => !k.nonVoting);
    const held = k => Object.keys(k.held || {}).find(id => k.held[id] > 0) || null;
    const shareIn = (list, id) => list.length ? list.filter(k => held(k) === id).length / list.length : 0;
    const byStation = {}, byBand = {};
    seats.forEach(k => { (byStation[k.station] = byStation[k.station] || []).push(k);
                         (byBand[k.band] = byBand[k.band] || []).push(k); });
    /* Natural shares first: national vote, lifted where the party is
       strong around the seat. */
    const local = (k, id) => 0.6 * shareIn(byStation[k.station] || [], id) +
                             0.4 * shareIn(byBand[k.band] || [], id);
    const nat = {}, dom = [];
    seats.forEach(k => {
      if (k.notional) return;
      const h = held(k), out = {};
      C.parties.forEach(p => {
        const v = vote[p.id] || 0;
        if (v > 0) out[p.id] = v * (K.localFloor + K.localLift * local(k, p.id));
      });
      if (h && out[h] == null) out[h] = 0;
      const tot = Object.values(out).reduce((a, b) => a + b, 0) || 1;
      Object.keys(out).forEach(id => out[id] /= tot);
      nat[k.id] = out;
      if (h) dom.push({ id: k.id, by: h, d: local(k, h) + 1e-6 * dom.length });
    });
    /* THE HOLDER WON IT, BY A MARGIN THAT SAYS HOW SAFE THE SEAT IS. Each
       party's seats are ranked against its own by how completely it held
       the ground around them, and the rank sets the margin:
       `marginMin + marginSpan * r^marginShape` for rank r from 0 (its most
       exposed seat) to 1 (its heartland). A margin read straight off local
       strength put nearly every seat ten or more points clear, so nothing
       moved until everything did; ranked across the whole House, the
       largest party's concentrated seats all came out safe and a
       government could lose standing for twenty points without losing a
       seat. Every party has marginals and heartlands, which is what makes
       a swing of a few points worth a few seats in either direction. */
    const rank = {};
    Array.from(new Set(dom.map(x => x.by))).forEach(pid => {
      const mine = dom.filter(x => x.by === pid).sort((a, b) => a.d - b.d);
      mine.forEach((x, i) => rank[x.id] = mine.length > 1 ? i / (mine.length - 1) : 0.5);
    });
    seats.forEach(k => {
      if (k.notional) {
        const t = Object.values(k.notional).reduce((a, b) => a + b, 0) || 1;
        m[k.id] = {}; Object.keys(k.notional).forEach(id => m[k.id][id] = k.notional[id] / t);
        return;
      }
      const out = nat[k.id], h = held(k);
      if (h) {
        const want = K.marginMin + K.marginSpan * Math.pow(rank[k.id], K.marginShape);
        const others = Object.keys(out).filter(id => id !== h);
        const r = Math.max(0, ...others.map(id => out[id]));
        const O = 1 - out[h];
        /* x moves from the holder to the others in proportion, so the
           rival stays the rival and the margin lands exactly on `want`. */
        const x = O > 0 ? (out[h] - r - want) / (1 + r / O) : 0;
        others.forEach(id => out[id] += x * out[id] / (O || 1));
        out[h] -= x;
      }
      m[k.id] = out;
    });
    NOTIONAL.set(C, m);
    return m;
  }
  /* The notional result in one seat, as shares of one. */
  function shares(st, C, cons) {
    return Object.assign({}, notionalAll(C)[cons.id] || {});
  }

  /* ---------------------------------------------------------
     STANDING, BY BAND (design/33 §5).

     `public_standing` was one national number, so the campaign resolved a
     single scalar and the annexation's four seats were arithmetic rather
     than politics. A closure on a low-band habitat and a concession to the
     ring read identically to the electorate, which is the one thing an
     electorate never does.

     THE BANDS COME FROM THE ROLL, not from a list in here. The engine names
     no station and no band; it reads whatever bands the constituencies
     declare, which today is five and tomorrow is whatever content says.
     Five is still a politics. Thirty-five stations would not be — that is
     the failure mode §7.6 exists to prevent.

     ONE SOURCE, AND THE NATIONAL NUMBER IS DERIVED. `st.scalars.public_standing`
     is read all over the engine, the interface and content, and it stays
     exactly where it was — but it is now the electorate-weighted mean of
     the bands, recomputed by syncStanding() and written nowhere else. Two
     numbers for one fact is how apportionment_ratio drifted, and this is
     the same fact seen at two resolutions.

     A bare {move:{public_standing:n}} still works and still means what it
     meant: it moves every band alike, which is what a national event does.
     {move:{"standing.low":-8}} is the new sentence.
     --------------------------------------------------------- */
  function bandsOf(C) {
    const seen = [];
    (C.constituencies || []).forEach(k => {
      if (k.band && seen.indexOf(k.band) < 0) seen.push(k.band);
    });
    return seen;
  }

  function bandWeight(C) {
    const w = {};
    (C.constituencies || []).forEach(k => {
      if (!k.band) return;
      w[k.band] = (w[k.band] || 0) + (k.electorate || 0);
    });
    return w;
  }

  /* The national figure, from the bands that make it up. */
  function syncStanding(st, C) {
    if (!st.standing) return;
    const w = bandWeight(C);
    let num = 0, den = 0;
    Object.keys(st.standing).forEach(b => {
      const n = w[b] || 0;
      num += st.standing[b] * n; den += n;
    });
    if (den > 0) st.scalars.public_standing = clamp(Math.round(num / den), 0, 100);
  }

  /* What the government's standing is where this seat is. */
  function standingIn(st, band) {
    if (band && st.standing && st.standing[band] != null) return st.standing[band];
    return st.scalars.public_standing;
  }

  /* THE SWING, IN POINTS OF THE VOTE (design/38 §1). Standing 50 is the
     mood the last parliament was elected in; every point of standing away
     from it moves `setup.election.swing` of a point of the vote between the
     government's side and everybody else, read WHERE THE SEAT IS when the
     caller knows. A party's `swing` (default 1) weights how much of the
     tide reaches it: independents who hold their seats on a personal vote
     carry 0. Inside a side the points go in proportion to the vote, so a
     party with nothing in a seat gains nothing there. */
  function swing(st, band, C) {
    return electionConst(C).swing * (standingIn(st, band) - 50) / 100;
  }
  function govSide(st) { return st.coalition.concat(st.confidenceSupply); }
  function tide(C, id) {
    const p = C && C.partyById && C.partyById[id];
    return p && p.swing != null ? p.swing : 1;
  }
  function applySwing(st, C, sh, delta) {
    const gov = govSide(st);
    const w = id => (sh[id] || 0) * tide(C, id);
    const G = Object.keys(sh).filter(id => gov.includes(id)).reduce((n, id) => n + w(id), 0);
    const O = Object.keys(sh).filter(id => !gov.includes(id)).reduce((n, id) => n + w(id), 0);
    if (!G || !O) return sh;
    const d = Math.max(-0.95 * G, Math.min(0.95 * O, delta));
    const out = {};
    Object.keys(sh).forEach(id => {
      out[id] = Math.max(0, gov.includes(id) ? sh[id] + d * w(id) / G : sh[id] - d * w(id) / O);
    });
    return out;
  }
  function swungShares(st, C, cons) {
    return applySwing(st, C, shares(st, C, cons), swing(st, cons && cons.band, C));
  }

  /* THE LIST IS A SECOND BALLOT (4.1), not a projection of the first: the
     last election's list vote (`parties[].vote`), swung on the national
     standing. Shares of every vote cast, so what the parties do not account
     for is the wasted vote, and the threshold reads against the whole. */
  function nationalShares(st, C) {
    return applySwing(st, C, lastVote(C), swing(st, null, C));
  }

  /* THE FUNCTIONAL TIER IS ELECTED TOO (bible 4.6; design/38 §1). It went
     through every count unchanged. Each sector's result is its current
     roll, so the licensing board's widened franchise carries into it, and
     the tide reaches it by franchise: `setup.election.functional` weights
     how far a sector's electors follow the country (a residual seat of
     everyone follows it all the way; a sector where companies vote barely
     at all). */
  function functionalShares(st, C, f) {
    const h = ((st.functional || {})[f.id] || {}).held || f.held || {};
    const n = Object.values(h).reduce((a, b) => a + b, 0) || 1;
    const sh = {}; Object.keys(h).forEach(id => { if (h[id] > 0) sh[id] = h[id] / n; });
    const k = electionConst(C).functional[f.franchise];
    return applySwing(st, C, sh, swing(st, null, C) * (k == null ? 0.3 : k));
  }
  /* Largest remainders: at no swing it returns the roll exactly, which a
     divisor method over a sector of three or four seats does not. */
  function largestRemainder(sh, seats) {
    const ids = Object.keys(sh).filter(i => sh[i] > 0).sort();
    const tot = ids.reduce((n, i) => n + sh[i], 0) || 1;
    const won = {}, rem = [];
    let given = 0;
    ids.forEach(i => { const q = sh[i] / tot * seats; won[i] = Math.floor(q + 1e-9); given += won[i];
                       rem.push([i, q - won[i]]); });
    rem.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
    for (let j = 0; given < seats && j < rem.length; j++, given++) won[rem[j][0]] += 1;
    Object.keys(won).forEach(i => { if (!won[i]) delete won[i]; });
    return won;
  }

  /* Highest averages. Ties break on party id so a rerun is identical. */
  /* Highest averages. Over a single seat this is plurality — first past
     the post — which is what every district now is, so "fptp" needs no
     separate branch and is accepted as a name for that case. */
  function divisorAllocate(sh, seats, method) {
    const ids = Object.keys(sh).filter(i => sh[i] > 0).sort();
    const won = {}; ids.forEach(i => won[i] = 0);
    for (let n = 0; n < seats; n++) {
      let best = null, bestQ = -Infinity;
      ids.forEach(i => {
        const d = method === "sainte_lague" ? (2 * won[i] + 1) : (won[i] + 1);
        const q = sh[i] / d;
        if (q > bestQ + 1e-12) { bestQ = q; best = i; }
      });
      if (best === null) break;
      won[best] += 1;
    }
    Object.keys(won).forEach(i => { if (!won[i]) delete won[i]; });
    return won;
  }

  /* A by-election fills every vacancy in one constituency on current
     opinion. The seat is not returned to whoever lost it. */
  function byElection(st, C, cid) {
    const r = st.roll[cid];
    const k = C.constituencyById[cid];
    if (!r || !k) return { ok: false, reason: "no such constituency" };
    if (!r.vacant) return { ok: false, reason: "no vacancy" };
    const before = Object.assign({}, r.held);
    const won = divisorAllocate(swungShares(st, C, k), r.vacant,
                                st.law.district_divisor);
    Object.keys(won).forEach(pid => r.held[pid] = (r.held[pid] || 0) + won[pid]);
    const filled = r.vacant; r.vacant = 0;
    syncRoll(st, C);
    const gains = Object.keys(won).filter(p => (before[p] || 0) === 0);
    st.log.unshift({ sitting: st.sitting,
      text: `By-election, ${k.name}: ${filled} seat${filled === 1 ? "" : "s"} filled` +
            (gains.length ? `, gain for ${gains.join(", ")}` : ", no change of hands") });
    st.wire.unshift({ sitting: st.sitting,
      text: `BY-ELECTION ${k.name.toUpperCase()}: ` +
            Object.keys(won).map(p => `${p.toUpperCase()} ${won[p]}`).join(", ") });
    return { ok: true, filled: filled, won: won, gains: gains };
  }

  /* The general election. District races run constituency by
     constituency; the list runs once, nationally, and does not
     compensate for district results (4.1, parallel not MMP).

     The threshold (4.8) bites on the list only, and exempts a party
     that won a district seat — the German carve-out canon adopts. */
  function generalElection(st, C) {
    const districtResults = {};
    Object.keys(st.roll).forEach(cid => {
      const k = C.constituencyById[cid];
      if (!k || k.nonVoting) return;   /* the capital territory is not contested */
      const won = divisorAllocate(swungShares(st, C, k), k.magnitude,
                                  st.law.district_divisor);
      districtResults[cid] = won;
    });

    const before = {};
    C.parties.forEach(p => before[p.id] = {
      district: partyDistrict(st, p.id), list: st.parties[p.id].seats.list || 0,
      functional: st.parties[p.id].seats.functional || 0
    });

    Object.keys(districtResults).forEach(cid => {
      st.roll[cid] = { held: Object.assign({}, districtResults[cid]), vacant: 0 };
    });

    const nat = nationalShares(st, C);

    /* The threshold (4.8) bites on the list only. Two exemptions, both canon:
       a party that won a district seat (the German carve-out), and a party
       representing a single station or a single legal-person category, as
       minority protection. The second is declared in content, because which
       parties qualify is a political question and not the engine's to decide. */
    const cut = (st.law.threshold_pct || 0) / 100;
    const wonDistrict = id => Object.keys(districtResults)
      .some(cid => districtResults[cid][id]);
    const carved = id => !!(C.partyById[id] && C.partyById[id].carve_out);
    const eligibleList = {};
    Object.keys(nat).forEach(id => {
      if (nat[id] >= cut || wonDistrict(id) || carved(id)) eligibleList[id] = nat[id];
    });
    const listSeats = st.law.tier_ratio_list || 100;
    const listWon = divisorAllocate(eligibleList, listSeats, st.law.list_divisor);
    C.parties.forEach(p => st.parties[p.id].seats.list = listWon[p.id] || 0);

    /* The functional tier, sector by sector (design/38 §1). */
    (C.functional || []).forEach(f => {
      if (!st.functional || !st.functional[f.id]) return;
      st.functional[f.id].held = largestRemainder(functionalShares(st, C, f), f.seats);
    });
    syncFunctional(st, C);

    syncRoll(st, C);
    st.lastElection = { sitting: st.sitting, nat: nat, threshold: cut,
                        barred: Object.keys(nat).filter(id => !eligibleList[id] && nat[id] > 0),
                        saved: Object.keys(eligibleList).filter(id =>
                          nat[id] < cut && (wonDistrict(id) || carved(id))) };
    st.electionsHeld = (st.electionsHeld || 0) + 1;

    const after = {};
    C.parties.forEach(p => after[p.id] = {
      district: partyDistrict(st, p.id), list: st.parties[p.id].seats.list,
      functional: st.parties[p.id].seats.functional || 0
    });
    const tot = x => x.district + x.list + (x.functional || 0);
    st.log.unshift({ sitting: st.sitting, text: "GENERAL ELECTION" });
    C.parties.forEach(p => {
      const d = tot(after[p.id]) - tot(before[p.id]);
      if (d) st.log.unshift({ sitting: st.sitting,
        text: `  ${(C.partyById[p.id] && C.partyById[p.id].short) || p.id}: ${d > 0 ? "+" : ""}${d} ` +
              `(${after[p.id].district} district, ${after[p.id].list} list, ${after[p.id].functional} functional)` });
    });
    return { ok: true, before: before, after: after, national: nat,
             barred: st.lastElection.barred };
  }

  /* ---------------------------------------------------------
     2. SEAT ARITHMETIC
     --------------------------------------------------------- */

  const POPULAR_TIERS = ["district", "list"];

  function tierTotal(st, tier) {
    return Object.values(st.parties).reduce((n, p) => n + (p.seats[tier] || 0), 0);
  }
  function popularTotal(st) { return POPULAR_TIERS.reduce((n, t) => n + tierTotal(st, t), 0); }
  function functionalTotal(st) { return tierTotal(st, "functional"); }
  function chamberTotal(st) { return popularTotal(st) + functionalTotal(st); }

  function partyPopular(st, id) {
    const p = st.parties[id]; if (!p) return 0;
    return POPULAR_TIERS.reduce((n, t) => n + (p.seats[t] || 0), 0);
  }
  function partyFunctional(st, id) {
    const p = st.parties[id]; return p ? (p.seats.functional || 0) : 0;
  }
  function partyTotal(st, id) { return partyPopular(st, id) + partyFunctional(st, id); }

  /* Confidence is derived, never stored. */
  function confidence(st) {
    let n = 0;
    st.coalition.forEach(id => n += partyTotal(st, id));
    st.confidenceSupply.forEach(id => n += partyTotal(st, id));
    return n;
  }
  function majority(st) { return Math.floor(chamberTotal(st) / 2) + 1; }

  /* ---------------------------------------------------------
     3. THE DIVISION CALCULATOR
     -------------------------------------------------------------
     Returns support tier by tier. A bill declares `stances`
     keyed by party id. A stance is one of:

       "for" | "against" | "abstain"
       { for: n }                      // n seats aye, rest against
       { forPct: 0..1 }                // proportion aye
       { free: true }                  // splits on current loyalty

     Parties not listed fall back to axis inference against the
     bill's own `axes`, so a new bill need not enumerate all of them.
     --------------------------------------------------------- */

  /* THE AXES AND THE SCARCE GOODS WERE LITERALS HERE, and that was the
     one place the setting's weighting had genuinely leaked into the
     machinery: adding a dimension the Commonwealth argues along — housing,
     religion, labour — or a fifth thing it prices meant editing
     js/engine.js, which is the rule this project is built on not doing.

     The goods are read from content. The axes are not read from anywhere:
     they are whatever a party and a bill both declare, which is stronger
     than a list because it cannot go stale. */
  const SCARCE_DEFAULT = ["thermal", "substrate", "volume", "transit"];
  const scarceOf = (C) => (C && C.scarcities && C.scarcities.length)
                            ? C.scarcities : SCARCE_DEFAULT;
  const pricesOf  = (C) => scarceOf(C).reduce((m, k) => (m[k] = 100, m), {});
  const historyOf = (C) => scarceOf(C).reduce((m, k) => (m[k] = [100], m), {});

  /* Read from content for the same reason pricesOf is: the engine names no
     number. A save from before §7.10 gets these on migration. `private` has
     no history because nothing drifts it — it moves only when content says
     so, which is what a privatisation is. */
  const economyOf = (C) => {
    const e = (C && C.setup && C.setup.economy) || {};
    return { participation: e.participation == null ? 39  : e.participation,
             trade:         e.trade         == null ? 100 : e.trade,
             private:       e.private       == null ? 0.72 : e.private };
  };
  const economyHistoryOf = (C) => {
    const e = economyOf(C);
    return { participation: [e.participation], trade: [e.trade] };
  };

  /* (The axes need no constant here — see axisAgreement: they are read
     off whatever the party and the bill both declare.) */

  /* ---------------------------------------------------------
     WHO ACTUALLY WALKS THROUGH THE LOBBY

     A party's POSITION is one thing and its TURNOUT is another, and
     the gap between them is the whip's whole job. Two things open it.

     Loyalty: full loyalty delivers every member, none still delivers
     three quarters, because a party is not a coalition of strangers.

     Currents: a party with factions is not one bloc voting at one
     rate. Each current turns out at ITS OWN discipline, and a current
     whose axes disagree with the measure does not turn out for it
     however loyal it is — a faction is defined by its position, which
     is what makes it a faction rather than a mood.

     THE CASE THIS EXISTS FOR is a party with no position on an axis
     whose currents all have one. Agreement is scored against the
     CURRENT's axes, not the party's, so a measure the party is neutral
     on can still cost it a third of its benches. That is the whole
     content of "weighted towards several ideological positions", and
     nothing else in the engine could see it.

     Disagreement only ever costs. A current cannot deliver more
     members than it has, so agreement above the party line buys
     nothing — the upside of a popular measure is that the ones who
     disagree stay home rather than vote against.

     MEMBERS ARE A PROPORTION, NOT A COUNT. Content states a current's
     size; the roll states the party's. An election moves the roll and
     will not move the content, so a current is read as its SHARE of
     its party and resized against whatever the party currently holds.
     Storing faction seats beside party seats is the mistake
     apportionment_ratio already taught us once.
     --------------------------------------------------------- */

  /* The currents of a party as normalised shares, or null if it has none. */
  function benches(st, C, partyId) {
    if (!C || !C.currents || !st.currents) return null;
    const seats = partyTotal(st, partyId);
    if (!seats) return null;
    const cs = C.currents.filter(c => c.party === partyId && st.currents[c.id]);
    if (!cs.length) return null;
    const claimed = cs.reduce((n, c) => n + (st.currents[c.id].members || 0), 0);
    if (!claimed) return null;
    return cs.map(c => ({
      id: c.id, name: c.name,
      share: (st.currents[c.id].members || 0) / claimed,
      loyalty: st.currents[c.id].loyalty,
      axes: c.axes || {}
    }));
  }

  /* A party's currents as SEATS, resized against what the party holds now,
     the same way a division splits them (`benchRows`): each tier
     apportioned by share on its own. For the interface, so a table that
     lists the currents without a measure in front of it sizes them as the
     one with a measure does, and never from the content's `members`, which
     an election leaves behind. */
  function currentSeats(st, C, partyId) {
    const bs = benches(st, C, partyId);
    if (!bs) return null;
    const w = bs.map(b => b.share);
    const P = apportion(partyPopular(st, partyId), w);
    const F = apportion(partyFunctional(st, partyId), w);
    return bs.map((b, i) => ({ id: b.id, name: b.name, loyalty: b.loyalty,
                               seats: P[i] + F[i] }));
  }

  /* The fraction of a party's seats that votes with its stated position.
     `floor` is what indiscipline cannot take away: 0.75 on a whipped
     position, 0 on a free vote, where there is no line to hold.
     `detail`, if given, collects the per-current working for the UI. */
  function turnout(st, C, bill, partyId, floor, detail) {
    const rate = l => floor + (1 - floor) * ((l == null ? 60 : l) / 100);
    const bs = benches(st, C, partyId);

    if (!bs) {
      /* No currents: the party is one bench and its own axes already
         chose its position. Bending here would charge it twice. */
      const p = st.parties[partyId];
      return rate(p ? p.loyalty : 60);
    }

    const billAxes = bill && bill.axes;
    let total = 0;
    bs.forEach(b => {
      let r = rate(b.loyalty);
      if (billAxes) {
        const a = axisAgreement(b.axes, billAxes);
        if (a < 0) r *= (1 + a);          /* a = -1 -> nobody at all */
      }
      total += b.share * r;
      if (detail) detail.push({ id: b.id, name: b.name, share: b.share, rate: r });
    });
    return total;
  }

  function discipline(st, C, partyId, bill, detail) {
    return turnout(st, C, bill, partyId, 0.75, detail);
  }

  /* Split `total` across `weights` so the parts are whole numbers that
     sum to exactly `total`. Largest remainder, because a breakdown whose
     rows do not add up to the row above it is worse than no breakdown. */
  function apportion(total, weights) {
    const sum = weights.reduce((n, w) => n + w, 0);
    if (!sum) return weights.map(() => 0);
    const exact = weights.map(w => (w / sum) * total);
    const out = exact.map(Math.floor);
    let left = total - out.reduce((n, v) => n + v, 0);
    exact.map((v, i) => [v - out[i], i])
      .sort((a, b) => b[0] - a[0])
      .forEach(([, i]) => { if (left > 0) { out[i]++; left--; } });
    return out;
  }

  /* AGREEMENT IS DISTANCE, NOT A MATCH (bible §7.10 / Part XVII).

     The axes used to be categorical strings — ownership "public" or
     "private", personhood "expansionist" or "restrictionist" — and
     agreement was equality, so every disagreement cost the same. A party at
     the far end of the personhood argument and a party one step off it were
     indistinguishable, which is the thing this game is mostly about.

     They are signed now, -1 to +1, and agreement is the COSINE of the two
     positions over the axes they share: do the party and the bill want the
     same direction on the things this measure touches, regardless of how
     hard either pushes. +1 aligned, 0 unrelated, -1 opposed.

     Three formulas were measured against content before this one was kept,
     and the two obvious ones are both wrong:

       `1 - |a - b|`   what the branch this came from used. Biased: two
                       positions drawn from -1..+1 sit about 0.67 apart on
                       average, so it scores the average party-bill pair at
                       +0.412 where the old categorical scoring scored 0.
                       `inferStance` and WHIP_BANDS both cut at +/-0.25 and
                       were calibrated for a score centred on zero, so this
                       reads most of the House as broadly agreeing.

       `a * b`         centred correctly (0.022) but compressed: a party at
                       -0.75 and a bill at -0.3 plainly agree and score
                       0.225, under the threshold. Multiplying two numbers
                       below one shrinks agreement that is really there.

       cosine          centred (0.064) and not compressed, because it
                       normalises out magnitude and measures DIRECTION.

     The politics it produces is the argument for it. On the divergence
     bill: the New Progressive Party 0.92 and the Uplift Alliance 0.95 for,
     the Congregational Democratic Alliance -0.55 and One-G -0.77 against,
     and the governing party 0.02 — split down the middle on the bill it
     inherited, which is the premise of the whole campaign.

     NO LIST, still, and deliberately against the branch this came from,
     which introduced `const AXES = [...]` in the engine. The axes ARE
     whatever dimensions a party and a bill both declare a position on: add
     `housing` to both and it counts, add it to neither and nothing here
     notices. An engine that names the dimensions is an engine that has to
     be edited to add content, which is the one architectural rule. */
  function axisAgreement(partyAxes, billAxes) {
    let score = 0, counted = 0, magP = 0, magB = 0;
    Object.keys(partyAxes || {}).forEach(a => {
      const pa = partyAxes[a], ba = (billAxes || {})[a];
      if (pa == null || ba == null) return;
      /* A string on either side means content has not been converted yet.
         Fall back to equality rather than producing NaN and poisoning every
         score that shares the denominator. */
      if (typeof pa !== "number" || typeof ba !== "number") {
        counted++; score += (pa === ba) ? 1 : -1; return;
      }
      counted++;
      score += pa * ba; magP += pa * pa; magB += ba * ba;
    });
    if (!counted) return 0;
    /* Both at dead centre on every shared axis: no direction to compare, so
       no agreement either way rather than a divide by zero. */
    const m = Math.sqrt(magP) * Math.sqrt(magB);
    return m ? score / m : 0;   // -1 .. +1
  }

  /* `detail`, if given, is filled with the per-current working — but ONLY
     where the count was actually derived from the currents. An explicit
     {for:n} is a number the whips handed the Prime Minister, and
     attributing it to factions afterwards would be the interface
     inventing a reason the content did not give. */
  /* WHAT THE PARTY SAID, as distinct from what it delivers.

     resolveStance() answers "how many ayes" and collapses `against` and
     `abstain` to the same nought, which is arithmetically right and
     politically blind: a party that abstained is one you might move next
     time, and a party that voted against is not. The count could not tell
     you which, so the House could not either.

     The threshold is unchanged and deliberately so. A majority here is a
     majority OF THE MEMBERS — 121 of 240, 21 of 40 (§4.6.1) — not of those
     voting, so an abstention still costs the government exactly what a nay
     costs it. That is a real parliamentary form and not a fudge: under an
     absolute-majority rule, staying out of the lobby is a way of defeating
     something without being seen to. The information is the point.
     Abstention becomes CHEAPER to buy than a vote, once there is anything
     to buy it with (design/23). */
  function stanceKind(st, C, bill, partyId, tier) {
    let s = bill.stances && bill.stances[partyId];
    if (s == null) s = inferStance(st, C, bill, partyId);
    if (s && typeof s === "object" && (s.popular != null || s.functional != null))
      s = (tier === "functional" ? s.functional : s.popular);
    if (s === "abstain") return "abstain";
    /* A party may abstain AND lose members to absence: `{abstain:true,
       absent:n}`. The abstention is still whole — it is a line — and the
       absent are not counted as abstentions (stanceAbsent takes them out
       first). */
    if (s && typeof s === "object" && s.abstain) return "abstain";
    if (s === "against") return "against";
    if (s === "for") return "for";
    return "mixed";          /* {for:n}, {forPct}, {free} — a split bench */
  }

  /* A MEMBER WHO DID NOT VOTE. The fourth thing a seat can be, and the one
     the model had no way for content to say: pairing produced absences and
     nothing else did, so a bill could never state that a bench's members
     were away. A stance may now carry `absent` (seats) or `absentPct`, the
     same shape as `for`/`forPct`. It is additive and defaults to nought, so
     every number in the bible is the number it was. */
  function stanceAbsent(st, C, bill, partyId, tier, seats) {
    let s = bill.stances && bill.stances[partyId];
    if (s == null) s = inferStance(st, C, bill, partyId);
    if (s && typeof s === "object" && (s.popular != null || s.functional != null))
      s = (tier === "functional" ? s.functional : s.popular);
    if (!s || typeof s !== "object") return 0;
    if (s.absentPct != null) return Math.max(0, Math.min(seats, Math.round(seats * s.absentPct)));
    if (s.absent != null) return Math.max(0, Math.min(seats, s.absent));
    return 0;
  }

  function resolveStance(st, C, bill, partyId, tier, detail) {
    const seats = tier === "functional" ? partyFunctional(st, partyId) : partyPopular(st, partyId);
    if (!seats) return 0;

    let s = bill.stances && bill.stances[partyId];
    if (s == null) s = inferStance(st, C, bill, partyId);

    // A stance may be split by bench: { popular: ..., functional: ... }
    if (s && typeof s === "object" && (s.popular != null || s.functional != null)) {
      s = (tier === "functional" ? s.functional : s.popular);
      if (s == null) return 0;
    }

    /* A bare "for" is a party POSITION, not a guarantee of turnout. What it
       actually delivers depends on discipline, and discipline is loyalty
       read faction by faction. The gap between position and delivery is
       exactly what whipping buys back — without it the whip has nothing to
       do. An explicit {for:n} is a stated count and is taken at face value. */
    if (s === "for") return Math.round(seats * discipline(st, C, partyId, bill, detail));
    if (s === "against" || s === "abstain") return 0;
    if (typeof s === "object") {
      /* A free vote has no line to hold, so nothing is floored: a current
         votes at its own conviction and its own view of the measure. */
      if (s.free) return Math.min(seats,
        Math.round(seats * turnout(st, C, bill, partyId, 0, detail)));
      if (s.forPct != null) return Math.min(seats, Math.round(seats * s.forPct));
      if (s.for != null) return Math.min(seats, s.for);   // seats in THIS bench
    }
    return 0;
  }

  function inferStance(st, C, bill, partyId) {
    const def = C.partyById[partyId];
    if (!def || !bill.axes) return "against";
    /* A PARTY WITH NO POSITIONS HAS NO LINE (T14). The Independents declare
       no axes at all, because six members with six arguments do not have a
       caucus view to infer. Their stance is therefore a FREE vote: each of
       the six votes on its own axes and its own conviction, and the bloc on
       the station question is emergent from those axes rather than written
       down anywhere. Without this they were half the bench on every bill,
       which is a party in all but name. */
    if (!def.axes || !Object.keys(def.axes).length) return { free: true };
    const a = axisAgreement(def.axes, bill.axes);
    if (a > 0.25) return "for";
    if (a < -0.25) return "against";
    return { forPct: 0.5 };
  }

  /* ---------------------------------------------------------
     WHIPPING

     What you can move, and what it costs, both depend on how far the
     bill sits from the party's own position on the four axes. A partner
     who broadly agrees is cheap and can be moved a long way. One who
     fundamentally disagrees can be moved barely at all, at any price —
     which is what keeps the axes load-bearing rather than decorative.

     You cannot whip a party outside your coalition. Moving those benches
     is lobbying, which is a different activity with a different currency.
     --------------------------------------------------------- */

  const WHIP_BANDS = [
    { min:  0.25, movable: 1.00, cost: 0.5 },   // broadly agrees
    { min: -0.25, movable: 0.50, cost: 1.0 },   // no strong view
    { min: -9.99, movable: 0.15, cost: 2.5 }    // fundamentally opposed
  ];

  function whipBand(st, C, bill, partyId) {
    const def = C.partyById[partyId];
    const a = def && bill.axes ? axisAgreement(def.axes, bill.axes) : 0;
    return WHIP_BANDS.find(b => a >= b.min);
  }

  /* A PARTY'S OR A CURRENT'S LOYALTY, AS IT STANDS. The live figure is on
     st.currents[id] or st.parties[id]; there is no st.loyalty. The interface
     read one for its whole life, found nothing, and fell back to content's
     OPENING figure, so every loyalty the Party tab printed was the one the
     campaign began with, and reshuffle's "their current takes it
     personally" wrote to it and landed nowhere. One reader, so neither
     side can guess the address again. Null for an id that is neither. */
  function loyaltyOf(st, id) {
    const t = (st.currents || {})[id] || (st.parties || {})[id];
    return t && t.loyalty != null ? t.loyalty : null;
  }

  /* ONE LOYALTY PER BENCH, AND THE REST DERIVED (the author, 23 Sep).
     A party with currents had three figures for one fact: the currents,
     which decide how its members vote; the party's own, which nothing in a
     division read; and, for the government's party, the `party_loyalty`
     meter, which whipping spent and the leadership loss read. They never
     met: measured on one run, the meter at 80 while the Maintenance bloc
     sat at 7.

     So the CURRENTS are stored and the other two are their member-weighted
     mean, the way the national standing is the mean of the bands. A move on
     the party, or on the meter, moves every one of its currents by that
     much. A party with no currents keeps its own figure, and if it is the
     government's party the meter is that figure. */
  function currentsOf(st, C, partyId) {
    return ((C && C.currents) || []).filter(c => c.party === partyId && st.currents[c.id]);
  }
  function syncLoyalty(st, C) {
    Object.keys(st.parties || {}).forEach(pid => {
      const cs = currentsOf(st, C, pid);
      let num = 0, den = 0;
      cs.forEach(c => { const m = st.currents[c.id].members || 0;
                        num += m * st.currents[c.id].loyalty; den += m; });
      if (den) st.parties[pid].loyalty = Math.round(num / den);
    });
    const own = (st.parties || {})[st.playerParty];
    if (own && own.loyalty != null) st.scalars.party_loyalty = own.loyalty;
  }
  function shiftLoyalty(st, C, id, d) {
    if (!d) return;
    if (st.currents[id]) {
      st.currents[id].loyalty = clamp(st.currents[id].loyalty + d, 0, 100);
    } else {
      const cs = currentsOf(st, C, id);
      if (cs.length) cs.forEach(c =>
        st.currents[c.id].loyalty = clamp(st.currents[c.id].loyalty + d, 0, 100));
      else if (st.parties[id])
        st.parties[id].loyalty = clamp(st.parties[id].loyalty + d, 0, 100);
    }
    syncLoyalty(st, C);
  }

  function whippable(st, C, billId, partyId, tier) {
    const bill = C.billById[billId];
    const own = partyId === st.playerParty;
    const inCoalition = st.coalition.includes(partyId);
    const inCS = st.confidenceSupply.includes(partyId);
    if (!inCoalition && !inCS && !own)
       return { max: 0, costPerSeat: 0, reason: "outside the coalition; this is lobbying, not whipping" };

    /* CONFIDENCE AND SUPPLY IS NOT COALITION, and the two were treated
       identically. The arrangement is a promise to vote through the
       BUDGET and to hold on CONFIDENCE, and to be free on everything
       else — so those benches are movable on supply and on confidence
       and immovable on ordinary business. st.confidenceSupply has always
       drawn the distinction; this is the first thing to read it.

       A bill declares itself supply or confidence in content. Until the
       A money bill Bill exists (design/13) nothing does, so today this
       reads as "free on everything", which is the correct answer to a
       House with no budget in it. */
    if (inCS && !inCoalition && !own && !(bill && (bill.supply || bill.confidence)))
      return { max: 0, costPerSeat: 0,
                reason: "confidence and supply only; free on ordinary business" };

    const seats = tier === "functional" ? partyFunctional(st, partyId) : partyPopular(st, partyId);
    const already = resolveStance(st, C, bill, partyId, tier);
    const headroom = seats - already;
    if (headroom <= 0) return { max: 0, costPerSeat: 0, reason: "already voting aye to a member" };

    const band = whipBand(st, C, bill, partyId);
    const max = Math.floor(headroom * band.movable);
    return {
      max: max,
      costPerSeat: band.cost,
      currency: own ? "loyalty" : "capital",
      reason: max ? null : "cannot be moved on this measure"
    };
  }

  function whipsFor(st, billId) { return (st.whips[billId] ||= {}); }

  function setWhip(st, C, billId, partyId, tier, seats) {
    const cap = whippable(st, C, billId, partyId, tier);
    const w = whipsFor(st, billId);
    w[partyId] ||= { popular: 0, functional: 0 };
    w[partyId][tier] = Math.max(0, Math.min(cap.max, Math.round(seats)));
    return w[partyId][tier];
  }

  /* Total price of the plan currently attached to a bill. */
  function whipCost(st, C, billId) {
    const bill = C.billById[billId], w = st.whips[billId] || {};
    const out = { capital: {}, loyalty: 0, seats: 0 };
    Object.keys(w).forEach(pid => {
      ["popular", "functional"].forEach(tier => {
        const n = w[pid][tier] || 0; if (!n) return;
        const band = whipBand(st, C, bill, pid);
        const price = Math.ceil(n * band.cost);
        out.seats += n;
        if (pid === st.playerParty) out.loyalty += price;
        else out.capital[pid] = (out.capital[pid] || 0) + price;
      });
    });
    return out;
  }

  /* Spend it. Going into debt is allowed and costs loyalty with that partner,
     because calling in credit you do not have is a favour, not a transaction. */
  function payWhips(st, C, billId) {
    const cost = whipCost(st, C, billId);
    if (cost.loyalty) {
      shiftLoyalty(st, C, st.playerParty, -cost.loyalty);
    }
    Object.keys(cost.capital).forEach(pid => {
      const before = st.capital[pid] || 0;
      const after = before - cost.capital[pid];
      st.capital[pid] = after;
      if (after < 0) {
        const overdrawn = Math.min(cost.capital[pid], -after);
        if (st.parties[pid]) shiftLoyalty(st, C, pid, -overdrawn * 2);
      }
    });
    delete st.whips[billId];
    return cost;
  }

  function clearWhips(st, billId) { delete st.whips[billId]; }

  /* Call the division. Order matters and getting it wrong is silent: the
     result must be computed while the whip plan is still attached, because
     paying for it clears it. Callers use this rather than sequencing it
     themselves. */
  /* A BILL'S OWN RECORD (design/26 #84). The session log is global and the
     dossier showed only the LAST division, so a measure carried at sitting 6,
     defeated at 14 and re-read at 20 had no page that said so. This is
     written at the same moments the global log is, never derived, and it is
     what a player reads when deciding whether to give a bill more time. */
  function billLog(st, billId, kind, text) {
    const bs = st.bills && st.bills[billId];
    if (!bs) return;
    (bs.history = bs.history || []).unshift({ sitting: st.sitting, kind: kind, text: text });
  }

  function divide(st, C, billId) {
    const chk = canDivide(st, C, billId);
    if (!chk.ok) return { ok: false, reason: chk.reason, result: null, paid: null, assent: null };
    /* House time, spent whether the bill carries or falls, and one of
       the day's divisions whichever way it goes. */
    spendSlotsFor(st, billId, 1);
    st.divisionsToday = (st.divisionsToday || 0) + 1;
    st.actedThisSitting = true;
    const b = C.billById[billId];
    const result = division(st, C, billId);     // whips still in place
    /* A PAIR THAT WAS HONOURED IS A FACT AND WAS RECORDED NOWHERE.
       Pairing landed as a mechanic on 15 September: st.pairs holds the plan,
       division() takes the seats out of both counts, and clearPairs deletes
       the plan afterwards. Nothing anywhere remembered that it happened, so
       `the_pairing_kept` — an event about the courtesy being remembered —
       was gated on a flag no part of this program sets, and could never
       fire. A count, incremented once per division that ran with a pair in
       force, and `pairsKeptAtLeast` reads it. Read with `|| 0` rather than
       migrated: nought is the truth for a save written before the count
       existed, because no pair it kept was ever written down. */
    if (Object.keys((st.pairs || {})[billId] || {})
          .some(pid => ((st.pairs[billId] || {})[pid] || 0) > 0))
      st.pairsKept = (st.pairsKept || 0) + 1;
    const paid = payWhips(st, C, billId);       // now charge for them
    /* And the promises come due later, which is the point of them. Settled
       after the count for the same reason the whips are: the result must be
       computed with the plan still standing. */
    const owed = payLobby(st, C, billId);
    /* A referred bill assents later through reviewReturns(), which never
       saw the division, so the delay is recorded on the bill rather than
       passed down one of the two paths and dropped on the other. */
    if ((result.supply || {}).delay) bs0supply(st, billId, result.supply.delay);
    const bs = st.bills[billId];
    /* THE HOUSE HAS VOTED, AND THAT IS NOW A FACT ABOUT THE BILL. The forecast
       is an estimate and stops being the truth the moment a division runs;
       this is what actually happened. It is kept so the plan and the register
       can show the vote rather than the guess, and it is what a bill that has
       been through the lobbies is drawn from afterwards. Trimmed of the
       content reference, so a save does not carry a copy of the bill. */
    bs.lastDivision = { carries: !!result.carries, popular: result.popular,
                        functional: result.functional, rows: result.rows,
                        at: st.sitting };

    if (!result.carries) {
      apply(st, C, b.onFail);
      bs.stage = "defeated"; bs.dead = true;
      billLog(st, billId, "division", "Defeated on a division" +
        (paid.seats ? ", " + paid.seats + " whipped" : ""));
      st.log.unshift({ sitting: st.sitting, text: "Division: " + b.title + " defeated" +
        (paid.seats ? " (" + paid.seats + " whipped)" : "") });
      return { result: result, paid: paid, assent: null };
    }

    /* Carrying is not the end. The bill goes to the President, who signs or
       refers it for constitutional review. Referral is not a veto — it delays
       and returns a verdict — but it is the reserve power with the sharpest
       teeth, and King has privately indicated he would use it on a threshold
       bill carried on a contested dual majority. */
    bs.stage = "awaiting_assent";
    bs.carriedAt = st.sitting;
    bs.contested = !!(b.dualMajority && result.functional.aye < result.functional.need + 3);
    billLog(st, billId, "division", "Carried on a division" +
      (result.popular ? " " + result.popular.aye + "/" + result.popular.need : "") +
      (b.dualMajority && result.functional ? " popular, " + result.functional.aye + "/" +
        result.functional.need + " functional" : ""));
    st.log.unshift({ sitting: st.sitting, text: "Division: " + b.title + " carried" +
      (paid.seats ? " (" + paid.seats + " whipped)" : "") });
    const a = presidentDecides(st, C, billId, result);
    settle(st, C);
    return { result: result, paid: paid, assent: a };
  }

  /* ---------------------------------------------------------
     PRESIDENTIAL ASSENT

     Deterministic, per the brief: referral is a condition on the state,
     never a random roll. Three things make it likely — a cold
     relationship, a bill the office has signalled about, and a dual
     majority carried on a narrow functional margin.
     --------------------------------------------------------- */

  function referralRisk(st, C, billId) {
    const b = C.billById[billId], bs = st.bills[billId];
    if (!b.referrable) return { willRefer: false, reasons: [] };
    const reasons = [];
    if (st.president.relationship < 35) reasons.push("relations with the office are cold");
    if (bs.contested) reasons.push("carried on a contested dual majority");
    if (b.signalled) reasons.push("the office signalled it would refer this measure");
    if (st.flags.board_packed || st.flags.legal_board_packed)
      reasons.push("licensing boards were altered by order during its passage");
    return { willRefer: reasons.length >= 2, reasons: reasons };
  }

  function presidentDecides(st, C, billId, result) {
    const b = C.billById[billId], bs = st.bills[billId];
    const risk = referralRisk(st, C, billId);
    if (risk.willRefer) {
      bs.stage = "referred";
      bs.returnsAt = st.sitting + 4 + (bs.contested ? 4 : 0);
      billLog(st, billId, "referral", "Referred for constitutional review, due sitting " + bs.returnsAt);
      st.log.unshift({ sitting: st.sitting, text: "Referred for constitutional review: " + b.title });
      st.wire.unshift({ sitting: st.sitting,
        text: "PRESIDENT REFERS " + b.title.toUpperCase() + " FOR CONSTITUTIONAL REVIEW" });
      return { referred: true, reasons: risk.reasons, returnsAt: bs.returnsAt };
    }
    return assent(st, C, billId, (result.supply || {}).delay || 0);
  }

  /* Signing is where the effects land, and where the ceremony fires. */
  function bs0supply(st, billId, n) {
    if (st.bills[billId]) st.bills[billId].supplyDelay = n;
  }

  function assent(st, C, billId, delay) {
    const b = C.billById[billId], bs = st.bills[billId];
    if (delay == null) delay = bs.supplyDelay || 0;
    /* A delayed money bill is assented and INERT: the Act exists, and
       what it does has not happened yet. Queued rather than applied, so
       it arrives on the calendar as a dated fact and resolveDue() lands
       it at the top of the sitting like any other. */
    if (delay > 0) {
      st.queue.push({ dueSitting: st.sitting + delay, effects: b.onPass,
                      label: b.title + " takes effect",
                      source: "supply delayed by the functional benches" });
      bs.delayedUntil = st.sitting + delay;
      st.log.unshift({ sitting: st.sitting, text:
        "Supply delayed " + delay + " sittings by the functional benches: " + b.title });
    } else {
      apply(st, C, b.onPass);
    }
    /* The clauses the government wrote in are part of the Act. Applied
       after onPass and on the same schedule, so a delayed budget
       delays its allocations with it. */
    const cls = clauseEffects(st, C, billId);
    if (cls.length) {
      if (delay > 0) st.queue.push({ dueSitting: st.sitting + delay,
        effects: cls, label: b.title + ": allocations take effect" });
      else apply(st, C, cls);
    }
    bs.stage = "assented"; bs.dead = true; bs.assentedAt = st.sitting;
    billLog(st, billId, "assent", delay > 0
      ? "Assented, and in force in " + delay + " sittings (held by the functional benches)"
      : "Assented");
    st.log.unshift({ sitting: st.sitting, text: "Assented: " + b.title });
    /* The ceremony is reserved for acts that cannot be undone, so it fires only
       on a bill that needed more than a simple majority. Six or eight times a
       playthrough, not on every division. */
    const ceremony = !!b.dualMajority;
    if (ceremony) st.pendingCeremony = billId;
    return { referred: false, assented: true, ceremony: ceremony };
  }

  /* Referred bills come back. The verdict is deterministic too: a measure that
     was carried narrowly on a packed bench does not survive review. */
  function reviewReturns(st, C) {
    const out = [];
    Object.keys(st.bills).forEach(id => {
      const bs = st.bills[id];
      if (bs.stage !== "referred" || bs.returnsAt == null) return;
      if (st.sitting < bs.returnsAt) return;
      const b = C.billById[id];
      const struck = bs.contested && (st.flags.board_packed || st.flags.legal_board_packed);
      if (struck) {
        bs.stage = "struck"; bs.dead = true;
        apply(st, C, b.onFail);
        billLog(st, id, "struck", "Struck down on presidential review");
        st.log.unshift({ sitting: st.sitting, text: "Struck on review: " + b.title });
        st.wire.unshift({ sitting: st.sitting, text: "COURT STRIKES " + b.title.toUpperCase() });
        out.push({ bill: id, struck: true });
      } else {
        assent(st, C, id);
        st.wire.unshift({ sitting: st.sitting, text: "REVIEW UPHOLDS " + b.title.toUpperCase() + "; ACT SIGNED" });
        out.push({ bill: id, struck: false });
      }
    });
    return out;
  }

  /* ---------------------------------------------------------
     ORDER PAPER SLOTS

     A session has a finite number of slots. Giving one to a partner's
     bill advances it and puts them in your debt. Giving one to your own
     advances nothing but your programme.
     --------------------------------------------------------- */

  /* A bill walks the ladder one order-paper slot at a time. Divisions happen at
     third reading only; earlier stages are procedural and consume a slot without
     a vote. */
  const STAGE_ORDER = ["drafting","first_reading","second_reading","committee",
                       "report","third_reading","assent"];
  const DIVIDES_AT = "third_reading";
  /* HOW FAR A BILL HAS GOT, for "has it reached X". STAGE_ORDER ends at
     "assent", but a carried bill is then "awaiting_assent" or "referred",
     and a signed one "assented" (content writes "passed") -- none of them in
     the ladder, so indexOf said -1 and a bill that had become law had, by
     this measure, not been introduced. A dead end (defeated, fallen,
     struck) reached nothing. */
  function stageRank(stage) {
    if (stage === "awaiting_assent" || stage === "referred") return STAGE_ORDER.indexOf("assent");
    if (stage === "assented" || stage === "passed" || stage === "in_force") return STAGE_ORDER.length;
    return STAGE_ORDER.indexOf(stage);
  }

  /* ---------------------------------------------------------
     ORDER-PAPER TIME, SPENT

     §7.7 calls order-paper time "the currency that cannot be topped up",
     but until now only a bill could spend it, so the player never once
     ran out over sixty sittings and the scarcity was inert. A division is
     House time like any other (design/18 §3): it costs a slot, and when
     the session's slots are gone, no more business is taken.

     spendSlots is the general form so that a future spender — an
     initiative (design/18 §4) — does not reach into st.slots itself.
     --------------------------------------------------------- */
  function slotsRemaining(st) { return st.slots.total - st.slots.used; }

  function spendSlots(st, n) {
    if (slotsRemaining(st) < n) return false;
    st.slots.used += n;
    return true;
  }

  /* RESERVED TIME (design/32 §E.5). A crisis measure brings its own
     order-paper time — that is what an emergency debate is — and the time
     used to go into the general pool, where every bill declared earlier in
     content took it first: the Annexation Bill, the act the campaign is
     about, reached its division in no playtest strategy at any session
     length. It also stayed in the pool for good, so every later session
     had eleven slots and not six.

     So time granted FOR a measure is held against that measure's name:
     only its own stages and its own division can spend it, it is spent
     before the general pool, and it expires when the House rises, with the
     session it was granted for. Everything else — initiatives, approvals,
     the other bills — reads the general pool exactly as before. */
  function reservedFor(st, billId) {
    return ((st.slots.reserved || {})[billId]) || 0;
  }
  function slotsFor(st, billId) { return slotsRemaining(st) + reservedFor(st, billId); }
  function spendSlotsFor(st, billId, n) {
    if (slotsFor(st, billId) < n) return false;
    const r = st.slots.reserved || (st.slots.reserved = {});
    const fromReserve = Math.min(n, reservedFor(st, billId));
    if (fromReserve) {
      r[billId] -= fromReserve;
      if (!r[billId]) delete r[billId];
    }
    st.slots.used += n - fromReserve;
    return true;
  }

  function grantSlot(st, C, billId) {
    if (slotsFor(st, billId) < 1) return { ok: false, reason: "no order-paper time left this sitting period" };
    const b = C.billById[billId], bs = st.bills[billId];
    if (!b || bs.dead) return { ok: false, reason: "not before Parliament" };
    if (bs.stage === DIVIDES_AT) return { ok: false, reason: "awaiting a division" };
    /* AND THE HOUSE HEARS SO MUCH IN A DAY. Six slots spendable on sitting
       one made the session budget a lump sum — the same fault the division
       cap fixed from the other side. §7.7 calls order-paper time the
       pacing instrument, so grants are capped per sitting as divisions
       are, and the cap is content's number. */
    const gcap = (C.setup && C.setup.grantsPerSitting) || 2;
    if ((st.grantsToday || 0) >= gcap)
      return { ok: false, full: true, cap: gcap,
               reason: gcap === 1 ? "the House has taken one measure today"
                                  : "the House has taken " + gcap + " measures today" };
    /* Order-paper time is the scarce good that generates capital, so a slot
       must never be consumed without moving something. A stage the engine
       does not recognise used to fall through every branch below and burn
       the slot in silence — content had a bill sitting at "lords", which is
       not in STAGE_ORDER and is not the name this setting uses either. */
    const i = STAGE_ORDER.indexOf(bs.stage);
    if (bs.stage === "blocked") { bs.stage = "second_reading"; }
    else if (i === STAGE_ORDER.length - 1) return { ok: false, reason: "already awaiting assent" };
    else if (i >= 0) { bs.stage = STAGE_ORDER[i + 1]; }
    else return { ok: false, reason: 'unknown stage "' + bs.stage + '"' };
    billLog(st, billId, "stage", "Advanced to " + String(bs.stage).replace(/_/g, " "));
    spendSlotsFor(st, billId, 1);
    st.grantsToday = (st.grantsToday || 0) + 1;
    st.actedThisSitting = true;
    (st.slotsGranted || (st.slotsGranted = [])).push(billId);
    /* Two sittings' notice. Long enough for the benches to be worked,
       short enough that the session can still hold a division. */
    if (bs.stage === DIVIDES_AT && bs.dividesOn == null) {
      bs.dividesOn = st.sitting + 2;
      billLog(st, billId, "day", "Set down for sitting " + bs.dividesOn);
    }
    let gained = 0;
    const owner = b.owner;
    if (owner && owner !== st.playerParty && st.capital[owner] != null) {
      gained = b.priority ? 3 : 2;
      st.capital[owner] += gained;
    }
    st.log.unshift({ sitting: st.sitting,
      text: "Slot granted: " + b.title + (gained ? " (+" + gained + " with " + owner + ")" : "") });
    settle(st, C);
    return { ok: true, gained: gained, owner: owner, stage: bs.stage };
  }

  /* ---------------------------------------------------------
     STATUTORY INSTRUMENTS

     The distinction is the point. A bill needs a majority and cannot be
     undone; an instrument needs no majority and can be revoked. The
     player learns that the fast tool is the deniable one and the slow
     tool is the permanent one.

     NEGATIVE procedure — the default, and the interesting one. Takes
     effect immediately on being made and stands unless the House prays
     against it within the window. A prayer needs a simple popular
     majority: no functional test, no dual majority. So an instrument is
     fast, unilateral, and vulnerable to a chamber that notices.

     AFFIRMATIVE — needs a simple popular majority BEFORE taking effect.
     Reserved for instruments touching life-support integrity.

     Every instrument names a cabinet post. A vacant post cannot make
     one.
     --------------------------------------------------------- */

  function canMake(st, C, siId) {
    const si = (C.instrumentById || {})[siId], s = st.instruments[siId];
    if (!si || !s) return { ok: false, reason: "no such instrument" };
    if (s.made && !s.revoked) return { ok: false, reason: "already made" };
    /* A rung of the escalation ladder is not available until the rung above it
       has been tried, which is the same vocabulary events gate on. The lint
       already walks an instrument's `when`; this is the reader it assumed. */
    if (si.when && !matches(st, si.when)) return { ok: false, reason: "not yet available" };
    const post = st.cabinet[si.author];
    if (!post) return { ok: false, reason: "names no cabinet post" };
    if (!post.holder) return { ok: false, reason: "the post of " +
      si.author.replace(/_/g, " ") + " is vacant" };
    return { ok: true, post: post };
  }

  function makeInstrument(st, C, siId) {
    const chk = canMake(st, C, siId);
    if (!chk.ok) return chk;
    st.actedThisSitting = true;
    const si = C.instrumentById[siId], s = st.instruments[siId];
    s.made = true; s.revoked = false; s.madeAt = st.sitting;
    if (si.procedure === "affirmative") { s.inForce = false; s.awaitingApproval = true; }
    else {
      s.inForce = true; s.effectApplied = true;
      s.prayerCloses = st.sitting + (si.prayer_window || 6);
      apply(st, C, si.effects);
    }
    if (si.political_cost) apply(st, C, si.political_cost);
    st.log.unshift({ sitting: st.sitting, text: "Instrument made: " + si.title });
    settle(st, C);
    return { ok: true, inForce: s.inForce };
  }

  function prayerForecast(st, C, siId) {
    const si = C.instrumentById[siId];
    const total = popularTotal(st), need = Math.floor(total / 2) + 1;
    let aye = 0;
    Object.keys(st.parties).forEach(pid => {
      const seats = partyPopular(st, pid);
      const inGov = st.coalition.includes(pid) || st.confidenceSupply.includes(pid);
      const stance = (si.prayer_stances || {})[pid];
      /* A coalition partner angry enough votes to annul its own government's
         instrument. That is what makes an order vulnerable to "a chamber that
         notices" rather than merely to the opposition. */
      if (stance && typeof stance === "object" && stance.ifLoyaltyBelow != null) {
        if ((st.parties[pid] ? st.parties[pid].loyalty : 100) < stance.ifLoyaltyBelow)
          aye += Math.round(seats * discipline(st, C, pid, null));
        return;
      }
      if (stance === "for") aye += seats;
      else if (stance === "against") return;
      else if (!inGov) aye += Math.round(seats * discipline(st, C, pid, null));
    });
    return { aye: aye, total: total, need: need, carries: aye >= need };
  }

  /* =============================================================
     THE AFFIRMATIVE PROCEDURE, which content specified and nothing built.

     content/instruments.js has always said it in one line: "affirmative
     -- needs a simple popular majority first". makeInstrument() honoured
     the first half -- it set `awaitingApproval` and withheld the effect --
     and then nothing in the program ever cleared that flag. There was no
     vote, no function, no path into force. So an affirmative order was
     made, its `political_cost` was charged (that is applied on making,
     "whatever happens after"), and its effect never arrived: the player
     paid and got nothing, and the table said "awaiting approval" for the
     rest of the run.

     Five orders are affirmative, and the damage was not confined to them.
     `rung4_appropriation` is affirmative and its effect is what sets
     `rung4_tried`, which `rung5_purchase` is gated on, and so on up -- so
     the thermal escalation ladder STOPPED AT RUNG THREE. Rungs four to
     nine were dead or unreachable, and so was the Ember Ridge emergency
     order. It surfaced when the campaign grew to three sessions: the canon
     run lands the debt trap at sitting 23, the grid drains a point or two a
     sitting, and a government that climbed every rung that worked still
     cascaded at sitting 48, one short of the election, with nothing left
     to reach for.

     THE VOTE MIRRORS THE PRAYER, deliberately. `prayer_stances` is the one
     place content records how each party feels about an order, and a
     second model of the same feeling would drift from the first. So a
     party that would pray against the order votes against approving it, a
     party that would oppose a prayer votes for it, a partner with a
     loyalty threshold approves only above it, the government's own benches
     approve at their discipline, and an unrecorded opposition party does
     not -- "omitted parties are assumed to oppose the government". It
     carries on the same simple popular majority a prayer needs.

     IT IS HOUSE BUSINESS, so it costs an order-paper slot and counts
     against the day's divisions exactly as a bill's division does. That is
     what makes the affirmative order the slow tool beside the negative
     one, which costs no time and stands until somebody prays.
     ============================================================= */
  function approvalForecast(st, C, siId) {
    const si = C.instrumentById[siId];
    const total = popularTotal(st), need = Math.floor(total / 2) + 1;
    let aye = 0;
    Object.keys(st.parties).forEach(pid => {
      const seats = partyPopular(st, pid);
      const inGov = st.coalition.includes(pid) || st.confidenceSupply.includes(pid);
      const stance = (si.prayer_stances || {})[pid];
      if (stance && typeof stance === "object" && stance.ifLoyaltyBelow != null) {
        if ((st.parties[pid] ? st.parties[pid].loyalty : 100) >= stance.ifLoyaltyBelow)
          aye += Math.round(seats * discipline(st, C, pid, null));
        return;
      }
      if (stance === "against") aye += seats;          /* against annulling it */
      else if (stance === "for") return;               /* for annulling it */
      else if (inGov) aye += Math.round(seats * discipline(st, C, pid, null));
    });
    return { aye: aye, total: total, need: need, carries: aye >= need };
  }

  function canApprove(st, C, siId) {
    const si = C.instrumentById[siId], s = st.instruments[siId];
    if (!si || !s) return { ok: false, reason: "no such instrument" };
    if (si.procedure !== "affirmative")
      return { ok: false, reason: "a negative order needs no approval" };
    if (!s.made || s.revoked) return { ok: false, reason: "it has not been laid" };
    if (!s.awaitingApproval)
      return { ok: false, reason: s.inForce ? "already approved" : "not awaiting approval" };
    if (slotsRemaining(st) < 1)
      return { ok: false, noTime: true, reason: "no order-paper time left this sitting period" };
    const cap = (C.setup && C.setup.divisionsPerSitting) || 2;
    if ((st.divisionsToday || 0) >= cap)
      return { ok: false, full: true, cap: cap,
               reason: cap === 1 ? "the House has already divided today"
                                 : "the House has divided " + cap + " times today" };
    return { ok: true };
  }

  /* Not approved, it LAPSES: out of force, no longer awaiting, and free to
     be laid again. The political cost was paid when it was made and stays
     paid, which is what content's "whatever happens after" means. */
  function approveInstrument(st, C, siId) {
    const chk = canApprove(st, C, siId);
    if (!chk.ok) return chk;
    spendSlots(st, 1);
    st.divisionsToday = (st.divisionsToday || 0) + 1;
    st.actedThisSitting = true;
    const si = C.instrumentById[siId], s = st.instruments[siId];
    const f = approvalForecast(st, C, siId);
    s.awaitingApproval = false;
    if (f.carries) {
      s.inForce = true; s.effectApplied = true; s.approvedAt = st.sitting;
      apply(st, C, si.effects);
      st.log.unshift({ sitting: st.sitting, text: "Instrument approved: " + si.title +
                       " (" + f.aye + " of " + f.need + " needed)" });
    } else {
      s.made = false; s.inForce = false; s.lapsed = st.sitting;
      st.log.unshift({ sitting: st.sitting, text: "Instrument not approved, and lapses: " +
                       si.title + " (" + f.aye + " of " + f.need + " needed)" });
    }
    settle(st, C);
    return { ok: true, approved: f.carries, forecast: f };
  }

  function prayAgainst(st, C, siId) {
    const si = C.instrumentById[siId], s = st.instruments[siId];
    if (!s || !s.made || s.revoked) return { ok: false, reason: "not in force" };
    if (s.prayerCloses != null && st.sitting > s.prayerCloses)
      return { ok: false, reason: "the praying window has closed" };
    const f = prayerForecast(st, C, siId);
    if (f.carries) {
      s.revoked = true; s.inForce = false;
      if (s.effectApplied && si.reverse) { apply(st, C, si.reverse); s.effectApplied = false; }
      st.log.unshift({ sitting: st.sitting, text: "Prayer carried: " + si.title + " revoked" });
      st.wire.unshift({ sitting: st.sitting, text: "HOUSE PRAYS AGAINST " + si.title.toUpperCase() });
    } else st.log.unshift({ sitting: st.sitting, text: "Prayer defeated: " + si.title + " stands" });
    return { ok: true, carried: f.carries, forecast: f };
  }

  function revokeInstrument(st, C, siId) {
    const si = C.instrumentById[siId], s = st.instruments[siId];
    if (!s || !s.inForce) return { ok: false, reason: "not in force" };
    if (!si.revocable) return { ok: false, reason: "not revocable" };
    s.revoked = true; s.inForce = false;
    if (s.effectApplied && si.reverse) { apply(st, C, si.reverse); s.effectApplied = false; }
    st.log.unshift({ sitting: st.sitting, text: "Instrument revoked: " + si.title });
    return { ok: true };
  }

  function instrumentsInForce(st) {
    return Object.keys(st.instruments).filter(k => st.instruments[k].inForce);
  }

  /* ---------------------------------------------------------
     CABINET
     --------------------------------------------------------- */

  function appoint(st, C, postId, holderId, partyId) {
    const p = st.cabinet[postId];
    if (!p) return { ok: false, reason: "no such post" };
    p.holder = holderId; p.party = partyId || null;
    st.log.unshift({ sitting: st.sitting, text: "Appointment: " + postId.replace(/_/g, " ") });
    return { ok: true };
  }

  /* ---------------------------------------------------------
     THE APPOINTMENT

     A vacancy the player fills. Content declares who is available and
     what each of them costs, because who may hold the Treasury is a
     fact about the Commonwealth and not about the engine (15.5).

     IT IS AN ACT AND NOT A MENU. Filling a post applies that
     candidate's effects, so the choice is paid for at the moment it is
     made — and leaving it empty is also a decision, because a post with
     no holder cannot make a statutory instrument, which is the
     President's appointment-refusal power biting from the other side.

     ONCE. There is no reshuffle yet (design/08 §3): once a post is
     filled, `candidates` no longer apply and the appointment is spent.
     That is deliberate for a first appointment — the whole weight of it
     is that it cannot be taken back. */
  function candidates(st, C, postId) {
    const post = (C.cabinet || []).find(p => p.id === postId);
    const held = st.cabinet[postId];
    if (!post || !held || held.holder) return [];
    return (post.candidates || []).map((c, i) => Object.assign({ index: i }, c));
  }

  function vacancies(st, C) {
    return (C.cabinet || [])
      .filter(p => st.cabinet[p.id] && !st.cabinet[p.id].holder &&
                   (p.candidates || []).length)
      .map(p => p.id);
  }

  function fillPost(st, C, postId, index) {
    const list = candidates(st, C, postId);
    const c = list[index];
    if (!c) return { ok: false, reason: "not an available candidate" };
    const post = (C.cabinet || []).find(p => p.id === postId);
    appoint(st, C, postId, c.holder, c.party);
    apply(st, C, c.effects);
    const who = (C.characters || []).find(x => x.id === c.holder);
    st.log.unshift({ sitting: st.sitting,
      text: (post ? post.title || post.name : postId) + ": " +
            (who ? who.name : c.holder) + " appointed" });
    settle(st, C);
    return { ok: true, holder: c.holder };
  }

  function vacate(st, C, postId, reason) {
    const p = st.cabinet[postId];
    if (!p || !p.holder) return { ok: false };
    p.holder = null;
    st.log.unshift({ sitting: st.sitting,
      text: "Ministerial vacancy: " + postId.replace(/_/g, " ") + (reason ? ", " + reason : "") });
    return { ok: true };
  }

  /* ---------------------------------------------------------
     THE LICENSING BOARDS (bible §4.6.4, design/33 §4).

     §4.6.4 is LOCKED and says it plainly: franchise in a functional
     constituency runs through professional licensure, AND THE GOVERNMENT
     APPOINTS THE BOARDS. That was written down and the player could not do
     it — the sharpest tool in the game, named in canon, missing from the
     hand that canon gives it to.

     IT IS THE MISSING HALF OF DOMAIN CONSENT. A bill's `touches` names
     domains, and the functional constituencies concerned with those domains
     can block it. The government's own constitutional answer to being
     blocked is to appoint the boards that decide who is licensed, and
     therefore who votes in those seats. Give her that and a blocked bill
     becomes a fight rather than a dice roll.

     SLOW, CAPPED, AND REMEMBERED. One seat at a time; a slot, because §7.7
     prices every power; legitimacy, because this is the government deciding
     who its electors are; and a cap from content, because a board that can
     be packed without limit is not a fight, it is a cheat code. Every one
     is counted in `st.boards` and stays counted — packing a board is the
     kind of thing an opposition runs an election on, and it can only do
     that if the number survives.
     --------------------------------------------------------- */
  function boardsMoved(st, fcId) {
    return ((st.boards || {})[fcId]) || 0;
  }
  function boardsTotal(st) {
    return Object.keys(st.boards || {}).reduce((n, k) => n + st.boards[k], 0);
  }

  function canPackBoard(st, C, fcId) {
    const f = (C.functional || []).find(x => x.id === fcId);
    if (!f) return { ok: false, reason: "no such constituency" };
    const roll = st.functional && st.functional[fcId];
    if (!roll) return { ok: false, reason: "that roll is not in this parliament" };
    if (st.slots.used >= st.slots.total)
      return { ok: false, reason: "no order-paper time left this sitting period" };
    const cap = (C.setup && C.setup.boardCap) == null ? 2 : C.setup.boardCap;
    if (boardsMoved(st, fcId) >= cap)
      return { ok: false, reason: "the board has been appointed to as often as the Charter allows" };
    const mine = st.playerParty;
    const donors = Object.keys(roll.held).filter(p => p !== mine && roll.held[p] > 0);
    if (!donors.length)
      return { ok: false, reason: "every seat on this roll already returns the government" };
    return { ok: true };
  }

  function packBoard(st, C, fcId) {
    const gate = canPackBoard(st, C, fcId);
    if (!gate.ok) return gate;
    const f = (C.functional || []).find(x => x.id === fcId);
    const roll = st.functional[fcId], mine = st.playerParty;

    /* FROM THE LARGEST HOLDER THAT IS NOT THE GOVERNMENT. Licensure moves
       at the margin, and the margin is where the most licences are. */
    let from = null, n = -1;
    Object.keys(roll.held).forEach(p => {
      if (p !== mine && roll.held[p] > n) { n = roll.held[p]; from = p; }
    });
    roll.held[from] -= 1;
    if (roll.held[from] <= 0) delete roll.held[from];
    roll.held[mine] = (roll.held[mine] || 0) + 1;
    syncFunctional(st, C);

    st.slots.used += 1;
    st.boards = st.boards || {};
    st.boards[fcId] = boardsMoved(st, fcId) + 1;

    /* THE PRICE IS BELIEF. A government that appoints its own electors is
       still the government and is a little less obviously legitimate every
       time it does it. */
    st.scalars.legitimacy = clamp((st.scalars.legitimacy || 0) - 7, 0, 100);
    if (st.parties[from])
      shiftLoyalty(st, C, from, -5);

    st.log.unshift({ sitting: st.sitting,
      text: "Appointments made to the " + (f.name || fcId) + " licensing board." });
    st.wire = st.wire || [];
    st.wire.unshift({ sitting: st.sitting,
      text: "GOVERNMENT APPOINTS TO THE " + String(f.name || fcId).toUpperCase() +
            " BOARD; ONE SEAT CHANGES HANDS" });
    return { ok: true, from: from, to: mine, constituency: fcId };
  }

  /* ---------------------------------------------------------
     THE RESHUFFLE (design/33 §3).

     The most Westminster lever there is, and it was nearly free: `cabinet`,
     `appoint` and `vacate` all existed, and `postVacant` was a condition
     content had never used. What was missing is the player being able to do
     it deliberately rather than it happening to her.

     A DISMISSAL IS A VACANCY, so this writes no new appointment path. It
     empties the post, the existing vacancy panel offers the existing
     candidates, and the appointment is paid for the way appointments already
     are. One mechanism, two halves, and the half that existed is untouched.

     IT COSTS A SLOT, because §7.7 says it must: "any future power the player
     gains must be priced in slots or it will be pressed on every sitting."

     AND THE REST OF THE COST IS NOT A NUMBER, it is the relationship. The
     sacked minister's regard collapses and does not recover, their current
     reads it as an attack on them, and they are now on the back benches with
     a reason. That is what makes an appointment a bet: a seat buys a
     faction's loyalty and silences its most credible critic, and the
     resignation, when it comes, is a weapon precisely because they were
     inside.
     --------------------------------------------------------- */
  /* EVERY REFUSAL CARRIES A `code` as well as its sentence, so the interface
     can say WHY at a glance and not only on hover: "partner" and
     "successor" are standing facts about a post, "time" passes with the
     sitting period, and the cabinet table marks each differently. The
     permanent reasons are tested first, so a minister who could never be
     dismissed is not reported as merely waiting for time. */
  function canReshuffle(st, C, postId) {
    const p = st.cabinet[postId];
    if (!p) return { ok: false, code: "none", reason: "no such post" };
    if (!p.holder) return { ok: false, code: "vacant", reason: "the post is already vacant" };
    if (postId === (C.setup && C.setup.pmPost)) return { ok: false, code: "pm", reason: "the Prime Minister cannot dismiss herself" };
    const post0 = (C.cabinet || []).find(x => x.id === postId) || {};
    /* A PARTNER'S MINISTER IS THE PARTNER'S. In a coalition the Prime
       Minister appoints, and each party names its own: the partner chose
       this minister and only the partner can withdraw one. Dismissing one
       is not a reshuffle, it is ending the agreement, which content does
       through events (a partner walking out) and not through this button.
       A post the Prime Minister GIVES a partner (the Treasury to the CDA,
       say) becomes the partner's the same way, which is part of what makes
       giving it a bet. */
    if (p.party && st.playerParty && p.party !== st.playerParty) {
      const pty = ((C.partyById || {})[p.party] || {}).name || p.party;
      return { ok: false, code: "partner",
        reason: "the " + pty + " names its own ministers under the coalition agreement, and " +
                "only it can withdraw one. Dismissing one would end the agreement" };
    }
    /* AND THERE HAS TO BE SOMEBODY TO APPOINT. Content declares who may hold
       a post (§15.5) and there is no other way to fill one, so dismissing
       from a post with no declared candidates would leave it permanently
       empty — and a post with no holder cannot make a statutory instrument.
       That is not a vacancy, it is a ministry destroyed by a button.

       A Prime Minister with nobody to appoint cannot sack anybody, which is
       also true. The refusal names the reason, so when content declares
       candidates for a post the power simply appears there. */
    /* READ CONTENT, NOT candidates(). `candidates()` answers "who may be
       appointed RIGHT NOW", and it deliberately returns nothing for a post
       that is already filled — the appointment is spent (design/08 §3). So
       gating on it meant the reshuffle could never fire on an occupied post,
       which is the only kind there is. What matters here is whether content
       declares anybody OTHER than the incumbent. */
    const bench = (post0.candidates || []).filter(c => c.holder !== p.holder);
    if (!bench.length)
      return { ok: false, code: "successor",
        reason: "there is nobody on the list to succeed them, so the ministry would stand empty for " +
                "the rest of the parliament, and an empty ministry cannot make an order" };
    if (st.slots.used >= st.slots.total)
      return { ok: false, code: "time", reason: "no order-paper time left this sitting period" };
    return { ok: true, successors: bench.map(c => c.holder) };
  }

  function reshuffle(st, C, postId) {
    const gate = canReshuffle(st, C, postId);
    if (!gate.ok) return gate;
    const p = st.cabinet[postId];
    const who = p.holder, party = p.party;
    const post = (C.cabinet || []).find(x => x.id === postId) || {};
    const ch = (C.characters || []).find(x => x.id === who);

    st.slots.used += 1;

    /* the regard goes, and nothing gives it back */
    const rec = st.characters[who];
    if (rec) rec.relationship = clamp((rec.relationship || 50) - 34, 0, 100);

    /* their current takes it personally */
    const cur = (C.currents || []).find(cu => cu.party === party &&
      ch && ch.current === cu.id);
    if (cur && st.currents[cur.id]) shiftLoyalty(st, C, cur.id, -18);
    else if (party && st.parties[party]) shiftLoyalty(st, C, party, -6);

    /* and the House notices */
    shiftLoyalty(st, C, st.playerParty, -4);

    vacate(st, C, postId, "dismissed");
    const name = ch ? ch.name : who;
    st.wire = st.wire || [];
    st.wire.unshift({ sitting: st.sitting,
      text: String(name).toUpperCase().replace(/ MP$/, "") + " DISMISSED FROM " +
            String(post.name || postId).toUpperCase() });
    return { ok: true, who: who, post: postId, name: name };
  }

  /* ---------------------------------------------------------
     APPORTIONMENT

     Derived, never stored. A constituency's ratio is its seats per
     attested voter against the chamber mean. Storing it alongside
     seats and population let the three drift apart, and they did.

     Because the electorate is attested adults, an attestation bill
     moves the malapportionment. The civil-liberties fight and the
     electoral one are the same fight.
     --------------------------------------------------------- */

  function apportionment(C) {
    /* The voting districts only. A non-voting seat has no apportionment: it
       is not returned by an electorate in the sense the ratio measures. */
    const cons = (C.constituencies || []).filter(c => !c.nonVoting);
    if (!cons.length) return {};
    const seats = cons.reduce((n, c) => n + c.magnitude, 0);
    const el = cons.reduce((n, c) => n + c.electorate, 0);
    const mean = seats / el;
    const out = {};
    cons.forEach(c => out[c.id] = Math.round(((c.magnitude / c.electorate) / mean) * 100) / 100);
    return out;
  }

  /* The district tier must equal the sum of constituency magnitudes.
     Nothing checked this before and the two had drifted by 84 seats. */
  function tierCheck(st, C) {
    const cons = (C.constituencies || []).filter(c => !c.nonVoting)
                   .reduce((n, c) => n + c.magnitude, 0);
    const party = Object.values(st.parties).reduce((n, p) => n + (p.seats.district || 0), 0)
                + vacantSeats(st);   /* an empty seat is still a seat in the tier */
    return { constituencies: cons, party: party, ok: cons === party };
  }

  /* The faction breakdown of a party's own row. Seats and ayes are both
     apportioned by largest remainder so each column sums to the party
     figure above it; a breakdown that does not add up reads as a bug in
     the arithmetic even when the arithmetic is right.

     Ayes are weighted by SEATS x RATE and not by SHARE x RATE, which is
     the same quantity in the continuous case and not the same table.
     Weighting by share let the rounding of the seat column and the
     rounding of the aye column disagree, and on nine functional seats
     that printed the most loyal current delivering two of three while
     the least loyal delivered one of one. Apportion the ayes over the
     seats you are about to print beside them. */
  function benchRows(st, pid, pWork, pBase, fWork, fBase) {
    const work = pWork.length ? pWork : fWork;
    if (!work.length) return null;
    const split = function (seatTotal, ayeTotal, has) {
      const seats = apportion(seatTotal, work.map(b => b.share));
      if (!has) return { seats: seats, ayes: work.map(() => null) };
      return { seats: seats,
               ayes: capped(ayeTotal, work.map((b, i) => seats[i] * b.rate), seats) };
    };
    const P = split(partyPopular(st, pid), pBase, !!pWork.length);
    const F = split(partyFunctional(st, pid), fBase, !!fWork.length);
    return work.map((b, i) => ({
      id: b.id, name: b.name,
      popularSeats: P.seats[i], popularAye: P.ayes[i],
      functionalSeats: F.seats[i], functionalAye: F.ayes[i]
    }));
  }

  /* Largest remainder with a ceiling per row: no current may deliver more
     members than it has, and the total must still come out exact. */
  function capped(total, weights, caps) {
    const out = apportion(total, weights);
    for (let pass = 0; pass < out.length; pass++) {
      let moved = false;
      for (let i = 0; i < out.length; i++) {
        while (out[i] > caps[i]) {
          const j = out.findIndex((v, k) => k !== i && v < caps[k]);
          if (j < 0) { out[i] = caps[i]; break; }
          out[i]--; out[j]++; moved = true;
        }
      }
      if (!moved) break;
    }
    return out;
  }

  function division(st, C, billId) {
    const bill = C.billById[billId];
    if (!bill) throw new Error("unknown bill: " + billId);

    const rows = [];
    let popAye = 0, funcAye = 0;

    const w = st.whips[billId] || {};
    Object.keys(st.parties).forEach(pid => {
      const wp = w[pid] || {};
      const pWork = [], fWork = [];
      const pBase = resolveStance(st, C, bill, pid, "popular", pWork);
      const fBase = resolveStance(st, C, bill, pid, "functional", fWork);
      const pAye = Math.min(partyPopular(st, pid), pBase + (wp.popular || 0));
      const fAye = Math.min(partyFunctional(st, pid), fBase + (wp.functional || 0));
      popAye += pAye; funcAye += fAye;
      /* An abstaining party abstains WHOLE — it is a line, not a turnout —
         so the rest of a bench that is not aye and not abstaining is nay. */
      const pKind = stanceKind(st, C, bill, pid, "popular");
      const fKind = stanceKind(st, C, bill, pid, "functional");
      const pSeats = partyPopular(st, pid), fSeats = partyFunctional(st, pid);
      /* A MEMBER WHO DID NOT VOTE, declared by content and defaulting to
         nought. It comes out of the bench before abstention does, so a
         party that abstains and loses members to absence still reads
         honestly: the absent are not counted as abstentions. */
      const pAway = stanceAbsent(st, C, bill, pid, "popular", pSeats);
      const fAway = stanceAbsent(st, C, bill, pid, "functional", fSeats);
      const pAbs = pKind === "abstain" ? Math.max(0, pSeats - pAye - pAway) : 0;
      const fAbs = fKind === "abstain" ? Math.max(0, fSeats - fAye - fAway) : 0;
      rows.push({
        party: pid,
        popularSeats: pSeats, popularAye: pAye, popularWhipped: wp.popular || 0,
        popularAbstain: pAbs, popularNay: Math.max(0, pSeats - pAye - pAbs - pAway),
        popularAbsent: pAway, popularPaired: 0, popularKind: pKind,
        functionalSeats: fSeats, functionalAye: fAye, functionalWhipped: wp.functional || 0,
        functionalAbstain: fAbs, functionalNay: Math.max(0, fSeats - fAye - fAbs - fAway),
        functionalAbsent: fAway, functionalKind: fKind,
        /* Present only where the count came from the currents. Whipped seats
           are deliberately excluded — the whip buys members, not factions,
           until design/07 says otherwise. */
        benches: benchRows(st, pid, pWork, pBase, fWork, fBase)
      });
    });

    /* LOBBIED SEATS JOIN THE FUNCTIONAL AYE, and are attributed to the
       parties holding benches that were not already with the measure, so
       the breakdown still sums to the total on the screen. They are kept
       in their own column: a whipped seat is a member the player moved and
       a lobbied one is a bench somebody else moved for them, and a player
       who cannot tell those apart cannot tell what they owe. */
    const lobFc = lobbiedByConstituency(st, C, billId);
    const lob = lobbiedSeats(st, billId);
    if (lob > 0) {
      let left = lob;
      rows.forEach(r => {
        if (left <= 0) return;
        const spare = Math.max(0, r.functionalSeats - r.functionalAye -
                              (r.functionalAbstain || 0) - (r.functionalAbsent || 0));
        const take = Math.min(spare, left);
        if (!take) return;
        r.functionalAye += take;
        r.functionalLobbied = (r.functionalLobbied || 0) + take;
        r.functionalNay = Math.max(0, r.functionalSeats - r.functionalAye -
          (r.functionalAbstain || 0) - (r.functionalAbsent || 0));
        funcAye += take; left -= take;
      });
    }

    const popTotal = popularTotal(st), funcTotal = functionalTotal(st);
    const popNeed = Math.floor(popTotal / 2) + 1;
    const funcNeed = Math.floor(funcTotal / 2) + 1;

    const dual = !!bill.dualMajority;
    /* NOTE: carrying is decided AFTER the pairs are settled, below. A
       reading taken here would be the count before the whips' courtesy
       came out of it. */
    const funcCarries = funcAye >= funcNeed;

    /* THE PAIRS ARE SETTLED HERE, on the popular bench only: a pair is an
       arrangement between whips and the functional forty have no whips.
       A paired member is neither aye nor nay — they are ABSENT, which is
       the fourth thing a seat can be and the reason the count needs it.
       The government's side of every pair comes out of the Prime
       Minister's own party, because those are the members its whips can
       promise. */
    const pairPlan = (st.pairs || {})[billId] || {};
    const mine = rows.find(r => r.party === st.playerParty);
    Object.keys(pairPlan).forEach(pid => {
      const other = rows.find(r => r.party === pid);
      const n = Math.max(0, Math.min(pairPlan[pid] || 0,
        mine ? mine.popularAye : 0, other ? other.popularNay : 0));
      if (!n || !other || !mine) return;
      mine.popularAye -= n;  mine.popularAbsent = (mine.popularAbsent || 0) + n;
      mine.popularPaired = (mine.popularPaired || 0) + n;
      other.popularNay -= n; other.popularAbsent = (other.popularAbsent || 0) + n;
      other.popularPaired = (other.popularPaired || 0) + n;
      popAye -= n;
    });
    const popCarriesAfter = popAye >= popNeed;

    const sum = (k) => rows.reduce((n, r) => n + (r[k] || 0), 0);
    /* The constituencies that own the subject answer for it. Computed
       after the pairs settle, because the override is measured against
       the popular count that actually happened. */
    const domain = domainTest(st, C, billId, rows, popAye, popTotal, lobFc);
    /* Heard, recorded, and not obeyed — but counted, because the delay
       has to be triggered by something and a bench that did not vote
       cannot object. */
    const supply = isSupply(bill) ? (function () {
      const nay = sum("functionalNay"), total = functionalTotal(st);
      const objects = total > 0 && nay > Math.floor(total / 2);
      return { applies: true, nay: nay, total: total, objects: objects,
               delay: objects ? (C.setup.supplyDelaySittings || 3) : 0 };
    })() : { applies: false, objects: false, delay: 0 };
    return {
      supply: supply,
      bill: billId, dual: dual, rows: rows, domain: domain,
      popular:   { aye: popAye,  total: popTotal,  need: popNeed,  carries: popCarriesAfter,
                   abstain: sum("popularAbstain"), nay: sum("popularNay"),
                   absent: sum("popularAbsent"), paired: sum("popularPaired") },
      functional:{ aye: funcAye, total: funcTotal, need: funcNeed, carries: funcCarries,
                   abstain: sum("functionalAbstain"), nay: sum("functionalNay"),
                   absent: sum("functionalAbsent") },
      /* Supply answers to the elected benches and to nothing else. */
      carries: (isSupply(bill) ? popCarriesAfter
                : (dual ? (popCarriesAfter && funcCarries) : popCarriesAfter)) &&
               domain.carries
    };
  }

  /* ---------------------------------------------------------
     3c. THE LEADERSHIP BALLOT (design/08 §2)

     The caucus divides on loyalty and on what the Prime Minister has paid each
     current. This is a SUM, not a model: each current votes its members in
     proportion to its loyalty, the members in no current vote on the party's
     own loyalty, and the revenants — returned on the list, owing their seat to
     the party — are loyal until they break, and then break together.

     Held when the signatures against the PM reach the threshold. A ballot the
     PM loses routes through the existing loss condition, not a second one.
     --------------------------------------------------------- */
  /* THE NAMES ON THE PAPER (design/26 #11). A ballot needs twelve signatures,
     and content could supply five: two one-off orders and a cabinet
     appointment that takes four away. So the ballot could not fire in any run,
     and the party's own benches — the most dangerous thing in a government —
     were inert.

     The missing piece is not a number, it is WHO. A signature is collected
     from a member, and whether a member signs is a condition on the state the
     engine already keeps: their current's loyalty, the party's, and whether
     the government has anything to hold over them. So this walks the player's
     own benches, offers the members who are closest to signing, and records
     the ones who have. Content narrates it; the engine holds it, which is the
     division design/08 drew.

     No new verb: a signature is the `signatures` effect that already exists,
     applied member by member. */
  function signableMembers(st, C) {
    const party = st.playerParty;
    const signed = st.signedBy || (st.signedBy = []);
    const refused = st.refusedBy || [];
    const out = [];
    (C.characters || []).forEach(ch => {
      if (ch.party !== party) return;
      if (ch.office === "leader" || ch.id === st.pm) return;   /* not the leader */
      if (signed.indexOf(ch.id) >= 0 || refused.indexOf(ch.id) >= 0) return;
      /* a member won back is off the paper while the promise stands */
      if (wonBackBy(st, ch.id)) return;
      out.push(willOf(st, ch));
    });
    return out.sort((a, b) => b.will - a.will);
  }
  /* WILLINGNESS is low loyalty and a grievance with the leadership, minus
     whatever the government holds over them. One reading, for asking a
     member to sign and for winning one back. */
  function willOf(st, ch) {
    const cur = ch.current ? (st.currents[ch.current] || {}) : null;
    const loy = cur && cur.loyalty != null ? cur.loyalty
              : ((st.parties[st.playerParty] || {}).loyalty || 60);
    const payroll = ch.office ? 12 : 0;
    return { id: ch.id, name: ch.name, will: 100 - loy - payroll + (ch.grievance ? 10 : 0),
             loyalty: loy, office: ch.office || null, current: ch.current || null };
  }
  /* The promise that took a member's name off the paper, while it stands. */
  function wonBackBy(st, id) {
    return (st.undertakings || []).find(u => u.signs === id && u.state !== "broken") || null;
  }

  /* Ask one member, to their face. Returns what they said and what it did.

     WILLINGNESS DECIDES IT (the author, 24 Sep). Every member asked used to
     sign, including the ones the panel labelled "will not" and ministers, so
     the only thing Ask could do was lose the Prime Minister a member, and
     there was no reason ever to press it. Now the answer is the member's:
     at or above `setup.thresholds.signsAt` they sign, and below it they
     refuse. A refusal to the Prime Minister's face is a declaration, so the
     member comes off the paper for good (`st.refusedBy`) and their current
     firms by `thresholds.refusalLoyalty`. Deterministic, as §1.5 requires:
     the panel's inclined / may / will not is the forecast, and "may"
     straddles the line, which is the gamble. */
  function collectSignature(st, C, id) {
    const list = signableMembers(st, C);
    const m = list.find(x => x.id === id);
    if (!m) return { ok: false, reason: "that member is not on the paper" };
    const T = C.setup.thresholds || {};
    const signed = st.signedBy || (st.signedBy = []);
    if (signed.length >= (T.ballot || 12) + 3)
      return { ok: false, reason: "the paper has all the names it needs" };
    st.actedThisSitting = true;
    if (m.will < (T.signsAt == null ? 50 : T.signsAt)) {
      (st.refusedBy || (st.refusedBy = [])).push(id);
      const firm = T.refusalLoyalty == null ? 2 : T.refusalLoyalty;
      if (firm) shiftLoyalty(st, C, m.current || st.playerParty, firm);
      billLogSafe(st, "The paper: " + m.name + " refused to sign");
      return { ok: true, signed: false, member: m, signatures: st.signatures || 0 };
    }
    signed.push(id);
    apply(st, C, [{ signatures: 1 }]);
    billLogSafe(st, "Signature: " + m.name + " added to the paper");
    return { ok: true, signed: true, member: m, signatures: st.signatures || 0 };
  }

  /* WINNING A NAME BACK (design/26 #14, the author, 24 Sep: "a signature
     withdrawn at a price"). A member who has signed can be talked round,
     unless they are too far gone (willingness at or above
     `thresholds.winBackBelow`). The price is the afternoon it takes, one
     slot of order-paper time, and a PROMISE: time on the order paper,
     before the House rises, for the live measure their current agrees
     with most. It is an undertaking like any other, kept the moment the
     measure is given time. Broken, the member's name goes back on the
     paper, which is the one thing the engine does on a breach besides
     queueing the event, because the paper is the engine's own. */
  function winBackTerms(st, C, id) {
    const T = (C.setup && C.setup.thresholds) || {};
    const ch = (C.characters || []).find(c => c.id === id);
    if (!ch || (st.signedBy || []).indexOf(id) < 0)
      return { ok: false, reason: "that member has not signed the paper" };
    const m = willOf(st, ch);
    if (m.will >= (T.winBackBelow == null ? 75 : T.winBackBelow))
      return { ok: false, member: m, reason: bareName(ch.name) + " is too far gone to be talked round" };
    const axes = ((C.currents || []).find(c => c.id === ch.current) || {}).axes ||
                 (C.partyById[st.playerParty] || {}).axes || {};
    const granted = st.slotsGranted || [];
    const best = (C.bills || []).map(b => ({ b: b, bs: st.bills[b.id] }))
      .filter(x => x.bs && !x.bs.dead && x.bs.stage !== "drafting" &&
                   STAGE_ORDER.indexOf(x.bs.stage) >= 0 &&
                   STAGE_ORDER.indexOf(x.bs.stage) < STAGE_ORDER.length - 1 &&
                   x.b.axes && granted.indexOf(x.b.id) < 0)
      .map(x => ({ b: x.b, a: axisAgreement(axes, x.b.axes) }))
      .filter(x => x.a > 0.25)
      .sort((x, y) => y.a - x.a)[0];
    if (!best) return { ok: false, member: m, reason: "nothing on the order paper is a measure " +
      bareName(ch.name) + "'s current wants" };
    if (st.slots.used >= st.slots.total)
      return { ok: false, member: m, bill: best.b.id, reason: "no order-paper time left this sitting period" };
    return { ok: true, member: m, bill: best.b.id, billTitle: best.b.title };
  }
  function winBack(st, C, id) {
    const t = winBackTerms(st, C, id);
    if (!t.ok) return t;
    const ch = (C.characters || []).find(c => c.id === id);
    st.slots.used += 1;
    st.signedBy = (st.signedBy || []).filter(x => x !== id);
    apply(st, C, [{ signatures: -1 }]);
    apply(st, C, [{ undertake: { id: "winback_" + id,
      text: "Order-paper time for the " + t.billTitle + ", promised to " + bareName(ch.name),
      owed_to: id, by: null, discharge: { slot: t.bill } } }]);
    const u = (st.undertakings || []).find(x => x.id === "winback_" + id && x.state === "open");
    if (u) u.signs = id;
    st.actedThisSitting = true;
    billLogSafe(st, "The paper: " + ch.name + " withdraws their name, on a promise of time for the " + t.billTitle);
    return { ok: true, member: t.member, bill: t.bill, billTitle: t.billTitle,
             signatures: st.signatures || 0 };
  }
  const bareName = n => String(n || "").replace(/^(Rt\. Hon\.|Hon\.)\s*/, "").replace(/\s+MP$/, "");

  function billLogSafe(st, text) {
    st.log.unshift({ sitting: st.sitting, text: text });
  }

  function ballot(st, C) {
    const party = st.playerParty;
    const seats = partyPopular(st, party);
    const currents = (C.currents || []).filter(c0 => c0.party === party);
    let aye = 0, named = 0;
    currents.forEach(c0 => {
      const cur = st.currents[c0.id] || c0;
      const mem = cur.members || 0;
      named += mem;
      aye += mem * ((cur.loyalty == null ? 100 : cur.loyalty) / 100);
    });
    const rest = Math.max(0, seats - named);
    aye += rest * (((st.parties[party] || {}).loyalty || 100) / 100);
    aye = Math.round(aye);
    const need = Math.floor(seats / 2) + 1;
    return { for: aye, against: Math.max(0, seats - aye), seats: seats,
             need: need, carries: aye >= need };
  }

  /* ---------------------------------------------------------
     3b. IMPERFECT INFORMATION (design/08 §7)

     A division is exact — the arithmetic is the argument of the game. What
     the player is SHOWN is not. Every forecast comes from a source, and every
     source is wrong by something: the whips count their own side, a partner is
     honest until its loyalty thins, the functional bench is an estimate, and
     the opposition is a guess.

     The error is DERIVED from the seed and the state, never rolled fresh, so a
     redraw does not move the number and the player cannot re-read it until it
     settles. The point is not the error; it is that a partner whose loyalty is
     collapsing gives you a worse number and does not tell you it is worse.
     --------------------------------------------------------- */
  function noise(st, key) {
    let h = 2166136261 >>> 0;
    const s = key + ":" + (st.seed || 1);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }
  function reportError(st, partyId, bench) {
    if (partyId === st.playerParty) return 0;                 /* the whips do count */
    let scale = 1;                                            /* the opposition: a guess */
    const partner = st.coalition.indexOf(partyId) >= 0 ||
                    st.confidenceSupply.indexOf(partyId) >= 0;
    if (partner) {
      const p = st.parties[partyId] || {};
      const loy = p.loyalty == null ? 100 : p.loyalty;
      scale = Math.floor((100 - loy) / 18);                   /* worse as loyalty falls */
    }
    const n = noise(st, bench + ":" + partyId);
    return (n % (2 * scale + 1)) - scale;
  }
  /* The same error, applied once, per party — and then everything the
     player is shown is a sum of THESE rows.

     The bars used to be reported and the breakdown under them exact, so a
     player who added up the table had the true count and reported() was
     withholding nothing. A summary that is an estimate over a table that
     is exact is not imperfect information; it is a slower way of telling
     the truth. The factions under a party are re-apportioned to the
     party's reported aye by largest remainder, capped at each current's
     members, so every column still adds up on screen (test.js §614). */
  /* WHAT A PAIR WOULD COST, AND WHETHER THERE IS ONE TO BE HAD.

     A pair needs a government member willing to stay out and an opposing
     member on the other side to cancel. The government's side always
     comes from the Prime Minister's own party, so the ceiling is the
     smaller of what this party is voting against and what the player's
     own bench is voting for. `costsYou` is stated plainly because the
     whole point of this mechanic is that nobody in the fiction states it. */
  function pairable(st, C, billId, partyId) {
    const bs = st.bills[billId];
    if (!bs || bs.dead) return { max: 0, reason: "not before the House" };
    if (partyId === st.playerParty)
      return { max: 0, reason: "a party cannot pair with itself" };
    /* Read the count with this bill's pairs removed, so the ceiling does
       not shrink as it is spent and then refuse the plan already made. */
    const kept = (st.pairs || {})[billId];
    if (kept) { st.pairs[billId] = {}; }
    const d = division(st, C, billId);
    if (kept) { st.pairs[billId] = kept; }
    const mine = d.rows.find(r => r.party === st.playerParty);
    const them = d.rows.find(r => r.party === partyId);
    const max = Math.max(0, Math.min(mine ? mine.popularAye : 0,
                                     them ? them.popularNay : 0));
    return { max: max,
             reason: max ? null : "no member of theirs is voting against it",
             costsYou: 1,      /* one aye of your margin, per pair */
             costsThem: 0 };   /* a nay the threshold never counted */
  }

  function setPairs(st, C, billId, partyId, n) {
    const cap = pairable(st, C, billId, partyId);
    const v = Math.max(0, Math.min(Math.round(n) || 0, cap.max));
    const plan = st.pairs[billId] || (st.pairs[billId] = {});
    const before = plan[partyId] || 0;
    if (v) plan[partyId] = v; else delete plan[partyId];
    /* A PAIR IS A RECORD AS WELL AS A NUMBER. Under a majority of the members
       a pair costs the government an aye and costs the other side a nay the
       threshold never counted, so it is never good arithmetic and can only
       ever be a courtesy. The courtesy has to be visible to content or the
       mechanic stays a control nobody should press: the House has now seen
       one, and says so where an event can read it. */
    if (v !== before) {
      st.flags = st.flags || {};
      if (v > 0) st.flags.paired = true;
      st.log.unshift({ sitting: st.sitting,
        text: (v > before ? "Paired " + (v - before) : "Unpaired " + (before - v)) +
              " with " + String(partyId).toUpperCase() +
              " on the division of " + ((C.billById[billId] || {}).title || billId) });
    }
    return { ok: true, pairs: v, max: cap.max };
  }

  function clearPairs(st, billId) { delete st.pairs[billId]; }

  /* ---------------------------------------------------------
     CLAUSES — a bill the player fills in before the House votes on it.

     design/13 asks for a budget and says the obvious design is wrong: a
     screen of line items and sliders fails §7.6 on sight, because the
     player would need a second window and the game would be a
     spreadsheet with a parliament attached. So the budget is A BILL, and
     what makes it a budget is that some of its clauses are left blank for
     the government to fill in.

     NOTHING HERE KNOWS WHAT A BUDGET IS. A clause is a choice between
     stated levels, each with a cost and effects, and any bill may carry
     them: a money bill is the obvious use and a treaty with
     variable terms would be another. `grep budget js/engine.js`
     returns nothing, which is design/13's own acceptance test.

     The money is real in one direction only, per §7.6's depth rule: an
     allocation the treasury cannot fund is REFUSED, and the refusal names
     the shortfall. There is no deficit, no borrowing and no ledger — the
     constraint is a ceiling, not an accounting system.
     --------------------------------------------------------- */

  function clausesOf(C, billId) {
    const b = C.billById[billId];
    return (b && b.clauses) || [];
  }

  /* What the government has settled on, defaulting to each clause's own
     stated default so a bill is always in a passable state. */
  function clausePlan(st, C, billId) {
    const plan = (st.clauses || {})[billId] || {};
    const out = {};
    clausesOf(C, billId).forEach(cl => {
      const chosen = plan[cl.id];
      const lv = (cl.levels || []).find(l => l.id === chosen) ||
                 (cl.levels || []).find(l => l.id === cl.default) ||
                 (cl.levels || [])[0];
      if (lv) out[cl.id] = lv;
    });
    return out;
  }

  function clauseCost(st, C, billId) {
    const plan = clausePlan(st, C, billId);
    let total = 0;
    Object.keys(plan).forEach(k => { total += plan[k].cost || 0; });
    return { total: total, solvency: st.scalars.solvency,
             over: Math.max(0, total - st.scalars.solvency),
             affordable: total <= st.scalars.solvency };
  }

  function setClause(st, C, billId, clauseId, levelId) {
    const cl = clausesOf(C, billId).find(c => c.id === clauseId);
    if (!cl) return { ok: false, reason: "no such clause" };
    const lv = (cl.levels || []).find(l => l.id === levelId);
    if (!lv) return { ok: false, reason: "no such level" };
    const was = ((st.clauses || {})[billId] || {})[clauseId];
    const store = st.clauses[billId] || (st.clauses[billId] = {});
    store[clauseId] = levelId;
    /* Refused rather than allowed into deficit: the ceiling is the whole
       of the fiscal model and it has to bite at the point of choosing,
       where the player can still do something about it. */
    const cost = clauseCost(st, C, billId);
    if (!cost.affordable) {
      if (was) store[clauseId] = was; else delete store[clauseId];
      return { ok: false, reason: "the Treasury is short by " + cost.over,
               over: cost.over };
    }
    return { ok: true, level: lv, cost: cost };
  }

  /* Applied where a bill's own onPass is applied, so a clause is part of
     the Act rather than a thing that happens near it. */
  function clauseEffects(st, C, billId) {
    const plan = clausePlan(st, C, billId);
    return Object.keys(plan).reduce((a, k) =>
      a.concat(plan[k].effects || []), []);
  }

  /* ---------------------------------------------------------
     DOMAIN CONSENT — the bench that owns the subject.

     Every functional constituency has carried an `interest` array since
     the roll was written: twenty-two named domains across eleven
     constituencies, authored, editable, serialised, and READ BY NOTHING.
     Meanwhile `dualMajority` was a boolean an author typed, true on two
     bills of seven, so on five of seven measures the functional forty
     were decoration — and the bill dossier already stated the rule in
     prose ("bills touching life-support integrity must carry separately")
     with nothing checking it.

     This connects the two. A measure that touches an interest is answered
     by the constituencies that own it, and by nobody else.

     THREE THINGS KEEP IT FROM BECOMING A VETO ON ALL GOVERNMENT, which
     is the failure mode and would be both tedious and politically flat:

     1. IT IS CONSENT, NOT ENDORSEMENT. The concerned benches must not
        OPPOSE the measure by a majority. They are not required to carry
        it. Abstention and absence therefore count as consent, which is
        what makes abstention worth something to a government rather than
        only to an opposition — a professional body does not have to
        approve, it has to decline to object.

     2. THE HOUSE CAN OVERRIDE, AND IT COSTS. An objection is answered by
        a reinforced majority of the ELECTED benches. So a domain
        objection is a price — go and win more of the House — rather than
        a wall. This is the guard that matters most: without it, two
        members of Attestation and Registry could stop a government with
        two hundred seats behind it.

     3. ONLY WHAT IS TOUCHED IS TESTED. A bill that names no interest
        faces a simple majority, and the pool is the union of the
        concerned constituencies rather than all forty — usually two to
        seven seats, not a second parliament.

     The whole-tier dual majority (§4.6.1, 21 of 40) is a SEPARATE and
     heavier test, unchanged, and stays for charter-level measures. */

  const OVERRIDE_PCT = 0.60;

  /* SUPPLY IS A THIRD TEST: THE FORTY ARE HEARD AND NOT OBEYED.

     A budget touches everything — §7.3 fixes the tax base as volume,
     thermal quota, substrate-hours and mass-to-orbit, and §7.5.2 makes
     the money bill the thing that sets the thermal price — so under
     domain consent the concerned pool would be every constituency and
     all forty seats. That would make the budget the most vetoable
     measure in the game, against a government whose working majority is
     nil, which is the exact inverse of how a parliament works. The
     elected benches vote money.

     THEY VOTE ANYWAY, AND IT IS RECORDED. Excluding them would be the
     less realistic option and the more expensive one: a second chamber
     debates and divides on a money bill and cannot stop it, and the
     division is real. It is also free information — forty members
     registering an objection that changes nothing tells the player
     exactly where the trades stand — and a budget carried against a
     functional bench voting heavily against is a government in trouble
     although it won, because those are the people who have to deliver
     what was just appropriated.

     AND BEING HEARD BUYS THEM TIME. The Parliament Act 1911 model: they
     may delay supply, not kill it. The delay is paid in the one currency
     §7.7 says cannot be topped up, so an objection costs the government
     something it genuinely cannot get back, without being able to stop
     it governing. Implemented through the deferred queue, so the held
     budget appears on the calendar as a dated thing the
     government knows is coming. */
  function isSupply(bill) { return !!bill && bill.test === "supply"; }

  /* Distribute a party's functional votes across the constituencies it
     holds seats in, largest remainder, so the per-constituency tallies
     sum back to the party rows the breakdown prints. */
  function functionalByConstituency(st, C, rows, lobFc) {
    const out = {};
    (C.functional || []).forEach(f => {
      out[f.id] = { id: f.id, name: f.name, seats: 0, aye: 0, nay: 0, abstain: 0 };
    });
    rows.forEach(r => {
      const held = {};
      let total = 0;
      Object.keys(st.functional || {}).forEach(fc => {
        const n = ((st.functional[fc] || {}).held || {})[r.party] || 0;
        if (n) { held[fc] = n; total += n; }
      });
      if (!total) return;
      ["aye", "nay", "abstain"].forEach(kind => {
        const want = r["functional" + kind.charAt(0).toUpperCase() + kind.slice(1)] || 0;
        if (!want) return;
        const share = [], base = {};
        let given = 0;
        Object.keys(held).forEach(fc => {
          const exact = want * held[fc] / total;
          base[fc] = Math.floor(exact);
          given += base[fc];
          share.push({ fc: fc, rem: exact - base[fc] });
        });
        share.sort((a, b) => b.rem - a.rem);
        for (let i = 0; given < want && i < share.length; i++, given++)
          base[share[i].fc] += 1;
        Object.keys(base).forEach(fc => { if (out[fc]) out[fc][kind] += base[fc]; });
      });
      Object.keys(held).forEach(fc => { if (out[fc]) out[fc].seats += held[fc]; });
    });
    /* A lobbied bench is a bench that came over: it is an aye here and it
       stops being a nay, or the body delivered nothing. */
    Object.keys(lobFc || {}).forEach(fc => {
      const t = out[fc]; if (!t) return;
      const take = Math.min(lobFc[fc], t.nay);
      t.aye += take; t.nay -= take;
    });
    return out;
  }

  function domainTest(st, C, billId, rows, popAye, popTotal, lobFc) {
    const bill = C.billById[billId];
    if (isSupply(bill)) return { applies: false, carries: true, supply: true };
    const touches = (bill && bill.touches) || [];
    if (!touches.length) return { applies: false, carries: true };

    const byFc = functionalByConstituency(st, C, rows, lobFc);
    const concerned = (C.functional || []).filter(f =>
      (f.interest || []).some(i => touches.indexOf(i) >= 0));
    if (!concerned.length) return { applies: false, carries: true };

    let seats = 0, against = 0, forIt = 0, abstained = 0;
    const list = concerned.map(f => {
      const t = byFc[f.id] || { seats: 0, aye: 0, nay: 0, abstain: 0 };
      seats += t.seats; against += t.nay; forIt += t.aye; abstained += t.abstain;
      return { id: f.id, name: f.name, seats: t.seats,
               aye: t.aye, nay: t.nay, abstain: t.abstain };
    });

    /* A majority of the concerned seats, against. Of the MEMBERS, as
       everywhere else in this chamber (§4.6.1) — so staying away is not
       opposing, which is the whole of guard 1. */
    const blockAt = Math.floor(seats / 2) + 1;
    const objects = seats > 0 && against >= blockAt;

    /* THE OVERRIDE IS OF THOSE VOTING, not of all members, and that is
       deliberate. Three-fifths of the whole House is 144 against a
       government holding 129, so an override measured against the roll
       would be unreachable and domain consent would be an absolute veto
       dressed as a price. Measured against those who actually voted, a
       House where the objectors' allies stay away is a House that can
       override — which is what abstention is FOR, and the one place in
       the game where a member declining to vote helps the government. */
    const voting = rows.reduce((n, r) =>
      n + (r.popularAye || 0) + (r.popularNay || 0), 0) || popTotal;
    const ovNeed = Math.ceil(voting * OVERRIDE_PCT);
    const override = { need: ovNeed, have: popAye, of: voting,
                       ok: popAye >= ovNeed };

    return { applies: true, interests: touches, constituencies: list,
             seats: seats, against: against, for: forIt, abstain: abstained,
             blockAt: blockAt, objects: objects, override: override,
             carries: !objects || override.ok };
  }

  /* ---------------------------------------------------------
     LOBBYING — the bench somebody else moves for you.

     THE PROBLEM IT EXISTS TO SOLVE, and it is a correctness problem
     rather than a content gap. Substrate neutrality needs the dual
     majority; the dual majority needs 21 of the functional 40; and
     the whip cannot reach a bench outside the coalition — the panel
     says so in as many words. So the engine offered a settlement the
     player could not get to by any sequence of legal moves.

     WHIPPED IS A MEMBER YOU MOVED. LOBBIED IS A BENCH SOMEBODY ELSE
     MOVED FOR YOU. That distinction is the whole design, and it is why
     the two are counted separately in every row.

     WHAT IT COSTS IS NOT A NUMBER YOU HAVE. A whip spends capital or
     loyalty. A lobby spends a PROMISE: settling one creates an
     undertaking through the existing path, so the debt arrives with a
     deadline, a responsible minister and an onBreach, and the player
     pays for the bench in a later session rather than this one. An
     ask that is never kept is the most expensive vote in the game.

     Standing moves too, but downward and only a little: asking a body
     for a favour costs goodwill whether or not you keep your word.
     Breaking the promise is what actually ruins you, and that arrives
     through breakUndertaking like every other broken promise.
     --------------------------------------------------------- */

  /* WHETHER A MEASURE IS ANYTHING TO THIS BODY (T19).

     A body is moved by a SUBJECT it has a stake in — an interest a bill
     declares in `touches` — or by a law key it wants moved. Reading
     `touches` is what lets a body care about the thing it IS rather than
     only a number a measure happens to set. Before this the only key any
     body watched was the divergence threshold, so lobbying was offered on
     exactly one bill of eight however the other measures read: an actor
     whose whole stake is one number is a single-issue pressure group, and
     none of these bodies are that.

     Reads the bill's own declared subject and its own onPass rather than a
     hand-written alignment field: what a measure is about is a fact about
     the measure. A supply bill declares `touches: []` and moves no law, so
     it answers to no body, which is correct — the elected benches vote
     money. */
  function actorAlignment(C, bill, actor) {
    const wants = (actor || {}).wants || {};
    const keys = Object.keys(wants);
    if (!keys.length) return 0;                 /* no view either way */
    /* the subject the measure is about */
    if ((bill.touches || []).some(t => keys.indexOf(t) >= 0)) return 1;
    /* or a law key the measure moves */
    let score = 0;
    [].concat(bill.onPass || []).forEach(e => {
      if (!e || !e.law) return;
      keys.forEach(k => {
        if (e.law[k] === undefined) return;
        score += 1;                             /* the measure touches it */
      });
    });
    return score ? 1 : 0;
  }

  function lobbyable(st, C, billId, actorId) {
    const bs = st.bills[billId], bill = C.billById[billId];
    const a = (C.actorById || {})[actorId], live = (st.actors || {})[actorId];
    if (!bs || bs.dead) return { max: 0, reason: "not before the House" };
    if (!a || !live) return { max: 0, reason: "no such body" };
    /* DUAL MAJORITY *OR* DOMAIN CONSENT. This asked only whether the
       measure faced the whole functional tier, which was right until
       domain consent landed: five of the seven bills are simple and every
       one of them can now be stopped by the constituencies that own its
       subject. So lobbying vanished from exactly the measures where it is
       the only answer to an objection. */
    const answersToBenches = bill &&
      (bill.dualMajority || ((bill.touches || []).length > 0));
    if (!answersToBenches)
      return { max: 0, reason: "no functional bench answers for this measure" };
    if (!actorAlignment(C, bill, a))
      return { max: 0, reason: "this measure does not touch anything they want" };

    /* A body with no goodwill left stops taking the call. Not a purse
       being emptied: a relationship being spent. */
    if (live.standing < 25)
      return { max: 0, reason: "they will not take the call" };

    /* Reach is capped by the seats in that constituency NOT already
       voting for the measure — a body cannot deliver what is already
       yours, and the ceiling must not shrink as the plan is made. */
    const kept = (st.lobby || {})[billId];
    if (kept) { st.lobby[billId] = {}; }
    const d = division(st, C, billId);
    if (kept) { st.lobby[billId] = kept; }
    const spare = Math.max(0, d.functional.total - d.functional.aye);

    /* WHAT THEY WILL DELIVER DEPENDS ON WHAT THEY THINK OF YOU, and this
       is what puts a floor under the settlement rather than a gate.

       The first cut let every aligned body deliver its full reach at
       opening standing, so a player could lobby all six on sitting one,
       carry the dual majority 34 to 21, and reach Substrate Neutrality by
       SITTING FIVE — which is the same hole the settlement floor was
       built to close a week ago, reopened from the other side.

       Scaled by standing, the opening state delivers just enough and only
       if nothing is wasted. A player who wants room has to go and earn it
       first, which is the whole of the mechanic: the bench is not for
       sale, it belongs to somebody who has to want to give it to you. */
    let max = 0;
    Object.keys(a.reach || {}).forEach(fc => {
      const seats = ((C.functionalById || {})[fc] || {}).seats || 0;
      max += Math.min(a.reach[fc], seats);
    });
    max = Math.floor(max * live.standing / 100);
    max = Math.min(max, spare);
    return { max: max,
             reason: max ? null : "every bench they reach is already with you",
             costStanding: 3,
             asks: a.asks || "a favour, unspecified",
             reach: a.reach || {} };
  }

  function setLobby(st, C, billId, actorId, n) {
    const cap = lobbyable(st, C, billId, actorId);
    const v = Math.max(0, Math.min(Math.round(n) || 0, cap.max));
    const plan = st.lobby[billId] || (st.lobby[billId] = {});
    if (v) plan[actorId] = v; else delete plan[actorId];
    return { ok: true, seats: v, max: cap.max };
  }

  function clearLobby(st, billId) { delete st.lobby[billId]; }

  /* What the plan will cost, stated as what is PROMISED rather than what
     is spent, because that is the whole point of the mechanism. */
  function lobbyCost(st, C, billId) {
    const plan = (st.lobby || {})[billId] || {};
    const out = { seats: 0, standing: {}, promises: [] };
    Object.keys(plan).forEach(id => {
      const a = (C.actorById || {})[id]; if (!a || !plan[id]) return;
      out.seats += plan[id];
      out.standing[id] = 3;
      out.promises.push({ actor: id, name: a.name, text: a.asks });
    });
    return out;
  }

  /* Settled when the division is called, exactly like the whips. The
     promise becomes a real undertaking through the existing verb, so it
     carries a deadline and an answer for breaking it without lobbying
     needing to know how either works. */
  function payLobby(st, C, billId) {
    const cost = lobbyCost(st, C, billId);
    cost.promises.forEach(p => {
      if (st.actors[p.actor])
        st.actors[p.actor].standing = clamp(st.actors[p.actor].standing - 3, 0, 100);
      EFFECTS.undertake(st, C, {
        id: "lobby_" + billId + "_" + p.actor,
        text: p.name + ": " + p.text,
        owed_to: p.actor,
        by: null                      /* before the House rises */
      });
    });
    delete st.lobby[billId];
    return cost;
  }

  /* How many functional seats the plan delivers, and to which parties.
     Attributed to the parties holding non-aye seats in the constituencies
     the body reaches, so the breakdown still sums. */
  function lobbiedSeats(st, billId) {
    const plan = (st.lobby || {})[billId] || {};
    let total = 0;
    Object.keys(plan).forEach(id => { total += plan[id] || 0; });
    return total;
  }

  /* WHERE THE LOBBIED SEATS LAND, and this is the join that makes the two
     systems one system rather than two.

     The first build added them to whichever party had a spare functional
     seat, which was arithmetically fine and politically meaningless: an
     actor's `reach` names the CONSTITUENCIES it can move and the seats
     were landing somewhere else entirely. So domain consent and lobbying
     could not see each other, and the measured result was that domain
     consent put Substrate Neutrality back out of reach the day after
     lobbying brought it in.

     Now a body delivers into its own benches, which means lobbying the
     board that objects is the answer to the board that objects — and a
     constituency nobody can reach is a constituency you have to win in
     the House instead. */
  function lobbiedByConstituency(st, C, billId) {
    const plan = (st.lobby || {})[billId] || {};
    const out = {};
    Object.keys(plan).forEach(id => {
      const a = (C.actorById || {})[id]; if (!a) return;
      let want = plan[id] || 0;
      const reach = Object.keys(a.reach || {});
      /* Fill the benches it reaches, in the order the body declares them,
         so the same plan always lands in the same seats. */
      reach.forEach(fc => {
        if (want <= 0) return;
        const cap = Math.min(a.reach[fc], ((C.functionalById || {})[fc] || {}).seats || 0);
        const take = Math.min(cap, want);
        out[fc] = (out[fc] || 0) + take;
        want -= take;
      });
    });
    return out;
  }

  /* ---------------------------------------------------------
     THE ROLL CALL — who, by name, went which way.

     A division currently resolves to counts, and counts are what the
     tellers read out. This is the other half: the lobbies filling, with
     names in them.

     THE THREE TIERS DIFFER CONSTITUTIONALLY AND THIS IS WHERE A PLAYER
     CAN SEE IT, which is the reason to build it at all rather than a
     side effect:

       district    a named member for a named seat. 141 of them exist in
                   content and every one has a name. They can rebel,
                   because a district member was elected by a place and
                   not by a slate.
       functional  a named member with a register reference (LS-1, MT-3).
                   40 exist. Elected by an electorate of interest.
       list        NO NAMES, and this is correct rather than missing. A
                   closed list is the party's, so the list benches vote
                   as the party and there is nobody to name. The player
                   learning that from the roll call is the electoral
                   system teaching itself.

     DETERMINISTIC. The same division read twice names the same rebels,
     because a rebel who is a different person each time is a dice roll
     wearing a name. Nothing here draws.

     THE PAYROLL VOTES FIRST. A minister who votes against the line has
     resigned, so ministers, leaders and whips take the party line ahead
     of anybody else and dissent comes off the BACK of the order. The
     list benches take the line next, being the party's own. What is
     left — a named backbencher for a named seat — is where a rebellion
     lands, which is where rebellions land.
     --------------------------------------------------------- */

  const PAYROLL = ["pm", "minister", "opposition", "shadow", "leader", "whip"];

  /* A LIST MEMBER GETS A NAME, AND IT IS A PLACEHOLDER ON PURPOSE.

     The first build rendered the hundred list seats as an unnamed mark,
     on the argument that a closed list is the party's and there is
     nobody to name. The argument is sound about the MANDATE and wrong
     about the person: a list member is still a member, still sits, and
     still shows up in a division. An unnamed mark says the seat is empty
     rather than that the mandate is collective.

     So they are named from `C.names`, which is `content/names.js` — the
     pools that exist for exactly this, "when you need a name and do not
     care which". Two properties make it safe under §2.7's frozen roster:

       it is a PLACEHOLDER, flagged as one, and never written to content,
       so no character has been invented and the cast is untouched;

       it is STABLE, derived from a hash of the party and the seat's
       index rather than from draw(), so the member for a given list seat
       is the same person every division, every save and every session.
       A name that changes when you look away is worse than no name.

     Content may replace any of them by naming the member for real. */
  function hash32(s0) {
    let h = 2166136261;
    for (let i = 0; i < s0.length; i++) {
      h ^= s0.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  function placeholderName(C, key, taken) {
    const N = C.names || {};
    const g = N.given || [], f = N.family || [], e = N.family_earthborn || [];
    if (!g.length || !f.length) return null;
    /* PROBE UNTIL IT IS NOBODY ELSE. The first version hashed once and
       produced ninety-nine distinct names for a hundred seats, one of
       which was Adaeze Fenwick — a sitting Party of Socialists and Democrats minister. A
       placeholder that collides with the cast is worse than no name at
       all: it puts a real person in two seats and the roll call shows
       them voting twice. So the hash is a starting point and the search
       walks on from it, deterministically, until it lands on a name
       nobody in this Commonwealth already answers to. */
    for (let n = 0; n < 4096; n++) {
      const h = hash32(key + (n ? "#" + n : ""));
      /* A minority read as Earth-born, per bible §10.2 — nobody says so
         out loud and everybody notices. One in nine keeps the proportion
         a remark rather than a pattern. */
      const fam = (e.length && (h >>> 28) % 9 === 0) ? e : f;
      const name = g[h % g.length] + " " + fam[(h >>> 8) % fam.length];
      if (!taken || !taken.has(name)) { if (taken) taken.add(name); return name; }
    }
    return null;
  }

  /* Every name this Commonwealth already uses, so a placeholder can avoid
     all of them: the cast, the district members on the roll, and the
     functional register. Bare of honorifics and the trailing MP, because
     "Adriana Flash" and "Rt. Hon. Adriana Flash MP" are one person. */
  function namesTaken(C) {
    const bare = (x) => String(x || "")
      .replace(/^(Rt\. Hon\.|Hon\.|Dr\.|Prof\.)\s+/, "")
      .replace(/\s+MP$/, "").trim();
    const t = new Set();
    (C.characters || []).forEach(c => t.add(bare(c.name)));
    (C.constituencies || []).forEach(k => t.add(bare(k.member)));
    (C.functional || []).forEach(fc =>
      (fc.members || []).forEach(m => t.add(bare(m.name))));
    /* PARTY OFFICERS TOO. They hold no seat and are not in the cast, so
       nothing here would have stopped a generated list member being given
       the name of their own party's general secretary. */
    Object.keys(C.partyOrg || {}).forEach(pid =>
      ((C.partyOrg[pid] || {}).officers || []).forEach(o => t.add(bare(o.name))));
    t.delete("");
    return t;
  }

  /* EVERY MEMBER THE HOUSE HAS, party by party, with no division to hang
     them on.

     This was the first half of rollCall() and could only be reached by
     costing a division first, so "who sits for the Liberals" was a question
     the interface could not ask outside a vote. It is the same code, lifted:
     one source, because two ways of seating the House would eventually seat
     it differently.

     `popularCount` is a function rather than a number because the two
     callers disagree about where the count comes from, and both are right.
     A division carries its own frozen popular figure for each party and must
     seat exactly that many; anybody else wants the live roll. */
  function benchAll(st, C, popularCount) {
    /* seat name -> the cast member sitting for it, so a district row can
       be upgraded from a bare name in the roll to a person with an office. */
    const cast = {};
    (C.characters || []).forEach(ch => { if (ch.seat) cast[ch.seat] = ch; });

    /* One set for the whole House, so two parties cannot seat the same
       placeholder and no placeholder can be a member who already exists.
       Filled in content's party order rather than a division's row order,
       so the same member has the same name whether the House is voting or
       being read. */
    const taken = namesTaken(C);
    const out = {};

    (C.parties || []).forEach(p => {
      const seats = [];

      /* district: a named member per seat, from the roll. */
      (C.constituencies || []).forEach(k => {
        const held = (st.roll[k.id] || {}).held || {};
        if ((st.roll[k.id] || {}).nonVoting) return;
        for (let i = 0; i < (held[p.id] || 0); i++) {
          const ch = cast[k.name];
          seats.push({ tier: "district", name: (ch && ch.name) || k.member,
                       seat: k.name, office: ch ? ch.office : null,
                       payroll: !!(ch && PAYROLL.indexOf(ch.office) >= 0) });
        }
      });

      /* list: the party's slate. Named from the pools, flagged as a
         placeholder, stable across saves. See placeholderName. */
      const listN = Math.max(0, popularCount(p.id) - seats.length);
      for (let i = 0; i < listN; i++)
        seats.push({ tier: "list", payroll: false, placeholder: true,
                     name: placeholderName(C, p.id + ":list:" + i, taken),
                     seat: null, listIndex: i + 1 });

      /* functional: named, with the register reference. */
      const fseats = [];
      (C.functional || []).forEach(fc => {
        (fc.members || []).forEach(m => {
          if (m.party !== p.id) return;
          const ch = cast[m.name];
          fseats.push({ tier: "functional", name: m.name, ref: m.ref,
                        seat: fc.name, office: ch ? ch.office : null,
                        payroll: !!(ch && PAYROLL.indexOf(ch.office) >= 0) });
        });
      });

      out[p.id] = { popular: seats, functional: fseats };
    });
    return out;
  }

  /* The House as it stands, for anybody who is not counting a vote. */
  function benchRoll(st, C) {
    return benchAll(st, C, id => partyPopular(st, id));
  }

  function rollCall(st, C, billId, d) {
    d = d || division(st, C, billId);
    const bench = benchAll(st, C, id => {
      const r = d.rows.find(x => x.party === id);
      return r ? r.popularSeats : partyPopular(st, id);
    });
    const parties = d.rows.map(r => {
      const b = bench[r.party] || { popular: [], functional: [] };
      return { party: r.party, row: r,
               popular: assign(b.popular, r, "popular"),
               functional: assign(b.functional, r, "functional") };
    });

    return { bill: billId, dual: d.dual, parties: parties, division: d };
  }

  /* The order is the politics: payroll, then the list, then named
     backbenchers, and within each a stable sort so the same seat is the
     same vote every time this is read. The line fills from the front;
     everything that is not the line falls off the back. */
  function assign(seats, r, bench) {
    const n = (k) => r[bench + k] || 0;
    const aye = n("Aye"), abstain = n("Abstain"), absent = n("Absent");
    const nay = Math.max(0, seats.length - aye - abstain - absent);
    const line = r[bench + "Kind"] === "against" ? "nay" : "aye";

    const rank = (s) => (s.payroll ? 0 : s.tier === "list" ? 1 : 2);
    const ordered = seats.slice().sort((a, b) =>
      rank(a) - rank(b) ||
      String(a.seat || "").localeCompare(String(b.seat || "")) ||
      String(a.name || "").localeCompare(String(b.name || "")));

    /* the line first, then the quieter dissents, then the open one */
    const queue = [];
    const push = (vote, count) => { for (let i = 0; i < count; i++) queue.push(vote); };
    push(line, line === "aye" ? aye : nay);
    push("absent", absent);
    push("abstain", abstain);
    push(line === "aye" ? "nay" : "aye", line === "aye" ? nay : aye);

    return ordered.map((s, i) => Object.assign({}, s, { vote: queue[i] || line }));
  }

  function reportedRows(st, d) {
    return d.rows.map(r => {
      const out = Object.assign({}, r);
      ["popular", "functional"].forEach(bench => {
        const k = bench + "Aye", seats = r[bench + "Seats"];
        out[k] = Math.max(0, Math.min(seats, r[k] + reportError(st, r.party, bench)));
        /* Nay is derived from the aye, so it has to be re-derived from the
           REPORTED one or the estimate and the breakdown disagree by exactly
           the error — the leak this function exists to close, reopened one
           column to the right. Abstention is a stated position and not a
           count, so it is not estimated. */
        out[bench + "Nay"] = Math.max(0, seats - out[k] -
          (r[bench + "Abstain"] || 0) - (r[bench + "Absent"] || 0));
      });
      if (r.benches) out.benches = reportedBenches(r, out);
      return out;
    });
  }
  function reportedBenches(r, out) {
    return ["popular", "functional"].reduce((rows, bench) => {
      const k = bench + "Aye", sk = bench + "Seats";
      if (r[k] === out[k]) return rows;
      const live = rows.filter(b => b[k] != null);
      if (!live.length) return rows;
      /* Weight by the true count, so a current that was delivering
         nothing is not handed members by the whips' own guesswork; fall
         back to members when every current was at zero. */
      const w = live.map(b => b[k] || 0);
      const share = capped(out[k], w.some(n => n) ? w : live.map(b => b[sk]),
                           live.map(b => b[sk]));
      const seen = new Map(live.map((b, i) => [b, share[i]]));
      return rows.map(b => seen.has(b) ? Object.assign({}, b, { [k]: seen.get(b) }) : b);
    }, r.benches.map(b => Object.assign({}, b)));
  }

  function reported(st, C, billId) {
    const d = division(st, C, billId);
    const rows = reportedRows(st, d);
    const benchAye = bench =>
      Math.max(0, Math.min(d[bench].total,
        rows.reduce((n, r) => n + r[bench + "Aye"], 0)));
    const benchSum = (bench, k) => rows.reduce((n, r) => n + (r[bench + k] || 0), 0);
    const p = benchAye("popular"), f = benchAye("functional");
    const pc = p >= d.popular.need, fc = f >= d.functional.need;
    /* THE FORECAST HAS TO FORECAST THE DOMAIN TEST TOO. Without this the
       estimate said a measure carried and the division then lost it to an
       objection the player was never shown — a forecast that contradicts
       its own outcome, which is worse than no forecast at all.

       Computed from the REPORTED rows, not the true ones, so it stays an
       estimate: the whips' read of what the benches that own the subject
       will do, wrong by the same per-party error as everything else here. */
    const dom = domainTest(st, C, billId, rows, p, d.popular.total,
                           lobbiedByConstituency(st, C, billId));
    return {
      dual: d.dual, true: d, rows: rows, domain: dom,
      popular:    { aye: p, total: d.popular.total,    need: d.popular.need,    carries: pc,
                    abstain: benchSum("popular", "Abstain"), nay: benchSum("popular", "Nay"),
                    absent: benchSum("popular", "Absent") },
      functional: { aye: f, total: d.functional.total, need: d.functional.need, carries: fc,
                    abstain: benchSum("functional", "Abstain"), nay: benchSum("functional", "Nay"),
                    absent: 0 },
      carries: (d.dual ? (pc && fc) : pc) && dom.carries,
      /* what the number is and who said so. Present on every forecast shown. */
      prov: "Whips' count; partners' assurances; an estimate of the functional bench"
    };
  }

  /* ---------------------------------------------------------
     4. CONDITIONS — the closed vocabulary events may test
     --------------------------------------------------------- */

  const CONDITIONS = {
    minSitting:   (st, v) => st.sitting >= v,
    maxSitting:   (st, v) => st.sitting <= v,
    flags:        (st, v) => v.every(f => !!st.flags[f]),
    flagsAbsent:  (st, v) => v.every(f => !st.flags[f]),
    scalarBelow:  (st, v) => Object.keys(v).every(k => st.scalars[k] < v[k]),
    scalarAbove:  (st, v) => Object.keys(v).every(k => st.scalars[k] > v[k]),
    lawIs:        (st, v) => Object.keys(v).every(k => st.law[k] === v[k]),
    lawBelow:     (st, v) => Object.keys(v).every(k => st.law[k] < v[k]),
    lawAbove:     (st, v) => Object.keys(v).every(k => st.law[k] > v[k]),
    loyaltyBelow: (st, v) => Object.keys(v).every(k =>
                    ((st.currents[k] || st.parties[k] || {}).loyalty ?? 100) < v[k]),
    loyaltyAbove: (st, v) => Object.keys(v).every(k =>
                    ((st.currents[k] || st.parties[k] || {}).loyalty ?? 0) > v[k]),
    stationBelow: (st, v) => Object.keys(v).every(id =>
                    Object.keys(v[id]).every(f => st.stations[id][f] < v[id][f])),
    billStage:    (st, v) => Object.keys(v).every(id => st.bills[id] && st.bills[id].stage === v[id]),
    signaturesAtLeast: (st, v) => (st.signatures || 0) >= v,
    /* The leadership ballot (design/08 §2). Content narrates it; the engine
       holds it. `ballotHeld` is true once the caucus has divided and before
       the event has been read; `ballotCarries` says which way it went. */
    ballotHeld:     (st, v) => v ? !!st.ballot : !st.ballot,
    /* A partner has walked out and not come back (design/38 §3). */
    withdrawn:      (st, v) => (Object.keys(st.withdrawn || {}).length > 0) === !!v,
    /* THE COUNT'S RESULT (design/38 §2), for the epilogue and anything
       after it: whether the government's side came back with a majority,
       and its seats in the new House. All false until the count. */
    returned:       (st, v) => counted(st) &&
                      (st.dissolved.sideNow >= st.dissolved.majority) === !!v,
    sideAtLeast:    (st, v) => counted(st) && st.dissolved.sideNow >= v,
    sideBelow:      (st, v) => counted(st) && st.dissolved.sideNow < v,
    ballotCarries:  (st, v) => !!st.ballot && st.ballot.carries === !!v,
    siInForce:      (st, v) => [].concat(v).every(k => st.instruments[k] && st.instruments[k].inForce),
    siNotMade:      (st, v) => [].concat(v).every(k => st.instruments[k] && !st.instruments[k].made),
    postVacant:     (st, v) => [].concat(v).every(k => st.cabinet[k] && !st.cabinet[k].holder),
    /* §4.6.4's tool, in the condition vocabulary: content can notice that
       the government has been appointing to its own electorates. */
    boardsAtLeast:  (st, v) => boardsTotal(st) >= v,
    boardsBelow:    (st, v) => boardsTotal(st) < v,
    priceAbove:     (st, v) => Object.keys(v).every(k => st.prices[k] > v[k]),
    priceBelow:     (st, v) => Object.keys(v).every(k => st.prices[k] < v[k]),
    capitalAbove:   (st, v) => Object.keys(v).every(k => (st.capital[k] || 0) > v[k]),
    capitalBelow:   (st, v) => Object.keys(v).every(k => (st.capital[k] || 0) < v[k]),
    /* §7.10, so content can gate on the productive economy and not only on
       the cost of existing. A save being migrated has no economy for the
       instant before the guard runs, so an absent one answers false rather
       than throwing. */
    economyAbove:   (st, v) => !!st.economy &&
      Object.keys(v).every(k => st.economy[k] > v[k]),
    economyBelow:   (st, v) => !!st.economy &&
      Object.keys(v).every(k => st.economy[k] < v[k]),
    slotsLeft:      (st, v) => (st.slots.total - st.slots.used) >= v,
    /* Conditions are not under the twenty-verb cap (§15.5), so the world
       may be read in as many ways as content needs. */
    /* THE TRIGGERS FOR CHAPTERS THREE AND FOUR.

       §1.7 is LOCKED: chapters advance on a DECISION, so the engine must
       not move one itself. What it can do is let content see the two
       moments that were previously invisible, so an authored event can
       fire on them and advance the chapter in the ordinary way:

         { when:{ dissolved:true }, effects:[{chapter:3}] }

       There is no chapter after the count (bible §1.7), so a result — the
       `resolved` condition below — opens no chapter: its aftermath plays in
       chapter two while the House still sits, chained with `seen`.

       `risesWithin` is for the run-up rather than the moment: an event
       that wants to fire in the last few sittings before the House goes
       to the country asks for it by number instead of guessing a sitting. */
    dissolved:      (st, v) => !!st.dissolved === !!v,
    /* WHICH ANSWER HOLDS, AND WHETHER THE CRISIS HAS RESOLVED. Each takes
       `true`/`false` for "has one landed" or an id for "has this one".
       `settled` took a boolean only and compared truthiness, so
       `settled:"restriction"` was true of ANY settlement — harmless only
       because the achievements that write it use their own matcher. */
    settled:        (st, v) => typeof v === "string" ? st.settledAs === v
                                                     : !!st.settledAs === !!v,
    resolved:       (st, v) => typeof v === "string" ? st.resolvedAs === v
                                                     : !!st.resolvedAs === !!v,
    /* The older spelling of `resolved:<id>`, kept because content uses it. */
    resolvedIs:     (st, v) => st.resolvedAs === v,
    /* {campaign:"flash_i"} or a list: true in the named campaign(s). For
       an entry SHARED by several campaigns that wants to branch on which
       one is running; an entry that belongs to one campaign carries
       `campaign` itself and is never seen by the others at all. */
    campaign:       (st, v) => [].concat(v).indexOf(st.campaign) >= 0,
    /* EVERY NAMED EVENT HAS FIRED. An ordered sequence outside a chapter's
       prologue — the aftermath of a result, which plays in chapter two
       while the House still sits — chains on this rather than on a flag
       every one of its choices would have to remember to set. */
    seen:           (st, v) => [].concat(v).every(id => (st.seen[id] || 0) > 0),
    risesWithin:    (st, v) => st.risesAt != null &&
                      (st.risesAt - st.sitting) <= v,
    /* ON WHAT WAS HEARD, NOT ON WHAT IS TRUE. design/11 §3 is explicit that
       this is the point rather than a wrinkle to route around: an event
       fires because the last thing you heard was bad, and it may not be
       true any more. A domestic actor has no lag, so this is the live
       figure for everything except the four foreign bodies. */
    actorAbove:     (st, v) => Object.keys(v).every(id =>
                      reportedActor(st, id).standing > v[id]),
    actorBelow:     (st, v) => Object.keys(v).every(id =>
                      reportedActor(st, id).standing < v[id]),
    chapterIs:      (st, v) => st.chapter === v,
    chapterAtLeast: (st, v) => st.chapter >= v,
    inGovernment:   (st, v) => st.inGovernment === v,
    /* THE CONSEQUENCE CHAIN'S LAST LINK (7.9). Prices move stations and
       stations shed people, and until now no condition could see it, so
       the chain had nowhere to terminate. "federal" is the roster sum,
       DERIVED rather than stored — a total kept beside its parts
       diverges from them, which this project has been bitten by before. */
    suspendedAbove: (st, v) => Object.keys(v).every(k =>
                      (k === "federal" ? federalSuspended(st)
                                       : ((st.stations[k] || {}).suspended || 0)) > v[k]),
    suspendedBelow: (st, v) => Object.keys(v).every(k =>
                      (k === "federal" ? federalSuspended(st)
                                       : ((st.stations[k] || {}).suspended || 0)) < v[k]),
    /* An undertaking still outstanding, and one that was broken. `breached`
       is the cheap form of long memory: content written months apart can
       refer back to a promise the player did not keep. */
    owes:           (st, v) => [].concat(v).every(id =>
                      (st.undertakings || []).some(u => u.id === id && u.state === "open")),
    breached:       (st, v) => [].concat(v).every(id =>
                      (st.undertakings || []).some(u => u.id === id && u.state === "broken")),
    /* How many divisions have run with a pair in force. See divide(). */
    pairsKeptAtLeast: (st, v) => (st.pairsKept || 0) >= v
  };

  /* ---------------------------------------------------------
     STATION GOVERNMENT IS NOT ONE THING (design/27 B)

     A reader, not a stored field, which is why it costs nothing against the
     verb cap: a station's constitution follows from what the station already
     is. A ring-band station with fifteen seats is a state with municipalities
     under it; a large dense single station is a city-state; the mid-size are
     home-rule charters; the low band is administered or meets. The one already
     true exception is the capital, which is its own thing and does not vote.

     This is what makes the federal settlement mean something specific rather
     than an administrative rearrangement: to devolve to Anselm Ring, which has
     a legislature of its own, is a different act from devolving to Homestead,
     which has a town meeting.
     --------------------------------------------------------- */
  const GIFT = ["the shelf", "every berth", "the berth", "every deck", "the deck"];
  function stationGovernment(st, C, id) {
    const s0 = (C.stations || []).find(x => x.id === id);
    const s = (st.stations || {})[id];
    if (!s0 || !s) return null;
    /* THE CAPITAL IS ITS OWN THING. Its seat is non-voting, and the flag for
       that lives on the constituency rather than the station, so it is read
       there: a station whose only seat does not vote is the capital. */
    const cons = (C.constituencies || []).filter(k => k.station === id);
    const nonVoting = cons.length > 0 && cons.every(k => k.nonVoting);
    if (nonVoting) return { form: "capital", name: "the Capital Territory",
      seats: 0, who: "direct administration",
      line: "Administered directly by the Commonwealth, and non-voting. The Charter made it so." };
    const seats = s0.seats || 0;
    const pop = s0.population || 0;
    if (s0.type === "bundled") return { form: "federal", name: "a bunded union",
      seats: seats, who: "a delegation of settlements",
      line: `${s0.settlements || "several"} settlements sharing one delegation and almost nothing else, ` +
            `which is what ${pop.toLocaleString()} people call a government.` };
    if (s0.band === "ring" && seats >= 6) return { form: "state", name: "a state government",
      seats: seats, who: "a chamber of its own, with municipalities beneath it",
      line: `A state with ${seats} members and municipalities under it. It legislates on ${GIFT[0]} and ` +
            `settles the rest locally.` };
    if (pop >= 200000 && seats >= 4) return { form: "city", name: "a city-state",
      seats: seats, who: "one council, no subdivision",
      line: `One government for the whole hull and no subdivision, which is what ${pop.toLocaleString()} ` +
            `people in one cylinder does to a constitution.` };
    if (pop >= 100000) return { form: "charter", name: "a home-rule charter",
      seats: seats, who: "a single elected council",
      line: `Wide powers and one council, on a charter the Commonwealth grants and could withdraw.` };
    if (s0.band === "low") return { form: "meeting", name: "direct administration",
      seats: seats, who: "the federal officer and, in practice, a meeting",
      line: `Too small to charter and too far to ignore. The Commonwealth appoints an officer and the ` +
            `${pop.toLocaleString()} residents hold meetings that outrank him.` };
    return { form: "charter", name: "a home-rule charter",
      seats: seats, who: "a single elected council",
      line: `Wide powers and one council, on a charter the Commonwealth grants and could withdraw.` };
  }

  /* ---------------------------------------------------------
     A FOREIGN BODY IS NOT A STATION (design/29 §4, the campaign's premise)

     The Bellamy Almanac Works is the object of the campaign and not a
     member of the Commonwealth: it returns no members, it is not in the
     apportionment, and `st.stations` does not contain it, which is what
     keeps the chamber at 280 until the question is settled. These two
     readers are the whole of the engine's part in that: is it inside the
     Commonwealth, and what did annexing it cost.

     ANNEXATION IS A CONTENT ACT. There is no `annex` verb and there does
     not need to be: content sets a flag and, if the ending takes the
     Works in, the seat arithmetic is a `seats` effect like any other. What
     the engine owes content is a way to ASK, which is what these are.
     --------------------------------------------------------- */
  function foreignBodies(C) {
    return ((C.world || {}).foreign) || [];
  }
  function foreignBody(C, id) {
    return foreignBodies(C).find(x => x.id === id) || null;
  }
  /* Inside the Commonwealth: a flag, because annexation is a decision and
     not a number. The flag is content's and the reader names it once. */
  function isAnnexed(st, C, id) {
    const b = foreignBody(C, id);
    return !b ? false : !!(st.flags && st.flags["annexed_" + id]);
  }

  function federalSuspended(st) {
    let n = 0;
    for (const id in st.stations) n += st.stations[id].suspended || 0;
    return n;
  }

  function matches(st, when) {
    if (!when) return true;
    return Object.keys(when).every(k => {
      if (!CONDITIONS[k]) throw new Error("unknown condition: " + k);
      return CONDITIONS[k](st, when[k]);
    });
  }

  /* ---------------------------------------------------------
     5. EFFECTS — the closed vocabulary choices may apply
     --------------------------------------------------------- */

  /* THE DENOMINATED SCALARS (design/28 phase 4, bible 7.5.3).
     `solvency` is the quota the state holds in MW-years rejected, so it is
     a quantity: floor at nought, no ceiling, and one unit of the old index
     is a thousand of these. The exceptions live here rather than in a
     second scalar namespace, so a bare `{move:{solvency:n}}` still reaches
     the same table it always did. */
  const SCALAR_MAX   = { solvency: Infinity };

  /* THE ONE WAY A SCALAR MOVES BY AN AMOUNT. `move`, the trends, the
     couplings and the idleness drag each wrote their own
     `clamp(x + d, 0, 100)`, and only `move` had learned that solvency is
     denominated -- so a trend or a coupling on solvency clamped the reserve
     to a hundred MW-years in one sitting. Refusing the emergency loan set
     such a trend, and the debt trap's coupling (friction above 65,
     solvency -1000 a sitting) did it every sitting: 52,000 became 100
     (design/34). And a national standing move is a move in every band,
     wherever it comes from. */
  function bumpScalar(st, C, k, d) {
    if (!d) return;
    /* the government's party's loyalty is its currents' (syncLoyalty) */
    if (k === "party_loyalty" && st.parties && st.parties[st.playerParty])
      return shiftLoyalty(st, C, st.playerParty, d);
    st.scalars[k] = clamp((st.scalars[k] || 0) + d, 0,
      SCALAR_MAX[k] == null ? 100 : SCALAR_MAX[k]);
    /* A NATIONAL MOVE IS A MOVE IN EVERY BAND. Content written before
       the bands existed goes on meaning what it meant, and the
       national figure stays the derived one rather than becoming a
       second number that can disagree with its own parts. */
    if (k === "public_standing" && st.standing) {
      Object.keys(st.standing).forEach(b => {
        st.standing[b] = clamp(st.standing[b] + d, 0, 100);
      });
      syncStanding(st, C);
    }
  }
  const TREND_MAX    = { solvency: 10000 };
  const MONEY_SCALE  = { solvency: 1000 };

  const EFFECTS = {    /* MOVE — one verb for every number that is clamp-and-add against a
       keyed table. It replaced `scalar`, `loyalty`, `relationship`,
       `price` and `capital`, which differed only in which table they
       reached into and what the bounds were:

         {move:{ solvency:-5 }}              a bare key is a scalar
         {move:{ "loyalty.psa":8 }}          a party OR a current
         {move:{ "rel.gb_chair":12 }}        a character, or "president"
         {move:{ "price.substrate":-10 }}
         {move:{ "capital.psa":3 }}

       Bounds are kept per namespace, not flattened: scalars and loyalty
       clamp 0-100, prices clamp 20-400, and capital is unbounded and
       signed because 7.6 says nothing decays and nothing is forgiven.

       ONE SCALAR IS DENOMINATED, and the bound has to know it. `solvency`
       is the quota the state holds in MW-years (7.5.3), a quantity with a
       floor at nought and no ceiling; clamping it to a hundred would have
       made the re-cost silently do nothing. SCALAR_MAX carries the
       exceptions and nothing else changes.

       ONE PAIR PER OBJECT is the house style, and it is not cosmetic:
       the editor renders one key-value row per effect, so a multi-key
       object used to lose every key after the first when a human opened
       and saved it. 25 of 53 keyed effects in content were in that
       state. Multi-key objects still WORK here — the loop below takes
       them all — and js/editor.js now expands one into a row each, so
       neither half can drop anything again. */
    move: (st, C, v) => Object.keys(v).forEach(key => {
      const d = v[key], dot = key.indexOf(".");
      const ns = dot < 0 ? "scalar" : key.slice(0, dot);
      const k  = dot < 0 ? key : key.slice(dot + 1);
      switch (ns) {
        case "scalar":
          bumpScalar(st, C, k, d);
          break;
        /* {move:{"standing.low":-8}} — a band, not the country. */
        case "standing":
          if (st.standing && st.standing[k] != null) {
            st.standing[k] = clamp(st.standing[k] + d, 0, 100);
            syncStanding(st, C);
          } else {
            st.log.unshift({ sitting: st.sitting, text:
              "IGNORED: no band of the roll is called " + k + "." });
          }
          break;
        case "loyalty":
          shiftLoyalty(st, C, k, d);
          break;
        case "rel":
          if (k === "president") st.president.relationship = clamp(st.president.relationship + d, 0, 100);
          else if (st.characters[k]) st.characters[k].relationship = clamp(st.characters[k].relationship + d, 0, 100);
          break;
        case "price":
          st.prices[k] = clamp((st.prices[k] || 100) + d, 20, 400); break;
        case "capital":
          st.capital[k] = (st.capital[k] || 0) + d; break;
        /* TRENDS (Flash I): {move:{"trend.lsm":-2}} leans the scalar that
           much each sitting; tick() applies it. Clamped, because a trend
           beyond ±10 a sitting is a switch wearing a dial. A denominated
           scalar leans in its own unit, so its cap is the same ten points
           of the old index: ten thousand MW-years a sitting. */
        case "trend":
          st.trends = st.trends || {};
          st.trends[k] = clamp((st.trends[k] || 0) + d,
            -(TREND_MAX[k] == null ? 10 : TREND_MAX[k]),
             (TREND_MAX[k] == null ? 10 : TREND_MAX[k]));
          break;
        /* No new verb: an actor's standing moves the way a party's loyalty
           does, which is what keeps EFFECTS at its twenty-one and off
           §15.5's line for a twenty-second time. */
        /* {move:{"debt.alliance":18000}} -- what is owed to a lender, in
           MW-years. Content writes the reserve's side itself (a loan is
           the debt AND the money), so a facility is two moves, and neither
           needed a new verb. Floor at nought: nobody owes the Commonwealth. */
        case "debt":
          owedTable(st)[k] = Math.max(0, debtOf(st, k) + d);
          break;
        case "actor":
          if (st.actors[k])
            st.actors[k].standing = clamp(st.actors[k].standing + d, 0, 100);
          break;
        default:
          st.log.unshift({ sitting: st.sitting, text:
            "IGNORED: a move effect named no such target: " + key + "." });
      }
    }),

    /* §7.10. `private` is a share and clamps to 0..1; the other two are
       indices and clamp the way a price does. Its own verb rather than a
       move namespace because an economy is not a scalar: participation is
       a per cent of adults and trade is an index at 100, and banding
       either against the 0..100 scalar scale would misreport every
       effect. */
    economy: (st, C, v) => Object.keys(v).forEach(k => {
      if (!st.economy) return;
      if (k === "private") st.economy.private = clamp(st.economy.private + v[k], 0, 1);
      else st.economy[k] = clamp((st.economy[k] || 0) + v[k], 0, 300);
    }),

    law: (st, C, v) => Object.assign(st.law, v),
    station: (st, C, v) => Object.keys(v).forEach(id => {
      Object.keys(v[id]).forEach(f => {
        const d = v[id][f];
        st.stations[id][f] = (typeof d === "number" && typeof st.stations[id][f] === "number")
          ? st.stations[id][f] + d : d;
      });
    }),
    seats: (st, C, v) => Object.keys(v).forEach(pid => {
      Object.keys(v[pid]).forEach(t => {
        /* district and functional are derived from their rolls; setting one
           here would be undone by the next sync without saying so. */
        if (t === "district") {
          st.log.unshift({ sitting: st.sitting, text:
            "IGNORED: a seats effect tried to set district seats for " + pid +
            ". District seats live in the roll — use cross or vacate_seat." });
          return;
        }
        if (t === "functional") {
          st.log.unshift({ sitting: st.sitting, text:
            "IGNORED: a seats effect tried to set functional seats for " + pid +
            ". Functional seats live in the functional roll — use the functional verb." });
          return;
        }
        st.parties[pid].seats[t] += v[pid][t];
      });
    }),
    /* A functional seat moves inside a named constituency: { fc_legal:{psa:2,
       gb:-1} }. The party total is then derived, exactly as district seats are
       derived from the district roll. */
    functional: (st, C, v) => Object.keys(v).forEach(fid => {
      const roll = st.functional && st.functional[fid];
      if (!roll) {
        st.log.unshift({ sitting: st.sitting, text:
          "IGNORED: a functional effect named no such constituency: " + fid + "." });
        return;
      }
      Object.keys(v[fid]).forEach(pid => {
        roll.held[pid] = (roll.held[pid] || 0) + v[fid][pid];
        if (roll.held[pid] <= 0) delete roll.held[pid];
      });
    syncFunctional(st, C);
    }),
    /* One verb, not two. `{flag:"x"}` sets, `{flag:{x:false}}` clears.
       The old `unflag` verb is gone: it was the same operation with the
       value baked in. */
    /* THE OPPOSITION TABLES A MOTION (design/33 §1).

       Confidence was something the government LOST PASSIVELY: the arithmetic
       went wrong, checkLoss noticed, the run ended. The opposition never
       decided anything, which is most of why the chamber reads as weather
       rather than as an actor.

       This is a division the player did not call, on a date, that she can
       see coming and cannot cancel. The whole forecast and whipping
       apparatus already works; what did not exist was a division arriving
       from the other side.

       WHAT MAKES IT A GAMBLE RATHER THAN A HECKLE: a motion that fails
       STRENGTHENS the government, which is what a confidence vote is for.
       Content decides when the opposition thinks it can win.

       `{motion:{after:3, by:"cl"}}` tables one. */
    motion: (st, C, v) => {
      /* A NUMBER OR AN OBJECT. The number is what the editor writes and what
         content uses; the object is for an author who wants to name the
         paper or say who tabled it. */
      const o = (v && typeof v === "object") ? v : { after: Number(v) };
      st.motion = { on: st.sitting + (o.after == null ? 2 : o.after),
                    by: o.by || null, tabledAt: st.sitting,
                    label: o.label || "Motion of no confidence" };
      st.wire = st.wire || [];
      st.wire.unshift({ sitting: st.sitting,
        text: "MOTION OF NO CONFIDENCE TABLED; THE HOUSE DIVIDES ON SITTING " + st.motion.on });
    },

    flag:   (st, C, v) => {
      if (v && typeof v === "object" && !Array.isArray(v))
        Object.keys(v).forEach(f => { if (v[f]) st.flags[f] = true; else delete st.flags[f]; });
      else [].concat(v).forEach(f => st.flags[f] = true);
    },
    bill:   (st, C, v) => Object.keys(v).forEach(id => Object.assign(st.bills[id], v[id])),
    coalition: (st, C, v) => {
      if (v.remove) st.coalition = st.coalition.filter(p => !v.remove.includes(p));
      if (v.add) v.add.forEach(p => { if (!st.coalition.includes(p)) st.coalition.push(p); });
    },
    wire: (st, C, v) => [].concat(v).forEach(t => st.wire.unshift({ sitting: st.sitting, text: t })),
    /* THE QUEUE CARRIES A FACT AS WELL AS A STORY.

       It held `{eventId, dueSitting}` and nothing else, so anything the
       game wanted to happen LATER had to happen as an authored event: a
       court could not return a verdict, a dispatch could not arrive, a
       commission could not report, without prose written first. That is
       the single thing standing between "build the engine, then write
       the content" and its opposite.

       `effects` is a key on the verb that already exists, not a verb of
       its own — §15.5's twenty-verb line holds at twenty. An entry may
       carry an event, a set of effects, or both; `label` is what the
       calendar calls it, and a labelled entry is foreseeable exactly the
       way a `foreseen` event is. Unlabelled, it arrives unannounced,
       which is the difference between a commission and an ambush. */
    queue: (st, C, v) => [].concat(v).forEach(q =>
      st.queue.push({
        eventId: q.event || null,
        effects: q.effects || null,
        label:   q.label || null,
        source:  q.source || null,
        dueSitting: st.sitting + (q.after == null ? 1 : q.after)
      })),
    signatures: (st, C, v) => { st.signatures = Math.max(0, (st.signatures || 0) + v); },
    /* COURT THE PARTNERS WHO HAVE WALKED OUT (design/38 §3). Moves the
       loyalty of every party that has withdrawn from the government, which
       is the one set content cannot name in advance. */
    court: (st, C, v) => Object.keys(st.withdrawn || {}).forEach(id =>
      shiftLoyalty(st, C, id, Number(v) || 0)),
    si: (st, C, v) => [].concat(v).forEach(id => makeInstrument(st, C, id)),
    cabinet: (st, C, v) => Object.keys(v).forEach(post => {
      if (v[post] === null) vacate(st, C, post, "resigned");
      else appoint(st, C, post, v[post].holder, v[post].party);
    }),
    slots: (st, C, v) => {
      if (v.total != null) st.slots.total += v.total;
      if (v.refill) { st.slots.used = 0; }
      /* {reserve:{billId: n}} — time for that measure alone; see reservedFor. */
      if (v.reserve) {
        const r = st.slots.reserved || (st.slots.reserved = {});
        Object.keys(v.reserve).forEach(id => { r[id] = (r[id] || 0) + v.reserve[id]; });
      }
    },
    /* Seats move by these four verbs and no other. Writing a district count
       directly would desynchronise it from the roll on the next syncRoll,
       silently, which is the failure this whole section exists to prevent. */
    cross: (st, C, v) => [].concat(v).forEach(x =>
      crossFloor(st, C, x.constituency, x.from, x.to, x.seats || 1)),
    /* A by-election is what a vacancy CAUSES, so it is an option on the
       vacancy rather than a verb of its own: {then:"byelection"}. */
    vacate_seat: (st, C, v) => [].concat(v).forEach(x => {
      vacateSeat(st, C, x.constituency, x.party, x.why);
      if (x.then === "byelection") byElection(st, C, x.constituency);
    }),
    election: (st, C, v) => { if (v) generalElection(st, C); },

    /* UNDERTAKE — the government says it will do a thing by a sitting.
       `by` is relative to now, because content cannot know the absolute
       sitting it will fire on. Re-undertaking an id that is already open
       is a no-op rather than a duplicate: a promise repeated is one
       promise. */
    undertake: (st, C, v) => [].concat(v).forEach(u => {
      if (!u || !u.id) return;
      if ((st.undertakings || []).some(x => x.id === u.id && x.state === "open")) return;
      st.undertakings.push({
        id: u.id, text: u.text || u.id, owed_to: u.owed_to || null,
        /* `post` names the cabinet brief the promise belongs to. A promise
           broken in a minister's brief is answered by that minister
           (design/08 §3); a promise with no post is answered by nobody. */
        post: u.post || null,
        /* `by` counts sittings from now. An EXPLICIT null means "before
           the House rises" and comes due at prorogation instead, which
           is the deadline an author usually means and could not
           previously express without guessing a sitting number. */
        by: (Object.prototype.hasOwnProperty.call(u, "by") && u.by === null)
              ? null : st.sitting + (u.by === undefined ? 3 : u.by),
        discharge: u.discharge || null, onBreach: u.onBreach || null,
        state: "open", made: st.sitting
      });
    }),
    /* For content that resolves an undertaking some other way than by
       keeping it — a promise overtaken by events, or released. */
    discharge: (st, C, v) => [].concat(v).forEach(id => {
      const u = (st.undertakings || []).find(x => x.id === id && x.state === "open");
      if (u) u.state = "kept";
    }),

    chapter: (st, C, v) => {
      if (v === st.chapter) return;
      st.chapter = v;
      st.log.unshift({ sitting: st.sitting, text: "— Chapter " + v + " —", chapterMark: true });
    }
  };

  function apply(st, C, effects) {
    if (!effects) return;
    [].concat(effects).forEach(eff => {
      Object.keys(eff).forEach(k => {
        if (!EFFECTS[k]) throw new Error("unknown effect: " + k);
        EFFECTS[k](st, C, eff[k]);
      });
    });
    /* The campaign's last beat ends it, and the count is taken then. */
    if (C && st.dissolved && !counted(st) && st.flags && st.flags.campaign_done) count(st, C);
  }

  /* ---------------------------------------------------------
     6. EVENT SELECTION
     -------------------------------------------------------------
     Deterministic. Queued events first, then the highest-weight
     eligible event. Ties break on id, so a given state always
     produces the same sitting. Makes balance testable.
     --------------------------------------------------------- */

  function eligible(st, C) {
    const out = [];
    C.events.forEach(e => {
      const fired = st.seen[e.id] || 0;
      if (e.queuedOnly) return;          // reachable only via a queue effect
      if (e.prologue) return;            // handled by the authored opening sequence
      if (e.at != null) return;          // has a date; nextScheduled() owns it
      if (e.chapter != null && e.chapter !== st.chapter) return;
      if (e.once && fired) return;
      if (e.maxFires && fired >= e.maxFires) return;
      if (!matches(st, e.when)) return;
      out.push(e);
    });
    return out;
  }

  /* AN EVENT WITH A DATE KEEPS IT.

     `prologue` is an ORDER (the third scripted thing you meet) and the queue is
     a DELAY (four sittings after you asked). Neither is a date, and until this
     the session had no fixed points at all: everything outside the opening
     arrived when the weighted pool got round to it.

     That is what made the crisis feel like it had no schedule. The Flash I
     chain gates each step on a flag the previous step sets, and every step sits
     at weight 84-90, so the whole central argument of the session fired on
     consecutive sittings the moment the player kept saying yes — measured at
     sittings 9, 10 and 11 of a 24-sitting session. Nothing was ever DUE; things
     merely became available, and the pool is steep enough that available means
     next.

     `at: N` is a sitting. The event fires on it, or on the first sitting after
     it if N was spent on something already dated — the queue behaves the same
     way, and a fixed point that silently vanishes because the House was busy is
     worse than one that slips a day. Its `when` still has to pass: a date says
     when the House will hear a thing, not that the thing happened.

     Earliest date first, and it outranks the weighted pool, because the whole
     point is that it does not have to win a contest to happen. */
  /* A DATED EVENT CAN RECUR. `at` holds one sitting, which is right for a
     thing that happens once and wrong for the House's standing business:
     Question Time is not an incident, it is the calendar. `every: N` beside
     `at` means "this sitting and every Nth after it", which nextScheduled
     can read without a new verb and without touching the pools.

     ITS OWN DEDUPE. `st.seen` counts firings and cannot say WHEN, so a
     recurring event would come due again the moment its sitting was
     re-evaluated. `st.lastFired` carries the sitting each event last went
     off, which is also the thing the calendar wants in order to say when the
     next one is due. */
  function dueThisSitting(st, e) {
    if (e.at == null) return false;
    if (e.every == null) return e.at <= st.sitting;
    if (st.sitting < e.at) return false;
    if ((st.sitting - e.at) % e.every !== 0) return false;
    return (st.lastFired || {})[e.id] !== st.sitting;
  }

  function nextScheduled(st, C) {
    const due = C.events.filter(e => {
      if (!dueThisSitting(st, e)) return false;
      const fired = st.seen[e.id] || 0;
      if (e.chapter != null && e.chapter !== st.chapter) return false;
      if (e.once && fired) return false;
      if (e.maxFires && fired >= e.maxFires) return false;
      return matches(st, e.when);
    });
    if (!due.length) return null;
    /* A recurring item yields to a one-off on the same sitting: the standing
       business of the House is never the most important thing happening. */
    return due.sort((a, b) => (a.every ? 1 : 0) - (b.every ? 1 : 0) || a.at - b.at)[0];
  }

  /* A prologue is an authored sequence at the head of a CHAPTER — not a weighted
     pool. It exists so the player meets one new idea at a time instead of five in
     the first paragraph. Events fire in `prologue` order, skipping any whose
     `when` fails. An event with no `chapter` belongs to chapter 1's opening. */
  function nextPrologue(st, C) {
    const pro = C.events
      .filter(e => e.prologue && (e.chapter == null ? 1 : e.chapter) === st.chapter)
      .sort((a, b) => a.prologue - b.prologue);
    for (const e of pro) {
      if (st.seen[e.id]) continue;
      if (!matches(st, e.when)) continue;
      return e;
    }
    return null;
  }

  /* ---------------------------------------------------------
     THE DRAW

     A 32-bit xorshift, advanced only through here, so every draw is
     recorded in the save by the seed's new value. Math.random is
     banned outright: it is not reproducible and it cannot be saved,
     which are the two things 1.5 is protecting.

     WHERE IT MAY BE USED, and where it may not:

       may   choosing between events of equal weight and eligibility
       may   an event's `chance`, tested once when it first becomes
             eligible and never re-rolled
       NOT   whether an event is eligible at all
       NOT   a division. The arithmetic is the argument of the game,
             and a division that could go either way on a die roll
             would also break the proof that a division resolves the
             same whether its dialog is watched or skipped.
     --------------------------------------------------------- */
  function draw(st) {
    let x = st.seed || 1;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    st.seed = x >>> 0;
    return st.seed / 4294967296;
  }

  /* event -> position in its content list, per content object, for the seeded
     lean in nextEvent(). Stable under renaming, built once per content. */
  const ORD = new WeakMap();

  function nextEvent(st, C) {    /* Only entries that ARE an event. A pure-effects entry has already
       been resolved by resolveDue() in advance(); it is not a story and
       must not be mistaken for one. */
    const due = st.queue.filter(q => q.dueSitting <= st.sitting && q.eventId);
    if (due.length) {
      const q = due[0];
      st.queue = st.queue.filter(x => x !== q);
      return C.eventById[q.eventId];
    }
    const pro = nextPrologue(st, C);
    if (pro) return pro;
    const sch = nextScheduled(st, C);
    if (sch) return sch;
    let pool = eligible(st, C);
    if (!pool.length) return null;

    /* `chance` is tested ONCE, when an event first becomes eligible, and
       the answer is remembered. Re-rolling every sitting would turn a
       one-in-three event into a certainty within a few sittings, which
       is the classic way a chance field stops meaning what it says. */
    pool = pool.filter(e => {
      if (e.chance == null) return true;
      st.rolled = st.rolled || {};
      if (st.rolled[e.id] == null) st.rolled[e.id] = draw(st) < e.chance;
      return st.rolled[e.id];
    });
    if (!pool.length) return null;

    /* A SEEDED LEAN, SO THE POOL IS NOT ORDERED BY WEIGHT ALONE.

       Measured: fifteen events were eligible at almost every sitting of every
       run and never once won, because the top of the pool is weight 90-99 and
       everything the author wrote at 57-67 simply lost. The same runs also
       played out identically from different seeds, since the draw only ever
       broke exact ties and the weights are nearly all distinct. Both are one
       fault: a weighted pool whose top is that steep has a fixed answer.

       Each event gets a lean, deterministic from its id and the seed, added
       to its weight for selection only. The authored weight still governs —
       a 99 still beats a 60 most of the time — but a different seed leans a
       different dozen of the middle of the pool up, so two runs are two runs
       and the tail of the pool is reached across a few of them. Same seed,
       same run: A1.5 holds and the checks stay reproducible.
       C.setup.weightJitter sets the size of the lean, and 0 turns it off. */
    const jit = (C.setup && C.setup.weightJitter) || 0;
    /* KEYED ON POSITION, NOT ON THE ID. The rename-fidelity check renames every
       entity in content and asserts the run is unchanged; a lean hashed from
       the event's id would move a dozen events' order the moment an author
       renamed one. The position in the events list is stable under renaming and
       changes only if content is reordered, which is a real edit. */
    const lean = e => {
      if (!jit) return 0;
      let m = ORD.get(C);
      if (!m) {
        m = new Map(); (C.events || []).forEach((x, i) => m.set(x, i)); ORD.set(C, m);
      }
      let h = 2166136261 ^ (st.seed >>> 0);
      const n = m.get(e) || 0;
      h ^= n; h = Math.imul(h, 16777619);
      return (h >>> 0) % (jit + 1);
    };
    /* AND AN EVENT THAT WAITS GAINS GROUND (design/37 D6). The pool was a
       priority queue: an event outranked on the day it became eligible was
       outranked on every day after, so the cure for the Standby default was
       eligible for 160 sittings across 14 runs and never fired, and the
       Meltdown's gate for 19. `st.waited` counts the sittings an event has
       spent in the pool without being chosen, and each one adds
       `setup.ageWeight` to its weight for selection. It accrues only while
       the event is eligible, so it pulls a starved event forward from when
       it could first have fired rather than toward the end of the run; the
       authored weight still decides who goes first on the day. Firing
       clears it. 0 turns it off. */
    const age = (C.setup && C.setup.ageWeight) || 0;
    const waited = st.waited || {};
    const W = e => (e.weight || 1) + lean(e) + age * (waited[e.id] || 0);
    pool.sort((a, b) => W(b) - W(a) || (a.id < b.id ? -1 : 1));
    /* Ties used to break on id, which meant the same state always played
       the same sitting in the same order. They break on a draw now; the
       id ordering above still decides everything the draw does not, and
       a save with no seed cannot reach here because migrate() gives it
       the default. */
    const top = W(pool[0]);
    const tied = pool.filter(e => W(e) === top);
    const pick = tied.length > 1 ? tied[Math.floor(draw(st) * tied.length)] : pool[0];
    /* What waited this sitting, settled when the sitting ends (advance), so
       asking twice in one sitting counts once. */
    if (age) st.pooled = { sitting: st.sitting, ids: pool.map(e => e.id), chose: pick.id };
    return pick;
  }

  /* PARTNERS WALK OUT, AND COME BACK (design/38 §3). A coalition or
     confidence-and-supply partner whose loyalty falls to
     `thresholds.partnerLeaves` withdraws; one whose loyalty recovers to
     `thresholds.partnerReturns` before the House is dissolved takes its
     place again. When the government no longer commands a majority and no
     motion is pending, the opposition tables one, `thresholds.motionAfter`
     sittings out, so a walkout is a clock the player can see and not the
     end on the spot. `setup.onPartnerWithdraws` names the event content
     wants when it happens; the engine names none. */
  function partnerCheck(st, C) {
    if (st.dissolved || !C || !C.setup) return;
    const T = C.setup.thresholds || {};
    const leaves = T.partnerLeaves, returns = T.partnerReturns;
    const nameOf = id => (C.partyById && C.partyById[id] && C.partyById[id].name) || id;
    st.withdrawn = st.withdrawn || {};
    if (leaves != null) ["coalition", "confidenceSupply"].forEach(side => {
      st[side].slice().forEach(id => {
        if (id === st.playerParty || loyaltyOf(st, id) > leaves) return;
        st[side] = st[side].filter(x => x !== id);
        st.withdrawn[id] = { from: side, at: st.sitting };
        st.log.unshift({ sitting: st.sitting, text: nameOf(id) + " withdraws from the " +
          (side === "coalition" ? "government" : "confidence-and-supply agreement") + "." });
        st.wire.unshift({ sitting: st.sitting, text: String(nameOf(id)).toUpperCase() +
          " WALKS OUT OF THE GOVERNMENT" });
        if (C.setup.onPartnerWithdraws && C.eventById && C.eventById[C.setup.onPartnerWithdraws])
          st.queue.push({ eventId: C.setup.onPartnerWithdraws, dueSitting: st.sitting });
      });
    });
    if (returns != null) Object.keys(st.withdrawn).forEach(id => {
      if (loyaltyOf(st, id) < returns) return;
      const w = st.withdrawn[id];
      if (st[w.from].indexOf(id) < 0) st[w.from].push(id);
      delete st.withdrawn[id];
      st.log.unshift({ sitting: st.sitting, text: nameOf(id) + " returns to the government's side." });
      st.wire.unshift({ sitting: st.sitting, text: String(nameOf(id)).toUpperCase() + " BACK ON THE GOVERNMENT BENCHES" });
    });
    const pending = st.motion && !st.motion.resolved;
    if (!pending && !st.noConfidence && confidence(st) < majority(st))
      EFFECTS.motion(st, C, { after: T.motionAfter == null ? 3 : T.motionAfter,
                              label: "Motion of no confidence" });
  }

  /* The pool's wait, settled once per sitting: everything that was in the
     pool and not chosen has waited one more; the one chosen starts again. */
  function settleWaits(st) {
    const p = st.pooled;
    if (!p || p.sitting !== st.sitting) return;
    const w = st.waited || (st.waited = {});
    p.ids.forEach(id => { if (id !== p.chose) w[id] = (w[id] || 0) + 1; });
    delete w[p.chose];
    st.pooled = null;
  }

  /* ---------------------------------------------------------
     UNDERTAKINGS — settling, and breaking

     A DISCHARGE IS NEVER A BUTTON. The player lays the order on the
     screen that lays orders, and this notices. If a control ever
     appears that marks an undertaking done, the mechanic has been
     misbuilt: the whole point is that a promise is discharged by
     keeping it, in the place where keeping it happens.

     settle() is therefore called from everything that could keep one -
     apply(), and each of the acts - rather than from a draw function,
     which would make it a rendering side effect.
     --------------------------------------------------------- */
  function met(st, C, d) {
    if (!d) return false;
    if (d.flag) return !!st.flags[d.flag];
    if (d.si) { const x = st.instruments[d.si]; return !!(x && x.made); }
    if (d.slot) return (st.slotsGranted || []).indexOf(d.slot) >= 0;
    if (d.bill) {
      const b = st.bills[d.bill];
      if (!b) return false;
      if (!d.stage) return b.stage !== (C.billById[d.bill] || {}).stage;
      return stageRank(b.stage) >= stageRank(d.stage);
    }
    /* a promise to repay is kept when the lender is owed nothing, however
       the debt was paid: in cash on the account, or in kind */
    if (d.repaid) return debtOf(st, d.repaid) <= 0;
    /* `carries`, which is what divide() records. This read `carried`, which
       nothing writes, so a promise discharged by a division carrying could
       never be kept (design/34). */
    if (d.division) {
      const b = st.bills[d.division];
      return !!(b && b.lastDivision && (d.carried == null || b.lastDivision.carries === !!d.carried));
    }
    return false;
  }

  function settle(st, C) {
    if (!st.undertakings || !st.undertakings.length) return [];
    const kept = [];
    st.undertakings.forEach(u => {
      if (u.state !== "open") return;
      if (!met(st, C, u.discharge)) return;
      u.state = "kept";
      kept.push(u);
      st.log.unshift({ sitting: st.sitting, text: "Undertaking kept \u2014 " + u.text });
    });
    return kept;
  }

  function outstanding(st) {
    return (st.undertakings || []).filter(u => u.state === "open");
  }

  /* ---------------------------------------------------------
     A BROKEN PROMISE, AND THE MINISTER WHO ANSWERS FOR IT

     Breaking an undertaking QUEUES AN EVENT and moves no number: the
     politics of a broken promise belongs where it can be written and
     argued with (design/02). When the promise names a cabinet post, the
     minister holding it is the one who answers — the post is vacated
     here, the same {cabinet:{post:null}} the player has, and content
     narrates it. A resignation the player did not choose is the
     strongest available consequence of a broken promise, and this is
     where it comes from (design/08 §3).
     --------------------------------------------------------- */
  function breakUndertaking(st, C, u, why) {
    u.state = "broken";
    st.log.unshift({ sitting: st.sitting, text: "Undertaking broken" +
      (why ? " at " + why : "") + " \u2014 " + u.text });
    const post = u.post && st.cabinet ? st.cabinet[u.post] : null;
    if (post && post.holder) {
      const holder = post.holder;
      post.holder = null;
      st.lastResignation = { post: u.post, holder: holder,
                             undertaking: u.id, sitting: st.sitting };
      st.flags["minister_resigned"] = true;
      const pname = ((C && C.cabinetById && C.cabinetById[u.post]) || {}).name || u.post;
      st.log.unshift({ sitting: st.sitting, text: "The " + pname + " resigns" });
    }
    /* A PROMISE THAT BOUGHT A NAME OFF THE PAPER puts it back when broken
       (winBack). The paper is the engine's own state, so this is the
       engine's to do. */
    if (u.signs && (st.signedBy || []).indexOf(u.signs) < 0) {
      (st.signedBy || (st.signedBy = [])).push(u.signs);
      st.signatures = (st.signatures || 0) + 1;
      const who = ((C && C.characterById) || {})[u.signs];
      st.log.unshift({ sitting: st.sitting, text: "The paper: " +
        (who ? who.name : u.signs) + "'s name goes back on it" });
    }
    if (u.onBreach && C && C.eventById && C.eventById[u.onBreach])
      st.queue.push({ eventId: u.onBreach, dueSitting: st.sitting });
    return u;
  }

  /* ---------------------------------------------------------
     DESCRIBE — what a choice does, read off its own effects

     DERIVED, NEVER WRITTEN. A hand-written description of an effect
     drifts from the effect and then lies to the player. This reads the
     effects themselves, so it cannot.

     DIRECTION AND WHO, NEVER THE NUMBER. 7.6: the player should hold
     the state in their head rather than do sums, and an exact figure
     turns a decision into an optimisation. Magnitude is banded.

     It names no party, station or event - every name is looked up in
     content (15.5).
     --------------------------------------------------------- */
  /* MAGNITUDE WORDS DEPEND ON DIRECTION. One list gave "Pleases the
     Czarnecki group, badly" — the band word was written for "Costs you"
     and is nonsense on a gain. Two lists, and the caller says which. */
  const BAND_DOWN = [[12, "badly"], [6, ""], [0, "a little"]];
  const BAND_UP   = [[12, "a great deal"], [6, ""], [0, "a little"]];
  function band(n) {
    const a = Math.abs(n), list = n >= 0 ? BAND_UP : BAND_DOWN;
    for (const [t, w] of list) if (a >= t) return w;
    return "a little";
  }
  /* A verb pair per scalar, because one template does not fit all seven:
     "Costs you the treasury" is not a sentence anybody would write. */
  const SCALAR_SAY = {
    party_loyalty:   ["Steadies your own benches", "Costs you on your own benches"],
    public_standing: ["Improves how the government is seen", "Damages how the government is seen"],
    consumables:     ["Eases the consumables floor", "Presses on the consumables floor"],
    thermal_margin:  ["Widens the thermal margin", "Narrows the thermal margin"],
    solvency:        ["Adds to your solvency", "Draws on your solvency"],
    legitimacy:      ["The country believes you more", "The country believes you less"],
    friction:        ["Earth's patience grows", "Earth turns against you more"]
  };
  /* The one scalar that is BAD when it rises. describe() reads it so a
     fall in friction is green and a rise is red, which is the world. */
  const SCALAR_INVERTED = { friction: true };

  function describe(st, C, effects) {
    const out = [];
    /* A loyalty target may be a party OR a current inside one, and a
       current rendered as its raw id ("cu_maintenance") is exactly the
       kind of leak this whole function exists to prevent. Look in both. */
    const nameOf = (list, id, key) => {
      const pools = list === "parties" ? ["parties", "currents"] : [list];
      for (const pool of pools) {
        const x = (C[pool] || []).find(y => y.id === id);
        if (x) return x[key] || x.name || id;
      }
      return String(id).replace(/_/g, " ");
    };
    [].concat(effects || []).forEach(eff => Object.keys(eff).forEach(k => {
      const v = eff[k];
      switch (k) {
        /* One verb in, five readings out — the namespace decides which. */
        case "move": Object.keys(v).forEach(key => {
          const dot = key.indexOf("."), d = v[key];
          const ns = dot < 0 ? "scalar" : key.slice(0, dot);
          const id = dot < 0 ? key : key.slice(dot + 1);
          if (ns === "scalar") {
            const inv = !!SCALAR_INVERTED[id];
            const good = inv ? d < 0 : d >= 0;
            const say = SCALAR_SAY[id];
            const stem = say ? say[good ? 0 : 1]
                             : (good ? "Improves " : "Costs you ") + id.replace(/_/g, " ");
            /* THE BAND IS READ IN INDEX TERMS. A denominated scalar's delta
               is in MW-years, and banding forty thousand against a scale
               built for twelve would call every effect "badly". */
            const b = band(d / (MONEY_SCALE[id] || 1));
            out.push({ tone: good ? "good" : "bad",
                       text: stem + (b ? ", " + b : "") });
          } else if (ns === "loyalty") {
            out.push({ tone: d >= 0 ? "good" : "bad",
              text: (d >= 0 ? "Pleases " : "Costs you with ") +
                    nameOf("parties", id, "name") + (band(d) ? ", " + band(d) : "") });
          } else if (ns === "rel") {
            out.push({ tone: d >= 0 ? "good" : "bad",
              text: (d >= 0 ? "Warms " : "Cools ") +
                    (id === "president" ? "the President" : nameOf("characters", id, "name")) });
          } else if (ns === "price") {
            out.push({ tone: d <= 0 ? "good" : "bad",
              text: (d >= 0 ? "Pushes up " : "Brings down ") + id + " prices" });
          } else if (ns === "capital") {
            out.push({ tone: d >= 0 ? "good" : "bad", cost: true,
              text: (d >= 0 ? "Puts " : "Spends credit with ") +
                    nameOf("parties", id, "name") + (d >= 0 ? " in your debt" : "") });
          } else if (ns === "trend") {
            out.push({ tone: d >= 0 ? "good" : "bad",
              text: (d >= 0 ? "Steadies " : "Unsettles ") +
                    id.replace(/_/g, " ") + ", a little, each sitting" });
          }
        });
          break;
        case "scalar": Object.keys(v).forEach(sk => {
          const say = SCALAR_SAY[sk];
          const stem = say ? say[v[sk] >= 0 ? 0 : 1]
                           : (v[sk] >= 0 ? "Improves " : "Costs you ") + sk.replace(/_/g, " ");
          const b = band(v[sk] / (MONEY_SCALE[sk] || 1));
          out.push({ tone: v[sk] >= 0 ? "good" : "bad",
                     text: stem + (b ? ", " + b : "") });
        });
          break;
        case "loyalty": Object.keys(v).forEach(pk => out.push({
          tone: v[pk] >= 0 ? "good" : "bad",
          text: (v[pk] >= 0 ? "Pleases " : "Costs you with ") +
                nameOf("parties", pk, "name") + (band(v[pk]) ? ", " + band(v[pk]) : "") }));
          break;
        case "relationship": Object.keys(v).forEach(ck => out.push({
          tone: v[ck] >= 0 ? "good" : "bad",
          text: (v[ck] >= 0 ? "Warms " : "Cools ") + nameOf("characters", ck, "name") }));
          break;
        case "price": Object.keys(v).forEach(pk => out.push({
          tone: v[pk] <= 0 ? "good" : "bad",
          text: (v[pk] >= 0 ? "Pushes up " : "Brings down ") + pk + " prices" }));
          break;
        case "capital": Object.keys(v).forEach(pk => out.push({
          tone: v[pk] >= 0 ? "good" : "bad", cost: true,
          text: (v[pk] >= 0 ? "Puts " : "Spends credit with ") +
                nameOf("parties", pk, "name") + (v[pk] >= 0 ? " in your debt" : "") }));
          break;
        /* §7.10. WITHOUT THIS THE PLAYER READS THE WORD "economy".
           uxtest asserts that nothing shown to a player describes itself as
           a bare verb name, and it caught this the first time content used
           the verb — the same miss as `motion` before it. A new verb in
           EFFECTS needs three things and not two: the apply case, the
           schema entry, and a line here saying what it did. */
        case "economy": Object.keys(v).forEach(ek => {
          const d = v[ek];
          const say =
            ek === "participation"
              ? (d >= 0 ? "Puts more adults in paid work" : "Puts adults out of paid work")
              : ek === "trade"
              ? (d >= 0 ? "Improves the trade balance" : "Worsens the trade balance")
              : (d >= 0 ? "Moves the economy into private hands"
                        : "Moves the economy into public hands");
          /* `private` is a share of one, so it bands against its own scale
             rather than the index the other two use. */
          const b = band(ek === "private" ? d * 100 : d);
          out.push({ tone: ek === "private" ? "grave" : (d >= 0 ? "good" : "bad"),
                     text: say + (b ? ", " + b : "") });
        });
          break;
        case "law": Object.keys(v).forEach(lk => out.push({
          tone: "grave", text: "Changes the law on " + lk.replace(/_/g, " ") }));
          break;
        case "undertake": [].concat(v).forEach(u => out.push({
          tone: "owed", owed: true, text: u.text || u.id }));
          break;
        case "si": [].concat(v).forEach(id => out.push({
          tone: "grave", text: "Makes " + nameOf("instruments", id, "number") }));
          break;
        case "wire": out.push({ tone: "plain", text: "Puts it on the wire" }); break;
        /* THE PLAYER MUST KNOW WHAT IT COSTS BEFORE SHE AGREES TO IT, and
           a division on the government's own existence is the largest thing
           this vocabulary can say. “grave” is the tone the dissolution uses. */
        case "motion": {
          const n = (v && typeof v === "object") ? v.after : Number(v);
          out.push({ tone: "grave",
            text: "The opposition tables a motion of no confidence" +
                  (n ? ", and the House divides on it in " + n +
                       " sitting" + (n === 1 ? "" : "s") : "") });
          break;
        }
        /* A number that moves and is not described renders as its own
           verb name — "signatures" — which teaches the player the
           engine's vocabulary instead of the world's. */
        case "court": out.push({
          tone: v > 0 ? "good" : "bad",
          text: v > 0 ? "Wins back ground with the partners who walked out"
                      : "Hardens the partners who walked out" });
          break;
        case "signatures": out.push({
          tone: v <= 0 ? "good" : "bad",
          text: (v <= 0 ? "Thins the signatures against you"
                        : "Adds to the signatures against you") });
          break;
        case "slots": out.push({ tone: (v && (v.total > 0 || v.reserve)) ? "good" : "plain",
          text: v && v.refill ? "Refills the order paper"
              : v && v.reserve ? "Gives a measure order-paper time of its own"
                               : "Changes the order paper's time" });
          break;
        case "coalition":
          if (v.remove) out.push({ tone: "grave", text: "Breaks the coalition" });
          if (v.add) out.push({ tone: "good", text: "Widens the coalition" });
          break;
        /* A post filled or left empty. Without this the panel reads "cabinet",
           which is an engine word, not a sentence about a government. */
        case "cabinet": Object.keys(v).forEach(post => {
          const title = nameOf("cabinet", post, "title");
          out.push(v[post] === null
            ? { tone: "grave", text: "Leaves the " + title + " vacant" }
            : { tone: "good", text: "Appoints a " + title });
        });
          break;
        case "election": if (v) out.push({ tone: "grave", text: "Dissolves parliament" }); break;
        case "cross": case "vacate_seat": case "byelection":
          out.push({ tone: "grave", text: "Moves seats in the chamber" }); break;
        case "station": out.push({ tone: "plain", text: "Changes conditions on a habitat" }); break;
        case "bill": Object.keys(v).forEach(bid => {
          const title = nameOf("bills", bid, "title");
          if (v[bid].dead) out.push({ tone: "grave", text: "Kills the " + title });
          else if (v[bid].stage) out.push({ tone: "plain",
            text: "Moves the " + title + " to " + String(v[bid].stage).replace(/_/g, " ") });
          else out.push({ tone: "plain", text: "Changes the " + title });
        });
          break;
        case "queue": case "flag": case "unflag": case "chapter": case "seen":
          break;   /* bookkeeping the player does not need told about */
        default: out.push({ tone: "plain", text: k.replace(/_/g, " ") });
      }
    }));
    return out;
  }

  /* ---------------------------------------------------------
     WHAT ACTUALLY MOVED

     describe() says what a choice INTENDS. This says what happened,
     which is not the same thing: a value can clamp at 0 or 100, a
     loyalty target can not exist, and an effect can be ignored by the
     engine with a line in the log. Showing the intention as though it
     were the outcome would be the same lie a hand-written description
     tells, arrived at from the other side.

     So the outcome is a DIFF of two snapshots taken around the act. */
  function snapshot(st) {
    const snap = { scalars: {}, prices: {}, loyalty: {}, capital: {},
                   signatures: st.signatures || 0,
                   confidence: 0, slots: st.slots.total - st.slots.used,
                   owed: (st.undertakings || []).filter(u => u.state === "open").length };
    Object.keys(st.scalars).forEach(k => snap.scalars[k] = st.scalars[k]);
    Object.keys(st.prices).forEach(k => snap.prices[k] = st.prices[k]);
    Object.keys(st.parties).forEach(k => snap.loyalty[k] = st.parties[k].loyalty);
    Object.keys(st.currents).forEach(k => snap.loyalty[k] = st.currents[k].loyalty);
    Object.keys(st.capital).forEach(k => snap.capital[k] = st.capital[k]);
    return snap;
  }

  function changes(a, b, C) {
    const out = [];
    const nameOf = (list, id) => {
      for (const pool of list) {
        const x = (C[pool] || []).find(y => y.id === id);
        if (x) return x.name || id;
      }
      return String(id).replace(/_/g, " ");
    };
    const push = (label, from, to, goodUp) => {
      if (from === to) return;
      out.push({ label: label, from: from, to: to, delta: to - from,
                 tone: ((to > from) === (goodUp !== false)) ? "good" : "bad" });
    };
    Object.keys(b.scalars).forEach(k =>
      push((SCALAR_SAY[k] ? k.replace(/_/g, " ") : k.replace(/_/g, " ")),
           a.scalars[k], b.scalars[k]));
    Object.keys(b.prices).forEach(k =>
      push(k + " price", a.prices[k], b.prices[k], false));
    Object.keys(b.loyalty).forEach(k =>
      push(nameOf(["parties", "currents"], k), a.loyalty[k], b.loyalty[k]));
    Object.keys(b.capital).forEach(k =>
      push(nameOf(["parties"], k) + " ledger", a.capital[k], b.capital[k]));
    push("signatures against you", a.signatures, b.signatures, false);
    push("order-paper time", a.slots, b.slots);
    push("undertakings outstanding", a.owed, b.owed, false);
    return out;
  }

  /* GRAVE — does this choice deserve a confirmation?
     A confirm on every choice becomes a reflex click within twenty
     minutes and then protects nothing, so the engine decides rather
     than an author remembering. */
  function grave(st, C, choice) {
    if (!choice) return false;
    if (choice.grave) return true;
    if (choice.cost) return true;
    return [].concat(choice.effects || []).some(eff =>
      eff.law || eff.undertake || eff.capital || eff.coalition || eff.election);
  }

  /* Can this choice be taken at all? A choice whose `when` fails or
     whose `cost` cannot be paid is ABSENT, not disabled: a disabled
     control is a thing you are being refused, and this was never on
     the table. */
  function choiceOpen(st, C, choice) {
    if (!choice) return false;
    if (choice.when && !matches(st, choice.when)) return false;
    const c = choice.cost || null;
    if (c && c.slot && (st.slots.total - st.slots.used) < c.slot) return false;
    return true;
  }

  function openChoices(st, C, event) {
    return (event.choices || [])
      .map((c, i) => ({ choice: c, index: i }))
      .filter(x => choiceOpen(st, C, x.choice));
  }

  function choose(st, C, event, choiceIndex) {
    const ch = event.choices[choiceIndex];
    if (!choiceOpen(st, C, ch)) return null;
    if (ch.cost && ch.cost.slot) st.slots.used += ch.cost.slot;
    /* AN EVENT'S OWN EFFECTS: what has happened by the time the player is
       asked anything, whichever answer is given. Content wrote them and
       nothing applied them, so the accounts freeze never recorded itself:
       `f1_frozen` was set by no run, the meltdown could not come and the
       indemnity's two paying branches could not pay (found building the
       tier fall, 23 Sep). They apply once, with the answer. */
    apply(st, C, event.effects);
    apply(st, C, ch.effects);
    /* Answering the House is governing. The idleness drag is for a
       government that does nothing at all — not for one whose bills are
       stuck at a division that will not carry and whose only remaining
       move is the decision in front of it. */
    st.actedThisSitting = true;
    st.seen[event.id] = (st.seen[event.id] || 0) + 1;
    (st.lastFired || (st.lastFired = {}))[event.id] = st.sitting;
    st.log.unshift({ sitting: st.sitting, text: event.title + " — " + ch.label });
    settle(st, C);
    return ch.result || null;
  }

  /* ---------------------------------------------------------
     THE TICK

     Runs once per sitting. Shallow by design — no solver, no
     equilibrium, no spreadsheet. Prices drift toward what the current
     policy settings imply, and stations respond to prices.

     The point is not economic realism. It is that a bill passed in
     sitting four is still visibly doing something in sitting thirty,
     to a place with a name.
     --------------------------------------------------------- */

  /* Move a fifth of the way toward the implied level, so prices lag policy
     rather than snapping to it. Politics happens in the lag. */
  function drift(now, target) { return (target - now) * 0.2; }

  /* =========================================================
     WAYS AND MEANS — where the money comes from.

     The state had no income. `solvency` moved only when a content effect
     moved it: the Commonwealth opened holding 52,000, the appropriation
     spent 48,000 of it, and nothing ever put anything back. A treasury that
     only falls is a health bar, and it made the four scarcity prices
     decorative — the tick READ solvency to set them and nothing ever read
     them, which is why the comment on the volume price says a price nothing
     moves is a price no event can honestly be gated on.

     Bible 7.3 has named the revenue all along: volume, thermal quota,
     substrate-hours and mass-to-orbit. Not income. Those four bases ARE the
     four prices, so the loop closes with no new simulation: the budget sets
     the rates, the rates fund the state, and the prices are what the rates
     are levied on.

     THE CALIBRATION IS ONE SENTENCE. At standard rates on all four bases,
     with every price at its index of 100, the state takes 1,200 a sitting —
     so across a full run of forty sittings it raises 48,000, which is what
     the appropriation's own defaults cost. Standard rates pay for the
     default budget and not a unit more. Cut them and the government runs
     down toward the point where it stops being able to pay and starts, in
     7.9's words, shedding people. Raise them and it accumulates, at a price.

     AND THE PRICE IS PASS-THROUGH, EXCEPT ON VOLUME. A levy on thermal,
     substrate or transit is a levy on the cost of producing the thing, and
     it lands on the people buying it. A levy on volume does not, because
     what it falls on is position inside a habitat, which nobody made and
     nobody can move — unearned in exactly the sense 7.5.2 says it is. So
     volume alone raises money without raising the cost of living. That is
     not a balance decision dressed as fiction; it is the Georgist claim,
     and the Single Tax Party exists in this world to make it. The player
     can find it by reading the table, and the table does not explain it.
     ========================================================= */
  const TAX_BASES = [
    { k: "volume",    weight: 480, passthrough: 0,  name: "Volume" },
    { k: "thermal",   weight: 300, passthrough: 26, name: "Thermal quota" },
    { k: "substrate", weight: 280, passthrough: 24, name: "Substrate-hours" },
    { k: "transit",   weight: 140, passthrough: 20, name: "Mass to orbit" }
  ];
  /* The levels are the clause levels' own words, like every other law value. */
  const RATE_STEP = { none: 0, low: 0.5, standard: 1, high: 1.6 };

  function rateOf(st, k) {
    const v = (st.law || {})["rate_" + k];
    return RATE_STEP[v] == null ? RATE_STEP.standard : RATE_STEP[v];
  }

  /* The whole revenue side, as a table rather than a number, because the
     player is owed the arithmetic and not the answer (7.6). Reads state and
     writes none, so the interface may call it on any draw. */
  function receipts(st) {
    const rows = TAX_BASES.map(b => {
      const factor = rateOf(st, b.k);
      const price = (st.prices || {})[b.k] == null ? 100 : st.prices[b.k];
      return { base: b.k, name: b.name,
               rate: (st.law || {})["rate_" + b.k] || "standard",
               factor: factor, price: price,
               yield: Math.round(factor * (price / 100) * b.weight) };
    });
    return { rows: rows, total: rows.reduce((a, r) => a + r.yield, 0) };
  }

  /* =========================================================
     DEBT, THE RATE, AND WHAT THE UNDERWRITERS THINK.

     WHO LENDS TO THE COMMONWEALTH. Not itself: §7.5.3 makes the currency the
     thermal quota and the treasury the state's holding of it, so there is no
     central bank to print anything — a state that wants more quota than it
     holds has to get it from somebody who has some. That is Earth, and
     `friction` is defined as "Earth's governments and banks against you". So
     the Commonwealth borrows from the people it is quarrelling with, and the
     price of the money is the state of the quarrel.

     THE RATE IS THE QUARREL, then, and it is derived rather than stored:
     four points, plus a point for every ten of friction. A government at
     peace with Earth borrows at four and one at war with it borrows at
     fourteen. Nothing else sets it, which is the point.

     AND IT IS NOT A DEFAULT MECHANIC. §7.6 is explicit: a government that
     runs out does not default, it sheds people. Debt does not add a failure
     state; it moves solvency from later to now and charges for the move.

     THERE IS NO INFLATION SCALAR, and there should not be: §7.9 makes the
     four scarcity prices the cost of existing, and a fifth number claiming
     to summarise them is the .sel mistake. `inflation` below is a READING of
     those four against where they opened — one figure, derived in one place,
     owned by nobody. */
  const BASE_RATE = 4;

  /* NAMED CREDITORS (the author, 23 Sep: "flesh out the economy"). The debt
     was one principal owed to Earth, and the Alliance's emergency facility
     was a sum of money with a promise beside it that nothing in the account
     could see. It is a table keyed by LENDER now, and the lenders are
     content's (`setup.lenders`): who they are, what their money costs -- a
     fixed rate, or a base with steps that apply while a condition holds --
     how far they will go, and whether the rate is paid every sitting or
     folded into the sum owed at the term (`serviced: false`).

     THE LENDERS ARE CONTENT'S AND SO IS THEIR POLITICS (24 Sep). `borrow`
     used to add five friction and take three legitimacy whoever lent,
     because the only lender was Earth; with a lender at home (the
     Underwriters' notes) that would have made borrowing from the
     Commonwealth's own insurers a quarrel with Earth. What a drawing does
     beyond the money is the lender's `onDraw`, in content. The one default
     the engine keeps is the rate and cap of a lender called `earth`, for a
     save or a probe with no terms at all. */
  const EARTH_TERMS = { rate: { base: BASE_RATE, perFriction: 0.1 }, cap: 60000 };
  function lenderOf(C, id) {
    const L = (C && C.setup && C.setup.lenders) || {};
    return L[id] || (id === "earth" ? EARTH_TERMS : { rate: { base: BASE_RATE } });
  }
  function owedTable(st) {
    if (!st.debt) st.debt = { owed: {} };
    if (!st.debt.owed) st.debt.owed = {};
    return st.debt.owed;
  }
  /* THE RATE, derived and never stored. A fixed rate is fixed. Otherwise a
     base, plus so much a point of friction if the lender says so, plus
     every STEP whose condition holds now: a margin grid that ratchets with
     the quarrel, a coupon that steps up as the thermal margin narrows,
     default interest while a covenant is broken. Steps are cumulative, the
     way a real margin grid reads, and each carries the words for it. */
  function rateSteps(st, C, lender) {
    const r = lenderOf(C, lender || "earth").rate || {};
    return (r.steps || []).filter(x => matches(st, x.when));
  }
  function debtRate(st, C, lender) {
    const r = lenderOf(C, lender || "earth").rate || {};
    if (r.fixed != null) return r.fixed;
    const base = (r.base == null ? BASE_RATE : r.base) +
                 Math.round((st.scalars.friction || 0) * (r.perFriction || 0));
    const add = rateSteps(st, C, lender).reduce((n, x) => n + (x.add || 0), 0);
    return Math.round((base + add) * 100) / 100;
  }

  /* What is owed, to one lender or to all of them. */
  function debtOf(st, lender) {
    const o = (st.debt && st.debt.owed) || {};
    if (lender) return o[lender] || 0;
    return Object.keys(o).reduce((n, k) => n + (o[k] || 0), 0);
  }

  /* Every lender the Commonwealth owes, with the terms, for the account. */
  function debts(st, C) {
    const o = (st.debt && st.debt.owed) || {};
    return Object.keys(o).filter(k => o[k] > 0).map(k => {
      const L = lenderOf(C, k);
      return { id: k, name: L.name || k, owed: o[k], rate: debtRate(st, C, k),
               service: L.serviced === false ? 0
                      : Math.round(o[k] * (debtRate(st, C, k) / 100) / 12),
               label: L.label || "", note: L.note || "", short: L.short || L.note || "",
               repayable: L.repayable !== false, home: !!L.home };
    });
  }

  /* What the debt costs every sitting, in the unit everything else is in:
     each lender's principal at that lender's rate, a sitting's share of a
     year. */
  function debtService(st, C) {
    return debts(st, C).reduce((n, d) => n + d.service, 0);
  }

  /* HOW FAR A LENDER WILL GO NOW. The cap is the commitment; a LIMIT is a
     clause that lowers it while its condition holds -- a sanctions clause
     that suspends some lenders' commitments, a drawstop while a covenant is
     broken -- and the lowest limit in force is the one that binds. A limit
     at nought stops new drawing and leaves what is owed where it is. A
     limit that `suspends` a tag takes out the commitments of the parties
     carrying it, so the figure is the syndicate's own sum and is not
     written down twice. */
  function lenderCap(st, C, lender) {
    const L = lenderOf(C, lender);
    let cap = L.cap != null ? L.cap : Infinity, why = "";
    (L.limits || []).forEach(x => {
      const c = x.suspends != null
        ? (L.cap || 0) - (L.parties || [])
            .filter(p => (p.tags || []).indexOf(x.suspends) >= 0)
            .reduce((n, p) => n + (p.commitment || 0), 0)
        : x.cap;
      if (c < cap && matches(st, x.when)) { cap = c; why = x.why || ""; }
    });
    return { cap: cap, why: why };
  }

  function canBorrow(st, C, amount, lender) {
    const id = lender || "earth";
    const n = Math.max(0, Math.round(amount || 0));
    if (!n) return { ok: false, reason: "nothing to borrow" };
    const L = lenderOf(C, id);
    if (L.drawable === false)
      return { ok: false, reason: (L.name || id) + " is not a facility the Commonwealth can draw on" };
    const c = lenderCap(st, C, id);
    if (debtOf(st, id) + n > c.cap)
      return { ok: false, reason: c.why ||
        ((L.name || "Earth's banks") + " will not go past " +
         c.cap.toLocaleString() + " with this government") };
    const slots = L.slots == null ? 1 : L.slots;
    if (slots && st.slots.used + slots > st.slots.total)
      return { ok: false, reason: "no order-paper time left this sitting period" };
    return { ok: true };
  }

  function borrow(st, C, amount, lender) {
    const id = lender || "earth";
    const gate = canBorrow(st, C, amount, id);
    if (!gate.ok) return gate;
    const L = lenderOf(C, id);
    const n = Math.max(0, Math.round(amount));
    owedTable(st)[id] = debtOf(st, id) + n;
    st.scalars.solvency = (st.scalars.solvency || 0) + n;
    st.slots.used += (L.slots == null ? 1 : L.slots);
    st.actedThisSitting = true;
    /* WHAT A DRAWING DOES BEYOND THE MONEY is the lender's own: Earth's
       governments read a drawing on Earth's banks as a political act, and
       the Underwriters read a placement as business. */
    const rate = debtRate(st, C, id);
    if (L.onDraw) apply(st, C, L.onDraw);
    /* a rate is printed to two places, the way a lender quotes one */
    const pc = rate.toFixed(2);
    const fill = t => String(t).replace(/\{n\}/g, n.toLocaleString()).replace(/\{rate\}/g, pc);
    st.log.unshift({ sitting: st.sitting, text: L.log ? fill(L.log)
      : "Borrowed " + n.toLocaleString() + " MW-years from " + (L.name || id) +
        ", at " + pc + " per cent." });
    st.wire = st.wire || [];
    st.wire.unshift({ sitting: st.sitting, text: L.wire ? fill(L.wire)
      : "COMMONWEALTH BORROWS " + n.toLocaleString() + " FROM " +
        String(L.name || id).toUpperCase() + " AT " + pc + " PER CENT" });
    return { ok: true, borrowed: n, rate: rate };
  }

  /* EVERY FACILITY THE COMMONWEALTH CAN DRAW ON, owed or not, for the
     account: what is drawn, what the lender will go to now and why, the
     rate and the steps in it, and the size of one drawing. A lender that is
     not drawable (the Alliance's facility, which its own terms settle) is in
     `debts` and not here. */
  function facilities(st, C) {
    const L = (C && C.setup && C.setup.lenders) || {};
    return Object.keys(L).filter(k => L[k].drawable).map(k => {
      const c = lenderCap(st, C, k);
      const size = L[k].utilisation || 1000;
      const gate = canBorrow(st, C, size, k);
      return { id: k, name: L[k].name || k, facility: L[k].facility || "",
               owed: debtOf(st, k), cap: c.cap, commitment: L[k].cap,
               limit: c.why, rate: debtRate(st, C, k),
               steps: rateSteps(st, C, k).map(x => ({ label: x.label || "", add: x.add || 0 })),
               base: ((L[k].rate || {}).fixed != null ? L[k].rate.fixed
                     : ((L[k].rate || {}).base == null ? BASE_RATE : L[k].rate.base)),
               utilisation: size, ok: gate.ok, reason: gate.reason || "",
               slots: L[k].slots == null ? 1 : L[k].slots,
               home: !!L[k].home, note: L[k].note || "", drawNote: L[k].drawNote || "" };
    });
  }

  function repay(st, C, amount, lender) {
    const id = lender || "earth";
    const p = debtOf(st, id);
    const L = lenderOf(C, id);
    if (!p) return { ok: false, reason: "the Commonwealth owes " + (L.name || id) + " nothing" };
    const n = Math.min(p, Math.max(0, Math.round(amount || 0)),
                       st.scalars.solvency || 0);
    if (!n) return { ok: false, reason: "nothing it can pay" };
    if (L.repayable === false)
      return { ok: false, reason: (L.name || id) + " is repaid on its own terms" };
    owedTable(st)[id] = p - n;
    st.scalars.solvency -= n;
    /* The credit is for being clear of the lender, not for each payment, or
       a debt paid a unit at a time would buy legitimacy by the unit. */
    if (p - n <= 0)
      st.scalars.legitimacy = clamp((st.scalars.legitimacy || 0) + 2, 0, 100);
    st.log.unshift({ sitting: st.sitting,
      text: "Repaid " + n.toLocaleString() + " MW-years to " + (L.name || id) + "." });
    settle(st, C);
    return { ok: true, repaid: n };
  }

  /* THE FOUR PRICES, AS ONE READING. Against where each opened, weighted
     evenly because the goods are not substitutes: a household pays all four. */
  function inflation(st) {
    const keys = Object.keys(st.prices || {});
    if (!keys.length) return 0;
    let sum = 0, n = 0;
    keys.forEach(k => {
      const hist = (st.priceHistory || {})[k] || [];
      const base = hist.length ? hist[0] : 100;
      if (!base) return;
      sum += (st.prices[k] - base) / base; n++;
    });
    return n ? Math.round(sum / n * 1000) / 10 : 0;   /* a percentage, one decimal */
  }

  /* =========================================================
     WHAT THE UNDERWRITERS THINK.

     §7.5.2: underwriting rather than banking is the dominant institution,
     "which is why the Underwriters are the only party with accurate numbers
     on everything". They are the nearest thing this world has to a central
     bank, and what they sell is not money but an honest reading.

     THE ENGINE FINDS THE FACTS AND CONTENT SAYS THEM. This returns KEYS,
     not sentences: `CONTENT.setup.outlook[key].text` is the prose, so every
     word of the advice is in the prose file and the author can rewrite it
     without touching the engine. An engine that phrased its own advice
     would be the one place in the game where prose was unreachable.

     Nothing here is new state. Every finding is a reading of what the
     player can already see, which is the point: advice is not information
     the player lacks, it is the arithmetic done for them. */
  function outlook(st, C) {
    const keys = [];
    const solv = st.scalars.solvency || 0;
    const rec = receipts(st).total;
    const svc = debtService(st, C);
    const net = rec - svc;
    const debt = debtOf(st);
    const infl = inflation(st);

    /* the reserve, against what it is spending */
    if (solv <= 0) keys.push("reserve_gone");
    else if (net < 0 && solv / Math.max(1, -net) < 12) keys.push("reserve_thin");
    else if (solv > 80000) keys.push("reserve_deep");

    /* the flow */
    if (net < 0) keys.push("receipts_short");
    else if (rec > 0 && net > 0) keys.push("receipts_cover");

    /* the debt and its price. What is owed at home (a lender marked
       `home`) is read apart from what is owed off-world, because the rate
       readings are about the quarrel and a domestic lender is not in it. */
    if (!debt) keys.push("debt_none");
    else if (debt > 30000) keys.push("debt_heavy");
    else keys.push("debt_light");
    const all = debts(st, C), away = all.filter(d => !d.home);
    if (away.length) keys.push(Math.max(...away.map(d => d.rate)) >= 10 ? "rate_dear" : "rate_cheap");
    /* and one reading per lender owed, where content has something to say
       about that lender in particular (`owed_<id>`) */
    all.forEach(d => keys.push("owed_" + d.id));

    /* the cost of existing */
    if (infl <= -5) keys.push("prices_falling");
    else if (infl < 5) keys.push("prices_steady");
    else if (infl < 20) keys.push("prices_rising");
    else keys.push("prices_spiking");

    /* the one rate nobody has set, which is the Georgist point */
    if ((st.law || {}).rate_volume === "none" || (st.law || {}).rate_volume === "low")
      keys.push("volume_forgone");

    return keys.filter(k => ((C.setup || {}).outlook || {})[k])
               .map(k => ({ key: k, text: C.setup.outlook[k].text }));
  }

  function tick(st, C) {
    const P = st.prices, marks = [];

    /* thermal: scarce when the federal margin is thin, AND SET BY THE
       APPROPRIATION. The quota the vote releases is the price's other
       input, which §7.9 has said all along and the tick did not read:
       the four prices are legislative outputs, and the appropriation is
       the legislation (design/13 §2.3, design/28 §4). */
    const rel = st.law.thermal_release;
    const relBump = rel === "tight" ? 14 : rel === "open" ? -16 : 0;
    const pressure = (35 - st.scalars.thermal_margin) * 1.2;
    /* the levy, passed through to whoever buys the thing. Nought at the
       standard rate, so the calibration of everything above is unmoved. */
    const taxT = (rateOf(st, "thermal") - 1) * 26;
    /* THE CIVIC CLOCK (bible 6.3): a minimum clock rate for every
       enfranchised mind, publicly subsidised. Every watt of computation
       becomes heat, so the rate is thermal pressure as well as a cost,
       and both scale with the minimum the law sets (0 none, 1 real time).
       The coefficients are content's (setup.civicClock). */
    const clock = +((st.law || {}).civic_clock_minimum) || 0;
    const clockC = (C.setup && C.setup.civicClock) || {};
    const heatT = clock * (clockC.heat || 0);
    P.thermal = clamp(P.thermal + drift(P.thermal, 100 + pressure + relBump + taxT + heatT), 20, 400);

    /* substrate: cheaper the more of it is publicly held, dearer as thermal rises */
    const pub = st.law.substrate_public_share == null ? 0.35 : st.law.substrate_public_share;
    P.substrate = clamp(P.substrate + drift(P.substrate,
      70 + (1 - pub) * 60 + (P.thermal - 100) * 0.4 +
      (rateOf(st, "substrate") - 1) * 24), 20, 400);

    /* volume: pressurised cubic metres, capped by the construction
       schedule, which is bought out of the treasury.

       CONTINUOUS, NOT A SWITCH. This was `solvency < 40 ? 14 : -4`, so
       the volume price had exactly two target states and a treasury
       moving from 80 to 41 changed nothing at all. Under 7.9's design
       rule a price nothing meaningfully moves is a price no event can
       honestly be gated on, which is most of why nothing is.

       The real driver is the budget (7.5.2: "a market in
       permission-to-exist-at-scale whose price is set by an
       money vote"), and that waits on the canon decision in
       design/13. This is the honest interim: continuous in the one
       input it actually has. */
    const cw = st.law.capital_works;
    const volBump = cw === "ring" ? -9 : cw === "outer" ? -5 : 0;
    /* The price targets are index arithmetic; solvency is now the quota in
       MW-years, so it is read back through its scale here. The proportion
       is unchanged, which is the whole point of the denomination. */
    const solv = st.scalars.solvency / (MONEY_SCALE.solvency || 1);
    /* AND NO TAX TERM. The other three carry one; volume does not, because
       a levy on position inside a habitat has nowhere to be passed on to.
       See the Ways and Means note above — this blank line is the mechanic. */
    P.volume = clamp(P.volume + drift(P.volume,
      100 + (50 - solv) * 0.28 + volBump), 20, 400);

    /* transit: launch windows and delta-v, and the subsidy the budget
       carries for the stations the traffic does not reach */
    const ts = st.law.transit_subsidy;
    const trBump = ts === "anchors" ? -8 : ts === "all" ? -14 : 0;
    P.transit = clamp(P.transit + drift(P.transit,
      100 - (solv - 50) * 0.3 + trBump + (rateOf(st, "transit") - 1) * 20), 20, 400);

    Object.keys(P).forEach(k => {
      P[k] = Math.round(P[k] * 10) / 10;
      const h = st.priceHistory[k] || (st.priceHistory[k] = []);
      h.push(P[k]); if (h.length > 60) h.shift();
    });

    /* THE PRODUCTIVE ECONOMY DRIFTS OFF THE PRICES AND THE LAW (§7.10).

       Participation rises when fork-labour is dear and building is cheap. A
       low divergence threshold turns invisible instance-hours into counted
       jobs — roughly 380,000 of them — which is the largest single
       intervention in this labour market anyone has contemplated, and
       nobody in the chamber discusses it in those terms (textbook ch. 5).

       Trade answers to transit costs, to the substrate price (compute is
       the export everyone else wants), and to how closurist the settlement
       is. Autarky is resilient and poor.

       `closure_target` is not a law key yet — the federal settlement that
       would create one is a bill nobody has written — so the term reads
       zero until it exists rather than being left out and forgotten. */
    const E = st.economy;
    if (E) {
      const forkRatio = (st.law.divergence_threshold_hours || 168) / 168;
      const buildCost = (P.volume + P.transit) / 200;
      E.participation = clamp(E.participation + drift(E.participation,
        39 + (1 - forkRatio) * 12 - (buildCost - 1) * 15), 18, 62);

      const closurism = st.law.closure_target ? st.law.closure_target * 24 : 0;
      E.trade = clamp(E.trade + drift(E.trade,
        100 + (100 - P.transit) * 0.4 + (100 - P.substrate) * 0.35 - closurism), 40, 190);

      E.participation = Math.round(E.participation * 10) / 10;
      E.trade = Math.round(E.trade * 10) / 10;
      st.economyHistory = st.economyHistory ||
        { participation: [], trade: [] };
      ["participation", "trade"].forEach(k => {
        const h = st.economyHistory[k] || (st.economyHistory[k] = []);
        h.push(E[k]); if (h.length > 60) h.shift();   /* same window as prices */
      });
    }

    /* CONSUMABLES IS CLOSURE, NATIONALLY. §7.2 makes the closure ratio the
       sovereignty number — the fraction of a habitat's material cycle it
       can run without imports — and consumables is its federal
       counterpart: what the union has to send to the stations that cannot
       feed themselves. They were two numbers and neither read the other,
       which is why consumables was moved by nothing and gated nothing.

       It TRACKS rather than equals. The authored opening is 71 and the
       population-weighted closure is 0.609, so equating them would
       silently rewrite the opening state; what is derived is the
       MOVEMENT. Raise a poor station's closure and the federation has
       less to carry. Which is §7.2's dilemma stated as arithmetic: the
       same act that eases the consumables floor funds that station's
       future secession. */
    (function () {
      let pop = 0, w = 0;
      C.stations.forEach(s0 => {
        const s = st.stations[s0.id]; if (!s) return;
        const p = s.population || 0; pop += p; w += p * (s.closure || 0);
      });
      if (!pop) return;
      const now = w / pop;
      if (st.closureIndex == null) { st.closureIndex = now; return; }
      const drift = Math.round((now - st.closureIndex) * 260);
      if (drift) {
        st.scalars.consumables = clamp(st.scalars.consumables + drift, 0, 100);
        st.closureIndex = now;
        marks.push(drift > 0
          ? "The consumables floor eases as closure improves"
          : "The consumables floor presses as closure falls");
      }
    })();

    /* AND THE STATE TAKES ITS REVENUE, on the prices this sitting has just
       set rather than last sitting's. This is the only place in the engine
       that ADDS to solvency: everything else that touches it is a content
       effect spending it. See the Ways and Means note above tick(). */
    (function () {
      const r = receipts(st);
      /* AND THE DEBT IS SERVICED OUT OF THE SAME PURSE, before anything else
         is done with it. A government that has borrowed is paying Earth
         every sitting whether it thinks about it or not. */
      const owed = debtService(st, C);
      const net = r.total - owed;
      if (net) st.scalars.solvency = Math.max(0, (st.scalars.solvency || 0) + net);
    })();

    /* THE RESERVE KEEPS A CURVE, the way the four prices already do. It is
       the one figure on the economy tab whose history nothing recorded, so
       the chart had a single bar for the number everything else is measured
       against. Sixty sittings, same window as priceHistory. */
    (function () {
      const h = st.solvencyHistory || (st.solvencyHistory = []);
      h.push(st.scalars.solvency || 0);
      if (h.length > 60) h.shift();
    })();

    /* TRENDS APPLY AFTER THE MARKETS MOVE, so the same sitting shows both
       what the world did and what the government's earlier decisions are
       now leaning on, a little at a time. */
    Object.keys(st.trends || {}).forEach(k => {
      const d = st.trends[k];
      if (!d) return;
      bumpScalar(st, C, k, d);
    });

    /* AND A PRESSURE NOBODY KEEPS UP ABATES.

       A trend applied every sitting for ever is not a lean, it is a doom
       clock. Measured on the annexation line: `f1_dilemma` sets
       {trend.friction:+3}, nothing ever takes it off, and twenty sittings
       later the run ends at friction 100 and solvency 0 — a player who does
       the central thing the campaign asks of them ends up governing a House
       that is arithmetically impossible.

       And it is structural rather than one bad number. Content sets four
       positive friction trends (+3 +3 +2 +1) against exactly one -1, and
       `trend.legitimacy` has two negatives and no positive anywhere: the
       vocabulary only pushes. Trends also ACCUMULATE, so two such choices
       stack toward TREND_MAX and arrive faster.

       So a trend steps one unit toward zero every `trendDecay` sittings —
       content's number, four by default. A +3 lean then delivers about
       twenty-four points over twelve sittings and stops, which is a
       pressure the government has to answer rather than a countdown it
       cannot. An author who wants a permanent lean re-asserts it, which is
       the same thing politics asks of anybody who wants one.

       Deterministic, because §1.5 is: it steps on the sittings that divide,
       not on a roll. A denominated scalar steps in its own unit, so
       solvency abates by a thousand MW-years and not by one. */
    const decayEvery = (C.setup && C.setup.trendDecay) || 4;
    if (decayEvery > 0 && st.sitting % decayEvery === 0) {
      Object.keys(st.trends || {}).forEach(k => {
        const d = st.trends[k];
        if (!d) return;
        const step = MONEY_SCALE[k] || 1;
        st.trends[k] = Math.abs(d) <= step ? 0 : d - Math.sign(d) * step;
      });
    }

    /* A METER THAT DRAGS ANOTHER (Flash I). Content declares the couplings
       in setup: while the source meter is above a line, its drag lands
       every sitting until somebody does something about it. The highest
       line that matches is the one applied — worse is worse, not
       worse-squared — and the wire says so once, when it starts. */
    /* PER GROUP, AND WITH A CONDITION (mutual vulnerability, 24 Sep). The
       highest matching line applies within its `group`, which defaults to
       the meter, so every coupling written before this behaves as it did.
       A second group lets a different consequence of the same meter run
       beside the first: Earth's own losses from a blockade are not a worse
       line of the blockade, they are another party's cost. `when` is the
       ordinary condition block, so a line can depend on more than one meter
       (a blockade costs Earth only while Earth is still buying). */
    const top = {};
    (C.setup.couplings || [])
      .filter(cp => (st.scalars[cp.meter] || 0) > cp.above && (!cp.when || matches(st, cp.when)))
      .forEach(cp => {
        const g = cp.group || cp.meter;
        if (!top[g] || (cp.above || 0) > (top[g].above || 0)) top[g] = cp;
      });
    Object.keys(top).forEach(g => {
      const cp = top[g];
      Object.keys(cp.drag || {}).forEach(k => bumpScalar(st, C, k, cp.drag[k]));
      const key = "coupling_" + (cp.group ? cp.group + "_" : "") + cp.meter + "_" + cp.above;
      if (cp.mark && !st.flags[key]) { st.flags[key] = true; marks.push(cp.mark); }
    });

    /* and the reserve pays the subsidy, every sitting the law stands */
    if (clock > 0 && clockC.costPerSitting)
      bumpScalar(st, C, "solvency", -Math.round(clock * clockC.costPerSitting));

    /* Stations answer to the substrate price. A habitat that cannot pay does
       not economise — it sheds people, and the shed order says which. */
    const strain = (P.substrate - 100) / 100;
    /* WHETHER A SUSPENDED PERSON'S DEBT ACCRUES (bible 6.6): "the debt
       question decides how bad it is". Accruing is the status quo and the
       calibration below. Paused, a restoration owes only what it owed going
       cold, so people come back faster -- and going cold becomes a way to
       wait out a bad quarter, so a few more go. Content's numbers. */
    const paused = (st.law || {}).suspension_debt_accrual === false;
    const susp = (C.setup && C.setup.suspension) || {};
    if (Math.abs(strain) > 0.06) {
      C.stations.forEach(s0 => {
        const s = st.stations[s0.id];
        /* And a federation with no consumables margin cannot cushion the
           stations that depend on it, so the same price strain bites
           harder. consumables gated nothing before this; now it decides
           how much the exposed actually feel. */
        const cushion = 0.6 + (st.scalars.consumables / 100) * 0.7;
        const exposure = Math.max(0, 0.75 - s.closure) / cushion;
        let delta = Math.round(strain * exposure * s.population * 0.0012);
        if (paused) delta = Math.round(delta * (delta < 0 ? (susp.pausedRestore || 1)
                                                          : (susp.pausedShed || 1)));
        if (!delta) return;
        const before = s.suspended;
        s.suspended = Math.max(0, s.suspended + delta);
        if (delta > 0 && before < 10000 && s.suspended >= 10000)
          marks.push(s.name + " passes ten thousand suspended");
        if (delta < 0 && before >= 10000 && s.suspended < 10000)
          marks.push(s.name + " falls below ten thousand suspended");
      });
    }
    /* THE BALLOT. Signatures against the Prime Minister reaching the threshold
       force the caucus to divide. Held once; a carried ballot clears the names,
       a lost one is the end and checkLoss says so. */
    const ballotAt = (C.setup.thresholds && C.setup.thresholds.ballot) || 12;
    if (!st.ballot && (st.signatures || 0) >= ballotAt) {
      st.ballot = ballot(st, C);
      marks.push("LEADERSHIP BALLOT: " + st.ballot.for + " for, " +
        st.ballot.against + " against, " + st.ballot.need + " needed");
      st.log.unshift({ sitting: st.sitting, text: "Leadership ballot: " +
        st.ballot.for + " for, " + st.ballot.against + " against, " +
        st.ballot.need + " needed \u2014 " +
        (st.ballot.carries ? "the Prime Minister holds" : "the Prime Minister loses") });
      if (st.ballot.carries) st.signatures = 0;
    }
    return marks;
  }

  /* ---------------------------------------------------------
     PROROGATION — the House rises

     THE ONE THING THAT MAKES THE ORDER PAPER A SCHEDULE. Until this
     existed, order-paper time was a lifetime allowance, nothing was ever
     due, and a bill could sit at committee forever at no cost. 7.7 calls
     time "the currency that cannot be topped up"; this is the period it
     cannot be topped up within.

     BILLS DIE AND INSTRUMENTS SURVIVE. That asymmetry is already the
     argument the Papers screen makes — a bill needs a majority and
     cannot be undone, an order needs no majority and can be revoked —
     and prorogation sharpens it into a reason to reach for the fast,
     deniable tool.

     IT IS NOT A TURN LIMIT. Nothing is lost that cannot be brought back
     next session, poorer. The boundary is a cost, not a fail state.
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     THE CALENDAR.

     st.date was set once at newGame from setup.startDate and never
     touched again — thirty sittings later the topbar still read
     2287-04-11. The clock on the wall was stopped, which is most of
     why time in this game has never felt real.

     A sitting is a DAY, and the House does not sit every day. Given a
     start date and the days of the week it sits, the date of sitting N
     is a pure function of N: no state, nothing to desynchronise, and
     the same answer for a deadline three months out as for today.
     That is what lets a division "on the fourteenth" be a square the
     player can point at rather than a number in a sentence.
     --------------------------------------------------------- */
  const DAY = 86400000;
  const iso = d => d.toISOString().slice(0, 10);
  const parseDay = s => { const [y, m, d] = String(s).split("-").map(Number);
                          return new Date(Date.UTC(y, (m || 1) - 1, d || 1)); };

  function sittingDays(C) {
    const d = C && C.setup && C.setup.sittingDays;
    return (Array.isArray(d) && d.length) ? d : [1, 2, 3, 4];
  }
  /* THE RECESS TAKES DAYS (design/37 D11). The House rose on a Wednesday
     and sat again on the Thursday, so a recess was a line in the log with
     no time in it. `setup.recessDays` calendar days now pass after every
     sitting period but the parliament's last (after that comes the
     dissolution, and the campaign's days are its own). Sittings are still
     counted one by one; only the dates move. 0 restores the old calendar. */
  function recessBreaks(C) {
    const s = (C && C.setup) || {};
    const days = s.recessDays || 0;
    if (!days) return { days: 0, every: Infinity, times: 0 };
    const every = s.sittingsPerPeriod || 24;
    const periods = (s.periodsPerSession || 1) * (s.sessionsPerParliament || 1);
    return { days: days, every: every, times: Math.max(0, periods - 1) };
  }
  /* Walk the calendar from the start date, one sitting day at a time,
     jumping the recess after each period. `visit(date, n)` is called for
     every sitting; returning true stops the walk. `gap(from, to)` is
     called for every recess with its first and last day. */
  function walkSittings(C, visit, gap) {
    const days = sittingDays(C), R = recessBreaks(C);
    let d = parseDay((C && C.setup && C.setup.startDate) || "2287-01-01");
    let count = 0;
    for (let guard = 0; guard < 20000; guard++) {
      if (days.indexOf(d.getUTCDay()) >= 0) {
        count++;
        if (visit(d, count)) return;
        if (count % R.every === 0 && count / R.every <= R.times) {
          const from = new Date(d.getTime() + DAY);
          d = new Date(d.getTime() + R.days * DAY);
          if (gap && gap(from, d)) return;
        }
      }
      d = new Date(d.getTime() + DAY);
    }
  }
  /* The date the House sits for the nth time, counting the start date as
     sitting 1 if it is itself a sitting day. */
  function dateOfSitting(C, n) {
    let out = null;
    walkSittings(C, (d, count) => { if (count >= n) { out = iso(d); return true; } });
    return out;
  }
  /* The inverse, for putting a date back on the order paper. A day in a
     recess is not a sitting. */
  function sittingOfDate(C, date) {
    const t = parseDay(date).getTime();
    let out = null;
    walkSittings(C, (d, count) => {
      if (d.getTime() === t) { out = count; return true; }
      return d.getTime() > t;
    }, (from, to) => from.getTime() <= t && t <= to.getTime());
    return out;
  }
  /* Whether a date falls in a recess, for the calendar's card. */
  function inRecess(C, date) {
    const t = parseDay(date).getTime();
    let hit = false;
    walkSittings(C, d => d.getTime() > t,
      (from, to) => { if (from.getTime() <= t && t <= to.getTime()) { hit = true; return true; }
                      return from.getTime() > t; });
    return hit;
  }

  /* ---------------------------------------------------------
     WHAT IS COMING, AND WHEN.

     Everything with a date on it, in one list, so the calendar and the
     order paper read the SAME source. A deadline that appears on one
     and not the other is how a player learns not to trust either.
     --------------------------------------------------------- */
  /* WHERE A PROMISE IS KEPT, and how, from its own discharge spec. One
     place computes it, so the calendar, the undertakings panel and the
     order that keeps it can never say different things. `focus` is the
     THING to open once the tab is up — an order to sign, a bill to carry —
     so a row can take the player to the instrument and not merely to the
     screen it lives on. */
  function undertakingWhere(C, u) {
    let tab = "gov", how = "By taking the decision that discharges it", focus = null;
    const dz = (u && u.discharge) || {};
    if (dz.si && C.instrumentById && C.instrumentById[dz.si]) {
      const si = C.instrumentById[dz.si];
      tab = "gov";
      /* THE NUMBER, NOT THE YEAR. Every order in the ladder is titled
         "... Order <year>", so the year names nothing; the SI number is what
         the papers table, the search and the order itself are indexed by,
         and it is the only part of the title that is different. */
      how = "Make " + (si.number ? si.number + " \u2014 " : "") +
            (si.title || dz.si).replace(/ Order \d{4}$/, "");
      focus = "si:" + dz.si;
    } else if (dz.repaid) {
      tab = "econ";
      how = "Repay " + (lenderOf(C, dz.repaid).name || dz.repaid);
      focus = null;
    } else if ((dz.bill || dz.division) && C.billById && C.billById[dz.bill || dz.division]) {
      const id = dz.bill || dz.division;
      tab = "cham";
      how = "Carry the " + (C.billById[id].title || id);
      focus = "bill:" + id;
    }
    return { tab: tab, how: how, focus: focus };
  }

  function deadlines(st, C) {
    const out = [];
    const add = (sitting, kind, text, extra) => {
      if (sitting == null) return;
      out.push(Object.assign({ sitting: sitting, date: dateOfSitting(C, sitting),
                               kind: kind, text: text, away: sitting - st.sitting },
                             extra || {}));
    };
    /* EVERY DEADLINE KNOWS WHERE IT IS KEPT. `undertakingWhere` worked this
       out for one kind of mark and the docket used it; the calendar showed
       all five kinds and could act on none of them, so the one screen that
       says WHEN was the one screen with no HOW. A mark that names a place
       carries {tab, how, focus} and the interface can send the player to it.
       A mark with nowhere to go — the rise, a thing merely expected — carries
       nothing, and is a statement rather than an instruction. */
    /* THE MOTION, FIRST, because nothing else on this list can end the
       government on a date it already knows. */
    if (st.motion && !st.motion.resolved)
      add(st.motion.on, "division", st.motion.label,
          { tab: "cham", how: "The House divides on confidence" });

    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id];
      if (bs && bs.dividesOn != null && !bs.dead)
        add(bs.dividesOn, "division", b.title + " divides",
            { tab: "cham", how: "Whip and divide on " + b.title,
              focus: "bill:" + b.id });
    });
    /* SUPPLY, ON THE CALENDAR FROM THE FIRST SITTING. Losing supply is the
       only loss a player can see coming for a whole session, and that is
       what makes it fair rather than punitive — so it is dated the day the
       House rises and sits there from the opening, not raised as a warning
       once it is too late to act. */
    if (!supplyCarried(st, C) && st.risesAt != null) {
      const sup = (C.bills || []).find(b => b.test === "supply" &&
        !((st.bills[b.id] || {}).dead));
      /* Its own kind, not "owed": an undertaking is a promise the player
         made and this is a requirement they did not choose. Two tests
         filter the calendar for owed and expect exactly the promises the
         player entered into, and they were right to. */
      if (sup) add(st.risesAt, "supply", sup.title + " must carry",
                   { tab: "cham", how: "Carry the " + sup.title,
                     focus: "bill:" + sup.id });
    }
    /* An undertaking counts down in `by`, and an explicit null means
       "before the House rises" — so that one lands on the last sitting
       of the session, which is where the author meant it. */
    (st.undertakings || []).forEach(u => {
      if (u.state !== "open") return;
      /* Where it is kept, and how: one helper, so the calendar, the
         undertakings panel and the order itself agree. */
      add(u.by == null ? sessionEndsAt(st, C) : u.by, "owed", u.text,
          undertakingWhere(C, u));
    });
    /* A PRAYER WINDOW IS A DEADLINE. An order stands unless the House
       prays against it before the window closes, and until now that date
       existed in the state and nowhere the player could see it. */
    (C.instruments || []).forEach(si => {
      const s0 = st.instruments[si.id];
      if (s0 && s0.inForce && !s0.revoked && s0.prayerCloses != null)
        add(s0.prayerCloses, "prayer", "Last day to pray against " + (si.number || si.id),
            { tab: "gov", how: "Pray against " + (si.number || si.id),
              focus: "si:" + si.id });
    });
    /* SOMETHING THE PLAYER SET IN MOTION IS COMING BACK. Content decides
       whether it is foreseeable: an event with a `foreseen` label appears
       on the calendar under that label, one without it does not appear at
       all. An ambush must stay an ambush, and the engine cannot know
       which is which. */
    (st.queue || []).forEach(q => {
      /* A labelled entry is a thing the government KNOWS is coming — a
         verdict reserved, a commission reporting, a dispatch due back.
         An unlabelled one is not on anybody's calendar. */
      if (q.label) { add(q.dueSitting, "expected", q.label); return; }
      const e = C.eventById && C.eventById[q.eventId];
      if (e && e.foreseen) add(q.dueSitting, "expected", e.foreseen);
    });
    /* A DATED EVENT IS ON THE CALENDAR, if content says it is foreseeable.
       Same rule as the queue above: `foreseen` is the label, and an event
       without one is an ambush and stays off the calendar. A date the player
       cannot see is just an unexplained interruption. */
    (C.events || []).forEach(e => {
      if (e.at == null || !e.foreseen) return;
      if (st.seen[e.id]) return;
      if (e.chapter != null && e.chapter !== st.chapter) return;
      if (e.at < st.sitting) return;
      add(e.at, "expected", e.foreseen);
    });
    if (st.risesAt != null)
      add(st.risesAt, "rises", !lastPeriod(st, C) ? "The House rises for the recess"
        : lastSession(st, C) ? "The House rises and is dissolved"
        : "The House rises \u2014 session " + st.session + " ends");
    return out.sort((a, b) => a.sitting - b.sitting ||
                              a.kind.localeCompare(b.kind));
  }

  /* One month of days for the calendar, each carrying whatever falls on
     it. `offset` is months from the one the current sitting is in. */
  function calendar(st, C, offset) {
    const here = parseDay(st.date || dateOfSitting(C, st.sitting));
    const first = new Date(Date.UTC(here.getUTCFullYear(),
                                    here.getUTCMonth() + (offset || 0), 1));
    const days = sittingDays(C), marks = deadlines(st, C);
    const out = [];
    for (let d = new Date(first); d.getUTCMonth() === first.getUTCMonth();
         d = new Date(d.getTime() + DAY)) {
      const day = iso(d), sits = days.indexOf(d.getUTCDay()) >= 0;
      const n = sits ? sittingOfDate(C, day) : null;
      out.push({
        date: day, dom: d.getUTCDate(), dow: d.getUTCDay(),
        sitting: n, sits: sits, recess: sits && n == null && inRecess(C, day),
        past: n != null && n < st.sitting,
        today: n != null && n === st.sitting,
        marks: marks.filter(m => m.date === day)
      });
    }
    return { year: first.getUTCFullYear(), month: first.getUTCMonth(),
             label: first.toLocaleString("en-GB", { month: "long", timeZone: "UTC" }) +
                    " " + first.getUTCFullYear(),
             days: out };
  }

  /* ---------------------------------------------------------
     WHAT IS ASKED OF YOU TODAY.

     The sitting screen could tell the player what was AVAILABLE — six
     bills can advance, five orders can be made — and that is true on
     day one and true on day forty, so it is not business, it is a
     menu. A day only has a shape if something is asked of it.

     So this reports OBLIGATIONS, not opportunities: the decision the
     House has brought, anything dated today or overdue, anything
     closing soon enough to matter, and a ministry sitting empty.
     Every one of them CLEARS when it is dealt with, which is the whole
     property an indicator needs — a mark that never goes out teaches
     the player to stop looking at it.

     `tab` names where the thing is done, so the interface can point
     rather than describe. The order of the list is the order of a
     prime minister's day: the House first, then the government's own
     business, then the papers.
     --------------------------------------------------------- */
  /* The motion is a deadline like any other: dated, unavoidable, and the
     player should be able to count the sittings to it. */
  function motionDeadline(st) {
    const m = st.motion;
    if (!m || m.resolved) return null;
    return { kind: "division", at: m.on, away: m.on - st.sitting,
             text: m.label, tab: "cham",
             how: "The House divides on confidence" };
  }

  const TAB_OF = { decision: "sit", division: "gov", vacancy: "gov",
                   owed: "sit", prayer: "gov", expected: "sit", rises: "sit",
                   slots: "gov" };
  const ORDER  = { sit: 0, gov: 1, cham: 2, orb: 3 };
  const SOON = 2;                 /* sittings. Closer than this is business. */

  function today(st, C, hasDecision) {
    const items = [];
    const push = (kind, text, opts) => items.push(Object.assign({
      kind: kind, text: text, tab: TAB_OF[kind] || "sit",
      when: "soon", away: null, required: false
    }, opts || {}));

    /* The House's own business comes first and is the only thing the
       player cannot decline: everything else is a power, this is a duty. */
    if (hasDecision) push("decision", "The House is waiting on you",
                          { when: "now", away: 0, required: true });

    deadlines(st, C).forEach(d => {
      if (d.away > SOON) return;
      /* The rise is not business until it is nearly here — it is on the
         calendar all session and would otherwise sit in this list for
         twenty-four sittings, which is how a list stops being read. */
      if (d.kind === "rises" && d.away > SOON) return;
      const o = { away: d.away, when: d.away < 0 ? "overdue"
                        : d.away === 0 ? "now" : "soon" };
      /* An undertaking carries the tab that KEEPS it and the line that
         says how, so the row takes the player to the order that wants
         signing rather than to the panel that lists the promise. */
      if (d.tab) o.tab = d.tab;
      if (d.how) o.how = d.how;
      if (d.focus) o.focus = d.focus;
      push(d.kind, d.text, o);
    });

    /* A ministry with no minister is an obligation with no date: it
       cannot make its own instruments and somebody is answering for a
       brief they do not hold. */
    vacancies(st, C).forEach(v => {
      const post = (C.cabinetById || {})[v] || {};
      push("vacancy", (post.title || post.name || v) + " is vacant",
           { when: "soon", away: null });
    });

    /* Order-paper time does not carry over, so time left unspent in the
       last days of a session is time thrown away. */
    const left = st.slots.total - st.slots.used;
    const toRise = st.risesAt != null ? st.risesAt - st.sitting : 99;
    if (left > 0 && toRise <= SOON)
      push("slots", left + " order-paper slot" + (left === 1 ? "" : "s") +
                    " unspent before the House rises",
           { away: toRise, when: "soon" });

    items.sort((a, b) =>
      (ORDER[a.tab] - ORDER[b.tab]) ||
      ((a.away == null ? 99 : a.away) - (b.away == null ? 99 : b.away)));

    return {
      items: items,
      required: items.filter(i => i.required).length,
      pressing: items.filter(i => i.when !== "soon").length,
      /* which tabs have something asked of them, for the tab strip */
      tabs: [...new Set(items.map(i => i.tab))]
    };
  }

  /* ---------------------------------------------------------
     INITIATIVE, AND WHY IT IS THE PACING MECHANISM.

     Everything in this game happens TO the prime minister. She answers
     the House, fills what falls vacant, whips what content wrote. She
     cannot start anything, which makes her a spectator with buttons.

     The fix is also the answer to pacing, and that is not a
     coincidence. An AUTHORED deadline — "the bill must carry by sitting
     twenty" — is orchestration, and the player can feel the hand that
     set it. A deadline the PLAYER set is the same pressure and feels
     like agency: she said she would take it to a division on the
     fourteenth, and now the whip count is a problem she made.

     So an initiative is a commitment with a clock the player winds:

       she spends order-paper time,
       she chooses HOW IT IS DONE, which sets how long the answer takes,
       and the answer arrives as an event she did not write.

     TEMPO IS THE DECISION, not a difficulty setting. A word in the
     corridor comes back next sitting and is worth what a corridor is
     worth. A formal approach through the Cabinet Office takes a week
     and carries the government's weight. Neither is correct.

     And the density of the game becomes hers. Take three things on in
     one week and their answers collide in the third; space them and the
     grind is quiet. Nobody orchestrated that — she did, and she can
     feel that she did.
     --------------------------------------------------------- */
  function initiativeById(C, id) {
    return (C.initiatives || []).find(x => x.id === id) || null;
  }

  /* What the government could put in motion, and where it cannot. An
     initiative the player cannot afford is still LISTED, with the
     reason — a power you cannot see is a power you do not have. */
  function initiatives(st, C) {
    return (C.initiatives || []).map(i => {
      const left = st.slots.total - st.slots.used;
      const already = (st.flags || {})["init_" + i.id];
      /* A cost of 0 is a real cost: an executive act that takes no House
         time, such as paying a debt. `i.cost || 1` read it as one. */
      const base = i.cost == null ? 1 : i.cost;
      const why = already ? "already in hand"
        : !matches(st, i.when) ? "not open to you"
        : base > left ? "no order-paper time left this sitting period"
        : null;
      return { id: i.id, title: i.title, note: i.note || "",
               cost: base, tempo: i.tempo || [],
               ok: !why, reason: why };
    });
  }

  /* Take one. Spends the time, applies the initiative's effects and the
     tempo's, and queues the answer. The flag is what stops the story
     offering her a thing she has already done — the pre-emption problem
     solved by the same act that causes it. */
  function take(st, C, id, tempoIdx) {
    const i = initiativeById(C, id);
    if (!i) return { ok: false, reason: "no such initiative" };
    const avail = initiatives(st, C).find(x => x.id === id);
    if (!avail.ok) return { ok: false, reason: avail.reason };

    const t = (i.tempo || [])[tempoIdx || 0] || { after: 3 };
    /* A tempo may carry its own gate: paying a debt in cash wants the cash,
       where settling it in kind does not. */
    if (t.when && !matches(st, t.when)) return { ok: false, reason: "not open to you" };
    const cost = (i.cost == null ? 1 : i.cost) + (t.cost || 0);
    if (cost > st.slots.total - st.slots.used)
      return { ok: false, reason: "no order-paper time left this sitting period" };
    st.slots.used += cost;
    st.actedThisSitting = true;

    st.flags["init_" + i.id] = true;
    if (i.effects) apply(st, C, i.effects);
    if (t.effects) apply(st, C, t.effects);
    if (i.event) apply(st, C, [{ queue: { event: i.event, after: t.after || 3 } }]);

    st.log.unshift({ sitting: st.sitting,
      text: i.title + (t.label ? " \u2014 " + t.label : "") });
    settle(st, C);
    return { ok: true, cost: cost, after: t.after || 3 };
  }

  /* ---------------------------------------------------------
     AMENDMENTS — committee is where a bill is CHANGED (design/25 §7)

     `amendments: []` has been allocated on every bill since the first build
     and nothing has ever read or written it. A bill now declares its own
     amendments in content, the government may adopt one at COMMITTEE, and it
     is applied then and there like any other effect and recorded on the bill.

     No new verb: an amendment IS effects. The politics is the design's — you
     do not defeat a measure, you amend it until its own sponsor stops wanting
     it — so an amendment that buys one bench pays for it somewhere else, and
     the price is written in content next to the thing it buys.
     --------------------------------------------------------- */
  function amendmentList(st, C, billId) {
    const b = C.billById[billId], bs = st.bills[billId];
    if (!b || !bs) return [];
    const taken = (bs.amendments || []).map(x => x.id);
    return (b.amendments || []).filter(a => taken.indexOf(a.id) < 0);
  }

  function canAmend(st, C, billId) {
    const bs = st.bills[billId];
    if (!bs) return { ok: false, reason: "no such bill", list: [] };
    const list = amendmentList(st, C, billId);
    if (!list.length) return { ok: false, reason: "nothing left to move", list: [] };
    if (bs.dead) return { ok: false, reason: "the bill is dead", list: list };
    if (bs.stage !== "committee")
      return { ok: false, reason: "amendments are moved at committee", list: list };
    if (st.slots.total - st.slots.used < 1)
      return { ok: false, reason: "no order-paper time left this sitting period", list: list };
    return { ok: true, list: list };
  }

  function amendBill(st, C, billId, amId) {
    const b = C.billById[billId], bs = st.bills[billId];
    const a = (b && (b.amendments || [])).find(x => x.id === amId);
    if (!a) return { ok: false, reason: "no such amendment" };
    if ((bs.amendments || []).some(x => x.id === amId))
      return { ok: false, reason: "that amendment has already been moved" };
    const chk = canAmend(st, C, billId);
    if (!chk.ok) return { ok: false, reason: chk.reason };
    spendSlots(st, 1);
    st.actedThisSitting = true;
    apply(st, C, a.effects || []);
    (bs.amendments = bs.amendments || []).push({ id: a.id, label: a.label, at: st.sitting });
    billLog(st, billId, "amendment", "Amended: " + (a.label || a.id));
    st.log.unshift({ sitting: st.sitting,
      text: "Amendment moved to " + b.title + ": " + (a.label || a.id) });
    settle(st, C);
    return { ok: true, amendment: a };
  }

  /* ---------------------------------------------------------
     AND THE DAY OF A DIVISION IS HERS TOO.

     dividesOn was st.sitting + 2, an engine constant nobody chose. The
     date a bill is put to the House is the most consequential piece of
     timing a government controls: name it early and you divide on the
     whips you have, name it late and you have time to work but the
     other side does too.
     --------------------------------------------------------- */
  function setDivision(st, C, billId, on) {
    const bs = st.bills[billId];
    if (!bs || bs.dead) return { ok: false, reason: "not before the House" };
    /* NO STAGE CHECK, deliberately, and canDivide() explains why: divide()
       has never enforced one, and content and the checks both divide from
       committee. Setting a day is a weaker act than dividing, so a rule
       here that divide() does not have would only be a rule the player
       could walk around. */
    if (bs.stage === "drafting")
      return { ok: false, reason: "not introduced yet" };
    const first = st.sitting + 1;
    const last = st.risesAt == null ? first + 12 : st.risesAt;
    if (on < first) return { ok: false, reason: "the House cannot divide before sitting " + first };
    if (on > last) return { ok: false, reason: "the House rises at sitting " + last };
    bs.dividesOn = on;
    billLog(st, billId, "day", "Set down for sitting " + on);
    st.log.unshift({ sitting: st.sitting, text:
      (C.billById[billId] || {}).title + " set down for sitting " + on });
    return { ok: true, on: on };
  }

  /* ---------------------------------------------------------
     THE QUIET SITTING — the order paper when nothing is asked

     design/17 §2.2: thirty-nine of sixty sittings printed nothing, and a
     player who met "nothing demands a decision" thirty times read it as a
     missing placeholder rather than as the state of the world. A real
     parliament always has business: questions taken, a committee reporting,
     an instrument laid, a member's statement.

     NOTHING HERE IS A DECISION. It moves no number and is gated on nothing
     being read. It is the room being a room, and it is what makes a sitting
     with no event feel like a sitting rather than a gap.

     The draw is deterministic from the seed and the sitting, so the same
     playthrough always prints the same order paper, and a check can assert
     both that it prints and that it does not move.
     --------------------------------------------------------- */
  function business(st, C, n) {
    const pool = (C.business || []).filter(b => matches(st, b.when));
    if (!pool.length) return [];
    const want = Math.min(n == null ? 3 : n, pool.length);
    const out = [], used = {};
    let h = noise(st, "business:" + st.sitting);
    while (out.length < want) {
      h = (Math.imul(h, 1103515245) + 12345) >>> 0;
      let i = h % pool.length, guard = 0;
      while (used[i] && guard++ < pool.length) i = (i + 1) % pool.length;
      if (used[i]) break;
      used[i] = true;
      out.push(pool[i]);
    }
    return out;
  }

  /* ---------------------------------------------------------
     THE PARLIAMENT ENDS.

     checkLoss() has had four conditions since the first build and
     checkSettlement() gained a fifth answer in September, and between
     them they still left a run that could go on forever: prorogue()
     opened session after session with nothing counting them, and a play
     that reached no settlement was measured running 190 empty sittings
     and would have run for ever.

     A CAMPAIGN IS ONE PARLIAMENT, OF HOWEVER MANY SESSIONS AND SITTING
     PERIODS CONTENT SAYS (setup.sessionsPerParliament and
     setup.periodsPerSession; the engine names no number). Flash I is one
     session of three periods: it was one session of twenty-four sittings,
     then for a day three SESSIONS of sixteen, which made every "this
     session" in the prose mean sixteen sittings and killed bills at a
     recess. At the end of it the House is
     dissolved, the electorate answers, and the campaign is over — which
     makes the election the BACKSTOP ENDING rather than an interruption.
     A run therefore has three ways to finish and no way to continue
     past them:

       a settlement   the argument was closed (§3.5.1)
       the election   time ran out and the electorate answered
       a loss         confidence, leadership, or cascade

     The election is not a failure. Reaching it means governing for a
     full parliament without settling the question, which is what most
     governments do. */
  /* Asked at the moment the House rises: is this the last session of the
     parliament, or is there another? Not "has the parliament finished" —
     a one-session parliament is on its last session from the day it
     opens, which is the point. */
  function lastSession(st, C) {
    const per = (C.setup && C.setup.sessionsPerParliament) || 1;
    return (st.session - (st.parliamentOpenedAt || st.session) + 1) >= per;
  }

  /* SITTING PERIODS (bible §1.8). A session is sat in periods with a recess
     between them, and a recess is not the end of anything: order-paper time
     refills, and bills and promises carry on. Three periods of sixteen are
     one session in Flash I, because the prose was written for a run that
     is one session — "bring it back this session" means before the
     election — and real procedure kills a bill at prorogation, not at a
     recess. */
  function periodLength(C) { return (C && C.setup && C.setup.sittingsPerPeriod) || 24; }
  function lastPeriod(st, C) {
    return (st.period || 1) >= ((C && C.setup && C.setup.periodsPerSession) || 1);
  }
  /* The sitting on which this session's last period rises: when what is
     owed "before the House rises" falls due. */
  function sessionEndsAt(st, C) {
    const left = ((C && C.setup && C.setup.periodsPerSession) || 1) - (st.period || 1);
    return st.risesAt == null ? null : st.risesAt + Math.max(0, left) * periodLength(C);
  }

  /* THE HOUSE RISES FOR THE RECESS. Time is allotted per period, so it
     refills, and reserved time goes with the period it was granted for.
     Supply is tested, because a government may not go into a recess
     without it. Nothing else ends: a bill is killed by prorogation, not
     by a recess, and a promise owed before the House rises is owed before
     the SESSION ends — which is when content written for one session to a
     run meant it to be. */
  function recess(st, C) {
    testSupply(st, C);
    st.period = (st.period || 1) + 1;
    st.slots.used = 0;
    st.slots.reserved = {};
    st.slotsGranted = [];
    /* THIS SITTING IS THE NEW PERIOD'S FIRST. The House rises when the
       sitting passes risesAt, and the rise is taken at the top of the
       sitting after the last, so the period that opens here runs from this
       sitting to risesAt inclusive. Counting a full period on from it sat
       every period after the first for seventeen sittings where setup says
       sixteen, and a run of three periods for fifty. */
    st.risesAt = st.sitting + periodLength(C) - 1;
    st.log.unshift({ sitting: st.sitting, text: "The House rises for the recess, and returns " +
      (C && C.setup && C.setup.recessDays && st.date ? "on " + st.date + " " : "") +
      "for the " + (["", "first", "second", "third", "fourth", "fifth"][st.period] ||
      "next") + " sitting period of the session." });
    st.wire.unshift({ sitting: st.sitting, text: "THE HOUSE RISES FOR THE RECESS" });
  }

  /* Dissolution, the election, and the end of the campaign. The seats are
     recomputed by the existing generalElection(); what is new is that the
     run stops here rather than opening another session. */
  function dissolve(st, C) {
    testSupply(st, C);
    /* THE HOUSE RISES HERE TOO, AND MORE FINALLY THAN AT PROROGATION.
       Everything owed "before the House rises" — by:null, which is every
       promise lobbying makes — comes due. Without this a government could
       buy the functional benches with undertakings and have the
       dissolution quietly forgive all of them, which is the cheapest
       possible way to win and was true for about twenty minutes. */
    (st.undertakings || []).forEach(u => {
      if (u.state !== "open" || u.by != null) return;
      breakUndertaking(st, C, u, "dissolution");
    });
    /* THE COUNT IS TAKEN AT THE END OF THE CAMPAIGN, NOT AT THE WRITS
       (design/38 §1). It was taken here, so chapter three's beats moved
       standing and spent the reserve with the result already decided, and
       the new House sat on the Chamber tab a week before the count read it
       out. The dissolved House stands until the count; count() takes it. */
    const before = Object.keys(st.parties).reduce((m, p) =>
      (m[p] = partyTotal(st, p), m), {});
    st.dissolved = { at: st.sitting, session: st.session, period: st.period || 1,
                     before: before, was: before[st.playerParty] || 0,
                     side: confidence(st), sideParties: govSide(st).slice() };
    st.log.unshift({ sitting: st.sitting,
      text: "The House is dissolved. The Commonwealth goes to the country." });
    st.wire.unshift({ sitting: st.sitting, text: "PARLIAMENT DISSOLVED" });
    return { ok: true };
  }

  /* THE COUNT. Once, when the campaign ends: content sets `campaign_done`
     on its last beat, or `campaignSittings` run out. */
  function counted(st) { return !!(st.dissolved && st.dissolved.after); }
  function count(st, C) {
    if (!st.dissolved || counted(st)) return null;
    const res = generalElection(st, C);
    const after = Object.keys(st.parties).reduce((m, p) =>
      (m[p] = partyTotal(st, p), m), {});
    st.dissolved.after = after;
    st.dissolved.held = after[st.playerParty] || 0;
    st.dissolved.countedAt = st.sitting;
    st.dissolved.sideNow = confidence(st);
    st.dissolved.majority = majority(st);
    st.wire.unshift({ sitting: st.sitting, text: "THE COUNT: THE GOVERNMENT'S SIDE " +
      st.dissolved.sideNow + " OF " + chamberTotal(st) + ", " +
      (st.dissolved.sideNow >= st.dissolved.majority ? "A MAJORITY" : "SHORT OF A MAJORITY") });
    return res;
  }
  /* THE EPILOGUE (design/38 §2). The election ends the run, and what it
     means is content's to say: `setup.epilogues` is a list of passages,
     each with a `when`, and the first that matches the counted result is
     the one the last page prints. */
  function epilogue(st, C) {
    if (!counted(st)) return null;
    return ((C.setup && C.setup.epilogues) || []).find(x => !x.when || matches(st, x.when)) || null;
  }

  /* WHAT THE COUNT WOULD SAY TODAY. The same count on a copy, so the
     campaign can be read as it goes: the interface's polls and the wire's
     daily projection. Reads state and writes none. */
  function forecast(st, C) {
    const t = JSON.parse(JSON.stringify(st));
    /* WHERE IT IS CLOSE, band by band: the seats the government's side
       would take, and those within three points either way, so a campaign
       can be aimed (design/38 §1). */
    const gov = govSide(t), bands = {};
    (C.constituencies || []).forEach(k => {
      if (k.nonVoting || !t.roll[k.id]) return;
      const sh = swungShares(t, C, k);
      const g = Math.max(0, ...Object.keys(sh).filter(id => gov.includes(id)).map(id => sh[id]));
      const o = Math.max(0, ...Object.keys(sh).filter(id => !gov.includes(id)).map(id => sh[id]));
      const b = bands[k.band] || (bands[k.band] = { seats: 0, gov: 0, close: 0, standing: standingIn(t, k.band) });
      b.seats++; if (g > o) b.gov++; if (Math.abs(g - o) < 0.03) b.close++;
    });
    generalElection(t, C);
    const after = Object.keys(t.parties).reduce((m, p) => (m[p] = partyTotal(t, p), m), {});
    return { after: after, side: confidence(t), majority: majority(t),
             total: chamberTotal(t), mine: after[t.playerParty] || 0,
             national: nationalShares(t, C), bands: bands };
  }

  /* The one place that answers "is this run over, and how". Losing is
     read first, then the settlement, then the clock — a government that
     has fallen has not been re-elected, and a settlement reached in the
     last sitting is still a settlement. */
  function checkEnd(st, C) {
    /* DISSOLUTION IS READ FIRST, and finding out why was worth the test.
       The first order read loss, then settlement, then the clock — and a
       run taken to dissolution came back "loss", because the election had
       redistributed the seats and the old coalition no longer held a
       majority in a House THAT NO LONGER EXISTS. You cannot lose a
       confidence vote in a chamber that has been dissolved. Once the
       writs are out the campaign is over and the electorate's answer is
       the outcome, whatever the arithmetic of the last parliament says. */
    /* LOSING SUPPLY BEATS THE ELECTION, and only this does. The general
       rule below is that dissolution is read first — you cannot lose a
       confidence vote in a House that no longer exists — but supply is
       lost AT THE RISE, in the parliament that was still sitting, and
       with one session to a parliament the rise and the dissolution are
       the same instant. Read the other way round, a government that never
       brought a budget went to the country as though it had governed. */
    if (st.supplyLost) return { over: true, kind: "loss", reason: "supply" };
    /* A CARRIED MOTION IS READ WITH SUPPLY, above dissolution, for the same
       reason: it happened in the House that was still sitting. */
    if (st.noConfidence) return { over: true, kind: "loss", reason: "no confidence" };
    /* A CRISIS CAN RESOLVE AFTER THE WRITS ARE OUT. This sat below the
       dissolution branch, which returns, so checkSettlement was never
       reached once the House was dissolved and the twelve sittings of the
       campaign were a dead zone no settlement could land in. That was not a
       decision anybody took; it fell out of the order of two returns.

       It mattered because the Flash I tiers discriminate on scalars that
       RAMP — the pyrrhic ending wants friction above 65, and annexation sets
       a trend of +3 a sitting rather than a step — so the conditions for the
       canon ending converge around sitting 25 in a session that rises at 24.
       The ending was one sitting the wrong side of a boundary nobody had
       written down, and a two-sitting change to the crisis chain was enough
       to make it unreachable.

       The settlement branch returns {over:false}: recording that the crisis
       resolved never ends the run, before or after dissolution. The election
       still ends it, on the same terms as before. */
    /* HOW LONG THE CAMPAIGN RUNS IS CONTENT'S, not a number in here. It was
       hard-coded at twelve, and chapter three fires one prologue a sitting —
       so the length of the campaign silently capped how many beats the
       ending could have. An author folding chapter four into chapter three
       would have pushed the COUNT past the backstop and ended the run
       without it ever being read, which is the opposite of what the
       backstop is for. `campaignSittings` in setup, and test.js asserts the
       chain fits inside it. */
    const window = (C && C.setup && C.setup.campaignSittings) || 12;
    /* THE CASCADE, DURING THE CAMPAIGN. checkLoss knows what can still end
       a dissolved parliament's run; it is read before the election branch
       returns, or the thermal margin could sit at nothing through twelve
       campaign sittings and the count be read anyway. */
    if (st.dissolved) {
      const lostNow = checkLoss(st, C);
      if (lostNow.lost) return { over: true, kind: "loss", reason: lostNow.reason };
    }
    const sEarly = checkSettlement(st, C);
    /* OVER WHEN THE COUNT HAS BEEN TAKEN (design/38 §1), which is when the
       last beat sets `campaign_done` or the campaign's sittings run out. */
    if (sEarly && st.dissolved)
      return { over: counted(st), kind: "election", result: st.dissolved, settlement: sEarly };
    if (st.dissolved) {
      /* THE WRITS ARE OUT AND THE CAMPAIGN RUNS. Chapter three IS the
         campaign and it plays after dissolution, so dissolution cannot be
         the end of the run: it is the end of the PARLIAMENT. The run is
         over when the count has been read — `campaign_done`, set by
         ch3_the_count — or when a campaign's worth of sittings has gone by,
         so a missing or gated chapter can never leave a run open for ever. */
      return { over: counted(st), kind: "election", result: st.dissolved };
    }
    const lost = checkLoss(st, C);
    if (lost.lost) return { over: true, kind: "loss", reason: lost.reason };
    const s0 = checkSettlement(st, C);
    /* A SETTLEMENT RESOLVES THE CRISIS; THE RISE ENDS THE RUN. A terminal
       settlement used to end the run on the sitting it landed, which cut
       the session off mid-sitting and made chapter four — the aftermath,
       written and wired — unreachable. Both kinds now record and let the
       session run on to the election, which is the backstop ending the
       design names, and a terminal one is still the settlement the record
       shows. */
    if (s0) return { over: false, kind: "settlement", settlement: s0 };
    return { over: false };
  }

  /* Called the moment the House rises, whichever way it rises. */
  function testSupply(st, C) {
    if (!C || !supplyPending(st, C) && !supplyCarried(st, C)) return;
    if (supplyCarried(st, C)) return;
    st.supplyLost = true;
    st.log.unshift({ sitting: st.sitting, text:
      "The House rises without supply. The government cannot pay for itself." });
    st.wire.unshift({ sitting: st.sitting, text: "SUPPLY NOT GRANTED" });
  }

  function prorogue(st, C) {
    testSupply(st, C);
    const fell = [];
    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id];
      if (!bs || bs.dead) return;
      if (bs.stage === "assented" || bs.stage === "in_force") return;
      /* A bill still in drafting has not been introduced, so there is
         nothing before the House to fall. It waits for the next session
         with its stage intact — which is also what keeps prorogation
         from wiping the whole legislative programme on the first pass. */
      if (bs.stage === "drafting") return;
      bs.stage = "fallen"; bs.dead = true; bs.dividesOn = null;
      billLog(st, b.id, "fallen", "Fell when the House rose");
      fell.push(b.title);
    });

    /* Owed "before the House rises" — by:null — comes due here rather
       than on a sitting number the author had to guess. */
    (st.undertakings || []).forEach(u => {
      if (u.state !== "open" || u.by != null) return;
      breakUndertaking(st, C, u, "prorogation");
    });

    st.session += 1;
    st.period = 1;
    st.slots.used = 0;
    st.slots.reserved = {};                   /* reserved time is the period's */
    st.slotsGranted = [];
    st.risesAt = st.sitting + periodLength(C) - 1;   /* this sitting is the first; see recess() */
    st.log.unshift({ sitting: st.sitting,
      text: "The House rises. Session " + st.session + " opens" +
            (fell.length ? "; " + fell.length + " bill" + (fell.length > 1 ? "s" : "") +
             " fell" : "") + "." });
    st.wire.unshift({ sitting: st.sitting,
      text: "THE HOUSE RISES" + (fell.length ? "; " + fell.length + " BILL" +
        (fell.length > 1 ? "S FALL" : " FALLS") : "") });
    return fell;
  }

  /* A division has a DAY. Granting the last slot schedules it; it does
     not fire it. The player still chooses whether and when to schedule,
     which is the government's real power over the order paper — but
     having scheduled it they must live in the sittings before it, which
     is where whipping and (later) amendment and lobbying belong. */
  function canDivide(st, C, billId) {
    const bs = st.bills[billId];
    if (!bs) return { ok: false, reason: "no such bill" };
    if (bs.dead) return { ok: false, reason: "the bill is dead" };
    /* A DIVISION IS HOUSE TIME (design/18 §3). It costs a slot like any other
       business, so when the session's order-paper time is gone the House is
       done — which is what makes §7.7's scarcity bite. `noTime` lets the
       interface say so rather than refusing in silence. */
    if (slotsFor(st, billId) < 1)
      return { ok: false, reason: "no order-paper time left this sitting period", noTime: true };

    /* A BILL MUST HAVE BEEN READ BEFORE THE HOUSE DIVIDES ON IT.

       divide() never checked a stage, and the comment that used to sit
       here defended that by saying content divides from committee —
       which was not true of the roster. Three of the seven bills open at
       `drafting`, and both could be taken straight to a division on the
       first sitting without ever being granted time. That made the whole
       stage ladder decorative: granting time was never a step you had to
       take to pass anything, only a way to buy capital from the partner
       whose bill it was. A measure has to have had its second reading. */
    if (STAGE_ORDER.indexOf(bs.stage) < STAGE_ORDER.indexOf("second_reading"))
      return { ok: false, unread: true,
               reason: "the House has not read it a second time \u2014 give it time on the order paper" };

    /* AND THE HOUSE HEARS SO MUCH IN A DAY. The session budget capped
       how much business a player could take and said nothing about
       when, so all six slots were spendable on sitting 1. §7.7 calls
       order-paper time the pacing instrument; this is the part that
       paces. */
    const cap = (C.setup && C.setup.divisionsPerSitting) || 2;
    if ((st.divisionsToday || 0) >= cap)
      return { ok: false, full: true, cap: cap,
               reason: cap === 1 ? "the House has already divided today"
                                 : "the House has divided " + cap + " times today" };

    /* THE DAY, AND ONLY THE DAY: once a division has been SET, it
       happens then and not before. */
    if (bs.dividesOn != null && st.sitting < bs.dividesOn)
      return { ok: false, reason: "the division is set for sitting " + bs.dividesOn,
               on: bs.dividesOn };
    return { ok: true };
  }

  /* =============================================================
     A FOREIGN FACT IS NEVER CURRENT. design/11 §1, LOCKED, and until now
     it was only drawn: content gave Mars a `lag` of eleven sittings, the
     panel printed "11 sittings behind" beside its standing, and the number
     it printed was the LIVE one. The interface was making a claim the
     engine did not support, which is worse than not having the mechanic.

     So each foreign body keeps a trail of what was true, newest first, and
     what the player is shown is the entry `lag` sittings back. Nothing is
     hidden and nothing is random: you know exactly what Mars said and
     exactly how old it is, and you do not know what Mars thinks now. That
     is a different and better anxiety than uncertainty, and it is what the
     light-lag axis is for.

     The trail is prefilled at reconcile, so the opening reading is the
     opening standing rather than a number that quietly becomes stale over
     the first eleven sittings. A body with no lag — every domestic actor —
     reports itself, so lobbying is untouched. */
  function sampleForeign(st, C) {
    st.foreign = st.foreign || {};
    (C.actors || []).forEach(a => {
      const live = (st.actors || {})[a.id];
      if (!live) return;
      const lag = a.lag || 0;
      const f = st.foreign[a.id] || (st.foreign[a.id] = { trail: [] });
      /* The lag is carried IN STATE so a condition can read it. Conditions
         are called as (st, value) and threading content through matches()
         to reach four numbers would touch every call site for nothing;
         reconcile() keeps this in step with content the same way it keeps
         the station roster in step. */
      f.lag = lag;
      f.trail.unshift(live.standing);
      if (f.trail.length > lag + 1) f.trail.length = lag + 1;
    });
  }

  /* What the government knows about a body, and when it knew it. */
  function reportedActor(st, id) {
    const live = (st.actors || {})[id] || {};
    const f = (st.foreign || {})[id] || {};
    const lag = f.lag || 0;
    const trail = f.trail || [];
    /* NO LAG MEANS AS IT HAPPENS, and that has to mean the live figure, not
       the trail's newest entry. The trail is only sampled on advance(), so
       reading it for a lagless body reported a value up to a sitting old —
       which broke the Tribunal, whose bench is an ordinary domestic actor
       whose standing is set and read inside the same sitting. Every
       domestic actor takes this path, so lobbying is untouched. */
    if (!lag || !trail.length)
      return { standing: live.standing, lastHeard: st.sitting, age: 0, lag: lag };
    const i = Math.min(lag, trail.length - 1);
    return { standing: trail[i], lastHeard: st.sitting - i, age: i, lag: lag };
  }

  /* THE MOTION IS TAKEN. Read at the top of the sitting it was set for, so
     the government has had every sitting in between to whip, spend and
     bargain — which is the point of tabling it in advance rather than
     springing it.

     It is the SAME arithmetic the House uses for everything else:
     confidence against the majority it has to clear. No separate rule, so a
     player who has learned to read the coalition table has already learned
     to read this. */
  function resolveMotion(st, C) {
    const m = st.motion;
    if (!m || m.resolved || st.sitting < m.on) return null;
    const have = confidence(st), need = majority(st);
    m.resolved = st.sitting;
    m.have = have; m.need = need;
    st.wire = st.wire || [];
    if (have < need) {
      m.carried = true;
      st.noConfidence = { at: st.sitting, have: have, need: need };
      st.wire.unshift({ sitting: st.sitting,
        text: "THE HOUSE HAS NO CONFIDENCE IN THE GOVERNMENT: " + have + " TO " + need });
      st.log.unshift({ sitting: st.sitting,
        text: "The motion of no confidence was carried, " + have + " against " + need + " needed." });
    } else {
      /* A MOTION THAT FAILS STRENGTHENS THE GOVERNMENT. */
      m.carried = false;
      /* Through the one writer: a standing written straight onto the
         national figure was overwritten by the bands at the next sync. */
      bumpScalar(st, C, "party_loyalty", 6);
      bumpScalar(st, C, "public_standing", 3);
      bumpScalar(st, C, "legitimacy", 4);
      st.wire.unshift({ sitting: st.sitting,
        text: "GOVERNMENT SURVIVES NO-CONFIDENCE MOTION " + have + " TO " + need });
      st.log.unshift({ sitting: st.sitting,
        text: "The motion of no confidence was defeated, " + have + " against " + need + " needed." });
    }
    return m;
  }

  function advance(st, C) {
    settleWaits(st);
    st.sitting += 1;
    if (st.motion && !st.motion.resolved) resolveMotion(st, C);
    if (C) sampleForeign(st, C);
    st.divisionsToday = 0;                    /* a new day's business */
    st.grantsToday = 0;
    /* PRESSURE BY DEFAULT (Flash I). The sitting just finished either used
       a lever — a grant, a division, an order, an initiative — or it did
       not. After a content-declared number of leverless sittings the drag
       lands, and keeps landing until one is used again. Chapter one is
       exempt by content's own `fromChapter`: it is the teaching chapter and
       design/21 §5 makes it loss-proof. */
    if (C && C.setup.idleness &&
        st.chapter >= (C.setup.idleness.fromChapter || 1)) {
      const idle = C.setup.idleness;
      if (st.actedThisSitting) st.idleSittings = 0;
      else st.idleSittings = (st.idleSittings || 0) + 1;
      if (st.idleSittings >= (idle.after || 1)) {
        Object.keys(idle.drag || {}).forEach(k => bumpScalar(st, C, k, idle.drag[k]));
        if (idle.mark && !st.flags._idle_mark) {
          st.flags._idle_mark = true;
          st.wire.unshift({ sitting: st.sitting, text: idle.mark.toUpperCase() });
        }
      }
    } else {
      st.idleSittings = 0;
    }
    st.actedThisSitting = false;
    /* A promise not kept by its sitting is broken, once. Breaking it
       QUEUES AN EVENT and moves no number: the politics of a broken
       promise belongs where it can be written and argued with, not in a
       silent correction the player never sees. See design/02. */
    (st.undertakings || []).forEach(u => {
      if (u.state !== "open" || u.by == null || u.by >= st.sitting) return;
      breakUndertaking(st, C, u);
    });
    /* THE CLOCK RUNS. st.date was written once at newGame and never again,
       so the topbar showed the same day for the whole game. A sitting is a
       day the House sits, and which day that is comes from the calendar. */
    if (C) st.date = dateOfSitting(C, st.sitting);
    /* BEFORE ANYTHING READS THE STATE. A verdict that lands today is part
       of today's world: event selection, the docket and the loss check
       must all see it, so it resolves at the top of the sitting and not
       at the point somebody happens to look. */
    if (C) resolveDue(st, C);
    if (C) partnerCheck(st, C);
    /* THE CAMPAIGN'S CLOCK. The count is taken when `campaignSittings` run
       out if the last beat has not taken it, and until then the wire
       carries the day's projection, so the campaign can be read as it
       moves. */
    if (C && st.dissolved && !counted(st)) {
      const window = (C.setup && C.setup.campaignSittings) || 12;
      if (st.sitting >= st.dissolved.at + window) count(st, C);
      else {
        const f = forecast(st, C);
        st.polls = st.polls || [];
        st.polls.push({ sitting: st.sitting, side: f.side, mine: f.mine });
        st.wire.unshift({ sitting: st.sitting, text: "THE POLLS PUT THE GOVERNMENT'S SIDE ON " +
          f.side + " OF " + f.total + ", " + (f.side >= f.majority ? "A MAJORITY OF " + (2 * f.side - f.total)
                                                                   : (f.majority - f.side) + " SHORT") });
      }
    }
    if (C && st.risesAt != null && st.sitting > st.risesAt && !st.dissolved) {
      /* The House rises. For a recess, for the end of the session, or for
         good: whether it meets again is the whole question. */
      if (!lastPeriod(st, C)) recess(st, C);
      else if (lastSession(st, C)) dissolve(st, C);
      else prorogue(st, C);
    }
    if (C) reviewReturns(st, C);
    if (C) tick(st, C).forEach(m =>
      st.wire.unshift({ sitting: st.sitting, text: m.toUpperCase() }));
  }

  /* Everything in the queue whose day has come and which carries effects
     rather than a story. Applied in the order it was queued, removed as
     it goes, and logged under its own label so the player can see what
     arrived and what put it there. Returns what it resolved. */
  function resolveDue(st, C) {
    const due = (st.queue || []).filter(q => q.dueSitting <= st.sitting && q.effects);
    if (!due.length) return [];
    st.queue = st.queue.filter(q => due.indexOf(q) < 0);
    due.forEach(q => {
      apply(st, C, q.effects);
      if (q.label) st.log.unshift({ sitting: st.sitting, text: q.label });
    });
    return due;
  }

  /* ---------------------------------------------------------
     7. LOSS CONDITIONS
     --------------------------------------------------------- */

  /* THE GAME CAN BE WON.

     checkLoss() has had no counterpart since the first build: four ways
     to lose and none to finish, which §3.5.1 calls a survival game and
     says this is not one.

     A READER, NEVER A BRANCH. A settlement is a `when` block in content,
     evaluated by the same matches() every event uses, so the engine
     names no settlement and content can add a fifth without touching
     this file. `rank` breaks a tie: a specific configuration beats a
     general one, so the federal fudge — which is compatible with almost
     any threshold — is read last.

     THE LIST IS NEVER SHOWN. §3.5.1 rule 2: an ending named in advance
     is a quest marker. This returns the one that is TRUE and nothing
     about the ones that are not; there is deliberately no function that
     reports progress toward a settlement, and no caller should invent
     one. Losing is checked first: closure and dissolution are failure
     modes, not settlements (rule 3). */
  function checkSettlement(st, C) {
    if (checkLoss(st, C).lost) return null;
    /* AN ENDING MUST BE CARRIED (design/26 #91). Without a floor a settlement
       lands in the first third of a session — measured at sitting 7 on one
       play policy and 13 on another — so the crisis resolves before the
       government has done anything to resolve it, and the meters decide the
       run instead of the player. The floor is content's, and each tier is
       also gated on the crisis flag it follows from, so a government that
       never engaged the crisis cannot settle it. */
    const floor = (C.setup && C.setup.settlementFloorSittings) || 0;
    if (st.sitting < floor) return null;
    /* TWO FAMILIES, TWO CHANNELS (design/32 §E.1, bible §3.5.1). A
       campaign's CRISIS tiers (`crisis: true`) are its outcome, and one of
       them lands or none does; the other settlements are INTERMEDIATE
       resolutions of the standing question, which record and end nothing.

       They were ranked together, and only the winner was recorded — so an
       intermediate resolution matching on the same sitting as a crisis
       tier could take the canon ending off the board, and four of Flash
       I's five tiers were routed to the intermediate channel (only the one
       marked `terminal:false` reached `resolvedAs`), which left their
       achievements unearnable and their election beat unread. Each family
       now picks its own best match and records it in its own field.

       THE CRISIS RESOLVES ONCE. The first tier to land is the outcome and
       stays it: the aftermath narrates it the sitting after, and a result
       that changed under the narration would make the narration false.
       The intermediate channel records whichever answer holds now, as it
       always has, because a standing question can be answered twice.

       Nothing here reports progress toward either (§3.5.1 rule 2). */
    const best = list => list.filter(s0 => matches(st, s0.when))
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))[0] || null;
    const all = C.settlements || [];
    /* A LINE ON THE WIRE AND A MARK IN THE REGISTER, the moment either
       lands (design/31 §4). The interface used to announce it in a dialog;
       a settlement ends nothing, so it is recorded like any other fact of
       the sitting and its closing words wait for the last page. */
    const mark = (s0, how) => {
      st.log.unshift({ sitting: st.sitting, text: how + ": " + s0.name });
      st.wire.unshift({ sitting: st.sitting, text: String(s0.name).toUpperCase() });
    };
    if (!st.resolvedAs) {
      const c = best(all.filter(s0 => s0.crisis));
      if (c) { st.resolvedAs = c.id; st.resolvedAt = st.sitting; mark(c, "The crisis resolves"); }
    }
    const d = best(all.filter(s0 => !s0.crisis));
    if (d && st.settledAs !== d.id) { st.settledAs = d.id; mark(d, "The question is settled"); }
    const resolved = st.resolvedAs ? all.find(s0 => s0.id === st.resolvedAs) : null;
    return resolved || d;
  }

  /* Has a money bill been carried in this session? Read generically: any
     measure whose test is "supply". The engine names no bill. */
  function supplyCarried(st, C) {
    return (C.bills || []).some(b => b.test === "supply" &&
      (st.bills[b.id] || {}).stage === "assented");
  }
  function supplyPending(st, C) {
    return (C.bills || []).some(b => b.test === "supply" &&
      !((st.bills[b.id] || {}).dead));
  }

  function checkLoss(st, C) {
    /* SUPPLY IS THE THING THAT CANNOT BE IGNORED.

       Without this a player could rise from sitting after sitting, call no
       division, grant no time and answer nothing, and reach the election
       having simply declined to govern. Every other pressure in the game
       is a cost you may choose to pay; a government that does not carry
       its budget is not a government that made a hard choice, it is one
       that has lost supply, and that is the sharpest confidence test there
       is (design/13 §4).

       It is also the fairest, because it is the one loss a player can see
       coming for a whole session: the bill is on the order paper from
       sitting one and the calendar carries the day it must be done by. */
    if (C && st.supplyLost) return { lost: true, reason: "supply" };
    /* ONCE THE HOUSE IS DISSOLVED, ONLY THE PHYSICAL CAN END THE RUN (the
       author, 23 Sep). There is no House to lose a confidence vote in, and
       a caucus does not unseat its leader mid-campaign -- but a radiator
       does not know there is an election, and a cascade during the
       campaign is a loss. This read confidence against the dissolved
       House's majority, so a government that lost seats at the count was
       declared fallen by the interface while checkEnd ran the campaign on. */
    if (st.dissolved) {
      if (st.scalars.thermal_margin <= 0) return { lost: true, reason: "cascade" };
      return { lost: false };
    }
    /* A LOST MAJORITY IS A MOTION, NOT A VERDICT (design/38 §3). This read
       confidence below the majority as the end on the spot, and nothing in
       content ever moved a partner, so it never happened. A partner can
       walk out now, and when the government no longer commands the House
       the opposition moves against it (partnerCheck); the House divides
       and resolveMotion records the result as st.noConfidence. Bible §3.5
       says the loss is losing a confidence VOTE, and now it is. */
    /* A ballot the Prime Minister lost is the end, through the same reason the
       old loyalty floor used, so there is one leadership loss and not two. */
    if (st.ballot && !st.ballot.carries) return { lost: true, reason: "leadership" };
    if (st.scalars.party_loyalty <= C.setup.thresholds.leadershipChallenge)
      return { lost: true, reason: "leadership" };
    if (st.scalars.thermal_margin <= 0) return { lost: true, reason: "cascade" };
    return { lost: false };
  }

  /* ---------------------------------------------------------
     8. UTIL / SAVE
     --------------------------------------------------------- */

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function save(st) { return JSON.stringify(st); }
  /* load takes content so a migration that needs it can run. Pre-roll saves
     have no constituency map to restore and must be reseeded from content. */
  function load(str, C) {
    const st = migrate(JSON.parse(str));
    if (C && (st.rollReseeded || !st.roll)) { seedRoll(st, C); delete st.rollReseeded; }
    if (C && (st.functionalReseeded || !st.functional)) { seedFunctional(st, C); delete st.functionalReseeded; }
    return reconcile(st, C);
  }

  /* Every chapter referenced by content, in order. */
  function chapters(C) {
    const s = new Set([1]);
    C.events.forEach(e => { if (e.chapter != null) s.add(e.chapter); });
    C.events.forEach(e => (e.choices || []).forEach(c =>
      [].concat(c.effects || []).forEach(f => { if (f.chapter != null) s.add(f.chapter); })));
    return [...s].sort((a, b) => a - b);
  }

  return {
    STATE_VERSION, newGame, migrate, save, load, chapters, reportedActor, receipts,
    confidence, majority, chamberTotal, popularTotal, functionalTotal,
    partyPopular, partyFunctional, partyTotal, currentSeats,
    division, reported, ballot, benchRoll, resolveDue, pairable, setPairs, clearPairs, benches, matches, apply, eligible, nextEvent, choose, advance, tick, checkLoss, checkSettlement,
    dateOfSitting, sittingOfDate, inRecess, deadlines, calendar, today, business,
    initiatives, take, setDivision,
    apportionment, tierCheck, DIVIDES_AT, STAGE_ORDER,
    seedRoll, syncRoll, reconcile, partyDistrict,
    lastReconcile: () => lastReconcile, nationalShares, vacantSeats, seatsFor,
    vacateSeat, crossFloor, byElection, generalElection, shares, swungShares,
    count, counted, forecast, functionalShares, epilogue,
    divisorAllocate,
    packBoard, canPackBoard, boardsMoved, boardsTotal,
    borrow, repay, canBorrow, debtOf, debtRate, debtService, debts, lenderOf, inflation, outlook,
    facilities, lenderCap, rateSteps,
    reshuffle, canReshuffle, resolveMotion, motionDeadline,
    standingIn, bandsOf, bandWeight, syncStanding, assent, presidentDecides, referralRisk, reviewReturns,
    canMake, makeInstrument, prayAgainst, prayerForecast, revokeInstrument,
    canApprove, approveInstrument, approvalForecast, reservedFor,
    instrumentsInForce, appoint, vacate,
    loyaltyOf, whippable, setWhip, whipCost, payWhips, clearWhips, divide, grantSlot, STAGE_ORDER,
    /* Exported so the interface cannot invent a second way to score
       agreement. A tooltip that disagreed with a division would be the
       worst kind of bug here: both right, neither checkable. */
    axisAgreement,
    amendmentList, canAmend, amendBill,
    rollCall, lobbyable, setLobby, clearLobby, lobbyCost, payLobby, lobbiedSeats,
    clausesOf, clausePlan, clauseCost, setClause, clauseEffects,
    domainTest, functionalByConstituency, lobbiedByConstituency, isSupply,
    lastSession, lastPeriod, sessionEndsAt, recess, dissolve, checkEnd, supplyCarried, supplyPending,
    signableMembers, collectSignature, winBackTerms, winBack,
    settle, outstanding, describe, grave, choiceOpen, openChoices, draw,
    undertakingWhere,
    snapshot, changes,
    prorogue, canDivide, candidates, vacancies, fillPost,
    federalSuspended, stationGovernment,
    foreignBodies, foreignBody, isAnnexed,
    CONDITIONS, EFFECTS
  };
})();

if (typeof module !== "undefined") module.exports = Engine;
