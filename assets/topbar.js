(function () {
  var bar = document.querySelector('.sx-topbar');
  if (!bar) return;
  var btn = bar.querySelector('.sx-burger');
  if (!btn) return;
  function set(open) {
    bar.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bar.classList.contains('is-open')) { set(false); btn.focus(); }
  });
  var mq = window.matchMedia('(min-width:1100px)');
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function (e) { if (e.matches) set(false); });
})();
