/* =============================================================
   THE WORLD — where the anchors stand (design/29).

   A tether's base is not a free choice. The counterweight hangs at
   geostationary, so the base must be equatorial, stable and able to
   give a corridor; and the best equatorial sites on Earth mostly
   belong to states the orbital Commonwealth grew rich past. That is
   the whole of the foreign layer's grievance, and it is drawn here.

   `anchors` is the twelve of §10.10, four of them the Commonwealth's
   named elevators (design/29 §2) and the rest the other states'
   works. `states` are the countries worth a summary: the ones with an
   anchor, the ones a modelled actor holds, and the ones the fiction
   already names.

   lat/lng are the real sites. Nothing else here is: a station is
   orbital and not geographic, so stations are drawn on a shell above
   the globe rather than at a point on it, which is the honest thing.
   ============================================================= */

const WORLD = {

  /* =============================================================
     THE QUESTION THE CAMPAIGN IS ABOUT.

     The Bellamy Almanac Works is NOT a station of the Commonwealth. It is
     not in the roster, it returns no members, and it is not in the
     apportionment — because the campaign BEGINS before the question of
     annexing it is settled. That is the whole shape of the story: whether
     the Works should come in, and on what terms, is what the session is
     for.

     So it is a FOREIGN body, and it lives here rather than in
     content/stations.js. Its operator holds its charter; its workforce is
     the largest single employer outside the Commonwealth's jurisdiction;
     and its annexation is the act that would force a reapportionment —
     which is a consequence of the ending, not a premise of the opening.
     Engine's tier totals read `st.stations`, so a body that is not in the
     roster simply does not count, which is exactly right.
     ============================================================= */
  foreign: [
    { id:"almanac_works", name:"The Bellamy Almanac Works, Brant & Vane",
      short:"the Almanac",
      operator:"Cordell",            /* absorbed the Bellamy concern, kept the name */
      site:"Tether 11, the Chimborazo line", lat:-2.9, lng:-79.1,
      population:184000, workforce:97000,
      closure:0.44, suspended:7100, attested:0.66,
      composition:{ biological:0.74, emulation:0.2, uplift:0.04, synthetic:0.02 },
      charter:"A private charter held by the operator and not granted by any Commonwealth.",
      note:"A works station built by the Bellamy concern and absorbed by Cordell, which kept the name " +
           "because the name is the brand. It is the largest single employer outside the Commonwealth's " +
           "jurisdiction and it is not in the apportionment: it returns no members, it pays no federal " +
           "consumables levy, and its constitution is a contract between a company and its workforce. " +
           "Whether it should come in — and on what terms, and who pays for the charter to be " +
           "surrendered — is the question the session is for. These are the last figures filed: " +
           "nobody files a return after abandoning a station.",
      grievance:"That everyone in the House has an opinion about it and nobody has read the charter.",
      interests:["shed_order_priority", "essential_services_law", "consumables_subsidy"] }
  ],
  /* tether: the name the Commonwealth uses; formal: the instrument's name. */
  anchors: [
    { id:"tether_1",  tether:"The Beanstalk", formal:"",                               station:"anselm",       site:"Macapá, Brazil",          lat:  0.03, lng: -51.07, host:"Brazil", iso:"BRA",               mine:true },
    { id:"tether_2",  tether:"the International", formal:"International Earth-Orbit Elevator", station:"kepler", site:"Malindi, Kenya",          lat: -3.22, lng:  40.12, host:"Kenya", iso:"KEN",                mine:true },
    { id:"tether_3",  tether:"the Sumatra line", formal:"",                            station:null,           site:"Pontianak, Indonesia",    lat: -0.02, lng: 109.34, host:"Indonesia", iso:"IDN",            mine:false },
    { id:"tether_4",  tether:"the Kourou vertical", formal:"",                         station:"bourse",       site:"Kourou, French Guiana",   lat:  5.16, lng: -52.65, host:"European Union", iso:"FRA",       mine:false },
    { id:"tether_5",  tether:"The Clothesline", formal:"The Meridian Vertical",        station:"meridian",     site:"São Tomé",                lat:  0.34, lng:   6.73, host:"São Tomé and Príncipe", iso:"STP", mine:true },
    { id:"tether_6",  tether:"the Leticia line", formal:"",                           station:"halvard",      site:"Leticia, Colombia",       lat: -4.21, lng: -69.94, host:"Colombia", iso:"COL",             mine:false },
    { id:"tether_7",  tether:"the Kismayo line", formal:"",                           station:"grimaldi",     site:"Kismayo, Somalia",        lat: -0.36, lng:  42.55, host:"Somalia", iso:"SOM",              mine:false },
    { id:"tether_8",  tether:"the Port-Gentil line", formal:"",                       station:"corvus",       site:"Port-Gentil, Gabon",      lat: -0.72, lng:   8.78, host:"Gabon", iso:"GAB",                mine:false },
    { id:"tether_9",  tether:"The Bond", formal:"Bondsville Anchor No. 9",              station:"sable",        site:"Christmas Island, Kiribati", lat: 1.87, lng: -157.43, host:"Kiribati", iso:"KIR",           mine:true, leased:true },
    { id:"tether_10", tether:"the Entebbe line", formal:"",                           station:null,           site:"Entebbe, Uganda",         lat:  0.05, lng:  32.46, host:"Uganda", iso:"UGA",               mine:false },
    { id:"tether_11", tether:"the Chimborazo line", formal:"",                        station:null,           site:"Chimborazo, Ecuador",     lat: -1.47, lng: -78.82, host:"Ecuador", iso:"ECU",              mine:false },
    { id:"tether_12", tether:"the Malé line", formal:"",                              station:null,           site:"Malé, the Maldives",      lat:  4.18, lng:  73.51, host:"the Maldives", iso:"MDV",         mine:false }
  ],

  /* `iso` ON EACH ANCHOR is what links it to the state it stands on, and it
     had to be added: `host` is a display name ("Brazil", "the Maldives") and
     the states below are keyed by code, so js/world.js comparing
     `a.host === view.sel` was comparing a name to a code and never matched.
     The CSS for `.w-anchor.sel` has been in the stylesheet, unreachable,
     since it was written — selecting a country never lit its anchor. */

  /* The countries worth a summary. `actor` links the country to a modelled
     foreign actor, so clicking it shows the relationship the game keeps.

     THE REGISTER IS AN ATLAS'S (the author, 24 Sep): the place, the anchor,
     the economy, the dates, in plain declarative sentences. No aphorism to
     close on and no contrast built for effect; a fact that makes a country
     unusual is stated as a fact.

     `note` is always shown. `dispute` is what the country has to do with the
     Almanac Works, and appears under its own heading only once the station
     question is before the government (the `station_issue` flag, the same
     gate as the foreign actors), because a reference that describes the
     crisis before it happens is a reference that knows the plot.

     `name` is for a state the map has no outline for (France, São Tomé and
     Príncipe, Kiribati, the Maldives): without it the panel printed the
     three-letter code where the name belongs. */
  states: {
    "BRA": { note:"Brazil hosts Tether 1, the Beanstalk, at Macapá, the capital of Amapá state, which lies on the equator at the mouth of the Amazon. The anchor serves Anselm Ring. The concession was granted in 2065 for ninety-nine years, to 2164, at a fee fixed at grant with no indexation clause; lift tonnage through the anchor has roughly trebled since. Brazil operates its own launch range at Alcântara and a national orbital programme, and sells lift to the Commonwealth.",
             markets:"Soybeans, iron ore, beef, and launch services from Alcântara." },
    "KEN": { actor:"earth_host", note:"Kenya hosts Tether 2, the International Earth-Orbit Elevator, at Malindi on the Indian Ocean coast, near the Broglio Space Centre at Ngomeni. The elevator serves Anchorage and was established by international treaty, whose title is its formal name. Kenya is a middle power with a large public administration and an established space programme.",
             dispute:"Kenyan procurement law governs the repatriation plan for the Almanac Works' workforce, under which the approved programme runs two years. The government has said that it will not meet the cost of a private company's wind-up, and that it will not accept a foreign government taking title to the platform.",
             markets:"Tea, cut flowers, geothermal power, and corridor rights at the Malindi base." },
    "IDN": { note:"Indonesia hosts Tether 3 at Pontianak, the capital of West Kalimantan on the island of Borneo, less than a kilometre from the equator. The concession was granted in 2068 during a currency crisis. Indonesia has sought to reopen its terms at both of the fee reviews held since. The tether serves no Commonwealth station.",
             markets:"Nickel, palm oil, coal, and shipping through the equatorial straits." },
    "FRA": { actor:"earth_bloc", name:"France", note:"Tether 4, the Kourou vertical, stands at Kourou in French Guiana, an overseas region of France and an outermost region of the European Union, where the Guiana Space Centre has operated since 1968. The anchor serves the Bourse. Its concession is held under European law, and the Union treats the tether as European infrastructure.",
             dispute:"The Union is a party to the dispute both as a sanctioning power and as the holder of an anchor. Its stated objections concern labour and personhood law: the orbital franchises operate below European standards, and European courts have no jurisdiction over them.",
             markets:"Aircraft, instruments, pharmaceuticals, and access to the European market for Commonwealth compute." },
    "STP": { name:"São Tomé and Príncipe", note:"São Tomé and Príncipe is an island state in the Gulf of Guinea, lying 0.3° north of the equator. It hosts Tether 5, the Meridian Vertical, known in the Commonwealth as the Clothesline, which serves Meridian Spindle. The concession fee is the state's principal source of public revenue.",
             dispute:"São Tomé has no fiscal capacity to absorb a change in the concession's terms and has taken no public position in the dispute.",
             markets:"Cocoa, coffee, and the Meridian concession." },
    "COL": { note:"Colombia hosts Tether 6, the Leticia line, at Leticia, the capital of Amazonas department, on the tri-border with Brazil and Peru. The anchor serves Halvard Works. The district is policed jointly with Peru and Brazil. The concession instrument states, and each renewal has restated, that the lease conveys operating rights over the corridor and no territorial claim.",
             markets:"Coffee, cut flowers, oil, and the Leticia corridor." },
    "SOM": { note:"Tether 7, the Kismayo line, stands at Kismayo, a port in the Jubaland region of southern Somalia, and serves Layover. The coast has been contested since the 2040s. The anchor is administered by a federal authority whose writ is recognised in Mogadishu and disputed on the ground, and it is one of three revenue-bearing assets in the district.",
             markets:"Livestock, frankincense, and the Kismayo roadstead." },
    "GAB": { note:"Gabon hosts Tether 8, the Port-Gentil line, which serves Rookworks\u2014Anselm. Port-Gentil, on Mandji Island at Cape Lopez, has been the centre of the country's oil industry since the 1950s, and Gabon is among the largest producers of manganese in the world. The concession is held by Cordell, an extraction company chartered by an act of the Gabonese Assembly in 2044. Cordell is majority-owned by the Gabonese sovereign fund and directs its orbital operations from Port-Gentil.",
             dispute:"Gabon is represented in the dispute through Cordell, whose subsidiary operated the Almanac Works until its wind-up. As the company's principal owner, the government has made no statement separate from the company's.",
             markets:"Oil, manganese, timber, and the Port-Gentil anchor." },
    "KIR": { name:"Kiribati", note:"Kiribati is a Pacific state of thirty-three islands, most of them low coral atolls, spread across more than three million square kilometres of ocean. Tether 9, the Bond, stands on Kiritimati (Christmas Island) in the Line Islands, the largest coral atoll in the world by land area, and serves Bondsville. The site is leased to the Commonwealth, which operates the elevator itself. The tether base is the tallest structure in the country.",
             markets:"Fishing licences, copra, and the lease on the Kiritimati site." },
    "UGA": { note:"Uganda hosts Tether 10, the Entebbe line, on the northern shore of Lake Victoria; it is the one anchor in the dozen that stands inland. Its corridor crosses Kenyan and Tanzanian airspace before it clears the atmosphere, so the concession is renewed three ways, and the two transit agreements expire on their own schedules. The tether serves no Commonwealth station.",
             markets:"Coffee, gold, fish from Lake Victoria, and the Entebbe corridor." },
    "ECU": { note:"Ecuador hosts Tether 11, the Chimborazo line, on the Chimborazo massif, 1.5° south of the equator. Chimborazo's summit is the point on the Earth's surface farthest from its centre. The line serves the Almanac Works. Its concession has been renegotiated twice, and both revisions reduced the fee payable by the operator.",
             markets:"Bananas, oil, shrimp, and the Chimborazo corridor." },
    "MDV": { name:"the Maldives", note:"The Maldives is an archipelago of coral atolls in the Indian Ocean, with an average ground level of about one and a half metres. Tether 12, the Malé line, stands on reclaimed land near the capital, Malé, and its base is the highest point in the country. The tether serves no Commonwealth station.",
             markets:"Tourism, tuna, and the Malé corridor." }
  }
};
