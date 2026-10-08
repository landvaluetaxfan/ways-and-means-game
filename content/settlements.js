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
];

if (typeof module !== "undefined") module.exports = SETTLEMENTS;
