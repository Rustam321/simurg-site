/* Дочерняя страница, встроенная в длинную главную: сообщает родителю свою высоту.
   Через postMessage — работает и по file://, где доступ к contentDocument закрыт. */
(function () {
  if (window.self === window.top) return;
  var last = 0;
  function retarget() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href');
      if (h && h.charAt(0) !== '#' && !/^(javascript|mailto|tel):/i.test(h) && !links[i].target) links[i].target = '_top';
    }
  }
  retarget();
  function measure() {
    var de = document.documentElement;
    var h = Math.ceil(de.getBoundingClientRect().height);
    if (document.body) h = Math.max(h, Math.ceil(document.body.scrollHeight));
    return h;
  }
  function send() {
    var h = measure();
    if (h && h !== last) { last = h; window.parent.postMessage({ type: 'sx-height', h: h, src: location.pathname }, '*'); }
  }
  window.addEventListener('load', function () { send(); setTimeout(send, 400); setTimeout(send, 1500); });
  window.addEventListener('resize', send);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(send);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(send);
  send();
})();
