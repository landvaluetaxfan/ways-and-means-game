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

   The prose here is a PLACEHOLDER of the plainest kind: one line saying
   what the state now is, so the mechanism can be tested and seen. The
   endings themselves are opencode's to write.
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
    /* TODO opencode: the closing prose. */
    summary: "The threshold stands where it stood, and the schedule is not reopened.",
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
    when: { billStage: { divergence: "assented" },
            lawBelow: { divergence_threshold_hours: 49 },
            flagsAbsent: ["tribunal_established", "federal_schedule"] } },

  /* Neither answer, administered. A tribunal sets the threshold case by
     case, which is the technocratic compromise and, per §3.5.1, the most
     quietly horrifying of the four. */
  { id: "graduated_personhood", rank: 0,
    name: "Graduated Personhood",
    summary: "A tribunal decides, case by case, and the number stops being law.",
    when: { flags: ["tribunal_established"] } },

  /* The union preserved by declining to have the argument nationally.
     The cost is paid in internal migration, which the stations feel and
     the chamber does not. */
  { id: "federal_fudge", rank: 2,
    name: "The Federal Settlement",
    summary: "Each station answers for itself, and the Commonwealth does not ask.",
    when: { flags: ["federal_schedule"] } }
];

if (typeof module !== "undefined") module.exports = SETTLEMENTS;
