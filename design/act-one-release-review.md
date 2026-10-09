# Act I release review — 8 October 2026

Codex reviewed the actual Sitting page on cautious, bold and fidget paths,
including the introduction and Act I card, every available choice's note,
the promise display, conditional event pages and the ending. Captures live in
the session evidence directory as `release-walk-{cautious,bold,fidget}.json`.
The harness driver is an evidence artifact, not a new game tool.

## Findings and disposition

1. Event pages with no choice said “No decision this sitting” immediately before
   “Continue to the sitting's business” opened a decision. Fixed: “No decision on
   this page”. The quiet-sitting heading keeps its existing wording.
2. The preserved introduction/card described the old Parliament before an August
   election, while the commission described the new Parliament after March's
   election. The author explicitly approved correcting these factual lines.
   Fixed to the January leadership change, March general election/First Spin,
   first session on 11 April 2080 and next general election in 2084 (bible §§1.8,
   11.1). The surrounding authored writing remains intact.
3. Clean installation lacked a declared Acorn dependency, although archive and
   fixture checks use it. Added the existing 8.19.0 parser to the development
   dependencies and lockfile. This does not alter or redo the fixture migration.
4. The register scan reports contrast framing in the attributed Burke epigraph.
   Retained as an authored quotation, rather than rewriting its source text.
5. Lint's existing advisory names “uplift” as absent from the glossary. The first
   scene explains “uplifted” immediately as animals made sapient. This is a
   substring vocabulary advisory, not an unexplained first-use fault in these
   walks. No new setting term or glossary entry was invented.

No additional unexplained action, number, contradictory scene premise or
repeated-scene fault was found in these sampled paths. Cautious and bold reached
the curtain; the fidget path ended with recorded supply loss. All three completed
without a throw, ignored effect or stuck screen. Random fidget coverage remains
the full 240-seed check, beyond this one deliberately readable path.

## Release boundaries

The two inventory-B setup tokens are substituted. The ordered author review
sheet is `prose-act.txt` (1520 passages before the factual correction), generated
by `npm run prose:act`; the full prose export is regenerated after every edit.
E11 superevents is delegated to opencode and must pass Codex review and final
checks before inclusion. The author's own first playthrough remains acceptance.

The itch.io project is `https://chereamie.itch.io/ways-and-means`. There is no
GitHub `ITCH_TARGET` variable or `BUTLER_API_KEY` secret configured. Browser
control could not start because of the Windows sandbox helper; uploading and
checking the actual itch.io embed remain outstanding. A locally verified iframe
is evidence for the candidate, not proof of the hosted page.

The author will give testers their Discord feedback destination directly.

Cleanup verification: all 20 checks passed in 197.36 seconds without NODE_PATH;
the final 80-seed report is byte-identical to the before report. Direct Edge
native/wrapped layout at seven sizes reported zero findings. The curtain at
1920x1000 and 1366x768 retains sitting 16, 8 May, with no console errors or
horizontal overflow. E11 requires its own combined-build verification.
