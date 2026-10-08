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
  { id:"appropriation", ref:"HC 2080/140", stage:"first_reading", owner:"cu",
    campaign:["world", "flash_i"],      /* the engine tests play on it, and Act I is built on it (design/80) */
    test:"supply", priority:true,
    title:"Appropriation Bill 2080",
    summary:`The estimates for the session: five spending clauses and four tax rates. The House must pass the bill before it rises, because until it does the government cannot pay its officials.`,
    effectNote:"Sets the thermal quota released, the consumables floor, substrate insurance, capital works "+
            "and the transit subsidy, and four tax rates, each at the level the government has chosen. "+
            "The levels it chooses must cost no more than the reserve holds.",
    contested:`The Party of Socialists and Democrats, the New Progressive Party, the Congregational Democratic Alliance and the independents support the bill. The Liberal Party and the Freehold Party oppose it. The other parties support it in part: each wants the levels it cares about raised, and the reserve cannot pay for every level at once.`,
    touches:[],
    clauses:[
      { id:"thermal", name:"Thermal quota released", default:"steady",
        note:`Thermal quota is the permission to reject heat, which every station needs in order to run. The estimates decide how much quota is released this session. Less quota raises the thermal price that every station pays, and more quota lowers it.`,
        levels:[
          { id:"tight",  label:"Held tight", cost:0,  note:`Less quota is released than last session, and the estimates pay nothing for it. The thermal price rises, and the stations with the thinnest thermal margins pay the most. Voters mark the government down.`,
            effects:[{ move:{ "price.thermal": 14, public_standing:-4 } }, { law:{ thermal_release:"tight" } }] },
          { id:"steady", label:`Unchanged`, cost:14000, note:`Quota is released at last session's figure, and the thermal price stays where the market has held it.`,
            effects:[{ law:{ thermal_release:"steady" } }] },
          { id:"open",   label:`Released in full`, cost:34000, note:`All of the quota is released. The thermal price falls to the cost of rejecting the heat, and the radiators that reject it become the limit on how many minds the Commonwealth can run. The thermal margin falls, and voters approve.`,
            effects:[{ move:{ "price.thermal": -16, thermal_margin:-5, public_standing:5 } }, { law:{ thermal_release:"open" } }] }
        ] },
      { id:"floor", name:"The consumables floor", default:"hold",
        note:`The consumables floor is the air, water, food and living space that the Commonwealth guarantees to every resident. The estimates set the rate at which the guarantee is carried, and a higher rate costs more.`,
        levels:[
          { id:"cut",  label:"Trimmed", cost:0,  note:`The guarantee is trimmed, which saves money this session. The consumables reading falls, the stations that cannot feed themselves are the first to go short, and voters mark the government down.`,
            effects:[{ move:{ consumables:-8, public_standing:-7 } }] },
          { id:"hold", label:"Held", cost:16000, note:`The floor stays at its present rate. Every resident is carried as now, and the estimates pay for it.`, effects:[] },
          { id:"lift", label:"Lifted", cost:30000, note:`The floor is raised. The consumables reading rises and voters approve. A higher guarantee is a standing cost, so the most the estimates may spend falls as well.`,
            effects:[{ move:{ consumables:9, public_standing:4, solvency:-4000 } }] }
        ] },
      { id:"insurance", name:"Substrate insurance", default:"hold",
        note:`Substrate insurance pays the rent on the computer hardware, the substrate, that runs digital residents who cannot pay it themselves. Where the cover is reduced, residents who fail the means test and cannot pay are suspended: their minds are kept intact but are not running.`,
        levels:[
          { id:"cut",  label:"Reduced", cost:0, note:`The appropriation is reduced and the means test stands. Residents who fail the test and cannot pay are suspended, and the reserve saves the cost of their cover. Voters mark the government down, and so do members of your own party.`,
            effects:[{ move:{ public_standing:-11, "loyalty.cu":-6 } }] },
          { id:"hold", label:"Held", cost:18000, note:`The appropriation is held and the means test stands. Residents who fail the test and cannot pay stay suspended, as they are now.`, effects:[] },
          { id:"wide", label:"Widened", cost:32000, note:`The appropriation is widened and the means test is set aside. Cover extends to people without attestation, and the substrate providers are expected to raise rents to take account of the guarantee. Voters approve and the New Progressive Party welcomes it. The Freehold Party objects.`,
            effects:[{ move:{ public_standing:6, "loyalty.psa":7, "loyalty.fh":-5 } }] }
        ] },
      { id:"works", name:"Capital works", default:"none",
        note:`Capital works are building projects funded this session, and the one clause whose effect outlasts it. Works raise a station's closure, the share of its material cycle that it can sustain without imports, and a station with higher closure can leave the Commonwealth at less cost to itself.`,
        levels:[
          { id:"none", label:"Deferred", cost:0, note:`No works are funded this session, and closure rises at no station.`, effects:[{ law:{ capital_works:"none" } }] },
          { id:"some", label:"The ring band", cost:20000, note:`Works are funded in the ring band, where the pressure on habitable volume is worst. The price of volume falls and voters approve. The outer stations get no works this session.`,
            effects:[{ move:{ "price.volume": -9, public_standing:3 } }, { law:{ capital_works:"ring" } }] },
          { id:"outer", label:"The outer stations", cost:30000, note:`Works are funded at the outer stations, where closure is lowest. The first works are at Homestead, whose closure rises, and with it the station's ability to leave the Commonwealth. The price of volume falls a little.`,
            effects:[{ move:{ "price.volume": -5 } }, { station:{ ashfield:{ closure:0.04 } } }, { law:{ capital_works:"outer" } }] }
        ] },
      { id:"transit", name:"Transit subsidy", default:"none",
        note:`The transit subsidy is paid on the fare that stations pay for a launch window, a scheduled departure to orbit. The stations farthest from a tether pay the highest fares, and the subsidy decides how much of the difference the Commonwealth carries.`,
        levels:[
          { id:"none",    label:"Unsubsidised", cost:0,  note:`No subsidy is paid. The carriers set the fare, and the outer stations pay the carriers' published schedule.`, effects:[{ law:{ transit_subsidy:"none" } }] },
          { id:"anchors", label:"The tether stations", cost:10000, note:`The Commonwealth carries the extra fare for the stations that a tether serves, where the tether is the only way in. Voters approve.`, effects:[{ law:{ transit_subsidy:"anchors" } }, { move:{ "public_standing":3 } }] },
          { id:"all",     label:"Every station", cost:22000, note:`The Commonwealth carries the extra fare for every station, including the ones the traffic does not reach, and the reserve pays for them. Voters approve more. A subsidy for every station is a standing cost, so the most the estimates may spend falls as well.`, effects:[{ law:{ transit_subsidy:"all" } }, { move:{ "public_standing":5, solvency:-4000 } }] }
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
      { id:"rate_volume", name:"Tax on pressurised volume", default:"standard",
        note:`The tax on pressurised volume is charged on the lease, the right to occupy habitable space in a station, whatever the leaseholder does inside it. It falls on the location, which the leaseholder did not create, so it cannot be passed on in a price. It is the largest of the four taxes in the estimates.`,
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:`The rate is cut by a fifth. Leaseholders pay less, and most of the saving goes to the holders of long leases in the ring band, who hold most of the Commonwealth's volume. The ring band approves.`, effects:[{ law:{ rate_volume:"relief" } }, { move:{ "standing.ring":4, "public_standing":1 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:`The rate is cut by a tenth. Leaseholders pay less, most of them in the ring band.`, effects:[{ law:{ rate_volume:"low" } }, { move:{ "standing.ring":2 } }] },
          { id:"standard", label:"Unchanged", cost:0, note:"The rate stays where it is.", effects:[{ law:{ rate_volume:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:`The rate is raised by a tenth. The government's case is that a tax on location raises the cost of holding a lease and cannot raise rents. The ring band disputes that and thinks less of the government.`, effects:[{ law:{ rate_volume:"high" } }, { move:{ "standing.ring":-3 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:`The rate is raised by a fifth. The ring band calls it confiscation and thinks much less of the government.`, effects:[{ law:{ rate_volume:"surcharge" } }, { move:{ "standing.ring":-5, "public_standing":-1 } }] }
        ] },
      { id:"rate_thermal", name:"Tax on cooling", default:"standard",
        note:`The tax on cooling is charged on thermal quota, the permission to reject heat, so every station that runs pays it. Part of any change in the rate reaches the thermal price within the session.`,
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:`The rate is cut by a fifth and the thermal price falls with it. Every household on every deck pays less for heat, and the reserve pays for it.`, effects:[{ law:{ rate_thermal:"relief" } }, { move:{ "public_standing":3, "standing.low":1 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:`The rate is cut by a tenth, and heat is a little cheaper for every household.`, effects:[{ law:{ rate_thermal:"low" } }, { move:{ "public_standing":1 } }] },
          { id:"standard", label:"Unchanged", cost:0, note:"The rate stays where it is.", effects:[{ law:{ rate_thermal:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:`The rate is raised by a tenth. The cost is passed on within the session to everyone who buys the right to keep running, and it falls hardest on the low band, which runs closest to its quota.`, effects:[{ law:{ rate_thermal:"high" } }, { move:{ "public_standing":-2, "standing.low":-2 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:`The rate is raised by a fifth. The thermal price rises, and every station sees it on its next bill.`, effects:[{ law:{ rate_thermal:"surcharge" } }, { move:{ "public_standing":-4, "standing.low":-3 } }] }
        ] },
      { id:"rate_substrate", name:"Tax on computing time", default:"standard",
        note:`The tax on computing time is charged by the hour of computation. Emulated persons, who are people running as software, pay most of it, because all of their existence is computation.`,
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:`The rate is cut by a fifth. Substrate rent falls, and emulated persons gain most, because rent is their largest cost of living.`, effects:[{ law:{ rate_substrate:"relief" } }, { move:{ "public_standing":2, "legitimacy":1 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:`The rate is cut by a tenth, and substrate rent falls a little.`, effects:[{ law:{ rate_substrate:"low" } }, { move:{ "public_standing":1 } }] },
          { id:"standard", label:"Unchanged", cost:0, note:"The rate stays where it is.", effects:[{ law:{ rate_substrate:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:`The rate is raised by a tenth. Substrate rent rises, and emulated persons pay most of the increase.`, effects:[{ law:{ rate_substrate:"high" } }, { move:{ "public_standing":-2, "legitimacy":-1 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:`The rate is raised by a fifth, and nearly all of it falls on emulated persons. The parties that speak for them call it a tax on existing.`, effects:[{ law:{ rate_substrate:"surcharge" } }, { move:{ "public_standing":-3, "legitimacy":-3 } }] }
        ] },
      { id:"rate_transit", name:"Tax on freight to orbit", default:"standard",
        note:`The tax on freight to orbit is charged on mass lifted and moved, at the tether. It is carried into the price of everything the outer stations cannot make for themselves.`,
        levels:[
          { id:"relief", label:"Cut by a fifth", cost:0, note:`The rate is cut by a fifth. Imports cost less at the far stations from the next freight schedule.`, effects:[{ law:{ rate_transit:"relief" } }, { move:{ "standing.far":3, "standing.external":3 } }] },
          { id:"low", label:"Cut by a tenth", cost:0, note:`The rate is cut by a tenth, and imports cost a little less at the stations farthest from the tether.`, effects:[{ law:{ rate_transit:"low" } }, { move:{ "standing.far":2, "standing.external":1 } }] },
          { id:"standard", label:"Unchanged", cost:0, note:"The rate stays where it is.", effects:[{ law:{ rate_transit:"standard" } }] },
          { id:"high", label:"Raised by a tenth", cost:0, note:`The rate is raised by a tenth. Imports cost more, and the stations farthest from the tether pay the most.`, effects:[{ law:{ rate_transit:"high" } }, { move:{ "standing.far":-2, "standing.external":-2 } }] },
          { id:"surcharge", label:"Raised by a fifth", cost:0, note:`The rate is raised by a fifth, on everything the outer stations import. Home Rule, the party that speaks for them, opposes it.`, effects:[{ law:{ rate_transit:"surcharge" } }, { move:{ "standing.far":-4, "standing.external":-4, "public_standing":-1 } }] }
        ] } ],
    /* the independents promised their votes on confidence and the budget only (the commission page, sitting 1) */
    stances:{ cu:"for", psa:"for", rv:"for", ind:"for", upl:{forPct:0.5}, geo:{forPct:0.5},
              cl:"against", sc:{forPct:0.3}, hul:{forPct:0.4}, fh:"against",
              gb:{forPct:0.3}, des:{forPct:0.4} },
    onPass:[{ flag:"supply_granted" }],
    onFail:[{ flag:"supply_refused" }] },

  { id:"anchor_kepler", ref:"HC 2080/103", stage:"assent", owner:"psa",
    campaign:["world", "flash_i"],      /* Act I's treaty: its opening restages it (design/78, design/80) */
    touches:["anchor_concession"],
    author:"ivarsen",
    title:"Anchor Concession (Anchorage) Ratification Bill",
    summary:`Ratifies renewed terms for the International Earth-Orbit Elevator, whose anchor stands at Malindi, on Kenyan territory.`,
    contested:`Kenya owns the land at the elevator's anchor, so the Commonwealth runs the elevator as a tenant under a concession. Ratifying the renewal keeps the elevator running and adds CW$8bn to what the Treasury can spend. Refusing lets the concession lapse, which costs the Treasury CW$6bn, and Anchorage, a station of 231,000 people, depends on the elevator. The Liberal Party supports ratification. Home Rule and the Association of Engineers and Systems oppose it, and opponents argue that a renewed lease keeps the Commonwealth a tenant at the next renewal.`,
    dualMajority:false,
    axes:{economic:0.6, authority:0.1, personhood:0, sovereignty:0.5, trade:0.95},
    stances:{ cl:"for", cu:{forPct:0.7}, psa:{forPct:0.5}, sc:"against", hul:"against" },
    onPass:[{move:{"solvency": 8000}},{station:{kepler:{closure:0.02}}},{move:{"price.transit":-11}}],
    onFail:[{move:{"solvency": -6000}},{wire:`ANCHORAGE CONCESSION LAPSES; EARTH STATE SIGNALS REVIEW`}] },

];
