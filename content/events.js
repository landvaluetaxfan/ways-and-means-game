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
   in js/ui.js and the queued test_console event. Content owns the
   effects; the tab and the event are only two ways to press them. The event
   is Flash I's sandbox console, in content/campaigns/flash_i/events.js. `close`
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
             { bill:{ annexation:{ stage:"first_reading" } } }, { slots:{ reserve:{ annexation:5 } } },
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
    note:"Makes SI 2080/44 in force and offers the carve-out flag.",
    result:"The order is in force, which opens its reaction and the challenge at the tribunal.",
    effects:[{ si:"si_2080_44" }, { flag:"licensure_carveout_offered" },
             { wire:"SANDBOX: THE LICENSING ORDER IS IN FORCE" }] },
  { id:"friction", label:"Push friction toward a sanction",
    note:"Raises friction and drops legitimacy.",
    result:"The couplings begin to bite and the freeze event comes into reach.",
    effects:[{ move:{ friction:40 } }, { move:{ legitimacy:-10 } },
             { wire:"SANDBOX: FRICTION IS PUSHED UP" }] },
  { id:"drain", label:"Drain the reserve",
    note:"Drops the reserve under CW$30bn.",
    result:"The reserve is under CW$30bn, so the emergency loan and the low-reserve events are in reach.",
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

/* THE COMMISSION — prologue 1, and the reason the sequence starts here.

   It used to open on a political editor catching the Prime Minister by a
   lift. The author's note: a journalist haranguing the PM alone is not very
   romantic or wide in scope, and Flash assuming office should feel
   consequential. It should, and the polity has exactly the right instrument
   for it. Bible §3.3: in a patchwork of stations with no shared territory
   the presidency is the only office elected by everyone, and it is the thing
   that symbolically holds the union together.

   So the game opens where the union is: the capital that is nobody's
   constituency, and the one person all 7,086,000 voted for, handing her a
   government he does not expect to last. The arithmetic in his mouth is the
   real arithmetic — 142 of 280, a majority of one, six of them independents
   on confidence and supply — measured against the roll rather than written
   for the scene.

   This decides the PRESIDENT, and the choice the player meets next decides
   HER. Two different axes on purpose: he holds dissolution, referral and
   appointments, and a relationship that starts at 22 is the one that later
   refuses her a snap election. */
{ id:"the_commission", prologue:1, once:true,
  /* THE CAMPAIGN'S OWN NAME, carried on the first sitting's header rather
     than a scene label. Moved here from the_account when that stopped being
     the first thing the player reads. (Alternatives the author was offered:
     A Defiance of Odds \u00b7 The Arithmetic of Confidence \u00b7 Steady Hands and
     Unread Minutes \u00b7 The Fourth Session \u00b7 One for You, One for Me \u00b7
     Why You? \u00b7 The Winter Garden.) */
  title:"Adriana Eireann Flash \u2014 The Edge of History",
  speaker:"tenaya",
  body:`The capital was put in the Winter Garden because the Winter Garden is
nobody's constituency. It belongs to all thirty stations and returns one
member who cannot vote. A river
runs from the cold end to the warm. The congress hall where the Charter was
signed stands on the hill at the middle of it. The Earth legations are sealed
along the water in pieces of their own worlds, and the walk from the lift to
this room passes six climates in a mile.

Jaco van Ryneveld was elected by seven million and eighty-six thousand people
across thirty habitats that share no air, no soil and no horizon. It is the
only office every voter in the Commonwealth votes for. He took it as an
independent, with 51.4 per cent, and he owes you nothing at all.

The commission is on the desk in front of him. He has not moved it.

"Two hundred and eighty seats," he says. "You can show me a hundred and
forty-two. That is a majority of one, and six of the hundred and forty-two
are independents who have undertaken to keep you alive and nothing beyond it.

"I am obliged to send for whoever can hold the House. I am not obliged to
expect it to hold. Tell me what you mean to do with it, and I will put the
date on this."`,
  choices:[
    { label:"The personhood bill. It is why there is a government at all.",
      act:"Tell him",
      note:"The honest answer, and the one your largest partner joined for. " +
           "The maintenance benches hear their wages named second.",
      effects:[{ flag:"commission_bill" },
               { move:{ "rel.president":4 } },
               { move:{ "loyalty.psa":8 } },
               { move:{ "loyalty.cu_maintenance":-5 } },
               { wire:"PM TELLS PRESIDENT THE DIVERGENCE BILL COMES FIRST" }],
      result:"He writes the date and signs under it. Your largest partner has what it joined for, in the President's minute, before the House has sat once." },

    { label:"The stations. Three of them are under reserve this morning.",
      act:"Tell him",
      note:"He is the office the small habitats elected to be heard by. " +
           "Your partner joined this government for the bill, and is listening.",
      effects:[{ flag:"commission_stations" },
               { move:{ "rel.president":8 } },
               { move:{ "loyalty.cu_maintenance":6 } },
               { move:{ "loyalty.psa":-6 } },
               { move:{ public_standing:3 } },
               { wire:"PM PUTS LIFE SUPPORT AHEAD OF THE BILL IN FIRST MEETING" }],
      result:"He signs it without reading it again. Thirty stations elected him and four of them have been below reserve in his term; he has wanted a Prime Minister to say that first for three years." },

    { label:"I intend to last. You will hear what I am doing when I do it.",
      act:"Tell him",
      note:"Nobody's creature, and nothing conceded in the first hour. " +
           "He keeps dissolution, referral and every appointment.",
      effects:[{ flag:"commission_none" },
               { move:{ "rel.president":-6 } },
               { move:{ "loyalty.cu_loyalists":7 } },
               { move:{ public_standing:-2 } },
               { wire:"PRESIDENT AND PRIME MINISTER MEET; NEITHER OFFICE COMMENTS" }],
      result:"He puts the date on it and says nothing else. He keeps dissolution, bill referral and the refusal of an appointment, and he now knows he will be told about each of them afterwards." }
  ]},

{ id:"the_account", prologue:2, once:true,
  /* The campaign's name moved to the_commission, which is the first thing
     the player reads now; this takes "Why you?" from the same list of
     alternatives the author was offered, because that is what the scene is. */
  title:"Why you?",
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
  body:`Thirty stations carry it live. On the ring it is the middle of a working
shift; on the outer habitats they have held the change over to watch it. This
is the first thing most of the Commonwealth will ever hear you say, and the
lobby has given the first question to The Spindle.

Ivor Ceyhan does not look at his notes.

"Prime Minister. You inherit a majority of one, a bill you did not write, and
a party that has spent thirty years arguing with itself about what it is for.
Before anything else: why you?"

It is the only question of the morning you get to answer twice: once now, and
once for the rest of it. The record is the record. What is not yet settled is
which part of it you intend to be known for.`,
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
      note:"You claim the movement's inheritance. It is the line the Trades Left " +
           "will carry into every meeting for a year, and the line your partners will " +
           "ask you to clarify before the week is out.",
      effects:[{flag:"led_on_continuity"},
               {move:{"loyalty.cu_maintenance":11}},
               {move:{"loyalty.cu_loyalists":4}},
               {move:{public_standing:-4}},
               {move:{"loyalty.psa":-5}},
               {wire:"PM CLAIMS THE MOVEMENT'S INHERITANCE; PARTNERS SEEK CLARIFICATION"}],
      result:"The Trades Left will carry that sentence into every meeting for a year. So will the New Progressive Party, in a different tone, and the bill you inherited is about wages whichever way you look at it." },

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

{ id:"briefing_divergence", prologue:3, once:true,
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

{ id:"gb_approach", prologue:8, once:true,
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
      note:`The threshold moves and licensure does not. That is what the panel asked for. It buys the chair's goodwill and the Substrate Left's fury, and it puts a promise on the order paper with a date.`,
      /* MECHANICAL PLACEHOLDER, opencode's to reword: the undertaking's
         `text` is the line the order paper carries and the wording is
         prose. The shape is right — this choice is a promise made to a
         named person who will notice — but the sentence is engineering. */
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":12}},{move:{"loyalty.gb":6}},{move:{"loyalty.psa":-9}},
               {undertake:{ id:"licensure_carveout",
                            text:"Lay the licensing order carrying the carve-out",
                            owed_to:"gb_chair", by:4,
                             discharge:{ si:"si_2080_44" },
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

{ id:"halloran_signatures", prologue:5,
  when:{ loyaltyBelow:{cu_halloran:20}, flagsAbsent:["halloran_confronted"] },
  title:"Twelve signatures",
  speaker:"halloran",
  body:`The number is not a secret. Everyone in the tea room can count, and the
count that matters is twelve: the names it takes to force a ballot. Czarnecki has
spent three weeks not getting them, which means either he cannot or he is waiting.

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
    { label:"Offer him a junior ministry and the silence that comes with it",
      note:"An office buys the leader and not the group. The members who followed him " +
           "are left with a grievance and nobody to carry it into the chamber.",
      effects:[{move:{"loyalty.cu_halloran":14}},{move:{"party_loyalty":4}},{move:{"public_standing":-3}},
               {flag:"halloran_confronted"},{flag:"halloran_bought"},
               {wire:"CZARNECKI TIPPED FOR OFFICE; ASHFIELD DELEGATION SEEKS ASSURANCES"}],
      result:"He takes it. His group does not all follow him, and the ones who don't now have a grievance and no leader." },
    { label:"Refuse. He does not have twelve and you both know it.",
      note:"You keep the office and the money. He goes looking for the names, and " +
           "gives himself four sittings to find them.",
      effects:[{move:{"loyalty.cu_halloran":-11}},{move:{"loyalty.cu_maintenance":-6}},{move:{"party_loyalty":-6}},
               {flag:"halloran_confronted"},{queue:[{event:"halloran_finds_nine",after:4}]}],
      result:"\"No,\" he agrees. \"Not today.\"" }
  ]},

{ id:"halloran_finds_nine", queuedOnly:true, once:true,
  title:"He found them",
  speaker:"halloran",
  body:`Four of his names are revenants: members returned on the list after losing
a district, who owe their seats entirely to the party and were therefore supposed
to be unbuyable. They have worked out that a leadership change reorders the list,
and that a list can be reordered upward as easily as down.

The ballot is called for the week after next.`,
  choices:[
    /* THE BALLOT IS CALLED, AND NOW IT IS HELD (design/38 §3). This set
       `leadership_ballot_called`, which nothing read, so the week after next
       came and went with the paper where it was. The names go on the paper
       eight sittings out and the engine holds the ballot the sitting after,
       decided by how the benches feel about her then: the Party tab carries
       the count, and the time between is the fight. */
    { label:"Fight it. Put the whole cabinet on broadcast.",
      note:"The ballot is held the week after next and decided by the benches' loyalty " +
           "on the day. The Party tab has the count; below half, she loses the leadership.",
      effects:[{move:{"party_loyalty":-4}},{move:{"public_standing":-5}},
               {flag:"leadership_ballot_called"},
               {queue:[{ effects:[{ signatures:12 }], after:8,
                         label:"Czarnecki's names are on the paper, and the caucus will divide." }]},
               {wire:"LEADERSHIP BALLOT CALLED; CABINET DECLARES FOR FLASH"}],
      result:"It becomes a public argument about whether your party believes what it says it believes." },
    { label:"Concede the shed order and the personhood line in one go",
      effects:[{move:{"loyalty.cu_halloran":30}},{move:{"loyalty.cu_maintenance":12}},{move:{"loyalty.psa":-20}},
               {move:{"party_loyalty":12}},
               {bill:{divergence:{stage:"withdrawn",dead:true}}},
               {wire:"THRESHOLD BILL WITHDRAWN; SUBSTRATE LEFT REVIEWS COALITION"}],
      result:"You keep the leadership. The New Progressive Party meets tonight without you." }
  ]},

{ id:"vantage_radiator", prologue:6,
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
      result:"The fault does not clear." },
    /* THE LADDER, MET INSIDE A DECISION (design/38 §7). Three playtest
       strategies cascaded because the emergency orders were on the
       Government tab and nowhere else. The first rung is offered here, where
       the margin first bites, and the order it lays is the one the docket
       then points past. Appended, so no existing choice changes its place. */
    { label:"Issue a conservation appeal to every station",
      when:{ siNotMade:"rung1_conservation" },
      note:"The first of the emergency orders, and the cheapest: SI 2080/61 asks every " +
           "station to draw down non-essential load, and Ember Ridge gets the headroom. " +
           "The rest of the ladder is on the Government tab, each rung dearer than the last.",
      effects:[{si:"rung1_conservation"},{flag:"vantage_handled"}],
      result:"The appeal goes out under the Minister's name. The margin improves a little, Ember Ridge holds, and the next order on the ladder is one the House will argue about." }
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
a four-minute window. The Registry flagged the cluster and took no further action. Flagging is the entire power the statute gives it.

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

{ id:"the_order_of_the_day", prologue:4,
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
      note:`The Chief Whip explains the day once, in the hour before it begins. It costs you nothing and buys his confidence for the session.`,
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":6 } }, { move:{ "loyalty.cu_loyalists":3 } }],
      result:`He names the mover of each item and what each mover wants back. It is the same list every sitting. He will not walk it with you again.` },
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

{ id:"the_whip_list", prologue:7,
  when:{ flagsAbsent:["whip_briefed"] },
  title:"The list",
  speaker:"okarie",
  body:`The bill is called this session or the next, and the Chief Whip has come
with one sheet. It has the members who are with the government, the members who
are not, and the members who have not decided. He reads the third column.

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

The consequence arrives as a shed order, posted at 06:00: Ashfield, tier four,
a further eleven hundred, effective next sitting. No vote authorised it and none
was needed. The substrate price rose, nothing in the appropriation brought it
down, and the order follows from the Act.

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
      result:`The signal reaches the stations that cannot pay it first.` },
    /* and the next rung, whichever of the first two it is (design/38 §7) */
    { label:"Ask the stations to draw down load instead",
      when:{ siNotMade:"rung1_conservation" },
      note:"SI 2080/61, the first emergency order. It costs almost nothing and buys " +
           "almost nothing, and it is the first of nine.",
      effects:[{si:"rung1_conservation"},{flag:"thermal_squeeze_seen"}],
      result:"The appeal goes out, the stations shed what they can spare, and the exchange notices a little less heat to price." },
    { label:"Slow the emulated clocks for the duration",
      when:{ flags:["rung1_tried"], siNotMade:"rung2_clockrate" },
      note:"SI 2080/62, the second emergency order. It slows the emulated blocs by four " +
           "per cent, which buys margin out of the patience of the people who run fastest.",
      effects:[{si:"rung2_clockrate"},{flag:"thermal_squeeze_seen"}],
      result:"The clocks slow, the margin widens, and the Substrate Left calls it a wage cut, which it is." }
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

The Treasury can still borrow. Earth's banks will honour a drawing on the
Standby Facility until the reserve falls under the covenant, and the
Underwriters will take a series of notes while the thermal margin holds. Each
costs what the quarrel or the margin says it costs. What there is besides is
the option of not paying for something the Commonwealth has already promised to
pay for.`,
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
      result:`It is a bet that the bill comes due to somebody else.` }
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
  /* Was `flags:["minister_resigned"]`, which nothing set. The prose already
     says what the gate should be — "a promise was made in that minister's
     name and the promise was not kept" — and a broken undertaking is real
     state the engine keeps. The carve-out is the promise made in the Life
     Support minister's name, so breaching it is what produces this letter.
     Still `once`: the gate names one undertaking and an undertaking breaks
     once, so a second firing was never possible to begin with. */
  when:{ breached:["licensure_carveout"] },
  title:"A resignation",
  speaker:null,
  body:`The letter is on the desk before the morning brief, which is how these
things are arranged: the minister told the paper, the paper called the office,
and the office said nothing.

A promise was made in that minister's name and the promise was not kept, and a
minister who will not resign for that is resigned for. The letter closes the
account. The post is vacant, and a department with no holder cannot make an
order until somebody is appointed to it.`,
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
  body:`The panel met on Thursday, which is when it always meets, and the answer it agreed is the one the sector has given every government since 2072.

"Nine seats," the chair says, "and not one of them moves for a government that has moved the roll. Count it again if you like. The count will not change."

She is not angry about it. Anger would have been something to work with. She has been doing this longer than the government has existed, and she is telling you what her members will do, not what she thinks of you.`,
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

Every suspension in it was lawful and minuted, made under an order already in
force. The number grew a quarter at a time, at a rate the standing orders
permit, and it will be quoted against the government by the afternoon.`,
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
      result:`Nothing more is said. The sentence stays on the record, where it cannot be amended.` },
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
      result:`The margin widens. The reserve pays for it.` },
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
      effects:[{ cabinet:{ treasury:{ holder:"skye", party:"cu" } } },
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
is for. Six is half the twelve that would force a ballot, and enough to tell the
whips one is within reach. The number is in the lobby the same afternoon.

Ceyhan puts the choice plainly: whether the government means to find out what
the six want, or how many the six can become.`,
  choices:[
    { label:"Meet them. Ask what the letter is really about.",
      effects:[{ move:{ "loyalty.cu_maintenance":7 } }, { move:{ "loyalty.cu_halloran":4 } },
               { move:{ "public_standing":-3 } },
               { wire:"PM MEETS SIGNATORIES OF BACKBENCH LETTER" }],
      result:`Half of them wanted to be asked. That half takes its names back off the paper.` },
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
      result:`Your own benches like it. Hers begin counting what they are owed, and they will present the figure.` }
  ]},

/* REACH: SI 2080/44 in force; the carve-out undertaking discharges it. */
{ id:"the_licensing_reaction", chapter:2, weight:82, once:true,
  when:{ siInForce:["si_2080_44"] },
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
      result:`She expected nothing else. She came in person so the refusal would have a witness.` }
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

He does not wait for an answer. The wording is the line the opposition will
hold at every question time until the government's standing recovers, and the
benches behind him know it and stay seated.`,
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
      result:`The promise is made and written down, and a written promise can be produced later.` },
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

The campaign is a fortnight by law, and the Commonwealth is now in it.
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
campaign is a fortnight and a government that has used its session has
already made its case.`,
  /* THE CAMPAIGN DECIDES THE COUNT NOW (design/38 §1), so every beat has an
     answer that can lose ground. Whether the record carries a government
     is whether the country believes it, which is legitimacy; the two
     "record" choices are one choice seen in two states, and each says
     which it is. */
  choices:[
    { label:"Campaign on the record.",
      when:{ scalarAbove:{ legitimacy:54 } },
      note:"The country believes the record. Running on it puts the government's best argument first.",
      effects:[{ move:{ "public_standing":7 } }, { move:{ "loyalty.cu_maintenance":3 } }],
      result:"The record is what it is, and the country has decided it is worth something." },
    { label:"Campaign on the record.",
      when:{ scalarBelow:{ legitimacy:55 } },
      note:"The country does not believe the record, and the other side will read it back at every stop.",
      effects:[{ move:{ "public_standing":-3 } }, { move:{ "loyalty.cu_maintenance":3 } }],
      result:"The record is read back to the government at every stop, in the other side's voice." },
    { label:"Campaign on the promise of the next session.",
      note:"Safer and smaller. A promise is believed a little, everywhere.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "loyalty.psa":4 } }],
      result:"The promise is newer than the record, which is its only advantage and it uses all of it." },
    { label:"Campaign against the other side.",
      note:"It moves votes now, and it spends the belief the debate will need.",
      effects:[{ move:{ "public_standing":6 } }, { move:{ "legitimacy":-5 } }],
      result:"The campaign becomes an argument about the opposition, which is an argument the government can win this week." }
  ]},

{ id:"ch3_open_question", chapter:3, prologue:2, once:true,
  /* Says nothing was settled, so it plays only where nothing was. A run
     whose crisis resolved skips it until the content round writes the
     campaign that runs on a result. */
  when:{ resolved:false },
  title:"The question on the ballot",
  speaker:null,
  body:`The writs are out and the question the House could not close is now the
country's. Nothing was settled. That is what this election is about, whatever
the parties would rather it were about.

Every candidate is asked the same thing at every door, and every answer is a
position now, because a campaign is where a preference becomes a promise.`,
  /* A government ahead can divide the country on the question and keep
     the larger half; one behind hands the other side its reason. */
  choices:[
    { label:"Make the election about the question.",
      act:"Say it",
      when:{ scalarAbove:{ public_standing:49 } },
      note:"The government is ahead. Dividing the country on the question hardens the larger half.",
      effects:[{ move:{ "public_standing":7 } }, { move:{ "loyalty.psa":5 } },
               { move:{ "loyalty.cu_maintenance":-4 } },
               { wire:"PM PUTS THE OPEN QUESTION AT THE CENTRE OF THE CAMPAIGN" }],
      result:"The country is asked to answer what the chamber would not, and the larger part of it answers with the government." },
    { label:"Make the election about the question.",
      act:"Say it",
      when:{ scalarBelow:{ public_standing:50 } },
      note:"The government is behind. Dividing the country on the question gives the larger half a reason to vote against it.",
      effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.psa":5 } },
               { move:{ "loyalty.cu_maintenance":-4 } },
               { wire:"PM PUTS THE OPEN QUESTION AT THE CENTRE OF THE CAMPAIGN" }],
      result:"The country is asked to answer what the chamber would not, and more of it answers against the government than for it." },
    { label:"Run on the record. Let the question wait.",
      effects:[{ move:{ "public_standing":2 } }, { move:{ "loyalty.cu_maintenance":4 } },
               { move:{ "loyalty.psa":-5 } },
               { wire:"PM CAMPAIGNS ON THE RECORD, NOT THE QUESTION" }],
      result:"The record is what the government did. The question is what it did not, and the other side will name it at every stop." }
  ]},

{ id:"ch3_manifestos", chapter:3, prologue:3, once:true,
  when:{ resolved:false },
  title:"The manifestos",
  speaker:"ceyhan",
  body:`Four documents, published within a day of each other, and none of them
says what it means. Ceyhan reads them the way he reads everything: for the
sentence that was left out.

"You cannot put a question on the ballot and keep the answer off the paper,"
he writes. "Somebody will notice, and it will not be you."`,
  choices:[
    { label:"Print the answer the government would give.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "legitimacy":3 } },
               { move:{ "loyalty.cu_maintenance":-3 } },
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
  /* The hour the country watches together, and the record is on trial in
     it: defended well where it is believed, badly where it is not. */
  choices:[
    { label:"Defend the record.",
      when:{ scalarAbove:{ legitimacy:54 } },
      note:"The country believes the record, and an hour defending it is an hour well spent.",
      effects:[{ move:{ "public_standing":6 } }, { move:{ "loyalty.cu_maintenance":3 } },
               { wire:"PM DEFENDS THE RECORD IN THE LEADERS' DEBATE" }],
      result:"The record is what the government has, and it is defended by the person who made it, in front of everybody." },
    { label:"Defend the record.",
      when:{ scalarBelow:{ legitimacy:55 } },
      note:"The country does not believe the record, and an hour is a long time to defend what it does not believe.",
      effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.cu_maintenance":3 } },
               { wire:"PM DEFENDS THE RECORD IN THE LEADERS' DEBATE" }],
      result:"The record is defended for an hour, and the country watches the government defend what it does not believe." },
    { label:"Attack the other side's answer.",
      note:"It lands, and it spends belief.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "legitimacy":-3 } },
               { move:{ "loyalty.psa":4 } },
               { wire:"PM ATTACKS THE OPPOSITION'S ANSWER IN THE DEBATE" }],
      result:"It lands. It also tells the country what the government is against and not what it is for." },
    { label:"Say what went wrong, and what comes next.",
      note:"The country hears it. The benches hear it too, and some of them were the thing that went wrong.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "legitimacy":4 } },
               { move:{ "party_loyalty":-4 } },
               { wire:"PM CONCEDES MISTAKES IN THE LEADERS' DEBATE" }],
      result:"An admission is the one thing a debate cannot rehearse against, and the other side has nothing prepared for it." }
  ]},

/* THE LAST WEEK IS WHERE, NOT WHETHER (design/38 §1). A band's standing
   moves that band's seats and no other, and the polls on the Sitting screen
   say where the close seats are: the ring has most of the Commonwealth's
   districts and most of its marginals, the low band is the government's own
   ground. It played only where the question was open, and said so; it plays
   for every campaign now. */
{ id:"ch3_the_ground", chapter:3, prologue:8, once:true,
  title:"The last week",
  speaker:null,
  body:`The last week of a campaign is the only part of it anyone remembers.
The parties spend what they have left, and the government spends the record it
has, and both of those run out on the same day.

The count is a week away, and the polls say where it will be decided.`,
  choices:[
    { label:"Put everything into the ring.",
      note:"Most of the Commonwealth's seats are on the ring, and most of the close ones. It costs the reserve.",
      effects:[{ move:{ "standing.ring":9 } }, { move:{ "solvency":-4000 } },
               { wire:"GOVERNMENT SPENDS THE LAST WEEK ON THE RING" }],
      result:"The money goes where the seats are. Whether the seats were there to be had is what the count is for." },
    { label:"Hold the low band.",
      note:"The government's own ground. Its seats are safe until they are not, and then they are the whole majority.",
      effects:[{ move:{ "standing.low":9 } }, { move:{ "loyalty.cu_maintenance":3 } },
               { move:{ "solvency":-2000 } },
               { wire:"GOVERNMENT HOLDS ITS GROUND IN THE LOW BAND" }],
      result:"A campaign that defends is a campaign that thinks it is ahead, and the other side reads it that way." },
    { label:"Spread it across the Commonwealth.",
      note:"Every band a little, for the same money.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "solvency":-4000 } },
               { wire:"GOVERNMENT SPREADS ITS LAST WEEK ACROSS THE COMMONWEALTH" }],
      result:"The campaign is everywhere for a week, which is how a campaign is nowhere for a week." },
    { label:"Keep the money.",
      note:"The reserve is what the next government governs with.",
      effects:[{ move:{ "party_loyalty":2 } },
               { wire:"GOVERNMENT KEEPS ITS MONEY IN THE LAST WEEK" }],
      result:"The reserve is where it was, and the other side's last week is louder." }
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
  /* THE RESULT, NOT THE ANSWER, AND IT OPENS NO CHAPTER. This fired on
     `settled` (the personhood question) and moved the run into chapter
     four, which then ended at the dissolution without a campaign; a run
     that dissolved first never saw it. It fires on the crisis result now
     (bible §3.5.1), while the House still sits, and the aftermath below
     follows it in chapter two (§1.7). The ids keep their `ch4_` prefix
     because the author's prose exports are addressed by them. */
  when:{ resolved:true, dissolved:false },
  title:"The question, closed",
  speaker:null,
  body:`The argument the whole session has been about is closed. Not
paused, not deferred, not carried over: closed, in the form the record
will show for a generation.

The House will do the rest of its business in the shadow of the answer,
which is how a settlement works. What follows is the Commonwealth after it.`,
  choices:[
    { label:"See it.",
      effects:[],
      result:"The argument is closed." }
  ]},

  { id:"ch4_after", chapter:2, weight:96, once:true,
  when:{ seen:["ch4_settled"], dissolved:false },
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

/* ---- THE AFTERMATH (T21). Chapter four was reached only when a settlement
   closed the question, and it ended the run at the dissolution, so a
   settled run never went to the country. Folded into chapter two on 22 Sep
   2026 (bible §1.7): these follow the crisis result in order, while the
   House still sits, each gated on the one before through `seen`, and the
   whole chain stops at the writs. The argument does not reopen, and the
   cost arrives afterwards. */

{ id:"ch4_the_answer", chapter:2, weight:95, once:true,
  when:{ seen:["ch4_after"], dissolved:false },
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
      result:`A settled question does not need a press tour. It needs a government that will not reopen it. This one will not.` }
  ]},

{ id:"ch4_the_losers", chapter:2, weight:94, once:true,
  when:{ seen:["ch4_the_answer"], dissolved:false },
  title:"The people who lost",
  speaker:"watkins",
  body:`The benches that argued the other way have not changed their minds. They have changed their subject. Nothing stops them changing it back.

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

{ id:"ch4_the_ledger", chapter:2, weight:93, once:true,
  when:{ seen:["ch4_the_losers"], dissolved:false, scalarBelow:{ solvency:45000 } },
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

{ id:"ch4_the_next", chapter:2, weight:92, once:true,
  when:{ seen:["ch4_the_losers"], dissolved:false },
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
      result:`The House does its ordinary business and the country stops watching.` }
  ]},

/* ch4_the_record was dropped on 22 Sep 2026 (design/32): it set
   `campaign_done`, which ended a settled run at the dissolution without a
   campaign, and it said "what follows is somebody else's session" when the
   election follows. The count closes the record now. */

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
               { si:"si_2080_44" },
               { wire:"PM CONCEDES THE LICENSING DELAY AND LAYS THE ORDER" }],
      result:`The order is laid late and the government takes the blame publicly. The panel accepts an apology in no other form.` },
    { label:"Let it stand. A promise missed is a promise missed.",
      effects:[{ move:{ "rel.gb_chair":-8 } }, { move:{ "loyalty.gb":-8 } },
               { move:{ "legitimacy":-6 } },
               { wire:"GOVERNMENT ABANDONS THE CARVE-OUT; GUILD BENCH DISENGAGES" }],
      result:"The panel treats the sector as a bench that answers no government, which costs the next dual majority more." }
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
      result:`Two stations' closure figures take the strain. The government does not set the index and cannot argue with it.` }
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
      result:`The schedule is restored and the reserve carries it.` },
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
   by an initiative: a move now, a queued term, and an event which reads the
   state on the day it lands. No new effect verb and no engine change: the
   condition vocabulary already reads flags, prices and the station counts,
   and conditions are not under the twenty-verb cap. Volume is the world's
   and settles here; underwriting and the substrate debt are written against
   the platform crisis and settle in content/campaigns/flash_i/events.js. */

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
are under the standard of 2072. Most of the shortfall is in the last six years,
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
  body:`The presiding judge of the Tribunal was emulated in 2060 and has sat
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
  /* Was `flags:["paired"]`, which nothing set, so this could never fire.
     It reads the engine's own count of divisions that ran with a pair in
     force — the fact the scene is about. */
  when:{ pairsKeptAtLeast:1 },
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
      result:`Nothing is answered. The bench notes the date it asked and the date nothing came back. Both dates stay on the file.` }
  ]},

/* THE CHALLENGE. The opposition does not need a majority to hurt an order, it
   needs counsel. An order the government made is challenged in the Tribunal. */
/* REACH: SI 2080/44 in force. */
{ id:"tr_challenge_lodged", chapter:2, weight:66, once:true,
  when:{ siInForce:["si_2080_44"], flagsAbsent:["tr_challenged"] },
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
      note:"Members are asked one at a time on the Party tab, under the " +
           "leadership. A member who is willing signs, and every signature " +
           "is a member you have lost. A member who is not refuses, comes off " +
           "the paper for good, and their current firms behind you. A member " +
           "who has signed can be won back there, for a promise.",
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

/* THE OPPOSITION DECIDES (design/33 §1).

   The one event in this file that the government does not answer. It is the
   other side of the House choosing its moment — gated on the government
   being weak enough that the Leader of the Opposition thinks he can win,
   because a motion that fails strengthens the government and he knows it.

   It has no choices. There is nothing to decide: the paper is tabled, the
   date is set, and the sittings between now and then are the whole of the
   government's answer. */
{ id:"no_confidence_tabled", once:true,
  weight:6,
  /* GATED ON WEAKNESS, in the closed vocabulary (there is no anyOf, and
     inventing one would be content leaking into the engine): the Leader of
     the Opposition moves when the government is low in the country AND its
     own benches are unhappy, because he has to win. */
  chapter:2,
  when:{ minSitting:6, scalarBelow:{ public_standing:40, party_loyalty:46 } },
  title:"The Leader of the Opposition rises",
  speaker:"watkins",
  body:`He does not have a question this time.

"Madam Speaker. I give notice that I shall move, on Thursday, that this House
has no confidence in the government."

The noise takes a while to settle, and it does not come from his side. He has
been counting for weeks and has evidently arrived at a number he likes.

You have until Thursday. Everything you do between now and then is the
answer.`,
  choices:[
    { label:"Note the motion, and go and count.",
      effects:[
        { motion:3 }
      ],
      result:"The motion is on the paper for Thursday. The House will divide on whether the government continues." }
  ] },


/* QUESTION TIME — the standing business of the House (design/33 §2).

   THE ONE RECURRING OBLIGATION WHERE THE OPPOSITION ACTS ON THE GOVERNMENT.
   Everything else in this file happens TO the Prime Minister or is chosen BY
   her; this is the other side of the chamber taking its turn, on a schedule
   she does not set and cannot cancel.

   `every: 4` beside `at: 4` is the new engine reading: this sitting and
   every fourth after it. It is also the session's pulse. A fixed weekly beat
   is a schedule the player feels without being told there is one, which is
   what the loop has been missing.

   THE EVENT COSTS NOTHING AND THE ANSWER COSTS SOMETHING, which is the whole
   design. The House takes Questions whether the government likes it or not
   (§7.7 prices what the government CHOOSES to do, and this is not chosen).
   Answering it properly is a day's work and is priced as one; the two ways
   of not answering it are free and are paid for somewhere else. */
/* EVERY EIGHT SITTINGS, NOT FOUR (design/38 §4). At four it took ten of a
   run's fifty-five sittings, a quarter of what the pool had, and was read
   ten times word for word. At eight each run met 39 distinct events rather
   than 35 and the starved ones fell from 17 to 14. */
{ id:"question_time", at:4, every:8,
  title:"Questions to the Prime Minister",
  speaker:"watkins",
  body:`The Leader of the Opposition has the first three and has clearly had
them written for a week.

"The Prime Minister told this House the reserve was sound. Will she tell us
today what it stands at, or will she tell us again that the figure is a matter
for the Treasurer, who is also not answering?"

The benches behind you do the arithmetic before you do. The ones in front of
you already have.`,
  choices:[
    { label:"Answer it. Take the afternoon and answer all of it.",
      cost:{ slot:1 },
      note:"A day of the order paper, spent on the one thing nobody can amend.",
      effects:[
        { move:{ public_standing:4, party_loyalty:3 } },
        { wire:"PRIME MINISTER TAKES QUESTIONS FOR NINETY MINUTES; NO FIGURE WITHHELD" }
      ],
      result:"You answered the three, and the eleven behind them. The House went home late and nobody said the government was hiding." },
    { label:"Refer him to the Treasurer and move to the next question.",
      note:"Costs nothing today.",
      effects:[
        { move:{ public_standing:-4, party_loyalty:-2 } },
        /* AND IT LANDS HARDEST WHERE THE RESERVE IS SPENT. The low band is
           where the consumables floor is carried and where a thin reserve
           is felt first, so a government that will not say what it holds
           loses more there than the national figure shows. */
        { move:{ "standing.low":-3 } },
        { wire:"PRIME MINISTER REFERS RESERVE QUESTION TO THE TREASURY AGAIN" }
      ],
      result:"It cost nothing today. It is the fourth time, and the fourth time is the one the gallery counted." },
    { label:"Ask him what he would have done, and keep asking.",
      note:"The benches will like it. The gallery has heard it.",
      effects:[
        { move:{ party_loyalty:5, public_standing:-2 } },
        { move:{ "rel.watkins":-6 } },
        { wire:"NOISY EXCHANGES AT QUESTIONS; NEITHER LEADER ANSWERS THE OTHER" }
      ],
      result:"Your own side enjoyed it enormously. Nobody outside the chamber could say afterwards what the reserve stands at." }
  ] },


/* =============================================================
   THE PRODUCTIVE ECONOMY IN PLAY (bible §7.10)

   Built 21 September 2026, the first content to read st.economy. The
   measures existed for one commit and nothing gated on them, which is the
   fault design/22 measured across the whole project: 588 effects MOVE a
   scalar and 20 conditions READ one, so the indicators were scoreboards
   rather than state. Every event below both reads the economy and moves it.

   PROSE IS NOT WRITTEN. Each carries a `brief` saying what the passage has
   to do; the body under it is a placeholder. `npm run prose` emits the
   brief as a # note above the placeholder, so the author writes over it and
   hands the file back. Nothing here is meant to be read as finished text.
   ============================================================= */

{ id:"ec_participation_report", chapter:2, weight:58, maxFires:2,
  when:{ economyAbove:{ participation:44 } },
  brief:"The Bureau publishes the participation figure and it has moved "+
    "further than any bill in the session was argued to move it. The scene "+
    "wants the Treasurer laying a number nobody campaigned for: the "+
    "divergence threshold was debated as a personhood measure and has "+
    "turned out to be the largest labour-market intervention in the "+
    "Commonwealth's history. The PM has to decide whether to claim it.",
  title:"The figure nobody argued for",
  speaker:"hatt",
  body:`The participation figure is published quarterly. It has moved, and it has moved because of a law that was debated as something else.`,
  choices:[
    { label:"Claim it. Say plainly what the threshold did.",
      brief:"Taking credit for a consequence the government did not "+
        "predict. Reads as competence to the country and as an admission "+
        "to the benches who were told it was a personhood bill.",
      effects:[{ move:{ public_standing:6 } },
               { move:{ "loyalty.cu_maintenance":-5 } },
               { move:{ legitimacy:3 } },
               { wire:"TREASURER CREDITS THRESHOLD FOR RISE IN PAID WORK" }],
      result:`The claim is made and the number is on the record beside it.` },
    { label:"Let the figure speak and say nothing.",
      brief:"The cautious answer. Costs nothing and concedes the framing to "+
        "whoever explains it first, which will be the Opposition.",
      effects:[{ move:{ "rel.watkins":-2 } },
               { move:{ "trend.public_standing":-1 } }],
      result:`The figure is published without a minister beside it.` }
  ]},

{ id:"ec_participation_stalls", chapter:2, weight:62, maxFires:2,
  when:{ economyBelow:{ participation:37 } },
  brief:"Participation has fallen below the historic band, which means "+
    "instance-hours are doing work that used to be waged. The scene wants "+
    "the Minister for Labour and Participation explaining that the economy "+
    "has not shrunk — the work is being done, it is simply not being paid "+
    "for, and the registry has no column for it.",
  title:"The work that is not wages",
  speaker:"marin",
  body:`Participation is below the band it has held for a generation. The work is still being done.`,
  choices:[
    { label:"Shorten the threshold and count the hours.",
      brief:"The interventionist answer: the same lever as the divergence "+
        "bill, used deliberately this time. Expensive with the employers.",
      effects:[{ law:{ divergence_threshold_hours:96 } },
               { economy:{ participation:3 } },
               { move:{ "loyalty.fh":-8 } },
               { move:{ "actor.metanationals":-6 } },
               { wire:"THRESHOLD CUT TO NINETY-SIX HOURS" }],
      result:`The hours are counted and the figure moves next quarter.` },
    { label:"Fund a public works programme instead.",
      brief:"Buying participation with the reserve rather than with the "+
        "law. Works, costs money, and leaves the underlying question open.",
      effects:[{ move:{ solvency:-9000 } },
               { economy:{ participation:2 } },
               { move:{ public_standing:4 } }],
      result:`The programme is funded and the figure moves a little.` },
    { label:"Accept it. The economy is what it is.",
      brief:"The answer that costs nothing today. The trend continues and "+
        "the benches that depend on waged work notice.",
      effects:[{ move:{ "loyalty.cu_maintenance":-6 } },
               { move:{ "trend.legitimacy":-1 } }],
      result:`Nothing is done and the figure is published again next quarter.` }
  ]},

{ id:"ec_trade_surplus", chapter:2, weight:55, maxFires:2,
  when:{ economyAbove:{ trade:118 } },
  brief:"Compute exports are paying for everything else. The scene wants "+
    "the Minister for External Relations pointing out that the surplus is "+
    "leverage abroad and a target at home: the Earth states can see the "+
    "figure too, and so can every bench that wants the money spent.",
  title:"What the surplus buys",
  speaker:"landry",
  body:`The trade balance is in surplus and the surplus is substrate-hours sold to people who cannot make them.`,
  choices:[
    { label:"Spend it on the stations that are short.",
      brief:"Redistribution inside the union. Popular where it lands and "+
        "resented by the habitats that earned it.",
      effects:[{ move:{ solvency:7000 } },
               { move:{ "standing.low":5 } },
               { move:{ "standing.ring":-3 } },
               { move:{ consumables:3 } }],
      result:`The transfer is made and the low band feels it first.` },
    { label:"Hold it against the anchor negotiations.",
      brief:"Treating the surplus as a diplomatic reserve. Nothing visible "+
        "happens at home, which is the cost.",
      effects:[{ move:{ solvency:4000 } },
               { move:{ "actor.earth_host":4 } },
               { move:{ "trend.public_standing":-1 } },
               { flag:"ec_surplus_held" }],
      result:`The money is not spent and the negotiators are told why.` }
  ]},

{ id:"ec_trade_deficit", chapter:2, weight:74, maxFires:2,
  when:{ economyBelow:{ trade:84 } },
  brief:"The deficit is now large enough that the reserve is covering "+
    "imports rather than building anything. The scene wants the Treasurer "+
    "saying the quiet part: the Commonwealth is buying more than it sells "+
    "and the difference is coming out of the thing that pays for the "+
    "radiators.",
  title:"Buying more than it sells",
  speaker:"hatt",
  body:`The trade balance has been in deficit for long enough that the reserve is covering the gap.`,
  choices:[
    { label:"Cut transit costs and sell more compute.",
      brief:"The orthodox answer: subsidise the corridor, export the one "+
        "thing the Commonwealth makds that Earth will buy. Costs money now "+
        "for a balance later.",
      effects:[{ law:{ transit_subsidy:"all" } },
               { move:{ solvency:-6000 } },
               { move:{ "price.transit":-10 } },
               { economy:{ trade:4 } }],
      result:`The subsidy is laid and the corridor is cheaper by the month.` },
    { label:"Close the gap by importing less.",
      brief:"Autarky as a choice rather than a condition. Resilient and "+
        "poorer, and the stations that cannot feed themselves pay for it.",
      effects:[{ economy:{ trade:6 } },
               { move:{ consumables:-5 } },
               { move:{ "standing.low":-5 } },
               { flag:"ec_import_squeeze" }],
      result:`Imports are cut and the balance improves on paper.` }
  ]},

{ id:"ec_privatisation_offer", chapter:2, weight:64, once:true,
  when:{ scalarBelow:{ solvency:34000 }, economyBelow:{ private:0.78 } },
  brief:"An offer to buy a utility, arriving precisely when the reserve is "+
    "thin. The scene wants the Alliance of Business and Government making a "+
    "reasonable case for a sale that cannot be undone, and the reader "+
    "understanding that the price is good because the buyer knows the "+
    "government needs the money this quarter.",
  title:"An offer for the substrate works",
  speaker:"hatt",
  body:`There is an offer on the table for a public holding, and the reserve is thin enough to make it interesting.`,
  choices:[
    { label:"Sell. Take the money.",
      brief:"A one-off payment against a permanent loss of control. The "+
        "left of the party will not forget which quarter this happened in.",
      effects:[{ move:{ solvency:22000 } },
               { economy:{ private:0.06 } },
               { move:{ "loyalty.cu_maintenance":-12 } },
               { move:{ "loyalty.cu_deck":-9 } },
               { move:{ "loyalty.fh":8 } },
               { move:{ "capital.gb":6 } },
               { flag:"ec_sold_a_utility" },
               { wire:"GOVERNMENT SELLS PUBLIC STAKE IN SUBSTRATE WORKS" }],
      result:`The sale is made and the reserve is not thin this quarter.` },
    { label:"Refuse, and say why in the House.",
      brief:"Refusing on principle while the reserve is visibly short. "+
        "Buys the party and buys nothing else.",
      effects:[{ move:{ "loyalty.cu_maintenance":9 } },
               { move:{ "loyalty.cu_deck":6 } },
               { move:{ "capital.gb":-4 } },
               { move:{ "trend.solvency":-400 } },
               { flag:"ec_refused_sale" }],
      result:`The offer is declined on the floor and the reserve is unchanged.` }
  ]},


/* CLOSING THE CHAIN ON THE SUBSIDY. tools/lint.js flagged
   law.transit_subsidy as "moved by 1, gated by 0 — NUMBER NOBODY SEES" the
   moment ec_trade_deficit set it, which is the check working: a law the
   government can change and nothing ever reads is a scoreboard. This reads
   it, with `lawIs`, which no content had used before. */
{ id:"ec_subsidy_reckoning", chapter:2, weight:66, maxFires:2,
  /* IN THE LAW'S OWN WORDS. This read `transit_subsidy:1` and the deficit
     event wrote 1 and 0, while the appropriation, the price tick and the
     Economy panel all speak "none" / "anchors" / "all" -- so a subsidy laid
     here moved no price and printed no word (design/34). "all" is the
     corridor subsidy the brief describes: paid per tonne, everywhere. */
  when:{ lawIs:{ transit_subsidy:"all" } },
  brief:"The transit subsidy is in force and somebody has done the "+
    "arithmetic on who receives it. The scene wants the Chair of the Life "+
    "Support panel pointing out that a corridor subsidy is paid per tonne, "+
    "so the habitats that ship most collect most, and those are not the "+
    "habitats that needed it. A redistribution running backwards.",
  title:"Who the subsidy reaches",
  speaker:"gb_chair",
  body:`The subsidy is paid by the tonne. The panel has worked out which stations ship the most tonnes.`,
  choices:[
    { label:"Cap it per station and take the saving.",
      brief:"Fixing the incidence. Cheap, correct, and it makes an enemy of "+
        "every habitat that was collecting.",
      effects:[{ move:{ solvency:4000 } },
               { move:{ "standing.ring":-4 } },
               { move:{ "standing.low":4 } },
               { move:{ "rel.gb_chair":5 } },
               { wire:"TRANSIT SUBSIDY CAPPED PER STATION" }],
      result:`The cap is laid and the incidence changes in the same quarter.` },
    { label:"Leave it. The corridor matters more than the incidence.",
      brief:"Defending the subsidy on trade grounds while conceding the "+
        "distribution point. Honest and unpopular in the low band.",
      effects:[{ economy:{ trade:2 } },
               { move:{ "standing.low":-3 } },
               { move:{ "rel.gb_chair":-4 } }],
      result:`The subsidy stands as laid and the panel's figures stand too.` },
    { label:"Withdraw it entirely.",
      brief:"Undoing the government's own instrument two sittings after "+
        "laying it. Saves the money and costs the argument.",
      effects:[{ law:{ transit_subsidy:"none" } },
               { move:{ solvency:6000 } },
               { move:{ "price.transit":10 } },
               { economy:{ trade:-3 } },
               { move:{ legitimacy:-4 } },
               { wire:"GOVERNMENT WITHDRAWS TRANSIT SUBSIDY" }],
      result:`The subsidy is withdrawn and the corridor price returns.` }
  ]},

/* AND THE SALE HAS A SEQUEL, because `private` is authored and never
   drifts: if content can move it, content has to read it. `owes` and
   `capitalAbove` were both unused conditions. */
{ id:"ec_sold_and_asked", chapter:2, weight:70, once:true,
  when:{ flags:["ec_sold_a_utility"], capitalAbove:{ gb:4 } },
  brief:"The buyer is back, and it is owed a favour. The scene wants the "+
    "Alliance of Business and Government presenting a second request as a "+
    "continuation of the first transaction rather than a new one — the "+
    "ledger from the sale is the reason this meeting is happening, and "+
    "everyone in the room knows the figure.",
  title:"The second conversation",
  speaker:"hatt",
  body:`The buyer of the public stake has a second request, and a credit balance to spend on it.`,
  choices:[
    { label:"Grant the licence. Settle the ledger.",
      brief:"Paying the debt with a regulatory decision. Clears the books "+
        "and establishes what the credit was actually for.",
      effects:[{ move:{ "capital.gb":-6 } },
               { economy:{ private:0.03 } },
               { move:{ "loyalty.cu_maintenance":-7 } },
               { move:{ legitimacy:-5 } },
               { flag:"ec_licence_granted" }],
      result:`The licence is granted and the ledger is level.` },
    { label:"Refuse, and keep owing them.",
      brief:"Declining while carrying the debt. Nothing is spent and "+
        "nothing is settled, which is a position rather than a decision.",
      effects:[{ move:{ "loyalty.gb":-10 } },
               { move:{ "rel.hatt":-8 } },
               { move:{ "loyalty.cu_maintenance":5 } }],
      result:`The request is refused and the balance stays on the books.` }
  ]},

/* THE ECONOMY AS A REASON TO BORROW, gating on both halves of §7.10 at
   once: a deficit AND participation short is the case for the facility, and
   a surplus is the case against it. */
{ id:"ec_borrow_case", chapter:2, weight:68, maxFires:2,
  when:{ economyBelow:{ trade:92, participation:41 },
         scalarBelow:{ solvency:40000 } },
  brief:"The case for borrowing from Earth, made on the productive economy "+
    "rather than on the reserve. The scene wants the Treasurer arguing that "+
    "an economy selling less than it buys and employing fewer than it could "+
    "is an economy that should borrow to build — and the reader "+
    "understanding that the lender sets the rate and the lender is abroad.",
  title:"The case for the facility",
  speaker:"hatt",
  body:`The balance is short and the participation figure is short, and the Treasury has written down what borrowing would cost.`,
  choices:[
    { label:"Draw on the facility and build.",
      brief:"Borrowing to raise participation. The rate is the quarrel and "+
        "the quarrel is with a lender who is not in the chamber.",
      /* CLOSED WHERE THE STANDBY FACILITY STOPS LENDING (24 Sep): under a
         blockade, while the reserve is under the covenant, and while a
         default is declared. The same lines as setup.lenders.earth's
         full-stop limits; test.js holds the two together, so moving one
         without the other fails. */
      when:{ scalarBelow:{ friction:86 }, scalarAbove:{ solvency:9999 },
             flagsAbsent:["standby_default"] },
      /* A LOAN, both sides at the day's rate (design/39): the reserve
         receives CW$16bn and Earth's banks are owed its worth in US dollars,
         which grows if the dollar falls. */
      effects:[{ move:{ "loan.earth":16000 } },
               { economy:{ participation:2, trade:-2 } },
               { move:{ friction:5 } },
               { move:{ "actor.earth_bloc":-4 } },
               { flag:"ec_drew_facility" },
               { wire:"COMMONWEALTH DRAWS ON EARTH FACILITY" }],
      result:`The facility is drawn and the building programme has money.` },
    { label:"Balance it at home instead.",
      brief:"Refusing the facility and finding the money internally. "+
        "Slower, cheaper in sovereignty, expensive in everything else.",
      effects:[{ move:{ solvency:-4000 } },
               { move:{ consumables:-3 } },
               { move:{ "loyalty.sc":6 } },
               { move:{ legitimacy:3 } }],
      result:`Nothing is borrowed and the programme is funded out of the reserve.` }
  ]},


/* =============================================================
   CHAPTER FOUR'S WEIGHTED POOL (bible §1.7)

   Chapter four had six events and all six were `prologue`, so the pool the
   bible says "takes over" after an authored opening had nothing in it: the
   scripted arc ran — after, the answer, the losers, the cost, the next
   question, the record — and then the chapter had no content at all. Budget
   is 8-10 and it held 6.

   These four are the pool, and they are deliberately NOT more arc. The
   prologue already says what a settlement feels like; this is what it costs
   in the state you happen to have settled in, which is the half that can
   differ between playthroughs. Each gates on something real, and three of
   them use conditions no content had touched: `risesWithin`, `owes`, and
   the §7.10 economy.

   PROSE IS NOT WRITTEN. Each carries a `brief`; the body under it is a
   placeholder. `npm run prose` emits the brief as a # note above it.
   ============================================================= */

/* THE TEST. A settled question is only settled while nobody profits by
   reopening it, and a government whose standing has fallen is the moment to
   find out. Reads public_standing, which 117 effects move and 3 conditions
   read — this is a fourth. */
{ id:"ch4_tested", chapter:2, weight:72, once:true,
  /* 38 AND NOT 46. public_standing OPENS at 44, so a gate at 46 was true
     from the first sitting of the game and the event would have fired as
     soon as chapter four began, whatever had happened — which is the
     opposite of "the government is weak enough to be tested". Six points
     below the opening is a fall somebody did. Caught by testing the gate
     against the opening state as well as against the state it wants. */
  when:{ settled:true, dissolved:false, scalarBelow:{ public_standing:38 } },
  brief:"Somebody moves to reopen the settled question, and the government's "+
    "standing is low enough to make it worth trying. The scene wants the "+
    "Leader of the Opposition testing whether the answer holds rather than "+
    "arguing against it — he does not need to win, he needs to show it can "+
    "be asked again. The reader should understand that a settlement is a "+
    "fact about the House's appetite and not about the law.",
  title:"Whether it holds",
  speaker:"watkins",
  body:`A member gives notice of a measure that would reopen the question. The notice is the point; the measure is not expected to carry.`,
  choices:[
    { label:"Refuse it the floor. The question is closed.",
      brief:"Using the government's control of time to deny a hearing. "+
        "Effective, and it concedes that the answer needs protecting.",
      effects:[{ move:{ legitimacy:-5 } },
               { move:{ "rel.watkins":-6 } },
               { move:{ public_standing:3 } },
               { flag:"ch4_refused_reopening" },
               { wire:"GOVERNMENT DENIES TIME TO REOPENING MOTION" }],
      result:`The notice is not called. It stays on the paper, uncalled, where anyone can point at it.` },
    { label:"Give it a day and beat it in the open.",
      brief:"Spending order-paper time to win the argument twice. Costs a "+
        "slot and settles the question harder than the settlement did.",
      effects:[{ slots:{ total:-1 } },
               { move:{ legitimacy:8 } },
               { move:{ public_standing:5 } },
               { move:{ "loyalty.cu_maintenance":-4 } },
               { flag:"ch4_beat_reopening" },
               { wire:"REOPENING MOTION DEFEATED ON THE FLOOR" }],
      result:`The measure is called, debated and defeated, and the division list is now a second answer to the same question.` }
  ]},

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
  speaker:"hatt",
  body:`The participation figure is published, and the settlement is the reason it has moved.`,
  choices:[
    { label:"Build on it. Fund the training the new jobs need.",
      brief:"Treating the side effect as a policy. Expensive, popular where "+
        "the work is, and it commits the next session's money.",
      effects:[{ move:{ solvency:-11000 } },
               { economy:{ participation:2 } },
               { move:{ public_standing:6 } },
               { move:{ "standing.low":4 } },
               { wire:"GOVERNMENT FUNDS TRAINING FOR THE NEW REGISTER" }],
      result:`The programme is funded and the figure holds rather than drifting back.` },
    { label:"Say nothing. It was a personhood measure.",
      brief:"Declining to own an effect the government did not predict. "+
        "Costs nothing and leaves the framing to whoever explains it first.",
      effects:[{ move:{ "trend.public_standing":-1 } },
               { move:{ "loyalty.psa":-4 } }],
      result:`The figure is published and the government does not comment on it.` }
  ]},

/* THE COALITION HAS NO QUESTION LEFT. A partner that joined for one measure
   has either got it or watched it die, and either way the arrangement now
   has to be about something else. Gates on `owes`, which no content had
   used: an undertaking still open is the government having promised
   something it has not delivered. */
{ id:"ch4_what_for", chapter:2, weight:78, once:true,
  when:{ settled:true, dissolved:false, owes:["carry_threshold"] },
  brief:"The partner that made the bill the price of the coalition asks what "+
    "the government is for now. The scene wants a negotiation that is not "+
    "about the settled question at all: the promise in the agreement is "+
    "still open on the register, the thing it was about is over, and both "+
    "sides know the arrangement needs a second reason to exist. Not a "+
    "threat — a question neither of them can answer quickly.",
  title:"What the arrangement is for",
  speaker:"marin",
  body:`The coalition agreement names an undertaking that is still open, about a question that is now closed.`,
  choices:[
    { label:"Write them a second programme.",
      brief:"Giving the coalition a new purpose, which costs order-paper "+
        "time it has not got and buys the partner's loyalty.",
      effects:[{ slots:{ total:-1 } },
               { move:{ "loyalty.psa":12 } },
               { move:{ "capital.psa":-4 } },
               { move:{ "loyalty.cu_maintenance":-5 } },
               { flag:"ch4_second_programme" },
               { wire:"COALITION AGREES A SECOND PROGRAMME" }],
      result:`A second programme is agreed and the arrangement has a reason again.` },
    { label:"Discharge the undertaking and let the agreement stand as it is.",
      brief:"Closing the promise formally without replacing it. Honest, and "+
        "it leaves a partner in a coalition about nothing.",
      effects:[{ move:{ legitimacy:4 } },
               { move:{ "loyalty.psa":-9 } },
               { move:{ "trend.party_loyalty":-1 } },
               { flag:"ch4_agreement_hollow" }],
      result:`The undertaking is discharged on the record and neither side proposes a replacement.` }
  ]},

/* AND THE SESSION RISES ON IT. `risesWithin` had no content reading it, and
   the last sittings of the settling session are exactly what it is for: the
   House is about to go home on the answer, and what the government does
   with the remaining time is the last decision of the chapter. */
{ id:"ch4_rises_on_it", chapter:2, weight:64, once:true,
  when:{ resolved:true, dissolved:false, risesWithin:3 },
  brief:"The House rises within three sittings and the settled question is "+
    "what the session will be remembered for. The scene wants the Chief Whip "+
    "with the last of the order paper in his hand, asking what to do with "+
    "time that cannot be carried over. The reader should feel that unspent "+
    "time is not saved, it is lost.",
  title:"The last of the paper",
  speaker:"okarie",
  /* "The House", not "the session": it fires before whichever rise comes
     first after the result, and since a session is sat in periods (bible
     §1.8) that is usually a recess. Time does not carry over a recess
     either, so the rest of the line is true of both. */
  body:`The House rises shortly and there is order-paper time left that cannot be carried past it.`,
  choices:[
    { label:"Spend it on the small things the benches have been asking for.",
      brief:"Using the remainder on backbench business. Buys loyalty broadly "+
        "and produces nothing the country will notice.",
      effects:[{ slots:{ total:-2 } },
               { move:{ party_loyalty:9 } },
               { move:{ "loyalty.cu_maintenance":6 } },
               { move:{ "loyalty.cu_deck":5 } }],
      result:`The remaining days go to backbench measures and the benches rise in a better temper than they sat.` },
    { label:"Rise early. Let the answer be the last thing said.",
      brief:"Ending the session on the settlement rather than on ordinary "+
        "business. Cheap, and it wastes time that had a use.",
      effects:[{ move:{ public_standing:4 } },
               { move:{ legitimacy:3 } },
               { move:{ party_loyalty:-5 } },
               { wire:"HOUSE RISES EARLY; SESSION CLOSES ON THE SETTLEMENT" }],
      result:`The House rises early and the record closes on the answer with nothing after it.` }
  ]},

/* APPENDED, NOT INSERTED. The pool's seeded lean is keyed on an event's
   position in this list, so an event inserted mid-list re-leans every event
   after it and changes every run; new events go at the end. A campaign's events
   follow the world's in the list it plays, so appending here re-leans that
   campaign's events: the playtest before and after is the proof. */

/* THE TWO LAWS, READ (bible 7.9: a law the government can change and
   nothing reads is a scoreboard). Appended, per the note above. */
{ id:"ec_clock_quarter", chapter:2, weight:60, once:true,
  when:{ lawAbove:{ civic_clock_minimum:0 } },
  title:"What the clock costs",
  speaker:"girard",
  body:`The civic clock subsidy has run for a month. It keeps 560,000 slow-running minds at real time, at seventy billion dollars a year from the reserve and the heat of running them through the radiators.

The Minister for Substrate and Thermal asks whether the rate is to be held through the campaign or halved until the estimates.`,
  choices:[
    { label:"Hold it at real time.",
      effects:[{ move:{ "legitimacy":3 } }, { move:{ "loyalty.psa":3 } },
               { move:{ "loyalty.cu_maintenance":-3 } }],
      result:"The minimum stands at real time, and so does its cost." },
    { label:"Halve it until the estimates.",
      effects:[{ law:{ civic_clock_minimum:0.5 } }, { move:{ "loyalty.psa":-6 } },
               { move:{ "loyalty.cu_maintenance":3 } },
               { wire:"CIVIC CLOCK MINIMUM HALVED UNTIL THE ESTIMATES" }],
      result:"The minimum falls to half real time, at half the cost and half the heat." }
  ]},

{ id:"ec_first_restorations", chapter:2, weight:60, once:true,
  when:{ lawIs:{ suspension_debt_accrual:false } },
  title:"The first restorations",
  speaker:"herrera",
  body:`The first cohort restored under the debt moratorium owe what they owed on the day they went cold. The Underwriters have repriced suspension cover to match: a quarter spent suspended now costs less than a quarter's rent, and the new policies say so in their schedules.`,
  choices:[
    { label:"Let the repricing stand.",
      effects:[{ move:{ "actor.underwriters":4 } }, { move:{ "loyalty.psa":2 } }],
      result:"Suspension cover is priced as a way to wait out a bad quarter." },
    { label:"Cap the premium by order.",
      effects:[{ move:{ "actor.underwriters":-6 } }, { move:{ "solvency":-3000 } },
               { move:{ "legitimacy":2 } },
               { wire:"GOVERNMENT CAPS SUSPENSION COVER PREMIUMS BY ORDER" }],
      result:"The premium is capped, and the reserve carries the difference the Underwriters would have charged." }
  ]},

/* THE SHED ORDER, PUBLISHED. `shed_order_authority` moved from the
   engineering authority to statute when the Civilian Oversight Bill passed,
   and nothing read it: a fourth law that did nothing, found once the chain
   audit counted bills as movers (design/34). */
{ id:"shed_order_published", chapter:2, weight:66, once:true,
  when:{ lawIs:{ shed_order_authority:"statute" } },
  title:"The shed order, laid before the House",
  speaker:"brakk",
  body:`Under the Shed Order (Civilian Oversight) Act the schedule that decides who stops running first in a shortfall is published and laid before the House. The first schedule laid is the one the engineering authority was already using: the residual constituency heads it, and the stations with the least closure follow.

The Minister for Home Affairs and Contingencies can lay it as drawn, or reorder it by exposure before the House reads it.`,
  choices:[
    { label:"Reorder it by exposure.",
      effects:[{ move:{ "standing.low":4 } }, { move:{ "loyalty.hul":-8 } },
               { move:{ "legitimacy":3 } },
               { wire:"SHED ORDER REORDERED BY EXPOSURE BEFORE IT IS LAID" }],
      result:"The published schedule puts the stations with the least margin last, and the engineers call it a political document." },
    { label:"Lay it as the engineers drew it.",
      effects:[{ move:{ "loyalty.hul":4 } }, { move:{ "public_standing":-3 } },
               { move:{ "loyalty.psa":-4 } }],
      result:"The schedule is laid as drawn, and the House reads the order in which the Commonwealth sheds its people." }
  ]},

/* THE OPPOSITION'S DOSSIER (design/38 §1). The campaign's seventh beat,
   which was empty: the other side publishes its case against the record,
   and how well an answer lands depends on whether the country believes
   the record it answers for. */
{ id:"ch3_the_dossier", chapter:3, prologue:7, once:true,
  title:"The dossier",
  speaker:"watkins",
  body:`The opposition publishes its case against the government in a single
document, and the Spindle prints the whole of it. It is forty pages, and every
page is a sitting of the session with the government's answer on one side and
the other side's on the other.

"We did not write it," Watkins says on the wire. "The government did. We only
put it in order."`,
  choices:[
    { label:"Answer it line by line.",
      when:{ scalarAbove:{ legitimacy:54 } },
      note:"The country believes the record, so an answer to every page is forty chances to be right.",
      effects:[{ move:{ "public_standing":5 } }, { move:{ "legitimacy":2 } },
               { wire:"GOVERNMENT ANSWERS THE OPPOSITION DOSSIER LINE BY LINE" }],
      result:"Every page is answered by the evening, and most of the answers are better than the pages." },
    { label:"Answer it line by line.",
      when:{ scalarBelow:{ legitimacy:55 } },
      note:"The country does not believe the record, so an answer to every page is forty chances to repeat the charge.",
      effects:[{ move:{ "public_standing":-5 } },
               { wire:"GOVERNMENT ANSWERS THE OPPOSITION DOSSIER LINE BY LINE" }],
      result:"Every page is answered, and every answer puts the page back on the front of the Spindle." },
    { label:"Say nothing and keep campaigning.",
      note:"It costs a little and it ends the story sooner.",
      effects:[{ move:{ "public_standing":-2 } },
               { wire:"GOVERNMENT WILL NOT ANSWER THE OPPOSITION DOSSIER" }],
      result:"The dossier runs for a day and then the campaign runs over it." },
    { label:"Publish one of our own.",
      note:"It moves votes, and it tells the country the campaign is now about who was worse.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "legitimacy":-5 } },
               { wire:"GOVERNMENT ANSWERS WITH A DOSSIER ON THE OPPOSITION" }],
      result:"Two dossiers, one day apart, and the Spindle prints both under one headline." }
  ]},

/* A PARTNER WALKS OUT (design/38 §3). Queued by the engine when a
   coalition or confidence-and-supply partner's loyalty falls to
   `thresholds.partnerLeaves` (setup.onPartnerWithdraws names it). The wire
   has already said who. If the government no longer commands the House the
   opposition has moved against it, and a partner back at
   `thresholds.partnerReturns` before the division is back on the benches.
   `court` moves every partner that has walked out, which is the one set
   this event cannot name in advance. */
{ id:"partner_walks", queuedOnly:true,
  title:"A partner walks out",
  speaker:"okarie",
  body:`The Chief Whip has the letter before the Spindle does, which is the last courtesy a partner extends. The terms of the agreement are withdrawn, their members will sit where they please, and the arithmetic the government has governed on since the formation no longer holds.

"They have not joined the other side," he says. "They have left ours. The difference is worth one conversation, and it had better be this week."`,
  choices:[
    { label:"Send for their leader and offer terms.",
      cost:{ slot:1 },
      note:"A day of the order paper and a concession made in public. If their loyalty " +
           "is back to where they would sit with you, they return before the House divides.",
      effects:[{ court:16 }, { move:{ public_standing:-2 } },
               { wire:"PRIME MINISTER OFFERS TERMS TO THE PARTY THAT WALKED OUT" }],
      result:"The terms are on the table, and the other side of it is deciding whether a government that let it come to this is worth sitting with." },
    { label:"Let the whips work the lobbies.",
      note:"Cheaper, quieter and slower. The whips spend their own credit with the benches doing it.",
      effects:[{ court:6 }, { move:{ party_loyalty:-2 } }],
      result:"The whips go to work in the tea room, and the answer comes back one member at a time." },
    { label:"Let them go, and face the House on the numbers.",
      note:"If the numbers are short, the House decides the government's future on the day the motion is set down.",
      effects:[{ move:{ public_standing:2 } }, { move:{ legitimacy:1 } },
               { wire:"GOVERNMENT WILL FACE THE HOUSE WITHOUT ITS PARTNER" }],
      result:"The government says it will meet the House, and the House will count." }
  ]},

/* =============================================================
   THE RESERVE BANK AND THE DOLLAR (design/39 option C, 25 Sep 2026)

   The Bank sets the cash rate by its own rule at a meeting every six weeks,
   and the engine writes every decision to the wire. These are the moments a
   government has to answer for money it does not control: the remit it
   writes, the inflation figure, the Governor's open letter, a falling
   dollar, a cut in the Underwriters' rating, and the Bank meeting in the
   middle of a campaign. Each gates on a reading of the economy
   (`economyAbove`/`economyBelow`), so each arrives when the economy has
   earned it and not on a date.
   ============================================================= */
{ id:"rb_remit", chapter:2, weight:72, once:true,
  title:"The remit letter",
  speaker:"castellane",
  body:`The Reserve Bank Act gives the Governor the cash rate and gives the Treasury one letter a year to say what the rate is for. The last letter said two per cent. Maren Castellane has asked, politely and in writing, whether the new government means to say the same.

She has also attached, without being asked, the section of the Act under which the House may give her a reserve direction. She would like it understood that she has read it.`,
  choices:[
    { label:"Two per cent, as before.",
      effects:[{ economy:{ credibility:0.08 } }, { move:{ "rel.castellane":6, "actor.underwriters":2 } }],
      result:"The letter is two lines long. The market reads it in a minute and has forgotten it by the afternoon, which is what a remit is for." },
    { label:"Three per cent. Growth first.",
      effects:[{ law:{ inflation_target:3 } }, { economy:{ credibility:-0.08, expected:0.5 } },
               { move:{ "loyalty.cu":4, "actor.underwriters":-3 } },
               { wire:"TREASURY RAISES THE INFLATION TARGET TO THREE PER CENT" }],
      result:"The target moves a point, and so does every rate of interest struck in the Commonwealth that week. The unions call it the first honest remit since the float." },
    { label:"Two per cent, and full participation beside it.",
      effects:[{ law:{ bank_mandate:"dual" } }, { economy:{ credibility:-0.02 } },
               { move:{ "loyalty.cu_maintenance":4 } },
               { wire:"RESERVE BANK GIVEN A DUAL MANDATE" }],
      result:"The Bank will weigh the people out of work as heavily as the prices. It will cut sooner and raise later, and the Governor's reply says she will need both halves of the remit to be believed." }
  ]},

{ id:"rb_inflation_print", chapter:2, weight:70, maxFires:1,
  when:{ economyAbove:{ overshoot:1.2 }, dissolved:false },
  title:"The inflation figure",
  speaker:"ceyhan",
  body:`The quarterly figure reaches the Spindle an hour before the Treasury's own copy reaches the Treasurer. Inflation is well over the Bank's target, and the price of heat is most of it.

Ceyhan's question at the door is the one every paper prints the next morning: whose fault is it?`,
  choices:[
    { label:"Back the Bank. It will bring it down.",
      effects:[{ move:{ legitimacy:2, public_standing:-3 } }, { economy:{ credibility:0.05 } }],
      result:"The government stands behind a rate rise it has not yet seen. The Bank notices, and so does every household paying for heat." },
    { label:"Blame Earth's prices.",
      effects:[{ move:{ friction:3, public_standing:2, "actor.earth_bloc":-2 } }],
      result:"It is partly true, and Earth's press office says the other part by the evening." },
    { label:"Promise relief on the thermal bill.",
      effects:[{ move:{ solvency:-6000, public_standing:4 } }, { economy:{ expected:0.3, credibility:-0.03 } }],
      result:"The relief is paid out of the reserve and spent on heat, which is the thing the Bank was trying to make dearer." }
  ]},

{ id:"rb_open_letter", chapter:2, weight:66, once:true,
  when:{ economyAbove:{ overshoot:2 } },
  title:"An open letter from the Governor",
  speaker:"castellane",
  body:`The Reserve Bank Act requires the Governor to write to the Treasurer, in public, whenever inflation misses the target by more than two points. Castellane's letter is four pages long. It says what went wrong, what the Bank will do about it, and how long that will take.

The last paragraph says what the Bank cannot do. It cannot make heat cheaper, and it cannot make the government spend less.`,
  choices:[
    { label:"Publish a reply that endorses every word.",
      effects:[{ economy:{ credibility:0.06 } }, { move:{ "rel.castellane":6, "loyalty.cu":-3 } }],
      result:"The two letters are printed side by side, and the market reads them as one voice. The party reads them as the Governor writing the government's budget." },
    { label:"Acknowledge it and say nothing more.",
      effects:[{ move:{ legitimacy:-1 } }],
      result:"The letter stands on its own, and people read it that way." },
    { label:"Answer it in the House.",
      effects:[{ move:{ public_standing:3, "rel.castellane":-10 } }, { economy:{ credibility:-0.06 } }],
      result:"The Prime Minister tells the House that the Bank has missed its target for one year in nine. The Governor watches from the gallery." }
  ]},

{ id:"rb_dollar_falls", chapter:2, weight:74, once:true,
  when:{ economyBelow:{ fx:0.78 } },
  title:"The dollar falls",
  speaker:null,
  body:`The dollar has fallen through seventy-eight US cents, and the first line of the Treasury's morning note is the arithmetic. Every cent it falls adds to what the Commonwealth owes Earth's banks, and to the price of everything the stations import.

The Reserve Bank holds the reserves, and the Treasury decides whether to spend them.`,
  choices:[
    { label:"Sell reserves and hold the line.",
      when:{ economyAbove:{ reserves:10000 } },
      effects:[{ economy:{ reserves:-10000, fx:4 } }, { move:{ legitimacy:1 } }],
      result:"The Bank sells ten billion of its US dollars in a morning, and the dollar steadies. The market has learned how many mornings like it the Bank has left." },
    { label:"Ask the Governor for a rise between meetings.",
      effects:[{ economy:{ rate:0.5, fx:3, shock:-0.6, credibility:-0.02 } }, { move:{ "rel.castellane":2, public_standing:-2 } },
               { wire:"RESERVE BANK RAISES HALF A POINT BETWEEN MEETINGS" }],
      result:"The Bank raises half a point between meetings, which it has done once before, in the year of the float. Mortgages on long leases reprice by the end of the week." },
    { label:"Let it find its level.",
      effects:[{ economy:{ trade:3, expected:0.3 } }, { move:{ public_standing:-1 } }],
      result:"The dollar finds a lower level than the one it had. Commonwealth compute is cheaper to Earth by the same margin, and the order books lengthen." }
  ]},

{ id:"rb_downgrade", chapter:2, weight:71, once:true,
  when:{ economyAbove:{ debt:6 } },
  title:"The continuity rating",
  speaker:null,
  body:`The Underwriters have cut the Commonwealth's continuity rating by a notch. The note that goes with it is three sentences long: the debt is rising against output, the thermal margin is thin, and the government has not said how it means to pay.

The bills tendered on Friday will cost a quarter of a point more. So will every series of notes after them.`,
  choices:[
    { label:"Announce a plan to consolidate.",
      effects:[{ flag:"rating_cut" }, { flag:"consolidation_promised" },
               { move:{ public_standing:-3, legitimacy:3 } }, { economy:{ shock:-0.8, credibility:0.03 } }],
      result:"The plan is a page of figures and a promise. The rating stays where it was cut to, and the Underwriters' next note is shorter." },
    { label:"Dispute the rating.",
      effects:[{ flag:"rating_cut" }, { move:{ "actor.underwriters":-5, public_standing:1 } }, { economy:{ fx:-1.5 } }],
      result:"The Treasury's rebuttal is longer than the Underwriters' note, and the Underwriters take the length as their answer." },
    { label:"Say nothing and tender the bills.",
      effects:[{ flag:"rating_cut" }],
      result:"The bills are taken, at the price the note gave." }
  ]},

{ id:"rb_campaign", chapter:3, weight:55, once:true,
  when:{ dissolved:true, economyAbove:{ overshoot:0.5 } },
  title:"The Bank does not wait for the count",
  speaker:"castellane",
  body:`The Reserve Bank meets in the second week of the campaign, as its calendar said it would when nobody knew there would be a campaign. The Governor's statement does not mention the election, and it does not need to.`,
  choices:[
    { label:"Say nothing. The Bank is independent.",
      effects:[{ move:{ legitimacy:2, public_standing:-2 } }, { economy:{ credibility:0.04 } }],
      result:"The government's answer to every question about the rate is the Act, and the Act is not a popular document." },
    { label:"Say the government would have done otherwise.",
      effects:[{ move:{ public_standing:3, "rel.castellane":-10 } }, { economy:{ credibility:-0.08 } }],
      result:"The Opposition asks whether that is a promise to direct the Bank, and the Prime Minister does not answer it." },
    { label:"Promise to review the Reserve Bank Act.",
      effects:[{ move:{ "loyalty.cu":5, public_standing:1, "actor.underwriters":-4 } }, { economy:{ credibility:-0.12 } }],
      result:"The review would take a year, and the market prices it in an afternoon." }
  ]},

/* the answers to the two money initiatives (content/initiatives.js) */
{ id:"governor_answers", queuedOnly:true,
  title:"The Governor's answer",
  speaker:"castellane",
  body:`Castellane's reply is in her own hand, which at the Bank means it is not for the file.

She will not move the cash rate for a government. She will say, at her next meeting, that the Bank expects the price of heat to fall back, and that it can wait to see whether it does. That is worth a quarter of a point, and she would like it understood that it was her decision.`,
  choices:[
    { label:"Take what she offers.",
      effects:[{ economy:{ rate:-0.25, credibility:-0.02 } }, { move:{ "rel.castellane":3 } }],
      result:"The Bank cuts a quarter and says the heat price is temporary. If it is, nobody will remember the cut." },
    { label:"Remind her the House can direct her.",
      effects:[{ economy:{ credibility:-0.05 } }, { move:{ "rel.castellane":-12 } }, { flag:"direction_threatened" }],
      result:"The Governor does not reply. The next meeting's statement is two sentences longer, and both are about the Act." },
    { label:"Let it go.",
      effects:[{ move:{ "rel.castellane":4 } }],
      result:"The Bank decides by its rule, and the rule is printed beside the decision." }
  ]},

{ id:"dollar_line_tested", queuedOnly:true,
  title:"The line is tested",
  speaker:null,
  body:`The market has spent a week finding out whether the Treasury meant it. The Bank has spent its reserves answering, and the dealers on the Bourse have been counting what is left.`,
  choices:[
    { label:"Spend what it takes.",
      when:{ economyAbove:{ reserves:15000 } },
      effects:[{ economy:{ reserves:-15000, fx:3, credibility:0.02 } }],
      result:"The line holds, and the reserves are fifteen billion lighter for holding it." },
    { label:"Let the line go.",
      effects:[{ economy:{ fx:-5, credibility:-0.06 } }, { move:{ legitimacy:-3 } }],
      result:"The dollar falls through the line the Treasury drew, and the next line anybody draws will cost more to believe." }
  ]}

];
