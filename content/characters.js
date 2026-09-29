/* CHARACTERS — the fixed roster. Additions are deliberate canon: a content
   pass may not invent a person, but the front benches are cast here in full
   so the seat table can mark who is not a backbencher.

   office — the one-word badge the orbit seat table shows beside a member.
   It is a mark, not a job title; `role` carries the full title.
     pm          Prime Minister
     minister    Cabinet minister
     opposition  Leader of the Opposition
     shadow      Shadow minister
     leader      leader of a party
     whip        Chief Whip
   current — the faction inside the party a member belongs to, an id from
   CURRENTS in content/parties.js. Read by the bench roll, the members list,
   the signature count (a member's willingness to sign against the leader is
   their current's loyalty) and the reshuffle (a dismissed minister's current
   takes it personally). Assigned 23 Sep 2026; nobody carried one before, so
   all three read nothing (design/34 D3). A member for a FUNCTIONAL seat has
   none: currents count the popular seats only.
   The Speaker is NOT an office here: it is a property of the seat
   (`speaker:true`), because the Chair belongs to the House, not the person.
   Rename people freely — they are referenced by id, and tools/renametest.js
   checks that a rename preserves behaviour.

   The author's cast is all members of the House of Delegates, of one tier or
   another, except the President and the two non-parliamentary voices (the
   press and the deck civilian). A name on the author's list is never below an
   MP.

   NAMING SCHEME — locked.
      Parliament          the legislature
     House of Delegates  the elected chamber
     MP                  Member of Parliament, of any tier
     Prime Minister      head of government, chairs Cabinet
     Ministry            an executive department
     Minister for X      heads a Ministry and sits in Cabinet
   Not: Secretary of State, Department. The head of government is Prime
   Minister on every instrument of appointment, and nothing else.
   seat — the constituency a member sits for. It must be a real one:
   two of these previously named constituencies that did not exist
   ("Anselm Ring N & Central", "Homestead A-D"), each straddling two,
   and nothing caught it because nothing linked a person to a seat.

   portrait: filename in img/portraits/ processed with the `registry` palette.
   Omit it and the UI simply renders no portrait.

   SUBSTRATE — bible §6.10's clean structure, not the law's broken one:
     category  what the member is made of: biological | emulation | uplift |
               synthetic. Augmented, interfacing and cyborg are NOT
               categories — they are a biological with statuses, or nothing
               at all and a line in `note`, which is where the President's
               cat ears were already correct.
     status    the relation the member stands in: instance | suspended |
               unattested | disembodied. Usually none.

   THE HOUSE IS NOT PROPORTIONAL AND THAT IS THE POINT. The population is
   64/28/4/4 across 7,086,000. This roster is 54 named members — 42
   biological (77.8%), 9 emulation (16.7%), 2 uplift (3.7%), 1 synthetic
   (1.9%). Emulation is under-represented, and of the twelve who are not
   biological only FOUR hold a district seat (Herrera, Vasmer, Trottier,
   Ivarsen); the rest are functional or list. Districts return the embodied,
   the list tier is where the emulated get in — bible §4.8's sentence about
   the New Progressive Party, made checkable. */
const CHARACTERS = [
  /* ---- the government ---- */
  { id:"flash", pronouns:"she", portrait:"flash.png",   name:"Rt. Hon. Adriana Flash MP", role:"Prime Minister",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"First Spin", relationship:100, office:"pm",
    bio:"Adriana Flash came up to the Winter Garden in 2070 from a career in Earth banking with Alphabet-JPMorgan Omni. In 2071 she became the first Governor of the [[reserve_bank|Reserve Bank]], and in 2073 she floated the [[commonwealth_dollar|Commonwealth dollar]] at parity with the US dollar. She left the Bank in 2076 to become Treasurer, appointed from outside the House under the Charter's provision that a minister need not sit, the only time it has been used. In the spring of 2080 she won the leadership of the Party of Socialists and Democrats, and then First Spin at the by-election that followed.",
    note:"Liabilities, not buffs. Her record is the thing that can be dug up." },
  { id:"vellan", name:"Suravaram Vidyasagar MP", role:"Minister for Life Support",
    party:"cu", current:"cu_maintenance", category:"biological", seat:"Slipway", relationship:64, office:"minister",
    bio:"Suravaram Vidyasagar came to the House from a career in the maintenance union. As Minister for Life Support, Vidyasagar is the one member of the Cabinet the Guild Bench of engineers will meet.",
    note:"Career maintenance union. Holds the Ministry the whole crisis runs through, and is the "+
         "only member of Cabinet the Guild Bench will take a meeting with." },
  { id:"herrera", name:"Jason Herrera MP", role:"Minister for Labour and Participation",
    party:"psa", category:"emulation", seat:"Kingsmere", relationship:58, office:"minister",
    note:"The coalition partner's price, now in the portfolio the threshold bill is really about." },
  { id:"piastri", pronouns:"he", name:"Kosta Piastri MP", role:"Minister for Education",
    party:"cu", current:"cu_deck", category:"biological", seat:"Kiln End—Cordage", relationship:61,
    bio:"Kosta Piastri, of the Station Left, returned to the Cabinet as Minister for Education. Training leads to licensure, and licensure carries the vote in the functional constituencies, so the ministry decides in time who votes in them.",
    note:"Station Left, and the only minister who was regularly photographed working. Back in at Education, which nobody has yet told him is the licensing question." },
  { id:"lee_kuan_yew", name:"Alexandria Lee Kuan Yew MP", role:"Minister for Volume and Housing",
    party:"cu", current:"cu_loyalists", category:"biological", status:["instance"], seat:"Hollowmere", relationship:52, office:"minister",
    note:"The defining domestic brief, and the one nobody wants." },
  { id:"vasmer", name:"Henrik Vasmer MP", role:"Minister for Transit and Orbital Mechanics",
    party:"psa", category:"emulation", seat:"The Warrens", relationship:47, office:"minister",
    note:"Runs the brief that decides which station is close and which is abandoned." },
  { id:"preiss", name:"Luke Preiss MP", role:"Minister for Attestation and the Registry",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"Registry Walk", relationship:55, office:"minister",
    note:"Appoints the licensing boards. This is the sharpest tool in the game." },
  { id:"marin", pronouns:"she", name:"Florence Marin MP", role:"Minister for Persons, Health and Continuity",
    party:"rv", current:"rv_ministerial", category:"biological", seat:"Concord—Bellfield", relationship:49, office:"minister",
    bio:"Florence Marin holds the Ministry of Persons, Health and Continuity, which was given to the Congregational Democratic Alliance when the coalition formed. The ministry answers for medical care, suspension and personhood, the questions on which the Alliance was founded.",
    note:"Given to the Congregational Democratic Alliance at formation. The portfolio is the party's whole argument, and she has never had to make it in public." },
  { id:"landry", name:"Jean Landry MP", role:"Minister for External Relations",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"Anchor Head—Cable Row", relationship:43, office:"minister",
    note:"The anchors stand on foreign soil, so this is really a domestic brief." },
  { id:"skye", name:"Aster Skye MP", role:"Financial Secretary to the Treasury",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"Deep Deck", relationship:66, office:"minister",
    bio:"Aster Skye served as Adriana Flash's deputy at the Treasury from 2076 to 2080, and was the Treasury's senior minister in the House while Flash, as Treasurer, had no seat in it.",
    note:"Sits apart and reports directly to the Prime Minister. Knows what everything costs." },
  /* Two portfolios held from functional seats: the sector elects the minister
     who regulates it, which is the whole argument about the tier in one line. */
  { id:"ashgrove", name:"Selim Ashgrove MP", role:"Minister for Consumables and Agriculture",
    party:"cu", category:"biological", functional:"fc_consumables", relationship:57, office:"minister",
    note:"Sits for the constituency: deck cooperativists and volume-holders, on one roll." },
  { id:"girard", name:"Vesna Girard MP", role:"Minister for Substrate and Thermal",
    party:"psa", category:"emulation", status:["disembodied"], functional:"fc_substrate", relationship:50, office:"minister",
    bio:"The constituency's electors are the registered substrate providers, and as Minister for Substrate and Thermal, Girard sets the policy that prices their product.",
    note:"Elected by 411 corporate voters to set the policy that prices their own product." },
  { id:"abadi", name:"Nadia Abadi MP", role:"",
    party:"rv", category:"biological", functional:"fc_medicine", relationship:49,
    note:"Backbench. Sits for the medicine roll, and argues the ministry's case from it rather than for it." },
  { id:"okarie", name:"Anil Devi MP", role:"Chief Whip",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"Ropewalk", relationship:71, office:"whip",
    note:"Reports that things went as well as they could have. Reports this about everything." },

  /* ---- the opposition ---- */
  { id:"cutter", name:"Patrick Cutter MP", role:"Shadow Minister for Persons, Health and Continuity",
    party:"cl", current:"cl_abundance", category:"biological", seat:"Space Elevator", relationship:24, office:"shadow",
    note:"Expansionist for commercial reasons: more persons, more contracts, more counterparties." },
  { id:"jeon", name:"Mathieu Jeon MP", role:"Shadow Minister for Life Support",
    party:"cl", current:"cl_abundance", category:"biological", seat:"Charter Green", relationship:18, office:"shadow",
    note:"Would rather be answering for the Ministry than asking about it." },
  { id:"otrione", name:"Paul Otrione MP", role:"",
    party:"cl", current:"cl_abundance", category:"biological", seat:"Assembly Walk", relationship:26,
    note:"Backbench. Market expansionist on substrate, which the government's own partner finds useful." },
  { id:"rkim", name:"Ryan Kim MP", role:"Shadow Minister for Consumables and Agriculture",
    party:"cl", current:"cl_classical", category:"biological", seat:"Allocation Square", relationship:15, office:"shadow",
    note:"Imported consumables are cheaper and this is the shadow portfolio that says so." },
  { id:"wang", name:"Ryan Wang MP", role:"Shadow Minister for Volume and Housing",
    party:"cl", current:"cl_classical", category:"biological", seat:"The Exchange", relationship:30, office:"shadow",
    note:"Elevator money. Believes the volume shortage is a pricing problem, and is not entirely wrong." },
  { id:"caillet", pronouns:"he", name:"Apollo Caillet MP", role:"",
    party:"cl", current:"cl_classical", category:"biological", seat:"Windward—Leeside", relationship:22,
    bio:"Apollo Caillet represents the shipping interests in the House, and his donors are in the transit trade.",
    note:"Backbench. Shipping interests, openly; the transit brief was the one his donors cared about." },
  { id:"caprica", name:"Jonathan Caprica MP", role:"Shadow Minister for Attestation and the Registry",
    party:"cl", current:"cl_social", category:"biological", seat:"Marlowe Green", relationship:27, office:"shadow",
    note:"Wants the boards depoliticised, which is a position with no constituents." },
  { id:"watkins", portrait:"watkins.png", name:"Darren Watkins Jr. MP", role:"Leader of the Opposition",
    party:"cl", current:"cl_classical", category:"biological", seat:"Anselm Proper", relationship:19, office:"opposition",
    note:"Leads the largest party outside the coalition. The government's alternative, and says so." },
  { id:"raj", name:"Chandrama Raj MP", role:"Shadow Minister for External Relations",
    party:"cl", current:"cl_social", category:"biological", seat:"Old Foundation", relationship:21, office:"shadow",
    note:"Accommodationist toward Earth states, and does not pretend otherwise." },
  { id:"ferno", name:"Laura Ferno MP", role:"Shadow Minister for the Treasury",
    party:"cl", current:"cl_classical", category:"biological", seat:"Cable End", relationship:33, office:"shadow",
    note:"Balances the shadow books to the tenth of a point and tells anyone who will listen." },

  /* ---- party leaders ---- */
  { id:"trottier", name:"Mandelina Trottier MP", role:"Deputy Prime Minister; Leader, New Progressive Party",
    party:"psa", category:"emulation", seat:"Substrate Quarter", relationship:54, office:"deputy",
    bio:"Trottier leads the junior partner in the coalition. The New Progressive Party shares the government's economics and opposes its position on personhood.",
    note:"The junior coalition partner's leader. Shares the government's economics and despises its personhood line." },
  { id:"laughon", pronouns:"he", name:"Nick Laughon MP", role:"Leader, Home Rule",
    party:"sc", category:"biological", seat:"Bondsville Centre", relationship:38, office:"leader",
    bio:"Home Rule does not whip its members, so as its leader he cannot direct their votes.",
    note:"Speaks for the stations that want to be left alone, and cannot whip his own members." },
  { id:"wilde_hayward", name:"Ronan Wilde-Hayward MP", role:"Leader, Association of Engineers and Systems",
    party:"hul", category:"biological", seat:"The Array", relationship:29, office:"leader",
    note:"Habitat as lifeboat. Engineering authority supreme, and says so in that order." },
  { id:"park", name:"Ryan Jung-Hee Park MP", role:"Leader, Congregational Democratic Alliance",
    party:"rv", current:"rv_congregation", category:"biological", seat:"Quorum", relationship:41, office:"leader",
    note:"Continuity of soul. Economically left, culturally immovable." },
  { id:"bluespan", name:"Alan Bluespan III MP", role:"Leader, Freehold Party",
    party:"fh", current:"fh_title", category:"biological", seat:"Drybank", relationship:20, office:"leader",
    note:"Volume owners, property absolutists, anti-Georgist to the point of obsession." },
  { id:"hatt", pronouns:"he", name:"Edward Hatt MP", role:"Leader, Alliance of Business and Government",
    party:"gb", category:"emulation", status:["disembodied"], functional:"fc_attestation", relationship:45, office:"leader",
    bio:"Edward Hatt sits in the functional tier for the Alliance of Business and Government. He does not campaign, and no district elects him.",
    note:"Elected by the functional franchises. Does not campaign, and no district can vote him out." },
  { id:"edelstein_powell", name:"Rachel Edelstein-Powell MP", role:"Leader, One-G",
    party:"des", category:"biological", seat:"Brightwell", relationship:32, office:"leader",
    note:"Gravity as birthright, orbital life as temporary exile, and the rhetoric to match." },
  { id:"wheeler", name:"Marion Wheeler MP", role:"Leader, Single Tax Party",
    party:"geo", category:"emulation", status:["instance"], relationship:57, office:"leader",
    note:"Volume tax, land value tax, nothing else. List tier only." },
  { id:"lindegaard", name:"Aalborg Lindegaard MP", role:"Leader, Uplift Alliance",
    party:"upl", current:"upl_bridge", category:"uplift", relationship:50, office:"leader",
    note:"Two seats, permanently kingmaker-adjacent. Price is always the same thing." },

  /* ---- the expanded front benches ---- */
  { id:"dulac", pronouns:"he", name:"Ferran Dulac MP", role:"Minister for Defence",
    party:"cu", current:"cu_maintenance", category:"biological", seat:"The Beds", relationship:53,
    bio:"Ferran Dulac is the senior member of the Trades Left in the Cabinet, brought back into it as Minister for Defence. The Commonwealth keeps no fleet and no army, so the ministry's work is the tethers, the traffic and the launch windows.",
    note:"The Trades Left's man, and no longer the minister who owns the bill. Defence commands nothing that shoots, which is understood by everyone including him." },
  { id:"ivarsen", name:"Marit Ivarsen MP", role:"Minister for Trade and the Anchors",
    party:"psa", category:"emulation", seat:"Amphitheatre", relationship:50, office:"minister",
    note:"Owns the trade balance, compute exports and the anchor concessions on foreign soil." },
  { id:"fenwick", name:"Adaeze Fenwick MP", role:"Minister for Law and the Charter",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"Crowfield", relationship:58, office:"minister",
    note:"The Law Officer in cabinet. Referral, constitutional review, and the amendment nobody will open." },
  { id:"whitlam", pronouns:"he", name:"Imre Whitlam MP", role:"Leader of the House",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"Spinward Reach", relationship:56, office:"minister",
    bio:"As Leader of the House he allocates the government's order-paper time, and so decides which bills are debated and when.",
    note:"Owns the order paper. The slots are his to give away, which makes him everyone's friend and nobody's." },
  { id:"brakk", pronouns:"she", name:"Sunniva Brakk MP", role:"Minister for Home Affairs and Contingencies",
    party:"cu", current:"cu_loyalists", category:"biological", seat:"Ambrose Fields", relationship:48, office:"minister",
    bio:"Her ministry answers for policing, public order and the emergency power. An emergency takes one order to declare and a contest in the House to end, and the ministry is where that contest is fought.",
    note:"The civilian answer to the engineering authority. Declaration is easy; termination is the fight, and it is hers." },
  { id:"sorrel", name:"Kel Sorrel MP", role:"Shadow Minister for Labour and Participation",
    party:"cl", current:"cl_classical", category:"biological", seat:"Rookworks East", relationship:23, office:"shadow",
    note:"Would rather the threshold were a contract than a right, and says so." },
  { id:"nadeau", name:"Vesna Nadeau MP", role:"",
    party:"cl", current:"cl_classical", category:"biological", status:["unattested"], seat:"Halvard Centre", relationship:25,
    note:"Backbench. Wants the anchors opened to consortium capital and the trade index treated as a scoreboard." },
  { id:"mbeki", name:"Yusuf Mbeki MP", role:"Shadow Minister for Closure and Development",
    party:"cl", current:"cl_classical", category:"biological", seat:"The Bourse", relationship:19, office:"shadow",
    note:"Thinks closure targets are a subsidy by another name, and is not entirely wrong." },
  { id:"kaunda", pronouns:"she", name:"Ilse Kaunda MP", role:"Shadow Minister for Law and the Charter",
    party:"cl", current:"cl_social", category:"biological", seat:"Exchange Alley—Threadmarket", relationship:28, office:"shadow",
    bio:"Ilse Kaunda is a lawyer, and her case in the House usually turns on what the Charter leaves unsaid.",
    note:"A lawyer's lawyer. The Charter's holes are, to her, the point." },
  { id:"ferreira", name:"Petra Ferreira MP", role:"Shadow Minister for Contingencies",
    party:"cl", current:"cl_abundance", category:"biological", seat:"Layover Centre", relationship:24, office:"shadow",
    note:"Wants the emergency framework codified, which everyone agrees with and nobody will vote for." },

  /* Shadow portfolios held from functional seats, mirroring the government's
     own functional ministers: the sector elects the shadow who scrutinises it,
     as it elects the minister who regulates it. */
  { id:"quintana", name:"Petra Quintana MP", role:"Shadow Minister for Substrate and Thermal",
    party:"cl", category:"emulation", functional:"fc_substrate", relationship:27, office:"shadow",
    bio:"The constituency's electors are the substrate hosting providers, and Quintana shadows the minister whose policy prices them.",
    note:"Elected by the hosting providers to scrutinise the minister they price." },
  { id:"ijaz", name:"Anouk Ijaz MP", role:"Shadow Minister for Transit and Orbital Mechanics",
    party:"cl", category:"biological", functional:"fc_transit", relationship:24, office:"shadow",
    bio:"Anouk Ijaz is a certified transfer pilot, and the one member of the Liberal front bench who holds the professional licence of the brief they shadow.",
    note:"A certified transfer pilot, and the only shadow brief with a licence behind it." },
  { id:"estevez", name:"Lorcan Estévez MP", role:"Shadow Minister for Trade and the Anchors",
    party:"cl", category:"biological", functional:"fc_elevator", relationship:23, office:"shadow",
    bio:"Lorcan Estévez holds a lease on one of the anchors, and speaks in the House for the lessees who want the anchor concessions opened to them.",
    note:"Anchor lessee. Wants the concessions opened, and speaks for the balance sheet that owns them." },

  /* ---- the chair of the House ---- */
  { id:"king", name:"Adam King MP", role:"",
    party:"ind", current:"ind_kettering", category:"biological", seat:"Colonnade", relationship:40,
    note:"Backbench. Independent since the presidency, and does not regret it." },

  /* ---- other seated members ---- */
  { id:"clarke", name:"Benj Clarke MP", role:"Shadow Minister for Business of the House",
    party:"cl", current:"cl_classical", category:"biological", seat:"Meridian Loop", relationship:35, office:"shadow",
    note:"Watches the order paper for the opposition. Market liberal, which here means elevator and loop money." },
  { id:"tomasson", name:"Haukur Tómasson MP", role:"Minister for Closure and Development",
    party:"rv", current:"rv_congregation", category:"biological", seat:"Brant North", relationship:47, office:"minister",
    note:"Owns the closure floor and the low band. Continuity of soul, and votes it every time." },

  /* ---- the presidency ---- */
  { id:"tenaya", descriptor:"the President of the Commonwealth", portrait:"tenaya.png",   name:"President Jaco van Ryneveld", role:"President",
    party:"cl", current:"cl_classical", category:"biological", relationship:22,
    bio:"Jaco van Ryneveld was elected President in 2077 on a Liberal ticket, with 51.4% of the direct vote. The presidency holds the reserve powers of the Charter: dissolution, the formation of governments, referral of bills for constitutional review, and appointments. Relations with the government are cold.",
    note:"Elected 2077, 51.4% on a Liberal ticket. Biologically augmented: cat ears. "+
         "Reserve powers: dissolution, formation, referral, appointments." },

  /* ---- the faction leader ---- */
  { id:"halloran", pronouns:"he", portrait:"halloran.png", name:"Dan Czarnecki MP", role:"Leader, Hard Left",
    party:"cu", current:"cu_halloran", category:"biological", seat:"Tier Four", relationship:12,
    bio:"Dan Czarnecki leads the Hard Left of the Party of Socialists and Democrats, which the press calls the Czarnecki group. He is collecting the signatures of members who want a ballot on the party's leadership, and a ballot is forced when enough have signed.",
    note:"Short of the twelve names that force a leadership ballot, and looking." },

  /* ---- the former Prime Minister (the author, 29 Sep 2026: "a Corbyn
     type"; bible §11.1 and design/60). He led the PSD into government in
     2076 and was replaced by his own Treasurer in the spring of 2080. A
     member of the party, so he is on the leadership paper, and the first
     name a deposed leader's current would put there. ---- */
  { id:"vijlbrief", pronouns:"he", name:"Nils Vijlbrief MP", role:"Former Prime Minister; PSD backbencher",
    party:"cu", current:"cu_halloran", category:"biological", seat:"Hardie Centre", relationship:15, grievance:true,
    bio:"Nils Vijlbrief led the Party of Socialists and Democrats into government in 2076, in coalition with the New Progressive Party and the Congregational Democratic Alliance, and was Prime Minister until the spring of 2080. He brought Adriana Flash from the Reserve Bank to the Treasury. When he wanted the stations' upkeep paid for from an overdraft at the Reserve Bank, she refused him in public, and the markets sided with her. With an election due, the party's members of Parliament replaced him with her. He sits on the back benches for Hardie Centre, with the Hard Left.",
    note:"Prime Minister from 2076 to 2080, replaced by his own Treasurer. Sits with the Hard Left." },

  /* ---- the panel chair ---- */
  { id:"gb_chair", portrait:"gb_chair.png", name:"Kazuya Tanako MP", role:"Chair, Life Support panel",
    party:"gb", category:"emulation", status:["disembodied"], functional:"fc_lifesupport", relationship:18,
    bio:"Kazuya Tanako chairs the Life Support panel of the functional tier. The position the panel takes on life-support legislation has not changed since 2072.",
    note:"Functional tier. Position unchanged since 2072. The whips do not believe money will move them." },

  /* ---- non-parliamentary voices ---- */
  { id:"ceyhan", pronouns:"he", descriptor:"the political editor of The Spindle, the Commonwealth's newspaper of record", portrait:"ceyhan.png",   name:"Ivor Ceyhan", role:"Political editor, The Spindle",
    party:null, category:"synthetic", relationship:44,
    note:"Will print what he is given and what he is not." },
  { id:"ansar", descriptor:"the elected chair of the Deck 9 residents' association on Homestead", portrait:"ansar.png",    name:"Sevi Ansar", role:"Chair, Deck 9 Residents' Association",
    party:null, category:"uplift", relationship:55,
    note:"Elected by the residents of Deck 9 on Homestead to speak for them to the station and the government. Recast from an ordinary resident on 28 Sep 2026: the author's rule is that a Prime Minister deals with representatives, not with private residents (bible §2.7)." },

  /* ---- the Almanac Works' representatives (NEW CANON, 28 Sep 2026) ----
     A DELIBERATE ADDITION TO THE ROSTER (§2.7) for Flash I, on the author's
     rule that a station's recurring voices are an assortment of people who
     differ from one another. Once the Works is the government's question,
     these are the three people it deals with aboard: the elected council
     that organised the vote, the union that runs the furnaces, and the
     doctor who decides who can go down to Earth. They want different
     things. The author's to rename or recast. */
  { id:"odera", pronouns:"she", since:{ flags:["station_issue"] }, descriptor:"the chair of the Almanac Works' council of delegates", name:"Achieng Odera", role:"Chair, Council of Delegates, Almanac Works",
    party:null, category:"biological", relationship:50,
    bio:"Achieng Odera drove an overhead crane in the rolling mill of the Bellamy Almanac Works, the orbital refinery, for eleven years. The workforce elected her chair of its council of delegates in 2078. She was born in Kisumu, on Lake Victoria, and went up Tether 2, the space elevator from the Kenyan coast, at twenty-six. She organised the vote to ask to join the Commonwealth.",
    note:"Chair of the council the Works' charter gave the workforce for bargaining with Cordell. With the company gone it is the only elected body aboard, and she speaks for it to the government. She wants the residents counted somewhere, and she will take the Commonwealth's terms to get it." },
  { id:"obame", pronouns:"he", since:{ flags:["station_issue"] }, descriptor:"the steward of the furnace crews' union on the Almanac Works", name:"Marcel Obame", role:"Steward, Furnace Crews' Union, Almanac Works",
    party:null, category:"biological", relationship:40,
    bio:"Marcel Obame is the elected steward of the furnace crews' union on the Bellamy Almanac Works, the orbital refinery. He was born in Libreville and joined Cordell, the Gabonese mining company that owned the Works, at nineteen. He has run a furnace shift on the Works for nine years.",
    note:"His members smelt the ore and want the furnaces kept lit and the wages paid. A furnace is heat, and heat is what the Commonwealth rations, so he trusts an annexation less than Odera does. He is Gabonese, and the sovereign fund that ordered Cordell to abandon his members belongs to his own government." },
  { id:"dizon", pronouns:"she", since:{ flags:["station_issue"] }, descriptor:"the chief medical officer of the Almanac Works", name:"Maricel Dizon", role:"Chief Medical Officer, Almanac Works",
    party:null, category:"biological", relationship:50,
    bio:"Maricel Dizon is the chief medical officer of the Bellamy Almanac Works, the orbital refinery, and runs its hospital of 420 beds. She trained in Manila and came to the Works from a hospital ship. She keeps the register of which residents could survive Earth's gravity and which could not.",
    note:"She answers to no party and to no creditor. She reports the air and the bones in numbers, and she has told every government that asked that some of the children born aboard could never go down." },

  /* ---- the Reserve Bank (design/39 option C, 25 Sep 2026) ----
     A DELIBERATE ADDITION TO THE ROSTER (§2.7), the one person the dollar
     needs: somebody the Treasurer writes the remit to and the government
     cannot instruct without an order of the House. Flash's deputy at the
     Bank, and Governor since Flash left it for the premiership. The
     author's to rename or recast. */
  { id:"castellane", pronouns:"she", descriptor:"the Governor of the [[reserve_bank|Reserve Bank]]", name:"Maren Castellane", role:"Governor, Reserve Bank",
    party:null, category:"biological", relationship:52,
    bio:"Maren Castellane was deputy to Adriana Flash at the [[reserve_bank|Reserve Bank]] from its founding in 2071, and has been Governor since 2076, when Flash left the Bank for the Treasury. She sets the cash rate at a meeting every 42 days and publishes the Bank's rule beside every decision. Her means of answering the government is the open letter.",
    note:"Flash's deputy at the Bank from its founding, and Governor since Flash left for the Treasury in 2076. She knows the Prime Minister " +
         "understands the Bank better than she does, and she will not be told. Her tool is " +
         "the open letter, and the rule she publishes beside every decision." }
];
