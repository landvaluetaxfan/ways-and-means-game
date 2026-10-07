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
   a bill. It is the only available answer to the HC 2080/117 trap, and
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
            "certified before 2067, adding roughly 900 electors to a constituency of 4,100. "+
            "The new electors are disproportionately maintenance-union members.",
    effect_note:"The new electors move two Life Support seats from the Alliance of Business and Government to the Party of Socialists and Democrats over the following sittings. The Alliance's bench, the Guild Bench, stops voting with the government, its chair Kazuya Tanako breaks with it, and two more members sign the paper for a leadership ballot.",
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

  /* THE CARVE-OUT IS ITS OWN ORDER. SI 2080/44 packs the board, and it
     also used to discharge the promise made to the Life Support panel, so
     the one order kept the panel's promise and took two of its seats. The
     promise is this order: the licence stays closed to copies, and no seat
     moves. It is on the table only once the promise has been made. */
  { id:"si_2080_45",
    title:"Life Support Engineering (Licensing Exemption) Order 2080",
    number:"SI 2080/45",
    author:"attestation_registry",
    procedure:"negative",
    prayer_window:6,
    revocable:true,
    when:{ flags:["licensure_carveout_offered"] },
    summary:"Keeps the Life Support Engineering licence closed to copies recognised as "+
            "persons under a lowered divergence threshold. Such a copy may own property and "+
            "vote in a district, but it may not hold the licence, and so it may not vote for "+
            "the six Life Support seats.",
    effect_note:"It keeps the promise made to Kazuya Tanako, who chairs the Life Support panel, and it moves no seat. The Alliance of Business and Government, her party, gains loyalty to the government. The New Progressive Party, which wants copies licensed on the same terms as anyone else, loses it.",
    effects:[ { flag:"licensing_exempted" },
              {move:{"rel.gb_chair":6}},
              {move:{"loyalty.gb":4}},
              { wire:"ORDER KEEPS COPIES OFF THE LIFE SUPPORT LICENCE, AS PROMISED TO THE PANEL" } ],
    reverse:[ { flag:{ licensing_exempted:false } } ],
    political_cost:[ {move:{"loyalty.psa":-6}} ],
    prayer_stances:{ cu:"against", gb:"against", hul:"against", psa:"for" } },

  { id:"si_2080_51",
    title:"Thermal Allocation (Ember Ridge) Emergency Order 2080",
    number:"SI 2080/51",
    author:"life_support",
    procedure:"affirmative",
    revocable:true,
    summary:"Diverts thermal quota from Anselm Ring to Ember Ridge for the duration of the "+
            "radiator fault. Touches life-support integrity, so the affirmative procedure "+
            "applies and the House must approve it before it takes effect.",
    effect_note:"The quota comes out of Anselm Ring's allocation for as long as the fault lasts. The thermal price falls, and people suspended at Ember Ridge for want of heat are restored.",
    effects:[ {move:{"thermal_margin":7}}, {move:{"price.thermal":-9}},
              { station:{ vantage:{ suspended:-900 } } },
              { flag:"vantage_diverted" },
              { wire:`EMERGENCY THERMAL DIVERSION APPROVED FOR EMBER RIDGE` } ],
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
    summary:"Admits reclassification practitioners to the Legal roll without the full instrument-of-call, adding some 1,600 electors to a constituency of 5,200. Most reclassification practitioners are recently qualified emulations, and vote for the New Progressive Party.",
    effect_note:"Two Legal seats move to the New Progressive Party, one each from the Alliance of Business and Government and the Association of Engineers and Systems. Both lose loyalty to the government, the New Progressive Party gains it, and three more members sign the paper for a leadership ballot. It is the second licensing order, and the opposition calls it a pattern.",
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
    campaign:["world", "flash_i"],      /* Act I's first order (design/80); the world's tests play on it too */
    title:"Voluntary Conservation (Appeal) Order 2080", number:"SI 2080/61",
    author:"substrate_thermal", procedure:"negative", prayer_window:6, revocable:true,
    /* LOCKED UNTIL EMBER RIDGE EXPLAINS IT. Flash I's opening sets the flag and the scene
       a1_ember_ridge clears it; the world never sets it, so the world's tests are unchanged.
       The tutorial ladder (brief E3) will do this for every lever and this can go. */
    when:{ flagsAbsent:["a1_orders_locked"] },
    summary:`Asks every station authority to cut the power it does not need, so that its radiators have less heat to reject. A station may ignore the appeal, so the thermal margin rises by a small amount and only while the appeal is observed.`,
    effect_note:`This is the first of the government's orders on cooling. It costs nothing in the estimates and raises the thermal margin by less than any other order. It takes effect when made and stands unless the House votes against it within six sittings. Voters read an appeal as the government admitting that it cannot compel a station, and mark it down a little.`,
    effects:[ {move:{"thermal_margin":3}}, { flag:"rung1_tried" },
              { wire:"CONSERVATION APPEAL ISSUED TO STATION AUTHORITIES" } ],
    reverse:[ {move:{"thermal_margin":-3}}, { flag:{ rung1_tried:false } } ],
    political_cost:[ {move:{"public_standing":-2}} ] },

  { id:"rung2_clockrate",
    campaign:["world", "flash_i"],      /* Act I's second order (design/80) */
    title:"Clock-Rate (Reduction) Order 2080", number:"SI 2080/62",
    author:"persons_continuity", procedure:"negative", prayer_window:6, revocable:true,
    when:{ flags:["rung1_tried"] },
    summary:`Slows the computers that run digital residents by four per cent until the thermal margin recovers, which cuts the heat they make. Every digital resident then has four per cent less working time each day, and those paid by the hour earn four per cent less.`,
    effect_note:`This is the second of the government's orders on cooling, and it raises the thermal margin by more than the appeal does. The New Progressive Party, the coalition's junior partner, speaks for digital residents and loses loyalty to the government when the order is made.`,
    effects:[ {move:{"thermal_margin":4}}, {move:{"loyalty.psa":-8}}, { flag:"rung2_tried" },
              { wire:"CLOCK RATES CUT FOUR PER CENT; SUBSTRATE LEFT PROTESTS" } ],
    reverse:[ {move:{"thermal_margin":-4}}, {move:{"loyalty.psa":8}}, { flag:{ rung2_tried:false } } ],
    political_cost:[ {move:{"loyalty.psa":-6}} ] },

  { id:"rung3_deferred",
    title:"Deferred-Computation (Scheduling) Order 2080", number:"SI 2080/63",
    author:"substrate_thermal", procedure:"negative", prayer_window:6, revocable:true,
    when:{ flags:["rung2_tried"] },
    summary:"Moves non-critical substrate computation to the cold hours, when the stations can reject heat most easily. The engineering guilds lose the night shift and its overtime.",
    effect_note:"The substrate price falls. The Association of Engineers and Systems and the Alliance of Business and Government lose loyalty to the government.",
    effects:[ {move:{"thermal_margin":5}}, {move:{"price.substrate":-4}},
              {move:{"loyalty.gb":-6}}, {move:{"loyalty.hul":-6}}, { flag:"rung3_tried" },
              { wire:"DEFERRED-COMPUTATION SCHEDULE IMPOSED; GUILD BENCH OBJECTS" } ],
    reverse:[ {move:{"thermal_margin":-5}}, {move:{"price.substrate":4}},
              {move:{"loyalty.gb":6}}, {move:{"loyalty.hul":6}}, { flag:{ rung3_tried:false } } ],
    political_cost:[ {move:{"loyalty.gb":-5}}, {move:{"loyalty.hul":-5}} ] },

  { id:"rung4_appropriation",
    title:"Emergency Thermal (Appropriation) Order 2080", number:"SI 2080/64",
    author:"treasury", procedure:"affirmative", approvalFloor:0.9, revocable:true,
    when:{ flags:["rung3_tried"] },
    summary:"Spends from the reserve to buy thermal capacity at the market price. It is the first time the reserve has been drawn for a thermal emergency.",
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
    summary:"Buys thermal quota on the open exchange and holds it off the market, which raises the margin at once and brings the thermal price down. The engineers have asked for it since the fault.",
    effect_note:"It is paid from the reserve, and the money is not recovered when the emergency ends.",
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
    summary:"Draws on the substrate insurance fund before the quarter it was set aside for, to bring the substrate price down. The fund insures people who cannot pay their substrate rent against suspension, so what is spent now is not there to cover them later.",
    effect_note:"Public standing falls, and so does the New Progressive Party's loyalty. Ministers cannot say when the fund will be refilled.",
    effects:[ {move:{"thermal_margin":11}}, {move:{"price.substrate":-10}},
              {move:{"public_standing":-12}}, {move:{"loyalty.psa":-10}}, { flag:"rung6_tried" },
              { wire:"INSURANCE FUND DRAWN DOWN; MINISTERS DECLINE TO SAY WHEN IT REFILLS" } ],
    reverse:[ {move:{"thermal_margin":-11}}, {move:{"price.substrate":10}},
              {move:{"public_standing":12}}, {move:{"loyalty.psa":10}}, { flag:{ rung6_tried:false } } ],
    political_cost:[ {move:{"public_standing":-10}}, {move:{"loyalty.psa":-8}} ] },

  { id:"rung7_standards",
    title:"Life Support (Performance Standards) Order 2080", number:"SI 2080/67",
    author:"life_support", procedure:"affirmative", approvalFloor:0.9, revocable:true,
    when:{ flags:["rung6_tried"] },
    summary:"Lowers the certified performance standard on radiator and seal integrity by one "+
            "grade. Equipment that failed the old grade may run again, and the capacity it adds "+
            "raises the thermal margin. The licensing boards that set the standard have to "+
            "certify the lower grade themselves.",
    effect_note:"The boards comply under protest. The Association of Engineers and Systems, the "+
                "Alliance of Business and Government and the New Progressive Party all lose "+
                "loyalty to the government for it.",
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
    summary:"Assumes the Allocation Act's emergency powers over the tier registers and the shed order, so the government can order suspensions without further approval. The order suspends nobody itself.",
    effect_note:"Public standing falls sharply, and the Trades Left and the New Progressive Party lose loyalty. Ending the powers later is contested in the House.",
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
    summary:"Suspends everyone on the tier-four register across the exposed stations, without notice and without a minister being told first. The margin improves at once, and the schedule of those suspended is published.",
    effect_note:"It raises the margin more than any other order, and costs more standing and loyalty than any: the Trades Left, the Hard Left and the New Progressive Party all turn against the government.",
    effects:[ {move:{"thermal_margin":18}}, {move:{"public_standing":-30}},
              {move:{"loyalty.cu_maintenance":-22}}, {move:{"loyalty.psa":-20}},
              {move:{"loyalty.cu_halloran":-20}}, { flag:"rung9_tried" },
              { wire:"FEDERAL SUSPENSION ORDER ISSUED; THE SCHEDULE IS PUBLISHED" } ],
    reverse:[ {move:{"thermal_margin":-18}}, {move:{"public_standing":30}},
              {move:{"loyalty.cu_maintenance":22}}, {move:{"loyalty.psa":20}},
              {move:{"loyalty.cu_halloran":20}}, { flag:{ rung9_tried:false } } ],
    political_cost:[ {move:{"public_standing":-20}}, {move:{"loyalty.cu_maintenance":-16}},
                     {move:{"loyalty.psa":-14}} ] },
  /* THE RESERVE BANK ACT'S ORDERS (design/39 option C; the author, 25 Sep
     2026: the Bank is independent "as you said, but not written into the
     charter"). The Act gives the Governor the rate and keeps for Parliament
     two things: a reserve direction, and the Treasury's overdraft. Both are
     affirmative, so the House must approve before either takes effect, and
     both cost the Bank's credibility. A direction is a law key the engine's
     Bank reads at each meeting (`setup.macro.directions`); the overdraft is
     a loan from the Bank, `loan.reserve_bank`. One direction at a time. */
  { id:"si_2080_71",
    title:"Reserve Bank (Direction) Order 2080", number:"SI 2080/71",
    author:"treasury", procedure:"affirmative", revocable:true,
    when:{ flagsAbsent:["bank_directed"] },
    summary:"Directs the Reserve Bank to hold the cash rate at its present level " +
            "at every meeting while the order stands. The Governor sets the rate " +
            "under the Reserve Bank Act 2071; this is the power the Act kept back.",
    effect_note:"The rate stops rising. The dollar falls, the Bank's credibility falls at every meeting the order stands, and expected inflation rises with it.",
    effects:[ { law:{ reserve_direction:"hold" } }, { flag:"bank_directed" },
              { economy:{ credibility:-0.06, fx:-1.5 } },
              { wire:"TREASURY DIRECTS RESERVE BANK TO HOLD THE CASH RATE" } ],
    reverse:[ { law:{ reserve_direction:null } }, { flag:{ bank_directed:false } } ],
    political_cost:[ { move:{ "actor.underwriters":-4, legitimacy:-2 } }, { move:{ "rel.castellane":-15 } } ],
    prayer_stances:{ cl:"for", fh:"for", gb:"for", hul:"for", geo:"for" } },

  { id:"si_2080_72",
    title:"Reserve Bank (Direction) (No. 2) Order 2080", number:"SI 2080/72",
    author:"treasury", procedure:"affirmative", revocable:true,
    when:{ flagsAbsent:["bank_directed"] },
    summary:"Directs the Reserve Bank to lower the cash rate by half a point at " +
            "every meeting while the order stands, whatever its own rule asks.",
    effect_note:"The rate falls half a point at each meeting. The dollar falls when the order is laid, expected inflation rises, and the Bank's credibility falls at every meeting it stands.",
    effects:[ { law:{ reserve_direction:"ease" } }, { flag:"bank_directed" },
              { economy:{ credibility:-0.1, fx:-3, expected:0.3 } },
              { wire:"TREASURY DIRECTS RESERVE BANK TO CUT" } ],
    reverse:[ { law:{ reserve_direction:null } }, { flag:{ bank_directed:false } } ],
    political_cost:[ { move:{ "actor.underwriters":-6, legitimacy:-3 } }, { move:{ "rel.castellane":-25 } } ],
    prayer_stances:{ cl:"for", fh:"for", gb:"for", hul:"for", geo:"for", sc:"for" } },

  { id:"si_2080_73",
    title:"Treasury (Ways and Means Advances) Order 2080", number:"SI 2080/73",
    author:"treasury", procedure:"affirmative", revocable:false,
    when:{ flagsAbsent:["ways_and_means_opened"] },
    summary:"Opens the Treasury's overdraft at the Reserve Bank and draws CW$20 billion on it. The Bank creates the money and credits it to the Treasury's account.",
    effect_note:"The reserve receives the money on the day. Expected inflation rises, the dollar falls, and the Bank's credibility falls further than under any direction.",
    effects:[ { move:{ "loan.reserve_bank":20000 } }, { flag:"ways_and_means_opened" },
              { economy:{ credibility:-0.2, expected:0.8, fx:-4 } },
              { wire:"RESERVE BANK TO FINANCE THE TREASURY DIRECTLY" } ],
    reverse:[],
    political_cost:[ { move:{ "actor.underwriters":-8, legitimacy:-4 } }, { move:{ "rel.castellane":-20 } } ],
    prayer_stances:{ cl:"for", fh:"for", gb:"for", hul:"for", geo:"for", des:"for" } },

  { id:"si_2080_74",
    title:"Exchange Control Order 2080", number:"SI 2080/74",
    author:"treasury", procedure:"negative", prayer_window:6, revocable:true,
    summary:"Requires a Treasury licence for any payment of more than CW$1 million " +
            "to a person outside the Commonwealth, except for trade in goods.",
    effect_note:"The dollar steadies, since money cannot leave quickly. Friction with Earth rises and trade falls, compute exports first: every payment for them now needs a licence.",
    effects:[ { law:{ capital_controls:true } }, { flag:"exchange_controls" },
              { move:{ friction:6 } }, { economy:{ trade:-4, fx:2 } },
              { wire:"EXCHANGE CONTROLS IMPOSED; PAYMENTS TO EARTH NEED A LICENCE" } ],
    reverse:[ { law:{ capital_controls:false } }, { flag:{ exchange_controls:false } },
              { move:{ friction:-6 } }, { economy:{ trade:4 } } ],
    political_cost:[ { move:{ "loyalty.cl":-8, "actor.underwriters":-3 } } ],
    prayer_stances:{ cu:"against", psa:"against", rv:"against", cl:"for", fh:"for", gb:"for", hul:"for" } }

];
