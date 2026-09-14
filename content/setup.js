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
             thermal_margin:17, treasury:52 },
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
  slotsPerSession: 6,
  /* HOW LONG A SESSION RUNS, in sittings. The House rises at the end of it:
     order-paper time refills, business not carried falls, and anything owed
     "before the House rises" comes due. Bible 7.7 calls order-paper time the
     currency that cannot be topped up — this is the period it cannot be
     topped up WITHIN. */
  sittingsPerSession: 24,
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
