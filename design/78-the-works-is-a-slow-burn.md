# 78 — Flash I: the Works is a slow burn

**Started with the author, 5 October 2026**, in conversation, from this instruction: "Focus on
the Bellamy almanac works and the foreign affairs friction as what I've settled as what I want,
everything else you can kill. We can essentially start from scratch here as we walk through it
together." The author answered each round from a phone; the answers are quoted where they
matter. Nothing has been cut yet. When something is cut it goes to
`content/archive/cut-events.js`, never deleted.

This record overrides the timing in `design/58`, `design/73` and `design/76` where it differs.
It leaves the Appropriation as Act I's lead-in (`design/76`).

## Settled (the author's answers)

- **Two threads are fixed:** the Bellamy Almanac Works, and Earth's friction with the
  Commonwealth. Everything else is open to cut, to keep as machinery, or to reuse.
- **The Works is a slow burn across all the acts.** The author: "I did intend for it to sort of
  be a slow burn across all acts, but also the annexation being something later if not close to
  the end." **Annexation falls in Act IV** (autumn 2083).
- **It arrives at the end of the tutorial**, not on the first day and not as the end of Act I.
  The author: "short opening might be just too short... End of tutorial, maybe?"
- **The Works story is mainly about two things:** whether to take it, and how to pay for it.
- **Earth's pressure the player feels is money and the UN.** The relays against nitrogen
  (chokepoints) and the press war are out of focus. `f1_earth_answers` and `f1_relays_restored`
  are cut candidates; the author has not yet said to cut them.
- **The stakes are the residents, the debt trap and Earth's goodwill.** Losing the government
  is the general failure state for every thread and one of the ways the game ends, so it is not
  a Works stake.
- **The UN side plays as named bloc deals:** envoys for the Union, the African Union, Kenya and
  Gabon each want something, and the player negotiates.
- **The player can refuse the Works for good, and play on.** The residents, the Hard Left and
  the government's legitimacy pay.
- **Before annexation the Works asks three things of the player:** recurring needs, the legal
  fight, and Earth's offers. The author said "sort of all 3", and asked for it narrowed to two
  or two and a half. See the ladder.

## The ladder (Claude's proposal; the author has not yet confirmed it)

"Whether to take it" is not one decision. It is three rungs, and the player can stop on any:

1. **Care.** Keep the residents alive: air, power, wages, the medical register. Small, recurring
   asks that grow. This is the recurring needs.
2. **Standing.** Recognise their vote, and accept the interim administration the Assembly gives.
   Canon already makes joint administration the Assembly's, by two thirds, under Uniting for
   Peace (bible §11.1, the Security Council entry). This is the legal fight and the bloc deals.
3. **Ownership.** Annexation, in Act IV. It needs the money, two thirds in the Assembly, and
   neither the Union nor the African Union blocking.

Earth's offers (a buyout, a bondholder deal, the repatriation terms) are the way off the
ladder, and each act they come back cheaper than the last rung costs. That is the third thing
the author named, used as the temptation and not as a rung of its own. Each rung costs more
than the one below and draws an answer from Earth in money and at the UN.

## The clock (provisional; the author did not know enough to choose)

Recommended: **Earth's repatriation, which slips.** The author's own plan (`design/35`) has
Earth's rescue take two years. A rescue date that the player's legal fight and Earth's own
procedure can move gives the slow burn a visible deadline that Act IV's annexation races. The
two alternatives are no outside clock (the pressure is accumulating cost and Earth's patience)
and the 2084 election (the Works as the ballot's question; this fits Act V, not Act IV).

## What this overrides, and what has to be re-timed

- `bible.md` §1.0 (LOCKED): "Flash I's aim is to save the Almanac Works. It arrives with the
  stranding at sitting 14." The aim and the sitting change once the shape is settled. It is a
  LOCKED section, so the edit waits for the author.
- **Built and short-fused:** the stranding at sitting 14 (`f1_stranded`), the air date of 17
  July 2080 (`f1_air_fails`; bible §11, decided by Claude "for the author's approval"), and the
  annex-or-decline dilemma (`f1_dilemma`) as an early choice. All three are re-timed or
  reworked.
- `design/73`'s proposed forks for Acts II to IV (the courts, the UN, a tariff standoff, a
  retreat) are replaced by the ladder.
- `design/76` fifths 4 and 5 (the consequence and the vote) are written against a stranding at
  sitting 14 and Ember Ridge. They wait on the author's answers below.

## Settled, rounds 4 and 5

- **Five acts stay,** with the ladder mapped onto them: **I** the tutorial and the Works's
  arrival; **II** care; **III** standing and the UN deals; **IV** annexation; **V** the run-in
  and the count.
- **Faces as needed.** Earth's friction has no recurring cast. A name appears for each deal.
- **The Works first appears as a quiet wire item** early in the tutorial (the author: "charming"),
  for example Cordell's accounts frozen in Europe, with no action required. It plants the money
  pressure and teaches that the wire exists.
- **The Works breaks after supply is decided.** Act I is the tutorial, one sitting period (16
  sittings), and closes on the estimates. The stranding opens what follows, so the Works is
  paid for on top of a budget already set. This is "how to pay for it", the author's second
  heart. The supply vote is the division on the Appropriation (nothing forces it before the rise
  at sitting 16, `design/76`); the stranding is no longer fixed at sitting 14.
- **The Divergence bill is not the tutorial's bill.** The author: it "introduces an unfamiliar
  in-universe concept early-on that doesn't really have a strong real-world analogue". What
  competes with the Appropriation for order-paper time is **the Anchor Concession (Anchorage)
  Ratification Bill**, the elevator treaty with Kenya: a treaty everyone understands, foreign
  affairs, and it plants Kenya and the African Union before the Works. Check that its slot cost
  makes the trade-off real. The Divergence bill and its personhood fight are parked, not
  deleted; the world keeps the concept, and a later act can bring it back.
- **The NPP stays as the coalition partner.** Its price (canon had it as the Divergence bill,
  bible §11.1) is to be decided.
- **The five clauses need plain names.** The author did not know what "the thermal clause" is,
  and neither will a new player. Each clause is taught through a familiar analogue before its
  in-world name: thermal quota is the energy and cooling the stations are allowed to run
  (every watt of thought becomes heat, and heat can only be radiated away); the floor is the
  guaranteed basics; substrate insurance is health and pension cover for people who cannot pay
  for the computing that runs them; works are infrastructure; transit is the transport
  subsidy.

## Settled, round 6: supply is compulsory, and the treaty is a gesture

The author asked what happens if the player chooses the treaty, since "they have to figure out
supply eventually". The engine's answer: supply is tested at every rise (`recess()` calls
`testSupply()`), the first rise is sitting 16, and a government that has not carried the
Appropriation by then loses (bible §3.5, loss condition 5). A sitting period has 6 slots and
the Appropriation needs 5 (four stage grants and the division), so **in the first period the
player has exactly one spare slot.** A treaty at committee needs 3, so spending all of them
on it makes supply impossible and ends the run. The Divergence version of this beat had the
same flaw: "the bill or the estimates" was never an either-or.

**Decided (author, "1"): the treaty is a gesture, not a rival.**

- Supply is mandatory, and the page says so plainly.
- The one spare slot goes on the treaty (it advances a stage, Kenya notices, and the payoff is
  in Act III's bloc deals) or is held back.
- The treaty carries in period 2, as its first business.
- The two other options were interim supply (a cheap stopgap vote, like a vote on account,
  which needs engine work and relaxes the hard rise) and no competing bill at all.

What this means for the build:

- **A warning is required.** A careless player can still lose at sitting 16, so the tutorial
  (`design/77`) and the docket warn when the slots left fall short of what supply still needs.
- **`anchor_kepler` must be re-staged.** It starts at `assent` and waits for the chapter-2
  event `fa_anchor_terms`. For the tutorial it starts at committee.
- **`briefing_divergence` is rewritten** as the spare-slot beat. Its choices set a stance flag
  and move the NPP; they do not spend slots, which the player spends in the Chamber. The
  present "bold" text ("carry the estimates with whatever time is left") promises what the
  arithmetic cannot deliver, and goes.
- **The NPP's price is the insurance clause** (author: accepted). They want substrate insurance
  set wide (CW$32bn), a price inside the budget.
- **Each rise tests supply once.** After the Appropriation is assented, `supplyCarried` stays
  true, so "the budget returns every act" (an Appropriation for each act) is not modelled yet
  and needs engine work if the author wants it.

## Open

1. **Ember Ridge** as the face of the thermal clause (a station whose radiators faulted on 6
   April and is below its statutory reserve), or a different face. The author had not yet
   seen the explanation of the thermal clause when asked.
2. **The Hard Left and the leadership paper:** how much of the signature chain survives. The
   leadership ballot stays a general failure route.
3. **The Anchorage treaty's first scene** and Kenya's and the African Union's stake in it.
4. **The wire item's wording** and where in the tutorial it falls.
5. **The clock** (Earth's rescue, which slips), still provisional.
6. **Whether each act gets its own Appropriation** (engine work).
7. **Bible §1.0 and §11.1** (LOCKED) need editing once the shape is settled: the aim, the
   stranding at sitting 14, the NPP's price.
