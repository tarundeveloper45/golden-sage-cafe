/* ==========================================================================
   GOLDEN SAGE CAFÉ & KITCHEN — MAIN SCRIPT
   Vanilla JS, no dependencies. Every feature is guarded so pages that don't
   contain a given component (e.g. no carousel on the FAQ page) simply skip it.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initParallax();
  initBackToTop();
  initTestimonialCarousel();
  initFaqAccordion();
  initLightboxGallery();
  initGalleryFilters();
  initMenuTabs();
  initContactForm();
  initReservationForm();
  initFooterYear();
});

/* --------------------------------------------------------------------
   NAVBAR — adds a shadow/solid background once the page is scrolled
   -------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const toggleScrolled = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 12);
  };

  toggleScrolled();
  window.addEventListener("scroll", toggleScrolled, { passive: true });

  // Highlight the current page in the nav links
  const currentPage = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage || (currentPage === "" && linkPage === "index.html")) {
      link.classList.add("active");
    }
  });
}

/* --------------------------------------------------------------------
   RESPONSIVE HAMBURGER MOBILE MENU
   -------------------------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (!hamburger || !navLinks) return;

  const closeMenu = () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the mobile menu whenever a link inside it is clicked
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!navLinks.classList.contains("open")) return;
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

/* --------------------------------------------------------------------
   SMOOTH SCROLL for in-page anchor links (nav honours fixed header
   via the CSS `scroll-padding-top`, this just intercepts the click)
   -------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const [path, hash] = href.split("#");
    const isSamePage = path === "" || path === location.pathname.split("/").pop();
    if (!hash || !isSamePage) return;

    link.addEventListener("click", (e) => {
      const target = document.getElementById(hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* --------------------------------------------------------------------
   SCROLL-TRIGGERED FADE-IN ANIMATIONS via IntersectionObserver
   -------------------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------
   PARALLAX SCROLLING — depth-based layers. Hero/page-header background
   images move slower than scroll speed to create a sense of depth.
   -------------------------------------------------------------------- */
function initParallax() {
  const layers = document.querySelectorAll("[data-parallax]");
  if (!layers.length) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallax) || 0.3;
      const section = layer.closest("[data-parallax-section]") || layer.parentElement;
      const offsetTop = section ? section.offsetTop : 0;
      const relativeScroll = scrollY - offsetTop;
      layer.style.transform = `translate3d(0, ${relativeScroll * speed}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  update();
}

/* --------------------------------------------------------------------
   BACK TO TOP BUTTON
   -------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("visible", window.scrollY > 500),
    { passive: true }
  );

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* --------------------------------------------------------------------
   TESTIMONIAL CAROUSEL — autoplay + manual prev/next + dot navigation
   -------------------------------------------------------------------- */
function initTestimonialCarousel() {
  const track = document.querySelector(".testimonial-track");
  if (!track) return;

  const slides = Array.from(track.children);
  const dotsWrap = document.querySelector(".carousel-dots");
  const prevBtn = document.querySelector(".carousel-arrow.prev");
  const nextBtn = document.querySelector(".carousel-arrow.next");
  let index = 0;
  let autoplayTimer = null;

  // Build dot indicators dynamically
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "carousel-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle("active", i === index));
    }
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
    restartAutoplay();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 6000);
  }

  nextBtn && nextBtn.addEventListener("click", next);
  prevBtn && prevBtn.addEventListener("click", prev);

  // Pause autoplay while the user is hovering the carousel
  const wrap = document.querySelector(".testimonial-track-wrap");
  if (wrap) {
    wrap.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
    wrap.addEventListener("mouseleave", restartAutoplay);
  }

  // Basic swipe support for touch devices
  let startX = 0;
  track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  track.addEventListener(
    "touchend",
    (e) => {
      const deltaX = e.changedTouches[0].clientX - startX;
      if (deltaX > 50) prev();
      else if (deltaX < -50) next();
    },
    { passive: true }
  );

  update();
  restartAutoplay();
}

/* --------------------------------------------------------------------
   FAQ ACCORDION
   -------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll(".accordion-item");
  if (!items.length) return;

  items.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    const panel = item.querySelector(".accordion-panel");
    if (!header || !panel) return;

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all other items (single-open accordion behaviour)
      items.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".accordion-panel").style.maxHeight = null;
        other.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        header.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Open the first FAQ item by default
  const first = items[0];
  first.classList.add("open");
  first.querySelector(".accordion-panel").style.maxHeight = first.querySelector(".accordion-panel").scrollHeight + "px";
  first.querySelector(".accordion-header").setAttribute("aria-expanded", "true");
}

/* --------------------------------------------------------------------
   IMAGE LIGHTBOX GALLERY
   -------------------------------------------------------------------- */
function initLightboxGallery() {
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.querySelector(".lightbox");
  if (!items.length || !lightbox) return;

  const lightboxImg = lightbox.querySelector("img");
  const caption = lightbox.querySelector(".lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  const images = Array.from(items).map((item) => ({
    src: item.querySelector("img").src.replace(/\/\d+\/\d+$/, "/1200/900"),
    caption: item.dataset.caption || item.querySelector("img").alt,
  }));

  let current = 0;

  function open(i) {
    current = i;
    render();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  function render() {
    lightboxImg.src = images[current].src;
    lightboxImg.alt = images[current].caption;
    caption.textContent = images[current].caption;
  }

  function next() { current = (current + 1) % images.length; render(); }
  function prev() { current = (current - 1 + images.length) % images.length; render(); }

  items.forEach((item, i) => item.addEventListener("click", () => open(i)));
  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
}

/* --------------------------------------------------------------------
   GALLERY CATEGORY FILTERS
   -------------------------------------------------------------------- */
function initGalleryFilters() {
  const filters = document.querySelectorAll(".gallery-filters [data-filter]");
  const items = document.querySelectorAll(".gallery-item");
  if (!filters.length || !items.length) return;

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      items.forEach((item) => {
        const matches = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("show", matches);
      });
    });
  });
}

/* --------------------------------------------------------------------
   MENU CATEGORY TABS
   -------------------------------------------------------------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll(".menu-tab");
  const categories = document.querySelectorAll(".menu-category");
  if (!tabs.length || !categories.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.dataset.target;
      categories.forEach((cat) => cat.classList.toggle("active", cat.id === targetId));
    });
  });
}

/* --------------------------------------------------------------------
   FORM VALIDATION — shared helpers
   -------------------------------------------------------------------- */
function showFieldError(group, message) {
  group.classList.toggle("has-error", Boolean(message));
  const errorEl = group.querySelector(".error-message");
  if (errorEl) errorEl.textContent = message || "";
}

function validateField(input) {
  const group = input.closest(".form-group");
  if (!group) return true;

  let message = "";

  if (input.hasAttribute("required") && !input.value.trim()) {
    message = "This field is required.";
  } else if (input.type === "email" && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    message = "Please enter a valid email address.";
  } else if (input.type === "tel" && input.value && !/^[\d\s()+-]{7,}$/.test(input.value)) {
    message = "Please enter a valid phone number.";
  } else if (input.hasAttribute("min") && input.value && Number(input.value) < Number(input.min)) {
    message = `Minimum value is ${input.min}.`;
  } else if (input.hasAttribute("max") && input.value && Number(input.value) > Number(input.max)) {
    message = `Maximum value is ${input.max}.`;
  } else if (input.type === "date" && input.hasAttribute("required") && input.value) {
    const chosen = new Date(input.value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen < today) message = "Please choose a date from today onward.";
  }

  showFieldError(group, message);
  return !message;
}

function attachLiveValidation(form) {
  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".form-group").classList.contains("has-error")) validateField(input);
    });
  });
}

function validateForm(form) {
  let isValid = true;
  form.querySelectorAll("input, select, textarea").forEach((input) => {
    if (!validateField(input)) isValid = false;
  });
  return isValid;
}

/* --------------------------------------------------------------------
   CONTACT FORM
   -------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  attachLiveValidation(form);
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.remove("success", "error");

    if (!validateForm(form)) {
      status.textContent = "Please fix the highlighted fields and try again.";
      status.classList.add("error");
      return;
    }

    // No backend is wired up — simulate a successful send for this static demo.
    status.textContent = "Thank you! Your message has been sent. We'll reply within one business day.";
    status.classList.add("success");
    form.reset();
  });
}

/* --------------------------------------------------------------------
   RESERVATION FORM
   -------------------------------------------------------------------- */
function initReservationForm() {
  const form = document.querySelector("#reservation-form");
  if (!form) return;

  attachLiveValidation(form);
  const status = form.querySelector(".form-status");

  // Prevent picking a date in the past
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.remove("success", "error");

    if (!validateForm(form)) {
      status.textContent = "A few details need your attention before we can confirm the table.";
      status.classList.add("error");
      return;
    }

    const name = form.querySelector("#res-name").value;
    const date = form.querySelector("#res-date").value;
    const time = form.querySelector("#res-time").value;

    status.textContent = `Thanks, ${name}! Your table request for ${date} at ${time} has been received — a confirmation email is on its way.`;
    status.classList.add("success");
    form.reset();
  });
}

/* --------------------------------------------------------------------
   FOOTER — auto-updating copyright year
   -------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.querySelector("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
