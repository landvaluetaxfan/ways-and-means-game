# 46 — The vessel: what an author could not reach

**27 September 2026.** The author, asked what next: "I'm not satisfied to go
onto working on content." The game is meant to be a vessel for campaigns the
author writes, and every check we have proves only that the engine runs
Flash I, which was built alongside it. None says whether the vessel would
carry a campaign it was not shaped around. This note records two gaps found
by looking at the game as an author would, what was built, and what is
left.

## What was found

**1. The editor offered 28 of the engine's 50 conditions and none of six
effects.** The editor builds its pickers from `js/schema.js`, and the schema
had fallen behind the engine. Among the missing were:

- `seen`, which is how one story beat chains on the last;
- `settled` and `resolved`, the endings;
- `owes` and `breached`, promises;
- `actorAbove`/`actorBelow`, `dissolved`, `postVacant`, `risesWithin` and
  `campaign`;
- the effects `cabinet`, `undertake`, `discharge`, `slots`, `si` and
  `signatures`.

The editor kept these as raw JSON where content already used them, and
never offered them to an author writing something new. `CONTENT_GUIDE.md`
said the schema listed all fifty, which it did not.

Two more effects, `cross` and `vacate_seat`, had schema entries of shape
`"list"` and no encoding in either direction, so choosing one in the editor
wrote nothing. The vocabulary list they draw from, `constituencies`, did not
exist, so their selects were empty.

**2. A story could move a person and never ask about one.** The world has 55
characters, and the 132 events name four of them (Ceyhan in eleven). An
effect could appoint someone, vacate a seat, or warm and cool a person's
relations with the government through `rel.<id>`. No condition read any of
it, so the relations content moved were written and never read, and a story
about people had to remember everything in flags it set itself.

## What was built

- **`js/schema.js` describes every condition and effect the engine knows,**
  and `test.js` fails the day the two lists differ (proved by deleting
  `seen` from the schema). The editor gained the forms they need: an id
  list (one picker per id), an ending (any, none yet, or one by name), a
  single id, a nested station/field/number row, and a map whose value is a
  person. Effects gained `appoint`, `slots`, `list` and `json` shapes; a
  promise starts from a template, since it is seven fields and two of them
  are a discharge and a breach. The add-condition prompt lists each key with
  what it asks.
- **Ten conditions about people:**
  - `holds:{post: person}`, where a list means any of them;
  - `inCabinet`/`outOfCabinet`;
  - `signed`/`notSigned`/`refused`, which read the leadership paper;
  - `seated`/`unseated`;
  - `relationshipAbove`/`relationshipBelow`, keyed by a person or
    `president`, which read what `rel.` moves.
- **Who left a seat.** The roll counts seats by party, so `seated` means
  the member's party still holds a seat in their constituency and they have
  not left it. `vacate_seat` takes an optional `member`. In a seat of one
  (every seat in content today) the engine knows who left without being
  told. A left member stays gone when their party wins the by-election,
  since that returns somebody else. Each person's `seat` and `party` are
  content's, carried onto `st.characters` by `newGame()` and `reconcile()`
  for the reason an actor's lag is: conditions are called as `(st, value)`.
  No `STATE_VERSION` bump, because `reconcile()` fills them on every load.
- **Checks.**
  - `test.js` exercises each person condition, including the rule for a
    seat of several members on a copy of one seat set to three.
  - `edtest` round-trips every new effect shape and condition form through
    the form, and requires each to be drawn as a form rather than raw JSON.
  - lint resolves every person, post and campaign the new conditions name.
  - `js/refs.js` follows a renamed person into all of them.

  Each check was broken to watch it fail.

## What is left

- **The dry run.** Write a small throwaway second campaign, six to eight
  events on a different premise, purely to test the vessel. Log every point
  where it forced the writer out of content: an engine edit, raw JSON, a
  hand-edited file, not knowing how. Claude first, for vocabulary gaps. Then
  the author, in the editor, for what no check tests.
- **Found on the way, not fixed:**
  - **Willingness to sign reads the authored office, not the live one.**
    `willOf` counts `characters[].office` as being on the payroll. A
    minister sacked by a `cabinet` effect is still paid, and a backbencher
    appointed is not. Fixing it moves the signature arithmetic the canon
    run depends on, so it wants the playtest across seeds before and after.
  - **`alive` is written once and read, never changed.** `st.characters[].alive`
    is set true at the opening and the Party tab filters on it. Nothing can
    make a person die or leave public life, which is a mechanic somebody
    started.
  - **A named member cannot cross the floor.** `cross` moves a seat between
    parties. A person's party is content's and does not move, so a story in
    which a named member defects has no way to say so.
