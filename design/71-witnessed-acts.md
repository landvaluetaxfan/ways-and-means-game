# 71 — Every act is witnessed

**4 October 2026.** Decided by the author in one question round. The
author, playing the Economy tab: "I think I can input 600000 into the Earth
banks money calls section ... and it gives me a disclaimer popup but nothing
like an advisor asking why I'm doing this or anything." Then, of the register:
"sort of the same thing with the statutory instruments." This completes the
answer to design/57's question, "when does a player act unprompted?", which
`design/58` had answered for the *advised* half only.

## The gap

`design/58` decided that a minister raises a matter while there is time, and
that the tabs stay open "for a player acting on their own reading". It said
nothing about what the world does with an act nobody advised. As built:
- **Drawing on a lender:** a generic confirm dialog that restates the terms
  ("Draw US$… at 5.00 per cent? Earth's governments read a drawing as a
  political act…"), and a plain mechanical refusal for the impossible ("Earth's
  banks will not go past 60,000 with this government"). The amount field is
  `type=number`, so "60,000" is rejected.
- **Making a statutory instrument:** a generic confirm ("Make SI 2080/61? It
  takes effect at once and may be prayed against"), then it is done.

In both the game asks "are you sure?" about mechanics. No person reacts. That
is the "buttons that do things" the author began with.

## What was decided

1. **The world answers an unadvised act:** a short in-voice reply from the
   owner for a notable act, and a real question, with answers that carry
   consequences, only for a grave or unusual one. Routine acts stay silent.
2. **The reason you give binds you.** Your answer is recorded as a stated
   purpose. Spending the money on something else later is a breach, and
   breaches are the evidence the ending's legacy reads (design/58).
3. **Built for every lever at once,** with a default weight until each is
   tuned: money calls, instruments, initiatives, appointments, orders, bills.

## The framework

**An act has an owner and a weight.**
- The owner is the department's minister (the lever's `post`, design/61 and
  design/64 answer 9). A lever with no post falls to the Prime Minister's own
  card, and nobody replies.
- The weight is **routine**, **notable** or **grave**, derived from facts the
  game already has, with content owning the thresholds (`setup.witness`):
  - money: the amount as a share of the room left on the facility, and of the
    reserve;
  - an instrument: its procedure (affirmative or negative), its slot cost and
    whether it can be revoked;
  - an initiative: its slots and its irreversibility;
  - an appointment: whether it fills a post held against a minister's advice;
  - anything: whether it contradicts an open matter's counsel, or answers none.

**An advised act is not an unadvised one.** If an open matter lists the lever
as a remedy, the owner's reply is a receipt ("acting on my note"), and nothing
is asked. If the act is the *other* minister's remedy in a contested matter,
the owner dissents on the record. This ties the witness to the brief.

**The owner answers, in three forms:**
- **A reply:** one or two plain sentences, from the owner, in the feed ("What
  has happened") and the next brief. No choice.
- **A question** (grave or unusual acts): an ordinary event decision, spoken by
  the owner, with two to four answers. Each answer is a stated purpose and
  carries consequences (relationship, standing, the press), and creates an
  **undertaking** (the existing promise machinery: `by` a sitting, a `discharge`
  condition, `onBreach` effects). "No reason given" is an answer too, and costs
  trust.
- **A refusal in voice:** when the engine's gate says no, the owner says it, in
  a sentence, not a rule's line.

**It never nags.**
- At most one question a sitting (as at most one new matter a sitting).
- Ordinary governing, such as rolling bills and small draws, is silent.
- No randomness: weights and replies are deterministic (AGENTS.md).

**The world reacts later:** a wire line, an opposition motion, a partner's ledger
moving, a sitting on, through the existing `queue` effect.

## How it is built

**One engine hook, content for the rest.** After any lever is used, a single
function (`Engine.witness(st, C, act)`, called by each lever's one writer:
`makeInstrument`, the borrow function, the initiative starter, the appointment
function, and so on) builds the act's facts, evaluates content's witness rules,
and queues the owner's reply or question. The engine names no lever, post or
lender.

**Content** (`content/witness.js`, and per campaign): rules of the form
`{ id, campaign?, kind, match, weight?, owner?, reply, question? }`, where
`match` is a condition on the act, `reply` is the owner's text, and `question`
is an event id. `setup.witness` holds the thresholds and the defaults, so every
lever has a default weight and reply until its own is authored.

**Purposes use undertakings.** A question's answers create undertakings with the
existing verb. When claims land (design/68, Stage 3) they migrate to claims.

**The interface:** the reply appears in "What has happened" and the brief; a
question is an ordinary decision page. The confirm dialogs that restate
mechanics ("Draw US$… at…?", "Make SI…?") are replaced by showing the same
terms in the act's own panel and asking only once. The instrument "Document"
view, the Prime Minister's memo to the minister, gains the minister's reply as
a memo in return.

**The money field** (independent, can be done first): accept "60,000", "60bn" and
spaces; show the room left beside the field with a Max button; clamp to the cap
with the lender's refusal in voice; type amounts in billions with a decimal, as
every figure is shown (changing the handler and tests, so it is its own step).

## Measure

- `node tools/playtest.js --seeds 80` before and after: the first-option
  policies pick option 0, so every question's first answer must be a plausible,
  non-punishing one, or the existing policies' outcomes will move for the wrong
  reason. Explain any movement.
- `npm run guards` must still reach the canon.
- Add a playtest policy "acts on its own reading" that pulls levers without a
  matter, to check the witness fires, never asks twice in a sitting, and that
  purposes bind and breach.

## Order

After the opening slice (the playtest depends on it). Independent of it
otherwise. See `briefs/witnessed-acts.md`.
