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
           "surrendered — is the question the session is for.",
      grievance:"That everyone in the House has an opinion about it and nobody has read the charter.",
      interests:["shed_order_priority", "essential_services_law", "consumables_subsidy"] }
  ],
  /* tether: the name the Commonwealth uses; formal: the instrument's name. */
  anchors: [
    { id:"tether_1",  tether:"The Beanstalk", formal:"",                               station:"anselm",       site:"Macapá, Brazil",          lat:  0.03, lng: -51.07, host:"Brazil",               mine:true },
    { id:"tether_2",  tether:"the International", formal:"International Earth-Orbit Elevator", station:"kepler", site:"Malindi, Kenya",          lat: -3.22, lng:  40.12, host:"Kenya",                mine:true },
    { id:"tether_3",  tether:"the Sumatra line", formal:"",                            station:null,           site:"Pontianak, Indonesia",    lat: -0.02, lng: 109.34, host:"Indonesia",            mine:false },
    { id:"tether_4",  tether:"the Kourou vertical", formal:"",                         station:"bourse",       site:"Kourou, French Guiana",   lat:  5.16, lng: -52.65, host:"European Union",       mine:false },
    { id:"tether_5",  tether:"The Clothesline", formal:"The Meridian Vertical",        station:"meridian",     site:"São Tomé",                lat:  0.34, lng:   6.73, host:"São Tomé and Príncipe", mine:true },
    { id:"tether_6",  tether:"the Leticia line", formal:"",                           station:"halvard",      site:"Leticia, Colombia",       lat: -4.21, lng: -69.94, host:"Colombia",             mine:false },
    { id:"tether_7",  tether:"the Kismayo line", formal:"",                           station:"grimaldi",     site:"Kismayo, Somalia",        lat: -0.36, lng:  42.55, host:"Somalia",              mine:false },
    { id:"tether_8",  tether:"the Port-Gentil line", formal:"",                       station:"corvus",       site:"Port-Gentil, Gabon",      lat: -0.72, lng:   8.78, host:"Gabon",                mine:false },
    { id:"tether_9",  tether:"The Bond", formal:"Bondsville Anchor No. 9",              station:"sable",        site:"Christmas Island, Kiribati", lat: 1.87, lng: -157.43, host:"Kiribati",           mine:true, leased:true },
    { id:"tether_10", tether:"the Entebbe line", formal:"",                           station:null,           site:"Entebbe, Uganda",         lat:  0.05, lng:  32.46, host:"Uganda",               mine:false },
    { id:"tether_11", tether:"the Chimborazo line", formal:"",                        station:null,           site:"Chimborazo, Ecuador",     lat: -1.47, lng: -78.82, host:"Ecuador",              mine:false },
    { id:"tether_12", tether:"the Malé line", formal:"",                              station:null,           site:"Malé, the Maldives",      lat:  4.18, lng:  73.51, host:"the Maldives",         mine:false }
  ],

  /* The countries worth a summary. `actor` links the country to a modelled
     foreign actor, so clicking it shows the relationship the game keeps. */
  states: {
    "BRA": { note:"Granted the Anselm anchor on a ninety-nine-year term in the 2230s and has watched the traffic grow past the fee ever since. It has its own launch range and its own orbital programme, and it wants the Commonwealth as a customer rather than a dependent.",
             markets:"Soy, iron, and launch capacity it would rather the Commonwealth bought than built." },
    "KEN": { actor:"earth_host", note:"The host state. Its soil carries the International Earth-Orbit Elevator, and its procurement law is why its own repatriation plan is two years long. It will not carry the cost of a corporation's wind-up and it will not let a foreign government annex a platform at the foot of its own tether.",
             markets:"Tea, geothermal power, and the corridor rights to the Malindi base — the last of which it is the only seller of." },
    "IDN": { note:"Non-aligned, archipelagic, and the largest state on the equator. Its anchor was granted in a decade when it needed the money, and it has been renegotiating since.",
             markets:"Nickel, palm, and the busiest equatorial corridor on the planet." },
    "FRA": { actor:"earth_bloc", note:"The Kourou vertical stands on European Union territory, which is why the Union is the only power in the dispute that is also a landlord. Its grievance is not the platform: it is that the orbital franchises undercut European labour and personhood law, and European courts cannot reach them.",
             markets:"Instruments, aircraft, and the European market the Commonwealth's compute exports want in." },
    "STP": { note:"Its entire revenue is the anchor concession. The smallest actor in the dispute and the one with the most to lose from a renegotiation it did not ask for.",
             markets:"Cocoa and the concession. That is the whole balance of payments." },
    "COL": { note:"The Leticia corridor crosses a tri-border the state barely administers. It sells the concession and not the sovereignty, and it has said so in writing.",
             markets:"Coffee, cut flowers, and the corridor into the Amazon basin." },
    "SOM": { note:"A federal authority holding an equatorial coast that has been contested for a century. The anchor is one of the few things in the district that pays.",
             markets:"Livestock, frankincense, and the Kismayo roadstead." },
    "GAB": { note:"Cordell's charter state. It has run on extraction for two centuries, and it is the one country in the list with a national champion in the dispute rather than a grievance.",
             markets:"Manganese, oil, and the Port-Gentil anchor." },
    "KIR": { note:"The Bond is leased and not granted, which is why it is the one elevator the Commonwealth holds outright. A mid-Pacific state whose highest ground is its own tether base.",
             markets:"Fishing licences, and the ground the Bond's base stands on." },
    "UGA": { note:"The only inland anchor. Its corridor crosses its neighbours' airspace, which makes every renewal a regional negotiation.",
             markets:"Coffee, and the corridor the Equator crosses." },
    "ECU": { note:"The classic equatorial site, and a state with a long history of being paid badly for what it sells.",
             markets:"Bananas, oil, and the Chimborazo corridor." },
    "MDV": { note:"A low-lying island state whose tether base is also the highest ground it owns.",
             markets:"Tuna and tourism. Its tether is the only industry it has that does not sink." }
  }
};
