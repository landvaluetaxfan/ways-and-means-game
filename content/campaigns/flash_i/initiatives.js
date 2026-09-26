/* =============================================================
   FLASH I — INITIATIVES. The facility, Earth's terms, two of the four
   markets, and the four pivots. Tagged and added to the world's
   INITIATIVES by `campaign()`; the other two markets are the world's.
   ============================================================= */
campaign("flash_i", { initiatives: [

  /* REPAYING THE EMERGENCY FACILITY (the author, 23 Sep: the loan is
     repayable). A Treasury act, not House business, so it costs no
     order-paper time. Two ways: the cash, which needs the reserve to hold
     it, or the security, which settles now at no margin what the Alliance
     would otherwise take at the rise with ten per cent on top. Either clears
     what is owed to the Alliance, which is what discharges `f1_debt`. */
  { id: "repay_facility",
    title: "Repay the emergency facility",
    note: "The Alliance of Business and Government is owed nineteen billion " +
          "eight hundred million dollars, principal and the printed rate, secured on " +
          "the Cordell leases. Unpaid when the House rises, it is called with " +
          "a margin of ten per cent.",
    cost: 0,
    when: { owes: ["f1_debt"] },
    event: "f1_facility_closed",
    tempo: [
      { label: "In full, from the reserve", after: 1,
        when: { scalarAbove: { solvency: 19799 } },
        effects: [ { move: { solvency: -19800, "debt.alliance": -19800 } },
                   { flag: "f1_debt_repaid" }, { flag: { cordell_leases_pledged: false } } ] },
      { label: "Against the Cordell leases", after: 1,
        effects: [ { move: { "debt.alliance": -19800 } },
                   { flag: "f1_debt_repaid" }, { flag: "cordell_leases_ceded" },
                   { move: { "loyalty.gb": 4, public_standing: -3, legitimacy: -4 } } ] }
    ] },

  /* ASKING EARTH FOR TERMS (design/34 D4). Earth's price for standing its
     measures down was a weighted event, so whether a government could ever
     settle the quarrel was a matter of what else the House had that week --
     and after the Sovereign Debt Trap the quarrel drains the thermal margin
     every sitting, which since 23 Sep can end the run during the campaign.
     The government may now ask. The answer is the same list of terms. */
  { id: "seek_terms",
    title: "Ask Earth's banks for terms",
    note: "What Earth's banks would take to lift their measures against the " +
          "Commonwealth. The answer comes as a list, and the list has a price.",
    cost: 1,
    when: { scalarAbove: { friction: 45 } },
    event: "fa_conciliate",
    tempo: [
      { label: "Through the Foreign Minister", after: 2,
        effects: [ { move: { "rel.landry": 3 } } ] },
      { label: "Through the Underwriters, who price the quarrel", after: 4,
        effects: [ { move: { friction: -2, solvency: -1500, "actor.underwriters": 3 } } ] }
    ] },

  /* UNDERWRITING (design/28 §3). The Underwriters hold the only complete
     numbers on failure, so they do not campaign and they do not negotiate:
     they quote a premium and carry one named risk for a term. The named
     risk is the freeze, which is why the instrument only exists once the
     crisis is running. The premium is certain and the payout is not, and
     that is the whole trade. */
  { id: "take_indemnity",
    title: "Take an indemnity",
    note: "The Underwriters will carry the platform's running costs for one " +
          "term. The premium is quoted now and the cover runs from today. At " +
          "the end of the term they settle against what actually happened.",
    cost: 1,
    when: { flagsAbsent: ["indemnity_taken"], chapterAtLeast: 2 },
    event: "indemnity_settles",
    tempo: [
      { label: "Cover the suppliers' exposure", after: 6,
        effects: [ { move: { "solvency": -3000 } },
                   { move: { "actor.underwriters": 3 } },
                   { flag: { indemnity_suppliers: true, indemnity_taken: true } } ] },
      { label: "Cover the whole life-support line", after: 8, cost: 1,
        effects: [ { move: { "solvency": -7000 } }, { move: { "legitimacy": 2 } },
                   { move: { "actor.underwriters": 5 } },
                   { flag: { indemnity_lifesupport: true, indemnity_taken: true } } ] }
    ] },

  /* SUBSTRATE FUTURES AND DEBT (design/28 §3). The abandoned platform's
     debt is secured against the continuation of the people on it. The
     Commonwealth can take that debt onto its own books or cancel it.
     Flash I's pyrrhic tier is the worked example of what happens when it
     is left where it is. The survey has to have found the debt first. */
  { id: "assume_substrate_debt",
    title: "Deal with the platform's substrate debt",
    note: "The debt runs against the instances and the substrate of the " +
          "184,000 people on the Almanac Works. The Commonwealth " +
          "can assume it, or write it off, and the Underwriters will price " +
          "the difference either way.",
    cost: 1,
    when: { flags: ["f1_surveyed"], flagsAbsent: ["substrate_debt_dealt"] },
    event: "substrate_debt_settles",
    tempo: [
      { label: "Write it off", after: 3,
        effects: [ { move: { "solvency": 4000 } }, { move: { "legitimacy": -6 } },
                   { move: { "friction": 6 } }, { move: { "actor.underwriters": 6 } },
                   { flag: { debt_written_off: true, substrate_debt_dealt: true } } ] },
      { label: "Assume it", after: 5,
        effects: [ { move: { "solvency": -12000 } }, { move: { "legitimacy": 8 } },
                   { move: { "friction": -4 } }, { move: { "actor.underwriters": -4 } },
                   { flag: { debt_assumed: true, substrate_debt_dealt: true } } ] }
    ] },

  /* =============================================================
     FLASH I'S PIVOTS (design/35), one per outcome tier: EXAMPLES TO
     REWRITE. Each is an initiative that costs something real and pulls a
     failing run back toward a bruised stalemate, as the author's plan
     says a panic button should. The answers are at the end of events.js
     beside this file.
     ============================================================= */

  /* MELTDOWN'S PIVOT: "Temporarily suspend civil liberties to prevent
     government collapse (drives DL to 0)". Open once the second floor has
     given; while it stands the meltdown cannot come. */
  { id: "declare_emergency",
    title: "Declare a state of emergency",
    note: "Suspends assembly, movement between stations and the House's power " +
          "to remove the government, by order, for a fixed term. It holds the " +
          "government up, and it costs everything the government has left in " +
          "legitimacy.",
    cost: 0,
    when: { flags: ["f1_second_floor"], flagsAbsent: ["f1_emergency"] },
    event: "f1_emergency_declared",
    tempo: [
      { label: "For eight sittings", after: 1,
        effects: [ { flag: "f1_emergency" },
                   { move: { legitimacy: -100, thermal_margin: 6, public_standing: -12 } },
                   { queue: [{ event: "f1_emergency_lapses", after: 8 }] } ] },
      { label: "For four sittings", after: 1,
        effects: [ { flag: "f1_emergency" },
                   { move: { legitimacy: -100, thermal_margin: 3, public_standing: -6 } },
                   { queue: [{ event: "f1_emergency_lapses", after: 4 }] } ] }
    ] },

  /* THE PYRRHIC TIER'S PIVOT: "Sell mining leases to private cartels to pay
     down interest." Open after the debt trap, if the leases are still the
     Commonwealth's and not pledged against the emergency facility. The
     interest here is what the quarrel costs: friction prices Earth's
     lending and the couplings drain the reserve above 65. */
  { id: "sell_the_leases",
    title: "Sell the Cordell mining leases",
    note: "The leases came with the platform. Sold, they pay down what the " +
          "quarrel is costing, and they do not come back.",
    cost: 0,
    when: { resolvedIs: "f1_pyrrhic",
            flagsAbsent: ["cordell_leases_ceded", "cordell_leases_pledged"] },
    event: "f1_leases_sold",
    tempo: [
      { label: "Privately, to the Alliance", after: 1,
        effects: [ { flag: "cordell_leases_ceded" },
                   { move: { solvency: 20000, friction: -2, "loyalty.gb": 5, legitimacy: -4,
                             "loyalty.cu_maintenance": -6 } } ] },
      { label: "At auction, to the consortiums", after: 2,
        effects: [ { flag: "cordell_leases_ceded" },
                   { move: { solvency: 16000, friction: -4, "loyalty.cu_maintenance": -6,
                             public_standing: -3 } } ] }
    ] },

  /* THE JOINT MANDATE'S PIVOT: "Negotiate exclusive cargo access fees to
     monetize the buffer zone." */
  { id: "lease_the_zone",
    title: "Charge for access to the free zone",
    note: "The joint mandate made the platform a free trade zone the " +
          "Commonwealth administers and does not own. The cargo that passes " +
          "through it can be charged for.",
    cost: 1,
    when: { resolvedIs: "f1_joint" },
    event: "f1_zone_leased",
    tempo: [
      { label: "Exclusive berths to one consortium", after: 2,
        effects: [ { move: { solvency: 9000, friction: 4, "loyalty.gb": 4, public_standing: -2 } } ] },
      { label: "A posted fee to every carrier", after: 3,
        effects: [ { move: { solvency: 4000, "trend.solvency": 300, friction: 1, legitimacy: 2 } } ] }
    ] },

  /* THE CAPITULATION'S PIVOT: "Fire the Foreign Minister to absorb blame and
     restore public trust." It vacates the post, whoever holds it, and the
     vacancy is filled the usual way. */
  { id: "sacrifice_the_minister",
    title: "Let the Minister for External Relations take the blame",
    note: "The referendum was declined and the platform cleared. Somebody " +
          "resigns for it, and the country is told who. It restores a little " +
          "of the trust the capitulation cost.",
    cost: 0,
    when: { resolvedIs: "f1_capitulation" },
    event: "f1_minister_resigns",
    tempo: [
      { label: "Accept a resignation, with thanks", after: 1,
        effects: [ { cabinet: { external_relations: null } },
                   { move: { legitimacy: 8, public_standing: 4, "loyalty.cu_loyalists": -4 } } ] },
      { label: "Dismiss the Minister", after: 1,
        effects: [ { cabinet: { external_relations: null } },
                   { move: { legitimacy: 12, public_standing: 7, "loyalty.cu_loyalists": -8 } } ] }
    ] },


  /* =============================================================
     MUTUAL VULNERABILITY (design/35): THE COMMONWEALTH'S LEVER.
     Earth's pressure is friction and its couplings; this is the
     Commonwealth's answer in kind. Holding back the power relays, and
     with them the maintenance crews, costs the Commonwealth trade and
     the Alliance's goodwill, and Earth answers after its lag. Which side
     gives way is decided by whose stores run out first (the answer
     event). EXAMPLES TO REWRITE, like the pivots above.
     ============================================================= */
  { id: "hold_the_relays",
    title: "Hold back the power relays",
    note: "Earth draws power from the Commonwealth's orbital relays and relies on its crews to " +
          "maintain its satellites. Holding either back costs Earth directly, and costs the " +
          "Commonwealth the trade.",
    cost: 1,
    when: { scalarAbove: { friction: 50 }, flagsAbsent: ["relays_held"] },
    event: "f1_earth_answers",
    tempo: [
      { label: "The power relays", after: 2,
        effects: [ { flag: "relays_held" }, { economy: { trade: -8 } },
                   { move: { legitimacy: 2, "loyalty.gb": -4, "actor.earth_bloc": -6 } } ] },
      { label: "The relays and the maintenance crews", after: 2,
        effects: [ { flag: { relays_held: true, crews_held: true } }, { economy: { trade: -15 } },
                   { move: { legitimacy: 3, friction: 4, "loyalty.gb": -8, "actor.earth_bloc": -10 } } ] }
    ] },

  /* and the way back, which is giving way */
  { id: "restore_the_relays",
    title: "Switch the relays back on",
    note: "Restores the power relays and the maintenance crews without waiting for Earth to move.",
    cost: 0,
    when: { flags: ["relays_held"] },
    event: "f1_relays_restored",
    tempo: [
      { label: "Restore them now", after: 1,
        effects: [ { flag: { relays_held: false, crews_held: false } }, { economy: { trade: 8 } },
                   { move: { legitimacy: -4, friction: -3, "loyalty.gb": 4 } } ] }
    ] },


  /* WORKING THE FLOOR IN NEW YORK (design/43): standing with the
     Assembly's members, bought with something real. One at a time; the
     mission's report ends it. */
  { id: "work_the_floor",
    title: "Work the floor at the General Assembly",
    note: "The mission in New York can move votes before a sitting, and every way of doing it costs the Commonwealth something it has.",
    cost: 0,
    when: { flags: ["station_issue"], flagsAbsent: ["un_floor_working"] },
    event: "un_floor_report",
    tempo: [
      { label: "Remit the anchor states' fees for a quarter", after: 1,
        effects: [ { flag: "un_floor_working" }, { move: { solvency: -3000 } },
                   { move: { "member.brazil": 8, "member.indonesia": 8, "member.sao_tome": 8,
                             "member.colombia": 8, "member.somalia": 8, "member.kiribati": 8,
                             "member.uganda": 8, "member.ecuador": 8, "member.maldives": 8,
                             "member.kenya": 4 } } ] },
      { label: "Offer compute at cost to the African, Asian and Latin American groups", after: 2,
        effects: [ { flag: "un_floor_working" }, { economy: { trade: -3 } },
                   { move: { "member.african_group": 10, "member.asia_pacific_group": 10,
                             "member.latin_american_group": 10 } } ] },
      { label: "Send the Foreign Minister to speak in the Assembly", after: 1, cost: 1,
        effects: [ { flag: "un_floor_working" },
                   { move: { "member.african_group": 4, "member.asia_pacific_group": 4,
                             "member.latin_american_group": 4, "member.eastern_european_group": 4,
                             "member.western_group": 4, "member.eu_caucus": 3 } } ] }
    ] },

] });
