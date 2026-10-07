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
      /* ON THE INTERNATIONAL (decided 24 Sep). The Works was placed on Tether
         11 here while the crisis's own prose, the host actor and the author's
         plan all put it at the foot of Kenya's tether: "Kenya's repatriation
         plan", a two-year rescue made slow by Kenyan procurement law. Kenya
         and the treaty elevator won. `anchor` is the link the globe and the
         Concordance read; `site` is what a reader is told. */
      anchor:"tether_2",
      site:"Tether 2, the International Earth-Orbit Elevator", lat:-4.1, lng:41.2,
      population:184000, workforce:97000,
      closure:0.44, suspended:7100, attested:0.66,
      composition:{ biological:0.74, emulation:0.2, uplift:0.04, synthetic:0.02 },
      charter:"Its charter was issued by the operator, and gives the workforce an elected council of delegates to bargain with it.",
      note:"The Bellamy Almanac Works is an industrial platform of 184,000 people, 97,000 of them employed, on Tether 2, whose anchor stands at Malindi in Kenya. It is a refinery and foundry: it smelts the ore Cordell's extraction platforms bring in and rolls it into structural metal and hull plate. It was built by the Bellamy concern, which Cordell later bought, keeping the Bellamy name on the station. It is the largest single employer outside the Commonwealth's jurisdiction, and it is governed by a charter that is a contract between the company and its workforce.",
      grievance:"That its charter is a contract with a company registered on Earth, which no court in orbit can enforce.",
      /* THE CONCORDANCE OVER TIME (design/55). The note above is true on
         11 April; what happens to the Works is dated history. Flash I's
         flags: in another campaign none of these is ever drawn. */
      abandoned:{ flags:["station_issue"] },
      banners:[{ id:"contested", since:{ flags:["station_issue"] } }],
      cx:[
        { h:"Abandonment", since:{ flags:["station_issue"] }, body:"On {date} the Commonwealth learned that Cordell had wound up the Works' operator. The European Union had frozen the assets of Gabon's sovereign wealth fund, Cordell's majority owner, in March, and the operator could no longer pay for the platform's air, water or fuel. Its engineers said the air would last about two months. Kenya approved a plan to bring the residents down that would take two years." },
        { h:"Air supply", since:{ flags:["works_air_paid"] }, body:"On {date} the Commonwealth undertook to supply the air plant with filters and catalyst until the platform's future was settled." },
        { h:"Air plant failure", since:{ flags:["f1_air_failed"] }, body:"The air plant ran out of filters and catalyst on {date}. The council sealed the foundry decks and moved 70,000 residents into the housing ring, and eleven residents died in the first two days." },
        { h:"Accession", since:{ flags:["almanac_annexed"] }, body:"On {date} Parliament carried the Almanac Works (Annexation) Act, and the Works became part of the Commonwealth. See [[commonwealth|Circumterrestrial Commonwealth]]." }
      ],
      interests:["shed_order_priority", "essential_services_law", "consumables_subsidy"] }
  ],
  /* tether: the name the Commonwealth uses; formal: the instrument's name. */
  anchors: [
    { id:"tether_1",  tether:"The Beanstalk", formal:"",                               station:"anselm",       site:"Macapá, Brazil",          lat:  0.03, lng: -51.07, host:"Brazil", iso:"BRA",               mine:true },
    { id:"tether_2",  tether:"the International", formal:"International Earth-Orbit Elevator", station:"kepler", site:"Malindi, Kenya",          lat: -3.22, lng:  40.12, host:"Kenya", iso:"KEN",                mine:true },
    { id:"tether_3",  tether:"the Pontianak line", formal:"",                            station:null,           site:"Pontianak, Indonesia",    lat: -0.02, lng: 109.34, host:"Indonesia", iso:"IDN",            mine:false },
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
    "BRA": { ga:"brazil", note:"Brazil hosts Tether 1, the Beanstalk, at Macapá, the capital of Amapá state, which lies on the equator at the mouth of the Amazon. The anchor serves Anselm Ring. The concession was granted in 2065 for ninety-nine years, to 2164, at a fee fixed at grant with no indexation clause; lift tonnage through the anchor has roughly trebled since. Brazil operates its own launch range at Alcântara and a national orbital programme, and sells lift to the Commonwealth.",
             markets:"Soybeans, iron ore, beef, and launch services from Alcântara." },
    "KEN": { ga:"kenya", actor:"earth_host", note:"Kenya hosts Tether 2, the International Earth-Orbit Elevator, at Malindi on the Indian Ocean coast, near the Broglio Space Centre at Ngomeni. The elevator serves Anchorage and the Bellamy Almanac Works. Its formal name, the International Earth-Orbit Elevator, is the title of the treaty that established it. Kenya is a middle power with a large public administration and an established space programme.",
             dispute:"Kenyan procurement law governs the repatriation plan for the Almanac Works' workforce, under which the approved programme runs two years. The government has said that it will not meet the cost of a private company's wind-up, and that it will not accept a foreign government taking title to the platform.",
             markets:"Tea, cut flowers, geothermal power, and corridor rights at the Malindi base." },
    "IDN": { ga:"indonesia", note:"Indonesia hosts Tether 3, the Pontianak line, at Pontianak, the capital of West Kalimantan on the island of Borneo, less than a kilometre from the equator. The concession was granted in 2068 during a currency crisis. Indonesia has sought to reopen its terms at both of the fee reviews held since. The tether serves no Commonwealth station.",
             markets:"Nickel, palm oil, coal, and shipping through the equatorial straits." },
    "FRA": { ga:"eu_caucus", actor:"earth_bloc", name:"France", note:"Tether 4, the Kourou vertical, stands at Kourou in French Guiana, an overseas region of France and an outermost region of the European Union, where the Guiana Space Centre has operated since 1968. The anchor serves the Bourse. Its concession is held under European law, and the Union treats the tether as European infrastructure.",
             dispute:"The Union is a party to the dispute both as a sanctioning power and as the holder of an anchor. Its stated objections concern labour and personhood law: the orbital franchises operate below European standards, and European courts have no jurisdiction over them.",
             markets:"Aircraft, instruments, pharmaceuticals, and access to the European market for Commonwealth compute." },
    "STP": { ga:"sao_tome", name:"São Tomé and Príncipe", note:"São Tomé and Príncipe is an island state in the Gulf of Guinea, lying 0.3° north of the equator. It hosts Tether 5, the Meridian Vertical, known in the Commonwealth as the Clothesline, which serves Meridian Spindle. The concession fee is the state's principal source of public revenue.",
             dispute:"São Tomé has no fiscal capacity to absorb a change in the concession's terms and has taken no public position in the dispute.",
             markets:"Cocoa, coffee, and the Meridian concession." },
    "COL": { ga:"colombia", note:"Colombia hosts Tether 6, the Leticia line, at Leticia, the capital of Amazonas department, on the tri-border with Brazil and Peru. The anchor serves Halvard Works. The district is policed jointly with Peru and Brazil. The concession instrument states, and each renewal has restated, that the lease conveys operating rights over the corridor and no territorial claim.",
             markets:"Coffee, cut flowers, oil, and the Leticia corridor." },
    "SOM": { ga:"somalia", note:"Tether 7, the Kismayo line, stands at Kismayo, a port in the Jubaland region of southern Somalia, and serves Layover. The coast has been contested since the 2040s. The anchor is administered by a federal authority whose writ is recognised in Mogadishu and disputed on the ground, and it is one of three revenue-bearing assets in the district.",
             markets:"Livestock, frankincense, and the Kismayo roadstead." },
    "GAB": { ga:"gabon", note:"Gabon hosts Tether 8, the Port-Gentil line, which serves Rookworks\u2014Anselm. Port-Gentil, on Mandji Island at Cape Lopez, has been the centre of the country's oil industry since the 1950s, and Gabon is among the largest producers of manganese in the world. The concession is held by Cordell, an extraction company chartered by an act of the Gabonese Assembly in 2044. Cordell is majority-owned by the Gabonese sovereign fund and directs its orbital operations from Port-Gentil.",
             dispute:"Gabon is represented in the dispute through Cordell, whose subsidiary operated the Almanac Works until its wind-up. In March 2080 the European Union froze the assets of Gabon's sovereign wealth fund, Cordell's majority owner, after a United Nations panel found that the fund had paid for weapons used by separatists in Cabinda, the Angolan exclave. The freeze caught Cordell, and Cordell abandoned the Works. As the company's principal owner, the government has made no statement separate from the company's.",
             markets:"Oil, manganese, timber, and the Port-Gentil anchor." },
    "KIR": { ga:"kiribati", name:"Kiribati", note:"Kiribati is a Pacific state of thirty-three islands, most of them low coral atolls, spread across more than three million square kilometres of ocean. Tether 9, the Bond, stands on Kiritimati (Christmas Island) in the Line Islands, the largest coral atoll in the world by land area, and serves Bondsville. The site is leased to the Commonwealth, which operates the elevator itself. The tether base is the tallest structure in the country.",
             markets:"Fishing licences, copra, and the lease on the Kiritimati site." },
    "UGA": { ga:"uganda", note:"Uganda hosts Tether 10, the Entebbe line, on the northern shore of Lake Victoria; it is the one anchor in the dozen that stands inland. Its corridor crosses Kenyan and Tanzanian airspace before it clears the atmosphere, so the concession is renewed three ways, and the two transit agreements expire on their own schedules. The tether serves no Commonwealth station.",
             markets:"Coffee, gold, fish from Lake Victoria, and the Entebbe corridor." },
    "ECU": { ga:"ecuador", note:"Ecuador hosts Tether 11, the Chimborazo line, on the Chimborazo massif, 1.5° south of the equator. Chimborazo's summit is the point on the Earth's surface farthest from its centre. Cordell holds the concession, one of its two, and uses the line for its extraction platforms. The concession has been renegotiated twice, and both revisions reduced the fee Cordell pays.",
             markets:"Bananas, oil, shrimp, and the Chimborazo corridor." },
    "MDV": { ga:"maldives", name:"the Maldives", note:"The Maldives is an archipelago of coral atolls in the Indian Ocean, with an average ground level of about one and a half metres. Tether 12, the Malé line, stands on reclaimed land near the capital, Malé, and its base is the highest point in the country. The tether serves no Commonwealth station.",
             markets:"Tourism, tuna, and the Malé corridor." },

    /* GENERAL DESCRIPTIONS for every country the globe can select (the author,
       26 Sep 2026; design/45). Atlas register, modelled on the anchor-host
       notes above: where it is, its capital, what it is known for. No
       population and no present-day politics that 2080 might have undone;
       a disputed territory is described as disputed. `ga` is the member of
       the General Assembly (content/forums.js) the state votes through: the
       Union's caucus, a regional group, or its own seat for an anchor host. */
    "DZA": { ga:"african_group", note:"Algeria is the largest country in Africa by area, on the Mediterranean coast of the Maghreb, and most of it lies in the Sahara. Its capital is Algiers. Its economy has rested on oil and natural gas since independence from France in 1962." },
    "AGO": { ga:"african_group", note:"Angola is a country on the Atlantic coast of south-central Africa. Its capital is Luanda. It became independent from Portugal in 1975, and its economy depends on offshore oil and on diamonds." },
    "BEN": { ga:"african_group", note:"Benin is a country in West Africa with a short coastline on the Bight of Benin. Its capital is Porto-Novo and its largest city Cotonou, whose port serves much of the landlocked interior." },
    "BWA": { ga:"african_group", note:"Botswana is a landlocked country in southern Africa, much of it covered by the Kalahari Desert. Its capital is Gaborone. Diamond mining financed its development after independence from Britain in 1966." },
    "BFA": { ga:"african_group", note:"Burkina Faso is a landlocked country in the Sahel of West Africa. Its capital is Ouagadougou. Most of its people farm, and gold is its principal export." },
    "BDI": { ga:"african_group", note:"Burundi is a small landlocked country in the African Great Lakes region, on the north-eastern shore of Lake Tanganyika. Its capital is Gitega. Coffee and tea are its main exports." },
    "CMR": { ga:"african_group", note:"Cameroon is a country on the Gulf of Guinea where West and Central Africa meet. Its capital is Yaoundé and its main port Douala. French and English are both official languages." },
    "CAF": { name:"the Central African Republic", ga:"african_group", note:"The Central African Republic is a landlocked country at the centre of the continent. Its capital is Bangui, on the Ubangi River. It has deposits of diamonds, gold and uranium." },
    "TCD": { ga:"african_group", note:"Chad is a landlocked country in north-central Africa that reaches from the Sahara to the Sahel. Its capital is N'Djamena. Lake Chad, on its western border, has shrunk greatly since the 1960s." },
    "COD": { name:"the Democratic Republic of the Congo", ga:"african_group", note:"The Democratic Republic of the Congo is the second-largest country in Africa and covers most of the Congo Basin. Its capital is Kinshasa. It mines much of the world's cobalt and a great deal of its copper, both used in batteries." },
    "COG": { name:"the Republic of the Congo", ga:"african_group", note:"The Republic of the Congo lies on the west bank of the Congo River, across from Kinshasa. Its capital is Brazzaville and its main port Pointe-Noire. Offshore oil is its chief export." },
    "CIV": { ga:"african_group", note:"Côte d'Ivoire is a country on the Gulf of Guinea in West Africa. Its capital is Yamoussoukro and its commercial centre Abidjan. It is the world's largest producer of cocoa." },
    "DJI": { ga:"african_group", note:"Djibouti is a small country on the Horn of Africa at the mouth of the Red Sea, on the strait of Bab-el-Mandeb. Its capital is Djibouti City, whose port handles much of Ethiopia's trade." },
    "EGY": { ga:"african_group", note:"Egypt is a country in north-east Africa whose people live almost entirely along the Nile and its delta. Its capital is Cairo. The Suez Canal, joining the Mediterranean to the Red Sea, crosses its territory." },
    "GNQ": { name:"Equatorial Guinea", ga:"african_group", note:"Equatorial Guinea is a country in Central Africa made up of a mainland territory and the island of Bioko, on which the capital, Malabo, stands. Its economy rests on offshore oil and gas." },
    "ERI": { ga:"african_group", note:"Eritrea is a country on the Red Sea coast of the Horn of Africa. Its capital is Asmara. It became independent from Ethiopia in 1993 after a thirty-year war." },
    "SWZ": { name:"Eswatini", ga:"african_group", note:"Eswatini is a small landlocked kingdom in southern Africa, between South Africa and Mozambique. Its capitals are Mbabane and Lobamba, and sugar is its main export." },
    "ETH": { ga:"african_group", note:"Ethiopia is a landlocked country in the Horn of Africa, most of it highland plateau. Its capital, Addis Ababa, is the seat of the African Union. Apart from the Italian occupation of 1936 to 1941, it was never colonised." },
    "GMB": { name:"the Gambia", ga:"african_group", note:"The Gambia is a narrow country in West Africa along the lower Gambia River, surrounded by Senegal except on its Atlantic coast. Its capital is Banjul." },
    "GHA": { ga:"african_group", note:"Ghana is a country on the Gulf of Guinea in West Africa. Its capital is Accra. In 1957 it became the first colony south of the Sahara to gain independence, and it exports gold, cocoa and oil." },
    "GIN": { ga:"african_group", note:"Guinea is a country on the Atlantic coast of West Africa. Its capital is Conakry. It holds some of the world's largest reserves of bauxite, the ore of aluminium." },
    "GNB": { ga:"african_group", note:"Guinea-Bissau is a small country on the Atlantic coast of West Africa that includes the islands of the Bijagós archipelago. Its capital is Bissau, and cashew nuts are its main export." },
    "LSO": { ga:"african_group", note:"Lesotho is a mountainous kingdom entirely surrounded by South Africa. Its capital is Maseru. All of its territory lies more than 1,000 metres above sea level, and it sells water to South Africa." },
    "LBR": { ga:"african_group", note:"Liberia is a country on the Atlantic coast of West Africa, founded in the nineteenth century by freed slaves from the United States. Its capital is Monrovia. It keeps one of the world's largest registries of merchant ships." },
    "LBY": { ga:"african_group", note:"Libya is a country on the Mediterranean coast of North Africa, most of it desert. Its capital is Tripoli. It holds the largest proven oil reserves in Africa." },
    "MDG": { ga:"african_group", note:"Madagascar is an island country in the Indian Ocean off the south-east coast of Africa, and the fourth-largest island in the world. Its capital is Antananarivo. Most of its plants and animals are found nowhere else." },
    "MWI": { ga:"african_group", note:"Malawi is a landlocked country in south-east Africa that runs along Lake Malawi. Its capital is Lilongwe. Tobacco and tea are its chief exports." },
    "MLI": { ga:"african_group", note:"Mali is a landlocked country in West Africa, reaching from the Sahara to the Niger River. Its capital is Bamako. Timbuktu, on the Niger, was a centre of learning and trade in the fourteenth and fifteenth centuries." },
    "MRT": { ga:"african_group", note:"Mauritania is a country on the Atlantic coast of north-west Africa, most of it in the Sahara. Its capital is Nouakchott. Iron ore and fish are its main exports." },
    "MAR": { ga:"african_group", note:"Morocco is a kingdom in north-west Africa with coasts on the Atlantic and the Mediterranean, facing Spain across the Strait of Gibraltar. Its capital is Rabat. It holds most of the world's reserves of phosphate rock." },
    "MOZ": { ga:"african_group", note:"Mozambique is a country on the Indian Ocean coast of south-east Africa. Its capital is Maputo. It became independent from Portugal in 1975, and large reserves of natural gas lie off its northern coast." },
    "NAM": { ga:"african_group", note:"Namibia is a country on the Atlantic coast of south-western Africa that takes in the Namib and part of the Kalahari. Its capital is Windhoek. It mines diamonds and uranium." },
    "NER": { ga:"african_group", note:"Niger is a landlocked country in West Africa, four-fifths of it in the Sahara. Its capital is Niamey, on the Niger River. It is a major producer of uranium." },
    "NGA": { ga:"african_group", note:"Nigeria is a country on the Gulf of Guinea and the most populous in Africa. Its capital is Abuja and its largest city Lagos. Oil has been its principal export since the 1970s." },
    "RWA": { ga:"african_group", note:"Rwanda is a small landlocked country in the African Great Lakes region, much of it hill country. Its capital is Kigali. Coffee, tea and tourism are its main sources of foreign earnings." },
    "SEN": { ga:"african_group", note:"Senegal is a country on the westernmost coast of Africa. Its capital, Dakar, stands on the Cap-Vert peninsula. It exports fish, phosphates and groundnuts." },
    "SLE": { ga:"african_group", note:"Sierra Leone is a country on the Atlantic coast of West Africa. Its capital is Freetown, founded as a settlement for freed slaves. It mines diamonds, iron ore and rutile." },
    "ZAF": { ga:"african_group", note:"South Africa is the southernmost country in Africa, with coasts on the Atlantic and Indian oceans. Its capitals are Pretoria, Cape Town and Bloemfontein. It is the most industrialised economy on the continent and a leading producer of platinum and gold." },
    "SSD": { name:"South Sudan", ga:"african_group", note:"South Sudan is a landlocked country in east-central Africa that became independent from Sudan in 2011. Its capital is Juba. The White Nile and the Sudd, one of the largest wetlands in the world, lie within it." },
    "SDN": { ga:"african_group", note:"Sudan is a country in north-east Africa on the Red Sea. The Blue and White Niles meet at its capital, Khartoum. It produces gold, gum arabic and livestock." },
    "TZA": { ga:"african_group", note:"Tanzania is a country in East Africa on the Indian Ocean that includes the island of Zanzibar. Its capital is Dodoma and its largest city Dar es Salaam, and Kilimanjaro, the highest mountain in Africa, stands in its north. The corridor of Tether 10, at Entebbe in Uganda, crosses its airspace, so Tanzania is a party to that concession's renewal." },
    "TGO": { ga:"african_group", note:"Togo is a narrow country in West Africa with a short coast on the Gulf of Guinea. Its capital is Lomé, whose deep-water port serves the landlocked Sahel." },
    "TUN": { ga:"african_group", note:"Tunisia is the northernmost country in Africa, on the Mediterranean. Its capital is Tunis, near the site of ancient Carthage. It exports olive oil, textiles and phosphates." },
    "ZMB": { ga:"african_group", note:"Zambia is a landlocked country in south-central Africa. Its capital is Lusaka. Copper from the Copperbelt dominates its economy, and the Victoria Falls lie on its border with Zimbabwe." },
    "ZWE": { ga:"african_group", note:"Zimbabwe is a landlocked country in southern Africa between the Zambezi and the Limpopo. Its capital is Harare. The stone ruins of Great Zimbabwe, which gave the country its name, date from the eleventh to the fifteenth centuries." },
    "ESH": { name:"Western Sahara", note:"Western Sahara is a territory on the Atlantic coast of north-west Africa whose sovereignty is disputed between Morocco and the Sahrawi Arab Democratic Republic. It is thinly populated and rich in phosphate." },
    "AFG": { ga:"asia_pacific_group", note:"Afghanistan is a landlocked, mountainous country in Central and South Asia, crossed by the Hindu Kush. Its capital is Kabul. It has large undeveloped deposits of copper and lithium." },
    "BGD": { ga:"asia_pacific_group", note:"Bangladesh is a country in South Asia on the delta of the Ganges and the Brahmaputra, most of it less than ten metres above the sea. Its capital is Dhaka. It is among the most densely populated countries in the world." },
    "BTN": { ga:"asia_pacific_group", note:"Bhutan is a small landlocked kingdom in the eastern Himalaya, between China and India. Its capital is Thimphu. It sells hydroelectric power to India." },
    "BRN": { ga:"asia_pacific_group", note:"Brunei is a small sultanate on the north coast of Borneo, divided in two by Malaysian territory. Its capital is Bandar Seri Begawan. Its wealth comes from oil and gas." },
    "KHM": { ga:"asia_pacific_group", note:"Cambodia is a country in mainland South-East Asia on the Gulf of Thailand. Its capital is Phnom Penh. The temples of Angkor, built between the ninth and fifteenth centuries, stand in its north-west." },
    "CHN": { ga:"asia_pacific_group", note:"China is a country in East Asia and one of the five permanent members of the Security Council, with Russia, the United States, the European Union and the African Union. Its capital is Beijing. It has been the largest manufacturing economy on Earth since the 2010s, and launches from four spaceports." },
    "FJI": { ga:"asia_pacific_group", note:"Fiji is an island country in the South Pacific of more than three hundred islands. Its capital is Suva, on Viti Levu. Sugar and tourism are its main industries." },
    "IND": { ga:"asia_pacific_group", note:"India is a country in South Asia and the most populous in the world. Its capital is New Delhi. It launches spacecraft from Sriharikota, on the Bay of Bengal." },
    "IRN": { ga:"asia_pacific_group", note:"Iran is a country in western Asia between the Caspian Sea and the Persian Gulf. Its capital is Tehran. It holds some of the world's largest reserves of oil and natural gas." },
    "IRQ": { ga:"asia_pacific_group", note:"Iraq is a country in western Asia on the Tigris and the Euphrates, the site of ancient Mesopotamia. Its capital is Baghdad. Oil provides almost all of its export earnings." },
    "JPN": { ga:"asia_pacific_group", note:"Japan is an island country in East Asia, off the Pacific coast of the continent. Its capital is Tokyo. It is a leading maker of industrial robots, and launches spacecraft from Tanegashima." },
    "JOR": { ga:"asia_pacific_group", note:"Jordan is a country in western Asia east of the Jordan River, with a short coast on the Gulf of Aqaba. Its capital is Amman. The ancient city of Petra is in its south." },
    "KAZ": { ga:"asia_pacific_group", note:"Kazakhstan is the largest landlocked country in the world, in Central Asia. Its capital is Astana. The Baikonur Cosmodrome, the first spaceport ever built, stands on its territory." },
    "KWT": { ga:"asia_pacific_group", note:"Kuwait is a small country at the head of the Persian Gulf. Its capital is Kuwait City. Oil accounts for most of its exports." },
    "KGZ": { ga:"asia_pacific_group", note:"Kyrgyzstan is a mountainous landlocked country in Central Asia, most of it in the Tian Shan. Its capital is Bishkek. Gold is its main export." },
    "LAO": { ga:"asia_pacific_group", note:"Laos is the one landlocked country in South-East Asia, along the Mekong. Its capital is Vientiane. It sells hydroelectric power to its neighbours." },
    "LBN": { ga:"asia_pacific_group", note:"Lebanon is a small country on the eastern Mediterranean coast. Its capital is Beirut. Its mountains supplied the cedar timber of the ancient world." },
    "MYS": { ga:"asia_pacific_group", note:"Malaysia is a country in South-East Asia in two parts, on the Malay Peninsula and in the north of Borneo. Its capital is Kuala Lumpur. It is a major producer of palm oil and electronics." },
    "MNG": { ga:"asia_pacific_group", note:"Mongolia is a landlocked country between Russia and China, and the most thinly populated sovereign state in the world. Its capital is Ulaanbaatar. It mines copper and coal." },
    "MMR": { ga:"asia_pacific_group", note:"Myanmar is a country in South-East Asia on the Bay of Bengal and the Andaman Sea. Its capital is Naypyidaw and its largest city Yangon. It produces jade, rubies and rare-earth ores." },
    "NPL": { ga:"asia_pacific_group", note:"Nepal is a landlocked country in the Himalaya between China and India. It contains eight of the world's ten highest mountains, Everest among them, and its capital is Kathmandu." },
    "PRK": { name:"North Korea", ga:"asia_pacific_group", note:"North Korea is a country in East Asia on the northern half of the Korean Peninsula. It was founded in 1948, three years after the peninsula was divided, and its capital is Pyongyang." },
    "OMN": { ga:"asia_pacific_group", note:"Oman is a country on the south-eastern coast of the Arabian Peninsula. Its capital is Muscat. It holds the southern shore of the Strait of Hormuz, the passage out of the Persian Gulf." },
    "PAK": { ga:"asia_pacific_group", note:"Pakistan is a country in South Asia that stretches from the Arabian Sea to the Karakoram. Its capital is Islamabad and its largest city Karachi. K2, the second-highest mountain on Earth, is on its northern border." },
    "PNG": { ga:"asia_pacific_group", note:"Papua New Guinea is a country in Oceania on the eastern half of New Guinea and the islands around it. Its capital is Port Moresby. More than eight hundred languages are spoken there, more than in any other country." },
    "PHL": { name:"the Philippines", ga:"asia_pacific_group", note:"The Philippines is an island country in South-East Asia of more than seven thousand islands. Its capital is Manila. Filipinos crew a large share of the world's merchant ships." },
    "QAT": { ga:"asia_pacific_group", note:"Qatar is a small country on a peninsula in the Persian Gulf. Its capital is Doha. It shares with Iran the largest natural gas field in the world." },
    "KOR": { name:"South Korea", ga:"asia_pacific_group", note:"South Korea is a country in East Asia on the southern half of the Korean Peninsula. Its capital is Seoul. It is a leading maker of semiconductors, ships and cars." },
    "SAU": { ga:"asia_pacific_group", note:"Saudi Arabia is the largest country on the Arabian Peninsula. Its capital is Riyadh. It holds some of the world's largest oil reserves, and Mecca and Medina, the holiest cities of Islam." },
    "SLB": { name:"Solomon Islands", ga:"asia_pacific_group", note:"Solomon Islands is a country of nearly a thousand islands in the South Pacific, east of New Guinea. Its capital is Honiara, on Guadalcanal. Timber and fish are its main exports." },
    "LKA": { ga:"asia_pacific_group", note:"Sri Lanka is an island country in the Indian Ocean, south of India. Its capital is Sri Jayawardenepura Kotte and its largest city Colombo. It is known for its tea." },
    "SYR": { ga:"asia_pacific_group", note:"Syria is a country in western Asia on the eastern Mediterranean. Its capital, Damascus, is among the oldest continuously inhabited cities in the world." },
    "TJK": { ga:"asia_pacific_group", note:"Tajikistan is a mountainous landlocked country in Central Asia, most of it in the Pamirs. Its capital is Dushanbe. Aluminium and hydroelectric power are its main products." },
    "THA": { ga:"asia_pacific_group", note:"Thailand is a kingdom in mainland South-East Asia. Its capital is Bangkok. It is a major exporter of rice, cars and electronics." },
    "TLS": { ga:"asia_pacific_group", note:"Timor-Leste is a country in South-East Asia on the eastern half of the island of Timor. Its capital is Dili. It became independent from Indonesia in 2002, and its revenue comes mainly from offshore oil and gas." },
    "TKM": { ga:"asia_pacific_group", note:"Turkmenistan is a country in Central Asia on the eastern shore of the Caspian Sea, most of it in the Karakum Desert. Its capital is Ashgabat. It holds some of the world's largest reserves of natural gas." },
    "ARE": { name:"the United Arab Emirates", ga:"asia_pacific_group", note:"The United Arab Emirates is a federation of seven emirates on the Persian Gulf. Its capital is Abu Dhabi and its largest city Dubai. Its wealth rests on oil and on the trade that passes through Dubai." },
    "UZB": { ga:"asia_pacific_group", note:"Uzbekistan is a doubly landlocked country in Central Asia: every one of its neighbours is landlocked too. Its capital is Tashkent, and Samarkand and Bukhara, on the Silk Road, lie within it." },
    "VUT": { ga:"asia_pacific_group", note:"Vanuatu is an island country in the South Pacific of about eighty islands, many of them volcanic. Its capital is Port Vila." },
    "VNM": { ga:"asia_pacific_group", note:"Vietnam is a country in South-East Asia along the eastern coast of the Indochinese Peninsula. Its capital is Hanoi and its largest city Ho Chi Minh City. It exports electronics, rice and coffee." },
    "YEM": { ga:"asia_pacific_group", note:"Yemen is a country at the southern end of the Arabian Peninsula, on the Bab-el-Mandeb strait into the Red Sea. Its capital is Sana'a." },
    "PSE": { note:"Palestine is a territory in western Asia made up of the West Bank, with East Jerusalem, and the Gaza Strip. Its statehood is disputed." },
    "TWN": { note:"Taiwan is an island off the south-east coast of mainland China, across the Taiwan Strait. Its largest city is Taipei. Its sovereignty is disputed, and it is a leading maker of semiconductors." },
    "ARG": { ga:"latin_american_group", note:"Argentina is a country in the south of South America, reaching from the Andes to the Atlantic. Its capital is Buenos Aires. It exports grain and beef, and has large reserves of lithium." },
    "BHS": { name:"the Bahamas", ga:"latin_american_group", note:"The Bahamas is an island country in the Atlantic, north of Cuba and south-east of Florida, of about seven hundred islands. Its capital is Nassau. Tourism and finance are its main industries." },
    "BLZ": { ga:"latin_american_group", note:"Belize is a small country on the Caribbean coast of Central America. Its capital is Belmopan. Its barrier reef is the second longest in the world." },
    "BOL": { ga:"latin_american_group", note:"Bolivia is a landlocked country in central South America. Its seat of government is La Paz, at about 3,600 metres, and its constitutional capital Sucre. The Salar de Uyuni holds one of the world's largest lithium deposits." },
    "CHL": { ga:"latin_american_group", note:"Chile is a long, narrow country on the Pacific coast of South America, stretching about 4,300 kilometres from the Atacama Desert to Cape Horn. Its capital is Santiago. It is the world's largest producer of copper." },
    "CRI": { ga:"latin_american_group", note:"Costa Rica is a country in Central America between the Caribbean and the Pacific. Its capital is San José. It abolished its army in 1948." },
    "CUB": { ga:"latin_american_group", note:"Cuba is the largest island in the Caribbean, about 150 kilometres south of Florida. Its capital is Havana. The revolution of 1959 made it a one-party state." },
    "DOM": { name:"the Dominican Republic", ga:"latin_american_group", note:"The Dominican Republic occupies the eastern two-thirds of the island of Hispaniola, which it shares with Haiti. Its capital, Santo Domingo, is the oldest European city in the Americas." },
    "SLV": { ga:"latin_american_group", note:"El Salvador is the smallest country in Central America, and the one without a Caribbean coast. Its capital is San Salvador." },
    "GTM": { ga:"latin_american_group", note:"Guatemala is a country in Central America, south of Mexico. Its capital is Guatemala City. Much of its population is of Maya descent, and it exports coffee, sugar and bananas." },
    "GUY": { ga:"latin_american_group", note:"Guyana is a country on the north Atlantic coast of South America, the one on the continent with English as its official language. Its capital is Georgetown. Large oil fields were found off its coast in 2015." },
    "HTI": { ga:"latin_american_group", note:"Haiti occupies the western third of Hispaniola, which it shares with the Dominican Republic. Its capital is Port-au-Prince. In 1804 it became the first independent state founded by former slaves." },
    "HND": { ga:"latin_american_group", note:"Honduras is a country in Central America with a long Caribbean coast and a short Pacific one. Its capital is Tegucigalpa. It exports coffee, bananas and textiles." },
    "JAM": { ga:"latin_american_group", note:"Jamaica is an island country in the Caribbean, south of Cuba. Its capital is Kingston. It mines bauxite, and its music is heard around the world." },
    "MEX": { ga:"latin_american_group", note:"Mexico is a country in North America between the United States and Central America. Its capital, Mexico City, is one of the largest cities in the world. It is a major maker of cars and electronics." },
    "NIC": { ga:"latin_american_group", note:"Nicaragua is the largest country in Central America, between the Caribbean and the Pacific. Its capital is Managua, on Lake Managua." },
    "PAN": { ga:"latin_american_group", note:"Panama is the narrow country that joins Central America to South America. Its capital is Panama City, and the Panama Canal crosses it between the Atlantic and the Pacific." },
    "PRY": { ga:"latin_american_group", note:"Paraguay is a landlocked country in central South America. Its capital is Asunción. The Itaipú dam, which it shares with Brazil, supplies most of its electricity." },
    "PER": { ga:"latin_american_group", note:"Peru is a country on the Pacific coast of South America, reaching from the Andes into the Amazon. Its capital is Lima, and it is a leading producer of copper, silver and gold. It polices the Leticia district, where Tether 6 stands, jointly with Colombia and Brazil." },
    "SUR": { ga:"latin_american_group", note:"Suriname is a small country on the north Atlantic coast of South America, most of it rainforest. Its capital is Paramaribo, and Dutch is its official language." },
    "TTO": { ga:"latin_american_group", note:"Trinidad and Tobago is a country of two islands in the southern Caribbean, off the coast of Venezuela. Its capital is Port of Spain. Its economy rests on oil, natural gas and petrochemicals." },
    "URY": { ga:"latin_american_group", note:"Uruguay is a small country on the Atlantic coast of South America, between Argentina and Brazil. Its capital is Montevideo. Cattle and farming are the base of its economy." },
    "VEN": { ga:"latin_american_group", note:"Venezuela is a country on the Caribbean coast of South America. Its capital is Caracas. It holds the largest proven oil reserves in the world, and Angel Falls, the highest waterfall." },
    "PRI": { note:"Puerto Rico is an island in the north-east Caribbean that has been associated with the United States since 1898. Its capital is San Juan." },
    "FLK": { name:"the Falkland Islands", note:"The Falkland Islands are an archipelago in the South Atlantic, east of Argentina. They are a British overseas territory claimed by Argentina, and their capital is Stanley." },
    "ALB": { ga:"eastern_european_group", note:"Albania is a country in the western Balkans on the Adriatic and Ionian seas. Its capital is Tirana." },
    "ARM": { ga:"eastern_european_group", note:"Armenia is a landlocked country in the South Caucasus. Its capital is Yerevan. In the early fourth century it became the first state to adopt Christianity as its official religion." },
    "AZE": { ga:"eastern_european_group", note:"Azerbaijan is a country in the South Caucasus on the western shore of the Caspian Sea. Its capital is Baku, where oil has been drawn since the nineteenth century." },
    "BLR": { ga:"eastern_european_group", note:"Belarus is a landlocked country in Eastern Europe between Russia and Poland. Its capital is Minsk. It makes tractors, trucks and potash fertiliser." },
    "BIH": { name:"Bosnia and Herzegovina", ga:"eastern_european_group", note:"Bosnia and Herzegovina is a country in the western Balkans with a short Adriatic coast. Its capital is Sarajevo. Its constitution divides power between its Bosniak, Serb and Croat peoples." },
    "GEO": { ga:"eastern_european_group", note:"Georgia is a country in the South Caucasus on the eastern shore of the Black Sea. Its capital is Tbilisi. Wine has been made there for eight thousand years." },
    "MDA": { ga:"eastern_european_group", note:"Moldova is a small landlocked country in Eastern Europe between Romania and Ukraine. Its capital is Chișinău. Its economy is largely agricultural, and wine is its best-known export." },
    "MNE": { ga:"eastern_european_group", note:"Montenegro is a small country in the western Balkans on the Adriatic. Its capital is Podgorica, and its coast and the Bay of Kotor draw most of its visitors." },
    "MKD": { name:"North Macedonia", ga:"eastern_european_group", note:"North Macedonia is a landlocked country in the central Balkans. Its capital is Skopje. Lake Ohrid, on its border with Albania, is among the oldest lakes in Europe." },
    "RUS": { ga:"eastern_european_group", note:"Russia is the largest country on Earth, spanning Eastern Europe and northern Asia, and one of the five permanent members of the Security Council. Its capital is Moscow. The Soviet Union, whose seat it inherited, launched the first satellite in 1957 and the first person into orbit in 1961." },
    "SRB": { ga:"eastern_european_group", note:"Serbia is a landlocked country in the central Balkans. Its capital is Belgrade, where the Sava meets the Danube." },
    "UKR": { ga:"eastern_european_group", note:"Ukraine is a country in Eastern Europe on the northern coast of the Black Sea, the largest country lying wholly within Europe. Its capital is Kyiv. Its black-earth soils make it one of the world's great grain exporters." },
    "XKX": { name:"Kosovo", note:"Kosovo is a landlocked territory in the central Balkans that declared independence from Serbia in 2008. Its capital is Pristina. Its recognition as a state is disputed." },
    "AUS": { ga:"western_group", note:"Australia is a country and a continent in the Southern Hemisphere, between the Indian and Pacific oceans. Its capital is Canberra. It is among the world's largest exporters of iron ore, coal and lithium." },
    "CAN": { ga:"western_group", note:"Canada is the second-largest country on Earth, in the north of North America. Its capital is Ottawa. It built the robotic arms of the International Space Station, and exports energy, minerals and grain." },
    "ISL": { ga:"western_group", note:"Iceland is a volcanic island country in the North Atlantic. Its capital is Reykjavík. Almost all of its electricity comes from hydroelectric and geothermal power." },
    "ISR": { ga:"western_group", note:"Israel is a country on the eastern Mediterranean coast. It designates Jerusalem as its capital, and its economy is centred on Tel Aviv. It has launched satellites from its own territory since 1988." },
    "NZL": { ga:"western_group", note:"New Zealand is an island country in the south-western Pacific of two main islands. Its capital is Wellington. It exports dairy, meat and wool, and launches rockets from the Māhia Peninsula." },
    "NOR": { name:"Norway", ga:"western_group", note:"Norway is a country on the western side of the Scandinavian Peninsula, with a long coast of fjords. Its capital is Oslo. Its oil and gas revenues are held in one of the largest sovereign funds in the world." },
    "CHE": { ga:"western_group", note:"Switzerland is a landlocked country in the Alps of central Europe. Its capital is Bern. It has four national languages and a long tradition of neutrality, and many international bodies are based in Geneva." },
    "TUR": { ga:"western_group", note:"Turkey is a country that spans south-eastern Europe and Anatolia in western Asia. Its capital is Ankara and its largest city Istanbul, on the Bosporus. It holds the straits between the Black Sea and the Mediterranean." },
    "GBR": { name:"the United Kingdom", ga:"western_group", note:"The United Kingdom is an island country off the north-west coast of Europe. Its capital is London. It has not held a permanent seat on the Security Council since the reform of the early 2050s." },
    "USA": { name:"the United States", ga:"western_group", note:"The United States is a federal republic in North America and one of the five permanent members of the Security Council. Its capital is Washington. It landed the first people on the Moon, in 1969." },
    "AUT": { ga:"eu_caucus", note:"Austria is a landlocked country in the Alps of central Europe and a member of the European Union. Its capital, Vienna, is the seat of several United Nations agencies." },
    "BEL": { ga:"eu_caucus", note:"Belgium is a small country in Western Europe on the North Sea. Its capital, Brussels, is the seat of most of the European Union's institutions, and it is there that the Union's decisions on the Commonwealth are taken." },
    "BGR": { ga:"eu_caucus", note:"Bulgaria is a country in south-eastern Europe on the Black Sea and a member of the European Union. Its capital is Sofia." },
    "HRV": { ga:"eu_caucus", note:"Croatia is a country in south-eastern Europe with a long Adriatic coast and a member of the European Union. Its capital is Zagreb." },
    "CYP": { ga:"eu_caucus", note:"Cyprus is an island in the eastern Mediterranean, the third largest in that sea, and a member of the European Union. Its capital is Nicosia. The north of the island has been administered separately since 1974." },
    "CZE": { ga:"eu_caucus", note:"Czechia is a landlocked country in central Europe with a long industrial tradition, and a member of the European Union. Its capital is Prague." },
    "DNK": { ga:"eu_caucus", note:"Denmark is a country in northern Europe on the Jutland peninsula and the islands east of it, and a member of the European Union. Its capital is Copenhagen. Greenland and the Faroe Islands are self-governing parts of the Danish realm." },
    "EST": { ga:"eu_caucus", note:"Estonia is a small country on the Baltic Sea and a member of the European Union. Its capital is Tallinn. It was among the first states to put its government services online." },
    "FIN": { ga:"eu_caucus", note:"Finland is a country in northern Europe between Sweden and Russia, much of it forest and lakes, and a member of the European Union. Its capital is Helsinki." },
    "DEU": { ga:"eu_caucus", note:"Germany is a federal republic in central Europe and the most populous member of the European Union. Its capital is Berlin. It is the Union's largest economy and a leading maker of machinery and vehicles." },
    "GRC": { ga:"eu_caucus", note:"Greece is a country in south-eastern Europe at the end of the Balkan Peninsula, with some six thousand islands, and a member of the European Union. Its capital is Athens. Its merchant fleet is among the largest in the world." },
    "HUN": { ga:"eu_caucus", note:"Hungary is a landlocked country in central Europe on the Danube and a member of the European Union. Its capital is Budapest." },
    "IRL": { ga:"eu_caucus", note:"Ireland is an island country in the North Atlantic, west of Great Britain, and a member of the European Union. Its capital is Dublin." },
    "ITA": { ga:"eu_caucus", note:"Italy is a country in southern Europe on a peninsula reaching into the Mediterranean, and a founding member of the European Union. Its capital is Rome." },
    "LVA": { ga:"eu_caucus", note:"Latvia is a country on the Baltic Sea between Estonia and Lithuania, and a member of the European Union. Its capital is Riga." },
    "LTU": { ga:"eu_caucus", note:"Lithuania is the southernmost of the three Baltic states and a member of the European Union. Its capital is Vilnius." },
    "LUX": { ga:"eu_caucus", note:"Luxembourg is a small landlocked grand duchy in Western Europe and a founding member of the European Union. Its capital, Luxembourg City, hosts several of the Union's institutions, and the country has long been a centre of the satellite industry." },
    "NLD": { name:"the Netherlands", ga:"eu_caucus", note:"The Netherlands is a country in north-western Europe on the North Sea, about a quarter of it below sea level behind dykes, and a founding member of the European Union. Its capital is Amsterdam and its seat of government The Hague." },
    "POL": { ga:"eu_caucus", note:"Poland is a country in central Europe on the Baltic Sea and a member of the European Union. Its capital is Warsaw." },
    "PRT": { ga:"eu_caucus", note:"Portugal is a country on the western edge of the Iberian Peninsula, with the Azores and Madeira in the Atlantic, and a member of the European Union. Its capital is Lisbon." },
    "ROU": { ga:"eu_caucus", note:"Romania is a country in south-eastern Europe on the Black Sea, crossed by the Carpathians, and a member of the European Union. Its capital is Bucharest." },
    "SVK": { ga:"eu_caucus", note:"Slovakia is a landlocked country in central Europe and a member of the European Union. Its capital is Bratislava, on the Danube. It makes more cars for its size than any other country." },
    "SVN": { ga:"eu_caucus", note:"Slovenia is a small country in central Europe between the Alps and the Adriatic, and a member of the European Union. Its capital is Ljubljana." },
    "ESP": { ga:"eu_caucus", note:"Spain is a country on the Iberian Peninsula with the Balearic and Canary Islands, and a member of the European Union. Its capital is Madrid." },
    "SWE": { ga:"eu_caucus", note:"Sweden is a country on the eastern side of the Scandinavian Peninsula and a member of the European Union. Its capital is Stockholm. It launches rockets from Esrange, near Kiruna." },
    "GRL": { note:"Greenland is the largest island in the world, most of it under an ice sheet. It is a self-governing part of the Kingdom of Denmark, and its capital is Nuuk." },
    "ATF": { name:"the French Southern and Antarctic Lands", note:"The French Southern and Antarctic Lands are a French territory of sub-Antarctic islands in the southern Indian Ocean, the Kerguelen Islands among them. They have no permanent population." },
    "NCL": { note:"New Caledonia is a French territory in the south-western Pacific. Its capital is Nouméa, and it holds a large share of the world's nickel." },
    "ATA": { note:"Antarctica is the southernmost continent, almost entirely covered by ice. It is governed under the Antarctic Treaty of 1959, which reserves it for peaceful and scientific use, and it has no permanent population." }
  }
};
