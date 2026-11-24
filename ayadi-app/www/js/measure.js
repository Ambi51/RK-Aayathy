/* Reads what the sthapathi types into the measurement box:
   plain numbers (23), feet and inches (5' 3", 6′ 3½″), Tamil fraction
   words (6 அரை) and vulgar fractions. Returns the integer the treatise works with. */
(function (root) {
  'use strict';

  var INCHES_PER_FOOT = 12;

  /* Rewrite every fraction spelling into a decimal before parsing. */
  function normFractions(s) {
    return s
      .replace(/(\d)\s*முக்கால்/g, '$1.75').replace(/(\d)\s*அரை/g, '$1.5').replace(/(\d)\s*கால்/g, '$1.25')
      .replace(/முக்கால்/g, '0.75').replace(/அரை/g, '0.5').replace(/கால்/g, '0.25')
      .replace(/(\d+)\s+(\d)\/(\d)/g, function (m, a, b, c) { return String(parseFloat(a) + b / c); })
      .replace(/(\d)\/(\d)/g, function (m, b, c) { return String(b / c); })
      .replace(/(\d)\s*¾/g, '$1.75').replace(/(\d)\s*½/g, '$1.5').replace(/(\d)\s*¼/g, '$1.25')
      .replace(/¾/g, '0.75').replace(/½/g, '0.5').replace(/¼/g, '0.25');
  }

  function normaliseQuotes(t) {
    return t.replace(/[’‘´]/g, "'").replace(/[”“]/g, '"')
      .replace(/′/g, "'").replace(/″/g, '"').replace(/''/g, '"');
  }

  /* mode: 'r' nearest inch, 'f' floor, 'c' ceil, 'q' quarter inch as the unit. */
  function parseInput(raw, mode) {
    var text = normaliseQuotes(normFractions((raw || '').trim()));
    var feet = text.match(/(\d+(?:\.\d+)?)\s*'/);
    var inch = text.match(/(\d+(?:\.\d+)?)\s*"/);
    var measured = !!(feet || inch);

    var total;
    if (measured) {
      total = (feet ? parseFloat(feet[1]) * INCHES_PER_FOOT : 0) + (inch ? parseFloat(inch[1]) : 0);
    } else {
      total = Number(text);
    }

    var out = {
      value: NaN, scale: 1, measured: measured, convText: '', adopt: null,
      feet: feet ? feet[1] : '', inch: inch ? inch[1] : '', total: total
    };

    if (measured) {
      out.convText = (feet ? feet[1] + '′ ' : '') + (inch ? inch[1] + '″ ' : '') + '= ' + total + ' அங்குலம்';
    }

    if (!(total > 0)) { return out; }

    if (mode === 'q' && measured) {
      out.scale = 4;
      out.value = Math.round(total * 4);
      out.convText += ' → ' + out.value + ' (கால் அங்குலம் அலகு)';
      return out;
    }

    if (Number.isInteger(total)) { out.value = total; return out; }

    var n = mode === 'f' ? Math.floor(total) : mode === 'c' ? Math.ceil(total) : Math.round(total);
    out.value = n > 0 ? n : NaN;
    out.adopt = { n: n, lo: Math.floor(total), hi: Math.ceil(total) };
    out.convText += ' → ' + n + ' என எடுக்கப்பட்டது';
    return out;
  }

  /* Put a value back into the units the user is working in. */
  function fmtValue(n, scale, measured) {
    if (!measured) { return String(n); }
    var inch = n / scale;
    var feet = Math.floor(inch / INCHES_PER_FOOT);
    var rest = inch - feet * INCHES_PER_FOOT;
    var whole = Math.floor(rest);
    var frac = rest - whole;
    var marks = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };
    var mark = marks[frac] || '';
    return (feet > 0 ? feet + '′ ' : '') + whole + mark + '″';
  }

  var api = { INCHES_PER_FOOT: INCHES_PER_FOOT, normFractions: normFractions, parseInput: parseInput, fmtValue: fmtValue };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.AyadiMeasure = api;
})(typeof window !== 'undefined' ? window : globalThis);
