/* BILLS — a bill is data.

   owner    whose bill it is. Giving a partner's bill time on the order
            paper puts them in your debt; giving your own advances nothing
            but your programme. Time is the scarce good that generates
            coalition capital, and it cannot be topped up.
   author   the MEMBER in whose name it stands. A person, not a party, and
            the two may disagree — `owner` is who owns it, `author` is who
            signed it. A minister means the government owns it; a
            backbencher means it does not.
   cosponsors  the members who put their names to it with the author, 0-4.
            A cosponsor from another party is the cheapest signal there is
            of where a measure actually sits.
   priority true if it is the thing that partner actually cares about,
            which is worth more capital than routine business.
   contested  the politics of the bill: who benefits, who pays, and the
            honest objection. Both cases, neither written to win.
 `stances` overrides axis inference per party.
   Stance forms: "for" | "against" | "abstain" | {for:n} | {forPct:0..1} | {free:true}
   dualMajority:true means it must carry separately on both benches. */

const BILLS = [
  { id:"divergence", ref:"HC 4/117", stage:"committee", owner:"psa", priority:true,
    author:"herrera", cosponsors:["lindegaard","cutter"],
    referrable:true, signalled:true,   /* King has privately indicated he would refer this */
    title:"Divergence Threshold (Amendment) Bill",
    summary:"Reduces the statutory divergence threshold from 168 subjective hours to 40. "+
            "An instance separated for longer than the threshold becomes a person in law: "+
            "own rights, own substrate bill, own vote.",
    effectNote:"+1.9M legal persons estimated. Redistribution in six districts.",
    contested:"Two million copies who can be switched off today would become people: their "+
            "own wage, their own substrate bill, their own vote. The consortiums that run them "+
            "say a working week is a contract and not a life, and that the cost lands on the "+
            "people least able to carry it. The maintenance benches say the opposite for the "+
            "same reason — a mind that can be run at any speed will always undercut a body "+
            "that cannot, and the first people undercut will be the ones who voted for it.",
    dualMajority:true,
    axes:{ownership:null,personhood:"expansionist",sovereignty:"federal",closure:null},
    stances:{
      /* A stance may split by bench. Popular = district + list. */
      /* These are the forecast counts the whips have given the PM, so they are
         stated explicitly rather than derived. Popular 128 of 240 (needs 121),
         functional 12 of 40 (needs 21). */
      cu:  { popular:{for:68}, functional:{forPct:1} },   /* scales if the licensing boards move seats */  /* five popular rebels: the maintenance bloc hates this bill */
      psa: { popular:{for:34}, functional:{forPct:1} },
      rv:  { popular:{for:3},  functional:{forPct:1} },  /* the three ministers; conference voted against 71-29 */
      upl: { popular:{for:2},  functional:"against" },
      geo: { popular:{for:3},  functional:"against" },
      cl:  { popular:{for:12}, functional:"against" }, /* expansionist in principle, cheap fork-labour in practice */
      sc:  { popular:{for:6},  functional:"against" },
      hul:"against", fh:"against", gb:"against", ind:"against", des:"against"
    },
    onPass:[{law:{divergence_threshold_hours:40}},
            {wire:"DIVERGENCE THRESHOLD CUT TO FORTY HOURS; CENSUS BUREAU BEGINS REGISTRATION"}],
    onFail:[{move:{"loyalty.psa":-14}},
            {wire:"THRESHOLD BILL FAILS ON THE FUNCTIONAL DIVISION"}] },

  { id:"thermal2", ref:"HC 4/094", stage:"second_reading", owner:"cu",
    author:"vellan", cosponsors:["laughon"],
    title:"Thermal Quota Allocation (No. 2) Bill",
    summary:"Reallocates radiator capacity toward the middle band. Ember Ridge has been "+
            "below statutory reserve since the radiator fault of 6 April.",
    contested:"The middle band gets the quota and the ring gives it up, which is what the "+
            "Allocation Act is for and the first time in nine years anyone has used it. "+
            "Ember Ridge is four thousand two hundred people three days from a shed order. "+
            "Anselm Ring paid for the last diversion and remembers the invoice, and the "+
            "objection is not that the middle band does not need the heat — it is that a "+
            "quota moved to answer one fault becomes the ordinary way heat is allocated, "+
            "and the ring will be paying for the next fault before anyone has found it.",
    dualMajority:false,
    axes:{ownership:"public",personhood:null,sovereignty:"federal",closure:"integrationist"},
    stances:{ cu:"for", psa:"for", rv:"for", upl:"for", geo:"for", sc:{forPct:0.4}, cl:{forPct:0.3} },
    onPass:[{station:{vantage:{closure:0.04}}},{move:{"thermal_margin":9}},
            {move:{"price.thermal":-22}},
            {wire:"THERMAL QUOTA REALLOCATED; QUOTA PRICE FALLS SHARPLY"}],
    onFail:[{move:{"thermal_margin":-4}},{move:{"price.thermal":8}}] },

  { id:"shedorder", ref:"HC 4/061", stage:"blocked", owner:"cu", referrable:true,
    author:"halloran", cosponsors:["kaunda"],
    title:"Shed Order (Civilian Oversight) Bill",
    summary:"Places the published shedding priority under civilian review. Touches "+
            "life-support integrity, so the dual test applies.",
    contested:"Everyone agrees the shed order should be answerable to somebody and nobody "+
            "agrees to whom. The engineering authority says the ninety seconds after a seal "+
            "fails are exactly the ninety seconds a committee cannot be convened in, and it "+
            "has the incident record to prove it. The benches asking for review answer that "+
            "a schedule deciding who stops running has never once been read aloud in the "+
            "House, and that an authority which cannot be argued with is an authority which "+
            "cannot be wrong.",
    dualMajority:true,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    stances:{ cu:"for", psa:"for", rv:{for:11}, upl:"for", geo:"for",
              gb:"against", hul:"against", fh:"against",
              /* THE PARTY SPLIT DOWN THE MIDDLE. The Liberal benches divide on
                 this one — the free-market wing wants a shed order that can be
                 argued with, and the fork-rentier money that pays for the other
                 wing does not. The leadership can count, and it would lose, so
                 the party declines to vote rather than lose in public. */
              cl:"abstain", sc:{forPct:0.35} },
    onPass:[{law:{shed_order_authority:"statute"}},{move:{"public_standing":6}}],
    onFail:[{move:{"loyalty.cu_halloran":-8}}] },

  { id:"anchor_kepler", ref:"HC 4/103", stage:"assent", owner:null,
    author:"estevez",
    title:"Anchor Concession (Anchorage) Ratification Bill",
    summary:"Ratifies renewed terms for the Tether 2 anchor, which stands on the sovereign "+
            "territory of an Earth state.",
    contested:"The anchor stands on soil the Commonwealth does not own, so the choice is "+
            "not between good terms and better ones. Ratifying keeps Tether 2 running and "+
            "puts eight points into the year; refusing is a statement of sovereignty that a "+
            "station of two hundred and thirty-one thousand people cannot eat. The honest "+
            "objection is that a lease renewed is still a lease, and the price is paid again "+
            "at the next renewal with less left to trade.",
    dualMajority:false,
    axes:{ownership:"private",personhood:null,sovereignty:"federal",closure:"integrationist"},
    stances:{ cl:"for", cu:{forPct:0.7}, psa:{forPct:0.5}, sc:"against", hul:"against" },
    onPass:[{move:{"treasury":8}},{station:{kepler:{closure:0.02}}},{move:{"price.transit":-11}}],
    onFail:[{move:{"treasury":-6}},{wire:"KEPLER CONCESSION LAPSES; EARTH STATE SIGNALS REVIEW"}] },

  { id:"substrate_insurance", ref:"HC 4/121", stage:"drafting", owner:"psa",
    author:"girard",
    title:"Substrate Insurance (Uprating) Bill",
    summary:"Raises the statutory floor on substrate insurance and removes the means test. "+
            "Failing the current test does not reduce a person's income; it suspends them.",
    effectNote:"Estimated 34,000 fewer default suspensions a year. Cost falls on thermal appropriations.",
    contested:"The means test decides whether a person who cannot pay for substrate is "+
            "insured or suspended, and the bill says that is not a line a decent polity "+
            "draws. It costs the reserve eleven and takes thirty-four thousand people a "+
            "year off the default register. The objection is not to the people: it is that "+
            "a floor with no test under it is a floor nobody can leave, and the consortiums "+
            "will price the guarantee into the rent of every person it covers.",
    dualMajority:false,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    stances:{ psa:"for", cu:{forPct:0.8}, upl:"for", geo:"for", rv:{forPct:0.6},
              fh:"against", cl:{forPct:0.25}, hul:"against" },
    onPass:[{move:{"treasury":-11}},{move:{"public_standing":7}},{move:{"loyalty.psa":12}},
            {station:{ashfield:{suspended:-1800}}},{move:{"price.substrate":-14}},
            {wire:"SUBSTRATE INSURANCE UPRATED; MEANS TEST ABOLISHED"}],
    onFail:[{move:{"loyalty.psa":-13}}] },

  { id:"continuity_registration", ref:"HC 4/129", stage:"drafting", owner:"rv", priority:true,
    author:"marin", cosponsors:["abadi"],
    title:"Continuity of Person (Registration) Bill",
    summary:"Requires a person to be entered on a continuity register before any instance may be "+
            "reabsorbed, and gives the instance a right to be heard. The Congregational Democratic Alliance has asked for it "+
            "at every coalition meeting since formation.",
    effectNote:"Adds a procedural step to every reabsorption. Fork-labour costs rise.",
    contested:"A procedure before a life ends is not much to ask, and the CDA has asked for "+
            "it at every coalition meeting since this government formed. It requires a "+
            "register, a hearing, and a decision that can be pointed at afterwards. The "+
            "objection is that the register is a list, that a list of persons who may be "+
            "reabsorbed is a list which will eventually be put to another use, and that a "+
            "right to be heard is not a right to be kept — the reabsorption still happens.",
    dualMajority:false,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:"federal",closure:null},
    stances:{ rv:"for", cu:{forPct:0.65}, des:"for", hul:{forPct:0.7}, gb:{forPct:0.5},
              psa:"against", cl:"against",
              /* CONFIDENCE AND SUPPLY, KEEPING ITS DISTANCE. The Uplift
                 Alliance holds this government up and did not join it, and
                 abstention is how that distinction is said out loud: it will
                 not vote to rank one kind of person above another, and it will
                 not vote with the opposition to bring down an administration
                 it is keeping alive. */
              upl:"abstain" },
    onPass:[{move:{"loyalty.rv":18}},{move:{"loyalty.psa":-14}},
            {wire:"CONTINUITY REGISTER ESTABLISHED; SUBSTRATE LEFT VOTES AGAINST GOVERNMENT BILL"}],
    onFail:[{move:{"loyalty.rv":-16}}] },

  { id:"substrate_public_stake", ref:"HC 4/133", stage:"drafting", owner:"psa",
    author:"ivarsen",
    title:"Substrate (Public Stake) Bill",
    summary:"Takes a controlling public stake in the three largest substrate providers. "+
            "Air, water, thermal and computation are natural monopolies with captive customers "+
            "and a lethal failure mode; the argument is that one of them is not like the others.",
    effectNote:"Public share of substrate rises from 35 to 60 per cent. Substrate rents fall. "+
               "Four functional seats change hands as corporate voters are extinguished.",
    contested:"Air, water, thermal and computation are the four things a habitat cannot do "+
            "without, and the three companies selling them have captive customers and no "+
            "competitor to lose them to. A controlling stake is the only lever short of a "+
            "charter amendment, and it takes four functional seats out of corporate hands "+
            "on the way through. The objection is not the price: it is that a government "+
            "which sets the standard for substrate will also be the party selling it, and "+
            "nobody audits the landlord's own meter.",
    dualMajority:false,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    stances:{ psa:"for", cu:{forPct:0.85}, upl:"for", geo:{forPct:0.6}, rv:{forPct:0.4},
              cl:"against", fh:"against", hul:{forPct:0.3}, gb:{forPct:0.2} },
    onPass:[{law:{substrate_public_share:0.6}},{move:{"price.substrate":-26}},
            {move:{"treasury":-19}},{move:{"public_standing":5}},{move:{"loyalty.psa":16}},{move:{"loyalty.cl":-20}},{move:{"loyalty.fh":-14}},
            {wire:"PUBLIC STAKE TAKEN IN SUBSTRATE PROVIDERS; RENTS EXPECTED TO FALL"}],
    onFail:[{move:{"loyalty.psa":-11}},{move:{"price.substrate":6}}] }

];
