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

/* THE SANDBOX CONTROLS (T26). ONE list, read by TWO surfaces: the Sandbox tab
   in js/ui.js and the queued test_console event below. Content owns the
   effects; the tab and the event are only two ways to press them. `close`
   marks the control that must not re-open the event menu, and the tab skips
   it. Every entry is an ordinary effects block using the existing verbs. */
const SANDBOX = [
  { id:"station_question", label:"Raise the station question",
    note:"Sets station_issue and starts the survey chain.",
    result:"The foreign panel opens and the survey chain is queued. The Works stays outside the roster.",
    effects:[{ flag:"station_issue" }, { flag:"f1_surveyed" },
             { queue:[{ event:"f1_referendum", after:2, label:"The survey reports" }] },
             { wire:"SANDBOX: THE STATION QUESTION IS RAISED" }] },
  { id:"annex", label:"Annex the Works outright",
    note:"Sets station_issue, annexed_almanac_works and f1_annexing, and sets the annexation bill down.",
    result:"The Works is inside the Commonwealth and the annexation bill is set down with its crisis time.",
    effects:[{ flag:"station_issue" }, { flag:"annexed_almanac_works" }, { flag:"f1_annexing" },
             { bill:{ annexation:{ stage:"first_reading" } } }, { slots:{ total:5 } },
             { wire:"SANDBOX: THE WORKS IS ANNEXED" }] },
  { id:"carry_threshold", label:"Carry the threshold bill (forty hours)",
    note:"Assents the divergence bill and sets the threshold low.",
    result:"The reform is assented at forty hours; the neutrality settlement can land once the floor allows.",
    effects:[{ law:{ divergence_threshold_hours:40 } },
             { bill:{ divergence:{ stage:"assented", dead:false } } },
             { wire:"SANDBOX: THE THRESHOLD BILL IS CARRIED" }] },
  { id:"defeat_threshold", label:"Defeat the threshold bill",
    note:"Defeats the divergence bill and leaves the threshold high.",
    result:"The restriction settlement can land once the floor allows.",
    effects:[{ law:{ divergence_threshold_hours:168 } },
             { bill:{ divergence:{ stage:"defeated", dead:true } } },
             { wire:"SANDBOX: THE THRESHOLD BILL IS DEFEATED" }] },
  { id:"tribunal", label:"Open the tribunal",
    note:"Sets tribunal_established.",
    result:"The graduated-personhood ending is in reach, and the restriction settlement is now blocked.",
    effects:[{ flag:"tribunal_established" }, { wire:"SANDBOX: THE TRIBUNAL IS ESTABLISHED" }] },
  { id:"federal", label:"Impose the federal schedule",
    note:"Sets federal_schedule.",
    result:"The federal settlement is in reach.",
    effects:[{ flag:"federal_schedule" }, { wire:"SANDBOX: THE FEDERAL SCHEDULE IS IMPOSED" }] },
  { id:"licensing_order", label:"Make the licensing order",
    note:"Makes SI 2287/44 in force and offers the carve-out flag.",
    result:"The order is in force, which opens its reaction and the challenge at the tribunal.",
    effects:[{ si:"si_2287_44" }, { flag:"licensure_carveout_offered" },
             { wire:"SANDBOX: THE LICENSING ORDER IS IN FORCE" }] },
  { id:"friction", label:"Push friction toward a sanction",
    note:"Raises friction and drops legitimacy.",
    result:"The couplings begin to bite and the freeze event comes into reach.",
    effects:[{ move:{ friction:40 } }, { move:{ legitimacy:-10 } },
             { wire:"SANDBOX: FRICTION IS PUSHED UP" }] },
  { id:"drain", label:"Drain the reserve",
    note:"Drops solvency under thirty thousand.",
    result:"Solvency is under thirty thousand, so the emergency loan and the low-reserve events are in reach.",
    effects:[{ move:{ solvency:-970000 } }, { wire:"SANDBOX: THE RESERVE IS DRAINED" }] },
  { id:"paper", label:"Open Czarnecki's paper",
    note:"Opens the paper and fills the signatures.",
    result:"The paper is open with the signatures already counted, so the ballot and its prose are in reach.",
    effects:[{ flag:"paper_opened" }, { move:{ "loyalty.cu_halloran":-40 } }, { signatures:12 },
             { wire:"SANDBOX: THE PAPER IS OPEN" }] },
  { id:"collapse", label:"Force the government's collapse",
    note:"Zeroes party loyalty so the next loss check ends the run.",
    result:"Party loyalty is at the floor, so the next loss check ends the run. Useful for reading the fall.",
    effects:[{ move:{ party_loyalty:-80 } }, { wire:"SANDBOX: THE PARTY'S LOYALTY IS ZEROED" }] },
  { id:"close", label:"Close the console", close:true,
    note:"Closes the event menu; the Sandbox tab stays.",
    result:"The controls are put away and the pool takes the sitting back.",
    effects:[] }
];

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
      note:"You put your weight behind competence. The engineers and the Guild hear " +
           "a government that will be administered. The maintenance benches hear " +
           "the accusation they have lived with for thirty years.",
      effects:[{flag:"led_on_competence"},
               {move:{public_standing:5}},
               {move:{"loyalty.cu_maintenance":-6}},
               {move:{"rel.gb_chair":6}},
               {wire:"NEW PM PITCHES COMPETENCE; SAYS GOVERNMENT WILL BE 'RUN, NOT ARGUED WITH'"}],
      result:"He writes it down without expression. The engineers will like it. Thirty-one of your own members have spent their careers being told they are the problem, and have just been told again." },

    { label:"Because I am what this party has always been",
      act:"Say it",
      note:"You claim the movement's inheritance. It is the line the maintenance bloc " +
           "will carry into every meeting for a year, and the line your partners will " +
           "ask you to clarify before the week is out.",
      effects:[{flag:"led_on_continuity"},
               {move:{"loyalty.cu_maintenance":11}},
               {move:{"loyalty.cu_loyalists":4}},
               {move:{public_standing:-4}},
               {move:{"loyalty.psa":-5}},
               {wire:"PM CLAIMS THE MOVEMENT'S INHERITANCE; PARTNERS SEEK CLARIFICATION"}],
      result:"The maintenance bloc will carry that sentence into every meeting for a year. So will the New Progressive Party, in a different tone, and the bill you inherited is about wages whichever way you look at it." },

    { label:"Because the party had to change and I changed it",
      act:"Say it",
      note:"You claim the break. It is the answer the country wants, and it is the " +
           "answer your own benches will quote back at you the first time you need " +
           "them to hold a line.",
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
      note:"Reading costs nothing and commits you to nothing. It tells you where the " +
           "measure dies before you have said a word about it in public.",
      effects:[{flag:"read_the_count"},],
      result:"It carries among elected members and dies among the functional ones. You will need to know why." },
    { label:"Say publicly that the government stands behind it",
      act:"Say it",
      cost:{ slot:1 },
      note:"A public commitment spends order-paper time and your standing with the " +
           "maintenance benches to buy the Substrate Left. There is no quiet way to " +
           "take it back.",
      effects:[{flag:"read_the_count"},{move:{"public_standing":3}},
               {move:{"loyalty.psa":8}},{move:{"loyalty.cu_maintenance":-9}},
               {wire:"PM COMMITS GOVERNMENT TO FORTY-HOUR THRESHOLD"}],
      result:"The Substrate Left is delighted. Thirty-one of your own members were not consulted." }
  ]},

{ id:"gb_approach", prologue:7, once:true,
  /* THE CHAPTER ADVANCE MUST NOT HINGE ON MUTABLE BILL STATE. This was
     gated `billStage:{divergence:"committee"}`, and the obvious first move
     — granting the divergence bill a slot — moved it out of committee, so
     this beat could never fire again, chapter two never opened, and the
     rest of the campaign was unplayable for the player who actually
     governed. A prologue is an authored sequence (design/21 §3): the gate
     is the flag the sequence itself sets, nothing the world can falsify. */
  when:{ flagsAbsent:["gb_approached"] },
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
      note:"The threshold moves and licensure does not, which is the one thing the " +
           "panel actually asked for. It buys the chair's goodwill and the Substrate " +
           "Left's fury, and it puts a promise on the order paper with a date.",
      /* MECHANICAL PLACEHOLDER, opencode's to reword: the undertaking's
         `text` is the line the order paper carries and the wording is
         prose. The shape is right — this choice is a promise made to a
         named person who will notice — but the sentence is engineering. */
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":12}},{move:{"loyalty.gb":6}},{move:{"loyalty.psa":-9}},
               {undertake:{ id:"licensure_carveout",
                            text:"Lay the licensing order carrying the carve-out",
                            owed_to:"gb_chair", by:4,
                             discharge:{ si:"si_2287_44" },
                             onBreach:"gb_carveout_broken" }},
               {wire:"GOVERNMENT SIGNALS LICENSURE CARVE-OUT; SUBSTRATE LEFT FURIOUS"},
               {flag:"licensure_carveout_offered"}],
      result:"She does not say yes. She says she will take it to the panel, which from her is a great deal." },
    { label:"Remind her the sunset clause has been extended four times and will not be a fifth",
      note:"A threat made to the one person in the room who can count. It plays well " +
           "outside the panel and costs you the panel.",
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":-15}},{move:{"loyalty.gb":-8}},
               {move:{"public_standing":3}},{flag:"threatened_guild_bench"},
               {wire:"PM RAISES FUNCTIONAL SUNSET IN PRIVATE MEETING, SOURCES SAY"}],
      result:"\"Extend it a fifth time,\" she says, \"or don't. Either way I have the votes and you do not.\"" },
    { label:"Say nothing that can be repeated. Listen.",
      note:"You leave with no commitment and one fact worth having: the panel meets " +
           "on Thursday morning, four hours before the division.",
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
      note:"A promise made in a lobby with forty witnesses. It buys Halloran's bloc " +
           "and Halloran's loyalty, and it puts a bill second on the book that your " +
           "partners will vote against.",
      effects:[{move:{"loyalty.cu_halloran":22}},{move:{"loyalty.cu_maintenance":9}},{move:{"party_loyalty":7}},
               {flag:"halloran_confronted"},{flag:"shed_order_promised"},
               {bill:{shedorder:{stage:"second_reading"}}}],
      result:"He writes nothing down. He does not need to; you said it in a lobby with forty witnesses." },
    { label:"Offer her a junior ministry and the silence that comes with it",
      note:"An office buys the leader and not the group. The members who followed him " +
           "are left with a grievance and nobody to carry it into the chamber.",
      effects:[{move:{"loyalty.cu_halloran":14}},{move:{"party_loyalty":4}},{move:{"public_standing":-3}},
               {flag:"halloran_confronted"},{flag:"halloran_bought"},
               {wire:"CZARNECKI TIPPED FOR OFFICE; ASHFIELD DELEGATION SEEKS ASSURANCES"}],
      result:"He takes it. His group does not all follow him, and the ones who don't now have a grievance and no leader." },
    { label:"Refuse. He does not have the nine and you both know it.",
      note:"You keep the office and the money. He goes looking for the ninth name, and " +
           "the session gives him four weeks to find it.",
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
      note:"The margin recovers today. The quota comes out of your own constituency, " +
           "which is where your majority lives.",
      effects:[{move:{"thermal_margin":11}},{move:{"solvency": -9000}},{move:{"public_standing":-4}},
               {station:{vantage:{closure:0.03}}},{flag:"vantage_handled"},
               {wire:"ANSELM RING QUOTA DIVERTED TO VANTAGE HIGH; RING MEMBERS OBJECT"}],
      result:"Your own constituency pays for it, which your own constituency will notice." },
    { label:"Let the authority act under the Act and say so publicly",
      note:"The margin recovers by half and the Association of Engineers and Systems " +
           "stays with you. The Substrate Left and the maintenance benches hear a " +
           "government that will not use the power it holds.",
      effects:[{move:{"thermal_margin":5}},{move:{"public_standing":-11}},{move:{"loyalty.hul":8}},{move:{"loyalty.psa":-12}},{move:{"loyalty.cu_halloran":-9}},
               {flag:"vantage_handled"},{flag:"deferred_to_authority"},
               {wire:"GOVERNMENT DECLINES TO INTERVENE; ENGINEERING AUTHORITY TO EXERCISE S.12 POWERS"}],
      result:"You have conceded, in public, that the authority's word is final on the one question the charter left open." },
    { label:"Do nothing yet. The fault may clear.",
      note:"Waiting keeps your hands clean and your options open. It also leaves four " +
           "thousand two hundred people under a register the authority can shed " +
           "without telling you first.",
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
      note:"The Chief Whip explains the day once, and this is the hour he does it. It " +
           "costs you nothing and buys his confidence for the session.",
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":6 } }, { move:{ "loyalty.cu_loyalists":3 } }],
      result:"He names the mover of each item and what each mover wants back. It is the same list every sitting, and nobody explains it twice." },
    { label:"Read it alone and send him back to the lobbies.",
      note:"You keep the hour and you read your own brief. The whips note that you did " +
           "not ask, and the country hears that the paper is read before the lobbies " +
           "are worked.",
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":-4 } }, { move:{ "public_standing":2 } }],
      result:"You will read the sheet alone every sitting. He says nothing about it, which is how he says everything." }
  ]},

/* THE RULES OF THE HOUSE (the tutorial the author deferred until chapter one of
   the new story). The opening teaches the SITTING — the paper, the slots, the
   whip, the approach — and never once says what a division is or why the
   functional forty matter, which is the one thing a player cannot infer from
   the interface, because it is the thing the interface is about. The Chief Whip
   explains his own chamber, in the register he would use for a leader who has
   never sat on the benches, having run the whips for years and watched prime
   ministers lose votes they were entitled to win. */
/* REACH: was cut off: gb_approach (P7, ch1) advances to chapter 2, so a P8 chapter-1 event could never fire. Retagged chapter:2 prologue:1 so it opens chapter two as the brief intends. */
{ id:"the_rules_of_the_house", chapter:2, prologue:1, once:true,
  when:{ flagsAbsent:["taught_the_house"] },
  title:"The three ways a government loses a vote",
  speaker:"okarie",
  body:`He does not sit down. He has been running whips since before you were first
returned and he has come to explain his own chamber, which means he has decided
you do not know it.

"Three ways a measure fails, and they are not the same way twice. First, the
House. Two hundred and forty elected members and a hundred and twenty-one is a
majority. Nothing else matters to that number. Not the partners, not the polls,
not the argument. Count.

"Second, the bench. Forty members sit for trades and professions and not for
places, and a measure that touches what they do has to carry among them as well.
That is the dual test. Their benches are smaller than some parties and they are
the reason a bill can win the chamber and die on the same afternoon.

"Third, the objection. A bench that owns the subject of a bill can refuse it.
Not defeat it. Refuse it. That is why the bill you inherited dies among the
professions and carries among the counties, and why I have been telling you
about the licensing boards since Tuesday.

"Everything else in this building is arithmetic and who owes whom."`,
  choices:[
    { label:"Ask him which of the three is the problem for the bill you inherited.",
      note:"The Chief Whip has run the benches for years and has watched " +
           "prime ministers lose votes they were entitled to win. Asking him " +
           "which test will kill the threshold bill costs nothing and is the " +
           "one answer the interface cannot give you.",
      effects:[{ flag:"taught_the_house" }, { move:{ "rel.okarie":5 } },
               { move:{ "loyalty.cu_loyalists":2 } },
               { flag:"knows_the_tests" }],
      result:"\"The second and the third,\" he says. \"You can carry the country on Tuesday and lose the bench on Thursday, and the bench is where it will happen.\"" },
    { label:"Thank him. You have read the standing orders.",
      note:"You keep the hour and he keeps his opinion, which is how the " +
           "whips' office works and always has.",
      effects:[{ flag:"taught_the_house" }, { move:{ "rel.okarie":-3 } },
               { move:{ "public_standing":1 } }],
      result:"He accepts it the way he accepts everything, which is to say he goes back to the lobbies and works the benches himself." }
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
      note:"The whips hold the benches already with the government and spend none of " +
           "the party's patience. The decision stays where it is, and there is still " +
           "goodwill in hand for a harder day.",
      effects:[{ flag:"whip_briefed" }, { move:{ "loyalty.cu":5 } }, { move:{ "public_standing":-2 } }],
      result:"The whips will hold the benches they have and wait. It is the cheaper order, and it leaves the decision where it was." },
    { label:"Whip the party hard and take the measure now.",
      note:"Whipping your own side spends its goodwill to buy the measure today. " +
           "Members who were asked twice remember the asking.",
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
      effects:[{move:{"loyalty.fh":5}},{move:{"loyalty.hul":3}},{move:{"solvency": -6000}},
               {flag:"lobbied_functional"}],
      result:"Two members of the Freehold Party will consider it. Two is not nine." },
    { label:"Let it fall and be seen to have tried",
      effects:[{move:{"public_standing":4}},{move:{"loyalty.psa":-10}},
               {flag:"let_it_fall"},
               {wire:"GOVERNMENT SIGNALS IT WILL NOT DELAY THE THRESHOLD DIVISION"}],
      result:"The Substrate Left understands exactly what you have decided." }
  ]},

/* REACH: gb_approach's licensure carve-out choice sets licensure_carveout_offered. */
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

/* REACH: queued by ch2_carveout_price's 'take it' choice. */
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

{ id:"substrate_price_bite", chapter:2, weight:88, once:true,
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
      effects:[{move:{"price.substrate":-16}},{move:{"solvency": -14000}},{move:{"public_standing":5}},
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
      effects:[{move:{"price.substrate":-12}},{move:{"solvency": -16000}},{move:{"public_standing":7}},
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
      effects:[{move:{"price.thermal":-14}},{move:{"solvency": -18000}},{move:{"loyalty.hul":6}},
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

/* REACH: party_loyalty below 22; whipping and defeats drive it down. */
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
  when:{ scalarBelow:{solvency:14000}, flagsAbsent:["reserve_low_seen"] },
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
      effects:[{move:{"solvency": 16000}},{move:{"price.substrate":6}},{move:{"loyalty.cl":-10}},
               {move:{"loyalty.cu_maintenance":-5}},{flag:"reserve_low_seen"},{flag:"raised_tariff"},
               {wire:"TETHER TARIFF RAISED TO REFILL RESERVE; SHIPPERS OBJECT"}],
      result:"The reserve fills. The substrate price rises with it, and the low band pays the difference in a currency the Treasury does not measure." },
    { label:"Defer the maintenance appropriation. It is not due this session.",
      effects:[{move:{"solvency": 10000}},{move:{"thermal_margin":-9}},{move:{"loyalty.hul":-11}},
               {flag:"reserve_low_seen"},{flag:"deferred_maintenance"},
               {wire:"MAINTENANCE APPROPRIATION DEFERRED TO NEXT SESSION"}],
      result:"Nothing fails this session. Things that fail next session were being maintained this one." },
    { label:"Spend what is left and let the next government find the rest.",
      effects:[{move:{"public_standing":5}},{move:{"loyalty.cu_maintenance":7}},
               {flag:"reserve_low_seen"},{flag:"spent_the_reserve"},
               {wire:"PM COMMITS RESERVE TO CURRENT PROGRAMME"}],
      result:"It is not dishonest. It is a bet that the bill comes due to somebody else." }
  ]},

/* REACH: public_standing below 26; the drift and hard choices drive it down. */
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
      effects:[{move:{"public_standing":12}},{move:{"solvency": -10000}},{move:{"loyalty.psa":5}},
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

/* REACH: taking the carve-out sets divergence_threshold_hours to 40. */
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
      effects:[{move:{"solvency": -14000}},{move:{"public_standing":8}},{move:{"loyalty.psa":9}},
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
/* REACH: twelve signatures in the whip panel, then a ballot the engine holds and the PM survives. */
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
/* REACH: the engine sets minister_resigned when an undertaking naming a post breaks. */
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

/* REACH: queued by the approach_guild initiative. */
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

/* REACH: queued by the commission_review initiative. */
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

/* REACH: queued by the state_the_position initiative. */
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
    { label:"Sell quota out of the reserve and hold the price down.",
      effects:[{ move:{ "price.thermal":-8 } }, { move:{ "solvency": 6000 } },
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
    { label:"Buy substrate forward against the next quarter.",
      effects:[{ move:{ "price.substrate":-7 } }, { move:{ "solvency": -8000 } },
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
      effects:[{ move:{ "thermal_margin":8 } }, { move:{ "solvency": -10000 } },
               { move:{ "loyalty.hul":6 } },
               { wire:"EMERGENCY THERMAL PURCHASE TO WIDEN THE MARGIN" }],
      result:"The margin widens and the reserve pays for it, which is the trade every time." },
    { label:"Hold it and let the department record its warning.",
      effects:[{ move:{ "thermal_margin":-2 } }, { move:{ "public_standing":-4 } },
               { move:{ "loyalty.hul":-8 } },
               { wire:"PM DECLINES THERMAL PURCHASE; DEPARTMENT WITHDRAWS CERTIFICATION" }],
      result:"The warning is on the record now, and so is the decision that ignored it." }
  ]},

/* REACH: slotsLeft:0 reads 'at least zero left', so this is always eligible in ch2; it loses on weight, not on eligibility. */
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

/* REACH: treasury is vacant at the opening; fires once the appointment control is left alone. */
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
      effects:[{ cabinet:{ solvency:{ holder:"skye", party:"cu" } } },
               { move:{ "public_standing":3 } },
               { wire:"TREASURY BRIEF FILLED" }],
      result:"The brief has a holder, which means it has a face for the questions and a name on the orders." },
    { label:"Leave it empty. The work is being done.",
      effects:[{ flag:"treasury_left_vacant" }, { move:{ "public_standing":-5 } }],
      result:"No order comes out of that brief until somebody holds it, and the opposition has read the same rules you have." }
  ]},

/* REACH: six signatures on Czarnecki's paper (the_paper's open choice). */
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

/* REACH: SI 2287/44 in force; the carve-out undertaking discharges it. */
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
    { label:"Meet them and read the figure into the record.",
      effects:[{ move:{ "public_standing":6 } }, { move:{ "loyalty.cu_maintenance":7 } },
               { move:{ "loyalty.psa":6 } }, { flag:"read_the_figure" },
               { wire:"FEDERAL SUSPENSION FIGURE READ INTO THE RECORD" }],
      result:"The number is in the record now, and a number in the record is quoted for years." },
    { label:"Receive them, and say nothing on the record.",
      effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.cu_maintenance":-6 } }],
      result:"They are heard and not answered, which from their side of the desk is worse than a refusal." }
  ]},

/* THE TWO FLAG-ENDINGS' ROUTES (T6). Half the settlements hung on flags no
   content set, so half the endings were unreachable. Each is an offer made
   when the national argument is stalled or the government is under
   pressure, and each decision is real: the tribunal and the schedule are
   ways out that cost the government what it was holding onto. Taking one
   settles the question, which ends the run the way every settlement does. */

{ id:"the_tribunal", chapter:2, weight:74, once:true,
  when:{ billStage:{ divergence:"committee" },
         flagsAbsent:["tribunal_established","federal_schedule","tribunal_refused"] },
  title:"The third way",
  speaker:"fenwick",
  body:`The Minister for Law and the Charter comes with a suggestion that
is not her own, which she is careful to say. The President's office has
asked, privately, whether the government would consider taking the
threshold out of the House altogether.

A tribunal. Not forty hours, not a hundred and sixty-eight. A panel that
decides, case by case, what a person is, and publishes no schedule at all.
She sets the shape of it on the desk.

"The House can fight this bill for a year," she says. "Or the question can
be settled in rooms, one case at a time, forever."`,
  choices:[
    { label:"Establish the tribunal.",
      effects:[{ flag:"tribunal_established" },
               { move:{ "public_standing":-6 } }, { move:{ "loyalty.psa":-12 } },
               { move:{ "loyalty.gb":5 } },
               { wire:"TRIBUNAL ESTABLISHED ON THE DIVERGENCE QUESTION" }],
      result:"The question is administrative now. The partner that made the bill will not forgive the government that set it aside." },
    { label:"Leave the question to the House.",
      effects:[{ flag:"tribunal_refused" }, { move:{ "loyalty.cu_maintenance":5 } },
               { move:{ "public_standing":2 } }],
      result:"The suggestion is declined. It is declined in writing, which is the only way to decline the President's office." }
  ]},

  /* REACH: three signatures; reachable once the paper is opened. */
  { id:"the_federal_option", chapter:2, weight:72, once:true,
  when:{ signaturesAtLeast:3,
         flagsAbsent:["tribunal_established","federal_schedule","federal_refused"] },
  title:"Thirty-four thresholds",
  speaker:"laughon",
  body:`The Leader of Home Rule asks for the meeting and does not waste it.
The government is being asked to answer the threshold question, and every
answer it can give has a price attached. He is here to offer the one with
no price in the chamber.

"A schedule for each station," he says. "Let Anselm Ring set its own line
and Homestead set its own, and let the Commonwealth say only that it is not
the Commonwealth's business. The union survives by not asking the question
nationally. That is all my party has ever asked for, and the price is paid
by nobody in this room."`,
  choices:[
    { label:"Take the schedule. Let every station answer for itself.",
      effects:[{ flag:"federal_schedule" },
               { move:{ "loyalty.sc":8 } }, { move:{ "loyalty.cu_maintenance":-6 } },
               { move:{ "public_standing":-4 } },
               { wire:"FEDERAL SCHEDULE: EACH STATION TO SET ITS OWN THRESHOLD" }],
      result:"There is no national question any more. The maintenance benches know exactly what was traded and exactly who was not asked." },
    { label:"Refuse. One Commonwealth, one law.",
      effects:[{ flag:"federal_refused" }, { move:{ "loyalty.sc":-8 } },
               { move:{ "public_standing":3 } }],
      result:"Home Rule heard the answer it expected. It will ask again in the next parliament, whichever government is in it." }
  ]},

/* PEOPLE, AND THE PRESS (T9). Fifty-four characters existed and ten had
   ever spoken. These four give the opposition front bench, the coalition
   deputy, the engineers' leader and One-G a voice, and each reads a
   condition the pool had never used. */

/* REACH: public_standing below 40. */
{ id:"the_opposition_asks", chapter:2, weight:60, maxFires:2,
  when:{ scalarBelow:{ public_standing:40 } },
  title:"The Leader of the Opposition asks",
  speaker:"watkins",
  body:`Watkins rises at questions and for once does not perform. He asks
whether the government intends to govern, or intends to be carried through
the session by the arithmetic of the coalition.

It is not a question. It is a statement of the position the opposition
intends to take until the number improves, and the benches behind him
know it and stay seated.`,
  choices:[
    { label:"Answer him yourself, on your feet.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "loyalty.cl":-4 } },
               { wire:"PM ANSWERS OPPOSITION LEADER DIRECTLY AT QUESTIONS" }],
      result:"You answer on your feet, which is the one place an answer cannot be taken back." },
    { label:"Let the Chief Whip take it.",
      effects:[{ move:{ "loyalty.cu":3 } }, { move:{ "public_standing":-2 } }],
      result:"The whip's answer is shorter and duller, which was the point of giving it to him." }
  ]},

{ id:"the_deputy_warns", chapter:2, weight:69, once:true,
  when:{ loyaltyBelow:{ psa:38 } },
  title:"A word from the Deputy",
  speaker:"trottier",
  body:`The Deputy Prime Minister does not bring a complaint. She brings a
count, and the count says her party's benches have stopped believing the
government will ever pay the price they joined it for.

"We have carried the government," she says. "Ask the conference what we
have been carried in return."`,
  choices:[
    { label:"Promise her party the next slot on the order paper.",
      effects:[{ move:{ "capital.psa":2 } }, { move:{ "loyalty.psa":8 } },
               { move:{ "public_standing":-2 } }],
      result:"The promise is made and written down, which is the only form of it that counts." },
    { label:"Tell her the coalition is not for sale.",
      effects:[{ move:{ "loyalty.psa":-6 } }, { move:{ "party_loyalty":3 } }],
      result:"It was the answer her conference predicted, and the count on her benches will show it." }
  ]},

/* REACH: thermal price above 104. */
{ id:"the_engineers_write", chapter:2, weight:61, maxFires:2,
  when:{ priceAbove:{ thermal:104 } },
  title:"The engineers write",
  speaker:"wilde_hayward",
  body:`The Association of Engineers and Systems publishes an open letter on
the quota price, signed by eleven hundred licensed members. It says the
price is the symptom and the government is treating the symptom, and that
the fault was certified repairable in April.

Wilde-Hayward will be asked about the letter in the lobbies all day, and
he has already decided what he will say.`,
  choices:[
    { label:"Meet the signatories and hear the complaint whole.",
      effects:[{ move:{ "loyalty.hul":6 } }, { move:{ "public_standing":-2 } }],
      result:"The meeting runs long and the complaint is heard. Eleven hundred engineers were told the government would think again." },
    { label:"Publish the government's own reply.",
      effects:[{ move:{ "loyalty.hul":-4 } }, { move:{ "public_standing":2 } },
               { wire:"GOVERNMENT REPLIES TO ENGINEERS' LETTER ON THE QUOTA PRICE" }],
      result:"A letter answered in public is a letter that stops being theirs." }
  ]},

  /* REACH: des loyalty above 15; it starts there. */
  { id:"one_g_waiting", chapter:2, weight:59, once:true,
  when:{ loyaltyAbove:{ des:15 } },
  title:"The waiting list",
  speaker:"edelstein_powell",
  body:`The Leader of One-G speaks for the people the party exists for, and
she brings their number with her: eleven thousand residents waiting for
embodiment fitting, and the list growing by four hundred a month.

"Every one of them would vote for the party that shortened the list," she
says, "and every one of them knows it is the most expensive line in the
budget."`,
  choices:[
    { label:"Promise the list a line in the next estimates.",
      effects:[{ move:{ "loyalty.des":7 } }, { move:{ "public_standing":3 } },
               { move:{ "solvency": -3000 } }],
      result:"The promise costs three now and is remembered when the estimates are drawn." },
    { label:"Say the list is not this session's business.",
      effects:[{ move:{ "loyalty.des":-6 } }, { move:{ "loyalty.hul":3 } }],
      result:"One-G heard the answer it is used to hearing. The waiting list is used to it too." }
  ]},

/* ============================================================
   CHAPTERS THREE AND FOUR (T4, second half)

   The triggers now exist: `dissolved` is set when the parliament ends
   and `settled` reads the settlement flag the engine leaves. These are
   the thin, correct placeholders the brief asked for: one event fires,
   advances the chapter, and says the plainest true thing. A run ends at
   the dissolution, so chapter three has very little room and chapter
   four has whatever the settlement leaves.
   ============================================================ */

/* the campaign: parliament is dissolved, the country is asked */
{ id:"ch3_dissolution", chapter:2, weight:96, once:true,
  when:{ dissolved:true },
  title:"The writs",
  speaker:null,
  body:`The proclamation is read and the House stands. The seats empty, the
clerks cover the benches, and the building does the only thing it knows how
to do: it hands the question to the country.

The campaign is one session long by law, and the Commonwealth is now in it.
Every member goes home to their station and their roll, and the government
goes home to the record of what it did, which is what the electorate is
about to be asked about.`,
  choices:[
    { label:"To the country.",
      effects:[{ chapter:3 }],
      result:"The writs are out. The campaign begins." }
  ]},

{ id:"ch3_the_campaign", chapter:3, prologue:1, once:true,
  title:"The campaign",
  speaker:"ceyhan",
  body:`Thirty-four stations, one question each, and the same argument
everywhere. The Spindle runs the numbers on its front page, and the numbers
say the country is deciding between the record and the promise, which is
every election.

Ceyhan's column is short, and it ends where it always ends: that the
campaign is one session long and a government that has used all of it has
already made its case.`,
  choices:[
    { label:"Campaign on the record.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "loyalty.cu_maintenance":4 } }],
      result:"The record is what it is. You run on it because it is all a one-session government has." },
    { label:"Campaign on the promise of the next session.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "loyalty.psa":5 } }],
      result:"The promise is newer than the record, which is its only advantage and it uses all of it." }
  ]},

{ id:"ch3_open_question", chapter:3, prologue:2, once:true,
  title:"The question on the ballot",
  speaker:null,
  body:`The writs are out and the question the House could not close is now the
country's. Nothing was settled. That is what this election is about, whatever
the parties would rather it were about.

Every candidate is asked the same thing at every door, and every answer is a
position now, because a campaign is where a preference becomes a promise.`,
  choices:[
    { label:"Make the election about the question.",
      act:"Say it",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "loyalty.psa":5 } },
               { move:{ "loyalty.cu_maintenance":-4 } },
               { wire:"PM PUTS THE OPEN QUESTION AT THE CENTRE OF THE CAMPAIGN" }],
      result:"The country is asked to answer what the chamber would not, which is either courage or a gamble and will be judged as one of them." },
    { label:"Run on the record. Let the question wait.",
      effects:[{ move:{ "public_standing":2 } }, { move:{ "loyalty.cu_maintenance":4 } },
               { move:{ "loyalty.psa":-5 } },
               { wire:"PM CAMPAIGNS ON THE RECORD, NOT THE QUESTION" }],
      result:"The record is what the government did. The question is what it did not, and the other side will name it at every stop." }
  ]},

{ id:"ch3_manifestos", chapter:3, prologue:3, once:true,
  title:"The manifestos",
  speaker:"ceyhan",
  body:`Four documents, published within a day of each other, and none of them
says what it means. Ceyhan reads them the way he reads everything: for the
sentence that was left out.

"You cannot put a question on the ballot and keep the answer off the paper,"
he writes. "Somebody will notice, and it will not be you."`,
  choices:[
    { label:"Print the answer the government would give.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "loyalty.cu_maintenance":-3 } },
               { wire:"GOVERNMENT PRINTS ITS ANSWER TO THE OPEN QUESTION" }],
      result:"The paper has an answer on it, which is the hardest thing to take back and the easiest thing for the other side to quote." },
    { label:"Print the programme and leave the question open.",
      effects:[{ move:{ "party_loyalty":4 } }, { move:{ "public_standing":-3 } },
               { wire:"GOVERNMENT MANIFESTO AVOIDS THE QUESTION; BENCHES DIVIDED" }],
      result:"The benches are relieved and the columnists are not. A manifesto that does not answer the question is a promise to answer it later." }
  ]},

{ id:"ch3_the_wire", chapter:3, prologue:4, once:true,
  when:{ scalarAbove:{ friction:50 } },
  title:"What Earth is watching",
  speaker:"landry",
  body:`The campaign is being read abroad. Whatever the parties say about the
question at home, the Earth-side services carry a different story, and the
measures the session left standing are on the ballot whether anyone listed them.

"Every hour of this campaign is being priced somewhere," Landry says. "We can
campaign as though it is not, but it is."`,
  choices:[
    { label:"Answer the foreign story directly.",
      effects:[{ move:{ "friction":-3 } }, { move:{ "legitimacy":3 } },
               { wire:"PM ANSWERS THE FOREIGN READING OF THE CAMPAIGN" }],
      result:"The answer travels at the speed of the wire, which is faster than the campaign and slower than the truth." },
    { label:"Keep the campaign at home.",
      effects:[{ move:{ "friction":2 } }, { move:{ "public_standing":3 } },
               { wire:"PM KEEPS THE CAMPAIGN DOMESTIC; THE WIRE KEEPS SCORE" }],
      result:"The country hears a government that will not be lectured to. The exchange keeps its own tally." }
  ]},

{ id:"ch3_the_benches", chapter:3, prologue:5, once:true,
  when:{ scalarBelow:{ party_loyalty:40 } },
  title:"The benches on the trail",
  speaker:"okarie",
  body:`Half the parliamentary party is in the marginals and the other half has
found reasons to be elsewhere. The Chief Whip has counted both halves and does
not like the arithmetic of either.

"A campaign is a whip operation with worse hotels," Okarie says. "If they will
not knock on doors for you now, they will not vote for you after."`,
  choices:[
    { label:"Send the whole party out.",
      effects:[{ move:{ "party_loyalty":5 } }, { move:{ "public_standing":2 } },
               { move:{ "solvency":-3000 } },
               { wire:"GOVERNMENT PUTS THE WHOLE PARTY INTO THE CAMPAIGN" }],
      result:"Every member is on a train and every marginal has a minister in it. The bill for it arrives before the count." },
    { label:"Campaign from the centre and leave them to it.",
      effects:[{ move:{ "loyalty.cu_loyalists":3 } }, { move:{ "party_loyalty":-3 } },
               { wire:"PM CAMPAIGNS FROM THE CENTRE; BENCHES LEFT TO THEMSELVES" }],
      result:"The centre holds and the marginals are fought by whoever was already there. Some benches will remember being left." }
  ]},

{ id:"ch3_the_airwaves", chapter:3, prologue:6, once:true,
  title:"The debate",
  speaker:"watkins",
  body:`The leaders meet once, on the airwaves, for an hour, and the question
gets the last ten minutes of it. Watkins asks whether the government intends to
govern the question or to be carried past it, which is a question the campaign
has made fair.

The country watches this hour together. It is the only hour of the campaign
anyone watches together.`,
  choices:[
    { label:"Defend the record.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "loyalty.cu_maintenance":3 } },
               { wire:"PM DEFENDS THE RECORD IN THE LEADERS' DEBATE" }],
      result:"The record is what the government has. It is defended well and it is shorter than the argument against it." },
    { label:"Attack the other side's answer.",
      effects:[{ move:{ "public_standing":2 } }, { move:{ "legitimacy":-3 } },
               { move:{ "loyalty.psa":4 } },
               { wire:"PM ATTACKS THE OPPOSITION'S ANSWER IN THE DEBATE" }],
      result:"It lands. It also tells the country what the government is against and not what it is for." }
  ]},

{ id:"ch3_the_ground", chapter:3, prologue:8, once:true,
  title:"The last week",
  speaker:null,
  body:`The last week of a one-session campaign is the only part of it anyone
remembers. The parties spend what they have left, and the government spends the
record it has, and both of those run out on the same day.

The count is a week away and the question is still open.`,
  choices:[
    { label:"Put everything into the marginals.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "solvency":-4000 } },
               { wire:"GOVERNMENT SPENDS THE LAST WEEK IN THE MARGINALS" }],
      result:"The money goes where the seats are. Whether the seats were there to be had is what the count is for." },
    { label:"Hold the ground the government has.",
      effects:[{ move:{ "loyalty.cu_maintenance":3 } }, { move:{ "party_loyalty":2 } },
               { wire:"GOVERNMENT HOLDS ITS GROUND IN THE LAST WEEK" }],
      result:"A campaign that defends is a campaign that thinks it is ahead, and the other side reads it that way." }
  ]},

{ id:"ch3_the_count", chapter:3, prologue:9, once:true,
  title:"The count",
  speaker:null,
  body:`The returns come in by station, west to east, the way they always
have. The stations that carried the government return it, and the stations
that did not do not, and the arithmetic of the chamber is decided by
midnight.

The House that rises in the morning will be somebody else's arithmetic.
This one is finished, and what it settled stands, and what it did not settle
is now the country's to carry.`,
  choices:[
    { label:"Read the final numbers.",
      effects:[{ flag:"campaign_done" },
               { wire:"RETURNS COMPLETE: THE NEW HOUSE WILL SIT NEXT SESSION" }],
      result:"The numbers are read. The chapter closes." }
  ]},

/* the settlement: the argument was closed, and the Commonwealth after */
{ id:"ch4_settled", chapter:2, weight:97, once:true,
  when:{ settled:true },
  title:"The question, closed",
  speaker:null,
  body:`The argument the whole session has been about is closed. Not
paused, not deferred, not carried over: closed, in the form the record
will show for a generation.

The House will do the rest of its business in the shadow of the answer,
which is how a settlement works. What follows is the Commonwealth after it.`,
  choices:[
    { label:"See it.",
      effects:[{ chapter:4 }],
      result:"The argument is closed." }
  ]},

  { id:"ch4_after", chapter:4, prologue:1, once:true,
  title:"After",
  speaker:null,
  body:`The session runs on. Bills move or fall, ministers answer questions,
and the register fills with the ordinary business of the House. The
question that was settled stays settled, and the country gets used to the
answer, and then it stops noticing there was ever a question at all.

That is what a settlement is for.`,
  choices:[
    { label:"Close the chapter.",
      effects:[],
      result:"The record stands." }
  ]},

/* ---- THE AFTERMATH (T21). Chapter four is reached only when a settlement
   closed the question (ch4_settled gates on `settled`). Where chapter three
   leaves the question open, this chapter lives with an answer: the argument
   does not reopen, and the cost arrives afterwards. */

{ id:"ch4_the_answer", chapter:4, prologue:2, once:true,
  title:"The answer",
  speaker:null,
  body:`The country has an answer now, and the ordinary business is done in its
shadow. That is what makes it an answer: not that it is right, but that the
argument about it is over and the government has to administer it.

Ministers answer questions about everything else, and when the question comes
back, they say what the government decided, in the past tense.`,
  choices:[
    { label:"Defend the answer in public.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "loyalty.psa":3 } },
               { wire:"PM DEFENDS THE SETTLEMENT IN PUBLIC" }],
      result:"It is the government's answer and it is defended as one. The people who lost hear a government that has stopped pretending to listen." },
    { label:"Let the answer speak for itself.",
      effects:[{ move:{ "loyalty.cu_maintenance":4 } }, { move:{ "public_standing":-2 } },
               { wire:"PM LETS THE SETTLEMENT STAND WITHOUT A CAMPAIGN" }],
      result:"A settled question does not need a press tour. It needs a government that will not reopen it, and that is what it has." }
  ]},

{ id:"ch4_the_losers", chapter:4, prologue:3, once:true,
  title:"The people who lost",
  speaker:"watkins",
  body:`The benches that argued the other way have not changed their minds. They
have changed their subject, which is the most you can ask and the least you can
trust.

Watkins says it plainly: the answer is the government's until the country
decides to give it to somebody else, and that decision is years away.`,
  choices:[
    { label:"Give them a share of the administration.",
      effects:[{ move:{ "loyalty.cl":6 } }, { move:{ "loyalty.cu_loyalists":-3 } },
               { wire:"GOVERNMENT SHARES THE SETTLEMENT'S ADMINISTRATION WITH THE LOSERS" }],
      result:"They take the work and keep their argument. A losing side that administers the answer is a losing side that cannot campaign against it." },
    { label:"Press the advantage while it is warm.",
      effects:[{ move:{ "party_loyalty":4 } }, { move:{ "loyalty.cl":-4 } },
               { move:{ "public_standing":3 } },
               { wire:"GOVERNMENT PRESSES ITS ADVANTAGE AFTER THE SETTLEMENT" }],
      result:"The benches behind the government want it, and the benches against it will remember. Both of those are the normal politics of an answer." }
  ]},

{ id:"ch4_the_ledger", chapter:4, prologue:4, once:true,
  when:{ scalarBelow:{ solvency:45000 } },
  title:"The bill for the answer",
  speaker:"hatt",
  body:`Every settlement has a cost, and the cost does not arrive with the
argument. It arrives at the estimates, and the estimates are drawn now.

"The answer is paid for in the ordinary way," Hatt says. "By people who are
not in this room."`,
  choices:[
    { label:"Pay it now, and say so.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "legitimacy":3 } },
               { move:{ "solvency":-6000 } },
               { wire:"GOVERNMENT PAYS THE SETTLEMENT'S BILL AT THE ESTIMATES" }],
      result:"The bill is paid in the open. It is not popular and it is honest, which the benches can live with." },
    { label:"Spread the cost across the next session.",
      effects:[{ move:{ "loyalty.cu_maintenance":-5 } }, { move:{ "public_standing":-3 } },
               { wire:"SETTLEMENT COSTS DEFERRED TO THE NEXT SESSION" }],
      result:"The current position looks better and the next one looks worse. That is what a schedule is for." }
  ]},

{ id:"ch4_the_next", chapter:4, prologue:5, once:true,
  title:"The next question",
  speaker:"ansar",
  body:`A settled question makes room for the next one. The ninth deck has one,
and so does every delegation that spent the session waiting for this one to be
over.

"It is not that the answer is wrong," Ansar writes. "It is that the answer is
finished, and things that are finished are what a government moves on from."`,
  choices:[
    { label:"Take up the next question now.",
      effects:[{ move:{ "loyalty.psa":4 } }, { move:{ "public_standing":-2 } },
               { wire:"GOVERNMENT OPENS THE NEXT QUESTION AFTER THE SETTLEMENT" }],
      result:"A government that is always arguing is a government that is alive. It is also a government that never gets to rest on an answer." },
    { label:"Govern quietly. The session has earned it.",
      effects:[{ move:{ "loyalty.cu_maintenance":5 } }, { move:{ "party_loyalty":3 } },
               { wire:"GOVERNMENT CHOOSES A QUIET SESSION AFTER THE SETTLEMENT" }],
      result:"The House does its ordinary business and the country stops watching, which is the reward for having closed a question." }
  ]},

{ id:"ch4_the_record", chapter:4, prologue:6, once:true,
  title:"The record",
  speaker:null,
  body:`The session closes on the answer. Everything that moved in it is in the
record, and the record is what the next parliament argues with.

The question was put and carried, defeated, or taken out of the House's hands,
and the form of the answer is the form the record will show for a generation.
What follows is somebody else's session.`,
  choices:[
    { label:"Close the record.",
      effects:[{ flag:"campaign_done" },
               { wire:"SESSION CLOSES ON THE SETTLEMENT" }],
      result:"The record stands. The answer is the government's, and the next argument starts from it." }
  ]},

/* ============================================================
   FLASH I — THE PLATFORM CRISIS (the author's campaign, wired so it can
   be played; every sentence here is a placeholder for the author's
   prose, and the mechanics are the plan's: micro-decisions drift the
   four meters, the tiers in content/settlements.js read them, panic
   buttons are expensive, and the meltdown is a loss through the
   loyalty floor. See content/campaign_flash_i.example.js for the
   annotated plan.)
   ============================================================ */

/* THE FLASH I CHAIN RUNS ON A CLOCK, NOT ON A FLAG.

   Every step used to be gated on a flag the step before it set, at weights
   84-90, so the central argument of the session fired on consecutive
   sittings the moment the player kept saying yes -- measured at 9, 10 and 11
   of a 24-sitting session. Nothing was ever DUE; it merely became available,
   and the pool is steep enough that available means next.

   Now: the crisis OPENS on a date (`at`), and each step is queued by the
   choice that causes it, with the time that thing would actually take and a
   label so it lands on the calendar. A survey takes four sittings. A law
   officer's opinion takes three. The player can see both coming and has to
   govern around them, which is the whole point of order-paper time. */
{ id:"f1_stranded", chapter:2, at:8, once:true,
  title:"A hundred and eighty-four thousand",
  speaker:null,
  body:`Cordell has abandoned the Almanac Works, and the debt has not. A hundred
and eighty-four thousand people are on it with two months of air, and Kenya's
repatriation plan is fully funded, legally complete, and two years long.

The Works has voted. The question is what the Commonwealth says.`,
  choices:[
    { label:"Send the survey team.",
      effects:[{ flag:"f1_surveyed" }, { wire:"FEDERATION SURVEYS THE ABANDONED PLATFORM" },
               { queue:[{ event:"f1_referendum", after:2,
                          label:"The survey team reports from the Almanac" }] }],
      result:"The survey's first return is the scrubber schedule. The second is the debt." },
    { label:"Wait for Earth's process.",
      effects:[{ move:{ "legitimacy":-5 } }, { wire:"PM: THE REPATRIATION PLAN IS EARTH'S TO RUN" }],
      result:"The outer stations read the delay as an answer, and it is not the one they wanted." }
  ]},

{ id:"f1_referendum", chapter:2, queuedOnly:true, once:true,
  title:"The vote",
  speaker:"ceyhan",
  body:`The workers have voted to join the Federation, and Ceyhan's column
names the three reasons in one sentence: a two-year rescue, a
repatriation nobody's body is ready for, and bank accounts frozen

overnight on Earth's say-so.

"The referendum is on your desk," he says. "Earth's is reading the same
wire."`,
  choices:[
    { label:"Recognise the referendum.",
      effects:[{ flag:"f1_referendum_carried" }, { move:{ "friction":10 } },
               { move:{ "legitimacy":8 } },
               { wire:"FEDERATION RECOGNISES THE PLATFORM REFERENDUM" },
               { queue:[{ event:"f1_dilemma", after:2,
                          label:"Law and the Charter reports on the platform" }] }],
      result:"The Works is the Commonwealth's question now, and Earth's banks are reading the same wire." },
    { label:"Decline to recognise it.",
      effects:[{ move:{ "legitimacy":-8 } }, { move:{ "friction":-3 } }],
      result:"The strikes start on the outer habitats before the sitting ends." }
  ]},

{ id:"f1_dilemma", chapter:2, queuedOnly:true, once:true,
  title:"The dilemma",
  speaker:"fenwick",
  body:`The Minister for Law and the Charter sets out the two futures in
the plainest terms. Absorb the Works and take its industrial capacity,
its life-support bill, and the embargo risk over the defaulted debt. Or
decline, keep the short term, and explain the strikes.

Cordell did not break the law. It wound up the subsidiary that employed them,
kept the leases, and left the parent's exposure at nothing, which is what a
company is for.

Neither future is a vote the government can lose quietly.`,
  choices:[
    { label:"Move to annex.",
      /* AND THE BILL IS ACTUALLY SET DOWN. The result line has always said
         it was; until now nothing was, and the annexation settlements gated
         on the flag this choice sets rather than on any Act. Moving it out
         of `drafting` is what "set down" means to the engine. */
      /* EARTH REACTS THAT WEEK, not gradually over twenty sittings. This
         carried only a TREND, so the whole diplomatic cost of annexing a
         foreign works station arrived as a slow ramp — and when trends were
         given decay (they used to run for ever, and drove friction to 100),
         the cost stopped arriving at all. An annexation is a shock: most of
         it lands at once, and the trend is the deterioration afterwards. */
      effects:[{ flag:"f1_annexing" }, { move:{ "friction":12 } },
               { move:{ "trend.friction":3 } },
               { move:{ "solvency":-6000 } }, { move:{ "legitimacy":12 } },
               { bill:{ annexation:{ stage:"first_reading" } } },
               /* AND THE HOUSE WILL SIT FOR IT. Six slots is the whole
                  session's order-paper time and it is spoken for long
                  before this bill exists, so an annexation set down at
                  sitting thirteen could never reach a division: the canon
                  ending was gated on time the player had already spent.
                  A crisis measure brings its own time, which is what an
                  emergency debate IS. Five is what it costs: four grants to
                  carry it from first reading to where it can be voted, and
                  one more for the division itself. */
               { slots:{ total:5 } },
               { wire:"GOVERNMENT MOVES TO ANNEX THE WORKS" }],
      result:"The annexation bill is set down. Acting is popular at home; Earth notices, a little more, every sitting." },
    { label:"Hold the line.",
      effects:[{ move:{ "trend.legitimacy":-3 } }, { move:{ "friction":-4 } }],
      result:"The outer habitats have heard the answer, and they will repeat it back every sitting." }
  ]},

/* one drift micro-decision: nothing crashes today; the margin leans */
/* REACH: the annexation choice in f1_dilemma sets f1_annexing. */
{ id:"f1_water", chapter:2, weight:60, maxFires:2,
  when:{ flags:["f1_annexing"] },
  title:"The recycling line",
  speaker:"vellan",
  body:`The Minister for Life Support brings the platform's water recycling
estimate. It holds, or it does not hold, and the difference is a funding
line that will not be felt for a month. That is the whole of the warning.`,
  choices:[
    { label:"Fund it in full.",
      effects:[{ move:{ "solvency":-3000 } }, { move:{ "trend.thermal_margin":1 } },
               { move:{ "legitimacy":4 } }],
      result:"The margin improves, a point at a time, and the country sees a government paying for the platform it claimed." },
    { label:"Trim it and take the margin.",
      effects:[{ move:{ "solvency":2000 } }, { move:{ "trend.thermal_margin":-2 } }],
      result:"Nothing happens today. That is what a drift is." }
  ]},

/* a panic button: visible, expensive, and the way back from the cascade */
{ id:"f1_loan", chapter:2, weight:84, maxFires:1,
  when:{ scalarBelow:{ solvency:30000 } },
  title:"The emergency loan",
  speaker:"hatt",
  body:`The Alliance of Business and Government will carry the
Commonwealth's short position, at a rate, for a term, on a condition.
The condition is Cordell's mining leases.

The rate is printed. The term is printed. The condition is one line.`,
  choices:[
    { label:"Take the loan.",
      effects:[{ move:{ "solvency":18000 } }, { move:{ "legitimacy":-10 } },
               { undertake:{ id:"f1_debt", text:"Honour the emergency facility",
                             post:"treasury", by:null, onBreach:"f1_debt_called" } }],
      result:"The solvency line recovers. The promise does not, and it has a date." },
    { label:"Refuse the rate.",
      effects:[{ move:{ "legitimacy":3 } }, { move:{ "trend.solvency":-1000 } }],
      result:"A solvent government could have refused it. This one is not solvent, and refusing costs a little, every sitting." }
  ]},

/* the meltdown: a LOSS through the loyalty floor, not a settlement */
/* REACH: a collapse: friction above 85 with all three floors breached; a loss, not a settlement. */
{ id:"f1_meltdown", chapter:2, weight:98, once:true,
  when:{ scalarAbove:{ friction:85 },
         scalarBelow:{ thermal_margin:20, solvency:20000, legitimacy:20 } },
  title:"The cascade",
  speaker:null,
  body:`The embargo lands. Life support fails on the platform and the
strain reaches the ring. The vote of no confidence is tabled while the
chamber is still arguing about the water.`,
  choices:[
    { label:"It was always going to end somewhere.",
      effects:[{ move:{ "party_loyalty":-100 } }],
      result:"The government falls. The terminal writes GOVERNMENT FALLEN." }
  ]},

/* THE SANCTIONS LAND. Friction above the top coupling's line has been
   costing the margin every sitting since 40; this is the step where it
   stops being a cost and becomes a fact. The couplings keep biting; this
   is the prose that tells the player why. */
/* REACH: friction above 70; the couplings ramp it there. */
{ id:"f1_accounts_freeze", chapter:2, weight:87, once:true,
  when:{ scalarAbove:{ friction:70 } },
  title:"The accounts are frozen",
  speaker:"hatt",
  body:`The wire says it at 06:00 and the Treasury confirms it by nine. The
platform's corporate accounts are frozen under the host state's banking
measures, and the freeze reaches the Commonwealth's own counterparties in
three jurisdictions. Fuel, water and salaries are now things the government
must find a way to pay for out of what it holds.

Hatt puts the position in a sentence. "It is not an embargo yet. It is the
price of one, and it is being charged to us by the hour."`,
  choices:[
    { label:"Pay for the platform out of the reserve.",
      effects:[{ move:{ "solvency":-10000 } }, { move:{ "legitimacy":6 } },
               { move:{ "trend.friction":-1 } },
               { wire:"COMMONWEALTH FUNDS THE PLATFORM FROM THE RESERVE; SANCTIONS STAND" }],
      result:"The workers keep running and the reserve pays. The friction stops worsening, which is not the same as improving." },
    { label:"Let the platform's suppliers carry the risk.",
      effects:[{ move:{ "legitimacy":-8 } }, { move:{ "trend.friction":1 } },
               { wire:"SUPPLIERS ASKED TO CARRY PLATFORM RISK; OUTER HABITATS OBJECT" }],
      result:"The government keeps its money and loses the argument, and the sanctions deepen on their own." }
  ]},

/* WHAT A BROKEN PROMISE LOOKS LIKE. `onBreach` used to point at
   `gb_approach`, so a missed deadline replayed the meeting that made the
   promise. The breach is its own scene, and it is gated on the broken
   undertaking so the link is in the data and not in a comment. */
{ id:"gb_carveout_broken", chapter:2, weight:88, once:true,
  when:{ breached:["licensure_carveout"] },
  title:"The order that was never laid",
  speaker:"gb_chair",
  body:`The panel waited the four sittings and the licensing order was not
laid. The chair does not call it a breach. She calls it a schedule, which
is what the panel calls everything, and says the sector will treat the
question as settled.

"You asked us for a carve-out," she says. "We did not ask you for
anything. That is the difference between us that your government has now
discovered."`,
  choices:[
    { label:"Lay the order next sitting and say the delay was yours.",
      effects:[{ move:{ "rel.gb_chair":4 } }, { move:{ "legitimacy":-4 } },
               { si:"si_2287_44" },
               { wire:"PM CONCEDES THE LICENSING DELAY AND LAYS THE ORDER" }],
      result:"The order is laid late and the government takes the blame publicly, which is the only coin the panel accepts." },
    { label:"Let it stand. A promise missed is a promise missed.",
      effects:[{ move:{ "rel.gb_chair":-8 } }, { move:{ "loyalty.gb":-8 } },
               { move:{ "legitimacy":-6 } },
               { wire:"GOVERNMENT ABANDONS THE CARVE-OUT; GUILD BENCH DISENGAGES" }],
      result:"The panel treats the sector as a bench that answers no government, which costs the next dual majority more." }
  ]},

/* THE OTHER WAY OUT. The couplings make high friction cost the margin every
   sitting, so a government that wants friction DOWN needs something to do
   about it that is not simply waiting: Earth's price for standing down, on
   the table more than once, at a cost the player can see. */
{ id:"fa_conciliate", chapter:2, weight:62, maxFires:2,
  when:{ scalarAbove:{ friction:45 } },
  title:"What Earth would take to stand down",
  speaker:"landry",
  body:`The Foreign Minister has a list from Earth's banks. Honour the
corporate bonds the platform defaulted on. Accept an inspection of the
salvage claim. Suspend the annexation question for a quarter. Do those
three and the measures are lifted, for a quarter, and reviewed.

It is not a bargain an ordinary year would take. This is not one.`,
  choices:[
    { label:"Pay the bond and take the suspension.",
      effects:[{ move:{ "friction":-9 } }, { move:{ "solvency":-7000 } },
               { move:{ "legitimacy":-3 } },
               { wire:"COMMONWEALTH PAYS THE BOND; EARTH SUSPENDS THE MEASURES FOR A QUARTER" }],
      result:"The measures lift and the reserve pays for a suspension that lasts a quarter." },
    { label:"Refuse, and wear the measures.",
      effects:[{ move:{ "friction":2 } }, { move:{ "legitimacy":5 } },
               { move:{ "loyalty.cu_maintenance":4 } },
               { wire:"PM REFUSES EARTH'S TERMS: 'THE COMMONWEALTH DOES NOT PAY RANSOM' (as of 6 days ago)" }],
      result:"The line is popular at home and the sanctions price it in, every sitting." }
  ]},

/* ============================================================
   FOREIGN AFFAIRS, THE CHEAP LAYER (design/17 §4.3).

   No state, no chart, no light-lag simulation: a PRICE the player does
   not control, a CONCESSION that can be withdrawn, and the wire saying
   how old the news is. `design/11`'s rule is the whole of it — a foreign
   fact is never current — and it costs no new verb: `move`, `flag`,
   `wire` and `queue` carry everything here. It closes a link in the
   consequence chain too, because high transit prices now have an event
   watching them.
   ============================================================ */

{ id:"fa_window_closes", chapter:2, weight:58, maxFires:2,
  title:"The window closes",
  speaker:null,
  body:`The Earth-side launch authority has moved the departure window for
tether traffic, and the Commonwealth was told by wire. The transit index
takes the news the way the index takes everything: immediately, and as
somebody else's decision.

The anchor states and the outer stations feel it first, because they are
the ones whose schedules are other people's schedules.`,
  choices:[
    { label:"Buy back the window with the reserve.",
      effects:[{ move:{ "price.transit":4 } }, { move:{ "solvency":-8000 } },
               { move:{ "loyalty.cl":5 } },
               { wire:"COMMONWEALTH PAYS TO KEEP THE EARTH-SIDE WINDOW OPEN (as of 9 days ago)" }],
      result:"The window reopens and the reserve pays for a decision taken eleven days ago by somebody else." },
    { label:"Chart the Commonwealth's own windows and stop asking.",
      effects:[{ move:{ "price.transit":9 } }, { move:{ "public_standing":4 } },
               { move:{ "loyalty.hul":6 } },
               { wire:"PM: THE COMMONWEALTH WILL SCHEDULE ITS OWN TRANSIT (as of 9 days ago)" }],
      result:"The line is popular and the price rises, because independence from another state's windows is a thing you pay for in delta-v." }
  ]},

{ id:"fa_freight_reacts", chapter:2, weight:56, maxFires:2,
  when:{ priceAbove:{ transit:105 } },   /* the eye on the foreign price */
  title:"The freight lines pass it on",
  speaker:"hatt",
  body:`The transit price has been above a hundred and five for a week, and
the lines that move consumables have started pricing the difference into
every station's quarterly. The Association's position is that this is not
its decision and that it is not its fault, both of which are true.`,
  choices:[
    { label:"Subsidise the consumables run out of the reserve.",
      effects:[{ move:{ "consumables":4 } }, { move:{ "solvency":-10000 } },
               { move:{ "loyalty.psa":5 } },
               { wire:"TRANSIT DIFFERENTIAL SUBSIDISED FOR CONSUMABLES RUNS" }],
      result:"The stations do not notice a price that was somebody else's decision." },
    { label:"Let the price be the price.",
      effects:[{ move:{ "public_standing":-5 } }, { move:{ "loyalty.cu_maintenance":-6 } },
               { station:{ perigee:{ closure:-0.02 }, sinter:{ closure:-0.02 } } },
               { wire:"PM DECLINES TRANSIT SUBSIDY; OUTER STATIONS WARN ON CLOSURE" }],
      result:"Two stations' closure figures take the strain, which is the arithmetic of an index the government does not set." }
  ]},

{ id:"fa_anchor_terms", chapter:2, weight:76, once:true,
  when:{ billStage:{ anchor_kepler:"assent" } },
  title:"The anchor states its terms",
  speaker:"landry",
  body:`The host state has offered to renew the International's anchor concession
without the Assembly's ratification, at a price. The price is eight points
on transit and a review clause the Commonwealth does not get to see until
it is invoked.

"Ratify it and the price is as the bill says," the Foreign Minister tells
you. "Decline, and the price is theirs. Their lawyers drafted the clause
eleven days before we were told it existed."`,
  choices:[
    { label:"Take the terms. An anchor is not a negotiation between equals.",
      effects:[{ move:{ "price.transit":12 } }, { move:{ "solvency":-6000 } },
               { move:{ "rel.landry":6 } },
               { wire:"ANCHOR RENEWED ON THE HOST STATE'S TERMS; TRANSIT PRICE RISES" }],
      result:"The International keeps running and the Commonwealth pays the rate for a lease it does not own." },
    { label:"Refuse, and send the bill to the House instead.",
      effects:[{ move:{ "price.transit":20 } }, { move:{ "public_standing":5 } },
               { move:{ "loyalty.cu_maintenance":6 } },
               { flag:"anchor_refused" },
               { bill:{ anchor_kepler:{ stage:"second_reading", dead:false } } },
               { wire:"PM REFERS THE ANCHOR CONCESSION TO THE HOUSE; HOST STATE PROTESTS" }],
      result:"The question goes where the constitution says it belongs and the transit market reads the wire first." }
  ]},

/* LIGHT-LAG, DEMONSTRATED (design/11 §1). A dispatch to Mars takes eleven
   sittings to arrive and eleven to be answered, so the reply reads a world
   that has moved in the meantime: the Concord answers a question the
   Commonwealth has since settled. `queue` is the whole of the mechanic — no
   new verb — and the label puts the dispatch on the foreign panel as IN
   FLIGHT and on the calendar with a date, which is the anxiety the light-lag
   rule exists to produce. */
{ id:"fa_dispatch_mars", chapter:2, weight:67, once:true,
  when:{ actorBelow:{ mars:60 }, flagsAbsent:["mars_asked"] },
  title:"Eleven sittings away",
  speaker:"landry",
  body:`The Martian Concord has not been told what the Commonwealth thinks of the
metanationals, and it has asked twice. The Foreign Minister has a draft and no
strong view about it.

"Whatever we send," Landry says, "they will read it a fortnight after we wrote
it and answer from wherever they have got to by then. That is the whole
relationship. We can be fast or we can be right."`,
  choices:[
    { label:"Send it now, and send it plainly.",
      note:"The dispatch leaves tonight and the answer arrives in eleven " +
           "sittings, which is eleven sittings of events the Concord will not " +
           "have heard about. Doing nothing also sends a message, and it " +
           "travels at exactly the same speed.",
      effects:[{ flag:"mars_asked" },
               { queue:[{ event:"fa_mars_reply", after:11,
                          label:"A dispatch to the Martian Concord" }] },
               { wire:"COMMONWEALTH DISPATCHES ITS POSITION ON THE METANATIONALS TO MARS" }],
      result:"The dispatch leaves on the next favourable window. The answer will be written by a Concord that has had eleven sittings to change its mind." },
    { label:"Send nothing until the position is settled at home.",
      note:"The Commonwealth says nothing, and the silence travels.",
      effects:[{ flag:"mars_asked" }, { move:{ "actor.mars":-4 } },
               { move:{ "public_standing":2 } },
               { wire:"NO DISPATCH TO MARS; THE POSITION IS NOT YET SETTLED" }],
      result:"Nothing goes. The Concord notes the silence, which arrives anyway and always has." }
  ]},

/* REACH: queued by fa_dispatch_mars (send it now), +11 sittings. */
{ id:"fa_mars_reply", queuedOnly:true, once:true,
  title:"The reply",
  speaker:null,
  body:`The dispatch has been answered. The Concord's note is four paragraphs long
and the first three concern a metanational matter the Commonwealth's courts
settled a month ago, which is what eleven sittings of lag looks like: a careful
answer to a question that has moved.

The fourth paragraph is the one the Foreign Minister reads twice.`,
  choices:[
    { label:"Publish it, with the dates attached.",
      effects:[{ move:{ "actor.mars":6 } }, { move:{ "public_standing":2 } },
               { wire:"THE COMMONWEALTH PUBLISHES THE MARTIAN REPLY IN FULL, WITH DATES" }],
      result:"The note goes out stamped with the day it was written. A foreign fact is never current, and the government has now said so on the record." },
    { label:"Answer it as though it were current.",
      effects:[{ move:{ "actor.mars":2 } }, { move:{ "friction":-2 } },
               { wire:"PM ANSWERS MARS; THE CORRESPONDENCE CONTINUES AT ONE EXCHANGE A FORTNIGHT" }],
      result:"The exchange runs at a dispatch a fortnight in each direction, which is what a relationship eleven sittings wide actually is." }
  ]},

/* THE CONCESSION CAN BE WITHDRAWN (design/17 §4.3). `fa_anchor_terms` is the
   offer; this is the host state meaning the refusal. A flag, a price, and the
   two yards whose schedules are somebody else's. */
/* REACH: refuse the anchor terms (fa_anchor_terms choice 2), then the concession lapses. */
{ id:"fa_anchor_withdrawn", chapter:2, weight:72, once:true,
  when:{ flags:["anchor_refused"], flagsAbsent:["anchor_gone"] },
  title:"The concession lapses",
  speaker:"landry",
  body:`The host state has let the International concession lapse rather than renew it
on the Commonwealth's terms, and the decision was taken nine days ago. The
traffic that uses the anchor is now traffic the Commonwealth cannot schedule.

The stations that live off it are the ones whose schedules were already other
people's schedules.`,
  choices:[
    { label:"Buy the concession back at whatever the rate is.",
      note:"The anchor runs again and the Commonwealth learns what its access " +
           "is worth, which is the number the next negotiation starts from.",
      effects:[{ flag:"anchor_gone" }, { move:{ "price.transit":14 } },
               { move:{ "solvency":-14000 } }, { move:{ "actor.earth_host":8 } },
               { wire:"COMMONWEALTH BUYS BACK THE INTERNATIONAL CONCESSION AT KENYA'S RATE" }],
      result:"The anchor is running again before the quarter is out and the rate is on the record." },
    { label:"Let it go, and build the Commonwealth's own windows.",
      note:"The strongest line available and the most expensive one: two yards " +
           "carry the schedule while the Commonwealth learns to hold its own.",
      effects:[{ flag:"anchor_gone" }, { flag:"anchor_independent" },
               { move:{ "price.transit":22 } }, { move:{ "public_standing":5 } },
               { move:{ "loyalty.hul":7 } },
               { station:{ perigee:{ closure:-0.03 }, nasmyth:{ closure:-0.03 } } },
               { wire:"PM: THE COMMONWEALTH WILL NOT RENT ITS LIFELINE (as of nine days ago)" }],
      result:"It is the best sentence the government has said all session, and two yards' closure figures pay for it." }
  ]},

/* REACH: no gate; always eligible in ch2 and loses on weight. */
{ id:"fa_two_fronts", chapter:2, weight:57, maxFires:2,
  title:"Two audiences, one sentence",
  speaker:"ceyhan",
  body:`The Spindle leads with the platform's scrubbers and the government
that looked away. The Earth-side services lead with a tragic industrial
accident being politicised by opportunistic habitats, and quote a minister
who has not been a minister for nine years.

It is the same week in two places, and there is one sentence available to
the government that will be read in both.`,
  choices:[
    { label:"Say it for the Federation: competence, not sentiment.",
      effects:[{ move:{ "legitimacy":6 } }, { move:{ "actor.earth_bloc":-5 } },
               { move:{ "friction":3 } },
               { wire:"PM SPEAKS TO THE HABITATS; EARTH SERVICES CALL THE TONE 'MANAGERIAL'" }],
      result:"The Federation hears a government in command. Earth hears a government that has stopped being polite." },
    { label:"Say it for both: the accident, and the rescue.",
      effects:[{ move:{ "actor.earth_bloc":6 } }, { move:{ "actor.earth_host":4 } },
               { move:{ "legitimacy":-3 } }, { move:{ "friction":-2 } },
               { wire:"PM ADDRESSES BOTH AUDIENCES ON THE PLATFORM (Earth services carry it in full)" }],
      result:"Earth carries the sentence and the outer habitats notice that the government answered the people who do not vote for it." }
  ]},

/* the canon election: the pyrrhic tier leads to the campaign's victory */
{ id:"f1_pyrrhic_election", chapter:3, prologue:7, once:true,
  when:{ resolvedIs:"f1_pyrrhic" },
  title:"The mandate",
  speaker:null,
  body:`The returns are complete, and they are a verdict on the debt the
Commonwealth assumed. The country has decided that saving three hundred
thousand people was worth the austerity, and that the government that did
it deserves the session that follows.

The victory is real and it is expensive, which is the only kind this
campaign had on offer.`,
  choices:[
    { label:"Read the final numbers.",
      effects:[{ wire:"RETURNS COMPLETE: THE GOVERNMENT IS RETURNED ON THE PYRRIHIC TICKET" }],
      result:"The numbers are read. The chapter closes." }
  ]},

/* AND THE FLOOR PRESSES. Consumables was moved by the closure tick and by
   the budget's clauses and read by nothing, which is the wrong way round
   for the one number that is the primary distribution mechanism (§7.4). */
/* REACH: consumables below 52. */
{ id:"the_floor_presses", chapter:2, weight:62, maxFires:2,
  when:{ scalarBelow:{ consumables:52 } },
  title:"The floor, and what it is carrying",
  speaker:"ansar",
  body:`The consumables figure has come down far enough that the quarterly
lift is being cut on the stations that need it most, and the ninth deck has
circulated the schedule again.

"It is not the number," Ansar writes. "It is that the number is a schedule,
and the schedule is a list of who is carried and who is not."`,
  choices:[
    { label:"Buy the lift back out of the reserve.",
      effects:[{ move:{ "consumables":7 } }, { move:{ "solvency":-9000 } },
               { move:{ "loyalty.cu_maintenance":6 } }, { move:{ "loyalty.psa":5 } },
               { wire:"QUARTERLY LIFT RESTORED FROM THE RESERVE" }],
      result:"The schedule is restored and the reserve carries it, which is what a distribution mechanism is for." },
    { label:"Let the stations that can pay, pay.",
      effects:[{ move:{ "consumables":-3 } }, { move:{ "public_standing":-6 } },
               { move:{ "loyalty.cu_maintenance":-8 } },
               { station:{ ashfield:{ closure:-0.02 }, drift:{ closure:-0.02 } } },
               { wire:"CONSUMABLES LIFT CUT ON THE LOW-CLOSURE STATIONS" }],
      result:"The figure steadies and the stations with the least closure take the difference." }
  ]},

/* A POSITION SETTLES (design/28 §3). The forward was sold for cash at a
   price fixed on the day; this is the delivery, and what is handed over is
   exactly what was sold. The tempo set the flag and the settle reads it,
   which is the whole of a forward: the price was decided then, the
   obligation is paid now, and what the session did to the margin in
   between is the risk the government took. */
/* REACH: queued by the quota_forward initiative. */
{ id:"quota_forward_settles", queuedOnly:true, once:true,
  title:"The quota forward comes due",
  speaker:"hatt",
  body:`The consortiums have come for the capacity. Whatever the margin has
done since the forward was sold, the price was fixed then and the quota
leaves now: a slice of it, or the whole of it, as the government agreed.

"Fixed is fixed," Hatt says, in the tone of a man who was on the other side
of the trade.`,
  choices:[
    { label:"Hand over the slice.",
      when:{ flags:["quota_forward_small"] },
      effects:[{ move:{ "thermal_margin":-4 } }, { move:{ "solvency":3000 } },
               { wire:"QUOTA FORWARD DELIVERED; THE MARGIN NARROWS A SLICE" }],
      result:"A slice of the margin leaves with the consortiums, and the Commonwealth pays to buy the rest back at whatever the price is now." },
    { label:"Hand over the margin.",
      when:{ flags:["quota_forward_full"] },
      effects:[{ move:{ "thermal_margin":-11 } }, { move:{ "solvency":6000 } },
               { wire:"FULL QUOTA FORWARD DELIVERED; THE MARGIN NARROWS SHARPLY" }],
      result:"The consortiums take what was sold, and the government discovers what a fixed price costs when the market has moved against it." },
    /* A safety net: the settle is queued and fires whatever the state is, so
       it must always have one open choice. It cannot normally be reached —
       the tempo sets one of the two flags — and content is better with a
       door it never uses than with an event that can strand a sitting. */
    { label:"Hand over what was agreed.",
      when:{ flagsAbsent:["quota_forward_small", "quota_forward_full"] },
      effects:[{ move:{ "thermal_margin":-2 } },
               { wire:"QUOTA FORWARD DELIVERED" }],
      result:"The delivery is smaller than any forward the government meant to sell." }
  ]},

/* THE OTHER THREE MARKETS SETTLE (design/28 §3). Each is a position taken
   in content/initiatives.js: a move now, a queued term, and this event,
   which reads the state on the day it lands. No new effect verb and no
   engine change: the condition vocabulary already reads flags, prices and
   the station counts, and conditions are not under the twenty-verb cap. */

/* UNDERWRITING. The cover ran for the term the government bought, and the
   Underwriters settle against the one risk they wrote. The branches are
   the risk and the tempo, and between them they cover every state: the
   freeze happened or it did not, and the cover was on the suppliers or on
   the whole line. */
/* REACH: queued by the take_indemnity initiative. */
{ id:"indemnity_settles", queuedOnly:true, once:true,
  title:"The indemnity comes to term",
  speaker:"hatt",
  body:`The Underwriters do not argue and they do not negotiate. They send a
single page with the premium paid at the top and one line at the foot saying
what was covered.

"Frozen or not frozen," Hatt says. "That was the whole policy. They wrote
it that way because they could read the numbers and we could not."`,
  choices:[
    { label:"The accounts froze. The cover answers the suppliers.",
      when:{ flags:["indemnity_suppliers","f1_frozen"] },
      effects:[{ move:{ "solvency":9000 } }, { move:{ "actor.underwriters":-2 } },
               { wire:"UNDERWRITERS PAY ON THE FROZEN ACCOUNTS" }],
      result:"The payout arrives after the freeze and it is smaller than the freeze. The reserve ends the term nine points better than the sanctions left it." },
    { label:"The accounts froze. The cover carries the whole line.",
      when:{ flags:["indemnity_lifesupport","f1_frozen"] },
      effects:[{ move:{ "solvency":18000 } }, { move:{ "legitimacy":3 } },
               { move:{ "actor.underwriters":-5 } },
               { wire:"UNDERWRITERS CARRY THE PLATFORM'S LIFE SUPPORT" }],
      result:"The Underwriters pay for the air and the water on the platform for the term. The premium was large and the payout is larger." },
    { label:"Nothing froze. The premium is spent.",
      when:{ flagsAbsent:["f1_frozen"] },
      effects:[{ move:{ "actor.underwriters":4 } },
               { wire:"INDEMNITY EXPIRES UNUSED; THE UNDERWRITERS KEEP THE PREMIUM" }],
      result:"The risk stayed away for the whole term. The Underwriters keep the premium, which is the business they are in." },
    /* The safety net every queued settle carries. A door content never uses
       is better than an event that can strand a sitting. */
    { label:"The term ends.",
      when:{ flagsAbsent:["indemnity_suppliers","indemnity_lifesupport"] },
      effects:[{ wire:"THE INDEMNITY TERM ENDS" }],
      result:"The cover closes with nothing written against it." }
  ]},

/* VOLUME LEASES. A lease is settled in the currency it was written in, and
   the price of volume on the day decides what the Commonwealth actually
   got. The two branches per tempo are exhaustive rather than approximate:
   prices carry one decimal, so `above X` and `below X + 0.1` between them
   cover every value the tick can produce, and a player is never left with
   an empty Decision. */
/* REACH: queued by the charter_volume initiative. */
{ id:"volume_charter_settles", queuedOnly:true, once:true,
  title:"The volume lease comes to term",
  speaker:"vellan",
  body:`Homestead has held the volume for the whole term and the surveyors
have filed. The file is short. The station kept its side or it did not, and
the price of volume has moved since the lease was written.

"The lease says what follows either way," Vellan says. "It was written by
people who expected the price to move."`,
  choices:[
    { label:"The lease is renewed. The price ran against it.",
      when:{ flags:["charter_cash"], priceAbove:{ volume:108 } },
      effects:[{ move:{ "solvency":-5000 } },
               { wire:"VOLUME LEASE RENEWED AS THE PRICE CLIMBS" }],
      result:"The Commonwealth sold forward at a price the market has passed. Homestead takes the volume for another term at the old rate." },
    { label:"The lease is renewed at the same terms.",
      when:{ flags:["charter_cash"], priceBelow:{ volume:108.1 } },
      effects:[{ move:{ "solvency":2000 } },
               { wire:"VOLUME LEASE RENEWED; HOMESTEAD PAYS IN CASH" }],
      result:"The rent clears and the volume passes to Homestead for another term. The Commonwealth takes the cash." },
    { label:"Homestead did the work, and the price made it cheap.",
      when:{ flags:["charter_closure"], priceAbove:{ volume:108 } },
      effects:[{ move:{ "solvency":-4000 } }, { move:{ "legitimacy":3 } },
               { wire:"HOMESTEAD RENEWS; THE OUTER BENCHES READ THE TERMS" }],
      result:"The station closed part of its own cycle with the volume it was let, and it got that volume at a price the market has left behind. The outer benches can read a lease." },
    { label:"Homestead did the work.",
      when:{ flags:["charter_closure"], priceBelow:{ volume:108.1 } },
      effects:[{ move:{ "legitimacy":5 } },
               { wire:"HOMESTEAD'S CYCLE CLOSES FURTHER UNDER THE LEASE" }],
      result:"The station has raised its closure with the volume it was let, and it pays the Commonwealth in the one currency that outlasts the term." },
    { label:"The term ends.",
      when:{ flagsAbsent:["charter_cash","charter_closure"] },
      effects:[{ wire:"THE VOLUME LEASE TERM ENDS" }],
      result:"The lease closes with no rent and no work against it." }
  ]},

/* SUBSTRATE FUTURES AND DEBT. The debt was secured against the
   continuation of the people on the platform, so the settle reads the
   platform's own numbers: how many were suspended at the term, and what
   the substrate was worth. Suspensions are whole numbers, so `below T + 1`
   and `above T` cover every value; prices carry one decimal, so
   `below X + 0.1` and `above X` do the same. */
/* REACH: queued by the assume_substrate_debt initiative. */
{ id:"substrate_debt_settles", queuedOnly:true, once:true,
  title:"The substrate debt comes to term",
  speaker:"ceyhan",
  body:`The Commonwealth took the debt onto its books or it cancelled it, and
either way the term has come. The number that settles it is on the platform
rather than in the Treasury: how many people are suspended, and what the
substrate they run on is worth.

"Two ways to answer a debt secured on people," Ceyhan says. "You can pay it,
or you can say it was never owed. The platform has been counting either
way."`,
  choices:[
    { label:"The platform kept running. The assumption held.",
      when:{ flags:["debt_assumed"], suspendedBelow:{ federal:72001 } },
      effects:[{ move:{ "legitimacy":6 } }, { move:{ "solvency":5000 } },
               { move:{ "actor.underwriters":3 } },
               { wire:"PLATFORM SUSPENSIONS FALL UNDER COMMONWEALTH DEBT" }],
      result:"Fewer people stopped running than at the start of the term. The debt the Commonwealth took on is backed by a platform that is working." },
    { label:"The platform kept shedding. The assumption did not hold.",
      when:{ flags:["debt_assumed"], suspendedAbove:{ federal:72000 } },
      effects:[{ move:{ "solvency":-7000 } }, { move:{ "friction":2 } },
               { wire:"SUSPENSIONS RISE; THE DEBT IS A HOLE" }],
      result:"More people were suspended at the term than at the start. The Commonwealth owns the debt of a platform that is still failing." },
    { label:"The write-off was cheaper than the debt.",
      when:{ flags:["debt_written_off"], priceAbove:{ substrate:110 } },
      effects:[{ move:{ "actor.underwriters":-6 } }, { move:{ "legitimacy":-3 } },
               { wire:"SUBSTRATE RISES; THE WRITE-OFF LOOKS EXPENSIVE" }],
      result:"The substrate is worth more than the Commonwealth allowed when it cancelled the debt, and the Underwriters have repriced the Commonwealth's word." },
    { label:"The write-off holds.",
      when:{ flags:["debt_written_off"], priceBelow:{ substrate:110.1 } },
      effects:[{ move:{ "solvency":2000 } }, { move:{ "actor.underwriters":2 } },
               { wire:"SUBSTRATE STEADY; THE WRITE-OFF HOLDS" }],
      result:"The substrate did not move against the cancellation. The Commonwealth's books are lighter by the debt it refused." },
    { label:"The term ends.",
      when:{ flagsAbsent:["debt_assumed","debt_written_off"] },
      effects:[{ wire:"THE SUBSTRATE DEBT TERM ENDS" }],
      result:"The debt comes to term with nothing done about it." }
  ]},

/* ===========================================================
   FOUR LOCKED THEMES NO EVENT HAD EVER REACHED (design/24 B3,
   work order T8). Volume, the courts, consumables and the
   congregations are each in the bible and in nothing else. No
   engine work is needed: `station` moves any numeric field, and
   the rest is `move`, `flag`, `undertake` and the wire.
   =========================================================== */

/* VOLUME (bible 6.10). The fundamental scarce good, and the fight about
   it is a biological politics: density, minimum standards, subletting,
   a berth cut into six. The ring band is dear because everyone wants to
   be there; the low band is nearly free because nobody does. */
/* REACH: no gate; always eligible in ch2. */
{ id:"the_minimum_berth", chapter:2, weight:64, once:true,
  title:"The minimum berth",
  speaker:"vellan",
  body:`The Ministry has measured the berths on the low band and a third of them
are under the standard of 2279. Most of the shortfall is in the last six years,
and most of it is one landlord.

Vellan puts the two readings of the same figure. "Either a berth is a home and
there is a floor under it, or it is a cubic metre with a lock on the door. The
House has to say which, because the market will not."`,
  choices:[
    { label:"Set the floor, and enforce it",
      note:"A minimum volume in law turns a lease into a home and puts the cost " +
           "of the partition on the landlord. The low band's associations will " +
           "carry it for you; the rentiers will price it into every let they " +
           "still write.",
      effects:[{ flag:"minimum_berth_laid" },
               { move:{ "price.volume": 5 } }, { move:{ "actor.forkrentiers": -8 } },
               { move:{ "loyalty.hul": 6 } }, { move:{ "loyalty.des": 4 } },
               { move:{ "public_standing": 4 } },
               { wire:"MINIMUM BERTH STANDARD LAID; LANDLORDS TO RECONFIGURE OR LOSE THE LET" }],
      result:"The standard is on the book from the next quarter. Half the partitioned berths on the low band are now unlawful and the landlords have six months to say what they will do about it." },
    { label:"Leave it to the lease. A tenant can read a plan",
      note:"No new duty and no new cost. Density stays a matter between landlord " +
           "and tenant, and the densest berths stay where the work is.",
      effects:[{ move:{ "price.volume": -6 } }, { move:{ "actor.forkrentiers": 6 } },
               { move:{ "consumables": -4 } }, { move:{ "loyalty.cu": -3 } },
               { wire:"GOVERNMENT DECLINES A MINIMUM BERTH; THE PARTITION STANDS" }],
      result:"The rentiers write the quarter's lets on the old terms. The low band's associations note who decided, and the deck crews note that the densest berths are the ones the air reaches last." }
  ]},

/* REACH: no gate beyond flagsAbsent sublet_ruled; always eligible until it fires. */
{ id:"the_sublet_market", chapter:2, weight:57, once:true,
  when:{ flagsAbsent:["sublet_ruled"] },
  title:"Under the berth",
  speaker:"okarie",
  body:`A berth on the ring band has been sublet eleven times in a year, and the
eleventh tenant is the fourth to run a shift from it. The landlord has taken a
share of each let. None of it is unlawful, because nothing addressed it.

"Half my members are renting a corner of somebody else's home to sleep in,"
Okarie says. "The other half are the landlord. I can hold the lobby on the
first half. I cannot hold it if you make them choose."`,
  choices:[
    { label:"Regulate the sublet: register it, cap the share",
      note:"Registration makes the sublet visible and the cap makes it survivable. " +
           "It also makes every sublet a thing the Registry knows about, which " +
           "is the part the ring band will not like.",
      effects:[{ flag:"sublet_ruled" }, { move:{ "price.volume": 3 } },
               { move:{ "loyalty.hul": 5 } }, { move:{ "loyalty.cu_loyalists": -4 } },
               { move:{ "consumables": 3 } },
               { wire:"SUBLETS TO BE REGISTERED; SHARE OF THE LET CAPPED" }],
      result:"Registration opens next quarter. The eleventh tenant keeps the shift and the landlord keeps a smaller share of it." },
    { label:"Set the cap and leave the registry out of it",
      note:"The saving to the tenant without the register. The Registry has been " +
           "the subject of a division once already this session, and nobody wants " +
           "a second one about a room.",
      effects:[{ flag:"sublet_ruled" }, { move:{ "loyalty.cu": 4 } },
               { move:{ "loyalty.hul": 3 } }, { move:{ "public_standing": -2 } },
               { wire:"SUBLET SHARE CAPPED; NO REGISTER TO BE KEPT" }],
      result:"The cap binds and nothing else changes. The tenancy associations call it half a reform and take it." }
  ]},

/* THE COURTS (bible 10.8). Emulated judges who personally remember the
   founding, and reclassification as a branch of practice rather than a
   question of fact. The Tribunal exists if the player established it. */
{ id:"the_old_judge", chapter:2, weight:71, once:true,
  title:"The judge who remembers",
  speaker:"fenwick",
  body:`The presiding judge of the Tribunal was emulated in 2249 and has sat
continuously since. She remembers the founding arguments as arguments, which is
to say she was in the room for some of them.

She has asked the Minister for Law for a reference on a narrow point: whether
reclassification, the practice of moving a person between legal categories, is
a question of fact for the courts or a branch of professional practice for the
licensing boards.

"The boards certify the work," Fenwick says. "She is asking who owns the
question. If it is the boards, the courts will not see a reclassification case
again."`,
  choices:[
    { label:"Refer it to the boards. They know the practice",
      note:"A reference to the boards keeps the question where the expertise is " +
           "and keeps the courts out of a technical argument. It also hands the " +
           "boards the power to decide what a person is.",
      effects:[{ flag:"reclassification_to_boards" },
               { move:{ "actor.lb_legal": -6 } },
               { move:{ "loyalty.gb": 6 } }, { move:{ "loyalty.rv": -4 } },
               { move:{ "public_standing": -2 } },
               { wire:"RECLASSIFICATION REFERRED TO THE LICENSING BOARDS" }],
      result:"The reference goes to the boards, which will report in their own time. The judge notes the answer and does not comment on it." },
    { label:"It is a question of fact, and the courts will hear it",
      note:"The courts keep the question. The boards lose it, and the Guild will " +
           "read the reference as the government saying so.",
      effects:[{ flag:"reclassification_to_courts" },
               { move:{ "actor.lb_legal": 7 } }, { move:{ "rel.gb_chair": -5 } },
               { move:{ "loyalty.rv": 5 } }, { move:{ "loyalty.gb": -5 } },
               { wire:"RECLASSIFICATION IS A QUESTION OF FACT FOR THE COURTS" }],
      result:"The judge has her jurisdiction and the boards have a grievance. The first reclassification case is listed for next session." }
  ]},

/* CONSUMABLES (bible 10.1). The agricultural decks, "the emotional centre of
   any station", and the material floor one of the six scalars is named for. */
/* REACH: no gate; always eligible in ch2. */
{ id:"the_agricultural_deck", chapter:2, weight:66, once:true,
  title:"The deck at Harvest",
  speaker:null,
  body:`The number one agricultural deck at Harvest has a root-rot in the protein
vats that the station has been treating for a month without saying so. The
treatment is holding. The replacement is a keel-level refit that takes the deck
out of production for eleven weeks.

The station's closing ratio is 0.44. Every station in the middle band is
watching what the Commonwealth does about a deck it cannot feed itself from.`,
  choices:[
    { label:"Fund the refit and carry the station's shortfall",
      note:"Eleven weeks of buying in what the deck cannot grow, paid out of the " +
           "same vote that funds everything else. The middle band will read it " +
           "as the Commonwealth being willing to carry a deck.",
      effects:[{ move:{ "solvency": -7000 } }, { move:{ "consumables": 6 } },
               { station:{ wickstead:{ closure: 0.05 } } },
               { move:{ "public_standing": 5 } },
               { wire:"COMMONWEALTH FUNDS HARVEST DECK REFIT; SHORTFALL CARRIED" }],
      result:"The refit is funded and the deck comes back in three months better than it went in. The station's ratio rises with it, which is the part that will be read on the other forty." },
    { label:"Treat it where it stands and say nothing",
      note:"A holding treatment and a quiet quarter. Cheaper now, and the deck " +
           "is one bad month from the same emergency with a larger bill.",
      effects:[{ move:{ "consumables": -5 } }, { move:{ "solvency": 2000 } },
               { move:{ "loyalty.hul": -4 } },
               { queue:[{ event:"the_deck_again", after:5 }] },
               { wire:"HARVEST DECK HELD WITH TREATMENT; NO REFIT FUNDED" }],
      result:"The treatment holds for the quarter. The station's engineers file a second estimate and file it quietly." }
  ]},

/* REACH: queued by the_agricultural_deck's 'treat it where it stands' choice. */
{ id:"the_deck_again", queuedOnly:true, once:true,
  title:"The deck again",
  speaker:null,
  body:`The protein vats at Harvest have failed. The station is buying in the
whole of its protein from the low band, and the low band has noticed what its
own prices are doing.

The second estimate is larger than the first by the cost of the quarter spent
treating vats that were going to fail.`,
  choices:[
    { label:"Fund the refit now, at the second estimate",
      effects:[{ move:{ "solvency": -11000 } }, { move:{ "consumables": 5 } },
               { station:{ wickstead:{ closure: 0.04 } } },
               { move:{ "public_standing": 2 } },
               { wire:"HARVEST REFIT FUNDED AT THE SECOND ESTIMATE" }],
      result:"The deck comes back. Nothing about the bill is read as a triumph, which the station expected." },
    { label:"Carry the shortfall and defer the refit again",
      effects:[{ move:{ "consumables": -8 } }, { station:{ wickstead:{ suspended: 900 } } },
               { move:{ "public_standing": -6 } }, { move:{ "loyalty.hul": -8 } },
               { wire:"HARVEST BUYS IN ALL PROTEIN; DECK REFIT DEFERRED" }],
      result:"Nine hundred of the station's residents come off the deck's payroll and onto the register. The middle band draws its conclusion." }
  ]},

/* CONGREGATIONS (bible 10.9, LOCKED and thin: the section that named the
   CDA). A cross-confessional bloc of non-recognisers, economically left and
   culturally immovable, whose objection is to reclassification itself. */
/* REACH: no gate; always eligible in ch2. */
{ id:"the_congregations", chapter:2, weight:60, once:true,
  title:"The rented hall",
  speaker:"marin",
  body:`The Congregational Democratic Alliance does not meet in a cathedral. It
meets in fourteen rented halls across the low and middle bands, and its
congregations are not one confession. They are the people who do not recognise
a reclassification, in the way that a pacifist does not recognise a war.

They have sent Marin with one question, in writing. Whether the Commonwealth
intends to require an attestation of the register for a marriage, a burial or a
school place.

"It is not a franchise question to them," she says. "It is a question about
what a body is, and they will lose an election before they will answer it your
way."`,
  choices:[
    { label:"Say no. The register is not required for any of the three",
      note:"A written answer that costs nothing and buys the congregations " +
           "without touching the bill. It commits the government on a point the " +
           "Registry has not conceded.",
      effects:[{ flag:"congregations_answered" },
               { move:{ "loyalty.rv": 9 } }, { move:{ "actor.lb_legal": -3 } },
               { move:{ "public_standing": 3 } },
               { wire:"REGISTER NOT REQUIRED FOR MARRIAGE, BURIAL OR SCHOOLING" }],
      result:"Marin takes the answer to the fourteen halls. The Registry notes, without objecting, that the question is not the law's to settle for long." },
    { label:"Leave it to the register. Attestation is attestation",
      note:"The Registry's position, said out loud. The congregations lose the " +
           "answer and gain a grievance they are extremely good at keeping.",
      effects:[{ flag:"congregations_refused" },
               { move:{ "loyalty.rv": -12 } }, { move:{ "loyalty.psa": 4 } },
               { move:{ "actor.lb_legal": 4 } }, { move:{ "public_standing": -4 } },
               { wire:"GOVERNMENT LEAVES THE SACRAMENTS TO THE REGISTER" }],
      result:"The congregations are told that the register applies. Fourteen halls hear it on the same evening, and the CDA's conference has a reason to meet early." }
  ]},

/* ===========================================================
   PAIRING (design/26 #83). A pair sends one member of each side home
   together. Under a majority OF THE MEMBERS it is never arithmetic: it
   costs the government an aye and costs the other side a nay the
   threshold never counted, so the bar does not move. It can only ever be
   a courtesy, and a courtesy needs a reason before the control that
   offers it is worth a row of the tightest column on the screen. This is
   the reason. The control appears in the whip panel the moment the offer
   is made, and says plainly what it costs.
   =========================================================== */

/* REACH: no gate; always eligible once ch2 opens. */
{ id:"the_pairing_offer", chapter:2, weight:59, once:true,
  when:{ flagsAbsent:["pair_offered"] },
  title:"A pair, for the member for Hardie",
  speaker:"okarie",
  body:`One of the Liberals is going under for a reabsorption on Thursday, and
the division is set for the same afternoon. He cannot attend and his whips
cannot make him. His whip has come to Okarie, which he has not done in two
years.

"A pair sends one of ours home with one of theirs," Okarie says. "It costs us a
vote and it costs them one, and the bar does not move for either. It is not a
favour. It is a kindness, and it is the kind of thing that is remembered when
we want something that is not arithmetic."`,
  choices:[
    { label:"Grant the courtesy.",
      note:"The control is in the whip panel on the Chamber tab, under the " +
           "whip. Pairing one of yours with one of theirs costs an aye and " +
           "buys the other side's goodwill. The arithmetic does not improve, " +
           "which is exactly the point of doing it.",
      effects:[{ flag:"pair_offered" }, { move:{ "rel.okarie":4 } },
               { move:{ "loyalty.cu_loyalists":2 } },
               { wire:"GOVERNMENT WHIPS AGREE TO A COURTESY PAIR FOR THURSDAY'S DIVISION" }],
      result:"Okarie passes it to the other side without comment, which is how a thing like this is done." },
    { label:"No. Every vote counts and their side knows it.",
      effects:[{ move:{ "rel.okarie":-5 } }, { move:{ "loyalty.cl":-5 } },
               { move:{ "public_standing":-3 } },
               { wire:"GOVERNMENT REFUSES A COURTESY PAIR; THE BENCHES NOTE IT" }],
      result:"The refusal is within the rules, and everyone on the other side now knows where the government stands on a small thing." }
  ]},

/* REACH: the flag is set by the pairing control in the whip panel (a UI action), not by content. */
{ id:"the_pairing_kept", chapter:2, weight:56, once:true,
  when:{ flags:["paired"] },
  title:"The kindness, remembered",
  speaker:null,
  body:`The member came back from the reabsorption on the Tuesday, and the
division that had gone to a pair passed without him on either side of it. The
whips on the other side have not mentioned it.

They have mentioned it to their benches, which is where a kindness actually
gets banked.`,
  choices:[
    { label:"Leave it. A courtesy is not an invoice.",
      effects:[{ move:{ "loyalty.cl":4 } }, { move:{ "public_standing":3 } },
               { wire:"THE COURTESY PAIR IS BANKED AND NOT MENTIONED" }],
      result:"Nothing is asked for and something is owed. It sits where such things sit." },
    { label:"Ask for their benches on the next division.",
      effects:[{ move:{ "loyalty.cl":-5 } }, { move:{ "public_standing":-2 } },
               { wire:"GOVERNMENT CALLS IN THE PAIR; THE OTHER SIDE PRICES IT" }],
      result:"The favour is spent, and the other side now knows the government's kindnesses have a price. That makes them cheaper to refuse next time." }
  ]},

/* ===========================================================
   THE TRIBUNAL (design/30). The bench that hears what the orders do.
   It is an ACTOR, so its disposition is moved by the existing verb and
   nothing new was added: `move:{"actor.tribunal":n}`. A case is a QUEUED
   EVENT with a label, so the calendar already carries it and the Papers
   panel reads the same queue. No randomness: a ruling is a condition on
   the state, like every other mechanic here.
   =========================================================== */

/* THE REFERENCE. The judge who remembers asked the government a question it
   has not answered. Answering it costs order-paper time and binds the
   government to its own answer; ignoring it is free and the bench remembers. */
/* REACH: take 'it is a question of fact' in the_old_judge, which sets reclassification_to_courts. */
{ id:"tr_reference", chapter:2, weight:68, once:true,
  when:{ flags:["reclassification_to_courts"], flagsAbsent:["tr_referenced"] },
  title:"The reference",
  speaker:"fenwick",
  body:`The Tribunal has put its question in writing, which it does about once
a decade. Reclassification, the practice of moving a person between legal
categories, is either a question of fact for the courts or a branch of
professional practice for the licensing boards. The bench will proceed on
whichever answer the government gives, and until it is given the bench will
proceed on its own.

"It is four paragraphs," Fenwick says. "Answering it takes a day and settles
it for a generation. Not answering it takes no time at all, and settles
nothing."`,
  choices:[
    { label:"Answer it, in full, on the record.",
      cost:{ slot:1 },
      note:"A day of order-paper time and the government is bound by its own " +
           "answer for the rest of the campaign. The bench will read every " +
           "later order in the light of it.",
      effects:[{ flag:"tr_referenced" }, { flag:"reference_answered" },
               { move:{ "actor.tribunal":10 } }, { move:{ "legitimacy":4 } },
               { wire:"GOVERNMENT ANSWERS THE TRIBUNAL'S REFERENCE IN FULL" }],
      result:"The answer is four paragraphs, it is on the record, and it is now the government's position whether the government likes it or not." },
    { label:"Let it lie. The bench can proceed on its own.",
      effects:[{ flag:"tr_referenced" }, { flag:"reference_ignored" },
               { move:{ "actor.tribunal":-12 } }, { move:{ "legitimacy":-3 } },
               { wire:"GOVERNMENT DECLINES TO ANSWER THE TRIBUNAL'S REFERENCE" }],
      result:"Nothing is answered. The bench notes the date it asked and the date nothing came back, which is the sort of thing a bench keeps." }
  ]},

/* THE CHALLENGE. The opposition does not need a majority to hurt an order, it
   needs counsel. An order the government made is challenged in the Tribunal. */
/* REACH: SI 2287/44 in force. */
{ id:"tr_challenge_lodged", chapter:2, weight:66, once:true,
  when:{ siInForce:["si_2287_44"], flagsAbsent:["tr_challenged"] },
  title:"The order is challenged",
  speaker:"fenwick",
  body:`The Liberals have taken the licensing order to the Tribunal. The
argument is narrow and it is not about licensure: it is that the order was made
under a power the Act of Union reserved to the boards, and that a minister may
not exercise a board's jurisdiction by order.

"The bench will hear it in four sittings," Fenwick says. "We can brief counsel
or we can let it run. If we brief it, we are in a courtroom arguing with the
government's own name on it. If we do not, the order will be read by people who
heard one side."`,
  choices:[
    { label:"Brief counsel. The order is worth defending.",
      note:"A proper defence costs attention and it is heard. A court is not a " +
           "lobby: the numbers in the House do not reach it, and the only thing " +
           "that moves the bench is whether the government turned up.",
      effects:[{ flag:"tr_challenged" }, { flag:"tr_defended" },
               { move:{ "actor.tribunal":4 } }, { move:{ "legitimacy":2 } },
               { queue:[{ event:"tr_ruling", after:4,
                          label:"The Tribunal rules on the licensing order" }] },
               { wire:"COMMONWEALTH BRIEFS COUNSEL AGAINST THE CHALLENGE TO THE LICENSING ORDER" }],
      result:"Counsel is briefed and the case is listed for the fourth sitting. The order stands until the bench says otherwise." },
    { label:"Let it run. The order was lawfully made.",
      note:"No defence, and no cost. The bench will hear the challenge alone, " +
           "which is a thing a bench notices about a government that is certain " +
           "and uninterested.",
      effects:[{ flag:"tr_challenged" }, { flag:"tr_undefended" },
               { move:{ "actor.tribunal":-6 } }, { move:{ "public_standing":-2 } },
               { queue:[{ event:"tr_ruling", after:4,
                          label:"The Tribunal rules on the licensing order" }] },
               { wire:"GOVERNMENT DECLINES TO DEFEND THE LICENSING ORDER; CASE HEARD ONE SIDE" }],
      result:"The case is listed and nobody appears for the government. The bench hears it in an hour." }
  ]},

/* THE RULING. Three doors, disjoint, and every one of them openable: an order
   struck, an order narrowed, and an order upheld. Which door is open is a
   condition on the bench's disposition, which the government has been moving
   all session by whether it answered, briefed, complied and revoked. */
/* REACH: queued by either choice of tr_challenge_lodged. */
{ id:"tr_ruling", queuedOnly:true, once:true,
  title:"The ruling",
  speaker:null,
  body:`The Tribunal hands down its judgment at the start of the sitting, and the
court's own record runs to eleven pages. The last page is the order.`,
  choices:[
    { label:"The order is struck.",
      when:{ actorBelow:{ tribunal:46 } },
      effects:[{ flag:"tr_struck" }, { flag:"licensing_order_struck" },
               { move:{ "actor.tribunal":-4 } }, { move:{ "legitimacy":-5 } },
               { wire:"TRIBUNAL STRIKES THE LICENSING ORDER; THE GOVERNMENT MAY REVOKE OR DEFY" }],
      result:"The order is unlawful as made. It stays on the book until the government revokes it or refuses to, and refusing is a decision the bench will record." },
    { label:"The order is read narrowly.",
      when:{ actorAbove:{ tribunal:45 }, actorBelow:{ tribunal:58 } },
      effects:[{ flag:"tr_narrowed" }, { flag:"licensing_order_narrowed" },
               { move:{ "actor.tribunal":2 } },
               { wire:"TRIBUNAL READS THE LICENSING ORDER NARROWLY, WITHIN THE BOARDS' JURISDICTION" }],
      result:"The order stands and does less. The carve-out reaches the panel's own members and nobody the board did not already licence." },
    { label:"The order stands.",
      when:{ actorAbove:{ tribunal:57 } },
      effects:[{ flag:"tr_upheld" }, { move:{ "actor.tribunal":3 } },
               { move:{ "legitimacy":3 } }, { move:{ "public_standing":2 } },
               { wire:"TRIBUNAL UPHOLDS THE LICENSING ORDER" }],
      result:"The judgment runs long on the government's competence to make the order and short on everything else. The order stands as made." }
  ]},

/* ===========================================================
   THE NAMES ON THE PAPER (design/08 §2, design/26 #11). The
   leadership ballot needs twelve signatures and content could
   supply five, so it could not fire in any run. The paper is a
   MEMBER-level thing now: `Engine.signableMembers` walks the
   player's own benches and offers the ones closest to signing,
   and `collectSignature` takes one at a time. Czarnecki's group
   is the natural mover, and the panel is in his corner.
   =========================================================== */

/* REACH: cu_halloran loyalty below 26; his bloc drifts away. */
{ id:"the_paper", chapter:2, weight:73, once:true,
  when:{ loyaltyBelow:{cu_halloran:26}, flagsAbsent:["paper_opened"] },
  title:"The paper",
  speaker:"halloran",
  body:`Czarnecki has a sheet of paper and four names on it, and he has stopped
pretending it is not a sheet of paper. He puts it on the desk between you and
says the only thing he has come to say.

"Every name on this is a member who has decided the party would be better run
by somebody else, and every one of them has a reason you gave them. You can go
and ask them. Some will sign to your face because they are brave, or because
they are finished with you, or because they want you to know."

"Twelve and I am the leader of the opposition," he says. "Eleven and I am a
man with a list."`,
  choices:[
    { label:"Open the paper. Let them come and say it.",
      note:"The names are collected one member at a time in the whip panel, on " +
           "the Chamber tab, under the whip. A minister will not sign and a " +
           "loyal member will not; the ones who will are the ones closest to " +
           "the door, and every signature is a member you have lost.",
      effects:[{ flag:"paper_opened" }, { move:{ "rel.halloran":3 } },
               { move:{ "loyalty.cu_loyalists":-3 } },
               { wire:"CZARNECKI'S PAPER IS ON THE DESK; MEMBERS SAY WHETHER THEY WILL SIGN" }],
      result:"He leaves the sheet. The first name is on it before the afternoon, and it is not a name you would have guessed." },
    { label:"Refuse to dignify it. He has four names.",
      effects:[{ move:{ "rel.halloran":-6 } }, { move:{ "loyalty.cu_halloran":-4 } },
               { move:{ "loyalty.cu_maintenance":-3 } },
               { wire:"PM DECLINES TO DISCUSS CZARNECKI'S LIST" }],
      result:"Nothing is opened and nothing is answered. The sheet stays in his pocket, which is where a list of four names ought to be, and he collects the rest in his own time." }
  ]},

/* ============================================================
   THE SANDBOX TEST CONSOLE (T26)

   Not a scene. The Sandbox government in content/setup.js opens with a
   solvency no real campaign can earn; these two events read that value to
   know they are in the sandbox, then live on the QUEUE so a tester can
   stack controls without the weighted pool ever interfering.

   `test_console_open` fires once and opens the list. `test_console` is the
   list: every control sets state directly and re-queues the list, so a
   station question, an annexation, a carried or defeated threshold bill, a
   tribunal, a federal schedule, a sanction, a drained reserve or a forced
   fall can each be reached without playing the session that would have
   reached it. The last control closes the list.

   NOTHING HERE IS REACHABLE IN FLASH I. The opening gate is
   `solvency > 900000`, which no real opening or earning reaches;
   `test_mode` is only ever set by the opener. ============================================================ */

{ id:"test_console_open", weight:500, once:true,
  when:{ scalarAbove:{ solvency:900000 }, flagsAbsent:["test_mode"] },
  title:"Test console",
  speaker:null,
  body:`SANDBOX ONLY. This is the testing console, not a scene. The choices
opened from it set state directly, so a branch can be tried without playing the
session that would have reached it.

It is gated on an opening solvency the real campaign cannot earn, so it never
appears in Flash I.`,
  choices:[
    { label:"Open the test console.",
      effects:[{ flag:"test_mode" },
               { queue:[{ event:"test_console", after:1, label:"Test console" }] }],
      result:"The console is open. Its controls are the next thing on the order of the day." }
  ]},

{ id:"test_console", queuedOnly:true,
  when:{ flags:["test_mode"] },
  title:"Test console",
  speaker:null,
  body:`SANDBOX ONLY. Choose a control. The list is the same one the Sandbox tab
shows; every control but the last re-opens it on the next sitting, so they can
be stacked, and closing it hands the sitting back to the pool.`,
  choices: SANDBOX.map(c => ({
    label: c.label,
    note: c.note,
    effects: (c.effects || []).concat(c.close
      ? []
      : [{ queue:[{ event:"test_console", after:1, label:"Test console" }] }]),
    result: c.result
  }))}

];
