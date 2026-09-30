(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const siteMenu = document.querySelector(".site-menu");
  const menuLinks = siteMenu?.querySelectorAll("a") ?? [];
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

  /* ---------- Image crossfades ---------- */
  const runSlideshow = (slideNodes, section) => {
    if (slideNodes.length < 2 || prefersReducedMotion) return;

    const INTERVAL = 6500;
    const FADE_MS = 1800;
    let index = 0;
    let timerId = null;
    let fading = false;

    const goTo = (nextIndex) => {
      if (fading || nextIndex === index) return;

      fading = true;
      const current = slideNodes[index];
      const next = slideNodes[nextIndex];

      current.classList.remove("is-active");
      current.classList.add("is-exiting");
      next.classList.add("is-active");

      window.setTimeout(() => {
        current.classList.remove("is-exiting");
        fading = false;
      }, FADE_MS);

      index = nextIndex;
    };

    const startSlideshow = () => {
      if (timerId) return;
      timerId = window.setInterval(() => goTo((index + 1) % slideNodes.length), INTERVAL);
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

    if (section) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
            startSlideshow();
          } else {
            stopSlideshow();
          }
        },
        { threshold: [0, 0.35, 0.7] }
      );
      observer.observe(section);
    } else {
      startSlideshow();
    }
  };

  runSlideshow(
    [...document.querySelectorAll("[data-hero-slide]")],
    document.querySelector("#hero")
  );
  runSlideshow(
    [...document.querySelectorAll("[data-start-slide]")],
    document.querySelector("#start")
  );

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

  /* ---------- Projects headline rotation ---------- */
  const projectsSection = document.querySelector("#projects");
  const projectsTitleLines = [
    ...document.querySelectorAll("[data-projects-title] .projects__title-line > span"),
  ];
  const projectsPhrases = [
    ["Sites that", "stop the scroll."],
    ["Pages that", "feel expensive."],
    ["Launches built", "to convert."],
  ];
  let projectsPhraseTimer = 0;
  let projectsSwapTimer = 0;
  let projectsPhraseIndex = 0;
  let projectsPlaying = false;

  const applyProjectsPhrase = (index, withMotion) => {
    const phrase = projectsPhrases[index];
    if (!phrase || projectsTitleLines.length < 2) return;

    const write = () => {
      projectsTitleLines.forEach((line, i) => {
        line.textContent = phrase[i];
        line.style.transitionDelay = `${0.08 + i * 0.16}s`;
        line.classList.remove("is-out", "is-prep");
      });
    };

    if (!withMotion) {
      write();
      return;
    }

    projectsTitleLines.forEach((line, i) => {
      line.style.transitionDelay = `${i * 0.1}s`;
      line.classList.add("is-out");
      line.classList.remove("is-prep");
    });

    window.clearTimeout(projectsSwapTimer);
    projectsSwapTimer = window.setTimeout(() => {
      projectsTitleLines.forEach((line, i) => {
        line.textContent = phrase[i];
        line.style.transition = "none";
        line.classList.add("is-prep");
        line.classList.remove("is-out");
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            line.style.transition = "";
            line.style.transitionDelay = `${0.06 + i * 0.16}s`;
            line.classList.remove("is-prep");
          });
        });
      });
    }, 460);
  };

  const startProjectsHeadline = () => {
    if (prefersReducedMotion || projectsPlaying || projectsTitleLines.length < 2) return;
    projectsPlaying = true;
    projectsSection?.classList.add("is-live");
    projectsPhraseIndex = 0;
    applyProjectsPhrase(0, false);
    window.clearInterval(projectsPhraseTimer);
    projectsPhraseTimer = window.setInterval(() => {
      projectsPhraseIndex = (projectsPhraseIndex + 1) % projectsPhrases.length;
      applyProjectsPhrase(projectsPhraseIndex, true);
    }, 4800);
  };

  const stopProjectsHeadline = () => {
    projectsPlaying = false;
    window.clearInterval(projectsPhraseTimer);
    window.clearTimeout(projectsSwapTimer);
    applyProjectsPhrase(0, false);
    projectsSection?.classList.remove("is-live");
  };

  if (projectsSection && projectsTitleLines.length) {
    if (!prefersReducedMotion) {
      const projectsLiveObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            startProjectsHeadline();
          } else {
            stopProjectsHeadline();
          }
        },
        { threshold: [0, 0.2, 0.45] }
      );
      projectsLiveObserver.observe(projectsSection);
    }
  }

  /* ---------- Approach copy + live motion ---------- */
  const approach = document.querySelector(".approach");
  const approachCopy = document.querySelector("[data-approach-copy]");
  const approachValues = [
    ...document.querySelectorAll(".approach__value[data-count]"),
  ];
  let approachCountTimer = 0;
  let approachLiveTimer = 0;
  let approachPhraseTimer = 0;
  let approachSwapTimer = 0;
  let approachPlaying = false;
  let approachPhraseIndex = 0;

  const approachTitle = document.querySelector("[data-approach-title]");
  const approachTitleLines = [
    ...document.querySelectorAll("[data-approach-title] .approach__title-line > span"),
  ];
  const approachPhrases = [
    ["Quiet design.", "Strong presence."],
    ["Soft luxury.", "Sharp clarity."],
    ["Calm layouts.", "Lasting impact."],
  ];

  if (approachCopy && !prefersReducedMotion) {
    const source = approachCopy.textContent.trim();
    approachCopy.textContent = "";

    source.split(/(\s+)/).forEach((token, index) => {
      if (!token || /^\s+$/.test(token)) {
        approachCopy.append(document.createTextNode(token));
        return;
      }

      const word = document.createElement("span");
      word.textContent = token;
      word.style.setProperty("--d", `${0.48 + index * 0.022}s`);
      word.style.transitionDelay = `${0.48 + index * 0.022}s`;
      approachCopy.append(word);
    });
  }

  const formatApproachValue = (el, value) => {
    const pad = Number(el.dataset.pad || 0);
    const suffix = el.dataset.suffix || "";
    const whole = String(Math.round(value));
    return `${pad ? whole.padStart(pad, "0") : whole}${suffix}`;
  };

  const resetApproachCounters = () => {
    approachValues.forEach((el) => {
      el.textContent = formatApproachValue(el, 0);
    });
  };

  const runApproachCounters = () => {
    approachValues.forEach((el) => {
      const target = Number(el.dataset.count);
      const duration = 1100;
      const start = performance.now();

      if (prefersReducedMotion) {
        el.textContent = formatApproachValue(el, target);
        return;
      }

      const tick = (now) => {
        if (!approachPlaying && approach && !approach.classList.contains("is-live")) {
          el.textContent = formatApproachValue(el, target);
          return;
        }
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatApproachValue(el, target * eased);
        if (progress < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    });
  };

  const applyApproachPhrase = (index, withMotion) => {
    const phrase = approachPhrases[index];
    if (!phrase.length || approachTitleLines.length < 2) return;

    const write = () => {
      approachTitleLines.forEach((line, i) => {
        line.textContent = phrase[i];
        line.style.transitionDelay = `${0.08 + i * 0.16}s`;
        line.classList.remove("is-out", "is-prep");
      });
    };

    if (!withMotion) {
      write();
      return;
    }

    approachTitleLines.forEach((line, i) => {
      line.style.transitionDelay = `${i * 0.1}s`;
      line.classList.add("is-out");
      line.classList.remove("is-prep");
    });

    window.clearTimeout(approachSwapTimer);
    approachSwapTimer = window.setTimeout(() => {
      approachTitleLines.forEach((line, i) => {
        line.textContent = phrase[i];
        line.style.transition = "none";
        line.classList.add("is-prep");
        line.classList.remove("is-out");
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            line.style.transition = "";
            line.style.transitionDelay = `${0.06 + i * 0.16}s`;
            line.classList.remove("is-prep");
          });
        });
      });
    }, 460);
  };

  const startApproachPhrases = () => {
    window.clearInterval(approachPhraseTimer);
    approachPhraseIndex = 0;
    applyApproachPhrase(0, false);
    approachPhraseTimer = window.setInterval(() => {
      approachPhraseIndex = (approachPhraseIndex + 1) % approachPhrases.length;
      applyApproachPhrase(approachPhraseIndex, true);
    }, 4200);
  };

  const startApproachLive = () => {
    if (prefersReducedMotion || approachPlaying || !approach) return;
    approachPlaying = true;
    runApproachCounters();
    startApproachPhrases();
    window.clearTimeout(approachLiveTimer);
    approachLiveTimer = window.setTimeout(() => {
      approach.classList.add("is-live");
    }, 1900);
    window.clearInterval(approachCountTimer);
    approachCountTimer = window.setInterval(() => {
      resetApproachCounters();
      runApproachCounters();
    }, 8800);
  };

  const stopApproachLive = () => {
    approachPlaying = false;
    window.clearTimeout(approachLiveTimer);
    window.clearInterval(approachCountTimer);
    window.clearInterval(approachPhraseTimer);
    window.clearTimeout(approachSwapTimer);
    applyApproachPhrase(0, false);
    if (approach) approach.classList.remove("is-live");
  };

  if (approach) {
    if (prefersReducedMotion) {
      approachValues.forEach((el) => {
        el.textContent = formatApproachValue(el, Number(el.dataset.count));
      });
    } else {
      resetApproachCounters();
      const liveObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            startApproachLive();
          } else {
            stopApproachLive();
          }
        },
        { threshold: [0, 0.2, 0.45] }
      );
      liveObserver.observe(approach);
    }
  }

  /* ---------- Capabilities hover ---------- */
  const buildItems = [...document.querySelectorAll("[data-build-item]")];
  const buildDisplay = document.querySelector("[data-build-display]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (buildItems.length) {
    let buildSwapTimer = 0;

    const setBuildActive = (item) => {
      if (item.classList.contains("is-active")) return;

      buildItems.forEach((entry) => entry.classList.remove("is-active"));
      item.classList.add("is-active");

      const nextNum = item.querySelector(".build__num")?.textContent.trim() || "";

      const applyNumber = () => {
        if (buildDisplay && nextNum) buildDisplay.textContent = nextNum;
        buildDisplay?.classList.remove("is-swapping");
      };

      window.clearTimeout(buildSwapTimer);

      if (reduceMotion) {
        applyNumber();
        return;
      }

      buildDisplay?.classList.add("is-swapping");
      buildSwapTimer = window.setTimeout(applyNumber, 180);
    };

    buildItems.forEach((item) => {
      const button = item.querySelector("button");
      item.addEventListener("mouseenter", () => setBuildActive(item));
      item.addEventListener("focusin", () => setBuildActive(item));
      button?.addEventListener("click", () => setBuildActive(item));
    });
  }

  /* ---------- Start headline rotation ---------- */
  const startSection = document.querySelector("#start");
  const startTitleLines = [
    ...document.querySelectorAll("[data-start-title] .start__line > span"),
  ];
  const startPhrases = [
    ["Your next", "property", "deserves a better", "first impression."],
    ["A landmark", "deserves more", "than a template", "and a form."],
    ["Let the first", "scroll feel", "as considered", "as the lobby."],
  ];
  let startPhraseTimer = 0;
  let startSwapTimer = 0;
  let startPhraseIndex = 0;
  let startPlaying = false;

  const applyStartPhrase = (index, withMotion) => {
    const phrase = startPhrases[index];
    if (!phrase || startTitleLines.length < 4) return;

    const write = () => {
      startTitleLines.forEach((line, i) => {
        line.textContent = phrase[i];
        line.style.transitionDelay = `${0.08 + i * 0.12}s`;
        line.classList.remove("is-out", "is-prep");
      });
    };

    if (!withMotion) {
      write();
      return;
    }

    startTitleLines.forEach((line, i) => {
      line.style.transitionDelay = `${i * 0.08}s`;
      line.classList.add("is-out");
      line.classList.remove("is-prep");
    });

    window.clearTimeout(startSwapTimer);
    startSwapTimer = window.setTimeout(() => {
      startTitleLines.forEach((line, i) => {
        line.textContent = phrase[i];
        line.style.transition = "none";
        line.classList.add("is-prep");
        line.classList.remove("is-out");
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            line.style.transition = "";
            line.style.transitionDelay = `${0.06 + i * 0.12}s`;
            line.classList.remove("is-prep");
          });
        });
      });
    }, 480);
  };

  const startHeadlineLoop = () => {
    if (prefersReducedMotion || startPlaying) return;
    startPlaying = true;
    startPhraseIndex = 0;
    applyStartPhrase(0, false);
    window.clearInterval(startPhraseTimer);
    startPhraseTimer = window.setInterval(() => {
      startPhraseIndex = (startPhraseIndex + 1) % startPhrases.length;
      applyStartPhrase(startPhraseIndex, true);
    }, 5600);
  };

  const stopHeadlineLoop = () => {
    startPlaying = false;
    window.clearInterval(startPhraseTimer);
    window.clearTimeout(startSwapTimer);
    applyStartPhrase(0, false);
  };

  if (startSection && startTitleLines.length) {
    if (prefersReducedMotion) {
      applyStartPhrase(0, false);
    } else {
      const maybeStartHeadlines = () => {
        const rect = startSection.getBoundingClientRect();
        const visible = rect.bottom > 80 && rect.top < window.innerHeight - 80;
        if (visible) startHeadlineLoop();
        else stopHeadlineLoop();
      };

      const startObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
            startHeadlineLoop();
          } else {
            stopHeadlineLoop();
          }
        },
        { threshold: [0, 0.12, 0.35, 0.6] }
      );
      startObserver.observe(startSection);

      const startClassWatch = new MutationObserver(() => {
        if (startSection.classList.contains("is-inview")) startHeadlineLoop();
      });
      startClassWatch.observe(startSection, {
        attributes: true,
        attributeFilter: ["class"],
      });

      maybeStartHeadlines();
    }
  }
})();
