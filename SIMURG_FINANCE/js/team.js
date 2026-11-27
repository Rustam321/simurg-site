/* «Команда SIMURG»: наклон фото вслед за курсором, блик и сдвиг портрета. Только мышь/тачпад и без reduced-motion; без этого скрипта остаётся CSS-эффект наведения (css/leadership.css). */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const vars = ['--rx', '--ry', '--px', '--py', '--gx', '--gy'];
  document.querySelectorAll('.simurg-leadership__card').forEach(card => {
    const photo = card.querySelector('.simurg-leadership__photo');
    let frame = 0, last = null;
    const apply = () => {
      frame = 0;
      const r = photo.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (last.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (last.clientY - r.top) / r.height));
      const set = (name, value) => card.style.setProperty(name, value);
      set('--ry', ((x - .5) * 12).toFixed(2) + 'deg');
      set('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
      set('--px', ((.5 - x) * 4).toFixed(2) + '%');
      set('--py', ((.5 - y) * 4).toFixed(2) + '%');
      set('--gx', (x * 100).toFixed(1) + '%');
      set('--gy', (y * 100).toFixed(1) + '%');
    };
    card.addEventListener('pointermove', event => { last = event; if (!frame) frame = requestAnimationFrame(apply); });
    card.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; vars.forEach(name => card.style.removeProperty(name)); });
  });
})();
