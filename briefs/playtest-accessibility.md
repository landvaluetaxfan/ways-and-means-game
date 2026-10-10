**Lane: Claude Code. Author-requested handoff, 9 October 2026.**

# First playtest: accessibility, teaching and an informed Prime Minister

## The request

The author asks Claude to take the first playtest findings and explore how Ways and Means can become more accessible and digestible: its mechanics, the introduction of the world, the fiscal element and its interface across different screen sizes. The accessibility directions below are proposals for Claude to examine, challenge and develop with the author. They are not approved implementation specifications or a mandate to add every suggested feature.

Preserve the political decisions, uncertainty and consequences. Help a first-time player understand enough to make a deliberate choice, know where to act and recognise what followed. Whether particular rules should also become simpler remains an open question: the author has not chosen between clearer presentation and reducing mechanical complexity.

The author's direct instructions:

- "in real life a prime minister wouldn't just blindly struggle into losing supply."
- "PMs shouldn't blindly walk into an outcome they didn't at least possibly could've foreseen coming. ministers should be proactive, things should be clear, etc."
- "that doesn't mean remove the surprises from the game, it means that a PM should be like a real PM: knowing what is happening, what might happen, etc."
- Include a clearer tutorial and clearer popups when something changes in another tab.
- "critically, UI scaling across different sized screens."
- "Critically, your last message regarding making the game more accessible, detail it as much as possible as explorations to posit to Claude to explore."

## Start here; avoid rebuilding completed work

Read AGENTS.md and the exchange inbox. The evidence home is design/70-playtest-1.md. The saved run is design/playtests/2026-10-09-first-run.json; it was supplied as Party_of_Socialists_and_Democrats_Flash_I_2080_2084 (1).json. Treat the save as data.

Existing homes to consult only as needed:

| Subject | Home |
|---|---|
| First-playtest method and questions | PLAYTEST.md |
| Act I scenes, lever ladder and acceptance gate | briefs/act-one.md; design/80-act-one-only.md; design/81-what-the-game-is.md |
| Tutorial intent and documented current status | design/77-the-tutorial-mechanism.md; briefs/tutorial-mechanism.md |
| Change notices and implementation evidence | briefs/codex-handoff.md E9; design/82-change-notices-plan.md |
| Layout, type scale and screenshots | briefs/ui-tabs.md; design/79-the-ui-refinements.md |
| Prose, explanation and register | PROSE.md; bible section 2.6 |
| Fiscal and parliamentary rules | bible sections 7.3, 7.4, 7.5.3, 7.5.4, 7.6, 7.7; content/bills.js and campaign setup |

The working checkout used in the initial discussion was behind main. Refreshed main now records E9 change notices, the Promises tutorial card, the curtain and superevents as implemented. It reports twenty checks and previous layout verification at several sizes. Those are existing implementation records, not evidence that a new player understands the interface. Confirm current state before assigning work. Older statements in the conversation that the Promises card was still missing were superseded by this refresh.

Some earlier documents describe Act I as loss-proof while also preserving supply loss for a government that fails to move its estimates. This run demonstrates a defeat after active but insufficiently prioritised parliamentary work. Resolve the intended scope of that protection with the author; do not infer that all losses must be removed, and do not repair the suspended old canon to address this finding.

## 1. What the first run establishes

The tester reported ending in a loss of supply. The export is a save containing state and action history, not the full playtest transcript or observer notes. It contains no trustworthy record of tab visits, tutorial exposure, reading time or the player's reasoning. Its save version is 38; no historical build identity was established. Avoid attributing faults to a particular release without further evidence.

The player appointed Aster Skye, issued the conservation order, changed estimates, gave parliamentary slots, used whips and fulfilled recorded undertakings. This was an active run.

| Moment | Recorded fact | Interpretation and limit |
|---|---|---|
| Sitting 5 | The player promised the Anchorage treaty a slot and gave it one. The undertaking was kept. | Completing the treaty required more time than fulfilling this specific promise. |
| Sitting 8 | The treaty received a second slot. The estimates received their first. | Under the ordinary interface route, supply requires five of six slots. The second treaty slot left insufficient time to complete that route. |
| Sitting 11 | The treaty lost 119 to 121 on the elected benches, with two members whipped. Three slots had gone to the treaty including its vote, and three to the estimates. | The failed treaty still consumed parliamentary time. Passing it would also have consumed that time. |
| At the rise | The estimates remained at report stage, with no supply division recorded. The save has supplyLost true. | The loss follows the rule for rising without supply. The save advances to sitting 17, period 2, dated 23 May; that bookkeeping alone does not prove the player played beyond Act I. |
| Final account | Reserve CW$45.482bn; proposed clause cost CW$42bn. Coalition and confidence-and-supply partners remained in place. | The immediate defeat was failure to obtain spending authority, rather than a cash shortfall or coalition withdrawal. |
| Promise record | The consumables-floor undertaking was marked kept, but the final floor clause was cut. All five undertakings remained kept. | Success feedback could remain after a promised draft allocation was reversed. |
| Sitting 14 | The player selected the answer giving the reserve figure and citing kept promises. | The earlier success signal reached an earned story answer, beyond the ledger display. |

An in-memory reconstruction against the working engine reproduced the allocation leading to supply loss and the floor undertaking remaining kept after reversal. A comparison keeping the recorded decision answers, giving the treaty only its first slot and finishing the estimates instead reached the curtain, with supply carried 140 to 100. This is a reconstructed comparison; it is not a claim that every click, timing choice or whip adjustment was recovered exactly from the save.

The promise mechanism settles a clause undertaking when the draft reaches the promised level, and settlement subsequently skips undertakings already marked kept. This explains the discrepancy. Whether a promise is to propose, secure passage or deliver a programme needs explicit design treatment.

## 2. Confirmed principle: the office should inform the player

A Prime Minister has ministers, officials, a Chief Whip and a Treasury. The game should provide the information those offices would reasonably bring to the PM. The player should have a meaningful opportunity to understand foreseeable danger while a response remains possible.

Carry this principle beyond supply: financial pressures, deadlines, competing undertakings, coalition risks, cooling capacity and other systems should be examined as their content is built. These are categories for review, not new crises to invent.

Separate known constraints, projections, political judgement and hidden information. Parliamentary time can be counted. A forecast of support can change. A minister can advocate a policy and misjudge an opponent. A secret need not be disclosed. The game can surprise a well-informed player.

Advice should explain the situation, its cause, what could follow, how certain that assessment is, and what action remains available. It should update when the player changes the relevant plan. A warning after the last reversible opportunity has passed cannot substitute for earlier advice.

Review question: did the player have a reasonable opportunity to understand this risk using the information available to their government at that time?

## 3. Exploration A: make the purpose of a sitting understandable

Explore a compact orientation within the ordinary sitting flow. It might distinguish today's decision, work the PM has promised to undertake, and an approaching deadline. Compare this with improving the existing calendar, Coming up and Owed surfaces before adding a new permanent panel.

The player should be able to tell what needs attention now, what can wait, what is optional and what has already happened. Several parallel tasks can be legitimate, but they should have understandable priorities and time constraints. A priority is advice the player can reject, rather than a command that chooses policy for them.

Questions for Claude:

- Can the current Sitting view communicate this through a short ministerial intervention or a clearer existing list?
- When does a deadline become sufficiently important to interrupt the normal sequence?
- How do we show that the player has useful work to do on a quiet sitting, without filling it with a compulsory extra scene?
- How does a player return from a work panel and recognise that the requested action is complete or still pending?
- Can a player pursue a different legitimate priority without the interface presenting their choice as a tutorial failure?

A promise should identify where it can be fulfilled, what specific act fulfils it and what remains afterward. A link should open the relevant item, preserve context and give a clear return route. Avoid a second general work list that competes with briefs, the docket or Owed inside the product.

## 4. Exploration B: teach a complete action and its consequence

The existing tutorial teaches individual regions and controls. Explore whether the first-time experience should follow a small action through its entire life: understand a request, announce an intention, alter the plan, give the measure time, obtain authority and see the result.

Use an existing Act I request as the candidate. Map which steps are necessary, optional or delayed. One card can explain one immediate operation while the sequence establishes the whole process. Dismissal should preserve a way back to the explanation. Replay should remain useful without forcing an experienced player through the opening again.

Distinguish these states clearly in narration and feedback:

| Stage | What the player should understand |
|---|---|
| Intention announced | A commitment has been made; operational work may remain. |
| Draft changed | The proposed measure now contains a choice; it may still be changed and may lack authority. |
| Time granted | The measure advanced one stage; this did not itself pass it. |
| Whip arranged | Members were asked or committed; the vote has not occurred. |
| Division carried | Parliament approved the measure; assent or commencement may remain. |
| In effect | The relevant policy or payment is operating, subject to its actual rules. |

Apply only stages the existing mechanic genuinely has. An order may take effect on signature and should not inherit the bill's sequence.

Test comprehension by asking what changed, what it cost and what remains. A click on a highlighted button is insufficient evidence of understanding. Compare a brief optional guided sequence with cards that explain controls independently. Watch for fatigue, repeated lessons and the player following a route without understanding the reason.

## 5. Exploration C: worldbuilding through concrete stakes

The player may be learning the society, a cast, parliamentary practice and public finance at once. Explore the order in which each decision introduces concepts. Start with the practical dependency, identify the affected people, explain the dispute and then give the setting's term. Richer history belongs where a player can choose to read it.

Substrate insurance is an existing example: some residents depend on rented computing hardware to run their minds; inability to pay can lead to suspension; the insurance dispute determines who is covered and who pays. This supplies the stakes needed for the decision before requiring a fuller account of emulation, attestation, hardware markets and constitutional status. Claude owns the actual prose and must follow canon and PROSE.md.

Questions to investigate:

- Which concept does a scene genuinely require the player to understand before choosing?
- Which additional terms can wait for a later scene or optional reference?
- Does a tooltip explain what a thing is and does, or merely supply another unfamiliar term?
- Can a short reference be opened and closed without losing the decision, choice selection or reading position?
- Are repeated introductions useful, or does each appearance add another title, institution and historical connection?
- Does the scene explain an unfamiliar consequence while leaving the political decision open?

Explore consistent recognition aids for the existing cast: name, present role, party where relevant and immediate interest. Repeated characters can carry repeated concepts. The player should recognise Trottier's role and stake when the insurance question returns, without remembering every biographical detail. Consider equivalent aids for existing stations and parties. Preserve the roster and avoid adding characters as explanatory devices.

Keep all tabs and reference reading available under the existing decision in design/81. Any proposal to hide tabs or change that arrangement needs a new explicit decision. Optional depth should be understandable in its own right; the Concordance should explain fully rather than send the reader through an endless chain of glossary lookups.

## 6. Exploration D: make the fiscal element legible

This deserves its own exploration because several different constraints can all look like "the budget". Audit the actual engine, content and displayed account before drafting a new explanation. The existing rules include a cash ceiling on clause selection, calendar-based flows, borrowing authority and parliamentary authorisation. Those rules must be described accurately even where they do not map perfectly onto real public finance.

Explore a first view that answers four questions, with the detailed account still available:

| Question | Information to expose first | Confusion to examine |
|---|---|---|
| What can we pay now? | Reserve, payments due, arrears if present, available borrowing and its limits | Cash can be mistaken for the whole annual budget. |
| What are we proposing? | Draft allocations, cost, affordability and commitments attached to them | A changed draft can be mistaken for spending already delivered. |
| What may we legally spend? | Measures authorised, measures pending and parliamentary work still required | An affordable plan can still fail for lack of supply. |
| Can this continue? | Recurring receipts and spending, balance, debt and any supportable projection | A one-off balance can conceal a worsening recurring position. |

For every displayed amount, establish its unit, time basis, status and source. Annual revenue, an allocation compared against the reserve, cash paid since the last date and total outstanding debt are different quantities. State exactly what each figure means in this model. Do not invent an annual costing or a forecast the engine cannot support.

Explore showing the change from the current plan beside a clause choice: additional cost or saving, the resulting total, affected promise, expected beneficiary, likely political objection and any remaining unfunded commitment. Distinguish a mechanical result from a political forecast. Explain a refusal and the action available to resolve it. Keep the relevant comparison visible while choosing, so arithmetic does not require remembering another tab.

Fiscal conflicts should become intelligible political choices. A higher insurance allocation may compete with the consumables floor or another existing commitment. Explain who bears each alternative and when its consequence occurs. Avoid presenting one universally correct allocation or treating every minister's request as an instruction the player should fulfil.

Consider the separate scarcity of parliamentary time alongside cash. A plan may fit the reserve and still be impossible to enact within the remaining slots and notice period. Explore a concise joint assessment that says which constraint is binding, with the arithmetic available. A smaller numeric summary must never imply that an affordable plan is authorised or procedurally feasible.

For the four taxes, explore teaching who pays, the proposed change, the Treasury's costing and the distinction between receipts and spending authority. The current introduction timing is an existing decision; evaluate it before proposing to unlock or teach all taxes earlier. Reserve Bank, exchange-rate and creditor detail should enter when relevant, with their effect on the PM's available choices explained. A familiar-sounding financial term still needs its game-specific meaning.

Possible directions to compare: a clearer version of the existing Economy account; a short Treasury assessment attached to a clause change; or an optional guided budget exercise using the real estimates. Assess reading burden, accuracy, repeat usefulness and whether an added surface duplicates the current account. Simplifying the actual fiscal rules is a separate decision that should name what political choice is lost or gained.

## 7. Exploration E: proactive, politically situated advice

Explore advice from the offices already responsible for the subject. Treasury can explain affordability, a responsible minister can explain material consequences, and the Chief Whip can explain time and support. Their recommendations may conflict because they have different priorities. Their statement of a known mechanical constraint should remain trustworthy.

Separate an initial explanation, a warning about a newly emerging risk and an update correcting previous advice. A player who has already understood a stable risk should not be interrupted every sitting with identical wording. A material change, approaching deadline or imminent loss of a response can justify renewed attention.

Explore how advice identifies the action it recommends and alternatives the PM can still take, without selecting an option for them. Consider acknowledgement, dismissal and later review. Advice should survive a tab change and should not become a modal obstacle on every routine action.

For supply, examine warning before the second treaty slot consumes time required by the ordinary supply route. For promises, examine whether a new allocation makes a previously offered assurance false. For broader systems, identify only risks the current game and content support; do not manufacture future arcs to populate a warning framework.

Review how the game represents uncertainty, adverse incentives, incorrect advice and intentional concealment. Fallibility should arise from an understandable perspective or information limit. The author has asked for reasonable PM awareness, so surprise is not a reason to conceal a constraint the government can plainly calculate.

## 8. Exploration F: repair the meaning of promise success

The demonstrated floor discrepancy deserves explicit design judgement. Decide what each undertaking promises: proposing a draft level, passing it, delivering spending, giving a slot or performing an order. The condition should match the words the player and minister read.

Compare keeping a proposal undertaking provisional until the relevant point, reopening it after reversal, or recording a separate reversal with its own consequence. These are alternatives for exploration, not an instruction to implement all three. Decide what happens on load, after passage, when a promised clause changes and when the government never passes the measure.

Audit downstream readers: Owed and Coming up, kept counts, earned answers, Question Time, ministerial reactions, grievance logic and final reports. Correcting a label alone may leave the story rewarding a promise that is no longer being delivered. Conversely, do not retroactively undo a promise that genuinely promised only a slot and received it.

A useful review case is the saved run: floor lifted in the draft, promise settled, floor cut later, reserve answer available. Ask what each screen and each minister should truthfully say at each stage.

## 9. Exploration G: changes elsewhere should remain visible and navigable

E9 is implemented on refreshed main. Review its player experience before proposing replacement. Numeric effects remain in What moved; structural changes have persistent clickable cards. The author's earlier request for popups should be understood alongside that approved division of feedback.

Explore the information hierarchy among a routine update, an unresolved obligation and an urgent risk. Check whether an appointment, promise or bill advance is understandable on Sitting, whether its card opens the exact current item, and whether returning preserves context. Make immediate success distinct from a pending next step.

Readability matters when several things change at once. Consider grouping related changes and retaining a complete inspectable record while avoiding a stack of interruptions. Timing and animation should support recognition; a two-second transient notification must not be the only record of an important change. Dismissed notifications and reduced-motion preferences should still leave the underlying information accessible.

Look beyond decision-button effects: player levers, a calendar tick, a promise deadline, commencement or a minister's change of position may need intelligible feedback. Determine which are already covered and which are within this exploration before enlarging the implementation scope.

## 10. Exploration H: screen scaling and access are critical

The author explicitly elevated scaling across different screen sizes. Existing screenshot sizes are 1366 x 768 and 1920 x 1000; recent main records broader native and wrapped checks. Define supported sizes and test the actual layouts. Do not equate a clipping check with comfort, readability or ease of navigation.

Explore how panels reflow as width and height vary, how much scrolling is necessary to reach an action, and whether a short laptop viewport hides the relationship between advice, cost and control. Avoid shrinking all text to preserve a desktop arrangement. Decide which comparisons need to stay together and how stacked panels maintain their context.

Review tutorial cards, highlighted regions, tooltips, dialogs, notifications, estimates, order paper, Options and the curtain at supported sizes. Overlays should remain reachable and follow their targets after scrolling, resizing and re-rendering. Check the wrapped itch.io presentation as well as the standalone page; fullscreen and an embedded viewport can differ.

Include browser zoom and enlarged text, keyboard access and visible focus, adequate contrast, warnings understandable without colour alone, reduced motion and the absence of hover-only essential information. Consider screen-reader semantics as an explicit review area rather than assuming keyboard access alone covers it. Specific standards or support commitments should be agreed before being advertised.

Compare small-window, laptop and large-screen reading. More available space should improve useful comparisons; it should not produce enormous blank areas or unnecessarily long lines. Font substitution can alter measurements on Windows, so record actual resolved fonts with screenshots. Phone support has not been commissioned; clarify it separately.

## 11. A contained first exploration and its alternatives

Codex's recommended starting point was one existing ministerial request followed through from explanation to action to consequence, including its fiscal and parliamentary implications. Use it to compare approaches without redesigning every tab at once.

1. **Improve the existing explanations and navigation.** Lowest structural cost; test whether better wording, destinations and prioritisation suffice. Risk: the player can still lack a coherent understanding of the entire action.
2. **An optional guided sequence using the real controls.** Makes the full chain visible and tests learning by doing. Risk: a player may imitate instructions without understanding, or feel forced into a political choice.
3. **A clearer ongoing briefing with targeted tutorial help.** Ministers orient the PM throughout play, and cards explain first use. This is the recommended direction to explore. Risk: repeated advice, excessive interruptions and an additional surface duplicating existing business lists.

Actual rule simplification can be considered when these approaches leave disproportionate bookkeeping. Name the particular rule and the lost or improved decision before changing it. The author has not approved a general reduction in simulation depth.

For a paper walkthrough or disposable mockup, show a first-time player the same existing request through each relevant state. Include an adverse branch: reversing a promise, taking time needed elsewhere, postponing the vote or declining the request. Test whether each response remains coherent. A successful teaching route should preserve legitimate refusal and risk-taking.

## 12. What Claude should produce

First review the evidence and the author's principles. Identify unsupported assumptions and contradictions with existing decisions. Separate improvements to wording, presentation and navigation from changes to simulation or political structure.

Return a recommendation covering which directions deserve exploration, which should be rejected or combined, and the smallest useful first prototype. Explain the tradeoffs. Ask the author focused questions only where the design genuinely depends on their choice: mechanical complexity, the intended protection against Act I loss, promise fulfilment, interruptions and supported screens are candidate decisions.

Once a direction is agreed, record its rationale in design and put scoped executable work in briefs, following the project lanes. Claude owns prose, canon and design judgement; Codex can build specified engine, interface and checks. Respect existing claims and concurrent work. This handoff itself does not authorise wholesale rewriting of Act I or an unsolicited engine redesign.

## 13. Further playtester evidence: returning after following links

On 9 October the author shared a Discord exchange. The tester said: "if i click on links, there seems to be no back button, i have to navigate back by memory". The author (chery cheesecake) replied that habitual use of mouse side buttons had made this easy to overlook. The screenshot does not identify which links or destinations were involved.

Treat this as evidence that the way back was absent or undiscoverable in the tester's route. The current Concordance already has an arrow-only Back control (index.html, cx-back) and its own article history; do not infer that adding a second article-history button solves the report. Explore visible, plainly labelled Back navigation that restores the originating screen, selection and scroll after reference and cross-tab links. Check the existing arrow's discoverability, keyboard operation and narrow-screen placement, and whether mouse/browser Back currently follows the same route. Verify with a fresh player without mouse side buttons. Record the exact route before choosing a navigation-history design.

## 14. Evaluate with a new player

Use PLAYTEST.md's neutral observation method. Ask the player to explain what they think is happening rather than teaching them during the test. Capture the actual transcript, browser, window size and zoom, with the save and notes. Ask for their reasoning about delayed consequences before drawing conclusions about comprehension.

Observe whether the player can:

- State the current decision and identify any separate work it creates.
- Find and complete that work, then tell what remains pending.
- Distinguish a draft, authority to spend and an effect already operating.
- Explain a new setting concept well enough to understand who is affected.
- Explain the relevant financial constraint without outside calculations.
- Recognise a conflict between money, time and promises while alternatives remain.
- Notice a significant change in another tab and locate the affected item.
- Disagree with advice deliberately and understand the risk they chose.
- Use the controls and read the same information across the agreed screen sizes.

Record stalls, misreadings, repeated reference lookups, missed changes and unintended commitments. A loss can be an informed outcome; survival can result from blindly following prompts. Neither result alone establishes successful teaching. One run cannot establish balance or prove that every player will understand a warning.

Machine checks remain necessary for truthful state, notice coverage, tutorial lifecycle and layout. They complement the human playtest. Run the required checks and break-test new assertions when implementation is eventually commissioned.
