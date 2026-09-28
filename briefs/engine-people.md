**Lane: Codex.** Written 28 Sep 2026 by Claude Code. Three engine gaps about
people, from `design/46` "What is left". Do them in order; each is its own
commit. Read `AGENTS.md` "Standing rules" (State, One writer) and
`LESSONS.md` "Engine and state" first.

## 1. Willingness reads the live cabinet, not the authored office

`willOf(st, ch)` in `js/engine.js` (about line 3175) counts
`ch.office ? 12 : 0` as the payroll weight, so a minister sacked by a
`cabinet` effect still counts as paid, and a backbencher appointed does not.
Its callers are `signableMembers` (about 3168) and `winBackTerms` (about
3237). The House roster reads `PAYROLL.indexOf(ch.office)` the same way
(about 3997 and 4017).

The rule, in one helper used by all four:

- a member who holds a cabinet post now is on the payroll
  (`holdsAnyPost(st, id)`, about line 4308);
- otherwise the authored office counts, **unless** the member held an
  authored cabinet post at the opening and holds none now (they were
  sacked).

Watch two cases in the PSD. **Skye** has `office:"minister"` and no cabinet
post: a junior minister outside the cabinet, who stays on the payroll.
**Piastri** and **Dulac** hold posts with no authored office, and they join
the payroll.

`willOf` needs `C` for this, so change its signature.

**Acceptance:** a `test.js` assertion that a sacked minister's willingness
rises by the payroll weight and an appointed backbencher's falls. Run
`npm run guards` (the canon figures must not move; if they do, say why) and
the 80-seed playtest before and after.

## 2. A person can die or leave public life

`st.characters[id].alive` is set true by `newGame()` and read only by the
Party tab (`js/ui.js` about 1579); nothing ever sets it false. Add one
effect, in `EFFECTS`, `js/schema.js` and the editor, for example
`leave:{ person:"id", why:"died"|"retired"|"resigned" }`. It:

- marks the person gone, with the reason;
- vacates any cabinet post they hold, through the existing vacancy path;
- takes them off the leadership paper (`st.signedBy`) and out of
  `signableMembers`;
- vacates their seat through the existing `vacate_seat` with `member`, so
  the by-election follows the path that already exists.

Every live reader of a person must skip the departed: the signable list,
cabinet successors, portraits and rosters. Grep for `C.characters` and
`st.characters` in `js/engine.js` and `js/ui.js`.

Add a condition to read it (`departed:[ids]`), unless `seated`/`unseated`
already say enough. Adding the reason changes the state's shape: bump
`STATE_VERSION` with an ascending migration block.

## 3. A named member can cross the floor

`cross` moves a seat between parties. A person's party is content's, copied
onto `st.characters` by `newGame()`/`reconcile()` (see the comment above
`isSeated`, about line 4311). Give `cross` an optional `member`, in
`EFFECTS`, the schema and the editor. It moves that member's seat and sets
the person's party in the save.

- A defection is simulation, so `reconcile()` must not overwrite it with
  content's party.
- Route every live read of a person's party through one helper. Grep
  `ch.party` and `.party ===` in the engine and the interface.
- A member who leaves the player's party leaves the paper.

**Acceptance:** a `test.js` case where a named member crosses. Their seat
counts for the new party, they appear in its roster, and
`tools/roundtrip.js` round-trips a save carrying the defection.

## When done

`npm run check`, then delete this brief in the last commit and push to
`main`. Any new verb needs a `CONTENT_GUIDE.md` line.
