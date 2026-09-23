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
  const idx = (arr) => arr.reduce((m, o) => (m[o.id] = o, m), {});
  C.partyById = idx(PARTIES);
  C.currentById = idx(CURRENTS);
  C.stationById = idx(STATIONS);
  C.instrumentById = (typeof INSTRUMENTS!=="undefined"?INSTRUMENTS:[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.cabinetById = (typeof CABINET!=="undefined"?CABINET:[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.constituencyById = (C.constituencies||[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.characterById = idx(CHARACTERS);
  C.billById = idx(BILLS);
  C.eventById = idx(EVENTS);
  C.functionalById = (C.functional||[]).reduce((m,f)=>(m[f.id]=f,m),{});
  /* the authored articles only; the Concordance generates its own for
     parties, stations and persons and keeps those to itself. The
     encyclopedia is an OBJECT - meta, banners, articles - not a list. */
  C.artifacts = typeof ARTIFACTS !== "undefined" ? ARTIFACTS : {};
  C.notice = typeof NOTICE !== "undefined" ? NOTICE : null;
  C.encyclopediaById = ((C.encyclopedia||{}).articles||[]).reduce((m,a)=>(m[a.id]=a,m),{});
  C.settlementById = (C.settlements||[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.actorById = (C.actors||[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.glossaryByTerm = GLOSSARY.reduce((m,g)=>(m[g.term.toLowerCase()]=g,m),{});
  return C;
})();
if (typeof module !== "undefined") module.exports = CONTENT;
