/* =============================================================
   FUNCTIONAL CONSTITUENCIES — 40 seats.

   Electorates are professions and industries rather than places.
   Bible 4.6: the founding compromise. The Charter's drafters needed
   the engineering guilds and the consortiums to accept civilian rule
   and paid with permanent seats. Explicitly transitional; the sunset
   clause has been extended four times.

   franchise decides how the seat is actually won, and each type plays
   completely differently:
     licensure   individuals holding a professional licence. The
                 government appoints the licensing board, so it can
                 widen or narrow the electorate by regulation, without
                 legislation. Bible 4.6.4 — the sharpest tool available.
     corporate   companies vote, not employees. Whoever controls the
                 company controls the seat. Electorates in the dozens.
     union_bloc  a union casts a bloc vote for its members.
     residual    everyone in no recognised sector: the unemployed, the
                 dependent, the suspended. Enormous, powerless,
                 grotesque. Bible 4.6.5 — the super-seat.

   held is the OPENING. At runtime the authority is the state's functional
   roll (st.functional), seeded from this and moved only by the `functional`
   effect, and each party's functional count is DERIVED from it. This held
   must still sum, across all sectors, to the party counts in parties.js;
   test.js checks both directions.

   electors — WHO IS ACTUALLY ON THE ROLL. Individual licence-holders,
   recognised unions casting for their membership, or registered
   companies, depending on franchise. The counts sum to `electorate`
   and test.js asserts it.

   gatekeeper — who decides admission to the roll. Most are appointed
   by the government, which is bible 4.6.4: the electorate can be
   widened or narrowed by regulation, without legislation, and that is
   the sharpest tool in the game. `appointed_by:"registry"` means the
   government cannot reach it directly, which is what makes those
   constituencies expensive to move.

   Seats here are contested by a MIXTURE: national partisan parties
   standing candidates, and professional bodies acting as political
   organisations in their own right. See parties.js `kind`.
   ============================================================= */

const FUNCTIONAL = [

  { id:"fc_lifesupport", name:"Life Support", seats:6,
    franchise:"licensure", electorate:4100,
    gatekeeper:{ board:"Life Support Licensing Board", appointed_by:"government" },
    electors:[
      { body:"Certifying Engineers, Institute of Life Support", count:1240 },
      { body:"Systems Engineers, Institute of Life Support", count:2860 } ],
    excluded:{ body:"Licensed Technicians", count:11000,
      note:`Admitting them would take the roll from 4,100 to 15,100 and swamp the certifying grades. The board that sets the roll can do it by order, and these eleven thousand people are what a packed board would add.` }, board:"Life Support Licensing Board",
    held:{ gb:5, hul:1 },
    members:[ { ref:"LS-1", party:"gb", name:"Kazuya Tanako" },
              { ref:"LS-2", party:"gb", name:"Sunniva Osei" },
              { ref:"LS-3", party:"gb", name:"Torsten Kessel" },
              { ref:"LS-4", party:"gb", name:"Anneke Verhoeven" },
              { ref:"LS-5", party:"gb", name:"Casimir Falk" },
              { ref:"LS-6", party:"hul", name:"Ruslan Enyeto" } ],
    interest:["integrity_standards","licensure_scope"],
    note:"The seats that were the original case for the functional tier. Its members have not voted with a government on licensure since 2072.",
    description:"Six seats on a roll of 4,100 certifying and systems engineers, the narrowest licensed electorate in the Commonwealth. The board that sets the roll is appointed by the government, and whether to admit the eleven thousand licensed technicians it excludes is the central dispute about the tier." },

  { id:"fc_maintenance", name:"Maintenance and Trades", seats:7,
    franchise:"union_bloc", electorate:214000,
    gatekeeper:{ board:"Registry of Recognised Unions", appointed_by:"registry" },
    electors:[
      { body:"Maintenance Union", count:168000 },
      { body:"Pressure Fitters' Society", count:21400 },
      { body:"Hull Platers", count:15900 },
      { body:"Rotational Mechanics", count:8700 } ],
    note_franchise:"The union's executive casts the votes of all 214,000 members, so one party holds all seven seats, and a scandal in the executive reaches every seat it returns.", board:null,
    held:{ cu:7 },
    members:[ { ref:"MT-1", party:"cu", name:"Marit Thibault" },
              { ref:"MT-2", party:"cu", name:"Corin Rasheed" },
              { ref:"MT-3", party:"cu", name:"Wren Cardew" },
              { ref:"MT-4", party:"cu", name:"Bax Drummond" },
              { ref:"MT-5", party:"cu", name:"Osma Nkemelu" },
              { ref:"MT-6", party:"cu", name:"Taavi Lund" },
              { ref:"MT-7", party:"cu", name:"Bright Stavros" } ],
    interest:["essential_services_law","shed_order_priority"],
    note:"The largest functional electorate by two orders of magnitude. Its seven seats vote with the left, so the functional tier is not uniformly on the right.",
    description:"Seven seats decided by four union executives casting for 214,000 members. The largest electorate in the tier by two orders of magnitude, and the reason it is not uniformly right-wing: the maintenance union holds all seven and votes with the left." },

  { id:"fc_substrate", name:"Substrate and Hosting", seats:4,
    franchise:"corporate", electorate:411,
    gatekeeper:{ board:"Corporate Registry", appointed_by:"registry",
                 test:"hosting capacity above the registration floor" },
    electors:[
      { body:"Major providers", count:9 },
      { body:"Mid-tier hosts", count:74 },
      { body:"Marginal and shell registrations", count:328 } ],
    note_franchise:"One company, one vote. Incorporating a company is cheap and a minimum hosting capacity is the only barrier, so the roll includes shell registrations: six companies on it were incorporated in the same week.", board:null,
    held:{ cl:2, psa:2 },
    members:[ { ref:"SH-1", party:"cl", name:"Petra Quintana" },
              { ref:"SH-2", party:"cl", name:"Emeric Haruna" },
              { ref:"SH-3", party:"psa", name:"Vesna Girard" },
              { ref:"SH-4", party:"psa", name:"Idris Ulanov" } ],
    interest:["substrate_ownership","thermal_quota"],
    note:"411 registered corporate voters, among them shell registrations: six were incorporated in the same week.",
    description:"Four seats on 411 registered companies, nine of which hold most of the hosting capacity. Incorporating a company is cheap and a minimum hosting capacity is the only barrier, so the roll includes shell registrations, six of them incorporated in the same week." },

  { id:"fc_consumables", name:"Consumables and Agriculture", seats:4,
    franchise:"licensure", electorate:8900,
    gatekeeper:{ board:"Agricultural Standards Board", appointed_by:"government" },
    electors:[
      { body:"Licensed deck cooperativists", count:6180 },
      { body:"Registered volume-holders", count:2720 } ],
    note_franchise:"Growers and the landlords of growing space share one roll under the founding compromise, and neither group is large enough to win the seats alone.", board:"Agricultural Standards Board",
    held:{ cu:2, fh:2 },
    members:[ { ref:"CA-1", party:"cu", name:"Selim Ashgrove" },
              { ref:"CA-2", party:"cu", name:"Thea Bellweather" },
              { ref:"CA-3", party:"fh", name:"Aurel Xhosa" },
              { ref:"CA-4", party:"fh", name:"Mira Yarrow" } ],
    interest:["consumables_subsidy","volume_rationing"],
    note:"Deck cooperativists and volume owners, in the same electorate, permanently.",
    description:"Four seats on 8,900 licensed growers and volume-holders, on one roll. The founding compromise put the cooperativists and the landlords on one roll, and neither group is large enough to win the seats alone." },

  { id:"fc_transit", name:"Transit and Orbital Mechanics", seats:3,
    franchise:"licensure", electorate:3400,
    gatekeeper:{ board:"Transit Certification Board", appointed_by:"government" },
    electors:[
      { body:"Certified transfer pilots", count:1510 },
      { body:"Traffic controllers", count:1180 },
      { body:"Debris and conjunction analysts", count:710 } ], board:"Transit Certification Board",
    held:{ hul:2, cl:1 },
    members:[ { ref:"TO-1", party:"hul", name:"Rasmus Zerbe" },
              { ref:"TO-2", party:"hul", name:"Ilse Pentreath" },
              { ref:"TO-3", party:"cl", name:"Anouk Ijaz" } ],
    interest:["transit_windows","debris_remediation"],
    note:"The electorate that certifies every crewed transfer. Its members press for more action on the risk of a debris cascade than the House has taken.",
    description:"Three seats on 3,400 certified pilots, controllers and conjunction analysts. The board certifies every crewed transfer, and its members press for more action on the risk of a debris cascade than the House has taken." },

  { id:"fc_elevator", name:"Tether and Anchorage", seats:4,
    franchise:"corporate", electorate:62,
    gatekeeper:{ board:"Consortium Register", appointed_by:"registry" },
    electors:[
      { body:"Anchor lessees", count:5 },
      { body:"Loop operators", count:23 },
      { body:"Tether service consortiums", count:34 } ],
    note_franchise:`Weighted by each voter's share of tether capacity. Sixty-two voters and the largest balance sheet in the Commonwealth; a flat franchise would understate their stake.`, board:null,
    held:{ cl:3, fh:1 },
    members:[ { ref:"TA-1", party:"cl", name:"Lorcan Estévez" },
              { ref:"TA-2", party:"cl", name:"Ottilie Jekabs" },
              { ref:"TA-3", party:"cl", name:"Dmitri Tokarev" },
              { ref:"TA-4", party:"fh", name:"Sena Reyes" } ],
    interest:["anchor_concession","tether_traffic"],
    note:"Sixty-two voters, the smallest electorate in the Commonwealth: the owners and operators of the tethers.",
    description:`Four seats on 62 voters, each vote weighted by the voter's share of tether capacity. The smallest electorate in the Commonwealth, and the one with the largest holdings. Critics of the functional tier cite it as the extreme case.` },

  { id:"fc_medicine", name:"Medicine and Embodiment", seats:3,
    franchise:"licensure", electorate:2700,
    gatekeeper:{ board:"Medical Licensing Board", appointed_by:"government" },
    electors:[
      { body:"Licensed physicians", count:1940 },
      { body:"Embodiment practitioners", count:480 },
      { body:"Restoration nursing register", count:280 } ], board:"Medical Licensing Board",
    held:{ rv:1, hul:2 },
    members:[ { ref:"ME-1", party:"rv", name:"Nadia Abadi" },
              { ref:"ME-2", party:"hul", name:"Yusuf Achterberg" },
              { ref:"ME-3", party:"hul", name:"Halle Kowalczyk" } ],
    interest:["bone_density_standards","embodiment_access"],
    note:"The electorate through which the Congregational Democratic Alliance's position on continuity of soul reaches health policy, as clinical guidance.",
    description:"Three seats on 2,700 licensed physicians and embodiment practitioners. The Congregational Democratic Alliance's position on continuity of soul reaches health policy through it as clinical guidance, and the roll is set by a government-appointed board." },

  { id:"fc_attestation", name:"Attestation and Registry", seats:2,
    franchise:"licensure", electorate:890,
    gatekeeper:{ board:"Registry Practice Board", appointed_by:"registry" },
    electors:[
      { body:"Registrars", count:340 },
      { body:"Attestation officers", count:550 } ],
    note_franchise:`It administers the roll that decides who may vote anywhere, and is itself elected by 890 registrars and officers who admit one another to the profession. The arrangement is deliberate: every reform proposed since the Charter would give the roll to a body the House trusts less.`, board:"Registry Practice Board",
    held:{ gb:2 },
    members:[ { ref:"AR-1", party:"gb", name:"Edward Hatt" },
              { ref:"AR-2", party:"gb", name:"Imre Chatterjee" } ],
    interest:["attestation_enforcement","registry_powers"],
    note:"Administers the roll that decides who may vote, and is itself elected by a roll of 890 registrars and officers.",
    description:`Two seats on 890 registrars and attestation officers, on a roll that decides who may vote anywhere else. The arrangement is deliberate: every reform proposed since the Charter would give the roll to a body the House trusts less.` },

  { id:"fc_underwriting", name:"Insurance and Underwriting", seats:3,
    franchise:"corporate", electorate:140,
    gatekeeper:{ board:"Underwriters' Register", appointed_by:"registry" },
    electors:[
      { body:"Syndicates", count:46 },
      { body:"Mutuals", count:94 } ],
    note_franchise:"Weighted by book size.", board:null,
    held:{ fh:3 },
    members:[ { ref:"IU-1", party:"fh", name:"Rane Rossi" },
              { ref:"IU-2", party:"fh", name:"Saskia Delacroix" },
              { ref:"IU-3", party:"fh", name:"Osric Nakamura" } ],
    interest:["risk_pricing","substrate_insurance"],
    note:"The insurers who price the Commonwealth's risks, and hold the most complete figures on them.",
    description:"Three seats on 140 corporate voters, weighted by book size. Its voters are the Underwriters' member firms, whose business is pricing the risks of every other sector." },

  { id:"fc_legal", name:"Legal", seats:3,
    franchise:"licensure", electorate:5200,
    gatekeeper:{ board:"Bar Admissions Board", appointed_by:"government" },
    electors:[
      { body:"Admitted advocates", count:3900 },
      { body:"Instance-law specialists", count:1300 } ], board:"Bar Admissions Board",
    held:{ gb:2, hul:1 },
    members:[ { ref:"LG-1", party:"gb", name:"Sunniva Tanaka" },
              { ref:"LG-2", party:"gb", name:"Corin Wexler" },
              { ref:"LG-3", party:"hul", name:"Nikolai Schneider" } ],
    interest:["reclassification_practice","charter_interpretation"],
    note:"Instance law became a branch of practice because the Charter's schedule of persons left many cases undecided.",
    description:"Three seats on 5,200 admitted advocates and instance-law specialists. Instance law became a branch of practice because the Charter's schedule of persons left many cases undecided, and the bar argues those cases." },

  { id:"fc_residual", name:"Residual Constituency", seats:1,
    franchise:"residual", electorate:3910000,
    complement:true,
    gatekeeper:{ board:"none", appointed_by:"none",
                 test:"every adult on the roll enrolled in no other functional constituency" },
    note_franchise:`The residual is the complement of the other ten rolls. Nobody registers for it; a person arrives in it by being excluded from everything else. Narrow a licensed roll and the excluded fall in here, where three million nine hundred thousand people return one member. Widen one and it shrinks. Every board-packing order moves people across this line.`, board:null,
    held:{ hul:1 },
    members:[ { ref:"RC-1", party:"hul", name:"Perpetua Volkov" } ],
    interest:["consumables_floor","substrate_insurance"],
    note:"Everyone in no recognised sector: the unemployed, the dependent, the suspended. " +
         "Three million nine hundred thousand electors, one seat. Held at present by the Association of Engineers and Systems.",
    description:`One seat on the complement of every other roll: the unemployed, the dependent, the suspended, 3,910,000 electors in all. A person is enrolled in it by being excluded from every other roll, so narrowing any licensed roll enlarges it.` }

];
