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

];
