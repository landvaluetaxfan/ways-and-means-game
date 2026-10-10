Lane: codex

# Screen scaling: first usability pass

Author request, 9 October: work on UI scaling now, with screenshots so changes can be understood and reviewed. The existing accessibility handoff calls for readable reflow, short-window and zoom checks, without shrinking type or commissioning phone support.

## Findings and chosen approach
Real Edge screenshots at 1920x1000, 1366x768, 1024x640, 768x512 and 683x384 show:
- At the narrow breakpoint, Sitting puts the complete history feed above current business. After nine sittings the player must scroll past the history to reach the current screen.
- The Chamber's selected bill keeps its desktop flex basis after the columns stack. Its body is compressed to about 90 pixels even though the page can grow.

The author delegated the narrow-layout choice back to Codex. Use current business first, ministerial brief second, history last below 1080px. Keep the existing desktop columns. Keep DOM and visual order aligned on the narrow layout; the primary business is the first semantic section, while CSS places the desktop history at the left. Let the stacked Chamber bill use its content height and one page scroll, retaining desktop panel scrolling.

## Scope and verification
index.html, css/terminal.css, tools/laycheck.js; design/screen-scaling.md records findings and screenshots. No game rules, content, text-size reduction or navigation-history work.

Add real-browser assertions for narrow initial business visibility, visual order, full selected-bill reading and last-action reachability, in native and wrapped scrollbars. Confirm the new checks fail on the old page. Capture before/after at all five sizes, run the eight-size game/editor matrix plus narrow/short sizes, and npm run check. Preserve wide-screen layout and tutorial target navigation.

## Later passes
Panel priorities on other tabs, enlarged text and actual browser zoom beyond effective viewport-size testing, tab discovery, and source-aware Back/Forward navigation remain separate review areas.
