/* Блок «Операционные модули SIMURG»: мягкое появление текста при прокрутке и лайтбокс диаграммы.
   Без этого скрипта блок полностью виден (reveal включается классом html.ops-js). */
(function () {
  'use strict';
  var root = document.getElementById('ops-modules');
  if (!root) return;
  var html = document.documentElement;

  /* ---- fade-up ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(root.querySelectorAll('.ops-reveal'));
  if (items.length && 'IntersectionObserver' in window && !reduce) {
    html.classList.add('ops-js');
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.top >= 0) return;   // блок, оставшийся выше экрана (быстрый скролл), тоже показываем
        e.target.style.transitionDelay = (k++ * 70) + 'ms';
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- наведение на шарик модуля: поверх схемы встаёт его увеличенная копия (×1,5, плавно), с краю схемы копия сдвигается внутрь,
     чтобы не обрезаться; только для мыши и без режима «меньше анимации» (стили — css/ops-modules.css, .de-hover) ---- */
  (function () {
    var svg = root.querySelector('.ops__zoom svg');
    var mq = window.matchMedia && window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
    if (!svg || !mq || !mq.matches) return;
    var NS = 'http://www.w3.org/2000/svg';
    var SCALE = 1.5, RING = 121;                                   // увеличение и внешний радиус шарика (кольцо 120 + обводка)
    var X0 = 94, X1 = 1218, Y0 = 6, Y1 = 1134;                    // границы схемы (viewBox 88 0 1136 1140) с запасом
    var layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'de-hover-layer');
    layer.setAttribute('aria-hidden', 'true');
    svg.appendChild(layer);

    [].slice.call(svg.querySelectorAll('.de-module')).forEach(function (mod) {
      var cx = parseFloat(mod.getAttribute('data-cx')), cy = parseFloat(mod.getAttribute('data-cy'));
      if (isNaN(cx) || isNaN(cy)) return;
      var half = RING * SCALE, dx = 0, dy = 0;
      if (cx - half < X0) dx = X0 - (cx - half); else if (cx + half > X1) dx = X1 - (cx + half);
      if (cy - half < Y0) dy = Y0 - (cy - half); else if (cy + half > Y1) dy = Y1 - (cy + half);
      var copy = mod.cloneNode(true);
      copy.setAttribute('class', 'de-hover');
      ['data-module', 'data-cx', 'data-cy', 'data-radius'].forEach(function (a) { copy.removeAttribute(a); });
      [].forEach.call(copy.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
      copy.style.setProperty('--hx', dx.toFixed(1));
      copy.style.setProperty('--hy', dy.toFixed(1));
      layer.appendChild(copy);
      mod.addEventListener('mouseenter', function () { copy.classList.add('is-on'); });
      copy.addEventListener('mouseenter', function () { copy.classList.add('is-on'); });
      copy.addEventListener('mouseleave', function () { copy.classList.remove('is-on'); });
    });
    svg.addEventListener('mouseleave', function () {
      [].forEach.call(layer.children, function (c) { c.classList.remove('is-on'); });
    });
  })();

  /* ---- лайтбокс ---- */
  var dlg = root.querySelector('.ops-lightbox');
  var openBtn = root.querySelector('.ops__zoom');         // сама схема — кнопка (role=button, клавиатура Enter/Space)
  var srcSvg = root.querySelector('.ops__zoom svg');
  var closeBtn = dlg && dlg.querySelector('.ops-lightbox__close');
  var scroller = dlg && dlg.querySelector('.ops-lightbox__scroll');
  if (!dlg || !openBtn || !closeBtn) return;
  var phone = window.matchMedia('(max-width: 600px)');

  // копия схемы для лайтбокса: id градиентов/масок переименованы (суффикс -lb), чтобы в документе не было дублей
  function fillLightbox() {
    if (!scroller || !srcSvg || scroller.querySelector('svg')) return;
    var copy = srcSvg.outerHTML
      .replace(/\bid="([^"]+)"/g, 'id="$1-lb"')
      .replace(/url\(#([^)]+)\)/g, 'url(#$1-lb)')
      .replace(/aria-labelledby="([^"]+)"/g, function (m, v) {
        return 'aria-labelledby="' + v.split(/\s+/).map(function (x) { return x + '-lb'; }).join(' ') + '"';
      });
    scroller.insertAdjacentHTML('afterbegin', copy);
    var layer = scroller.querySelector('.de-hover-layer');   // копии шариков для наведения в лайтбоксе не нужны
    if (layer) layer.remove();
  }
  function open() {
    fillLightbox();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    html.classList.add('ops-lock');
    if (scroller) {
      scroller.scrollTop = 0;
      scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
    }
    closeBtn.focus();
  }
  function close() {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    html.classList.remove('ops-lock');
    openBtn.focus();
  }
  openBtn.addEventListener('click', function () {
    var sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;                                    // человек выделяет текст схемы — не открываем
    open();
  });
  openBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  closeBtn.addEventListener('click', close);
  dlg.addEventListener('close', function () { html.classList.remove('ops-lock'); });
  dlg.addEventListener('click', function (e) {
    var t = e.target;
    if (t === closeBtn) return;
    // на телефоне касание схемы = прокрутка/масштаб, закрывает только «×» и фон диалога
    if (phone.matches && t !== dlg) return;
    var sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;                                    // выделение текста схемы не закрывает окно
    close();
  });
  document.addEventListener('keydown', function (e) {   // запасной путь, если <dialog> не поддерживается
    if (e.key === 'Escape' && dlg.hasAttribute('open') && typeof dlg.showModal !== 'function') close();
  });
})();
