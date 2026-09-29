/* =============================================================
   FLASH I: THE CAMPAIGN.

   A campaign is a folder, and this one is Flash I, the proof of concept:
   the platform crisis of 2080. design/35 is the author's plan for it. The
   files here are one kind each, and each hands its entries to `campaign()`
   (content/setup.js), which tags them `campaign:"flash_i"` and adds them to
   the world's lists. What the game plays is CONTENT.forCampaign("flash_i"):
   the world's entries and this folder's, never another campaign's.

     campaign.js      who opens it: the government, its setup, its
                      introduction
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

        /* THE ROLE AND THE CAST (design/56), part of the introduction and in
           its style, before the signature, which closes it (the author, 28
           Sep: the programme as a separate block displaced the signature,
           and was scrapped). A note for the performer who plays the role, on
           the model of Things That Never Were's casting notes, and the cast
           from `play` below. */
        { kind:"body", head:"The role", body:
`The performer playing this role should be able to capture Flash's composure, and the discipline of someone who has spent a career saying less than she knows. She believes a country can be run the way she ran its currency: by setting clear rules, publishing them, and keeping to them when it hurts. She must hold together a coalition that agrees on the economy and on almost nothing else, a party that chose her to stay in government, and a Parliament in its final session, whose members are already thinking about the election. Beneath the composure is someone who has never been elected to lead anything, and who privately doubts she has the right to. Her most essential characteristic is solitude: she has no old allies in politics, and the one colleague who understood her work, she left behind at the Bank.

Ideal performer for this role is a woman in her early fifties in the alto range.` },
        { kind:"cast", head:"Cast of characters" },

        { kind:"signature", head:"Adriana Eireann Flash \u00b7 Prime Minister" }
      ] },

    /* THE PLAY (design/56): the campaign's frame, outside the world. Its
       logo recurs on each act's card, the intervals and the curtain call,
       its black logo small on the Sitting screen, and its playbill is what the menu shows when a
       government is chosen; both are the author's (28 Sep). The title is
       the author's too, from the introduction: Flash came up in 2070, "in
       the Commonwealth's springtime", and the play is set ten years after.
       `acts` are keyed by chapter, `intervals` by the sitting period the
       House has just finished; the cast is the introduction's and the
       curtain call's. */
    play:{
      title:"After the Springtime",
      logo:"img/plays/flash_i_logo.png",
      logoSmall:"img/plays/flash_i_logo_black.png",
      playbill:"img/plays/flash_i_playbill.png",
      cast:[
        { id:"flash", name:"Adriana Eireann Flash", role:"Prime Minister, and leader of the Party of Socialists and Democrats" },
        { id:"whitlam", name:"Imre Whitlam", role:"Leader of the House, who decides what Parliament debates and when" },
        { id:"trottier", name:"Mandelina Trottier", role:"Deputy Prime Minister, and leader of the New Progressive Party, the coalition's junior partner" },
        { id:"halloran", name:"Dan Czarnecki", role:"Leader of the Hard Left of the Prime Minister's own party" },
        { id:"watkins", name:"Darren Watkins Jr.", role:"Leader of the Opposition, and leader of the Liberal Party" },
        { id:"hatt", name:"Edward Hatt", role:"Leader of the Alliance of Business and Government, elected by no district" },
        { id:"gb_chair", name:"Kazuya Tanako", role:"Chair of the Life Support panel, whose position has not changed since 2072" },
        { id:"castellane", name:"Maren Castellane", role:"Governor of the Reserve Bank, and once Flash's deputy" },
        { id:"tenaya", name:"Jaco van Ryneveld", role:"President of the Commonwealth" },
        { id:"ceyhan", name:"Ivor Ceyhan", role:"Political editor of The Spindle" }
      ],
      ensemble:"Members of Parliament, the residents of thirty stations, the wire services, and Earth's governments and banks.",
      acts:[
        { chapter:1, head:"Act I", title:"The House Is Sitting",
          epigraph:{ body:"There is nothing more difficult to take in hand, more perilous to conduct, or more uncertain in its success, than to take the lead in the introduction of a new order of things.",
                     source:"Niccol\u00f2 Machiavelli, The Prince (tr. W. K. Marriott)" },
          direction:
`The chamber of Parliament, at the Winter Garden, the capital. Morning, 11 April 2080. Two hundred and eighty seats, most of them filled. The coolant pumps run under the floor, and a member who stands to speak learns to pitch a voice over them.

ADRIANA EIREANN FLASH takes the Prime Minister's place on the front bench, in the fourth and last session of this Parliament.` },
        { chapter:2, head:"Act II", title:"Ways and Means",
          epigraph:{ body:"The equal right of all men to the use of land is as clear as their equal right to breathe the air \u2014 it is a right proclaimed by the fact of their existence.",
                     source:"Henry George, Progress and Poverty" },
          direction:
`The same chamber, some weeks on. The order paper is longer than the time left to debate it. In the galleries sit the stations' delegations, and in the lobbies the whips count heads. At the Treasury bench sits a Prime Minister with more to decide than she has votes to carry.` },
        { chapter:3, head:"Act III", title:"The Count",
          epigraph:{ body:"To every thing there is a season, and a time to every purpose under the heaven.",
                     source:"Ecclesiastes 3:1" },
          direction:
`Parliament is dissolved and the chamber is empty. The play moves out to the stations: the concourses, the broadcasts, the queues at the polling stations. Two hundred and eighty seats are to be filled again, and a woman who has never fought a general election is fighting one.` }
      ],
      intervals:[
        { after:1, direction:
`The House rises for the recess. The chamber empties from the back benches forward, and the clerks stay behind to count what is left on the order paper. Members go home to thirty stations on a transit schedule that runs late. The Prime Minister's office stays lit.` },
        { after:2, direction:
`The House rises again. It will sit once more before the session ends, and every member knows it. On the concourse outside the chamber the talk is of seats: who will hold theirs, and who is already drafting a farewell.` }
      ],
      curtain:{ epigraph:{ body:"As the ends of such a partnership cannot be obtained in many generations, it becomes a partnership not only between those who are living, but between those who are living, those who are dead, and those who are to be born.",
                           source:"Edmund Burke, Reflections on the Revolution in France" } }
    } }
] });
