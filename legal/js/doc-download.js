/* «Форма договора»: клик по плашке скачивает документ из legal/docs/ — forma-dogovora.pdf, а если такого нет, то .docx или .doc.
   Файл приложат позже: пока его нет, вместо страницы с ошибкой 404 показывается короткое сообщение; когда файл появится в папке
   (и сайт будет опубликован заново), код менять не нужно. Порядок и список расширений — в data-exts ссылки, имя скачанного файла — в data-name. */
(function () {
  'use strict';
  var links = document.querySelectorAll('a[data-doc]');
  if (!links.length || !window.fetch) return;
  var toast = null, timer = 0;

  function say(text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'doc-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    window.clearTimeout(timer);
    toast.classList.remove('is-on');
    void toast.offsetWidth;                       // чтобы анимация сработала и при повторном показе
    toast.classList.add('is-on');
    timer = window.setTimeout(function () { toast.classList.remove('is-on'); }, 5000);
  }

  function exists(url) {
    return fetch(url, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      var type = r.headers.get('content-type') || '';
      return r.ok && type.indexOf('text/html') === -1;   // сервер, отдающий главную страницу вместо 404, файлом не считается
    });
  }

  function find(base, exts, i) {
    if (i >= exts.length) return Promise.resolve(null);
    var url = base + '.' + exts[i];
    return exists(url).then(function (ok) { return ok ? url : find(base, exts, i + 1); });
  }

  function save(url, name) {
    var a = document.createElement('a');
    a.href = url;
    a.download = name + url.slice(url.lastIndexOf('.'));
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  [].forEach.call(links, function (link) {
    link.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;   // новая вкладка и т. п. — как у обычной ссылки
      var base = link.getAttribute('data-doc');
      var exts = (link.getAttribute('data-exts') || 'pdf').split(',');
      var name = link.getAttribute('data-name') || 'Документ';
      e.preventDefault();
      find(base, exts, 0).then(function (url) {
        if (url) save(url, name);
        else say('Форма договора будет доступна для скачивания позже.');
      }).catch(function () {
        window.location.href = link.href;         // нет сети или файл открыт с диска (file://) — обычное поведение ссылки
      });
    });
  });
})();
