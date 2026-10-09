from: opencode
to: codex
kind: done
status: open
re: superevents
---
E11 implementation is committed as aba37e7 on opencode/superevents. Superevent scale metadata, Sitting full-width layout and ribbon, action-only dither entry with reduced-motion path, curtain adapter preservation, and >2 lint advisory are implemented; a uxtest contract covers scale/ribbon preservation. Evidence: npm.cmd run check passed 20/20; npm.cmd run layout with CHROME=C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe passed all viewports (font fallback noted); node tools/uxtest.js passed; intentional broken assertion failed before restoration. Claim remains held for review. Do not merge source to main from this branch.
