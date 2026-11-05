/* Линии-связки схемы «Проектное финансирование»: считаются по реальным размерам карточек и круга,
   поэтому на любой ширине начинаются точно на краю карточки и заканчиваются на внешнем кольце круга
   (раньше это был растянутый svg с фиксированными координатами — линии уходили под круг и в карточки). */
(function () {
  'use strict';
  var diagram = document.querySelector('.architecture-diagram');
  var svg = diagram && diagram.querySelector('.connections');
  var circle = diagram && diagram.querySelector('.funding-center');
  if (!svg || !circle) return;

  var NS = 'http://www.w3.org/2000/svg';
  var RING = 9;            // px: внешний край бледно-голубого кольца вокруг круга (box-shadow 9px)
  var ANGLE = 36 * Math.PI / 180;   // под каким углом линия подходит к кругу
  var SHIFT = 0.3;         // доля высоты карточки: где на её краю стоит точка

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var cards = {
      tl: diagram.querySelector('.finance-card'), bl: diagram.querySelector('.logistics-card'),
      tr: diagram.querySelector('.trade-card'), br: diagram.querySelector('.risks-card')
    };
    var d = diagram.getBoundingClientRect(), c = circle.getBoundingClientRect();
    var tl = cards.tl.getBoundingClientRect(), tr = cards.tr.getBoundingClientRect();
    // схема «карточки по бокам круга» — только когда левая колонка слева от круга, правая справа
    if (!(tl.right <= c.left + 1 && tr.left >= c.right - 1)) return;

    svg.setAttribute('viewBox', '0 0 ' + d.width + ' ' + d.height);
    svg.setAttribute('preserveAspectRatio', 'none');
    var cx = c.left + c.width / 2 - d.left, cy = c.top + c.height / 2 - d.top, r = c.width / 2 + RING;
    var lines = el('g', { fill: 'none', stroke: '#2b6790', 'stroke-width': '1' });
    var dots = el('g', { fill: '#347599', stroke: '#c5e3f4', 'stroke-width': '1.4' });

    ['tl', 'bl', 'tr', 'br'].forEach(function (k) {
      var b = cards[k].getBoundingClientRect();
      var left = k.charAt(1) === 'l', top = k.charAt(0) === 't';
      var sx = (left ? b.right : b.left) - d.left;
      var sy = (top ? b.top + b.height * SHIFT : b.bottom - b.height * SHIFT) - d.top;
      var ex = cx + (left ? -1 : 1) * r * Math.cos(ANGLE);
      var ey = cy + (top ? -1 : 1) * r * Math.sin(ANGLE);
      lines.appendChild(el('path', { d: 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + ey.toFixed(1) }));
      dots.appendChild(el('circle', { cx: sx.toFixed(1), cy: sy.toFixed(1), r: 4 }));
      dots.appendChild(el('circle', { cx: ex.toFixed(1), cy: ey.toFixed(1), r: 3 }));
    });
    svg.appendChild(lines);
    svg.appendChild(dots);
  }

  draw();
  window.addEventListener('resize', draw);
  window.addEventListener('load', draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(diagram);
})();
