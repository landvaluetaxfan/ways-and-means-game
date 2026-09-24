/* PARTIES — add a party by adding an object here. Nothing else needs to change.
   axes: five signed axes from -1 to +1, named with their poles in
         js/schema.js (economic, authority, personhood, sovereignty, trade).
   Omit an axis (or use null) where the party has no settled position.
   loyalty: a party WITHOUT currents carries its own. A party with currents
         (below) carries none: its loyalty is the member-weighted mean of its
         currents', and for the government's party that mean is the Party
         loyalty meter (the author, 23 Sep; js/engine.js syncLoyalty). Five
         parties had a figure here as well, and three disagreed with their
         own currents -- the CDA at 23 against currents averaging 54.
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
    kind:"national",
    axes:{economic:-0.75, authority:-0.4, personhood:-0.55, sovereignty:0.5, trade:-0.35},
    note:"Old left. Embodied maintenance labour, and the strike weapon." },

  { id:"cl",  name:"Liberal Party",                short:"LIB", colour:"var(--p-cl)",
    leader:"watkins", logo:"cl.png", wordmark:"cl_mark.png",
    seats:{district:22,list:19,functional:6},
    kind:"national",
    axes:{economic:0.7, authority:-0.1, personhood:0.6, sovereignty:0.75, trade:0.9},
    note:"Cosmopolitan market party. Elevator and shipping money." },

  { id:"psa", name:"New Progressive Party",        short:"NPP", colour:"var(--p-psa)",
    leader:"trottier", logo:"psa.png", wordmark:"psa_mark.png",
    aliases:["Substrate Left"],
    seats:{district:6,list:28,functional:2},
    kind:"national", loyalty:41,
    axes:{economic:-0.8, authority:-0.3, personhood:0.85, sovereignty:0.6, trade:0.55},
    note:"List-tier strength and almost no districts. Left on economics and expansionist on personhood, which sets it against the old left on the question it cares most about." },

  { id:"sc",  name:"Home Rule",                    short:"HR",  colour:"var(--p-sc)",
    leader:"laughon", logo:"sc.png", wordmark:"sc_mark.png",
    seats:{district:26,list:8,functional:0},
    kind:"national", loyalty:35,
    axes:{economic:-0.1, authority:-0.5, personhood:0, sovereignty:-0.9, trade:-0.75},
    note:"Confederalist. Cannot whip its own members." },

  { id:"hul", name:"Association of Engineers and Systems", short:"AES", colour:"var(--p-hul)",
    leader:"wilde_hayward", logo:"hul.png", wordmark:"hul_mark.png",
    seats:{district:9,list:6,functional:7},
    kind:"national", loyalty:15,
    axes:{economic:0, authority:0.95, personhood:-0.6, sovereignty:0.1, trade:-0.6},
    note:"Habitat as lifeboat. Engineering authority supreme." },

  { id:"rv",  name:"Congregational Democratic Alliance", short:"CDA", colour:"var(--p-rv)",
    leader:"park", logo:"rv.png", wordmark:"rv_mark.png",
    seats:{district:12,list:5,functional:1},
    kind:"national",
    axes:{economic:-0.45, authority:-0.2, personhood:-0.9, sovereignty:0, trade:-0.1},
    note:"Continuity of soul. A copy is not the person. Economically left, culturally immovable." },

  { id:"fh",  name:"Freehold Party",               short:"FH",  colour:"var(--p-fh)",
    leader:"bluespan", logo:"fh.png", wordmark:"fh_mark.png",
    seats:{district:8,list:3,functional:6},
    kind:"national",
    axes:{economic:0.9, authority:-0.25, personhood:-0.4, sovereignty:-0.6, trade:0.3},
    note:"Volume owners. Property absolutists." },

  { id:"gb",  name:"Alliance of Business and Government", short:"ABG", colour:"var(--p-gb)",
    leader:"hatt", logo:"gb.png", wordmark:"gb_mark.png",
    aliases:["Guild Bench"],
    seats:{district:0,list:0,functional:9},
    kind:"professional", loyalty:30,
    axes:{economic:0.15, authority:0.85, personhood:-0.5, sovereignty:0.4, trade:-0.4},
    note:"Exists only in the functional tier. It does not campaign and cannot be voted out." },

  { id:"des", name:"One-G",                        short:"ONE", colour:"var(--p-des)",
    leader:"edelstein_powell", logo:"des.png", wordmark:"des_mark.png",
    seats:{district:3,list:1,functional:0},
    kind:"national", loyalty:18,
    axes:{economic:-0.2, authority:-0.15, personhood:-0.7, sovereignty:-0.3, trade:-0.2},
    note:"Gravity as birthright. Draws the physiologically excluded." },

  { id:"geo", name:"Single Tax Party",             short:"STP", colour:"var(--p-geo)",
    leader:"wheeler", logo:"geo.png", wordmark:"geo_mark.png",
    seats:{district:0,list:3,functional:0},
    kind:"national", loyalty:66,
    axes:{economic:0.05, authority:0.2, personhood:0.1, sovereignty:0.7, trade:0.6},
    /* No carve-out: a national ideological party with no district roots and
       no category to protect. It lives or dies on the threshold every time,
       which is exactly the party 4.8 says will agonise just below the line. */
    note:"Volume tax, land value tax, nothing else. Three seats, and always "+
         "within a point of the threshold." },

  { id:"upl", name:"Uplift Alliance",              short:"UPA", colour:"var(--p-upl)",
    leader:"lindegaard", logo:"upl.png", wordmark:"upl_mark.png",
    seats:{district:0,list:2,functional:0},
    kind:"national",
    /* Bible 4.8: the list threshold exempts a party representing a single
       legal-person category, as minority protection. The Uplift Alliance is
       the case that carve-out was written for — and the exemption is itself
       permanently contested, which is the point of having it. */
    carve_out:"category",
    axes:{economic:-0.6, authority:-0.35, personhood:0.95, sovereignty:0.3, trade:0.4},
    note:"Two seats. Permanently kingmaker-adjacent. Price is always the same thing. "+
         "Exempt from the list threshold under the single-category carve-out, which "+
         "half the chamber would repeal tomorrow." },

  { id:"ind", name:"Independents",                 short:"IND", colour:"var(--p-ind)",
    leader:null,
    seats:{district:6,list:0,functional:0},
    kind:"national",
    axes:{},
    note:"District independents. No caucus position, no whip, no leader. Six members " +
         "and six arguments: the seats on Sinter share one, and the others share " +
         "nothing. Where three of them vote together it is something to notice in " +
         "the division list rather than anything the House was told." }
];

/* CURRENTS — factions inside a party. Same axes as a party; a current that
   drifts far enough simply becomes a party in the list above.

   `description` is in-world prose, printed in the party's Concordance
   article and as the current's tooltip in the Chamber's composition
   table. A current has no article of its own (the author, 23 Sep): it is
   something its party contains.

   NAMED FOR WHERE THEY STAND (the author, 23 Sep). Hard left and soft left
   are clear because each is a position everyone knows plus a qualifier, and
   the old names were descriptions an analyst would write ("Maintenance
   bloc", "Leadership loyalists", "The Title Caucus"). So a current is named
   the way real factions are, a pole and a side, and the poles are the
   game's own axis words: the federation argument that splits this
   parliament shows in the names themselves (Station Left, Station Right,
   Federal Right). Where a party's split is not positional but about what
   comes first, the name says that instead (Confessionals and
   Coalitionists, Purists and Pragmatists). The ids are unchanged. */
const CURRENTS = [
  { id:"cu_maintenance", party:"cu", name:"Trades Left",          members:31, loyalty:29,
    axes:{economic:-0.85, authority:-0.35, personhood:-0.8, sovereignty:0.4, trade:-0.6},
    description:"The Trades Left is the largest current in the Party of Socialists and Democrats. Its members come from the maintenance trades and their unions. It supports public ownership of the systems its members maintain, federal funding for their upkeep, and limits on trade with Earth. It opposes extending legal personhood." },
  { id:"cu_loyalists",   party:"cu", name:"Soft Left",             members:22, loyalty:88,
    axes:{economic:-0.7, authority:-0.4, personhood:-0.4, sovereignty:0.55, trade:-0.25},
    description:"The Soft Left is the current of the party leadership, and includes Imre Whitlam, the Leader of the House. It supports public ownership and a strong federal government, and it opposes extending legal personhood. It favours only modest limits on trade with Earth." },
  { id:"cu_deck",        party:"cu", name:"Station Left",          members:18, loyalty:54,
    axes:{economic:-0.7, authority:-0.55, personhood:-0.5, sovereignty:-0.4, trade:-0.85},
    description:"The Station Left is the current of the deck co-operatives, which run the working decks of several stations. It supports public ownership, more self-government for the stations, and strict limits on trade with Earth. It opposes extending legal personhood." },
  { id:"cu_halloran",    party:"cu", name:"Hard Left",              members:11, loyalty:12,
    axes:{economic:-0.9, authority:-0.5, personhood:-0.35, sovereignty:0.2, trade:-0.5},
    description:"The Hard Left is the party's left flank. It is led by Dan Czarnecki, the member for Tier Four, and the press calls it the Czarnecki group. It supports public ownership of the whole economy and limits on trade with Earth, and it leans against extending legal personhood. Its members have been collecting signatures to force a leadership ballot." },

  /* THE LIBERALS (the author, 23 Sep: "social, abundance, and classical
     liberals"). The party's own position is the member-weighted mean of
     these three to within a few hundredths on every axis, and their
     loyalty averages the 20 the party carried before it had currents, so
     the split changes WHO turns out on a measure and not the party line.
     Classical: the elevator and shipping money, the largest. Abundance:
     the shortages are shortages of building. Social: rights and personhood
     first, the market second. */
  { id:"cl_classical", party:"cl", name:"Classical Liberals",  members:20, loyalty:13,
    axes:{economic:0.95, authority:-0.25, personhood:0.4, sovereignty:0.7, trade:1},
    description:"The Classical Liberals are the largest current in the Liberal Party, and include its leader, Darren Watkins Jr., the Leader of the Opposition. Their support comes largely from the elevator and shipping consortiums. They support private ownership, open trade with Earth, and a federal government that regulates little and balances its budget. They support a gradual extension of legal personhood." },
  { id:"cl_abundance", party:"cl", name:"Abundance Liberals",  members:15, loyalty:29,
    axes:{economic:0.55, authority:0.3, personhood:0.6, sovereignty:0.9, trade:0.9},
    description:"The Abundance Liberals hold that the Commonwealth's main shortages, of volume, radiator capacity and docks, come from building too little. They support private investment, a federal government with the power to approve and speed up construction, and open trade with Earth. They support extending legal personhood." },
  { id:"cl_social",    party:"cl", name:"Social Liberals",     members:12, loyalty:20,
    axes:{economic:0.35, authority:-0.5, personhood:0.95, sovereignty:0.65, trade:0.7},
    description:"The Social Liberals are the Liberal Party's civil-liberties current. Their priorities are extending legal personhood and limiting the powers of the state. They support a market economy with public provision of essential services, and open trade with Earth." },

  /* THE RENAMED PARTIES' ARGUMENTS (T7, design/24 B1). A party with no
     internal current is a bloc that votes, and these three names imply an
     argument that did not exist in the data. Members sum to popular seats
     (district + list), the way the cu currents do. */

  /* FREEHOLD: property absolutists who disagree on whose courts defend the
     deed. The Federal Right wants the Commonwealth to enforce title; the
     Station Right wants the station's own law and nothing federal near it. */
  { id:"fh_title",     party:"fh", name:"Federal Right",           members:6, loyalty:38,
    axes:{economic:0.95, authority:-0.1, personhood:-0.45, sovereignty:0.35, trade:null},
    description:"The Federal Right, led by Alan Bluespan III, the leader of the Freehold Party, wants property titles enforced by the Commonwealth's federal courts. It supports private ownership and opposes extending legal personhood." },
  { id:"fh_section",   party:"fh", name:"Station Right",           members:5, loyalty:50,
    axes:{economic:0.85, authority:-0.4, personhood:null, sovereignty:-0.85, trade:null},
    description:"The Station Right holds that property should be governed by each station's own law and courts, with no federal involvement. It supports private ownership. It has no settled position on legal personhood." },

  /* THE CDA: a church and a coalition partner, and the two argue. The
     Confessionals put the faith first: the congregations made the party and
     voted the conference 71-29 against the threshold. The Coalitionists put
     the coalition first: they hold the offices and vote like a partner,
     which is why they absented themselves rather than divide against the
     leadership in public (8.5). */
  { id:"rv_congregation", party:"rv", name:"Confessionals",         members:11, loyalty:62,
    axes:{economic:null, authority:-0.15, personhood:-0.95, sovereignty:null, trade:null},
    description:"The Confessionals are the religious congregations that founded the Congregational Democratic Alliance, and include the party's leader, Ryan Jung-Hee Park. Their one fixed position is opposition to extending legal personhood; on other questions their members vote freely. At the party conference they voted 71 to 29 against the divergence threshold bill." },
  { id:"rv_ministerial",  party:"rv", name:"Coalitionists",         members:6, loyalty:40,
    axes:{economic:-0.55, authority:-0.2, personhood:-0.8, sovereignty:0.45, trade:null},
    description:"The Coalitionists are the Congregational Democratic Alliance members who hold office in the government, and their priority is keeping the coalition together. They oppose extending legal personhood, and they also support public ownership and a strong federal government. When the party conference voted against the leadership, they did not take part in the vote." },

  /* UPLIFT: two seats and one question, whether they are there to witness or
     to trade: the Purists will not deal on personhood, the Pragmatists will.
     Each current is one of the two members. */
  { id:"upl_witness", party:"upl", name:"Purists",                  members:1, loyalty:70,
    axes:{economic:-0.7, authority:-0.5, personhood:1, sovereignty:null, trade:null},
    description:"The Purists are one of the Uplift Alliance's two members. The member supports full legal personhood for uplifts as a matter of principle, and does not trade votes on other measures for it. The member also supports public ownership." },
  { id:"upl_bridge",  party:"upl", name:"Pragmatists",              members:1, loyalty:50,
    axes:{economic:-0.5, authority:-0.2, personhood:0.85, sovereignty:0.6, trade:0.7},
    description:"The Pragmatists are the Uplift Alliance's other member, its leader Aalborg Lindegaard. The member supports extending legal personhood, and votes with the government on other measures in exchange for progress on it. The member also supports open trade with Earth and a strong federal government." },

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
    axes:{economic:-0.4, authority:-0.1, personhood:-0.5, sovereignty:0.3, trade:-0.7},
    description:"Rosalind Grimsby is the independent member for Homestead A. The member supports public ownership and limits on trade with Earth, is cautious about extending legal personhood, and votes most often with the governing party. The member belongs to no bloc." },
  { id:"ind_kirilenko", party:"ind", name:"Clearmont & Sowerby", members:1, loyalty:55,
    axes:{economic:-0.45, authority:-0.45, personhood:0.7, sovereignty:-0.65, trade:0.8},
    description:"Dmitri Kirilenko is the independent member for Clearmont & Sowerby. The member supports extending legal personhood, more self-government for the stations, and open trade with Earth." },
  { id:"ind_vasquez",   party:"ind", name:"Stanbridge",          members:1, loyalty:62,
    axes:{economic:null, authority:0.15, personhood:-0.6, sovereignty:0.4, trade:-0.75},
    description:"Marek Vasquez is the independent member for Stanbridge. The member supports a stronger federal government, limits on trade with Earth, and caution in extending legal personhood, and takes no position on ownership." },
  { id:"ind_kettering", party:"ind", name:"Colonnade",           members:1, loyalty:70,
    axes:{economic:null, authority:-0.2, personhood:null, sovereignty:-0.8, trade:-0.8},
    description:"Brennan Kettering is the independent member for Colonnade, elected on a localist platform of more self-government for the stations and limits on trade with Earth. The member usually votes with the members for Wrenfield-Aubrey and John Henry." },
  { id:"ind_castellan", party:"ind", name:"Wrenfield-Aubrey",    members:1, loyalty:74,
    axes:{economic:null, authority:-0.3, personhood:null, sovereignty:-0.75, trade:-0.85},
    description:"Nadia Castellan is the independent member for Wrenfield-Aubrey, elected on the same localist platform as the member for Colonnade: more self-government for the stations and limits on trade with Earth." },
  { id:"ind_merrick",   party:"ind", name:"John Henry",          members:1, loyalty:66,
    axes:{economic:-0.55, authority:-0.25, personhood:-0.65, sovereignty:-0.7, trade:-0.9},
    description:"Beatrix Merrick is the independent member for John Henry, elected on the localist platform of the members for Colonnade and Wrenfield-Aubrey, and also opposed to extending legal personhood. The three localist members often vote together." }
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
      { station:"belvedere", note:"Where the long leases are, and where they have been since the first of them was written." },
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
        note:"Older than the party — it was a mutual before there was a Commonwealth to register it in — and regards the party as a recent and probably temporary vehicle. Meets fortnightly and has read everything." }
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
