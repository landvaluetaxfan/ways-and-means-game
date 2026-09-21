# The register

How the prose in this game is written, stated so it can be checked rather
than felt. Written 21 September 2026 after the author read a state note and
said: the first half is good, the rest is too vague and ends in a way that
feels AI.

They were right, and it is not one line. A scan of all 2,111 player-facing
passages found the same handful of mechanical habits in ninety-six of
them. `npm run register` lists them.

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

## The seven habits

Each one is a real pattern with a real count in this repo, and each has the
same shape — a sentence that has finished its work and then adds a flourish
telling the reader what to think about it.

**1. The explanatory tail.** `…, which is the whole point.` `…, which is what
the clause is for.` `…, and that is the point.` Fifty-seven passages. By far
the commonest, and it is a tell because a fact that needs to be labelled
important was not stated strongly enough.

> was: It sells the concession and not the sovereignty, and it has said so in
> writing.
>
> now: Colombia's position, stated in the concession instrument and repeated
> at every renewal, is that the lease conveys operating rights and not
> territory.

**2. The corrective pair.** `It is not X. It is Y.` Twelve passages. Reads as an
argument with a reader who has not said anything yet. Assert Y.

**3. The tricolon.** `a name, a number, and a grievance.` One passage left. Three
items in parallel is a rhythm, and a rhythm draws attention to the sentence
rather than to its contents. Two items, or four, or a list that is actually a
list.

**4. The em-dash sandwich.** `The anchor — leased, not granted — pays.` Zero
passages, and the rule is kept to hold it there. One pair of dashes in a
passage is punctuation; two is a mannerism.

**5. Vague quantity.** Nine passages. `a century`, `for generations`, `in a decade when it
needed the money`, `long since`. A reference work gives the decade. If the
number is not known, name what is known instead of gesturing at scale.

**6. The editorial sign-off.** Fifteen passages. `…rather than a grievance.` `…being paid badly
for what it sells.` `…which nobody can amend.` The sentence ends on the
author's opinion of the fact. End on the fact.

**7. Elegant variation on the same idea.** Twelve passages. Saying a thing, then saying it
again in a better phrase. Keep the better phrase.

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
npm run register          every passage carrying a habit, worst first
npm run register events    only addresses under that prefix
npm run register signoff   only that habit
```

The scanner is not in `npm run check`. A style check that fails a build
turns into a style check that gets disabled, and the judgement it is standing
in for belongs to the author.
