document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const dialog = document.querySelector('.service-dialog');
let lastTrigger = null;
toggle.hidden = false;
function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
window.matchMedia('(min-width: 1061px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const titles = {
  voice: 'Start a voice chat', message: 'Write a message',
  investment: 'Attracting investment', intelligence: 'Trade intelligence',
  deals: 'Transaction management', cooperation: 'International cooperation',
  privacy: 'Privacy Policy', terms: 'Terms of Use', linkedin: 'LinkedIn', telegram: 'Telegram', youtube: 'YouTube'
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
    ? 'This service is currently unavailable. Please contact the SIMURG team by email.'
    : 'This link is currently unavailable. You can request information from the SIMURG team.';
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
