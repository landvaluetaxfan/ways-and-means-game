# 22 — THE BIBLE AND THE GAME

*A sweep, asked for in these terms: how restrictive is the bible, what has the
personhood material crowded out, and what is still missing. Written from
measurement rather than from reading: every number below came from driving the
content and the engine, and the commands are in the text so they can be re-run.*

**Scope, honestly.** I read the section index in full, about fifteen sections in
depth, two of the twenty-one design documents, and measured all of `content/`
and `js/engine.js`. I did not read all 1,967 lines of the bible. Where I have
not read, I have said so rather than inferred.

---

## 1. The bible is not restrictive. That is the problem.

114 of 124 statused sections are **LOCKED**; five are OPEN and five LEANING.
Ninety-two per cent settled. On the face of it that is a straitjacket.

It is not, and the reason is worth stating precisely: **the bible locks answers,
not coverage.** §6.1 settles what the five legal categories are and that the
schedule contains a deliberate category error. Nothing in it says an event must
ever raise one. §10.8 settles that reclassification is an entire branch of
practice. No event has ever been to court.

A locked answer that nothing reaches is neither a constraint nor an asset. It is
a liability with a maintenance cost, and §15.3 already named it as the project's
sixth failure mode:

> **The bible outrunning the game.** The named risk: a magnificent setting
> document attached to nothing.

That risk has arrived. The measurements below are what it looks like.

The two sections that genuinely *do* restrict are §7.6 (shallow simulation, deep
consequence — if the player needs a second window the model is too deep) and §2.6
(explanation cost is the real budget). Both are correct and both should stay.
Neither is what is holding the game back.

---

## 2. What twenty-one events actually cover

Mentions across the whole of `content/events.js`:

| theme | mentions |
|---|---|
| personhood (fork, instance, emulation, substrate, attestation, continuity) | **63** |
| media / the wire | 49 |
| thermal | 28 |
| money and treasury | 17 |
| elections | 11 |
| religion | 6 |
| labour | 3 |
| transit | 2 |
| **volume** | **0** |
| **courts** | **0** |
| **consumables** | **0** |
| **foreign** | **0** |

Personhood outweighs the next real theme by better than two to one. Media is high
only because the wire is a *mechanism*, not a subject.

Reach into the frozen rosters:

- **3 of 35 stations** are named in any event — Anselm Ring, Ember Ridge, Homestead.
- **1 of 54 characters** appears in one.
- 10 of 12 parties are touched.
- 8 of 23 glossary terms never appear in an event.

Fifty-three named people exist, with parties, seats and offices, and the player
meets one of them. That is the clearest single expression of the bible outrunning
the game: the roster discipline of §2.7 is working perfectly and producing
nothing.

---

## 3. The engine is outrunning the content too

| vocabulary | defined | used by content |
|---|---|---|
| effect verbs | 20 | 16 |
| **conditions** | **31** | **14** |

Seventeen of thirty-one conditions have never been used. `chapterAtLeast`,
`inGovernment`, `capitalAbove`, `siInForce`, `postVacant`, `priceBelow`,
`suspendedBelow`, `breached` — the entire apparatus for making an event depend on
the state the player has produced is built, tested, and unexercised.

That is not a content-volume problem. Twenty-one events could branch on state and
do not.

### The number that matters most

`tools/lint.js` audits §7.9's consequence chain — every number a decision moves
must gate something later:

```
scalar.public_standing            moved by 40 gated by 1   ok
scalar.thermal_margin             moved by 17 gated by 1   ok
scalar.treasury                   moved by 11 gated by 1   ok
scalar.party_loyalty              moved by 11 gated by 1   ok
```

**The most-moved number in the game changes the world exactly once.** Forty
effects write to public standing and one condition reads it. The check says `ok`
because the rule is "at least one gate", and at least one gate is the wrong bar.
Forty-to-one is not a consequence chain; it is a scoreboard with a decorative
exit.

§7.9's own sentence — *a price nobody watches is a number nobody sees* — is
satisfied on a technicality by all four.

**The chain check should count.** A ratio worse than about 6:1 is a number the
player is being asked to care about on the game's word alone.

---

## 4. What the personhood dependence costs

It is the right centre. §1.3's tonal target, the dual majority, the divergence
threshold, the suspension power, the whole Ember Ridge scene — they work, and
they work because the question is genuinely unresolved in the fiction rather than
a metaphor with an answer.

The cost is not that personhood is overweighted. It is that **personhood is the
only vein being mined, so every event arrives in the same register**: a technical
provision with a human cost, argued at a boundary. Twenty-one of those is a
strong opening. Two hundred would be a monotone, and §1.7 budgets four chapters.

Three things the setting already has that would break the register without
inventing anything:

**Volume.** §6.10 calls it "the fundamental scarce good" and says the volume
fight — density regulation, minimum-volume standards, subletting, partitioning a
berth into six — is "almost entirely a biological politics". Zero mentions. This
is the housing politics of the setting, it is about bodies rather than minds, and
it puts the Commons Union's own base in the room. It is the single largest
unmined vein.

**Courts.** §10.8: long-lived emulated judges who personally remember the
founding and can testify to original intent. Reclassification as a branch of
practice. Zero mentions. A court is also the one actor that can *undo* something
the player did, which the game currently has no mechanism for at all — the
President refers, but nothing overturns.

**Consumables.** §7.2 makes closure the sovereignty number and consumables its
national counterpart. It is one of the six scalars in §7.6 and it appears in no
event. The agricultural decks are, per §10.1, "the emotional centre of any
station". The one scalar with a ready-made emotional location has no content.

Foreign affairs is the fourth zero, and it is the one that is *correctly* absent:
Part XVI gates it at ~25 chapter-one events and there are 17. `design/11` has
already decided the shape (light-lag as the organising axis, every foreign fact
dated rather than hidden). Leave it.

---

## 5. What is missing structurally

Ordered by what each unblocks, not by size.

1. **`checkSettlement()`.** `checkLoss()` has no counterpart. §3.5.1 defines four
   settlements as `when` blocks and none is evaluated. **The game cannot be won.**
   Everything else on this list is polish next to that.
2. **Events that read the state.** Seventeen unused conditions. The cheapest
   possible fix to the 40:1 problem is not new events, it is `when` blocks on the
   ones that exist.
3. **A reason to look at fifty-three people.** Characters are rendered, have
   offices, have a Concordance article each, and never speak. Either they enter
   events or the roster is decoration with a maintenance cost.
4. **Something that can undo a decision.** Referral delays. Prayer annuls an
   order. Nothing reverses an Act, and a thriller in which the player's mistakes
   are permanent-but-inert has no second act.
5. **Accumulation across a session boundary.** Prorogation refills slots and
   clears the paper. Nothing carries but scalars, so a session is a closed box
   and the four-chapter arc has no ratchet.
6. **A voice for the fork-rentiers.** Part XVI flags it: 210,000 people with a
   direct interest in the threshold and no expression in the chamber. This is the
   one open decision that is also a content hole.

---

## 6. What I would change in the bible

Not much, and nothing structural. The document is good; it is under-used rather
than wrong.

- **§15.3.6 should stop being a risk and become a rule.** Something like: *no
  section is LOCKED until content reaches it.* A status of LOCKED currently means
  "decided"; it should mean "decided and in play". That single change turns the
  index into a coverage report and the 92% into an honest number.
- **§7.9 should name a ratio.** "Gated by at least one" is a bar the project has
  already limbo-danced under four times.
- **§2.7's roster discipline needs a companion.** It says no pass may invent a
  station. It should also say what a frozen roster is *for*: 35 stations and 54
  people exist to be reached, and a roster nothing reaches is drift by another
  route.

---

## 7. The one-line version

The bible is not a tunnel. It is a very large, very well-lit building in which
the game occupies three rooms — and the rooms it has not entered are the ones
where the people live, eat, and sue each other.
