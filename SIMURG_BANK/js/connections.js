/* Линии-связки блока «Экосистема глобальных возможностей»: плавные кривые Безье от края карточки до точки на кольце медальона.
   Считаются по реальным размерам карточек и медальона, поэтому на любой ширине начинаются точно на краю карточки и приходят точно в точку,
   нарисованную на кольце картинки (раньше это был растянутый svg с фиксированными координатами — при другом масштабе получались сдвиги:
   Manrope шире прежнего шрифта, карточки выходят выше, и растянутые линии разъезжались с точками картинки). */
(function () {
  'use strict';
  var grid = document.querySelector('.ecosystem-grid');
  var svg = grid && grid.querySelector('.ecosystem-connections');
  var core = grid && grid.querySelector('.bank-core img');
  if (!svg || !core) return;

  var NS = 'http://www.w3.org/2000/svg';
  // точки на кольце картинки медальона (1254×1254, bank-ecosystem.webp): доли ширины и высоты картинки
  var DOT = { tl: [0.0313, 0.3319], bl: [0.0280, 0.6240], tr: [0.9653, 0.3325], br: [0.9709, 0.6246] };
  var LEVEL = 0.44;    // доля высоты карточки: где на её краю стоит точка
  var HANDLE = 0.5;    // «ручки» кривой — доля горизонтального расстояния (как в исходной вёрстке: S-образный изгиб с горизонтальными концами)

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function num(v) { return v.toFixed(1); }

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var cards = {
      tl: grid.querySelector('.payments'), bl: grid.querySelector('.financing'),
      tr: grid.querySelector('.risks'), br: grid.querySelector('.capital')
    };
    if (!cards.tl || !cards.bl || !cards.tr || !cards.br) return;
    var s = svg.getBoundingClientRect(), c = core.getBoundingClientRect();
    var tl = cards.tl.getBoundingClientRect(), tr = cards.tr.getBoundingClientRect();
    if (!(s.width > 0 && tl.right <= c.left + 1 && tr.left >= c.right - 1)) return;   // карточки не по бокам медальона (узкий экран)

    svg.setAttribute('viewBox', '0 0 ' + s.width + ' ' + s.height);
    svg.setAttribute('preserveAspectRatio', 'none');
    var lines = el('g', { fill: 'none', stroke: '#8a9fa8', 'stroke-width': '1.1', 'stroke-linecap': 'round' });
    var dots = el('g', { fill: '#4d89b5', stroke: '#eef7fc', 'stroke-width': '1.2' });

    ['tl', 'bl', 'tr', 'br'].forEach(function (key) {
      var b = cards[key].getBoundingClientRect();
      var left = key.charAt(1) === 'l';
      var sx = (left ? b.right : b.left) - s.left, sy = b.top + b.height * LEVEL - s.top;
      var ex = c.left + c.width * DOT[key][0] - s.left, ey = c.top + c.height * DOT[key][1] - s.top;
      var h = (ex - sx) * HANDLE;
      lines.appendChild(el('path', { d: 'M' + num(sx) + ' ' + num(sy) + 'C' + num(sx + h) + ' ' + num(sy) + ' ' + num(ex - h) + ' ' + num(ey) + ' ' + num(ex) + ' ' + num(ey) }));
      dots.appendChild(el('circle', { cx: num(sx), cy: num(sy), r: 4.5 }));   // точка у карточки; точки на кольце уже нарисованы в картинке
    });
    svg.appendChild(lines);
    svg.appendChild(dots);
  }

  draw();
  window.addEventListener('resize', draw);
  window.addEventListener('load', draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(grid);
  if (!core.complete) core.addEventListener('load', draw);
})();
