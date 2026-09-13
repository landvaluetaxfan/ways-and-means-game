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
       price. / capital. — so the editor offers one picker rather than
       five near-identical verbs. See js/engine.js EFFECTS.move. */
    move:        { label:"Move a number", args:[
                   {k:"key",   type:"enum", src:"moveTargets", label:"Target"},
                   {k:"delta", type:"int",  label:"Change", hint:"+ or −"}],
                   shape:"keyed" },
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
                   {k:"delta", type:"int", label:"After N sittings", def:1}],
                   shape:"queue" },
    /* Seats move only by these. A district count is derived from the roll,
       so writing one directly is refused by the engine. */
    cross:       { label:"Cross the floor", args:[
                   {k:"constituency", type:"enum", src:"constituencies", label:"Constituency"},
                   {k:"from", type:"enum", src:"parties", label:"From"},
                   {k:"to", type:"enum", src:"parties", label:"To"},
                   {k:"seats", type:"int", label:"Seats", def:1}], shape:"list" },
    vacate_seat: { label:"Vacate a seat", args:[
                   {k:"constituency", type:"enum", src:"constituencies", label:"Constituency"},
                   {k:"party", type:"enum", src:"parties", label:"Held by"},
                   {k:"why", type:"text", label:"Reason"}], shape:"list" },
    election:    { label:"Hold a general election", args:[
                   {k:"value", type:"bool", label:"Dissolve"}], shape:"scalarVal" }
  },

  /* ---------- condition keys ---------- */
  conditions: {
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
    priceAbove:     { label:"Price above",             form:"map", src:"prices", vtype:"int" },
    priceBelow:     { label:"Price below",             form:"map", src:"prices", vtype:"int" },
    capitalAbove:   { label:"Debt above",              form:"map", src:"parties", vtype:"int" },
    capitalBelow:   { label:"Debt below",              form:"map", src:"parties", vtype:"int" },
    slotsLeft:      { label:"Order-paper slots left",  form:"int" },
    chapterIs:      { label:"Chapter is",              form:"int" },
    chapterAtLeast: { label:"Chapter is at least",      form:"int" },
    inGovernment:   { label:"In government",            form:"bool" }
  },

  /* ---------- enumerations the forms draw from ---------- */
  vocab: {
    scalars: ["party_loyalty","public_standing","consumables","thermal_margin","treasury"],
    laws: ["divergence_threshold_hours","civic_clock_minimum","suspension_debt_accrual","substrate_public_share",
           "shed_order_authority","tier_ratio_district","tier_ratio_list","threshold_pct"],
    tiers: ["district","list","functional"],
    prices: ["thermal","substrate","volume","transit"],
    stationFields: ["closure","suspended","attested","population","seats"],
    billFields: ["stage","dead"],
    billStages: ["drafting","first_reading","second_reading","committee","lords",
                 "blocked","withdrawn","passed","defeated"],
    axes: { ownership:["public","private"], personhood:["expansionist","restrictionist"],
            sovereignty:["federal","station"], closure:["closurist","integrationist"] },
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
if (typeof module !== "undefined") module.exports = SCHEMA;
