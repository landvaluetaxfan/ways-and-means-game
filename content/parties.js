/* PARTIES — add a party by adding an object here. Nothing else needs to change.
   axes: ownership public|private  personhood expansionist|restrictionist
         sovereignty federal|station   closure closurist|integrationist
   Omit an axis (or use null) where the party has no settled position.
   aliases: press nicknames. Bible 8.3 — real parties are named for a value,
   an interest, a place or a founding event, almost never for their ideology.
   "Substrate Left" is what the papers call them; it is not their name. */

/* kind — how the organisation contests seats.

     national      a partisan party standing on programme across the
                   popular tier and the functional tier alike
     professional  a trade or professional body acting as a political
                   organisation: it contests the functional seats of its
                   own sector and rarely stands in the districts at all

   Functional constituencies are contested by a mixture of the two, which
   is why the Alliance of Business and Government sits with nine functional
   seats and no national programme.
   Bible 8.6 holds further professional bodies as reserve material —
   the Underwriters, the Anchor Party, the Deck Cooperatives, the
   Chartists — none currently seated. */
const PARTIES = [
  { id:"cu",  name:"Party of Socialists and Democrats", short:"PSD", colour:"var(--p-cu)",
    leader:"flash", logo:"cu.png", wordmark:"cu_mark.png",
    seats:{district:48,list:25,functional:9},
    kind:"national", loyalty:62,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:null},
    note:"Old left. Embodied maintenance labour, and the strike weapon." },

  { id:"cl",  name:"Liberal Party",                short:"LIB", colour:"var(--p-cl)",
    leader:"watkins", logo:"cl.png", wordmark:"cl_mark.png",
    seats:{district:22,list:19,functional:6},
    kind:"national", loyalty:20,
    axes:{ownership:"private",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    note:"Cosmopolitan market party. Elevator and shipping money." },

  { id:"psa", name:"New Progressive Party",        short:"NPP", colour:"var(--p-psa)",
    leader:"trottier", logo:"psa.png", wordmark:"psa_mark.png",
    aliases:["Substrate Left"],
    seats:{district:6,list:28,functional:2},
    kind:"national", loyalty:41,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    note:"List-tier strength, almost no districts. Shares your economics, despises your personhood line." },

  { id:"sc",  name:"Home Rule",                    short:"HR",  colour:"var(--p-sc)",
    leader:"laughon", logo:"sc.png", wordmark:"sc_mark.png",
    seats:{district:26,list:8,functional:0},
    kind:"national", loyalty:35,
    axes:{ownership:null,personhood:null,sovereignty:"station",closure:"closurist"},
    note:"Confederalist. Cannot whip its own members." },

  { id:"hul", name:"Association of Engineers and Systems", short:"AES", colour:"var(--p-hul)",
    leader:"wilde_hayward", logo:"hul.png", wordmark:"hul_mark.png",
    seats:{district:9,list:6,functional:7},
    kind:"national", loyalty:15,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:null,closure:"closurist"},
    note:"Habitat as lifeboat. Engineering authority supreme." },

  { id:"rv",  name:"Congregational Democratic Alliance", short:"CDA", colour:"var(--p-rv)",
    leader:"park", logo:"rv.png", wordmark:"rv_mark.png",
    seats:{district:12,list:5,functional:1},
    kind:"national", loyalty:23,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:null,closure:null},
    note:"Continuity of soul. A copy is not the person. Economically left, culturally immovable." },

  { id:"fh",  name:"Freehold Party",               short:"FH",  colour:"var(--p-fh)",
    leader:"bluespan", logo:"fh.png", wordmark:"fh_mark.png",
    seats:{district:8,list:3,functional:6},
    kind:"national", loyalty:12,
    axes:{ownership:"private",personhood:"restrictionist",sovereignty:"station",closure:null},
    note:"Volume owners. Property absolutists." },

  { id:"gb",  name:"Alliance of Business and Government", short:"ABG", colour:"var(--p-gb)",
    leader:"hatt", logo:"gb.png", wordmark:"gb_mark.png",
    aliases:["Guild Bench"],
    seats:{district:0,list:0,functional:9},
    kind:"professional", loyalty:30,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:"federal",closure:"closurist"},
    note:"Exists only in the functional tier. It does not campaign and cannot be voted out." },

  { id:"des", name:"One-G",                        short:"ONE", colour:"var(--p-des)",
    leader:"edelstein_powell", logo:"des.png", wordmark:"des_mark.png",
    seats:{district:3,list:1,functional:0},
    kind:"national", loyalty:18,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:null,closure:null},
    note:"Gravity as birthright. Draws the physiologically excluded." },

  { id:"geo", name:"Single Tax Party",             short:"STP", colour:"var(--p-geo)",
    leader:"wheeler", logo:"geo.png", wordmark:"geo_mark.png",
    seats:{district:0,list:3,functional:0},
    kind:"national", loyalty:66,
    axes:{ownership:null,personhood:null,sovereignty:"federal",closure:null},
    /* No carve-out: a national ideological party with no district roots and
       no category to protect. It lives or dies on the threshold every time,
       which is exactly the party 4.8 says will agonise just below the line. */
    note:"Volume tax, land value tax, nothing else. Three seats, and always "+
         "within a point of the threshold." },

  { id:"upl", name:"Uplift Alliance",              short:"UPA", colour:"var(--p-upl)",
    leader:"lindegaard", logo:"upl.png", wordmark:"upl_mark.png",
    seats:{district:0,list:2,functional:0},
    kind:"national", loyalty:58,
    /* Bible 4.8: the list threshold exempts a party representing a single
       legal-person category, as minority protection. The Uplift Alliance is
       the case that carve-out was written for — and the exemption is itself
       permanently contested, which is the point of having it. */
    carve_out:"category",
    axes:{ownership:"public",personhood:"expansionist",sovereignty:null,closure:null},
    note:"Two seats. Permanently kingmaker-adjacent. Price is always the same thing. "+
         "Exempt from the list threshold under the single-category carve-out, which "+
         "half the chamber would repeal tomorrow." },

  { id:"ind", name:"Independents",                 short:"IND", colour:"var(--p-ind)",
    leader:null,
    seats:{district:6,list:0,functional:0},
    kind:"national", loyalty:50,
    axes:{},
    note:"District independents. No caucus position, no whip, no leader. Six members " +
         "and six arguments: the seats on Sinter share one, and the others share " +
         "nothing. Where three of them vote together it is something to notice in " +
         "the division list rather than anything the House was told." }
];

/* CURRENTS — factions inside a party. Same four axes; a current that
   drifts far enough simply becomes a party in the list above. */
const CURRENTS = [
  { id:"cu_maintenance", party:"cu", name:"Maintenance bloc",     members:31, loyalty:29,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:"closurist"} },
  { id:"cu_loyalists",   party:"cu", name:"Leadership loyalists",  members:22, loyalty:88,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:null} },
  { id:"cu_deck",        party:"cu", name:"Deck cooperativists",   members:18, loyalty:54,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"station",closure:"closurist"} },
  { id:"cu_halloran",    party:"cu", name:"Czarnecki group",        members:11, loyalty:12,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:"closurist"} },

  /* THE RENAMED PARTIES' ARGUMENTS (T7, design/24 B1). A party with no
     internal current is a bloc that votes, and these three names imply an
     argument that did not exist in the data. Members sum to popular seats
     (district + list), the way the cu currents do. */

  /* FREEHOLD: property absolutists who disagree on whose courts defend the
     deed. The Title Caucus wants the Commonwealth to enforce title; the
     Section Leagues want the station's own law and nothing federal near it. */
  { id:"fh_title",     party:"fh", name:"The Title Caucus",        members:6, loyalty:38,
    axes:{ownership:"private",personhood:"restrictionist",sovereignty:"federal",closure:null} },
  { id:"fh_section",   party:"fh", name:"The Section Leagues",     members:5, loyalty:50,
    axes:{ownership:"private",personhood:null,sovereignty:"station",closure:null} },

  /* THE CDA: a church and a coalition partner, and the two argue. The
     congregations made the party and voted the conference 71-29 against the
     threshold; the ministerial wing holds the offices and votes like a
     partner, which is why its members absented themselves rather than
     divide against the leadership in public (8.5). */
  { id:"rv_congregation", party:"rv", name:"The Congregations",     members:11, loyalty:62,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:null,closure:null} },
  { id:"rv_ministerial",  party:"rv", name:"The Ministerial wing",  members:6, loyalty:40,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:null} },

  /* UPLIFT: two seats and one question, whether they are there to witness or
     to trade. Each current is one of the two members. */
  { id:"upl_witness", party:"upl", name:"The Witness Caucus",       members:1, loyalty:70,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:null,closure:null} },
  { id:"upl_bridge",  party:"upl", name:"The Bridge Caucus",        members:1, loyalty:50,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"} },

  /* THE INDEPENDENTS (T14, design/26 #15 as amended). Six district
     members with no caucus, no whip and no leader, and six different
     arguments. Each current is one member, named for the seat.

     TWO OF THEM ARE THE SAME ARGUMENT ON PURPOSE. Kettering and Castellan
     hold the two seats on Sinter on the localist case, and Merrick holds
     the yard seat on the Dredge on the same case with the personhood line
     added. They are not a party and they do not whip: they share a position
     on station sovereignty and closure, and the bloc is something the
     player has to NOTICE in a division list rather than read on a rostrum.
     The other three share nothing with each other or with the bloc. */
  { id:"ind_grimsby",   party:"ind", name:"Homestead A",         members:1, loyalty:68,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:"closurist"} },
  { id:"ind_kirilenko", party:"ind", name:"Clearmont & Sowerby", members:1, loyalty:55,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"station",closure:"integrationist"} },
  { id:"ind_vasquez",   party:"ind", name:"Stanbridge",          members:1, loyalty:62,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:"federal",closure:"closurist"} },
  { id:"ind_kettering", party:"ind", name:"Colonnade",           members:1, loyalty:70,
    axes:{ownership:null,personhood:null,sovereignty:"station",closure:"closurist"} },
  { id:"ind_castellan", party:"ind", name:"Wrenfield-Aubrey",    members:1, loyalty:74,
    axes:{ownership:null,personhood:null,sovereignty:"station",closure:"closurist"} },
  { id:"ind_merrick",   party:"ind", name:"John Henry",          members:1, loyalty:66,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"station",closure:"closurist"} }
];


/* =============================================================
   PARTY ORGANISATION — the party outside Parliament.

   Added 20 September 2026 at the author's direction. Bible §2.7 freezes the
   person roster, so this is a deliberate addition rather than a passing one,
   and it is kept OUT of content/characters.js on purpose: these are not
   members. An officer holds no seat, votes in no division, and cannot be
   appointed to anything. Putting them in the roster would put them in the
   cast that `benchRoll` seats the House from.

   They are still names, so js/engine.js's `namesTaken` reads them: a
   generated list member must not turn out to share a name with the general
   secretary of the party that listed them.

   THREE THINGS, AND NO MORE. Who runs the party between elections
   (`officers`), what is affiliated to it (`bodies`), and where it actually
   exists on the ground (`branches`, keyed to real stations). A fourth would
   be a party simulation, and there is no mechanic here — this is the
   party as a place the player can look, the way the Concordance is.

   The shapes differ because the parties do. A confederal party has a
   convenor and no whip; a professional association has a registrar and a
   licensing body, because §4.6.4 makes the roll of licensed members the
   franchise; a congregational party has a moderator and a clerk; and the
   independents have nothing at all, which is the entry that says the most.
   ============================================================= */
const PARTY_ORG = {

  cu: {
    officers: [
      { role:"Chair", name:"Ilma Ruthven",
        note:"Elected by conference and not by the leader, which is the arrangement every PSD leader inherits and none has repealed." },
      { role:"General Secretary", name:"Bevan Osei",
        note:"Runs the card vote. Knows what the maintenance trades will wear before they do." },
      { role:"Chief Agent", name:"Tovah Sandquist",
        note:"Forty-eight district seats and a canvass return for each of them." }
    ],
    bodies: [
      { name:"Combined Maintenance Trades", kind:"union",
        note:"Affiliated, and votes as a block at conference. The strike weapon is theirs and not the party's, which the party is careful never to say aloud." },
      { name:"The Sunman Institute", kind:"institute",
        note:"Policy, founded in a low-band station and still headquartered there. Produces the costings the Treasury disputes." }
    ],
    branches: [
      { station:"ashfield", note:"The oldest branch, and the one that selects for the leader's own seat." },
      { station:"slagworks", note:"Nine hundred members, most of them on the maintenance roll." }
    ]
  },

  cl: {
    officers: [
      { role:"Chair", name:"Portia Vane",
        note:"Chairs a party whose money arrives without being asked for and expects to be heard." },
      { role:"Treasurer", name:"Cesar Aldana",
        note:"The Liberals have a Treasurer where other parties have a General Secretary. That is the party, stated as an organogram." },
      { role:"Chief Agent", name:"Noor Halvorsen",
        note:"Runs the ring-band districts, where the vote is thin and the donations are not." }
    ],
    bodies: [
      { name:"The Anchorage Club", kind:"club",
        note:"Subscription by invitation. Not a party body in law and the only room where the party's line is actually settled." },
      { name:"Institute for Open Transit", kind:"institute",
        note:"Argues for the tether concession against whoever holds it. Currently that is not the Liberals, so it argues loudly." }
    ],
    branches: [
      { station:"bourse", note:"Shipping and underwriting. The branch that pays for the others." },
      { station:"kepler", note:"An anchor branch, and the party's only serious presence in the low band." }
    ]
  },

  psa: {
    officers: [
      { role:"Chair", name:"Rune Adeyemi",
        note:"Chairs the list order, which in a party with six districts and twenty-eight list seats is the only selection that matters." },
      { role:"National Organiser", name:"Delphine Okonkwo",
        note:"No agent, because there are barely any districts to agent. Organises the federation instead." }
    ],
    bodies: [
      { name:"The Substrate Assembly", kind:"assembly",
        note:"A standing congress of members that ratifies the list. It has rejected the leadership's order twice and both times the leadership complied." },
      { name:"The Hosting Review", kind:"journal",
        note:"Quarterly, unreadable, and the origin of most of the party's policy." }
    ],
    branches: [
      { station:"meridian", note:"Substrate hosting, and the densest concentration of emulated members anywhere." },
      { station:"erasmus", note:"A far-band branch that recruits faster than the party can process it." }
    ]
  },

  sc: {
    officers: [
      { role:"Convenor", name:"Gudrun Saelid",
        note:"Convenor and not Chair, and the distinction is the party's whole argument: she calls the meeting and cannot bind it." }
    ],
    bodies: [
      { name:"The Stations' Convention", kind:"assembly",
        note:"Station delegations, one vote each regardless of population. The parliamentary party answers to it and not the reverse, which is why Home Rule cannot whip." }
    ],
    branches: [
      { station:"hollows", note:"Three habitats on one branch, and they do not agree either." },
      { station:"tsiolkovsky", note:"Farstead, where the Convention meets when it meets at all." }
    ]
  },

  hul: {
    officers: [
      { role:"President", name:"Aurelio Banse",
        note:"President of an association that became a party by accident and has never amended its constitution to admit it." },
      { role:"Registrar", name:"Kit Mbatha",
        note:"Keeps the roll of licensed members. Since licensure carries the functional franchise, the Registrar decides who votes in the association's own seats." }
    ],
    bodies: [
      { name:"Institute of Habitat Engineers", kind:"licensing",
        note:"Sets the examinations. A government that wanted the association's seats would start here and would be noticed." }
    ],
    branches: [
      { station:"perigee", note:"The yards, and the branch that supplies most of the association's officers." },
      { station:"nasmyth", note:"Hammerstead. Heavy fabrication, and the last branch to accept emulated members." }
    ]
  },

  rv: {
    officers: [
      { role:"Moderator", name:"Esme Thorbjørn",
        note:"Elected for one year and by custom never for two. The office is meant to be inconvenient." },
      { role:"Clerk", name:"Amos Ferrier",
        note:"Keeps the minute, which in a congregational party is the constitution." }
    ],
    bodies: [
      { name:"The Continuity Congregations", kind:"church",
        note:"Federated, and they select the candidates. A CDA member of Parliament is answerable to a congregation before a whip." },
      { name:"The Vigil", kind:"society",
        note:"Lay society. Sits with the suspended, in shifts, for as long as the suspension lasts. It has never taken a political position and is the reason the party is trusted by people who disagree with it." }
    ],
    branches: [
      { station:"oberth", note:"Bethesda. The largest congregation, and the one the Moderator comes from." },
      { station:"wickstead", note:"Harvest. Agricultural, observant, and reliably to the left of the parliamentary party on everything but persons." }
    ]
  },

  fh: {
    officers: [
      { role:"Chair", name:"Randall Voight",
        note:"Holds four leases himself and has never seen the difficulty in that." },
      { role:"Chief Agent", name:"Perpetua Lund",
        note:"Works the lease registers rather than the electoral roll, on the reasoning that they are the same document with different columns." }
    ],
    bodies: [
      { name:"The Leaseholders' League", kind:"lobby",
        note:"Older than the party and will outlast it. Publishes the valuation tables everyone argues from, including the Georgists." }
    ],
    branches: [
      { station:"belvedere", note:"Where the long leases are, and where they have been for four generations." },
      { station:"tallow", note:"Pavilion. A low-band branch of small holders, which the League finds embarrassing and cannot do without." }
    ]
  },

  gb: {
    officers: [
      { role:"Convenor", name:"Hiroko Delacroix",
        note:"Convenes the member firms. Is not a member of anything herself and has never stood for election, because there is no election to stand in." }
    ],
    bodies: [
      { name:"The Consortium Table", kind:"assembly",
        note:"Where the functional seats are allocated between firms before anybody votes. The allocation has never once been contested at the poll." }
    ],
    branches: []       /* and see the renderer: the absence is the entry */
  },

  des: {
    officers: [
      { role:"Chair", name:"Marisol Teague",
        note:"Cannot tolerate one gravity and has never been to the surface of anything." }
    ],
    bodies: [
      { name:"The Bone Register", kind:"society",
        note:"A mutual society for the physiologically excluded, which pays out when a member is refused work on a medical. It kept a list of those refusals for thirty years before anyone thought to call it a party." }
    ],
    branches: [
      { station:"dredge", note:"John Henry. Where the refusals are, and where the Register started." },
      { station:"cinder", note:"Lantern. Second oldest, and angrier." }
    ]
  },

  geo: {
    officers: [
      { role:"Secretary", name:"Lucien Abara",
        note:"The party's only officer, and does the agent's work as well. Three seats do not need an organogram." }
    ],
    bodies: [
      { name:"The Ground Rent Society", kind:"society",
        note:"Older than the party by two generations, and regards the party as a recent and probably temporary vehicle. Meets fortnightly and has read everything." }
    ],
    branches: [
      { station:"quarry", note:"Stanbridge. One branch, forty members, and the highest turnout in the Commonwealth." }
    ]
  },

  upl: {
    officers: [
      { role:"Chair", name:"Nkemdi Ravn",
        note:"Two seats and a permanent seat at every negotiation, which she treats as the job rather than as a grievance." }
    ],
    bodies: [
      { name:"The Uplift Compact", kind:"society",
        note:"The charter that fixes the price of the party's support, in writing, in advance. It has never been renegotiated and is the reason nobody bothers trying." }
    ],
    branches: [
      { station:"drift", note:"The Verge. The whole party, more or less, in one habitat." }
    ]
  },

  /* THE ENTRY THAT SAYS THE MOST BY BEING EMPTY. Six district members who
     share a label and nothing else. No office, no agent, no branch, and no
     conference to elect one. */
  ind: { officers: [], bodies: [], branches: [] }
};
