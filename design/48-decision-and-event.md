# 48 — Decision and event

> **Superseded by design/49** (27 Sep). The author's answer: a *decision* is
> the sitting's business, and an *event* is a page that arrives (a special
> outcome, a roll of the dice, a threshold) and is visually special. The four
> kinds below answered a different question and are gone; `Engine.eventKind`
> returns `event` or `decision`. The sandbox's player-started decisions, below,
> stand.

**27 September 2026.** The author: "have we been distinguishing between
decision vs event?" We had not.

## What was the case

The game had one kind of thing: an event, which is a scene plus a list of
choices. Read by their choices, the 130 events were four different things:

| kind | count | what it is |
|---|---|---|
| decision | 106 | two or more answers are open whatever the state |
| notice | 13 | one answer, nothing to weigh ("The writs" → *To the country.*) |
| outcome | 7 | every answer carries a condition, so the state picks the one the player reads ("The ruling") |
| conditional | 4 | one answer always open, the others only when their conditions hold ("The case for the facility") |

The Sitting screen headed all of them **Decision**, so a notice read as a
decision with the other options missing. The distinction existed only in
passing:
- the editor's coverage warning ("a notification rather than an event");
- lint's posture rule, which exempted outcomes;
- a comment on the set piece.

There was a second meaning of "decision" too: the decisions the player
starts, which are not events at all. These are 18 initiatives and 17 orders,
plus the bills, the whip and the leadership paper. The sandbox listed only
events.

## What was built

- **`Engine.eventKind(e)`** reads the kind off the choices. Nothing is
  stored, so the kind cannot drift from the choices.
- **The Sitting screen's heading follows what is open now:**
  - *Decision* when two or more answers are open;
  - *The result* for an outcome with one open;
  - *The one answer open* for a conditional event on a sitting when its
    other answers are shut;
  - *What happens* for a notice;
  - *No answer is open now* when none is.
- **The Sandbox tab** marks each event's kind and filters by it, and says
  the kind in words in the event's reading.
- **The editor's event form** says which kind it is. For a notice it adds
  how to make it a decision.
- **Lint's posture rule** uses the same function, so there is one
  definition.
- **The sandbox lists the player-started decisions too.** There are three
  lists, Events, Initiatives and Orders, each read out gate by gate.
  - An initiative shows its cost, whether it is open now, what taking it
    does, each way of doing it, and the event that answers it (a link).
  - An order shows its procedure, who makes it and whether that post is
    held, whether it can be made now, and what making, revoking and its
    politics do.
  - **Open it on the Government tab** puts it where the player takes it,
    open and in view. **Make its gate hold, then open it** sets what can be
    set first. For an initiative taken before, that includes clearing the
    "already in hand" flag.

## Checks

- **test.js** reads each kind off a probe event, and checks that every
  event in content is one of the four.
- **uitest**:
  - a decision is headed Decision;
  - the kind filter finds exactly the notices;
  - a notice put up is headed *What happens* (proved by breaking the
    heading);
  - the Initiatives and Orders lists hold every entry;
  - a gated initiative and a gated order each open, now available, on the
    Government tab;
  - an initiative's answer links to its event.
- **edtest** checks the event form's kind line.

## Not changed

No event was rewritten. Whether any of the thirteen notices should become
decisions is a content question for the author. The sandbox's Notices
filter lists them.
