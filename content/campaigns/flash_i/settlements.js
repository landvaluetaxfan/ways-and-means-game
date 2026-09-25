/* =============================================================
   FLASH I — SETTLEMENTS. The crisis's five outcome tiers (design/35).
   Tagged and added to the world's SETTLEMENTS by `campaign()`. The four
   personhood answers are the world's, in content/settlements.js.
   ============================================================= */
campaign("flash_i", { settlements: [

  /* =============================================================
     FLASH I — the platform crisis, in six outcomes.

     The campaign's tiers, gated on the four campaign meters (see
     design/35, and scaffold.example.js beside this file). Ranked most
     specific first:
     a state that makes the Critical Triumph also makes the Maritime
     Charter's numbers, so the triumph is read before it. All five are
     `crisis: true`: they are the campaign's OUTCOME, recorded in
     `resolvedAs` the first time one lands and read by `resolved` and
     `resolvedIs`, while the four answers above are intermediate and
     record in `settledAs`. The two used to be ranked together, so an
     intermediate answer could pre-empt the canon ending (design/32 §E.1).
     No settlement ends the run; the count does. The meltdown is not
     here: it is a loss, and losses end through the loyalty floor.

     PROSE IS THE AUTHOR'S. These closings are two flat sentences each
     so the mechanism can be played; the register is deliberately bare.
     ============================================================= */
  /* THESE NOW GATE ON THE ACT, which is what the note above them asked for
     and could not have.

     `f1_annexing` is a flag the Prime Minister sets by DECIDING, so gating on
     it annexed 184,000 people with no reading, no division and no Act — in a
     game whose thesis is that things happen by parliamentary act. The change
     to `almanac_annexed` (set by the Annexation Bill's onPass) was two words,
     and it was made and reverted once because the Act could not be carried:
     the bill stalled at second reading, friction reached 100 and solvency 0,
     and the canon ending became unreachable rather than earned. Gating on an
     Act nobody can pass is worse than gating on an intention.

     Three things have changed since. The annexation is an immediate friction
     shock rather than a trend that ran away; trends decay; and the state has
     an income, so a government that spends 14,000 on the Act is not finished
     by having spent it. Traced on 21 September 2026: the bill reaches its
     division at sitting 6, carries on the popular bench 129 to the 121 it
     needs, is assented at sitting 7, and the run comes out of it with
     friction 25, legitimacy 57 and solvency 46,765 — which receipts carry
     back over the Maritime Charter's floor within a dozen sittings.

     So the gate is the Act. The balance came first, as it should have. */
  { id: "f1_triumph", rank: 0, crisis: true,
    name: "Orbital Powerhouse",
    summary: "Full annexation. Earth drops the debt claims under threat of satellite transit tariffs.",
    closing: "The platform is Commonwealth territory, and Earth has dropped its claims. " +
             "Heavy orbital manufacturing is unlocked, and Earth will remember this.",
    /* THE RESERVE FLOORS ARE THE CALENDAR ACCOUNT'S (design/40 E10). They
       were 70,000 and 60,000, written when receipts filled the reserve
       every sitting a government governed. Since the dollar the account
       runs a small deficit and the crisis is paid for, so no random
       government that annexed held more than 9,600 afterwards, and the two
       good endings were out of reach by play. A reserve still near where it
       opened, after paying for the Act, is the achievement now. */
    when: { flags: ["almanac_annexed"],
            scalarAbove: { legitimacy: 75, solvency: 40000 },
            scalarBelow: { friction: 60 } } },
  { id: "f1_maritime", rank: 1, crisis: true,
    name: "Maritime Charter",
    summary: "International courts recognise salvage rights. The Works becomes Commonwealth territory in law.",
    closing: "The courts recognise the salvage, and the platform is Commonwealth territory in law. " +
             "The legal and administrative bill is heavy, and so is the trust it bought.",
    when: { flags: ["almanac_annexed"],
            scalarAbove: { legitimacy: 55, solvency: 30000 },
            scalarBelow: { friction: 40 } } },
  { id: "f1_pyrrhic", rank: 2, crisis: true,
    name: "Sovereign Debt Trap",
    summary: "The Works is annexed and its 184,000 people are saved. The Commonwealth assumes the defaulted corporate bonds.",
    closing: "The platform is annexed and its workers are saved, and the Commonwealth has assumed " +
             "the defaulted bonds that paid for them. Three years of austerity begin at the next estimates.",
    when: { flags: ["almanac_annexed"],
            scalarAbove: { legitimacy: 65, friction: 65 },
            scalarBelow: { solvency: 35000 } } },
  { id: "f1_joint", rank: 3, crisis: true,
    name: "UN/Orbital Joint Mandate",
    summary: "A co-administered international free trade zone. No embargo, no territory, mild voter apathy.",
    closing: "The platform is a co-administered free trade zone under a joint mandate. " +
             "No embargo, no territory, and a country that shrugs.",
    /* THE LINE HELD AFTER THE REFERENDUM, AND THE MIDDLE BANDS (design/40
       E10): a mandate is what a government that declines to annex gets. Every
       random government that carried the referendum was under the old
       floors (legitimacy 15 to 38, reserve 17,600 to 37,100), and a joint
       mandate over a platform the House had annexed read as nothing. */
    when: { flags: ["f1_referendum_carried", "f1_held_the_line"], flagsAbsent: ["almanac_annexed"],
            scalarAbove: { legitimacy: 25, solvency: 15000, friction: 20 },
            scalarBelow: { legitimacy: 60, friction: 60 } } },
  { id: "f1_capitulation", rank: 4, crisis: true,
    name: "Corporate Re-Entry",
    summary: "The Commonwealth declines the referendum. Corporate security from Earth reclaims and clears the Works.",
    closing: "The referendum is declined, and corporate security reclaims the platform. " +
             "The strikes on the outer habitats begin the same week.",
    /* ON WHAT ITS SUMMARY SAYS: the referendum declined (design/40 E10).
       It gated on friction over 75 after the survey, and a government that
       declined the referendum takes friction DOWN, so the surveyed runs sat
       at 18 to 33 and the tier never landed for the choice it describes. */
    when: { flags: ["f1_referendum_declined"],
            scalarBelow: { legitimacy: 45 } } },

  /* THE QUESTION LEFT OPEN (design/40 E10). Of sixty random governments,
     twenty reached the crisis and fourteen of those ended it with no
     result at all: the campaign's central question went unanswered, the
     aftermath never played and the last page said nothing about it. A
     government that met the crisis and settled nothing by the last
     sitting period's end has an outcome too, and it is this one. Ranked
     last and dated late, so any tier the state reaches first takes it. */
  { id: "f1_open", rank: 5, crisis: true,
    name: "Unfinished Business",
    summary: "No settlement is reached before the House rises. The Works stays in limbo, its people on emergency terms.",
    closing: "The House rises with the platform's future unsettled and its people on emergency terms. " +
             "The next government inherits the question, and Earth's lawyers inherit the time.",
    when: { flags: ["f1_surveyed"], minSitting: 44 } },

] });
