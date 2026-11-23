const revealElements = document.querySelectorAll(".reveal");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");

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
    threshold: 0.15,
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

const typeText = (element, text, speed = 70, callback) => {
  if (!element) {
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
// STACKED PROJECT CARDS SCROLL PHYSICS
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

    if (window.innerWidth <= 640) {
      cards.forEach((card) => {
        card.style.transform = "none";
        card.style.filter = "none";
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
  updateCardTransforms();
};

initStackedCards();

