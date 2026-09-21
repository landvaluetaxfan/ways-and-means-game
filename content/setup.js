/* SETUP — the opening state. Change a number here and the game starts differently. */
const SETUP = {
  startDate: "2287-04-11", session: 4, sitting: 1,
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
  scalars: { party_loyalty:38, public_standing:44, consumables:71,
             thermal_margin:17, solvency:52000,
             /* Flash I's own meters. legitimacy: the government being
                believed, at home. friction: Earth's governments and banks
                against the Commonwealth — higher is worse. */
             legitimacy:48, friction:25 },
  /* HOW OFTEN THE CHARTER LETS A GOVERNMENT APPOINT TO ONE BOARD
     (bible §4.6.4). Two is a fight; unlimited is a cheat code. */
  boardCap: 2,
  /* HOW FAR EARTH WILL GO. Beyond this its banks stop lending to this
     government, whatever the rate (bible §7.5.2: underwriting prices
     everything continuously, and it prices a government it does not
     believe in out of the market). */
  borrowCap: 60000,

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
      "The Commonwealth owes nothing off-world. Everything it holds is its own, " +
      "which is a stronger position at a negotiation than it looks on a ledger." },
    debt_light: { text:
      "The off-world debt is small enough to service out of receipts. It is " +
      "also on Earth's books, and Earth reads a ledger as a lever." },
    debt_heavy: { text:
      "The off-world debt is large enough that servicing it is now a line of " +
      "the budget in its own right. Every point of friction adds to what it " +
      "costs, and the government does not set the friction alone." },
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
         tier_ratio_district:140, tier_ratio_list:100, threshold_pct:4,
         /* Bible 4.10: the divisor is a bill, not a constant. D'Hondt favours
            large parties, Sainte-Lague small ones, and the two tiers are two
            separate fights. Values: "dhondt" | "sainte_lague". */
         /* Districts are single-member and returned by first past the post,
            so no divisor applies: highest averages over one seat IS plurality.
            The value is kept for the editor and for any future bill that
            merges seats back into multi-member districts. */
         district_divisor:"fptp", list_divisor:"dhondt" },
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
  /* HOW LONG A SESSION RUNS, in sittings. The House rises at the end of it:
     order-paper time refills, business not carried falls, and anything owed
     "before the House rises" comes due. Bible 7.7 calls order-paper time the
     currency that cannot be topped up — this is the period it cannot be
     topped up WITHIN. */
  sittingsPerSession: 24,
  /* A CAMPAIGN IS ONE PARLIAMENT AND ONE PARLIAMENT IS ONE SESSION. At the end
     of it the House is dissolved and the electorate answers, which makes the
     election the backstop ending rather than an interruption: a run finishes on
     a settlement, on the election, or on a loss, and cannot run past them.
     Raise this and the parliament sits for more sessions before going to the
     country. */
  sessionsPerParliament: 1,
  /* opening ledger. Positive means they owe you. */
  capital: { psa: 2, rv: -3, upl: 0, geo: 1 },
  president: { id:"tenaya", relationship:22,
               powers:["dissolution","formation","referral","appointments"] },
  /* leadershipChallenge is the loyalty floor at which a ballot becomes
     unwinnable and the government falls. ballot is the number of signatures
     that forces one (design/08 §2): below it the challenger is gathering,
     above it the caucus divides. */
  thresholds: { leadershipChallenge: 15, ballot: 12 },
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
     HIGHEST line that matches is applied — worse is worse, not
     worse-squared — so these are a ladder, not a sum.

     Diplomatic friction is the campaign's clock and this is what makes it
     one: nothing here is a sanction yet, it is the cost of one landing. */
  couplings: [
    { meter: "friction", above: 40, drag: { thermal_margin: -1 },
      mark: "Imports are dearer under the sanctions regime" },
    { meter: "friction", above: 65, drag: { thermal_margin: -2, solvency: -1000 },
      mark: "Earth's banks are pricing the Commonwealth's risk" },
    { meter: "friction", above: 85, drag: { thermal_margin: -3, legitimacy: -1 },
      mark: "The blockade is beginning to bite" }
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

   A CAMPAIGN IS ONE SESSION (sessionsPerParliament above). A GOVERNMENT is
   one Prime Minister's term and can run across more than one session, so
   the player chooses whose government this is and the label names the whole
   term: party, leader and ordinal, and the years.

     party    governing party id (content/parties.js)
     leader   the Prime Minister (content/characters.js)
     ordinal  which term of that leader's premiership ("I", "II", ...)
     from/to  the term's years, for the label
     session  which session of the term a campaign opens at
     setup    overrides merged over SETUP when a campaign starts from here

   The label is BUILT from these fields in js/shell.js, not stored here, so
   it can never drift from the data it names. Flash I is the current
   campaign and the rewrite's too; the bible's 11 April 2287 (§3.9) is a
   placeholder older than the term, and this dates the campaign to the
   term's own first year.
   ============================================================= */
const ADMINISTRATIONS = [
  { id:"flash_i", party:"cu", leader:"flash", ordinal:"I",
    from:2080, to:2084, session:4,
    setup:{ startDate:"2080-04-11" },
    /* THE INTRODUCTION (design/31 §5). Rendered through js/setpiece.js, so
       the sections and their kinds are the frame's vocabulary: epigraph,
       lede, body, signature. It is the first thing a player reads, and the
       last thing in it is the signature that will sign every Act she passes.

       DATES, settled with the author. The draft put her arrival in 2081 and
       the governorship in 2082, which cannot stand: Flash I opens 11 April
       2080 and she is already Prime Minister. She comes up in 2070 and takes
       the Bank in 2071, which gives her nine years as Governor before the
       premiership — long enough to be a record, recent enough that the
       people she priced are still sitting in the chamber. The bible's 2287
       is a placeholder older than the term and is not the year. */
    intro:{
      /* A BED, not the readout. js/music.js exports its moods by name and
         `state` is the state readout, so it was never going to play.
         `anthem` names a recorded track in content/anthem.js: while the
         introduction is up it plays and the bed steps aside, and leaving it
         fades the recording out and the bed back in. `mood` is the fallback
         for a build where the recording is not encoded yet. */
      mood:"moment",
      anthem:"la_bionda",
      title:"Adriana Eireann Flash",
      art:"flash_intro",
      sections:[
        { kind:"epigraph",
          body:"All the rivers run into the sea; yet the sea is not full.",
          source:"Ecclesiastes 1:7" },

        { kind:"lede", body:
`Adriana Eireann Flash is perhaps an example of uncertainty: an unexpected candidate for Prime Minister, a defiance of odds. She had never held elected office before her ascension to the premiership, and yet at this moment she seems to be the best answer the Commonwealth has to the question of who ought to lead it. With the world unsettled and confidence in its old certainties beginning to fray, she stands now at the edge of history.` },

        { kind:"body", head:"The banker", body:
`When the Circumterrestrial Commonwealth emerged out of the primordial soup that was humanity extending into the heavens — first into orbit around Earth, and then further out into the solar system — Adriana Eireann Flash was a banker for Alphabet-JPMorgan Omni, making a name for herself in the latter half of a century that had been defined, economically, by an upheaval in the institutions of the old order as climate change forced their hand.

She came up to the Winter Garden in 2070, in the Commonwealth's springtime, when orbital industry was finding its flourishing and nobody yet knew what any of it was worth. A year later she was Governor of the Reserve Bank of the Circumterrestrial Commonwealth. She was to be the first in a line of faceless bankers who would set the precedent for the composed monetary policy of this novel polity.

That could have been the whole of it. A decade of steady hands and unread minutes, a portrait in a corridor, a pension. But it's not like every capable leader was evidently destined to do it beforehand.` },

        { kind:"body", head:"How she came to it", body:
`The Party of Socialists and Democrats did not choose her because she was one of them. It chose her because the party was seemingly in between worlds, in constant melancholic turmoil, unsure of what was to come next. And so, dark horse she was, she hammered her way to the leadership election, and then she won it. She took First Spin at the election that made her Prime Minister, which is the first elected office she has ever held.

So she is a banker at the head of the party of maintenance labour, which occasionally mitigates the two facts; occasionally it exemplifies it. The members who put her there did it to keep a government.` },

        { kind:"body", head:"What she inherits", body:
`Her government is a coalition of the Party of Socialists and Democrats, the New Progressive Party, and the Congregational Democratic Alliance; with confidence and supply, they lead a somewhat convincing minority government. Although with that, while the New Progressive Party may align with the PSD on many elements of economic policy, the issue of personhood is one that lies in wait, a test for the shaky alliance which sees a personhood restrictionist PSD and CDA (the CDA also being a semi-awkward fit economically for the governing coalition) pitted against a personhood expansionist NPP.

The PSD are in power because of labour and trade unions. Expanding personhood is a natural threat against that, while the CDA agree from a humanist perspective. The New Progressive Party sees otherwise.

She has four years. The session that opens on the eleventh of April is the fourth, and the House is already sitting.` },

        { kind:"signature", head:"Adriana Eireann Flash \u00b7 Prime Minister" }
      ] } },

  /* THE SANDBOX. A second government that exists only to be played with, so a
     tester can reach a branch without playing the session that would have
     reached it. Its overrides are all setup fields the engine already reads:
     no pool jitter, a settlement may land as soon as its `when` holds, the
     idleness drag is off, order-paper time and divisions are effectively
     unlimited, and the meters open high enough not to lose by accident.

     Its opening SOLVENCY is the tell. It is set far above anything the real
     campaign can earn, and the test-console events in content/events.js are
     gated on `scalarAbove:{solvency:900000}`, which is how the console knows
     it is in the sandbox and stays out of Flash I. No new files, no engine
     change: `contentFor()` in js/shell.js merges this over SETUP. */
  { id:"sandbox", party:"cu", leader:"flash", ordinal:"(sandbox)",
    from:2080, to:2084, session:4,
    setup:{
      weightJitter: 0,
      settlementFloorSittings: 1,
      slotsPerSession: 99,
      divisionsPerSitting: 99,
      grantsPerSitting: 99,
      idleness: { fromChapter: 99, after: 3, drag: { legitimacy: -1 },
                  mark: "Sandbox: the idleness pressure is off" },
      scalars: { party_loyalty: 80, public_standing: 70, consumables: 80,
                 thermal_margin: 60, solvency: 999999,
                 legitimacy: 70, friction: 10 } }
  }
];
