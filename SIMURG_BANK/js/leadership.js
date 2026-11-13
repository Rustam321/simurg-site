(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(any-hover: hover)");

  document.querySelectorAll(".simurg-leadership").forEach(gallery => {
    const row = gallery.querySelector(".simurg-leadership__row");
    const cards = Array.from(row.querySelectorAll(".simurg-leadership__card"), card => ({
      card,
      trigger: card.querySelector(".simurg-leadership__trigger"),
      details: card.querySelector(".simurg-leadership__details")
    }));
    let active = cards.find(item => item.card.classList.contains("is-active"));
    let revealTimer;

    function reveal(item) {
      clearTimeout(revealTimer);
      const show = () => {
        const rowBox = row.getBoundingClientRect();
        const cardBox = item.card.getBoundingClientRect();
        const gap = 3;
        if (cardBox.left < rowBox.left + gap || cardBox.right > rowBox.right - gap) {
          row.scrollLeft += cardBox.left - rowBox.left - gap;
        }
      };
      if (reducedMotion.matches) show();
      else revealTimer = setTimeout(show, 420);
    }

    function activate(item, scroll) {
      clearTimeout(revealTimer);
      if (active !== item) {
        active = item;
        cards.forEach(({ card, trigger, details }) => {
          const selected = card === item.card;
          card.classList.toggle("is-active", selected);
          trigger.setAttribute("aria-expanded", String(selected));
          details.inert = !selected;
        });
      }
      if (scroll && row.scrollWidth > row.clientWidth) reveal(item);
    }

    cards.forEach((item, index) => {
      item.trigger.addEventListener("click", () => activate(item, true));
      item.trigger.addEventListener("focus", () => activate(item, true));

      item.trigger.addEventListener("pointermove", event => {
        if (!canHover.matches || event.pointerType !== "mouse" ||
            row.scrollWidth > row.clientWidth || active?.details.contains(document.activeElement)) return;
        activate(item, false);
      });

      item.trigger.addEventListener("keydown", event => {
        const destinations = {
          ArrowRight: (index + 1) % cards.length,
          ArrowLeft: (index - 1 + cards.length) % cards.length,
          Home: 0,
          End: cards.length - 1
        };
        if (!Object.hasOwn(destinations, event.key)) return;
        event.preventDefault();
        cards[destinations[event.key]].trigger.focus({ preventScroll: true });
      });
    });
  });
})();

