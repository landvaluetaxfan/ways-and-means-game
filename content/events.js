/* ============================================================
   EVENTS — this is the file you will spend the project in.

   Every event is a plain object. To add one, copy an existing
   entry and change it. The engine never needs to know it exists.

     id       unique string
     title    shown in the panel header and the log
     when     conditions (see engine CONDITIONS) — omit for always
     weight   higher fires first among eligible events
     once     true = fires at most once
     speaker  character id, or null
     body     the prose
     choices  [{ label, effects, result }]
     image    { src, palette, caption, credit }  — optional; see CONTENT_GUIDE

   EFFECT VERBS: move law station seats flag
                 bill relationship coalition wire queue
   ============================================================ */

const EVENTS = [

{ id:"the_account", prologue:1, once:true,
  title:"The first question",
  speaker:"ceyhan",
  /* THE EMPHASIS. Her record is FIXED (design/14 §2) — this does not
     change a thing she did. It decides which reading of it she puts her
     weight behind, which is the whole political act of the moderniser
     she is: the same facts read as pragmatism or as betrayal depending
     on who is reading.

     MECHANICAL DEMONSTRATION, opencode's to re-voice. The shape is
     right and the costs are balanced against each other; the sentences
     are engineering. Three flags, and later content may gate a line on
     `led_on_competence` / `led_on_continuity` / `led_on_break` — never a
     branch, only a line. Nothing here forks the prose. */
  body:`He has been waiting by the lift since seven, which means the question is
one he thinks you will not answer.

"Prime Minister. You inherit a majority, a bill you did not write, and a party
that has spent thirty years arguing with itself about what it is for." He does
not look at his notes. "Before anything else: why you?"

It is the only question of the morning that you get to answer twice: once now,
and once for the rest of it. The record is the record. What is not yet settled
is which part of it you intend to be known for.`,
  choices:[
    { label:"Because the last government could not run it, and I can",
      act:"Say it",
      effects:[{flag:"led_on_competence"},
               {move:{public_standing:5}},
               {move:{"loyalty.cu_maintenance":-6}},
               {move:{"rel.gb_chair":6}},
               {wire:"NEW PM PITCHES COMPETENCE; SAYS GOVERNMENT WILL BE 'RUN, NOT ARGUED WITH'"}],
      result:"He writes it down without expression. The engineers will like it. Thirty-one of your own members have spent their careers being told they are the problem, and have just been told again." },

    { label:"Because I am what this party has always been",
      act:"Say it",
      effects:[{flag:"led_on_continuity"},
               {move:{"loyalty.cu_maintenance":11}},
               {move:{"loyalty.cu_loyalists":4}},
               {move:{public_standing:-4}},
               {move:{"loyalty.psa":-5}},
               {wire:"PM CLAIMS THE MOVEMENT'S INHERITANCE; PARTNERS SEEK CLARIFICATION"}],
      result:"The maintenance bloc will carry that sentence into every meeting for a year. So will the New Progressive Party, in a different tone, and the bill you inherited is about wages whichever way you look at it." },

    { label:"Because the party had to change and I changed it",
      act:"Say it",
      effects:[{flag:"led_on_break"},
               {move:{public_standing:7}},
               {move:{"loyalty.psa":9}},
               {move:{"loyalty.cu_maintenance":-13}},
               {move:{"loyalty.cu_halloran":-8}},
               {wire:"PM: 'THE PARTY HAD TO CHANGE.' CZARNECKI GROUP DECLINES TO COMMENT"}],
      result:"It is the answer the country wanted and the one your own benches will quote back at you. Czarnecki declines to comment, which from him is a statement." }
  ]},

{ id:"briefing_divergence", prologue:2, once:true,
  title:"The bill you inherited",
  speaker:"ceyhan",
  body:`Your predecessor promised it and did not have to carry it. You do.

The law says a copy of a person stops being that person after a hundred and
sixty-eight hours of separate life. Under the line, a copy is an instance: the
same legal person, reabsorbable, with no separate wage and no separate vote.
Over it, the copy is a stranger with rights.

The bill cuts the line to forty. A working week. Nearly two million copies
become citizens overnight, six districts have to be redrawn, and every employer
who has been spinning staff copies for a week at a time is suddenly employing
people rather than using them.

The New Progressive Party made it the price of joining your government.
Your own maintenance members, who have spent thirty years watching copies
undercut their wages, would rather you had paid a different price.`,
  choices:[
    { label:"Read the whips' count before deciding anything",
      effects:[{flag:"read_the_count"},],
      result:"It carries among elected members and dies among the functional ones. You will need to know why." },
    { label:"Say publicly that the government stands behind it",
      act:"Say it",
      cost:{ slot:1 },
      effects:[{flag:"read_the_count"},{move:{"public_standing":3}},
               {move:{"loyalty.psa":8}},{move:{"loyalty.cu_maintenance":-9}},
               {wire:"PM COMMITS GOVERNMENT TO FORTY-HOUR THRESHOLD"}],
      result:"The Substrate Left is delighted. Thirty-one of your own members were not consulted." }
  ]},

{ id:"gb_approach", prologue:7, once:true,
  when:{ billStage:{divergence:"committee"}, flagsAbsent:["gb_approached"] },
  title:"The Guild Bench will see you",
  speaker:"gb_chair",
  body:`She has agreed to eleven thirty and to nothing else. The panel chair is a
licensed integrity engineer of forty years' standing and has never in that time
been recorded as voting against the settled position of her sector.

"You want the forty hours," she says, before you have sat down. "You will not get
them from us. Not because of the number. Because of what comes after the number.
Once a fork of eight days is a person, a fork of eight days can hold a licence,
and then the panel that certifies life support is a panel my members do not
recognise. You are not reforming personhood. You are reforming us."`,
  choices:[
    { label:"Offer a licensure carve-out: the threshold moves, licensure does not",
      act:"Offer it",
      /* MECHANICAL PLACEHOLDER, opencode's to reword: the undertaking's
         `text` is the line the order paper carries and the wording is
         prose. The shape is right — this choice is a promise made to a
         named person who will notice — but the sentence is engineering. */
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":12}},{move:{"loyalty.gb":6}},{move:{"loyalty.psa":-9}},
               {undertake:{ id:"licensure_carveout",
                            text:"Lay the licensing order carrying the carve-out",
                            owed_to:"gb_chair", by:4,
                            discharge:{ si:"si_2287_44" },
                            onBreach:"gb_approach" }},
               {wire:"GOVERNMENT SIGNALS LICENSURE CARVE-OUT; SUBSTRATE LEFT FURIOUS"},
               {flag:"licensure_carveout_offered"}],
      result:"She does not say yes. She says she will take it to the panel, which from her is a great deal." },
    { label:"Remind her the sunset clause has been extended four times and will not be a fifth",
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":-15}},{move:{"loyalty.gb":-8}},
               {move:{"public_standing":3}},{flag:"threatened_guild_bench"},
               {wire:"PM RAISES FUNCTIONAL SUNSET IN PRIVATE MEETING, SOURCES SAY"}],
      result:"\"Extend it a fifth time,\" she says, \"or don't. Either way I have the votes and you do not.\"" },
    { label:"Say nothing that can be repeated. Listen.",
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":4}},],
      result:"You learn that the panel meets on Thursday morning, which is four hours before the division." }
  ]},

{ id:"halloran_signatures", prologue:4,
  when:{ loyaltyBelow:{cu_halloran:20}, flagsAbsent:["halloran_confronted"] },
  title:"Nine signatures",
  speaker:"halloran",
  body:`The number is not a secret. Everyone in the tea room can count, and the
count is nine. Czarnecki needs nine more names and he has spent three weeks not
getting them, which means either he cannot or he is waiting.

He catches you in the division lobby, which is deliberate, because it is the one
place the two of you cannot be photographed apart.

"Eleven thousand four hundred of my constituents are fourth on a list that decides
who wakes up," he says. "And the bill you are whipping me on is about how many
hours make a stranger. Give me the shed order. Give me anything on the shed order."`,
  choices:[
    { label:"Commit to bringing the Shed Order Bill back this session",
      effects:[{move:{"loyalty.cu_halloran":22}},{move:{"loyalty.cu_maintenance":9}},{move:{"party_loyalty":7}},
               {flag:"halloran_confronted"},{flag:"shed_order_promised"},
               {bill:{shedorder:{stage:"second_reading"}}}],
      result:"He writes nothing down. He does not need to; you said it in a lobby with forty witnesses." },
    { label:"Offer her a junior ministry and the silence that comes with it",
      effects:[{move:{"loyalty.cu_halloran":14}},{move:{"party_loyalty":4}},{move:{"public_standing":-3}},
               {flag:"halloran_confronted"},{flag:"halloran_bought"},
               {wire:"CZARNECKI TIPPED FOR OFFICE; ASHFIELD DELEGATION SEEKS ASSURANCES"}],
      result:"He takes it. His group does not all follow him, and the ones who don't now have a grievance and no leader." },
    { label:"Refuse. He does not have the nine and you both know it.",
      effects:[{move:{"loyalty.cu_halloran":-11}},{move:{"loyalty.cu_maintenance":-6}},{move:{"party_loyalty":-6}},
               {flag:"halloran_confronted"},{queue:[{event:"halloran_finds_nine",after:4}]}],
      result:"\"No,\" he agrees. \"Not today.\"" }
  ]},

{ id:"halloran_finds_nine", queuedOnly:true, once:true,
  title:"He found them",
  speaker:"halloran",
  body:`Four of the nine are revenants: members returned on the list after losing
a district, who owe their seats entirely to the party and were therefore supposed
to be unbuyable. They have worked out that a leadership change reorders the list,
and that a list can be reordered upward as easily as down.

The ballot is called for the week after next.`,
  choices:[
    { label:"Fight it. Put the whole cabinet on broadcast.",
      effects:[{move:{"party_loyalty":-4}},{move:{"public_standing":-5}},
               {flag:"leadership_ballot_called"},
               {wire:"LEADERSHIP BALLOT CALLED; CABINET DECLARES FOR FLASH"}],
      result:"It becomes a public argument about whether your party believes what it says it believes." },
    { label:"Concede the shed order and the personhood line in one go",
      effects:[{move:{"loyalty.cu_halloran":30}},{move:{"loyalty.cu_maintenance":12}},{move:{"loyalty.psa":-20}},
               {move:{"party_loyalty":12}},
               {bill:{divergence:{stage:"withdrawn",dead:true}}},
               {wire:"THRESHOLD BILL WITHDRAWN; SUBSTRATE LEFT REVIEWS COALITION"}],
      result:"You keep the leadership. The New Progressive Party meets tonight without you." }
  ]},

{ id:"vantage_radiator", prologue:5,
  when:{ scalarBelow:{thermal_margin:22}, flagsAbsent:["vantage_handled"] },
  title:"Ember Ridge, third day below reserve",
  speaker:null,
  image:{ src:"vantage_radiator.png", palette:"broadcast",
          caption:"Radiator array 4, Ember Ridge", credit:"Ring Network" },
  body:`The fault is in a radiator array, the array is twenty-two years old, and
the replacement is in a procurement queue behind a loop upgrade nobody has ever
been able to explain. Under the Allocation Act the engineering authority may
suspend the tier-four register on that station without notice and without a
minister being told first.

There are four thousand two hundred suspended persons on Ember Ridge.`,
  choices:[
    { label:"Authorise emergency thermal transfer from Anselm Ring",
      effects:[{move:{"thermal_margin":11}},{move:{"treasury":-9}},{move:{"public_standing":-4}},
               {station:{vantage:{closure:0.03}}},{flag:"vantage_handled"},
               {wire:"ANSELM RING QUOTA DIVERTED TO VANTAGE HIGH; RING MEMBERS OBJECT"}],
      result:"Your own constituency pays for it, which your own constituency will notice." },
    { label:"Let the authority act under the Act and say so publicly",
      effects:[{move:{"thermal_margin":5}},{move:{"public_standing":-11}},{move:{"loyalty.hul":8}},{move:{"loyalty.psa":-12}},{move:{"loyalty.cu_halloran":-9}},
               {flag:"vantage_handled"},{flag:"deferred_to_authority"},
               {wire:"GOVERNMENT DECLINES TO INTERVENE; ENGINEERING AUTHORITY TO EXERCISE S.12 POWERS"}],
      result:"You have conceded, in public, that the authority's word is final on the one question the charter left open." },
    { label:"Do nothing yet. The fault may clear.",
      effects:[{move:{"thermal_margin":-6}},{queue:[{event:"vantage_cascade",after:3}]}],
      result:"The fault does not clear." }
  ]},

{ id:"vantage_cascade", queuedOnly:true, once:true,
  title:"Tier four, Ember Ridge",
  speaker:null,
  body:`The authority shed the register at 04:12 without notifying the Ministry.
Four thousand two hundred people stopped running. Under the Act this was lawful.
Under the Act you were not required to be told.

The Spindle has the timestamp.`,
  choices:[
    { label:"Announce a statutory review of the shed order authority",
      effects:[{move:{"public_standing":-8}},{move:{"thermal_margin":4}},{move:{"loyalty.psa":6}},{move:{"loyalty.hul":-14}},
               {bill:{shedorder:{stage:"second_reading"}}},
               {wire:"PM ANNOUNCES REVIEW OF SHEDDING POWERS AFTER VANTAGE HIGH"}],
      result:"The review will report after the election, which everyone understands." },
    { label:"Defend the authority. It acted within the law and the law is the law.",
      effects:[{move:{"public_standing":-14}},{move:{"party_loyalty":-9}},{move:{"loyalty.hul":12}},{move:{"loyalty.psa":-16}},{move:{"loyalty.cu_maintenance":-11}},
               {flag:"defended_authority"},
               {wire:"PM DEFENDS SHEDDING DECISION; SUBSTRATE LEFT SUMMONS COALITION MEETING"}],
      result:"You have said out loud the thing the Association of Engineers and Systems says, in your own voice, on the record." }
  ]},

{ id:"cluster_flag", weight:60,
  when:{ minSitting:2, flagsAbsent:["cluster_investigated"] },
  title:"Two hundred and forty accounts",
  speaker:"ceyhan",
  image:{ src:"cluster_feed.png", palette:"newsprint",
          caption:"Registry advisory, 11 April", credit:"The Spindle" },
  body:`Two hundred and forty unattested accounts posted an identical string within
a four-minute window. The Registry flagged the cluster and took no further action,
which is the whole of the power the statute gives it.

Ceyhan wants to know whether you intend to ask for more power, and he wants to
know it on the record, because the answer is a story either way.`,
  choices:[
    { label:"Announce an attestation enforcement bill",
      effects:[{move:{"public_standing":5}},{move:{"loyalty.psa":-8}},{move:{"loyalty.cl":-6}},{move:{"loyalty.gb":5}},
               {flag:"cluster_investigated"},{flag:"attestation_bill_trailed"},
               {wire:"GOVERNMENT TO SEEK REGISTRY ENFORCEMENT POWERS"}],
      result:"The Unattested will read this as what it is." },
    { label:"Say the registry has the powers it should have and the cluster is not illegal",
      effects:[{move:{"public_standing":-4}},{move:{"loyalty.psa":7}},{move:{"loyalty.cl":4}},
               {flag:"cluster_investigated"},{move:{"rel.ceyhan":5}}],
      result:"Correct, unpopular, and quotable in exactly the wrong order." },
    { label:"Ask who paid for the substrate",
      effects:[{flag:"cluster_investigated"},{flag:"cluster_traced"},{move:{"rel.ceyhan":9}},
               {queue:[{event:"cluster_source",after:5}]}],
      result:"Ceyhan writes it down properly, which means he thinks it will go somewhere." }
  ]},

{ id:"cluster_source", queuedOnly:true, once:true,
  title:"Who paid for the substrate",
  speaker:"ceyhan",
  body:`The cycles were billed to a holding entity, the holding entity is one of
six incorporated in the same week, and all six are registered voters in the
Substrate and Hosting functional constituency. The electorate of that seat is
four hundred and eleven.

Somebody manufactured six voters and used the spare capacity to manufacture a
consensus. It is not clear that either is illegal.`,
  choices:[
    { label:"Refer it to the Law Officer and let it run",
      effects:[{move:{"public_standing":7}},{move:{"loyalty.cl":-11}},{move:{"loyalty.gb":-7}},
               {flag:"shells_referred"},
               {wire:"LAW OFFICER TO EXAMINE SHELL REGISTRATIONS IN SUBSTRATE PROVIDERS SEAT"}],
      result:"You have opened a fight about corporate voting eight weeks before you need the functional benches." },
    { label:"Hold it. A seat you may need later is worth more than a story now.",
      effects:[{flag:"shells_held"},{move:{"rel.ceyhan":-8}}],
      result:"Ceyhan runs it anyway, without you, and with a paragraph about what the government knew." }
  ]}
,

/* ---------- CHAPTER ONE, TEACHING (design/21) ----------
   Three things a player can reach chapter two without ever doing: reading the
   order of the day, granting order-paper time, and committing a member to a
   division. Each is taught here by the person who wants it done, in the world's
   voice, one sitting at a time. The Chief Whip can say whatever he likes; the
   prose never puts the tutorial in the Prime Minister's mouth. */

{ id:"the_order_of_the_day", prologue:3,
  when:{ flagsAbsent:["taught_the_day"] },
  title:"The order of the day",
  speaker:"okarie",
  body:`The Chief Whip has the day's paper on the desk before you sit down, and
he reads it the way he reads a division list: slowly, and out loud.

"Everything the House is asking of you is on this sheet," he says. "One of the
four is ours. A session holds six slots of order-paper time and a slot moves a
measure one stage, so the question is never only whether you have the votes. It
is whether you have the time, and the time runs out when the House rises.

"Answer the sheet or do not. It will not ask twice."`,
  choices:[
    { label:"Walk the paper with him. Ask what each item wants.",
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":6 } }, { move:{ "loyalty.cu_loyalists":3 } }],
      result:"He names the mover of each item and what each mover wants back. It is the same list every sitting, and nobody explains it twice." },
    { label:"Read it alone and send him back to the lobbies.",
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":-4 } }, { move:{ "public_standing":2 } }],
      result:"You will read the sheet alone every sitting. He says nothing about it, which is how he says everything." }
  ]},

{ id:"the_whip_list", prologue:6,
  when:{ flagsAbsent:["whip_briefed"] },
  title:"The list",
  speaker:"okarie",
  body:`The bill is called this session or the next, and the Chief Whip has come
with one sheet. It has the members who are with the government, the members who
are not, and the members who have not decided, which is the column he is
interested in.

"Two ways to move a vote," he says. "You can spend the party's goodwill on the
benches that already sit behind you, and it comes back when the session next
opens. Or you can go outside the coalition and ask a body for a favour. A favour
is not money and it is not loyalty. A favour is a promise, and a promise has a
date on it."

He leaves the sheet on the desk and does not pick it up again.`,
  choices:[
    { label:"Hold what we have. Spend nothing yet.",
      effects:[{ flag:"whip_briefed" }, { move:{ "loyalty.cu":5 } }, { move:{ "public_standing":-2 } }],
      result:"The whips will hold the benches they have and wait. It is the cheaper order, and it leaves the decision where it was." },
    { label:"Whip the party hard and take the measure now.",
      effects:[{ flag:"whip_briefed" }, { move:{ "loyalty.cu":-6 } }, { move:{ "public_standing":3 } }, { flag:"whipped_own_side" }],
      result:"It is the noisier order. Members who were asked twice remember it, and so does the public." }
  ]},

/* ---------- CHAPTER TWO — the division and its consequences ----------
   Every event below is tagged chapter:2, so none of them can fire until
   something applies {chapter:2}. The opening is authored (prologue:2),
   the rest is a weighted pool. */

{ id:"ch2_open", chapter:2, prologue:2, once:true,
  title:"Thursday",
  speaker:null,
  body:`The panel met at nine. Whatever was said in that room has not reached
this one, and the whips have stopped pretending to count.

The bill is called at two. You have the morning.`,
  choices:[
    { label:"Spend the morning on your own benches",
      effects:[{move:{"loyalty.cu_maintenance":6}},{move:{"loyalty.cu_halloran":4}},
               {flag:"whipped_own_side"}],
      result:"Five members who intended to abstain will now vote. It does not change the second bench." },
    { label:"Spend it on the functional members who are not Guild Bench",
      effects:[{move:{"loyalty.fh":5}},{move:{"loyalty.hul":3}},{move:{"treasury":-6}},
               {flag:"lobbied_functional"}],
      result:"Two members of the Freehold Party will consider it. Two is not nine." },
    { label:"Let it fall and be seen to have tried",
      effects:[{move:{"public_standing":4}},{move:{"loyalty.psa":-10}},
               {flag:"let_it_fall"},
               {wire:"GOVERNMENT SIGNALS IT WILL NOT DELAY THE THRESHOLD DIVISION"}],
      result:"The Substrate Left understands exactly what you have decided." }
  ]},

{ id:"ch2_carveout_price", chapter:2, weight:80, once:true,
  when:{ flags:["licensure_carveout_offered"] },
  title:"What the carve-out costs",
  speaker:"gb_chair",
  body:`The panel will let the threshold move if licensure does not. That is the
whole of the offer and it is not negotiable at the margins.

What it means in practice: an emulation separated for forty-one hours becomes a
person, may hold property, may vote in a district, and may not hold a life
support licence, which means may not vote in the constituency that represents
the work she does every day.

The New Progressive Party will read the clause within the hour.`,
  choices:[
    { label:"Take it. A right you can exercise is worth more than one you cannot.",
      effects:[{law:{divergence_threshold_hours:40}},{bill:{divergence:{stage:"passed",dead:true}}},
               {move:{"loyalty.psa":-18}},{move:{"loyalty.gb":10}},{move:{"public_standing":6}},
               {flag:"carveout_taken"},
               {queue:[{event:"ch2_psa_conference",after:2}]},
               {wire:"THRESHOLD BILL CARRIES WITH LICENSURE CARVE-OUT; PSA CONFERENCE CALLED"}],
      result:"It passes. Your coalition partner votes for a bill it will spend the next election denouncing." },
    { label:"Refuse. A franchise with a profession-shaped hole in it is not a franchise.",
      effects:[{bill:{divergence:{stage:"defeated",dead:true}}},{move:{"loyalty.psa":8}},{move:{"loyalty.gb":-6}},
               {move:{"public_standing":-5}},
               {flag:"carveout_refused"},
               {wire:"THRESHOLD BILL FALLS ON THE FUNCTIONAL DIVISION"}],
      result:"It fails on the second bench, 12 to 40, exactly as the count said it would." }
  ]},

{ id:"ch2_psa_conference", chapter:2, queuedOnly:true, once:true,
  title:"The conference votes",
  speaker:null,
  body:`Six hundred delegates, most of them running at a clock rate the party
subsidises, reached a view in under four subjective hours.

The motion instructs the parliamentary party to review its participation in the
coalition. It is not binding. Nothing at a conference ever is.`,
  choices:[
    { label:"Go and speak to them yourself",
      effects:[{move:{"loyalty.psa":12}},{move:{"public_standing":-4}}],
      result:"You are heard politely. Thirty-one delegates walk out during the second half." },
    { label:"Send the Chief Whip and stay away",
      effects:[{move:{"loyalty.psa":-6}},],
      result:"The whip reports that it went as well as it could have. The whip reports this about everything." }
  ]},

{ id:"substrate_price_bite", chapter:2, weight:88,
  when:{ priceAbove:{substrate:112}, flagsAbsent:["substrate_bite_seen"] },
  title:"What the rent did",
  speaker:"ansar",
  body:`Nobody legislated for this. The substrate index has been above a hundred
and twelve for three weeks and the low band is doing what the low band does
when it cannot pay: the tier-four register on Homestead has grown by four figures
and nobody has announced anything, because nothing was announced. The price went
up and people stopped running.

Sevi Ansar has sent the ninth deck's letter to every member for a low-band seat,
which is eleven of yours.

"You did not vote for this," it says. "That is the part I would like explained."`,
  choices:[
    { label:"Emergency substrate subsidy, funded from the reserve",
      effects:[{move:{"price.substrate":-16}},{move:{"treasury":-14}},{move:{"public_standing":5}},
               {move:{"loyalty.cu_maintenance":8}},{move:{"loyalty.psa":6}},{flag:"substrate_bite_seen"},
               {wire:"EMERGENCY SUBSTRATE SUBSIDY ANNOUNCED; INDEX FALLS"}],
      result:"The index comes down. The reserve does not come back." },
    { label:"Say plainly that the rent is a market outcome and the government does not set it",
      effects:[{move:{"public_standing":-9}},{move:{"loyalty.cu_maintenance":-13}},{move:{"loyalty.psa":-10}},{move:{"loyalty.cl":7}},
               {flag:"substrate_bite_seen"},{flag:"denied_the_rent"},
               {wire:"PM: SUBSTRATE RENTS \"NOT A MATTER FOR MINISTERS\""}],
      result:"It is not true, and eleven members for low-band seats know exactly how untrue it is." },
    { label:"Bring the public stake bill forward and stake the session on it",
      effects:[{bill:{substrate_public_stake:{stage:"second_reading"}}},
               {move:{"loyalty.psa":14}},{move:{"loyalty.cl":-12}},
               {flag:"substrate_bite_seen"},{flag:"staked_on_public_stake"},
               {wire:"GOVERNMENT ADVANCES PUBLIC STAKE BILL AFTER RENT RISE"}],
      result:"You have made the rest of the session about one bill. The Liberal Party begins counting." }
  ]},

/* ============================================================
   THE CONSEQUENCE CHAIN (design/03, bible 7.9)

   Six numbers move every sitting and, until now, nothing read them
   back. The engine runs three quarters of the chain already — decision,
   price, station conditions — and had almost nothing at the end of it.
   Each event below is the last link: a number the engine has been
   quietly moving becomes something the player is told about by
   somebody. The `when` is the whole point; the prose is the delivery.
   ============================================================ */

{ id:"shed_order_crisis", chapter:2, weight:95, once:true,
  when:{ priceAbove:{substrate:106}, suspendedAbove:{federal:73000},
         flagsAbsent:["shed_crisis_seen"] },
  title:"Seventy-five thousand",
  speaker:null,
  body:`The number is published quarterly and has never once been read aloud in
the House. Seventy-five thousand and some. That is the count of people suspended
across the thirty stations, stopped and held and not running, and it has crossed
the figure the Allocation Act calls a federal strain.

What follows is not a headline. It is a shed order, posted at 06:00: Ashfield,
tier four, a further eleven hundred, effective next sitting. Nobody voted for it.
It is what the price does when it goes up and nobody pays it down.

By the time the House sits, the figure has been on the wire four hours and the
government has said nothing.`,
  choices:[
    { label:"Intervene. Requisition substrate and suspend the order.",
      effects:[{move:{"price.substrate":-12}},{move:{"treasury":-16}},{move:{"public_standing":7}},
               {move:{"loyalty.cu_maintenance":10}},{move:{"loyalty.psa":8}},
               {flag:"shed_crisis_seen"},{flag:"intervened_in_shed"},
               {wire:"GOVERNMENT REQUISITIONS SUBSTRATE; SHED ORDER SUSPENDED"}],
      result:"The order is suspended. The reserve pays for it, and the next order will be larger, because nothing about the price has changed." },
    { label:"Let it stand. The Act is the Act and the price is the price.",
      effects:[{move:{"public_standing":-12}},{move:{"loyalty.cu_maintenance":-14}},{move:{"loyalty.psa":-11}},
               {move:{"loyalty.hul":9}},{flag:"shed_crisis_seen"},{flag:"let_the_shed_stand"},
               {wire:"PM DECLINES TO SUSPEND SHED ORDER; ASHFIELD DELEGATION WALKS OUT"}],
      result:"Eleven hundred people stop running, lawfully, on a schedule the government did not choose and did not refuse." },
    { label:"Blame the drift. Announce a review of the price mechanism.",
      effects:[{move:{"public_standing":-4}},{move:{"loyalty.cu_maintenance":-6}},
               {flag:"shed_crisis_seen"},{flag:"blamed_the_drift"},
               {wire:"PM ORDERS REVIEW OF SUBSTRATE PRICE MECHANISM AFTER SHED ORDER"}],
      result:"A review reports to a minister, the minister reports to you, and the number keeps climbing while it does." }
  ]},

{ id:"thermal_squeeze", chapter:2, weight:70, once:true,
  when:{ priceAbove:{thermal:112}, flagsAbsent:["thermal_squeeze_seen"] },
  title:"The quota is not a price until somebody cannot pay it",
  speaker:null,
  body:`Thermal capacity is bought and sold like anything else, and for eleven
years the price has been boring. It is not boring now. The margin between what
the stations can reject and what they generate has thinned, and the exchange has
done what an exchange does with a thin market: it has found a number.

Ember Ridge is bidding for its own quota. Tsiolkovsky is bidding against it,
because Tsiolkovsky's substrate farms run hot and have to. Both of them are
bidding with money that came, in the end, from the appropriation.`,
  choices:[
    { label:"Buy quota on the open market and hold the price down",
      effects:[{move:{"price.thermal":-14}},{move:{"treasury":-18}},{move:{"loyalty.hul":6}},
               {move:{"thermal_margin":5}},{flag:"thermal_squeeze_seen"},
               {wire:"GOVERNMENT BUYS THERMAL QUOTA AT MARKET; PRICE FALLS"}],
      result:"The price comes down for everyone and the reserve pays for one station's comfort twice over." },
    { label:"Cap the exchange. A quota is not a commodity.",
      effects:[{move:{"price.thermal":-8}},{move:{"loyalty.hul":-12}},{move:{"loyalty.cl":-9}},
               {move:{"public_standing":4}},{flag:"thermal_squeeze_seen"},{flag:"capped_the_exchange"},
               {wire:"GOVERNMENT CAPS THERMAL EXCHANGE; ENGINEERS WARN OF UNDERINVESTMENT"}],
      result:"The cap holds the price and chokes the market that builds the radiators. Both effects arrive in about four years." },
    { label:"Leave the market alone. Scarce things have prices.",
      effects:[{move:{"public_standing":-7}},{move:{"loyalty.hul":7}},{move:{"thermal_margin":-4}},
               {flag:"thermal_squeeze_seen"},{flag:"left_thermal_market"},
               {wire:"PM: THERMAL PRICE 'A SIGNAL, NOT A SCANDAL'"}],
      result:"The signal reaches the stations that cannot pay it, which is what a signal is for." }
  ]},

{ id:"party_fracture", chapter:2, weight:80, once:true,
  when:{ scalarBelow:{party_loyalty:22}, flagsAbsent:["party_fracture_seen"] },
  title:"The tea room has a count",
  speaker:null,
  body:`Nobody has called a ballot and nobody has asked for one. What has
happened is smaller and worse: the party has stopped bringing its arguments to
you. Three motions have gone to committee this week and you learned about all
three afterwards.

The whip's count is a count of people who will vote with the government and
against the party, and it has been shrinking for a month.`,
  choices:[
    { label:"Go to them. Put the whole programme in front of the backbench.",
      effects:[{move:{"party_loyalty":14}},{move:{"loyalty.cu_maintenance":6}},
               {move:{"public_standing":-3}},{flag:"party_fracture_seen"},
               {wire:"PM ADDRESSES OWN BACKBENCH AFTER WEEKS OF DRIFT"}],
      result:"You give them the argument and the timetable. Half of them wanted to be asked." },
    { label:"Reshuffle. Move two of them up and one of them out.",
      effects:[{move:{"party_loyalty":6}},{move:{"loyalty.cu_halloran":-10}},{move:{"loyalty.cu_maintenance":-4}},
               {flag:"party_fracture_seen"},{flag:"fracture_reshuffle"},
               {wire:"MINI-RESHUFFLE AFTER BACKBENCH UNREST"}],
      result:"The promotion is read as a bribe and the removal as a warning, and both readings are correct." },
    { label:"Ignore it. A party that argues is a party that is alive.",
      effects:[{move:{"party_loyalty":-8}},{move:{"public_standing":2}},{flag:"party_fracture_seen"},
               {wire:"PM DISMISSES TALK OF PARTY UNREST AS 'A WORKING PARTY WORKING'"}],
      result:"It is alive. It is also, increasingly, not yours." }
  ]},

{ id:"reserve_low", chapter:2, weight:75, once:true,
  when:{ scalarBelow:{treasury:14}, flagsAbsent:["reserve_low_seen"] },
  title:"What is left of the reserve",
  speaker:null,
  body:`The appropriation is spent, the contingency is spent, and what remains
in the reserve is a number the Treasury will not put in a document because
putting it in a document would make it a fact.

There is no lender. The Commonwealth has never borrowed and the Charter does not
provide for it. What there is, is the option of not paying for something the
Commonwealth has already promised to pay for.`,
  choices:[
    { label:"Raise the tether tariff. The traffic pays.",
      effects:[{move:{"treasury":16}},{move:{"price.substrate":6}},{move:{"loyalty.cl":-10}},
               {move:{"loyalty.cu_maintenance":-5}},{flag:"reserve_low_seen"},{flag:"raised_tariff"},
               {wire:"TETHER TARIFF RAISED TO REFILL RESERVE; SHIPPERS OBJECT"}],
      result:"The reserve fills. The substrate price rises with it, and the low band pays the difference in a currency the Treasury does not measure." },
    { label:"Defer the maintenance appropriation. It is not due this session.",
      effects:[{move:{"treasury":10}},{move:{"thermal_margin":-9}},{move:{"loyalty.hul":-11}},
               {flag:"reserve_low_seen"},{flag:"deferred_maintenance"},
               {wire:"MAINTENANCE APPROPRIATION DEFERRED TO NEXT SESSION"}],
      result:"Nothing fails this session. Things that fail next session were being maintained this one." },
    { label:"Spend what is left and let the next government find the rest.",
      effects:[{move:{"public_standing":5}},{move:{"loyalty.cu_maintenance":7}},
               {flag:"reserve_low_seen"},{flag:"spent_the_reserve"},
               {wire:"PM COMMITS RESERVE TO CURRENT PROGRAMME"}],
      result:"It is not dishonest. It is a bet that the bill comes due to somebody else." }
  ]},

{ id:"standing_low", chapter:2, weight:78, once:true,
  when:{ scalarBelow:{public_standing:26}, flagsAbsent:["standing_low_seen"] },
  title:"A government nobody is for",
  speaker:"ceyhan",
  body:`The polling is not catastrophic. It is flat, which is worse: you
are not hated and you are not trusted, and the number that measures the gap
between those two things has been falling all session.

Ceyhan asks the question the number is actually about. "If you lost tomorrow,
who would notice? Not who would be pleased. Who would notice."`,
  choices:[
    { label:"Answer it with something they will notice.",
      effects:[{move:{"public_standing":12}},{move:{"treasury":-10}},{move:{"loyalty.psa":5}},
               {flag:"standing_low_seen"},{flag:"bought_attention"},
               {wire:"GOVERNMENT ANNOUNCES RELIEF PACKAGE AS POLLS FLATLINE"}],
      result:"The number moves and the money is gone, and both of those facts will be tested again in a month." },
    { label:"Answer it honestly. A government is not a popularity.",
      effects:[{move:{"public_standing":-5}},{move:{"loyalty.cu_maintenance":6}},{move:{"rel.ceyhan":6}},
               {flag:"standing_low_seen"},{flag:"refused_the_poll"},
               {wire:"PM: 'I DID NOT COME HERE TO BE LIKED'"}],
      result:"It is the most quotable thing you have said in weeks, which is its own kind of problem." },
    { label:"Change the subject. Reshuffle the cabinet and reset the story.",
      effects:[{move:{"public_standing":7}},{move:{"party_loyalty":-7}},{move:{"loyalty.cu_loyalists":-8}},
               {flag:"standing_low_seen"},{flag:"reset_the_story"},
               {wire:"CABINET RESHUFFLE ANNOUNCED; SENIOR MINISTERS OUT"}],
      result:"The story resets and the people who made the government work are now the people briefing against it." }
  ]},

{ id:"threshold_consequence", chapter:2, weight:85, once:true,
  when:{ lawBelow:{divergence_threshold_hours:100}, flagsAbsent:["threshold_seen"] },
  title:"Two million, and then the registers",
  speaker:null,
  body:`The threshold has moved, so the registers have to. Every copy separated
for longer than the new figure is a person, and the Registry has to find out how
many that is, and where they vote, and whether they were counted somewhere else
already.

Six districts have to be redrawn. Two of them are yours. The functional rolls
grow by an amount nobody can estimate until the Registry has finished, and the
Registry has said, in writing, that it will not finish before the next election.`,
  choices:[
    { label:"Fund the Registry. Whatever it costs, the roll has to be true.",
      effects:[{move:{"treasury":-14}},{move:{"public_standing":8}},{move:{"loyalty.psa":9}},
               {move:{"loyalty.cl":-5}},{flag:"threshold_seen"},{flag:"funded_the_registry"},
               {wire:"EMERGENCY REGISTRY FUNDING AFTER THRESHOLD CHANGE"}],
      result:"The roll will be true, late, and expensive, which is the best of the three available outcomes." },
    { label:"Set the new electors aside until after the election.",
      effects:[{move:{"public_standing":-13}},{move:{"loyalty.psa":-16}},{move:{"loyalty.cu_maintenance":4}},
               {flag:"threshold_seen"},{flag:"set_aside_new_electors"},
               {wire:"GOVERNMENT DEFERS ENFRANCHISEMENT OF NEW PERSONS TO NEXT PARLIAMENT"}],
      result:"Two million people are told their rights start after the vote that would have exercised them." },
    { label:"Let the districts stay wrong. A wrong boundary is a legal boundary.",
      effects:[{move:{"public_standing":-6}},{move:{"loyalty.cu_maintenance":-7}},{move:{"loyalty.psa":-4}},
               {flag:"threshold_seen"},{flag:"kept_wrong_boundaries"},
               {wire:"BOUNDARY COMMISSION OVERRULED; REDRAW DEFERRED"}],
      result:"The seat you hold and the seat you are entitled to hold have stopped being the same seat." }
  ]},

/* THE LEADERSHIP BALLOT (design/08 §2). The engine holds the ballot when the
   signatures reach the threshold and decides it from the caucus arithmetic;
   this event is the prose for the one the Prime Minister survives. A lost one
   ends the government through the existing loss condition and is never read. */
{ id:"leadership_ballot", chapter:2, weight:99, once:true,
  when:{ ballotHeld:true, ballotCarries:true, flagsAbsent:["ballot_seen"] },
  title:"The ballot",
  speaker:null,
  body:`The count is in the tea room before it is in the lobby. The names were
twelve, and twelve is enough to force a ballot, and a ballot is a vote on you.

It is not a division of the House. It is a division of the party, held in the
committee room, on a paper that is destroyed afterwards. The whips count their
own benches and nobody else's, and what is being decided is whether the party
that put you here intends to keep you.`,
  choices:[
    { label:"Let the count be taken. Say nothing.",
      effects:[{flag:"ballot_seen"},{move:{"loyalty.cu_maintenance":6}},{move:{"loyalty.cu_loyalists":-4}},
               {wire:"LEADERSHIP BALLOT HELD; PM SURVIVES"}],
      result:"You survive, and every member who signed knows exactly what the number was, and what it would take." },
    { label:"Speak first. Remind them what the alternative costs.",
      effects:[{flag:"ballot_seen"},{move:{"loyalty.cu_halloran":-8}},{move:{"loyalty.cu_loyalists":8}},
               {move:{"public_standing":3}},
               {wire:"PM ADDRESSES CAUCUS BEFORE BALLOT; SURVIVES"}],
      result:"The speech is remembered as the day the party decided, which is not the same as the day it agreed." }
  ]},

/* A MINISTER ANSWERS FOR A BROKEN PROMISE (design/08 §3). The engine vacates the
   post when an undertaking naming it is broken, and sets `minister_resigned`;
   this is the prose for the aftermath. The resignation itself is not the
   player's to choose — that is the point of it. */
{ id:"minister_resignation", chapter:2, weight:99, once:true,
  when:{ flags:["minister_resigned"] },
  title:"A resignation",
  speaker:null,
  body:`The letter is on the desk before the morning brief, which is how these
things are arranged: the minister told the paper, the paper called the office,
and the office said nothing.

The resignation is not a protest. It is a payment. A promise was made in that
minister's name and the promise was not kept, and in this building a minister
who will not resign for it is resigned for. The post is empty. What it will not
do is stay empty by itself.`,
  choices:[
    { label:"Fill it from the loyal wing of the party.",
      effects:[{move:{"party_loyalty":5}},{move:{"public_standing":-2}},
               {wire:"VACANT POST FILLED AFTER MINISTERIAL RESIGNATION"}],
      result:"The replacement is grateful, which is a form of loyalty that has to be renewed." },
    { label:"Leave it empty. Do the work from your own office.",
      effects:[{move:{"public_standing":-4}},{flag:"post_left_vacant"},
               {wire:"PM LEAVES MINISTERIAL POST VACANT"}],
      result:"No instrument comes out of that brief until someone holds it, and the opposition has read the same rules you have." }
  ]},

/* ============================================================
   THE INITIATIVES ANSWER (design/18 §4)

   Three things a government can put in motion rather than answer, and
   the answer to each. content/initiatives.js queues these by id, and
   each is queuedOnly so nothing can reach it before she has started
   the thing.

   ONE EVENT PER INITIATIVE, and the tempo is read off the flags that
   tempo set — `when` on a choice, which is where a branch belongs.
   The answer arrives either way; what changes is what she can do
   with it, and that is the whole of the tempo decision.
   ============================================================ */

{ id:"guild_answers", queuedOnly:true, once:true,
  title:"The panel's answer",
  speaker:"gb_chair",
  body:`The panel met on Thursday, which is when it always meets, and the answer it agreed is the one the sector has given every government since 2279.

"Nine seats," the chair says, "and not one of them moves for a government that has moved the roll. Count it again if you like. The count will not change."

She is not angry about it, which is the difficulty. She has been doing this longer than the government has existed, and she is telling you what her members will do, not what she thinks of you.`,
  choices:[
    { label:"Take the answer. Stop asking.",
      effects:[{flag:"guild_met"},{move:{"rel.gb_chair":5}},{move:{"loyalty.gb":5}}],
      result:"The panel has said no. A government that hears no and moves on keeps something the next approach will need." },
    { label:"Ask what it would take, and make her name it.",
      effects:[{flag:"guild_met"},{flag:"guild_price_asked"},
               {move:{"rel.gb_chair":-6}},{move:{"loyalty.gb":-4}}],
      result:"She names it, and it is the thing you already knew: leave the roll alone. Naming it in a room is not the same as knowing it." },
    { label:"Remind her the sunset clause has been extended four times.",
      when:{ flagsAbsent:["threatened_guild_bench"] },
      effects:[{flag:"guild_met"},{flag:"threatened_guild_bench"},
               {move:{"rel.gb_chair":-12}},{move:{public_standing:2}}],
      result:"\"Extend it a fifth time,\" she says. \"You will need us for that too.\"" }
  ]},

{ id:"review_reports", queuedOnly:true, once:true,
  title:"What the standing orders have shed",
  speaker:null,
  body:`Somebody has finally counted. The register of people suspended under the standing shed orders stands at seventy-six thousand, and no House has ever been told the number aloud, because nothing required it to be.

It is not a scandal. It is a schedule. That is the part that will be quoted.`,
  choices:[
    { label:"Read the number into the record yourself.",
      when:{ flags:["review_full"] },
      effects:[{flag:"shed_number_published"},{move:{public_standing:8}},
               {move:{"loyalty.cu_maintenance":10}},{move:{"loyalty.hul":9}},
               {wire:"PM READS SHED ORDER TOTAL INTO THE HOUSE: SEVENTY-SIX THOUSAND"}],
      result:"A figure an inquiry produced carries the inquiry's weight. That is what paying for the inquiry bought." },
    { label:"Take the number and sit on it.",
      when:{ flags:["review_thin"] },
      effects:[{flag:"shed_number_held"},{move:{public_standing:-3}}],
      result:"A departmental note is easy to keep. It is also easy to leak, and it now sits in the department." },
    { label:"Announce a standing register, published quarterly.",
      effects:[{flag:"shed_register_promised"},{move:{public_standing:5}},
               {move:{"loyalty.psa":6}},{move:{"loyalty.gb":-5}},
               {wire:"GOVERNMENT TO PUBLISH SHED ORDER REGISTER QUARTERLY"}],
      result:"The number becomes furniture. That is either the point of publishing it or the way to stop it mattering, depending on who is asked." },
    { label:"Do nothing with it. It was a review, not a policy.",
      effects:[{flag:"review_filed"},{move:{"loyalty.cu_maintenance":-6}}],
      result:"The file joins the others. Someone on the maintenance benches will ask for it by name within the month." }
  ]},

{ id:"position_lands", queuedOnly:true, once:true,
  title:"What saying it did",
  speaker:"ceyhan",
  body:`It is on the record now, and the record is the thing that cannot be walked back. The question is not whether anyone agrees. It is who has written down that the government said it.

Ceyhan has, which was always going to happen. The whip has, in a different column, for a different reason.`,
  choices:[
    { label:"Leave it where it is. It was said and it stands.",
      effects:[{flag:"position_public"},{move:{"loyalty.cu_maintenance":4}},
               {move:{"rel.ceyhan":5}}],
      result:"Nothing more is said. The sentence stays on the record, which is what a position is." },
    { label:"Repeat it, and make the government's case for it.",
      effects:[{flag:"position_public"},{flag:"position_campaigned"},
               {move:{public_standing:5}},{move:{"loyalty.cu_maintenance":-8}},
               {move:{"loyalty.psa":6}},
               {wire:"PM CAMPAIGNS ON THRESHOLD POSITION; MAINTENANCE BENCHES OBJECT"}],
      result:"The position becomes the government's, for good. That is a stronger thing to hold and a heavier one to put down." },
    { label:"Soften it. Say it was a preference, not a commitment.",
      when:{ flags:["position_offhand"] },
      effects:[{flag:"position_softened"},{move:{"rel.ceyhan":-8}},
               {move:{"loyalty.psa":-7}},{move:{"loyalty.cu_maintenance":5}}],
      result:"An answer at questions is easy to call a preference. It is also the second time the same audience has watched you do it." }
  ]},

/* ============================================================
   CHAPTER TWO, THE POOL (T4)

   The pool went dry by sitting 9 because twenty of twenty-four events were
   `once`. These are the other shape: a `when` that reads the live state and a
   `maxFires` that lets the same situation arrive twice, differently. Each uses
   only conditions whose number something already moves, so none is a cutscene
   and none breaks the consequence chain.

   ECONOMY OF THE CHAIN: this file may move the four scalars, the two prices,
   the station roll and one law key (divergence_threshold_hours) — the keys the
   chain audit watches — and no others. A new price or scalar here is a number
   nobody sees, and the build fails on it (tools/lint.js, 7.9).
   ============================================================ */

{ id:"thermal_drift", chapter:2, weight:66, maxFires:3,
  when:{ priceAbove:{thermal:106} },
  title:"The quota has found a new number",
  speaker:"ceyhan",
  body:`The thermal exchange has closed above last month's average for the
third week running. It is not a fault and it is not yet a crisis.

Ceyhan reads the market rather than the fault. A quota that is scarce in an
ordinary month is a quota that will be very scarce in a bad one, and the
quarterlies will be asking why nothing was done while there was still time.`,
  choices:[
    { label:"Sell quota out of the reserve and hold the price down.",
      effects:[{ move:{ "price.thermal":-8 } }, { move:{ "treasury":6 } },
               { move:{ "loyalty.hul":4 } },
               { wire:"QUOTA SOLD FROM RESERVE; THERMAL PRICE EASES" }],
      result:"The price eases and the reserve is thinner the next time something actually fails." },
    { label:"Let the price stand and say why.",
      effects:[{ move:{ "price.thermal":4 } }, { move:{ "public_standing":-3 } },
               { move:{ "loyalty.hul":7 } },
               { wire:"PM DEFENDS THERMAL PRICE AS THE COST OF SCARCITY" }],
      result:"The engineers hear a government that understands a market. The stations paying the price hear something else." },
    { label:"Announce a review of the exchange's pricing.",
      effects:[{ move:{ "price.thermal":-2 } }, { move:{ "public_standing":3 } },
               { flag:"reviewing_exchange" },
               { wire:"REVIEW ANNOUNCED INTO THERMAL EXCHANGE PRICING" }],
      result:"A review is a way of doing nothing and being seen to do it, which is sometimes the whole of the job." }
  ]},

{ id:"substrate_drift", chapter:2, weight:64, maxFires:3,
  when:{ priceAbove:{substrate:104} },
  title:"The index again",
  speaker:null,
  body:`The substrate index has been above a hundred and four for a fortnight.
That is not the figure that suspends anybody. It is the figure the quarterlies
record, and the quarterlies are read by the benches that answer for the
suspensions when they come.`,
  choices:[
    { label:"Buy substrate forward against the next quarter.",
      effects:[{ move:{ "price.substrate":-7 } }, { move:{ "treasury":-8 } },
               { wire:"FORWARD SUBSTRATE PURCHASE TO HOLD THE INDEX" }],
      result:"The index comes down and the money is committed a quarter before it is needed." },
    { label:"Say the index is a market and leave it alone.",
      effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.cl":5 } },
               { wire:"PM: SUBSTRATE INDEX 'NOT A POLICY INSTRUMENT'" }],
      result:"It is the answer the Liberal benches wanted, and the low band will remember the answer at the election." }
  ]},

{ id:"margin_thin", chapter:2, weight:72, maxFires:2,
  when:{ scalarBelow:{ thermal_margin:8 } },
  title:"Below ten",
  speaker:"vellan",
  body:`The margin between what the stations reject and what they generate is
under ten points. Nothing has failed. The margin is the room in which nothing
failing is possible, and it is thinner than the department will certify as safe
for a full session.

The Minister for Life Support does not ask for a decision. She asks for a
number: how thin the government is willing to let it get.`,
  choices:[
    { label:"Buy margin now, whatever it costs.",
      effects:[{ move:{ "thermal_margin":8 } }, { move:{ "treasury":-10 } },
               { move:{ "loyalty.hul":6 } },
               { wire:"EMERGENCY THERMAL PURCHASE TO WIDEN THE MARGIN" }],
      result:"The margin widens and the reserve pays for it, which is the trade every time." },
    { label:"Hold it and let the department record its warning.",
      effects:[{ move:{ "thermal_margin":-2 } }, { move:{ "public_standing":-4 } },
               { move:{ "loyalty.hul":-8 } },
               { wire:"PM DECLINES THERMAL PURCHASE; DEPARTMENT WITHDRAWS CERTIFICATION" }],
      result:"The warning is on the record now, and so is the decision that ignored it." }
  ]},

{ id:"order_paper_empty", chapter:2, weight:58, maxFires:2,
  when:{ slotsLeft:0 },
  title:"The session has no time left",
  speaker:"okarie",
  body:`Every slot the session holds has been given away. There is nothing
discretionary left in the order paper, and a measure that wants a stage now
waits for the House to rise and the slots to refill.

"From here," the Chief Whip says, "everything is a division or a promise."`,
  choices:[
    { label:"Spend what is left on the whips.",
      effects:[{ move:{ "loyalty.cu":4 } }, { move:{ "public_standing":-2 } }],
      result:"What cannot be advanced can still be argued, and an argument is cheaper than a vote." },
    { label:"Stop spending and let the House do what it will.",
      effects:[{ move:{ "party_loyalty":-3 } }, { move:{ "public_standing":3 } }],
      result:"A quiet order paper is not a quiet government, and both benches know it." }
  ]},

{ id:"the_vacant_post", chapter:2, weight:68, once:true,
  when:{ postVacant:["treasury"] },
  title:"The empty brief",
  speaker:"whitlam",
  body:`The Treasury has a department, a permanent staff and a set of questions
being answered in a minister's absence. The absence has lasted long enough to
stop being an accident.

The Leader of the House states the rule rather than the politics. A post with no
holder makes no instrument, so a budget whose Treasury is unheld is a budget
argued by officials and signed by nobody.`,
  choices:[
    { label:"Fill it. Put a Treasurer in the brief today.",
      effects:[{ cabinet:{ treasury:{ holder:"skye", party:"cu" } } },
               { move:{ "public_standing":3 } },
               { wire:"TREASURY BRIEF FILLED" }],
      result:"The brief has a holder, which means it has a face for the questions and a name on the orders." },
    { label:"Leave it empty. The work is being done.",
      effects:[{ flag:"treasury_left_vacant" }, { move:{ "public_standing":-5 } }],
      result:"No order comes out of that brief until somebody holds it, and the opposition has read the same rules you have." }
  ]},

{ id:"signatures_build", chapter:2, weight:74, once:true,
  when:{ signaturesAtLeast:6 },
  title:"The names on the paper",
  speaker:"ceyhan",
  body:`Six members have put their names to a letter that does not say what it
is for. Six is not a ballot. It is the number that tells the whips a ballot is
possible, and the number is in the lobby the same afternoon.

Ceyhan asks the only question that matters: whether the government means to find
out what the six want, or how many the six can become.`,
  choices:[
    { label:"Meet them. Ask what the letter is really about.",
      effects:[{ move:{ "loyalty.cu_maintenance":7 } }, { move:{ "loyalty.cu_halloran":4 } },
               { move:{ "public_standing":-3 } },
               { wire:"PM MEETS SIGNATORIES OF BACKBENCH LETTER" }],
      result:"Half of them wanted to be asked, and that is the half that stops signing." },
    { label:"Warn them where this ends.",
      effects:[{ move:{ "loyalty.cu_loyalists":6 } }, { move:{ "loyalty.cu_maintenance":-8 } },
               { wire:"PM WARNS THE BACKBENCH OVER LEADERSHIP LETTER" }],
      result:"The loyalists close ranks. So do the six, and one of them is now certain." }
  ]},

{ id:"a_partner_in_debt", chapter:2, weight:70, once:true,
  when:{ capitalBelow:{ rv:-2 } },
  title:"The ledger, read aloud",
  speaker:"park",
  body:`The Congregational Democratic Alliance's account with the government is
negative, and it has been negative since the coalition formed. The party has
supported three measures it did not write and holds no brief that pays for a
fourth.

"You are a partner who is owed," Park says, "not a partner who is owed to. The
difference is the next bill."`,
  choices:[
    { label:"Give her party's bill the next slot on the order paper.",
      effects:[{ move:{ "capital.rv":3 } }, { move:{ "loyalty.rv":9 } },
               { move:{ "public_standing":-2 } }],
      result:"The ledger moves toward zero and a slot of the session is gone. Both of those facts are the transaction." },
    { label:"Tell her the account is the account.",
      effects:[{ move:{ "capital.rv":-1 } }, { move:{ "loyalty.rv":-8 } },
               { move:{ "party_loyalty":4 } }],
      result:"Your own benches like it. Hers begin counting what they are owed, which is what a ledger is for." }
  ]},

{ id:"the_licensing_reaction", chapter:2, weight:82, once:true,
  when:{ siInForce:["si_2287_44"] },
  title:"What the order did to the panel",
  speaker:"gb_chair",
  body:`The panel has met and the sector has an answer to the licensing order.
Widening the licence added electors to a constituency the panel used to decide,
so the panel does not decide it any more.

"I have certified life support for forty years," the chair says. "The order is
lawful. The minister had the power and used it. The members I represent will
remember which government did."`,
  choices:[
    { label:"Offer the panel the standards brief as compensation.",
      effects:[{ move:{ "rel.gb_chair":10 } }, { move:{ "loyalty.gb":6 } },
               { move:{ "public_standing":-3 } },
               { wire:"STANDARDS BRIEF OFFERED TO THE LICENSING PANEL" }],
      result:"It is real work and a real brief, and it does not give the panel its electorate back." },
    { label:"Tell her the order stands.",
      effects:[{ move:{ "rel.gb_chair":-8 } }, { move:{ "loyalty.hul":4 } }],
      result:"She expected nothing else, which is why she came in person." }
  ]},

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
    { label:"Meet them and read the figure into the record.",
      effects:[{ move:{ "public_standing":6 } }, { move:{ "loyalty.cu_maintenance":7 } },
               { move:{ "loyalty.psa":6 } }, { flag:"read_the_figure" },
               { wire:"FEDERAL SUSPENSION FIGURE READ INTO THE RECORD" }],
      result:"The number is in the record now, and a number in the record is quoted for years." },
    { label:"Receive them, and say nothing on the record.",
      effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.cu_maintenance":-6 } }],
      result:"They are heard and not answered, which from their side of the desk is worse than a refusal." }
  ]}

];
