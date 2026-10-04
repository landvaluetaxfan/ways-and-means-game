# 68 — Leverage: what a price leaves behind

**4 October 2026.** Decided by the author in one question round, from
design/58 Round I: "every price creates leverage." This record specifies it
for Stage 3 of design/58's build order. It does not build anything.
Codex's plan for Stage 3 starts here. Where this record and the bible
differ, the bible wins; the bible's capital paragraph (§7.6) is revised by this
record, with the author's decision.

## The problem

Round I, from Codex's assessment: a price list becomes an optimisation. The
question in a sitting should be "whose future leverage am I creating by
getting my way today?" A bargain is memorable when someone has a reason to
demand this concession, a limit to what they will accept, and a later occasion
on which it matters again.

Today the game has half of it:
- `capital[partner]` is a signed number per partner. It rises by 2 or 3 when
  you give their bill order-paper time, and you spend it to whip their votes.
- `undertakings` are dated promises with an owner, a discharge condition and an
  `onBreach` effect (the licensing carve-out's promise to lay SI 2080/45 is
  one).

What is missing: a concession or a post leaves nothing behind but a number;
nobody holds a *claim*; nothing calls it in; and nothing remembers it across
four years.

## What was decided (the author, 4 Oct, all four as recommended)

**1. A claim is a ledger plus named claims.**
- Order-paper time stays the numeric ledger (+2, +3), as now.
- Concessions, promises and posts become **named claims**: each has a holder,
  what they expect, and a date or a limit. "The panel expects SI 2080/45 laid
  by sitting 20" is a claim. "The NPP is owed +2" is the ledger.
- Reuse the undertaking: a promise already is a named claim with a holder and
  a date. Generalise `undertakings` to cover a concession and a post, and give
  every claim a **limit** (the line past which the holder acts) and a state.

**2. A claim comes back both ways.**
- **The holder calls it in** when it suits them. It arrives as a matter in the
  brief, from the holder's minister or the partner's, or as a demand before a
  vote. The claims shown in the brief are the ones the player *owes*.
- **The player cashes claims owed to them,** as votes on the whip.

**3. Favours fade across an interval; claims do not.**
- The **numeric ledger thins** across an interval (people forget a slot given a
  year ago). The interval shows both the fading and who used the absence.
- A **named claim never fades**: a dated promise, a concession or a post
  holds until it is met or broken. **Breaking one turns it into a grievance**
  (a claim held *against* the player), which is the evidence the legacy reads
  (design/58: promises kept and broken, who carried the cost).
- This revises bible §7.6's "nothing decays and nothing is forgiven". The
  author decided it; the bible is revised in the same commit as this record.
  "Nothing is forgiven" survives for claims.

**4. The player pays at the whip, by offering terms.**
- Before a division, the whip panel gets an **offer**: a list of the terms
  that this holder would take for this bill. Examples are a clause, the
  sunset, the hours, a dated promise, and rarely a post.
- **Terms are authored per bill and per holder.** Each shows what it costs
  the other side, and taking one **creates the claim on the spot** and moves
  that holder's votes on that bill.
- Bargaining stays "what the House costs", not a separate verb (design/58,
  Round B). Authored decisions such as the carve-out use the same kind of
  claim, so the two ways of bargaining are one system.

## The shape, for whoever builds it

These are proposals from this record's author (Claude), not decisions. They
follow from the four answers.

**A claim** (in state, content-authored where it begins at a decision):
- `holder`: a party, a current, a cabinet post, or a lobbying actor (4 Oct: actors are in the roster; record `holderKind`);
- `kind`: `promise`, `concession`, `post`;
- `direction`: owed by the player, or owed to the player;
- `expects`: what the holder expects, in plain words;
- `due`: sittings, or a condition (as a matter's `due`, design/64);
- `limit`: the condition past which the holder acts, and what they do
  (withdraw confidence or supply, call a conference, resign);
- `state`: `open`, `called`, `kept`, `broken` (`kept`, not `met`: the code's word, kept for no change in play);
- `origin`: the decision, offer or term that created it.

**The ledger** keeps its writers (`shiftLoyalty` and `capital` stay the one
writer each). Add a per-interval `fade` in `setup`, content-owned. A fraction is
the simplest form; the number is Claude's and the author's to set, and is
measured with the playtest.

**Matters can be raised by a claim.** A matter's `raise` can name a claim
coming due or past its limit, so the holder's call arrives in the brief as any
advice does, with remedies that are levers (lay the order, give the time,
appoint). A claim unmet past its limit pushes to the matter's late decision and
then its page, as design/64 sets.

**Terms at the whip.** A bill declares, per party or current, the terms
available. The offer is a list in the whip panel, not a dialog tree. A term
carries its price in the other side's regard (a clause the NPP likes costs
the Liberals), so the player reads "whose leverage am I creating" before
paying.

**The legacy reads claims.** Met and broken claims are the "promises, methods,
injuries and alliances" that the endings' legacy axis needs (design/58).

## Open questions (not asked yet; recommendations given)

1. **Are the limits visible?** Recommended: the holder's *stated line* is
   shown, and the exact tipping point is not. The Chief Whip's estimate narrows
   as the player learns (design/58's whip range, deferred to the forecasting
   work). The bible's tone is "for people who want the arithmetic", so the
   author may prefer exact limits.
2. **Who can hold a claim?** Recommended: parties, the player's own currents,
   and, where a department is concerned, the post (so the Life Support panel's
   claim is held through the Life Support minister). Not individuals outside
   the roster.
3. **How many claims at once?** Recommended: no cap on claims, but the brief's
   four-matter limit applies to the calls that surface.
4. **The fade's rate,** and whether it applies to a coalition partner and a
   current in the same way.

## Build order (Stage 3, when the author approves it)

1. Generalise `undertakings` to claims, with `holder`, `kind`, `limit`,
   `state`, migration and `STATE_VERSION`. The carve-out promise becomes the
   first claim, with no change in play.
2. The per-interval fade (needs the interval engine, Stage 4; build the
   function and test it with a synthetic interval).
3. The terms and the offer at the whip, with a first bill's terms authored.
4. Claims raising matters in the brief.
5. Cashing claims on the whip.
6. The claims panels in Relations and Party, and the evidence for the
   legacy.

`briefs/opening-playable-slice.md` deliberately builds none of this: it
proves the loop with the carve-out as it already exists. This is its
successor, and the carve-out's promise is the claim it begins with.
