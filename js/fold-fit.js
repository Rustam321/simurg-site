/* Вторая страница главной: баннер «ТОРГОВАЯ СИСТЕМА SIMURG» + «Единая цифровая среда» = высота окна пользователя.
   Баннер остаётся прежней высоты, блок получает остаток окна, текст набран обычным размером (как на остальных страницах).
   Чтобы всё поместилось, подбираем ширину схемы (--fig-r — доля ширины содержимого) и, если нужно, чуть меньший текст (--ops-s):
   берём первый по порядку вариант, при котором блок не выше остатка окна. Не помещается ни один — остаётся самый тесный (страница чуть выше окна).
   Условия те же, что в css/ops-modules.css (ширина от 1200px, высота от 640px, пропорция от 3:2); в остальных окнах значения не задаются. */
(function () {
  'use strict';
  var fold = document.getElementById('fold');
  var ops = document.getElementById('ops-modules');
  var banner = fold && fold.querySelector('.top-banner');
  var body = ops && ops.querySelector('.ops__body');
  if (!fold || !ops || !banner || !body) return;

  var wide = window.matchMedia('(min-width: 1200px) and (min-height: 640px) and (min-aspect-ratio: 3/2)');
  // Порядок перебора (от самого желательного): схема крупнее всего (доля ширины содержимого, до 52% — выше окна она всё равно не вырастет)
  // при тексте 1 → 0,94 → 0,88 (17 → ~15 px на экране 1440, как у обычного текста других страниц); если не помещается — текст ещё чуть мельче
  // (0,82, но не меньше 14px); если и так нет — схема поменьше (до 38% и ниже).
  var BIG = [0.52, 0.50, 0.48, 0.46, 0.44, 0.42, 0.40];
  var SMALL = [0.38, 0.36, 0.34];
  var STEPS = [];
  BIG.forEach(function (r) { [1, 0.94, 0.88].forEach(function (s) { STEPS.push([r, s]); }); });
  BIG.forEach(function (r) { STEPS.push([r, 0.82]); });
  SMALL.forEach(function (r) { [1, 0.94, 0.88, 0.82].forEach(function (s) { STEPS.push([r, s]); }); });
  var timer = 0;

  function apply(step) {
    ops.style.setProperty('--fig-r', step[0]);
    ops.style.setProperty('--ops-s', step[1]);
  }

  function fit() {
    if (!wide.matches) {
      ops.style.removeProperty('--fig-r');
      ops.style.removeProperty('--ops-s');
      return;
    }
    var cs = getComputedStyle(ops);
    var pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var avail = window.innerHeight - banner.offsetHeight;   // остаток окна под блок
    var chosen = STEPS[STEPS.length - 1];
    for (var i = 0; i < STEPS.length; i++) {
      apply(STEPS[i]);
      if (body.offsetHeight + pad <= avail) { chosen = STEPS[i]; break; }
    }
    apply(chosen);
  }

  function later() {                       // дебаунс: подгоняем, когда размер окна перестал меняться
    window.clearTimeout(timer);
    timer = window.setTimeout(fit, 120);
  }

  fit();
  window.addEventListener('resize', later);
  window.addEventListener('orientationchange', later);
  window.addEventListener('load', fit);
  if (wide.addEventListener) wide.addEventListener('change', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
