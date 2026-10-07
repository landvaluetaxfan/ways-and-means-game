/* =============================================================
   STATIONS — the frozen roster. 35 habitats across five bands.

   A station is a PLACE: a mark on the orbital chart with a form, a
   population and a closure ratio. A CONSTITUENCY is a thing that
   returns members, and lives in constituencies.js. Most stations
   return one; the largest are divided.

   THE ORBITAL CHART reads three fields per station and encodes each
   as a separate visual variable, so one mark carries three facts:
     band       vertical position   — altitude, and therefore class
     form       glyph shape         — what kind of habitat it is
     population glyph size          — log-scaled
   Closure tints the fill and the leading party marks a tick beneath.

   seats: total district seats, equal to the sum of this station's
   constituencies' magnitudes. tools/test.js checks this both ways.

   apportionment_ratio is NOT here. It is derived per constituency by
   Engine.apportionment() from magnitude and electorate, because
   storing it beside seats and population let the three drift apart —
   Homestead was once recorded at 1.88 while its actual seats-per-head
   matched Anselm's 0.88.

   composition: share of adults by legal category. Commonwealth-wide
   the split is biological 0.64, emulation 0.28, uplift 0.04,
   synthetic 0.04.

   THE TWO SCARCITIES RUN IN OPPOSITE DIRECTIONS ACROSS THE ROSTER,
   and that is what sets composition:

     Volume is positional. Anselm Ring volume is astronomical because
     everybody wants to be there; Homestead volume is nearly free
     because nobody does.

     Thermal rejection is geometric. A habitat in low orbit sheds heat
     while sitting in Earth's infrared glare; far-band and Lagrange
     habitats have far better geometry, so substrate is cheap there.

   So the low band is embodied (cheap volume, dear substrate) and the
   far band and Lagrange are emulation-heavy. People are priced out of
   their bodies on GOOD stations, not poor ones.

   form: cylinder | torus | drum | sphere | cluster | yard | surface
   ============================================================= */

const STATIONS = [

  { id:"anselm", name:"Anselm Ring", band:"ring", type:"single", form:"cylinder",
    seats:37, population:1940000,
    closure:0.79, suspended:2100, attested:0.94,
    composition:{biological:0.5187,emulation:0.3814,uplift:0.0388,synthetic:0.0611},
    material_interest:["tether_traffic", "volume_rationing"],
    dependency:"The Beanstalk, its tether to Earth at Macapá, and the trade that comes up it.",
    grievance:`That the other stations resent it.` },

  { id:"belvedere", name:"Belvedere", band:"ring", type:"single", form:"torus",
    seats:3, population:145000,
    closure:0.58, suspended:1180, attested:0.87,
    composition:{biological:0.51,emulation:0.42,uplift:0.04,synthetic:0.03},
    material_interest:["substrate_supply", "risk_pricing"],
    dependency:"Hosting capacity that it buys, and the price of it.",
    grievance:`Proposals to change the legal status of its residents' running copies, whose earnings make up much of its income.` },

  { id:"meridian", name:"Meridian Spindle", band:"ring", type:"single", form:"cylinder",
    seats:16, population:682000,
    closure:0.71, suspended:2110, attested:0.91,
    composition:{biological:0.63,emulation:0.29,uplift:0.04,synthetic:0.04},
    material_interest:["tether_traffic", "substrate_supply"],
    dependency:"The Clothesline's traffic rights, which it does not own.",
    grievance:`That Anselm Ring sets the schedule.` },

  { id:"corvus", name:"Rookworks—Anselm", band:"ring", type:"single", form:"torus",
    seats:6, population:293000,
    closure:0.68, suspended:1930, attested:0.89,
    composition:{biological:0.6,emulation:0.32,uplift:0.04,synthetic:0.04},
    material_interest:["tether_traffic", "volume_rationing"],
    dependency:"Berth allocation at the Anselm locks.",
    grievance:"That it comes second to Anselm Ring in every federal allocation, beginning with berths at the Anselm locks." },

  { id:"sable", name:"Bondsville", band:"ring", type:"single", form:"drum",
    seats:6, population:315000,
    closure:0.66, suspended:1800, attested:0.88,
    composition:{biological:0.66,emulation:0.26,uplift:0.05,synthetic:0.03},
    material_interest:["tether_traffic", "consumables_subsidy"],
    dependency:"The Bond, which is leased rather than owned.",
    grievance:`The lease terms on the Bond, which were signed when the station was smaller.` },

  { id:"halvard", name:"Halvard Works", band:"ring", type:"single", form:"torus",
    seats:3, population:153000,
    closure:0.72, suspended:550, attested:0.93,
    composition:{biological:0.71,emulation:0.21,uplift:0.05,synthetic:0.03},
    material_interest:["volume_rationing", "tether_traffic"],
    dependency:"The rent on the volume it lets to other stations' businesses.",
    grievance:`Every proposal to tax volume by position, of which there have been six.` },

  { id:"bourse", name:"The Bourse", band:"ring", type:"single", form:"sphere",
    seats:2, population:33000,
    closure:0.63, suspended:120, attested:0.96,
    composition:{biological:0.55,emulation:0.38,uplift:0.03,synthetic:0.04},
    material_interest:["risk_pricing", "substrate_supply"],
    dependency:"Continuous access to every other station's figures.",
    grievance:"Attempts to place underwriting under statutory oversight." },

  /* THE CAPITAL. A garden habitat built where the independence congress met:
     one continuous biome with the congress hall at its centre, and the Earth
     states' legations sealed in jars along the river. It returns a delegate
     who may speak and not vote - see the `nonVoting` flag on its seat. */
  { id:"winter_garden", name:"The Winter Garden", band:"ring", type:"single", form:"cylinder",
    seats:1, population:80000,
    closure:0.92, suspended:180, attested:0.96,
    composition:{biological:0.78,emulation:0.18,uplift:0.02,synthetic:0.02},
    material_interest:["charter_interpretation", "attestation_enforcement"],
    description:"The capital, and the only habitat in the Commonwealth built as a single continuous garden: a river running from the cold end to the warm, a hill at the centre, forest and meadow on the flanks, and the congress hall where the Charter was signed standing in the middle of it. The Earth states keep their legations sealed along the river, little pieces of their own worlds dropped into the biome, and the walk between them passes six climates in a mile.",
    dependency:"The government it houses.",
    grievance:"That its seat, the Capital Territory, has a member and no vote in the House." },

  { id:"hollows", name:"Brant—Ellery—Kincaid", band:"far", type:"bundled", form:"cluster", settlements:16,
    seats:6, population:378000,
    closure:0.52, suspended:4210, attested:0.79,
    composition:{biological:0.71,emulation:0.22,uplift:0.04,synthetic:0.03},
    material_interest:["consumables_subsidy", "volume_rationing"],
    dependency:"The quarterly consumables lift.",
    grievance:"That Brant, Ellery and Kincaid were joined into one station and one seat without being asked." },

  { id:"tsiolkovsky", name:"Farstead", band:"far", type:"single", form:"torus",
    seats:4, population:249000,
    closure:0.61, suspended:5640, attested:0.83,
    composition:{biological:0.44,emulation:0.47,uplift:0.04,synthetic:0.05},
    material_interest:["substrate_supply", "thermal_quota"],
    dependency:"Thermal quota allocation.",
    grievance:"That substrate rents are set by the providers on the ring band." },

  { id:"coldharbour", name:"Coldwater", band:"far", type:"single", form:"drum",
    seats:2, population:118000,
    closure:0.58, suspended:5620, attested:0.76,
    composition:{biological:0.31,emulation:0.58,uplift:0.03,synthetic:0.08},
    material_interest:["substrate_supply", "thermal_quota", "shed_order_priority"],
    dependency:"It is a substrate farm. It depends on the price of what it sells.",
    grievance:"That its own residents pay the full market rate for the substrate the station produces." },

  { id:"erasmus", name:"The Rotunda", band:"far", type:"single", form:"torus",
    seats:2, population:85000,
    closure:0.64, suspended:1230, attested:0.91,
    composition:{biological:0.48,emulation:0.42,uplift:0.04,synthetic:0.06},
    material_interest:["substrate_supply", "licensure_scope"],
    dependency:"Endowments and licensing fees.",
    grievance:"That the licensing boards it staffs are appointed by ministers it did not elect." },

  { id:"nasmyth", name:"Hammerstead", band:"far", type:"single", form:"yard",
    seats:2, population:38000,
    closure:0.55, suspended:950, attested:0.87,
    composition:{biological:0.68,emulation:0.24,uplift:0.05,synthetic:0.03},
    material_interest:["thermal_quota", "yard_contracts"],
    dependency:"It builds radiators. It depends on the appropriation that funds them.",
    grievance:`That its own radiator array has had eight years of deferred maintenance.` },

  { id:"vantage", name:"Ember Ridge", band:"middle", type:"single", form:"torus",
    seats:4, population:213000,
    closure:0.48, suspended:2600, attested:0.81,
    composition:{biological:0.52,emulation:0.4,uplift:0.04,synthetic:0.04},
    material_interest:["thermal_quota", "shed_order_priority"],
    dependency:"Radiator capacity. Below statutory reserve since 6 April.",
    grievance:"That the radiator fault which put it below its statutory reserve on 6 April has not been repaired." },

  { id:"perigee", name:"Fore River Yards", band:"middle", type:"single", form:"yard",
    seats:3, population:144000,
    closure:0.57, suspended:1610, attested:0.86,
    composition:{biological:0.78,emulation:0.16,uplift:0.04,synthetic:0.02},
    material_interest:["tether_traffic", "yard_contracts"],
    dependency:"Yard contracts.",
    grievance:`That recent yard contracts were awarded elsewhere.` },

  { id:"calloway", name:"Calloway Loop", band:"middle", type:"single", form:"drum",
    seats:2, population:118000,
    closure:0.44, suspended:1920, attested:0.77,
    composition:{biological:0.69,emulation:0.24,uplift:0.04,synthetic:0.03},
    material_interest:["shed_order_priority", "consumables_subsidy"],
    dependency:"The federal power interlink.",
    grievance:`That its place in the shed order is tier three and has been falling.` },

  { id:"grimaldi", name:"Layover", band:"middle", type:"single", form:"cylinder",
    seats:2, population:106000,
    closure:0.53, suspended:1500, attested:0.84,
    composition:{biological:0.66,emulation:0.27,uplift:0.04,synthetic:0.03},
    material_interest:["transit_windows", "tether_traffic"],
    dependency:"Traffic, because the station is a junction.",
    grievance:"That traffic schedules through the junction are set by stations that do not pass through it." },

  { id:"wickstead", name:"Harvest", band:"middle", type:"single", form:"torus",
    seats:1, population:70000,
    closure:0.69, suspended:760, attested:0.88,
    composition:{biological:0.83,emulation:0.11,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "volume_rationing"],
    dependency:"Water allocation and light hours.",
    grievance:"Imported consumables undercutting its own decks." },

  { id:"oberth", name:"Bethesda", band:"middle", type:"single", form:"drum",
    seats:1, population:56000,
    closure:0.51, suspended:870, attested:0.89,
    composition:{biological:0.74,emulation:0.18,uplift:0.05,synthetic:0.03},
    material_interest:["embodiment_access", "bone_density_standards"],
    dependency:"Body stock and physiological licensure.",
    grievance:"That it is blamed for waiting lists for treatment, which federal licensing sets." },

  { id:"tannery", name:"The Tannery", band:"middle", type:"single", form:"cluster",
    seats:2, population:47000,
    closure:0.41, suspended:2230, attested:0.71,
    composition:{biological:0.8,emulation:0.14,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority"],
    dependency:"It processes what other stations will not.",
    grievance:"That its work is classed as essential while its people are in tier four of the shed order." },

  { id:"ashfield", name:"Homestead", band:"low", type:"bundled", form:"cluster", settlements:10,
    seats:15, population:880000,
    closure:0.31, suspended:11400, attested:0.682,
    composition:{biological:0.81,emulation:0.13,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"],
    dependency:"Federal consumables lift, three deliveries weekly. Fourteen days of stored margin.",
    grievance:`That it has been in tier four of the shed order for eleven consecutive years.` },

  { id:"kepler", name:"Anchorage", band:"low", type:"single", form:"cylinder",
    seats:4, population:231000,
    closure:0.54, suspended:2050, attested:0.85,
    composition:{biological:0.74,emulation:0.19,uplift:0.04,synthetic:0.03},
    material_interest:["tether_traffic", "anchor_concession"],
    dependency:"The International Earth-Orbit Elevator, whose anchor stands on Kenyan soil.",
    grievance:"That the lifeline is in another state's jurisdiction." },

  { id:"slagworks", name:"Hardie", band:"low", type:"single", form:"drum",
    seats:2, population:120000,
    closure:0.37, suspended:3120, attested:0.72,
    composition:{biological:0.85,emulation:0.09,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "yard_contracts"],
    dependency:"Feedstock contracts and the consumables lift.",
    grievance:"Essential-services legislation, which its unions read as a muzzle." },

  { id:"bellows", name:"Sunman", band:"low", type:"single", form:"cylinder",
    seats:2, population:101000,
    closure:0.44, suspended:2010, attested:0.76,
    composition:{biological:0.86,emulation:0.08,uplift:0.04,synthetic:0.02},
    material_interest:["thermal_quota", "consumables_subsidy"],
    dependency:"It runs an atmosphere plant serving four stations. It depends on power.",
    grievance:"That it is paid an ordinary contractor's rate for the atmosphere plant on which four stations depend." },

  { id:"cinder", name:"Lantern", band:"low", type:"single", form:"drum",
    seats:1, population:78000,
    closure:0.34, suspended:2520, attested:0.69,
    composition:{biological:0.87,emulation:0.07,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority"],
    dependency:"Refining contracts and everything else.",
    grievance:"Its place in the shed order, and the smell of the refining it does for other stations." },

  { id:"tallow", name:"Pavilion", band:"low", type:"single", form:"cluster",
    seats:1, population:65000,
    closure:0.39, suspended:1900, attested:0.7,
    composition:{biological:0.84,emulation:0.1,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "volume_rationing"],
    dependency:"Consumables processing quotas.",
    grievance:"That its workers process the Commonwealth's food and cannot afford the volume they live in." },

  { id:"quarry", name:"Stanbridge", band:"low", type:"single", form:"yard",
    seats:1, population:58000,
    closure:0.42, suspended:1530, attested:0.74,
    composition:{biological:0.86,emulation:0.08,uplift:0.04,synthetic:0.02},
    material_interest:["yard_contracts", "transit_windows"],
    dependency:"Construction demand, which is set by the volume appropriation.",
    grievance:"That its work rises and falls with the volume appropriation, which it has no say in." },

  { id:"drift", name:"The Verge", band:"low", type:"bundled", form:"cluster", settlements:11,
    seats:2, population:79000,
    closure:0.27, suspended:3640, attested:0.63,
    composition:{biological:0.83,emulation:0.11,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority"],
    dependency:"Federal transfers, for almost everything it consumes.",
    grievance:`Its place in the shed order and the size of the federal consumables lift.` },

  { id:"sinter", name:"Colonnade", band:"low", type:"single", form:"drum",
    seats:2, population:44000,
    closure:0.36, suspended:1340, attested:0.71,
    composition:{biological:0.85,emulation:0.09,uplift:0.04,synthetic:0.02},
    material_interest:["yard_contracts", "consumables_subsidy"],
    dependency:"Fabrication orders from the yards.",
    grievance:"That the yards whose orders it depends on are three bands away and deal with it by contract alone." },

  { id:"dredge", name:"John Henry", band:"low", type:"single", form:"yard",
    seats:1, population:34000,
    closure:0.33, suspended:1230, attested:0.66,
    composition:{biological:0.88,emulation:0.06,uplift:0.04,synthetic:0.02},
    material_interest:["transit_windows", "yard_contracts"],
    dependency:"Debris salvage contracts and the Kessler appropriation.",
    grievance:"That debris salvage is dangerous and necessary work, and is paid as scavenging." },

  { id:"selene", name:"Lunar Territory", band:"external", type:"external", form:"surface",
    seats:1, population:60000,
    closure:0.83, suspended:560, attested:0.9,
    composition:{biological:0.69,emulation:0.23,uplift:0.04,synthetic:0.04},
    material_interest:["transit_windows"],
    dependency:"Launch window allocation.",
    grievance:`That it is counted last.` },

  { id:"bloomery", name:"The Bloomery", band:"external", type:"external", form:"surface",
    seats:1, population:24000,
    closure:0.79, suspended:430, attested:0.86,
    composition:{biological:0.79,emulation:0.13,uplift:0.05,synthetic:0.03},
    material_interest:["transit_windows", "yard_contracts"],
    dependency:"Lunar feedstock contracts.",
    grievance:"That it is legislated for by a chamber none of whose members have visited." },

  { id:"l4", name:"Leadside", band:"external", type:"external", form:"yard",
    seats:1, population:25000,
    closure:0.88, suspended:240, attested:0.93,
    composition:{biological:0.47,emulation:0.42,uplift:0.03,synthetic:0.08},
    material_interest:["transit_windows", "substrate_supply"],
    dependency:"Almost nothing: it funds itself.",
    grievance:"Federal oversight of a station that funds itself." },

  { id:"achenar", name:"Outermost", band:"external", type:"external", form:"sphere",
    seats:1, population:13000,
    closure:0.86, suspended:230, attested:0.92,
    composition:{biological:0.42,emulation:0.48,uplift:0.03,synthetic:0.07},
    material_interest:["transit_windows", "substrate_supply"],
    dependency:"It reports no dependency on the Commonwealth.",
    grievance:"That it is counted in the apportionment at all: it regards its membership of the federation as a courtesy." },

  { id:"l5", name:"Sanctuary", band:"external", type:"external", form:"sphere",
    seats:1, population:11000,
    closure:0.91, suspended:120, attested:0.95,
    composition:{biological:0.38,emulation:0.51,uplift:0.03,synthetic:0.08},
    material_interest:["transit_windows"],
    dependency:"It reports no dependency on the Commonwealth.",
    grievance:`That the Commonwealth legislates for it at all.` }

];
