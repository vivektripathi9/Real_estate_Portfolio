(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const siteMenu = document.querySelector(".site-menu");
  const menuLinks = siteMenu?.querySelectorAll("a") ?? [];
  const slides = [...document.querySelectorAll("[data-hero-slide]")];
  const animateSections = [
    ...document.querySelectorAll("[data-animate-section]"),
  ];

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Hero entrance ---------- */
  const revealHero = () => {
    document.body.classList.add("is-ready");
  };

  if (prefersReducedMotion) {
    revealHero();
  } else if (document.readyState === "complete") {
    window.requestAnimationFrame(revealHero);
  } else {
    window.addEventListener("load", () => {
      window.requestAnimationFrame(revealHero);
    });
  }

  /* ---------- Menu ---------- */
  if (menuToggle && siteMenu) {
    const setMenuState = (isOpen) => {
      menuToggle.classList.toggle("is-open", isOpen);
      siteMenu.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );
      siteMenu.setAttribute("aria-hidden", String(!isOpen));
    };

    menuToggle.addEventListener("click", () => {
      const willOpen = !siteMenu.classList.contains("is-open");
      setMenuState(willOpen);
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
        setMenuState(false);
      }
    });
  }

  /* ---------- Hero image crossfade ---------- */
  if (slides.length >= 2 && !prefersReducedMotion) {
    const INTERVAL = 6500;
    const FADE_MS = 1800;
    const heroSection = document.querySelector("#hero");
    let index = 0;
    let timerId = null;
    let fading = false;

    const goTo = (nextIndex) => {
      if (fading || nextIndex === index) return;

      fading = true;
      const current = slides[index];
      const next = slides[nextIndex];

      current.classList.remove("is-active");
      current.classList.add("is-exiting");
      next.classList.add("is-active");

      window.setTimeout(() => {
        current.classList.remove("is-exiting");
        fading = false;
      }, FADE_MS);

      index = nextIndex;
    };

    const nextSlide = () => {
      goTo((index + 1) % slides.length);
    };

    const startSlideshow = () => {
      if (timerId) return;
      timerId = window.setInterval(nextSlide, INTERVAL);
    };

    const stopSlideshow = () => {
      if (!timerId) return;
      window.clearInterval(timerId);
      timerId = null;
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopSlideshow();
      else startSlideshow();
    });

    if (heroSection) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
            startSlideshow();
          } else {
            stopSlideshow();
          }
        },
        { threshold: [0, 0.35, 0.7] }
      );
      heroObserver.observe(heroSection);
    } else {
      startSlideshow();
    }
  }

  /* ---------- Scroll-triggered section reveals ---------- */
  if (prefersReducedMotion) {
    animateSections.forEach((section) => section.classList.add("is-inview"));
    document
      .querySelectorAll("[data-service-row]")
      .forEach((row) => row.classList.add("is-visible", "is-active"));
  } else if (animateSections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    animateSections.forEach((section) => observer.observe(section));
  }

  /* ---------- Services row motion ---------- */
  const serviceRows = [...document.querySelectorAll("[data-service-row]")];

  if (serviceRows.length) {
    const setActiveRow = (row) => {
      serviceRows.forEach((item) => item.classList.remove("is-active"));
      row.classList.add("is-active");
    };

    if (!prefersReducedMotion) {
      const rowObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const row = entry.target;
            const delay = Number(row.dataset.index || 1) * 70;
            window.setTimeout(() => row.classList.add("is-visible"), delay);
            rowObserver.unobserve(row);
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -4% 0px" }
      );

      serviceRows.forEach((row) => rowObserver.observe(row));
    } else {
      serviceRows.forEach((row) =>
        row.classList.add("is-visible", "is-active")
      );
    }

    serviceRows.forEach((row) => {
      row.addEventListener("mouseenter", () => setActiveRow(row));
      row.addEventListener("focusin", () => setActiveRow(row));
    });

    setActiveRow(serviceRows[0]);
  }

  /* ---------- Projects reveal ---------- */
  const projectItems = [...document.querySelectorAll("[data-project-item]")];

  if (projectItems.length) {
    if (prefersReducedMotion) {
      projectItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const projectObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const item = entry.target;
            const index = projectItems.indexOf(item);
            window.setTimeout(() => item.classList.add("is-visible"), index * 60);
            projectObserver.unobserve(item);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -4% 0px" }
      );

      projectItems.forEach((item) => projectObserver.observe(item));
    }
  }
})();
