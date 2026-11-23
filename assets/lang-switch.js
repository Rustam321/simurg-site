/* Переключатель языков SIMURG.
   Адрес каждой ссылки (эквивалент ТЕКУЩЕЙ страницы на другом языке) записан в разметке и работает без JavaScript.
   Здесь только то, чего разметка не знает:
   — к адресу дописывается якорь текущей страницы (#opportunities, #section-3 …), если такой элемент есть на странице
     (страницы всех языков устроены одинаково, id совпадают); на главной, если посреди окна сейчас блок банка (#bank),
     добавляется #bank — посетитель остаётся у финансового блока;
   — служебный режим банка ?standalone сохраняется;
   — выпадающий список языков в шапках портала и банка закрывается по Escape и по щелчку вне списка. */
(function () {
  'use strict';
  var links = document.querySelectorAll('.sx-lang a[hreflang], .lang-menu a[hreflang]');
  if (!links.length) return;
  var base = [].map.call(links, function (a) { return a.getAttribute('href'); });

  function anchor() {
    var raw = location.hash.slice(1), id = '';
    try { id = decodeURIComponent(raw); } catch (e) { id = ''; }
    if (id && document.getElementById(id)) return '#' + raw;
    var bank = document.getElementById('bank');
    if (bank) {
      var r = bank.getBoundingClientRect(), mid = window.innerHeight / 2;
      if (r.top <= mid && r.bottom >= mid) return '#bank';
    }
    return '';
  }
  function update() {
    var q = /[?&]standalone(?:[=&#]|$)/.test(location.search) ? '?standalone' : '', h = anchor();
    for (var i = 0; i < links.length; i++) links[i].setAttribute('href', base[i] + q + h);
  }
  // обновляем перед любым способом открыть ссылку: щелчок, средняя кнопка, клавиатура, наведение, касание
  ['pointerdown', 'mouseover', 'focusin', 'touchstart', 'click'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var t = e.target;
      if (t && t.closest && t.closest('.sx-lang, .lang-menu')) update();
    }, true);
  });
  window.addEventListener('hashchange', update);
  update();

  function closeMenus(except) {
    [].forEach.call(document.querySelectorAll('.lang-menu details[open]'), function (d) { if (d !== except) d.open = false; });
  }
  document.addEventListener('click', function (e) {
    var d = e.target && e.target.closest ? e.target.closest('.lang-menu details') : null;
    closeMenus(d);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var d = document.querySelector('.lang-menu details[open]');
    if (!d) return;
    d.open = false;
    var s = d.querySelector('summary');
    if (s) s.focus();
  });
})();
