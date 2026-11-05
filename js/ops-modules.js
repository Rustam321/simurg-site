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
