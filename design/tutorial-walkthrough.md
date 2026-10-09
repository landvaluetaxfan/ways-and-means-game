# Tutorial walkthrough, 9 October 2026

The author's approved endpoint is Bellamy's first superevent, currently the Act I curtain.
This pass completes the interface route and teaching of the current controls. It does not expand
the story or change simulation rules. New tutorial/interface prose is plain draft text for Claude's
register review. The screenshot gallery is the starting point for the author's evening walkthrough.

## What changed

- Sitting now names currently eligible unread lessons in its ministerial brief. The first is visible;
  Other lessons opens the rest. A link opens that exact lesson and selects its bill where required.
  Opening a lesson neither performs its action nor records it as read. Got it or Esc records reading.
- The question marks, individual Options review, skip preference and profile progress remain in use.
  Future lessons stay out of discovery. At an ending, automatic cards and discovery stop; introduced
  explanations remain readable in Options.
- Order-paper time waits for the order-paper scene, when Grant opens. The time, order-paper and
  division explanations now distinguish stage advances from the separate final vote and its slot.
  They state that the House must carry supply to authorise spending.
- Clauses explicitly change the draft estimates. The account distinguishes reserve cash from
  spending authority. Money calls has its own explanation and highlights the borrowing controls.
- Opening a lesson reveals its target. Resizing brings an entirely off-screen target back into view.
  Bill-linked lessons identify the selected bill, and the content reference survives editor renaming.

## Route to review

These sitting numbers describe today's campaign, not implementation triggers. Gates follow scenes
and state so Act I can grow. `node tools/tutorialwalk.js` repeats this route through the actual page,
choosing the Ivarsen promise to exercise Owed and granting the estimates time before the rise.

| Lesson | First available on this route | Trigger / focus |
|---|---|---|
| The rise | 4 | Estimates scene; calendar |
| Order-paper time | 4 | Order-paper scene; Government time |
| The order paper | 4 | Order-paper scene; Chamber list |
| A promise is on the record | 5 | Actual promise row; Coming up/Owed |
| The estimates' clauses | 6 | Cooling scene; estimates selected |
| Orders | 6 | Ember Ridge scene; available orders |
| The whip | 11 | Count scene; estimates selected |
| The division | 11 | Count scene and estimates at third reading |
| The account | 15 | Underwriters scene; account |
| Money calls | 15 | Underwriters scene; borrowing controls |

The route carries the estimates, reaches the Bellamy curtain and stops automatic teaching. Each
lesson's navigation is compared against the saved simulation state and must leave it identical.
Promises can occur on a different route; a player who gives none has no promise lesson to read.
An unread division explanation remains in Options after its temporary third-reading gate closes.

## Questions for the evening and Claude

1. Does the Sitting prompt sit at the right level of prominence? Check it beside real ministerial
   advice and Owed. It must help discovery without competing with urgent business.
2. Does the order-paper lesson give enough warning of the final division? A more expanded Act I
   could give the player a supervised first advance and a later count, with explicit ministerial
   advice about remaining time. The tutorial itself should not advance or vote for the player.
3. Which fiscal concepts need separate teaching once Act I expands? Current coverage introduces
   draft expenditure, cash, authority and borrowing. Tax drafting, interest/payment schedules,
   lender consequences and the distinction between annual flows and cash balances deserve deliberate
   scenes and explanations, not a longer account card.
4. There is a wider fiscal interface issue: `clausePanel` can remain editable after assent, and tax
   chips call the selected draft rate “in force” even though changing a draft does not enact a law.
   Claude should settle the intended post-passage workflow and wording. This pass does not alter
   fiscal rules or use a tutorial to suggest that editing an assented draft changes current law.
5. Treasury-vacancy has a registered tutorial region but no card. The current scene appoints the
   minister through a decision. Add a vacancy lesson when an actual player appointment workflow
   is introduced; do not teach an unavailable action now.
6. Worldbuilding stays attached to scenes and the Concordance. As scenes expand, introduce the
   minister, institution or setting term when it affects the player's business, then provide optional
   reference depth. Avoid turning each mechanics card into another lore page.

## Verification

- `npm run check`: 20/20 passed in 208.12 seconds with two parallel readers.
- `node tools/tutorialwalk.js`: all ten lessons reached at introduction, each navigation leaves the
  simulation save identical, estimates carried and Bellamy's specific curtain reached with teaching off.
- New discovery regressions failed before implementation, then passed. The existing rename check
  caught the new bill reference, failed on the stale id, then passed after reference registration.
- `node tools/playtest.js --seeds 80`: before/after output byte-identical, 12 strategies and 960 runs.
- Real Edge browser: all ten cards at 1366×768, 1024×640 and 683×384; cards and dismissal buttons
  remain within the viewport and targets remain visible. Eight-size game/editor layout matrix, native
  and wrapped tabs, 28 page loads: no findings. Windows resolved Arial Narrow, Arial and Consolas
  where the preferred Linux fonts were absent; Segoe UI, Georgia and Bodoni MT resolved directly.
- 23 gallery screenshots cover before/after discovery and changed explanations, every current lesson,
  short windows, Bellamy and individual review. Source is the real game, with saved states from the route.
- Final read-only review found no production issues. Its ending-assertion finding was addressed by
  verifying the specific Bellamy curtain, the supply flag and a carried appropriation.
