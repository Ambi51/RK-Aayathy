/* Capacitor bridge. Everything here is optional: opened in a plain browser
   (file:// or a normal server) the app works exactly the same. */
(function (root) {
  'use strict';

  var cap = root.Capacitor;
  if (!cap) { return; }

  function plugin(name) {
    return (cap.Plugins && cap.Plugins[name]) || null;
  }

  function isDark() {
    return !!(root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /* Status bar follows the app theme without guessing the text colour: the
     background matches the page and the style stays DEFAULT (system picks). */
  function paintStatusBar() {
    var bar = plugin('StatusBar');
    if (!bar) { return; }
    var dark = isDark();
    if (bar.setStyle) { bar.setStyle({ style: 'DEFAULT' }).catch(function () {}); }
    if (bar.setBackgroundColor) { bar.setBackgroundColor({ color: dark ? '#14191b' : '#eef0ec' }).catch(function () {}); }
  }

  function setupStatusBar() {
    var bar = plugin('StatusBar');
    if (!bar) { return; }
    if (bar.setOverlaysWebView) { bar.setOverlaysWebView({ overlay: false }).catch(function () {}); }
    if (bar.show) { bar.show().catch(function () {}); }
    paintStatusBar();
    if (root.matchMedia) {
      var query = root.matchMedia('(prefers-color-scheme: dark)');
      if (query.addEventListener) { query.addEventListener('change', paintStatusBar); }
    }
  }

  /* Share sheet: native dialog on the phone, clipboard in the browser. */
  root.AppShare = function (text) {
    var sharePlugin = plugin('Share');
    if (sharePlugin) {
      sharePlugin.share({ title: 'RK ஆயாதி கணிதம்', text: text, dialogTitle: 'பகிர்' })
        .catch(function () {});
      return;
    }
    if (root.navigator && root.navigator.share) {
      root.navigator.share({ title: 'RK ஆயாதி கணிதம்', text: text }).catch(function () {});
    }
  };

  /* External references open in the system browser, not inside the app. */
  root.AppOpenUrl = function (url) {
    var browser = plugin('Browser');
    if (browser) {
      browser.open({ url: url }).catch(function () {});
      return;
    }
    root.open(url, '_blank', 'noopener');
  };

  /* Android back: scroll home first, leave the app on a second press. */
  function setupBackButton() {
    var app = plugin('App');
    if (!app || !app.addListener) { return; }
    app.addListener('backButton', function () {
      if (root.scrollY > 8) {
        root.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (app.minimizeApp) { app.minimizeApp().catch(function () {}); }
      else if (app.exitApp) { app.exitApp().catch(function () {}); }
    });
  }

  function hideSplash() {
    var splash = plugin('SplashScreen');
    if (!splash || !splash.hide) { return; }
    splash.hide({ fadeOutDuration: 200 }).catch(function () {});
  }

  function start() {
    setupStatusBar();
    setupBackButton();
    /* Let the first paint finish so the app never flashes empty. */
    root.requestAnimationFrame(hideSplash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(typeof window !== 'undefined' ? window : globalThis);
