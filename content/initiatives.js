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
     tempo   [{ label, after, cost?, effects? }]

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
      { label: "Send the Minister he will see", after: 2,
        effects: [ { flag: { guild_via_minister: true } } ] },
      { label: "Write to him yourself, and be seen to", after: 5, cost: 1,
        effects: [ { flag: { guild_direct: true } }, { move: { public_standing: 2 } } ] }
    ] },

  /* INFORMATION. Asking is cheap; asking properly is not, and the
     difference is whether the answer is worth quoting in the House. */
  { id: "commission_review",
    title: "Commission a review of the shed orders",
    note: "Nobody has counted how many people the standing shed orders have " +
          "suspended. Whoever produces the number will have to live with it.",
    cost: 1,
    when: { flagsAbsent: ["review_ordered"] },
    event: "review_reports",
    tempo: [
      { label: "A note from the department, this week", after: 2,
        effects: [ { flag: { review_thin: true } } ] },
      { label: "An independent inquiry, properly staffed", after: 8, cost: 1,
        effects: [ { flag: { review_full: true } }, { move: { treasury: -3 } } ] }
    ] },

  /* A PUBLIC COMMITMENT, which is the one that cannot be taken back.
     It undertakes rather than merely flagging, so the docket carries it
     and the government can be seen to have failed. */
  { id: "state_the_position",
    title: "State the government's position on the threshold",
    note: "Everyone has inferred the government's position. Saying it out loud " +
          "makes it something she can be held to.",
    cost: 2,
    when: { flagsAbsent: ["position_stated"] },
    event: "position_lands",
    tempo: [
      { label: "At questions, in an answer", after: 1,
        effects: [ { flag: { position_offhand: true } } ] },
      { label: "A statement to the House, with a text", after: 3,
        effects: [ { undertake: { id: "carry_threshold",
                                  text: "Carry the threshold bill this session",
                                  by: null } },
                   { move: { public_standing: 3, "loyalty.cu_maintenance": -4 } } ] }
    ] }
];
