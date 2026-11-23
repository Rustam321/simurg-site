document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const dialog = document.querySelector('.service-dialog');
let lastTrigger = null;
toggle.hidden = false;
function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'فتح القائمة');
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
window.matchMedia('(min-width: 1061px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const titles = {
  voice: 'ابدأ حوارًا صوتيًا', message: 'اكتب رسالة',
  investment: 'جذب الاستثمارات', intelligence: 'المعلومات التجارية',
  deals: 'إدارة المعاملات', cooperation: 'التعاون الدولي',
  privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', linkedin: 'LinkedIn', telegram: 'Telegram', youtube: 'YouTube'
};
function goToConfiguredUrl(value) {
  if (!value) return false;
  try {
    const target = new URL(value, location.href);
    if (!['http:', 'https:', 'mailto:'].includes(target.protocol)) return false;
    location.assign(target.href);
    return true;
  } catch {
    return false;
  }
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action], [data-link]');
  if (!button) return;
  const action = button.dataset.action || button.dataset.link;
  const group = button.dataset.action ? 'actions' : 'links';
  const integration = new CustomEvent('simurg:action', { detail: { action, group, trigger: button }, cancelable: true });
  if (!document.dispatchEvent(integration)) return;
  if (goToConfiguredUrl(window.SIMURG_CONFIG?.[group]?.[action])) return;
  lastTrigger = button;
  document.querySelector('#dialog-title').textContent = titles[action];
  document.querySelector('#dialog-description').textContent = group === 'actions'
    ? 'هذه الخدمة غير متاحة حاليًا. يُرجى التواصل مع فريق SIMURG عبر البريد الإلكتروني.'
    : 'هذا الرابط غير متاح حاليًا. يمكنك طلب المعلومات من فريق SIMURG.';
  document.querySelector('.dialog-contact').href = `mailto:info@simurg.global?subject=${encodeURIComponent('SIMURG — '+titles[action])}`;
  dialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => lastTrigger?.focus());
