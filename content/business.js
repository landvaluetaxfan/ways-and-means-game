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

  /* ---- questions: a member asks a minister, and the answer is a letter ---- */
  { id:"q_ember", kind:"question",
    text:"Oral question, Ember Ridge: when the radiator fault will be certified repaired." },
  { id:"q_homestead", kind:"question",
    text:"Written question, Homestead: tier-four suspensions recorded in the last quarter." },
  { id:"q_licensing", kind:"question",
    text:"Oral question: on whose advice the Life Support Licensing Board is composed." },
  { id:"q_tether", kind:"question",
    text:"Written question, the Liberal benches: the cost of the Tether 2 concession to date." },
  { id:"q_closure", kind:"question",
    text:"Oral question, Home Rule: the closure ratio of Coldwater against the federal floor." },
  { id:"q_lapse", kind:"question",
    text:"Written question: attestations lapsing under the eighteen-month rule, by station." },
  { id:"q_gravity", kind:"question",
    text:"Oral question, One-G: the waiting list for embodiment fitting." },
  { id:"q_reabsorb", kind:"question",
    text:"Written question, the Uplift Alliance: reabsorptions recorded since the last return." },
  { id:"q_reserve", kind:"question",
    text:"Written question: what remains in the reserve, and on whose authority." },
  { id:"q_patronage", kind:"question",
    text:"Oral question: appointments made to the licensing boards since the last sitting." },

  /* ---- committees: a room, a report, a recommendation nobody must follow ---- */
  { id:"c_radiator", kind:"committee",
    text:"The Committee on Life Support publishes its report on radiator certification." },
  { id:"c_appropriation", kind:"committee",
    text:"The Public Accounts Committee takes evidence on the emergency thermal appropriation." },
  { id:"c_reclass", kind:"committee",
    text:"The Committee on Persons and Continuity reports on the reclassification register." },
  { id:"c_lift", kind:"committee",
    text:"The Committee on Consumables sits on the quarterly lift schedule." },
  { id:"c_charter", kind:"committee",
    text:"The Select Committee on the Charter takes evidence on the emergency powers." },
  { id:"c_petition", kind:"committee",
    text:"The Petitions Committee meets for eleven minutes and adjourns." },
  { id:"c_fran", kind:"committee",
    text:"The Committee on Franchise and Apportionment hears evidence on the residual roll." },

  /* ---- statements: a member says a thing on the record ---- */
  { id:"s_closure", kind:"statement",
    text:"The Minister for Closure and Development makes a statement on the low band." },
  { id:"s_house", kind:"statement",
    text:"The Leader of the House makes a statement on the session's remaining time." },
  { id:"s_reserve", kind:"statement",
    text:"The Shadow Minister for the Treasury makes a statement on the reserve." },
  { id:"s_shed", kind:"statement",
    text:"A member for Homestead makes a personal statement on the shed order." },
  { id:"s_whip", kind:"statement",
    text:"The Chief Whip makes a business statement and takes no questions." },
  { id:"s_president", kind:"statement",
    text:"The President's office issues a written statement. It is read without comment." },
  { id:"s_registry", kind:"statement",
    text:"The Registry makes a statement on the independence of attestation." },

  /* ---- instruments: laid, not debated, and in force unless prayed ---- */
  { id:"i_attest", kind:"instrument",
    text:"An instrument is laid under the Attestation Act. It is not debated." },
  { id:"i_alloc", kind:"instrument",
    text:"An instrument is laid under the Allocation Act. It is not debated." },
  { id:"i_correct", kind:"instrument",
    text:"A correction to a statutory instrument is laid and the corrected text is printed." },
  { id:"i_negative", kind:"instrument",
    text:"An order is laid and stands unless prayed against within the window." },
  { id:"i_affirm", kind:"instrument",
    text:"An affirmative instrument is set down for approval and finds no time." },

  /* ---- petitions: the only direct voice in the room ---- */
  { id:"p_verge", kind:"petition",
    text:"A petition from the Verge is presented and read out in full." },
  { id:"p_tannery", kind:"petition",
    text:"A petition from the Tannery is presented and received without debate." },
  { id:"p_harvest", kind:"petition",
    text:"A petition signed by four thousand residents of Harvest is presented." },
  { id:"p_calloway", kind:"petition",
    text:"A petition from Calloway Loop asks for the interlink to be kept open." },

  /* ---- procedure: the House being a House ---- */
  { id:"pr_adjourn", kind:"procedure",
    text:"A motion for the adjournment is moved, debated for an hour, and withdrawn." },
  { id:"pr_first", kind:"procedure",
    text:"A bill is read a first time, ordered to be printed, and goes no further." },
  { id:"pr_committee", kind:"procedure",
    text:"The House resolves itself into committee and resolves itself out again." },
  { id:"pr_named", kind:"procedure",
    text:"A member is named by the Chair and leaves the chamber without being told to." },
  { id:"pr_table", kind:"procedure",
    text:"A paper is laid on the table and is available in the library." },

  /* ---- colour: the texture of a particular sitting ---- */
  { id:"x_thin", kind:"colour",
    text:"The chamber is thin. Two benches are absent and the whips do not explain." },
  { id:"x_return", kind:"colour",
    text:"The Bureau's return on suspended persons is published. Nobody reads it into the record." },
  { id:"x_authority", kind:"colour",
    text:"The engineering authority's quarterly report is laid and taken as read." },
  { id:"x_spindle", kind:"colour",
    text:"The Spindle's lobby note is circulated before the sitting and read during it." },
  { id:"x_defer", kind:"colour",
    text:"A division is deferred by agreement. Neither side says by whose." },

  /* ---- foreshadowing: only when the world is in that state ---- */

  /* a station in trouble asks, and the answer is a letter */
  { id:"f_homestead_lift", kind:"question",
    when:{ stationBelow:{ ashfield:{ closure:0.34 } } },
    text:"Urgent question, Homestead: whether the quarterly consumables lift will hold." },
  /* a government nobody is for looks like one */
  { id:"f_thin_gov", kind:"colour",
    when:{ scalarBelow:{ public_standing:30 } },
    text:"The opposition benches are unusually full. The government's are not." },
  /* the leadership paper is moving */
  { id:"f_names", kind:"colour",
    when:{ signaturesAtLeast:5 },
    text:"The names on the leadership paper are counted again, and the count has moved." },
  /* the quota price is being felt */
  { id:"f_quota", kind:"question",
    when:{ priceAbove:{ thermal:105 } },
    text:"Three benches table the same written question on the quota price." },
  /* the threshold has changed and the Registry is behind */
  { id:"f_registry_late", kind:"colour",
    when:{ lawBelow:{ divergence_threshold_hours:100 } },
    text:"The Registry's first return under the new threshold is laid, and it is late." },
  /* the reserve is thin and somebody has noticed */
  { id:"f_reserve_thin", kind:"question",
    when:{ scalarBelow:{ treasury:20 } },
    text:"Written question: the Treasury is asked to confirm the reserve figure in the House." },
  /* the Guild Bench has stopped taking meetings */
  { id:"f_guild", kind:"colour",
    when:{ flags:["board_packed"] },
    text:"The Alliance of Business and Government attends in full and speaks to nobody." },
  /* a promise is running out of time */
  { id:"f_owed", kind:"colour",
    when:{ owes:"licensure_carveout" },
    text:"A member asks, on a point of order, when the government intends to keep its word." }

];
