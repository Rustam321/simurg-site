document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const backdrop = document.getElementById('navBackdrop');
  const toTop = document.getElementById('toTop');

  // Side menu (left drawer)
  if (burger && nav && backdrop) {
    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.classList.toggle('is-active', open);
      backdrop.classList.toggle('is-visible', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };

    burger.addEventListener('click', () => {
      setMenu(!nav.classList.contains('is-open'));
    });

    backdrop.addEventListener('click', () => setMenu(false));

    nav.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  // Back to top
  if (toTop) {
    const onScroll = () => {
      toTop.classList.toggle('is-visible', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Reveal animations on scroll (staggered by position among siblings)
  const revealTargets = document.querySelectorAll(
    '.hero__left > *, .feature-card, .module-row, .cycle__role, .cycle__step, .about-row, .biz-card, .cat, .tcard, .bank__head, .bank-card, .bank-core, .bank-feat, .bank__tagline, .portal__left > *, .portal__countries-title, .country-card, .cabinet__head > *, .cab-card, .cabinet__banner'
  );
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const group = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
            const delay = reduceMotion ? 0 : Math.max(0, group.indexOf(el)) * 90;
            setTimeout(() => el.classList.add('is-visible'), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
});
