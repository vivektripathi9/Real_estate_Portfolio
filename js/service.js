(() => {
  const compare = document.querySelector("[data-compare]");
  if (compare) {
    const beforeWrap = compare.querySelector(".svc-compare__before-wrap");
    const handle = compare.querySelector(".svc-compare__handle");
    const range = compare.querySelector(".svc-compare__range");
    const beforeImg = compare.querySelector(".svc-compare__before");

    if (beforeWrap && handle && range) {
      const setCompare = (value) => {
        const pct = Math.max(0, Math.min(100, Number(value)));
        const frame = compare.querySelector(".svc-compare__frame");
        const frameWidth = frame?.clientWidth || 1;
        beforeWrap.style.width = `${pct}%`;
        handle.style.left = `${pct}%`;
        if (beforeImg) beforeImg.style.width = `${frameWidth}px`;
      };

      setCompare(range.value);
      range.addEventListener("input", () => setCompare(range.value));
      window.addEventListener("resize", () => setCompare(range.value));
    }
  }

  const cards = [...document.querySelectorAll("[data-flip-card]")];
  if (!cards.length) return;

  const setFlipped = (card, flipped) => {
    card.classList.toggle("is-flipped", flipped);
    card.setAttribute("aria-expanded", flipped ? "true" : "false");
  };

  cards.forEach((card) => {
    const title = card.querySelector(".svc-core__face--front h3");
    const label = title ? title.textContent.trim() : "service details";

    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-label", `${label}. Activate to show more details.`);

    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;

      const willFlip = !card.classList.contains("is-flipped");
      cards.forEach((other) => {
        if (other !== card) setFlipped(other, false);
      });
      setFlipped(card, willFlip);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("a")) return;
      event.preventDefault();
      card.click();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    cards.forEach((card) => setFlipped(card, false));
  });
})();
