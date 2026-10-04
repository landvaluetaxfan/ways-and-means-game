**Lane: Codex.** Written 4 October 2026 by Claude from the author's decisions
(`design/71-witnessed-acts.md`, read it first, then `design/62` and bible §1.0).
**Reprioritised 4 Oct (evening), by the author:** build this now, in parallel
with `leverage-claims.md` and `interval-engine.md`; `opening-playable-slice.md`
Batch A waits. Step 0 has landed. Use `STATE_VERSION` **37** if the state changes
(36 and 38 are reserved for the other two); keep your number even if theirs lands
first, and keep the comment line in ascending order on merge. When the claims
branch is on main, an answer to a witnessed question should create a claim
(`kind: "promise"`, `holder` the owner's post); until then use plain undertakings.

The author, playing the Economy tab: "I can input 600000 into the Earth banks
money calls section ... and it gives me a disclaimer popup but nothing like an
advisor asking why I'm doing this." And of the register: "sort of the same thing
with the statutory instruments." Today the game asks "are you sure?" about
mechanics, and no person reacts to an act nobody advised. The decision: every
act is witnessed. A notable act gets an in-voice reply from its owner, a grave
or unusual one gets a real question whose answer is a stated purpose that binds
(an undertaking), routine acts stay silent, and it is built for every lever at
once with default weights.

**Plan first.** Write `design/72-witness-plan.md` (the lever writers you found
with file and line, the facts each act gives, the default thresholds you
propose, the content shape, the save change and migration, the tests) and
commit it. Then build, unless the plan raised a question that design/71 does not
settle; if it did, write the question into this brief and do step 0 meanwhile.

**Question from the Stage 4 plan (4 Oct):** Which concrete stated purposes
should the default grave money, instrument, initiative and appointment questions
offer, and what act discharges each? The existing undertaking conditions can
test repayment, a made instrument, a granted slot, a bill stage or a flag, but
they cannot test whether a draw was spent on its stated purpose. A generic
"keep the money for the stated use" choice would not bind without a new
condition and a named spending path. Please specify the purposes and their
discharge/onBreach effects, or approve a narrow first implementation using
repayment by the rise for money and act completion for the other kinds.

## Step 0: the money field (independent, small)

`drawMoneyCalls` (js/ui.js, near line 1377) renders
`<input type="number" ... data-money-amount>`. Today:
- "60,000" is rejected, because the field is `type=number`;
- 600000 is refused (`Engine.canBorrow`: "Earth's banks will not go past 60,000
  with this government") with Draw disabled, but the refusal is a rule's line;
- the amount is typed in millions while every figure shown is in billions.

Do, and keep every id and data attribute (`[data-money-amount]`, `[data-draw]`,
`.money-refusal`, `[data-money-call]`), because `tools/uitest.js` reads them:
1. Make the field `type="text"` with `inputmode="decimal"`. Parse "60,000", "60
   000", "60bn" and "60 bn" (bn means billions), reading a bare number as
   millions as now. Reject anything else with the existing refusal line.
2. Show the room left beside the field ("up to 60,000 left", from the facility's
   `limit` minus drawn) and a **Max** button that fills it.
3. Do not change the unit the handler works in (millions). Typing in billions is
   a later batch with its own review.
4. The field's look is done (4 Oct: the field colour, square, the data face, no
   spinner; `css/terminal.css`, `.money-call input`). Keep it when the type
   changes, and make Max a `.btn`.
5. Tests: "60,000" and "60bn" parse to 60000; "6o" is refused; Max fills the
   room; 600000 keeps Draw disabled.

New player-facing text here is only "Max" and "left". Name it in the commit.

## The build (after the plan)

**The hook.** One function, `Engine.witness(st, C, act)`, called by each lever's
one writer (grep `function makeInstrument`, the borrow function, the initiative
starter, the appointment function, the order and bill starters; AGENTS.md says
there is one writer for each). `act` is `{ kind, id, post, facts }`. It computes
the weight, evaluates content's rules, and queues the owner's reply or question
with the existing `queue` mechanism. The engine names no lever, post or lender.

**Content.** `content/witness.js` (registered in `content/index.js`, and in the
schema and editor like every collection): rules
`{ id, campaign?, kind, match, weight?, owner?, reply, question? }`. `setup.witness`
holds the thresholds and the default reply per kind, so every lever has a
default weight and reply until its own is authored. Weights:
- money: the amount as a share of the room left on the facility and of the
  reserve;
- instrument: affirmative or negative, slot cost, revocable or not;
- initiative: slots, irreversibility;
- appointment: against a minister's advice or not;
- any act: whether it answers an open matter (**advised**), contradicts the
  owner's counsel (**dissent**), or answers none (**unadvised**).

**Rules of behaviour (design/71).**
- An advised act gets a receipt, never a question. The other minister's remedy in
  a contested matter makes the owner dissent on the record.
- At most one question a sitting. A question that would be a second waits.
- Routine acts are silent. A lever with no `post` is the Prime Minister's own and
  nobody replies.
- No randomness.

**The question** is an ordinary event decision, spoken by the owner, two to four
answers. Each answer creates an **undertaking** with the existing verb (a
`by` sitting, a `discharge` condition, `onBreach` effects) and carries its
consequences. One answer is always "no reason given", which records and costs
trust. The first answer must be plausible and non-punishing, or the first-option
playtest policies move for the wrong reason.

**The interface.** The reply shows in "What has happened" and in the next
brief, as a line, in the minister's voice. A question is an ordinary decision
page. Replace the generic confirm dialogs that restate mechanics (the money draw,
Make SI) by showing those terms in the act's panel and asking once. In the
instrument "Document" view, add the minister's reply as a memo in return.

**Wording.** Write every default reply and question plainly, name them in the
commit message, and leave the register to Claude. Do not invent characters or
posts; use the cabinet's.

## Measure

- `node tools/playtest.js --seeds 80` before and after; explain any movement of
  the old policies.
- `npm run guards` reaches the canon.
- Add a playtest policy "acts on its own reading" that uses levers with no
  matter, and assert the witness fires, never asks twice in a sitting, and that
  purposes bind and breach.
- Bump `STATE_VERSION` with a migration if the state changes.
- `npm run check`, and `npm run layout` for the interface changes.

Delete this brief in the commit that finishes it.

## Answer to the purposes question (Claude, 4 Oct evening: approved, build now)

A narrow first implementation.
- **Money (grave draw):** answer (a) is the bridge, "to carry the account until the
  rise": it creates an undertaking discharged by repayment by the rise, with
  `onBreach` = the owner's relationship drops by `setup.witness.breachCost` and a
  wire line is queued. Answer (b) is "no reason given": no undertaking, and the
  owner's trust costs `setup.witness.noReasonCost` once.
- **Instrument, initiative, appointment:** the stated purpose is act completion. The
  answer creates an undertaking discharged by the act's own outcome landing (the
  instrument made and not revoked, the initiative's answer collected, the appointment
  confirmed) by the rise, with the same `onBreach`; plus "no reason given".
- The first answer is always the plausible, non-punishing one.
- **Deferred to a later brief:** a "spent on" condition and named spending paths (the
  "fund a measure I will name" answer).
- Defaults: `breachCost` 5, `noReasonCost` 2, in `setup.witness`. Write the wording
  plainly and name it in the commit for Claude's register pass.

## Status, 4 Oct night (Claude): what exists on `integrate/witness`, and what is left

Codex's usage ran out mid-build; its work was rescued and merged onto main's claims and
interval engines (STATE_VERSION 37 is witnessed acts; migrations ascend 36, 37, 38).
**Built and tested** (`WITNESSED ACTS` in `test.js`, `npm run check`): `Engine.witness`
called from the lever writers; weights from `setup.witness.thresholds`; advised acts get a
receipt and dissent is recorded; replies go to the log, the next brief and (for
instruments) a memo by id; at most one question a sitting (`nextQuestionDue`,
`lastQuestionAt`); a lever with no owner is silent; `content/witness.js` rules; schema,
editor, refs and serialiser know them; the money draw and Make SI confirm dialogs are
replaced by the terms shown in the panel; a playtest policy "Acts on its own reading".
The 80-seed playtest is identical for the twelve existing policies.

**Left, and why it is not on main:**
1. **The questions are not authored.** `setup.witness.questions` is empty, so a grave act
   gets a reply and no question. With the confirm dialogs gone, a large draw is therefore
   unguarded. Author the money questions first (design/71, and the approved narrow plan
   above): the bridge answer's undertaking is discharged by `{repaid: <lender>}` by the
   rise; "no reason given" costs trust once. A question event is static, but its lender
   and owner are not: either one question event per lender (rules in `content/witness.js`
   keyed on `match:{id}`), or let `choose` substitute `{id}` and `{post}` from the queued
   `witness` payload. The breach cost needs the owner's character id, which is dynamic too.
2. **Treasury is vacant at the opening**, so `owners.money = "treasury"` makes the money
   witness silent until a Treasurer is appointed. Decide: a different default owner for
   money until then, or accept silence.
3. Instrument, initiative and appointment questions (act completion), the instrument
   Document memo view, and a refusal in the owner's voice (the 600000 case).
4. `npm run layout` and screenshots of the Economy panel without the dialog.
5. **`npm run check` fails three `tools/uxtest.js` assertions on the branch**, all tied to the
   removed confirm dialogs: "editing a drawing preserves the first click on Draw", "editing
   then opening confirmation does not borrow", "canceling an overview order leaves the
   entire simulation unchanged". Codex never reached the full check. Rewrite them for the
   new behaviour (the draw happens on the click; the question follows) when the questions land.

