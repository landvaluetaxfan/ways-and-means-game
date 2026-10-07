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
    note:`The Deputy Prime Minister is the leader of the junior partner in the coalition, the New Progressive Party. The post is the price of that party's confidence in the government.` },
  { id:"life_support",            name:"Life Support",              title:"Minister for Life Support",
    holder:"vellan", party:"cu", senior:true,
    brief:["thermal_margin","price.thermal","suspended"],
    note:`The Minister for Life Support holds the senior post in the Cabinet and answers for life support on the stations. Under the Allocation Act, a station's engineering authority may summon this Minister, and the Minister may not summon the authority.` },
  { id:"treasury",                name:"The Treasury",              title:"Treasurer",
    /* VACANT AT THE OPENING, because it is the post the Prime Minister
       herself held until January, and she has left it empty through the
       election and the coalition talks (design/76). A new leader's first
       appointment is her own replacement, and it is the one seat at the
       table she chose. See design/14 §6.2. THE EVENT the_treasury (content/events.js) offers
       these three and writes their effects out again; the guards assert
       that the copies agree.

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
        note:`Skye was your deputy at the Treasury from 2076 to 2080 and knows its work. Appointing her owes no faction a favour.`,
        effects:[{move:{"loyalty.cu_loyalists":4}},
                 {move:{"loyalty.cu_halloran":-6}},
                 {move:{"loyalty.cu_maintenance":-3}},
                 {wire:"SKYE CONFIRMED AT THE TREASURY; NO CHANGE OF DIRECTION SIGNALLED"}] },
      { holder:"halloran", party:"cu",
        note:`Czarnecki leads the members who are collecting signatures for a ballot on your leadership. A minister is bound by collective responsibility, so in the Cabinet he could no longer lead them openly.`,
        effects:[{move:{"loyalty.cu_halloran":26}},
                 {move:{"loyalty.cu_loyalists":-11}},
                 {move:{public_standing:-4}},
                 {signatures:-4},
                 {wire:"CZARNECKI TO THE TREASURY; LOYALISTS SAY THEY WERE NOT CONSULTED"}] },
      { holder:"abadi", party:"rv",
        note:`Abadi is a backbencher of the Congregational Democratic Alliance, the coalition's third partner, which has two junior posts and has asked for a department that matters.`,
        effects:[{move:{"loyalty.rv":14}},
                 {move:{"capital.rv":3}},
                 {move:{"loyalty.cu_maintenance":-7}},
                 {wire:`TREASURY GOES TO THE CONGREGATIONAL DEMOCRATIC ALLIANCE, THE COALITION'S THIRD PARTNER`}] }
    ],
    note:`The Treasurer signs the estimates and answers for them in the House, and reports directly to the Prime Minister. Only a Treasurer can make the Treasury's orders and begin its initiatives.` },
  { id:"external_relations",      name:"External Relations",        title:"Minister for External Relations",
    holder:"landry", party:"cu",
    note:`The Minister for External Relations conducts the Commonwealth's dealings with the governments of Earth and the other republics. The tether anchors stand on foreign soil, so many of the questions the post handles concern the stations' own supply.` },
  { id:"defence",                 name:"Defence",                   title:"Minister for Defence",
    holder:"dulac", party:"cu",
    brief:["friction"],
    note:`The Commonwealth keeps no fleet and no army. The Minister for Defence holds the chokepoints that a habitat can defend or lose: the tethers, the traffic on them and the launch windows.` },
  { id:"law_charter",             name:"Law and the Charter",       title:"Minister for Law and the Charter",
    holder:"fenwick", party:"cu",
    brief:["shed_order_authority"],
    note:`The Minister for Law and the Charter is the Law Officer in the Cabinet. The post advises the government on the Charter, on referring a measure for constitutional review and on amending the Charter.` },
  { id:"contingencies",           name:"Home Affairs and Contingencies", title:"Minister for Home Affairs and Contingencies",
    holder:"brakk", party:"cu",
    brief:["thermal_margin","closure"],
    note:`The Minister for Home Affairs and Contingencies answers for policing, public order and the emergency power. The post is the civilian counterpart to a station's engineering authority.` },
  { id:"education",               name:"Education",                 title:"Minister for Education",
    holder:"piastri", party:"cu",
    brief:["public_standing"],
    note:`The Minister for Education answers for schools and training. Training leads to a licence, and a licence carries a vote in a functional constituency, a seat elected by a licensed sector, so the ministry shapes who will hold that vote in future.` },
  { id:"persons_continuity",      name:"Persons, Health and Continuity", title:"Minister for Persons, Health and Continuity",
    holder:"marin", party:"rv",
    brief:["divergence_threshold_hours","civic_clock_minimum"],
    note:`The Minister for Persons, Health and Continuity answers for medical care, suspension and the legal status of persons. The ministry answers Medicine and Embodiment, a functional constituency that returns three members, and the Congregational Democratic Alliance holds it.` },
  { id:"labour_participation",    name:"Labour and Participation",  title:"Minister for Labour and Participation",
    holder:"herrera", party:"psa",
    brief:["divergence_threshold_hours","public_standing"],
    note:`The Minister for Labour and Participation answers for employment, wages and the share of residents in paid work.` },
  { id:"trade_anchors",           name:"Trade and the Anchors",     title:"Minister for Trade and the Anchors",
    holder:"ivarsen", party:"psa",
    brief:["price.transit","anchor_concession"],
    note:`The Minister for Trade and the Anchors answers for the Commonwealth's trade balance, its exports of computing and the concessions under which the tether anchors stand on foreign soil.` },
  { id:"business_house",          name:"Business of the House",     title:"Leader of the House",
    holder:"whitlam", party:"cu",
    note:`The Leader of the House holds Cabinet rank and allocates the government's order-paper time, which decides which measures the House takes up and when.` },
  { id:"substrate_thermal",       name:"Substrate and Thermal",     title:"Minister for Substrate and Thermal",
    holder:"girard", party:"psa",
    brief:["price.substrate","price.thermal","substrate_public_share"],
    note:`The Minister for Substrate and Thermal answers for the hardware that digital residents run on and for the cooling that every station needs. The post makes the government's orders on cooling, and its holder is elected by the substrate providers, whose product the ministry's policy prices.` },
  { id:"consumables_agriculture", name:"Consumables and Agriculture", title:"Minister for Consumables and Agriculture",
    holder:"ashgrove", party:"cu",
    brief:["consumables"],
    note:`The Minister for Consumables and Agriculture answers for the air, water and food that the Commonwealth guarantees to every resident, and for agriculture on the stations.` },
  { id:"volume_housing",          name:"Volume and Housing",        title:"Minister for Volume and Housing",
    holder:"lee_kuan_yew", party:"cu",
    brief:["price.volume"],
    note:`The Minister for Volume and Housing answers for pressurised volume, the habitable space that stations lease to their residents, and for housing.` },
  { id:"transit_orbital",         name:"Transit and Orbital Mechanics", title:"Minister for Transit and Orbital Mechanics",
    holder:"vasmer", party:"psa", brief:["price.transit"],
    note:"The Minister for Transit and Orbital Mechanics answers for the launch windows, the traffic on the tethers and the fares that stations pay for passage and freight." },
  { id:"attestation_registry",    name:"Attestation and the Registry", title:"Minister for Attestation and the Registry",
    holder:"preiss", party:"cu",
    brief:["attested"],
    candidates:[
      {holder:"okarie", party:"cu",
       note:`Devi is the Chief Whip and belongs to the Soft Left, the current that leads your party. A vacant post cannot make orders, so filling it restores the Registry's power to make them.`,
       effects:[{move:{"loyalty.cu":5}},{move:{public_standing:-2}},
                {wire:"VACANT POST FILLED AFTER MINISTERIAL RESIGNATION"}]} ],
    note:`The Minister for Attestation and the Registry keeps the Registry, which records who is attested as one unique person and so decides who may vote, and appoints the members of the licensing boards.` },
  { id:"closure_development",     name:"Closure and Development",   title:"Minister for Closure and Development",
    holder:"tomasson", party:"rv",
    note:`The Minister for Closure and Development answers for federal development spending, which raises a station's closure, the share of its material cycle that it can sustain without imports. The ministry's work centres on the low band, whose stations have the lowest closure.` }
];
