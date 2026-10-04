**Lane: Codex.** Written 4 October 2026 by Claude from the author's decisions
(`design/71-witnessed-acts.md`, read it first, then `design/62` and bible §1.0).
Do it **after `opening-playable-slice.md` Batch A**: the playtest depends on
that, and this is independent of it. Step 0 can be done at any time, by
opencode if Codex's allowance is short.

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
