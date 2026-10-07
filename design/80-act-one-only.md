# 80 — Flash I is built to the end of Act I, and nothing after it

**Decided by the author, 7 October 2026**, over a long design session about the opening.
The words, in order:

- "I notice so many things wrong like the annexation bill being in drafting even before
  bellamy almanac works showed up as an event, so i think here's what we do: we kill all
  existing writing, and just make the game playable up to the end of Act I, based off what
  we decided today, you generate the rest and I go over it later. we use that length for
  playtesting, and set up the tutorial, plus refine mechanics."
- "this means a full pass on all prose, all bills and orders, all concordance articles"
- "i don't want this to be another case of where i feel like we're coming closer to a
  playtesting build but it slowly enters my mind the game is just really not refined
  enough, so ideally we are thorough about this."

## What led to it

The session began as a UI audit and became an audit of how the opening explains itself.
Decisions 1 to 5 were analysed one at a time. The faults were not local:

- A scene can be skipped, or made untrue, by a lever the player used first (the Treasury
  scene against the Government tab). Nothing in the design, the engine or a check covers
  that direction. `design/21` and `design/58` Round E only asked whether the player can find
  a lever.
- Pages teach many terms at once, and a character often says what the narration already has.
- Choices announce an intention and nothing checks it. The sitting-5 flags
  (`read_the_count`, `estimates_first`, `bill_first`) are written and read nowhere.
- The world shows things before the story has introduced them: an annexation bill in
  drafting before the Works exists as an event, eleven measures on an order paper that
  concerns two.

## What it decides

1. **The playable game is Act I.** Sittings 1 to 16, one sitting period, closing on the rise:
   supply carried or the government falls (`design/76`, `design/78`). A carried rise ends
   the build on a curtain page that says what Act II opens on. This build has no Act II, no
   election and no canon count.
2. **All existing player-facing writing is retired and rewritten.** That means event pages,
   decisions, choices, notes, results and wire items; bills (titles, summaries, effect
   notes); orders and initiatives; characters, parties, stations and districts; the
   glossary, tooltips and tutorial text; the Concordance's authored articles and templates;
   and the textbook. Retired text goes to `content/archive/`. It is not deleted
   (`AGENTS.md`). Numbers and data stay: seats, costs, the economy's constants. They are
   tuned, and the playtest checks them.
3. **The world is what Act I has introduced.** Nothing is visible before a scene or the wire
   introduces it: not a bill, an order, a person, a station, a term or an article. A check
   enforces it, so it is a rule and no longer a habit.
4. **It is built in vertical slices.** One sitting at a time, each with its scene, the bills
   and orders it brings in, its glossary and Concordance entries, its tutorial card and its
   test, and playable before the next begins. Not layer by layer: a layered build has
   nothing playable until the last layer, which is how the earlier near-misses happened.
5. **The explanation pass's rules govern all of it.** One term at a time, introduced where
   it is first needed and before it is used. Choices about things the player already
   understands. Explanation in the narration, not in a character's mouth. No character
   states what the listener knows. Concepts a player has no analogue for are taught through
   one first.
6. **The canon guards are suspended.** `AGENTS.md` said to keep the debt trap reachable at
   the August 2080 count until the author rewrote it. This is that rewrite, in stages. The
   bible's canon stays as the target for Acts II to V. The count at sitting 56 is not built
   or tested in this build, and Act I gets guards of its own.
7. **Done is wider than `npm run check`.** The exit gate is in `briefs/act-one.md`.
8. **The build is the public playtest slice for itch.io** (the author, 7 October: "narrowed
   down to getting just act I done, that also fits with my idea of a playtesting slice for
   an itch.io deploy"). So the first-time players are strangers. The gate adds packaging,
   embedding, a feedback path, save migration and a rights check, and Acts II to V,
   the editor, the design records and the retired text do not ship.

## Corrections to earlier records

- **The Divergence bill is not Act I's bill.** `design/78` parks it, and the Claude Doc's own
  outline already says the Divergence beats at sittings 5 to 8 are replaced by the Anchorage
  treaty beat, the clause scenes and the whips' count. The Decision 5 rewrite drafted in the
  doc documents a beat that is retired. Its finding stands and carries over: a choice that
  announces an intention should create a promise (`undertake`), so the player's levers
  keep or break it.
- **Functional members are not first met at sitting 8.** Whichever bill competes for the
  slots, the whips' count at sittings 11 and 12 is where the functional tier first matters,
  and the ledger in `briefs/act-one.md` fixes the sitting.
- **`design/77`'s "no hiding" holds only partly.** The lever ladder (writing controls inert
  until taught, dimmed, never hidden, a ratchet that only opens) is Act I's tutorial. After
  Act I the answer to "open or orchestrated" is `design/58` Round E: the story sets the
  agenda, and every lever stays open. `briefs/act-one.md` states what that requires of
  scenes.

## What stays open

Whether any later campaign opens with a tutorial at all (recommended: a half-tutorial, with
engine vocabulary taught once per player and a campaign's first act teaching only its
premise). Whether event text may print live figures (decided: constants from the setup first,
live state later). The Acts II to V shape (`design/78`).
