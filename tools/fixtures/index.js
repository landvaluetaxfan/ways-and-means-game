/* Test-only content views. Neither page loads this module. */
"use strict";
var EngineFixture = (function () {
  const node = typeof module !== "undefined" && module.exports;
  const profiles = node ? {
    engine: require("./engine-data.js"), interface: require("./interface-data.js")
  } : {engine:EngineFixtureDataEngine, interface:EngineFixtureDataInterface};
  const kinds = ["events","bills","instruments","initiatives","matters","settlements",
    "achievements","business","minutes","resolutions"];
  function copy(v) {
    if (Array.isArray(v)) return v.map(copy);
    if (v && typeof v === "object") {
      const out = {};
      Object.keys(v).forEach(k => {out[k] = copy(v[k]);});
      return out;
    }
    return v;
  }
  function build(referenceContent, profile) {
    if (!Object.prototype.hasOwnProperty.call(profiles,profile))
      throw new Error("unknown fixture profile: "+profile);
    const data = profiles[profile]();
    const model = Object.assign(copy(referenceContent), data.story, {
      setup:data.setup, administrations:data.administrations, sandbox:data.sandbox
    });
    return referenceContent.forCampaign.call(model,{id:"world"});
  }
  function fingerprint(value) {
    if (!node) throw new Error("fixture fingerprint is a Node-only contract helper");
    return require("node:crypto").createHash("sha256").update(JSON.stringify(value,
      (_k,v) => typeof v === "function" ? {fixtureFunction:String(v)} : v)).digest("hex");
  }
  return {build, kinds, fingerprint};
})();
if (typeof module !== "undefined") module.exports = EngineFixture;
