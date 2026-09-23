/* =============================================================
   FLASH I — THE CAMPAIGN (placeholder scaffold, NOT WIRED)

   SUPERSEDED, and kept as a record. This was the scaffold written before
   Flash I was built; the campaign is now the files beside this one, and
   design/35 is the author's own plan. Several figures here are older than
   the build (solvency is a reserve in MW-years now, not 0-100).

   This file is example content in the vein of the author's plan. It is
   loaded by NOTHING: index.html does not name it.
   Every block here is flat prose for the author to replace, and every
   mechanic is annotated against the engine that already exists or the
   one small piece it proposes.

   -------------------------------------------------------------
   THE FOUR METERS (setup.scalars; two are new)

     DL   legitimacy          NEW. The House and the stations behind you.
                              0-100. Low = strikes and no-confidence.
                              The author's call: the two existing
                              domestic meters stay separate —
                              party_loyalty (the caucus) and
                              public_standing (the country) — and
                              legitimacy is a third, the campaign's
                              own measure of the government being
                              believed. Events move all three.
     SS   solvency            treasury RENAMED (bible 7.6 amendment).
                              0-100. The state's ability to pay
                              obligations as they come due: the
                              reserve, the emergency facility, the
                              debt it assumes. "Solvency" rather than
                              "treasury" because the campaign makes
                              the number about credit and default, not
                              about a purse; the deeper question of
                              whether the value is an index or a
                              denominated quantity (design/13 5) stays
                              open either way.
     DF   friction            NEW. Earth's governments and banks
                              against you. Drives embargo risk and
                              import costs. 0-100. High = sanctions,
                              frozen accounts.
     LSM  thermal_margin      the life-support margin that already
                              exists, renamed in prose only. The
                              death-line stays at 0: the government
                              falls when the stations go dark.

   THE DRIFT RULE (LANDED: `move` with a `trend.` namespace)

     Micro-decisions alter TRENDS, not totals. {move:{"trend.lsm":-2}}
     leans the number that much each sitting; tick() applies it, and it
     clamps at plus or minus ten. Cutting water recycling reads as a
     slow leak rather than an instant crisis.

   COMPOUND TRIGGERS (engine: free)

     One bad meter = a manageable crisis (a single gated event). Two bad
     meters = the severe political emergency (an event whose `when`
     carries both). The `when` vocabulary already does this:
     { scalarBelow:{ solvency:35000, legitimacy:35 } }.

   THE CASCADE (engine: free, via flags + queue)

     Failing a trajectory check drops the situation one tier per turn:
     each tier is a flag, and the check event queues the next tier's
     event with `{queue:{ event:"f1_tier_N", after:1 }}`. Time to pivot
     before meltdown.

   PANIC BUTTONS (engine: free)

     Martial law, executive decrees, emergency loans: high-cost events
     gated on the bad state. Costs are real numbers: martial law is
     {move:{legitimacy:-100}} and the loan is {undertake:{...}} with a
     brutal `onBreach`.

   THE SIX TIERS (content/settlements.js, rank-ordered)

     Critical Triumph, Standard Victory, Pyrrhic Compromise, Managed
     Stalemate, Strategic Capitulation, and Systemic Meltdown — which is
     a LOSS, not a settlement (3.5.1 rule 3), so it lives in the cascade
     and ends through the existing loyalty floor: the meltdown event
     applies {move:{party_loyalty:-100}} and checkLoss does the rest.

     LANDED: `settlement.terminal`. By default a settlement
     ENDS the run: checkEnd returns over:true, the closing prose shows,
     and the session is recorded. That is correct for a game whose
     endings ARE settlements. The canon Pyrrhic tier is different: it
     resolves the CRISIS, not the CAMPAIGN. `terminal:false` records
     the tier in `st.resolvedAs` (not `settledAs`, so the `settled`
     condition stays quiet) and the run continues to the election,
     where chapter three's result event reads which tier landed
     through the `resolvedIs` condition. The meltdown is not a
     settlement at all: it is a loss, and ends through the loyalty
     floor, so no flag is needed there.
   ============================================================= */

/* ---------------- the six tiers as settlement skeletons ----------------
   `when` thresholds are the plan's own numbers. Closing prose is the
   author's; these are one flat line each so the mechanism can be read. */

const FLASH_I_TIERS = [

  { id: "f1_triumph", rank: 0,
    name: "Orbital Powerhouse",
    terminal: true,
    summary: "Full annexation. Earth drops the debt claims under threat of satellite transit tariffs.",
    when: { scalarAbove: { legitimacy: 75, solvency: 70000 },
            scalarBelow: { friction: 60 } } },

  { id: "f1_maritime", rank: 0,
    name: "Maritime Charter",
    terminal: true,
    summary: "International courts recognise salvage rights. The platform becomes legal Federation territory.",
    when: { scalarAbove: { legitimacy: 55, solvency: 60000 },
            scalarBelow: { friction: 40 } } },

  { id: "f1_pyrrhic", rank: 1,
    name: "Sovereign Debt Trap",
    /* THE CANON ENDING. Non-terminal: it leads to the election, not the
       credits. LANDED: terminal:false records the tier in st.resolvedAs
       and checkEnd returns over:false, so the run continues. */
    terminal: false,
    summary: "Annexed, and 300,000 workers saved. The Federation assumes the defaulted corporate bonds.",
    when: { scalarAbove: { legitimacy: 65, friction: 65 },
            scalarBelow: { solvency: 35000 } } },

  { id: "f1_joint", rank: 2,
    name: "UN/Orbital Joint Mandate",
    terminal: true,
    summary: "A co-administered international free trade zone. No embargo, no territory, mild voter apathy.",
    when: { scalarAbove: { legitimacy: 40, solvency: 40000, friction: 40 },
            scalarBelow: { legitimacy: 60, solvency: 60000, friction: 60 } } },

  { id: "f1_capitulation", rank: 3,
    name: "Corporate Re-Entry",
    terminal: true,
    summary: "The Federation declines the referendum. Earth corporate security reclaims and clears the platform.",
    when: { scalarBelow: { legitimacy: 35 },
            scalarAbove: { friction: 75 } } }
];

/* ---------------- the referendum chain (three beats) ----------------
   Flat placeholder prose. Speaker ids are real characters; the events
   themselves are unwired and will not fire. */

const FLASH_I_EVENTS = [

  { id: "f1_stranded", chapter: 2, weight: 90, once: true,
    title: "Three hundred thousand",
    speaker: null,
    body: `PLACEHOLDER. The platform's host corporation abandons it. Three hundred
thousand workers, a debt, and a station whose air scrubbers have two months.
The Earth government's repatriation plan is fully funded and takes two years.`,
    choices: [
      { label: "Send the survey team.",
        effects: [{ flag: "f1_surveyed" }, { wire: "FEDERATION SURVEYS THE ABANDONED PLATFORM" }],
        result: "PLACEHOLDER: the survey's first return is the scrubber schedule." },
      { label: "Wait for Earth's process.",
        effects: [{ move: { legitimacy: -5 } }, { wire: "PM: THE REPATRIATION PLAN IS EARTH'S TO RUN" }],
        result: "PLACEHOLDER: the outer stations read the delay as an answer." }
    ] },

  { id: "f1_referendum", chapter: 2, weight: 88, once: true,
    when: { flags: ["f1_surveyed"] },
    title: "The vote",
    speaker: "ceyhan",
    body: `PLACEHOLDER. The workers vote to join the Federation: the two-year
repatriation, the medical burden of returning to gravity, and the accounts
frozen overnight all get a line in the report.`,
    choices: [
      { label: "Recognise the referendum.",
        effects: [{ flag: "f1_referendum_carried" }, { move: { friction: 10 } },
                  { wire: "FEDERATION RECOGNISES THE PLATFORM REFERENDUM" }],
        result: "PLACEHOLDER: Earth's banks are reading the same wire." },
      { label: "Decline to recognise it.",
        effects: [{ move: { legitimacy: -8 } }, { move: { friction: -3 } }],
        result: "PLACEHOLDER: the strikes start on the outer habitats." }
    ] },

  { id: "f1_dilemma", chapter: 2, weight: 86, once: true,
    when: { flags: ["f1_referendum_carried"] },
    title: "The dilemma",
    speaker: "fenwick",
    body: `PLACEHOLDER. Absorb the platform and take its industrial capacity, its
life-support bill and the embargo risk over the defaulted debt. Or decline,
keep the short term, and explain the strikes.`,
    choices: [
      { label: "Move to annex.",
        effects: [{ flag: "f1_annexing" }, { move: { "trend.friction": 3 } },
                  { move: { solvency: -6000 } },
                  { wire: "GOVERNMENT MOVES TO ANNEX THE PLATFORM" }],
        result: "PLACEHOLDER: the annexation bill is set down." },
      { label: "Hold the line.",
        effects: [{ move: { "trend.legitimacy": -3 } },
                  { move: { friction: -4 } }],
        result: "PLACEHOLDER: the outer habitats have heard the answer." }
    ] },

  /* ---------------- one drift micro-decision ----------------
     The plan's worked example: decreasing water recycling funding does
     not crash anything. It leans on the life-support margin, a little,
     every turn, until somebody notices. */

  { id: "f1_water", chapter: 2, weight: 60, maxFires: 2,
    when: { flags: ["f1_annexing"] },
    title: "The recycling line",
    speaker: "vellan",
    body: `PLACEHOLDER. The Minister for Life Support brings the platform's water
recycling estimate: it holds, or it does not hold, and the difference is a
funding line that will not be felt for a month.`,
    choices: [
      { label: "Fund it in full.",
        effects: [{ move: { solvency: -3000 } }, { move: { "trend.lsm": 1 } } ],
        result: "PLACEHOLDER: the margin improves, a point at a time." },
      { label: "Trim it and take the margin.",
        effects: [{ move: { solvency: 2000 } }, { move: { "trend.lsm": -2 } } ],
        result: "PLACEHOLDER: nothing happens. That is the point of a drift." }
    ] },

  /* ---------------- one panic button ----------------
     The emergency loan: visible, expensive, and the only way back from
     the cascade. A promise with a brutal onBreach, not a free undo. */

  { id: "f1_loan", chapter: 2, weight: 84, maxFires: 1,
    when: { scalarBelow: { solvency: 30000 } },
    title: "The emergency loan",
    speaker: "hatt",
    body: `PLACEHOLDER. The Alliance of Business and Government will carry the
Commonwealth's short position, at a rate, for a term, on a condition. The
condition is the platform's mining leases.`,
    choices: [
      { label: "Take the loan.",
        effects: [{ move: { solvency: 18000 } }, { move: { legitimacy: -10 } },
                  { undertake: { id: "f1_debt", text: "Honour the emergency facility",
                                 post: "treasury", by: null,
                                 onBreach: "f1_debt_called" } }],
        result: "PLACEHOLDER: the solvency line recovers. The promise does not recover." },
      { label: "Refuse the rate.",
        effects: [{ move: { legitimacy: 3 } }, { move: { "trend.solvency": -1000 } } ],
        result: "PLACEHOLDER: a solvent government would have refused it. This one is not solvent." }
    ] },

  /* ---------------- the meltdown (a LOSS, not a tier) ----------------
     The compound trigger: friction critical AND the margin critical AND
     solvency critical. The event is the cascade's last rung and it ends
     through the existing loyalty floor, not a new loss condition. */

  { id: "f1_meltdown", chapter: 2, weight: 98, once: true,
    when: { scalarAbove: { friction: 85 },
            scalarBelow: { thermal_margin: 20, solvency: 20000, legitimacy: 20 } },
    title: "The cascade",
    speaker: null,
    body: `PLACEHOLDER. The embargo lands. Life support fails. The vote of no
confidence is tabled while the chamber is still arguing about the water.`,
    choices: [
      { label: "It was always going to end somewhere.",
        effects: [{ move: { party_loyalty: -100 } }],
        result: "PLACEHOLDER: the government falls. The terminal writes GAME OVER." }
    ] }
];
