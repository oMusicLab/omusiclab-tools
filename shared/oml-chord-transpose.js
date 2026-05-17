/**
 * oml-chord-transpose — pitch-class chord transposition with preserved suffixes.
 * No dependencies. Safe for browser or Node (CommonJS export when available).
 *
 * @version 1.0.0
 */
(function (global) {
  "use strict";

  var VERSION = "1.0.0";

  var SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  var NOTE_PC = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  function normalizeSymbol(s) {
    return String(s)
      .replace(/\u266f/g, "#")
      .replace(/\u266d/g, "b")
      .replace(/&/g, "b")
      .trim();
  }

  function noteToPc(name) {
    var n = normalizeSymbol(name);
    if (Object.prototype.hasOwnProperty.call(NOTE_PC, n)) return NOTE_PC[n];
    return undefined;
  }

  function pcToName(pc, preferFlats) {
    var arr = preferFlats ? FLAT : SHARP;
    return arr[(pc + 120) % 12];
  }

  function looksLikeChordBody(mainPart) {
    var m = normalizeSymbol(mainPart).match(/^([A-G])([#b]?)(.*)$/);
    if (!m) return false;
    var suf = m[3] || "";
    if (suf.length === 0) return true;
    return (
      /^[mM\u00b0\u00f8\u0394\d+#b\u266d\u266f(\[]/.test(suf) ||
      /^(maj|min|dim|aug|sus|add|omit)/.test(suf)
    );
  }

  function looksLikeChordToken(token) {
    var s = token.trim();
    if (s.charAt(0) === "[" && s.charAt(s.length - 1) === "]") {
      s = s.slice(1, -1).trim();
    }
    var slashAt = s.lastIndexOf("/");
    var main = slashAt > 0 ? s.slice(0, slashAt) : s;
    var rm = normalizeSymbol(main).match(/^([A-G])([#b]?)/);
    if (!rm) return false;
    var rootName = rm[1] + (rm[2] || "");
    if (noteToPc(rootName) === undefined) return false;
    if (!looksLikeChordBody(main)) return false;
    if (slashAt > 0 && noteToPc(normalizeSymbol(s.slice(slashAt + 1))) === undefined) return false;
    return true;
  }

  function transposeChordSymbol(symbol, semitones, preferFlats) {
    var original = symbol;
    var s = symbol.trim();
    var bracket = false;
    if (s.charAt(0) === "[" && s.charAt(s.length - 1) === "]") {
      bracket = true;
      s = s.slice(1, -1).trim();
    }

    var slashAt = s.lastIndexOf("/");
    var main = s;
    var bassNote = null;
    if (slashAt > 0) {
      main = s.slice(0, slashAt);
      bassNote = normalizeSymbol(s.slice(slashAt + 1));
    }

    var rootMatch = normalizeSymbol(main).match(/^([A-G])([#b]?)(.*)$/);
    if (!rootMatch) return original;

    var acc = rootMatch[2] || "";
    var suffix = rootMatch[3] || "";
    var rootName = rootMatch[1] + acc;
    var pc = noteToPc(rootName);
    if (pc === undefined) return original;

    var newRoot = pcToName((pc + semitones + 120) % 12, preferFlats);
    var rebuilt = newRoot + suffix;

    if (bassNote !== null && bassNote.length > 0) {
      var bPc = noteToPc(bassNote);
      if (bPc !== undefined) {
        rebuilt = rebuilt + "/" + pcToName((bPc + semitones + 120) % 12, preferFlats);
      }
    }

    return bracket ? "[" + rebuilt + "]" : rebuilt;
  }

  function normalizeOptions(opt) {
    opt = opt || {};
    return { preferFlats: !!opt.preferFlats };
  }

  function transposeChord(symbol, semitones, opt) {
    var o = normalizeOptions(opt);
    return transposeChordSymbol(symbol, semitones, o.preferFlats);
  }

  function transposeLine(line, semitones, opt) {
    var o = normalizeOptions(opt);
    var pf = o.preferFlats;
    return line
      .split(/(\s+)/)
      .map(function (part) {
        if (/^\s+$/.test(part)) return part;
        if (looksLikeChordToken(part)) {
          return transposeChordSymbol(part, semitones, pf);
        }
        return part;
      })
      .join("");
  }

  function transposeText(text, semitones, opt) {
    var lines = text.split(/\r\n|\r|\n/g);
    return lines
      .map(function (ln) {
        return transposeLine(ln, semitones, opt);
      })
      .join("\n");
  }

  function signedSemitonesBetweenRoots(fromRootId, toRootId) {
    var a = noteToPc(fromRootId);
    var b = noteToPc(toRootId);
    if (a === undefined || b === undefined) return 0;
    var d = (b - a + 12) % 12;
    if (d > 6) d -= 12;
    return d;
  }

  var api = {
    VERSION: VERSION,
    transposeText: transposeText,
    transposeLine: transposeLine,
    transposeChord: transposeChord,
    isChordToken: looksLikeChordToken,
    noteToPc: noteToPc,
    pcToName: pcToName,
    signedSemitonesBetweenRoots: signedSemitonesBetweenRoots,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.OMLChordTranspose = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
