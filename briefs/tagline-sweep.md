**Lane: Claude Code.** Written 4 October 2026, from the author's note and a
count of the headings. Do it after Codex's sitting-polish work (landed) and
`opening-playable-slice.md` batch A land, because they edit the same panels
(`index.html`, `js/ui.js`) and a sweep now would collide.

The author, 4 Oct, seeing the ministerial brief's "advice *while there is time
to act*": it is the tagline-under-a-label that models add everywhere. The
design's theory had leaked onto the screen. `PROSE.md` Interface rules 8 and 9
now state the standard. This brief applies it.

## The test

For every heading's italic tail, and every empty state: could it be deleted
without the reader losing anything? If so, delete it. Keep a tail only if it
carries something **the panel cannot show**: a unit, a scope, an ordering, a
condition, an instruction. A tail that repeats what a bar, a count or a marker
on the same panel already shows is cut, however true it is (the author, 4 Oct:
"6 of 6 left this period is dry... it just restates what should be visually
conveyed"). Do not replace a cut tail with a new one.

## What a count of `index.html` found (about thirty headings with a tail)

**Keep, because the panel cannot show them:** the calendar ("session 4", which
nothing else on the panel can say; see the check below), the account
("Commonwealth dollars, a year"), the Reserve Bank ("by its rule, every six
weeks"), the schematic ("altitude bands, not to lateral scale"), the country
("if counted today"), relevant actors ("ordered by delay"), what is selected
("click the globe"), the Parliament legend.

**Check the placement of "session 4"** (the author: good "assuming it's in the
right place"). The top bar also says "SESS 4.1", the cryptic form of the same
fact. Confirm the calendar's tail is the session the calendar is showing,
that the two agree, and that the top bar's "SESS 4.1" is read by a first-time
player as session 4, period 1 (consider "Session 4 · period 1" if there is
room).

**Cut or shorten:**
- Order paper time: "6 of 6 left this period" repeats the slot bar beside it
  (in the Chamber's order-paper heading, and in the Government's business
  panel).
- The ministerial brief: "advice and business owed" restates the title. Inside
  it, "Advice *while there is time to act*" becomes "Advice"; "Owed *2 things
  asked*" becomes "Owed" (the list shows the count, and the tab's red number
  carries it); "Before the House *the docket*" becomes "Coming up" (or keep
  "the docket" only if it is the term the Concordance defines; check).
- Prices: "four bases, four prices, one row each" describes the layout.
- Composition: "by tier, and how they are expected to go" describes the
  columns.
- Money calls: "drawings you can propose" restates the title.

**Decided by the author (4 Oct): the in-world tails stay.** The Concordance's
"public reference, attested editing" and the Underwriters' "the only accurate
numbers" are characterisation, "special, in-universe". They are not to be
swept.

Then do the same for the headings built in `js/ui.js` (`rulehead`, the section
labels in `drawGovernment`, `drawRelations`, `drawParty`, the Sandbox) and the
tooltips, which a grep of index.html does not reach. Sandbox panels are the
author's bench and can keep their tails.

## Empty states

"No minister has raised a matter for the brief." says nothing about what the
brief is. Draft, in the interface register, one sentence on what the panel is
for and when it fills. This is the same wording `briefs/opening-playable-slice.md`
asks Codex to draft for the opening's empty brief; take Codex's draft and put
it into register rather than writing a second one. Check every other empty
state ("Nothing has happened yet.", the Opposition's "Nothing yet.", the
Government's "Select business to read its terms and available actions.").

## Done

Lint and `npm run check` pass, `npm run layout` is clean (headings change
width), and a grep for a tail that restates its title finds none. Delete this
brief in the commit.
