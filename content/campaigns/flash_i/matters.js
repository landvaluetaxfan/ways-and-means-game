/* Ministerial advice for the proof-of-concept campaign. Thresholds and
   remedies reuse the existing scarcity, account and air mechanics. */
campaign("flash_i", { matters: [
  { id:"f1_heat", owner:"substrate_thermal", recurs:true,
    raise:{scalarBelow:{thermal_margin:15}},
    due:{when:{scalarBelow:{thermal_margin:8}}}, grace:2,
    settled:{scalarAbove:{thermal_margin:14}},
    note:"The stations have little spare capacity to shed heat. An emergency allocation buys a larger margin and needs money and the House's approval. A conservation appeal reduces demand, with a smaller improvement.",
    figures:["heat"],
    remedies:[
      {id:"allocate",target:{kind:"instrument",id:"si_2080_51"},takes:0,
       note:"Open the paid emergency allocation. It takes effect after the House approves it."},
      {id:"conserve",target:{kind:"instrument",id:"rung1_conservation"},takes:0,
       note:"Open the voluntary conservation appeal. It preserves cash and adds less thermal margin."}
    ],
    counsel:[
      {post:"substrate_thermal",remedy:"allocate",
       note:"I recommend the emergency allocation. The additional quota gives us more spare capacity, though it costs CW$6bn and needs the House's approval."},
      {post:"treasury",remedy:"conserve",
       note:"I recommend the conservation appeal. It buys less margin, but preserves the reserve for the next payment. I would accept the smaller cushion for now."}
    ],
    late:"thermal_squeeze",page:"f1_heat_shortage"
  },
  { id:"f1_reserve", owner:"treasury", recurs:true,
    raise:{scalarBelow:{solvency:5000},economyBelow:{headroom:30000,arrears:1}},
    due:{when:{economyBelow:{headroom:10000}}}, grace:2,
    settled:{scalarAbove:{solvency:4999}},
    note:"The reserve is running down, and the Treasury has used much of its authority to issue bills. A drawing brings in cash and interest charges. The Ways and Means order opens the Reserve Bank's overdraft, with costs to inflation and the dollar.",
    figures:[
      {label:"Reserve",source:"scalars.solvency",bands:[{min:5000,text:"held"},{min:null,text:"low"}]},
      {label:"Bill authority",source:"economy.headroom",bands:[{min:30000,text:"room left"},{min:10000,text:"near its limit"},{min:null,text:"little room left"}]}
    ],
    remedies:[
      {id:"notes",target:{kind:"money",id:"underwriters",amount:"utilisation"},takes:0,
       note:"Open a drawing on Commonwealth Reserve Notes. The Underwriters price the loan against the thermal margin."},
      {id:"advances",target:{kind:"instrument",id:"si_2080_73"},takes:0,
       note:"Open the Ways and Means order. The House must approve the Reserve Bank's advance."}
    ],
    counsel:[],late:"reserve_low",page:"f1_reserve_shortage"
  },
  { id:"f1_works_air", owner:"life_support", recurs:false,
    raise:{flags:["station_issue"]},due:24,grace:2,
    settled:{anyOf:[{flags:["works_air_paid"]},{flags:["almanac_annexed"]},{resolved:true}]},
    note:"The Almanac Works' air plant needs filters and catalyst. The suppliers can still send them before the stocks run out. Paying now avoids the emergency premium; manufacturing them here costs less money and takes longer.",
    figures:[{label:"Reserve",source:"scalars.solvency",bands:[{min:5000,text:"held"},{min:null,text:"low"}]}],
    remedies:[
      {id:"ship",target:{kind:"initiative",id:"pay_works_air",tempo:0},takes:1,
       note:"Open payment for the suppliers' arrears and three months ahead, at CW$1.6bn."},
      {id:"manufacture",target:{kind:"initiative",id:"pay_works_air",tempo:1},takes:3,
       note:"Open Commonwealth manufacture after the survey, at CW$600m. It also uses thermal capacity."}
    ],
    counsel:[],late:"f1_air_last_chance",page:"f1_air_fails"
  }
] });
