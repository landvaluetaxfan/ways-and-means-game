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
  /* Traced from sig-in.png by tools/tracesig.js. Centreline, one <path>,
     because the ceremony draws it with a single stroke-dashoffset sweep.
     Regenerate rather than editing by hand. */
  /* Traced from sig-in.png by tools/tracesig.js. Centreline, one <path>,
     because the ceremony draws it with a single stroke-dashoffset sweep.
     Regenerate rather than editing by hand. */
  const SIG_PATH =
    "M3.0 36.5C3.0 36.3,2.9 35.5,3.0 35.2C3.2 34.9,3.8 35.1,4.1 34.7C4.3 34.3,4.3 33.3,4.6 32.9" +
    "C4.8 32.6,5.2 32.8,5.3 32.7C5.4 32.6,5.2 32.3,5.3 32.2C5.4 32.0,5.8 32.2,6.1 31.9C6.3 31.7" +
    ",6.6 30.9,6.8 30.7C7.1 30.4,7.2 30.8,7.3 30.7C7.5 30.5,7.6 30.1,7.9 29.9C8.1 29.7,8.3 29.9" +
    ",8.6 29.6C8.9 29.4,9.5 28.9,9.6 28.6C9.8 28.4,9.4 28.2,9.6 28.1C9.8 28.0,10.5 28.0,10.9 27" +
    ".9C11.3 27.7,11.7 27.1,12.2 27.1C12.6 27.1,12.3 27.5,13.7 27.6C15.1 27.7,19.3 27.5,20.5 27" +
    ".6C21.8 27.7,21.2 28.0,21.3 28.1C21.3 28.3,20.9 28.1,20.8 28.6C20.7 29.2,20.7 30.9,20.8 31" +
    ".4C20.8 31.9,20.6 31.6,21.0 31.7C21.5 31.7,23.1 31.7,23.6 31.7C24.0 31.6,23.3 31.5,23.6 31" +
    ".4C23.8 31.4,24.5 31.5,24.8 31.4C25.2 31.3,25.3 30.8,25.6 30.7C25.8 30.5,26.2 30.7,26.3 30" +
    ".7 M12.7 26.9C12.8 26.6,12.6 26.0,13.2 25.3C13.7 24.7,15.3 23.3,16.0 22.8C16.6 22.3,16.8 2" +
    "2.7,17.2 22.3C17.7 21.9,18.2 20.7,18.7 20.3C19.3 19.8,20.0 19.9,20.5 19.5C21.0 19.1,21.3 1" +
    "8.4,21.8 18.0C22.3 17.6,23.2 17.5,23.6 17.2C23.9 17.0,23.7 16.6,24.1 16.5C24.4 16.3,25.3 1" +
    "6.3,25.6 16.2C25.9 16.1,25.8 16.0,25.8 16.0C25.8 15.9,25.6 16.0,25.6 16.0 M13.7 24.6C13.8 " +
    "24.4,14.3 23.9,14.4 23.8 M20.5 31.4C20.4 31.5,19.9 31.1,19.5 31.7C19.1 32.2,18.5 33.9,18.2" +
    " 34.7C18.0 35.5,18.2 36.0,18.2 36.5C18.3 37.0,17.8 37.5,18.7 37.7C19.7 38.0,23.0 38.2,23.8" +
    " 38.3 M21.5 27.6C21.6 27.6,21.7 27.4,21.8 27.4 M27.9 32.2C27.7 31.9,26.8 31.0,26.6 30.7C26" +
    ".4 30.3,26.3 30.4,26.6 30.1C26.9 29.9,28.2 29.0,28.6 28.9C29.0 28.7,29.1 28.9,29.1 29.1C29" +
    ".1 29.3,28.7 29.7,28.6 30.1C28.5 30.6,28.7 31.5,28.6 31.9C28.5 32.3,28.2 32.1,28.1 32.4C28" +
    ".0 32.8,28.1 33.7,28.1 33.9 M28.1 29.1C28.2 29.0,28.5 28.8,28.6 28.6C28.7 28.4,28.6 28.0,2" +
    "8.6 27.9 M28.6 12.4C28.5 12.7,28.4 13.4,28.1 13.9C27.8 14.5,27.2 15.4,26.9 15.7C26.5 16.0," +
    "26.2 15.6,26.1 16.0C26.0 16.3,26.2 17.2,26.1 17.7C26.0 18.3,26.0 18.6,25.6 19.3C25.2 19.9," +
    "23.9 21.2,23.6 21.8C23.2 22.4,23.9 22.0,23.6 22.8C23.3 23.6,22.0 25.6,21.8 26.3C21.5 27.1," +
    "21.5 27.3,22.0 27.4C22.6 27.4,24.1 26.9,25.1 26.9C26.1 26.8,27.3 26.7,27.9 26.9C28.5 27.0," +
    "28.4 27.5,28.6 27.6C28.9 27.7,29.1 27.7,29.4 27.6C29.7 27.5,29.9 27.1,30.4 26.9C30.9 26.6," +
    "31.7 26.2,32.2 26.3C32.6 26.5,32.8 27.4,33.2 27.6C33.6 27.8,34.2 27.4,34.5 27.6C34.7 27.8," +
    "34.5 28.4,34.7 28.6C34.9 28.8,34.9 29.0,35.7 28.9C36.5 28.7,38.3 28.2,39.5 27.6C40.8 27.0," +
    "42.6 25.9,43.3 25.3C44.1 24.8,43.7 24.5,44.1 24.3C44.5 24.1,45.3 24.1,45.6 24.1C45.9 24.1," +
    "45.8 23.9,45.9 24.3C45.9 24.8,45.5 26.1,45.9 26.9C46.2 27.6,47.4 28.6,47.9 28.9C48.4 29.2," +
    "48.4 28.6,48.9 28.6C49.4 28.6,50.1 29.0,50.7 28.9C51.3 28.7,52.0 27.8,52.4 27.6C52.9 27.4," +
    "53.1 27.6,53.2 27.6 M32.2 26.1C32.3 25.9,32.4 25.4,32.7 25.1C33.0 24.8,33.2 25.0,33.9 24.3" +
    "C34.7 23.7,36.4 21.8,37.0 21.3C37.6 20.7,37.5 21.3,37.7 21.0C38.0 20.8,38.2 20.0,38.8 19.8" +
    "C39.3 19.5,40.3 19.9,41.0 19.5C41.8 19.1,42.3 18.1,43.1 17.5C43.8 16.9,44.7 16.6,45.6 16.0" +
    "C46.5 15.3,48.0 14.1,48.6 13.4C49.3 12.8,49.3 12.4,49.7 12.2C50.0 11.9,50.2 12.2,50.7 11.9" +
    "C51.2 11.6,52.2 10.8,52.7 10.4C53.2 10.0,53.2 9.6,53.5 9.4C53.7 9.2,53.5 9.8,54.2 9.1C55.0" +
    " 8.4,57.3 6.3,58.0 5.3C58.7 4.3,58.6 3.5,58.5 3.0C58.5 2.6,57.9 2.8,57.8 2.8 M37.7 20.8C37" +
    ".8 20.7,38.2 20.4,38.3 20.3 M38.8 19.5C38.8 19.3,38.6 18.9,38.8 18.5C38.9 18.1,39.4 17.4,3" +
    "9.5 17.2C39.6 17.0,39.3 17.2,39.3 17.2 M41.3 18.7C41.0 18.5,39.5 17.7,39.8 17.0C40.0 16.3," +
    "42.2 14.9,42.8 14.4C43.4 14.0,43.0 14.8,43.3 14.4C43.7 14.1,44.3 12.7,44.8 12.2C45.4 11.6," +
    "45.6 12.0,46.6 11.1C47.6 10.3,49.9 7.6,50.7 6.8C51.5 6.1,51.2 7.0,51.4 6.8C51.6 6.7,51.6 6" +
    ".4,51.9 6.1C52.3 5.8,53.2 5.4,53.7 5.1C54.2 4.7,54.6 4.0,54.7 3.8 M45.1 30.9C45.1 30.7,45." +
    "1 30.1,45.1 29.9C45.1 29.7,45.3 30.1,45.3 29.9C45.3 29.7,45.1 29.2,45.1 28.9C45.1 28.6,45." +
    "5 28.5,45.6 28.1C45.7 27.8,45.6 27.1,45.6 26.9 M45.6 11.7C45.7 11.6,46.0 11.2,46.1 11.1 M4" +
    "5.6 15.7C45.7 15.6,46.2 15.1,46.4 14.9 M45.6 23.1C45.6 23.2,45.6 23.7,45.6 23.8 M45.6 29.6" +
    "C45.9 29.6,46.8 29.5,47.1 29.4C47.5 29.3,47.5 29.0,47.6 28.9 M47.6 9.6C47.7 9.5,48.0 9.2,4" +
    "8.1 9.1 M49.1 8.1C49.2 8.0,49.6 7.7,49.7 7.6 M49.1 27.1C49.1 27.3,49.1 28.2,49.1 28.4 M50." +
    "7 11.7C50.8 11.6,51.1 11.2,51.2 11.1 M55.0 3.5C55.1 3.5,55.4 3.5,55.5 3.5 M55.0 30.4C55.1 " +
    "30.4,55.6 30.2,55.7 30.1 M55.7 3.3C55.9 3.3,56.8 3.3,57.0 3.3 M56.7 28.6C56.6 28.8,56.1 29" +
    ".5,56.0 29.9C55.9 30.3,54.6 30.7,56.2 30.9C57.9 31.1,64.3 30.9,65.9 30.9C67.5 30.9,65.7 30" +
    ".7,65.9 30.7C66.0 30.6,66.4 30.8,66.9 30.7C67.4 30.5,67.9 29.8,68.9 29.6C69.9 29.5,72.2 29" +
    ".6,73.0 29.6C73.7 29.7,73.3 29.6,73.2 29.9C73.2 30.2,73.1 31.0,72.7 31.7C72.3 32.3,71.2 33" +
    ".4,70.9 33.9C70.7 34.5,67.0 35.0,71.2 35.2C75.3 35.4,91.3 35.0,95.8 35.2C100.2 35.4,97.4 3" +
    "6.1,98.0 36.2C98.6 36.4,99.0 36.1,99.3 36.2C99.6 36.4,99.6 36.8,99.8 37.0C100.1 37.2,100.2" +
    " 37.4,100.8 37.5C101.5 37.6,103.0 37.4,103.6 37.5C104.2 37.6,102.7 37.9,104.6 38.0C106.6 3" +
    "8.1,113.5 38.0,115.3 38.0 M57.0 3.0C57.1 3.0,57.4 3.0,57.5 3.0 M73.5 29.6C73.6 29.6,73.8 2" +
    "9.8,74.0 29.6C74.1 29.5,74.3 29.0,74.5 28.9C74.7 28.7,75.1 28.7,75.2 28.6 M82.8 31.9C82.9 " +
    "31.8,83.1 31.4,83.3 31.2C83.6 30.9,84.4 30.7,84.6 30.7C84.9 30.6,81.6 30.9,84.9 30.9C88.1 " +
    "30.9,100.6 31.0,104.1 30.9C107.7 30.8,105.8 30.3,106.1 30.1 M84.9 30.4C84.9 30.2,84.8 29.6" +
    ",85.1 29.1C85.4 28.7,86.2 28.1,86.6 27.9C87.1 27.6,87.6 27.8,87.9 27.6C88.2 27.4,88.3 27.0" +
    ",88.4 26.9 M88.9 26.6C89.0 26.6,89.3 26.6,89.4 26.6 M89.7 26.3C89.9 26.3,90.7 26.3,90.9 26" +
    ".3 M99.1 22.0C98.6 22.0,97.4 21.9,96.5 22.0C95.6 22.2,94.3 22.5,93.7 22.8C93.1 23.1,93.4 2" +
    "3.5,93.0 23.8C92.6 24.1,91.7 24.3,91.5 24.6C91.2 24.9,91.2 25.2,91.2 25.6C91.2 25.9,89.9 2" +
    "6.4,91.5 26.6C93.0 26.8,98.8 26.9,100.6 26.9C102.4 26.9,102.1 26.7,102.3 26.6C102.6 26.5,1" +
    "01.7 26.4,102.3 26.3C103.0 26.3,105.5 26.3,106.1 26.3 M108.4 23.8C108.6 23.7,109.1 23.2,10" +
    "9.2 23.1 M109.9 21.3C109.9 21.5,110.0 22.0,109.7 22.5C109.4 23.1,108.5 23.7,108.2 24.3C107" +
    ".8 24.9,108.0 25.7,107.7 26.1C107.3 26.5,106.4 26.0,106.1 26.6C105.9 27.2,106.1 29.3,106.1" +
    " 29.9C106.2 30.5,105.9 30.3,106.4 30.1C106.9 30.0,108.6 29.5,109.2 29.1C109.8 28.8,109.4 2" +
    "8.2,109.9 27.9C110.5 27.5,111.7 27.1,112.2 27.1C112.7 27.1,112.7 27.5,113.0 27.6C113.3 27." +
    "7,113.4 27.7,114.0 27.6C114.6 27.5,116.3 26.6,116.8 26.9C117.3 27.1,117.0 28.9,117.0 29.4C" +
    "117.1 29.9,116.8 29.6,117.3 29.6C117.8 29.7,119.5 29.2,120.1 29.6C120.6 30.1,120.2 31.6,12" +
    "0.6 32.2C121.0 32.8,121.8 33.0,122.6 33.2C123.5 33.4,124.9 33.3,125.7 33.2C126.4 33.1,126." +
    "3 33.2,127.2 32.7C128.1 32.2,129.7 30.4,131.0 30.1C132.2 29.9,133.8 31.0,134.8 31.4C135.7 " +
    "31.8,135.6 32.2,136.5 32.4C137.5 32.6,139.9 32.7,140.6 32.7C141.3 32.7,140.3 32.5,140.6 32" +
    ".4C140.9 32.3,142.2 32.2,142.6 32.2C143.0 32.2,142.0 32.4,142.9 32.4C143.7 32.5,146.8 32.3" +
    ",147.7 32.4C148.6 32.5,148.0 32.9,148.2 32.9C148.4 33.0,148.7 33.0,149.0 32.7C149.2 32.3,1" +
    "49.3 31.2,149.5 30.9C149.6 30.6,149.9 30.7,150.0 30.7 M110.2 15.7C110.3 15.7,110.8 15.5,11" +
    "1.0 15.5 M119.6 28.6C119.6 28.8,119.6 29.3,119.6 29.4 M122.4 54.7C122.1 54.7,121.1 54.7,12" +
    "0.8 54.5C120.5 54.3,120.6 53.6,120.6 53.5C120.6 53.3,120.7 53.9,120.8 53.5C121.0 53.0,121." +
    "0 51.5,121.3 50.9C121.7 50.3,122.5 50.3,122.9 49.9C123.2 49.5,122.8 49.1,123.4 48.4C124.0 " +
    "47.7,125.5 46.7,126.4 45.9C127.3 45.0,127.8 43.8,128.7 43.1C129.6 42.3,131.1 41.8,131.7 41" +
    ".3C132.4 40.7,132.4 40.0,132.7 39.8C133.1 39.5,133.5 39.9,133.8 39.8C134.1 39.6,134.3 39.1" +
    ",134.5 39.0C134.7 38.9,134.9 39.1,135.0 39.0C135.2 38.9,134.9 38.6,135.3 38.3C135.7 37.9,1" +
    "36.9 37.2,137.3 36.7C137.7 36.3,137.3 36.1,137.6 35.7C137.9 35.4,138.7 35.2,139.1 34.7C139" +
    ".5 34.2,139.9 33.2,140.1 32.9 M142.6 31.9C142.9 31.3,143.7 29.1,144.1 28.4C144.6 27.6,145." +
    "2 28.0,145.4 27.4C145.6 26.8,145.4 25.2,145.4 24.8 M145.4 24.6C145.9 24.6,147.8 24.5,148.5" +
    " 24.6C149.1 24.7,148.5 25.0,149.2 25.1C149.9 25.2,152.2 25.3,152.8 25.3 M148.5 34.2C148.5 " +
    "34.0,148.4 33.1,148.7 32.9C149.0 32.8,149.7 33.3,150.2 33.2C150.7 33.1,151.7 32.9,151.7 32" +
    ".4C151.7 32.0,150.3 30.9,150.2 30.4C150.2 29.9,151.3 29.5,151.5 29.1C151.7 28.8,151.3 28.7" +
    ",151.5 28.4C151.7 28.0,152.3 27.6,152.5 27.1C152.7 26.6,152.4 26.0,152.8 25.6C153.1 25.2,1" +
    "54.4 25.1,154.8 24.8C155.2 24.5,154.9 24.1,155.0 23.8C155.2 23.5,155.7 23.3,155.8 23.1C155" +
    ".9 22.8,155.5 23.1,155.8 22.5C156.1 22.0,157.3 20.5,157.6 19.8C157.9 19.0,157.6 18.5,157.6" +
    " 18.2 M152.0 32.2C152.3 32.0,152.9 31.6,153.5 31.4C154.2 31.2,155.4 31.0,155.8 30.9C156.2 " +
    "30.8,156.1 30.7,156.1 30.7C156.1 30.6,155.8 30.7,155.8 30.7 M156.3 30.4C156.4 30.4,156.7 3" +
    "0.4,156.8 30.4 M157.1 30.1C157.3 30.2,157.9 30.2,158.3 30.7C158.8 31.1,159.1 32.2,159.6 32" +
    ".7C160.1 33.2,160.5 33.5,161.6 33.7C162.8 33.9,165.5 33.8,166.4 33.7C167.4 33.6,167.0 33.2" +
    ",167.2 33.2C167.4 33.1,167.1 33.4,167.7 33.4C168.3 33.4,170.5 33.2,171.0 33.2 M171.0 31.7C" +
    "171.0 31.9,170.9 32.7,171.0 32.9C171.1 33.2,171.3 33.2,171.5 33.2C171.8 33.1,172.3 33.0,17" +
    "2.5 32.7C172.7 32.3,172.4 31.6,172.8 31.2C173.1 30.7,174.3 30.3,174.5 30.1 M177.6 18.7C177" +
    ".5 19.0,177.5 19.9,177.3 20.3C177.2 20.6,176.8 20.7,176.6 21.0C176.4 21.4,176.2 21.9,176.1" +
    " 22.3C176.0 22.7,176.2 23.2,176.1 23.6C175.9 23.9,175.5 23.2,175.3 24.3C175.1 25.4,174.8 2" +
    "9.1,174.8 30.1C174.8 31.2,175.2 30.3,175.3 30.7C175.4 31.0,175.2 31.5,175.3 32.2C175.4 32." +
    "8,175.5 33.7,176.1 34.5C176.6 35.3,178.0 36.5,178.6 37.0C179.2 37.5,177.4 37.4,179.6 37.5C" +
    "181.8 37.6,189.6 37.6,191.8 37.5C193.9 37.4,192.2 37.1,192.5 37.0C192.9 36.9,193.4 37.1,19" +
    "3.8 37.0C194.2 36.9,194.3 36.4,194.8 36.2C195.3 36.1,196.2 36.1,196.8 36.0C197.5 35.8,197." +
    "0 35.3,198.6 35.2C200.2 35.1,204.9 35.2,206.5 35.2C208.1 35.3,207.8 35.3,208.2 35.5C208.7 " +
    "35.6,208.5 35.9,209.0 36.0C209.5 36.1,211.1 36.0,211.5 36.0";

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
