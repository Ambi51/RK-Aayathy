/* Nama nakshatra: reads the first sound of a name (Tamil or English) and
   returns the nakshatras the guide associates with that sound. */
(function (root) {
  'use strict';

  var D = root.AyadiData;
  var T = D.SOUND, FIXED = D.FIXED, EV = D.EN_VOWEL, OV = D.TOWNS,
      TC = D.TAMIL_CONSONANT, VS = D.TAMIL_SIGN, VI = D.TAMIL_VOWEL,
      TAMIL_CH = D.TAMIL_CH, TAMIL_TH = D.TAMIL_TH, TAMIL_D = D.TAMIL_D,
      TAMIL_P = D.TAMIL_P;

  function lookup(c, v) {
    if (FIXED[c]) { return FIXED[c]; }
    return T[c] && T[c][v] ? T[c][v] : null;
  }

  function readVowel(s) {
    var two = s.slice(0, 2);
    if (EV[two] && two.length === 2) { return EV[two]; }
    return EV[s[0]] || null;
  }

  function parseEnglish(w) {
    if (!w) { return null; }
    if (/^s(h)?ri/.test(w)) { return { ids: [26, 24], sound: 'Sri' }; }
    if ('aeiou'.indexOf(w[0]) !== -1) {
      var first = readVowel(w);
      return { ids: first === 'o' ? [4] : [3], sound: first.toUpperCase() };
    }

    var c;
    if (w.indexOf('chh') === 0) { c = 'chh'; }
    else if (['ch', 'sh', 'th', 'dh', 'bh', 'ph', 'kh', 'gh', 'jh', 'ng'].indexOf(w.slice(0, 2)) !== -1) { c = w.slice(0, 2); }
    else { c = w[0]; }

    var rest = w.slice(c.length);
    var key = c;
    if (c === 'kh' || c === 'q') { key = 'k'; }
    else if (c === 'c') { key = 'eiy'.indexOf(rest[0] || '') !== -1 ? 's' : 'k'; }
    else if (c === 'w') { key = 'v'; }
    else if (c === 'f') { key = 'ph'; }
    else if (c === 'b') { key = 'bh'; }

    var v = 'a';
    for (var i = 0; i < Math.min(3, rest.length); i++) {
      var x = readVowel(rest.slice(i));
      if (x) { v = x; break; }
    }

    var ids = lookup(key, v);
    if (!ids) { return null; }
    var sound = c.charAt(0).toUpperCase() + c.slice(1) + (FIXED[key] ? '' : v);
    return { ids: ids, sound: sound };
  }

  function parseTamil(s) {
    var c = s[0];
    if (VI[c]) { return { ids: VI[c] === 'o' ? [4] : [3], sound: c }; }
    if (!TC[c]) { return null; }
    if ((c === 'ஸ' || c === 'ஶ') && s[1] === '்' && s[2] === 'ர') {
      return { ids: [26, 24], sound: s.slice(0, 4) };
    }

    var v = 'a', sound = c;
    if (s[1] === '்') { v = VS[s[3]] || 'a'; sound = s.slice(0, 4); }
    else if (VS[s[1]]) { v = VS[s[1]]; sound = c + s[1]; }

    var ids;
    if (c === 'ச') { ids = TAMIL_CH[v]; }
    else if (c === 'த') { ids = TAMIL_TH[v]; }
    else if (c === 'ப') { ids = TAMIL_P[v]; }
    else if (c === 'ட') { ids = TAMIL_D[v]; }
    else { ids = lookup(TC[c], v); }

    return ids ? { ids: ids, sound: sound } : null;
  }

  /* kind: 'empty' | 'bad' | 'ok' */
  function compute(raw) {
    var s = (raw || '').trim();
    if (!s) { return { kind: 'empty' }; }

    var sound = null, ids = null, key, parsed;
    if (/[\u0B80-\u0BFF]/.test(s[0])) {
      key = s.replace(/[\s.,\-]/g, '');
      parsed = parseTamil(s);
    } else if (/[a-zA-Z]/.test(s)) {
      key = s.toLowerCase().replace(/[^a-z]/g, '');
      parsed = parseEnglish(key);
    } else {
      return { kind: 'bad' };
    }
    if (parsed) { ids = parsed.ids; sound = parsed.sound; }

    if (OV[key]) { return { kind: 'ok', ids: [OV[key]], sound: sound || '', exact: true }; }
    if (!ids) { return { kind: 'bad' }; }
    return { kind: 'ok', ids: ids, sound: sound, exact: false };
  }

  var api = { compute: compute, parseEnglish: parseEnglish, parseTamil: parseTamil, lookup: lookup };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.AyadiNaming = api;
})(typeof window !== 'undefined' ? window : globalThis);
