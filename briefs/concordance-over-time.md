**Lane: Codex** (the mechanism), then **Claude** (deciding what each article
reveals and when). Written 28 Sep 2026 from the author's note.

The author, reading the Concordance: "a lot of information is there when
it's dependent on things that happen later in the game, like the stuff in
the page for the standby facility ... it should start with a wealth of
information, but also update actively over time as the game progresses. We
could maybe even have an animation to indicate changes in the concordance."
The author also says the Concordance has many other issues, to be taken up
later.

1. **Mechanism (Codex).** A section can already carry `when` (see
   `js/encyclopedia.js`). Record which sections the player has already seen,
   and mark an article or section that has appeared or changed since, in the
   Concordance's navigation and on the article, with a brief animation. Keep
   that record in the save, not in `Shell.opts`.
2. **Content (Claude).** Audit the articles for facts the story has not yet
   reached, starting with the Standby Facility, and gate them with `when` on
   the flag or event that makes them true.
