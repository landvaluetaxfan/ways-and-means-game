/* ANTHEM — the recorded tracks the terminal can play. There are none in the shipping build.

   THE SAME REASON CONTENT IS .JS: on file://, fetch() and XMLHttpRequest
   both fail and <script src> does not, so a recording cannot be loaded as
   a file at run time. A track is base64 here and js/music.js decodes it with
   atob into decodeAudioData, which is the only route that works from disk.

   THE LAST ENTRY WAS CUT ON 7 OCTOBER 2026. It was a commercial recording
   (Masayoshi Takanaka, "Ready to Fly") with no licence the author could
   show, and the author said it could go ("la bionda and ready to fly can be
   removed"). An empty ANTHEM is not an error: the introduction asks for a
   track by key (`intro.anthem` in the campaign's setup), a missing track
   leaves the generated bed in charge, and a campaign that names none plays
   the bed alone. Flash I names none.

   TO ADD A RECORDING you hold the rights to: node tools/encodeaudio.js
   <file> <id> "<title>" writes an entry in this shape, and a campaign names
   it in its introduction. `level` is where it sits on the music bus (the bed
   is mixed quiet, so a full-scale track has to come down to sit over it),
   `start` opens it part-way in, and `fade` is the fade-in, in seconds.

     "id": { title: "Artist — Title", mime: "audio/ogg", level: 0.3,
             start: 0, fade: 4, data: "<base64>" }
*/
const ANTHEM = {};
