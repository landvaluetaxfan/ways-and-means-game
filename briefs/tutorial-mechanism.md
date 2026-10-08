**Lane: Codex builds, Claude Code reviews and writes the steps.** Written 5 October 2026 from
the author's request; the spec is `design/77-the-tutorial-mechanism.md`. Read it first.

# The tutorial mechanism

**STATUS: BUILT by Claude Code, 8 October 2026; do not rebuild it.** `js/tutorial.js`, `css/tutorial.css`, `tools/tutest.js`
(the eighteenth check), a layout probe for the card in `tools/laycheck.js`, and eight Act I steps in
`content/campaigns/flash_i/campaign.js` (`setup.tutorial`). It differs from the plan below in three ways, all deliberate:
the taught record is in `Shell.opts.taught` (the player's, not the save's), so there was **no `STATE_VERSION` bump**; the
steps live in the campaign's `setup`, not in a new content kind, so the schema and editor are untouched; and the card watches
the shell with a MutationObserver, so `js/ui.js` has **no render hook**. The region registry is `Tutorial.REGIONS` in
`js/tutorial.js`. What is left of this brief: the "Promises" card (`owed`, held until the Owed list has a stable region),
and the author's read of the cards in the real browser. `briefs/codex-handoff.md` has the rest.

## What to build

1. **`js/tutorial.js`** (new, a plain `<script src>` like `js/tips.js`) and **`css/tutorial.css`**
   (new). The overlay: a dimmed layer with a pointer-blocking frame around the region and a
   live hole over it, a card beside it with title, body, the button, "Skip the tutorial", and
   Esc. It re-measures after every render, on resize and on scroll, and waits when its region
   is not on screen. It respects reduced motion and returns focus where it was
   (`js/focus.js`: read its header first).
2. **The region registry** in `js/ui.js`: a small table of named regions to selectors, and one
   call to `Tutorial.refresh()` at the end of the render. Touch nothing else in `ui.js`. The
   first regions: `order-paper-time` (the Government strip and the Chamber bar),
   `treasury-vacancy`, `calendar`, `order-paper`, `whip`.
3. **The content kind** in `js/schema.js`: `tutorial` steps with `id`, `when` (a condition,
   plus `onTab` and `done`), `region`, `title`, `body`, `voice` (optional character id),
   `once`. `test.js` fails if the schema and the engine's vocabulary differ, so add the
   entries there and in the editor's list. A campaign carries them in
   `content/campaigns/<id>/tutorial.js`, one `campaign("<id>", {...})` call.
4. **State**: `st.taught` (step id to the sitting it ran), beside `st.cxRead`, with a
   `STATE_VERSION` bump and its migration block (the next free number after 38; 37 is
   reserved for witnessed acts). The player's preference is `Shell.opts.tutorial`: `on`, `hints`
   or `off`, set in the Options popover, which also replays any step.
5. **One real step** in Flash I's `tutorial.js`: order-paper time, on the Government tab. Claude
   writes the rest.
6. **Prose registration** (and read `PROSE.md`, the Interface section, before writing any card text): the steps' text goes into `js/prosemap.js` so `npm run prose:check`
   still round-trips, and `tools/lint.js` holds it to `PROSE.md` like any other page.

## Checks

- **`tools/tutest.js`**, added to `npm run check` and to the checks table in `AGENTS.md` (the
  count of fourteen becomes fifteen). It asserts that every step's region resolves on its tab
  in a booted game; that a step fires once, in order, when its condition holds; that it
  waits on the wrong tab; that dismissing it records `st.taught` and a save and load does not
  repeat it; that `off` shows nothing; and that the overlay survives a re-render. **Break each
  assertion and watch it fail.**
- The other harnesses (`uitest`, `uxtest`, `layout`, the playtest) run with the tutorial off;
  `npm run check` and `npm run layout` pass, and `node tools/playtest.js --seeds 80` is
  byte-identical before and after.
- Screenshots of the card at 1366 x 768 and 1920 x 1000, on the Government tab, to the
  orchestrator.

## Leave alone

The Economy Money calls panel and the dialogs `integrate/witness` edits; Sitting and Chamber
drawing functions beyond the one render hook. Anything the brief did not foresee goes to the
exchange as a `question`, and you carry on with what does not depend on it.

## The Act I steps (Claude, drafted 7 October; Codex wires them once the schema lands)

One card per taught lever, in the order of `briefs/act-one.md`'s ledger. Each is written to
`PROSE.md`'s Interface section (what it is, what changes it, what to do; the words on the
screen; two sentences or three) and to the contract in `design/77`: a card fires once, when
its mechanic is first on screen, and the control is inert before it (E3). Regions marked
**new** do not exist yet. `when` is in the condition vocabulary plus `onTab`. Numbers come from
content through E5's placeholders when they land, and are named here by what they are.

| id | when | region | title | body |
|---|---|---|---|---|
| `calendar` | sitting 3 on, tab Sitting | `calendar` | The rise | The calendar counts the sittings left before the House rises for its recess. The estimates must be voted by then, or the government cannot pay its officials and falls. Press Rise until the next sitting to move to the next one. |
| `treasury-vacancy` | `a1_treasury` open, tab Government | `treasury-vacancy` | The Treasury has no minister | A post with no minister can make no orders and begin no initiatives. The Treasury signs the estimates and answers for them in the House. The sitting's decision is the appointment. |
| `order-paper-time` | **the one real step Codex writes**, tab Government | `order-paper-time` | Order-paper time | The government has a few slots in each sitting period, and they refill when the House rises for its recess. One slot moves one measure one stage nearer its vote. |
| `order-paper` | `a1_order_paper` seen, tab Chamber | `order-paper` (**new**: the Chamber's list of measures) | The order paper | Each line is a measure before the House, with the party that moved it and its stage. A measure passes five stages and is voted on at the last. Grant, on a line, spends one slot and moves that measure one stage. |
| `owed` | the first undertaking exists, tab Sitting | `owed` (**new**: the Owed list) | A promise is on the record | A promise goes on the Owed list with the sitting it is due and the way to keep it. Keep it where the list says. A promise that is broken is remembered, and the person it was made to acts on it. |
| `clauses` | `a1_cooling` seen, tab Chamber, the estimates open | `estimates-clauses` (**new**: the clause panel) | The estimates' clauses | Each clause has levels. Choosing a level changes the total beneath, and the levels together may cost no more than the reserve holds. To raise one clause, cut another. |
| `orders` | `a1_ember_ridge` seen, tab Government | `orders` (**new**: the minister's orders) | Orders | A minister makes an order under powers an Act has already given. It takes effect when made, without a vote, and stands unless the House votes against it within the sittings shown on the order. |
| `whip` | `a1_count` seen, tab Chamber | `whip` | The whip | Commit members to vote for a measure before it is voted on. A commitment costs capital with a partner or loyalty with your own party, and nothing is charged until the division, so the plan can be changed until then. |
| `division` | the estimates at third reading, tab Chamber | `divide` (**new**: the Divide button) | The division | Divide calls the House's vote on a measure at its last stage. The result is read out party by party. If the functional members object to a money bill, the vote is delayed by the sittings the House sets for an objection. |
| `economy-account` | `a1_underwriters` seen, tab Economy | `account` (**new**: the Economy account panel) | The account | The account shows what the Treasury receives and spends, the deficit, the reserve and what the Commonwealth owes. The Underwriters read these figures. Money calls, on this screen, borrow or repay. |

Two cautions for whoever wires them. The `treasury-vacancy` card says the decision is the
appointment because the Government tab's candidate list and `a1_treasury` write the same
effects (`guards.js` asserts it), and the scene is where the player chooses. And the `division`
card must not explain the objection before the player has met it: `a1_count` teaches it, so the
card fires after that scene and names only the delay.
