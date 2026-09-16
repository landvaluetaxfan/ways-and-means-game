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

   PROSE IS A PLACEHOLDER. Each `note` is one flat line so the
   mechanism can be seen working. TODO opencode: these are four
   kinds of power with four registers and none of them should sound
   like the others.
   ============================================================= */
const ACTORS = [

  { id: "lb_lifesupport", name: "Life Support Licensing Board", kind: "board",
    standing: 54, patience: 70,
    reach: { fc_lifesupport: 4 },
    wants: { divergence_threshold_hours: 1, licensure_scope: 1, integrity_standards: 1 },
    asks: "hold the certification schedule for a full session",
    note: "Appointed by the government, and votes like it until it does not." },

  { id: "lb_substrate", name: "Substrate Operations Licensing Board", kind: "board",
    standing: 38, patience: 55,
    reach: { fc_substrate: 5 },
    wants: { divergence_threshold_hours: -1, substrate_ownership: 1, thermal_quota: 1 },
    asks: "a public stake in substrate provision, this session",
    note: "The board that decides who is a substrate engineer, in the sector where that is the contested question." },

  { id: "forkrentiers", name: "The Fork-Rentiers", kind: "bloc",
    standing: 22, patience: 30,
    reach: { fc_attestation: 3, fc_substrate: 2 },
    wants: { divergence_threshold_hours: -1, attestation_enforcement: -1, registry_powers: -1 },
    asks: "no new attestation requirement before the House rises",
    note: "Two hundred and ten thousand people who rent out their own instances. They cannot vote and are therefore active by other means." },

  { id: "maintenance_union", name: "Combined Maintenance Trades", kind: "union",
    standing: 61, patience: 45,
    reach: { fc_maintenance: 4 },
    wants: { divergence_threshold_hours: 1, essential_services_law: 1, shed_order_priority: 1 },
    asks: "no reduction in the embodied labour floor",
    note: "The strike weapon, and the player's own party's base." },

  { id: "anselm_elevator", name: "Anselm Elevator", kind: "consortium",
    standing: 44, patience: 80,
    reach: { fc_elevator: 3, fc_transit: 2 },
    wants: { divergence_threshold_hours: 1, anchor_concession: 1, transit_windows: 1 },
    asks: "the anchorage concession ratified before the House rises",
    note: "Owns the tether everything arrives on. Patient, because it can afford to be." },

  { id: "standard_substrate", name: "Standard Substrate", kind: "consortium",
    standing: 35, patience: 65,
    reach: { fc_substrate: 3 },
    wants: { divergence_threshold_hours: -1, substrate_ownership: -1, risk_pricing: 1 },
    asks: "leave the public substrate share where it is",
    note: "Sells the substrate a person runs on, and would rather more people needed it." },

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
    note: "Licenses the practitioners who argue what a person is, and is appointed by the government whose law they argue about." },

  { id: "college_medicine", name: "College of Medicine and Embodiment", kind: "board",
    standing: 57, patience: 50,
    reach: { fc_medicine: 3 },
    wants: { divergence_threshold_hours: 1, embodiment_access: 1, bone_density_standards: 1 },
    asks: "hold the embodiment access standard for a full session",
    note: "Decides who may practise on a body, in a Commonwealth arguing about whether one is required." },

  { id: "underwriters", name: "Circumterrestrial Underwriters", kind: "consortium",
    standing: 41, patience: 85,
    reach: { fc_underwriting: 3, fc_residual: 1 },
    wants: { divergence_threshold_hours: 1, risk_pricing: 1, substrate_insurance: 1 },
    asks: "no statutory cap on substrate risk pricing",
    note: "Prices the risk that a person stops running, and would rather the law did not decide when that has happened." },

  { id: "bellweather", name: "Bellweather Consumables", kind: "consortium",
    standing: 49, patience: 60,
    reach: { fc_consumables: 3 },
    wants: { consumables_floor: 1, consumables_subsidy: 1, substrate_insurance: 1 },
    asks: "no consumables price intervention this session",
    note: "Can withhold a shipment, which is the whole of its politics." }
];

if (typeof module !== "undefined") module.exports = ACTORS;
