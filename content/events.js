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

];
