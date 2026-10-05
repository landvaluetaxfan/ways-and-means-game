# 76 — Act I: the Appropriation is the spine

**Decided by the author, 5 October 2026.** Act I is built on the Appropriation Bill, not on
the Divergence Threshold Bill. This replaces design/58's "Act I's aim is the inherited one:
carry the Divergence Threshold Bill and keep the coalition". The NPP's price stays canon
(bible §11.1) and stays live, as the bill that competes with the spine; it is not the spine.

## Why

The author asked whether the Divergence bill was really the best piece of legislation to
base the story on. It is the best mechanic (bible §6.4), but a poor Act I engine: Flash did
not choose it, its stakes are a number of hours and a count of future citizens, and its
consequences land in Act II. The Appropriation already carries the spine in the rules:

- It is a supply test by construction (`test: "supply"`). The House rising without it carried
  is a fall (bible §3.5, loss condition 5). The clock is the rise.
- It costs five of the period's six order-paper slots, so a government carries it properly or
  carries one other bill, not both (bible §7.7, the slot arithmetic).
- Its five clauses are the five things the government spends on (`content/bills.js`): thermal
  quota, the consumables floor, substrate insurance, capital works, the transit subsidy. The
  four prices are its clauses' outputs, and the Economy tab already says so. The defaults come
  to CW$48bn voted, against CW$176bn of standing programmes.
- Canon already makes the vacancy a stake: with the Treasury vacant, "officials prepare the
  budget and no minister signs it" (the Concordance's Treasury article).
- The campaign is called *Ways and Means*.

What is missing is the story. Every Act I event is about the Divergence bill, the Hard Left or
Ember Ridge. The Appropriation is a row on the order paper. The work is to make each clause a
bargain someone cares about, and the vote the Act's test.

## The shape

Five fifths, as design/73 and `briefs/story-walk.md` already count Act I, now keyed to the
bill. The three books are the evidence behind the clauses: the **Treasury's** (the figures),
the **engineers'** (the thermal margin and the failing arrays) and the **whips'** (the votes,
including the 40 functional members who delay a supply bill by three sittings).

1. **The Treasury without a minister.** Flash is recommissioned on 11 April, after winning the
   March election (she has been Prime Minister since January; bible §11.1). Ceyhan's question
   is about the books. The first matter is who holds the Treasury.
2. **The three books.** The whips' ledger (`the_order_of_the_day`, `the_whip_list`), the
   engineers' ledger (`gb_approach`, the Ember Ridge radiator) and the Treasury's, which is
   new.
3. **The clauses.** The estimates are drafted. Each clause gets one scene in which someone who
   wants it speaks, drawn from the clause's own effects. The carve-out contested matter
   (`briefs/opening-playable-slice.md`, Batch A) falls before sitting 8. The Divergence bill
   competes for the slots. The Hard Left's signatures arrive here, as the price of what the
   player has chosen.
4. **The consequence.** The stranding at sitting 14, as built, draws on the same estimates.
   Ember Ridge's cascade follows what was chosen in fifth 2. The 240 accounts become "who paid
   for the substrate".
5. **The vote.** A disclosure decision (publish the engineers' figure, or not), Question Time,
   then third reading. A functional objection delays supply three sittings, which is a beat of
   its own. Carried or lost ends Act I, and the first interval opens on the result.

## Constraints

- **Do not change the clauses' costs** (`content/bills.js` says so; they are tuned against
  the reserve of CW$52bn). Scenes inform and pressure the player; the clause panel stays the
  lever.
- New events go at the end of their lists. Judge each batch with
  `node tools/playtest.js --seeds 80`, before and after; keep the canon reachable
  (`npm run guards`).
- The names are frozen (bible §2.7): scenes use the characters and parties that exist.

## Open, for the author

1. **Who can hold the Treasury?** A PSD member, an NPP partner (the post as a price), or an
   outsider appointed from outside the House as Flash was (bible §3.8)?
2. **The name "(Session 4)".** It and the top bar's `SESS 4.1` are the older arrangement's
   numbering. The bill is the first of the 2080 Parliament. Rename it, and say what the
   top bar's label means.
3. **What forces the vote?** Today the rise is 15 sittings away and design/73 proposes about
   22. The vote has to fall inside Act I, and the Act's length decides when.
