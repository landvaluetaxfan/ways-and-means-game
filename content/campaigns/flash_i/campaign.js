/* =============================================================
   FLASH I: THE CAMPAIGN.

   A campaign is a folder, and this one is Flash I, the proof of concept:
   the platform crisis of 2080. design/35 is the author's plan for it. The
   files here are one kind each, and each hands its entries to `campaign()`
   (content/setup.js), which tags them `campaign:"flash_i"` and adds them to
   the world's lists. What the game plays is CONTENT.forCampaign("flash_i"):
   the world's entries and this folder's, never another campaign's.

     campaign.js      who opens it: the government, its setup, its
                      introduction; and the sandbox, which plays it
     events.js        the crisis, its foreign layer, the panic buttons'
                      answers, the tier fall and the canon election
     bills.js         the Annexation Act
     settlements.js   the five outcome tiers
     initiatives.js   the facility, Earth's terms, two markets, the pivots
     achievements.js  its awards

   A NEW CAMPAIGN copies this folder, changes the id in every `campaign()`
   call, and adds its files to index.html and editor.html after the world's
   content and before content/index.js. Every check reads the page's list,
   so nothing else needs telling. CONTENT_GUIDE.md "Campaigns" has the rest.
   ============================================================= */
campaign("flash_i", { administrations: [

  { id:"flash_i", party:"cu", leader:"flash", ordinal:"I",
    from:2080, to:2084, session:4,
    /* THE CAMPAIGN'S OWN SETUP, merged one level deep over the world's
       (CONTENT.forCampaign). Its content is this folder plus the world's.
       `opening` would hold effects applied at the first sitting; Flash I
       opens on the world as it is. The bible's 11 April 2080 (§3.9) is a
       placeholder older than the term, and this dates the campaign to the
       term's own first year. */
    setup:{ startDate:"2080-04-11",
      lenders: {
        /* The Alliance is a party of the House, so its facility is a debt at
           home: `home` keeps it out of the Underwriters' reading of the
           quarrel, where a fixed ten per cent read as Earth's rate. */
        alliance: { name: "The Alliance of Business and Government",
                    rate: { fixed: 10 }, serviced: false, repayable: false, home: true,
                    note: "the emergency facility, due before the House rises; secured on the Cordell leases",
                    label: "The Alliance's facility", short: "due at the rise, on the Cordell leases" }
      } },
    /* THE INTRODUCTION (design/31 §5). Rendered through js/setpiece.js, so
       the sections and their kinds are the frame's vocabulary: epigraph,
       lede, body, signature. It is the first thing a player reads, and the
       last thing in it is the signature that will sign every Act she passes.

       DATES, settled with the author. The draft put her arrival in 2081 and
       the governorship in 2082, which cannot stand: Flash I opens 11 April
       2080 and she is already Prime Minister. She comes up in 2070, takes
       the Bank in 2071, floats the dollar in 2073, and goes to the Treasury
       in 2076 from outside the House (bible §3.8): nine years in the two
       money offices before the premiership, none of them elected, and
       recent enough that the people she priced are still sitting in the
       chamber. design/40 E13 reconciled it: it said nine years as Governor
       while the cabinet had her at the Treasury until last week. */
    intro:{
      /* A BED, not the readout. js/music.js exports its moods by name and
         `state` is the state readout, so it was never going to play.
         `anthem` names a recorded track in content/anthem.js: while the
         introduction is up it plays and the bed steps aside, and leaving it
         fades the recording out and the bed back in. `mood` is the fallback
         for a build where the recording is not encoded yet. */
      mood:"moment",
      anthem:"la_bionda",
      title:"Adriana Eireann Flash",
      art:"flash_intro",
      sections:[
        { kind:"epigraph",
          body:"All the rivers run into the sea; yet the sea is not full.",
          source:"Ecclesiastes 1:7" },

        { kind:"lede", body:
`Adriana Eireann Flash is perhaps an example of uncertainty: an unexpected candidate for Prime Minister, a defiance of odds. She had never held elected office before her ascension to the premiership, and yet at this moment she seems to be the best answer the Commonwealth has to the question of who ought to lead it. With the world unsettled and confidence in its old certainties beginning to fray, she stands now at the edge of history.` },

        { kind:"body", head:"The banker", body:
`When the Circumterrestrial Commonwealth emerged out of the primordial soup that was humanity extending into the heavens — first into orbit around Earth, and then further out into the solar system — Adriana Eireann Flash was a banker for Alphabet-JPMorgan Omni, making a name for herself in the latter half of a century that had been defined, economically, by an upheaval in the institutions of the old order as climate change forced their hand.

She came up to the Winter Garden in 2070, in the Commonwealth's springtime, when orbital industry was finding its flourishing and nobody yet knew what any of it was worth. A year later she was Governor of the Reserve Bank of the Circumterrestrial Commonwealth. She was to be the first in a line of faceless bankers who would set the precedent for the composed monetary policy of this novel polity.

That could have been the whole of it. A decade of steady hands and unread minutes, a portrait in a corridor, a pension. Instead, in 2076, the Party of Socialists and Democrats asked her to the Treasury from outside the House, which the Charter has never forbidden, and for four years she ran the Commonwealth's money from the other side of the desk. But it's not like every capable leader was evidently destined to do it beforehand.` },

        { kind:"body", head:"How she came to it", body:
`The Party of Socialists and Democrats did not choose her because she was one of them. It chose her because the party was seemingly in between worlds, in constant melancholic turmoil, unsure of what was to come next. And so, dark horse she was, she hammered her way to the leadership election, and then she won it. She took First Spin at the by-election that followed, which is the first elected office she has ever held.

So she is a banker at the head of the party of maintenance labour, which occasionally mitigates the two facts; occasionally it exemplifies it. The members who put her there did it to keep a government.` },

        { kind:"body", head:"What she inherits", body:
`Her government is a coalition of the Party of Socialists and Democrats, the New Progressive Party, and the Congregational Democratic Alliance; with confidence and supply, they lead a somewhat convincing minority government. Although with that, while the New Progressive Party may align with the PSD on many elements of economic policy, the issue of personhood is one that lies in wait, a test for the shaky alliance which sees a personhood restrictionist PSD and CDA (the CDA also being a semi-awkward fit economically for the governing coalition) pitted against a personhood expansionist NPP.

The PSD are in power because of labour and trade unions. Expanding personhood is a natural threat against that, while the CDA agree from a humanist perspective. The New Progressive Party sees otherwise.

She has one session. The one that opens on the eleventh of April is the parliament's fourth and its last, and the House is already sitting.` },

        { kind:"signature", head:"Adriana Eireann Flash \u00b7 Prime Minister" }
      ] } },

  /* THE SANDBOX. A second government that exists only to be played with, so a
     tester can reach a branch without playing the session that would have
     reached it. Its overrides are all setup fields the engine already reads:
     no pool jitter, a settlement may land as soon as its `when` holds, the
     idleness drag is off, order-paper time and divisions are effectively
     unlimited, and the meters open high enough not to lose by accident.

     Its opening SOLVENCY is the tell. It is set far above anything the real
     campaign can earn, and the test-console events in events.js beside this
     file are gated on `scalarAbove:{solvency:900000}`, which is how the
     console knows it is in the sandbox and stays out of Flash I proper.
     `contentFor()` in js/shell.js builds Flash I's view and merges this
     setup over it. A new campaign that wants a sandbox copies this entry
     and names itself in `campaign`. */
  { id:"sandbox", party:"cu", leader:"flash", ordinal:"(sandbox)",
    from:2080, to:2084, session:4,
    /* Flash I with the brakes off: it plays Flash I's campaign (content,
       setup and opening) and then its own setup on top. */
    campaign:"flash_i",
    setup:{
      weightJitter: 0,
      settlementFloorSittings: 1,
      slotsPerSession: 99,
      divisionsPerSitting: 99,
      grantsPerSitting: 99,
      idleness: { fromChapter: 99, after: 3, drag: { legitimacy: -1 },
                  mark: "Sandbox: the idleness pressure is off" },
      scalars: { public_standing: 70, consumables: 80,
                 thermal_margin: 60, solvency: 999999,
                 legitimacy: 70, friction: 10 } }
  }
] });
