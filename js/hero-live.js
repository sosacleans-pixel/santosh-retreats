/* Santosh: play a short looping Sosúa beach clip over the first hero still.
   The still image stays the LCP/poster. The video loads after first paint.
   prefers-reduced-motion and Save-Data keep the still only. Paused off-screen
   and while a later hero slide is showing. */
(function () {
  'use strict';
  var win = document.querySelector('.hero-window');
  if (!win) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection && navigator.connection.saveData) return;

  var video = null;
  var onFirst = true;
  var visible = true;
  var loaded = false;

  function pickSrc() {
    var narrow = window.matchMedia('(max-width: 720px)').matches;
    var webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"');
    if (narrow) return webm ? 'img/hero-sosua-live-720.webm' : 'img/hero-sosua-live-720.mp4';
    return webm ? 'img/hero-sosua-live.webm' : 'img/hero-sosua-live.mp4';
  }

  function shouldPlay() {
    return loaded && onFirst && visible && !document.hidden;
  }

  function sync() {
    if (!video) return;
    if (shouldPlay()) {
      video.classList.add('is-on');
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      video.pause();
      if (!onFirst) video.classList.remove('is-on');
    }
  }

  function mount() {
    if (video) return;
    video = document.createElement('video');
    video.className = 'hero-live';
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'metadata';
    video.poster = 'img/hero-sosua-1400.jpg';
    video.setAttribute('aria-hidden', 'true');
    video.src = pickSrc();
    var scrim = win.querySelector('.hero-scrim');
    if (scrim) win.insertBefore(video, scrim);
    else win.appendChild(video);
    video.addEventListener('loadeddata', function () {
      loaded = true;
      sync();
    });
  }

  function start() {
    mount();
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start, { timeout: 1800 });
  } else {
    window.setTimeout(start, 400);
  }
  if (document.readyState === 'complete') {
    /* already painted */
  } else {
    window.addEventListener('load', function () { /* first paint already happened */ }, { once: true });
  }

  document.addEventListener('santosh:hero-slide', function (e) {
    onFirst = !e.detail || e.detail.index === 0;
    sync();
  });
  document.addEventListener('visibilitychange', sync);

  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      visible = entries.some(function (en) { return en.isIntersecting; });
      sync();
    }, { threshold: 0.1 });
    io.observe(win);
  }
})();
