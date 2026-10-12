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
  if (CFG.phone) {
    $$('[data-show="phone"]').forEach(function (el) { el.hidden = false; });
    $$('[data-phone-link]').forEach(function (a) { a.href = 'tel:' + CFG.phone.replace(/[^\d+]/g, ''); a.textContent = CFG.phone; });
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
    window.dispatchEvent(new Event('ac:intro'));
    intro();
  }

  /* ---------- Intro + scroll animations ---------- */
  function intro() {
    if (!animate) return;
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__title .word', { y: 0, duration: 1.4, stagger: 0.12 }, 0.1)
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.4)
      .from('.nav', { y: -30, opacity: 0, duration: 1, clearProps: 'transform,opacity' }, 0.3)
      .from('.hero__scroll', { opacity: 0, duration: 1 }, 1);
  }

  if (animate) {
    $$('.reveal-up').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    $$('.split').forEach(function (el) {
      gsap.from(el, { y: 60, opacity: 0, rotateX: -35, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });

    gsap.from('.card', { y: 80, opacity: 0, rotateX: -12, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.cards', start: 'top 80%' } });
    gsap.from('.coin', { scale: 0.6, rotateY: -120, opacity: 0, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.about', start: 'top 70%' } });
    gsap.from('.phone', { y: 120, rotateX: 30, rotateZ: -8, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.ig', start: 'top 70%' } });
    gsap.from('.quiz__box', { y: 60, opacity: 0, scale: 0.96, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.quiz__box', start: 'top 85%' } });
    gsap.from('.contact__form', { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.contact__form', start: 'top 85%' } });
    gsap.to('.marquee__track', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.footer__giant', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // timeline fill
    gsap.to('#timelineFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: 0.6 } });
    $$('.step').forEach(function (step) {
      ScrollTrigger.create({ trigger: step, start: 'top 62%', onEnter: function () { step.classList.add('is-on'); }, onLeaveBack: function () { step.classList.remove('is-on'); } });
      gsap.from(step.querySelector('.step__card'), { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 82%' } });
    });

    // hero parallax
    gsap.to('.hero__inner', { yPercent: 18, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  } else {
    $$('.step').forEach(function (s) { s.classList.add('is-on'); });
    var tf = $('#timelineFill'); if (tf) tf.style.transform = 'scaleY(1)';
  }

  /* ---------- Scroll: progress bar, nav state, active link ---------- */
  var progressEl = $('#progress'), nav = $('#nav'), lastY = 0;
  var sections = $$('main section[id]');
  var links = $$('.nav__links a[href^="#"]');
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    progressEl.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('is-scrolled', y > 40);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 600);
    lastY = y;
    var current = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id; });
    links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + current); });
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
    document.addEventListener('pointerover', function (e) {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .choice, .coin, summary, input, select, textarea'));
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

  /* ---------- Quiz ---------- */
  var quiz = $('#quiz'), steps = $$('.quiz__step', quiz), qBar = $('#quizBar'), back = $('#quizBack');
  var days = $('#days'), daysOut = $('#daysOut'), current = 0;
  var answers = { goal: '', level: '', mode: '', days: 3 };

  var PATHS = {
    dimagrire: { title: 'Percorso Legionario', sub: 'Definizione & Dimagrimento', service: 'Dimagrimento e ricomposizione',
      desc: 'Un piano per bruciare grasso e preservare la massa magra: allenamento metabolico, forza di base e abitudini quotidiane sostenibili.' },
    massa: { title: 'Percorso Centurione', sub: 'Ipertrofia & Estetica', service: 'Forza e ipertrofia',
      desc: 'Volume, intensità e progressione dei carichi per costruire muscolo di qualità e un fisico proporzionato.' },
    forza: { title: 'Percorso Spartano', sub: 'Forza & Performance', service: 'Preparazione atletica',
      desc: 'Fondamentali, potenza ed esplosività: diventi più forte, più veloce e più resistente, dentro e fuori dal campo.' },
    benessere: { title: 'Percorso Pretoriano', sub: 'Benessere & Mobilità', service: 'Mobilità e postura',
      desc: 'Tonicità, postura e mobilità per muoverti meglio e sentirti pieno di energia ogni giorno.' }
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
    if (!answers.mode) { toast('Scegli se allenarti in sede o online.'); return; }
    var p = PATHS[answers.goal] || PATHS.benessere;
    $('#resTitle').innerHTML = p.title + '<br><small style="font-size:.5em;letter-spacing:.1em">' + p.sub + '</small>';
    $('#resDesc').textContent = p.desc + ' ' + (LEVEL_NOTE[answers.level] || '');
    var tags = [answers.level, answers.days + ' allenamenti / settimana', answers.mode === 'online' ? 'Coaching online' : 'In sede a Cesarò'];
    $('#resTags').innerHTML = tags.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    goStep(3);
    if (animate) gsap.from('#resTitle', { scale: 0.8, opacity: 0, duration: 1, ease: 'expo.out' });
    window.dispatchEvent(new CustomEvent('ac:burst'));
  });

  $('#resCta').addEventListener('click', function () {
    var p = PATHS[answers.goal] || PATHS.benessere;
    prefill(answers.mode === 'online' ? 'Coaching Online' : p.service,
      'Ho fatto il test sul sito: ' + p.title + ' (' + p.sub + '). Livello ' + answers.level + ', ' + answers.days + ' giorni a settimana, ' + answers.mode + '.');
  });

  $('#quizRestart').addEventListener('click', function () {
    quiz.reset(); answers = { goal: '', level: '', mode: '', days: 3 }; setRangeFill(); goStep(0);
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

  /* ---------- Map (click-to-load, GDPR friendly) ---------- */
  $('#mapLoad').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(CFG.mapsQuery || 'Cesarò') + '&z=14&output=embed';
    f.title = 'Mappa: ' + (CFG.city || 'Cesarò');
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    $('#map').innerHTML = '';
    $('#map').appendChild(f);
  });
})();
