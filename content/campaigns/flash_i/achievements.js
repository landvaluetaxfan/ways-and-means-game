/* =============================================================
   FLASH I — AWARDS. The five tiers, the supercanon, and two actions only
   this crisis offers. Tagged and added to the world's ACHIEVEMENTS by
   `campaign()`.
   ============================================================= */
campaign("flash_i", { achievements: [

  { id:"set_triumph", name:"Orbital Powerhouse", tier:"settlement",
    note:"You annexed the Works and Earth dropped its debt claims rather than " +
         "test what the Commonwealth would do with the anchors it holds. Full " +
         "annexation on the Commonwealth's terms, with no embargo and the " +
         "bonds left where they fell.",
    when:{ resolved:"f1_triumph" } },
  { id:"set_maritime", name:"Maritime Charter", tier:"settlement",
    note:"The Works was annexed and an international court recognised the " +
         "salvage, which makes it Commonwealth territory in law rather than " +
         "by force. You take the Works and the legal bill, without the " +
         "stand-off.",
    when:{ resolved:"f1_maritime" } },
  { id:"set_pyrrhic", name:"Sovereign Debt Trap", tier:"settlement",
    note:"The Works was annexed and the Commonwealth assumed the defaulted " +
         "Cordell bonds that the wind-up left behind. The people are carried; " +
         "the debt is now the Commonwealth's, and the austerity arrives at " +
         "the next estimates. This is the campaign's canon ending.",
    when:{ resolved:"f1_pyrrhic" } },
  { id:"set_joint", name:"Joint Mandate", tier:"settlement",
    note:"The referendum was recognised but the Works was not annexed. It " +
         "became a co-administered free trade zone: no embargo and no " +
         "territory, and a country that shrugged.",
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
    note:"You took the underwriters' indemnity against the freeze. The " +
         "premium is spent whether or not the risk lands, and the cover is " +
         "worth what it is worth on the day the accounts are frozen.",
    when:{ flags:["indemnity_taken"] } },
  { id:"act_annexed", name:"The Question Was Carried", tier:"action",
    note:"You recognised the referendum and moved to annex the Works. This is " +
         "the decision the campaign is about; whether it becomes an Act is the " +
         "rest of the session.",
    when:{ flags:["f1_annexing"] } },

] });
