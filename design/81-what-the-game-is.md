# 81 — What the game is, in the author's words, and seven decisions made on them

*Written 7 October 2026 by Claude Code, from what the author has said in this stretch. Nothing in
the first four sections is new: it is the author's words put in one place so that a decision can
be tested against them. The seven questions that were left open were then handed over ("you can
decide everything for the 7 questions", 7 Oct), and the last section records how each was
decided and why. The author can overturn any of them by saying so, and a live word beats this
page. It is the page the agents read first, because the question each of them keeps getting
wrong is "what would Harper want", and this is what has been said.*

## What it is for

- A narrative game, not a sandbox. "Open feels too sandboxy for a narrative game", and a
  per-act lock "feels orchestrated". The story sets the agenda and the levers stay open.
- A vessel for you to write campaigns in. Flash I is the proof of concept.
- A game with real mechanics under the writing: the count, the whip, the budget, the promise.
  "Refine mechanics" was one of the three things you asked the slice to do.

## What the player does, a sitting at a time

1. **A page happens** (news: what the world did, in an in-world newspaper's voice).
2. **One decision** is put to the player (the sitting's business, in the second person).
3. **Levers are the player's own**: the order paper, the whip, the clauses, the orders, the
   Economy's money calls. A decision may announce an intention. The player keeps it where it is
   kept, and it is counted whether or not they do.

## What every scene owes the player

These are faults you found by playing, so each is a rule:

- **A bill must not be on the paper before the story has brought it in.** (The annexation bill
  in drafting before the Works had appeared.)
- **Nothing is decided without the House.** A bill falls on a division or it does not fall:
  "the bill fell and I never had to leave the sitting tab, no vote animation, nothing".
- **When a decision changes something on another screen, say so, and show it.** "I want things
  changing in other tabs to be as clear as possible." (A promise should visibly be written down.)
- **The player is brought to the division**, and told why to wait: "I haven't moved to a
  division on any bill. We need to restructure when the player is expected to."
- **Explain one thing at a time, and do not have characters say what they both know.**
- **An order is signed.** "You just need to press the decision button like any other, no
  signature." (Parked for the witnessed-acts work, and so is a signature for each signatory.)

## What the build is for

- **Act I only**, sittings 1 to 16, closing on the rise, with the Almanac Works abandoned as the
  first superevent. "We use that length for playtesting, and set up the tutorial, plus refine
  mechanics."
- **A public itch.io playtest slice.** First-time players are strangers.
- **Thorough, not hopeful.** "I don't want this to be another case of where I feel like we're
  coming closer to a playtesting build but it slowly enters my mind the game is just really not
  refined enough."
- All existing writing retired and rewritten: prose, bills, orders, Concordance.

## The seven questions, and how they were decided

The author handed all seven to Claude Code on 7 October 2026 ("you can decide everything for
the 7 questions"). Each decision is the smallest one that keeps what the author has already
said, and each says what would change it.

1. **The date. The Commonwealth learns of the Works' abandonment on 8 May, the day the House
   rises.** The canon said 6 May and the rise falls on 8 May (sitting 16). Moving the canon costs
   one date in `bible.md` (the stranding, §the Works' air), and "about two months" still fits
   the 17 July air date; moving the rise would have cost the sitting count that the whole Act
   is built on. The curtain page now needs no explanation. *Changes if:* the author wants the
   news a fortnight before the rise, in which case the curtain becomes a sitting.
2. **Promises stay the spine of sittings 5 to 10.** They give the player something to carry, a
   place where the carrying shows (the Owed list), a cost for dropping it (a breach page) and a
   budget puzzle with no extra mechanism. The first balance reading (`npm run balance`) shows the
   dilemma is real: promising and keeping what fits costs public standing, refusing costs the
   partners, and promising and keeping nothing is worst of all. *Changes if:* the first
   playtests say it feels like a trap. The alternative, a choice that sets a level and promises
   nothing, is a content change in five scenes, not an engine one.
3. **Reading is always open; writing opens with its scene, and stays open.** The author wants
   neither a sandbox ("open feels too sandboxy") nor a lock per act ("feels orchestrated"). The
   ratchet of `briefs/act-one.md` E3 is the middle: every tab can be read from the start, the
   controls that write to the game are dimmed with one line saying what opens them, and a lever
   the player has been taught never closes again. The ledger's "opens" column is the order (see
   the ladder in the brief).
4. **Sittings 12 and 13 have no scene.** They are the player's own work, the whips and the
   division, and a page between them would be a scene about what the player is already doing. The
   tutorial cards carry the teaching and the quiet-sitting business carries the room. *Changes
   if:* a first-time player reads them as empty, in which case one wire item each, not a page.
5. **The four tax clauses are locked until the Economy tab's Money calls open at sitting 15.**
   Five spending clauses are enough to learn in Act I, the taxes have no scene, and a rate set
   before the Economy tab is explained would move the account for reasons the player cannot
   see. They stay at the standing rate until then, are visible, and open with the Underwriters'
   page.
6. **The glossary's handles are cut.** Reference text states what a thing is and does, with no
   figure of speech (`PROSE.md`), and the 4 October note on "slop flavour text" is the nearest
   ruling. The 24 handles are kept whole in `content/archive/glossary-handles.js`, and the
   tooltip and the editor still support a handle, so one can come back. *Changes if:* the first
   playtest shows terms going unlearned.
7. **Act I stays loss-proof except at the deadline.** `design/77` says so, and a public slice
   met by strangers should not end in a loss they cannot read. The one real loss is the one the
   Act is about: the estimates not carried by the rise. The partner leaving the coalition (at
   loyalty 15) is out of reach by answers alone, and that is deliberate. *Changes if:* the
   author wants stakes in the middle of the Act: the cheapest place is a lower floor for the New
   Progressive Party's loyalty, which promising and keeping nothing already drives to 23.
