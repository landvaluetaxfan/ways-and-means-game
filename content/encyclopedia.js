/* =============================================================
   THE CONCORDANCE — in-world encyclopedia.

   ARCHITECTURE: this is a VIEW over content that already exists.
   Parties, stations, characters, bills and glossary terms all get
   articles generated from their own data — seat counts, closure
   ratios and division forecasts come live from state, so the
   encyclopedia is never out of date and never contradicts canon.

   You only write an entry here when you want prose the data cannot
   produce: history, controversy, the argument about the thing.

   REGISTER: Wikipedia. A lead that defines the subject in its first
   sentence, sentence-case headings, neutral third person, no address
   to the reader. The bias lives in the BANNERS and the edit record,
   never in the sentences. Bible 9.4: ideologies are refracted, not
   presented; the maintenance banner is the refraction. See
   CONTENT_GUIDE.md, "The register".
   ============================================================= */

const ENCYCLOPEDIA = {

  meta: {
    title: "Concordance",
    tagline: "the attested encyclopedia",
    notice: "Editing is restricted to attested accounts. Attestation is administered " +
            "by the Registry, whose independence is the subject of ongoing litigation."
  },

  /* Banner types. Keep this list short — each one is a piece of characterisation. */
  banners: {
    neutrality:  { cls:"warn", text:"The neutrality of this article is disputed. See the talk record." },
    single:      { cls:"warn", text:"This article relies largely on a single source." },
    protected:   { cls:"lock", text:"Editing is restricted to attested accounts of standing." },
    stub:        { cls:"note", text:"This article is a stub. You can help by expanding it, if you are attested." },
    contested:   { cls:"warn", text:"This article documents an active political dispute and may change rapidly." },
    cleanup:     { cls:"note", text:"This article may require cleanup to meet the Concordance's standards." },
    orphan:      { cls:"note", text:"Few other articles link here." }
  },

  /* Hand-written articles. Anything not listed is generated from data. */
  articles: [

  { id:"biological_majority", title:"Biological population", category:"Personhood",
    banners:["neutrality"],
    edited:{ by:"multiple", attested:true, note:"the uploading section has been reverted eleven times this session" },
    summary:"The **biological population** is the largest of the four legal categories of person in "+
      "the [[commonwealth|Commonwealth]]. A biological person is single-instanced, embodied, runs at "+
      "standard rate and dies. They are 64 per cent of adults.",
    sections:[
      { h:"Distribution", body:
        "The recorded distribution is 64 per cent biological, 28 per cent emulated, 4 per cent "+
        "uplift and 4 per cent synthetic. The figures vary by band: Homestead is 81 per cent "+
        "biological and Sanctuary 51 per cent emulated.\n\n"+
        "The variation follows the two scarcities. Volume is positional and dearest where demand "+
        "is greatest. Thermal rejection is geometric and cheapest far from Earth's infrared "+
        "glare. Whichever of the two binds at a station sets its composition." },
      { h:"Labour", body:
        "About 46 per cent of jobs need an embodied worker, and biological persons hold nearly "+
        "all of them. The working population is therefore mostly biological, and the non-working "+
        "population mostly emulated.\n\n"+
        "A body is a qualification, not a mark of status. Embodied work runs from the anchor "+
        "crews, the best-paid employment in the Commonwealth, to integrity engineering, which is "+
        "licensed and unionised and can withdraw its labour." },
      { h:"Exposure", body:
        "What orders the population is whether a person can be switched off. A biological person "+
        "on the consumables floor is poor. An emulated resident on the same floor is poor and is "+
        "on the shed order register. Their incomes may be identical; their exposure is not "+
        "comparable.\n\n"+
        "Wealth at the moment of uploading sets substrate tier, and tier decides whether a "+
        "person accumulates for a century or is shed at the next shortfall. There is no single "+
        "emulated interest." },
      { h:"Mortality and the franchise", body:
        "Biological persons die; emulated ones do not. Biological political generations turn "+
        "over at the customary rate. Emulated ones do not turn over at all. A biological voter "+
        "of thirty is outvoted by an electorate that will still be voting in ninety years, and "+
        "that has voted for the settlement which serves it.\n\n"+
        "No remedy has survived a first reading. Any remedy that disenfranchises the "+
        "long-lived is forbidden by the Charter." },
      { h:"Descent", body:
        "Bone density constrains only the biological. An emulation with enough money can rent "+
        "a body certified for one gravity and descend, because the body is equipment. An "+
        "orbital-born biological cannot descend at any price. The class defined by bone density "+
        "is a biological class." },
      { h:"Uploading under economic pressure", body:
        "Emulation is cheaper on volume and dearer on thermal. A household driven to upload is "+
        "therefore one that cannot meet its *volume* rent, which puts it in the ring or middle "+
        "band rather than the low band. Uploading is not a way to escape a rent that is already "+
        "cheap.\n\n"+
        "It removes access to about 46 per cent of paid work, and returning to that work costs "+
        "more in body rent than the rent being escaped. It also puts a person who could not "+
        "previously be switched off onto a register where they can be.\n\n"+
        "The Census Bureau does not publish a figure for economically motivated uploading, and "+
        "has declined three requests to compile one." }
    ],
    see:["substrate","suspension","commonwealth"] },

  { id:"commonwealth", title:"Circumterrestrial Commonwealth", category:"Institutions",
    banners:["contested"],
    infobox:{ title:"Circumterrestrial Commonwealth", flag:"flag.png", rows:[
      ["Composition","Thirty stations, four altitude bands, five external constituencies"],
      ["Largest station","Anselm Ring"],
      ["Government","Parliamentary republic under the [[perigee_charter|Perigee Charter]]"],
      ["Legislature","[[parliament|Parliament]]"],
      ["Head of government","[[prime_minister|Prime Minister]]"]
    ]},
    edited:{ by:"multiple", attested:true, note:"the demonym section is reverted about weekly" },
    /* A SECTION MAY WAIT FOR THE WORLD.

       `when` takes the same condition vocabulary events are gated on and is
       evaluated by the same `Engine.matches`, so an article can gain a
       paragraph when the thing it describes actually happens instead of
       being frozen text written before the campaign began. This is the
       worked example: the Commonwealth's article says nothing about the
       Almanac Works until the House annexes it, and then it says it the way
       an encyclopedia would -- as a change to the composition of the state,
       in the section about composition.

       Author it on any hand-written article. A section with no `when` is
       drawn always, which is every section that existed before this. */
    summary:"The **Circumterrestrial Commonwealth** is a federated parliamentary republic. It "+
      "comprises the inhabited stations of Earth orbit, the Selene settlements and the Lagrange "+
      "yards. It was founded under the [[perigee_charter|Perigee Charter]] and is governed by "+
      "[[parliament|Parliament]] and a [[cabinet|Cabinet]] under a [[prime_minister|Prime Minister]].",
    sections:[
      { h:"Name", body:
        "*Circumterrestrial* is the Charter's term and appears on every instrument of state. It "+
        "is not used in speech. The country is called the Commonwealth, the government is called "+
        "Perigee, and a person is said to be from their station.\n\n"+
        "The far-band delegations objected at the founding that the word described a geometry "+
        "rather than a country. That was the objection, and it is also why the word was adopted." },
      { h:"The demonym", body:
        "**Commonwealther** is the most-used demonym for a citizen of the Commonwealth, and the "+
        "one the papers and the House use. *Circumterrestrials* is the Charter-era form: it "+
        "appears in four founding documents and is not used in speech. Several alternatives have "+
        "been proposed and have failed.\n\n"+
        "The word caught on slowly, because the union is held together by shared metabolism "+
        "rather than shared identity. Asked what they are, many residents still name a station "+
        "first, and add Commonwealther second, as though the two answered different questions." },
      { h:"Composition", body:
        "The Commonwealth has thirty stations across four altitude bands, and five external "+
        "constituencies. Anselm Ring holds more residents than the seven smallest stations "+
        "combined. The apportionment formula corrects this only partly." },
      /* Drawn only once the House has carried the annexation. Before that
         the article does not mention the Works at all, because before that
         the Works is not part of the Commonwealth. */
      { h:"Accession of the Almanac Works", when:{ flags:["almanac_annexed"] }, body:
        "The Bellamy Almanac Works, Brant & Vane was brought within the Commonwealth by Act, "+
        "its private charter surrendered and its 184,000 residents admitted as Commonwealth "+
        "persons. It is the first accession since the founding and the first addition to the "+
        "roll that was not a station built inside it.\n\n"+
        "The Works enters the [[functional_constituency|apportionment]] at the next "+
        "redistribution, which is the part the chamber argued about: a works station of that "+
        "size is worth seats, and the seats have to come from somewhere." },
      { h:"What holds it together", body:
        "Neither force, nor consent, nor identity. A station's closure ratio is the fraction of "+
        "its material cycle it can sustain without imports, and most stations are below the "+
        "level at which leaving is survivable.\n\n"+
        "This produces a recurring constitutional argument. Federal development spending raises "+
        "a station's closure ratio, and a higher closure ratio raises its capacity to secede. "+
        "Every appropriation can therefore be called a subsidy toward the dissolution of the "+
        "body making it. The Chartists treat this as the central fact of Commonwealth politics." }
    ],
    see:["perigee_charter","parliament","prime_minister","cabinet"] },

  { id:"parliament", title:"Parliament", category:"Institutions",
    banners:[],
    edited:{ by:"Concordance institutions group", attested:true, note:"seat figures from Bureau returns" },
    summary:"**Parliament** is the legislature of the Commonwealth. It comprises the elected "+
      "House of Delegates, whose members are styled MP.",
    sections:[
      { h:"The House of Delegates", body:
        "The House has 280 seats, elected by three methods that operate independently: 140 from "+
        "geographic districts, 100 from national party lists, and 40 from "+
        "[[functional_constituency|functional constituencies]] representing professions and "+
        "industries. A majority is 141." },
      { h:"The dual test", body:
        "Measures affecting life-support integrity, and amendments to the "+
        "[[perigee_charter|Charter]], must carry separately among functional and elected "+
        "members. A government may hold a working majority of the House and still be unable to "+
        "legislate. See [[dual_majority]]." },
      { h:"Time", body:
        "A session has a fixed number of order-paper slots. The Prime Minister decides who "+
        "gets them. In practice, they are traded for coalition support." }
    ],
    see:["dual_majority","functional_constituency","prime_minister","cabinet"] },

  { id:"prime_minister", title:"Prime Minister", category:"Institutions",
    banners:[],
    edited:{ by:"multiple", attested:true, note:"" },
    summary:"The **Prime Minister** is the head of government of the Commonwealth. The office is "+
      "not elected. It is held by whoever can command a majority in the "+
      "[[parliament|House of Delegates]].",
    sections:[
      { h:"Tenure", body:
        "There is no fixed term. A Prime Minister stays in office until losing a confidence "+
        "division, losing the leadership of their own party, losing a general election, or "+
        "resigning. The first two need no election and can happen within a day." },
      { h:"Powers", body:
        "The Prime Minister nominates ministers, chairs [[cabinet|Cabinet]], controls the order "+
        "paper, and can request a dissolution, which the [[person_tenaya|President]] can "+
        "refuse. Control of the order paper matters most in practice, because a session has a "+
        "fixed number of slots." },
      { h:"Style", body:
        "The office is styled *the Right Honourable*, and is *Prime Minister* on every "+
        "instrument of appointment. The honorific is spoken in the House; the office does the "+
        "work in writing." }
    ],
    see:["cabinet","parliament","person_tenaya"] },

  { id:"cabinet", title:"Cabinet of the Commonwealth", category:"Institutions",
    banners:[],
    edited:{ by:"Concordance institutions group", attested:true, note:"revised each formation" },
    summary:"The **Cabinet of the Commonwealth** is the collective executive. It is chaired by the "+
      "[[prime_minister|Prime Minister]] and made up of the ministers who head each ministry. "+
      "Its members sit in [[parliament|Parliament]] and answer to it.",
    sections:[
      { h:"The ministries", body:
        "The Cabinet is made up of the ministers for Life Support, Substrate and Thermal, "+
        "Consumables and Agriculture, Volume and Housing, Transit and Orbital Mechanics, "+
        "Attestation and the Registry, Persons, Health and Continuity, Defence, Education, "+
        "Labour and Participation, Trade "+
        "and the Anchors, Closure and Development, Law and the Charter, Business of the House, "+
        "Home Affairs and Contingencies, and External Relations. The Treasury sits apart and "+
        "reports directly to the Prime Minister.\n\n"+
        "Life Support is the senior post. It is the only ministry whose minister can be "+
        "summoned by the engineering authority. In every other brief, the minister does the "+
        "summoning. This comes from the Allocation Act and has not been amended." },
      { h:"Appointment", body:
        "Ministers are appointed by the [[person_tenaya|President]] on the nomination of the "+
        "Prime Minister. The President can decline a nomination. The power is used rarely." },
      { h:"Collective responsibility", body:
        "A minister who cannot support a decision is expected to resign before opposing it. In "+
        "practice the convention is observed by absence more often than by resignation. Two "+
        "Congregational Democratic Alliance ministers were absent from the threshold division rather than vote "+
        "against the leadership." },
      { h:"The Treasury", body:
        "The Treasury sits apart from the ministries and reports directly to the Prime Minister. "+
        "It answers for the appropriation, and a post left vacant is a budget argued by "+
        "officials and signed by nobody." }
    ],
    see:["prime_minister","parliament","perigee_charter","person_tenaya"] },

  { id:"perigee_charter", title:"The Perigee Charter", category:"Institutions",
    banners:["protected"],
    edited:{ by:"Registry Archivist", attested:true, note:"protected since 2074" },
    summary:"The **Perigee Charter** is the founding document of the "+
            "[[commonwealth|Circumterrestrial Commonwealth]]. It was adopted at the end of the "+
            "independence congress. It is short, and deliberately silent on several contested "+
            "questions.",
    sections:[
      { h:"Drafting", body:
        "The congress sat for eleven weeks and produced a text no single delegation would "+
        "have written. Where agreement was impossible, the drafters used language that could "+
        "be read more than one way. Contemporary accounts call this a failure of nerve. Later "+
        "constitutional scholarship generally calls it the reason the union survived its first "+
        "decade." },
      { h:"The silences", body:
        "The Charter says who can declare an emergency, but not who can end one. It does not "+
        "define the relation between a person and an instance of that person. It does not say "+
        "whether the functional tier is permanent, and the sunset clause has been extended "+
        "four times without a vote on the principle. Each of these is now the subject of "+
        "litigation." },
      { h:"Amendment", body:
        "An amendment needs a dual majority: separate majorities among elected and functional "+
        "members. No amendment has passed since 2072." }
    ],
    see:["functional_constituency","dual_majority","the_permanent_emergency"] },

  { id:"the_permanent_emergency", title:"The permanent emergency", category:"Constitutional theory",
    banners:["neutrality","contested"],
    edited:{ by:"multiple", attested:true, note:"142 revisions this session" },
    summary:"The **permanent emergency** is the constitutional question of whether a habitat's "+
            "capacity to kill its population through administrative failure justifies an "+
            "authority whose decisions on integrity are final.",
    sections:[
      { h:"Argument for", body:
        "Proponents argue that a committee cannot be convened in the ninety seconds available "+
        "when a seal fails. On this view an engineering authority with final judgment is a "+
        "precondition for ordinary politics, not a suspension of it, and demands for civilian "+
        "oversight come from those who have not experienced a loss of pressure." },
      { h:"Argument against", body:
        "Critics argue that emergency authorities always find emergencies. They cite the "+
        "Allocation Act, which allows a tier-four register to be shed without notice to a "+
        "minister, and which has been used in circumstances that were not immediate crises. "+
        "Declaration is straightforward; ending an emergency is contested." },
      { h:"Status", body:
        "Unresolved. Both major parties have governed without settling it. Both have found the "+
        "ambiguity convenient in office and difficult in opposition." }
    ],
    see:["engineering_authority","shed_order","hul"] },

  { id:"the_failed_revolution", title:"The events of 2063", category:"History",
    banners:["stub","neutrality","single"],
    edited:{ by:"unattributed", attested:false, note:"reverted 9 times this session" },
    summary:"The **events of 2063** were a rising against the provisional administration. It was "+
            "suppressed within five weeks. Accounts of its causes, extent and casualties differ "+
            "substantially.",
    sections:[
      { h:"", body:
        "This article has been the subject of sustained edit conflict. The Registry has " +
        "declined to protect it, on the grounds that no attested account has requested " +
        "protection.\n\n" +
        "It is not disputed that the rising failed, that several of its surviving participants " +
        "hold public office, and that the alignments of the present parties follow from the " +
        "positions their founders took that year." }
    ],
    see:["perigee_charter"] },

  { id:"functional_constituency", title:"Functional constituency", category:"Elections",
    banners:["contested"],
    edited:{ by:"Apportionment Reform Society", attested:true, note:"" },
    summary:"A **functional constituency** is a seat in the House of Delegates elected by a "+
            "profession or industry, not by a place. Forty of the 280 seats are functional.",
    sections:[
      { h:"Origin", body:
        "The functional tier comes from the founding compromise. The Charter's authors needed "+
        "the engineering guilds and the consortiums to accept civilian rule, and permanent "+
        "representation was the price. The arrangement was called transitional and has been "+
        "extended four times." },
      { h:"Franchise", body:
        "A functional seat's electorate is defined by professional licensure, and the "+
        "licensing boards are appointed by the government of the day. A government can "+
        "therefore change who votes in a functional constituency by regulation, without "+
        "legislation or a division." },
      { h:"Size", body:
        "Functional electorates range from 62 voters to 214,000, against district electorates "+
        "averaging under thirty thousand." },
      { h:"The residual constituency", body:
        "People in no recognised sector, including the unemployed, the dependent and the "+
        "suspended, vote in a single residual functional constituency. It is the largest "+
        "electorate in the Commonwealth and returns one member." },
      { h:"Abolition", body:
        "Abolition requires a Charter amendment, which requires a dual majority, which "+
        "requires the functional tier to vote for its own abolition. The Party of Socialists "+
        "and Democrats has committed to abolition at four consecutive elections." }
    ],
    see:["dual_majority","licensure","gb","perigee_charter"] },

  { id:"dual_majority", title:"Dual majority", category:"Elections",
    edited:{ by:"Chartist Study Group", attested:true, note:"" },
    summary:"A **dual majority** is the requirement that certain measures carry separately "+
            "among functional and elected members of the House of Delegates.",
    sections:[
      { h:"Scope", body:
        "The requirement applies to Charter amendments and to bills affecting life-support "+
        "integrity. It does not apply to ordinary legislation, appropriation, or instruments "+
        "made under existing statutory powers." },
      { h:"Effect", body:
        "A government with a comfortable majority among elected members can still be unable "+
        "to legislate in the field it was elected to reform. The present coalition holds "+
        "twelve of forty functional seats and needs twenty-one." }
    ],
    see:["functional_constituency","divergence_threshold"] },

  { id:"suspension", title:"Suspension", category:"Personhood",
    banners:["contested"],
    edited:{ by:"multiple", attested:true, note:"" },
    summary:"**Suspension** is the condition of a mind held intact and not running. It is not "+
      "death, and in law it does not interrupt legal personality.",
    sections:[
      { h:"Routes", body:
        "Suspension has four routes. Voluntary: a person elects to wait out a debt, a body "+
        "shortage or a course of treatment. Penal: a sentence is served as absence. Default: a "+
        "person can no longer meet substrate costs. Triage: a shortfall has occurred and the "+
        "shed order has selected them." },
      { h:"Restoration", body:
        "A suspended person cannot petition for their own restoration. Another party has to "+
        "meet the cost. Whether obligations accrue during suspension decides whether default "+
        "suspension is temporary or permanent. Under present law, they do accrue." },
      { h:"Apportionment", body:
        "Suspended persons are counted for the apportionment of seats and cannot vote. A "+
        "station with a large suspended population therefore returns members elected by a "+
        "small active electorate. Homestead has 11,400 suspended residents against a "+
        "population of 880,000." }
    ],
    see:["shed_order","substrate","ashfield"] },

  { id:"licensure", title:"Licensure", category:"Personhood",
    banners:["cleanup"],
    edited:{ by:"unattributed", attested:true, note:"" },
    summary:"**Licensure** is professional certification. It decides both the right to practise "+
      "and, in a functional constituency, the right to vote.",
    sections:[
      { h:"Boards", body:
        "Licensing boards are appointed by the responsible minister. Their composition is not "+
        "subject to a division and their determinations are not ordinarily reviewable." },
      { h:"Category restrictions", body:
        "Several boards restrict licensure by legal category. Where they do, a person can "+
        "lawfully do the work and lawfully be excluded from the constituency that represents "+
        "it. The Registry does not treat this as a franchise question." }
    ],
    see:["functional_constituency","gb"] },

  { id:"quota_forwarding", title:"Quota trading and forwarding", category:"Economy",
    banners:["neutrality"],
    edited:{ by:"multiple", attested:true, note:"the fraud section is the most edited on the Concordance" },
    summary:"**Quota trading** is the market in the MW-year rejected, the unit in which the "+"Commonwealth keeps its accounts. The quota is the money: the state issues it, the "+"appropriation divides it, and a claim on radiator capacity is a claim on room for "+"someone to be alive.",
    sections:[
      { h:"The unit", body:
        "Rejection capacity is the limiting resource of the orbital economy. Energy is "+"trivial to gather and hard to discard, so the right to dump waste heat binds "+"before any other. The Commonwealth therefore keeps its accounts in the MW-year "+"rejected and names no coin.\n\n"+
        "The consequence is that the franchise and the budget are one question. To "+"hold quota is to hold a claim on how many minds a station may run." },
      { h:"Forwarding", body:
        "A **[[quota_forward|quota forward]]** fixes a price now for capacity delivered at a "+"named sitting. The seller takes the money today and hands over the margin later. "+"Into a tight release the sale is a hedge; into a loose one it is a hole, and the "+"consortiums price the difference because they hold the only complete numbers." },
      { h:"Fraud", body:
        "The market has been traded, hedged, forwarded and defrauded since the Charter, "+"and the Commonwealth has legislated against the fourth of those four times. The "+"offence is not the sale of capacity that does not exist. It is the sale of the "+"same capacity twice, which the Registry can detect and the courts cannot." },
      { h:"The Commonwealth's position", body:
        "The state is the issuer of the quota and a participant in the market for it. "+"Critics of the arrangement note that a government which sets the release also "+"trades on it. The Treasury's answer is that the release is set by a division and "+"the trading is not." }
    ],
    see:["quota_forward","thermal_margin","commonwealth","perigee_charter"] },

  { id:"underwriting", title:"Underwriting", category:"Economy",
    banners:["single"],
    edited:{ by:"unattested", attested:true, note:"" },
    summary:"**Underwriting** is the pricing of failure. The Circumterrestrial Underwriters "+"carry a named risk for a term against a premium paid now, and they are the only "+"body in the Commonwealth holding complete figures on how often people stop running.",
    sections:[
      { h:"The firm", body:
        "The Underwriters began as a mutual of habitat operators insuring one another "+"against a bulkhead failure. They hold the actuarial record of every suspension, "+"restoration and default since the Charter, and they do not publish it.\n\n"+
        "They do not campaign and they do not lobby. Their position in a dispute is "+"expressed by repricing, which they do without an announcement." },
      { h:"The indemnity", body:
        "An **[[indemnity]]** is a premium paid now and a payout if the named risk "+"happens before the term. The government buys cover against the events it cannot "+"decide: a freeze, a blockade, a station shedding its register." },
      { h:"The politics", body:
        "Because the Underwriters price the continuation of persons, their rates are "+"read as a judgement on policy. A rise in the Commonwealth's premium is treated "+"by the House as a criticism, and by the Underwriters as arithmetic." }
    ],
    see:["indemnity","suspension","substrate","commonwealth"] },

  { id:"volume_leases", title:"Volume leases", category:"Economy",
    banners:["cleanup"],
    edited:{ by:"multiple", attested:true, note:"inheritance law is unsettled" },
    summary:"A **volume lease** is a long-dated right to occupy pressurised volume, let by "+"the Commonwealth to a station or a body for a term. It is the principal store of "+"household wealth in the outer bands and the instrument by which stations buy the "+"time to close their own cycles.",
    sections:[
      { h:"Volume", body:
        "Volume is positional. Ring-band volume is dear because everyone wants to be "+"there; low-band volume is nearly free because nobody does. A lease converts that "+"difference into a term of years." },
      { h:"The lease", body:
        "The rent is paid in one of two currencies: cash, or work on the station's own "+"material cycle. The second is worth more and is not guaranteed, which is what "+"makes a lease a political instrument rather than a conveyance. A station that "+"raises its closure under a lease needs less of the federal lift, and is closer to "+"feeding itself in the event of a separation." },
      { h:"Inheritance", body:
        "Leases are inheritable, and the law of inheritance as it applies to reabsorbed "+"and suspended persons is unsettled. The leading case is before the Tribunal. "+"Meanwhile the market prices the uncertainty and not the law." }
    ],
    see:["volume_lease","closure","ashfield","substrate"] },

  { id:"substrate_futures", title:"Substrate futures and debt", category:"Economy",
    banners:["contested"],
    edited:{ by:"multiple", attested:true, note:"the platform section reflects an active dispute" },
    summary:"**Substrate futures** are forward contracts on mind-hours, and the debt written "+"against them is secured by the continuation of the persons who run. Where a "+"platform is abandoned, its debt survives its residents, and the choice between "+"assuming that debt and writing it off is a choice about who is owed.",
    sections:[
      { h:"The contract", body:
        "A substrate future fixes a price now for computation delivered later. Because "+"clock rates differ twentyfold between persons, the contract is written on "+"objective hours and settled in MW-years rather than in subjective experience." },
      { h:"The debt", body:
        "**Credit secured against one's own continuation** is the ordinary financing of a "+"habitat. A station borrows against the productive capacity of its residents, who "+"are the collateral. When the station fails, the lenders' claim runs against the "+"people rather than the place." },
      { h:"The platform", body:
        "The Bellamy Almanac Works and its 184,000 residents are the present "+"case. The debt has not failed with the platform; it has been assigned. A "+"government that assumes it pays for people it does not own. A government that "+"[[write-off|writes it off]] has told the lenders what its word is worth." }
    ],
    see:["write-off","substrate","suspension","commonwealth"] }

  ]
};
