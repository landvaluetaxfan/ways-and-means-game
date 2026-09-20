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
   An object may also carry `absent:n` or `absentPct:0..1`, which puts that
   many of the bench down as members who did not vote. It is the fourth
   thing a seat can be (pairing produces it too), it comes out of the bench
   before abstention does, and it defaults to nought, so a bill that says
   nothing about it counts exactly as it always did.
   {abstain:true, absent:n} is a party that abstains whole and loses n of
   its members to absence on the way.
   dualMajority:true means it must carry separately on both benches. */

const BILLS = [
  { id:"divergence", ref:"HC 4/117", stage:"committee", owner:"psa", priority:true,
    touches:["attestation_enforcement","reclassification_practice"],
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
      hul:"against", fh:"against", gb:"against", des:"against"
    },
    /* AMENDMENTS (design/25 §7). Committee is where a bill is CHANGED rather
       than killed, and the `amendments` array has been allocated on every bill
       since the first build and read by nothing. Each of these is effects and
       nothing else — no new verb — applied when it is moved and recorded on
       the bill. You do not defeat a measure, you amend it until its own sponsor
       stops wanting it, so every price is written next to the thing it buys. */
    amendments:[
      { id:"div_delay", label:"Commence at the next session",
        note:"The threshold moves to forty hours and commencement is put off a "+
             "session, which gives every employer a year to come into line and "+
             "every maintenance bench a year of not being undercut. The "+
             "Substrate Left made the bill the price of the coalition and will "+
             "read the delay as a payment on account.",
        effects:[ { flag:{ divergence_delayed:true } },
                  { move:{ "loyalty.cu_maintenance":7 } },
                  { move:{ "loyalty.psa":-7 } }, { move:{ "capital.psa":-2 } } ] },
      { id:"div_boards", label:"Carve the licensing boards out",
        note:"The Guild's own ask, moved as an amendment rather than carried as "+
             "a promise: the threshold binds the boards' members and not their "+
             "licensure. It buys the functional bench, and the Substrate Left "+
             "reads it as the government selling the bill behind them.",
        effects:[ { flag:{ divergence_boards:true } },
                  { move:{ "loyalty.gb":7 } }, { move:{ "rel.gb_chair":5 } },
                  { move:{ "loyalty.psa":-6 } } ] }
    ],
    onPass:[{law:{divergence_threshold_hours:40}},
            {wire:"DIVERGENCE THRESHOLD CUT TO FORTY HOURS; CENSUS BUREAU BEGINS REGISTRATION"}],
    onFail:[{move:{"loyalty.psa":-14}},
            {wire:"THRESHOLD BILL FAILS ON THE FUNCTIONAL DIVISION"}] },

  /* =========================================================
     THE APPROPRIATION BILL — design/13, and the spine of a session.

     A budget is a BILL here and not a screen: §7.6 says if the player
     needs a second window the model is too deep, so this uses the
     machinery every other measure uses — stages, order-paper time,
     whipping, division, the President — and what makes it a budget is
     that four of its clauses are left blank for the government to fill
     in before the House votes.

     `test:"supply"` is the rule: the elected benches vote money, the
     functional forty are heard and not obeyed, and an objection delays
     it three sittings rather than killing it.

     CLAUSES AND THE CANON (T20). Each level is a stated position with a
     stated cost, drawn like a clause in the bill rather than a slider
     (design/13 §4.1). The prose is written against §7.5.2 (quota trading
     is "a market in permission-to-exist-at-scale whose price is set by an
     appropriation vote"), §7.4 (the consumables floor; substrate
     insurance suspends people rather than cutting their income) and §7.2
     (raising a poor station's closure funds its future secession).

     DO NOT CHANGE THE COSTS. They are tuned against a solvency of 52,000 so
     the defaults come to 48,000 and any upgrade is paid for by a cut; that
     tension is the mechanic. `touches` stays empty on purpose: a supply
     measure is exempt from domain consent because the elected benches
     vote money (§7.3).
     ========================================================= */
  { id:"appropriation", ref:"HC 4/140", stage:"first_reading", owner:"cu",
    test:"supply", priority:true,
    title:"Appropriation (Session 4) Bill",
    summary:"The estimates for the session, and the quota released against them. "+
            "A money bill: the elected benches vote money, and the functional forty "+
            "divide and are recorded.",
    effectNote:"Sets the thermal quota, the consumables floor, substrate insurance, "+
            "capital works and the transit subsidy. Whatever it appropriates, the "+
            "benches that divide on it are the benches that have to deliver it.",
    contested:"Every party wants the floor raised and the quota released and neither "+
            "paid for. The government's difficulty is that the two sides of that "+
            "sentence are the same money. The forty cannot stop the bill and they can "+
            "hold it: a functional bench that votes the appropriation down delays the "+
            "whole of it by three sittings, and the same benches are the ones who have "+
            "to deliver what was just voted. A budget carried against a hostile "+
            "functional bench is a government in trouble having won.",
    touches:[],
    clauses:[
      { id:"thermal", name:"Thermal quota released", default:"steady",
        note:"The thermal quota released this session. The figure sets the price "+
             "at which the right to keep running is bought and sold, and that "+
             "price is paid on every line of this bill.",
        levels:[
          { id:"tight",  label:"Held tight", cost:0,  note:"Released against last session's figure, and no more. The price rises to clear, and it lands on the stations with the thinnest margins.",
            effects:[{ move:{ "price.thermal": 14, public_standing:-4 } }, { law:{ thermal_release:"tight" } }] },
          { id:"steady", label:"As last session", cost:14000, note:"Released at last session's figure. The price holds where the market has held it, and nobody can point to the vote.",
            effects:[{ law:{ thermal_release:"steady" } }] },
          { id:"open",   label:"Released", cost:34000, note:"Released in full. The price falls to the cost of rejecting the heat, and the radiators become the limit on how many minds the Commonwealth can carry.",
            effects:[{ move:{ "price.thermal": -16, thermal_margin:-5, public_standing:5 } }, { law:{ thermal_release:"open" } }] }
        ] },
      { id:"floor", name:"The consumables floor", default:"hold",
        note:"The air, water, calories and minimum volume guaranteed to every "+
             "resident, and the rate at which the guarantee is carried.",
        levels:[
          { id:"cut",  label:"Trimmed", cost:0,  note:"The guarantee is trimmed. The saving shows in this session's return, and the stations that cannot feed themselves show it in their closure by the end of the month.",
            effects:[{ move:{ consumables:-8, public_standing:-7 } }] },
          { id:"hold", label:"Held", cost:16000, note:"The floor is held where it stands. Every resident is carried at the current rate and the vote pays for it.", effects:[] },
          { id:"lift", label:"Lifted", cost:30000, note:"The floor is raised. The stations with the lowest closure are carried further than the guarantee requires, and the difference comes out of the same vote.",
            effects:[{ move:{ consumables:9, public_standing:4, solvency:-4000 } }] }
        ] },
      { id:"insurance", name:"Substrate insurance", default:"hold",
        note:"Cover for the residents who cannot pay for substrate. A reduction "+
             "does not lower anybody's income; it moves people off the register "+
             "of the insured and onto the register of the suspended.",
        levels:[
          { id:"cut",  label:"Reduced", cost:0, note:"The appropriation is reduced and the means test stands. The people who fail the test stop running, and the saving is real.",
            effects:[{ move:{ public_standing:-11, "loyalty.cu":-6 } }] },
          { id:"hold", label:"Held", cost:18000, note:"The appropriation is held. No resident is suspended this session for a debt they cannot pay.", effects:[] },
          { id:"wide", label:"Widened", cost:32000, note:"The appropriation is widened and the means test set aside. Cover reaches the unattested, and the consortiums price the guarantee into every rent it touches.",
            effects:[{ move:{ public_standing:6, "loyalty.psa":7, "loyalty.fh":-5 } }] }
        ] },
      { id:"works", name:"Capital works", default:"none",
        note:"The works funded this session. This is the only clause that helps "+
             "in ten years, and it decides who can leave: raising a station's "+
             "closure is the same act as funding its secession.",
        levels:[
          { id:"none", label:"Deferred", cost:0, note:"No works this session. The stations with the lowest closure are not carried further, and the deferral is the position.", effects:[{ law:{ capital_works:"none" } }] },
          { id:"some", label:"The ring band", cost:20000, note:"Funded in the ring band, where the volume pressure is worst. Closure holds in the middle of the Commonwealth and the outer stations wait.",
            effects:[{ move:{ "price.volume": -9, public_standing:3 } }, { law:{ capital_works:"ring" } }] },
          { id:"outer", label:"The outer stations", cost:30000, note:"Funded at the outer stations, where closure is lowest. Their closure rises, and so does the price at which they could one day leave.",
            effects:[{ move:{ "price.volume": -5 } }, { station:{ ashfield:{ closure:0.04 } } }, { law:{ capital_works:"outer" } }] }
        ] },
      { id:"transit", name:"Transit subsidy", default:"none",
        note:"The fare the stations pay for a launch window, carried against the "+
             "schedule. The anchor states and the outer stations are the ones "+
             "whose schedules are other people's schedules.",
        levels:[
          { id:"none",    label:"Unsubsidised", cost:0,  note:"The fare is the market's. The outer stations pay what the schedule says, and the schedule is not the Commonwealth's.", effects:[{ law:{ transit_subsidy:"none" } }] },
          { id:"anchors", label:"The anchor states", cost:10000, note:"The differential is carried for the anchor states, where the tether is the only way in.", effects:[{ law:{ transit_subsidy:"anchors" } }, { move:{ "public_standing":3 } }] },
          { id:"all",     label:"Every station", cost:22000, note:"The differential is carried for every station, and the reserve pays for the ones the traffic does not reach.", effects:[{ law:{ transit_subsidy:"all" } }, { move:{ "public_standing":5, solvency:-4000 } }] }
        ] },

      /* THE OTHER HALF OF A BUDGET. Everything above is spending; bible
         §7.3 names the revenue — volume, thermal quota, substrate-hours and
         mass to orbit, not income — and until now the bill had no revenue
         side at all, which is how the Commonwealth came to be a treasury
         that could only fall.

         A rate is a LAW, not a cost, so these clauses carry cost 0: they do
         not spend, they set what the tick collects every sitting. At the
         standing rate on all four the state raises exactly what the
         defaults above cost.

         PROSE IS PROVISIONAL and is opencode's to take further (see
         design/33). The mechanism and the levels are settled; the notes are
         serviceable and no more. */
      { id:"rate_volume", name:"Ways and Means: volume", default:"standard",
        note:"The levy on habitable volume, charged on the lease and not on what is done inside it. What it falls on is position inside a habitat, which nobody made.",
        levels:[
          { id:"none", label:"Not levied", cost:0, note:"The lease is charged nothing. The Commonwealth forgoes its largest single base.", effects:[{ law:{ rate_volume:"none" } }, { move:{ "public_standing":3 } }] },
          { id:"low", label:"Reduced", cost:0, note:"Charged at half. The holders of the long leases keep the difference.", effects:[{ law:{ rate_volume:"low" } }, { move:{ "public_standing":1 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_volume:"standard" } }] },
          { id:"high", label:"Raised", cost:0, note:"Charged half again. The lease is dearer to hold and no dearer to live in, which is the whole of the argument and is not believed.", effects:[{ law:{ rate_volume:"high" } }, { move:{ "public_standing":-2 } }] }
        ] },
      { id:"rate_thermal", name:"Ways and Means: thermal quota", default:"standard",
        note:"The levy on quota rejected. It is charged on the right to run, so it is paid by everything that runs, and it is in every price downstream.",
        levels:[
          { id:"none", label:"Not levied", cost:0, note:"Quota is charged nothing. The price falls and the reserve falls with it.", effects:[{ law:{ rate_thermal:"none" } }, { move:{ "public_standing":4 } }] },
          { id:"low", label:"Reduced", cost:0, note:"Charged at half.", effects:[{ law:{ rate_thermal:"low" } }, { move:{ "public_standing":2 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_thermal:"standard" } }] },
          { id:"high", label:"Raised", cost:0, note:"Charged half again, and passed on within the session to everyone buying the right to keep running.", effects:[{ law:{ rate_thermal:"high" } }, { move:{ "public_standing":-5 } }] }
        ] },
      { id:"rate_substrate", name:"Ways and Means: substrate-hours", default:"standard",
        note:"The levy on mind-hours run. It is charged on the hour, so it is charged hardest on those who exist only as hours.",
        levels:[
          { id:"none", label:"Not levied", cost:0, note:"The hour is charged nothing.", effects:[{ law:{ rate_substrate:"none" } }, { move:{ "public_standing":3 } }] },
          { id:"low", label:"Reduced", cost:0, note:"Charged at half.", effects:[{ law:{ rate_substrate:"low" } }, { move:{ "public_standing":2 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_substrate:"standard" } }] },
          { id:"high", label:"Raised", cost:0, note:"Charged half again. The rent on continuing to be a person goes up, and it goes up for the people with the least of anything else.", effects:[{ law:{ rate_substrate:"high" } }, { move:{ "public_standing":-6, "legitimacy":-2 } }] }
        ] },
      { id:"rate_transit", name:"Ways and Means: mass to orbit", default:"standard",
        note:"The levy on mass lifted and moved. Charged at the tether and carried into the price of everything the outer stations cannot make.",
        levels:[
          { id:"none", label:"Not levied", cost:0, note:"Mass moves untaxed.", effects:[{ law:{ rate_transit:"none" } }, { move:{ "public_standing":2 } }] },
          { id:"low", label:"Reduced", cost:0, note:"Charged at half.", effects:[{ law:{ rate_transit:"low" } }, { move:{ "public_standing":1 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_transit:"standard" } }] },
          { id:"high", label:"Raised", cost:0, note:"Charged half again. It reaches the stations at the end of the schedule first and hardest.", effects:[{ law:{ rate_transit:"high" } }, { move:{ "public_standing":-3 } }] }
        ] } ],
    stances:{ cu:"for", psa:"for", rv:"for", upl:{forPct:0.5}, geo:{forPct:0.5},
              cl:"against", sc:{forPct:0.3}, hul:{forPct:0.4}, fh:"against",
              gb:{forPct:0.3}, des:{forPct:0.4} },
    onPass:[{ flag:"supply_granted" }],
    onFail:[{ flag:"supply_refused" }] },
  { id:"thermal2", ref:"HC 4/094", stage:"second_reading", owner:"cu",
    touches:["thermal_quota"],
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
    amendments:[
      { id:"th2_ring", label:"Release to the ring band first",
        note:"The quota is reallocated to the ring first and the outer stations "+
             "take what is left. The ring's benches have asked for it since the "+
             "diversion, and the outer stations will read the order of release "+
             "as the government's real schedule.",
        effects:[ { flag:{ thermal2_ring_first:true } },
                  { move:{ "loyalty.cl":4 } }, { move:{ "loyalty.hul":5 } },
                  { move:{ "loyalty.sc":-5 } },
                  { station:{ vantage:{ closure:0.02 } } } ] }
    ],
    onPass:[{station:{vantage:{closure:0.04}}},{move:{"thermal_margin":9}},
            {move:{"price.thermal":-22}},
            {wire:"THERMAL QUOTA REALLOCATED; QUOTA PRICE FALLS SHARPLY"}],
    onFail:[{move:{"thermal_margin":-4}},{move:{"price.thermal":8}}] },

  { id:"shedorder", ref:"HC 4/061", stage:"blocked", owner:"cu", referrable:true,
    touches:["shed_order_priority","essential_services_law"],
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
              cl:{abstain:true, absent:2}, sc:{forPct:0.35} },
    onPass:[{law:{shed_order_authority:"statute"}},{move:{"public_standing":6}}],
    onFail:[{move:{"loyalty.cu_halloran":-8}}] },

  { id:"anchor_kepler", ref:"HC 4/103", stage:"assent", owner:null,
    touches:["anchor_concession"],
    author:"estevez",
    title:"Anchor Concession (Anchorage) Ratification Bill",
    summary:"Ratifies renewed terms for the International Earth-Orbit Elevator, whose anchor stands on Kenyan "+
            "territory of an Earth state.",
    contested:"The anchor stands on soil the Commonwealth does not own, so the choice is "+
            "not between good terms and better ones. Ratifying keeps the International running and "+
            "puts eight points into the year; refusing is a statement of sovereignty that a "+
            "station of two hundred and thirty-one thousand people cannot eat. The honest "+
            "objection is that a lease renewed is still a lease, and the price is paid again "+
            "at the next renewal with less left to trade.",
    dualMajority:false,
    axes:{ownership:"private",personhood:null,sovereignty:"federal",closure:"integrationist"},
    stances:{ cl:"for", cu:{forPct:0.7}, psa:{forPct:0.5}, sc:"against", hul:"against" },
    onPass:[{move:{"solvency": 8000}},{station:{kepler:{closure:0.02}}},{move:{"price.transit":-11}}],
    onFail:[{move:{"solvency": -6000}},{wire:"KEPLER CONCESSION LAPSES; EARTH STATE SIGNALS REVIEW"}] },

  { id:"substrate_insurance", ref:"HC 4/121", stage:"drafting", owner:"psa",
    touches:["substrate_insurance","risk_pricing"],
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
    onPass:[{move:{"solvency": -11000}},{move:{"public_standing":7}},{move:{"loyalty.psa":12}},
            {station:{ashfield:{suspended:-1800}}},{move:{"price.substrate":-14}},
            {wire:"SUBSTRATE INSURANCE UPRATED; MEANS TEST ABOLISHED"}],
    onFail:[{move:{"loyalty.psa":-13}}] },

  { id:"continuity_registration", ref:"HC 4/129", stage:"drafting", owner:"rv", priority:true,
    touches:["registry_powers","reclassification_practice"],
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
                   it is keeping alive. Two of its members are away and are
                   not counted as abstentions. */
              upl:{abstain:true, absent:2} },
    onPass:[{move:{"loyalty.rv":18}},{move:{"loyalty.psa":-14}},
            {wire:"CONTINUITY REGISTER ESTABLISHED; SUBSTRATE LEFT VOTES AGAINST GOVERNMENT BILL"}],
    onFail:[{move:{"loyalty.rv":-16}}] },

  { id:"substrate_public_stake", ref:"HC 4/133", stage:"drafting", owner:"psa",
    touches:["substrate_ownership"],
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
            {move:{"solvency": -19000}},{move:{"public_standing":5}},{move:{"loyalty.psa":16}},{move:{"loyalty.cl":-20}},{move:{"loyalty.fh":-14}},
            {wire:"PUBLIC STAKE TAKEN IN SUBSTRATE PROVIDERS; RENTS EXPECTED TO FALL"}],
    onFail:[{move:{"loyalty.psa":-11}},{move:{"price.substrate":6}}] },

  /* =============================================================
     THE ANNEXATION BILL — the act the campaign is about.

     `f1_dilemma`'s "Move to annex" said, in its result line, that "the
     annexation bill is set down". No such bill existed. The choice set a
     flag, moved three scalars and put nothing before the House, and the
     three annexation settlements then gated on that FLAG — so the
     Commonwealth annexed a works station of 184,000 people because the
     Prime Minister decided to, with no reading, no division and no Act.
     In a game whose entire thesis is that things happen by parliamentary
     act, that was the largest thing in it happening by fiat.

     So it is a bill, and it starts in `drafting`, which the engine already
     understands as "not introduced yet": it is not before Parliament, it
     cannot be given a day, and prorogation does not kill it. The dilemma
     sets it down by moving it to first reading, exactly as its prose
     always claimed.

     NOT A DUAL MAJORITY, and this is a canon call the author should look
     at. Annexation would force a reapportionment, which is the strongest
     argument for making the functional forty vote it. Against that: the
     functional benches are 28 of 40 opposed below, so a dual majority
     makes the Act unpassable without first moving seats through the
     licensing boards, and the three annexation settlements become
     unreachable in a single session. The appropriation already takes the
     other road — §7.3, the elected benches vote money and the functional
     forty are heard and recorded — and a territorial act is at least as
     much the elected chamber's. Flagged rather than decided quietly.

     THE ARITHMETIC. 129 of 240 for, against 121 needed: it carries, by
     eight, which is inside what a whip can lose. The government's own
     seven rebels are the maintenance bloc, who read 97,000 workers
     entering the labour market the way they read the divergence bill, and
     for the same reason.
     ============================================================= */
  { id:"annexation", ref:"HC 4/163", stage:"drafting", owner:"cu",
    /* It brings 184,000 people inside the services guarantee and it settles
       what happens to a charter held on the Chimborazo line, so those are
       the two benches whose consent it needs. */
    touches:["essential_services_law","anchor_concession"],
    title:"Almanac Works (Annexation) Bill",
    summary:"Brings the Bellamy Almanac Works, Brant & Vane within the Commonwealth: "+
            "the private charter is surrendered, its 184,000 residents become "+
            "Commonwealth persons, and the Works enters the apportionment at the "+
            "next redistribution.",
    effectNote:"+184,000 residents. Reapportionment at the next redistribution. "+
            "The charter is bought out of the same vote that pays the consumables floor.",
    contested:"The Works is the largest employer outside the Commonwealth's "+
            "jurisdiction and its constitution is a contract between a company and "+
            "the people who live in it. Bringing it in makes 184,000 people citizens "+
            "and makes their consumables the federal vote's problem; leaving it out "+
            "leaves them under a charter nobody in the House has read. The benches "+
            "that build and maintain say the same thing they said about divergence: "+
            "97,000 workers entering the market at once will be undercut by whoever "+
            "is cheapest, and that will not be them for long.",
    axes:{ownership:null,personhood:"expansionist",sovereignty:"federal",closure:null},
    stances:{
      /* Forecast counts as the whips gave them. Popular 129 of 240, needs 121. */
      cu:  { popular:{for:66}, functional:"for" },  /* seven rebels: the maintenance bloc */
      psa: { popular:{for:34}, functional:"for" },
      rv:  { popular:{for:9},  functional:"for" },  /* the ministers; the conference is split */
      /* DOMAIN CONSENT IS WHAT DECIDES THIS, not a functional majority.
         The bill `touches` essential_services_law and anchor_concession, so
         the functional constituencies whose interest matches those are the
         CONCERNED benches, and a majority of THOSE seats voting against
         makes the domain object (there is an override, at three-fifths of
         those voting). The whole forty never has to reach 21 — the measured
         division carries on 13 of 40, because the benches that own the
         subject did not block it.

         Authored first with the Liberals against, which blocked the domain
         and made the campaign's central Act unpassable: it stalled at second
         reading every run. They are the right split to turn: free trade says
         bring the Works inside the tariff wall, while their popular benches
         mostly will not wear the cost — a party divided against itself by
         bench, which is exactly what the functional tier exists to produce.

         So the lesson for the next bill, which cost a session to learn:
         `touches` is not decoration. It names who can stop you. */
      cl:  { popular:{for:8},  functional:"for" },
      sc:  { popular:{for:5},  functional:"against" },  /* Home Rule will not centralise for free */
      ind: { popular:{for:2},  functional:"against" },
      upl: "for", geo: "for",
      hul:"against", fh:"against", gb:"against", des:"against"
    },
    onPass:[{flag:"almanac_annexed"},
            {move:{"solvency":-14000}},{move:{"legitimacy":9}},
            {move:{"loyalty.hul":-12}},{move:{"loyalty.gb":-15}},
            {wire:"ALMANAC WORKS (ANNEXATION) ACT PASSES; THE CHARTER IS SURRENDERED"}],
    onFail:[{move:{"legitimacy":-10}},{move:{"trend.friction":2}},
            {wire:"THE HOUSE DECLINES TO BRING THE WORKS IN"}] }

];
