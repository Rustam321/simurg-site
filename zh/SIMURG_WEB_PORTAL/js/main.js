document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const dialog = document.querySelector('.service-dialog');
let lastTrigger = null;
toggle.hidden = false;
function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', '打开菜单');
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
window.matchMedia('(min-width: 1061px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const titles = {
  voice: '开始语音对话', message: '发送消息',
  investment: '引进投资', intelligence: '贸易情报',
  deals: '交易管理', cooperation: '国际合作',
  privacy: '隐私政策', terms: '使用条款', linkedin: 'LinkedIn', telegram: 'Telegram', youtube: 'YouTube'
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
    ? '该服务暂未开放。请通过电子邮件联系 SIMURG 团队。'
    : '该链接暂未开放。您可以向 SIMURG 团队咨询相关信息。';
  document.querySelector('.dialog-contact').href = `mailto:start@simurg-global.com?subject=${encodeURIComponent('SIMURG — '+titles[action])}`;
  dialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => lastTrigger?.focus());
