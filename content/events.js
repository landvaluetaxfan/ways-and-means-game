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

/* FLASH I'S SANDBOX SHORTCUTS (design/47). A campaign may give the Sandbox
   tab shortcuts to a state: each is an ordinary effects block using the
   existing verbs, shown under "Shortcuts" when the sandbox is opened on that
   campaign. These are Flash I's, tagged so, and live here only because the
   list predates the campaign folders. The queued test console that also
   pressed them is gone: the tab now puts any event on the Sitting screen. */
const SANDBOX = [
  { campaign:"flash_i", id:"station_question", label:"Raise the station question",
    note:"Sets station_issue and starts the survey chain.",
    result:"The foreign panel opens and the survey chain is queued. The Works stays outside the roster.",
    effects:[{ flag:"station_issue" }, { flag:"f1_surveyed" },
             { queue:[{ event:"f1_referendum", after:2, label:"The survey reports" }] },
             { wire:"SANDBOX: THE STATION QUESTION IS RAISED" }] },
  { campaign:"flash_i", id:"annex", label:"Annex the Works outright",
    note:"Sets station_issue, annexed_almanac_works and f1_annexing, and sets the annexation bill down.",
    result:"The Works is inside the Commonwealth and the annexation bill is set down with its crisis time.",
    effects:[{ flag:"station_issue" }, { flag:"annexed_almanac_works" }, { flag:"f1_annexing" },
             { bill:{ annexation:{ stage:"first_reading" } } }, { slots:{ reserve:{ annexation:5 } } },
             { wire:"SANDBOX: THE WORKS IS ANNEXED" }] },
  { campaign:"flash_i", id:"carry_threshold", label:"Carry the threshold bill (forty hours)",
    note:"Assents the divergence bill and sets the threshold low.",
    result:"The reform is assented at forty hours; the neutrality settlement can land once the floor allows.",
    effects:[{ law:{ divergence_threshold_hours:40 } },
             { bill:{ divergence:{ stage:"assented", dead:false } } },
             { wire:"SANDBOX: THE THRESHOLD BILL IS CARRIED" }] },
  { campaign:"flash_i", id:"defeat_threshold", label:"Defeat the threshold bill",
    note:"Defeats the divergence bill and leaves the threshold high.",
    result:"The restriction settlement can land once the floor allows.",
    effects:[{ law:{ divergence_threshold_hours:168 } },
             { bill:{ divergence:{ stage:"defeated", dead:true } } },
             { wire:"SANDBOX: THE THRESHOLD BILL IS DEFEATED" }] },
  { campaign:"flash_i", id:"tribunal", label:"Open the tribunal",
    note:"Sets tribunal_established.",
    result:"The graduated-personhood ending is in reach, and the restriction settlement is now blocked.",
    effects:[{ flag:"tribunal_established" }, { wire:"SANDBOX: THE TRIBUNAL IS ESTABLISHED" }] },
  { campaign:"flash_i", id:"federal", label:"Impose the federal schedule",
    note:"Sets federal_schedule.",
    result:"The federal settlement is in reach.",
    effects:[{ flag:"federal_schedule" }, { wire:"SANDBOX: THE FEDERAL SCHEDULE IS IMPOSED" }] },
  { campaign:"flash_i", id:"licensing_order", label:"Make the licensing order",
    note:"Makes SI 2080/44 in force, and offers the carve-out, which opens SI 2080/45.",
    result:"The order is in force, which opens its reaction and the challenge at the tribunal.",
    effects:[{ si:"si_2080_44" }, { flag:"licensure_carveout_offered" },
             { wire:"SANDBOX: THE LICENSING ORDER IS IN FORCE" }] },
  { campaign:"flash_i", id:"friction", label:"Push friction toward a sanction",
    note:"Raises friction and drops legitimacy.",
    result:"The couplings begin to bite and the freeze event comes into reach.",
    effects:[{ move:{ friction:40 } }, { move:{ legitimacy:-10 } },
             { wire:"SANDBOX: FRICTION IS PUSHED UP" }] },
  { campaign:"flash_i", id:"drain", label:"Drain the reserve",
    note:"Drops the reserve under CW$30bn.",
    result:"The reserve is under CW$30bn, so the emergency loan and the low-reserve events are in reach.",
    effects:[{ move:{ solvency:-970000 } }, { wire:"SANDBOX: THE RESERVE IS DRAINED" }] },
  { campaign:"flash_i", id:"paper", label:"Open Czarnecki's paper",
    note:"Opens the paper and fills the signatures.",
    result:"The paper is open with the signatures already counted, so the ballot and its prose are in reach.",
    effects:[{ flag:"paper_opened" }, { move:{ "loyalty.cu_halloran":-40 } }, { signatures:12 },
             { wire:"SANDBOX: THE PAPER IS OPEN" }] },
  { campaign:"flash_i", id:"collapse", label:"Force the government's collapse",
    note:"Zeroes party loyalty so the next loss check ends the run.",
    result:"Party loyalty is at the floor, so the next loss check ends the run. Useful for reading the fall.",
    effects:[{ move:{ party_loyalty:-80 } }, { wire:"SANDBOX: THE PARTY'S LOYALTY IS ZEROED" }] }
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
   real arithmetic — 147 of 280, six more than a majority and six of them
   independents on confidence and supply — measured against the roll rather
   than written for the scene. (It was 142, a majority of one, until design/40
   E9: two in five uninformed governments fell to it before the crisis.)

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
  body:`The President receives a new Prime Minister in the Winter Garden, the
Commonwealth's capital. It was built as a station of its own so that no
other station's voters would own the seat of government, and its 80,000
residents return one member to Parliament, who can introduce bills and speak
but cannot vote. The walk from the lift passes Earth's embassies, each in a
garden kept at its own country's climate: six climates in a mile. The
congress hall where the Perigee Charter was signed in 2064 stands at the
centre of the station.

Jaco van Ryneveld was elected President in 2077 by a direct vote of the
whole Commonwealth, on the Liberal Party's ticket, with 51.4 per cent. The
Liberals lead the opposition in the House, and relations between his office
and your party are cold.

This morning his task is narrow. The Charter obliges him to appoint as Prime
Minister whoever can command a majority of the House, and to sign the
commission, the document that makes the appointment, once he is satisfied
that they can. He also holds the Charter's reserve powers: he may dissolve
the House, refer a bill to the Tribunal, the constitutional court, for
review, and refuse an appointment.

The commission is on the desk in front of him. He has not signed it.

"The House has 280 seats, and a government needs 141 of them to survive a
vote of confidence," he says. "You can show me 147. Your party has 85, the
New Progressive Party 36 and the Congregational Democratic Alliance 20. The
other six are independents, who have agreed to vote for you on confidence
and on the budget and on nothing else. If they walk out, you have 141
exactly.

"I am obliged to appoint whoever can hold the House. I am not obliged to
believe that it will hold. Tell me what you mean to do with it, and I will
date this."`,
  choices:[
    { posture:"bold", label:`The bill that would make a copy of a person a citizen after 40 hours of separate running, instead of the 168 the law now requires. It is the bill this coalition was formed to pass.`,
      act:"Tell him",
      note:`The New Progressive Party, with 36 seats the second-largest party in the government, made this bill its price for joining the coalition, and its members will be glad to hear it named first. The Trades Left, the largest of your party's four currents with 31 of its 85 members, speaks for the maintenance unions. It opposes the bill, because a copy that becomes a citizen can hold a maintenance licence and compete for its members' jobs.`,
      effects:[{ flag:"commission_bill" },
               { move:{ "rel.president":4 } },
               { move:{ "loyalty.psa":8 } },
               { move:{ "loyalty.cu_maintenance":-5 } },
               { wire:"PM TELLS PRESIDENT THE DIVERGENCE BILL COMES FIRST" }],
      result:`He dates the commission and signs it. His office's note of the meeting records that the new Prime Minister named the bill as the government's first business before the House had sat once. The note will be on file if the bill reaches his desk.` },

    { posture:"measured", label:`The stations. The Commonwealth's radiators have little spare capacity, and a station that cannot get rid of its heat must switch off some of the minds it runs.`,
      act:"Tell him",
      note:`The President is the only official the whole Commonwealth elects, and presidents have spoken for the small stations, which run short of cooling first. Four stations have run short during his term. The Trades Left, the largest current in your party, draws its members from the trades that maintain the stations, and will welcome a Prime Minister who puts them first. The New Progressive Party joined the government to pass a bill on copies, and will notice that it was not mentioned.`,
      effects:[{ flag:"commission_stations" },
               { move:{ "rel.president":8 } },
               { move:{ "loyalty.cu_maintenance":6 } },
               { move:{ "loyalty.psa":-6 } },
               { move:{ public_standing:3 } },
               { wire:"PM PUTS LIFE SUPPORT AHEAD OF THE BILL IN FIRST MEETING" }],
      result:`He signs the commission without reading it again, and tells you he has waited three years for a Prime Minister to raise the stations' cooling before he had to. His office tells the press that the Prime Minister raised life support first.` },

    { posture:"cautious", label:`Nothing specific. Tell him the government intends to last its full term, and that he will learn of its decisions when they are announced.`,
      act:"Tell him",
      note:`It commits the government to nothing in its first hour. The Soft Left, the current of your party's leadership, will approve of a Prime Minister who concedes nothing to a Liberal President. The President keeps his powers to dissolve the House, refer bills to the Tribunal and refuse appointments, and he will remember that he was told nothing. A first meeting that ends with no statement from either side is usually reported as a quarrel.`,
      effects:[{ flag:"commission_none" },
               { move:{ "rel.president":-6 } },
               { move:{ "loyalty.cu_loyalists":7 } },
               { move:{ public_standing:-2 } },
               { wire:"PRESIDENT AND PRIME MINISTER MEET; NEITHER OFFICE COMMENTS" }],
      result:`He dates the commission and signs it without comment. Neither office issues a statement afterwards, and the evening news reports the silence as the new government's first quarrel.` }
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
  body:`Your first press conference as Prime Minister is carried live to all thirty
stations. On Anselm Ring and the other stations of the ring band it falls in
the middle of a working shift. On the outer habitats, supervisors have held
back the shift change so that their crews can watch.

The press gallery has given the first question to Ivor Ceyhan, political
editor of The Spindle, the Commonwealth's newspaper of record. He asks it
without notes.

"Prime Minister. Your majority is six seats, and all six belong to
independents. You have inherited a bill you did not write, to make copies of
people into persons after forty hours, which your predecessor promised the
New Progressive Party. And you lead a party of four currents that have never
agreed what it is for: the maintenance unions of the Trades Left, the
leadership's Soft Left, the deck co-operatives of the Station Left and Dan
Czarnecki's Hard Left. Before anything else: why you?"

Your answer will be quoted for the rest of your term, and it will decide
which part of your record you are known for.`,
  choices:[
    { posture:"measured", label:`Because the last government could not run the Commonwealth, and I can.`,
      act:"Say it",
      note:`It stakes your reputation on competence: on the promise that the stations will be well run, which most voters want to hear. Kazuya Tanako, who chairs the six members elected by licensed life-support engineers, hears a government that respects expertise. The Trades Left hears an old charge. The last government blamed the stations' breakdowns on the maintenance crews, and this answer repeats it.`,
      effects:[{flag:"led_on_competence"},
               {move:{public_standing:5}},
               {move:{"loyalty.cu_maintenance":-6}},
               {move:{"rel.gb_chair":6}},
               {wire:"NEW PM PITCHES COMPETENCE; SAYS GOVERNMENT WILL BE 'RUN, NOT ARGUED WITH'"}],
      result:`Ceyhan writes it down, and The Spindle leads with it the next morning. The Trades Left, whose maintenance crews the last government blamed for the stations' breakdowns, hears itself blamed again.` },

    { posture:"cautious", label:`Because I stand for what this party has always stood for: public ownership, and the workers who keep the stations running.`,
      act:"Say it",
      note:`It claims the party's traditions. The Trades Left, the current that speaks for the maintenance unions, will quote the answer at every meeting for a year, and the Soft Left, the leadership's current, is reassured. Voters who wanted a new start hear the old party. The New Progressive Party, which joined the government to pass the bill on copies, will ask whether those traditions include it.`,
      effects:[{flag:"led_on_continuity"},
               {move:{"loyalty.cu_maintenance":11}},
               {move:{"loyalty.cu_loyalists":4}},
               {move:{public_standing:-4}},
               {move:{"loyalty.psa":-5}},
               {wire:"PM CLAIMS THE MOVEMENT'S INHERITANCE; PARTNERS SEEK CLARIFICATION"}],
      result:`The New Progressive Party asks for the sentence in writing. At its next meeting it asks whether the party's traditions include the forty-hour bill, which would oblige employers to pay the copies they now run unpaid.` },

    { posture:"bold", label:`Because the party had to change, and I changed it.`,
      act:"Say it",
      note:`It claims credit for modernising the party, which most voters and the New Progressive Party want to hear. The Trades Left and Dan Czarnecki's Hard Left opposed that modernisation, and they will read the answer as a statement that the leadership no longer needs them. Your own members will quote it back to you the first time you ask them to vote for something they dislike.`,
      effects:[{flag:"led_on_break"},
               {move:{public_standing:7}},
               {move:{"loyalty.psa":9}},
               {move:{"loyalty.cu_maintenance":-10}},
               {move:{"loyalty.cu_halloran":-6}},
               {wire:"PM: 'THE PARTY HAD TO CHANGE.' CZARNECKI GROUP DECLINES TO COMMENT"}],
      result:`The Spindle prints the sentence on its front page. The Hard Left declines to comment, and its members sit through the afternoon's business without speaking.` }
  ]},

{ id:"briefing_divergence", prologue:3, once:true,
  title:"The bill you inherited",
  speaker:"ceyhan",
  body:`Your predecessor promised the Divergence Threshold (Amendment) Bill and left
office before it came to a vote. It is now yours to carry.

The law decides when a copy of a person becomes a separate person. At
present the line is 168 hours, one week, of separate running. A copy younger
than that is an instance: legally the same person as its original, able to
be merged back into it, with no wage and no vote of its own. A copy older
than that is a separate citizen with every right its original has.

The bill lowers the line to 40 hours, a working week. Officials estimate
that 1.9 million copies would become citizens on the day it takes effect,
and that six districts would have to be redrawn for the new voters.
Employers who now run copies of their staff for a week at a time, and merge
them back unpaid, would have to employ and pay them.

The New Progressive Party made the bill its price for joining your
government. The Trades Left, the current of your party that speaks for the
maintenance unions, is divided on it. A copy that must be paid no longer
undercuts their wages, but a copy that is a citizen can hold a maintenance
licence and compete for their jobs.`,
  choices:[
    { posture:"cautious", label:`Read the whips' count of how every member is expected to vote, before saying anything about the bill in public.`,
      note:`It costs nothing and commits the government to nothing. The count shows where the bill has the votes and where it does not, so that anything you say about it afterwards is said with the numbers in hand. The New Progressive Party will wait for a statement, and for now it has no cause to worry.`,
      effects:[{flag:"read_the_count"},],
      result:"The count says the bill would carry among the 240 elected members and fail among the 40 functional members, who must also pass it because it touches life-support licensing." },
    { posture:"bold", label:`Tell the press that the government stands behind the bill and will carry it through the House.`,
      act:"Say it",
      cost:{ slot:1 },
      note:`A public commitment pleases the New Progressive Party, which made the bill its price for joining the government, and the voters who favour the bill. It also commits the government before the Trades Left has been consulted. That current is the largest in your party and is divided on the bill, and its members will learn of the commitment from the news. Once made in public, the commitment is hard to withdraw.`,
      effects:[{flag:"read_the_count"},{move:{"public_standing":3}},
               {move:{"loyalty.psa":8}},{move:{"loyalty.cu_maintenance":-9}},
               {wire:"PM COMMITS GOVERNMENT TO FORTY-HOUR THRESHOLD"}],
      result:`The New Progressive Party welcomes the statement within the hour. The Trades Left learns of it from the news wire, and its members complain in the tea room that nobody asked them.` }
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
  title:"The Life Support panel will see you",
  speaker:"gb_chair",
  body:`Kazuya Tanako chairs the Life Support panel, the six functional members
elected by licensed life-support engineers, and sits for the Alliance of
Business and Government, the professional party everyone calls the Guild
Bench. She has agreed to a meeting at half past ten and to nothing else. She
is a licensed integrity engineer of forty years' standing, the first twenty
of them on Earth, and she has never voted against the position her
profession has settled on.

"You want the forty hours," she says, before you have sat down. "You will
not get them from us. Our objection is not to the number. It is to what
follows. The panel's seats are elected by licensed engineers. Once a copy
two days old is a person, a copy two days old can hold a licence, and then
it can vote for this panel. You are not only reforming personhood. You are
changing who elects us."`,
  choices:[
    { posture:"measured", label:`Offer an exemption: the threshold falls to forty hours, but a copy made a person under it cannot hold a life-support licence.`,
      act:"Offer it",
      note:`It is what the panel asked for. The licence, and with it the vote for the six Life Support seats, stays with the engineers who hold it now. The offer wins the goodwill of Tanako and her party, and it puts a promise on the order paper: to lay the order keeping copies off the licence within four sittings. The New Progressive Party, which wants copies licensed on the same terms as anyone else, will be furious.`,
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":12}},{move:{"loyalty.gb":6}},{move:{"loyalty.psa":-9}},
               {undertake:{ id:"licensure_carveout",
                            text:"Lay the order that keeps copies off the Life Support licence",
                            owed_to:"gb_chair", by:4,
                             discharge:{ si:"si_2080_45" },
                             onBreach:"gb_carveout_broken" }},
               {wire:"GOVERNMENT SIGNALS LICENSURE CARVE-OUT; NPP FURIOUS"},
               {flag:"licensure_carveout_offered"}],
      result:"She does not agree. She says she will put it to the panel, which from her is a considerable concession." },
    { posture:"bold", label:`Remind her that the functional seats were meant to be temporary. The Charter's sunset clause has been extended four times, and the government will not extend it a fifth.`,
      note:`The forty functional seats exist under a clause of the Charter, the Commonwealth's constitution, that ends them unless it is renewed, so the threat reaches every seat on her panel. Voters who think the professions hold too much power will approve once the story reaches the press. Tanako and her party will remember it, and it does nothing to move her panel's votes this session.`,
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":-15}},{move:{"loyalty.gb":-8}},
               {move:{"public_standing":3}},{flag:"threatened_guild_bench"},
               {wire:"PM RAISES FUNCTIONAL SUNSET IN PRIVATE MEETING, SOURCES SAY"}],
      result:"\"Extend it a fifth time,\" she says, \"or don't. Either way I have the votes and you do not.\"" },
    { posture:"cautious", label:`Commit to nothing. Listen, and say nothing that could be repeated.`,
      note:`You leave having committed the government to nothing, and Tanako thinks slightly better of a Prime Minister who listened. You also learn when the panel meets to decide its vote.`,
      effects:[{flag:"gb_approached"},{chapter:2},{move:{"rel.gb_chair":4}},],
      result:`She talks for twenty minutes about the grades of engineering certificate and never mentions the vote. Afterwards her secretary books the panel's room for Thursday at ten, four hours before the division.` }
  ]},

{ id:"halloran_signatures", prologue:5,
  when:{ loyaltyBelow:{cu_halloran:20}, flagsAbsent:["halloran_confronted"] },
  title:"Twelve signatures",
  speaker:"halloran",
  body:`Dan Czarnecki leads the Hard Left of your party and sits for Tier Four.
Twelve of your party's members must sign a paper to force a ballot on your
leadership. If a ballot is held and you lose it, you lose the leadership of
the party and with it the premiership.

Every member in the tea room knows how many names he has, and he has been
short of twelve for three weeks. Either he cannot find them, or he is
waiting for a better moment.

He stops you in the division lobby, where the press gallery can see the two
of you together.

"Eleven thousand four hundred of my constituents are registered in tier four
of the shed order," he says. "That is the list that decides who is switched
off first when a station runs short of power, and switched back on last. The
bill you are whipping me to vote for decides how many hours it takes a copy
to become a person. Give me the shed order. Give me anything on the shed
order."`,
  choices:[
    { posture:"measured", label:`Promise to bring back the Shed Order (Civilian Oversight) Bill this session, which would put the shed order under civilian review.`,
      note:`Czarnecki wrote the bill, and it is the one thing he has asked for. The promise wins the Hard Left. It also pleases the Trades Left, the current that speaks for the maintenance unions, which wants the shed order answerable to Parliament. The bill touches life support, so it needs a majority of the functional members as well, and your coalition partners expect to vote against it. The promise is made in the division lobby in front of the press gallery, and it will be reported.`,
      effects:[{move:{"loyalty.cu_halloran":22}},{move:{"loyalty.cu_maintenance":9}},{move:{"party_loyalty":7}},
               {flag:"halloran_confronted"},{flag:"shed_order_promised"},
               {bill:{shedorder:{stage:"second_reading"}}}],
      result:`He writes nothing down. By evening the promise is in the parliamentary column of The Spindle, the Commonwealth's newspaper of record, sourced to three members who overheard it. The bill is back on the order paper at its second reading.` },
    { posture:"cautious", label:`Offer him a junior ministry. As a minister he would be bound to vote with the government.`,
      note:`A minister must vote with the government or resign, so the offer binds Czarnecki. It does not bind the eleven members of the Hard Left, who followed him because of the shed order and would be left with their grievance and without their leader. The appointment will be reported as a Prime Minister buying off a rival, and voters will think less of it.`,
      effects:[{move:{"loyalty.cu_halloran":14}},{move:{"party_loyalty":4}},{move:{"public_standing":-3}},
               {flag:"halloran_confronted"},{flag:"halloran_bought"},
               {wire:`CZARNECKI TIPPED FOR OFFICE; HOMESTEAD DELEGATION SEEKS ASSURANCES`}],
      result:`He accepts. Some of the Hard Left follow him into line, and those who do not now have a grievance and no leader.` },
    { posture:"bold", label:`Refuse. He has fewer than twelve signatures, and you both know it.`,
      note:`It costs the government nothing today. The Hard Left and the Trades Left will hear a Prime Minister who will not discuss the shed order, and Czarnecki will go looking for the missing names. If he finds them, twelve members can force a ballot on your leadership.`,
      effects:[{move:{"loyalty.cu_halloran":-11}},{move:{"loyalty.cu_maintenance":-4}},{move:{"party_loyalty":-3}},
               {flag:"halloran_confronted"},{queue:[{event:"halloran_finds_nine",after:4}]}],
      result:`"No," he agrees. "Not today." He leaves the lobby and spends the next four sittings asking members to sign.` }
  ]},

{ id:"halloran_finds_nine", queuedOnly:true, once:true,
  title:"He found them",
  speaker:"halloran",
  body:`Dan Czarnecki, leader of your party's Hard Left, has the twelve signatures
he needs, and a ballot on your leadership is called for the week after next.
If you lose it, you lose the leadership of the party and the premiership
with it.

Four of the names are revenants: members who lost their district seats and
were returned on the party list. The whips had counted them as safe, because
they owe their seats entirely to the party. They have worked out that a new
leader would redraw the party's list for the next election, and that a
redrawn list can move them up as easily as down.`,
  choices:[
    /* THE BALLOT IS CALLED, AND NOW IT IS HELD (design/38 §3). This set
       `leadership_ballot_called`, which nothing read, so the week after next
       came and went with the paper where it was. The names go on the paper
       eight sittings out and the engine holds the ballot the sitting after,
       decided by how the benches feel about her then: the Party tab carries
       the count, and the time between is the fight. */
    { posture:"bold", label:"Fight it. Put the whole cabinet on broadcast.",
      note:`The ballot is held the week after next and decided by the benches' loyalty on the day. The Party tab has the count; below half, you lose the leadership.`,
      effects:[{move:{"party_loyalty":-4}},{move:{"public_standing":-5}},
               {flag:"leadership_ballot_called"},
               {queue:[{ effects:[{ signatures:12 }], after:8,
                         label:"Czarnecki's names are on the paper, and the caucus will divide." }]},
               {wire:"LEADERSHIP BALLOT CALLED; CABINET DECLARES FOR FLASH"}],
      result:"Ministers go on Ring Network one after another to defend you. The ballot becomes a public argument about what the party stands for, and both the party and the country think less of the government for it." },
    { posture:"cautious", label:"Concede: promise the shed order reform and withdraw the Divergence Threshold Bill",
      effects:[{move:{"loyalty.cu_halloran":30}},{move:{"loyalty.cu_maintenance":12}},{move:{"loyalty.psa":-20}},
               {move:{"party_loyalty":12}},
               {bill:{divergence:{stage:"withdrawn",dead:true}}},
               {wire:"THRESHOLD BILL WITHDRAWN; NEW PROGRESSIVE PARTY REVIEWS ITS PLACE IN THE COALITION"}],
      result:"You keep the leadership. The New Progressive Party, which joined the government for the bill you have just withdrawn, meets tonight without you." }
  ]},

{ id:"vantage_radiator", prologue:6,
  when:{ scalarBelow:{thermal_margin:22}, flagsAbsent:["vantage_handled"] },
  title:"Ember Ridge, third day short of cooling",
  speaker:null,
  image:{ src:"vantage_radiator.png", palette:"broadcast",
          caption:"Radiator array 4, Ember Ridge", credit:"Ring Network" },
  body:`Ember Ridge, a station of 213,000 people in the middle band, has been unable
to shed all of its heat for three days. One of its radiator arrays has
failed. The array is twenty-two years old, and its replacement is in the
procurement queue behind a coolant-loop upgrade that the ministry has never
managed to justify.

The Allocation Act, the law that governs a shortage, now lets the
engineering authority, the body that runs life support, switch off the
station's tier-four register without notice and without telling a minister
first. Tier four is the bottom band of the shed order, the list of who stops
running first. Another 2,600 of Ember Ridge's people are already held in
suspension, their minds kept intact but not running.`,
  choices:[
    { posture:"bold", label:`Divert cooling capacity from Anselm Ring to Ember Ridge.`,
      note:`Ember Ridge gets the capacity today, and the thermal margin, the Commonwealth's spare radiator capacity, recovers at once. The capacity comes out of Anselm Ring's allocation, and the Treasury pays for what it moves. Your own seat, First Spin, is on Anselm Ring, and voters across the ring band will see their margin cut to cover another station.`,
      effects:[{move:{"thermal_margin":11}},{move:{"solvency": -9000}},{move:{"public_standing":-4}},
               {station:{vantage:{closure:0.03}}},{flag:"vantage_handled"},
               {wire:`ANSELM RING QUOTA DIVERTED TO EMBER RIDGE; RING MEMBERS OBJECT`}],
      result:`Anselm Ring gives up part of its spare cooling, and Ember Ridge holds. Your own seat, First Spin, is on Anselm Ring, and the members for the ring's constituencies object in the House the same afternoon.` },
    { posture:"cautious", label:`Let the engineering authority act under the Allocation Act, and say publicly that the government will not intervene.`,
      note:`The authority will shed load on Ember Ridge by switching off minds on its tier-four register, and the thermal margin recovers by about half as much as a diversion would give. The Association of Engineers and Systems, the engineers' party, approves of a government that leaves engineering to the engineers. The New Progressive Party, Czarnecki's Hard Left and much of the public will hear a government that let people be switched off when it had the power to prevent it.`,
      effects:[{move:{"thermal_margin":5}},{move:{"public_standing":-11}},{move:{"loyalty.hul":8}},{move:{"loyalty.psa":-9}},{move:{"loyalty.cu_halloran":-9}},
               {flag:"vantage_handled"},{flag:"deferred_to_authority"},
               {wire:"GOVERNMENT DECLINES TO INTERVENE; ENGINEERING AUTHORITY TO EXERCISE S.12 POWERS"}],
      result:`You have said in public that the authority's decision on who is switched off is final. The Charter, the Commonwealth's constitution, has never settled that question.` },
    { posture:"cautious", label:`Do nothing for now, in case the engineers repair the array and the fault clears.`,
      note:`Waiting commits the government to nothing. It also leaves the 4,200 people on Ember Ridge's tier-four register exposed, since the engineering authority can switch them off without telling a minister first, and the thermal margin keeps falling while the array is down.`,
      effects:[{move:{"thermal_margin":-6}},{queue:[{event:"vantage_cascade",after:3}]}],
      result:`The fault does not clear, and the array stays down.` },
    /* THE LADDER, MET INSIDE A DECISION (design/38 §7). Three playtest
       strategies cascaded because the emergency orders were on the
       Government tab and nowhere else. The first rung is offered here, where
       the margin first bites, and the order it lays is the one the docket
       then points past. Appended, so no existing choice changes its place. */
    { posture:"measured", label:`Issue a conservation appeal asking every station to cut its non-essential power use (SI 2080/61).`,
      when:{ siNotMade:"rung1_conservation" },
      note:`The Voluntary Conservation (Appeal) Order is the first and cheapest of the government's emergency orders. Compliance is voluntary, so it frees only a little capacity, but Ember Ridge gets that headroom and nobody is switched off. If more is needed, the next orders are listed with the government's other instruments, each costlier than the last.`,
      effects:[{si:"rung1_conservation"},{flag:"vantage_handled"}],
      result:`The appeal goes out under the minister's name, and Ember Ridge holds. The thermal margin improves a little. If more is needed, the next step is an emergency order that the House must approve.` }
  ]},

{ id:"vantage_cascade", queuedOnly:true, once:true,
  title:"Tier four, Ember Ridge",
  speaker:null,
  body:`At 04:12 the engineering authority, the body that runs life support,
switched off Ember Ridge's tier-four register without telling the Ministry.
The 4,200 people on it, the lowest band of the shed order, stopped running
and are now held in suspension.

Under the Allocation Act, the law that governs a shortage, this was lawful,
and nothing required a minister to be told. The Spindle, the Commonwealth's
newspaper of record, has the timestamp and will print it tomorrow.`,
  choices:[
    { posture:"cautious", label:"Announce a review, in law, of the authority's power to switch people off",
      effects:[{move:{"public_standing":-8}},{move:{"thermal_margin":4}},{move:{"loyalty.psa":6}},{move:{"loyalty.hul":-14}},
               {bill:{shedorder:{stage:"second_reading"}}},
               {wire:`PM ANNOUNCES REVIEW OF SHEDDING POWERS AFTER EMBER RIDGE`}],
      result:`The review will report after the election, and The Spindle says so in its first line. The Association of Engineers and Systems, the engineers' party, calls it an attack on the authority.` },
    { posture:"bold", label:"Defend the authority: it acted within the law.",
      effects:[{move:{"public_standing":-14}},{move:{"party_loyalty":-9}},{move:{"loyalty.hul":12}},{move:{"loyalty.psa":-16}},{move:{"loyalty.cu_maintenance":-11}},
               {flag:"defended_authority"},
               {wire:"PM DEFENDS SHEDDING DECISION; SUBSTRATE LEFT SUMMONS COALITION MEETING"}],
      result:"You have said on the record what the Association of Engineers and Systems says: that the authority's judgement comes first. The engineers' party is pleased. The country, the New Progressive Party and your own maintenance members are not." }
  ]},

{ id:"cluster_flag", weight:60,
  when:{ minSitting:2, flagsAbsent:["cluster_investigated"] },
  title:"Two hundred and forty accounts",
  speaker:"ceyhan",
  image:{ src:"cluster_feed.png", palette:"newsprint",
          caption:"Registry advisory, 11 April", credit:"The Spindle" },
  body:`Two hundred and forty unattested accounts, ones never proved to belong to a
single unique person, posted the same message within four minutes. The
Registry that attests accounts flagged the cluster and did nothing more,
because flagging is the only power the law gives it.

Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper
of record, wants to know on the record whether the government will ask for
stronger powers. Either answer is a story.`,
  choices:[
    { posture:"bold", label:"Announce an attestation enforcement bill",
      effects:[{move:{"public_standing":5}},{move:{"loyalty.psa":-8}},{move:{"loyalty.cl":-6}},{move:{"loyalty.gb":5}},
               {flag:"cluster_investigated"},{flag:"attestation_bill_trailed"},
               {wire:"GOVERNMENT TO SEEK REGISTRY ENFORCEMENT POWERS"}],
      result:"People who have never been attested, most for lack of documents rather than by choice, read the bill as aimed at them. The New Progressive Party and the Liberals object; the Alliance of Business and Government approves." },
    { posture:"cautious", label:"Say the registry has the powers it should have and the cluster is not illegal",
      effects:[{move:{"public_standing":-4}},{move:{"loyalty.psa":7}},{move:{"loyalty.cl":4}},
               {flag:"cluster_investigated"},{move:{"rel.ceyhan":5}}],
      result:"It is true, and it is unpopular: The Spindle puts 'not illegal' in its headline. The New Progressive Party and the Liberals approve." },
    { posture:"measured", label:"Ask who paid for the computing time behind the accounts",
      effects:[{flag:"cluster_investigated"},{flag:"cluster_traced"},{move:{"rel.ceyhan":9}},
               {queue:[{event:"cluster_source",after:5}]}],
      result:"Ceyhan writes the question down carefully, which means he expects it to lead somewhere." }
  ]},

{ id:"cluster_source", queuedOnly:true, once:true,
  title:"Who paid for the substrate",
  speaker:"ceyhan",
  body:`The computing time behind the 240 accounts was billed to a holding company.
It is one of six companies incorporated in the same week, and all six are
registered voters in the Substrate and Hosting functional constituency, a
seat whose entire electorate is 411 voters, because companies vote there.

Whoever set up the six has bought six votes in a seat decided by a few
hundred, and used spare computing capacity to fake a public consensus. It is
not clear that either act breaks any law.`,
  choices:[
    { posture:"bold", label:"Refer it to the Law Officer and let it run",
      effects:[{move:{"public_standing":7}},{move:{"loyalty.cl":-11}},{move:{"loyalty.gb":-7}},
               {flag:"shells_referred"},
               {wire:"LAW OFFICER TO EXAMINE SHELL REGISTRATIONS IN SUBSTRATE PROVIDERS SEAT"}],
      result:"The Law Officer examines the six companies. You have opened a fight over companies voting in functional seats weeks before you need the functional members' votes, and the Liberals and the Alliance of Business and Government are furious." },
    { posture:"cautious", label:"Hold it back: the seat's vote may matter more later than the story does now.",
      effects:[{flag:"shells_held"},{move:{"rel.ceyhan":-8}}],
      result:"Ceyhan runs the story without you, with a paragraph on what the government knew and when." }
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
  body:`The Chief Whip, Anil Devi, puts the day's order paper on your desk before
you sit down. It lists every measure waiting on the House and what each one
needs next. He reads it aloud, slowly, the way he reads a division list.

"The House gives the government six slots of order-paper time in each
sitting period," he says. "One slot moves one measure one stage, such as
from first reading to committee. So the question is never only whether you
have the votes. It is whether you have the time. The slots are restored at
every recess. When the House rises at the end of the session, any bill that
has not passed falls."`,
  choices:[
    { posture:"cautious", label:`Go through the order paper with him item by item, and ask what each measure needs and who wants it.`,
      note:`Devi knows who moved each measure and what they will want for their votes. An hour with him now teaches the order paper to the Prime Minister who must spend its time, and it wins his confidence and that of the Soft Left, the leadership's current.`,
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":6 } }, { move:{ "loyalty.cu_loyalists":3 } }],
      result:`He names who moved each item and what they want in return for their votes. From tomorrow you read the paper yourself; he will not take you through it again.` },
    { posture:"bold", label:`Read the order paper alone, and send him back to the lobbies to count votes.`,
      note:`It keeps the Chief Whip counting votes, which is where the government needs him, and you learn the order paper on your own. Devi will take it as a sign that you do not want his advice. The press gallery will report a Prime Minister who does her own reading.`,
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":-4 } }, { move:{ "public_standing":2 } }],
      result:"He goes back to the lobbies to count votes. From now on you read the order paper alone each sitting, and he does not offer to help again." }
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
  body:`The Chief Whip, Anil Devi, does not sit down. He has run the whips' office
since before you were first elected, and he has come to explain how the
House decides things, which means he has concluded that you do not yet know.

"A measure can fail three ways," he says.

"First, the elected members. The House has 280 seats. To pass a bill you
need a majority of the 240 members elected by districts and party lists,
which is 121. The 141 you need to survive a vote of confidence is a majority
of all 280, and it is a different count.

"Second, the functional members. Forty members are elected by professions
and industries rather than by places. A bill that touches life-support
integrity, or amends the Charter, the Commonwealth's constitution, must also
carry among them: 21 of the 40. That is the dual majority, and it is why a
bill can win the House and fail on the same afternoon. The government holds
twelve of the forty.

"Third, the objection. If most of the functional members whose trade a bill
touches vote against it, the bill fails unless three-fifths of the elected
members voting override them. That is why the bill you inherited would carry
among the districts and fail among the professions. It is also why I keep
telling you about the licensing boards, which decide who is licensed in a
trade and so who votes for its functional seats."`,
  choices:[
    { posture:"cautious", label:`Ask him which of the three tests the bill you inherited is most likely to fail, and why.`,
      note:`Devi has counted this party's votes for years and knows how the benches and the professions are leaning. His answer is the whips' own reading of the House, which no published count gives. Asking also tells him that you mean to use the whips' office, and the Soft Left, the current of the party's leadership, will hear that you did.`,
      effects:[{ flag:"taught_the_house" }, { move:{ "rel.okarie":5 } },
               { move:{ "loyalty.cu_loyalists":2 } },
               { flag:"knows_the_tests" }],
      result:"\"The second and the third,\" he says. \"We can carry the elected members on Tuesday and lose the functional members on Thursday, and the functional members are where it will be decided.\"" },
    { posture:"bold", label:`Thank him and end the meeting. You have read the standing orders, the House's rules of procedure, and do not need them explained.`,
      note:`It saves the hour for other business. Devi came to explain the rules because he judged that you did not know them, and he will take the refusal as a judgement on his office. The press gallery will hear that the new Prime Minister needed no lesson.`,
      effects:[{ flag:"taught_the_house" }, { move:{ "rel.okarie":-3 } },
               { move:{ "public_standing":1 } }],
      result:`He nods and leaves to count the functional members himself. By the evening the press gallery has heard that the new Prime Minister sent the Chief Whip away, and reports it as confidence.` }
  ]},

{ id:"the_whip_list", prologue:7,
  when:{ flagsAbsent:["whip_briefed"] },
  title:"The list",
  speaker:"okarie",
  body:`The Divergence Threshold Bill will be called to a vote before the House
rises. The Chief Whip, Anil Devi, brings one sheet with three columns: the
members who will vote with the government, the members who will vote against
it, and the members who have not decided. He reads out the third column.

"There are two ways to move a vote," he says. "The first is to whip our own
benches: tell our members how to vote, and make them. It costs the party's
goodwill, and goodwill once spent does not come back on its own.

"The second is to ask another party for its votes. It will want a promise in
return, such as time on the order paper for one of its bills, and the
promise will carry a date by which we must keep it."`,
  choices:[
    { posture:"cautious", label:`Hold the members already with the government, and spend nothing on the undecided for now.`,
      note:`The whips keep the members who have promised their votes and ask nothing more of the party, so its goodwill is saved for a harder vote later. The undecided stay undecided, and a government seen to wait on its own flagship bill looks less sure of it.`,
      effects:[{ flag:"whip_briefed" }, { move:{ "loyalty.cu":5 } }, { move:{ "public_standing":-2 } }],
      result:"The whips hold the members they already have and wait. It costs nothing, and the undecided members stay undecided." },
    { posture:"bold", label:`Whip the party hard: tell every member how to vote on the bill, and make them.`,
      note:`The whips will press the undecided members until they agree, spending the party's goodwill to secure the votes now. Members who are pressed twice remember it, and the party's loyalty to its leadership falls. Voters see a government in command of its benches.`,
      effects:[{ flag:"whip_briefed" }, { move:{ "loyalty.cu":-6 } }, { move:{ "public_standing":3 } }, { flag:"whipped_own_side" }],
      result:`The whips work the tea room until the division bells. The members they reach twice vote as asked, and The Spindle, the Commonwealth's newspaper of record, prints how many members they had to press.` }
  ]},

/* ---------- CHAPTER TWO — the division and its consequences ----------
   Every event below is tagged chapter:2, so none of them can fire until
   something applies {chapter:2}. The opening is authored (prologue:2),
   the rest is a weighted pool. */

{ id:"ch2_open", chapter:2, prologue:2, once:true,
  title:"Thursday",
  speaker:null,
  body:`The bill to make copies of people into persons after forty hours is called
to a vote at two this afternoon. The Life Support panel, the six functional
members elected by life-support engineers, met at nine, and nobody has told
you what it decided. The whips have stopped pretending they can count the
functional vote.

The bill must carry among the functional members as well as the elected
ones. You have the morning.`,
  choices:[
    { posture:"measured", label:"Spend the morning with your own party's members",
      effects:[{move:{"loyalty.cu_maintenance":6}},{move:{"loyalty.cu_halloran":4}},
               {flag:"whipped_own_side"}],
      result:"Five of your members who meant to abstain will now vote for the bill. None of them is a functional member, so the functional count does not change." },
    { posture:"bold", label:"Spend it on the functional members outside the Alliance of Business and Government",
      effects:[{move:{"loyalty.fh":5}},{move:{"loyalty.hul":3}},{move:{"solvency": -6000}},
               {flag:"lobbied_functional"}],
      result:`You offer six billion dollars of measures their members want. Two members of the Freehold Party, which speaks for leaseholders, agree to consider the bill. The functional count needs more than two.` },
    { posture:"cautious", label:"Let it fall and be seen to have tried",
      effects:[{move:{"public_standing":4}},{move:{"loyalty.psa":-10}},
               {flag:"let_it_fall"},
               {wire:"GOVERNMENT SIGNALS IT WILL NOT DELAY THE THRESHOLD DIVISION"}],
      result:`The country sees a government that tried. The New Progressive Party, which joined the government for this bill, sees one that gave up.` }
  ]},

/* REACH: gb_approach's licensure carve-out choice sets licensure_carveout_offered. */
{ id:"ch2_carveout_price", chapter:2, weight:80, once:true,
  when:{ flags:["licensure_carveout_offered"] },
  title:"What the carve-out costs",
  speaker:"gb_chair",
  body:`Kazuya Tanako, who chairs the Life Support panel, has put the panel's offer
in writing. It will let the divergence threshold fall to forty hours if the
licensing rules stay as they are, and it will not bargain over the details.

In practice, a copy that has run separately for forty-one hours would become
a person. It could own property and vote in a district, but it could not
hold a life-support licence. That means it could not vote in the functional
seat that represents the work it does every day.

The New Progressive Party, which joined the government to pass the bill,
will read the clause within the hour.`,
  choices:[
    { posture:"cautious", label:"Accept: a right that can be used now is worth more than one that cannot.",
      effects:[{law:{divergence_threshold_hours:40}},{bill:{divergence:{stage:"passed",dead:true}}},
               {move:{"loyalty.psa":-18}},{move:{"loyalty.gb":10}},{move:{"public_standing":6}},
               {flag:"carveout_taken"},
               {queue:[{event:"ch2_psa_conference",after:2}]},
               {wire:`THRESHOLD BILL CARRIES WITH LICENSURE CARVE-OUT; NPP CONFERENCE CALLED`}],
      result:"The bill passes with the exemption. The New Progressive Party votes for it, and will spend the next election campaign denouncing the exemption it voted for." },
    { posture:"bold", label:"Refuse: a vote that excludes the voter's own profession is not a full vote.",
      effects:[{bill:{divergence:{stage:"defeated",dead:true}}},{move:{"loyalty.psa":8}},{move:{"loyalty.gb":-6}},
               {move:{"public_standing":-5}},
               {flag:"carveout_refused"},
               {wire:"THRESHOLD BILL FALLS ON THE FUNCTIONAL DIVISION"}],
      result:`The bill fails among the functional members, as the count said it would. The New Progressive Party respects the refusal.` }
  ]},

/* REACH: queued by ch2_carveout_price's 'take it' choice. */
{ id:"ch2_psa_conference", chapter:2, queuedOnly:true, once:true,
  title:"The conference votes",
  speaker:null,
  body:`The New Progressive Party's conference has voted to instruct its members of
Parliament to review whether the party should stay in the coalition. The
motion is not binding; conference motions never are.

Most of the six hundred delegates are emulated minds. The party pays for
them to run at a high clock rate, faster than real time, so a debate that
took them four hours of their own time was over in far less on the clock.`,
  choices:[
    { posture:"bold", label:"Go and speak to them yourself",
      effects:[{move:{"loyalty.psa":12}},{move:{"public_standing":-4}}],
      result:"You are heard politely, and the party's leadership is grateful you came. Thirty-one delegates walk out during the second half, and the walkout is what the news reports." },
    { posture:"cautious", label:"Send the Chief Whip and stay away",
      effects:[{move:{"loyalty.psa":-6}},],
      result:"The Chief Whip reports that it went as well as it could have, which is what he reports about everything. The delegates noticed that you did not come." }
  ]},

{ id:"substrate_price_bite", chapter:2, weight:88, once:true,
  /* 104, not 112 (design/40 E1): the opening is at rest now, and 112 was
     reached in every run only because substrate drifted to 117 on its own */
  when:{ priceAbove:{substrate:104}, flagsAbsent:["substrate_bite_seen"] },
  title:"What the rent did",
  speaker:"ansar",
  body:`Nobody legislated for this. The substrate index, the price of the computing
capacity emulated people run on, has been above 112 for three weeks, twelve
per cent above its usual level. Emulated people pay rent for the hardware
they run on, and in the low band many can no longer pay it.

When they cannot pay, they are moved to the tier-four register and switched
off first. On Homestead, the low-band station of 880,000 people, the
register has grown by several thousand without any announcement, because
none was needed: the price rose and people stopped running.

Sevi Ansar, a resident of Homestead's Deck 9, has written to every member
who sits for a low-band seat, eleven of them from your party. "You did not
vote for this," the letter says. "That is the part I would like explained."`,
  choices:[
    { posture:"measured", label:"Emergency substrate subsidy, funded from the reserve",
      effects:[{move:{"price.substrate":-16}},{move:{"solvency": -14000}},{move:{"public_standing":5}},
               {move:{"loyalty.cu_maintenance":8}},{move:{"loyalty.psa":6}},{flag:"substrate_bite_seen"},
               {wire:"EMERGENCY SUBSTRATE SUBSIDY ANNOUNCED; INDEX FALLS"}],
      result:"The subsidy costs fourteen billion dollars from the reserve and brings the index down by sixteen points. Your maintenance members approve. The money does not come back." },
    { posture:"cautious", label:"Say plainly that the rent is a market outcome and the government does not set it",
      effects:[{move:{"public_standing":-9}},{move:{"loyalty.cu_maintenance":-13}},{move:{"loyalty.psa":-10}},{move:{"loyalty.cl":7}},
               {flag:"substrate_bite_seen"},{flag:"denied_the_rent"},
               {wire:"PM: SUBSTRATE RENTS \"NOT A MATTER FOR MINISTERS\""}],
      result:"It is not true: the government's appropriation decides how much substrate the Commonwealth can run. Eleven of your members for low-band seats know it, and so do the New Progressive Party's. Only the Liberals approve." },
    { posture:"bold", label:"Bring forward the Substrate (Public Stake) Bill and stake the session on it",
      effects:[{bill:{substrate_public_stake:{stage:"second_reading"}}},
               {move:{"loyalty.psa":14}},{move:{"loyalty.cl":-12}},
               {flag:"substrate_bite_seen"},{flag:"staked_on_public_stake"},
               {wire:"GOVERNMENT ADVANCES PUBLIC STAKE BILL AFTER RENT RISE"}],
      result:"The bill would take a controlling public stake in the three largest substrate providers, and it goes to second reading. The New Progressive Party is delighted. The Liberal Party begins counting the votes to stop it." }
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
  when:{ priceAbove:{substrate:103}, suspendedAbove:{federal:73000},
         flagsAbsent:["shed_crisis_seen"] },
  title:`Seventy-three thousand`,
  speaker:null,
  body:`More than seventy-three thousand people across the thirty stations are now
held in suspension, their minds kept intact but not running. The figure is
published every quarter and has never been read aloud in Parliament.

It has now passed the level the Allocation Act, the law that governs a
shortage, calls a federal strain, and the Act's consequence followed
automatically. A shed order was posted at 06:00: on Homestead, the low-band
station of 880,000 people, eleven hundred more people from tier four will be
switched off from the next sitting.

No vote authorised it and none was needed. The substrate price rose, nothing
in the appropriation brought it down, and the order followed from the Act.
The figure has been on the news wire for four hours, and the government has
said nothing.`,
  choices:[
    { posture:"bold", label:"Intervene: requisition substrate capacity and suspend the order.",
      effects:[{move:{"price.substrate":-12}},{move:{"solvency": -16000}},{move:{"public_standing":7}},
               {move:{"loyalty.cu_maintenance":10}},{move:{"loyalty.psa":8}},
               {flag:"shed_crisis_seen"},{flag:"intervened_in_shed"},
               {wire:"GOVERNMENT REQUISITIONS SUBSTRATE; SHED ORDER SUSPENDED"}],
      result:"The order is suspended and the reserve pays sixteen billion dollars for the capacity. The next order will be larger, because nothing has changed the price." },
    { posture:"measured", label:"Let it stand: the order follows the law.",
      effects:[{move:{"public_standing":-12}},{move:{"loyalty.cu_maintenance":-14}},{move:{"loyalty.psa":-11}},
               {move:{"loyalty.hul":9}},{flag:"shed_crisis_seen"},{flag:"let_the_shed_stand"},
               {wire:`PM DECLINES TO SUSPEND SHED ORDER; HOMESTEAD DELEGATION WALKS OUT`}],
      result:"Eleven hundred people stop running, lawfully, on a schedule the government neither chose nor refused. The engineers' party approves; the country, your maintenance members and the New Progressive Party do not." },
    { posture:"cautious", label:"Blame the market, and announce a review of how the substrate price is set.",
      effects:[{move:{"public_standing":-4}},{move:{"loyalty.cu_maintenance":-6}},
               {flag:"shed_crisis_seen"},{flag:"blamed_the_drift"},
               {wire:"PM ORDERS REVIEW OF SUBSTRATE PRICE MECHANISM AFTER SHED ORDER"}],
      result:"The review will report to a minister, who will report to you. The number keeps climbing while it does." }
  ]},

{ id:"thermal_squeeze", chapter:2, weight:70, once:true,
  /* 108, a margin under about ten: the squeeze it is named for. At 112 it
     fired in every run from the drift and in none since the opening came to
     rest (design/40 E1), and its first choice is a rung of the ladder. */
  when:{ priceAbove:{thermal:108}, flagsAbsent:["thermal_squeeze_seen"] },
  title:"The price of heat",
  speaker:null,
  body:`The Commonwealth's thermal quota, the right to shed a share of its heat
through the radiators, is bought and sold on an exchange. For eleven years
the price barely moved. It is moving now.

The thermal margin, the gap between the heat the stations can shed and the
heat they produce, has narrowed, and a thin market sets a high price. Ember
Ridge, in the middle band, is bidding for quota to keep its own people
running. Farstead, in the far band, is bidding against it, because its
substrate farms run hot and have no choice. Both are bidding with money that
came, in the end, from the government's appropriation.`,
  choices:[
    { posture:"measured", label:"Buy quota on the open market and hold the price down",
      effects:[{move:{"price.thermal":-14}},{move:{"solvency": -18000}},{move:{"loyalty.hul":6}},
               {move:{"thermal_margin":5}},{flag:"thermal_squeeze_seen"},
               {wire:"GOVERNMENT BUYS THERMAL QUOTA AT MARKET; PRICE FALLS"}],
      result:"The Treasury buys quota for eighteen billion dollars. The price falls for every station and the margin widens, and the engineers' party approves." },
    { posture:"bold", label:"Cap the price on the exchange.",
      effects:[{move:{"price.thermal":-8}},{move:{"loyalty.hul":-12}},{move:{"loyalty.cl":-9}},
               {move:{"public_standing":4}},{flag:"thermal_squeeze_seen"},{flag:"capped_the_exchange"},
               {wire:"GOVERNMENT CAPS THERMAL EXCHANGE; ENGINEERS WARN OF UNDERINVESTMENT"}],
      result:"The cap holds the price down, and the public approves. It also removes the profit that pays for new radiators, and that shortfall will show in about four years. The engineers' party and the Liberals object." },
    { posture:"cautious", label:"Leave the market alone: scarce things have prices.",
      effects:[{move:{"public_standing":-7}},{move:{"loyalty.hul":7}},{move:{"thermal_margin":-4}},
               {flag:"thermal_squeeze_seen"},{flag:"left_thermal_market"},
               {wire:"PM: THERMAL PRICE 'A SIGNAL, NOT A SCANDAL'"}],
      result:`The stations that cannot pay are the first to cut their use, and the margin falls four points.` },
    /* and the next rung, whichever of the first two it is (design/38 §7) */
    { posture:"measured", label:"Ask the stations to draw down load instead",
      when:{ siNotMade:"rung1_conservation" },
      note:"SI 2080/61, the first emergency order. It costs almost nothing and buys " +
           "almost nothing, and it is the first of nine.",
      effects:[{si:"rung1_conservation"},{flag:"thermal_squeeze_seen"}],
      result:"The appeal goes out, the stations cut the load they can spare, and there is a little less heat for the exchange to price." },
    { posture:"bold", label:"Run emulated minds more slowly for the duration",
      when:{ flags:["rung1_tried"], siNotMade:"rung2_clockrate" },
      note:"SI 2080/62, the second emergency order. It slows the emulated blocs by four " +
           "per cent, which buys margin out of the patience of the people who run fastest.",
      effects:[{si:"rung2_clockrate"},{flag:"thermal_squeeze_seen"}],
      result:"Emulated minds run slower, produce less heat, and the margin widens. The New Progressive Party calls it a wage cut, and it is one: emulated workers are paid for the hours they experience, and they now experience fewer." }
  ]},

/* REACH: party_loyalty below 22; whipping and defeats drive it down. */
{ id:"party_fracture", chapter:2, weight:80, once:true,
  when:{ scalarBelow:{party_loyalty:22}, flagsAbsent:["party_fracture_seen"] },
  title:"The tea room has a count",
  speaker:null,
  body:`Nobody has called a leadership ballot or asked for one. What has happened is
smaller and worse: your party has stopped bringing its arguments to you.
Three motions went to committee this week, and you learned of all three
afterwards.

The Chief Whip counts the members who will vote with the government even
against their own party's wishes. The count has been shrinking for a month.`,
  choices:[
    { posture:"bold", label:"Go to them: put the whole programme before the backbench.",
      effects:[{move:{"party_loyalty":14}},{move:{"loyalty.cu_maintenance":6}},
               {move:{"public_standing":-3}},{flag:"party_fracture_seen"},
               {wire:"PM ADDRESSES OWN BACKBENCH AFTER WEEKS OF DRIFT"}],
      result:"You give them the argument and the timetable. Half of them only wanted to be asked, and the party's loyalty recovers." },
    { posture:"measured", label:"Reshuffle: promote two of them and sack one.",
      effects:[{move:{"party_loyalty":6}},{move:{"loyalty.cu_halloran":-10}},{move:{"loyalty.cu_maintenance":-4}},
               {flag:"party_fracture_seen"},{flag:"fracture_reshuffle"},
               {wire:"MINI-RESHUFFLE AFTER BACKBENCH UNREST"}],
      result:"The promotions are read as a bribe and the sacking as a warning, and both readings are correct. The Hard Left takes the sacking personally." },
    { posture:"cautious", label:"Ignore it: a party that argues is a party that is alive.",
      effects:[{move:{"party_loyalty":-8}},{move:{"public_standing":2}},{flag:"party_fracture_seen"},
               {wire:"PM DISMISSES TALK OF PARTY UNREST AS 'A WORKING PARTY WORKING'"}],
      result:"The party goes on arguing without you, and its loyalty to you keeps falling." }
  ]},

{ id:"reserve_low", chapter:2, weight:75, once:true,
  when:{ scalarBelow:{solvency:14000}, flagsAbsent:["reserve_low_seen"] },
  title:"What is left of the reserve",
  speaker:null,
  body:`The appropriation is spent, and so is the contingency. What remains in the
reserve, the Treasury's cash in hand, is a figure the Treasury will not put
in writing, because a figure in writing becomes a fact.

The Treasury can still borrow. Earth's banks will lend under the Standby
Facility until the reserve falls below the level the loan agreement
requires. The Underwriters, the Commonwealth's own insurers and mutual
societies, will buy its notes while the thermal margin holds. Each lender
charges what the quarrel with Earth or the margin says it should.

The other option is to stop paying for something the Commonwealth has
already promised to pay for.`,
  choices:[
    { posture:"measured", label:"Raise the tariff on cargo carried by the space elevators.",
      effects:[{move:{"solvency": 16000}},{move:{"price.substrate":6}},{move:{"loyalty.cl":-10}},
               {move:{"loyalty.cu_maintenance":-5}},{flag:"reserve_low_seen"},{flag:"raised_tariff"},
               {wire:"TETHER TARIFF RAISED TO REFILL RESERVE; SHIPPERS OBJECT"}],
      result:"The tariff brings in sixteen billion dollars. Imported hardware costs more, so the substrate price rises, and the low band pays the difference in people who can no longer afford to run." },
    { posture:"cautious", label:"Defer the maintenance budget: it is not due this session.",
      effects:[{move:{"solvency": 10000}},{move:{"thermal_margin":-9}},{move:{"loyalty.hul":-11}},
               {flag:"reserve_low_seen"},{flag:"deferred_maintenance"},
               {wire:"MAINTENANCE APPROPRIATION DEFERRED TO NEXT SESSION"}],
      result:"Ten billion dollars are saved and nothing fails this session. The radiators that go unmaintained cost nine points of thermal margin, and the engineers' party is furious." },
    { posture:"bold", label:"Spend what is left and let the next government find the rest.",
      effects:[{move:{"public_standing":5}},{move:{"loyalty.cu_maintenance":7}},
               {flag:"reserve_low_seen"},{flag:"spent_the_reserve"},
               {wire:"PM COMMITS RESERVE TO CURRENT PROGRAMME"}],
      result:`The government spends what is left. It is popular now, and it is a bet that the bill falls due under somebody else.` }
  ]},

/* REACH: public_standing below 26; the drift and hard choices drive it down. */
{ id:"standing_low", chapter:2, weight:78, once:true,
  when:{ scalarBelow:{public_standing:26}, flagsAbsent:["standing_low_seen"] },
  title:"A government nobody is for",
  speaker:"ceyhan",
  body:`The polls are not catastrophic. They are flat, which is worse: voters do not
hate the government and do not trust it, and the government's standing has
been falling all session.

Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper
of record, asks the question the numbers are really about. "If you lost
tomorrow, who would notice? Not who would be pleased. Who would notice."`,
  choices:[
    { posture:"bold", label:"Answer with something voters will notice: a ten-billion-dollar programme.",
      effects:[{move:{"public_standing":12}},{move:{"solvency": -10000}},{move:{"loyalty.psa":5}},
               {flag:"standing_low_seen"},{flag:"bought_attention"},
               {wire:"GOVERNMENT ANNOUNCES RELIEF PACKAGE AS POLLS FLATLINE"}],
      result:"The programme costs ten billion dollars and the government's standing rises. In a month voters will ask what it bought." },
    { posture:"cautious", label:"Answer honestly: a government is not a popularity contest.",
      effects:[{move:{"public_standing":-5}},{move:{"loyalty.cu_maintenance":6}},{move:{"rel.ceyhan":6}},
               {flag:"standing_low_seen"},{flag:"refused_the_poll"},
               {wire:"PM: 'I DID NOT COME HERE TO BE LIKED'"}],
      result:"It is the most quotable thing you have said in weeks. Ceyhan likes it, your maintenance members like it, and voters take it as an admission." },
    { posture:"measured", label:"Change the subject: reshuffle the cabinet.",
      effects:[{move:{"public_standing":7}},{move:{"party_loyalty":-7}},{move:{"loyalty.cu_loyalists":-8}},
               {flag:"standing_low_seen"},{flag:"reset_the_story"},
               {wire:"CABINET RESHUFFLE ANNOUNCED; SENIOR MINISTERS OUT"}],
      result:"The reshuffle leads the news and standing recovers. The ministers moved out were the Soft Left's, the leadership's own current, and they now brief against you." }
  ]},

/* REACH: taking the carve-out sets divergence_threshold_hours to 40. */
{ id:"threshold_consequence", chapter:2, weight:85, once:true,
  when:{ lawBelow:{divergence_threshold_hours:100}, flagsAbsent:["threshold_seen"] },
  title:"Two million new persons, and the rolls",
  speaker:null,
  body:`The divergence threshold has fallen, so the electoral rolls must change.
Every copy of a person that has run separately for longer than the new limit
is now a person. The Registry must find out how many there are, where each
of them votes, and whether any was already counted somewhere else.

Officials estimate the number at 1.9 million. Six districts must be redrawn,
and two of them are held by your party. The functional rolls will grow by an
amount nobody can estimate until the Registry has finished, and the Registry
has said in writing that it will not finish before the next election.`,
  choices:[
    { posture:"measured", label:"Fund the Registry: whatever it costs, the rolls must be accurate.",
      effects:[{move:{"solvency": -14000}},{move:{"public_standing":8}},{move:{"loyalty.psa":9}},
               {move:{"loyalty.cl":-5}},{flag:"threshold_seen"},{flag:"funded_the_registry"},
               {wire:"EMERGENCY REGISTRY FUNDING AFTER THRESHOLD CHANGE"}],
      result:"The Registry receives fourteen billion dollars. The rolls will be accurate, late and expensive, and the New Progressive Party approves." },
    { posture:"bold", label:"Set the new electors aside until after the election.",
      effects:[{move:{"public_standing":-13}},{move:{"loyalty.psa":-16}},{move:{"loyalty.cu_maintenance":4}},
               {flag:"threshold_seen"},{flag:"set_aside_new_electors"},
               {wire:"GOVERNMENT DEFERS ENFRANCHISEMENT OF NEW PERSONS TO NEXT PARLIAMENT"}],
      result:"The new persons will not vote until after the election. 1.9 million people are told their rights begin after the vote they would have used them in." },
    { posture:"cautious", label:"Leave the old boundaries: they are still legal.",
      effects:[{move:{"public_standing":-6}},{move:{"loyalty.cu_maintenance":-7}},{move:{"loyalty.psa":-4}},
               {flag:"threshold_seen"},{flag:"kept_wrong_boundaries"},
               {wire:"BOUNDARY COMMISSION OVERRULED; REDRAW DEFERRED"}],
      result:"The districts keep boundaries that no longer match who lives in them. The election will be fought on a map everyone knows is wrong." }
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
  body:`Twelve of your party's members have signed, and twelve is enough to force a
ballot on your leadership. It is not a vote of Parliament. It is a vote of
your party's members of Parliament, held in a committee room on a paper that
is destroyed afterwards.

If you lose it, you lose the leadership of the party and the premiership
with it.`,
  choices:[
    { posture:"cautious", label:"Let the ballot be held, and say nothing.",
      effects:[{flag:"ballot_seen"},{move:{"loyalty.cu_maintenance":6}},{move:{"loyalty.cu_loyalists":-4}},
               {wire:"LEADERSHIP BALLOT HELD; PM SURVIVES"}],
      result:"You survive. Every member who signed knows exactly how close it was, and how many more names it would take next time." },
    { posture:"bold", label:"Speak first, and remind them what replacing you would cost.",
      effects:[{flag:"ballot_seen"},{move:{"loyalty.cu_halloran":-8}},{move:{"loyalty.cu_loyalists":8}},
               {move:{"public_standing":3}},
               {wire:"PM ADDRESSES CAUCUS BEFORE BALLOT; SURVIVES"}],
      result:"The speech carries the ballot, and the Soft Left rallies to you. The Hard Left does not forgive it: the party decided, but it did not agree." }
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
  body:`A minister's resignation letter is on your desk before the morning briefing.
The minister told the newspaper first, the newspaper called your office, and
the office said nothing.

A promise was made in the minister's name and not kept, and a minister who
will not resign over that is made to. The post is now vacant, and a
department with no minister cannot make an order until someone is appointed.`,
  choices:[
    { posture:"cautious", label:"Fill it from the Soft Left, the leadership's own current.",
      effects:[{move:{"party_loyalty":5}},{move:{"public_standing":-2}},
               {wire:"VACANT POST FILLED AFTER MINISTERIAL RESIGNATION"}],
      result:"The new minister is grateful, and the party's loyalty rises. Gratitude has to be renewed." },
    { posture:"bold", label:"Leave it empty, and do the work from your own office.",
      effects:[{move:{"public_standing":-4}},{flag:"post_left_vacant"},
               {wire:"PM LEAVES MINISTERIAL POST VACANT"}],
      result:"The department can make no orders until someone holds the post, and the opposition knows it." }
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
  body:`The Life Support panel met on Thursday, as it always does, and agreed the
answer its members have given every government since 2072.

"The Alliance has nine seats," says Kazuya Tanako, who chairs the panel,
"and not one of them will vote with a government that has changed, by
licensing order, who may vote for our seats. Count again if you like. The
count will not change."

She is not angry, which would at least have given you something to work
with. She has done this job longer than the Commonwealth has existed, and
she is telling you what her members will do, not what she thinks of you.`,
  choices:[
    { posture:"cautious", label:"Take the answer. Stop asking.",
      effects:[{flag:"guild_met"},{move:{"rel.gb_chair":5}},{move:{"loyalty.gb":5}}],
      result:"You accept the panel's refusal. A government that takes no for an answer keeps her respect, which the next approach will need." },
    { posture:"measured", label:"Ask what it would take, and make her name it.",
      effects:[{flag:"guild_met"},{flag:"guild_price_asked"},
               {move:{"rel.gb_chair":-6}},{move:{"loyalty.gb":-4}}],
      result:"She names it, and it is what you already knew: leave the roll alone. Making her say it in the room costs you her goodwill." },
    { posture:"bold", label:"Remind her that the functional seats' sunset clause has been extended four times.",
      when:{ flagsAbsent:["threatened_guild_bench"] },
      effects:[{flag:"guild_met"},{flag:"threatened_guild_bench"},
               {move:{"rel.gb_chair":-12}},{move:{public_standing:2}}],
      result:"\"Extend it a fifth time,\" she says. \"You will need us for that too.\" Changing the clause is a Charter amendment, and a Charter amendment needs the functional members' votes." }
  ]},

/* REACH: queued by the commission_review initiative. */
{ id:"review_reports", queuedOnly:true, once:true,
  title:"What the standing orders have shed",
  speaker:null,
  body:`The review the government commissioned has finally counted the people
suspended under standing shed orders: orders already in force that let the
engineering authority switch people off in a shortage without a new decision
each time. The total is twenty-nine thousand.

No House has been told the number before, because nothing required it. Every
suspension was lawful and recorded, and the total grew a quarter at a time,
at a rate the orders allow. The opposition will quote it against the
government by the afternoon.`,
  choices:[
    { posture:"bold", label:"Read the number into the record yourself.",
      when:{ flags:["review_full"] },
      effects:[{flag:"shed_number_published"},{move:{public_standing:8}},
               {move:{"loyalty.cu_maintenance":10}},{move:{"loyalty.hul":9}},
               {wire:`PM READS SHED ORDER TOTAL INTO THE HOUSE: TWENTY-NINE THOUSAND`}],
      result:"You read the figure to the House yourself. Because an independent review produced it, it carries weight, and the government gets credit for publishing it. The Trades Left and the engineers' party both approve." },
    { posture:"cautious", label:"Take the number and sit on it.",
      when:{ flags:["review_thin"] },
      effects:[{flag:"shed_number_held"},{move:{public_standing:-3}}],
      result:"The figure stays in a departmental note. A note is easy to keep, and just as easy to leak." },
    { posture:"measured", label:"Announce a standing register, published quarterly.",
      effects:[{flag:"shed_register_promised"},{move:{public_standing:5}},
               {move:{"loyalty.psa":6}},{move:{"loyalty.gb":-5}},
               {wire:"GOVERNMENT TO PUBLISH SHED ORDER REGISTER QUARTERLY"}],
      result:"The number will be published every quarter. Supporters say that makes it public for good; critics say routine publication will stop it mattering. The New Progressive Party approves and the Alliance of Business and Government does not." },
    { posture:"cautious", label:"Do nothing with it. It was a review, not a policy.",
      effects:[{flag:"review_filed"},{move:{"loyalty.cu_maintenance":-6}}],
      result:"The review is filed. Within a month a Trades Left member will ask for it by name in the House." }
  ]},

/* REACH: queued by the state_the_position initiative. */
{ id:"position_lands", queuedOnly:true, once:true,
  title:"What saying it did",
  speaker:"ceyhan",
  body:`The government's position on the divergence threshold, the number of hours
after which a copy of a person becomes a separate person, is now on the
record, and it cannot be taken back.

Ivor Ceyhan will quote it in tomorrow's column in The Spindle, the
Commonwealth's newspaper of record. Anil Devi, the Chief Whip, has written
it down too, beside the names of the members who will hold the government to
it.`,
  choices:[
    { posture:"cautious", label:"Leave it where it is. It was said and it stands.",
      effects:[{flag:"position_public"},{move:{"loyalty.cu_maintenance":4}},
               {move:{"rel.ceyhan":5}}],
      result:`Nothing more is said. The statement stays on the record as it was made.` },
    { posture:"bold", label:"Repeat it, and make the government's case for it.",
      effects:[{flag:"position_public"},{flag:"position_campaigned"},
               {move:{public_standing:5}},{move:{"loyalty.cu_maintenance":-8}},
               {move:{"loyalty.psa":6}},
               {wire:"PM CAMPAIGNS ON THRESHOLD POSITION; MAINTENANCE BENCHES OBJECT"}],
      result:"The position becomes the government's for good. The New Progressive Party is pleased and the Trades Left is not, and dropping the position later will now cost more." },
    { posture:"measured", label:"Soften it. Say it was a preference, not a commitment.",
      when:{ flags:["position_offhand"] },
      effects:[{flag:"position_softened"},{move:{"rel.ceyhan":-8}},
               {move:{"loyalty.psa":-7}},{move:{"loyalty.cu_maintenance":5}}],
      result:"Calling an answer at Question Time a preference is easy. It is also the second time the same audience has watched the government retreat, and the New Progressive Party and Ceyhan both notice." }
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

{ id:"margin_thin", chapter:2, weight:72, maxFires:2,
  when:{ scalarBelow:{ thermal_margin:8 } },
  title:"Below ten",
  speaker:"vellan",
  body:`The thermal margin, the gap between the heat the stations can shed and the
heat they produce, is below ten points. Nothing has failed. The margin is
the room that keeps anything from failing, and it is now thinner than the
department will certify as safe for a whole session.

Suravaram Vidyasagar, the Minister for Life Support, is not asking for a
decision. The question is simpler: how thin the government is willing to let
the margin get.`,
  choices:[
    { posture:"bold", label:"Buy cooling capacity now, whatever it costs.",
      effects:[{ move:{ "thermal_margin":8 } }, { move:{ "solvency": -10000 } },
               { move:{ "loyalty.hul":6 } },
               { wire:"EMERGENCY THERMAL PURCHASE TO WIDEN THE MARGIN" }],
      result:`The reserve pays ten billion dollars and the margin widens by eight points. The engineers' party approves.` },
    { posture:"cautious", label:"Hold, and let the department put its warning on the record.",
      effects:[{ move:{ "thermal_margin":-2 } }, { move:{ "public_standing":-4 } },
               { move:{ "loyalty.hul":-8 } },
               { wire:"PM DECLINES THERMAL PURCHASE; DEPARTMENT WITHDRAWS CERTIFICATION" }],
      result:"The warning is on the record, and so is the decision to ignore it. The margin keeps falling." }
  ]},

/* REACH: treasury is vacant at the opening; fires once the appointment control is left alone. */
{ id:"the_vacant_post", chapter:2, weight:68, once:true,
  when:{ postVacant:["treasury"] },
  title:"The empty brief",
  speaker:"whitlam",
  body:`The Treasury has a department, permanent officials and questions being
answered in the absence of a minister. The absence has lasted too long to be
an accident.

Imre Whitlam, the Leader of the House, states the rule rather than the
politics. A department with no minister cannot make an order. A budget with
no Treasurer is argued by officials and signed by nobody.`,
  choices:[
    { posture:"cautious", label:"Appoint a Treasurer today.",
      effects:[{ cabinet:{ treasury:{ holder:"skye", party:"cu" } } },
               { move:{ "public_standing":3 } },
               { wire:"TREASURY BRIEF FILLED" }],
      result:"Aster Skye takes the Treasury. The department has a minister to answer questions and sign its orders." },
    { posture:"bold", label:"Leave it empty: the work is being done.",
      effects:[{ flag:"treasury_left_vacant" }, { move:{ "public_standing":-5 } }],
      result:"The Treasury can make no orders until someone holds the post, and the opposition knows it." }
  ]},

/* REACH: six signatures on Czarnecki's paper (the_paper's open choice). */
{ id:"signatures_build", chapter:2, weight:74, once:true,
  when:{ signaturesAtLeast:6 },
  title:"The names on the paper",
  speaker:"ceyhan",
  body:`Six of your party's members have signed a letter that does not say what it
is for. Six is half the twelve signatures that would force a ballot on your
leadership, and enough to tell the whips that twelve is within reach. The
number reaches the lobby the same afternoon.

Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper
of record, puts the choice plainly: the government can find out what the six
want, or wait to see how many they become.`,
  choices:[
    { posture:"cautious", label:"Meet them, and ask what the letter is really about.",
      effects:[{ move:{ "loyalty.cu_maintenance":7 } }, { move:{ "loyalty.cu_halloran":4 } },
               { move:{ "public_standing":-3 } },
               { wire:"PM MEETS SIGNATORIES OF BACKBENCH LETTER" }],
      result:`Half of them only wanted to be asked, and those three take their names off the letter.` },
    { posture:"bold", label:"Warn them where this ends.",
      effects:[{ move:{ "loyalty.cu_loyalists":6 } }, { move:{ "loyalty.cu_maintenance":-8 } },
               { wire:"PM WARNS THE BACKBENCH OVER LEADERSHIP LETTER" }],
      result:"The Soft Left closes ranks behind you. So do the six, and your maintenance members resent the warning." }
  ]},

{ id:"a_partner_in_debt", chapter:2, weight:70, once:true,
  when:{ capitalBelow:{ rv:-2 } },
  title:"The ledger, read aloud",
  speaker:"park",
  body:`Ryan Jung-Hee Park, leader of the Congregational Democratic Alliance, the
smallest party in your coalition, has come about the ledger: the whips'
running account of what each partner has done for the government and
received in return.

By that account the government owes the Alliance. It has voted for three
government measures it did not write, and it holds no ministry that would
repay it with a fourth. "We are a partner who is owed," Park says, "not one
who owes. The difference is the next bill."`,
  choices:[
    { posture:"cautious", label:"Give the Alliance's bill the next slot on the order paper.",
      effects:[{ move:{ "capital.rv":3 } }, { move:{ "loyalty.rv":9 } },
               { move:{ "public_standing":-2 } }],
      result:"The ledger moves toward even, and the government gives up one of its slots of order-paper time to do it. The Alliance's members are pleased." },
    { posture:"bold", label:"Tell Park the account stands as it is.",
      effects:[{ move:{ "capital.rv":-1 } }, { move:{ "loyalty.rv":-8 } },
               { move:{ "party_loyalty":4 } }],
      result:`Your own party likes the firmness. The Alliance's members begin totting up what they are owed, and they will present the figure.` }
  ]},

/* REACH: SI 2080/44 in force. */
{ id:"the_licensing_reaction", chapter:2, weight:82, once:true,
  when:{ siInForce:["si_2080_44"] },
  title:"What the order did to the panel",
  speaker:"gb_chair",
  body:`The Life Support Engineering (Licensing) Order has widened who counts as a
licensed life-support engineer, and so who votes for the six Life Support
seats. The new electors will move two of those seats from the Alliance of
Business and Government to your party. The Life Support panel, whose members
used to decide those seats, no longer does.

"I have certified life support for forty years," says Kazuya Tanako, the
panel's chair. "The order is lawful. The minister had the power and used it.
The members I represent will remember which government did."`,
  choices:[
    { posture:"cautious", label:"Offer the panel the job of writing life-support standards, as compensation.",
      effects:[{ move:{ "rel.gb_chair":10 } }, { move:{ "loyalty.gb":6 } },
               { move:{ "public_standing":-3 } },
               { wire:"STANDARDS BRIEF OFFERED TO THE LICENSING PANEL" }],
      result:"It is real work and real influence, and Tanako accepts it coolly. It does not give the panel back its electorate." },
    { posture:"bold", label:"Tell Tanako the order stands.",
      effects:[{ move:{ "rel.gb_chair":-8 } }, { move:{ "loyalty.hul":4 } }],
      result:`She expected nothing else, and came in person so that the refusal would have a witness. The engineers' party approves of the firmness.` }
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
  body:`Adaeze Fenwick, the Minister for Law and the Charter, brings a suggestion
and says at once that it is not hers. The President's office has asked,
privately, whether the government would take the divergence threshold out of
Parliament's hands altogether.

Instead of a line in law, whether forty hours or 168, a standing panel would
decide case by case whether a particular copy is a person, and publish no
rule at all.

"Parliament can fight over this bill for a year," Fenwick says. "Or the
question can be settled in private rooms, one case at a time, forever."`,
  choices:[
    { posture:"bold", label:"Set up the panel.",
      effects:[{ flag:"tribunal_established" },
               { move:{ "public_standing":-6 } }, { move:{ "loyalty.psa":-12 } },
               { move:{ "loyalty.gb":5 } },
               { wire:"TRIBUNAL ESTABLISHED ON THE DIVERGENCE QUESTION" }],
      result:"The question becomes an administrative one. The New Progressive Party, which made the bill its price for joining the government, will not forgive the government that set it aside." },
    { posture:"cautious", label:"Leave the question to Parliament.",
      effects:[{ flag:"tribunal_refused" }, { move:{ "loyalty.cu_maintenance":5 } },
               { move:{ "public_standing":2 } }],
      result:"The suggestion is declined in writing, the only way to decline the President's office. Your maintenance members approve." }
  ]},

  /* REACH: three signatures; reachable once the paper is opened. */
  { id:"the_federal_option", chapter:2, weight:72, once:true,
  when:{ signaturesAtLeast:3,
         flagsAbsent:["tribunal_established","federal_schedule","federal_refused"] },
  title:"Thirty thresholds",
  speaker:"laughon",
  body:`Nick Laughon, leader of Home Rule, the party of self-government for the
stations, asks for a meeting and does not waste it. Every answer the
government can give on the divergence threshold has a price in Parliament.
He has come to offer one that costs nothing there.

"A threshold for each station," he says. "Let each station set its own line,
Anselm Ring one and Homestead another, and let the Commonwealth say only
that it is not the Commonwealth's business. The union survives by not asking
the question nationally. That is all my party has ever asked for, and nobody
in this room pays for it."`,
  choices:[
    { posture:"bold", label:"Accept: let every station set its own threshold.",
      effects:[{ flag:"federal_schedule" },
               { move:{ "loyalty.sc":8 } }, { move:{ "loyalty.cu_maintenance":-6 } },
               { move:{ "public_standing":-4 } },
               { wire:"FEDERAL SCHEDULE: EACH STATION TO SET ITS OWN THRESHOLD" }],
      result:"There is no national question any more, and Home Rule is delighted. Your maintenance members know what was traded, and that they were not asked." },
    { posture:"cautious", label:"Refuse. One Commonwealth, one law.",
      effects:[{ flag:"federal_refused" }, { move:{ "loyalty.sc":-8 } },
               { move:{ "public_standing":3 } }],
      result:"Home Rule hears the answer it expected, and will ask again in the next Parliament, whoever governs." }
  ]},

/* PEOPLE, AND THE PRESS (T9). Fifty-four characters existed and ten had
   ever spoken. These four give the opposition front bench, the coalition
   deputy, the engineers' leader and One-G a voice, and each reads a
   condition the pool had never used. */

{ id:"the_deputy_warns", chapter:2, weight:69, once:true,
  when:{ loyaltyBelow:{ psa:38 } },
  title:"A word from the Deputy",
  speaker:"trottier",
  body:`Mandelina Trottier, the Deputy Prime Minister and leader of the New
Progressive Party, does not bring a complaint. She brings a count: her
party's members have stopped believing the government will ever deliver the
Divergence Threshold Bill, the price they joined it for.

"We have carried this government," she says. "Ask our conference what we
have been given in return."`,
  choices:[
    { posture:"cautious", label:"Promise the New Progressive Party the next slot on the order paper.",
      effects:[{ move:{ "capital.psa":2 } }, { move:{ "loyalty.psa":8 } },
               { move:{ "public_standing":-2 } }],
      result:`The promise is made and written down, and her members are reassured. A written promise can be produced later.` },
    { posture:"bold", label:"Tell her the coalition is not for sale.",
      effects:[{ move:{ "loyalty.psa":-6 } }, { move:{ "party_loyalty":3 } }],
      result:"It is the answer her conference predicted, and her members' loyalty falls. Your own party likes the firmness." }
  ]},

  /* REACH: des loyalty above 15; it starts there. */
  { id:"one_g_waiting", chapter:2, weight:59, once:true,
  when:{ loyaltyAbove:{ des:15 } },
  title:"The waiting list",
  speaker:"edelstein_powell",
  body:`Rachel Edelstein-Powell, leader of One-G, the party of people whose health
suffers in orbit, brings the number her party exists for. Eleven thousand
residents are waiting to be fitted with a body, and the list grows by four
hundred a month.

"Every one of them would vote for the party that shortened the list," she
says, "and every one of them knows it is the most expensive line in the
budget."`,
  choices:[
    { posture:"measured", label:"Promise the waiting list money in the next budget.",
      effects:[{ move:{ "loyalty.des":7 } }, { move:{ "public_standing":3 } },
               { move:{ "solvency": -3000 } }],
      result:`The promise costs three billion dollars now, and One-G will remember it when the budget is drawn up.` },
    { posture:"cautious", label:"Say the list is not this session's business.",
      effects:[{ move:{ "loyalty.des":-6 } }, { move:{ "loyalty.hul":3 } }],
      result:"One-G hears the answer it is used to hearing, and so does the waiting list. The engineers' party approves of the restraint." }
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
  setpiece:{ title:"The House is dissolved, and the Commonwealth goes to the polls" },
  when:{ dissolved:true },
  title:"The writs",
  speaker:null,
  body:`Parliament has been dissolved, and the Commonwealth has three weeks until a
general election. Every one of the chamber's 280 seats will be filled again.

The writs, the formal orders for the election, go to the returning officers
of 140 districts. The 100 list seats are shared out afterwards on the
national vote. The 40 functional members are elected by the members of their
professions and industries.

The government stays in office through the campaign, because the
Commonwealth is never without one. Everything it does in the next three
weeks will be done with the country watching, and the House will not sit
again until the votes are counted.

Every member goes home to a station and a roll of voters. The government
goes home to its record, which is what the voters are about to be asked
about.`,
  choices:[
    { label:"To the country.",
      effects:[{ chapter:3 }],
      result:"The writs are out. The campaign begins." }
  ]},

{ id:"ch3_the_campaign", chapter:3, prologue:1, once:true,
  title:"The campaign",
  speaker:"ceyhan",
  body:`The writs are out, and the campaign has three weeks to run. In all thirty
stations the parties are fighting over the same thing: whether voters should
judge the government on what it did this session or on what it promises to
do in the next.

Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper
of record, writes that a government which used its session well has already
made its case, and one which did not cannot make it in three weeks.`,
  /* THE CAMPAIGN DECIDES THE COUNT NOW (design/38 §1), so every beat has an
     answer that can lose ground. Whether the record carries a government
     is whether the country believes it, which is legitimacy; the two
     "record" choices are one choice seen in two states, and each says
     which it is. */
  choices:[
    { posture:"cautious", label:"Campaign on the record.",
      when:{ scalarAbove:{ legitimacy:54 } },
      note:"The country believes the record. Running on it puts the government's best argument first.",
      effects:[{ move:{ "public_standing":7 } }, { move:{ "loyalty.cu_maintenance":3 } }],
      result:"The record holds up. Canvassers report that voters remember what the government did, and more of them approve than not." },
    { posture:"cautious", label:"Campaign on the record.",
      when:{ scalarBelow:{ legitimacy:55 } },
      note:"The country does not believe the record, and the other side will read it back at every stop.",
      effects:[{ move:{ "public_standing":-3 } }, { move:{ "loyalty.cu_maintenance":3 } }],
      result:"The record counts against the government. At every stop the opposition reads it back, item by item, as a list of failures." },
    { posture:"measured", label:"Campaign on the promise of the next session.",
      note:"Safer and smaller. A promise is believed a little, everywhere.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "loyalty.psa":4 } }],
      result:"The campaign talks about the next session rather than the last. The New Progressive Party's pledges are given prominence, and its members campaign harder for it." },
    { posture:"bold", label:"Campaign against the other side.",
      note:"It moves votes now, and it spends the belief the debate will need.",
      effects:[{ move:{ "public_standing":6 } }, { move:{ "legitimacy":-5 } }],
      result:"The campaign becomes a case against the Liberal opposition, and it wins this week's arguments. Voters notice that the government says little about itself, and trust it less." }
  ]},

{ id:"ch3_open_question", chapter:3, prologue:2, once:true,
  /* Says nothing was settled, so it plays only where nothing was. A run
     whose crisis resolved skips it until the content round writes the
     campaign that runs on a result. */
  when:{ resolved:false },
  title:"The question on the ballot",
  speaker:null,
  body:`The writs are out, and the question at the centre of the session, which the
House did not settle, has passed to the voters. Whatever else the parties
would like to campaign on, this election is about that question.

Candidates of every party are asked about it at every door. Whatever they
answer now becomes a promise they will be held to after the count.`,
  /* A government ahead can divide the country on the question and keep
     the larger half; one behind hands the other side its reason. */
  choices:[
    { posture:"bold", label:"Make the election about the question.",
      act:"Say it",
      when:{ scalarAbove:{ public_standing:49 } },
      note:"The government is ahead. Dividing the country on the question hardens the larger half.",
      effects:[{ move:{ "public_standing":7 } }, { move:{ "loyalty.psa":5 } },
               { move:{ "loyalty.cu_maintenance":-4 } },
               { wire:"PM PUTS THE OPEN QUESTION AT THE CENTRE OF THE CAMPAIGN" }],
      result:"The government asks voters to settle what the House could not, and more of them side with it than against it." },
    { posture:"bold", label:"Make the election about the question.",
      act:"Say it",
      when:{ scalarBelow:{ public_standing:50 } },
      note:"The government is behind. Dividing the country on the question gives the larger half a reason to vote against it.",
      effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.psa":5 } },
               { move:{ "loyalty.cu_maintenance":-4 } },
               { wire:"PM PUTS THE OPEN QUESTION AT THE CENTRE OF THE CAMPAIGN" }],
      result:"The government asks voters to settle what the House could not, and more of them side against it than with it." },
    { posture:"cautious", label:"Run on the record. Let the question wait.",
      effects:[{ move:{ "public_standing":2 } }, { move:{ "loyalty.cu_maintenance":4 } },
               { move:{ "loyalty.psa":-5 } },
               { wire:"PM CAMPAIGNS ON THE RECORD, NOT THE QUESTION" }],
      result:"The government campaigns on what it did. The opposition campaigns on what it left undone, and names the question at every stop." }
  ]},

{ id:"ch3_manifestos", chapter:3, prologue:3, once:true,
  when:{ resolved:false },
  title:"The manifestos",
  speaker:"ceyhan",
  body:`Four parties publish their manifestos within a day of each other, and none
of them says plainly what it would do about the question the House left
open.

Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper
of record, reads each one for what it leaves out. "A party cannot put a
question to the voters and keep its own answer out of its manifesto," he
writes. "Somebody will notice, and it will be the other side."`,
  choices:[
    { posture:"bold", label:"Print the answer the government would give.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "legitimacy":3 } },
               { move:{ "loyalty.cu_maintenance":-3 } },
               { wire:"GOVERNMENT PRINTS ITS ANSWER TO THE OPEN QUESTION" }],
      result:"The manifesto states the government's answer. It cannot be taken back, and the opposition will quote it for the rest of the campaign." },
    { posture:"cautious", label:"Print the programme and leave the question open.",
      effects:[{ move:{ "party_loyalty":4 } }, { move:{ "public_standing":-3 } },
               { wire:"GOVERNMENT MANIFESTO AVOIDS THE QUESTION; BENCHES DIVIDED" }],
      result:"The government's own members are relieved and the columnists are not. The manifesto promises only to answer the question after the election." }
  ]},

{ id:"ch3_the_wire", chapter:3, prologue:4, once:true,
  when:{ scalarAbove:{ friction:50 } },
  title:"What Earth is watching",
  speaker:"landry",
  body:`Earth's news services are covering the campaign too, and the story they tell
differs from the one at home. Whoever wins will inherit the quarrel with
Earth, and the trade measures Earth's governments imposed during the
session, whether any party mentions them or not.

"Earth's banks and markets are pricing every day of this campaign," says
Jean Landry, the Minister for External Relations. "We can campaign as though
they are not watching, but they are."`,
  choices:[
    { posture:"bold", label:"Answer the foreign story directly.",
      effects:[{ move:{ "friction":-3 } }, { move:{ "legitimacy":3 } },
               { wire:"PM ANSWERS THE FOREIGN READING OF THE CAMPAIGN" }],
      result:"The Prime Minister gives an interview to Earth's news services. The quarrel with Earth eases a little and the government looks steadier, though the campaign at home hardly notices." },
    { posture:"cautious", label:"Keep the campaign at home.",
      effects:[{ move:{ "friction":2 } }, { move:{ "public_standing":3 } },
               { wire:"PM KEEPS THE CAMPAIGN DOMESTIC; THE WIRE KEEPS SCORE" }],
      result:"Voters hear a government that will not be lectured by Earth. The quarrel with Earth grows a little, and Earth's markets take note." }
  ]},

{ id:"ch3_the_benches", chapter:3, prologue:5, once:true,
  when:{ scalarBelow:{ party_loyalty:40 } },
  title:"The benches on the trail",
  speaker:"okarie",
  body:`Half of your party's members are campaigning in the marginal seats, the ones
the party could win or lose by a few hundred votes. The other half have
found reasons to be elsewhere.

Anil Devi, the Chief Whip, has counted both halves. "If they will not knock
on doors for you now," he says, "they will not vote with you after the
count."`,
  choices:[
    { posture:"bold", label:"Send the whole party out.",
      effects:[{ move:{ "party_loyalty":5 } }, { move:{ "public_standing":2 } },
               { move:{ "solvency":-3000 } },
               { wire:"GOVERNMENT PUTS THE WHOLE PARTY INTO THE CAMPAIGN" }],
      result:"Every member is sent to a marginal seat, and a minister goes to each one. The members are grateful for the support. The tours cost the Treasury three billion dollars before the count." },
    { posture:"cautious", label:"Campaign from the centre and leave them to it.",
      effects:[{ move:{ "loyalty.cu_loyalists":3 } }, { move:{ "party_loyalty":-3 } },
               { wire:"PM CAMPAIGNS FROM THE CENTRE; BENCHES LEFT TO THEMSELVES" }],
      result:"The leadership campaigns from the capital, and the members in marginal seats fight them on their own. The Soft Left, the leadership's current, approves. The members left alone will remember it." }
  ]},

{ id:"ch3_the_airwaves", chapter:3, prologue:6, once:true,
  title:"The debate",
  speaker:"watkins",
  body:`The party leaders meet once in the campaign, in an hour-long debate carried
by Ring Network, the Commonwealth's broadcaster. It is the only hour of the
campaign that most voters watch at the same time.

The unsettled question takes the last ten minutes. Darren Watkins Jr., the
Leader of the Opposition, asks whether the government means to settle it or
let it drift. After this session, it is a fair question.`,
  /* The hour the country watches together, and the record is on trial in
     it: defended well where it is believed, badly where it is not. */
  choices:[
    { posture:"cautious", label:"Defend the record.",
      when:{ scalarAbove:{ legitimacy:54 } },
      note:"The country believes the record, and an hour defending it is an hour well spent.",
      effects:[{ move:{ "public_standing":6 } }, { move:{ "loyalty.cu_maintenance":3 } },
               { wire:"PM DEFENDS THE RECORD IN THE LEADERS' DEBATE" }],
      result:"You defend the government's record in front of the whole country, and it holds up. The overnight poll moves toward the government." },
    { posture:"cautious", label:"Defend the record.",
      when:{ scalarBelow:{ legitimacy:55 } },
      note:"The country does not believe the record, and an hour is a long time to defend what it does not believe.",
      effects:[{ move:{ "public_standing":-4 } }, { move:{ "loyalty.cu_maintenance":3 } },
               { wire:"PM DEFENDS THE RECORD IN THE LEADERS' DEBATE" }],
      result:`You defend the record item by item for the full hour, and each item reminds viewers of what went wrong. The overnight poll moves against the government.` },
    { posture:"bold", label:"Attack the other side's answer.",
      note:"It lands, and it spends belief.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "legitimacy":-3 } },
               { move:{ "loyalty.psa":4 } },
               { wire:"PM ATTACKS THE OPPOSITION'S ANSWER IN THE DEBATE" }],
      result:"The attack lands, and the New Progressive Party enjoys it. It also tells the country what the government is against rather than what it is for, and trust in the government falls a little." },
    { posture:"measured", label:"Say what went wrong, and what comes next.",
      note:"The country hears it. The benches hear it too, and some of them were the thing that went wrong.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "legitimacy":4 } },
               { move:{ "party_loyalty":-4 } },
               { wire:"PM CONCEDES MISTAKES IN THE LEADERS' DEBATE" }],
      result:"You say what went wrong and what you would do differently. Watkins has nothing prepared for an admission. The country trusts the government more; some of your own members think you conceded too much." }
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
  body:`Polling day is a week away, and the parties are spending what money they
have left. The polls say where the seats will be decided: in the ring band,
the eight stations where half the Commonwealth lives, or in the low band,
where the government holds seats it cannot afford to lose.`,
  choices:[
    { posture:"bold", label:"Put everything into the ring.",
      note:"Most of the Commonwealth's seats are on the ring, and most of the close ones. It costs the reserve.",
      effects:[{ move:{ "standing.ring":9 } }, { move:{ "solvency":-4000 } },
               { wire:"GOVERNMENT SPENDS THE LAST WEEK ON THE RING" }],
      result:"The government spends four billion dollars on the ring band's marginal seats. The count will show whether they could be won." },
    { posture:"measured", label:"Hold the low band.",
      note:"The government's own ground. Its seats are safe until they are not, and then they are the whole majority.",
      effects:[{ move:{ "standing.low":9 } }, { move:{ "loyalty.cu_maintenance":3 } },
               { move:{ "solvency":-2000 } },
               { wire:"GOVERNMENT HOLDS ITS GROUND IN THE LOW BAND" }],
      result:"The government spends two billion dollars defending its low-band seats, and the Trades Left campaigns hard for them. The opposition reads a government on the defensive as one that thinks it is ahead." },
    { posture:"measured", label:"Spread it across the Commonwealth.",
      note:"Every band a little, for the same money.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "solvency":-4000 } },
               { wire:"GOVERNMENT SPREADS ITS LAST WEEK ACROSS THE COMMONWEALTH" }],
      result:"Four billion dollars are spread across every band. The campaign is seen everywhere for a week, and decides nothing in particular." },
    { posture:"cautious", label:"Keep the money.",
      note:"The reserve is what the next government governs with.",
      effects:[{ move:{ "party_loyalty":2 } },
               { wire:"GOVERNMENT KEEPS ITS MONEY IN THE LAST WEEK" }],
      result:"The reserve keeps its money, and your own members approve of the restraint. The opposition's last week is the louder one." }
  ]},

{ id:"ch3_the_count", chapter:3, prologue:9, once:true,
  setpiece:{ title:"The Commonwealth has voted, and the next House is decided" },
  title:"The count",
  speaker:null,
  body:`The votes in the general election were counted overnight, station by
station, and by midnight the shape of the next Parliament was settled.

The 140 district seats were declared first, each by a returning officer in
its own hall. Ring Network, the Commonwealth's broadcaster, carried every
declaration live. The 100 list seats followed on the national vote, and the
40 functional members were declared last, because their professions and
industries count by board and by licence.

The House that meets next will be somebody else's arithmetic. This one is
finished. What it settled stands, and what it left unsettled is now the
country's to carry.`,
  choices:[
    { label:"Read the final numbers.",
      effects:[{ flag:"campaign_done" },
               { wire:"RETURNS COMPLETE: THE NEW HOUSE WILL SIT NEXT SESSION" }],
      result:"The numbers are read. The chapter closes." }
  ]},

/* the settlement: the argument was closed, and the Commonwealth after */
{ id:"ch4_settled", chapter:2, weight:97, once:true,
  setpiece:{ title:"The question that divided the House is settled" },
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
  body:`The question that has occupied Parliament all session has been settled. It
was not paused or passed to the next House. It was closed, in the form the
record will keep for a generation.

Settling it took a decision the government cannot take back. The decision is
in the journal of the House with its date. It is on the front page of The
Spindle, the Commonwealth's newspaper of record.

Every member who spoke on it will be asked at the election what they said.
The House will do the rest of its business in the shadow of the answer,
which is how a settlement works.`,
  choices:[
    { label:"See it.",
      effects:[],
      result:"The argument is closed." }
  ]},

  { id:"ch4_after", chapter:2, weight:96, once:true,
  setpiece:{ title:"The session goes on, and the settlement's costs begin to arrive" },
  when:{ seen:["ch4_settled"], dissolved:false },
  title:"After",
  speaker:null,
  body:`Parliament has returned to its ordinary business. Bills move or fall,
ministers answer questions, and the register fills with the routine of
government.

The settlement will cost what it costs from here. Its costs will arrive the
way costs do: in the budget, in prices, and in questions to ministers weeks
after anyone remembers the vote that incurred them.

The question that was settled stays settled. The country gets used to the
answer, and then it stops noticing there was ever a question at all.`,
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
  body:`The question that divided the session has been settled, and Parliament's
ordinary business now goes on in its shadow. What makes it settled is not
that the answer is right, but that the argument is over and the government
must now carry the answer out.

Ministers answer questions on everything else. When the question comes back,
they say what the government decided, in the past tense.`,
  choices:[
    { posture:"bold", label:"Defend the answer in public.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "loyalty.psa":3 } },
               { wire:"PM DEFENDS THE SETTLEMENT IN PUBLIC" }],
      result:"The answer is defended as the government's own, and the New Progressive Party approves. Those who lost hear a government that has stopped listening." },
    { posture:"cautious", label:"Let the answer speak for itself.",
      effects:[{ move:{ "loyalty.cu_maintenance":4 } }, { move:{ "public_standing":-2 } },
               { wire:"PM LETS THE SETTLEMENT STAND WITHOUT A CAMPAIGN" }],
      result:`The government makes no campaign for the answer, and will not reopen it. Your maintenance members approve; the public sees little being done.` }
  ]},

{ id:"ch4_the_losers", chapter:2, weight:94, once:true,
  when:{ seen:["ch4_the_answer"], dissolved:false },
  title:"The people who lost",
  speaker:"watkins",
  body:`The parties that argued the other way have not changed their minds. They
have changed the subject, and nothing stops them changing it back.

Darren Watkins Jr., the Leader of the Opposition, puts it plainly: the
answer belongs to the government until the country gives it to someone else,
and that is years away.`,
  choices:[
    { posture:"cautious", label:"Give the opposition a share in carrying out the settlement.",
      effects:[{ move:{ "loyalty.cl":6 } }, { move:{ "loyalty.cu_loyalists":-3 } },
               { wire:"GOVERNMENT SHARES THE SETTLEMENT'S ADMINISTRATION WITH THE LOSERS" }],
      result:"The Liberals take the work and keep their objections. A side that helps carry out an answer cannot easily campaign against it. The Soft Left dislikes sharing." },
    { posture:"bold", label:"Press the advantage now.",
      effects:[{ move:{ "party_loyalty":4 } }, { move:{ "loyalty.cl":-4 } },
               { move:{ "public_standing":3 } },
               { wire:"GOVERNMENT PRESSES ITS ADVANTAGE AFTER THE SETTLEMENT" }],
      result:"Your own party wants it, the public approves, and the opposition will remember it. That is the normal politics of a settled question." }
  ]},

{ id:"ch4_the_ledger", chapter:2, weight:93, once:true,
  when:{ seen:["ch4_the_losers"], dissolved:false, scalarBelow:{ solvency:45000 } },
  title:"The bill for the answer",
  speaker:"hatt",
  body:`Every settlement has a cost, and the cost arrives with the budget, not with
the argument. The budget is being drawn up now.

"The answer is paid for in the ordinary way," says Edward Hatt, leader of
the Alliance of Business and Government. "By people who are not in this
room."`,
  choices:[
    { posture:"bold", label:"Pay it now, and say so.",
      effects:[{ move:{ "public_standing":3 } }, { move:{ "legitimacy":3 } },
               { move:{ "solvency":-6000 } },
               { wire:"GOVERNMENT PAYS THE SETTLEMENT'S BILL AT THE ESTIMATES" }],
      result:"The six-billion-dollar cost is paid openly. It is not popular, but it is honest, and the country trusts the government a little more." },
    { posture:"cautious", label:"Spread the cost across the next session.",
      effects:[{ move:{ "loyalty.cu_maintenance":-5 } }, { move:{ "public_standing":-3 } },
               { wire:"SETTLEMENT COSTS DEFERRED TO THE NEXT SESSION" }],
      result:"This session's accounts look better and the next session's look worse. Your maintenance members, who will feel the cost, are unhappy." }
  ]},

{ id:"ch4_the_next", chapter:2, weight:92, once:true,
  when:{ seen:["ch4_the_losers"], dissolved:false },
  title:"The next question",
  speaker:"ansar",
  body:`A settled question makes room for the next one. Deck 9 has one, and so does
every group that spent the session waiting for this one to be over.

"It is not that the answer is wrong," writes Sevi Ansar, a resident of Deck
9 on Homestead, the low-band station. "It is that the answer is finished,
and a government moves on from what is finished."`,
  choices:[
    { posture:"bold", label:"Take up the next question now.",
      effects:[{ move:{ "loyalty.psa":4 } }, { move:{ "public_standing":-2 } },
               { wire:"GOVERNMENT OPENS THE NEXT QUESTION AFTER THE SETTLEMENT" }],
      result:"The government opens a new argument, and the New Progressive Party welcomes it. The public, tired of argument, is less keen." },
    { posture:"cautious", label:"Govern quietly. The session has earned it.",
      effects:[{ move:{ "loyalty.cu_maintenance":5 } }, { move:{ "party_loyalty":3 } },
               { wire:"GOVERNMENT CHOOSES A QUIET SESSION AFTER THE SETTLEMENT" }],
      result:`Parliament does its ordinary business and the country stops watching. Your party welcomes the rest.` }
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
  body:`You promised the Life Support panel an order keeping copies off the
life-support licence, and gave yourself four sittings to lay it. The four
sittings have passed, and the order has not been laid.

Kazuya Tanako, the panel's chair, does not call it a breach. She calls it a
schedule, as the panel calls everything, and says her members will now treat
the question as closed. "You asked us for an exemption," she says. "We did
not ask you for anything. That is the difference between us that your
government has now discovered."`,
  choices:[
    { posture:"measured", label:"Lay the order next sitting and say the delay was yours.",
      effects:[{ move:{ "rel.gb_chair":4 } }, { move:{ "legitimacy":-4 } },
               { si:"si_2080_45" },
               { wire:"PM CONCEDES THE LICENSING DELAY AND LAYS THE ORDER" }],
      result:`The order is laid late, and the government takes the blame in public. It is the only form of apology the panel accepts.` },
    { posture:"cautious", label:"Let the promise lapse.",
      effects:[{ move:{ "rel.gb_chair":-8 } }, { move:{ "loyalty.gb":-8 } },
               { move:{ "legitimacy":-6 } },
               { wire:"GOVERNMENT ABANDONS THE CARVE-OUT; GUILD BENCH DISENGAGES" }],
      result:"The panel's members will now vote with no government, which makes every future dual majority harder to win. The country notes the broken promise." }
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
  body:`Cargo leaves the tops of the space elevators for the Commonwealth's stations
in scheduled transfer windows, and an authority on Earth sets the schedule.
It has moved the windows, and the Commonwealth was told by wire.

The transit index, the price of moving goods between Earth and the stations,
rose the moment the news came out. The stations that depend most on imports
feel it first, because their deliveries run to someone else's timetable.`,
  choices:[
    { posture:"measured", label:"Pay from the reserve to keep the old windows.",
      effects:[{ move:{ "price.transit":4 } }, { move:{ "solvency":-8000 } },
               { move:{ "loyalty.cl":5 } },
               { wire:"COMMONWEALTH PAYS TO KEEP THE EARTH-SIDE WINDOW OPEN (as of 9 days ago)" }],
      result:`The windows reopen. The reserve pays eight billion dollars for a decision someone else took nine days ago, and the Liberals approve.` },
    { posture:"bold", label:"Set the Commonwealth's own transfer schedule.",
      effects:[{ move:{ "price.transit":9 } }, { move:{ "public_standing":4 } },
               { move:{ "loyalty.hul":6 } },
               { wire:"PM: THE COMMONWEALTH WILL SCHEDULE ITS OWN TRANSIT (as of 9 days ago)" }],
      result:"The decision is popular and the engineers' party approves. The transit price rises, because the Commonwealth's own schedule means less efficient routes that burn more fuel." }
  ]},

{ id:"fa_freight_reacts", chapter:2, weight:56, maxFires:2,
  when:{ priceAbove:{ transit:105 } },   /* the eye on the foreign price */
  title:"The freight lines pass it on",
  speaker:"hatt",
  body:`The transit price has been above 105 for a week, and the freight lines that
carry consumables have begun adding the difference to every station's
quarterly bill.

Edward Hatt, leader of the Alliance of Business and Government, the party
that speaks for the freight lines in Parliament, says the rise is not their
decision and not their fault. Both are true.`,
  choices:[
    { posture:"bold", label:"Subsidise the freight of consumables from the reserve.",
      effects:[{ move:{ "consumables":4 } }, { move:{ "solvency":-10000 } },
               { move:{ "loyalty.psa":5 } },
               { wire:"TRANSIT DIFFERENTIAL SUBSIDISED FOR CONSUMABLES RUNS" }],
      result:"The reserve pays ten billion dollars, and the stations never see the rise. The New Progressive Party approves." },
    { posture:"cautious", label:"Let the price stand.",
      effects:[{ move:{ "public_standing":-5 } }, { move:{ "loyalty.cu_maintenance":-6 } },
               { station:{ perigee:{ closure:-0.02 }, sinter:{ closure:-0.02 } } },
               { wire:"PM DECLINES TRANSIT SUBSIDY; OUTER STATIONS WARN ON CLOSURE" }],
      result:`Fore River Yards and Colonnade take the strain: each now meets less of its own needs without imports. The government does not set the index and cannot argue with it.` }
  ]},

{ id:"fa_anchor_terms", chapter:2, weight:76, once:true,
  when:{ billStage:{ anchor_kepler:"assent" } },
  title:"The anchor states its terms",
  speaker:"landry",
  body:`Kenya, which hosts the anchor of the International Earth-Orbit Elevator at
Malindi, has offered to renew the Commonwealth's concession on it without
Parliament having to ratify the terms. The price is eight points on the
transit index, and a review clause the Commonwealth will not see until Kenya
invokes it.

"If Parliament ratifies a concession, the price is what the bill says," says
Jean Landry, the Minister for External Relations. "If we take this offer,
the price is whatever they decide. Their lawyers drafted the clause a
fortnight before we were told it existed."`,
  choices:[
    { posture:"cautious", label:"Accept Kenya's terms: a tenant cannot negotiate as an equal.",
      effects:[{ move:{ "price.transit":12 } }, { move:{ "solvency":-6000 } },
               { move:{ "rel.landry":6 } },
               { wire:"ANCHOR RENEWED ON THE HOST STATE'S TERMS; TRANSIT PRICE RISES" }],
      result:"The elevator keeps running. The Commonwealth pays six billion dollars and a higher transit rate for a lease it does not own." },
    { posture:"bold", label:"Refuse, and put the Anchor Concession (Anchorage) Ratification Bill to Parliament.",
      effects:[{ move:{ "price.transit":20 } }, { move:{ "public_standing":5 } },
               { move:{ "loyalty.cu_maintenance":6 } },
               { flag:"anchor_refused" },
               { bill:{ anchor_kepler:{ stage:"second_reading", dead:false } } },
               { wire:"PM REFERS THE ANCHOR CONCESSION TO THE HOUSE; HOST STATE PROTESTS" }],
      result:"The question goes to Parliament, where the Charter says it belongs, and your maintenance members approve. The transit market reads the news first, and prices rise while Parliament debates." }
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
  body:`Mars has two governments: the Chryse Basin, which wants to mine the planet,
and the Nili Republic, which will not allow it, because the strongest
evidence of ancient life on Mars lies in its territory. Together they have
asked twice what the Commonwealth thinks of the metanationals, the
companies, like Cordell, the Gabonese mining company, that operate on Earth,
in orbit and on Mars at once.

Jean Landry, the Minister for External Relations, has a draft and no strong
view about it. "Whatever we send, they will have in twenty minutes and
answer in three weeks, once the Basin and the Republic have agreed what they
think," Landry says. "We can be quick or we can be right."`,
  choices:[
    { posture:"bold", label:"Send it now, and send it plainly.",
      note:`The dispatch leaves tonight and the answer arrives in eleven sittings, which is eleven sittings of events the Republic will not have heard about. Doing nothing also sends a message, and it travels at exactly the same speed.`,
      effects:[{ flag:"mars_asked" },
               { queue:[{ event:"fa_mars_reply", after:11,
                          label:`A dispatch to the Chryse Basin and Nili Republic` }] },
               { wire:"COMMONWEALTH DISPATCHES ITS POSITION ON THE METANATIONALS TO MARS" }],
      result:`The dispatch reaches Mars before Parliament rises tonight. The reply will come in about eleven sittings, from two governments that have had that long to change their minds.` },
    { posture:"cautious", label:"Send nothing until the position is settled at home.",
      note:"The Commonwealth says nothing, and the silence travels.",
      effects:[{ flag:"mars_asked" }, { move:{ "actor.mars":-4 } },
               { move:{ "public_standing":2 } },
               { wire:"NO DISPATCH TO MARS; THE POSITION IS NOT YET SETTLED" }],
      result:`Nothing is sent. Mars notes the silence, and relations cool a little.` }
  ]},

/* REACH: queued by fa_dispatch_mars (send it now), +11 sittings. */
{ id:"fa_mars_reply", queuedOnly:true, once:true,
  title:"The reply",
  speaker:null,
  body:`Mars has answered the Commonwealth's dispatch. The planet has two
governments, the Chryse Basin and the Nili Republic, and their joint note
runs to four paragraphs.

The first three concern a dispute over an Earth company's claims that the
Commonwealth's courts settled a month ago. The two governments take about
eleven sittings to agree a reply between them, so their answers arrive after
the question has moved on. Only the fourth paragraph addresses where things
stand now, and Jean Landry, the Minister for External Relations, reads it
twice.`,
  choices:[
    { posture:"bold", label:"Publish it, with the dates attached.",
      effects:[{ move:{ "actor.mars":6 } }, { move:{ "public_standing":2 } },
               { wire:"THE COMMONWEALTH PUBLISHES THE MARTIAN REPLY IN FULL, WITH DATES" }],
      result:"The note is published with the date it was written, which shows how far behind events it is. Relations with Mars improve, and the government has shown on the record how slowly Mars answers." },
    { posture:"cautious", label:"Answer it as though it were current.",
      effects:[{ move:{ "actor.mars":2 } }, { move:{ "friction":-2 } },
               { wire:`PM ANSWERS MARS; THE CORRESPONDENCE CONTINUES AT ONE EXCHANGE EVERY THREE WEEKS` }],
      result:`The correspondence settles into one note every three weeks each way, the time the two governments need to agree a reply. The quarrel with Earth eases slightly.` }
  ]},

/* THE CONCESSION CAN BE WITHDRAWN (design/17 §4.3). `fa_anchor_terms` is the
   offer; this is the host state meaning the refusal. A flag, a price, and the
   two yards whose schedules are somebody else's. */
/* REACH: refuse the anchor terms (fa_anchor_terms choice 2), then the concession lapses. */
{ id:"fa_anchor_withdrawn", chapter:2, weight:72, once:true,
  when:{ flags:["anchor_refused"], flagsAbsent:["anchor_gone"] },
  title:"The concession lapses",
  speaker:"landry",
  body:`Kenya has let the Commonwealth's concession on the International Earth-Orbit
Elevator lapse rather than renew it on the Commonwealth's terms. The
decision was taken nine days ago and reached the government by wire.

Traffic on the elevator is now traffic the Commonwealth cannot schedule, and
the stations that depend on it were already at the mercy of other people's
timetables.`,
  choices:[
    { posture:"cautious", label:"Buy the concession back at whatever the rate is.",
      note:"The anchor runs again and the Commonwealth learns what its access " +
           "is worth, which is the number the next negotiation starts from.",
      effects:[{ flag:"anchor_gone" }, { move:{ "price.transit":14 } },
               { move:{ "solvency":-14000 } }, { move:{ "actor.earth_host":8 } },
               { wire:"COMMONWEALTH BUYS BACK THE INTERNATIONAL CONCESSION AT KENYA'S RATE" }],
      result:"The elevator is running again for the Commonwealth before the quarter ends. It costs fourteen billion dollars, and the rate is on the record." },
    { posture:"bold", label:"Let it go, and schedule the Commonwealth's own traffic.",
      note:"The strongest line available and the most expensive one: two yards " +
           "carry the schedule while the Commonwealth learns to hold its own.",
      effects:[{ flag:"anchor_gone" }, { flag:"anchor_independent" },
               { move:{ "price.transit":22 } }, { move:{ "public_standing":5 } },
               { move:{ "loyalty.hul":7 } },
               { station:{ perigee:{ closure:-0.03 }, nasmyth:{ closure:-0.03 } } },
               { wire:"PM: THE COMMONWEALTH WILL NOT RENT ITS LIFELINE (as of nine days ago)" }],
      result:"It is the most popular thing the government has said all session. Two shipyard stations, Fore River Yards and Hammerstead, pay for it: each now meets less of its needs without imports, and transit prices rise sharply." }
  ]},

/* AND THE FLOOR PRESSES. Consumables was moved by the closure tick and by
   the budget's clauses and read by nothing, which is the wrong way round
   for the one number that is the primary distribution mechanism (§7.4). */
/* REACH: consumables below 52. */
{ id:"the_floor_presses", chapter:2, weight:62, maxFires:2,
  when:{ scalarBelow:{ consumables:52 } },
  title:"The floor, and what it is carrying",
  speaker:"ansar",
  body:`The Commonwealth's stock of consumables, the air, water and food brought up
from Earth, has fallen far enough that the quarterly supply run is being cut
on the stations that depend on it most.

Sevi Ansar, a resident of Deck 9 on Homestead, the low-band station, has
circulated the new delivery schedule. "It is not the number," Ansar writes.
"It is that the number is a schedule, and the schedule is a list of who is
carried and who is not."`,
  choices:[
    { posture:"bold", label:"Pay from the reserve to restore the supply run.",
      effects:[{ move:{ "consumables":7 } }, { move:{ "solvency":-9000 } },
               { move:{ "loyalty.cu_maintenance":6 } }, { move:{ "loyalty.psa":5 } },
               { wire:"QUARTERLY LIFT RESTORED FROM THE RESERVE" }],
      result:`The reserve pays nine billion dollars and the full schedule is restored. Your maintenance members and the New Progressive Party approve.` },
    { posture:"cautious", label:"Let the stations that can pay for deliveries pay.",
      effects:[{ move:{ "consumables":-3 } }, { move:{ "public_standing":-6 } },
               { move:{ "loyalty.cu_maintenance":-8 } },
               { station:{ ashfield:{ closure:-0.02 }, drift:{ closure:-0.02 } } },
               { wire:"CONSUMABLES LIFT CUT ON THE LOW-CLOSURE STATIONS" }],
      result:"The national figure steadies. Homestead and The Verge, the low-band stations least able to supply themselves, take the cut, and your maintenance members are angry." }
  ]},

/* A POSITION SETTLES (design/28 §3). The forward was sold for cash at a
   price fixed on the day; this is the delivery, and what is handed over is
   exactly what was sold. The tempo set the flag and the settle reads it,
   which is the whole of a forward: the price was decided then, the
   obligation is paid now, and what the session did to the margin in
   between is the risk the government took. */
/* REACH: queued by the quota_forward initiative. */
{ id:"quota_forward_settles", queuedOnly:true, once:true,
  setpiece:{ title:"Buyers collect the cooling capacity the Commonwealth sold in advance" },
  title:"The quota forward comes due",
  speaker:"hatt",
  body:`The consortiums that bought cooling capacity from the Commonwealth in
advance have come to collect it. The capacity leaves the Commonwealth today,
at the price fixed on the day the deal was signed.

The deal was a quota forward: a promise to deliver a share of the
Commonwealth's heat-shedding capacity on a set date, sold for cash on the
day it was signed. The Commonwealth took the cash and spent it. The
consortiums bet that the capacity would be worth more on delivery than they
paid. The Commonwealth bet that it would not need it back.

Delivery is not negotiable. Whatever the thermal margin, the spare capacity
of the radiators, has done since the sale, the capacity leaves today: a
slice of it or the whole of it, as the government agreed. If the government
wants it back, it must buy it at today's price.

"Fixed is fixed," said Edward Hatt, leader of the Alliance of Business and
Government, the business party in the House, in the tone of a man who has
been on the other side of the trade.`,
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
  setpiece:{ title:"Homestead's lease of Commonwealth living space comes to term" },
  title:"The volume lease comes to term",
  speaker:"vellan",
  body:`Homestead, the low-band station of 880,000 people that rented living space
from the Commonwealth under a volume lease, has reached the end of its term.
The surveyors have filed their report.

Volume is room: pressurised, shielded space inside a hull, and the one thing
no factory in orbit makes quickly. The Commonwealth holds volume in every
band of stations. It let a share to Homestead for a term, in return for cash
or for work that makes the station less dependent on imports, which is what
Homestead wanted.

The report says whether Homestead kept its side of the lease. The price of
volume on the day decides who got the better deal. If volume has risen in
price, it was let for less than it is worth now. If it has not, the lease
paid what it promised.

"The lease says what follows either way," said Suravaram Vidyasagar, the
Minister for Life Support. "It was written by people who expected the price
to move."`,
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
  body:`The Ministry for Life Support has measured the living quarters, or berths,
on the low band, and a third of them are smaller than the minimum standard
set in 2072. Most of the shortfall has appeared in the last six years, and
most of it belongs to one landlord.

Suravaram Vidyasagar, the Minister for Life Support, puts the choice
plainly. "Either a berth is a home, with a minimum size under it, or it is a
cubic metre with a lock on the door. Parliament has to decide which, because
the market will not."`,
  choices:[
    { posture:"bold", label:"Set a minimum berth size, and enforce it",
      note:"A minimum volume in law turns a lease into a home and puts the cost " +
           "of the partition on the landlord. The low band's associations will " +
           "carry it for you; the rentiers will price it into every let they " +
           "still write.",
      effects:[{ flag:"minimum_berth_laid" },
               { move:{ "price.volume": 5 } }, { move:{ "actor.forkrentiers": -8 } },
               { move:{ "loyalty.hul": 6 } }, { move:{ "loyalty.des": 4 } },
               { move:{ "public_standing": 4 } },
               { wire:"MINIMUM BERTH STANDARD LAID; LANDLORDS TO RECONFIGURE OR LOSE THE LET" }],
      result:"The standard takes effect next quarter. Half the subdivided berths on the low band are now unlawful, and landlords have six months to fix them. Rents rise, and the fork-rentiers, who rent out copies of themselves for work and live in the smallest berths, lose out." },
    { posture:"cautious", label:"Leave it to the lease: a tenant can read a floor plan",
      note:"No new duty and no new cost. Density stays a matter between landlord " +
           "and tenant, and the densest berths stay where the work is.",
      effects:[{ move:{ "price.volume": -6 } }, { move:{ "actor.forkrentiers": 6 } },
               { move:{ "consumables": -4 } }, { move:{ "loyalty.cu": -3 } },
               { wire:"GOVERNMENT DECLINES A MINIMUM BERTH; THE PARTITION STANDS" }],
      result:"Landlords let the quarter's berths on the old terms. The low band's residents' associations note who decided, and deck crews note that the most crowded berths are the last the ventilation reaches." }
  ]},

/* THE COURTS (bible 10.8). Emulated judges who personally remember the
   founding, and reclassification as a branch of practice rather than a
   question of fact. The Tribunal exists if the player established it. */
{ id:"the_old_judge", chapter:2, weight:71, once:true,
  title:"The judge who remembers",
  speaker:"fenwick",
  body:`The Tribunal is the court that hears challenges to the government's orders.
Its presiding judge is an emulated mind, copied in 2060, who has sat
continuously since and was present for some of the arguments over the
Charter, the Commonwealth's constitution.

She has asked Adaeze Fenwick, the Minister for Law and the Charter, for a
ruling on a narrow point. Reclassification is the practice of moving a
person from one legal category to another, such as from instance to person.
Is it a question of fact for the courts, or a matter of professional
practice for the licensing boards?

"The boards certify the work," Fenwick says. "She is asking who owns the
question. If it is the boards, the courts will never see a reclassification
case again."`,
  choices:[
    { posture:"cautious", label:"Give it to the licensing boards: they know the practice",
      note:"A reference to the boards keeps the question where the expertise is " +
           "and keeps the courts out of a technical argument. It also hands the " +
           "boards the power to decide what a person is.",
      effects:[{ flag:"reclassification_to_boards" },
               { move:{ "actor.lb_legal": -6 } },
               { move:{ "loyalty.gb": 6 } }, { move:{ "loyalty.rv": -4 } },
               { move:{ "public_standing": -2 } },
               { wire:"RECLASSIFICATION REFERRED TO THE LICENSING BOARDS" }],
      result:"The question goes to the boards, which will report in their own time. The Alliance of Business and Government approves; the lawyers' licensing board and the Congregational Democratic Alliance do not. The judge notes the answer without comment." },
    { posture:"bold", label:"It is a question of fact: the courts will hear it",
      note:"The courts keep the question. The boards lose it, and the Guild will " +
           "read the reference as the government saying so.",
      effects:[{ flag:"reclassification_to_courts" },
               { move:{ "actor.lb_legal": 7 } }, { move:{ "rel.gb_chair": -5 } },
               { move:{ "loyalty.rv": 5 } }, { move:{ "loyalty.gb": -5 } },
               { wire:"RECLASSIFICATION IS A QUESTION OF FACT FOR THE COURTS" }],
      result:"The courts keep the question and the boards have a grievance. The first reclassification case is listed for next session, and Kazuya Tanako of the Life Support panel takes it as a slight." }
  ]},

/* CONSUMABLES (bible 10.1). The agricultural decks, "the emotional centre of
   any station", and the material floor one of the six scalars is named for. */
/* REACH: no gate; always eligible in ch2. */
{ id:"the_agricultural_deck", chapter:2, weight:66, once:true,
  title:"The deck at Harvest",
  speaker:null,
  body:`The main agricultural deck at Harvest, a station of 70,000 people in the
middle band, has root rot in its protein vats, and the station has been
treating it for a month without saying so. The treatment is holding.

A permanent fix means rebuilding the deck to its foundations and taking it
out of production for thirteen weeks. Harvest grows food for the stations
around it as well as for itself, so every station in the middle band is
watching what the government does.`,
  choices:[
    { posture:"bold", label:"Fund the rebuild, and cover the station's food shortfall meanwhile",
      note:`Thirteen weeks of buying in what the deck cannot grow, paid out of the same vote that funds everything else. The middle band will read it as the Commonwealth being willing to carry a deck.`,
      effects:[{ move:{ "solvency": -7000 } }, { move:{ "consumables": 6 } },
               { station:{ wickstead:{ closure: 0.05 } } },
               { move:{ "public_standing": 5 } },
               { wire:"COMMONWEALTH FUNDS HARVEST DECK REFIT; SHORTFALL CARRIED" }],
      result:`The rebuild costs seven billion dollars, and the deck returns in three months better than before. Harvest now grows more of its own food, and the rest of the middle band notices.` },
    { posture:"cautious", label:"Keep treating it, and say nothing",
      note:"A holding treatment and a quiet quarter. Cheaper now, and the deck " +
           "is one bad month from the same emergency with a larger bill.",
      effects:[{ move:{ "consumables": -5 } }, { move:{ "solvency": 2000 } },
               { move:{ "loyalty.hul": -4 } },
               { queue:[{ event:"the_deck_again", after:5 }] },
               { wire:"HARVEST DECK HELD WITH TREATMENT; NO REFIT FUNDED" }],
      result:"The treatment holds for the quarter and saves two billion dollars. The station's engineers quietly file a second, larger estimate." }
  ]},

/* REACH: queued by the_agricultural_deck's 'treat it where it stands' choice. */
{ id:"the_deck_again", queuedOnly:true, once:true,
  title:"The deck again",
  speaker:null,
  body:`The protein vats at Harvest, a station of 70,000 people in the middle band,
have failed. The station now buys all of its protein from the low band's
farms, and low-band prices are rising as a result.

The ministry's second estimate for refitting the vats is higher than its
first by the cost of the three months it spent repairing vats that were
always going to fail.`,
  choices:[
    { posture:"bold", label:"Fund the refit now, at the second estimate",
      effects:[{ move:{ "solvency": -11000 } }, { move:{ "consumables": 5 } },
               { station:{ wickstead:{ closure: 0.04 } } },
               { move:{ "public_standing": 2 } },
               { wire:"HARVEST REFIT FUNDED AT THE SECOND ESTIMATE" }],
      result:"The refit costs eleven billion dollars, and Harvest's protein deck returns to production. Nobody calls the bill a success, and the station did not expect them to." },
    { posture:"cautious", label:"Carry the shortfall and defer the refit again",
      effects:[{ move:{ "consumables": -8 } }, { station:{ wickstead:{ suspended: 900 } } },
               { move:{ "public_standing": -6 } }, { move:{ "loyalty.hul": -8 } },
               { wire:"HARVEST BUYS IN ALL PROTEIN; DECK REFIT DEFERRED" }],
      result:"Nine hundred of Harvest's residents lose their jobs on the deck and are held in suspension to save the cost of keeping them. The rest of the middle band concludes that the government will switch people off to save money." }
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
congregations are not one faith. What they share is that they do not accept
reclassification, the moving of a person from one legal category to another,
much as a pacifist will not take up arms.

They have sent Florence Marin, the Minister for Persons, Health and
Continuity and a member of the Alliance, with one question in writing. Will
the Commonwealth require proof that a person is on the attested register
before a marriage, a burial or a school place?

"To them this is not a question about voting," Marin says. "It is a question
about what a body is, and they will lose an election before they answer it
your way."`,
  choices:[
    { posture:"bold", label:"Say no: the register will not be required for any of the three",
      note:"A written answer that costs nothing and buys the congregations " +
           "without touching the bill. It commits the government on a point the " +
           "Registry has not conceded.",
      effects:[{ flag:"congregations_answered" },
               { move:{ "loyalty.rv": 9 } }, { move:{ "actor.lb_legal": -3 } },
               { move:{ "public_standing": 3 } },
               { wire:"REGISTER NOT REQUIRED FOR MARRIAGE, BURIAL OR SCHOOLING" }],
      result:"Marin takes the answer to the fourteen halls, and the Alliance's members are grateful. The Registry notes, without objecting, that the law will not leave the question alone for long." },
    { posture:"cautious", label:"Leave it to the register: the rules apply to everyone",
      note:"The Registry's position, said out loud. The congregations lose the " +
           "answer and gain a grievance they are extremely good at keeping.",
      effects:[{ flag:"congregations_refused" },
               { move:{ "loyalty.rv": -12 } }, { move:{ "loyalty.psa": 4 } },
               { move:{ "actor.lb_legal": 4 } }, { move:{ "public_standing": -4 } },
               { wire:"GOVERNMENT LEAVES THE SACRAMENTS TO THE REGISTER" }],
      result:"The congregations are told the register applies. All fourteen halls hear it the same evening, and the Congregational Democratic Alliance calls an early conference." }
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
  title:`A pair, for the member for Cable End`,
  speaker:"okarie",
  body:`A Liberal member, the member for Cable End on Meridian Spindle, is to be
reabsorbed on Thursday: an instance of the member will be merged back into
its original. The division is set for the same afternoon, so the member
cannot attend, and the Liberal whip has come to Anil Devi, the Chief Whip,
which no Liberal whip has done in two years.

"A pair means one of ours stays away to match one of theirs," Devi says. "It
costs us a vote and them a vote, and the result does not move. It is not a
favour. It is a courtesy, and courtesies are remembered when we want
something that is not arithmetic."`,
  choices:[
    { posture:"cautious", label:"Grant the courtesy.",
      note:"The control is in the whip panel on the Chamber tab, under the " +
           "whip. Pairing one of yours with one of theirs costs an aye and " +
           "buys the other side's goodwill. The arithmetic does not improve, " +
           "which is exactly the point of doing it.",
      effects:[{ flag:"pair_offered" }, { move:{ "rel.okarie":4 } },
               { move:{ "loyalty.cu_loyalists":2 } },
               { wire:"GOVERNMENT WHIPS AGREE TO A COURTESY PAIR FOR THURSDAY'S DIVISION" }],
      result:`Devi tells the other side without comment, which is how these things are done. The Soft Left approves.` },
    { posture:"bold", label:"No. Every vote counts and their side knows it.",
      effects:[{ move:{ "rel.okarie":-5 } }, { move:{ "loyalty.cl":-5 } },
               { move:{ "public_standing":-3 } },
               { wire:"GOVERNMENT REFUSES A COURTESY PAIR; THE BENCHES NOTE IT" }],
      result:`The refusal is within the rules. The Liberal whips now know how the government treats a small courtesy, and the country hears about it.` }
  ]},

/* REACH: the flag is set by the pairing control in the whip panel (a UI action), not by content. */
{ id:"the_pairing_kept", chapter:2, weight:56, once:true,
  /* Was `flags:["paired"]`, which nothing set, so this could never fire.
     It reads the engine's own count of divisions that ran with a pair in
     force — the fact the scene is about. */
  when:{ pairsKeptAtLeast:1 },
  title:"The kindness, remembered",
  speaker:null,
  body:`The Liberal member was reabsorbed and came back on Tuesday, and the division
went ahead without either paired member voting. The Liberal whips have not
mentioned it to the government. They have mentioned it to their own members,
which is where a courtesy is remembered.`,
  choices:[
    { posture:"cautious", label:"Leave it: a courtesy is not an invoice.",
      effects:[{ move:{ "loyalty.cl":4 } }, { move:{ "public_standing":3 } },
               { wire:"THE COURTESY PAIR IS BANKED AND NOT MENTIONED" }],
      result:"Nothing is asked for, and the Liberals feel they owe the government something. The country thinks better of both." },
    { posture:"bold", label:"Ask for their benches on the next division.",
      effects:[{ move:{ "loyalty.cl":-5 } }, { move:{ "public_standing":-2 } },
               { wire:"GOVERNMENT CALLS IN THE PAIR; THE OTHER SIDE PRICES IT" }],
      result:"The favour is spent, and the Liberals now know the government's courtesies have a price, which makes them easier to refuse next time." }
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
  body:`The Tribunal, the court that hears challenges to the government's orders,
now has the reclassification cases the government gave it, and the first is
listed. Before hearing it, the judges have put a question to the government
in writing, as they have done only twice since the Charter, the
Commonwealth's constitution, was signed in 2064.

They ask by what test a court should decide whether a person was lawfully
moved from one legal category to another: by the entry in the register, or
by whether the person is continuously the same person. The judges will
follow the government's answer. Until one comes, they will decide for
themselves.

"It is four paragraphs," says Adaeze Fenwick, the Minister for Law and the
Charter. "Answering takes a day and binds every case after this one. Not
answering takes no time at all, and the judges write the test themselves."`,
  choices:[
    { posture:"bold", label:"Answer it, in full, on the record.",
      cost:{ slot:1 },
      note:"A day of order-paper time and the government is bound by its own " +
           "answer for the rest of the campaign. The bench will read every " +
           "later order in the light of it.",
      effects:[{ flag:"tr_referenced" }, { flag:"reference_answered" },
               { move:{ "actor.tribunal":10 } }, { move:{ "legitimacy":4 } },
               { wire:"GOVERNMENT ANSWERS THE TRIBUNAL'S REFERENCE IN FULL" }],
      result:"The answer runs to four paragraphs and goes on the record. It is now the government's position, whether it likes it later or not, and the Tribunal thinks better of the government for giving it." },
    { posture:"cautious", label:"Let it lie. The bench can proceed on its own.",
      effects:[{ flag:"tr_referenced" }, { flag:"reference_ignored" },
               { move:{ "actor.tribunal":-12 } }, { move:{ "legitimacy":-3 } },
               { wire:"GOVERNMENT DECLINES TO ANSWER THE TRIBUNAL'S REFERENCE" }],
      result:`Nothing is answered. The judges record the date they asked and that no answer came, and both stay on the file.` }
  ]},

/* THE CHALLENGE. The opposition does not need a majority to hurt an order, it
   needs counsel. An order the government made is challenged in the Tribunal. */
/* REACH: SI 2080/44 in force. */
{ id:"tr_challenge_lodged", chapter:2, weight:66, once:true,
  when:{ siInForce:["si_2080_44"], flagsAbsent:["tr_challenged"] },
  title:"The order is challenged",
  speaker:"fenwick",
  body:`The Liberal Party, the main opposition party, has challenged the Life
Support Engineering (Licensing) Order at the Tribunal, the court that hears
challenges to the government's orders. The argument is narrow and not about
licensing itself: that the order was made under a power the law gives to the
licensing boards, and that a minister may not use a board's power by order.

"The Tribunal will hear it in four sittings," says Adaeze Fenwick, the
Minister for Law and the Charter. "If we send lawyers, the government is in
court defending its own order. If we do not, the judges hear only one side."`,
  choices:[
    { posture:"bold", label:"Send lawyers to defend the order.",
      note:"A proper defence costs attention and it is heard. A court is not a " +
           "lobby: the numbers in the House do not reach it, and the only thing " +
           "that moves the bench is whether the government turned up.",
      effects:[{ flag:"tr_challenged" }, { flag:"tr_defended" },
               { move:{ "actor.tribunal":4 } }, { move:{ "legitimacy":2 } },
               { queue:[{ event:"tr_ruling", after:4,
                          label:"The Tribunal rules on the licensing order" }] },
               { wire:"COMMONWEALTH BRIEFS COUNSEL AGAINST THE CHALLENGE TO THE LICENSING ORDER" }],
      result:"The government's lawyers are instructed and the case is listed for the fourth sitting. The order stands until the Tribunal rules." },
    { posture:"cautious", label:"Let it run: the order was lawfully made.",
      note:"No defence, and no cost. The bench will hear the challenge alone, " +
           "which is a thing a bench notices about a government that is certain " +
           "and uninterested.",
      effects:[{ flag:"tr_challenged" }, { flag:"tr_undefended" },
               { move:{ "actor.tribunal":-6 } }, { move:{ "public_standing":-2 } },
               { queue:[{ event:"tr_ruling", after:4,
                          label:"The Tribunal rules on the licensing order" }] },
               { wire:"GOVERNMENT DECLINES TO DEFEND THE LICENSING ORDER; CASE HEARD ONE SIDE" }],
      result:"The case is listed and nobody appears for the government. The Tribunal hears it in an hour, and notes the absence." }
  ]},

/* THE RULING. Three doors, disjoint, and every one of them openable: an order
   struck, an order narrowed, and an order upheld. Which door is open is a
   condition on the bench's disposition, which the government has been moving
   all session by whether it answered, briefed, complied and revoked. */
/* REACH: queued by either choice of tr_challenge_lodged. */
{ id:"tr_ruling", queuedOnly:true, once:true,
  setpiece:{ title:"The Tribunal rules on the government's life-support licensing order" },
  title:"The ruling",
  speaker:null,
  body:`The Tribunal, the Commonwealth's constitutional court, has given its
judgment on the Life Support Engineering (Licensing) Order. The judgment
runs to 32 pages, and the ruling itself is on the last.

The Liberal Party, the opposition, brought the challenge, and it was a
narrow one. The Liberals argued that the government made the order under a
power the law gives to the licensing boards, which license the engineers who
run life support. A minister, they said, may not take over a board's powers
by order.

The government chose what, if anything, to argue in reply.

The Tribunal's presiding judge is an emulated mind, copied in 2060, who was
in the room when the clauses of the Charter, the Commonwealth's
constitution, were argued. The bench reads a government's orders in the
light of how that government has treated the bench, and it has had a session
to form its view.

The order changed two of the House's Life Support seats, and it drove the
Alliance of Business and Government, the business party in the House, away
from the government. Whatever the judgment says about the order, it says to
every licensing board in the Commonwealth.`,
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
      result:`The order stands and does less. It admits only the technicians the licensing board had certified itself, not everyone certified before 2067.` },
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
  body:`Dan Czarnecki, leader of your party's Hard Left, has a sheet of paper with
four names on it, and he has stopped pretending it is anything else. Twelve
signatures force a ballot on your leadership.

"Every name on this belongs to a member who thinks the party would be better
led by someone else," he says, "and every one of them has a reason you gave
them. You can go and ask them. Some will sign to your face: because they are
brave, or because they are finished with you, or because they want you to
know.

"Twelve and there is a ballot. Eleven and I am a man with a list."`,
  choices:[
    { posture:"bold", label:"Open the paper: let them come and sign it openly.",
      note:"Members are asked one at a time on the Party tab, under the " +
           "leadership. A member who is willing signs, and every signature " +
           "is a member you have lost. A member who is not refuses, comes off " +
           "the paper for good, and their current firms behind you. A member " +
           "who has signed can be won back there, for a promise.",
      effects:[{ flag:"paper_opened" }, { move:{ "rel.halloran":3 } },
               { move:{ "loyalty.cu_loyalists":-3 } },
               { wire:"CZARNECKI'S PAPER IS ON THE DESK; MEMBERS SAY WHETHER THEY WILL SIGN" }],
      result:"He leaves the sheet with the whips. The first new name is on it before the afternoon, and it is not one you would have guessed." },
    { posture:"cautious", label:"Ignore it: he has four names.",
      effects:[{ move:{ "rel.halloran":-6 } }, { move:{ "loyalty.cu_halloran":-4 } },
               { move:{ "loyalty.cu_maintenance":-3 } },
               { wire:"PM DECLINES TO DISCUSS CZARNECKI'S LIST" }],
      result:"The paper stays in his pocket, and he collects the rest of the names in his own time. The Hard Left and your maintenance members resent being brushed off." }
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
  setpiece:{ title:"Opposition leader gives notice of a motion of no confidence", mood:"threat",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"Ask me the day before.",
        who:"Anil Devi MP, the government's Chief Whip" } ] }
  ] },
  weight:6,
  /* GATED ON WEAKNESS, in the closed vocabulary (there is no anyOf, and
     inventing one would be content leaking into the engine): the Leader of
     the Opposition moves when the government is low in the country AND its
     own benches are unhappy, because he has to win. */
  chapter:2,
  when:{ minSitting:6, scalarBelow:{ public_standing:40, party_loyalty:46 } },
  title:"The Leader of the Opposition rises",
  speaker:"watkins",
  body:`Darren Watkins Jr., the Leader of the Opposition, gave notice in Parliament
that he will move a motion of no confidence in the government in three
sitting days.

"Madam Speaker, I give notice that I shall move, three sitting days from
today, that this House has no confidence in the government," he said. The
noise took a while to settle, and it did not come from his side of the
chamber.

The motion needs a majority of the House, 141 votes of 280, to carry. If it
carries, the government falls.

Watkins has been counting for weeks. The government's standing in the
country is below 40, and its own benches are restless. Those are his two
figures: members who fear for their seats, and members who have stopped
fearing the whips.

The government has until the division to change the count.`,
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
  body:`At Question Time, Darren Watkins Jr., the Leader of the Opposition, has the
first three questions, and he has plainly had them prepared for a week.

"The Prime Minister told this House the Treasury's cash reserve was sound,"
he says. "Will she tell us today what it stands at, or will she tell us
again that the figure is a matter for the Treasurer, who is also not
answering?"

The reserve is the Treasury's cash in hand. Your own members are already
working out what the figure means for their seats, and the opposition worked
it out last week.`,
  choices:[
    { posture:"measured", label:"Answer it. Take the afternoon and answer all of it.",
      cost:{ slot:1 },
      note:"A day of the order paper, spent on the one thing nobody can amend.",
      effects:[
        { move:{ public_standing:4, party_loyalty:3 } },
        { wire:"PRIME MINISTER TAKES QUESTIONS FOR NINETY MINUTES; NO FIGURE WITHHELD" }
      ],
      result:`You answer the three questions and the fourteen that follow. The House sits late, and nobody can say the government is hiding the figure.` },
    { posture:"cautious", label:"Refer him to the Treasurer and move to the next question.",
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
      result:`It costs nothing today. But the press gallery counts each question you pass to someone else, and so does The Spindle, and low-band voters notice most.` },
    { posture:"bold", label:"Ask him what he would have done, and keep asking.",
      note:"The benches will like it. The gallery has heard it.",
      effects:[
        { move:{ party_loyalty:5, public_standing:-2 } },
        { move:{ "rel.watkins":-6 } },
        { wire:"NOISY EXCHANGES AT QUESTIONS; NEITHER LEADER ANSWERS THE OTHER" }
      ],
      result:"Your own side enjoys it enormously. Nobody outside the chamber can say afterwards what the reserve stands at." }
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
  speaker:"herrera",
  body:`The Census Bureau's quarterly figures show that the share of adults in paid
work has risen more in one quarter than in any year since the Commonwealth
was founded in 2064. Jason Herrera, the Minister for Labour and
Participation, brings them in person.

The Bureau gives the reason in its second line: the lower divergence
threshold. Copies that became persons now draw wages, so work they did
unpaid as instances now counts as paid work.

"We argued it for a month as a question about what a person is," Herrera
says. "It was also the largest change in who holds a paid job this
Commonwealth has ever made. No party campaigned for this number. The
question is whether the government stands beside it."`,
  choices:[
    { posture:"bold", label:"Claim it, and say plainly what the threshold did.",
      brief:"Taking credit for a consequence the government did not "+
        "predict. Reads as competence to the country and as an admission "+
        "to the benches who were told it was a personhood bill.",
      effects:[{ move:{ public_standing:6 } },
               { move:{ "loyalty.cu_maintenance":-5 } },
               { move:{ legitimacy:3 } },
               { wire:"TREASURER CREDITS THRESHOLD FOR RISE IN PAID WORK" }],
      result:`The Spindle leads on the figure the next morning, with the threshold in its second paragraph. The Trades Left reads it as the government admitting the bill was about jobs all along.` },
    { posture:"cautious", label:"Let the figure speak and say nothing.",
      brief:"The cautious answer. Costs nothing and concedes the framing to "+
        "whoever explains it first, which will be the Opposition.",
      effects:[{ move:{ "rel.watkins":-2 } },
               { move:{ "trend.public_standing":-1 } }],
      result:`The figures are published at noon with no minister to explain them. By evening Darren Watkins Jr., the Leader of the Opposition, has explained them in his own words.` }
  ]},

{ id:"ec_participation_stalls", chapter:2, weight:62, maxFires:2,
  when:{ economyBelow:{ participation:37 } },
  brief:"Participation has fallen below the historic band, which means "+
    "instance-hours are doing work that used to be waged. The scene wants "+
    "the Minister for Labour and Participation explaining that the economy "+
    "has not shrunk — the work is being done, it is simply not being paid "+
    "for, and the registry has no column for it.",
  title:"The work that is not wages",
  speaker:"herrera",
  body:`The share of adults in paid work has fallen below thirty-seven per cent, the
lowest since the Commonwealth was founded in 2064. Jason Herrera, the
Minister for Labour and Participation, says the economy has not shrunk.

"The work is being done," Herrera says. "The berths are cleaned, the
accounts are kept, the computer racks are watched. Instances are doing it,
copies whose originals sell their hours, and an instance's hours are a wage
in no column the Census Bureau keeps. The figure counts who is paid. It has
stopped counting who works."`,
  choices:[
    { posture:"bold", label:"Lower the divergence threshold, so the hours are counted.",
      brief:"The interventionist answer: the same lever as the divergence "+
        "bill, used deliberately this time. Expensive with the employers.",
      effects:[{ law:{ divergence_threshold_hours:96 } },
               { economy:{ participation:3 } },
               { move:{ "loyalty.fh":-8 } },
               { move:{ "actor.metanationals":-6 } },
               { wire:"THRESHOLD CUT TO NINETY-SIX HOURS" }],
      result:`The threshold falls to ninety-six hours. Copies that have run separately for four days become persons next quarter, and the employers who ran them for a working week are lobbying by the afternoon.` },
    { posture:"measured", label:"Fund a public works programme instead.",
      brief:"Buying participation with the reserve rather than with the "+
        "law. Works, costs money, and leaves the underlying question open.",
      effects:[{ move:{ solvency:-9000 } },
               { economy:{ participation:2 } },
               { move:{ public_standing:4 } }],
      result:`Nine billion dollars of public works go to the shipyards and the farm decks, and the next figures rise two points. The instances' unpaid hours are still uncounted.` },
    { posture:"cautious", label:"Accept it. The economy is what it is.",
      brief:"The answer that costs nothing today. The trend continues and "+
        "the benches that depend on waged work notice.",
      effects:[{ move:{ "loyalty.cu_maintenance":-6 } },
               { move:{ "trend.legitimacy":-1 } }],
      result:`Next quarter's figure is lower again. Your maintenance members read it as a count of the jobs their trades have lost to copies.` }
  ]},

{ id:"ec_trade_surplus", chapter:2, weight:55, maxFires:2,
  when:{ economyAbove:{ trade:118 } },
  brief:"Compute exports are paying for everything else. The scene wants "+
    "the Minister for External Relations pointing out that the surplus is "+
    "leverage abroad and a target at home: the Earth states can see the "+
    "figure too, and so can every bench that wants the money spent.",
  title:"What the surplus buys",
  speaker:"landry",
  body:`The Commonwealth has sold more than it bought for the third quarter running,
and nearly all of the surplus is computing. Mind-hours are run on the
Commonwealth's racks and sold to Earth's firms, which cannot shed the heat
of running them as cheaply as a radiator in orbit can.

Jean Landry, the Minister for External Relations, has been asked about the
figure twice this morning, once by Kenya's embassy and once by a member for
Home Rule, the party of self-government for the stations. "Earth's
governments see this number as leverage," Landry says. "Our members see it
as money. It can only be spent once."`,
  choices:[
    { posture:"bold", label:"Spend it on the stations that are short.",
      brief:"Redistribution inside the union. Popular where it lands and "+
        "resented by the habitats that earned it.",
      effects:[{ move:{ solvency:7000 } },
               { move:{ "standing.low":5 } },
               { move:{ "standing.ring":-3 } },
               { move:{ consumables:3 } }],
      result:`Seven billion dollars go into the reserve and the rest pays for the low band's supply runs. Members for the ring band ask at Question Time whose surplus it was.` },
    { posture:"cautious", label:"Hold it against the anchor negotiations.",
      brief:"Treating the surplus as a diplomatic reserve. Nothing visible "+
        "happens at home, which is the cost.",
      effects:[{ move:{ solvency:4000 } },
               { move:{ "actor.earth_host":4 } },
               { move:{ "trend.public_standing":-1 } },
               { flag:"ec_surplus_held" }],
      result:`The surplus stays in the reserve, and Landry takes the figure into the next talks with Kenya over the International Earth-Orbit Elevator. Members who wanted it spent say so at Question Time.` }
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
  body:`The Commonwealth has bought more than it sold for two quarters, and the gap
is being paid from the reserve, the Treasury's cash in hand.

Edward Hatt, leader of the Alliance of Business and Government, asked for
ten minutes and uses four. "My members sell computing and buy everything
else, so we see it before the Census Bureau does," he says. "You can sell
more, which means subsidising freight on the transit corridor to Earth, or
buy less, which hurts the stations that cannot feed themselves."`,
  choices:[
    { posture:"measured", label:"Subsidise freight costs and sell more computing.",
      brief:"The orthodox answer: subsidise the corridor, export the one "+
        "thing the Commonwealth makds that Earth will buy. Costs money now "+
        "for a balance later.",
      effects:[{ law:{ transit_subsidy:"all" } },
               { move:{ solvency:-6000 } },
               { move:{ "price.transit":-10 } },
               { economy:{ trade:4 } }],
      result:`The freight subsidy is laid, and the first six billion dollars leave the reserve. The freight lines cut their charge for shipping computing the same week.` },
    { posture:"bold", label:"Close the gap by importing less.",
      brief:"Autarky as a choice rather than a condition. Resilient and "+
        "poorer, and the stations that cannot feed themselves pay for it.",
      effects:[{ economy:{ trade:6 } },
               { move:{ consumables:-5 } },
               { move:{ "standing.low":-5 } },
               { flag:"ec_import_squeeze" }],
      result:`Import licences are cut and trade moves back toward balance. The low band's supply runs are the first thing the cut reaches.` }
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
  body:`A consortium of firms whose owners are members of the Alliance of Business
and Government, the business party, has offered twenty-two billion dollars
for the Commonwealth's stake in the public substrate works, the state-owned
computing plant. The Treasury's own valuation is within a billion of it. The
price is fair, and it is fair because the buyers can see how low the
Treasury's cash reserve is.

Edward Hatt, the Alliance's leader, brings the offer himself. "The money is
in the account by the end of the week," he says. "My members will run the
works as well as the Ministry does, and pay the levy on every hour. The sale
cannot be undone, and I would not pretend otherwise. Neither can a reserve
that runs out."`,
  choices:[
    { posture:"bold", label:"Sell. Take the money.",
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
      result:`The stake passes to the consortium and twenty-two billion dollars reach the reserve. The Trades Left and the Station Left, who believe the works should be public, will not forget it.` },
    { posture:"cautious", label:"Refuse, and say why in the House.",
      brief:"Refusing on principle while the reserve is visibly short. "+
        "Buys the party and buys nothing else.",
      effects:[{ move:{ "loyalty.cu_maintenance":9 } },
               { move:{ "loyalty.cu_deck":6 } },
               { move:{ "capital.gb":-4 } },
               { move:{ "trend.solvency":-400 } },
               { flag:"ec_refused_sale" }],
      result:`The offer is declined in Parliament. Your party's left cheers, and the reserve keeps falling at the rate it was falling before.` }
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
  body:`The freight subsidy is paid by the tonne, and the Life Support panel has
done the arithmetic the Treasury did not publish. Kazuya Tanako, the panel's
chair, sends it as a single table.

The five stations that collect the most are the ring band's shipyards and
trading stations, because they ship the most. The low band, which the
subsidy was meant to help, is at the bottom. "It was meant for the stations
at the end of the delivery schedule," she writes. "It is paying the ones at
the start. I assumed the government would want to know before the opposition
does."`,
  choices:[
    { posture:"measured", label:"Cap it per station, and return the saving to the reserve.",
      brief:"Fixing the incidence. Cheap, correct, and it makes an enemy of "+
        "every habitat that was collecting.",
      effects:[{ move:{ solvency:4000 } },
               { move:{ "standing.ring":-4 } },
               { move:{ "standing.low":4 } },
               { move:{ "rel.gb_chair":5 } },
               { wire:"TRANSIT SUBSIDY CAPPED PER STATION" }],
      result:`A cap per station is laid and four billion dollars go back to the reserve. The ring band's trading stations lose most of their share, and say so; the low band gains.` },
    { posture:"cautious", label:"Leave it: the freight route matters more than who benefits.",
      brief:"Defending the subsidy on trade grounds while conceding the "+
        "distribution point. Honest and unpopular in the low band.",
      effects:[{ economy:{ trade:2 } },
               { move:{ "standing.low":-3 } },
               { move:{ "rel.gb_chair":-4 } }],
      result:`The subsidy stands, and Tanako's table is in The Spindle by the weekend.` },
    { posture:"bold", label:"Withdraw it entirely.",
      brief:"Undoing the government's own instrument two sittings after "+
        "laying it. Saves the money and costs the argument.",
      effects:[{ law:{ transit_subsidy:"none" } },
               { move:{ solvency:6000 } },
               { move:{ "price.transit":10 } },
               { economy:{ trade:-3 } },
               { move:{ legitimacy:-4 } },
               { wire:"GOVERNMENT WITHDRAWS TRANSIT SUBSIDY" }],
      result:`The subsidy is withdrawn, six billion dollars are saved, and freight prices return to where they were. The opposition asks what the government introduced it for.` }
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
  body:`The consortium that bought the public substrate works has written again. It
wants a licence to run more computing than the capacity limit the Ministry
sets, and it presents the request as the second half of the sale.

"We paid a fair price in a hard quarter," says Edward Hatt, leader of the
Alliance of Business and Government, whose member firms make up the
consortium. "The whips' ledger shows what that was worth to you. The licence
settles it. Refuse, and the account stays open, and my members will remember
it at every division that needs them."`,
  choices:[
    { posture:"cautious", label:"Grant the licence, and settle the account.",
      brief:"Paying the debt with a regulatory decision. Clears the books "+
        "and establishes what the credit was actually for.",
      effects:[{ move:{ "capital.gb":-6 } },
               { economy:{ private:0.03 } },
               { move:{ "loyalty.cu_maintenance":-7 } },
               { move:{ legitimacy:-5 } },
               { flag:"ec_licence_granted" }],
      result:`The licence is granted and the government's account with the Alliance is settled. Your maintenance members read the new capacity figure and count the jobs in it; the country thinks the sale has been sweetened.` },
    { posture:"bold", label:"Refuse, and keep owing them.",
      brief:"Declining while carrying the debt. Nothing is spent and "+
        "nothing is settled, which is a position rather than a decision.",
      effects:[{ move:{ "loyalty.gb":-10 } },
               { move:{ "rel.hatt":-8 } },
               { move:{ "loyalty.cu_maintenance":5 } }],
      result:`The request is refused in a letter of four lines. Hatt's reply is shorter, and the Alliance's members are harder to find at the next division. Your maintenance members approve.` }
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
  body:`The Commonwealth is buying more than it sells, and fewer adults are in paid
work than could be. The Treasury has costed borrowing sixteen billion
dollars from the Standby Facility, the credit line Earth's banks hold open
for it, to pay for a building programme in the shipyards.

Edward Hatt, leader of the Alliance of Business and Government, whose member
firms would do the building, makes the case. "An economy that sells less
than it buys and employs fewer than it could should borrow to build," he
says. "Earth's banks set the rate, and it moves with every quarrel you have
with them. That is the price of the money. The other way to pay is from a
reserve that is already short."`,
  choices:[
    { posture:"bold", label:"Draw on the facility and build.",
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
      result:`Sixteen billion dollars are drawn, owed in US dollars, and the shipyards begin hiring. The debt grows whenever the Commonwealth dollar falls, and Earth reads the borrowing as dependence.` },
    { posture:"cautious", label:"Balance it at home instead.",
      brief:"Refusing the facility and finding the money internally. "+
        "Slower, cheaper in sovereignty, expensive in everything else.",
      effects:[{ move:{ solvency:-4000 } },
               { move:{ consumables:-3 } },
               { move:{ "loyalty.sc":6 } },
               { move:{ legitimacy:3 } }],
      result:`The programme is cut to the four billion dollars the reserve can pay, and the supply budget gives up the rest. Home Rule praises a budget that owes Earth nothing.` }
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
  body:`Darren Watkins Jr., the Leader of the Opposition, has given notice of a
motion to reopen the question the government settled. His own whips know it
cannot pass. It can put the question back on the order paper while the
government is weak, and let the country see whether the government defends
its answer.

"A settlement lasts as long as Parliament wants it to," Watkins tells The
Spindle, the Commonwealth's newspaper of record. "I would like to know how
long that is."`,
  choices:[
    { posture:"cautious", label:"Give the motion no time: the question is closed.",
      brief:"Using the government's control of time to deny a hearing. "+
        "Effective, and it concedes that the answer needs protecting.",
      effects:[{ move:{ legitimacy:-5 } },
               { move:{ "rel.watkins":-6 } },
               { move:{ public_standing:3 } },
               { flag:"ch4_refused_reopening" },
               { wire:"GOVERNMENT DENIES TIME TO REOPENING MOTION" }],
      result:`The Leader of the House finds no time for the motion. It stays on the order paper, never called, and Watkins asks about it at every Question Time until the House rises.` },
    { posture:"bold", label:"Give it a day and beat it in the open.",
      brief:"Spending order-paper time to win the argument twice. Costs a "+
        "slot and settles the question harder than the settlement did.",
      effects:[{ slots:{ total:-1 } },
               { move:{ legitimacy:8 } },
               { move:{ public_standing:5 } },
               { move:{ "loyalty.cu_maintenance":-4 } },
               { flag:"ch4_beat_reopening" },
               { wire:"REOPENING MOTION DEFEATED ON THE FLOOR" }],
      result:`The motion is debated for a day, at the cost of one slot of order-paper time, and defeated. The vote records the answer a second time, with more names behind it, and the country trusts it more.` }
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
  speaker:"trottier",
  body:`The coalition agreement still commits the government to carrying the
Divergence Threshold Bill, and the question the bill was about is now
settled.

Mandelina Trottier, the Deputy Prime Minister and leader of the New
Progressive Party, has come to talk about what the agreement is for now. "We
joined your government for one measure," she says. "That question is
answered. The commitment is still on the register, and I would like it to
say something true. Either we write a second programme, or we close this one
and govern on what is left."`,
  choices:[
    { posture:"bold", label:"Write them a second programme.",
      brief:"Giving the coalition a new purpose, which costs order-paper "+
        "time it has not got and buys the partner's loyalty.",
      effects:[{ slots:{ total:-1 } },
               { move:{ "loyalty.psa":12 } },
               { move:{ "capital.psa":-4 } },
               { move:{ "loyalty.cu_maintenance":-5 } },
               { flag:"ch4_second_programme" },
               { wire:"COALITION AGREES A SECOND PROGRAMME" }],
      result:`A second programme is drafted in an afternoon and agreed by evening: public substrate provision, a minimum level of suspension insurance, and a guaranteed running speed for emulated minds. It takes a slot of order-paper time. The Trades Left reads the list and counts what it will cost its members.` },
    { posture:"cautious", label:"Mark the commitment as met, and let the agreement stand as it is.",
      brief:"Closing the promise formally without replacing it. Honest, and "+
        "it leaves a partner in a coalition about nothing.",
      effects:[{ move:{ legitimacy:4 } },
               { move:{ "loyalty.psa":-9 } },
               { move:{ "trend.party_loyalty":-1 } },
               { flag:"ch4_agreement_hollow" }],
      result:`The commitment is marked as met, and neither side proposes a replacement. The New Progressive Party stays in the government with nothing in writing about why, and its loyalty begins to drift.` }
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
  body:`Parliament rises within three sittings, and Anil Devi, the Chief Whip, has
the last of the order paper: the time the government still holds, which
cannot be carried past the rise.

"Time left on the paper when the House rises is lost," Devi says. "Our
members have a list of small measures they have wanted since the spring. Or
we rise early, and the settlement is the last thing Parliament said."`,
  choices:[
    { posture:"cautious", label:"Spend it on the small things the benches have been asking for.",
      brief:"Using the remainder on backbench business. Buys loyalty broadly "+
        "and produces nothing the country will notice.",
      effects:[{ slots:{ total:-2 } },
               { move:{ party_loyalty:9 } },
               { move:{ "loyalty.cu_maintenance":6 } },
               { move:{ "loyalty.cu_deck":5 } }],
      result:`The last two slots go to your own members' measures, and three of them pass. The party goes into the recess in a better temper than it came.` },
    { posture:"bold", label:"Rise early, and let the settlement be the last thing said.",
      brief:"Ending the session on the settlement rather than on ordinary "+
        "business. Cheap, and it wastes time that had a use.",
      effects:[{ move:{ public_standing:4 } },
               { move:{ legitimacy:3 } },
               { move:{ party_loyalty:-5 } },
               { wire:`HOUSE RISES EARLY ON THE SETTLEMENT` }],
      result:`Parliament rises early and the record closes on the settlement, which the country respects. The members with measures waiting take them home, disappointed.` }
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
  body:`Emulated minds that cannot afford full speed run slower than real time, so
that a day passes for them in hours. For a month the civic clock subsidy has
paid to keep 560,000 such minds running at real time.

It costs seventy billion dollars a year from the reserve, and the heat of
running them goes through the Commonwealth's radiators. Vesna Girard, the
Minister for Substrate and Thermal, asks whether to keep the subsidy at real
time through the campaign, or halve it until the next budget.`,
  choices:[
    { posture:"cautious", label:"Hold it at real time.",
      effects:[{ move:{ "legitimacy":3 } }, { move:{ "loyalty.psa":3 } },
               { move:{ "loyalty.cu_maintenance":-3 } }],
      result:"The minimum stays at real time, and so does its cost. The New Progressive Party approves; your maintenance members count the money." },
    { posture:"bold", label:"Halve it until the estimates.",
      effects:[{ law:{ civic_clock_minimum:0.5 } }, { move:{ "loyalty.psa":-6 } },
               { move:{ "loyalty.cu_maintenance":3 } },
               { wire:"CIVIC CLOCK MINIMUM HALVED UNTIL THE ESTIMATES" }],
      result:"The minimum falls to half of real time, at half the cost and half the heat. For 560,000 people, a day now takes two. The New Progressive Party is angry." }
  ]},

{ id:"ec_first_restorations", chapter:2, weight:60, once:true,
  when:{ lawIs:{ suspension_debt_accrual:false } },
  title:"The first restorations",
  speaker:"herrera",
  body:`Under the debt moratorium, debts stop growing while a person is suspended.
The first people switched back on under it owe exactly what they owed on the
day they were switched off.

The Underwriters, the Commonwealth's insurers, have repriced suspension
insurance to match. A quarter spent suspended now costs less than a
quarter's rent, and the new policies say so in their terms. Jason Herrera,
the Minister for Labour and Participation, asks whether the government is
content with that.`,
  choices:[
    { posture:"cautious", label:"Let the repricing stand.",
      effects:[{ move:{ "actor.underwriters":4 } }, { move:{ "loyalty.psa":2 } }],
      result:"Suspension insurance is now sold as a way to wait out a bad quarter. The Underwriters are pleased, and so, mildly, is the New Progressive Party." },
    { posture:"bold", label:"Cap the premium by government order.",
      effects:[{ move:{ "actor.underwriters":-6 } }, { move:{ "solvency":-3000 } },
               { move:{ "legitimacy":2 } },
               { wire:"GOVERNMENT CAPS SUSPENSION COVER PREMIUMS BY ORDER" }],
      result:"The premium is capped, and the reserve pays the three billion dollars the Underwriters would have charged. The Underwriters take note." }
  ]},

/* THE SHED ORDER, PUBLISHED. `shed_order_authority` moved from the
   engineering authority to statute when the Civilian Oversight Bill passed,
   and nothing read it: a fourth law that did nothing, found once the chain
   audit counted bills as movers (design/34). */
{ id:"shed_order_published", chapter:2, weight:66, once:true,
  when:{ lawIs:{ shed_order_authority:"statute" } },
  title:"The shed order, laid before the House",
  speaker:"brakk",
  body:`Under the new Shed Order (Civilian Oversight) Act, the shed order, the list
of who stops running first in a power shortage, must be published and laid
before Parliament.

The first list laid is the one the engineering authority was already using.
At its head is the residual constituency: the people who belong to no
recognised trade or profession, the unemployed, the dependent and the
already suspended. After them come the stations least able to supply
themselves.

Sunniva Brakk, the Minister for Home Affairs and Contingencies, can lay the
list as the engineers drew it, or reorder it by how exposed each station is
before Parliament reads it.`,
  choices:[
    { posture:"bold", label:"Reorder it, so the most exposed stations are shed last.",
      effects:[{ move:{ "standing.low":4 } }, { move:{ "loyalty.hul":-8 } },
               { move:{ "legitimacy":3 } },
               { wire:"SHED ORDER REORDERED BY EXPOSURE BEFORE IT IS LAID" }],
      result:"The published list puts the stations with the least margin last. The low band welcomes it, and the engineers' party calls it a political document." },
    { posture:"cautious", label:"Lay it as the engineers drew it.",
      effects:[{ move:{ "loyalty.hul":4 } }, { move:{ "public_standing":-3 } },
               { move:{ "loyalty.psa":-4 } }],
      result:"The list is laid as drawn, and Parliament reads the order in which the Commonwealth switches off its people. The engineers' party approves; the country and the New Progressive Party do not." }
  ]},

/* THE OPPOSITION'S DOSSIER (design/38 §1). The campaign's seventh beat,
   which was empty: the other side publishes its case against the record,
   and how well an answer lands depends on whether the country believes
   the record it answers for. */
{ id:"ch3_the_dossier", chapter:3, prologue:7, once:true,
  title:"The dossier",
  speaker:"watkins",
  body:`The opposition publishes its case against the government in a single
forty-page document, and The Spindle, the Commonwealth's newspaper of
record, prints it in full. Each page takes one sitting of the session and
sets the government's decision beside the opposition's alternative.

"We did not write it," says Darren Watkins Jr., the Leader of the
Opposition. "The government did. We only put it in order."`,
  choices:[
    { posture:"measured", label:"Answer it line by line.",
      when:{ scalarAbove:{ legitimacy:54 } },
      note:"The country believes the record, so an answer to every page is forty chances to be right.",
      effects:[{ move:{ "public_standing":5 } }, { move:{ "legitimacy":2 } },
               { wire:"GOVERNMENT ANSWERS THE OPPOSITION DOSSIER LINE BY LINE" }],
      result:"Every page is answered by the evening, and most of the answers are stronger than the charges. The government's standing rises." },
    { posture:"measured", label:"Answer it line by line.",
      when:{ scalarBelow:{ legitimacy:55 } },
      note:"The country does not believe the record, so an answer to every page is forty chances to repeat the charge.",
      effects:[{ move:{ "public_standing":-5 } },
               { wire:"GOVERNMENT ANSWERS THE OPPOSITION DOSSIER LINE BY LINE" }],
      result:"Every page is answered, and each answer puts that page back on The Spindle's front page for another day." },
    { posture:"cautious", label:"Say nothing and keep campaigning.",
      note:"It costs a little and it ends the story sooner.",
      effects:[{ move:{ "public_standing":-2 } },
               { wire:"GOVERNMENT WILL NOT ANSWER THE OPPOSITION DOSSIER" }],
      result:"The dossier leads the news for a day, and then the campaign moves on. Staying silent costs a little standing." },
    { posture:"bold", label:"Publish one of our own.",
      note:"It moves votes, and it tells the country the campaign is now about who was worse.",
      effects:[{ move:{ "public_standing":4 } }, { move:{ "legitimacy":-5 } },
               { wire:"GOVERNMENT ANSWERS WITH A DOSSIER ON THE OPPOSITION" }],
      result:"The government publishes its own dossier on the opposition the next day. The Spindle prints both under one headline, and voters trust neither side more for it." }
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
  body:`One of the government's coalition partners has written to Anil Devi, the
Chief Whip, shortly before The Spindle, the Commonwealth's newspaper of
record, gets the letter, the last courtesy a departing partner extends. The
party has withdrawn from the coalition agreement, and its members will vote
as they choose.

Without them the government no longer has the majority it has relied on
since it was formed. If it cannot find one, it will face a vote of
confidence within a few sittings.

"They have not joined the opposition," Devi says. "They have left us. That
difference is worth one conversation, and it had better be this week."`,
  choices:[
    { posture:"measured", label:"Send for their leader and offer terms.",
      cost:{ slot:1 },
      note:"A day of the order paper and a concession made in public. If their loyalty " +
           "is back to where they would sit with you, they return before the House divides.",
      effects:[{ court:16 }, { move:{ public_standing:-2 } },
               { wire:"PRIME MINISTER OFFERS TERMS TO THE PARTY THAT WALKED OUT" }],
      result:"Your terms are with their leader, who is deciding whether a government that let things come to this is worth rejoining." },
    { posture:"cautious", label:"Let the whips work the lobbies.",
      note:"Cheaper, quieter and slower. The whips spend their own credit with the benches doing it.",
      effects:[{ court:6 }, { move:{ party_loyalty:-2 } }],
      result:"The whips work the tea room, winning the partner's members back one at a time." },
    { posture:"bold", label:"Let them go, and face the House on the numbers.",
      note:"If the numbers are short, the House decides the government's future on the day the motion is set down.",
      effects:[{ move:{ public_standing:2 } }, { move:{ legitimacy:1 } },
               { wire:"GOVERNMENT WILL FACE THE HOUSE WITHOUT ITS PARTNER" }],
      result:"The government says it will face the House without them and let the vote decide. The country respects the candour." }
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
  body:`The Reserve Bank Act gives the Governor control of the cash rate, the
interest rate the Bank sets, and gives the Treasury one letter a year saying
what the rate is for. The last letter set an inflation target of two per
cent.

Maren Castellane, the Governor of the Reserve Bank, has asked in writing
whether the new government means to say the same. Unasked, she has attached
the section of the Act under which Parliament may give her a reserve
direction, an order telling the Bank what to do with the rate. She wants it
understood that she has read it.`,
  choices:[
    { posture:"cautious", label:"Two per cent, as before.",
      effects:[{ economy:{ credibility:0.08 } }, { move:{ "rel.castellane":6, "actor.underwriters":2 } }],
      result:"The letter is two lines long. The markets read it in a minute and forget it by the afternoon, which is what a remit is for, and they trust the Bank a little more." },
    { posture:"bold", label:"Three per cent: growth first.",
      effects:[{ law:{ inflation_target:3 } }, { economy:{ credibility:-0.08, expected:0.5 } },
               { move:{ "loyalty.cu":4, "actor.underwriters":-3 } },
               { wire:"TREASURY RAISES THE INFLATION TARGET TO THREE PER CENT" }],
      result:"The target moves a point, and so does every interest rate agreed in the Commonwealth that week. The unions call it the first honest remit since the dollar was floated in 2073; the markets expect higher prices." },
    { posture:"measured", label:"Two per cent, with full employment as an equal goal.",
      effects:[{ law:{ bank_mandate:"dual" } }, { economy:{ credibility:-0.02 } },
               { move:{ "loyalty.cu_maintenance":4 } },
               { wire:"RESERVE BANK GIVEN A DUAL MANDATE" }],
      result:"The Bank will weigh people out of work as heavily as prices, so it will cut rates sooner and raise them later. The Governor replies that she will need both halves of the remit to be believed." }
  ]},

{ id:"rb_inflation_print", chapter:2, weight:70, maxFires:1,
  when:{ economyAbove:{ overshoot:1.2 }, dissolved:false },
  title:"The inflation figure",
  speaker:"ceyhan",
  body:`The quarterly inflation figure reaches The Spindle, the Commonwealth's
newspaper of record, an hour before the Treasury's own copy reaches the
Treasurer. Inflation is well above the Reserve Bank's target, and most of it
is the rising price of heat, the thermal quota the stations pay for.

Ivor Ceyhan, The Spindle's political editor, asks the question at the door
that every paper prints the next morning: whose fault is it?`,
  choices:[
    { posture:"cautious", label:"Back the Bank: it will bring inflation down.",
      effects:[{ move:{ legitimacy:2, public_standing:-3 } }, { economy:{ credibility:0.05 } }],
      result:"The government backs a rate rise it has not yet seen. Markets trust the Bank more; every household paying for heat trusts the government less." },
    { posture:"measured", label:"Blame Earth's prices.",
      effects:[{ move:{ friction:3, public_standing:2, "actor.earth_bloc":-2 } }],
      result:"It is partly true, and voters like it. By evening Earth's governments have answered with the other part, and the quarrel with Earth grows." },
    { posture:"bold", label:"Promise relief on the thermal bill.",
      effects:[{ move:{ solvency:-6000, public_standing:4 } }, { economy:{ expected:0.3, credibility:-0.03 } }],
      result:"The reserve pays six billion dollars of relief, which households spend on heat: the very thing the Bank was trying to make dearer. Markets expect higher prices." }
  ]},

{ id:"rb_open_letter", chapter:2, weight:66, once:true,
  when:{ economyAbove:{ overshoot:2 } },
  title:"An open letter from the Governor",
  speaker:"castellane",
  body:`The Reserve Bank Act requires the Governor to write publicly to the
Treasurer whenever inflation misses the target by more than two points. The
letter from Maren Castellane, the Governor, runs to four pages.

It says what went wrong, what the Bank will do, and how long that will take.
The last paragraph says what the Bank cannot do: it cannot make heat
cheaper, and it cannot make the government spend less.`,
  choices:[
    { posture:"measured", label:"Publish a reply that endorses every word.",
      effects:[{ economy:{ credibility:0.06 } }, { move:{ "rel.castellane":6, "loyalty.cu":-3 } }],
      result:"The two letters are printed side by side, and the markets read them as one voice. Your party reads them as the Governor writing the government's budget." },
    { posture:"cautious", label:"Acknowledge it and say nothing more.",
      effects:[{ move:{ legitimacy:-1 } }],
      result:"The letter stands on its own, and people read it as the Bank blaming the government." },
    { posture:"bold", label:"Answer it in the House.",
      effects:[{ move:{ public_standing:3, "rel.castellane":-10 } }, { economy:{ credibility:-0.06 } }],
      result:"You tell Parliament the Bank has missed its target one year in nine. The Governor watches from the gallery, the country enjoys the fight, and markets trust the Bank less." }
  ]},

{ id:"rb_dollar_falls", chapter:2, weight:74, once:true,
  when:{ economyBelow:{ fx:0.78 } },
  title:"The dollar falls",
  speaker:null,
  body:`The Commonwealth dollar has fallen below seventy-eight US cents, and the
Treasury's morning note begins with the arithmetic. Every cent it falls adds
to what the Commonwealth owes Earth's banks, which lend in their own
currencies, and to the price of everything the stations import.

The Reserve Bank holds the Commonwealth's reserves of Earth currencies, and
the Treasury decides whether to spend them buying dollars.`,
  choices:[
    { posture:"measured", label:"Sell reserves and hold the line.",
      when:{ economyAbove:{ reserves:10000 } },
      effects:[{ economy:{ reserves:-10000, fx:4 } }, { move:{ legitimacy:1 } }],
      result:"The Bank sells ten billion of its US dollars in a morning, and the dollar steadies. The markets have also learned how many such mornings the Bank can afford." },
    { posture:"bold", label:"Ask the Governor for a rise between meetings.",
      effects:[{ economy:{ rate:0.5, fx:3, shock:-0.6, credibility:-0.02 } }, { move:{ "rel.castellane":2, public_standing:-2 } },
               { wire:"RESERVE BANK RAISES HALF A POINT BETWEEN MEETINGS" }],
      result:"The Bank raises its rate half a point between meetings, which it has done only once before, in 2073. Mortgages on long leases cost more by the end of the week." },
    { posture:"cautious", label:"Let it find its level.",
      effects:[{ economy:{ trade:3, expected:0.3 } }, { move:{ public_standing:-1 } }],
      result:"The dollar settles lower. The Commonwealth's computing is cheaper to Earth by the same margin, and orders grow, but so does the price of imports." }
  ]},

{ id:"rb_downgrade", chapter:2, weight:71, once:true,
  when:{ economyAbove:{ debt:6 } },
  title:"The continuity rating",
  speaker:null,
  body:`The Underwriters, the Commonwealth's own insurers and lenders, have cut its
continuity rating, their judgement of whether a borrower will keep running,
by one notch. Their note is three sentences long: debt is rising against
output, the thermal margin is thin, and the government has not said how it
will pay.

The Treasury bills sold on Friday will cost a quarter of a point more in
interest, and so will every issue of the Commonwealth's notes after them.`,
  choices:[
    { posture:"bold", label:"Announce a plan to cut the deficit.",
      effects:[{ flag:"rating_cut" }, { flag:"consolidation_promised" },
               { move:{ public_standing:-3, legitimacy:3 } }, { economy:{ shock:-0.8, credibility:0.03 } }],
      result:"The plan is a page of figures and a promise. The rating stays where it was cut to, but the Underwriters' next note is shorter and the country trusts the government a little more." },
    { posture:"measured", label:"Dispute the rating.",
      effects:[{ flag:"rating_cut" }, { move:{ "actor.underwriters":-5, public_standing:1 } }, { economy:{ fx:-1.5 } }],
      result:"The Treasury's rebuttal is longer than the Underwriters' note, and the Underwriters take its length as their answer. The dollar dips." },
    { posture:"cautious", label:"Say nothing and tender the bills.",
      effects:[{ flag:"rating_cut" }],
      result:"The bills are sold, at the higher price the rating set." }
  ]},

/* the answers to the two money initiatives (content/initiatives.js) */
{ id:"governor_answers", queuedOnly:true,
  title:"The Governor's answer",
  speaker:"castellane",
  body:`Maren Castellane, the Governor of the Reserve Bank, has replied in her own
handwriting, which at the Bank means the letter is not for the file.

She will not move the cash rate, the interest rate the Bank sets, because a
government asks her to. But at the Bank's next meeting she will say that it
expects the price of heat, the thermal quota price that has pushed inflation
up, to fall back, and that it can wait to see whether it does. That
statement is worth a quarter of a point off the rate, and she wants it
understood that the decision is hers.`,
  choices:[
    { posture:"measured", label:"Take what she offers.",
      effects:[{ economy:{ rate:-0.25, credibility:-0.02 } }, { move:{ "rel.castellane":3 } }],
      result:"The Bank cuts the rate by a quarter of a point and calls the rise in the heat price temporary. If the price falls, nobody will remember the cut. If it does not, markets will trust the Bank a little less." },
    { posture:"bold", label:"Remind her that the House can direct the Bank by order.",
      effects:[{ economy:{ credibility:-0.05 } }, { move:{ "rel.castellane":-12 } }, { flag:"direction_threatened" }],
      result:"The Governor does not reply. The Bank's next statement is two sentences longer, and both defend its independence under the law that created it." },
    { posture:"cautious", label:"Let it go.",
      effects:[{ move:{ "rel.castellane":4 } }],
      result:"The Bank sets the rate by its published rule, and prints the rule beside its decision." }
  ]},

{ id:"dollar_line_tested", queuedOnly:true,
  setpiece:{ title:"Dealers test whether the Commonwealth will defend its dollar" },
  title:"The line is tested",
  speaker:null,
  body:`Currency dealers have spent a week testing whether the Treasury will defend
the Commonwealth dollar. The Reserve Bank has been selling its holdings of
Earth's currencies to buy dollars, and the dealers have been counting what
is left.

The dollar has floated freely since 2073. The Reserve Bank holds reserves of
Earth's money, and the Treasury decides whether to spend them buying the
dollar back. A stronger dollar makes imports cheaper and the debt owed to
Earth's banks lighter, for as long as the reserves last.

The dealers on the Bourse, the Commonwealth's trading station, know how much
the Bank holds, because the Bank publishes it. What they have spent the week
finding out is how much of it the Treasury will spend.

Maren Castellane, the Governor of the Reserve Bank, sent the Treasury this
morning's figure without comment.`,
  choices:[
    { posture:"bold", label:"Spend what it takes.",
      when:{ economyAbove:{ reserves:15000 } },
      effects:[{ economy:{ reserves:-15000, fx:3, credibility:0.02 } }],
      result:"The line holds, and the reserves are fifteen billion lighter for holding it." },
    { posture:"cautious", label:"Let the line go.",
      effects:[{ economy:{ fx:-5, credibility:-0.06 } }, { move:{ legitimacy:-3 } }],
      result:"The dollar falls through the line the Treasury drew, and the next line anybody draws will cost more to believe." }
  ]},

/* =============================================================
   THE ECONOMY HAPPENS TO THE GOVERNMENT (design/40 E6). Random play
   finished at a mean inflation of 3.0% and a dollar of 0.84: the only
   shocks were the crisis's, so a run that met no crisis met no economy,
   and the election, which hears the economy, heard nothing. Two dated
   shocks the government did not cause and must answer, one on demand
   and one on prices. Dated, so every run meets them and the calendar
   shows the first coming; appended here, since an event inserted
   mid-list moves every run. The choices run from the cautious answer to
   the bold one.
   ============================================================= */
{ id:"ec_earth_slows", chapter:2, at:25, once:true,
  foreseen:"Earth's quarterly accounts",
  title:"Earth's quarterly accounts",
  speaker:null,
  body:`Earth's statistical offices report that output across Earth's major
economies fell last quarter, the first fall since before the Commonwealth
was founded in 2064. The first thing Earth's firms cancel in a bad quarter
is computing bought from orbit, and the Treasury expects the Commonwealth's
orders to fall within the month.

The Treasury has three answers ready, which differ in how much of the fall
the government means to cushion.`,
  choices:[
    { posture:"cautious", label:"Hold the budget, and let trade take the strain.",
      note:"Nothing new is spent. Receipts fall with the orders and the deficit widens on its own. The fall in demand is taken in full.",
      effects:[{ economy:{ shock:-2.5, trade:-4 } }, { move:{ public_standing:-1 } }],
      result:"The Treasury says the budget is sound, and orders fall as it said they would. The economy takes the full blow." },
    { posture:"measured", label:"Bring forward the public works Parliament has already approved.",
      note:"CW$6bn of capital works, spent this year instead of next. It cushions about half the fall and needs no new vote.",
      effects:[{ economy:{ shock:-1.2, trade:-4 } }, { move:{ solvency:-6000, public_standing:1 } }],
      result:"The shipyards are told to start now the six billion dollars of work planned for next year, and they hire before the orders fall. The blow is halved." },
    { posture:"bold", label:"Borrow CW$15bn and spend it now.",
      note:"Enough to fill the hole in demand and some over. The Underwriters will mark the debt, and the Bank will see the spending coming.",
      effects:[{ economy:{ shock:0.5, trade:-4, credibility:-0.02 } },
               { move:{ solvency:-15000, public_standing:2, "actor.underwriters":-3 } },
               { wire:"GOVERNMENT ANSWERS EARTH'S SLOWDOWN WITH CW$15BN" }],
      result:"The package is announced before the markets open and the economy barely feels the fall. The Underwriters' note on it is one line, and the line is the size of the debt." }
  ]},

{ id:"ec_decks_fail", chapter:2, at:39, once:true,
  title:"The harvest on the decks",
  speaker:null,
  body:`Blight has destroyed a third of the season's crop on the farm decks of
Homestead and Harvest, and the growers announce it before the ministry does.
Whatever the decks cannot grow the stations must import, at the cost of
bringing it up from Earth, and the price of food is the first price every
household notices.

The shortfall will last a season. The higher price will be on every
household's bill before Parliament rises.`,
  effects:[{ move:{ consumables:-4 } }],
  choices:[
    { posture:"cautious", label:"Let the stations import what the decks cannot grow.",
      note:"The market fills the gap at the market's price. Food is dearer for a season, and dearest for the low band.",
      effects:[{ economy:{ inflation:0.8, trade:-3 } }, { move:{ "standing.low":-2 } }],
      result:"The imports arrive on the next delivery, and so does the bill: inflation rises almost a point, and the low band feels it most." },
    { posture:"measured", label:"Carry the cost of the imports for the season.",
      note:"About CW$4bn from the reserve, so the price barely moves. The growers are paid for nothing they grew.",
      effects:[{ economy:{ inflation:0.2, trade:-3 } }, { move:{ solvency:-4000, public_standing:1 } }],
      result:"The ministry buys the season's shortfall at the import price and sells it at last year's, at a cost of four billion dollars. Prices barely move." },
    { posture:"bold", label:"Fix the price of food until the next harvest.",
      note:"The price is held by order and nobody measures a rise. The shelves on the far stations empty first, and the decks' own growers are ruined by it.",
      effects:[{ economy:{ inflation:-0.1 } }, { move:{ consumables:-3, public_standing:2, "loyalty.rv":-4 } },
               { wire:"FOOD PRICES FROZEN BY ORDER UNTIL THE NEXT HARVEST" }],
      result:"The order is posted on every deck by morning, and prices hold. The growers, many of them members of the Congregational Democratic Alliance, read it aloud in their meeting houses, and nobody applauds. With no profit in it, less food is brought up." }
  ]},

/* A PARTNER STANDS ASIDE (design/40 E9). The first of the two lines: it
   has left the coalition agreement and still holds the government up on
   confidence and supply. `setup.onPartnerStandsAside` names this event.
   It is the moment a government negotiates, and until now the only
   warning a player had was the second line, when the House was already
   counting. `court` moves every partner that has stood aside or walked
   out, which is the one set this event cannot name in advance. */
{ id:"partner_stands_aside", queuedOnly:true,
  title:"A partner stands aside",
  speaker:"okarie",
  body:`A coalition partner has written to say it is leaving the coalition
agreement. Its ministers are "considering their positions", and it will vote
on each measure on its merits.

It will not bring the government down. The letter says so twice, which Anil
Devi, the Chief Whip, reads as a price being set rather than a promise.
"They will still support us on confidence," he says. "On everything else
they are nobody's, and a party that has left once finds it easier the second
time."`,
  choices:[
    { posture:"cautious", label:"Take them at their word, and govern.",
      note:"Nothing is offered. They keep the government alive and vote as they please on everything else, and the whips count every division twice.",
      effects:[{ move:{ party_loyalty:1 } }],
      result:"The government carries on without the agreement. Every vote now has to be counted afresh, measure by measure." },
    { posture:"measured", label:"Let the whips take them to lunch.",
      note:"The whips spend their own credit on the partner's benches. Slower, and it asks nothing of you in public.",
      effects:[{ court:7 }, { move:{ party_loyalty:-1 } }],
      result:"The whips report back that the partner's members like being asked, and some are warming again." },
    { posture:"bold", label:"Put a new agreement on the table this week.",
      cost:{ slot:1 },
      note:"A day of the order paper and a concession made in public. If it is enough, they come back into the agreement before the next division.",
      effects:[{ court:15 }, { move:{ public_standing:-2 } },
               { wire:"PRIME MINISTER OFFERS A NEW COALITION AGREEMENT" }],
      result:"The new terms are with the partner, and its executive meets to decide whether they are enough." }
  ]}

];
