/* Pure Ayadi calculation: no DOM access, safe to unit test.
   Every formula below is the one printed in the treatise
   (Ko. Thirugnanasambandar, traditional temple architecture). */
(function (root) {
  'use strict';

  var D = root.AyadiData;
  var NAK = D.NAK, AYAM = D.AYAM, VYAYAM = D.VYAYAM, YONI = D.YONI,
      AMSAM = D.AMSAM, VARAM = D.VARAM, VAMSAM = D.VAMSAM, TH = D.TH,
      RASI = D.RASI, BHU = D.BHU, GUNA = D.GUNA, SUTRA = D.SUTRA,
      PAR = D.PAR, YOGA = D.YOGA, YNAME = D.YNAME, GANA = D.GANA;

  var NAK_COUNT = 27;
  var NEAR_FIT_LIMIT = 300;
  var GOOD_PAR = [2, 4, 6, 8, 9];

  /* Remainder 1..d (a remainder of 0 means the full cycle). */
  function R(v, d) {
    var r = v % d;
    return r === 0 ? d : r;
  }

  /* Paribhaga relation between a nakshatra and the ayadi nakshatra. */
  function par(from, to) {
    var c = ((to - from + NAK_COUNT) % NAK_COUNT) + 1;
    var p = R(c, 9);
    return { c: c, p: p, ok: GOOD_PAR.indexOf(p) !== -1 };
  }

  /* Yoga result for the ayadi nakshatra inside its weekday group. */
  function yogaOf(weekIndex, nakIndex) {
    var group = YOGA[weekIndex - 1], name = 'சித்தயோகம்', grade = 'g';
    for (var i = 0; i < group.length; i++) {
      if (group[i] === NAK[nakIndex - 1]) {
        name = YNAME[i] + 'யோகம்';
        grade = i === 3 ? 'g' : 'b';
      }
    }
    return { name: name, grade: grade };
  }

  function ganaOf(nakName) {
    var keys = Object.keys(GANA);
    for (var i = 0; i < keys.length; i++) {
      if (GANA[keys[i]].split(' ').indexOf(nakName) !== -1) { return keys[i]; }
    }
    return null;
  }

  function ageBand(ayus) {
    if (ayus <= 25) { return 'உத்தமம்'; }
    if (ayus <= 75) { return 'உத்தம–மத்திமம்'; }
    return 'விருத்தாயுசு';
  }

  /* picks: nakshatra numbers (1..27) the user selected for karta / vasthu / swami.
     Returns every value the screen needs, plus the report rows. */
  function calc(N, picks) {
    picks = picks || [];
    var ay = R(N * 8, 12), vy = R(N * 9, 10), yo = R(N * 3, 8), st = R(N * 8, 27),
        vr = R(N * 9, 7), am = R(N * 4, 9), vm = R(N * 9, 4), th = R(N * 9, 30),
        ra = R(N * 4, 12), vd = R(N * 27, 100), bu = R(N, 5), gu = R(N, 3), su = R(st, 5);

    var sn = NAK[st - 1];
    var yoga = yogaOf(vr, st);
    var t15 = th > 15 ? th - 15 : th;
    var first = NAK.indexOf(YOGA[vr - 1][0]) + 1;
    var dist = ((st - first + NAK_COUNT) % NAK_COUNT) + 1;
    var netra = dist <= 9 ? 'ஏக நேத்ரம்' : (dist <= 21 ? 'த்வி நேத்ரம்' : 'குருட்டு நேத்ரம்');

    var lAy = ay > vy ? 'g' : 'b';
    var lVy = VYAYAM[vy - 1][2], lYo = YONI[yo - 1][2], lVr = VARAM[vr - 1][2],
        lAm = AMSAM[am - 1][2];
    var six = [lAy, lVy, lYo, yoga.grade, lVr, lAm];
    var bad = six.filter(function (x) { return x === 'b'; }).length;

    var failing = picks.filter(function (i) { return !par(i, st).ok; }).length;
    var rej = picks.length ? failing > 0 : bad >= 3;

    var pair = function (table, i) { return table[i - 1].slice(0, 2).join(' – '); };

    var rows = [
      ['g', 'அடிப்படை ஆறு பொருத்தங்கள்'],
      ['ஆயம்', N + ' × 8 ÷ 12', ay, pair(AYAM, ay), lAy, lAy === 'g' ? 'ஆயம் மிகை' : 'இழப்பு மிகை'],
      ['வியயம்', N + ' × 9 ÷ 10', vy, pair(VYAYAM, vy), lVy, ''],
      ['யோனி', N + ' × 3 ÷ 8', yo, pair(YONI, yo), lYo, ''],
      ['தினம் (நட்சத்திரம்)', N + ' × 8 ÷ 27', st, sn, yoga.grade, yoga.name],
      ['வாரம்', N + ' × 9 ÷ 7', vr, VARAM[vr - 1][0] + ' – ' + VARAM[vr - 1][1], lVr, ''],
      ['அம்சம்', N + ' × 4 ÷ 9', am, pair(AMSAM, am), lAm, ''],
      ['g', 'பிற பலன்கள்'],
      ['வம்சம்', N + ' × 9 ÷ 4', vm, pair(VAMSAM, vm), VAMSAM[vm - 1][2], ''],
      ['திதி', N + ' × 9 ÷ 30', th, pair(TH, t15), TH[t15 - 1][2], ''],
      ['ராசி', N + ' × 4 ÷ 12', ra, pair(RASI, ra), RASI[ra - 1][2], ''],
      ['வயது', N + ' × 27 ÷ 100', vd, vd + ' வயது – ' + ageBand(vd), 'n', ''],
      ['பூதம்', N + ' ÷ 5', bu, pair(BHU, bu), 'n', ''],
      ['குணம்', N + ' ÷ 3', gu, pair(GUNA, gu), GUNA[gu - 1][2], ''],
      ['சூத்ரம்', sn + '(' + st + ') ÷ 5', su, pair(SUTRA, su), SUTRA[su - 1][2], ''],
      ['திருஷ்டி', NAK[first - 1] + ' முதல் எண்ணிக்கை', dist, netra, 'n', ''],
      ['யோகம்', VARAM[vr - 1][0] + ' + ' + sn, '', yoga.name, yoga.grade, ''],
      ['கணம்', 'ஆயாதி நட்சத்திரம்', '', ganaOf(sn), 'n', '']
    ];

    return {
      N: N, st: st, sn: sn, six: six, bad: bad, rej: rej, badYoni: lYo === 'b',
      yogaName: yoga.name, ages: vd, rows: rows, picks: picks,
      okAll: !rej
    };
  }

  /* Nearest value above or below N that satisfies a rule.
     rule: 'nakshatra' = the chosen nakshatras fit,
           'six'       = all six base matches are good,
           'both'      = both conditions. */
  function nearFit(N, picks, dir, rule) {
    for (var d = 1; d <= NEAR_FIT_LIMIT; d++) {
      var x = N + dir * d;
      if (x < 1) { return null; }
      var r = calc(x, picks);
      var fits = rule === 'six' ? r.bad === 0
        : rule === 'both' ? (!r.rej && r.bad === 0)
        : !r.rej;
      if (fits) { return { value: x, step: d, result: r }; }
    }
    return null;
  }

  var api = {
    NAK: NAK, NAK_COUNT: NAK_COUNT, PAR: PAR, GOOD_PAR: GOOD_PAR,
    R: R, par: par, calc: calc, nearFit: nearFit, ganaOf: ganaOf, ageBand: ageBand
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.AyadiCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
