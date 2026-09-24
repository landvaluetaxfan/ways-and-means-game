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
  /* THE ONE SET PIECE IN CHAPTER TWO (design/31). A turn the world takes,
     not a decision the player makes — which is the test for whether an
     event earns the whole screen. The sections are the frame's, the prose
     here is a first pass and wants the author's hand. */
  setpiece:{ mood:"threat", sections:[
    { kind:"lede", body:"Cordell has walked away from the Bellamy Almanac Works." },
    { kind:"body", head:"What the Commonwealth is being asked",
      body:"The charter is suddenly an orphan, and the people under it are not." },
    { kind:"voices", head:"What is being said",
      body:[{ said:"They filed a return in the spring and nothing since.",
              who:"The Spindle" }] }
  ] },
  title:"A hundred and eighty-four thousand",
  speaker:null,
  body:`Cordell has abandoned the Almanac Works, and the debt has not. A hundred
and eighty-four thousand people are on it with two months of air, and Kenya's
repatriation plan is fully funded, legally complete, and two years long.

The Works has voted. The question is what the Commonwealth says.`,
  choices:[
    { label:"Send the survey team.",
      effects:[{ flag:"f1_surveyed" }, { wire:"FEDERATION SURVEYS THE ABANDONED PLATFORM" },
               { queue:[{ event:"f1_referendum", after:4,
                          label:"The survey team reports from the Almanac" }] }],
      result:"The survey's first return is the scrubber schedule. The second is the debt." },
    { label:"Wait for Earth's process.",
      effects:[{ move:{ "legitimacy":-5 } }, { wire:"PM: THE REPATRIATION PLAN IS EARTH'S TO RUN" }],
      result:"The outer stations read the delay as an answer, and it is not the one they wanted." }
  ]},

{ id:"f1_referendum", chapter:2, queuedOnly:true, once:true,
  title:"The vote",
  speaker:"ceyhan",
  body:`The workers have voted to join the Commonwealth, and Ceyhan's column
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
               { queue:[{ event:"f1_dilemma", after:3,
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
kept the leases, and left the parent's exposure at nothing. Every step of it was lawful.

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
      result:"The annexation bill is set down. Acting is popular at home; Earth notices, a little more, every sitting." },
    { label:"Hold the line.",
      effects:[{ move:{ "trend.legitimacy":-3 } }, { move:{ "friction":-4 } }],
      result:"The outer habitats have heard the answer, and they will repeat it back every sitting." }
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
  body:`The Minister for Life Support brings the platform's water recycling
estimate. It holds, or it does not hold, and the difference is a funding line that will not be felt for a month.`,
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
    /* REPAYABLE (the author, 23 Sep). The promise had no discharge, so it
       always broke, and its breach named an event nobody had written, so the
       debt was never called either (design/34 D1). It is repaid through the
       `repay_facility` initiative, and if it is still owed when the House
       rises the Alliance calls it. The sum owed is on the account as a
       named creditor, principal and printed rate together, and the promise
       is kept when that balance is nothing, however it got there. */
    { label:"Take the loan.",
      effects:[{ move:{ "solvency":18000 } }, { move:{ "debt.alliance":19800 } },
               { move:{ "legitimacy":-10 } }, { flag:"cordell_leases_pledged" },
               { undertake:{ id:"f1_debt", text:"Repay the emergency facility",
                             owed_to:"hatt", post:"treasury", by:null,
                             discharge:{ repaid:"alliance" },
                             onBreach:"f1_debt_called" } }],
      result:"Eighteen thousand MW-years reach the reserve. The facility is repayable at nineteen thousand eight hundred before the House rises, and the Cordell leases stand as its security until then." },
    { label:"Refuse the rate.",
      effects:[{ move:{ "legitimacy":3 } }, { move:{ "trend.solvency":-1000 } }],
      result:"A solvent government could have refused it. This one is not solvent, and refusing costs a little, every sitting." }
  ]},

/* the meltdown: a LOSS through the loyalty floor, not a settlement */
/* REACH: the collapse after the freeze. It needed friction above 85, which
   nothing short of repeated borrowing reached, with all three floors
   breached at once. It follows the freeze now: a frozen government that
   lets the quarrel run past 78 while the margin, the reserve and its
   standing give way together falls. A loss, not a settlement (design/34 D4). */
{ id:"f1_meltdown", chapter:2, weight:98, once:true,
  /* the last floor: it needs the two before it (the tier fall, below
     shed_order_published) and cannot come while the emergency order stands */
  when:{ flags:["f1_frozen", "f1_second_floor"], flagsAbsent:["f1_emergency"],
         scalarAbove:{ friction:78 },
         scalarBelow:{ thermal_margin:20, solvency:20000, legitimacy:30 } },
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
/* THE TRAP'S CONSEQUENCE, NOT A THRESHOLD. This waited for friction above
   70, and the annexation's own ramp, abating by the setup's trendDecay, tops
   out at exactly 70 -- so the freeze, the debt trap's one escalation beat and
   the thing the indemnity initiative insures against, never came in any run
   (design/34 D4). It now follows the Sovereign Debt Trap itself, unless the
   government has brought the quarrel back under 60 since. */
{ id:"f1_accounts_freeze", chapter:2, weight:87, once:true,
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
    { label:"Say it for the Commonwealth: competence, not sentiment.",
      effects:[{ move:{ "legitimacy":6 } }, { move:{ "actor.earth_bloc":-5 } },
               { move:{ "friction":3 } },
               { wire:"PM SPEAKS TO THE HABITATS; EARTH SERVICES CALL THE TONE 'MANAGERIAL'" }],
      result:"The Commonwealth hears a government in command. Earth hears a government that has stopped being polite." },
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

The victory is real and it is expensive. No cheaper one was on offer.`,
  choices:[
    { label:"Read the final numbers.",
      effects:[{ wire:"RETURNS COMPLETE: THE GOVERNMENT IS RETURNED ON THE PYRRHIC TICKET" }],
      result:"The numbers are read. The chapter closes." }
  ]},

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
  }))},

/* THE FACILITY, REPAID. The answer to the `repay_facility` initiative. The
   Alliance offers to keep the line open, which is a standing call on the
   Commonwealth's short position with the Alliance's name on it. */
{ id:"f1_facility_closed", queuedOnly:true, once:true,
  title:"The facility is closed",
  speaker:"hatt",
  body:`The emergency facility is discharged, and the Alliance of Business and Government has no further claim under it: in cash from the reserve, or in the Cordell leases, as the Treasury chose.

Hatt offers to keep the line open as a standing facility on the same terms, drawn only when the Commonwealth asks for it.`,
  choices:[
    { label:"Keep the line open.",
      effects:[{ flag:"abg_standing_line" }, { move:{ "loyalty.gb":4 } }, { move:{ "legitimacy":-2 } },
               { wire:"ALLIANCE HOLDS STANDING LINE ON COMMONWEALTH SHORT POSITION" }],
      result:"The Alliance holds a standing line on the Commonwealth's short position, on the terms of the emergency facility." },
    { label:"Close it.",
      effects:[{ move:{ "legitimacy":3 } }, { move:{ "loyalty.gb":-2 } }],
      result:"The Commonwealth owes the Alliance nothing and has no line with it." }
  ]},

/* THE FACILITY, CALLED. Queued by the breach of `f1_debt` when the House
   rises with the facility unpaid. The default margin is the agreement's. */
{ id:"f1_debt_called", queuedOnly:true, once:true,
  title:"The facility is called",
  speaker:"hatt",
  body:`The emergency facility was still owed when the House rose, and the Alliance of Business and Government has called it. The sum due is twenty-one thousand six hundred MW-years: the principal, the printed rate, and the default margin of ten per cent the agreement sets.

The security is the Cordell leases. The Alliance will accept the leases in settlement, or the sum from the reserve.`,
  choices:[
    { label:"Pay it from the reserve.",
      when:{ scalarAbove:{ solvency:21599 } },
      effects:[{ move:{ "solvency":-21600 } }, { move:{ "debt.alliance":-19800 } },
               { move:{ "legitimacy":-2 } }, { flag:{ cordell_leases_pledged:false } },
               { wire:"TREASURY PAYS CALLED FACILITY IN FULL FROM THE RESERVE" }],
      result:"The reserve pays the Alliance in full, and the Cordell leases stay with the Commonwealth." },
    { label:"Let the Alliance take the leases.",
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
  when:{ flags:["f1_frozen"], scalarAbove:{ friction:70 }, scalarBelow:{ thermal_margin:30 } },
  title:"The first floor gives",
  speaker:"girard",
  effects:[{ flag:"f1_first_floor" }],
  body:`The frozen accounts have reached the radiators. Coolant imports are paid for twice, once in quota and once in delay, and the margin on the ring is falling faster than the Treasury's model says it can.

This is the first of three floors under the government. The last one is the House.`,
  choices:[
    { label:"Ration the ring ahead of the shed order.",
      effects:[{ move:{ thermal_margin:3, public_standing:-3 } }],
      result:"The ring runs cooler and louder. The margin buys a sitting or two." },
    { label:"Hold the line and say nothing.",
      effects:[{ move:{ legitimacy:-2 } }],
      result:"Nothing changes today, which is the point and the danger." }
  ]},

{ id:"f1_brink_2", chapter:2, weight:97, once:true,
  when:{ flags:["f1_first_floor"], scalarAbove:{ friction:75 },
         scalarBelow:{ thermal_margin:25, solvency:30000 } },
  title:"The second floor gives",
  speaker:null,
  effects:[{ flag:"f1_second_floor" }],
  body:`The reserve no longer covers what the sanctions cost, and the margin is inside the range where the engineering authority sheds without being asked.

One floor is left under the government. The Cabinet Office has drafted the order that would hold it up.`,
  choices:[
    { label:"Leave the order drafted and unsigned.",
      effects:[{ move:{ legitimacy:-2 } }],
      result:"The emergency order is on the Prime Minister's desk, unsigned." },
    { label:"Concede something to Earth's banks in public.",
      effects:[{ move:{ friction:-3, legitimacy:-4 } }],
      result:"The concession is small and printed large. The quarrel eases by a point or two." }
  ]},

/* the Meltdown's pivot, answered */
{ id:"f1_emergency_declared", queuedOnly:true, once:true,
  title:"The emergency order",
  speaker:null,
  body:`The order is signed. Assembly on the ring is restricted, movement between stations needs a permit, and the House may not remove the government while the order stands.

The Commonwealth has not done this before, and everyone in the chamber knows it.`,
  choices:[
    { label:"It is done.",
      effects:[{ wire:"PRIME MINISTER SIGNS EMERGENCY ORDER; HOUSE MAY NOT REMOVE GOVERNMENT WHILE IT STANDS" }],
      result:"The government stands, and nobody can say it stands on consent." }
  ]},

{ id:"f1_emergency_lapses", queuedOnly:true,
  title:"The order runs out",
  speaker:null,
  body:`The emergency order expires at midnight. The House sits again with its powers restored, and the first question on the order paper is whether the government should have had them.`,
  choices:[
    { label:"Let it lapse.",
      effects:[{ flag:{ f1_emergency:false } }, { move:{ legitimacy:10 } }],
      result:"The order lapses. Some of what it cost comes back; most of it does not." },
    { label:"Renew it for four sittings.",
      effects:[{ move:{ public_standing:-6, party_loyalty:-6 } },
               { queue:[{ event:"f1_emergency_lapses", after:4 }] }],
      result:"The order is renewed, and the renewal is the story." }
  ]},

/* the Pyrrhic tier's pivot, answered */
{ id:"f1_leases_sold", queuedOnly:true, once:true,
  title:"The leases are sold",
  speaker:null,
  body:`The Cordell mining leases have a buyer, and the proceeds go to the reserve. Earth's banks price the Commonwealth's risk a little lower the day the sale is announced.`,
  choices:[
    { label:"Announce it as prudence.",
      effects:[{ move:{ public_standing:1 } }],
      result:"It is announced as prudence. The Trades Left calls it a sale." }
  ]},

/* the Joint Mandate's pivot, answered */
{ id:"f1_zone_leased", queuedOnly:true, once:true,
  title:"The first fees are paid",
  speaker:"landry",
  body:`The free zone under the joint mandate is charging for its berths. The first carriers have paid, and the Commonwealth has an income from a platform it does not own.`,
  choices:[
    { label:"Report it to the House.",
      effects:[{ move:{ legitimacy:1 } }],
      result:"The House hears that the mandate pays, which it had been told it would not." }
  ]},

/* the Capitulation's pivot, answered */
{ id:"f1_minister_resigns", queuedOnly:true, once:true,
  title:"A resignation",
  speaker:null,
  body:`The Minister for External Relations resigns. The statement is four sentences long and takes responsibility for the platform in the second.`,
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
  title:"Earth's answer on the relays",
  speaker:"landry",
  body:`The European Union has answered the order holding back the relays. Its members have set the time their grids can run short of orbital power against the time the Commonwealth's stores of nitrogen and water can last on a reduced supply from the tethers.`,
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
  title:"The relays are back on",
  speaker:"landry",
  body:`The power relays and the maintenance crews are working normally again. The European Union has welcomed the decision and has not changed its own measures.`,
  choices:[
    { label:"Report it to the House.",
      effects:[{ move:{ public_standing:-1 } }],
      result:"The House hears that the relays are back on and that nothing was asked for in return." }
  ]},

] });
