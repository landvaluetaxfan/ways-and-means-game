/* =============================================================
   FLASH I — EVENTS. Act I: sittings 1 to 16, closing on the rise.

   design/80 (7 Oct 2026): the playable game is Act I, and every word a player
   reads is rewritten for it, one sitting at a time, from the ledger in
   briefs/act-one.md. The old story is in content/campaigns/parked/, kept and
   not shown. The ids here begin `a1_`.

   Every entry in this file belongs to Flash I: `campaign()` (in
   content/setup.js) tags each one `campaign:"flash_i"` and adds it to the
   world's EVENTS. Written as the world's events are, and read by the same
   engine; campaign.js beside this file says what the folder is.

   APPEND, DO NOT INSERT. The pool's seeded lean is keyed on an event's
   position in the list the campaign plays. A new one goes at the end.
   ============================================================= */
campaign("flash_i", { events: [

/* SITTING 1. THE COMMISSION (the Claude Doc, Decision 1). The choices are about
   things a new player understands: the budget, life support on the stations, or
   nothing. Copies and the personhood bill are not in Act I; the currents wait for
   sitting 2. The President is a cat and a capable politician: dry, a little
   procedural, and what he says is a judgment or a question.

   The effects of the second and third choices are the old ones, and the flag
   `commission_stations` is read by the Ember Ridge scene. The first choice is new
   and its numbers are PROVISIONAL (the President's regard, the New Progressive
   Party, public standing): they need a playtest. */
{ id:"a1_commission", prologue:1, once:true,
  title:"Adriana Eireann Flash — The Edge of History",
  speaker:"tenaya",
  body:`The President receives you in the Winter Garden, the capital of the Commonwealth, a federation of thirty orbital habitats called stations. It was built as a station of its own so that no other station's voters would own the seat of government, and its 80,000 residents return one member to Parliament, who can introduce bills and speak but cannot vote. The walk from the lift passes Earth's embassies, each in a garden kept at its own country's climate: six climates in a mile. The congress hall where the Perigee Charter was signed in 2064 stands at the centre of the station.

Jaco van Ryneveld has been President since 2077, elected by a direct vote of the whole Commonwealth on the ticket of the Liberal Party, which leads the opposition in the House, with 51.4 per cent. He is a cat, one of the uplifted, the category of person the law gives to animals made sapient. They are 4 per cent of the Commonwealth's adults. Relations between his office and your party are cold.

This morning he has one thing to decide. The Charter, the Commonwealth's constitution, obliges him to appoint as Prime Minister whoever can command a majority of the House, and to sign the commission, the document that makes the appointment, once he is satisfied that they can. The commission is on the desk in front of him. He has not signed it.

You have led the government since January, when your party replaced Nils Vijlbrief, whose Treasurer you were. In March you led the party into a general election that no party won outright, and you have spent the weeks since bargaining for a majority. The commission is for the new Parliament.

A government keeps office only while it wins votes of confidence in the House. The House has 280 seats, so a majority is 141. Your coalition has 147 votes: 85 from your own party, the Party of Socialists and Democrats, 36 from the New Progressive Party and 20 from the Congregational Democratic Alliance. The other six belong to independents, who have promised their votes on confidence and the budget only. Without them you have 141, a majority of one.

The Charter also gives him reserve powers, among them the power to dissolve the House, which sends every member back to the voters.

He turns the commission toward you with one paw and keeps it there. "Sixty-two of your 147 votes belong to other people," he says. "I expect to sign. First I would like to hear what the government means to do, because the answer will tell me which of them you intend to keep."`,
  choices:[
    { posture:"measured",
      label:`The budget. The government cannot pay for anything until the House votes the money, and the independents have promised their votes on it.`,
      act:"Tell him",
      note:`You tell him the budget comes first. It is the one measure the government cannot do without. The President, who has not yet signed, sees a Prime Minister who starts with the work the House must do. The New Progressive Party, your second-largest partner, joined for a bill of its own and will notice that you did not name it.`,
      effects:[{ flag:"commission_budget" },
               { move:{ "rel.president":5 } },
               { move:{ "loyalty.psa":-3 } },
               { move:{ public_standing:1 } },
               { wire:"PM NAMES THE BUDGET AS THE GOVERNMENT'S FIRST BUSINESS" }],
      result:`He dates the commission and signs it. His office's note of the meeting records that the new Prime Minister named the budget as the government's first business.` },

    { posture:"bold",
      label:`Life support on the stations: the air, water, power and cooling that keep their people alive.`,
      act:"Tell him",
      note:`You tell him life support comes first. Four stations have run short of cooling during his term, and the President, the only official the whole Commonwealth elects, has taken the small stations' side. The maintenance unions in your party, whose members keep the stations running, will welcome it. The New Progressive Party will notice that you did not name its bill.`,
      effects:[{ flag:"commission_stations" },
               { move:{ "rel.president":8 } },
               { move:{ "loyalty.cu_maintenance":6 } },
               { move:{ "loyalty.psa":-6 } },
               { move:{ public_standing:3 } },
               { wire:"PM PUTS LIFE SUPPORT FIRST IN MEETING WITH THE PRESIDENT" }],
      result:`He signs the commission without reading it again, and tells you he has waited three years for a Prime Minister to raise the stations' cooling before he had to. His office tells the press that the Prime Minister raised life support first.` },

    { posture:"cautious",
      label:`Nothing specific. Tell him the government intends to last its full term, and that he will learn of its decisions when they are announced.`,
      act:"Tell him",
      note:`You tell him nothing. He keeps his power to dissolve the House, and he will remember being told nothing. The more moderate members of your party will approve of a Prime Minister who keeps her options open. The press usually reports a first meeting that ends without a statement as a quarrel.`,
      effects:[{ flag:"commission_none" },
               { move:{ "rel.president":-6 } },
               { move:{ "loyalty.cu_loyalists":7 } },
               { move:{ public_standing:-2 } },
               { wire:"PRESIDENT AND PRIME MINISTER MEET; NEITHER OFFICE COMMENTS" }],
      result:`He dates the commission and signs it without comment. Neither office issues a statement afterwards, and the evening news reports the silence as the new government's first quarrel.` }
  ]},

/* SITTING 2. THE FIRST QUESTION (Decision 2). The scene says what a current is,
   in text, before it asks the player to weigh one, and introduces the three the
   answers touch. The effects and the three flags are the old ones. */
{ id:"a1_first_question", prologue:2, once:true,
  title:"The first question",
  speaker:"ceyhan",
  body:`Your first press conference since the commission is carried live to all thirty stations. On Anselm Ring and the other stations of the ring band it falls in the middle of a working shift. On the outer habitats, supervisors have held back the shift change so that their crews can watch.

The press gallery has given the first question to Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper of record. He asks it without notes.

"Prime Minister, what should voters expect from this government that they did not get from the last one?"

The last government was Nils Vijlbrief's, and you served in it.

Your party is not one voice. The Party of Socialists and Democrats divides into four currents, groups of members who share a view of what the party is for, and each current's loyalty to you rises or falls with what you say. Three of them will weigh this answer.

The Trades Left is the largest current. Its members come from the maintenance trades and their unions, and it wants the systems they maintain publicly owned and paid for from federal funds.

The Soft Left is the current of the party's leadership. It wants public ownership and a strong federal government.

The Hard Left is the party's left flank, led by Dan Czarnecki. It is the current least loyal to you.

The voters will hear your answer too, and it will be quoted back to you.`,
  choices:[
    { posture:"measured",
      label:`A government that runs the Commonwealth competently. The last one could not.`,
      act:"Say it",
      note:`You answer that the government will be run well, which most voters want to hear. The engineers who keep life support running hear a government that respects expertise. The Trades Left hears an attack on Nils Vijlbrief, and remembers that you were the Treasurer who refused him the money for the stations' upkeep.`,
      effects:[{ flag:"led_on_competence" },
               { move:{ public_standing:5 } },
               { move:{ "loyalty.cu_maintenance":-6 } },
               { move:{ "rel.gb_chair":6 } },
               { wire:"PM PITCHES COMPETENCE; SAYS GOVERNMENT WILL BE 'RUN, NOT ARGUED WITH'" }],
      result:`Ceyhan writes it down, and The Spindle leads with it the next morning. The Trades Left hears you blame Vijlbrief's government for breakdowns it wanted the money to prevent.` },

    { posture:"cautious",
      label:`A government that stands for what this party has always stood for: public ownership, and the workers who keep the stations running.`,
      act:"Say it",
      note:`You answer that the government will stand for the party's traditions. The Trades Left will quote you at every meeting for a year, and the Soft Left is reassured. Voters who wanted a fresh start hear the old party. The New Progressive Party, your second-largest partner, joined for a bill of its own and will ask whether those traditions include it.`,
      effects:[{ flag:"led_on_continuity" },
               { move:{ "loyalty.cu_maintenance":11 } },
               { move:{ "loyalty.cu_loyalists":4 } },
               { move:{ public_standing:-4 } },
               { move:{ "loyalty.psa":-5 } },
               { wire:"PM CLAIMS THE MOVEMENT'S INHERITANCE; PARTNERS SEEK CLARIFICATION" }],
      result:`The New Progressive Party asks for the sentence in writing. At its next meeting it asks whether the party's traditions include the bill it joined the government to pass.` },

    { posture:"bold",
      label:`A government that is not the last one. This party has changed, and I changed it.`,
      act:"Say it",
      note:`You take credit for modernising the party, which most voters and the New Progressive Party want to hear. The Trades Left and the Hard Left fought that modernisation, and they will hear that the leadership no longer needs them. Your own members will quote it back at you the first time you ask them for a hard vote.`,
      effects:[{ flag:"led_on_break" },
               { move:{ public_standing:7 } },
               { move:{ "loyalty.psa":9 } },
               { move:{ "loyalty.cu_maintenance":-10 } },
               { move:{ "loyalty.cu_halloran":-6 } },
               { wire:"PM: 'THE PARTY HAD TO CHANGE.' CZARNECKI GROUP DECLINES TO COMMENT" }],
      result:`The Spindle prints the sentence on its front page. The Hard Left declines to comment, and its members sit through the afternoon's business without speaking.` }
  ]},

/* SITTING 3. WHO HOLDS THE TREASURY (Decision 3). Orders, initiatives, collective
   responsibility and the ballot on the leadership are explained in plain
   paragraphs before the scene uses them. The three candidates are
   content/cabinet.js's, and their effects are written out again here because the
   `cabinet` effect appoints and does not apply a candidate's effects.

   KNOWN GAP until the lever ladder (briefs/act-one.md, E3): if the post is filled
   from the Government tab first, this scene never fires. The author's answer
   (Option A) is that the appointment waits for this scene. */
{ id:"a1_treasury", prologue:3, once:true,
  when:{ postVacant:["treasury"] },
  title:"Who holds the Treasury",
  speaker:"castellane",
  body:`The Treasury has had no minister since January. You held the post until your party made you Prime Minister, and you have left it empty through the election and the coalition talks, because it is the largest post the government has to give.

A department without a minister can do little. A minister signs the department's orders, the formal rules a minister makes under powers an Act of Parliament has already given, which can be revoked later. A minister also begins its initiatives, the work the government sets in motion. Until someone holds the Treasury, it can do neither.

In those months the Treasury's officials have drawn up the estimates, the government's budget for the session, without a minister. The Treasurer signs the estimates and answers for them in the House, and no minister has signed this one. The House rises for its recess when the sitting period ends, and the top of the screen counts the sittings left. The estimates must be voted before then.

Maren Castellane, the Governor of the Reserve Bank, the Commonwealth's central bank, was your deputy when you ran the Bank and took it over when you went to the Treasury in 2076. She has come to talk about who will hold the Treasury. "I do not choose your Cabinet," she says. "I would only ask you to choose before the estimates reach the House, because the Bank will have to read them."

There are three names.

Aster Skye is the Financial Secretary. She was your deputy at the Treasury, and because you were not a member of the House while you held it, she spoke for the Treasury there.

Dan Czarnecki leads the Hard Left. He is collecting signatures from members of your party to force a ballot on your leadership: if twelve sign, the party votes on whether you remain its leader, and its leader is the Prime Minister. A minister is bound by collective responsibility, which means supporting every decision of the Cabinet in public or resigning.

Nadia Abadi is a backbencher of the Congregational Democratic Alliance, your third coalition partner. Her party holds two junior posts and has asked for a department that matters.

Whoever you appoint signs the estimates and answers for them in the House.`,
  choices:[
    { posture:"cautious",
      label:`Appoint Aster Skye, the Financial Secretary, who knows the estimates line by line.`,
      act:"Appoint her",
      note:`You appoint Skye, who already speaks for the Treasury in the House, and the markets will read it as no change of direction. The Soft Left approves. The Hard Left and the Trades Left, the party's union wing, will read it as the same Treasury that refused the stations their money.`,
      effects:[{ cabinet:{ treasury:{ holder:"skye", party:"cu" } } },
               { move:{ "loyalty.cu_loyalists":4 } },
               { move:{ "loyalty.cu_halloran":-6 } },
               { move:{ "loyalty.cu_maintenance":-3 } },
               { wire:"SKYE CONFIRMED AT THE TREASURY; NO CHANGE OF DIRECTION SIGNALLED" }],
      result:`Aster Skye is sworn in at the Treasury that afternoon, and its officials hand her the estimates to sign. The Reserve Bank's statement says it expects no change of direction.` },

    { posture:"bold",
      label:`Appoint Dan Czarnecki, who leads the Hard Left, and bind him to the Cabinet's collective responsibility.`,
      act:"Appoint him",
      note:`You appoint Czarnecki and bind him to collective responsibility. He must defend the estimates he signs, and his campaign for a ballot on your leadership ends. The Hard Left is delighted. The Soft Left says it was not consulted, and the markets will read the Hard Left's leader in the Treasury as a turn towards borrowing.`,
      effects:[{ cabinet:{ treasury:{ holder:"halloran", party:"cu" } } },
               { move:{ "loyalty.cu_halloran":26 } },
               { move:{ "loyalty.cu_loyalists":-11 } },
               { move:{ public_standing:-4 } },
               { signatures:-4 },
               { wire:"CZARNECKI TO THE TREASURY; LOYALISTS SAY THEY WERE NOT CONSULTED" }],
      result:`Dan Czarnecki is sworn in at the Treasury that afternoon. The Hard Left stops talking about a ballot, and the Soft Left tells the lobby correspondents that nobody asked it.` },

    { posture:"measured",
      label:`Appoint Nadia Abadi of the Congregational Democratic Alliance, and give the third partner the department it asked for.`,
      act:"Appoint her",
      note:`You appoint Abadi. The Alliance's 20 seats are part of the 141 you have without the independents, and it gets the department it asked for. The opposition will say the Treasury was bought with votes, and the Trades Left, whose members maintain the stations, will resent a partner deciding what the stations get.`,
      effects:[{ cabinet:{ treasury:{ holder:"abadi", party:"rv" } } },
               { move:{ "loyalty.rv":14 } },
               { move:{ "capital.rv":3 } },
               { move:{ "loyalty.cu_maintenance":-7 } },
               { wire:"TREASURY GOES TO THE CONGREGATIONAL DEMOCRATIC ALLIANCE IN REBALANCE" }],
      result:`Nadia Abadi is sworn in at the Treasury that afternoon. The Alliance's leaders say it is the first time the government has treated them as a partner, and the Liberal opposition asks in the House what qualifies a backbencher to run the Treasury.` },

    { posture:"bold",
      label:`Leave the Treasury without a minister for now, and let its officials carry on.`,
      act:"Wait",
      note:`You leave the post empty. The Treasury can make no orders and begin no initiatives until someone holds it, the opposition will point that out, and voters will see a government that cannot fill its most important department.`,
      effects:[{ flag:"treasury_left_vacant" }, { move:{ public_standing:-5 } }],
      result:`The Treasury can make no orders until someone holds the post, and the opposition knows it.` }
  ]},

/* SITTING 4. THE DRAFT ESTIMATES, a page, then THE ORDER PAPER, the decision.
   The page is a news report, so it is in the third person; the draft in the
   Claude Doc said "you" and this says "the government". It carries the quiet wire
   item that plants the Works. The page teaches what the estimates are and what a
   clause is. The decision teaches one chain, in the Chamber's own words: the paper
   lists measures, a measure moves one stage at a time, a stage costs a slot, and
   slots run out. "Six slots" is typed here, and setup.sittingsPerPeriod is not the
   same number: a constant that the text should print from the setup (E5). */
{ id:"a1_estimates", prologue:4, once:true,
  setpiece:{ title:"The Treasury costs the session's estimates at CW$48bn against a CW$52bn reserve",
    sections:[
    { kind:"document", head:"The Treasury's draft estimates",
      body:"Thermal quota, the cooling the stations are allowed: CW$14bn\n\nConsumables floor, the air, water, food and living space guaranteed to every resident: CW$16bn\n\nSubstrate insurance, cover for digital residents who cannot pay for the computing that runs them: CW$18bn\n\nCapital works: unfunded\n\nTransit subsidy: unfunded\n\nTax rates on volume, cooling, computing time and freight to orbit: all four at the standard rate\n\nTotal CW$48bn. Room under the reserve: CW$4bn.",
      source:"The Treasury" } ] },
  title:"The draft estimates",
  speaker:null,
  body:`The estimates are the government's budget for the session: what it will spend on each service, and the tax rates that pay for part of it. The Treasury's officials have costed the draft at CW$48bn.

The House may not vote more than the reserve, the Treasury's cash in hand, and the reserve holds CW$52bn. The draft has CW$4bn of room.

Each spending clause has several levels. A dearer level costs more, a cheaper one saves money, and every cut lands on someone. Substrate insurance pays the rent on the computer hardware, the substrate, that runs digital residents who cannot pay it themselves. Cut the clause and the residents it covered are suspended: their minds are kept intact but are not running.

The government sets the level of each clause before the estimates go to the House, and the levels it chooses must cost no more than the reserve.

The estimates also set four tax rates, on pressurised volume, cooling, computing time and freight to orbit. A rate does not change how much the House may vote. It changes how much that tax raises over the year.

Whoever holds the Treasury signs the estimates and answers for them in the House. Until the House votes, every figure can change.`,
  effects:[{ wire:"CORDELL'S ACCOUNTS STAY FROZEN IN EUROPE; ALMANAC WORKS CANNOT PAY SUPPLIERS" }],
  choices:[] },

{ id:"a1_order_paper", prologue:5, once:true,
  when:{ flagsAbsent:["taught_the_day"] },
  title:"The order paper",
  speaker:"okarie",
  body:`The Chief Whip, Anil Devi, puts the order paper on your desk before the House sits. It lists every measure the House has before it, with the party that moved it and the stage it has reached.

A measure goes through first reading, second reading, committee, report and third reading, and the House votes on it at the last. The House moves a measure from one stage to the next only when the government gives it time. That time is order-paper time, counted in slots. One slot moves one measure one stage. The government has six slots in each sitting period, and they refill when the House rises for its recess.

The estimates head the paper, at first reading. The House must vote them before it rises, because until it does the government cannot pay its officials. You give a slot to a measure in the Chamber.

Devi has the sitting to give you. He can spend it at your desk, going through the paper with you, or in the lobbies, asking members how they intend to vote.`,
  choices:[
    { posture:"cautious",
      label:`Go through the order paper with Devi, measure by measure, and keep him at your desk this sitting.`,
      act:"Go through it",
      note:`Devi names who moved each measure and what that member wants in return for a vote, so you read the paper knowing who stands behind each line. The lobbies go uncounted this sitting. Devi sits with the Soft Left, the current that leads your party, and its members will hear that you took his advice.`,
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":6 } }, { move:{ "loyalty.cu_loyalists":3 } }],
      result:`He names the member behind each measure and what that member wants for a vote. From the next sitting you read the paper yourself, and he will not go through it with you again.` },
    { posture:"bold",
      label:`Read the order paper yourself, and send Devi to the lobbies to ask members how they will vote.`,
      act:"Read it alone",
      note:`Devi spends the sitting in the lobbies asking members how they will vote. You read the paper without him, and may miss what a member wants in return for a vote. Devi will take it as a sign that you do not want his advice at your desk, and the newspapers will report that you read the paper yourself.`,
      effects:[{ flag:"taught_the_day" }, { move:{ "rel.okarie":-4 } }, { move:{ "public_standing":2 } }],
      result:`He goes to the lobbies to count votes. From now on you read the order paper alone each sitting, and he does not offer to help again.` }
  ]},

/* SITTING 5. THE TREATY, AND THE ONE SPARE SLOT (the Claude Doc, "One spare slot";
   design/78 round 6, decided by the author: the treaty is a gesture, not a rival).
   Two events, one sitting: a page that happened (the renewed terms are signed and the
   bill reaches committee), then the decision. The estimates need five of the six slots
   (four stage grants and the division), the treaty three, so one slot is spare and the
   choice is where it goes. The choices announce an intention and do not spend the slot,
   which the player spends in the Chamber (design/78). Choosing to promise it makes an
   undertaking that the Chamber's slot discharges, so the first promise the player makes
   is one they can see kept or broken. The treaty is the New Progressive Party's minister's
   (owner psa), so a slot given to it puts that party in the government's debt, which is
   where the whips' ledger is first met. Question Time does not appear: it is met at
   sitting 14. The numbers are PROVISIONAL and need a playtest. */
{ id:"a1_treaty", prologue:6, once:true,
  setpiece:{ title:"Kenya and the Commonwealth sign renewed terms for the Earth-Orbit Elevator" },
  title:"The Anchorage treaty",
  speaker:"ivarsen",
  body:`Kenya and the Commonwealth have signed renewed terms for the International Earth-Orbit Elevator, which lifts freight and passengers between Earth and Anchorage, a station of 231,000 people. The House must ratify the terms before they bind the Commonwealth.

To ratify a treaty is to vote to adopt it. The terms are in the Anchor Concession (Anchorage) Ratification Bill, which has reached committee, the third of the five stages a measure passes through.

The elevator's anchor stands at Malindi, on Kenya's coast, so the Commonwealth runs it as a tenant, under a concession from Kenya. Of the four elevators that serve the stations, the International is the only one governed by a treaty, and Anchorage depends on it.

Marit Ivarsen, the Minister for Trade and the Anchors and a member of the New Progressive Party, negotiated the renewal. "Kenya has agreed to renew," she said. "The terms apply once the House has voted, and I would like the bill moved."`,
  choices:[] },

{ id:"a1_spare_slot", prologue:7, once:true,
  title:"One spare slot",
  speaker:"okarie",
  body:`The estimates need five of the six slots this period: four to move them from first reading to third reading, and a fifth for the division, the vote that decides a measure. One slot is spare.

The Anchorage treaty is at committee and needs three slots: one to move it to report, one to move it to third reading, and one for its division. A single slot moves it one stage and cannot finish it, so the other two wait for the next sitting period.

Anil Devi, the Chief Whip, has the order paper open at both measures. "One slot," he says. "It can go on the treaty, or it can stay in hand. Initiatives cost a slot too. The estimates can't spare another."

Marit Ivarsen, the Minister for Trade and the Anchors, has asked him twice when the treaty will move.`,
  choices:[
    { posture:"bold",
      label:`Promise Marit Ivarsen the spare slot for the Anchorage treaty.`,
      act:"Promise it",
      note:`You tell Ivarsen the treaty moves this period, and you keep the promise by giving it a slot in the Chamber within eight sittings. A slot given to the treaty puts the New Progressive Party, her party, in your debt, and Kenya hears that the Commonwealth means to ratify. If the slot is not given, Ivarsen will tell Kenya so in public and the party will count it against you. You have no slot left for anything else.`,
      effects:[{ undertake:{ id:"a1_treaty_slot", text:"Give the Anchorage treaty a slot within eight sittings",
                 owed_to:"ivarsen", by:8, discharge:{ slot:"anchor_kepler" }, onBreach:"a1_treaty_unkept" } },
               { move:{ "rel.ivarsen":5 } }, { move:{ "loyalty.psa":2 } }],
      result:`Ivarsen tells the Kenyan government that the bill will move this period. Devi writes the promise in the whips' ledger, his running account of what each partner owes the government and what it is owed.` },
    { posture:"cautious",
      label:`Tell Marit Ivarsen the spare slot stays in hand, and the treaty waits for the next sitting period.`,
      act:"Hold it",
      note:`You keep the slot for whatever else costs one, an initiative for instance, and the estimates keep their margin. Ivarsen has nothing to tell the Kenyan government for another period, and the New Progressive Party, whose minister negotiated the treaty, will note that its measure did not move.`,
      effects:[{ move:{ "rel.ivarsen":-4 } }, { move:{ "loyalty.psa":-2 } }],
      result:`Devi writes the slot in his book as held. Ivarsen tells the Kenyan government that the bill will come in the next sitting period at the earliest.` }
  ]},

/* SITTING 6. ENERGY AND COOLING, AND EMBER RIDGE (the Claude Doc, "Energy and cooling";
   the ledger: the thermal quota, cooling, the thermal margin, a station's heat; opens the
   thermal clause and the first orders). A page, then the decision. The page is the
   clause's scene, with the minister who argues for it; the clause itself is set in the
   Chamber's panel. The decision is Ember Ridge, the face of a short quota: three ways to
   answer Girard, each with a cost the player can see. The orders are locked at the opening
   (a1_orders_locked, on the campaign's opening) and this scene unlocks them with whichever
   answer, so no order is made before a page has explained what an order is. The second
   answer is a promise that the order lever keeps. The third queues the outcome page, and
   its variant quotes the President's note from sitting 1 back (the author, 28 Sep).
   Every number in the choices is PROVISIONAL and needs a playtest. The figures in the page
   are the clause's own levels (a guard holds them equal). */
{ id:"a1_cooling", prologue:8, once:true,
  setpiece:{ title:"Releasing the full thermal quota would cost CW$34bn, Girard tells the Prime Minister" },
  title:"Energy and cooling",
  speaker:"girard",
  body:`Vesna Girard, the Minister for Substrate and Thermal, has told the Prime Minister what the thermal quota buys. The quota is the cooling that every station is allowed to use, released each session, and the draft estimates carry it at CW$14bn.

In orbit, heat leaves a station only by being radiated into space, and every watt of computation and industry becomes heat. Each station's radiators can reject a fixed amount. The quota is the permit to reject it, and the price of the permit is part of what every station pays to keep running.

The draft releases the quota at last session's figure, and the price holds where the market has held it. Held tight, the quota costs nothing in the estimates, the price rises, and the rise lands first on the stations with the least spare cooling. Released in full, it costs CW$34bn and the price falls to the cost of rejecting the heat. The radiators then limit how many minds the Commonwealth can carry.

One station already shows the cost of a short quota. Ember Ridge, a station of 213,000 people, has been below the cooling the law requires since 6 April, when one of its radiator arrays failed.

"A tight quota saves CW$14bn in the estimates," Girard said. "Ember Ridge is already short, and it will pay more for heat under that quota."

The government sets the level before the estimates go to the House: tight at CW$0, as last session at CW$14bn, or released in full at CW$34bn.`,
  effects:[{ flag:"clause_thermal_met" }],
  choices:[] },

{ id:"a1_ember_ridge", prologue:9, once:true,
  title:"Ember Ridge",
  speaker:"girard",
  body:`Vesna Girard, the Minister for Substrate and Thermal, has brought the figures for Ember Ridge. Its radiators can no longer reject all the heat the station's people and industry make, because an array of them failed on 6 April. The array is twenty-two years old, and its replacement is in the procurement queue behind a coolant-loop upgrade that the ministry has never managed to justify.

The thermal margin is the spare radiator capacity of the whole Commonwealth, what is left when every station has rejected its heat. The failed array has taken some of it, and while the array is down the margin keeps falling. If it reaches nought, stations overheat one after another and the government falls.

Ember Ridge's engineering authority, the body that runs life support there, can switch off the minds on the station's lowest band, 4,200 people, to keep the rest running. It may do so without telling a minister first.

"I can have the ministry's appeal drafted today," Girard says. "It will not fix the array. Anselm Ring has the spare capacity if you want to take it from there."

From today the Government screen lists the orders that the ministers can make. The appeal is the first of them.`,
  effects:[{ flag:{ a1_orders_locked:false } }],
  choices:[
    { posture:"bold",
      label:`Divert cooling capacity from Anselm Ring to Ember Ridge.`,
      act:"Divert it",
      note:`Ember Ridge gets the capacity today and the thermal margin recovers at once. The capacity comes out of Anselm Ring's allocation, and the Treasury pays CW$4bn in cash from the reserve for what it moves. Your own seat, First Spin, is on Anselm Ring, and voters across the ring will see their margin cut to cover another station.`,
      effects:[{ move:{ thermal_margin:11 } }, { move:{ solvency:-4000 } }, { move:{ public_standing:-4 } },
               { station:{ vantage:{ closure:0.03 } } },
               { wire:"ANSELM RING QUOTA DIVERTED TO EMBER RIDGE; RING MEMBERS OBJECT" }],
      result:`Anselm Ring gives up part of its spare cooling, and Ember Ridge holds. The members for the ring's constituencies object in the House the same afternoon.` },
    { posture:"measured",
      label:`Ask Girard to prepare the conservation appeal, the first of the government's orders on cooling.`,
      act:"Ask her",
      note:`You tell Girard to have the order ready, and you make it from the Government screen within three sittings. An order is a rule a minister makes under powers an Act has already given. It takes effect when made, and stands unless the House votes against it within six sittings. The appeal asks every station to cut the power it does not need, so Ember Ridge gets a little headroom and nobody is switched off. Until you make it, the array is still down, and the authority may act.`,
      effects:[{ undertake:{ id:"a1_appeal", text:"Make the conservation appeal (SI 2080/61)",
                 owed_to:"girard", by:3, discharge:{ si:"rung1_conservation" }, onBreach:"a1_ember_lowest_band" } },
               { move:{ "rel.girard":4 } }],
      result:`Girard has the appeal drafted. It needs the Prime Minister's name before it takes effect.` },
    { posture:"cautious", when:{ flagsAbsent:["commission_stations"] },
      label:`Leave Ember Ridge to its engineering authority, in case the array is repaired.`,
      act:"Leave it",
      note:`Waiting commits the government to nothing and costs nothing in the estimates. If the array is not repaired, the authority may switch off the 4,200 people on the lowest band without telling a minister, and the thermal margin keeps falling while it is down. Voters, the New Progressive Party and the maintenance unions in your party will hold the government to what it left undone.`,
      effects:[{ move:{ thermal_margin:-6 } }, { queue:[{ event:"a1_ember_lowest_band", after:3 }] }],
      result:`The array stays down. Girard says the authority will decide at its next meeting.` },
    { posture:"cautious", when:{ flags:["commission_stations"] },
      label:`Leave Ember Ridge to its engineering authority, in case the array is repaired.`,
      act:"Leave it",
      note:`You told the President on your first morning that the stations came first, and his office has the note. Waiting leaves the 4,200 people on Ember Ridge's lowest band exposed while the thermal margin falls, and the President's office will set that beside your words.`,
      effects:[{ move:{ thermal_margin:-6 } }, { move:{ "rel.president":-6 } }, { move:{ public_standing:-3 } },
               { queue:[{ event:"a1_ember_lowest_band", after:3 }] }],
      result:`The array stays down. The President's office asks, in writing, whether the stations still come first.` }
  ]},

{ id:"a1_ember_lowest_band", queuedOnly:true, once:true,
  setpiece:{ title:"Ember Ridge's engineering authority switches off its lowest band without telling the ministry" },
  title:"The lowest band",
  speaker:null,
  body:`At 04:12 the engineering authority, the body that runs life support on Ember Ridge, switched off the station's lowest band without telling the Minister for Substrate and Thermal. The 4,200 people on it stopped running and are held in suspension.

Their minds are kept intact, and they can be restarted. The authority acted within the law. The Allocation Act, the law that governs a shortage, lets it switch off the lowest band of the shed order, the published list of who stops running first, and does not require it to tell a minister. The failed radiator array is still down.

The Spindle, the Commonwealth's newspaper of record, has the timestamp and will print it tomorrow. The New Progressive Party, which speaks for digital residents, has called for the Prime Minister to answer in the House.`,
  effects:[{ move:{ thermal_margin:4 } }, { move:{ public_standing:-8 } }, { move:{ "loyalty.psa":-6 } },
           { move:{ "loyalty.cu_maintenance":-6 } }, { station:{ vantage:{ suspended:4200 } } },
           { flag:"ember_ridge_shed" },
           { wire:"EMBER RIDGE SHEDS ITS LOWEST BAND; PROGRESSIVES DEMAND ANSWERS" }],
  choices:[] },

/* The breach of the sitting-5 promise: the slot was not given within eight sittings. */
{ id:"a1_treaty_unkept", queuedOnly:true, once:true,
  setpiece:{ title:"Ivarsen tells Kenya the House will not move the treaty this period" },
  title:"The treaty waits",
  speaker:"ivarsen",
  body:`Marit Ivarsen, the Minister for Trade and the Anchors, has told the Kenyan government that the House will not move the Anchor Concession (Anchorage) Ratification Bill this period. The government had promised her a slot for it and has not given one.

The renewed terms for the International Earth-Orbit Elevator stay unratified, and Kenya's officials have noted that the Commonwealth's side of the renewal is still unsigned in law. Ivarsen's party, the New Progressive Party, has recorded the promise as broken.

"I told Kenya the bill would move," Ivarsen said. "I would like to know what I tell them now."`,
  effects:[{ move:{ "rel.ivarsen":-8 } }, { move:{ "loyalty.psa":-5 } }, { move:{ "actor.earth_host":-4 } },
           { flag:"promise_broken" },
           { wire:"TREATY SLOT PROMISED, NOT GIVEN; IVARSEN TELLS KENYA TO WAIT" }],
  choices:[] },

/* SITTING 7. THE BASICS: THE CONSUMABLES FLOOR (the Claude Doc, "The basics"; the ledger:
   the consumables floor, which opens the floor clause). The pattern of the four clause
   sittings, 7 to 10: a page in which the minister who wants the clause explains what it buys
   and costs, then a decision that is an ANNOUNCEMENT. The level itself is set in the Chamber,
   which is where the money is counted; a promise to reach a level is kept when the plan stands
   at it (the `clause` discharge, brief E12), so the choice "lift it" cannot be made free:
   the estimates must still fit the reserve, and the money has to come from another clause.
   By sitting 10 a player who has promised every minister what they asked for holds promises
   the reserve cannot pay for, and has to choose which to break. That is the budget, learned by
   play. The other answers set a level now, through the same door as the panel. Every figure in
   the text is a clause level, held to the bill by a guard. The numbers are PROVISIONAL. */
{ id:"a1_floor", prologue:10, once:true,
  setpiece:{ title:"The consumables floor costs CW$16bn, and lifting it would cost CW$30bn" },
  title:"The basics",
  speaker:"ashgrove",
  body:`Selim Ashgrove, the Minister for Consumables and Agriculture, has told the Prime Minister what the consumables floor covers: the air, water, food and living space guaranteed to every resident. The draft estimates carry it at CW$16bn.

The floor sets the rate at which every resident is carried, and the estimates pay for it. Trimming the guarantee takes it out of the estimates, and the saving shows in this session's accounts. The stations that cannot grow or recycle enough of their own food, water and air show the shortfall by the end of the month.

Lifting the floor carries the stations with the least of their own further than the guarantee requires. It costs CW$30bn, which is CW$14bn more than the draft carries, and the reserve, the Treasury's cash in hand, can pay only what the other clauses leave it.

"Every party wants the floor raised, and none of them says which clause pays for it," Ashgrove said. "If the House lifts it, the money has to come from somewhere else in the estimates."

The government sets the level before the estimates go to the House: trimmed at CW$0, held at CW$16bn or lifted at CW$30bn.`,
  effects:[{ flag:"clause_floor_met" }],
  choices:[] },

{ id:"a1_floor_ask", prologue:11, once:true,
  title:"The floor",
  speaker:"ashgrove",
  body:`Selim Ashgrove, the Minister for Consumables and Agriculture, has asked which level the floor goes into the estimates at. You set it in the Chamber, where the clauses of the estimates are listed with their costs, and what you tell him now decides what he expects to find there.

A promise to lift the floor commits the government to a level it can pay for only by taking money from another clause. A minister who has been promised something keeps the promise on his list until it is kept or broken.`,
  choices:[
    { posture:"measured",
      label:`Promise Selim Ashgrove that the floor will be lifted to CW$30bn before the House votes.`,
      act:"Promise it",
      note:`You tell Ashgrove the floor goes into the estimates lifted, and you keep the promise by setting it to lifted in the Chamber within five sittings. The estimates must still fit the reserve, the Treasury's cash in hand, so another clause has to give. A lifted floor improves how the government is seen when the Act passes, and Ashgrove's department can carry the stations that cannot feed themselves. If you do not set it in time, he will say so.`,
      effects:[{ undertake:{ id:"a1_floor_lift", text:"Lift the consumables floor to CW$30bn",
                 owed_to:"ashgrove", by:5,
                 discharge:{ clause:{ bill:"appropriation", clause:"floor", level:"lift" } },
                 onBreach:"a1_floor_unkept" } },
               { move:{ "rel.ashgrove":5 } }, { move:{ "loyalty.cu_maintenance":3 } }],
      result:`Ashgrove tells his department that the floor will be lifted. The promise stands on the government's list until the level is set.` },
    { posture:"cautious",
      label:`Tell Selim Ashgrove that the floor stays at CW$16bn, as the Treasury drafted it.`,
      act:"Hold it",
      note:`The floor stays as drafted and costs the estimates nothing new. Ashgrove, whose department the floor feeds, takes it as a refusal, and the stations that cannot feed themselves are no better supplied than before. You can still change the level in the Chamber until the House votes.`,
      effects:[{ clause:{ bill:"appropriation", clause:"floor", level:"hold" } }, { move:{ "rel.ashgrove":-3 } }],
      result:`Ashgrove notes that the floor is unchanged and says he will raise it again.` },
    { posture:"bold",
      label:`Trim the floor to CW$0 and tell Selim Ashgrove the money is needed elsewhere in the estimates.`,
      act:"Trim it",
      note:`The floor is set to trimmed, which saves CW$16bn for the other clauses. When the Act passes, the stations that cannot feed themselves show it in their closure within the month, and the voters see it. Ashgrove and the Trades Left, your party's union wing, will hear a government that counted the floor as spare. You can reverse it in the Chamber, and they will not forget that you set it.`,
      effects:[{ clause:{ bill:"appropriation", clause:"floor", level:"cut" } },
               { move:{ "rel.ashgrove":-8 } }, { move:{ "loyalty.cu_maintenance":-5 } }],
      result:`Ashgrove asks the Treasury in writing which clause the CW$16bn is for.` }
  ]},

{ id:"a1_floor_unkept", queuedOnly:true, once:true,
  setpiece:{ title:"Ashgrove tells the stations the consumables floor will not be lifted" },
  title:"The floor stays",
  speaker:"ashgrove",
  body:`Selim Ashgrove, the Minister for Consumables and Agriculture, has told the stations that the consumables floor will not be lifted this session. The government had promised him the lift and has not set it.

The floor is the air, water, food and living space guaranteed to every resident, and the stations that cannot grow or recycle enough of their own will carry the shortfall. The Trades Left, the union wing of the Prime Minister's party, has recorded the promise as broken.

"I told my department the floor would be lifted," Ashgrove said. "They have stopped planning for it."`,
  effects:[{ move:{ "rel.ashgrove":-8 } }, { move:{ "loyalty.cu_maintenance":-5 } }, { move:{ public_standing:-2 } },
           { flag:"promise_broken" },
           { wire:"CONSUMABLES FLOOR LIFT PROMISED, NOT SET; ASHGROVE STANDS DOWN HIS DEPARTMENT" }],
  choices:[] },

/* SITTING 8. COVER: SUBSTRATE INSURANCE, THE NEW PROGRESSIVES' PRICE (the Claude Doc, "Cover for
   those who cannot pay"; the ledger: substrate insurance, the means test, the registers of the
   insured and the suspended). Same pattern as sitting 7. The party's own bill is not in Act I,
   so what it asks of this government in Act I is the cover. Only two answers are offered: the
   party is the government's majority (147 less its 36 is 111, and 141 is a majority), so an
   answer that reduces the cover to nothing is left to the Chamber's panel. PROVISIONAL numbers. */
{ id:"a1_cover", prologue:12, once:true,
  setpiece:{ title:"The New Progressives ask to widen substrate insurance to CW$32bn" },
  title:"Cover for those who cannot pay",
  speaker:"trottier",
  body:`Mandelina Trottier, the Deputy Prime Minister and leader of the New Progressive Party, wants substrate insurance widened from CW$18bn in the draft estimates to CW$32bn. The insurance covers residents who cannot pay for the hardware that runs their minds.

Substrate owners charge rent for every hour a mind runs. A resident who fails the means test, the income check that decides who qualifies, and cannot pay the rent is suspended: the mind is kept intact and is not running. The Ministry for Persons, Health and Continuity, led by Florence Marin of the Congregational Democratic Alliance, keeps the registers of the insured and of the suspended, and both change with this clause.

The draft holds the clause at CW$18bn and keeps the means test. Widening it to CW$32bn sets the test aside, so that anyone who cannot pay is covered. The providers that own the hardware are expected to raise their rents once the cover is in place. Reducing the clause to nothing would save CW$18bn and suspend every resident who fails the test.

"I want the means test gone this session," Trottier said. "That is CW$14bn more than the draft. If the Treasury has a different figure, I will look at it."

Her party joined the government for a bill of its own, which is not before the House this period. It has asked for this clause while it waits.

The government sets the level before the estimates go to the House: reduced at CW$0, held at CW$18bn or widened at CW$32bn.`,
  effects:[{ flag:"clause_cover_met" }],
  choices:[] },

{ id:"a1_cover_ask", prologue:13, once:true,
  title:"The price of the cover",
  speaker:"trottier",
  body:`Mandelina Trottier, the Deputy Prime Minister and leader of the New Progressive Party, has asked which level substrate insurance goes into the estimates at. The government has no majority without her party's votes, and she has said what her party wants for them.

You set the level in the Chamber. What you tell her now decides what she expects to find there, and a promise left unkept is counted against the government by the party that was given it.`,
  choices:[
    { posture:"measured",
      label:`Promise Mandelina Trottier that substrate insurance will be widened to CW$32bn before the House votes.`,
      act:"Promise it",
      note:`You tell Trottier the means test goes, and you keep the promise by setting the cover to widened in the Chamber within five sittings. The estimates must still fit the reserve, the Treasury's cash in hand, so another clause has to give. Her party is pleased now and again when the Act passes, and the providers will raise their rents. If you do not set it in time, her party will record the promise as broken.`,
      effects:[{ undertake:{ id:"a1_cover_widen", text:"Widen substrate insurance to CW$32bn",
                 owed_to:"trottier", by:5,
                 discharge:{ clause:{ bill:"appropriation", clause:"insurance", level:"wide" } },
                 onBreach:"a1_cover_unkept" } },
               { move:{ "rel.trottier":5 } }, { move:{ "loyalty.psa":6 } }],
      result:`Trottier tells her members that the means test goes. The promise stands on the government's list until the level is set.` },
    { posture:"cautious",
      label:`Tell Mandelina Trottier that the cover stays at CW$18bn and the means test stands.`,
      act:"Hold it",
      note:`The cover stays as drafted and costs the estimates nothing new. Residents who fail the means test and cannot pay stay suspended, and Trottier's party, which speaks for them, will count it as a refusal. You can still change the level in the Chamber until the House votes.`,
      effects:[{ clause:{ bill:"appropriation", clause:"insurance", level:"hold" } },
               { move:{ "rel.trottier":-4 } }, { move:{ "loyalty.psa":-4 } }],
      result:`Trottier says her party will raise the cover again before the House votes.` }
  ]},

{ id:"a1_cover_unkept", queuedOnly:true, once:true,
  setpiece:{ title:"The New Progressives record the cover promise as broken" },
  title:"The cover stays",
  speaker:"trottier",
  body:`The New Progressive Party has recorded as broken the government's promise to widen substrate insurance, which covers residents who cannot pay for the hardware that runs their minds.

Mandelina Trottier, its leader and the Deputy Prime Minister, was told the means test would go, and the estimates have not been changed to say so. Residents who fail the means test and cannot pay stay suspended, which means their minds are kept intact and are not running. The party's members have told the whips that they will remember it when the House divides.

"We were told the test would go," Trottier said. "Someone should tell the people on the register."`,
  effects:[{ move:{ "rel.trottier":-8 } }, { move:{ "loyalty.psa":-10 } }, { move:{ public_standing:-2 } },
           { flag:"promise_broken" },
           { wire:"MEANS TEST PROMISE NOT KEPT; NEW PROGRESSIVES COUNT IT AGAINST THE GOVERNMENT" }],
  choices:[] },

/* SITTING 9. INFRASTRUCTURE: CAPITAL WORKS (the Claude Doc, "Infrastructure"; the ledger: capital
   works, a station's pull to leave). The one clause that outlasts the session, and the first place
   the Act plants the Commonwealth's long argument: a station that can feed itself can leave. The
   three answers are the clause's three levels, two of them promises. PROVISIONAL numbers. */
{ id:"a1_works", prologue:14, once:true,
  setpiece:{ title:"Capital works are unfunded, and would cost CW$20bn to CW$30bn" },
  title:"Infrastructure",
  speaker:"tomasson",
  body:`Haukur Tómasson, the Minister for Closure and Development, says the draft estimates fund no capital works. Works are the one clause whose effects last beyond the session, and the Treasury has priced them at two levels.

Works raise a station's closure, the share of its air, water, food and materials it can grow or recycle without imports. Most stations are below the level at which leaving the Commonwealth is survivable. A station with higher closure can leave at less cost to itself.

Funded in the ring band, where the pressure on habitable volume is worst, the works cost CW$20bn and lower the price of volume. Funded at the outer stations, where closure is lowest, they cost CW$30bn, and those stations become better able to leave.

"Everything else in the estimates is spent by the end of the session," Tómasson said. "Works are still there in ten years, and I cannot tell you which way that cuts for the outer stations."

The government sets the level before the estimates go to the House: deferred at CW$0, the ring band at CW$20bn or the outer stations at CW$30bn.`,
  effects:[{ flag:"clause_works_met" }],
  choices:[] },

{ id:"a1_works_ask", prologue:15, once:true,
  title:"What lasts",
  speaker:"tomasson",
  body:`Haukur Tómasson, the Minister for Closure and Development, has asked where the works go, if they go anywhere. The stations that would be funded will plan around what he tells them.

You set the level in the Chamber. The ring band's works lower the price of volume, the space each resident pays for. The outer stations' works raise those stations' closure, and with it their ability to leave the Commonwealth.`,
  choices:[
    { posture:"measured",
      label:`Promise Haukur Tómasson works in the ring band, at CW$20bn, before the House votes.`,
      act:"Promise it",
      note:`You tell Tómasson the ring band is funded, and you keep the promise by setting the works to the ring band in the Chamber within five sittings. The estimates must still fit the reserve, the Treasury's cash in hand, so another clause has to give. When the Act passes the price of volume falls and the voters in the ring see it, and the outer stations wait. If you do not set it in time, Tómasson will tell the ring so.`,
      effects:[{ undertake:{ id:"a1_works_ring", text:"Fund capital works in the ring band at CW$20bn",
                 owed_to:"tomasson", by:5,
                 discharge:{ clause:{ bill:"appropriation", clause:"works", level:"some" } },
                 onBreach:"a1_works_unkept" } },
               { move:{ "rel.tomasson":5 } }, { move:{ "loyalty.rv":3 } }],
      result:`Tómasson tells the ring band's stations that their works are funded. The promise stands on the government's list until the level is set.` },
    { posture:"bold",
      label:`Promise Haukur Tómasson works at the outer stations, at CW$30bn, before the House votes.`,
      act:"Promise it",
      note:`You tell Tómasson the outer stations are funded, and you keep the promise by setting the works to the outer stations in the Chamber within five sittings. The estimates must still fit the reserve, so another clause has to give. Their closure rises, and with it their ability to leave the Commonwealth, which Home Rule, the party that speaks for the outer stations, will welcome and the parties that want the Commonwealth held together will not. If you do not set it in time, he will say so.`,
      effects:[{ undertake:{ id:"a1_works_outer", text:"Fund capital works at the outer stations at CW$30bn",
                 owed_to:"tomasson", by:5,
                 discharge:{ clause:{ bill:"appropriation", clause:"works", level:"outer" } },
                 onBreach:"a1_works_unkept" } },
               { move:{ "rel.tomasson":7 } }, { move:{ "loyalty.rv":4 } }, { move:{ "loyalty.sc":4 } }],
      result:`Tómasson tells the outer stations that their works are funded. Home Rule's members ask the Treasury when the money is paid.` },
    { posture:"cautious",
      label:`Tell Haukur Tómasson that the works are deferred this session.`,
      act:"Defer them",
      note:`No works are funded this session and closure rises nowhere. The estimates keep CW$20bn to CW$30bn for other clauses, and Tómasson, whose department the works are for, will take it as a refusal. You can still change the level in the Chamber until the House votes.`,
      effects:[{ clause:{ bill:"appropriation", clause:"works", level:"none" } },
               { move:{ "rel.tomasson":-4 } }, { move:{ "loyalty.rv":-3 } }],
      result:`Tómasson says the works will be proposed again next session.` }
  ]},

{ id:"a1_works_unkept", queuedOnly:true, once:true,
  setpiece:{ title:"Tómasson tells the stations their works will not be funded" },
  title:"The works wait",
  speaker:"tomasson",
  body:`Haukur Tómasson, the Minister for Closure and Development, has told the stations that the capital works the government promised them will not be funded this session. The estimates have not been changed to pay for them.

The stations had planned around the promise. Closure, the share of its air, water, food and materials a station can grow or recycle without imports, stays where it was, and so does the price of volume.

"I told the stations to plan for the works," Tómasson said. "They have planned, and now they have to plan again."`,
  effects:[{ move:{ "rel.tomasson":-8 } }, { move:{ "loyalty.rv":-5 } }, { move:{ public_standing:-2 } },
           { flag:"promise_broken" },
           { wire:"WORKS PROMISED, NOT FUNDED; TÓMASSON TELLS STATIONS TO REPLAN" }],
  choices:[] },

/* SITTING 10. TRANSPORT: THE FARE SUBSIDY (the Claude Doc, "Transport"; the ledger: the transit
   subsidy, launch windows). The last of the four clause scenes. The level labels in the bill are
   the ones the page uses. PROVISIONAL numbers. */
{ id:"a1_transit", prologue:16, once:true,
  setpiece:{ title:"Transit subsidy would cost CW$10bn for tether stations, CW$22bn for all" },
  title:"Transport",
  speaker:"vasmer",
  body:`Henrik Vasmer, the Minister for Transit and Orbital Mechanics, has told the Prime Minister what the transit subsidy pays for: the fares that stations pay for passage and freight on launch windows.

A launch window is a scheduled departure to a station's orbit. The farther a station is from a tether, one of the elevators between Earth and orbit, the dearer its fare. With no subsidy the fare is set by the carriers, and the outer stations pay the carriers' published schedule. The subsidy carries part of the difference between a near station's fare and a far one's. The draft estimates leave it unfunded.

Funded for the stations a tether serves, where the tether is the only way in, it costs CW$10bn. Funded for every station it costs CW$22bn, and the reserve, the Treasury's cash in hand, pays for stations the traffic never reaches.

"Home Rule, the party of the outer stations, will ask who this is for," Vasmer said. "The tether stations get CW$10bn of help, and the outer stations still pay the full schedule."

The government sets the level before the estimates go to the House: unsubsidised at CW$0, the tether stations at CW$10bn or every station at CW$22bn.`,
  effects:[{ flag:"clause_transit_met" }],
  choices:[] },

{ id:"a1_transit_ask", prologue:17, once:true,
  title:"Who pays the fare",
  speaker:"vasmer",
  body:`Henrik Vasmer, the Minister for Transit and Orbital Mechanics, has asked which stations the subsidy is for, if it is for any. The carriers set their schedules by what he tells them.

You set the level in the Chamber. A subsidy for the tether stations, the stations an elevator serves, is the cheaper and reaches fewer people. A subsidy for every station reaches the outer stations too, and costs the reserve, the Treasury's cash in hand, more than twice as much.`,
  choices:[
    { posture:"measured",
      label:`Promise Henrik Vasmer a fare subsidy for the tether stations, at CW$10bn, before the House votes.`,
      act:"Promise it",
      note:`You tell Vasmer the tether stations are subsidised, and you keep the promise by setting the subsidy to the tether stations in the Chamber within four sittings. The estimates must still fit the reserve, the Treasury's cash in hand, so another clause has to give. Fares fall for the stations a tether serves and the voters there see it, and Home Rule, the party of the outer stations, will point out that they pay the full schedule. If you do not set it in time, Vasmer will say so.`,
      effects:[{ undertake:{ id:"a1_transit_tether", text:"Subsidise fares for the tether stations at CW$10bn",
                 owed_to:"vasmer", by:4,
                 discharge:{ clause:{ bill:"appropriation", clause:"transit", level:"anchors" } },
                 onBreach:"a1_transit_unkept" } },
               { move:{ "rel.vasmer":5 } }, { move:{ "loyalty.psa":2 } }],
      result:`Vasmer tells the carriers that the tether stations' fares will be subsidised. The promise stands on the government's list until the level is set.` },
    { posture:"bold",
      label:`Promise Henrik Vasmer a fare subsidy for every station, at CW$22bn, before the House votes.`,
      act:"Promise it",
      note:`You tell Vasmer every station is subsidised, and you keep the promise by setting the subsidy to every station in the Chamber within four sittings. It costs CW$12bn more than the tether stations' subsidy, so the clauses that pay for it must come down further. The outer stations' fares fall too, which Home Rule welcomes, and the reserve pays for stations the traffic never reaches. If you do not set it in time, Vasmer will say so.`,
      effects:[{ undertake:{ id:"a1_transit_all", text:"Subsidise fares for every station at CW$22bn",
                 owed_to:"vasmer", by:4,
                 discharge:{ clause:{ bill:"appropriation", clause:"transit", level:"all" } },
                 onBreach:"a1_transit_unkept" } },
               { move:{ "rel.vasmer":7 } }, { move:{ "loyalty.psa":3 } }, { move:{ "loyalty.sc":4 } }],
      result:`Vasmer tells the carriers that every station's fares will be subsidised. Home Rule's members ask the Treasury when the money is paid.` },
    { posture:"cautious",
      label:`Tell Henrik Vasmer that fares are left to the carriers this session.`,
      act:"Leave it",
      note:`No subsidy is funded and the carriers' schedule stands. The estimates keep CW$10bn to CW$22bn for other clauses, and the outer stations pay the full schedule. Vasmer, whose department the subsidy is for, will take it as a refusal. You can still change the level in the Chamber until the House votes.`,
      effects:[{ clause:{ bill:"appropriation", clause:"transit", level:"none" } },
               { move:{ "rel.vasmer":-4 } }, { move:{ "loyalty.psa":-2 } }],
      result:`Vasmer tells the carriers that their schedule stands.` }
  ]},

{ id:"a1_transit_unkept", queuedOnly:true, once:true,
  setpiece:{ title:"Vasmer tells the carriers the fare subsidy will not be paid" },
  title:"The fares stand",
  speaker:"vasmer",
  body:`Henrik Vasmer, the Minister for Transit and Orbital Mechanics, has told the carriers that the fare subsidy the government promised will not be paid this session. The estimates have not been changed to pay for it.

The carriers had lowered their schedules in the expectation of the subsidy, and have said they will raise them again at the next launch window. The outer stations, which pay the farthest fares, will see the rise first.

"I told the carriers to plan for it," Vasmer said. "I will have to tell them they were wrong to."`,
  effects:[{ move:{ "rel.vasmer":-8 } }, { move:{ "loyalty.psa":-4 } }, { move:{ public_standing:-2 } },
           { flag:"promise_broken" },
           { wire:"FARE SUBSIDY PROMISED, NOT PAID; CARRIERS TO RAISE SCHEDULES" }],
  choices:[] },

/* SITTING 11. THE COUNT (the Claude Doc, "The count"; the ledger: the whips, the count, the functional
   members, the dual majority; opens the whip). The estimates are called to a division before the House
   rises, and the Chamber shows the count. The scene teaches the rule of the objection (the functional
   members cannot defeat a money bill and delay it three sittings) and offers three ways to spend the
   one resource the whip costs: nothing, your own party's goodwill, or a partner's credit. The two
   answers that press members commit them through the Chamber's own door (the `whip` effect, brief
   E13), so the act the scene argues for is done in it; the plan is paid at the division and the player
   can change it in the Chamber until then. Skipped if the estimates have been carried. A government that
   earned credit with the New Progressive Party by giving its treaty a slot (sitting 5) can spend it here.
   The doc's third answer promised the Divergence bill time; that bill is not in Act I. PROVISIONAL. */
{ id:"a1_count", prologue:18, once:true,
  when:{ anyOf:[ { billStage:{ appropriation:"first_reading" } }, { billStage:{ appropriation:"second_reading" } },
                 { billStage:{ appropriation:"committee" } }, { billStage:{ appropriation:"report" } },
                 { billStage:{ appropriation:"third_reading" } } ] },
  title:"The count",
  speaker:"okarie",
  body:`Anil Devi, the Chief Whip, has counted the House for the estimates. A division is the vote that decides a measure. The 240 elected members decide the estimates, and the estimates need a majority of them. The 40 functional members, who sit for professions and industries, vote too and their votes are recorded. They cannot defeat a money bill, but if most of them vote against it, they delay it by three sittings.

The count is in the Chamber, under the estimates. It lists, party by party, the members who will vote for, the members who will vote against, and the members the whips can still move. Moving a member costs something: your own party's goodwill, or credit that a partner owes you for time you gave its bills.

"Whipping spends something every time," Devi says. "If the count is not close, the cheapest whip is none."`,
  choices:[
    { posture:"cautious",
      label:`Tell Devi to hold the members already with the government, and to ask nothing more of anyone.`,
      act:"Hold them",
      note:`The whips keep the members who have said they will vote for the estimates and ask nothing of the rest. It costs no goodwill and no credit, and the vote is as the Chamber's count shows it. If members move away before the division, because a promise is broken or a clause is cut, nobody has been asked to bring them back.`,
      effects:[{ move:{ "rel.okarie":3 } }],
      result:`Devi keeps his list and says he will count again before the division.` },
    { posture:"bold",
      label:`Tell Devi to press your own party's members to vote with the government.`,
      act:"Press them",
      note:`The whips tell your party's members how to vote on the estimates, and make them. It costs your party's goodwill, and members who are pressed remember it. The count moves by every member the whips can still reach, and the voters see a government in command of its benches. You can change the plan in the Chamber until the division.`,
      effects:[{ whip:{ bill:"appropriation", party:"cu" } }, { move:{ "rel.okarie":2 } }],
      result:`The whips work the tea room until the division bells.` },
    { posture:"measured",
      label:`Ask Mandelina Trottier to deliver the New Progressive Party's members for the estimates.`,
      act:"Ask her",
      note:`Trottier's members vote as she asks. The party counts it as a favour and the cost is taken from the credit it owes you, which a slot given to its minister's treaty earns. If you ask for more than it owes you, the party loses goodwill with the government for every point you overdraw. You can change the plan in the Chamber until the division.`,
      effects:[{ whip:{ bill:"appropriation", party:"psa" } }, { move:{ "rel.trottier":2 } }],
      result:`Trottier tells her whips to bring the party in. Devi writes it in the ledger.` }
  ]},

/* THE ESTIMATES ARE CARRIED. A page, when the Act is assented; it takes no decision. It carries the Act's
   climax to the player in words, because the division itself is an animation (brief E8 will let a scene
   call it). The page says what the carried Act does and not how the vote went: the vote is on the screen
   the player has just watched. */
{ id:"a1_carried", weight:95, once:true,
  when:{ billStage:{ appropriation:"assented" } },
  setpiece:{ title:"The House carries the estimates, and the Treasury may spend what it voted" },
  title:"The estimates are carried",
  speaker:null,
  body:`The Appropriation Bill has received the President's assent, which makes the estimates law. The Treasury may now spend what the House voted, level by level, and the government can pay its officials.

Each clause takes effect at the level the House carried. A clause that costs money is drawn from the reserve, the Treasury's cash in hand, and a clause that raises a tax changes what that tax raises over the year. Where the functional members delayed the bill, the clauses take effect when the delay ends.`,
  choices:[] },

/* SITTING 14. QUESTION TIME (the Claude Doc, "Questions"; the ledger: the Opposition, Question Time,
   shadow ministers). The Leader of the Opposition asks one question, and which one depends on what the
   player has done: Ember Ridge if its lowest band was switched off, a broken promise if any was, and
   otherwise the reserve. The three are exclusive, so one fires, and only at sitting 14. Staying for the
   afternoon costs a slot, as the sitting-5 slot was held for. Every answer is a posture with a cost
   somewhere else. PROVISIONAL numbers. */
{ id:"a1_qt_ember", prologue:19, once:true,
  when:{ minSitting:14, maxSitting:14, flags:["ember_ridge_shed"] },
  title:"Questions: Ember Ridge",
  speaker:"watkins",
  body:`At Question Time, Darren Watkins Jr., the Leader of the Opposition and of the Liberal Party, has the first question. It concerns Ember Ridge.

"Was the Prime Minister told before 4,200 people on Ember Ridge were switched off?" he asks. "And if she was, what did she do?"

The engineering authority switched off the station's lowest band while the array was still down and the government had made no order to ease the shortage. The Opposition's shadow ministers, who each shadow a minister of the government, sit behind him, and the House is full.`,
  choices:[
    { posture:"measured",
      label:`Answer in full: stay for the afternoon, and say what the government did and what it chose not to do.`,
      act:"Answer him",
      cost:{ slot:1 },
      note:`It costs the afternoon, and the House sits late. You say what you were told, when, and what you left undone, and nobody can say the government hid it. Voters think better of a Prime Minister who answers for it, and your own members hear you take the blame they would otherwise share.`,
      effects:[{ move:{ public_standing:3 } }, { move:{ party_loyalty:2 } }],
      result:`You answer the question and the ones that follow. The House sits late, and The Spindle, the Commonwealth's newspaper of record, prints the answer in full.` },
    { posture:"cautious",
      label:`Tell the House that the engineering authority acted within the law, and that the law is for Parliament to change.`,
      act:"Defend it",
      note:`It costs nothing today. The authority did act within the Allocation Act, and the Association of Engineers and Systems, the engineers' party, approves of a government that says so. The New Progressive Party, which speaks for digital residents, and voters will hear a government that points at the law when it had a choice.`,
      effects:[{ move:{ public_standing:-3 } }, { move:{ "loyalty.hul":4 } }, { move:{ "loyalty.psa":-4 } }],
      result:`Watkins sits down. The Spindle's report runs under the headline of the 4,200.` },
    { posture:"bold",
      label:`Tell the House the government will review the engineering authority's power to switch people off.`,
      act:"Announce it",
      note:`The review answers the question the Opposition asked, and the New Progressive Party welcomes it. It will not report before the House rises. The Association of Engineers and Systems will call it an attack on the authority, and The Spindle will point out that the review follows the shutdown and not the warning.`,
      effects:[{ move:{ public_standing:1 } }, { move:{ "loyalty.psa":5 } }, { move:{ "loyalty.hul":-8 } }],
      result:`The review is announced, and the engineers' party asks for its terms of reference by the end of the day.` }
  ]},

{ id:"a1_qt_promise", prologue:20, once:true,
  when:{ minSitting:14, maxSitting:14, flags:["promise_broken"], flagsAbsent:["ember_ridge_shed"] },
  title:"Questions: a promise",
  speaker:"watkins",
  body:`At Question Time, Darren Watkins Jr., the Leader of the Opposition and of the Liberal Party, has the first question. It concerns a promise.

"The Prime Minister told one of her ministers that something would be done, and it was not," he says. "Will she tell the House which promise it was, and why?"

The government's undertakings, the promises it has made and has not yet kept, are on a list that any member can read. Watkins has read it.`,
  choices:[
    { posture:"measured",
      label:`Answer in full: stay for the afternoon, name the promise, and say why it was not kept.`,
      act:"Answer him",
      cost:{ slot:1 },
      note:`It costs the afternoon, and the House sits late. You name the promise and the minister it was made to, and say why it was not kept. Nobody can say the government hid it, and the voters and your own members think better of a Prime Minister who gives the reason.`,
      effects:[{ move:{ public_standing:3 } }, { move:{ party_loyalty:2 } }],
      result:`You name the promise and the reason, and the House sits late.` },
    { posture:"cautious",
      label:`Tell the House that the government's undertakings are public, and that members may read them.`,
      act:"Refer him",
      note:`It costs nothing today. The list is public, and the answer is true, but it does not say which promise he asked about or why. The Spindle, the Commonwealth's newspaper of record, counts the questions the government passes to a list, and the minister who was promised something will hear that you did not name it.`,
      effects:[{ move:{ public_standing:-3 } }, { move:{ party_loyalty:-2 } }],
      result:`Watkins reads the promise out himself and sits down.` },
    { posture:"bold",
      label:`Ask Watkins which clause of the estimates he would cut to keep every promise, and by how much.`,
      act:"Ask him",
      note:`Your own members will welcome a Prime Minister who puts the question back, and the party's loyalty to its leadership rises. The estimates cannot pay for everything the ministers asked, and Watkins will say that you did not answer. Voters think a little less of the government for it, and he will remember being questioned in return.`,
      effects:[{ move:{ party_loyalty:5 } }, { move:{ public_standing:-2 } }, { move:{ "rel.watkins":-6 } }],
      result:`Your own side enjoys it enormously. Nobody outside the chamber can say afterwards which promise it was.` }
  ]},

{ id:"a1_qt_reserve", prologue:21, once:true,
  when:{ minSitting:14, maxSitting:14, flagsAbsent:["ember_ridge_shed", "promise_broken"] },
  title:"Questions: the reserve",
  speaker:"watkins",
  body:`At Question Time, Darren Watkins Jr., the Leader of the Opposition and of the Liberal Party, has the first question. It concerns the estimates.

"Can the Prime Minister tell the House what the Treasury's cash reserve stands at today?" he asks.

The reserve is the Treasury's cash in hand, and the estimates are paid from it. Your own members want the figure for the same reason the Opposition does: it shows how much room the government has left to spend.`,
  choices:[
    { posture:"measured",
      label:`Answer in full: stay for the afternoon, and give the reserve's figure.`,
      act:"Answer him",
      cost:{ slot:1 },
      note:`It costs the afternoon, and the House sits late. Nobody can say the government hid the figure, so voters and your own members think better of it, and you have a slot less for anything else this period.`,
      effects:[{ move:{ public_standing:4 } }, { move:{ party_loyalty:3 } }],
      result:`You give the figure and the House sits late. The Spindle, the Commonwealth's newspaper of record, prints it.` },
    { posture:"cautious",
      label:`Refer Watkins to the Treasury, and move on to the next question.`,
      act:"Refer him",
      note:`It costs nothing today. The press gallery and The Spindle, the Commonwealth's newspaper of record, count every question you pass to someone else, and voters in the low band notice most.`,
      effects:[{ move:{ public_standing:-4 } }, { move:{ party_loyalty:-2 } }, { move:{ "standing.low":-3 } }],
      result:`It costs nothing today, and the gallery notes that the figure was not given.` },
    { posture:"bold",
      label:`Ask Watkins which clause of the estimates he would cut, and by how much.`,
      act:"Ask him",
      note:`Your own members will welcome a Prime Minister who puts the question back, and the party's loyalty to its leadership rises. The figure stays unsaid, voters think a little less of the government for it, and Watkins will remember being questioned in return.`,
      effects:[{ move:{ party_loyalty:5 } }, { move:{ public_standing:-2 } }, { move:{ "rel.watkins":-6 } }],
      result:`Your own side enjoys it enormously. Nobody outside the chamber can say afterwards what the reserve stands at.` }
  ]},

/* SITTING 15. THE UNDERWRITERS' READ (the Claude Doc, "The Underwriters' first reading"; the ledger: the
   Underwriters, Earth's banks, the Economy tab's account; opens the Economy tab's Money calls). A page,
   not a decision, once the estimates are carried. It teaches how the Underwriters read the account and
   leaves the figures to the Economy tab, which prints them live: a page that typed them would be a second
   copy of numbers that move (brief E5, placeholders, is not built). The tutorial card (brief E3) points at
   the tab; a news page may not name it. Dated to sitting 15 and fires on it or the first sitting after,
   if the Act is assented. */
{ id:"a1_underwriters", at:15, once:true,
  when:{ billStage:{ appropriation:"assented" } },
  setpiece:{ title:"The Underwriters publish their reading of the carried estimates" },
  title:"The Underwriters' reading",
  speaker:null,
  body:`The Underwriters, the insurers and syndicates that lend to the Treasury, have published their reading of the estimates the House carried. They read the Treasury's account: what it receives, what it spends, the deficit between the two, and the reserve, its cash in hand.

The account is public, and the Underwriters set the rate at which they lend by it. A larger deficit or a smaller reserve raises the rate. So does a thermal margin, the stations' spare radiator capacity, below the level they need, because a government that cannot keep the stations cool is a riskier borrower.

The prices of the four goods the Commonwealth buys and sells most, thermal quota, substrate, the hardware that digital residents run on, volume and transit, are part of the same reading. A price that has moved from where it opened changes what the Treasury receives from the tax levied on it.

The Underwriters lend in the Commonwealth's own money. Earth's banks lend in dollars, at a rate set in Earth, and ask for more when the Commonwealth is at odds with Earth's governments.`,
  choices:[] }

] });
