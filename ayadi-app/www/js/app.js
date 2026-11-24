/* Screen wiring: input events, rendering calls, saved state and sharing. */
(function (root, document) {
  'use strict';

  var Core = root.AyadiCore, Data = root.AyadiData, Naming = root.AyadiNaming,
      Measure = root.AyadiMeasure, View = root.AyadiRender;
  var NAK = Data.NAK, DEITY = Data.DEITY;

  var STORE_KEY = 'rk-ayadi-state-v1';
  var PICK_FIELDS = [['கர்த்தா', 'kn'], ['வாஸ்து (ஊர்)', 'vn'], ['சுவாமி', 'sn']];
  var FIELDS = ['n', 'fm', 'kn', 'vn', 'sn', 'kname', 'vname', 'sname'];

  var $ = function (id) { return document.getElementById(id); };
  var lastResult = null;
  var toastTimer = null;

  function selection() {
    var out = [];
    PICK_FIELDS.forEach(function (f) {
      var v = parseInt($(f[1]).value, 10);
      if (v > 0) { out.push({ label: f[0], id: v }); }
    });
    return out;
  }

  function verdictShort(n, picks) {
    var r = Core.calc(n, picks);
    if (r.rej) { return 'தள்ளு'; }
    return r.bad === 0 ? 'சிறந்தது' : 'ஏற்கலாம்';
  }

  function toast(message) {
    var dock = $('dockv');
    var previous = dock.textContent;
    dock.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { dock.textContent = previous; }, 1800);
  }

  function render() {
    var picks = selection();
    var ids = picks.map(function (p) { return p.id; });
    var parsed = Measure.parseInput($('n').value, $('fm').value);

    var conv = parsed.convText;
    if (parsed.adopt) {
      conv += ' (' + parsed.adopt.lo + ': ' + verdictShort(parsed.adopt.lo, ids) + ', ' +
        parsed.adopt.hi + ': ' + verdictShort(parsed.adopt.hi, ids) + ')';
    }
    $('conv').textContent = conv;

    var N = parsed.value;
    if (!(N > 0)) {
      $('sum').className = 'n';
      $('sum').textContent = 'ஒரு முழு எண்ணை இடுங்கள்.';
      $('rows').innerHTML = '';
      $('srows').innerHTML = '';
      lastResult = null;
      $('dock').hidden = true;
      return;
    }

    var fmt = function (x) { return Measure.fmtValue(x, parsed.scale, parsed.measured); };
    var result = Core.calc(N, ids);
    result.pickLabels = picks.map(function (p) { return p.label; });
    lastResult = result;

    var sum = View.summary(result);
    $('sum').className = sum.cls;
    $('sum').textContent = sum.text;
    $('rows').innerHTML = View.rowsHTML(result);
    $('ayn').textContent = result.st + ' – ' + result.sn;
    $('srows').innerHTML = View.dashaHTML(result);

    var book = View.bookSection(N);
    $('tnote').textContent = book.note;
    $('tbefore').innerHTML = book.before;
    $('tafter').innerHTML = book.after;

    var near = View.nearSection(N, ids, fmt, parsed.scale, parsed.measured);
    $('nfd').innerHTML = near.nfd; $('nfu').innerHTML = near.nfu;
    $('sfd').innerHTML = near.sfd; $('sfu').innerHTML = near.sfu;
    $('bfd').innerHTML = near.bfd; $('bfu').innerHTML = near.bfu;

    var dock = $('dock');
    dock.hidden = false;
    dock.className = 'dock is-' + sum.cls;
    $('dockv').textContent = N + ' · ' + (result.rej ? 'தள்ளத்தக்கது' : (result.bad === 0 ? 'சிறந்தது' : 'ஏற்கலாம்'));

    save();
  }

  /* ---------- saved state ---------- */
  function save() {
    try {
      var state = {};
      FIELDS.forEach(function (id) { state[id] = $(id).value; });
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* private mode: keep running without persistence */ }
  }

  function restore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) { return; }
      var state = JSON.parse(raw);
      FIELDS.forEach(function (id) {
        if (typeof state[id] === 'string') { $(id).value = state[id]; }
      });
    } catch (e) { /* ignore a corrupted entry */ }
  }

  /* ---------- share ---------- */
  function copyFallback(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); toast('நகலெடுக்கப்பட்டது'); }
    catch (e) { toast('பகிர முடியவில்லை'); }
    document.body.removeChild(area);
  }

  function share() {
    if (!lastResult) { return; }
    var text = View.shareText(lastResult);
    if (root.AppShare) { root.AppShare(text); return; }
    if (navigator.share) {
      navigator.share({ title: 'RK ஆயாதி கணிதம்', text: text }).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('நகலெடுக்கப்பட்டது'); }, function () { copyFallback(text); });
      return;
    }
    copyFallback(text);
  }

  /* ---------- inputs ---------- */
  function insertAtCursor(ch) {
    var el = $('n');
    var start = el.selectionStart == null ? el.value.length : el.selectionStart;
    var end = el.selectionEnd == null ? start : el.selectionEnd;
    el.value = el.value.slice(0, start) + ch + el.value.slice(end);
    el.focus();
    var caret = start + ch.length;
    el.setSelectionRange(caret, caret);
    render();
  }

  function bindName(inputId, selectId, hintId) {
    $(inputId).addEventListener('input', function () {
      var r = Naming.compute($(inputId).value);
      var hint = $(hintId);
      if (r.kind === 'empty') { hint.innerHTML = ''; return; }
      if (r.kind === 'bad') {
        hint.textContent = 'இந்தப் பெயருக்கு ஒலி பட்டியல் இல்லை. வேறு எழுத்தில் எழுதிப் பாருங்கள்.';
        return;
      }
      $(selectId).value = r.ids[0];
      hint.innerHTML = 'முதல் ஒலி: ' + r.sound + ' → ' + r.ids.map(function (id) {
        return '<button type="button" class="chip" data-s="' + selectId + '" data-v="' + id + '">' + NAK[id - 1] + '</button>';
      }).join('') + (r.exact ? ' (கையேட்டு உதாரணம்)' : '');
      render();
    });
  }

  function linkHandler(event) {
    var link = event.target.closest('a[data-external]');
    if (!link) { return; }
    event.preventDefault();
    if (root.AppOpenUrl) { root.AppOpenUrl(link.href); }
    else { root.open(link.href, '_blank', 'noopener'); }
  }

  function chipHandler(event) {
    var pick = event.target.closest('.nm .chip');
    if (pick) {
      $(pick.dataset.s).value = pick.dataset.v;
      render();
      return;
    }
    var num = event.target.closest('#tbefore .chip,#tafter .chip,#tfull .chip,#chips .chip');
    if (num) {
      $('n').value = num.dataset.n;
      render();
      root.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    var near = event.target.closest('#nfd .chip,#nfu .chip,#sfd .chip,#sfu .chip,#bfd .chip,#bfu .chip');
    if (near) {
      $('n').value = near.dataset.v;
      render();
    }
  }

  function boot() {
    var options = '<option value="0">தேர்வு இல்லை</option>' + NAK.map(function (n, i) {
      return '<option value="' + (i + 1) + '">' + (i + 1) + '. ' + n + '</option>';
    }).join('');

    PICK_FIELDS.forEach(function (f) {
      $(f[1]).innerHTML = options;
      $(f[1]).addEventListener('change', render);
    });

    $('dn').innerHTML = '<option value="">தேர்வு இல்லை</option>' + DEITY.map(function (d) {
      return '<option value="' + d[1] + '">' + d[0] + '</option>';
    }).join('');
    $('dn').addEventListener('change', function () {
      var idx = NAK.indexOf($('dn').value) + 1;
      $('sn').value = idx > 0 ? idx : 0;
      render();
    });

    $('chart').innerHTML = View.chartHTML();
    $('tfull').innerHTML = View.bookSection(1).all;

    bindName('kname', 'kn', 'kh');
    bindName('vname', 'vn', 'vh');
    bindName('sname', 'sn', 'sh');

    $('n').addEventListener('input', render);
    $('fm').addEventListener('change', render);
    $('bft').addEventListener('click', function () { insertAtCursor('′'); });
    $('bin').addEventListener('click', function () { insertAtCursor('″'); });
    $('scan').addEventListener('click', function () {
      $('chips').innerHTML = View.scanSection(
        parseInt($('a').value, 10),
        parseInt($('z').value, 10),
        parseInt($('mb').value, 10),
        selection().map(function (p) { return p.id; })
      );
    });
    $('share').addEventListener('click', share);

    document.addEventListener('click', chipHandler);
    document.addEventListener('click', linkHandler);

    restore();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  root.AyadiApp = { render: render, share: share };
})(typeof window !== 'undefined' ? window : globalThis, document);
