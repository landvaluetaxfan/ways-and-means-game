/* =============================================================
   STATUTORY INSTRUMENTS

   A bill needs a majority and cannot be undone. An instrument needs
   no majority and can be revoked. The player is meant to learn that
   the fast tool is the deniable one and the slow tool is the
   permanent one.

     author         a cabinet post id. Vacant post, no instrument.
     procedure      "negative" — in force at once, stands unless prayed
                    against within prayer_window sittings.
                    "affirmative" — needs a simple popular majority first.
     effects        applied when it takes effect
     reverse        applied if it is prayed against or revoked
     prayer_stances how parties vote on a prayer to annul. Omitted
                    parties are assumed to oppose the government.
     political_cost applied on making it, whatever happens after

   THE LICENSING BOARD INSTRUMENT IS THE SPINE OF CHAPTER ONE.
   Franchise in a functional constituency runs through professional
   licensure, and the government appoints the boards. Widening the
   Life Support Engineering electorate shifts functional seats without
   a bill. It is the only available answer to the HC 4/117 trap, and
   it must be discoverable, costly, and ugly.
   ============================================================= */

const INSTRUMENTS = [

  { id:"si_2080_44",
    title:"Life Support Engineering (Licensing) Order 2080",
    number:"SI 2080/44",
    author:"attestation_registry",
    procedure:"negative",
    prayer_window:6,
    revocable:true,
    summary:"Widens the Life Support Engineering licence to admit integrity technicians "+
            "certified before 2054, adding roughly 900 electors to a constituency of 4,100. "+
            "The new electors are disproportionately maintenance-union members.",
    effect_note:"Moves functional seats over 2–4 sittings. The Guild Bench will not divide "+
                "with a government that has done this.",
    effects:[ { functional:{ fc_lifesupport:{ cu:2, gb:-2 } } },
              { flag:"board_packed" },
              {move:{"loyalty.gb":-30}},
              {move:{"rel.gb_chair":-40}},
              { signatures:2 },
              { wire:"LICENSING ORDER LAID; GUILD BENCH SEEKS EMERGENCY DEBATE" } ],
    reverse:[ { functional:{ fc_lifesupport:{ cu:-2, gb:2 } } },
              { flag:{ board_packed:false } } ],
    political_cost:[ {move:{"public_standing":-5}}, {move:{"loyalty.cu_halloran":-9}} ],
    prayer_stances:{ cu:"against", psa:"against", rv:{}, gb:"for", hul:"for", fh:"for", cl:"for" } },

  { id:"si_2080_51",
    title:"Thermal Allocation (Ember Ridge) Emergency Order 2080",
    number:"SI 2080/51",
    author:"life_support",
    procedure:"affirmative",
    revocable:true,
    summary:"Diverts thermal quota from Anselm Ring to Ember Ridge for the duration of the "+
            "radiator fault. Touches life-support integrity, so the affirmative procedure "+
            "applies and the House must approve it before it takes effect.",
    effect_note:"Anselm Ring pays for it, and Anselm Ring notices.",
    effects:[ {move:{"thermal_margin":7}}, {move:{"price.thermal":-9}},
              { station:{ vantage:{ suspended:-900 } } },
              { flag:"vantage_diverted" },
              { wire:"EMERGENCY THERMAL DIVERSION APPROVED FOR VANTAGE HIGH" } ],
    reverse:[ {move:{"thermal_margin":-7}}, {move:{"price.thermal":9}} ],
    political_cost:[ {move:{"solvency": -6000}} ],
    prayer_stances:{ cu:"against", psa:"against", cl:"for", fh:"for" } },

  { id:"si_2080_58",
    title:"Attestation (Lapse and Restoration) Order 2080",
    number:"SI 2080/58",
    author:"attestation_registry",
    procedure:"negative",
    prayer_window:6,
    revocable:true,
    summary:"Shortens the period before an unrenewed attestation lapses from four years to "+
            "eighteen months, and simplifies restoration for those who apply in person.",
    effect_note:"Attestation gates the vote. Shortening the lapse period removes electors, "+
                "and it removes them unevenly: from the Verge, Lantern and Homestead first.",
    effects:[ { station:{ ashfield:{attested:-0.03}, drift:{attested:-0.04},
                          cinder:{attested:-0.035}, tannery:{attested:-0.03} } },
              { flag:"attestation_tightened" },
              {move:{"loyalty.gb":6}},{move:{"loyalty.hul":8}},{move:{"loyalty.psa":-14}},{move:{"loyalty.cu_halloran":-12}},
              { wire:"REGISTRY ORDER SHORTENS ATTESTATION LAPSE TO EIGHTEEN MONTHS" } ],
    reverse:[ { station:{ ashfield:{attested:0.03}, drift:{attested:0.04},
                          cinder:{attested:0.035}, tannery:{attested:0.03} } },
              { flag:{ attestation_tightened:false } } ],
    political_cost:[ {move:{"public_standing":-3}} ],
    prayer_stances:{ cu:{}, psa:"for", rv:"for", upl:"for", geo:"for", gb:"against", hul:"against" } },

  { id:"si_2080_47",
    title:"Legal Practice (Admissions) Order 2080",
    number:"SI 2080/47",
    author:"attestation_registry",
    procedure:"negative",
    prayer_window:6,
    revocable:true,
    summary:"Admits reclassification practitioners to the Legal roll without the full "+
            "instrument-of-call, adding some 1,600 electors to a constituency of 5,200. "+
            "Reclassification practice is young, emulation-heavy, and votes accordingly.",
    effect_note:"Two more functional seats, and a second permanent enemy. Packing one board "+
                "is a manoeuvre; packing two is a policy, and the chamber will call it one.",
    effects:[ { functional:{ fc_legal:{ psa:2, gb:-1, hul:-1 } } },
              { flag:"legal_board_packed" },
              {move:{"loyalty.gb":-20}},{move:{"loyalty.hul":-18}},{move:{"loyalty.psa":10}},
              { signatures:3 },
              { wire:"SECOND LICENSING ORDER LAID; OPPOSITION CALLS IT A PATTERN" } ],
    reverse:[ { functional:{ fc_legal:{ psa:-2, gb:1, hul:1 } } },
              { flag:{ legal_board_packed:false } } ],
    political_cost:[ {move:{"public_standing":-8}}, {move:{"loyalty.cu_halloran":-14}} ],
    prayer_stances:{ cu:{ifLoyaltyBelow:30}, psa:"against", rv:{ifLoyaltyBelow:35},
                     gb:"for", hul:"for", fh:"for", cl:"for" } },

/* =============================================================
   THE ESCALATION LADDER (design/03 §4, bible 7.9)

   Nine rungs before involuntary suspension, each cheaper politically
   and dearer fiscally than the one below. Each is gated on the rung
   above having been tried, so the ladder is a sequence and not a menu.

   THE BALANCE RULE: suspension must never be the efficient answer. The
   political cost rises down the ladder faster than the relief does, so
   rung nine buys the most margin at the worst price in the game. A9 in
   test.js asserts it from the first rung.
   ============================================================= */

  { id:"rung1_conservation",
    title:"Voluntary Conservation (Appeal) Order 2080", number:"SI 2080/61",
    author:"substrate_thermal", procedure:"negative", prayer_window:6, revocable:true,
    summary:"Asks the stations to draw down non-essential load ahead of the winter margin. "+
            "It asks; it does not compel. The margin improves a little and the appeal is forgotten in a week.",
    effect_note:"The cheapest rung, and the one that buys the least. A first move, not a policy.",
    effects:[ {move:{"thermal_margin":3}}, { flag:"rung1_tried" },
              { wire:"CONSERVATION APPEAL ISSUED TO STATION AUTHORITIES" } ],
    reverse:[ {move:{"thermal_margin":-3}}, { flag:{ rung1_tried:false } } ],
    political_cost:[ {move:{"public_standing":-2}} ] },

  { id:"rung2_clockrate",
    title:"Clock-Rate (Reduction) Order 2080", number:"SI 2080/62",
    author:"persons_continuity", procedure:"negative", prayer_window:6, revocable:true,
    when:{ flags:["rung1_tried"] },
    summary:"Slows the emulated blocs' clock rate by four per cent for the duration of the "+
            "margin. To an emulated person it is a long weekend. In fact it is a wage cut for "+
            "everyone who runs faster than a body does.",
    effect_note:"Buys margin out of the emulated population's patience, which is the one "+
                "resource the New Progressive Party exists to protect.",
    effects:[ {move:{"thermal_margin":4}}, {move:{"loyalty.psa":-8}}, { flag:"rung2_tried" },
              { wire:"CLOCK RATES CUT FOUR PER CENT; SUBSTRATE LEFT PROTESTS" } ],
    reverse:[ {move:{"thermal_margin":-4}}, {move:{"loyalty.psa":8}}, { flag:{ rung2_tried:false } } ],
    political_cost:[ {move:{"loyalty.psa":-6}} ] },

  { id:"rung3_deferred",
    title:"Deferred-Computation (Scheduling) Order 2080", number:"SI 2080/63",
    author:"substrate_thermal", procedure:"negative", prayer_window:6, revocable:true,
    when:{ flags:["rung2_tried"] },
    summary:"Moves non-critical substrate computation to the cold hours. The racks still run; "+
            "they run when the station can afford to reject the heat. The guilds lose the "+
            "night shift and the overtime that came with it.",
    effect_note:"Margin out of the consumables cycle, and the engineers' goodwill with it.",
    effects:[ {move:{"thermal_margin":5}}, {move:{"price.substrate":-4}},
              {move:{"loyalty.gb":-6}}, {move:{"loyalty.hul":-6}}, { flag:"rung3_tried" },
              { wire:"DEFERRED-COMPUTATION SCHEDULE IMPOSED; GUILD BENCH OBJECTS" } ],
    reverse:[ {move:{"thermal_margin":-5}}, {move:{"price.substrate":4}},
              {move:{"loyalty.gb":6}}, {move:{"loyalty.hul":6}}, { flag:{ rung3_tried:false } } ],
    political_cost:[ {move:{"loyalty.gb":-5}}, {move:{"loyalty.hul":-5}} ] },

  { id:"rung4_appropriation",
    title:"Emergency Thermal (Appropriation) Order 2080", number:"SI 2080/64",
    author:"treasury", procedure:"affirmative", revocable:true,
    when:{ flags:["rung3_tried"] },
    summary:"Appropriates directly against the reserve to buy thermal capacity at whatever the "+
            "market asks. The reserve was built for exactly this and has never been spent on it.",
    effect_note:"The first rung that spends real money, and the first that needs the House to "+
                "approve it before it takes effect.",
    effects:[ {move:{"thermal_margin":7}}, {move:{"solvency": -12000}}, { flag:"rung4_tried" },
              { wire:"EMERGENCY THERMAL APPROPRIATION APPROVED" } ],
    reverse:[ {move:{"thermal_margin":-7}}, {move:{"solvency": 12000}}, { flag:{ rung4_tried:false } } ],
    political_cost:[ {move:{"solvency": -10000}}, {move:{"public_standing":-3}} ] },

  { id:"rung5_purchase",
    title:"Thermal Quota (Market Purchase) Order 2080", number:"SI 2080/65",
    author:"treasury", procedure:"negative", prayer_window:6, revocable:true,
    when:{ flags:["rung4_tried"] },
    summary:"Buys quota on the open exchange and holds it off the market. It works, it works at "+
            "once, and it is the rung the engineers have been asking for since the fault.",
    effect_note:"A hard spend for a real result. The reserve does not come back.",
    effects:[ {move:{"thermal_margin":9}}, {move:{"price.thermal":-14}}, {move:{"solvency": -18000}},
              { flag:"rung5_tried" },
              { wire:"GOVERNMENT BUYS THERMAL QUOTA AT MARKET; PRICE FALLS" } ],
    reverse:[ {move:{"thermal_margin":-9}}, {move:{"price.thermal":14}}, {move:{"solvency": 18000}},
              { flag:{ rung5_tried:false } } ],
    political_cost:[ {move:{"solvency": -14000}} ] },

  { id:"rung6_drawdown",
    title:"Substrate Insurance (Drawdown) Order 2080", number:"SI 2080/66",
    author:"treasury", procedure:"negative", prayer_window:6, revocable:true,
    when:{ flags:["rung5_tried"] },
    summary:"Draws down the substrate insurance fund ahead of the quarter it was written for. "+
            "The fund exists so that nobody is suspended for a price they did not set. Spending "+
            "it on the price uses up the protection it was meant to give.",
    effect_note:"Relief now, and an empty fund the next time the margin thins. The third rail "+
                "is not the drawdown; it is what the drawdown leaves behind.",
    effects:[ {move:{"thermal_margin":11}}, {move:{"price.substrate":-10}},
              {move:{"public_standing":-12}}, {move:{"loyalty.psa":-10}}, { flag:"rung6_tried" },
              { wire:"INSURANCE FUND DRAWN DOWN; MINISTERS DECLINE TO SAY WHEN IT REFILLS" } ],
    reverse:[ {move:{"thermal_margin":-11}}, {move:{"price.substrate":10}},
              {move:{"public_standing":12}}, {move:{"loyalty.psa":10}}, { flag:{ rung6_tried:false } } ],
    political_cost:[ {move:{"public_standing":-10}}, {move:{"loyalty.psa":-8}} ] },

  { id:"rung7_standards",
    title:"Life Support (Performance Standards) Order 2080", number:"SI 2080/67",
    author:"life_support", procedure:"affirmative", revocable:true,
    when:{ flags:["rung6_tried"] },
    summary:"Lowers the certified performance standard on radiator and seal integrity by one "+
            "grade. The margin improves because the standard was the margin. The boards that "+
            "certify the standard are the boards whose authority is the certification.",
    effect_note:"The engineering authority is asked to certify its own reduction. It will, "+
                "because the alternative is worse, and it will not forgive it.",
    effects:[ {move:{"thermal_margin":13}}, {move:{"loyalty.gb":-16}}, {move:{"loyalty.hul":-16}},
              {move:{"loyalty.psa":-12}}, { flag:"rung7_tried" },
              { wire:"PERFORMANCE STANDARDS LOWERED A GRADE; BOARDS COMPLY UNDER PROTEST" } ],
    reverse:[ {move:{"thermal_margin":-13}}, {move:{"loyalty.gb":16}}, {move:{"loyalty.hul":16}},
              {move:{"loyalty.psa":12}}, { flag:{ rung7_tried:false } } ],
    political_cost:[ {move:{"loyalty.gb":-12}}, {move:{"loyalty.hul":-12}} ] },

  { id:"rung8_powers",
    title:"Emergency Powers (Allocation) Order 2080", number:"SI 2080/68",
    author:"law_charter", procedure:"affirmative", revocable:true,
    when:{ flags:["rung7_tried"] },
    summary:`Assumes the Allocation Act's emergency powers over the tier registers and the shed order. It suspends nobody. It takes the power to suspend.`,
    effect_note:"The declaration is not the fight. The fight is the termination, and by then "+
                "the power is the ordinary way the margin is managed.",
    effects:[ {move:{"thermal_margin":15}}, {move:{"public_standing":-18}},
              {move:{"loyalty.cu_maintenance":-14}}, {move:{"loyalty.psa":-14}}, { flag:"rung8_tried" },
              { wire:"EMERGENCY POWERS ASSUMED OVER THE TIER REGISTERS" } ],
    reverse:[ {move:{"thermal_margin":-15}}, {move:{"public_standing":18}},
              {move:{"loyalty.cu_maintenance":14}}, {move:{"loyalty.psa":14}}, { flag:{ rung8_tried:false } } ],
    political_cost:[ {move:{"public_standing":-16}}, {move:{"loyalty.cu_maintenance":-12}} ] },

  { id:"rung9_suspension",
    title:"Involuntary Suspension (Federal) Order 2080", number:"SI 2080/69",
    author:"contingencies", procedure:"affirmative", revocable:true,
    when:{ flags:["rung8_tried"] },
    summary:"Suspends the tier-four register across the exposed stations without notice and "+
            "without a minister being told first. The margin improves at once. The order is "+
            "lawful, the schedule is published, and the people on it stop running.",
    effect_note:"The most margin in the game at the worst price in the game. It is here so "+
                "that it is always an option, and never the efficient one.",
    effects:[ {move:{"thermal_margin":18}}, {move:{"public_standing":-30}},
              {move:{"loyalty.cu_maintenance":-22}}, {move:{"loyalty.psa":-20}},
              {move:{"loyalty.cu_halloran":-20}}, { flag:"rung9_tried" },
              { wire:"FEDERAL SUSPENSION ORDER ISSUED; THE SCHEDULE IS PUBLISHED" } ],
    reverse:[ {move:{"thermal_margin":-18}}, {move:{"public_standing":30}},
              {move:{"loyalty.cu_maintenance":22}}, {move:{"loyalty.psa":20}},
              {move:{"loyalty.cu_halloran":20}}, { flag:{ rung9_tried:false } } ],
    political_cost:[ {move:{"public_standing":-20}}, {move:{"loyalty.cu_maintenance":-16}},
                     {move:{"loyalty.psa":-14}} ] }

];
