/* =============================================================
   THE FORUMS (design/43) — chambers the Commonwealth sits in and does
   not command. The engine names no forum; everything it knows about
   one is here.

     members        states and blocs, each with
       votes        how many seats it casts
       axes         its position on the forum's axes, -1 .. +1
       standing     toward the Commonwealth, 0 .. 100, 50 indifferent
       cohesion     for a bloc, the share of its votes that follow its
                    line; the rest abstain. A state is 1.
       actor        an actor whose standing this member reads and moves
       self         the Commonwealth's own seat
     firstAfter     days from the campaign's opening to the first sitting
     every          days between sittings
     majority       of those present and voting; 0.5 is a simple majority
     line           how far a member must lean to vote rather than abstain
     standingWeight how much standing turns a vote toward the Commonwealth's
     climate        [{from, at, weight}]: what every member reads besides
                    its own standing, from a meter

     summary        the Concordance's lede, continuing from the name

   RESOLUTIONS are put to a forum:
     forum, sponsor (a member id), title, summary,
     axes           the resolution's position on the forum's axes
     majority       overrides the forum's (two thirds is 0.6667)
     when           for the Commonwealth's own: when it may be tabled
     whenText       why it cannot be yet, for the Table control
     stances        {member: "for" | "against" | "abstain"}, fixed votes
     vote           the Commonwealth's vote until the government sets one
                    (its own are "for"; anything else "abstain" by default)
     onTable, onPass, onFail   effects
   The world's are here; a campaign's are in its folder.
   ============================================================= */

const FORUMS = [

  { id: "un_ga", name: "United Nations General Assembly", short: "General Assembly",
    /* the Concordance's lede continues from the name */
    summary: "is the plenary organ of the United Nations, in which every member state holds a seat and a vote. The Commonwealth sits as a full member.",
    /* Resumed session through the northern summer, every third Tuesday:
       in Flash I that is 11 June, 2 July, 23 July and 13 August, one sitting
       after the dilemma, two while the House sits and one in the campaign. */
    firstAfter: 61, every: 21,
    majority: 0.5, line: 0.15, standingWeight: 0.6,
    /* A Commonwealth in a quarrel with Earth finds every vote harder: at a
       friction of 90, forty points over the opening, every member leans
       0.4 of a line away from it. */
    climate: [{ from: "friction", at: 50, weight: -0.5 }],
    axes: {
      orbital:   "Earth's jurisdiction over orbit, or self-determination for orbital polities",
      creditors: "rescue before repayment, or creditors' rights"
    },
    members: [
      { id: "commonwealth_mission", name: "The Circumterrestrial Commonwealth", votes: 1, self: true },

      /* THE UNION'S CAUCUS keeps its members' seats (the author, 26 Sep):
         twenty-seven states that vote on a line the Union agrees, about
         four in five of them on it. Its standing is the European Union
         actor's. France holds Tether 4 at Kourou and sits here. */
      { id: "eu_caucus", name: "The European Union's twenty-seven", votes: 27, cohesion: 0.8,
        actor: "earth_bloc", axes: { orbital: -0.5, creditors: 0.8 } },

      /* THE OTHER ANCHOR HOSTS, one vote each (content/world.js). Their
         standing opens on what the Commonwealth is to them. */
      { id: "kenya", name: "Kenya", votes: 1, actor: "earth_host",
        axes: { orbital: -0.2, creditors: -0.2 } },     // the host of the Works' tether; will not see it annexed at the foot of its own anchor
      { id: "brazil", name: "Brazil", votes: 1, standing: 55,
        axes: { orbital: 0.2, creditors: 0 } },         // a fixed fee to 2164 and its own launch range
      { id: "indonesia", name: "Indonesia", votes: 1, standing: 45,
        axes: { orbital: -0.3, creditors: -0.2 } },     // has sought to reopen its concession at every review
      { id: "sao_tome", name: "São Tomé and Príncipe", votes: 1, standing: 65,
        axes: { orbital: 0.5, creditors: -0.3 } },      // the Clothesline's fee is its principal revenue
      { id: "colombia", name: "Colombia", votes: 1, standing: 50,
        axes: { orbital: 0, creditors: 0.2 } },
      { id: "somalia", name: "Somalia", votes: 1, standing: 50,
        axes: { orbital: 0.1, creditors: -0.4 } },
      { id: "gabon", name: "Gabon", votes: 1, standing: 30,
        axes: { orbital: -0.6, creditors: 0.9 } },      // its sovereign fund owns Cordell
      { id: "kiribati", name: "Kiribati", votes: 1, standing: 70,
        axes: { orbital: 0.6, creditors: -0.2 } },      // leases the Bond's site to the Commonwealth
      { id: "uganda", name: "Uganda", votes: 1, standing: 50,
        axes: { orbital: 0, creditors: -0.2 } },
      { id: "ecuador", name: "Ecuador", votes: 1, standing: 45,
        axes: { orbital: -0.2, creditors: 0.3 } },     // Cordell holds its concession
      { id: "maldives", name: "the Maldives", votes: 1, standing: 55,
        axes: { orbital: 0.2, creditors: -0.4 } },

      /* THE REST OF THE WORLD, as the UN's five regional groups less the
         states drawn out above. 194 votes in all. */
      { id: "african_group", name: "The African Group", votes: 49, cohesion: 0.6, standing: 50,
        axes: { orbital: 0.3, creditors: -0.5 } },      // self-determination and debt relief
      { id: "asia_pacific_group", name: "The Asia-Pacific Group", votes: 50, cohesion: 0.4, standing: 50,
        axes: { orbital: -0.1, creditors: 0 } },        // divided, and mostly waiting
      { id: "latin_american_group", name: "The Latin American and Caribbean Group", votes: 30, cohesion: 0.6, standing: 50,
        axes: { orbital: 0.2, creditors: -0.4 } },
      { id: "eastern_european_group", name: "The Eastern European Group", votes: 12, cohesion: 0.5, standing: 45,
        axes: { orbital: -0.3, creditors: 0.3 } },
      { id: "western_group", name: "The Western European and Others Group", votes: 14, cohesion: 0.6, standing: 45,
        axes: { orbital: -0.4, creditors: 0.7 } }       // with the United States; the lenders' side
    ] }

];

/* The world's resolutions. None yet: the General Assembly's business in
   Flash I is the campaign's (content/campaigns/flash_i/resolutions.js). */
const RESOLUTIONS = [

];

if (typeof module !== "undefined") module.exports = { FORUMS, RESOLUTIONS };
