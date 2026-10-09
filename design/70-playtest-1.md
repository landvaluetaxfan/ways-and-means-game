# First playtest: an informed Prime Minister

Recorded 9 October 2026. Source: the first playtester's exported save, Party_of_Socialists_and_Democrats_Flash_I_2080_2084 (1).json, and the author's response to its analysis. No observer notes or full transcript were supplied.

## Author's finding

The author: "in real life a prime minister wouldn't just blindly struggle into losing supply."

The government should receive clear advice when its use of parliamentary time threatens supply, while there is still an opportunity to act. The player may knowingly risk or lose supply; the advice should make the consequence understandable before the choice commits them. Success feedback about promises must reflect whether the government still intends to deliver them.

## General principle: an informed Prime Minister

The author extended this finding beyond supply on 9 October 2026: a Prime Minister should know what is happening and what might happen, with ministers giving proactive advice. Supply is the first observed example of a broader requirement.

The player should receive the information their office would reasonably provide. They should understand the current situation, foreseeable consequences, significant uncertainties and the opportunities still available to act. They should be able to take a risk knowingly, reject advice or make a costly decision.

- Ministers should bring emerging problems, approaching deadlines and conflicts between commitments to the Prime Minister's attention, early enough for a meaningful response. Advice should update when the situation changes.
- Explain what is happening, why it matters, what could follow and what the government can still do. Distinguish a known constraint from a forecast, a minister's judgement or an unresolved uncertainty.
- Make the consequences of a consequential choice clear before it closes off an option. Important risks should reach the player through the ordinary course of governing; finding a detail in another panel should not be the sole way to learn what the government would already know.
- Keep the advice, promise ledger and other success signals consistent with the government's actual position. A changed plan may invalidate earlier reassurance.
- Preserve surprises, incomplete information, disagreement and fallible advice. Ministers need not know secrets or predict every event. A foreseeable risk may still produce an unexpected result, and a genuinely unforeseen development can still surprise the government.

The review question is whether the player had a reasonable opportunity to understand the risk with the information available to their government at the time. A bad outcome can follow an informed decision. Warnings need not guarantee the result or prevent the player from proceeding.

## Evidence

| Moment | What the save records | What it suggests |
|---|---|---|
| Sitting 8 | A second slot went to the Anchorage treaty. The estimates required five of the period's six slots through their normal stages and division; the treaty had now taken two. | The consequence of spending this slot needed to be clear before it was spent. |
| Sittings 8 to 14 | The undertaking to lift the consumables floor to CW$30bn was marked kept. The final estimates cut that floor, yet the undertaking remained kept, and the player could choose the Question Time answer citing kept promises. | Selecting a promised draft level permanently settles the undertaking. Subsequent reversals leave misleading reassurance in the ledger and the story. |
| Sitting 11 to the rise | The treaty lost 119-121. Three slots had gone to the treaty and three to the estimates, which stopped at report stage. The government later lost supply. | The defeat follows the time budget. The save alone cannot establish what warnings the player noticed or understood. |

Against the current engine, a reconstruction using the recorded answers and allocation reproduced the supply loss and the floor promise remaining kept after reversal. A comparison that gave the treaty only its first slot, fulfilling the slot promise, and finished the estimates reached the Act I curtain.

This is a playtest finding for the author and subsequent interface and engine briefs. The form of the advice and the treatment of reversed promises remain to be specified.

## Related requirements and the author's screen-scaling emphasis

The author confirmed on 9 October that this discussion also includes clearer teaching, visible feedback for changes in other tabs, and, critically, UI scaling across different screen sizes. These requirements are already recorded in the following homes; this section connects them to the playtest finding without replacing their briefs.

- **Clear tutorial:** design/77-the-tutorial-mechanism.md and briefs/tutorial-mechanism.md specify contextual cards, one mechanic at a time, highlighting the relevant region and dimming the rest. The refreshed main branch records the mechanism and the Promises card as implemented; the author's browser review and any marked revisions remain the acceptance work. The existence of the mechanism does not establish that the teaching is clear to a first-time player.
- **Visible changes across tabs:** briefs/act-one.md, Stage 1 finding 3 and E9, require notices on Sitting that name the affected tab and item and open the item when clicked. design/82-change-notices-plan.md retains numerical changes in What moved and gives structural changes persistent clickable cards. Refreshed main records E9 as implemented. Notices must describe actual changes and must not silently omit changes because a transient popup limit was reached; their effectiveness with a new player still needs review.
- **UI scaling:** the author explicitly identified adaptation to different screen sizes as critical. The interface should remain readable and operable as available width and height change, with controls and important information accessible and overlays positioned correctly. Existing requirements in briefs/ui-tabs.md and design/79-the-ui-refinements.md call for before-and-after screenshots at 1366 x 768 and 1920 x 1000; briefs/act-one.md also requires layout checks at those sizes. Further supported sizes remain to be specified; this note does not establish a phone-support commitment.

These are recorded requirements and documented status, not a fresh verification that the current build satisfies them.

## Claude handoff

The consolidated brief is [Playtest accessibility exploration](../briefs/playtest-accessibility.md). The source save is preserved at [first-run JSON](playtests/2026-10-09-first-run.json). Read the handoff for the distinction between observed evidence, the author's requirements and proposals still to explore.
