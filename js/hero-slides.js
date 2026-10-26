/* Santosh: manual hero slideshow (Sosua, Cabarete, Punta Rucia).
   No autoplay, no crossfade, no motion: the photo changes only when a visitor
   presses an arrow, a dot, or the Left/Right keys while the controls have focus.
   Slides 2 and 3 load only when first requested, so first paint is unchanged. */
(function () {
  'use strict';
  var root = document.querySelector('.hero-window');
  if (!root) return;
  var base = root.querySelector('picture:not(.hero-alt)');
  var alts = Array.prototype.slice.call(root.querySelectorAll('.hero-alt'));
  if (!base || !alts.length) return;
  var slides = [base].concat(alts);
  var labels = ['Sosua beach', 'Cabarete beach', 'Punta Rucia beach'];
  var cur = 0;

  function fill(pic) {
    Array.prototype.forEach.call(pic.querySelectorAll('source[data-srcset]'), function (s) {
      s.srcset = s.getAttribute('data-srcset'); s.removeAttribute('data-srcset');
    });
    var img = pic.querySelector('img');
    if (img && img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset'); }
    if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
  }

  var nav = document.createElement('div');
  nav.className = 'hero-slides';
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', 'Hero photos');
  var prev = document.createElement('button');
  prev.type = 'button'; prev.className = 'hs-arrow hs-prev'; prev.setAttribute('aria-label', 'Previous photo'); prev.innerHTML = '<span aria-hidden="true">&#8249;</span>';
  var next = document.createElement('button');
  next.type = 'button'; next.className = 'hs-arrow hs-next'; next.setAttribute('aria-label', 'Next photo'); next.innerHTML = '<span aria-hidden="true">&#8250;</span>';
  var dots = document.createElement('div');
  dots.className = 'hs-dots';
  var dotEls = slides.map(function (_, i) {
    var d = document.createElement('button');
    d.type = 'button'; d.className = 'hs-dot';
    d.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + slides.length + ': ' + labels[i]);
    d.addEventListener('click', function () { show(i); });
    dots.appendChild(d);
    return d;
  });
  nav.appendChild(prev); nav.appendChild(dots); nav.appendChild(next);
  root.parentNode.appendChild(nav);

  function show(i) {
    i = (i + slides.length) % slides.length;
    if (i > 0) fill(slides[i]);
    slides.forEach(function (p, k) {
      p.classList.toggle('is-on', k === i && k > 0);
      if (k > 0) p.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    dotEls.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    cur = i;
  }
  prev.addEventListener('click', function () { show(cur - 1); });
  next.addEventListener('click', function () { show(cur + 1); });
  nav.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
  });
  show(0);
})();
