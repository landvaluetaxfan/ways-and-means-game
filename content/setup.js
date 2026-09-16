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
             thermal_margin:17, solvency:52,
             /* Flash I's own meters. legitimacy: the government being
                believed, at home. friction: Earth's governments and banks
                against the Commonwealth — higher is worse. */
             legitimacy:48, friction:25 },
  law: { divergence_threshold_hours:168, civic_clock_minimum:0,
         suspension_debt_accrual:true, substrate_public_share:0.35, shed_order_authority:"engineering_authority",
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
  thresholds: { leadershipChallenge: 15, ballot: 12 }
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
    setup:{ startDate:"2080-04-11" } }
];
