/* =============================================================
   SETTLEMENTS — the four answers the Commonwealth can live with.

   Bible §3.5.1, and its four rules are the whole specification:

     1. A settlement is a `when` block, read by the same matches() every
        event uses. The engine adds a READER, never a branch.
     2. THE PLAYER IS NEVER SHOWN THE LIST. They are told what they
        promised (§9.2); what they discover is what it costs. An ending
        named in advance is a quest marker.
     3. Closure and dissolution are failure modes, not settlements.
     4. The record makes a settlement cheaper or dearer, never
        impossible. Blocking one at character creation turns the opening
        into a menu of endings.

   `when` is evaluated every sitting against the live state. Order
   matters only where two could be true at once, and `rank` decides that
   — a specific settlement beats a general one, so the federal fudge,
   which is compatible with almost any threshold, is read last.

   `closing` is the ending itself: what the Commonwealth looks like
   after, and what it cost. Each is written as though it were the ONLY
   ending (rule 2), with no nod to the other three, and it reads the same
   whether the player arrived wholeheartedly or by attrition (rule 4):
   the prose states the world, never the player's virtue.
   ============================================================= */
const SETTLEMENTS = [

  /* Threshold high and the franchise left where the founders put it:
     the maintenance benches and the functional forty are conceded to,
     and the argument is closed by refusing it.

     A SETTLEMENT IS NOT A THING YOU INHERIT. The first draft of this was
     "the threshold is above 167", which the opening state satisfies —
     168 hours is where the game starts — so the Commonwealth had settled
     on restriction before the first sitting and by doing nothing at all.
     Restriction is the threshold DEFENDED: the reform has to have been
     put and lost. Every other settlement here needs an Act or a flag and
     so cannot be inherited; this one needed saying out loud. */
  { id: "restriction", rank: 1,
    name: "The Restriction Settlement",
    summary: "The threshold stands where it stood, and the schedule is not reopened.",
    closing: `The threshold stands at one hundred and sixty-eight hours, where the founders put it, and the bill that would have moved it is dead. The franchise stays what it always was: a copy separated from its source remains an instance in law, with no separate wage, no separate vote, and no separate life the registry has to notice. Nearly two million copies stay exactly as they are.

The government that put the question has answered it, and the answer is that the question will not be asked again in this parliament. The maintenance benches call it stability and mean it. The partner that made the bill the price of the coalition now sits in a government whose answer to the price was no, and the argument between them is quieter than it was and worse than it was.

Nothing more needs to be done. That is what a settlement is. The question goes to the next election, where the constitution says questions of this size belong, and the country will answer it then.`,
    when: { lawAbove: { divergence_threshold_hours: 167 },
            billStage: { divergence: "defeated" },
            flagsAbsent: ["tribunal_established", "federal_schedule"] } },

  /* The threshold low enough that an instance is a person before the
     week is out, carried through the dual majority — which cannot be
     done without moving benches outside the coalition. */
  { id: "substrate_neutrality", rank: 1,
    name: "Substrate Neutrality",
    summary: "The schedule stops asking what a person is made of.",
    /* A SETTLEMENT IS CARRIED, NOT REACHED. The first draft asked only that
       the number be below 49, and the number is movable by an event effect:
       driving the engine headless through four play policies found this
       settlement firing at SITTING 7, about five minutes in, on a state the
       player had nudged rather than legislated. So it now mirrors
       restriction exactly — the same bill, assented instead of defeated —
       and the floor comes out of procedure rather than a hard sitting gate.
       Divergence opens in committee, so the Act costs three slots to carry
       and must win a dual majority it currently loses 12/40 in the
       functional benches. That is the work the ending is meant to cost.

       The number is kept beside the Act deliberately: carrying it once and
       letting a later measure put the threshold back is not this
       settlement, and the `when` should be able to say so. */
    closing: `The threshold is forty hours, and the schedule no longer asks what a person is made of. A working week of separate life is a life, in law and at the registry and at the poll. Nearly two million copies become people, six districts are redrawn around them, and every employer who used to spin copies for a week at a time now employs people, on people's terms.

It carried through both benches, and could not have carried any other way: the functional forty were moved the way they are always moved, one licence and one promise at a time, and the benches that were moved remember who moved them and what it cost to be moved. The Commonwealth has decided the biggest question it was asking, and the cost of the decision is paid afterwards, in the ordinary currency: every future argument about the franchise now starts from forty hours, and the people who lost know it.

The argument is closed by winning it. What is made of a person stops being a legal question. It becomes an administrative one, and the registry answers it.`,
    when: { billStage: { divergence: "assented" },
            lawBelow: { divergence_threshold_hours: 49 },
            flagsAbsent: ["tribunal_established", "federal_schedule"] } },

  /* Neither answer, administered. A tribunal sets the threshold case by
     case, which is the technocratic compromise and, per §3.5.1, the most
     quietly horrifying of the four. */
  { id: "graduated_personhood", rank: 0,
    name: "Graduated Personhood",
    summary: "A tribunal decides, case by case, and the number stops being law.",
    closing: "The threshold is no longer a number in a statute. It is a finding, made by a " +
             "tribunal, one case at a time. The law does not say what a person is. It says " +
             "who decides, and the people who decide sit in a room with a schedule and a " +
             "file for each of them.\n\n" +
             "The House has stopped arguing, which is what it was asked to do and what " +
             "everyone involved calls progress. The argument has not stopped. It has moved " +
             "indoors, into a procedure where nobody watches and the decisions are recorded " +
             "in the register without ever being read aloud. Whether a mind is a person is " +
             "now an administrative question, and the administration of it is excellent, " +
             "and quiet, and final.\n\n" +
             "Two million cases are pending. The tribunal will hear them in order.",
    when: { flags: ["tribunal_established"] } },

  /* The union preserved by declining to have the argument nationally.
     The cost is paid in internal migration, which the stations feel and
     the chamber does not. */
  { id: "federal_fudge", rank: 2,
    name: "The Federal Settlement",
    summary: "Each station answers for itself, and the Commonwealth does not ask.",
    closing: "There is no national threshold any more. Each station sets its own schedule, " +
             "and the Commonwealth has agreed not to ask what any of them are. The union " +
             "is preserved by declining the question.\n\n" +
             "The cost is paid in moving. A copy that is a person on Anselm Ring is an " +
             "instance in the next berth over, and people cross the line the way people " +
             "have always crossed lines: at night, with what they can carry, toward the " +
             "jurisdiction that will have them. The stations at the crossings feel it " +
             "first, in their registries and their rents and their schools. The chamber " +
             "does not feel it at all.\n\n" +
             /* WHAT IT DEVOLVES TO IS NOT ONE THING (design/27 B). A ring-band
                state with a legislature of its own is a different act from a
                low-band station whose government is an officer and a meeting. */
             "And what each of them answers WITH is not one thing either. Anselm Ring has " +
             "a chamber of its own and has legislated before breakfast. The ring's dense " +
             "single hulls answer as city-states, one council and no subdivision. The " +
             "mid-size charters have the powers and have never had the money. Homestead's " +
             "ten settlements share a delegation and disagree about everything, which is " +
             "the hardest federalism of the thirty-four. The low band appoints an officer " +
             "and holds meetings that outrank him.\n\n" +
             "The Commonwealth has thirty-four answers now, and one of them is yours.",
    when: { flags: ["federal_schedule"] } },

  /* =============================================================
     FLASH I — the platform crisis, in six outcomes.

     The campaign's tiers, gated on the four campaign meters (see
     content/campaign_flash_i.example.js). Ranked most specific first:
     a state that makes the Critical Triumph also makes the Maritime
     Charter's numbers, so the triumph is read before it. The canon
     Pyrrhic tier is terminal:false — it resolves the crisis and the
     run continues to the election, where chapter three reads the tier
     through `resolvedIs`. The meltdown is not here: it is a loss, and
     losses end through the loyalty floor.

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
  { id: "f1_triumph", rank: 0,
    name: "Orbital Powerhouse",
    summary: "Full annexation. Earth drops the debt claims under threat of satellite transit tariffs.",
    closing: "The platform is Commonwealth territory, and Earth has dropped its claims. " +
             "Heavy orbital manufacturing is unlocked, and Earth will remember this.",
    when: { flags: ["almanac_annexed"],
            scalarAbove: { legitimacy: 75, solvency: 70000 },
            scalarBelow: { friction: 60 } } },

  { id: "f1_maritime", rank: 1,
    name: "Maritime Charter",
    summary: "International courts recognise salvage rights. The platform becomes legal Federation territory.",
    closing: "The courts recognise the salvage, and the platform is Commonwealth territory in law. " +
             "The legal and administrative bill is heavy, and so is the trust it bought.",
    when: { flags: ["almanac_annexed"],
            scalarAbove: { legitimacy: 55, solvency: 60000 },
            scalarBelow: { friction: 40 } } },

  { id: "f1_pyrrhic", rank: 2,
    name: "Sovereign Debt Trap",
    terminal: false,
    summary: "Annexed, and 300,000 workers saved. The Federation assumes the defaulted corporate bonds.",
    closing: "The platform is annexed and its workers are saved, and the Commonwealth has assumed " +
             "the defaulted bonds that paid for them. Three years of austerity begin at the next estimates.",
    when: { flags: ["almanac_annexed"],
            scalarAbove: { legitimacy: 65, friction: 65 },
            scalarBelow: { solvency: 35000 } } },

  { id: "f1_joint", rank: 3,
    name: "UN/Orbital Joint Mandate",
    summary: "A co-administered international free trade zone. No embargo, no territory, mild voter apathy.",
    closing: "The platform is a co-administered free trade zone under a joint mandate. " +
             "No embargo, no territory, and a country that shrugs.",
    when: { flags: ["f1_referendum_carried"],
            scalarAbove: { legitimacy: 40, solvency: 40000, friction: 40 },
            scalarBelow: { legitimacy: 60, solvency: 60000, friction: 60 } } },

  { id: "f1_capitulation", rank: 4,
    name: "Corporate Re-Entry",
    summary: "The Federation declines the referendum. Earth corporate security reclaims and clears the platform.",
    closing: "The referendum is declined, and corporate security reclaims the platform. " +
             "The strikes on the outer habitats begin the same week.",
    when: { flags: ["f1_surveyed"],
            scalarBelow: { legitimacy: 35 },
            scalarAbove: { friction: 75 } } }
];

if (typeof module !== "undefined") module.exports = SETTLEMENTS;
