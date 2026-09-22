# The register

How the prose in this game is written, stated so it can be checked rather
than felt. Written 21 September 2026 after the author read a state note and
said: the first half is good, the rest is too vague and ends in a way that
feels AI.

They were right, and it is not one line. A scan of all 2,111 player-facing
passages found the same handful of mechanical habits in ninety-six of
them. Thirty-four are rewritten and the rest turned out to be the scanner's
fault, not the prose's. `npm run register` lists them.

## What is wanted

**Encyclopedic.** The register of a reference work: the fact first, in the
order a reader needs it. What the thing is, when, on what terms, who holds
it. A reader should be able to take a sentence out of context and still know
what it asserts.

**Descriptive, and straight to the point.** More specific, not longer. A
clause that adds a date, a term, a quantity or a place earns its space. A
clause that adds emphasis does not.

**Not AI-sounding.** Which in practice means: stop doing the seven things
below.

## The habits, and what the sweep learned about them

The first version of the scanner reported 96 passages against seven rules.
The sweep fixed 34 and **deleted or demoted four of the rules**, because
reading the hits showed they were flagging correct prose. That is the more
useful half of the exercise, so it is recorded here rather than quietly
dropped.

The report is now in two halves.

### Mechanical — fix these

A regex can be trusted on these, and all three read zero.

**1. The empty explanatory tail.** `…, which is the point.` `…, which is what
a ledger is for.` A sentence that has finished its work and then adds a
clause telling the reader what to think of it. Fifty-four passages matched
at first; **thirty were the habit and twenty-seven were not.** A tail that
ends on a NEW fact is doing work:

> which is the first elected office she has ever held
> which is why one party holds all seven

Cutting those to satisfy a regex would have flattened the prose. So the rule
now reports a tail only where it introduces no number, no proper noun and
fewer than four content words of its own. All thirty genuine ones are
rewritten.

> was: It sells the concession and not the sovereignty, and it has said so in
> writing.
>
> now: Colombia's position, stated in the concession instrument and repeated
> at every renewal, is that the lease conveys operating rights over the
> corridor and no territorial claim whatever.

> was: The Underwriters keep the premium, which is the business they are in.
>
> now: The Underwriters keep the premium.

**2. Vague quantity.** `in a decade when it needed the money`, `ever since`,
`long since`, `for generations`. The tells that name no period at all.
`for a decade` and `for two centuries` came OUT of this rule: a decade is a
quantity, and a reference work may give one.

**3. The em-dash sandwich.** Zero, and the rule is kept to hold it there.
One pair of dashes in a passage is punctuation; two is a mannerism.

### Judgement — read these and decide

These are real patterns that a regex cannot separate from their good uses.
Reporting them as faults is how a style checker gets argued with once and
ignored afterwards.

**4. The corrective pair.** `It is not X. It is Y.` **Adjudicated 22 Sep
2026: eleven read, five rewritten, six kept.** The form is informative when
the thing being denied is what a reader would actually assume:

> The office is not elected. It is held by whoever can command a majority in
> the House of Delegates.
>
> Its grievance is not the platform. It is that the orbital franchises
> undercut European labour and personhood law.

It is the habit when the denial is a strawman nobody offered. Nothing in the
text distinguishes the two, which is why this is judgement and not a fault.

**The six that stay, and why — so the next pass does not re-argue them.**
The scanner will keep reporting all six; this is the verdict, not a
suppression list, because a suppression list is how a style tool stops being
read.

| address | the denial | why it stays |
|---|---|---|
| `encyclopedia/…/prime_minister/summary` | *not elected* | a reader assumes a head of government is elected; denying it is the constitution. The rule's own comment names this the informative case. |
| `actors/earth_bloc/note` | *not the platform* | the whole crisis IS the platform, so this corrects the one assumption a reader certainly arrives with. The most useful sentence in the note. |
| `events/standing_low/body` | *not catastrophic* | the assumption from a low-standing event is catastrophe, and *flat, which is worse* is a real claim the passage then substantiates. |
| `events/f1_accounts_freeze/body` | *not an embargo yet* | Hatt speaking, and `yet` plus *the price of one* is escalation information. A character may sound like themselves. |
| `events/the_pairing_offer/body` | *not a favour* | Okarie speaking, and the distinction is cashed out in the next clause — a favour is owed back, a kindness is remembered. |
| `minutes/min_130/body` | *not a refusal* | an in-world minute where refusal-versus-record is legally load-bearing, and the next line (*I am aware of how this minute will read if it is ever produced*) makes the care deliberate. |

**The five that went, and what replaced them.** Every one was a two-word
antithesis on a word nobody offered, and in each case the passage was
carrying the real information one sentence later — so the fix was to lead
with it:

- `events/review_reports/body` — *It is not a scandal. It is a schedule.
  That is the part that will be quoted.* Alliterative antithesis plus an
  editorial sign-off in one sentence pair; the densest two habits in the
  corpus. Now states the mechanism: every suspension lawful and minuted, the
  number growing at the rate the standing orders permit.
- `events/shed_order_crisis/body` — *What follows is not a headline.* A
  headline was invented in order to be denied, two sentences after the text
  had already said the number is never read aloud. The shed order arrives
  directly now, and *It is what the price does when it goes up and nobody
  pays it down* became the causal chain as fact.
- `events/the_opposition_asks/body` — *It is not a question. It is a
  statement.* Replaced with the observable fact that makes the point: *He
  does not wait for an answer.*
- `events/signatures_build/body` — *Six is not a ballot.* This one was
  teaching a real mechanic, so it says the mechanic: six is half the twelve
  that would force a ballot. More informative than the version it replaced,
  because it names the threshold.
- `events/minister_resignation/body` — *not a protest. It is a payment.*
  The explanation that follows made the pivot redundant; *closes the
  account* keeps the metaphor as a verb rather than an epigram.

A sixth habit was found by scanning for things the tool does not model —
`not X but Y`, superlative framing, *what it will not do is*, *that is the
part that* — and none of them reached three instances across 2,212
passages. At that density they are background, not a cadence. The corrective
pair at eleven was the last one that was.

**5. The tricolon.** Demoted from a fault. A bill that requires a register,
a hearing and a decision requires three things, and
`bills/continuity_registration/contested` is an enumeration, not a cadence.

**6. The editorial sign-off.** **None left** — the one was
`events/review_reports/body`'s *That is the part that will be quoted*, which
went with the corrective pair in the same sentence pair. `rather than` came OUT of this
rule: it flagged four constituency notes whose contrasts are exactly right —
*a technical question rather than a political one*, *a landlord's vote
rather than a tenant's* — and a construction that useful cannot be a fault.

### Deleted

**7. Elegant variation.** Removed, and the removal is the finding. It looked
for two clauses sharing three or more content words, and all twelve hits
were correct prose: the Concordance's article on the Commonwealth says
development spending raises a station's closure ratio and that a higher
closure ratio raises its capacity to leave, which repeats the term because
that is the causal chain. A reference work names a thing and then uses the
name. A rule whose every hit is a false positive is worse than no rule — it
is the line that teaches a reader to skim the report.

## What stays

This is a register for the CONTENT — what a player reads. It is not a rule
for the comments in `js/` and `tools/`, which are written to one person who
is about to change the code and are better for being emphatic. The scanner
only reads player-facing prose for that reason.

Nor is it a ban on voice. `textbook.md` is Charnock's and keeps his cadence;
bible §2.6 still governs how much a passage may cost a reader; and a
character speaking may sound like themselves. The habits above are what
prose does when nobody has decided how it should sound.

## Using it

```
npm run register           every passage carrying a habit, worst first
npm run register events    only addresses under that prefix
npm run register pair      only that habit
```

It reports and never rewrites. A rewrite is a decision, and four of the
seven rules turned out to be wrong about what a fault is — which is a good
reason for the tool not to have edited anything.

The scanner is not in `npm run check`. A style check that fails a build
turns into a style check that gets disabled, and the judgement it is standing
in for belongs to the author.
