# 56 — The campaign as a play

**Built 28 September 2026**, at the author's direction. The model is the
casting notes in the introductions of *Things That Never Were*, a community
mod for The Campaign Trail. The author approved these motifs: a performer's
note, a cast of characters, acts with stage directions, intervals, a curtain
call, marginalia and epigraphs. A chaplaincy (prayers and intercessions)
is undecided.

## Two layers

- **The frame is theatre, outside the world.** The act
  cards, the intervals and the curtain call appear only at the edges: after
  the introduction, when a chapter opens, when the House returns from a
  recess, and on the last page. They wear what the world's pages never do:
  cream paper, a double rule, a serif display face, an ornament, and the
  play's name and mark.
- **Artefacts are in the world, and may interrupt a page.** The Prime
  Minister's marginalia (`margin`, initialled A.E.F.) and epigraphs. Each
  would exist in 2080.
- **No form-breaking in the working surfaces.** Choice notes, tooltips and
  the Concordance stay plain.

## Where it lives

- A campaign's administration carries `play`: `title`, `logo` (the title set
  as an image, in `img/plays/`) or `mark` (an ornament above the title in
  type), `playbill` (an image), `cast` (`{id, name, role}`), `ensemble`, `acts` (keyed by
  `chapter`, each with `head`, `title`, `epigraph`, `direction`),
  `intervals` (keyed `after` the sitting period just finished), and
  `curtain.epigraph`.
- The introduction's last sections before the signature are "The role", a
  body section with the note for the performer, and "Cast of characters", a
  `cast` section that lists `play.cast`. A separate programme block after
  the signature was built first and removed the same day: it displaced the
  signature, and the author did not like how it looked.
- The page kinds are `act`, `direction`, `cast` and `margin`
  (js/setpiece.js). In an epigraph, " / " is a verse line break.
- The act and interval cards are shown once each, before the sitting's
  business. They are marked read by `_act<n>` and `_interval<n>`, flags
  reserved for the interface like `_introRead`, and are not shown in the
  Sandbox. The curtain call closes the last page. It lists the cast with
  what became of each: the Prime Minister's line is the verdict, and
  everyone else's is the latest chronicle entry about them (design/55), or
  their part.

- **The playbill and the logo (29 Sep, the author's artwork).** On the
  menu, a government whose play has a `playbill` is chosen from it: the
  button is the playbill with the play's name and the government's beside
  it, and "Read the playbill" opens it at the screen's height (a click on
  the picture shows it at the page's width, and Close or Escape puts it
  away). In play, the `logo` heads the Sitting screen's first column for
  the whole campaign, and replaces the title in type on the act and
  interval cards and the curtain call. A government with neither keeps its
  face button and the typed title.

## Flash I

- **The play is *After the Springtime*** (the author, 28 Sep). The title
  comes from the introduction: Flash came up in 2070, "in the
  Commonwealth's springtime", and the play is set ten years after it. Its
  mark is a sprig past its bloom inside the ring of an orbit, with one
  petal falling.
- **The acts:**
  - I, *The House Is Sitting* (As You Like It);
  - II, *Ways and Means* (Henry George, on the right to breathe the air);
  - III, *The Count* (Ecclesiastes 3:1).
- **The curtain call** quotes The Tempest: "melted into air, into thin air".
- **New details, the author's to change:** the performer's note gives
  Flash's age (early fifties) and voice (alto).
- **Marginalia** are on the five pages that carry a document: the wind-up
  notice, the Allocation Act, the emergency draft, the resignation
  statement and the Standby Facility's clause.
