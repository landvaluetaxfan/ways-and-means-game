/* ENCODING INTEGRITY. Every source file is UTF-8, without a BOM, with Unix
   line endings, and with no character that is the wreckage of a bad decode.

   This check exists because the same accident happened twice and neither the
   eye nor a hand-written test caught it. A Windows shell printed correct UTF-8
   as Windows-1252, so one em dash drew as the three characters U+00E2 U+20AC
   U+201D. An agent believed the display, "fixed" the phantom by rewriting the
   file through that same codec, and committed real corruption plus a BOM. It
   reached `js/ui.js` and shipped: TONE_MARK's `−` and `·` each went out as
   that kind of wreckage, so the live dossier printed mojibake between every
   field.

   It survived a verification pass too. The test asked whether the deployed
   bytes contained `Ã` followed by a continuation byte — but double-encoded
   UTF-8, once correctly decoded, reads `Â`, not `Ã`. The test looked for the
   raw-byte spelling of the damage in an already-decoded string, matched
   nothing, and reported the file clean.

   So the check here does not pattern-match the damage. It tries to REVERSE it:
   a run of characters is mojibake if, and only if, re-encoding it as CP1252
   yields bytes that decode as one valid non-ASCII character. That is decidable,
   it has no false positives of the kind above, and it is also the repair —
   `--fix` writes back exactly what the check proved.

   Repairing per RUN rather than per FILE matters: `js/ui.js` was only partly
   mangled, and a whole-file reversal would have destroyed the characters that
   were still right.

   One last thing, before you make this comment more vivid: prose that spells
   the damage out literally IS the damage, and this file would then fail its
   own check. Name the code points, as above. */

const fs = require("fs"), { execSync } = require("child_process");

/* CP1252 is Latin-1 except for 0x80-0x9F, which is where the damage lives:
   these are the bytes that a bad decode turns into curly quotes, dashes and
   currency marks — the tell-tale characters of mojibake. */
const HIGH = {0x80:0x20AC,0x82:0x201A,0x83:0x0192,0x84:0x201E,0x85:0x2026,0x86:0x2020,
  0x87:0x2021,0x88:0x02C6,0x89:0x2030,0x8A:0x0160,0x8B:0x2039,0x8C:0x0152,0x8E:0x017D,
  0x91:0x2018,0x92:0x2019,0x93:0x201C,0x94:0x201D,0x95:0x2022,0x96:0x2013,0x97:0x2014,
  0x98:0x02DC,0x99:0x2122,0x9A:0x0161,0x9B:0x203A,0x9C:0x0153,0x9E:0x017E,0x9F:0x0178};
const TO_BYTE = new Map();
for (const [b, u] of Object.entries(HIGH)) TO_BYTE.set(u, Number(b));

const cpByte = ch => {                     /* one character -> its CP1252 byte */
  const c = ch.codePointAt(0);
  if (c >= 0xA0 && c <= 0xFF) return c;
  return TO_BYTE.has(c) ? TO_BYTE.get(c) : -1;
};

const dec = new TextDecoder("utf-8", { fatal: true });

/* Reverse every run that provably IS a mojibake'd character. Longest first, so
   a four-byte sequence is not mistaken for a two-byte one sitting next to it. */
function undoOnce(s) {
  let out = "", i = 0, hits = 0;
  while (i < s.length) {
    let matched = false;
    for (let len = 4; len >= 2 && !matched; len--) {
      if (i + len > s.length) continue;
      const chars = [...s.slice(i, i + len)];
      if (chars.length !== len) continue;
      const bytes = chars.map(cpByte);
      if (bytes.some(b => b < 0)) continue;
      if (bytes[0] < 0xC2 || bytes[0] > 0xF4) continue;          /* a lead byte */
      if (bytes.slice(1).some(b => b < 0x80 || b > 0xBF)) continue; /* the rest */
      let text;
      try { text = dec.decode(Uint8Array.from(bytes)); } catch { continue; }
      if ([...text].length !== 1) continue;        /* exactly one character out */
      out += text; i += len; matched = true; hits++;
    }
    if (!matched) { out += s[i]; i++; }
  }
  return { text: out, hits };
}

function repair(s) {                    /* twice-encoded files need two passes */
  let cur = s, hits = 0;
  for (let round = 0; round < 4; round++) {
    const r = undoOnce(cur);
    if (!r.hits || r.text === cur) break;
    cur = r.text; hits += r.hits;
  }
  return { text: cur, hits };
}

const BINARY = /\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|mp3|ogg|wav|mid|midi|pdf|zip)$/i;
const files = execSync("git ls-files", { encoding: "utf8" })
  .trim().split("\n").filter(f => f && !BINARY.test(f));

const fix = process.argv.includes("--fix");
const bad = [];
let repaired = 0;

for (const f of files) {
  const buf = fs.readFileSync(f);
  const bom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  let s = buf.toString("utf8");
  if (bom) s = s.slice(1);

  const { text, hits } = repair(s);
  const cr = (s.match(/\r/g) || []).length;
  const lost = (text.match(/\uFFFD/g) || []).length;

  if (!bom && !hits && !cr && !lost) continue;

  const faults = [];
  if (bom)  faults.push("a BOM");
  if (hits) faults.push(`${hits} mojibake sequence${hits === 1 ? "" : "s"}`);
  if (cr)   faults.push(`${cr} CR`);
  /* A replacement character is a byte that is already gone: reversing cannot
     invent it back, so it is reported for a human even under --fix. */
  if (lost) faults.push(`${lost} U+FFFD (unrecoverable — restore from git)`);

  if (fix && (bom || hits || cr)) {
    fs.writeFileSync(f, Buffer.from(text.replace(/\r\n?/g, "\n"), "utf8"));
    repaired++;
    console.log(`  fix  ${f} — ${faults.join(", ")}`);
    if (!lost) continue;
  }
  bad.push(`${f} — ${faults.join(", ")}`);
}

console.log("ENCODING CHECK");
console.log("=".repeat(50));
console.log(`  text files checked:   ${files.length}`);
if (fix) console.log(`  files repaired:       ${repaired}`);
console.log("");

if (bad.length && !fix) {
  bad.forEach(b => console.log("  FAIL " + b));
  console.log(`\n${bad.length} ENCODING FAILURE${bad.length === 1 ? "" : "S"}` +
              " — run `node tools/enccheck.js --fix`");
  process.exit(1);
}
if (bad.length) {                    /* --fix ran but something is unrecoverable */
  bad.forEach(b => console.log("  WARN " + b));
  process.exit(1);
}
console.log(`  ok   every source file is UTF-8, no BOM, LF, no bad decode`);
console.log("\nencoding is healthy");
