/* =============================================================
   ACTORS — the bodies that are not in the chamber and not the state.

   Bible §10.10: "Metanationals. Elevator consortiums, substrate
   providers, consumables cartels as actors with NEAR PARTY-TIER
   POWER, not lobbyists in the margins." Until now they had less
   representation in state than a backbencher: parties carry
   loyalty and characters carry a relationship, and a consortium
   that can withhold a shipment carried nothing at all.

   Every body here is named in canon. The four kinds:

     board       a licensing board. §4.6.4, LOCKED and called the
                 sharpest tool in the game: franchise in a functional
                 constituency runs through professional licensure and
                 the government appoints the boards, so a board is
                 the gatekeeper of who votes in its seats.
     consortium  a metanational. Names are taken from the
                 `consortium` pool in content/names.js, which is
                 canon; none is invented here.
     bloc        an unenfranchised interest. The fork-rentiers
                 (§10.5) are the worked example: they cannot vote,
                 "and are therefore active by other means", which is
                 the sentence this whole file exists to make true.
     union       organised labour. content/labour.js models the
                 workforce in detail and nothing represented it
                 politically.

   FIELDS

     standing   0-100. How well disposed they are to the government.
                It is NOT a resource the player spends: it is what
                they think of you, and lobbying spends it.
     patience   0-100. How long they will wait before acting on
                their own. Read by design/23's third party; unread
                by the engine today and deliberately present, so the
                field exists before the behaviour needs it.
     reach      the functional constituencies whose benches this body
                can actually move, and by how many seats at most.
                An actor with no reach can still be talked to and
                cannot deliver anything.
     wants      WHAT THE BODY HAS A STAKE IN. Two kinds of key, and a
                measure answers to the body when it is about either:
                  - an INTEREST, as a bill declares one in `touches`
                    (risk_pricing, essential_services_law, anchor_
                    concession) — the thing the body is, not a number
                    it happens to watch
                  - a LAW KEY (divergence_threshold_hours) the measure
                    moves, with the direction: positive means they want
                    the number higher
                A body whose only stake is one law key is a single-issue
                pressure group, which none of these are (T19). Every
                body carries two or three, and they are what the lobby
                panel offers a measure against.
     asks       what they want in return, as an undertaking. The
                price of a lobbied bench is never money: it is a
                promise, and a promise has a deadline.

   PROSE (design/45, superseding T16). T16 gave each kind a register of
   its own: a board "speaks like an institution that has outlived every
   government it has certified", a consortium "unhurried, commercial". In
   a note that became a temperament where the facts belonged ("It does not
   hurry, because it cannot lose"), and the author asked what a player gets
   from it. A note is Reference: what the body is, what it controls, how it
   reaches the House, what it wants. The voices belong to the events in
   which these bodies speak.

   FLASH I adds a fifth kind, and it is a fifth register:

     state       a foreign government. Outside the chamber and outside
                 the Commonwealth, with no reach and no wants in the
                 functional benches: it cannot deliver a vote. What it
                 has is standing, patience and an ask, and the campaign
                 reads those through events and the friction meter. The
                 names below are placeholders for the author's Earth
                 canon; the engine does not enumerate kinds, so a fifth
                 is data, not machinery.
   ============================================================= */
const ACTORS = [

  { id: "lb_lifesupport", name: "Life Support Licensing Board", kind: "board",
    standing: 54, patience: 70,
    reach: { fc_lifesupport: 4 },
    wants: { divergence_threshold_hours: 1, licensure_scope: 1, integrity_standards: 1 },
    asks: "hold the certification schedule for a full session",
    note: "The Life Support Licensing Board certifies who may work on life-support systems, and so decides who votes in the Life Support functional constituency. The government appoints its members, and it can move votes on that constituency's bench." },

  { id: "lb_substrate", name: "Substrate Operations Licensing Board", kind: "board",
    standing: 38, patience: 55,
    reach: { fc_substrate: 5 },
    wants: { divergence_threshold_hours: -1, substrate_ownership: 1, thermal_quota: 1 },
    asks: "a public stake in substrate provision, this session",
    note: "The Substrate Operations Licensing Board decides who is licensed as a substrate engineer, which sets the electorate of the Substrate and Hosting functional constituency. Its members are appointed for life, and it can move votes on that bench." },

  { id: "forkrentiers", name: "The Fork-Rentiers", kind: "bloc",
    standing: 22, patience: 30,
    reach: { fc_attestation: 3, fc_substrate: 2 },
    wants: { divergence_threshold_hours: -1, attestation_enforcement: -1, registry_powers: -1 },
    asks: "no new attestation requirement before the House rises",
    note: "The fork-rentiers are about 210,000 people who rent out instances of themselves for work. They cannot vote and have no organisation, and their weight in the House comes through the Attestation and Registry and the Substrate and Hosting benches, where they can move votes." },

  { id: "maintenance_union", name: "Combined Maintenance Trades", kind: "union",
    standing: 61, patience: 45,
    reach: { fc_maintenance: 4 },
    wants: { divergence_threshold_hours: 1, essential_services_law: 1, shed_order_priority: 1 },
    asks: "no reduction in the embodied labour floor",
    note: "The Combined Maintenance Trades is the union of the workers who maintain the stations' systems, and its members can strike. It is affiliated to the Party of Socialists and Democrats and votes as a block at its conference, and its executive casts the votes of the Maintenance and Trades functional constituency on its members' behalf." },

  { id: "anselm_elevator", name: "Anselm Elevator", kind: "consortium",
    standing: 44, patience: 80,
    reach: { fc_elevator: 3, fc_transit: 2 },
    wants: { divergence_threshold_hours: 1, anchor_concession: 1, transit_windows: 1 },
    asks: "the anchorage concession ratified before the House rises",
    note: "Anselm Elevator is the consortium that owns and operates the Beanstalk, the tether at Macapá on which Anselm Ring's traffic from Earth arrives. Its concession on the anchorage awaits ratification by the House, and it can move votes on the Tether and Anchorage and the Transit benches." },

  { id: "standard_substrate", name: "Standard Substrate", kind: "consortium",
    standing: 35, patience: 65,
    reach: { fc_substrate: 3 },
    wants: { divergence_threshold_hours: -1, substrate_ownership: -1, risk_pricing: 1 },
    asks: "leave the public substrate share where it is",
    note: "Standard Substrate is a private provider of substrate, the hardware emulated persons run on, and charges by the hour of computation. It opposes a larger public share of substrate provision, and can move votes on the Substrate and Hosting bench." },

  /* THREE BODIES ADDED FOR A STRUCTURAL REASON, not a narrative one.

     Domain consent lets the constituency that owns a subject refuse it,
     and the answer to a refusal is to go and talk to the people whose
     bench it is. A constituency NO BODY REACHES therefore has an
     absolute veto and no counter-move, which is the failure mode the
     whole design is trying to avoid. Measured before these were added:
     Legal, Medicine and Embodiment, Insurance and Underwriting and the
     Residual Constituency could be reached by nobody, and the divergence
     bill was unpassable because Legal's three seats could not be moved
     by any mechanic in the game.

     test.js asserts the invariant now: every functional constituency is
     reachable by at least one body. An eighth body added to content must
     keep it true, and a twelfth constituency must come with somebody who
     can talk to it. */

  { id: "lb_legal", name: "Board of Legal Practice", kind: "board",
    standing: 46, patience: 75,
    reach: { fc_legal: 3 },
    wants: { divergence_threshold_hours: -1, reclassification_practice: 1, charter_interpretation: 1 },
    asks: "no ministerial direction over reclassification practice",
    note: "The Board of Legal Practice licenses the Commonwealth's lawyers, among them the practitioners who argue reclassification cases, on whether a person is a person in law. The government appoints its members, and it can move votes on the Legal bench." },

  { id: "college_medicine", name: "College of Medicine and Embodiment", kind: "board",
    standing: 57, patience: 50,
    reach: { fc_medicine: 3 },
    wants: { divergence_threshold_hours: 1, embodiment_access: 1, bone_density_standards: 1 },
    asks: "hold the embodiment access standard for a full session",
    note: "The College of Medicine and Embodiment licenses those who practise medicine on a body. It admits new fellows by election of its existing fellows, publishes its minutes two years after each meeting, and can move votes on the Medicine and Embodiment bench." },

  { id: "underwriters", name: "Circumterrestrial Underwriters", kind: "consortium",
    standing: 41, patience: 85,
    reach: { fc_underwriting: 3, fc_residual: 1 },
    wants: { divergence_threshold_hours: 1, risk_pricing: 1, substrate_insurance: 1 },
    asks: "no statutory cap on substrate risk pricing",
    note: "The Circumterrestrial Underwriters is the Commonwealth's insurance market: the syndicates and mutuals on the Bourse that insure habitats, stations and substrate against failure. Because it insures against a person ceasing to run, it holds the most complete figures on margins, suspensions and default of any body in the Commonwealth. Seven of its members have committed CW$36bn to the Treasury through the Commonwealth Reserve Notes, and it can move votes on the Insurance and Underwriting bench." },

  { id: "bellweather", name: "Bellweather Consumables", kind: "consortium",
    standing: 49, patience: 60,
    reach: { fc_consumables: 3 },
    wants: { consumables_floor: 1, consumables_subsidy: 1, substrate_insurance: 1 },
    asks: "no consumables price intervention this session",
    note: "Bellweather Consumables supplies food, air and water to the stations and ships them on its own schedule, so a station it stops loading for runs short. It can move votes on the Consumables and Agriculture bench." },

  { id: "tribunal", name: "The Tribunal", kind: "court",
    standing: 55, patience: 90,
    reach: {}, wants: {},
    asks: "that every reference it hears is answered",
    note: "The Tribunal is the court that hears challenges to the government's statutory instruments. It can strike an order, read it narrowly or uphold it, and a case before it is heard on a named sitting. Its disposition toward the government, out of 100, decides how generously it reads an order, and rises when the government answers its references, defends its cases and complies with its rulings." },

  /* EARTH (Flash I). Two governments the crisis runs through: the bloc
     that can sanction the Commonwealth, and the host state the abandoned
     platform sits on. No reach, no wants: they deliver nothing in the
     chamber. Their standing is read by events and mirrors the friction
     meter, and their asks are the price of relief.

     FOREIGN ACTORS (design/11). `foreign:true` puts them on the foreign
     panel and not in the lobby table, and `lag` is the organising axis:
     sittings between what they decide and what the Commonwealth is told.
     A foreign fact is never current, so the panel prints the standing as
     of when it was last heard and says how long ago that was. Earth is
     nearly current; Mars is eleven sittings behind, and the whole point
     of the layer is that the two feel different in the same list. */
  { id: "earth_bloc", name: "The European Union", kind: "state", foreign: true, lag: 2,
    standing: 50, patience: 60,
    reach: {}, wants: {},
    asks: "the platform's corporate debt is honoured before any annexation",
    note: "The European Union is the treaty union that has sanctioned the Commonwealth. It is the one party to the dispute with an anchor on its own territory: Tether 4, at Kourou. Its complaint is that the orbital franchises undercut European labour and personhood law beyond the reach of European courts. Its decisions reach the Commonwealth two sittings after they are taken in Brussels." },

  { id: "earth_host", name: "Kenya", kind: "state", foreign: true, lag: 1,
    standing: 55, patience: 40,
    reach: {}, wants: {},
    asks: "a repatriation corridor for its citizens, however long the process takes",
    note: "Kenya is the state on whose soil the International Earth-Orbit Elevator stands. It is a middle power with a large public administration and an established space programme, and its procurement law makes a repatriation of the platform's workers take two years. It will not pay for the wind-up of a foreign corporation, and it opposes any annexation of the platform at the foot of its tether. Its decisions reach the Commonwealth within a sitting." },

  { id: "mars", name: "Chryse Basin and Nili Republic", kind: "state", foreign: true, lag: 11,
    standing: 44, patience: 80,
    reach: {}, wants: {},
    asks: "a public statement of the Commonwealth's position on the metanationals",
    note: "Mars is divided between the Chryse Basin, which wants to mine, and the Nili Republic, where Mars' strongest evidence of ancient life lies and which will not allow it. It buys from the same extraction companies that abandoned the platform. A dispatch reaches it in minutes, and its answer comes when both halves have agreed, eleven sittings later." },

  { id: "metanationals", name: "Cordell", kind: "metanational", foreign: true, lag: 3,
    standing: 47, patience: 70,
    reach: {}, wants: {},
    asks: "the anchor concessions renewed without ratification, on their terms",
    note: "Cordell is an extraction company chartered by the Gabonese Assembly in 2044 and majority-owned by Gabon's sovereign fund. It abandoned the Almanac Works through a ring-fenced subsidiary. It holds two anchor concessions, at Port-Gentil and on Chimborazo, and the Port-Gentil line serves Rookworks—Anselm, so it has interests inside the Commonwealth as well as outside it. Its position is that it acted within its rights." }
];

if (typeof module !== "undefined") module.exports = ACTORS;
