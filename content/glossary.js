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
    handle:"An identical twin who has been awake somewhere else.",
    introduced:"briefing_divergence" },

  { term:"instance", cluster:"copies", gloss:"A fork that is still legally the same person as its root.",
    handle:"A branch office acting under head office's name.",
    introduced:"briefing_divergence" },

  { term:"divergence threshold", cluster:"copies", gloss:"The hours of separate experience after which a copy becomes a person in law.",
    handle:"A legal line-drawing exercise, like any age of majority.",
    introduced:"briefing_divergence" },

  { term:"suspension", cluster:"cold", gloss:"A mind held intact and not running. Not death.",
    handle:"An induced coma nobody has agreed to end.",
    introduced:"halloran_signatures" },

  { term:"shed order", cluster:"cold", gloss:"The published list deciding who stops running first in a power shortfall.",
    handle:"A triage list, written in advance, by whoever holds the pen.",
    introduced:"halloran_signatures" },

  { term:"substrate", cluster:"cold", gloss:"The hardware an emulated mind runs on. Its tenants pay rent to exist on it.",
    handle:"Rent, except the landlord can switch you off.",
    introduced:"halloran_signatures" },

  { term:"thermal margin", cluster:"heat", gloss:"Spare radiator capacity. Every watt of thought becomes heat that must be dumped.",
    handle:"Grid capacity on the hottest day of the year.",
    introduced:"vantage_radiator" },

  { term:"engineering authority", cluster:"heat", gloss:"The body that may act on life-support integrity without asking a minister.",
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
    handle:"Voter ID, for a world where copies are cheap.",
    introduced:"cluster_flag" },

  { term:"closure", gloss:"The fraction of a habitat's material cycle it can sustain without imports.",
    handle:"How long the town survives if the road closes.",
    cluster:"cold", introduced:"halloran_signatures" },

  { term:"revenant", gloss:"A member returned on the party list after losing a district.",
    handle:"A candidate the party parachutes back in through the back door.",
    cluster:"caucus", introduced:"halloran_finds_nine" },

  { term:"reabsorb", cluster:"copies", gloss:"To merge an instance back into its root, ending it as a separate life.",
    handle:"Closing the branch office and filing its paperwork.",
    introduced:"briefing_divergence" },

  { term:"tier four", cluster:"cold", gloss:"The lowest band of the shed order. First to stop, last to be restored.",
    handle:"Bottom of the transplant list.",
    introduced:"halloran_signatures" },

  { term:"clock rate", cluster:"clock", gloss:"How fast an emulated mind runs. Money buys speed; poverty is slowness.",
    handle:"Working eight-hour days while your rivals work sixty-four.",
    introduced:"ch2_psa_conference" },

  { term:"House of Delegates", cluster:"functional", gloss:"The elected chamber of Parliament. 280 seats, majority 141.",
    handle:"The Commons, with a different name and a third tier.",
    introduced:"gb_approach" },

  /* THE FOUR MARKET INSTRUMENTS (design/28 §3). Each is a position the
     government can take, and each is taught by its own settle event — the
     first sitting where the player meets what the position actually was.
     They share one cluster because they are one lesson: a market here is
     something taken now and settled later, priced by the votes already
     cast. No event introduces more than one cluster. */
  { term:"quota forward", cluster:"markets", gloss:"Quota sold now for delivery at a named sitting, at a price fixed on the day.",
    handle:"A farmer selling the harvest in spring.",
    introduced:"quota_forward_settles" },
  { term:"indemnity", cluster:"markets", gloss:"A premium paid now, and a payout if the named risk happens before the term.",
    handle:"Insurance, written by the only firm that holds the numbers.",
    introduced:"indemnity_settles" },
  { term:"volume lease", cluster:"markets", gloss:"Volume let forward to a station for a term, paid in cash or in work on its own cycle.",
    handle:"A long lease on a shop, paid in rent or in repairs.",
    introduced:"volume_charter_settles" },
  { term:"write-off", cluster:"markets", gloss:"The cancellation of a debt secured against a person's continuation.",
    handle:"Tearing up the invoice because the debtor is the collateral.",
    introduced:"substrate_debt_settles" },

  { term:"Perigee", gloss:`Metonym for the government, from the Perigee Charter.`,
    handle:"Washington or Whitehall: the place standing in for the people in it.",
    assumed:true },

  /* THE MONEY (design/39 option C). One cluster, taught where the government
     first meets the Bank: the remit letter. The ordinary words of central
     banking are assumed; the one power the Reserve Bank Act keeps back for
     Parliament is not. */
  { term:"reserve direction", cluster:"bank", gloss:"An order of the House telling the Reserve Bank what to do with the cash rate.",
    handle:"A minister overruling the referee, in public, with a vote to prove it.",
    introduced:"rb_remit" },

  { term:"continuity rating", cluster:"bank", gloss:"The Underwriters' judgement of whether a borrower keeps running. It sets the price of the debt.",
    handle:"A credit rating, from people who insure against the thing itself.",
    introduced:"rb_downgrade" },

  { term:"cash rate", gloss:"The Reserve Bank's policy rate: what an overnight dollar costs.", assumed:true },
  { term:"Commonwealth dollar", gloss:"The currency. It has floated against Earth's money since 2073.", assumed:true },
  { term:"Treasury bills", gloss:"Short loans the Treasury tenders weekly when the reserve cannot pay.", assumed:true },

  { term:"emulation", gloss:"A person running as software, without a body.", assumed:true },
  { term:"root",      gloss:"The original, of which instances are copies.",       assumed:true },
  { term:"the Charter", gloss:"The Perigee Charter. The founding document.",      assumed:true },
  { term:"habitat",   gloss:"A station. Where people live.",                       assumed:true }
];
