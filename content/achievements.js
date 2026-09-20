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

   `note` is the board's description. It says what the achievement IS, and
   for one not yet earned it is the only hint the player gets, so it is
   written as a fact about the run rather than a slogan. The board shows it
   only when the tile is opened.
   ============================================================= */

const ACHIEVEMENTS = [

  /* ---------- the endings ---------- */
  { id:"end_election", name:"Returned", tier:"ending",
    note:"The House rose at the end of its session and the country sent the " +
         "government back. Nothing had to be settled for this one; the " +
         "question the bill was about is still open, and the next parliament " +
         "inherits it.",
    when:{ end:"election", seats:"held" } },

  { id:"end_supply", name:"No Confidence Without a Word", tier:"ending",
    note:"The government never carried its appropriation, and the House rose " +
         "without supply. The money to pay for itself was on the order paper " +
         "from the first sitting, which is what makes this the loss a " +
         "government cannot argue its way out of.",
    when:{ end:"loss", reason:"supply" } },

  { id:"end_confidence", name:"Short by One", tier:"ending",
    note:"The government lost a confidence vote on the floor and fell on the " +
         "arithmetic of the benches, not at an election. The majority it had " +
         "been governing with was gone before the country was ever asked.",
    when:{ end:"loss", reason:"confidence" } },

  { id:"end_ballot", name:"The Caucus Decided", tier:"ending",
    note:"The party's own benches removed the Prime Minister. A leadership " +
         "ballot is decided in a committee room, on a paper that is destroyed " +
         "afterwards, and it never reaches the country at all.",
    when:{ end:"loss", reason:"leadership" } },

  { id:"end_cascade", name:"The Cascade", tier:"ending",
    note:"The thermal margin reached zero and the stations went dark. High " +
         "friction, a thin margin and a reserve that could not cover the next " +
         "obligation, all at once, is the one loss the government cannot " +
         "share with anyone.",
    when:{ end:"loss", reason:"cascade" } },

  /* ---------- the settlements ---------- */
  { id:"set_restriction", name:"The Question Is Not Reopened", tier:"settlement",
    note:"The threshold stands at a hundred and sixty-eight hours and the " +
         "bill that would have moved it is dead. This has to be earned: the " +
         "reform must have been put and lost, because doing nothing does not " +
         "reach it.",
    when:{ settled:"restriction" } },

  { id:"set_neutrality", name:"Neither Side Won", tier:"settlement",
    note:"The divergence bill carried and the threshold came down, but the " +
         "licence was carved out of the franchise, so the people whose work " +
         "is licensed still do not vote for the bench that regulates them. " +
         "Nobody's argument was answered and the country stopped asking.",
    when:{ settled:"substrate_neutrality" } },

  { id:"set_graduated", name:"A Line, Moved", tier:"settlement",
    note:"A tribunal now decides what a person is, case by case. The House " +
         "stopped arguing, which is what it asked for, and the argument moved " +
         "indoors into a procedure nobody watches and no division can reach.",
    when:{ settled:"graduated_personhood" } },

  { id:"set_federal", name:"The Federal Fudge", tier:"settlement",
    note:"Each station sets its own threshold and the Commonwealth has agreed " +
         "not to ask. The union is preserved by declining the question; the " +
         "cost is paid by the people who cross the line at night toward the " +
         "jurisdiction that will have them.",
    when:{ settled:"federal_fudge" } },

  { id:"set_triumph", name:"Orbital Powerhouse", tier:"settlement",
    note:"The Works came in and Earth dropped the debt claims rather than " +
         "test what the Commonwealth would do with the anchors it holds. " +
         "Full annexation on the Commonwealth's terms is the strongest result " +
         "the campaign offers and the hardest to earn.",
    when:{ resolved:"f1_triumph" } },

  { id:"set_maritime", name:"Maritime Charter", tier:"settlement",
    note:"The courts recognised the salvage, which makes the Works " +
         "Commonwealth territory in law without a shot fired. The legal and " +
         "administrative bill is heavy, and so is the trust it bought.",
    when:{ resolved:"f1_maritime" } },

  { id:"set_pyrrhic", name:"Sovereign Debt Trap", tier:"settlement",
    note:"The Works is annexed and its people are carried, and the " +
         "Commonwealth has assumed the defaulted bonds that paid for it. " +
         "Three years of austerity begin at the next estimates. This is the " +
         "campaign's canon ending.",
    when:{ resolved:"f1_pyrrhic" } },

  { id:"set_joint", name:"Joint Mandate", tier:"settlement",
    note:"The referendum was recognised and the Works became a " +
         "co-administered free trade zone. No embargo, no territory, and a " +
         "country that shrugged: the settlement nobody has to defend and " +
         "nobody remembers.",
    when:{ resolved:"f1_joint" } },

  { id:"set_capitulation", name:"Corporate Re-Entry", tier:"settlement",
    note:"The referendum was declined and corporate security went back into " +
         "the Works. The strikes on the outer habitats began the same week; " +
         "this is what it looks like when the Commonwealth decides the Works " +
         "is not its problem.",
    when:{ resolved:"f1_capitulation" } },

  /* ---------- the supercanon ---------- */
  { id:"supercanon", name:"Ways and Means", tier:"canon",
    note:"The pyrrhic tier and the House it was written for. The Works came " +
         "in, the bonds were assumed, and the government that did it was " +
         "returned on the result. The campaign's canon result with the canon " +
         "arithmetic, and the hardest ending to reach.",
    when:{ resolved:"f1_pyrrhic", end:"election", seats:"held" } },

  /* ---------- unique actions ---------- */
  { id:"act_carveout_kept", name:"The Order Was Laid", tier:"action",
    note:"The government promised the panel a licensure carve-out and laid " +
         "the order inside the four sittings it named. The panel remembers " +
         "which government kept that promise, and it remembers the other kind " +
         "too.",
    when:{ flags:["licensure_carveout_offered"], logAbsent:["was not laid","not renewed"] } },

  { id:"act_carveout_broken", name:"The Order That Was Never Laid", tier:"action",
    note:"A promise made to the panel in private and not kept. The chair does " +
         "not call it a breach; she calls it a schedule, and the sector treats " +
         "the question as settled.",
    when:{ flags:["gb_carveout_broken"] } },

  { id:"act_tribunal", name:"The Tribunal Sits", tier:"action",
    note:"The government's own licensing order was challenged at the tribunal " +
         "and the bench heard it. The numbers in the House do not reach a " +
         "court; the only thing that moves it is whether the government turned " +
         "up.",
    when:{ flags:["tr_challenged"] } },

  { id:"act_struck", name:"The Order Was Struck", tier:"action",
    note:"The tribunal found the government's order unlawful as made. It " +
         "stays on the book until the government revokes it or refuses to, and " +
         "refusing is a decision the bench records.",
    when:{ flags:["tr_struck"] } },

  { id:"act_paired", name:"A Courtesy", tier:"action",
    note:"A pair was given and not called in. The government gave up an aye " +
         "and the other side gave up a nay, and the bar did not move an inch; " +
         "the other side banked the kindness and did not spend it.",
    when:{ flags:["paired","pair_offered"] } },

  { id:"act_forward", name:"Sold Forward", tier:"action",
    note:"Quota was sold forward at a price fixed on the day, and delivered. " +
         "Whatever the margin did in between, the price was set then and the " +
         "quota left now: the position reads the state of the world on the " +
         "sitting it lands.",
    when:{ flags:["quota_forward_sold"] } },

  { id:"act_indemnity", name:"Cover Taken", tier:"action",
    note:"An indemnity was taken against the freeze. The premium is spent " +
         "either way; the achievement is having the cover on the day the " +
         "accounts froze, and the payout answering.",
    when:{ flags:["indemnity_taken"] } },

  { id:"act_annexed", name:"The Question Was Carried", tier:"action",
    note:"The referendum was recognised and the Works was brought in. This is " +
         "the decision the campaign is about, and the settlement that follows " +
         "from it is what the rest of the session is for.",
    when:{ flags:["f1_annexing"] } },

  { id:"act_mars", name:"Eleven Sittings", tier:"action",
    note:"A dispatch went to the Chryse Basin and Nili Republic and the answer " +
         "came back eleven sittings later, to a Commonwealth that had moved on " +
         "in the meantime. That gap is the whole of what the light-lag means.",
    when:{ flags:["mars_asked"] } },

  { id:"act_amendment", name:"Amended in Committee", tier:"action",
    note:"A bill was changed in committee rather than killed. The threshold " +
         "bill can be delayed or have the boards carved out of it; either is a " +
         "bill the House altered instead of refusing.",
    when:{ flagsAny:["divergence_delayed","divergence_boards"] } },

  { id:"act_budget_delayed", name:"Held by the Benches", tier:"action",
    note:"The appropriation carried, and the functional forty held it for " +
         "three sittings first. A bench that owns the subject can hold up a " +
         "money bill; it cannot stop it, and the calendar shows the delay.",
    when:{ log:["Supply delayed"] } }
];
