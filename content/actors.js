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

   PROSE, T16 — four kinds of power, four registers. A board is the
   state's own creature until it is not, and speaks like an institution
   that has outlived every government it has certified. A consortium owns
   the thing everyone needs and is patient about it, and speaks like old
   infrastructure: unhurried, commercial, long-horizon. A bloc cannot
   vote and is therefore active by other means, and speaks like a crowd.
   A union is the strike weapon and the party's own base, and speaks like
   a shop floor. None of them sound alike, on purpose.

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
    note: "The board that certifies who may work on a life-support system. It is appointed by the government and independent of it in every way that matters, and it has never needed to say which it is acting as." },

  { id: "lb_substrate", name: "Substrate Operations Licensing Board", kind: "board",
    standing: 38, patience: 55,
    reach: { fc_substrate: 5 },
    wants: { divergence_threshold_hours: -1, substrate_ownership: 1, thermal_quota: 1 },
    asks: "a public stake in substrate provision, this session",
    note: "The board that decides who is a substrate engineer, in the sector where that is the contested question. Its appointments run for life, and it remembers every government that has tried to shorten one." },

  { id: "forkrentiers", name: "The Fork-Rentiers", kind: "bloc",
    standing: 22, patience: 30,
    reach: { fc_attestation: 3, fc_substrate: 2 },
    wants: { divergence_threshold_hours: -1, attestation_enforcement: -1, registry_powers: -1 },
    asks: "no new attestation requirement before the House rises",
    note: "Two hundred and ten thousand people who rent out their own instances, cannot vote, and are therefore active by other means. They are not organised. They are numerous, which the chamber has learned is not the same thing." },

  { id: "maintenance_union", name: "Combined Maintenance Trades", kind: "union",
    standing: 61, patience: 45,
    reach: { fc_maintenance: 4 },
    wants: { divergence_threshold_hours: 1, essential_services_law: 1, shed_order_priority: 1 },
    asks: "no reduction in the embodied labour floor",
    note: "The strike weapon, and the player's own party's base. It is blunt, it is patient, and it has never forgotten that the party came out of the same sheds it did." },

  { id: "anselm_elevator", name: "Anselm Elevator", kind: "consortium",
    standing: 44, patience: 80,
    reach: { fc_elevator: 3, fc_transit: 2 },
    wants: { divergence_threshold_hours: 1, anchor_concession: 1, transit_windows: 1 },
    asks: "the anchorage concession ratified before the House rises",
    note: "Owns the tether everything arrives on, and has owned it long enough to speak of it the way other people speak of the weather. It does not hurry, because it cannot lose, and it does not threaten, because it does not have to." },

  { id: "standard_substrate", name: "Standard Substrate", kind: "consortium",
    standing: 35, patience: 65,
    reach: { fc_substrate: 3 },
    wants: { divergence_threshold_hours: -1, substrate_ownership: -1, risk_pricing: 1 },
    asks: "leave the public substrate share where it is",
    note: "Sells the substrate a person runs on, and its position is that more people should need it. Its patience is the market's patience, and it prices accordingly." },

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
    note: "Licenses the practitioners who argue what a person is, and is appointed by the government whose law they argue about. It has outlasted forty ministries, and it knows it." },

  { id: "college_medicine", name: "College of Medicine and Embodiment", kind: "board",
    standing: 57, patience: 50,
    reach: { fc_medicine: 3 },
    wants: { divergence_threshold_hours: 1, embodiment_access: 1, bone_density_standards: 1 },
    asks: "hold the embodiment access standard for a full session",
    note: "Decides who may practise on a body, in a Commonwealth arguing about whether one is required. Its membership is ancient and its minutes are published two years late." },

  { id: "underwriters", name: "Circumterrestrial Underwriters", kind: "consortium",
    standing: 41, patience: 85,
    reach: { fc_underwriting: 3, fc_residual: 1 },
    wants: { divergence_threshold_hours: 1, risk_pricing: 1, substrate_insurance: 1 },
    asks: "no statutory cap on substrate risk pricing",
    note: "Prices the risk that a person stops running, and holds the only complete numbers in the Commonwealth. It does not campaign, because the numbers do." },

  { id: "bellweather", name: "Bellweather Consumables", kind: "consortium",
    standing: 49, patience: 60,
    reach: { fc_consumables: 3 },
    wants: { consumables_floor: 1, consumables_subsidy: 1, substrate_insurance: 1 },
    asks: "no consumables price intervention this session",
    note: "Sells the food, air and water, and can stop a station by not loading a ship. Its politics is a schedule and a cold chain." },

  /* EARTH (Flash I). Two governments the crisis runs through: the bloc
     that can sanction the Commonwealth, and the host state the abandoned
     platform sits on. No reach, no wants: they deliver nothing in the
     chamber. Their standing is read by events and mirrors the friction
     meter, and their asks are the price of relief. Names are
     placeholders for the author's Earth canon. */

  { id: "earth_bloc", name: "The Earth Bloc", kind: "state",
    standing: 50, patience: 60,
    reach: {}, wants: {},
    asks: "the platform's corporate debt is honoured before any annexation",
    note: "PLACEHOLDER. The treaty-bound Earth governments, whose banks froze the platform's accounts and whose courts will hear the salvage law." },

  { id: "earth_host", name: "The Host State", kind: "state",
    standing: 55, patience: 40,
    reach: {}, wants: {},
    asks: "a repatriation corridor for its citizens, however long the process takes",
    note: "PLACEHOLDER. The nation whose soil the platform's anchor stands on, and whose public procurement law makes a two-year rescue the fast one." }
];

if (typeof module !== "undefined") module.exports = ACTORS;
