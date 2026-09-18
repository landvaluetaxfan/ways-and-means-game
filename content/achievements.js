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
   ============================================================= */

const ACHIEVEMENTS = [

  /* ---------- the endings ---------- */
  { id:"end_election", name:"Returned", tier:"ending",
    note:"The Commonwealth voted and the government came back.",
    when:{ end:"election", seats:"held" } },

  { id:"end_supply", name:"No Confidence Without a Word", tier:"ending",
    note:"The House rose without supply. A government cannot pay for itself.",
    when:{ end:"loss", reason:"supply" } },

  { id:"end_confidence", name:"Short by One", tier:"ending",
    note:"The majority was lost on the benches and not at the polls.",
    when:{ end:"loss", reason:"confidence" } },

  { id:"end_ballot", name:"The Caucus Decided", tier:"ending",
    note:"The party removed the Prime Minister. It has done it before.",
    when:{ end:"loss", reason:"leadership" } },

  { id:"end_cascade", name:"The Cascade", tier:"ending",
    note:"Friction, a thin margin and a small reserve, and the platform went dark.",
    when:{ end:"loss", reason:"cascade" } },

  /* ---------- the settlements ---------- */
  { id:"set_restriction", name:"The Question Is Not Reopened", tier:"settlement",
    note:"The threshold stands where the founders put it.",
    when:{ settled:"restriction" } },

  { id:"set_neutrality", name:"Neither Side Won", tier:"settlement",
    note:"The substrate settlement. Nobody's argument was answered and the country stopped asking.",
    when:{ settled:"substrate_neutrality" } },

  { id:"set_graduated", name:"A Line, Moved", tier:"settlement",
    note:"Graduated personhood, which is the most Commonwealth answer there is.",
    when:{ settled:"graduated_personhood" } },

  { id:"set_federal", name:"The Federal Fudge", tier:"settlement",
    note:"Neither sovereign and neither wrong.",
    when:{ settled:"federal_fudge" } },

  { id:"set_triumph", name:"Orbital Powerhouse", tier:"settlement",
    note:"Annexation, and Earth dropped the claims.",
    when:{ resolved:"f1_triumph" } },

  { id:"set_maritime", name:"Maritime Charter", tier:"settlement",
    note:"The courts recognised the salvage.",
    when:{ resolved:"f1_maritime" } },

  { id:"set_pyrrhic", name:"Sovereign Debt Trap", tier:"settlement",
    note:"Three hundred thousand saved and the bonds assumed. The canon ending.",
    when:{ resolved:"f1_pyrrhic" } },

  { id:"set_joint", name:"Joint Mandate", tier:"settlement",
    note:"A free trade zone, and a country that shrugs.",
    when:{ resolved:"f1_joint" } },

  { id:"set_capitulation", name:"Corporate Re-Entry", tier:"settlement",
    note:"The referendum declined and the platform reclaimed.",
    when:{ resolved:"f1_capitulation" } },

  /* ---------- the supercanon ---------- */
  { id:"supercanon", name:"Ways and Means", tier:"canon",
    note:"The debt trap AND the House it was written for: the pyrrhic tier " +
         "carried, and the government returned on it. The campaign's canon " +
         "result with the canon arithmetic.",
    when:{ resolved:"f1_pyrrhic", end:"election", seats:"held" } },

  /* ---------- unique actions ---------- */
  { id:"act_carveout_kept", name:"The Order Was Laid", tier:"action",
    note:"The Guild's carve-out promised and laid inside its four sittings.",
    when:{ flags:["licensure_carveout_offered"], logAbsent:["was not laid","not renewed"] } },

  { id:"act_carveout_broken", name:"The Order That Was Never Laid", tier:"action",
    note:"A promise to the panel, made and not kept.",
    when:{ flags:["gb_carveout_broken"] } },

  { id:"act_tribunal", name:"The Tribunal Sits", tier:"action",
    note:"The government's own order challenged, and the bench heard it.",
    when:{ flags:["tr_challenged"] } },

  { id:"act_struck", name:"The Order Was Struck", tier:"action",
    note:"The Tribunal found the government's order unlawful.",
    when:{ flags:["tr_struck"] } },

  { id:"act_paired", name:"A Courtesy", tier:"action",
    note:"A pair given and not called in. The other side banked it.",
    when:{ flags:["paired","pair_offered"] } },

  { id:"act_forward", name:"Sold Forward", tier:"action",
    note:"Quota sold forward and delivered. The price was fixed and the margin left.",
    when:{ flags:["quota_forward_sold"] } },

  { id:"act_indemnity", name:"Cover Taken", tier:"action",
    note:"An indemnity against the freeze, and the premium paid either way.",
    when:{ flags:["indemnity_taken"] } },

  { id:"act_annexed", name:"The Question Was Carried", tier:"action",
    note:"The referendum recognised and the platform annexed.",
    when:{ flags:["f1_annexing"] } },

  { id:"act_mars", name:"Eleven Sittings", tier:"action",
    note:"A dispatch to the Chryse Basin and Nili Republic, and an answer from a world that had moved.",
    when:{ flags:["mars_asked"] } },

  { id:"act_amendment", name:"Amended in Committee", tier:"action",
    note:"A bill changed rather than killed, which is what committee is for.",
    when:{ flagsAny:["divergence_delayed","divergence_boards"] } },

  { id:"act_budget_delayed", name:"Held by the Benches", tier:"action",
    note:"The appropriation carried, and the functional forty held it for three sittings.",
    when:{ log:["Supply delayed"] } }
];
