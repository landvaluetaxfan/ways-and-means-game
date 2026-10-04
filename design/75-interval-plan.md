# Stage 4: interval engine plan

The campaign's existing theatre frame is the content home. `administrations[].play.acts` names chapters and `play.intervals` names the period just ended (`content/campaigns/flash_i/campaign.js:119-127,146-170`). The interface already draws those interval directions (`js/ui.js:5943-5968`). Add optional simulation fields to those same interval entries; Flash I's entries and calendar stay untouched.

## Existing clock

- `walkSittings` applies `setup.recessDays` after each period and `dateOfSitting` returns the resulting date (`js/engine.js:7622-7657`). A four-month break needs no second calendar.
- `advance` increments the sitting, sets its date, resolves due effects, applies the rise through `recess` or `prorogue`, then ticks the economy (`js/engine.js:8789-8864`). `recess` refills period slots without killing bills (`js/engine.js:8387-8405`); `prorogue` ends the session and drops introduced unfinished bills (`js/engine.js:8585-8620`).
- `tick` uses calendar days since the last tick for the economy and the Bank's dated meetings (`js/engine.js:7323` and `js/engine.js:6552-6568`). Inspect its debt and macro paths before deciding whether the long gap needs a correction.
- `canReshuffle` currently blocks a partner's post, a post without another eligible holder, and exhausted order-paper time (`js/engine.js:2849-2891`). `reshuffle` spends a slot and damages relationships and loyalty (`js/engine.js:2894-2923`). During an open interval, waive the time and dismissal penalties for the player's own ministers; retain the partner and successor constraints because they describe ownership and an appointable cabinet, not the sitting's dismissal gate. The window closes once the interval's course decisions are complete.

## Shape and order

Add `setup.intervalDays` (28 in the synthetic campaign) and `setup.intervals` sentence templates for `endured`, `decayed`, and `used`. An existing `play.intervals[]` entry may add `id`, `interval:true`, and `choices:[eventId, ...]`, with one or two ordinary decision ids. `advance` detects either a date gap above the threshold or an explicitly flagged entry at the period boundary. `Engine.interval(st,C,gap)` receives the existing frame entry, old and new dates, and elapsed days. It resolves dated undertakings and queued effects in the gap, runs a small ordered `intervalSteps` registry (first step: economy), and saves `st.interval={id,from,to,days,rows}` plus the minimum pending course progress needed to resume a save. Row text uses `fillFigures` and `briefing` figures; all sentences are content owned. The course decisions use `choose`, then the interval closes before ordinary sitting business resumes. No gap means the current `advance` path is byte-for-byte equivalent in effect.

## Verification

Use a synthetic administration with a three-sitting first act, four-month recess, and three-sitting second act. Assert the dates, receipts/outgoings/interest and Bank meetings, an item queued for a day inside the gap, each report kind, course choice and answer, reshuffle opening and closing, and exact save/load mid-interval. Temporarily omit gap accrual and require this test to fail, then restore it. Compare 80-seed Flash I sweeps before and after (identical), run guards, all checks and layout. Bump save version to 38 with an ascending migration; preserve reserved 36 and 37 on rebase.
