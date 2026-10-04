**Lane: Codex.** Written 4 October 2026 by Claude, from reviewing the
tabs overhaul and the brief against `design/58` and `design/62`. Small and
independent: do it before `opening-playable-slice.md`, which waits on the same
screen.

Read `AGENTS.md` and `design/62-why-the-overhaul.md` first. Keep every look
the author likes. Run `npm run layout` after each item, with the real
browser, and `npm run check` before each push.

Three faults in what is built, found on 4 October by playing the opening and
sitting 17 in a real browser. One commit each.

Execution checkpoint: items 1 and 2 are implemented. Item 3 remains open.
The author asked to wrap the batch with 15% of the five-hour allowance left;
keep this brief until item 3 is complete. The opening evidence map is next
after item 3; the author's live request requires stopping at the map before
drafting content, despite the later brief's instruction to continue.

## 1. The Sitting says the same thing twice

At sitting 1 the brief shows "Treasurer is vacant" under **Owed**, and
"Treasurer stands vacant" again in **the docket** beneath. "The House is
waiting on you" has the same overlap with the docket's own lines.

This is the fault `design/61` merged out of Chamber, and it breaks
`design/62`'s second test: keep owed and advised apart, and do not print an
obligation twice. Owed (from `Engine.today()`) is what the player must do.
The docket is what is coming. Make the docket skip any item already listed
under Owed, and keep both groups. Read `drawToday()` and the docket code
first, and decide the cleanest way; the rule is that no obligation appears
twice on one screen.

## 2. Two remedies read the same

On the Works' air matter, both remedy buttons say "Supply the Almanac Works'
air plant". Only the line beneath each tells "open payment, CW$1.6bn" from
"Commonwealth manufacture, CW$600m". A player scanning for the choice sees one
button twice.

The button shows the lever's name. Add an optional `label` to a matter's
remedy (`{ lever, takes, note, label }`), with the lever's name as the
fallback. It needs the schema entry, the editor, validation and a test, like
every content field. Set labels on the three Flash I matters. Write them
plainly, as short verbs ("Pay the suppliers now", "Make the parts here"), and
name them in the commit message for Claude's register pass.

## 3. The Economy's money calls are below the fold

`design/61` says the Economy leads with the Underwriters' briefing and puts
the calls the player can make now beside it, standing out. As built, the
"Money calls" are the foot of the narrow account column and are cut off at
the first line ("Earth's governments read a drawing as a political act:") at
1366 × 768.

Give the calls their own panel in the top row, beside the account, and move
the Underwriters' briefing to lead the lower row as `design/61` says. Keep the
look and the existing call logic; this is placement only. Verify at 1366 ×
768, 1024 and 820 widths, with a call open.

## Not in this brief

- The opening's empty brief ("No minister has raised a matter") is fixed by
  the opening slice, not here.
- Initiatives still sit on the Prime Minister's card because they have no
  `post`; Claude assigns those in content. The button labels in item 2 are
  Claude's register pass to refine.

Delete this brief in the commit that finishes item 3.
