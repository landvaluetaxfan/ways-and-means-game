# 77 — The tutorial mechanism

**Decided by the author, 5 October 2026:** "we should also build the tutorial mechanism, with
tutorial popups, concentration mechanics like narrowing down to the relevant mechanics that
are being taught (maybe with UI darkening)."

This **reverses** three earlier rules, and a later record overrides an earlier one: `design/14`
§3 (no tutorial box), `design/21` §2.1 and §7 (no modal, no gating of the interface) and
`design/58` ("There is no separate tutorial"). The reasons behind those rules still hold, and
they are kept as constraints below.

## What it is

A **step** is a content entry: when it fires, which part of the interface it points at, what
it says, and what dismisses it. The player sees a **card** (title, a few lines, a button)
beside a highlighted **region**, with the rest of the interface dimmed. One mechanic per card.

- **Regions, not selectors.** `js/ui.js` registers named regions (`order-paper-time`,
  `treasury-vacancy`, `bill-row`, `calendar`, ...). Content names a region and never a DOM
  selector, so the five tab passes (`briefs/ui-tabs.md`) cannot silently break a step. A check
  asserts that every region a step names resolves on the tab it names.
- **Triggers reuse the condition vocabulary** (flags, sitting, a bill's stage) plus two the
  interface can answer: the player opened a tab, and the player did a thing (`done`).
- **Dim, and block the pointer outside the region.** The region itself stays live, so a card
  can say "click here" and the click works. The card's button and Esc always dismiss. Reduced
  motion is respected, and focus returns to where it was.
- **It survives a re-render.** The overlay re-measures after every render, on resize and on
  scroll. If its region is not on screen (the wrong tab), the step waits.
- **It is UI, not simulation.** `st.taught` records which steps have run, beside `st.cxRead`
  (the Concordance's read-state, the same kind of thing), so a loaded game does not teach
  again. `Shell.opts.tutorial` is the player's preference: on, hints only, or off. Nothing here
  touches the seeded events, so determinism and the playtest are unaffected.
- **Off in every harness.** `uitest`, `uxtest`, `layout` and the playtest run with it off. Its
  own check (`tools/tutest.js`) turns it on.

## Constraints kept from the old design

1. **The teacher can be a person who wants something.** A step may carry a `voice` (a character
   id): the card then shows their name and portrait. Without one it speaks in the plain voice
   of the game. No new characters (bible §2.7).
2. **Never explain what the player has not met.** A step fires when its mechanic is first
   needed or first on screen, not at the start.
3. **Act I stays loss-proof, and every lesson has a second chance.** A dismissed card can be
   re-offered at the next occasion, and the Options popover can replay any of them.
4. **Dim, do not hide.** Nothing in the interface is removed until taught.
5. **The surfaces stay**: tooltips, the `?` mode and the Concordance are how a forgotten
   lesson is re-found.

## The curriculum

`design/21` §3 already lists what the player must be able to do by the end of the opening:
read a decision and see a number move, say what a bill is and what stage it is at, read the
order of the day, grant order-paper time, commit members to a division, call one. `design/76`
adds what the Appropriation needs: appoint the Treasurer, set the five clauses, read the rise
as a deadline, and read the Economy tab's account. Claude writes the steps for Flash I, fifth
by fifth, as Act I is drafted; the build ships with one working step, order-paper time.

## Decided defaults (the author may change them)

- The pointer is blocked outside the region (the alternative is dim but clickable).
- Tabs are not revealed progressively. If a first-time player is still overwhelmed by nine
  tabs, a later pass can pulse the relevant tab instead of hiding the others.
- The voice is plain unless a step names a character.
