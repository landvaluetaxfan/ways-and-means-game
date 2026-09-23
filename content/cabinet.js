/* =============================================================
   CABINET — the Ministries, as data.

   Bible 3.9 lists them; this makes them a thing the game can hold.
   Two mechanics depend on it:

   1. The President's appointment-refusal power (3.3, power 4) had
      nothing to refuse until now.
   2. Every statutory instrument names an author. A vacant post cannot
      make one — which is the interlock that turns the appointment
      fight and the licensing-board fight into the same fight.

   Life Support is the senior post and the one that ends careers. It is
   the only Ministry whose Minister may be summoned BY the engineering
   authority rather than the reverse, under the Allocation Act.

   The Treasury sits apart and reports directly to the Prime Minister.
   ============================================================= */

const CABINET = [
  { id:"deputy_pm",               name:"Deputy Prime Minister",     title:"Deputy Prime Minister",
    holder:"trottier", party:"psa",
    note:"The junior coalition partner's leader, and the price of the NPP's confidence." },
  { id:"life_support",            name:"Life Support",              title:"Minister for Life Support",
    holder:"vellan", party:"cu", senior:true,
    brief:["thermal_margin","price.thermal","suspended"],
    note:"Summonable by the engineering authority. Raised at every confirmation." },
  { id:"treasury",                name:"The Treasury",              title:"Treasurer",
    /* VACANT AT THE OPENING, because it is the post the Prime Minister
       herself held until last week. A new leader's first appointment is
       her own replacement, and it is the one seat at the table she
       chose. See design/14 §6.2.

       MECHANICAL DEMONSTRATION, opencode's to re-author: the three
       candidates are the three different acts available — keep the
       department steady, bring the challenger inside, or pay the third
       partner — and the notes are engineering rather than prose. Nobody
       here is invented; §2.7 freezes the roster and all three already
       exist. */
    holder:null, party:null, apart:true, vacatedBy:"flash",
    brief:["solvency"],
    candidates:[
      { holder:"skye", party:"cu",
        note:"Your deputy at the Treasury for four years. Knows the file, and is owed nothing.",
        effects:[{move:{"loyalty.cu_loyalists":4}},
                 {move:{solvency:3000}},
                 {wire:"SKYE CONFIRMED AT THE TREASURY; NO CHANGE OF DIRECTION SIGNALLED"}] },
      { holder:"halloran", party:"cu",
        note:"Leads the eleven members collecting signatures against you. Inside the tent, he cannot count them.",
        effects:[{move:{"loyalty.cu_halloran":26}},
                 {move:{"loyalty.cu_loyalists":-11}},
                 {move:{public_standing:-4}},
                 {signatures:-4},
                 {wire:"CZARNECKI TO THE TREASURY; LOYALISTS SAY THEY WERE NOT CONSULTED"}] },
      { holder:"abadi", party:"rv",
        note:"The third partner has two junior posts and has asked for a department that matters.",
        effects:[{move:{"loyalty.rv":14}},
                 {move:{"capital.rv":3}},
                 {move:{"loyalty.cu_maintenance":-7}},
                 {wire:"TREASURY GOES TO THE CONGREGATIONAL DEMOCRATIC ALLIANCE IN REBALANCE"}] }
    ],
    note:"Sits apart and reports directly to the Prime Minister." },
  { id:"external_relations",      name:"External Relations",        title:"Minister for External Relations",
    holder:"landry", party:"cu",
    note:"The anchors stand on foreign soil, so this is really a domestic brief." },
  { id:"defence",                 name:"Defence",                   title:"Minister for Defence",
    holder:"dulac", party:"cu",
    brief:["friction"],
    note:"The Commonwealth keeps no fleet and no army — a shooting war inside a pressure vessel kills everyone in the room, which is the same arithmetic that made underwriting the dominant institution. What the Ministry actually holds is the tether, the traffic and the launch windows, because a chokepoint is the only thing a habitat can defend or lose. The Trades Left's man, brought back in to a department where being brought back in is the whole of the appointment." },
  { id:"law_charter",             name:"Law and the Charter",       title:"Minister for Law and the Charter",
    holder:"fenwick", party:"cu",
    brief:["shed_order_authority"],
    note:"The Law Officer in cabinet. Referral, constitutional review, and the amendment nobody will open." },
  { id:"contingencies",           name:"Home Affairs and Contingencies", title:"Minister for Home Affairs and Contingencies",
    holder:"brakk", party:"cu",
    brief:["thermal_margin","closure"],
    note:"Policing, public order and the emergency power. This was Contingencies and Civil Authority, which named the emergency twice and the ordinary work of the department not at all. The civilian answer to the engineering authority: declaration is easy, termination is the fight." },
  { id:"education",               name:"Education",                 title:"Minister for Education",
    holder:"piastri", party:"cu",
    brief:["public_standing"],
    note:"Licensure carries the functional franchise, and training carries licensure, so this is the Ministry that settles who will be entitled to vote in twenty years. Nobody treats it as though it were, which is why it goes to a backbencher who photographs well." },
  { id:"persons_continuity",      name:"Persons, Health and Continuity", title:"Minister for Persons, Health and Continuity",
    holder:"marin", party:"rv",
    brief:["divergence_threshold_hours","civic_clock_minimum"],
    note:"Medicine and Embodiment returns three members and had no Minister facing it. Health sits here because in this republic being treated, being suspended and being a person are one question, and the Congregational Democratic Alliance holds the office that answers it. Held from a district seat rather than the medicine roll." },
  { id:"labour_participation",    name:"Labour and Participation",  title:"Minister for Labour and Participation",
    holder:"herrera", party:"psa",
    brief:["divergence_threshold_hours","public_standing"],
    note:"Owns participation and the divergence threshold as labour policy. It is the bill everyone argues about." },
  { id:"trade_anchors",           name:"Trade and the Anchors",     title:"Minister for Trade and the Anchors",
    holder:"ivarsen", party:"psa",
    brief:["price.transit","anchor_concession"],
    note:"Owns the trade balance, compute exports and the anchor concessions on foreign soil." },
  { id:"business_house",          name:"Business of the House",     title:"Leader of the House",
    holder:"whitlam", party:"cu",
    note:"Owns the order paper. The slots are the government's scarcest currency." },
  { id:"substrate_thermal",       name:"Substrate and Thermal",     title:"Minister for Substrate and Thermal",
    holder:"girard", party:"psa",
    brief:["price.substrate","price.thermal","substrate_public_share"],
    note:"Held by the New Progressive Party, and now from the substrate providers' own seat." },
  { id:"consumables_agriculture", name:"Consumables and Agriculture", title:"Minister for Consumables and Agriculture",
    holder:"ashgrove", party:"cu",
    brief:["consumables"],
    note:"Sits for the constituency: deck cooperativists and volume-holders, on one roll." },
  { id:"volume_housing",          name:"Volume and Housing",        title:"Minister for Volume and Housing",
    holder:"lee_kuan_yew", party:"cu",
    brief:["price.volume"],
    note:"The defining domestic brief, and the one nobody wants." },
  { id:"transit_orbital",         name:"Transit and Orbital Mechanics", title:"Minister for Transit and Orbital Mechanics",
    holder:"vasmer", party:"psa", brief:["price.transit"],
    note:"" },
  { id:"attestation_registry",    name:"Attestation and the Registry", title:"Minister for Attestation and the Registry",
    holder:"preiss", party:"cu",
    brief:["attested"],
    note:"Appoints the licensing boards. This is the sharpest tool in the game." },
  { id:"closure_development",     name:"Closure and Development",   title:"Minister for Closure and Development",
    holder:"tomasson", party:"rv",
    note:"Owns the closure floor and the low band. The development paradox, as a portfolio." }
];
