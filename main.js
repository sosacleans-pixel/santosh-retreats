(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = 'IntersectionObserver' in window;

  // Mobile nav
  var tog = document.querySelector('.nav-toggle'), list = document.getElementById('nav-links');
  tog.addEventListener('click', function(){
    var o = tog.getAttribute('aria-expanded') === 'true';
    tog.setAttribute('aria-expanded', String(!o)); list.classList.toggle('open', !o);
  });
  list.addEventListener('click', function(e){ if(e.target.closest('a')){ tog.setAttribute('aria-expanded','false'); list.classList.remove('open'); } });

  // Hero: scroll-driven scale + fade
  var hero = document.querySelector('.hero'), media = document.querySelector('[data-hero-media]'), copy = document.querySelector('[data-hero-copy]');
  if(!reduce && hero){
    var ticking = false;
    var update = function(){
      var h = hero.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max(window.scrollY - hero.offsetTop, 0) / (h || 1), 1);
      media.style.transform = 'scale(' + (1.12 - p * 0.12) + ') translateY(' + (p * -4) + '%)';
      copy.style.transform = 'translateY(' + (p * -80) + 'px)';
      copy.style.opacity = String(1 - Math.max(p - 0.35, 0) * 1.6);
      ticking = false;
    };
    window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }, {passive:true});
    update();
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if(io && !reduce){
    var rio = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); } }); }, {threshold:.15});
    reveals.forEach(function(el){ rio.observe(el); });
  } else reveals.forEach(function(el){ el.classList.add('in'); });

  // Counters
  var nums = document.querySelectorAll('[data-count]');
  function runCount(el){
    var end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1600;
    function step(t){ if(!t0) t0 = t; var k = Math.min((t - t0) / dur, 1); var v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = v + suf; if(k < 1) requestAnimationFrame(step); }
    el.textContent = '0' + suf; requestAnimationFrame(step);
  }
  if(io && !reduce){
    var cio = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ runCount(e.target); cio.unobserve(e.target); } }); }, {threshold:.6});
    nums.forEach(function(n){ cio.observe(n); });
  }

  // Journey: active step drives sticky visual
  var steps = document.querySelectorAll('.step'), panels = document.querySelectorAll('.jv-panel'), bar = document.querySelector('[data-progress]');
  function activate(i){
    steps.forEach(function(s, j){ s.classList.toggle('is-active', j === i); });
    panels.forEach(function(p, j){ p.classList.toggle('is-active', j === i); });
    if(bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
  }
  activate(0);
  if(io){
    var sio = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) activate(+e.target.dataset.step); }); }, {rootMargin:'-45% 0px -45% 0px'});
    steps.forEach(function(s){ sio.observe(s); });
  }

  // Filters
  var chips = document.querySelectorAll('.chip'), cards = document.querySelectorAll('.card'), status = document.querySelector('[data-filter-status]');
  chips.forEach(function(c){
    c.addEventListener('click', function(){
      var f = c.dataset.filter, n = 0;
      chips.forEach(function(x){ var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      cards.forEach(function(card){
        var show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('is-hidden', !show);
        card.classList.remove('is-entering');
        if(show){ n++; if(!reduce){ void card.offsetWidth; card.classList.add('is-entering'); } }
      });
      status.textContent = n + ' retreat' + (n === 1 ? '' : 's') + ' shown';
    });
  });

  // Accordions + timeline (button[aria-controls])
  document.querySelectorAll('.acc button').forEach(function(b){
    b.addEventListener('click', function(){
      var open = b.getAttribute('aria-expanded') === 'true', panel = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', String(!open)); panel.hidden = open;
    });
  });
})();
