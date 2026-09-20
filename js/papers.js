/* =============================================================
   PAPERS — the register.

   Government is where you DECIDE: order paper, forecasts, the whip,
   the ledger. Papers is where you READ what you did. Splitting them
   this way keeps the whip panel next to the ledger it spends, which
   §12.1 requires, while giving the in-world artifacts a surface of
   their own.

   §12.2's split visual language lives here. The terminal chrome is
   government-issue plain; a signed act is beautiful, because a state
   printing office has a two-hundred-year-old house style.

   THE VISUAL ASYMMETRY IS THE TEACHING DEVICE. An act that needed
   more than a simple majority gets the signature drawn, once, and
   cannot be undone. An instrument gets a made stamp: dated, numbered,
   no ceremony — and it can be revoked. The player learns which acts
   are permanent by which ones are ceremonious.
   ============================================================= */

const Papers = (function () {
  "use strict";

  let st, C, drawn = {}, onChange = null;

  /* THE REGISTER'S SELECTION LIVES IN Focus, not here. It used to be a
     closure variable, which worked and was also the third of four
     different places the game kept "which row is chosen" - see the
     header of js/focus.js. One store, so a re-render can put the player
     back where they were. */
  Focus.region("pp-list", {
    rows: "tr[data-doc]",
    key: tr => tr.dataset.doc,
    activate: () => render(st, C)
  });
  /* THE BENCH (design/30). An actor, so no new state shape and no new verb:
     its standing is its disposition toward the government, moved by whether
     references are answered and rulings complied with. A case is a queued
     event with a label, so the calendar already carries it and this panel
     reads the same queue. */
  function tribunalHTML() {
    const a = (C.actors || []).find(x => x.id === "tribunal");
    if (!a) return `<div class="note">No bench sits in this campaign.</div>`;
    const live = (st.actors || {}).tribunal || {};
    const v = live.standing == null ? a.standing : live.standing;
    const cls = v >= 65 ? "good" : v <= 35 ? "bad" : "";
    const cases = (st.queue || []).filter(q => /^tr_/.test(q.eventId || ""));
    const flight = cases.length
      ? cases.map(q => `<div class="cn"><b>${esc(q.label || "A case")}</b><i>sitting ` +
          `${q.dueSitting}${q.dueSitting > st.sitting
            ? " · " + (q.dueSitting - st.sitting) + " away" : " · today"}</i></div>`).join("")
      : `<div class="note">Nothing is before the bench.</div>`;
    return `<div class="fgn"><div class="fgn-h"><b>Disposition</b>` +
      `<span class="fgn-lag">${v >= 55 ? "reads the government generously"
        : "reads it narrowly"}</span></div>` +
      `<div class="fgn-b"><span class="meter ${cls}"><i style="width:${
        Math.max(0, Math.min(100, v))}%"></i></span><output>${v}</output></div>` +
      `<div class="note">Wants: ${esc(a.asks || "a reference answered")}.</div></div>` +
      `<div class="rulehead">Before the bench</div>` + flight;
  }

  const chosen = () => Focus.selected("pp-list");

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- what is in the register ---------- */

  function items() {
    const out = [];

    C.bills.forEach(b => {
      const bs = st.bills[b.id];
      if (["assented", "struck", "referred", "awaiting_assent", "defeated"].includes(bs.stage))
        out.push({
          kind: "act", id: "act_" + b.id, bill: b, state: bs,
          title: b.title.replace(/ Bill$/, " Act"),
          ref: b.ref, at: bs.assentedAt || bs.carriedAt || 0,
          status: bs.stage
        });
    });

    (C.instruments || []).forEach(si => {
      const s = st.instruments[si.id];
      if (!s.made) return;
      out.push({
        kind: "instrument", id: si.id, si: si, state: s,
        title: si.title, ref: si.number, at: s.madeAt || 0,
        status: s.revoked ? "revoked" : s.inForce ? "in force" : "made"
      });
    });

    (C.minutes || []).forEach(m => {
      if (m.when && !Engine.matches(st, m.when)) return;
      out.push({ kind: "minute", id: m.id, minute: m, title: m.subject,
                 ref: m.file, at: m.sitting || 0, status: "minute" });
    });

    return out.sort((a, b) => b.at - a.at);
  }

  /* ---------- documents ---------- */

  const crest = `<svg class="crest" width="46" height="52" viewBox="0 0 46 52" aria-hidden="true">
    <circle cx="23" cy="23" r="12" fill="none" stroke="#17140e" stroke-width="1.2"/>
    <ellipse cx="23" cy="23" rx="21" ry="8" fill="none" stroke="#17140e" stroke-width="1.2"/>
    <ellipse cx="23" cy="23" rx="21" ry="8" fill="none" stroke="#17140e" stroke-width="1.2" transform="rotate(58 23 23)"/>
    <circle cx="23" cy="23" r="3.4" fill="#17140e"/>
    <path d="M6 45 h34" stroke="#17140e" stroke-width="1.2"/>
    <path d="M9 49 h28" stroke="#17140e" stroke-width="0.8"/></svg>`;

  function head(office, sub, file, right) {
    return `<div class="letterhead">${crest}<div class="lh-txt">
        <h3>${esc(office)}</h3><p>${esc(sub)}</p></div></div>
      <div class="filebar"><span>${esc(file)}</span>
        <span>SESSION ${st.session} &middot; SITTING ${st.sitting}</span>
        <span>${esc(right)}</span></div>`;
  }

  /* The Prime Minister's hand. ONE continuous path (the breve over the capital
     is a final subpath) because the ceremony draws it with a single
     stroke-dashoffset sweep — css/terminal.css .sig-armed/.sig-draw, bible 12.10.
     Length is measured at run time with getTotalLength(), so the path can be
     redrawn freely; the only constraint is that it stays a single <path>.
     NOTE: these are space-separated coordinate pairs. If you re-wrap this
     string, keep the spaces at the line joins or the numbers fuse. */
  /* Traced from the scanned signature and then smoothed. The scan is not in
     the repo, so this path is the source of truth and the one place it is
     edited by hand; tools/tracesig.js applies the same smoothing to a fresh
     trace, so regenerating from a new scan does not bring the jitter back.
     Centreline, one <path>, because the ceremony draws it with a single
     stroke-dashoffset sweep. */
  /* Traced from img/signature.png by tools/tracesig.js, cropped to the ink and
     smoothed. ONE <path> of many subpaths; js/setpiece.js splits it into
     one path per stroke so the introduction can write it left to right.
     Regenerate rather than editing by hand. */
  /* Traced from img/signature.png by tools/tracesig.js, cropped to the ink and
     smoothed. ONE <path> of many subpaths; js/setpiece.js splits it into
     one path per stroke so the introduction can write it left to right.
     Regenerate rather than editing by hand. */
  /* Traced from img/signature.png by tools/tracesig.js, cropped to the ink and
     smoothed. ONE <path> of many subpaths; js/setpiece.js splits it into
     one path per stroke so the introduction can write it left to right.
     Regenerate rather than editing by hand. */
  /* Traced from img/signature.png by tools/tracesig.js, cropped to the ink and
     smoothed. ONE <path> of many subpaths; js/setpiece.js splits it into
     one path per stroke so the introduction can write it left to right.
     Regenerate rather than editing by hand. */
  const SIG_BOX = { w: 228, h: 131 };
  const SIG_PATH =
    "M3.0 106.9C3.4 106.8,5.4 106.4,6.0 106.2C6.6 106.0,8.0 105.6,8.4 105.4C8.9 105.2,9.8 104.7" +
    ",10.1 104.5C10.5 104.3,11.0 103.8,11.3 103.7C11.5 103.5,12.0 103.1,12.2 102.9C12.4 102.8,1" +
    "2.8 102.4,13.0 102.3C13.2 102.1,13.7 101.7,14.0 101.5C14.2 101.3,14.7 100.9,15.0 100.7C15." +
    "2 100.5,15.7 100.0,16.0 99.7C16.3 99.5,16.9 98.9,17.2 98.7C17.4 98.4,18.2 97.8,18.5 97.6C1" +
    "8.8 97.3,19.7 96.6,20.0 96.3C20.4 96.1,21.2 95.4,21.5 95.1C21.8 94.9,22.5 94.3,22.8 94.1C2" +
    "3.0 93.9,23.5 93.5,23.8 93.3C24.0 93.1,24.4 92.7,24.6 92.5C24.7 92.4,25.1 92.0,25.3 91.8C2" +
    "5.5 91.7,26.0 91.3,26.2 91.1C26.5 91.0,27.0 90.6,27.3 90.5C27.6 90.3,28.4 89.9,28.7 89.7C2" +
    "9.1 89.5,29.9 88.9,30.2 88.6C30.6 88.4,31.3 87.6,31.6 87.3C31.9 87.0,32.5 86.2,32.7 85.9C3" +
    "3.0 85.5,33.5 84.8,33.8 84.5C34.0 84.2,34.6 83.6,34.8 83.4C35.0 83.2,35.6 82.7,35.9 82.5C3" +
    "6.1 82.3,36.6 81.9,36.9 81.7C37.1 81.5,37.7 81.0,37.9 80.8C38.1 80.6,38.7 80.0,38.9 79.7C3" +
    "9.2 79.5,39.8 78.9,40.0 78.6C40.3 78.3,40.9 77.8,41.2 77.5C41.5 77.2,42.2 76.7,42.5 76.4C4" +
    "2.8 76.1,43.7 75.4,44.0 75.1C44.4 74.8,45.3 74.1,45.7 73.8C46.0 73.5,46.8 72.8,47.1 72.6C4" +
    "7.4 72.3,48.0 71.8,48.3 71.6C48.5 71.4,48.9 71.0,49.1 70.8C49.3 70.6,49.7 70.2,49.9 70.0C5" +
    "0.1 69.8,50.6 69.3,50.9 69.1C51.2 68.9,51.9 68.2,52.2 67.9C52.5 67.7,53.4 66.9,53.7 66.6C5" +
    "4.0 66.3,54.8 65.5,55.1 65.2C55.3 64.9,55.9 64.2,56.2 64.0C56.4 63.7,57.0 63.2,57.2 62.9C5" +
    "7.5 62.7,58.0 62.2,58.3 62.0C58.6 61.8,59.1 61.3,59.4 61.1C59.6 60.9,60.1 60.4,60.3 60.2C6" +
    "0.6 59.9,61.1 59.4,61.4 59.1C61.7 58.8,62.4 58.1,62.7 57.8C63.0 57.4,63.9 56.6,64.2 56.3C6" +
    "4.6 56.0,65.4 55.3,65.7 55.0C66.1 54.7,66.7 54.1,67.0 53.8C67.3 53.6,67.9 53.0,68.1 52.7C6" +
    "8.4 52.4,68.9 51.8,69.2 51.5C69.4 51.2,70.0 50.6,70.3 50.3C70.5 50.0,71.1 49.3,71.4 49.0C7" +
    "1.7 48.8,72.4 48.1,72.6 47.9C72.9 47.6,73.6 47.0,73.8 46.8C74.1 46.5,74.7 45.9,75.0 45.7C7" +
    "5.2 45.4,75.8 44.7,76.1 44.4C76.4 44.0,77.1 43.1,77.5 42.7C77.8 42.3,78.7 41.2,79.2 40.7C7" +
    "9.6 40.2,80.6 38.9,81.0 38.5C81.5 38.0,82.4 36.9,82.7 36.5C83.1 36.1,83.8 35.3,84.2 34.9C8" +
    "4.5 34.6,85.2 33.8,85.5 33.5C85.9 33.1,86.7 32.3,87.0 31.9C87.4 31.5,88.2 30.5,88.6 30.1C8" +
    "8.9 29.7,89.6 28.9,89.9 28.5C90.3 28.1,90.9 27.2,91.2 26.8C91.6 26.4,92.3 25.3,92.6 24.9C9" +
    "3.0 24.4,93.9 23.2,94.2 22.7C94.6 22.1,95.5 20.9,95.9 20.3C96.3 19.8,97.2 18.5,97.5 18.0C9" +
    "7.9 17.5,98.7 16.2,99.0 15.7C99.3 15.1,100.0 13.9,100.3 13.5C100.6 13.0,101.1 12.0,101.3 1" +
    "1.7C101.5 11.3,101.9 10.7,102.0 10.4C102.2 10.1,102.4 9.6,102.5 9.4C102.6 9.1,102.8 8.6,10" +
    "2.8 8.3C102.8 8.0,102.8 7.2,102.7 6.9C102.6 6.6,102.4 5.9,102.2 5.7C102.0 5.4,101.5 5.0,10" +
    "1.3 4.9C101.0 4.8,100.4 4.9,100.1 4.9C99.8 5.0,99.1 5.3,98.7 5.4C98.4 5.5,97.6 5.9,97.3 6." +
    "1C96.9 6.3,96.1 6.7,95.7 6.9C95.3 7.0,94.5 7.5,94.1 7.7C93.8 7.8,93.0 8.3,92.7 8.5C92.3 8." +
    "6,91.7 9.1,91.4 9.3C91.1 9.4,90.5 9.9,90.3 10.1C90.1 10.2,89.7 10.7,89.5 10.8C89.3 11.0,88" +
    ".9 11.4,88.7 11.6C88.6 11.7,88.2 12.1,88.0 12.3C87.8 12.4,87.3 12.8,87.1 13.0C86.9 13.2,86" +
    ".4 13.6,86.2 13.8C86.0 14.0,85.6 14.4,85.4 14.6C85.2 14.8,84.8 15.2,84.7 15.4C84.5 15.6,84" +
    ".1 15.9,83.9 16.1C83.7 16.3,83.3 16.6,83.2 16.8C83.0 16.9,82.6 17.3,82.5 17.4C82.3 17.5,82" +
    ".0 17.8,81.8 17.9C81.6 18.0,81.3 18.3,81.1 18.4C81.0 18.6,80.6 18.9,80.4 19.1C80.3 19.3,79" +
    ".9 19.7,79.7 19.9C79.5 20.2,78.9 20.8,78.6 21.1C78.3 21.4,77.5 22.3,77.1 22.6C76.8 23.0,75" +
    ".8 24.0,75.3 24.5C74.9 24.9,73.9 25.9,73.5 26.3C73.1 26.7,72.3 27.5,72.0 27.9C71.6 28.2,70" +
    ".9 28.9,70.7 29.2C70.4 29.5,69.9 30.1,69.7 30.4C69.5 30.7,69.1 31.3,68.9 31.5C68.7 31.7,68" +
    ".4 32.2,68.2 32.5C68.0 32.7,67.5 33.2,67.2 33.5C66.9 33.7,66.2 34.4,65.8 34.8C65.4 35.2,64" +
    ".4 36.2,64.0 36.6C63.6 37.1,62.5 38.2,62.1 38.7C61.6 39.3,60.6 40.4,60.2 40.9C59.8 41.4,59" +
    ".0 42.5,58.6 42.9C58.2 43.4,57.5 44.4,57.2 44.7C56.9 45.1,56.2 45.9,56.0 46.3C55.7 46.6,55" +
    ".2 47.2,55.0 47.5C54.8 47.7,54.4 48.2,54.3 48.4C54.1 48.6,53.7 49.0,53.5 49.2C53.4 49.4,53" +
    ".0 49.8,52.8 50.0C52.7 50.2,52.3 50.7,52.1 51.0C51.9 51.2,51.5 51.8,51.3 52.1C51.1 52.4,50" +
    ".5 53.1,50.3 53.4C50.1 53.7,49.5 54.5,49.3 54.8C49.1 55.1,48.5 55.8,48.3 56.1C48.1 56.4,47" +
    ".6 57.1,47.3 57.4C47.1 57.6,46.6 58.3,46.4 58.6C46.1 58.9,45.6 59.6,45.4 59.9C45.2 60.1,44" +
    ".7 60.7,44.5 60.9C44.3 61.1,43.9 61.6,43.7 61.8C43.5 62.1,43.0 62.6,42.8 62.8C42.6 63.1,42" +
    ".1 63.7,41.9 64.0C41.7 64.2,41.3 64.9,41.2 65.2C41.0 65.5,40.7 66.1,40.6 66.3C40.4 66.6,40" +
    ".1 67.1,39.9 67.4C39.8 67.6,39.4 68.2,39.2 68.5C39.1 68.8,38.7 69.4,38.5 69.7C38.3 70.0,37" +
    ".9 70.6,37.7 71.0C37.5 71.3,37.0 72.1,36.8 72.5C36.6 72.9,36.1 73.8,35.9 74.2C35.7 74.6,35" +
    ".2 75.5,35.1 75.9C34.9 76.3,34.6 77.1,34.5 77.4C34.4 77.7,34.2 78.4,34.2 78.7C34.2 79.0,34" +
    ".3 79.7,34.3 80.0C34.3 80.3,34.4 80.8,34.4 81.0C34.4 81.2,34.3 81.4,34.2 81.4C34.1 81.5,33" +
    ".8 81.5,33.6 81.5C33.5 81.5,33.2 81.7,33.1 81.8C32.9 81.9,32.7 82.3,32.7 82.5C32.6 82.7,32" +
    ".6 83.2,32.6 83.3C32.7 83.5,32.8 83.7,32.9 83.8C33.0 83.9,33.4 83.8,33.4 83.9 M38.0 69.7C3" +
    "8.1 69.5,39.1 68.5,39.3 68.4 M42.1 76.8C42.1 76.7,42.7 76.1,42.8 76.0 M43.1 94.0C43.0 94.1" +
    ",42.7 94.7,42.6 94.9C42.4 95.1,42.1 95.5,41.9 95.7C41.8 95.8,41.3 96.2,41.1 96.3C40.9 96.5" +
    ",40.2 96.8,39.9 96.9C39.6 97.0,38.7 97.2,38.3 97.2C37.9 97.3,36.9 97.3,36.5 97.3C36.1 97.2" +
    ",35.2 97.1,34.9 97.0C34.6 96.9,34.1 96.6,33.8 96.3C33.6 96.1,33.2 95.5,33.0 95.2C32.8 94.8" +
    ",32.4 93.8,32.3 93.4C32.2 92.9,32.1 91.8,32.2 91.3C32.3 90.9,32.8 89.9,33.2 89.6C33.6 89.3" +
    ",34.9 88.8,35.5 88.7C36.2 88.5,38.1 88.3,38.9 88.2C39.7 88.2,41.6 88.1,42.4 88.1C43.2 88.0" +
    ",44.8 88.0,45.4 88.0C46.1 88.0,47.3 87.9,47.9 87.9C48.4 87.9,49.4 87.9,49.9 87.9C50.3 87.9" +
    ",51.4 88.0,51.8 88.1C52.2 88.2,53.1 88.5,53.5 88.6C53.8 88.7,54.6 89.1,54.8 89.2C55.1 89.4" +
    ",55.6 89.7,55.8 89.8C56.0 89.9,56.4 90.0,56.6 90.0C56.7 90.1,57.1 90.0,57.3 90.0C57.5 90.0" +
    ",57.9 89.9,58.1 89.9C58.3 89.9,58.8 89.9,59.1 90.0C59.3 90.0,60.0 90.1,60.3 90.1C60.6 90.1" +
    ",61.3 90.2,61.6 90.2C62.0 90.2,62.7 90.3,63.1 90.3C63.4 90.3,64.1 90.4,64.4 90.5C64.7 90.6" +
    ",65.4 90.9,65.7 91.0C66.1 91.2,67.0 91.6,67.4 91.7C67.9 91.8,69.1 92.1,69.7 92.2C70.2 92.3" +
    ",71.6 92.3,72.2 92.3C72.7 92.3,73.9 92.2,74.3 92.1C74.8 92.0,75.7 91.8,76.1 91.7C76.5 91.5" +
    ",77.2 91.3,77.6 91.2C77.9 91.1,78.7 90.8,79.1 90.7C79.5 90.6,80.4 90.5,80.8 90.4C81.2 90.3" +
    ",82.1 90.2,82.5 90.1C82.8 90.0,83.7 89.9,84.0 89.9C84.3 89.8,85.0 89.7,85.3 89.7C85.6 89.6" +
    ",86.2 89.6,86.4 89.6C86.6 89.6,87.1 89.6,87.2 89.6C87.4 89.6,87.7 89.7,87.9 89.8C88.1 89.9" +
    ",88.5 90.2,88.8 90.3C89.1 90.4,89.9 90.8,90.4 90.9C90.9 91.0,92.2 91.1,92.8 91.2C93.5 91.3" +
    ",95.1 91.3,95.7 91.4C96.3 91.4,97.7 91.6,98.2 91.7C98.7 91.8,99.5 92.2,99.9 92.4C100.2 92." +
    "6,100.7 93.1,100.9 93.3C101.1 93.5,101.5 93.8,101.8 94.0C102.0 94.1,102.5 94.2,102.8 94.3C" +
    "103.1 94.4,103.7 94.4,104.0 94.5C104.3 94.5,104.9 94.6,105.2 94.7C105.5 94.7,106.1 94.9,10" +
    "6.3 95.0C106.6 95.1,107.2 95.4,107.4 95.5C107.7 95.6,108.3 95.8,108.6 95.9C108.8 96.0,109." +
    "5 96.2,109.8 96.3C110.1 96.4,110.8 96.6,111.2 96.7C111.6 96.8,112.7 97.0,113.2 97.1C113.8 " +
    "97.2,115.3 97.5,116.0 97.5C116.7 97.6,118.5 97.9,119.2 98.0C120.0 98.1,121.7 98.3,122.6 98" +
    ".4C123.4 98.4,125.5 98.6,126.5 98.7C127.5 98.8,130.2 99.0,131.4 99.1C132.5 99.2,135.5 99.4" +
    ",136.6 99.5C137.6 99.6,139.9 99.8,140.7 99.9C141.4 100.0,142.6 100.3,143.0 100.4C143.3 100" +
    ".5,143.7 100.9,143.9 101.0C144.0 101.1,144.1 101.5,144.2 101.6C144.3 101.7,144.4 101.8,144" +
    ".4 101.7C144.5 101.7,144.8 101.3,144.9 101.2C145.0 101.0,145.4 100.5,145.6 100.3C145.8 100" +
    ".1,146.3 99.7,146.6 99.5C146.8 99.3,147.5 99.0,147.7 98.8C148.0 98.6,148.8 98.1,149.0 98.0" +
    " M50.7 108.9C50.7 108.8,51.0 108.4,51.1 108.2C51.2 108.0,51.4 107.5,51.5 107.3C51.6 107.1," +
    "51.8 106.5,51.9 106.2C52.0 105.9,52.2 105.2,52.3 104.9C52.4 104.6,52.5 103.8,52.6 103.5C52" +
    ".7 103.1,52.9 102.2,53.0 101.9C53.1 101.5,53.3 100.6,53.4 100.2C53.5 99.9,53.8 99.1,53.9 9" +
    "8.8C54.0 98.5,54.2 97.8,54.3 97.5C54.4 97.2,54.6 96.5,54.7 96.2C54.7 95.9,54.9 95.2,55.0 9" +
    "4.9C55.1 94.6,55.3 93.8,55.3 93.5C55.4 93.1,55.5 92.3,55.5 91.9C55.5 91.5,55.5 90.6,55.4 9" +
    "0.2C55.4 89.9,55.3 89.0,55.3 88.7C55.4 88.4,55.4 87.7,55.5 87.5C55.6 87.2,56.0 86.8,56.2 8" +
    "6.7C56.4 86.5,56.9 86.3,57.1 86.3C57.3 86.2,57.7 86.3,57.9 86.3C58.0 86.4,58.3 86.6,58.4 8" +
    "6.7C58.5 86.9,58.7 87.3,58.8 87.4C58.9 87.6,59.1 87.9,59.1 88.0C59.2 88.1,59.4 88.3,59.5 8" +
    "8.3C59.6 88.3,59.7 88.2,59.8 88.1C59.9 88.0,60.1 87.8,60.2 87.6C60.3 87.5,60.5 87.2,60.6 8" +
    "7.0C60.7 86.9,61.0 86.5,61.1 86.3C61.1 86.2,61.3 85.9,61.4 85.8C61.5 85.6,61.6 85.4,61.7 8" +
    "5.4C61.7 85.3,61.8 85.2,61.8 85.2C61.8 85.2,61.8 85.1,61.8 85.0C61.8 84.9,61.7 84.7,61.7 8" +
    "4.5C61.8 84.3,62.1 83.7,62.3 83.4C62.5 83.1,63.3 82.2,63.6 81.8C64.0 81.3,64.8 80.3,65.2 7" +
    "9.9C65.5 79.5,66.2 78.7,66.4 78.4C66.6 78.0,67.0 77.4,67.2 77.1C67.4 76.9,67.7 76.3,67.8 7" +
    "6.1C67.9 75.9,68.2 75.4,68.4 75.1C68.6 74.9,69.0 74.2,69.2 73.9C69.4 73.6,69.9 72.7,70.2 7" +
    "2.3C70.5 71.9,71.2 70.9,71.5 70.4C71.8 70.0,72.5 68.9,72.8 68.5C73.1 68.0,73.8 67.1,74.0 6" +
    "6.8C74.3 66.4,74.8 65.7,75.1 65.4C75.3 65.1,75.8 64.5,76.0 64.2C76.2 63.9,76.6 63.2,76.8 6" +
    "3.0C77.0 62.7,77.4 62.1,77.6 61.8C77.8 61.6,78.2 61.0,78.4 60.8C78.5 60.5,78.9 60.0,79.1 5" +
    "9.8C79.3 59.6,79.7 59.0,79.8 58.8C80.0 58.6,80.4 58.0,80.6 57.8C80.8 57.5,81.3 56.9,81.5 5" +
    "6.7C81.7 56.4,82.2 55.8,82.4 55.6C82.6 55.3,83.1 54.7,83.3 54.5C83.4 54.3,83.8 53.7,84.0 5" +
    "3.5C84.2 53.3,84.6 52.8,84.8 52.6C85.0 52.3,85.5 51.8,85.7 51.6C86.0 51.4,86.6 50.8,86.8 5" +
    "0.5C87.1 50.3,87.7 49.7,87.9 49.5C88.1 49.2,88.6 48.6,88.8 48.4C89.0 48.2,89.4 47.6,89.6 4" +
    "7.4C89.8 47.2,90.2 46.6,90.4 46.4C90.6 46.2,91.1 45.6,91.3 45.3C91.6 45.0,92.2 44.3,92.5 4" +
    "4.0C92.7 43.6,93.4 42.8,93.7 42.5C94.0 42.2,94.7 41.4,95.0 41.1C95.2 40.7,95.9 40.0,96.1 3" +
    "9.7C96.4 39.4,97.1 38.6,97.4 38.3C97.7 37.9,98.4 37.1,98.8 36.7C99.1 36.4,99.8 35.5,100.1 " +
    "35.1C100.5 34.8,101.2 34.0,101.5 33.6C101.8 33.2,102.6 32.5,102.9 32.1C103.3 31.8,104.1 31" +
    ".0,104.5 30.6C104.9 30.2,105.8 29.4,106.3 29.0C106.8 28.6,107.9 27.6,108.4 27.2C108.9 26.7" +
    ",110.1 25.8,110.6 25.4C111.1 25.0,112.1 24.2,112.5 23.9C112.9 23.6,113.7 23.1,114.0 22.9C1" +
    "14.3 22.7,114.9 22.3,115.2 22.2C115.5 22.1,116.0 21.8,116.3 21.8C116.6 21.7,117.3 21.5,117" +
    ".7 21.5C118.0 21.5,118.9 21.4,119.3 21.5C119.7 21.5,120.8 21.6,121.2 21.8C121.7 21.9,122.7" +
    " 22.4,123.1 22.6C123.5 22.9,124.2 23.8,124.5 24.2C124.7 24.7,125.1 25.9,125.2 26.5C125.3 2" +
    "7.1,125.3 28.5,125.3 29.1C125.3 29.7,125.2 31.0,125.1 31.4C125.1 31.9,124.8 32.8,124.7 33." +
    "2C124.6 33.5,124.4 34.1,124.3 34.4C124.2 34.6,123.9 35.1,123.8 35.3C123.7 35.5,123.5 35.9," +
    "123.3 36.0C123.2 36.2,123.0 36.7,122.8 36.9C122.7 37.1,122.4 37.6,122.2 37.8C122.1 38.0,12" +
    "1.7 38.6,121.5 38.9C121.3 39.2,120.8 39.8,120.6 40.1C120.4 40.3,120.0 40.9,119.8 41.2C119." +
    "6 41.5,119.3 42.0,119.1 42.3C118.9 42.5,118.5 43.1,118.3 43.4C118.1 43.7,117.6 44.4,117.4 " +
    "44.7C117.2 45.1,116.6 45.9,116.3 46.3C116.1 46.6,115.6 47.4,115.3 47.7C115.1 48.1,114.7 48" +
    ".7,114.5 49.0C114.3 49.3,113.9 49.9,113.7 50.1C113.5 50.4,113.1 50.9,113.0 51.2C112.8 51.4" +
    ",112.4 52.0,112.2 52.3C112.0 52.5,111.6 53.1,111.3 53.4C111.1 53.7,110.5 54.3,110.2 54.6C1" +
    "09.9 54.9,109.1 55.6,108.8 56.0C108.4 56.3,107.5 57.1,107.0 57.4C106.6 57.8,105.6 58.7,105" +
    ".1 59.1C104.7 59.5,103.6 60.3,103.2 60.7C102.8 61.0,101.9 61.7,101.5 62.0C101.2 62.3,100.5" +
    " 62.8,100.2 63.0C99.9 63.2,99.4 63.6,99.2 63.7C99.0 63.9,98.7 64.3,98.5 64.5C98.3 64.6,98." +
    "0 65.0,97.8 65.2C97.6 65.4,97.2 65.8,97.0 66.0C96.8 66.1,96.3 66.5,96.1 66.6C95.9 66.8,95." +
    "4 67.1,95.2 67.2C95.0 67.4,94.6 67.7,94.3 67.8C94.1 67.9,93.6 68.2,93.4 68.4C93.2 68.5,92." +
    "5 69.0,92.2 69.2C91.9 69.4,91.2 69.9,90.8 70.2C90.4 70.4,89.5 71.0,89.1 71.2C88.8 71.5,87." +
    "9 72.1,87.5 72.3C87.2 72.5,86.4 73.0,86.0 73.2C85.7 73.4,85.0 73.8,84.7 74.0C84.3 74.2,83." +
    "6 74.5,83.3 74.7C82.9 74.9,82.1 75.4,81.7 75.6C81.4 75.8,80.4 76.3,80.0 76.5C79.6 76.7,78." +
    "7 77.2,78.3 77.4C77.9 77.6,77.0 78.0,76.7 78.2C76.3 78.4,75.4 78.8,75.1 79.0C74.7 79.2,74." +
    "0 79.6,73.6 79.7C73.3 79.9,72.6 80.2,72.3 80.3C72.0 80.4,71.4 80.7,71.1 80.8C70.8 80.9,70." +
    "0 81.1,69.7 81.2C69.3 81.3,68.4 81.6,68.0 81.7C67.6 81.9,66.7 82.3,66.3 82.5C66.0 82.7,65." +
    "2 83.3,65.0 83.7C64.8 84.0,64.5 84.8,64.4 85.2C64.3 85.6,64.3 86.7,64.4 87.2C64.4 87.7,64." +
    "6 89.2,64.6 89.4 M51.4 68.7C51.9 68.2,54.8 65.3,55.2 64.9 M51.7 51.2C53.1 49.5,61.5 38.8,6" +
    "3.6 36.5C65.6 34.1,68.5 31.6,69.2 30.9 M62.1 58.0C62.1 58.0,62.5 57.6,62.6 57.5 M69.2 50.9" +
    "C69.2 50.8,69.8 50.2,69.9 50.2 M69.7 73.0C70.2 72.1,73.9 66.5,74.5 65.6 M75.5 44.6C75.6 44" +
    ".5,76.4 43.7,76.5 43.6 M79.8 77.0C79.9 76.9,80.7 76.1,80.8 76.0 M80.6 89.9C80.7 89.8,81.5 " +
    "89.1,81.8 89.0C82.0 88.9,82.8 88.7,83.1 88.7C83.4 88.8,84.4 89.1,84.6 89.2 M81.1 56.5C81.1" +
    " 56.4,81.5 56.0,81.6 56.0 M88.9 29.9C89.2 29.4,91.1 26.4,91.7 25.6C92.3 24.7,93.9 22.9,94." +
    "2 22.5 M91.7 44.3C91.8 44.2,92.4 43.7,92.5 43.6 M99.6 14.4C99.6 14.4,100.0 14.0,100.1 13.9" +
    " M100.1 63.1C100.4 62.8,102.5 61.3,102.9 61.1 M101.6 128.2C101.7 128.1,102.1 127.6,102.3 1" +
    "27.5C102.5 127.3,102.9 126.8,103.0 126.6C103.2 126.4,103.6 126.0,103.8 125.8C104.0 125.5,1" +
    "04.4 125.0,104.5 124.8C104.7 124.6,105.1 124.1,105.3 123.9C105.4 123.6,105.8 123.1,106.0 1" +
    "22.9C106.2 122.7,106.5 122.2,106.7 121.9C106.9 121.7,107.2 121.2,107.4 121.0C107.6 120.7,1" +
    "08.0 120.2,108.1 119.9C108.3 119.6,108.8 119.0,109.0 118.7C109.2 118.5,109.7 117.8,109.9 1" +
    "17.5C110.1 117.3,110.5 116.7,110.7 116.4C110.9 116.2,111.2 115.7,111.4 115.5C111.6 115.2,1" +
    "12.1 114.7,112.3 114.5C112.5 114.2,113.0 113.6,113.2 113.3C113.5 113.1,114.1 112.4,114.3 1" +
    "12.1C114.6 111.8,115.1 111.2,115.4 110.8C115.7 110.5,116.3 109.8,116.6 109.4C116.9 109.0,1" +
    "17.7 108.1,118.0 107.6C118.3 107.2,119.2 106.1,119.5 105.6C119.8 105.2,120.6 104.1,120.9 1" +
    "03.7C121.2 103.3,121.7 102.4,122.0 102.0C122.2 101.6,122.7 100.8,122.9 100.4C123.2 100.1,1" +
    "23.8 99.2,124.2 98.8C124.5 98.3,125.5 97.1,126.2 96.6C126.9 96.0,128.9 94.5,130.0 93.9C131" +
    ".2 93.2,134.4 91.7,135.8 91.2C137.2 90.8,140.9 89.9,142.2 89.7C143.4 89.5,146.0 89.4,146.8" +
    " 89.5C147.6 89.5,148.5 90.0,148.8 90.3C149.0 90.5,149.0 91.2,149.0 91.5C148.9 91.9,148.6 9" +
    "2.7,148.6 93.0C148.5 93.4,148.4 94.2,148.6 94.5C148.7 94.9,149.2 95.6,149.5 95.9C149.9 96." +
    "2,151.2 96.8,151.8 97.0C152.4 97.2,154.1 97.6,154.8 97.8C155.4 98.0,157.0 98.3,157.5 98.4C" +
    "158.1 98.6,159.2 98.9,159.6 99.0C160.0 99.2,160.7 99.5,161.0 99.6C161.3 99.7,161.7 100.0,1" +
    "61.9 100.2C162.0 100.4,162.1 100.8,162.1 101.1C162.1 101.4,162.0 102.3,162.0 102.7C162.1 1" +
    "03.2,162.2 104.4,162.3 104.8C162.4 105.2,162.9 106.2,163.1 106.5C163.4 106.8,164.1 107.2,1" +
    "64.3 107.3C164.6 107.4,165.2 107.2,165.5 107.1C165.7 107.0,166.2 106.7,166.4 106.5C166.6 1" +
    "06.3,167.0 105.9,167.2 105.7C167.4 105.5,167.9 105.1,168.1 104.9C168.4 104.7,169.0 104.3,1" +
    "69.4 104.1C169.7 103.9,170.7 103.5,171.2 103.3C171.6 103.2,172.8 102.8,173.2 102.6C173.7 1" +
    "02.5,174.6 102.3,175.0 102.3C175.3 102.2,175.8 102.4,175.9 102.5C176.1 102.6,176.2 103.2,1" +
    "76.3 103.5C176.4 103.8,176.5 104.6,176.5 104.9C176.5 105.2,176.7 106.0,176.7 106.2C176.7 1" +
    "06.4,176.7 106.8,176.6 106.9C176.6 107.0,176.4 107.0,176.3 107.0C176.1 107.0,175.8 106.9,1" +
    "75.7 106.8C175.6 106.8,175.3 106.6,175.2 106.6C175.1 106.7,174.8 106.8,174.7 107.0C174.6 1" +
    "07.2,174.3 107.8,174.1 108.2C174.0 108.5,173.7 109.4,173.5 109.8C173.4 110.1,173.1 110.9,1" +
    "73.1 111.1C173.0 111.3,173.0 111.5,173.0 111.6C173.1 111.6,173.4 111.4,173.6 111.3C173.8 1" +
    "11.1,174.4 110.7,174.7 110.5C175.0 110.3,175.7 109.7,175.9 109.5C176.2 109.3,176.7 108.8,1" +
    "77.0 108.6C177.2 108.5,177.6 108.0,177.8 107.8C178.0 107.7,178.4 107.2,178.6 107.0C178.8 1" +
    "06.8,179.3 106.4,179.5 106.1C179.7 105.9,180.3 105.4,180.5 105.2C180.7 105.0,181.3 104.6,1" +
    "81.5 104.4C181.8 104.2,182.3 103.9,182.6 103.8C182.9 103.6,183.5 103.4,183.8 103.3C184.1 1" +
    "03.2,184.8 102.9,185.2 102.9C185.5 102.8,186.3 102.6,186.6 102.6C187.0 102.6,187.8 102.6,1" +
    "88.1 102.6C188.5 102.6,189.4 102.8,189.7 103.0C190.1 103.1,191.0 103.5,191.4 103.6C191.8 1" +
    "03.8,192.7 104.3,193.1 104.5C193.5 104.7,194.4 105.2,194.7 105.4C195.1 105.6,195.9 106.1,1" +
    "96.2 106.3C196.5 106.4,197.2 106.8,197.5 107.0C197.8 107.1,198.3 107.4,198.5 107.5C198.8 1" +
    "07.6,199.2 107.7,199.4 107.8C199.6 107.9,200.0 108.1,200.2 108.1C200.4 108.2,200.9 108.4,2" +
    "01.1 108.5C201.4 108.6,202.0 108.8,202.4 108.9C202.7 109.1,203.5 109.3,203.9 109.4C204.3 1" +
    "09.5,205.2 109.8,205.6 109.9C206.0 110.1,206.9 110.3,207.2 110.4C207.6 110.5,208.3 110.7,2" +
    "08.6 110.8C208.9 110.9,209.6 111.0,210.0 111.1C210.3 111.2,211.1 111.4,211.6 111.4C212.1 1" +
    "11.5,213.4 111.7,214.2 111.8C215.0 111.9,217.2 112.2,218.3 112.4C219.4 112.5,223.1 112.9,2" +
    "23.7 113.0 M108.7 26.6C108.8 26.5,109.6 25.7,109.7 25.6 M116.0 46.4C116.1 46.3,116.5 45.9," +
    "116.5 45.9 M122.4 37.2C122.4 37.2,122.8 36.8,122.9 36.7 M150.5 88.2C150.6 88.2,151.6 88.2," +
    "151.7 88.2 M157.8 97.0C158.0 96.9,159.0 96.0,159.4 95.8C159.8 95.5,160.7 94.9,161.0 94.7C1" +
    "61.3 94.4,162.1 93.9,162.3 93.6C162.4 93.3,162.6 92.5,162.5 92.2C162.4 91.9,161.6 91.0,161" +
    ".2 90.6C160.8 90.3,159.4 89.6,158.8 89.3C158.2 89.1,156.7 88.6,156.2 88.4C155.6 88.3,154.5" +
    " 87.9,154.1 87.8C153.7 87.6,153.0 87.2,152.8 87.0C152.7 86.7,152.5 86.1,152.5 85.9C152.5 8" +
    "5.6,152.7 84.8,152.8 84.5C153.0 84.2,153.4 83.4,153.6 83.0C153.8 82.6,154.3 81.8,154.5 81." +
    "4C154.7 81.0,155.3 80.1,155.5 79.8C155.7 79.4,156.1 78.6,156.3 78.3C156.5 77.9,156.8 77.3," +
    "157.0 76.9C157.2 76.6,157.6 75.9,157.7 75.6C157.9 75.2,158.4 74.4,158.6 74.0C158.8 73.6,15" +
    "9.4 72.6,159.6 72.2C159.8 71.8,160.2 70.9,160.4 70.5C160.6 70.1,161.0 69.4,161.1 69.1C161." +
    "3 68.7,161.5 68.2,161.7 67.9C161.8 67.7,162.0 67.1,162.2 66.8C162.3 66.6,162.6 65.9,162.8 " +
    "65.5C163.0 65.1,163.5 64.0,163.8 63.5C164.1 62.9,164.8 61.4,165.2 60.6C165.5 59.9,166.4 58" +
    ".0,166.7 57.3C167.1 56.5,167.9 54.6,168.2 53.9C168.5 53.2,169.1 51.7,169.3 51.1C169.6 50.5" +
    ",170.0 49.3,170.2 48.9C170.4 48.4,170.8 47.4,171.0 47.0C171.1 46.6,171.5 45.7,171.6 45.2C1" +
    "71.8 44.8,172.1 43.9,172.3 43.5C172.4 43.0,172.7 42.1,172.8 41.7C172.9 41.3,173.2 40.5,173" +
    ".3 40.1C173.4 39.7,173.6 38.9,173.7 38.6C173.8 38.2,174.0 37.2,174.0 37.0 M158.3 95.8C158." +
    "4 95.7,159.0 95.1,159.1 95.0 M167.5 55.2C167.5 55.2,167.9 54.8,168.0 54.7 M178.6 106.4C178" +
    ".5 106.2,177.6 104.8,177.5 104.3C177.3 103.8,177.0 102.8,177.0 102.4C177.0 102.0,177.3 101" +
    ".1,177.5 100.7C177.7 100.3,178.3 99.5,178.6 99.2C178.9 98.8,179.5 98.0,179.8 97.7C180.0 97" +
    ".4,180.6 96.8,180.9 96.4C181.2 96.1,181.8 95.5,182.2 95.1C182.5 94.8,183.4 94.0,183.8 93.6" +
    "C184.3 93.2,185.4 92.3,185.9 91.9C186.4 91.5,187.5 90.7,187.9 90.4C188.4 90.1,189.3 89.5,1" +
    "89.7 89.2C190.2 88.9,191.0 88.3,191.4 88.0C191.8 87.7,192.7 87.1,193.0 86.8C193.4 86.5,194" +
    ".1 86.0,194.4 85.7C194.7 85.5,195.2 85.1,195.4 84.9C195.6 84.7,196.1 84.3,196.3 84.2C196.5" +
    " 84.0,197.1 83.5,197.4 83.3C197.6 83.0,198.3 82.5,198.6 82.2C199.0 81.9,199.7 81.3,200.1 8" +
    "1.0C200.4 80.7,201.2 80.0,201.6 79.7C202.0 79.3,202.8 78.6,203.2 78.3C203.5 77.9,204.4 77." +
    "2,204.7 76.9C205.1 76.6,205.9 75.9,206.3 75.5C206.6 75.2,207.4 74.4,207.8 74.0C208.1 73.7," +
    "208.9 72.8,209.1 72.5C209.4 72.2,210.0 71.6,210.2 71.3C210.4 71.0,210.8 70.5,211.0 70.3C21" +
    "1.2 70.1,211.6 69.5,211.7 69.2C211.9 69.0,212.3 68.2,212.5 67.9C212.6 67.6,213.0 66.7,213." +
    "1 66.3C213.2 66.0,213.3 65.2,213.2 64.9C213.1 64.6,212.8 64.1,212.5 64.0C212.3 63.9,211.6 " +
    "63.8,211.3 63.8C211.0 63.9,210.2 64.1,209.8 64.3C209.4 64.5,208.5 65.0,208.1 65.3C207.6 65" +
    ".6,206.4 66.6,205.8 67.1C205.2 67.6,203.6 69.0,202.9 69.7C202.1 70.4,200.3 72.3,199.5 73.1" +
    "C198.7 73.9,197.0 75.9,196.3 76.6C195.6 77.4,194.3 79.0,193.8 79.6C193.3 80.2,192.3 81.3,1" +
    "92.0 81.8C191.6 82.2,191.0 83.1,190.8 83.4C190.5 83.8,190.1 84.6,190.0 84.9C189.9 85.3,189" +
    ".8 86.0,189.8 86.3C189.7 86.6,189.9 87.3,189.9 87.5C190.0 87.7,190.1 88.1,190.1 88.2C190.1" +
    " 88.2,190.1 88.3,190.0 88.3C189.9 88.3,189.5 88.1,189.4 88.1C189.2 88.0,188.7 87.8,188.5 8" +
    "7.8C188.3 87.8,187.9 87.8,187.7 87.9C187.4 88.1,186.9 88.6,186.6 89.0C186.3 89.3,185.4 90." +
    "5,185.0 91.0C184.6 91.6,183.2 93.4,182.9 93.7 M193.0 79.8C193.3 79.8,194.7 80.1,195.3 80.1" +
    "C195.8 80.2,197.0 80.2,197.5 80.1C198.0 79.9,199.1 79.4,199.5 78.9C199.9 78.5,200.6 77.2,2" +
    "01.0 76.5C201.3 75.8,202.0 73.8,202.4 72.9C202.9 72.0,204.1 69.8,204.8 68.9C205.4 68.0,207" +
    ".6 65.3,208.0 64.9";

  /* THE HAND, AT ITS OWN SIZE. SIG_BOX comes from the trace, so the
     viewBox, the drawing and the rule it sits on cannot drift apart: a
     re-trace of a taller scan changes the number in one place. */
  function sigSVG(svgId, pathId) {
    return `<svg${svgId ? ` id="${svgId}"` : ""} width="${SIG_BOX.w}" height="${SIG_BOX.h}" ` +
      `viewBox="0 0 ${SIG_BOX.w} ${SIG_BOX.h}" aria-hidden="true">` +
      `<path class="sigpath"${pathId ? ` id="${pathId}"` : ""} d="${SIG_PATH}"/></svg>`;
  }

  /* WHERE A BILL GOES. The register used to show the end state and nothing
     else, so "assented" arrived without the road that led to it and an act in
     force looked the same as one that had merely survived a division.

     The track is the engine's own STAGE_ORDER, not a copy: if a stage is added
     there this renders it without being touched. Terminal states are not
     positions on the track — struck, referred, defeated and withdrawn are ways
     of leaving it — so they are drawn as a branch off the end. */
  const STAGE_LABEL = {
    drafting:"Drafting", first_reading:"First reading", second_reading:"Second reading",
    committee:"Committee", report:"Report", third_reading:"Third reading",
    assent:"Assent", blocked:"Blocked"
  };
  const TERMINAL = {
    struck:    { label:"Struck on review", cls:"bad",  note:"Removed from the statute book. It cannot be revived; it must be brought again as a new bill." },
    defeated:  { label:"Defeated",         cls:"bad",  note:"Lost on division. The slot is spent." },
    withdrawn: { label:"Withdrawn",        cls:"bad",  note:"Pulled before division." },
    referred:  { label:"Referred",         cls:"warn", note:"With the constitutional court. It returns, struck or intact." },
    assented:  { label:"In force",         cls:"good", note:"Law. Its effects are live and stay live until amended or repealed by another act." }
  };

  function stageTrack(b, bs) {
    const order = (typeof Engine !== "undefined" && Engine.STAGE_ORDER) || [];
    const term = TERMINAL[bs.stage];
    /* How far it got: an assented act cleared the whole track. */
    const reached = bs.stage === "assented" ? order.length
                  : bs.stage === "awaiting_assent" ? order.indexOf("assent")
                  : order.indexOf(bs.stage) >= 0 ? order.indexOf(bs.stage)
                  : order.length - 1;

    const steps = order.map((sg, i) => {
      const state = i < reached ? "done" : i === reached ? "here" : "todo";
      return `<li class="${state}"><i></i><span>${STAGE_LABEL[sg] || sg}` +
             `${sg === Engine.DIVIDES_AT ? '<em>division</em>' : ""}</span></li>`;
    }).join("");

    return `<div class="track">
        <ol class="stagetrack">${steps}
          ${term ? `<li class="term ${term.cls}"><i></i><span>${term.label}</span></li>` : ""}
        </ol>
        ${term ? `<div class="trknote ${term.cls}">${term.note}</div>` : ""}
        ${bs.stage === "assented" && bs.assentedAt != null
          ? `<div class="trknote">Assented at sitting ${bs.assentedAt}. It sits in this register
             permanently; the Concordance carries what it changed.</div>` : ""}
      </div>`;
  }

  function actDoc(it) {
    const b = it.bill, bs = it.state;
    const assented = bs.stage === "assented";
    const struck = bs.stage === "struck";
    const referred = bs.stage === "referred";
    const pm = C.characterById[st.pm];

    let banner = "";
    if (referred) banner = `<div class="classif">Referred for constitutional review &mdash; ` +
      `returns sitting ${bs.returnsAt}</div>`;
    else if (struck) banner = `<div class="classif">Struck on review</div>`;
    else if (bs.stage === "defeated") banner = `<div class="classif">Defeated on division</div>`;
    else if (assented) banner = `<div class="classif" style="border-color:#3d5c33;color:#3d5c33">` +
      `Assented &mdash; in force</div>`;

    const body = `<h5>${esc(b.title)}</h5>
      <p>${esc(b.summary)}</p>
      ${b.effectNote ? `<p><i>${esc(b.effectNote)}</i></p>` : ""}
      <p>Test on division: <b>${b.dualMajority ? "dual majority" : "simple majority"}</b>.
      ${b.dualMajority ? "A measure touching life-support integrity or amending the Charter must " +
        "carry separately among functional and elected members." : ""}</p>`;

    /* The ceremony. Reserved for acts that needed more than a simple majority,
       drawn once, never repeated. */
    const ceremonial = assented && b.dualMajority;
    const already = drawn[it.id];
    const sig = ceremonial ? `<div class="sigblock">
        <div class="sigline"><div class="rule" style="height:${SIG_BOX.h}px">
          ${sigSVG("sigsvg", "sigpath")}</div>
          <div class="cap">${esc(pm ? pm.name.replace(/^Rt\. Hon\. /, "") : "The Prime Minister")}
            &middot; Prime Minister</div></div>
        <div class="stamp">Entered in registry<small>${esc(b.ref)} &middot; SITTING ${bs.assentedAt}</small></div>
      </div>` : assented ? `<div class="sigblock"><div class="sigline"><div class="cap">
          Assented without ceremony &mdash; simple majority</div></div>
        <div class="madestamp">Entered in registry<small>${esc(b.ref)} &middot; SITTING ${bs.assentedAt}</small></div>
      </div>` : "";

    return { html: `<div class="paper${ceremonial && !already ? " sig-armed" : ""}${ceremonial && already ? " sig-done" : ""}">
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth \u00b7 Anselm Ring",
             "FILE " + b.ref, "11 APR 2287")}
      ${banner}${stageTrack(b, bs)}${body}${sig}</div>`, ceremonial: ceremonial && !already };
  }

  /* A minute is signed and served. Signing is the decision — the distribution
     list is served the moment the pen leaves the paper, and who was on it
     becomes a fact about the world. */
  function minuteSignable(m) {
    return !st.signedMinutes || !st.signedMinutes[m.id];
  }

  function instrumentDoc(it) {
    const si = it.si, s = it.state;
    const post = (C.cabinetById || {})[si.author];
    const window = s.inForce && s.prayerCloses != null ? s.prayerCloses - st.sitting : null;
    const banner = s.revoked
      ? `<div class="classif">Revoked</div>`
      : `<div class="classif" style="border-color:#8a6d22;color:#8a6d22">` +
        `${si.procedure === "affirmative" ? "Affirmative" : "Negative"} procedure` +
        (window > 0 ? ` &mdash; prayable for ${window} more sittings` : "") + `</div>`;
    return { html: `<div class="paper">
      ${head("Office of the Minister for " + (post ? post.name : si.author.replace(/_/g, " ")),
             "Made under the Allocation Act and the Representation Act",
             si.number, "SITTING " + s.madeAt)}
      ${banner}
      <h5>${esc(si.title)}</h5>
      <p>${esc(si.summary)}</p>
      ${si.effect_note ? `<p><i>${esc(si.effect_note)}</i></p>` : ""}
      <p>${si.procedure === "affirmative"
        ? "This instrument requires the approval of the House before taking effect."
        : "This instrument took effect on being made. It stands unless the House prays " +
          "against it within " + (si.prayer_window || 6) + " sittings. A prayer requires a " +
          "simple majority of elected members only."}
      ${si.revocable ? " It may be revoked by a further instrument." : ""}</p>
      <div class="sigblock">
        <div class="sigline"><div class="rule" style="height:${SIG_BOX.h}px">
          ${sigSVG()}</div>
          <div class="cap">${esc(minister(si.author))} &middot; ${esc(postName(si.author))}</div></div>
        <div class="madestamp">Made<small>${esc(si.number)} &middot; SITTING ${s.madeAt}</small></div>
      </div></div>`, ceremonial: false, drawSig: true };
  }

  function minister(postId) {
    const p = st.cabinet[postId];
    if (!p || !p.holder) return "vacant";
    const ch = C.characterById[p.holder];
    return ch ? ch.name.replace(/^Rt\. Hon\. /, "") : p.holder.replace(/_/g, " ");
  }
  function postName(postId) {
    const p = (C.cabinetById || {})[postId];
    return p ? "Minister for " + p.name : postId.replace(/_/g, " ");
  }

  function minuteDoc(it) {
    const m = it.minute;
    const signed = st.signedMinutes && st.signedMinutes[m.id];
    const line = (label, v) => `<div class="row"><span>${label}</span><span>${v}</span></div>`;
    return { html: `<div class="paper">
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth \u00b7 Anselm Ring",
             "FILE " + m.file, "SITTING " + (m.sitting || st.sitting))}
      <div class="classif">${esc(m.classification || "Restricted: ministerial")}</div>
      <div class="distrib">
        ${line("FROM", esc(m.from))}
        ${line("TO", esc(m.to))}
        ${m.copy ? line("COPY", m.copy.map(esc).join(" &middot; ")) : ""}
        ${m.struck ? line("", m.struck.map(s => `<s>${esc(s)}</s>`).join(" &middot; ") +
            ` <i style="font-family:var(--f-ui);font-size:9px;letter-spacing:.06em">struck at drafting</i>`) : ""}
        ${m.notCopied ? line("NOT COPIED", m.notCopied.map(esc).join(" &middot; ")) : ""}
      </div>
      <h5>${esc(m.subject)}</h5>
      ${m.body.split(/\n\n+/).map(p => p.trim().startsWith("1.")
        ? `<ol>${p.split(/\n(?=\d+\.)/).map(x => `<li>${esc(x.replace(/^\d+\.\s*/, ""))}</li>`).join("")}</ol>`
        : `<p>${esc(p)}</p>`).join("")}
      <div class="sigblock">
        <div class="sigline"><div class="rule" style="height:${SIG_BOX.h}px">
          ${signed ? sigSVG() : ""}</div>
          <div class="cap">${esc(m.signedBy || "The Prime Minister")}</div></div>
        ${signed
          ? `<div class="madestamp">Served<small>${esc(m.file)} &middot; SITTING ${signed}</small></div>`
          : `<button class="btn signbtn" data-sign="${m.id}">Sign and serve</button>`}
      </div>
    </div>`, ceremonial: false, drawSig: !!signed };
  }

  /* ---------- render ---------- */

  function render(state, content) {
    st = state; C = content;
    const list = items();
    /* The register grows and shrinks with the state: an instrument that
       is revoked takes its row with it. If the chosen document is gone,
       choose the first one - seeded rather than set, because we are
       already inside the render it would otherwise trigger. */
    let sel = chosen();
    if (!list.some(i => i.id === sel)) {
      sel = list.length ? list[0].id : null;
      Focus.seed("pp-list", sel);
    }

    document.getElementById("pp-list").innerHTML = list.length ? list.map(i =>
      `<tr class="${i.id === sel ? "sel" : ""}" data-doc="${i.id}">
        <td>${esc(i.title)}<div class="note">${esc(i.ref)}</div></td>
        <td class="n"><span class="flag ${i.status === "assented" || i.status === "in force" ? "good"
          : ["struck", "revoked", "defeated"].includes(i.status) ? "bad" : ""}"
          data-tip="${i.kind === "minute" ? "minute" : i.kind === "instrument" ? "instrument" : "register"}"
          >${i.status}</span></td>
      </tr>`).join("")
      : `<tr><td class="note">The register is empty. Divisions and instruments appear here.</td></tr>`;

    document.getElementById("pp-list").querySelectorAll("[data-doc]").forEach(n =>
      n.addEventListener("click", () => Focus.activate("pp-list", n.dataset.doc)));

    /* THE BENCH (design/30). The orders are judged here, so the bench sits
       beside them: its disposition toward the government, the cases before it
       with the sitting each is due, and nothing to press. It is not elected and
       cannot be whipped, which is the whole reason it earns a panel. */
    const trib = document.getElementById("pp-tribunal");
    if (trib) trib.innerHTML = tribunalHTML();

    const it = list.find(i => i.id === sel);
    const box = document.getElementById("pp-doc");
    if (!it) { box.innerHTML = `<div class="pbody"><div class="note">Nothing selected.</div></div>`; return; }

    const doc = it.kind === "act" ? actDoc(it)
              : it.kind === "instrument" ? instrumentDoc(it) : minuteDoc(it);
    box.innerHTML = doc.html;

    box.querySelectorAll("[data-sign]").forEach(btn => btn.addEventListener("click", () => {
      st.signedMinutes = st.signedMinutes || {};
      st.signedMinutes[btn.dataset.sign] = st.sitting;
      const m = (C.minutes || []).find(x => x.id === btn.dataset.sign);
      if (m) {
        st.log.unshift({ sitting: st.sitting, text: "Minute signed and served: " + m.subject });
        if (m.onSign) Engine.apply(st, C, m.onSign);
      }
      delete drawn[btn.dataset.sign];
      if (onChange) onChange(); else render(st, C);
    }));

    /* Draw any signature on this document that has not been drawn before.
       The stroke is the player's own hand, so it fires on the act rather
       than on arriving at the page. */
    if (doc.ceremonial || doc.drawSig) {
      const paper = box.querySelector(".paper");
      const path = box.querySelector("#sigpath") || box.querySelector(".sigpath");
      /* getTotalLength is SVG geometry, which a DOM without layout does
         not implement — the same shape of absence as Web Audio in a
         headless run. A missing flourish is never worth an exception. */
      if (path && paper && typeof path.getTotalLength === "function") {
        const len = path.getTotalLength();
        paper.style.setProperty("--len", len);
        if (drawn[it.id]) paper.classList.add("sig-done");
        else requestAnimationFrame(() => requestAnimationFrame(() => {
          paper.classList.add("sig-draw");
          drawn[it.id] = true;
        }));
      }
    }
  }

  function reset() { drawn = {}; Focus.seed("pp-list", null); }
  function onUpdate(fn) { onChange = fn; }

  /* SIG_BOX is the viewBox the trace produced, and SIG_PATH the one hand it
     draws; both are exported so the set piece ends an introduction with the
     same signature, at the same size, without retyping either. */
  /* SIG_PATH is exported so the set piece can end an introduction with the
     SAME hand that signs every Act. One signature, traced once by
     tools/tracesig.js, drawn by two ceremonies. */
  return { render, reset, onUpdate, stageTrack, SIG_PATH, SIG_BOX };
})();
