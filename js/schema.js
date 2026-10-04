/* =============================================================
   SCHEMA — machine-readable description of the content vocabulary.
   The editor builds its forms from this. The engine implements it.
   Add a verb to engine EFFECTS, then describe it here, and the
   editor gains a form for it with no further work.
   ============================================================= */

const SCHEMA = {

  /* ---------- effect verbs ---------- */
  effects: {
    /* ONE VERB for every clamp-and-add against a keyed table. The target
       is namespaced: a bare key is a scalar, otherwise loyalty. / rel. /
       price. / capital. / trend. / standing. / actor. / debt. / member. — so the
       editor offers one picker rather than eight near-identical verbs.
       `debt.<lender>` is what is owed to a lender in setup.lenders; a loan
       is that AND a move of solvency, written as two. See js/engine.js
       EFFECTS.move. `member.<id>` is a forum member's standing toward the
       Commonwealth (design/43); a member with an actor moves the actor. */
    move:        { label:"Move a number", args:[
                   {k:"key",   type:"enum", src:"moveTargets", label:"Target"},
                   {k:"delta", type:"int",  label:"Change", hint:"+ or −"}],
                   shape:"keyed" },
    /* ONE NUMBER, because the editor round-trips scalarVal and does not
        round-trip a bespoke object — tools/roundtrip.js caught the first
        version, which declared shape:"object" and had no editor support
        behind it. The engine still accepts the long form for an author
        writing by hand; this is the canonical one. */
    court:       { label:"Court the partners who walked out", args:[
                   {k:"value", type:"int", label:"Loyalty", hint:"moves every withdrawn partner"}],
                   shape:"scalarVal" },
    motion:      { label:"The opposition tables a confidence motion", args:[
                   {k:"value", type:"int", label:"Sittings until the division", hint:"the House divides then"}],
                   shape:"scalarVal" },
    /* §7.10 the productive economy. Its own verb and not a move namespace,
       because these are not 0..100 scalars: participation is a per cent of
       adults, trade an index at 100, private a share of one. And since the
       dollar (design/39 option C) the Reserve Bank's readings, in the same
       verb so EFFECTS does not grow: credibility (a share of one), expected
       and inflation (points), shock (per cent of potential output, fading),
       fx (per cent), reserves (the Bank's, in Earth's money) and rate
       (points, for a decision content stages). */
    economy:     { label:"Move the economy", args:[
                   {k:"key", type:"enum", src:"economyKeys", label:"Measure"},
                   {k:"delta", type:"num", label:"Change"}],
                   shape:"keyed" },
    /* THE FORUMS (design/43). "table" puts a resolution on its forum's
       agenda whoever sponsors it (the Union tables its own through an
       event); a choice that tables the Commonwealth's own should carry the
       resolution's `when`, since an effect does not check it. "for",
       "against" and "abstain" set the Commonwealth's vote. */
    resolution:  { label:"Act on a forum resolution", args:[
                   {k:"key", type:"enum", src:"resolutions", label:"Resolution"},
                   {k:"value", type:"enum", src:"resolutionActions", label:"Action"}],
                   shape:"keyedSet" },
    law:         { label:"Set a law value", args:[
                   {k:"key", type:"enum", src:"laws", label:"Law"},
                   {k:"value", type:"any", label:"New value"}],
                   shape:"keyedSet" },
    station:     { label:"Change a station", args:[
                   {k:"key", type:"enum", src:"stations", label:"Station"},
                   {k:"field", type:"enum", src:"stationFields", label:"Field"},
                   {k:"delta", type:"num", label:"Change"}],
                   shape:"nested" },
    seats:       { label:"Move seats", args:[
                   {k:"key", type:"enum", src:"parties", label:"Party"},
                   {k:"field", type:"enum", src:"tiers", label:"Tier"},
                   {k:"delta", type:"int", label:"Change"}],
                   shape:"nested" },
    functional:  { label:"Move functional seats", args:[
                   {k:"key", type:"enum", src:"functional", label:"Constituency"},
                   {k:"field", type:"enum", src:"parties", label:"Party"},
                   {k:"delta", type:"int", label:"Seats"}],
                   shape:"nested" },
    flag:        { label:"Set a flag", args:[{k:"value", type:"flag", label:"Flag"}], shape:"scalarVal" },
    bill:        { label:"Change a bill", args:[
                   {k:"key", type:"enum", src:"bills", label:"Bill"},
                   {k:"field", type:"enum", src:"billFields", label:"Field"},
                   {k:"value", type:"any", label:"Value"}],
                   shape:"nestedSet" },
    coalition:   { label:"Change the coalition", args:[
                   {k:"field", type:"enum", src:["add","remove"], label:"Action"},
                   {k:"value", type:"enum", src:"parties", label:"Party"}],
                   shape:"coalition" },
    wire:        { label:"Push a wire headline", args:[{k:"value", type:"text", label:"Headline", hint:"CAPS"}], shape:"scalarVal" },
    chapter:     { label:"Advance to chapter", args:[
                   {k:"value", type:"int", label:"Chapter"}], shape:"scalarVal" },
    queue:       { label:"Queue a later event", args:[
                   {k:"value", type:"enum", src:"events", label:"Event"},
                   {k:"delta", type:"int", label:"After N sittings", def:1},
                   /* OPTIONAL, AND CARRIED. A label is what the queue entry
                      is called on the calendar and on the foreign panel
                      ("A dispatch to the Martian Concord"); without the arg
                      the editor's round-trip dropped it, which the encoding
                      check caught. */
                   {k:"label", type:"text", label:"Label", optional:true},
                   {k:"date", type:"text", label:"Calendar date (YYYY-MM-DD)", optional:true}],
                   shape:"queue" },
    /* Seats move only by these. A district count is derived from the roll,
       so writing one directly is refused by the engine. */
    cross:       { label:"Cross the floor", args:[
                   {k:"constituency", type:"enum", src:"constituencies", label:"Constituency"},
                   {k:"from", type:"enum", src:"parties", label:"From"},
                   {k:"to", type:"enum", src:"parties", label:"To"},
                   {k:"seats", type:"int", label:"Seats", hint:"blank is one", optional:true}], shape:"list" },
    vacate_seat: { label:"Vacate a seat", args:[
                   {k:"constituency", type:"enum", src:"constituencies", label:"Constituency"},
                   {k:"party", type:"enum", src:"parties", label:"Held by"},
                   {k:"why", type:"text", label:"Reason"},
                   /* who left: in a seat of one the engine knows, in a seat
                      of several it has to be told (design/46) */
                   {k:"member", type:"enum", src:"charactersOrNone", label:"Member", optional:true},
                   {k:"then", type:"enum", src:"vacancyThen", label:"Then", optional:true}], shape:"list" },
    election:    { label:"Hold a general election", args:[
                   {k:"value", type:"bool", label:"Dissolve"}], shape:"scalarVal" },

    /* THE SIX THE EDITOR COULD NOT OFFER (design/46). The engine had them
       all along; the schema did not describe them, so the editor kept them
       as raw JSON when it found them and never offered them to an author.
       test.js now holds this file to the engine's own list. */
    cabinet:     { label:"Appoint to a post, or vacate it", args:[
                   {k:"key", type:"enum", src:"posts", label:"Post"},
                   {k:"holder", type:"enum", src:"holderOrVacant", label:"Holder"},
                   {k:"party", type:"enum", src:"partiesOrNone", label:"Party", optional:true}],
                   shape:"appoint" },
    signatures:  { label:"Move the leadership paper's signatures", args:[
                   {k:"value", type:"int", label:"Change", hint:"+ or −"}], shape:"scalarVal" },
    si:          { label:"Make a statutory instrument", args:[
                   {k:"value", type:"enum", src:"instruments", label:"Instrument"}], shape:"scalarVal" },
    /* order-paper time: `total` adds slots to the period, `refill` gives
       back what has been used, `reserve` holds time for one bill alone */
    slots:       { label:"Change order-paper time", args:[
                   {k:"field", type:"enum", src:["total","reserve","refill"], label:"How"},
                   {k:"key", type:"enum", src:"billsOrNone", label:"Bill (reserve)"},
                   {k:"delta", type:"int", label:"Slots"}], shape:"slots" },
    /* A PROMISE is seven fields, so it is written as JSON from a template
       rather than squeezed into a row. `by` counts sittings from now, and
       null means before the House rises. `discharge` is what keeps it, one
       of {flag}, {si} (an order made), {slot} (time given to a bill),
       {bill, stage}, {division, carried} or {repaid} (a lender owed
       nothing): see met() in js/engine.js. `onBreach` names an event. */
    undertake:   { label:"Make a promise (undertaking)", args:[
                   {k:"value", type:"text", label:"JSON", hint:"the promise"}], shape:"json",
                   template:{ id:"promise_id", text:"What the government has promised",
                              owed_to:null, post:null, by:null,
                              discharge:{ flag:"kept_flag" }, onBreach:null } },
    discharge:   { label:"Release a promise (count it kept)", args:[
                   {k:"value", type:"text", label:"Promise id"}], shape:"scalarVal" }
  },

  /* ---------- condition keys ---------- */
  conditions: {
    anyOf:       { label:"Any one condition block holds", form:"alternatives" },
    minSitting:   { label:"Sitting is at least",       form:"int" },
    maxSitting:   { label:"Sitting is at most",        form:"int" },
    flags:        { label:"Flags are set",             form:"flagList" },
    flagsAbsent:  { label:"Flags are NOT set",         form:"flagList" },
    scalarAbove:  { label:"Indicator above",           form:"map", src:"scalars", vtype:"int" },
    scalarBelow:  { label:"Indicator below",           form:"map", src:"scalars", vtype:"int" },
    lawIs:        { label:"Law equals",                form:"map", src:"laws", vtype:"any" },
    lawAbove:     { label:"Law above",                 form:"map", src:"laws", vtype:"num" },
    lawBelow:     { label:"Law below",                 form:"map", src:"laws", vtype:"num" },
    loyaltyAbove: { label:"Loyalty above",             form:"map", src:"loyaltyTargets", vtype:"int" },
    loyaltyBelow: { label:"Loyalty below",             form:"map", src:"loyaltyTargets", vtype:"int" },
    billStage:    { label:"Bill is at stage",          form:"map", src:"bills", vtype:"stage" },
    /* a value may be one status or a list of them, which the editor keeps
       as JSON */
    resolutionIs: { label:"Resolution is",             form:"map", src:"resolutions", vtype:"word", words:"resolutionStatuses" },
    priceAbove:     { label:"Price above",             form:"map", src:"prices", vtype:"int" },
    priceBelow:     { label:"Price below",             form:"map", src:"prices", vtype:"int" },
    capitalAbove:   { label:"Debt above",              form:"map", src:"parties", vtype:"int" },
    capitalBelow:   { label:"Debt below",              form:"map", src:"parties", vtype:"int" },
    pairsKeptAtLeast: { label:"Pairs honoured at least", form:"int" },
    economyAbove:   { label:"Economy reading above", form:"map", src:"economyReadings", vtype:"num" },
    economyBelow:   { label:"Economy reading below", form:"map", src:"economyReadings", vtype:"num" },
    slotsLeft:      { label:"Order-paper slots left",  form:"int" },
    chapterIs:      { label:"Chapter is",              form:"int" },
    chapterAtLeast: { label:"Chapter is at least",      form:"int" },
    inGovernment:   { label:"In government",            form:"bool" },
    withdrawn:      { label:"A partner has walked out", form:"bool" },
    returned:       { label:"The count returned the government", form:"bool" },
    sideAtLeast:    { label:"Government's side seats at least (after the count)", form:"int" },
    sideBelow:      { label:"Government's side seats below (after the count)", form:"int" },

    /* THE TWENTY-TWO THE EDITOR COULD NOT OFFER (design/46), in the
       engine's order. `idList` is one id or several, every one of which must
       hold; `ending` is true (any), false (none) or one ending's id. */
    stationBelow:   { label:"Station field below",      form:"nested", src:"stations", fields:"stationFields" },
    signaturesAtLeast: { label:"Signatures on the leadership paper at least", form:"int" },
    ballotHeld:     { label:"The leadership ballot has been held", form:"bool" },
    ballotCarries:  { label:"The leadership ballot carried", form:"bool" },
    siInForce:      { label:"Instruments in force",     form:"idList", src:"instruments" },
    siNotMade:      { label:"Instruments not yet made", form:"idList", src:"instruments" },
    postVacant:     { label:"Posts vacant",             form:"idList", src:"posts" },
    boardsAtLeast:  { label:"Boards packed at least",   form:"int" },
    boardsBelow:    { label:"Boards packed below",      form:"int" },
    dissolved:      { label:"The House is dissolved",   form:"bool" },
    settled:        { label:"The answer reached",       form:"ending", of:"answer" },
    resolved:       { label:"The crisis result",        form:"ending", of:"crisis" },
    resolvedIs:     { label:"The crisis result is (older spelling)", form:"id", src:"crisisEndings" },
    campaign:       { label:"The campaign running is",  form:"idList", src:"campaignIds" },
    seen:           { label:"Events already met",       form:"idList", src:"events" },
    risesWithin:    { label:"The House rises within (sittings)", form:"int" },
    actorAbove:     { label:"An actor's standing above (as reported)", form:"map", src:"actors", vtype:"int" },
    actorBelow:     { label:"An actor's standing below (as reported)", form:"map", src:"actors", vtype:"int" },
    suspendedAbove: { label:"People suspended above",   form:"map", src:"stationsFederal", vtype:"int" },
    suspendedBelow: { label:"People suspended below",   form:"map", src:"stationsFederal", vtype:"int" },
    owes:           { label:"Promises still open",      form:"idList", src:"undertakings" },
    breached:       { label:"Promises broken",          form:"idList", src:"undertakings" },

    /* WHO (design/46): conditions that ask about a person */
    holds:          { label:"A post is held by",        form:"map", src:"posts", vsrc:"characters" },
    inCabinet:      { label:"In the cabinet",           form:"idList", src:"characters" },
    outOfCabinet:   { label:"Out of the cabinet",       form:"idList", src:"characters" },
    signed:         { label:"Signed the leadership paper", form:"idList", src:"characters" },
    notSigned:      { label:"Not on the leadership paper", form:"idList", src:"characters" },
    refused:        { label:"Refused to sign the paper", form:"idList", src:"characters" },
    seated:         { label:"Still sits for their party", form:"idList", src:"characters" },
    unseated:       { label:"No longer sits",           form:"idList", src:"characters" },
    relationshipAbove: { label:"Relations with the government above", form:"map", src:"relTargets", vtype:"int" },
    relationshipBelow: { label:"Relations with the government below", form:"map", src:"relTargets", vtype:"int" }
  },

  /* WHAT AN AWARD ASKS OF A FINISHED RUN (content/achievements.js). Not the
     conditions above: an award is judged once, on the record, by
     js/shell.js `meets()`, and these are the keys it reads. `list` takes
     one value or several, `settlement` names an ending `of` one kind (a
     crisis result, or an answer), `enum` a word from `options`. */
  awardConditions: {
    end:       { label:"How the run ended",          form:"enum", options:["election","loss"] },
    reason:    { label:"Why it was lost",            form:"list", hint:"supply, confidence, no confidence, leadership, cascade" },
    seats:     { label:"The party's seats",          form:"enum", options:["held","lost"] },
    settled:   { label:"The answer it reached",      form:"settlement", of:"answer" },
    resolved:  { label:"The crisis result",          form:"settlement", of:"crisis" },
    kept:      { label:"Promises kept",              form:"list", hint:"undertaking ids" },
    breached:  { label:"Promises broken",            form:"list", hint:"undertaking ids" },
    flags:     { label:"Every one of these flags",   form:"list", hint:"flag names" },
    flagsAny:  { label:"Any one of these flags",     form:"list", hint:"flag names" },
    log:       { label:"The record says",            form:"list", hint:"words from the session log" },
    logAbsent: { label:"The record never says",      form:"list", hint:"words from the session log" }
  },

  /* ---------- enumerations the forms draw from ---------- */
  /* What a ministry can own. A brief is the list of subjects a post
     answers for, and it is what decides which minister speaks when a
     choice touches their department — see cabinetView() in js/ui.js. */
  briefSubjects: ["scalars", "laws", "prices", "stationFields"],
  /* Initiatives may name the cabinet post that can start them. An unassigned
     one belongs to the Prime Minister until the author assigns it. */
  initiativePost: { label: "Department", src: "posts", optional: true },
  matter: {
    fields: ["id", "campaign", "owner", "raise", "note", "figures", "remedies",
             "counsel", "due", "grace", "recurs", "late", "page", "settled"],
    targets: { initiative: "initiatives", instrument: "instruments", bill: "bills", money: "lenders" },
    remedyFields: ["id", "target", "takes", "note", "label"],
    targetFields: ["kind", "id", "tempo", "amount"],
    counselFields: ["post", "remedy", "note"]
  },
  currentFields: {
    leader: { label: "Leader", src: "characters", optional: true },
    asks: { label: "Asks", type: "text", optional: true }
  },
  characterShadow: { label: "Shadow department", src: "posts", optional: true },
  /* Sources are state paths, economy.<reading>, standing.<band>, or the
     derived confidence_margin and rises_in. A {band} in the source is
     supplied by the reader. Bands are ordered, first matching min wins;
     min:null is the fallback and setup.<path> reads a live threshold. */
  readout: { fields: ["label", "source", "bands"], bandFields: ["min", "text"] },
  campaignMarker: { fields: ["id", "label", "place", "when", "article", "note"],
    places: ["belowBands"] },

  vocab: {
    /* A CHOICE'S POSTURE (design/40 E7): how far it goes, not how much it
       moves. The Sitting screen lists an event's choices cautious first,
       then measured, then bold, and marks each, so the first answer on the
       screen is the careful one and not the one content happened to write
       first. The engine keeps the authored order; only the display sorts. */
    postures: ["cautious","measured","bold"],
    /* AN EVENT'S MOOD (design/31, design/49): the bed js/music.js plays when
       the page arrives. Each already means one moment in the score (a
       division called, a bill lost, the session's end), so a mood is named
       only where the event is that kind of moment. test.js holds this list
       to Music.MOODS. */
    moods: ["tension","moment","defeat","rise","sombre","undertake","order","revoke","threat","prorogue"],
    /* AND THE ONES AN EVENT MAY NAME: those that play and resolve on their
       own. `tension` brings the drums in until a division's result takes
       them out, so on a page they would play until the next division;
       `prorogue` is the score's one full stop and keeps that meaning; and
       `undertake` is a promise's cue. */
    eventMoods: ["threat","moment","defeat","rise","sombre","order","revoke"],
    /* what kind of award an achievement is, which decides where the
       awards screen lists it */
    awardTiers: ["ending","settlement","action","canon"],
    scalars: ["party_loyalty","public_standing","consumables","thermal_margin","solvency","legitimacy","friction"],
    laws: ["divergence_threshold_hours","civic_clock_minimum","suspension_debt_accrual","substrate_public_share",
           "shed_order_authority","tier_ratio_list","threshold_pct"],
    tiers: ["district","list","functional"],
    prices: ["thermal","substrate","volume","transit"],
    stationFields: ["closure","suspended","attested","population","seats"],
    billFields: ["stage","dead"],
    /* EVERY STAGE A BILL CAN BE IN: the engine's ladder (STAGE_ORDER), what
       a division, the President and the rise leave behind, and the two that
       content writes itself ("withdrawn", and "passed", which is content's
       word for what the engine calls "assented"). This listed "lords", which
       no bill is ever in, and lacked third reading and every stage after
       it (design/34). test.js holds it to the engine and to content. */
    billStages: ["drafting","first_reading","second_reading","committee","report",
                 "third_reading","assent","awaiting_assent","referred","assented",
                 "passed","struck","blocked","defeated","fallen","withdrawn"],
    /* THE AXES ARE SIGNED NUMBERS NOW, -1 to +1, and agreement is distance
       rather than a match (bible Part XVII). Each entry names its poles so
       the editor can label a slider and the interface can say which end a
       position is at; the numbers themselves are authored in content.

       `ownership` became `economic` and `closure` became `trade`, because a
       signed axis needs a name that reads in both directions: "ownership
       -0.75" says nothing, "economic -0.75" says left. `authority` is new
       and had no categorical equivalent — nothing in the old four
       distinguished a party that wants the state to decide from one that
       wants nobody to. */
    /* `low`/`high` are the engine's pole names, for the editor and the
       tooltips. `says` is the same position AS POLICY, which is what prose
       uses (PROSE.md: "closed trade" is the shorthand leaking out):
       a party at the low end of `trade` supports limits on trade with Earth.
       `topic` is what the axis is about, for a party that holds the centre.
       A pole whose `verb` is "opposes" is stated as opposition to the other
       pole's policy. */
    axes: { economic:    { min:-1, max:1, low:"public",         high:"private", topic:"ownership",
                           says:{ low:"public ownership of essential systems", high:"private ownership" } },
            authority:   { min:-1, max:1, low:"liberal",        high:"authoritarian", topic:"the powers of the state",
                           says:{ low:"civil liberties", high:"a stronger state" } },
            personhood:  { min:-1, max:1, low:"restrictionist", high:"expansionist", topic:"legal personhood",
                           says:{ low:"extending legal personhood", high:"extending legal personhood" }, verb:{ low:"opposes" } },
            sovereignty: { min:-1, max:1, low:"station",        high:"federal", topic:"the federation's powers",
                           says:{ low:"more self-government for the stations", high:"a stronger federal government" } },
            trade:       { min:-1, max:1, low:"closurist",      high:"integrationist", topic:"trade with Earth",
                           says:{ low:"limits on trade with Earth", high:"open trade with Earth" } } },
    /* A FORUM RESOLUTION'S LIFE (design/43): drafted in content, tabled for
       the forum's next sitting, decided there, or withdrawn before it. */
    resolutionStatuses: ["draft","tabled","adopted","rejected","withdrawn"],
    resolutionActions: ["table","withdraw","for","against","abstain"],
    economyKeys: ["participation","trade","private",
                  "credibility","expected","inflation","shock","fx","reserves","rate"],
    /* what a condition may read: the productive economy's three, the Bank's
       readings, and `debt` and `balance` as per cent of output, `gap` as per
       cent of potential, `overshoot` as inflation less the remit's target,
       `arrears` as what went unpaid and `headroom` as what the bill tender
       will still take, both in dollars */
    economyReadings: ["participation","trade","private",
                      "inflation","expected","overshoot","rate","fx","gap","growth",
                      "credibility","reserves","debt","balance","arrears","headroom"],
    bands: ["ring","far","middle","low","external"],
    stationTypes: ["single","bundled","external"],
    stationForms: ["cylinder","torus","drum","sphere","cluster","yard","surface"],
    stanceForms: ["for","against","abstain","count","percent","free"],
    palettes: ["registry","newsprint","broadcast","deck"],
    banners: ["neutrality","single","protected","stub","contested","cleanup","orphan"],
    cxCategories: ["Institutions","Constitutional theory","Elections","Legislation",
                   "Personhood","History","Economy","Parties","Stations","Persons"]
  }
};
/* REACHABLE FROM BOTH SIDES. `const SCHEMA` at the top level of a classic
   script shares the global lexical environment in a browser, so the rest of
   the game sees it -- but jsdom evaluates each script separately and those
   bindings do not cross, so in `npm run ui` and `npm run ux` SCHEMA was
   simply undefined. The Concordance guards on `typeof SCHEMA !== "undefined"`
   and fell back to printing raw co-ordinates, which meant the harness was
   measuring an interface no player has ever seen: every party article showed
   "economic: -0.75" under test and "strongly public" in Chromium. The module
   already made itself reachable to Node; this is the same courtesy to the
   window, and it makes the two environments agree. */
/* One validation policy, consumed by the lint and editor. It checks authored
   references against the supplied campaign view or editable model, never
   against a second list maintained by the interface. */
SCHEMA.conditionIssues = function (w, label = "condition") {
  const out = [];
  const go = (v, path, required) => {
    if (!v || typeof v !== "object" || Array.isArray(v) || (required && !Object.keys(v).length)) {
      out.push(path + " needs a nonempty condition block"); return;
    }
    Object.keys(v).forEach(k => {
      if (!SCHEMA.conditions[k]) out.push(path + " names unknown condition " + k);
      if (k !== "anyOf") return;
      if (!Array.isArray(v[k]) || !v[k].length) out.push(path + ".anyOf needs a nonempty list of condition blocks");
      else v[k].forEach((branch, i) => go(branch, path + ".anyOf[" + i + "]", true));
    });
  };
  go(w, label, false);
  return out;
};

SCHEMA.matterIssues = function (m, C) {
  const out = [], list = k => C[k] || [], has = (k, id) => list(k).some(x => x.id === id);
  const bad = message => out.push((m.id || "matter") + ": " + message);
  const object = v => v && typeof v === "object" && !Array.isArray(v);
  const condition = (v, label, required) => {
    if (v == null && !required) return;
    if (!object(v) || !Object.keys(v).length) { bad(label + " needs a condition"); return; }
    SCHEMA.conditionIssues(v, label).forEach(bad);
  };
  if (!m.id) bad("missing id");
  if (!has("cabinet", m.owner)) bad("unknown owner post " + m.owner);
  condition(m.raise, "raise", true); condition(m.settled, "settled", true);
  const due = m.due;
  if (typeof due === "number") {
    if (!Number.isInteger(due) || due < 0) bad("due must be a nonnegative number of sittings");
  } else if (object(due) && ("after" in due || "when" in due)) {
    if (due.after != null && (!Number.isInteger(due.after) || due.after < 0)) bad("invalid due.after");
    if (due.after == null && due.when == null) bad("empty due");
    condition(due.when, "due.when", false);
  } else condition(due, "due", true);
  if (m.grace != null && (!Number.isInteger(m.grace) || m.grace < 1)) bad("grace must be positive sittings");
  if (m.recurs != null && typeof m.recurs !== "boolean") bad("recurs must be boolean");
  if (!Array.isArray(m.figures)) bad("figures must be a list");
  else m.figures.forEach(f => {
    const d = typeof f === "string" ? ((C.setup || {}).readouts || {})[f] : f;
    if (!object(d) || !d.source || !Array.isArray(d.bands) || !d.bands.length)
      bad("figure needs a source and word bands");
    else d.bands.forEach(b => {
      if (!object(b) || typeof b.text !== "string" ||
          (b.min != null && typeof b.min !== "number" && !/^setup\./.test(b.min))) bad("invalid figure band");
    });
  });
  const ids = new Set();
  if (!Array.isArray(m.remedies)) bad("remedies must be a list");
  (Array.isArray(m.remedies) ? m.remedies : []).forEach(r => {
    if (!object(r)) { bad("invalid remedy row"); return; }
    if (!r.id || ids.has(r.id)) bad("missing or duplicate remedy id " + r.id);
    ids.add(r.id);
    if ("label" in r && (typeof r.label !== "string" || !r.label.trim())) bad("invalid remedy label " + r.id);
    if (!Number.isInteger(r.takes) || r.takes < 0) bad("invalid remedy duration " + r.id);
    const t = r.target || {}, kind = SCHEMA.matter.targets[t.kind];
    if (!kind) { bad("unknown remedy kind " + t.kind); return; }
    if (t.kind === "money") {
      if (!((C.setup || {}).lenders || {})[t.id]) bad("unknown lender " + t.id);
      if (t.amount !== "utilisation" && (!Number.isFinite(t.amount) || t.amount <= 0)) bad("invalid money amount");
    } else if (!has(kind, t.id)) bad("unknown " + t.kind + " " + t.id);
    if (t.kind === "initiative") {
      const i = list("initiatives").find(x => x.id === t.id), tempo = t.tempo == null ? 0 : t.tempo;
      if (!Number.isInteger(tempo) || tempo < 0 || !i || !(i.tempo || [])[tempo]) bad("invalid initiative tempo");
      else if (r.takes !== (i.tempo[tempo].after || 3)) bad("remedy duration differs from its initiative tempo");
    }
  });
  if (m.counsel != null && !Array.isArray(m.counsel)) bad("counsel must be a list");
  (Array.isArray(m.counsel) ? m.counsel : []).forEach(c => {
    if (!object(c)) { bad("invalid counsel row"); return; }
    if (!has("cabinet", c.post)) bad("unknown counsel post " + c.post);
    if (!ids.has(c.remedy)) bad("counsel names missing remedy " + c.remedy);
  });
  const late = list("events").find(e => e.id === m.late), page = list("events").find(e => e.id === m.page);
  if (!late || late.setpiece || !(late.choices || []).length) bad("late must name a plain decision with choices");
  if (!page || !page.queuedOnly || !page.setpiece || (page.choices || []).length)
    bad("page must name a queued-only setpiece without choices");
  return out;
};

if (typeof module !== "undefined") module.exports = SCHEMA;
if (typeof window !== "undefined") window.SCHEMA = SCHEMA;
