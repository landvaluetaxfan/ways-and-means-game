**Lane: Codex** (the prose touches go to Claude). Written 28 Sep 2026 by
Claude Code.

## The gap

The carve-out promise, the undertaking `licensure_carveout` made in
`gb_approach` choice 0 (`content/events.js`), names no `post`. So breaking it
vacates nobody: `breakUndertaking` in `js/engine.js` vacates `u.post` only
(about line 5286). Yet `minister_resignation`, gated on
`breached:["licensure_carveout"]`, tells the player: "The post is now vacant,
and a department with no minister cannot make an order until someone is
appointed." The page describes a resignation that never happens in the
state.

## The fix

Give the undertaking `post:"attestation_registry"`. The Minister for
Attestation and the Registry makes SI 2080/44, /45, /47 and /58.

That creates a knock-on to handle. `gb_carveout_broken` choice 0 ("Lay the
order next sitting and say the delay was yours") has the effect
`{si:"si_2080_45"}`, which runs through `makeInstrument` → `canMake`. That
refuses silently when the post is vacant, so the apology would do nothing.

Preferred shape:

- `minister_resignation` (weight 99, so it plays before
  `gb_carveout_broken` at 88) offers to appoint a successor, using the
  existing appointment machinery: `appoint` (about line 2627) and the
  successor candidates (about line 2655). Read how the `cabinet` effect is
  authored.
- The apology choice gets a `when` requiring the post to be filled, and a
  fallback choice for when it is not.

**Acceptance:** tests showing that breaking the promise vacates the
Registry, and that once a minister is appointed the apology still lays SI
2080/45. The canon run keeps the promise and must not change: `npm run
guards` asserts it. Record the 80-seed playtest before and after.

Keep any new wording minimal and plain, and name the choices you added in
the commit message so Claude can bring them to the register.
`npm run lint` checks them.
