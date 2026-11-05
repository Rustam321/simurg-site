/* Главный видеоблок SIMURG: 6 роликов подряд, поверх — отдельный HTML-слой с текстом.
   Два <video> по очереди: пока играет один, второй уже загружает следующий ролик.
   Текст не пересекается между сценами: исчезает до кроссфейда, появляется после начала ролика. */
(function () {
  'use strict';
  var stage = document.getElementById('heroStage');
  var cfg = window.SIMURG_HERO;
  if (!stage || !cfg) return;

  var T = cfg.timing, scenes = cfg.scenes;
  var lang = (document.documentElement.lang || 'ru').slice(0, 2);
  var dict = (cfg.i18n[lang] && Object.keys(cfg.i18n[lang]).length) ? cfg.i18n[lang] : cfg.i18n.ru;
  var vids = Array.prototype.slice.call(stage.querySelectorAll('.hero-stage__video'));
  var title = stage.querySelector('.hero-stage__title');
  var plate = stage.querySelector('.hero-stage__plate');
  function lit(on) { if (plate) plate.classList.toggle('is-lit', on); }
  var mqSmall = window.matchMedia('(max-width: 860px)');
  var mqTwoLines = window.matchMedia('(min-width: 768px)');   // мониторы и большие планшеты: текст ровно в 2 строки (см. .hero-stage__title в css)
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cur = 0, front = 0, running = false, swapping = false, textOn = false, raf = 0, stuck = false;

  function nextOf(i) { return (i + 1) % scenes.length; }
  function srcOf(s) { return mqSmall.matches ? s.src.sd : s.src.hd; }

  function load(v, i) {
    var s = scenes[i], url = srcOf(s);
    if (v.getAttribute('data-src') === url) return;
    v.setAttribute('data-src', url);
    v.setAttribute('data-scene', String(i));
    v.style.setProperty('--focus', s.focus || '50% 50%');
    v.poster = s.poster;
    v.src = url;
    v.load();
  }

  // Текст сцены: на узких экранах (<768px) — необязательный вариант «.title.s» (первая сцена в 3 строки), иначе основной «.title» (≤2 строк)
  function textOf(id) { return (!mqTwoLines.matches && dict[id + '.title.s']) || dict[id + '.title'] || ''; }

  function render(txt) {
    title.textContent = '';
    txt.split('\n').forEach(function (line, k, a) {
      title.appendChild(document.createTextNode(line));
      if (k < a.length - 1) title.appendChild(document.createElement('br'));
    });
  }

  // Один размер шрифта на все сцены (строгий вид): берём наименьший, при котором
  // самая длинная строка любой сцены помещается в блок текста. Пересчёт — при смене ширины.
  function applyCommonSize() {
    var hadReset = title.classList.contains('is-reset');
    title.classList.add('is-reset');   // только отключить переходы (класс is-in не трогаем — иначе текст мигает при resize)
    stage.style.removeProperty('--hs-fs');
    title.style.fontSize = '';
    var min = parseFloat(getComputedStyle(title).fontSize);
    scenes.forEach(function (s) {
      render(textOf(s.id));
      var fs = parseFloat(getComputedStyle(title).fontSize), guard = 80;
      title.style.fontSize = '';
      while (title.scrollWidth > title.clientWidth + 1 && fs > 12 && guard-- > 0) {
        fs -= 0.5;
        title.style.fontSize = fs + 'px';
      }
      if (fs < min) min = fs;
    });
    title.style.fontSize = '';
    stage.style.setProperty('--hs-fs', min + 'px');
    render(textOf(scenes[cur].id));   // вернуть текст текущей сцены (при пересечении 768px — в нужной раскладке)
    if (!hadReset) title.classList.remove('is-reset');
  }

  function setTitle(i) {
    title.className = 'hero-stage__title is-reset';
    render(textOf(scenes[i].id));
    void title.offsetWidth;            // применить «сброс» без анимации
    title.className = 'hero-stage__title';
    textOn = false;
    lit(false);
  }

  function play(v) {
    var p = v.play();
    if (p && p.catch) {
      p.catch(function () { stuck = true; showStatic(); });
    }
  }

  function showStatic() {          // автозапуск запрещён: постер + текст без движения
    running = false;
    title.className = 'hero-stage__title is-reset is-in';
    lit(true);
    var kick = function () {
      document.removeEventListener('pointerdown', kick);
      document.removeEventListener('touchstart', kick);
      document.removeEventListener('keydown', kick);
      if (!stuck) return;
      stuck = false;
      setTitle(cur);
      resume();
    };
    document.addEventListener('pointerdown', kick, { once: true });
    document.addEventListener('touchstart', kick, { once: true, passive: true });
    document.addEventListener('keydown', kick, { once: true });
  }

  function tick() {
    raf = 0;
    if (!running) return;
    var v = vids[front];
    var D = v.duration || 8, t = v.currentTime;
    if (t >= T.textIn && t < D - T.textOutBefore) {
      if (!textOn) { textOn = true; title.classList.remove('is-out'); title.classList.add('is-in'); lit(true); }
    } else if (textOn && t >= D - T.textOutBefore) {
      textOn = false; title.classList.remove('is-in'); title.classList.add('is-out'); lit(false);
    }
    if (!swapping && (t >= D - T.crossfade || v.ended)) beginSwap();
    raf = requestAnimationFrame(tick);
  }

  function waitReady(v, cb) {
    if (v.readyState >= 3) { cb(); return; }
    var done = function () { v.removeEventListener('canplay', done); cb(); };
    v.addEventListener('canplay', done);
  }

  function beginSwap() {
    swapping = true;
    var nxt = nextOf(cur), old = vids[front], inc = vids[1 - front];
    load(inc, nxt);
    waitReady(inc, function () {
      try { inc.currentTime = 0; } catch (e) {}
      play(inc);
      inc.style.zIndex = '2';
      inc.classList.add('is-front');               // кроссфейд: новый ролик проявляется поверх старого
      setTimeout(function () {
        old.classList.remove('is-front');
        old.style.zIndex = '';
        inc.style.zIndex = '';
        try { old.pause(); } catch (e) {}
        front = 1 - front;
        cur = nxt;
        swapping = false;
        setTitle(cur);
        load(old, nextOf(cur));                    // заранее грузим следующий ролик в освободившийся <video>
      }, T.crossfade * 1000 + 40);
    });
  }

  function resume() {
    if (running || reduced || stuck) return;
    running = true;
    var v = vids[front];
    play(v);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function suspend() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    vids.forEach(function (v) { try { v.pause(); } catch (e) {} });
  }

  // ---- запуск ----
  load(vids[0], 0);
  load(vids[1], 1);
  setTitle(0);
  applyCommonSize();
  var rz = 0;   // пересчёт кегля при смене ширины/масштаба и после загрузки шрифтов — в том числе при prefers-reduced-motion
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(applyCommonSize, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyCommonSize);
  if (reduced) { title.className = 'hero-stage__title is-reset is-in'; lit(true); return; }

  var visible = true, tabVisible = !document.hidden;
  function sync() { if (visible && tabVisible) resume(); else suspend(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(stage);
  }
  document.addEventListener('visibilitychange', function () { tabVisible = !document.hidden; sync(); });
  sync();
})();
