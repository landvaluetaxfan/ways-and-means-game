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

  const STATE_VERSION = 18;  // 3 prices, 4 cabinet+instruments, 5 the district roll, 6 content reconciliation, 7 the functional roll, 8 undertakings, 9 the seed, 10 the calendar, 11 the day's business, 12 pairing, 13 actors and lobbying, 14 the parliament ends, 15 trends, 16 the campaign meters, 17 the day's order-paper business, 18 pressure by default

  /* ---------------------------------------------------------
     1. STATE
     --------------------------------------------------------- */

  function newGame(C, seed) {
    const st = {
      version: STATE_VERSION,
      sitting: 1,
      chapter: 1,
      session: 4,
      date: dateOfSitting(C, 1),   /* the first day the House actually sits */
      inGovernment: true,
      pm: C.setup.pm,
      playerParty: C.setup.playerParty,

      scalars: Object.assign({}, C.setup.scalars),
      law: Object.assign({}, C.setup.law),

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
      slots: { total: C.setup.slotsPerSession || 6, used: 0 },

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

      /* Czarnecki needs nine more names for a leadership ballot. Things the
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

      /* THE CALENDAR. A session has an end, and that is what makes the
         order paper a schedule rather than a list. Everything with a
         deadline counts toward this sitting: slots refill here, business
         not carried falls here, and an undertaking owed before the House
         rises comes due here. */
      sessionEnds: (C.setup.sittingsPerSession || 24),

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
      if (st.sessionEnds == null) st.sessionEnds = st.sitting + 24;
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
    Object.keys(C.setup.scalars || {}).forEach(k => {
      if (st.scalars[k] == null) st.scalars[k] = C.setup.scalars[k];
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

     Deterministic, per 1.5. A constituency's strength is its current
     roll; a party's national strength is its list bench. Blending the
     two means a party holding nothing here still has a floor to grow
     from, which is what makes a by-election worth watching rather
     than a foregone conclusion. */
  function shares(st, C, cons) {
    const roll = seatsFor(st, cons.id);
    const natTotal = Object.values(st.parties)
      .reduce((n, p) => n + (p.seats.list || 0), 0) || 1;
    const out = {};
    C.parties.forEach(p => {
      const local = (roll.held[p.id] || 0) / cons.magnitude;
      const nat = (st.parties[p.id].seats.list || 0) / natTotal;
      out[p.id] = 0.68 * local + 0.32 * nat;
    });
    return out;
  }

  /* Swing. Government carries the standing of the government; the
     opposition picks up a fraction of what it drops. */
  function swing(st) { return (st.scalars.public_standing - 50) / 100; }

  function swungShares(st, C, cons) {
    const s = shares(st, C, cons), k = swing(st);
    const gov = st.coalition.concat(st.confidenceSupply);
    let tot = 0;
    Object.keys(s).forEach(id => {
      s[id] *= gov.includes(id) ? (1 + k) : (1 - k * 0.4);
      if (s[id] < 0) s[id] = 0;
      tot += s[id];
    });
    if (tot > 0) Object.keys(s).forEach(id => s[id] /= tot);
    return s;
  }

  /* THE LIST IS A SECOND BALLOT (4.1), not a projection of the first.

     Deriving it from constituency strength quietly makes a pure-list party
     impossible — and 4.3 states the opposite, that a party strong nationally
     with no roots is viable and is the shape of the Public Substrate
     Association and the Georgists. So national standing carries the list,
     with a quarter weight on district strength to represent ticket-splitting
     in the other direction (4.3 puts it at 21.4%), which is also what lets a
     district-rooted party with no list bench win one. */
  function nationalShares(st, C) {
    const listTot = Object.values(st.parties)
      .reduce((n, p) => n + (p.seats.list || 0), 0) || 1;
    const distTot = Object.values(st.parties)
      .reduce((n, p) => n + (p.seats.district || 0), 0) || 1;
    const gov = st.coalition.concat(st.confidenceSupply), k = swing(st);
    const out = {}; let sum = 0;
    C.parties.forEach(p => {
      const nat = (st.parties[p.id].seats.list || 0) / listTot;
      const loc = (st.parties[p.id].seats.district || 0) / distTot;
      let v = 0.75 * nat + 0.25 * loc;
      v *= gov.includes(p.id) ? (1 + k) : (1 - k * 0.4);
      out[p.id] = v < 0 ? 0 : v; sum += out[p.id];
    });
    if (sum > 0) Object.keys(out).forEach(i => out[i] /= sum);
    return out;
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
      district: partyDistrict(st, p.id), list: st.parties[p.id].seats.list || 0
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

    syncRoll(st, C);
    st.lastElection = { sitting: st.sitting, nat: nat, threshold: cut,
                        barred: Object.keys(nat).filter(id => !eligibleList[id] && nat[id] > 0),
                        saved: Object.keys(eligibleList).filter(id =>
                          nat[id] < cut && (wonDistrict(id) || carved(id))) };
    st.electionsHeld = (st.electionsHeld || 0) + 1;

    const after = {};
    C.parties.forEach(p => after[p.id] = {
      district: partyDistrict(st, p.id), list: st.parties[p.id].seats.list
    });
    st.log.unshift({ sitting: st.sitting, text: "GENERAL ELECTION" });
    C.parties.forEach(p => {
      const d = (after[p.id].district + after[p.id].list) -
                (before[p.id].district + before[p.id].list);
      if (d) st.log.unshift({ sitting: st.sitting,
        text: `  ${p.id}: ${d > 0 ? "+" : ""}${d} (${after[p.id].district} district, ${after[p.id].list} list)` });
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

  function axisAgreement(partyAxes, billAxes) {
    let score = 0, counted = 0;
    /* NO LIST AT ALL, which is better than reading one from content: the
       axes ARE whatever dimensions a party and a bill both declare a
       position on. Add `housing` to both and it counts; add it to neither
       and nothing here notices. The engine cannot name a dimension it has
       never been told about, which is the rule working rather than being
       enforced. */
    Object.keys(partyAxes || {}).forEach(a => {
      if (billAxes[a] == null || partyAxes[a] == null) return;
      counted++;
      score += (partyAxes[a] === billAxes[a]) ? 1 : -1;
    });
    return counted ? score / counted : 0;   // -1 .. +1
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
    if (s === "against") return "against";
    if (s === "for") return "for";
    return "mixed";          /* {for:n}, {forPct}, {free} — a split bench */
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
      st.scalars.party_loyalty = clamp(st.scalars.party_loyalty - cost.loyalty, 0, 100);
    }
    Object.keys(cost.capital).forEach(pid => {
      const before = st.capital[pid] || 0;
      const after = before - cost.capital[pid];
      st.capital[pid] = after;
      if (after < 0) {
        const overdrawn = Math.min(cost.capital[pid], -after);
        if (st.parties[pid]) st.parties[pid].loyalty = clamp(st.parties[pid].loyalty - overdrawn * 2, 0, 100);
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
  function divide(st, C, billId) {
    const chk = canDivide(st, C, billId);
    if (!chk.ok) return { ok: false, reason: chk.reason, result: null, paid: null, assent: null };
    /* House time, spent whether the bill carries or falls, and one of
       the day's divisions whichever way it goes. */
    spendSlots(st, 1);
    st.divisionsToday = (st.divisionsToday || 0) + 1;
    st.actedThisSitting = true;
    const b = C.billById[billId];
    const result = division(st, C, billId);     // whips still in place
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

  function grantSlot(st, C, billId) {
    if (slotsRemaining(st) < 1) return { ok: false, reason: "no slots left this session" };
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
    spendSlots(st, 1);
    st.grantsToday = (st.grantsToday || 0) + 1;
    st.actedThisSitting = true;
    (st.slotsGranted || (st.slotsGranted = [])).push(billId);
    /* Two sittings' notice. Long enough for the benches to be worked,
       short enough that the session can still hold a division. */
    if (bs.stage === DIVIDES_AT && bs.dividesOn == null) bs.dividesOn = st.sitting + 2;
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
      const pAbs = pKind === "abstain" ? Math.max(0, pSeats - pAye) : 0;
      const fAbs = fKind === "abstain" ? Math.max(0, fSeats - fAye) : 0;
      rows.push({
        party: pid,
        popularSeats: pSeats, popularAye: pAye, popularWhipped: wp.popular || 0,
        popularAbstain: pAbs, popularNay: Math.max(0, pSeats - pAye - pAbs),
        popularAbsent: 0, popularKind: pKind,
        functionalSeats: fSeats, functionalAye: fAye, functionalWhipped: wp.functional || 0,
        functionalAbstain: fAbs, functionalNay: Math.max(0, fSeats - fAye - fAbs), functionalKind: fKind,
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
        const spare = Math.max(0, r.functionalSeats - r.functionalAye - (r.functionalAbstain || 0));
        const take = Math.min(spare, left);
        if (!take) return;
        r.functionalAye += take;
        r.functionalLobbied = (r.functionalLobbied || 0) + take;
        r.functionalNay = Math.max(0, r.functionalSeats - r.functionalAye - (r.functionalAbstain || 0));
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
      other.popularNay -= n; other.popularAbsent = (other.popularAbsent || 0) + n;
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
                   absent: sum("popularAbsent"), paired: sum("popularAbsent") },
      functional:{ aye: funcAye, total: funcTotal, need: funcNeed, carries: funcCarries,
                   abstain: sum("functionalAbstain"), nay: sum("functionalNay"),
                   absent: 0 },
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
    if (v) plan[partyId] = v; else delete plan[partyId];
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
       which was Adaeze Fenwick — a sitting Commons Union minister. A
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
    t.delete("");
    return t;
  }

  function rollCall(st, C, billId, d) {
    d = d || division(st, C, billId);
    const chars = C.characters || [];
    /* seat name -> the cast member sitting for it, so a district row can
       be upgraded from a bare name in the roll to a person with an office. */
    const cast = {};
    chars.forEach(ch => { if (ch.seat) cast[ch.seat] = ch; });

    /* One set for the whole House, so two parties cannot seat the same
       placeholder and no placeholder can be a member who already exists. */
    const taken = namesTaken(C);

    const parties = d.rows.map(r => {
      const seats = [];

      /* district: a named member per seat, from the roll. */
      (C.constituencies || []).forEach(k => {
        const held = (st.roll[k.id] || {}).held || {};
        if ((st.roll[k.id] || {}).nonVoting) return;
        for (let i = 0; i < (held[r.party] || 0); i++) {
          const ch = cast[k.name];
          seats.push({ tier: "district", name: (ch && ch.name) || k.member,
                       seat: k.name, office: ch ? ch.office : null,
                       payroll: !!(ch && PAYROLL.indexOf(ch.office) >= 0) });
        }
      });

      /* list: the party's slate. Named from the pools, flagged as a
         placeholder, stable across saves. See placeholderName. */
      const listN = Math.max(0, r.popularSeats - seats.length);
      for (let i = 0; i < listN; i++)
        seats.push({ tier: "list", payroll: false, placeholder: true,
                     name: placeholderName(C, r.party + ":list:" + i, taken),
                     seat: null, listIndex: i + 1 });

      /* functional: named, with the register reference. */
      const fseats = [];
      (C.functional || []).forEach(fc => {
        (fc.members || []).forEach(m => {
          if (m.party !== r.party) return;
          const ch = cast[m.name];
          fseats.push({ tier: "functional", name: m.name, ref: m.ref,
                        seat: fc.name, office: ch ? ch.office : null,
                        payroll: !!(ch && PAYROLL.indexOf(ch.office) >= 0) });
        });
      });

      return { party: r.party, row: r,
               popular: assign(seats, r, "popular"),
               functional: assign(fseats, r, "functional") };
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
    ballotCarries:  (st, v) => !!st.ballot && st.ballot.carries === !!v,
    siInForce:      (st, v) => [].concat(v).every(k => st.instruments[k] && st.instruments[k].inForce),
    siNotMade:      (st, v) => [].concat(v).every(k => st.instruments[k] && !st.instruments[k].made),
    postVacant:     (st, v) => [].concat(v).every(k => st.cabinet[k] && !st.cabinet[k].holder),
    priceAbove:     (st, v) => Object.keys(v).every(k => st.prices[k] > v[k]),
    priceBelow:     (st, v) => Object.keys(v).every(k => st.prices[k] < v[k]),
    capitalAbove:   (st, v) => Object.keys(v).every(k => (st.capital[k] || 0) > v[k]),
    capitalBelow:   (st, v) => Object.keys(v).every(k => (st.capital[k] || 0) < v[k]),
    slotsLeft:      (st, v) => (st.slots.total - st.slots.used) >= v,
    /* Conditions are not under the twenty-verb cap (§15.5), so the world
       may be read in as many ways as content needs. */
    /* THE TRIGGERS FOR CHAPTERS THREE AND FOUR.

       §1.7 is LOCKED: chapters advance on a DECISION, so the engine must
       not move one itself. What it can do is let content see the two
       moments that were previously invisible, so an authored event can
       fire on them and advance the chapter in the ordinary way:

         { when:{ dissolved:true }, effects:[{chapter:3}] }
         { when:{ settled:true },   effects:[{chapter:4}] }

       `risesWithin` is for the run-up rather than the moment: an event
       that wants to fire in the last few sittings before the House goes
       to the country asks for it by number instead of guessing a sitting. */
    dissolved:      (st, v) => !!st.dissolved === !!v,
    settled:        (st, v) => {
                      /* content cannot reach checkSettlement's C, so this
                         reads the flag the engine leaves when one lands */
                      return !!st.settledAs === !!v;
                    },
    /* Which NON-TERMINAL tier resolved the crisis (Flash I): the election's
       chapter-three events read this to narrate the result. */
    resolvedIs:     (st, v) => st.resolvedAs === v,
    risesWithin:    (st, v) => st.sessionEnds != null &&
                      (st.sessionEnds - st.sitting) <= v,
    actorAbove:     (st, v) => Object.keys(v).every(id =>
                      (st.actors[id] || {}).standing > v[id]),
    actorBelow:     (st, v) => Object.keys(v).every(id =>
                      (st.actors[id] || {}).standing < v[id]),
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
                      (st.undertakings || []).some(u => u.id === id && u.state === "broken"))
  };

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

  const EFFECTS = {
    /* MOVE — one verb for every number that is clamp-and-add against a
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
          st.scalars[k] = clamp((st.scalars[k] || 0) + d, 0, 100); break;
        case "loyalty": {
          const t = st.currents[k] || st.parties[k];
          if (t) t.loyalty = clamp(t.loyalty + d, 0, 100);
          break;
        }
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
           beyond ±10 a sitting is a switch wearing a dial. */
        case "trend":
          st.trends = st.trends || {};
          st.trends[k] = clamp((st.trends[k] || 0) + d, -10, 10);
          break;
        /* No new verb: an actor's standing moves the way a party's loyalty
           does, which is what keeps EFFECTS at its twenty-one and off
           §15.5's line for a twenty-second time. */
        case "actor":
          if (st.actors[k])
            st.actors[k].standing = clamp(st.actors[k].standing + d, 0, 100);
          break;
        default:
          st.log.unshift({ sitting: st.sitting, text:
            "IGNORED: a move effect named no such target: " + key + "." });
      }
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
    si: (st, C, v) => [].concat(v).forEach(id => makeInstrument(st, C, id)),
    cabinet: (st, C, v) => Object.keys(v).forEach(post => {
      if (v[post] === null) vacate(st, C, post, "resigned");
      else appoint(st, C, post, v[post].holder, v[post].party);
    }),
    slots: (st, C, v) => {
      if (v.total != null) st.slots.total += v.total;
      if (v.refill) { st.slots.used = 0; }
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
      if (e.chapter != null && e.chapter !== st.chapter) return;
      if (e.once && fired) return;
      if (e.maxFires && fired >= e.maxFires) return;
      if (!matches(st, e.when)) return;
      out.push(e);
    });
    return out;
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

  function nextEvent(st, C) {
    /* Only entries that ARE an event. A pure-effects entry has already
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

    pool.sort((a, b) => (b.weight || 1) - (a.weight || 1) || (a.id < b.id ? -1 : 1));
    /* Ties used to break on id, which meant the same state always played
       the same sitting in the same order. They break on a draw now; the
       id ordering above still decides everything the draw does not, and
       a save with no seed cannot reach here because migrate() gives it
       the default. */
    const top = (pool[0].weight || 1);
    const tied = pool.filter(e => (e.weight || 1) === top);
    return tied.length > 1 ? tied[Math.floor(draw(st) * tied.length)] : pool[0];
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
      return STAGE_ORDER.indexOf(b.stage) >= STAGE_ORDER.indexOf(d.stage);
    }
    if (d.division) {
      const b = st.bills[d.division];
      return !!(b && b.lastDivision && (d.carried == null || b.lastDivision.carried === d.carried));
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
            out.push({ tone: good ? "good" : "bad",
                       text: stem + (band(d) ? ", " + band(d) : "") });
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
          out.push({ tone: v[sk] >= 0 ? "good" : "bad",
                     text: stem + (band(v[sk]) ? ", " + band(v[sk]) : "") });
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
        /* A number that moves and is not described renders as its own
           verb name — "signatures" — which teaches the player the
           engine's vocabulary instead of the world's. */
        case "signatures": out.push({
          tone: v <= 0 ? "good" : "bad",
          text: (v <= 0 ? "Thins the signatures against you"
                        : "Adds to the signatures against you") });
          break;
        case "slots": out.push({ tone: (v && v.total > 0) ? "good" : "plain",
          text: v && v.refill ? "Refills the order paper"
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
    apply(st, C, ch.effects);
    /* Answering the House is governing. The idleness drag is for a
       government that does nothing at all — not for one whose bills are
       stuck at a division that will not carry and whose only remaining
       move is the decision in front of it. */
    st.actedThisSitting = true;
    st.seen[event.id] = (st.seen[event.id] || 0) + 1;
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
    P.thermal = clamp(P.thermal + drift(P.thermal, 100 + pressure + relBump), 20, 400);

    /* substrate: cheaper the more of it is publicly held, dearer as thermal rises */
    const pub = st.law.substrate_public_share == null ? 0.35 : st.law.substrate_public_share;
    P.substrate = clamp(P.substrate + drift(P.substrate,
      70 + (1 - pub) * 60 + (P.thermal - 100) * 0.4), 20, 400);

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
    P.volume = clamp(P.volume + drift(P.volume,
      100 + (50 - st.scalars.solvency) * 0.28 + volBump), 20, 400);

    /* transit: launch windows and delta-v, and the subsidy the budget
       carries for the stations the traffic does not reach */
    const ts = st.law.transit_subsidy;
    const trBump = ts === "anchors" ? -8 : ts === "all" ? -14 : 0;
    P.transit = clamp(P.transit + drift(P.transit,
      100 - (st.scalars.solvency - 50) * 0.3 + trBump), 20, 400);

    Object.keys(P).forEach(k => {
      P[k] = Math.round(P[k] * 10) / 10;
      const h = st.priceHistory[k] || (st.priceHistory[k] = []);
      h.push(P[k]); if (h.length > 60) h.shift();
    });

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

    /* TRENDS APPLY AFTER THE MARKETS MOVE, so the same sitting shows both
       what the world did and what the government's earlier decisions are
       now leaning on, a little at a time. */
    Object.keys(st.trends || {}).forEach(k => {
      const d = st.trends[k];
      if (!d) return;
      st.scalars[k] = clamp((st.scalars[k] || 0) + d, 0, 100);
    });

    /* A METER THAT DRAGS ANOTHER (Flash I). Content declares the couplings
       in setup: while the source meter is above a line, its drag lands
       every sitting until somebody does something about it. The highest
       line that matches is the one applied — worse is worse, not
       worse-squared — and the wire says so once, when it starts. */
    const cps = (C.setup.couplings || [])
      .filter(cp => (st.scalars[cp.meter] || 0) > cp.above)
      .sort((a, b) => (b.above || 0) - (a.above || 0));
    if (cps.length) {
      const cp = cps[0];
      Object.keys(cp.drag || {}).forEach(k => {
        st.scalars[k] = clamp((st.scalars[k] || 0) + cp.drag[k], 0, 100);
      });
      const key = "coupling_" + cp.meter + "_" + cp.above;
      if (cp.mark && !st.flags[key]) { st.flags[key] = true; marks.push(cp.mark); }
    }

    /* Stations answer to the substrate price. A habitat that cannot pay does
       not economise — it sheds people, and the shed order says which. */
    const strain = (P.substrate - 100) / 100;
    if (Math.abs(strain) > 0.06) {
      C.stations.forEach(s0 => {
        const s = st.stations[s0.id];
        /* And a federation with no consumables margin cannot cushion the
           stations that depend on it, so the same price strain bites
           harder. consumables gated nothing before this; now it decides
           how much the exposed actually feel. */
        const cushion = 0.6 + (st.scalars.consumables / 100) * 0.7;
        const exposure = Math.max(0, 0.75 - s.closure) / cushion;
        const delta = Math.round(strain * exposure * s.population * 0.0012);
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
  /* The date the House sits for the nth time, counting the start date as
     sitting 1 if it is itself a sitting day. */
  function dateOfSitting(C, n) {
    const days = sittingDays(C);
    let d = parseDay((C && C.setup && C.setup.startDate) || "2287-01-01");
    let count = 0;
    for (let guard = 0; guard < 20000; guard++) {
      if (days.indexOf(d.getUTCDay()) >= 0) { count++; if (count >= n) return iso(d); }
      d = new Date(d.getTime() + DAY);
    }
    return iso(d);
  }
  /* The inverse, for putting a date back on the order paper. */
  function sittingOfDate(C, date) {
    const days = sittingDays(C);
    let d = parseDay((C && C.setup && C.setup.startDate) || "2287-01-01");
    const t = parseDay(date).getTime();
    let count = 0;
    for (let guard = 0; guard < 20000 && d.getTime() <= t; guard++) {
      if (days.indexOf(d.getUTCDay()) >= 0) count++;
      if (d.getTime() === t) return days.indexOf(d.getUTCDay()) >= 0 ? count : null;
      d = new Date(d.getTime() + DAY);
    }
    return null;
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
      tab = "pap";
      how = "Make the " + (C.instrumentById[dz.si].title || dz.si);
      focus = "si:" + dz.si;
    } else if (dz.bill && C.billById && C.billById[dz.bill]) {
      tab = "cham";
      how = "Carry the " + (C.billById[dz.bill].title || dz.bill);
      focus = "bill:" + dz.bill;
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
    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id];
      if (bs && bs.dividesOn != null && !bs.dead)
        add(bs.dividesOn, "division", b.title + " divides");
    });
    /* SUPPLY, ON THE CALENDAR FROM THE FIRST SITTING. Losing supply is the
       only loss a player can see coming for a whole session, and that is
       what makes it fair rather than punitive — so it is dated the day the
       House rises and sits there from the opening, not raised as a warning
       once it is too late to act. */
    if (!supplyCarried(st, C) && st.sessionEnds != null) {
      const sup = (C.bills || []).find(b => b.test === "supply" &&
        !((st.bills[b.id] || {}).dead));
      /* Its own kind, not "owed": an undertaking is a promise the player
         made and this is a requirement they did not choose. Two tests
         filter the calendar for owed and expect exactly the promises the
         player entered into, and they were right to. */
      if (sup) add(st.sessionEnds, "supply", sup.title + " must carry");
    }
    /* An undertaking counts down in `by`, and an explicit null means
       "before the House rises" — so that one lands on the last sitting
       of the session, which is where the author meant it. */
    (st.undertakings || []).forEach(u => {
      if (u.state !== "open") return;
      /* Where it is kept, and how: one helper, so the calendar, the
         undertakings panel and the order itself agree. */
      add(u.by == null ? st.sessionEnds : u.by, "owed", u.text,
          undertakingWhere(C, u));
    });
    /* A PRAYER WINDOW IS A DEADLINE. An order stands unless the House
       prays against it before the window closes, and until now that date
       existed in the state and nowhere the player could see it. */
    (C.instruments || []).forEach(si => {
      const s0 = st.instruments[si.id];
      if (s0 && s0.inForce && !s0.revoked && s0.prayerCloses != null)
        add(s0.prayerCloses, "prayer", "Last day to pray against " + (si.number || si.id));
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
    if (st.sessionEnds != null)
      add(st.sessionEnds, "rises", "The House rises \u2014 session " + st.session);
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
        sitting: n, sits: sits,
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
  const TAB_OF = { decision: "sit", division: "gov", vacancy: "gov",
                   owed: "sit", prayer: "pap", expected: "sit", rises: "sit",
                   slots: "gov" };
  const ORDER  = { sit: 0, gov: 1, pap: 2, orb: 3 };
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
    const toRise = st.sessionEnds != null ? st.sessionEnds - st.sitting : 99;
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
      const why = already ? "already in hand"
        : !matches(st, i.when) ? "not open to you"
        : (i.cost || 1) > left ? "no order-paper time left this session"
        : null;
      return { id: i.id, title: i.title, note: i.note || "",
               cost: i.cost || 1, tempo: i.tempo || [],
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
    const cost = (i.cost || 1) + (t.cost || 0);
    if (cost > st.slots.total - st.slots.used)
      return { ok: false, reason: "no order-paper time left this session" };
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
    const last = st.sessionEnds == null ? first + 12 : st.sessionEnds;
    if (on < first) return { ok: false, reason: "the House cannot divide before sitting " + first };
    if (on > last) return { ok: false, reason: "the House rises at sitting " + last };
    bs.dividesOn = on;
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

     A CAMPAIGN IS ONE PARLIAMENT AND ONE PARLIAMENT IS ONE SESSION
     (setup.sessionsPerParliament). At the end of it the House is
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
    const before = Object.keys(st.parties).reduce((m, p) =>
      (m[p] = partyTotal(st, p), m), {});
    const res = generalElection(st, C);
    const after = Object.keys(st.parties).reduce((m, p) =>
      (m[p] = partyTotal(st, p), m), {});
    const mine = st.playerParty;
    st.dissolved = { at: st.sitting, session: st.session,
                     before: before, after: after,
                     held: after[mine] || 0, was: before[mine] || 0 };
    st.log.unshift({ sitting: st.sitting,
      text: "The House is dissolved. The Commonwealth goes to the country." });
    st.wire.unshift({ sitting: st.sitting, text: "PARLIAMENT DISSOLVED" });
    return res;
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
    if (st.dissolved) return { over: true, kind: "election", result: st.dissolved };
    const lost = checkLoss(st, C);
    if (lost.lost) return { over: true, kind: "loss", reason: lost.reason };
    const s0 = checkSettlement(st, C);
    /* A non-terminal settlement resolves the crisis and the run goes on to
       the election; a terminal one is the ending. The reader is unchanged;
       what changed is whether the record is also the last page (Flash I). */
    if (s0) return { over: s0.terminal !== false, kind: "settlement", settlement: s0 };
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
      fell.push(b.title);
    });

    /* Owed "before the House rises" — by:null — comes due here rather
       than on a sitting number the author had to guess. */
    (st.undertakings || []).forEach(u => {
      if (u.state !== "open" || u.by != null) return;
      breakUndertaking(st, C, u, "prorogation");
    });

    st.session += 1;
    st.slots.used = 0;
    st.slotsGranted = [];
    st.sessionEnds = st.sitting + (C.setup.sittingsPerSession || 24);
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
    if (slotsRemaining(st) < 1)
      return { ok: false, reason: "no order-paper time left this session", noTime: true };

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

  function advance(st, C) {
    st.sitting += 1;
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
        Object.keys(idle.drag || {}).forEach(k => {
          st.scalars[k] = clamp((st.scalars[k] || 0) + idle.drag[k], 0, 100);
        });
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
    if (C && st.sessionEnds != null && st.sitting > st.sessionEnds && !st.dissolved) {
      /* The House rises. Whether it meets again is the whole question. */
      if (lastSession(st, C)) dissolve(st, C);
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
    const found = (C.settlements || [])
      .filter(s0 => matches(st, s0.when))
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
    /* A settlement that has landed is recorded so CONTENT can see that one
       has, through the `settled` condition, without the engine naming
       which — §3.5.1 rule 2 still holds and nothing here reports progress
       toward one.

       TERMINAL OR NOT (Flash I). By default a settlement ends the run.
       `terminal:false` resolves the CRISIS, not the CAMPAIGN: it is
       recorded in `resolvedAs` instead, so the `settled` condition stays
       quiet and the run continues to the election, where content reads
       which tier landed through the `resolvedIs` condition. */
    if (found.length) {
      if (found[0].terminal === false) st.resolvedAs = found[0].id;
      else st.settledAs = found[0].id;
    }
    return found.length ? found[0] : null;
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
    if (confidence(st) < majority(st)) return { lost: true, reason: "confidence" };
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
    STATE_VERSION, newGame, migrate, save, load, chapters,
    confidence, majority, chamberTotal, popularTotal, functionalTotal,
    partyPopular, partyFunctional, partyTotal,
    division, reported, ballot, resolveDue, pairable, setPairs, clearPairs, benches, matches, apply, eligible, nextEvent, choose, advance, tick, checkLoss, checkSettlement,
    dateOfSitting, sittingOfDate, deadlines, calendar, today, business,
    initiatives, take, setDivision,
    apportionment, tierCheck, DIVIDES_AT, STAGE_ORDER,
    seedRoll, syncRoll, reconcile, partyDistrict,
    lastReconcile: () => lastReconcile, nationalShares, vacantSeats, seatsFor,
    vacateSeat, crossFloor, byElection, generalElection, shares, swungShares,
    divisorAllocate,
    assent, presidentDecides, referralRisk, reviewReturns,
    canMake, makeInstrument, prayAgainst, prayerForecast, revokeInstrument,
    instrumentsInForce, appoint, vacate,
    whippable, setWhip, whipCost, payWhips, clearWhips, divide, grantSlot, STAGE_ORDER,
    rollCall, lobbyable, setLobby, clearLobby, lobbyCost, payLobby, lobbiedSeats,
    clausesOf, clausePlan, clauseCost, setClause, clauseEffects,
    domainTest, functionalByConstituency, lobbiedByConstituency, isSupply,
    lastSession, dissolve, checkEnd, supplyCarried, supplyPending,
    settle, outstanding, describe, grave, choiceOpen, openChoices, draw,
    undertakingWhere,
    snapshot, changes,
    prorogue, canDivide, candidates, vacancies, fillPost,
    federalSuspended,
    CONDITIONS, EFFECTS
  };
})();

if (typeof module !== "undefined") module.exports = Engine;
