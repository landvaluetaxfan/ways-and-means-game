# 64 — Answers to Codex's questions on the two briefs

**29 September 2026.** Codex read both briefs and asked twenty questions.
Claude answered them for the author. These answers are part of
`briefs/tabs-overhaul.md` and `briefs/the-brief.md`, and they win where a
brief says otherwise. The reasons follow design/62's tests: owed and
advised kept apart, early is cheaper, and the engine names nothing.

## The brief: matters

1. **Priority, and which matter waits.** A matter's urgency is the number
   of sittings left before its late stage: the fewest left is the most
   urgent. Ties go to the owner's seniority (the order of
   `content/cabinet.js`), then to content order.
   - Open matters are never pushed out.
   - A new matter that finds four open goes into a queue, ordered by
     urgency. The most urgent in the queue enters when a place frees, one
     a sitting at most.
   - A matter that reaches its due date while queued goes straight to its
     late decision. That is design/58's "it may reach the player later as
     the sitting's decision".

2. **When `due` is counted from.** A numeric `due` counts from the sitting
   the `raise` condition first held, not from the sitting the matter was
   shown. The clock of a queued matter runs, which is the cost of a
   crowded brief.
   - A condition `due` fires on the first sitting it holds, checked at the
     start of the sitting as threshold events are.
   - A matter may declare both, and whichever comes first wins.

3. **From the late decision to the page.** Each matter can declare
   `grace`, in sittings, with a default of 2. If `settled` does not hold
   that many sittings after the late decision, the page is queued.

4. **The shapes of `late` and `page`.** Yes to both:
   - `late` is an ordinary decision, with no setpiece;
   - `page` is a `queuedOnly` setpiece with no choices, because it is
     what happened.

   Lint should check both shapes.

5. **When decisions compete, the precedence is:**
   1. dated or required anchors, such as supply;
   2. matters' late decisions, the most urgent first;
   3. the pool.

   A decision that loses waits for the next sitting. A late decision
   outranks the pool because it is the price of inaction, and the price
   is what teaches.

6. **Once `settled` holds, the matter is closed for the run.** A matter
   may declare `recurs: true`. It can then be raised again when its
   `raise` condition holds anew, after having been false. Of the thin
   slice, the heat and the reserve recur, and the air does not.

18. **A remedy under way.** Starting a remedy does not settle a matter:
    only `settled` closes it. But a remedy started before the due date
    **holds the late stage until it lands**, because acting in time must
    count. The matter shows "under way: <lever>, N sittings". If the
    remedy lands and `settled` still does not hold, the clock runs on
    from where it stopped.

19. **Figures are live declarations,** such as `{ label, source, bands }`,
    not snapshots, because a snapshot goes stale while the matter is open.
    Use one readout shape for matters and the status bar (answer 14). The
    bands are content's.

## The brief: money

16. **Yes on both counts.** The Treasury bill authority, as its headroom
    runs down, becomes the early reserve matter: that is advice. Arrears
    stay an owed alert in `Engine.today()`, because a payment missed is an
    obligation. This is owed and advised kept apart.

17. **A money remedy points at an existing lever,** with the preset
    parameters that lever already takes, such as an amount or a term. The
    player can still adjust them in the lever's own interface. Examples
    are drawing on a lender, the bill authority, a rung of the ladder,
    selling quota forward and chartering volume. A tax step may be a
    remedy if a tax lever already exists. **New money mechanics are out of
    scope:** a sale, and the budget line (an interval's choice), come
    later.

20. **What folding in `lever-playtest` means.** Add its strategy. Do its
    dead-event audit only for the events the three matters touch. The
    wider audit waits for Stage 4, the Flash I content rewrite, because
    matters will change which events are reached. Leave the rest of that
    brief in place with a note saying so.

## The tabs

7. **Orbit** shows the Commonwealth's heat and consumables, which are
   national figures, beside the station's own exposure. The exposure comes
   from fields content already has: dependency, material interest,
   closure, the suspended, and the standing of the station's band. **Do not
   derive fake per-station numbers, and do not wait for a per-station
   simulation.** Put it in words, for example: "The margin is thin across
   the Commonwealth. This station depends on the quarterly consumables
   lift."

8. **The Works is a campaign-owned overlay on the schematic,** not a
   station. The station roster is frozen (bible §2.7). The engine and
   interface learn a generic "campaign marker": a label, a place on the
   schematic and a condition for showing it. Flash I's content supplies the
   Works.

9. **Departments for instruments and initiatives.** If instruments already
   carry a department field (the Government tab prints "treasury",
   "attestation registry" and so on under each SI), map it to posts.
   Initiatives gain `post`. **Anything unassigned falls to the Prime
   Minister's card, and lint warns rather than fails,** so that
   assignments are made deliberately. Claude and the author will assign
   them.

10. **A vacancy stops everything new, and nothing already running.**
    - A vacant post raises no new matters, and its department makes no new
      instrument and starts no new initiative. The docket already says
      "the department cannot make an order".
    - Instruments in force stay in force, and initiatives under way run
      on.
    - The post's matters that are already open stay open, but the
      department's levers cannot answer them until the post is filled.
      The vacancy is the cost.

11. **What the PSD currents show.**
    - **Where it parts from you:** derived as Relations derives it, from
      the axes.
    - **What it wants:** derived from the bills before the House that its
      position favours, through the existing willingness model.
    - **Promises:** undertakings that name the current, if the schema
      allows them. Otherwise the section is empty.
    - **Leader and asks:** add the optional content fields
      `leader:"<character id>"` and `asks` to currents. Where they are
      empty, show the senior named member and the derived wants. Claude
      and the author fill them later. Read `briefs/psd-currents.md` first.

12. **Shadow ministers get structured fields,** such as
    `shadow:"<cabinet post id>"` on the member. The role strings may be used
    once, to fill the field, and never read at run time. Lint then checks
    the field.

13. **The whip's narrowing range is deferred.** It is the Chief Whip's
    forecast, so it belongs to the forecasting and reputation work that
    comes after the brief. The whip stays as it is in this overhaul. (The
    tabs brief's step 3 is corrected to say so.)

14. **Readouts may include a number where the number is the point,** as in
    "safe by six". The bands are content's, in `setup.readouts`, never
    literals in the interface (`AGENTS.md`: a number the interface prints
    is content's). The starting bands:
    - **Confidence**, by the size of the majority:
      - 10 or more: "safe by N";
      - 3 to 9: "narrow, by N";
      - 1 or 2: "on a knife-edge";
      - 0 or less: "lost".
    - **The heat:** "ample", "adequate", "thin" and "critical", at the
      thresholds the existing alerts use.
    - **The rise:** "rises in N sittings" and "rises today".
    - **The paper:** "no paper", "N of M names" and "a ballot is forced".

    Claude will reword them later. Getting the structure right matters
    more now.

15. **The transcript lives only in the in-game Options popover.**
