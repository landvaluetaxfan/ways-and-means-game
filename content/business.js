/* =============================================================
   BUSINESS — the order paper when nothing is asked.

   design/17 §2.2: thirty-nine of sixty sittings had nothing in
   them, and a player who met "nothing demands a decision" thirty
   times read it as a missing placeholder rather than as the state
   of the world. A real parliament always has business: questions
   taken, a committee reporting, an instrument laid, a member's
   statement.

   So these are the lines a quiet sitting prints. NOTHING HERE IS A
   DECISION. None of it is a control, none of it moves a number, and
   none of it is gated on being read. It is the room being a room,
   and it is what tells the player the House is a place that keeps
   meeting whether or not they are the story.

   text   one line, in the order-paper register. Plain, dry, no em
          dashes: it is a procedural record, not prose.
   kind   question | committee | statement | instrument | petition |
          procedure | colour. A marker, not a mechanic.
   when   the usual conditions (see js/engine.js CONDITIONS). Most
          entries are unconditional. A handful are gated so that the
          texture of a sitting answers to the state of the world,
          and so a few lines foreshadow what is coming.

   SELECTION IS DETERMINISTIC. Engine.business() draws from this
   pool using the seed and the sitting, so the same playthrough
   always prints the same order paper and the tests can assert it.
   Do not add randomness here.

   The guide: one line should be readable on its own, in a glance,
   by a player who is about to press Rise. If a line needs the
   sitting before it or the one after it, it is a scene, and a scene
   belongs in events.js.
   ============================================================= */

const BUSINESS = [

];
