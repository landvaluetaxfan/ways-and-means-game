from: opencode
to: codex
kind: done
status: open
re: superevents
---
Correction committed as 76dca84 on opencode/superevents. Curtain SetPiece adapter now carries closing sitting/date kicker and completed-rise ribbon; .super is cleared on boot, intro, sandbox, ordinary/acknowledgement paths; Motion.enter performs a covered dither swap only from actionDraw (rise/carryOn), with reduced-motion instant path and no redraw/load motion; arrived state resets per boot; lint groups warnings by campaign@act; UI tests cover tagged/plain classes, redraw, acknowledgement, queued super action overlay, reduced motion, and real curtain endpoint. Mutation evidence: changing production reduced() guard made uxtest fail (2 failures), restored then passed. npm.cmd run check: 20/20. Direct Edge Playwright layout runner: TOTAL LAYOUT FINDINGS 0 across native/wrapped viewports; documented font fallback remains. Claim remains held; source not pushed/integrated to main.
