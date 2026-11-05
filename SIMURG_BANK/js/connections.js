/* Линии-связки блока «Экосистема глобальных возможностей»: считаются по реальным размерам карточек и медальона, поэтому на любой
   ширине начинаются точно на краю карточки и заканчиваются на кольце медальона (раньше это был растянутый svg с фиксированными
   координатами, а точки на кольце были «запечены» в картинку медальона — при другом масштабе получались двойные точки). */
(function () {
  'use strict';
  var grid = document.querySelector('.ecosystem-grid');
  var svg = grid && grid.querySelector('.ecosystem-connections');
  var core = grid && grid.querySelector('.bank-core img');
  if (!svg || !core) return;

  var NS = 'http://www.w3.org/2000/svg';
  var ANGLE = 17.5 * Math.PI / 180;   // под каким углом линия подходит к кольцу
  var RING = 0.985;                   // радиус кольца в долях половины ширины картинки
  var LEVEL = 0.44;                   // доля высоты карточки: где на её краю стоит точка

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
    var R = c.width / 2, cx = c.left + R - s.left, cy = c.top + c.height / 2 - s.top, r = R * RING, k = R / 135;
    var lines = el('g', { fill: 'none', stroke: '#8a9fa8', 'stroke-width': '1.1' });
    var dots = el('g', { fill: '#4d89b5', stroke: '#eef7fc', 'stroke-width': '1.2' });

    ['tl', 'bl', 'tr', 'br'].forEach(function (key) {
      var b = cards[key].getBoundingClientRect();
      var left = key.charAt(1) === 'l', top = key.charAt(0) === 't';
      var sx = (left ? b.right : b.left) - s.left, sy = b.top + b.height * LEVEL - s.top;
      var ex = cx + (left ? -1 : 1) * r * Math.cos(ANGLE), ey = cy + (top ? -1 : 1) * r * Math.sin(ANGLE);
      var run = Math.min(33 * k, Math.max(0, Math.abs(ex - sx) - 8 * k)) * (left ? 1 : -1);
      var d = 'M' + num(sx) + ' ' + num(sy) + (run ? 'H' + num(sx + run) : '') + 'L' + num(ex) + ' ' + num(ey);
      lines.appendChild(el('path', { d: d }));
      dots.appendChild(el('circle', { cx: num(sx), cy: num(sy), r: 4.5 }));
      dots.appendChild(el('circle', { cx: num(ex), cy: num(ey), r: 4 }));
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
