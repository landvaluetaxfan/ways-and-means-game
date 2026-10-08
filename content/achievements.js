/* =============================================================
   ACHIEVEMENTS — what a government is remembered for.

   THE RULE: an achievement is a FACT ABOUT A FINISHED RUN, evaluated
   against the record, never a score. Nothing here changes the game, and
   nothing is awarded for time spent.

   Each entry's `when` is a plain AND of fields, read off the finished
   save and the shell's own record of it:

     end      loss | settlement | election
     reason   the loss reason, where there was one
     resolved the Flash I tier that resolved the crisis, if one did
     settled  the terminal settlement id, if one landed
     seats    "held" (returned) or "lost" (not), for an election
     flags    the finished save's flags, all of them
     log      the finished save's log lines

   The supercanon is the point of the file: the canon RESULT and the canon
   ARITHMETIC together. A player who reaches the debt trap on the wrong
   House has the ending and not the story, which is the distinction this
   whole file exists to draw.

   `note` is the board's description and the only hint a locked tile gives,
   so it says what the player DID and what the run amounted to. The board
   shows it only when the tile is opened: what the achievement is, first,
   and the colour afterwards.
   ============================================================= */

const ACHIEVEMENTS = [
];
