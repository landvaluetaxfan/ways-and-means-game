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
  confidenceSupply: ["upl","geo"],
  scalars: { party_loyalty:38, public_standing:44, consumables:71,
             thermal_margin:17, solvency:52000,
             /* Flash I's own meters. legitimacy: the government being
                believed, at home. friction: Earth's governments and banks
                against the Commonwealth — higher is worse. */
             legitimacy:48, friction:25 },
  law: { divergence_threshold_hours:168, civic_clock_minimum:0,
         suspension_debt_accrual:true, substrate_public_share:0.35, shed_order_authority:"engineering_authority",
         /* THE APPROPRIATION'S FINGERPRINT ON THE MARKET (design/13 §2.3,
            design/28 §4). Each clause of the budget sets one of these, and
            the tick reads them where it used to read a scalar alone: the
            four prices are legislative outputs, and the appropriation is
            the legislation. Levels are the clause levels' own words. */
         thermal_release:"steady", capital_works:"none", transit_subsidy:"none",
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
    setup:{ startDate:"2080-04-11" } },

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
