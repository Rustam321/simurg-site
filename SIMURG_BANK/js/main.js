document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
toggle.hidden = false;
function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Открыть меню');
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
window.matchMedia('(min-width: 1041px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
let lastTrigger;
let pendingFocus;
const searchDialog = document.querySelector('.search-dialog');
const accountDialog = document.querySelector('.account-dialog');
function openDialog(dialog, trigger) { lastTrigger = trigger; dialog.showModal(); }
document.querySelector('.search-button').addEventListener('click', event => {
  openDialog(searchDialog, event.currentTarget);
  document.querySelector('#site-search').focus();
});
document.querySelector('.account-button').addEventListener('click', event => {
  const address = window.SIMURG_BANK_CONFIG?.accountUrl;
  if (address) {
    try {
      const url = new URL(address, location.href);
      if (['https:', 'http:'].includes(url.protocol)) { location.assign(url.href); return; }
    } catch { /* Keep the fallback dialog available for an invalid setting. */ }
  }
  openDialog(accountDialog, event.currentTarget);
});
document.querySelectorAll('.modal').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    (pendingFocus || lastTrigger)?.focus({ preventScroll: true });
    pendingFocus = null;
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
});
const searchEntries = [
  ['about', 'О компании — финансовая инфраструктура'],
  ['trade', 'Международная торговля — единая цифровая среда'],
  ['leaders', 'Руководители — контакты'],
  ['payments', 'Расчеты'], ['financing', 'Финансирование'],
  ['risks', 'Управление рисками'], ['capital', 'Капитал']
].map(([id, title]) => ({ id, title, text: document.getElementById(id).textContent.toLocaleLowerCase('ru') + ' ' + title.toLocaleLowerCase('ru') }));
const results = document.querySelector('.search-results');
document.querySelector('.search-form').addEventListener('submit', event => {
  event.preventDefault();
  const query = document.querySelector('#site-search').value.trim().toLocaleLowerCase('ru');
  results.replaceChildren();
  const matches = query ? searchEntries.filter(entry => entry.text.includes(query)) : [];
  document.querySelector('.search-status').textContent = !query ? 'Введите слово или фразу.' : matches.length ? `Найдено разделов: ${matches.length}` : 'На этой странице совпадений нет.';
  matches.forEach(entry => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + entry.id; link.textContent = entry.title;
    link.addEventListener('click', () => {
      const destination = document.getElementById(entry.id);
      destination.setAttribute('tabindex', '-1');
      pendingFocus = destination;
      searchDialog.close();
    });
    li.append(link); results.append(li);
  });
});
