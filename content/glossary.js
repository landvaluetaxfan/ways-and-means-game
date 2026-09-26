/* GLOSSARY — the closed vocabulary of the setting.
   Every setting-specific term a player meets must appear here.

   term       what appears in prose (matched case-insensitively, first use only)
   gloss      ONE line. If it needs two, the concept is too big for one term.
   handle     the familiar real-world shape it hangs on. This is the teaching
              device: a new idea attached to a shape the player already owns.
   introduced event id where the player first meets it, or null for "assumed"
   assumed    true = ordinary English in this world, needs no teaching moment
   cluster    terms that cannot be taught apart share a cluster name. A cluster
              counts as ONE unit of teaching load. You cannot explain a
              divergence threshold without also explaining fork and instance,
              so those three are one idea, not three.

   THE RULE: one cluster per event. The linter (tools/lint.js) enforces it.
*/

const GLOSSARY = [
  { term:"fork", cluster:"copies", gloss:"A running copy of a person.",
    article:"A **fork** is a running copy of a person: a mind copied from its [[term_root|root]] and set running on its own [[term_substrate|substrate]]. In law a fork begins as an [[term_instance|instance]] of the person it was copied from, and becomes a person of its own once its separate experience passes the [[term_divergence_threshold|divergence threshold]].",
    handle:"An identical twin who has been awake somewhere else.",
    introduced:"briefing_divergence" },

  { term:"instance", cluster:"copies", gloss:"A fork that is still legally the same person as its root.",
    article:"An **instance** is a [[term_fork|fork]] that is still legally the same person as its [[term_root|root]]. It shares the root's name, vote and obligations, and what it earns is the root's. An instance that runs past the [[term_divergence_threshold|divergence threshold]] becomes a person of its own; one that does not may be [[term_reabsorb|reabsorbed]].",
    handle:"A branch office acting under head office's name.",
    introduced:"briefing_divergence" },

  { term:"divergence threshold", cluster:"copies", gloss:"The hours of separate experience after which a copy becomes a person in law.",
    article:"The **divergence threshold** is the number of hours of separate experience after which a [[term_fork|fork]] becomes a person in law, with its own vote and its own debts. It is set by statute in subjective hours, so a fast-running copy reaches it sooner by the clock. Where it is set decides how many copies are persons with votes of their own.",
    handle:"A legal line-drawing exercise, like any age of majority.",
    introduced:"briefing_divergence" },

  { term:"suspension", cluster:"cold", gloss:"A mind held intact and not running. Not death.",
    handle:"An induced coma nobody has agreed to end.",
    introduced:"halloran_signatures" },

  { term:"shed order", cluster:"cold", gloss:"The published list deciding who stops running first in a power shortfall.",
    article:"A **shed order** is the published list that decides who stops running first when a station cannot cool or power everyone. It ranks the population in tiers; [[term_tier_four|tier four]] is shed first. The Allocation Act allows the [[term_engineering_authority|engineering authority]] to shed the tier-four register without notice, and a person shed is held in [[suspension]].",
    handle:"A triage list, written in advance, by whoever holds the pen.",
    introduced:"halloran_signatures" },

  { term:"substrate", cluster:"cold", gloss:"The hardware an emulated mind runs on. Its tenants pay rent to exist on it.",
    article:"**Substrate** is the hardware an [[term_emulation|emulated]] person runs on. Its tenants pay rent for the computation they use, so the substrate price is the price of continuing to run. Part of it is held publicly and the rest by private providers, and a person who cannot pay and is not insured is suspended.",
    handle:"Rent, except the landlord can switch you off.",
    introduced:"halloran_signatures" },

  { term:"thermal margin", cluster:"heat", gloss:"Spare radiator capacity. Every watt of thought becomes heat that must be dumped.",
    article:"The **thermal margin** is the spare capacity of the Commonwealth's radiators, as a share of what they can reject. Every watt of computation and industry becomes heat that must be radiated away, so the margin is what stands between a station and shedding load. At zero the stations shed load in cascade. The government's emergency orders raise it, each at a cost.",
    handle:"Grid capacity on the hottest day of the year.",
    introduced:"vantage_radiator" },

  { term:"engineering authority", cluster:"heat", gloss:"The body that may act on life-support integrity without asking a minister.",
    article:"The **engineering authority** is the body that may act on the integrity of life-support systems without asking a minister. It can summon the Minister for Life Support, and under the Allocation Act it may shed the [[term_tier_four|tier-four]] register without notice. Who holds the power to order a shed is itself set by statute.",
    handle:"A regulator with emergency powers and no election to lose.",
    introduced:"vantage_radiator" },

  { term:"functional constituency", cluster:"functional", gloss:"A seat elected by the members of a profession or industry.",
    handle:"The House of Lords, if the Lords were chosen by their trade bodies.",
    introduced:"gb_approach" },

  { term:"dual majority", cluster:"functional", gloss:"Some bills must carry separately among functional and elected members.",
    handle:"A second chamber that sits inside the first one.",
    introduced:"gb_approach" },

  { term:"licensure", cluster:"functional", gloss:"Professional certification. It decides who votes in a functional seat.",
    handle:"A medical licence that also comes with a ballot.",
    introduced:"gb_approach" },

  { term:"attestation", gloss:"Proof of being one unique person. Required to vote or to post.",
    article:"**Attestation** is proof, held on the Registry, that a person is one unique individual. Only an attested person may vote or post in their own name, which makes the Registry the Commonwealth's electoral roll. An attestation that is not renewed lapses, and must be restored before its holder can vote again.",
    handle:"Voter ID, for a world where copies are cheap.",
    introduced:"cluster_flag" },

  { term:"closure", gloss:"The fraction of a habitat's material cycle it can sustain without imports.",
    article:"**Closure** is the fraction of a habitat's material cycle that it can sustain without imports. Most stations are below the level at which leaving the Commonwealth is survivable, which is what holds the union together; federal development spending raises a station's closure, and with it the station's capacity to leave. See [[commonwealth|Circumterrestrial Commonwealth]].",
    handle:"How long the town survives if the road closes.",
    cluster:"cold", introduced:"halloran_signatures" },

  { term:"revenant", gloss:"A member returned on the party list after losing a district.",
    article:"A **revenant** is a member returned on the party list after losing a district. A candidate may stand in a district and on the list at once, and section 44 of the Representation Act governs how a defeated district candidate is ranked on the list.",
    handle:"A candidate the party parachutes back in through the back door.",
    cluster:"caucus", introduced:"halloran_finds_nine" },

  { term:"reabsorb", cluster:"copies", gloss:"To merge an instance back into its root, ending it as a separate life.",
    article:"To **reabsorb** an [[term_instance|instance]] is to merge it back into its [[term_root|root]], ending it as a separate life. The root keeps the instance's memories. Reabsorption is lawful only while the instance is below the [[term_divergence_threshold|divergence threshold]], and whether it should need a procedure first is a live dispute in the House.",
    handle:"Closing the branch office and filing its paperwork.",
    introduced:"briefing_divergence" },

  { term:"tier four", cluster:"cold", gloss:"The lowest band of the shed order. First to stop, last to be restored.",
    article:"**Tier four** is the lowest band of the [[term_shed_order|shed order]]: the first people to stop running in a shortfall and the last to be restored. Its register is the list the Allocation Act allows the [[term_engineering_authority|engineering authority]] to shed without notice.",
    handle:"Bottom of the transplant list.",
    introduced:"halloran_signatures" },

  { term:"clock rate", cluster:"clock", gloss:"How fast an emulated mind runs. Money buys speed; poverty is slowness.",
    article:"The **clock rate** is how fast an [[term_emulation|emulated]] person runs against real time. Clock rates differ as much as twentyfold between persons, and speed is bought with [[term_substrate|substrate]], so a richer mind lives and works more hours in a day. The government can slow the emulated blocs by order in a thermal emergency.",
    handle:"Working eight-hour days while your rivals work sixty-four.",
    introduced:"ch2_psa_conference" },

  { term:"House of Delegates", cluster:"functional", gloss:"The elected chamber of Parliament. 280 seats, majority 141.",
    article:"The **House of Delegates** is the elected chamber of [[parliament|Parliament]]: 280 seats, of which 141 make a majority. 140 members are elected for districts, 100 from party lists, and 40 by the [[functional_constituency|functional constituencies]]. Some bills must also carry a [[dual_majority|dual majority]].",
    handle:"The Commons, with a different name and a third tier.",
    introduced:"gb_approach" },

  /* THE FOUR MARKET INSTRUMENTS (design/28 §3). Each is a position the
     government can take, and each is taught by its own settle event — the
     first sitting where the player meets what the position actually was.
     They share one cluster because they are one lesson: a market here is
     something taken now and settled later, priced by the votes already
     cast. No event introduces more than one cluster. */
  { term:"quota forward", cluster:"markets", gloss:"Quota sold now for delivery at a named sitting, at a price fixed on the day.",
    article:"A **quota forward** is thermal quota sold now for delivery at a named sitting, at a price fixed on the day it is sold. The government can sell forward to raise money or to fix a price, and settles at the named sitting whatever the market has done since. See [[quota_forwarding|Quota trading and forwarding]].",
    handle:"A farmer selling the harvest in spring.",
    introduced:"quota_forward_settles" },
  { term:"indemnity", cluster:"markets", gloss:"A premium paid now, and a payout if the named risk happens before the term.",
    article:"An **indemnity** is cover bought from the [[underwriting|Underwriters]]: a premium paid now, and a payout if the named risk happens before the term ends. The government buys indemnities against events it cannot decide, such as a freeze of accounts or a blockade.",
    handle:"Insurance, written by the only firm that holds the numbers.",
    introduced:"indemnity_settles" },
  { term:"volume lease", cluster:"markets", gloss:"Volume let forward to a station for a term, paid in cash or in work on its own cycle.",
    article:"A **volume lease** is a right to occupy pressurised volume, let forward by the Commonwealth to a station for a term and paid in cash or in work on the station's own material cycle. Leases are the principal store of household wealth in the outer bands. See [[volume_leases|Volume leases]].",
    handle:"A long lease on a shop, paid in rent or in repairs.",
    introduced:"volume_charter_settles" },
  { term:"write-off", cluster:"markets", gloss:"The cancellation of a debt secured against a person's continuation.",
    article:"A **write-off** is the cancellation of a debt secured against a person's continuation, the substrate debt a person owes to keep running. Writing one off keeps the debtor running and moves the loss to the creditor. See [[substrate_futures|Substrate futures and debt]].",
    handle:"Tearing up the invoice because the debtor is the collateral.",
    introduced:"substrate_debt_settles" },

  { term:"Perigee", gloss:`Metonym for the government, from the Perigee Charter.`,
    article:"**Perigee** is a name for the government, taken from the [[perigee_charter|Perigee Charter]] under which it governs, in the way a capital's name stands for the people who govern from it.",
    handle:"Washington or Whitehall: the place standing in for the people in it.",
    assumed:true },

  /* THE MONEY (design/39 option C). One cluster, taught where the government
     first meets the Bank: the remit letter. The ordinary words of central
     banking are assumed; the one power the Reserve Bank Act keeps back for
     Parliament is not. */
  { term:"reserve direction", cluster:"bank", gloss:"An order of the House telling the Reserve Bank what to do with the cash rate.",
    article:"A **reserve direction** is an order telling the [[reserve_bank|Reserve Bank]] what to do with the [[term_cash_rate|cash rate]], overriding the Bank's own rule. The Reserve Bank Act 2071 keeps the power back for the Treasury, by an order laid before the House. The Bank's credibility falls at every meeting a direction stands.",
    handle:"A minister overruling the referee, in public, with a vote to prove it.",
    introduced:"rb_remit" },

  { term:"continuity rating", cluster:"bank", gloss:"The Underwriters' judgement of whether a borrower keeps running. It sets the price of the debt.",
    article:"A **continuity rating** is the [[underwriting|Underwriters']] judgement of whether a borrower will keep running. The Commonwealth's rating follows the federal [[term_thermal_margin|thermal margin]], and it sets the coupon on the Commonwealth Reserve Notes the Underwriters hold.",
    handle:"A credit rating, from people who insure against the thing itself.",
    introduced:"rb_downgrade" },

  { term:"cash rate", gloss:"The Reserve Bank's policy rate: what an overnight dollar costs.",
    article:"The **cash rate** is the [[reserve_bank|Reserve Bank's]] policy rate: what an overnight dollar costs. The Governor sets it at a meeting every 42 days by a published rule that reads inflation and the output gap, and every rate the Treasury pays at home follows it.", assumed:true },
  { term:"Commonwealth dollar", gloss:"The currency. It has floated against Earth's money since 2073.",
    article:"The **Commonwealth dollar** is the currency of the Commonwealth. It has floated against Earth's money since 2073. See [[commonwealth_dollar|Commonwealth dollar]].", assumed:true },
  { term:"Treasury bills", gloss:"Short loans the Treasury tenders weekly when the reserve cannot pay.",
    article:"**Treasury bills** are short loans the Treasury sells at a weekly tender when the reserve cannot meet a payment. They pay a margin over the [[term_cash_rate|cash rate]], and may be sold only up to the bill authority, a limit set by statute; past it, payments go unmet.", assumed:true },

  { term:"emulation", gloss:"A person running as software, without a body.",
    article:"An **emulation** is a person running as software, without a body, on [[term_substrate|substrate]]. Emulations are persons in law, vote and pay rent on the computation they use, and run at a [[term_clock_rate|clock rate]] they pay for.", assumed:true },
  { term:"root",      gloss:"The original, of which instances are copies.",
    article:"A **root** is the original person of whom [[term_instance|instances]] are copies. An instance is legally the root until it passes the [[term_divergence_threshold|divergence threshold]], and may be [[term_reabsorb|reabsorbed]] into the root before then.",       assumed:true },
  { term:"the Charter", gloss:"The Perigee Charter. The founding document.",
    article:"**The Charter** is the [[perigee_charter|Perigee Charter]] of 2064, the founding document of the Commonwealth.",      assumed:true },
  { term:"habitat",   gloss:"A station. Where people live.",
    article:"A **habitat** is a station: a pressurised structure in orbit where people live. Each habitat is a member of the [[commonwealth|Commonwealth]], and most cannot yet sustain their own material cycle without imports; see [[term_closure|closure]].",                       assumed:true }
];
