const topbar = document.querySelector("[data-topbar]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll("[data-nav] a[href^='#']");
const revealItems = document.querySelectorAll(".reveal");

const setTopbarState = () => {
  if (!topbar) {
    return;
  }

  topbar.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeMenu = () => {
  if (!navToggle || !navPanel) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  navPanel.classList.remove("is-open");
};

const toggleMenu = () => {
  if (!navToggle || !navPanel) {
    return;
  }

  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navPanel.classList.toggle("is-open", !isOpen);
};

setTopbarState();
window.addEventListener("scroll", setTopbarState, { passive: true });

if (navToggle) {
  navToggle.addEventListener("click", toggleMenu);
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 860) {
      closeMenu();
    }
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) {
    closeMenu();
  }
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
