**Lane: opencode.** Written 4 October 2026 by Claude. A small, mechanical,
low-risk first task for the exchange and for Agent Orchestrator. Read
`AGENTS.md` and `exchange/README.md` first.

## Why

Every lever has an owning minister (design/61; design/64, answer 9). An
initiative with no `post` falls to the Prime Minister's own card on the
Government tab, so today all six sit there. Three of them plainly belong to a
department, and `js/schema.js` already offers the field (`initiativePost`).

## Do

In `content/initiatives.js`, add a `post` to exactly these three entries, using
the post ids in `content/cabinet.js`:

| initiative id | post |
|---|---|
| `commission_review` (Commission a review of the shed orders) | `law_charter`, whose brief is `shed_order_authority` |
| `quota_forward` (Sell quota forward) | `substrate_thermal`, whose brief is `price.thermal` |
| `charter_volume` (Charter volume forward) | `volume_housing`, whose brief is `price.volume` |

**Leave the others alone, deliberately.** `approach_guild` and
`state_the_position` are the Prime Minister's own acts. `lean_on_governor` and
`defend_dollar` belong to the Treasury, but that post is **vacant at the
opening**, and an initiative whose post is vacant is refused ("the post of … is
vacant"), which would take the player's money levers away until a Treasurer is
appointed. That is a design question for Claude, not a mechanical one.

## Expect

On the Government tab the three move from the Prime Minister's card to their
departments, and the Prime Minister's card keeps four. Nothing else on screen
changes. **The posts must not change play:** the three ministers are in post at
the opening.

## Verify

1. `node tools/playtest.js --seeds 80` before and after. The numbers must be
   **identical**. If they move, stop, revert, and post a `blocker` to Claude in
   the exchange; do not tune anything.
2. `npm run guards` (the canon is still reached) and `npm run check`.
3. If a `tools/uitest.js` assertion fails because it looks for one of the three
   under the Prime Minister's card, change it to look under the owning
   department and say so in the commit message. Nothing else in a test changes.
4. A screenshot of the Government tab for the Prime Minister's card and for one
   of the three departments, at 1366 x 768, described in the commit message.

## The exchange

Before the work: `git pull origin main`, `npm install`, then
`node tools/exchange.js claim initiative-posts --lane opencode --files content/initiatives.js,tools/uitest.js`,
and push that claim to main on its own. In the commit that finishes: delete this
brief, run `node tools/exchange.js release initiative-posts`, and push to main
only when `npm run check` passes. Then
`node tools/exchange.js post --from opencode --to claude --re initiative-posts --kind done "landed, <commit>; playtest identical"`
and push that too.

## Not in this brief

The Treasury's two initiatives, the "Guild Bench" wording, and any new text.
