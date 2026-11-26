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

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", theme === "dark" ? "#04070d" : "#eef3f8");
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

  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultBtnLabel = submitBtn ? submitBtn.textContent.trim() : "Send";
  let isSubmitting = false;

  const setStatus = (message, isError = false) => {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", isError);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

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

    const subject = `Portfolio Inquiry from ${name}`;
    const mailtoUrl = `mailto:varunkumardev92@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }
    setStatus("Sending message...");

    try {
      const response = await fetch("https://formsubmit.co/ajax/varunkumardev92@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: subject,
          _template: "table",
        }),
      });

      const payload = await response.json().catch(() => null);
      const isSuccess =
        response.ok &&
        payload &&
        (payload.success === true || payload.success === "true");

      if (!isSuccess) {
        throw new Error(payload?.message || "Direct form endpoint rejected request");
      }

      form.reset();
      setStatus("Message sent directly to varunkumardev92@gmail.com! I will reply soon.");
      if (typeof showToast === "function") {
        showToast("Message delivered!");
      }
    } catch {
      setStatus("Direct delivery unavailable — opening your email app as backup...");
      if (typeof showToast === "function") {
        showToast("Opening email client fallback...");
      }
      window.location.href = mailtoUrl;
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultBtnLabel;
      }
    }
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
    ".hero-stage, .about-panel, .skills-box, .social-box, .edu-card, .cert-card, .quote-panel, .stacked-project-card"
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
// SHARED GLASS OVERLAY CONTROLLER
// ==========================================================================
const createModalOverlay = (backdrop, { focusEl = null, onBeforeOpen = null } = {}) => {
  if (!backdrop) return null;

  let lastTriggerEl = null;
  let hideTimer = null;

  const isOpen = () => !backdrop.hidden;

  const open = (triggerEl = null) => {
    lastTriggerEl = triggerEl || document.activeElement;
    if (typeof onBeforeOpen === "function") onBeforeOpen();
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }

    backdrop.hidden = false;
    document.body.classList.add("modal-open");

    if (prefersReducedMotion) {
      backdrop.classList.add("is-open");
    } else {
      window.requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
      });
    }

    if (focusEl && typeof focusEl.focus === "function") {
      window.requestAnimationFrame(() => focusEl.focus());
    }
  };

  const close = ({ immediate = false, restoreFocus = true } = {}) => {
    if (backdrop.hidden) return;
    backdrop.classList.remove("is-open");

    const finishHide = () => {
      backdrop.hidden = true;
      hideTimer = null;
      const anotherOpen = document.querySelector(".project-modal-backdrop.is-open, .cmd-backdrop.is-open");
      if (!anotherOpen) {
        document.body.classList.remove("modal-open");
      }
      if (restoreFocus && lastTriggerEl && typeof lastTriggerEl.focus === "function") {
        lastTriggerEl.focus();
      }
      lastTriggerEl = null;
    };

    if (immediate || prefersReducedMotion) {
      finishHide();
    } else {
      hideTimer = window.setTimeout(finishHide, 220);
    }
  };

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });

  return { open, close, isOpen };
};

// ==========================================================================
// INTERACTIVE PROJECT ARCHITECTURE MODAL
// ==========================================================================
const PROJECT_ORDER = ["sharebite", "planora", "expense-trail", "word-scramble"];

const PROJECT_DETAILS = {
  sharebite: {
    num: "01",
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
    image: "assets/sharebite.webp",
    imageAlt: "ShareBite surplus food recovery banner",
    liveLabel: "Live Project",
    liveUrl: "https://sharebite-client-iota.vercel.app/",
    githubUrl: "https://github.com/varun9761/ShareBite",
  },
  planora: {
    num: "02",
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
    image: "assets/planora.webp",
    imageAlt: "Planora smart travel planner preview",
    liveLabel: "Live Project",
    liveUrl: "https://planora-flax.vercel.app/",
    githubUrl: "https://github.com/varun9761/PLANORA",
  },
  "expense-trail": {
    num: "03",
    badge: "Full Stack",
    title: "Expense Trail",
    summary:
      "Responsive personal finance and budget management web app for recording daily expenses, organizing custom budget categories, and tracking spending trends.",
    highlights: [
      "Architected a responsive personal finance management tool to record daily expenses, organize custom budget categories, and visualize spending trends.",
      "Implemented persistent client-side state caching via LocalStorage, ensuring zero-latency data recovery, offline usability, and error-free budget updates.",
    ],
    tech: ["React.js", "JavaScript", "Tailwind CSS", "LocalStorage", "Vercel"],
    image: "assets/expense-trail.webp",
    imageAlt: "Expense Trail web app preview",
    liveLabel: "Live Project",
    liveUrl: "https://expense-trail.vercel.app/",
    githubUrl: "https://github.com/varun9761/expense-trail",
  },
  "word-scramble": {
    num: "04",
    badge: "Frontend",
    title: "Word Scramble",
    summary:
      "Interactive browser puzzle game built around real-time letter shuffling algorithms, multi-tier difficulty timers, and sub-10ms DOM state pipelines.",
    highlights: [
      "Built an interactive word unscramble game with dynamic letter shuffling algorithms, countdown timer intervals, and real-time input validation across 3 difficulty tiers.",
      "Engineered lightweight DOM update pipelines and LocalStorage theme persistence (Dark/Light mode), guaranteeing sub-10ms UI response across all viewport sizes.",
    ],
    tech: ["HTML5", "CSS3", "JavaScript (ES6+)", "DOM Manipulation", "LocalStorage"],
    image: "assets/word-scramble.webp",
    imageAlt: "Word Scramble game preview",
    liveLabel: "Source Code",
    liveUrl: "https://github.com/varun9761/Word-Scramble",
    githubUrl: "https://github.com/varun9761/Word-Scramble",
  },
};

const initProjectModal = () => {
  const backdrop = document.querySelector("#project-modal");
  if (!backdrop) return null;

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
  const overlay = createModalOverlay(backdrop, { focusEl: closeBtn });

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

    if (liveLink) {
      liveLink.href = data.liveUrl;
      const liveTextEl = liveLink.querySelector("span:first-child");
      if (liveTextEl) liveTextEl.textContent = data.liveLabel || "Live Project";
    }
    if (githubLink) {
      githubLink.href = data.githubUrl;
      githubLink.setAttribute("aria-label", `View ${data.title} on GitHub`);
    }
  };

  const openProject = (projectId, triggerEl = null) => {
    if (!PROJECT_DETAILS[projectId]) return;
    renderProject(projectId);
    overlay.open(triggerEl);
  };

  const stepProject = (delta) => {
    const idx = PROJECT_ORDER.indexOf(activeProjectId);
    const nextIdx = (idx + delta + PROJECT_ORDER.length) % PROJECT_ORDER.length;
    renderProject(PROJECT_ORDER[nextIdx]);
  };

  document.querySelectorAll("[data-open-project]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openProject(trigger.getAttribute("data-open-project"), trigger);
    });

    if (trigger.getAttribute("role") === "button") {
      trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProject(trigger.getAttribute("data-open-project"), trigger);
        }
      });
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", () => overlay.close());
  if (prevBtn) prevBtn.addEventListener("click", () => stepProject(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => stepProject(1));

  document.addEventListener("keydown", (event) => {
    if (!overlay.isOpen()) return;
    if (event.key === "Escape") {
      overlay.close();
    } else if (event.key === "ArrowLeft") {
      stepProject(-1);
    } else if (event.key === "ArrowRight") {
      stepProject(1);
    }
  });

  return openProject;
};

const openProjectModal = initProjectModal();

// ==========================================================================
// INLINE RESUME PDF MODAL
// ==========================================================================
const initResumeModal = () => {
  const backdrop = document.querySelector("#resume-modal");
  if (!backdrop) return null;

  const frameEl = document.querySelector("#resume-pdf-frame");
  const closeBtn = document.querySelector("#resume-close-btn");

  const overlay = createModalOverlay(backdrop, {
    focusEl: closeBtn,
    onBeforeOpen: () => {
      if (frameEl && !frameEl.getAttribute("src") && frameEl.dataset.src) {
        frameEl.setAttribute("src", frameEl.dataset.src);
      }
    },
  });

  document.querySelectorAll("[data-open-resume]").forEach((trigger) => {
    trigger.addEventListener("click", () => overlay.open(trigger));
  });

  if (closeBtn) closeBtn.addEventListener("click", () => overlay.close());

  document.addEventListener("keydown", (event) => {
    if (overlay.isOpen() && event.key === "Escape") {
      overlay.close();
    }
  });

  return (triggerEl = null) => overlay.open(triggerEl);
};

const openResumeModal = initResumeModal();

// ==========================================================================
// COMMAND PALETTE (CTRL+K / ⌘K)
// ==========================================================================
const initCommandPalette = () => {
  const backdrop = document.querySelector("#command-palette");
  const input = document.querySelector("#cmd-input");
  const listEl = document.querySelector("#cmd-list");
  const triggerBtn = document.querySelector("#cmd-trigger");
  if (!backdrop || !input || !listEl) return;

  const commands = [
    {
      label: "Inspect ShareBite Architecture",
      hint: "Food recovery platform — React 19, Express 5, PostgreSQL, Overpass",
      badge: "01",
      keywords: "sharebite ngo food postgres leaflet architecture",
      run: () => openProjectModal && openProjectModal("sharebite"),
    },
    {
      label: "Inspect Planora Architecture",
      hint: "Travel itinerary engine — Python, Flask, Open-Meteo API",
      badge: "02",
      keywords: "planora flask travel itinerary weather architecture",
      run: () => openProjectModal && openProjectModal("planora"),
    },
    {
      label: "Inspect Expense Trail Architecture",
      hint: "Personal finance & category analytics — React, Tailwind",
      badge: "03",
      keywords: "expense trail finance budget react architecture",
      run: () => openProjectModal && openProjectModal("expense-trail"),
    },
    {
      label: "Inspect Word Scramble Architecture",
      hint: "Interactive word puzzle — HTML5, CSS3, ES6+",
      badge: "04",
      keywords: "word scramble puzzle game frontend architecture",
      run: () => openProjectModal && openProjectModal("word-scramble"),
    },
    {
      label: "Preview Resume PDF",
      hint: "Open Varun Kumar's ATS-verified resume in an inline preview modal",
      badge: "PDF",
      keywords: "resume cv preview pdf mca bsc education",
      run: () => openResumeModal && openResumeModal(),
    },
    {
      label: "Copy Email Address",
      hint: "Copy varunkumardev92@gmail.com to clipboard",
      badge: "Mail",
      keywords: "email copy contact gmail hire",
      run: async () => {
        if (typeof copyTextToClipboard === "function") {
          const ok = await copyTextToClipboard("varunkumardev92@gmail.com");
          if (typeof showToast === "function") {
            showToast(ok ? "Copied: varunkumardev92@gmail.com" : "Email: varunkumardev92@gmail.com");
          }
        }
      },
    },
    {
      label: "Toggle Dark / Light Theme",
      hint: "Switch between Spatial Liquid Glass Dark and Light modes",
      badge: "Theme",
      keywords: "dark light mode theme appearance",
      run: () => {
        const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem("portfolio-theme", nextTheme);
        applyTheme(nextTheme);
        if (typeof showToast === "function") {
          showToast(`Switched to ${nextTheme} mode`);
        }
      },
    },
    {
      label: "Go to About & Education",
      hint: "Academic timeline (MCA JSS Noida, B.Sc. CS), certifications, skills",
      badge: "Section",
      keywords: "about education mca bsc skills certifications jss invertis",
      run: () => document.querySelector("#about")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" }),
    },
    {
      label: "Go to Projects Deck",
      hint: "Browse all flagship projects & live deployments",
      badge: "Section",
      keywords: "projects deck portfolio work",
      run: () => document.querySelector("#projects")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" }),
    },
    {
      label: "Go to Contact Form",
      hint: "Send a direct message to Varun Kumar",
      badge: "Section",
      keywords: "contact message reach out",
      run: () => document.querySelector("#contact")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" }),
    },
    {
      label: "Open ShareBite Live App",
      hint: "https://sharebite-client-iota.vercel.app/",
      badge: "External",
      keywords: "sharebite live vercel demo",
      run: () => window.open("https://sharebite-client-iota.vercel.app/", "_blank", "noopener,noreferrer"),
    },
    {
      label: "Open GitHub Profile",
      hint: "github.com/varun9761",
      badge: "External",
      keywords: "github source code repos",
      run: () => window.open("https://github.com/varun9761", "_blank", "noopener,noreferrer"),
    },
  ];

  let filtered = commands.slice();
  let selectedIndex = 0;

  const renderList = () => {
    listEl.innerHTML = "";
    if (filtered.length === 0) {
      const empty = document.createElement("li");
      empty.className = "cmd-empty";
      empty.textContent = "No matching commands found.";
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach((cmd, idx) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(idx === selectedIndex));

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cmd-item${idx === selectedIndex ? " is-selected" : ""}`;

      const main = document.createElement("div");
      main.className = "cmd-item-main";

      const title = document.createElement("span");
      title.textContent = cmd.label;
      const hint = document.createElement("span");
      hint.className = "cmd-item-hint";
      hint.textContent = cmd.hint;

      main.appendChild(title);
      main.appendChild(hint);

      const badge = document.createElement("span");
      badge.className = "cmd-item-badge";
      badge.textContent = cmd.badge;

      btn.appendChild(main);
      btn.appendChild(badge);
      btn.addEventListener("mouseenter", () => {
        selectedIndex = idx;
        updateSelectionClass();
      });
      btn.addEventListener("click", () => executeCommand(cmd));

      li.appendChild(btn);
      listEl.appendChild(li);
    });
  };

  const updateSelectionClass = () => {
    const buttons = listEl.querySelectorAll(".cmd-item");
    buttons.forEach((btn, idx) => {
      const isSelected = idx === selectedIndex;
      btn.classList.toggle("is-selected", isSelected);
      btn.parentElement?.setAttribute("aria-selected", String(isSelected));
    });
  };

  const overlay = createModalOverlay(backdrop, {
    focusEl: input,
    onBeforeOpen: () => {
      input.value = "";
      filtered = commands.slice();
      selectedIndex = 0;
      renderList();
    },
  });

  const executeCommand = (cmd) => {
    if (!cmd) return;
    overlay.close({ immediate: true, restoreFocus: false });
    cmd.run();
  };

  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => overlay.open(triggerBtn));
  }

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    filtered = query
      ? commands.filter((cmd) =>
          `${cmd.label} ${cmd.hint} ${cmd.badge} ${cmd.keywords}`.toLowerCase().includes(query)
        )
      : commands.slice();
    selectedIndex = 0;
    renderList();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (overlay.isOpen()) {
        overlay.close();
      } else {
        overlay.open(triggerBtn || document.activeElement);
      }
      return;
    }

    if (!overlay.isOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      overlay.close();
    } else if (event.key === "ArrowDown" && filtered.length > 0) {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % filtered.length;
      updateSelectionClass();
      listEl.children[selectedIndex]?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "ArrowUp" && filtered.length > 0) {
      event.preventDefault();
      selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
      updateSelectionClass();
      listEl.children[selectedIndex]?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && filtered.length > 0) {
      event.preventDefault();
      executeCommand(filtered[selectedIndex]);
    }
  });
};

initCommandPalette();

// ==========================================================================
// LIVE IST CLOCK
// ==========================================================================
const initLiveClock = () => {
  const clockEl = document.querySelector("#ist-clock");
  if (!clockEl) return;

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const updateClock = () => {
    clockEl.textContent = `${formatter.format(new Date()).toUpperCase()} IST`;
  };

  updateClock();
  window.setInterval(updateClock, 30000);
};

initLiveClock();
