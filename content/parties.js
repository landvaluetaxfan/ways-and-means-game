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
    note:"District independents. No caucus position, no whip, no leader." }
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
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"} }
];
