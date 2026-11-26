/* Santosh: about-section split-flap board, in the style of an old airport
   departures board. One photo per listed retreat, in site order (DR first).
   Colombia is confirmed, so its live Santa Rosa de Cabal photo is included.
   Pauses when off-screen or when the tab is hidden. prefers-reduced-motion
   gets a simple crossfade with no flap. Mobile uses fewer slats and smaller images. */
(function () {
  'use strict';

  var art = document.querySelector('#about .split-art');
  if (!art) return;

  var CYCLE = 5500;
  var TOP_MS = 320;
  var GAP_MS = 50;
  var BOT_MS = 320;
  var STAGGER = 80;

  var slides = [
    {
      key: 'dr',
      wide: 'img/cabarete-palms-1600.webp',
      narrow: 'img/cabarete-palms-900.webp',
      fallback: 'img/cabarete-palms-1600.jpg',
      position: '40% 60%',
      alt: "Two palm trees lean over golden sand and turquoise Caribbean water on a sunny day at Cabarete, on the Dominican Republic's north coast.",
      credit: 'Photo: <a href="https://www.pexels.com/photo/palm-trees-at-the-beach-12510121/" target="_blank" rel="noopener">Joshua Carter</a> / Pexels'
    },
    {
      key: 'colombia',
      wide: 'img/colombia-santa-rosa-falls-1200.webp',
      narrow: 'img/colombia-santa-rosa-falls-800.webp',
      fallback: 'img/colombia-santa-rosa-falls-1200.jpg',
      position: '50% 35%',
      alt: "Waterfalls tumble down a green Andes mountainside at Santa Rosa de Cabal, in Colombia's coffee region.",
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Termales_de_Santa_Rosa_de_Cabal.jpg" target="_blank" rel="noopener">Juan Sebastian Aparicio</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener license">CC BY-SA 4.0</a> (cropped)'
    },
    {
      key: 'zion',
      wide: 'img/zion-watchman-1600.webp',
      narrow: 'img/zion-watchman-800.webp',
      fallback: 'img/zion-watchman-1600.jpg',
      position: '50% 45%',
      alt: 'The Watchman rises over the Virgin River at sunset in Zion National Park, Utah.',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:The_Watchman,_Zion_National_Park_-_Flickr_-_Joe_Parks.jpg" target="_blank" rel="noopener">Joe Parks</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    },
    {
      key: 'wasatch',
      wide: 'img/wasatch-lake-mary-1600.webp',
      narrow: 'img/wasatch-lake-mary-800.webp',
      fallback: 'img/wasatch-lake-mary-1600.jpg',
      position: '50% 50%',
      alt: 'A hiker stands on a rock beside Lake Mary in the Wasatch Mountains near Brighton, Utah.',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Lake_Mary,_Brighton,_UT.jpg" target="_blank" rel="noopener">cricketsblog</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    },
    {
      key: 'moab',
      wide: 'img/moab-mesa-arch-1600.webp',
      narrow: 'img/moab-mesa-arch-800.webp',
      fallback: 'img/moab-mesa-arch-1600.jpg',
      position: '50% 55%',
      alt: 'The view through Mesa Arch looks out over red-rock canyons in Canyonlands National Park, near Moab, Utah.',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Mesa_Arch._Canyonlands_National_Park,_Utah_(14702389212).jpg" target="_blank" rel="noopener">Paxson Woelber</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    },
    {
      key: 'chatcolet',
      wide: 'img/chatcolet-bridge-1600.webp',
      narrow: 'img/chatcolet-bridge-800.webp',
      fallback: 'img/chatcolet-bridge-1600.jpg',
      position: '50% 50%',
      alt: 'The Chatcolet Bridge trestle and swing span cross Lake Coeur d\'Alene on the Trail of the Coeur d\'Alenes in North Idaho.',
      credit: 'Photo: <a href="https://commons.wikimedia.org/wiki/File:Bike_trail_using_former_railway_trestle_and_swing_bridge_over_Lake_Coeur_d%27Alene.jpg" target="_blank" rel="noopener">Nikky from Seattle</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener license">CC BY 2.0</a> (cropped)'
    }
  ];

  var creditEl = art.querySelector('.sa-credit');
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrowMq = window.matchMedia('(max-width: 700px)');
  var idx = 0;
  var visible = true;
  var flipping = false;
  var timer = 0;
  var board = null;
  var slats = [];
  var rows = 0;
  var fadeA = null;
  var fadeB = null;

  function srcOf(slide) {
    return narrowMq.matches ? slide.narrow : slide.wide;
  }

  function preload(slide) {
    var im = new Image();
    im.src = srcOf(slide);
    return im;
  }

  function applyPic(el, slide) {
    el.style.backgroundImage = 'url("' + srcOf(slide) + '")';
    el.style.backgroundPosition = slide.position || '50% 50%';
  }

  function setCredit(slide) {
    if (creditEl) creditEl.innerHTML = slide.credit;
    if (board) board.setAttribute('aria-label', slide.alt);
  }

  function nextIndex() {
    return (idx + 1) % slides.length;
  }

  function rowCount() {
    return narrowMq.matches ? 3 : 6;
  }

  function buildFlapBoard() {
    rows = rowCount();
    if (board && board.parentNode) board.parentNode.removeChild(board);
    board = document.createElement('div');
    board.className = 'bb';
    board.setAttribute('role', 'img');
    board.style.setProperty('--rows', String(rows));
    slats = [];
    for (var i = 0; i < rows; i++) {
      var slat = document.createElement('div');
      slat.className = 'bb-slat';
      slat.style.setProperty('--i', String(i));
      slat.innerHTML =
        '<div class="bb-slot bb-slot-top">' +
          '<div class="bb-rest"><div class="bb-pic bb-pic-next"></div></div>' +
          '<div class="bb-flap bb-flap-top"><div class="bb-pic bb-pic-cur"></div></div>' +
        '</div>' +
        '<div class="bb-slot bb-slot-bot">' +
          '<div class="bb-rest"><div class="bb-pic bb-pic-next"></div></div>' +
          '<div class="bb-flap bb-flap-bot"><div class="bb-pic bb-pic-cur"></div></div>' +
        '</div>';
      slat.querySelectorAll('.bb-slot-top .bb-pic').forEach(function (p) { p.style.setProperty('--half', '0'); });
      slat.querySelectorAll('.bb-slot-bot .bb-pic').forEach(function (p) { p.style.setProperty('--half', '1'); });
      board.appendChild(slat);
      slats.push(slat);
    }
    art.insertBefore(board, art.firstChild);
    paint(idx, nextIndex());
    setCredit(slides[idx]);
  }

  function paint(cur, nxt) {
    var curS = slides[cur];
    var nxtS = slides[nxt];
    art.querySelectorAll('.bb-pic-cur').forEach(function (p) { applyPic(p, curS); });
    art.querySelectorAll('.bb-pic-next').forEach(function (p) { applyPic(p, nxtS); });
  }

  function buildFadeBoard() {
    if (board && board.parentNode) board.parentNode.removeChild(board);
    board = document.createElement('div');
    board.className = 'bb bb-fade';
    board.setAttribute('role', 'img');
    fadeA = document.createElement('div');
    fadeA.className = 'bb-fade-pic is-on';
    fadeB = document.createElement('div');
    fadeB.className = 'bb-fade-pic';
    board.appendChild(fadeA);
    board.appendChild(fadeB);
    art.insertBefore(board, art.firstChild);
    applyPic(fadeA, slides[idx]);
    applyPic(fadeB, slides[nextIndex()]);
    setCredit(slides[idx]);
    slats = [];
    rows = 0;
  }

  function build() {
    var fallback = art.querySelector('.bb-fallback, .sa-kb');
    if (fallback) fallback.setAttribute('hidden', '');
    if (reduceMq.matches) buildFadeBoard();
    else buildFlapBoard();
  }

  function startFlip(done) {
    if (flipping) return;
    flipping = true;
    preload(slides[nextIndex()]);
    var i = 0;
    function flipTop() {
      if (i >= slats.length) {
        window.setTimeout(flipBottoms, GAP_MS);
        return;
      }
      slats[i].classList.add('is-flip-top');
      i += 1;
      window.setTimeout(flipTop, STAGGER);
    }
    function flipBottoms() {
      var j = 0;
      function flipBot() {
        if (j >= slats.length) {
          window.setTimeout(finishFlip, BOT_MS + 20);
          return;
        }
        slats[j].classList.add('is-flip-bot');
        j += 1;
        window.setTimeout(flipBot, STAGGER);
      }
      flipBot();
    }
    function finishFlip() {
      idx = nextIndex();
      slats.forEach(function (s) { s.classList.remove('is-flip-top', 'is-flip-bot'); });
      paint(idx, nextIndex());
      setCredit(slides[idx]);
      flipping = false;
      preload(slides[nextIndex()]);
      if (done) done();
    }
    preload(slides[nextIndex()]);
    flipTop();
  }

  function startFade() {
    if (flipping) return;
    flipping = true;
    var nxt = nextIndex();
    applyPic(fadeB, slides[nxt]);
    fadeB.classList.add('is-on');
    fadeA.classList.remove('is-on');
    window.setTimeout(function () {
      var tmp = fadeA;
      fadeA = fadeB;
      fadeB = tmp;
      idx = nxt;
      applyPic(fadeB, slides[nextIndex()]);
      setCredit(slides[idx]);
      flipping = false;
    }, 700);
  }

  function tick() {
    if (!visible || document.hidden || flipping) return;
    if (reduceMq.matches) startFade();
    else startFlip();
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
    flipping = false;
    idx = keep;
    build();
    if (visible && !document.hidden) arm();
  }

  if (typeof narrowMq.addEventListener === 'function') {
    narrowMq.addEventListener('change', rebuild);
    reduceMq.addEventListener('change', rebuild);
  } else if (narrowMq.addListener) {
    narrowMq.addListener(rebuild);
    reduceMq.addListener(rebuild);
  }

  // Used only for preview screenshots; not referenced by the page.
  window.__santoshBoard = {
    startFlip: startFlip,
    startFade: startFade,
    show: function (i) {
      idx = ((i % slides.length) + slides.length) % slides.length;
      if (reduceMq.matches) {
        applyPic(fadeA, slides[idx]);
        applyPic(fadeB, slides[nextIndex()]);
        fadeA.classList.add('is-on');
        fadeB.classList.remove('is-on');
      } else {
        slats.forEach(function (s) { s.classList.remove('is-flip-top', 'is-flip-bot'); });
        paint(idx, nextIndex());
      }
      setCredit(slides[idx]);
    },
    getIndex: function () { return idx; },
    slides: slides
  };
})();
