/* ==========================================================================
   SHAZAY — main.js
   Lightweight, dependency-free interactions:
   header state, mobile nav, scroll reveals, subtle parallax, newsletter form
   ========================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- boot ---- */
  window.addEventListener('load', function () {
    document.body.classList.add('is-ready');
  });
  // fallback in case load event already fired / is slow
  setTimeout(function () { document.body.classList.add('is-ready'); }, 1800);

  /* ---- header: scrolled state ---- */
  var header = document.getElementById('siteHeader');
  var lastY = window.scrollY;

  function updateHeader() {
    if (!header) return;
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    lastY = y;
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---- mobile nav toggle ---- */
  var burger = document.getElementById('burgerBtn');
  var nav = document.getElementById('siteNav');

  if (burger && nav && header) {
    function closeMenu() {
      header.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // make sure the menu always starts closed
    closeMenu();

    burger.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Escape closes the menu
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // widening past the mobile breakpoint must never leave the panel open
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });
  }

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- subtle parallax on hero + divider bands ---- */
  var parallaxEls = document.querySelectorAll('[data-parallax] img, [data-parallax]');
  if (!reducedMotion && parallaxEls.length) {
    var targets = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var vh = window.innerHeight;
        targets.forEach(function (wrap) {
          var img = wrap.tagName === 'IMG' ? wrap : wrap.querySelector('img');
          if (!img) return;
          var rect = wrap.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vh) return;
          var progress = (rect.top) / vh; // -1..1 roughly
          var shift = Math.max(-24, Math.min(24, progress * 22));
          img.style.transform = 'translateY(' + shift.toFixed(1) + 'px) scale(1.06)';
        });
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- smooth-scroll offset correction for fixed header ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = 84;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---- product galleries (arrows, dots, swipe) ---- */
  document.querySelectorAll('[data-gallery]').forEach(function (gal) {
    var slides = gal.querySelectorAll('.gallery__track img');
    var prev = gal.querySelector('.gallery__nav--prev');
    var next = gal.querySelector('.gallery__nav--next');
    var dotWrap = gal.querySelector('.gallery__dots');

    // a single photo needs no controls
    if (slides.length < 2) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      if (dotWrap) dotWrap.style.display = 'none';
      return;
    }

    var index = 0;
    var dots = [];

    if (dotWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Фото ' + (i + 1));
        dot.addEventListener('click', function () { show(i); });
        dotWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (img, n) {
        img.classList.toggle('is-active', n === index);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle('is-active', n === index);
      });
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });

    // keyboard support once a control inside the gallery has focus
    gal.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(index - 1); }
      else if (e.key === 'ArrowRight') { show(index + 1); }
    });

    // horizontal swipe on touch screens
    var startX = 0, startY = 0, tracking = false;
    gal.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    gal.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var touch = e.changedTouches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      // ignore mostly-vertical moves so page scrolling still works
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        show(dx < 0 ? index + 1 : index - 1);
      }
    }, { passive: true });
  });

  /* ---- newsletter form (static demo — no backend) ---- */
  var form = document.getElementById('subscribeForm');
  var note = document.getElementById('subscribeNote');

  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        note.textContent = 'Дякуємо! Перевір свою поштову скриньку, щоб підтвердити підписку.';
        form.reset();
      }
    });
  }
})();
