/* Turns calculation results into the markup the screen shows.
   No event wiring here — app.js owns that. */
(function (root) {
  'use strict';

  var Core = root.AyadiCore, Data = root.AyadiData, Measure = root.AyadiMeasure;
  var NAK = Data.NAK, PAR = Data.PAR, BOOK = Data.BOOK, CHART = Data.CHART;

  var GRADE = { g: ['g', 'நன்று'], m: ['n', 'மத்திமம்'], b: ['b', 'தவிர்க்க'], n: ['n', ''] };

  function tag(level, text) {
    var g = GRADE[level] || GRADE.n;
    var label = text || g[1];
    return label ? '<span class="tag ' + g[0] + '">' + label + '</span>' : '';
  }

  function rowsHTML(result) {
    return result.rows.map(function (row) {
      if (row[0] === 'g') {
        return '<tr class="grp"><td colspan="5">' + row[1] + '</td></tr>';
      }
      return '<tr><td><b>' + row[0] + '</b></td><td class="calc">' + row[1] +
        '</td><td>' + row[2] + '</td><td>' + row[3] + '</td><td>' + tag(row[4], row[5]) + '</td></tr>';
    }).join('');
  }

  function failingCount(result) {
    return result.picks.filter(function (i) { return !Core.par(i, result.st).ok; }).length;
  }

  /* Verdict line. Without picks the six base matches decide; with picks the
     chosen nakshatras become the decisive test. */
  function summary(result) {
    var fails = failingCount(result);
    if (result.picks.length) {
      return {
        cls: result.rej ? 'b' : 'g',
        text: result.rej
          ? 'தள்ளத்தக்கது. நட்சத்திரப் பலனில் ' + fails + ' பொருந்தவில்லை.'
          : 'ஆயாதி நட்சத்திரம் தேர்ந்த எல்லா நட்சத்திரங்களுக்கும் பொருந்துகிறது. ஆறு பொருத்தங்களில் ' +
            result.bad + ' தீய பலன் (தினம், யோனி முதன்மையல்ல).'
      };
    }
    return {
      cls: result.rej ? 'b' : 'n',
      text: 'ஆறில் ' + result.bad + ' தீய பலன்' + (result.rej ? '; தள்ளத்தக்கது' : '') +
        '. கர்த்தா, வாஸ்து, சுவாமி நட்சத்திரங்களைத் தேர்ந்தால் முதன்மைப் பொருத்தம் பார்க்கப்படும்.'
    };
  }

  function dashaHTML(result) {
    if (!result.picks.length) {
      return '<tr><td colspan="5" class="note">மேலே நட்சத்திரங்களைத் தேர்ந்தால் இங்கே பலன் தெரியும்.</td></tr>';
    }
    var labels = result.pickLabels || [];
    return result.picks.map(function (id, k) {
      var p = Core.par(id, result.st);
      return '<tr><td>' + (labels[k] || '') + '</td><td>' + NAK[id - 1] + '</td><td>' + p.c +
        '</td><td>' + PAR[p.p - 1] + '</td><td>' + tag(p.ok ? 'g' : 'b', p.ok ? 'பொருந்தும்' : 'பொருந்தாது') + '</td></tr>';
    }).join('');
  }

  function bookChip(entry) {
    return '<button type="button" class="chip" data-n="' + entry.n + '">' + entry.n +
      '<small> ' + NAK[entry.s - 1] + (entry.fixed ? ' *' : '') + '</small></button>';
  }

  /* The five entries before and after N in the treatise's own list. */
  function bookSection(N) {
    var i = -1;
    for (var k = 0; k < BOOK.length; k++) { if (BOOK[k].n >= N) { i = k; break; } }
    if (i < 0) { i = BOOK.length; }
    var exact = i < BOOK.length && BOOK[i].n === N;
    var after = exact ? i + 1 : i;
    var before = BOOK.slice(Math.max(0, i - 5), i).map(bookChip).join('');
    var next = BOOK.slice(after, after + 5).map(bookChip).join('');
    return {
      note: exact
        ? N + ' நூலின் பட்டியலில் உள்ளது (' + NAK[BOOK[i].s - 1] + ').'
        : N + ' நூலின் பட்டியலில் இல்லை. அதற்கு அருகிலுள்ள எண்கள்:',
      before: before || '<span class="note">இல்லை</span>',
      after: next || '<span class="note">இல்லை</span>',
      all: BOOK.map(bookChip).join('')
    };
  }

  function nearChip(fitted, dir, label, fmtValue, scale, measured) {
    if (!fitted) { return '<span class="note">அருகில் இல்லை</span>'; }
    var step = measured ? fitted.step / scale + '″' : String(fitted.step);
    var shown = fmtValue(fitted.value);
    return '<button type="button" class="chip" data-v="' + shown + '">' + shown +
      '<small> ' + (dir < 0 ? '−' : '+') + step + ' · ' + label + '</small></button>';
  }

  /* Six nearest-value slots: nakshatra fit, six-fit and both-fit, each way. */
  function nearSection(N, picks, fmtValue, scale, measured) {
    var hasPicks = picks.length > 0;
    var mk = function (dir) {
      var fit = Core.nearFit(N, picks, dir, 'nakshatra');
      var label = hasPicks ? 'நட்சத்திரம் பொருந்தும்' : (fit && fit.result.bad === 0 ? 'சிறந்தது' : 'ஏற்கலாம்');
      return nearChip(fit, dir, label, fmtValue, scale, measured);
    };
    var mk6 = function (dir) {
      return nearChip(Core.nearFit(N, picks, dir, 'six'), dir, 'ஆறும் நன்று', fmtValue, scale, measured);
    };
    var mkb = function (dir) {
      return nearChip(Core.nearFit(N, picks, dir, 'both'), dir, hasPicks ? 'எல்லாம் பொருந்தும்' : 'ஆறும் நன்று', fmtValue, scale, measured);
    };
    return {
      nfd: mk(-1), nfu: mk(1),
      sfd: mk6(-1), sfu: mk6(1),
      bfd: mkb(-1), bfu: mkb(1)
    };
  }

  /* Search a range for acceptable numbers. */
  function scanSection(from, to, maxBad, picks) {
    var start = Math.max(1, from || 1);
    var end = Math.min(to || start, start + 999);
    var hits = [];
    for (var i = start; i <= end; i++) {
      var r = Core.calc(i, picks);
      var picksFit = picks.every(function (id) { return Core.par(id, r.st).ok; });
      if (!r.rej && r.bad <= maxBad && picksFit) { hits.push(i); }
    }
    if (!hits.length) { return '<span class="note">இந்த வரம்பில் பொருந்தும் எண் இல்லை. வரம்பை விரிக்கவும்.</span>'; }
    return hits.map(function (n) { return '<button type="button" class="chip" data-n="' + n + '">' + n + '</button>'; }).join('');
  }

  function chartHTML() {
    var head = '<tr><th>எண்</th><th>நட்சத்திரம்</th><th>ராசி</th><th>தமிழ் எழுத்துகள்</th><th>ஆங்கில ஒலிகள்</th></tr>';
    return head + CHART.map(function (row, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + NAK[i] + '</td><td>' + row[2] + '</td><td>' + row[4] +
        '</td><td>' + row[3] + '</td></tr>';
    }).join('');
  }

  /* Plain-text version handed to the share sheet. */
  function shareText(result) {
    var lines = ['RK ஆயாதி கணிதம்', 'ஆயாதி எண்: ' + result.N + ' – ' + result.sn];
    var verdict = summary(result);
    lines.push(verdict.text);
    result.rows.forEach(function (row) {
      if (row[0] === 'g') { lines.push('', row[1]); return; }
      var grade = GRADE[row[4]] || GRADE.n;
      lines.push(row[0] + ': ' + row[3] + (grade[1] ? ' (' + grade[1] + ')' : ''));
    });
    return lines.join('\n');
  }

  root.AyadiRender = {
    tag: tag, rowsHTML: rowsHTML, summary: summary, dashaHTML: dashaHTML,
    bookSection: bookSection, nearSection: nearSection, scanSection: scanSection,
    chartHTML: chartHTML, shareText: shareText
  };
})(typeof window !== 'undefined' ? window : globalThis);
