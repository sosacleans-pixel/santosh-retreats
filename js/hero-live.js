/* Santosh: play a short looping Sosua beach clip over the first hero still.
   The still image stays the LCP image and the video poster. The clip mounts after
   first paint. The clip is a masked cinemagraph: waves, foam on the shore and a gentle
   palm sway move, everything else is the original photo.
   Respected: prefers-reduced-motion (still only). Save-Data gets the smaller file
   instead of skipping. If the browser refuses autoplay (for example iPhone Low Power
   Mode), the still stays visible and play() is retried on the first touch, scroll,
   key press or when the tab becomes visible again. */
(function () {
  'use strict';
  var win = document.querySelector('.hero-window');
  if (!win) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var V = '20261126d';
  var RATE = 0.7;
  var video = null;
  var onFirst = true;
  var visible = true;
  var ready = false;

  function small() {
    var narrow = window.matchMedia('(max-width: 720px)').matches;
    var saver = !!(navigator.connection && navigator.connection.saveData);
    return narrow || saver;
  }

  function attempt() {
    if (!video || !ready || !onFirst || !visible || document.hidden) return;
    var p;
    try { p = video.play(); } catch (e) { return; }
    if (p && typeof p.then === 'function') {
      p.then(function () { video.classList.add('is-on'); }, function () { /* blocked: still stays, retry on a gesture */ });
    }
  }

  function sync() {
    if (!video) return;
    if (onFirst && visible && !document.hidden) {
      attempt();
    } else {
      video.pause();
    }
  }

  function addSource(v, file, type) {
    var s = document.createElement('source');
    s.src = 'img/' + file + '?v=' + V;
    s.type = type;
    v.appendChild(s);
  }

  function mount() {
    if (video) return;
    var sfx = small() ? '-720' : '';
    video = document.createElement('video');
    video.className = 'hero-live';
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    video.loop = true;
    video.setAttribute('loop', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'metadata';
    video.setAttribute('preload', 'metadata');
    video.poster = 'img/hero-sosua-1400.jpg';
    video.setAttribute('aria-hidden', 'true');
    video.tabIndex = -1;
    /* Salim asked for a slower, calmer motion: play at 0.7x (loop lasts about 8.6s) */
    video.defaultPlaybackRate = RATE;
    video.playbackRate = RATE;
    addSource(video, 'hero-sosua-live' + sfx + '.mp4', 'video/mp4');
    addSource(video, 'hero-sosua-live' + sfx + '.webm', 'video/webm');
    var scrim = win.querySelector('.hero-scrim');
    if (scrim) win.insertBefore(video, scrim); else win.appendChild(video);
    video.addEventListener('loadeddata', function () { ready = true; sync(); });
    video.addEventListener('canplay', function () { ready = true; sync(); });
    video.addEventListener('loadedmetadata', function () { video.playbackRate = RATE; });
    video.addEventListener('playing', function () { if (video.playbackRate !== RATE) video.playbackRate = RATE; video.classList.add('is-on'); });
    video.addEventListener('pause', function () {
      /* if the browser paused us while we should be playing (Low Power Mode), try again later */
      if (onFirst && visible && !document.hidden && !video.ended) video.classList.remove('is-on');
    });
    try { video.load(); } catch (e) {}
  }

  function start() { mount(); }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start, { timeout: 1800 });
  } else {
    window.setTimeout(start, 400);
  }

  /* retry when the browser blocks autoplay: first touch, click, key, scroll, or tab return */
  ['touchstart', 'pointerdown', 'click', 'keydown', 'scroll'].forEach(function (name) {
    window.addEventListener(name, function () {
      if (video && video.paused) attempt();
    }, { passive: true });
  });
  document.addEventListener('visibilitychange', sync);

  document.addEventListener('santosh:hero-slide', function (e) {
    var was = onFirst;
    onFirst = !e.detail || e.detail.index === 0;
    if (onFirst && !was && video) {
      try { video.currentTime = 0; } catch (err) {}
    }
    sync();
  });

  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      visible = entries.some(function (en) { return en.isIntersecting; });
      sync();
    }, { threshold: 0.1 });
    io.observe(win);
  }
})();
