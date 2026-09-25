# 41 — Prose for the author to review

25 Sep 2026. Every line of the author's own prose that design/40 changed,
with what it said, what it says now and why, followed by the new prose
added in design/40 and the arrears work that followed it.

Line numbers are for commit `b08d217`. Edit the file itself: the game has no
second copy of any of this. To have a line put back as it was, say which one
and it will be reverted.

The mechanical edits are not listed: the `posture` tags on choices, the
effect numbers and the code comments.

---

## A. Your lines, rewritten

### A1. The President's commission — `content/events.js:138`

Event `the_commission` (prologue 1). The opening House went from 142 to 147
(design/40 E9: two in five uninformed governments fell before the crisis),
so the arithmetic he recites had to change.

> **Was:** …forty-two. That is a majority of one, and six of the hundred and
> forty-two are independents who have undertaken to keep you alive and
> nothing beyond it.

> **Now:** …forty-seven. That is six more than you need, and six of the
> hundred and forty-seven are independents who have undertaken to keep you
> alive and nothing beyond it. If they go, you have the House exactly and not
> one member over.

The last sentence is new. It keeps the scene's point that the majority
rests on the independents.

### A2. Ceyhan's first question — `content/events.js:205` and `:218`

Event `the_account` (prologue 2). "A majority of one" was no longer true, and
"thirty years" was older than the Commonwealth (bible §11.1: the Charter is
2064).

> **Was:** "Prime Minister. You inherit a majority of one, a bill you did not
> write, and a party that has spent thirty years arguing with itself about
> what it is for. Before anything else: why you?"

> **Now:** "Prime Minister. You inherit a majority that is six independents
> deep, a bill you did not write, and a party that has spent every one of the
> Commonwealth's sixteen years arguing with itself about what it is for.
> Before anything else: why you?"

And in the first choice's result (`:218`):

> **Was:** …the accusation they have lived with for thirty years.
>
> **Now:** …the accusation they have lived with since the Charter.

### A3. Flash's introduction — `content/campaigns/flash_i/campaign.js`

design/40 E13 reconciled her dates: the cabinet had her as Treasurer until
last week, while the introduction had her as Governor straight to the
premiership (bible §3.8, §11.1: Governor 2071–2076, Treasurer from outside
the House 2076–2080).

**`:83`**. One sentence was inserted into your paragraph, before its last
sentence:

> …a portrait in a corridor, a pension. **Instead, in 2076, the Party of
> Socialists and Democrats asked her to the Treasury from outside the House,
> which the Charter has never forbidden, and for four years she ran the
> Commonwealth's money from the other side of the desk.** But it's not like
> every capable leader was evidently destined to do it beforehand.

The "But" now follows the Treasury rather than the pension, and reads
differently. This is the line most worth your own rewrite.

**`:86`**. A Treasurer from outside the House needs a seat, so she takes it
at a by-election rather than at a general election:

> **Was:** She took First Spin at the election that made her Prime
> Minister, which is the first elected office she has ever held.
>
> **Now:** She took First Spin at the by-election that followed, which is
> the first elected office she has ever held.

**`:95`**. The campaign is one session, the parliament's last (decided 22–23
Sep), and "four years" read as a term still ahead of her:

> **Was:** She has four years. The session that opens on the eleventh of
> April is the fourth, and the House is already sitting.
>
> **Now:** She has one session. The one that opens on the eleventh of April
> is the parliament's fourth and its last, and the House is already sitting.

### A4. Charnock on the unit of account — `textbook.md:445`

The dollar floats since 2073 (design/39 option C). Charnock's section said
the Commonwealth *denominates* in heat, present tense. It now says it did so
until the float, and keeps the metaphor.

> **Was:** We denominate in thermal rejection capacity.
>
> **Now:** We denominated, until 2073, in thermal rejection capacity.

In the fourth paragraph (`:454`), "A unit of currency here is a claim on
radiator area" became:

> The founders' currency board issued a dollar only against a millionth of a
> megawatt-year of quota lodged with it, and so a unit of our currency was a
> claim on radiator area, …

A new paragraph (`:461`):

> The Reserve Bank floated the dollar in 2073, and it is now a claim on
> nothing in particular, like every other money worth having. We still keep
> the accounts in millions of dollars that were once megawatt-years, and the
> habit tells the truth: every price here is, underneath, a price of heat.

And the last sentence (`:466`) gained a clause:

> …the truest thing about our money**, and I think it is truer now that it is
> only a metaphor.**

### A5. Castellane — `content/encyclopedia.js:481` and `content/characters.js:263`

Flash can no longer have had a deputy "for six years" and a successor at the
Bank, since she left it in 2076.

> **Was** (the Concordance): The Governor is Maren Castellane, Flash's
> deputy for six years and her successor.
>
> **Now:** The Governor is Maren Castellane, Flash's deputy from the Bank's
> founding and Governor since Flash left for the Treasury in 2076.

The character's `note` (your design note, not shown to players) changed the
same way.

### A6. The Bank's rule — `content/encyclopedia.js:469`

The rule reads *underlying* inflation since design/40 E3. Only that phrase
changed: "plus inflation, plus half the amount by which inflation misses
the target" is now "plus underlying inflation, plus half the amount by
which it misses the target".

### A7. Five constituencies — `content/constituencies.js`

The five seats that moved to make the opening House 147 (bible §8.4) needed
new `tendency` lines, because each said who holds it and why.

| Line | Seat | Moved | Now reads |
|---|---|---|---|
| 936 | Calloway Green—Tewkes | HR → PSD | Maintenance and tier-reversal … holds a large and poor electorate for the maintenance benches, and it votes for whoever will reverse the tier. |
| 964 | Passerine | HR → CDA | Growers and congregational … holds it for the Alliance, and the seat votes for its own decks against imported consumables and for the meeting house against the market. |
| 1046 | Homestead VI | HR → CDA | Congregational and subsidy … the station's one Alliance seat, where the decks keep a meeting house on every level, and it votes for the consumables lift and against anything that prices a person. |
| 1145 | High Lagos | HR → PSD | Tether labour … for the maintenance benches, and it votes for the crews who work the anchor whoever owns it. |
| 1199 | Lindenhall—Peck | AES → PSD | Plant workers and restrictionist … took it from the engineers at the last election for the maintenance benches, on the argument that the people who keep the plant running are paid as though it could not suffocate its neighbours. |

And `:1127` (Padstow Deck): "the station's second home-rule seat" became
"the station's one home-rule seat", because Homestead VI moved.

### A8. The four tax clauses — `content/bills.js:205–238`

The Appropriation's rate clauses went from none, half, standard and half
again to steps of a tenth and a fifth (design/40 E5: "realistic numbers, but
feel like they have impact"). Every level's `note` was rewritten to name the
sum in CW$ and who pays, and each clause's own `note` gained its size at the
opening. Your sentences were kept wherever they still held ("What it falls
on is position inside a habitat, which nobody made"; "The rent on continuing
to be a person goes up…"). The new ones worth a look:

- volume, surcharge: "…the ring will call it confiscation in every paper it
  owns. It falls on position, so nobody's rent rises, which the government
  will say until it is hoarse."
- thermal, surcharge: "…a rise in the price of heat that every station will
  see on the next bill. Governments have fallen for less."
- substrate, surcharge: "…raised from people who are only hours. The
  personhood benches will read it as a tax on existing, and they will not be
  wrong."
- transit, surcharge: "…charged on everything the outer stations import.
  Home Rule will campaign on nothing else."

---

## B. New prose

None of this replaced anything of yours, but it is in your world and in the
player's view.

**B1. Three events** at the end of `content/events.js`:

- `ec_earth_slows` (`:3545`), "Earth's quarterly accounts": Earth's output falls, and
  the Treasury offers three answers.
- `ec_decks_fail` (`:3569`), "The harvest on the decks": blight on
  Homestead and Harvest.
- `partner_stands_aside` (`:3599`), "A partner stands aside": the Chief Whip
  on a partner that has left the agreement and still gives confidence. It
  calls Anil Devi "he", following the comment at `:534`. If that is wrong,
  both need changing.

**B2. A sixth Flash I result**, `f1_open` "Unfinished Business"
(`content/campaigns/flash_i/settlements.js:112`), for a government that met
the crisis and settled nothing:

> No settlement is reached before the House rises. The Works stays in limbo,
> its people on emergency terms.
>
> *Closing:* The House rises with the platform's future unsettled and its
> people on emergency terms. The next government inherits the question, and
> Earth's lawyers inherit the time.

**B3. The account's warnings** (`content/setup.js`, added with the arrears
work after design/40):

- the Underwriters' `arrears` reading: "The Treasury has missed payments.
  Past the bill authority the tender takes nothing more, and what the
  reserve cannot meet is simply owed: to suppliers, to the stations, to the
  public payroll. Every lender adds a point for it, and it is the first
  thing any money coming in will pay."
- two docket alerts: "The reserve is empty and the Treasury's bills are
  near their authority" and "The Treasury is in arrears, and every sitting
  it stays there costs standing".
- two wire marks: "The Treasury is in arrears: suppliers and stations are
  waiting to be paid" and "The Commonwealth has missed its own payroll".

The docket's ladder line ("Thermal margin falls under 15 before the House
rises, and the next order that raises it needs the House's approval") is
built by the engine from the meter's label, and is not content.
