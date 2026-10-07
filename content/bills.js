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
    contested:"About two million copies that can be switched off today would become persons, with their own wages, substrate bills and votes. The consortiums that run them say a working week of separate experience is a term of employment, and that the cost falls on those least able to carry it. The maintenance benches, whose members are embodied, argue that a mind which can run at any speed will always work more cheaply than a body, and that embodied workers would lose work first.",
    dualMajority:true,
    axes:{economic:-0.3, authority:-0.3, personhood:0.9, sovereignty:0.5, trade:0.2},
    stances:{
      /* A stance may split by bench. Popular = district + list. */
      /* These are the forecast counts the whips have given the PM, so they are
         stated explicitly rather than derived. Popular 128 of 240 (needs 121),
         functional 12 of 40 (needs 21). */
      cu:  { popular:{for:68}, functional:{forPct:1} },   /* scales if the licensing boards move seats */  /* five popular rebels: the Trades Left hates this bill */
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
        note:"The threshold moves to forty hours and takes effect when the next parliament first sits, which gives every employer and every maintenance bench until then to adjust. The New Progressive Party made the bill a condition of the coalition, and treats the delay as part-payment of that condition.",
        effects:[ { flag:{ divergence_delayed:true } },
                  { move:{ "loyalty.cu_maintenance":7 } },
                  { move:{ "loyalty.psa":-7 } }, { move:{ "capital.psa":-2 } } ] },
      { id:"div_boards", label:"Carve the licensing boards out",
        note:"The Guild Bench's own request, moved as an amendment: the threshold applies to the licensing boards' members and leaves their licensure unchanged. It wins the functional bench's votes, and the New Progressive Party regards it as a concession made behind its back.",
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
    campaign:["world", "flash_i"],      /* the engine tests play on it, and Act I is built on it (design/80) */
    test:"supply", priority:true,
    title:"Appropriation (Session 4) Bill",
    summary:"The estimates for the session, clause by clause, and the thermal quota released against them. It is a money bill: the 240 elected members decide it, and the 40 functional members vote and have their votes recorded.",
    effectNote:"Sets the thermal quota, the consumables floor, substrate insurance, "+
            "capital works and the transit subsidy. Whatever it appropriates, the "+
            "benches that divide on it are the benches that have to deliver it.",
    contested:"Every party wants the consumables floor raised and more quota released, and none wants to pay for either, though both come out of the same appropriation. A functional majority against the bill delays the whole of it by three sittings, and the same functional benches run the services it pays for, so a government that carries its budget against them still depends on them to deliver it.",
    touches:[],
    clauses:[
      { id:"thermal", name:"Thermal quota released", default:"steady",
        note:"The thermal quota released this session. How much is released sets the thermal price: the less quota, the higher the price every station pays to keep running.",
        levels:[
          { id:"tight",  label:"Held tight", cost:0,  note:"Less quota is released than last session, and the estimates pay nothing for it. The price rises to clear, and it lands first on the stations with the thinnest margins.",
            effects:[{ move:{ "price.thermal": 14, public_standing:-4 } }, { law:{ thermal_release:"tight" } }] },
          { id:"steady", label:"As last session", cost:14000, note:"Released at last session's figure. The price holds where the market has held it.",
            effects:[{ law:{ thermal_release:"steady" } }] },
          { id:"open",   label:"Released", cost:34000, note:"Released in full. The price falls to the cost of rejecting the heat, and the radiators become the limit on how many minds the Commonwealth can carry.",
            effects:[{ move:{ "price.thermal": -16, thermal_margin:-5, public_standing:5 } }, { law:{ thermal_release:"open" } }] }
        ] },
      { id:"floor", name:"The consumables floor", default:"hold",
        note:"The air, water, food and living space guaranteed to every "+
             "resident, and the rate at which the guarantee is carried.",
        levels:[
          { id:"cut",  label:"Trimmed", cost:0,  note:"The guarantee is trimmed. The saving shows in this session's return, and the stations that cannot feed themselves show it in their closure by the end of the month.",
            effects:[{ move:{ consumables:-8, public_standing:-7 } }] },
          { id:"hold", label:"Held", cost:16000, note:"The floor is held where it stands. Every resident is carried at the current rate and the vote pays for it.", effects:[] },
          { id:"lift", label:"Lifted", cost:30000, note:"The floor is raised. The stations with the lowest closure are carried further than the guarantee requires, and the difference comes out of the same vote.",
            effects:[{ move:{ consumables:9, public_standing:4, solvency:-4000 } }] }
        ] },
      { id:"insurance", name:"Substrate insurance", default:"hold",
        note:"Cover for the residents who cannot pay for substrate. A reduction moves people from the register of the insured to the register of the suspended.",
        levels:[
          { id:"cut",  label:"Reduced", cost:0, note:"The appropriation is reduced and the means test stands. People who fail the test and cannot pay are suspended, and the reserve saves the cost of their cover.",
            effects:[{ move:{ public_standing:-11, "loyalty.cu":-6 } }] },
          { id:"hold", label:"Held", cost:18000, note:"The appropriation is held. No resident is suspended this session for a debt they cannot pay.", effects:[] },
          { id:"wide", label:"Widened", cost:32000, note:"The appropriation is widened and the means test set aside. Cover extends to people without attestation, and the substrate providers are expected to raise rents to take account of the guarantee.",
            effects:[{ move:{ public_standing:6, "loyalty.psa":7, "loyalty.fh":-5 } }] }
        ] },
      { id:"works", name:"Capital works", default:"none",
        note:"The works funded this session, and the one clause whose effect is long-term. Works raise a station's closure, and a station with higher closure is more able to leave the Commonwealth.",
        levels:[
          { id:"none", label:"Deferred", cost:0, note:"No works this session. Closure rises nowhere.", effects:[{ law:{ capital_works:"none" } }] },
          { id:"some", label:"The ring band", cost:20000, note:"Funded in the ring band, where the volume pressure is worst. Closure holds in the middle of the Commonwealth and the outer stations wait.",
            effects:[{ move:{ "price.volume": -9, public_standing:3 } }, { law:{ capital_works:"ring" } }] },
          { id:"outer", label:"The outer stations", cost:30000, note:"Funded at the outer stations, where closure is lowest. Their closure rises, and with it their capacity to leave the Commonwealth.",
            effects:[{ move:{ "price.volume": -5 } }, { station:{ ashfield:{ closure:0.04 } } }, { law:{ capital_works:"outer" } }] }
        ] },
      { id:"transit", name:"Transit subsidy", default:"none",
        note:"The subsidy on the fare the stations pay for a launch window. The stations farthest from a tether pay the highest fares, and the subsidy decides how much of that difference the Commonwealth carries.",
        levels:[
          { id:"none",    label:"Unsubsidised", cost:0,  note:"With no subsidy the fare is set by the carriers, and the outer stations pay the carriers' published schedule.", effects:[{ law:{ transit_subsidy:"none" } }] },
          { id:"anchors", label:"The tether stations", cost:10000, note:"The differential is carried for the stations a tether serves, where the tether is the only way in.", effects:[{ law:{ transit_subsidy:"anchors" } }, { move:{ "public_standing":3 } }] },
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
        note:"The levy on habitable volume, charged on the lease and not on what is done inside it. It falls on location inside a habitat, which the holder did not create, so it cannot be passed on in a price. It is the largest base the Commonwealth has, about CW$88bn a year at the opening, and a tenth of it is one of the largest single measures a budget can carry.",
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:"About CW$17bn a year handed back, nearly all of it to the holders of the long leases on the ring band, who hold most of the Commonwealth's volume.", effects:[{ law:{ rate_volume:"relief" } }, { move:{ "standing.ring":4, "public_standing":1 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:"About CW$9bn a year back to the lease holders, most of them on the ring band.", effects:[{ law:{ rate_volume:"low" } }, { move:{ "standing.ring":2 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_volume:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:"About CW$9bn a year more, from the holders of the long leases. The government's case is that it raises the cost of holding a lease and raises no rent; the ring band disputes it.", effects:[{ law:{ rate_volume:"high" } }, { move:{ "standing.ring":-3 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:"About CW$17bn a year more. It falls on location, so it raises no rent, and the ring band calls it confiscation.", effects:[{ law:{ rate_volume:"surcharge" } }, { move:{ "standing.ring":-5, "public_standing":-1 } }] }
        ] },
      { id:"rate_thermal", name:"Ways and Means: thermal quota", default:"standard",
        note:"The levy on quota rejected, about CW$55bn a year at the opening. It is charged on the right to run, so it is paid by everything that runs, and a quarter of any change reaches the price of heat within the session.",
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:"About CW$11bn a year forgone, and the price of heat falls with it. Every household on every deck feels it, and the reserve pays for it.", effects:[{ law:{ rate_thermal:"relief" } }, { move:{ "public_standing":3, "standing.low":1 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:"About CW$5.5bn a year forgone, and heat is a little cheaper for every household.", effects:[{ law:{ rate_thermal:"low" } }, { move:{ "public_standing":1 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_thermal:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:"About CW$5.5bn a year more, passed on within the session to everyone buying the right to keep running, and hardest on the low band, which runs closest to its quota.", effects:[{ law:{ rate_thermal:"high" } }, { move:{ "public_standing":-2, "standing.low":-2 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:"About CW$11bn a year more, and a rise in the price of heat that every station sees on its next bill.", effects:[{ law:{ rate_thermal:"surcharge" } }, { move:{ "public_standing":-4, "standing.low":-3 } }] }
        ] },
      { id:"rate_substrate", name:"Ways and Means: substrate-hours", default:"standard",
        note:"The levy on mind-hours run, about CW$51bn a year at the opening. It is charged by the hour of computation, so it falls hardest on emulated persons, whose whole existence is computation.",
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:"About CW$10bn a year forgone. Substrate rent falls, which matters most to emulated persons, for whom it is the largest cost of living.", effects:[{ law:{ rate_substrate:"relief" } }, { move:{ "public_standing":2, "legitimacy":1 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:"About CW$5bn a year forgone.", effects:[{ law:{ rate_substrate:"low" } }, { move:{ "public_standing":1 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_substrate:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:"About CW$5bn a year more. Substrate rent rises, and emulated persons pay most of it.", effects:[{ law:{ rate_substrate:"high" } }, { move:{ "public_standing":-2, "legitimacy":-1 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:"About CW$10bn a year more, nearly all of it from emulated persons. The parties that speak for them call it a tax on existing.", effects:[{ law:{ rate_substrate:"surcharge" } }, { move:{ "public_standing":-3, "legitimacy":-3 } }] }
        ] },
      { id:"rate_transit", name:"Ways and Means: mass to orbit", default:"standard",
        note:"The levy on mass lifted and moved, about CW$26bn a year at the opening. Charged at the tether and carried into the price of everything the outer stations cannot make.",
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:"About CW$5bn a year forgone, and the far stations' imports are cheaper by the next schedule.", effects:[{ law:{ rate_transit:"relief" } }, { move:{ "standing.far":3, "standing.external":3 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:"About CW$2.6bn a year forgone, and all of it lands at the end of the schedule.", effects:[{ law:{ rate_transit:"low" } }, { move:{ "standing.far":2, "standing.external":1 } }] },
          { id:"standard", label:"At the standing rate", cost:0, note:"Charged as it has been charged.", effects:[{ law:{ rate_transit:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:"About CW$2.6bn a year more. It reaches the stations at the end of the schedule first and hardest.", effects:[{ law:{ rate_transit:"high" } }, { move:{ "standing.far":-2, "standing.external":-2 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:"About CW$5bn a year more, charged on everything the outer stations import. Home Rule, which speaks for them, opposes it.", effects:[{ law:{ rate_transit:"surcharge" } }, { move:{ "standing.far":-4, "standing.external":-4, "public_standing":-1 } }] }
        ] } ],
    /* the independents promised their votes on confidence and the budget only (the commission page, sitting 1) */
    stances:{ cu:"for", psa:"for", rv:"for", ind:"for", upl:{forPct:0.5}, geo:{forPct:0.5},
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
    contested:"The bill moves quota from the ring band to the middle band, which the Allocation Act allows and which has not been done for nine years. Ember Ridge is 213,000 people three days from a shed order. Anselm Ring paid for the last diversion, and its objection is that a quota moved to answer one fault becomes the ordinary way heat is allocated, so the ring would pay for the next fault too.",
    dualMajority:false,
    axes:{economic:-0.6, authority:0.2, personhood:0, sovereignty:0.7, trade:0.4},
    stances:{ cu:"for", psa:"for", rv:"for", upl:"for", geo:"for", sc:{forPct:0.4}, cl:{forPct:0.3} },
    amendments:[
      { id:"th2_ring", label:"Release to the ring band first",
        note:"The quota is reallocated to the ring first and the outer stations take what is left. The ring's benches have asked for it since the diversion; the outer stations would receive their quota last.",
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
    contested:"Every party wants the shed order answerable to someone, and they disagree about whom. The engineering authority says the ninety seconds after a seal fails are too short to convene a committee, and it has the incident record to show it. The benches asking for review answer that the schedule deciding who stops running has never been read aloud in the House, and that an authority no one can question cannot be held to account.",
    dualMajority:true,
    axes:{economic:-0.7, authority:-0.9, personhood:0.5, sovereignty:0.6, trade:0.1},
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

  { id:"anchor_kepler", ref:"HC 4/103", stage:"assent", owner:"psa",
    campaign:["world", "flash_i"],      /* Act I's treaty: its opening restages it (design/78, design/80) */
    touches:["anchor_concession"],
    author:"ivarsen",
    title:"Anchor Concession (Anchorage) Ratification Bill",
    summary:`Ratifies renewed terms for the International Earth-Orbit Elevator, whose anchor stands at Malindi, on Kenyan territory.`,
    contested:"The anchor stands on Kenyan soil, so the Commonwealth negotiates as a tenant. Ratifying keeps the International running and puts eight billion dollars into the year. Refusing asserts sovereignty at the cost of Anchorage, a station of 231,000 people that depends on the tether. The objection is that a renewed lease is still a lease, and the price is paid again at the next renewal with less left to trade.",
    dualMajority:false,
    axes:{economic:0.6, authority:0.1, personhood:0, sovereignty:0.5, trade:0.95},
    stances:{ cl:"for", cu:{forPct:0.7}, psa:{forPct:0.5}, sc:"against", hul:"against" },
    onPass:[{move:{"solvency": 8000}},{station:{kepler:{closure:0.02}}},{move:{"price.transit":-11}}],
    onFail:[{move:{"solvency": -6000}},{wire:`ANCHORAGE CONCESSION LAPSES; EARTH STATE SIGNALS REVIEW`}] },

  { id:"substrate_insurance", ref:"HC 4/121", stage:"drafting", owner:"psa",
    touches:["substrate_insurance","risk_pricing"],
    author:"girard",
    title:"Substrate Insurance (Uprating) Bill",
    summary:"Raises the statutory floor on substrate insurance and removes the means test. Under the current test, a person who fails it and cannot pay is suspended.",
    effectNote:"Estimated 34,000 fewer default suspensions a year. Cost falls on thermal appropriations.",
    contested:"The means test decides whether a person who cannot pay for substrate is insured or suspended, and the bill's supporters say no one should be suspended for poverty. It costs the reserve eleven billion dollars and takes thirty-four thousand people a year off the default register. The objection is that cover without a means test would never be withdrawn once given, and that the substrate providers would raise every covered person's rent to match the guarantee.",
    dualMajority:false,
    axes:{economic:-0.85, authority:-0.2, personhood:0.6, sovereignty:0.6, trade:0.2},
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
    contested:"The Congregational Democratic Alliance has asked at every coalition meeting since this government formed for a procedure before an instance is reabsorbed: a register, a hearing, and a recorded decision. The objection is that a register of persons who may be reabsorbed could later be put to other uses, and that a hearing does not stop the reabsorption.",
    dualMajority:false,
    axes:{economic:-0.2, authority:-0.1, personhood:-0.85, sovereignty:0.4, trade:-0.1},
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
    summary:"Takes a controlling public stake in the three largest substrate providers. Air, water, thermal and computation are natural monopolies with captive customers and a lethal failure mode, and the bill treats substrate as one of them.",
    effectNote:"Public share of substrate rises from 35 to 60 per cent. Substrate rents fall. "+
               "Four functional seats change hands as corporate voters are extinguished.",
    contested:"Air, water, thermal and computation are the four things a habitat cannot do without, and the three companies selling computation have captive customers and no competitor to lose them to. A controlling stake is the only lever short of a charter amendment, and it takes four functional seats out of corporate hands on the way through. The objection is that the government would then both set the standard for substrate and sell it, with no independent check on its own pricing.",
    dualMajority:false,
    axes:{economic:-0.95, authority:0.1, personhood:0.4, sovereignty:0.7, trade:0},
    stances:{ psa:"for", cu:{forPct:0.85}, upl:"for", geo:{forPct:0.6}, rv:{forPct:0.4},
              cl:"against", fh:"against", hul:{forPct:0.3}, gb:{forPct:0.2} },
    onPass:[{law:{substrate_public_share:0.6}},{move:{"price.substrate":-26}},
            {move:{"solvency": -19000}},{move:{"public_standing":5}},{move:{"loyalty.psa":16}},{move:{"loyalty.cl":-20}},{move:{"loyalty.fh":-14}},
            {wire:"PUBLIC STAKE TAKEN IN SUBSTRATE PROVIDERS; RENTS EXPECTED TO FALL"}],
    onFail:[{move:{"loyalty.psa":-11}},{move:{"price.substrate":6}}] },

  /* THE TWO LAWS THAT DID NOTHING (design/34 D6, built 23 Sep on the
     author's word). `civic_clock_minimum` and `suspension_debt_accrual` were
     in the law from the first draft, named in bible 6.9 as the variables
     personhood politics moves, and no bill set either and nothing read
     them. The engine reads both now (tick: the clock's cost and heat, the
     paused debt's restorations), and these are the bills that set them.
     Both open in drafting, so the government decides whether to bring them
     in: giving one its first reading is the introduction. */
  { id:"civic_clock", ref:"HC 4/171", stage:"drafting", owner:"psa",
    touches:["substrate_ownership","thermal_quota"],
    author:"trottier", cosponsors:["herrera"],
    title:"Civic Clock (Minimum Rate) Bill",
    summary:"Sets a minimum clock rate of real time for every enfranchised mind, publicly "+
            "subsidised, so that an emulation running slow for want of substrate follows a "+
            "campaign at the same pace as the electorate around it.",
    contested:"At 0.3x a four-year parliament is fourteen subjective months, and 560,000 people vote on a campaign they could not follow at the speed it was fought. The case for the minimum is that a vote cast without the argument is a vote in name only. The case against is the cost: seventy billion dollars a year from the reserve, and the heat of running half a million minds faster through radiators that are already the binding constraint. Most of that cost falls on the PSD's embodied voters.",
    dualMajority:false,
    axes:{economic:-0.8, authority:-0.3, personhood:0.85, sovereignty:0.4, trade:0},
    stances:{ psa:"for", upl:"for", cu:{forPct:0.6}, rv:"against", fh:"against", gb:"against" },
    onPass:[{law:{civic_clock_minimum:1}},
            {move:{"loyalty.psa":6}},{move:{"loyalty.cu_maintenance":-6}},
            {wire:"CIVIC CLOCK ACT PASSES: EVERY ENFRANCHISED MIND AT REAL TIME"}],
    onFail:[{move:{"loyalty.psa":-6}}] },

  { id:"debt_moratorium", ref:"HC 4/177", stage:"drafting", owner:"psa",
    touches:["substrate_insurance","risk_pricing"],
    author:"herrera", cosponsors:["trottier"],
    title:"Suspended Persons (Debt Moratorium) Bill",
    summary:"Stops substrate debt accruing while a person is suspended, so that a mind "+
            "restored from suspension owes what it owed on the day it went cold.",
    contested:"With the debt accruing, a person suspended for default runs up cost for every sitting they cannot earn, and most of them never come back. The Underwriters answer that if the debt pauses, going cold becomes the cheapest way to wait out a bad quarter, suspensions rise, and the providers carry the frozen balances. The bill decides which of the two costs the Commonwealth bears.",
    dualMajority:false,
    axes:{economic:-0.6, authority:-0.5, personhood:0.7, sovereignty:0.2, trade:0},
    stances:{ psa:"for", upl:"for", gb:"against", fh:"against", cl:"against" },
    onPass:[{law:{suspension_debt_accrual:false}},
            {move:{"loyalty.psa":5}},{move:{"actor.underwriters":-6}},
            {wire:"DEBT MORATORIUM PASSES: NO SUBSTRATE DEBT RUNS WHILE A PERSON IS COLD"}],
    onFail:[{move:{"loyalty.psa":-4}}] }

];
