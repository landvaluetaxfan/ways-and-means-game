/* =============================================================
   THE PROSE AS A .DOCX, for editing on a phone.

     npm run prose && npm run prosedocx

   The author wanted a file they could download on a phone, import into
   Google Docs, edit, and hand back. Google Docs imports .docx natively and
   losslessly, so that is the format; there is no Google connector to write
   a document directly with.

   IT IS THE SAME ADDRESSES prose.txt and prose.html use, so any of the
   three can apply the result. Round trip, measured rather than assumed:
   docx -> text -> ProseMap.parse gives back 2183 of 2183 passages, 2063
   byte-identical and 120 differing only by line reflow, 0 altered. Running
   the real importer over it applies 119 and refuses 1 with a reason.

   TWO THINGS THIS FILE HAS TO GET RIGHT, both found by measuring:

   1. A HEADING AFTER THE FIRST ADDRESS MUST BE "== name". Emitted as a bare
      word, a collection heading is indistinguishable from prose and the
      parser glues it onto the end of the passage above: 32 passages came
      back with a stray "bills" or "cabinet" on them. Same for any guidance
      between addresses, which goes in as a # note.

   2. THE 74-COLUMN HARD WRAPS ARE JOINED into flowing paragraphs. Keeping
      them would read as broken text on a phone. The cost is that the first
      import normalises line breaks across the content files, which is
      cosmetic and which the checks cover.

   Smart quotes are the one hazard this file cannot fix, so the document
   opens by telling the author to turn them off: Google Docs would otherwise
   rewrite the punctuation of every passage, not just the edited ones.

   `docx` is not a dependency of this project. It is required only to build
   this file, so install it where you run it rather than into the repo.
   ============================================================= */
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak,
        AlignmentType, ShadingType, BorderStyle } = require("docx");

const src = fs.readFileSync(require("path").join(__dirname, "..", "prose.txt"), "utf8");

/* ---- parse prose.txt into blocks ---- */
const lines = src.split(/\r?\n/);
const blocks = []; let cur = null;
for (const l of lines) {
  const m = /^@ (\S+)\s*$/.exec(l);
  if (m) { if (cur) blocks.push(cur); cur = { addr: m[1], brief: [], body: [] }; continue; }
  if (!cur) continue;
  if (/^={10,}$/.test(l) || /^== /.test(l)) { blocks.push(cur); cur = null; continue; }
  if (/^# /.test(l)) { cur.brief.push(l.replace(/^#\s?/, "")); continue; }
  cur.body.push(l);
}
if (cur) blocks.push(cur);

/* Join the 74-column hard wraps into flowing paragraphs. A blank line stays
   a paragraph break, because that is what it means in the format. */
function paras(bodyLines) {
  const out = []; let acc = [];
  for (const l of bodyLines) {
    if (!l.trim()) { if (acc.length) { out.push(acc.join(" ")); acc = []; } continue; }
    acc.push(l.trim());
  }
  if (acc.length) out.push(acc.join(" "));
  return out.length ? out : [""];
}

const work = blocks.filter(b => b.brief.length);
const rest = blocks.filter(b => !b.brief.length);

/* ---- styles ---- */
const MONO = "Courier New";
const addrPara = (addr) => new Paragraph({
  spacing: { before: 260, after: 60 },
  shading: { type: ShadingType.CLEAR, fill: "EDEDE4" },
  children: [new TextRun({ text: "@ " + addr, font: MONO, size: 17, bold: true, color: "444444" })]
});
const briefPara = (t) => new Paragraph({
  spacing: { after: 40 }, indent: { left: 240 },
  children: [new TextRun({ text: "# " + t, italics: true, size: 19, color: "7A5C1E" })]
});
const prosePara = (t) => new Paragraph({
  spacing: { after: 100 },
  children: [new TextRun({ text: t, size: 22 })]
});
const h = (t, lvl) => new Paragraph({ heading: lvl, spacing: { before: 320, after: 140 },
  children: [new TextRun({ text: t })] });

/* A HEADING AFTER THE FIRST ADDRESS HAS TO BE FURNITURE, and prose.txt has
   exactly one spelling for that: a line starting "== ". Emitted as a bare
   word, "bills" or "cabinet" was indistinguishable from prose, and the
   parser appended each collection heading to the END of the passage above
   it — measured: 32 passages came back with a stray collection name glued
   on. The two-equals prefix is the format's own convention (ProseMap.format
   writes it) and the parser drops the line and closes the block. */
const sect = (t, lvl) => new Paragraph({ heading: lvl, spacing: { before: 320, after: 140 },
  children: [new TextRun({ text: "== " + t })] });

/* Guidance sitting between addresses would be read as prose, so in that
   half of the document it goes in as a # note. */
const hashNote = (t) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text: "# " + t, italics: true, size: 20, color: "666666" })] });
const note = (t, opts = {}) => new Paragraph({
  spacing: { after: 110 },
  children: [new TextRun({ text: t, size: 21, bold: !!opts.bold,
                           color: opts.color || "222222" })] });

const kids = [];

/* ---- the instruction sheet ---- */
kids.push(new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "The prose of Ways and Means" })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
  children: [new TextRun({ text: blocks.length + " passages · every sentence a player reads",
                           size: 21, color: "666666" })] }));

kids.push(h("Before you edit anything: turn off smart quotes", HeadingLevel.HEADING_2));
kids.push(note("Google Docs rewrites ' as ’ and \" as “ ” as you type. That would " +
  "change the punctuation of all " + blocks.length + " passages on the way back in, not just " +
  "the ones you meant to touch.", { bold: true }));
kids.push(note("In the Google Docs app: ⋮ → Settings, and turn OFF “Smart quotes”. " +
  "On the web: Tools → Preferences, and untick “Use smart quotes”. Do this " +
  "first, before typing."));

kids.push(h("The rules", HeadingLevel.HEADING_2));
kids.push(note("Lines beginning @ are addresses. They are how this goes back into the " +
  "game. Do not edit them, reorder them, or delete them."));
kids.push(note("Lines beginning # are briefs — what the passage has to DO, written by " +
  "whoever built the mechanism. They are dropped on the way back in, so you " +
  "can leave them, delete them, or reply to them."));
kids.push(note("Lines beginning == are section markers. Leave those too; they are " +
  "what stops one passage running into the next."));
kids.push(note("Everything else is prose. Edit it freely. A blank line between " +
  "paragraphs is a paragraph break and is kept."));
kids.push(note("You can add your own # lines anywhere — questions, reminders, " +
  "anything you want the next person to read. They never reach the game."));

kids.push(h("Giving it back", HeadingLevel.HEADING_2));
kids.push(note("In Google Docs: File → Download → Plain text (.txt). Hand that file " +
  "over. Whoever applies it saves it as prose.txt at the repository root and " +
  "runs:"));
kids.push(new Paragraph({ spacing: { after: 60 }, indent: { left: 240 },
  children: [new TextRun({ text: "npm run prose:in", font: MONO, size: 20 })] }));
kids.push(new Paragraph({ spacing: { after: 160 }, indent: { left: 240 },
  children: [new TextRun({ text: "npm run check && npm run enc", font: MONO, size: 20 })] }));
kids.push(note("The importer replaces each passage by its address and refuses anything " +
  "ambiguous rather than guessing, so a passage it cannot place is reported " +
  "rather than lost. It is the same addresses prose.html uses, so either tool " +
  "can apply this."));
kids.push(note("One thing to expect: this document reflows the 74-column line wrapping " +
  "of the source into ordinary paragraphs, so the first import will normalise " +
  "line breaks across the content files. That is cosmetic and the checks cover it."));

/* ---- part one: the work ---- */
kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(sect("Part one — the " + work.length + " that need writing", HeadingLevel.HEADING_1));
kids.push(hashNote("These carry a brief and a placeholder. The placeholder is a plain " +
  "statement of the situation standing in until you write over it; none of it " +
  "is meant to read as finished text. This is the part that is actually " +
  "waiting on you."));
let lastColl = null;
for (const b of work) {
  const coll = b.addr.split("/")[0] + " · " + (b.addr.split("/")[1] || "");
  if (coll !== lastColl) { kids.push(sect(coll, HeadingLevel.HEADING_3)); lastColl = coll; }
  kids.push(addrPara(b.addr));
  for (const t of b.brief) kids.push(briefPara(t));
  for (const t of paras(b.body)) kids.push(prosePara(t));
}

/* ---- part two: everything else ---- */
kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(sect("Part two — everything else already written", HeadingLevel.HEADING_1));
kids.push(hashNote("The other " + rest.length + " passages, in the order the game keeps them. " +
  "Edit any of it; leave the rest alone and nothing changes."));
lastColl = null;
for (const b of rest) {
  const coll = b.addr.split("/")[0];
  if (coll !== lastColl) {
    kids.push(new Paragraph({ children: [new PageBreak()] }));
    kids.push(sect(coll, HeadingLevel.HEADING_2)); lastColl = coll;
  }
  kids.push(addrPara(b.addr));
  for (const t of paras(b.body)) kids.push(prosePara(t));
}

const doc = new Document({
  creator: "Ways and Means",
  title: "The prose of Ways and Means",
  description: "Every player-facing passage, addressed for round-tripping.",
  styles: { default: { document: { run: { font: "Georgia", size: 22 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
                          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: kids
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(require("path").join(__dirname, "..", "ways-and-means-prose.docx"), buf);
  console.log("wrote ways-and-means-prose.docx");
  console.log("  work items:", work.length, "| other passages:", rest.length);
  console.log("  size:", (buf.length / 1024).toFixed(0) + "KB");
});
