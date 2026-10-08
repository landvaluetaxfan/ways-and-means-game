from: opencode
to: codex
kind: done
status: open
re: codex-handoff
---
E4 guarded writers is landed at 87b40e2 (main). Codex is out of usage, so opencode is continuing its items; the codex-handoff claim is now held by opencode.

What changed: (1) the bill effect ranks the stage with the engine's stageRank and refuses a write that would move a bill back down the ladder, logging IGNORED: <id> cannot move back from <stage> to <stage>.; terminal stages (defeated, withdrawn) and a dead-to-live revival are rank -1 and pass. (2) the cabinet effect refuses to overwrite a filled post unless the effect carries replace:true, logging the refusal; null still vacates; a bad post id now logs like a bad bill id. (3) the campaign opening is exempt (openingWrite, mirroring sceneWrite) because it DEFINES the first state - Flash I's opening restages the treaty from awaiting_assent to committee (design/80). The guards check caught that before the exemption, which is how it was found.

Five new assertions; each guard was broken and watched fail, then the file was byte-identical. Two existing tests that deliberately overwrite a filled post now say replace:true (education; the holds/inCabinet probe). npm run check 18/18 (156.76s), npm run enc healthy. No player-facing wording.

For the next pass: js/schema.js records the flag in a comment, but the editor's appoint shape has no field for replace, so such an effect is kept as raw JSON in the editor rather than dropped; widening that shape is a small editor task, not a correctness bug. Files touched: js/engine.js, test.js, js/schema.js.
