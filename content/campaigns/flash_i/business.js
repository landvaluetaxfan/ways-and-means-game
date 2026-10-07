/* =============================================================
   FLASH I — BUSINESS. The lines a quiet sitting prints on the order paper (content/business.js
   says what they are for). Act I's own, written for design/80: the world's old pool is retired from
   this view (`business` is a story kind, so an untagged line belongs to the world's view alone),
   and nothing here names a thing the story has not brought in by the sitting that can print it.
   Sittings 12 and 13 have no scene, so these are most of what they hold.

   Order-paper register: one line, plain and dry, no figure of speech. A line that needs the one
   before it is a scene. Added and tagged for the campaign by `campaign()`.
   ============================================================= */
campaign("flash_i", { business: [

  /* ---- questions ---- */
  { id:"a1_q_ember", kind:"question",
    text:"Oral question, Ember Ridge: when the failed radiator array will be replaced." },
  { id:"a1_q_estimates", kind:"question",
    text:"Written question, the Liberal benches: the Treasury's costing of each clause of the estimates." },
  { id:"a1_q_closure", kind:"question",
    text:"Oral question, Home Rule: how the consumables floor reaches the stations with the lowest closure." },
  { id:"a1_q_lowest_band", kind:"question",
    text:"Oral question, the Association of Engineers and Systems: whether an engineering authority must tell a minister before it switches off a station's lowest band." },
  { id:"a1_q_means_test", kind:"question",
    text:"Written question, the New Progressive Party: how many residents the means test on substrate insurance has left suspended." },
  { id:"a1_q_clause", kind:"question",
    text:"Oral question: which clause of the estimates the Treasury would cut first if the reserve fell." },
  { id:"a1_q_lift", kind:"question",
    text:"Written question, Homestead: the date of the next consumables delivery." },

  /* ---- committees ---- */
  { id:"a1_c_estimates", kind:"committee",
    text:"The Estimates Committee takes evidence from the Treasury on the draft estimates." },
  { id:"a1_c_life_support", kind:"committee",
    text:"The Committee on Life Support takes evidence on radiator certification at Ember Ridge." },
  { id:"a1_c_anchors", kind:"committee",
    text:"The Committee on Trade and the Anchors takes evidence on the renewed terms for the International Earth-Orbit Elevator." },
  { id:"a1_c_petitions", kind:"committee",
    text:"The Petitions Committee meets for eleven minutes and adjourns." },

  /* ---- statements ---- */
  { id:"a1_s_thermal", kind:"statement",
    text:"The Minister for Substrate and Thermal makes a statement on cooling at Ember Ridge." },
  { id:"a1_s_whip", kind:"statement",
    text:"The Chief Whip makes a business statement on the time left before the House rises." },
  { id:"a1_s_reserve", kind:"statement",
    text:"The Shadow Minister for the Treasury makes a statement on the reserve." },
  { id:"a1_s_homestead", kind:"statement",
    text:"A member for Homestead makes a personal statement on the consumables lift." },

  /* ---- instruments, petitions, procedure ---- */
  { id:"a1_i_negative", kind:"instrument",
    text:"An order is laid and stands unless the House votes against it within the sittings the order names." },
  { id:"a1_i_revoked", kind:"instrument",
    text:"An order is revoked by a further order. Neither is debated." },
  { id:"a1_p_verge", kind:"petition",
    text:"A petition from the Verge is presented and read out in full." },
  { id:"a1_p_calloway", kind:"petition",
    text:"A petition from Calloway Loop asks for the federal power interlink to be kept open." },
  { id:"a1_pr_adjourn", kind:"procedure",
    text:"A motion for the adjournment is moved, debated for an hour, and withdrawn." },
  { id:"a1_pr_committee", kind:"procedure",
    text:"The House resolves itself into committee and resolves itself out again." },

  /* ---- colour ---- */
  { id:"a1_x_thin", kind:"colour",
    text:"The chamber is thin. Two benches are absent and the whips do not explain." },
  { id:"a1_x_spindle", kind:"colour",
    text:"The Spindle's lobby note is circulated before the sitting and read during it." },
  { id:"a1_x_lobby", kind:"colour",
    text:"The lobbies are fuller than the chamber, and the whips are counting." },

  /* ---- gated: the texture answers to the state ---- */
  { id:"a1_f_paid", kind:"committee", when:{ flags:["supply_granted"] },
    text:"The Estimates Committee confirms that the appropriation has been paid in." },
  { id:"a1_f_returns", kind:"colour", when:{ flags:["supply_granted"] },
    text:"The order paper lists the budget's returns. The House reads them like a newspaper." },
  { id:"a1_f_thin_gov", kind:"colour", when:{ scalarBelow:{ public_standing:30 } },
    text:"The opposition benches are unusually full. The government's are not." },
  { id:"a1_f_names", kind:"colour", when:{ signaturesAtLeast:5 },
    text:"The names on the leadership paper are counted again, and the count has moved." },
  { id:"a1_f_reserve_thin", kind:"question", when:{ scalarBelow:{ solvency:20000 } },
    text:"Written question: the Treasury is asked to confirm the reserve figure in the House." }

] });
