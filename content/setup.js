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
       the reserve drains, CW$78bn to CW$52bn. Four administrations spent
         it and none of them replaced it.
       the money (design/39, option C): the dollar floated in 2073, the
         year this record opens, when the Governor of the Reserve Bank
         broke the thermal currency board the Commonwealth was founded on.
         Inflation ran high in the first year of the float and the Bank
         brought it down; the dollar has drifted from parity to 84 US
         cents; the cash rate fell as inflation did and has been rising
         again for two years. `growth` is real output against the year
         before, per cent.

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
    solvency:      [78000, 74000, 70500, 66000, 62000, 58500, 55000, 52000],
    inflation:     [4.6, 3.4, 2.5, 1.9, 1.8, 2.2, 2.6, 2.8],
    rate:          [6.0, 5.25, 4.0, 3.25, 3.0, 3.5, 4.0, 4.5],
    fx:            [1.00, 0.95, 0.92, 0.90, 0.89, 0.87, 0.85, 0.84],
    growth:        [4.9, 4.4, 4.0, 3.5, 3.1, 2.8, 2.6, 2.4]
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
  /* THE MONEY (design/39 option C; the author, 25 Sep 2026: "Commonwealth
     Dollar works"). The account is kept in MILLIONS of dollars, so the
     reserve's 52,000 is CW$52 billion and every sum content already wrote
     reads one for one: a thousand of the old MW-years is a billion
     dollars. `foreign` is the money Earth's banks lend in, which the
     Commonwealth owes in that money whatever its own does (a lender's
     `currency`). */
  money: {
    name: "Commonwealth dollar", plural: "Commonwealth dollars",
    symbol: "CW$", code: "CWD",
    foreign: { name: "US dollar", plural: "US dollars", symbol: "US$", code: "USD" }
  },

  /* WAYS AND MEANS (bible §7.3), as a year's budget. The four bases and
     what each yields a YEAR at the standard rate, with every price at its
     index of 100 and output where it opened; the rate levels, which are
     the appropriation clauses' own words; and the STANDING programmes,
     what statutes spend without an annual vote (the courts, the
     attestation registry, the stations' grants), indexed to prices.

     THE CALIBRATION IS ONE SENTENCE. Receipts of CW$220bn at standard
     rates against CW$176bn of standing programmes and the appropriation's
     CW$48bn of defaults leave a deficit of CW$4bn a year, two-thirds of a
     per cent of output: the reserve falls as it has fallen every year
     since 2073, and nothing forces anybody to notice. Raise every rate
     and the budget is CW$128bn in surplus; cut the floor and the insurance
     and it is CW$30bn in surplus at standard rates. `passthrough` is how
     far a rate above standard moves its own price: the `rate` term of each
     price rule below reads it, so the figure is written once. */
  fiscal: {
    bases: [
      { k: "volume",    weight: 88000, passthrough: 0,  name: "Volume" },
      { k: "thermal",   weight: 55000, passthrough: 26, name: "Thermal quota" },
      { k: "substrate", weight: 51000, passthrough: 24, name: "Substrate-hours" },
      { k: "transit",   weight: 26000, passthrough: 20, name: "Mass to orbit" }
    ],
    rates: { none: 0, low: 0.5, standard: 1, high: 1.6 },
    standing: 176000
  },

  /* WHAT MOVES THE FOUR PRICES (bible §7.9; design/39 §6). Each price drifts
     a fifth of the way a sitting toward a target: `base`, plus every term's
     `per` times how far its input stands from `ref`. A term reads `from` in
     the namespaces a move uses: a meter by its bare name (the reserve read in
     thousands, by `scale`), "price.<k>" as this sitting has set it (a list
     is their sum), "law.<k>" as a number or through a `map` from the clause
     level's word to points, "rate.<k>" the multiple a base is levied at,
     whose `per` is that base's `passthrough` above unless a rule says
     otherwise, and "economy.<k>". The order is the order they move in:
     substrate reads thermal after thermal has moved. These were the
     engine's until 25 Sep 2026, coefficient for coefficient, and the canon
     run, every playtest strategy and 126 probes across the laws came out
     byte-identical.

       thermal    scarce as the federal margin thins below 35; the quota the
                  appropriation releases; the levy passed through; and the
                  civic clock's heat, six points at real time
       substrate  cheaper the more of it is publicly held, dearer as thermal
                  rises, and the levy passed through
       volume     the construction schedule, bought out of the reserve, and
                  the works the appropriation funds. NO RATE TERM: a levy on
                  position inside a habitat has nowhere to be passed on to,
                  and that missing line is the Georgist mechanic
       transit    the reserve again, the subsidy, and the levy */
  priceRules: [
    { k: "thermal", base: 100, terms: [
      { from: "thermal_margin", ref: 35, per: -1.2 },
      { from: "law.thermal_release", map: { tight: 14, open: -16 } },
      { from: "rate.thermal" },
      { from: "law.civic_clock_minimum", per: 6 } ] },
    { k: "substrate", base: 70, terms: [
      { from: "law.substrate_public_share", default: 0.35, ref: 1, per: -60 },
      { from: "price.thermal", ref: 100, per: 0.4 },
      { from: "rate.substrate" } ] },
    { k: "volume", base: 100, terms: [
      { from: "solvency", scale: 1000, ref: 50, per: -0.28 },
      { from: "law.capital_works", map: { ring: -9, outer: -5 } } ] },
    { k: "transit", base: 100, terms: [
      { from: "solvency", scale: 1000, ref: 50, per: -0.3 },
      { from: "law.transit_subsidy", map: { anchors: -8, all: -14 } },
      { from: "rate.transit" } ] }
  ],

  /* AND WHAT MOVES THE PRODUCTIVE ECONOMY (§7.10), by the same rules.
     Participation rises as the divergence threshold falls below a week
     (instance-hours become counted jobs) and as building gets cheaper;
     trade answers to transit and to substrate, because compute is the
     export, and to a closure target once a bill writes one (the law key
     reads nothing until then). */
  economyRules: [
    { k: "participation", base: 39, min: 18, max: 62, terms: [
      { from: "law.divergence_threshold_hours", default: 168, scale: 168, ref: 1, per: -12 },
      { from: ["price.volume", "price.transit"], scale: 200, ref: 1, per: -15 } ] },
    { k: "trade", base: 100, min: 40, max: 190, terms: [
      { from: "price.transit", ref: 100, per: -0.4 },
      { from: "price.substrate", ref: 100, per: -0.35 },
      { from: "law.closure_target", per: -24 } ] }
  ],

  /* THE ECONOMY AND THE RESERVE BANK (design/39 §5). Opening figures, then
     every constant of the model, so the author can retune it here. Output
     is real, a year, in millions of dollars at 2080 prices; rates and
     inflation are per cent a year; `fx` is US dollars per Commonwealth
     dollar.

     THE BANK IS INDEPENDENT BY STATUTE, NOT BY CHARTER (the author, 25
     Sep). The Reserve Bank Act 2071 gives the Governor the rate and the
     Treasurer the remit (`target`, `mandate`), and keeps for Parliament a
     reserve direction: an affirmative order under which the Bank moves
     the way it is told (`directions`), at a price in credibility each
     meeting. Parliament can amend the Act, and the Charter says nothing.

     WHERE IT OPENS. Output is a per cent above what the radiators and the
     labour force can sustain, inflation is 2.8 against a target of 2, and
     the Bank has been raising for two years: the rule asks for about 4.7
     and the rate is 4.5, so the first meeting, on 6 May, raises a quarter.
     Nothing here is random: the Bank decides by rule, and the rule is
     printed on the Economy tab. */
  macro: {
    output: 612000, potential: 606000, trend: 2.2, growth: 2.4,
    /* the target and the mandate are the remit's, and the remit is law
       (`law.inflation_target`, `law.bank_mandate`), because the Treasurer
       sets it and an event can change it */
    inflation: 2.8, expected: 2.5,
    credibility: 0.8, rate: 4.5, neutral: 1.0,
    fx: 0.84, reserves: 38000,
    /* Earth's own money, for the real-rate gap the dollar trades on */
    earth: { rate: 3.25, inflation: 2.1 },
    firstMeeting: "2080-05-06", meetingEvery: 42,
    /* THE TAYLOR RULE: neutral real rate, plus inflation, plus half the
       miss, plus half the output gap (a whole gap under a dual mandate),
       in quarter points and no more than a half at a meeting */
    rule: { inflation: 0.5, gap: 0.5, dualGap: 1.0, step: 0.25, maxMove: 0.5, floor: 0.25 },
    /* THE CEILING. Under a federal thermal margin of 15, each point costs
       0.8 per cent of potential output: the radiators are the capacity */
    heat: { line: 15, perPoint: 0.008 },
    /* and each point of participation above where it opened adds 0.4 per
       cent of potential */
    labour: { opening: 39, perPoint: 0.4 },
    /* DEMAND closes `speed` of its distance a year. `fiscal` is the
       multiplier on the budget balance against where it opened, `rate`
       the output lost per point of real rate above where it opened, `fx`
       per unit of a dearer dollar, `trade` per point of the trade index,
       `friction` per point of the quarrel above where it opened. A shock
       fades at `shockFade` a year. */
    demand: { speed: 4, fiscal: 0.8, rate: 0.6, fx: 0.15, trade: 0.1, friction: 0.08, shockFade: 1.5 },
    /* THE PHILLIPS CURVE: points of inflation per point of output gap,
       per per cent of the four prices above where they opened (weighted
       by yield), and per per cent of a weaker dollar */
    phillips: { gap: 0.3, supply: 0.08, imports: 0.12, speed: 3 },
    /* CREDIBILITY is earned inside `band` points of the target at `earn` a
       year and lost at `lose`, down to `floor`; a directed Bank can be
       believed no more than `directedCeiling`. Expectations follow it at
       `expectations` a year. */
    credibilityModel: { band: 1, perPoint: 0.15, floor: 0.2, earn: 0.3, lose: 0.8,
                        expectations: 2, directedCeiling: 0.5 },
    /* THE DOLLAR: per point of the real-rate gap with Earth, per point of
       friction, per point of debt to output, per point of the budget
       balance, per unit of credibility, per point of trade; `speed` a
       year, and `controlled` of it under capital controls */
    fxModel: { realRate: 4, friction: 0.35, debt: 0.4, balance: 1.0, credibility: 0.25,
               trade: 0.2, speed: 6, controlled: 0.35 },
    /* THE ECONOMY VOTES: points of standing a year, per point of inflation
       over the target beyond `band`, per point of output below potential
       beyond `slackBand`, and for a steady economy */
    vote: { band: 1, inflation: 20, slackBand: 0.5, slack: 14, calm: 10 },
    /* WHAT A RESERVE DIRECTION TELLS THE BANK TO DO AT A MEETING, and
       the credibility each meeting of it costs */
    directions: {
      hold:    { move: 0,    credibility: 0.04 },
      ease:    { move: -0.5, credibility: 0.06 },
      tighten: { move: 0.5,  credibility: 0.02 }
    },
    /* the record's words, with {rate}, {from}, {rule}, {date} filled */
    say: {
      raise: { wire: "RESERVE BANK RAISES CASH RATE TO {rate} PER CENT",
               log: "The Reserve Bank raised the cash rate from {from} to {rate} per cent." },
      cut:   { wire: "RESERVE BANK CUTS CASH RATE TO {rate} PER CENT",
               log: "The Reserve Bank cut the cash rate from {from} to {rate} per cent." },
      hold:  { log: "The Reserve Bank held the cash rate at {rate} per cent." },
      directed_raise: { wire: "RESERVE BANK RAISES TO {rate} PER CENT UNDER A TREASURY DIRECTION",
                        log: "Under the Treasurer's direction the Reserve Bank raised the cash rate to {rate} per cent. Its own rule asked for {rule}." },
      directed_cut:   { wire: "RESERVE BANK CUTS TO {rate} PER CENT UNDER A TREASURY DIRECTION",
                        log: "Under the Treasurer's direction the Reserve Bank cut the cash rate to {rate} per cent. Its own rule asked for {rule}." },
      directed_hold:  { wire: "RESERVE BANK HOLDS AT {rate} PER CENT UNDER A TREASURY DIRECTION",
                        log: "Under the Treasurer's direction the Reserve Bank held the cash rate at {rate} per cent. Its own rule asked for {rule}." },
      dollar: { wire: "COMMONWEALTH DOLLAR FALLS TO {fx} US DOLLARS" }
    }
  },

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
    /* IN US DOLLARS, which is the whole of its danger since the dollar
       floated (design/39 §7): the Commonwealth owes Earth's banks in their
       money, so a fall in its own makes the debt heavier without a cent
       more borrowed. The cap, the utilisation and the commitments are US
       dollars; the reserve receives what a drawing buys at the day's rate. */
    earth: {
      name: "Earth's banks", facility: "the Standby Facility",
      currency: "USD",
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
      log: "Drew {n} on the Standby Facility from Earth's banks, at {rate} per cent: {got} into the reserve.",
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
            "The facility is denominated in US dollars, and the Commonwealth " +
            "owes in US dollars whatever its own currency does. " +
            "The Commonwealth draws on the facility by a utilisation request " +
            "from the Treasurer to the agent, in amounts of US$8 billion. " +
            "Each drawing is announced to the House. Amounts drawn may be " +
            "repaid at any time without penalty and drawn again, and all " +
            "amounts outstanding fall due at final maturity." },
          { h: "Covenants", body:
            "The Commonwealth undertakes to keep its reserve at or above " +
            "CW$10 billion while any amount is drawn. The facility carries a " +
            "negative pledge, a pari passu clause and a cross-default clause in " +
            "the usual form, and an expropriation clause under which the taking " +
            "of an Earth-registered company's property without compensation is " +
            "an event of default." },
          { h: "Sanctions", body:
            "A lender is not obliged to fund a drawing that its own government's " +
            "sanctions forbid. The European lenders' commitments, US$20 billion " +
            "between them, are suspended while the European Union's " +
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

    /* THE TREASURY'S BILLS. Not a facility anybody draws on: when the
       reserve cannot meet a payment the Treasury tenders bills for the
       shortfall at the weekly auction, at a quarter over the Reserve Bank's
       cash rate, and the market takes them up to the Treasury's standing
       authority. That is how a government with an empty reserve keeps
       paying, and why an empty reserve is a debt and not a pause. Past the
       authority nothing is borrowed and payments go unpaid (the engine's
       arrears). The market asks more as the debt rises against output. */
    bills: {
      name: "the Treasury's bills", facility: "Treasury bills",
      automatic: true, cap: 60000,
      rate: { base: 0.25, policy: 1, steps: [
        { when: { economyAbove: { debt: 10 } }, add: 0.5,
          label: "while the debt is more than a tenth of output" },
        { when: { economyAbove: { debt: 20 } }, add: 1,
          label: "while it is more than a fifth" },
        { when: { economyBelow: { credibility: 0.5 } }, add: 0.75,
          label: "while the market doubts the Reserve Bank" },
        { when: { flags: ["rating_cut"] }, add: 0.25,
          label: "since the Underwriters cut the continuity rating" } ] },
      label: "Treasury bills", short: "tendered weekly when the reserve cannot pay",
      note: "tendered at the weekly auction for whatever the reserve cannot meet, up to the Treasury's standing authority of CW$60bn",
      wire: "TREASURY TENDERS BILLS AS THE RESERVE RUNS OUT",
      log: "The reserve could not meet a payment, and the Treasury tendered bills for the difference at the weekly auction." },

    /* THE RESERVE BANK: WAYS AND MEANS ADVANCES. The Treasury's overdraft at
       the Bank, opened only by an affirmative order (content/instruments.js),
       because an advance is the Bank creating the money the Treasury spends.
       Charged at the cash rate. Nobody draws on it from the account and
       nothing tenders into it; the order is the only way in, and repaying it
       is the only way out. */
    reserve_bank: {
      name: "the Reserve Bank", facility: "Ways and Means advances",
      label: "Ways and Means advances", cap: 30000,
      rate: { base: 0, policy: 1 },
      note: "the Treasury's overdraft at the Reserve Bank, opened by order of the House",
      short: "the Treasury's overdraft at the Bank" },

    /* THE CIRCUMTERRESTRIAL UNDERWRITERS: COMMONWEALTH RESERVE NOTES. The
       lender at home. The Underwriters are a market and not a firm (bible
       §7.5.2): 46 syndicates and 94 mutuals trade on it, and 140 of them
       elect Insurance and Underwriting's three seats (content/functional.js).
       Insurers hold reserves against claims, in dollars; the Treasury
       borrows them by placing notes, through the market's own Central Fund,
       with the Reserve Bank as registrar.

       Priced on the Reserve Bank's cash rate and on continuation, not on the
       quarrel: half a point over the cash rate (`policy: 1`), so a rise at
       the Bank reaches the Treasury's own borrowing within the week, and a
       coupon that steps up as the thermal margin narrows, which is the
       Underwriters' own reading of whether the borrower keeps running; no
       new notes are placed into a cascade. No friction, because Earth is
       not a party to it; the price is at home, in the standing of a body
       that votes three seats. */
    underwriters: {
      name: "the Underwriters", facility: "Commonwealth Reserve Notes",
      drawable: true, utilisation: 6000, home: true,
      cap: 36000,
      rate: { base: 0.5, policy: 1, steps: [
        { when: { scalarBelow: { thermal_margin: 15 } }, add: 1,
          label: "while the federal thermal margin is under 15" },
        { when: { scalarBelow: { thermal_margin: 10 } }, add: 1.5,
          label: "while it is under 10" },
        { when: { scalarBelow: { thermal_margin: 6 } }, add: 2,
          label: "while it is under 6" },
        { when: { flags: ["rating_cut"] }, add: 0.25,
          label: "since the continuity rating was cut" } ] },
      limits: [
        { when: { scalarBelow: { thermal_margin: 6 } }, cap: 0,
          why: "the Underwriters place no notes while the thermal margin is under six" } ],
      onDraw: [ { move: { "actor.underwriters": 3, party_loyalty: -1 } } ],
      drawNote: "The Underwriters' standing with the government rises. The " +
        "party's own benches like borrowing from the insurers less.",
      log: "Placed {n} of Commonwealth Reserve Notes with the Underwriters, at {rate} per cent.",
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
            "Notes are issued in series of CW$6 billion and placed with the " +
            "members listed below in proportion to their commitments. Each " +
            "series runs for three years and may be redeemed early at par. The " +
            "Reserve Bank keeps the register of holders and pays the coupon." },
          { h: "The coupon", body:
            "The coupon is half a point over the Reserve Bank's cash rate at " +
            "the date of issue, and it steps up with the Underwriters' " +
            "continuity rating of the Commonwealth, which follows the federal " +
            "thermal margin. The members place no new notes while the " +
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
      "The reserve is exhausted. The Treasury is paying its way in bills at the " +
      "weekly tender, and when the tender is full the next shortfall is met by " +
      "shedding load, which means by shedding people." },
    reserve_thin: { text:
      "At the present rate of loss the reserve is gone inside a year. There is " +
      "time to raise a rate or cut a line, and there will not be time twice." },
    reserve_deep: { text:
      "The reserve is deep enough to carry a bad session. It is also deep " +
      "enough to be noticed by anybody arguing for a line the government has " +
      "refused to fund." },
    receipts_short: { text:
      "Outgoings exceed receipts. The gap is met from the reserve every " +
      "day, whether or not anybody votes on it." },
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
    /* THE MONEY (option C). Inflation against the remit, the Bank's grip on
       it, the dollar, and where output stands against what the radiators
       allow. */
    inflation_target: { text:
      "Inflation is inside a point of the Reserve Bank's target. The Bank has " +
      "no reason to surprise anybody at its next meeting, which is worth more " +
      "to a borrower than any rate it could set." },
    inflation_high: { text:
      "Inflation is more than two points over the target, and the Bank's rule " +
      "says what it will do about that. A household reads it in the price of " +
      "heat first and in the government's standing second." },
    inflation_low: { text:
      "Inflation is under the target. The Bank will ease, and the reserve's " +
      "receipts will grow more slowly than the lines they pay for." },
    bank_doubted: { text:
      "The market no longer believes the Bank will hold inflation to its " +
      "target. Expectations are following prices rather than the remit, and " +
      "every point of inflation now costs more to take out than it did." },
    bank_directed: { text:
      "The Reserve Bank is setting the cash rate under a Treasury direction. " +
      "The market prices every meeting of it, and so do the Underwriters." },
    dollar_weak: { text:
      "The dollar is down a tenth on where it opened. Everything the " +
      "Commonwealth buys from Earth costs more, and everything it owes Earth's " +
      "banks is a larger sum in its own money than when it borrowed it." },
    dollar_strong: { text:
      "The dollar is strong. Imports are cheap, and the compute the Commonwealth " +
      "sells is dearer to everybody buying it." },
    output_slack: { text:
      "Output is running under what the radiators and the labour force would " +
      "allow. There is room to spend without heating the price of anything, " +
      "and people out of work are counting the room." },
    output_hot: { text:
      "Output is pressing on capacity. The radiators, not demand, are the limit, " +
      "and anything more the government spends arrives as inflation in the " +
      "thermal price." },
    owed_bills: { text:
      "The Treasury is rolling bills at the weekly tender. The market takes " +
      "them at a quarter over the cash rate, and asks more as the debt grows." },
    owed_reserve_bank: { text:
      "The Treasury owes the Reserve Bank an advance. The money was created to " +
      "lend it, and the market will not forget that until it is repaid." },
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
         district_divisor:"fptp", list_divisor:"dhondt",
         /* THE RESERVE BANK ACT 2071 (design/39 option C). The remit the
            Treasurer writes to the Governor: the inflation target, per cent a
            year, and the mandate, "inflation" or "dual" (inflation and
            participation, which weighs the output gap twice as heavily in the
            rule). A reserve direction ("hold" | "ease" | "tighten") is set by
            an affirmative order and is null while the Bank sets its own rate.
            Exchange controls are an order too. */
         inflation_target:2, bank_mandate:"inflation",
         reserve_direction:null, capital_controls:false },
  /* WHAT THE DOCKET WARNS OF (design/38 §7). An alert goes on the order of
     the day while its `when` holds, on `tab`, and `urgent` says when it is
     today's business rather than soon. `raises` names a scalar: the engine
     then finds the orders whose effects raise it, and the alert names the
     next one to lay or approve, or stands down when none is left to reach
     for. The thermal line is fifteen because that is where the radiators
     start to cost output (`macro.heat.line`) as well as people. */
  alerts: [
    { id: "thermal_orders", tab: "gov",
      when: { scalarBelow: { thermal_margin: 15 } },
      urgent: { scalarBelow: { thermal_margin: 8 } },
      raises: "thermal_margin",
      text: "The thermal margin is under 15, and the emergency orders are open" }
  ],

  /* THE CIVIC CLOCK (bible 6.3), at a minimum of 1 (real time): what the
     subsidy costs a YEAR, on the spending side of the budget, scaled by the
     minimum the law sets. Keeping 560,000 slow-running minds at real time is
     expensive, CW$70bn a year, and it is heat: the six points it adds to the
     thermal price at real time are a term of `priceRules`. */
  civicClock: { costPerYear: 70000 },
  /* SUSPENSION, WITH THE DEBT PAUSED (bible 6.6). Restorations run this
     much faster and suspensions this much more often than with the debt
     accruing, which is the status quo and the calibration. */
  suspension: { pausedRestore: 1.5, pausedShed: 1.2,
                /* the price a station that cannot pay sheds people against:
                   the rent on running (bible §7.9) */
                price: "substrate" },
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

  /* THE COUNT (design/38 §1). `swing`: points of the vote that move
     between the government's side and everybody else for each point of
     standing away from 50, so standing 10 is a swing of fourteen points
     against and 100 of seventeen and a half for. The district constants
     shape the notional result: a party's local strength runs from
     `localFloor` of its national vote where it held nothing to
     `localFloor + localLift` where it held every seat around, and a holder
     leads its nearest rival by `marginMin` plus up to `marginSpan` as its
     hold on the station and band grows. `functional` is how far each
     franchise follows the country. */
  /* STANDING FADES (design/38 §1): every band closes `rate` of its distance
     to `toward` each sitting, so standing settles near `toward` plus what
     the government keeps earning divided by `rate`. Without it a player
     taking the standing on offer reached 100 before the writs and every
     competent run was a landslide. Measured at 0.05: a government that
     cycles its answers reaches the count at 35 (a defeat, 122 seats), one
     that takes the best answer every time at 74 (a working majority, 183),
     and the campaign moves either by fifteen to twenty points. 0 turns it
     off. */
  standingDrift: { toward: 45, rate: 0.05 },
  election: { swing: 0.35, localFloor: 0.4, localLift: 2.0, marginMin: 0.005, marginSpan: 0.35, marginShape: 1.6,
              functional: { licensure: 0.4, corporate: 0.15, union_bloc: 0.3, residual: 1 } },

  /* THE EPILOGUE (design/38 §2): what the count means, printed on the last
     page. The first whose `when` matches the counted result is read.
     `returned` is whether the government's side has a majority in the new
     House, `sideAtLeast`/`sideBelow` its seats; a campaign may put its own
     list in its setup, and an entry may carry any other condition too (a
     settlement, a flag). The chamber is 280 and the majority 141. */
  epilogues: [
    { id:"landslide", when:{ returned:true, sideAtLeast:185 }, title:"A landslide",
      body:"The new House sits with the government's side on three benches and part of a fourth. " +
           "The President sends for the Prime Minister before the last returns are in, and the " +
           "formation takes an afternoon. A majority this size is a mandate for everything the " +
           "manifesto said and several things it left out, and the first thing the whips learn is " +
           "that a government this large has more members than posts. The opposition will spend " +
           "the parliament deciding who lost it." },
    { id:"working", when:{ returned:true, sideAtLeast:160 }, title:"A working majority",
      body:"The government is returned with room to govern. The President sends for the Prime " +
           "Minister on the morning after the count, the partners renew their terms the same " +
           "afternoon, and the new parliament opens with the government's business on the paper. " +
           "A majority of this size survives a rebellion or two, which is the only measure of a " +
           "majority the whips use." },
    { id:"narrow", when:{ returned:true }, title:"Returned, narrowly",
      body:"The government is returned with a majority the whips can count on one hand. The " +
           "partners know it and price their terms accordingly: the formation takes a week, and " +
           "the programme that comes out of it is shorter than the manifesto. Every division of the " +
           "new parliament will be close, and the Prime Minister governs on the arithmetic of the " +
           "last session with less of its patience." },
    { id:"hung", when:{ sideAtLeast:125 }, title:"No majority",
      body:"Nobody commands the House. The President calls the leaders in one at a time, in order " +
           "of seats, and the government stays on as caretaker until somebody can show the numbers. " +
           "The government's side is the nearest to a majority, so the talks begin with it; whether " +
           "they end with it depends on who else is in the room and what the partners want for " +
           "coming back." },
    { id:"defeat", when:{ sideAtLeast:100 }, title:"Defeat",
      body:"The government's side comes back short by more than any partner can make up. The " +
           "President sends for the Leader of the Opposition, and the Prime Minister goes to the " +
           "residence the next morning to resign. The benches that won the count will form the next " +
           "government, and the party that governed will spend its first weeks in opposition " +
           "deciding whether the record lost it or the campaign did." },
    { id:"rout", title:"A rout",
      body:"The government is swept out. Seats that returned the party at every election since the " +
           "Charter change hands on the night, and the parliamentary party that comes back fits in " +
           "the room where its whips used to meet. The Leader of the Opposition forms a government " +
           "within the week, and the Prime Minister's resignation is accepted on the day it is " +
           "offered." }
  ],

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
