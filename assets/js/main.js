/* ==========================================================================
   A.C. PERSONAL TRAINER — Interazioni e animazioni
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.AC_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduceMotion;

  if (animate) {
    document.documentElement.classList.add('js-anim');
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Config wiring ---------- */
  var igUrl = 'https://www.instagram.com/' + (CFG.instagram || '') + '/';
  $$('[data-ig-link]').forEach(function (a) { a.href = igUrl; });
  $$('[data-ig-handle]').forEach(function (el) { el.textContent = '@' + CFG.instagram; });
  $$('[data-ig-handle-plain]').forEach(function (el) { el.textContent = CFG.instagram; });
  if (CFG.city) $$('[data-city]').forEach(function (el) { el.textContent = CFG.city; });
  if (CFG.vat) $$('[data-vat]').forEach(function (el) { el.textContent = CFG.vat; });
  if (CFG.businessName) $$('[data-business]').forEach(function (el) { el.textContent = CFG.businessName; });
  if (CFG.address) $$('[data-address]').forEach(function (el) { el.textContent = CFG.address; });
  var phones = CFG.phones || [];
  var tel = function (n) { var d = n.replace(/[^\d+]/g, ''); return 'tel:' + (d.charAt(0) === '+' ? d : '+39' + d); };
  if (phones.length) {
    $$('[data-show="phones"]').forEach(function (el) { el.hidden = false; });
    $$('[data-phones]').forEach(function (el) {
      el.innerHTML = phones.map(function (n) { return '<a href="' + tel(n) + '">' + n + '</a>'; }).join('<br>');
    });
    $$('.contact__quick').forEach(function (el) {
      el.innerHTML = phones.map(function (n) {
        return '<a class="btn btn--ghost btn--sm" href="' + tel(n) + '"><svg class="btn__ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg><span>' + n + '</span></a>';
      }).join('') + (CFG.whatsapp ? '<a class="btn btn--gold btn--sm" href="https://wa.me/' + CFG.whatsapp + '" target="_blank" rel="noopener"><span>WhatsApp</span></a>' : '');
    });
  }
  if (CFG.whatsapp) {
    $$('[data-show="whatsapp"]').forEach(function (el) { el.hidden = false; });
    $$('[data-wa-link]').forEach(function (a) { a.href = 'https://wa.me/' + CFG.whatsapp; });
  }
  if (CFG.email) {
    $$('[data-show="email"]').forEach(function (el) { el.hidden = false; });
    $$('[data-email-link]').forEach(function (a) { a.href = 'mailto:' + CFG.email; a.textContent = CFG.email; });
  }
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-show'); }, 4200);
  }

  /* ---------- Preloader ---------- */
  var loader = $('#loader'), bar = $('#loaderBar'), pct = $('#loaderPct');
  var progress = 0, target = 0, sceneReady = false, pageLoaded = false, finished = false;
  var CIRC = 339.3;
  function setTarget() { target = (pageLoaded ? 60 : 30) + (sceneReady ? 40 : 0); }
  window.addEventListener('ac:scene-ready', function () { sceneReady = true; setTarget(); });
  window.addEventListener('ac:scene-failed', function () { sceneReady = true; document.documentElement.classList.add('no-webgl'); setTarget(); });
  window.addEventListener('load', function () { pageLoaded = true; setTarget(); });
  setTarget();
  // safety net: never block the page more than 6s
  setTimeout(function () {
    if (!sceneReady) document.documentElement.classList.add('no-webgl');
    pageLoaded = sceneReady = true; setTarget();
  }, 6000);

  var lastT = performance.now();
  (function tick(now) {
    var dt = Math.min(0.1, ((now || performance.now()) - lastT) / 1000);
    lastT = now || performance.now();
    progress += (target - progress) * Math.min(1, dt * 6) + dt * 25;
    if (progress > target) progress = target;
    bar.style.strokeDashoffset = CIRC - (CIRC * progress) / 100;
    pct.textContent = Math.round(progress);
    if (progress >= 99.5 && !finished) { finished = true; return setTimeout(finishLoading, 250); }
    if (!finished) requestAnimationFrame(tick);
  })();

  function finishLoading() {
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    if (lenis) lenis.start();
    window.dispatchEvent(new Event('ac:intro'));
    intro();
  }

  /* ---------- Split text into words / chars ---------- */
  function splitChars(root) {
    var chars = [];
    if (root.classList.contains('accent')) root.classList.add('is-split');
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            Array.from(part).forEach(function (ch) {
              var c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              w.appendChild(c);
              chars.push(c);
            });
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('accent')) n.classList.add('is-split');
          walk(n);
        }
      });
    })(root);
    return chars;
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (animate && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  function scrollToTarget(hash) {
    var el = hash === '#top' ? 0 : document.querySelector(hash);
    if (el === null) return false;
    if (lenis) {
      lenis.scrollTo(el, { offset: (hash === '#top' || hash === '#manifesto') ? 0 : -70, duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    } else if (el === 0) { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    else { el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute('href');
    if (hash.length < 2) return;
    if (scrollToTarget(hash)) e.preventDefault();
  });

  /* ---------- Intro + scroll animations ---------- */
  var heroChars = [];
  if (animate) {
    $$('.hero__title .word').forEach(function (w) { heroChars = heroChars.concat(splitChars(w)); });
    gsap.set(heroChars, { yPercent: 120, rotateX: -80, opacity: 0 });
  }

  function intro() {
    if (!animate) return;
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.55 });
    tl.to(heroChars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.5, stagger: 0.028 }, 0)
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.5)
      .from('.nav', { y: -30, opacity: 0, duration: 1, clearProps: 'transform,opacity' }, 0.2)
      .from('.hero__scroll', { opacity: 0, duration: 1 }, 1);
    $$('[data-count]').forEach(function (el) {
      var o = { v: 0 }, to = +el.getAttribute('data-count');
      tl.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } }, 0.8);
    });
  }

  if (animate) {
    $$('.reveal-up').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // headings: letter-by-letter 3D reveal
    $$('.split').forEach(function (el) {
      var chars = splitChars(el);
      gsap.from(chars, { yPercent: 110, rotateX: -90, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.018,
        scrollTrigger: { trigger: el, start: 'top 86%' } });
    });

    gsap.from('.card', { y: 100, opacity: 0, rotateX: -25, rotateY: 8, transformOrigin: '50% 100%', duration: 1.4, ease: 'expo.out', stagger: 0.1, clearProps: 'transform',
      scrollTrigger: { trigger: '.cards', start: 'top 82%' } });
    gsap.fromTo('.coin', { clipPath: 'circle(0% at 50% 50%)', rotate: -40, scale: 0.8 },
      { clipPath: 'circle(75% at 50% 50%)', rotate: 0, scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'clipPath,transform', scrollTrigger: { trigger: '.about', start: 'top 70%' } });
    gsap.from('.pillar', { x: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.pillars', start: 'top 85%' } });
    gsap.from('.phone', { y: 160, rotateX: 40, rotateZ: -12, opacity: 0, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.ig', start: 'top 70%' } });
    gsap.from('.tile', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(2)', stagger: { each: 0.06, from: 'random' }, scrollTrigger: { trigger: '.ig', start: 'top 60%' } });
    gsap.from('.quiz__box', { y: 80, opacity: 0, rotateX: 12, transformPerspective: 1200, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.quiz__box', start: 'top 85%' } });
    gsap.from('.contact__form', { y: 80, opacity: 0, rotateX: 10, transformPerspective: 1200, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.contact__form', start: 'top 85%' } });
    gsap.from('.contact__list li', { x: -40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.contact__list', start: 'top 88%' } });
    gsap.from('.faq__item', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.faq__list', start: 'top 85%' } });
    gsap.from('.footer__giant span', { yPercent: 70, opacity: 0, rotateX: -60, ease: 'none', stagger: 0.15, scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 1 } });

    // timeline fill
    gsap.to('#timelineFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: 0.6 } });
    $$('.step').forEach(function (step, i) {
      ScrollTrigger.create({ trigger: step, start: 'top 62%', onEnter: function () { step.classList.add('is-on'); }, onLeaveBack: function () { step.classList.remove('is-on'); } });
      gsap.from(step.querySelector('.step__card'), { x: (window.innerWidth >= 900 ? (i % 2 ? -80 : 80) : 40), opacity: 0, rotateY: (i % 2 ? 12 : -12), transformPerspective: 1200, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 82%' } });
    });

    // hero: text drifts away as the dumbbell takes the stage
    gsap.to('.hero__inner', { yPercent: 22, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } });

    /* --- Manifesto: pinned 3D choreography --- */
    window.AC_STATE = { travel: 0, pin: 0, exit: 0 };
    ScrollTrigger.create({ trigger: '#manifesto', start: 'top bottom', end: 'top top', scrub: true,
      onUpdate: function (st) { window.AC_STATE.travel = st.progress; } });

    var words = $$('.mword'), mBar = $('#mBar'), mCount = $('#mCount');
    var mtl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    words.forEach(function (w, i) {
      var chars = splitChars(w.querySelector('.mword__big'));
      var cap = w.querySelector('p');
      gsap.set(chars, { yPercent: 120, rotateX: -90, opacity: 0 });
      gsap.set(cap, { opacity: 0, y: 30 });
      var at = i * 1.2;
      mtl.to(chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.5, stagger: 0.03 }, at)
        .to(cap, { opacity: 1, y: 0, duration: 0.4 }, at + 0.25);
      if (i < words.length - 1) {
        mtl.to(chars, { yPercent: -120, rotateX: 90, opacity: 0, duration: 0.45, stagger: 0.02, ease: 'power3.in' }, at + 0.95)
          .to(cap, { opacity: 0, y: -30, duration: 0.3, ease: 'power3.in' }, at + 0.95);
      }
    });
    mtl.to('.spec', { opacity: 1, duration: 0.3, stagger: 0.12 }, 1.1)
      .from('.spec i', { scaleX: 0, transformOrigin: 'right center', duration: 0.3, stagger: 0.12 }, 1.1)
      .to('.spec', { opacity: 0, duration: 0.3 }, 2.3)
      .to({}, { duration: 0.4 });

    ScrollTrigger.create({
      trigger: '#manifesto', start: 'top top', end: '+=320%', pin: true, scrub: 0.8, animation: mtl,
      onUpdate: function (st) {
        window.AC_STATE.pin = st.progress;
        mBar.style.transform = 'scaleX(' + st.progress + ')';
        mCount.textContent = '0' + Math.min(3, Math.floor(st.progress * 3 * 0.999) + 1);
      }
    });
    ScrollTrigger.create({ trigger: '#chi-sono', start: 'top bottom', end: 'top 30%', scrub: true,
      onUpdate: function (st) { window.AC_STATE.exit = st.progress; } });

    /* --- Scroll velocity: skew + marquee boost --- */
    var skewTargets = $$('.cards, .areas, .pillars, .faq__list, .timeline');
    var skewSet = gsap.quickSetter(skewTargets, 'skewY', 'deg');
    var proxy = { skew: 0 };
    var track = $('.marquee__track');
    track.style.animation = 'none';
    var mq = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      onUpdate: function (st) {
        var v = st.getVelocity();
        var sk = gsap.utils.clamp(-4, 4, v / -400);
        if (Math.abs(sk) > Math.abs(proxy.skew)) {
          proxy.skew = sk;
          gsap.to(proxy, { skew: 0, duration: 0.9, ease: 'power3', overwrite: true, onUpdate: function () { skewSet(proxy.skew); } });
        }
        mq.timeScale(1 + Math.min(Math.abs(v) / 350, 6));
        gsap.to(mq, { timeScale: 1, duration: 1.2, ease: 'power2.out', overwrite: true });
      }
    });

    /* --- Hero title follows the pointer in 3D --- */
    if (finePointer) {
      var title = $('.hero__title');
      $('#hero').addEventListener('pointermove', function (e) {
        var px = e.clientX / window.innerWidth - 0.5, py = e.clientY / window.innerHeight - 0.5;
        title.style.transform = 'rotateY(' + px * 8 + 'deg) rotateX(' + -py * 8 + 'deg)';
      });
      $('#hero').addEventListener('pointerleave', function () { title.style.transform = ''; });
    }
  } else {
    document.documentElement.classList.add('no-motion');
    $$('.step').forEach(function (s) { s.classList.add('is-on'); });
    var tf = $('#timelineFill'); if (tf) tf.style.transform = 'scaleY(1)';
  }

  /* ---------- Scroll: progress bar, nav state, active link ---------- */
  var progressEl = $('#progress'), nav = $('#nav'), lastY = 0;
  var sections = $$('main section[id]');
  var links = $$('.nav__links a[href^="#"]');
  var dots = $$('#dots a'), dotsNav = $('#dots');
  var dotTargets = dots.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    progressEl.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('is-scrolled', y > 40);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 600);
    lastY = y;
    var current = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id; });
    links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + current); });
    var activeDot = 0;
    dotTargets.forEach(function (el, i) { if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) activeDot = i; });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === activeDot); });
    dotsNav.classList.toggle('is-visible', y > window.innerHeight * 0.5);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Custom cursor + magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    var cursor = $('#cursor'), cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
    var cursorLabel = $('#cursorLabel');
    document.addEventListener('pointerover', function (e) {
      var labelled = e.target.closest('[data-cursor]');
      cursor.classList.toggle('has-label', !!labelled);
      if (labelled) cursorLabel.textContent = labelled.getAttribute('data-cursor');
      cursor.classList.toggle('is-hover', !labelled && !!e.target.closest('a, button, .choice, summary, input, select, textarea'));
    });

    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 3D tilt (cards, coin, phone) ---------- */
  if (!reduceMotion) {
    $$('.tilt').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt-max')) || 10;
      var target = el.classList.contains('ig__phone') ? el.querySelector('.phone') : el;
      var raf = 0;
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          target.style.transition = 'transform .15s ease-out';
          target.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - py) * max) + 'deg) rotateY(' + ((px - 0.5) * max) + 'deg) translateZ(0)';
          el.style.setProperty('--mx', px * 100 + '%');
          el.style.setProperty('--my', py * 100 + '%');
          el.style.setProperty('--gx', px * 100 + '%');
          el.style.setProperty('--gy', py * 100 + '%');
          el.style.setProperty('--glare', (100 - px * 100) + '%');
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        target.style.transition = 'transform .9s cubic-bezier(.22,1,.36,1)';
        target.style.transform = '';
      });
    });
  }

  // coin flip (hover on desktop, tap on touch)
  var coin = $('#coin');
  coin.addEventListener('click', function () { coin.classList.toggle('is-flipped'); });
  if (finePointer) {
    coin.addEventListener('pointerenter', function () { coin.classList.add('is-flipped'); });
    coin.addEventListener('pointerleave', function () { coin.classList.remove('is-flipped'); });
  }

  /* ---------- Venue areas (isometric plan) ---------- */
  var areaBtns = $$('.area'), zones = $$('.zone');
  function setZone(z) {
    areaBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-zone') === z); });
    zones.forEach(function (el) { el.classList.toggle('is-active', el.getAttribute('data-zone') === z); });
  }
  areaBtns.forEach(function (b) {
    var z = b.getAttribute('data-zone');
    b.addEventListener('click', function () { setZone(z); });
    b.addEventListener('pointerenter', function () { setZone(z); });
    b.addEventListener('focus', function () { setZone(z); });
  });
  zones.forEach(function (el) { el.addEventListener('pointerenter', function () { setZone(el.getAttribute('data-zone')); }); });
  setZone('pesi');
  var plan = $('#plan');
  if (plan && finePointer && !reduceMotion) {
    plan.addEventListener('pointermove', function (e) {
      var r = plan.getBoundingClientRect();
      plan.style.setProperty('--rx', ((e.clientY - r.top) / r.height - 0.5) * -8 + 'deg');
      plan.style.setProperty('--rz', ((e.clientX - r.left) / r.width - 0.5) * 10 + 'deg');
    });
    plan.addEventListener('pointerleave', function () { plan.style.removeProperty('--rx'); plan.style.removeProperty('--rz'); });
  }
  if (animate) {
    gsap.from('.zone', { z: -200, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity', scrollTrigger: { trigger: '#plan', start: 'top 80%' } });
    gsap.from('.area', { x: -30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.areas', start: 'top 85%' } });
  }

  /* ---------- Quiz ---------- */
  var quiz = $('#quiz'), steps = $$('.quiz__step', quiz), qBar = $('#quizBar'), back = $('#quizBack');
  var days = $('#days'), daysOut = $('#daysOut'), current = 0;
  var answers = { goal: '', level: '', slot: '', days: 3 };

  var PATHS = {
    dimagrire: { title: 'Percorso Legionario', sub: 'Fitness & Benessere', service: 'Fitness & Benessere', areas: ['Area Cardio', 'Area Functional'],
      desc: 'Dimagrimento e tonificazione con un mix di lavoro cardio e functional, più abitudini quotidiane sostenibili.' },
    massa: { title: 'Percorso Centurione', sub: 'Personal Training · Pesi', service: 'Personal Training', areas: ['Area Pesi'],
      desc: 'Potenziamento muscolare e miglioramento estetico: volume, intensità e progressione dei carichi, seguito passo passo.' },
    forza: { title: 'Percorso Spartano', sub: 'Preparazione Atletica', service: 'Preparazione Atletica', areas: ['Area Pesi', 'Area Combat'],
      desc: 'Protocolli specifici per la tua disciplina: forza, potenza ed esplosività per rendere di più in campo, sul ring o in pedana.' },
    benessere: { title: 'Percorso Pretoriano', sub: 'Functional Training', service: 'Functional Training', areas: ['Area Functional'],
      desc: 'Forza, agilità e coordinazione per muoverti meglio nella vita di tutti i giorni e sentirti pieno di energia.' }
  };
  var LEVEL_NOTE = {
    principiante: 'Partiamo dalle basi: tecnica corretta e progressione graduale, in totale sicurezza.',
    intermedio: 'Rompiamo lo stallo con una programmazione più strutturata e variabili mirate.',
    avanzato: 'Lavoriamo sui dettagli: periodizzazione, intensità e strategie avanzate.'
  };

  function setRangeFill() {
    var p = ((days.value - days.min) / (days.max - days.min)) * 100;
    days.style.setProperty('--fill', p + '%');
    daysOut.textContent = days.value;
    answers.days = +days.value;
  }
  days.addEventListener('input', setRangeFill);
  setRangeFill();

  function goStep(n) {
    current = n;
    steps.forEach(function (s, i) { s.classList.toggle('is-active', i === n); });
    qBar.style.width = Math.min(100, (n / 3) * 100) + '%';
    back.disabled = n === 0;
    quiz.classList.toggle('is-result', n === 3);
  }

  quiz.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type !== 'radio') return;
    answers[t.name] = t.value;
    if (t.name === 'goal' || t.name === 'level') setTimeout(function () { goStep(current + 1); }, 380);
  });
  back.addEventListener('click', function () { if (current > 0) goStep(current - 1); });

  $('#quizGo').addEventListener('click', function () {
    if (!answers.slot) { toast('Scegli la fascia oraria che preferisci.'); return; }
    var p = PATHS[answers.goal] || PATHS.benessere;
    $('#resTitle').innerHTML = p.title + '<br><small style="font-size:.5em;letter-spacing:.1em">' + p.sub + '</small>';
    $('#resDesc').textContent = p.desc + ' ' + (LEVEL_NOTE[answers.level] || '');
    var tags = [answers.level, answers.days + ' giorni fissi / settimana', 'Fascia: ' + answers.slot].concat(p.areas);
    $('#resTags').innerHTML = tags.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    goStep(3);
    if (animate) gsap.from('#resTitle', { scale: 0.8, opacity: 0, duration: 1, ease: 'expo.out' });
    window.dispatchEvent(new CustomEvent('ac:burst'));
  });

  $('#resCta').addEventListener('click', function () {
    var p = PATHS[answers.goal] || PATHS.benessere;
    prefill(p.service,
      'Ho fatto il test sul sito: ' + p.title + ' (' + p.sub + '). Livello ' + answers.level + ', vorrei allenarmi ' + answers.days + ' giorni a settimana, di ' + answers.slot + '. Vorrei prenotare la consulenza iniziale.');
  });

  $('#quizRestart').addEventListener('click', function () {
    quiz.reset(); answers = { goal: '', level: '', slot: '', days: 3 }; setRangeFill(); goStep(0);
  });

  /* ---------- Contact form ---------- */
  var form = $('#contactForm'), goalSel = $('#cGoal'), note = $('#formNote');
  function syncSelect() { goalSel.classList.toggle('has-value', !!goalSel.value); }
  goalSel.addEventListener('change', syncSelect);

  function prefill(goal, msg) {
    for (var i = 0; i < goalSel.options.length; i++) {
      if (goalSel.options[i].text === goal) { goalSel.selectedIndex = i; break; }
    }
    syncSelect();
    if (msg) $('#cMsg').value = msg;
  }
  $$('.card__link[data-goal]').forEach(function (a) {
    a.addEventListener('click', function () { prefill(a.getAttribute('data-goal')); });
  });

  if (CFG.whatsapp) $('#submitLabel').textContent = 'Invia su WhatsApp';
  else if (CFG.email) $('#submitLabel').textContent = 'Invia via email';
  else $('#submitLabel').textContent = 'Scrivimi su Instagram';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#cName').value.trim(), goal = goalSel.value, msg = $('#cMsg').value.trim(), ok = true;
    $('#cName').parentNode.classList.toggle('is-invalid', !name); if (!name) ok = false;
    goalSel.parentNode.classList.toggle('is-invalid', !goal); if (!goal) ok = false;
    var privacy = $('#cPrivacy');
    privacy.parentNode.classList.toggle('is-invalid', !privacy.checked); if (!privacy.checked) ok = false;
    if (!ok) { note.textContent = 'Compila i campi evidenziati e accetta il consenso privacy.'; return; }

    var text = 'Ciao Alessandro, sono ' + name + '. Mi interessa: ' + goal + '.' + (msg ? '\n' + msg : '');

    if (CFG.whatsapp) {
      window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      note.textContent = 'Si sta aprendo WhatsApp con il tuo messaggio già pronto.';
    } else if (CFG.email) {
      window.location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('Richiesta info – ' + goal) + '&body=' + encodeURIComponent(text);
      note.textContent = 'Si sta aprendo il tuo client email con il messaggio già pronto.';
    } else {
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      window.open('https://ig.me/m/' + CFG.instagram, '_blank', 'noopener');
      note.textContent = 'Messaggio copiato! Incollalo nella chat Instagram che si è appena aperta.';
      toast('Messaggio copiato negli appunti ✦ Incollalo nella chat Instagram');
    }
  });

  /* ---------- Button letter roll (after all labels are final) ---------- */
  if (!reduceMotion) {
    $$('.btn > span:not(.btn__ico)').forEach(function (sp) {
      if (sp.children.length) return;
      var txt = sp.textContent;
      sp.textContent = '';
      sp.classList.add('roll');
      sp.setAttribute('aria-label', txt);
      Array.from(txt).forEach(function (ch, i) {
        var c = document.createElement('span');
        c.className = 'c';
        c.setAttribute('aria-hidden', 'true');
        c.style.setProperty('--i', i);
        c.textContent = ch === ' ' ? '\u00a0' : ch;
        sp.appendChild(c);
      });
    });
  }

  /* ---------- Map (click-to-load, GDPR friendly) ---------- */
  $('#mapLoad').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(CFG.mapsQuery || 'Cesarò') + '&z=17&output=embed';
    f.title = 'Mappa: ' + (CFG.city || 'Cesarò');
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    $('#map').innerHTML = '';
    $('#map').appendChild(f);
  });
})();
