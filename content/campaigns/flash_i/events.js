/* =============================================================
   FLASH I — EVENTS. The platform crisis, its foreign layer, the panic
   buttons' answers and the canon election.

   Every entry in this file belongs to Flash I: `campaign()` (in
   content/setup.js) tags each one `campaign:"flash_i"` and adds it to the
   world's EVENTS. Written as the world's events are, and read by the same
   engine; campaign.js beside this file says what the folder is.

   APPEND, DO NOT INSERT. The pool's seeded lean is keyed on an event's
   position in the list the campaign plays, which is the world's events
   followed by these. An event inserted mid-list re-leans every event after
   it and changes every run; a new one goes at the end.
   ============================================================= */
campaign("flash_i", { events: [

/* ============================================================
   FLASH I — THE PLATFORM CRISIS (the author's campaign, wired so it can
   be played; every sentence here is a placeholder for the author's
   prose, and the mechanics are the plan's: micro-decisions drift the
   four meters, the tiers in settlements.js beside this file read them,
   panic buttons are expensive, and the meltdown is a loss through the
   loyalty floor. design/35 is the author's plan; scaffold.example.js
   beside this file is the annotated scaffold that came before it.)
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
   govern around them, which is the whole point of order-paper time.

   DATED FOR THREE SESSIONS (22 Sep 2026). The chain opened at 8 with gaps
   of two, which put the dilemma at 15 and the Annexation Bill on the order
   paper one sitting before the first rise, where every bill not carried
   falls; any beat added to chapter one would have pushed it past. It opens
   late in the first session now, the survey and the opinion take the four
   and three sittings this comment always said they did, and the dilemma
   lands early in the second session with most of it left to carry the
   Act. The stranded have two months of air: stranded in early May, the Act
   is carried in June. */
{ id:"f1_stranded", chapter:2, at:14, once:true,
  setpiece:{ title:"Mining company abandons orbital refinery, leaving 184,000 people with two months of air", mood:"threat",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"They filed a return in the spring and nothing since. The return said the air plant was due for its overhaul in June.",
        who:"Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper of record" },
      { said:"An industrial platform has failed, and its operator has wound it up according to law. It is regrettable that orbital politicians have chosen to make a tragedy into a cause.",
        who:"Earth-side wire copy, carried in Nairobi and Brussels" },
      { said:"Kenya will bring home every person on that platform who wishes to come home. Kenya will not pay for a private company's wind-up.",
        who:"Kenya's foreign ministry" },
      { said:"My children were born on the Works. Where is it they are being sent home to?",
        who:"A foundry shift supervisor, on Ring Network, the Commonwealth's broadcaster" } ] },
    { kind:"document", head:"The notice of wind-up",
      body:"The Company's operating subsidiary for the Bellamy Almanac Works is wound up with effect from midnight. Its obligations under the charter of the Works terminate with it, and the Company accepts no successor liability. Enquiries concerning the platform should be addressed to the authorities of the host state.",
      source:"Filed by Cordell with the registrar of companies, Port-Gentil, Gabon" }
  ] },
  /* THE STATION QUESTION IS BEFORE THE GOVERNMENT from the moment the
     platform is stranded, whichever answer is given: design/32 decided it
     ("set `station_issue` in `f1_stranded`") and it was never built. The
     old sandbox console set the flag, and lint counted the console as its
     setter, so in real play the powers never arrived on the Foreign Affairs
     tab and the Assembly floor never opened (found 27 Sep, design/47). */
  effects:[{ flag:"station_issue" }],
  title:"A hundred and eighty-four thousand",
  speaker:null,
  body:`Cordell, the Gabonese mining company, shut down the operator of the Bellamy
Almanac Works at midnight on Sunday, abandoning an orbital refinery where
184,000 people live and work.

The company had been unable to pay the refinery's bills since March, when
the European Union froze the assets of Gabon's sovereign wealth fund,
Cordell's majority owner. With the operator gone, the platform's 97,000
workers have no employer and no wages, and the contracts that supplied its
air, water and fuel have ended. Engineers aboard say the air will last about
two months.

The Works is outside the Commonwealth, and no treaty obliges the government
to act. On Monday the residents' elected council asked it to, because the
rescue Kenya has approved will take two years.

The Works is supplied by Tether 2, the space elevator whose anchor stands at
Malindi on the Kenyan coast. It is a refinery and foundry. It smelts ore
from Cordell's mining platforms and rolls it into structural metal and hull
plate. Its workforce includes furnace and rolling-mill crews, maintenance
engineers, administrative staff, cooks, teachers, medical staff and
managers. Most of the other residents are their families.

Another 7,100 residents are emulated minds held in suspension in the
platform's data store, preserved but not running. The charter that governed
the Works obliged Cordell to keep them stored. The notice filed on Sunday
ends that obligation.

The European Union imposed its sanctions in March, after a United Nations
panel found that the Gabonese fund had paid for weapons used by separatists
in Cabinda, the oil-producing Angolan exclave where fighting has continued
since last year. Under European rules, a company more than half-owned by a
sanctioned body is frozen with it, which caught Cordell.

The operating company kept its accounts with European banks, where the
platform's bonds were issued. Banks elsewhere refused its business rather
than risk European penalties. It could no longer pay the Kenyan suppliers
who send water and air-plant parts up the elevator, buy fuel, or buy the
Commonwealth dollars its workers are paid in. The last full wages were paid
in March.

On Sunday the fund, which directs Cordell from Port-Gentil, ordered the
company to cut its losses. Cordell's mines in Gabon and its concession on
the Port-Gentil elevator are worth far more to it than a refinery it could
no longer run. Because the operator was a separate company, its debts,
including the platform's bonds, end with it and do not pass to Cordell.

Kenya has approved a fully funded plan to bring the residents down. Kenyan
law requires an open tender for the transport contract, a safety inspection
of the platform and certification of each descent car. The money must also
pass in the budget Kenya's parliament votes on in June. The interior
ministry expects the first residents to come down early next year and the
last in 2082.

The engineers' estimate of the air is simpler. The air plant needs
replacement filters and catalyst from Earth every month, and the April
shipment was never paid for. The stock aboard lasts about two months.

Few residents have asked to go. Many have lived for years in the platform's
partial gravity, in which bones thin and muscles waste. Returning to Earth's
full gravity means months of supervised rehabilitation, and doctors say some
residents born aboard may never manage it.

The charter gave the workforce an elected council of delegates to bargain
with the company, and with the company gone it is the only elected body
aboard. It has called a vote on asking to join the Commonwealth. On Monday
it asked the government to send engineers to inspect the air plant before
the vote.

The Ministry for Life Support says it could have a survey team aboard within
a day and a report back within a week.`,
  choices:[
    { posture:"bold", label:"Send the survey team.",
      effects:[{ flag:"f1_surveyed" }, { wire:"FEDERATION SURVEYS THE ABANDONED PLATFORM" },
               { queue:[{ event:"f1_referendum", after:4,
                          label:"The survey team reports from the Almanac" }] }],
      result:"The survey's first return is the scrubber schedule. The second is the debt." },
    { posture:"cautious", label:"Wait for Earth's process.",
      effects:[{ move:{ "legitimacy":-5 } }, { wire:"PM: THE REPATRIATION PLAN IS EARTH'S TO RUN" }],
      result:"The outer stations read the delay as an answer, and it is not the one they wanted." }
  ]},

{ id:"f1_referendum", chapter:2, queuedOnly:true, once:true,
  setpiece:{ title:"Abandoned refinery votes to ask to join the Commonwealth",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"We have voted to be counted somewhere.",
        who:"A delegate of the Works' workforce, on Ring Network, the Commonwealth's broadcaster" },
      { said:"A vote taken on an insolvent platform, under a foreign government's survey, binds nobody. It does not discharge a single bond.",
        who:"The European Union's mission to the United Nations" },
      { said:"Seventy-nine per cent is more than anyone in this chamber was elected on.",
        who:"Nick Laughon MP, leader of Home Rule, the party of self-government for the stations" } ] }
  ] },
  title:"The vote",
  speaker:"ceyhan",
  body:`The residents of the Bellamy Almanac Works, the orbital refinery abandoned
by its owner, have voted to ask to join the Commonwealth. Of the 88 per cent
of adults who voted, 79 per cent said yes.

The result puts a question to the government that it can no longer put off:
whether the Commonwealth will count the residents' wishes in deciding what
becomes of the platform.

A survey team from the Ministry for Life Support came back with the vote and
a second finding. On its own spares, the platform's air plant can run for 51
more days. After that it runs past every hour it is certified for.

Recognising the vote would not make the Works part of the Commonwealth. It
returns no members to the House, and the Charter, the Commonwealth's
constitution, does not reach it. Recognition would say that the residents
have a say in the platform's future. European banks, which hold the
platform's bonds, would read that as a claim on it.

Declining would leave the platform to Kenya's two-year rescue and to its
creditors. The outer habitats have been sending the Works their spare
air-scrubber cartridges since the wind-up. Their members of the House have
said what they will do if the government declines.

Ivor Ceyhan, political editor of The Spindle, the Commonwealth's newspaper
of record, listed the residents' three reasons. The rescue is two years
away. Few of their bodies are ready for Earth. And their bank accounts were
frozen overnight by governments they never elected.

"The vote is on the Prime Minister's desk," Ceyhan wrote. "Europe is reading
the same wire."`,
  choices:[
    { posture:"bold", label:"Recognise the referendum.",
      effects:[{ flag:"f1_referendum_carried" }, { move:{ "friction":10 } },
               { move:{ "legitimacy":8 } },
               { wire:"FEDERATION RECOGNISES THE PLATFORM REFERENDUM" },
               { queue:[{ event:"f1_dilemma", after:3,
                          label:"Law and the Charter reports on the platform" }] },
               /* the mission in New York, before the dilemma: one way out
                  of it runs through the General Assembly (design/43) */
               { queue:[{ event:"un_the_mission", after:2 }] }],
      result:"The Works is the Commonwealth's question now, and Earth's banks are reading the same wire." },
    { posture:"cautious", label:"Decline to recognise it.",
      effects:[{ move:{ "legitimacy":-8 } }, { move:{ "friction":-3 } }, { flag:"f1_referendum_declined" }],
      result:"The strikes start on the outer habitats before the sitting ends." }
  ]},

{ id:"f1_dilemma", chapter:2, queuedOnly:true, once:true,
  title:"The dilemma",
  speaker:"fenwick",
  body:`Adaeze Fenwick, the Minister for Law and the Charter, sets out the
government's two choices on the Bellamy Almanac Works, the orbital refinery
whose residents have voted to join the Commonwealth.

The first is to annex it: to pass a law making the platform and its 184,000
people part of the Commonwealth. The Commonwealth would gain the refinery
and its foundry, and it would take on the cost of keeping the residents
alive. It would also take on the platform's unpaid bonds, which European
banks hold, and the European Union has said it will treat whoever takes the
platform as answerable for them. The Treasury puts the first cost at six
billion dollars.

The second is to decline. Kenya's two-year rescue would stand, and the
residents would wait for it with two months of air. The outer habitats,
which have supplied the Works since the wind-up, have said their members
will strike if the government declines.

Fenwick is clear that Cordell, the Gabonese mining company that owned the
Works, broke no law. It shut down the subsidiary that employed the
residents, and the subsidiary's debts ended with it. The mining leases that
fed the refinery belong to the platform and would come with it. Whichever
choice the government makes will be the one it is judged on at the election.`,
  choices:[
    { posture:"bold", label:"Move to annex the Works.",
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
      /* FOURTEEN, NOT TWELVE, and the two points are the canon ending's
         margin rather than a balance opinion. The shock plus its trend
         converged on friction 65 exactly, and settlements/f1_pyrrhic gates
         on scalarAbove.friction 65, which the engine reads STRICTLY. So the
         Sovereign Debt Trap needed friction to reach 66 and the chain
         delivered 65 — it landed only because the trend got one more
         sitting than it needed, and adding an eighth prologue beat took
         that sitting away. Measured: at 12 the run reaches 65 and no tier
         ever lands, at 14 it converges on 67 and the settlement lands at
         sitting 22 of 35. An ending that depends on the tutorial's length
         is not balanced, it is coincident. */
      effects:[{ flag:"f1_annexing" }, { move:{ "friction":14 } },
               { move:{ "trend.friction":3 } },
               /* THE UNION ANSWERS AT THE GENERAL ASSEMBLY (design/43), and
                  does not wait for an event to be drawn: it tables its
                  measures for the Assembly's next sitting the day the
                  government moves. `un_eu_tables` is the government's reply. */
               { resolution:{ un_eu_measures:"table" } },
               { queue:[{ event:"un_eu_tables", after:1 }] },
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
                  one more for the division itself. RESERVED for the Act
                  (design/32 §E.5): held in the bill's name, so the bills
                  above it on the order paper cannot spend it, and gone
                  when the House rises. */
               { slots:{ reserve:{ annexation:5 } } },
               { wire:"GOVERNMENT MOVES TO ANNEX THE WORKS" }],
      result:"The Almanac Works (Annexation) Bill is set down for first reading. Acting is popular at home. On Earth, the governments and banks that hold the platform's bonds take note, and their patience shortens with every sitting." },
    { posture:"cautious", label:"Decline, and leave the Works to Kenya's rescue.",
      effects:[{ move:{ "trend.legitimacy":-3 } }, { move:{ "friction":-4 } }, { flag:"f1_held_the_line" },
               { queue:[{ event:"un_joint_offer", after:1 }] }],
      result:"The outer habitats have heard the answer. Their members will raise it at every sitting, and the country trusts the government a little less each time." }
  ]},

/* one drift micro-decision: nothing crashes today; the margin leans */
/* REACH: the annexation choice in f1_dilemma sets f1_annexing. */
{ id:"f1_water", chapter:2, weight:60, maxFires:2,
  when:{ flags:["f1_annexing"] },
  /* THE FIRST BRIEF. `brief` is not on the prose whitelist, so no player
     ever reads it; `npm run prose` emits it as a # note above the passage it
     describes, and the importer strips it. It is the channel for building a
     decision without writing its prose. */
  brief:"A funding decision whose consequence is a month away. The scene "+
    "wants the Minister for Life Support presenting an estimate she cannot "+
    "guarantee, and the reader understanding that neither answer produces "+
    "an event today — the drift is the point.",
  title:"The recycling line",
  speaker:"vellan",
  body:`Suravaram Vidyasagar, the Minister for Life Support, has brought the
estimate for the water-recycling plant on the Bellamy Almanac Works, the
orbital refinery the Commonwealth is taking over. Cordell, the Gabonese
mining company that abandoned it, built it to last only as long as the
company meant to stay, and it is running at the top of its certified rate.

Since the Act was set down, the Works' heat counts against the
Commonwealth's thermal margin, the spare capacity of its radiators, and a
recycling plant at its limit wastes power as heat. Funded in full, at three
billion dollars, the plant holds for the quarter and the margin recovers a
little each sitting. Trimmed, the Treasury keeps two billion, the plant
holds for a month, and then the margin falls by about two points a sitting.

"Neither answer shows today," Vidyasagar says. "One of them shows in a
month."`,
  choices:[
    { posture:"bold", label:`Fund the water-recycling plant's refit in full, for CW$3bn.`,
      note:`The plant holds for the quarter and wastes less power as heat, so the thermal margin recovers about a point a sitting. Voters see a government paying for the platform it took, and their belief in its account of the Works rises.`,
      effects:[{ move:{ "solvency":-3000 } }, { move:{ "trend.thermal_margin":1 } },
               { move:{ "legitimacy":4 } }],
      result:"The plant is refitted. The thermal margin recovers a point at a time, and the country sees a government paying for the platform it took." },
    { posture:"cautious", label:`Trim the refit, and keep CW$2bn in the Treasury.`,
      note:`Nothing changes for a month, and the Treasury keeps the money. From then on the plant runs past its limit, and the thermal margin falls by about two points a sitting until the plant is fixed.`,
      effects:[{ move:{ "solvency":2000 } }, { move:{ "trend.thermal_margin":-2 } }],
      result:`Nothing changes today. From next month the thermal margin falls about two points a sitting, and the next estimate will say so.` }
  ]},

/* a panic button: visible, expensive, and the way back from the cascade */
{ id:"f1_loan", chapter:2, weight:84, maxFires:1,
  when:{ scalarBelow:{ solvency:30000 } },
  title:"The emergency loan",
  speaker:"hatt",
  body:`Edward Hatt, leader of the Alliance of Business and Government, offers to
lend the Commonwealth the money it is short. The Treasury's cash reserve is
below thirty billion dollars and falling.

The loan is eighteen billion dollars, repayable at nineteen billion eight
hundred million before the House rises at the end of the session, a rate of
ten per cent. Its security is the Cordell leases: the rights to the ore,
mined by Cordell's extraction platforms, that feeds the Works, which came to
the Commonwealth with the platform. If the loan is not repaid on time, the
Alliance may take the leases.

The rate, the term and the security are printed on a single page, and Hatt
has signed it already.`,
  choices:[
    /* REPAYABLE (the author, 23 Sep). The promise had no discharge, so it
       always broke, and its breach named an event nobody had written, so the
       debt was never called either (design/34 D1). It is repaid through the
       `repay_facility` initiative, and if it is still owed when the House
       rises the Alliance calls it. The sum owed is on the account as a
       named creditor, principal and printed rate together, and the promise
       is kept when that balance is nothing, however it got there. */
    { posture:"bold", label:`Take Hatt's loan of CW$18bn, repayable at CW$19.8bn before the House rises, secured on the Cordell leases.`,
      note:`The reserve gets the money it is short, and the government must repay it before the session ends or the Alliance takes the leases. Borrowing from a party in the House on these terms looks like a favour bought, and voters' belief in the government's claims falls.`,
      effects:[{ move:{ "solvency":18000 } }, { move:{ "debt.alliance":19800 } },
               { move:{ "legitimacy":-10 } }, { flag:"cordell_leases_pledged" },
               { undertake:{ id:"f1_debt", text:"Repay the emergency facility",
                             owed_to:"hatt", post:"treasury", by:null,
                             discharge:{ repaid:"alliance" },
                             onBreach:"f1_debt_called" } }],
      result:"Eighteen billion dollars reach the reserve. The loan must be repaid, at nineteen billion eight hundred million, before the House rises, and the Cordell leases are its security until then." },
    { posture:"cautious", label:"Refuse the loan.",
      note:`Refusing keeps the government free of the Alliance and its hold on the leases, and voters credit it. The reserve stays short, and the shortfall costs it about CW$1bn a sitting until the government finds money elsewhere.`,
      effects:[{ move:{ "legitimacy":3 } }, { move:{ "trend.solvency":-1000 } }],
      result:"A government with money in hand could have refused it. This one is short, and the shortfall now costs the reserve about a billion dollars a sitting." }
  ]},

/* the meltdown: a LOSS through the loyalty floor, not a settlement */
/* REACH: the collapse after the freeze. It needed friction above 85, which
   nothing short of repeated borrowing reached, with all three floors
   breached at once. It follows the freeze now: a frozen government that
   lets the quarrel run past 78 while the margin, the reserve and its
   standing give way together falls. A loss, not a settlement (design/34 D4). */
{ id:"f1_meltdown", chapter:2, weight:98, once:true,
  setpiece:{ title:"Earth stops the elevators, and the Works' air plant fails",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"The government was told what this would cost every week for a month. This is what it cost.",
        who:"The Spindle, the Commonwealth's newspaper of record, in its leading article" },
      { said:"Orbital authorities have lost control of a crisis of their own making.",
        who:"Earth-side wire copy" } ] }
  ] },
  /* the last floor: it needs the two before it (the tier fall, below
     shed_order_published) and cannot come while the emergency order stands */
  when:{ flags:["f1_frozen", "f1_second_floor"], flagsAbsent:["f1_emergency"],
         scalarAbove:{ friction:78 },
         scalarBelow:{ thermal_margin:20, solvency:20000, legitimacy:30 } },
  title:"The cascade",
  speaker:null,
  body:`Earth's elevator operators stopped loading cargo for the Commonwealth
overnight, and the banks that clear its payments stopped clearing them. By
morning no nitrogen or water was coming up the tethers, the space elevators
that supply the habitats.

The Bellamy Almanac Works, the orbital refinery the Commonwealth took in,
failed first because it had the least. Its air plant had been running past
its certified hours since the wind-up. At ten past four it tripped and did
not restart.

The residents were moved into the sections the standby plant can hold. The
standby plant was never meant to hold them all.

By noon the strain had reached the ring, the band of eight stations where
half the Commonwealth lives. The engineering authority, the body that runs
life support, had already switched off tier four, the lowest band of the
shed order, and holds its people in suspension. Now it worked down the rest
of the list station by station.

Ring Network, the Commonwealth's broadcaster, read out each station's place
on the list as the power went off. The Treasury's cash cannot buy what the
elevators no longer carry.

Darren Watkins Jr., the Leader of the Opposition, tabled a motion of no
confidence at two in the afternoon, while the House was still arguing about
the water. Nobody on the government benches asked for time to answer it.`,
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
/* THE TRAP'S CONSEQUENCE, NOT A THRESHOLD. This waited for friction above
   70, and the annexation's own ramp, abating by the setup's trendDecay, tops
   out at exactly 70 -- so the freeze, the debt trap's one escalation beat and
   the thing the indemnity initiative insures against, never came in any run
   (design/34 D4). It now follows the Sovereign Debt Trap itself, unless the
   government has brought the quarrel back under 60 since. */
{ id:"f1_accounts_freeze", chapter:2, weight:87, once:true,
  setpiece:{ title:"Europe freezes the Works' accounts, and the Commonwealth money in them", mood:"threat",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"A state that takes a platform takes its creditors with it. The measures will stand until the creditors are paid.",
        who:"The European Union's statement on the sanctions" },
      { said:"Three of our suppliers rang before breakfast to ask whether they would be breaking the law by selling us water.",
        who:"The Works' chief engineer, on Ring Network, the Commonwealth's broadcaster" },
      { said:"The platform has been paid for twice already: once by the people who built it, and once by the people who kept it breathing.",
        who:"The Spindle, the Commonwealth's newspaper of record, in its leading article" } ] }
  ] },
  when:{ resolved:"f1_pyrrhic", scalarAbove:{ friction:60 } },
  /* THE FREEZE HAS TO RECORD ITSELF. Two of the four branches of
     `indemnity_settles` are the ones where the cover PAYS, and both wanted
     `f1_frozen` — which nothing in the project set, so a government could
     buy indemnity against exactly this and the policy could never answer.
     An effect on the event rather than on a choice, because the accounts
     freeze in the body: it has happened by the time the player is asked
     anything, and both answers are answers to it. */
  effects:[{ flag:"f1_frozen" }],
  title:"The accounts are frozen",
  speaker:"hatt",
  body:`The European Union has frozen the bank accounts of the Bellamy Almanac
Works, the orbital refinery the Commonwealth took over, and every account
that has paid money into them. The freeze traps Commonwealth funds held by
suppliers in three countries.

The government must now pay for the platform's fuel, water and wages
directly, out of the reserve, the Treasury's cash in hand. The residents
were paid this week. Next week they will be paid only if the reserve pays
them.

The Union's sanctions work by naming accounts. The water suppliers at the
Malindi anchor, the fuel brokers in Mombasa and the bank that runs the
platform's payroll all now hold Commonwealth money they are forbidden to
move. Three of them rang the platform before breakfast to ask whether
selling it water would break the law.

The Union holds most of the platform's bonds, through its banks and pension
funds. It says the sanctions will stand until the bondholders are paid.

The Treasury puts the cost of carrying the platform until the sanctions lift
at ten billion dollars on present terms. No bank on Earth will say how long
the present terms will last. The alternative is to leave the suppliers to
carry the risk, which they will do by charging for it or by stopping.

"It is not an embargo yet," said Edward Hatt, leader of the Alliance of
Business and Government, the business party in the House. "It is the price
of one, and it is being charged to us by the hour."`,
  choices:[
    { posture:"bold", label:"Pay for the platform out of the reserve.",
      effects:[{ move:{ "solvency":-10000 } }, { move:{ "legitimacy":6 } },
               { move:{ "trend.friction":-1 } },
               { wire:"COMMONWEALTH FUNDS THE PLATFORM FROM THE RESERVE; SANCTIONS STAND" }],
      result:"The workers keep running and the reserve pays. The friction stops worsening, which is not the same as improving." },
    { posture:"cautious", label:"Let the platform's suppliers carry the risk.",
      effects:[{ move:{ "legitimacy":-8 } }, { move:{ "trend.friction":1 } },
               { wire:"SUPPLIERS ASKED TO CARRY PLATFORM RISK; OUTER HABITATS OBJECT" }],
      result:"The government keeps its money and loses the argument, and the sanctions deepen on their own." }
  ]},

/* THE OTHER WAY OUT. The couplings make high friction cost the margin every
   sitting, so a government that wants friction DOWN needs something to do
   about it that is not simply waiting: Earth's price for standing down, on
   the table more than once, at a cost the player can see. */
{ id:"fa_conciliate", chapter:2, weight:62, maxFires:2,
  when:{ scalarAbove:{ friction:45 } },
  title:"What Earth would take to stand down",
  speaker:"landry",
  body:`Jean Landry, the Minister for External Relations, has a list of terms from
the European banks that hold the Works' bonds.

The Commonwealth would pay the bondholders the seven billion dollars the
platform defaulted on, and accept an inspection of its claim to have
salvaged the platform. In return the European Union would lift its sanctions
for three months and then review them.

The terms are harsh, and a government would refuse them in a normal year.
The sanctions are also costing the Treasury money every sitting they stay in
place.`,
  choices:[
    { posture:"cautious", label:`Pay the bondholders CW$7bn, and accept the inspection of the Commonwealth's salvage claim.`,
      note:`The European Union lifts its sanctions for three months, which stops them costing the Treasury every sitting, and the quarrel with Earth cools. Paying and accepting an inspection looks like conceding the claim, and voters' belief in the government's account of the salvage falls.`,
      /* paying the bond also cures the Standby Facility's default, if the
         agent has declared one (f1_standby_notice) */
      effects:[{ move:{ "friction":-9 } }, { move:{ "solvency":-7000 } },
               { move:{ "legitimacy":-3 } },
               { flag:{ works_bond_paid:true, standby_default:false } },
               { wire:"COMMONWEALTH PAYS THE BOND; EARTH SUSPENDS THE MEASURES FOR A QUARTER" }],
      result:"The reserve pays seven billion dollars to the bondholders. The European Union lifts its sanctions for three months, and the quarrel with Earth cools." },
    { posture:"bold", label:`Refuse Earth's terms, and live with the sanctions.`,
      note:`The refusal is popular at home, with the Trades Left, the current of your party that speaks for the maintenance unions, in particular, and voters credit a government that will not be pressed. The sanctions stay and cost more every sitting, and the quarrel with Earth grows.`,
      effects:[{ move:{ "friction":2 } }, { move:{ "legitimacy":5 } },
               { move:{ "loyalty.cu_maintenance":4 } },
               { wire:"PM REFUSES EARTH'S TERMS: 'THE COMMONWEALTH DOES NOT PAY RANSOM' (as of 6 days ago)" }],
      result:"The refusal is popular at home, and with the Trades Left in particular. The sanctions stay, and cost more every sitting." }
  ]},

/* REACH: no gate; always eligible in ch2 and loses on weight. */
{ id:"fa_two_fronts", chapter:2, weight:57, maxFires:2,
  /* it reports the platform's scrubbers, so it waits for the stranding:
     ungated, it could lead the news before there was a platform to report */
  when:{ seen:["f1_stranded"] },
  title:"Two audiences, one sentence",
  speaker:"ceyhan",
  body:`The Spindle, the Commonwealth's newspaper of record, leads with the Works'
failing air scrubbers and the governments on Earth that let Cordell, the
Gabonese mining company that owned the platform, walk away. Earth's news
services report a tragic industrial accident that orbital politicians are
exploiting, and quote as an expert a former minister who left office nine
years ago.

The government can make one statement, and both audiences will read it.`,
  choices:[
    { posture:"bold", label:"Speak to the Commonwealth: stress competence, not sympathy.",
      effects:[{ move:{ "legitimacy":6 } }, { move:{ "actor.earth_bloc":-5 } },
               { move:{ "friction":3 } },
               { wire:"PM SPEAKS TO THE HABITATS; EARTH SERVICES CALL THE TONE 'MANAGERIAL'" }],
      result:"At home the statement reads as a government in control of the crisis. Earth's services quote it as proof that the Commonwealth has stopped trying to be diplomatic." },
    { posture:"cautious", label:"Speak to both: call it an accident, and the Commonwealth's response a rescue.",
      effects:[{ move:{ "actor.earth_bloc":6 } }, { move:{ "actor.earth_host":4 } },
               { move:{ "legitimacy":-3 } }, { move:{ "friction":-2 } },
               { wire:"PM ADDRESSES BOTH AUDIENCES ON THE PLATFORM (Earth services carry it in full)" }],
      result:"Earth's services carry the statement in full. On the outer habitats, members ask why the government is explaining itself to people who do not vote for it." }
  ]},

/* the canon election: the pyrrhic tier leads to the campaign's victory */
{ id:"f1_pyrrhic_election", chapter:3, prologue:7, once:true,
  setpiece:{ title:"Prime Minister asks the country to sign for the Works' debt",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"Saved, and owed.",
        who:"The Spindle, the Commonwealth's newspaper of record, on its front page" },
      { said:"The government bought a platform on the country's account, and now it wants the country to sign for it.",
        who:"Darren Watkins Jr. MP, Leader of the Opposition" } ] }
  ] },
  when:{ resolvedIs:"f1_pyrrhic" },
  title:"The mandate",
  speaker:null,
  body:`The Prime Minister has made the last week of the election campaign a vote on
the Bellamy Almanac Works, the orbital refinery the Commonwealth took over,
and on the debts that came with it.

The government saved 184,000 people, and the country will pay for it. Nobody
disputes either half of that sentence. The argument is over which half
matters more, and the opposition has chosen the second.

The Treasury's figures are public. The platform's bonds are on the
Commonwealth's books and the Treasury is short of cash. It has already
written three years of austerity into its forecasts, and the first austerity
budget will go to the new House whoever forms the government.

Every other question the parties brought to the campaign has been folded
into this one: the budget, prices and the quarrel with Earth. The Prime
Minister is asking the country to endorse the debt by name.`,
  choices:[
    { label:"Ask the country for the mandate.",
      effects:[{ wire:"PM ASKS THE COUNTRY FOR A MANDATE ON THE WORKS' DEBT" }],
      result:"The last week of the campaign is about the debt, and the count will say what the country thinks of it." }
  ]},

/* UNDERWRITING. The cover ran for the term the government bought, and the
   Underwriters settle against the one risk they wrote. The branches are
   the risk and the tempo, and between them they cover every state: the
   freeze happened or it did not, and the cover was on the suppliers or on
   the whole line. */
/* REACH: queued by the take_indemnity initiative. */
{ id:"indemnity_settles", queuedOnly:true, once:true,
  setpiece:{ title:"Insurance against a freeze on the Works' accounts comes to term" },
  title:"The indemnity comes to term",
  speaker:"hatt",
  body:`The insurance the Commonwealth bought against a freeze on the bank accounts
of the Bellamy Almanac Works, the orbital refinery it took over, has run its
term. Whether it pays out depends on a single fact.

The indemnity covered one risk: that the platform's accounts would be frozen
and its suppliers left unpaid. The Commonwealth bought the cover while that
was only a possibility, and the insurers priced it as one.

The insurers are the Underwriters, the syndicates and mutual societies the
Commonwealth insures with and borrows from at home. They have sent the
Treasury a single page, with the premium paid at the top and one line at the
foot saying what was covered.

A policy that pays leaves the Underwriters poorer and more careful with the
next one. A policy that expires unused leaves them the premium, and leaves
the Treasury explaining what it bought.

"Frozen or not frozen," said Edward Hatt, leader of the Alliance of Business
and Government, the business party in the House. "That was the whole policy.
They wrote it that way because they could read the numbers and we could
not."`,
  choices:[
    { label:"The accounts froze. The cover answers the suppliers.",
      when:{ flags:["indemnity_suppliers","f1_frozen"] },
      effects:[{ move:{ "solvency":9000 } }, { move:{ "actor.underwriters":-2 } },
               { wire:"UNDERWRITERS PAY ON THE FROZEN ACCOUNTS" }],
      result:`The payout arrives after the freeze and it is smaller than the freeze. The reserve ends the term nine billion dollars better than the sanctions left it.` },
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
      result:`The risk stayed away for the whole term. The Underwriters keep the premium.` },
    /* The safety net every queued settle carries. A door content never uses
       is better than an event that can strand a sitting. */
    { label:"The term ends.",
      when:{ flagsAbsent:["indemnity_suppliers","indemnity_lifesupport"] },
      effects:[{ wire:"THE INDEMNITY TERM ENDS" }],
      result:"The cover closes with nothing written against it." }
  ]},

/* SUBSTRATE FUTURES AND DEBT. The debt was secured against the
   continuation of the people on the platform, so the settle reads the
   platform's own numbers: how many were suspended at the term, and what
   the substrate was worth. Suspensions are whole numbers, so `below T + 1`
   and `above T` cover every value; prices carry one decimal, so
   `below X + 0.1` and `above X` do the same. */
/* REACH: queued by the assume_substrate_debt initiative. */
{ id:"substrate_debt_settles", queuedOnly:true, once:true,
  setpiece:{ title:"The debt on the Works' mind hardware comes to term" },
  title:"The substrate debt comes to term",
  speaker:"ceyhan",
  body:`The loan that paid for the substrate of the Bellamy Almanac Works, the
computers its emulated residents run on, has come to term. The Commonwealth
took the debt on when it took over the orbital refinery, or wrote it off.

When the loan was made, the lender's security was the people running on the
hardware. The debt is therefore a claim on the residents' continued
existence as much as on the machines.

Two figures decide how it settles. If the Commonwealth took the debt on, the
question is whether fewer people are held in suspension now than when it
did. A suspended mind is kept intact but not running.

If the Commonwealth wrote the debt off, the question is whether substrate
has risen in price since. A rising price makes the cancelled debt worth more
than the Commonwealth allowed for.

"There are two ways to answer a debt secured on people," wrote Ivor Ceyhan,
political editor of The Spindle, the Commonwealth's newspaper of record.
"You can pay it, or you can say it was never owed. The platform has been
counting either way."`,
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

/* THE FACILITY, REPAID. The answer to the `repay_facility` initiative. The
   Alliance offers to keep the line open, which is a standing call on the
   Commonwealth's short position with the Alliance's name on it. */
{ id:"f1_facility_closed", queuedOnly:true, once:true,
  setpiece:{ title:"Commonwealth repays the Alliance's emergency loan" },
  title:"The facility is closed",
  speaker:"hatt",
  body:`The Commonwealth has repaid the emergency loan it took from the Alliance of
Business and Government, a party in the House, and the Alliance has no
further claim under it.

The Alliance lent 18 billion dollars when the Treasury was short of cash,
repayable at 19.8 billion before the House rose. The Treasury paid in cash
or in the Cordell mining leases, as it chose. The leases are the rights to
the ore that feeds the Bellamy Almanac Works, the orbital refinery the
Commonwealth took over.

The Alliance has told the House it was paid in full.

Edward Hatt, the Alliance's leader, has offered to keep the line open as a
standing loan on the same terms, drawn only when the Commonwealth asks. It
would cost nothing until it was used. It would also mean that a party
sitting in the House stood behind the Commonwealth's borrowing for as long
as the line was open.`,
  choices:[
    { posture:"cautious", label:"Keep the line open.",
      effects:[{ flag:"abg_standing_line" }, { move:{ "loyalty.gb":4 } }, { move:{ "legitimacy":-2 } },
               { wire:"ALLIANCE HOLDS STANDING LINE ON COMMONWEALTH SHORT POSITION" }],
      result:"The Alliance holds a standing line on the Commonwealth's short position, on the terms of the emergency facility." },
    { posture:"bold", label:"Close it.",
      effects:[{ move:{ "legitimacy":3 } }, { move:{ "loyalty.gb":-2 } }],
      result:"The Commonwealth owes the Alliance nothing and has no line with it." }
  ]},

/* THE FACILITY, CALLED. Queued by the breach of `f1_debt` when the House
   rises with the facility unpaid. The default margin is the agreement's. */
{ id:"f1_debt_called", queuedOnly:true, once:true,
  setpiece:{ title:"Alliance calls in its emergency loan: 21.6 billion dollars or the mining rights", mood:"threat",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"The facility was printed, the rate was printed and the margin was printed. Nobody can say they were not told.",
        who:"Edward Hatt MP, Leader, Alliance of Business and Government" },
      { said:"A party in the House is about to own the ore the Works runs on.",
        who:"The Spindle, the Commonwealth's newspaper of record" } ] }
  ] },
  title:"The facility is called",
  speaker:"hatt",
  body:`The Alliance of Business and Government, a party in the House that lent the
Commonwealth money in the crisis, has called in its emergency loan. It wants
21.6 billion dollars, or the mining rights that feed the Commonwealth's new
refinery.

The loan was still owed when the House rose. The agreement adds a default
margin of ten per cent to the principal and the printed rate, which is how
the sum reached 21.6 billion.

Edward Hatt, the Alliance's leader, delivered the demand in person, which
the agreement does not require. He wanted the Treasury to hear the sum from
the party that lent it.

The Alliance will accept the Cordell leases instead of cash. They are the
rights to the ore that Cordell, the Gabonese mining company, used to mine
for the Bellamy Almanac Works, the orbital refinery, and they came to the
Commonwealth with the platform.

If the Alliance takes the leases, the debt is cleared without a dollar
leaving the Treasury. The Works will then buy its ore from a party in the
House. Or the Treasury can pay the sum in cash and keep the leases, if it
has the money.`,
  choices:[
    { posture:"bold", label:"Pay it from the reserve.",
      when:{ scalarAbove:{ solvency:21599 } },
      effects:[{ move:{ "solvency":-21600 } }, { move:{ "debt.alliance":-19800 } },
               { move:{ "legitimacy":-2 } }, { flag:{ cordell_leases_pledged:false } },
               { wire:"TREASURY PAYS CALLED FACILITY IN FULL FROM THE RESERVE" }],
      result:"The reserve pays the Alliance in full, and the Cordell leases stay with the Commonwealth." },
    { posture:"cautious", label:"Let the Alliance take the leases.",
      effects:[{ flag:"cordell_leases_ceded" }, { move:{ "debt.alliance":-19800 } },
               { move:{ "loyalty.gb":6 } },
               { move:{ "public_standing":-5 } }, { move:{ "legitimacy":-6 } },
               { wire:"ALLIANCE TAKES CORDELL LEASES IN SETTLEMENT OF CALLED FACILITY" }],
      result:"The Cordell mining leases pass to the Alliance of Business and Government, and the facility is extinguished." }
  ]},

/* =============================================================
   FLASH I: THE REST OF THE AUTHOR'S PLAN (design/35). EXAMPLES TO REWRITE.

   The pivots and the tier fall, built from the vocabulary and nothing
   else, so each is a worked example of the shape rather than the last
   word. The prose is bare on purpose, like the settlements' closings.

   THE TIER FALL. "Failing a trajectory check doesn't jump straight to the
   worst case — it drops the situation down one tier per turn, giving the
   player time to execute an Emergency Pivot before hitting Systemic
   Meltdown." Two floors now come before the meltdown, each a flag the next
   one needs, and the pool fires one event a sitting, so the fall is at most
   one floor a sitting. The meltdown needs the second floor, and nothing
   while the emergency order stands.

   THE PIVOTS are initiatives, one per tier, in initiatives.js beside this
   file:
   declare_emergency (Meltdown), sell_the_leases (Pyrrhic),
   lease_the_zone (Joint Mandate), sacrifice_the_minister (Capitulation).
   Their answers are below. Appended, not inserted: see the note at
   f1_facility_closed.
   ============================================================= */
{ id:"f1_brink_1", chapter:2, weight:97, once:true,
  setpiece:{ title:"Heat builds in the habitats as coolant from Earth is held up",
    sections:[
    { kind:"document", head:"The power the authority holds",
      body:"Where the thermal margin of a band falls below the level prescribed by the Minister, the engineering authority may suspend the register of tier four in that band without notice.",
      source:"The Allocation Act" }
  ] },
  when:{ flags:["f1_frozen"], scalarAbove:{ friction:70 }, scalarBelow:{ thermal_margin:30 } },
  title:"The first floor gives",
  speaker:"girard",
  effects:[{ flag:"f1_first_floor" }],
  body:`The Commonwealth's thermal margin, the spare capacity its radiators have to
shed heat, has fallen below 30 and is dropping faster than the Treasury
forecast. The coolant the habitats need is bought on Earth, through banks
now under the European Union's sanctions.

Every tanker of coolant is now paid for twice: once in money and once in
delay. The margin matters because the Commonwealth's people, bodies and
minds alike, produce heat, and a habitat that cannot shed it cannot keep
them all running.

Below 30, the engineering authority, the body that runs life support, may
begin cutting power on its own schedule, without asking a minister. It
follows the shed order, the published list of who stops running first in a
shortage. A person shed is held in suspension: their mind is kept intact but
stops running until the power returns.

Vesna Girard, the Minister for Substrate and Thermal, counts three floors
under the government: the margin, the Treasury's cash that pays for it, and
the House. The first is giving way.

Her ministry can ration power on the ring, the band of eight stations where
half the Commonwealth lives, before the authority does. That would mean a
cooler ring and louder complaints, and it would win back a sitting or two on
the margin. Or the government can hold, say nothing, and let the authority's
cuts come when they come.

The Allocation Act, the law that governs a shortage, gives the authority
that power. "We can choose what gets switched off," Girard said. "Or the
authority will choose for us, and it will choose by the list."`,
  choices:[
    { posture:"bold", label:"Ration the ring ahead of the shed order.",
      effects:[{ move:{ thermal_margin:3, public_standing:-3 } }],
      result:"The ring runs cooler and louder. The margin buys a sitting or two." },
    { posture:"cautious", label:"Hold the line and say nothing.",
      effects:[{ move:{ legitimacy:-2 } }],
      result:"Nothing changes today, which is the point and the danger." }
  ]},

{ id:"f1_brink_2", chapter:2, weight:97, once:true,
  setpiece:{ title:"Cash runs short and the power cuts begin on two stations",
    sections:[
    { kind:"document", head:"The draft",
      body:"1. No assembly of more than fifty persons shall take place in a public space of a ring station.\n\n2. Movement between stations shall require a permit issued under this Order.\n\n3. For so long as this Order is in force, no motion of no confidence in the Government shall be moved in the House.",
      source:"The Emergency Powers (Circumterrestrial Commonwealth) Order 2080, as drafted by the Cabinet Office. Unsigned." }
  ] },
  when:{ flags:["f1_first_floor"], scalarAbove:{ friction:75 },
         scalarBelow:{ thermal_margin:25, solvency:30000 } },
  title:"The second floor gives",
  speaker:null,
  effects:[{ flag:"f1_second_floor" }],
  body:`The Commonwealth's cash reserve has fallen below 30 billion dollars, and the
engineering authority, the body that runs life support, has begun switching
people off. Overnight, on two stations, it switched off the people in tier
four, and it sent out the notices afterwards.

Tier four is the lowest band of the shed order, the published list of who
stops running first in a shortage. A person shed is held in suspension,
their mind kept intact but stopped, until the power returns. The Allocation
Act, the law that governs a shortage, lets the authority act first and give
notice afterwards.

The European Union's sanctions cost more every week than the Treasury has to
spend. The thermal margin, the spare heat capacity of the Commonwealth's
radiators, is under 25, inside the range where the authority cuts power
without being asked.

One floor is left under the government, and it is Parliament. The quarrel
with Earth has never been worse, members on every bench can read the
figures, and a motion of no confidence needs only somebody willing to move
it.

The Cabinet Office has drafted an emergency order to hold the government up.
It would restrict public gatherings on the ring, the band of stations where
half the Commonwealth lives, and require a permit to travel between
stations. It would also bar the House from removing the government while the
order stands.

No government has made such an order. It sits on the Prime Minister's desk,
unsigned, and it can be signed at any sitting from now on.`,
  choices:[
    { posture:"cautious", label:"Leave the order drafted and unsigned.",
      effects:[{ move:{ legitimacy:-2 } }],
      result:"The emergency order is on the Prime Minister's desk, unsigned." },
    { posture:"bold", label:"Concede something to Earth's banks in public.",
      effects:[{ move:{ friction:-3, legitimacy:-4 } }],
      result:"The concession is small and printed large. The quarrel eases by a point or two." }
  ]},

/* the Meltdown's pivot, answered */
{ id:"f1_emergency_declared", queuedOnly:true, once:true,
  setpiece:{ title:"Emergency order signed: gatherings limited, and the House may not remove the government", mood:"order",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"Some of us have been stopped at a gate before.",
        who:"A survivor of the rising, on Ring Network, the Commonwealth's broadcaster" },
      { said:"The House has been told it may not do the one thing a House exists to do.",
        who:"Darren Watkins Jr. MP, Leader of the Opposition" } ] }
  ] },
  title:"The emergency order",
  speaker:null,
  body:`The Prime Minister signed an emergency order at twenty to midnight, and it
took effect at midnight. Gatherings on the ring stations are restricted,
travel between stations needs a permit, and the House may not remove the
government while the order stands.

The Commonwealth has no army. Each station's own authorities carry the order
out under the Prime Minister's signature, and the first night was spent
finding out which of them would, and how.

Nothing like it has happened in orbit since 2063, when the provisional
administration put down a five-week rising, a year before the Perigee
Charter, the constitution that founded the Commonwealth. Some of the people
stopped at the permit gates tonight were there. They are in their fifties
now.`,
  choices:[
    { label:"It is done.",
      effects:[{ wire:"PRIME MINISTER SIGNS EMERGENCY ORDER; HOUSE MAY NOT REMOVE GOVERNMENT WHILE IT STANDS" }],
      result:"The government stands, and nobody can say it stands on consent." }
  ]},

{ id:"f1_emergency_lapses", queuedOnly:true,
  setpiece:{ title:"The emergency order runs out at midnight unless it is renewed",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"An emergency is a thing that ends.",
        who:"The Spindle, the Commonwealth's newspaper of record, in its leading article" },
      { said:"Renew it once and there will always be a reason to renew it again.",
        who:"A member on the government's own benches" } ] }
  ] },
  title:"The order runs out",
  speaker:null,
  body:`The emergency order that barred the House from removing the government
expires at midnight. The House sits again with its powers restored, and its
first question is whether the government should have had the order at all.

The permit gates between stations come down with the order unless it is
renewed. Each station's authorities kept count of what the order stopped and
what it cost them, and their counts are now before the Speaker.

Renewing the order takes one signature and runs for four more sittings. The
renewal would also become the story every paper ran.

Letting it lapse gives the House back its power over the government the same
night. The Commonwealth's cooling, its cash and its quarrel with Earth would
be where the order found them.`,
  choices:[
    { posture:"cautious", label:"Let it lapse.",
      effects:[{ flag:{ f1_emergency:false } }, { move:{ legitimacy:10 } }],
      result:"The order lapses. Some of what it cost comes back; most of it does not." },
    { posture:"bold", label:"Renew it for four sittings.",
      effects:[{ move:{ public_standing:-6, party_loyalty:-6 } },
               { queue:[{ event:"f1_emergency_lapses", after:4 }] }],
      result:"The order is renewed, and the renewal is the story." }
  ]},

/* the Pyrrhic tier's pivot, answered */
{ id:"f1_leases_sold", queuedOnly:true, once:true,
  setpiece:{ title:"Commonwealth sells the Works' mining rights to pay for the crisis" },
  title:"The leases are sold",
  speaker:null,
  body:`The Commonwealth has sold the Cordell leases, the mining rights that came
with the Bellamy Almanac Works, the orbital refinery it took over. The money
goes into the Treasury's cash, and Earth's banks priced the Commonwealth's
risk a little lower on the day.

Cordell, the Gabonese mining company that abandoned the Works, held the
leases to the ore its extraction platforms brought to the refinery. The
leases passed to the Commonwealth with the platform. Sold, they pay down
what the quarrel with Earth costs the Treasury every sitting.

The Works will now buy its ore from the new holder, at the price the new
holder sets. The sale is final.

The Trades Left, the largest current in the governing party, whose members
come from the maintenance trades and their unions, argued against the sale
in the party room and lost.`,
  choices:[
    { label:"Announce it as prudence.",
      effects:[{ move:{ public_standing:1 } }],
      result:"It is announced as prudence. The Trades Left calls it a sale." }
  ]},

/* the Joint Mandate's pivot, answered */
{ id:"f1_zone_leased", queuedOnly:true, once:true,
  setpiece:{ title:"The Works' free zone collects its first docking fees" },
  title:"The first fees are paid",
  speaker:"landry",
  body:`The free trade zone at the Bellamy Almanac Works, the orbital refinery now
run jointly by the United Nations and the Commonwealth, has collected its
first fees from the cargo carriers that dock there.

Under the joint mandate that settled the platform's future, the two
administer it together, and the Commonwealth's half includes the docking
berths. Every carrier that docks to load plate or deliver ore pays the
Commonwealth for its berth.

The residents keep their Earth passports and the Commonwealth's protection.
Nobody owns the platform yet. The fees are the first part of the arrangement
anyone has been able to count.

Jean Landry, the Minister for External Relations, will report the first
receipts to the House.`,
  choices:[
    { label:"Report it to the House.",
      effects:[{ move:{ legitimacy:1 } }],
      result:"The House hears that the mandate pays, which it had been told it would not." }
  ]},

/* the Capitulation's pivot, answered */
{ id:"f1_minister_resigns", queuedOnly:true, once:true,
  setpiece:{ title:"Minister for External Relations resigns over the loss of the Works",
    sections:[
    { kind:"document", head:"The statement",
      body:"I have today tendered my resignation as Minister for External Relations. The decision not to recognise the vote on the Bellamy Almanac Works was one I advised and defended, and its consequences are mine to answer for. I thank the Prime Minister for the trust placed in me. I will continue to serve my constituents from the back benches.",
      source:"Issued by the minister's office" }
  ] },
  title:"A resignation",
  speaker:null,
  body:`The Minister for External Relations has resigned, taking responsibility for
the fate of the Bellamy Almanac Works, the orbital refinery whose residents
voted to join the Commonwealth.

The government declined to recognise that vote. Security guards working for
Cordell, the Gabonese mining company that had abandoned the platform, then
reclaimed it under the company's charter. The residents were taken down the
space elevator into Kenya's two-year programme to bring them home.

The outer habitats, which had sent the platform supplies, have struck twice
since.

Somebody had to answer for it in the House. The minister who carried the
government's answer to Earth is the one who has.`,
  choices:[
    { label:"Accept it in the House.",
      effects:[{ wire:"MINISTER FOR EXTERNAL RELATIONS RESIGNS OVER PLATFORM" }],
      result:"The Spindle prints the statement in full, which it does for resignations and for nothing else." }
  ]},


/* MUTUAL VULNERABILITY: EARTH'S ANSWER TO THE RELAYS. Queued by
   `hold_the_relays` after the European Union's lag. The side whose stores
   run out first gives way. The Commonwealth's stores are its consumables:
   the nitrogen and water that come up the tethers. At 50 or above it can
   outlast Earth's grid and Earth gives way, further if the crews were held
   too; below 50 Earth waits, and the tethers carry less. One door is open
   in every state. */
{ id:"f1_earth_answers", queuedOnly:true, maxFires:2,
  setpiece:{ title:"Europe weighs its dark evenings against the Commonwealth's water",
    sections:[
    { kind:"voices", head:"What is being said", body:[
      { said:"The Commonwealth is using the lights in European homes as a bargaining position.",
        who:"The European Union's statement" },
      { said:"Brussels has been using our water as one since May.",
        who:"The Spindle, the Commonwealth's newspaper of record" } ] }
  ] },
  title:"Earth's answer on the relays",
  speaker:"landry",
  body:`The European Union has answered the Commonwealth's decision to hold back the
solar power it beams to European grids. Brussels has weighed how long its
grids can run short against how long the Commonwealth's stores of nitrogen
and water can last.

The relays carry solar power from orbit to receiving stations on Earth, and
Europe's grids draw on them at the evening peak. The Commonwealth also held
back its maintenance crews, who keep Earth's satellites working. Holding
back either costs Europe something it can measure by the hour. It also costs
the Commonwealth the fees it is paid for both.

The answer comes down to arithmetic. Nitrogen and water come up the tethers,
the space elevators, from Earth. A Commonwealth with full stores can wait
out Europe's evening peaks, and one with low stores cannot. The Union knows
the figure, because the Commonwealth publishes it.

Jean Landry, the Minister for External Relations, will tell the House what
Brussels has decided.`,
  choices:[
    { label:"The Union gives way, and the crews come back with the power.",
      when:{ flags:["crews_held"], scalarAbove:{ consumables:49 } },
      effects:[{ flag:{ relays_held:false, crews_held:false, earth_gave_way:true } },
               { economy:{ trade:12 } },
               { move:{ friction:-18, legitimacy:4, "actor.earth_bloc":4 } },
               { wire:"UNION LIFTS MEASURES; RELAYS AND CREWS RESTORED" }],
      result:"The Union lifts its measures, and the relays and the crews are back at work the same day." },
    { label:"The Union gives way on the power.",
      when:{ flagsAbsent:["crews_held"], scalarAbove:{ consumables:49 } },
      effects:[{ flag:{ relays_held:false, earth_gave_way:true } },
               { economy:{ trade:7 } },
               { move:{ friction:-10, legitimacy:3, "actor.earth_bloc":3 } },
               { wire:"UNION EASES MEASURES; RELAYS RESTORED" }],
      result:"The Union eases its measures, and the relays are switched back on." },
    { label:"The Union waits, and the tethers carry less.",
      when:{ scalarBelow:{ consumables:50 } },
      effects:[{ flag:"earth_waited" },
               { move:{ consumables:-6, thermal_margin:-2, friction:6 } },
               { wire:"UNION HOLDS ITS POSITION; VOLATILES CUT ON THE TETHERS" }],
      result:"The Union holds its position. Shipments of nitrogen and water up the tethers are cut, and the relays stay off until the government restores them." }
  ]},

/* the relays switched back on by the government, before Earth moved */
{ id:"f1_relays_restored", queuedOnly:true, maxFires:2,
  setpiece:{ title:"Commonwealth switches the power relays back on" },
  title:"The relays are back on",
  speaker:"landry",
  body:`The Commonwealth has restored the solar power it beams to Europe's grids and
sent its maintenance crews back to Earth's satellites. The European Union
welcomed the decision and left its own sanctions in place.

The government acted without waiting for an answer from Brussels and without
asking for anything in return. Europe's grids had their evening power back
within the hour, and the crews were back at work the next morning.

What the Commonwealth gets back is the trade. Earth pays for the power and
the crews, and the payments resume. The sanctions on the Bellamy Almanac
Works, the orbital refinery at the centre of the quarrel, stay as they were.`,
  choices:[
    { label:"Report it to the House.",
      effects:[{ move:{ public_standing:-1 } }],
      result:"The House hears that the relays are back on and that nothing was asked for in return." }
  ]},

/* THE STANDBY FACILITY'S EXPROPRIATION CLAUSE (the author, 24 Sep). The
   world's Earth facility (content/setup.js) counts the taking of an
   Earth-registered company's property without compensation as an event of
   default, and the Annexation Act takes the Works while its bonds are
   unpaid, which is the European Union's own complaint. So the notice lands
   once, soon after the Act. Paying the bond cures it, here or through
   fa_conciliate. Appended at the end of the list, because the seeded lean
   is keyed on position. Its first choice moves no meter: the canon
   government takes that one, and pays the bond after the result. */
{ id:"f1_standby_notice", chapter:2, weight:95, once:true,
  setpiece:{ title:"Earth's banks declare the Commonwealth in default on its standby loan",
    sections:[
    { kind:"document", head:"The clause",
      body:"An Event of Default occurs if the Borrower, or any authority acting for it, expropriates, nationalises or otherwise takes without adequate compensation any property of a company incorporated in the jurisdiction of a Lender.",
      source:"The Standby Facility Agreement, 2078" }
  ] },
  when:{ flags:["almanac_annexed"], flagsAbsent:["works_bond_paid"] },
  title:"A notice from the agent",
  speaker:"skye",
  body:`The banks behind the Commonwealth's 60-billion-dollar Standby Facility have
declared it in default. They say the Annexation Act took the Bellamy Almanac
Works, the orbital refinery, from its Earth-registered owners without
compensation.

The notice came from Alphabet-JPMorgan Omni, the bank that acts for the
eight lenders in the facility, which was signed in 2078. Under its
expropriation clause, taking an Earth company's property without
compensation is an event of default.

Until the default is cured, the banks will lend nothing new, and anything
already borrowed carries a higher rate. The notice names two cures. The
Commonwealth can pay the platform's bondholders seven billion dollars. Or it
can buy a waiver for 900 million dollars and half a point more on its
interest rate until the facility ends.

Aster Skye, the Financial Secretary to the Treasury, has read the clause
twice. It was written for a government that nationalises a mine on the
ground, and nobody who drafted it imagined a refinery hanging from a space
elevator.

The Treasury can argue that the Act bought the platform's charter and left
the bonds with Cordell, the Gabonese mining company that abandoned it. The
banks can decline to lend while the argument runs.`,
  choices:[
    { posture:"bold", label:"Dispute it. The Act bought the charter, and the bonds are Cordell's.",
      effects:[{ flag:"standby_default" },
               { wire:"TREASURY DISPUTES DEFAULT NOTICE ON EARTH STANDBY FACILITY" }],
      result:"The facility is closed to the Commonwealth until the notice is withdrawn, and the letter goes into a file." },
    { posture:"measured", label:"Buy the waiver.",
      effects:[{ move:{ solvency:-900 } }, { flag:"standby_waiver" },
               { wire:"COMMONWEALTH PAYS FOR A WAIVER ON THE EARTH STANDBY FACILITY" }],
      result:"The syndicate waives the default for nine hundred million dollars, and the margin carries half a point more until the facility matures." },
    { posture:"cautious", label:"Pay the bondholders.",
      effects:[{ move:{ solvency:-7000, friction:-4, legitimacy:-3, "actor.earth_bloc":5 } },
               { flag:"works_bond_paid" },
               { wire:"COMMONWEALTH PAYS THE ALMANAC WORKS BONDHOLDERS; BRUSSELS NOTES THE PAYMENT" }],
      result:"The bond is paid out of the reserve, the notice is withdrawn, and Brussels acknowledges it in one sentence." },
    /* THE WORLD COURT'S QUESTION (design/43), answered here and not in an
       event of its own: a sitting spent on it the day after the Act took the
       canon's thermal margin from eight to one, by moving which event the
       ladder's rungs arrived on. Appended, so the canon's first choice and
       every positional strategy keep their picks. */
    { posture:"bold", label:"Dispute it, and ask the General Assembly to ask the World Court.",
      when:{ resolutionIs:{ un_icj_salvage:"draft" } },
      effects:[{ flag:"standby_default" },
               { resolution:{ un_icj_salvage:"table" } },
               { wire:"COMMONWEALTH SEEKS A WORLD COURT OPINION ON ORBITAL SALVAGE" }],
      result:"The facility is closed until the notice is withdrawn. At the Assembly's next sitting the Commonwealth asks it to put one question to the International Court of Justice: whether a state that rescues a platform's people may take the platform. If the Assembly asks, the Court answers four sittings later." }
  ]},


/* =============================================================
   THE GENERAL ASSEMBLY (design/43). Appended at the end of the list,
   because the seeded lean is keyed on position. The first choice of each
   is the one the canon script takes, so the first is the one that moves
   the least: the canon government waits at the mission and does not work
   the floor against the Union.
   ============================================================= */

/* THE TEACHING BEAT, one concept cluster: the Assembly, a resolution, and
   the count. It fires once the referendum is recognised, which is when the
   Commonwealth first has something to ask the world for. */
/* THE ASSEMBLY'S EVENTS ARE QUEUED, NOT DRAWN (design/43). Chapter two's
   pool is over-subscribed and takes the heaviest eligible event: at weights
   78-85 these took the emergency loan's and the anchor state's sittings and
   moved every playtest strategy, and at 50-60 they fired in one run of 120.
   Each is queued by the choice that makes it true, as the chain is, and
   takes one sitting at a known moment. */
{ id:"un_the_mission", chapter:2, queuedOnly:true, once:true,
  title:"One vote in a hundred and ninety-four",
  speaker:"landry",
  body:`The Commonwealth's mission to the United Nations in New York has sent its
first cable since the referendum on the Bellamy Almanac Works, the orbital
refinery, and Jean Landry, the Minister for External Relations, reads it
aloud.

The United Nations General Assembly, where every member state has one vote,
sits every three weeks through the summer. A resolution tabled before a
sitting is voted on at it. A majority of the states present and voting
carries it, and abstentions do not count.

The Commonwealth has one vote. The European Union's twenty-seven members
vote on a line their ministers agree in Brussels, and most keep to it. The
rest of the world votes by region, and each region according to what it
thinks of the Commonwealth. The mission keeps a count of how each state is
likely to vote, and the count moves with everything the government does
before the sitting.

"The mission can table a resolution affirming the Works' right to decide its
own future," Landry says.`,
  choices:[
    { posture:"cautious", label:"Wait. The referendum can speak for itself.",
      result:`The draft stays in the mission's safe. The government can table it from the Foreign Affairs tab before any sitting, where the mission's count is kept.` },
    { posture:"bold", label:"Table it now.",
      effects:[{ resolution:{ un_works_selfdet:"table" } },
               { wire:"COMMONWEALTH TABLES A RESOLUTION ON THE WORKS AT THE UNITED NATIONS" }],
      result:`The resolution is tabled for the Assembly's next sitting. The Union's mission asks for a copy within the hour.` },
    { posture:"measured", label:"Table it, and first write to six of the states that host the elevators' anchors.",
      effects:[{ resolution:{ un_works_selfdet:"table" } },
               { move:{ solvency:-1500 } },
               { move:{ "member.sao_tome":6, "member.kiribati":6, "member.brazil":6,
                        "member.maldives":6, "member.somalia":6, "member.uganda":6 } },
               { wire:"COMMONWEALTH TABLES A RESOLUTION ON THE WORKS AND REMITS ANCHOR FEES" }],
      result:`São Tomé and Príncipe, Kiribati, Brazil, the Maldives, Somalia and Uganda each receive a letter and a refund of three months' anchor fees, one and a half billion dollars in all. The resolution is tabled for the next sitting.` }
  ]},

/* THE UNION TABLES ITS OWN once the government moves to annex (the
   dilemma's choice does it, and queues this the sitting after), and this is
   the government's reply while it is still on the agenda: the Assembly first
   sits some four sittings later. */
{ id:"un_eu_tables", chapter:2, queuedOnly:true, once:true,
  setpiece:{ title:"Europe asks the UN to keep sanctions on until the Works' bondholders are paid" },
  title:"The Union's resolution",
  speaker:"landry",
  body:`The European Union has asked the United Nations General Assembly to call on
every member state to keep its sanctions in place until the bondholders of
the Bellamy Almanac Works, the abandoned orbital refinery, are paid.

The Union's 27 members will vote for the resolution and the Commonwealth
will vote against it. The rest of the Assembly will decide it.

Europe holds the platform's bonds through its banks and pension funds. It
cannot act through the Security Council, where the African Union's veto sits
across from its own. So it has gone to the Assembly, where a majority of the
states present and voting carries a resolution and no one has a veto.

An Assembly resolution binds nobody. But it tells every capital that keeping
its sanctions is what the world has asked of it, and it gives the banks that
hold the bonds a sentence to quote.

"It says 'compensation' four times and 'residents' once," said Jean Landry,
the Minister for External Relations. "It is written to be voted for by
delegates who have not read it."`,
  choices:[
    { posture:"cautious", label:"Vote against it and leave the floor to the Union.",
      result:`The Commonwealth's vote is recorded against. The rest of the count is the Assembly's.` },
    { posture:"measured", label:"Work the floor against it.",
      effects:[{ move:{ solvency:-2500 } },
               { move:{ "member.african_group":8, "member.latin_american_group":8,
                        "member.asia_pacific_group":6 } },
               { wire:"COMMONWEALTH MISSION WORKS THE ASSEMBLY AGAINST THE UNION'S RESOLUTION" }],
      result:`The mission spends three weeks in the delegates' lounge, and the Treasury offers compute at cost to the capitals that ask. The count moves.` },
    { posture:"bold", label:"Answer it with the Commonwealth's own.",
      when:{ flags:["f1_referendum_carried"], resolutionIs:{ un_works_selfdet:"draft" } },
      effects:[{ resolution:{ un_works_selfdet:"table" } }, { move:{ friction:2 } },
               { wire:"COMMONWEALTH ANSWERS THE UNION WITH A RESOLUTION ON THE WORKS' RESIDENTS" }],
      result:`Both resolutions go to the same sitting, and the delegates are asked to choose between the Works' residents and its bondholders on one afternoon.` }
  ]},

/* THE WORLD COURT'S ANSWER, four sittings after the Assembly asks. Which
   way it goes is the state's: the Court reads a Commonwealth the world
   believes. */
{ id:"f1_icj_opinion", queuedOnly:true, once:true,
  setpiece:{ title:"World Court rules on whether a rescuer may keep an abandoned platform" },
  title:"The Court's opinion",
  speaker:"fenwick",
  body:`The International Court of Justice, the United Nations' highest court, has
given its opinion on whether a state that rescues the residents of an
abandoned orbital platform may take the platform itself.

The General Assembly of the United Nations asked for the opinion, and no
treaty answers the question. The law of salvage was written for ships. The
court had to decide whether the Bellamy Almanac Works, an orbital refinery
with 184,000 people aboard, is more like a ship or more like a territory.

The opinion runs to sixty pages. Adaeze Fenwick, the Minister for Law and
the Charter, read the last four first.

The fifteen judges come from fifteen states, one of them in the European
Union, whose banks hold the platform's bonds. A court with no law to apply
reads the parties instead. A claimant the world believes is heard
differently from one it does not, and the Commonwealth has had a session to
decide which it would be.

"It turns on paragraph 206," Fenwick said, "and paragraph 206 turns on
whether they believed us."`,
  choices:[
    { label:"The Court finds the salvage lawful.",
      when:{ scalarAbove:{ legitimacy:49 } },
      effects:[{ flag:"icj_salvage" }, { move:{ legitimacy:4 } }, { move:{ friction:-4 } },
               { wire:"WORLD COURT: A STATE THAT RESCUES A PLATFORM'S PEOPLE MAY TAKE THE PLATFORM" }],
      result:`The Court finds that a state which rescues the residents of an abandoned platform may take the platform as salvage. Earth's courts are not bound by an advisory opinion, and every one of them will read it.` },
    { label:"The Court finds for the bondholders.",
      when:{ scalarBelow:{ legitimacy:50 } },
      effects:[{ flag:"icj_bondholders" }, { move:{ friction:5 } }, { move:{ legitimacy:-3 } },
               { wire:"WORLD COURT: THE WORKS' BONDS SURVIVE THE RESCUE" }],
      result:`The Court finds that the rescue does not extinguish the bondholders' claim, and the Union's mission circulates the paragraph that says so before lunch.` }
  ]},

/* THE MISSION REPORTS, the answer to working the floor. */
{ id:"un_floor_report", queuedOnly:true,
  setpiece:{ title:"Commonwealth mission reports three weeks of lobbying at the UN" },
  title:"The mission reports",
  speaker:"landry",
  effects:[{ flag:{ un_floor_working:false } }],
  body:`The Commonwealth's mission to the United Nations has cabled home the results
of three weeks spent lobbying in the General Assembly: who was seen, what
was offered, and which delegations now take the Commonwealth's calls.

The Assembly is where a small state does its work. The mission spent its
time on the delegations whose votes no bloc controls: the states that host
the space elevators' anchors, the ones that buy computing from orbit, and
the ones that would rather be asked than told.

The cable is two pages long. It does not say which of the promises will be
kept. It lists the ones that were made, and the government's own count of
the Assembly, delegation by delegation, has the rest.`,
  choices:[
    { label:"Noted.",
      result:`The cable is filed with the others. The mission can be sent again.` }
  ]},


/* THE TWO ROUTES THE ENDINGS NOW TAKE (design/43), each offered once the
   state allows it; the tab's Table control offers the same at any time. */
{ id:"un_joint_offer", chapter:2, queuedOnly:true, once:true,
  title:"Kenya's proposal",
  speaker:"landry",
  body:`Kenya's foreign ministry has cabled a compromise. The Works would be
administered jointly by the United Nations and the Commonwealth as a free
trade zone. Its residents would keep their Earth passports and gain the
Commonwealth's protection, and nobody would own the platform until the
residents decide who should.

"Placing a territory under United Nations administration needs two thirds of
the General Assembly," says Jean Landry, the Minister for External
Relations. "Kenya will vote for it. Whether anybody else does depends on
what we are seen to want."`,
  choices:[
    { posture:"cautious", label:"Thank Kenya and keep the proposal in the drawer.",
      result:`The proposal is acknowledged and not tabled. The government can table it from the Foreign Affairs tab before any sitting.` },
    { posture:"bold", label:"Table it as the Commonwealth's own.",
      effects:[{ resolution:{ un_works_administration:"table" } }, { move:{ "actor.earth_host":4 } },
               { wire:"COMMONWEALTH TABLES A JOINT ADMINISTRATION OF THE WORKS AT THE UNITED NATIONS" }],
      result:`The resolution is tabled for the Assembly's next sitting, with Kenya's name beside the Commonwealth's.` }
  ]},

] });
