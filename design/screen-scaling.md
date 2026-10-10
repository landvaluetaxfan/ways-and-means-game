# Screen scaling: first usability pass
9 October 2026. Author requested screen scaling and visible screenshots for review.

## What changed
- Below 1080px, Sitting follows its semantic order: current business, ministerial brief, history. Named grid areas preserve the history-left desktop arrangement. Wrapped scrollbar containers receive the same placement.
- A stacked Chamber gives the selected bill its natural height. The complete explanation and controls share the page scroll. Desktop panel scrolling remains.
- At 600px tall and below, the whole main menu scrolls. The printed footer follows the controls instead of covering them. Text sizes are unchanged.

The author asked which narrow layout was best. Codex recommended the single column because business and advice each need readable width when the window narrows or zoom increases.

## Root causes and regression coverage
The narrow Sitting inherited the desktop DOM order, placing the whole history before current business. Its DOM now puts current business first, matching narrow visual and keyboard order; desktop CSS positions each named column.

The Chamber retained its desktop zero flex basis and minimum-height bill panel after stacking, leaving a shallow internal scroller on a page with room to grow. Narrow overrides now release both the panel and its body.

The main menu footer remained fixed below a shrinking stage. At 683x384 it took 215px, and the buttons overlapped it. A short window now scrolls the complete menu, keeping the footer below the buttons.

## Correction to earlier verification
The layout probe did not take office inside the running terminal. After the opening began locking other tabs in 182e15d, its check accepted any active screen, so it could measure Sitting under other tabs' names. The earlier 28-load layout results for the order/opening and supply batches overstated tab coverage. Their independent screenshots and interaction checks remain valid.

The probe now takes office and reads the act card with reduced motion, prepares a mid-act state where relevant panels have been introduced, and verifies that the requested tab is actually active. A deliberate locked-opening negative control produces NOT DRAWN and an active-tab mismatch. New layout assertions reject history before business and a compressed stacked bill.

## Evidence
Before: the corrected probe failed eight narrow loads, native and wrapped, for the Sitting and Chamber faults; short windows also exposed the menu overlap.
After: 32 Edge loads, native and wrapped, with game sizes 2560x1440, 1920x1000, 1600x1200, 1440x900, 1366x768, 1280x800, 1024x640, 820x1180, 768x512 and 683x384. Editor checks run at the six wider sizes. Zero layout findings, zero missing tabs and no horizontal page overflow.

Edge resolved Arial Narrow for interface text and Segoe UI for reading text on this Windows installation.

Full suite: 20/20 checks passed in 302.98 seconds with two workers.

Additional checks cover DOM and visual order, focus on the last menu button, reaching the bill's last control, unchanged simulation while reviewing and scrolling, and opening layout with both scrollbar modes. Negative control verifies that a locked tab cannot pass.

Screenshots, raw metrics, red/green layout reports and the before/after gallery are in the author's local visualizations folder:
2026/10/09/01a12154-d825-7fc0-8f97-64451fb90dbf/scaling/walkthrough.html.

The smaller viewports exercise available layout space, including that of a zoomed desktop window. Actual browser-zoom behavior and enlarged-text preferences remain to be reviewed separately. This is the first scaling pass; other panel priorities and game-wide Back/Forward navigation remain in the accessibility handoff.
