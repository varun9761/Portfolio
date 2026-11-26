const revealElements = document.querySelectorAll(".reveal");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  if (themeToggleText) {
    themeToggleText.textContent = theme === "dark" ? "Dark" : "Light";
  }
};

const savedTheme = localStorage.getItem("portfolio-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

applyTheme(savedTheme || preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("portfolio-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

// Reveal sections immediately as they enter or pass the viewport (safe for tall mobile sections & anchor jumps)
const revealVisibleInViewport = () => {
  const triggerBottom = window.innerHeight * 1.02;
  revealElements.forEach((element) => {
    if (element.classList.contains("is-visible")) return;
    const rect = element.getBoundingClientRect();
    if (rect.top <= triggerBottom) {
      element.classList.add("is-visible");
    }
  });
};

if (prefersReducedMotion) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.01,
      rootMargin: "0px 0px -16px 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
  window.addEventListener("load", revealVisibleInViewport);
  window.addEventListener("scroll", revealVisibleInViewport, { passive: true });
  window.addEventListener("resize", revealVisibleInViewport, { passive: true });
  window.addEventListener("hashchange", () => {
    window.requestAnimationFrame(revealVisibleInViewport);
  });
  revealVisibleInViewport();
}

const ROLE_PHRASES = [
  "Full Stack Engineer • MCA @ JSS Noida",
  "React.js • Node.js • Python • PostgreSQL",
  "Geospatial & Real-Time API Architect",
  "SDLC • STLC • Scalable Web Systems",
];

const typeText = (element, text, speed = 70, callback) => {
  if (!element) return;

  if (prefersReducedMotion) {
    element.textContent = text;
    if (callback) callback();
    return;
  }

  let index = 0;

  const tick = () => {
    element.textContent = text.slice(0, index);
    index += 1;

    if (index <= text.length) {
      window.setTimeout(tick, speed);
    } else if (callback) {
      callback();
    }
  };

  tick();
};

const startRoleCycle = (element, roles) => {
  if (!element || !roles.length) return;

  if (prefersReducedMotion) {
    element.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const step = () => {
    const current = roles[roleIndex];

    if (!isDeleting) {
      charIndex += 1;
      element.textContent = current.slice(0, charIndex);

      if (charIndex < current.length) {
        window.setTimeout(step, 38);
      } else {
        isDeleting = true;
        window.setTimeout(step, 2100);
      }
    } else {
      charIndex -= 1;
      element.textContent = current.slice(0, charIndex);

      if (charIndex > 0) {
        window.setTimeout(step, 20);
      } else {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        window.setTimeout(step, 260);
      }
    }
  };

  step();
};

typeText(document.querySelector("#typed-name"), "VARUN", 110, () => {
  startRoleCycle(document.querySelector("#typed-role"), ROLE_PHRASES);
});

// ==========================================================================
// DYNAMIC MOBILE NAVIGATION DRAWER
// ==========================================================================
const initMobileMenu = () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".site-nav a");
  if (!header || !navToggle) return;

  const setMenuOpen = (isOpen) => {
    header.classList.toggle("is-menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const nextState = !header.classList.contains("is-menu-open");
    setMenuOpen(nextState);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
      const targetId = link.getAttribute("href");
      const targetEl = targetId ? document.querySelector(targetId) : null;
      if (targetEl) targetEl.classList.add("is-visible");
      window.setTimeout(revealVisibleInViewport, 80);
    });
  });

  document.addEventListener("click", (event) => {
    if (header.classList.contains("is-menu-open") && !header.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 780 && header.classList.contains("is-menu-open")) {
        setMenuOpen(false);
      }
    },
    { passive: true }
  );
};

initMobileMenu();

// ==========================================================================
// DYNAMIC SCROLL PROGRESS & ACTIVE SECTION SCROLL-SPY
// ==========================================================================
const initScrollDynamics = () => {
  const progressBar = document.querySelector(".scroll-progress");
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;

  const updateScrollUI = () => {
    ticking = false;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      const progress = docHeight > 0 ? Math.max(0, Math.min(1, scrollTop / docHeight)) : 0;
      progressBar.style.setProperty("--scroll-progress", progress.toFixed(4));
    }

    if (sections.length === 0) return;

    const atBottom = docHeight > 0 && scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 24;
    let activeId = sections[0].id;

    if (atBottom) {
      activeId = sections[sections.length - 1].id;
    } else {
      const markerY = Math.min(220, window.innerHeight * 0.32);
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= markerY) {
          activeId = section.id;
        }
      }
    }

    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isMatch);
    });
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", updateScrollUI);
  window.addEventListener("hashchange", updateScrollUI);
  updateScrollUI();
};

initScrollDynamics();

// ==========================================================================
// STACKED PROJECT CARDS SCROLL PHYSICS (DESKTOP & TABLET)
// ==========================================================================
const initStackedCards = () => {
  const stackContainer = document.querySelector(".projects-stack-container");
  if (!stackContainer) return;

  const cards = Array.from(stackContainer.querySelectorAll(".stacked-project-card"));
  const totalCards = cards.length;
  if (totalCards === 0) return;

  let ticking = false;

  const updateCardTransforms = () => {
    ticking = false;

    if (window.innerWidth <= 780 || window.innerHeight < 560) {
      cards.forEach((card) => {
        card.style.transform = "";
        card.style.filter = "";
      });
      return;
    }

    cards.forEach((card, index) => {
      const targetScale = 1 - (totalCards - 1 - index) * 0.025;

      if (index === totalCards - 1) {
        card.style.transform = "scale(1)";
        card.style.filter = "none";
        return;
      }

      const nextCard = cards[index + 1];
      if (nextCard) {
        const nextRect = nextCard.getBoundingClientRect();
        const stickyTop = parseInt(window.getComputedStyle(card).top, 10) || 112;
        const endPoint = stickyTop + 20;
        const startPoint = endPoint + 240;

        let progress = (startPoint - nextRect.top) / (startPoint - endPoint);
        progress = Math.max(0, Math.min(1, progress));

        const currentScale = 1 - (1 - targetScale) * progress;
        const brightness = 1 - 0.05 * progress;

        card.style.transform = `scale(${currentScale.toFixed(4)})`;
        card.style.filter = `brightness(${brightness.toFixed(3)})`;
      }
    });
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateCardTransforms);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", updateCardTransforms);
  window.addEventListener("hashchange", updateCardTransforms);
  updateCardTransforms();
};

initStackedCards();

// ==========================================================================
// DYNAMIC CONTACT FORM HANDLER
// ==========================================================================
const initContactForm = () => {
  const form = document.querySelector(".contact-form");
  const statusEl = document.querySelector("#contact-status");
  if (!form || !statusEl) return;

  const setStatus = (message, isError = false) => {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", isError);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      setStatus("Please fill in your name, email, and message before sending.", true);
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      setStatus("Please enter a valid email address.", true);
      return;
    }

    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailtoUrl = `mailto:varunkumardev92@gmail.com?subject=${subject}&body=${body}`;

    setStatus("Opening your email app to send the message...");
    window.location.href = mailtoUrl;
  });
};

initContactForm();

// ==========================================================================
// TOAST NOTIFICATION & ONE-CLICK COPY EMAIL
// ==========================================================================
let toastTimer = null;

const showToast = (message) => {
  const toastEl = document.querySelector("#toast-banner");
  if (!toastEl) return;

  toastEl.textContent = message;
  toastEl.classList.add("is-visible");

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2400);
};

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back to execCommand when Clipboard API is blocked (e.g., restricted iframes)
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error("Copy command failed");
  }
};

const initCopyEmail = () => {
  const copyButtons = document.querySelectorAll("[data-copy-email]");
  if (copyButtons.length === 0) return;

  copyButtons.forEach((btn) => {
    const badge = btn.querySelector(".copy-email-badge");
    let resetTimer = null;

    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-copy-email") || "";
      if (!email) return;

      try {
        await copyTextToClipboard(email);
        btn.classList.add("is-copied");
        if (badge) badge.textContent = "Copied ✓";
        showToast(`Copied ${email}`);

        if (resetTimer) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          btn.classList.remove("is-copied");
          if (badge) badge.textContent = "Copy";
        }, 2000);
      } catch {
        showToast("Unable to copy automatically — please use varunkumardev92@gmail.com");
      }
    });
  });
};

initCopyEmail();

// ==========================================================================
// SPATIAL POINTER SPOTLIGHT & 3D PHOTO TILT (DESKTOP FINE POINTER)
// ==========================================================================
const initPointerSpotlight = () => {
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!supportsHover || prefersReducedMotion) return;

  const panels = document.querySelectorAll(
    ".hero-stage, .about-panel, .skills-box, .social-box, .quote-panel, .stacked-project-card"
  );

  panels.forEach((panel) => {
    let rafId = null;

    panel.addEventListener("pointermove", (event) => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const rect = panel.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        panel.style.setProperty("--mx", `${x.toFixed(1)}px`);
        panel.style.setProperty("--my", `${y.toFixed(1)}px`);
      });
    });
  });
};

initPointerSpotlight();

const initPhotoTilt = () => {
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!supportsHover || prefersReducedMotion) return;

  const photos = document.querySelectorAll(".project-photo-wrap.is-interactive");
  photos.forEach((wrap) => {
    let rafId = null;

    wrap.addEventListener("pointermove", (event) => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const rect = wrap.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        const rx = (-py * 5.5).toFixed(2);
        const ry = (px * 5.5).toFixed(2);
        wrap.style.setProperty("--rx", `${rx}deg`);
        wrap.style.setProperty("--ry", `${ry}deg`);
      });
    });

    wrap.addEventListener("pointerleave", () => {
      wrap.style.setProperty("--rx", "0deg");
      wrap.style.setProperty("--ry", "0deg");
    });
  });
};

initPhotoTilt();

// ==========================================================================
// INTERACTIVE PROJECT ARCHITECTURE MODAL
// ==========================================================================
const PROJECT_ORDER = ["word-scramble", "expense-trail", "planora", "sharebite"];

const PROJECT_DETAILS = {
  "word-scramble": {
    num: "01",
    badge: "Frontend",
    title: "Word Scramble",
    summary:
      "Interactive browser puzzle game built around real-time letter shuffling algorithms, multi-tier difficulty timers, and sub-10ms DOM state pipelines.",
    highlights: [
      "Built an interactive word unscramble game with dynamic letter shuffling algorithms, countdown timer intervals, and real-time input validation across 3 difficulty tiers.",
      "Engineered lightweight DOM update pipelines and LocalStorage theme persistence (Dark/Light mode), guaranteeing sub-10ms UI response across all viewport sizes.",
    ],
    tech: ["HTML5", "CSS3", "JavaScript (ES6+)", "DOM Manipulation", "LocalStorage"],
    image: "assets/word-scramble.png?v=2",
    imageAlt: "Word Scramble game preview",
    liveUrl: "https://github.com/varun9761/Word-Scramble",
    githubUrl: "https://github.com/varun9761/Word-Scramble",
  },
  "expense-trail": {
    num: "02",
    badge: "Full Stack",
    title: "Expense Trail",
    summary:
      "Responsive personal finance and budget management web app for recording daily expenses, organizing custom budget categories, and tracking spending trends.",
    highlights: [
      "Architected a responsive personal finance management tool to record daily expenses, organize custom budget categories, and visualize spending trends.",
      "Implemented persistent client-side state caching via LocalStorage, ensuring zero-latency data recovery, offline usability, and error-free budget updates.",
    ],
    tech: ["React.js", "JavaScript", "Tailwind CSS", "LocalStorage", "Vercel"],
    image: "assets/expense-trail.png?v=2",
    imageAlt: "Expense Trail web app preview",
    liveUrl: "https://expense-trail.vercel.app/",
    githubUrl: "https://github.com/varun9761/expense-trail",
  },
  planora: {
    num: "03",
    badge: "Full Stack / Travel Engine",
    title: "Planora",
    summary:
      "Smart full-stack travel planner and dynamic itinerary engine generating day-by-day plans, live weather forecasts, packing checklists, and PDF exports.",
    highlights: [
      "Developed an end-to-end travel itinerary platform utilizing Flask REST APIs to generate day-by-day itineraries, live meteorological forecasts, and hotel recommendations.",
      "Integrated Open-Meteo & OpenTripMap APIs for dynamic weather forecasting, smart weather-aware packing checklists, and geocoded destination discovery across global cities.",
      "Implemented dynamic multi-currency budget calculators and client-side caching to streamline trip planning, featuring 1-click popular destination chips and PDF export.",
    ],
    tech: ["Python", "Flask", "JavaScript", "Leaflet.js", "Open-Meteo API", "OpenTripMap", "REST APIs", "Tailwind CSS"],
    image: "assets/planora.png?v=1",
    imageAlt: "Planora smart travel planner preview",
    liveUrl: "https://planora-flax.vercel.app/",
    githubUrl: "https://github.com/varun9761/PLANORA",
  },
  sharebite: {
    num: "04",
    badge: "Full Stack / NGO Platform",
    title: "ShareBite",
    summary:
      "Real-time surplus food recovery and NGO routing platform connecting restaurants, caterers, and food donors with nearby NGOs, soup kitchens, and volunteers.",
    highlights: [
      "Engineered a full-stack surplus food rescue application connecting restaurants and NGOs to eliminate food waste and expedite donations.",
      "Implemented real-time geospatial tracking via OpenStreetMap Overpass & Leaflet API, enabling live GPS proximity discovery for soup kitchens within seconds.",
      "Architected a secure OTP-based claim & handover verification lifecycle and automated node-cron background expiration jobs to guarantee food safety.",
      "Optimized PostgreSQL connection pooling and indexing, lowering query latency by ~35% across search, filters, and dynamic impact metric analytics.",
    ],
    tech: ["React 19", "Node.js", "Express.js", "PostgreSQL", "Tailwind CSS", "Leaflet Maps", "Overpass API", "JWT", "node-cron"],
    image: "assets/sharebite.jpg",
    imageAlt: "ShareBite surplus food recovery banner",
    liveUrl: "https://sharebite-client-iota.vercel.app/",
    githubUrl: "https://github.com/varun9761/ShareBite",
  },
};

const initProjectModal = () => {
  const backdrop = document.querySelector("#project-modal");
  if (!backdrop) return;

  const numEl = document.querySelector("#modal-project-num");
  const badgeEl = document.querySelector("#modal-project-badge");
  const titleEl = document.querySelector("#modal-project-title");
  const imgEl = document.querySelector("#modal-project-image");
  const summaryEl = document.querySelector("#modal-project-summary");
  const highlightsEl = document.querySelector("#modal-project-highlights");
  const techEl = document.querySelector("#modal-project-tech");
  const liveLink = document.querySelector("#modal-live-link");
  const githubLink = document.querySelector("#modal-github-link");
  const closeBtn = document.querySelector("#modal-close-btn");
  const prevBtn = document.querySelector("#modal-prev-btn");
  const nextBtn = document.querySelector("#modal-next-btn");

  let activeProjectId = PROJECT_ORDER[0];
  let lastTriggerEl = null;
  let hideTimer = null;

  const renderProject = (projectId) => {
    const data = PROJECT_DETAILS[projectId];
    if (!data) return;

    activeProjectId = projectId;
    if (numEl) numEl.textContent = data.num;
    if (badgeEl) badgeEl.textContent = data.badge;
    if (titleEl) titleEl.textContent = data.title;
    if (imgEl) {
      imgEl.src = data.image;
      imgEl.alt = data.imageAlt;
    }
    if (summaryEl) summaryEl.textContent = data.summary;

    if (highlightsEl) {
      highlightsEl.innerHTML = "";
      data.highlights.forEach((bullet) => {
        const li = document.createElement("li");
        li.textContent = bullet;
        highlightsEl.appendChild(li);
      });
    }

    if (techEl) {
      techEl.innerHTML = "";
      data.tech.forEach((item) => {
        const span = document.createElement("span");
        span.className = "modal-tech-chip";
        span.textContent = item;
        techEl.appendChild(span);
      });
    }

    if (liveLink) liveLink.href = data.liveUrl;
    if (githubLink) {
      githubLink.href = data.githubUrl;
      githubLink.setAttribute("aria-label", `View ${data.title} on GitHub`);
    }
  };

  const openModal = (projectId, triggerEl = null) => {
    if (!PROJECT_DETAILS[projectId]) return;
    lastTriggerEl = triggerEl;
    renderProject(projectId);

    if (hideTimer) window.clearTimeout(hideTimer);
    backdrop.hidden = false;
    document.body.classList.add("modal-open");

    if (prefersReducedMotion) {
      backdrop.classList.add("is-open");
    } else {
      window.requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
      });
    }

    if (closeBtn) closeBtn.focus();
  };

  const closeModal = () => {
    if (backdrop.hidden) return;
    backdrop.classList.remove("is-open");
    document.body.classList.remove("modal-open");

    const finishHide = () => {
      backdrop.hidden = true;
      if (lastTriggerEl && typeof lastTriggerEl.focus === "function") {
        lastTriggerEl.focus();
      }
      lastTriggerEl = null;
    };

    if (prefersReducedMotion) {
      finishHide();
    } else {
      hideTimer = window.setTimeout(finishHide, 220);
    }
  };

  const stepProject = (delta) => {
    const idx = PROJECT_ORDER.indexOf(activeProjectId);
    const nextIdx = (idx + delta + PROJECT_ORDER.length) % PROJECT_ORDER.length;
    renderProject(PROJECT_ORDER[nextIdx]);
  };

  document.querySelectorAll("[data-open-project]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger.getAttribute("data-open-project"), trigger);
    });

    if (trigger.getAttribute("role") === "button") {
      trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal(trigger.getAttribute("data-open-project"), trigger);
        }
      });
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (prevBtn) prevBtn.addEventListener("click", () => stepProject(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => stepProject(1));

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (backdrop.hidden) return;
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "ArrowLeft") {
      stepProject(-1);
    } else if (event.key === "ArrowRight") {
      stepProject(1);
    }
  });
};

initProjectModal();
