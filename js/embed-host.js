/* Главная: подгоняет высоту встроенных страниц (iframe.embed__frame) под их содержимое
   и дотягивает прокрутку до якоря из адреса (#legal и т.п.), пока рамки дозагружаются. */
(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll('iframe.embed__frame'));
  if (!frames.length) return;
  var reported = new Set();
  var target = null, userMoved = false, until = 0;

  function align() {
    if (!target || userMoved || Date.now() > until) return;
    var top = target.getBoundingClientRect().top;
    if (Math.abs(top) > 2) window.scrollBy({ top: top, left: 0, behavior: 'auto' });
  }
  function startHash() {
    if (!location.hash || location.hash.length < 2) return;
    target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    until = Date.now() + 4000;
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
      window.addEventListener(ev, function () { userMoved = true; }, { passive: true, once: true });
    });
    align();
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.type !== 'sx-height' || !isFinite(d.h)) return;
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        frames[i].style.height = d.h + 'px';
        reported.add(i);
        align();
        return;
      }
    }
  });
  if (document.readyState === 'complete') startHash(); else window.addEventListener('load', startHash);
})();
