# 31 — THE SET PIECE, THE ENDING, AND THE ADMINISTRATION

**20 September 2026.** Written after the author named three things he wanted —
a fuller event presentation in the manner of a Hearts of Iron mod, an ending
after the election in the manner of a Campaign Trail one, and prose on the
Prime Minister you choose — and they turned out to be one thing.

---

## 1. They are the same component

A Hearts of Iron event box, a Campaign Trail result screen and a character
select are the same object wearing three hats:

> **A full-bleed page that takes the screen, carries an image and a score,
> scrolls if it must, is built of sections rather than a paragraph, and offers
> exactly one way forward.**

Nothing else in this interface works like that. Every other surface is a panel
in a grid, reads at a glance, and is one of several things competing for the
eye. This one is the opposite on purpose: it is the game stopping to be *read*.

So it is built ONCE, as `js/setpiece.js`, and used three times. That is the
whole architectural claim of this document, and the reason to build the event
version first: the ending and the administration screen are then configuration,
not code.

## 2. What already exists, and must be reused

Nothing here is new machinery. It is assembly.

| | |
|---|---|
| `content/artifacts.js` + `js/artifacts.js` | named image slots with pinned shapes. A slot renders correctly EMPTY, so a set piece ships before its art does and filling it moves nothing on screen |
| `js/music.js` | thirteen beds, `defeat` `sombre` `moment` `rise` `prorogue` `threat` `tension` `order` among them. A set piece names a mood; it does not get its own audio |
| `js/stream.js` | text a character at a time. NEVER call it from a renderer — the renderer puts the text up silently and the ACTION HANDLER reveals it |
| `js/focus.js` | what survives a re-render. A page this long must restore scroll by data key |
| `ADMINISTRATIONS` in `content/setup.js` | the governments a campaign opens as, with a `[data-admin]` picker already in `js/shell.js` |

## 3. The set-piece event

### When it is allowed

**Rarely, and the rarity is the feature.** A set piece says *this is the thing
the session is about*. If chapter two has six of them it has none.

The rule: a set piece is for a **turn the world takes**, not a decision the
player makes. The Works being abandoned is one. A minister resigning is not —
that is an ordinary event with a good body.

Budget: **one per chapter**, and chapter one's is the opening. Four in a run.
`tools/lint.js` should count them and complain past that.

### The shape

It replaces the sitting screen's content until the player chooses. The side
panels — Today, the docket, the calendar — go, because a thing that takes the
screen must actually take it. They come back on the choice.

Content declares it on an ordinary event:

```js
{ id:"f1_stranded", chapter:2, at:8, once:true,
  setpiece:{
    art:"almanac_dark",              // a slot in content/artifacts.js
    mood:"threat",                   // a bed js/music.js already knows
    sections:[
      { kind:"lede",     body:"..." },   // what happened, plainly
      { kind:"account",  head:"What it costs", body:"..." },
      { kind:"here",     head:"The Commonwealth's part", body:"..." },
      { kind:"abroad",   head:"Who else is watching", body:"..." },
      { kind:"voices",   head:"What is being said", body:"..." },
      { kind:"document", head:"From the Almanac charter, cl. 44",
                         body:"...", source:"..." }
    ]
  },
  choices:[ ... ] }
```

`kind` is a closed vocabulary and it carries the TYPOGRAPHY, not the meaning:
`lede` is larger and unindented; `document` is set in `--f-doc` with a rule and
a source line; `voices` is quoted and ragged. An author picks a kind because of
how it should READ, and the section heads say what it means.

Four to six sections is the target the author named. It should be long enough
that a player scrolls, because scrolling is the tell that this one is different.

### The traps, from this repo's own list

- The panel/`.pbody` rules in `CLAUDE.md` apply. A set piece scrolls in its own
  body, the page never scrolls, and `npm run layout` is the proof.
- It is a `<button>` per choice, never a div wearing `role="button"`.
- Sound comes from the ACTION, never from the renderer. Entering a set piece is
  an action; drawing it again after a save load is not.
- `data-go` cross-references inside the prose reach the existing Concordance
  handler. Do not bind a second one.

## 4. The ending, after the election

**The author's correction: the endgame belongs immediately after the count,
not at the rise.** That is where the emotional payload is, and it is what the
Campaign Trail screens get right — you have finished, and the game tells you
what it amounted to.

Today the settlement shows its `closing` through `Dialog` the moment the crisis
resolves, which can be sitting fifteen, and then the run simply stops after the
count with nothing. Both halves are wrong: the payload arrives early, in an
alert box, and the actual ending is silent.

So:

1. A settlement landing mid-session **records and does not interrupt.** A line
   on the wire, a mark in the register. No dialog.
2. `ch3_the_count` ends the run, and **the last board is a set piece**: the
   result, the settlement the session reached, the register of what was
   undertaken and kept, the seats won and lost.
3. **Its register is the outcome's.** `mood` is chosen from the ending:
   `rise` for a government returned with its question settled, `sombre` for one
   that settled it and lost anyway, `defeat` for one that did neither. The beds
   exist. Hopeful, somber, tragic — the author's three words — are three moods
   and one screen.

The prose for each is content's, in `content/settlements.js` and the chapter
four events. The engine chooses which, and never writes one.

## 5. The administration

`ADMINISTRATIONS` exists and the picker is a row of buttons with a label. It
should be a set piece: the government you are about to be, given a page.

Per administration: who the Prime Minister is, what they came in promising,
what the parliamentary arithmetic actually is, and what the papers say about
them. Where there is only one on offer — which the author expects, and which is
usually true of a Campaign Trail scenario — the page is not a choice but an
INTRODUCTION, and that is the better use of it anyway.

This is the cheapest of the three: the data is there, the frame will exist, and
it is the first thing a player sees.

## 6. What this must not become

- **Not a second event system.** A set piece is a field ON an ordinary event.
  It has the same `when`, the same `choices`, the same effects, and it is
  selected by the same pool. Everything in `js/engine.js` stays ignorant of it;
  this is entirely a rendering decision, which is why the engine gets no new
  verb and the vocabulary stays at twenty.
- **Not a place to put prose that has nowhere else to go.** If a section is
  there because the author had a paragraph, it is not a section.
- **Not an image requirement.** Every slot renders empty. A set piece with no
  art must read as deliberate, not as a missing picture.

## 7. Order of work

1. `js/setpiece.js` and the event version, with one real example.
2. The ending after the count, reusing it.
3. The administration screen, reusing it.

Do 1 first and the other two are configuration. Do them in any other order and
the frame gets written three times.
