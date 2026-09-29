# 57 — When does the player act?

**An examination, 29 September 2026. Nothing here is built.** It answers
the author's question and asks for a decision.

> "We still sort of fall into the trap of giving the player a bunch to do,
> but they don't know when to do it on their own. Outside of when they are
> given an undertaking or give a promise, when will a player know they
> should do something like initiate an instrument by themself, or draw
> money? … To them, they're just buttons that do things." And: "a wider
> structural issue, one we have continuously tried to address … we need to
> examine what to do with it, hard."

## 1. What has been tried

The problem has been named three times, and each answer added a
mechanism.

| record | the finding | the answer built |
|---|---|---|
| design/18 §4 | "The player cannot start anything … a spectator with buttons." | initiatives: spend order-paper time, and an event comes later |
| design/19 §2 | "Two games that do not touch": read, choose, advance; the missing verb is *govern toward it* | undertakings with dates, the docket |
| design/37 D9 | "The levers that decide runs are the ones nobody finds" | docket alerts (design/38 §7), then the ladder's lead time (1b), then a partner near its line (design/40 E9) |

Each answer made a lever **possible** or **findable**. None of them made it
**wanted at a particular time**. That is the question the author is
asking, and it is still open.

## 2. What the game does today, measured

**The loop the interface builds** is: read the page, answer the decision,
press Rise. Today, the Sitting screen's list of what is asked, holds
duties (the decision, deadlines, undertakings, a vacant post) and
warnings at the edge of failure. There are three alerts (a thermal margin
under 15, an empty reserve, arrears), the ladder's time, unspent slots,
and a partner near its line. Rise counts what is left unanswered. Nothing
on the Sitting screen says that something is coming, or that something
could be gained.

**The levers describe themselves, not the problems they answer.** There
are 19 initiatives, 18 orders and 11 bills, plus drawings, the Bank, the
cabinet, the whip and the paper. Every initiative's note and every order's
summary says what the thing is or does, for example "The Reserve Bank sets
the cash rate and the government does not…" or "Directs the Reserve Bank
to hold the cash rate…". None says when a Prime Minister would reach for
it. Six initiatives are open from the first sitting, and nothing ever
asks for them: approach_guild, commission_review, state_the_position,
quota_forward, charter_volume and lean_on_governor.

**Doing what the game says is not enough.** `node tools/playtest.js
--seeds 80`, on this commit:

| strategy | lost of 80 |
|---|---|
| first option, never acts on the docket | 54 |
| first option, does everything the docket says is today's business | 33 |
| cheapest option, the same | 21 |
| costliest option, the same | 25 |

A player who obeys every warning still loses between a quarter and two
fifths of games, and every loss is a late thermal cascade.

**The warning comes after the time to act has gone.** Take one losing
run (first option, default seed):

- The margin opens at 17, two points above the docket's line of 15.
- The alert at 15 is not today's business, so the strategy waits.
- It acts first at sitting 43, when the alert turns urgent at 8.
- It climbs four rungs in four sittings, and the cascade comes at 49.
- Meanwhile the Thermal Quota (No. 2) Bill waited sixteen sittings for
  order-paper time.

The canon script survives because it acts before any warning. It knows
the answer; a player does not.

**A seventh of the game sits behind unprompted buttons.** Of 132 events,
42 are never met in any of the 640 runs. Nineteen of those are queued only
by a lever the player must think to pull, among them guild_answers,
review_reports, governor_answers, the indemnity and substrate-debt
settlements, the emergency, the leases, the relays and f1_air_paid.

**The foresight exists, somewhere else.** The engine already forecasts:
- the reserve's runway ("lasts four months at this rate");
- the count (the polls);
- the Underwriters' outlook, which the code calls "advice … the arithmetic
  done for them".

All three sit on the Economy tab or the polls, which a player must
already know to open. The thermal margin and consumables have no runway
at all. None of these readings reaches Today, and none names a lever.

## 3. The diagnosis

A person acts unprompted when three things are true at once:

1. **They can see a problem coming**: a trend with a date, not a level
   already past a line.
2. **They know what answers it**: a remedy, with how long it takes and
   what it costs.
3. **They want something the default will not give them**: an aim of
   their own.

The game supplies each of these partly, and never together:

- the trend lives on other tabs;
- the remedy is linked only for three alerts (`raises`), with no lead
  time;
- the aim is supplied only by undertakings, and those come from events.

So the path of least resistance, which the interface builds, is the
page, the decision and Rise. The levers are a toolbox beside the story,
and a toolbox is not a reason.

Real Prime Ministers rarely act unprompted either. The system prompts
them:
- the red box of submissions from departments;
- the Treasury's warning;
- the Chief Whip's note;
- the diary.

The Commonwealth has these people (Devi, Skye, Vidyasagar, Girard,
Landry), but they speak only inside events. An event ends in a choice,
not a lever, so the levers answer nobody's concern.

## 4. Two structural answers

### A. The brief (recommended): make the problems first-class

A campaign declares its **matters**, the handful of things a government
has to watch. Each is content, in the schema the engine defines:

```js
{ id:"heat", owner:"girard",                  // who raises it, in the world
  watch:{ scalar:"thermal_margin" },          // what it reads; the engine projects the trend
  line:8, lead:6,                             // the line, and the sittings its remedies take
  remedies:["order:rung1_conservation", "bill:thermal_quota_2",
            "initiative:charter_volume", "draw:standby"],
  raise:`At this rate the margin is under {line} by {date}. The ladder takes about {lead} sittings to climb.`,
  after:`{owner} warned on {raised}. The first rung was open from then.` }
```

- **It is raised early.** The engine projects each matter's trend (the
  runway code, generalised). The brief opens a matter when the forecast
  crosses its line within its lead time, not when the level does. That
  is the warning while there is still time.
- **It is on the Sitting screen**, as the brief (the red box), next to
  Today. It shows each open matter: its owner, the trend and date, and its
  remedies as links to the levers, each with time and cost. At most three
  are open at once, ranked by the time left minus the lead. The brief is
  advice, not duty: Rise does not count it, so it informs without nagging.
- **Owners disagree.** A matter can have two owners with different
  remedies. For the reserve, Skye would borrow, and Hatt would sell the
  works. The choice stays the player's; what the brief adds is *when* and
  *why*.
- **Failure attributes.** A loss or crisis page names the matter, when it
  was raised and what was open, so the next game is played differently.
- **Every lever answers a matter, or it is flavour.** Each lever's panel
  says which matters it serves. An initiative with no matter either gets
  one, or gets a window (open when a situation invites it, gone when not),
  or is cut. The three alerts become matters, and the ladder item becomes
  the heat matter's lead time.
- **An aim, as well as threats.** At each act's opening, the government
  names its priorities for the act. The player chooses two or three from a
  short list the campaign offers, or the coalition agreement supplies
  them. Each is a matter with a target rather than a line. This is design/19's *govern toward it*.

It is mostly content. The engine needs:
- a projection for any watched reading;
- `matters(st, C)`, beside `today()`;
- the schema and the editor.

The alerts, the outlook and the runway are already most of it.

### B. Fold the levers into the story (The Campaign Trail's way)

Here a lever is offered by a person at the moment it is wanted, as a
decision. The margin_thin decision ("Below ten — buy CW$10bn of cooling
capacity") already works this way, and the playtest's dumb strategies do
take it. The tabs become the record, and the place where a player who
reads ahead can act early.

- **For it:** it is cheaper, and it is closer to the author's model. The 99
  decisions already work this way.
- **Against it:** it makes the simulation a backdrop. Every lever pulled
  is a choice somebody offered, and design/19's *govern toward it* is gone.

**These combine.** B is A's late channel. When a matter reaches its line
and nothing has been done, its owner brings it as a decision, as
margin_thin does now. A is the early channel, the one that lets a player
act unprompted and be right.

## 5. What would prove it

- **The playtest.** A new strategy reads only the brief and takes each
  open matter's first remedy. It should lose far fewer than the 21 to 33
  runs lost by strategies that obey the docket, and it should meet some of
  the nineteen lever-gated events. A strategy that ignores the brief
  should still lose.
- **The author.** Play chapter two with the brief, open no tab except
  where it points, and judge whether the game asked for the right thing
  at the right time.

## 6. Questions for the author

1. **A, B, or A with B as its late channel?** The recommendation is A with
   B.
2. **The aim:** does the player choose the act's priorities, or does the
   coalition agreement set them?
3. **How many matters open at once?** Three is suggested.
4. **Voice:** is a matter a note in its owner's voice ("From the
   Financial Secretary: …"), or a plain line in the docket's register?
5. **The six initiatives open from the first sitting:** does each get a
   matter or a window, or is it cut?

Until this is decided, the rework of the opening's teaching dialogue
waits. If the brief exists, the opening should teach the brief, not the
rules of the House.
