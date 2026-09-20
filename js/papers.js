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
  const SIG_PATH =
    "M3.0 36.5C3.1 36.4,3.3 35.7,3.5 35.4C3.6 35.2,3.9 34.6,4.0 34.4C4.1 34.2,4.4 33.7,4.5 33.5" +
    "C4.7 33.3,5.0 32.9,5.1 32.8C5.2 32.6,5.5 32.3,5.6 32.2C5.7 32.1,6.0 31.8,6.1 31.6C6.3 31.5" +
    ",6.6 31.2,6.7 31.1C6.9 30.9,7.2 30.6,7.3 30.5C7.5 30.4,7.8 30.1,8.0 30.0C8.1 29.8,8.5 29.5" +
    ",8.7 29.4C8.8 29.2,9.2 28.9,9.4 28.8C9.5 28.7,9.9 28.4,10.2 28.3C10.4 28.2,11.0 27.9,11.3 " +
    "27.9C11.7 27.8,12.6 27.7,13.1 27.6C13.6 27.6,14.9 27.6,15.5 27.6C16.1 27.7,17.5 27.8,18.0 " +
    "27.9C18.5 28.0,19.5 28.3,19.8 28.5C20.1 28.7,20.6 29.2,20.7 29.4C20.9 29.6,21.1 30.2,21.3 " +
    "30.4C21.4 30.6,21.7 31.0,21.9 31.1C22.1 31.2,22.6 31.4,22.8 31.4C23.1 31.5,23.6 31.4,23.8 " +
    "31.4C24.0 31.4,24.5 31.2,24.7 31.2C24.9 31.1,25.3 31.0,25.5 30.9C25.7 30.9,26.2 30.7,26.3 " +
    "30.7 M12.7 26.9C12.9 26.7,13.8 25.5,14.1 25.1C14.4 24.8,15.2 23.9,15.6 23.5C16.0 23.1,16.8" +
    " 22.3,17.2 22.0C17.6 21.7,18.4 21.0,18.8 20.7C19.2 20.4,20.0 19.7,20.3 19.4C20.7 19.1,21.5" +
    " 18.6,21.8 18.3C22.1 18.1,22.8 17.6,23.1 17.4C23.4 17.3,24.0 16.9,24.2 16.8C24.4 16.7,24.8" +
    " 16.4,25.0 16.4C25.1 16.3,25.3 16.2,25.4 16.1C25.5 16.1,25.6 16.0,25.6 16.0 M13.7 24.6C13." +
    "8 24.5,14.3 23.9,14.4 23.8 M20.5 31.4C20.4 31.6,19.8 32.5,19.6 32.8C19.5 33.2,19.1 34.0,19" +
    ".1 34.4C19.1 34.8,19.3 35.6,19.5 35.9C19.8 36.3,20.7 37.0,21.2 37.3C21.7 37.5,23.5 38.2,23" +
    ".8 38.3 M21.5 27.6C21.5 27.6,21.8 27.4,21.8 27.4 M27.9 32.2C27.9 32.1,27.6 31.3,27.6 31.1C" +
    "27.5 30.9,27.6 30.4,27.6 30.2C27.7 30.1,27.9 29.8,28.0 29.8C28.1 29.7,28.4 29.8,28.4 29.9C" +
    "28.5 30.0,28.6 30.3,28.6 30.5C28.6 30.7,28.5 31.3,28.5 31.6C28.4 31.8,28.3 32.4,28.3 32.7C" +
    "28.2 33.0,28.1 33.8,28.1 33.9 M28.1 29.1C28.2 29.0,28.5 28.7,28.6 28.6C28.7 28.5,28.6 28.0" +
    ",28.6 27.9 M28.6 12.4C28.5 12.6,28.0 13.5,27.8 13.8C27.7 14.2,27.3 14.9,27.1 15.2C27.0 15." +
    "5,26.6 16.2,26.4 16.5C26.3 16.8,25.9 17.6,25.8 18.0C25.6 18.3,25.2 19.2,25.0 19.6C24.8 20." +
    "0,24.4 21.1,24.2 21.5C24.0 21.9,23.5 23.0,23.4 23.4C23.3 23.8,23.1 24.8,23.1 25.1C23.2 25." +
    "5,23.5 26.1,23.8 26.3C24.0 26.5,24.8 26.8,25.2 26.9C25.5 27.0,26.5 27.1,26.8 27.1C27.2 27." +
    "2,28.0 27.2,28.3 27.2C28.7 27.2,29.3 27.2,29.6 27.2C29.8 27.2,30.5 27.1,30.7 27.1C31.0 27." +
    "1,31.7 27.1,31.9 27.1C32.2 27.2,32.8 27.3,33.1 27.4C33.4 27.5,33.9 27.7,34.2 27.8C34.5 27." +
    "9,35.1 28.0,35.4 28.0C35.8 28.0,36.7 27.9,37.2 27.8C37.7 27.7,39.0 27.2,39.5 27.0C40.1 26." +
    "8,41.4 26.2,41.9 25.9C42.3 25.7,43.4 25.2,43.7 25.1C44.1 25.0,44.7 24.9,45.0 24.9C45.2 25." +
    "0,45.7 25.3,45.9 25.5C46.1 25.7,46.5 26.4,46.7 26.6C47.0 26.9,47.6 27.5,47.8 27.7C48.1 27." +
    "9,48.9 28.2,49.2 28.2C49.5 28.3,50.3 28.3,50.6 28.3C50.9 28.2,51.6 28.1,52.0 28.0C52.3 27." +
    "9,53.1 27.6,53.2 27.6 M32.2 26.1C32.3 26.0,33.0 25.2,33.3 24.9C33.6 24.6,34.3 23.9,34.6 23" +
    ".6C35.0 23.3,35.8 22.5,36.2 22.2C36.5 21.9,37.4 21.3,37.8 21.0C38.1 20.7,39.0 20.2,39.4 19" +
    ".9C39.8 19.7,40.8 19.1,41.2 18.8C41.7 18.5,42.9 17.7,43.4 17.3C43.9 17.0,45.1 16.1,45.6 15" +
    ".7C46.1 15.3,47.2 14.4,47.7 14.1C48.1 13.7,49.1 13.0,49.5 12.7C49.8 12.4,50.6 11.8,50.9 11" +
    ".6C51.3 11.3,52.0 10.8,52.3 10.5C52.6 10.2,53.4 9.6,53.7 9.3C54.0 8.9,54.8 8.1,55.2 7.7C55" +
    ".5 7.3,56.3 6.3,56.5 5.9C56.8 5.5,57.3 4.6,57.4 4.2C57.6 3.8,57.8 3.0,57.8 2.8 M37.7 20.8C" +
    "37.8 20.7,38.2 20.4,38.3 20.3 M38.8 19.5C38.8 19.4,39.0 18.8,39.0 18.6C39.0 18.4,39.1 18.0" +
    ",39.2 17.8C39.2 17.6,39.3 17.3,39.3 17.2 M41.3 18.7C41.3 18.5,41.5 17.3,41.7 16.9C41.8 16." +
    "5,42.2 15.7,42.4 15.3C42.7 14.9,43.4 14.1,43.7 13.7C44.0 13.4,44.9 12.5,45.4 12.1C45.8 11." +
    "7,46.9 10.7,47.3 10.2C47.8 9.8,48.9 8.8,49.3 8.5C49.7 8.1,50.6 7.3,51.0 7.0C51.3 6.7,52.0 " +
    "6.2,52.3 5.9C52.6 5.7,53.2 5.1,53.5 4.9C53.8 4.6,54.6 3.9,54.7 3.8 M45.1 30.9C45.1 30.8,45" +
    ".1 30.4,45.2 30.2C45.2 30.1,45.2 29.7,45.2 29.6C45.2 29.4,45.3 29.0,45.3 28.8C45.4 28.6,45" +
    ".4 28.1,45.5 27.9C45.5 27.7,45.6 27.0,45.6 26.9 M45.6 11.7C45.7 11.6,46.0 11.2,46.1 11.1 M" +
    "45.6 15.7C45.7 15.6,46.3 15.0,46.4 14.9 M45.6 23.1C45.6 23.2,45.6 23.7,45.6 23.8 M45.6 29." +
    "6C45.8 29.6,46.9 29.5,47.1 29.4C47.3 29.3,47.5 29.0,47.6 28.9 M47.6 9.6C47.7 9.5,48.0 9.2," +
    "48.1 9.1 M49.1 8.1C49.2 8.0,49.6 7.7,49.7 7.6 M49.1 27.1C49.1 27.3,49.1 28.2,49.1 28.4 M50" +
    ".7 11.7C50.8 11.6,51.1 11.2,51.2 11.1 M55.0 3.5C55.1 3.5,55.4 3.5,55.5 3.5 M55.0 30.4C55.1" +
    " 30.4,55.6 30.1,55.7 30.1 M55.7 3.3C55.9 3.3,56.8 3.3,57.0 3.3 M56.7 28.6C56.8 28.7,57.4 2" +
    "9.4,57.8 29.6C58.2 29.8,59.3 30.1,59.8 30.3C60.4 30.4,62.0 30.6,62.6 30.6C63.2 30.6,64.7 3" +
    "0.6,65.3 30.6C65.9 30.5,67.0 30.4,67.5 30.3C68.0 30.3,69.1 30.1,69.5 30.1C69.9 30.1,70.8 3" +
    "0.1,71.1 30.2C71.4 30.3,71.9 30.6,72.1 30.8C72.3 31.1,72.6 31.7,73.0 32.0C73.3 32.3,74.5 3" +
    "3.0,75.4 33.3C76.2 33.6,79.2 34.3,80.7 34.5C82.1 34.7,86.3 35.2,87.9 35.3C89.5 35.5,93.0 3" +
    "5.8,94.2 35.9C95.4 36.0,97.4 36.3,98.1 36.4C98.8 36.5,99.7 36.8,100.1 36.9C100.5 37.0,101." +
    "4 37.2,101.9 37.3C102.4 37.4,103.8 37.5,104.7 37.6C105.6 37.6,108.0 37.8,109.3 37.8C110.5 " +
    "37.9,114.6 38.0,115.3 38.0 M57.0 3.0C57.1 3.0,57.4 3.0,57.5 3.0 M73.5 29.6C73.6 29.6,73.9 " +
    "29.4,74.0 29.3C74.2 29.2,74.5 29.1,74.6 29.0C74.7 28.9,75.1 28.6,75.2 28.6 M82.8 31.9C83.0" +
    " 31.8,83.7 31.5,84.2 31.4C84.7 31.3,86.1 31.1,87.0 31.1C87.9 31.0,90.6 30.8,92.0 30.8C93.4" +
    " 30.7,97.1 30.6,98.7 30.5C100.4 30.4,105.2 30.1,106.1 30.1 M84.9 30.4C85.0 30.3,85.5 29.5," +
    "85.7 29.3C85.9 29.1,86.4 28.5,86.6 28.3C86.8 28.1,87.3 27.7,87.5 27.6C87.7 27.4,88.3 27.0," +
    "88.4 26.9 M88.9 26.6C89.0 26.6,89.3 26.6,89.4 26.6 M89.7 26.3C89.8 26.3,90.8 26.3,90.9 26." +
    "3 M99.1 22.0C98.8 22.1,97.3 22.3,96.7 22.4C96.2 22.6,95.1 22.9,94.7 23.0C94.3 23.2,93.5 23" +
    ".6,93.2 23.8C93.0 24.0,92.5 24.5,92.5 24.7C92.5 24.9,92.7 25.3,93.0 25.5C93.3 25.6,94.5 26" +
    ".0,95.1 26.1C95.6 26.2,97.3 26.4,98.0 26.5C98.7 26.5,100.4 26.5,101.0 26.5C101.7 26.5,103." +
    "1 26.5,103.7 26.4C104.3 26.4,105.8 26.3,106.1 26.3 M108.4 23.8C108.5 23.7,109.1 23.2,109.2" +
    " 23.1 M109.9 21.3C109.8 21.5,109.4 22.4,109.2 22.8C109.0 23.1,108.6 23.9,108.4 24.3C108.2 " +
    "24.6,107.7 25.4,107.5 25.8C107.4 26.2,107.0 27.0,107.0 27.3C106.9 27.6,106.8 28.2,106.9 28" +
    ".4C107.0 28.6,107.3 28.9,107.6 29.0C107.8 29.0,108.5 28.9,108.8 28.8C109.1 28.7,109.9 28.4" +
    ",110.2 28.2C110.6 28.1,111.4 27.8,111.7 27.8C112.0 27.7,112.8 27.6,113.1 27.6C113.4 27.6,1" +
    "14.2 27.6,114.5 27.7C114.8 27.7,115.5 28.0,115.8 28.1C116.1 28.2,116.7 28.6,117.0 28.8C117" +
    ".3 28.9,117.9 29.4,118.2 29.6C118.5 29.8,119.3 30.3,119.6 30.6C120.0 30.8,120.8 31.4,121.2" +
    " 31.6C121.7 31.8,122.7 32.2,123.2 32.3C123.7 32.4,124.9 32.5,125.5 32.5C126.1 32.4,127.5 3" +
    "2.2,128.1 32.1C128.8 32.0,130.4 31.8,131.1 31.7C131.7 31.7,133.4 31.7,134.0 31.7C134.7 31." +
    "7,136.2 31.9,136.8 32.0C137.3 32.1,138.6 32.2,139.0 32.3C139.5 32.3,140.5 32.4,140.9 32.4C" +
    "141.3 32.4,142.1 32.4,142.5 32.4C142.9 32.4,143.9 32.4,144.3 32.4C144.8 32.4,145.8 32.5,14" +
    "6.2 32.5C146.6 32.5,147.4 32.4,147.7 32.4C148.0 32.3,148.5 32.1,148.7 32.0C148.9 31.9,149." +
    "3 31.6,149.4 31.4C149.6 31.2,149.9 30.8,150.0 30.7 M110.2 15.7C110.3 15.7,110.9 15.5,111.0" +
    " 15.5 M119.6 28.6C119.6 28.7,119.6 29.3,119.6 29.4 M122.4 54.7C122.3 54.6,121.7 54.3,121.6" +
    " 54.2C121.5 54.0,121.2 53.7,121.2 53.5C121.1 53.3,121.2 52.8,121.3 52.5C121.3 52.2,121.7 5" +
    "1.5,121.9 51.2C122.1 50.9,122.6 50.0,122.9 49.6C123.3 49.2,124.1 48.3,124.5 47.8C124.9 47." +
    "3,126.0 46.2,126.5 45.7C127.0 45.3,128.2 44.1,128.7 43.7C129.2 43.2,130.3 42.2,130.7 41.9C" +
    "131.1 41.5,132.0 40.8,132.3 40.6C132.7 40.3,133.3 39.9,133.5 39.8C133.7 39.6,134.1 39.3,13" +
    "4.3 39.2C134.5 39.1,134.9 38.8,135.1 38.6C135.3 38.4,135.7 38.0,135.9 37.8C136.1 37.6,136." +
    "6 37.1,136.9 36.8C137.1 36.6,137.7 35.9,137.9 35.6C138.2 35.3,138.7 34.6,139.0 34.3C139.3 " +
    "34.0,140.0 33.1,140.1 32.9 M142.6 31.9C142.7 31.6,143.5 30.0,143.8 29.4C144.0 28.8,144.5 2" +
    "7.6,144.7 27.0C144.9 26.5,145.3 25.1,145.4 24.8 M145.4 24.6C145.7 24.6,147.2 24.8,147.8 24" +
    ".8C148.4 24.9,149.7 25.0,150.3 25.0C150.8 25.1,152.5 25.3,152.8 25.3 M148.5 34.2C148.6 34." +
    "1,149.1 33.6,149.3 33.5C149.4 33.3,149.8 32.9,150.0 32.7C150.1 32.5,150.5 32.0,150.6 31.8C" +
    "150.7 31.5,150.9 30.9,151.0 30.6C151.1 30.3,151.2 29.7,151.3 29.4C151.4 29.1,151.7 28.5,15" +
    "1.8 28.2C152.0 27.9,152.3 27.3,152.5 27.0C152.7 26.8,153.1 26.2,153.3 25.9C153.5 25.6,154." +
    "0 25.1,154.2 24.9C154.4 24.6,154.8 24.1,155.0 23.9C155.2 23.7,155.5 23.1,155.7 22.9C155.8 " +
    "22.6,156.2 21.9,156.3 21.6C156.5 21.2,156.8 20.4,157.0 20.0C157.1 19.6,157.5 18.4,157.6 18" +
    ".2 M152.0 32.2C152.2 32.1,153.2 31.7,153.5 31.6C153.8 31.5,154.5 31.2,154.7 31.2C155.0 31." +
    "1,155.3 30.9,155.5 30.9C155.6 30.8,155.8 30.7,155.8 30.7 M156.3 30.4C156.4 30.4,156.7 30.4" +
    ",156.8 30.4 M157.1 30.1C157.3 30.2,158.2 30.9,158.6 31.2C159.0 31.4,159.9 32.0,160.4 32.2C" +
    "160.8 32.4,162.0 32.8,162.5 33.0C163.0 33.1,164.3 33.3,164.8 33.3C165.3 33.4,166.4 33.4,16" +
    "6.9 33.4C167.4 33.4,168.4 33.3,168.9 33.3C169.4 33.3,170.8 33.2,171.0 33.2 M171.0 31.7C171" +
    ".0 31.8,171.2 32.2,171.3 32.3C171.4 32.3,171.7 32.5,171.8 32.4C171.9 32.4,172.3 32.2,172.5" +
    " 32.0C172.7 31.9,173.2 31.4,173.4 31.2C173.6 31.0,174.4 30.2,174.5 30.1 M177.6 18.7C177.5 " +
    "18.8,177.3 19.7,177.1 19.9C177.0 20.2,176.8 20.9,176.7 21.2C176.6 21.5,176.4 22.1,176.3 22" +
    ".4C176.2 22.8,175.9 23.6,175.9 24.0C175.8 24.5,175.6 25.6,175.5 26.1C175.4 26.6,175.3 27.8" +
    ",175.3 28.4C175.3 28.9,175.3 30.1,175.4 30.6C175.5 31.1,175.8 32.1,176.0 32.6C176.2 33.0,1" +
    "76.8 34.0,177.3 34.4C177.7 34.8,179.0 35.6,179.7 35.9C180.4 36.1,182.5 36.6,183.4 36.8C184" +
    ".4 36.9,186.7 37.1,187.6 37.1C188.5 37.1,190.4 37.1,191.1 37.0C191.8 37.0,193.0 36.8,193.5" +
    " 36.7C194.0 36.6,195.0 36.4,195.4 36.3C195.9 36.2,197.1 36.0,197.7 35.9C198.4 35.8,200.0 3" +
    "5.7,200.8 35.6C201.5 35.6,203.4 35.5,204.1 35.5C204.9 35.5,206.5 35.6,207.1 35.6C207.7 35." +
    "6,209.0 35.8,209.5 35.8C210.0 35.8,211.3 36.0,211.5 36.0";

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
        <div class="sigline"><div class="rule">
          <svg id="sigsvg" width="228" height="63" viewBox="0 0 228 63" aria-hidden="true">
            <path id="sigpath" d="${SIG_PATH}"/></svg></div>
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
        <div class="sigline"><div class="rule">
          <svg width="228" height="63" viewBox="0 0 228 63" aria-hidden="true">
            <path class="sigpath" d="${SIG_PATH}"/></svg></div>
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
        <div class="sigline"><div class="rule">
          ${signed ? `<svg width="228" height="63" viewBox="0 0 228 63" aria-hidden="true">
            <path class="sigpath" d="${SIG_PATH}"/></svg>` : ""}</div>
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

  /* SIG_PATH is exported so the set piece can end an introduction with the
     SAME hand that signs every Act. One signature, traced once by
     tools/tracesig.js, drawn by two ceremonies. */
  return { render, reset, onUpdate, stageTrack, SIG_PATH };
})();
