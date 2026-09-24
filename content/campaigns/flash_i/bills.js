/* =============================================================
   FLASH I — BILLS. The Annexation Act, the act the campaign is about.
   Tagged and added to the world's BILLS by `campaign()`.
   ============================================================= */
campaign("flash_i", { bills: [

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
     seven rebels are the Trades Left, who read 97,000 workers
     entering the labour market the way they read the divergence bill, and
     for the same reason.
     ============================================================= */
  { id:"annexation", ref:"HC 4/163", stage:"drafting", owner:"cu",
    /* It brings 184,000 people inside the services guarantee and it settles
       what happens to a charter held on the International's corridor, so those are
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
    axes:{economic:-0.7, authority:0.5, personhood:0.6, sovereignty:0.85, trade:-0.4},
    stances:{
      /* Forecast counts as the whips gave them. Popular 129 of 240, needs 121. */
      cu:  { popular:{for:66}, functional:"for" },  /* seven rebels: the Trades Left */
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
            {wire:"THE HOUSE DECLINES TO BRING THE WORKS IN"}] },

] });
