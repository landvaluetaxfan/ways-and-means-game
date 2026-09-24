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

  /* ---------- the endings ---------- */
  { id:"end_election", name:"Returned", tier:"ending",
    note:"The session ran out and the country voted, and your party came " +
         "back. This is the ending for a government that neither closed the " +
         "question nor lost it. The bill is still on the order paper for the " +
         "next parliament.",
    when:{ end:"election", seats:"held" } },

  { id:"end_supply", name:"No Confidence Without a Word", tier:"ending",
    note:"You never carried the appropriation. The House rose without supply, and the government fell for want of money. The bill was on the order paper from the first sitting.",
    when:{ end:"loss", reason:"supply" } },

  { id:"end_confidence", name:"Short by One", tier:"ending",
    note:"You lost a confidence division in the House. The majority you had been governing with was gone, and the government fell on the floor of the House.",
    when:{ end:"loss", reason:["confidence", "no confidence"] } },

  { id:"end_ballot", name:"The Caucus Decided", tier:"ending",
    note:"Enough of your own members signed to force a leadership ballot and " +
         "the ballot went against you. The party removed the Prime Minister " +
         "in a committee room; the country was never asked.",
    when:{ end:"loss", reason:"leadership" } },

  { id:"end_cascade", name:"The Cascade", tier:"ending",
    note:"The thermal margin reached zero and the stations stopped running. This loss comes from the meters: friction, a thin margin and a reserve that could not cover the next obligation, all at once.",
    when:{ end:"loss", reason:"cascade" } },

  /* ---------- the settlements ---------- */
  { id:"set_restriction", name:"The Question Is Not Reopened", tier:"settlement",
    note:"The divergence bill was defeated and the threshold stayed at a " +
         "hundred and sixty-eight hours. A copy separated from its source is " +
         "still an instance in law, with no separate wage and no separate " +
         "vote. The reform had to be put and lost; doing nothing does not " +
         "reach this.",
    when:{ settled:"restriction" } },

  { id:"set_neutrality", name:"Neither Side Won", tier:"settlement",
    note:"The divergence bill passed and the threshold fell to forty hours, " +
         "but with the licensing carve-out: a copy is a person, except that it " +
         "cannot hold a life-support licence, so the people who do that work " +
         "still cannot vote for the bench that regulates them.",
    when:{ settled:"substrate_neutrality" } },

  { id:"set_graduated", name:"A Line, Moved", tier:"settlement",
    note:"No threshold was set in law. A tribunal decides personhood case by " +
         "case and files its findings in the register without a division. The " +
         "House stopped arguing; the argument moved somewhere no one watches.",
    when:{ settled:"graduated_personhood" } },

  { id:"set_federal", name:"The Federal Fudge", tier:"settlement",
    note:`Each station sets its own threshold and the Commonwealth has agreed not to ask. There is no national answer any more, and a copy can be a person on one side of a line and an instance on the other. The people who cross pay for that.`,
    when:{ settled:"federal_fudge" } },

  /* ---------- unique actions ---------- */
  { id:"act_carveout_kept", name:"The Order Was Laid", tier:"action",
    note:"You promised the Guild Bench a licensure carve-out and laid SI " +
         "2080/44 inside the four sittings you named. The promise was kept, " +
         "and the panel records which governments keep them.",
    when:{ kept:["licensure_carveout"] } },

  { id:"act_carveout_broken", name:"The Order That Was Never Laid", tier:"action",
    note:"You promised the Guild Bench a licensure carve-out and did not lay " +
         "the order in time. The panel will not be asking again; the sector " +
         "treats the question as settled against you.",
    when:{ breached:["licensure_carveout"] } },

  { id:"act_tribunal", name:"The Tribunal Sits", tier:"action",
    note:"Your licensing order was challenged at the tribunal and you let it " +
         "be heard. A court is not a lobby: the numbers in the House do not " +
         "reach it, and the bench reads only whether the government turned up.",
    when:{ flags:["tr_challenged"] } },

  { id:"act_struck", name:"The Order Was Struck", tier:"action",
    note:"The tribunal struck your licensing order as unlawful. The order " +
         "stays on the book until you revoke it or refuse to, and the refusal " +
         "is a decision the bench records.",
    when:{ flags:["tr_struck"] } },

  { id:"act_paired", name:"A Courtesy", tier:"action",
    note:`You granted a courtesy pair — one member from each side stayed away — and did not call the favour in. A pair costs the government an aye and buys nothing in arithmetic. The other side now owes you one.`,
    when:{ flags:["paired","pair_offered"] } },

  { id:"act_forward", name:"Sold Forward", tier:"action",
    note:"You sold quota forward at a price fixed on the day. Whatever the " +
         "margin did afterwards, the price was set then and the quota leaves " +
         "when the term comes.",
    when:{ flags:["quota_forward_sold"] } },

  { id:"act_mars", name:"Eleven Sittings", tier:"action",
    note:"You sent a dispatch to the Chryse Basin and Nili Republic and the " +
         "answer came back eleven sittings later, to a Commonwealth that had " +
         "moved on in between. That gap is what the light-lag means.",
    when:{ flags:["mars_asked"] } },

  { id:"act_amendment", name:"Amended in Committee", tier:"action",
    note:"You amended the divergence bill in committee, either delaying it or carving the boards out of the franchise, and the bill survived.",
    when:{ flagsAny:["divergence_delayed","divergence_boards"] } },

  { id:"act_budget_delayed", name:"Held by the Benches", tier:"action",
    note:"The appropriation carried, but the functional benches held it for " +
         "three sittings first. You passed the budget and spent three " +
         "sittings of the session on the delay.",
    when:{ log:["Supply delayed"] } }
];
