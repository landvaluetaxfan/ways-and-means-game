# 72 — Witnessed acts: implementation plan

**4 October 2026.** Implements design/71 and bible §1.0 (LOCKED). No OPEN
canon governs this mechanic. The existing counsel vocabulary is thin about
appointments, so an appointment is dissent only when an open matter explicitly
names a different appointment; otherwise it is unadvised.

## The single writers

| Act | Writer | Facts passed to `Engine.witness` |
|---|---|---|
| Money call | `borrow`, `js/engine.js:6922` | lender id, owner's post, amount, facility room before the draw, reserve before the draw, slot cost |
| Statutory instrument | `makeInstrument`, `js/engine.js:2469` | instrument id, author post, procedure, slot cost, revocable |
| Initiative | `take`, `js/engine.js:8180` | initiative id, post, cost including tempo, irreversible, tempo |
| Appointment | `fillPost`, `js/engine.js:2695` through `appoint` at 2655 | post id, nominated holder, previous holder, counsel relation |
| Order-paper grant / bill | `grantSlot`, `js/engine.js:2405` | bill id, owning cabinet post if authored, stage, slot cost |
| Forum order | `tableResolution`, `js/engine.js:1009` | resolution id, owning post if authored, forum, slot cost |

The last two normally have no cabinet `post` and are silent by design/71.
`appoint` is also used by other effects, so witnessing belongs at the player's
`fillPost` path to avoid attributing scripted appointments to the player.

## Weight and counsel

One deterministic hook, `Engine.witness(st,C,{kind,id,post,facts})`, runs after
each successful writer and before the matching matter is closed. It inspects
open matter remedies first. An owner's own remedy is `advised`: always a
receipt, never a question. A different minister's remedy in a contested
matter is `dissent`: the owner states that dissent in the record. Everything
else is `unadvised`. A missing post is silent.

`setup.witness` owns the numerical cutoffs and plain default reply strings.
Proposed defaults: money becomes notable at 10% of pre-draw facility room or
25% of pre-draw reserve, and grave at 50% of room or 100% of reserve;
instruments get one weight point for affirmative procedure, one for a cost of
two or more slots, and one if irrevocable; initiatives likewise get one for
two or more slots and one if irreversible; appointments get two when against
explicit counsel; bill and order starts get one for a slot cost of two or
more. Zero is routine, one notable, two or more grave. Dissent gets a reply
even at zero. A content rule may override weight, owner, reply, or question.
Advised acts bypass the grave threshold. No randomness enters this path.

## Content and the decision

`content/witness.js` exports ordered `WITNESS` rules with
`{id,campaign?,kind,match,weight?,owner?,reply?,question?}`. `match` checks
serializable act facts, not executable code. The first matching rule wins;
defaults in `setup.witness` cover every kind. A question is the id of an
ordinary queued event decision. Its event is declared alongside the rules
and appended to the event collection at the end, preserving existing seeded
positions. Each question has two to four choices; option zero states a
plausible, non-punishing purpose, and a later option gives no reason and
costs trust. Each choice creates an undertaking through `undertake` with
`by`, `discharge`, and `onBreach`. If leverage claims (version 36) have landed
when this is built, use a promise claim held by the owner's post on the same
answer path. Queue a second question for a later sitting; never ask two in
one sitting. Replies go to the log and a brief memo, with the minister's
holder resolved from the current cabinet. Store the instrument reply by
instrument id for its Document view.

Register `WITNESS` in `content/index.js`, the schema, and the editor. Browser
and harness script lists must load `content/witness.js` before `content/index.js`.
The editor must preserve and serialize the rules and witness decision entries.

## Save and migration

Bump `STATE_VERSION` to **37** with one ascending migration block. Add
`st.witness` with the last question sitting, pending question references,
the next-brief replies, and instrument memo replies. An older save starts
with empty witness state, without replaying old acts. Do not renumber 37 if
versions 36 or 38 land first; resolve the migration and comment in numerical
order when rebasing.

## Verification

Record the 80-seed sweep before and after. Add engine tests for all six
writers, advised receipt, contested dissent, silence without a post, weight
thresholds, one question per sitting with deferral, save migration, purpose
discharge and breach. Add a playtest policy that takes an unadvised lever and
checks witness behavior. Update UI tests for one-click money and instrument
actions, feed, brief, and Document memo. Break one new assertion before
trusting it. Run guards, check, and layout after the interface changes.
