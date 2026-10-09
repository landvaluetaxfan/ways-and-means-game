/* =============================================================
   TUTORIAL TEST (design/77, js/tutorial.js). Boots the real Flash I with the tutorial on and asserts the card:
   it shows the first eligible step on its tab, waits on any other tab, records what has been taught in the
   player's options and does not repeat it, can be skipped, replayed and dismissed with Esc, survives a
   re-render, and every step the campaign carries names a region that exists, on the tab it says.

   jsdom has no layout, so the elements report a fixed box; what is asserted is the logic and the DOM, and the
   look is for `npm run layout` and the author's eyes. Every assertion was broken once to watch it fail.
   ============================================================= */
process.env.HARNESS_REAL = "1"; process.env.TUTORIAL = "1";
const H = require("./harness.js");
const { w, ok } = H;
const q = s => w.document.querySelector(s);
const tick = () => new Promise(r => w.setTimeout(r, 20));

(async () => {
  w.eval(`Element.prototype.getBoundingClientRect = function () { return { left: 40, top: 40, right: 340, bottom: 140, width: 300, height: 100, x: 40, y: 40 }; };
          Object.defineProperty(document.documentElement, "clientWidth", { value: 1366, configurable: true });
          Object.defineProperty(document.documentElement, "clientHeight", { value: 768, configurable: true });`);
  H.boot(); H.newGame();
  w.eval("Shell.setOpt('motion', false); Shell.setOpt('tutorial', 'on'); Shell.setOpt('taught', '')");
  /* two synthetic steps, so the logic is tested apart from whatever Act I teaches */
  const S = w.eval("UI.content().setup");
  const real = S.tutorial || [];
  S.tutorial = [
    { id: "t_a", onTab: "gov", region: "order-paper-time", title: "First lesson", body: "This is the first lesson." },
    { id: "t_b", onTab: "gov", region: "order-paper-time", when: { seen: ["t_gate"] }, title: "Second lesson", body: "This is the second." }];
  const card = () => q("#tut.on .tut-card");
  const title = () => (card() ? card().querySelector("h3").textContent : null);

  w.eval("UI.openTab('sit')"); await tick();
  ok("a step for another tab waits, and shows nothing", !card());
  w.eval("UI.openTab('gov')"); await tick();
  ok("the first eligible step shows on its tab, with its title and body", title() === "First lesson" &&
     card().querySelector(".tut-body").textContent === "This is the first lesson.", String(title()));
  ok("the dim is four blocks around a hole, and the card is not among them", q("#tut").querySelectorAll(".tut-block").length === 4 && !!q("#tut .tut-hole"));
  w.eval("UI.openTab('cham')"); await tick();
  ok("it waits when the player leaves the tab", !card());
  w.eval("UI.openTab('gov')"); await tick();
  ok("and comes back with the tab", title() === "First lesson");
  w.eval("UI.redraw()"); await tick();
  ok("a re-render does not lose or double the card", title() === "First lesson" && w.document.querySelectorAll("#tut .tut-card").length === 1);

  q('#tut [data-tut="ok"]').click(); await tick();
  ok("Got it dismisses it", !card());
  ok("and records it in the player's options", /t_a/.test(w.eval("Shell.options.taught")), w.eval("Shell.options.taught"));
  ok("the second step waits for its condition", !card());
  w.eval("UI.state().seen.t_gate = 1; UI.redraw()"); await tick();
  ok("and shows when the condition holds", title() === "Second lesson", String(title()));
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await tick();
  ok("Escape dismisses it", !card() && /t_b/.test(w.eval("Shell.options.taught")));
  w.eval("UI.boot(Engine.load(Engine.save(UI.state()), UI.content()), UI.content())"); await tick();
  ok("a loaded game does not teach again what has been taught", !card());

  w.eval("Shell.setOpt('taught', ''); Tutorial.refresh()"); await tick();
  q('#tut [data-tut="skip"]').click(); await tick();
  ok("Skip the tutorial puts it off", !card() && w.eval("Shell.options.tutorial") === "off");
  w.eval("UI.redraw()"); await tick();
  ok("and off shows nothing", !card());
  w.eval("Tutorial.replay()"); await tick();
  ok("Replay puts it on and gives the lessons again", title() === "First lesson" && w.eval("Shell.options.tutorial") === "on");
  w.eval("window.__NO_TUTORIAL = true; Tutorial.refresh()"); await tick();
  ok("the harness switch keeps it silent", !card());
  w.eval("window.__NO_TUTORIAL = false");
  w.eval("UI.state().flags.sandbox = true; Tutorial.refresh()"); await tick();
  ok("the author's bench never teaches", !card());
  w.eval("delete UI.state().flags.sandbox");

  /* the steps the campaign carries */
  S.tutorial = real;
  const R = w.eval("Tutorial.REGIONS");
  ok("the campaign carries tutorial steps", real.length >= 5, real.length + "");
  ok("every step has an id, a title and a body, and the ids are unique",
     real.every(s => s.id && s.title && s.body) && new Set(real.map(s => s.id)).size === real.length);
  ok("every step names a region that exists, on the tab it says", real.every(s => R[s.region] && s.onTab === R[s.region].tab),
     real.filter(s => !(R[s.region] && s.onTab === R[s.region].tab)).map(s => s.id).join(", "));
  const E = w.eval("Engine");
  ok("every step's condition is in the vocabulary", real.every(s => !s.when || Object.keys(s.when).every(k => E.CONDITIONS ? !!E.CONDITIONS[k] : true)));
  /* Catch an absent Promises lesson, a region that lights unrelated business, or a card shown before a promise.
     Reach the first undertaking through lawful Act I sitting answers, without injecting a tutorial step. */
  w.eval("Shell.setOpt('taught', UI.content().setup.tutorial.filter(s => s.id !== 'owed').map(s => s.id).join(',')); UI.openTab('sit'); Tutorial.refresh()");
  await tick();
  ok("Promises waits while the government has given no undertaking", !card());
  w.eval(`(function () {
    const C = UI.content(), st = UI.state();
    st.flags._introRead = true; st.flags._act1 = true;
    for (let n = 0; n < 10 && !Engine.outstanding(st).length; n++) {
      Engine.playSitting(st, C, () => 0);
      if (!Engine.outstanding(st).length) Engine.advance(st, C);
    }
    UI.boot(st, C); UI.openTab('sit');
  })()`);
  await tick();
  const promise = E.outstanding(w.eval("UI.state()"))[0];
  const promiseRow = '#sit-today [data-obligation="owed"], #sit-docket .dk.owed';
  ok("the legal Act I path gives a promise shown in Coming up", !!promise && !!q('#sit-docket .dk.owed'),
    "sitting " + w.eval("UI.state().sitting") + "; " + [...q("#sitting-body").querySelectorAll("button")].map(b => b.textContent.trim()).join(" / "));
  const owedShown = () => w.eval("Tutorial.shown() && Tutorial.shown().id === 'owed'");
  ok("the first promise shows the campaign's Promises card", !!owedShown());
  ok("Promises lights the promise row and its way to keep it", !!owedShown() &&
    w.eval(`Tutorial.shown().el.matches(${JSON.stringify(promiseRow)})`) &&
    w.eval("Tutorial.shown().el.textContent").includes(promise && promise.text));
  w.eval("UI.redraw()"); await tick();
  ok("Promises follows the replacement row after a redraw", !!owedShown() &&
    w.eval("document.contains(Tutorial.shown().el)") && w.document.querySelectorAll("#tut.on .tut-card").length === 1);
  w.eval("UI.openTab('gov')"); await tick();
  ok("Promises waits on another tab", !card());
  w.eval("UI.openTab('sit')"); await tick();
  ok("Promises returns with the Owed list", !!owedShown());
  if (owedShown()) q('#tut [data-tut="ok"]').click();
  await tick();
  ok("dismissing Promises records it in player preferences", w.eval("Tutorial.taught().includes('owed')") && !card());
  w.eval("UI.boot(Engine.load(Engine.save(UI.state()), UI.content()), UI.content()); UI.openTab('sit')"); await tick();
  ok("loading the promised run does not repeat Promises", !card());
  w.eval("Tutorial.replay('owed')"); await tick();
  ok("Options can replay Promises while its row exists", !!owedShown());
  w.eval(`(function () {
    const st = UI.state(), C = UI.content();
    for (let n = 0; n < 8 && !document.querySelector('#sit-today [data-obligation="owed"]'); n++) {
      Engine.advance(st, C); UI.redraw();
    }
  })()`);
  await tick();
  ok("Promises follows the approaching deadline into Owed", !!owedShown() &&
    w.eval("Tutorial.shown().el.matches('#sit-today [data-obligation=owed]')") && !q('#sit-docket .dk.owed'));
  if (promise) w.eval(`UI.state().undertakings.find(u => u.id === ${JSON.stringify(promise.id)}).state = 'kept'; UI.redraw()`);
  await tick();
  ok("Promises waits when only other business remains", !card() && !q(promiseRow));
  if (promise) w.eval(`UI.state().undertakings.find(u => u.id === ${JSON.stringify(promise.id)}).state = 'open'; UI.redraw()`);
  await tick();
  ok("an untaught Promises card returns when its promise is visible again", !!owedShown());
  /* each region resolves on its tab in a booted game: the estimates are opened for the two that need a bill */
  const tabs = {};
  Object.keys(R).forEach(n => { (tabs[R[n].tab] = tabs[R[n].tab] || []).push(n); });
  w.eval("UI.state().seen.a1_order_paper = 1; UI.redraw(); Shell.setOpt('tutorial','off')");
  for (const tab of Object.keys(tabs)) {
    w.eval(`UI.openTab(${JSON.stringify(tab)})`);
    if (tab === "cham") { const row = q('#cham-bills tr[data-bill="appropriation"]'); if (row) row.click(); }
    await tick();
    tabs[tab].forEach(n => ok("the region " + n + " resolves on the " + tab + " tab", !!q("#s-" + tab + " " + R[n].sel)));
  }
  H.finish("the tutorial is healthy");
})();
