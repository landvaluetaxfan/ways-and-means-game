/* Assembles the content object the engine reads. Add a new content file
   above this one in index.html, then register it here. */
const CONTENT = (function () {
  const C = {
    setup: SETUP, parties: PARTIES, currents: CURRENTS,
    partyOrg: typeof PARTY_ORG !== "undefined" ? PARTY_ORG : {},
    administrations: typeof ADMINISTRATIONS !== "undefined" ? ADMINISTRATIONS : [],
    initiatives: typeof INITIATIVES !== "undefined" ? INITIATIVES : [],
    stations: STATIONS,
    constituencies: typeof CONSTITUENCIES !== "undefined" ? CONSTITUENCIES : [],
    cabinet: typeof CABINET !== "undefined" ? CABINET : [],
    instruments: typeof INSTRUMENTS !== "undefined" ? INSTRUMENTS : [],
    minutes: typeof MINUTES !== "undefined" ? MINUTES : [], characters: CHARACTERS, bills: BILLS, events: EVENTS, glossary: GLOSSARY, encyclopedia: ENCYCLOPEDIA,
    functional: typeof FUNCTIONAL !== "undefined" ? FUNCTIONAL : [],
    archetypes: typeof ARCHETYPES !== "undefined" ? ARCHETYPES : [],
    business: typeof BUSINESS !== "undefined" ? BUSINESS : [],
    settlements: typeof SETTLEMENTS !== "undefined" ? SETTLEMENTS : [],
    actors: typeof ACTORS !== "undefined" ? ACTORS : [],
    /* THE EARTH, and the anchors on it (design/29). Not read by the engine:
       the foreign layer is a price and a debt, and the globe is the ground it
       stands on. The World screen reads it, and `content/world.js` is where the
       coordinates live so nothing in js/ names a country. */
    world: typeof WORLD !== "undefined" ? WORLD : null,
    achievements: typeof ACHIEVEMENTS !== "undefined" ? ACHIEVEMENTS : [],
    /* THE SANDBOX CONTROLS (T26): the one list the Sandbox tab and the queued
       test_console event both press. Owned by content/events.js. */
    sandbox: typeof SANDBOX !== "undefined" ? SANDBOX : [],
    /* THE GOODS THIS POLITY PRICES (bible §7.3), a literal in js/engine.js
       until it was declared here. There was an `axes` list beside it naming
       the four categorical axes of before the signed conversion --
       "ownership" and "closure" among them -- which nothing read: the axes
       are whatever a party and a bill both declare, and js/schema.js names
       their poles. Removed rather than corrected (design/34). */
    scarcities: ["thermal", "substrate", "volume", "transit"],
    /* The name pools, so the engine can seat a list member without naming
       one itself. It indexes these; it does not contain them. */
    names: typeof NAMELISTS !== "undefined" ? NAMELISTS : {}
  };
  C.artifacts = typeof ARTIFACTS !== "undefined" ? ARTIFACTS : {};
  C.notice = typeof NOTICE !== "undefined" ? NOTICE : null;

  /* THE INDEXES, built from whatever collections a content object holds, so
     a campaign's view (below) is indexed from its own lists and not the
     whole set's. */
  function index(K) {
    const idx = arr => (arr || []).reduce((m, o) => (m[o.id] = o, m), {});
    K.partyById = idx(K.parties);
    K.currentById = idx(K.currents);
    K.stationById = idx(K.stations);
    K.instrumentById = idx(K.instruments);
    K.cabinetById = idx(K.cabinet);
    K.constituencyById = idx(K.constituencies);
    K.characterById = idx(K.characters);
    K.billById = idx(K.bills);
    K.eventById = idx(K.events);
    K.functionalById = idx(K.functional);
    /* the authored articles only; the Concordance generates its own for
       parties, stations and persons and keeps those to itself. The
       encyclopedia is an OBJECT - meta, banners, articles - not a list. */
    K.encyclopediaById = idx((K.encyclopedia || {}).articles);
    K.settlementById = idx(K.settlements);
    K.actorById = idx(K.actors);
    K.glossaryByTerm = (K.glossary || []).reduce((m, g) => (m[g.term.toLowerCase()] = g, m), {});
    return K;
  }
  index(C);

  /* A CAMPAIGN'S VIEW OF THE CONTENT (design/36 §3). A campaign is an
     administration: the government the menu offers. The content above is
     the WORLD plus every campaign's story, and an entry that carries
     `campaign` (an id, or a list of them) belongs to that campaign only;
     an entry without one belongs to every campaign. This returns the
     content one campaign plays:

       - every collection with its other campaigns' entries removed, and
         the indexes rebuilt from what is left;
       - `setup` merged ONE LEVEL deep: the world's, then the campaign's,
         then this administration's, so a campaign can change one scalar
         or add one lender without restating the rest;
       - `opening`, the campaign's effects applied at the first sitting
         (Engine.newGame reads it): how a campaign opens on the last one's
         canon ending (bible §1.8);
       - `campaign`, the id the `campaign` condition compares against.

     An administration may play ANOTHER's campaign (`campaign: "flash_i"`
     on the sandbox): it gets that campaign's content, setup and opening,
     and then its own setup on top. Nothing is copied into the content
     files; a view is built on demand and the world is never edited. */
  const plain = v => v && typeof v === "object" && !Array.isArray(v);
  const merge = (base, over) => {
    const out = Object.assign({}, base);
    Object.keys(over || {}).forEach(k => {
      out[k] = plain(over[k]) && plain(out[k]) ? Object.assign({}, out[k], over[k]) : over[k];
    });
    return out;
  };
  C.forCampaign = function (a) {
    /* the object it is called on, so a copy of the content with another
       campaign added (a test, a mod) builds that campaign's view */
    const C0 = this && this.administrations ? this : C;
    const list = C0.administrations || [];
    const admin = typeof a === "string" ? list.find(x => x.id === a) : a;
    if (!admin) return C;
    const camp = admin.campaign || admin.id;
    const host = camp !== admin.id ? list.find(x => x.id === camp) : null;
    const mine = x => !x || typeof x !== "object" || x.campaign == null ||
                      [].concat(x.campaign).indexOf(camp) >= 0;
    const K = Object.assign({}, C0);
    Object.keys(C0).forEach(k => {
      if (Array.isArray(C0[k]) && k !== "administrations") K[k] = C0[k].filter(mine);
    });
    if (C0.encyclopedia && C0.encyclopedia.articles)
      K.encyclopedia = Object.assign({}, C0.encyclopedia,
                                     { articles: C0.encyclopedia.articles.filter(mine) });
    K.setup = merge(merge(C0.setup, host && host.setup), admin.setup);
    K.opening = [].concat((host && host.opening) || [], admin.opening || []);
    K.campaign = camp;
    K.admin = admin.id;
    return index(K);
  };
  return C;
})();
if (typeof module !== "undefined") module.exports = CONTENT;
