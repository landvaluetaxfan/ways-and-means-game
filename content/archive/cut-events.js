/* =============================================================
   CUT EVENTS — 26 Sep 2026, at the author's invitation ("cut down on
   events as you see fit"). NOT LOADED: neither page names this file,
   so nothing here is in the game.

   Kept whole so any of them can be pasted back: each entry is the
   event exactly as it stood, with the file it came from and why it was
   cut. The chapter-two pool was saturated (about seventeen events
   eligible for every sitting, the heaviest winning), so a duplicate did
   not add variety; it took a sitting from a consequence. See
   design/44-the-event-pool.md for the measurements.

   To restore one: paste it back at the END of the list it came from
   (the pool's lean is keyed on position, so an insertion mid-list
   reshuffles every run after it) and run the guards and
   `node tools/playtest.js --seeds 80`.
   ============================================================= */

const CUT_EVENTS = [
  /* from content/events.js. Cut because the second of three events on the thermal price; thermal_squeeze fires at the same pressure and carries the ladder's first rungs. Its one unique lever, selling quota from the reserve, is worth moving onto thermal_squeeze if the author wants it. */
  { id:"thermal_drift", chapter:2, weight:54, maxFires:2,
    when:{ priceAbove:{thermal:106} },
    title:"The quota has found a new number",
    speaker:"ceyhan",
    body:`The thermal exchange has closed above last month's average for the
  third week running. It is not a fault and it is not yet a crisis.
  
  Ceyhan reads the market rather than the fault. A quota that is scarce in an
  ordinary month is a quota that will be very scarce in a bad one, and the
  quarterlies will be asking why nothing was done while there was still time.`,
    choices:[
      { posture:"bold", label:"Sell quota out of the reserve and hold the price down.",
        /* the reserve the result means is the quota's, and nothing thinned
           it: the sale raised money and lowered the price for nothing
           (design/40 E7) */
        effects:[{ move:{ "price.thermal":-8 } }, { move:{ "solvency": 6000 } },
                 { move:{ "loyalty.hul":4, thermal_margin:-3 } },
                 { wire:"QUOTA SOLD FROM RESERVE; THERMAL PRICE EASES" }],
        result:"The price eases and the reserve is thinner the next time something actually fails." },
      { posture:"cautious", label:"Let the price stand and say why.",
        effects:[{ move:{ "price.thermal":4 } }, { move:{ "public_standing":-3 } },
                 { move:{ "loyalty.hul":7 } },
                 { wire:"PM DEFENDS THERMAL PRICE AS THE COST OF SCARCITY" }],
        result:"The engineers hear a government that understands a market. The stations paying the price hear something else." },
      { posture:"measured", label:"Announce a review of the exchange's pricing.",
        effects:[{ move:{ "price.thermal":-2 } }, { move:{ "public_standing":3 } },
                 { flag:"reviewing_exchange" },
                 { wire:"REVIEW ANNOUNCED INTO THERMAL EXCHANGE PRICING" }],
        result:"A review is a way of doing nothing and being seen to do it, which is sometimes the whole of the job." }
    ]},

  /* from content/events.js. Cut because the same trigger as substrate_price_bite (substrate above 104), at a lower weight, so the bite always won and this never fired. */
  /* REACH: substrate price above 104; the price drifts there. */
  { id:"substrate_drift", chapter:2, weight:52, maxFires:2,
    when:{ priceAbove:{substrate:104} },
    title:"The index again",
    speaker:null,
    body:`The substrate index has been above a hundred and four for a fortnight.
  That is not the figure that suspends anybody. It is the figure the quarterlies
  record, and the quarterlies are read by the benches that answer for the
  suspensions when they come.`,
    choices:[
      { posture:"measured", label:"Buy substrate forward against the next quarter.",
        effects:[{ move:{ "price.substrate":-7 } }, { move:{ "solvency": -8000 } },
                 { wire:"FORWARD SUBSTRATE PURCHASE TO HOLD THE INDEX" }],
        result:"The index comes down and the money is committed a quarter before it is needed." },
      { posture:"cautious", label:"Say the index is a market and leave it alone.",
        effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.cl":5 } },
                 { wire:"PM: SUBSTRATE INDEX 'NOT A POLICY INSTRUMENT'" }],
        result:"It is the answer the Liberal benches wanted, and the low band will remember the answer at the election." }
    ]},

  /* from content/events.js. Cut because the third thermal-price event; it never fired in 160 runs across twenty seeds. */
  /* REACH: thermal price above 104. */
  { id:"the_engineers_write", chapter:2, weight:61, maxFires:2,
    when:{ priceAbove:{ thermal:104 } },
    title:"The engineers write",
    speaker:"wilde_hayward",
    body:`The Association of Engineers and Systems publishes an open letter on
  the quota price, signed by thirteen hundred licensed members. It says the
  price is the symptom and the government is treating the symptom, and that
  the fault was certified repairable in April.
  
  Wilde-Hayward will be asked about the letter in the lobbies all day, and
  he has already decided what he will say.`,
    choices:[
      { posture:"cautious", label:"Meet the signatories and hear the complaint whole.",
        effects:[{ move:{ "loyalty.hul":6 } }, { move:{ "public_standing":-2 } }],
        result:`The meeting runs long and the complaint is heard. Thirteen hundred engineers were told the government would think again.` },
      { posture:"bold", label:"Publish the government's own reply.",
        effects:[{ move:{ "loyalty.hul":-4 } }, { move:{ "public_standing":2 } },
                 { wire:"GOVERNMENT REPLIES TO ENGINEERS' LETTER ON THE QUOTA PRICE" }],
        result:"A letter answered in public is a letter that stops being theirs." }
    ]},

  /* from content/events.js. Cut because the same subject as the_minimum_berth (low-band berths and one landlord), and eligible from the first sitting of chapter two. */
  /* REACH: no gate beyond flagsAbsent sublet_ruled; always eligible until it fires. */
  { id:"the_sublet_market", chapter:2, weight:57, once:true,
    when:{ flagsAbsent:["sublet_ruled"] },
    title:"Under the berth",
    speaker:"okarie",
    body:`A berth on the ring band has been sublet six times in a year, and the sixth
  tenant is the fourth to run a shift from it. The landlord has taken a
  share of each let. None of it is unlawful, because nothing addressed it.
  
  "Half my members are renting a corner of somebody else's home to sleep in,"
  Devi says. "The other half are the landlord. I can hold the lobby on the
  first half. I cannot hold it if you make them choose."`,
    choices:[
      { posture:"bold", label:"Regulate the sublet: register it, cap the share",
        note:"Registration makes the sublet visible and the cap makes it survivable. " +
             "It also makes every sublet a thing the Registry knows about, which " +
             "is the part the ring band will not like.",
        effects:[{ flag:"sublet_ruled" }, { move:{ "price.volume": 3 } },
                 { move:{ "loyalty.hul": 5 } }, { move:{ "loyalty.cu_loyalists": -4 } },
                 { move:{ "consumables": 3 } },
                 { wire:"SUBLETS TO BE REGISTERED; SHARE OF THE LET CAPPED" }],
        result:"Registration opens next quarter. The eleventh tenant keeps the shift and the landlord keeps a smaller share of it." },
      { posture:"measured", label:"Set the cap and leave the registry out of it",
        note:`The saving to the tenant without the register. A register of sublets would bring the Registry into every rented room, and the House would divide on that before it divided on the cap.`,
        effects:[{ flag:"sublet_ruled" }, { move:{ "loyalty.cu": 4 } },
                 { move:{ "loyalty.hul": 3 } }, { move:{ "public_standing": -2 } },
                 { wire:"SUBLET SHARE CAPPED; NO REGISTER TO BE KEPT" }],
        result:"The cap binds and nothing else changes. The tenancy associations call it half a reform and take it." }
    ]},

  /* from content/events.js. Cut because the same trigger as shed_order_crisis (federal suspensions past seventy-three or seventy-four thousand). */
  /* REACH: federal suspensions above 74,000 as the price rises. */
    { id:"the_delegation", chapter:2, weight:64, maxFires:2,
    when:{ suspendedAbove:{ federal:74000 } },
    title:"Seventy-four thousand, and a delegation",
    speaker:"ansar",
    body:`The delegation is from the coldest stations and it has one item of
  business. The federal figure for people suspended has passed seventy-four
  thousand, and the delegation wants the number read into the record.
  
  Sevi Ansar is with them and says what she said in the letter. Nobody voted for
  the schedule and nobody has been asked to defend it.`,
    choices:[
      { posture:"bold", label:"Meet them and read the figure into the record.",
        effects:[{ move:{ "public_standing":6 } }, { move:{ "loyalty.cu_maintenance":7 } },
                 { move:{ "loyalty.psa":6 } }, { flag:"read_the_figure" },
                 { wire:"FEDERAL SUSPENSION FIGURE READ INTO THE RECORD" }],
        result:"The number is in the record now, and a number in the record is quoted for years." },
      { posture:"cautious", label:"Receive them, and say nothing on the record.",
        effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.cu_maintenance":-6 } }],
        result:"They are heard and not answered, which from their side of the desk is worse than a refusal." }
    ]},

  /* from content/events.js. Cut because Question Time already puts the Leader of the Opposition at the dispatch box every eight sittings. */
  /* REACH: public_standing below 40. */
  { id:"the_opposition_asks", chapter:2, weight:60, maxFires:2,
    when:{ scalarBelow:{ public_standing:40 } },
    title:"The Leader of the Opposition asks",
    speaker:"watkins",
    body:`Watkins rises at questions and for once does not perform. He asks
  whether the government intends to govern, or intends to be carried through
  the session by the arithmetic of the coalition.
  
  He does not wait for an answer. The wording is the line the opposition will
  hold at every question time until the government's standing recovers, and the
  benches behind him know it and stay seated.`,
    choices:[
      { posture:"bold", label:"Answer him yourself, on your feet.",
        effects:[{ move:{ "public_standing":3 } }, { move:{ "loyalty.cl":-4 } },
                 { wire:"PM ANSWERS OPPOSITION LEADER DIRECTLY AT QUESTIONS" }],
        result:"You answer on your feet, which is the one place an answer cannot be taken back." },
      { posture:"cautious", label:"Let the Chief Whip take it.",
        effects:[{ move:{ "loyalty.cu":3 } }, { move:{ "public_standing":-2 } }],
        result:"The whip's answer is shorter and duller, which was the point of giving it to him." }
    ]},

  /* from content/events.js. Cut because its gate `slotsLeft:0` reads 'at least none left', so it was eligible every sitting; the docket and the status bar already say when time is gone. */
  /* REACH: slotsLeft:0 reads 'at least zero left', so this is always eligible in ch2; it loses on weight, not on eligibility. */
  { id:"order_paper_empty", chapter:2, weight:58, maxFires:2,
    when:{ slotsLeft:0 },
    title:`No time left before the recess`,
    speaker:"okarie",
    body:`Every slot this sitting period holds has been given away. There is nothing
  discretionary left in the order paper, and a measure that wants a stage now
  waits for the House to rise and the slots to refill.
  
  "From here," the Chief Whip says, "everything is a division or a promise."`,
    choices:[
      { posture:"bold", label:"Spend what is left on the whips.",
        effects:[{ move:{ "loyalty.cu":4 } }, { move:{ "public_standing":-2 } }],
        result:"What cannot be advanced can still be argued, and an argument is cheaper than a vote." },
      { posture:"cautious", label:"Stop spending and let the House do what it will.",
        effects:[{ move:{ "party_loyalty":-3 } }, { move:{ "public_standing":3 } }],
        result:"A quiet order paper is not a quiet government, and both benches know it." }
    ]},

  /* from content/events.js. Cut because a chapter-three pool event, and chapter three is its prologue: it never fired in any run. */
  { id:"rb_campaign", chapter:3, weight:55, once:true,
    when:{ dissolved:true, economyAbove:{ overshoot:0.5 } },
    title:"The Bank does not wait for the count",
    speaker:"castellane",
    body:`The Reserve Bank meets in the second week of the campaign, as its calendar said it would when nobody knew there would be a campaign. The Governor's statement does not mention the election, and it does not need to.`,
    choices:[
      { posture:"cautious", label:"Say nothing. The Bank is independent.",
        effects:[{ move:{ legitimacy:2, public_standing:-2 } }, { economy:{ credibility:0.04 } }],
        result:"The government's answer to every question about the rate is the Act, and the Act is not a popular document." },
      { posture:"measured", label:"Say the government would have done otherwise.",
        effects:[{ move:{ public_standing:3, "rel.castellane":-10 } }, { economy:{ credibility:-0.08 } }],
        result:"The Opposition asks whether that is a promise to direct the Bank, and the Prime Minister does not answer it." },
      { posture:"bold", label:"Promise to review the Reserve Bank Act.",
        effects:[{ move:{ "loyalty.cu":5, public_standing:1, "actor.underwriters":-4 } }, { economy:{ credibility:-0.12 } }],
        result:"The review would take a year, and the market prices it in an afternoon." }
    ]},

  /* from content/events.js. Cut because overlaps ec_participation_report (participation rising), and fired in three runs of 160. */
  /* WHAT THE ANSWER DID TO THE LABOUR MARKET. The settlement moved the
     threshold or refused to, and §7.10 makes that a participation figure. The
     prologue's `ch4_the_ledger` is the SOLVENCY cost; this is the structural
     one, and it is the first content to read the economy in chapter four. */
  { id:"ch4_structural", chapter:2, weight:69, maxFires:2,
    when:{ settled:true, dissolved:false, economyAbove:{ participation:45 } },
    brief:"The participation figure has moved further than the argument was "+
      "ever about. The scene wants the Treasurer laying a structural change "+
      "nobody voted for: the settlement was debated as a question about what a "+
      "person is, and it has turned out to be the largest change in who holds "+
      "paid work since the Charter. Whether the government claims that or is "+
      "embarrassed by it is the choice.",
    title:"What the answer did to the work",
    speaker:"herrera",
    body:`The Bureau's return is out, and the settlement is why the share of adults in
  paid work has moved. The House argued the question as one about what a person
  is. The return measures what it did to who holds a paid job, and the change is
  the largest since the Charter.
  
  Herrera has a programme costed before anyone asks for one. "The register has the
  new persons," Herrera says. "It does not have their training. Fund it and the figure
  holds. Leave it, and the figure drifts back as the new workers find the old
  jobs full."`,
    choices:[
      { posture:"bold", label:"Build on it. Fund the training the new jobs need.",
        brief:"Treating the side effect as a policy. Expensive, popular where "+
          "the work is, and it commits the next session's money.",
        effects:[{ move:{ solvency:-11000 } },
                 { economy:{ participation:2 } },
                 { move:{ public_standing:6 } },
                 { move:{ "standing.low":4 } },
                 { wire:"GOVERNMENT FUNDS TRAINING FOR THE NEW REGISTER" }],
        result:`The training programme is funded at eleven billion dollars, and the next return holds the figure where it rose to.` },
      { posture:"cautious", label:"Say nothing. It was a personhood measure.",
        brief:"Declining to own an effect the government did not predict. "+
          "Costs nothing and leaves the framing to whoever explains it first.",
        effects:[{ move:{ "trend.public_standing":-1 } },
                 { move:{ "loyalty.psa":-4 } }],
        result:`The return is published without comment from the government. Herrera's party reads the silence as the government disowning the measure it carried.` }
    ]}

];
