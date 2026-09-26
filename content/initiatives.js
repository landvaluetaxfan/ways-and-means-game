/* INITIATIVES — what the government puts in motion, rather than answers.

   Every one of these is a COMMITMENT WITH A CLOCK THE PLAYER WINDS. She
   spends order-paper time, she chooses how it is done, and the answer
   arrives later as an event she did not schedule and cannot recall.

   TEMPO IS THE DECISION. A word in the corridor comes back next sitting
   and is worth what a corridor is worth; a formal approach takes a week
   and carries the government's weight behind it. Neither is correct, and
   an initiative whose tempos differ only in speed is a difficulty
   setting rather than a choice — give them different effects.

   Fields:
     cost    order-paper slots, before the tempo's own surcharge
     when    the same condition vocabulary events use
     event   the answer, queued `after` sittings by the chosen tempo
     tempo   [{ label, after, cost?, effects?, when? }] -- a tempo's own
             `when` closes that way of doing it without closing the others

   ---------------------------------------------------------------------
   The three below are the opening set: one relationship, one piece of
   information, one public commitment. Each queues an answer event in
   content/events.js, and the tempo decides which branch of it is open
   to her. `npm run lint` fails if an `event` here has no event there.
   --------------------------------------------------------------------- */
const INITIATIVES = [

  /* A RELATIONSHIP. The Guild Bench chair will meet exactly one member
     of the cabinet and it is not her (bible 11.2), so the tempo is the
     whole question: go round him, or go through the person he will see. */
  { id: "approach_guild",
    title: "Approach the Guild Bench",
    note: "Nine functional seats that decide every dual majority, and a chair " +
          "who will not take a meeting with the Prime Minister.",
    cost: 1,
    when: { flagsAbsent: ["guild_met"] },
    event: "guild_answers",
    tempo: [
      { label: `Send the Minister she will see`, after: 2,
        effects: [ { flag: { guild_via_minister: true } } ] },
      { label: `Write to her yourself, and be seen to`, after: 5, cost: 1,
        effects: [ { flag: { guild_direct: true } }, { move: { public_standing: 2 } } ] }
    ] },

  /* INFORMATION. Asking is cheap; asking properly is not, and the
     difference is whether the answer is worth quoting in the House. */
  { id: "commission_review",
    title: "Commission a review of the shed orders",
    note: "Nobody has counted how many people the standing shed orders have " +
          "suspended. Whoever produces the number will have to live with it.",
    cost: 1,
    /* `review_ordered` is what makes this once-only, and nothing set it — so
       the review could be commissioned again every sitting, and a second
       order would have arrived while the first was still out. Both tempos
       set it, because either one is an order having been given. */
    when: { flagsAbsent: ["review_ordered"] },
    event: "review_reports",
    tempo: [
      { label: "A note from the department, this week", after: 2,
        effects: [ { flag: { review_thin: true, review_ordered: true } } ] },
      { label: "An independent inquiry, properly staffed", after: 8, cost: 1,
        effects: [ { flag: { review_full: true, review_ordered: true } },
                   { move: { solvency: -3000 } } ] }
    ] },

  /* A PUBLIC COMMITMENT, which is the one that cannot be taken back.
     It undertakes rather than merely flagging, so the docket carries it
     and the government can be seen to have failed. */
  { id: "state_the_position",
    title: "State the government's position on the threshold",
    note: `The benches and the Spindle have each inferred the government's position. Stating it makes it something the government can be held to.`,
    cost: 2,
    /* Same hole as commission_review: `position_stated` is what stops the
       government stating its position twice, and nothing set it. A position
       stated offhand and a position stated in a text are both the position
       having been stated, so both tempos close it. */
    when: { flagsAbsent: ["position_stated"] },
    event: "position_lands",
    tempo: [
      { label: "At questions, in an answer", after: 1,
        effects: [ { flag: { position_offhand: true, position_stated: true } } ] },
      { label: "A statement to the House, with a text", after: 3,
        effects: [ { flag: { position_stated: true } },
                   /* WITH A DISCHARGE. It had none, so it broke at the
                      rise whether or not the bill carried (design/34). */
                   { undertake: { id: "carry_threshold",
                                  text: "Carry the threshold bill this session",
                                  by: null,
                                  discharge: { division: "divergence", carried: true } } },
                   { move: { public_standing: 3, "loyalty.cu_maintenance": -4 } } ] }
    ] },

  /* A POSITION, NOT A SCREEN (design/28 §3). The Commonwealth's quota sold
     forward: cash this session, capacity delivered later at a fixed price.
     The tempo IS the price — sell a slice and the cash is small, sell the
     margin and the money is real — and the settle event hands over exactly
     what was sold, reading the flags the tempo set. No new verb: `move`,
     `flag` and the ordinary queued answer carry the whole instrument. */
  { id: "quota_forward",
    title: "Sell quota forward",
    note: "The Commonwealth's quota sold forward to the consortiums: cash now, " +
          "delivery at the term. The price is fixed today and the capacity leaves " +
          "the margin later, which is either a hedge or a hole depending on what " +
          "the session does next.",
    cost: 1,
    when: { flagsAbsent: ["quota_forward_sold"] },
    event: "quota_forward_settles",
    tempo: [
      { label: "A cautious forward: a slice of the margin, a slice of the cash",
        after: 4,
        effects: [ { move: { solvency: 9000 } },
                   { flag: { quota_forward_small: true, quota_forward_sold: true } } ] },
      { label: "A full forward: the whole margin, and the price to match",
        after: 6, cost: 1,
        effects: [ { move: { solvency: 22000 } },
                   { flag: { quota_forward_full: true, quota_forward_sold: true } } ] }
    ] },

  /* VOLUME LEASES (design/28 §3). A lease is long-dated and it can be
     paid in two currencies. Cash is certain and small; work on the
     station's own material cycle is worth more and is not guaranteed,
     and the price of volume at the term decides which of the two the
     Commonwealth actually got. */
  { id: "charter_volume",
    title: "Charter volume forward",
    note: "The Commonwealth holds volume on every band and can let it " +
          "forward to a station for a term. Homestead has asked for the " +
          "lease. It will pay in cash, or in the work that raises its own " +
          "closure, and it would rather pay in work.",
    cost: 1,
    when: { flagsAbsent: ["volume_chartered"] },
    event: "volume_charter_settles",
    tempo: [
      { label: "Let it on the standard terms, for cash", after: 4,
        effects: [ { move: { "solvency": 6000 } }, { move: { "price.volume": 3 } },
                   { flag: { charter_cash: true, volume_chartered: true } } ] },
      { label: "Let it against closure, at a lower rent", after: 6, cost: 1,
        effects: [ { station: { ashfield: { closure: 0.05 } } },
                   { move: { "legitimacy": 4 } }, { move: { "price.volume": 4 } },
                   { flag: { charter_closure: true, volume_chartered: true } } ] }
    ] },

  /* THE MONEY (design/39 option C). The Bank is independent by statute, so
     the government's hand on the rate is a word to the Governor, which the
     market can hear if it is said loudly enough; and the dollar is the
     Treasury's to defend with the Bank's reserves, which run out. */
  { id: "lean_on_governor",
    title: "Lean on the Governor",
    note: "The Reserve Bank sets the cash rate and the government does not. " +
          "It can still say what it would like, and the Governor can still " +
          "decide what she heard.",
    cost: 1,
    when: { flagsAbsent: ["governor_leaned"], dissolved: false },
    event: "governor_answers",
    tempo: [
      { label: "Say it at the despatch box", after: 1,
        effects: [ { economy: { credibility: -0.08, expected: 0.2 } },
                   { move: { public_standing: 2 } },
                   { flag: { governor_leaned: true, lean_public: true } } ] },
      { label: "A private word from the Treasury", after: 2,
        effects: [ { economy: { credibility: -0.02 } },
                   { flag: { governor_leaned: true, lean_private: true } } ] }
    ] },

  { id: "defend_dollar",
    title: "Defend the dollar",
    note: "The Bank holds the Commonwealth's reserves of Earth's money, and the " +
          "Treasury decides whether to sell them. A dollar bought back is a " +
          "cheaper import bill and a lighter debt to Earth's banks, for as long " +
          "as the reserves last.",
    cost: 1,
    when: { economyBelow: { fx: 0.82 }, economyAbove: { reserves: 6000 },
            flagsAbsent: ["dollar_defended"] },
    event: "dollar_line_tested",
    tempo: [
      { label: "Intervene quietly", after: 2,
        effects: [ { economy: { fx: 2.5, reserves: -6000 } },
                   { flag: { dollar_defended: true } } ] },
      { label: "Declare a line and defend it", after: 4, cost: 1,
        when: { economyAbove: { reserves: 12000 } },
        effects: [ { economy: { fx: 5, reserves: -12000, credibility: 0.02 } },
                   { flag: { dollar_defended: true, dollar_line: true } } ] }
    ] },
];
