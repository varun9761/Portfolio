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

typeText(document.querySelector("#typed-name"), "VARUN", 110, () => {
  typeText(
    document.querySelector("#typed-role"),
    "Full Stack Developer | Computer Science Student",
    35
  );
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
