/* Assembles the content object the engine reads. Add a new content file
   above this one in index.html, then register it here. */
const CONTENT = (function () {
  const C = {
    setup: SETUP, parties: PARTIES, currents: CURRENTS,
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
    /* THE DIMENSIONS THIS POLITY ARGUES ALONG, and the goods it prices.
       Both were literals in js/engine.js, which meant adding an axis the
       Commonwealth cares about — housing, religion, labour — required
       editing the engine. They are declared here instead, beside the
       parties whose positions they describe (bible §7.3 for the goods). */
    axes: ["ownership", "personhood", "sovereignty", "closure"],
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
