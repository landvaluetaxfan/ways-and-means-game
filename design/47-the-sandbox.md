# 47 — The sandbox: any event, as a player meets it

**27 September 2026.** The author: "I wanted to be able to jump to any event
or decision ... I haven't even been able to see how an event actually looks
in-game yet." The old sandbox did not fit that need:

- it was a second government on the menu, Flash I with the brakes off;
- it had a test console of eleven Flash I shortcuts, reachable only through
  a queued event gated on an opening solvency no real game could earn;
- nobody used it.

## What replaced it

**A Sandbox entry on the main menu** opens any campaign on the author's
bench. It plays the campaign as a player would, with no setup changed. It
saves to a slot of its own (slot 0), which the Load screen and Continue never
show. It records no ending in the session log and earns no award.

**The Sandbox tab** has three panels:

- **Every event**: every event in the campaign's view, with a finder (title,
  id or words in the body) and chapter filters. Each row says whether the
  event is in the pool now, whether its gate holds, and how often it has
  been met.
- **The event**: where it comes from and when it can come up (campaign,
  chapter, prologue beat, fixed sitting, weight, queued only). It shows:
  - each condition of its gate, marked as holding now or not, with the
    schema's label;
  - for a queued-only event, the events that queue it, each a link;
  - every choice, with its posture, its own gate, its effects and its
    result, and a mark on any choice its gate hides now.

  **Show it on the Sitting screen** puts it up exactly as a player meets it,
  whatever its gate says. **Make its gate hold, then show it** sets what can
  be set directly: flags, flags absent, events seen, the chapter, and a meter
  nudged one past its line. It names what it left alone, such as a sitting
  number or a bill's stage.
- **Where the game stands**: the campaign, chapter, sitting and date, what is
  on the Sitting screen, **Undo** and **Try again**, the chapter, the flags
  (clear one, or set one by name), the indicators, and the campaign's own
  shortcuts.

**Every change made from the tab is snapshotted first.** After a choice, the
outcome on the Sitting screen offers **Sandbox: try another choice**. That
puts the same event back as it was before the choice.

**The editor's Play in the game button**, on every event, opens
`index.html?sandbox=<campaign>&event=<id>#preview=<the event>`. The event
travels in the address as the form holds it, unsaved edits included. The
game puts it over the file's copy for that session only (`Shell.withPreview`,
a copy of the view). `prose.html`'s `index.html?event=<id>` links now open
the bench on that event too.

**Shortcuts are content's.** A campaign may give the tab states to jump to:
a `sandbox` list tagged with the campaign, filtered like every other list.
Flash I's eleven are in `content/events.js`, and its guards apply each one
to a fresh game. The console's "close" control went with the console.

## What retiring it found

`station_issue` opens the Foreign Affairs tab's actors panel, marks the
powers on the globe, and gates the Assembly-floor initiative. **No event set
it.** The console's two shortcuts did, and lint counted the console as its
setter, because the console event's choices embedded them.

So in real play of Flash I, the powers never arrived on Foreign Affairs.
design/32 had decided "set `station_issue` in `f1_stranded`", and it was
never built. It is built now, as the event's own effect: the station question
is before the government from the moment the platform is stranded, whichever
answer is given.

Neither change moved the canon run: the count is still at sitting 57, with a
thermal margin of 17 and the government's side at 149. Nor did either move
any playtest strategy's outcomes across 640 runs, although the event count
went from 132 to 130.

## Checks

- **uitest walks the bench end to end:**
  - the menu entry, the listing and the gate read-out;
  - Show, choose, Try again and Undo;
  - setting and clearing a flag, and Make its gate hold;
  - the shortcuts, the finder, and the queued-by link;
  - a fall on the bench that is not recorded (proved by breaking the guard);
  - the bench's own slot;
  - an address naming only an event, and the editor's unsaved copy winning;
  - the Load screen, and the absence of the old government.
- **edtest** clicks Play in the game on an edited event and reads the event
  back out of the address.
- **uxtest** counts the tab's selecting table as the eighth.
- **`npm run layout`** opens a bench and measures the tab and the Sitting
  screen with an event put up. It found the tab's grid rule placed after
  the one-column collapse rule, which squeezed the middle panel to 36px at
  820 wide.

## Not done

- The effects are shown as JSON, which is exact but not friendly. The
  editor's labels could be reused.
- The bench cannot move the sitting number or a bill's stage to satisfy a
  gate. Those are left and named, since faking them leaves the rest of the
  state disagreeing.
