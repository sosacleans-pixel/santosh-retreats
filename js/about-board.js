/* Santosh: about-section photo board. One full photo at a time, no tiles or strips.
   Photos change with a smooth crossfade (about 1.2s) while each photo drifts in a
   slow, subtle zoom (1.00 to 1.06, slight pan). One photo per listed retreat, in
   site order (DR first). Colombia is confirmed, so its live Santa Rosa de Cabal
   photo is included. The credit line always matches the photo that is visible.
   Pauses when off-screen or when the tab is hidden. prefers-reduced-motion gets a
   plain fade with no zoom. Mobile loads smaller images. */
(function () {
  'use strict';

  var art = document.querySelector('#about .split-art');
  if (!art) return;

  var CYCLE = 5600;
  var FADE = 1200;

  var slides = [
    {
      key: 'dr',
      wide: 'img/cabarete-palms-1600.webp',
      narrow: 'img/cabarete-palms-900.webp',
      fallback: 'img/cabarete-palms-1600.jpg',
      position: '40% 60%',
      alt: "Two palm trees lean over golden sand and turquoise Caribbean water on a sunny day at Cabarete, on the Dominican Republic's north coast.",
      place: 'Dominican Republic',
      credit: 'Photo: <a href="https://www.pexels.com/photo/palm-trees-at-the-beach-12510121/" target="_blank" rel="noopener">Joshua Carter</a> / Pexels'
    },
    {
      key: 'colombia',
      wide: 'img/colombia-santa-rosa-falls-1200.webp',
      narrow: 'img/colombia-santa-rosa-falls-800.webp',
      fallback: 'img/colombia-santa-rosa-falls-1200.jpg',
      position: '50% 35%',
      alt: "Waterfalls tumble down a green Andes mountainside at Santa Rosa de Cabal, in Colombia's coffee region.",
      place: 'Colombian Andes',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Termales_de_Santa_Rosa_de_Cabal.jpg" target="_blank" rel="noopener">Juan Sebastian Aparicio</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener license">CC BY-SA 4.0</a> (cropped)'
    },
    {
      key: 'zion',
      wide: 'img/zion-watchman-1600.webp',
      narrow: 'img/zion-watchman-800.webp',
      fallback: 'img/zion-watchman-1600.jpg',
      position: '50% 45%',
      alt: 'The Watchman rises over the Virgin River at sunset in Zion National Park, Utah.',
      place: 'Zion, Utah',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:The_Watchman,_Zion_National_Park_-_Flickr_-_Joe_Parks.jpg" target="_blank" rel="noopener">Joe Parks</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    },
    {
      key: 'wasatch',
      wide: 'img/wasatch-lake-mary-1600.webp',
      narrow: 'img/wasatch-lake-mary-800.webp',
      fallback: 'img/wasatch-lake-mary-1600.jpg',
      position: '50% 50%',
      alt: 'A hiker stands on a rock beside Lake Mary in the Wasatch Mountains near Brighton, Utah.',
      place: 'Wasatch, Utah',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Lake_Mary,_Brighton,_UT.jpg" target="_blank" rel="noopener">cricketsblog</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    },
    {
      key: 'moab',
      wide: 'img/moab-mesa-arch-1600.webp',
      narrow: 'img/moab-mesa-arch-800.webp',
      fallback: 'img/moab-mesa-arch-1600.jpg',
      position: '50% 55%',
      alt: 'The view through Mesa Arch looks out over red-rock canyons in Canyonlands National Park, near Moab, Utah.',
      place: 'Moab, Utah',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Mesa_Arch._Canyonlands_National_Park,_Utah_(14702389212).jpg" target="_blank" rel="noopener">Paxson Woelber</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    },
    {
      key: 'chatcolet',
      wide: 'img/chatcolet-bridge-1600.webp',
      narrow: 'img/chatcolet-bridge-800.webp',
      fallback: 'img/chatcolet-bridge-1600.jpg',
      position: '50% 50%',
      alt: 'The Chatcolet Bridge trestle and swing span cross Lake Coeur d\'Alene on the Trail of the Coeur d\'Alenes in North Idaho.',
      place: 'Chatcolet, Idaho',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Bike_trail_using_former_railway_trestle_and_swing_bridge_over_Lake_Coeur_d%27Alene.jpg" target="_blank" rel="noopener">Nikky from Seattle</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    }
  ];

  var creditEl = art.querySelector('.sa-credit');
  var placeEl = art.querySelector('.sa-place');
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrowMq = window.matchMedia('(max-width: 700px)');
  var idx = 0;
  var visible = true;
  var busy = false;
  var timer = 0;
  var board = null;
  var layers = [];
  var front = 0;
  var swapTimer = 0;
  var doneTimer = 0;

  function srcOf(slide) {
    return narrowMq.matches ? slide.narrow : slide.wide;
  }

  function preload(slide, cb) {
    var im = new Image();
    if (cb) {
      im.onload = cb;
      im.onerror = cb;
    }
    im.src = srcOf(slide);
    return im;
  }

  function nextIndex() {
    return (idx + 1) % slides.length;
  }

  function applyPic(el, slide) {
    el.style.backgroundImage = 'url("' + srcOf(slide) + '")';
    el.style.backgroundPosition = slide.position || '50% 50%';
  }

  function panFor(i) {
    var dirs = [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6], [0, -1], [0, 1]];
    var d = dirs[i % dirs.length];
    return { x: d[0] * 1.2, y: d[1] * 0.9 };
  }

  function startZoom(layer, i) {
    var p = panFor(i);
    layer.style.setProperty('--bb-x', p.x + '%');
    layer.style.setProperty('--bb-y', p.y + '%');
    layer.classList.remove('is-zoom');
    void layer.offsetWidth;
    if (!reduceMq.matches) layer.classList.add('is-zoom');
  }

  function setCredit(slide) {
    if (creditEl) creditEl.innerHTML = slide.credit;
    if (placeEl) placeEl.textContent = slide.place || '';
    if (board) board.setAttribute('aria-label', slide.alt);
  }

  function build() {
    var fallback = art.querySelector('.bb-fallback, .sa-kb');
    if (fallback) fallback.setAttribute('hidden', '');
    if (board && board.parentNode) board.parentNode.removeChild(board);
    board = document.createElement('div');
    board.className = 'bb' + (reduceMq.matches ? ' bb-reduced' : '');
    board.setAttribute('role', 'img');
    layers = [];
    for (var k = 0; k < 2; k++) {
      var layer = document.createElement('div');
      layer.className = 'bb-layer';
      board.appendChild(layer);
      layers.push(layer);
    }
    art.insertBefore(board, art.firstChild);
    front = 0;
    applyPic(layers[0], slides[idx]);
    layers[0].classList.add('is-on');
    startZoom(layers[0], idx);
    applyPic(layers[1], slides[nextIndex()]);
    setCredit(slides[idx]);
  }

  function advance() {
    if (busy) return;
    busy = true;
    var nxt = nextIndex();
    var back = 1 - front;
    preload(slides[nxt], function () {
      applyPic(layers[back], slides[nxt]);
      startZoom(layers[back], nxt);
      layers[back].classList.add('is-on');
      layers[front].classList.remove('is-on');
      if (creditEl) creditEl.classList.add('is-out');
      if (placeEl) placeEl.classList.add('is-out');
      window.clearTimeout(swapTimer);
      swapTimer = window.setTimeout(function () {
        setCredit(slides[nxt]);
        if (creditEl) creditEl.classList.remove('is-out');
        if (placeEl) placeEl.classList.remove('is-out');
      }, Math.round(FADE * 0.5));
      window.clearTimeout(doneTimer);
      doneTimer = window.setTimeout(function () {
        var old = front;
        front = back;
        idx = nxt;
        layers[old].classList.remove('is-zoom');
        applyPic(layers[old], slides[nextIndex()]);
        busy = false;
        preload(slides[nextIndex()]);
      }, FADE + 40);
    });
  }

  function tick() {
    if (!visible || document.hidden || busy) return;
    advance();
  }

  function arm() {
    window.clearInterval(timer);
    if (!visible || document.hidden) return;
    timer = window.setInterval(tick, CYCLE);
  }

  function disarm() {
    window.clearInterval(timer);
    timer = 0;
  }

  build();
  preload(slides[1]);

  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      visible = entries.some(function (e) { return e.isIntersecting; });
      if (visible) arm();
      else disarm();
    }, { threshold: 0.15 });
    io.observe(art);
  } else {
    visible = true;
    arm();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) disarm();
    else if (visible) arm();
  });

  function rebuild() {
    var keep = idx;
    disarm();
    window.clearTimeout(swapTimer);
    window.clearTimeout(doneTimer);
    busy = false;
    idx = keep;
    build();
    if (visible && !document.hidden) arm();
  }

  function repaint() {
    layers.forEach(function (l, k) {
      applyPic(l, slides[k === front ? idx : nextIndex()]);
    });
  }

  if (typeof reduceMq.addEventListener === 'function') {
    reduceMq.addEventListener('change', rebuild);
    narrowMq.addEventListener('change', repaint);
  } else if (reduceMq.addListener) {
    reduceMq.addListener(rebuild);
    narrowMq.addListener(repaint);
  }

  // Used only for preview screenshots; not referenced by the page.
  window.__santoshBoard = {
    advance: advance,
    show: function (i) {
      idx = ((i % slides.length) + slides.length) % slides.length;
      busy = false;
      build();
    },
    getIndex: function () { return idx; },
    slides: slides
  };
})();
