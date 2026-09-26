/* =============================================================
   FLASH I — THE GENERAL ASSEMBLY'S BUSINESS (design/43).
   Four resolutions on the Almanac Works. Tagged and added to the
   world's RESOLUTIONS by `campaign()`. The forum and its members are
   the world's, in content/forums.js.

   Two endings go through them: the Maritime Charter needs the World
   Court's opinion that the salvage was lawful, which only the Assembly
   can ask for; and the Joint Mandate needs the Assembly to place the
   Works under a United Nations administration. The canon, the Sovereign
   Debt Trap, does not touch the Assembly.
   ============================================================= */
campaign("flash_i", { resolutions: [

  { id: "un_works_selfdet", forum: "un_ga", sponsor: "commonwealth_mission",
    title: "Self-determination of the residents of the Almanac Works",
    summary: "Affirms that the residents of an abandoned orbital platform may decide their own political status, and that their referendum is the expression of that decision.",
    axes: { orbital: 0.8, creditors: -0.3 },
    when: { flags: ["f1_referendum_carried"] },
    whenText: "the Works' referendum has to be recognised first",
    onPass: [ { move: { legitimacy: 5 } }, { move: { friction: -4 } },
              { flag: "un_selfdet_adopted" },
              { wire: "GENERAL ASSEMBLY AFFIRMS THE WORKS' RIGHT TO DECIDE ITS OWN FUTURE" } ],
    onFail: [ { move: { legitimacy: -4 } }, { move: { friction: 3 } },
              { wire: "GENERAL ASSEMBLY DECLINES TO BACK THE WORKS' REFERENDUM" } ] },

  { id: "un_eu_measures", forum: "un_ga", sponsor: "eu_caucus",
    title: "Measures concerning the Almanac Works",
    summary: "Calls on member states to maintain measures against any state that takes an Earth-registered company's property in orbit without compensation, until the Works' bondholders are paid.",
    axes: { orbital: -0.7, creditors: 0.8 },
    vote: "against",
    /* The Assembly calls; it cannot oblige. The measures are the Union's
       already, so an adopted call does not escalate the quarrel: it tells
       the world the Commonwealth was judged and lost, which is legitimacy.
       Friction here tipped every annexing playtest strategy into a cascade
       at +2 and not at +3, which is a knife edge, not a consequence
       (design/43). A rejected call does ease the quarrel: the Union's own
       line failed. */
    onPass: [ { move: { legitimacy: -3 } },
              { flag: "un_measures_adopted" },
              { wire: "GENERAL ASSEMBLY CALLS ON MEMBERS TO KEEP MEASURES OVER THE ALMANAC WORKS" } ],
    onFail: [ { move: { friction: -2 } }, { move: { legitimacy: 3 } },
              { flag: "un_measures_rejected" },
              { wire: "GENERAL ASSEMBLY REJECTS THE UNION'S RESOLUTION ON THE WORKS" } ] },

  { id: "un_icj_salvage", forum: "un_ga", sponsor: "commonwealth_mission",
    title: "Request for an advisory opinion on the salvage of abandoned orbital platforms",
    summary: "Asks the International Court of Justice whether a state that rescues the residents of an orbital platform abandoned by its operator may take the platform as salvage.",
    axes: { orbital: 0.6, creditors: -0.6 },
    when: { flags: ["almanac_annexed"] },
    whenText: "the Annexation Act has to be law first",
    onPass: [ { flag: "un_icj_requested" },
              { queue: [ { event: "f1_icj_opinion", after: 4, label: "The World Court gives its opinion" } ] },
              { wire: "GENERAL ASSEMBLY ASKS THE WORLD COURT ABOUT SALVAGE IN ORBIT" } ],
    onFail: [ { move: { legitimacy: -3 } },
              { wire: "GENERAL ASSEMBLY WILL NOT REFER THE WORKS TO THE WORLD COURT" } ] },

  /* An important question: two thirds of those present and voting. */
  { id: "un_works_administration", forum: "un_ga", sponsor: "commonwealth_mission", majority: 0.6667,
    title: "A United Nations administration of the Almanac Works",
    summary: "Places the Almanac Works under a transitional administration of the United Nations and the Commonwealth jointly, as a free trade zone, until its residents' status is settled.",
    axes: { orbital: 0.3, creditors: 0.1 },
    when: { flags: ["f1_referendum_carried", "f1_held_the_line"], flagsAbsent: ["f1_annexing", "almanac_annexed"] },
    whenText: "the referendum recognised and the line held, with no move to annex",
    onPass: [ { flag: "un_administration" }, { move: { friction: -6 } },
              { wire: "GENERAL ASSEMBLY PLACES THE ALMANAC WORKS UNDER A JOINT ADMINISTRATION" } ],
    onFail: [ { move: { legitimacy: -3 } },
              { wire: "GENERAL ASSEMBLY FALLS SHORT OF TWO THIRDS ON THE WORKS" } ] }

] });
