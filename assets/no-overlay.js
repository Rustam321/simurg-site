/* Находит пустые элементы с фоном-картинкой (computed background-image: url(...), без дочерних элементов и текста — именно их
   Яндекс Браузер считает «картинкой») и лишает их наведения мыши, чтобы он не показывал над ними панель «поиск по картинке»
   (см. no-overlay.css). Фон в ::before/::after и блоки с содержимым панель не вызывают. Повторяется при смене ширины:
   фоны меняются медиа-запросами. */
(function () {
  'use strict';
  var URL_RE = /url\(/;
  var MIN_W = 60, MIN_H = 40;

  function scan() {
    var all = document.body ? document.body.getElementsByTagName('*') : [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.getAttribute('data-sx-pe') === '1' || el.children.length) continue;
      var tag = el.tagName;
      if (tag === 'IMG' || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'svg' || tag === 'path') continue;
      if (el.textContent && el.textContent.trim()) continue;      // с текстом (выделение, ссылки) не трогаем
      if (!URL_RE.test(window.getComputedStyle(el).backgroundImage)) continue;
      var r = el.getBoundingClientRect();
      if (r.width < MIN_W || r.height < MIN_H) continue;
      el.style.pointerEvents = 'none';
      el.setAttribute('data-sx-pe', '1');
    }
  }

  var t = 0;
  function later() { clearTimeout(t); t = setTimeout(scan, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  window.addEventListener('load', scan);
  window.addEventListener('resize', later);
})();
