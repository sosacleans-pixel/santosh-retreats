/* Santosh v3: interactions. Static by design: no scroll-linked, reveal, parallax or auto-moving effects.
   Content is visible on load; the page scrolls natively. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* mobile menu */
  var tog = $('.nav-toggle'), list = $('#nav-links');
  if (tog && list) {
    tog.addEventListener('click', function () {
      var o = tog.getAttribute('aria-expanded') === 'true';
      tog.setAttribute('aria-expanded', String(!o)); list.classList.toggle('open', !o);
    });
    $$('a', list).forEach(function (a) {
      a.addEventListener('click', function () { tog.setAttribute('aria-expanded', 'false'); list.classList.remove('open'); });
    });
  }

  /* nav: switch to the solid cream bar once the page leaves the top (legibility over the hero photo) */
  var nav = $('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* FAQ accordion */
  $$('.acc button').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true', p = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', String(!open)); p.hidden = open;
    });
  });

  /* retreat filter chips */
  var chips = $$('.chip'), cards = $$('.dcard'), status = $('[data-filter-status]');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter, shown = 0;
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      cards.forEach(function (card) { var s = f === 'all' || card.dataset.cat === f; card.classList.toggle('is-out', !s); if (s) shown++; });
      if (status) status.textContent = shown + ' option' + (shown === 1 ? '' : 's') + ' shown';
      var tw = $('.track-wrap'); if (tw) tw.scrollLeft = 0;
    });
  });

  /* sub-nav: highlight the current section link */
  var spyLinks = $$('.subnav a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) spyLinks.forEach(function (l) { l.classList.toggle('is-current', l.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyLinks.forEach(function (l) { var t = $(l.getAttribute('href')); if (t) spy.observe(t); });
  }

  /* water-line texture: drawn once, static (no animation loop) */
  function flow(canvas) {
    var ctx = canvas.getContext('2d'), w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), t = 20;
    var lines = window.innerWidth >= 760 ? 18 : 9, light = canvas.classList.contains('flow-light');
    function size() { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < lines; i++) {
        var k = i / lines, y0 = h * (.15 + k * .8), amp = 18 + 40 * Math.sin(k * 3.1), a = light ? .22 : .16 + .12 * Math.sin(k * 6);
        ctx.beginPath();
        for (var x = 0; x <= w + 20; x += 18) {
          var y = y0 + Math.sin(x * .004 + t * .6 + i * .5) * amp + Math.sin(x * .011 - t * .9 + i) * amp * .35;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(242,232,220,' + Math.max(a, .05).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    size(); draw();
    window.addEventListener('resize', function () { size(); draw(); });
  }
  $$('[data-flow]').forEach(flow);
})();
/* v3.7: preselect retreat in the request form */
document.querySelectorAll('a[data-retreat]').forEach(function (a) {
  a.addEventListener('click', function () { var s = document.getElementById('rq-retreat'); if (s) s.value = a.getAttribute('data-retreat'); });
});
