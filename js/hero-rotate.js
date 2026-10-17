/* Santosh: hero crossfade rotation (Sosúa -> Cabarete -> Punta Rucia).
   Slide 1 is the LCP image (preloaded, fetchpriority=high). Slides 2-3 carry only data-* URLs in the
   HTML, so they cost nothing on first load; they are filled in after window load AND the intro
   (preloader removed), and rotation starts once they've decoded. Reduced motion / Save-Data: no rotation. */
(function () {
  'use strict';
  var HOLD = 6500, FADE = 1500;
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var conn = navigator.connection || {};
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-alt .hero-slide'));
  if (!slides.length || mq.matches || conn.saveData) return;

  var cur = 0, timer = null, started = false;

  function fill(img) {
    var pic = img.parentNode;
    Array.prototype.forEach.call(pic.querySelectorAll('source[data-srcset]'), function (s) {
      s.srcset = s.getAttribute('data-srcset'); s.removeAttribute('data-srcset');
    });
    if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset'); }
    if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  }

  // cur: 0 = slide 1 (base image), 1..n = overlay slides
  function show(next) {
    if (next === 0) {
      // fade the top overlay out to reveal slide 1; drop the others once hidden
      var top = slides[cur - 1];
      if (top) top.classList.remove('is-on');
      setTimeout(function () { slides.forEach(function (s) { s.classList.remove('is-on'); }); }, FADE);
    } else {
      var prev = slides[next - 2];
      slides[next - 1].classList.add('is-on');
      if (prev) setTimeout(function () { if (cur !== next - 1) prev.classList.remove('is-on'); }, FADE + 50);
    }
    cur = next;
  }
  function tick() { show((cur + 1) % (slides.length + 1)); }
  function play() { if (!timer) timer = setInterval(tick, HOLD); }
  function pause() { clearInterval(timer); timer = null; }

  function start() {
    if (started) return; started = true;
    Promise.all(slides.map(fill)).then(function () {
      if (mq.matches) return;
      if (!document.hidden) play();
      document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });
    });
  }

  if (mq.addEventListener) mq.addEventListener('change', function (e) {
    if (e.matches) { pause(); slides.forEach(function (s) { s.classList.remove('is-on'); }); cur = 0; }
  });

  function introDone() { return !document.querySelector('.preloader'); }
  function whenReady() {
    if (introDone()) { start(); return; }
    var mo = new MutationObserver(function () { if (introDone()) { mo.disconnect(); start(); } });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); start(); }, 10000); // safety net
  }
  if (document.readyState === 'complete') whenReady();
  else window.addEventListener('load', whenReady);
})();
