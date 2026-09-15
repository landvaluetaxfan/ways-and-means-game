# 25 — THE PROCEDURE

*Eight things that exist in real parliaments and not in this one. Deferred,
but written down: each is cheaper than it looks, several are half-built
already, and none of them is science fiction — which is the point. The
transhumanist material gives the game its argument; procedure gives it its
texture, and the texture is what has been thin.*

Measured where measurable. Facts below were checked against the build on
15 September 2026, not remembered.

---

## 1. Supply — the largest structural hole in the game

`design/13` already opens with it:

> The build has a `confidenceSupply` array in the state object. **There is no
> supply.** A confidence-and-supply arrangement is a promise to vote through
> the budget, and there is no budget to vote through, so the array currently
> means "extra seats on the government side for confidence arithmetic" and
> nothing else.

Every parliamentary system ties supply to confidence: lose the budget, lose
office. `treasury` is a scalar that nothing appropriates. There is no annual
money bill, no estimates, no vote on account.

**Worth:** it makes `confidenceSupply` mean what its name says, it gives the
session a spine (the budget is the one thing that must pass), and it is the
natural home for a deadline the player cannot refuse. **Cost:** a bill type
and a confidence link. **Read `design/13` first — most of the answer is there.**

## 2. The programme speech

Sessions exist. Prorogation exists and kills unfinished business — a bill not
at assent is set to `fallen` when the House rises, which is correct and
already built. What is missing is the other end: **the government announces
its programme at the start of a session, and the House votes on it, and that
vote is a confidence vote.**

**Worth:** this is order-paper time given a ceremony. The player must *declare
the programme in advance*, on the record, before knowing what the session will
throw at them — and then live with it. Undertakings already model "the
government said it would"; this is the same verb at session scale.

## 3. Commencement

A bill passes, receives assent, and is **never brought into force**. The UK
statute book is full of these. It is a legal fact rather than a loophole.

**Worth:** the best betrayal in the game. You pass a partner's bill to keep
them in the coalition and quietly never commence it — and unlike breaking an
undertaking, you did *exactly what you promised*. **Cost: almost nothing.** The
deferred-fact queue built on 14 September does the mechanism; what is needed
is a stage after assent that does not advance on its own.

## 4. The ministerial direction

When a UK minister overrides their permanent secretary's objection on
value-for-money, the civil servant can require the instruction **in writing,
and it is published.**

**Worth:** a subordinate who cannot stop you but can make your override a
matter of public record. A check that is not a veto — the game has referral
(a delay) and prayer (an annulment) and nothing in between. It also gives the
civil service a voice without giving it a vote, which is the correct amount of
voice for a civil service to have.

## 5. Allocation of time — the guillotine, and the filibuster

A government may curtail debate to force a vote, at a cost in looking
anti-democratic. The opposition's counter is to talk a measure out.

**Worth:** order-paper time is already the scarce good, so this is *buy time
with standing* in one direction and *spend the government's slots* in the
other. Both are free in the existing vocabulary. It is also the first thing
the opposition can do TO the player rather than merely resist.

## 6. Collective responsibility

A cabinet minister supports government policy in public or resigns. The game
has a cabinet, appointments, vacancies and no doctrine binding any of it.

**Worth:** it makes an appointment a *bet*. A seat buys a faction's loyalty and
silences its most credible critic — and the resignation, when it comes, is a
weapon precisely because they were inside. `vacate` and `postVacant` exist;
`postVacant` is one of the seventeen conditions content has never used.

## 7. Amendments — a field that has been dead since the first build

`js/engine.js:158` initialises `amendments: []` on every bill. **Nothing in the
engine or in content has ever read or written it.**

Committee is where a bill is *changed* rather than killed, and it is the
natural home for lobbying: you do not defeat a measure, you amend it until its
own sponsor no longer wants it. That is how the functional bench would actually
be fought, and it is more interesting than a straight count.

**Worth:** it gives committee stage a reason to exist — see also the open
question of whether a whole-bill division should be possible at committee at
all, which is a canon decision nobody has taken.

## 8. Select committees

They summon, they report, and they embarrass. A committee report is a deferred
fact with a date, which the queue already carries: `{after, label, effects}`
with a label makes it appear on the calendar as a thing the government knows is
coming and cannot stop.

**Worth:** an institution that produces consequences the player did not choose
and cannot veto, on a schedule they can see. That is the shape the game is
missing more than any single mechanic.

---

## Order, if these are ever taken up

**3 and 7 first** — both are nearly free. Commencement rides a queue that
exists; amendments revive a field that is already allocated on every bill.

**Then 1**, because it is the biggest and because `design/13` has already done
the thinking.

**8 and 6 next** — both need the actor store from `design/23` to be worth
building, and both are cheap once it exists.

**4 and 5 last.** They are the most characterful and the least load-bearing.

**2 sits outside the order**: it is small, but it changes how a session opens,
so it wants to land at a moment when the session structure is otherwise still.
