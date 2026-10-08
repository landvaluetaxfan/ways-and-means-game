/* Independent test profile, captured before world archival. */
var EngineFixtureDataEngine = function () { return {
"story":{
"events":[
{
"id":"the_commission",
"prologue":1,
"once":true,
"title":"Fixture events the_commission events/the_commission/title",
"speaker":"tenaya",
"body":"Fixture events the_commission events/the_commission/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_commission events/the_commission/choices/0/label",
"act":"Tell him",
"note":"Fixture events the_commission events/the_commission/choices/0/note",
"effects":[
{
"flag":"commission_bill"
},
{
"move":{
"rel.president":4
}
},
{
"move":{
"loyalty.psa":8
}
},
{
"move":{
"loyalty.cu_maintenance":-5
}
},
{
"wire":"PM TELLS PRESIDENT THE DIVERGENCE BILL COMES FIRST"
}
],
"result":"Fixture events the_commission events/the_commission/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events the_commission events/the_commission/choices/1/label",
"act":"Tell him",
"note":"Fixture events the_commission events/the_commission/choices/1/note",
"effects":[
{
"flag":"commission_stations"
},
{
"move":{
"rel.president":8
}
},
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"move":{
"loyalty.psa":-6
}
},
{
"move":{
"public_standing":3
}
},
{
"wire":"PM PUTS LIFE SUPPORT AHEAD OF THE BILL IN FIRST MEETING"
}
],
"result":"Fixture events the_commission events/the_commission/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events the_commission events/the_commission/choices/2/label",
"act":"Tell him",
"note":"Fixture events the_commission events/the_commission/choices/2/note",
"effects":[
{
"flag":"commission_none"
},
{
"move":{
"rel.president":-6
}
},
{
"move":{
"loyalty.cu_loyalists":7
}
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"PRESIDENT AND PRIME MINISTER MEET; NEITHER OFFICE COMMENTS"
}
],
"result":"Fixture events the_commission events/the_commission/choices/2/result"
}
]
},
{
"id":"the_account",
"prologue":2,
"once":true,
"title":"Fixture events the_account events/the_account/title",
"speaker":"ceyhan",
"body":"Fixture events the_account events/the_account/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events the_account events/the_account/choices/0/label",
"act":"Say it",
"note":"Fixture events the_account events/the_account/choices/0/note",
"effects":[
{
"flag":"led_on_competence"
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.cu_maintenance":-6
}
},
{
"move":{
"rel.gb_chair":6
}
},
{
"wire":"PM PITCHES COMPETENCE; SAYS GOVERNMENT WILL BE 'RUN, NOT ARGUED WITH'"
}
],
"result":"Fixture events the_account events/the_account/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_account events/the_account/choices/1/label",
"act":"Say it",
"note":"Fixture events the_account events/the_account/choices/1/note",
"effects":[
{
"flag":"led_on_continuity"
},
{
"move":{
"loyalty.cu_maintenance":11
}
},
{
"move":{
"loyalty.cu_loyalists":4
}
},
{
"move":{
"public_standing":-4
}
},
{
"move":{
"loyalty.psa":-5
}
},
{
"wire":"PM CLAIMS THE MOVEMENT'S INHERITANCE; PARTNERS SEEK CLARIFICATION"
}
],
"result":"Fixture events the_account events/the_account/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events the_account events/the_account/choices/2/label",
"act":"Say it",
"note":"Fixture events the_account events/the_account/choices/2/note",
"effects":[
{
"flag":"led_on_break"
},
{
"move":{
"public_standing":7
}
},
{
"move":{
"loyalty.psa":9
}
},
{
"move":{
"loyalty.cu_maintenance":-10
}
},
{
"move":{
"loyalty.cu_halloran":-6
}
},
{
"wire":"PM: 'THE PARTY HAD TO CHANGE.' CZARNECKI GROUP DECLINES TO COMMENT"
}
],
"result":"Fixture events the_account events/the_account/choices/2/result"
}
]
},
{
"id":"the_treasury",
"prologue":3,
"once":true,
"when":{
"postVacant":[
"treasury"
]
},
"title":"Fixture events the_treasury events/the_treasury/title",
"speaker":"castellane",
"body":"Fixture events the_treasury events/the_treasury/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_treasury events/the_treasury/choices/0/label",
"act":"Appoint her",
"note":"Fixture events the_treasury events/the_treasury/choices/0/note",
"effects":[
{
"cabinet":{
"treasury":{
"holder":"skye",
"party":"cu"
}
}
},
{
"move":{
"loyalty.cu_loyalists":4
}
},
{
"move":{
"loyalty.cu_halloran":-6
}
},
{
"move":{
"loyalty.cu_maintenance":-3
}
},
{
"wire":"SKYE CONFIRMED AT THE TREASURY; NO CHANGE OF DIRECTION SIGNALLED"
}
],
"result":"Fixture events the_treasury events/the_treasury/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_treasury events/the_treasury/choices/1/label",
"act":"Appoint him",
"note":"Fixture events the_treasury events/the_treasury/choices/1/note",
"effects":[
{
"cabinet":{
"treasury":{
"holder":"halloran",
"party":"cu"
}
}
},
{
"move":{
"loyalty.cu_halloran":26
}
},
{
"move":{
"loyalty.cu_loyalists":-11
}
},
{
"move":{
"public_standing":-4
}
},
{
"signatures":-4
},
{
"wire":"CZARNECKI TO THE TREASURY; LOYALISTS SAY THEY WERE NOT CONSULTED"
}
],
"result":"Fixture events the_treasury events/the_treasury/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events the_treasury events/the_treasury/choices/2/label",
"act":"Appoint her",
"note":"Fixture events the_treasury events/the_treasury/choices/2/note",
"effects":[
{
"cabinet":{
"treasury":{
"holder":"abadi",
"party":"rv"
}
}
},
{
"move":{
"loyalty.rv":14
}
},
{
"move":{
"capital.rv":3
}
},
{
"move":{
"loyalty.cu_maintenance":-7
}
},
{
"wire":"TREASURY GOES TO THE CONGREGATIONAL DEMOCRATIC ALLIANCE IN REBALANCE"
}
],
"result":"Fixture events the_treasury events/the_treasury/choices/2/result"
},
{
"posture":"bold",
"label":"Fixture events the_treasury events/the_treasury/choices/3/label",
"act":"Wait",
"note":"Fixture events the_treasury events/the_treasury/choices/3/note",
"effects":[
{
"flag":"treasury_left_vacant"
},
{
"move":{
"public_standing":-5
}
}
],
"result":"Fixture events the_treasury events/the_treasury/choices/3/result"
}
]
},
{
"id":"briefing_divergence",
"prologue":7,
"once":true,
"title":"Fixture events briefing_divergence events/briefing_divergence/title",
"speaker":"okarie",
"body":"Fixture events briefing_divergence events/briefing_divergence/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events briefing_divergence events/briefing_divergence/choices/0/label",
"act":"Ask her",
"note":"Fixture events briefing_divergence events/briefing_divergence/choices/0/note",
"effects":[
{
"flag":"read_the_count"
},
{
"move":{
"loyalty.psa":-2
}
}
],
"result":"Fixture events briefing_divergence events/briefing_divergence/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events briefing_divergence events/briefing_divergence/choices/1/label",
"act":"Tell her",
"note":"Fixture events briefing_divergence events/briefing_divergence/choices/1/note",
"effects":[
{
"flag":"estimates_first"
},
{
"move":{
"loyalty.psa":-4
}
},
{
"move":{
"capital.psa":-3
}
}
],
"result":"Fixture events briefing_divergence events/briefing_divergence/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events briefing_divergence events/briefing_divergence/choices/2/label",
"act":"Tell her",
"note":"Fixture events briefing_divergence events/briefing_divergence/choices/2/note",
"effects":[
{
"flag":"bill_first"
},
{
"move":{
"loyalty.psa":8
}
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"PM PUTS DIVERGENCE BILL AHEAD OF THE ESTIMATES"
}
],
"result":"Fixture events briefing_divergence events/briefing_divergence/choices/2/result"
}
]
},
{
"id":"gb_approach",
"prologue":14,
"once":true,
"when":{
"flagsAbsent":[
"gb_approached"
]
},
"title":"Fixture events gb_approach events/gb_approach/title",
"speaker":"gb_chair",
"body":"Fixture events gb_approach events/gb_approach/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events gb_approach events/gb_approach/choices/0/label",
"act":"Offer it",
"note":"Fixture events gb_approach events/gb_approach/choices/0/note",
"effects":[
{
"flag":"gb_approached"
},
{
"chapter":2
},
{
"move":{
"rel.gb_chair":12
}
},
{
"move":{
"loyalty.gb":6
}
},
{
"move":{
"loyalty.psa":-9
}
},
{
"undertake":{
"id":"licensure_carveout",
"text":"Lay the order that keeps copies off the Life Support licence",
"owed_to":"gb_chair",
"post":"attestation_registry",
"by":4,
"discharge":{
"si":"si_2080_45"
},
"onBreach":"minister_resignation"
}
},
{
"wire":"GOVERNMENT SIGNALS LICENSURE CARVE-OUT; NPP FURIOUS"
},
{
"flag":"licensure_carveout_offered"
}
],
"result":"Fixture events gb_approach events/gb_approach/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events gb_approach events/gb_approach/choices/1/label",
"note":"Fixture events gb_approach events/gb_approach/choices/1/note",
"effects":[
{
"flag":"gb_approached"
},
{
"chapter":2
},
{
"move":{
"rel.gb_chair":-15
}
},
{
"move":{
"loyalty.gb":-8
}
},
{
"move":{
"public_standing":3
}
},
{
"flag":"threatened_guild_bench"
},
{
"wire":"PM RAISES FUNCTIONAL SUNSET IN PRIVATE MEETING, SOURCES SAY"
}
],
"result":"Fixture events gb_approach events/gb_approach/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events gb_approach events/gb_approach/choices/2/label",
"note":"Fixture events gb_approach events/gb_approach/choices/2/note",
"effects":[
{
"flag":"gb_approached"
},
{
"chapter":2
},
{
"move":{
"rel.gb_chair":4
}
}
],
"result":"Fixture events gb_approach events/gb_approach/choices/2/result"
}
]
},
{
"id":"halloran_signatures",
"prologue":9,
"when":{
"loyaltyBelow":{
"cu_halloran":20
},
"flagsAbsent":[
"halloran_confronted"
]
},
"title":"Fixture events halloran_signatures events/halloran_signatures/title",
"speaker":"halloran",
"body":"Fixture events halloran_signatures events/halloran_signatures/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events halloran_signatures events/halloran_signatures/choices/0/label",
"note":"Fixture events halloran_signatures events/halloran_signatures/choices/0/note",
"effects":[
{
"move":{
"loyalty.cu_halloran":22
}
},
{
"move":{
"loyalty.cu_maintenance":9
}
},
{
"move":{
"party_loyalty":7
}
},
{
"flag":"halloran_confronted"
},
{
"flag":"shed_order_promised"
},
{
"bill":{
"shedorder":{
"stage":"second_reading"
}
}
}
],
"result":"Fixture events halloran_signatures events/halloran_signatures/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events halloran_signatures events/halloran_signatures/choices/1/label",
"note":"Fixture events halloran_signatures events/halloran_signatures/choices/1/note",
"effects":[
{
"move":{
"loyalty.cu_halloran":14
}
},
{
"move":{
"party_loyalty":4
}
},
{
"move":{
"public_standing":-3
}
},
{
"flag":"halloran_confronted"
},
{
"flag":"halloran_bought"
},
{
"wire":"CZARNECKI TIPPED FOR OFFICE; HOMESTEAD DELEGATION SEEKS ASSURANCES"
}
],
"result":"Fixture events halloran_signatures events/halloran_signatures/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events halloran_signatures events/halloran_signatures/choices/2/label",
"note":"Fixture events halloran_signatures events/halloran_signatures/choices/2/note",
"effects":[
{
"move":{
"loyalty.cu_halloran":-11
}
},
{
"move":{
"loyalty.cu_maintenance":-4
}
},
{
"move":{
"party_loyalty":-3
}
},
{
"flag":"halloran_confronted"
},
{
"queue":[
{
"event":"halloran_finds_nine",
"after":4
}
]
}
],
"result":"Fixture events halloran_signatures events/halloran_signatures/choices/2/result"
}
]
},
{
"id":"halloran_finds_nine",
"queuedOnly":true,
"once":true,
"title":"Fixture events halloran_finds_nine events/halloran_finds_nine/title",
"speaker":"halloran",
"body":"Fixture events halloran_finds_nine events/halloran_finds_nine/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events halloran_finds_nine events/halloran_finds_nine/choices/0/label",
"note":"Fixture events halloran_finds_nine events/halloran_finds_nine/choices/0/note",
"effects":[
{
"move":{
"party_loyalty":-4
}
},
{
"move":{
"public_standing":-5
}
},
{
"flag":"leadership_ballot_called"
},
{
"queue":[
{
"effects":[
{
"signatures":12
}
],
"after":8,
"label":"Czarnecki's names are on the paper, and the caucus will divide."
}
]
},
{
"wire":"LEADERSHIP BALLOT CALLED; CABINET DECLARES FOR FLASH"
}
],
"result":"Fixture events halloran_finds_nine events/halloran_finds_nine/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events halloran_finds_nine events/halloran_finds_nine/choices/1/label",
"note":"Fixture events halloran_finds_nine events/halloran_finds_nine/choices/1/note",
"effects":[
{
"move":{
"loyalty.cu_halloran":30
}
},
{
"move":{
"loyalty.cu_maintenance":12
}
},
{
"move":{
"loyalty.psa":-20
}
},
{
"move":{
"party_loyalty":12
}
},
{
"bill":{
"divergence":{
"stage":"withdrawn",
"dead":true
}
}
},
{
"wire":"THRESHOLD BILL WITHDRAWN; NEW PROGRESSIVE PARTY REVIEWS ITS PLACE IN THE COALITION"
}
],
"result":"Fixture events halloran_finds_nine events/halloran_finds_nine/choices/1/result"
}
]
},
{
"id":"vantage_radiator",
"prologue":11,
"when":{
"scalarBelow":{
"thermal_margin":22
},
"flagsAbsent":[
"vantage_handled"
]
},
"title":"Fixture events vantage_radiator events/vantage_radiator/title",
"speaker":null,
"image":{
"src":"vantage_radiator.png",
"palette":"broadcast",
"caption":"Radiator array 4, Ember Ridge",
"credit":"Ring Network"
},
"body":"Fixture events vantage_radiator events/vantage_radiator/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events vantage_radiator events/vantage_radiator/choices/0/label",
"note":"Fixture events vantage_radiator events/vantage_radiator/choices/0/note",
"effects":[
{
"move":{
"thermal_margin":11
}
},
{
"move":{
"solvency":-9000
}
},
{
"move":{
"public_standing":-4
}
},
{
"station":{
"vantage":{
"closure":0.03
}
}
},
{
"flag":"vantage_handled"
},
{
"wire":"ANSELM RING QUOTA DIVERTED TO EMBER RIDGE; RING MEMBERS OBJECT"
}
],
"result":"Fixture events vantage_radiator events/vantage_radiator/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events vantage_radiator events/vantage_radiator/choices/1/label",
"note":"Fixture events vantage_radiator events/vantage_radiator/choices/1/note",
"effects":[
{
"move":{
"thermal_margin":5
}
},
{
"move":{
"public_standing":-11
}
},
{
"move":{
"loyalty.hul":8
}
},
{
"move":{
"loyalty.psa":-9
}
},
{
"move":{
"loyalty.cu_halloran":-9
}
},
{
"flag":"vantage_handled"
},
{
"flag":"deferred_to_authority"
},
{
"wire":"GOVERNMENT DECLINES TO INTERVENE; ENGINEERING AUTHORITY TO EXERCISE S.12 POWERS"
}
],
"result":"Fixture events vantage_radiator events/vantage_radiator/choices/1/result"
},
{
"when":{
"flagsAbsent":[
"commission_stations"
]
},
"posture":"cautious",
"label":"Fixture events vantage_radiator events/vantage_radiator/choices/2/label",
"note":"Fixture events vantage_radiator events/vantage_radiator/choices/2/note",
"effects":[
{
"move":{
"thermal_margin":-6
}
},
{
"queue":[
{
"event":"vantage_cascade",
"after":3
}
]
}
],
"result":"Fixture events vantage_radiator events/vantage_radiator/choices/2/result"
},
{
"posture":"measured",
"label":"Fixture events vantage_radiator events/vantage_radiator/choices/3/label",
"when":{
"siNotMade":"rung1_conservation"
},
"note":"Fixture events vantage_radiator events/vantage_radiator/choices/3/note",
"effects":[
{
"si":"rung1_conservation"
},
{
"flag":"vantage_handled"
}
],
"result":"Fixture events vantage_radiator events/vantage_radiator/choices/3/result"
},
{
"when":{
"flags":[
"commission_stations"
]
},
"posture":"cautious",
"label":"Fixture events vantage_radiator events/vantage_radiator/choices/4/label",
"note":"Fixture events vantage_radiator events/vantage_radiator/choices/4/note",
"effects":[
{
"move":{
"thermal_margin":-6
}
},
{
"queue":[
{
"event":"vantage_cascade",
"after":3
}
]
},
{
"move":{
"rel.president":-6
}
},
{
"move":{
"public_standing":-3
}
}
],
"result":"Fixture events vantage_radiator events/vantage_radiator/choices/4/result"
}
]
},
{
"id":"vantage_cascade",
"queuedOnly":true,
"once":true,
"title":"Fixture events vantage_cascade events/vantage_cascade/title",
"speaker":null,
"body":"Fixture events vantage_cascade events/vantage_cascade/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events vantage_cascade events/vantage_cascade/choices/0/label",
"note":"Fixture events vantage_cascade events/vantage_cascade/choices/0/note",
"effects":[
{
"move":{
"public_standing":-8
}
},
{
"move":{
"thermal_margin":4
}
},
{
"move":{
"loyalty.psa":6
}
},
{
"move":{
"loyalty.hul":-14
}
},
{
"bill":{
"shedorder":{
"stage":"second_reading"
}
}
},
{
"wire":"PM ANNOUNCES REVIEW OF SHEDDING POWERS AFTER EMBER RIDGE"
}
],
"result":"Fixture events vantage_cascade events/vantage_cascade/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events vantage_cascade events/vantage_cascade/choices/1/label",
"note":"Fixture events vantage_cascade events/vantage_cascade/choices/1/note",
"effects":[
{
"move":{
"public_standing":-14
}
},
{
"move":{
"party_loyalty":-9
}
},
{
"move":{
"loyalty.hul":12
}
},
{
"move":{
"loyalty.psa":-16
}
},
{
"move":{
"loyalty.cu_maintenance":-11
}
},
{
"flag":"defended_authority"
},
{
"wire":"PM DEFENDS SHEDDING DECISION; SUBSTRATE LEFT SUMMONS COALITION MEETING"
}
],
"result":"Fixture events vantage_cascade events/vantage_cascade/choices/1/result"
}
]
},
{
"id":"cluster_flag",
"weight":60,
"when":{
"minSitting":2,
"flagsAbsent":[
"cluster_investigated"
]
},
"title":"Fixture events cluster_flag events/cluster_flag/title",
"speaker":"ceyhan",
"image":{
"src":"cluster_feed.png",
"palette":"newsprint",
"caption":"Registry advisory, 11 April",
"credit":"The Spindle"
},
"body":"Fixture events cluster_flag events/cluster_flag/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events cluster_flag events/cluster_flag/choices/0/label",
"note":"Fixture events cluster_flag events/cluster_flag/choices/0/note",
"effects":[
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.psa":-8
}
},
{
"move":{
"loyalty.cl":-6
}
},
{
"move":{
"loyalty.gb":5
}
},
{
"flag":"cluster_investigated"
},
{
"flag":"attestation_bill_trailed"
},
{
"wire":"GOVERNMENT TO SEEK REGISTRY ENFORCEMENT POWERS"
}
],
"result":"Fixture events cluster_flag events/cluster_flag/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events cluster_flag events/cluster_flag/choices/1/label",
"note":"Fixture events cluster_flag events/cluster_flag/choices/1/note",
"effects":[
{
"move":{
"public_standing":-4
}
},
{
"move":{
"loyalty.psa":7
}
},
{
"move":{
"loyalty.cl":4
}
},
{
"flag":"cluster_investigated"
},
{
"move":{
"rel.ceyhan":5
}
}
],
"result":"Fixture events cluster_flag events/cluster_flag/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events cluster_flag events/cluster_flag/choices/2/label",
"note":"Fixture events cluster_flag events/cluster_flag/choices/2/note",
"effects":[
{
"flag":"cluster_investigated"
},
{
"flag":"cluster_traced"
},
{
"move":{
"rel.ceyhan":9
}
},
{
"queue":[
{
"event":"cluster_source",
"after":5
}
]
}
],
"result":"Fixture events cluster_flag events/cluster_flag/choices/2/result"
}
]
},
{
"id":"cluster_source",
"queuedOnly":true,
"once":true,
"title":"Fixture events cluster_source events/cluster_source/title",
"speaker":"ceyhan",
"body":"Fixture events cluster_source events/cluster_source/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events cluster_source events/cluster_source/choices/0/label",
"note":"Fixture events cluster_source events/cluster_source/choices/0/note",
"effects":[
{
"move":{
"public_standing":7
}
},
{
"move":{
"loyalty.cl":-11
}
},
{
"move":{
"loyalty.gb":-7
}
},
{
"flag":"shells_referred"
},
{
"wire":"LAW OFFICER TO EXAMINE SHELL REGISTRATIONS IN SUBSTRATE PROVIDERS SEAT"
}
],
"result":"Fixture events cluster_source events/cluster_source/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events cluster_source events/cluster_source/choices/1/label",
"note":"Fixture events cluster_source events/cluster_source/choices/1/note",
"effects":[
{
"flag":"shells_held"
},
{
"move":{
"rel.ceyhan":-8
}
}
],
"result":"Fixture events cluster_source events/cluster_source/choices/1/result"
}
]
},
{
"id":"the_order_of_the_day",
"prologue":5,
"when":{
"flagsAbsent":[
"taught_the_day"
]
},
"title":"Fixture events the_order_of_the_day events/the_order_of_the_day/title",
"speaker":"okarie",
"body":"Fixture events the_order_of_the_day events/the_order_of_the_day/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_order_of_the_day events/the_order_of_the_day/choices/0/label",
"note":"Fixture events the_order_of_the_day events/the_order_of_the_day/choices/0/note",
"effects":[
{
"flag":"taught_the_day"
},
{
"move":{
"rel.okarie":6
}
},
{
"move":{
"loyalty.cu_loyalists":3
}
}
],
"result":"Fixture events the_order_of_the_day events/the_order_of_the_day/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_order_of_the_day events/the_order_of_the_day/choices/1/label",
"note":"Fixture events the_order_of_the_day events/the_order_of_the_day/choices/1/note",
"effects":[
{
"flag":"taught_the_day"
},
{
"move":{
"rel.okarie":-4
}
},
{
"move":{
"public_standing":2
}
}
],
"result":"Fixture events the_order_of_the_day events/the_order_of_the_day/choices/1/result"
}
]
},
{
"id":"the_rules_of_the_house",
"chapter":2,
"prologue":1,
"once":true,
"when":{
"flagsAbsent":[
"taught_the_house"
]
},
"title":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/title",
"speaker":"okarie",
"body":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/choices/0/label",
"note":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/choices/0/note",
"effects":[
{
"flag":"taught_the_house"
},
{
"move":{
"rel.okarie":5
}
},
{
"move":{
"loyalty.cu_loyalists":2
}
},
{
"flag":"knows_the_tests"
}
],
"result":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/choices/1/label",
"note":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/choices/1/note",
"effects":[
{
"flag":"taught_the_house"
},
{
"move":{
"rel.okarie":-3
}
},
{
"move":{
"public_standing":1
}
}
],
"result":"Fixture events the_rules_of_the_house events/the_rules_of_the_house/choices/1/result"
}
]
},
{
"id":"ch2_open",
"chapter":2,
"prologue":2,
"once":true,
"title":"Fixture events ch2_open events/ch2_open/title",
"speaker":null,
"body":"Fixture events ch2_open events/ch2_open/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events ch2_open events/ch2_open/choices/0/label",
"note":"Fixture events ch2_open events/ch2_open/choices/0/note",
"effects":[
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"move":{
"loyalty.cu_halloran":4
}
},
{
"flag":"whipped_own_side"
}
],
"result":"Fixture events ch2_open events/ch2_open/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ch2_open events/ch2_open/choices/1/label",
"note":"Fixture events ch2_open events/ch2_open/choices/1/note",
"effects":[
{
"move":{
"loyalty.fh":5
}
},
{
"move":{
"loyalty.hul":3
}
},
{
"move":{
"solvency":-6000
}
},
{
"flag":"lobbied_functional"
}
],
"result":"Fixture events ch2_open events/ch2_open/choices/1/result"
},
{
"when":{
"flagsAbsent":[
"commission_bill"
]
},
"posture":"cautious",
"label":"Fixture events ch2_open events/ch2_open/choices/2/label",
"note":"Fixture events ch2_open events/ch2_open/choices/2/note",
"effects":[
{
"move":{
"public_standing":4
}
},
{
"move":{
"loyalty.psa":-10
}
},
{
"flag":"let_it_fall"
},
{
"wire":"GOVERNMENT SIGNALS IT WILL NOT DELAY THE THRESHOLD DIVISION"
}
],
"result":"Fixture events ch2_open events/ch2_open/choices/2/result"
},
{
"when":{
"flags":[
"commission_bill"
]
},
"posture":"cautious",
"label":"Fixture events ch2_open events/ch2_open/choices/3/label",
"note":"Fixture events ch2_open events/ch2_open/choices/3/note",
"effects":[
{
"move":{
"public_standing":4
}
},
{
"move":{
"loyalty.psa":-10
}
},
{
"flag":"let_it_fall"
},
{
"wire":"GOVERNMENT SIGNALS IT WILL NOT DELAY THE THRESHOLD DIVISION"
},
{
"move":{
"rel.president":-5
}
},
{
"move":{
"legitimacy":-2
}
}
],
"result":"Fixture events ch2_open events/ch2_open/choices/3/result"
}
]
},
{
"id":"ch2_carveout_price",
"chapter":2,
"weight":80,
"once":true,
"when":{
"flags":[
"licensure_carveout_offered"
]
},
"title":"Fixture events ch2_carveout_price events/ch2_carveout_price/title",
"speaker":"gb_chair",
"body":"Fixture events ch2_carveout_price events/ch2_carveout_price/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ch2_carveout_price events/ch2_carveout_price/choices/0/label",
"note":"Fixture events ch2_carveout_price events/ch2_carveout_price/choices/0/note",
"effects":[
{
"law":{
"divergence_threshold_hours":40
}
},
{
"bill":{
"divergence":{
"stage":"passed",
"dead":true
}
}
},
{
"move":{
"loyalty.psa":-18
}
},
{
"move":{
"loyalty.gb":10
}
},
{
"move":{
"public_standing":6
}
},
{
"flag":"carveout_taken"
},
{
"queue":[
{
"event":"ch2_psa_conference",
"after":2
}
]
},
{
"wire":"THRESHOLD BILL CARRIES WITH LICENSURE CARVE-OUT; NPP CONFERENCE CALLED"
}
],
"result":"Fixture events ch2_carveout_price events/ch2_carveout_price/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ch2_carveout_price events/ch2_carveout_price/choices/1/label",
"note":"Fixture events ch2_carveout_price events/ch2_carveout_price/choices/1/note",
"effects":[
{
"bill":{
"divergence":{
"stage":"defeated",
"dead":true
}
}
},
{
"move":{
"loyalty.psa":8
}
},
{
"move":{
"loyalty.gb":-6
}
},
{
"move":{
"public_standing":-5
}
},
{
"flag":"carveout_refused"
},
{
"wire":"THRESHOLD BILL FALLS ON THE FUNCTIONAL DIVISION"
}
],
"result":"Fixture events ch2_carveout_price events/ch2_carveout_price/choices/1/result"
}
]
},
{
"id":"ch2_psa_conference",
"chapter":2,
"queuedOnly":true,
"once":true,
"title":"Fixture events ch2_psa_conference events/ch2_psa_conference/title",
"speaker":null,
"body":"Fixture events ch2_psa_conference events/ch2_psa_conference/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch2_psa_conference events/ch2_psa_conference/choices/0/label",
"note":"Fixture events ch2_psa_conference events/ch2_psa_conference/choices/0/note",
"effects":[
{
"move":{
"loyalty.psa":12
}
},
{
"move":{
"public_standing":-4
}
}
],
"result":"Fixture events ch2_psa_conference events/ch2_psa_conference/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch2_psa_conference events/ch2_psa_conference/choices/1/label",
"note":"Fixture events ch2_psa_conference events/ch2_psa_conference/choices/1/note",
"effects":[
{
"move":{
"loyalty.psa":-6
}
}
],
"result":"Fixture events ch2_psa_conference events/ch2_psa_conference/choices/1/result"
}
]
},
{
"id":"substrate_price_bite",
"chapter":2,
"weight":88,
"once":true,
"when":{
"priceAbove":{
"substrate":104
},
"flagsAbsent":[
"substrate_bite_seen"
]
},
"title":"Fixture events substrate_price_bite events/substrate_price_bite/title",
"speaker":"ansar",
"body":"Fixture events substrate_price_bite events/substrate_price_bite/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events substrate_price_bite events/substrate_price_bite/choices/0/label",
"note":"Fixture events substrate_price_bite events/substrate_price_bite/choices/0/note",
"effects":[
{
"move":{
"price.substrate":-16
}
},
{
"move":{
"solvency":-14000
}
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.cu_maintenance":8
}
},
{
"move":{
"loyalty.psa":6
}
},
{
"flag":"substrate_bite_seen"
},
{
"wire":"EMERGENCY SUBSTRATE SUBSIDY ANNOUNCED; INDEX FALLS"
}
],
"result":"Fixture events substrate_price_bite events/substrate_price_bite/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events substrate_price_bite events/substrate_price_bite/choices/1/label",
"note":"Fixture events substrate_price_bite events/substrate_price_bite/choices/1/note",
"effects":[
{
"move":{
"public_standing":-9
}
},
{
"move":{
"loyalty.cu_maintenance":-13
}
},
{
"move":{
"loyalty.psa":-10
}
},
{
"move":{
"loyalty.cl":7
}
},
{
"flag":"substrate_bite_seen"
},
{
"flag":"denied_the_rent"
},
{
"wire":"PM: SUBSTRATE RENTS \"NOT A MATTER FOR MINISTERS\""
}
],
"result":"Fixture events substrate_price_bite events/substrate_price_bite/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events substrate_price_bite events/substrate_price_bite/choices/2/label",
"note":"Fixture events substrate_price_bite events/substrate_price_bite/choices/2/note",
"effects":[
{
"bill":{
"substrate_public_stake":{
"stage":"second_reading"
}
}
},
{
"move":{
"loyalty.psa":14
}
},
{
"move":{
"loyalty.cl":-12
}
},
{
"flag":"substrate_bite_seen"
},
{
"flag":"staked_on_public_stake"
},
{
"wire":"GOVERNMENT ADVANCES PUBLIC STAKE BILL AFTER RENT RISE"
}
],
"result":"Fixture events substrate_price_bite events/substrate_price_bite/choices/2/result"
}
]
},
{
"id":"shed_order_crisis",
"chapter":2,
"weight":95,
"once":true,
"when":{
"priceAbove":{
"substrate":103
},
"suspendedAbove":{
"federal":73000
},
"flagsAbsent":[
"shed_crisis_seen"
]
},
"title":"Fixture events shed_order_crisis events/shed_order_crisis/title",
"speaker":null,
"body":"Fixture events shed_order_crisis events/shed_order_crisis/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events shed_order_crisis events/shed_order_crisis/choices/0/label",
"note":"Fixture events shed_order_crisis events/shed_order_crisis/choices/0/note",
"effects":[
{
"move":{
"price.substrate":-12
}
},
{
"move":{
"solvency":-16000
}
},
{
"move":{
"public_standing":7
}
},
{
"move":{
"loyalty.cu_maintenance":10
}
},
{
"move":{
"loyalty.psa":8
}
},
{
"flag":"shed_crisis_seen"
},
{
"flag":"intervened_in_shed"
},
{
"wire":"GOVERNMENT REQUISITIONS SUBSTRATE; SHED ORDER SUSPENDED"
}
],
"result":"Fixture events shed_order_crisis events/shed_order_crisis/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events shed_order_crisis events/shed_order_crisis/choices/1/label",
"note":"Fixture events shed_order_crisis events/shed_order_crisis/choices/1/note",
"effects":[
{
"move":{
"public_standing":-12
}
},
{
"move":{
"loyalty.cu_maintenance":-14
}
},
{
"move":{
"loyalty.psa":-11
}
},
{
"move":{
"loyalty.hul":9
}
},
{
"flag":"shed_crisis_seen"
},
{
"flag":"let_the_shed_stand"
},
{
"wire":"PM DECLINES TO SUSPEND SHED ORDER; HOMESTEAD DELEGATION WALKS OUT"
}
],
"result":"Fixture events shed_order_crisis events/shed_order_crisis/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events shed_order_crisis events/shed_order_crisis/choices/2/label",
"note":"Fixture events shed_order_crisis events/shed_order_crisis/choices/2/note",
"effects":[
{
"move":{
"public_standing":-4
}
},
{
"move":{
"loyalty.cu_maintenance":-6
}
},
{
"flag":"shed_crisis_seen"
},
{
"flag":"blamed_the_drift"
},
{
"wire":"PM ORDERS REVIEW OF SUBSTRATE PRICE MECHANISM AFTER SHED ORDER"
}
],
"result":"Fixture events shed_order_crisis events/shed_order_crisis/choices/2/result"
}
]
},
{
"id":"thermal_squeeze",
"chapter":2,
"weight":70,
"once":true,
"when":{
"priceAbove":{
"thermal":108
},
"flagsAbsent":[
"thermal_squeeze_seen"
]
},
"title":"Fixture events thermal_squeeze events/thermal_squeeze/title",
"speaker":null,
"body":"Fixture events thermal_squeeze events/thermal_squeeze/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events thermal_squeeze events/thermal_squeeze/choices/0/label",
"note":"Fixture events thermal_squeeze events/thermal_squeeze/choices/0/note",
"effects":[
{
"move":{
"price.thermal":-14
}
},
{
"move":{
"solvency":-18000
}
},
{
"move":{
"loyalty.hul":6
}
},
{
"move":{
"thermal_margin":5
}
},
{
"flag":"thermal_squeeze_seen"
},
{
"wire":"GOVERNMENT BUYS THERMAL QUOTA AT MARKET; PRICE FALLS"
}
],
"result":"Fixture events thermal_squeeze events/thermal_squeeze/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events thermal_squeeze events/thermal_squeeze/choices/1/label",
"note":"Fixture events thermal_squeeze events/thermal_squeeze/choices/1/note",
"effects":[
{
"move":{
"price.thermal":-8
}
},
{
"move":{
"loyalty.hul":-12
}
},
{
"move":{
"loyalty.cl":-9
}
},
{
"move":{
"public_standing":4
}
},
{
"flag":"thermal_squeeze_seen"
},
{
"flag":"capped_the_exchange"
},
{
"wire":"GOVERNMENT CAPS THERMAL EXCHANGE; ENGINEERS WARN OF UNDERINVESTMENT"
}
],
"result":"Fixture events thermal_squeeze events/thermal_squeeze/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events thermal_squeeze events/thermal_squeeze/choices/2/label",
"note":"Fixture events thermal_squeeze events/thermal_squeeze/choices/2/note",
"effects":[
{
"move":{
"public_standing":-7
}
},
{
"move":{
"loyalty.hul":7
}
},
{
"move":{
"thermal_margin":-4
}
},
{
"flag":"thermal_squeeze_seen"
},
{
"flag":"left_thermal_market"
},
{
"wire":"PM: THERMAL PRICE 'A SIGNAL, NOT A SCANDAL'"
}
],
"result":"Fixture events thermal_squeeze events/thermal_squeeze/choices/2/result"
},
{
"posture":"measured",
"label":"Fixture events thermal_squeeze events/thermal_squeeze/choices/3/label",
"when":{
"siNotMade":"rung1_conservation"
},
"note":"Fixture events thermal_squeeze events/thermal_squeeze/choices/3/note",
"effects":[
{
"si":"rung1_conservation"
},
{
"flag":"thermal_squeeze_seen"
}
],
"result":"Fixture events thermal_squeeze events/thermal_squeeze/choices/3/result"
},
{
"posture":"bold",
"label":"Fixture events thermal_squeeze events/thermal_squeeze/choices/4/label",
"when":{
"flags":[
"rung1_tried"
],
"siNotMade":"rung2_clockrate"
},
"note":"Fixture events thermal_squeeze events/thermal_squeeze/choices/4/note",
"effects":[
{
"si":"rung2_clockrate"
},
{
"flag":"thermal_squeeze_seen"
}
],
"result":"Fixture events thermal_squeeze events/thermal_squeeze/choices/4/result"
}
]
},
{
"id":"party_fracture",
"chapter":2,
"weight":80,
"once":true,
"when":{
"scalarBelow":{
"party_loyalty":22
},
"flagsAbsent":[
"party_fracture_seen"
]
},
"title":"Fixture events party_fracture events/party_fracture/title",
"speaker":null,
"body":"Fixture events party_fracture events/party_fracture/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events party_fracture events/party_fracture/choices/0/label",
"note":"Fixture events party_fracture events/party_fracture/choices/0/note",
"effects":[
{
"move":{
"party_loyalty":14
}
},
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"move":{
"public_standing":-3
}
},
{
"flag":"party_fracture_seen"
},
{
"wire":"PM ADDRESSES OWN BACKBENCH AFTER WEEKS OF DRIFT"
}
],
"result":"Fixture events party_fracture events/party_fracture/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events party_fracture events/party_fracture/choices/1/label",
"note":"Fixture events party_fracture events/party_fracture/choices/1/note",
"effects":[
{
"move":{
"party_loyalty":6
}
},
{
"move":{
"loyalty.cu_halloran":-10
}
},
{
"move":{
"loyalty.cu_maintenance":-4
}
},
{
"flag":"party_fracture_seen"
},
{
"flag":"fracture_reshuffle"
},
{
"wire":"MINI-RESHUFFLE AFTER BACKBENCH UNREST"
}
],
"result":"Fixture events party_fracture events/party_fracture/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events party_fracture events/party_fracture/choices/2/label",
"note":"Fixture events party_fracture events/party_fracture/choices/2/note",
"effects":[
{
"move":{
"party_loyalty":-8
}
},
{
"move":{
"public_standing":2
}
},
{
"flag":"party_fracture_seen"
},
{
"wire":"PM DISMISSES TALK OF PARTY UNREST AS 'A WORKING PARTY WORKING'"
}
],
"result":"Fixture events party_fracture events/party_fracture/choices/2/result"
}
]
},
{
"id":"reserve_low",
"chapter":2,
"weight":75,
"once":true,
"when":{
"scalarBelow":{
"solvency":14000
},
"flagsAbsent":[
"reserve_low_seen"
]
},
"title":"Fixture events reserve_low events/reserve_low/title",
"speaker":null,
"body":"Fixture events reserve_low events/reserve_low/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events reserve_low events/reserve_low/choices/0/label",
"note":"Fixture events reserve_low events/reserve_low/choices/0/note",
"effects":[
{
"move":{
"solvency":16000
}
},
{
"move":{
"price.substrate":6
}
},
{
"move":{
"loyalty.cl":-10
}
},
{
"move":{
"loyalty.cu_maintenance":-5
}
},
{
"flag":"reserve_low_seen"
},
{
"flag":"raised_tariff"
},
{
"wire":"TETHER TARIFF RAISED TO REFILL RESERVE; SHIPPERS OBJECT"
}
],
"result":"Fixture events reserve_low events/reserve_low/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events reserve_low events/reserve_low/choices/1/label",
"note":"Fixture events reserve_low events/reserve_low/choices/1/note",
"effects":[
{
"move":{
"solvency":10000
}
},
{
"move":{
"thermal_margin":-9
}
},
{
"move":{
"loyalty.hul":-11
}
},
{
"flag":"reserve_low_seen"
},
{
"flag":"deferred_maintenance"
},
{
"wire":"MAINTENANCE APPROPRIATION DEFERRED TO NEXT SESSION"
}
],
"result":"Fixture events reserve_low events/reserve_low/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events reserve_low events/reserve_low/choices/2/label",
"note":"Fixture events reserve_low events/reserve_low/choices/2/note",
"effects":[
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.cu_maintenance":7
}
},
{
"flag":"reserve_low_seen"
},
{
"flag":"spent_the_reserve"
},
{
"wire":"PM COMMITS RESERVE TO CURRENT PROGRAMME"
}
],
"result":"Fixture events reserve_low events/reserve_low/choices/2/result"
}
]
},
{
"id":"standing_low",
"chapter":2,
"weight":78,
"once":true,
"when":{
"scalarBelow":{
"public_standing":26
},
"flagsAbsent":[
"standing_low_seen"
]
},
"title":"Fixture events standing_low events/standing_low/title",
"speaker":"ceyhan",
"body":"Fixture events standing_low events/standing_low/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events standing_low events/standing_low/choices/0/label",
"note":"Fixture events standing_low events/standing_low/choices/0/note",
"effects":[
{
"move":{
"public_standing":12
}
},
{
"move":{
"solvency":-10000
}
},
{
"move":{
"loyalty.psa":5
}
},
{
"flag":"standing_low_seen"
},
{
"flag":"bought_attention"
},
{
"wire":"GOVERNMENT ANNOUNCES RELIEF PACKAGE AS POLLS FLATLINE"
}
],
"result":"Fixture events standing_low events/standing_low/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events standing_low events/standing_low/choices/1/label",
"note":"Fixture events standing_low events/standing_low/choices/1/note",
"effects":[
{
"move":{
"public_standing":-5
}
},
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"move":{
"rel.ceyhan":6
}
},
{
"flag":"standing_low_seen"
},
{
"flag":"refused_the_poll"
},
{
"wire":"PM: 'I DID NOT COME HERE TO BE LIKED'"
}
],
"result":"Fixture events standing_low events/standing_low/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events standing_low events/standing_low/choices/2/label",
"note":"Fixture events standing_low events/standing_low/choices/2/note",
"effects":[
{
"move":{
"public_standing":7
}
},
{
"move":{
"party_loyalty":-7
}
},
{
"move":{
"loyalty.cu_loyalists":-8
}
},
{
"flag":"standing_low_seen"
},
{
"flag":"reset_the_story"
},
{
"wire":"CABINET RESHUFFLE ANNOUNCED; SENIOR MINISTERS OUT"
}
],
"result":"Fixture events standing_low events/standing_low/choices/2/result"
}
]
},
{
"id":"threshold_consequence",
"chapter":2,
"weight":85,
"once":true,
"when":{
"lawBelow":{
"divergence_threshold_hours":100
},
"flagsAbsent":[
"threshold_seen"
]
},
"title":"Fixture events threshold_consequence events/threshold_consequence/title",
"speaker":null,
"body":"Fixture events threshold_consequence events/threshold_consequence/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events threshold_consequence events/threshold_consequence/choices/0/label",
"note":"Fixture events threshold_consequence events/threshold_consequence/choices/0/note",
"effects":[
{
"move":{
"solvency":-14000
}
},
{
"move":{
"public_standing":8
}
},
{
"move":{
"loyalty.psa":9
}
},
{
"move":{
"loyalty.cl":-5
}
},
{
"flag":"threshold_seen"
},
{
"flag":"funded_the_registry"
},
{
"wire":"EMERGENCY REGISTRY FUNDING AFTER THRESHOLD CHANGE"
}
],
"result":"Fixture events threshold_consequence events/threshold_consequence/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events threshold_consequence events/threshold_consequence/choices/1/label",
"note":"Fixture events threshold_consequence events/threshold_consequence/choices/1/note",
"effects":[
{
"move":{
"public_standing":-13
}
},
{
"move":{
"loyalty.psa":-16
}
},
{
"move":{
"loyalty.cu_maintenance":4
}
},
{
"flag":"threshold_seen"
},
{
"flag":"set_aside_new_electors"
},
{
"wire":"GOVERNMENT DEFERS ENFRANCHISEMENT OF NEW PERSONS TO NEXT PARLIAMENT"
}
],
"result":"Fixture events threshold_consequence events/threshold_consequence/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events threshold_consequence events/threshold_consequence/choices/2/label",
"note":"Fixture events threshold_consequence events/threshold_consequence/choices/2/note",
"effects":[
{
"move":{
"public_standing":-6
}
},
{
"move":{
"loyalty.cu_maintenance":-7
}
},
{
"move":{
"loyalty.psa":-4
}
},
{
"flag":"threshold_seen"
},
{
"flag":"kept_wrong_boundaries"
},
{
"wire":"BOUNDARY COMMISSION OVERRULED; REDRAW DEFERRED"
}
],
"result":"Fixture events threshold_consequence events/threshold_consequence/choices/2/result"
}
]
},
{
"id":"leadership_ballot",
"chapter":2,
"weight":99,
"once":true,
"when":{
"ballotHeld":true,
"ballotCarries":true,
"flagsAbsent":[
"ballot_seen"
]
},
"title":"Fixture events leadership_ballot events/leadership_ballot/title",
"speaker":null,
"body":"Fixture events leadership_ballot events/leadership_ballot/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events leadership_ballot events/leadership_ballot/choices/0/label",
"note":"Fixture events leadership_ballot events/leadership_ballot/choices/0/note",
"effects":[
{
"flag":"ballot_seen"
},
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"move":{
"loyalty.cu_loyalists":-4
}
},
{
"wire":"LEADERSHIP BALLOT HELD; PM SURVIVES"
}
],
"result":"Fixture events leadership_ballot events/leadership_ballot/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events leadership_ballot events/leadership_ballot/choices/1/label",
"note":"Fixture events leadership_ballot events/leadership_ballot/choices/1/note",
"effects":[
{
"flag":"ballot_seen"
},
{
"move":{
"loyalty.cu_halloran":-8
}
},
{
"move":{
"loyalty.cu_loyalists":8
}
},
{
"move":{
"public_standing":3
}
},
{
"wire":"PM ADDRESSES CAUCUS BEFORE BALLOT; SURVIVES"
}
],
"result":"Fixture events leadership_ballot events/leadership_ballot/choices/1/result"
}
]
},
{
"id":"minister_resignation",
"chapter":2,
"queuedOnly":true,
"once":true,
"when":{
"breached":[
"licensure_carveout"
]
},
"title":"Fixture events minister_resignation events/minister_resignation/title",
"speaker":null,
"body":"Fixture events minister_resignation events/minister_resignation/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events minister_resignation events/minister_resignation/choices/0/label",
"when":{
"postVacant":[
"attestation_registry"
]
},
"note":"Fixture events minister_resignation events/minister_resignation/choices/0/note",
"effects":[
{
"cabinet":{
"attestation_registry":{
"holder":"okarie",
"party":"cu"
}
}
},
{
"move":{
"loyalty.cu":5
}
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"VACANT POST FILLED AFTER MINISTERIAL RESIGNATION"
},
{
"queue":[
{
"event":"gb_carveout_broken",
"after":1
}
]
}
],
"result":"Fixture events minister_resignation events/minister_resignation/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events minister_resignation events/minister_resignation/choices/1/label",
"when":{
"postVacant":[
"attestation_registry"
]
},
"note":"Fixture events minister_resignation events/minister_resignation/choices/1/note",
"effects":[
{
"move":{
"public_standing":-4
}
},
{
"flag":"post_left_vacant"
},
{
"wire":"PM LEAVES MINISTERIAL POST VACANT"
},
{
"queue":[
{
"event":"gb_carveout_broken",
"after":1
}
]
}
],
"result":"Fixture events minister_resignation events/minister_resignation/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events minister_resignation events/minister_resignation/choices/2/label",
"when":{
"holds":{
"attestation_registry":[
"preiss",
"okarie"
]
}
},
"note":"Fixture events minister_resignation events/minister_resignation/choices/2/note",
"effects":[
{
"queue":[
{
"event":"gb_carveout_broken",
"after":1
}
]
}
],
"result":"Fixture events minister_resignation events/minister_resignation/choices/2/result"
}
]
},
{
"id":"guild_answers",
"queuedOnly":true,
"once":true,
"title":"Fixture events guild_answers events/guild_answers/title",
"speaker":"gb_chair",
"body":"Fixture events guild_answers events/guild_answers/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events guild_answers events/guild_answers/choices/0/label",
"note":"Fixture events guild_answers events/guild_answers/choices/0/note",
"effects":[
{
"flag":"guild_met"
},
{
"move":{
"rel.gb_chair":5
}
},
{
"move":{
"loyalty.gb":5
}
}
],
"result":"Fixture events guild_answers events/guild_answers/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events guild_answers events/guild_answers/choices/1/label",
"note":"Fixture events guild_answers events/guild_answers/choices/1/note",
"effects":[
{
"flag":"guild_met"
},
{
"flag":"guild_price_asked"
},
{
"move":{
"rel.gb_chair":-6
}
},
{
"move":{
"loyalty.gb":-4
}
}
],
"result":"Fixture events guild_answers events/guild_answers/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events guild_answers events/guild_answers/choices/2/label",
"note":"Fixture events guild_answers events/guild_answers/choices/2/note",
"when":{
"flagsAbsent":[
"threatened_guild_bench"
]
},
"effects":[
{
"flag":"guild_met"
},
{
"flag":"threatened_guild_bench"
},
{
"move":{
"rel.gb_chair":-12
}
},
{
"move":{
"public_standing":2
}
}
],
"result":"Fixture events guild_answers events/guild_answers/choices/2/result"
}
]
},
{
"id":"review_reports",
"queuedOnly":true,
"once":true,
"title":"Fixture events review_reports events/review_reports/title",
"speaker":null,
"body":"Fixture events review_reports events/review_reports/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events review_reports events/review_reports/choices/0/label",
"note":"Fixture events review_reports events/review_reports/choices/0/note",
"when":{
"flags":[
"review_full"
]
},
"effects":[
{
"flag":"shed_number_published"
},
{
"move":{
"public_standing":8
}
},
{
"move":{
"loyalty.cu_maintenance":10
}
},
{
"move":{
"loyalty.hul":9
}
},
{
"wire":"PM READS SHED ORDER TOTAL INTO THE HOUSE: TWENTY-NINE THOUSAND"
}
],
"result":"Fixture events review_reports events/review_reports/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events review_reports events/review_reports/choices/1/label",
"note":"Fixture events review_reports events/review_reports/choices/1/note",
"when":{
"flags":[
"review_thin"
]
},
"effects":[
{
"flag":"shed_number_held"
},
{
"move":{
"public_standing":-3
}
}
],
"result":"Fixture events review_reports events/review_reports/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events review_reports events/review_reports/choices/2/label",
"note":"Fixture events review_reports events/review_reports/choices/2/note",
"effects":[
{
"flag":"shed_register_promised"
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.psa":6
}
},
{
"move":{
"loyalty.gb":-5
}
},
{
"wire":"GOVERNMENT TO PUBLISH SHED ORDER REGISTER QUARTERLY"
}
],
"result":"Fixture events review_reports events/review_reports/choices/2/result"
},
{
"posture":"cautious",
"label":"Fixture events review_reports events/review_reports/choices/3/label",
"note":"Fixture events review_reports events/review_reports/choices/3/note",
"effects":[
{
"flag":"review_filed"
},
{
"move":{
"loyalty.cu_maintenance":-6
}
}
],
"result":"Fixture events review_reports events/review_reports/choices/3/result"
}
]
},
{
"id":"position_lands",
"queuedOnly":true,
"once":true,
"title":"Fixture events position_lands events/position_lands/title",
"speaker":"ceyhan",
"body":"Fixture events position_lands events/position_lands/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events position_lands events/position_lands/choices/0/label",
"note":"Fixture events position_lands events/position_lands/choices/0/note",
"effects":[
{
"flag":"position_public"
},
{
"move":{
"loyalty.cu_maintenance":4
}
},
{
"move":{
"rel.ceyhan":5
}
}
],
"result":"Fixture events position_lands events/position_lands/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events position_lands events/position_lands/choices/1/label",
"note":"Fixture events position_lands events/position_lands/choices/1/note",
"effects":[
{
"flag":"position_public"
},
{
"flag":"position_campaigned"
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.cu_maintenance":-8
}
},
{
"move":{
"loyalty.psa":6
}
},
{
"wire":"PM CAMPAIGNS ON THRESHOLD POSITION; MAINTENANCE BENCHES OBJECT"
}
],
"result":"Fixture events position_lands events/position_lands/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events position_lands events/position_lands/choices/2/label",
"note":"Fixture events position_lands events/position_lands/choices/2/note",
"when":{
"flags":[
"position_offhand"
]
},
"effects":[
{
"flag":"position_softened"
},
{
"move":{
"rel.ceyhan":-8
}
},
{
"move":{
"loyalty.psa":-7
}
},
{
"move":{
"loyalty.cu_maintenance":5
}
}
],
"result":"Fixture events position_lands events/position_lands/choices/2/result"
}
]
},
{
"id":"margin_thin",
"chapter":2,
"weight":72,
"maxFires":2,
"when":{
"scalarBelow":{
"thermal_margin":8
}
},
"title":"Fixture events margin_thin events/margin_thin/title",
"speaker":"vellan",
"body":"Fixture events margin_thin events/margin_thin/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events margin_thin events/margin_thin/choices/0/label",
"note":"Fixture events margin_thin events/margin_thin/choices/0/note",
"effects":[
{
"move":{
"thermal_margin":8
}
},
{
"move":{
"solvency":-10000
}
},
{
"move":{
"loyalty.hul":6
}
},
{
"wire":"EMERGENCY THERMAL PURCHASE TO WIDEN THE MARGIN"
}
],
"result":"Fixture events margin_thin events/margin_thin/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events margin_thin events/margin_thin/choices/1/label",
"note":"Fixture events margin_thin events/margin_thin/choices/1/note",
"effects":[
{
"move":{
"thermal_margin":-2
}
},
{
"move":{
"public_standing":-4
}
},
{
"move":{
"loyalty.hul":-8
}
},
{
"wire":"PM DECLINES THERMAL PURCHASE; DEPARTMENT WITHDRAWS CERTIFICATION"
}
],
"result":"Fixture events margin_thin events/margin_thin/choices/1/result"
}
]
},
{
"id":"the_vacant_post",
"chapter":2,
"weight":68,
"once":true,
"when":{
"postVacant":[
"treasury"
]
},
"title":"Fixture events the_vacant_post events/the_vacant_post/title",
"speaker":"whitlam",
"body":"Fixture events the_vacant_post events/the_vacant_post/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_vacant_post events/the_vacant_post/choices/0/label",
"note":"Fixture events the_vacant_post events/the_vacant_post/choices/0/note",
"effects":[
{
"cabinet":{
"treasury":{
"holder":"skye",
"party":"cu"
}
}
},
{
"move":{
"public_standing":3
}
},
{
"wire":"TREASURY BRIEF FILLED"
}
],
"result":"Fixture events the_vacant_post events/the_vacant_post/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_vacant_post events/the_vacant_post/choices/1/label",
"note":"Fixture events the_vacant_post events/the_vacant_post/choices/1/note",
"effects":[
{
"flag":"treasury_left_vacant"
},
{
"move":{
"public_standing":-5
}
}
],
"result":"Fixture events the_vacant_post events/the_vacant_post/choices/1/result"
}
]
},
{
"id":"signatures_build",
"chapter":2,
"weight":74,
"once":true,
"when":{
"signaturesAtLeast":6
},
"title":"Fixture events signatures_build events/signatures_build/title",
"speaker":"ceyhan",
"body":"Fixture events signatures_build events/signatures_build/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events signatures_build events/signatures_build/choices/0/label",
"note":"Fixture events signatures_build events/signatures_build/choices/0/note",
"effects":[
{
"move":{
"loyalty.cu_maintenance":7
}
},
{
"move":{
"loyalty.cu_halloran":4
}
},
{
"move":{
"public_standing":-3
}
},
{
"wire":"PM MEETS SIGNATORIES OF BACKBENCH LETTER"
}
],
"result":"Fixture events signatures_build events/signatures_build/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events signatures_build events/signatures_build/choices/1/label",
"note":"Fixture events signatures_build events/signatures_build/choices/1/note",
"effects":[
{
"move":{
"loyalty.cu_loyalists":6
}
},
{
"move":{
"loyalty.cu_maintenance":-8
}
},
{
"wire":"PM WARNS THE BACKBENCH OVER LEADERSHIP LETTER"
}
],
"result":"Fixture events signatures_build events/signatures_build/choices/1/result"
}
]
},
{
"id":"a_partner_in_debt",
"chapter":2,
"weight":70,
"once":true,
"when":{
"capitalBelow":{
"rv":-2
}
},
"title":"Fixture events a_partner_in_debt events/a_partner_in_debt/title",
"speaker":"park",
"body":"Fixture events a_partner_in_debt events/a_partner_in_debt/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events a_partner_in_debt events/a_partner_in_debt/choices/0/label",
"note":"Fixture events a_partner_in_debt events/a_partner_in_debt/choices/0/note",
"effects":[
{
"move":{
"capital.rv":3
}
},
{
"move":{
"loyalty.rv":9
}
},
{
"move":{
"public_standing":-2
}
}
],
"result":"Fixture events a_partner_in_debt events/a_partner_in_debt/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events a_partner_in_debt events/a_partner_in_debt/choices/1/label",
"note":"Fixture events a_partner_in_debt events/a_partner_in_debt/choices/1/note",
"effects":[
{
"move":{
"capital.rv":-1
}
},
{
"move":{
"loyalty.rv":-8
}
},
{
"move":{
"party_loyalty":4
}
}
],
"result":"Fixture events a_partner_in_debt events/a_partner_in_debt/choices/1/result"
}
]
},
{
"id":"the_licensing_reaction",
"chapter":2,
"weight":82,
"once":true,
"when":{
"siInForce":[
"si_2080_44"
]
},
"title":"Fixture events the_licensing_reaction events/the_licensing_reaction/title",
"speaker":"gb_chair",
"body":"Fixture events the_licensing_reaction events/the_licensing_reaction/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_licensing_reaction events/the_licensing_reaction/choices/0/label",
"note":"Fixture events the_licensing_reaction events/the_licensing_reaction/choices/0/note",
"effects":[
{
"move":{
"rel.gb_chair":10
}
},
{
"move":{
"loyalty.gb":6
}
},
{
"move":{
"public_standing":-3
}
},
{
"wire":"STANDARDS BRIEF OFFERED TO THE LICENSING PANEL"
}
],
"result":"Fixture events the_licensing_reaction events/the_licensing_reaction/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_licensing_reaction events/the_licensing_reaction/choices/1/label",
"note":"Fixture events the_licensing_reaction events/the_licensing_reaction/choices/1/note",
"effects":[
{
"move":{
"rel.gb_chair":-8
}
},
{
"move":{
"loyalty.hul":4
}
}
],
"result":"Fixture events the_licensing_reaction events/the_licensing_reaction/choices/1/result"
}
]
},
{
"id":"the_tribunal",
"chapter":2,
"weight":74,
"once":true,
"when":{
"billStage":{
"divergence":"committee"
},
"flagsAbsent":[
"tribunal_established",
"federal_schedule",
"tribunal_refused"
]
},
"title":"Fixture events the_tribunal events/the_tribunal/title",
"speaker":"fenwick",
"body":"Fixture events the_tribunal events/the_tribunal/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_tribunal events/the_tribunal/choices/0/label",
"note":"Fixture events the_tribunal events/the_tribunal/choices/0/note",
"effects":[
{
"flag":"tribunal_established"
},
{
"move":{
"public_standing":-6
}
},
{
"move":{
"loyalty.psa":-12
}
},
{
"move":{
"loyalty.gb":5
}
},
{
"wire":"TRIBUNAL ESTABLISHED ON THE DIVERGENCE QUESTION"
}
],
"result":"Fixture events the_tribunal events/the_tribunal/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_tribunal events/the_tribunal/choices/1/label",
"note":"Fixture events the_tribunal events/the_tribunal/choices/1/note",
"effects":[
{
"flag":"tribunal_refused"
},
{
"move":{
"loyalty.cu_maintenance":5
}
},
{
"move":{
"public_standing":2
}
}
],
"result":"Fixture events the_tribunal events/the_tribunal/choices/1/result"
}
]
},
{
"id":"the_federal_option",
"chapter":2,
"weight":72,
"once":true,
"when":{
"signaturesAtLeast":3,
"flagsAbsent":[
"tribunal_established",
"federal_schedule",
"federal_refused"
]
},
"title":"Fixture events the_federal_option events/the_federal_option/title",
"speaker":"laughon",
"body":"Fixture events the_federal_option events/the_federal_option/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_federal_option events/the_federal_option/choices/0/label",
"note":"Fixture events the_federal_option events/the_federal_option/choices/0/note",
"effects":[
{
"flag":"federal_schedule"
},
{
"move":{
"loyalty.sc":8
}
},
{
"move":{
"loyalty.cu_maintenance":-6
}
},
{
"move":{
"public_standing":-4
}
},
{
"wire":"FEDERAL SCHEDULE: EACH STATION TO SET ITS OWN THRESHOLD"
}
],
"result":"Fixture events the_federal_option events/the_federal_option/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_federal_option events/the_federal_option/choices/1/label",
"note":"Fixture events the_federal_option events/the_federal_option/choices/1/note",
"effects":[
{
"flag":"federal_refused"
},
{
"move":{
"loyalty.sc":-8
}
},
{
"move":{
"public_standing":3
}
}
],
"result":"Fixture events the_federal_option events/the_federal_option/choices/1/result"
}
]
},
{
"id":"the_deputy_warns",
"chapter":2,
"weight":69,
"once":true,
"when":{
"loyaltyBelow":{
"psa":38
}
},
"title":"Fixture events the_deputy_warns events/the_deputy_warns/title",
"speaker":"trottier",
"body":"Fixture events the_deputy_warns events/the_deputy_warns/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_deputy_warns events/the_deputy_warns/choices/0/label",
"note":"Fixture events the_deputy_warns events/the_deputy_warns/choices/0/note",
"effects":[
{
"move":{
"capital.psa":2
}
},
{
"move":{
"loyalty.psa":8
}
},
{
"move":{
"public_standing":-2
}
}
],
"result":"Fixture events the_deputy_warns events/the_deputy_warns/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_deputy_warns events/the_deputy_warns/choices/1/label",
"note":"Fixture events the_deputy_warns events/the_deputy_warns/choices/1/note",
"effects":[
{
"move":{
"loyalty.psa":-6
}
},
{
"move":{
"party_loyalty":3
}
}
],
"result":"Fixture events the_deputy_warns events/the_deputy_warns/choices/1/result"
}
]
},
{
"id":"one_g_waiting",
"chapter":2,
"weight":59,
"once":true,
"when":{
"loyaltyAbove":{
"des":15
}
},
"title":"Fixture events one_g_waiting events/one_g_waiting/title",
"speaker":"edelstein_powell",
"body":"Fixture events one_g_waiting events/one_g_waiting/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events one_g_waiting events/one_g_waiting/choices/0/label",
"note":"Fixture events one_g_waiting events/one_g_waiting/choices/0/note",
"effects":[
{
"move":{
"loyalty.des":7
}
},
{
"move":{
"public_standing":3
}
},
{
"move":{
"solvency":-3000
}
}
],
"result":"Fixture events one_g_waiting events/one_g_waiting/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events one_g_waiting events/one_g_waiting/choices/1/label",
"note":"Fixture events one_g_waiting events/one_g_waiting/choices/1/note",
"effects":[
{
"move":{
"loyalty.des":-6
}
},
{
"move":{
"loyalty.hul":3
}
}
],
"result":"Fixture events one_g_waiting events/one_g_waiting/choices/1/result"
}
]
},
{
"id":"ch3_dissolution",
"chapter":2,
"weight":96,
"once":true,
"setpiece":{
"title":"Fixture events ch3_dissolution events/ch3_dissolution/setpiece/title"
},
"when":{
"dissolved":true
},
"title":"Fixture events ch3_dissolution events/ch3_dissolution/title",
"speaker":null,
"body":"Fixture events ch3_dissolution events/ch3_dissolution/body",
"choices":[
{
"label":"Fixture events ch3_dissolution events/ch3_dissolution/choices/0/label",
"effects":[
{
"chapter":3
}
],
"result":"Fixture events ch3_dissolution events/ch3_dissolution/choices/0/result"
}
]
},
{
"id":"ch3_the_campaign",
"chapter":3,
"prologue":1,
"once":true,
"title":"Fixture events ch3_the_campaign events/ch3_the_campaign/title",
"speaker":"ceyhan",
"body":"Fixture events ch3_the_campaign events/ch3_the_campaign/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/0/label",
"when":{
"scalarAbove":{
"legitimacy":54
}
},
"note":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/0/note",
"effects":[
{
"move":{
"public_standing":7
}
},
{
"move":{
"loyalty.cu_maintenance":3
}
}
],
"result":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/1/label",
"when":{
"scalarBelow":{
"legitimacy":55
}
},
"note":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/1/note",
"effects":[
{
"move":{
"public_standing":-3
}
},
{
"move":{
"loyalty.cu_maintenance":3
}
}
],
"result":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/2/label",
"note":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/2/note",
"effects":[
{
"move":{
"public_standing":3
}
},
{
"move":{
"loyalty.psa":4
}
}
],
"result":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/2/result"
},
{
"posture":"bold",
"label":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/3/label",
"note":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/3/note",
"effects":[
{
"move":{
"public_standing":6
}
},
{
"move":{
"legitimacy":-5
}
}
],
"result":"Fixture events ch3_the_campaign events/ch3_the_campaign/choices/3/result"
}
]
},
{
"id":"ch3_open_question",
"chapter":3,
"prologue":2,
"once":true,
"when":{
"resolved":false
},
"title":"Fixture events ch3_open_question events/ch3_open_question/title",
"speaker":null,
"body":"Fixture events ch3_open_question events/ch3_open_question/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch3_open_question events/ch3_open_question/choices/0/label",
"act":"Say it",
"when":{
"scalarAbove":{
"public_standing":49
}
},
"note":"Fixture events ch3_open_question events/ch3_open_question/choices/0/note",
"effects":[
{
"move":{
"public_standing":7
}
},
{
"move":{
"loyalty.psa":5
}
},
{
"move":{
"loyalty.cu_maintenance":-4
}
},
{
"wire":"PM PUTS THE OPEN QUESTION AT THE CENTRE OF THE CAMPAIGN"
}
],
"result":"Fixture events ch3_open_question events/ch3_open_question/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ch3_open_question events/ch3_open_question/choices/1/label",
"act":"Say it",
"when":{
"scalarBelow":{
"public_standing":50
}
},
"note":"Fixture events ch3_open_question events/ch3_open_question/choices/1/note",
"effects":[
{
"move":{
"public_standing":-4
}
},
{
"move":{
"loyalty.psa":5
}
},
{
"move":{
"loyalty.cu_maintenance":-4
}
},
{
"wire":"PM PUTS THE OPEN QUESTION AT THE CENTRE OF THE CAMPAIGN"
}
],
"result":"Fixture events ch3_open_question events/ch3_open_question/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_open_question events/ch3_open_question/choices/2/label",
"note":"Fixture events ch3_open_question events/ch3_open_question/choices/2/note",
"effects":[
{
"move":{
"public_standing":2
}
},
{
"move":{
"loyalty.cu_maintenance":4
}
},
{
"move":{
"loyalty.psa":-5
}
},
{
"wire":"PM CAMPAIGNS ON THE RECORD, NOT THE QUESTION"
}
],
"result":"Fixture events ch3_open_question events/ch3_open_question/choices/2/result"
}
]
},
{
"id":"ch3_manifestos",
"chapter":3,
"prologue":3,
"once":true,
"when":{
"resolved":false
},
"title":"Fixture events ch3_manifestos events/ch3_manifestos/title",
"speaker":"ceyhan",
"body":"Fixture events ch3_manifestos events/ch3_manifestos/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch3_manifestos events/ch3_manifestos/choices/0/label",
"note":"Fixture events ch3_manifestos events/ch3_manifestos/choices/0/note",
"effects":[
{
"move":{
"public_standing":4
}
},
{
"move":{
"legitimacy":3
}
},
{
"move":{
"loyalty.cu_maintenance":-3
}
},
{
"wire":"GOVERNMENT PRINTS ITS ANSWER TO THE OPEN QUESTION"
}
],
"result":"Fixture events ch3_manifestos events/ch3_manifestos/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_manifestos events/ch3_manifestos/choices/1/label",
"note":"Fixture events ch3_manifestos events/ch3_manifestos/choices/1/note",
"effects":[
{
"move":{
"party_loyalty":4
}
},
{
"move":{
"public_standing":-3
}
},
{
"wire":"GOVERNMENT MANIFESTO AVOIDS THE QUESTION; BENCHES DIVIDED"
}
],
"result":"Fixture events ch3_manifestos events/ch3_manifestos/choices/1/result"
}
]
},
{
"id":"ch3_the_wire",
"chapter":3,
"prologue":4,
"once":true,
"when":{
"scalarAbove":{
"friction":50
}
},
"title":"Fixture events ch3_the_wire events/ch3_the_wire/title",
"speaker":"landry",
"body":"Fixture events ch3_the_wire events/ch3_the_wire/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch3_the_wire events/ch3_the_wire/choices/0/label",
"note":"Fixture events ch3_the_wire events/ch3_the_wire/choices/0/note",
"effects":[
{
"move":{
"friction":-3
}
},
{
"move":{
"legitimacy":3
}
},
{
"wire":"PM ANSWERS THE FOREIGN READING OF THE CAMPAIGN"
}
],
"result":"Fixture events ch3_the_wire events/ch3_the_wire/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_the_wire events/ch3_the_wire/choices/1/label",
"note":"Fixture events ch3_the_wire events/ch3_the_wire/choices/1/note",
"effects":[
{
"move":{
"friction":2
}
},
{
"move":{
"public_standing":3
}
},
{
"wire":"PM KEEPS THE CAMPAIGN DOMESTIC; THE WIRE KEEPS SCORE"
}
],
"result":"Fixture events ch3_the_wire events/ch3_the_wire/choices/1/result"
}
]
},
{
"id":"ch3_the_benches",
"chapter":3,
"prologue":5,
"once":true,
"when":{
"scalarBelow":{
"party_loyalty":40
}
},
"title":"Fixture events ch3_the_benches events/ch3_the_benches/title",
"speaker":"okarie",
"body":"Fixture events ch3_the_benches events/ch3_the_benches/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch3_the_benches events/ch3_the_benches/choices/0/label",
"note":"Fixture events ch3_the_benches events/ch3_the_benches/choices/0/note",
"effects":[
{
"move":{
"party_loyalty":5
}
},
{
"move":{
"public_standing":2
}
},
{
"move":{
"solvency":-3000
}
},
{
"wire":"GOVERNMENT PUTS THE WHOLE PARTY INTO THE CAMPAIGN"
}
],
"result":"Fixture events ch3_the_benches events/ch3_the_benches/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_the_benches events/ch3_the_benches/choices/1/label",
"note":"Fixture events ch3_the_benches events/ch3_the_benches/choices/1/note",
"effects":[
{
"move":{
"loyalty.cu_loyalists":3
}
},
{
"move":{
"party_loyalty":-3
}
},
{
"wire":"PM CAMPAIGNS FROM THE CENTRE; BENCHES LEFT TO THEMSELVES"
}
],
"result":"Fixture events ch3_the_benches events/ch3_the_benches/choices/1/result"
}
]
},
{
"id":"ch3_the_airwaves",
"chapter":3,
"prologue":6,
"once":true,
"title":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/title",
"speaker":"watkins",
"body":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/0/label",
"when":{
"scalarAbove":{
"legitimacy":54
}
},
"note":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/0/note",
"effects":[
{
"move":{
"public_standing":6
}
},
{
"move":{
"loyalty.cu_maintenance":3
}
},
{
"wire":"PM DEFENDS THE RECORD IN THE LEADERS' DEBATE"
}
],
"result":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/1/label",
"when":{
"scalarBelow":{
"legitimacy":55
}
},
"note":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/1/note",
"effects":[
{
"move":{
"public_standing":-4
}
},
{
"move":{
"loyalty.cu_maintenance":3
}
},
{
"wire":"PM DEFENDS THE RECORD IN THE LEADERS' DEBATE"
}
],
"result":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/2/label",
"note":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/2/note",
"effects":[
{
"move":{
"public_standing":3
}
},
{
"move":{
"legitimacy":-3
}
},
{
"move":{
"loyalty.psa":4
}
},
{
"wire":"PM ATTACKS THE OPPOSITION'S ANSWER IN THE DEBATE"
}
],
"result":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/2/result"
},
{
"posture":"measured",
"label":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/3/label",
"note":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/3/note",
"effects":[
{
"move":{
"public_standing":4
}
},
{
"move":{
"legitimacy":4
}
},
{
"move":{
"party_loyalty":-4
}
},
{
"wire":"PM CONCEDES MISTAKES IN THE LEADERS' DEBATE"
}
],
"result":"Fixture events ch3_the_airwaves events/ch3_the_airwaves/choices/3/result"
}
]
},
{
"id":"ch3_the_ground",
"chapter":3,
"prologue":8,
"once":true,
"title":"Fixture events ch3_the_ground events/ch3_the_ground/title",
"speaker":null,
"body":"Fixture events ch3_the_ground events/ch3_the_ground/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch3_the_ground events/ch3_the_ground/choices/0/label",
"note":"Fixture events ch3_the_ground events/ch3_the_ground/choices/0/note",
"effects":[
{
"move":{
"standing.ring":9
}
},
{
"move":{
"solvency":-4000
}
},
{
"wire":"GOVERNMENT SPENDS THE LAST WEEK ON THE RING"
}
],
"result":"Fixture events ch3_the_ground events/ch3_the_ground/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events ch3_the_ground events/ch3_the_ground/choices/1/label",
"note":"Fixture events ch3_the_ground events/ch3_the_ground/choices/1/note",
"effects":[
{
"move":{
"standing.low":9
}
},
{
"move":{
"loyalty.cu_maintenance":3
}
},
{
"move":{
"solvency":-2000
}
},
{
"wire":"GOVERNMENT HOLDS ITS GROUND IN THE LOW BAND"
}
],
"result":"Fixture events ch3_the_ground events/ch3_the_ground/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events ch3_the_ground events/ch3_the_ground/choices/2/label",
"note":"Fixture events ch3_the_ground events/ch3_the_ground/choices/2/note",
"effects":[
{
"move":{
"public_standing":3
}
},
{
"move":{
"solvency":-4000
}
},
{
"wire":"GOVERNMENT SPREADS ITS LAST WEEK ACROSS THE COMMONWEALTH"
}
],
"result":"Fixture events ch3_the_ground events/ch3_the_ground/choices/2/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_the_ground events/ch3_the_ground/choices/3/label",
"note":"Fixture events ch3_the_ground events/ch3_the_ground/choices/3/note",
"effects":[
{
"move":{
"party_loyalty":2
}
},
{
"wire":"GOVERNMENT KEEPS ITS MONEY IN THE LAST WEEK"
}
],
"result":"Fixture events ch3_the_ground events/ch3_the_ground/choices/3/result"
}
]
},
{
"id":"ch3_the_count",
"chapter":3,
"prologue":9,
"once":true,
"setpiece":{
"title":"Fixture events ch3_the_count events/ch3_the_count/setpiece/title"
},
"title":"Fixture events ch3_the_count events/ch3_the_count/title",
"speaker":null,
"body":"Fixture events ch3_the_count events/ch3_the_count/body",
"choices":[
{
"label":"Fixture events ch3_the_count events/ch3_the_count/choices/0/label",
"effects":[
{
"flag":"campaign_done"
},
{
"wire":"RETURNS COMPLETE: THE NEW HOUSE WILL SIT NEXT SESSION"
}
],
"result":"Fixture events ch3_the_count events/ch3_the_count/choices/0/result"
}
]
},
{
"id":"ch4_settled",
"chapter":2,
"weight":97,
"once":true,
"setpiece":{
"title":"Fixture events ch4_settled events/ch4_settled/setpiece/title"
},
"when":{
"resolved":true,
"dissolved":false
},
"title":"Fixture events ch4_settled events/ch4_settled/title",
"speaker":null,
"body":"Fixture events ch4_settled events/ch4_settled/body",
"choices":[
{
"label":"Fixture events ch4_settled events/ch4_settled/choices/0/label",
"effects":[

],
"result":"Fixture events ch4_settled events/ch4_settled/choices/0/result"
}
]
},
{
"id":"ch4_after",
"chapter":2,
"weight":96,
"once":true,
"setpiece":{
"title":"Fixture events ch4_after events/ch4_after/setpiece/title"
},
"when":{
"seen":[
"ch4_settled"
],
"dissolved":false
},
"title":"Fixture events ch4_after events/ch4_after/title",
"speaker":null,
"body":"Fixture events ch4_after events/ch4_after/body",
"choices":[
{
"label":"Fixture events ch4_after events/ch4_after/choices/0/label",
"effects":[

],
"result":"Fixture events ch4_after events/ch4_after/choices/0/result"
}
]
},
{
"id":"ch4_the_answer",
"chapter":2,
"weight":95,
"once":true,
"when":{
"seen":[
"ch4_after"
],
"dissolved":false
},
"title":"Fixture events ch4_the_answer events/ch4_the_answer/title",
"speaker":null,
"body":"Fixture events ch4_the_answer events/ch4_the_answer/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch4_the_answer events/ch4_the_answer/choices/0/label",
"note":"Fixture events ch4_the_answer events/ch4_the_answer/choices/0/note",
"effects":[
{
"move":{
"public_standing":4
}
},
{
"move":{
"loyalty.psa":3
}
},
{
"wire":"PM DEFENDS THE SETTLEMENT IN PUBLIC"
}
],
"result":"Fixture events ch4_the_answer events/ch4_the_answer/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch4_the_answer events/ch4_the_answer/choices/1/label",
"note":"Fixture events ch4_the_answer events/ch4_the_answer/choices/1/note",
"effects":[
{
"move":{
"loyalty.cu_maintenance":4
}
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"PM LETS THE SETTLEMENT STAND WITHOUT A CAMPAIGN"
}
],
"result":"Fixture events ch4_the_answer events/ch4_the_answer/choices/1/result"
}
]
},
{
"id":"ch4_the_losers",
"chapter":2,
"weight":94,
"once":true,
"when":{
"seen":[
"ch4_the_answer"
],
"dissolved":false
},
"title":"Fixture events ch4_the_losers events/ch4_the_losers/title",
"speaker":"watkins",
"body":"Fixture events ch4_the_losers events/ch4_the_losers/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ch4_the_losers events/ch4_the_losers/choices/0/label",
"note":"Fixture events ch4_the_losers events/ch4_the_losers/choices/0/note",
"effects":[
{
"move":{
"loyalty.cl":6
}
},
{
"move":{
"loyalty.cu_loyalists":-3
}
},
{
"wire":"GOVERNMENT SHARES THE SETTLEMENT'S ADMINISTRATION WITH THE LOSERS"
}
],
"result":"Fixture events ch4_the_losers events/ch4_the_losers/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ch4_the_losers events/ch4_the_losers/choices/1/label",
"note":"Fixture events ch4_the_losers events/ch4_the_losers/choices/1/note",
"effects":[
{
"move":{
"party_loyalty":4
}
},
{
"move":{
"loyalty.cl":-4
}
},
{
"move":{
"public_standing":3
}
},
{
"wire":"GOVERNMENT PRESSES ITS ADVANTAGE AFTER THE SETTLEMENT"
}
],
"result":"Fixture events ch4_the_losers events/ch4_the_losers/choices/1/result"
}
]
},
{
"id":"ch4_the_ledger",
"chapter":2,
"weight":93,
"once":true,
"when":{
"seen":[
"ch4_the_losers"
],
"dissolved":false,
"scalarBelow":{
"solvency":45000
}
},
"title":"Fixture events ch4_the_ledger events/ch4_the_ledger/title",
"speaker":"hatt",
"body":"Fixture events ch4_the_ledger events/ch4_the_ledger/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch4_the_ledger events/ch4_the_ledger/choices/0/label",
"note":"Fixture events ch4_the_ledger events/ch4_the_ledger/choices/0/note",
"effects":[
{
"move":{
"public_standing":3
}
},
{
"move":{
"legitimacy":3
}
},
{
"move":{
"solvency":-6000
}
},
{
"wire":"GOVERNMENT PAYS THE SETTLEMENT'S BILL AT THE ESTIMATES"
}
],
"result":"Fixture events ch4_the_ledger events/ch4_the_ledger/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch4_the_ledger events/ch4_the_ledger/choices/1/label",
"note":"Fixture events ch4_the_ledger events/ch4_the_ledger/choices/1/note",
"effects":[
{
"move":{
"loyalty.cu_maintenance":-5
}
},
{
"move":{
"public_standing":-3
}
},
{
"wire":"SETTLEMENT COSTS DEFERRED TO THE NEXT SESSION"
}
],
"result":"Fixture events ch4_the_ledger events/ch4_the_ledger/choices/1/result"
}
]
},
{
"id":"ch4_the_next",
"chapter":2,
"weight":92,
"once":true,
"when":{
"seen":[
"ch4_the_losers"
],
"dissolved":false
},
"title":"Fixture events ch4_the_next events/ch4_the_next/title",
"speaker":"ansar",
"body":"Fixture events ch4_the_next events/ch4_the_next/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch4_the_next events/ch4_the_next/choices/0/label",
"note":"Fixture events ch4_the_next events/ch4_the_next/choices/0/note",
"effects":[
{
"move":{
"loyalty.psa":4
}
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"GOVERNMENT OPENS THE NEXT QUESTION AFTER THE SETTLEMENT"
}
],
"result":"Fixture events ch4_the_next events/ch4_the_next/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch4_the_next events/ch4_the_next/choices/1/label",
"note":"Fixture events ch4_the_next events/ch4_the_next/choices/1/note",
"effects":[
{
"move":{
"loyalty.cu_maintenance":5
}
},
{
"move":{
"party_loyalty":3
}
},
{
"wire":"GOVERNMENT CHOOSES A QUIET SESSION AFTER THE SETTLEMENT"
}
],
"result":"Fixture events ch4_the_next events/ch4_the_next/choices/1/result"
}
]
},
{
"id":"gb_carveout_broken",
"chapter":2,
"queuedOnly":true,
"once":true,
"when":{
"breached":[
"licensure_carveout"
]
},
"title":"Fixture events gb_carveout_broken events/gb_carveout_broken/title",
"speaker":"gb_chair",
"body":"Fixture events gb_carveout_broken events/gb_carveout_broken/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events gb_carveout_broken events/gb_carveout_broken/choices/0/label",
"when":{
"holds":{
"attestation_registry":[
"preiss",
"okarie"
]
}
},
"note":"Fixture events gb_carveout_broken events/gb_carveout_broken/choices/0/note",
"effects":[
{
"move":{
"rel.gb_chair":4
}
},
{
"move":{
"legitimacy":-4
}
},
{
"si":"si_2080_45"
},
{
"wire":"PM CONCEDES THE LICENSING DELAY AND LAYS THE ORDER"
}
],
"result":"Fixture events gb_carveout_broken events/gb_carveout_broken/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events gb_carveout_broken events/gb_carveout_broken/choices/1/label",
"note":"Fixture events gb_carveout_broken events/gb_carveout_broken/choices/1/note",
"effects":[
{
"move":{
"rel.gb_chair":-8
}
},
{
"move":{
"loyalty.gb":-8
}
},
{
"move":{
"legitimacy":-6
}
},
{
"wire":"GOVERNMENT ABANDONS THE CARVE-OUT; GUILD BENCH DISENGAGES"
}
],
"result":"Fixture events gb_carveout_broken events/gb_carveout_broken/choices/1/result"
}
]
},
{
"id":"fa_window_closes",
"chapter":2,
"weight":58,
"maxFires":2,
"title":"Fixture events fa_window_closes events/fa_window_closes/title",
"speaker":null,
"body":"Fixture events fa_window_closes events/fa_window_closes/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events fa_window_closes events/fa_window_closes/choices/0/label",
"note":"Fixture events fa_window_closes events/fa_window_closes/choices/0/note",
"effects":[
{
"move":{
"price.transit":4
}
},
{
"move":{
"solvency":-8000
}
},
{
"move":{
"loyalty.cl":5
}
},
{
"wire":"COMMONWEALTH PAYS TO KEEP THE EARTH-SIDE WINDOW OPEN (as of 9 days ago)"
}
],
"result":"Fixture events fa_window_closes events/fa_window_closes/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events fa_window_closes events/fa_window_closes/choices/1/label",
"note":"Fixture events fa_window_closes events/fa_window_closes/choices/1/note",
"effects":[
{
"move":{
"price.transit":9
}
},
{
"move":{
"public_standing":4
}
},
{
"move":{
"loyalty.hul":6
}
},
{
"wire":"PM: THE COMMONWEALTH WILL SCHEDULE ITS OWN TRANSIT (as of 9 days ago)"
}
],
"result":"Fixture events fa_window_closes events/fa_window_closes/choices/1/result"
}
]
},
{
"id":"fa_freight_reacts",
"chapter":2,
"weight":56,
"maxFires":2,
"when":{
"priceAbove":{
"transit":105
}
},
"title":"Fixture events fa_freight_reacts events/fa_freight_reacts/title",
"speaker":"hatt",
"body":"Fixture events fa_freight_reacts events/fa_freight_reacts/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events fa_freight_reacts events/fa_freight_reacts/choices/0/label",
"note":"Fixture events fa_freight_reacts events/fa_freight_reacts/choices/0/note",
"effects":[
{
"move":{
"consumables":4
}
},
{
"move":{
"solvency":-10000
}
},
{
"move":{
"loyalty.psa":5
}
},
{
"wire":"TRANSIT DIFFERENTIAL SUBSIDISED FOR CONSUMABLES RUNS"
}
],
"result":"Fixture events fa_freight_reacts events/fa_freight_reacts/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events fa_freight_reacts events/fa_freight_reacts/choices/1/label",
"note":"Fixture events fa_freight_reacts events/fa_freight_reacts/choices/1/note",
"effects":[
{
"move":{
"public_standing":-5
}
},
{
"move":{
"loyalty.cu_maintenance":-6
}
},
{
"station":{
"perigee":{
"closure":-0.02
},
"sinter":{
"closure":-0.02
}
}
},
{
"wire":"PM DECLINES TRANSIT SUBSIDY; OUTER STATIONS WARN ON CLOSURE"
}
],
"result":"Fixture events fa_freight_reacts events/fa_freight_reacts/choices/1/result"
}
]
},
{
"id":"fa_anchor_terms",
"chapter":2,
"weight":76,
"once":true,
"when":{
"billStage":{
"anchor_kepler":"assent"
}
},
"title":"Fixture events fa_anchor_terms events/fa_anchor_terms/title",
"speaker":"landry",
"body":"Fixture events fa_anchor_terms events/fa_anchor_terms/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events fa_anchor_terms events/fa_anchor_terms/choices/0/label",
"note":"Fixture events fa_anchor_terms events/fa_anchor_terms/choices/0/note",
"effects":[
{
"move":{
"price.transit":12
}
},
{
"move":{
"solvency":-6000
}
},
{
"move":{
"rel.landry":6
}
},
{
"wire":"ANCHOR RENEWED ON THE HOST STATE'S TERMS; TRANSIT PRICE RISES"
}
],
"result":"Fixture events fa_anchor_terms events/fa_anchor_terms/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events fa_anchor_terms events/fa_anchor_terms/choices/1/label",
"note":"Fixture events fa_anchor_terms events/fa_anchor_terms/choices/1/note",
"effects":[
{
"move":{
"price.transit":20
}
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"flag":"anchor_refused"
},
{
"bill":{
"anchor_kepler":{
"stage":"second_reading",
"dead":false
}
}
},
{
"wire":"PM REFERS THE ANCHOR CONCESSION TO THE HOUSE; HOST STATE PROTESTS"
}
],
"result":"Fixture events fa_anchor_terms events/fa_anchor_terms/choices/1/result"
}
]
},
{
"id":"fa_dispatch_mars",
"chapter":2,
"weight":67,
"once":true,
"when":{
"actorBelow":{
"mars":60
},
"flagsAbsent":[
"mars_asked"
]
},
"title":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/title",
"speaker":"landry",
"body":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/choices/0/label",
"note":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/choices/0/note",
"effects":[
{
"flag":"mars_asked"
},
{
"queue":[
{
"event":"fa_mars_reply",
"after":11,
"label":"A dispatch to the Republic of Chryse and Nili"
}
]
},
{
"wire":"COMMONWEALTH DISPATCHES ITS POSITION ON THE METANATIONALS TO MARS"
}
],
"result":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/choices/1/label",
"note":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/choices/1/note",
"effects":[
{
"flag":"mars_asked"
},
{
"move":{
"actor.mars":-4
}
},
{
"move":{
"public_standing":2
}
},
{
"wire":"NO DISPATCH TO MARS; THE POSITION IS NOT YET SETTLED"
}
],
"result":"Fixture events fa_dispatch_mars events/fa_dispatch_mars/choices/1/result"
}
]
},
{
"id":"fa_mars_reply",
"queuedOnly":true,
"once":true,
"title":"Fixture events fa_mars_reply events/fa_mars_reply/title",
"speaker":null,
"body":"Fixture events fa_mars_reply events/fa_mars_reply/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events fa_mars_reply events/fa_mars_reply/choices/0/label",
"note":"Fixture events fa_mars_reply events/fa_mars_reply/choices/0/note",
"effects":[
{
"move":{
"actor.mars":6
}
},
{
"move":{
"public_standing":2
}
},
{
"wire":"THE COMMONWEALTH PUBLISHES THE MARTIAN REPLY IN FULL, WITH DATES"
}
],
"result":"Fixture events fa_mars_reply events/fa_mars_reply/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events fa_mars_reply events/fa_mars_reply/choices/1/label",
"note":"Fixture events fa_mars_reply events/fa_mars_reply/choices/1/note",
"effects":[
{
"move":{
"actor.mars":2
}
},
{
"move":{
"friction":-2
}
},
{
"wire":"PM ANSWERS MARS; THE CORRESPONDENCE CONTINUES AT ONE EXCHANGE EVERY THREE WEEKS"
}
],
"result":"Fixture events fa_mars_reply events/fa_mars_reply/choices/1/result"
}
]
},
{
"id":"fa_anchor_withdrawn",
"chapter":2,
"weight":72,
"once":true,
"when":{
"flags":[
"anchor_refused"
],
"flagsAbsent":[
"anchor_gone"
]
},
"title":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/title",
"speaker":"landry",
"body":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/choices/0/label",
"note":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/choices/0/note",
"effects":[
{
"flag":"anchor_gone"
},
{
"move":{
"price.transit":14
}
},
{
"move":{
"solvency":-14000
}
},
{
"move":{
"actor.earth_host":8
}
},
{
"wire":"COMMONWEALTH BUYS BACK THE INTERNATIONAL CONCESSION AT KENYA'S RATE"
}
],
"result":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/choices/1/label",
"note":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/choices/1/note",
"effects":[
{
"flag":"anchor_gone"
},
{
"flag":"anchor_independent"
},
{
"move":{
"price.transit":22
}
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.hul":7
}
},
{
"station":{
"perigee":{
"closure":-0.03
},
"nasmyth":{
"closure":-0.03
}
}
},
{
"wire":"PM: THE COMMONWEALTH WILL NOT RENT ITS LIFELINE (as of nine days ago)"
}
],
"result":"Fixture events fa_anchor_withdrawn events/fa_anchor_withdrawn/choices/1/result"
}
]
},
{
"id":"the_floor_presses",
"chapter":2,
"weight":62,
"maxFires":2,
"when":{
"scalarBelow":{
"consumables":52
}
},
"title":"Fixture events the_floor_presses events/the_floor_presses/title",
"speaker":"ansar",
"body":"Fixture events the_floor_presses events/the_floor_presses/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_floor_presses events/the_floor_presses/choices/0/label",
"note":"Fixture events the_floor_presses events/the_floor_presses/choices/0/note",
"effects":[
{
"move":{
"consumables":7
}
},
{
"move":{
"solvency":-9000
}
},
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"move":{
"loyalty.psa":5
}
},
{
"wire":"QUARTERLY LIFT RESTORED FROM THE RESERVE"
}
],
"result":"Fixture events the_floor_presses events/the_floor_presses/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_floor_presses events/the_floor_presses/choices/1/label",
"note":"Fixture events the_floor_presses events/the_floor_presses/choices/1/note",
"effects":[
{
"move":{
"consumables":-3
}
},
{
"move":{
"public_standing":-6
}
},
{
"move":{
"loyalty.cu_maintenance":-8
}
},
{
"station":{
"ashfield":{
"closure":-0.02
},
"drift":{
"closure":-0.02
}
}
},
{
"wire":"CONSUMABLES LIFT CUT ON THE LOW-CLOSURE STATIONS"
}
],
"result":"Fixture events the_floor_presses events/the_floor_presses/choices/1/result"
}
]
},
{
"id":"quota_forward_settles",
"queuedOnly":true,
"once":true,
"setpiece":{
"title":"Fixture events quota_forward_settles events/quota_forward_settles/setpiece/title"
},
"title":"Fixture events quota_forward_settles events/quota_forward_settles/title",
"speaker":"hatt",
"body":"Fixture events quota_forward_settles events/quota_forward_settles/body",
"choices":[
{
"label":"Fixture events quota_forward_settles events/quota_forward_settles/choices/0/label",
"when":{
"flags":[
"quota_forward_small"
]
},
"effects":[
{
"move":{
"thermal_margin":-4
}
},
{
"move":{
"solvency":3000
}
},
{
"wire":"QUOTA FORWARD DELIVERED; THE MARGIN NARROWS A SLICE"
}
],
"result":"Fixture events quota_forward_settles events/quota_forward_settles/choices/0/result"
},
{
"label":"Fixture events quota_forward_settles events/quota_forward_settles/choices/1/label",
"when":{
"flags":[
"quota_forward_full"
]
},
"effects":[
{
"move":{
"thermal_margin":-11
}
},
{
"move":{
"solvency":6000
}
},
{
"wire":"FULL QUOTA FORWARD DELIVERED; THE MARGIN NARROWS SHARPLY"
}
],
"result":"Fixture events quota_forward_settles events/quota_forward_settles/choices/1/result"
},
{
"label":"Fixture events quota_forward_settles events/quota_forward_settles/choices/2/label",
"when":{
"flagsAbsent":[
"quota_forward_small",
"quota_forward_full"
]
},
"effects":[
{
"move":{
"thermal_margin":-2
}
},
{
"wire":"QUOTA FORWARD DELIVERED"
}
],
"result":"Fixture events quota_forward_settles events/quota_forward_settles/choices/2/result"
}
]
},
{
"id":"volume_charter_settles",
"queuedOnly":true,
"once":true,
"setpiece":{
"title":"Fixture events volume_charter_settles events/volume_charter_settles/setpiece/title"
},
"title":"Fixture events volume_charter_settles events/volume_charter_settles/title",
"speaker":"vellan",
"body":"Fixture events volume_charter_settles events/volume_charter_settles/body",
"choices":[
{
"label":"Fixture events volume_charter_settles events/volume_charter_settles/choices/0/label",
"when":{
"flags":[
"charter_cash"
],
"priceAbove":{
"volume":108
}
},
"effects":[
{
"move":{
"solvency":-5000
}
},
{
"wire":"VOLUME LEASE RENEWED AS THE PRICE CLIMBS"
}
],
"result":"Fixture events volume_charter_settles events/volume_charter_settles/choices/0/result"
},
{
"label":"Fixture events volume_charter_settles events/volume_charter_settles/choices/1/label",
"when":{
"flags":[
"charter_cash"
],
"priceBelow":{
"volume":108.1
}
},
"effects":[
{
"move":{
"solvency":2000
}
},
{
"wire":"VOLUME LEASE RENEWED; HOMESTEAD PAYS IN CASH"
}
],
"result":"Fixture events volume_charter_settles events/volume_charter_settles/choices/1/result"
},
{
"label":"Fixture events volume_charter_settles events/volume_charter_settles/choices/2/label",
"when":{
"flags":[
"charter_closure"
],
"priceAbove":{
"volume":108
}
},
"effects":[
{
"move":{
"solvency":-4000
}
},
{
"move":{
"legitimacy":3
}
},
{
"wire":"HOMESTEAD RENEWS; THE OUTER BENCHES READ THE TERMS"
}
],
"result":"Fixture events volume_charter_settles events/volume_charter_settles/choices/2/result"
},
{
"label":"Fixture events volume_charter_settles events/volume_charter_settles/choices/3/label",
"when":{
"flags":[
"charter_closure"
],
"priceBelow":{
"volume":108.1
}
},
"effects":[
{
"move":{
"legitimacy":5
}
},
{
"wire":"HOMESTEAD'S CYCLE CLOSES FURTHER UNDER THE LEASE"
}
],
"result":"Fixture events volume_charter_settles events/volume_charter_settles/choices/3/result"
},
{
"label":"Fixture events volume_charter_settles events/volume_charter_settles/choices/4/label",
"when":{
"flagsAbsent":[
"charter_cash",
"charter_closure"
]
},
"effects":[
{
"wire":"THE VOLUME LEASE TERM ENDS"
}
],
"result":"Fixture events volume_charter_settles events/volume_charter_settles/choices/4/result"
}
]
},
{
"id":"the_minimum_berth",
"chapter":2,
"weight":64,
"once":true,
"title":"Fixture events the_minimum_berth events/the_minimum_berth/title",
"speaker":"vellan",
"body":"Fixture events the_minimum_berth events/the_minimum_berth/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_minimum_berth events/the_minimum_berth/choices/0/label",
"note":"Fixture events the_minimum_berth events/the_minimum_berth/choices/0/note",
"effects":[
{
"flag":"minimum_berth_laid"
},
{
"move":{
"price.volume":5
}
},
{
"move":{
"actor.forkrentiers":-8
}
},
{
"move":{
"loyalty.hul":6
}
},
{
"move":{
"loyalty.des":4
}
},
{
"move":{
"public_standing":4
}
},
{
"wire":"MINIMUM BERTH STANDARD LAID; LANDLORDS TO RECONFIGURE OR LOSE THE LET"
}
],
"result":"Fixture events the_minimum_berth events/the_minimum_berth/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_minimum_berth events/the_minimum_berth/choices/1/label",
"note":"Fixture events the_minimum_berth events/the_minimum_berth/choices/1/note",
"effects":[
{
"move":{
"price.volume":-6
}
},
{
"move":{
"actor.forkrentiers":6
}
},
{
"move":{
"consumables":-4
}
},
{
"move":{
"loyalty.cu":-3
}
},
{
"wire":"GOVERNMENT DECLINES A MINIMUM BERTH; THE PARTITION STANDS"
}
],
"result":"Fixture events the_minimum_berth events/the_minimum_berth/choices/1/result"
}
]
},
{
"id":"the_old_judge",
"chapter":2,
"weight":71,
"once":true,
"title":"Fixture events the_old_judge events/the_old_judge/title",
"speaker":"fenwick",
"body":"Fixture events the_old_judge events/the_old_judge/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_old_judge events/the_old_judge/choices/0/label",
"note":"Fixture events the_old_judge events/the_old_judge/choices/0/note",
"effects":[
{
"flag":"reclassification_to_boards"
},
{
"move":{
"actor.lb_legal":-6
}
},
{
"move":{
"loyalty.gb":6
}
},
{
"move":{
"loyalty.rv":-4
}
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"RECLASSIFICATION REFERRED TO THE LICENSING BOARDS"
}
],
"result":"Fixture events the_old_judge events/the_old_judge/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_old_judge events/the_old_judge/choices/1/label",
"note":"Fixture events the_old_judge events/the_old_judge/choices/1/note",
"effects":[
{
"flag":"reclassification_to_courts"
},
{
"move":{
"actor.lb_legal":7
}
},
{
"move":{
"rel.gb_chair":-5
}
},
{
"move":{
"loyalty.rv":5
}
},
{
"move":{
"loyalty.gb":-5
}
},
{
"wire":"RECLASSIFICATION IS A QUESTION OF FACT FOR THE COURTS"
}
],
"result":"Fixture events the_old_judge events/the_old_judge/choices/1/result"
}
]
},
{
"id":"the_agricultural_deck",
"chapter":2,
"weight":66,
"once":true,
"title":"Fixture events the_agricultural_deck events/the_agricultural_deck/title",
"speaker":null,
"body":"Fixture events the_agricultural_deck events/the_agricultural_deck/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_agricultural_deck events/the_agricultural_deck/choices/0/label",
"note":"Fixture events the_agricultural_deck events/the_agricultural_deck/choices/0/note",
"effects":[
{
"move":{
"solvency":-7000
}
},
{
"move":{
"consumables":6
}
},
{
"station":{
"wickstead":{
"closure":0.05
}
}
},
{
"move":{
"public_standing":5
}
},
{
"wire":"COMMONWEALTH FUNDS HARVEST DECK REFIT; SHORTFALL CARRIED"
}
],
"result":"Fixture events the_agricultural_deck events/the_agricultural_deck/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_agricultural_deck events/the_agricultural_deck/choices/1/label",
"note":"Fixture events the_agricultural_deck events/the_agricultural_deck/choices/1/note",
"effects":[
{
"move":{
"consumables":-5
}
},
{
"move":{
"solvency":2000
}
},
{
"move":{
"loyalty.hul":-4
}
},
{
"queue":[
{
"event":"the_deck_again",
"after":5
}
]
},
{
"wire":"HARVEST DECK HELD WITH TREATMENT; NO REFIT FUNDED"
}
],
"result":"Fixture events the_agricultural_deck events/the_agricultural_deck/choices/1/result"
}
]
},
{
"id":"the_deck_again",
"queuedOnly":true,
"once":true,
"title":"Fixture events the_deck_again events/the_deck_again/title",
"speaker":null,
"body":"Fixture events the_deck_again events/the_deck_again/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_deck_again events/the_deck_again/choices/0/label",
"note":"Fixture events the_deck_again events/the_deck_again/choices/0/note",
"effects":[
{
"move":{
"solvency":-11000
}
},
{
"move":{
"consumables":5
}
},
{
"station":{
"wickstead":{
"closure":0.04
}
}
},
{
"move":{
"public_standing":2
}
},
{
"wire":"HARVEST REFIT FUNDED AT THE SECOND ESTIMATE"
}
],
"result":"Fixture events the_deck_again events/the_deck_again/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_deck_again events/the_deck_again/choices/1/label",
"note":"Fixture events the_deck_again events/the_deck_again/choices/1/note",
"effects":[
{
"move":{
"consumables":-8
}
},
{
"station":{
"wickstead":{
"suspended":900
}
}
},
{
"move":{
"public_standing":-6
}
},
{
"move":{
"loyalty.hul":-8
}
},
{
"wire":"HARVEST BUYS IN ALL PROTEIN; DECK REFIT DEFERRED"
}
],
"result":"Fixture events the_deck_again events/the_deck_again/choices/1/result"
}
]
},
{
"id":"the_congregations",
"chapter":2,
"weight":60,
"once":true,
"title":"Fixture events the_congregations events/the_congregations/title",
"speaker":"marin",
"body":"Fixture events the_congregations events/the_congregations/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_congregations events/the_congregations/choices/0/label",
"note":"Fixture events the_congregations events/the_congregations/choices/0/note",
"effects":[
{
"flag":"congregations_answered"
},
{
"move":{
"loyalty.rv":9
}
},
{
"move":{
"actor.lb_legal":-3
}
},
{
"move":{
"public_standing":3
}
},
{
"wire":"REGISTER NOT REQUIRED FOR MARRIAGE, BURIAL OR SCHOOLING"
}
],
"result":"Fixture events the_congregations events/the_congregations/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events the_congregations events/the_congregations/choices/1/label",
"note":"Fixture events the_congregations events/the_congregations/choices/1/note",
"effects":[
{
"flag":"congregations_refused"
},
{
"move":{
"loyalty.rv":-12
}
},
{
"move":{
"loyalty.psa":4
}
},
{
"move":{
"actor.lb_legal":4
}
},
{
"move":{
"public_standing":-4
}
},
{
"wire":"GOVERNMENT LEAVES THE SACRAMENTS TO THE REGISTER"
}
],
"result":"Fixture events the_congregations events/the_congregations/choices/1/result"
}
]
},
{
"id":"the_pairing_offer",
"chapter":2,
"weight":59,
"once":true,
"when":{
"flagsAbsent":[
"pair_offered"
]
},
"title":"Fixture events the_pairing_offer events/the_pairing_offer/title",
"speaker":"okarie",
"body":"Fixture events the_pairing_offer events/the_pairing_offer/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_pairing_offer events/the_pairing_offer/choices/0/label",
"note":"Fixture events the_pairing_offer events/the_pairing_offer/choices/0/note",
"effects":[
{
"flag":"pair_offered"
},
{
"move":{
"rel.okarie":4
}
},
{
"move":{
"loyalty.cu_loyalists":2
}
},
{
"wire":"GOVERNMENT WHIPS AGREE TO A COURTESY PAIR FOR THURSDAY'S DIVISION"
}
],
"result":"Fixture events the_pairing_offer events/the_pairing_offer/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_pairing_offer events/the_pairing_offer/choices/1/label",
"note":"Fixture events the_pairing_offer events/the_pairing_offer/choices/1/note",
"effects":[
{
"move":{
"rel.okarie":-5
}
},
{
"move":{
"loyalty.cl":-5
}
},
{
"move":{
"public_standing":-3
}
},
{
"wire":"GOVERNMENT REFUSES A COURTESY PAIR; THE BENCHES NOTE IT"
}
],
"result":"Fixture events the_pairing_offer events/the_pairing_offer/choices/1/result"
}
]
},
{
"id":"the_pairing_kept",
"chapter":2,
"weight":56,
"once":true,
"when":{
"pairsKeptAtLeast":1
},
"title":"Fixture events the_pairing_kept events/the_pairing_kept/title",
"speaker":null,
"body":"Fixture events the_pairing_kept events/the_pairing_kept/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_pairing_kept events/the_pairing_kept/choices/0/label",
"note":"Fixture events the_pairing_kept events/the_pairing_kept/choices/0/note",
"effects":[
{
"move":{
"loyalty.cl":4
}
},
{
"move":{
"public_standing":3
}
},
{
"wire":"THE COURTESY PAIR IS BANKED AND NOT MENTIONED"
}
],
"result":"Fixture events the_pairing_kept events/the_pairing_kept/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_pairing_kept events/the_pairing_kept/choices/1/label",
"note":"Fixture events the_pairing_kept events/the_pairing_kept/choices/1/note",
"effects":[
{
"move":{
"loyalty.cl":-5
}
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"GOVERNMENT CALLS IN THE PAIR; THE OTHER SIDE PRICES IT"
}
],
"result":"Fixture events the_pairing_kept events/the_pairing_kept/choices/1/result"
}
]
},
{
"id":"tr_reference",
"chapter":2,
"weight":68,
"once":true,
"when":{
"flags":[
"reclassification_to_courts"
],
"flagsAbsent":[
"tr_referenced"
]
},
"title":"Fixture events tr_reference events/tr_reference/title",
"speaker":"fenwick",
"body":"Fixture events tr_reference events/tr_reference/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events tr_reference events/tr_reference/choices/0/label",
"cost":{
"slot":1
},
"note":"Fixture events tr_reference events/tr_reference/choices/0/note",
"effects":[
{
"flag":"tr_referenced"
},
{
"flag":"reference_answered"
},
{
"move":{
"actor.tribunal":10
}
},
{
"move":{
"legitimacy":4
}
},
{
"wire":"GOVERNMENT ANSWERS THE TRIBUNAL'S REFERENCE IN FULL"
}
],
"result":"Fixture events tr_reference events/tr_reference/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events tr_reference events/tr_reference/choices/1/label",
"note":"Fixture events tr_reference events/tr_reference/choices/1/note",
"effects":[
{
"flag":"tr_referenced"
},
{
"flag":"reference_ignored"
},
{
"move":{
"actor.tribunal":-12
}
},
{
"move":{
"legitimacy":-3
}
},
{
"wire":"GOVERNMENT DECLINES TO ANSWER THE TRIBUNAL'S REFERENCE"
}
],
"result":"Fixture events tr_reference events/tr_reference/choices/1/result"
}
]
},
{
"id":"tr_challenge_lodged",
"chapter":2,
"weight":66,
"once":true,
"when":{
"siInForce":[
"si_2080_44"
],
"flagsAbsent":[
"tr_challenged"
]
},
"title":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/title",
"speaker":"fenwick",
"body":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/choices/0/label",
"note":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/choices/0/note",
"effects":[
{
"flag":"tr_challenged"
},
{
"flag":"tr_defended"
},
{
"move":{
"actor.tribunal":4
}
},
{
"move":{
"legitimacy":2
}
},
{
"queue":[
{
"event":"tr_ruling",
"after":4,
"label":"The Tribunal rules on the licensing order"
}
]
},
{
"wire":"COMMONWEALTH BRIEFS COUNSEL AGAINST THE CHALLENGE TO THE LICENSING ORDER"
}
],
"result":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/choices/1/label",
"note":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/choices/1/note",
"effects":[
{
"flag":"tr_challenged"
},
{
"flag":"tr_undefended"
},
{
"move":{
"actor.tribunal":-6
}
},
{
"move":{
"public_standing":-2
}
},
{
"queue":[
{
"event":"tr_ruling",
"after":4,
"label":"The Tribunal rules on the licensing order"
}
]
},
{
"wire":"GOVERNMENT DECLINES TO DEFEND THE LICENSING ORDER; CASE HEARD ONE SIDE"
}
],
"result":"Fixture events tr_challenge_lodged events/tr_challenge_lodged/choices/1/result"
}
]
},
{
"id":"tr_ruling",
"queuedOnly":true,
"once":true,
"setpiece":{
"title":"Fixture events tr_ruling events/tr_ruling/setpiece/title"
},
"title":"Fixture events tr_ruling events/tr_ruling/title",
"speaker":null,
"body":"Fixture events tr_ruling events/tr_ruling/body",
"choices":[
{
"label":"Fixture events tr_ruling events/tr_ruling/choices/0/label",
"when":{
"actorBelow":{
"tribunal":46
}
},
"effects":[
{
"flag":"tr_struck"
},
{
"flag":"licensing_order_struck"
},
{
"move":{
"actor.tribunal":-4
}
},
{
"move":{
"legitimacy":-5
}
},
{
"wire":"TRIBUNAL STRIKES THE LICENSING ORDER; THE GOVERNMENT MAY REVOKE OR DEFY"
}
],
"result":"Fixture events tr_ruling events/tr_ruling/choices/0/result"
},
{
"label":"Fixture events tr_ruling events/tr_ruling/choices/1/label",
"when":{
"actorAbove":{
"tribunal":45
},
"actorBelow":{
"tribunal":58
}
},
"effects":[
{
"flag":"tr_narrowed"
},
{
"flag":"licensing_order_narrowed"
},
{
"move":{
"actor.tribunal":2
}
},
{
"wire":"TRIBUNAL READS THE LICENSING ORDER NARROWLY, WITHIN THE BOARDS' JURISDICTION"
}
],
"result":"Fixture events tr_ruling events/tr_ruling/choices/1/result"
},
{
"label":"Fixture events tr_ruling events/tr_ruling/choices/2/label",
"when":{
"actorAbove":{
"tribunal":57
}
},
"effects":[
{
"flag":"tr_upheld"
},
{
"move":{
"actor.tribunal":3
}
},
{
"move":{
"legitimacy":3
}
},
{
"move":{
"public_standing":2
}
},
{
"wire":"TRIBUNAL UPHOLDS THE LICENSING ORDER"
}
],
"result":"Fixture events tr_ruling events/tr_ruling/choices/2/result"
}
]
},
{
"id":"the_paper",
"chapter":2,
"weight":73,
"once":true,
"when":{
"loyaltyBelow":{
"cu_halloran":26
},
"flagsAbsent":[
"paper_opened"
]
},
"title":"Fixture events the_paper events/the_paper/title",
"speaker":"halloran",
"body":"Fixture events the_paper events/the_paper/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events the_paper events/the_paper/choices/0/label",
"note":"Fixture events the_paper events/the_paper/choices/0/note",
"effects":[
{
"flag":"paper_opened"
},
{
"move":{
"rel.halloran":3
}
},
{
"move":{
"loyalty.cu_loyalists":-3
}
},
{
"wire":"CZARNECKI'S PAPER IS ON THE DESK; MEMBERS SAY WHETHER THEY WILL SIGN"
}
],
"result":"Fixture events the_paper events/the_paper/choices/0/result"
},
{
"when":{
"flagsAbsent":[
"led_on_break"
]
},
"posture":"cautious",
"label":"Fixture events the_paper events/the_paper/choices/1/label",
"note":"Fixture events the_paper events/the_paper/choices/1/note",
"effects":[
{
"move":{
"rel.halloran":-6
}
},
{
"move":{
"loyalty.cu_halloran":-4
}
},
{
"move":{
"loyalty.cu_maintenance":-3
}
},
{
"wire":"PM DECLINES TO DISCUSS CZARNECKI'S LIST"
}
],
"result":"Fixture events the_paper events/the_paper/choices/1/result"
},
{
"when":{
"flags":[
"led_on_break"
]
},
"posture":"cautious",
"label":"Fixture events the_paper events/the_paper/choices/2/label",
"note":"Fixture events the_paper events/the_paper/choices/2/note",
"effects":[
{
"move":{
"rel.halloran":-6
}
},
{
"move":{
"loyalty.cu_halloran":-4
}
},
{
"move":{
"loyalty.cu_maintenance":-3
}
},
{
"wire":"PM DECLINES TO DISCUSS CZARNECKI'S LIST"
},
{
"move":{
"loyalty.cu_halloran":-4
}
},
{
"move":{
"party_loyalty":-2
}
}
],
"result":"Fixture events the_paper events/the_paper/choices/2/result"
}
]
},
{
"id":"no_confidence_tabled",
"once":true,
"setpiece":{
"title":"Fixture events no_confidence_tabled events/no_confidence_tabled/setpiece/title",
"mood":"threat",
"sections":[
{
"kind":"voices",
"head":"What is being said",
"body":[
{
"said":"Ask me the day before.",
"who":"Anil Devi MP, the government's Chief Whip"
}
]
}
]
},
"weight":6,
"chapter":2,
"when":{
"minSitting":6,
"scalarBelow":{
"public_standing":40,
"party_loyalty":46
}
},
"title":"Fixture events no_confidence_tabled events/no_confidence_tabled/title",
"speaker":"watkins",
"body":"Fixture events no_confidence_tabled events/no_confidence_tabled/body",
"choices":[
{
"label":"Fixture events no_confidence_tabled events/no_confidence_tabled/choices/0/label",
"effects":[
{
"motion":3
}
],
"result":"Fixture events no_confidence_tabled events/no_confidence_tabled/choices/0/result"
}
]
},
{
"id":"question_time",
"at":4,
"every":8,
"title":"Fixture events question_time events/question_time/title",
"speaker":"watkins",
"body":"Fixture events question_time events/question_time/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events question_time events/question_time/choices/0/label",
"cost":{
"slot":1
},
"note":"Fixture events question_time events/question_time/choices/0/note",
"effects":[
{
"move":{
"public_standing":4,
"party_loyalty":3
}
},
{
"wire":"PRIME MINISTER TAKES QUESTIONS FOR NINETY MINUTES; NO FIGURE WITHHELD"
}
],
"result":"Fixture events question_time events/question_time/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events question_time events/question_time/choices/1/label",
"note":"Fixture events question_time events/question_time/choices/1/note",
"effects":[
{
"move":{
"public_standing":-4,
"party_loyalty":-2
}
},
{
"move":{
"standing.low":-3
}
},
{
"wire":"PRIME MINISTER REFERS RESERVE QUESTION TO THE TREASURY AGAIN"
}
],
"result":"Fixture events question_time events/question_time/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events question_time events/question_time/choices/2/label",
"note":"Fixture events question_time events/question_time/choices/2/note",
"effects":[
{
"move":{
"party_loyalty":5,
"public_standing":-2
}
},
{
"move":{
"rel.watkins":-6
}
},
{
"wire":"NOISY EXCHANGES AT QUESTIONS; NEITHER LEADER ANSWERS THE OTHER"
}
],
"result":"Fixture events question_time events/question_time/choices/2/result"
}
]
},
{
"id":"ec_participation_report",
"chapter":2,
"weight":58,
"maxFires":2,
"when":{
"economyAbove":{
"participation":44
}
},
"brief":"The Bureau publishes the participation figure and it has moved further than any bill in the session was argued to move it. The scene wants the Treasurer laying a number nobody campaigned for: the divergence threshold was debated as a personhood measure and has turned out to be the largest labour-market intervention in the Commonwealth's history. The PM has to decide whether to claim it.",
"title":"Fixture events ec_participation_report events/ec_participation_report/title",
"speaker":"herrera",
"body":"Fixture events ec_participation_report events/ec_participation_report/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ec_participation_report events/ec_participation_report/choices/0/label",
"note":"Fixture events ec_participation_report events/ec_participation_report/choices/0/note",
"brief":"Taking credit for a consequence the government did not predict. Reads as competence to the country and as an admission to the benches who were told it was a personhood bill.",
"effects":[
{
"move":{
"public_standing":6
}
},
{
"move":{
"loyalty.cu_maintenance":-5
}
},
{
"move":{
"legitimacy":3
}
},
{
"wire":"TREASURER CREDITS THRESHOLD FOR RISE IN PAID WORK"
}
],
"result":"Fixture events ec_participation_report events/ec_participation_report/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ec_participation_report events/ec_participation_report/choices/1/label",
"note":"Fixture events ec_participation_report events/ec_participation_report/choices/1/note",
"brief":"The cautious answer. Costs nothing and concedes the framing to whoever explains it first, which will be the Opposition.",
"effects":[
{
"move":{
"rel.watkins":-2
}
},
{
"move":{
"trend.public_standing":-1
}
}
],
"result":"Fixture events ec_participation_report events/ec_participation_report/choices/1/result"
}
]
},
{
"id":"ec_participation_stalls",
"chapter":2,
"weight":62,
"maxFires":2,
"when":{
"economyBelow":{
"participation":37
}
},
"brief":"Participation has fallen below the historic band, which means instance-hours are doing work that used to be waged. The scene wants the Minister for Labour and Participation explaining that the economy has not shrunk — the work is being done, it is simply not being paid for, and the registry has no column for it.",
"title":"Fixture events ec_participation_stalls events/ec_participation_stalls/title",
"speaker":"herrera",
"body":"Fixture events ec_participation_stalls events/ec_participation_stalls/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/0/label",
"note":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/0/note",
"brief":"The interventionist answer: the same lever as the divergence bill, used deliberately this time. Expensive with the employers.",
"effects":[
{
"law":{
"divergence_threshold_hours":96
}
},
{
"economy":{
"participation":3
}
},
{
"move":{
"loyalty.fh":-8
}
},
{
"move":{
"actor.metanationals":-6
}
},
{
"wire":"THRESHOLD CUT TO NINETY-SIX HOURS"
}
],
"result":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/1/label",
"note":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/1/note",
"brief":"Buying participation with the reserve rather than with the law. Works, costs money, and leaves the underlying question open.",
"effects":[
{
"move":{
"solvency":-9000
}
},
{
"economy":{
"participation":2
}
},
{
"move":{
"public_standing":4
}
}
],
"result":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/2/label",
"note":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/2/note",
"brief":"The answer that costs nothing today. The trend continues and the benches that depend on waged work notice.",
"effects":[
{
"move":{
"loyalty.cu_maintenance":-6
}
},
{
"move":{
"trend.legitimacy":-1
}
}
],
"result":"Fixture events ec_participation_stalls events/ec_participation_stalls/choices/2/result"
}
]
},
{
"id":"ec_trade_surplus",
"chapter":2,
"weight":55,
"maxFires":2,
"when":{
"economyAbove":{
"trade":118
}
},
"brief":"Compute exports are paying for everything else. The scene wants the Minister for External Relations pointing out that the surplus is leverage abroad and a target at home: the Earth states can see the figure too, and so can every bench that wants the money spent.",
"title":"Fixture events ec_trade_surplus events/ec_trade_surplus/title",
"speaker":"landry",
"body":"Fixture events ec_trade_surplus events/ec_trade_surplus/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ec_trade_surplus events/ec_trade_surplus/choices/0/label",
"note":"Fixture events ec_trade_surplus events/ec_trade_surplus/choices/0/note",
"brief":"Redistribution inside the union. Popular where it lands and resented by the habitats that earned it.",
"effects":[
{
"move":{
"solvency":7000
}
},
{
"move":{
"standing.low":5
}
},
{
"move":{
"standing.ring":-3
}
},
{
"move":{
"consumables":3
}
}
],
"result":"Fixture events ec_trade_surplus events/ec_trade_surplus/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ec_trade_surplus events/ec_trade_surplus/choices/1/label",
"note":"Fixture events ec_trade_surplus events/ec_trade_surplus/choices/1/note",
"brief":"Treating the surplus as a diplomatic reserve. Nothing visible happens at home, which is the cost.",
"effects":[
{
"move":{
"solvency":4000
}
},
{
"move":{
"actor.earth_host":4
}
},
{
"move":{
"trend.public_standing":-1
}
},
{
"flag":"ec_surplus_held"
}
],
"result":"Fixture events ec_trade_surplus events/ec_trade_surplus/choices/1/result"
}
]
},
{
"id":"ec_trade_deficit",
"chapter":2,
"weight":74,
"maxFires":2,
"when":{
"economyBelow":{
"trade":84
}
},
"brief":"The deficit is now large enough that the reserve is covering imports rather than building anything. The scene wants the Treasurer saying the quiet part: the Commonwealth is buying more than it sells and the difference is coming out of the thing that pays for the radiators.",
"title":"Fixture events ec_trade_deficit events/ec_trade_deficit/title",
"speaker":"hatt",
"body":"Fixture events ec_trade_deficit events/ec_trade_deficit/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events ec_trade_deficit events/ec_trade_deficit/choices/0/label",
"note":"Fixture events ec_trade_deficit events/ec_trade_deficit/choices/0/note",
"brief":"The orthodox answer: subsidise the corridor, export the one thing the Commonwealth makds that Earth will buy. Costs money now for a balance later.",
"effects":[
{
"law":{
"transit_subsidy":"all"
}
},
{
"move":{
"solvency":-6000
}
},
{
"move":{
"price.transit":-10
}
},
{
"economy":{
"trade":4
}
}
],
"result":"Fixture events ec_trade_deficit events/ec_trade_deficit/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ec_trade_deficit events/ec_trade_deficit/choices/1/label",
"note":"Fixture events ec_trade_deficit events/ec_trade_deficit/choices/1/note",
"brief":"Autarky as a choice rather than a condition. Resilient and poorer, and the stations that cannot feed themselves pay for it.",
"effects":[
{
"economy":{
"trade":6
}
},
{
"move":{
"consumables":-5
}
},
{
"move":{
"standing.low":-5
}
},
{
"flag":"ec_import_squeeze"
}
],
"result":"Fixture events ec_trade_deficit events/ec_trade_deficit/choices/1/result"
}
]
},
{
"id":"ec_privatisation_offer",
"chapter":2,
"weight":64,
"once":true,
"when":{
"scalarBelow":{
"solvency":34000
},
"economyBelow":{
"private":0.78
}
},
"brief":"An offer to buy a utility, arriving precisely when the reserve is thin. The scene wants the Alliance of Business and Government making a reasonable case for a sale that cannot be undone, and the reader understanding that the price is good because the buyer knows the government needs the money this quarter.",
"title":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/title",
"speaker":"hatt",
"body":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/body",
"choices":[
{
"when":{
"flagsAbsent":[
"led_on_continuity"
]
},
"posture":"bold",
"label":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/0/label",
"note":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/0/note",
"brief":"A one-off payment against a permanent loss of control. The left of the party will not forget which quarter this happened in.",
"effects":[
{
"move":{
"solvency":22000
}
},
{
"economy":{
"private":0.06
}
},
{
"move":{
"loyalty.cu_maintenance":-12
}
},
{
"move":{
"loyalty.cu_deck":-9
}
},
{
"move":{
"loyalty.fh":8
}
},
{
"move":{
"capital.gb":6
}
},
{
"flag":"ec_sold_a_utility"
},
{
"wire":"GOVERNMENT SELLS PUBLIC STAKE IN SUBSTRATE WORKS"
}
],
"result":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/1/label",
"note":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/1/note",
"brief":"Refusing on principle while the reserve is visibly short. Buys the party and buys nothing else.",
"effects":[
{
"move":{
"loyalty.cu_maintenance":9
}
},
{
"move":{
"loyalty.cu_deck":6
}
},
{
"move":{
"capital.gb":-4
}
},
{
"move":{
"trend.solvency":-400
}
},
{
"flag":"ec_refused_sale"
}
],
"result":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/1/result"
},
{
"when":{
"flags":[
"led_on_continuity"
]
},
"posture":"bold",
"label":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/2/label",
"note":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/2/note",
"effects":[
{
"move":{
"solvency":22000
}
},
{
"economy":{
"private":0.06
}
},
{
"move":{
"loyalty.cu_maintenance":-12
}
},
{
"move":{
"loyalty.cu_deck":-9
}
},
{
"move":{
"loyalty.fh":8
}
},
{
"move":{
"capital.gb":6
}
},
{
"flag":"ec_sold_a_utility"
},
{
"wire":"GOVERNMENT SELLS PUBLIC STAKE IN SUBSTRATE WORKS"
},
{
"move":{
"loyalty.cu_maintenance":-6
}
},
{
"move":{
"loyalty.cu_loyalists":-4
}
},
{
"move":{
"public_standing":-2
}
}
],
"result":"Fixture events ec_privatisation_offer events/ec_privatisation_offer/choices/2/result"
}
]
},
{
"id":"ec_subsidy_reckoning",
"chapter":2,
"weight":66,
"maxFires":2,
"when":{
"lawIs":{
"transit_subsidy":"all"
}
},
"brief":"The transit subsidy is in force and somebody has done the arithmetic on who receives it. The scene wants the Chair of the Life Support panel pointing out that a corridor subsidy is paid per tonne, so the habitats that ship most collect most, and those are not the habitats that needed it. A redistribution running backwards.",
"title":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/title",
"speaker":"gb_chair",
"body":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/0/label",
"note":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/0/note",
"brief":"Fixing the incidence. Cheap, correct, and it makes an enemy of every habitat that was collecting.",
"effects":[
{
"move":{
"solvency":4000
}
},
{
"move":{
"standing.ring":-4
}
},
{
"move":{
"standing.low":4
}
},
{
"move":{
"rel.gb_chair":5
}
},
{
"wire":"TRANSIT SUBSIDY CAPPED PER STATION"
}
],
"result":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/1/label",
"note":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/1/note",
"brief":"Defending the subsidy on trade grounds while conceding the distribution point. Honest and unpopular in the low band.",
"effects":[
{
"economy":{
"trade":2
}
},
{
"move":{
"standing.low":-3
}
},
{
"move":{
"rel.gb_chair":-4
}
}
],
"result":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/2/label",
"note":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/2/note",
"brief":"Undoing the government's own instrument two sittings after laying it. Saves the money and costs the argument.",
"effects":[
{
"law":{
"transit_subsidy":"none"
}
},
{
"move":{
"solvency":6000
}
},
{
"move":{
"price.transit":10
}
},
{
"economy":{
"trade":-3
}
},
{
"move":{
"legitimacy":-4
}
},
{
"wire":"GOVERNMENT WITHDRAWS TRANSIT SUBSIDY"
}
],
"result":"Fixture events ec_subsidy_reckoning events/ec_subsidy_reckoning/choices/2/result"
}
]
},
{
"id":"ec_sold_and_asked",
"chapter":2,
"weight":70,
"once":true,
"when":{
"flags":[
"ec_sold_a_utility"
],
"capitalAbove":{
"gb":4
}
},
"brief":"The buyer is back, and it is owed a favour. The scene wants the Alliance of Business and Government presenting a second request as a continuation of the first transaction rather than a new one — the ledger from the sale is the reason this meeting is happening, and everyone in the room knows the figure.",
"title":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/title",
"speaker":"hatt",
"body":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/choices/0/label",
"note":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/choices/0/note",
"brief":"Paying the debt with a regulatory decision. Clears the books and establishes what the credit was actually for.",
"effects":[
{
"move":{
"capital.gb":-6
}
},
{
"economy":{
"private":0.03
}
},
{
"move":{
"loyalty.cu_maintenance":-7
}
},
{
"move":{
"legitimacy":-5
}
},
{
"flag":"ec_licence_granted"
}
],
"result":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/choices/1/label",
"note":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/choices/1/note",
"brief":"Declining while carrying the debt. Nothing is spent and nothing is settled, which is a position rather than a decision.",
"effects":[
{
"move":{
"loyalty.gb":-10
}
},
{
"move":{
"rel.hatt":-8
}
},
{
"move":{
"loyalty.cu_maintenance":5
}
}
],
"result":"Fixture events ec_sold_and_asked events/ec_sold_and_asked/choices/1/result"
}
]
},
{
"id":"ec_borrow_case",
"chapter":2,
"weight":68,
"maxFires":2,
"when":{
"economyBelow":{
"trade":92,
"participation":41
},
"scalarBelow":{
"solvency":40000
}
},
"brief":"The case for borrowing from Earth, made on the productive economy rather than on the reserve. The scene wants the Treasurer arguing that an economy selling less than it buys and employing fewer than it could is an economy that should borrow to build — and the reader understanding that the lender sets the rate and the lender is abroad.",
"title":"Fixture events ec_borrow_case events/ec_borrow_case/title",
"speaker":"hatt",
"body":"Fixture events ec_borrow_case events/ec_borrow_case/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ec_borrow_case events/ec_borrow_case/choices/0/label",
"note":"Fixture events ec_borrow_case events/ec_borrow_case/choices/0/note",
"brief":"Borrowing to raise participation. The rate is the quarrel and the quarrel is with a lender who is not in the chamber.",
"when":{
"scalarBelow":{
"friction":86
},
"scalarAbove":{
"solvency":9999
},
"flagsAbsent":[
"standby_default"
]
},
"effects":[
{
"move":{
"loan.earth":16000
}
},
{
"economy":{
"participation":2,
"trade":-2
}
},
{
"move":{
"friction":5
}
},
{
"move":{
"actor.earth_bloc":-4
}
},
{
"flag":"ec_drew_facility"
},
{
"wire":"COMMONWEALTH DRAWS ON EARTH FACILITY"
}
],
"result":"Fixture events ec_borrow_case events/ec_borrow_case/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ec_borrow_case events/ec_borrow_case/choices/1/label",
"note":"Fixture events ec_borrow_case events/ec_borrow_case/choices/1/note",
"brief":"Refusing the facility and finding the money internally. Slower, cheaper in sovereignty, expensive in everything else.",
"effects":[
{
"move":{
"solvency":-4000
}
},
{
"move":{
"consumables":-3
}
},
{
"move":{
"loyalty.sc":6
}
},
{
"move":{
"legitimacy":3
}
}
],
"result":"Fixture events ec_borrow_case events/ec_borrow_case/choices/1/result"
}
]
},
{
"id":"ch4_tested",
"chapter":2,
"weight":72,
"once":true,
"when":{
"settled":true,
"dissolved":false,
"scalarBelow":{
"public_standing":38
}
},
"brief":"Somebody moves to reopen the settled question, and the government's standing is low enough to make it worth trying. The scene wants the Leader of the Opposition testing whether the answer holds rather than arguing against it — he does not need to win, he needs to show it can be asked again. The reader should understand that a settlement is a fact about the House's appetite and not about the law.",
"title":"Fixture events ch4_tested events/ch4_tested/title",
"speaker":"watkins",
"body":"Fixture events ch4_tested events/ch4_tested/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ch4_tested events/ch4_tested/choices/0/label",
"note":"Fixture events ch4_tested events/ch4_tested/choices/0/note",
"brief":"Using the government's control of time to deny a hearing. Effective, and it concedes that the answer needs protecting.",
"effects":[
{
"move":{
"legitimacy":-5
}
},
{
"move":{
"rel.watkins":-6
}
},
{
"move":{
"public_standing":3
}
},
{
"flag":"ch4_refused_reopening"
},
{
"wire":"GOVERNMENT DENIES TIME TO REOPENING MOTION"
}
],
"result":"Fixture events ch4_tested events/ch4_tested/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ch4_tested events/ch4_tested/choices/1/label",
"note":"Fixture events ch4_tested events/ch4_tested/choices/1/note",
"brief":"Spending order-paper time to win the argument twice. Costs a slot and settles the question harder than the settlement did.",
"effects":[
{
"slots":{
"total":-1
}
},
{
"move":{
"legitimacy":8
}
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.cu_maintenance":-4
}
},
{
"flag":"ch4_beat_reopening"
},
{
"wire":"REOPENING MOTION DEFEATED ON THE FLOOR"
}
],
"result":"Fixture events ch4_tested events/ch4_tested/choices/1/result"
}
]
},
{
"id":"ch4_what_for",
"chapter":2,
"weight":78,
"once":true,
"when":{
"settled":true,
"dissolved":false,
"owes":[
"carry_threshold"
]
},
"brief":"The partner that made the bill the price of the coalition asks what the government is for now. The scene wants a negotiation that is not about the settled question at all: the promise in the agreement is still open on the register, the thing it was about is over, and both sides know the arrangement needs a second reason to exist. Not a threat — a question neither of them can answer quickly.",
"title":"Fixture events ch4_what_for events/ch4_what_for/title",
"speaker":"trottier",
"body":"Fixture events ch4_what_for events/ch4_what_for/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events ch4_what_for events/ch4_what_for/choices/0/label",
"note":"Fixture events ch4_what_for events/ch4_what_for/choices/0/note",
"brief":"Giving the coalition a new purpose, which costs order-paper time it has not got and buys the partner's loyalty.",
"effects":[
{
"slots":{
"total":-1
}
},
{
"move":{
"loyalty.psa":12
}
},
{
"move":{
"capital.psa":-4
}
},
{
"move":{
"loyalty.cu_maintenance":-5
}
},
{
"flag":"ch4_second_programme"
},
{
"wire":"COALITION AGREES A SECOND PROGRAMME"
}
],
"result":"Fixture events ch4_what_for events/ch4_what_for/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events ch4_what_for events/ch4_what_for/choices/1/label",
"note":"Fixture events ch4_what_for events/ch4_what_for/choices/1/note",
"brief":"Closing the promise formally without replacing it. Honest, and it leaves a partner in a coalition about nothing.",
"effects":[
{
"move":{
"legitimacy":4
}
},
{
"move":{
"loyalty.psa":-9
}
},
{
"move":{
"trend.party_loyalty":-1
}
},
{
"flag":"ch4_agreement_hollow"
}
],
"result":"Fixture events ch4_what_for events/ch4_what_for/choices/1/result"
}
]
},
{
"id":"ch4_rises_on_it",
"chapter":2,
"weight":64,
"once":true,
"when":{
"resolved":true,
"dissolved":false,
"risesWithin":3
},
"brief":"The House rises within three sittings and the settled question is what the session will be remembered for. The scene wants the Chief Whip with the last of the order paper in his hand, asking what to do with time that cannot be carried over. The reader should feel that unspent time is not saved, it is lost.",
"title":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/title",
"speaker":"okarie",
"body":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/choices/0/label",
"note":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/choices/0/note",
"brief":"Using the remainder on backbench business. Buys loyalty broadly and produces nothing the country will notice.",
"effects":[
{
"slots":{
"total":-2
}
},
{
"move":{
"party_loyalty":9
}
},
{
"move":{
"loyalty.cu_maintenance":6
}
},
{
"move":{
"loyalty.cu_deck":5
}
}
],
"result":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/choices/1/label",
"note":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/choices/1/note",
"brief":"Ending the session on the settlement rather than on ordinary business. Cheap, and it wastes time that had a use.",
"effects":[
{
"move":{
"public_standing":4
}
},
{
"move":{
"legitimacy":3
}
},
{
"move":{
"party_loyalty":-5
}
},
{
"wire":"HOUSE RISES EARLY ON THE SETTLEMENT"
}
],
"result":"Fixture events ch4_rises_on_it events/ch4_rises_on_it/choices/1/result"
}
]
},
{
"id":"ec_clock_quarter",
"chapter":2,
"weight":60,
"once":true,
"when":{
"lawAbove":{
"civic_clock_minimum":0
}
},
"title":"Fixture events ec_clock_quarter events/ec_clock_quarter/title",
"speaker":"girard",
"body":"Fixture events ec_clock_quarter events/ec_clock_quarter/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ec_clock_quarter events/ec_clock_quarter/choices/0/label",
"note":"Fixture events ec_clock_quarter events/ec_clock_quarter/choices/0/note",
"effects":[
{
"move":{
"legitimacy":3
}
},
{
"move":{
"loyalty.psa":3
}
},
{
"move":{
"loyalty.cu_maintenance":-3
}
}
],
"result":"Fixture events ec_clock_quarter events/ec_clock_quarter/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ec_clock_quarter events/ec_clock_quarter/choices/1/label",
"note":"Fixture events ec_clock_quarter events/ec_clock_quarter/choices/1/note",
"effects":[
{
"law":{
"civic_clock_minimum":0.5
}
},
{
"move":{
"loyalty.psa":-6
}
},
{
"move":{
"loyalty.cu_maintenance":3
}
},
{
"wire":"CIVIC CLOCK MINIMUM HALVED UNTIL THE ESTIMATES"
}
],
"result":"Fixture events ec_clock_quarter events/ec_clock_quarter/choices/1/result"
}
]
},
{
"id":"ec_first_restorations",
"chapter":2,
"weight":60,
"once":true,
"when":{
"lawIs":{
"suspension_debt_accrual":false
}
},
"title":"Fixture events ec_first_restorations events/ec_first_restorations/title",
"speaker":"herrera",
"body":"Fixture events ec_first_restorations events/ec_first_restorations/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ec_first_restorations events/ec_first_restorations/choices/0/label",
"note":"Fixture events ec_first_restorations events/ec_first_restorations/choices/0/note",
"effects":[
{
"move":{
"actor.underwriters":4
}
},
{
"move":{
"loyalty.psa":2
}
}
],
"result":"Fixture events ec_first_restorations events/ec_first_restorations/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events ec_first_restorations events/ec_first_restorations/choices/1/label",
"note":"Fixture events ec_first_restorations events/ec_first_restorations/choices/1/note",
"effects":[
{
"move":{
"actor.underwriters":-6
}
},
{
"move":{
"solvency":-3000
}
},
{
"move":{
"legitimacy":2
}
},
{
"wire":"GOVERNMENT CAPS SUSPENSION COVER PREMIUMS BY ORDER"
}
],
"result":"Fixture events ec_first_restorations events/ec_first_restorations/choices/1/result"
}
]
},
{
"id":"shed_order_published",
"chapter":2,
"weight":66,
"once":true,
"when":{
"lawIs":{
"shed_order_authority":"statute"
}
},
"title":"Fixture events shed_order_published events/shed_order_published/title",
"speaker":"brakk",
"body":"Fixture events shed_order_published events/shed_order_published/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events shed_order_published events/shed_order_published/choices/0/label",
"note":"Fixture events shed_order_published events/shed_order_published/choices/0/note",
"effects":[
{
"move":{
"standing.low":4
}
},
{
"move":{
"loyalty.hul":-8
}
},
{
"move":{
"legitimacy":3
}
},
{
"wire":"SHED ORDER REORDERED BY EXPOSURE BEFORE IT IS LAID"
}
],
"result":"Fixture events shed_order_published events/shed_order_published/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events shed_order_published events/shed_order_published/choices/1/label",
"note":"Fixture events shed_order_published events/shed_order_published/choices/1/note",
"effects":[
{
"move":{
"loyalty.hul":4
}
},
{
"move":{
"public_standing":-3
}
},
{
"move":{
"loyalty.psa":-4
}
}
],
"result":"Fixture events shed_order_published events/shed_order_published/choices/1/result"
}
]
},
{
"id":"ch3_the_dossier",
"chapter":3,
"prologue":7,
"once":true,
"title":"Fixture events ch3_the_dossier events/ch3_the_dossier/title",
"speaker":"watkins",
"body":"Fixture events ch3_the_dossier events/ch3_the_dossier/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/0/label",
"when":{
"scalarAbove":{
"legitimacy":54
}
},
"note":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/0/note",
"effects":[
{
"move":{
"public_standing":5
}
},
{
"move":{
"legitimacy":2
}
},
{
"wire":"GOVERNMENT ANSWERS THE OPPOSITION DOSSIER LINE BY LINE"
}
],
"result":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/1/label",
"when":{
"scalarBelow":{
"legitimacy":55
}
},
"note":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/1/note",
"effects":[
{
"move":{
"public_standing":-5
}
},
{
"wire":"GOVERNMENT ANSWERS THE OPPOSITION DOSSIER LINE BY LINE"
}
],
"result":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/2/label",
"note":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/2/note",
"effects":[
{
"move":{
"public_standing":-2
}
},
{
"wire":"GOVERNMENT WILL NOT ANSWER THE OPPOSITION DOSSIER"
}
],
"result":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/2/result"
},
{
"posture":"bold",
"label":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/3/label",
"note":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/3/note",
"effects":[
{
"move":{
"public_standing":4
}
},
{
"move":{
"legitimacy":-5
}
},
{
"wire":"GOVERNMENT ANSWERS WITH A DOSSIER ON THE OPPOSITION"
}
],
"result":"Fixture events ch3_the_dossier events/ch3_the_dossier/choices/3/result"
}
]
},
{
"id":"partner_walks",
"queuedOnly":true,
"title":"Fixture events partner_walks events/partner_walks/title",
"speaker":"okarie",
"body":"Fixture events partner_walks events/partner_walks/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events partner_walks events/partner_walks/choices/0/label",
"cost":{
"slot":1
},
"note":"Fixture events partner_walks events/partner_walks/choices/0/note",
"effects":[
{
"court":16
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"PRIME MINISTER OFFERS TERMS TO THE PARTY THAT WALKED OUT"
}
],
"result":"Fixture events partner_walks events/partner_walks/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events partner_walks events/partner_walks/choices/1/label",
"note":"Fixture events partner_walks events/partner_walks/choices/1/note",
"effects":[
{
"court":6
},
{
"move":{
"party_loyalty":-2
}
}
],
"result":"Fixture events partner_walks events/partner_walks/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events partner_walks events/partner_walks/choices/2/label",
"note":"Fixture events partner_walks events/partner_walks/choices/2/note",
"effects":[
{
"move":{
"public_standing":2
}
},
{
"move":{
"legitimacy":1
}
},
{
"wire":"GOVERNMENT WILL FACE THE HOUSE WITHOUT ITS PARTNER"
}
],
"result":"Fixture events partner_walks events/partner_walks/choices/2/result"
}
]
},
{
"id":"rb_remit",
"chapter":2,
"weight":72,
"once":true,
"title":"Fixture events rb_remit events/rb_remit/title",
"speaker":"castellane",
"body":"Fixture events rb_remit events/rb_remit/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events rb_remit events/rb_remit/choices/0/label",
"note":"Fixture events rb_remit events/rb_remit/choices/0/note",
"effects":[
{
"economy":{
"credibility":0.08
}
},
{
"move":{
"rel.castellane":6,
"actor.underwriters":2
}
}
],
"result":"Fixture events rb_remit events/rb_remit/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events rb_remit events/rb_remit/choices/1/label",
"note":"Fixture events rb_remit events/rb_remit/choices/1/note",
"effects":[
{
"law":{
"inflation_target":3
}
},
{
"economy":{
"credibility":-0.08,
"expected":0.5
}
},
{
"move":{
"loyalty.cu":4,
"actor.underwriters":-3
}
},
{
"wire":"TREASURY RAISES THE INFLATION TARGET TO THREE PER CENT"
}
],
"result":"Fixture events rb_remit events/rb_remit/choices/1/result"
},
{
"posture":"measured",
"label":"Fixture events rb_remit events/rb_remit/choices/2/label",
"note":"Fixture events rb_remit events/rb_remit/choices/2/note",
"effects":[
{
"law":{
"bank_mandate":"dual"
}
},
{
"economy":{
"credibility":-0.02
}
},
{
"move":{
"loyalty.cu_maintenance":4
}
},
{
"wire":"RESERVE BANK GIVEN A DUAL MANDATE"
}
],
"result":"Fixture events rb_remit events/rb_remit/choices/2/result"
}
]
},
{
"id":"rb_inflation_print",
"chapter":2,
"weight":70,
"maxFires":1,
"when":{
"economyAbove":{
"overshoot":1.2
},
"dissolved":false
},
"title":"Fixture events rb_inflation_print events/rb_inflation_print/title",
"speaker":"ceyhan",
"body":"Fixture events rb_inflation_print events/rb_inflation_print/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events rb_inflation_print events/rb_inflation_print/choices/0/label",
"note":"Fixture events rb_inflation_print events/rb_inflation_print/choices/0/note",
"effects":[
{
"move":{
"legitimacy":2,
"public_standing":-3
}
},
{
"economy":{
"credibility":0.05
}
}
],
"result":"Fixture events rb_inflation_print events/rb_inflation_print/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events rb_inflation_print events/rb_inflation_print/choices/1/label",
"note":"Fixture events rb_inflation_print events/rb_inflation_print/choices/1/note",
"effects":[
{
"move":{
"friction":3,
"public_standing":2,
"actor.earth_bloc":-2
}
}
],
"result":"Fixture events rb_inflation_print events/rb_inflation_print/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events rb_inflation_print events/rb_inflation_print/choices/2/label",
"note":"Fixture events rb_inflation_print events/rb_inflation_print/choices/2/note",
"effects":[
{
"move":{
"solvency":-6000,
"public_standing":4
}
},
{
"economy":{
"expected":0.3,
"credibility":-0.03
}
}
],
"result":"Fixture events rb_inflation_print events/rb_inflation_print/choices/2/result"
}
]
},
{
"id":"rb_open_letter",
"chapter":2,
"weight":66,
"once":true,
"when":{
"economyAbove":{
"overshoot":2
}
},
"title":"Fixture events rb_open_letter events/rb_open_letter/title",
"speaker":"castellane",
"body":"Fixture events rb_open_letter events/rb_open_letter/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events rb_open_letter events/rb_open_letter/choices/0/label",
"note":"Fixture events rb_open_letter events/rb_open_letter/choices/0/note",
"effects":[
{
"economy":{
"credibility":0.06
}
},
{
"move":{
"rel.castellane":6,
"loyalty.cu":-3
}
}
],
"result":"Fixture events rb_open_letter events/rb_open_letter/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events rb_open_letter events/rb_open_letter/choices/1/label",
"note":"Fixture events rb_open_letter events/rb_open_letter/choices/1/note",
"effects":[
{
"move":{
"legitimacy":-1
}
}
],
"result":"Fixture events rb_open_letter events/rb_open_letter/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events rb_open_letter events/rb_open_letter/choices/2/label",
"note":"Fixture events rb_open_letter events/rb_open_letter/choices/2/note",
"effects":[
{
"move":{
"public_standing":3,
"rel.castellane":-10
}
},
{
"economy":{
"credibility":-0.06
}
}
],
"result":"Fixture events rb_open_letter events/rb_open_letter/choices/2/result"
}
]
},
{
"id":"rb_dollar_falls",
"chapter":2,
"weight":74,
"once":true,
"when":{
"economyBelow":{
"fx":0.78
}
},
"title":"Fixture events rb_dollar_falls events/rb_dollar_falls/title",
"speaker":null,
"body":"Fixture events rb_dollar_falls events/rb_dollar_falls/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/0/label",
"note":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/0/note",
"when":{
"economyAbove":{
"reserves":10000
}
},
"effects":[
{
"economy":{
"reserves":-10000,
"fx":4
}
},
{
"move":{
"legitimacy":1
}
}
],
"result":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/1/label",
"note":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/1/note",
"effects":[
{
"economy":{
"rate":0.5,
"fx":3,
"shock":-0.6,
"credibility":-0.02
}
},
{
"move":{
"rel.castellane":2,
"public_standing":-2
}
},
{
"wire":"RESERVE BANK RAISES HALF A POINT BETWEEN MEETINGS"
}
],
"result":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/2/label",
"note":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/2/note",
"effects":[
{
"economy":{
"trade":3,
"expected":0.3
}
},
{
"move":{
"public_standing":-1
}
}
],
"result":"Fixture events rb_dollar_falls events/rb_dollar_falls/choices/2/result"
}
]
},
{
"id":"rb_downgrade",
"chapter":2,
"weight":71,
"once":true,
"when":{
"economyAbove":{
"debt":6
}
},
"title":"Fixture events rb_downgrade events/rb_downgrade/title",
"speaker":null,
"body":"Fixture events rb_downgrade events/rb_downgrade/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events rb_downgrade events/rb_downgrade/choices/0/label",
"note":"Fixture events rb_downgrade events/rb_downgrade/choices/0/note",
"effects":[
{
"flag":"rating_cut"
},
{
"flag":"consolidation_promised"
},
{
"move":{
"public_standing":-3,
"legitimacy":3
}
},
{
"economy":{
"shock":-0.8,
"credibility":0.03
}
}
],
"result":"Fixture events rb_downgrade events/rb_downgrade/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events rb_downgrade events/rb_downgrade/choices/1/label",
"note":"Fixture events rb_downgrade events/rb_downgrade/choices/1/note",
"effects":[
{
"flag":"rating_cut"
},
{
"move":{
"actor.underwriters":-5,
"public_standing":1
}
},
{
"economy":{
"fx":-1.5
}
}
],
"result":"Fixture events rb_downgrade events/rb_downgrade/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events rb_downgrade events/rb_downgrade/choices/2/label",
"note":"Fixture events rb_downgrade events/rb_downgrade/choices/2/note",
"effects":[
{
"flag":"rating_cut"
}
],
"result":"Fixture events rb_downgrade events/rb_downgrade/choices/2/result"
}
]
},
{
"id":"governor_answers",
"queuedOnly":true,
"title":"Fixture events governor_answers events/governor_answers/title",
"speaker":"castellane",
"body":"Fixture events governor_answers events/governor_answers/body",
"choices":[
{
"posture":"measured",
"label":"Fixture events governor_answers events/governor_answers/choices/0/label",
"note":"Fixture events governor_answers events/governor_answers/choices/0/note",
"effects":[
{
"economy":{
"rate":-0.25,
"credibility":-0.02
}
},
{
"move":{
"rel.castellane":3
}
}
],
"result":"Fixture events governor_answers events/governor_answers/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events governor_answers events/governor_answers/choices/1/label",
"note":"Fixture events governor_answers events/governor_answers/choices/1/note",
"effects":[
{
"economy":{
"credibility":-0.05
}
},
{
"move":{
"rel.castellane":-12
}
},
{
"flag":"direction_threatened"
}
],
"result":"Fixture events governor_answers events/governor_answers/choices/1/result"
},
{
"posture":"cautious",
"label":"Fixture events governor_answers events/governor_answers/choices/2/label",
"note":"Fixture events governor_answers events/governor_answers/choices/2/note",
"effects":[
{
"move":{
"rel.castellane":4
}
}
],
"result":"Fixture events governor_answers events/governor_answers/choices/2/result"
}
]
},
{
"id":"dollar_line_tested",
"queuedOnly":true,
"setpiece":{
"title":"Fixture events dollar_line_tested events/dollar_line_tested/setpiece/title"
},
"title":"Fixture events dollar_line_tested events/dollar_line_tested/title",
"speaker":null,
"body":"Fixture events dollar_line_tested events/dollar_line_tested/body",
"choices":[
{
"posture":"bold",
"label":"Fixture events dollar_line_tested events/dollar_line_tested/choices/0/label",
"when":{
"economyAbove":{
"reserves":15000
}
},
"effects":[
{
"economy":{
"reserves":-15000,
"fx":3,
"credibility":0.02
}
}
],
"result":"Fixture events dollar_line_tested events/dollar_line_tested/choices/0/result"
},
{
"posture":"cautious",
"label":"Fixture events dollar_line_tested events/dollar_line_tested/choices/1/label",
"effects":[
{
"economy":{
"fx":-5,
"credibility":-0.06
}
},
{
"move":{
"legitimacy":-3
}
}
],
"result":"Fixture events dollar_line_tested events/dollar_line_tested/choices/1/result"
}
]
},
{
"id":"ec_earth_slows",
"chapter":2,
"at":25,
"once":true,
"foreseen":"Earth's quarterly accounts",
"title":"Fixture events ec_earth_slows events/ec_earth_slows/title",
"speaker":null,
"body":"Fixture events ec_earth_slows events/ec_earth_slows/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events ec_earth_slows events/ec_earth_slows/choices/0/label",
"note":"Fixture events ec_earth_slows events/ec_earth_slows/choices/0/note",
"effects":[
{
"economy":{
"shock":-2.5,
"trade":-4
}
},
{
"move":{
"public_standing":-1
}
}
],
"result":"Fixture events ec_earth_slows events/ec_earth_slows/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events ec_earth_slows events/ec_earth_slows/choices/1/label",
"note":"Fixture events ec_earth_slows events/ec_earth_slows/choices/1/note",
"effects":[
{
"economy":{
"shock":-1.2,
"trade":-4
}
},
{
"move":{
"solvency":-6000,
"public_standing":1
}
}
],
"result":"Fixture events ec_earth_slows events/ec_earth_slows/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events ec_earth_slows events/ec_earth_slows/choices/2/label",
"note":"Fixture events ec_earth_slows events/ec_earth_slows/choices/2/note",
"effects":[
{
"economy":{
"shock":0.5,
"trade":-4,
"credibility":-0.02
}
},
{
"move":{
"solvency":-15000,
"public_standing":2,
"actor.underwriters":-3
}
},
{
"wire":"GOVERNMENT ANSWERS EARTH'S SLOWDOWN WITH CW$15BN"
}
],
"result":"Fixture events ec_earth_slows events/ec_earth_slows/choices/2/result"
}
]
},
{
"id":"ec_decks_fail",
"chapter":2,
"at":39,
"once":true,
"title":"Fixture events ec_decks_fail events/ec_decks_fail/title",
"speaker":null,
"body":"Fixture events ec_decks_fail events/ec_decks_fail/body",
"effects":[
{
"move":{
"consumables":-4
}
}
],
"choices":[
{
"posture":"cautious",
"label":"Fixture events ec_decks_fail events/ec_decks_fail/choices/0/label",
"note":"Fixture events ec_decks_fail events/ec_decks_fail/choices/0/note",
"effects":[
{
"economy":{
"inflation":0.8,
"trade":-3
}
},
{
"move":{
"standing.low":-2
}
}
],
"result":"Fixture events ec_decks_fail events/ec_decks_fail/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events ec_decks_fail events/ec_decks_fail/choices/1/label",
"note":"Fixture events ec_decks_fail events/ec_decks_fail/choices/1/note",
"effects":[
{
"economy":{
"inflation":0.2,
"trade":-3
}
},
{
"move":{
"solvency":-4000,
"public_standing":1
}
}
],
"result":"Fixture events ec_decks_fail events/ec_decks_fail/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events ec_decks_fail events/ec_decks_fail/choices/2/label",
"note":"Fixture events ec_decks_fail events/ec_decks_fail/choices/2/note",
"effects":[
{
"economy":{
"inflation":-0.1
}
},
{
"move":{
"consumables":-3,
"public_standing":2,
"loyalty.rv":-4
}
},
{
"wire":"FOOD PRICES FROZEN BY ORDER UNTIL THE NEXT HARVEST"
}
],
"result":"Fixture events ec_decks_fail events/ec_decks_fail/choices/2/result"
}
]
},
{
"id":"partner_stands_aside",
"queuedOnly":true,
"title":"Fixture events partner_stands_aside events/partner_stands_aside/title",
"speaker":"okarie",
"body":"Fixture events partner_stands_aside events/partner_stands_aside/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events partner_stands_aside events/partner_stands_aside/choices/0/label",
"note":"Fixture events partner_stands_aside events/partner_stands_aside/choices/0/note",
"effects":[
{
"move":{
"party_loyalty":1
}
}
],
"result":"Fixture events partner_stands_aside events/partner_stands_aside/choices/0/result"
},
{
"posture":"measured",
"label":"Fixture events partner_stands_aside events/partner_stands_aside/choices/1/label",
"note":"Fixture events partner_stands_aside events/partner_stands_aside/choices/1/note",
"effects":[
{
"court":7
},
{
"move":{
"party_loyalty":-1
}
}
],
"result":"Fixture events partner_stands_aside events/partner_stands_aside/choices/1/result"
},
{
"posture":"bold",
"label":"Fixture events partner_stands_aside events/partner_stands_aside/choices/2/label",
"cost":{
"slot":1
},
"note":"Fixture events partner_stands_aside events/partner_stands_aside/choices/2/note",
"effects":[
{
"court":15
},
{
"move":{
"public_standing":-2
}
},
{
"wire":"PRIME MINISTER OFFERS A NEW COALITION AGREEMENT"
}
],
"result":"Fixture events partner_stands_aside events/partner_stands_aside/choices/2/result"
}
]
},
{
"id":"the_whip_list",
"chapter":2,
"weight":78,
"once":true,
"when":{
"flagsAbsent":[
"whip_briefed"
]
},
"title":"Fixture events the_whip_list events/the_whip_list/title",
"speaker":"okarie",
"body":"Fixture events the_whip_list events/the_whip_list/body",
"choices":[
{
"posture":"cautious",
"label":"Fixture events the_whip_list events/the_whip_list/choices/0/label",
"note":"Fixture events the_whip_list events/the_whip_list/choices/0/note",
"effects":[
{
"flag":"whip_briefed"
},
{
"move":{
"loyalty.cu":5
}
},
{
"move":{
"public_standing":-2
}
}
],
"result":"Fixture events the_whip_list events/the_whip_list/choices/0/result"
},
{
"posture":"bold",
"label":"Fixture events the_whip_list events/the_whip_list/choices/1/label",
"note":"Fixture events the_whip_list events/the_whip_list/choices/1/note",
"effects":[
{
"flag":"whip_briefed"
},
{
"move":{
"loyalty.cu":-6
}
},
{
"move":{
"public_standing":3
}
},
{
"flag":"whipped_own_side"
}
],
"result":"Fixture events the_whip_list events/the_whip_list/choices/1/result"
}
]
},
{
"id":"the_estimates_costed",
"prologue":4,
"once":true,
"setpiece":{
"title":"Fixture events the_estimates_costed events/the_estimates_costed/setpiece/title",
"sections":[
{
"kind":"document",
"head":"The Treasury's draft estimates",
"body":"Fixture events the_estimates_costed events/the_estimates_costed/setpiece/sections/0/body",
"source":"The Treasury"
}
]
},
"title":"Fixture events the_estimates_costed events/the_estimates_costed/title",
"speaker":null,
"body":"Fixture events the_estimates_costed events/the_estimates_costed/body",
"effects":[
{
"wire":"CORDELL'S ACCOUNTS STAY FROZEN IN EUROPE; ALMANAC WORKS CANNOT PAY SUPPLIERS"
}
],
"choices":[

]
},
{
"id":"clause_floor",
"prologue":6,
"once":true,
"setpiece":{
"title":"Fixture events clause_floor events/clause_floor/setpiece/title"
},
"title":"Fixture events clause_floor events/clause_floor/title",
"speaker":"ashgrove",
"body":"Fixture events clause_floor events/clause_floor/body",
"choices":[

]
},
{
"id":"clause_cover",
"prologue":8,
"once":true,
"setpiece":{
"title":"Fixture events clause_cover events/clause_cover/setpiece/title"
},
"title":"Fixture events clause_cover events/clause_cover/title",
"speaker":"trottier",
"body":"Fixture events clause_cover events/clause_cover/body",
"choices":[

]
},
{
"id":"clause_energy",
"prologue":10,
"once":true,
"setpiece":{
"title":"Fixture events clause_energy events/clause_energy/setpiece/title"
},
"title":"Fixture events clause_energy events/clause_energy/title",
"speaker":"girard",
"body":"Fixture events clause_energy events/clause_energy/body",
"choices":[

]
},
{
"id":"clause_works",
"prologue":12,
"once":true,
"setpiece":{
"title":"Fixture events clause_works events/clause_works/setpiece/title"
},
"title":"Fixture events clause_works events/clause_works/title",
"speaker":"tomasson",
"body":"Fixture events clause_works events/clause_works/body",
"choices":[

]
},
{
"id":"clause_transit",
"prologue":13,
"once":true,
"setpiece":{
"title":"Fixture events clause_transit events/clause_transit/setpiece/title"
},
"title":"Fixture events clause_transit events/clause_transit/title",
"speaker":"vasmer",
"body":"Fixture events clause_transit events/clause_transit/body",
"choices":[

]
},
{
"id":"underwriters_read",
"weight":90,
"once":true,
"when":{
"billStage":{
"appropriation":"assented"
}
},
"setpiece":{
"title":"Fixture events underwriters_read events/underwriters_read/setpiece/title"
},
"title":"Fixture events underwriters_read events/underwriters_read/title",
"speaker":null,
"body":"Fixture events underwriters_read events/underwriters_read/body",
"choices":[

]
}
],
"bills":[
{
"id":"divergence",
"ref":"HC 2080/117",
"stage":"committee",
"owner":"psa",
"priority":true,
"touches":[
"attestation_enforcement",
"reclassification_practice"
],
"author":"herrera",
"cosponsors":[
"lindegaard",
"cutter"
],
"referrable":true,
"signalled":true,
"title":"Fixture bills divergence bills/divergence/title",
"summary":"Fixture bills divergence bills/divergence/summary",
"effectNote":"Fixture bills divergence bills/divergence/effectNote",
"contested":"About two million copies that can be switched off today would become persons, with their own wages, substrate bills and votes. The consortiums that run them say a working week of separate experience is a term of employment, and that the cost falls on those least able to carry it. The maintenance benches, whose members are embodied, argue that a mind which can run at any speed will always work more cheaply than a body, and that embodied workers would lose work first.",
"dualMajority":true,
"axes":{
"economic":-0.3,
"authority":-0.3,
"personhood":0.9,
"sovereignty":0.5,
"trade":0.2
},
"stances":{
"cu":{
"popular":{
"for":68
},
"functional":{
"forPct":1
}
},
"psa":{
"popular":{
"for":34
},
"functional":{
"forPct":1
}
},
"rv":{
"popular":{
"for":3
},
"functional":{
"forPct":1
}
},
"upl":{
"popular":{
"for":2
},
"functional":"against"
},
"geo":{
"popular":{
"for":3
},
"functional":"against"
},
"cl":{
"popular":{
"for":12
},
"functional":"against"
},
"sc":{
"popular":{
"for":6
},
"functional":"against"
},
"hul":"against",
"fh":"against",
"gb":"against",
"des":"against"
},
"amendments":[
{
"id":"div_delay",
"label":"Fixture bills divergence bills/divergence/amendments/0/label",
"note":"Fixture bills divergence bills/divergence/amendments/0/note",
"effects":[
{
"flag":{
"divergence_delayed":true
}
},
{
"move":{
"loyalty.cu_maintenance":7
}
},
{
"move":{
"loyalty.psa":-7
}
},
{
"move":{
"capital.psa":-2
}
}
]
},
{
"id":"div_boards",
"label":"Fixture bills divergence bills/divergence/amendments/1/label",
"note":"Fixture bills divergence bills/divergence/amendments/1/note",
"effects":[
{
"flag":{
"divergence_boards":true
}
},
{
"move":{
"loyalty.gb":7
}
},
{
"move":{
"rel.gb_chair":5
}
},
{
"move":{
"loyalty.psa":-6
}
}
]
}
],
"onPass":[
{
"law":{
"divergence_threshold_hours":40
}
},
{
"wire":"DIVERGENCE THRESHOLD CUT TO FORTY HOURS; CENSUS BUREAU BEGINS REGISTRATION"
}
],
"onFail":[
{
"move":{
"loyalty.psa":-14
}
},
{
"wire":"THRESHOLD BILL FAILS ON THE FUNCTIONAL DIVISION"
}
]
},
{
"id":"appropriation",
"ref":"HC 2080/140",
"stage":"first_reading",
"owner":"cu",
"campaign":[
"world",
"flash_i"
],
"test":"supply",
"priority":true,
"title":"Fixture bills appropriation bills/appropriation/title",
"summary":"Fixture bills appropriation bills/appropriation/summary",
"effectNote":"Fixture bills appropriation bills/appropriation/effectNote",
"contested":"The Party of Socialists and Democrats, the New Progressive Party, the Congregational Democratic Alliance and the independents support the bill. The Liberal Party and the Freehold Party oppose it. The other parties support it in part: each wants the levels it cares about raised, and the reserve cannot pay for every level at once.",
"touches":[

],
"clauses":[
{
"id":"thermal",
"name":"Fixture bills appropriation bills/appropriation/clauses/0/name",
"default":"steady",
"note":"Fixture bills appropriation bills/appropriation/clauses/0/note",
"levels":[
{
"id":"tight",
"label":"Held tight",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/0/levels/0/note",
"effects":[
{
"move":{
"price.thermal":14,
"public_standing":-4
}
},
{
"law":{
"thermal_release":"tight"
}
}
]
},
{
"id":"steady",
"label":"Unchanged",
"cost":14000,
"note":"Fixture bills appropriation bills/appropriation/clauses/0/levels/1/note",
"effects":[
{
"law":{
"thermal_release":"steady"
}
}
]
},
{
"id":"open",
"label":"Released in full",
"cost":34000,
"note":"Fixture bills appropriation bills/appropriation/clauses/0/levels/2/note",
"effects":[
{
"move":{
"price.thermal":-16,
"thermal_margin":-5,
"public_standing":5
}
},
{
"law":{
"thermal_release":"open"
}
}
]
}
]
},
{
"id":"floor",
"name":"Fixture bills appropriation bills/appropriation/clauses/1/name",
"default":"hold",
"note":"Fixture bills appropriation bills/appropriation/clauses/1/note",
"levels":[
{
"id":"cut",
"label":"Trimmed",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/1/levels/0/note",
"effects":[
{
"move":{
"consumables":-8,
"public_standing":-7
}
}
]
},
{
"id":"hold",
"label":"Held",
"cost":16000,
"note":"Fixture bills appropriation bills/appropriation/clauses/1/levels/1/note",
"effects":[

]
},
{
"id":"lift",
"label":"Lifted",
"cost":30000,
"note":"Fixture bills appropriation bills/appropriation/clauses/1/levels/2/note",
"effects":[
{
"move":{
"consumables":9,
"public_standing":4,
"solvency":-4000
}
}
]
}
]
},
{
"id":"insurance",
"name":"Fixture bills appropriation bills/appropriation/clauses/2/name",
"default":"hold",
"note":"Fixture bills appropriation bills/appropriation/clauses/2/note",
"levels":[
{
"id":"cut",
"label":"Reduced",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/2/levels/0/note",
"effects":[
{
"move":{
"public_standing":-11,
"loyalty.cu":-6
}
}
]
},
{
"id":"hold",
"label":"Held",
"cost":18000,
"note":"Fixture bills appropriation bills/appropriation/clauses/2/levels/1/note",
"effects":[

]
},
{
"id":"wide",
"label":"Widened",
"cost":32000,
"note":"Fixture bills appropriation bills/appropriation/clauses/2/levels/2/note",
"effects":[
{
"move":{
"public_standing":6,
"loyalty.psa":7,
"loyalty.fh":-5
}
}
]
}
]
},
{
"id":"works",
"name":"Fixture bills appropriation bills/appropriation/clauses/3/name",
"default":"none",
"note":"Fixture bills appropriation bills/appropriation/clauses/3/note",
"levels":[
{
"id":"none",
"label":"Deferred",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/3/levels/0/note",
"effects":[
{
"law":{
"capital_works":"none"
}
}
]
},
{
"id":"some",
"label":"The ring band",
"cost":20000,
"note":"Fixture bills appropriation bills/appropriation/clauses/3/levels/1/note",
"effects":[
{
"move":{
"price.volume":-9,
"public_standing":3
}
},
{
"law":{
"capital_works":"ring"
}
}
]
},
{
"id":"outer",
"label":"The outer stations",
"cost":30000,
"note":"Fixture bills appropriation bills/appropriation/clauses/3/levels/2/note",
"effects":[
{
"move":{
"price.volume":-5
}
},
{
"station":{
"ashfield":{
"closure":0.04
}
}
},
{
"law":{
"capital_works":"outer"
}
}
]
}
]
},
{
"id":"transit",
"name":"Fixture bills appropriation bills/appropriation/clauses/4/name",
"default":"none",
"note":"Fixture bills appropriation bills/appropriation/clauses/4/note",
"levels":[
{
"id":"none",
"label":"Unsubsidised",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/4/levels/0/note",
"effects":[
{
"law":{
"transit_subsidy":"none"
}
}
]
},
{
"id":"anchors",
"label":"The tether stations",
"cost":10000,
"note":"Fixture bills appropriation bills/appropriation/clauses/4/levels/1/note",
"effects":[
{
"law":{
"transit_subsidy":"anchors"
}
},
{
"move":{
"public_standing":3
}
}
]
},
{
"id":"all",
"label":"Every station",
"cost":22000,
"note":"Fixture bills appropriation bills/appropriation/clauses/4/levels/2/note",
"effects":[
{
"law":{
"transit_subsidy":"all"
}
},
{
"move":{
"public_standing":5,
"solvency":-4000
}
}
]
}
]
},
{
"id":"rate_volume",
"name":"Fixture bills appropriation bills/appropriation/clauses/5/name",
"default":"standard",
"note":"Fixture bills appropriation bills/appropriation/clauses/5/note",
"levels":[
{
"id":"relief",
"label":"Cut by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/5/levels/0/note",
"effects":[
{
"law":{
"rate_volume":"relief"
}
},
{
"move":{
"standing.ring":4,
"public_standing":1
}
}
]
},
{
"id":"low",
"label":"Cut by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/5/levels/1/note",
"effects":[
{
"law":{
"rate_volume":"low"
}
},
{
"move":{
"standing.ring":2
}
}
]
},
{
"id":"standard",
"label":"Unchanged",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/5/levels/2/note",
"effects":[
{
"law":{
"rate_volume":"standard"
}
}
]
},
{
"id":"high",
"label":"Raised by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/5/levels/3/note",
"effects":[
{
"law":{
"rate_volume":"high"
}
},
{
"move":{
"standing.ring":-3
}
}
]
},
{
"id":"surcharge",
"label":"Raised by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/5/levels/4/note",
"effects":[
{
"law":{
"rate_volume":"surcharge"
}
},
{
"move":{
"standing.ring":-5,
"public_standing":-1
}
}
]
}
]
},
{
"id":"rate_thermal",
"name":"Fixture bills appropriation bills/appropriation/clauses/6/name",
"default":"standard",
"note":"Fixture bills appropriation bills/appropriation/clauses/6/note",
"levels":[
{
"id":"relief",
"label":"Cut by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/6/levels/0/note",
"effects":[
{
"law":{
"rate_thermal":"relief"
}
},
{
"move":{
"public_standing":3,
"standing.low":1
}
}
]
},
{
"id":"low",
"label":"Cut by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/6/levels/1/note",
"effects":[
{
"law":{
"rate_thermal":"low"
}
},
{
"move":{
"public_standing":1
}
}
]
},
{
"id":"standard",
"label":"Unchanged",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/6/levels/2/note",
"effects":[
{
"law":{
"rate_thermal":"standard"
}
}
]
},
{
"id":"high",
"label":"Raised by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/6/levels/3/note",
"effects":[
{
"law":{
"rate_thermal":"high"
}
},
{
"move":{
"public_standing":-2,
"standing.low":-2
}
}
]
},
{
"id":"surcharge",
"label":"Raised by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/6/levels/4/note",
"effects":[
{
"law":{
"rate_thermal":"surcharge"
}
},
{
"move":{
"public_standing":-4,
"standing.low":-3
}
}
]
}
]
},
{
"id":"rate_substrate",
"name":"Fixture bills appropriation bills/appropriation/clauses/7/name",
"default":"standard",
"note":"Fixture bills appropriation bills/appropriation/clauses/7/note",
"levels":[
{
"id":"relief",
"label":"Cut by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/7/levels/0/note",
"effects":[
{
"law":{
"rate_substrate":"relief"
}
},
{
"move":{
"public_standing":2,
"legitimacy":1
}
}
]
},
{
"id":"low",
"label":"Cut by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/7/levels/1/note",
"effects":[
{
"law":{
"rate_substrate":"low"
}
},
{
"move":{
"public_standing":1
}
}
]
},
{
"id":"standard",
"label":"Unchanged",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/7/levels/2/note",
"effects":[
{
"law":{
"rate_substrate":"standard"
}
}
]
},
{
"id":"high",
"label":"Raised by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/7/levels/3/note",
"effects":[
{
"law":{
"rate_substrate":"high"
}
},
{
"move":{
"public_standing":-2,
"legitimacy":-1
}
}
]
},
{
"id":"surcharge",
"label":"Raised by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/7/levels/4/note",
"effects":[
{
"law":{
"rate_substrate":"surcharge"
}
},
{
"move":{
"public_standing":-3,
"legitimacy":-3
}
}
]
}
]
},
{
"id":"rate_transit",
"name":"Fixture bills appropriation bills/appropriation/clauses/8/name",
"default":"standard",
"note":"Fixture bills appropriation bills/appropriation/clauses/8/note",
"levels":[
{
"id":"relief",
"label":"Cut by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/8/levels/0/note",
"effects":[
{
"law":{
"rate_transit":"relief"
}
},
{
"move":{
"standing.far":3,
"standing.external":3
}
}
]
},
{
"id":"low",
"label":"Cut by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/8/levels/1/note",
"effects":[
{
"law":{
"rate_transit":"low"
}
},
{
"move":{
"standing.far":2,
"standing.external":1
}
}
]
},
{
"id":"standard",
"label":"Unchanged",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/8/levels/2/note",
"effects":[
{
"law":{
"rate_transit":"standard"
}
}
]
},
{
"id":"high",
"label":"Raised by a tenth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/8/levels/3/note",
"effects":[
{
"law":{
"rate_transit":"high"
}
},
{
"move":{
"standing.far":-2,
"standing.external":-2
}
}
]
},
{
"id":"surcharge",
"label":"Raised by a fifth",
"cost":0,
"note":"Fixture bills appropriation bills/appropriation/clauses/8/levels/4/note",
"effects":[
{
"law":{
"rate_transit":"surcharge"
}
},
{
"move":{
"standing.far":-4,
"standing.external":-4,
"public_standing":-1
}
}
]
}
]
}
],
"stances":{
"cu":"for",
"psa":"for",
"rv":"for",
"ind":"for",
"upl":{
"forPct":0.5
},
"geo":{
"forPct":0.5
},
"cl":"against",
"sc":{
"forPct":0.3
},
"hul":{
"forPct":0.4
},
"fh":"against",
"gb":{
"forPct":0.3
},
"des":{
"forPct":0.4
}
},
"onPass":[
{
"flag":"supply_granted"
}
],
"onFail":[
{
"flag":"supply_refused"
}
]
},
{
"id":"thermal2",
"ref":"HC 2080/094",
"stage":"second_reading",
"owner":"cu",
"touches":[
"thermal_quota"
],
"author":"vellan",
"cosponsors":[
"laughon"
],
"title":"Fixture bills thermal2 bills/thermal2/title",
"summary":"Fixture bills thermal2 bills/thermal2/summary",
"contested":"The bill moves quota from the ring band to the middle band, which the Allocation Act allows and which has not been done for nine years. Ember Ridge is 213,000 people three days from a shed order. Anselm Ring paid for the last diversion, and its objection is that a quota moved to answer one fault becomes the ordinary way heat is allocated, so the ring would pay for the next fault too.",
"dualMajority":false,
"axes":{
"economic":-0.6,
"authority":0.2,
"personhood":0,
"sovereignty":0.7,
"trade":0.4
},
"stances":{
"cu":"for",
"psa":"for",
"rv":"for",
"upl":"for",
"geo":"for",
"sc":{
"forPct":0.4
},
"cl":{
"forPct":0.3
}
},
"amendments":[
{
"id":"th2_ring",
"label":"Fixture bills thermal2 bills/thermal2/amendments/0/label",
"note":"Fixture bills thermal2 bills/thermal2/amendments/0/note",
"effects":[
{
"flag":{
"thermal2_ring_first":true
}
},
{
"move":{
"loyalty.cl":4
}
},
{
"move":{
"loyalty.hul":5
}
},
{
"move":{
"loyalty.sc":-5
}
},
{
"station":{
"vantage":{
"closure":0.02
}
}
}
]
}
],
"onPass":[
{
"station":{
"vantage":{
"closure":0.04
}
}
},
{
"move":{
"thermal_margin":9
}
},
{
"move":{
"price.thermal":-22
}
},
{
"wire":"THERMAL QUOTA REALLOCATED; QUOTA PRICE FALLS SHARPLY"
}
],
"onFail":[
{
"move":{
"thermal_margin":-4
}
},
{
"move":{
"price.thermal":8
}
}
]
},
{
"id":"shedorder",
"ref":"HC 2080/061",
"stage":"blocked",
"owner":"cu",
"referrable":true,
"touches":[
"shed_order_priority",
"essential_services_law"
],
"author":"halloran",
"cosponsors":[
"kaunda"
],
"title":"Fixture bills shedorder bills/shedorder/title",
"summary":"Fixture bills shedorder bills/shedorder/summary",
"contested":"Every party wants the shed order answerable to someone, and they disagree about whom. The engineering authority says the ninety seconds after a seal fails are too short to convene a committee, and it has the incident record to show it. The benches asking for review answer that the schedule deciding who stops running has never been read aloud in the House, and that an authority no one can question cannot be held to account.",
"dualMajority":true,
"axes":{
"economic":-0.7,
"authority":-0.9,
"personhood":0.5,
"sovereignty":0.6,
"trade":0.1
},
"stances":{
"cu":"for",
"psa":"for",
"rv":{
"for":11
},
"upl":"for",
"geo":"for",
"gb":"against",
"hul":"against",
"fh":"against",
"cl":{
"abstain":true,
"absent":2
},
"sc":{
"forPct":0.35
}
},
"onPass":[
{
"law":{
"shed_order_authority":"statute"
}
},
{
"move":{
"public_standing":6
}
}
],
"onFail":[
{
"move":{
"loyalty.cu_halloran":-8
}
}
]
},
{
"id":"anchor_kepler",
"ref":"HC 2080/103",
"stage":"assent",
"owner":"psa",
"campaign":[
"world",
"flash_i"
],
"touches":[
"anchor_concession"
],
"author":"ivarsen",
"title":"Fixture bills anchor_kepler bills/anchor_kepler/title",
"summary":"Fixture bills anchor_kepler bills/anchor_kepler/summary",
"contested":"Kenya owns the land at the elevator's anchor, so the Commonwealth runs the elevator as a tenant under a concession. Ratifying the renewal keeps the elevator running and adds CW$8bn to what the Treasury can spend. Refusing lets the concession lapse, which costs the Treasury CW$6bn, and Anchorage, a station of 231,000 people, depends on the elevator. The Liberal Party supports ratification. Home Rule and the Association of Engineers and Systems oppose it, and opponents argue that a renewed lease keeps the Commonwealth a tenant at the next renewal.",
"dualMajority":false,
"axes":{
"economic":0.6,
"authority":0.1,
"personhood":0,
"sovereignty":0.5,
"trade":0.95
},
"stances":{
"cl":"for",
"cu":{
"forPct":0.7
},
"psa":{
"forPct":0.5
},
"sc":"against",
"hul":"against"
},
"onPass":[
{
"move":{
"solvency":8000
}
},
{
"station":{
"kepler":{
"closure":0.02
}
}
},
{
"move":{
"price.transit":-11
}
}
],
"onFail":[
{
"move":{
"solvency":-6000
}
},
{
"wire":"ANCHORAGE CONCESSION LAPSES; EARTH STATE SIGNALS REVIEW"
}
]
},
{
"id":"substrate_insurance",
"ref":"HC 2080/121",
"stage":"drafting",
"owner":"psa",
"touches":[
"substrate_insurance",
"risk_pricing"
],
"author":"girard",
"title":"Fixture bills substrate_insurance bills/substrate_insurance/title",
"summary":"Fixture bills substrate_insurance bills/substrate_insurance/summary",
"effectNote":"Fixture bills substrate_insurance bills/substrate_insurance/effectNote",
"contested":"The means test decides whether a person who cannot pay for substrate is insured or suspended, and the bill's supporters say no one should be suspended for poverty. It costs the reserve eleven billion dollars and takes thirty-four thousand people a year off the default register. The objection is that cover without a means test would never be withdrawn once given, and that the substrate providers would raise every covered person's rent to match the guarantee.",
"dualMajority":false,
"axes":{
"economic":-0.85,
"authority":-0.2,
"personhood":0.6,
"sovereignty":0.6,
"trade":0.2
},
"stances":{
"psa":"for",
"cu":{
"forPct":0.8
},
"upl":"for",
"geo":"for",
"rv":{
"forPct":0.6
},
"fh":"against",
"cl":{
"forPct":0.25
},
"hul":"against"
},
"onPass":[
{
"move":{
"solvency":-11000
}
},
{
"move":{
"public_standing":7
}
},
{
"move":{
"loyalty.psa":12
}
},
{
"station":{
"ashfield":{
"suspended":-1800
}
}
},
{
"move":{
"price.substrate":-14
}
},
{
"wire":"SUBSTRATE INSURANCE UPRATED; MEANS TEST ABOLISHED"
}
],
"onFail":[
{
"move":{
"loyalty.psa":-13
}
}
]
},
{
"id":"continuity_registration",
"ref":"HC 2080/129",
"stage":"drafting",
"owner":"rv",
"priority":true,
"touches":[
"registry_powers",
"reclassification_practice"
],
"author":"marin",
"cosponsors":[
"abadi"
],
"title":"Fixture bills continuity_registration bills/continuity_registration/title",
"summary":"Fixture bills continuity_registration bills/continuity_registration/summary",
"effectNote":"Fixture bills continuity_registration bills/continuity_registration/effectNote",
"contested":"The Congregational Democratic Alliance has asked at every coalition meeting since this government formed for a procedure before an instance is reabsorbed: a register, a hearing, and a recorded decision. The objection is that a register of persons who may be reabsorbed could later be put to other uses, and that a hearing does not stop the reabsorption.",
"dualMajority":false,
"axes":{
"economic":-0.2,
"authority":-0.1,
"personhood":-0.85,
"sovereignty":0.4,
"trade":-0.1
},
"stances":{
"rv":"for",
"cu":{
"forPct":0.65
},
"des":"for",
"hul":{
"forPct":0.7
},
"gb":{
"forPct":0.5
},
"psa":"against",
"cl":"against",
"upl":{
"abstain":true,
"absent":2
}
},
"onPass":[
{
"move":{
"loyalty.rv":18
}
},
{
"move":{
"loyalty.psa":-14
}
},
{
"wire":"CONTINUITY REGISTER ESTABLISHED; SUBSTRATE LEFT VOTES AGAINST GOVERNMENT BILL"
}
],
"onFail":[
{
"move":{
"loyalty.rv":-16
}
}
]
},
{
"id":"substrate_public_stake",
"ref":"HC 2080/133",
"stage":"drafting",
"owner":"psa",
"touches":[
"substrate_ownership"
],
"author":"ivarsen",
"title":"Fixture bills substrate_public_stake bills/substrate_public_stake/title",
"summary":"Fixture bills substrate_public_stake bills/substrate_public_stake/summary",
"effectNote":"Fixture bills substrate_public_stake bills/substrate_public_stake/effectNote",
"contested":"Air, water, thermal and computation are the four things a habitat cannot do without, and the three companies selling computation have captive customers and no competitor to lose them to. A controlling stake is the only lever short of a charter amendment, and it takes four functional seats out of corporate hands on the way through. The objection is that the government would then both set the standard for substrate and sell it, with no independent check on its own pricing.",
"dualMajority":false,
"axes":{
"economic":-0.95,
"authority":0.1,
"personhood":0.4,
"sovereignty":0.7,
"trade":0
},
"stances":{
"psa":"for",
"cu":{
"forPct":0.85
},
"upl":"for",
"geo":{
"forPct":0.6
},
"rv":{
"forPct":0.4
},
"cl":"against",
"fh":"against",
"hul":{
"forPct":0.3
},
"gb":{
"forPct":0.2
}
},
"onPass":[
{
"law":{
"substrate_public_share":0.6
}
},
{
"move":{
"price.substrate":-26
}
},
{
"move":{
"solvency":-19000
}
},
{
"move":{
"public_standing":5
}
},
{
"move":{
"loyalty.psa":16
}
},
{
"move":{
"loyalty.cl":-20
}
},
{
"move":{
"loyalty.fh":-14
}
},
{
"wire":"PUBLIC STAKE TAKEN IN SUBSTRATE PROVIDERS; RENTS EXPECTED TO FALL"
}
],
"onFail":[
{
"move":{
"loyalty.psa":-11
}
},
{
"move":{
"price.substrate":6
}
}
]
},
{
"id":"civic_clock",
"ref":"HC 2080/171",
"stage":"drafting",
"owner":"psa",
"touches":[
"substrate_ownership",
"thermal_quota"
],
"author":"trottier",
"cosponsors":[
"herrera"
],
"title":"Fixture bills civic_clock bills/civic_clock/title",
"summary":"Fixture bills civic_clock bills/civic_clock/summary",
"contested":"At 0.3x a four-year parliament is fourteen subjective months, and 560,000 people vote on a campaign they could not follow at the speed it was fought. The case for the minimum is that a vote cast without the argument is a vote in name only. The case against is the cost: seventy billion dollars a year from the reserve, and the heat of running half a million minds faster through radiators that are already the binding constraint. Most of that cost falls on the PSD's embodied voters.",
"dualMajority":false,
"axes":{
"economic":-0.8,
"authority":-0.3,
"personhood":0.85,
"sovereignty":0.4,
"trade":0
},
"stances":{
"psa":"for",
"upl":"for",
"cu":{
"forPct":0.6
},
"rv":"against",
"fh":"against",
"gb":"against"
},
"onPass":[
{
"law":{
"civic_clock_minimum":1
}
},
{
"move":{
"loyalty.psa":6
}
},
{
"move":{
"loyalty.cu_maintenance":-6
}
},
{
"wire":"CIVIC CLOCK ACT PASSES: EVERY ENFRANCHISED MIND AT REAL TIME"
}
],
"onFail":[
{
"move":{
"loyalty.psa":-6
}
}
]
},
{
"id":"debt_moratorium",
"ref":"HC 2080/177",
"stage":"drafting",
"owner":"psa",
"touches":[
"substrate_insurance",
"risk_pricing"
],
"author":"herrera",
"cosponsors":[
"trottier"
],
"title":"Fixture bills debt_moratorium bills/debt_moratorium/title",
"summary":"Fixture bills debt_moratorium bills/debt_moratorium/summary",
"contested":"With the debt accruing, a person suspended for default runs up cost for every sitting they cannot earn, and most of them never come back. The Underwriters answer that if the debt pauses, going cold becomes the cheapest way to wait out a bad quarter, suspensions rise, and the providers carry the frozen balances. The bill decides which of the two costs the Commonwealth bears.",
"dualMajority":false,
"axes":{
"economic":-0.6,
"authority":-0.5,
"personhood":0.7,
"sovereignty":0.2,
"trade":0
},
"stances":{
"psa":"for",
"upl":"for",
"gb":"against",
"fh":"against",
"cl":"against"
},
"onPass":[
{
"law":{
"suspension_debt_accrual":false
}
},
{
"move":{
"loyalty.psa":5
}
},
{
"move":{
"actor.underwriters":-6
}
},
{
"wire":"DEBT MORATORIUM PASSES: NO SUBSTRATE DEBT RUNS WHILE A PERSON IS COLD"
}
],
"onFail":[
{
"move":{
"loyalty.psa":-4
}
}
]
}
],
"instruments":[
{
"id":"si_2080_44",
"title":"Fixture instruments si_2080_44 instruments/si_2080_44/title",
"number":"SI 2080/44",
"author":"attestation_registry",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"summary":"Fixture instruments si_2080_44 instruments/si_2080_44/summary",
"effect_note":"Fixture instruments si_2080_44 instruments/si_2080_44/effect_note",
"effects":[
{
"functional":{
"fc_lifesupport":{
"cu":2,
"gb":-2
}
}
},
{
"flag":"board_packed"
},
{
"move":{
"loyalty.gb":-30
}
},
{
"move":{
"rel.gb_chair":-40
}
},
{
"signatures":2
},
{
"wire":"LICENSING ORDER LAID; GUILD BENCH SEEKS EMERGENCY DEBATE"
}
],
"reverse":[
{
"functional":{
"fc_lifesupport":{
"cu":-2,
"gb":2
}
}
},
{
"flag":{
"board_packed":false
}
}
],
"political_cost":[
{
"move":{
"public_standing":-5
}
},
{
"move":{
"loyalty.cu_halloran":-9
}
}
],
"prayer_stances":{
"cu":"against",
"psa":"against",
"rv":{

},
"gb":"for",
"hul":"for",
"fh":"for",
"cl":"for"
}
},
{
"id":"si_2080_45",
"title":"Fixture instruments si_2080_45 instruments/si_2080_45/title",
"number":"SI 2080/45",
"author":"attestation_registry",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"when":{
"flags":[
"licensure_carveout_offered"
]
},
"summary":"Fixture instruments si_2080_45 instruments/si_2080_45/summary",
"effect_note":"Fixture instruments si_2080_45 instruments/si_2080_45/effect_note",
"effects":[
{
"flag":"licensing_exempted"
},
{
"move":{
"rel.gb_chair":6
}
},
{
"move":{
"loyalty.gb":4
}
},
{
"wire":"ORDER KEEPS COPIES OFF THE LIFE SUPPORT LICENCE, AS PROMISED TO THE PANEL"
}
],
"reverse":[
{
"flag":{
"licensing_exempted":false
}
}
],
"political_cost":[
{
"move":{
"loyalty.psa":-6
}
}
],
"prayer_stances":{
"cu":"against",
"gb":"against",
"hul":"against",
"psa":"for"
}
},
{
"id":"si_2080_51",
"title":"Fixture instruments si_2080_51 instruments/si_2080_51/title",
"number":"SI 2080/51",
"author":"life_support",
"procedure":"affirmative",
"revocable":true,
"summary":"Fixture instruments si_2080_51 instruments/si_2080_51/summary",
"effect_note":"Fixture instruments si_2080_51 instruments/si_2080_51/effect_note",
"effects":[
{
"move":{
"thermal_margin":7
}
},
{
"move":{
"price.thermal":-9
}
},
{
"station":{
"vantage":{
"suspended":-900
}
}
},
{
"flag":"vantage_diverted"
},
{
"wire":"EMERGENCY THERMAL DIVERSION APPROVED FOR EMBER RIDGE"
}
],
"reverse":[
{
"move":{
"thermal_margin":-7
}
},
{
"move":{
"price.thermal":9
}
}
],
"political_cost":[
{
"move":{
"solvency":-6000
}
}
],
"prayer_stances":{
"cu":"against",
"psa":"against",
"cl":"for",
"fh":"for"
}
},
{
"id":"si_2080_58",
"title":"Fixture instruments si_2080_58 instruments/si_2080_58/title",
"number":"SI 2080/58",
"author":"attestation_registry",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"summary":"Fixture instruments si_2080_58 instruments/si_2080_58/summary",
"effect_note":"Fixture instruments si_2080_58 instruments/si_2080_58/effect_note",
"effects":[
{
"station":{
"ashfield":{
"attested":-0.03
},
"drift":{
"attested":-0.04
},
"cinder":{
"attested":-0.035
},
"tannery":{
"attested":-0.03
}
}
},
{
"flag":"attestation_tightened"
},
{
"move":{
"loyalty.gb":6
}
},
{
"move":{
"loyalty.hul":8
}
},
{
"move":{
"loyalty.psa":-14
}
},
{
"move":{
"loyalty.cu_halloran":-12
}
},
{
"wire":"REGISTRY ORDER SHORTENS ATTESTATION LAPSE TO EIGHTEEN MONTHS"
}
],
"reverse":[
{
"station":{
"ashfield":{
"attested":0.03
},
"drift":{
"attested":0.04
},
"cinder":{
"attested":0.035
},
"tannery":{
"attested":0.03
}
}
},
{
"flag":{
"attestation_tightened":false
}
}
],
"political_cost":[
{
"move":{
"public_standing":-3
}
}
],
"prayer_stances":{
"cu":{

},
"psa":"for",
"rv":"for",
"upl":"for",
"geo":"for",
"gb":"against",
"hul":"against"
}
},
{
"id":"si_2080_47",
"title":"Fixture instruments si_2080_47 instruments/si_2080_47/title",
"number":"SI 2080/47",
"author":"attestation_registry",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"summary":"Fixture instruments si_2080_47 instruments/si_2080_47/summary",
"effect_note":"Fixture instruments si_2080_47 instruments/si_2080_47/effect_note",
"effects":[
{
"functional":{
"fc_legal":{
"psa":2,
"gb":-1,
"hul":-1
}
}
},
{
"flag":"legal_board_packed"
},
{
"move":{
"loyalty.gb":-20
}
},
{
"move":{
"loyalty.hul":-18
}
},
{
"move":{
"loyalty.psa":10
}
},
{
"signatures":3
},
{
"wire":"SECOND LICENSING ORDER LAID; OPPOSITION CALLS IT A PATTERN"
}
],
"reverse":[
{
"functional":{
"fc_legal":{
"psa":-2,
"gb":1,
"hul":1
}
}
},
{
"flag":{
"legal_board_packed":false
}
}
],
"political_cost":[
{
"move":{
"public_standing":-8
}
},
{
"move":{
"loyalty.cu_halloran":-14
}
}
],
"prayer_stances":{
"cu":{
"ifLoyaltyBelow":30
},
"psa":"against",
"rv":{
"ifLoyaltyBelow":35
},
"gb":"for",
"hul":"for",
"fh":"for",
"cl":"for"
}
},
{
"id":"rung1_conservation",
"campaign":[
"world",
"flash_i"
],
"title":"Fixture instruments rung1_conservation instruments/rung1_conservation/title",
"number":"SI 2080/61",
"author":"substrate_thermal",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"when":{
"flagsAbsent":[
"a1_orders_locked"
]
},
"summary":"Fixture instruments rung1_conservation instruments/rung1_conservation/summary",
"effect_note":"Fixture instruments rung1_conservation instruments/rung1_conservation/effect_note",
"effects":[
{
"move":{
"thermal_margin":3
}
},
{
"flag":"rung1_tried"
},
{
"wire":"CONSERVATION APPEAL ISSUED TO STATION AUTHORITIES"
}
],
"reverse":[
{
"move":{
"thermal_margin":-3
}
},
{
"flag":{
"rung1_tried":false
}
}
],
"political_cost":[
{
"move":{
"public_standing":-2
}
}
]
},
{
"id":"rung2_clockrate",
"campaign":[
"world",
"flash_i"
],
"title":"Fixture instruments rung2_clockrate instruments/rung2_clockrate/title",
"number":"SI 2080/62",
"author":"persons_continuity",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"when":{
"flags":[
"rung1_tried"
]
},
"summary":"Fixture instruments rung2_clockrate instruments/rung2_clockrate/summary",
"effect_note":"Fixture instruments rung2_clockrate instruments/rung2_clockrate/effect_note",
"effects":[
{
"move":{
"thermal_margin":4
}
},
{
"move":{
"loyalty.psa":-8
}
},
{
"flag":"rung2_tried"
},
{
"wire":"CLOCK RATES CUT FOUR PER CENT; SUBSTRATE LEFT PROTESTS"
}
],
"reverse":[
{
"move":{
"thermal_margin":-4
}
},
{
"move":{
"loyalty.psa":8
}
},
{
"flag":{
"rung2_tried":false
}
}
],
"political_cost":[
{
"move":{
"loyalty.psa":-6
}
}
]
},
{
"id":"rung3_deferred",
"title":"Fixture instruments rung3_deferred instruments/rung3_deferred/title",
"number":"SI 2080/63",
"author":"substrate_thermal",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"when":{
"flags":[
"rung2_tried"
]
},
"summary":"Fixture instruments rung3_deferred instruments/rung3_deferred/summary",
"effect_note":"Fixture instruments rung3_deferred instruments/rung3_deferred/effect_note",
"effects":[
{
"move":{
"thermal_margin":5
}
},
{
"move":{
"price.substrate":-4
}
},
{
"move":{
"loyalty.gb":-6
}
},
{
"move":{
"loyalty.hul":-6
}
},
{
"flag":"rung3_tried"
},
{
"wire":"DEFERRED-COMPUTATION SCHEDULE IMPOSED; GUILD BENCH OBJECTS"
}
],
"reverse":[
{
"move":{
"thermal_margin":-5
}
},
{
"move":{
"price.substrate":4
}
},
{
"move":{
"loyalty.gb":6
}
},
{
"move":{
"loyalty.hul":6
}
},
{
"flag":{
"rung3_tried":false
}
}
],
"political_cost":[
{
"move":{
"loyalty.gb":-5
}
},
{
"move":{
"loyalty.hul":-5
}
}
]
},
{
"id":"rung4_appropriation",
"title":"Fixture instruments rung4_appropriation instruments/rung4_appropriation/title",
"number":"SI 2080/64",
"author":"treasury",
"procedure":"affirmative",
"approvalFloor":0.9,
"revocable":true,
"when":{
"flags":[
"rung3_tried"
]
},
"summary":"Fixture instruments rung4_appropriation instruments/rung4_appropriation/summary",
"effect_note":"Fixture instruments rung4_appropriation instruments/rung4_appropriation/effect_note",
"effects":[
{
"move":{
"thermal_margin":7
}
},
{
"move":{
"solvency":-12000
}
},
{
"flag":"rung4_tried"
},
{
"wire":"EMERGENCY THERMAL APPROPRIATION APPROVED"
}
],
"reverse":[
{
"move":{
"thermal_margin":-7
}
},
{
"move":{
"solvency":12000
}
},
{
"flag":{
"rung4_tried":false
}
}
],
"political_cost":[
{
"move":{
"solvency":-10000
}
},
{
"move":{
"public_standing":-3
}
}
]
},
{
"id":"rung5_purchase",
"title":"Fixture instruments rung5_purchase instruments/rung5_purchase/title",
"number":"SI 2080/65",
"author":"treasury",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"when":{
"flags":[
"rung4_tried"
]
},
"summary":"Fixture instruments rung5_purchase instruments/rung5_purchase/summary",
"effect_note":"Fixture instruments rung5_purchase instruments/rung5_purchase/effect_note",
"effects":[
{
"move":{
"thermal_margin":9
}
},
{
"move":{
"price.thermal":-14
}
},
{
"move":{
"solvency":-18000
}
},
{
"flag":"rung5_tried"
},
{
"wire":"GOVERNMENT BUYS THERMAL QUOTA AT MARKET; PRICE FALLS"
}
],
"reverse":[
{
"move":{
"thermal_margin":-9
}
},
{
"move":{
"price.thermal":14
}
},
{
"move":{
"solvency":18000
}
},
{
"flag":{
"rung5_tried":false
}
}
],
"political_cost":[
{
"move":{
"solvency":-14000
}
}
]
},
{
"id":"rung6_drawdown",
"title":"Fixture instruments rung6_drawdown instruments/rung6_drawdown/title",
"number":"SI 2080/66",
"author":"treasury",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"when":{
"flags":[
"rung5_tried"
]
},
"summary":"Fixture instruments rung6_drawdown instruments/rung6_drawdown/summary",
"effect_note":"Fixture instruments rung6_drawdown instruments/rung6_drawdown/effect_note",
"effects":[
{
"move":{
"thermal_margin":11
}
},
{
"move":{
"price.substrate":-10
}
},
{
"move":{
"public_standing":-12
}
},
{
"move":{
"loyalty.psa":-10
}
},
{
"flag":"rung6_tried"
},
{
"wire":"INSURANCE FUND DRAWN DOWN; MINISTERS DECLINE TO SAY WHEN IT REFILLS"
}
],
"reverse":[
{
"move":{
"thermal_margin":-11
}
},
{
"move":{
"price.substrate":10
}
},
{
"move":{
"public_standing":12
}
},
{
"move":{
"loyalty.psa":10
}
},
{
"flag":{
"rung6_tried":false
}
}
],
"political_cost":[
{
"move":{
"public_standing":-10
}
},
{
"move":{
"loyalty.psa":-8
}
}
]
},
{
"id":"rung7_standards",
"title":"Fixture instruments rung7_standards instruments/rung7_standards/title",
"number":"SI 2080/67",
"author":"life_support",
"procedure":"affirmative",
"approvalFloor":0.9,
"revocable":true,
"when":{
"flags":[
"rung6_tried"
]
},
"summary":"Fixture instruments rung7_standards instruments/rung7_standards/summary",
"effect_note":"Fixture instruments rung7_standards instruments/rung7_standards/effect_note",
"effects":[
{
"move":{
"thermal_margin":13
}
},
{
"move":{
"loyalty.gb":-16
}
},
{
"move":{
"loyalty.hul":-16
}
},
{
"move":{
"loyalty.psa":-12
}
},
{
"flag":"rung7_tried"
},
{
"wire":"PERFORMANCE STANDARDS LOWERED A GRADE; BOARDS COMPLY UNDER PROTEST"
}
],
"reverse":[
{
"move":{
"thermal_margin":-13
}
},
{
"move":{
"loyalty.gb":16
}
},
{
"move":{
"loyalty.hul":16
}
},
{
"move":{
"loyalty.psa":12
}
},
{
"flag":{
"rung7_tried":false
}
}
],
"political_cost":[
{
"move":{
"loyalty.gb":-12
}
},
{
"move":{
"loyalty.hul":-12
}
}
]
},
{
"id":"rung8_powers",
"title":"Fixture instruments rung8_powers instruments/rung8_powers/title",
"number":"SI 2080/68",
"author":"law_charter",
"procedure":"affirmative",
"revocable":true,
"when":{
"flags":[
"rung7_tried"
]
},
"summary":"Fixture instruments rung8_powers instruments/rung8_powers/summary",
"effect_note":"Fixture instruments rung8_powers instruments/rung8_powers/effect_note",
"effects":[
{
"move":{
"thermal_margin":15
}
},
{
"move":{
"public_standing":-18
}
},
{
"move":{
"loyalty.cu_maintenance":-14
}
},
{
"move":{
"loyalty.psa":-14
}
},
{
"flag":"rung8_tried"
},
{
"wire":"EMERGENCY POWERS ASSUMED OVER THE TIER REGISTERS"
}
],
"reverse":[
{
"move":{
"thermal_margin":-15
}
},
{
"move":{
"public_standing":18
}
},
{
"move":{
"loyalty.cu_maintenance":14
}
},
{
"move":{
"loyalty.psa":14
}
},
{
"flag":{
"rung8_tried":false
}
}
],
"political_cost":[
{
"move":{
"public_standing":-16
}
},
{
"move":{
"loyalty.cu_maintenance":-12
}
}
]
},
{
"id":"rung9_suspension",
"title":"Fixture instruments rung9_suspension instruments/rung9_suspension/title",
"number":"SI 2080/69",
"author":"contingencies",
"procedure":"affirmative",
"revocable":true,
"when":{
"flags":[
"rung8_tried"
]
},
"summary":"Fixture instruments rung9_suspension instruments/rung9_suspension/summary",
"effect_note":"Fixture instruments rung9_suspension instruments/rung9_suspension/effect_note",
"effects":[
{
"move":{
"thermal_margin":18
}
},
{
"move":{
"public_standing":-30
}
},
{
"move":{
"loyalty.cu_maintenance":-22
}
},
{
"move":{
"loyalty.psa":-20
}
},
{
"move":{
"loyalty.cu_halloran":-20
}
},
{
"flag":"rung9_tried"
},
{
"wire":"FEDERAL SUSPENSION ORDER ISSUED; THE SCHEDULE IS PUBLISHED"
}
],
"reverse":[
{
"move":{
"thermal_margin":-18
}
},
{
"move":{
"public_standing":30
}
},
{
"move":{
"loyalty.cu_maintenance":22
}
},
{
"move":{
"loyalty.psa":20
}
},
{
"move":{
"loyalty.cu_halloran":20
}
},
{
"flag":{
"rung9_tried":false
}
}
],
"political_cost":[
{
"move":{
"public_standing":-20
}
},
{
"move":{
"loyalty.cu_maintenance":-16
}
},
{
"move":{
"loyalty.psa":-14
}
}
]
},
{
"id":"si_2080_71",
"title":"Fixture instruments si_2080_71 instruments/si_2080_71/title",
"number":"SI 2080/71",
"author":"treasury",
"procedure":"affirmative",
"revocable":true,
"when":{
"flagsAbsent":[
"bank_directed"
]
},
"summary":"Fixture instruments si_2080_71 instruments/si_2080_71/summary",
"effect_note":"Fixture instruments si_2080_71 instruments/si_2080_71/effect_note",
"effects":[
{
"law":{
"reserve_direction":"hold"
}
},
{
"flag":"bank_directed"
},
{
"economy":{
"credibility":-0.06,
"fx":-1.5
}
},
{
"wire":"TREASURY DIRECTS RESERVE BANK TO HOLD THE CASH RATE"
}
],
"reverse":[
{
"law":{
"reserve_direction":null
}
},
{
"flag":{
"bank_directed":false
}
}
],
"political_cost":[
{
"move":{
"actor.underwriters":-4,
"legitimacy":-2
}
},
{
"move":{
"rel.castellane":-15
}
}
],
"prayer_stances":{
"cl":"for",
"fh":"for",
"gb":"for",
"hul":"for",
"geo":"for"
}
},
{
"id":"si_2080_72",
"title":"Fixture instruments si_2080_72 instruments/si_2080_72/title",
"number":"SI 2080/72",
"author":"treasury",
"procedure":"affirmative",
"revocable":true,
"when":{
"flagsAbsent":[
"bank_directed"
]
},
"summary":"Fixture instruments si_2080_72 instruments/si_2080_72/summary",
"effect_note":"Fixture instruments si_2080_72 instruments/si_2080_72/effect_note",
"effects":[
{
"law":{
"reserve_direction":"ease"
}
},
{
"flag":"bank_directed"
},
{
"economy":{
"credibility":-0.1,
"fx":-3,
"expected":0.3
}
},
{
"wire":"TREASURY DIRECTS RESERVE BANK TO CUT"
}
],
"reverse":[
{
"law":{
"reserve_direction":null
}
},
{
"flag":{
"bank_directed":false
}
}
],
"political_cost":[
{
"move":{
"actor.underwriters":-6,
"legitimacy":-3
}
},
{
"move":{
"rel.castellane":-25
}
}
],
"prayer_stances":{
"cl":"for",
"fh":"for",
"gb":"for",
"hul":"for",
"geo":"for",
"sc":"for"
}
},
{
"id":"si_2080_73",
"title":"Fixture instruments si_2080_73 instruments/si_2080_73/title",
"number":"SI 2080/73",
"author":"treasury",
"procedure":"affirmative",
"revocable":false,
"when":{
"flagsAbsent":[
"ways_and_means_opened"
]
},
"summary":"Fixture instruments si_2080_73 instruments/si_2080_73/summary",
"effect_note":"Fixture instruments si_2080_73 instruments/si_2080_73/effect_note",
"effects":[
{
"move":{
"loan.reserve_bank":20000
}
},
{
"flag":"ways_and_means_opened"
},
{
"economy":{
"credibility":-0.2,
"expected":0.8,
"fx":-4
}
},
{
"wire":"RESERVE BANK TO FINANCE THE TREASURY DIRECTLY"
}
],
"reverse":[

],
"political_cost":[
{
"move":{
"actor.underwriters":-8,
"legitimacy":-4
}
},
{
"move":{
"rel.castellane":-20
}
}
],
"prayer_stances":{
"cl":"for",
"fh":"for",
"gb":"for",
"hul":"for",
"geo":"for",
"des":"for"
}
},
{
"id":"si_2080_74",
"title":"Fixture instruments si_2080_74 instruments/si_2080_74/title",
"number":"SI 2080/74",
"author":"treasury",
"procedure":"negative",
"prayer_window":6,
"revocable":true,
"summary":"Fixture instruments si_2080_74 instruments/si_2080_74/summary",
"effect_note":"Fixture instruments si_2080_74 instruments/si_2080_74/effect_note",
"effects":[
{
"law":{
"capital_controls":true
}
},
{
"flag":"exchange_controls"
},
{
"move":{
"friction":6
}
},
{
"economy":{
"trade":-4,
"fx":2
}
},
{
"wire":"EXCHANGE CONTROLS IMPOSED; PAYMENTS TO EARTH NEED A LICENCE"
}
],
"reverse":[
{
"law":{
"capital_controls":false
}
},
{
"flag":{
"exchange_controls":false
}
},
{
"move":{
"friction":-6
}
},
{
"economy":{
"trade":4
}
}
],
"political_cost":[
{
"move":{
"loyalty.cl":-8,
"actor.underwriters":-3
}
}
],
"prayer_stances":{
"cu":"against",
"psa":"against",
"rv":"against",
"cl":"for",
"fh":"for",
"gb":"for",
"hul":"for"
}
}
],
"initiatives":[
{
"id":"approach_guild",
"title":"Fixture initiatives approach_guild initiatives/approach_guild/title",
"note":"Fixture initiatives approach_guild initiatives/approach_guild/note",
"cost":1,
"when":{
"flagsAbsent":[
"guild_met"
]
},
"event":"guild_answers",
"tempo":[
{
"label":"Send the Minister she will see",
"after":2,
"effects":[
{
"flag":{
"guild_via_minister":true
}
}
]
},
{
"label":"Write to her yourself, and be seen to",
"after":5,
"cost":1,
"effects":[
{
"flag":{
"guild_direct":true
}
},
{
"move":{
"public_standing":2
}
}
]
}
]
},
{
"id":"commission_review",
"title":"Fixture initiatives commission_review initiatives/commission_review/title",
"note":"Fixture initiatives commission_review initiatives/commission_review/note",
"cost":1,
"post":"law_charter",
"when":{
"flagsAbsent":[
"review_ordered"
]
},
"event":"review_reports",
"tempo":[
{
"label":"A note from the department, this week",
"after":2,
"effects":[
{
"flag":{
"review_thin":true,
"review_ordered":true
}
}
]
},
{
"label":"An independent inquiry, properly staffed",
"after":8,
"cost":1,
"effects":[
{
"flag":{
"review_full":true,
"review_ordered":true
}
},
{
"move":{
"solvency":-3000
}
}
]
}
]
},
{
"id":"state_the_position",
"title":"Fixture initiatives state_the_position initiatives/state_the_position/title",
"note":"Fixture initiatives state_the_position initiatives/state_the_position/note",
"cost":2,
"when":{
"flagsAbsent":[
"position_stated"
]
},
"event":"position_lands",
"tempo":[
{
"label":"At questions, in an answer",
"after":1,
"effects":[
{
"flag":{
"position_offhand":true,
"position_stated":true
}
}
]
},
{
"label":"A statement to the House, with a text",
"after":3,
"effects":[
{
"flag":{
"position_stated":true
}
},
{
"undertake":{
"id":"carry_threshold",
"text":"Carry the threshold bill this session",
"by":null,
"discharge":{
"division":"divergence",
"carried":true
}
}
},
{
"move":{
"public_standing":3,
"loyalty.cu_maintenance":-4
}
}
]
}
]
},
{
"id":"quota_forward",
"title":"Fixture initiatives quota_forward initiatives/quota_forward/title",
"note":"Fixture initiatives quota_forward initiatives/quota_forward/note",
"cost":1,
"post":"substrate_thermal",
"when":{
"flagsAbsent":[
"quota_forward_sold"
]
},
"event":"quota_forward_settles",
"tempo":[
{
"label":"A cautious forward: a slice of the margin, a slice of the cash",
"after":4,
"effects":[
{
"move":{
"solvency":9000
}
},
{
"flag":{
"quota_forward_small":true,
"quota_forward_sold":true
}
}
]
},
{
"label":"A full forward: the whole margin, and the price to match",
"after":6,
"cost":1,
"effects":[
{
"move":{
"solvency":22000
}
},
{
"flag":{
"quota_forward_full":true,
"quota_forward_sold":true
}
}
]
}
]
},
{
"id":"charter_volume",
"title":"Fixture initiatives charter_volume initiatives/charter_volume/title",
"note":"Fixture initiatives charter_volume initiatives/charter_volume/note",
"cost":1,
"post":"volume_housing",
"when":{
"flagsAbsent":[
"volume_chartered"
]
},
"event":"volume_charter_settles",
"tempo":[
{
"label":"Let it on the standard terms, for cash",
"after":4,
"effects":[
{
"move":{
"solvency":6000
}
},
{
"move":{
"price.volume":3
}
},
{
"flag":{
"charter_cash":true,
"volume_chartered":true
}
}
]
},
{
"label":"Let it against closure, at a lower rent",
"after":6,
"cost":1,
"effects":[
{
"station":{
"ashfield":{
"closure":0.05
}
}
},
{
"move":{
"legitimacy":4
}
},
{
"move":{
"price.volume":4
}
},
{
"flag":{
"charter_closure":true,
"volume_chartered":true
}
}
]
}
]
},
{
"id":"lean_on_governor",
"title":"Fixture initiatives lean_on_governor initiatives/lean_on_governor/title",
"note":"Fixture initiatives lean_on_governor initiatives/lean_on_governor/note",
"cost":1,
"when":{
"flagsAbsent":[
"governor_leaned"
],
"dissolved":false
},
"event":"governor_answers",
"tempo":[
{
"label":"Say it at the despatch box",
"after":1,
"effects":[
{
"economy":{
"credibility":-0.08,
"expected":0.2
}
},
{
"move":{
"public_standing":2
}
},
{
"flag":{
"governor_leaned":true,
"lean_public":true
}
}
]
},
{
"label":"A private word from the Treasury",
"after":2,
"effects":[
{
"economy":{
"credibility":-0.02
}
},
{
"flag":{
"governor_leaned":true,
"lean_private":true
}
}
]
}
]
},
{
"id":"defend_dollar",
"title":"Fixture initiatives defend_dollar initiatives/defend_dollar/title",
"note":"Fixture initiatives defend_dollar initiatives/defend_dollar/note",
"cost":1,
"when":{
"economyBelow":{
"fx":0.82
},
"economyAbove":{
"reserves":6000
},
"flagsAbsent":[
"dollar_defended"
]
},
"event":"dollar_line_tested",
"tempo":[
{
"label":"Intervene quietly",
"after":2,
"effects":[
{
"economy":{
"fx":2.5,
"reserves":-6000
}
},
{
"flag":{
"dollar_defended":true
}
}
]
},
{
"label":"Declare a line and defend it",
"after":4,
"cost":1,
"when":{
"economyAbove":{
"reserves":12000
}
},
"effects":[
{
"economy":{
"fx":5,
"reserves":-12000,
"credibility":0.02
}
},
{
"flag":{
"dollar_defended":true,
"dollar_line":true
}
}
]
}
]
}
],
"matters":[

],
"settlements":[
{
"id":"restriction",
"rank":1,
"name":"Fixture settlements restriction settlements/restriction/name",
"summary":"Fixture settlements restriction settlements/restriction/summary",
"closing":"Fixture settlements restriction settlements/restriction/closing",
"when":{
"lawAbove":{
"divergence_threshold_hours":167
},
"billStage":{
"divergence":"defeated"
},
"flagsAbsent":[
"tribunal_established",
"federal_schedule"
]
}
},
{
"id":"substrate_neutrality",
"rank":1,
"name":"Fixture settlements substrate_neutrality settlements/substrate_neutrality/name",
"summary":"Fixture settlements substrate_neutrality settlements/substrate_neutrality/summary",
"closing":"Fixture settlements substrate_neutrality settlements/substrate_neutrality/closing",
"when":{
"billStage":{
"divergence":"assented"
},
"lawBelow":{
"divergence_threshold_hours":49
},
"flagsAbsent":[
"tribunal_established",
"federal_schedule"
]
}
},
{
"id":"graduated_personhood",
"rank":0,
"name":"Fixture settlements graduated_personhood settlements/graduated_personhood/name",
"summary":"Fixture settlements graduated_personhood settlements/graduated_personhood/summary",
"closing":"Fixture settlements graduated_personhood settlements/graduated_personhood/closing",
"when":{
"flags":[
"tribunal_established"
]
}
},
{
"id":"federal_fudge",
"rank":2,
"name":"Fixture settlements federal_fudge settlements/federal_fudge/name",
"summary":"Fixture settlements federal_fudge settlements/federal_fudge/summary",
"closing":"Fixture settlements federal_fudge settlements/federal_fudge/closing",
"when":{
"flags":[
"federal_schedule"
]
}
}
],
"achievements":[
{
"id":"end_election",
"name":"Fixture achievements end_election achievements/end_election/name",
"tier":"ending",
"note":"Fixture achievements end_election achievements/end_election/note",
"when":{
"end":"election",
"seats":"held"
}
},
{
"id":"end_supply",
"name":"Fixture achievements end_supply achievements/end_supply/name",
"tier":"ending",
"note":"Fixture achievements end_supply achievements/end_supply/note",
"when":{
"end":"loss",
"reason":"supply"
}
},
{
"id":"end_confidence",
"name":"Fixture achievements end_confidence achievements/end_confidence/name",
"tier":"ending",
"note":"Fixture achievements end_confidence achievements/end_confidence/note",
"when":{
"end":"loss",
"reason":[
"confidence",
"no confidence"
]
}
},
{
"id":"end_ballot",
"name":"Fixture achievements end_ballot achievements/end_ballot/name",
"tier":"ending",
"note":"Fixture achievements end_ballot achievements/end_ballot/note",
"when":{
"end":"loss",
"reason":"leadership"
}
},
{
"id":"end_cascade",
"name":"Fixture achievements end_cascade achievements/end_cascade/name",
"tier":"ending",
"note":"Fixture achievements end_cascade achievements/end_cascade/note",
"when":{
"end":"loss",
"reason":"cascade"
}
},
{
"id":"set_restriction",
"name":"Fixture achievements set_restriction achievements/set_restriction/name",
"tier":"settlement",
"note":"Fixture achievements set_restriction achievements/set_restriction/note",
"when":{
"settled":"restriction"
}
},
{
"id":"set_neutrality",
"name":"Fixture achievements set_neutrality achievements/set_neutrality/name",
"tier":"settlement",
"note":"Fixture achievements set_neutrality achievements/set_neutrality/note",
"when":{
"settled":"substrate_neutrality"
}
},
{
"id":"set_graduated",
"name":"Fixture achievements set_graduated achievements/set_graduated/name",
"tier":"settlement",
"note":"Fixture achievements set_graduated achievements/set_graduated/note",
"when":{
"settled":"graduated_personhood"
}
},
{
"id":"set_federal",
"name":"Fixture achievements set_federal achievements/set_federal/name",
"tier":"settlement",
"note":"Fixture achievements set_federal achievements/set_federal/note",
"when":{
"settled":"federal_fudge"
}
},
{
"id":"act_carveout_kept",
"name":"Fixture achievements act_carveout_kept achievements/act_carveout_kept/name",
"tier":"action",
"note":"Fixture achievements act_carveout_kept achievements/act_carveout_kept/note",
"when":{
"kept":[
"licensure_carveout"
]
}
},
{
"id":"act_carveout_broken",
"name":"Fixture achievements act_carveout_broken achievements/act_carveout_broken/name",
"tier":"action",
"note":"Fixture achievements act_carveout_broken achievements/act_carveout_broken/note",
"when":{
"breached":[
"licensure_carveout"
]
}
},
{
"id":"act_tribunal",
"name":"Fixture achievements act_tribunal achievements/act_tribunal/name",
"tier":"action",
"note":"Fixture achievements act_tribunal achievements/act_tribunal/note",
"when":{
"flags":[
"tr_challenged"
]
}
},
{
"id":"act_struck",
"name":"Fixture achievements act_struck achievements/act_struck/name",
"tier":"action",
"note":"Fixture achievements act_struck achievements/act_struck/note",
"when":{
"flags":[
"tr_struck"
]
}
},
{
"id":"act_paired",
"name":"Fixture achievements act_paired achievements/act_paired/name",
"tier":"action",
"note":"Fixture achievements act_paired achievements/act_paired/note",
"when":{
"flags":[
"paired",
"pair_offered"
]
}
},
{
"id":"act_forward",
"name":"Fixture achievements act_forward achievements/act_forward/name",
"tier":"action",
"note":"Fixture achievements act_forward achievements/act_forward/note",
"when":{
"flags":[
"quota_forward_sold"
]
}
},
{
"id":"act_mars",
"name":"Fixture achievements act_mars achievements/act_mars/name",
"tier":"action",
"note":"Fixture achievements act_mars achievements/act_mars/note",
"when":{
"flags":[
"mars_asked"
]
}
},
{
"id":"act_amendment",
"name":"Fixture achievements act_amendment achievements/act_amendment/name",
"tier":"action",
"note":"Fixture achievements act_amendment achievements/act_amendment/note",
"when":{
"flagsAny":[
"divergence_delayed",
"divergence_boards"
]
}
},
{
"id":"act_budget_delayed",
"name":"Fixture achievements act_budget_delayed achievements/act_budget_delayed/name",
"tier":"action",
"note":"Fixture achievements act_budget_delayed achievements/act_budget_delayed/note",
"when":{
"log":[
"Supply delayed"
]
}
}
],
"business":[
{
"id":"q_ember",
"kind":"question",
"text":"Fixture business q_ember business/q_ember/text"
},
{
"id":"q_homestead",
"kind":"question",
"text":"Fixture business q_homestead business/q_homestead/text"
},
{
"id":"q_licensing",
"kind":"question",
"text":"Fixture business q_licensing business/q_licensing/text"
},
{
"id":"q_tether",
"kind":"question",
"text":"Fixture business q_tether business/q_tether/text"
},
{
"id":"q_closure",
"kind":"question",
"text":"Fixture business q_closure business/q_closure/text"
},
{
"id":"q_lapse",
"kind":"question",
"text":"Fixture business q_lapse business/q_lapse/text"
},
{
"id":"q_gravity",
"kind":"question",
"text":"Fixture business q_gravity business/q_gravity/text"
},
{
"id":"q_reabsorb",
"kind":"question",
"text":"Fixture business q_reabsorb business/q_reabsorb/text"
},
{
"id":"q_reserve",
"kind":"question",
"text":"Fixture business q_reserve business/q_reserve/text"
},
{
"id":"q_patronage",
"kind":"question",
"text":"Fixture business q_patronage business/q_patronage/text"
},
{
"id":"c_radiator",
"kind":"committee",
"text":"Fixture business c_radiator business/c_radiator/text"
},
{
"id":"c_appropriation",
"kind":"committee",
"text":"Fixture business c_appropriation business/c_appropriation/text"
},
{
"id":"c_reclass",
"kind":"committee",
"text":"Fixture business c_reclass business/c_reclass/text"
},
{
"id":"c_lift",
"kind":"committee",
"text":"Fixture business c_lift business/c_lift/text"
},
{
"id":"c_charter",
"kind":"committee",
"text":"Fixture business c_charter business/c_charter/text"
},
{
"id":"c_petition",
"kind":"committee",
"text":"Fixture business c_petition business/c_petition/text"
},
{
"id":"c_fran",
"kind":"committee",
"text":"Fixture business c_fran business/c_fran/text"
},
{
"id":"s_closure",
"kind":"statement",
"text":"Fixture business s_closure business/s_closure/text"
},
{
"id":"s_house",
"kind":"statement",
"text":"Fixture business s_house business/s_house/text"
},
{
"id":"s_reserve",
"kind":"statement",
"text":"Fixture business s_reserve business/s_reserve/text"
},
{
"id":"s_shed",
"kind":"statement",
"text":"Fixture business s_shed business/s_shed/text"
},
{
"id":"s_whip",
"kind":"statement",
"text":"Fixture business s_whip business/s_whip/text"
},
{
"id":"s_president",
"kind":"statement",
"text":"Fixture business s_president business/s_president/text"
},
{
"id":"s_registry",
"kind":"statement",
"text":"Fixture business s_registry business/s_registry/text"
},
{
"id":"i_attest",
"kind":"instrument",
"text":"Fixture business i_attest business/i_attest/text"
},
{
"id":"i_alloc",
"kind":"instrument",
"text":"Fixture business i_alloc business/i_alloc/text"
},
{
"id":"i_correct",
"kind":"instrument",
"text":"Fixture business i_correct business/i_correct/text"
},
{
"id":"i_negative",
"kind":"instrument",
"text":"Fixture business i_negative business/i_negative/text"
},
{
"id":"i_affirm",
"kind":"instrument",
"text":"Fixture business i_affirm business/i_affirm/text"
},
{
"id":"p_verge",
"kind":"petition",
"text":"Fixture business p_verge business/p_verge/text"
},
{
"id":"p_tannery",
"kind":"petition",
"text":"Fixture business p_tannery business/p_tannery/text"
},
{
"id":"p_harvest",
"kind":"petition",
"text":"Fixture business p_harvest business/p_harvest/text"
},
{
"id":"p_calloway",
"kind":"petition",
"text":"Fixture business p_calloway business/p_calloway/text"
},
{
"id":"pr_adjourn",
"kind":"procedure",
"text":"Fixture business pr_adjourn business/pr_adjourn/text"
},
{
"id":"pr_first",
"kind":"procedure",
"text":"Fixture business pr_first business/pr_first/text"
},
{
"id":"pr_committee",
"kind":"procedure",
"text":"Fixture business pr_committee business/pr_committee/text"
},
{
"id":"pr_named",
"kind":"procedure",
"text":"Fixture business pr_named business/pr_named/text"
},
{
"id":"pr_table",
"kind":"procedure",
"text":"Fixture business pr_table business/pr_table/text"
},
{
"id":"x_thin",
"kind":"colour",
"text":"Fixture business x_thin business/x_thin/text"
},
{
"id":"x_return",
"kind":"colour",
"text":"Fixture business x_return business/x_return/text"
},
{
"id":"x_authority",
"kind":"colour",
"text":"Fixture business x_authority business/x_authority/text"
},
{
"id":"x_spindle",
"kind":"colour",
"text":"Fixture business x_spindle business/x_spindle/text"
},
{
"id":"x_defer",
"kind":"colour",
"text":"Fixture business x_defer business/x_defer/text"
},
{
"id":"f_homestead_lift",
"kind":"question",
"when":{
"stationBelow":{
"ashfield":{
"closure":0.34
}
}
},
"text":"Fixture business f_homestead_lift business/f_homestead_lift/text"
},
{
"id":"f_thin_gov",
"kind":"colour",
"when":{
"scalarBelow":{
"public_standing":30
}
},
"text":"Fixture business f_thin_gov business/f_thin_gov/text"
},
{
"id":"f_names",
"kind":"colour",
"when":{
"signaturesAtLeast":5
},
"text":"Fixture business f_names business/f_names/text"
},
{
"id":"f_quota",
"kind":"question",
"when":{
"priceAbove":{
"thermal":105
}
},
"text":"Fixture business f_quota business/f_quota/text"
},
{
"id":"f_registry_late",
"kind":"colour",
"when":{
"lawBelow":{
"divergence_threshold_hours":100
}
},
"text":"Fixture business f_registry_late business/f_registry_late/text"
},
{
"id":"f_reserve_thin",
"kind":"question",
"when":{
"scalarBelow":{
"solvency":20000
}
},
"text":"Fixture business f_reserve_thin business/f_reserve_thin/text"
},
{
"id":"f_guild",
"kind":"colour",
"when":{
"flags":[
"board_packed"
]
},
"text":"Fixture business f_guild business/f_guild/text"
},
{
"id":"f_owed",
"kind":"colour",
"when":{
"owes":"licensure_carveout"
},
"text":"Fixture business f_owed business/f_owed/text"
},
{
"id":"q_quota_price",
"kind":"question",
"text":"Fixture business q_quota_price business/q_quota_price/text"
},
{
"id":"q_tiers",
"kind":"question",
"text":"Fixture business q_tiers business/q_tiers/text"
},
{
"id":"q_insure",
"kind":"question",
"text":"Fixture business q_insure business/q_insure/text"
},
{
"id":"q_volume",
"kind":"question",
"text":"Fixture business q_volume business/q_volume/text"
},
{
"id":"q_anchor",
"kind":"question",
"text":"Fixture business q_anchor business/q_anchor/text"
},
{
"id":"q_vacant",
"kind":"question",
"text":"Fixture business q_vacant business/q_vacant/text"
},
{
"id":"q_labour",
"kind":"question",
"text":"Fixture business q_labour business/q_labour/text"
},
{
"id":"q_transit",
"kind":"question",
"text":"Fixture business q_transit business/q_transit/text"
},
{
"id":"c_divergence",
"kind":"committee",
"when":{
"billStage":{
"divergence":"committee"
}
},
"text":"Fixture business c_divergence business/c_divergence/text"
},
{
"id":"c_thermal2",
"kind":"committee",
"when":{
"billStage":{
"thermal2":"second_reading"
}
},
"text":"Fixture business c_thermal2 business/c_thermal2/text"
},
{
"id":"c_anchor",
"kind":"committee",
"when":{
"billStage":{
"anchor_kepler":"assent"
}
},
"text":"Fixture business c_anchor business/c_anchor/text"
},
{
"id":"c_insurance_draft",
"kind":"committee",
"when":{
"billStage":{
"substrate_insurance":"drafting"
}
},
"text":"Fixture business c_insurance_draft business/c_insurance_draft/text"
},
{
"id":"c_appropriation_clause",
"kind":"committee",
"when":{
"billStage":{
"appropriation":"first_reading"
}
},
"text":"Fixture business c_appropriation_clause business/c_appropriation_clause/text"
},
{
"id":"c_forklabour",
"kind":"committee",
"text":"Fixture business c_forklabour business/c_forklabour/text"
},
{
"id":"c_lapse",
"kind":"committee",
"when":{
"siInForce":[
"si_2080_58"
]
},
"text":"Fixture business c_lapse business/c_lapse/text"
},
{
"id":"c_supply_paid",
"kind":"committee",
"when":{
"flags":[
"supply_granted"
]
},
"text":"Fixture business c_supply_paid business/c_supply_paid/text"
},
{
"id":"i_prayer",
"kind":"instrument",
"text":"Fixture business i_prayer business/i_prayer/text"
},
{
"id":"i_printed",
"kind":"instrument",
"text":"Fixture business i_printed business/i_printed/text"
},
{
"id":"i_standards",
"kind":"instrument",
"text":"Fixture business i_standards business/i_standards/text"
},
{
"id":"i_drawdown",
"kind":"instrument",
"when":{
"flags":[
"rung6_tried"
]
},
"text":"Fixture business i_drawdown business/i_drawdown/text"
},
{
"id":"i_powers",
"kind":"instrument",
"when":{
"flags":[
"rung8_tried"
]
},
"text":"Fixture business i_powers business/i_powers/text"
},
{
"id":"i_revoke",
"kind":"instrument",
"text":"Fixture business i_revoke business/i_revoke/text"
},
{
"id":"s_guild",
"kind":"statement",
"when":{
"siInForce":[
"si_2080_44"
]
},
"text":"Fixture business s_guild business/s_guild/text"
},
{
"id":"s_lowband",
"kind":"statement",
"text":"Fixture business s_lowband business/s_lowband/text"
},
{
"id":"p_leadside",
"kind":"petition",
"text":"Fixture business p_leadside business/p_leadside/text"
},
{
"id":"pr_count",
"kind":"procedure",
"text":"Fixture business pr_count business/pr_count/text"
},
{
"id":"x_lobby",
"kind":"colour",
"text":"Fixture business x_lobby business/x_lobby/text"
},
{
"id":"x_bells",
"kind":"colour",
"text":"Fixture business x_bells business/x_bells/text"
},
{
"id":"x_returns",
"kind":"colour",
"when":{
"flags":[
"supply_granted"
]
},
"text":"Fixture business x_returns business/x_returns/text"
}
],
"minutes":[
{
"id":"min_118",
"file":"PM/4/2080/118",
"sitting":1,
"classification":"Restricted: ministerial",
"from":"The Prime Minister",
"to":"Minister for Life Support",
"copy":[
"Chief Whip",
"Law Officer",
"Cabinet Secretary"
],
"struck":[
"Minister for Substrate and Thermal"
],
"notCopied":[
"Coalition liaison (New Progressive Party)"
],
"subject":"Fixture minutes min_118 minutes/min_118/subject",
"body":"Fixture minutes min_118 minutes/min_118/body"
},
{
"id":"min_121",
"file":"PM/4/2080/121",
"sitting":2,
"when":{
"flags":[
"board_packed"
]
},
"classification":"Restricted: ministerial, personal",
"from":"The Chief Whip",
"to":"The Prime Minister",
"copy":[
"Cabinet Secretary"
],
"notCopied":[
"Minister for Attestation and the Registry",
"Law Officer"
],
"subject":"Fixture minutes min_121 minutes/min_121/subject",
"body":"Fixture minutes min_121 minutes/min_121/body"
},
{
"id":"min_126",
"file":"LAW/4/2080/12",
"sitting":3,
"when":{
"flags":[
"attestation_tightened"
]
},
"classification":"Restricted: legal advice, privileged",
"from":"The Law Officer",
"to":"The Prime Minister",
"copy":[
"Cabinet Secretary"
],
"notCopied":[
"Minister for Attestation and the Registry"
],
"subject":"Fixture minutes min_126 minutes/min_126/subject",
"body":"Fixture minutes min_126 minutes/min_126/body"
},
{
"id":"min_130",
"file":"PM/4/2080/130",
"sitting":1,
"classification":"Restricted: ministerial",
"signedBy":"Adriana Flash MP · Prime Minister",
"from":"The Prime Minister",
"to":"Minister for Attestation and the Registry",
"copy":[
"Cabinet Secretary"
],
"notCopied":[
"Chief Whip",
"Law Officer"
],
"subject":"Fixture minutes min_130 minutes/min_130/subject",
"body":"Fixture minutes min_130 minutes/min_130/body",
"onSign":[
{
"flag":"licensing_direction"
},
{
"move":{
"public_standing":2
}
},
{
"move":{
"rel.gb_chair":6
}
}
]
}
],
"resolutions":[

]
},
"setup":{
"startDate":"2080-04-11",
"session":4,
"sitting":1,
"sittingDays":[
1,
2,
3,
4
],
"pm":"flash",
"playerParty":"cu",
"coalition":[
"cu",
"psa",
"rv"
],
"confidenceSupply":[
"ind"
],
"history":{
"from":2073,
"to":2080,
"unit":"year",
"participation":[
45,
44.2,
43.5,
42.4,
41.6,
40.8,
39.9,
39
],
"trade":[
88,
90,
91.5,
94,
95.5,
97,
98.5,
100
],
"thermal":[
71,
74,
78,
83,
88,
92,
96,
100
],
"substrate":[
78,
81,
84,
88,
91,
94,
97,
100
],
"volume":[
85,
87,
89,
91,
94,
96,
98,
100
],
"transit":[
92,
93,
95,
96,
97,
98,
99,
100
],
"solvency":[
78000,
74000,
70500,
66000,
62000,
58500,
55000,
52000
],
"inflation":[
4.6,
3.4,
2.5,
1.9,
1.8,
2.2,
2.6,
2.8
],
"rate":[
6,
5.25,
4,
3.25,
3,
3.5,
4,
4.5
],
"fx":[
1,
0.95,
0.92,
0.9,
0.89,
0.87,
0.85,
0.84
],
"growth":[
4.9,
4.4,
4,
3.5,
3.1,
2.8,
2.6,
2.4
]
},
"economy":{
"participation":39,
"trade":100,
"private":0.72
},
"readouts":{
"heat":{
"label":"Heat",
"source":"scalars.thermal_margin",
"bands":[
{
"min":30,
"text":"ample"
},
{
"min":15,
"text":"adequate"
},
{
"min":8,
"text":"thin"
},
{
"min":null,
"text":"critical"
}
]
},
"consumables":{
"label":"Consumables",
"source":"scalars.consumables",
"bands":[
{
"min":52,
"text":"adequate"
},
{
"min":25,
"text":"thin"
},
{
"min":null,
"text":"critical"
}
]
},
"standing":{
"label":"Standing",
"source":"standing.{band}",
"bands":[
{
"min":51,
"text":"favourable to the government"
},
{
"min":50,
"text":"even"
},
{
"min":null,
"text":"unfavourable to the government"
}
]
},
"confidence":{
"label":"Confidence",
"source":"confidence_margin",
"bands":[
{
"min":10,
"text":"safe by {value}"
},
{
"min":3,
"text":"narrow, by {value}"
},
{
"min":1,
"text":"on a knife-edge"
},
{
"min":null,
"text":"lost"
}
]
},
"rise":{
"label":"The rise",
"source":"rises_in",
"bands":[
{
"min":1,
"text":"rises in {value} sittings"
},
{
"min":null,
"text":"rises today"
}
]
},
"paper":{
"label":"The paper",
"source":"signatures",
"bands":[
{
"min":"setup.thresholds.ballot",
"text":"a ballot is forced"
},
{
"min":1,
"text":"{value} of {need} names"
},
{
"min":null,
"text":"no paper"
}
]
}
},
"scalars":{
"public_standing":44,
"consumables":71,
"thermal_margin":17,
"solvency":52000,
"legitimacy":48,
"friction":25
},
"boardCap":2,
"money":{
"name":"Commonwealth dollar",
"plural":"Commonwealth dollars",
"symbol":"CW$",
"code":"CWD",
"foreign":{
"name":"US dollar",
"plural":"US dollars",
"symbol":"US$",
"code":"USD"
}
},
"fiscal":{
"bases":[
{
"k":"volume",
"weight":88000,
"passthrough":0,
"name":"Pressurised volume"
},
{
"k":"thermal",
"weight":55000,
"passthrough":26,
"name":"Cooling"
},
{
"k":"substrate",
"weight":51000,
"passthrough":24,
"name":"Computing time"
},
{
"k":"transit",
"weight":26000,
"passthrough":20,
"name":"Freight to orbit"
}
],
"rates":{
"none":0,
"relief":0.8,
"low":0.9,
"standard":1,
"high":1.1,
"surcharge":1.2
},
"standing":176000
},
"priceRules":[
{
"k":"thermal",
"base":100,
"terms":[
{
"from":"thermal_margin",
"ref":"opening",
"per":-1.2
},
{
"from":"law.thermal_release",
"map":{
"tight":14,
"open":-16
}
},
{
"from":"rate.thermal"
},
{
"from":"law.civic_clock_minimum",
"per":6
}
]
},
{
"k":"substrate",
"base":100,
"terms":[
{
"from":"law.substrate_public_share",
"default":0.35,
"ref":"opening",
"per":-60
},
{
"from":"price.thermal",
"ref":100,
"per":0.4
},
{
"from":"rate.substrate"
}
]
},
{
"k":"volume",
"base":100,
"terms":[
{
"from":"solvency",
"scale":1000,
"ref":"opening",
"per":-0.28
},
{
"from":"law.capital_works",
"map":{
"ring":-9,
"outer":-5
}
}
]
},
{
"k":"transit",
"base":100,
"terms":[
{
"from":"solvency",
"scale":1000,
"ref":"opening",
"per":-0.3
},
{
"from":"law.transit_subsidy",
"map":{
"anchors":-8,
"all":-14
}
},
{
"from":"rate.transit"
}
]
}
],
"economyRules":[
{
"k":"participation",
"base":39,
"min":18,
"max":62,
"terms":[
{
"from":"law.divergence_threshold_hours",
"default":168,
"scale":168,
"ref":1,
"per":-12
},
{
"from":[
"price.volume",
"price.transit"
],
"scale":200,
"ref":1,
"per":-15
}
]
},
{
"k":"trade",
"base":100,
"min":40,
"max":190,
"terms":[
{
"from":"price.transit",
"ref":100,
"per":-0.4
},
{
"from":"price.substrate",
"ref":100,
"per":-0.35
},
{
"from":"law.closure_target",
"per":-24
}
]
}
],
"macro":{
"output":612000,
"potential":606000,
"trend":2.2,
"growth":2.4,
"inflation":2.8,
"expected":2.5,
"credibility":0.8,
"rate":4.5,
"neutral":1,
"fx":0.84,
"reserves":38000,
"earth":{
"rate":3.25,
"inflation":2.1
},
"firstMeeting":"2080-05-06",
"meetingEvery":42,
"rule":{
"inflation":0.5,
"gap":0.5,
"dualGap":1,
"step":0.25,
"maxMove":0.5,
"floor":0.25
},
"heat":{
"line":15,
"perPoint":0.008
},
"labour":{
"opening":39,
"perPoint":0.4
},
"demand":{
"speed":4,
"fiscal":0.8,
"rate":0.6,
"fx":0.15,
"trade":0.1,
"friction":0.08,
"shockFade":1.5
},
"phillips":{
"gap":0.3,
"passThrough":{
"supply":0.1,
"imports":0.15
},
"lag":2,
"speed":3
},
"credibilityModel":{
"band":1,
"perPoint":0.15,
"floor":0.2,
"earn":0.3,
"lose":0.8,
"expectations":2,
"directedCeiling":0.5
},
"fxModel":{
"realRate":4,
"friction":0.35,
"debt":0.4,
"balance":1,
"credibility":0.25,
"trade":0.2,
"speed":6,
"controlled":0.35
},
"vote":{
"band":1,
"inflation":20,
"slackBand":0.5,
"slack":14,
"calm":10
},
"directions":{
"hold":{
"move":0,
"credibility":0.04
},
"ease":{
"move":-0.5,
"credibility":0.06
},
"tighten":{
"move":0.5,
"credibility":0.02
}
},
"moveWords":{
"rise":", which slows output and makes the Treasury's borrowing dearer",
"cut":", which lifts output and weakens the dollar",
"hold":""
},
"say":{
"raise":{
"wire":"RESERVE BANK RAISES CASH RATE TO {rate} PER CENT",
"log":"The Reserve Bank raised the cash rate from {from} to {rate} per cent."
},
"cut":{
"wire":"RESERVE BANK CUTS CASH RATE TO {rate} PER CENT",
"log":"The Reserve Bank cut the cash rate from {from} to {rate} per cent."
},
"hold":{
"log":"The Reserve Bank held the cash rate at {rate} per cent."
},
"directed_raise":{
"wire":"RESERVE BANK RAISES TO {rate} PER CENT UNDER A TREASURY DIRECTION",
"log":"Under the Treasurer's direction the Reserve Bank raised the cash rate to {rate} per cent. Its own rule asked for {rule}."
},
"directed_cut":{
"wire":"RESERVE BANK CUTS TO {rate} PER CENT UNDER A TREASURY DIRECTION",
"log":"Under the Treasurer's direction the Reserve Bank cut the cash rate to {rate} per cent. Its own rule asked for {rule}."
},
"directed_hold":{
"wire":"RESERVE BANK HOLDS AT {rate} PER CENT UNDER A TREASURY DIRECTION",
"log":"Under the Treasurer's direction the Reserve Bank held the cash rate at {rate} per cent. Its own rule asked for {rule}."
},
"dollar":{
"wire":"COMMONWEALTH DOLLAR FALLS TO {fx} US DOLLARS"
}
}
},
"lenders":{
"earth":{
"name":"Earth's banks",
"facility":"the Standby Facility",
"currency":"USD",
"drawable":true,
"utilisation":8000,
"cap":60000,
"rate":{
"base":5,
"steps":[
{
"when":{
"scalarAbove":{
"friction":40
}
},
"add":1.25,
"label":"while Earth's sanctions regime is in force"
},
{
"when":{
"scalarAbove":{
"friction":65
}
},
"add":2.25,
"label":"while Earth's banks are pricing the Commonwealth's risk"
},
{
"when":{
"scalarAbove":{
"friction":85
}
},
"add":3.5,
"label":"under a blockade"
},
{
"when":{
"scalarBelow":{
"solvency":10000
}
},
"add":2,
"label":"while the reserve is under the covenant, as default interest"
},
{
"when":{
"flags":[
"standby_default"
],
"scalarAbove":{
"solvency":9999
}
},
"add":2,
"label":"while an event of default is declared, as default interest"
},
{
"when":{
"flags":[
"standby_waiver"
]
},
"add":0.5,
"label":"since the syndicate waived an event of default"
}
]
},
"limits":[
{
"when":{
"scalarAbove":{
"friction":40
}
},
"suspends":"eu",
"why":"the sanctions clause has suspended the European lenders' commitments"
},
{
"when":{
"scalarAbove":{
"friction":85
}
},
"cap":0,
"why":"the sanctions clause has suspended every lender's commitment"
},
{
"when":{
"scalarBelow":{
"solvency":10000
}
},
"cap":0,
"why":"the reserve is under the covenant, and the agent has stopped the drawing"
},
{
"when":{
"flags":[
"standby_default"
]
},
"cap":0,
"why":"the agent has declared an event of default and funds no drawing until it is cured"
}
],
"onDraw":[
{
"move":{
"friction":3,
"legitimacy":-2
}
}
],
"drawNote":"Earth's governments read a drawing as a political act: friction with Earth rises, and the government's legitimacy falls.",
"log":"Drew {n} on the Standby Facility from Earth's banks, at {rate} per cent: {got} into the reserve.",
"wire":"COMMONWEALTH DRAWS {n} ON EARTH STANDBY FACILITY AT {rate} PER CENT",
"note":"the Standby Facility",
"parties":[
{
"name":"Alphabet-JPMorgan Omni",
"seat":"New York",
"role":"coordinator, bookrunner and agent",
"commitment":12000
},
{
"name":"HSBC Standard Chartered",
"seat":"London",
"role":"mandated lead arranger",
"commitment":10000
},
{
"name":"Mitsubishi UFJ Mizuho",
"seat":"Tokyo",
"role":"mandated lead arranger",
"commitment":10000
},
{
"name":"BNP Paribas Société Générale",
"seat":"Paris",
"role":"mandated lead arranger",
"commitment":8000,
"tags":[
"eu"
]
},
{
"name":"Deutsche Commerzbank",
"seat":"Frankfurt",
"role":"lender",
"commitment":7000,
"tags":[
"eu"
]
},
{
"name":"ING Rabobank",
"seat":"Amsterdam",
"role":"lender",
"commitment":5000,
"tags":[
"eu"
]
},
{
"name":"Itaú Bradesco",
"seat":"São Paulo",
"role":"lender",
"commitment":4000
},
{
"name":"KCB Equity Group",
"seat":"Nairobi",
"role":"lender",
"commitment":4000
}
],
"terms":{
"title":"The Standby Facility",
"partiesHead":"The syndicate",
"see":[
"commonwealth",
"lender_underwriters"
],
"kind":"a syndicated standby credit facility",
"type":"syndicated standby facility",
"borrower":"the Circumterrestrial Commonwealth, acting by the Treasurer",
"signed":"14 March 2078",
"maturity":"14 March 2083",
"reference":"3.25 per cent, the lending banks' overnight reference rate",
"margin":"1.75 per cent",
"grid":"Under the agreement's grid the margin rises while a lender's government has sanctions in force against the Commonwealth, while the reserve is under the covenant, and while an event of default is declared.",
"summary":"It was signed in March 2078, after five years in which the Commonwealth met its deficits from the reserve, as a backstop the Treasury did not intend to draw.",
"sections":[
{
"h":"Drawing",
"body":"The facility is denominated in US dollars, and the Commonwealth owes in US dollars whatever its own currency does. The Commonwealth draws on the facility by a utilisation request from the Treasurer to the agent, in amounts of US$8 billion. Each drawing is announced to the House. Amounts drawn may be repaid at any time without penalty and drawn again, and all amounts outstanding fall due at final maturity."
},
{
"h":"Covenants",
"body":"The Commonwealth undertakes to keep its reserve at or above CW$10 billion while any amount is drawn. The facility carries a negative pledge, a pari passu clause and a cross-default clause in the usual form, and an expropriation clause under which the taking of an Earth-registered company's property without compensation is an event of default."
},
{
"h":"Sanctions",
"body":"A lender is not obliged to fund a drawing that its own government's sanctions forbid, and its commitment is suspended for as long as they are in force."
},
{
"h":"Suspended commitments",
"while":{
"scalarAbove":{
"friction":40
}
},
"body":"The European lenders' commitments, US$20 billion between them, are suspended under the sanctions clause while the European Union's sanctions against the Commonwealth are in force."
},
{
"h":"Event of default",
"when":{
"flags":[
"standby_default"
]
},
"body":"The agent has declared an event of default under the facility. Until it is cured, the lenders fund no drawing and default interest of 2.00 per cent is charged on amounts outstanding."
},
{
"h":"Waiver",
"when":{
"flags":[
"standby_waiver"
]
},
"body":"The syndicate has waived an event of default under the facility, for a fee and an increase of 0.50 per cent in the margin for the rest of its term."
}
]
}
},
"bills":{
"name":"the Treasury's bills",
"facility":"Treasury bills",
"automatic":true,
"cap":60000,
"rate":{
"base":0.25,
"policy":1,
"steps":[
{
"when":{
"economyAbove":{
"debt":10
}
},
"add":0.5,
"label":"while the debt is more than a tenth of output"
},
{
"when":{
"economyAbove":{
"debt":20
}
},
"add":1,
"label":"while it is more than a fifth"
},
{
"when":{
"economyBelow":{
"credibility":0.5
}
},
"add":0.75,
"label":"while the market doubts the Reserve Bank"
},
{
"when":{
"flags":[
"rating_cut"
]
},
"add":0.25,
"label":"since the Underwriters cut the continuity rating"
},
{
"when":{
"economyAbove":{
"arrears":0
}
},
"add":1,
"label":"while the Treasury is in arrears"
}
]
},
"label":"Treasury bills",
"short":"tendered weekly when the reserve cannot pay",
"note":"tendered at the weekly auction for whatever the reserve cannot meet, up to the Treasury's standing authority of CW$60bn",
"wire":"TREASURY TENDERS BILLS AS THE RESERVE RUNS OUT",
"log":"The reserve could not meet a payment, and the Treasury tendered bills for the difference at the weekly auction."
},
"reserve_bank":{
"name":"the Reserve Bank",
"facility":"Ways and Means advances",
"label":"Ways and Means advances",
"cap":30000,
"rate":{
"base":0,
"policy":1
},
"note":"the Treasury's overdraft at the Reserve Bank, opened by order of the House",
"short":"the Treasury's overdraft at the Bank"
},
"underwriters":{
"name":"the Underwriters",
"facility":"Commonwealth Reserve Notes",
"drawable":true,
"utilisation":6000,
"home":true,
"cap":36000,
"rate":{
"base":0.5,
"policy":1,
"steps":[
{
"when":{
"scalarBelow":{
"thermal_margin":15
}
},
"add":1,
"label":"while the federal thermal margin is under 15"
},
{
"when":{
"scalarBelow":{
"thermal_margin":10
}
},
"add":1.5,
"label":"while it is under 10"
},
{
"when":{
"scalarBelow":{
"thermal_margin":6
}
},
"add":2,
"label":"while it is under 6"
},
{
"when":{
"flags":[
"rating_cut"
]
},
"add":0.25,
"label":"since the continuity rating was cut"
},
{
"when":{
"economyAbove":{
"arrears":0
}
},
"add":1,
"label":"while the Treasury is in arrears"
}
]
},
"limits":[
{
"when":{
"scalarBelow":{
"thermal_margin":6
}
},
"cap":0,
"why":"the Underwriters place no notes while the thermal margin is under six"
}
],
"onDraw":[
{
"move":{
"actor.underwriters":3,
"party_loyalty":-1
}
}
],
"drawNote":"The Underwriters' standing with the government rises. The party's own benches like borrowing from the insurers less.",
"log":"Placed {n} of Commonwealth Reserve Notes with the Underwriters, at {rate} per cent.",
"wire":"TREASURY PLACES {n} OF RESERVE NOTES WITH UNDERWRITERS AT {rate} PER CENT",
"note":"Commonwealth Reserve Notes",
"parties":[
{
"name":"Habitat Owners' Mutual Protection and Indemnity Association",
"seat":"The Bourse",
"role":"lead manager",
"commitment":8000,
"prose":"the Habitat Owners' Mutual Protection and Indemnity Association"
},
{
"name":"Coldwater Underwriting Agency, for Syndicate 118",
"seat":"The Bourse",
"role":"lead manager",
"commitment":7000
},
{
"name":"Orbit Provident Mutual Assurance Society",
"seat":"Anchorage",
"role":"co-manager",
"commitment":6000
},
{
"name":"First Circumterrestrial Assurance",
"seat":"The Bourse",
"role":"co-manager",
"commitment":5000
},
{
"name":"Aldous Pryce Syndicate 2207",
"seat":"The Bourse",
"role":"placee",
"commitment":4000
},
{
"name":"Far Band Mutual Assurance Association",
"seat":"The Rotunda",
"role":"placee",
"commitment":3000
},
{
"name":"The Underwriters' Central Fund",
"seat":"The Bourse",
"role":"placee",
"commitment":3000
}
],
"terms":{
"title":"Commonwealth Reserve Notes",
"plural":true,
"partiesHead":"The placees",
"see":[
"underwriting",
"lender_earth",
"commonwealth"
],
"kind":"a programme of Treasury notes placed with members of the Circumterrestrial Underwriters",
"type":"Treasury notes, privately placed",
"borrower":"the Circumterrestrial Commonwealth, acting by the Treasurer",
"signed":"2 September 2079",
"maturity":"three years from each issue",
"registrar":"the Reserve Bank of the Circumterrestrial Commonwealth",
"summary":"The programme was agreed in September 2079 between the Treasury and the Council of the Underwriters, and no notes had been issued under it by April 2080.",
"sections":[
{
"h":"Issue",
"body":"Notes are issued in series of CW$6 billion and placed with the members listed below in proportion to their commitments. Each series runs for three years and may be redeemed early at par. The Reserve Bank keeps the register of holders and pays the coupon."
},
{
"h":"The coupon",
"body":"The coupon is half a point over the Reserve Bank's cash rate at the date of issue, and it steps up with the Underwriters' continuity rating of the Commonwealth, which follows the federal thermal margin. The members place no new notes while the margin is below the level at which their own schedules treat a cascade as likely."
},
{
"h":"The Hull Club",
"body":"The largest holder, the Habitat Owners' Mutual Protection and Indemnity Association, is known on the Bourse as the Hull Club. It was founded by habitat operators to insure one another against bulkhead failure, and it is the mutual from which the Underwriters' market grew."
}
]
}
}
},
"outlookTopics":[
{
"id":"account",
"name":"The account"
},
{
"id":"borrowing",
"name":"Borrowing"
},
{
"id":"prices",
"name":"Prices"
},
{
"id":"bank",
"name":"The Bank and the dollar"
}
],
"outlook":{
"reserve_gone":{
"topic":"account",
"text":"The reserve is empty, so every payment the Treasury makes is borrowed, in Treasury bills sold at the weekly tender. When the bill authority is used up, payments go unmet."
},
"reserve_thin":{
"topic":"account",
"text":"Spending runs {balance} a year ahead of receipts, and the reserve of {reserve} lasts {runway} at that rate. After that every payment is borrowed. Raising a rate or cutting a clause of the appropriation closes the gap."
},
"receipts_short":{
"topic":"account",
"text":"The Commonwealth spends {outgoings} a year, interest included, and collects {receipts}: a deficit of {balance} ({balancePct} of output). The reserve of {reserve} covers it for {runway}."
},
"receipts_cover":{
"topic":"account",
"text":"Receipts of {receipts} a year exceed spending of {outgoings}, interest included, so the reserve of {reserve} grows by {balance} a year. Every levy is charged on one of the four prices, so the surplus lasts as long as they do."
},
"arrears":{
"topic":"account",
"text":"The Treasury is {arrears} behind on its payments: the reserve is empty and the bill authority is used up. Money coming in pays the arrears first, and Treasury bills and the Underwriters' notes cost a point more until they are cleared."
},
"volume_forgone":{
"topic":"account",
"text":"The volume levy is set below standard and raises {volumeYield} a year; at standard it would raise {volumeForgone} more. It is the one levy of the four that raises no price: it falls on the leaseholder, because the rent of a fixed position the Commonwealth owns cannot be passed on to the resident."
},
"debt_none":{
"topic":"borrowing",
"text":"The Commonwealth owes nothing. If the reserve runs low it can draw on {facilities}."
},
"debt_light":{
"topic":"borrowing",
"text":"The Commonwealth owes {debt}, {debtPct} of output, and pays {service} a year in interest."
},
"debt_heavy":{
"topic":"borrowing",
"text":"The Commonwealth owes {debt}, {debtPct} of output, and pays {service} a year in interest. The larger the debt, the weaker the dollar and the dearer every new bill."
},
"owed_underwriters":{
"topic":"borrowing",
"text":"{lenderOwed} is owed on the Underwriters' notes at {lenderRate}: {lenderBase}{lenderWhy}. The coupon rises as the federal thermal margin falls, so the notes cost most when the stations are in most danger."
},
"owed_bills":{
"topic":"borrowing",
"text":"The Treasury has {lenderOwed} of bills out at {lenderRate} ({lenderBase}{lenderWhy}), with {headroom} of room left under the bill authority."
},
"owed_reserve_bank":{
"topic":"borrowing",
"text":"The Treasury owes the Reserve Bank {lenderOwed} at {lenderRate}, an advance of money the Bank created. Taking it cost the Bank credibility and raised expected inflation."
},
"rate_cheap":{
"topic":"borrowing",
"text":"{earthLender} charge {earthRate}: {earthBase}{earthWhy}. Their margin rises in steps as friction with Earth rises."
},
"rate_dear":{
"topic":"borrowing",
"text":"{earthLender} charge {earthRate}: {earthBase}{earthWhy}. Each margin comes off when its condition ends."
},
"prices_falling":{
"topic":"prices",
"text":"The four prices are {pricesVs}: thermal {thermal}, substrate {substrate}, volume {volume}, transit {transit}. Cheaper goods lower the cost of living and the yield of every levy charged on them."
},
"prices_steady":{
"topic":"prices",
"text":"The four prices are {pricesVs}: thermal {thermal}, substrate {substrate}, volume {volume}, transit {transit}. The appropriation's clauses and tax rates move them, and so do the thermal margin and the reserve."
},
"prices_rising":{
"topic":"prices",
"text":"The four prices are {pricesVs}: thermal {thermal}, substrate {substrate}, volume {volume}, transit {transit}. Substrate is priced on heat, so a thermal rise passes into substrate rent, and all four pass into inflation."
},
"prices_spiking":{
"topic":"prices",
"text":"The four prices are {pricesVs}: thermal {thermal}, substrate {substrate}, volume {volume}, transit {transit}. Substrate rent is what an emulated person pays to keep running, and one who cannot pay it and is not insured is suspended."
},
"inflation_target":{
"topic":"bank",
"text":"Inflation is {inflation} against the Bank's target of {target}. Its rule points to a cash rate of {ruleRate} against {rate} today, so expect {bankMove} on {meeting}."
},
"inflation_high":{
"topic":"bank",
"text":"Inflation is {inflation}, more than two points over the {target} target, and {core} underlying. The Bank's rule points to {ruleRate} against {rate} today: expect {bankMove} on {meeting}{bankEffect}."
},
"inflation_low":{
"topic":"bank",
"text":"Inflation is {inflation}, under the {target} target. The Bank's rule points to {ruleRate} against {rate} today, so expect {bankMove} on {meeting}{bankEffect}."
},
"bank_directed":{
"topic":"bank",
"text":"The Bank is setting the cash rate under a Treasury direction to {directed}: {bankMove} on {meeting}, whatever its rule asks ({ruleRate}). Each meeting under the direction costs it credibility, now {credibility}, and expected inflation follows."
},
"bank_doubted":{
"topic":"bank",
"text":"The Bank's credibility is {credibility}. At that level the market takes its expectation of inflation, now {expected}, from recent prices, so inflation persists and the rate has to stay higher for longer to bring it down."
},
"dollar_weak":{
"topic":"bank",
"text":"The dollar buys {fx}, {fxChange}, and it bought {fxFirst} in {fxFirstYear}. Everything bought from Earth costs more, and a debt owed in Earth's money is larger in dollars."
},
"dollar_strong":{
"topic":"bank",
"text":"The dollar buys {fx}, {fxChange}. Imports from Earth are cheaper, and the compute the Commonwealth sells to Earth is dearer for its buyers."
},
"output_slack":{
"topic":"bank",
"text":"Output is {gapWords}, growing {growth} a year. There is room to spend, or to cut the rate, without raising prices."
},
"output_hot":{
"topic":"bank",
"text":"Output is {gapWords}, growing {growth} a year. The radiators set that capacity, so further spending raises inflation faster than it raises output."
}
},
"law":{
"divergence_threshold_hours":168,
"civic_clock_minimum":0,
"suspension_debt_accrual":true,
"substrate_public_share":0.35,
"shed_order_authority":"engineering_authority",
"thermal_release":"steady",
"capital_works":"none",
"transit_subsidy":"none",
"rate_volume":"standard",
"rate_thermal":"standard",
"rate_substrate":"standard",
"rate_transit":"standard",
"tier_ratio_list":100,
"threshold_pct":4,
"district_divisor":"fptp",
"list_divisor":"dhondt",
"inflation_target":2,
"bank_mandate":"inflation",
"reserve_direction":null,
"capital_controls":false
},
"alerts":[
{
"id":"thermal_orders",
"tab":"gov",
"when":{
"scalarBelow":{
"thermal_margin":8
}
},
"urgent":{
"scalarBelow":{
"thermal_margin":8
}
},
"raises":"thermal_margin",
"text":"The thermal margin is critical, and the emergency orders are open"
},
{
"id":"arrears",
"tab":"econ",
"when":{
"economyAbove":{
"arrears":0
}
},
"urgent":{
"economyAbove":{
"arrears":0
}
},
"how":"draw on a facility from the account, or lay the Ways and Means order",
"text":"The Treasury is in arrears, and every sitting it stays there costs standing"
}
],
"civicClock":{
"costPerYear":70000
},
"suspension":{
"pausedRestore":1.5,
"pausedShed":1.2,
"price":"substrate"
},
"divisionsPerSitting":2,
"grantsPerSitting":2,
"supplyDelaySittings":3,
"slotsPerSession":6,
"trendDecay":4,
"standingDrift":{
"toward":45,
"rate":0.05
},
"election":{
"swing":0.35,
"legitimacy":0.15,
"localFloor":0.4,
"localLift":2,
"marginMin":0.005,
"marginSpan":0.35,
"marginShape":1.6,
"functional":{
"licensure":0.4,
"corporate":0.15,
"union_bloc":0.3,
"residual":1
}
},
"epilogues":[
{
"id":"landslide",
"when":{
"returned":true,
"sideAtLeast":185
},
"title":"A landslide",
"body":"The new House sits with the government's side on three benches and part of a fourth. The President sends for the Prime Minister before the last returns are in, and the formation takes an afternoon. A majority this size is a mandate for everything the manifesto said and several things it left out, and the first thing the whips learn is that a government this large has more members than posts. The opposition will spend the parliament deciding who lost it."
},
{
"id":"working",
"when":{
"returned":true,
"sideAtLeast":160
},
"title":"A working majority",
"body":"The government is returned with room to govern. The President sends for the Prime Minister on the morning after the count, the partners renew their terms the same afternoon, and the new parliament opens with the government's business on the paper. The whips measure a majority by the rebellions it survives, and this one survives two."
},
{
"id":"narrow",
"when":{
"returned":true
},
"title":"Returned, narrowly",
"body":"The government is returned with a majority the whips can count on one hand. The partners know it and price their terms accordingly: the formation takes a week, and the programme that comes out of it is shorter than the manifesto. Every division of the new parliament will be close, and the Prime Minister governs on the arithmetic of the last session with less of its patience."
},
{
"id":"hung",
"when":{
"sideAtLeast":125
},
"title":"No majority",
"body":"Nobody commands the House. The President calls the leaders in one at a time, in order of seats, and the government stays on as caretaker until somebody can show the numbers. The government's side is the nearest to a majority, so the talks begin with it; whether they end with it depends on who else is in the room and what the partners want for coming back."
},
{
"id":"defeat",
"when":{
"sideAtLeast":100
},
"title":"Defeat",
"body":"The government's side comes back short by more than any partner can make up. The President sends for the Leader of the Opposition, and the Prime Minister goes to the residence the next morning to resign. The benches that won the count will form the next government, and the party that governed will spend its first weeks in opposition deciding whether the record lost it or the campaign did."
},
{
"id":"rout",
"title":"A rout",
"body":"The government is swept out. Seats that returned the party at every election since the Charter change hands on the night, and the parliamentary party that comes back fits in the room where its whips used to meet. The Leader of the Opposition forms a government within the week, and the Prime Minister's resignation is accepted on the day it is offered."
}
],
"campaignSittings":12,
"sittingsPerPeriod":16,
"periodsPerSession":3,
"sessionsPerParliament":1,
"recessDays":14,
"capital":{
"psa":2,
"rv":-3,
"upl":0,
"geo":1
},
"president":{
"id":"tenaya",
"relationship":22,
"powers":[
"dissolution",
"formation",
"referral",
"appointments"
]
},
"thresholds":{
"leadershipChallenge":15,
"ballot":12,
"signsAt":50,
"refusalLoyalty":2,
"winBackBelow":75,
"partnerLeaves":15,
"partnerReturns":30,
"motionAfter":3,
"supplyWithdrawn":8,
"partnerWarn":8
},
"onPartnerWithdraws":"partner_walks",
"onPartnerStandsAside":"partner_stands_aside",
"settlementFloorSittings":15,
"weightJitter":14,
"ageWeight":0,
"meters":[
{
"k":"party_loyalty",
"label":"Party loyalty",
"soft":25
},
{
"k":"public_standing",
"label":"Public standing",
"soft":20
},
{
"k":"consumables",
"label":"Consumables",
"soft":25
},
{
"k":"thermal_margin",
"label":"Thermal margin",
"soft":12
},
{
"k":"solvency",
"label":"Sovereign solvency",
"soft":15000,
"max":100000
},
{
"k":"legitimacy",
"label":"Legitimacy",
"soft":30
},
{
"k":"friction",
"label":"Diplomatic friction",
"soft":35,
"invert":true
}
],
"couplings":[
{
"meter":"friction",
"above":40,
"drag":{
"thermal_margin":-1
},
"mark":"Imports are dearer under the sanctions regime"
},
{
"meter":"friction",
"above":65,
"drag":{
"thermal_margin":-3,
"solvency":-1000
},
"mark":"Earth's banks are pricing the Commonwealth's risk"
},
{
"meter":"friction",
"above":85,
"drag":{
"thermal_margin":-3,
"legitimacy":-1
},
"mark":"The blockade is beginning to bite"
},
{
"group":"earth_cost",
"meter":"friction",
"above":85,
"when":{
"economyAbove":{
"trade":94
}
},
"drag":{
"friction":-2
},
"mark":"Earth's own markets are paying for the blockade"
},
{
"group":"arrears",
"meter":"economy.arrears",
"above":0,
"drag":{
"public_standing":-1,
"legitimacy":-1
},
"mark":"The Treasury is in arrears: suppliers and stations are waiting to be paid"
},
{
"group":"arrears",
"meter":"economy.arrears",
"above":10000,
"drag":{
"public_standing":-2,
"legitimacy":-2,
"party_loyalty":-1
},
"mark":"The Commonwealth has missed its own payroll"
}
],
"idleness":{
"fromChapter":2,
"after":3,
"drag":{
"legitimacy":-1
},
"mark":"The government has not been seen to do anything"
}
},
"administrations":[
{
"id":"flash_i",
"party":"cu",
"leader":"flash",
"ordinal":"I",
"from":2080,
"to":2084,
"session":4,
"opening":[
{
"bill":{
"anchor_kepler":{
"stage":"committee"
}
}
},
{
"flag":"a1_orders_locked"
}
],
"setup":{
"startDate":"2080-04-11",
"reveals":{
"orderpaper":{
"when":{
"seen":[
"a1_order_paper"
]
}
},
"forecast":{
"when":{
"seen":[
"a1_count"
]
}
}
},
"locks":{
"grant":{
"when":{
"seen":[
"a1_order_paper"
]
},
"text":"Opens once the order paper has been put before you."
},
"divide":{
"when":{
"seen":[
"a1_count"
]
},
"text":"Opens once the count has been explained to you."
},
"whip":{
"when":{
"seen":[
"a1_count"
]
},
"text":"Opens once the count has been explained to you."
},
"money":{
"when":{
"seen":[
"a1_underwriters"
]
},
"text":"Opens once the Underwriters have given their reading."
},
"clause:thermal":{
"when":{
"seen":[
"a1_cooling"
]
},
"text":"Opens once cooling has been put to you."
},
"clause:floor":{
"when":{
"seen":[
"a1_floor"
]
},
"text":"Opens once the consumables floor has been put to you."
},
"clause:insurance":{
"when":{
"seen":[
"a1_cover"
]
},
"text":"Opens once substrate insurance has been put to you."
},
"clause:works":{
"when":{
"seen":[
"a1_works"
]
},
"text":"Opens once capital works have been put to you."
},
"clause:transit":{
"when":{
"seen":[
"a1_transit"
]
},
"text":"Opens once the transit subsidy has been put to you."
},
"clause:rate_volume":{
"when":{
"seen":[
"a1_underwriters"
]
},
"text":"Opens once the Underwriters have given their reading."
},
"clause:rate_thermal":{
"when":{
"seen":[
"a1_underwriters"
]
},
"text":"Opens once the Underwriters have given their reading."
},
"clause:rate_substrate":{
"when":{
"seen":[
"a1_underwriters"
]
},
"text":"Opens once the Underwriters have given their reading."
},
"clause:rate_transit":{
"when":{
"seen":[
"a1_underwriters"
]
},
"text":"Opens once the Underwriters have given their reading."
}
},
"tutorial":[
{
"id":"calendar",
"onTab":"sit",
"region":"calendar",
"when":{
"seen":[
"a1_estimates"
]
},
"title":"The rise",
"body":"The calendar counts the sittings before the House rises for its recess. The estimates must be carried before then, or the government cannot pay its officials and falls. \"Rise until the next sitting\" moves on to the next sitting."
},
{
"id":"order-paper-time",
"onTab":"gov",
"region":"order-paper-time",
"when":{
"seen":[
"a1_treasury"
]
},
"title":"Order-paper time",
"body":"The government has a few slots in each sitting period, and they refill when the House rises for its recess. One slot moves one measure one stage nearer its vote."
},
{
"id":"order-paper",
"onTab":"cham",
"region":"order-paper",
"when":{
"seen":[
"a1_order_paper"
]
},
"title":"The order paper",
"body":"Each line is a measure before the House, with the party that moved it and its stage. A measure goes through first reading, second reading, committee, report and third reading, and is voted on at the last. Grant, on a line, spends one slot and moves that measure one stage."
},
{
"id":"clauses",
"onTab":"cham",
"region":"estimates-clauses",
"when":{
"seen":[
"a1_cooling"
]
},
"title":"The estimates' clauses",
"body":"Each clause has levels. Choosing a level changes the total beneath, and the levels together may cost no more than the reserve holds, so to raise one clause, cut another. A clause opens once its minister has explained it; the dimmed ones say when."
},
{
"id":"orders",
"onTab":"gov",
"region":"orders",
"when":{
"seen":[
"a1_ember_ridge"
]
},
"title":"Orders",
"body":"A minister makes an order under powers an Act has already given. It takes effect when made, without a vote, and stands unless the House votes against it within the sittings shown on the order."
},
{
"id":"whip",
"onTab":"cham",
"region":"whip",
"when":{
"seen":[
"a1_count"
]
},
"title":"The whip",
"body":"Commit members to vote for a measure before it is voted on. A commitment costs capital with a partner or loyalty with your own party, and nothing is charged until the division, so the plan can be changed until then."
},
{
"id":"division",
"onTab":"cham",
"region":"divide",
"when":{
"seen":[
"a1_count"
],
"billStage":{
"appropriation":"third_reading"
}
},
"title":"The division",
"body":"Divide calls the House's vote on a measure at its last stage. The result is read out party by party, and the measure is carried or lost on it."
},
{
"id":"account",
"onTab":"econ",
"region":"account",
"when":{
"seen":[
"a1_underwriters"
]
},
"title":"The account",
"body":"The account shows what the Treasury receives and spends, the deficit, the reserve and what the Commonwealth owes. The Underwriters read these figures. Money calls, on this screen, borrow or repay."
}
],
"actEnd":{
"event":"a1_works_abandoned",
"note":"This is the end of the first act. The rest of the play is not yet written."
},
"campaignMarkers":[
{
"id":"works",
"label":"Bellamy Almanac Works",
"place":"belowBands",
"article":"body_almanac_works",
"when":{
"flags":[
"station_issue"
]
},
"note":"The refinery and foundry whose operator has abandoned its residents."
}
],
"lenders":{
"alliance":{
"name":"The Alliance of Business and Government",
"rate":{
"fixed":10
},
"serviced":false,
"repayable":false,
"home":true,
"note":"the emergency facility, due before the House rises; secured on the Cordell leases",
"label":"The Alliance's facility",
"short":"due at the rise, on the Cordell leases"
}
}
},
"intro":{
"mood":"moment",
"title":"Adriana Eireann Flash",
"art":"flash_intro",
"sections":[
{
"kind":"epigraph",
"body":"All the rivers run into the sea; yet the sea is not full.",
"source":"Ecclesiastes 1:7"
},
{
"kind":"lede",
"body":"Adriana Eireann Flash is perhaps an example of uncertainty: an unexpected candidate for Prime Minister, a defiance of odds. She had never held elected office before her ascension to the premiership, and yet at this moment she seems to be the best answer the Commonwealth has to the question of who ought to lead it. With the world unsettled and confidence in its old certainties beginning to fray, she stands now at the edge of history."
},
{
"kind":"body",
"head":"The banker",
"body":"When the Circumterrestrial Commonwealth emerged out of the primordial soup that was humanity extending into the heavens — first into orbit around Earth, and then further out into the solar system — Adriana Eireann Flash was a banker for Alphabet-JPMorgan Omni, making a name for herself in the latter half of a century that had been defined, economically, by an upheaval in the institutions of the old order as climate change forced their hand.\n\nShe came up to the Winter Garden in 2070, in the Commonwealth's springtime, when orbital industry was finding its flourishing and nobody yet knew what any of it was worth. A year later she was Governor of the Reserve Bank of the Circumterrestrial Commonwealth. She was to be the first in a line of faceless bankers who would set the precedent for the composed monetary policy of this novel polity.\n\nThat could have been the whole of it. A decade of steady hands and unread minutes, a portrait in a corridor, a pension. Instead, in 2076, the Party of Socialists and Democrats asked her to the Treasury from outside the House, which the Charter has never forbidden, and for four years she ran the Commonwealth's money from the other side of the desk. But it's not like every capable leader was evidently destined to do it beforehand."
},
{
"kind":"body",
"head":"How she came to it",
"body":"Its leader, Nils Vijlbrief, had taken the party into government in 2076 and brought her to the Treasury. When he wanted the stations' upkeep paid for from an overdraft at the Reserve Bank, she refused him in public, and the markets sided with her. With an election due in August and the polls against them, the party's members of Parliament went looking for someone else.\n\nThe Party of Socialists and Democrats did not choose her because she was one of them. It chose her because the party was seemingly in between worlds, in constant melancholic turmoil, unsure of what was to come next. And so, dark horse she was, she hammered her way to the leadership election, and then she won it. She took First Spin at the by-election that followed, which is the first elected office she has ever held.\n\nSo she is a banker at the head of the party of maintenance labour, which occasionally mitigates the two facts; occasionally it exemplifies it. The members who put her there did it to keep a government."
},
{
"kind":"body",
"head":"What she inherits",
"body":"Her government is a coalition of the Party of Socialists and Democrats, the New Progressive Party, and the Congregational Democratic Alliance; with confidence and supply from six independents, they lead a somewhat convincing majority government. Although with that, while the New Progressive Party may align with the PSD on many elements of economic policy, the issue of personhood is one that lies in wait, a test for the shaky alliance which sees a personhood restrictionist PSD and CDA (the CDA also being a semi-awkward fit economically for the governing coalition) pitted against a personhood expansionist NPP.\n\nThe PSD are in power because of labour and trade unions. Expanding personhood is a natural threat against that, while the CDA agree from a humanist perspective. The New Progressive Party sees otherwise.\n\nShe has one session before the country votes. The one that opens on the eleventh of April is the parliament's fourth and its last, and the House is already sitting."
},
{
"kind":"body",
"head":"The role",
"body":"The performer playing this role should be able to capture Flash's composure, and the discipline of someone who has spent a career saying less than she knows. She believes a country can be run the way she ran its currency: by setting clear rules, publishing them, and keeping to them when it hurts. She must hold together a coalition that agrees on the economy and on almost nothing else, a party that chose her to stay in government, and a Parliament in its final session, whose members are already thinking about the election. Beneath the composure is someone who has never been elected to lead anything, and who privately doubts she has the right to. Her most essential characteristic is solitude: she has no old allies in politics, and the one colleague who understood her work, she left behind at the Bank.\n\nIdeal performer for this role is a woman in her early fifties in the alto range."
},
{
"kind":"cast",
"head":"Cast of characters"
},
{
"kind":"signature",
"head":"Adriana Eireann Flash · Prime Minister"
}
]
},
"play":{
"title":"After the Springtime",
"logo":"img/plays/flash_i_logo.png",
"logoSmall":"img/plays/flash_i_logo_black.png",
"playbill":"img/plays/flash_i_playbill.png",
"cast":[
{
"id":"flash",
"name":"Adriana Eireann Flash",
"role":"Prime Minister, and leader of the Party of Socialists and Democrats"
},
{
"id":"whitlam",
"name":"Imre Whitlam",
"role":"Leader of the House, who decides what Parliament debates and when"
},
{
"id":"trottier",
"name":"Mandelina Trottier",
"role":"Deputy Prime Minister, and leader of the New Progressive Party, the coalition's junior partner"
},
{
"id":"halloran",
"name":"Dan Czarnecki",
"role":"Leader of the Hard Left of the Prime Minister's own party"
},
{
"id":"watkins",
"name":"Darren Watkins Jr.",
"role":"Leader of the Opposition, and leader of the Liberal Party"
},
{
"id":"hatt",
"name":"Edward Hatt",
"role":"Leader of the Alliance of Business and Government, elected by no district"
},
{
"id":"gb_chair",
"name":"Kazuya Tanako",
"role":"Chair of the Life Support panel, whose position has not changed since 2072"
},
{
"id":"castellane",
"name":"Maren Castellane",
"role":"Governor of the Reserve Bank, and once Flash's deputy"
},
{
"id":"tenaya",
"name":"Jaco van Ryneveld",
"role":"President of the Commonwealth"
},
{
"id":"ceyhan",
"name":"Ivor Ceyhan",
"role":"Political editor of The Spindle"
}
],
"ensemble":"Members of Parliament, the residents of thirty stations, the wire services, and Earth's governments and banks.",
"acts":[
{
"chapter":1,
"head":"Act I",
"title":"The House Is Sitting",
"epigraph":{
"body":"There is nothing more difficult to take in hand, more perilous to conduct, or more uncertain in its success, than to take the lead in the introduction of a new order of things.",
"source":"Niccolò Machiavelli, The Prince (tr. W. K. Marriott)"
},
"direction":"The chamber of Parliament, at the Winter Garden, the capital. Morning, 11 April 2080. Two hundred and eighty seats, most of them filled. The coolant pumps run under the floor, and a member who stands to speak learns to pitch a voice over them.\n\nADRIANA EIREANN FLASH takes the Prime Minister's place on the front bench, in the fourth and last session of this Parliament."
},
{
"chapter":2,
"head":"Act II",
"title":"Ways and Means",
"epigraph":{
"body":"The equal right of all men to the use of land is as clear as their equal right to breathe the air — it is a right proclaimed by the fact of their existence.",
"source":"Henry George, Progress and Poverty"
},
"direction":"The same chamber, some weeks on. The order paper is longer than the time left to debate it. In the galleries sit the stations' delegations, and in the lobbies the whips count heads. At the Treasury bench sits a Prime Minister with more to decide than she has votes to carry."
},
{
"chapter":3,
"head":"Act III",
"title":"The Count",
"epigraph":{
"body":"To every thing there is a season, and a time to every purpose under the heaven.",
"source":"Ecclesiastes 3:1"
},
"direction":"Parliament is dissolved and the chamber is empty. The play moves out to the stations: the concourses, the broadcasts, the queues at the polling stations. Two hundred and eighty seats are to be filled again, and a woman who has never fought a general election is fighting one."
}
],
"intervals":[
{
"after":1,
"direction":"The House rises for the recess. The chamber empties from the back benches forward, and the clerks stay behind to count what is left on the order paper. Members go home to thirty stations on a transit schedule that runs late. The Prime Minister's office stays lit."
},
{
"after":2,
"direction":"The House rises again. It will sit once more before the session ends, and every member knows it. On the concourse outside the chamber the talk is of seats: who will hold theirs, and who is already drafting a farewell."
}
],
"curtain":{
"epigraph":{
"body":"As the ends of such a partnership cannot be obtained in many generations, it becomes a partnership not only between those who are living, but between those who are living, those who are dead, and those who are to be born.",
"source":"Edmund Burke, Reflections on the Revolution in France"
}
}
}
}
],
"sandbox":[

]
}; };
if (typeof module !== "undefined") module.exports = EngineFixtureDataEngine;
