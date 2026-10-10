/* Santosh v3: interactions (built on v2). GSAP + ScrollTrigger + Lenis (self-hosted). */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- helpers: split text ---------- */
  function splitChars(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var ws = document.createElement('span'); ws.className = 'split-word';
      w.split('').forEach(function (ch) { var c = document.createElement('span'); c.className = 'char'; c.textContent = ch; ws.appendChild(c); });
      el.appendChild(ws); if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }
  function splitWords(el) {
    // wrap words in text nodes only (keeps <sup>/<em> intact)
    $$('*', el).concat([el]).forEach(function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
        });
        node.replaceChild(frag, n);
      });
    });
  }

  /* ---------- always-on basics (work without GSAP) ---------- */
  var tog = $('.nav-toggle'), list = $('#nav-links');
  tog.addEventListener('click', function () {
    var o = tog.getAttribute('aria-expanded') === 'true';
    tog.setAttribute('aria-expanded', String(!o)); list.classList.toggle('open', !o);
  });
  var nav = $('.nav');
  window.addEventListener('scroll', function () { nav.classList.toggle('scrolled', window.scrollY > 40); }, { passive: true });

  $$('.acc button').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true', p = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', String(!open)); p.hidden = open;
      if (!open && hasGsap && !reduce) gsap.from(p, { height: 0, opacity: 0, duration: .5, ease: 'power3.out', clearProps: 'all' });
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  var chips = $$('.chip'), cards = $$('.dcard'), status = $('[data-filter-status]');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter, shown = [];
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      cards.forEach(function (card) { var s = f === 'all' || card.dataset.cat === f; card.classList.toggle('is-out', !s); if (s) shown.push(card); });
      status.textContent = shown.length + ' option' + (shown.length === 1 ? '' : 's') + ' shown';
      var tw = $('.track-wrap'); if (tw) tw.scrollLeft = 0;
      if (hasGsap) {
        if (!reduce) gsap.fromTo(shown, { y: 40, opacity: 0, rotate: 1.5 }, { y: 0, opacity: 1, rotate: 0, duration: .7, stagger: .07, ease: 'power3.out' });
        ScrollTrigger.refresh();
      }
    });
  });

  /* sub-nav scroll spy */
  var spyLinks = $$('.subnav a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) spyLinks.forEach(function (l) { l.classList.toggle('is-current', l.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyLinks.forEach(function (l) { var t = $(l.getAttribute('href')); if (t) spy.observe(t); });
  }

  /* ---------- ambient canvas: flowing water lines ---------- */
  function flow(canvas) {
    var ctx = canvas.getContext('2d'), w, h, dpr = fine ? Math.min(window.devicePixelRatio || 1, 2) : 1, t = Math.random() * 100, raf = null;
    var lines = fine ? 18 : 9, light = canvas.classList.contains('flow-light');
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
    function loop() { t += .012; draw(); raf = requestAnimationFrame(loop); }
    size(); draw();
    window.addEventListener('resize', function () { size(); draw(); });
    if (reduce) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { if (!raf) loop(); } else if (raf) { cancelAnimationFrame(raf); raf = null; } });
    }).observe(canvas);
  }
  $$('[data-flow]').forEach(flow);

  /* ---------- static / reduced-motion fallback ---------- */
  function counterStatic() { $$('[data-count]').forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); }); }
  if (reduce || !hasGsap) {
    doc.classList.add(reduce ? 'reduced' : 'no-gsap');
    var pl = $('.preloader'); if (pl) pl.remove();
    counterStatic();
    
    return;
  }

  /* ---------- motion ---------- */
  gsap.registerPlugin(ScrollTrigger);
  var lenis = null;
  if (fine && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return; var t = $(id); if (!t) return;
      e.preventDefault(); tog.setAttribute('aria-expanded', 'false'); list.classList.remove('open');
      if (lenis) lenis.scrollTo(t, { offset: -120, duration: 1.4 }); else t.scrollIntoView({ behavior: 'smooth' });
      if (t.tabIndex < 0) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    });
  });

  $$('[data-split]').forEach(splitChars);
  $$('.scrub-words').forEach(splitWords);

  /* preloader -> hero intro */
  var pre = $('.preloader');
  var heroChars = $$('.hero-title .char');
  gsap.set(heroChars, { yPercent: 115 });
  gsap.set('.hero-panel, .nav', { opacity: 0, y: 30 });
  gsap.set('.hero-window', { clipPath: 'inset(22% 30% 22% 30% round 240px)' });
  gsap.set('.hero-img', { scale: 1.35 });
  if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
  var intro = gsap.timeline({ onComplete: function () { if (pre) pre.remove(); if (lenis) lenis.start(); document.body.style.overflow = ''; ScrollTrigger.refresh(); } });
  intro.to('.pre-logo .draw', { strokeDashoffset: 0, duration: 1.1, stagger: .15, ease: 'power2.inOut' })
    .fromTo('.pre-word span', { yPercent: 110 }, { yPercent: 0, duration: .6, stagger: .04, ease: 'power3.out' }, '-=.6')
    .to('.pre-inner', { opacity: 0, y: -20, duration: .4 }, '+=.15')
    .to('.pre-curtain', { scaleY: 1, duration: .5, ease: 'power3.inOut' }, '<')
    .set('.preloader', { background: 'transparent' })
    .to('.pre-curtain', { scaleY: 0, transformOrigin: 'top', duration: .6, ease: 'power3.inOut' })
    .to('.hero-window', { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.5, ease: 'expo.inOut' }, '-=.55')
    .to('.hero-img', { scale: 1.08, duration: 1.8, ease: 'expo.out' }, '<')
    .to(heroChars, { yPercent: 0, duration: 1, stagger: .022, ease: 'expo.out' }, '-=1.0')
    .to('.hero-panel, .nav', { opacity: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.7');
  if (pre) pre.addEventListener('click', function () { intro.progress(1); });
  window.addEventListener('keydown', function sk() { if (intro.isActive()) intro.progress(1); window.removeEventListener('keydown', sk); });

  /* hero scroll: pinned scale + clip + text drift */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=110%', scrub: 1, pin: '.hero-pin', anticipatePin: 1 } })
    .to('.hero-img', { scale: 1.3, ease: 'none' }, 0)
    .to('.hero-window', { clipPath: 'inset(7% 5% 7% 5% round 36px)', ease: 'none' }, 0)
    .to('.hero-title .char', { yPercent: -70, opacity: 0, stagger: .02, ease: 'none' }, 0)
    .to('.hero-panel, .hero-scroll', { y: -60, opacity: 0, ease: 'none' }, .1);

  /* intro heading: word reveal */
  gsap.from('.split-copy > *', { y: 50, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.split', start: 'top 75%' } });
  gsap.from('.split-art', { clipPath: 'inset(100% 0% 0% 0% round 14px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.split', start: 'top 70%' } });
  gsap.fromTo('.sa-photo img', { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.split-art', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.split-big', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.split', start: 'top 55%' } });
  gsap.from('.stat', { y: 80, opacity: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });
  gsap.from('.tile', { y: 70, opacity: 0, rotate: 1.5, duration: .9, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.tiles', start: 'top 85%' } });
  gsap.from('.incl-list li', { x: 40, opacity: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.incl-list', start: 'top 80%' } });
  gsap.from('.steps3 li', { y: 80, opacity: 0, duration: 1, stagger: .14, ease: 'expo.out', scrollTrigger: { trigger: '.steps3', start: 'top 80%' } });
  $$('[data-count]').forEach(function (n) {
    var o = { v: 0 }, end = +n.dataset.count, suf = n.dataset.suffix || '';
    n.textContent = '0' + suf;
    ScrollTrigger.create({ trigger: n, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', onUpdate: function () { n.textContent = Math.round(o.v) + suf; } });
    } });
  });

  /* journey: pinned, scrubbed, 4 steps */
  var steps = $$('.j-step'), nums = $$('.j-numbers span'), grads = $$('.j-grad');
  var wave = $('.jm-wave'), tri = $('.jm-tri'), sun = $('.jm-sun');
  var wl = wave.getTotalLength(), tl = tri.getTotalLength();
  gsap.set(wave, { strokeDasharray: wl, strokeDashoffset: wl });
  gsap.set(tri, { strokeDasharray: tl, strokeDashoffset: tl * .75, transformOrigin: '50% 60%' });
  gsap.set(sun, { transformOrigin: '50% 50%', scale: .4, opacity: .3 });
  var jt = gsap.timeline({ scrollTrigger: { trigger: '.journey', start: 'top top', end: '+=320%', scrub: 1, pin: '.journey-pin', anticipatePin: 1,
    snap: { snapTo: 'labels', duration: { min: .2, max: .7 }, ease: 'power2.inOut', delay: .05 } } });
  jt.addLabel('s0').to(tri, { strokeDashoffset: tl * .5, duration: .5 }, 's0');
  var marks = [
    function (t, at) { t.to(tri, { strokeDashoffset: 0, rotate: 0, duration: 1 }, at).to(wave, { strokeDashoffset: wl * .5, duration: 1 }, at).to(sun, { scale: .8, opacity: .6, duration: 1 }, at); },
    function (t, at) { t.to(tri, { rotate: 180, scale: .7, duration: 1 }, at).to(wave, { strokeDashoffset: 0, duration: 1 }, at).to(sun, { scale: 1.6, opacity: .9, duration: 1 }, at); },
    function (t, at) { t.to(tri, { rotate: 360, scale: 1.15, duration: 1 }, at).to(sun, { scale: 2.6, opacity: .4, rotate: 90, duration: 1 }, at); }
  ];
  for (var i = 1; i < 4; i++) {
    var at = 's' + (i - 1) + '+=0.5';
    jt.to(steps[i - 1], { autoAlpha: 0, y: -60, duration: .35 }, at)
      .fromTo(steps[i], { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: .45 }, at + '+=0.4')
      .to(nums[i - 1], { opacity: 0, scale: 1.25, duration: .6 }, at)
      .fromTo(nums[i], { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .6 }, at + '+=0.2')
      .to(grads[i], { opacity: 1, duration: .9 }, at)
      .to('.j-rail span', { width: ((i + 1) / 4 * 100) + '%', duration: .9 }, at);
    marks[i - 1](jt, at);
    jt.addLabel('s' + i, at + '+=0.9');
  }
  gsap.set('.j-rail span', { width: '25%' });
  jt.to({}, { duration: .4 });

  gsap.from('.dcard', { y: 90, opacity: 0, duration: 1.1, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '.dest', start: 'top 75%' } });

  /* card tilt (fine pointer) */
  if (fine) cards.forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(c, { rotateY: x * 10, rotateX: -y * 8, transformPerspective: 900, duration: .5, ease: 'power2.out' });
    });
    c.addEventListener('pointerleave', function () { gsap.to(c, { rotateY: 0, rotateX: 0, duration: .8, ease: 'elastic.out(1,.5)' }); });
  });

  /* marquee speed reacts to scroll velocity */
  ScrollTrigger.create({ trigger: '.marquee-sec', start: 'top bottom', end: 'bottom top', onUpdate: function (s) {
    var v = Math.min(Math.abs(s.getVelocity()) / 1200, 2.5);
    $$('.mq-track').forEach(function (t) { t.style.animationDuration = (38 / (1 + v)) + 's'; });
  } });
  gsap.from('.marquee', { xPercent: function (i) { return i ? 12 : -12; }, ease: 'none', scrollTrigger: { trigger: '.marquee-sec', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* story */
  gsap.to('.scrub-words .w', { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.scrub-words', start: 'top 80%', end: 'bottom 50%', scrub: true } });
  gsap.from('.story-photo img', { scale: 1.15, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top 80%', end: 'top 20%', scrub: true } });
  gsap.from('.cta', { scale: .94, borderRadius: 80, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'top 40%', scrub: true } });
  gsap.from('.story-text > p:not(.scrub-words), .story blockquote, .member', { y: 50, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.story-text > p:nth-of-type(2)', start: 'top 85%' } });
  gsap.from('.acc-item', { y: 30, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '.acc', start: 'top 85%' } });

  /* cta */
  gsap.from('.cta-title span', { yPercent: 100, opacity: 0, rotate: 4, duration: 1.1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 70%' } });
  gsap.from('.cta-inner > p, .cta-inner > .btn', { y: 30, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 60%' } });

  /* magnetic buttons + custom cursor (desktop only) */
  if (fine) {
    $$('.magnetic').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yTo = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .45); });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
    document.body.classList.add('has-cursor');
    var cur = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
    var dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
    var rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3.out' });
    gsap.set([dot, ring], { opacity: 0 }); var seen = false;
    window.addEventListener('pointermove', function (e) { if (!seen) { seen = true; gsap.to([dot, ring], { opacity: 1, duration: .3 }); } dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('pointerover', function (e) {
      var card = e.target.closest('.dcard'), link = e.target.closest('a, button');
      cur.classList.toggle('is-card', !!card); cur.classList.toggle('is-link', !card && !!link);
      label.textContent = card ? 'Inquire' : '';
    });
    document.addEventListener('pointerleave', function () { gsap.to([dot, ring], { opacity: 0 }); });
    document.addEventListener('pointerenter', function () { gsap.to([dot, ring], { opacity: 1 }); });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
/* v3.7: preselect retreat in the request form */
document.querySelectorAll('a[data-retreat]').forEach(function (a) {
  a.addEventListener('click', function () { var s = document.getElementById('rq-retreat'); if (s) s.value = a.getAttribute('data-retreat'); });
});
