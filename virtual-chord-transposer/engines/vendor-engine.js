/**
 * Vendor chord transposition engine (Open-SL chord positions + extended root shift).
 * Depends on ./vendor/chords-transposer.min.js (global ChordsTransposer).
 */
(function (global) {
  "use strict";

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

  var SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

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

  function transposeLineByPositions(line, chords, semitones, preferFlats) {
    var sorted = chords.slice().sort(function (a, b) {
      return b.position - a.position;
    });
    var out = line;
    sorted.forEach(function (ch) {
      var start = ch.position;
      var end = start;
      while (end < out.length && !/\s/.test(out.charAt(end))) {
        end++;
      }
      var raw = out.slice(start, end);
      var next = transposeChordSymbol(raw, semitones, preferFlats);
      out = out.slice(0, start) + next + out.slice(end);
    });
    return out;
  }

  function transposeLineLoose(line, semitones, preferFlats) {
    return line.split(/(\s+)/).map(function (part) {
      if (/^\s+$/.test(part)) return part;
      if (looksLikeChordToken(part)) {
        return transposeChordSymbol(part, semitones, preferFlats);
      }
      return part;
    }).join("");
  }

  function transposeLine(line, semitones, preferFlats) {
    var Transpose = global.ChordsTransposer && global.ChordsTransposer.default;
    if (!Transpose) {
      return transposeLineLoose(line, semitones, preferFlats);
    }
    var tr = new Transpose(line);
    if (tr.chords && tr.chords.length > 0) {
      return transposeLineByPositions(line, tr.chords, semitones, preferFlats);
    }
    return transposeLineLoose(line, semitones, preferFlats);
  }

  function transposeSong(text, semitones, preferFlats) {
    var lines = text.split(/\r\n|\r|\n/g);
    return lines
      .map(function (ln) {
        return transposeLine(ln, semitones, preferFlats);
      })
      .join("\n");
  }

  function signedSemitonesBetweenRoots(fromId, toId) {
    var a = noteToPc(fromId);
    var b = noteToPc(toId);
    if (a === undefined || b === undefined) return 0;
    var d = (b - a + 12) % 12;
    if (d > 6) d -= 12;
    return d;
  }

  function verifyLibraryLoaded() {
    return !!(global.ChordsTransposer && global.ChordsTransposer.default);
  }

  global.OMLTransposeVendorEngine = {
    noteToPc: noteToPc,
    pcToName: pcToName,
    signedSemitonesBetweenRoots: signedSemitonesBetweenRoots,
    transposeText: function (text, n, opts) {
      var pf = opts && opts.preferFlats;
      return transposeSong(text, n, pf);
    },
    getLibraryStatusMessage: function () {
      return verifyLibraryLoaded()
        ? `Chord-line detection uses chords-transposer (Open-SL).
        <br><br><strong>Open-SL</strong>:
        <a href="https://github.com/Open-SL/Chords-Transposer" rel="noopener noreferrer">chords-transposer</a> (MIT)
        finds chords on chord-only lines; this site still preserves suffixes when shifting roots.
        `
        : "Library failed to load — using fallback token mode only.";
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
