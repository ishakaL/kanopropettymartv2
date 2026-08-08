/* =========================================================================
   Kano Property Mart — app.js
   Vanilla JS, no dependencies. Handles: hero slideshow, sticky nav,
   mobile menu, scroll-reveal, service accordions, back-to-top,
   and client-side contact form validation.
   ========================================================================= */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------- */
  var yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------------
     Sticky header
     ------------------------------------------------------------------- */
  var header = document.getElementById("site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled", "bg-sand-50/95", "backdrop-blur");
    } else {
      header.classList.remove("is-scrolled", "bg-sand-50/95", "backdrop-blur");
    }
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ----------------------------------------------------------------------
     Mobile menu toggle
     ------------------------------------------------------------------- */
  var menuBtn = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      mobileMenu.classList.toggle("hidden", !isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("overflow-hidden", isOpen);
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        mobileMenu.classList.add("hidden");
        menuBtn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("overflow-hidden");
      });
    });
  }

  /* ----------------------------------------------------------------------
     Active nav link on scroll
     ------------------------------------------------------------------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-link");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle(
                "is-active",
                link.getAttribute("href") === "#" + entry.target.id
              );
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ----------------------------------------------------------------------
     Hero slideshow — cross-fade with alternating directional entrance
     ------------------------------------------------------------------- */
  var hero = document.getElementById("hero-slideshow");
  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide")
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]")
    );
    var captionEl = document.getElementById("hero-caption");
    var counterEl = document.getElementById("hero-counter");
    var current = 0;
    var timer = null;
    var AUTOPLAY_MS = 6000;

    function directionClasses() {
      return ["dir-left", "dir-right", "dir-up", "dir-down"];
    }

    function goTo(index) {
      var next = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var isActive = i === next;
        slide.classList.toggle("is-active", isActive);
        directionClasses().forEach(function (c) {
          slide.classList.remove(c);
        });
        if (isActive) {
          slide.classList.add("dir-" + (slide.dataset.direction || "left"));
        }
      });
      dots.forEach(function (dot, i) {
        var active = i === next;
        dot.setAttribute("aria-current", active ? "true" : "false");
        dot.classList.toggle("bg-gold-500", active);
        dot.classList.toggle("bg-white/40", !active);
      });
      if (captionEl) captionEl.textContent = slides[next].dataset.caption || "";
      if (counterEl) {
        counterEl.textContent =
          String(next + 1).padStart(2, "0") +
          " / " +
          String(slides.length).padStart(2, "0");
      }
      current = next;
    }

    function play() {
      if (prefersReducedMotion) return;
      stop();
      timer = window.setInterval(function () {
        goTo(current + 1);
      }, AUTOPLAY_MS);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
        play();
      });
    });

    var prevBtn = document.getElementById("hero-prev");
    var nextBtn = document.getElementById("hero-next");
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); play(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); play(); });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", play);

    hero.setAttribute("tabindex", "0");
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { goTo(current + 1); play(); }
      if (e.key === "ArrowLeft") { goTo(current - 1); play(); }
    });

    /* touch swipe */
    var touchStartX = null;
    hero.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        goTo(current + (dx < 0 ? 1 : -1));
        play();
      }
      touchStartX = null;
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else play();
    });

    goTo(0);
    play();
  }

  /* ----------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ----------------------------------------------------------------------
     Service accordion cards
     ------------------------------------------------------------------- */
  var serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach(function (card) {
    var trigger = card.querySelector("[data-service-trigger]");
    if (!trigger) return;
    trigger.addEventListener("click", function () {
      var isOpen = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ----------------------------------------------------------------------
     Back to top
     ------------------------------------------------------------------- */
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      function () {
        backToTop.classList.toggle("is-visible", window.scrollY > 600);
      },
      { passive: true }
    );
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ----------------------------------------------------------------------
     Contact form — client-side only (no backend wired up).
     Validates required fields + email pattern, then shows a success
     message. Replace this handler with a real submission (fetch/fetch
     to your backend, Formspree, etc.) when one is available.
     ------------------------------------------------------------------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var fields = form.querySelectorAll(".form-field");

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        field.setAttribute("data-touched", "true");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      fields.forEach(function (field) {
        field.setAttribute("data-touched", "true");
        if (!field.checkValidity()) valid = false;
      });

      if (!valid) {
        if (status) {
          status.textContent =
            "Please fill in all required fields with a valid email address.";
          status.classList.remove("hidden", "text-emerald-700");
          status.classList.add("text-red-600");
        }
        return;
      }

      if (status) {
        status.textContent =
          "Thank you — your message has been received. Our team will respond shortly.";
        status.classList.remove("hidden", "text-red-600");
        status.classList.add("text-emerald-700");
      }
      form.reset();
      fields.forEach(function (field) {
        field.removeAttribute("data-touched");
      });
    });
  }
})();