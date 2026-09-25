/* SETUP — the opening state. Change a number here and the game starts differently. */
const SETUP = {
  startDate: "2080-04-11", session: 4, sitting: 1,
  /* THE HOUSE DOES NOT SIT EVERY DAY, and the days it does are what turn a
     sitting number into a date the player can point at on a calendar.
     0 is Sunday. Four days in seven, so a 24-sitting session runs six weeks
     and a three-session parliament is about four months. */
  sittingDays: [1, 2, 3, 4],
  pm: "flash", playerParty: "cu",
  coalition: ["cu","psa","rv"],
  /* THE INDEPENDENTS HOLD IT UP. Six district members with no whip, no
     leader and no caucus position, which is why this is confidence and
     supply and not a coalition: there is nobody to negotiate with, only six
     people. 136 + 6 = 142 against a majority of 141 — a working majority of
     one, where it used to be nil. */
  confidenceSupply: ["ind"],
  /* THE PRODUCTIVE ECONOMY (bible §7.10). The prices are the cost of
     existing; this is what the Commonwealth makes, sells and employs.
     participation is a per cent of adults in paid work, trade an index
     at 100 where above is surplus, private the share of the economy in
     private hands — excluding the eleven consortiums whose control
     carries a parliamentary vote and which therefore never float. */
  /* THE YEARS BEFORE THE GAME (bible §7.10).

     The live curves are per SITTING, and a sitting is a day with four of
     them a week, so the sixty-point window the engine keeps is about fifteen
     weeks. That is the right resolution for a price and the wrong one for an
     economy: nothing structural happens inside fifteen weeks, so the chart
     opened on a single point and said nothing about where any of it came
     from.

     These are ANNUAL readings, 2073 to 2080, and the last of each is the
     opening value so the two scales join rather than contradicting. They are
     authored canon and they say what the premise already implies:

       participation falls, 45 to 39, because the threshold has stood at 168
         hours throughout and instance-hours have been quietly replacing
         waged work. This is the argument the divergence bill is about,
         finally visible as a line.
       trade rises, 88 to 100, on compute. It is the one thing this economy
         makes that Earth and the belt will buy.
       the prices are an index rebased to 100 at the opening, so a figure
         below 100 is a year when the thing was CHEAPER. Thermal has risen
         hardest, which is why the margin is 17 and why Ember Ridge is three
         days from a shed order.
       the reserve drains, 78,000 to 52,000 MW-years. Four administrations
         spent it and none of them replaced it.

     The engine reads this and never writes it: it is the record, and the
     record does not change. */
  history: {
    from: 2073, to: 2080, unit: "year",
    participation: [45, 44.2, 43.5, 42.4, 41.6, 40.8, 39.9, 39],
    trade:         [88, 90, 91.5, 94, 95.5, 97, 98.5, 100],
    thermal:       [71, 74, 78, 83, 88, 92, 96, 100],
    substrate:     [78, 81, 84, 88, 91, 94, 97, 100],
    volume:        [85, 87, 89, 91, 94, 96, 98, 100],
    transit:       [92, 93, 95, 96, 97, 98, 99, 100],
    solvency:      [78000, 74000, 70500, 66000, 62000, 58500, 55000, 52000]
  },

  economy: { participation: 39, trade: 100, private: 0.72 },

  /* No `party_loyalty`: the meter is the government party's currents,
     member-weighted (content/parties.js), which open at 48. It was set here
     to 38 beside them and the two never met. */
  scalars: { public_standing:44, consumables:71,
             thermal_margin:17, solvency:52000,
             /* Flash I's own meters. legitimacy: the government being
                believed, at home. friction: Earth's governments and banks
                against the Commonwealth — higher is worse. */
             legitimacy:48, friction:25 },
  /* HOW OFTEN THE CHARTER LETS A GOVERNMENT APPOINT TO ONE BOARD
     (bible §4.6.4). Two is a fight; unlimited is a cheat code. */
  boardCap: 2,
  /* WHO LENDS TO THE COMMONWEALTH, AND ON WHAT TERMS (named creditors, 23
     Sep; the two standing lenders, 24 Sep). The engine keeps what is owed to
     each, by id, and reads everything else from here. An effect moves a
     balance with {move:{"debt.<id>": n}}, and the reserve's side of a loan
     is its own move, because a loan is the debt AND the money.

     `name`        who is owed, and `label` a shorter name for the account
     `rate`        `fixed`, or a `base` (plus `perFriction` a point of
                   friction, if given) plus every one of its `steps` whose
                   `when` holds now. Steps are cumulative, the way a margin
                   grid reads, and each `label` says in words when it applies
     `cap`         the commitment: how far this lender will go
     `limits`      clauses that lower the cap while their `when` holds: a
                   number (`cap`), or `suspends` a tag, which takes out the
                   commitments of every party carrying it. The lowest binds,
                   and `why` is the refusal the account prints
     `drawable`    true: the Commonwealth may draw on it, from the Economy
                   tab, `utilisation` at a time, for `slots` of order-paper
                   time (1 if not given)
     `onDraw`      what a drawing does besides the money, in effects, and
     `drawNote`    the same in words, for the confirmation
     `log`/`wire`  the record's line and the wire's, {n} and {rate} filled
     `home`        a lender inside the Commonwealth, read apart from Earth's
                   by the Underwriters' outlook; `outlook.owed_<id>` is what
                   they say about a lender while it is owed
     `note`        what the account says under the figure, and `short` a
                   one-line form of it where the note is long
     `serviced`    false: the rate is folded into the sum owed at the term,
                   and nothing is paid out of the reserve each sitting
     `repayable`   false: not paid down across the counter on the Economy
                   tab, because its own terms (an initiative, a call) say how
     `parties`     who is in it and for how much (`prose`: the name as a
                   sentence carries it). The commitments sum to the cap, which
                   test.js holds
     `terms`       the facility as a document, for its Concordance article
                   (`lender_<id>`), which js/encyclopedia.js generates

     A campaign adds its own lenders in its administration's `setup`, which
     merges one level deep: Flash I's emergency facility is there. */
  lenders: {

    /* EARTH'S BANKS: A SYNDICATED STANDBY FACILITY. Signed in March 2078,
       when the reserve had fallen for five years running and the Treasury
       wanted a backstop it did not mean to use; undrawn when the campaign
       opens, which is why the Commonwealth owes nothing. The shape is a
       sovereign revolving facility as Earth's banks write one: arrangers,
       an agent, a syndicate, a margin grid that ratchets with the quarrel,
       a sanctions clause that suspends the commitments of lenders whose own
       governments are sanctioning the borrower, and one financial covenant.

       The grid's steps sit on the friction couplings' own lines (40, 65,
       85) so the account and the couplings agree about when the quarrel has
       changed. The European lenders' twenty thousand go when the sanctions
       regime is in force; the whole syndicate stops at the blockade. */
    earth: {
      name: "Earth's banks", facility: "the Standby Facility",
      drawable: true, utilisation: 8000,
      cap: 60000,
      rate: { base: 5, steps: [
        { when: { scalarAbove: { friction: 40 } }, add: 1.25,
          label: "while Earth's sanctions regime is in force" },
        { when: { scalarAbove: { friction: 65 } }, add: 2.25,
          label: "while Earth's banks are pricing the Commonwealth's risk" },
        { when: { scalarAbove: { friction: 85 } }, add: 3.5,
          label: "under a blockade" },
        { when: { scalarBelow: { solvency: 10000 } }, add: 2,
          label: "while the reserve is under the covenant, as default interest" },
        /* A DECLARED DEFAULT. A campaign declares one by setting the flag
           (Flash I's is the expropriation clause, when the Works is annexed
           with its bonds unpaid). Default interest is charged once: this
           step stands aside while the covenant's own is running. */
        { when: { flags: ["standby_default"], scalarAbove: { solvency: 9999 } }, add: 2,
          label: "while an event of default is declared, as default interest" },
        { when: { flags: ["standby_waiver"] }, add: 0.5,
          label: "since the syndicate waived an event of default" } ] },
      limits: [
        { when: { scalarAbove: { friction: 40 } }, suspends: "eu",
          why: "the sanctions clause has suspended the European lenders' commitments" },
        { when: { scalarAbove: { friction: 85 } }, cap: 0,
          why: "the sanctions clause has suspended every lender's commitment" },
        { when: { scalarBelow: { solvency: 10000 } }, cap: 0,
          why: "the reserve is under the covenant, and the agent has stopped the drawing" },
        { when: { flags: ["standby_default"] }, cap: 0,
          why: "the agent has declared an event of default and funds no drawing until it is cured" } ],
      onDraw: [ { move: { friction: 3, legitimacy: -2 } } ],
      drawNote: "Earth's governments read a drawing as a political act: " +
        "friction with Earth rises, and the government's legitimacy falls.",
      log: "Drew {n} MW-years on the Standby Facility from Earth's banks, at {rate} per cent.",
      wire: "COMMONWEALTH DRAWS {n} ON EARTH STANDBY FACILITY AT {rate} PER CENT",
      note: "the Standby Facility",
      parties: [
        { name: "Alphabet-JPMorgan Omni", seat: "New York", role: "coordinator, bookrunner and agent", commitment: 12000 },
        { name: "HSBC Standard Chartered", seat: "London", role: "mandated lead arranger", commitment: 10000 },
        { name: "Mitsubishi UFJ Mizuho", seat: "Tokyo", role: "mandated lead arranger", commitment: 10000 },
        { name: "BNP Paribas Société Générale", seat: "Paris", role: "mandated lead arranger", commitment: 8000, tags: ["eu"] },
        { name: "Deutsche Commerzbank", seat: "Frankfurt", role: "lender", commitment: 7000, tags: ["eu"] },
        { name: "ING Rabobank", seat: "Amsterdam", role: "lender", commitment: 5000, tags: ["eu"] },
        { name: "Itaú Bradesco", seat: "São Paulo", role: "lender", commitment: 4000 },
        { name: "KCB Equity Group", seat: "Nairobi", role: "lender", commitment: 4000 } ],
      terms: {
        title: "The Standby Facility", partiesHead: "The syndicate",
        see: ["commonwealth", "lender_underwriters"],
        kind: "a syndicated standby credit facility", type: "syndicated standby facility",
        borrower: "the Circumterrestrial Commonwealth, acting by the Treasurer",
        signed: "14 March 2078", maturity: "14 March 2083",
        reference: "3.25 per cent, the lending banks' overnight reference rate",
        margin: "1.75 per cent",
        summary: "It was signed in March 2078, after five years in which the " +
          "Commonwealth met its deficits from the reserve, as a backstop the " +
          "Treasury did not intend to draw.",
        sections: [
          { h: "Drawing", body:
            "The Commonwealth draws on the facility by a utilisation request " +
            "from the Treasurer to the agent, in amounts of 8,000 MW-years. " +
            "Each drawing is announced to the House. Amounts drawn may be " +
            "repaid at any time without penalty and drawn again, and all " +
            "amounts outstanding fall due at final maturity." },
          { h: "Covenants", body:
            "The Commonwealth undertakes to keep its reserve at or above " +
            "10,000 MW-years while any amount is drawn. The facility carries a " +
            "negative pledge, a pari passu clause and a cross-default clause in " +
            "the usual form, and an expropriation clause under which the taking " +
            "of an Earth-registered company's property without compensation is " +
            "an event of default." },
          { h: "Sanctions", body:
            "A lender is not obliged to fund a drawing that its own government's " +
            "sanctions forbid. The European lenders' commitments, 20,000 " +
            "MW-years between them, are suspended while the European Union's " +
            "measures against the Commonwealth are in force." },
          /* live: these appear when a campaign declares a default or buys a
             waiver, and say nothing about which campaign it was */
          { h: "Event of default", when: { flags: ["standby_default"] }, body:
            "The agent has declared an event of default under the facility. " +
            "Until it is cured, the lenders fund no drawing and default " +
            "interest of 2.00 per cent is charged on amounts outstanding." },
          { h: "Waiver", when: { flags: ["standby_waiver"] }, body:
            "The syndicate has waived an event of default under the facility, " +
            "for a fee and an increase of 0.50 per cent in the margin for the " +
            "rest of its term." } ] } },

    /* THE CIRCUMTERRESTRIAL UNDERWRITERS: COMMONWEALTH RESERVE NOTES. The
       lender at home. The Underwriters are a market and not a firm (bible
       §7.5.2): 46 syndicates and 94 mutuals trade on it, and 140 of them
       elect Insurance and Underwriting's three seats (content/functional.js).
       Insurers hold reserves against claims, and those reserves are quota;
       the Treasury borrows them by placing notes, through the market's own
       Central Fund, with the Reserve Bank as registrar.

       Priced on continuation, not on the quarrel: the coupon steps up as the
       thermal margin narrows, which is the Underwriters' own reading of
       whether the borrower keeps running, and no new notes are placed into
       a cascade. No friction, because Earth is not a party to it; the price
       is at home, in the standing of a body that votes three seats. */
    underwriters: {
      name: "the Underwriters", facility: "Commonwealth Reserve Notes",
      drawable: true, utilisation: 6000, home: true,
      cap: 36000,
      rate: { base: 3.5, steps: [
        { when: { scalarBelow: { thermal_margin: 15 } }, add: 1,
          label: "while the federal thermal margin is under 15" },
        { when: { scalarBelow: { thermal_margin: 10 } }, add: 1.5,
          label: "while it is under 10" },
        { when: { scalarBelow: { thermal_margin: 6 } }, add: 2,
          label: "while it is under 6" } ] },
      limits: [
        { when: { scalarBelow: { thermal_margin: 6 } }, cap: 0,
          why: "the Underwriters place no notes while the thermal margin is under six" } ],
      onDraw: [ { move: { "actor.underwriters": 3, party_loyalty: -1 } } ],
      drawNote: "The Underwriters' standing with the government rises. The " +
        "party's own benches like borrowing from the insurers less.",
      log: "Placed {n} MW-years of Commonwealth Reserve Notes with the Underwriters, at {rate} per cent.",
      wire: "TREASURY PLACES {n} OF RESERVE NOTES WITH UNDERWRITERS AT {rate} PER CENT",
      note: "Commonwealth Reserve Notes",
      parties: [
        { name: "Habitat Owners' Mutual Protection and Indemnity Association", seat: "The Bourse", role: "lead manager", commitment: 8000,
          prose: "the Habitat Owners' Mutual Protection and Indemnity Association" },
        { name: "Coldwater Underwriting Agency, for Syndicate 118", seat: "The Bourse", role: "lead manager", commitment: 7000 },
        { name: "Orbit Provident Mutual Assurance Society", seat: "Anchorage", role: "co-manager", commitment: 6000 },
        { name: "First Circumterrestrial Assurance", seat: "The Bourse", role: "co-manager", commitment: 5000 },
        { name: "Aldous Pryce Syndicate 2207", seat: "The Bourse", role: "placee", commitment: 4000 },
        { name: "Far Band Mutual Assurance Association", seat: "The Rotunda", role: "placee", commitment: 3000 },
        { name: "The Underwriters' Central Fund", seat: "The Bourse", role: "placee", commitment: 3000 } ],
      terms: {
        title: "Commonwealth Reserve Notes", plural: true, partiesHead: "The placees",
        see: ["underwriting", "lender_earth", "commonwealth"],
        kind: "a programme of Treasury notes placed with members of the Circumterrestrial Underwriters",
        type: "Treasury notes, privately placed",
        borrower: "the Circumterrestrial Commonwealth, acting by the Treasurer",
        signed: "2 September 2079", maturity: "three years from each issue",
        registrar: "the Reserve Bank of the Circumterrestrial Commonwealth",
        summary: "The programme was agreed in September 2079 between the " +
          "Treasury and the Council of the Underwriters, and no notes had been " +
          "issued under it by April 2080.",
        sections: [
          { h: "Issue", body:
            "Notes are issued in series of 6,000 MW-years and placed with the " +
            "members listed below in proportion to their commitments. Each " +
            "series runs for three years and may be redeemed early at par. The " +
            "Reserve Bank keeps the register of holders and pays the coupon." },
          { h: "The coupon", body:
            "The coupon is set by the Underwriters' continuity rating of the " +
            "Commonwealth, which follows the federal thermal margin. It is 3.50 " +
            "per cent at the rating the programme opened on, and it steps up " +
            "when the rating falls. The members place no new notes while the " +
            "margin is below the level at which their own schedules treat a " +
            "cascade as likely." },
          { h: "The Hull Club", body:
            "The largest holder, the Habitat Owners' Mutual Protection and " +
            "Indemnity Association, is known on the Bourse as the Hull Club. It " +
            "was founded by habitat operators to insure one another against " +
            "bulkhead failure, and it is the mutual from which the Underwriters' " +
            "market grew." } ] } }
  },

  /* WHAT THE UNDERWRITERS SAY (bible §7.5.2 — the only party with accurate
     numbers on everything). The engine finds which of these apply and says
     nothing itself; every word here is in the prose file and can be
     rewritten without touching a line of code.

     One reading each, in the register of somebody who prices risk for a
     living: the fact, then what it means for the next few sittings. No
     advice the player could not have worked out, because the point is that
     they did not have to. */
  outlook: {
    reserve_gone: { text:
      "The reserve is exhausted. Nothing is left to appropriate and nothing " +
      "is left to borrow against; the next shortfall is met by shedding load, " +
      "which means by shedding people." },
    reserve_thin: { text:
      "At the present rate of loss the reserve is gone inside a year. There is " +
      "time to raise a rate or cut a line, and there will not be time twice." },
    reserve_deep: { text:
      "The reserve is deep enough to carry a bad session. It is also deep " +
      "enough to be noticed by anybody arguing for a line the government has " +
      "refused to fund." },
    receipts_short: { text:
      "Outgoings exceed receipts. The gap is met from the reserve every " +
      "sitting, whether or not anybody votes on it." },
    receipts_cover: { text:
      "Receipts cover what the government is spending and add to the reserve. " +
      "That position holds while the prices hold, and the prices are set by " +
      "legislation." },
    debt_none: { text:
      "The Commonwealth owes nothing. Everything it holds is its own, which is " +
      "a stronger position at a negotiation than it looks on a ledger." },
    debt_light: { text:
      "The debt is small enough to service out of receipts." },
    debt_heavy: { text:
      "Servicing the debt is now a line of the budget of its own." },
    owed_underwriters: { text:
      "The coupon on the Underwriters' notes follows the thermal margin, so " +
      "the notes cost more when everything else does." },
    rate_cheap: { text:
      "Earth is lending at a rate that assumes the quarrel is temporary." },
    rate_dear: { text:
      "Earth is charging for the quarrel. The rate is not a judgement about " +
      "whether the Commonwealth can pay; it is a judgement about whether it " +
      "will still be on speaking terms when the payment falls due." },
    prices_falling: { text:
      "The cost of existing is falling. Somebody is being paid less for " +
      "something, and they will say so before the session rises." },
    prices_steady: { text:
      "The four prices are close to where they opened. Nothing the government " +
      "has done has reached a household yet." },
    prices_rising: { text:
      "The cost of existing is rising across all four goods. A household " +
      "notices thermal first, because it is in every other price." },
    prices_spiking: { text:
      "The cost of existing has risen sharply. At this level the question " +
      "stops being economic: substrate rent is the price of continuing to be " +
      "a person, and a register of people who cannot pay it is a political " +
      "document." },
    volume_forgone: { text:
      "Volume is the largest base and the one being taxed least. A levy on " +
      "position inside a habitat has nowhere to be passed on to, so it is the " +
      "only rate that raises revenue without raising the cost of living. " +
      "Every Single Tax member in the House knows this figure." }
  },
  law: { divergence_threshold_hours:168, civic_clock_minimum:0,
         suspension_debt_accrual:true, substrate_public_share:0.35, shed_order_authority:"engineering_authority",
         /* THE APPROPRIATION'S FINGERPRINT ON THE MARKET (design/13 §2.3,
            design/28 §4). Each clause of the budget sets one of these, and
            the tick reads them where it used to read a scalar alone: the
            four prices are legislative outputs, and the appropriation is
            the legislation. Levels are the clause levels' own words. */
         thermal_release:"steady", capital_works:"none", transit_subsidy:"none",
         /* WAYS AND MEANS (bible §7.3). The four bases the Commonwealth
            taxes — volume, thermal quota, substrate-hours, mass to orbit —
            each at a rate the appropriation sets. Levels: none | low |
            standard | high. At standard on all four the state raises
            exactly what the appropriation's own defaults cost. */
         rate_volume:"standard", rate_thermal:"standard",
         rate_substrate:"standard", rate_transit:"standard",
         /* The list side of the tier ratio (bible 4.4). The district side
            was a law here too, 140, which nothing read: the district tier
            is the roll's own count of voting seats (content/constituencies.js),
            and a second copy of it could only disagree (design/34). */
         tier_ratio_list:100, threshold_pct:4,
         /* Bible 4.10: the divisor is a bill, not a constant. D'Hondt favours
            large parties, Sainte-Lague small ones, and the two tiers are two
            separate fights. Values: "dhondt" | "sainte_lague". */
         /* Districts are single-member and returned by first past the post,
            so no divisor applies: highest averages over one seat IS plurality.
            The value is kept for the editor and for any future bill that
            merges seats back into multi-member districts. */
         district_divisor:"fptp", list_divisor:"dhondt" },
  /* THE CIVIC CLOCK (bible 6.3), at a minimum of 1 (real time): what the
     subsidy costs the reserve a sitting, and the points it adds to the
     thermal price's target. Scaled by the minimum the law sets. Keeping
     560,000 slow-running minds at real time is expensive and it is heat. */
  civicClock: { costPerSitting: 500, heat: 6 },
  /* SUSPENSION, WITH THE DEBT PAUSED (bible 6.6). Restorations run this
     much faster and suspensions this much more often than with the debt
     accruing, which is the status quo and the calibration. */
  suspension: { pausedRestore: 1.5, pausedShed: 1.2 },
  divisionsPerSitting: 2,
  /* AND HOW MANY MEASURES THE HOUSE TAKES A DAY. Six slots spendable on
     sitting one made the session budget a lump sum; order-paper time is
     the pacing instrument (§7.7), so grants are capped per sitting as
     divisions are. */
  grantsPerSitting: 2,
  /* THE PARLIAMENT ACT NUMBER. Supply answers to the elected benches, but a
     functional bench that votes it down delays it this many sittings -- paid
     in the one currency 7.7 says cannot be topped up. They may hold up the
     budget; they may not stop it. */
  supplyDelaySittings: 3,
  slotsPerSession: 6,

  /* HOW FAST A PRESSURE ABATES, in sittings per step toward zero.
     A trend applied for ever is a doom clock rather than a lean: the
     annexation line used to end at friction 100 because {trend.friction:+3}
     was never taken off by anything. At four, a +3 lean delivers about
     twenty-four points over twelve sittings and then stops. 0 turns decay
     off and restores the old behaviour. */
  trendDecay: 4,

  /* HOW LONG THE CAMPAIGN RUNS, in sittings after the writs go out.
     Chapter three fires one prologue a sitting and the COUNT is the last of
     them, so this is really "how many beats the ending is allowed". It was
     hard-coded at twelve in the engine, which meant an author adding beats
     would have pushed the count past the backstop and ended the run without
     it — test.js now asserts the chain fits, so raise this when you add to
     chapter three rather than discovering it in play. */
  campaignSittings: 12,
  /* WHICH SESSION THIS IS. Bible §11.1: the campaign opens in Session 4
     of a parliament about two years old. It was typed into the engine. */
  session: 4,
  /* HOW LONG A SITTING PERIOD RUNS, in sittings. The House rises at the end
     of each: order-paper time refills, because it is allotted per period.
     Bible 7.7 calls order-paper time the currency that cannot be topped up
     — this is the period it cannot be topped up WITHIN. */
  sittingsPerPeriod: 16,
  /* A RUN IS ONE SESSION OF THREE SITTING PERIODS, with a recess between
     them (bible §1.8), and the session is the parliament's last: when it
     ends the House is dissolved and the count ENDS THE RUN. Nothing
     happens after it (design/32, "canon decided here"; bible §1.7).

     HOW IT GOT HERE, measured rather than argued. One session of
     twenty-four ended the run at about sitting 25, met about 29 events
     against §1.7's budget of 41-51, reached 48% of the authored set, and
     stopped twenty sittings before the Flash I ending could land. Three
     blocks of sixteen run about 50 sittings and meet about 43. Two of
     twenty-four measured the same length and lost a run to a cascade; more
     order-paper time per block made runs shorter and losses commoner,
     because supply is carried ONCE and the blocks after it keep all six
     slots. The squeeze was solved by blocks, not by slots.

     WHY PERIODS AND NOT SESSIONS (22 Sep 2026, the author's call). For a
     day the three blocks were SESSIONS, and a session's end kills every
     bill not carried and calls in every promise owed "before the House
     rises". Real procedure does that at prorogation, not at a recess; the
     prose was written for a run that is one session, so eighty-one
     passages saying "this session" or "the next session" meant sixteen
     sittings instead of the parliament; and the emergency loan, whose
     promise has no way to be kept, broke at the first rise mid-run when
     it was written to come due at the end. Measured with the settlement
     families separated, periods and sessions play almost identically. */
  periodsPerSession: 3,
  sessionsPerParliament: 1,
  /* HOW LONG A RECESS LASTS, in calendar days (design/37 D11). The House
     rose on a Wednesday and sat again on the Thursday. Fourteen days is two
     weeks away from the chamber between sitting periods, the shape of a
     Westminster Easter or Whitsun recess, and it moves the count from
     mid-July to early August. Nothing is counted in a recess: no sitting,
     no price tick, no event. 0 restores the contiguous calendar. */
  recessDays: 14,
  /* opening ledger. Positive means they owe you. */
  capital: { psa: 2, rv: -3, upl: 0, geo: 1 },
  president: { id:"tenaya", relationship:22,
               powers:["dissolution","formation","referral","appointments"] },
  /* leadershipChallenge is the loyalty floor at which a ballot becomes
     unwinnable and the government falls. ballot is the number of signatures
     that forces one (design/08 §2): below it the challenger is gathering,
     above it the caucus divides. */
  /* THE LEADERSHIP (bible §3.5). `signsAt`: a member asked to sign the
     paper signs at or above this willingness and refuses below it (a
     member's willingness is 100 less their current's loyalty, less 12 on
     the payroll, plus 10 for a grievance). `refusalLoyalty`: what a refusal
     to the Prime Minister's face adds to that member's current.
     `winBackBelow`: a member who has signed can be won back, for a slot and
     a promise, only while their willingness is under this. */
  /* PARTNERS (design/38 §3). A coalition or confidence-and-supply partner
     whose loyalty falls to `partnerLeaves` walks out; one that recovers to
     `partnerReturns` before the writs comes back. When the government no
     longer commands a majority the opposition tables a motion
     `motionAfter` sittings out, and the House decides. Measured across the
     seven playtest strategies before this: the New Progressive Party's
     lowest loyalty was 12 in one and 28 to 36 in the rest, the CDA's 39 to
     54, the independents' 66; so a partner walks out when it has been
     treated badly all session, and not otherwise. At 20 the NPP walked at
     sitting 13 after two hostile answers in three sittings; at 15 it takes
     three. Offering terms (+16) from the line brings it back. */
  thresholds: { leadershipChallenge: 15, ballot: 12, signsAt: 50, refusalLoyalty: 2,
                winBackBelow: 75, partnerLeaves: 15, partnerReturns: 30, motionAfter: 3 },
  /* The event content wants when a partner walks out; the engine names none. */
  onPartnerWithdraws: "partner_walks",
  /* AN ENDING MUST BE CARRIED (design/26 #91). No settlement before this
     sitting, whatever the meters say: without the floor the crisis resolved
     at sitting 7 on one play policy and 13 on another, which is a third of
     the session spent deciding a run the player had not yet governed. The
     tiers are separately gated on the crisis flags they follow from. */
  settlementFloorSittings: 15,
  /* A SEEDED LEAN ON THE EVENT POOL'S ORDER. Each openable event gets a lean
     of 0..n, deterministic from its id and the save's seed, added to its
     weight for selection only. Without it the steep top of the pool plays the
     same dozen events every run and fifteen events that are eligible at every
     sitting never win once. Same seed, same run, so the checks hold. Set 0 to
     order the pool by weight alone again. */
  weightJitter: 14,
  /* HOW MUCH AN EVENT GAINS FOR EACH SITTING IT WAITS in the pool unchosen
     (design/38 §4). Off, on the measurement. Across eight strategies and
     five seeds, aging at 3 left each run's variety where it was (35.1
     distinct events against 35.4), doubled the median wait from first
     eligible to firing (8 sittings to 17), made runs more alike (79 events
     reached across all forty against 70), and still never fired
     fa_conciliate. The pool is not badly ordered, it is over-subscribed:
     about twenty events eligible a sitting for one slot. Question Time
     every eight sittings instead of four did what aging could not. Worth
     turning on in a campaign whose pool is thin. */
  ageWeight: 0,

  /* THE METER PANEL. Which numbers the standing-indicators panel shows, in
     what order, and which way is good — content declares it, so a campaign
     shows the meters IT is about. Flash I is a foreign-affairs campaign and
     diplomatic friction sits beside the rest; a campaign about something
     else need not give it a column at all, and needs no engine change to
     drop it. `soft` is where the bar turns amber; `invert` is for a meter
     where HIGH is bad; `max` is the bar's full scale where a meter is not
     nought-to-a-hundred (solvency is a quantity, design/28 phase 4), and
     `good` is where the bar turns green if not the default two-thirds.
     `fatal` reads the engine's own threshold where one exists. */
  meters: [
    { k:"party_loyalty",   label:"Party loyalty",       soft:25 },
    { k:"public_standing", label:"Public standing",     soft:20 },
    { k:"consumables",     label:"Consumables",         soft:25 },
    { k:"thermal_margin",  label:"Thermal margin",      soft:12 },
    { k:"solvency",        label:"Sovereign solvency",  soft:15000, max:100000 },
    { k:"legitimacy",      label:"Legitimacy",          soft:30 },
    { k:"friction",        label:"Diplomatic friction", soft:35, invert:true }
  ],

  /* COUPLINGS — a meter that DRAGS another, so a meter is never a
     scoreboard (Flash I). While `meter` is above `above`, `drag` is
     applied to its targets every sitting: dearer imports, a thinner
     margin, a government that looks like it is losing. Content declares
     them; the engine only reads the list, the way it reads prices. The
     HIGHEST line that matches in each `group` is applied, so the lines of
     one group are a ladder and never a sum. `group` defaults to the meter;
     a line in a group of its own runs beside the others. `when` is an
     ordinary condition block, for a line that depends on a second meter.

     Diplomatic friction is the campaign's clock and this is what makes it
     one: nothing here is a sanction yet, it is the cost of one landing. */
  couplings: [
    { meter: "friction", above: 40, drag: { thermal_margin: -1 },
      mark: "Imports are dearer under the sanctions regime" },
    { meter: "friction", above: 65, drag: { thermal_margin: -2, solvency: -1000 },
      mark: "Earth's banks are pricing the Commonwealth's risk" },
    { meter: "friction", above: 85, drag: { thermal_margin: -3, legitimacy: -1 },
      mark: "The blockade is beginning to bite" },
    /* MUTUAL VULNERABILITY (the author's plan, design/35). Earth depends on
       the Commonwealth for compute, for power from the orbital relays, and
       for the crews that maintain its satellites; the Commonwealth depends
       on Earth for the nitrogen and water that come up the tethers. A
       blockade therefore costs Earth as well. While the Commonwealth sells
       Earth at least as much as it buys (trade at 95 or above), Earth's own
       losses pull the quarrel back below the blockade line every sitting.
       A Commonwealth that trades little has no such protection. A group of
       its own, so it applies beside the blockade's drag and does not
       replace it. */
    { group: "earth_cost", meter: "friction", above: 85, when: { economyAbove: { trade: 94 } },
      drag: { friction: -2 },
      mark: "Earth's own markets are paying for the blockade" }
  ],

  /* PRESSURE BY DEFAULT (Flash I). A government that only answers the
     decisions put in front of it — that never grants time, divides, makes
     an order or starts anything — is not governing, and the country
     notices. `after` sittings without a lever, the drag lands and keeps
     landing until a lever is used again. Chapter one is exempt: it is the
     teaching chapter and design/21 §5 makes it loss-proof. */
  idleness: {
    fromChapter: 2, after: 3, drag: { legitimacy: -1 },
    mark: "The government has not been seen to do anything"
  }
};

/* =============================================================
   ADMINISTRATIONS — the governments a campaign can open as.

   A CAMPAIGN IS ONE SESSION OF THREE SITTING PERIODS, the parliament's last
   (periodsPerSession above). A GOVERNMENT is one Prime Minister's term and runs across them, so
   the player chooses whose government this is and the label names the whole
   term: party, leader and ordinal, and the years.

     party    governing party id (content/parties.js)
     leader   the Prime Minister (content/characters.js)
     ordinal  which term of that leader's premiership ("I", "II", ...)
     from/to  the term's years, for the label
     session  which session of the term a campaign opens at
     setup    overrides merged over SETUP when a campaign starts from here

     campaign which campaign it plays, when not its own (the sandbox)
     opening  effects applied at the first sitting, over the world as it is
     intro    the introduction, drawn by js/setpiece.js

   The label is BUILT from these fields in js/shell.js, not stored here, so
   it can never drift from the data it names.

   THE LIST IS EMPTY HERE ON PURPOSE. Each campaign declares its own
   administrations in its folder (Flash I's are in
   content/campaigns/flash_i/campaign.js), and `campaign()` below adds them
   in the order the pages load the folders, which is the order the menu
   offers them.
   ============================================================= */
const ADMINISTRATIONS = [];

/* =============================================================
   CAMPAIGNS: a folder each, content/campaigns/<id>/.

   A campaign's files load after the world's and before content/index.js,
   and each hands its entries here, one call per file:

     campaign("flash_i", { events: [ ... ] });

   Every entry is tagged `campaign:"<id>"` unless it names a campaign
   already, and is added to the world's list of that kind. So everything
   that reads the lists sees it without being told where it lives: the
   engine through CONTENT.forCampaign, the editor, and every check. THE TAG
   DECIDES WHOSE AN ENTRY IS; the folder is only where it is kept, and an
   entry tagged in a world file is just as much the campaign's.

   Administrations are added but NOT tagged, because an administration's
   `campaign` field means the campaign it plays (the sandbox plays Flash I),
   not the one it belongs to.

   A kind this does not know is an error, and so is one whose world file
   has not loaded yet. Both fail loudly on purpose: `event:` for `events:`
   would otherwise drop a campaign's whole story without a word.
   ============================================================= */
function campaign(id, parts) {
  const lists = {
    administrations: typeof ADMINISTRATIONS !== "undefined" ? ADMINISTRATIONS : null,
    events:       typeof EVENTS !== "undefined" ? EVENTS : null,
    bills:        typeof BILLS !== "undefined" ? BILLS : null,
    settlements:  typeof SETTLEMENTS !== "undefined" ? SETTLEMENTS : null,
    initiatives:  typeof INITIATIVES !== "undefined" ? INITIATIVES : null,
    instruments:  typeof INSTRUMENTS !== "undefined" ? INSTRUMENTS : null,
    achievements: typeof ACHIEVEMENTS !== "undefined" ? ACHIEVEMENTS : null,
    minutes:      typeof MINUTES !== "undefined" ? MINUTES : null,
    characters:   typeof CHARACTERS !== "undefined" ? CHARACTERS : null,
    actors:       typeof ACTORS !== "undefined" ? ACTORS : null,
    business:     typeof BUSINESS !== "undefined" ? BUSINESS : null,
    glossary:     typeof GLOSSARY !== "undefined" ? GLOSSARY : null,
    articles:     typeof ENCYCLOPEDIA !== "undefined" ? ENCYCLOPEDIA.articles : null
  };
  Object.keys(parts || {}).forEach(kind => {
    if (!(kind in lists))
      throw new Error('campaign("' + id + '"): no kind called "' + kind +
                      '". A campaign adds ' + Object.keys(lists).join(", ") + ".");
    const into = lists[kind];
    if (!into)
      throw new Error('campaign("' + id + '"): the world\'s ' + kind + " have not loaded. " +
                      "A campaign's files go after every world file and before content/index.js.");
    (parts[kind] || []).forEach(x => {
      if (kind !== "administrations" && x && x.campaign == null) x.campaign = id;
      into.push(x);
    });
  });
}
