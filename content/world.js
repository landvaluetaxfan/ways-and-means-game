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
     foreign actor, so clicking it shows the relationship the game keeps. */
  states: {
    "BRA": { note:"Granted the Anselm anchor in the 2230s on a ninety-nine-year term. The fee was fixed at grant with no indexation clause, and lift tonnage through the anchor has roughly trebled since. Brazil runs its own launch range and a national orbital programme, and is a net seller of lift to the Commonwealth.",
             markets:"Soy, iron, and launch capacity it would rather the Commonwealth bought than built." },
    "KEN": { actor:"earth_host", note:"The host state. Kenyan soil carries the International Earth-Orbit Elevator, and Kenyan procurement law is why the repatriation plan runs two years rather than six months. Its stated position is that it will not fund a private wind-up, and will not accept a foreign government taking title to a platform at the foot of its own tether.",
             markets:"Tea, geothermal power, and the corridor rights to the Malindi base — the last of which it is the only seller of." },
    "IDN": { note:"Non-aligned, archipelagic, and the largest state on the equator. The anchor was granted in the 2240s during a currency crisis, and Indonesia has moved to reopen the terms at each of the three renewals since.",
             markets:"Nickel, palm, and the busiest equatorial corridor on the planet." },
    "FRA": { actor:"earth_bloc", note:"The Kourou vertical stands on European Union territory, making the Union the only power in the dispute that is also a landlord. Its complaint is about labour and personhood law rather than the platform: the orbital franchises operate below European standards, and no European court has jurisdiction to reach them.",
             markets:"Instruments, aircraft, and the European market the Commonwealth's compute exports want in." },
    "STP": { note:"The anchor concession is the state's entire revenue base. São Tomé is the smallest party to the dispute and the only one with no fiscal capacity to absorb a renegotiation it did not open.",
             markets:"Cocoa, and the concession that pays for everything the cocoa does not." },
    "COL": { note:"The Leticia corridor runs through the Amazon tri-border, a district Colombia polices jointly with Peru and Brazil and administers thinly. Its position, written into the concession instrument and restated at every renewal, is that the lease conveys operating rights over the corridor and no territorial claim whatever.",
             markets:"Coffee, cut flowers, and the corridor into the Amazon basin." },
    "SOM": { note:"A federal authority holding an equatorial coast contested since the 2180s. The anchor is one of three revenue-bearing assets in the district, and the authority's writ over the corridor is recognised in Mogadishu and disputed on the ground.",
             markets:"Livestock, frankincense, and the Kismayo roadstead." },
    "GAB": { note:"Cordell's charter state, and the base of its orbital operations. Gabon has run on extraction since the twenty-first century, and it is the only host here represented in the dispute by a domestic concessionaire rather than by a claim against one.",
             markets:"Manganese, oil, and the Port-Gentil anchor." },
    "KIR": { note:"Kiribati leased the Bond rather than granting it, and it is the only elevator the Commonwealth operates outright. A mid-Pacific state of thirty-three atolls, none of them high ground: the tether base is the tallest structure in its jurisdiction.",
             markets:"Fishing licences, and the ground the Bond's base stands on." },
    "UGA": { note:"The only inland anchor. Its corridor crosses Kenyan and Tanzanian airspace before it clears the atmosphere, so the concession is renewed three ways and the two transit agreements expire on their own schedules.",
             markets:"Coffee, and the corridor the Equator crosses." },
    "ECU": { note:"Ecuador holds the site nearest the line of any in the dozen, on the Chimborazo massif. Its concession has been renegotiated twice, and on both occasions the revised fee favoured the operator.",
             markets:"Bananas, oil, and the Chimborazo corridor." },
    "MDV": { note:"A low-lying island state, mean elevation under two metres. Its tether base stands on reclaimed ground and is the highest point under Maldivian jurisdiction.",
             markets:"Tuna and tourism. Its tether is the only industry it has that does not sink." }
  }
};
