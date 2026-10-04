**Lane: Codex.** Written 4 October 2026 by Claude from the author's decisions
(`design/68-leverage.md`: read it first, then bible §7.6 as revised, `design/62`,
and `LESSONS.md` "Engine"). This is steps 1 and 2 of design/68's build order.
Steps 3 to 6 (terms at the whip, claims raising matters, cashing claims, the
panels) are later briefs. **Plan first**: write `design/74-claims-plan.md` (every
place `undertakings` is read or written, with file and line; the claim shape; the
save change and migration; the tests) and commit it, then build.

## Why

A concession or a post leaves nothing behind but a number. Nobody holds a claim,
nothing calls it in, nothing remembers it across four years. The author decided
(4 Oct): the numeric ledger thins across an interval; **named claims never
fade**; a broken claim becomes a grievance, which is the evidence the legacy
reads. Today's `undertakings` already are a named claim with a holder and a date,
so they are generalised, not replaced.

## Step 1: undertakings become claims (no change in play)

Keep `st.undertakings` and every verb that writes it (`undertake`, the discharge,
the breach), and add to each entry:
- `holder`: a party id, a current id, or a cabinet post id;
- `kind`: `promise` (the default, so every existing entry is one), `concession`,
  `post`;
- `direction`: `owed` (by the player, the default) or `due` (owed to the player);
- `expects`: what the holder expects, in plain words (defaults to the entry's
  `text`);
- `limit`: optional `{ when: <condition>, then: <effects> }`, the line past which
  the holder acts;
- `origin`: the decision, offer or term that made it.

The existing `state` stays (`open`, `broken`, `met`), and add `called` (the holder
has asked, a matter is open). A **broken** claim also writes a **grievance**: a
claim with `direction: "against"` held by the same holder, so the legacy and the
Relations panel can read promises broken as a list. Do not build the panels.

`licensing carve-out` (grep `carve` and SI 2080/45 in
`content/campaigns/flash_i/`) is the first claim: it must look the same in play
and read as a claim in state. `briefs/opening-playable-slice.md` Batch A builds on
it, so do not change its content here.

Bump `STATE_VERSION` to **36** with a migration block that fills the new fields
from the old entries. Schema (`js/schema.js`), editor (`js/editor.js`) and
`js/serialise.js` must know every new field, and `test.js` fails if schema and
engine differ.

## Step 2: the fade, with a synthetic interval

`setup.fade` (content-owned; a fraction per interval, default 0.5 for the
ledger). Build `Engine.fadeLedger(st, C, span)`: the numeric `capital[partner]`
moves toward zero by that fraction across `span`, and **claims do not move**. It
returns what moved, as `{ party, before, after }` rows for the interval report.
Do not call it from the sitting loop: `briefs/interval-engine.md` is building the
interval that calls it, in a parallel branch. Register it there by exposing it as
`Engine.fadeLedger` and say so in the commit. Prove it with a synthetic interval in
`test.js`: a ledger of +3 and a promise made, a call to `fadeLedger`, the ledger
down and the promise untouched.

## Measure

- `node tools/playtest.js --seeds 80` before and after: **identical**. A claim's
  new fields must not change play.
- `npm run guards` reaches the canon; `npm run check`.
- Break the fade (make it move claims) and watch the new test fail.
- Rebase on main before landing: another Codex branch also bumps `STATE_VERSION`
  (37 and 38 are reserved for the others). Keep your number even if theirs lands
  first; gaps are harmless. If you merge main and `STATE_VERSION`'s comment line
  conflicts, keep both entries in ascending order.

Claim the brief first (`node tools/exchange.js claim leverage-claims --lane codex
--files js/engine.js,js/schema.js,js/editor.js,js/serialise.js,test.js`) and push the
claim alone. Delete this brief in the commit that finishes it and release the claim.

## Answers to your questions (Claude, 4 Oct evening: build now)

1. **Fulfilled state:** keep `kept`, in state, content and tests. Add `called` beside
   it. design/68 now says `kept`.
2. **Holder:** a party id, a current id, a cabinet post id **or a lobbying actor id**
   (`payLobby` owes to an actor). Record `holderKind` (`party`, `current`, `post`,
   `actor`) beside it. Do not map an actor to a party or post.
3. **Origin:** `null` until explicitly authored. Do not thread a source through
   `apply()`. The migration sets `null` for every existing entry.

No further approval is needed. Proceed to build.
