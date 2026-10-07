/* =============================================================
   PARKED ACHIEVEMENTS. Written for later acts, or before design/80 retired
   the old opening. Moved here byte for byte by tools/park.js, so nothing is
   lost and nothing is shown: the tag `parked` keeps every entry out of Flash I's
   view and out of the world's, and the itch.io build does not load this folder.
   An entry leaves this file when its act is built and it is rewritten, or when
   the test that names it has a fixture of its own. Do not edit the prose here.
   ============================================================= */
campaign("parked", { achievements: [

  { id:"set_triumph", name:"Orbital Powerhouse", tier:"settlement",
    note:"You annexed the Works, and Earth dropped its debt claims sooner than test what the Commonwealth would do with the anchors it holds. Full annexation on the Commonwealth's terms, with no embargo and the bonds left where they fell.",
    when:{ resolved:"f1_triumph" } },
  { id:"set_maritime", name:"Maritime Charter", tier:"settlement",
    note:"The Works was annexed and an international court recognised the salvage, which makes it Commonwealth territory in law. You take the Works and the legal costs, with no stand-off.",
    when:{ resolved:"f1_maritime" } },
  { id:"set_pyrrhic", name:"Sovereign Debt Trap", tier:"settlement",
    note:"The Works was annexed and the Commonwealth assumed the defaulted " +
         "Cordell bonds that the wind-up left behind. The people are carried; " +
         "the debt is now the Commonwealth's, and the austerity arrives at " +
         "the next estimates. This is the campaign's canon ending.",
    when:{ resolved:"f1_pyrrhic" } },
  { id:"set_joint", name:"Joint Mandate", tier:"settlement",
    note:"The referendum was recognised but the Works was not annexed. It became a co-administered free trade zone: no embargo and no territory, and little public interest either way.",
    when:{ resolved:"f1_joint" } },
  { id:"set_capitulation", name:"Corporate Re-Entry", tier:"settlement",
    note:"The referendum was declined and Cordell's security went back into " +
         "the Works. The outer habitats struck the same week; the Works stayed " +
         "outside the Commonwealth and the people on it stayed there.",
    when:{ resolved:"f1_capitulation" } },
  /* ---------- the supercanon ---------- */
  { id:"supercanon", name:"Ways and Means", tier:"canon",
    note:"You reached the pyrrhic ending \u2014 the Works annexed and the bonds " +
         "assumed \u2014 and then won the election on it. The canon result with " +
         "the arithmetic the campaign was built around.",
    when:{ resolved:"f1_pyrrhic", end:"election", seats:"held" } },
  { id:"act_indemnity", name:"Cover Taken", tier:"action",
    note:"You took the underwriters' indemnity against the freeze. The premium is paid whether or not the accounts are frozen, and the payout depends on what the freeze costs on the day it comes.",
    when:{ flags:["indemnity_taken"] } },
  { id:"act_annexed", name:"The Question Was Carried", tier:"action",
    note:"You recognised the referendum and moved to annex the Works. This is " +
         "the decision the campaign is about; whether it becomes an Act is the " +
         "rest of the session.",
    when:{ flags:["f1_annexing"] } },
] });
